// HUD scaling audit harness. Does not modify the game.
// Serves 743c826 (live, pre-PR #40) and def57ea (PR #40) and measures both.
//
//   NODE_PATH=/tmp/hud-deps/node_modules node tools/audit/hud-scale-audit.mjs
//
// Writes tools/audit/out/hud/*.png and measurements.json.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
async function loadPuppeteer() {
  const candidates = [
    'puppeteer-core',
    '/tmp/hud-deps/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js'
  ];
  for (const spec of candidates) {
    try { return (await import(spec)).default; } catch (e) { /* try the next */ }
  }
  throw new Error('puppeteer-core is not installed (npm install puppeteer-core, or /tmp/hud-deps)');
}

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const OUT = path.join(ROOT, 'tools/audit/out/hud');
const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
const PORT = Number(process.env.HUD_AUDIT_PORT || 8765);

const CASES = [
  { id: '1280x720', w: 1280, h: 720, dpr: 1, touch: false },
  { id: '1920x1080', w: 1920, h: 1080, dpr: 1, touch: false },
  { id: '2560x1440', w: 2560, h: 1440, dpr: 1, touch: false },
  { id: '3840x2160', w: 3840, h: 2160, dpr: 1, touch: false },
  { id: 'win125-2048x1152', w: 2048, h: 1152, dpr: 1.25, touch: false, note: '2560x1440 physical at 125% Windows' },
  { id: 'win150-1707x960', w: 1707, h: 960, dpr: 1.5, touch: false, note: '2560x1440 physical at 150% Windows' },
  { id: 'phone-412x915', w: 412, h: 915, dpr: 3, touch: true },
  { id: 'phone-390x844', w: 390, h: 844, dpr: 3, touch: true },
  { id: 'tablet-768x1024', w: 768, h: 1024, dpr: 2, touch: true }
];

function mime(p) {
  const e = path.extname(p).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
    '.css': 'text/css', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2',
    '.webmanifest': 'application/manifest+json', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav'
  })[e] || 'application/octet-stream';
}

