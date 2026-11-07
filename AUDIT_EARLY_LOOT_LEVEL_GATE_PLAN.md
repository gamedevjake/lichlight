# Plan: level 1–2 loot gate

Audit and plan only. No gameplay change in this commit. Base is `743c82602252546236fa8f468ae1556dbe7b9fcb` (v0.7.18). Branch `audit/early-rare-loot-whoosh`. This replaces the early-loot recommendation in `AUDIT_EARLY_RARE_LOOT_WHOOSH.md`. The whoosh workstream in that file is unchanged and is not part of this plan.

Approved rule, from Jake:

- While the character is level 1 or 2, no source drops rare or unique equipment. Drops are common or magic only.
- Every item generated in that window has required level at or below the character’s current level. Depth does not waive this, including a low-level character on a deep floor.
- A reward that is guaranteed rare today becomes a strong magic the character can wear immediately.
- Shortcut tunnels keep working. They stop paying the unintended guaranteed rare.
- From level 3, rares return under the rules that already exist. Reaching level 3 does not grant a rare, and it does not rewrite items that were already rolled. Later-game probabilities stay as they are.

Counts below that say “measured” are the 100-seed clear in the earlier audit. Counts that say “projected” apply this rule to those measurements. They are not a new simulation.

---

## 1. Every equipment path

There is no set system, no cube, no reroll, and no crafting. Named gear is the unique table. Repair, sell, and dropping an item you already own do not roll a new item. Gold, potions, rations, keys, map fragments, satchels, spell pages, and the Lich Tome are not equipment.

`makeItem` (line 1635) is the live factory: it calls `makeItem0`, then `calcReqLvl`, stamps `reqSrc: 'drop'`, and fills durability. A later wrapper (line 10682) only sets bow flags. `makeItem0` (line 1748) picks the base, the rarity, the unique or the affixes, the name, the Stage 10 ward, and sometimes a power.

| Path | When the item is created | What it asks for today | Level 1–2 result |
| --- | --- | --- | --- |
| Trash kill, `regularDrops` | On kill | White, about 1.75% after the existing gate. Never rare. `makeItem(depth, 0)` | Same white, item level capped so the requirement fits |
| Champion kill | On kill | White, 10% while the old gate is on, 20% after. Never rare | Same |
| Mimic | On kill, depth 8+ | One white | Same, item level capped |
| Keyed chest, `chestLoot` | On open, not when the chest is placed | While level ≤ 2: 50% no gear, else 65% white and 35% a magic-or-rare roll. Rare chance per chest is about 2.8% at depth 1 (`rareP = min(0.60, 0.15 + depth * 0.012)`). Never unique. After level 2 the white gate lifts and the item is magic or rare | The rare face becomes an ordinary magic. Whites stay whites. No promo kit |
| `ensureSealedLoot` | During `populate`, 60% of an empty sealed room | `chestLoot(depth)` | Same as a chest |
| Vault, `vaultLoot` | During `populate`, depth ≥ 2 | `chestLoot(depth + 1)`, then often replaced | See the next row |
| Puzzle-room rewrite, `markGatedLoot711` | End of floor generation | `greaterRare711()`: `makeItem(depth + 2, 2)`. Measured 0.96 rares already on the ground at depth 2 | Promo magic. One per rewritten room |
| `giveGated711` | When a flagged chest, crack, or gilt chest is opened | Another `greaterRare711()` | Promo magic, except passage mouths, which stop being flagged |
| Island | During `genV072`, depth ≥ 2, about 15% of floors | `chestLoot(depth + 1)` | Same as a chest. Rolled at generation |
| Gilt chest, `giltGear` | On open. Depth ≥ 2, about half of floors. Not on depth 1 | Depth &lt; 5: always rare, item level `depth + 1`. Depth ≥ 5: 20% unique, otherwise that rare | Promo magic |
| Super Elite, `seRollGear` | On kill, after XP is granted | Depth 1–2: always rare, item level = depth. Depth 3 / 4 / 5: 20% / 35% / 50% unique, else rare. Depth 6–9: 70%. Depth 10+: always unique | Promo magic. Gold, ration, and the 6.5% gate key stay |
| Boss, `killEnemy` | On kill, after XP | Item level = `depth + 2` (Oswin’s second unique is `depth + 4`). Guaranteed unique, guaranteed rare, a 50/50 rare-or-magic, a magic, and a second unique on Oswin | Unique and rare faces become promo magic. The plain magic stays an ordinary magic. Potions, gold, and bags stay |
| `bossUnique` fallback | Same call | If no unique is legal, `makeItem(L, 2)` | Promo magic |
| Hollow Pedlar uniques, `rollShopUnique` | On buy, not when the stall is placed. Boss floors only (depth 5, 10, …) | Always ends at rarity 3, even if `makeItem` fell back to a rare. Price is the unique formula. The button says “Sealed Unique” | Do not sell the row while level ≤ 2. See section 2 |
| Pedlar consumables | On buy | Potions, rations, gate keys | Unchanged |
| Rusty sword, `makeRusty` / `placeRusty` | Floor generation, depths 1–3, until the character has any weapon | White Rusty Sword, item level 1, reduced durability | Unchanged. Already wearable |
| Test start, `__legacyStart` | `newPlayer` only | White Short Sword | Unchanged |
| `equipBow` | No gameplay caller. Exported for tests | Builds a white Short Bow, then can stamp rarity 3, a unique name, lore, and unique mods | Leave this function alone. It is not a drop. It is the one intentional bypass |
| Dark-portal plane | `genPlane` calls `populate` when you enter, then deletes the monsters. Plane chests with no `prism` flag open through `giltGear`. Prism chests are gold | Same generators as a normal floor, at the depth you were on (portals start after depth 10) | Whatever `makeItem` does at the level you had on entry, and at the level you have when a plane chest opens |
| Victory chest, `openVic713` | After a boss | 100 gold, no gear | Unchanged |
| Unused `makeItem0` fallback | Only if a caller omits rarity. Nothing in the game does | ~3% unique, then rare below 15%, magic below 50%, else white | If it ever runs while the gate is on, map unique and rare to ordinary magic |

