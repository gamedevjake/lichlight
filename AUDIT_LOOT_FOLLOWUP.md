# Loot follow-up audit

Audit only. No loot reduction was implemented. PR #42 was not changed. `version.json` is still **0.7.18**. Combat was not touched.

Measured on PR #42 at `5363665a5f2eb767647214c02ff9d016c5dfaa68`. Eight clears of floors 1–12, seeds `3000 + n × 97`, the same family as the PR measurement. Every enemy is killed. The Rusty Sword is picked up, so it spawns once. An upgrade is a piece whose score beats anything already seen in that slot. Score is weapon `min + max`, or armor `def` (else item level), plus rarity × 8. The same rule as the PR audit. Redundant means not an upgrade. Gold is every coin on the ground. The counterfactuals delete recorded items before pickup. They do not add gold, and they do not re-roll the floor.

The PR writeup's 86 pieces came from a kill loop that stopped at 100 enemies. This recount kills the rest. Those leftovers are mostly trash, which no longer drops gear, plus a few champion whites. The full clear is **84.9** pieces, **29** weapons, **28.5** upgrades, **2208** gold, bag full on floor **4.25** (6 runs on floor 4, 2 on floor 5).

## Where the 84.9 pieces come from

Mean of 8 clears. Free chests, cracks, passages, props, the prism, and the Pedlar drop no equipment. The Pedlar stands on both boss floors with 3 sealed offers and sells nothing in this sim.

| Source | Pieces | Upgrades | Redundant | Weapons | What it is |
| --- | ---: | ---: | ---: | ---: | --- |
| Keyed chest | 23.9 | 6.8 | 17.1 | 7.5 | 17.1 magic, 6.8 rare. Still 100% gear once level ≥ 3. |
| Super Elite | 12.0 | 7.5 | 4.5 | 3.6 | 5.5 rare, 6.5 unique. One a floor. Best upgrade rate. |
| Loose floor | 9.5 | 2.1 | 7.4 | 3.4 | Island chest-table gear. Not a chest you open. |
| Champion | 9.3 | 0.6 | 8.6 | 3.4 | All white. About 7% of them are upgrades. |
| Puzzle rare | 8.4 | 4.3 | 4.1 | 3.0 | The one greater rare per floor. All rare. |
| Squeeze chest | 7.1 | 2.4 | 4.8 | 2.6 | 6.3 rare, 0.9 unique. The gilt secret. |
| Boss | 4.0 | 2.6 | 1.4 | 1.4 | Exactly 2 on floor 5 and 2 on floor 10. |
| Extra vault | 3.6 | 0.6 | 3.0 | 1.4 | Chest-table gear in other puzzle rooms. Not the floor's rare. |
| Sealed room | 3.1 | 0.6 | 2.5 | 0.8 | The 60% chest-table piece behind a door that had no loot. |
| Mimic | 3.0 | 0 | 3.0 | 1.0 | All white. None were upgrades. They show up from floor 8. |
| Rusty Sword | 1.0 | 1.0 | 0 | 1.0 | Once, on floor 1. |
| Free chest, crack, prop, prism, Pedlar | 0 | 0 | 0 | 0 | Gold, potions, keys, or a shop. |

56 of the 85 pieces are redundant. The 20-slot bag fills with those copies.

## Why it still fills on floor 4

Floors 1–4 drop **21.5** pieces. The bag is at 4.4, 10.0, 15.9, then 19.8. Upgrades by the end of floor 4 are only **12.9**.

| Source on floors 1–4 | Pieces | Share |
| --- | ---: | ---: |
| Keyed chest | 8.4 | 39% |
| Super Elite | 4.0 | 19% |
| Puzzle rare | 2.3 | 10% |
| Loose floor | 2.3 | 10% |
| Squeeze | 1.8 | 8% |
| Champion | 1.4 | 6% |
| Rusty Sword | 1.0 | 5% |
| Extra vault + sealed | 0.5 | 2% |

Loose, sealed, and extra vault gear are the right things to cut first, and they are mostly not why the bag fills. Floors 1–4 hold about **2.8** of them. The other **13** of that family land on floors 5–12, after the bag is already full. Cutting the whole family removes **16.3** pieces and only moves the full floor from 4.25 to **4.63** (3 runs still fill on floor 4, 5 on floor 5).

The block that fills the bag is the rewards this audit was told to keep. Keyed chests, the Super Elite, and the puzzle rare are **14.6** of the first 21.5 pieces. Add the Rusty Sword and it is 15.6, before a single champion, island, or squeeze.

## Ranked recommendation