function startServer(beforeHtml) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (url.pathname === '/audit-before.html') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(beforeHtml);
      return;
    }
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/') rel = '/index.html';
    const file = path.normalize(path.join(ROOT, rel));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('missing'); return;
    }
    res.writeHead(200, { 'content-type': mime(file), 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

const MEASURE = (touch, zoomFar) => {
  const g = window.game;
  const dpr = window.devicePixelRatio || 1;
  const round = (n) => Math.round(n * 100) / 100;
  const anyway = document.getElementById('rAnyway');
  if (touch && anyway) anyway.click();
  g.settings.lighting = 'low';
  g.settings.shake = 'off';
  window.__zoomDesk = !touch;
  g.touchMode = !!touch;
  g.newGame();
  const p = g.player;
  if (p) {
    p.torchT = 240; p.torches = 8;
    if (p.st) p.hp = p.st.maxHp;
  }
  if (g.enemies && g.enemies.splice) g.enemies.splice(0, g.enemies.length);
  const it = g.makeItem(4, 1);
  g.ground.push({ x: p.x + 14, y: p.y - 6, bob: 0, item: it, lock: false });
  g.ground.push({ x: p.x - 16, y: p.y + 4, bob: 0, pot: 'hp', lock: false });
  if (!touch) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt', bubbles: true }));
  } else {
    g.touchMode = true;
  }
  for (let i = 0; i < 24; i++) g.step(0.4, { x: 0, y: 0 });
  const steps = typeof g.zoomSteps === 'function' ? g.zoomSteps() : (g.zoomSteps || []);
  if (zoomFar && steps.length) g.setZoom(steps[0]);
  else if (g.setZoom) g.setZoom(1);
  if (typeof window.syncDesk === 'function') window.syncDesk();
  return { itemName: it && it.name, rarity: it && it.rarity, zoomSteps: steps };
};

const READ = () => {
  const g = window.game;
  const dpr = window.devicePixelRatio || 1;
  const round = (n) => Math.round(n * 100) / 100;
  const cv = document.getElementById('game');
  const text = document.getElementById('textLayer');
  const hud = document.getElementById('hudLayer');
  const cssW = parseFloat(cv.style.width) || cv.clientWidth;
  const cssH = parseFloat(cv.style.height) || cv.clientHeight;
  const vw = g.vw, vh = g.vh;
  const hudPresent = cssW * dpr / (vw || 1);
  const worldPresent = cssW * dpr / (cv.width || 1);
  const zoom = typeof g.zoom === 'number' ? g.zoom : 1;
  const hudShown = !!(hud && hud.style.display !== 'none' && hud.style.display !== '');
  const box = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return { hidden: true, sel };
    const r = el.getBoundingClientRect();
    const font = parseFloat(st.fontSize) || 0;
    return {
      sel,
      css: [round(r.width), round(r.height)],
      dev: [round(r.width * dpr), round(r.height * dpr)],
      pctH: round(r.height / innerHeight * 100),
      pctW: round(r.width / innerWidth * 100),
      fontCss: round(font),
      fontDev: round(font * dpr),
      top: round(r.top),
      touch44: r.width >= 44 && r.height >= 44
    };
  };
  const ink = (canvas, x0, y0, x1, y1) => {
    if (!canvas) return null;
    const c = canvas.getContext('2d', { willReadFrequently: true });
    const W = canvas.width, H = canvas.height;
    x0 = Math.max(0, x0 | 0); y0 = Math.max(0, y0 | 0);
    x1 = Math.min(W, x1 | 0); y1 = Math.min(H, y1 | 0);
    if (x1 - x0 < 2 || y1 - y0 < 2) return null;
    let data;
    try { data = c.getImageData(x0, y0, x1 - x0, y1 - y0).data; } catch (e) { return { err: String(e) }; }
    const rw = x1 - x0;
    let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, n = 0;
    for (let y = 0; y < y1 - y0; y++) for (let x = 0; x < rw; x++) {
      if (data[(y * rw + x) * 4 + 3] > 24) {
        n++;
        if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y;
      }
    }
    if (!n) return { n: 0 };
    return { n, w: maxX - minX + 1, h: maxY - minY + 1, x: x0 + minX, y: y0 + minY };
  };
  const root = getComputedStyle(document.documentElement);
  const desk = document.getElementById('deskHud');
  const cvRect = cv.getBoundingClientRect();
  const survCss = cvRect.top + (vh - 41) * (cvRect.height / (vh || 1));
  const panelCss = cvRect.top + (vh - 30) * (cvRect.height / (vh || 1));
  const logical = (px) => ({
    logical: px,
    dev: round(px * hudPresent),
    pctH: round(px * hudPresent / (innerHeight * dpr) * 100)
  });
  const labelDev = hudShown ? round(6 * worldPresent) : round(6 * hudPresent * (zoom || 1));
  // Pre-PR40 always draws labels inside ctx.scale(ZOOM) on a VW-wide canvas, so the face is 6*SCALE*ZOOM.
  // PR40 draws labels on the world backing, so the face is 6*worldPix. hudShown is the PR40 signal.
  const topInk = text ? ink(text, 0, 0, Math.round(cssW * dpr * 0.45), Math.round(70 * dpr)) : null;
  const midInk = text ? ink(text, Math.round(cssW * dpr * 0.2), Math.round(cssH * dpr * 0.25), Math.round(cssW * dpr * 0.8), Math.round(cssH * dpr * 0.75)) : null;
  return {
    dpr, inner: [innerWidth, innerHeight],
    vw, vh, zoom,
    worldPix: typeof g.worldPix === 'function' ? g.worldPix() : null,
    view: typeof g.viewWorldSize === 'function' ? g.viewWorldSize() : null,
    backing: [cv.width, cv.height],
    css: [round(cssW), round(cssH)],
    textBacking: text ? [text.width, text.height] : null,
    hudBacking: hud ? [hud.width, hud.height] : null,
    hudDisplay: hud ? hud.style.display : null,
    hudShown,
    scaleGuess: Math.max(1, Math.floor(Math.min(innerWidth, innerHeight) * dpr / 170)),
    hudPresent: round(hudPresent),
    worldPresent: round(worldPresent),
    hudFontDev: round(6 * hudPresent),
    labelFontDev: labelDev,
    labelPctH: round(labelDev / (innerHeight * dpr) * 100),
    hudFontPctH: round(6 * hudPresent / (innerHeight * dpr) * 100),
    survivalBar: logical(5),
    survivalTrackW: logical(16),
    d2Panel: logical(30),
    orbDiameter: logical(34),
    skillIcon: logical(8),
    iconBox: logical(17),
    labelPlate: { logical: 7, dev: round(7 * (hudShown ? worldPresent : hudPresent * zoom)), pctH: round(7 * (hudShown ? worldPresent : hudPresent * zoom) / (innerHeight * dpr) * 100) },
    survCssTop: round(survCss),
    panelCssTop: round(panelCss),
    cssVarHud: root.getPropertyValue('--hud').trim(),
    cssVarUi: root.getPropertyValue('--ui').trim(),
    deskBand: box('#deskHud'),
    deskSlot: box('#deskHud .dh-slot'),
    deskGlobe: box('#deskHud .dh-globe'),
    deskGlobeNum: box('#deskHud .dh-globe b'),
    deskWell: box('#deskHud .dh-well'),
    deskKey: box('#deskHud .key'),
    atk: box('#bAtk'),
    roll: box('#bRoll'),
    hp: box('#bHP'),
    inv: box('#bInv'),
    pause: box('#tPause'),
    map: box('#tMap'),
    gl: box('#glHud'),
    topInk, midInk,
    state: g.state,
    frameErr: g.frameErr || null,
    safeProbe: (() => {
      const el = document.getElementById('safeProbe');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { l: parseFloat(cs.paddingLeft) || 0, r: parseFloat(cs.paddingRight) || 0, t: parseFloat(cs.paddingTop) || 0, b: parseFloat(cs.paddingBottom) || 0 };
    })()
  };
};

