# Super Elite ranged retaliation — design

Design and investigation only. Gameplay was not changed. `version.json` is still **0.7.18**. PR #43 stays at `5b8efacf3c9f9309e47a82dee762ae5672485ee3`. This note and the sim live on `cursor/audit-se-ranged-design-e482`, branched from that commit.

Measured by `tools/audit/se-ranged-design.html` against that build. `node tools/audit/run-se-ranged.mjs` prints the JSON. The run saved here is `tools/audit/out/se-ranged-design.json`.

Life, taken, and damage tables are not part of the proposal. Depth 12 melee standing kill time stays **35.2s**. Boss scripts are not part of it. The player whoosh is not part of it.

## Power circle

The depth-5 power tell matches its damage circle.

- `seBeginTell` draws it with radius `sePowerReach(5)`, which is **36**, `match: true`, and `follow` set to the Super Elite. It is not pinned.
- Each frame, `updateEnemies` copies the body's position onto the telegraph, then, on the frame `t` reaches 1.30s, calls `onDone` with that same object.
- `seTeleHit` tests `hypot(player - center) <= spec.r`. The center and the radius are the telegraph's.
- A center on the outline is a hit. A center 2px outside is not. No damage is dealt during the windup. The sim's clean check, with other enemies and hazards removed and regen off, left the player at 500 HP through the first half second. The recorded center at resolve was the body's position (`111, 852` in that run) and the radius was 36.

The stroke is a circle of that radius (`ry` is 1 because `match` is set). The fill grows from the center and is not the hit area. The stroke is centered on a rounded pixel, so the ink can sit about half a pixel off the tested circle. That is rasterization, not a second hitbox.

Depths 1–4 still use radius 10 plus the body. This proposal does not change them.

## The 0.20s swing step

Depth 5 locks the swing at 0.80s of a 1.00s tell. The step is **0.20s**. The lane half-width is 8px. Full speed is 62 px/s, so the lane needs **0.129s** of actual movement. Swing speed is ×0.55.

The model charges one frame of presentation delay plus input delay, then asks whether the remaining time covers 8px.

| Window | Display | Input | Travel after the delay | Clears 8px |
| ---: | ---: | ---: | ---: | --- |
| 0.20s | 60 fps | 50 ms | 8.3px | barely |
| 0.20s | 60 fps | 80 ms | 6.4px | no |
| 0.20s | 30 fps | 80 ms | 5.4px | no |
| 0.20s | 30 fps | 100 ms | 4.1px | no |
| 0.32s | 60 fps | 100 ms | 12.6px | yes |
| 0.32s | 30 fps | 100 ms | 11.6px | yes |
| 0.32s | 30 fps | 150 ms | 8.5px | yes |

**0.20s is not a fair step** once the frame and a normal input delay are counted. A player who is already holding the direction still fails at 30 fps, and at 60 fps with 80 ms of input lag.

Recommend **0.32s**, which is a lock at **0.68s**. At 30 fps and 100 ms of input the player still moves about 11.6px. A player who keeps swinging for the whole 0.32s can clear (10.9px). A player who reacts 150 ms late while still swinging covers 5.8px and does not. The punishment becomes "late and still swinging," which is the fair version of the current rule. The strike frame is already up about 0.06s before impact, so the lock mark has to be the cue to move. Blink the lane from the lock, not from 75% of the tell, or the blink starts after the decision.

This is a separate one-line change from the bolt below. It does not change life or the depth-12 clock.

## Why the depth-5 caster kills in 2.3s

The 2.3s figure is the PR #43 projection: level 9, depth 5, Gnarled Staff, rare armor, Fireball whenever 4 mana is up, plus staff melee. Nyx. Spread 1, block 0. It is not Whirlwind and it is not Frost Nova. Those two are learned on a full character and are not in that clock. Frost Nova costs 14 mana and has a 4.5s cooldown, so it could land once. It is not what produced 2.3s.

Live trace on this build, same rules (`tools/audit/out/se-ranged-design.json`):

