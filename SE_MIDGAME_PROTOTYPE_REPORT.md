# Super Elite midgame prototype

Review only. Not merged, not deployed, `version.json` still **0.7.18**. Branched from `main` at `5bfb9a8`. This is not Stage 11 and it does not contain that work.

The baseline Jake asked for is the half-step from `SE_MIDGAME_BALANCE_AUDIT.md`: about **35 seconds** for a rare sword at depth 12, not the 65–85 second band. Outgoing Super Elite damage uses the full proposed curve. Tell durations, the 0.25 s swing lock, the lane, and the circle radii are unchanged. No new attack phase and no AI change.

Numbers below are from `tests/se-midgame-prototype.html`, which calls the live functions. Spread is 1. Block is not rolled. Crit is the kit's real chance.

## The three knobs

They are separate tables. Nothing derives one from another at runtime. Depths 1–4 sit on the first anchor, which is 1, so the early tune is byte-for-byte the same fight.

`seLerpTable` draws a straight line between anchors and holds the last value after that.

| Knob | What it changes | Anchors |
| --- | --- | --- |
| `SE_LIFE_TABLE` / `seLifeMul` | Multiplies `seFadeHp717` (the early-tune body). Shield stays 10% of the new life. | depth 4 → 1, depth 12 → **4**, depth 16 → 4 |
| `SE_TAKEN_TABLE` / `seTakenMul` | Fraction of a **player** hit a Super Elite keeps, after resist and shock, before the one round. | depth 4 → 1, depth 5 → 0.55, depth 9 → 0.20, depth 12 → **0.186**, depth 16 → 0.146 |
| `SE_DMG_TABLE` / `seDmgMul` | Multiplies `seBaseDmg717` before the tell ratios. This is the full curve, not halved. | depth 4 → 1, depth 5 → **2.5**, depth 12 → **5.5**, depth 16 → **7** |

Depth 12 is life ×4 and keeps **18.6%** of a player hit. Together that is about 21× the old melee clock (1.63 s → **35.2 s** at level 20, **35.8 s** at level 19). The full band would have been about 45× and about 73 s. That multiplier is not in this branch.

`__seTune = 'before'` forces all three to 1 so the same functions can measure the old fight. Nothing in the game sets it.

## Loadouts

Item level equals the depth. The sword is the best sword whose base level is `<= depth + 1` (Short Sword, then Broad Sword, then Rune Blade from depth 8). Armor, helm, boots, shield, and amulet use that same gate. Fight level is the full-clear level from the audit (depth 12 is fought at 20; level 19 is also measured).

| Kit | Weapon | Armor |
| --- | --- | --- |
| White | That sword, no affix, ward on the armor | White pieces, ward and implicits only. No ring. |
| Rare | Median damage, attack speed, and crit | Median defense and life, one fire resist on the helm, a ring with median damage and half the median attack speed |
| Unique | The sword unique for that base | The same rare armor |
| Ninth Psalm | The Ninth Psalm | The same rare armor. From depth 9 the on-level sword unique **is** The Ninth Psalm, so those two rows match. |

At item level 12 the rare medians are damage 8, attack speed 20, crit 11.

## Before and after

Tap is melee only, expected crit included. Hybrid is that melee plus Fireball whenever 4 mana is up. "Hit" is the expected physical hit the Super Elite actually loses. Fireball is the core bolt after its resist and after fortitude. Swing and power are `hurtPlayer` against that kit's defense. The percent is of that kit's max life.

### Rare sword (the 35 s baseline)

| Depth | Lv | Life | Hit kept | Their damage | Tap | Hybrid | Melee hit | Fireball | Swing | Power |
| ---: | ---: | --- | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 1 | 3 | 80 → 80 | 9.4 → 9.4 | ×1 | 3.72 → 3.72 | 1.18 → 1.18 | 9.4 → 9.4 | 19 → 19 | 4 → 4 (3.7%) | 13 → 13 (12%) |
| 4 | 7 | 133 → 133 | 22.4 → 22.4 | ×1 | 2.49 → 2.49 | 0.90 → 0.90 | 22.4 → 22.4 | 30 → 30 | 5 → 5 (2.9%) | 10 → 10 (5.8%) |
| 5 | 9 | 141 → 194 | 24.6 → 13.6 | ×2.5 | 2.36 → **5.9** | 0.90 → 2.3 | 24.6 → 13.6 | 37 → 21 | 5 → 13 (6.5%) | 9 → 21 (11%) |
| 9 | 15 | 228 → 656 | 49.6 → 9.9 | ×4.21 | 1.64 → **24** | 0.65 → 12 | 49.6 → 9.9 | 61 → 12 | 5 → 22 (8.1%) | 9 → 38 (14%) |
| 12 | 20 | 293 → **1172** | 62.1 → **11.5** | ×5.5 | 1.63 → **35.2** | 0.63 → **18.9** | 62.1 → 11.5 | 77 → 14 | 6 → 32 (9.6%) | 10 → **55 (16%)** |
| 16 | 26 | 379 → 1516 | 76.1 → 11.1 | ×7 | 1.65 → **45.3** | 0.90 → 25 | 76.1 → 11.1 | 89 → 13 | 7 → 47 (11%) | 11 → 79 (19%) |
| 20 | 31 | 465 → 1860 | 88.8 → 13.0 | ×7 | 1.66 → **45.4** | 0.86 → 26 | 88.8 → 13.0 | 106 → 15 | 7 → 52 (11%) | 13 → 89 (18%) |