const SATCHEL = () => {
  const g = window.game;
  const dpr = window.devicePixelRatio || 1;
  const round = (n) => Math.round(n * 100) / 100;
  if (typeof g.openInv === 'function') g.openInv();
  const tabBtn = document.querySelector('#satTabs .sat-tab[data-tab="character"]');
  if (tabBtn) tabBtn.click();
  const host = document.getElementById('satchel');
  const lbl = Array.from(document.querySelectorAll('#satchel .slot .lbl')).find(el => el.textContent && el.textContent.trim());
  const tab = document.querySelector('#satchel .sat-tab');
  const close = document.getElementById('satClose');
  const gtip = document.getElementById('gtip');
  const hold = document.getElementById('holdStats');
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    return {
      css: [round(r.width), round(r.height)],
      dev: [round(r.width * dpr), round(r.height * dpr)],
      pctH: round(r.height / innerHeight * 100),
      fontSpecified: round(parseFloat(st.fontSize) || 0),
      touch44: r.width >= 43.5 && r.height >= 43.5
    };
  };
  return {
    scale: host ? host.dataset.scale : null,
    mode: host ? host.dataset.mode : null,
    tabs: host ? host.dataset.tabs : null,
    panel: host ? host.dataset.panelw : null,
    host: rect(host),
    slotLabel: rect(lbl),
    slotLabelText: lbl ? lbl.textContent : null,
    tab: rect(tab),
    close: rect(close),
    gtipFont: gtip ? round(parseFloat(getComputedStyle(gtip).fontSize) || 0) : null,
    holdHidden: hold ? hold.classList.contains('hidden') : null
  };
};

function proposed(physH) {
  const design = 56, frac = 0.12, cap = 6;
  const out = {};
  for (const pct of [75, 100, 125, 150]) {
    let s = Math.round(physH * frac * (pct / 100) / design);
    if (s < 1) s = 1;
    if (s > cap) s = cap;
    out[String(pct)] = s;
  }
  out.auto = out['100'];
  return out;
}

async function shot(page, file, clip) {
  await page.screenshot({ path: file, type: 'png', clip: clip || undefined });
}

async function runCase(browser, build, spec, zoomFar) {
  const page = await browser.newPage();
  page.setDefaultTimeout(45000);
  await page.evaluateOnNewDocument((touch) => {
    window.__zoomDesk = !touch;
    try {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    } catch (e) {}
  }, spec.touch);
  await page.setViewport({
    width: spec.w, height: spec.h, deviceScaleFactor: spec.dpr,
    isMobile: !!spec.touch, hasTouch: !!spec.touch
  });
  const url = 'http://127.0.0.1:' + PORT + (build === 'before' ? '/audit-before.html' : '/index.html');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => window.game && typeof window.game.newGame === 'function', { timeout: 30000 });
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  const seeded = await page.evaluate(MEASURE, spec.touch, !!zoomFar);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const measured = await page.evaluate(READ);
  const tag = build + '-' + spec.id + (zoomFar ? '-far' : '');
  const full = path.join(OUT, tag + '.png');
  const bandH = Math.max(220, Math.round(spec.h * 0.28));
  const clip = { x: 0, y: Math.max(0, spec.h - bandH), width: spec.w, height: Math.min(bandH, spec.h) };
  const bottom = path.join(OUT, tag + '-bottom.png');
  await shot(page, full, null);
  await shot(page, bottom, clip);
  let satchel = null;
  let satchelShot = null;
  if (!zoomFar) {
    satchel = await page.evaluate(SATCHEL);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    if (spec.id === '2560x1440' || spec.id === 'phone-412x915') {
      satchelShot = tag + '-satchel.png';
      await shot(page, path.join(OUT, satchelShot), null);
    }
  }
  let safe = null;
  if (!zoomFar && spec.id === 'phone-390x844') {
    await page.evaluate(() => { if (window.game.closeInv) window.game.closeInv(); });
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.evaluate(() => {
      window.__safeInsets = { l: 0, r: 0, t: 47, b: 34 };
      window.dispatchEvent(new Event('resize'));
    });
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const after = await page.evaluate(READ);
    safe = {
      insetCss: { l: 0, r: 0, t: 47, b: 34 },
      topInkBeforeY: measured.topInk && measured.topInk.y,
      topInkAfterY: after.topInk && after.topInk.y,
      pauseBefore: measured.pause,
      pauseAfter: after.pause,
      atkBefore: measured.atk,
      atkAfter: after.atk
    };
    await shot(page, path.join(OUT, tag + '-safe.png'), null);
  }
  await page.close();
  const physH = spec.h * spec.dpr;
  const physW = spec.w * spec.dpr;
  return {
    build, id: spec.id, zoomFar: !!zoomFar, note: spec.note || '',
    css: [spec.w, spec.h], dpr: spec.dpr, physical: [round1(physW), round1(physH)], touch: !!spec.touch,
    seeded, measured, satchel, safe,
    files: { full: path.basename(full), bottom: path.basename(bottom), satchel: satchelShot },
    proposedHud: proposed(physH)
  };
}

