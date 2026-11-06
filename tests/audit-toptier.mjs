/**
 * Headless top-tier damage audit for the Stage 9 combat baseline.
 *
 *   node tests/audit-toptier.mjs
 *
 * Loads index.html (a492023 combat, via this branch) and calls the live
 * spawn, hurt, and attack functions. Writes tests/audit-toptier.result.json.
 * Does not change balance, index.html, or version.json.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 8771);
const origin = 'http://127.0.0.1:' + port;
const chrome = process.env.CHROME || '/usr/local/bin/google-chrome';

async function loadPuppeteer() {
  const fallback = process.env.PUPPETEER_CORE || '/tmp/pt-audit/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
  try { return await import('puppeteer-core'); }
  catch (e) { return import(pathToFileURL(fallback).href); }
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

const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
let browser;
try {
  await waitServer();
  const loaded = await loadPuppeteer();
  const puppeteer = loaded.default || loaded;
  browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(120000);
  const errors = [];
  page.on('pageerror', err => errors.push(String(err && err.stack || err).slice(0, 500)));
  await page.goto(origin + '/index.html?nosfx=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => window.game && window.game.version && typeof window.newGame === 'function', { timeout: 30000 });
  const result = await page.evaluate(runAudit);
  result.pageErrors = errors.slice(0, 8);
  const out = path.join(root, 'tests', 'audit-toptier.result.json');
  fs.writeFileSync(out, JSON.stringify(result, null, 2));
  console.log('wrote ' + out);
  const brief = {
    version: result.version,
    naked: result.player && result.player.naked,
    reportedGap: result.player && result.player.reported198,
    seD1: result.se && result.se[0],
    bossD5: result.bossLive,
    stacking: result.stacking && result.stacking.summary,
    errors: result.error || errors.slice(0, 3)
  };
  console.log(JSON.stringify(brief, null, 2));
  if (result.error) process.exitCode = 1;
} catch (e) {
  console.error(e && e.stack || e);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  server.kill('SIGTERM');
}

function runAudit() {
  const out = { version: '', commitNote: 'live index.html functions', error: '' };
  try {
    const w = window;
    const g = w.game;
    const SLOTS = ['weapon', 'shield', 'helm', 'armor', 'boots', 'ring', 'amulet'];
    w.__noSampleSfx = true;
    w.__hurtSpread = 1;
    w.__champCrit = 1;
    w.__critRoll = 1;
    out.version = g.version;
    g.newGame();
    const p = g.player;

    function calm() {
      p.isInvincible = false;
      p.isPlayerUndetected = false;
      p.isArmorActive = false;
      p.inv0 = 0;
      p.roll = 0;
      p.barrier = 0;
      p.shiftT = 0;
      p.armorT = 0;
      w.__hurtSpread = 1;
      w.__champCrit = 1;
      w.__critRoll = 1;
      if (g.state !== 'play' && typeof w.setState === 'function') w.setState('play');
      p.hp = 8000;
    }
    function sheet() {
      return {
        lvl: p.lvl, hp: p.st.maxHp, def: p.st.def, block: p.st.block,
        armorFrac: Math.round(w.physicalArmorFraction(p.st.def) * 1000) / 1000,
        resFire: p.st.resFire, resCold: p.st.resCold, resLightning: p.st.resLightning,
        resPoison: p.st.resPoison, resShadow: p.st.resShadow,
        min: p.st.min, max: p.st.max, aspd: Math.round(p.st.aspd * 1000) / 1000,
        period: Math.round(w.attackPeriod() * 1000) / 1000,
        windup: Math.round(w.attackPeriod() * (w.weaponFamilyOf(p).windup || 0) * 1000) / 1000,
        family: w.weaponFamilyOf(p).id,
        crit: p.st.crit, critMul: p.st.critMul, ls: p.st.ls, fire: p.st.fire,
        regen: Math.round(p.st.regen * 1000) / 1000, ms: p.st.ms,
        gear: SLOTS.map(s => p.equip[s] ? (p.equip[s].name + (p.equip[s].rarity ? ' r' + p.equip[s].rarity : '')) : '').filter(Boolean)
      };
    }
    function wear(items) {
      for (const s of SLOTS) p.equip[s] = null;
      for (const it of items) {
        if (!it || p.lvl < (it.reqLvl || 1)) continue;
        p.equip[it.slot] = it;
      }
      w.computeStats();
      calm();
      return sheet();
    }
    function findUnique(L, name) {
      for (let i = 0; i < 80; i++) {
        const it = w.makeItem(L, 3);
        if (it && it.name === name && it.rarity === 3) return it;
      }
      return null;
    }
    function dealt(amount, src) {
      calm();
      // Block is a full negate with its own chance. The per-hit table is the unblocked hit.
      p.st.block = 0;
      const before = p.hp;
      const res = w.hurtPlayer(amount, src || { x: p.x, y: p.y, label: 'audit' });
      const row = {
        raw: Math.round(amount * 1000) / 1000,
        dealt: res && res.dealt != null ? res.dealt : before - p.hp,
        prevented: res && res.prevented || '',
        armor: res && res.armorFraction != null ? Math.round(res.armorFraction * 1000) / 1000 : null,
        champ: !!(res && res.champCrit)
      };
      calm();
      return row;
    }
    function htk(dealtN, hp) {
      if (!(dealtN > 0)) return null;
      return Math.ceil(hp / dealtN);
    }

    p.lvl = 2;
    for (const s of SLOTS) p.equip[s] = null;
    w.computeStats();
    calm();
    const naked = sheet();
    const xp = { to2: w.xpNeed(1), to3: w.xpNeed(2), to4: w.xpNeed(3) };

    // Movement speed, empirical, open floor.
    const tx = Math.floor(p.x / 16), ty = Math.floor(p.y / 16);
    for (let j = -6; j <= 6; j++) for (let i = -6; i <= 6; i++) g.setTile(tx + i, ty + j, 1);
    p.swing = 0; p.roll = 0; p.hunger = 100; p.thirst = 100; p.fatigue = 100;
    const x0 = p.x;
    g.step(1, { x: 1, y: 0 });
    const moved = Math.round((p.x - x0) * 10) / 10;
    calm();

    const kits = { naked: naked };
    kits.rusty = wear([w.makeRusty()]);
    kits.sword = wear([w.makeItem(1, 0, 'Short Sword')]);
    kits.bow = wear([w.makeItem(2, 0, 'Short Bow')]);
    kits.axe = wear([w.makeItem(1, 0, 'Hand Axe')]);
    kits.armorOnly = wear([
      w.makeItem(1, 0, 'Leather Armor'),
      w.makeItem(1, 0, 'Cap'),
      w.makeItem(1, 0, 'Boots'),
      w.makeItem(1, 0, 'Wooden Buckler'),
      w.makeRusty()
    ]);
    const hpNames = ["Rootwake", "Lanternjaw", "Bloodbound Signet", "Tam's Lantern Bead", "Tam's Coffin Lid", "Grandsire Oswin"];
    const hpUniques = hpNames.map(n => findUnique(1, n)).filter(Boolean);
    kits.allEarlyHpUniques = wear(hpUniques);
    kits.allEarlyHpNames = hpUniques.map(it => ({
      name: it.name, slot: it.slot, req: it.reqLvl, hp: it.mods.hp || 0, def: (it.def || 0) + (it.mods.def || 0),
      dmg: it.mods.dmg || 0, ias: it.mods.ias || 0, min: it.min, max: it.max, spd: it.spd
    }));

    // Depth-1 clear: rusty already owned, one gated chest, one Super Elite unique. 200 trials.
    const trials = [];
    for (let n = 0; n < 200; n++) {
      const items = [w.makeRusty()];
      if (Math.random() > 0.35) items.push(w.makeItem(2, 0));
      else items.push(w.chestLoot(1));
      items.push(w.bossUnique(1));
      if (Math.random() < 0.2) items.push(w.makeItem(1, 1));
      const row = wear(items);
      trials.push({ hp: row.hp, def: row.def, min: row.min, max: row.max, aspd: row.aspd, gear: row.gear });
    }
    trials.sort((a, b) => a.hp - b.hp);
    const pct = q => trials[Math.min(trials.length - 1, Math.floor(q * (trials.length - 1)))];
    const loot = {
      n: trials.length,
      hp: { min: trials[0].hp, p50: pct(0.5).hp, p90: pct(0.9).hp, max: trials[trials.length - 1].hp },
      defP50: pct(0.5).def,
      sampleMax: trials[trials.length - 1],
      sampleP50: pct(0.5)
    };

    // What +life would be required to reach the reported 198 at level 2.
    const reported198 = {
      formula: 'maxHp = 50 + level*10 + sum(mods.hp)',
      naked: naked.hp,
      needPlusLife: 198 - naked.hp,
      measuredMaxFromEarlyUniques: kits.allEarlyHpUniques.hp,
      monteCarloMax: loot.hp.max
    };

    function mobRaw(type, d, elite) {
      const T = g.ETYPES[type];
      const bump = w.dmgBump(d) * w.mobDmgMul(d);
      let dmg = (T.dm[0] + T.dm[1] * (d - 1)) * bump;
      let hp = Math.round(T.hp[0] + T.hp[1] * (d - 1));
      if (elite) { dmg *= 1.4; hp = Math.round(hp * 2.2); }
      return { type: type, name: T.n, ai: T.ai, dmg: Math.round(dmg * 1000) / 1000, hp: hp, noContact: !!T.noContact };
    }
    function spawnCheck(type, d, elite) {
      w.depth = d;
      // spawnEnemy reads the closed-over `depth`, which startFloor sets.
      // Call startFloor only when the live depth differs.
      if (g.depth !== d) g.startFloor(d, false);
      p.lvl = 2;
      w.computeStats();
      calm();
      const e = w.spawnEnemy(type, p.x + 40, p.y, !!elite);
      return {
        formula: mobRaw(type, d, elite),
        liveDmg: Math.round(e.dmg * 1000) / 1000,
        liveHp: e.maxHp,
        match: Math.abs(e.dmg - mobRaw(type, d, elite).dmg) < 0.001 && e.maxHp === mobRaw(type, d, elite).hp
      };
    }

    const depths = [1, 2, 3, 4, 5];
    const present = {
      1: ['slime', 'bat', 'rat'],
      2: ['slime', 'skel', 'ooze'],
      3: ['mage', 'eel', 'skel'],
      4: ['drowned', 'bomber', 'zombie'],
      5: ['archer', 'wisp', 'drowned']
    };
    const specials = {
      slime: [{ id: 'contact', mul: 1, tell: 0, cd: 1.1, note: 'body contact' }],
      bat: [{ id: 'contact', mul: 1, tell: 0, cd: 1.1, note: 'body contact' }],
      rat: [{ id: 'contact', mul: 1, tell: 0, cd: 1.1, note: 'bite, then flee 0.8s' }],
      skel: [{ id: 'contact', mul: 1, tell: 0, cd: 1.1, note: 'body contact' }],
      ooze: [{ id: 'contact', mul: 1, tell: 0, cd: 1.1, note: 'body contact' }],
      mage: [
        { id: 'contact', mul: 1, tell: 0, cd: 1.1, note: 'body contact' },
        { id: 'bolt', mul: 1, tell: 0, cd: 2.1, note: 'hex bolt, no windup' }
      ],
      eel: [
        { id: 'contact', mul: 1, tell: 0, cd: 1.1, note: 'while surfaced' },
        { id: 'erupt', mul: 1, tell: 0.55, cd: 1.2, note: 'burrow blast r14' }
      ],
      drowned: [{ id: 'contact', mul: 1, tell: 0, cd: 1.1, note: 'brine puddle slows, 0 damage' }],
      bomber: [{ id: 'blast', mul: 1, tell: 0.9, cd: 0, note: 'fuse then r30; no contact. poison tick 0.15 of blast every 0.5s' }],
      zombie: [{ id: 'swing', mul: 1, tell: 0.6, cd: 1.7, note: 'walker heavy. recovery 0.55s. no contact' }],
      archer: [
        { id: 'contact', mul: 1, tell: 0, cd: 1.1, note: 'body contact' },
        { id: 'arrow', mul: 0.8, tell: 0, cd: 2.4, note: '3 arrows' }
      ],
      wisp: [{ id: 'shot', mul: 1, tell: 0.5, cd: 2.6, note: 'blink 0.5s then bolt. no contact' }]
    };

    function vsKit(raw, kit) {
      // Recompute armor from the kit's def without swapping gear mid-loop more than needed.
      const frac = kit.def > 0 ? kit.def / (kit.def + 30) : 0;
      const dealtN = Math.max(1, Math.round(raw * (1 - frac)));
      return { dealt: dealtN, htk: htk(dealtN, kit.hp), sec: null };
    }

    // One live hurt per depth at def 0 and at the armor-only def, to confirm the round.
    const incoming = [];
    for (const d of depths) {
      if (g.depth !== d) g.startFloor(d, false);
      p.lvl = 2;
      wear([]);
      const zero = sheet();
      wear([w.makeItem(1, 0, 'Leather Armor'), w.makeItem(1, 0, 'Cap'), w.makeItem(1, 0, 'Boots'), w.makeItem(1, 0, 'Wooden Buckler')]);
      const geared = sheet();
      const rows = [];
      for (const type of present[d]) {
        for (const elite of [false, true]) {
          const live = spawnCheck(type, d, elite);
          const src = { T: live.formula.ai ? g.ETYPES[type] : null, elite: elite, dmg: live.liveDmg, x: p.x, y: p.y, label: live.formula.name };
          // spawnCheck moved depth; hurt against the spawned numbers.
          const specs = specials[type] || [{ id: 'contact', mul: 1, tell: 0, cd: 1.1, note: '' }];
          for (const sp of specs) {
            wear([]);
            const nakedHit = dealt(live.liveDmg * sp.mul, src);
            wear([w.makeItem(1, 0, 'Leather Armor'), w.makeItem(1, 0, 'Cap'), w.makeItem(1, 0, 'Boots'), w.makeItem(1, 0, 'Wooden Buckler')]);
            const gearHit = dealt(live.liveDmg * sp.mul, src);
            const cd = sp.cd || 0;
            rows.push({
              type: type, elite: elite, attack: sp.id, tell: sp.tell, cd: sp.cd, note: sp.note,
              raw: Math.round(live.liveDmg * sp.mul * 1000) / 1000,
              formulaMatch: live.match,
              enemyHp: live.liveHp,
              naked: { dealt: nakedHit.dealt, htk: htk(nakedHit.dealt, zero.hp), sec: cd ? Math.round(htk(nakedHit.dealt, zero.hp) * cd * 10) / 10 : null, prevented: nakedHit.prevented },
              starterArmor: { def: geared.def, dealt: gearHit.dealt, htk: htk(gearHit.dealt, geared.hp), sec: cd ? Math.round(htk(gearHit.dealt, geared.hp) * cd * 10) / 10 : null }
            });
          }
        }
      }
      // Champion affix bursts at depth >= 4, using a live elite and affixBurstDmg.
      if (d >= 4) {
        const e = w.spawnEnemy('skel', p.x + 30, p.y, true);
        e.affix = { ids: ['volatile'], depth: d };
        const vol = w.affixBurstDmg(e, 0.45, 0.30);
        e.affix = { ids: ['brand'], depth: d };
        const brand = w.affixBurstDmg(e, 0.35, 0.22);
        wear([]);
        const vHit = dealt(vol, e);
        const bHit = dealt(brand, e);
        rows.push({ type: 'skel', elite: true, attack: 'volatile', tell: 0.7, cd: 0, note: 'cap 30% max HP', raw: vol, enemyHp: e.maxHp, naked: { dealt: vHit.dealt, htk: htk(vHit.dealt, naked.hp) }, starterArmor: {} });
        rows.push({ type: 'skel', elite: true, attack: 'brand', tell: 0.85, cd: 0, note: 'cap 22% max HP, circle stays', raw: brand, enemyHp: e.maxHp, naked: { dealt: bHit.dealt, htk: htk(bHit.dealt, naked.hp) }, starterArmor: {} });
      }
      incoming.push({ depth: d, rows: rows });
    }

    // Super Elite, real spawn, real resolver, in and out of the telegraph.
    const se = [];
    for (const d of depths) {
      if (g.depth !== d) g.startFloor(d, false);
      p.lvl = 2;
      wear([]);
      const zero = sheet();
      const e = w.seSpawn717('se_bonewarden', 'fight');
      e.sePhase = 'fight';
      const base = e.dmg;
      const attacks = [
        { id: 'swing', mul: g.SE_TELL.swing.mul, tell: g.SE_TELL.swing.dur, gap: g.SE_TELL.swing.gap, r: g.SE_TELL.swing.hit },
        { id: 'power', mul: g.SE_TELL.power.mul, tell: g.SE_TELL.power.dur, gap: g.SE_TELL.power.gap, r: g.SE_TELL.power.r },
        { id: 'brand', mul: g.SE_TELL.brand.mul, tell: g.SE_TELL.brand.dur, gap: g.SE_TELL.brand.gap, r: g.SE_TELL.brand.r }
      ];
      const hits = [];
      for (const a of attacks) {
        const raw = base * a.mul;
        const hit = dealt(raw, e);
        wear([w.makeItem(1, 0, 'Leather Armor'), w.makeItem(1, 0, 'Cap'), w.makeItem(1, 0, 'Boots'), w.makeItem(1, 0, 'Wooden Buckler')]);
        const gearHit = dealt(raw, e);
        const armorDef = p.st.def;
        wear([]);
        // Geometry: stand on the tell, then a step outside it.
        let landed = null, missed = null;
        if (a.id === 'swing') {
          e.sePhase = 'fight';
          p.x = e.x + 20; p.y = e.y;
          calm();
          const before = p.hp;
          landed = w.seResolveTell(e, 'swing', { a: 0, x: e.x, y: e.y, len: 52, w: 16 });
          const got = before - p.hp;
          e.sePhase = 'fight';
          p.x = e.x; p.y = e.y + 14;
          calm();
          const before2 = p.hp;
          missed = w.seResolveTell(e, 'swing', { a: 0, x: e.x, y: e.y, len: 52, w: 16 });
          hits.push({
            attack: a.id, raw: Math.round(raw * 1000) / 1000, tell: a.tell, gap: a.gap,
            cycle: Math.round((a.tell + a.gap) * 100) / 100,
            dealt: hit.dealt, htk: htk(hit.dealt, zero.hp),
            armorDealt: gearHit.dealt, armorHtk: htk(gearHit.dealt, zero.hp), armorDef: armorDef,
            secIfStand: Math.round(htk(hit.dealt, zero.hp) * (a.tell + a.gap) * 10) / 10,
            resolveIn: landed, dealtIn: got, resolveOut: missed, dealtOut: before2 - p.hp
          });
        } else {
          hits.push({
            attack: a.id, raw: Math.round(raw * 1000) / 1000, tell: a.tell, gap: a.gap,
            cycle: Math.round((a.tell + a.gap) * 100) / 100,
            dealt: hit.dealt, htk: htk(hit.dealt, zero.hp),
            armorDealt: gearHit.dealt, armorHtk: htk(gearHit.dealt, zero.hp), armorDef: armorDef,
            secIfStand: Math.round(htk(hit.dealt, zero.hp) * (a.tell + a.gap) * 10) / 10
          });
        }
      }
      // Phase 1 is swing-only until half HP, so a short fight may never fire power.
      const phase1Swings = Math.ceil((e.maxHp * 0.5) / 4);
      se.push({
        depth: d, name: e.name, dmg: Math.round(base * 1000) / 1000,
        hp: e.maxHp, shield: e.maxShield, xp: e.xp, attacks: hits,
        note: 'phase 1 swing only until 50% HP; power joins phase 2; brand joins phase 3 (<=25% HP)'
      });
    }

    function bossRaw(d) {
      return (8 + 2.2 * (d - 1)) * w.dmgBump(d, true);
    }
    const bossMuls = [
      { id: 'contact', mul: 1, tell: 0, cd: 1.0, note: 'melee body, while patterns are on cooldown' },
      { id: 'charge', mul: 1.3, tell: 0.75, cd: 1.0, note: 'contact during the charge' },
      { id: 'hop', mul: 1.1, tell: 0.85, cd: 0, note: 'Mother Murk phase 1. r28' },
      { id: 'ring', mul: 0.7, tell: 0.55, cd: 0, note: 'per bullet. Murk phase 2. 14 or 18 shots' },
      { id: 'slam', mul: 1.15, tell: 0.9, cd: 0, note: 'not on Murk. r26. phase 2 repeats 3 times' },
      { id: 'nova', mul: 1.1, tell: 1.15, cd: 0, note: 'not on Murk. r58' },
      { id: 'beam', mul: 1.0, tell: 1.0, cd: 0, note: 'not on Murk' },
      { id: 'spread', mul: 0.7, tell: 0.85, cd: 0, note: 'per bolt' },
      { id: 'spiral', mul: 0.6, tell: 0.6, cd: 0.09, note: 'per shot during the spin' },
      { id: 'lob', mul: 0.9, tell: 1.0, cd: 0, note: 'bomb. poison patch is 0.15 of that per 0.5s' }
    ];
    const bossFormula = [];
    for (const d of depths) {
      wear([]);
      const zero = sheet();
      const raw = bossRaw(d);
      const hp = Math.round((240 + 60 * (d - 1)) * 1 * g.BOSS_HP_MUL);
      const shield = Math.round(hp * g.BOSS_SHIELD_FRAC);
      const src = { T: { boss: true, label: 'formula boss' }, elite: false, label: 'formula boss' };
      const attacks = bossMuls.map(a => {
        const hit = dealt(raw * a.mul, src);
        return { attack: a.id, mul: a.mul, tell: a.tell, raw: Math.round(raw * a.mul * 1000) / 1000, dealt: hit.dealt, htk: htk(hit.dealt, zero.hp), note: a.note };
      });
      bossFormula.push({ depth: d, placed: d % 5 === 0, dmg: Math.round(raw * 1000) / 1000, hp: hp, shield: shield, attacks: attacks });
    }
    if (g.depth !== 5) g.startFloor(5, false);
    const liveBoss = g.enemies.find(e => e.T && e.T.boss);
    wear([]);
    const zero = sheet();
    const liveAttacks = [];
    if (liveBoss) {
      for (const a of bossMuls) {
        const hit = dealt(liveBoss.dmg * a.mul, liveBoss);
        liveAttacks.push({ attack: a.id, raw: Math.round(liveBoss.dmg * a.mul * 1000) / 1000, dealt: hit.dealt, htk: htk(hit.dealt, zero.hp) });
      }
    }
    const bossLive = liveBoss ? {
      depth: g.depth, name: liveBoss.name, dmg: Math.round(liveBoss.dmg * 1000) / 1000,
      hp: liveBoss.maxHp, shield: liveBoss.maxShield, attacks: liveAttacks,
      patterns: (liveBoss.B && liveBoss.B.p1 || []).concat(['p2']).concat(liveBoss.B && liveBoss.B.p2 || [])
    } : null;

    function killWith(kind, d, amount, period, family) {
      if (g.depth !== d) {
        g.startFloor(d, false);
        p.lvl = 2;
        w.computeStats();
      }
      let e;
      if (kind === 'se') {
        e = w.seSpawn717('se_bonewarden', 'fight');
        if (!e) { w.sePlan717(d); e = w.seSpawn717('se_bonewarden', 'fight'); }
      } else {
        const b = g.enemies.find(q => q.T && q.T.boss);
        e = b || w.spawnBoss((p.x || 80), (p.y || 80));
      }
      if (!e) return null;
      e.sePhase = 'fight';
      e.hp = e.maxHp;
      e.shield = e.maxShield || 0;
      e.dead = false;
      e.mawVuln = 0;
      let hits = 0, t = 0, shieldHits = 0;
      const cap = 8000;
      while (e.hp > 0 && hits < cap) {
        const res = w.damageEnemy(e, amount, 0, 0, '#fff', false, null, {
          type: 'Physical', tags: family === 'bow' ? ['Ranged', 'Projectile', 'Direct'] : ['Melee', 'Direct'],
          critApplied: true, skill: family === 'bow' ? 'bow' : 'melee', weaponFamily: family, scale: true
        });
        hits++;
        t += period;
        if (res && res.shieldAbs > 0 && !(res.hpDmg > 0)) shieldHits++;
        if (res && res.prevented) break;
      }
      return {
        hp: e.maxHp, shield: e.maxShield || 0, hits: hits, shieldOnlyHits: shieldHits,
        sec: Math.round(t * 10) / 10, killed: e.hp <= 0, left: e.hp
      };
    }

    const weapons = [];
    function addWeapon(id, item) {
      const row = wear(item ? [item] : []);
      weapons.push({
        id: id, name: item ? item.name : 'Fists', rarity: item ? item.rarity : 0,
        sheet: { min: row.min, max: row.max, aspd: row.aspd, period: row.period, windup: row.windup, family: row.family, crit: row.crit, ls: row.ls },
        avg: Math.round((row.min + row.max) / 2)
      });
    }
    addWeapon('fists', null);
    addWeapon('rusty', w.makeRusty());
    addWeapon('sword-common', w.makeItem(1, 0, 'Short Sword'));
    addWeapon('axe-common', w.makeItem(1, 0, 'Hand Axe'));
    addWeapon('bow-common', w.makeItem(2, 0, 'Short Bow'));
    addWeapon('sword-grandsire', findUnique(1, 'Grandsire Oswin'));
    addWeapon('bow-banshee', findUnique(2, 'Scream of the Banshee'));
    addWeapon('axe-gravedigger', findUnique(1, "Gravedigger's Due"));
    let haste = null;
    for (let i = 0; i < 400 && !haste; i++) {
      const it = w.makeItem(1, 2, 'Short Sword');
      if (it && it.mods && it.mods.ias) haste = it;
    }
    addWeapon('sword-rare-haste', haste);
    let rareDmg = null;
    for (let i = 0; i < 400 && !rareDmg; i++) {
      const it = w.makeItem(1, 2, 'Short Sword');
      if (it && it.mods && it.mods.dmg && !it.mods.ias) rareDmg = it;
    }
    addWeapon('sword-rare-dmg', rareDmg);

    const ttk = [];
    for (const wpn of weapons) {
      if (!wpn.sheet) continue;
      const per = [];
      for (const d of depths) {
        const seK = killWith('se', d, wpn.avg, wpn.sheet.period, wpn.sheet.family);
        const seMin = killWith('se', d, wpn.sheet.min, wpn.sheet.period, wpn.sheet.family);
        const seMax = killWith('se', d, wpn.sheet.max, wpn.sheet.period, wpn.sheet.family);
        let bossK = null;
        if (d % 5 === 0) bossK = killWith('boss', d, wpn.avg, wpn.sheet.period, wpn.sheet.family);
        per.push({
          depth: d,
          se: seK && { hp: seK.hp, shield: seK.shield, hits: seK.hits, sec: seK.sec, minHits: seMin && seMin.hits, maxHits: seMax && seMax.hits },
          boss: bossK && { name: 'live', hp: bossK.hp, shield: bossK.shield, hits: bossK.hits, sec: bossK.sec }
        });
      }
      ttk.push({ id: wpn.id, name: wpn.name, rarity: wpn.rarity, sheet: wpn.sheet, avg: wpn.avg, rows: per });
    }

    // Stacking. Grandsire vs the same sword with extra ias pieces, crit once, leech before armor.
    const grand = findUnique(1, 'Grandsire Oswin');
    const ring = w.makeItem(1, 0, 'Ring');
    ring.mods = { ias: 10, hp: 0 };
    const helm = w.makeItem(1, 0, 'Cap');
    helm.mods = { ias: 10 };
    const stacked = wear([grand, ring, helm].filter(Boolean));
    const swordOnly = wear([grand].filter(Boolean));
    const expectedAspd = Math.round((1 * (1 + ((grand && grand.mods.ias || 0) + 10 + 10) / 100)) * 1000) / 1000;
    const aspdCheck = {
      swordIas: grand && grand.mods.ias,
      withTwoExtra10: stacked.aspd,
      swordOnly: swordOnly.aspd,
      expectedSum: expectedAspd,
      sumOnce: Math.abs(stacked.aspd - expectedAspd) < 0.002
    };

    wear([grand].filter(Boolean));
    w.__critRoll = 1;
    const noCrit = w.rollDmg('melee');
    w.__critRoll = 0;
    const yesCrit = w.rollDmg('melee');
    const dummy = w.spawnEnemy('skel', p.x + 16, p.y, false);
    dummy.hp = dummy.maxHp = 100000;
    dummy.shield = 0;
    dummy.mode = '';
    const hitNo = w.damageEnemy(dummy, noCrit.d, 1, 0, '#fff', noCrit.crit, null, { type: 'Physical', tags: ['Melee', 'Direct'], critApplied: true, skill: 'melee', weaponFamily: 'sword' });
    dummy.hp = 100000;
    const hitYes = w.damageEnemy(dummy, yesCrit.d, 1, 0, '#fff', yesCrit.crit, null, { type: 'Physical', tags: ['Melee', 'Direct'], critApplied: true, skill: 'melee', weaponFamily: 'sword' });
    dummy.hp = 100000;
    // Footgun: already-multiplied amount AND critPending. Not the live swing path.
    const hitDouble = w.damageEnemy(dummy, yesCrit.d, 1, 0, '#fff', true, null, { type: 'Physical', tags: ['Melee', 'Direct'], critApplied: false, critPending: true, skill: 'melee', weaponFamily: 'sword' });
    const critCheck = {
      baseNo: noCrit.base, rolledNo: noCrit.d, dealtNo: hitNo.dealt || hitNo.hpDmg,
      baseYes: yesCrit.base, mul: yesCrit.mul, rolledYes: yesCrit.d, dealtYes: hitYes.dealt || hitYes.hpDmg,
      ratio: (hitNo.dealt || hitNo.hpDmg) ? Math.round(((hitYes.dealt || hitYes.hpDmg) / (hitNo.dealt || hitNo.hpDmg)) * 100) / 100 : null,
      liveAppliesOnce: (hitYes.dealt || hitYes.hpDmg) === Math.max(1, Math.round(yesCrit.d)),
      pendingOnTop: hitDouble.dealt || hitDouble.hpDmg
    };

    // Life steal vs ram armor (incoming * 0.4).
    const ram = w.spawnEnemy('ram', p.x + 20, p.y, false);
    ram.hp = ram.maxHp = 100000;
    ram.shield = 0;
    ram.mode = '';
    p.st.ls = swordOnly.ls || 6;
    p.hp = 50;
    p.st.maxHp = Math.max(p.st.maxHp, 500);
    w.__critRoll = 1;
    p.fx = 1; p.fy = 0;
    // Place ram inside the arc and call the melee leech the way doAttack does.
    const rolled = w.rollDmg('melee');
    const leechBase = w.scaleAmount(rolled.d, 'Physical', 1);
    const hpBefore = p.hp;
    w.leech(leechBase, 'melee');
    const healed = p.hp - hpBefore;
    const ramBefore = ram.hp;
    w.damageEnemy(ram, rolled.d, 1, 0, '#fff', false, null, { type: 'Physical', tags: ['Melee', 'Direct'], critApplied: true, skill: 'melee', weaponFamily: 'sword' });
    const ramDealt = ramBefore - ram.hp;
    const leechCheck = {
      ls: p.st.ls, rolled: rolled.d, leechBase: leechBase, healed: Math.round(healed * 1000) / 1000,
      ramDealt: ramDealt, ramArmor: 0.4,
      healedOnFullRoll: Math.abs(healed - leechBase * p.st.ls / 100) < 0.02,
      ramTookLess: ramDealt < rolled.d
    };

    // Bow does not leech. Power more is a single extra multiplier.
    wear([w.makeItem(2, 0, 'Short Bow')]);
    w.__critRoll = 1;
    const bowRoll = w.rollDmg('bow');
    w.noteLeechSkip('bow', bowRoll.d);
    const bowLeech = w.__lastLeech;
    wear([w.makeItem(1, 0, 'Short Sword')]);
    const swordSheet = sheet();
    const axeSheet = wear([w.makeItem(1, 0, 'Hand Axe')]);
    // Same outgoing amount, two families.
    const famTarget = w.spawnEnemy('slime', p.x + 10, p.y, false);
    famTarget.hp = famTarget.maxHp = 100000;
    const famSword = w.damageEnemy(famTarget, 10, 0, 0, '#fff', false, null, { type: 'Physical', tags: ['Melee'], critApplied: true, skill: 'melee', weaponFamily: 'sword' });
    famTarget.hp = 100000;
    const famAxe = w.damageEnemy(famTarget, 10, 0, 0, '#fff', false, null, { type: 'Physical', tags: ['Melee'], critApplied: true, skill: 'melee', weaponFamily: 'axe' });

    // Poise to stagger a depth-1 Super Elite with sword lights, and the player with SE swings.
    if (g.depth !== 1) g.startFloor(1, false);
    const se1 = w.seSpawn717('se_bonewarden', 'fight');
    se1.sePhase = 'fight';
    w.ensurePoise(se1);
    let swordPoiseHits = 0;
    while (se1.poise > 0 && swordPoiseHits < 400 && !w.getStatus(se1, 'stagger')) {
      se1.hp = se1.maxHp;
      w.damageEnemy(se1, 4, 0, 0, '#fff', false, null, { type: 'Physical', tags: ['Melee', 'Direct'], critApplied: true, skill: 'melee', weaponFamily: 'sword' });
      swordPoiseHits++;
    }
    const seStaggered = !!w.getStatus(se1, 'stagger');
    wear([]);
    w.ensurePoise(p);
    p.poise = p.poiseMax;
    let swingsToStagger = 0;
    while (p.poise > 0 && swingsToStagger < 80 && !w.getStatus(p, 'stagger')) {
      calm();
      w.hurtPlayer(se1.dmg, se1);
      swingsToStagger++;
    }
    const playerStaggered = !!w.getStatus(p, 'stagger');

    const eligible = [1, 2, 5].map(L => ({
      L: L,
      names: (w.eligibleUniques(L) || []).map(u => u.name)
    }));

    // bossUnique level rewrite: stats rolled at L+k, then lvl forced back to L.
    const widened = [];
    for (let i = 0; i < 30; i++) {
      const it = w.bossUnique(1);
      widened.push({ name: it.name, lvl: it.lvl, req: it.reqLvl, min: it.min || 0, max: it.max || 0, hp: (it.mods && it.mods.hp) || 0, dmg: (it.mods && it.mods.dmg) || 0, ias: (it.mods && it.mods.ias) || 0, base: it.base });
    }

    // Proposed numbers are measured through hurtPlayer. Nothing in index.html changes.
    // Power and brand gain an early weight that is gone by depth 5. Swing stays.
    // The HP factor fades the same way: 2.8x champion at depth 1, back to today's 1.4x at depth 5.
    // Depth 5 power is already in the boss-hop band, so that floor does not get a second HP bump.
    function earlyFade(d) { return Math.max(0, 1 - (d - 1) / 4); }
    wear([]);
    const proposal = [];
    for (const s of se) {
      const f = earlyFade(s.depth);
      const powerMul = Math.round((1.7 + 1.3 * f) * 1000) / 1000;
      const brandMul = Math.round((1.15 + 0.85 * f) * 1000) / 1000;
      const baseHp = Math.round(18 + 7 * (s.depth - 1));
      const champ = Math.round(baseHp * 2.2);
      const hpFactor = Math.round((1.4 + 1.4 * f) * 1000) / 1000;
      const hpNow = Math.round(champ * 1.4);
      const hpNew = Math.round(champ * hpFactor);
      const shNow = Math.round(hpNow * 0.1);
      const shNew = Math.round(hpNew * 0.1);
      const src = { T: { superElite: true, label: 'Bonewarden' }, superElite: true, label: 'Bonewarden' };
      const rows = ['swing', 'power', 'brand'].map(id => {
        const cur = s.attacks.find(a => a.attack === id);
        const mul = id === 'power' ? powerMul : id === 'brand' ? brandMul : 1;
        const raw = s.dmg * mul;
        const hit = dealt(raw, src);
        return { attack: id, mul: mul, raw: Math.round(raw * 1000) / 1000, before: cur.dealt, after: hit.dealt, htkBefore: cur.htk, htkAfter: htk(hit.dealt, 70) };
      });
      const rusty = ttk.find(t => t.id === 'rusty');
      const grandW = ttk.find(t => t.id === 'sword-grandsire');
      function clock(hp, sh, dmg, period) {
        let h = hp, sld = sh, hits = 0, time = 0;
        while (h > 0 && hits < 8000) {
          let left = dmg;
          const abs = Math.min(sld, left);
          sld -= abs; left -= abs; h -= left; hits++; time += period;
        }
        return { hits: hits, sec: Math.round(time * 10) / 10 };
      }
      proposal.push({
        depth: s.depth, fade: Math.round(f * 1000) / 1000, hpFactor: hpFactor,
        hpBefore: hpNow, hpAfter: hpNew, shieldBefore: shNow, shieldAfter: shNew,
        hpMatchesLive: hpNow === s.hp,
        attacks: rows,
        rusty: {
          before: rusty.rows.find(r => r.depth === s.depth).se,
          after: clock(hpNew, shNew, rusty.avg, rusty.sheet.period)
        },
        grandsire: {
          before: grandW.rows.find(r => r.depth === s.depth).se,
          after: clock(hpNew, shNew, grandW.avg, grandW.sheet.period)
        }
      });
    }

    out.player = {
      xp: xp, movedPxPerSec: moved, naked: naked, kits: {
        rusty: kits.rusty, sword: kits.sword, bow: kits.bow, axe: kits.axe,
        armorOnly: kits.armorOnly, allEarlyHpUniques: kits.allEarlyHpUniques
      },
      earlyHpUniqueStats: kits.allEarlyHpNames,
      loot: loot,
      reported198: reported198
    };
    out.incoming = incoming;
    out.se = se;
    out.proposal = proposal;
    out.bossFormula = bossFormula;
    out.bossLive = bossLive;
    out.ttk = ttk.map(t => ({
      id: t.id, name: t.name, rarity: t.rarity, sheet: t.sheet, avg: t.avg,
      rows: t.rows
    }));
    out.stacking = {
      summary: {
        iasSumsOnce: aspdCheck.sumOnce,
        critOnce: critCheck.liveAppliesOnce,
        critRatio: critCheck.ratio,
        leechBeforeArmor: leechCheck.healedOnFullRoll && leechCheck.ramTookLess,
        bowSkipsLeech: !!(bowLeech && bowLeech.skipped),
        familyDoesNotChangeDamage: (famSword.dealt || famSword.hpDmg) === (famAxe.dealt || famAxe.hpDmg)
      },
      aspd: aspdCheck,
      crit: critCheck,
      leech: leechCheck,
      bowLeech: bowLeech,
      swordPeriod: swordSheet.period,
      axePeriod: axeSheet.period,
      familyDamage: { sword: famSword.dealt || famSword.hpDmg, axe: famAxe.dealt || famAxe.hpDmg },
      poise: {
        seTaken: g.POISE_TIER.super.taken, seMax: g.POISE_TIER.super.max,
        swordLight: g.WEAPON_FAMILIES.sword.poise.light,
        hitsToStaggerSe: swordPoiseHits, seStaggered: seStaggered,
        playerMax: g.POISE_TIER.player.max, incomingSkill: g.POISE_IN.skill,
        seSwingsToStaggerPlayer: swingsToStagger, playerStaggered: playerStaggered
      }
    };
    out.uniques = { eligible: eligible, bossUniqueDepth1: widened };
    out.constants = {
      dmgBump: depths.map(d => ({ d: d, mob: Math.round(w.dmgBump(d) * 1000) / 1000, boss: Math.round(w.dmgBump(d, true) * 1000) / 1000 })),
      blockCap: 40,
      seTell: g.SE_TELL,
      bossTell: g.BOSS_TELL,
      move: 62,
      minMove: g.MIN_MOVE_MUL,
      critBase: 5,
      critMulBase: 2,
      lifeDrainWired: false
    };
  } catch (e) {
    out.error = String(e && e.stack || e);
  }
  return out;
}
