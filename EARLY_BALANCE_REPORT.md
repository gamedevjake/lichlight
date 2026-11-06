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

## Required level

Magic and rare intentionally use different multipliers. That split was already in `REQ_MULT` / `REQ_ADD`. The old rule hid it: any non-unique with item level 3 or below required level 1. This change leaves that shortcut on whites only. Magic and rare now use the formula at every item level, including 1–3. Uniques are a third formula and did not change.

`L` is the item level. Rarity index `r` is 0 white, 1 magic, 2 rare.

| Rarity | Formula | Item level 3 |
| --- | --- | --- |
| White | `1` when `L <= 3`, else `floor(0.60 * (L - 1))` | **1** |
| Magic | `floor(0.70 * (L - 1)) + 1` | **2** (`floor(1.4) + 1`) |
| Rare | `floor(0.80 * (L - 1)) + 2` | **3** (`floor(1.6) + 2`) |
| Unique | `max(1, round(max(1, L - 2) * 0.75) + bonus)` | unchanged |

The constants are `REQ_MULT = [0.60, 0.70, 0.80]` and `REQ_ADD = [0, 1, 2]`. An item level 3 rare requiring level 3 is the rare row of that table, not a second rule pasted on top of magic. An item level 4 rare is `floor(0.80 * 3) + 2 = 4`, the same number the old formula already produced above the shortcut.

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

## Pre-merge verification

Compared with a fresh run of tag `balance-pre-early-se-loot` (`a492023`), after the three harnesses were pointed at the approved rules. `version.json` is still 0.7.18. The tag on origin resolves to that same commit.

The three updated checks now derive the rule instead of a frozen integer:

- `standing on the power outline is hit` (`tests/stage9-bosses.html`), on a depth-1 floor. Expected damage is `round(actor damage × (1.7 + 1.3 × fade(1)))`. The same actor's depth-5 ratio is `1.7`. The check requires the depth-1 hit to be larger, the center on the outline to take it, and the next check requires a center outside the outline to take 0.
- `se loot` in `tests/v0717.html` and `tests/v0718.html`. The depth-1 kill must be a rare of item level 1, never a unique, with 25 gold, a ration, and the gate key when the roll is forced under 6.5%. Further kills seed `__seUnique`: depth 2 stays a rare on both a 0 roll and a 0.99 roll; depth 3 (and depth 4 in `v0718`) hits a unique just under the chance and a rare exactly on the chance; depths 10 and above stay unique at rolls 0, 0.5, and 0.999.

`tests/early-balance.html` is **50/0**, including the grandfather save: an equipped item-level-3 rare with the old requirement stays worn at level 1, can be removed and equipped again, a floor item with no stored requirement is stamped with the old shortcut, and a new drop keeps required level 3.

Stages 1–9 on this branch: **71/0, 73/0, 58/0, 75/0, 78/0, 47/0, 70/0, 64/0, 77/0.** The same stages on `a492023`: **71/0, 73/0, 58/0, 75/0, 78/0, 47/0, 70/0, 64/0, 76/0.** Stage 9 gained one passing check (`depth 1 power ratio is above the depth 5 ratio`). No stage failure name remains.

Legacy, one sequential pass each. Counts are pass/fail. A name is listed when this run's set differs from the `a492023` run.

| File | `a492023` | This branch | Name diff |
| --- | --- | --- | --- |
| `v075` | 59/1 | 59/1 | none. Both only `f3 multi select`. |
| `v076` | 48/0 | 48/0 | |
| `v077` | 60/4 | 59/5 | branch also emitted `f2 brazier` this pass. Six reruns on the branch were 60/4 five times and 59/5 once. Six reruns on `a492023` stayed 60/4. The check needs a spawned brazier whose nearest interact is `LIGHT TORCH`. This diff does not touch braziers or interact range. |
| `v078` | 60/1 | 60/1 | none. `version 0.7.11`. |
| `v078-play` | 25/1 | 25/1 | none. `f11 champions only`. |
| `v0781` | 27/2 | 27/2 | none. `version`, `f1 boss hits` (`49 at depth 5`). |
| `v079` | 49/1 | 49/1 | none. `version`. |
| `v0710` | 36/1 | 36/1 | none. `version`. |
| `v07101` | 41/1 | 41/1 | none. `version`. |
| `v07102` | 54/0 | 54/0 | |
| `v07103` | 24/3 | 24/3 | none. |
| `v0711` | 42/6 | 40/5 | baseline emitted `trash in the maw` and two sibling checks. The branch floor did not, so those three lines were not emitted. The other five names match. |
| `v0712` | 37/6 | 37/6 | none. |
| `v0713` | 32/5 | 32/5 | none. |
| `v0714` | 40/1 | 33/8 | footer set on the branch pass only. Four more runs on `a492023` were 33/8, 33/8, 40/1, 33/8. Same oscillation. |
| `v0715` | 19/13 | 19/13 | none. |
| `v07151` | 8/45 | 8/45 | none. |
| `v07152` | 34/3 | 34/3 | none. `version`, `tab hits follow scale`, `slot hit follows scale`. |
| `v0716` | 49/1 | 49/1 | none. `version`. |
| `v0717` | 47/1 | 50/1 | none. Both fail only `version`. The branch file has three more passing loot checks. |
| `v0718` | 20/0 | 23/0 | none. Three more passing loot checks. |

No failure name that is stable on this branch is absent from `a492023`.

### `f4 skins rotate`

Test name: `f4 skins rotate` in `tests/v075.html`.

Repro: `__prismForce` is set, then `startFloor` at depths 7, 14, 21, and 28. The check wants skins A, B, C, D. `prismSkin075(d)` is `'ABCD'[floor(d / 7) - 1]`, which is deterministic. The failing payload is a missing depth, not a wrong letter. One branch run before this verification printed `{"14":"B","21":"C","28":"D"}` (no depth 7). One of eight runs on `a492023` printed `{"7":"A","21":"C","28":"D"}` (no depth 14). The other seven baseline runs, the baseline sequential pass, the branch sequential pass, and eight dedicated branch runs did not emit this name.

Cause: `placePrism` walks generated rooms looking for a north wall that can hold the sockets, a ray fan that strikes three distinct tiles, and a vault. If none of the rooms qualify it tries `carvePrismHall075`, which itself gives up after 500 random solid rectangles. A floor that fails both leaves `prism` unset, and the check reads that as the wrong skin. Depth does not change the skin formula. It changes how often a legal room exists. This branch does not edit `placePrism`, `prismSkin075`, or `prismWant`. The flake is on `a492023`.

`f3 multi select` (`SELL ITEM  33G`) failed on every `v075` run on both commits. It is stable, not the intermittent one.

## Diff boundary

`git diff a492023` on this branch does not edit `manaCost`, `spawnBoss`, `BOSS_HP_MUL`, `BOSS_SHIELD_FRAC`, `BOSS_TELL`, `seDmg717`, or the `SE_TELL` durations and multipliers. Depth 5+ life is `seBaseHp717` because fade is 0. Depth 5+ power uses `SE_TELL.power.mul` (1.7). Depth 5+ brand uses `SE_TELL.brand.mul` (0.85). Hellmouth's mark and bite are not in the diff.

PR #33's files that this branch does not contain: `STAGE10_REPORT.md`, `tests/stage10-equipment.html`, and the Stage 10 edits inside `makeItem0`, `computeStats`, the resolver, the shop-mod loop, and the stage harnesses. The shared file is `index.html`. The hunks do not meet. Both branches add different keys on the `window.game` export.
