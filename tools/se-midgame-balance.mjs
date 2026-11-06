/**
 * Headless runner for tests/se-midgame-audit.html.
 * Prints the JSON measurement. Does not change the game.
 *
 *   node tools/se-midgame-balance.mjs
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 8774);
const origin = 'http://127.0.0.1:' + port;
const chrome = process.env.CHROME || '/usr/bin/google-chrome-stable';

async function loadPuppeteer() {
  const fallback = process.env.PUPPETEER_CORE || '/tmp/pt-audit/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
  try { return await import('puppeteer-core'); }
  catch (e) { return import(pathToFileURL(fallback).href); }
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
async function waitServer() {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(origin + '/version.json'); if (r.ok) return; } catch (e) {}
    await sleep(100);
  }
  throw new Error('http server did not start');
}

const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
let browser;
try {
  await waitServer();
  const loaded = await loadPuppeteer();
  const puppeteer = loaded.default || loaded;
  browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--use-gl=angle', '--use-angle=swiftshader']
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(240000);
  const errors = [];
  page.on('pageerror', err => errors.push(String(err && err.stack || err).slice(0, 800)));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text().slice(0, 400)); });
  await page.goto(origin + '/tests/se-midgame-audit.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => {
    const t = document.title || '';
    return t.startsWith('PASS') || t.startsWith('FAIL');
  }, { timeout: 220000 });
  const report = await page.evaluate(() => ({
    title: document.title,
    text: (document.getElementById('out') || {}).textContent || ''
  }));
  if (report.title.startsWith('FAIL')) {
    console.error(report.text);
    if (errors.length) console.error(errors.join('\n'));
    process.exitCode = 1;
  } else {
    const out = process.argv[2] || '/tmp/se-midgame-audit.json';
    const fs = await import('node:fs');
    fs.writeFileSync(out, report.text);
    const data = JSON.parse(report.text);
    console.log('wrote ' + out);
    console.log('version ' + data.version + ' checks ' + data.checks.filter(c => c.ok).length + '/' + data.checks.length);
    console.log('d12 clear level ' + data.d12Level + ' fit feed a/b ' + data.fit.feed.a + '/' + data.fit.feed.b + ' dmg ' + data.fit.dmg.a + '/' + data.fit.dmg.b);
    const bad = data.checks.filter(c => !c.ok);
    if (bad.length) {
      bad.forEach(c => console.log('CHECK FAIL ' + c.name + ' ' + c.extra));
      process.exitCode = 1;
    }
    if (errors.length) console.log('page notes ' + errors[0]);
  }
} catch (e) {
  console.error(e && e.stack || e);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  server.kill('SIGTERM');
}
