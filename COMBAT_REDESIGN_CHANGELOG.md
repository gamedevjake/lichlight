# Lichlight Combat Redesign Changelog

This file is the permanent development record for the combat redesign. Do not delete or rewrite previous entries. Later stages append. Stage 0 is documentation only. Stage 1, recorded in a later entry, adds the damage resolver. The Stage 0 entry below is unchanged.

Gameplay baseline inspected for this entry: tag **v0.7.18**, commit **25253a5586470e466f99f2122c4579ac69a666b1**. Live game: https://gamedevjake.github.io/lichlight/

Source of truth is `index.html` on that commit (single-file game, 12,941 lines). The supplied combat design brief was treated as a map and re-checked against that file. Where the brief and the code differ, the difference is recorded under [Brief versus code](#brief-versus-code).

---

## Project Overview

- **Project name:** Lichlight.
- **Objective:** Redesign combat in controlled stages so weapons, skills, damage types, defenses, and builds have distinct identities. Introduce six damage types, one damage pipeline, armor and elemental resistances, a deeper critical system, conversion and penetration, status effects, stagger and poise, weapon identity, clearer skills, enemy resists and elite affixes, stronger boss and Super Elite fights, build-defining gear, readable feedback, an accurate character sheet, and depth-based balance. Keep each stage playable. Do not replace design with flat health or damage inflation.
- **Original version:** v0.7.18.
- **Original source commit:** `25253a5586470e466f99f2122c4579ac69a666b1`.
- **Redesign start date:** 2026-11-05.
- **Current implementation stage:** Stage 10 — Equipment, loot, and build-defining affixes. IMPLEMENTED, not VERIFIED.
- **Overall project status:** IN PROGRESS. Jake merged Stage 0 PR #23, Stage 1 PR #24, Stage 2 PR #25 (`6be0fbedfedf1a512b3a8b6b6dfceb21d3233ce4`), Stage 3 PR #26 (`57f085c76907a83f8650ca339b19188b467e82b6`), Stage 4 PR #27 (`d4fbc3c6904c0ddbc96b6d2b6825514e2420b896`), Stage 5 PR #28 (`6eecf2439525da17acf9479688de185d4b8a6749`), Stage 6 PR #29 (`29c81bb825c98816606e75c80985305becf5a0c8`), Stage 7 PR #30 (`20906ade92233c9a7831c0a0c90a4ab90f898851`), and Stage 8 PR #31 (`1fb0f155ca794750167f143182869222bdfab790`). Stages 0–8 stay IMPLEMENTED (not marked VERIFIED here). Stage 9 is IMPLEMENTED. Stage 10 is IMPLEMENTED and waiting for Jake. Stages 11–13 are NOT STARTED. Do not begin Stage 11 until Jake approves Stage 10.
- **Rollback tags:** `combat-redesign-pre-stage1` → `26e917f413531466aceed0577819110aa5e6dd17` (Stage 0 squash). `combat-redesign-pre-stage2` → `92edf84d106fec7a076d436348ac83da35e174fb` (Stage 1 squash on main, PR #24). `combat-redesign-pre-stage3` → `6be0fbedfedf1a512b3a8b6b6dfceb21d3233ce4` (Stage 2 squash on main, PR #25). `combat-redesign-pre-stage4` → `57f085c76907a83f8650ca339b19188b467e82b6` (Stage 3 squash on main, PR #26). `combat-redesign-pre-stage5` → `d4fbc3c6904c0ddbc96b6d2b6825514e2420b896` (Stage 4 squash on main, PR #27). `combat-redesign-pre-stage6` → `6eecf2439525da17acf9479688de185d4b8a6749` (Stage 5 squash on main, PR #28). `combat-redesign-pre-stage7` → `29c81bb825c98816606e75c80985305becf5a0c8` (Stage 6 squash on main, PR #29). `combat-redesign-pre-stage8` → `20906ade92233c9a7831c0a0c90a4ab90f898851` (Stage 7 squash on main, PR #30). `combat-redesign-pre-stage9` → `1fb0f155ca794750167f143182869222bdfab790` (Stage 8 squash on main, PR #31). Do not move these tags.

---

## Master Implementation Checklist

| Stage | Name | Status |
| --- | --- | --- |
| 0 | Baseline audit and project preparation | IMPLEMENTED |
| 1 | Universal damage architecture | IMPLEMENTED |
| 2 | Armor and resistances | IMPLEMENTED |
| 3 | Critical hits and damage scaling | IMPLEMENTED |
| 4 | Status effects | IMPLEMENTED |
| 5 | Stagger, poise, and crowd control | IMPLEMENTED |
| 6 | Weapon identity and attack responsiveness | IMPLEMENTED |
| 7 | Skill system and build specialization | IMPLEMENTED |
| 8 | Enemy resistances and elite affixes | IMPLEMENTED |
| 9 | Boss and Super Elite redesign | IMPLEMENTED |
| 10 | Equipment, loot, and build-changing affixes | IMPLEMENTED |
| 11 | Combat feedback and presentation | NOT STARTED |
| 12 | Character sheet and tooltip accuracy | NOT STARTED |
| 13 | Balance, performance, and final verification | NOT STARTED |

Status meanings: NOT STARTED, IN PROGRESS, IMPLEMENTED, VERIFIED, BLOCKED. Stage 0 stays IMPLEMENTED, not VERIFIED. Stage 1 is IMPLEMENTED, not VERIFIED. Jake merged Stage 1 PR #24 and GO'd Stage 2. Stage 2 is IMPLEMENTED, not VERIFIED. Jake merged Stage 2 PR #25 and GO'd Stage 3. Stage 3 is IMPLEMENTED, not VERIFIED. Jake merged Stage 3 PR #26 and GO'd Stage 4. Stage 4 is IMPLEMENTED, not VERIFIED. Jake merged Stage 4 PR #27 (`d4fbc3c6904c0ddbc96b6d2b6825514e2420b896`) and GO'd Stage 5. Stage 5 is IMPLEMENTED, not VERIFIED. Jake merged Stage 5 PR #28 (`6eecf2439525da17acf9479688de185d4b8a6749`) and GO'd Stage 6. Stage 6 is IMPLEMENTED, not VERIFIED. Jake merged Stage 6 PR #29 (`29c81bb825c98816606e75c80985305becf5a0c8`). Stage 7 is IMPLEMENTED, not VERIFIED. Jake merged it as PR #30 (`20906ade92233c9a7831c0a0c90a4ab90f898851`) and this log does not mark it VERIFIED. Stage 8 is IMPLEMENTED, not VERIFIED. Jake merged it as PR #31 (`1fb0f155ca794750167f143182869222bdfab790`). Stage 9 is IMPLEMENTED, not VERIFIED. Stage 10 is IMPLEMENTED, not VERIFIED. Jake reviews before any stage is marked VERIFIED. The Stage 0 entry did not run the harness. Stages 1 through 10 did; the counts are in those entries.

---

## Stage Development History

### 2026-11-05 — Stage 0: Baseline Audit and Project Preparation

- **Date:** 2026-11-05.
- **Stage:** Stage 0 — Baseline Audit and Project Preparation.
- **Version / Commit:** Gameplay baseline `25253a5586470e466f99f2122c4579ac69a666b1` (tag `v0.7.18`). This stage adds no gameplay commit. The Stage 0 checkpoint is the docs-only commit that adds this file. Roll gameplay back by staying on `25253a5`; this file is not loaded by the game.
- **Status:** IMPLEMENTED.
- **Objective:** Inspect current combat, record the architecture and known issues, open the changelog, and recommend the Stage 1 damage adapter. Do not change gameplay.

#### Existing Behavior

Combat is one scalar. There is no damage type, no elemental resist, no crit-damage stat, no pierce, no stagger, and no poise. "Fire" on gear is spell power. Four different protections are all called shields and do not share a pool.

Player hits enter `damageEnemy`. Almost every monster hit enters `hurtPlayer`. Most environment damage enters `envHurt` or writes `player.hp` directly. `hurtPlayer` is wrapped twice after its original definition: the v0.7.10 tome wrapper (Shift, Clone, Ethereal Shield) and the v0.7.12 wrapper that hides numeric player damage floaters.

Full formulas, call order, and the brief mismatches are in [Combat System Reference](#combat-system-reference) and [Brief versus code](#brief-versus-code).

#### Changes Implemented

- Created this changelog from a line-level read of `index.html` at `25253a5`.
- Re-checked the v0.7.18 combat brief against that source. Spot-checked monster base rows, boss and Super Elite formulas, spell numbers, and the defense curve. They match, with the discrepancies listed below.
- Read the existing HTML harnesses and listed what they already lock in, and what they do not cover.
- Wrote the Stage 1 architecture recommendation. No adapter was coded.

#### Files Modified

- `COMBAT_REDESIGN_CHANGELOG.md` — created. Documentation only.

No other repo file was modified. `index.html`, `version.json`, tests, and assets are unchanged.

#### Functions Added or Modified

None. The audit named the live functions Stage 1 will have to wrap. They were not edited.

Player offense: `computeStats`, `rollDmg`, `leech`, `doAttack`, `powerAttack074`, `fireBow`, `castSkill`, `skillAmp`, `manaCost`, `castHellmouth`, `mawTargets`.

Enemy defense and death: `damageEnemy`, `killEnemy`.

Player defense: `hurtPlayer` (original at the combat section, then reassigned near the tome block, then wrapped again by `noPlayerDmg712`), `tryBlock`, `absorbBarrier`, `raiseBarrier`, `powersOnHurt`, `dodgeWindow`.

Environment and costs: `envHurt`, `igniteBurn`, `updateBurn`, `tickSpikeWalk`, `endFall`, `updateSurvival`, `survDrip`, `bloodCost`, `useDoor`, `trapDmg`, `updateTraps`, `blast`.

Scaling and content: `spawnEnemy`, `dmgBump`, `mobDmgMul`, `spawnBoss`, `bossAI`, `seMaxHp717`, `seDmg717`, `seSpawn717`, `seTick717`, `mobAI`.

Sheet and items: `charPairs712`, `paintChar`, `fillInvStats`, `itemLines`, `makeItem`, `rollShopUnique`, `destroyItem`.

Feedback: `addText`, `addFoeText`.

#### Combat Formulas

No formula was changed. The live formulas are recorded in the reference section so later stages can diff against them.

#### Gameplay Impact

None. Players on v0.7.18 see the same combat. This commit is a markdown file the game does not load.

#### Compatibility Notes

Stage 1 must keep these save fields working without a migration that drops gear:

- Player blob: `lvl`, `xp`, `hp`, `mp`, `equip` (including `min`, `max`, `spd`, `def`, `block`, `mods.fire`, `mods.dmg`, `mods.crit`, `mods.ls`, `powers`), `learned`, `lichTome`, `spellBar`, `hunger`, `thirst`, `fatigue`.
- Floor snapshot (`worldSnap`): enemy `hp`, `shield`, `maxShield`, `dmg`, `phase`, `sePhase`, `superElite`, `T.boss`. Super Elite gate state is also stored as `se717`.
- Load clears player `barrier`, `slowT`, decoy, Ethereal Shield, and Ethereal Shift. Spell cooldowns and burn are not part of the player blob. `fixItem` clamps durability to at least 1, so a zero-durability item in an old save comes back with 1 durability rather than shattering.
- The affix key `fire` must keep meaning spell power until a later stage rewrites tooltips and migrates the stat on purpose.

#### Tests Performed

Source inspection and hand evaluation of formulas only. The browser harness was not launched, so this entry does not claim that any HTML test passed in this session.

Checked by reading code and evaluating the expressions:

- `dmgBump(1) = 1.25`, `dmgBump(5) = 1.182`, `dmgBump(6) = 1.165`, `dmgBump(11) = 1.08`, `dmgBump(d, true) = 1.08`.
- `densityCapDepth() = 12`. `mobDmgMul` is 1 through depth 12, then `min(2.5, 1 + 0.08 * (d - 12))`. Depth 100 is ×2.5.
- Depth-1 skeleton: 20 HP, 6.25 contact. Champion: 44 HP, 8.75 contact.
- Depth-100 skeleton contact: 414.45, champion 580.23. Brief rounds to 414 and 580.
- Floor-5 Mother Murk: 840 HP, 210 shield, 18.144 contact (brief 18.1).
- Floor-100 Oswin (`hp` 1.6, cycle 0): 17304 HP, 4326 shield, 243.864 contact (brief 244).
- Floor-105 Murk cycle 1: 17010 HP, 4253 shield, 319.68 contact (brief 320).
- Super Elite depth 1: 56 HP, 6 shield, 6.44 attack, 10.95 powerup (brief 6.4 and 11.0).
- Super Elite depth 100: 2190 HP, 219 shield, 151.88 attack (brief 152).
- Fireball with no amp: level 1 and 0 fire = 10.8; level 10 and 0 fire = 36; level 10 and 20 fire = 64.
- Defense keep fraction: 0 → 100%, 30 → 50%, 60 → 33%, 90 → 25%.
- Ethereal path with DEF 0 and spread pinned at 1: 100 becomes 75. That is what `tests/v0710.html` already asserts (`quiet()` sets `__hurtSpread = 1` and `st.def = 0`).
- Champion crit with DEF 0 and spread 1: 100 becomes 105 (`round(100 * 0.05)` added after defense). That is what `tests/v079.html` already asserts.

#### Known Issues

Recorded in [Known Issues and Technical Debt](#known-issues-and-technical-debt). The one that must not be "fixed" silently in Stage 1 is Hellmouth deleting Super Elites. That is Stage 9.

#### Rollback Notes

This stage does not change gameplay. Restore the pre-audit tree by reverting the commit that added `COMBAT_REDESIGN_CHANGELOG.md`. The playable game remains `25253a5586470e466f99f2122c4579ac69a666b1`.

#### Next Steps

Wait for Jake's approval before Stage 1. The recommended architecture is in [Design Decisions](#design-decisions). Stage 1 should add a thin `DamagePacket` and `resolveDamage` adapter, route current callers through it, keep Physical mitigation as the existing `DEF / (DEF + 30)` curve applied once, leave elemental resists for Stage 2, preserve the four shield systems, and add an explicit conversion graph that cannot loop. Baseline time-to-kill should stay approximately the same. Do not retune `fire`, and do not change Hellmouth's Super Elite behavior in Stage 1.

---

### 2026-11-05 — Stage 1: Universal Damage Architecture

- **Date:** 2026-11-05.
- **Stage:** Stage 1 — Universal Damage Architecture.
- **Version / Commit:** Gameplay version left at v0.7.18 (`version.json` unchanged). Implementation commit `485361698f134e2138646396c82db478de47922a` on `cursor/combat-stage1-damage-architecture-0f6b`. Rollback tag `combat-redesign-pre-stage1` points at `26e917f413531466aceed0577819110aa5e6dd17`.
- **Status:** IMPLEMENTED. Not VERIFIED. Jake reviews. Stage 2 has not been started.
- **Objective:** Add a thin DamagePacket and one resolveDamage. Migrate current callers as Physical so time-to-kill stays the same. Do not add elemental resists, do not reinterpret `mods.fire`, do not change Hellmouth's Super Elite delete.

#### Existing Behavior

Unchanged from the Stage 0 entry. One scalar pipe, `DEF/(DEF+30)` once inside hurtPlayer, Ethereal Shield ×0.75 in the tome wrapper before that function, four separate shields, `mods.fire` as spell power, Hellmouth sinking anything that is not `T.boss`.

#### Changes Implemented

- Added `DMG_TYPES` (Physical, Fire, Cold, Lightning, Poison, Shadow) and `DMG_TAGS` (Melee, Ranged, Spell, Projectile, AoE, DoT, Direct, Channelled). Channelled is accepted and unused.
- Added `makeDamagePacket`, `resolveDamage`, `setConversionEdges`, `getConversionEdges`, `physicalArmorFraction`, and `elementalResist`. `elementalResist` returns 0 for every type. No resist stats were added.
- `resolveDamage` is the only place that applies Ethereal Shield, block, the physical armor curve, champion crit, thorns, barrier, enemy guard/ram/Hellmouth vuln, the floor of 1, and boss/Super Elite shield. `damageEnemy` and `hurtPlayer` build a packet and call it. The v0.7.10 hurt wrapper no longer multiplies by 0.75 and no longer returns early for Shift or Clone, so those steps cannot run twice.
- `envHurt` calls `resolveDamage` with `world: true`. That branch rounds, forces at least 1, honors Shift, and does not apply armor, block, barrier, or Ethereal Shield. Hunger, the pit climb-out, spike-gap ticks, and the blood door still write HP directly.
- Conversion is a list of edges. The list starts empty. `setConversionEdges` rejects a self-edge and any cycle before it replaces the list, so a rejected update leaves the previous list in place. A moved component is marked and cannot take another edge. No gear adds an edge.
- Current attacks are tagged and typed Physical: melee Melee+Direct, bow Ranged+Projectile+Direct, Fireball Spell+Projectile+AoE, Whirlwind Spell+AoE+Melee, Frost Nova Spell+AoE, thorns Direct, incoming contact Melee+Direct, incoming bolts Projectile+Direct, poison DoT, other hurtPlayer sources Direct. The crit ×2 stays inside `rollDmg`. The resolver does not multiply by 2 again. Bow impact still drops the crit flag.
- Hellmouth, `T.boss` on Super Elites, and `killEnemy`'s Super Elite path were not edited.

#### Files Modified

- `index.html` — damage packet, resolver, adapters, attack tags. `version.json` was not edited.
- `tests/stage1-damage.html` — new parity harness.
- `COMBAT_REDESIGN_CHANGELOG.md` — this entry and the living sections (checklist, reference, known issues, testing, approval). The Stage 0 history entry was not rewritten.

#### Functions Added or Modified

Added: `makeDamagePacket`, `normalizeTags`, `normalizeComponent`, `physicalArmorFraction`, `elementalResist`, `setConversionEdges`, `getConversionEdges`, `conversionCycle`, `applyConversion`, `tagsForIncoming`, `resolveDamage`, `resolvePlayerDamage`, `resolveEnemyDamage`, `resolveWorldDamage`.

Modified: `damageEnemy` (adapter), `hurtPlayer` (adapter), `envHurt` (world packet), the v0.7.10 `hurtPlayer` wrapper (pass-through), the v0.7.16 `damageEnemy` wrapper (forwards the new tags argument), melee / Whirlwind / Frost Nova / Fireball / arrow / thorns call sites (tags only). `castHellmouth`, `tickHellmouth`, and `killEnemy` were not modified. `pw = fire + level * 2` was not modified; a comment marks it `legacySkillPower`.

#### Combat Formulas

No constant changed. Player Physical damage, one component, is still:

```
amount = incoming * (Ethereal Shield ? 0.75 : 1)
reduction = DEF / (DEF + 30)
dealt = max(1, round(amount * (1 - reduction) * spread))
if champion crit: dealt += max(0, round(amount * 0.05))
```

Spread is still 0.85–1.15, pinned in tests with `__hurtSpread`. Champion crit is still 10% and still uses the post-Ethereal, pre-armor amount. Block, thorns, and barrier still see that same pre-armor amount. DoTs still take Ethereal Shield and the armor curve, and still skip block, champion crit, thorns, barrier, and the new invulnerability window.

Enemy damage is still immunities, then guard ×0.15, then ram armor ×0.40 unless stunned, then Hellmouth ×1.10, then `max(1, round)`, then boss/Super Elite shield, then HP. A single unconverted component uses that expression once.

Non-physical components skip `DEF/(DEF+30)` and use `elementalResist`, which is 0. No current caller sends a non-physical type. A mixed packet armors only the Physical part and rounds the sum once.

World damage is still `max(1, round(amount))` with no armor. Empty conversion leaves the amount unchanged.

#### Gameplay Impact

None intended. Pinned-spread parity checks match the v0.7.18 integers (100 at DEF 0 stays 100, DEF 30 stays 50, Ethereal Shield stays 75, champion crit stays 105, DEF 30 plus champion crit stays 55, Ethereal plus champion crit stays 79). Live spread is still the old random range. Fireball, Whirlwind, and Frost Nova still use spell power. Hellmouth still deletes Super Elites.

#### Compatibility Notes

Packets are not saved. `mods.fire` is still spell power. A save written with an amulet `mods.fire = 6` reloaded the same `st.fire`, `st.crit`, `st.def`, `st.min`, and `st.max`. No migration runs.

#### Tests Performed

Headless Chrome (Puppeteer, system Google Chrome) against `python3 -m http.server` on 127.0.0.1, loading each `tests/*.html` harness. Executed. Not inferred.

**Before any Stage 1 code**, on tag `combat-redesign-pre-stage1` / `26e917f`. 21 files, **811 passed, 95 failed**. Fully green: `v076.html` 48, `v07102.html` 54, `v0718.html` 20. Combat anchors, ignoring the version string each old file pins:

- `tests/v079.html` — 49 pass, 1 fail (`version`, game is 0.7.18, harness expects 0.7.11). Champion crit checks passed.
- `tests/v0710.html` — 36 pass, 1 fail (`version`, expects 0.7.11). Ethereal Shield 75, Shift, Clone, and Hellmouth line-of-sight checks passed.
- `tests/v0717.html` — 47 pass, 1 fail (`version`, expects 0.7.17). Boss shield and Super Elite shield checks passed.
- `tests/v0718.html` — 20 pass, 0 fail.

Other first-run failures, all on the unmodified checkpoint:

- `v075.html` 59/1 — f3 multi select.
- `v077.html` 60/4 — version, version source, f4 pool, f5 shop boss.
- `v078.html` 60/1 — version.
- `v078-play.html` 25/1 — f11 champions only.
- `v0781.html` 27/2 — version, f1 boss hits (49 at depth 5).
- `v07101.html` 41/1 — version.
- `v07103.html` 24/3 — version, stats canvas, name in panel.
- `v0711.html` 42/5 — version, hundred gold, tome icon, stats scroll, stats canvas kept.
- `v0712.html` 37/6 — version, whale title wraps, short title one line, sell grid cells, short detail fits frame, detail wraps whale name.
- `v0713.html` 32/5 — version, whale still wraps, pedlar panel, sell grid 32, leave is red.
- `v0714.html` 40/1 — version only, on this first run.
- `v0715.html` 19/13 — version plus 12 satchel scale/layout checks (1080p, 1440p, 900p, 768p, 800×450, 915×412, 960×440, tome names, shield lines, glyphs, phone landscape, phone close).
- `v07151.html` 8/45 — version plus integer transform, kept-scale checks, 25 short-viewport checks, narrow-width checks, desktop scale/art, and four 915px DOM checks.
- `v07152.html` 34/3 — version, tab hits follow scale, slot hit follows scale.
- `v0716.html` 49/1 — version.

**After Stage 1**, same 21 files: **807 passed, 100 failed**. Combat anchors were unchanged: v079 49/1, v0710 36/1, v0717 47/1, v0718 20/0, and the same single version failure on v0712, v0716. File-level deltas versus the first run:

- `v0714.html` 33/8. The seven new names are footer sort, footer mark seen, footer drop all, footer equip, footer drop, footer close, and tab hitboxes match art. Re-running that file against unmodified `index.html` from `26e917f` produced the same 33/8. It is pre-existing layout timing, not a Stage 1 damage change. The first run's 40/1 is the cold pass.
- `v07152.html` 36/1 (version only). The same 36/1 happened on unmodified `26e917f` when re-run. The two hit-test failures from the first run did not reproduce.
- `v0711.html` 43/5 versus 42/5 on the checkpoint. The five failure names match (version, hundred gold, tome icon, stats scroll, stats canvas kept). The extra pass is a conditional Hellmouth check that depends on whether that floor spawned a trash target. The named boss-devour assertions did not start failing.

**New harness** `tests/stage1-damage.html`: **71 passed, 0 failed.** It locks the legacy integer formula against both `hurtPlayer` and `resolveDamage` (DEF 0/10/30/60/90/120/200, spreads 0.85/1/1.15, Ethereal Shield, champion crit, the floor of 1), block once, barrier partial and full, DoT versus block/barrier/i-frames, Shift versus combat and `envHurt`, Clone versus combat only, hunger ignoring DEF 500, guard front/flank/floor, ram armor and stun, ram plus Hellmouth vuln, crab shell, crit flag not doubling, boss shield then overflow, Super Elite intro immunity and shield, Hellmouth sinking a Super Elite and marking only the boss then deleting the Super Elite, `mods.fire` absent from melee and still driving Fireball (64 and 36) and Whirlwind (crit 29, non-crit 15), Frost Nova 8 plus slow 3.5, arrow tags, Fire skipping armor, mixed components armoring only Physical, conversion cycle/self-edge rejection, no chaining, and a save round-trip of `st.fire`.

#### Known Issues

Hellmouth still deletes Super Elites. Recorded under Known Issues. Not changed. `elementalResist` is a stub. `mods.fire` is still spell power. The legacy suites' version pins and UI failures above are pre-existing on v0.7.18.

#### Rollback Notes

```
git checkout combat-redesign-pre-stage1
```

That tag is `26e917f413531466aceed0577819110aa5e6dd17`. Gameplay under it is v0.7.18 / `25253a5`. Do not move the tag.

#### Next Steps

Wait for Jake. Do not merge this PR. Do not start Stage 2 (elemental resists, caps, penetration). Stage 2 should add resist stats beside `physicalArmorFraction` and must not run `DEF/(DEF+30)` on Fire, Cold, Lightning, Poison, or Shadow.

---

### 2026-11-05 — Stage 2: Armor and Resistances

- **Date:** 2026-11-05.
- **Stage:** Stage 2 — Armor and Resistances.
- **Version / Commit:** Gameplay version left at v0.7.18 (`version.json` unchanged). No deploy. Resist implementation commit `25fe766dd8b46f9797c60475a30e0ee06b8f9405`. Rollback tag `combat-redesign-pre-stage2` points at `92edf84d106fec7a076d436348ac83da35e174fb` (Stage 1 squash, PR #24).
- **Status:** IMPLEMENTED. Not VERIFIED. Jake reviews. This PR is not merged and is not live. Stage 3 has not been started.
- **Objective:** Give Fire, Cold, Lightning, Poison, and Shadow their own percent mitigation, with documented caps, penetration, and vulnerability. Keep `DEF / (DEF + 30)` on Physical only. Do not reclassify live attacks. Do not reinterpret `mods.fire`. Do not change Hellmouth.

#### Existing Behavior

Unchanged from the Stage 1 entry for every live caller. Those callers still send Physical. `elementalResist` returned 0, so a synthetic Fire packet ignored defense and was not reduced. World packets, hunger, the pit climb-out, spike-gap ticks, and the blood door did not use the combat curve. Hellmouth still sinks anything that is not `T.boss`, including Super Elites.

#### Changes Implemented

- `elementalResist` is no longer a stub. It returns a fraction: effective resist percent divided by 100. The percent can be negative. Physical and unknown types return 0.
- New helpers, same path for the player and for enemies: `rawElementalResist`, `resistCap`, `elementalResistPercent`, `packetPen`. The resolver multiplies with the integer percent (`amount * (100 - pct) / 100`) so 90% of 100 stays 10.
- Player order is the Stage 1 order. Elemental resist runs once per non-Physical component in the same loop that applies `DEF / (DEF + 30)` to Physical. Ethereal Shield, block, champion crit, thorns, and barrier are not applied again after that.
- Enemy order is the Stage 1 order. Elemental resist runs once per non-Physical component while the components are summed, before guard, ram armor, and Hellmouth ×1.10. Physical components are added unchanged. Enemies still do not use the DEF curve. Ram armor and guard still multiply the summed total, so a live Physical hit is the same number as Stage 1.
- World packets (`envHurt`, and a synthetic world packet of any type) do not call `elementalResist`. Hunger, the pit climb-out, spike-gap ticks, and the blood door still write HP directly.
- Gear plumbing only. `computeStats` sums `resFire`, `resCold`, `resLightning`, `resPoison`, `resShadow`, `resAll`, `maxResist`, `penFire`, `penCold`, `penLightning`, `penPoison`, `penShadow`, and `penAll` when an item already has those keys. `resAll` and `penAll` are folded into the five typed stats once. Defaults are 0. No affix was added to `AFFIX`. Loot, uniques, and shop prices were not retuned. No character-sheet layout change.
- Penetration is packet data plus, when the attacker is the player, the player's sheet pen for that type. It is subtracted from raw resist before the clamp. It does not apply to Physical, and the player's own pen does not reduce the player's own resist.
- Vulnerability is negative resist. There is no second vulnerability multiplier. Hellmouth ×1.10 stays the boss mark from Stage 1 and still runs once, after resist, on the enemy path only.
- Live attack tags were not edited. Fireball, Frost Nova, Whirlwind, poison puddles, lava, acid, and the other callers below stay Physical. The mapping table is a proposal for Jake. It is not applied.

#### Formulas

Physical, one component, is still the v0.7.18 expression. `physicalArmorFraction` is still `DEF / (DEF + 30)`. It is not used on Fire, Cold, Lightning, Poison, or Shadow.

```
eff = clamp(rawResist - penetration, RESIST_MIN, resistCap)
multiplier = (100 - eff) / 100
```

Locked constants:

| Constant | Value | Meaning |
| --- | --- | --- |
| `RESIST_MIN` | −100 | Vulnerability floor. −100 resist is ×2. A lower raw resist, or penetration that would push past −100, clamps here. |
| `RESIST_SOFT` | 75 | Default maximum. Raw resist above 75 does nothing until `maxResist` raises the cap. |
| `RESIST_HARD` | 90 | Absolute ceiling. `resistCap = clamp(75 + maxResist, 0, 90)`. |

`maxResist` is a bonus on top of 75, not a replacement cap. A bonus of +15 makes the cap 90. A bonus of +50 still caps at 90. A bonus of −25 makes the cap 50. The cap is never negative, so a large negative bonus stops positive resist and still allows vulnerability down to −100.

Overcap is stored on the sheet and is not thrown away before penetration. Raw 100 with the default cap and 20 penetration is `clamp(80, -100, 75) = 75`. Raw 100 with 40 penetration is 60. Penetration spends the overcap first.

Player sheet: `st.resFire` and the other four already include `resAll`. Enemy content can set `resists.Fire` (and `resists.All`) or the flat fields `resFire` / `resAll`. A finite `st` value, including 0, wins, so the player sheet is not also added to a `resists` bag. On an enemy, `resists[type]` wins over the flat field of the same type. `All` is added once.

Pinned examples, spread 1, no Ethereal Shield, one component, 100 damage:

| Case | Result |
| --- | --- |
| 0 resist | 100 |
| 75, or 100 with the default cap | 25 |
| 100 resist and `maxResist` +15 | 10 |
| −50 | 150 |
| −100 or −250 | 200 |
| 75 resist, 20 penetration | 45 |
| 0 resist, 40 penetration | 140 |
| 100 raw, default cap, 20 penetration | 25 |
| 100 raw, default cap, 40 penetration | 40 |

Ethereal Shield still multiplies the component by 0.75 before this. 100 Fire, Ethereal Shield, 50 resist, spread 1, deals 38. Champion crit still adds `round(pre-resist amount * 0.05)` after mitigation. 100 Fire at 50 resist from a forced champion crit deals 55, and the torch still snuffs. Block, thorns, and barrier still see the pre-resist amount. A blocked 100 Fire hit with 20% thorns returns 20, not 10.

A mixed packet sums the post-mitigation floats and rounds once. 100 Physical at DEF 30 plus 100 Fire at 50 resist deals 100, not 50 and not 150. Guard, ram armor, and Hellmouth ×1.10 then apply once to that enemy-side sum. 100 Fire at 50 resist into a guard's front is 8. The same hit into a ram that is also Hellmouth-marked is 22.

#### Proposed attack and hazard mapping

Not applied. Every row's live type is Physical, except the rows marked "not a packet." Jake decides before any caller changes type.

| Source | Live type today | Proposed type | Why it waits |
| --- | --- | --- | --- |
| Fists, melee, power attack | Physical | Physical | Weapon identity is Stage 6. |
| Bow arrow | Physical | Physical | Same. |
| Fireball, including the 0.6 splash | Physical | Fire | Spell migration is Stage 7. `mods.fire` is still spell power, not this type. |
| Whirlwind | Physical | Physical for the weapon roll. Fire for the `pw * 0.5` portion only after `mods.fire` is migrated | Splitting it now would change the crit split Stage 1 preserved. |
| Frost Nova | Physical | Cold | The 3.5s slow stays a status, Stage 4. The damage number waits with the spell migration. |
| Thorns | Physical | Physical | Reflected pre-mitigation amount. |
| Hellmouth | not a packet | not a damage type | Stage 9. The ×1.10 mark stays a boss multiplier, not vulnerability. |
| Enemy contact, charge ×1.3, ghoul leap, eel erupt, golem slam, bloater blast | Physical | Physical | |
| Bone Archer arrows, dart trap, boulder trap, pitfall, ceiling, jet | Physical | Physical | Traps use `hurtPlayer`, not `envHurt`. |
| Cultist bolt | Physical | Shadow | Hex bolt. Proposal only. |
| Lich Wisp bolt | Physical | Lightning | Energy bolt. Proposal only. |
| Spider web bolt | Physical | Physical | The 2.2s slow is a status, not a damage type. |
| Siren ring | Physical | Cold | Water bullets. Proposal only. |
| Exarch orb | Physical | Shadow | Choir orb. Proposal only. |
| Seer snipe | Physical | Lightning | Beam. Proposal only. |
| Bloater poison ground, crawler trail, lobber pot, drowned rush trail, boss lob poison | Physical DoT | Poison | DoT tag already exists. The type stays Physical until Jake accepts the table. |
| Boss ring, spiral, spread, hop, nova, slam, beam, teleport ring | Physical | Physical until Stage 9 names a boss element | Do not invent boss elements in Stage 2. |
| Super Elite swing and powerup | Physical | Physical until Stage 9 | Intro immunity and the shield are unchanged. |
| Hazard water, acid, lava, on-fire, spike-room cycle | Physical world packet | Water stays world. Acid → Poison, lava and on-fire → Fire, spike room → Physical, still on the world path | World packets skip resist even after a type change. Changing the label now would not change HP and would pretend the resist applies. |
| Spike-gap floor, bottomless pit, hunger / thirst / exhaustion, blood door | direct HP | unchanged direct HP | Not combat. Resist must not start applying here. |

#### Files Modified

- `index.html` — resist formula, sheet fields, one application inside the existing resolver. `version.json` was not edited.
- `tests/stage2-resist.html` — new harness.
- `COMBAT_REDESIGN_CHANGELOG.md` — this entry, the checklist, and the living sections. The Stage 0 and Stage 1 history entries were not rewritten.
- `STAGE2_REPORT.md` — implementation report for review.

#### Functions Added or Modified

Added: `resistCap`, `rawElementalResist`, `elementalResistPercent`, `packetPen`.

Modified: `elementalResist` (was the Stage 1 stub), `computeStats` (resist and pen fields, default 0), `makeDamagePacket` (keeps `penetration`), `resolvePlayerDamage`, `resolveEnemyDamage`, `damageEnemy` (forwards `meta.penetration`).

Not modified: `hurtPlayer`, `envHurt`, `castHellmouth`, `tickHellmouth`, `killEnemy`, `pw = fire + level * 2`, `AFFIX`, shop prices, the character sheet.

#### Gameplay Impact

None intended for a current save or a current attack. A character with no resist mods still has 0 on every element, and every live hit is still Physical, so time-to-kill matches Stage 1. Synthetic Fire, Cold, Lightning, Poison, and Shadow packets in the new harness are the only numbers that change, and only inside that harness.

#### Compatibility Notes

Old items do not have resist keys. `computeStats` leaves those stats at 0. `mods.fire` is still spell power. A save with `mods.fire = 6` plus explicit test-only resist mods reloaded the same `st.fire` and the same folded resists. Stripping the resist keys and recomputing returns every resist and pen to 0 while `st.fire` stays 6. Packets are not saved.

#### Tests Performed

Headless Chrome (Puppeteer, system Google Chrome, cache disabled) against `python3 -m http.server` on 127.0.0.1. Executed on this branch. Not inferred.

**Before any Stage 2 code**, on tag `combat-redesign-pre-stage2` / `92edf84`. 21 legacy files: **804 passed, 102 failed**. `tests/stage1-damage.html`: **71 passed, 0 failed**.

Per-file baseline: `v075` 59/1, `v076` 48/0, `v077` 60/4, `v078` 60/1, `v078-play` 25/1, `v0781` 27/2, `v079` 49/1, `v0710` 36/1, `v07101` 41/1, `v07102` 54/0, `v07103` 24/3, `v0711` 42/5, `v0712` 37/6, `v0713` 32/5, `v0714` 33/8, `v0715` 19/13, `v07151` 8/45, `v07152` 34/3, `v0716` 49/1, `v0717` 47/1, `v0718` 20/0.

Combat anchors on that run failed only the old version pin, or were clean: `v079` version, `v0710` version, `v0717` version, `v0718` 20/0. `v0712` and `v0716` failed only their previous names (version, and `v0712`'s layout strings).

**After Stage 2**, same 21 files: **814 passed, 93 failed**. `tests/stage1-damage.html`: **71 passed, 0 failed**. `tests/stage2-resist.html`: **73 passed, 0 failed**.

No legacy file gained a failure. Three files reported fewer failures than this VM's first baseline pass. The failure names that remain match the baseline, and the names that disappeared are the ones Stage 1 already traced to layout timing or a conditional spawn:

- `v0714.html` 33/8 → 40/1. The seven names that passed this time are footer sort, footer mark seen, footer drop all, footer equip, footer drop, footer close, and tab hitboxes match art. Stage 1 saw the same pair of results on unmodified `26e917f` (cold pass 40/1, later pass 33/8). The only remaining failure is the version pin.
- `v07152.html` 34/3 → 36/1. The two names that passed this time are tab hits follow scale and slot hit follows scale. Stage 1's re-run of unmodified code also landed on 36/1. The remaining failure is the version pin.
- `v0711.html` 42/5 → 43/5. The five failure names match (version, hundred gold, tome icon, stats scroll, stats canvas kept). The extra pass is the conditional `trash in the maw` check, which the harness only emits when that floor spawned a trash target. The boss-devour assertions did not start failing.

`v079`, `v0710`, `v0717`, and `v0718` were unchanged. No combat anchor failed for a formula reason.

`tests/stage2-resist.html` locks the constants, the 33-row integer table (caps, overcap, penetration, vulnerability floor, spread, Ethereal Shield, the floor of 1), Physical versus Fire independence, mixed packets, typed penetration, champion crit on the pre-resist amount, block, thorns, barrier, DoT, roll, Shift, Clone, world lava, hunger, pit and blood-door source locks, guard, ram, Hellmouth ×1.10, crab shell, boss shield, Super Elite intro immunity and shield, loot not rolling resist mods, the `mods.fire` save round-trip, Fireball and Frost Nova staying Physical against a 90 resist target, and Hellmouth still sinking a Super Elite while a marked boss takes 110. Conversion still moves half of a Physical hit to Fire, and that Fire half is resisted once.

#### Known Issues

Hellmouth still deletes Super Elites. `mods.fire` is still spell power. The proposed type table is not applied, so lava and poison puddles do not yet consult resist. Enemy content resists are still default 0 outside tests. The legacy version pins and UI failures above are pre-existing on v0.7.18.

#### Rollback Notes

```
git checkout combat-redesign-pre-stage2
```

That tag is `92edf84d106fec7a076d436348ac83da35e174fb`. It is the Stage 1 squash on main. Gameplay version on it is 0.7.18. Do not move the tag.

#### Next Steps

Wait for Jake. Do not merge this PR. Do not deploy. Do not start Stage 3 (crit expansion, crit damage, conversion edges with gameplay). Do not reclassify Fireball, Frost Nova, poison puddles, or lava until Jake accepts or edits the mapping table.

---

### 2026-11-05 — Stage 3: Critical Hits and Damage Scaling

- **Date:** 2026-11-05.
- **Stage:** Stage 3 — Critical Hits and Damage Scaling.
- **Version / Commit:** Gameplay version left at v0.7.18 (`version.json` unchanged). No deploy. Crit and scaling implementation commit `41dbf74d28bb7a1e2e8ff0f53589947f2fd69cde`. Rollback tag `combat-redesign-pre-stage3` points at `6be0fbedfedf1a512b3a8b6b6dfceb21d3233ce4` (Stage 2 squash, PR #25, on main).
- **Status:** IMPLEMENTED. Not VERIFIED. Jake reviews. This PR is not merged and is not live. Stage 4 has not been started.
- **Objective:** Make player crit chance and crit damage configurable, apply that multiplier once, and add a fixed outgoing scale order plus controlled conversion. Keep Stage 2 penetration on one pass. Audit life steal. Do not retype live attacks. Do not change Hellmouth. Do not reinterpret `mods.fire`.

#### Existing Behavior

Unchanged for a character with no new mods. `rollDmg` rolled min–max and multiplied by 2 when `random * 100 < crit%` (`st.crit` is `5 + mods.crit`, no cap). Melee leeched that roll, then multiplied by `PWR_MUL`. Whirlwind doubled only the weapon roll, then added `pw * 0.5`, then leeched the sum. The bow stored the doubled roll and passed `crit: false` on impact, so the floater had no `!`. Fireball and Frost Nova did not crit and did not leech. Champion crit stayed `+ round(pre-mitigation * 0.05)` after armor or resist. The conversion graph had no edges, rejected self-edges and cycles, and refused to chain a component that had already moved. Penetration ran once per elemental component inside the Stage 2 loop.

#### Changes Implemented

- One player crit step. `rollDmg(skill)` rolls the weapon, applies `critMultiplier(skill)` once, and marks the result `critApplied`. The resolver multiplies again only when a packet sets `critPending` and does not set `critApplied`. `damageEnemy(..., crit)` remains the floater flag. It does not multiply. Champion crit is not this step.
- Chance is `st.crit + skillCritChance(skill)`. There is no cap. A chance of 0 or below never crits. A chance of 100 or more crits for every roll in `[0, 1)`. `__critRoll` forces the roll in tests the way `__champCrit` forces a champion crit.
- Crit damage is `st.critMul = max(0, 2 + critDmg / 100)`, then plus a skill add. `critDmg` mods sum. No gear rolls `critDmg`. Default 0 keeps ×2. Skill adds live in `setSkillCrit` and are cleared on a new game or a load. They are not saved.
- Outgoing player damage, once per component, before conversion: `(amount + flat + flatType) * (1 + (inc + incType) / 100) * more * moreType * packetMore * (1 + bonusType / 100)`. A `scaled` flag stops a second pass. Enemy hits, world packets, and direct HP writes skip it. Defaults are flat 0, increased 0, more factors 1, type bonus 0, so a current hit is the same number.
- `more` mods multiply. Two `+10% more` mods are ×1.21. Increased mods sum. `packetMore` carries the power-attack multiplier and the Fireball splash (1 or 0.6). Splash stays a more factor so a future flat is inside the 0.6 instead of being added after it. With flat 0 the splash number is unchanged.
- Conversion still moves a fraction. It does not copy. A duplicate `from → to` edge is rejected. Self-edges and cycles are still rejected. A moved component does not take another edge unless that later edge sets `chain: true`, and that hop sets `chainUsed` so a third edge cannot take it. No loot adds edges. `newGame` and `continueGame` clear the list.
- `mitigateElement` applies Stage 2 resist and penetration once per elemental component and stores the result. A second call returns the stored amount and does not add penetration again. The player's own pen still does not reduce the player's own resist.
- Life steal is audited, not retuned for default gear. Melee and power attacks leech `scaleAmount(post-crit roll, Physical, 1)`, so the power-attack more is still excluded and enemy armor, guard, and resist are still excluded. Whirlwind leeches the scaled skill sum, which is the old sum when the new stats are default. Bows, Fireball, and Frost Nova still do not heal. `window.__lastLeech` records the source, the base, and whether the hit skipped leech. The bow still drops the crit flag at impact.
- The text stats line shows `Crit N% xM` from `st.crit` and `st.critMul`. The pixel satchel lines still show chance only. Stage 12 owns that layout.
- Live attack types were not edited. Hellmouth was not edited. `AFFIX` was not given crit damage, flat, increased, more, bonus, conversion, or resist keys.

#### Formulas

```
chance = st.crit + skillChance(skill)
st.crit = 5 + sum(mods.crit)

st.critMul = max(0, 2 + sum(mods.critDmg) / 100)
multiplier = max(0, st.critMul + skillMul(skill))

weapon = irand(min, max)
if roll * 100 < chance and chance > 0: weapon *= multiplier   // once, inside rollDmg

scaled = (weaponOrSpell + flat + flat[type])
       * (1 + (inc + inc[type]) / 100)
       * more * more[type] * packetMore
       * (1 + bonus[type] / 100)
```

`more` and `more[type]` are factors. Missing factors are 1. Each gear `more` mod of `v` multiplies the factor by `(1 + v / 100)`.

Then conversion, then the Stage 2 mitigation order. Physical still uses `DEF / (DEF + 30)` only on the player. Elemental resist and penetration still use the Stage 2 clamp, once.

Pinned, one component, spread not involved (enemy target, no guard, no resist):

| Case | Result |
| --- | --- |
| 10 roll, 100% crit, ×2, no flat | 20, and a second resolve with `critPending` stays 20 |
| 10 roll, ×2, flat 5 | 25. Crit does not multiply the flat |
| 100 + flat 20, then +50% increased | 180, not 170 |
| 10 + flat 10, then ×2 more | 40, not 30 |
| 100 Fire, flat 10, flatFire 5, inc 20, incFire 30, more 1.1, moreFire 1.25, bonusFire 10 | 260.90625, rounds to 261 |
| 100 Physical, 60% to Fire and 60% of the remainder to Cold | 16 Physical + 60 Fire + 24 Cold. Total 100 |
| 100 Physical, 100% to Fire, chain once to Cold, chain edge onward to Lightning | 100 Cold. Not Lightning. Total 100 |
| 100 Physical, half to Fire, Fire pen 40, 0 resist | 50 + 70 = 120. `penHits` stays 1 |
| Power attack full (×2.25) on a 10, 20% leech | enemy loses 23. Heal is 2, from the 10, not from 22.5 |
| Whirlwind, level 1, fire 0, weapon 10, crit | 29 dealt, leech base 29. Without crit, 15 |

Champion crit on an incoming 100 at 0 defense is still 105 and still snuffs the torch, including when `st.critMul` is 9.

#### Proposed attack and hazard mapping

Not applied. The Stage 2 table is still the proposal. Stage 7 retypes spells. Stage 9 touches Hellmouth and Super Elites.

#### Files Modified

- `index.html` — crit step, scale order, conversion chain flag and duplicate rejection, one-shot penetration, life-steal attribution. `version.json` was not edited.
- `tests/stage3-crit-scaling.html` — new harness.
- `COMBAT_REDESIGN_CHANGELOG.md` — this entry and the living sections. The Stage 0, Stage 1, and Stage 2 history entries were not rewritten.
- `STAGE3_REPORT.md` — implementation report for review.

#### Functions Added or Modified

Added: `clearSkillCrit`, `getSkillCrit`, `setSkillCrit`, `critChance`, `critMultiplier`, `critMulLabel`, `rollPlayerCrit`, `sheetNum`, `sheetFactor`, `flatFor`, `incFor`, `moreFor`, `bonusFor`, `scaleAmount`, `scaleOutgoingComponents`, `mitigateElement`, `conversionCarry`, `noteLeechSkip`.

Modified: `computeStats`, `rollDmg`, `leech`, `doAttack`, `castSkill`, `fireBow`, `makeDamagePacket`, `normalizeComponent`, `setConversionEdges`, `getConversionEdges`, `applyConversion`, `resolveEnemyDamage`, `resolvePlayerDamage` (elemental branch calls `mitigateElement`), `damageEnemy`, `newGame`, `continueGame`, the text stats line.

Not modified: `hurtPlayer`'s packet shape, `envHurt`, `castHellmouth`, `tickHellmouth`, `killEnemy`, `pw = fire + level * 2`, `AFFIX`, shop prices, the pixel satchel crit line, Hellmouth.

#### Gameplay Impact

None intended for a current save or a current attack. New stats default to the identity transform, crit multiplier defaults to 2, and no dropped item grants the new mods. A test-only `setSkillCrit` or a hand-set mod changes that hit on purpose.

#### Compatibility Notes

Old items do not have the new keys. `computeStats` leaves flat, increased, and type bonus at 0, more factors at 1, and `critMul` at 2. `mods.fire` is still spell power. A save with `mods.fire = 6` plus test-only `critDmg`, `flat`, `inc`, `more`, and `bonusFire` reloaded the same `st.fire` and the same new stats. Stripping those keys and recomputing returns the new stats to identity while `st.fire` stays 6. Packets and skill-crit overrides are not saved. Conversion edges are cleared on load.

#### Tests Performed

Headless Chrome (Puppeteer, system Google Chrome, cache disabled) against `python3 -m http.server` on 127.0.0.1. Executed on this branch. Not inferred.

**Before any Stage 3 code**, on `6be0fbedfedf1a512b3a8b6b6dfceb21d3233ce4` / tag `combat-redesign-pre-stage3`. 21 legacy files: **804 passed, 102 failed**. `tests/stage1-damage.html`: **71 passed, 0 failed**. `tests/stage2-resist.html`: **73 passed, 0 failed**.

Per-file baseline: `v075` 59/1, `v076` 48/0, `v077` 60/4, `v078` 60/1, `v078-play` 25/1, `v0781` 27/2, `v079` 49/1, `v0710` 36/1, `v07101` 41/1, `v07102` 54/0, `v07103` 24/3, `v0711` 42/5, `v0712` 37/6, `v0713` 32/5, `v0714` 33/8, `v0715` 19/13, `v07151` 8/45, `v07152` 34/3, `v0716` 49/1, `v0717` 47/1, `v0718` 20/0.

Combat anchors on that run failed only the old version pin, or were clean: `v079` version, `v0710` version, `v0717` version, `v0718` 20/0.

**After Stage 3**, same 21 files in one sequential run: **810 passed, 95 failed**. `tests/stage1-damage.html`: **71 passed, 0 failed**. `tests/stage2-resist.html`: **73 passed, 0 failed**. `tests/stage3-crit-scaling.html`: **58 passed, 0 failed**.

No legacy file gained a failure that stayed on a re-run. The count movement is the same layout and spawn noise Stage 1 and Stage 2 already recorded, plus two one-off map checks:

- `v0714.html` 33/8 → 40/1. Seven footer and tab-hitbox names passed. The remaining failure is the version pin. Stage 1 saw both results on unmodified code.
- `v07152.html` 34/3 → 36/1. Two scale hit-tests passed. The remaining failure is the version pin. Stage 1's clean re-run was also 36/1.
- `v076.html` 48/0 → 47/1 on the sequential pass (`b3 damage no snap`, lost 32 and the position check). Three immediate re-runs were 48/0. The spike-walk harness does not use crit or the new scale stats.
- `v077.html` 60/4 → 58/5 on the sequential pass. The floor did not spawn a wall torch, so `f2 wall torch` failed and the following `f2 snuffed` check was not emitted (63 checks instead of 64). A re-run was 60/4 with the same four baseline names (version, version source, f4 pool, f5 shop boss).

`v079`, `v0710`, `v0717`, and `v0718` were unchanged. No combat anchor failed for a formula reason.

`tests/stage3-crit-scaling.html` locks chance boundaries (0, negative, 5, 100, 250), one ×2 application, ×2.5 from `critDmg` 50, a skill multiplier add, flat-then-increased 180, more-after-flat 40, the 261 Fire scale, crit-before-flat 25, a second scale pass that stays 110, conversion totals, one chain hop, duplicate/cycle/self rejection, penetration once, life steal on a tap, a power attack, a guard, and Whirlwind, no leech on bow/Fireball/Frost Nova, the bow crit flag staying off, `mods.fire` still spell power, Fireball 64 Physical against 90 Fire resist, Frost Nova 8, no new loot mods, a save round-trip, champion crit still +5, and Hellmouth still sinking a Super Elite while a marked boss takes 110.

#### Known Issues

Hellmouth still deletes Super Elites. `mods.fire` is still spell power. The proposed type table is not applied. Bow crits still do not mark the floater. Life steal still ignores the power-attack multiplier and enemy mitigation, and still ignores bows, Fireball, and Frost Nova. That is the preserved baseline, recorded on `__lastLeech`. Champion crit is still a separate +5% after mitigation. The pixel sheet still shows crit chance and not the multiplier. The legacy version pins and UI failures above are pre-existing on v0.7.18.

#### Rollback Notes

```
git checkout combat-redesign-pre-stage3
```

That tag is `6be0fbedfedf1a512b3a8b6b6dfceb21d3233ce4`. It is the Stage 2 squash on main. Gameplay version on it is 0.7.18. Do not move the tag.

#### Next Steps

Wait for Jake. Do not merge this PR. Do not deploy. Do not start Stage 4 (status effects). Do not reclassify Fireball, Frost Nova, poison puddles, or lava until Jake accepts or edits the mapping table.

---

### 2026-11-05 — Stage 4: Status Effects

- **Date:** 2026-11-05.
- **Stage:** Stage 4 — Status Effects.
- **Version / Commit:** Gameplay version left at v0.7.18 (`version.json` unchanged). No deploy. Status implementation commit `9ebb6b9b38ec2ccaf54fcc8c45d49a7f80ec532a`. Rollback tag `combat-redesign-pre-stage4` points at `57f085c76907a83f8650ca339b19188b467e82b6` (Stage 3 squash, PR #26, on main).
- **Status:** IMPLEMENTED. Not VERIFIED. Jake reviews. This PR is not merged and is not live. Stage 5 has not been started.
- **Objective:** One status bag for application, duration, ticks, refresh, stacking, expiry, removal, immunity, and source. Give Bleed, Burning, Chill, Freeze, Shock, Poison, and Curse distinct rules. Route damaging ticks through the Stage 1–3 pipeline once, without crit. Leave Frost Nova, poison ground, environmental burn, the chill aura, Hellmouth, and `mods.fire` alone.

#### Existing Behavior

Frost Nova sets `e.slow = 3.5`. Enemy speed uses `0.45` while that timer is up, `0.50` for a boss, and the chill aura multiplies by `1 - pct/100` (aura pct capped at 40 by the item power). Player `slowT` is `0.6` speed for webs and puddles. Poison ground calls `hurtPlayer` every 0.5s as a Physical DoT. Environmental burn is `p.burn` and `envHurt`, a world packet, 8% of max life over 4s. Fear, ram self-stun, and Hellmouth `hmFreeze` are their own fields. Nothing in that set stacks as a typed DoT. No live attack applies bleed, burning, shock, or curse.

#### Changes Implemented

- `ent.statuses` is the only clock for bleed, burning, poison, chill, freeze, shock, and curse. `applyStatus`, `removeStatus`, `clearStatuses`, `tickStatuses`, `getStatus`, and `listStatuses` are the API. A missing bag is the identity: move multiplier 1, shock multiplier 1, curse penalty 0.
- Legacy fields are not moved. `legacyStatusView` reports frost slow, chill aura, `slowT`, environmental burn, fear, and stun mode. Their old code still decrements them. Frost Nova's line is unchanged.
- DoT ticks are one `resolveDamage` packet per interval. Tags are `DoT`. `critPending` is false and `critApplied` is true. `scaleOutgoingComponents` also refuses a crit when `isDot` is set, so a caller cannot turn a tick into a crit by accident. Player-sourced ticks run `scaleAmount` once. Enemy-sourced ticks do not. Mitigation then runs once. Shock, if present, multiplies the mitigated amount once after Hellmouth's ×1.10 and before the floor of 1.
- Stacks are a fixed array on one record. Refresh at the cap replaces the shortest stack's time and raises its base only when the new base is higher. The tick accumulator is not reset by a refresh. One call ticks at most 8 times.
- Chill and freeze are separate. Bosses and Super Elites are freeze immune. Their chill slow is multiplied by `HEAVY_CHILL` (0.4) and their freeze buildup stays 0. A normal freeze does not extend, and expiry sets a 3s lockout.
- Shock is a taken-damage percent, cap 25. It does not change `elementalResistPercent`. Curse can reduce the attacker's outgoing hit and the defender's raw resist. `lifeDrain` is returned by `curseHooks` and is not passed to `leech`. Life steal and the uncapped crit chance are unchanged on purpose.
- Death, `removeEnemy`, and `startFloor` clear the engine bag. A save writes the bag and the lockout only when they are non-empty, so an old save has neither key. `statusSanitize` clamps a loaded bag. Enemy bags ride the existing floor snapshot.
- No affix, no shop price, no attack retype, no Hellmouth edit, no version bump.

#### Formulas and constants

```
bleed    max 5 stacks, 4s, tick every 1s, Physical
burning  max 3 stacks, 3s, tick every 1s, Fire
poison   max 8 stacks, 6s, tick every 1s, Poison
chill    one instance, duration cap 4s, slow cap 60%, +40 buildup per apply
freeze   at buildup 100, duration cap 1.5s, then immune for 3s
shock    one instance, taken% cap 25, duration cap 4s
curse    at most 3 ids, duration cap 6s
         outPenalty cap 30, resistReduction cap 40, lifeDrain cap 10 (not healed)
HEAVY_CHILL = 0.4    bosses and Super Elites
STATUS_MAX_TICKS = 8
```

A stack's first tick is one interval after it is applied, not on the same instant. Ticks in a step happen before that step subtracts duration, so a 4s bleed with a 1s interval deals 4 ticks and then expires. Two 0.5s steps deal one tick. A refresh during the interval does not add a tick.

Request slow on a boss or Super Elite is multiplied by 0.4 before the 60% cap. Freeze buildup on those actors stays 0, and `applyStatus(freeze)` returns `immune`.

Outgoing player tick, once:

```
scaled = (stackSum + flat + flat[type])
       * (1 + (inc + inc[type]) / 100)
       * more * more[type] * packetMore
       * (1 + bonus[type] / 100)
       * curseOut
```

`curseOut` is 1 when the attacker has no curse. There is no crit factor. Then conversion, then Stage 2 mitigation, then shock:

```
taken = 1 + min(25, shock%) / 100     // 1 when unshocked
```

Pinned, one tick, spread forced to 1, no guard:

| Case | Result |
| --- | --- |
| Bleed 10 on an enemy, no mods | 10. A 100% crit at ×9 stays 10 |
| Bleed 10, +100% increased | 20 |
| Burn 100, Fire pen 40, 0 resist | 140, and `penHits` is 1 |
| Burn 10, 50 Fire resist | 5 |
| Poison 10 on the player, DEF 30, 0 Poison resist | 10. Armor does not apply |
| Poison 10 on the player, 90 Poison resist, DEF 30 | 3. The 75 cap binds. Armor still does not |
| Bleed 10 on the player, DEF 30 | 5 |
| Physical 100 into 20% shock | 120. Lightning resist stays 0 |
| Fire 100 into −20 resist and 20% shock | 144. The two multipliers both run |
| Marked boss, Physical 100, no shock | 110 |
| Marked boss, Physical 100, 20% shock | 132 |
| Curse outPenalty 30 on the attacker, Physical 100 | 70 |
| Defender Fire resist 50, curse resist cut 20, Fire 100 | 70 |
| 50% chill on a rat | move multiplier 0.5. A third +40 buildup freezes |
| 50% chill on a boss or Super Elite | slow 20%, move 0.8, freeze `immune` |
| Six bleed applies of base 4, then one of base 9 | 5 stacks, tick sum 25 |

#### Files Modified

- `index.html` — status bag, DoT packets, shock and curse hooks, movement multiplier, save field, legacy view. `version.json` was not edited.
- `tests/stage4-status.html` — new harness.
- `COMBAT_REDESIGN_CHANGELOG.md` — this entry and the living sections. The Stage 0–3 history entries were not rewritten.
- `STAGE4_REPORT.md` — implementation report for review.

#### Functions Added or Modified

Added: `applyStatus`, `removeStatus`, `clearStatuses`, `getStatus`, `listStatuses`, `tickStatuses`, `statusMoveMul`, `shockTakenMul`, `curseOutMul`, `curseResistCut`, `curseHooks`, `legacyStatusView`, `statusSanitize`, `statusSaveBag`, `dealDotTick`.

Modified: `elementalResistPercent` (subtracts a curse cut, which is 0 when there is no curse), `scaleOutgoingComponents` (no crit on a DoT, curse penalty only when it is not 1), `resolvePlayerDamage`, `resolveEnemyDamage`, `update`, `updateEnemies`, `gridEnemyUpdate`, player and enemy speed, `removeEnemy`, `die`, `startFloor`, `save`, `continueGame`, `worldRestore`, `drawEnemy`.

Not modified: `castHellmouth`, `tickHellmouth`, `castSkill` Frost Nova, `hurtPlayer`'s packet shape, `envHurt`, `updateBurn`, `igniteBurn`, `leech`, `rollDmg`, `AFFIX`, shop prices, `mods.fire`.

#### Gameplay Impact

None for a current save and a current attack. No dropped item applies a status. A hand-applied status changes that actor until it expires.

#### Compatibility Notes

Old saves have no `statuses` key. Load still recomputes the Stage 3 sheet. A save that does carry a bag restores it, and `statusSanitize` drops unknown ids and clamps stacks to the caps above. `startFloor` clears the player's bag so a new floor does not keep a bleed. World restore still clears `slowT`. Environmental burn is still not the Burning status, so both can exist and they do not add into one tick.

#### Tests Performed

Headless Chrome, SwiftShader, cache disabled. Details and the before/after file counts are in [Stage 4 executed results](#stage-4-executed-results). `tests/stage4-status.html` was 75/0: stack caps, refresh, tick phase, immunity, armor versus resist, shock versus negative resist, Hellmouth plus shock, boss and Super Elite chill, freeze lockout, curse hooks, life steal unchanged, poison ground still Physical, environmental burn still world, Frost Nova slow untouched, save/load, forged-bag clamp, death cleanup, and the Super Elite sink.

#### Known Issues

Hellmouth still deletes Super Elites. `mods.fire` is still spell power. DoT ticks do not crit. Life steal still ignores mitigation and the power-attack multiplier, and crit chance is still uncapped. Those two are deferred balance, not Stage 4 bugs. Shock does not multiply world packets. A player DoT is still stopped by i-frames, and the tick is consumed. `hmFreeze` pauses status ticks for the sink. Grid-AI freeze holds the body while the shared AI clock keeps moving, so the glide can catch up when the freeze ends. Richer status art is Stage 11. Gear that applies these statuses is Stage 10.

#### Rollback Notes

```
git checkout combat-redesign-pre-stage4
```

That tag is `57f085c76907a83f8650ca339b19188b467e82b6`. It is the Stage 3 squash on main. Gameplay version on it is 0.7.18. Do not move the tag.

#### Next Steps

Wait for Jake. Do not merge this PR. Do not deploy. Do not start Stage 5 (stagger, poise, and crowd control). Do not reclassify Fireball, Frost Nova, poison puddles, or lava.

---

### 2026-11-05 — Stage 5: Stagger, Poise, and Crowd Control

- **Date:** 2026-11-05.
- **Stage:** Stage 5 — Stagger, poise, and crowd control.
- **Version / Commit:** Gameplay version left at v0.7.18 (`version.json` unchanged). No deploy. Implementation commit `1aa5657176f80627e7dcd9f92d6349d670aa85d8`. Rollback tag `combat-redesign-pre-stage5` points at `d4fbc3c6904c0ddbc96b6d2b6825514e2420b896` (Stage 4 squash on main, PR #27).
- **Status:** IMPLEMENTED. Not VERIFIED. Jake reviews. This PR is not merged and is not live. Stage 6 has not been started.
- **Objective:** Add a poise resource separate from HP, a short stagger when it breaks, and one crowd-control order for stagger, stun, knockback, chill, and freeze. Differentiate light, heavy, power, and skill hits. Keep bosses and Super Elites from being stun-locked. Do not retune HP damage, attack timing, `mods.fire`, or Hellmouth.

#### Existing Behavior

There was no poise and no stagger. Knockback was an `kx`/`ky` impulse (`0.1` on bosses, `0.3` on golems, `1` otherwise). Ram wall-hits and boss charges set `mode = 'stun'` on their own clocks. Freeze and chill were Stage 4 statuses. Frost Nova still wrote `e.slow = 3.5`. Webs, brine, and the chill aura were separate multipliers with no combined floor. Boss awaken set `bossIntro = 2.8` and `patCd = 1.4`. That banner was not an HP immunity. Super Elite drop/taunt and the crab shell were HP immunities. Boss and Super Elite shields absorbed HP only.

#### Changes Implemented

- Poise is a number on the actor (`poise`, `poiseMax`, `poiseDelay`). It is not a second status clock. Stagger is a Stage 4 status, `STATUS.stagger`. Freeze, chill, shock, bleed, burning, poison, and curse are unchanged. No live skill calls `applyStatus` for those. Frost Nova still only sets `e.slow`.
- Outgoing poise is a flat amount by attack class, then the target's `taken` multiplier. It does not pass through armor, resist, barrier, or the boss/Super Elite shield. A successful block deals 0. A guard's front glance multiplies poise by `GUARD_POISE` (0.2), the same factor already used on that hit's knockback. DoTs, world packets, and plain Direct hits (thorns) deal 0.
- Breaking poise applies stagger for the tier duration, refills poise to 45% of max, and interrupts the current action (player swing, charge, cast, and roll; enemy mode, busy, and that actor's telegraphs). A second stagger does not extend the first. Expiry starts `staggerImmune`. A break during freeze, legacy stun, or that immunity is refused. Repeated breaks inside a 6s chain shorten duration by `0.65` down to a `0.12s` floor. `poiseBreaks` is capped at 8.
- Hard crowd control precedence is freeze, then stagger, then legacy stun. Knockback still displaces and does not root. Slows never multiply below `MIN_MOVE_MUL` (0.2) unless the actor is frozen or staggered, which are real stops at 0. Super Elites still ignore the chill aura. Their frost slow stays `0.5`.
- Boss awaken (`bossIntro > 0` on that boss) blocks poise and stagger and does not block HP. Super Elite drop/taunt and the crab shell still block both. Boss and Super Elite shields still absorb HP and do not absorb poise. Hellmouth is unchanged. A sinking actor is not interrupted.
- `tickStatuses` still performs at most `STATUS_MAX_TICKS` (8) interval crossings per status per call. Time beyond the remaining duration does not create extra ticks. Intervals past the cap stay on `rec.debt`, bounded to 64 intervals, and are paid on later calls. Anything past that bound is counted on `out.dropped` and is not paid later. A 4s bleed still ticks 4 times, including when one call passes 20s.
- Saves write `poise` only when the bar is not full. An old save has no key and loads full poise. Stagger rides the existing status bag. `version.json` was not edited.

#### Formulas and constants

```
POISE_CLASS_DMG  light 18, heavy 34, power 52, skill 14, none 0
power charge     amount * (0.70 + 0.30 * frac)     frac 0 at the 1.50x charge, 1 at 2.25x
skill splash     amount * more, only when 0 < more < 1
POISE_IN         light 10, heavy 22, power 34, skill 8
                 player-facing: trash contact, boss contact or charge, Super Elite powerup, projectile or Super Elite swing
GUARD_POISE 0.2    MIN_MOVE_MUL 0.2    POISE_RECOVER 0.45
POISE_DR 0.65      POISE_DR_FLOOR 0.12s    POISE_CHAIN 6s    POISE_BREAKS_CAP 8
```

| Tier | Who | Max | Taken | Stagger | Immune | Regen | Delay |
| --- | --- | --- | --- | --- | --- | --- | --- |
| light | bat, rat, flies, slimelet, wisp, spider, slime | 50 | 1 | 0.55s | 1.6s | 0.45 /s | 2.2s |
| medium | everyone else | 80 | 1 | 0.50s | 2.0s | 0.40 /s | 2.4s |
| heavy | golem, guard, knight, ram, crab, drowned | 140 | 0.75 | 0.45s | 2.5s | 0.34 /s | 2.6s |
| champion | `elite`, not a boss | 120 | 0.70 | 0.40s | 2.8s | 0.34 /s | 2.6s |
| super | Super Elite | 360 | 0.30 | 0.32s | 4.8s | 0.24 /s | 3.2s |
| boss | `T.boss` | 560 | 0.20 | 0.28s | 5.5s | 0.20 /s | 3.4s |
| player | the player | 140 | 1 | 0.35s | 3.2s | 0.50 /s | 2.4s |

Regen is a fraction of max per second, and it waits out `poiseDelay` after each poise hit. Delay that ends mid-step spends the leftover time on regen.

What does not change the poise number: `DEF/(DEF+30)`, elemental resist, the player barrier, boss and Super Elite shields, shock, Hellmouth's ×1.10, ram armor. What does: the class amount, the tier `taken` multiplier, a guard glance ×0.2, and a block (zero).

Attack class, from the packet, not from the weapon:

| Class | Live source | Poise |
| --- | --- | --- |
| light | melee tap, bow impact | 18 |
| heavy | Whirlwind | 34 |
| power | charged melee, 36.4 at the minimum charge to 52 at full | 52 × (0.70 + 0.30 × frac) |
| skill | Fireball, Frost Nova. Splash uses the 0.6 more | 14, or 8.4 on a 0.6 splash |
| none | thorns, DoTs, world packets | 0 |

Boss light hit: `18 × 0.20 = 3.6`. First stagger at 156 hits. Boss full-power hit: `52 × 0.20 = 10.4`. First stagger at 54 hits. A scripted 8-damage light loop on a 5000 HP boss lost 640 HP in 80 hits and did not stagger (poise left 272). The same 8-damage power loop staggered on hit 54 and had lost 432 HP. Per-hit HP was 8 in both loops. Floor-5 Mother Murk is 840 HP plus a 210 shield. At 8 HP a light hit, that pool ends before 156 hits, so light attacks do not stagger her. A full-power loop can open one 0.28s stagger and then waits 5.5s.

Player versus a boss contact: incoming poise 22, break on the 7th hit. Eight hits of 10 dealt 80 HP. The break did not change the HP.

Crowd control: freeze, else stagger, else legacy stun, else knockback (displacement only), else slow. Freeze and stagger are speed 0. Stacked slows floor at 0.2. Frost alone stays 0.45 (0.50 on a boss or Super Elite). Aura 40 stays 0.6. Chill 60 stays 0.4. Player `slowT` stays 0.6. Grid frost weight stays 1.8. A 400-step spam with a 0.20s stagger and a 0.40s immunity never held an enemy through the gap, and `poiseBreaks` stayed at or under 8.

`STATUS_MAX_TICKS` is still 8. A 4s bleed at a 1s interval deals 4 ticks in forty 0.1s steps, in one 4s step, and in one 20s step. The 20s step does not deal an 8th tick, and the next call deals 0. A 0.25s interval over 40s (160 intervals) deals 8 immediately, keeps 64 intervals of debt, reports 88 dropped, and the following calls pay the debt for 72 ticks total. The drop is on `out.dropped`. It is not silent, and those intervals are not paid twice.

#### Files Modified

- `index.html` — poise, stagger status, crowd-control order, movement floor, tick debt. `version.json` was not edited.
- `tests/stage5-poise.html` — new harness.
- `tests/stage4-status.html` — the negative "stage 5 does not exist" check now locks that stagger is a status in the same bag. Count stays 75.
- `COMBAT_REDESIGN_CHANGELOG.md` — this entry and the living sections. The Stage 0–4 history entries were not rewritten.
- `STAGE5_REPORT.md` — implementation report for review.

#### Functions Added or Modified

Added: `ensurePoise`, `resetPoise`, `poiseSanitize`, `poiseSaveVal`, `poiseTierOf`, `poiseTierName`, `applyPoiseDamage`, `notePoise`, `poiseClassOf`, `poiseHitAmount`, `poiseFromPacket`, `staggerDuration`, `beginStaggerImmune`, `tickPoise`, `ccImmobilized`, `ccState`, `ccMoveMul`, `seMoveMul`, `gridSlowMul`, `interruptControl`, `immuneFor`, `poiseBlockedReason`.

Modified: `applyStatus`, `tickStatuses`, `statusMoveMul`, `statusBlock`, `statusSanitize`, `resolveEnemyDamage`, `resolvePlayerDamage`, `makeDamagePacket`, `damageEnemy`, `doAttack`, `castSkill`, `fireBow`, `update`, `updateEnemies`, `bossAI`, `gridEnemyUpdate`, `seTick717`, `spawnEnemy`, `spawnBoss`, `seSpawn717`, `startFloor`, `save`, `die`.

Not modified: `castHellmouth`, `killEnemy`'s Super Elite path, `mods.fire` / `pw`, attack swing times, `PWR` damage multipliers, the armor curve, resist, the four shield systems.

#### Gameplay Impact

HP formulas are unchanged. A hit that does not break poise is the Stage 4 hit plus a poise number. Trash can be staggered: a light enemy breaks on the third tap or one full power attack, then cannot act for 0.55s and cannot be re-staggered for 1.6s. Bosses and Super Elites take a fraction of that poise and, once broken, get a short stagger and a multi-second immunity. The awaken banner blocks poise only. Measured boss HP loss per hit did not change. A player who eats seven boss contacts in a row is staggered for 0.35s. Curse life drain is still not healed. Life steal and the uncapped crit chance are still the Stage 3 behavior.

#### Compatibility Notes

Old saves have no `poise` key. Load fills the bar. A partial bar is saved as `{v, d, i, b, c}` and `poiseSanitize` unpacks it. Enemy poise rides the floor snapshot. `startFloor` and death reset the player's bar. Forged `poiseMax` above 5000 is clamped. `mods.fire` is still spell power. Hellmouth still deletes Super Elites.

#### Tests Performed

Headless Chrome, SwiftShader, cache disabled. Counts and the per-name diff against the Stage 4 checkpoint are in [Stage 5 executed results](#stage-5-executed-results). `tests/stage5-poise.html` was 78/0.

#### Known Issues

Hellmouth still deletes Super Elites. `mods.fire` is still spell power. Curse `lifeDrain` is stored and is not added to `leech`. Life steal still ignores mitigation and the power-attack multiplier. Crit chance is still uncapped. Those stay deferred. A hitch larger than 72 intervals on one status reports `out.dropped` and does not pay those intervals later. Grid AI still does not tick while frozen or staggered, so the shared clock can catch up when the stop ends. Weapon identity is Stage 6. Elemental retyping is Stage 7.

#### Rollback Notes

```
git checkout combat-redesign-pre-stage5
```

That tag is `d4fbc3c6904c0ddbc96b6d2b6825514e2420b896`. It is the Stage 4 squash on main, PR #27. Gameplay version on it is 0.7.18. Do not move the tag. The older tags `combat-redesign-pre-stage1` through `combat-redesign-pre-stage4` were not moved.

#### Next Steps

Wait for Jake. Do not merge this PR. Do not deploy. Do not start Stage 6 (weapon identity and attack timing). Do not reclassify Fireball, Frost Nova, poison puddles, or lava.

---

### 2026-11-05 — Stage 6: Weapon Identity and Attack Responsiveness

- **Date:** 2026-11-05.
- **Stage:** Stage 6 — Weapon identity and attack responsiveness.
- **Version / Commit:** Gameplay version left at v0.7.18 (`version.json` unchanged). No deploy. Implementation commit `4650ac21917b029950dac18d0b3c364bf959eb8d`. Rollback tag `combat-redesign-pre-stage6` points at `6eecf2439525da17acf9479688de185d4b8a6749` (Stage 5 squash on main, PR #28).
- **Status:** IMPLEMENTED. Not VERIFIED. Jake reviews. This PR is not merged and is not live. Stage 7 has not been started.
- **Objective:** Give each weapon family its own swing, reach behavior, and poise, and make attacks answer the button without an animation-cancel. Keep hit points and the attack period where they were. Do not retype elements, do not retune `mods.fire`, and do not change Hellmouth.

#### Existing Behavior

Every melee tap used the same cone (`1.1` rad), the same instant hit, and the same poise class. `p.atkCd = 0.45 / aspd` and `p.swing = 0.22` were set in the same call that dealt damage, so the blade trailed the number. A held bow used the melee charge ring and then fired a normal arrow. Player arrows moved, then tested a strict `< radius`. One step of `0.05s` at `BOW_SPEED` 220 travels exactly 11px. A hurtbox of `8 + 3` fails that test on open floor, so the arrow dealt 0 unless a wall, torch, or prop killed it and the looser `+3` search connected. That is the Stage 3 flake `bow crit flag stays off the floater`. The crit flag on that floater was already false on purpose. The miss was the failure.

Reach was already per icon: fists 18, sword 24, axe 28, maul 34, staff 40, bow `220 * 0.95`. Item `min`, `max`, and `spd` were already per base. Those damage numbers were not the problem. The swing, the cone, the shove, and the poise were the same shape with different labels.

#### Changes Implemented

- Families are `fist`, `sword`, `axe`, `maul`, `staff` (spear uses the staff row), and `bow`, read from `slot` and `icon`. Nothing new is written into the save. A weapon card gains one identity line.
- The tap period stays `0.45 / aspd`. Windup is a fraction of that period. The hit is committed at the end of the windup. Recovery is the remainder. Time between committed hits stays the old period.
- `armAttack` / `beginAttack` / `queueAttack` schedule that windup. One buffer slot lives through the rest of the current swing plus `0.16s`. It does not stack and it does not skip the next windup. A roll, stagger, or freeze during windup drops the uncommitted hit and the buffer, and leaves `atkCd` running.
- `doAttack`, `fireBow`, and `powerAttack074` still resolve inside the call. A direct call during windup clears the pending swing and applies that one hit. It does not add a second.
- A bow never enters the melee charge. `powerAttack074` on a bow is a normal arrow. The power multiplier stays on melee only.
- Hitstop holds the swing pose, at most `0.06s` (`HITSTOP_CAP`). A power hit multiplies the family hitstop by `1.15` and then the cap. Cooldown, input, and projectiles keep the full `dt`. The pose hold does not add recovery.
- Outgoing poise still ignores armor, resist, barrier, and boss or Super Elite shields. Block still zeroes it. A guard glance is still `×0.2`. The Stage 5 class table remains the amount when the packet does not name a family, and it is also the fist and sword row. A live swing stamps `weaponFamily`. Power charge still scales by `0.70 + 0.30 * frac`. A splash `more` in `(0, 1)` still scales the amount once.
- Player arrows use the segment from the previous position through the new one, with `radius + 0.51` and an inclusive test, and they ignore dead bodies. Impact still passes `crit: false`. `rollDmg` is the only crit multiply. `critApplied` stays set so the resolver does not multiply again.

#### Formulas and constants

```
period = 0.45 / aspd
windup = period * family.windup
recovery = period - windup
buffer = one slot, remaining cooldown + remaining windup + 0.16s
hitstop = min(0.06, family.hitstop * (power ? 1.15 : 1))
power poise = family.power * (0.70 + 0.30 * frac)
splash poise = family.skill * more, only when 0 < more < 1
```

`frac` is 0 at the 1.50× charge and 1 at 2.25×. Full-charge poise is the family power number. Fist and sword power stay 52, so a full sword charge is still 52 and a minimum sword charge is still 36.4.

| Family | Who | Windup | Arc | Knockback | Hitstop | Light | Heavy | Power | Skill | Reach |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fist | no weapon | 0.12 | 1.10 | 1.00 | 0.022 | 18 | 34 | 52 | 14 | 18 |
| sword | sword | 0.18 | 1.10 | 1.00 | 0.030 | 18 | 34 | 52 | 14 | 24 |
| axe | axe | 0.28 | 1.55 | 1.20 | 0.040 | 28 | 46 | 72 | 14 | 28 |
| maul | maul | 0.38 | 0.78 | 1.45 | 0.055 | 40 | 60 | 96 | 12 | 34 |
| staff | staff, spear | 0.22 | 0.48 | 0.75 | 0.022 | 12 | 24 | 36 | 22 | 40 |
| bow | bow | 0.20 | no melee cone | arrow unchanged | 0.018 | 11 | 22 | 11 | 16 | 209 |

Reach was not retuned. Heavy is Whirlwind. Skill is Fireball and Frost Nova. A 0.6 Fireball splash on a staff is `22 * 0.6 = 13.2`. On a sword it is still `14 * 0.6 = 8.4`.

Light enemy (poise 50): a sword tap breaks on hit 3, an axe or a maul on hit 2, a staff or a bow on hit 5. A full sword or maul power breaks on hit 1.

Boss (560, taken 0.20): sword tap is still `3.6` and still breaks on hit 156. Maul tap is `8` and breaks on hit 70. Sword full power is still `10.4` and hit 54. Maul full power is `19.2` and hit 30. The break is still `0.28s` and the immunity is still `5.5s`.

Axe versus staff at about `1.25` rad and 18px: the axe connects, the sword, maul, and staff do not. That is the cone, not a damage buff. Point-blank inside `8 + radius` is still a hit from every family, which is the old rule.

#### Files Modified

- `index.html` — families, scheduler, bow draw, arrow segment, pose hitstop, poise stamp. `version.json` was not edited.
- `tests/stage6-weapons.html` — new harness.
- `tests/stage5-poise.html` — the sentinel `no stage 6 weapon pass` is now `stage 6 weapon pass is explicit`. Count stays 78.
- `COMBAT_REDESIGN_CHANGELOG.md` — this entry and the living sections. The Stage 0–5 history entries were not rewritten.
- `STAGE6_REPORT.md` — implementation report for review.

#### Functions Added or Modified

Added: `weaponFamilyId`, `weaponFamilyOf`, `weaponArc`, `weaponKnock`, `attackPeriod`, `attackBuf`, `clearAttackArm`, `queueAttack`, `impactFeedback`, `armAttack`, `beginAttack`, `commitArmed`, `tickAttackSched`, `attackState`, `projEnemyAlong`.

Modified: `doAttack`, `fireBow`, `castSkill`, `powerAttack074`, `updateAttack074`, `clickAttack074`, `update`, `startRoll`, `interruptControl`, `poiseHitAmount`, `makeDamagePacket`, `damageEnemy`, `breakPropsAt`, `drawPlayer`, `drawBow716`, `itemLines`, the projectile step.

Not modified: `rollDmg`, `resolveDamage`'s mitigation order, `PWR` damage multipliers, `weaponReach713` numbers, `castHellmouth`, `killEnemy`'s Super Elite path, `mods.fire` / `pw`, elemental types on live attacks, `version.json`.

#### Gameplay Impact

A sword tap still deals the same hit points on the same period, and it still spends 18 poise. The number arrives after a short windup instead of on the press. An axe reaches a wider cone and staggers sooner, and it swings later inside the same period. A maul is narrower, slower because its `spd` was already 0.7, and it spends the most poise. A staff is a thrust, spends less melee poise, and spends more when the spell is the attack. A bow stays ranged, spends 11 poise on a hit, and a held draw is not a power attack. Hitstop is a short pose hold. It does not freeze the cooldown.

Time-to-kill on a pinned midpoint hit, spread 1, crit off, is the same before and after. The pools are 80 HP and a 1050 HP boss pool (floor-5 Mother Murk's 840 plus the 210 shield). Period is `0.45 / spd`.

| Family | Pinned hit | Period | Hits to 80 | Seconds to 80 | Hits to 1050 | Seconds to 1050 |
| --- | --- | --- | --- | --- | --- | --- |
| fists | 2 | 0.450 | 40 | 18.000 | 525 | 236.250 |
| sword | 4 | 0.450 | 20 | 9.000 | 263 | 118.350 |
| axe | 5 | 0.500 | 16 | 8.000 | 210 | 105.000 |
| staff | 5 | 0.450 | 16 | 7.200 | 210 | 94.500 |
| maul | 19 | 0.643 | 5 | 3.214 | 56 | 36.000 |
| bow | 7 | 0.429 | 12 | 5.143 | 150 | 64.286 |

The pinned hit is `round((sheetMin + sheetMax) / 2)` on the level-1 base, then `st.min = st.max = that`. The before run produced the same six rows. Power-attack time-to-kill was not retuned: `round(pin * 2.25)` is still the melee power hit (fists 5, sword 9, axe 11, staff 11, maul 43). A bow power press deals the pin, not `pin * 2.25`.

#### Compatibility Notes

Old saves have the same weapon fields (`min`, `max`, `spd`, `icon`, `mods.fire`, `bow`). Load does not require attack phase, windup, or hitstop. Those timers start empty. A full poise bar is still omitted from the save. An old save with no `poise` key still loads full. `fixItem` still keeps a sword's mods. Hellmouth still deletes Super Elites. Frost Nova still writes `e.slow = 3.5` and still does not apply engine chill. Live attacks stay Physical.

#### Tests Performed

Headless Chrome, SwiftShader, cache disabled. Counts and the per-name diff against tag `combat-redesign-pre-stage6` are in [Stage 6 executed results](#stage-6-executed-results). `tests/stage6-weapons.html` was 47/0.

#### Known Issues

Hellmouth still deletes Super Elites. `mods.fire` is still spell power. Curse life drain, life steal, and the uncapped crit chance are still untouched. Elemental retyping is Stage 7. A direct `doAttack` is still instant, so a scripted call does not show the windup; the input path does. Environment clicks that zero `atkCd` and call `doAttack` still resolve in that call. That path was already instant. Hitstop does not freeze enemy projectile motion, so a fast arrow is not stalled by the pose hold.

#### Rollback Notes

```
git checkout combat-redesign-pre-stage6
```

That tag is `6eecf2439525da17acf9479688de185d4b8a6749`. It is the Stage 5 squash on main, PR #28. Gameplay version on it is 0.7.18. Do not move the tag. The older tags `combat-redesign-pre-stage1` through `combat-redesign-pre-stage5` were not moved.

#### Next Steps

Wait for Jake. Do not merge this PR. Do not deploy. Do not start Stage 7 (skill retyping and build specialization). Do not reclassify Fireball, Frost Nova, poison puddles, or lava. Do not change Hellmouth.

### 2026-11-05 — Stage 7: Skill System and Build Specialization

- **Date:** 2026-11-05.
- **Stage:** Stage 7 — Skill system and build specialization.
- **Version / Commit:** Gameplay version left at v0.7.18 (`version.json` unchanged). No deploy. Implementation commit `0ec7ad620d390eb5dfc98679c3f535920a15ab15`. Rollback tag `combat-redesign-pre-stage7` points at `29c81bb825c98816606e75c80985305becf5a0c8` (Stage 6 squash on main, PR #29).
- **Status:** IMPLEMENTED. Not VERIFIED. Jake reviews. This PR is not merged and is not live. Stage 8 has not been started.
- **Objective:** Give Fireball, Whirlwind, Frost Nova, and Hellmouth distinct jobs. Type the three damage skills. Keep `mods.fire` as general spell power. Connect Fireball and Frost Nova to the Stage 4 status bag without a permanent lock. Add one build choice per damage skill. Do not raise the zero-resist hit numbers. Do not touch Hellmouth's Super Elite deletion, Stage 8 resist tables, Stage 9 boss patterns, or Stage 10 loot.

#### Existing Behavior

`pw = st.fire + level * 2` scaled all three skills. Every live hit was Physical, so enemy resist did nothing. Fireball stored `(8 + pw * 1.4) * amp`, splashed at 0.6 inside 18px, and did not crit or leech. Whirlwind was one Physical number, `(weaponRoll * 1.4 + pw * 0.5) * amp`, and the crit was already inside the weapon roll. Frost Nova was `(6 + pw * 1.1) * amp`, set `e.slow = 3.5`, and did not apply engine chill. Hellmouth sank anything that was not `T.boss`. Lava and on-fire damage were world packets. Poison ground was a Physical DoT through `hurtPlayer`, so armor reduced it. Cultist, wisp, siren, exarch, and seer shots were Physical, so armor reduced them too.

#### Changes Implemented

- Fireball's hit is Fire. The stored magnitude is still `(8 + pw * 1.4) * amp`. Splash, speed, life, crit refusal, and the life-steal skip are unchanged on the base build.
- Frost Nova's hit is Cold. The magnitude is still `(6 + pw * 1.1) * amp`. It still writes `e.slow = 3.5` before the hit.
- Whirlwind is two components. Physical is `weaponRoll * weaponMul * amp` and is the only part that crits. Fire is `pw * 0.5 * amp` and does not crit. At identity scale and 0 Fire resist the sum rounds to the old integer. Life steal still uses that pre-mitigation sum.
- `mods.fire` and `st.fire` stay the general spell-power total. `st.spell` is the same number. The affix line now says `+N Spell Power`. Old saves and old items keep the key `fire`. The value is not copied into `flatFire` or `bonusFire`, and it still does not touch weapon rolls.
- Base Fireball applies Burning at 100% on a core hit and 40% on the outer ring, duration 3s, stack cap 3, base damage 0. A zero base does not enter the resolver, so the tick adds nothing. Kindling is the build that gives the burn a real base.
- Base Frost Nova applies Chill with slow 0% and 34 freeze buildup for 3.5s. The legacy slow still owns movement, so the move multiplier stays 0.45. Buildup expires before the 4.5s cooldown, so one nova cannot freeze. Bosses and Super Elites still take `HEAVY_CHILL` and cannot freeze.
- Each damage skill has a base row and two builds, chosen in the skill-key panel and saved on the player. An old save with no `skillSpec` loads the three base rows. `spellBar` and `learned` are unchanged.
- Non-boss, non-Super-Elite shots: cultist Shadow, wisp Lightning, siren Cold, exarch Shadow, seer Lightning. Spider webs, bone arrows, contact, blasts, and poison ground stay Physical. `eShoot` strips a type from a boss or a Super Elite. Boss patterns are untouched.
- Lava, on-fire, acid, and the other `envHurt` callers stay world packets and still skip resist, armor, Ethereal Shield, and block. Poison ground stays a Physical DoT, so armor still reduces it and poison resist does not. That is a decision, not an accidental leftover. Retyping poison ground would skip armor and increase the damage a defended player takes, and the same hazard function serves boss lobs.

#### Formulas

```
pw = st.fire + level * 2
amp = 1 + skillAmp(i) / 100
fireball = (8 + pw * 1.4) * amp          type Fire, then splash more
whirl physical = weaponRoll * weaponMul * amp
whirl rider = pw * 0.5 * amp             type Fire, no crit
frost = (6 + pw * 1.1) * amp             type Cold
```

`weaponRoll` already includes the crit. The resolver does not crit again. Scale, conversion, resist, and penetration run once per component inside the existing resolver. A global `flat`, `inc`, or `more` now applies once to each Whirlwind component. No loot rolls those modifiers. At the identity defaults the sum is the old number.

| Build | What changes | What stays |
| --- | --- | --- |
| Fireball Bolt | base | radius 18, core 4, outer ×0.6, burn base 0 |
| Fireball Kindling | no outer ring | the core hit. Burn base is `max(1, round(pw * 0.2))` per tick |
| Fireball Scatter | radius 28, outer ×0.45 | the core hit |
| Whirlwind Spin | base | radius 32, weapon ×1.4, knock ×1 |
| Whirlwind Wide | radius 48, weapon ×1.05 | the rider. Less damage per target |
| Whirlwind Keen | radius 22, knock ×1.35 | the hit number |
| Frost Nova | base | radius 70, buildup 34, chill slow 0 |
| Frost Whiteout | radius 52, buildup 55, chill slow 15%, duration 4.8s | the hit. A second cast freezes once, then the 3s lockout |
| Frost Glass | radius 88, buildup 15 | the hit |

Kindling's burn is extra damage over time on one target, paid for by losing the splash. It is not part of the base time-to-kill. Whiteout cannot chain freezes: the freeze does not refresh, expiry sets a 3s lockout, and a lockout attempt spends the buildup without freezing. Bosses stay at 40% chill and 0 buildup.

#### Damage at zero resist

Same measurement as Stage 6. Spread 1, crit off unless named, mana assumed available, period is the skill cooldown or `0.45 / spd`. Pools are 80 HP and a 1050 HP boss pool. The before run is tag `combat-redesign-pre-stage7`. The after run is the same integers.

| Attack | Hit before | Hit after | Seconds to 80 | Seconds to 1050 |
| --- | --- | --- | --- | --- |
| Fists | 2 | 2 | 18.000 | 236.250 |
| Sword | 4 | 4 | 9.000 | 118.350 |
| Axe | 5 | 5 | 8.000 | 105.000 |
| Staff | 5 | 5 | 7.200 | 94.500 |
| Maul | 19 | 19 | 3.214 | 36.000 |
| Bow | 7 | 7 | 5.143 | 64.286 |
| Fireball, level 1, spell power 0 | 11 | 11 | 3.600 | 43.200 |
| Fireball, level 10, spell power 0 | 36 | 36 | 1.350 | 13.500 |
| Fireball, level 10, spell power 20 | 64 | 64 | 0.900 | 7.650 |
| Whirlwind, pin 10 | 15 | 15 | 9.600 | 112.000 |
| Whirlwind, pin 10, crit | 29 | 29 | 4.800 | 59.200 |
| Whirlwind, pin 4 | 7 | 7 | 19.200 | 240.000 |
| Frost Nova, level 1, spell power 0 | 8 | 8 | 45.000 | 594.000 |
| Frost Nova, level 10, spell power 0 | 28 | 28 | 13.500 | 171.000 |
| Frost Nova, level 10, spell power 20 | 50 | 50 | 9.000 | 94.500 |

Against a resist the type matters. Level-10 Fireball at spell power 20 into 90 Fire resist (cap 90) deals 6, not 64. Seconds to 80 become 6.300 and seconds to 1050 become 78.750. Level-1 Frost Nova into 90 Cold resist deals 1, not 8. A Whirlwind at level 10, spell power 20, pin 10, into 50 Fire resist deals 24 (14 Physical + 10 Fire) instead of 34, and the life-steal base stays 34.

A cultist bolt of 20 into DEF 30 was 10 when it was Physical. As Shadow, with 0 Shadow resist, it is 20. With 90 Shadow resist it is 2. Armor no longer reduces that bolt. Contact, arrows, webs, blasts, poison ground, bosses, and Super Elites still use armor.

#### Files Modified

- `index.html` — skill types, builds, status hooks, five non-boss bolt types, spell-power alias and affix line. `version.json` was not edited.
- `tests/stage7-skills.html` — new harness.
- `tests/stage1-damage.html`, `tests/stage2-resist.html`, `tests/stage3-crit-scaling.html`, `tests/stage4-status.html`, `tests/stage5-poise.html`, `tests/stage6-weapons.html` — sentinels that locked "skills stay Physical" or "Frost Nova does not chill" now lock the Stage 7 contract. Counts are unchanged.
- `COMBAT_REDESIGN_CHANGELOG.md` — this entry and the living sections. Stage 0–6 history entries were not rewritten.
- `STAGE7_REPORT.md` — implementation report for review.

#### Functions Added or Modified

Added: `incomingDamageType`, `skillSpecSanitize`, `skillSpecId`, `skillBuild`, `setSkillSpec`, `skillSpecSave`, `spellPower`, `skillStatusRoll`, `igniteFromSkill`, `chillFromNova`.

Modified: `castSkill`, the player-projectile impact, `damageEnemy` (optional components), `hurtPlayer` (optional `dmgType`), `eShoot` (drops a type on bosses and Super Elites), cultist / wisp / siren / exarch / seer shot options, `computeStats` (`st.spell`), `renderSkillsPanel`, `save`, `continueGame`, the affix line for key `fire`.

Not modified: `castHellmouth`, `tickHellmouth`, `killEnemy`'s Super Elite path, `envHurt`, poison-ground `hurtPlayer`, `rollDmg`, weapon family numbers, `PWR` multipliers, `version.json`.

#### Gameplay Impact

At 0 resist the three skills and the six weapons kill in the same time as Stage 6. Fire resist now reduces Fireball and only the Whirlwind rider. Cold resist reduces Frost Nova. The weapon half of Whirlwind still ignores elemental resist. Base Burning adds a marker and no damage. Base Chill does not add a second slow and does not freeze. Kindling, Scatter, Wide, Keen, Whiteout, and Glass change reach, splash, shove, chill, or a burn, and only Kindling adds damage, as a DoT on a single target. Five non-boss bolts ignore armor and use their element. A player with defense and no resist takes more from those bolts than before. Hellmouth still deletes Super Elites.

#### Compatibility Notes

Old equipment with `mods.fire` still adds that number to spell power for all three skills. A save without `skillSpec` loads Bolt, Spin, and Nova. Learned skills and spell-bar slots load as they were. Packets are not saved. The burn and chill on an enemy are saved with the existing status bag.

#### Tests Performed

Headless Chrome, SwiftShader, cache disabled. Counts and the per-name diff against tag `combat-redesign-pre-stage7` are in [Stage 7 executed results](#stage-7-executed-results). `tests/stage7-skills.html` was 69/0. Stages 1–6 stayed 71/0, 73/0, 58/0, 75/0, 78/0, and 47/0.

#### Known Issues

Hellmouth still deletes Super Elites. Crit chance is still uncapped. Life steal still ignores mitigation and the power-attack multiplier, and still skips bows, Fireball, and Frost Nova. Curse life drain is still unwired. The character sheet still does not show spell power; the item line does. A global flat, increased, or more on a Whirlwind applies once per component. No loot rolls those stats. Base Burning deals 0 so it cannot inflate time-to-kill. Kindling's burn is the opt-in damage. Boss and Super Elite attack patterns are still Physical. Enemy resist tables and elite affixes are Stage 8.

#### Rollback Notes

```
git checkout combat-redesign-pre-stage7
```

That tag is `29c81bb825c98816606e75c80985305becf5a0c8`. It is the Stage 6 squash on main, PR #29. Gameplay version on it is 0.7.18. Do not move the tag. The older tags `combat-redesign-pre-stage1` through `combat-redesign-pre-stage6` were not moved.

#### Next Steps

Wait for Jake. Do not merge this PR. Do not deploy. Do not start Stage 8 (enemy resist tables and elite affixes). Do not redesign boss or Super Elite attacks. Do not change Hellmouth.

#### Adjustment before merge — caster bolts stay Physical

Jake approved the player skills, the builds, the status hooks, and the save migration. He asked for one revert before merge. Cultist, Lich Wisp, Drowned Siren, Choir Exarch, and Drowned Seer shots are Physical again. A 20-point bolt into DEF 30 deals 10, the armor curve, not 20.

The reason is that an elemental bolt skips armor, and no loot grants elemental resist yet. Those five shots were the only incoming attacks this stage had retyped. Player Fireball, Frost Nova, and the Whirlwind split are unchanged.

The intended mapping stays the Stage 2 proposal: cultist Shadow, wisp Lightning, siren Cold, exarch Shadow, seer Lightning. Turning it on is a Stage 10 task, after resist-granting equipment can drop. Stage 8 must not activate it. Boss and Super Elite shots were already Physical and stay that way.

---

### 2026-11-06 — Stage 8: Enemy Resistances and Elite Affixes

- **Date:** 2026-11-06.
- **Stage:** Stage 8 — Enemy resistances and elite affixes.
- **Version / Commit:** Gameplay version left at v0.7.18 (`version.json` unchanged). Implementation commit `6dcc0a27bdfefc44bd0205465cbe0556e9f75126`. Rollback tag `combat-redesign-pre-stage8` points at `20906ade92233c9a7831c0a0c90a4ab90f898851` (Stage 7 squash on main, PR #30). Do not move it. Older rollback tags were not moved.
- **Status:** IMPLEMENTED. Not VERIFIED. Jake reviews. This PR is not merged and is not live. Stage 9 has not been started.
- **Objective:** Give each enemy family a lore resist profile on the Stage 2 curve, and give champions affixes that change the fight. Do not inflate every resist. Do not make a single damage type unable to kill a family. Do not convert the five caster shots. Do not retune bosses, Super Elites, Hellmouth, `mods.fire`, or loot.

#### Existing Behavior

Every live enemy had no `resists` bag, so Fire, Cold, Lightning, Poison, and Shadow all dealt their full post-scale amount. Physical already ignored elemental resist. Champions were a larger, faster copy: HP ×2.2, contact ×1.4, speed ×1.15, ability cooldown ×1.35, and the name `CHAMPION` (or `PALE CHOIR ZEALOT`). A shelled crab still bit, and an open crab did not. Boss shields, Super Elite intro immunity, poise, and the status bag were already on the resolver.

#### Changes Implemented

- `ENEMY_RESIST` is one profile per monster id. Each profile sums to 0 across the five elements. No profile uses `All`. No value is outside −40..+40, under the soft cap of 75, so penetration and the cap still have room. `spawnEnemy` copies the five numbers onto that enemy. Bosses and Super Elites are not copied a profile.
- The same Stage 2 formula still runs once inside `resolveEnemyDamage`: `eff = clamp(raw - penetration, -100, resistCap)`, then `amount * (100 - eff) / 100`. Physical is still added raw. Guard, ram armor, Hellmouth ×1.10, shock, the floor of 1, and boss or Super Elite shields still run after that, once.
- Hovering an enemy shows the cached line for its strongest resist and its sharpest weakness. The string is built at spawn, not per frame.
- `ELITE_AFFIX` is eight champion modifiers. They do not multiply HP or contact damage. Below depth 4 a champion is the old champion. Depth 4–11 rolls one. Depth 12+ rolls two. The second cannot be a second control affix. Minions, trash, bosses, and Super Elites do not roll. A saved champion with no affix field does not grow one on load. A saved enemy with no resist bag receives the family profile on load.
- A shelled crab no longer connects. An open crab does. The shell still returns `prevented: 'crab'` before resist.

#### Combat Formulas

Resist is unchanged from Stage 2:

```
eff = clamp(rawResist - penetration, -100, resistCap)
resistCap = clamp(75 + maxResist, 0, 90)
dealt = amount * (100 - eff) / 100
```

Content raw resist is the profile. It is not added again as `All`. A 100 Fire hit into a skeleton (Fire −30) deals 130. The same hit with 20 Fire penetration deals 150, and `penHits` stays 1. A raw 100 still caps at 75 with no `maxResist` (dealt 25) and at 90 with `maxResist` +15 (dealt 10). Physical 100 into that skeleton still deals 100.

Affix numbers, all on the champion that rolled them:

| Affix | Group | First depth | Banned on | What it does |
| --- | --- | --- | --- | --- |
| Bulwark | open | 4 | guard | After a 1.8s first wait, a 0.85–1.35s ward locks the facing it had. Front hits ×0.35. Flank is full. Poise is not reduced. Gap stays 4.2s. |
| Siphon | open | 4 | leech | A connecting bite heals 20% of the damage dealt, capped at 6% of max HP at depth 4 and 10% from depth 44 up. Spells do not feed it. |
| Shroud | open | 4 | eel, wisp, shade | A 0.5s flicker, then 0.55–0.8s of `prevented: 'shroud'` (HP and poise). Gap 4.2s. It does not refresh while up. |
| Harbinger | open | 8 | binder | A 0.7s rune, then one non-elite rat with no affix. Cap 2. Interval 8.5s down to a floor of 6.5s. |
| Rime | control | 4 | drowned, siren, spider, brood spider | After 1.2s, enemies inside 36px set `slowT` to at least 0.45s. That is the existing ×0.6 slow. No chill, no freeze. |
| Snare | control | 5 | spider, brood spider | One physical web every 5.5s, at ×0.35 of contact. The web slow is the existing web. |
| Volatile | control | 4 | bloater | Crossing 35% HP lights a 1.15s fuse on the body. The blast is 0.45× contact, capped at 30% of the player's max HP, radius 18. Dying cancels it. |
| Brand | control | 6 | none | Every 6.4s down to a floor of 5.2s, a rune is drawn where you stand. Tell 1.25s, radius 8. The blast is 0.35× contact, capped at 22% of max HP. It does not chase and it does not root. |

Control affixes are mutually exclusive on one champion, so a web and a rune and a frost aura are never the same monster. Guard duration never passes 1.35s against a 4.2s gap. Shroud never passes 0.8s. At the 0.2 move floor a player still clears a brand (13px needed, 15.5px of travel in the tell).

#### Enemy resistance table

Sum of the five elements is 0 on every row. Physical is not a column because the resolver does not resist it.

| Id | Family | Fire | Cold | Lightning | Poison | Shadow |
| --- | --- | --- | --- | --- | --- | --- |
| slime | drowned | 30 | −20 | −25 | 25 | −10 |
| ooze | drowned | 25 | −15 | −30 | 35 | −15 |
| eel | drowned | 20 | 15 | −40 | 10 | −5 |
| drowned | drowned | 35 | 10 | −30 | 5 | −20 |
| siren | drowned | 30 | 20 | −40 | 0 | −10 |
| leech | drowned | −10 | −15 | −20 | 35 | 10 |
| crab | drowned | 25 | 15 | −35 | 5 | −10 |
| seer | drowned | 20 | 15 | −25 | 0 | −10 |
| slimelet | drowned | 20 | −15 | −20 | 20 | −5 |
| zombie | drowned | 25 | 0 | −20 | 15 | −20 |
| bat | vermin | −30 | −10 | 10 | 20 | 10 |
| rat | vermin | −25 | −15 | 0 | 30 | 10 |
| bomber | vermin | −20 | 0 | −10 | 40 | −10 |
| spider | vermin | −35 | −5 | 0 | 40 | 0 |
| lobber | vermin | −15 | −10 | −5 | 40 | −10 |
| crawler | vermin | −20 | −10 | 0 | 40 | −10 |
| flies | vermin | −40 | −10 | 5 | 35 | 10 |
| spiderw | vermin | −30 | 0 | −5 | 40 | −5 |
| skel | bone | −30 | 25 | −15 | 35 | −15 |
| archer | bone | −25 | 20 | −10 | 30 | −15 |
| guard | bone | −20 | 20 | −10 | 30 | −20 |
| ghoul | bone | −25 | 10 | −10 | 20 | 5 |
| binder | bone | −20 | 15 | −15 | 30 | −10 |
| ram | bone | −15 | 25 | −20 | 25 | −15 |
| golem | bone | 10 | 20 | −35 | 25 | −20 |
| knight | bone | −15 | 20 | −10 | 25 | −20 |
| skelw | bone | −25 | 20 | −15 | 30 | −10 |
| goblin | bone | −20 | 5 | −10 | 15 | 10 |
| mage | choir | 10 | −20 | −25 | 15 | 20 |
| wisp | choir | −10 | −15 | 40 | 15 | −30 |
| ghost | choir | −15 | 10 | −25 | 40 | −10 |
| cantor | choir | −10 | 15 | −30 | 10 | 15 |
| shade | choir | −20 | 0 | −15 | 25 | 10 |
| exarch | choir | −10 | −10 | −20 | 10 | 30 |
| mimic | mimic | 15 | 5 | −25 | 20 | −15 |

Bone is dry: poison and cold sit high, fire and lightning crack it. Drowned is wet: fire is shrugged, lightning bites. Vermin burn and carry plague. Choir is spirit: poison does little, and each singer has its own shadow or lightning lean. Nothing resists all five.

#### Time to kill and survival

Checkpoint is tag `combat-redesign-pre-stage8` / `20906ad`, before this code. After is this branch. Spread 1, crit off, scale off. Sword is a 4-point Physical hit. Fireball is 64 Fire. Nova is 8 Cold. The low Whirlwind is 14 Physical + 1 Fire. Contact survival is hits of that enemy's own `dmg` to remove 60 player HP, DEF 0 and DEF 30.

Physical dealt and both survival columns matched on all 70 measured rows (35 monsters × depth 1 and 12), except one guard whose random floor placed the player in the pre-existing front arc (×0.15). That is the guard, not a resist. Re-measured contact survival was 0 mismatches. A depth-1 champion skeleton is still 44 HP and 8.75 contact, and its name is still `CHAMPION`.

| Enemy, depth 12 | HP | Sword hits before → after | Fireball | Nova | Low Whirlwind | Survival DEF 0 / 30 |
| --- | --- | --- | --- | --- | --- | --- |
| Skeleton | 86 | 22 → 22 | 2 → 2 | 11 → 15 | 6 → 6 | 3 / 5 both |
| Drowned | 133 | 34 → 34 | 3 → 4 | 17 → 19 | 9 → 9 | 3 / 5 both |
| Wisp | 51 | 13 → 13 | 1 → 1 | 7 → 6 | 4 → 4 | 3 / 6 both |
| Spider | 60 | 15 → 15 | 1 → 1 | 8 → 8 | 4 → 4 | 4 / 8 both |
| Golem | 278 | 70 → 70 | 5 → 5 | 35 → 47 | 19 → 19 | 2 / 3 both |
| Crab, open | 150 | 38 → 38 | 3 → 4 | 19 → 22 | 10 → 10 | 2 / 4 both |
| Ram | 167 | 84 → 84 | 7 → 6 | 56 → 84 | 28 → 28 | 2 / 4 both |

A 100-point packet is the clean multiplier, `100 / round(100 * (100 - resist) / 100)`. The worst value in the table is 1.667 (40 resist: wisp Lightning, bloater / spider / crawler / brood Poison, ghost Poison). The best is 0.714 (40 vulnerability: eel and siren Lightning, flies Fire). A live Fireball into the drowned (Fire 35) deals 42 instead of 64, multiplier 1.524. A live Nova into the ram deals 2 instead of 3 after the ram's existing armor, multiplier 1.5. A high Whirlwind (14 Physical + 20 Fire) into that drowned deals 27 instead of 34, multiplier 1.259.

Worst-case time-to-kill multiplier versus Stage 7, by family and build. Physical is the sword. Element columns are the 100-point packet. Mixed is the high Whirlwind.

| Family | Physical | Fire | Cold | Lightning | Poison | Shadow | Mixed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| drowned | 1.000 | 1.538 | 1.250 | 0.833 | 1.538 | 1.111 | 1.259 |
| vermin | 1.000 | 0.870 | 1.000 | 1.111 | 1.667 | 1.111 | 0.919 |
| bone | 1.000 | 1.111 | 1.333 | 0.909 | 1.538 | 1.111 | 1.063 |
| choir | 1.000 | 1.111 | 1.176 | 1.667 | 1.667 | 1.429 | 1.063 |
| mimic | 1.000 | 1.176 | 1.053 | 0.800 | 1.250 | 0.870 | 1.097 |

No family reaches 2× for a single element. A pure Fire character is slowest on the drowned and fastest on the flies. A pure Poison character is slowest on plague vermin and choir spirits, and still kills them.

#### Files Modified

- `index.html` — resist profiles, elite affixes, crab contact, hover tag. `version.json` was not edited.
- `tests/stage8-enemies.html` — new harness.
- `tests/stage1-damage.html` — the Frost Nova rat and the conversion rat set `resists` back to empty before the formula lock. The check names did not change.
- `tests/stage7-skills.html` — one renamed check, listed below.
- `COMBAT_REDESIGN_CHANGELOG.md` — this entry. `STAGE8_REPORT.md` — the review note.

#### Functions Added or Modified

Added: `resistProfile`, `resistTag`, `resistSanitize`, `applyEliteAffixes`, `affixSanitize`, `tickEnemyAffix`, `armVolatile`, `affixSiphon`, `affixCall`, `crabShut`, `affixBurstDmg`, and the depth scalers `affixGuardDur`, `affixPhaseDur`, `affixSiphonFrac`, `affixMarkGap`, `affixCallGap`.

Modified: `spawnEnemy` (copy the profile, roll affixes), `resolveEnemyDamage` (shroud, bulwark, volatile arm), `updateEnemies` and `gridEnemyUpdate` (crab contact, siphon, affix tick), `drawEnemy` and the v0.7.16 drawer (phase alpha, pip), `drawHoverBar`, `worldRestore` (sanitize). `castHellmouth`, `eShoot`'s type strip, `spawnBoss`, and `seSpawn717` were not given new behavior.

#### Gameplay Impact

Trash and champions take a different amount of elemental damage. A sword swing does not. A drowned shrugs a Fireball and folds to lightning. A skeleton burns and shrugs poison. Champions from depth 4 gain one readable name (`BULWARK CHAMPION`, `RIME ZEALOT`) and one extra behavior with a tell. From depth 12 they can have two, and never two controls. Standing in a brand or a fuse hurts and does not kill a healthy player. Walking out hurts nothing.

#### Compatibility Notes

Old saves load. Gear is untouched. `mods.fire` is still spell power. A floor snapshot keeps `resists` and `affix` when they are present. Stripping both and loading restores the profile from the monster id and does not invent an affix, so a champion who was saved before this stage does not grow a fuse under the player. Boss shields, Super Elite intro immunity, Hellmouth's Super Elite deletion, poise amounts, and the status rules are the same functions. The five caster shots still have no `dmgType`. Loot still does not roll `resFire` or `resAll`.

#### Tests Performed

Headless Chrome, Puppeteer, system Google Chrome, SwiftShader, cache disabled, `python3 -m http.server` on 127.0.0.1. The checkpoint is `20906ad` before this code. Counts are pass/fail. The per-name diff is in the testing section.

| Run | Legacy 21 | Stage 1 | Stage 2 | Stage 3 | Stage 4 | Stage 5 | Stage 6 | Stage 7 | Stage 8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Before | 809 passed, 96 failed | 71/0 | 73/0 | 58/0 | 75/0 | 78/0 | 47/0 | 70/0 | not present |
| After, one sequential pass | 807 passed, 96 failed | 71/0 | 73/0 | 58/0 | 75/0 | 78/0 | 47/0 | 70/0 | 63/0 |

`tests/stage8-enemies.html` is 63/0. It covers every profile (sum 0, bounds, no `All`), independent copies, vulnerability, penetration once, both caps, boss and Super Elite staying unprofiled, depth and ban and stack rules, bulwark versus poise, shroud, the fuse tell and the step-out, the brand cap, rime without freeze, one physical web, siphon only on a bite, the two-rat cap, burn resisted once, poise unchanged by resist, the crab bite, the save round-trip, the cultist bolt, and Hellmouth still deleting a Super Elite.

Stages 1–6 did not rename a check. Stage 1 still locks the Frost Nova at 8 Cold and the conversion total at 100 because those two rats have their resist bag cleared first. The names are `frost nova formula tags and cold`, `conversion does not chain or change total`, and `original fire still converts`.

Renamed earlier-stage check:

- `tests/stage7-skills.html`: `no resist affix and no stage 8 table` is now `loot has no resist affix`. Stage 8 now owns `ENEMY_RESIST` and `ELITE_AFFIX`. The loot assertion is the same: no `k: 'resFire'` and no `k: 'resAll'`.

Legacy name movement on the sequential pass:

- `v0711`: 43/5 → 41/5. The five stable names stayed (`version`, `hundred gold`, `tome icon`, `stats scroll`, `stats canvas kept`). `vault rare 0` and `vault rare 3` were not emitted because those generated floors had no vault door. Re-runs were 42/5 and 43/5 and did emit vault rares. Generation variance, not a new failure. `trash in the maw` was not a failure on the sequential pass or the re-runs.
- `v0714`: stayed 40/1, only `version`. Two re-runs were 33/8 with the seven footer and tab names. Layout flake.
- `v076`: stayed 48/0, including `b3 damage no snap`. Two re-runs stayed 48/0.
- `v07152`: stayed 34/3 (`version`, `tab hits follow scale`, `slot hit follows scale`). Two re-runs were 36/1 with only `version`. Layout flake.

No other legacy failure name was added or cleared on the sequential pass. `version.json` is still 0.7.18.

#### Known Issues

Hellmouth still deletes Super Elites. The chill aura still does not slow a Super Elite. Crit chance is still uncapped. `mods.fire` is still spell power. The character sheet still does not list enemy resists; the hover line does. Loot still does not roll resist or penetration. Caster shots are still Physical until Stage 10. Boss and Super Elite attacks were not redesigned.

#### Rollback Notes

```
git checkout combat-redesign-pre-stage8
```

That tag is `20906ade92233c9a7831c0a0c90a4ab90f898851`. Do not move it.

#### Next Steps

Wait for Jake. Do not merge this PR. Do not deploy. Do not start Stage 9 (boss and Super Elite attacks, and the Hellmouth deletion). Do not turn on caster elements. Do not add resist loot.

#### Pre-merge adjustment — crab bite restored

Jake approved the resist profiles and the elite affixes, and asked for one revert before merge. The contact test is back to the Stage 7 expression `!(ai === 'crab' && mode === 'open')` on both the legacy loop and the grid loop. A shelled crab bites. An open crab does not. Incoming damage while shelled is still `prevented: 'crab'`. The crab row in `ENEMY_RESIST` is unchanged (Fire 25, Cold 15, Lightning −35, Poison 5, Shadow −10). `crabShut` was removed. A shroud affix still skips contact while `affix.phase > 0`; that clause is the affix, and it is the only addition on those two lines versus `20906ad`.

The shell/bite mismatch stays OPEN technical debt. It is not a Stage 8 fix.

`tests/stage8-enemies.html` now locks that baseline: `shelled crab still bites`, `shelled crab still blocks incoming damage`, and `open crab still does not bite`. The harness is 64/0. Stages 1–7 stayed green. The per-name diff against `20906ad` is in the testing section below.

---

### 2026-11-06 — Stage 9: Boss and Super Elite Combat Redesign

- **Date:** 2026-11-06.
- **Stage:** Stage 9 — Boss and Super Elite combat redesign.
- **Version / Commit:** Gameplay version left at v0.7.18 (`version.json` unchanged). Implementation commit `3c6cfac75ad1339dae3f4b0fa6d4213c8a4e916e`. Rollback tag `combat-redesign-pre-stage9` points at `1fb0f155ca794750167f143182869222bdfab790` (Stage 8 squash on main, PR #31). Do not move it. Older rollback tags were not moved.
- **Status:** IMPLEMENTED. Not VERIFIED. Jake reviews. This PR is not merged and is not live. Stage 10 has not been started.
- **Objective:** Stop Hellmouth from deleting a Super Elite, and give bosses and Super Elites phased, telegraphed fights that use the poise, status, shield, and intro rules already in the game. Do not inflate HP. Do not multiply every hit. Do not make a build unable to clear a fight.

#### Hellmouth, before and after

Before, `castHellmouth` treated every actor with `T.boss` false as trash. A Super Elite sets `T.boss` false on purpose. The maw froze it, and at frame 90 `killEnemy` removed it. That skipped the shield, the drop and taunt immunity, and the stair lock. A scripted sink finished in 1.55s at every depth (31 steps of 0.05s). A boss was only marked: `mawVuln` for 3s, then the existing ×1.10.

After, `heavyEncounter` is a boss or a Super Elite. Trash still sinks and still dies, which is the pack clear. A gate encounter is not pushed into `activeHellSinks`, is not frozen, and is not passed to `killEnemy`. It receives the same 3s mark. A Super Elite that is already in `fight` also loses shield and poise:

```
bite = shield > 0 ? clamp(round(shield * 0.25), 1, shield) : 0
```

The bite is not a damage packet. It does not crit, leech, or touch HP. Drop and taunt refuse it, and `resolveEnemyDamage` still returns `prevented: 'super-elite'` for any real hit during those phases. The poise spend is one skill-class hit (14, then the Super Elite taken multiplier 0.30, so 4.2). That does not break a full 360 bar. A later `tickHellmouth` that finds a gate actor in a sink releases it and refreshes the mark. It does not bite a second time and it does not delete.

The ×1.10 is still one multiply, after resist, guard, and ram armor. A 4-point sword still rounds to 4, so the mark alone does not speed a light sword. A 40-point hit becomes 44. A 100-point hit becomes 110. Hellmouth stays useful because the shield bite repeats every cast (the skill cooldown is still 6s) until the ward is gone, and the mark speeds any hit large enough to round up. It is no longer a stair-lock bypass.

#### Boss and Super Elite mechanics

HP formulas are the Stage 8 formulas. `BOSS_HP_MUL` is still 1.75. `BOSS_SHIELD_FRAC` is still 0.25. `seMaxHp717` is still the synthetic champion ×1.4. Contact damage and the pattern multipliers (slam ×1.15, hop and nova ×1.1, charge contact ×1.3, Super Elite power ×1.7) were not given a phase factor. `enr` is still 1.25 in phase 2 and 1.4 in phase 3, and it still scales move speed and how fast `patCd` falls. It does not scale `e.dmg`.

Phase 2 starts when HP is under half of `maxHp`. Phase 3, on a boss with `B.p3`, starts under a quarter. Those are the ticks already drawn on the boss bar. The shield is burned first and is not part of the fraction. Crossing a line sets `phaseBeat` to 0.7s, and the next pattern waits that long. A pattern already showing its tell is allowed to finish.

`bossIntro` is still 2.8s and still blocks poise, not HP. It now also refuses to start a pattern, so the awaken banner is a cease-fire. Standing inside the body can still take contact.

Super Elite phases use the same HP fractions, computed by `seFightPhase`. They do not change HP or contact damage.

| Phase | HP left | What they do |
| --- | --- | --- |
| 1 | above half | A swing, after the swing tell. |
| 2 | half or less | The same swing, and every third action is the power smash. |
| 3 | a quarter or less | Swing, power, and a brand, in that order. The bar draws the quarter tick because `B.p3` is set on the Super Elite. |

Freeze immunity and `HEAVY_CHILL` (0.4) are unchanged. A 50% chill request on a boss or a Super Elite is still 20% slow, and freeze still returns `immune`. The chill aura now multiplies `seMoveMul`. Fear no longer gets walked back in the same frame: `seTick717` drops an uncommitted tell and does not chase while `fearT` is up. Stagger still clears `seAct` and any telegraph whose `src` is that actor. Boss circle tells now set `src`, so a stagger removes a committed ring, nova, slam, or hop the way Stage 5 already removed a beam.

#### Resist profiles

Each boss and each Super Elite has a five-element row. Each row sums to 0. Nothing is outside −20..+20. There is no `All` key. Physical is not in the row, so a sword's time to kill did not move. The worst Fire row on a boss is +10 (dealt 90). The worst on a Super Elite is +20 (dealt 80). Every element is negative on at least one boss and one Super Elite, so a one-element caster has a fight they are faster at. Affixes are still not rolled onto these actors. A save without a bag receives the row from the boss name or the Super Elite id. A saved bag is kept.

#### Telegraph table

A damaging tell is a circle or a line that already existed in the game. Nothing new is allocated per frame. A tell is created when the action starts.

| Attack | Windup | What you do |
| --- | --- | --- |
| Boss ring | 0.55s circle on the body | Step off the boss before the bullets. Was 0.40s with the same ring. |
| Boss spiral | 0.60s circle, then the spin | The first shot waits out the circle. The spin is the ongoing tell. Bullet speed stays 72. |
| Boss spread | 0.85s lines, lock after 0.30s | The fan used to appear at 0.30s with no line. Sidestep a locked lane. A second volley is 0.50s later. |
| Boss charge | 0.75s line | Unchanged length. The line locks. The charge is the committed direction. A wall still stuns the boss. |
| Boss slam | 0.90s circle, radius 26, snapshot | Unchanged. The circle does not follow you. Walk out. |
| Boss hop | 0.85s circle, radius 28, snapshot | Unchanged landing. Phase 2 used to fire a ring on the landing frame. That ring now waits 0.45s behind its own circle. |
| Boss nova | 1.15s circle, radius 58, follows | Unchanged. Leave the ring. A roll covers most of it. This radius was already the large tell. |
| Boss beam | 1.00s lines, lock at 0.55s | Unchanged. |
| Boss teleport | 0.75s marker, then 0.55s ring tell | The ring used to fire on the arrival frame. You can leave the marker, then leave the ring. |
| Boss lob | 1.00s lob marker | Unchanged. The bomb does not chase. |
| Boss summon | 0.80s rune | Not a damage tell. The minion is the existing summon. |
| Super Elite swing | 1.00s line, width 8, lock after 0.25s | Sidestep. The hit is the locked lane, within 8px. At the 0.2 move floor, 0.75s of locked time covers that 8px. Damage is `e.dmg`. |
| Super Elite power | 1.30s circle, radius 10, follows the body | Only phase 2 and 3. Leave the circle. Damage is `e.dmg * 1.7`, the old powerup ratio, and only if you are still inside. At the 0.2 floor, 1.30s covers radius 10 plus the player's 5px radius. |
| Super Elite brand | 1.15s circle, radius 8, snapshot | Only phase 3. It does not follow. Damage is `e.dmg * 0.85`. At the 0.2 floor, 1.15s covers radius 8 plus 5px. |

Gaps after a Super Elite action are 0.70s (swing), 0.90s (power), and 0.75s (brand). None of these root, freeze, or refresh a lock. Boss pattern cooldown is still `rand(1.2, 1.8)` after the tell, faster in phase 2 and 3 by the existing 1.5 cast rate, and held for 0.7s on a phase line.

Boss and Super Elite projectiles stay Physical. Giving them an element would skip armor, and resist gear is Stage 10. The five caster shots stay Physical for the same reason.

#### Time to kill and survival

Checkpoint is tag `combat-redesign-pre-stage9`. Spread 1, crit off, mana ignored. Physical is a 4-point sword every 0.45s. Fire is a 64-point Fireball every 0.45s (level 10, spell power 20). Mixed is a high Whirlwind, 14 Physical plus 20 Fire, every 1.6s. Hellmouth-using is that sword, plus a cast at 0s and every 6s. Before, the mark did not change a 4-point hit, so boss Hellmouth time equalled the sword. Super Elite Hellmouth time was the 1.55s delete. After, the bite removes shield on that cadence and the sword still deals 4. Pools and contact damage matched the tag on all 20 bosses. Survival is how many of that actor's own contact hits remove 60 player HP. It matched on every boss and every Super Elite, at DEF 0 and DEF 30, because contact damage was not changed. Nova (×1.1) and charge (×1.3) survival are the same integers as the tag for the same reason.

| Boss | Pool | Sword | Fire before → after | Mixed before → after | Maw before → after | Contact hits DEF 0/30 |
| --- | --- | --- | --- | --- | --- | --- |
| Mother Murk | 840+210 | 118.35 | 7.65 → 7.65 | 49.6 → 49.6 | 118.35 → 108.45 | 4/7 |
| The Gnawer King | 1365+341 | 192.15 | 12.15 → 10.35 | 81.6 → 72 | 192.15 → 173.25 | 2/4 |
| The Drowned Bell | 1890+473 | 265.95 | 16.65 → 15.3 | 112 → 105.6 | 265.95 → 236.7 | 2/3 |
| Sister Vey | 2415+604 | 339.75 | 21.6 → 19.8 | 142.4 → 134.4 | 339.75 → 299.25 | 2/3 |
| Old Tam | 2940+735 | 413.55 | 26.1 → 23.85 | 174.4 → 164.8 | 413.55 → 361.35 | 1/2 |
| The Silkmother | 3465+866 | 487.35 | 30.6 → 25.65 | 204.8 → 182.4 | 487.35 → 423 | 1/2 |
| Sir Calder | 3990+998 | 561.15 | 35.1 → 32.4 | 235.2 → 222.4 | 561.15 → 484.65 | 1/2 |
| Lady Merrow | 4515+1129 | 634.95 | 40.05 → 36.45 | 265.6 → 251.2 | 634.95 → 545.85 | 1/2 |
| Deepcoil | 5040+1260 | 708.75 | 44.55 → 46.8 | 297.6 → 305.6 | 708.75 → 607.05 | 1/2 |
| Choirmaster Aurel | 5565+1391 | 782.55 | 49.05 → 54 | 328 → 348.8 | 782.55 → 667.8 | 1/1 |
| The Ossuary Colossus | 7917+1979 | 1113.3 | 69.75 → 76.95 | 467.2 → 496 | 1113.3 → 939.15 | 1/1 |
| Abbot Morcant | 6615+1654 | 930.6 | 58.5 → 53.55 | 390.4 → 368 | 930.6 → 788.85 | 1/1 |
| Captain Brannoc | 8568+2142 | 1205.1 | 75.6 → 79.2 | 504 → 520 | 1205.1 → 1013.4 | 1/1 |
| Queen Lirael | 7665+1916 | 1078.2 | 67.5 → 64.35 | 451.2 → 438.4 | 1078.2 → 909.9 | 1/1 |
| Motley | 8190+2048 | 1152 | 72 → 66.15 | 483.2 → 456 | 1152 → 970.2 | 1/1 |
| The Ninth Eye | 8715+2179 | 1225.8 | 76.95 → 76.95 | 513.6 → 513.6 | 1225.8 → 1030.5 | 1/1 |
| The Penitent Host | 9240+2310 | 1299.6 | 81.45 → 70.65 | 544 → 500.8 | 1299.6 → 1090.8 | 1/1 |
| The Ninth Psalm | 9765+2441 | 1373.4 | 85.95 → 82.35 | 574.4 → 558.4 | 1373.4 → 1150.65 | 1/1 |
| The Crown-Wraith | 10290+2573 | 1447.2 | 90.45 → 82.8 | 606.4 → 572.8 | 1447.2 → 1210.95 | 1/1 |
| Oswin, the Bone King | 17304+4326 | 2433.6 | 152.1 → 139.05 | 1019.2 → 961.6 | 2433.6 → 2010.15 | 1/1 |

The slowest Fire change is the Colossus, 69.75s to 76.95s, about ×1.10, from Fire +10. The fastest is the Silkmother, 30.6s to 25.65s, from Fire −20. A sword is the same number on every row. Nobody's Fireball time left the fight.

Super Elites share one pool per depth. Depth 10 is 249 HP and a 25 shield. Sword time is 31.05s before and after. Contact survival is 4 hits at DEF 0 and 6 at DEF 30. The power smash, if you stand in the new circle, is 2 and 4. Hellmouth before was 1.55s. Hellmouth after is 29.70s. Depth 1 sword is 7.20s and Hellmouth after is 6.30s. Depth 100 sword is 271.35s and Hellmouth after is 260.55s. Fire at depth 10 ranges from 1.80s (Fire −15 or −20) to 2.70s (Magmafiend and Ember-Fiend, Fire +20). At depth 100 that +20 row is 21.60s against the unresisted 17.10s. That is the worst Super Elite elemental case, and it still dies.

#### Tests

Headless Chrome, system Google Chrome, SwiftShader, cache disabled. Baseline is the tag, 29 files, 1346 passed, 94 failed. After, one sequential pass, stages 1–9 plus the same 21 legacy files.

| Run | Legacy 21 | Stages 1–8 | Stage 9 |
| --- | --- | --- | --- |
| Before, tag `combat-redesign-pre-stage9` | 810 passed, 94 failed | 71/0, 73/0, 58/0, 75/0, 78/0, 47/0, 70/0, 64/0 | not present |
| After, sequential pass | 803 passed, 101 failed | same counts, all green, with the renames below | 41/0 |
| After the `v0714` re-run returned to 40/1 | 810 passed, 94 failed | same | 41/0 |

`tests/stage9-bosses.html` is 41/0. It locks the Hellmouth split, the shield bite, the intro refusal, boss phase and the 0.7s beat, boss tell durations, Super Elite phase kinds, swing sidestep, power ×1.7 only inside the circle, a brand that does not follow, freeze immunity, heavy chill, the aura, fear cancelling a tell, stagger removing a tell, the uninflated pools, a +20 Fire hit staying finite, the crab predicate, and a save of shield, mark, phase, and the resist row.

The sequential legacy pass moved only `v0714` (40/1 → 33/8, the seven footer and tab names). Re-runs:

- `v0714`: the first re-run stayed 33/8. The next was 40/1 with only `version`. Layout flake.
- `v0711`: sequential pass stayed 42/5 with the five stable names. A re-run was 43/5 with those same five names. An extra pass was emitted. Emission flake.
- `v076`: stayed 48/0 on the pass and the re-run.
- `v07152`: sequential pass stayed 36/1 with only `version`. A re-run was 34/3 (`tab hits follow scale`, `slot hit follows scale`). The next was 36/1. Layout flake.
- `v075`: stayed 59/1, only `f3 multi select`, on the pass and the re-run.

No other failure name was added. `version.json` is still 0.7.18.

Renamed earlier-stage checks, because this stage owns the behavior they were locking:

- Stages 1–8: `hellmouth split unchanged` → `hellmouth refuses a heavy encounter`. The split is no longer "boss versus everyone else."
- Stages 1–4: `hellmouth sinks se not boss` → `hellmouth does not sink a gate encounter`.
- Stages 1–2: `hellmouth vuln is boss only` → `hellmouth marks the boss and the super elite`.
- Stages 1–4: `hellmouth still deletes se` → `hellmouth does not delete the super elite`.
- Stage 7 and 8: `hellmouth still sinks the super elite and not the boss` → `hellmouth does not sink a gate encounter`, and `hellmouth still deletes the super elite` → `hellmouth does not delete the super elite`.
- Stage 5: `super elite frost slow stays 0.5 and still ignores the aura` → `super elite frost slow stays 0.5`. The 0.5 frost factor is unchanged. The aura is no longer ignored.
- Stage 8: `bosses are not given a resist profile` → `boss profile is not an affix`. `an unprofiled boss still takes the full hit` → `mother murk still takes a full fire hit` (her Fire row is 0). `super elites are not given a resist profile` → `super elite profile is not an affix`.

#### Known issues

Crab shell versus bite stays OPEN. Contact is still `!(ai === 'crab' && mode === 'open')`, and a shelled crab still returns `prevented: 'crab'`. Crit chance is still uncapped. Curse `lifeDrain` is still not wired into `leech`. Life steal is still the pre-mitigation number and still skips bows, Fireball, and Frost Nova. The five caster shots stay Physical until Stage 10. Loot was not changed. `mods.fire` is still spell power.

#### Rollback

```
git checkout combat-redesign-pre-stage9
```

That tag is `1fb0f155ca794750167f143182869222bdfab790`. Do not move it.

#### Next steps

Wait for Jake. Do not merge this PR. Do not deploy. Do not start Stage 10. Do not turn on caster elements. Do not add resist loot.

### 2026-11-06 — Stage 9 pre-merge checks

Jake approved Stage 9 in principle and asked for these checks before merge. They were run on this branch. The PR was not merged. `version.json` was not changed. Stage 10 was not started.

The checks found two real mismatches, and both were fixed before the suite was accepted.

1. **A tell could be smaller than the hit.** Circle blasts used a radius `R` on an isometric ellipse while `blast` hit `R + player radius`. The Super Elite swing drew a band 8px wide and hit anything within 8px of the center line. Spread bolts traveled past the 160px line, and a charge traveled 234px down a 200px line. Dangerous boss and Super Elite tells now store the hit radius or the hit width on the telegraph itself. `match` draws that circle as a circle. A blast still uses its old radius, and the outline is that radius plus the body, which is the distance `blast` already used. Spread bolts die at the end of the lane. The charge line is as long as the charge and as wide as contact.
2. **A canceled pattern could still go off.** Stagger removed the live telegraph and left the `later` callbacks that spawned the next slam or the next spread volley. `later` now keeps the actor, and stagger or a cleared tell drops those callbacks. A tell's `onDone` also refuses a staggered actor, so a canceled windup does not deal damage on a later frame.

The 25% shield bite already stopped at the remaining shield. It now also clamps the result at 0. It still does not write HP.

| Check | Result |
| --- | --- |
| Movement at the 20% floor, recovery, stagger, and overlapping tells | PASS. A chilled, slowed player on the move floor walks out of the power circle before it lands. The next Super Elite tell waits out its gap. A second tell does not stack. Stagger deletes the swing, and the hit does not arrive later. |
| Telegraph geometry and canceled damage | PASS. The swing stripe, power circle, and slam circle match the hit distance, including the edge and one step outside it. A slam does not hurt during the windup. A staggered spread does not fire its later volleys. |
| Hellmouth versus intro, shield, death, and stairs | PASS. Six casts during drop leave HP and shield unchanged, damage is still `prevented: 'super-elite'`, and the stairs stay shut. A save and reload keeps that intro. After the fight starts, bites empty the shield and leave HP alone. A real kill opens the stairs. A later cast does not revive the body. A saved death stays dead. |
| Shield bite sign and HP | PASS. Starting shields 1, 2, 3, 9, and 25 all end at 0. None go negative. HP stays 90. |
| Resist rows once, Physical unchanged | PASS. 100 Physical into Mother Murk is 100. 100 Poison into her Poison 20 row is 80, with `penHits` 1. 100 Physical into Magmafiend is 100. 100 Fire into its Fire 20 row is 80, with `penHits` 1. |

`tests/stage9-bosses.html` is 76/0 after these checks. Stages 1–8 stayed 71/0, 73/0, 58/0, 75/0, 78/0, 47/0, 70/0, 64/0. Against the pre-stage9 tag, the only legacy failure-name movement was the known flakes: `v0711` emitted one extra pass and a re-run returned to 42/5 with the same five names; `v0714` was 40/1 on the full pass and 33/8 on a re-run (footer and tab names); `v07152` was 34/3 then 36/1 with only `version`; `v076` stayed 48/0; `v075` stayed 59/1 with only `f3 multi select`. No new failure name.

---

### 2026-11-06 — Stage 10: Equipment, Loot, and Build-Defining Affixes

- **Date:** 2026-11-06.
- **Stage:** Stage 10 — Equipment, loot, and build-defining affixes.
- **Version / Commit:** Gameplay version left at v0.7.18 (`version.json` unchanged). Rollback tag `combat-redesign-pre-stage10` points at `a492023a5a442bce8404837648567626b58a51e1` (Stage 9 squash on main, PR #32). Do not move it. Tags `combat-redesign-pre-stage1` through `combat-redesign-pre-stage9` were not moved.
- **Status:** IMPLEMENTED. Not VERIFIED. Jake reviews. Stage 11 has not been started.
- **Objective:** Add elemental resist, penetration, crit damage, typed added damage, one controlled conversion, and one status synergy, using the Stage 2 and Stage 3 formulas. Put resist on common early armor before the five caster bolts become elemental. Do not raise boss or Super Elite HP or damage. Do not reinterpret `mods.fire`. Do not touch the open debts.

#### Implementation

Resist is on the item before any caster bolt is elemental. A non-unique copy of the early armor bases carries `mods.resAll` from `gearWard`. That is not an affix roll. A white leather coat has it. Uniques do not. `fixItem` does not add it to a loaded item, so an old save keeps the mods it was saved with.

```
gearWard = min(16, round(base + (itemLevel - 1) * 0.55))
```

| Base | Ward at item level 1 |
| --- | --- |
| Leather Armor | 8 |
| Chain Mail | 6 |
| Plate Mail, Dusk Shroud | 4 |
| Cap, Helm | 4 |
| Great Helm, Bone Visage | 3 |
| Boots, Greaves | 3 |
| Wooden Buckler | 6 |
| Round Shield | 5 |
| Kite Shield | 4 |
| Tower Shield and later shields | 3 |
| Copper Charm | 4 |
| Bone Pendant | 3 |

`computeStats` still folds `resAll` into the five resists once. The Stage 2 curve is unchanged: `eff = clamp(raw - penetration, -100, resistCap)`, soft cap 75, hard cap 90.

Magic and rare armor, helms, boots, and shields always include one resist line on top of that ward. A rare item can hold two resist lines, not five. `maxResist` is rare-only, item level 8+, helm or amulet, roll 2 or 3.

Offense affixes, and the level they start:

| Key | From item level | Roll cap | Rule |
| --- | --- | --- | --- |
| `resFire` `resCold` `resLightning` `resPoison` `resShadow` | 1 | 24 | one or two per item |
| `resAll` | 1 | 10 | stacks with the ward on the same key |
| `maxResist` | 8, rare | 2–3 | raises the Stage 2 cap, still stops at 90 |
| `penFire` through `penShadow` | 6 | 18 | one penetration key per item |
| `penAll` | 10, rare | 8 | folds once, then the sheet cap |
| `critDmg` | 3 | 30 | `critMul = 2 + critDmg/100`. Chance is still uncapped |
| `flatPhysical` and the five `flat*` | 2 | 8 | one flat key per item. Added damage, not spell power |
| `conv` | 4 | the id | one build affix per item |
| `ailment` | 4 | the id | one build affix per item |

There is no `inc`, `more`, or `bonus*` affix. Those would be stacked percent multipliers. The sheet still honors them if a test or a hand-edited item sets them. Loot does not roll them.

Sheet penetration per element is `min(40, typed + penAll)`. That cap is applied when stats are summed. A packet's own `penetration` field is still added once inside `mitigateElement`, which is the Stage 2 rule.

#### Conversion

Gear supplies at most one edge. Weapon wins, then amulet, then ring. The fraction is 0.40. `chain` is false. The edge moves that fraction. It does not copy. `setConversionEdges` still rejects a self-edge, a duplicate, and a cycle. A test that sets an edge is left alone until some equipped item actually has `conv`. Taking that item off clears the gear edge and does not clear a test edge that was set while nothing was equipped.

Scale still runs once, on the source type, before the move. Flat fire is not added again to a portion that used to be physical. The moved portion then takes the destination resist and the destination penetration, once. A second pass sees `scaled` and does not grow the number.

| Id | Move |
| --- | --- |
| `phys-fire` `phys-cold` `phys-lightning` `phys-poison` `phys-shadow` | 40% of Physical |
| `fire-cold` `fire-lightning` | 40% of Fire |
| `cold-fire` | 40% of Cold |
| `lightning-shadow` | 40% of Lightning |

#### Ailments

One id, from the same slot order. The hit is still scaled once. The status tick is created with `scale: false`, so flat and increased do not apply a second time. One `damageEnemy` call applies the status once. A second hit uses the Stage 4 stack or refresh rules. It does not apply the status twice for the same hit.

| Id | Lands when | Effect |
| --- | --- | --- |
| `bleed` | a Melee component is still Physical | Bleed, base 1, 4s. Not on bows or Fireball |
| `burn` | any Fire component, except a Fireball | Burning, base 1, 3s. Fireball keeps its own burn |
| `venom` | a Poison component | Poison, base 1 |
| `spark` | a Lightning component | Shock at 10% taken. Refresh stays 10, not 25 |
| `hex` | a Shadow component | Curse, −8 resist, 0 outgoing penalty, life drain 0 |
| `rime` | a Cold component, except Frost Nova | Chill, 12% slow, buildup 8 |

Hex does not wire curse life drain. `curseHooks(...).lifeDrainWired` stays false. Life steal is still the pre-mitigation number.

#### Caster bolts

Resist gear is generated by the same `makeItem` that has always dropped the whites. The bolts are typed in that same change, after the ward exists.

| Attacker | Type |
| --- | --- |
| Pale Choir Cultist | Shadow |
| Lich Wisp | Lightning |
| Drowned Siren | Cold |
| Choir Exarch | Shadow |
| Drowned Seer | Lightning |

Webs and bone arrows stay Physical. `eShoot` still deletes a type on a boss or a Super Elite, so Stage 9 patterns stay Physical. Boss and Super Elite HP, contact, shields, tells, and the Hellmouth mark were not edited. Mother Murk at floor 5 is still 840 HP, 210 shield, contact 18.144. `seMaxHp717(1)` is still 56. `seMaxHp717(10)` is still 249.

#### Loot tables

Rarity rates are unchanged. Whites roll no affix. Magic rolls 1–2. Rare rolls 3–4. Unique is still the boss and the sealed shop, and it still copies the unique's own mods. The shop still offers three sealed uniques at `shopUniquePrice`. Numeric unique mods still scale by tier and depth. String mods are not multiplied.

What changed inside those rates:

- Every non-unique Leather, Chain, Plate, Dusk, Cap, Helm, Great Helm, Bone Visage, Boots, Greaves, every shield base, Copper Charm, and Bone Pendant carries the ward, including whites.
- Magic and rare armor, helm, boots, and shield replace one rolled line with a resist line if the roll missed.
- A floor-1 white (`makeItem(2, 0)`, the chest's item level) carried some resist on 58 of 80 samples in the harness. That is the base mix, not a lucky rare.
- Weapons do not get the ward. A white short sword is still just a sword. `mods.fire` on a staff is still spell power and is not copied into `flatFire`.
- Conversion and ailments start at item level 4, so they are not on the floor-1 white.
- Penetration starts at item level 6.

#### Formulas

No Stage 2 or Stage 3 formula constant changed. Physical is still `DEF / (DEF + 30)` on the player only. Elemental mitigation is still one pass of the resist curve. Outgoing order is still crit once, then flat, then increased, then more, then type bonus, then conversion, then mitigation. Crit chance is still `5 + mods.crit` with no cap. Crit damage from gear changes only `critMul`.

#### Balance

Pinned spread 1, crit off. Sword hit is 4. Fireball is the level-10, spell-power-20 hit of 64. "Before" for player damage is that hit with no new affix. Enemy resists are already the Stage 8 rows, so a naked Fireball "before" and "after" are the same number. The pen column is 18 Fire penetration, one affix. Hybrid moves 40% of the sword hit to Fire. Bleed is the unscaled 1-damage stack, capped at 5, ticked on whole seconds. The full rows are in `STAGE10_REPORT.md`.

The early ward kit (leather, cap, boots, buckler, item level 2, no rolled affix) takes a depth-3 cultist bolt for 6. The same DEF as Physical would have dealt 7. A naked DEF 0 hit is 9 either way, because elemental and Physical match when DEF and resist are both 0. Wearing the DEF and stripping the resist is the bad case, and that is why the ward is on the armor rather than on a rare roll.

#### Known issues left open

Crab shell versus bite. Uncapped crit chance. Curse life drain not wired into `leech`. Life steal on the pre-mitigation number, and not on bows, Fireball, or Frost Nova. Stage 10 did not retune any of those.

Old saves do not gain the ward. A leather armor that was already in the bag stays as it was saved.

#### Files

- `index.html` — ward, affixes, one conversion edge, one ailment, the five caster types. `version.json` was not edited.
- `tests/stage10-equipment.html` — new harness, 44/0.
- `tests/stage2-resist.html`, `tests/stage3-crit-scaling.html`, `tests/stage4-status.html`, `tests/stage7-skills.html`, `tests/stage8-enemies.html`, `tests/stage9-bosses.html` — the deferred-loot and deferred-bolt checks now lock the Stage 10 rules. Counts did not change.
- `STAGE10_REPORT.md` — this stage.
- `COMBAT_REDESIGN_CHANGELOG.md` — this entry. Earlier history was not rewritten.

#### Rollback

```
git checkout combat-redesign-pre-stage10
```

That tag is `a492023a5a442bce8404837648567626b58a51e1`. Do not move it.

#### Next steps

Wait for Jake. Do not merge this PR. Do not deploy. Do not start Stage 11.

---

## Combat System Reference

The Stage 10 entry is the gear layer: resist wards, one conversion edge, and one ailment. `mods.fire` is still spell power. The Stage 9 entry is the boss, Super Elite, and Hellmouth layer. The Stage 8 block is the enemy resist and affix layer under it. The Stage 7 block is the skill layer. The Stage 6 block is the weapon model under it. The Stage 5 block is the poise model under that. The Stage 4 block is the status model. The Stage 3 block is the crit and scale model. The Stage 2 block is the resist model. The Stage 1 block is the architecture under all of them. The rest of this section is the v0.7.18 baseline those numbers still follow when the target has no resist and the skill build is the base row. Planned work for later stages stays marked as planned.

### Stage 7 implemented architecture

Implemented now, on top of Stage 6. A base-row hit with 0 resist is still the Stage 6 integer. The type, the status, and the build are new.

- `pw = st.fire + level * 2` is general spell power. `st.spell` equals `st.fire`. The item line is `+N Spell Power`. The key on the item is still `fire`.
- Fireball is Fire. Frost Nova is Cold. Whirlwind is Physical weapon damage plus a Fire rider of `pw * 0.5`. Only the weapon roll crits. Life steal uses the pre-mitigation sum.
- Scale, conversion, resist, and penetration still run once, inside `resolveDamage`. A splash `more` in `(0, 1)` still scales damage and skill poise once.
- Base Fireball applies Burning with base 0. Kindling sets the base to `max(1, round(pw * 0.2))` and drops the outer ring. Base Frost Nova applies Chill with 0% extra slow and 34 buildup, and still sets `e.slow = 3.5`. Whiteout can freeze a normal enemy on the second cast, then the freeze lockout blocks another freeze. Bosses and Super Elites do not build freeze.
- Builds are `player.skillSpec`, three ids, default `base`. Missing or unknown ids load as base. The spell bar is a different array.
- Cultist, wisp, siren, exarch, and seer shots are Physical again. Their Stage 2 elements wait for Stage 10, when resist gear exists. Stage 8 must not turn them on. Boss and Super Elite shots stay Physical.
- `envHurt` stays a world packet and skips resist. Poison ground stays Physical.

### Stage 6 implemented architecture

Implemented now, on top of Stage 5. A hit's HP number is still the Stage 5 number. Weapon identity changes when the hit lands, how wide it is, how hard it shoves, and how much poise it spends.

- Families come from the equipped weapon's slot and icon. Fists, sword, axe, maul, staff (and spear), bow. No new save field. `mods.fire` is still spell power.
- The attack period is still `0.45 / aspd`. Windup is a fraction of that period. Recovery is the rest. A tap does not add time on top of the old cooldown.
- Input scheduling (`armAttack`, `beginAttack`, `queueAttack`) owns windup, one buffered press, and recovery. `doAttack`, `fireBow`, and `powerAttack074` still resolve in the call, so older harnesses keep an immediate hit. A direct call during windup replaces the pending swing. It does not add a second hit.
- A roll, stagger, or freeze during windup cancels the uncommitted hit and leaves the cooldown. Recovery is not skipped.
- A bow draw does not enter the melee charge and does not multiply by the power-attack factor. Release or the tap fires `rollDmg('bow')`.
- Hitstop holds the swing pose for at most `0.06s`. Cooldowns, the attack period, and projectile motion keep using the full frame.
- Player arrows test the segment from the previous point to the new point, including a start that is already inside the hurtbox, and they skip dead bodies. The floater crit flag is still false. The crit multiplier is still only inside `rollDmg`.
- Untagged packets still use `POISE_CLASS_DMG` (light 18, heavy 34, power 52, skill 14). A live swing stamps `weaponFamily`. Fist and sword match that table. Axe, maul, staff, and bow do not.

### Stage 5 implemented architecture

Implemented now, on top of Stage 4. With poise unbroken and no status, hit math is the Stage 4 math.

- Poise is separate from HP. `applyPoiseDamage` runs after a landed hit. It does not call the armor curve, resist, barrier, or the boss/Super Elite shield. Block zeroes it. A guard glance multiplies it by 0.2. DoTs and world packets do not call it.
- Stagger is `ent.statuses.stagger`. The Stage 4 bag is the only timer. Duration comes from the tier, then diminishing returns, and is capped by `STATUS.stagger.dur` (0.55s). Expiry sets `staggerImmune` from the tier. Bosses and Super Elites are not freeze-immune to stagger. They are hard to break and short to lock.
- Precedence is freeze, stagger, legacy stun, knockback, slow. Freeze and stagger are speed 0 and they interrupt. Knockback still slides. Slows floor at 0.2.
- Boss intro blocks poise for that boss while `bossIntro > 0`. HP and the shield are unchanged. Super Elite intro and the crab shell still return before the hit, so they block both.
- The class table at the end of Stage 5 was light 18 (tap and bow), heavy 34 (Whirlwind), power 52 (charged melee, 36.4 at the minimum charge), and skill 14. Stage 6 kept that table as the untagged fallback and the fist/sword row. Live bows, axes, mauls, and staves stamp a family.

### Stage 4 implemented architecture

Implemented now, on top of Stage 3. With no status on either actor, hit math is the Stage 3 math.

- One bag, `ent.statuses`. Apply, refresh, stack caps, tick, expire, remove, immunity, and source strings live there. There is no second timer for bleed, burning, poison, chill, freeze, shock, or curse.
- Legacy frost slow (`e.slow`), chill aura (`auraT` / `auraPct`), player `slowT`, environmental `p.burn`, fear, and self-stun stay on their old clocks. `legacyStatusView` reads them. It does not tick them. Poison ground still calls `hurtPlayer` as Physical. Environmental flames still call `envHurt` as a world packet. Frost Nova still sets `e.slow = 3.5` and still deals Physical.
- Damaging ticks build one packet per interval: Physical bleed, Fire burning, Poison poison. `critApplied` is set, `critPending` is not, and `scaleOutgoingComponents` refuses a crit on `isDot` even if a caller asks. Player-sourced ticks scale once. Enemy-sourced ticks do not use the player scale. Then conversion, then armor or resist and penetration once, then guard, ram armor, and Hellmouth ×1.10, then shock if the target has it, then the floor of 1, then a boss or Super Elite shield.
- Shock is increased damage taken, capped at 25%, one instance. It is not negative resistance and it is not the Hellmouth mark. A marked boss with 20% shock takes 132 from a Physical 100 (110 × 1.20).
- Chill slows movement, capped at 60%, and adds freeze buildup. Bosses and Super Elites take 40% of the requested slow and do not build freeze. Freeze lasts at most 1.5s, does not extend while active, and then blocks freeze for 3s. Freeze speed is 0, including a new dodge roll.
- Curse is a capped debuff. Outgoing penalty and resist reduction are wired. Life drain is stored and is not applied to `leech`. No loot rolls any of this.
- Hellmouth's `hmFreeze` still skips enemy AI, and status ticks wait with it, so a DoT cannot delete a sinking Super Elite. `mods.fire` is still spell power. Live attacks are still Physical.

### Stage 3 implemented architecture

Implemented now, on top of Stage 2:

- Player crit chance is `st.crit + skillChance`. `st.crit` is still `5 + sum(mods.crit)`. No cap. 0 or below never crits. 100 or above always crits for a roll in `[0, 1)`.
- Player crit multiplier is `max(0, st.critMul + skillMul)` with `st.critMul = max(0, 2 + sum(critDmg) / 100)`. Default is ×2. `rollDmg` applies it once and sets `critApplied`. The resolver does not apply it again. A `crit: true` flag on `damageEnemy` is the floater only.
- Champion crit is still `+ round(pre-mitigation amount * 0.05)` after armor or resist. It is not the player multiplier.
- Player outgoing scale, once, before conversion: flat, then increased, then more (including power-attack and Fireball splash), then a type bonus. Defaults are an identity. Enemy incoming hits and world packets skip it.
- Conversion moves a fraction. It does not copy. Duplicate edges, self-edges, and cycles are rejected. A moved component chains only when the next edge sets `chain: true`, and only once. No loot adds edges.
- Stage 2 penetration still runs once per elemental component. `mitigateElement` returns the stored amount on a second call.
- Life steal still uses the pre-mitigation melee roll (power-attack more excluded) or the Whirlwind skill sum. Bows, Fireball, and Frost Nova still do not heal.
- `mods.fire` is still `pw = fire + level * 2`. Every live attack is still Physical. Hellmouth is unchanged.

### Stage 2 implemented architecture

Implemented now, on top of Stage 1:

- Physical mitigation is still only `DEF / (DEF + 30)`, once, on Physical components. `elementalResist` returns 0 for Physical.
- Fire, Cold, Lightning, Poison, and Shadow use `eff = clamp(raw - penetration, -100, resistCap)` and `multiplier = (100 - eff) / 100`. `resistCap` is `clamp(75 + maxResist, 0, 90)`.
- Negative `eff` is the only vulnerability. It is not stacked with a second vuln multiplier. Hellmouth ×1.10 is still the boss mark and still runs once, after resist, on enemies only.
- The player and an enemy share `elementalResist`. Enemy `resists` default to nothing, which is 0, until Stage 8. Tests can set `resists` or the sheet fields.
- World packets and the direct HP writers (hunger, pit climb-out, spike-gap, blood door) do not use resist.
- Every live attack is still typed Physical. The proposed mapping is in the Stage 2 history. It is not applied.
- `mods.fire` is still `pw = fire + level * 2`.

### Stage 1 implemented architecture

Implemented now:

- Types: Physical, Fire, Cold, Lightning, Poison, Shadow. Every current combat caller sends Physical.
- Tags, separate from types: Melee, Ranged, Spell, Projectile, AoE, DoT, Direct, Channelled. Channelled is unused.
- One resolver, `resolveDamage`. Player order: Shift/Clone, Ethereal Shield ×0.75, roll and hit-stun, block, `DEF/(DEF+30)` on Physical only, spread, floor 1, champion crit, thorns, barrier, HP. Enemy order: immunities, guard ×0.15, ram armor, Hellmouth ×1.10, floor 1, boss/Super Elite shield, HP. World (`envHurt`): Shift, then `max(1, round(amount))`, no armor and no Ethereal Shield.
- `elementalResist` existed in Stage 1 and returned 0. Stage 2 fills that function. The caps, penetration, and negative-resist vulnerability are in the Stage 2 block above. Hellmouth's ×1.10 is the existing boss mark, not a resist.
- Conversion graph rejects self-edges, duplicate edges, and cycles. A moved component does not chain unless the next edge sets `chain: true`, and that hop cannot chain again. The list is empty in play. Stage 3 added the chain flag and the duplicate rejection. No loot adds an edge.
- Critical ×2 for a default character is still applied once inside `rollDmg`. Stage 3 made the multiplier `2 + critDmg/100` and kept the resolver from applying it a second time. Champion crit stays separate.
- `mods.fire` is still spell power (`pw = fire + level * 2`). It is not a Fire component. Reinterpreting it is **planned** (Stages 7, 10, 12).
- Hunger, pit climb-out, spike-gap ticks, and blood doors still write HP directly. They are not combat packets.
- Hellmouth still sinks Super Elites because `T.boss` is false, then `killEnemy` deletes them. Changing that is **planned** (Stage 9).

Stage 4 added the status engine described above. Stage 5 added poise and stagger on that bag. Not implemented: weapon identities, elite affixes, new boss phases, behavioral item affixes, damage-number presentation, character-sheet resists. Those remain later stages.

### Damage types

**Baseline record.** Current callers still produce these scalars, with the type field set to Physical.

Every pre-Stage-1 combat number was a scalar. It still is, for every attack that exists today.

Stage 2 added Fire, Cold, Lightning, Poison, and Shadow resist. No live caller sends those types, so the numbers under this heading are still what combat does. Poison puddles and the on-fire environment effect are still delivery rules on the Physical or world path, not elemental packets. Gear `mods.fire` is added only inside Fireball, Whirlwind, and Frost Nova as spell power:

```
pw = mods.fire + level * 2
```

Weapon hits, bows, and enemy hits never add `pw`. The affix line is `+N Fire Damage (skills)`.

Before Stage 1, attack tags were not data. They were implied by which function was called. Stage 1 stores them on the packet. The call-site mapping is in the Stage 1 history. The formulas under this heading are still the live numbers.

### Where damage is born

**Player**

| Source | Function | What the number is |
| --- | --- | --- |
| Fists, melee | `rollDmg` → `doAttack` → `damageEnemy` | Integer from sheet min–max inclusive. Crit ×2 inside the roll. |
| Power attack | `powerAttack074` sets `PWR_MUL` then `doAttack` | The roll, then ×1.50 to ×2.25. Life steal uses the pre-multiplier roll. |
| Bow | `fireBow` | One `rollDmg` stored on the arrow. No power multiplier, no life steal. Crit flag is dropped on impact, so the floater has no `!`. |
| Fireball | `castSkill(0)` | `(8 + pw * 1.4) * amp`. No crit, no life steal. Splash if center distance `< 18 + enemy radius`: full when `< enemy radius + 4`, otherwise ×0.6. Bolt 170 px/s, life 1.4s. |
| Whirlwind | `castSkill(1)` | `(weaponRoll * 1.4 + pw * 0.5) * amp`. Crit doubles only the weapon roll, before `pw` is added. Life steal uses the summed skill number, before enemy reduction. Radius `32 + enemy radius`. Instant. |
| Frost Nova | `castSkill(2)` | `(6 + pw * 1.1) * amp`. No crit, no life steal. Sets `e.slow = 3.5` before `damageEnemy`, so the slow lands even when the hit is immune. Test is center distance `< 70`. |
| Hellmouth | `castHellmouth` | Not a damage number. See Hellmouth below. |
| Thorns | `powersOnHurt` / `tryBlock` | `pct%` of the pre-defense combat amount (already after Ethereal Shield), sent back through `damageEnemy`. Copies add. Only when `src` is the enemy object, so contact thorns and beams, bolts, and blasts do not. A blocked hit still thorns. Result is still floored at 1 by `damageEnemy`. |

`amp = 1 + skillAmp(i) / 100`. `skillAmp` sums `skillAmp` powers whose skill key matches Fireball, Whirlwind, or Frost Nova. No cap.

Mana: `manaCost` is `ceil(base * m)` with `m = 1`, plus 0.6 if thirst is 0, plus 1.0 if fatigue is 0. Both empty is ×2.6.

**Enemies**

Almost every hit is `e.dmg` times a pattern multiplier, then `hurtPlayer` or `blast` → `hurtPlayer`. The multiplier does not change a type, because there is no type.

| Delivery | Rule |
| --- | --- |
| Contact | `updateEnemies` and the grid-AI contact path. Cooldown 1.1s, boss body 1.0s. Charge ×1.3. |
| Cultist bolt | ×1, speed 90. |
| Archer | 3 arrows ×0.8. |
| Wisp | ×1 bolt after a blink. |
| Spider web bolt | ×0.5 and a 2.2s player slow. |
| Siren ring | ×0.7. |
| Exarch orb | ×1, homing. |
| Seer snipe | ×1.2. |
| Eel erupt | ×1 blast, radius 14. |
| Ghoul leap | ×1 blast, radius 14. |
| Golem slam | ×1.3 blast, radius 36. |
| Bloater | ×1 blast, then poison ground ×0.15 of `e.dmg`. No contact (`noContact`). |
| Crawler trail | poison ×0.12 of `e.dmg` every time the trail is laid. |
| Lobber / boss lob | blast uses the passed damage; poison ground is ×0.15 of that damage. Boss lobs pass `dm * 0.9`. |
| Boss patterns | ring ×0.7, spiral ×0.6, spread ×0.7, hop ×1.1 plus an enraged ring ×0.6, nova ×1.1, slam ×1.15, beam ×1, teleport arrival ring ×0.6. |
| Super Elite | `seTick717`: ×1 on attack frame 2, ×1.7 on powerup frame 3, only if still within about 43 px. About 22% powerups. Next swing 1.25s, or 3.6s after a powerup. `noContact`. |
| Traps | `trapDmg() = 6 + depth * 1.6`, then jet ×0.7, pitfall ×1.3, darts ×1, ceiling ×1, boulder ×1.5. These go through `blast` / enemy projectiles into `hurtPlayer`, not `envHurt`. |

Poison ground in `updateEnemies`: every 0.5s, `hurtPlayer(max(1, h.dmg), { dot: true })`, skipped entirely while `isInvincible` (Ethereal Shift). A roll or hit-stun window still consumes the tick inside `hurtPlayer` and deals 0.

**Environment and other direct HP writes**

`envHurt` rounds, forces at least 1, subtracts from HP, and does not call `hurtPlayer`. It ignores defense, block, barrier, and Ethereal Shield. Ethereal Shift makes the v0.7.10 `envHurt` wrapper return before damage. Non-lethal sources clamp at 1 HP instead of killing.

| Source | Formula | Kills? | Pipe |
| --- | --- | --- | --- |
| Hazard water | 1.5% max HP per second, ticked from an accumulator every 0.5s | No, stops at 1 | `envHurt` |
| Hazard acid | 6% max HP / s | Yes | `envHurt` |
| Hazard lava | 12% max HP / s, and calls `igniteBurn` | Yes | `envHurt` |
| On fire | 8% max HP spread over 4s (`BURN_PCT = 0.08`, `BURN_DOT = 4`) | Yes | `envHurt` |
| Spike-room cycle | 10% max HP when spikes are up (cycle 2.4s, up 1.0s). Also sets `inv0 = 0.3` | Yes | `envHurt` |
| Spike-gap floor | 5% max HP over 2s while stood on (`SPIKE_BITE`) | No, stops at 1 | direct HP in `tickSpikeWalk` |
| Bottomless pit | 50% max HP on the way out (`PIT_DMG = 0.5`), `ceil` | No, stops at 1 | direct HP in `endFall` |
| Hunger / thirst / exhaustion | 0.6% max HP / s times the sum of empty-need weights (hunger 1, thirst 1, fatigue 1.5). All three empty = 2.1% / s | Only while hunger is empty. If hunger is above 0, HP stops at 1 | direct HP in `updateSurvival` |
| Blood door | `ceil(15% max HP)`, paid up front. Refuses when `hp <= cost` | No, the door will not open if the payment would hit 0 or below | direct HP in `useDoor` |

A dodge roll subtracts 1s from the burn's remaining `dot` (and from the visual timer). Water clears burn. Ethereal Shift clears burn and `slowT` every tick and refuses new ignites.

Shift does **not** wrap `updateSurvival`, `endFall`, or `useDoor`. Hunger drain, the pit climb-out, and the blood door still cut HP during Shift. Spike-gap ticks are wrapped and do stop. Clone (`isPlayerUndetected`) stops `hurtPlayer` only. Lava, acid, burn, spike rooms, spike gaps, hunger, and pits still land during Clone.

### Player offense pipeline

`computeStats` sums equipped items. Durability above 0 is full stats. At 0, `wearItem` calls `destroyItem`, which deletes the item. There is no partial-durability penalty. `isBroken` is defined and never called. The comment above the durability block still says a broken item stays in the bag and gives no stats. That comment is stale. On load, `fixItem` raises a saved durability of 0 up to 1 rather than shattering.

| Stat | Formula |
| --- | --- |
| Weapon min / max | Item min / max, or fists 1–3. Then `+ mods.dmg`. Then `+ floor(level / 2)` on both ends. |
| Attack speed | `weapon.spd * (1 + attackSpeed% / 100)`. Fists use 1. |
| Swing cooldown | `0.45 / attack speed` seconds. While fatigue is 0 the cooldown clock advances at 80% speed, so the wait is 1.25×. |
| Crit chance | `5 + sum of crit mods`. No cap. |
| Life steal | Sum of leech mods, percent. No cap. Heals `roll * leech / 100` of the pre-mitigation melee or whirlwind number. Fractional HP is kept. Bows, Fireball, and Frost Nova never call `leech`. |
| Fire power | Sum of `mods.fire`, including a staff's built-in fire. Built-in staff fire is not scaled by item level. Unique fire mods are scaled by `(1 + itemLevel * 0.05)` and then the unscaled staff fire is added. |
| Max HP | `50 + level * 10 + life mods`. A new level-1 character starts at 60 / 60 before gear. |
| Max mana | `20 + level * 5 + mana mods`. Level 1 starts at 25 / 25. |
| Life regen | `0.4 + regen mods + level * 0.05` HP per second. |
| Mana regen | `1.4 + level * 0.1` per second. No gear mod. |
| Defense | Sum of helm, armor, boots, and shield `def`, plus `+Defense` mods. Rings and amulets contribute mods only. |
| Block | `min(40, shield.block)`. One shield slot. `BLOCK_CAP = 40`. |

Item level on drop: weapon `scale = 1 + itemLevel * 0.06` on min and max. Uniques then ×1.3 on that weapon damage. Defense on a drop is `baseDef + floor(itemLevel / 3)`, uniques ×1.3. Unique listed mods use `(1 + itemLevel * 0.05)`.

Shop sealed uniques (`rollShopUnique`) roll a unique at a derived item level, then multiply again:

```
mul = 1 + depth * 0.015 * tier + min(1.2, price / 700)
min, max, def *= mul
block = min(40, round(block * (1 + tier * 0.04)))
each mod *= (1 + tier * 0.12 + depth * 0.004)
```

Weapon bases before item-level scale:

| Base | Min–max | Spd | Reach |
| --- | --- | --- | --- |
| Fists | 1–3 | 1.00 | 18 |
| Rusty Sword | 1–4 | 1.00 | 24, `noDrop` |
| Short Sword | 2–5 | 1.00 | 24 |
| Hand Axe | 3–7 | 0.90 | 28 |
| Broad Sword | 5–10 | 1.00 | 24 |
| Gnarled Staff | 3–6 | 1.00 | 40, +4 fire |
| War Axe | 8–15 | 0.85 | 28 |
| Great Maul | 12–24 | 0.70 | 34 |
| Rune Blade | 12–20 | 1.10 | 24 |
| Archon Staff | 8–14 | 1.00 | 40, +12 fire |
| Short Bow | 3–7 | 1.05 | arrow travels `220 * 0.95` ≈ 209 px |

Reach is by icon inside `weaponReach713` (`sword` 24, `axe` 28, `maul` 34, `staff` 40). An item `range` field would override the icon, and nothing that drops sets `range`. Power attacks add +6 px (`PWR.reach`). The melee cone rejects targets more than 1.1 rad off facing (about 126° total) unless they are inside `8 + enemy radius`, which includes hits from behind.

Melee order:

1. Roll min–max inclusive (`irand`).
2. If `random * 100 < crit%`, double the roll.
3. Life steal from that roll.
4. Multiply by `PWR_MUL` (1 unless a power attack is resolving).
5. Each enemy in the cone gets a fresh roll.
6. `damageEnemy` applies enemy reductions, rounds, floors at 1, then spends boss or Super Elite shield before HP.
7. HP changes on the frame the swing starts. `player.swing` is 0.22s for a tap and 0.30s for a power attack, and that timer is only animation and the 55% move-speed penalty. A connecting melee swing advances `WEAR_HITS` (6). A bow calls `wearWeapon` even when the arrow misses.

Power attack: hold at least 0.35s, full at 0.9s, multiplier linear from ×1.50 to ×2.25, knockback ×2, reach +6. Move speed is 60% while the charge is past 0.35s and 55% during the swing. A bow still shows the charge ring. `doAttack` sees the bow and calls `fireBow`, which ignores `PWR_MUL`.

Unique bows change the arrow graphic and their mods only: Scream of the Banshee +5 damage / +10 crit, Spine of the First Lich +6 / +6, Hellmouth Strider +4 damage / +8 fire. That fire still only feeds spells.

Other tome spells, not in the weapon roll:

| Spell | Mana / cd | Effect |
| --- | --- | --- |
| Spectral Clone | 12 / 8s | Decoy for 4s. `tomeSeek` retargets enemies. The `hurtPlayer` wrapper returns immediately while `isPlayerUndetected`. Environment damage still lands. |
| Ethereal Shield | 10 / 15s | `isArmorActive` for 5s. The wrapper multiplies the incoming `hurtPlayer` amount by 0.75 before defense, block, and the DoT check. |
| Ethereal Shift | 14 / 12s | `isInvincible` for 4s. Clears burn and slow. The wrapper skips combat hits. Separate wrappers skip `envHurt`, new ignites, and spike-gap ticks. |
| Hellmouth | 18 / 6s | See below. |

### What `damageEnemy` does

Order, then `max(1, round)`:

1. Return if dead, hidden, downed (revenant), or a Super Elite whose `sePhase` is not `fight`. Floater `IMMUNE` on the Super Elite case.
2. Crab whose `mode` is not `open`: immune. Floater `IMMUNE`.
3. Hollowmere Guard, hit from the front (`da < 1.0` rad, about 57°): ×0.15, floater `BLOCK`. Knockback ×0.2.
4. Bone Ram, unless `mode === 'stun'`: ×0.40 (`armor: 0.4`).
5. `mawVuln > 0`: ×1.10.
6. Floor at 1.
7. If a boss or Super Elite still has `shield`, that pool spends first. Overflow hits HP. A hit that only touches the shield shows a blue number and no crit mark.
8. Crit floater (`N!`) only when HP actually dropped.

No pierce and no second roll. A non-Physical component is reduced by `elementalResist` once before the guard, ram, and Hellmouth steps. Every live caller is still Physical, so those hits still skip that reduction.

Crab contact is the other way around from the shell: `updateEnemies` allows contact while the shell is closed and suppresses contact while `mode === 'open'`. The open window is when the player can hurt it, and the crab is not biting on that tick.

### What `hurtPlayer` does

Call order across the two wrappers and the original function:

1. v0.7.12 wrapper sets `hidePlayerDmg712` so numeric floaters in `PLAYER_DMG_COL_712` are swallowed for this call.
2. v0.7.10 wrapper: if `isInvincible` or `isPlayerUndetected`, return. No damage.
3. v0.7.10 wrapper: if `isArmorActive`, `dmg *= 0.75`.
4. Original: if `inv0 > 0` or `roll > 0` or state is not `play` or a death is already running, return. The 0.75 from step 3 has already been applied to a number that is then discarded.
5. If this is not a DoT, `tryBlock`. Success: 0 damage, `inv0 = 0.25`, 1 shield durability, on-block barrier rolls, thorns from the post-shield pre-defense amount, return.
6. `reduction = DEF / (DEF + 30)`.
7. Spread ×0.85 to ×1.15 (`window.__hurtSpread` pins it in tests).
8. `d = max(1, round(amount * (1 - reduction) * spread))`.
9. If not a DoT and the attacker is a champion (`elite` and not `T.boss`): 10% chance to add `round(amount * 0.05)` **after** defense. The bonus uses the pre-defense number, so armor does not shrink it. It snuffs a held torch when HP actually falls. Floater word is `CRIT`. Bosses do not use this crit. Super Elites are not `elite`, so they do not either.
10. If not a DoT: `powersOnHurt` (on-hurt barrier, fear pulse, thorns), then `absorbBarrier`. If the barrier eats the whole remaining hit, `inv0 = 0.3` and HP does not fall.
11. HP drops. A real HP loss on a non-DoT grants `inv0 = 0.45`, a small knockback, and a 40% chance to wear 1 durability off a random armor piece (`ARMOR_WEAR_P = 0.4`). DoTs do not grant invulnerability, do not wear armor, do not thorns, do not roll block, do not use barrier, and do not roll champion crits. DoTs **do** receive the Ethereal Shield ×0.75 and the defense curve, because those happen before the DoT branch.

Defense keep fraction:

| DEF | Damage kept |
| --- | --- |
| 0 | 100% |
| 10 | 75% |
| 30 | 50% |
| 60 | 33% |
| 90 | 25% |
| 120 | 20% |
| 200 | 13% |

There is no defense cap. The floor of 1 means a hit that gets past block and barrier always removes at least 1 HP, including poison ticks and guard-front or ram-reduced hits.

Invulnerability windows:

| Window | Length | Stops |
| --- | --- | --- |
| Dodge roll | 0.30s (`ROLL_TIME`), then up to +0.50s from the largest Dodge power (`dodgeWindow`, cap 0.5) | `hurtPlayer`, including poison ticks |
| After HP loss | 0.45s | same |
| After a block | 0.25s | same |
| After barrier eats the hit | 0.30s | same |
| Ethereal Shift | 4s | combat, `envHurt`, new burns, spike-gap ticks |
| Spectral Clone | 4s | combat only |

The player has no stun. Rams and boss charges stun themselves on a wall. Slows on the player multiply move speed only: web corridor ×0.45, hazard water ×0.55, any `slowT` ×0.6. Hunger, thirst, and fatigue under 25% each shave move speed, down to ×0.70 combined (`survSpeed`). Enemy frost slow is a different field: trash move speed ×0.45 while `e.slow > 0`, bosses ×0.5, Super Elite chase ×0.5.

Life potions heal `45% max HP + 10`. They do not interact with defense.

Barrier amount is `round(maxHP * pct / 100)` for the power's duration (data is about 5–8s). Several copies do not add. `Math.max` keeps the bigger pool. Fear pulse shoves non-bosses. A Super Elite has `T.boss === false`, so it receives `fearT`, and `updateEnemies` will step it away. `seTick717` then steps it toward the player in the same frame. Chill aura writes `auraPct` onto enemies in range, capped at 40% slower, and boss/trash movement honors `auraMul`. Super Elite chase in `seTick717` does not read `auraMul`.

### Enemy scaling

Trash and champions (`spawnEnemy`):

```
HP  = round( hp0 + hp1 * (depth - 1) ) * (champion ? 2.2 : 1)   // the 2.2 is applied with round()
DMG = ( dm0 + dm1 * (depth - 1) ) * dmgBump(depth) * mobDmgMul(depth) * (champion ? 1.4 : 1)
```

```
dmgBump(d, boss) = 1.08 + (boss ? 0 : 0.17 * max(0, 1 - (d - 1) / 10))
mobDmgMul(d)     = d > 12 ? min(2.5, 1 + 0.08 * (d - 12)) : 1
```

`mobDmgMul` hits trash and champions only. Bosses use `dmgBump(d, true)` which is a flat ×1.08. Super Elites use non-boss `dmgBump` and do not use `mobDmgMul`.

The `MOBS` table in `index.html` matches the brief's base HP and damage columns (depth-1 values before the bump). Champion contact can crit. Boss contact cannot.

Worked skeleton contact after bump and the post-12 ramp:

| Depth | Skeleton | Champion skeleton |
| --- | --- | --- |
| 1 | 20 HP, 6.25 dmg | 44 HP, 8.75 dmg |
| 100 | 614 HP, 414.45 dmg | 1351 HP, 580.23 dmg |

### Bosses

Every 5th floor. Twenty bosses, then the list repeats with a cycle (`bossForDepth`).

```
HP  = round( (240 + 60 * (depth - 1)) * boss.hp * 1.5^cycle * 1.75 )
SH  = round( HP * 0.25 )
DMG = (8 + 2.2 * (depth - 1)) * 1.25^cycle * 1.08
```

`BOSS_HP_MUL = 1.75`. `BOSS_SHIELD_FRAC = 0.25`. Per-boss HP multipliers: Ossuary Colossus ×1.3 (floor 55), Captain Brannoc ×1.2 (floor 65), Oswin ×1.6 (floor 100). Cycle starts at floor 105.

Phases read **HP only**, after the shield is already broken (shield is spent before HP moves, and the phase check compares `e.hp` to `e.maxHp`):

| Phase | When | What changes |
| --- | --- | --- |
| 1 | Start | Pattern list `p1`. |
| 2 | HP < 50% | `enr = 1.25` move speed. Gains `p2`. Pattern clock runs ×1.5 (`patCd` decays ×1.5). `e.dmg` does not change. |
| 3 | Oswin only, HP < 25% | `enr = 1.4` move. Gains `p3`. Pattern clock stays ×1.5. |

A cantor heals a boss for 4% of max HP and anyone else for 25%. The heal does not refill shield.

### Super Elites

One per floor, at the stairs (`sePlan717` / `seSpawn717`). Descent is refused while `seGateAlive717()`. All 20 roster ids share one stat line. Art, taunt, and VFX names differ. `T.boss` is false. `T.superElite` is true. `elite` is false.

```
HP  = round( round( round(18 + 7 * (depth - 1)) * 2.2 ) * 1.4 )
SH  = round( HP * 0.10 )
DMG = (3.2 + 0.85 * (depth - 1)) * dmgBump(depth) * 1.4 * 1.15
```

Speed 36 (player base 62). Radius 12. XP `round(48 + 14 * depth)`.

Phases are time-based, not HP thresholds: drop 0.48s (immune), taunt 0.66s (6 × 0.110s, immune), then fight. Frost slow is written before `damageEnemy`'s immune return, and `e.slow` keeps ticking during the intro, so some of the 3.5s can expire before the fight phase. Once fighting, chase speed is ×0.5 while `e.slow > 0`.

Killing one does not run boss death. Loot is 25 gold, a ration, a unique, and a 6.5% Gate Key (`SE_GKEY_P`). `killEnemy` commits the Super Elite dead before loot so a throw cannot freeze the run (the v0.7.18 fix).

### Hellmouth

`mawTargets` gathers living, visible, not-downed, not-disguised enemies in line of sight within `SPELL_RADIUS` (112 px).

`castHellmouth` splits that list with `e.T && e.T.boss`:

- Bosses get `mawVuln = max(current, 3)` and are not sunk. `damageEnemy` multiplies by 1.10 while `mawVuln > 0`. The timer decays in the v0.7.11 update hook.
- Everyone else, **including Super Elites**, is frozen and sunk. After the sink animation passes frame 90 (about 1.5s at 60 fps), `killEnemy` runs. That deletes the Super Elite, shield included, and opens the stairs. `damageEnemy`'s taunt immunity is never consulted.

This is intentional-looking code (`T.boss` is hardcoded false on Super Elites) and it bypasses the stair lock. It is a Stage 9 issue. Stage 1 must not change it while moving damage through an adapter, or the bypass gets lost in the migration.

### The four shields

| Name | What it is | Code |
| --- | --- | --- |
| Equipped shield | Block chance. A success negates the hit. Cap 40%. | `tryBlock`, `st.block` |
| Boss / Super Elite shield | A blue absorb pool in front of their HP. No regen. | `e.shield` inside `damageEnemy` |
| Ethereal Shield | 25% cut to incoming `hurtPlayer` damage for 5s, including DoTs, before defense. | `isArmorActive`, hurtPlayer wrapper |
| Barrier | A flat life pool that soaks post-defense combat damage. Not used on DoTs. | `absorbBarrier` |

### Sheet, tooltips, and feedback

The live character dossier is `charPairs712`, drawn by the latest `paintChar`. It shows level, depth, life, mana, weapon `DMG` min–max, `DEF`, `BLK` (capped), `CRIT` (includes the 5% base), `ATK` as `round(aspd * 100)%`, `LEECH`, food, water, rest, gold, keys, consumables, kill tolls, favorite spell, and favorite weapon.

It does not show fire power, any resist, move speed, life regen, mana regen, Ethereal Shield, barrier, or the defense keep-percent.

Satchel item card (`fillInvStats`):

| Line | Shows | Combat uses |
| --- | --- | --- |
| DMG | The item's own min–max | Melee, bow, and the weapon half of Whirlwind, after `+Damage` and `floor(level / 2)`, which the card omits. |
| SPD | `n/S` from the weapon's base speed | Sheet `ATK %` is the haste-adjusted attack rate. Cooldown is `0.45 / aspd`. |
| CRIT | That item's crit mod, or the string `0` | Sheet crit is `5 + sum of mods`. |
| RANGE | `-` unless `it.range` is set | Reach is by icon, 18–40, or the bow's flight distance. |
| PIERCE | `-` unless a `pierce` field exists | Nothing rolls pierce. Arrows die on the first body. |
| Compare | Average of raw min/max, or base def | Ignores `+Damage`, level bonus, and mods. |

`itemLines` (the older text list) prints speed as the words Fast / Normal / Slow, not `n/S`. Both surfaces are still in the file.

Outgoing enemy floaters (`addFoeText`) honor the Hit Text setting. White number is HP removed after shield and reductions. Gold `N!` is a player crit that reached HP. Blue number is shield absorbed. `BLOCK` on a foe is the guard reduction, and damage was not zero. `IMMUNE` is crab shell or a Super Elite still dropping or taunting. `BLOCK` on you is your shield. `CRIT` on you is the champion bonus word; the red amount is hidden. `BARRIER` and the blue `-N` (`#80e8ff`) still show, because that color is not in `PLAYER_DMG_COL_712`. Numeric player damage in `#ff5050`, `#ffe060`, `#a0e040`, `#ff3030`, `#ff7040`, `#ffa040`, `#ff7030`, `#80b0ff`, and `#e07060` is hidden while `hurtPlayer`, `envHurt`, `endFall`, `spikeDotBody`, `tickSpikeWalk`, or `useDoor` is on the stack. Boss and Super Elite bars stay up when trash bars are hidden.

### Important constants

`BLOCK_CAP = 40`. Defense curve constant `30`. Crit base `5`, multiplier `2`. `CHAMP_CRIT_P = 0.10`, `CHAMP_CRIT_BONUS = 0.05`. `PWR = { min: 0.35, full: 0.9, mulMin: 1.5, mulMax: 2.25, reach: 6, kb: 2 }`. `ROLL_TIME = 0.3`. Post-hit i-frames `0.45`, block `0.25`, full barrier absorb `0.3`. `WEAR_HITS = 6`. `ARMOR_WEAR_P = 0.4`. `BOSS_HP_MUL = 1.75`. `BOSS_SHIELD_FRAC = 0.25`. `SE_SHIELD_FRAC = 0.10`. `SE_GKEY_P = 0.065`. `SPELL_RADIUS = 112`. `BOW_SPEED = 220`. `HAZ_DPS = { water: 0.015, acid: 0.06, lava: 0.12 }`. `BURN_PCT = 0.08`, `BURN_DOT = 4`. `SPIKE_HIT = 0.10`. `SPIKE_BITE = 0.05` over 2s. `PIT_DMG = 0.5`. `DMG_BUMP = { base: 1.08, early: 0.17, fade: 10 }`. `MOB_DMG_STEP = 0.08`, `MOB_DMG_MAX = 2.5`, cap depth 12. Ethereal Shield duration 5s at ×0.75. Shift and Clone durations 4s.

### Save-data dependencies

See the Stage 0 compatibility notes. The short version: gear mods and enemy HP/shield live in the save. Barrier, Ethereal Shield, Shift, Clone, burn, and spell cooldowns do not survive a load (barrier and the tome buffs are explicitly cleared). A Stage 1 packet must be derived at resolve time from these fields, not stored as a second source of truth that can drift from `mods.fire` or `e.dmg`.

---

## Brief versus code

The v0.7.18 brief is accurate on the systems that matter for Stage 1: one scalar pipe, `DEF / (DEF + 30)`, the four shields, spell formulas, scaling, boss and Super Elite numbers, and Hellmouth treating Super Elites as non-bosses. The `MOBS` rows match the brief's base HP and damage columns. These are the places the code is more specific than the brief, or the brief's wording is slightly wide.

1. **Wrapper order.** The brief lists roll and hit-stun before Ethereal Shield, and groups Shift and Clone with that early-out. In code, Shift and Clone return in the tome wrapper first, Ethereal Shield then multiplies, and roll / `inv0` return inside the original `hurtPlayer` after that multiply. A hit that is already going to be ignored is still multiplied by 0.75 and then thrown away. Final HP matches the brief.
2. **Whirlwind crit.** The brief says crit and life steal use the whole skill number. Life steal does. Crit doubles only the weapon roll inside `rollDmg`. Fire power is added after the double. The crit floater still marks the whole HP loss.
3. **Fireball splash radius** is `18 + enemy radius`, not a flat 18 px. Full damage when the blast center is inside `enemy radius + 4`.
4. **Frost Nova** tests center distance `< 70`. Whirlwind tests `< 32 + enemy radius`. A large enemy can be clipped by Whirlwind when its edge overlaps, and missed by Frost Nova until its center is inside 70.
5. **Chill aura does not slow Super Elite chase.** `updatePowers` still writes `auraT` / `auraPct` onto them. `seTick717` never reads `auraMul`. Trash and bosses do.
6. **Ethereal Shift's coverage.** Shift blocks `hurtPlayer`, `envHurt`, new ignites, and spike-gap ticks. It does not block hunger / thirst / exhaustion drain, the 50% pit climb-out, or the blood-door payment. The brief's "Shift stops it" under the environment section is wider than the wrappers.
7. **Crab contact while open is suppressed**, and contact while shelled still runs. Shell immunity to incoming damage matches the brief. The brief does not mention the inverted contact rule.
8. **Hellmouth is not an instant delete.** The sink lasts until animation frame 90, about 1.5s, with `hmFreeze` set, then `killEnemy`. The outcome matches the brief: Super Elites die, shield included, because `T.boss` is false.
9. **Shop unique rescaling** is the `rollShopUnique` formula above, not a single extra constant. The brief's "+4% of block per shop tier, then the 40% cap" matches the block line.
10. **Power-attack animation** is 0.30s. A normal swing's `player.swing` is 0.22s. Both apply damage on the first frame.
11. **Stale durability text** is the code comment at the durability block, plus the unused `isBroken` helper. No separate player-facing sentence saying "stays in the bag" was found. Behavior is shatter-and-remove, which the brief describes correctly.
12. **Super Elite depth-10 attack** evaluates to about 19.16. The brief prints 19.2. Same formula, rounding.

No other brief formula that was evaluated disagreed with the code.

---

## Design Decisions

D1–D7 below are the Stage 0 recommendations. Stage 1 implemented them. The text of each decision is the original recommendation and was not rewritten. Stage 1 notes follow D7.

### D1 — Thin DamagePacket and one resolveDamage adapter

- **Problem.** Player offense, player defense, and environment damage are three pipes, and `hurtPlayer` already has two wrappers. Stage 2–11 will each add a rule. If every caller grows its own copy, armor will be applied twice or skipped.
- **Alternatives considered.** (a) Rewrite every caller onto a new combat module in one pass. (b) Leave the functions alone and bolt resists onto `hurtPlayer` only. (c) Introduce a packet and a single resolver, and make the current functions forward to it.
- **Selected approach.** (c). A packet is a plain object:

  - `amount` — pre-mitigation magnitude of this component.
  - `type` — one of `Physical`, `Fire`, `Cold`, `Lightning`, `Poison`, `Shadow`.
  - `tags` — zero or more of `Melee`, `Ranged`, `Spell`, `Projectile`, `AoE`, `DoT`, `Direct`, `Channelled`. Tags are not types.
  - `source` — the attacker object, a projectile, or null.
  - `crit` — whether this component already crit. The ×2 stays inside the roll during Stage 1 so the floater can still be driven by the flag. The resolver must not multiply by 2 again.
  - `attacker` — `player`, `enemy`, or `world`.

  Stage 1's `resolveDamage(target, packet)` implements today's order and nothing else. `damageEnemy` and `hurtPlayer` become adapters. `envHurt` and the direct writers (hunger, pit, blood door) either stay on a clearly named world path or send a packet tagged so the combat curve is skipped. New code calls `resolveDamage`. Old callers are migrated one at a time and deleted only when the adapter result matches.
- **Reason.** The game is one HTML file. A full module split is a larger change than Stage 1 needs. Leaving resists only on `hurtPlayer` would miss `damageEnemy` and make enemy armor in Stage 8 a third copy.
- **Expected gameplay impact.** None visible, if the parity checks below hold.
- **Tradeoffs.** The adapter will sit beside the wrappers for a while. Stage 1 has to fold the tome wrapper and the floater-hiding wrapper into the adapter's call path so Ethereal Shield is not applied both outside and inside.

### D2 — Physical armor stays DEF / (DEF + 30), applied once

- **Problem.** The live curve is soft mitigation, not flat armor and not a resist. Renaming it carelessly, or running it in the adapter and again in `hurtPlayer`, would change time-to-kill.
- **Alternatives considered.** Flat armor subtract, a hard cap, or a new curve in Stage 1.
- **Selected approach.** Keep `reduction = DEF / (DEF + 30)` as the Physical rule. Name it in comments as physical armor mitigation. Call it once, on Physical components that use the combat pipe. Environment and cost packets skip it. The integer floor of 1 stays. The 0.85–1.15 spread stays. Stage 2 adds elemental resists as separate stats. It must not run this curve on Fire, Cold, Lightning, Poison, or Shadow.
- **Reason.** The curve is the game's defense identity, and the brief's tuning notes depend on the constant 30.
- **Expected gameplay impact.** None in Stage 1.
- **Tradeoffs.** High DEF remains strong and never reaches immunity. That is current design. Changing the constant is a balance change and is out of scope until Stage 13, and only with Jake's numbers.

### D3 — Stage 1 migrates callers as Physical and keeps baseline time-to-kill

- **Problem.** The six type names need a home before Stage 2, but no content deals Fire or Cold yet. Inventing elemental numbers now would change kills per minute.
- **Alternatives considered.** Give Fireball the Fire type immediately and leave it unresisted, or wait to introduce the type enum until Stage 2.
- **Selected approach.** The enum exists in Stage 1. Every current combat caller is tagged `Physical` plus the right attack tags (melee swing: `Melee` + `Direct`; bow and enemy bolts: `Projectile`; Fireball: `Spell` + `Projectile` + `AoE`; Whirlwind: `Spell` + `AoE` + `Melee`; Frost Nova: `Spell` + `AoE`; poison puddle: `DoT`; traps that use `hurtPlayer`: `Direct`). They still use the Physical curve, block, barrier, and Ethereal Shield exactly as today. Elemental resists are Stage 2. A parity check is part of the stage: pinned spread, known DEF, known packet in, known HP out.
- **Reason.** Tags can be correct before the numbers change. Fireball becoming Fire damage is a content change that belongs with resists and tooltips, not with the empty adapter.
- **Expected gameplay impact.** Approximately the same time-to-kill. "Approximately" means pinned-spread unit checks are exact, and live spread remains the existing random 0.85–1.15.
- **Tradeoffs.** For one stage, Fireball is still Physical in the resolver even though the art is fire. The packet's tags may say `Spell` without saying `Fire` until the migration in a later stage. Do not half-migrate.

### D4 — The four shields stay four systems

- **Problem.** One shared "shield" stat would merge block chance, boss absorb, the 25% spell, and the barrier pool, and every one of those has different rules.
- **Alternatives considered.** A single absorb pool with four modes.
- **Selected approach.** Preserve them as separate steps inside `resolveDamage`, in today's order:

  1. Ethereal Shield ×0.75 on combat packets, including DoTs, before armor.
  2. Block chance on non-DoT combat packets. Success ends the hit.
  3. Physical armor curve, spread, floor 1, then champion crit add.
  4. Thorns from the pre-armor amount.
  5. Barrier pool on non-DoT combat packets.
  6. On an enemy target, boss / Super Elite absorb pool, then HP.

  Environment packets skip steps 1–5. Shift and Clone stay early-outs, not shields.
- **Reason.** This is the order that reproduces v0.7.10 and v0.7.9 tests (100 damage with the spell up loses 75; a champion crit on 100 at 0 defense loses 105).
- **Expected gameplay impact.** None if the order is kept.
- **Tradeoffs.** The word "shield" will remain overloaded in UI until Stage 11 and 12 rename the surfaces. The code should use the four names above so later stages do not merge them by accident.

### D5 — Conversion is an explicit DAG, and Stage 1 does not convert anything

- **Problem.** Stage 3 adds damage conversion. A recursive "50% of physical becomes fire, 50% of fire becomes physical" loop would duplicate damage.
- **Alternatives considered.** Convert in place with a recursion cap, or forbid conversion until Stage 3 and design the graph then.
- **Selected approach.** Stage 1 ships the rule even though no edge exists. Conversion is a list of edges `from → to` with a fraction. The resolver applies each edge once, in list order, and marks the moved amount so it cannot take another edge. A self-edge is rejected. A cycle in the declared list is rejected at build time, not clamped at runtime. With an empty list, the packet is unchanged.
- **Reason.** The invariant is cheap to lock with a test now, and expensive to rediscover after items start rolling conversion.
- **Expected gameplay impact.** None in Stage 1.
- **Tradeoffs.** Stage 3 cannot express "convert back and forth until a cap." That is the point.

### D6 — Gear `fire` stays spell power until a deliberate migration

- **Problem.** The affix text says `+N Fire Damage (skills)`. Combat adds it to `pw` for three spells and never to weapon hits. If Stage 1 starts adding `mods.fire` to a Fire component on every hit, melee and bows gain a damage source they do not have, and spell power double-counts once `pw` is also left in place.
- **Alternatives considered.** Rename the mod to `spellPower` in Stage 1, or split it into real Fire damage now.
- **Selected approach.** Leave the key `fire` and the `pw = fire + level * 2` formula untouched through Stage 1. Record the flag `legacySkillPower` on that mod in this changelog. A later stage (skill migration, then gear affixes, then tooltips) may turn it into Fire damage. That stage rewrites the tooltip in the same change. Stage 1 does not show it as a Fire component on the packet.
- **Reason.** The stat is load-bearing for current casters and for saved items.
- **Expected gameplay impact.** None until the migration stage.
- **Tradeoffs.** The type named Fire exists in the enum while the only "fire" number in the save is still spell power. The changelog flag is there so that does not get "cleaned up" accidentally.

### D7 — Hellmouth versus Super Elites is frozen until Stage 9

- **Problem.** `castHellmouth` deletes any target that is not `T.boss`. Super Elites set `T.boss` to false on purpose, so Hellmouth removes them, their shield, their taunt immunity, and the stair lock, after a short sink.
- **Alternatives considered.** Fix it in Stage 1 while touching `damageEnemy`, or special-case Super Elites inside the new resolver.
- **Selected approach.** Do not change Hellmouth, `T.boss`, or `killEnemy`'s Super Elite path in Stages 1–8. Add a proposed test that asserts the **current** behavior so a Stage 9 change is visible. The fix belongs with boss and Super Elite rules, where crowd-control immunity and phase protection are designed together.
- **Reason.** Fixing it now is a gameplay change the Stage 0 directive forbids, and fixing it inside a damage adapter would hide an encounter rule inside damage code.
- **Expected gameplay impact.** None until Stage 9.
- **Tradeoffs.** Hellmouth remains a stair-lock bypass on every floor that has a Super Elite in line of sight within 112 px. That is the live game.

### D8 — Elemental resist is a capped percent, and vulnerability is that same number when it is negative

- **Problem.** Stage 1 left `elementalResist` returning 0. Stage 2 has to pick caps, penetration, and a vulnerability rule without a second copy of Ethereal Shield, block, or the DEF curve, and without changing time-to-kill on today's Physical hits.
- **Alternatives considered.** (a) A Diablo III-style armor curve shared with elements. (b) A hard 75% cap with no overcap and a separate ×1.2 vulnerability debuff. (c) Percent resist, soft cap 75, hard cap 90, penetration subtracted before the clamp, negative resist as the only vulnerability.
- **Selected approach.** (c).

  ```
  eff = clamp(rawResist - penetration, -100, clamp(75 + maxResist, 0, 90))
  multiplier = (100 - eff) / 100
  ```

  The DEF curve stays Physical-only. Resist runs once per non-Physical component beside that curve on the player, and once per non-Physical component before guard / ram / Hellmouth on an enemy. Ethereal Shield still happens first, once, on the component amount. Block, thorns, barrier, and champion crit still see the pre-resist amount. World packets and direct HP writers skip the new curve. Live callers stay Physical. The attack and hazard table in the Stage 2 history is a proposal, not a retune. `mods.fire` stays spell power. Sheet fields exist so a test can set a resist; loot does not roll them.
- **Reason.** Percent resist is the rule the rest of the pipeline can share, the soft cap matches the familiar 75, the hard cap stops a raised maximum from becoming immunity, and one signed number cannot be applied twice as both "resist" and "vulnerable."
- **Expected gameplay impact.** None on current characters and current attacks. A future Fireball retargeted to Fire would then use this curve.
- **Tradeoffs.** Overcap above 75 absorbs penetration before the cap binds, which is easy to misread as "100 resist is 100%." The sheet stores the raw sum. The resolver clamps. Enemy content resists stay 0 until Stage 8, so the curve is real and the content is not.

### D9 — Player crit is one multiplier, and scaling is an identity until a mod says otherwise

- **Problem.** `rollDmg` already multiplies by 2. A resolver crit step on the same flag would double Whirlwind's weapon roll and would also double the spell-power add. Life steal samples a different number than the hit. Conversion can copy damage if an edge both moves and leaves the original.
- **Alternatives considered.** (a) Move the ×2 into the resolver and split Whirlwind into two components now. (b) Leave ×2 in `rollDmg`, mark the packet already crit, and let the resolver multiply only a packet that explicitly asks. (c) Unify champion crit with the player multiplier.
- **Selected approach.** (b). Chance stays `5 + mods.crit`, uncapped. Crit damage is `2 + critDmg/100`, default ×2. Skill adds are test-only and are not saved. Outgoing order is crit on the base, then flat, then increased, then more, then a type bonus, then conversion, then the Stage 2 mitigation. Power-attack and Fireball splash are more factors. Conversion moves a fraction, rejects duplicate edges, and chains only when an edge says `chain: true`, once. Penetration stays the Stage 2 function and stores its result so a second call does not add pen again. Life steal keeps the pre-mitigation, pre-power-attack base for melee and the skill sum for Whirlwind. Bows and the other two spells still do not heal. Champion crit stays the +5% after mitigation. No affix was added. `mods.fire` stays spell power. Hellmouth stays.
- **Reason.** Default gear then produces the same integers Stage 1 and Stage 2 locked. The new knobs exist for tests and for later loot without changing time-to-kill now.
- **Expected gameplay impact.** None on a current save. A hand-set `critDmg`, flat, increased, more, or type bonus changes that hit, and life steal follows the scaled pre-mitigation number except it still excludes the power-attack more.
- **Tradeoffs.** Crit does not multiply flat damage. Two components each receive generic flat. The bow floater still has no `!`. The pixel sheet still shows chance only. The text stats line shows the multiplier.

### D10 — Statuses are one bag, and legacy timers stay legacy

- **Problem.** Bleed, burn, poison, chill, freeze, shock, and curse need application, duration, ticks, refresh, caps, immunity, and a source. The game already has frost slow, a chill aura, poison ground, environmental burn, fear, and self-stun. A second clock for the same legacy effect would either double the slow or change the damage type.
- **Alternatives considered.** (a) Move every old timer into the new bag and retune the numbers. (b) Leave the old timers alone and add a new bag for the new effects, with a read-only view of the old ones. (c) Drive the old timers from the bag but keep the call sites setting the same fields.
- **Selected approach.** (b), with the movement multiplier and the damage resolver reading the new bag only when a status is present. Poison ground and environmental burn are not retyped. Frost Nova still writes `e.slow`. DoT ticks are packets: no crit, scale once when the attacker is the player, mitigation once, then shock once if the target is shocked. Stack counts, durations, and the freeze lockout are capped. Bosses and Super Elites are freeze immune and take 40% chill. Curse can cut outgoing damage and resist. Its life-drain number is stored and does not change `leech`.
- **Reason.** A current hit with no status is the Stage 3 hit. The old hazards keep the numbers the legacy harness already locks. The new effects are testable without a loot pass.
- **Expected gameplay impact.** None until something applies a status. Nothing in live combat does. No affix and no shop price changed.
- **Tradeoffs.** Two slow sources can multiply if a legacy slow and a new chill are both up. They are different effects and each is capped. Shock does not change world packets such as lava. A DoT on a player who is in i-frames is prevented and the interval is still spent, which matches poison ground. Hellmouth's sink pause also pauses status ticks. Stage 5 put a 0.2 floor under the product, and a hard stop at 0 for freeze and stagger.

### D11 — Poise is not a second damage pipe, and stagger is a status

- **Problem.** Stage 5 needs a stability resource, a short interrupt, and one rule for stagger, stun, knockback, chill, and freeze. Routing that through HP mitigation would make armor, resist, and shields silently change who staggers. A second timer beside `ent.statuses` would split crowd control across two clocks.
- **Alternatives considered.** (a) Spend poise as a percent of mitigated HP. (b) A parallel poise clock with its own tick. (c) Flat poise by attack class, mitigation left on the HP pipe, stagger stored as a Stage 4 status.
- **Selected approach.** (c). Classes are light, heavy, power, and skill. Tiers set max, taken, duration, immunity, regen, and delay. Block zeroes poise. A guard glance uses the existing 0.2 knockback factor. Armor, resist, barriers, and boss/Super Elite shields do not. Boss intro blocks poise and not HP. Breaks refill 45%, then an immunity, and further breaks in a 6s chain shrink by 0.65 down to 0.12s. Slows floor at 0.2. Freeze and stagger are 0.
- **Reason.** HP time-to-kill stays measurable and unchanged per hit. The opening is the lost action, not a damage bonus. The status bag stays the only crowd-control clock.
- **Expected gameplay impact.** Trash can be staggered. Bosses and Super Elites need many hits and then get a short lock plus a long immunity. A player who eats seven boss contacts is staggered for 0.35s. Stacked slows cannot go under 20% speed unless frozen or staggered.
- **Tradeoffs.** Bows share the light number until Stage 6. Curse life drain, life steal, and the uncapped crit chance are still untouched. A single hitch can drop DoT intervals past the debt cap, and that drop is reported rather than paid twice.

### D12 — Weapon identity is timing, shape, and poise, not a second damage roll

- **Problem.** Stage 5 spent one poise number per attack class. A bow and a fist both spent 18. A maul and a sword spent 18 on a tap. The hit also landed in the same call that started the swing, and a held bow played the melee charge and then fired an ordinary arrow. Adding a flat damage bonus per family would have changed time-to-kill. Letting recovery be cancelled by a roll would have raised it.
- **Alternatives considered.** (a) Scale `min`/`max` per family again and call that identity. (b) Add windup on top of `0.45 / aspd`, which slows every weapon. (c) Keep the damage roll and the period, and vary the cone, the windup fraction, the knockback, the hitstop, and the poise. Leave `doAttack` immediate for callers that already depend on it.
- **Selected approach.** (c). Families are derived from the item. Fist and sword keep the Stage 5 poise row so an untagged packet and a sword tap stay on 18 / 34 / 52 / 14. Axe, maul, staff, and bow replace that row when the swing stamps `weaponFamily`. Power charge and splash still scale that amount the Stage 5 way. The bow's crit floater stays off. The arrow segment test is what stops the open-floor miss. `mods.fire` stays spell power. Hellmouth stays.
- **Reason.** The pinned midpoint time-to-kill does not move, and a heavy weapon still buys stagger by giving up speed, cone, and spell poise.
- **Expected gameplay impact.** Swords feel like the current tap, a fraction later. Axes cleave and stagger sooner. Mauls are narrow and heavy. Staves poke and make spells spend more poise. Bows stay ranged and stop pretending to power-attack. A roll during windup whiffs.
- **Tradeoffs.** A direct `doAttack` is still instant, so the windup is an input-path behavior. Environment clicks that clear `atkCd` still swing immediately. Hitstop does not freeze the simulation. Curse life drain, life steal, and the uncapped crit chance are still untouched.

### Stage 1 implementation notes

D1–D7 are in the code. Refinements forced by the existing formulas:

- Crit ×2 stays in `rollDmg` for a default character. Conversion therefore sees an amount that already includes a melee or Whirlwind weapon crit. The resolver does not apply ×2 again. Moving the double into the resolver would have changed Whirlwind, which crits only the weapon roll and then adds spell power. Stage 3 kept that split and made the multiplier configurable. The resolver still does not multiply a packet marked `critApplied`.
- A player packet with one Physical component uses the exact v0.7.18 expression `max(1, round(amount * (1 - DEF/(DEF+30)) * spread))`. Mixed components sum the post-mitigation floats and round once. Nothing in the live game sends two components yet.
- The tome wrapper remains so later assignments still wrap the same function, but it no longer multiplies and no longer returns early. Shift, Clone, and Ethereal Shield live only in `resolveDamage`.
- `envHurt` is a world packet. Hunger, pits, and blood doors stayed direct writes. A test locks both.

---

## Known Issues and Technical Debt

Severity is about how badly it will mislead a later stage or a player, not about how old the code is. Resolution is OPEN unless noted.

### CRITICAL

- **Hellmouth deletes Super Elites.** RESOLVED in Stage 9. `heavyEncounter` covers a boss or a Super Elite. Trash still sinks and dies. A gate encounter is marked for 3s at the existing ×1.10 and is not deleted. A Super Elite in the fight phase also loses `round(25%)` of its current shield (never HP) and one skill-class poise hit. Drop and taunt still refuse the bite and still ignore damage. See the Stage 9 history entry.

### HIGH

- **Three damage pipes and two `hurtPlayer` wrappers.** Stage 1 routed `damageEnemy` and `hurtPlayer` through `resolveDamage`, and `envHurt` through the world branch. Hunger, pit climb-out, and blood doors are still direct HP writes on purpose. Stage 2 put elemental resist on the combat resolver only. World packets and those direct writers still skip it, which is deliberate. OPEN as a reminder not to "fix" hunger by sending it through resist.
- **Defense, block, Ethereal Shield, and barrier are easy to apply twice.** Stage 1 removed the ×0.75 from the tome wrapper and covered the single application with parity tests (100 → 75 with the shield up, not 56; DEF 30 → 50, not 25). Still OPEN as a guardrail: putting the multiply back in the wrapper would double it. Stage 2 must not add a second armor step.
- **`mods.fire` is general spell power.** Stage 7 kept the key and the number, added `st.spell` as the same total, and changed the item line to `+N Spell Power`. It is not Fire-only damage. The character sheet still does not show the stat. Stage 12. OPEN for the sheet, closed for the combat migration.
- **Character sheet and item card disagree with combat.** Pierce and range are blank fields that still print. Card crit `0` hides the 5% base. Fire power, resists, regen, and Ethereal Shield are absent. Bow crits do not mark the floater. Life steal does not apply to bows, Fireball, or Frost Nova. The sheet's `DMG` is the weapon roll, which Fireball and Frost Nova ignore. Stage 12. OPEN.
- **Incoming player numbers are hidden** since v0.7.12 for the colors listed above. Players see `BLOCK`, `CRIT`, and `BARRIER`, and not the amount. Stage 11. OPEN. This is current design, and it makes defense bugs hard to see.
- **Post-depth-12 `mobDmgMul` is trash and champion only.** At depth 100 a champion skeleton's contact (~580) is higher than Oswin's contact (~244) and the Super Elite swing (~152). Boss threat is pattern count and the HP pool. Stage 13. OPEN. Do not "fix" this by inflating boss HP inside Stage 1.

### MEDIUM

- **Champion crit adds 5% of pre-defense damage after armor**, so it punches through the curve, and it snuffs the torch. Stage 3 left this separate from player crit on purpose. OPEN as a balance quirk, not as missing crit math.
- **Life steal ignores power-attack bonus and enemy mitigation**, and ignores bows and two of the three spells. Whirlwind leeches the summed skill number. Stage 3 audited this and kept it. Stage 4 did not retune it, and did not cap crit chance. Stage 5 did not either. Curse `lifeDrain` is stored and is not added to the heal. `curseHooks(...).lifeDrainWired` is false. OPEN only as a reminder that a later balance pass must not "fix" the heal without Jake's numbers.
- **Whirlwind crit doubles only the weapon roll.** Stage 7 split the hit into a Physical weapon component and a Fire rider. The rider does not crit. The floater still marks the whole hit when the weapon roll crits. Presentation is Stage 11. OPEN only as the floater.
- **Bow crits do not mark the floater.** The arrow damage includes the crit once. Impact still passes `crit: false`. Stage 11 or 12. OPEN.
- **Pixel character sheet shows crit chance and not the multiplier.** The text stats line shows `Crit N% xM`. Stage 12. OPEN.
- **Spectral Clone is 4s of combat immunity**, not only a decoy. Environment still hurts. Stage 7 did not change it. OPEN.
- **Ethereal Shield is invisible on the sheet** and does nothing to lava, acid, burn, hunger, pits, or blood doors. Stage 12. OPEN.
- **Chill aura does not slow Super Elite chase**, and fear is applied and then opposed by `seTick717` in the same frame. RESOLVED in Stage 9. `seMoveMul` now multiplies the aura the same way `ccMoveMul` does. `HEAVY_CHILL` and freeze immunity are unchanged. While `fearT` is up, `seTick717` does not chase and it drops a tell that has not landed.
- **Crab bites while shelled and does not contact-tick while open.** OPEN. The shell still returns `prevented: 'crab'` before any damage, and the contact test is still `!(ai === 'crab' && mode === 'open')`, so a shelled crab bites and an open crab does not. Jake rejected an unrequested flip of that bite before Stage 8 merged. The crab resist profile stays. A later stage may retune the bite only with an explicit ask. Stage 10 did not retune it.
- **Stage 10 left the other open combat debts alone.** Crit chance is still uncapped. Curse `lifeDrain` is still not added to `leech` (`lifeDrainWired` stays false). Life steal is still the pre-mitigation number and still skips bows, Fireball, and Frost Nova. The new hex affix stores life drain 0 on purpose. A saved item does not gain the Stage 10 ward on load. New drops of the warded bases do.
- **Floor of 1** after defense makes guard-front (×0.15) and ram armor (×0.40) chip instead of stopping a small hit, and makes thorns at least 1. Stage 2. OPEN.
- **Enrage does not add boss damage.** RESOLVED in Stage 9 by keeping it that way. Phase 2 and 3 still add patterns and the existing `enr` speed (1.25, then 1.4). They do not multiply hit damage. A new pattern waits out `phaseBeat` (0.7s).
- **Boss "half HP" is half the HP bar after a 25% shield** that was sized from the already ×1.75 pool. RESOLVED in Stage 9 as the readable rule. The bar's midpoint tick is phase 2. The quarter tick, where `B.p3` is set, is phase 3. The shield is the opening ward and is not folded into that fraction. HP and the shield fraction were not changed.
- **Super Elite body is a fixed synthetic champion**, not 1.4× the strongest monster on the floor. KEPT in Stage 9. `seMaxHp717` is still `round(round((18+7*(d-1))*2.2)*1.4)`. A depth-10 body is still 249 HP and a 25 shield. The fight's difficulty is the tell, the phase, and the stair lock. HP was not raised to match a champion golem.
- **Durability comment and `isBroken` are stale.** Items shatter at 0. Load clamps 0 up to 1. Stage 10–12 if tooltips ever repeat the comment. OPEN.
- **Bow charge used to play a power-attack telegraph and fire a normal arrow.** Stage 6 stopped the input path from entering the melee charge. A draw does not apply the power multiplier. The arrow is still `rollDmg('bow')`.
- **Melee damage from the attack input used to land before the swing.** Stage 6 puts the hit at the end of a windup that is a fraction of the existing cooldown. A direct `doAttack` call still resolves immediately. Super Elite and enemy projectiles still hit on their own later frame.
- **Two contact paths** (`updateEnemies` and grid AI, `GRID_AI.on` is true) both call `hurtPlayer`. Stage 1 must route both or one of them will skip the adapter. OPEN.
- **No gear status resist** for slow, fear, or stun. Gear cannot roll pierce. The card still prints `PIERCE`. Stage 4 added `statusImmune`, boss and Super Elite freeze immunity, and a 3s freeze lockout. It did not add a gear stat. Stage 5 and 12. OPEN.

### LOW

- **Block is binary and capped at 40.** Choir Pavise unique is 25% before shop scaling. Stage 2 and 10. OPEN.
- **Barrier and dodge window do not sum copies.** Barrier keeps the max pool. Dodge keeps the max duration, cap 0.5s. Skill amp and thorns do sum. Stage 10, if affix stacking is specified. OPEN.
- **Thorns require `src` to be the enemy object.** Beams and blasts pass a projectile-like source and do not thorn. Stage 10. OPEN.
- **`itemLines` says Fast/Normal/Slow while the satchel card says `n/S`.** Stage 12. OPEN.
- **Shift and Clone timers, barrier, legacy burn, and cooldowns do not persist** across load. Enemy HP and shields do, because they ride the floor snapshot. Stage 4 saves the engine status bag and the freeze lockout when they are present, and omits them when they are empty. Legacy `p.burn` still does not persist, and world restore still clears `slowT`. OPEN for the legacy fields. The engine bag is the Stage 4 save.
- **Hellmouth vulnerability is ×1.10 for 3s and only on `T.boss`.** RESOLVED in Stage 9. Super Elites receive the same 3s mark. The ×1.10 is still one multiply after resist, ram armor, and guard. A 4-point sword hit still rounds to 4. A 40-point hit becomes 44. A 100-point hit becomes 110.

---

## Testing and Balance Results

Stage 0 established anchors. It did not re-run the suite and it did not play the live build. No balance change was made. Subjective "feel" is intentionally absent.

### What the existing suite already encodes

Harnesses live in `tests/*.html`. They boot `index.html` in an iframe and call into `window.game`. They are version-scoped. They are not a single combat regression pack. These are the checks that matter as combat anchors. They were read, not executed, in this session.

| File | What it locks |
| --- | --- |
| `tests/v079.html` | Champion crit: DEF 0, spread 1, `hurtPlayer(100)` from a champion loses 105 and snuffs the torch. A roll of 0.95 does not crit and leaves the torch. A non-elite hit does not snuff. Boss hits do not use that crit. `champCritP === 0.10`, `champCritBonus === 0.05`. |
| `tests/v0710.html` | `quiet()` pins `__hurtSpread = 1`, DEF 0, no barrier, no block. Clone: `hurtPlayer(40)` deals 0. Ethereal Shield: `hurtPlayer(100)` loses exactly 75. Shift: `hurtPlayer(80)` deals 0 and `igniteBurn` does not start a burn. Hellmouth hits a rat in line of sight and misses one behind a wall, then the seen rat dies after the sink steps. Bows store a `visualStyle` and replace the melee swing. |
| `tests/v0717.html` | Boss HP uses `BOSS_HP_MUL` 1.75 and shield 25% of that HP. Damage 40 comes off the shield and not HP. Overflow reaches HP. Phase stays 1 while HP is still above half. Trash has no shield. Super Elite shield is 10% of `seMaxHp717`. Intro phase ignores `damageEnemy`. Roster size 20. Loot is 25 gold, a ration, a unique, and the gate key when the roll is forced. Stairs unlock after death. |
| `tests/v0718.html` | All 20 Super Elite ids can be spawned in the fight phase and killed through `damageEnemy` without freezing the frame. A kill that overflows the shield does not throw, drops 25 gold, a ration, and a unique, and allows the climb. A save reloads with the Super Elite staying dead. A bricked `hp: 0` save recovers. This is death-and-font coverage, not a damage-formula test. |
| `tests/v0712.html` | One `hurtPlayer(8)` call exists as a smoke hit. Hellmouth Strider is in the unique pool. Not a formula test. |

Older files (`v075.html` through `v0781.html`, `v0711.html`–`v0716.html`) cover movement, UI, lighting, shops, and hazards around the combat code. They are not a damage-type suite. There is no test that walks `DEF / (DEF + 30)` across a table, no Fireball numeric test, no block-chance test, no life-steal test, no poison-tick test, and no test that Hellmouth deletes a Super Elite.

### What is not covered

- Defense curve at DEF 10, 30, 60, 90, including the floor of 1.
- Block chance, block i-frames, shield durability, thorns on a blocked hit.
- Barrier full absorb versus partial absorb, and the "largest pool wins" rule.
- DoT versus Ethereal Shield, defense, block, barrier, and i-frames.
- Environment versus Shift: lava and hunger should differ, and no test says so.
- Life steal versus power attack, bows, and spells.
- Whirlwind crit versus the fire-power add.
- Guard ×0.15, ram ×0.40, crab shell, revenant down.
- Hellmouth on a Super Elite (the bypass) and Hellmouth's ×1.10 on a boss.
- `mods.fire` absent from a melee roll.
- Save/load leaving `st.min`, `st.def`, and `st.crit` unchanged.
- Any time-to-kill at depth 1, 10, 25, 50, or 100.

### Proposed Stage 1 checks

Do not add these to the game until Stage 1 is approved. They are the parity list the adapter should satisfy. Pin `__hurtSpread` and `__champCrit` the way `v079.html` and `v0710.html` already do.

1. Physical 100, DEF 0, no block, no barrier, no Ethereal Shield, spread 1 → lose 100. Same call through `hurtPlayer` and through `resolveDamage`.
2. DEF 30, spread 1, amount 100 → lose 50.
3. DEF 0, Ethereal Shield up, amount 100 → lose 75. Matches the v0.7.10 assertion.
4. DEF 0, champion attacker, crit forced, amount 100 → lose 105, torch snuffed. Matches the v0.7.9 assertion.
5. DEF 30, champion crit forced, amount 100 → armor applies to the 100, then `round(100 * 0.05)` is added on top. Document the exact integer before coding so the adapter does not "fix" the post-armor bonus.
6. DoT packet: no block roll, no thorns, no barrier, no new `inv0`. Ethereal Shield and the defense curve still apply. A pre-existing `inv0` or roll eats the tick.
7. World packet (lava-style): no defense, no block, no barrier, no Ethereal Shield. Shift still zeroes it. Hunger-style drain stays off the combat curve.
8. Enemy target: guard front ×0.15 then floor at 1; ram ×0.40 unless stunned; crab shell loses no HP; boss shield spends before HP; crit `!` only if HP dropped.
9. Super Elite in `drop` or `taunt`: `damageEnemy` / `resolveDamage` changes nothing. Hellmouth still sinks them. Assert current behavior so Stage 9 is the commit that flips it.
10. Melee roll does not change when `mods.fire` changes. Fireball still uses `8 + (fire + level * 2) * 1.4`.
11. Calling the adapter does not also run the old curve. One mitigation.
12. Empty conversion list returns the same amount. A self-edge or a cycle in the edge list is rejected. A converted component is not converted again.
13. An old save with no type fields still produces the same `st.min`, `st.max`, `st.def`, `st.crit`, and `st.fire`.

### Balance

No time-to-kill was measured in Stage 0. The formula anchors above are the numbers Stage 13 should be able to compare against. In particular, keep a note of depth-100 champion skeleton contact (~580), Oswin contact (~244), and Super Elite swing (~152), so a later "boss health bump" is not mistaken for a Stage 1 migration.

### Stage 1 executed results

Stage 1 ran the harness. Headline counts, with the per-file failures listed in the Stage 1 history entry:

- Checkpoint, before the resolver existed: 21 legacy files, 811 passed, 95 failed. `v0718.html` was 20/0. `v079.html`, `v0710.html`, and `v0717.html` failed only their old version pin.
- After the resolver: the same 21 files, 807 passed, 100 failed. The combat anchors did not gain a failure. `v0714.html`'s extra footer failures reproduce on unmodified `26e917f`.
- `tests/stage1-damage.html`: 71 passed, 0 failed. Same inputs, same HP delta as the v0.7.18 integers.

No resist, crit-damage, or status balance pass was run. Those systems are not in the game yet.

### Stage 2 executed results

Stage 2 ran the same harness, headless Chrome, before and after the resist change. Counts are pass/fail.

- Checkpoint `92edf84` / tag `combat-redesign-pre-stage2`, before resist math: 21 legacy files, 804 passed, 102 failed. `tests/stage1-damage.html` 71/0. Combat anchors `v079`, `v0710`, and `v0717` failed only their old version pin. `v0718` was 20/0.
- After Stage 2: the same 21 files, 814 passed, 93 failed. No file gained a failure. `v0714` 33/8 → 40/1 and `v07152` 34/3 → 36/1 match the layout flake Stage 1 already reproduced on unmodified code. `v0711` 42/5 → 43/5 is the conditional Hellmouth trash check, and its five failure names did not change. Combat anchors did not move.
- `tests/stage1-damage.html`: 71 passed, 0 failed, unchanged.
- `tests/stage2-resist.html`: 73 passed, 0 failed. Caps, penetration, negative resist, mixed components, Ethereal Shield, block, barrier, thorns, i-frames, Shift, Clone, world damage, hunger, save compatibility, and the Hellmouth Super Elite delete are pinned there.

No loot retune and no time-to-kill pass was run. Live callers are still Physical.

### Stage 3 executed results

Stage 3 ran the same harness, headless Chrome, before and after the crit and scaling change. Counts are pass/fail.

- Checkpoint `6be0fbe` / tag `combat-redesign-pre-stage3`, before the new math: 21 legacy files, 804 passed, 102 failed. `tests/stage1-damage.html` 71/0. `tests/stage2-resist.html` 73/0. Combat anchors `v079`, `v0710`, and `v0717` failed only their old version pin. `v0718` was 20/0.
- After Stage 3, one sequential pass of the same 21 files: 810 passed, 95 failed. `v0714` 33/8 → 40/1 and `v07152` 34/3 → 36/1 match the layout flake from Stage 1. `v076` reported one spike-walk failure that passed 48/0 on three immediate re-runs. `v077` missed a wall torch on that floor (58/5, and the snuffed check was not emitted); a re-run was the baseline 60/4. Combat anchors did not move.
- `tests/stage1-damage.html`: 71 passed, 0 failed, unchanged.
- `tests/stage2-resist.html`: 73 passed, 0 failed, unchanged.
- `tests/stage3-crit-scaling.html`: 58 passed, 0 failed. Chance boundaries, one crit application, scale order, conversion, penetration once, life steal, save compatibility, `mods.fire`, and the Hellmouth Super Elite delete are pinned there.

No loot retune and no time-to-kill pass was run. Live callers are still Physical. `version.json` is still 0.7.18.

### Stage 4 executed results

Stage 4 ran the same harness in headless Chrome (Puppeteer, system Google Chrome, SwiftShader WebGL, cache disabled) against `python3 -m http.server` on 127.0.0.1. Counts are pass/fail. The pre-change run is tag `combat-redesign-pre-stage4` / `57f085c`, before any Stage 4 code.

- Before: 21 legacy files, **812 passed, 95 failed**. Per file: `v075` 59/1, `v076` 48/0, `v077` 60/4, `v078` 60/1, `v078-play` 25/1, `v0781` 27/2, `v079` 49/1, `v0710` 36/1, `v07101` 41/1, `v07102` 54/0, `v07103` 24/3, `v0711` 43/5, `v0712` 37/6, `v0713` 32/5, `v0714` 40/1, `v0715` 19/13, `v07151` 8/45, `v07152` 34/3, `v0716` 49/1, `v0717` 47/1, `v0718` 20/0. `tests/stage1-damage.html` 71/0. `tests/stage2-resist.html` 73/0. `tests/stage3-crit-scaling.html` 58/0.
- An immediate re-run on that same checkpoint, before Stage 4 code, put `v0714` back at 33/8 (footer and tab hit-tests). `v076` stayed 48/0 and `v077` stayed 60/4. `v0711` stayed 43/5 on that re-run. The 40/1 and 33/8 pair is the layout flake Stage 1 already recorded.
- After Stage 4, one sequential pass: legacy **804 passed, 102 failed**. The only count movement is `v0711` 43/5 → 42/5 (47 checks instead of 48, same five failure names) and `v0714` 40/1 → 33/8 (the footer flake above). A separate `v0711` re-run was 43/5 again. No new failure name appeared.
- `tests/stage1-damage.html`: 71/0. `tests/stage2-resist.html`: 73/0. `tests/stage3-crit-scaling.html`: 57/1 on that sequential pass (`bow crit flag stays off the floater`, the arrow missed and dealt 0). Three immediate re-runs were 58/0. `tests/stage4-status.html`: **75/0**.

No loot retune and no time-to-kill pass was run. Live callers are still Physical. `version.json` is still 0.7.18. Stage 5 was not started.

### Stage 5 executed results

Stage 5 ran the same harness in headless Chrome (Puppeteer, system Google Chrome, SwiftShader WebGL, cache disabled) against `python3 -m http.server` on 127.0.0.1. The pre-change run is tag `combat-redesign-pre-stage5` / `d4fbc3c`, before any Stage 5 code. Counts are pass/fail. New and cleared names are listed. A count change with the same failure names is the emission or layout flake already on record.

Checkpoint, before Stage 5 code:

| File | Pass/fail | Failure names |
| --- | --- | --- |
| `v075` | 58/2 | `f3 multi select`, `f7 walkable pit` |
| `v076` | 48/0 | |
| `v077` | 60/4 | `version`, `version source`, `f4 pool`, `f5 shop boss` |
| `v078` | 60/1 | `version 0.7.11` |
| `v078-play` | 25/1 | `f11 champions only` |
| `v0781` | 27/2 | `version`, `f1 boss hits` |
| `v079` | 49/1 | `version` |
| `v0710` | 36/1 | `version` |
| `v07101` | 41/1 | `version` |
| `v07102` | 54/0 | |
| `v07103` | 24/3 | `version`, `stats canvas`, `name in panel` |
| `v0711` | 41/5 | `version`, `hundred gold`, `tome icon`, `stats scroll`, `stats canvas kept` |
| `v0712` | 37/6 | `version`, `whale title wraps`, `short title one line`, `sell grid cells`, `short detail fits frame`, `detail wraps whale name` |
| `v0713` | 32/5 | `version`, `whale still wraps`, `pedlar panel`, `sell grid 32`, `leave is red` |
| `v0714` | 33/8 | `version`, `footer sort`, `footer mark seen`, `footer drop all`, `footer equip`, `footer drop`, `footer close`, `tab hitboxes match art` |
| `v0715` | 19/13 | `version` plus the twelve scale, wrap, glyph, and phone names already in that file |
| `v07151` | 8/45 | `version` plus the scale and DOM names already in that file |
| `v07152` | 36/1 | `version` |
| `v0716` | 49/1 | `version` |
| `v0717` | 47/1 | `version` |
| `v0718` | 20/0 | |
| `stage1-damage` | 71/0 | |
| `stage2-resist` | 73/0 | |
| `stage3-crit-scaling` | 58/0 | |
| `stage4-status` | 75/0 | |

That checkpoint total is 1081 passed, 101 failed. Legacy files are 804 passed, 101 failed.

After Stage 5, one sequential pass: legacy plus Stages 1–4 is 1082 passed, 101 failed. `tests/stage5-poise.html` is 78/0. The only name movement:

- `v075` 58/2 → 59/1. Cleared `f7 walkable pit`. `f3 multi select` remains. A re-run was 59/1 with that same name.
- `v0711` 41/5 → 42/5. Same five failure names. One passing check was emitted this time (47 lines instead of 46). A re-run was 42/5 with those five names. This is the emission flake.
- `v0714` stayed 33/8. A re-run was 33/8 with the same footer and tab names.
- `stage3-crit-scaling` 58/0 → 57/1 on the sequential pass. The new name was `bow crit flag stays off the floater`. Three immediate re-runs: 57/1, then 58/0, then 58/0. The miss is the arrow dealing 0, which Stage 4 already recorded.
- `stage4-status` stayed 75/0. The check formerly named `no stage 5 stagger` is now `stagger is a status not a second clock`. That rename is this stage. It is not a failed combat check.

No other failure name was added. `v079`, `v0710`, `v0717`, and `v0718` did not move. `version.json` is still 0.7.18. Stage 6 was not started.

### Stage 6 executed results

Stage 6 ran the same harness in headless Chrome (Puppeteer, system Google Chrome, SwiftShader WebGL, cache disabled) against `python3 -m http.server` on 127.0.0.1. The pre-change run is tag `combat-redesign-pre-stage6` / `6eecf2439525da17acf9479688de185d4b8a6749`, before any Stage 6 code. Counts are pass/fail. New and cleared names are listed. A count change with the same failure names is the emission or layout flake already on record.

Checkpoint, before Stage 6 code. Legacy files match the Stage 5 after-run except `v0711`, which emitted one extra fail on that pass:

| File | Pass/fail | Failure names |
| --- | --- | --- |
| `v075` | 59/1 | `f3 multi select` |
| `v076` | 48/0 | |
| `v077` | 60/4 | `version`, `version source`, `f4 pool`, `f5 shop boss` |
| `v078` | 60/1 | `version 0.7.11` |
| `v078-play` | 25/1 | `f11 champions only` |
| `v0781` | 27/2 | `version`, `f1 boss hits` |
| `v079` | 49/1 | `version` |
| `v0710` | 36/1 | `version` |
| `v07101` | 41/1 | `version` |
| `v07102` | 54/0 | |
| `v07103` | 24/3 | `version`, `stats canvas`, `name in panel` |
| `v0711` | 42/6 | `version`, `trash in the maw`, `hundred gold`, `tome icon`, `stats scroll`, `stats canvas kept` |
| `v0712` | 37/6 | `version`, `whale title wraps`, `short title one line`, `sell grid cells`, `short detail fits frame`, `detail wraps whale name` |
| `v0713` | 32/5 | `version`, `whale still wraps`, `pedlar panel`, `sell grid 32`, `leave is red` |
| `v0714` | 33/8 | `version`, `footer sort`, `footer mark seen`, `footer drop all`, `footer equip`, `footer drop`, `footer close`, `tab hitboxes match art` |
| `v0715` | 19/13 | `version` plus the twelve scale, wrap, glyph, and phone names already in that file |
| `v07151` | 8/45 | `version` plus the scale and DOM names already in that file |
| `v07152` | 36/1 | `version` |
| `v0716` | 49/1 | `version` |
| `v0717` | 47/1 | `version` |
| `v0718` | 20/0 | |
| `stage1-damage` | 71/0 | |
| `stage2-resist` | 73/0 | |
| `stage3-crit-scaling` | 58/0 | |
| `stage4-status` | 75/0 | |
| `stage5-poise` | 78/0 | |

That checkpoint total is 1161 passed, 101 failed. Legacy files are 806 passed, 101 failed. Immediate re-runs before any Stage 6 code: `v0711` 43/5 then 42/5, both without `trash in the maw` (the five stable names). `v0714` stayed 33/8 with the footer and tab names. `stage3-crit-scaling` was 58/0, then 57/1 with `bow crit flag stays off the floater`.

After Stage 6, one sequential pass: 1216 passed, 93 failed, including `tests/stage6-weapons.html` at 47/0. Stages 1–5 were 71/0, 73/0, 58/0, 75/0, and 78/0. The only name movement:

- `v0711` 42/6 → 43/5. Cleared `trash in the maw`. The five stable names remain. A re-run was 42/5 with those five names. This is the emission flake. Stage 6 did not touch that check.
- `v0714` 33/8 → 40/1 on the sequential pass. Cleared the seven footer and tab names. `version` remains. A re-run was 40/1 (`version` only), then 33/8 with the same seven footer and tab names as the checkpoint. This is the layout flake.
- `stage3-crit-scaling` stayed 58/0 on the sequential pass and on two immediate re-runs. The checkpoint re-run had failed `bow crit flag stays off the floater` because the arrow dealt 0. That miss did not return.
- `stage5-poise` stayed 78/0. The check formerly named `no stage 6 weapon pass` is now `stage 6 weapon pass is explicit`. That rename is this stage. It is not a failed combat check.

No other failure name was added or cleared. `v075`, `v079`, `v0710`, `v0713`, `v0717`, and `v0718` did not move. `version.json` is still 0.7.18. Stage 7 was not started.

Time-to-kill, pinned midpoint, spread 1, crit off, measured before the code and again inside `tests/stage6-weapons.html`: the six family rows in the Stage 6 history match on both sides. A bow power press deals the pinned hit, not the melee `×2.25`. Twelve placed bow crits in that harness all dealt 16, left the floater flag false, and did not leech.

Boss measurement inside `tests/stage5-poise.html`, spread pinned, scale off, 8 HP a hit, shield 0, intro cleared: 80 light hits dealt 640 HP and 288 poise and did not stagger a 560 poise boss. Full-power hits staggered on hit 54, at 432 HP. Eight boss contacts of 10 on the player dealt 80 HP and staggered on the seventh. Per-hit HP matched the no-poise number.

### Stage 7 executed results

Headless Chrome, Puppeteer, system Google Chrome, SwiftShader, cache disabled, `python3 -m http.server` on 127.0.0.1. The pre-change run is tag `combat-redesign-pre-stage7` / `29c81bb825c98816606e75c80985305becf5a0c8`, before any Stage 7 code. One sequential pass on each side. Counts are pass/fail.

| Run | Legacy 21 | Stage 1 | Stage 2 | Stage 3 | Stage 4 | Stage 5 | Stage 6 | Stage 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Before | 810 passed, 97 failed | 71/0 | 73/0 | 58/0 | 75/0 | 78/0 | 47/0 | not present |
| After, one sequential pass | 805 passed, 102 failed | 71/0 | 73/0 | 58/0 | 75/0 | 78/0 | 47/0 | 69/0 |

The legacy count moved by the known flakes below. Stages 1–6 stayed green. Their name changes are the sentinels this stage replaced, and every renamed check passed.

- `stage1-damage`: `fireball still physical tag` is now `fireball keeps spell tags`. `frost nova formula and tags` is now `frost nova formula tags and cold`. The hit is still 8 and the slow is still 3.5. The type is Cold.
- `stage2-resist`: `live calls stay physical` is now `melee stays physical and fireball is fire`. `fireball stays physical against fire resist` is now `fireball is fire and resist applies` (64 stored, 6 dealt at 90 Fire resist). `frost nova stays physical` is now `frost nova is cold and resist applies` (1 dealt).
- `stage3-crit-scaling`: `fireball stays physical against fire resist` is now `fireball fire resist does not leech` (6 dealt, no heal). `frost nova stays physical and does not leech` is now `frost nova cold resist does not leech` (1 dealt, slow 3.5, no heal).
- `stage4-status`: `frost nova stays a legacy slow` is now `frost nova keeps legacy slow and adds chill`. Legacy slow remains. Chill slow is 0. The Cold hit into 90 resist deals 1.
- `stage5-poise`: `frost nova still sets slow and not chill` is now `frost nova sets slow and chill`. `live skills do not call applyStatus` is now `cast keeps legacy slow and routes chill`. `frost nova still slows and deals skill poise without chill` is now `frost nova slows, chills, and deals skill poise`.
- `stage6-weapons`: `frost nova still slows and a staff adds skill poise` is now `frost nova slows, chills, and a staff adds skill poise`. Damage stays 8. Staff skill poise stays 22. Chill slow stays 0.

Legacy name movement against the checkpoint, besides those renames:

- `v0711`: 42/6 → 43/5. Cleared `trash in the maw`. The five stable names remain (`version`, `hundred gold`, `tome icon`, `stats scroll`, `stats canvas kept`). Re-runs were 43/5 and 42/5. The second re-run did not emit the trash line. Emission flake.
- `v0714`: 40/1 → 33/8 on the sequential pass. The seven footer and tab names returned (`footer sort`, `footer mark seen`, `footer drop all`, `footer equip`, `footer drop`, `footer close`, `tab hitboxes match art`). `version` remains. Two re-runs were 33/8 with those same names. The checkpoint had been the passing layout. This is the layout flake already on record.
- `v07152`: 34/3 → 36/1. Cleared `tab hits follow scale` and `slot hit follows scale`. `version` remains. Re-runs were 34/3 with those two names back, then 36/1 with only `version`. Layout flake.
- `v0781`: 27/2 → 26/3 on the sequential pass. Added `f2 damage stays` (`lost 25 at 33`, the position check). `version` and `f1 boss hits` remain. Two re-runs were 27/2 with those two names and `f2 damage stays` passing. Position flake. Spike damage was not retuned.
- `v076`: the checkpoint failed `b3 damage no snap`. Two re-runs after the change were 48/0. The same name has flipped on earlier stages. It does not use skill types.

No other legacy failure name was added. `v075`, `v079`, `v0710`, `v0713`, `v0717`, and `v0718` did not move. `version.json` is still 0.7.18. Stage 8 was not started.

Time-to-kill, pinned, spread 1, is the table in the Stage 7 history. Weapon rows match Stage 6 on both sides. Base skill rows match at 0 resist. The resist rows are the only direct-hit changes.

### Stage 7 caster-bolt adjustment results

Re-run after the five caster shots were put back to Physical. Same harness, same checkpoint tag `combat-redesign-pre-stage7` / `29c81bb`. Player skill rows were not changed. `tests/stage7-skills.html` is 70/0. The new checks are `cultist bolt is physical and uses armor` (20 into DEF 30 deals 10) and `caster bolts stay physical until resist gear`. `caster elements stay deferred` locks the source: those call sites do not pass a damage type, and the comment says Stage 8 must not turn them on.

| Run | Legacy 21 | Stage 1 | Stage 2 | Stage 3 | Stage 4 | Stage 5 | Stage 6 | Stage 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Checkpoint, before Stage 7 | 810 passed, 97 failed | 71/0 | 73/0 | 58/0 | 75/0 | 78/0 | 47/0 | not present |
| After the bolt revert | 804 passed, 103 failed | 71/0 | 73/0 | 58/0 | 75/0 | 78/0 | 47/0 | 70/0 |

Stages 1–6 stayed green. Their renamed checks are the same list as the first Stage 7 pass, and every one passed. No earlier-stage assertion had to move for this revert. Those suites never locked the caster types.

Legacy name movement against the checkpoint:

- `v0714`: 40/1 → 33/8 on the sequential pass. The seven footer and tab names failed (`footer sort`, `footer mark seen`, `footer drop all`, `footer equip`, `footer drop`, `footer close`, `tab hitboxes match art`). `version` remains. Two re-runs were 40/1 with only `version`. Layout flake.
- `v076`: cleared `b3 damage no snap` (47/1 → 48/0). Two re-runs stayed 48/0. The checkpoint miss is the snap flake. This revert does not touch spike damage.
- `v0711`: stayed 42/6 on the sequential pass, including `trash in the maw`. Two re-runs were 42/5 and did not emit that line. The five stable names remained (`version`, `hundred gold`, `tome icon`, `stats scroll`, `stats canvas kept`). Emission flake.

`v075`, `v0781`, `v079`, `v0710`, `v0713`, `v07152`, `v0717`, and `v0718` did not move. `version.json` is still 0.7.18. Stage 8 was not started.

---

### Stage 8 executed results

Headless Chrome, Puppeteer, system Google Chrome, SwiftShader, cache disabled, `python3 -m http.server` on 127.0.0.1. Checkpoint tag `combat-redesign-pre-stage8` / `20906ad`, before any Stage 8 code. The formulas, the resist table, the affix table, and the time-to-kill rows are in the Stage 8 history entry. Counts are pass/fail.

| Run | Legacy 21 | Stage 1 | Stage 2 | Stage 3 | Stage 4 | Stage 5 | Stage 6 | Stage 7 | Stage 8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Before | 809 passed, 96 failed | 71/0 | 73/0 | 58/0 | 75/0 | 78/0 | 47/0 | 70/0 | not present |
| After, one sequential pass | 807 passed, 96 failed | 71/0 | 73/0 | 58/0 | 75/0 | 78/0 | 47/0 | 70/0 | 63/0 |

`tests/stage8-enemies.html` is 63/0. Stages 1–6 did not rename a check. Two Stage 1 rats (`frost nova formula tags and cold`, and the conversion pair) set `resists` back to empty so those formula locks stay independent of the rat profile. The names did not change.

Renamed earlier-stage check:

- `tests/stage7-skills.html`: `no resist affix and no stage 8 table` → `loot has no resist affix`. The loot assertion is unchanged.

Legacy name movement on the sequential pass is only `v0711` not emitting `vault rare 0` and `vault rare 3` (43/5 → 41/5). The five stable names stayed. Re-runs were 42/5 and 43/5 and did emit vault rares. `v0714` stayed 40/1, then two re-runs were 33/8 (layout flake). `v076` stayed 48/0 on the pass and both re-runs. `v07152` stayed 34/3, then two re-runs were 36/1 (layout flake). No new failure name. `version.json` is still 0.7.18. Stage 9 was not started.

Contact survival matched the checkpoint on all 70 monster/depth rows. The worst single-element time-to-kill multiplier is 1.667. Physical is 1.000.

### Stage 8 crab-bite revert

Re-run after the contact test was put back to the Stage 7 expression. Same harness, same checkpoint tag `combat-redesign-pre-stage8` / `20906ad`. Resist profiles and elite affixes were not changed. `tests/stage8-enemies.html` is 64/0. The crab checks are `shelled crab still bites`, `shelled crab still blocks incoming damage`, and `open crab still does not bite`.

| Run | Legacy 21 | Stages 1–7 | Stage 8 |
| --- | --- | --- | --- |
| Checkpoint `20906ad` | 809 passed, 96 failed | 71/0, 73/0, 58/0, 75/0, 78/0, 47/0, 70/0 | not present |
| After the bite revert | 802 passed, 102 failed | same, all green | 64/0 |

Stages 1–6 names did not move. The Stage 7 rename is unchanged: `no resist affix and no stage 8 table` → `loot has no resist affix`.

Legacy name movement against `20906ad` on this sequential pass:

- `v075`: 59/1 → 58/2. Added `f4 skins rotate`. Two re-runs were 59/1 with only `f3 multi select`, and `f4 skins rotate` passed (`{"7":"A","14":"B","21":"C","28":"D"}`). Prism-skin flake. Spawn code was not touched.
- `v0711`: 43/5 → 42/5. `vault rare 3` was not emitted. The five stable names stayed. Two re-runs were 43/5 (48 checks) with those five names. `trash in the maw` was not a failure. Generation variance.
- `v0714`: 40/1 → 33/8. The seven footer and tab names failed. One re-run stayed 33/8. The next was 40/1 with only `version`. Layout flake.
- `v076`: stayed 48/0, including `b3 damage no snap`. Two re-runs stayed 48/0.
- `v07152`: 34/3 → 36/1. Cleared `tab hits follow scale` and `slot hit follows scale`. One re-run stayed 36/1. The next was 34/3 with those two names back. Layout flake.

No other failure name was added. `version.json` is still 0.7.18. A diff of `index.html` against `20906ad` adds no `dmgType` line, does not edit `castHellmouth`, `spawnBoss`, `seSpawn717`, or `seTick717`, and does not edit the loot `AFFIX` table. The crab contact predicate matches the tag; the shroud skip is the only extra term.

### Stage 10 executed results

Headless Chrome, Puppeteer, system Google Chrome, SwiftShader, cache disabled, `python3 -m http.server` on 127.0.0.1. The pre-change run is this checkout at `a492023` / tag `combat-redesign-pre-stage10`, before any Stage 10 code. The same runner and viewport were used after. Counts are pass/fail. New and cleared names are listed.

Checkpoint, before Stage 10 code: legacy **806 passed, 100 failed**. Stages 1–9 were 71/0, 73/0, 58/0, 75/0, 78/0, 47/0, 70/0, 64/0, 76/0.

After, one sequential pass, before the Stage 4 key match was tightened: legacy **803 passed, 103 failed**. Stages 1–3 and 5–9 stayed green at those counts. Stage 4 was 74/1. Stage 10 was 44/0.

The Stage 4 name was `loot does not roll status mods`. The check used a substring, and `resPoison` contains `poison`. The status ids are still not affix keys. The check is now `loot does not roll status keys`, matching the whole key, and the re-run was 75/0. That is a test adjustment. Bleed, burn, chill, shock, and curse behavior were not retuned.

Renamed earlier-stage checks, all passing at the old counts:

- `tests/stage2-resist.html`: `no resist affix in the loot table` → `resist affixes use the stage 2 keys`. `loot rolls no resist mods` → `uniques do not gain a resist ward`.
- `tests/stage3-crit-scaling.html`: `no new combat affixes` → `no generic more or bonus affix`. `loot does not roll stage 3 mods` → `loot does not roll generic increased more or bonus`.
- `tests/stage7-skills.html`: `loot has no resist affix` → `resist affixes exist and spell power stays spell power`. `caster elements stay deferred` → `caster bolts are typed and bosses stay physical`. `cultist bolt is physical and uses armor` → `cultist bolt is shadow and skips armor`. `caster bolts stay physical until resist gear` → `caster bolts use their elements`.
- `tests/stage8-enemies.html`: `caster elements stay deferred` → `caster bolts are typed and bosses stay physical`. `loot still has no resist affix` → `loot can roll a resist affix`. `cultist bolt stays physical` → `cultist bolt is shadow`.
- `tests/stage9-bosses.html`: `caster elements stay deferred` → `boss shots stay physical while casters are typed`.

Legacy name movement on the sequential pass:

- `v076`: 48/0 → 47/1. Added `b3 damage no snap`. Two re-runs were 48/0. Snap flake.
- `v07152`: 36/1 → 34/3. Added `tab hits follow scale` and `slot hit follows scale`. `version` remains. Three re-runs stayed 34/3 with those two names. The pre-change run of this same harness was 36/1 with only `version`. Layout flake. Satchel scale and hit-testing were not edited.
- `v0714`: stayed 33/8 on the sequential pass, the seven footer and tab names plus `version`. Two re-runs were 40/1 with only `version`. Layout flake.
- `v0711`: stayed 42/5. The five stable names stayed (`version`, `hundred gold`, `tome icon`, `stats scroll`, `stats canvas kept`). Two re-runs stayed 42/5. `trash in the maw` was not a failure.
- `v075`: stayed 59/1 with only `f3 multi select` on the sequential pass. One re-run was 58/2 and added `f4 skins rotate`. The next was 59/1 with only `f3 multi select`. Prism-skin flake.

No other legacy failure name was added. `version.json` is still 0.7.18. Stage 11 was not started.

Time-to-kill and the caster survival rows are in the Stage 10 history entry and in `STAGE10_REPORT.md`. Mother Murk is still 840 HP, 210 shield, contact 18.144. Super Elite pools at depth 1 and 10 are still 56 and 249.

---

## Approval gate

Stage 0 is IMPLEMENTED. Jake merged it as PR #23 and GO'd Stage 1. This log does not mark Stage 0 VERIFIED.

Stage 1 is IMPLEMENTED, not VERIFIED. Jake merged it as PR #24 (`92edf84`) and GO'd Stage 2. This log does not mark Stage 1 VERIFIED.

Stage 2 is IMPLEMENTED, not VERIFIED. Jake merged it as PR #25 (`6be0fbedfedf1a512b3a8b6b6dfceb21d3233ce4`) and GO'd Stage 3. This log does not mark Stage 2 VERIFIED.

Stage 3 is IMPLEMENTED, not VERIFIED. Jake merged it as PR #26 (`57f085c76907a83f8650ca339b19188b467e82b6`) and GO'd Stage 4. This log does not mark Stage 3 VERIFIED. The Stage 3 history entry above still describes that branch before the merge. It was not rewritten.

Stage 4 is IMPLEMENTED, not VERIFIED. Jake merged it as PR #27 (`d4fbc3c6904c0ddbc96b6d2b6825514e2420b896`) and GO'd Stage 5. This log does not mark Stage 4 VERIFIED. The Stage 4 history entry above still describes that branch before the merge. It was not rewritten.

Stage 5 is IMPLEMENTED, not VERIFIED. Jake merged it as PR #28 (`6eecf2439525da17acf9479688de185d4b8a6749`) and GO'd Stage 6. This log does not mark Stage 5 VERIFIED. The Stage 5 history entry above still describes that branch before the merge. It was not rewritten.

Stage 6 is IMPLEMENTED, not VERIFIED. Jake merged it as PR #29 (`29c81bb825c98816606e75c80985305becf5a0c8`). This log does not mark Stage 6 VERIFIED. The Stage 6 history entry above still describes that branch before the merge. It was not rewritten.

Stage 7 is IMPLEMENTED, not VERIFIED. Jake merged it as PR #30 (`20906ade92233c9a7831c0a0c90a4ab90f898851`). This log does not mark Stage 7 VERIFIED. The Stage 7 history entry above still describes that branch before this stage. It was not rewritten.

Stage 8 is IMPLEMENTED, not VERIFIED. The PR is for review. It is not merged and it is not live. `version.json` is still 0.7.18.

**Wait for Jake's approval before Stage 9.** Stage 9 is bosses, Super Elites, and the Hellmouth deletion. It must not start from this branch. Stage 8 did not redesign those attacks, did not change Hellmouth's deletion, and did not turn on the five caster elements.

Stage 9 is IMPLEMENTED, not VERIFIED, on a later branch. The paragraph above is the Stage 8 gate and was not rewritten. This PR is the Stage 9 review. It is not merged and it is not live. `version.json` is still 0.7.18.

**Wait for Jake's approval before Stage 10.** Stage 10 is loot and the five caster elements. It must not start from this branch. Stage 9 did not add resist loot, did not retype those shots, and did not change the crab bite.

Stage 10 is IMPLEMENTED, not VERIFIED, on a later branch. The paragraph above is the Stage 9 gate and was not rewritten. This PR is the Stage 10 review. It is not merged and it is not live. `version.json` is still 0.7.18.

**Wait for Jake's approval before Stage 11.** Stage 11 is combat feedback. It must not start from this branch. Stage 10 did not raise boss or Super Elite HP or damage, did not reinterpret `mods.fire`, and did not close the crab bite, the uncapped crit chance, curse life drain, or pre-mitigation life steal.