| | |
| --- | --- |
| Staff | Gnarled Staff, rare, item level 5. Mods `fire` 12 (the base 4 plus the median roll 8), `ias` 13. No damage affix, no penetration, no skill-amp power. |
| Sheet | damage 8–12, attack speed 1.13, period **0.398s**, crit **5%** and ×2, spell power **23**, life 199, mana 76, mana regen 2.3/s |
| Spell power | staff 12 + amulet 3 + ring 8. `pw = 23 + level 9 × 2 = 41`. Fireball pre-mitigation `(8 + 41 × 1.4) = 65.4`. Amp is 1. |
| Super Elite | life **194**, shield **19**, `seTakenMul(5) = 0.55`. Nyx resists are Fire 0, Cold −15, Lightning 0, Poison 15, Shadow 0. There is no All resist. |

Order on a player hit: scale the outgoing amount, elemental resist once, then `seTakenMul`, then one round, then the shield absorbs that rounded number and the rest comes off life. Physical staff hits skip the resist row. Fireball is Fire. Crit is already in the amount when `rollDmg` set it. Fireball's projectile calls `damageEnemy` with `crit: false` and `critApplied: true`, so **Fireball does not crit**. The kit's `penFire` is 0. Burning is applied, and the base spec's burn base is 0, so the tick deals **0**. Life steal does not see `seTakenMul`. That debt is unchanged and does not speed this kill.

The trace, no crits in six staff swings (5% needs about twenty swings to expect one):

| t | Hit | Before mitigation | After resist and ×0.55 | Shield | Life left |
| ---: | --- | ---: | ---: | ---: | ---: |
| 0.00 | staff 8 | physical | 4 | 15 | 194 |
| 0.00 | Fireball 65.4 | Fire resist 0 | 36 | 0 | 173 |
| 0.35 | staff 9 | | 5 | 0 | 168 |
| 0.45 | Fireball | | 36 | 0 | 132 |
| 0.75 | staff 10 | | 6 | 0 | 126 |
| 0.90 | Fireball | | 36 | 0 | 90 |
| 1.15 | staff 11 | | 6 | 0 | 84 |
| 1.35 | Fireball | | 36 | 0 | 48 |
| 1.55 | staff 12 | | 7 | 0 | 41 |
| 1.80 | Fireball | | 36 | 0 | 5 |
| 1.95 | staff 8 | | 4 | 0 | 1 |
| 2.25 | Fireball | | 36 | 0 | 0 |

Six Fireballs are **216** of the post-mitigation total. Six staff hits are **32**. The shield is the opening 19 of that and is gone on the first Fireball. The pool is 213. The last bolt overkills. Magmafiend, Fire resist 20, takes **29** from the same 65.4 (`65.4 × 0.80 × 0.55`, then round). Resist moves one bolt. It does not move the clock.

Nothing here is a resist-all interaction or a penetration interaction. The kill is six uncrit Fireballs plus a staff that the taken multiplier has already cut to about half, against a 194 life bar whose shield is one bolt.

A bolt at range does not stretch this clock. The caster in the projection is at 14px (stand) or 34px (kite). Both are inside the near band below. Stand eats one swing (13) and the fight is over. Kite is off that lane, so incoming is 0. Raising life until this takes 8s is the sponge the difficulty audit rejected. This design does not cut Fireball damage.

## Ranged retaliation

A telegraphed physical bolt, depth 5 and deeper, only while the player stays at a distance. It does not replace swing, power, or brand when the player is in melee. It does not fire through walls. It is one action: while it is winding up, the melee rotation waits, the same way a swing waits out a power.

### When it arms

Two bands and a dwell, plus a cooldown.

- **Near, 40px.** Inside the depth-5 power circle (36) with a small margin. Standing here is the melee fight.
- **Far, 64px.** Outside staff reach (52). A bow at 140 and a caster who has stepped off the staff are here.
- **Dead band, 40 to 64.** The current mode is held. Crossing it for a moment does not flip the mode.
- **Dwell, 0.35s.** Far mode turns on only after 0.35s at or beyond 64. It turns off only after 0.35s at or inside 40.
- **Cooldown, 2.6s** after the bolt resolves, before another windup can start. Windup is 0.90s, so the fastest cadence is about **3.5s**.

