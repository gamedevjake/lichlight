import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const port = 8765;

const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, url === '/' ? 'index.html' : url);
  if (!file.startsWith(root)) { res.writeHead(403); res.end('no'); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('missing'); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

await new Promise(r => server.listen(port, '127.0.0.1', r));

const chrome = spawn('google-chrome', [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
  '--remote-debugging-port=9222', '--user-data-dir=/tmp/chrome-loot-audit',
  'about:blank'
], { stdio: 'ignore' });

async function getJSON(url) {
  const res = await fetch(url);
  return res.json();
}

let wsUrl = '';
for (let i = 0; i < 50; i++) {
  try {
    const list = await getJSON('http://127.0.0.1:9222/json/version');
    wsUrl = list.webSocketDebuggerUrl;
    break;
  } catch (_) {
    await new Promise(r => setTimeout(r, 200));
  }
}
if (!wsUrl) throw new Error('no chrome');

const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0;
const pending = new Map();
function send(method, params) {
  const msgId = ++id;
  ws.send(JSON.stringify({ id: msgId, method, params }));
  return new Promise((res, rej) => pending.set(msgId, { res, rej }));
}
ws.onmessage = ev => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) p.rej(new Error(JSON.stringify(msg.error)));
    else p.res(msg.result);
  }
};

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
function sessionSend(method, params) {
  const msgId = ++id;
  ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
  return new Promise((res, rej) => pending.set(msgId, { res, rej }));
}
await sessionSend('Page.enable', {});
await sessionSend('Runtime.enable', {});
await sessionSend('Page.navigate', { url: `http://127.0.0.1:${port}/tools/audit/loot_mc.html` });

let text = '';
const deadline = Date.now() + 180000;
while (Date.now() < deadline) {
  const ev = await sessionSend('Runtime.evaluate', {
    expression: 'document.title + "\\n" + document.getElementById("out").textContent',
    returnByValue: true
  });
  const v = ev.result && ev.result.value || '';
  if (v.startsWith('LOOT_MC_DONE')) { text = v.slice(v.indexOf('\n') + 1); break; }
  if (v.includes('"error"')) { text = v.slice(v.indexOf('\n') + 1); break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!text) throw new Error('timeout');
const outPath = path.join(__dirname, 'loot_mc_result.json');
fs.writeFileSync(outPath, text);
console.log('wrote', outPath, 'bytes', text.length);
ws.close();
chrome.kill();
server.close();
process.exit(0);
