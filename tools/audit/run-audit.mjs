/**
 * Run the Super Elite and loot-economy measurements.
 *
 *   node tools/audit/run-audit.mjs
 *   node tools/audit/run-audit.mjs se
 *   node tools/audit/run-audit.mjs loot
 *
 * Writes tools/audit/out/se-difficulty.json and tools/audit/out/loot-economy.json.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const port = Number(process.env.PORT || 8779);
const origin = 'http://127.0.0.1:' + port;
const chrome = process.env.CHROME || '/usr/local/bin/google-chrome';
const which = process.argv[2] || 'all';
const pages = [];
if (which === 'all' || which === 'se') pages.push(['tools/audit/se-difficulty.html', 'se-difficulty.json']);
if (which === 'all' || which === 'loot') pages.push(['tools/audit/loot-economy.html', 'loot-economy.json']);

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
let failed = 0;
mkdirSync(path.join(root, 'tools/audit/out'), { recursive: true });
try {
  await waitServer();
  const loaded = await loadPuppeteer();
  const puppeteer = loaded.default || loaded;
  browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  for (const [rel, file] of pages) {
    const page = await browser.newPage();
    page.setDefaultTimeout(600000);
    const errors = [];
    page.on('pageerror', err => errors.push(String(err && err.message || err).slice(0, 500)));
    page.on('console', msg => {
      const t = msg.text();
      if (t && t.length < 240) console.log('[' + rel + ']', t);
    });
    const url = origin + '/' + rel;
    console.log('open', url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => {
      const t = document.title || '';
      return t.startsWith('PASS') || t.startsWith('FAIL');
    }, { timeout: 540000 });
    const report = await page.evaluate(() => ({
      title: document.title,
      text: (document.getElementById('out') || {}).textContent || ''
    }));
    const dest = path.join(root, 'tools/audit/out', file);
    writeFileSync(dest, report.text);
    console.log(rel, report.title, 'bytes', report.text.length, '->', dest);
    if (report.title.startsWith('FAIL') || errors.length) {
      failed++;
      console.log((errors[0] || report.text).slice(0, 800));
    }
    await page.close();
  }
} catch (e) {
  console.error(e && e.stack || e);
  failed++;
} finally {
  if (browser) await browser.close().catch(() => {});
  server.kill('SIGTERM');
}
if (failed) process.exit(1);