A 20s schedule in the sim:

| Behavior | Bolts that resolve |
| --- | ---: |
| Stand at 140 the whole time | 6 (1.2, 4.8, 8.4, 12.0, 15.6, 19.2) |
| Flip between 30 and 90 every 0.2s | **0** |
| Flip every 0.5s | 5, which is under the standing rate |
| Arm at 140, then dive to 20 at 0.5s and stay | **1**. The dive does not cancel the shot. |

The flicker never satisfies the dwell, and while it is at 30 it is inside the power circle. The slow toggle still eats committed bolts and spends half its time in melee. Closing the gap after the line is drawn does not erase the line. The cooldown stops a second shot from a second peek. That is both hysteresis and a cooldown. Neither one alone is the lock: dwell stops the tap, and the cooldown stops the rate.

### The shot

| | |
| --- | --- |
| Telegraph | Line from the body along the aim, width 16, so the half-width is 8. `match: true`, same contract as the swing: the drawn half-width is the hit radius. |
| Duration | **0.90s**. Tracks until **0.50s**, then locks. The step is **0.40s**. Full speed covers about 25px of an 8px lane. A 30 fps frame plus 100 ms of input still leaves enough to clear. The 0.2 move floor does not clear it. |
| Projectile | Fired on the locked angle if line of sight is still clear. Speed **160** px/s. Radius **3**. It hits when it reaches the player's body (`3 + 5 = 8`), which is the lane half-width. It does not home. |
| Walls | `sightLOS` to arm and again at release (the fat DDA, `LOS_FAT` 2.5). If the locked ray is blocked, nothing is fired. In flight, `solidAt` already deletes a projectile. No hitscan through stone. Range cap **220**. |
| Damage | `e.dmg × 0.85`, the brand ratio, through `hurtPlayer`. Physical. Same number for a sword, a bow, and a staff. Depth 5 in the rare kits is **11**. Rusty, no armor, is **27**. Depth 8 rare is **17**. Depth 12 rare is **27**, rusty **102**. |
| Animation | The `attack` clip, held so its hit frame is the release. Brand keeps the taunt clip, so the two reads stay different. The projectile uses an existing bolt VFX (`shadow_bolt` or that elite's attack VFX if it is already a bolt). |
| Audio | Telegraph: `enm_ranged_attack_01`. Release: `cbt_proj_arrow_fly_01`. Player hit: `cbt_proj_arrow_impact_01`. Not the brand's magic-bolt cues, and not `playSwingCue` or the whoosh. |

Sidestep is the dodge. Backing up along the ray still gets hit. Stepping in to melee does not delete a bolt that has already started.

## Simulated outcomes

Same four builds as PR #43. Stand for sword, staff, and rusty is 14px out on the swing line. Kite for those three is the old safe spot, about 34px out and off the lane, and they stay there. A bow stands at 140. A kiting bow steps off the brand and off the bolt. Levels 9 / 13 / 20. Spread 1, block 0, Nyx. Intro is not in the clock.

Those melee distances are inside 40px, so the bolt never arms. Kill time and damage match PR #43. Depth 12 melee standing stays **35.2s**.

| Depth | Build | Style | Kill | Damage | From bolts | Potions | Dies |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 5 | Melee | stand | 6.0s | 45 | 0 | 0 | no |
| 5 | Melee | kite | 6.0s | 32 | 0 | 0 | no |
| 5 | Bow | stand | 6.1s | 22 | 22 (2 shots) | 0 | no |
| 5 | Bow | kite | 6.1s | 0 | 0 of 2 | 0 | no |
| 5 | Caster | stand | 2.3s | 13 | 0 | 0 | no |
| 5 | Caster | kite | 2.3s | 0 | 0 | 0 | no |
| 5 | Rusty | stand | 26.1s | 475 | 0 | 3 | 21s |
| 5 | Rusty | kite | 26.1s | 320 | 0 | 3 | no |
| 8 | Melee | stand | 13.9s | 162 | 0 | 1 | no |
| 8 | Melee | kite | 13.9s | 102 | 0 | 0 | no |
| 8 | Bow | stand | 22.7s | 153 | 102 (6) | 0 | no |
| 8 | Bow | kite | 22.7s | 0 | 0 of 6 | 0 | no |
| 8 | Caster | stand | 6.9s | 71 | 0 | 0 | no |
| 8 | Caster | kite | 6.9s | 51 | 0 | 0 | no |
| 8 | Rusty | stand | 96.3s | 3584 | 0 | 2 | 9.4s |
| 8 | Rusty | kite | 96.3s | 2576 | 0 | 3 | 17.3s |
| 12 | Melee | stand | 35.2s | 629 | 0 | 3 | no |
| 12 | Melee | kite | 35.2s | 437 | 0 | 2 | no |
| 12 | Bow | stand | 52.6s | 567 | 378 (15) | 2 | no |
| 12 | Bow | kite | 52.6s | 0 | 0 of 15 | 0 | no |
| 12 | Caster | stand | 18.0s | 342 | 0 | 1 | no |
| 12 | Caster | kite | 18.0s | 246 | 0 | 1 | no |
| 12 | Rusty | stand | 246.6s | — | 0 | 0 | 3.6s |
| 12 | Rusty | kite | 246.6s | — | 0 | 2 | 9.4s |

The bow's standing damage went up because the bolt is what the far fight spends its tells on. One action at a time, so those shots replace brands the bow would have eaten by standing in the mark. Eating every shot at depth 12 costs two potions and does not kill. Dodging them costs nothing. That is the threat, and it is the same number a sword would take from the same bolt.

A caster who actually keeps distance, 80px, staff and Fireball still connecting in the model:

| Depth | Dodge the bolt | Kill | Damage | Potions | Dies |
| ---: | --- | ---: | ---: | ---: | ---: |
| 5 | no | 2.3s | 11 | 0 | no |
| 5 | yes | 2.3s | 0 | 0 | no |
| 8 | no | 6.9s | 34 | 0 | no |
| 8 | yes | 6.9s | 0 | 0 | no |
| 12 | no | 18.0s | 135 | 0 | no |
| 12 | yes | 18.0s | 0 | 0 | no |

The 2.3s kill is still 2.3s. One eaten bolt is 11 damage, about 6% of that life bar. The bolt makes the range fight ask for a step. It does not fix the burst.

Rusty play is unchanged while they stay inside 40px, which is the spot the PR #43 kite already uses. Depth 5 kite still lives. Depth 8 and 12 kite still die to the melee tells they stand in. Running out past 64 arms a bolt they can sidestep. The bolt is not an extra tax on the staff.

## Implementation plan

Do this on a branch off `5b8efac`, in a later PR. Do not fold it into #43 unless Jake asks. Do not touch `version.json`, the three SE tables, boss scripts, loot, or the whoosh.

1. Add the far/near dwell and the bolt cooldown on the Super Elite. Gate it at depth 5. Do not arm during another `seAct`.
2. Telegraph a width-16 line, lock at 0.50s, duration 0.90s. On release, `sightLOS` the locked ray and `eShoot` at 160 px/s, radius 3, physical, damage `e.dmg * 0.85`. `solidAt` already stops it.
3. Time the `attack` clip so the hit frame is the release. Cues as above. No `playSwingCue`.
4. Tests: the four schedules (hold, 0.2s flicker, 0.5s toggle, dive-does-not-cancel), a wall on the ray fires nothing, a center outside the lane is not hit, depth-12 melee stand stays 35.2s, `seMaxHp717(5)` stays 194 and `seMaxHp717(12)` stays 1172, the power circle checks above still pass.
5. As its own commit, move the depth-5 swing lock from 0.80s to 0.68s and blink from the lock. Re-check that a full-speed step clears and that a 150 ms late swing-speed step does not.

After that, the numbers to re-measure are the tables above. If a standing depth-12 bow ever dies from the bolts alone, lengthen the cooldown before raising anything else. Do not lengthen the life bar.