Passage mouths are the depth-1 flood from the earlier audit: 2.30 guaranteed rares per floor, because `markGatedLoot711` treats the unopened tunnel as unreachable and `breakSecret` then calls `giveGated711`. The tunnel itself is `placePassages` (both ends `passage: true`, `loot: null`). That placement stays. The flag does not.

`LOOT_GATE` (line 8158) is a separate, older throttle: while level ≤ 2 it cuts whites, gold, and how often a chest has gear, and it still lets a chest roll a rare. This plan does not retune those rates. The new ceiling is what removes the remaining rares.

---

## 2. Where to enforce it

Clamp inside `makeItem0`, before the base is chosen and before the unique branch at line 1759. The outer `makeItem` then stamps `calcReqLvl` on whatever came out, as it already does. Doing it later, after a unique object or a 3–4 affix rare exists, is how unique names, lore, powers, and rare-only affixes leak through a rarity number that was edited after the fact.

`rollShopUnique` does exactly that leak today: it calls `makeItem`, then multiplies stats, may add a power, and assigns `rarity = 3` and a fresh `calcReqLvl`. A clamp that only lives inside `makeItem` does not survive that function. `equipBow` does the same stamp and has no drop caller.

Gate condition, same shape as `lootGated`:

- On when `player` exists, `player.lvl` is 1 or 2, and `window.__earlyLootOff` is not set.
- Off when there is no player. Menu code and formula probes can still build a rare. That is also the hole: a caller that runs with `player` cleared skips the gate. Gameplay always has a player once a run exists.

While the gate is on:

1. If the caller passed rarity 2 or 3, remember `promo = true` and set rarity to 1. If the caller passed nothing and the unused random curve rolled 2 or 3, set rarity to 1 and leave `promo` false.
2. Cap item level with the table in section 4. Promo rewards use the cap itself (the best magic this level can wear). Ordinary drops use `min(requested, cap)`.
3. Pick the base from that capped item level (`base.lvl <= capped + 1`). If the caller forced a base whose own level is above that, ignore the name and pick from the legal pool. Rusty Sword and the other level-1 bases still resolve.
4. Build the item as a magic or a white. Do not enter the unique return. Do not use the rare name lists.

