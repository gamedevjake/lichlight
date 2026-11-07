# Equipment drop economy audit

Audit only. Gameplay was not changed. `version.json` is still **0.7.18**. Measured on `main` at `e830a531865fbc72ea3db6a632d720e65ac524e2`, which includes the merged level 1–2 loot gate (no rare or unique until level 3, and a wearable item-level cap).

Numbers come from `tools/audit/loot-economy.html`, run headless by `tools/audit/run-audit.mjs`. Each floor is a real `startFloor`. Trash, champions, mimics, the boss, and the Super Elite are killed through `killEnemy`. Keyed chests, free chests, cracked walls, cracked floors, passages, squeeze rooms, and prism chests are opened through the live functions. Props are broken through `breakPropsAt`. The Hollow Pedlar is counted, not bought. Raw output is `tools/audit/out/loot-economy.json`.

Two samples:

- **Play.** 8 full clears of floors 1–12. Level, bag, and gold carry from floor to floor. The character starts at level 1 with an empty 20-slot bag.
- **Pinned.** 6 floors each at levels 1, 2, and 6, depths 1, 3, 5, 8, and 12. Level is held, so the gate can be compared without the character dinging out of it. Level 6 is the first clearly ungated level. Levels 1 and 2 use the same gate; they differ only in the wearable item-level cap.

Rarity in the tables is common / magic / rare / unique.

## What a playthrough actually picks up

Mean of 8 clears. "Equip" is equipment that hit the ground. The bag holds **20**. Satchels that raise it toward 40 come from the Bone King and later, which is not these floors. Potions and gold do not use a slot.

| Floor | Level at the end | Equipment | Weapons | Common / magic / rare / unique | Bag filled | Left on the floor | Upgrades seen so far |
| ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: |
| 1 | 3 | 5.6 | 2.4 | 2.5 / 1.6 / 1.5 / 0 | 5.6 | 0 | 5.3 |
| 2 | 4.9 | 7.9 | 2.8 | 2.5 / 2.0 / 3.4 / 0 | 13.5 | 0 | 9.0 |
| 3 | 6 | 10.4 | 3.5 | 2.8 / 2.3 / 5.0 / 0.4 | 19.4 | 4.5 | 13.1 |
| 4 | 7 | 8.9 | 3.1 | 2.9 / 2.1 / 3.8 / 0.1 | 20 | 12.8 | 16.3 |
| 5 | 9 | 14.3 | 4.9 | 3.8 / 3.9 / 5.1 / 1.5 | 20 | 27 | 20.6 |
| 6 | 10.8 | 8.8 | 2.9 | 2.5 / 2.8 / 2.5 / 1.0 | 20 | 36 | 22.1 |
| 7 | 12.1 | 9.8 | 3.3 | 3.5 / 1.8 / 3.6 / 0.9 | 20 | 46 | 23.8 |
| 8 | 13.8 | 11.5 | 3.3 | 5.5 / 2.0 / 3.1 / 0.9 | 20 | 57 | 25.3 |
| 9 | 15.1 | 15.6 | 6.1 | 5.5 / 1.8 / 7.5 / 0.9 | 20 | 73 | 26.9 |
| 10 | 16.9 | 17.8 | 5.3 | 5.0 / 4.6 / 6.1 / 2.0 | 20 | 90 | 29.5 |
| 11 | 18.5 | 10.4 | 2.8 | 4.4 / 1.4 / 3.6 / 1.0 | 20 | 101 | 30.5 |
| 12 | 20 | 12.1 | 3.3 | 6.1 / 1.6 / 3.3 / 1.1 | 20 | 113 | 31.6 |

The bag is full on floor **3 or 4** (mean 3.25, every run by floor 4). By depth 12 the clear has seen **133** pieces of equipment, **43** of them weapons, and has kept **32** that were better than anything already seen in that slot. About **113** pieces never fit. Gold ends near **1520**. Life potions on hand end near **81**. The player is not short of supplies. They are out of slots.

