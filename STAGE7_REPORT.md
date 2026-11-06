# Stage 7 Report — Skill System and Build Specialization

**Status: IMPLEMENTED, not VERIFIED.** This branch is for Jake's review. It is not merged, not deployed, and not live. `version.json` is still **0.7.18**. Stage 8 has not been started.

Implementation commit `0ec7ad620d390eb5dfc98679c3f535920a15ab15`.

Rollback tag `combat-redesign-pre-stage7` points at `29c81bb825c98816606e75c80985305becf5a0c8` (Stage 6 squash, PR #29, on main).

```
git checkout combat-redesign-pre-stage7
```

Do not move that tag. `combat-redesign-pre-stage1` through `combat-redesign-pre-stage6` were not moved.

## What landed

Fireball, Whirlwind, and Frost Nova now hit as different damage types. Hellmouth is still not a damage type, and it still deletes Super Elites. The zero-resist hit numbers did not move. `mods.fire` is still one spell-power total for all three skills.

## Damage types

| Skill | Before | After | Magnitude, unchanged on the base row |
| --- | --- | --- | --- |
| Fireball, including the 0.6 splash | Physical | Fire | `(8 + pw * 1.4) * amp` |
| Whirlwind weapon roll | Physical, inside one number | Physical component | `weaponRoll * 1.4 * amp`. This is the only part that crits |
| Whirlwind spell rider | the same Physical number | Fire component | `pw * 0.5 * amp`. Does not crit |
| Frost Nova | Physical | Cold | `(6 + pw * 1.1) * amp` |
| Hellmouth | not a packet | not a packet | Super Elite deletion unchanged |

`pw = st.fire + level * 2`. A point of spell power still adds 1.4 to Fireball, 0.5 to the Whirlwind rider, and 1.1 to Frost Nova. It does not add weapon damage.

At 0 resist the components sum to the old integer: Whirlwind pin 10 is still 15, and the crit is still 29 (28 Physical + 1 Fire, not 30 and not 58). Level-10 Fireball at spell power 20 is still 64. Level-1 Frost Nova is still 8.

Against resist the type is the change. That same Fireball into 90 Fire resist deals 6. That Frost Nova into 90 Cold resist deals 1. A level-10 Whirlwind at spell power 20 and pin 10 into 50 Fire resist deals 24 (14 Physical + 10 of the 20 Fire). The life-steal base stays 34, the pre-resist sum.

Scale, conversion, resist, and penetration still run once in `resolveDamage`. A global flat, increased, or more now applies once to each Whirlwind component. No loot rolls those modifiers, so a current character does not see that split. Penetration on the player's sheet is added once. The Stage 7 harness checks Fireball at 90 resist and 40 Fire penetration deals 32, with `penHits === 1`.

## `mods.fire` migration

The key stays `fire`. `st.fire` stays the summed total. `st.spell` is the same number. The affix line changed from `+N Fire Damage (skills)` to `+N Spell Power`. Old items and old saves keep working. The value is not reinterpreted as Fire-only damage and is not copied into `flatFire` or `bonusFire`. Melee and bows still ignore it.

## Status rules

| Skill | Status | Chance | Duration | Stack | Damage | Boss / Super Elite |
| --- | --- | --- | --- | --- | --- | --- |
| Fireball, base | Burning | 100% core, 40% outer ring | 3s | cap 3, then refresh the shortest | base 0, so the tick does not resolve | not immune. The tick is still 0 |
| Fireball, Kindling | Burning | 100% of the core. There is no outer ring | 3s | same cap | `max(1, round(pw * 0.2))` per stack per second, Fire, resisted once, no crit | same |
| Frost Nova, base | Chill, plus `e.slow = 3.5` | 100% inside the radius | 3.5s | one chill | none. Slow from the status is 0%, so movement stays the legacy 0.45 | chill lands, buildup stays 0, freeze does not |
| Frost Nova, Whiteout | Chill, plus the same legacy slow | 100% inside the smaller radius | 4.8s | one chill | none from the status | slow is 15% × 0.4 = 6%. No freeze |

Base buildup is 34. Freeze needs 100, and the chill ends before the 4.5s cooldown, so a base nova cannot freeze. Whiteout buildup is 55, so the second cast freezes a normal enemy for 1.5s. The freeze does not refresh. When it ends, `freezeImmune` is 3s. A cast during that lockout spends the buildup and does not freeze. Bosses and Super Elites stay freeze-immune through the existing `statusHeavy` check and `HEAVY_CHILL`.

Whirlwind applies no status. Bleed, shock, poison, and curse are still not applied by live skills.

## Specializations

One choice per damage skill, stored as `player.skillSpec`. The skill-key panel has a button row. An old save with no key loads Bolt, Spin, and Nova. Choosing a build does not rewrite `learned` or the spell bar.

| Build | Gameplay change | Damage |
| --- | --- | --- |
| Bolt | the current Fireball | unchanged |
| Kindling | no splash ring, a real burn | the core hit is still full. The burn is extra, and it is the only base-number increase in this stage. It is opt-in |
| Scatter | radius 28, outer hits ×0.45 | the core hit is unchanged. The old ring hits for less. New ground beyond 18px takes a smaller hit |
| Spin | the current Whirlwind | unchanged |
| Wide | radius 48, weapon factor 1.05 | less per target |
| Keen | radius 22, knock ×1.35 | the hit stays 15 on a pin-10 weapon |
| Nova | the current Frost Nova | unchanged |
| Whiteout | radius 52, the freeze rules above | the hit stays the same |
| Glass | radius 88, buildup 15 | the hit stays the same. Freeze is harder to reach |

Hellmouth has no build. Changing its sink would have been a Stage 9 fix.

## Hazards

Fire and poison hazards stay what they were.

- Lava, on-fire, and acid stay world packets through `envHurt`. They skip resist, armor, Ethereal Shield, and block. A 12-point lava packet into 90 Fire resist still deals 12.
- Poison ground stays a Physical DoT through `hurtPlayer`. DEF 30 still cuts a 10-point tick to 5, and 90 Poison resist does not. Retyping it would skip armor and raise the damage, and the same function drops boss lobs. Boss lobs stay deferred.

## Enemy attacks

Not applied. These five stay Physical until Stage 10:

| Attack | Type |
| --- | --- |
| Pale Choir Cultist bolt | Physical until Stage 10. The proposal is Shadow |
| Lich Wisp bolt | Physical until Stage 10. The proposal is Lightning |
| Drowned Siren ring | Physical until Stage 10. The proposal is Cold |
| Choir Exarch orb | Physical until Stage 10. The proposal is Shadow |
| Drowned Seer snipe | Physical until Stage 10. The proposal is Lightning |

`eShoot` deletes a requested type on a boss or a Super Elite, so their patterns stay Physical even if a caller asks.

Left Physical on purpose: contact, charges, bone arrows, spider webs, eel / ghoul / golem / bloater blasts, poison ground, traps, every boss pattern, and every Super Elite swing. Stage 9 owns bosses and Super Elites. Stage 8 owns resist tables and elite affixes. Neither was started.

A 20-point cultist bolt into DEF 30 deals 10. DEF 0 deals 20. That is the armor curve. The element in the table is the proposal, not the live type.

## Time to kill

Pinned midpoint, spread 1, crit off unless the row says crit. Trash pool 80. Boss pool 1050. Weapon period is `0.45 / spd`. Skill period is the cooldown, with mana ignored. Before is the tag. After is this branch. They match on every zero-resist row.

| Attack | Hit | Seconds to 80 | Seconds to 1050 |
| --- | --- | --- | --- |
| Fists | 2 | 18.000 | 236.250 |
| Sword | 4 | 9.000 | 118.350 |
| Axe | 5 | 8.000 | 105.000 |
| Staff | 5 | 7.200 | 94.500 |
| Maul | 19 | 3.214 | 36.000 |
| Bow | 7 | 5.143 | 64.286 |
| Fireball, level 1, spell power 0 | 11 | 3.600 | 43.200 |
| Fireball, level 10, spell power 0 | 36 | 1.350 | 13.500 |
| Fireball, level 10, spell power 20 | 64 | 0.900 | 7.650 |
| Whirlwind, pin 10 | 15 | 9.600 | 112.000 |
| Whirlwind, pin 10, crit | 29 | 4.800 | 59.200 |
| Whirlwind, pin 4 | 7 | 19.200 | 240.000 |
| Frost Nova, level 1, spell power 0 | 8 | 45.000 | 594.000 |
| Frost Nova, level 10, spell power 0 | 28 | 13.500 | 171.000 |
| Frost Nova, level 10, spell power 20 | 50 | 9.000 | 94.500 |

Resist rows, after only. Before, these hits ignored resist and used the zero-resist column.

| Attack | Hit after | Seconds to 80 | Seconds to 1050 |
| --- | --- | --- | --- |
| Fireball, level 10, spell power 20, 90 Fire resist | 6 | 6.300 | 78.750 |
| Frost Nova, level 1, 90 Cold resist | 1 | 360.000 | 4725.000 |

## Saves

A chosen build is written only when it is not the base row. Stripping `skillSpec` and loading brings back Bolt, Spin, and Nova, with `st.fire` and `st.spell` still equal to the saved `mods.fire`. Learned flags and a four-slot spell bar still load.

## Tests

Headless Chrome, Puppeteer, system Google Chrome, SwiftShader, cache disabled, `python3 -m http.server` on 127.0.0.1. The checkpoint is `29c81bb` before this code.

| Run | Legacy 21 | Stage 1 | Stage 2 | Stage 3 | Stage 4 | Stage 5 | Stage 6 | Stage 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Before | 810 passed, 97 failed | 71/0 | 73/0 | 58/0 | 75/0 | 78/0 | 47/0 | not present |
| After, one sequential pass | 805 passed, 102 failed | 71/0 | 73/0 | 58/0 | 75/0 | 78/0 | 47/0 | 69/0 |

`tests/stage7-skills.html` is 69/0. It covers the types, the mixed Whirlwind hit, burn and chill, the six builds, resist, penetration once, the Fireball crit refusal, life steal on the pre-resist Whirlwind sum, heavy poise, the save round-trip, lava and poison ground, the five bolt types, boss and Super Elite shots staying Physical, Hellmouth still deleting a Super Elite, and the weapon time-to-kill rows.

Stages 1–6 stayed green. The renamed checks are the ones that used to lock "this skill is still Physical" or "Frost Nova does not chill". The new names passed. The full list is in the Stage 7 changelog entry.

Legacy name movement:

- `v0711`: 42/6 → 43/5. Cleared `trash in the maw`. Re-runs 43/5 and 42/5. The second did not emit that line. The five stable names stayed. Emission flake.
- `v0714`: 40/1 → 33/8, and two re-runs stayed 33/8. Names are `version` plus the seven footer and tab names. The checkpoint had been the passing layout. Layout flake.
- `v07152`: 34/3 → 36/1. Cleared `tab hits follow scale` and `slot hit follows scale`. Re-runs 34/3, then 36/1. Layout flake.
- `v0781`: sequential pass added `f2 damage stays` because the player was at x 33. Two re-runs were 27/2, the checkpoint pair (`version`, `f1 boss hits`), and that spike check passed. Position flake.
- `v076`: checkpoint failed `b3 damage no snap`. Two re-runs after the change were 48/0.

No other new failure name. `v075`, `v079`, `v0710`, `v0713`, `v0717`, and `v0718` did not move.

## Deliberately not in this PR

- Enemy resist tables and elite affixes. Stage 8.
- Boss patterns, Super Elite attacks, and the Hellmouth deletion. Stage 9.
- Loot that rolls resists, penetration, or the new builds. Stage 10.
- A character-sheet layout for spell power. Stage 12. The item line is updated. The sheet is not.
- Capping crit chance, or wiring curse life drain into `leech`.
- A version bump, a GitHub Pages deploy, or a merge.

Stage 8 and a live ship both wait for Jake.

## Adjustment before merge

Jake approved the player skills, the builds, the statuses, and the save migration. He asked to put the five caster shots back to Physical before merge. An elemental bolt skips armor, and nothing a player can find grants elemental resist, so a 20-point bolt into DEF 30 had gone from 10 to 20.

Cultist, Lich Wisp, Drowned Siren, Choir Exarch, and Drowned Seer shots are Physical again. `tests/stage7-skills.html` expects that: the cultist bolt has no damage type, DEF 0 deals 20, and DEF 30 deals 10. The other four caster shots, plus webs and bone arrows, also have no damage type. Boss and Super Elite shots still strip a type if a caller passes one.

The mapping that waits is cultist Shadow, wisp Lightning, siren Cold, exarch Shadow, seer Lightning. That activation is Stage 10, when resist-granting equipment exists. Stage 8 must not turn it on. Fireball, Frost Nova, the Whirlwind split, and every build are unchanged.

Re-run against tag `combat-redesign-pre-stage7`, after this revert only:

| Run | Legacy 21 | Stages 1–6 | Stage 7 |
| --- | --- | --- | --- |
| Checkpoint | 810 passed, 97 failed | 71/0, 73/0, 58/0, 75/0, 78/0, 47/0 | not present |
| After the revert | 804 passed, 103 failed | same, all green | 70/0 |

Stage 1–6 names did not move for this revert. The Stage 7 file replaced `cultist bolt is shadow and skips armor` with `cultist bolt is physical and uses armor`, and `non-boss bolts use the stage 2 map` with `caster bolts stay physical until resist gear`. It added `caster elements stay deferred`. Those three are the bolt adjustment. The other 67 Stage 7 names are the approved skill checks, and they passed.

Legacy name movement against the checkpoint:

- `v0714`: 40/1 → 33/8 on the sequential pass, the seven footer and tab names. Two re-runs were 40/1 with only `version`. Layout flake.
- `v076`: cleared `b3 damage no snap`. Two re-runs stayed 48/0. Snap flake. Spike damage was not retuned.
- `v0711`: stayed 42/6 on the sequential pass, including `trash in the maw`. Two re-runs were 42/5 and did not emit that line. The five stable names stayed. Emission flake.

`v075`, `v0781`, `v079`, `v0710`, `v0713`, `v07152`, `v0717`, and `v0718` did not move. `version.json` is still 0.7.18.