Level 19 with the same depth-12 rare kit taps in **35.8 s**. Pool at depth 12 is 1172 + 117 shield.

### White

| Depth | Tap | Hybrid | Melee hit | Fireball | Power (% of white life) |
| ---: | --- | --- | --- | --- | --- |
| 1 | 8.38 → 8.38 | 1.80 → 1.80 | 4.7 → 4.7 | 16 → 16 | 15 → 15 (19%) |
| 4 | 5.21 → 5.21 | 1.35 → 1.35 | 12.6 → 12.6 | 28 → 28 | 12 → 12 (9%) |
| 5 | 4.75 → 11.8 | 1.35 → 3.6 | 14.7 → 8.1 | 33 → 18 | 10 → 25 (17%) |
| 9 | 3.11 → 45 | 0.90 → 19 | 33.1 → 6.6 | 56 → 11 | 11 → 46 (23%) |
| 12 | 3.35 → **72** | 0.90 → 31 | 39.4 → 7.4 | 70 → 13 | 13 → **70 (28%)** |
| 16 | 3.65 → **100** | 1.23 → 43 | 46.7 → 6.8 | 81 → 12 | 15 → **104 (34%)** |
| 20 | 3.99 → **110** | 1.35 → 41 | 52.5 → 7.6 | 95 → 14 | 17 → **121 (34%)** |

### Unique, and The Ninth Psalm

From depth 9 the unique row is The Ninth Psalm. Depths 1 and 4 are Grandsire Oswin. Depth 5 is Oathbreaker. Armor is the rare set, so the power percent matches the rare row.

| Depth | Who | Tap | Hybrid | Fireball |
| ---: | --- | --- | --- | --- |
| 1 | Grandsire | 2.14 → 2.14 | 0.90 → 0.90 | 19 → 19 |
| 4 | Oathbreaker | 1.90 → 1.90 | 0.85 → 0.85 | 30 → 30 |
| 5 | Oathbreaker | 1.85 → 4.6 | 0.84 → 2.1 | 37 → 21 |
| 9 | Ninth Psalm | 1.47 → 21 | 0.45 → **9.0** | 98 → 20 |
| 12 | Ninth Psalm | 1.58 → 34 | 0.45 → **14.5** | 119 → 22 |
| 16 | Ninth Psalm | 1.73 → 47 | 0.45 → **21** | 138 → 20 |
| 20 | Ninth Psalm | 1.85 → 51 | 0.45 → **22** | 161 → 23 |

## Damage math

Checked on the depth-12 rare kit with fortitude 0.186, `scale` off unless noted, one round at the end.

| Case | Result |
| --- | --- |
| Physical 100, no scale | 19, which is `round(100 × 0.186)` |
| Fire 100 into a +20 Fire resist | 15, which is `round(80 × 0.186)`. Resist runs first. |
| Charge, `scaleAmount(20, Physical, 2.25)` then fortitude | Matches `round(scaled × 0.186)`. The ×2.25 is the live `more` on a full charge. |
| Shock 10%, then the physical 100 | 20, which is `round(110 × 0.186)` |
| Burning tick, base 40, `scale: false` | 7, which is `round(40 × 0.186)`. Not floored away to a special case, and not left at 40. |
| Life steal 8% on `scaleAmount(40)` | Heals **3.2**, which is 8% of 40. The Super Elite lost **7**. Leech does not see fortitude. |

That last row is the open pre-mitigation life-steal debt. A swing that now removes about 12 life still heals as if it removed about 60. Over a 35 s fight that is a lot of recovery. It does not shorten the kill. It does soften the new outgoing damage whenever the player is swinging. Not fixed. Crab shell, uncapped crit, and curse life drain were not touched. Mother Murk is still 840. A Super Elite still has no affix.

