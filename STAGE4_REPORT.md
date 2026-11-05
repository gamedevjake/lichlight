# Stage 4 Report — Status Effects

**Status: IMPLEMENTED, not VERIFIED.** This branch is for Jake's review. It is not merged, not deployed, and not live. `version.json` is still **0.7.18**. Stage 5 has not been started.

Status implementation commit `9ebb6b9b38ec2ccaf54fcc8c45d49a7f80ec532a`. Rollback tag `combat-redesign-pre-stage4` points at `57f085c76907a83f8650ca339b19188b467e82b6` (Stage 3 squash, PR #26, on main).

```
git checkout combat-redesign-pre-stage4
```

Do not move that tag.

## What landed

Stage 4 adds one status bag, `ent.statuses`, for Bleed, Burning, Chill, Freeze, Shock, Poison, and Curse. A missing bag is an identity: movement ×1, damage taken ×1, no curse cut. No live attack applies a status, and no loot rolls one, so a current hit stays the Stage 3 hit.

Damaging ticks are packets through `resolveDamage`. They do not crit. Player-sourced ticks scale once. Mitigation runs once. Shock, when the target has it, multiplies after Hellmouth's ×1.10.

Frost Nova, poison ground, environmental burn, the chill aura, fear, and self-stun keep their old timers. The new code can read them. It does not tick them.

## Status table

| Status | What it does | Caps |
| --- | --- | --- |
| Bleed | Physical DoT. Stacks on one record. | 5 stacks, 4s, tick every 1s |
| Burning | Fire DoT. Not environmental `p.burn`. | 3 stacks, 3s, tick every 1s |
| Chill | Movement slow and freeze buildup. | 60% slow, 4s, +40 buildup, freeze at 100 |
| Freeze | Speed 0, including a new dodge. | 1.5s, no extension, then 3s lockout |
| Shock | Increased damage taken. Not resist. Not the Hellmouth mark. | 25% taken, 4s, one instance |
| Poison | Poison DoT. Not a poison puddle. | 8 stacks, 6s, tick every 1s |
| Curse | Outgoing penalty and resist cut are wired. Life drain is stored only. | 3 ids, 6s, penalty 30, resist cut 40, drain 10 |

Bosses and Super Elites: chill request × `HEAVY_CHILL` (0.4), buildup stays 0, freeze returns `immune`.

At the stack cap, a new apply refreshes the shortest stack and raises its base only when the new base is higher. The tick clock is not reset. One `tickStatuses` call deals at most 8 ticks.

## Engine API

`applyStatus`, `removeStatus`, `clearStatuses`, `getStatus`, `listStatuses`, `tickStatuses`, `statusMoveMul`, `shockTakenMul`, `curseHooks`, `curseResistCut`, `legacyStatusView`, `statusSanitize`, `statusSaveBag`. Constants: `STATUS`, `HEAVY_CHILL`, `STATUS_MAX_TICKS`.

`listStatuses` appends the legacy view. That view does not own the timer.

## DoT routing and crit

A tick's packet is `DoT`, `isDot`, `critApplied`, and not `critPending`. `scaleOutgoingComponents` drops a crit request on `isDot` anyway.

Order, once: stack sum, player scale if the attacker is the player, curse outgoing if it is not 1, conversion, armor (Physical, player only) or resist and penetration, guard, ram armor, Hellmouth ×1.10, shock taken if it is not 1, floor of 1, shield.

A 4s bleed at a 1s interval deals 4 ticks. Two half-second steps deal one. Bleed 10 with 100% crit at ×9 still deals 10. Burn 100 with 40 Fire pen and 0 resist deals 140, and `penHits` is 1.

## Shock, curse, bosses

Shock 20% turns a Physical 100 into 120 and leaves Lightning resist at 0. The same 100 into −20 Fire resist and 20% shock is 144. A marked boss stays 110 with no shock and becomes 132 with 20% shock. The mark is still ×1.10.

Curse penalty 30 turns an outgoing 100 into 70. A defender with 50 Fire resist and a curse cut of 20 takes 70 from Fire 100. `curseHooks(...).lifeDrainWired` is false. `leech(10)` at 50% life steal still heals 5.

## Legacy adapters

| Effect | Still owned by | Stage 4 |
| --- | --- | --- |
| Frost Nova slow | `e.slow = 3.5`, then the old 0.45 / 0.50 speed | View only. A status tick does not decrement it. Damage stays 8 Physical |
| Chill aura | `auraT`, `auraPct`, `auraMul` | View only. Engine chill is a separate multiplier |
| Webs and brine | `p.slowT` at 0.6 | Untouched |
| Poison ground | `hurtPlayer`, Physical, armor | Untouched. 10 into DEF 30 is 5, not Poison resist |
| Environmental burn | `p.burn`, `envHurt` world packet | Untouched. 90 Fire resist does not reduce it |
| Fear, self-stun | `fearT`, `mode === 'stun'` | View only |
| Hellmouth sink | `hmFreeze` skips AI | Status ticks skip with it, so a DoT cannot delete the target mid-sink |

`mods.fire` is still `pw = fire + level * 2`. Melee `rollDmg` with `st.fire = 40` is still 4. Hellmouth still sinks a Super Elite and still does not sink a boss.

## Deferred balance

Life steal still heals the Stage 3 base: pre-mitigation, power-attack multiplier excluded, nothing for bows, Fireball, or Frost Nova. Crit chance is still uncapped. Stage 4 did not retune either. Curse life drain is the hook a later stage can wire. It does not heal now.

## Save and cleanup

The player save gains `statuses` and `freezeImmune` only while they are set. An old save has neither key and still loads. `statusSanitize` clamps a forged 40-stack bleed to 5. Enemy bags ride the floor snapshot. `startFloor`, death, and `removeEnemy` clear the engine bag. Legacy `slowT` is still cleared on world restore. `p.burn` is still not saved.

## Tests

Headless Chrome, Puppeteer, system Google Chrome, SwiftShader WebGL, cache disabled, `python3 -m http.server` on 127.0.0.1.

| Run | Legacy 21 files | Stage 1 | Stage 2 | Stage 3 | Stage 4 |
| --- | --- | --- | --- | --- | --- |
| Before Stage 4 code, tag `combat-redesign-pre-stage4` | 812 passed, 95 failed | 71 / 0 | 73 / 0 | 58 / 0 | not present |
| After Stage 4, one sequential pass | 804 passed, 102 failed | 71 / 0 | 73 / 0 | 57 / 1, then 58 / 0 | 75 / 0 |

Baseline per file: `v075` 59/1, `v076` 48/0, `v077` 60/4, `v078` 60/1, `v078-play` 25/1, `v0781` 27/2, `v079` 49/1, `v0710` 36/1, `v07101` 41/1, `v07102` 54/0, `v07103` 24/3, `v0711` 43/5, `v0712` 37/6, `v0713` 32/5, `v0714` 40/1, `v0715` 19/13, `v07151` 8/45, `v07152` 34/3, `v0716` 49/1, `v0717` 47/1, `v0718` 20/0.

On that same checkpoint, before any Stage 4 code, an immediate `v0714` re-run was 33/8. The sequential after-pass landed on that same 33/8. The seven extra names are the footer and tab hit-tests Stage 1 already saw move. `v0711` went 43/5 → 42/5 because one passing check was not emitted (47 lines instead of 48). A re-run was 43/5 with the same five failure names. Stage 3's sequential miss was `bow crit flag stays off the floater` (the arrow dealt 0). Three immediate re-runs were 58/0.

`v079`, `v0710`, `v0717`, and `v0718` did not move. No combat anchor failed for a formula reason.

`tests/stage4-status.html` covers stack caps, refresh versus the tick clock, four ticks then expiry, immunity, armor versus Poison resist, the 75 resist cap, shock versus negative resist, shock plus the Hellmouth mark, boss and Super Elite chill, freeze lockout, curse penalty and resist cut, life steal unchanged, conversion that moves rather than copies, poison ground, environmental burn, Frost Nova slow, save/load including an enemy stack and an old save with the keys removed, a forged bag, death cleanup, and the Super Elite sink-and-delete.

## Deliberately not in this PR

- Reclassifying Fireball, Frost Nova, poison puddles, lava, or `p.burn`.
- Loot, uniques, or shop prices that apply a status. Stage 10.
- Stagger, poise, stun buildup, or a crowd-control rewrite. Stage 5.
- Wiring curse life drain into `leech`, or capping crit chance.
- A version bump, a GitHub Pages deploy, or a merge.

Stage 5 and a live ship both wait for Jake.