function round1(n) { return Math.round(n * 100) / 100; }

async function contactSheet(browser, rows) {
  const html = `<!doctype html><meta charset="utf-8"><title>HUD contact</title>
<style>
  body{margin:0;background:#111;color:#eee;font:14px/1.3 ui-sans-serif,sans-serif}
  h1{font-size:18px;margin:12px 16px}
  .row{display:flex;gap:8px;padding:8px 16px;align-items:flex-start}
  figure{margin:0;width:520px}
  figcaption{font-size:12px;color:#ccc;margin-bottom:4px}
  img{width:520px;height:auto;background:#000;display:block}
</style>
<h1>Lichlight HUD bottom band — 743c826 (before PR #40) vs def57ea (after)</h1>
${rows.map(r => `<div class="row">
  <figure><figcaption>${r.capL}</figcaption><img src="${r.left}"></figure>
  <figure><figcaption>${r.capR}</figcaption><img src="${r.right}"></figure>
</div>`).join('\n')}
`;
  const file = path.join(OUT, 'contact.html');
  fs.writeFileSync(file, html);
  const page = await browser.newPage();
  await page.setViewport({ width: 1120, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:' + PORT + '/tools/audit/out/hud/contact.html', { waitUntil: 'networkidle0', timeout: 60000 });
  const bodyH = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 1120, height: Math.min(bodyH + 20, 14000), deviceScaleFactor: 1 });
  await page.screenshot({ path: path.join(OUT, 'contact-sheet.png'), type: 'png', fullPage: true });
  await page.close();
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let before = execSync('git show 743c826:index.html', { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 }).toString();
  if (!before.includes('<base ')) before = before.replace('<head>', '<head><base href="/">');
  const server = await startServer(before);
  const puppeteer = await loadPuppeteer();
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars']
  });
  const results = [];
  try {
    const only = process.env.HUD_ONLY || '';
    for (const build of ['before', 'after']) {
      for (const spec of CASES) {
        if (only && spec.id !== only) continue;
        process.stdout.write(build + ' ' + spec.id + '\n');
        results.push(await runCase(browser, build, spec, false));
      }
      if (!only || only === '2560x1440') {
        const desk = CASES.find(c => c.id === '2560x1440');
        process.stdout.write(build + ' 2560 far\n');
        results.push(await runCase(browser, build, desk, true));
      }
    }
    const rows = [];
    const ids = [...CASES.map(c => c.id), '2560x1440-far'];
    for (const id of ids) {
      const key = id.endsWith('-far') ? '2560x1440' : id;
      const far = id.endsWith('-far');
      const b = results.find(r => r.build === 'before' && r.id === key && r.zoomFar === far);
      const a = results.find(r => r.build === 'after' && r.id === key && r.zoomFar === far);
      if (!b || !a) continue;
      const cap = (r) => {
        const m = r.measured;
        const slot = m.deskSlot && !m.deskSlot.hidden ? m.deskSlot : null;
        const atk = m.atk && !m.atk.hidden ? m.atk : null;
        const ctrl = slot || atk;
        return `${r.build} ${r.id}${r.zoomFar ? ' zoom-far' : ''}  css ${r.css.join('x')} dpr ${r.dpr}  SCALE~${m.scaleGuess} hudFont ${m.hudFontDev}px  label ${m.labelFontDev}px  ctrl ${ctrl ? ctrl.dev.join('x') + ' dev' : 'hidden'}`;
      };
      rows.push({ capL: cap(b), capR: cap(a), left: b.files.bottom, right: a.files.bottom });
    }
    await contactSheet(browser, rows);
  } finally {
    await browser.close();
    server.close();
  }
  fs.writeFileSync(path.join(OUT, 'measurements.json'), JSON.stringify(results, null, 2));
  console.log('wrote', results.length, 'rows');
}

main().catch(err => { console.error(err); process.exit(1); });