The minimum of 1 still applies after fortitude. A hit that scales below 0.5 stays 1. The rare sword's hits are around 12, so the floor is not what makes this fight 35 s.

## What became too strong or too weak

Depths 1–4 did not move. The gaps there (a Grandsire weave is about 4× faster than the rare sword taps) are the current game.

On the new curve:

- **The Ninth Psalm weave is the strong build.** At depth 12 it kills in **14.5 s** against the rare sword's **35 s**, about 2.4× faster. Fireball is fortified too (77 → 14), so this is no longer a one-second delete, and it is still the build that skips the baseline.
- **White armor is the weak build, on both sides.** The white sword takes about **2×** as long (72 s at depth 12, 100 s at depth 16, 110 s at depth 20). The same white defense eats a power for **28%** of life at depth 12 and **34%** at depth 16 and 20. The outgoing curve was not halved. Lighter armor feels that. Three powers kill a white-armored player at depth 16. The rare kit's power is 16% at depth 12, which is the shape the full damage curve was written for.
- **Oathbreaker and Grandsire** do not outrun the rare sword once the fortitude is on, except by the Fireball they share with the rare armor's spell power. Their tap times sit next to the rare tap.

## Behavior, not in this branch

No new phase, no leash change, no radius change. The swing is still 1.00 s with a lock at 0.25 s, the power is still 1.30 s at radius 10, and the brand is still 1.15 s at radius 8 and does not follow. A sidestep of the depth-1 swing still deals 0, and standing in it still deals 6.

The longer bar means the player has to make that sidestep several times. The safe sword ring around the power circle is still there (sword reach 36, power radius 15). If a playtest shows the player still takes zero damage while attacking, the next lever is the power radius, not more life and not a new phase. Champion affixes should stay off Super Elites.

## Risks

- **35 s is a playtest number.** It is not the 65–85 s band. Do not read a green test as a final tune.
- **White powers are spiky** from depth 12 on, because outgoing damage is the full curve and white defense is not.
- **The Ninth Psalm still finishes early**, around 15 s at depth 12 with Fireball.
- **Life steal refunds the pre-fortitude hit.** An 8% leech swing heals about a quarter of the chip the Super Elite actually took. Players who stack leech will feel tougher than the power-percent column says.
- **Small hits.** A 62-point swing becomes about 12. The bar moves. If that feels empty, stop here. Do not take the other half of the climb in the same patch.
- **Depth 5 is the first fortified floor.** The rare sword goes from 2.4 s to 5.9 s, and a power goes from 9 to 21. The early floors do not change.
- **Stage 10 and the early-balance suite lock the old depth-5 and depth-10 life.** Those checks fail on purpose. They are named in the suite section. Tell geometry checks still pass.

## Tests

`tests/se-midgame-prototype.html` is 28/0. It locks the early life and shields, the three tables, tell geometry and the 0.25 s lock, the sidestep, the 32–40 s depth-12 rare sword (and the same band at level 19), depth 16 staying under 70 s, the physical / fire / charge / shock / burn / leech cases, and Mother Murk.

## Test expectation changes

Only checks that failed because they still wanted the pre-prototype life, shield, or incoming hit. Mechanics (poise still lands, Hellmouth does not delete, resist still applies once and before fortitude, depth 1–4 literals, tell ratios) stay asserted. `index.html` was not edited for this pass.

