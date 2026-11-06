# Stage 8 Report — Enemy Resistances and Elite Affixes

**Status: IMPLEMENTED, not VERIFIED.** This branch is for Jake's review. It is not merged, not deployed, and not live. `version.json` is still **0.7.18**. Stage 9 has not been started.

Implementation commit `6dcc0a27bdfefc44bd0205465cbe0556e9f75126`.

Rollback tag `combat-redesign-pre-stage8` points at `20906ade92233c9a7831c0a0c90a4ab90f898851` (Stage 7 squash, PR #30, on main).

```
git checkout combat-redesign-pre-stage8
```

Do not move that tag. `combat-redesign-pre-stage1` through `combat-redesign-pre-stage7` were not moved.

## What landed

Every monster now has an elemental identity on the Stage 2 resist curve. Champions from depth 4 gain one affix that changes the fight. From depth 12 they can have two, and the pair cannot be two controls. Swords still deal what they dealt. Bosses, Super Elites, Hellmouth, `mods.fire`, and loot were not retuned. The five caster shots are still Physical.

## Resist formula

Unchanged from Stage 2, applied once inside `resolveEnemyDamage`:

```
eff = clamp(rawResist - penetration, -100, resistCap)
resistCap = clamp(75 + maxResist, 0, 90)
dealt = amount * (100 - eff) / 100
```

Physical is not in the profile. A 100 Physical hit into a poison-resistant skeleton still deals 100. A 100 Fire hit into that skeleton (Fire −30) deals 130. The same hit with 20 Fire penetration deals 150, and `penHits` stays 1. A raw 100 still stops at 75 (dealt 25) or at 90 when `maxResist` is +15 (dealt 10).

Each profile sums to 0. Nothing is outside −40..+40. There is no `All` key, so the soft cap is not where content sits.

## Resistance table

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

Hovering an enemy shows the strongest resist and the sharpest weakness. That string is cached on the enemy.

## Affixes and counterplay

They do not multiply HP or contact damage. Below depth 4 a champion is still just a champion. Depth 4–11 rolls one. Depth 12+ rolls two. Minions, trash, bosses, and Super Elites do not roll. A control affix cannot share a champion with another control affix.

| Affix | Counterplay |
| --- | --- |
| Bulwark | The ward locks the facing it had. Step to the flank for a full hit. Stagger still lands. The ward is at most 1.35s of every 4.2s gap. Guards do not roll it. |
| Siphon | Only a bite that connects heals, and only 20% of that bite, capped at 6–10% of its max HP. Kite, or stagger it. A spell does not feed it. Leeches do not roll it. |
| Shroud | The flicker is the tell. Hits and poise stop for at most 0.8s, then it can be hit again. It does not refresh while up. Eels, wisps, and shades do not roll it. |
| Harbinger | One rat after a rune, never more than two, and the rat is not elite. Kill the champion or the rat. Binders do not roll it. First appears at depth 8. |
| Rime | A 36px slow aura after a 1.2s warm-up. It uses the existing `slowT` (×0.6). It does not chill and it does not freeze. Walk out. It cannot share a champion with a web or a brand. |
| Snare | One physical web on a 5.5s timer, at ×0.35 contact. Sidestep it. The slow is the existing web slow and it ends. Spiders do not roll it. |
| Volatile | Crossing 35% HP lights a 1.15s fuse. Step out of the 18px circle, or kill it and the fuse dies too. The blast is capped at 30% of your max HP. Bloaters do not roll it. |
| Brand | The rune stays where it was drawn for 1.25s. Leave the 8px circle. It does not chase and it does not root. The blast is capped at 22% of your max HP. At the 0.2 move floor you can still clear it. |

## Time to kill and survival

Checkpoint is the tag. After is this branch. Spread 1, crit off. Sword is 4 Physical. Fireball is 64 Fire. Nova is 8 Cold. Low Whirlwind is 14 Physical + 1 Fire. Survival is how many of that monster's own contact hits remove 60 player HP.

Contact survival matched on all 70 rows (35 monsters at depth 1 and depth 12). A depth-1 champion skeleton is still 44 HP and 8.75 contact.

| Enemy, depth 12 | Sword before → after | Fireball | Nova | Low Whirlwind | Survival DEF 0 / 30 |
| --- | --- | --- | --- | --- | --- |
| Skeleton | 22 → 22 | 2 → 2 | 11 → 15 | 6 → 6 | 3 / 5 both |
| Drowned | 34 → 34 | 3 → 4 | 17 → 19 | 9 → 9 | 3 / 5 both |
| Wisp | 13 → 13 | 1 → 1 | 7 → 6 | 4 → 4 | 3 / 6 both |
| Spider | 15 → 15 | 1 → 1 | 8 → 8 | 4 → 4 | 4 / 8 both |
| Golem | 70 → 70 | 5 → 5 | 35 → 47 | 19 → 19 | 2 / 3 both |
| Crab, open | 38 → 38 | 3 → 4 | 19 → 22 | 10 → 10 | 2 / 4 both |
| Ram | 84 → 84 | 7 → 6 | 56 → 84 | 28 → 28 | 2 / 4 both |

Worst time-to-kill multiplier versus Stage 7. Physical is the sword. Element columns are a 100-point packet (`100 / dealt`). Mixed is a high Whirlwind, 14 Physical + 20 Fire. A number under 1 is faster than Stage 7.

| Family | Physical | Fire | Cold | Lightning | Poison | Shadow | Mixed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| drowned | 1.000 | 1.538 | 1.250 | 0.833 | 1.538 | 1.111 | 1.259 |
| vermin | 1.000 | 0.870 | 1.000 | 1.111 | 1.667 | 1.111 | 0.919 |
| bone | 1.000 | 1.111 | 1.333 | 0.909 | 1.538 | 1.111 | 1.063 |
| choir | 1.000 | 1.111 | 1.176 | 1.667 | 1.667 | 1.429 | 1.063 |
| mimic | 1.000 | 1.176 | 1.053 | 0.800 | 1.250 | 0.870 | 1.097 |

The worst single-element case is 1.667 (40 resist). A live Fireball into the drowned deals 42 instead of 64 (×1.524). Nothing in the table is a wall for a one-element character.

## Saves

A chosen affix and the resist bag ride the floor snapshot. Stripping both and loading brings the profile back from the monster id and does not invent an affix. Gear, `mods.fire`, learned spells, and `skillSpec` are untouched.

## Tests

Headless Chrome, Puppeteer, system Google Chrome, SwiftShader, cache disabled. Checkpoint `20906ad`.

| Run | Legacy 21 | Stages 1–6 | Stage 7 | Stage 8 |
| --- | --- | --- | --- | --- |
| Before | 809 passed, 96 failed | 71/0, 73/0, 58/0, 75/0, 78/0, 47/0 | 70/0 | not present |
| After the first landing | 807 passed, 96 failed | same, all green | 70/0 | 63/0 |
| After the crab bite was restored | 802 passed, 102 failed | same, all green | 70/0 | 64/0 |

`tests/stage8-enemies.html` is 64/0 after the crab bite was put back. Profiles, penetration, caps, spawn rules, stacking bans, bulwark versus poise, shroud, the fuse tell, the brand cap, rime without a freeze, one physical web, siphon only on a bite, the two-rat cap, a resisted burn, the Stage 7 crab bite, the save round-trip, the cultist bolt, and Hellmouth still deleting a Super Elite.

Stages 1–6 did not rename a check. The Stage 1 Frost Nova rat and the conversion rat clear `resists` before the formula lock. The names stayed `frost nova formula tags and cold`, `conversion does not chain or change total`, and `original fire still converts`.

Renamed earlier-stage check:

- `tests/stage7-skills.html`: `no resist affix and no stage 8 table` → `loot has no resist affix`. Stage 8 now owns the enemy table. The loot keys are still absent.

Legacy name movement:

- `v0711`: 43/5 → 41/5. The five stable names stayed. `vault rare 0` and `vault rare 3` were not emitted. Re-runs were 42/5 and 43/5 and did emit vault rares. Generation variance. `trash in the maw` was not a failure.
- `v0714`: stayed 40/1, only `version`. Two re-runs were 33/8 with the seven footer and tab names. Layout flake.
- `v076`: stayed 48/0, including `b3 damage no snap`. Two re-runs stayed 48/0.
- `v07152`: stayed 34/3. Two re-runs were 36/1 with only `version`. Layout flake.

No other new failure name on that first landing.

The crab-bite re-run against the same checkpoint moved these names, and the re-runs put them back:

- `v075`: sequential pass added `f4 skins rotate` (59/1 → 58/2). Two re-runs were 59/1 with only `f3 multi select`, and the skin check passed.
- `v0711`: 43/5 → 42/5 because `vault rare 3` was not emitted. Two re-runs were 43/5. The five stable names stayed. `trash in the maw` was not a failure.
- `v0714`: 40/1 → 33/8, the seven footer and tab names. One re-run stayed 33/8. The next was 40/1 with only `version`.
- `v076`: stayed 48/0 on the pass and both re-runs.
- `v07152`: 34/3 → 36/1, then a re-run stayed 36/1, then 34/3 with `tab hits follow scale` and `slot hit follows scale` back.

## Open debt: crab shell and bite

Jake kept the crab resist profile and rejected the bite flip. Contact is the Stage 7 test again: a crab bites unless `mode === 'open'`. The shell still stops incoming damage (`prevented: 'crab'`) before resist. So a shelled crab bites while it cannot be hurt, and an open crab can be hurt and does not bite. That mismatch is OPEN. It is not scheduled inside Stage 8. `tests/stage8-enemies.html` locks it with `shelled crab still bites`, `shelled crab still blocks incoming damage`, and `open crab still does not bite`.

## Deliberately not in this PR

- Boss patterns, Super Elite attacks, and the Hellmouth deletion. Stage 9. The chill aura still does not slow a Super Elite.
- Turning cultist, wisp, siren, exarch, or seer shots into Shadow, Lightning, or Cold. Stage 10, when resist gear exists.
- Loot that rolls resists, penetration, or these affixes. Stage 10.
- A character-sheet layout for enemy resists. Stage 12. The hover line is the readable tag.
- A version bump, a GitHub Pages deploy, or a merge.

Stage 9 and a live ship both wait for Jake.
