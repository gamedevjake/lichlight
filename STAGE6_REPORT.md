# Stage 6 Report — Weapon Identity and Attack Responsiveness

**Status: IMPLEMENTED, not VERIFIED.** This branch is for Jake's review. It is not merged, not deployed, and not live. `version.json` is still **0.7.18**. Stage 7 has not been started.

Rollback tag `combat-redesign-pre-stage6` points at `6eecf2439525da17acf9479688de185d4b8a6749` (Stage 5 squash, PR #28, on main).

```
git checkout combat-redesign-pre-stage6
```

Do not move that tag. `combat-redesign-pre-stage1` through `combat-redesign-pre-stage5` were not moved.

## What landed

Weapons now differ by when they hit, how wide they hit, how hard they shove, and how much poise they spend. Hit points and the attack period did not move. `mods.fire` is still spell power. Hellmouth still deletes Super Elites. Live attacks are still Physical.

The family is read from the weapon you already have (`slot` and `icon`). Nothing new is stored in the save. Fists and swords keep the Stage 5 poise row. An untagged packet still uses that row too, which is why the Stage 5 harness still sees light 18, heavy 34, power 52, and skill 14.

## Families

Period is still `0.45 / aspd`. Windup is a fraction of that period, not an extra delay. Reach numbers were already in the game and were not retuned.

| Family | Windup | Arc | Knockback | Hitstop | Poise tap | Whirlwind | Full power | Spells | Reach |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Fists | 0.12 | 1.10 | 1.00 | 0.022 | 18 | 34 | 52 | 14 | 18 |
| Sword | 0.18 | 1.10 | 1.00 | 0.030 | 18 | 34 | 52 | 14 | 24 |
| Axe | 0.28 | 1.55 | 1.20 | 0.040 | 28 | 46 | 72 | 14 | 28 |
| Maul | 0.38 | 0.78 | 1.45 | 0.055 | 40 | 60 | 96 | 12 | 34 |
| Staff | 0.22 | 0.48 | 0.75 | 0.022 | 12 | 24 | 36 | 22 | 40 |
| Bow | 0.20 | ranged | arrow | 0.018 | 11 | 22 | 11 | 16 | 209 |

Full-charge poise is that power number. A minimum charge is still `×0.70`. A sword's minimum charge is still 36.4 and its full charge is still 52. A 0.6 Fireball splash still multiplies skill poise once: 8.4 on a sword, 13.2 on a staff.

A light enemy (poise 50) breaks on the third sword tap, the second axe or maul tap, or the fifth staff or bow hit. One full power from a sword or a maul still breaks it in one hit.

A boss (560 poise, takes 0.20) still needs 156 sword taps or 54 full sword powers. A maul tap breaks on hit 70. A maul full power breaks on hit 30. The stagger is still 0.28s and the immunity is still 5.5s. Armor, resist, barrier, and the boss shield still do not reduce poise. Block still zeroes it. Boss intro still blocks poise and not HP.

At about 1.25 radians and 18px, an axe connects and a sword, maul, and staff do not. Inside `8 + radius`, every family still hits. That point-blank rule was already there.

## Attack timing

Pressing attack starts a windup. The hit lands when the windup ends. Recovery fills the rest of the old cooldown, so the time from one hit to the next is the old period.

One buffered press is kept through the current swing plus 0.16s. It becomes the next swing. It does not skip that swing's windup, and a second press replaces the slot instead of stacking.

A roll, a stagger, or a freeze during windup cancels the hit that has not landed and leaves the cooldown running. A direct `doAttack` during windup replaces the pending swing with that one hit. It does not add a second.

`doAttack`, `fireBow`, and `powerAttack074` still resolve inside the call. Older harnesses that swing by calling them keep an immediate hit. The windup is the input path (`armAttack`, keyboard, click-to-attack).

A bow draw does not show the melee charge ring and does not apply the 1.50–2.25 power multiplier. The arrow is `rollDmg('bow')`.

## Hitstop

A landed swing holds the pose. The cap is 0.06s. A maul power hit lands on that cap (0.055 × 1.15). Cooldown, input, and arrows keep moving on the full frame. The pose hold does not add recovery and does not freeze the damage number.

## Bow crit flake

`bow crit flag stays off the floater` failed when the arrow dealt 0. The crit flag was already false on purpose, and it is still false. `rollDmg` is still the only multiply. Impact still passes `crit: false` and `critApplied: true`.

The miss was the hit test. An arrow moves `220 * dt`. At `dt = 0.05` that is exactly 11px. The old test was strict `< enemy radius + arrow radius`. With the harness radius 8 and an arrow radius 3, 11 is not less than 11, so the arrow stayed alive on open floor and dealt nothing. If a wall, torch, or prop killed it, a looser `+3` search then connected. That is why the same check passed or failed with the dungeon.

Player arrows now test the segment from the previous point through the new point, including a start that is already on the enemy, with a 0.51px margin, and they skip dead bodies. Twelve repeats in `tests/stage6-weapons.html` each dealt 16, left the floater flag false, and did not leech. The Stage 3 harness stayed 58/0 on the sequential pass and on two re-runs. Before this change, a checkpoint re-run had failed that one name because the arrow dealt 0.

## Time to kill

Same measurement before the code and after it. Level-1 base, midpoint pinned (`st.min = st.max`), spread 1, crit off. Trash pool 80. Boss pool 1050, which is floor-5 Mother Murk's 840 HP plus the 210 shield. Period is `0.45 / spd`.

| Family | Hit | Period | Seconds to 80 | Seconds to 1050 |
| --- | --- | --- | --- | --- |
| Fists | 2 | 0.450 | 18.000 | 236.250 |
| Sword | 4 | 0.450 | 9.000 | 118.350 |
| Axe | 5 | 0.500 | 8.000 | 105.000 |
| Staff | 5 | 0.450 | 7.200 | 94.500 |
| Maul | 19 | 0.643 | 3.214 | 36.000 |
| Bow | 7 | 0.429 | 5.143 | 64.286 |

The before run and the after run are the same six rows. Melee power is still `round(hit × 2.25)`: fists 5, sword 9, axe 11, staff 11, maul 43. A bow "power" press deals 7, the same pinned hit.

## Saves

A short sword with `mods.fire = 4` and `spd = 1` saves those fields and does not require attack phase, windup, or hitstop. Stripping `poise` from that save and loading it brings the sword back, HP 33, and a full 140 poise bar.

## Tests

Headless Chrome, Puppeteer, system Google Chrome, SwiftShader, cache disabled, `python3 -m http.server` on 127.0.0.1. The checkpoint is `6eecf24` before this code.

| Run | Legacy 21 | Stage 1 | Stage 2 | Stage 3 | Stage 4 | Stage 5 | Stage 6 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Before, tag `combat-redesign-pre-stage6` | 806 passed, 101 failed | 71/0 | 73/0 | 58/0 | 75/0 | 78/0 | not present |
| After, one sequential pass | 814 passed, 93 failed | 71/0 | 73/0 | 58/0 | 75/0 | 78/0 | 47/0 |

Name diff against the checkpoint:

- `v0711`: 42/6 → 43/5. Cleared `trash in the maw`. The five stable names remain (`version`, `hundred gold`, `tome icon`, `stats scroll`, `stats canvas kept`). Checkpoint re-runs were 43/5 and 42/5 without that extra name. After re-run was 42/5 with those five. Emission flake.
- `v0714`: 33/8 → 40/1 on the sequential pass. Cleared the seven footer and tab names. `version` remains. After re-runs were 40/1, then 33/8 with the same footer and tab names as the checkpoint. Layout flake.
- `stage3-crit-scaling`: stayed 58/0. Checkpoint re-run had failed `bow crit flag stays off the floater`. After re-runs were 58/0 and 58/0.
- `stage5-poise`: stayed 78/0. `no stage 6 weapon pass` was renamed to `stage 6 weapon pass is explicit` because this stage adds that pass.

No other new failure name. `v075`, `v079`, `v0710`, `v0713`, `v0717`, and `v0718` did not move.

## Deliberately not in this PR

- Reclassifying Fireball, Frost Nova, poison puddles, or lava. Stage 7.
- A new save field, a damage buff, or a longer attack period.
- Wiring curse life drain into `leech`, or capping crit chance.
- Hellmouth versus Super Elites. Stage 9.
- A version bump, a GitHub Pages deploy, or a merge.

Stage 7 and a live ship both wait for Jake.