Gold stays **2208** in every row. These cuts delete gear. They do not mint replacement coins. Weapons and upgrades are recomputed on the pieces that remain.

| Rank | Cut | Pieces | Weapons | Upgrades | Bag full | Runs |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| — | PR #42, no further cut | 84.9 | 29.0 | 28.5 | 4.25 | 6 on 4, 2 on 5 |
| 1 | Loose + sealed + extra vault, and champion whites | 59.4 | 20.1 | 25.6 | 4.88 | 1 on 4, 7 on 5 |
| 2 | Rank 1, plus no squeeze gear on floors 1–4 | 57.6 | 19.5 | 25.1 | 5.25 | 6 on 5, 2 on 6 |
| 3 | Loose + sealed + extra vault, and half of keyed chests miss | 56.6 | 19.5 | 24.9 | 5.50 | 4 on 5, 4 on 6 |
| — | Generator gear only (loose, sealed, extra vault) | 68.6 | 23.5 | 26.6 | 4.63 | 3 on 4, 5 on 5 |
| — | All squeeze gear, on top of rank 1 | 52.3 | 17.5 | 23.6 | 5.25 | 6 on 5, 2 on 6 |

**1. Do this if the four identities stay whole.** Remove island gear, sealed-room chest-table gear, extra vault gear, and champion equipment. Leave keyed chests, mimics, the puzzle rare, Super Elites, squeeze chests, bosses, and the Rusty Sword alone.

That is the smallest cut that gets off floor 4 without breaking a named identity. End of floor 4 the bag averages **17** slots. Seven of eight clears fill on floor 5. One still fills on floor 4. Upgrades only fall from 28.5 to 25.6, because 8.6 of the 9.3 champion pieces and about 12 of the 16 generator pieces were redundant. It does not make floor 6 the common case.

**2. Do this only if floor 6 has to happen and keyed chests stay a gear drop every time.** Same cut, and also no squeeze piece on floors 1–4. Deep squeeze chests stay. Mean full floor **5.25**, range 5–6, six runs on 5 and two on 6. Removing every squeeze, including the deep ones, does not move the bag any further and throws away later rares. Don't.

**3. Do this only if squeeze stays and the bag should split evenly across floors 5 and 6.** Remove the generator gear and let half of keyed chests miss their equipment (the ration or torch the level 1–2 gate already uses). Mean full floor **5.50**, four runs on each. This thins the keyed chest. Half of them stop being a gear moment. That is why it is third.

Generator gear alone is not enough. Half of it does nothing to the full floor (mean stays 4.25). Champion whites alone also stay at 4.25, because almost all of them are on later floors.

Floor 6 cannot be the typical clear while keyed chests, the puzzle rare, and the Super Elite all stay at full rate. Those three plus the Rusty Sword are already about 16 pieces by floor 4. Floor 5 then adds another keyed chest, another Super Elite, the puzzle rare, and the boss's two pieces. That protected set fills a 20-slot bag during floor 5 even if every champion, island, vault extra, sealed piece, and early squeeze is gone.

## Leave these alone

- Super Elite. 7.5 of 12 pieces are upgrades. One a floor. Not a weapon by force.
- The one puzzle rare. 4.3 of 8.4 are upgrades.
- Bosses. Already two pieces. 2.6 of 4 are upgrades.
- Rusty Sword. One piece, and it is an upgrade.
- Mimics. Three whites, none of them upgrades, and they start at floor 8. Cutting them does not move the bag. The identity was called out to keep.
- Keyed chests, unless rank 3 is the one Jake wants. 17 of 24 are redundant, but they are also 8 of the first 21 pieces. That is the volume.

## PR #42 check

Head is still `5363665a5f2eb767647214c02ff9d016c5dfaa68`. Against `e830a531865fbc72ea3db6a632d720e65ac524e2` the diff is `index.html` (the approved loot cut), `tests/loot-economy.html`, the two count locks in `tests/early-loot-gate.html`, and the changelog append. `version.json` is `0.7.18`.

Re-run at that game code, all passing: `loot-economy` 33, `early-loot-gate` 43, `camera-zoom` 125, `hud-scale` 263, `early-balance` 50, `se-midgame-prototype` 28, stages 1–11 (71, 73, 58, 75, 78, 47, 70, 64, 77, 64, 32).

The legacy failure names were compared at this same commit when #42 opened. This audit did not edit `index.html`, so those names were not re-run.

Raw traces: `tools/audit/out/loot-followup.json`. Rebuild the tables with `node tools/audit/loot-followup-report.mjs`.
