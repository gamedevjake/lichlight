# Stage 5 Report — Stagger, Poise, and Crowd Control

**Status: IMPLEMENTED, not VERIFIED.** This branch is for Jake's review. It is not merged, not deployed, and not live. `version.json` is still **0.7.18**. Stage 6 has not been started.

Implementation commit `1aa5657176f80627e7dcd9f92d6349d670aa85d8`.

Rollback tag `combat-redesign-pre-stage5` points at `d4fbc3c6904c0ddbc96b6d2b6825514e2420b896` (Stage 4 squash, PR #27, on main).

```
git checkout combat-redesign-pre-stage5
```

Do not move that tag. `combat-redesign-pre-stage1` through `combat-redesign-pre-stage4` were not moved.

## What landed

Poise is a separate number from HP. Stagger is a status in the Stage 4 bag, `ent.statuses.stagger`. There is no second timer. Bleed, burning, chill, freeze, shock, poison, and curse are not applied by live skills. Frost Nova still writes `e.slow = 3.5` and still deals Physical.

A landed hit spends a flat poise amount for its class, times the target's taken multiplier. The HP pipe is not consulted. Block zeroes poise. A guard's front glance multiplies it by 0.2. Armor, elemental resist, the player barrier, and boss or Super Elite shields do not.

## Poise by attack class

These are not weapon families. Bows share light with a melee tap until Stage 6.

| Class | Live source | Amount |
| --- | --- | --- |
| light | melee tap, bow impact | 18 |
| heavy | Whirlwind | 34 |
| power | charged melee | 52 × (0.70 + 0.30 × charge fraction). Minimum charge (×1.50) is 36.4. Full charge (×2.25) is 52 |
| skill | Fireball, Frost Nova | 14. A 0.6 splash is 8.4 |
| none | thorns, other Direct-only hits, DoTs, world packets | 0 |

Incoming poise against the player, `POISE_IN`: trash contact 10, boss contact or a charge 22, Super Elite powerup 34, Super Elite swing or an enemy projectile 8.

## Tiers

| Tier | Who | Max | Taken | Stagger | Immune after | Regen of max | Delay |
| --- | --- | --- | --- | --- | --- | --- | --- |
| light | bat, rat, flies, slimelet, wisp, spider, slime | 50 | 1 | 0.55s | 1.6s | 0.45/s | 2.2s |
| medium | default | 80 | 1 | 0.50s | 2.0s | 0.40/s | 2.4s |
| heavy | golem, guard, knight, ram, crab, drowned | 140 | 0.75 | 0.45s | 2.5s | 0.34/s | 2.6s |
| champion | elite, not a boss | 120 | 0.70 | 0.40s | 2.8s | 0.34/s | 2.6s |
| super | Super Elite | 360 | 0.30 | 0.32s | 4.8s | 0.24/s | 3.2s |
| boss | `T.boss` | 560 | 0.20 | 0.28s | 5.5s | 0.20/s | 3.4s |
| player | the player | 140 | 1 | 0.35s | 3.2s | 0.50/s | 2.4s |

A light enemy breaks on the third tap (18 × 3 = 54 against 50) or one full power hit (52). Regen waits out the delay, then adds `max × regen` per second. Leftover time in the step that ends the delay is spent on regen.

## Stagger state machine

1. **Full.** Poise equals max. No stagger status.
2. **Hit.** Subtract class × taken × (0.2 if a guard glance). Refresh the regen delay. Set the 6s chain clock.
3. **Break**, when poise reaches 0 and freeze, legacy stun, an active stagger, and `staggerImmune` are all absent. Apply stagger for `tierDur × 0.65^breaks`, floored at 0.12s and capped at 0.55s. Refill poise to 45% of max. Interrupt the action. Increment `poiseBreaks` (cap 8).
4. **Locked.** Speed 0. The player cannot swing, charge, cast, or roll. An enemy drops its mode and busy flag, and its telegraphs are removed. A crab keeps shell or open. A Hellmouth sink is not interrupted. Boss intro is not interrupted.
5. **Immune.** On expiry, `staggerImmune` is the tier immunity. Further breaks are refused and poise is held at least at 1, or refilled to 45% if the refusal was freeze or stun. The chain resets `poiseBreaks` only after 6s with no poise hit.

A refused refresh does not extend the current stagger.

## Crowd control

| Order | State | Movement | Actions |
| --- | --- | --- | --- |
| 1 | Freeze | 0 | stopped |
| 2 | Stagger | 0 | stopped, current action cleared |
| 3 | Legacy stun (`mode === 'stun'` or grid `STUNNED`) | existing stun behavior | stun clock still owns itself |
| 4 | Knockback | the existing `kx`/`ky` slide | not a root |
| 5 | Slow | product of frost, aura, chill, `slowT`, web, water, floored at 0.2 | not stopped |

Freeze during stagger counts both clocks down together, so the lock is the longer one, not the sum. A stagger request during freeze returns `frozen` and does not start a second lock. A request during legacy stun returns `stunned`.

Minimum movement multiplier is **0.2**, except freeze and stagger, which are 0. Checked singles, all unchanged: enemy frost 0.45, boss and Super Elite frost 0.50, aura 40 → 0.6, chill 60 → 0.4, player `slowT` 0.6, grid frost weight 1.8. Frost × aura 40 × chill 60 is 0.108 and floors to 0.2. Super Elites still ignore the chill aura. A live Frost Nova does not apply engine chill, so the live frost-only number is unchanged.

## Bosses and Super Elites

| | Light poise | Hits to first stagger | Stagger | Then immune |
| --- | --- | --- | --- | --- |
| Boss | 18 × 0.20 = 3.6 | 156 | 0.28s | 5.5s |
| Boss, full power | 52 × 0.20 = 10.4 | 54 | 0.28s, then shorter inside the 6s chain | 5.5s |
| Super Elite | 18 × 0.30 = 5.4 | 67 | 0.32s | 4.8s |

They are not immune to stagger the way they are immune to freeze. They are expensive to break and short to hold. A 200-step spam after the first boss break (0.05s steps, power hits the whole time) stayed under a 0.40s continuous lock and always opened a gap of at least 1.0s. The immunity is 5.5s, so the real gap is longer than that floor. `poiseBreaks` never passed 8.

Boss awaken (`bossIntro > 0` on that boss) blocks poise and stagger. It does not block HP. That banner was never an HP immunity, and it still is not. Super Elite drop and taunt still ignore the hit entirely, HP and poise. The crab shell still ignores both. Boss and Super Elite shields still absorb HP and do not absorb poise. Hellmouth still sinks and deletes a Super Elite and still does not sink a boss.

## What affects poise

Proved in `tests/stage5-poise.html`:

| Defense | HP | Poise |
| --- | --- | --- |
| DEF 30 versus DEF 0, 100 incoming, spread 1 | 50 versus 100 | both lose 10 (a rat bite) |
| Fire resist 90 versus 0, skill class | the resist number is lower | both lose 14 |
| Barrier 80 versus a 100 hit | 20 reaches HP | loses 10 |
| Block chance 100 | 0 | 0, reason `block` |
| Guard front | the ×0.15 chip | 18 × 0.75 × 0.2 = 2.7 |
| Boss shield 40 versus an 8 hit | 0 HP, shield 32 | 3.6 |
| Bleed tick | the DoT | 0 |
| Boss intro | the HP hit lands | 0, reason `intro` |
| Super Elite drop | 0, prevented `super-elite` | 0 |
| Crab shell | 0, prevented `crab` | 0 |

## Tick scheduling under a hitch

`STATUS_MAX_TICKS` is still 8 crossings per status per call. Duration past the status's remaining life does not mint extra ticks. Intervals the cap cannot pay stay on `rec.debt`, up to 64 intervals, and later calls pay them. Past that bound, `out.dropped` counts them and they are not paid again.

| Case | Result |
| --- | --- |
| 4s bleed, forty steps of 0.1s | 4 ticks, then gone |
| 4s bleed, one step of 4s | 4 ticks, dropped 0 |
| 4s bleed, one step of 20s | 4 ticks, not 8. The next 0.05s step deals 0 |
| 0.25s interval, 40s of life, one 40s step | 8 ticks now, 64 deferred, 88 dropped. Catch-up pays 72 total |

A normal bleed, burn, or poison (interval 1s, a few seconds of life) never reaches the drop. The drop is the bound on a long, fast status during one huge `dt`.

## Boss time-to-kill

Scripted hits, spread 1, player scale off, 8 HP requested, shield 0, intro cleared, boss poise 560:

| Loop | HP lost | Staggers | Poise left or break |
| --- | --- | --- | --- |
| 80 light hits | 640 (8 each) | 0 | 272 of 560 |
| full power until the break | 432 (8 × 54) | on hit 54 | then 0.28s plus immunity |

Per-hit HP is the same number the resolver produced before poise. Floor-5 Mother Murk is 840 HP and a 210 shield. At 8 HP a light hit that pool ends before 156 light hits, so light attacks do not stagger her. A full-power series can open one stagger partway through a pool of that size, then waits 5.5s.

Eight boss contacts of 10 against the player dealt 80 HP and staggered on the seventh (22 poise each, max 140). The HP per contact did not change. In play, the 0.45s hurt i-frame and the boss contact cooldown mean those seven contacts are not seven frames.

## Save, bounds, deferred balance

A partial poise bar is saved. An old save without the key loads full. A forged max above 5000 clamps to 5000, and `poiseBreaks` clamps to 8. Forty rats ticked for 90 frames stayed inside those caps.

Curse life drain is still stored and `lifeDrainWired` is false. `leech(10)` at 50% life steal still heals 5. Crit chance is still uncapped (`critChance` at 250 gear crit is 250). Stage 5 did not retune either.

## Tests

Headless Chrome, Puppeteer, system Google Chrome, SwiftShader, cache disabled, `python3 -m http.server` on 127.0.0.1. The checkpoint is `d4fbc3c` before this code.

| Run | Legacy 21 | Stage 1 | Stage 2 | Stage 3 | Stage 4 | Stage 5 |
| --- | --- | --- | --- | --- | --- | --- |
| Before, tag `combat-redesign-pre-stage5` | 804 passed, 101 failed | 71/0 | 73/0 | 58/0 | 75/0 | not present |
| After, one sequential pass | 806 passed, 100 failed | 71/0 | 73/0 | 57/1, then 58/0 | 75/0 | 78/0 |

Legacy moved by two passes and one fail: `v075` cleared `f7 walkable pit` (59/1) and `v0711` emitted one extra pass (42/5). The sequential Stage 3 miss added one fail, so Stages 1–4 together were 1082 passed and 101 failed against the checkpoint's 1081/101. The Stage 3 re-runs went back to 58/0.

Name diff against the checkpoint:

- `v075`: cleared `f7 walkable pit`. `f3 multi select` remains. Re-run 59/1, same name.
- `v0711`: 41/5 → 42/5. Same five names (`version`, `hundred gold`, `tome icon`, `stats scroll`, `stats canvas kept`). Re-run 42/5. Emission flake.
- `v0714`: stayed 33/8. Re-run 33/8. Names: `version`, `footer sort`, `footer mark seen`, `footer drop all`, `footer equip`, `footer drop`, `footer close`, `tab hitboxes match art`.
- `stage3-crit-scaling`: sequential miss `bow crit flag stays off the floater`. Re-runs 57/1, then 58/0, then 58/0.
- `stage4-status`: 75/0. The old check `no stage 5 stagger` was replaced by `stagger is a status not a second clock` because this stage adds that status. The new check passed.

No other new failure name. `v079`, `v0710`, `v0717`, and `v0718` did not move.

## Deliberately not in this PR

- Weapon identity, swing timing, hitstop, or a bow-versus-hammer poise split. Stage 6.
- Reclassifying Fireball, Frost Nova, poison puddles, or lava. Stage 7.
- Wiring curse life drain into `leech`, or capping crit chance.
- A version bump, a GitHub Pages deploy, or a merge.

Stage 6 and a live ship both wait for Jake.
