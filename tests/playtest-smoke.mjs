/**
 * Headless smoke for the Stage 9 combat playtest.
 *
 *   NODE_PATH=/tmp/pt-runner/node_modules node tests/playtest-smoke.mjs
 *
 * Requires puppeteer-core and Google Chrome. Serves this repo itself.
 * Also runs tests/playtest-guard.html and tests/stage1–stage9 harnesses.
 */
import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

async function loadPuppeteer() {
  try { return await import('puppeteer-core'); }
  catch (e) {}
  const fallback = process.env.PUPPETEER_CORE || '/tmp/pt-runner/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
  return import(pathToFileURL(fallback).href);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 8766);
const origin = 'http://127.0.0.1:' + port;
const chrome = process.env.CHROME || '/usr/bin/google-chrome';
const lines = [];
let failed = 0;

function check(name, cond, extra) {
  const row = (cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' :: ' + String(extra).slice(0, 500) : '');
  lines.push(row);
  if (!cond) failed++;
  console.log(row);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(origin + '/version.json');
      if (r.ok) return;
    } catch (e) {}
    await sleep(100);
  }
  throw new Error('http server did not start');
}

function assertBaseline() {
  const tracked = execSync('git diff --name-only a492023', { cwd: root }).toString();
  const untracked = execSync('git ls-files --others --exclude-standard', { cwd: root }).toString();
  const diff = tracked + untracked;
  const names = diff.split('\n').map(s => s.trim()).filter(Boolean);
  const allow = new Set(['playtest.html', 'tests/playtest-guard.html', 'tests/playtest-smoke.mjs']);
  const extra = names.filter(n => !allow.has(n));
  check('baseline files only', extra.length === 0, extra.join(', ') || names.join(', '));
  const idx = fs.readFileSync(path.join(root, 'index.html'));
  const base = execSync('git show a492023:index.html', { cwd: root, maxBuffer: 8 * 1024 * 1024 });
  check('index.html matches a492023', idx.equals(base), 'bytes ' + idx.length);
  const ver = fs.readFileSync(path.join(root, 'version.json'));
  const verBase = execSync('git show a492023:version.json', { cwd: root });
  check('version.json matches a492023', ver.equals(verBase), ver.toString().trim());
}

async function runHarness(browser, rel, timeout) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(String(err).slice(0, 300)));
  try {
    await page.goto(origin + '/' + rel, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => /^PASS|^FAIL/.test(document.title), { timeout: timeout || 180000 });
    const title = await page.title();
    const body = await page.$eval('#out', el => el.textContent).catch(() => '');
    const ok = title.startsWith('PASS');
    const fails = body.split('\n').filter(l => l.startsWith('FAIL')).slice(0, 8).join(' | ');
    check(rel, ok, title + (fails ? ' ' + fails : '') + (errors.length ? ' js ' + errors[0] : ''));
  } catch (e) {
    const title = await page.title().catch(() => '');
    const body = await page.$eval('#out', el => el.textContent).catch(() => '');
    check(rel, false, title + ' ' + String(e && e.message || e) + ' ' + body.slice(0, 400) + ' ' + errors.join(' | '));
  } finally {
    await page.close().catch(() => {});
  }
}