A normal floor (not 5 or 10) drops about **10** pieces. A boss floor drops about **16** (14.3 at depth 5, 17.8 at depth 10). Weapons are about a third of that, **3 to 5 a floor** around depth 5 and **3.6 a floor** across the whole clear. Finding a weapon is the common case.

## Where the pieces come from

Pinned level 6 is the ungated game, which is what the playthrough is from the middle of floor 1 onward. Means of 6 floors. "Item" is equipment per floor.

### Depth 5, level 6 (boss floor)

| Source | How often the source exists | Equipment | Rarity (c/m/r/u) | Also drops |
| --- | ---: | ---: | --- | --- |
| Trash | 40 + 15 pack | 3.0 | all common | potions, a few repair pots |
| Champion | 3.8 | 1.3 | all common | gold, potions |
| Boss | 1 | **4.0** | 0 / 1.3 / 1.7 / 1.0 | gold, one life, one mana, one repair |
| Super Elite | 1 | **1.0** | 0 / 0 / 0.7 / 0.3 | 25 gold, a ration, sometimes a gate key |
| Keyed chest | 1.8 | **1.8** | 0 / 0.8 / 1.0 / 0 | gold, a potion, sometimes a repair pot |
| Puzzle door | 2.2 doors | 0.7 counted in the room, more of the same gear is under gated / sealed / floor | rares | a potion sometimes |
| Gated shortcut | 0.8 flags | **1.2** | all rare | nothing else |
| Squeeze gilt chest | 0.5 | 0.5 | rare | gold, sometimes a repair pot |
| Sealed room + loose floor gear | — | 2.0 | mostly magic, some rare | — |
| Free chest | 1.5 | **0** | — | gold and potions |
| Cracked wall, cracked floor, passage | 1.5 + 2.5 + 2.3 | **0** | — | a key, or a torch |
| Prop (urn, barrel, crate) | many | **0** | — | a ration, sometimes a potion |
| Pedlar | 1 shop | **0 dropped** | 3 sealed uniques for sale | potions, rations, gate keys |

Total **15.5** pieces (range 13–21 on these six floors).

### Depth 8, level 6 (no boss)

Trash and pack **3.2** common, champions **0.5** common, keyed chests **1.5**, puzzle **1.3** rare, gated **0.5** rare, squeeze **0.3** rare, Super Elite **1** (mostly unique at this depth in the small sample; the unique chance is 70% from depth 6 through 9), mimic **0.8** common, loose floor gear **1.0**. Total **10.2** (range 7–14).

### Depth 12, level 6

Trash and pack **5.5** common. Gated shortcuts **4.2** rares. Keyed chests **2.3**. Puzzle **1.2** rare. Squeeze **0.8**. Super Elite **1 unique** (the chance is 100% from depth 10). Mimic **0.3**. Loose floor gear **0.8**. Total **16.8**. The deep white rain is the trash table times seventy enemies. The deep rare rain is the shortcut rule that adds a greater rare to every chest or crack the generator marked unreachable.

### What never drops equipment

- Cracked walls and cracked floors. A key, or a torch. No gold.
- Passages. No gear.
- Free chests. Gold and potions only.
- Props. Rations and the odd potion.
- The prism chest. Gold piles, and only on floors where the prism exists (depth 7, then every 7 floors). It was not in the pinned depths. It is not a gear source.
- The dark portal. Its gilt chests use the secret-chest function, but the portal only rolls after a boss kill below depth 10. Floors 1–12 never see it.
- The Pedlar. Three sealed unique offers, plus the supply list. Buying is blocked at level 1 and 2 ("Sealed uniques wait until level 3."). The first shop is the depth-5 boss, and the player is level 9 by then.

## Guaranteed versus random

Guaranteed when the source exists:

| Source | Gear | Notes |
| --- | --- | --- |
| Rusty Sword | 1, once, floors 1–3 until a weapon is owned | Common, and it is the only weapon the early game promises |
| Super Elite | 1 every floor | Rare, or a unique on the depth table below. Promo magic while level ≤ 2 |
| Boss | 4: unique, rare, a 50/50 rare-or-magic, and a magic | All four become promo magics while level ≤ 2 |
| Puzzle door | a greater rare if the room does not already have one | One per door, not one per floor |
| Gated shortcut | a greater rare on top of whatever the chest or crack already did | Every unreachable chest, crack, and squeeze chest the generator flags |
| Squeeze gilt chest | 1 | Rare. From depth 5, 20% unique |

Random:

| Source | Chance of equipment | What it is |
| --- | --- | --- |
| Trash | 5% white, or 2.5% on a pack member (the roll is divided by 0.5) | Common only. While level ≤ 2, ×0.35 |
| Champion | 20% white. While level ≤ 2, ×0.5 | Common only. Separate from the gold and the 28% potion |
| Keyed chest | 100% magic or rare. Rare chance is `min(0.6, 0.15 + depth × 0.012)` | While level ≤ 2, only half the chests have any gear, and most of those are common |
| Mimic | 100% white, plus a potion | Not a champion |

The 5% trash line is not the flood on floors 1–6. It becomes one at depth 12, where the enemy count makes it **5.5 commons**. The flood everywhere else is the guaranteed list: a Super Elite, a keyed chest that cannot miss, a greater rare per puzzle door, another greater rare per shortcut flag, a gilt chest in a squeeze room, and four boss pieces.

## What the level 1–2 gate actually changes

The gate (`player.lvl <= 2`) does three things to counts and one thing to quality.

- Trash whites, champion whites, and chest gold are cut to 35% (champions to 50% of their 20%).
- Half of keyed chests drop a ration or a torch instead of gear. The other half is usually common (65%), otherwise magic or rare.
- A caller that asked for a rare or a unique and passed the promo flag gets a two-affix magic at the wearable cap instead. That covers the Super Elite, the boss, the gilt chest, the greater rare, and a promo puzzle piece. A rolled rare with no promo flag, which is the keyed-chest table, becomes an ordinary magic.
- Item level is capped so the piece can be worn. Level 1 magic caps at item level 2. Level 2 magic caps at item level 3. Whites cap higher. Level 3 restores the real rare and the real item level.

It does not remove the drop. The Super Elite still leaves a piece. The boss still leaves four. The puzzle still leaves a piece.

Pinned comparison, equipment per floor:

| Depth | Level 1 (gated) | Level 2 (gated) | Level 6 (open) | What the open world adds |
| ---: | ---: | ---: | ---: | --- |
| 1 | 4.2, no rare, no unique | 4.0, no rare, no unique | 6.3, chest rares appear, Super Elite is rare | about 2 pieces, and the rare tier |
| 3 | 7.8, all common or magic | 7.8, same | 9.3, rares from chest, puzzle, squeeze, gated, Super Elite | about 1.5 pieces, plus rares |
| 5 | 13.2, boss is 4 magics | 13.7, same | 15.5, boss has a unique and rares | about 2 pieces; the unique comes back |
| 8 | 8.8 | 8.3 | 10.2 | about 1.5 |
| 12 | 10.8, Super Elite is magic | 9.7, same | 16.8, Super Elite is unique, trash whites jump | about 6, mostly whites and the un-gated chest |

Levels 1 and 2 match each other on counts. The gate is one switch, not a slope. Super Elite unique chances underneath that switch are 0% at depths 1–2, 20% at 3, 35% at 4, 50% at 5, 70% through 9, and 100% from 10. The sim follows that: level 6 depth 5 was about one unique in three Super Elites, and depth 12 was a unique every time.

The playthrough leaves the gate on floor 1. The clear ends floor 1 at **level 3**, and that floor already contains **1.5 rares**. Kills before the ding use the pre-XP level, so the first bodies are gated and the later ones are not. From floor 2 on, nothing in the gate is active. The bag fills on floor 3, which is two floors after the gate has expired.

