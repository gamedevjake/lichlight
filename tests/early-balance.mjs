/**
 * Run the early-balance harness (and, if given, other tests/*.html files).
 *
 *   node tests/early-balance.mjs
 *   node tests/early-balance.mjs tests/stage9-bosses.html tests/v0717.html
 *
 * Prints each PASS/FAIL line. Exits 1 when any file has a FAIL line.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 8773);
const origin = 'http://127.0.0.1:' + port;
const chrome = process.env.CHROME || '/usr/local/bin/google-chrome';
const files = process.argv.slice(2);
const pages = files.length ? files : ['tests/early-balance.html'];

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
try {
  await waitServer();
  const loaded = await loadPuppeteer();
  const puppeteer = loaded.default || loaded;
  browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  for (const rel of pages) {
    const page = await browser.newPage();
    page.setDefaultTimeout(180000);
    const errors = [];
    page.on('pageerror', err => errors.push(String(err && err.message || err).slice(0, 300)));
    const url = origin + '/' + rel.replace(/^\//, '');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => {
      const t = document.title || '';
      return t.startsWith('PASS') || t.startsWith('FAIL');
    }, { timeout: 150000 });
    const report = await page.evaluate(() => ({
      title: document.title,
      text: (document.getElementById('out') || {}).textContent || ''
    }));
    const fails = report.text.split('\n').filter(l => l.startsWith('FAIL'));
    console.log('\n== ' + rel + ' == ' + report.title);
    if (fails.length) {
      failed += fails.length;
      fails.forEach(l => console.log(l));
    } else console.log(report.text.split('\n').length + ' lines, no FAIL');
    if (errors.length) console.log('pageerror ' + errors[0]);
    await page.close();
  }
} catch (e) {
  console.error(e && e.stack || e);
  failed += 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  server.kill('SIGTERM');
}
if (failed) process.exit(1);
