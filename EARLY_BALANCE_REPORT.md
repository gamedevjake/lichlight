# Early balance report

Branch `balance/early-se-loot`, from `main` at `a492023` (Stage 9 merged). Gameplay version stays **0.7.18**. Rollback tag `balance-pre-early-se-loot` is that same commit, taken before these edits. This is not Stage 10 and it does not touch PR #33.

Numbers come from `TOPTIER_DAMAGE_AUDIT.md` on `analysis/toptier-damage-audit` (PR #34). That audit measured Stage 9 combat. Depth 5+ combat in this change is the live value, not the audit's proposed depth-5 brand.

`fade(d) = max(0, 1 - (d - 1) / 4)`. It is 1 at depth 1 and 0 from depth 5 on.

## Super Elite combat

Dealt numbers are `hurtPlayer` at defense 0, spread 1, block off. Hits to kill are on 70 life. Shield is 10% of life, rounded.

| Depth | Life before → after | Shield | Swing | Power before → after | Brand before → after |
| ---: | --- | ---: | ---: | --- | --- |
| 1 | 56 → **80** | 6 → **8** | 6 | 11 → **19** (×3.00) | 5 → **13** (×2.00) |
| 2 | 77 → **102** | 8 → **10** | 8 | 14 → **22** (×2.675) | 7 → **14** (×1.7875) |
| 3 | 98 → **119** | 10 → **12** | 10 | 16 → **23** (×2.35) | 8 → **15** (×1.575) |
| 4 | 120 → **133** | 12 → **13** | 11 | 19 → **22** (×2.025) | 9 → **15** (×1.3625) |
| 5 | 141 → **141** | 14 | 13 | 21 → **21** (×1.7) | 11 → **11** (×0.85) |

The audit's depth-5 brand formula would have dealt **14** (×1.15). That number is not used. Depth 5 and every deeper floor keep the current life formula and the current power ×1.7 and brand ×0.85. Depth 10 is still 249 life and a 25 shield.

Power at defense 7 on depth 1 deals **16** (was 9). A sidestep of the swing still deals 0. Standing in the depth-1 swing still deals 6. Tell times, the 0.25s swing lock, the lane, and the circle radii are unchanged.

## Hits to kill on the measured life band

Power 19 and brand 13. These are naked hits, no armor.

| Life | Where it comes from | Powers of 19 | Brands of 13 |
| ---: | --- | ---: | ---: |
| 70 | No gear | 4 | 6 |
| 74 | Median clear of floors 1–2 | 4 | 6 |
| 91 | p90 | 5 | 7 |
| 102 | p99 | 6 | 8 |
| 111 | Best of the audit's 240 clears | 6 | 9 |
| 198 | Not produced at level 2 | 11 | 16 |

## Time to kill

Representative hit is `round((sheet min + sheet max) / 2)` at level 2, non-crit, through `damageEnemy`, shield included. Period is `0.45 / aspd`. "Window" is the time left after life crosses half. A power tell finishes when that window is at least 1.30s.

| Depth | Weapon | Hit | Time | Window after half | Power finishes |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | Rusty sword (sheet 2–5) | 4 | 9.9s | 4.5s | yes |
| 1 | Short sword, common (3–6) | 5 | 8.1s | 3.6s | yes |
| 1 | Rare sword, +damage (4–7) | 6 | 6.8s | 3.2s | yes |
| 1 | Grandsire Oswin (10–14, 1.21 speed) | 12 | 3.0s | 1.5s | yes |
| 1 | Grandsire, max roll | 14 | — | 1.1s | no |
| 5 | Rusty sword | 4 | 17.5s | 7.6s | yes |

Depth 5 matches the audit's old time to kill, because life and the swing did not move.

## Loot

| | Before | After |
| --- | --- | --- |
| Super Elite unique, depths 1–2 | 100% via `bossUnique` | **0%.** Guaranteed rare, item level = depth. |
| Super Elite unique, depths 3 / 4 / 5 | 100% | **20% / 35% / 50%**, otherwise the same rare |
| Super Elite unique, depths 6–9 / 10+ | 100% | **70% / 100%** |
| Depth-5 boss | Guaranteed unique | Unchanged. Still the first drop that cannot miss. |
| Gold, ration, gate key on a Super Elite | 25 gold, 1 ration, 6.5% key | Unchanged |
| Magic / rare required level, item level ≤ 3 | Always 1 | Normal formula. Item level 3 rare requires **3**. Item level 3 magic requires **2**. |
| White required level, item level ≤ 3 | 1 | Unchanged |
| Uniques | Unique formula | Unchanged |
| Gilt secret chest before depth 5 | `makeItem(depth + 2)`, 20% unique | **Rare only, item level `depth + 1`** |
| Gilt secret chest from depth 5 | `makeItem(depth + 2)`, 20% unique | **20% unique restored, item level `depth + 1`** |
| Prism gilt chest | Gold piles | Unchanged |
| Keyed / sealed chest table | Never a unique | Unchanged |
| Hollow Pedlar | Boss floors only | Unchanged. Depths 1–2 still have no shop. |

A miss on the Super Elite roll, including every depth 1–2 kill, is `makeItem(depth, 2)`.

## Migration

Policy name: `grandfather-owned`.

Already-equipped gear, backpack items, and items lying on a saved floor keep the requirement they were generated with.

- A stored `reqLvl` is kept. Load does not recompute it and does not take the item off.
- An owned item that never stored `reqLvl` is stamped with the previous rule (`calcReqLvlLegacy`: any non-unique of item level 3 or below requires level 1) and `reqSrc: 'grandfather'`.
- Taking that item off and equipping it again uses the stored number, so a level 1 character can still wear the rare they already owned.
- `makeItem` stamps `reqSrc: 'drop'` and the new formula. Equip of that new drop fails until the character reaches it. An item level 3 rare made after this change requires level 3.

Nothing in load deletes an item or clears an equipment slot because of the new requirement.

## What stayed

Trash contact (depth-1 slime is still 12 life and 4 damage; depth-5 archer contact is still 34 life and 11 damage), boss life and shield (Mother Murk is still 840 and 210), Hellmouth's mark of 3 and bite of 25%, sword period, and the tell shapes.

## Stage 10

PR #33 (`cursor/stage10-equipment-affixes-e264`) edits `makeItem0`'s affix filter, `computeStats`, the damage resolver, and the numeric-only shop-mod loop. It does not edit `calcReqLvl`, `seMaxHp717`, `seLoot717`, `openSecretChest`, or the save fixer.

A merge should be textual-clean if this branch stays out of `makeItem0` and out of the shop-mod loop. Both sides add keys on the `window.game` export, in different parts of that object. The semantic overlap is that Stage 10's new affixes roll inside `makeItem0`, and this branch's required level is applied to that same item afterwards. Early magic and rare drops would then carry the new affixes and the new required level. Super Elite unique chances live only here. Stage 10 does not roll Super Elite loot.

## Tests

`node tests/early-balance.mjs` — **50 passed, 0 failed.** It locks the depth 1–5 table, depth 5+ staying on the old body (brand 11, not 14), the sidestep, the unique-chance edges and a 200-roll sample, gold / ration / gate key, the level curve through depth 5, required level for new whites / magic / rare / uniques, gilt chests, the chest table, the Hollow Pedlar, the depth-5 boss unique, trash contact, Hellmouth's constants, the time-to-kill rows, the 70–198 hit tables, and the grandfather save (equipped, backpack, and floor loot).

Stages 1–8, headless Chrome, one sequential pass: **71/0, 73/0, 58/0, 75/0, 78/0, 47/0, 70/0, 64/0.** Same counts as the Stage 9 record. No new failure name.

`tests/stage9-bosses.html`: **75 passed, 1 failed.** The new name is `standing on the power outline is hit` (life left 340). That check stands on a depth-1 floor and expects `20 × 1.7 = 34`. Depth-1 power is now `×3`, so the same actor deals 60. `power tell is 1.3s and times 1.7` still passes, because `SE_TELL.power.mul` is still 1.7 and that assertion runs at depth 10. Swing damage on that harness still matches.

Legacy, same pass. Counts are pass/fail. New names are only the two Super Elite loot lines.

| File | Result | Failure names that are new |
| --- | --- | --- |
| `v075` | 58/2, then 59/1, then 58/2 | none. `f4 skins rotate` was absent on the middle run. `f3 multi select` stayed. Same flake the Stage 9 log already reran. |
| `v076` | 48/0 | |
| `v077` | 60/4 | none. `version`, `version source`, `f4 pool`, `f5 shop boss`. |
| `v078` | 60/1 | none. `version 0.7.11`. |
| `v078-play` | 25/1 | none. `f11 champions only`. |
| `v0781` | 27/2 | none. `version`, `f1 boss hits` (`49 at depth 5`, the recorded miss against `50 * depth`). |
| `v079` | 49/1 | none. `version`. |
| `v0710` | 36/1 | none. `version`. |
| `v07101` | 41/1 | none. `version`. |
| `v07102` | 54/0 | |
| `v07103` | 24/3 | none. `version`, `stats canvas`, `name in panel`. |
| `v0711` | 43/5 | none. Same five names (`version`, `hundred gold`, `tome icon`, `stats scroll`, `stats canvas kept`). One extra pass versus the 42/5 record, which is the conditional check that file already emits. |
| `v0712` | 37/6 | none. |
| `v0713` | 32/5 | none. |
| `v0714` | 33/8, twice on rerun | none. `version` plus the six footer names and `tab hitboxes match art`. This file already moved between 40/1 and 33/8. |
| `v0715` | 19/13 | none. |
| `v07151` | 8/45 | none. |
| `v07152` | 36/1 | none. Only `version`. The other recorded state of this file is 34/3. |
| `v0716` | 49/1 | none. `version`. |
| `v0717` | 46/2 | **`se loot`** (`g25 r1 u0 k1`). Was 47/1, version only. Gold, the ration, and the forced gate key still match. The unique is gone on depth 1. |
| `v0718` | 19/1 | **`se loot`** (`g25 r1 u0`). Was 20/0. |

Those three new names (`standing on the power outline is hit`, and `se loot` in `v0717` and `v0718`) are the old locks. They were not rewritten. They are deterministic, not flakes.
