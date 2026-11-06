# Stage 9 Report — Boss and Super Elite Combat Redesign

**Status: IMPLEMENTED, not VERIFIED.** This branch is for Jake's review. It is not merged, not deployed, and not live. `version.json` is still **0.7.18**. Stage 10 has not been started.

Implementation commit recorded below after the code commit. Rollback tag `combat-redesign-pre-stage9` points at `1fb0f155ca794750167f143182869222bdfab790` (Stage 8 squash, PR #31, on main).

```
git checkout combat-redesign-pre-stage9
```

Do not move that tag. `combat-redesign-pre-stage1` through `combat-redesign-pre-stage8` were not moved.

## What landed

Hellmouth no longer deletes a Super Elite. Bosses and Super Elites fight in phases with a tell on every dangerous attack. HP, contact damage, and the old pattern multipliers were not inflated. Freeze immunity and `HEAVY_CHILL` stayed. The crab bite was not touched.

## Hellmouth

Before, anything that was not `T.boss` was trash. A Super Elite sets that flag false, so the maw froze it and `killEnemy` removed it at frame 90. That was 1.55s at every depth, and it skipped the shield, the intro, and the stair lock. A boss was only marked for 3s at ×1.10.

After, a boss or a Super Elite is a gate encounter. Trash still sinks and still dies. A gate encounter is not frozen and is not deleted. It gets the same 3s mark. A Super Elite already in the fight also loses `round(25%)` of its current shield, at least 1 if any shield is up, and never any HP, plus one skill-class poise hit (4.2 against the 0.30 taken multiplier). Drop and taunt refuse the bite. Damage during those phases is still `prevented: 'super-elite'`.

A 4-point sword still rounds to 4 under the mark, so the mark alone does not speed a light swing. A 40-point hit becomes 44. A 100-point hit becomes 110. The bite is what makes the cast matter against a warded Super Elite, and it can be cast again every 6s until the ward is gone. It cannot open the stairs by itself.

## Phases

Boss HP and the 25% shield are the Stage 8 numbers. Phase 2 is still half the HP bar. Phase 3, where the boss has a third pattern list, is still a quarter. The shield is the opening ward and is not part of that fraction. Crossing a line holds the next pattern for 0.7s. `enr` is still 1.25 then 1.4, and it still only speeds movement and the pattern clock. It does not multiply damage.

The awaken banner still blocks poise and not HP. It now also refuses to start a pattern for those 2.8s. Contact still hurts if you stand in the body.

Super Elite HP is still `seMaxHp717`. Depth 10 is still 249 plus a 25 shield. Phase 1 swings. Phase 2 adds a power smash every third action. Phase 3 adds a brand. The quarter tick is drawn on their bar.

## Telegraphs

| Attack | Windup | Counterplay |
| --- | --- | --- |
| Ring | 0.55s | Was 0.40s. Step off the body before the bullets. |
| Spiral | 0.60s, then the spin | The first shot waits. Dodge the slow ring. |
| Spread | 0.85s lines, lock at 0.30s | Was an untelegraphed fan at 0.30s. Sidestep a lane. |
| Charge | 0.75s line | Unchanged. The charge commits. A wall still stuns them. |
| Slam | 0.90s, radius 26 | Unchanged snapshot. Walk out. |
| Hop | 0.85s, radius 28 | Unchanged landing. The phase-2 ring now has its own 0.45s circle. |
| Nova | 1.15s, radius 58 | Unchanged. Leave the ring. |
| Beam | 1.00s, lock at 0.55s | Unchanged. |
| Teleport | 0.75s marker, then 0.55s | The ring used to fire on the arrival frame. |
| Lob | 1.00s | Unchanged. The bomb does not chase. |
| Super Elite swing | 1.00s line, lock after 0.25s | Sidestep. Hit only inside 8px of the locked lane. Damage is the old swing. |
| Super Elite power | 1.30s, radius 10 | Phase 2+. Damage is the old ×1.7, and only if you stay inside. |
| Super Elite brand | 1.15s, radius 8 | Phase 3. The circle stays where it was drawn. Damage is ×0.85. |

A walk at the 0.2 move floor clears the Super Elite swing, power, and brand before they land. Boss ground circles that were already large (the nova) were not shrunk. Nothing refreshes a root or a freeze. Stagger removes a tell whose source is that actor, including the boss circles that now carry `src`.

## Resists

Each row sums to 0 and stays inside −20..+20. Physical is not in the row. The worst boss Fire resist is +10. The worst Super Elite Fire resist is +20. Every element is a weakness on at least one boss and one Super Elite. No affix is rolled. Shots from bosses, Super Elites, and the five casters stay Physical.

## Time to kill and survival

Tag versus this branch. Spread 1, crit off. Sword 4 every 0.45s. Fireball 64 every 0.45s. Whirlwind 14 Physical + 20 Fire every 1.6s. Hellmouth-using is the sword plus a cast every 6s. Contact survival is hits of that actor's own damage to remove 60 HP. It did not move, at DEF 0 or DEF 30, on any boss or Super Elite.

Sword time did not move on any boss. The Hellmouth column is the only boss column that changed for a reason other than that boss's Fire row.

| Boss | Sword | Fire before → after | Mixed before → after | Maw before → after | DEF 0/30 |
| --- | --- | --- | --- | --- | --- |
| Mother Murk | 118.35 | 7.65 → 7.65 | 49.6 → 49.6 | 118.35 → 108.45 | 4/7 |
| Gnawer King | 192.15 | 12.15 → 10.35 | 81.6 → 72 | 192.15 → 173.25 | 2/4 |
| Drowned Bell | 265.95 | 16.65 → 15.3 | 112 → 105.6 | 265.95 → 236.7 | 2/3 |
| Sister Vey | 339.75 | 21.6 → 19.8 | 142.4 → 134.4 | 339.75 → 299.25 | 2/3 |
| Old Tam | 413.55 | 26.1 → 23.85 | 174.4 → 164.8 | 413.55 → 361.35 | 1/2 |
| Silkmother | 487.35 | 30.6 → 25.65 | 204.8 → 182.4 | 487.35 → 423 | 1/2 |
| Sir Calder | 561.15 | 35.1 → 32.4 | 235.2 → 222.4 | 561.15 → 484.65 | 1/2 |
| Lady Merrow | 634.95 | 40.05 → 36.45 | 265.6 → 251.2 | 634.95 → 545.85 | 1/2 |
| Deepcoil | 708.75 | 44.55 → 46.8 | 297.6 → 305.6 | 708.75 → 607.05 | 1/2 |
| Choirmaster Aurel | 782.55 | 49.05 → 54 | 328 → 348.8 | 782.55 → 667.8 | 1/1 |
| Ossuary Colossus | 1113.3 | 69.75 → 76.95 | 467.2 → 496 | 1113.3 → 939.15 | 1/1 |
| Abbot Morcant | 930.6 | 58.5 → 53.55 | 390.4 → 368 | 930.6 → 788.85 | 1/1 |
| Captain Brannoc | 1205.1 | 75.6 → 79.2 | 504 → 520 | 1205.1 → 1013.4 | 1/1 |
| Queen Lirael | 1078.2 | 67.5 → 64.35 | 451.2 → 438.4 | 1078.2 → 909.9 | 1/1 |
| Motley | 1152 | 72 → 66.15 | 483.2 → 456 | 1152 → 970.2 | 1/1 |
| Ninth Eye | 1225.8 | 76.95 → 76.95 | 513.6 → 513.6 | 1225.8 → 1030.5 | 1/1 |
| Penitent Host | 1299.6 | 81.45 → 70.65 | 544 → 500.8 | 1299.6 → 1090.8 | 1/1 |
| Ninth Psalm | 1373.4 | 85.95 → 82.35 | 574.4 → 558.4 | 1373.4 → 1150.65 | 1/1 |
| Crown-Wraith | 1447.2 | 90.45 → 82.8 | 606.4 → 572.8 | 1447.2 → 1210.95 | 1/1 |
| Oswin | 2433.6 | 152.1 → 139.05 | 1019.2 → 961.6 | 2433.6 → 2010.15 | 1/1 |

The Colossus Fire time is the worst boss increase, ×1.10. The Silkmother is the largest Fire speedup. Both still die to a Fireball.

Every Super Elite at a depth shares the pool. Depth 10 sword time stays 31.05s. Hellmouth goes from 1.55s to 29.70s. Depth 1 goes from 1.55s to 6.30s (sword 7.20s). Depth 100 goes from 1.55s to 260.55s (sword 271.35s). Fire at depth 10 runs from 1.80s to 2.70s. The +20 row at depth 100 is 21.60s against an unresisted 17.10s.

## Saves

A Super Elite's HP, shield, `mawVuln`, `sePhase`, and resist row ride the floor snapshot. Stripping a bag and loading rebuilds it from the id. Gear, `mods.fire`, learned spells, and `skillSpec` are untouched. Loot is untouched.

## Tests

Headless Chrome, Puppeteer, system Google Chrome, SwiftShader, cache disabled. Baseline is the tag: 29 files, 1346 passed, 94 failed. Legacy is 810 passed and 94 failed. Stages 1–8 were 71/0, 73/0, 58/0, 75/0, 78/0, 47/0, 70/0, 64/0.

After, one sequential pass: stages 1–8 stayed green at those counts, stage 9 was 41/0, and legacy was 803 passed and 101 failed because `v0714` hit the layout flake (40/1 → 33/8). The next `v0714` re-run was 40/1 with only `version`, which puts legacy back at 810/94.

`tests/stage9-bosses.html` covers the Hellmouth cases, phases, tell durations, the sidestep and the brand, shields, intro immunity, poise and stagger, freeze immunity, heavy chill, the aura, TTK bounds, the crab predicate, and a save.

Renames, and why:

- `hellmouth split unchanged` in stages 1–8 became `hellmouth refuses a heavy encounter`.
- The sink and "deletes the super elite" checks in stages 1–4, 7, and 8 now assert that a gate encounter is marked and kept.
- Stage 5 dropped "and still ignores the aura" from the frost-slow check. The 0.5 factor is the same. The aura is applied.
- Stage 8's "not given a resist profile" checks now lock the profile and the absence of an affix. Mother Murk's Fire row is 0, so a Fire hit is still the full hit.

Flake re-runs: `v0711` 42/5 then 43/5, same five names. `v076` 48/0 both times. `v07152` 36/1, then 34/3, then 36/1. `v075` 59/1 both times, only `f3 multi select`. `v0714` as above.

## Still open

Crab shell versus bite. Uncapped crit chance. Curse life drain not wired into `leech`. Life steal on the pre-mitigation number, and not on bows, Fireball, or Frost Nova. Caster elements wait for Stage 10. This stage did not retune any of those.

## Deliberately not in this PR

- Resist loot, penetration loot, or a change to what drops. Stage 10.
- Typing cultist, wisp, siren, exarch, or seer shots. Stage 10.
- A version bump, a GitHub Pages deploy, or a merge.

Stage 10 and a live ship both wait for Jake.
