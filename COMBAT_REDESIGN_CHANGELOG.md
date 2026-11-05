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
- **Current implementation stage:** Stage 2 — Armor and Resistances. IMPLEMENTED, not VERIFIED.
- **Overall project status:** IN PROGRESS. Jake merged Stage 0 PR #23 and Stage 1 PR #24, then GO'd Stage 2. Stage 0 and Stage 1 stay IMPLEMENTED (not marked VERIFIED here). Stage 2 is IMPLEMENTED and waiting for Jake. Stages 3–13 are NOT STARTED. Do not begin Stage 3 until Jake approves Stage 2.
- **Rollback tags:** `combat-redesign-pre-stage1` → `26e917f413531466aceed0577819110aa5e6dd17` (Stage 0 squash). `combat-redesign-pre-stage2` → `92edf84d106fec7a076d436348ac83da35e174fb` (Stage 1 squash on main, PR #24). Do not move either tag.

---

## Master Implementation Checklist

| Stage | Name | Status |
| --- | --- | --- |
| 0 | Baseline audit and project preparation | IMPLEMENTED |
| 1 | Universal damage architecture | IMPLEMENTED |
| 2 | Armor and resistances | IMPLEMENTED |
| 3 | Critical hits and damage scaling | NOT STARTED |
| 4 | Status effects | NOT STARTED |
| 5 | Stagger, poise, and crowd control | NOT STARTED |
| 6 | Weapon identity and attack responsiveness | NOT STARTED |
| 7 | Skill system and build specialization | NOT STARTED |
| 8 | Enemy resistances and elite affixes | NOT STARTED |
| 9 | Boss and Super Elite redesign | NOT STARTED |
| 10 | Equipment, loot, and build-changing affixes | NOT STARTED |
| 11 | Combat feedback and presentation | NOT STARTED |
| 12 | Character sheet and tooltip accuracy | NOT STARTED |
| 13 | Balance, performance, and final verification | NOT STARTED |

Status meanings: NOT STARTED, IN PROGRESS, IMPLEMENTED, VERIFIED, BLOCKED. Stage 0 stays IMPLEMENTED, not VERIFIED. Stage 1 is IMPLEMENTED, not VERIFIED. Jake merged Stage 1 PR #24 and GO'd Stage 2. Stage 2 is IMPLEMENTED, not VERIFIED. Jake reviews before any stage is marked VERIFIED. The Stage 0 entry did not run the harness. Stage 1 and Stage 2 did; the counts are in those entries.

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
- **Version / Commit:** Gameplay version left at v0.7.18 (`version.json` unchanged). No deploy. Rollback tag `combat-redesign-pre-stage2` points at `92edf84d106fec7a076d436348ac83da35e174fb` (Stage 1 squash, PR #24).
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

## Combat System Reference

The Stage 2 block is what the game does now. The Stage 1 block is the architecture Stage 2 kept. The rest of this section is the v0.7.18 baseline those Physical numbers still follow. Planned work for later stages stays marked as planned.

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
- Conversion graph exists, rejects self-edges and cycles, and has no edges. Chained conversion of an already moved component is rejected by the converted flag. Adding edges is **planned** (Stage 3).
- Critical ×2 is still inside `rollDmg`, not in the resolver. Crit chance above the 5% base, and crit damage other than ×2, are **planned** (Stage 3).
- `mods.fire` is still spell power (`pw = fire + level * 2`). It is not a Fire component. Reinterpreting it is **planned** (Stages 7, 10, 12).
- Hunger, pit climb-out, spike-gap ticks, and blood doors still write HP directly. They are not combat packets.
- Hellmouth still sinks Super Elites because `T.boss` is false, then `killEnemy` deletes them. Changing that is **planned** (Stage 9).

Not implemented: status effects, stagger, poise, weapon identities, elite affixes, new boss phases, behavioral item affixes, damage-number presentation, character-sheet resists. Those remain later stages.

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

### Stage 1 implementation notes

D1–D7 are in the code. Refinements forced by the existing formulas:

- Crit ×2 stays in `rollDmg`. Conversion therefore sees an amount that already includes a melee or Whirlwind weapon crit. The resolver does not apply ×2 again. Moving the double into the resolver would have changed Whirlwind, which crits only the weapon roll and then adds spell power. That split stays until Stage 3.
- A player packet with one Physical component uses the exact v0.7.18 expression `max(1, round(amount * (1 - DEF/(DEF+30)) * spread))`. Mixed components sum the post-mitigation floats and round once. Nothing in the live game sends two components yet.
- The tome wrapper remains so later assignments still wrap the same function, but it no longer multiplies and no longer returns early. Shift, Clone, and Ethereal Shield live only in `resolveDamage`.
- `envHurt` is a world packet. Hunger, pits, and blood doors stayed direct writes. A test locks both.

---

## Known Issues and Technical Debt

Severity is about how badly it will mislead a later stage or a player, not about how old the code is. Resolution is OPEN unless noted.

### CRITICAL

- **Hellmouth deletes Super Elites.** `T.boss` is false, so they take the trash sink and `killEnemy`, skipping shield, taunt immunity, and the stair gate. Stage 9. OPEN. Stage 1 did not change this. `tests/stage1-damage.html` asserts the current sink-and-delete. See D7.

### HIGH

- **Three damage pipes and two `hurtPlayer` wrappers.** Stage 1 routed `damageEnemy` and `hurtPlayer` through `resolveDamage`, and `envHurt` through the world branch. Hunger, pit climb-out, and blood doors are still direct HP writes on purpose. Stage 2 put elemental resist on the combat resolver only. World packets and those direct writers still skip it, which is deliberate. OPEN as a reminder not to "fix" hunger by sending it through resist.
- **Defense, block, Ethereal Shield, and barrier are easy to apply twice.** Stage 1 removed the ×0.75 from the tome wrapper and covered the single application with parity tests (100 → 75 with the shield up, not 56; DEF 30 → 50, not 25). Still OPEN as a guardrail: putting the multiply back in the wrapper would double it. Stage 2 must not add a second armor step.
- **`mods.fire` reads as Fire damage and is spell power.** Stage 7, 10, and 12. OPEN. D6.
- **Character sheet and item card disagree with combat.** Pierce and range are blank fields that still print. Card crit `0` hides the 5% base. Fire power, resists, regen, and Ethereal Shield are absent. Bow crits do not mark the floater. Life steal does not apply to bows, Fireball, or Frost Nova. The sheet's `DMG` is the weapon roll, which Fireball and Frost Nova ignore. Stage 12. OPEN.
- **Incoming player numbers are hidden** since v0.7.12 for the colors listed above. Players see `BLOCK`, `CRIT`, and `BARRIER`, and not the amount. Stage 11. OPEN. This is current design, and it makes defense bugs hard to see.
- **Post-depth-12 `mobDmgMul` is trash and champion only.** At depth 100 a champion skeleton's contact (~580) is higher than Oswin's contact (~244) and the Super Elite swing (~152). Boss threat is pattern count and the HP pool. Stage 13. OPEN. Do not "fix" this by inflating boss HP inside Stage 1.

### MEDIUM

- **Champion crit adds 5% of pre-defense damage after armor**, so it punches through the curve, and it snuffs the torch. Stage 3. OPEN.
- **Life steal ignores power-attack bonus and enemy mitigation**, and ignores bows and two of the three spells. Whirlwind leeches the summed skill number. Stage 3. OPEN.
- **Whirlwind crit doubles only the weapon roll**, then adds fire power, and the floater marks the whole hit. Stage 3 and 7. OPEN.
- **Crit chance and crit damage:** base 5%, no cap, flat ×2, no crit-damage stat. Stage 3. OPEN.
- **Spectral Clone is 4s of combat immunity**, not only a decoy. Environment still hurts. Stage 7. OPEN.
- **Ethereal Shield is invisible on the sheet** and does nothing to lava, acid, burn, hunger, pits, or blood doors. Stage 12. OPEN.
- **Chill aura does not slow Super Elite chase**, and fear is applied and then opposed by `seTick717` in the same frame. Stage 8–9. OPEN.
- **Crab bites while shelled and does not contact-tick while open.** Stage 8. OPEN.
- **Floor of 1** after defense makes guard-front (×0.15) and ram armor (×0.40) chip instead of stopping a small hit, and makes thorns at least 1. Stage 2. OPEN.
- **Enrage does not add boss damage.** Phase 2/3 move faster and cast faster. Stage 9. OPEN.
- **Boss "half HP" is half the HP bar after a 25% shield** that was sized from the already ×1.75 pool. Stage 9. OPEN.
- **Super Elite body is a fixed synthetic champion**, not 1.4× the strongest monster on the floor. A depth-10 champion golem is about 532 HP against the Super Elite's 249. The Super Elite's job is the stair lock and the immune intro. Stage 9. OPEN.
- **Durability comment and `isBroken` are stale.** Items shatter at 0. Load clamps 0 up to 1. Stage 10–12 if tooltips ever repeat the comment. OPEN.
- **Bow charge plays a power-attack telegraph and fires a normal arrow.** Stage 6. OPEN.
- **Melee damage is instant; the animation trails it.** Super Elite and projectiles hit on a later frame. Stage 6. OPEN.
- **Two contact paths** (`updateEnemies` and grid AI, `GRID_AI.on` is true) both call `hurtPlayer`. Stage 1 must route both or one of them will skip the adapter. OPEN.
- **No status resist** for slow, fear, or stun. Gear cannot roll pierce. The card still prints `PIERCE`. Stage 4, 5, and 12. OPEN.

### LOW

- **Block is binary and capped at 40.** Choir Pavise unique is 25% before shop scaling. Stage 2 and 10. OPEN.
- **Barrier and dodge window do not sum copies.** Barrier keeps the max pool. Dodge keeps the max duration, cap 0.5s. Skill amp and thorns do sum. Stage 10, if affix stacking is specified. OPEN.
- **Thorns require `src` to be the enemy object.** Beams and blasts pass a projectile-like source and do not thorn. Stage 10. OPEN.
- **`itemLines` says Fast/Normal/Slow while the satchel card says `n/S`.** Stage 12. OPEN.
- **Shift and Clone timers, barrier, burn, and cooldowns do not persist** across load. Enemy HP and shields do, because they ride the floor snapshot. Stage 1 should not start persisting a second combat state without a reason. OPEN, accepted current behavior.
- **Hellmouth vulnerability is ×1.10 for 3s and only on `T.boss`.** Super Elites never receive the mark. They get deleted instead. Stage 9. OPEN.

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

---

## Approval gate

Stage 0 is IMPLEMENTED. Jake merged it as PR #23 and GO'd Stage 1. This log does not mark Stage 0 VERIFIED.

Stage 1 is IMPLEMENTED, not VERIFIED. Jake merged it as PR #24 (`92edf84`) and GO'd Stage 2. This log does not mark Stage 1 VERIFIED.

Stage 2 is IMPLEMENTED, not VERIFIED. The PR is for review. It is not merged and it is not live. `version.json` is still 0.7.18.

**Wait for Jake's approval before Stage 3.** Stage 3 is critical hits and damage scaling. It must not start from this branch. Stage 2 did not reclassify attacks, did not change `mods.fire`, and did not change Hellmouth.