So the gate does the job it was written for: a level 1 character does not find a unique, and the piece they do find can be worn. It is not a fix for "too many drops" or "a weapon feels ordinary." Those happen at level 6 and above, where the gate is off, at about 10 pieces a floor.

## Can gold and consumables cover a cut

Yes. They already drop, and they do not use the 20 slots.

On the level-6 depth-5 floors, beside the 15 pieces of gear: the Super Elite's **25** gold is not random, champions drop a gold pile when the 30% keep-roll hits, keyed chests drop gold on that same 30% roll plus a potion about a third of the time, free chests are only gold and potions, and props are rations. The playthrough is holding **81** life potions and **1520** gold by depth 12. A life potion at that depth costs `20 + depth × 3` (56g at depth 12). The Pedlar already sells life, mana, repair pots, rations, and gate keys, and already buys whatever is in the bag.

A removed equipment drop can be replaced with a roll the game already has: the chest's potion, the chest's gold pile, the Super Elite's ration, the free chest's supply roll. No new item type is required.

## Recommended frequency changes

Keep the drops that are supposed to be the moment. Cut the ones that fire every room.

| Source | Now | Change | Projected equipment |
| --- | --- | --- | --- |
| Super Elite | 1 gear, any slot | Keep 1. Make it a **weapon**. Unique chance table stays | 1 weapon |
| Boss | 4 pieces | Keep the unique and the guaranteed rare. The 50/50 piece and the extra magic become a life potion and a mana potion. Gold pile stays | 2, on boss floors only |
| Puzzle | a greater rare per door (about 1–2 a floor) | One greater rare per floor. Further doors use the free-chest supply roll | 1 |
| Gated shortcut | an extra greater rare, 0.5 a floor at depth 8 and **4.2** at depth 12 | No gear. Gold `6 to 10 × depth` instead. The crack still hides its key | 0 |
| Keyed chest | 100% gear once level ≥ 3 | 35% gear, which is the gate's magic rate, for every level. The miss is the ration or torch the gate already uses. Gold and potion rolls stay | depth 8: 1.5 → **0.5**. Depth 5: 1.8 → **0.6** |
| Sealed room and loose floor gear | chest-table gear | Same 35% | depth 8: about 1.0 → **0.4** |
| Trash | 5% white (2.5% per pack member) | **No equipment.** Move that 5% onto the potion lines (life 4.5% → 7%, mana 4% → 6.5%) | depth 8: 3.2 → **0**. Depth 12: 5.5 → **0** |
| Champion | 20% white | 8% white. A miss that did not already roll the 28% potion drops a ration | depth 5: 1.3 → **0.5** |
| Squeeze gilt | 1 rare, 20% unique from depth 5 | Keep. It is behind a secret | about 0.3–0.8 |
| Mimic | always a white | Keep. A mimic is the surprise | about 0.3–0.8 when one spawned |
| Rusty Sword | the one guaranteed early weapon | Keep | 1, once |
| Cracked walls, free chests, props, prism, Pedlar | no equipment | Leave them | 0 |

The level 1–2 gate stays. It still blocks rares and uniques, and it still caps item level. It stops being the thing that limits how many pieces exist, because the chest and trash lines above apply at every level.

### Projected floors

Using the level-6 measured mix, after the cuts above.

| Floor | Now | Projected | Of which are weapons, roughly |
| --- | ---: | ---: | --- |
| Depth 8, no boss | 10.2 | **4.2** (1 Super Elite weapon, 1 puzzle, 0.8 mimic, 0.5 chest, 0.4 loose, 0.3 squeeze, 0.2 champion) | about **2**, one of them the Super Elite's |
| Depth 5, boss | 15.5 | **6.0** (that same set, with the boss cut from 4 pieces to 2) | about **2.5**, including the Super Elite weapon |
| Depth 12, no boss | 16.8 | **4.5** | about **2** |
| Floors 1–12, whole clear | 133 pieces, 43 weapons | about **50** pieces, about **25** weapons | the bag of 20 fills around floor **5 or 6** if everything is kept, not floor 3 |