Call-site flag, so a rolled chest rare does not become the promo kit:

- `greaterRare711`, `giltGear` (both faces), `seRollGear` (rare and unique faces), `bossUnique`, the boss’s guaranteed `makeItem(L, 2)`, and the rare face of the boss’s 50/50 all pass `promo`.
- `chestLoot`, trash, champions, the island, and sealed-room `chestLoot` do not. A chest that rolled rare simply becomes an ordinary magic (1 or 2 affixes, requested item level after the cap).

Shop, two locks:

- `renderShop` hides the sealed-unique buttons while level ≤ 2. Potions, rations, and keys stay.
- `rollShopUnique` returns without creating an item if level ≤ 2, so a stale click cannot mint a unique. Offers are labels and a price, rolled when the stall is placed, and the item is rolled on purchase. After the character reaches level 3, the same unsold offer buys a real unique at the existing price. No offer has to be rebuilt on level-up.

`equipBow` stays a test equip. Do not route it through the gate. Nothing in play calls it.

Level 3 and above do not enter this function. `makeItem(L, 2)` and `makeItem(L, 3)` keep today’s item level, base filter, affix count, and unique roll. Nothing listens for the level-up event to spawn a rare.

---

## 3. How the downgraded reward stays a reward

A promo magic is a magic, built through the magic branch:

- Rarity 1, magic prefix or suffix name. Not a “Doom Bite” rare name, and not a unique name or lore line.
- Item level is the wearable cap (2 at level 1, 3 at level 2), so weapon damage uses `1 + ilvl * 0.06` at the best legal value and the requirement is exactly the character’s level, or 1 when the cap’s requirement is 1.
- Affix count is 2, every time. Ordinary magic is `irand(1, 2)`. The guaranteed reward is the top of that band, not a 3–4 affix rare with the color changed.
- Armor, helm, boots, and shield still take the resist line the magic branch already forces when the roll missed one, and `applyGearWard` still adds the Stage 10 ward. That ward is on whites and magics already. It is not a rare affix.
- No roll of the rare power chance (`rar === 2` at line 1797). A magic amulet may still hit its existing 12% power. That power comes from `rollPower`, the shared pool, not from a unique’s `powers` list.

Rare-only affixes cannot appear because the filter runs at rarity 1. The only two with `minRarity: 2` are `maxResist` (item level ≥ 8, helm and amulet) and `penAll` (item level ≥ 10, weapon and amulet). Both also fail the item-level check at the cap of 2 or 3. Conversion and ailment affixes need item level 4, so they are out for the same reason. Unique mods, unique lore, and unique powers are only copied inside the `rar === 3` block, which promo items do not enter.

Ordinary chest magics are unchanged apart from item-level cap and the rare face folding into this ordinary magic. They are not promo.

---

## 4. Required level

Today `calcReqLvl` runs after `makeItem0` returns, on the finished rarity and item level. Shop calls it again after it rewrites the item. Load does not recompute a stored `reqLvl` (`stampReq`, policy `grandfather-owned`).

Keep that order. Choose rarity and item level first, generate once, then let the existing stamp run. Do not lower `reqLvl` by hand while leaving a higher item level. The number on the tooltip would stop matching the formula, and a rare could display “Required Level 1”.

Wearable caps, from `calcReqLvl` at this commit:

| Level | Best white item level | Its requirement | Best magic item level | Its requirement |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 4 | 1 | 2 | 1 |
| 2 | 5 | 2 | 3 | 2 |

A rare of item level 1 already requires level 2, and there is no rare whose requirement is 1. The rarity ban is what keeps yellows off a level 2 character. The cap is what keeps a depth-10 item level from producing a magic that requires level 4 or 5.

`makeItem`’s existing stamp is the only write. Tests assert `reqLvl <= player.lvl` and `reqLvl === calcReqLvl(it)`. No second pass.

---

## 5. Regression tests

Add one harness, same iframe style as `tests/early-balance.html`. Set the character level explicitly. Do not rely on combat XP. For each source, roll at least 200 times, or 100 seeded floors where the source is the generator.

Level 1 and level 2, at depths 1, 5, and 10:

- `makeItem(depth + 4, 2)`, `makeItem(depth + 4, 3)`, `greaterRare711`, `giltGear`, `seRollGear`, `bossUnique`, and a scripted boss drop list: every item has rarity 0 or 1, `reqLvl <= player.lvl`, no `lore`, no unique name, no `maxResist`, no `penAll`.
- Promo callers (greater rare, gilt, Super Elite, boss unique, boss guaranteed rare): rarity 1, affix count 2, item level equal to the cap.
- `chestLoot` and trash drops: rarity 0 or 1, item level ≤ cap, affix count 0, 1, or 2. Not forced to 2.
- A passage mouth has `passage === true` and no `gatedRare`. Breaking it drops no equipment. The wall still opens.
- A non-passage flagged crack still calls `giveGated711`, and the item is a promo magic.
- Rusty sword: rarity 0, base Rusty Sword, requirement 1.
- Pedlar: the unique buttons are absent, and `rollShopUnique` does not create an item.
- `equipBow('Scream of the Banshee')` can still produce a unique. That is the documented bypass.

Level 3, same depths:

- `seUniqueChance` is unchanged (0 at depth 1–2 if they are still on those floors, 20% at depth 3, 100% at depth 10).
- A Super Elite killed at level 3 on depth 1 is a rare of item level 1, not a magic and not a unique.
- `chestLoot` at level 3 still matches today’s formula (no white gate, rare rate `rareP`, never unique).
- `greaterRare711` is a rare of item level `depth + 2`.
- Gilt below depth 5 is a rare. From depth 5 the 20% unique is back.
- No code path grants an item inside `gainXp`.
- An item already on the ground at rarity 1 is still rarity 1 after `player.lvl` becomes 3. Opening a chest after that level-up uses the level 3 table.

Monte Carlo, 100 seeds, the same clear as the earlier audit (kill the rooms, break every crack, open every chest the keys allow, open gilt, kill the Super Elite):

- Level pinned at 1, depths 1, 2, 3, 5, and 10: mean rare-or-better is 0. Max is 0.
- Level pinned at 2, depth 5 and 10: same.
- Level pinned at 3, depth 1: passage rares are 0, Super Elite rare rate is 1, chest rares stay in the old band (about 0.02 in-room plus about 0.21 from chests opened after the cracks, from the earlier XP-on clear).
- Level pinned at 5, depth 5: one boss kill still drops a unique. The sample can check `bossUnique` directly so the floor does not have to be fought.

`__earlyLootOff` is how existing suites keep building rares on a fresh level-1 character. These current checks construct or expect rare-or-better while the test player is level 1, and they will fail if the gate is on: `tests/early-balance.html` (required-level samples and the depth-1 Super Elite), `tests/v0717.html`, `tests/v0718.html`, `tests/v0713.html` (`makeItem(6, 2)`), `tests/se-midgame-prototype.html`, and `tests/v07103.html` (`makeItem(11, 3)`). Point them at the hook, or raise `player.lvl` before the factory call. Do not weaken the assertions that a real drop at level 1 is magic.

---

## 6. Saves

Do not migrate. `stampReq`, `migrateGearWard`, and `worldRestore` must not call the gate.

- Inventory and paper-doll items keep their rarity, item level, mods, and stored requirement.
- Gear already lying on a saved floor is part of the world blob. Load restores it. It is not generated again.
- A chest that has not been opened has no item yet. The next open rolls at the level the character has then.
- A floor generated under this rule at level 2, then saved, still holds those magics after the character reaches level 3.
- An old save from before the rule, with yellows already on the floor or in the bag, keeps those yellows.
- `promo` does not need to be stored. The item is already a magic with two affixes.

`LOOT_GATE` gold and white rates are untouched, so old saves do not change economy on load. Only new rolls change.

---

## 7. Edge cases

**Level-up on the same floor.** Generation and the kill are different clocks.

- Vaults, islands, sealed-room gear, and the puzzle-room rewrite run inside `populate`, at the level you had when the floor was built.
- Chests, gilt, cracks, the Super Elite, and bosses roll when you open or kill them.
- Both the boss and the Super Elite grant XP and then drop. The killing blow that crosses level 3 uses level 3 for that corpse. That is a normal roll at kill time, not a level-up prize.
- Items already created stay as they are. A vault rolled at level 2 is still magic if you hit level 3 before you walk into it.