| File | Test | Old | New | Why |
| --- | --- | --- | --- | --- |
| `tests/stage5-poise.html` | `super elite fight shield does not stop poise` | Shield ends at 10 (40 − 30) | Shield ends at `40 − round(30 × seTakenMul(depth))`. At depth 5 that is 23 (the hit kept is 17). Life stays 400. Poise dealt stays 5.4 and the tier stays super. | Depth 5 keeps 0.55 of a player hit. The shield still absorbs the whole hit, and it still does not block poise. |
| `tests/stage8-enemies.html` | `hellmouth does not delete the super elite` | Life 80 and shield 10 | Life stays 80. Opening shield is `round(seMaxHp717(depth) × 0.10)` (19 at depth 5). After the cast it is that shield minus `round(shield × 0.25)` (19 − 5 = 14). The actor is still in the fight and the shield is still above 0. | The bite is still 25% of the current shield and still does not touch life. The old 10 was 25% of the old 14-point shield. |
| `tests/stage9-bosses.html` | `super elite pools match and fire stays killable` | Fire hit is `round(64 × resist)` | Same resist fraction, then `× seTakenMul(depth)`, then round. A −15 Fire row at depth 10 goes from 74 to 14. Pools still have to equal `seMaxHp717`. | Fortitude applies after resist. The bolt is still well under the life bar. |
| `tests/stage9-bosses.html` | was `physical is unchanged and fire resist applies once on a super elite` | Life ends at 320, physical amount 100 | Renamed `physical skips resist and fire resist applies once before fortitude`. Physical amount is `round(100 × seTakenMul)` (55 at depth 5). Fire amount is `round(80 × seTakenMul)` (44). Life ends at 500 minus those two (401). `penHits` stays 1 and `resistPct` stays 20. | Physical still ignores the Fire row. Fire resist still runs once, then fortitude. |
| `tests/stage10-equipment.html` | was `super elite life follows the early-balance curve` | `seMaxHp717` is 80, 141, 249 | Renamed `super elite life keeps the early body and applies the life table`. `seFadeHp717` is still 80, 141, 249. Live `seMaxHp717` is 80, and `round(fade × seLifeMul)` at depths 5 and 10 (194 and 809), which must differ from the fade body. | Depth 1 is the early tune. Depths 5 and 10 keep that body and then apply `SE_LIFE_TABLE`. |
| `tests/early-balance.html` | was `depths 1-5 match the approved table and 5+ stays on the old body` | Depth 5 life 141, shield 14, hits 13/21/11. Depths 6–12 life equals `seBaseHp717`. | Renamed `depths 1-4 match the approved table and 5+ follows the life and damage tables`. Depths 1–4 stay on 80/102/119/133 and the old def-0 hits. From depth 5 the fade body still equals `seBaseHp717`, live life is the life table (depth 5 is 194 / 19), and def-0 hits are `round(seBaseDmg717 × seDmgMul × seTellMul)` (depth 5 is 31 / 53 / 27). Tell ratios from depth 5 stay 1.7 and 0.85. | The early floors stay locked. Deeper floors have to move with the tables, and the tell ratios do not. |
| `tests/early-balance.html` | was `depth 5 brand stays 11, not the audit 14` | The local expected brand was 11 | Renamed `depth 5 brand tell stays 0.85, not the audit 1.15`. `seTellMul('brand', 5)` is 0.85. The dealt brand from ×0.85 is not the ×1.15 number and is not 14. | The tell ratio did not become the audit's 1.15. Outgoing damage did change, so 11 is no longer the hit. |
| `tests/early-balance.html` | was `time to kill matches the audit for common, rare, and unique` | Depth 5 Rusty Sword 17.5 s, window 7.6 s. The kill loop stopped at 80 hits. | Renamed `depth 1 time to kill matches the audit and depth 5 follows life and taken`. Depth 1 stays 9.9 / 4.5, 8.1 / 3.6, 6.8 / 3.2, 3.0 / 1.5, and the max-roll window stays 1.1. The power-tell rule stays (depth-1 unique window ≥ 1.3 s, max roll < 1.3 s). Depth 5 is simulated from `seMaxHp717` and `round(4 × seTakenMul)` and must finish: 48.15 s, window 22.05 s. The loop cap is 400 hits so that kill is visible. | Depth 1 is unchanged. Depth 5's longer bar and smaller hit need more than 80 swings, and the expected clock is the tables, not 17.5 s. |

No other check in these files was edited. Stages 1–4, 6, and 7 were not edited.

## Suites against main

Same runner, headless Chrome, this branch versus `5bfb9a8`. Counts are pass/fail. No remaining failures.

| File | `5bfb9a8` | This branch |
| --- | --- | --- |
| `tests/stage1-damage.html` | 71/0 | 71/0 |
| `tests/stage2-resist.html` | 73/0 | 73/0 |
| `tests/stage3-crit-scaling.html` | 58/0 | 58/0 |
| `tests/stage4-status.html` | 75/0 | 75/0 |
| `tests/stage5-poise.html` | 78/0 | 78/0 |
| `tests/stage6-weapons.html` | 47/0 | 47/0 |
| `tests/stage7-skills.html` | 70/0 | 70/0 |
| `tests/stage8-enemies.html` | 64/0 | 64/0 |
| `tests/stage9-bosses.html` | 77/0 | 77/0 |
| `tests/stage10-equipment.html` | 64/0 | 64/0 |
| `tests/early-balance.html` | 50/0 | 50/0 |
| `tests/se-midgame-prototype.html` | not on main | 28/0 |