async function playtestSmoke(browser) {
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on('pageerror', err => errors.push(String(err).slice(0, 400)));
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('cryptdelve', 'PROD_SENTINEL');
      localStorage.setItem('cryptdelve-settings', 'PROD_SETTINGS');
    } catch (e) {}
  });
  await page.goto(origin + '/playtest.html?nosfx=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => window.__PT && window.__PT.ready, { timeout: 45000 });
  const banner = await page.$eval('#ptBanner', el => el.innerText);
  check('startup banner', banner.indexOf('LICHLIGHT COMBAT PLAYTEST') >= 0 && banner.indexOf('a492023') >= 0, banner);
  const booted = await page.evaluate(async () => {
    const w = document.getElementById('ptGame').contentWindow;
    const man = await w.fetch('assets/manifest.json').then(r => r.ok ? r.json() : null).catch(() => null);
    const file = man && man.files && man.files[0];
    const imgOk = await new Promise(resolve => {
      if (!file) return resolve(false);
      const im = new w.Image();
      im.onload = () => resolve(im.naturalWidth > 0);
      im.onerror = () => resolve(false);
      im.src = 'assets/' + file;
    });
    const font = await w.fetch('assets/fonts/PixelifySans-Variable.ttf').then(r => r.ok).catch(() => false);
    const se = await w.fetch('assets/super_elites/manifest.json').then(r => r.ok).catch(() => false);
    return {
      version: w.game.version,
      flag: !!(w.__LICHLIGHT_PLAYTEST__ && w.__LICHLIGHT_PLAYTEST__.savePrefix === 'lichlight_playtest_'),
      parentFlag: !!window.__LICHLIGHT_PLAYTEST__,
      base: w.document.querySelector('base') && w.document.querySelector('base').href,
      imgOk, font, se, file
    };
  });
  check('startup game', booted.version === '0.7.18' && booted.flag && !booted.parentFlag, JSON.stringify(booted));
  check('startup assets resolve', booted.imgOk && booted.font && booted.se, JSON.stringify(booted));

  await page.click('#ptDevBtn');
  const menuOpen = await page.$eval('#ptMenu', el => !el.hidden);
  check('dev button opens the menu', menuOpen);
  await page.keyboard.press('F9');
  const menuAfterKey = await page.$eval('#ptMenu', el => el.hidden);
  check('F9 closes the dev menu', menuAfterKey);
  await page.evaluate(() => {
    document.getElementById('ptGame').contentWindow.dispatchEvent(new KeyboardEvent('keydown', { key: '`', code: 'Backquote', bubbles: true, cancelable: true }));
  });
  const menuFromGame = await page.$eval('#ptMenu', el => !el.hidden);
  check('backtick inside the game opens the dev menu', menuFromGame);

  const depth = await page.evaluate(() => {
    document.getElementById('ptDepth').value = '6';
    document.getElementById('ptGo').click();
    return window.__PT.snapshot();
  });
  check('set depth', depth.depth === 6 && depth.state === 'play' && depth.version === '0.7.18', JSON.stringify({ depth: depth.depth, state: depth.state }));

  const families = await page.evaluate(() => {
    const out = {};
    for (const fam of ['fist', 'sword', 'axe', 'maul', 'staff', 'bow']) {
      const snap = window.__PT.equip(fam);
      out[fam] = snap.weapon;
    }
    return out;
  });
  check('weapon families', ['fist', 'sword', 'axe', 'maul', 'staff', 'bow'].every(f => families[f] === f), JSON.stringify(families));

  const specs = await page.evaluate(() => {
    window.__PT.unlockAll();
    window.__PT.setSpec(0, 'kindling');
    window.__PT.setSpec(1, 'wide');
    window.__PT.setSpec(2, 'glass');
    return window.__PT.snapshot();
  });
  check('stage 7 specs and unlock', specs.hellmouth === true && specs.specs.join(',') === 'kindling,wide,glass', JSON.stringify({ hellmouth: specs.hellmouth, specs: specs.specs }));

  const kill = await page.evaluate(() => {
    const g = document.getElementById('ptGame').contentWindow.game;
    window.__PT.newRun();
    const p = g.player;
    const e = g.spawnEnemy('rat', p.x + 12, p.y, false, { noAffix: true });
    e.x = p.x + 12; e.y = p.y; e.hp = 1; e.hidden = false; e.disg = false; e.dead = false; e.state = 'chase';
    p.fx = 1; p.fy = 0;
    const kills = p.kills;
    g.doAttack(true);
    const gone = e.hp <= 0 || e.dead || g.enemies.indexOf(e) < 0;
    return { kills: p.kills - kills, hp: e.hp, gone, state: g.state };
  });
  check('basic combat kill', kill.gone && kill.kills >= 1 && kill.state === 'play', JSON.stringify(kill));

  const save = await page.evaluate(() => {
    window.__PT.setDepth(9);
    const bag = localStorage.getItem('lichlight_playtest_cryptdelve');
    let depth = 0;
    try { depth = JSON.parse(bag).depth; } catch (e) {}
    return {
      depth,
      prod: localStorage.getItem('cryptdelve'),
      settings: localStorage.getItem('cryptdelve-settings'),
      has: !!bag
    };
  });
  check('save writes the playtest key only', save.has && save.depth === 9 && save.prod === 'PROD_SENTINEL' && save.settings === 'PROD_SETTINGS', JSON.stringify(save));

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__PT && window.__PT.ready, { timeout: 45000 });
  const resumed = await page.evaluate(() => {
    const g = document.getElementById('ptGame').contentWindow.game;
    g.continueGame();
    return {
      depth: g.depth,
      state: g.state,
      prod: localStorage.getItem('cryptdelve'),
      hp: g.player && g.player.hp
    };
  });
  check('save reload continues the playtest run', resumed.depth === 9 && resumed.state === 'play' && resumed.hp > 0 && resumed.prod === 'PROD_SENTINEL', JSON.stringify(resumed));

  const god = await page.evaluate(() => {
    window.__PT.setGod(true);
    const g = document.getElementById('ptGame').contentWindow.game;
    const p = g.player;
    const before = p.hp;
    const hit = g.hurtPlayer(100000, { label: 'the dark' });
    const alive = { state: g.state, hp: p.hp, prevented: hit && hit.prevented, before };
    window.__PT.setGod(false);
    const deadHit = g.hurtPlayer(100000, { label: 'the dark' });
    return { alive, dead: { state: g.state, hp: p.hp, killed: !!(deadHit && deadHit.killed) }, prod: localStorage.getItem('cryptdelve'), pt: localStorage.getItem('lichlight_playtest_cryptdelve') };
  });
  check('god mode blocks a lethal hit', god.alive.state === 'play' && god.alive.hp > 0 && god.alive.prevented === 'shift', JSON.stringify(god.alive));
  check('player death', (god.dead.state === 'dying' || god.dead.state === 'dead') && god.dead.hp <= 0, JSON.stringify(god.dead));
  check('death leaves the production key', god.prod === 'PROD_SENTINEL' && !god.pt, JSON.stringify({ prod: god.prod, pt: god.pt ? 'present' : null }));

  const boss = await page.evaluate(() => {
    window.__PT.newRun();
    const snap = window.__PT.spawnBoss(0);
    const g = document.getElementById('ptGame').contentWindow.game;
    const b = g.enemies.find(e => e.T && e.T.boss);
    const before = { hp: b.hp, shield: b.shield || 0, name: b.name, depth: g.depth };
    const hit = g.damageEnemy(b, 40, 0, 0, '#fff', false, null, { type: 'Physical', tags: ['Melee', 'Direct'], critApplied: true, scale: false });
    return {
      note: snap.note,
      state: g.state,
      before,
      after: { hp: b.hp, shield: b.shield || 0 },
      dealt: hit && (hit.hpDmg || 0),
      shieldAbs: hit && (hit.shieldAbs || 0),
      killed: hit && hit.killed
    };
  });
  check('boss encounter starts', boss.before.depth === 5 && /MOTHER MURK/.test(boss.before.name || '') && boss.state === 'play', JSON.stringify(boss.before));
  check('boss takes damage', (boss.shieldAbs > 0 || boss.dealt > 0 || boss.after.shield < boss.before.shield || boss.after.hp < boss.before.hp) && boss.killed !== true, JSON.stringify(boss));

  const maw = await page.evaluate(() => {
    const snap = window.__PT.hellmouthScenario('se_nyx');
    const g = document.getElementById('ptGame').contentWindow.game;
    const se = g.enemies.filter(e => e && e.superElite && e.hp > 0);
    const e = se[0];
    const before = e ? { hp: e.hp, shield: e.shield || 0, phase: e.sePhase, name: e.name } : null;
    if (e) g.castHellmouth();
    return {
      note: snap.note,
      hellmouth: snap.hellmouth,
      count: se.length,
      others: g.enemies.length,
      before,
      after: e ? { hp: e.hp, shield: e.shield || 0, maw: e.mawVuln || 0, dead: !!e.dead } : null,
      still: !!(e && g.enemies.indexOf(e) >= 0 && e.hp > 0)
    };
  });
  check('hellmouth scenario', maw.hellmouth && maw.count === 1 && maw.others === 1 && maw.before && maw.before.phase === 'fight' && /Nyx/.test(maw.before.name || ''), JSON.stringify(maw));
  check('hellmouth marks a super elite and does not delete it', maw.still && maw.after.hp === maw.before.hp && (maw.after.maw > 0 || maw.after.shield < maw.before.shield), JSON.stringify(maw));

  const elite = await page.evaluate(() => {
    const snap = window.__PT.spawnMob('skel', true, 'bulwark');
    const e = snap.enemies.find(q => q.type === 'skel' && q.elite);
    return { note: snap.note, e };
  });
  check('spawn elite affix', !!(elite.e && elite.e.affix.indexOf('bulwark') >= 0), JSON.stringify(elite));

  if (errors.length) check('playtest page errors', false, errors.slice(0, 3).join(' | '));
  else check('playtest page errors', true);
  await page.screenshot({ path: '/tmp/playtest-menu.png' }).catch(() => {});
  await page.close();
}

const stages = [
  'tests/playtest-guard.html',
  'tests/stage1-damage.html',
  'tests/stage2-resist.html',
  'tests/stage3-crit-scaling.html',
  'tests/stage4-status.html',
  'tests/stage5-poise.html',
  'tests/stage6-weapons.html',
  'tests/stage7-skills.html',
  'tests/stage8-enemies.html',
  'tests/stage9-bosses.html'
];

const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
let browser;
try {
  assertBaseline();
  await waitServer();
  const loaded = await loadPuppeteer();
  const puppeteer = loaded.default || loaded;
  browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });
  await playtestSmoke(browser);
  for (const rel of stages) await runHarness(browser, rel, rel.indexOf('stage9') >= 0 || rel.indexOf('guard') >= 0 ? 180000 : 120000);
} catch (e) {
  check('runner', false, e && e.stack || e);
} finally {
  if (browser) await browser.close().catch(() => {});
  server.kill('SIGTERM');
}
console.log((failed ? 'FAIL ' + failed : 'PASS') + ' / ' + lines.length);
process.exit(failed ? 1 : 0);