What a normal floor 1 actually shows, projected from the earlier clear:

- The floor is built at level 1. Nothing rare is pre-placed (measured 0). Passage mouths no longer add 2.30 rares.
- A full clear ends around level 3 (measured mean 3.06) because the floor is worth more than the 117 XP to reach level 3. The Super Elite is killed after that XP, so that one drop is still a rare under the level 3 rule. Chest rares that were opened after the level-up stay in today’s band. Projected rare-or-better for that full clear: about **1.2**, down from **3.53**. The 2.30 crack rares are the part that disappears.
- A rush that kills only the Super Elite gets its 62 XP and lands at level 2 (level 2 needs 87 more). That kill is still inside the gate, so the drop is a promo magic and the floor’s rare count is 0.

**Floor 2.** Entering at level 3, which is the usual full clear of floor 1, uses today’s vault rewrite, gilt rare, and Super Elite rare. Passage mouths still do not pay. Entering at level 2, the rush case, builds the vault and the island as magic. The Super Elite is a rare only if the kills on that floor have already reached level 3.

**Deep and low.** Depth 5 and 10 do not bypass the gate. A level 1 character there gets promo magics at item level 2 instead of uniques at item level 7 or 12. In ordinary play the mandatory Super Elite XP reaches level 3 before depth 3. The deep case is for tests and for any future change that skips fights.

**Shop.** First stall is the depth-5 boss. Offers are not items. Hiding them under level 2, and refusing `rollShopUnique`, closes the post-`makeItem` rewrite. After level 3 the same offer still sells a unique.

**Multiplayer.** There is no second character. The gate reads the one `player`.

**Crafting and rerolls.** None.

**Stage 10 ward.** New promo armor is non-unique, so `applyGearWard` adds `resAll` from `gearWard(base, capped ilvl)` and stamps `wardMig`. `migrateGearWard` on load is a separate, RNG-free pass for old armor that has no resist key. It does not read level and does not change rarity. Leave it that way. A bag rare from an old save can gain the ward once and stays rare.

**Before and after, level pinned at 1**, projected from the measured clear:

| | Depth 1 | Depth 2 | Depth 3 |
| --- | ---: | ---: | ---: |
| Rare or better, now | 3.38 | 5.02 | 6.84 |
| Rare or better, after | 0 | 0 | 0 |
| Promo magics, after | 1 (Super Elite) | about 2.5 (vault rewrite, gilt, Super Elite) | about 2.5, plus any non-passage gated crack |

The passage rows (2.30 / 2.48 / 3.12) are removed, not converted. Depth 3 also had about 0.70 non-passage flagged cracks and about 0.58 flagged chests. Those still pay, as promo magic while level ≤ 2 and as today’s greater rare from level 3.

---

## Risks

- A full floor 1 still ends on a Super Elite rare once the character is level 3. That matches “level 3 uses the normal table.” It will look like the old stairs yellow to someone who clears the floor. The crack yellows are what this rule removes from the opening.
- Promo magics are weaker than the rares they replace (two affixes, low item level, no rare power). They are wearable, which those rares were not, at level 1. If a guaranteed boss kill at level 2 feels thin, the affix count is the knob. Do not raise it to 3. That is the rare band.
- Clamping inside `makeItem0` changes every test that builds a rare on a level-1 player. The hook is required or those suites fail for a reason that is not a loot bug.
- `rollShopUnique` and `equipBow` write rarity after the factory. The shop needs its own refusal. Forgetting it puts uniques back in.
- Pre-placed loot does not upgrade when you level. A player who hits level 3 beside a vault that was rolled at level 2 finds a magic. That is the “no automatic rare” rule, and it is the one most likely to be reported as a missing drop.
- Old floors saved with yellows already generated keep them. Only new rolls change. Mixing “this save should be cleaned” with this rule would be a migration, which is out of scope.
- `player == null` skips the gate. Keep reward code from running in that state.
- The outer `makeItem` wrapper must keep calling the same `makeItem0`. A second factory that forgets the clamp becomes a bypass. `equipBow` is the known one and should stay listed as such.
