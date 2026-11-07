/**
 * Counterfactual bag math for tools/audit/out/loot-followup.json.
 * Does not change the game. Policies drop recorded items before pickup.
 *
 *   node tools/audit/loot-followup-report.mjs [json-path]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2] || 'tools/audit/out/loot-followup.json';
const data = JSON.parse(readFileSync(path, 'utf8'));
const runs = data.runs;
const BAG = 20;

const GENERATOR = new Set(['loose', 'sealed', 'vault']);
const PRESERVE = new Set(['keyed', 'mimic', 'puzzle', 'super']);

function keepItem(item, policy, index) {
  const src = item.src;
  if (policy.drop && policy.drop.has(src)) {
    if (policy.floors && !policy.floors.has(item.floor)) return true;
    if (policy.rate != null && policy.rate < 1) {
      const h = Math.imul(index + 1, 0x9E3779B1) ^ Math.imul(item.floor, 0x85EBCA6B) ^ policy.salt;
      const u = (h >>> 0) / 4294967296;
      return u >= policy.rate;
    }
    return false;
  }
  return true;
}

function simulate(run, policy) {
  const best = {};
  let filled = 0, overflow = 0, seen = 0, weapons = 0, upgrades = 0, gold = 0;
  let fullAt = null;
  const by = {};
  const perFloor = [];
  let idx = 0;
  for (const floor of run.floors) {
    gold += floor.gold;
    let equip = 0, weap = 0, up = 0;
    for (const item of floor.items) {
      const row = Object.assign({ floor: floor.d }, item);
      idx++;
      if (!by[item.src]) by[item.src] = { n: 0, up: 0, red: 0, weapon: 0, rar: [0, 0, 0, 0] };
      const bucket = by[item.src];
      if (!keepItem(row, policy, idx)) continue;
      seen++;
      equip++;
      bucket.n++;
      if (item.weapon) { weapons++; weap++; bucket.weapon++; }
      if (item.rarity >= 0 && item.rarity <= 3) bucket.rar[item.rarity]++;
      const prev = best[item.slot];
      const upgrade = !(prev >= item.score);
      if (upgrade) { best[item.slot] = item.score; upgrades++; up++; bucket.up++; }
      else bucket.red++;
      if (filled < BAG) filled++;
      else overflow++;
    }
    if (fullAt == null && filled >= BAG) fullAt = floor.d;
    perFloor.push({ d: floor.d, equip, weapon: weap, up, filled, overflow, gold, upgrades });
  }
  return { fullAt, filled, overflow, seen, weapons, upgrades, gold, by, perFloor };
}

function mean(rows, key) {
  if (!rows.length) return null;
  const vals = rows.map(r => r[key]).filter(v => v != null);
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
}

function policyResult(policy) {
  const sims = runs.map(run => simulate(run, policy));
  const full = sims.map(s => s.fullAt).filter(v => v != null);
  const sources = {};
  for (const sim of sims) {
    for (const src of Object.keys(sim.by)) {
      if (!sources[src]) sources[src] = { n: 0, up: 0, red: 0, weapon: 0, rar: [0, 0, 0, 0] };
      const a = sources[src], b = sim.by[src];
      a.n += b.n; a.up += b.up; a.red += b.red; a.weapon += b.weapon;
      for (let i = 0; i < 4; i++) a.rar[i] += b.rar[i];
    }
  }
  const n = sims.length;
  const r2 = x => Math.round((x / n) * 100) / 100;
  const srcOut = {};
  for (const src of Object.keys(sources).sort()) {
    const s = sources[src];
    srcOut[src] = { n: r2(s.n), up: r2(s.up), red: r2(s.red), weapon: r2(s.weapon), rar: s.rar.map(x => r2(x)) };
  }
  const floors = [];
  for (let d = 1; d <= 12; d++) {
    const rows = sims.map(s => s.perFloor[d - 1]);
    floors.push({
      d,
      equip: r2(rows.reduce((a, b) => a + b.equip, 0)),
      weapon: r2(rows.reduce((a, b) => a + b.weapon, 0)),
      up: r2(rows.reduce((a, b) => a + b.up, 0)),
      filled: r2(rows.reduce((a, b) => a + b.filled, 0)),
      overflow: r2(rows.reduce((a, b) => a + b.overflow, 0)),
      gold: r2(rows.reduce((a, b) => a + b.gold, 0)),
      upgrades: r2(rows.reduce((a, b) => a + b.upgrades, 0))
    });
  }
  return {
    id: policy.id,
    label: policy.label,
    fullAtMean: full.length ? Math.round((full.reduce((a, b) => a + b, 0) / full.length) * 100) / 100 : null,
    fullAtMin: full.length ? Math.min(...full) : null,
    fullAtMax: full.length ? Math.max(...full) : null,
    fullAtHist: full.reduce((m, v) => { m[v] = (m[v] || 0) + 1; return m; }, {}),
    neverFull: sims.length - full.length,
    equip: mean(sims, 'seen'),
    weapons: mean(sims, 'weapons'),
    upgrades: mean(sims, 'upgrades'),
    overflow: mean(sims, 'overflow'),
    gold: mean(sims, 'gold'),
    sources: srcOut,
    floors
  };
}

const policies = [
  { id: 'baseline', label: 'PR #42 as landed', drop: new Set() },
  { id: 'loose', label: 'Drop island / loose floor gear', drop: new Set(['loose']) },
  { id: 'sealed', label: 'Drop sealed-room chest-table gear', drop: new Set(['sealed']) },
  { id: 'vault', label: 'Drop extra vault gear that is not the floor puzzle rare', drop: new Set(['vault']) },
  { id: 'loose-sealed', label: 'Drop loose and sealed gear', drop: new Set(['loose', 'sealed']) },
  { id: 'generator', label: 'Drop loose, sealed, and extra vault gear', drop: new Set(['loose', 'sealed', 'vault']) },
  { id: 'generator-half', label: 'Drop half of loose, sealed, and extra vault gear', drop: GENERATOR, rate: 0.5, salt: 1 },
  { id: 'generator-early', label: 'Drop loose, sealed, and extra vault gear on floors 1-6 only', drop: GENERATOR, floors: new Set([1, 2, 3, 4, 5, 6]) },
  { id: 'champion', label: 'Drop champion whites', drop: new Set(['champion']) },
  { id: 'generator-champ', label: 'Drop generator gear and champion whites', drop: new Set(['loose', 'sealed', 'vault', 'champion']) },
  { id: 'squeeze', label: 'Drop squeeze-chest gear', drop: new Set(['squeeze']) },
  { id: 'generator-champ-squeeze', label: 'Drop generator gear, champion whites, and squeeze gear', drop: new Set(['loose', 'sealed', 'vault', 'champion', 'squeeze']) },
  { id: 'keyed-half', label: 'Keep half of keyed-chest gear (identity thinned)', drop: new Set(['keyed']), rate: 0.5, salt: 3 },
  { id: 'generator-champ-half', label: 'Drop generator gear and half of champion whites', drop: new Set(['loose', 'sealed', 'vault', 'champion']), rate: 1, salt: 2 }
];

// Half champions on top of a full generator cut needs a custom keep. Handle below.
function keepMixed(item, index) {
  if (GENERATOR.has(item.src)) return false;
  if (item.src === 'champion') {
    const h = Math.imul(index + 1, 0x9E3779B1) ^ Math.imul(item.floor, 0x85EBCA6B) ^ 7;
    return ((h >>> 0) / 4294967296) >= 0.5;
  }
  return true;
}

const results = policies.filter(p => p.id !== 'generator-champ-half').map(policyResult);

// Custom half-champion policy using the same simulate loop via a wrapper.
function simulateCustom(run, keepFn) {
  return simulate(run, { id: 'x', label: 'x', drop: new Set(), _custom: keepFn });
}
const halfChamp = {
  id: 'generator-champ-half',
  label: 'Drop generator gear and half of champion whites',
  custom: keepMixed
};
function keepGenHalfKeyed(item, index) {
  if (GENERATOR.has(item.src)) return false;
  if (item.src === 'keyed') {
    const h = Math.imul(index + 1, 0x9E3779B1) ^ Math.imul(item.floor, 0x85EBCA6B) ^ 9;
    return ((h >>> 0) / 4294967296) >= 0.5;
  }
  return true;
}
const genHalfKeyed = {
  id: 'generator-keyed-half',
  label: 'Drop generator gear and half of keyed-chest gear',
  custom: keepGenHalfKeyed
};

// Rebuild simulate-compatible by inlining custom into a one-off.
function policyResultCustom(policy) {
  const sims = runs.map(run => {
    const best = {};
    let filled = 0, overflow = 0, seen = 0, weapons = 0, upgrades = 0, gold = 0;
    let fullAt = null;
    const perFloor = [];
    let idx = 0;
    for (const floor of run.floors) {
      gold += floor.gold;
      let equip = 0, weap = 0, up = 0;
      for (const item of floor.items) {
        const row = Object.assign({ floor: floor.d }, item);
        idx++;
        if (!policy.custom(row, idx)) continue;
        seen++;
        equip++;
        if (item.weapon) { weapons++; weap++; }
        const prev = best[item.slot];
        const upgrade = !(prev >= item.score);
        if (upgrade) { best[item.slot] = item.score; upgrades++; up++; }
        if (filled < BAG) filled++;
        else overflow++;
      }
      if (fullAt == null && filled >= BAG) fullAt = floor.d;
      perFloor.push({ d: floor.d, equip, weapon: weap, up, filled, overflow, gold, upgrades });
    }
    return { fullAt, seen, weapons, upgrades, overflow, gold, perFloor };
  });
  const full = sims.map(s => s.fullAt).filter(v => v != null);
  const r2 = (arr, key) => Math.round((arr.reduce((a, b) => a + b[key], 0) / arr.length) * 100) / 100;
  return {
    id: policy.id,
    label: policy.label,
    fullAtMean: full.length ? Math.round((full.reduce((a, b) => a + b, 0) / full.length) * 100) / 100 : null,
    fullAtMin: full.length ? Math.min(...full) : null,
    fullAtMax: full.length ? Math.max(...full) : null,
    fullAtHist: full.reduce((m, v) => { m[v] = (m[v] || 0) + 1; return m; }, {}),
    equip: r2(sims, 'seen'),
    weapons: r2(sims, 'weapons'),
    upgrades: r2(sims, 'upgrades'),
    overflow: r2(sims, 'overflow'),
    gold: r2(sims, 'gold'),
    floors: Array.from({ length: 12 }, (_, i) => ({
      d: i + 1,
      equip: r2(sims.map(s => s.perFloor[i]), 'equip'),
      filled: r2(sims.map(s => s.perFloor[i]), 'filled'),
      gold: r2(sims.map(s => s.perFloor[i]), 'gold'),
      upgrades: r2(sims.map(s => s.perFloor[i]), 'upgrades'),
      weapon: r2(sims.map(s => s.perFloor[i]), 'weapon')
    }))
  };
}
function keepGenChampEarlySqueeze(item) {
  if (GENERATOR.has(item.src) || item.src === 'champion') return false;
  if (item.src === 'squeeze' && item.floor <= 4) return false;
  return true;
}
results.push(policyResultCustom(halfChamp));
results.push(policyResultCustom(genHalfKeyed));
results.push(policyResultCustom({
  id: 'generator-champ-early-squeeze',
  label: 'Drop generator gear, champion whites, and squeeze gear on floors 1-4',
  custom: keepGenChampEarlySqueeze
}));

// Early-floor source mix from baseline.
const base = results.find(r => r.id === 'baseline');
const shopFloors = runs.reduce((n, run) => n + run.floors.filter(f => f.shop > 0).length, 0);
const summary = {
  version: data.version,
  clears: runs.length,
  seeds: runs.map(r => r.seed),
  preserve: [...PRESERVE],
  baseline: base,
  policies: results.map(r => ({
    id: r.id,
    label: r.label,
    equip: r.equip,
    weapons: r.weapons,
    upgrades: r.upgrades,
    gold: r.gold,
    overflow: r.overflow,
    fullAtMean: r.fullAtMean,
    fullAtMin: r.fullAtMin,
    fullAtMax: r.fullAtMax,
    fullAtHist: r.fullAtHist,
    removed: Math.round((base.equip - r.equip) * 100) / 100
  })),
  shopFloorsWithOffers: shopFloors,
  shopOffersPerSuchFloor: shopFloors ? Math.round((runs.reduce((n, run) => n + run.floors.reduce((a, f) => a + (f.shop || 0), 0), 0) / shopFloors) * 100) / 100 : 0
};

const outPath = process.argv[3] || 'tools/audit/out/loot-followup-summary.json';
writeFileSync(outPath, JSON.stringify({ summary, results }, null, 2));
console.log(JSON.stringify(summary, null, 2));
console.log('\nBASELINE SOURCES');
console.log(JSON.stringify(base.sources, null, 2));
console.log('\nBASELINE FLOORS');
for (const f of base.floors) console.log(f.d, 'eq', f.equip, 'wep', f.weapon, 'upFloor', f.up, 'upCum', f.upgrades, 'fill', f.filled, 'over', f.overflow, 'gold', f.gold);

const floorSrc = {};
for (const run of runs) {
  for (const floor of run.floors) {
    if (!floorSrc[floor.d]) floorSrc[floor.d] = {};
    for (const item of floor.items) {
      const b = floorSrc[floor.d][item.src] || (floorSrc[floor.d][item.src] = { n: 0, up: 0 });
      b.n++;
    }
  }
}
// Upgrade flags are bag-order, so recompute per floor source from the baseline simulation order.
const srcFloor = {};
for (const run of runs) {
  const best = {};
  for (const floor of run.floors) {
    for (const item of floor.items) {
      const key = floor.d + ':' + item.src;
      const b = srcFloor[key] || (srcFloor[key] = { n: 0, up: 0, weapon: 0 });
      b.n++;
      if (item.weapon) b.weapon++;
      if (!(best[item.slot] >= item.score)) { best[item.slot] = item.score; b.up++; }
    }
  }
}
console.log('\nPER FLOOR SOURCE n/up');
for (let d = 1; d <= 12; d++) {
  const parts = [];
  for (const src of ['keyed', 'free', 'champion', 'mimic', 'loose', 'sealed', 'vault', 'puzzle', 'squeeze', 'super', 'boss', 'rusty', 'trash', 'crack', 'passage', 'prism', 'portal', 'prop', 'other']) {
    const b = srcFloor[d + ':' + src];
    if (b) parts.push(src + ' ' + (b.n / runs.length).toFixed(2) + '/' + (b.up / runs.length).toFixed(2));
  }
  console.log(d, parts.join('  '));
}
