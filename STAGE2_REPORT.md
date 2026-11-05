# Stage 2 Report — Armor and Resistances

**Status: IMPLEMENTED, not VERIFIED.** This branch is for Jake's review. It is not merged, not deployed, and not live. `version.json` is still **0.7.18**. Stage 3 has not been started.

Rollback tag `combat-redesign-pre-stage2` points at `92edf84d106fec7a076d436348ac83da35e174fb` (Stage 1 squash, PR #24, on main).

```
git checkout combat-redesign-pre-stage2
```

Do not move that tag.

## What landed

Stage 2 fills the Stage 1 stub `elementalResist`. Physical armor is unchanged: `DEF / (DEF + 30)`, and it runs only on Physical components. Fire, Cold, Lightning, Poison, and Shadow use a separate percent curve, once per component, inside the existing resolver.

The player and an enemy share that function. Enemy content resists stay at 0 unless a test (or, later, Stage 8) sets them. Gear can already store resist and penetration mods, and `computeStats` sums them, but nothing in the loot table, unique list, or shop rolls those mods. Defaults are 0. The character sheet was not redesigned.

Live callers were not retyped. Fireball, Frost Nova, Whirlwind, poison puddles, lava, acid, spikes, and every other current hit are still Physical, so time-to-kill matches Stage 1. The mapping table below is a proposal. It is not applied.

## Formula

```
eff = clamp(rawResist - penetration, -100, resistCap)
resistCap = clamp(75 + maxResist, 0, 90)
multiplier = (100 - eff) / 100
dealt component = amount * multiplier
```

| Constant | Value | Rule |
| --- | --- | --- |
| Soft cap | 75 | Default maximum. Raw resist above 75 is overcap. It does not mitigate until `maxResist` raises the cap, but penetration spends it first. |
| Hard cap | 90 | `maxResist` cannot push the cap past 90. 100 resist with `maxResist` +15 mitigates 90%, so 100 damage deals 10. |
| Vulnerability floor | −100 | Negative resist is the only vulnerability. −100 is ×2. Lower values and deep penetration clamp here. There is no second vuln multiplier. |

Hellmouth's ×1.10 is not this. It still runs once, after resist, and only on a boss that has the mark.

Pinned, spread 1, one component, 100 damage, no Ethereal Shield: 0 resist → 100; 75 or an overcapped 100 at the default cap → 25; −100 or −250 → 200; 75 resist and 20 penetration → 45; 0 resist and 40 penetration → 140; raw 100, default cap, 40 penetration → 40.

Ethereal Shield still multiplies the component by 0.75 first, once. Block, thorns, barrier, and champion crit still see the pre-resist amount. A mixed packet applies the DEF curve to the Physical part and the resist curve to each other part, then rounds the sum once. 100 Physical at DEF 30 plus 100 Fire at 50 resist deals 100.

On an enemy, resist is applied per non-Physical component, then guard ×0.15, ram armor ×0.40 (unless stunned), and Hellmouth ×1.10 run once on the sum, then the floor of 1, then the boss or Super Elite shield. Physical enemy hits do not use the DEF curve and do not use elemental resist. World packets (`envHurt`) and direct HP writes (hunger, pit climb-out, spike-gap, blood door) skip resist, armor, block, Ethereal Shield, and barrier.

Player sheet fields, all default 0: `resFire`, `resCold`, `resLightning`, `resPoison`, `resShadow`, `maxResist`, `penFire`, `penCold`, `penLightning`, `penPoison`, `penShadow`. `resAll` and `penAll` fold into the five typed stats once inside `computeStats`. A finite sheet value, including 0, wins over an enemy-style `resists` bag, so they are not added twice. Packet `penetration` (a number, or a per-type object) is added to the attacker's sheet pen when the attacker is the player. The player's pen does not reduce the player's own resist.

## Proposed mapping (not applied)

Jake's call. Until then every combat caller stays Physical.

| Source | Proposed type |
| --- | --- |
| Melee, power attack, bows, thorns, enemy contact, archer arrows, traps, golem slam, bloater blast, ghoul leap, eel erupt | Physical |
| Fireball, including the 0.6 splash | Fire |
| Whirlwind | Physical for the weapon roll. Fire for the spell-power portion only after `mods.fire` is migrated |
| Frost Nova | Cold. The 3.5s slow stays a status |
| Cultist bolt, Exarch orb | Shadow |
| Lich Wisp bolt, Seer snipe | Lightning |
| Siren ring | Cold |
| Spider web bolt | Physical. The slow is a status |
| Poison ground: bloater, crawler, lobber, drowned trail, boss lob | Poison |
| Boss patterns and Super Elite swings | Physical until Stage 9 names something else |
| Hellmouth | Not damage. The ×1.10 mark stays a boss multiplier |
| Hazard water | Stays a world packet |
| Hazard acid | Poison, still world, so resist would not apply unless the pipe changes |
| Lava and on-fire | Fire, still world |
| Spike rooms | Physical, still world |
| Spike-gap, bottomless pit, hunger, thirst, exhaustion, blood door | Stay direct HP. Do not resist them |

## Tests

Headless Chrome, Puppeteer, system Google Chrome, cache disabled, `python3 -m http.server` on 127.0.0.1.

| Run | Legacy 21 files | `tests/stage1-damage.html` | `tests/stage2-resist.html` |
| --- | --- | --- | --- |
| Before Stage 2 code, tag `combat-redesign-pre-stage2` | 804 passed, 102 failed | 71 / 0 | not present |
| After Stage 2 | 814 passed, 93 failed | 71 / 0 | 73 / 0 |

No legacy file gained a failure. Combat anchors did not move: `v079`, `v0710`, and `v0717` still fail only the old version pin; `v0718` is 20/0. The three count changes are pre-existing noise, not the resist formula:

- `v0714` 33/8 → 40/1. Seven footer and tab-hitbox names passed. Stage 1 already saw both results on unmodified code. The remaining failure is the version pin.
- `v07152` 34/3 → 36/1. Two scale hit-tests passed. Stage 1's clean re-run was also 36/1. The remaining failure is the version pin.
- `v0711` 42/5 → 43/5. Same five failure names. The extra pass is the conditional `trash in the maw` check, which only exists when that floor spawned trash.

`tests/stage2-resist.html` (73) pins the integer table, soft cap 75, hard cap 90, overcap versus penetration, zero resist, negative resist down to ×2, mixed packets with no double reduction, Ethereal Shield once, block, thorns from the pre-resist amount, barrier, poison DoTs, roll and hit-stun, Shift, Clone versus lava, world packets ignoring resist, hunger ignoring resist, guard, ram, Hellmouth ×1.10 once, crab shell, boss shield, Super Elite intro immunity and shield, no resist affixes on 40 rolled rares, and a save round-trip.

## Hellmouth and `mods.fire`

Hellmouth is unchanged. `T.boss` is still false on Super Elites. The Stage 1 lock in `tests/stage1-damage.html` is still green (71/0), including the sink-and-delete. `tests/stage2-resist.html` repeats that lock: the Super Elite is sunk, the boss is not, the marked boss still takes 110 from a Physical 100, and the Super Elite is deleted after the sink. A Fire resist on the Super Elite does not save it from the intro immunity or from Hellmouth.

`mods.fire` is still spell power: `pw = fire + level * 2`. It is not a Fire resist and not a Fire component. The save test equips `mods.fire = 6` together with resist mods, reloads, and gets `st.fire === 6` plus the folded resists. An old charm with only `mods.fire = 6` recomputes to 0 on every resist and pen. Melee `rollDmg` is still 4 with `st.fire = 40`. Fireball at fire power 20 is still 64 damage and still Physical against an enemy with 90 Fire resist (the enemy loses 64, not 10). Frost Nova is still 8 Physical damage against 90 Cold resist.

## Deliberately not in this PR

- Reclassifying any live attack or hazard onto Fire, Cold, Lightning, Poison, or Shadow.
- Loot affixes, unique mods, shop prices, or a character-sheet resist panel. Stage 10 and Stage 12 own those.
- Enemy resist tables. Stage 8.
- Crit chance, crit damage, and conversion edges that items actually grant. Stage 3. The empty conversion graph still works, and a converted Fire half is resisted once. No gear adds an edge.
- Status effects, stagger, weapon identity, boss and Super Elite redesign, Hellmouth's Super Elite delete.
- A version bump, a GitHub Pages deploy, or a merge.

Stage 3 and a live ship both wait for Jake.