Two weapons a floor is better than five, and it is still often. If a weapon should be the rare find, stop chests, puzzles, and loose floor gear from rolling a weapon base and leave weapons to the Super Elite (and to boss uniques, which already can be weapons). That projection is **one weapon a floor**, the Super Elite's, plus the occasional boss unique.

The depth-5 projection is the noisy one because that floor is doing several jobs at once. The durable part is the non-boss shape in the table: the Super Elite's weapon, the floor's one puzzle rare, and about two more pieces from a mimic, a chest hit, a squeeze, or a champion. Whites stop falling off trash. Shortcut cracks pay gold.

Gold and potions go up by the drops that were removed: the trash potion bump, the chest miss (ration or torch, and the chest's existing gold and potion rolls still happen), the champion ration, the two boss potions, and the shortcut gold. A depth-12 shortcut that used to be a rare becomes roughly `8 × 12 = 96` gold. Four of those in a deep floor is a few hundred gold, which is a shop visit, not a slot.

## Root cause

Too many pieces are guaranteed, and the guarantee is "an item," not "a moment."

- Every floor's Super Elite drops gear, and so does every keyed chest, every puzzle door, every flagged shortcut, and every squeeze chest. The boss drops four.
- The level 1–2 gate changes the rarity of those guarantees and slightly thins chests and whites. The character is level 3 before floor 1 is over, so the thinning never meets the bag.
- Trash is a 5% white. It is a small number per enemy and a large number per deep floor, because the floor has fifty to seventy enemies. Those whites are why a weapon on the ground stops meaning anything.
- About a third of bases that can roll are weapons, so a pile of gear is a pile of weapons. Forcing the Super Elite onto a weapon, and taking gear off trash and off shortcut flags, is what makes the one weapon matter.
- The bag is 20 slots for this whole stretch of the game. Ten pieces a floor fills it before the player has a reason to sell. Gold and potions were already the currencies that do not need a slot.

## Regression test plan

Re-run `node tools/audit/run-audit.mjs loot`. Eight playthroughs and six pinned floors are enough to catch a broken table. They are not enough to lock a rare-unique rate to a tenth of a percent; use the bands below.

Lock the current game before any tune, so a drive-by edit is visible:

- Version string stays `0.7.18`.
- Level 1 and level 2, depths 1 through 12: zero rares and zero uniques from Super Elite, boss, chest, puzzle, squeeze, and trash. Super Elite still drops one piece, and it is magic. Boss still drops four pieces, all magic.
- Level 6 depth 12: the Super Elite piece is unique on every floor. Depth 5: unique on less than half of Super Elites (the table is 50%).
- A full clear's bag reaches 20 slots on floor 3 or 4. Equipment seen by depth 12 is above 100. Weapons seen are above 30.
- Cracked walls, cracked floors, passages, free chests, and props drop zero equipment.
- Keyed chests at level 6 drop equipment on every chest.

After the frequency change, replace the count locks:

- Non-boss floors at level 6, depths 8 and 12: mean equipment in **2.5–4.5**. Weapons in **0.8–2.0**. The Super Elite weapon is present on every floor.
- Boss floors: mean equipment in **4–7**, and the boss itself contributes 2 pieces, one of them unique from depth 5 up when the character is level 3 or higher.
- Trash and trash packs: zero equipment at every depth. Life-potion drops per trash kill sit near 7%, not 4.5%.
- Gated shortcuts: zero equipment, and a gold drop whose size scales with depth.
- Level 1 and 2 still see zero rares and zero uniques, including the Super Elite weapon (it stays a promo magic until level 3).
- The bag of a full clear does not hit 20 slots before floor 5.
- Free chests, props, cracked walls, and the prism chest still drop zero equipment.
