/**
 * Run the Super Elite ranged-retaliation design sim.
 *   node tools/audit/run-se-ranged.mjs
 * Prints the harness JSON. Does not change the game.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const port = Number(process.env.PORT || 8788);
const origin = 'http://127.0.0.1:' + port;
const chrome = process.env.CHROME || '/usr/local/bin/google-chrome';

async function loadPuppeteer() {
  const fallback = process.env.PUPPETEER_CORE || '/tmp/pt-audit/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
  try { return await import('puppeteer-core'); }
  catch (e) { return import(pathToFileURL(fallback).href); }
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
let browser;
try {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(origin + '/version.json'); if (r.ok) break; } catch (e) {}
    await sleep(100);
    if (i === 49) throw new Error('http server did not start');
  }
  const loaded = await loadPuppeteer();
  const puppeteer = loaded.default || loaded;
  browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(180000);
  const errors = [];
  page.on('pageerror', err => errors.push(String(err && err.message || err).slice(0, 500)));
  await page.goto(origin + '/tools/audit/se-ranged-design.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => {
    const t = document.title || '';
    return t.startsWith('PASS') || t.startsWith('FAIL');
  }, { timeout: 150000 });
  const report = await page.evaluate(() => ({
    title: document.title,
    text: (document.getElementById('out') || {}).textContent || ''
  }));
  if (errors.length) console.error('pageerror ' + errors[0]);
  process.stdout.write(report.text.trim() + '\n');
  if (!report.title.startsWith('PASS')) process.exitCode = 1;
} catch (e) {
  console.error(e && e.stack || e);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  server.kill('SIGTERM');
}
