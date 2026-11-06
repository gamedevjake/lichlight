# Stage 10 Report — Equipment, Loot, and Build-Defining Affixes

**Status: IMPLEMENTED, not VERIFIED.** This branch is for Jake's review. It is not merged, not deployed, and not live. `version.json` is still **0.7.18**. Stage 11 has not been started.

Rollback tag `combat-redesign-pre-stage10` points at `a492023a5a442bce8404837648567626b58a51e1` (Stage 9 squash, PR #32, on main).

```
git checkout combat-redesign-pre-stage10
```

Do not move that tag. `combat-redesign-pre-stage1` through `combat-redesign-pre-stage9` were not moved.

## What landed

Common armor carries elemental resist before the five caster bolts deal an element. The bolts are Shadow, Lightning, or Cold. Boss and Super Elite shots stay Physical. Their HP and their damage were not raised.

Gear can also roll one conversion and one ailment. Those change which damage type lands and which status follows it. They are not a second percent multiplier. `mods.fire` is still general spell power.

## Resist first

`gearWard` is written onto every non-unique copy of the early defensive bases, including whites. It is `min(16, round(base + (itemLevel - 1) * 0.55))` and it is stored as `mods.resAll`. `computeStats` still folds that into the five resists once. Uniques do not get it. A loaded save does not grow it.

| Base | Ward at item level 1 |
| --- | --- |
| Leather Armor | 8 |
| Wooden Buckler | 6 |
| Chain Mail | 6 |
| Cap, Helm, Copper Charm, Plate, Dusk, Kite | 4 |
| Great Helm, Bone Visage, Boots, Greaves, later shields, Bone Pendant | 3 |

Magic and rare armor, helms, boots, and shields also force one resist line if the roll missed. A rare can hold two resist lines. Penetration starts at item level 6, one key per item, and the sheet caps each element at 40. Crit damage starts at item level 3 and only changes `critMul` (`2 + critDmg/100`). Added damage is a flat of one type, cap 8, from item level 2. There is no increased, more, or type-bonus affix.

A floor-1 white (`makeItem` at item level 2, no affixes) had some resist on 58 of 80 rolls. All 24 magic leathers had a resist line past the ward. A white short sword still has neither resist nor spell power.

## Conversion and ailments

One edge. Weapon, else amulet, else ring. Fraction 0.40. It moves. It does not copy, chain, or loop. Scale runs once on the source type before the move, so flat Fire is not added again to a portion that was Physical. The moved portion then takes the destination resist and the destination penetration, once.

The ids are `phys-fire`, `phys-cold`, `phys-lightning`, `phys-poison`, `phys-shadow`, `fire-cold`, `fire-lightning`, `cold-fire`, and `lightning-shadow`.

One ailment, same slot order. The tick is created with `scale: false`. Fireball still owns Burning, and Frost Nova still owns Chill, so gear does not add a second stack of those. Hex is −8 resist and life drain 0. Shock refreshes at 10% and does not climb to the 25% cap on the second hit.

## Caster bolts

| Attack | Type |
| --- | --- |
| Pale Choir Cultist | Shadow |
| Lich Wisp | Lightning |
| Drowned Siren | Cold |
| Choir Exarch | Shadow |
| Drowned Seer | Lightning |

Webs, bone arrows, contact, boss patterns, and Super Elite swings stay Physical. `eShoot` still strips a type from a boss or a Super Elite.

Choirmaster Aurel's own shots stay Physical. A cultist he summons is a mage, so that minion's bolt is Shadow. The bolt's damage number is the old number. Only the mitigation channel changed. Boss HP and boss contact were not edited. Mother Murk at floor 5 is still 840 HP, 210 shield, contact 18.144. Super Elite pools are still 56 at depth 1 and 249 at depth 10.

## Time to kill

Spread 1, crit off. Sword is a 4-point Physical hit every 0.45s. Fireball is 64 Fire every 0.45s, the level-10 spell-power-20 hit. "Before" is that hit with no new affix. Enemy resists are already the Stage 8 rows, so a naked Fireball does not change from Stage 9. Pen is 18 Fire penetration, one affix. Hybrid moves 40% of the sword hit to Fire. Bleed is an unscaled 1-damage stack, at most 5, ticking on whole seconds.

| Depth | Enemy | HP | Sword before = after | Fireball before = after | Fireball + 18 pen | Hybrid | Bleed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 5 | 0.90 | 0.45 | 0.45 | 0.90 | 0.90 |
| 1 | Slime | 12 | 1.35 | 0.45 | 0.45 | 1.35 | 1.35 |
| 3 | Cultist | 22 | 2.70 | 0.45 | 0.45 | 2.70 | 2.00 |
| 3 | Skeleton | 32 | 3.60 | 0.45 | 0.45 | 3.60 | 3.00 |
| 12 | Skeleton | 86 | 9.90 | 0.90 | 0.45 | 9.90 | 6.75 |
| 12 | Drowned | 133 | 15.30 | 1.80 | 1.35 | 20.25 | 10.00 |
| 12 | Wisp | 51 | 5.85 | 0.45 | 0.45 | 5.85 | 4.05 |
| 12 | Spider | 60 | 6.75 | 0.45 | 0.45 | 5.40 | 4.95 |
| 20 | Golem | 422 | 47.70 | 3.60 | 3.15 | 47.70 | 31.00 |
| 20 | Seer | 138 | 15.75 | 1.35 | 1.35 | 15.75 | 10.35 |
| 20 | Exarch | 182 | 20.70 | 1.35 | 1.35 | 20.70 | 13.95 |

The sword column did not move. The naked Fireball column did not move. Penetration matters when the target's Fire resist is high enough to add a swing: the drowned goes from 1.80s to 1.35s, the depth-12 skeleton from 0.90s to 0.45s. Hybrid is the trade. The drowned resists Fire, so 40% of the sword hit slows the kill from 15.30s to 20.25s. The spider is weak to Fire, so the same edge speeds it from 6.75s to 5.40s. Bleed does nothing until a full second has passed, then it shortens the long fights. It is not a second copy of the sword hit.

## Survival against the new bolts

Hits are how many of that bolt remove 60 player HP. Spread 1, no block. "Old armor" is the same DEF on the Physical curve, which is what the bolt did before this stage. "Ward kit" is leather, cap, boots, and a wooden buckler of that floor's item level, whites, no rolled affix. "Naked" is DEF 0 and no resist. An elemental bolt ignores DEF, so armor with the ward stripped takes the naked number. That is the case the ward is there to close.

| Bolt | Depth | Damage | DEF | All-resist | Naked | Ward kit | Old armor | Hits naked / kit / old |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cultist, Shadow | 3 | 8.51 | 11 | 29 | 9 | 6 | 6 | 7 / 10 / 10 |
| Wisp, Lightning | 5 | 10.87 | 15 | 33 | 11 | 7 | 7 | 6 / 9 / 9 |
| Siren, Cold | 12 | 15.42 | 23 | 49 | 15 | 8 | 9 | 4 / 8 / 7 |
| Exarch, Shadow | 14 | 33.58 | 27 | 53 | 34 | 16 | 18 | 2 / 4 / 4 |
| Seer, Lightning | 15 | 57.85 | 27 | 53 | 58 | 27 | 30 | 2 / 3 / 2 |

The early cultist kit takes 6. The old armored hit was 7. A naked hit is 9 either way, because DEF 0 and resist 0 are the same number on both curves. From the siren downward the white kit takes less per hit than that DEF did against a Physical bolt. No rare resist roll is required for that.

## Saves, shop, spell power

An amulet with `mods.fire = 6` reloads as spell power 6, resist 0, and no conversion. `skillSpec` still loads. Kindling is still the Fireball burn build. The shop still sells three sealed uniques at the old price function. Unique definitions still use only the old mod keys. A generated unique does not gain the ward.

## Tests

Headless Chrome, Puppeteer, system Google Chrome, SwiftShader, cache disabled. Baseline is `a492023` before this code, same runner: legacy 806 passed and 100 failed. Stages 1–9 were 71/0, 73/0, 58/0, 75/0, 78/0, 47/0, 70/0, 64/0, 76/0.

One sequential pass after the change: legacy 803 passed and 103 failed. Stages 1–3 and 5–9 stayed green. Stage 10 was 44/0. Stage 4 was 74/1 on that pass because `loot does not roll status mods` treated `resPoison` as a status key. The check now matches the whole key (`loot does not roll status keys`) and the re-run was 75/0. Status rules were not retuned.

Renames, and why:

- Stage 2: `no resist affix in the loot table` → `resist affixes use the stage 2 keys`. `loot rolls no resist mods` → `uniques do not gain a resist ward`.
- Stage 3: `no new combat affixes` → `no generic more or bonus affix`. `loot does not roll stage 3 mods` → `loot does not roll generic increased more or bonus`.
- Stage 7: `loot has no resist affix` → `resist affixes exist and spell power stays spell power`. `caster elements stay deferred` → `caster bolts are typed and bosses stay physical`. `cultist bolt is physical and uses armor` → `cultist bolt is shadow and skips armor`. `caster bolts stay physical until resist gear` → `caster bolts use their elements`.
- Stage 8: `caster elements stay deferred` → `caster bolts are typed and bosses stay physical`. `loot still has no resist affix` → `loot can roll a resist affix`. `cultist bolt stays physical` → `cultist bolt is shadow`.
- Stage 9: `caster elements stay deferred` → `boss shots stay physical while casters are typed`.

Flake re-runs:

- `v076`: sequential pass added `b3 damage no snap`. Two re-runs were 48/0. Snap flake.
- `v0714`: sequential pass stayed 33/8, the seven footer and tab names plus `version`. Two re-runs were 40/1 with only `version`. Layout flake.
- `v0711`: stayed 42/5, the five stable names. Two re-runs stayed 42/5. `trash in the maw` was not a failure.
- `v075`: sequential pass was 59/1 with only `f3 multi select`. One re-run added `f4 skins rotate`. The next was 59/1 with only `f3 multi select`. Prism-skin flake.
- `v07152`: 36/1 → 34/3. Added `tab hits follow scale` and `slot hit follows scale`. Three re-runs stayed 34/3. The pre-change run on this harness was 36/1 with only `version`. Layout flake. Satchel scale and hit-testing were not edited.

## Still open

Crab shell versus bite. Uncapped crit chance. Curse life drain not wired into `leech`. Life steal on the pre-mitigation number, and not on bows, Fireball, or Frost Nova. This stage did not retune any of those. Hex stores life drain 0 so it does not pretend to.

A save written before this stage does not gain the ward. New drops do.

## Deliberately not in this PR

- Generic increased, more, or type-bonus loot. Those are stacked percent multipliers. The formulas still accept them when a test sets them.
- A rewrite of unique items, shop stock, or `skillSpec`.
- A version bump, a GitHub Pages deploy, or a merge.
- Stage 11.

Stage 11 and a live ship both wait for Jake.

## Integration with main `e550e3d`

Merged with `git merge --no-ff`. Merge commit `2783fa1bb173158f7e807ea0c652bc9f90188509`. Parents are the Stage 10 head `149a8d3` and main `e550e3d`. The only conflict was `COMBAT_REDESIGN_CHANGELOG.md`. Both histories were kept. `index.html` and `tests/stage9-bosses.html` auto-merged. PR #33 was not merged into main.

Depth 1 Super Elite life is 80 after this merge, because main's early-balance curve replaced the old 56. Depth 5 is 141. Depth 10 is still 249. Mother Murk is still 840 / 210 / 18.144. Stage 10 did not edit those formulas.

Warded whites at item level 1 and 3 still require level 1. New magic at item level 3 requires 2. New rare at item level 3 requires 3. A grandfathered item does not gain the ward. The Seer bolt gap for that old armor (58 with no resist, 30 on the old Physical curve) is recorded in the changelog with five options. None of them was applied.

Against `e550e3d`, stages 1–9 and `tests/early-balance.html` match (77/0 on stage 9, 50/0 on the early-balance file). Stage 10 is 49/0. Legacy failure names match, including `v07152`'s tab and slot hit names, which also failed on main and cleared on main re-runs. `f2 brazier` did not fail on either tree in this session. The full tables are in the changelog entry for this integration.

## Legacy ward migration (option 2)

Jake's conditional approval at `b3cebac` chose option 2. Load now adds `gearWard(base, stored item level)` once to a non-unique warded base that has no resist key, then stamps `wardMig = 1`. A later load sees the stamp and does not add or reroll. Uniques are not written. Requirements, item level, defense, affixes, and inventory position stay. The before/after rows, the caster table (migrated Seer bolt 27, same as a new kit, naked 58), and the `v07152` repeat counts are in the changelog entry for this commit. `version.json` is still 0.7.18. PR #33 is not merged. Stage 11 is not started.
