# Stage 3 Report — Critical Hits and Damage Scaling

**Status: IMPLEMENTED, not VERIFIED.** This branch is for Jake's review. It is not merged, not deployed, and not live. `version.json` is still **0.7.18**. Stage 4 has not been started.

Rollback tag `combat-redesign-pre-stage3` points at `6be0fbedfedf1a512b3a8b6b6dfceb21d3233ce4` (Stage 2 squash, PR #25, on main).

```
git checkout combat-redesign-pre-stage3
```

Do not move that tag.

## What landed

Stage 3 adds a configurable player crit and one outgoing scale order. A character with no new mods still crits at 5% for ×2, and every other new factor is an identity, so time-to-kill matches Stage 2.

The ×2 stays inside `rollDmg`, once, and the packet is marked already crit. The resolver multiplies only when a caller sets `critPending` and does not set `critApplied`. The `crit` flag on `damageEnemy` is still the floater. It does not multiply. That is what keeps Whirlwind from doubling spell power, and what keeps the Stage 1 "crit flag does not double" lock.

Champion crit is still the separate +5% of the pre-mitigation amount, added after armor or resist. It was not folded into the player multiplier.

Conversion can now be given edges, including Physical to an element. An edge moves a fraction. It does not copy. Duplicate edges, self-edges, and cycles are rejected. A moved component chains only when the next edge sets `chain: true`, and only for that one hop. No loot adds an edge. A new game and a load clear the list.

Stage 2 penetration still runs once per elemental component. A second call returns the stored amount.

Life steal was audited and left on the old bases when the new stats are default. The text stats line shows crit chance and the multiplier. The pixel satchel still shows chance only.

Live callers were not retyped. `mods.fire` is still spell power. Hellmouth was not edited.

## Formula and order

Player crit, once, on the weapon roll inside `rollDmg(skill)`:

```
chance = st.crit + skillChance(skill)
st.crit = 5 + sum(mods.crit)

st.critMul = max(0, 2 + sum(mods.critDmg) / 100)
multiplier = max(0, st.critMul + skillMul(skill))
```

There is no chance cap. 0 or below never crits. 100 or above crits for every roll in `[0, 1)`. Skill chance and skill multiplier are not on items and are not saved. They clear on a new game and on a load.

Outgoing player damage, once per component, before conversion and before mitigation:

```
scaled = (amount + flat + flat[type])
       * (1 + (inc + inc[type]) / 100)
       * more * more[type] * packetMore
       * (1 + bonus[type] / 100)
```

`more` gear mods multiply. Two `+10` more mods are ×1.21, not ×1.20. Increased mods sum. `packetMore` is the power-attack multiplier (×1.50 to ×2.25) or the Fireball splash (1 or 0.6). A `scaled` flag blocks a second pass. Enemy hits and world packets skip this step.

Then conversion, then the Stage 2 order: Ethereal Shield, block, Physical `DEF / (DEF + 30)` or elemental resist with penetration once, champion crit on incoming hits, thorns, barrier, and on an enemy guard, ram armor, Hellmouth ×1.10, the floor of 1, and the boss or Super Elite shield.

Pinned integers, enemy target, no guard, no resist:

| Case | Result |
| --- | --- |
| 10, crit ×2 | 20. A second resolve that also sets `critPending` stays 20 |
| 10, crit ×2, flat 5 | 25. Crit does not multiply the flat |
| 100, flat 20, then +50% increased | 180, not 170 |
| 10, flat 10, then ×2 more | 40, not 30 |
| 100 Fire with flat 10, flatFire 5, inc 20, incFire 30, more 1.1, moreFire 1.25, bonusFire 10 | 260.90625, rounds to 261 |
| 100 Physical, 60% to Fire, 60% of the remainder to Cold | 16 + 60 + 24. Total 100 |
| 100 Physical chained once toward Lightning | 100 Cold. The third hop does not run |
| 100 Physical, half to Fire, 40 Fire pen, 0 resist | 120. The Fire half records one penetration |

## Conversion rules

- An edge is `from`, `to`, `fraction` in `(0, 1]`, and optional `chain`.
- The moved amount leaves the source. The total before mitigation does not change unless flat, increased, more, or a type bonus already changed it.
- The same `from → to` pair cannot be listed twice.
- A self-edge or a cycle is rejected and the previous list is kept.
- Without `chain`, a component that has already moved stays put. With `chain`, it may move one more time, and that result cannot move again.

## Life steal audit

Preserved on purpose. Changing the heal would change sustain on every power attack and every armored enemy, and the old calls are explicit.

| Source | What is healed | What is not |
| --- | --- | --- |
| Melee tap | Post-crit weapon roll, after flat / increased / more / type bonus, before enemy mitigation | A second crit |
| Power attack | The same base. Full charge on a 10 with 20% leech heals 2 | The ×2.25. The enemy loses 23 |
| Whirlwind | The skill sum `(weaponRoll * 1.4 + pw * 0.5) * amp`, then the same scale with `packetMore` 1. Crit still doubles only the weapon roll. Level 1, no fire mod: 29 on a crit, 15 otherwise | Enemy mitigation |
| Bow | Nothing. The arrow stores the crit roll. Impact still passes `crit: false`, so the floater has no `!` | |
| Fireball, Frost Nova | Nothing. A skill-crit override on Fireball does not change the 64 | |
| Guard front | The pre-mitigation roll. A 10 into a guard's front deals 2 and a 50% leech heals 5 | The ×0.15 |

`window.__lastLeech` records `source`, `base`, `healed`, and `skipped`. With every new stat at its default, the melee and Whirlwind bases match v0.7.18.

## Tests

Headless Chrome, Puppeteer, system Google Chrome, cache disabled, `python3 -m http.server` on 127.0.0.1.

| Run | Legacy 21 files | Stage 1 | Stage 2 | Stage 3 |
| --- | --- | --- | --- | --- |
| Before Stage 3 code, tag `combat-redesign-pre-stage3` | 804 passed, 102 failed | 71 / 0 | 73 / 0 | not present |
| After Stage 3, one sequential pass | 810 passed, 95 failed | 71 / 0 | 73 / 0 | 58 / 0 |

Baseline per file: `v075` 59/1, `v076` 48/0, `v077` 60/4, `v078` 60/1, `v078-play` 25/1, `v0781` 27/2, `v079` 49/1, `v0710` 36/1, `v07101` 41/1, `v07102` 54/0, `v07103` 24/3, `v0711` 42/5, `v0712` 37/6, `v0713` 32/5, `v0714` 33/8, `v0715` 19/13, `v07151` 8/45, `v07152` 34/3, `v0716` 49/1, `v0717` 47/1, `v0718` 20/0.

The sequential after-pass moved four files. None of the movement is the new formula:

- `v0714` 33/8 → 40/1 and `v07152` 34/3 → 36/1. Footer and scale hit-tests. Stage 1 already saw both results on unmodified code. The remaining failure in each file is the version pin.
- `v076` 48/0 → 47/1 (`b3 damage no snap`, lost 32). Three immediate re-runs were 48/0. That harness is the spike walk, not crit.
- `v077` 60/4 → 58/5 because that floor had no wall torch, so the torch check failed and the snuffed check was not emitted. A re-run was 60/4 with the same four baseline names.

Combat anchors did not move. `v079`, `v0710`, and `v0717` still fail only the old version pin. `v0718` is 20/0.

## Hellmouth and `mods.fire`

Hellmouth is unchanged. `T.boss` is still false on Super Elites. Stage 1 (71/0) and Stage 2 (73/0) still include the sink-and-delete. Stage 3 repeats it: the Super Elite is sunk, the boss is not, the marked boss still takes 110 from a Physical 100, and the Super Elite is deleted after the sink. A Fire resist on the Super Elite does not save it.

`mods.fire` is still spell power: `pw = fire + level * 2`. It is not crit damage, not a Fire component, and not flat Fire. Melee `rollDmg` is still 4 with `st.fire = 40`. Fireball at fire power 20 is still 64 and still Physical against 90 Fire resist. Frost Nova is still 8 Physical against 90 Cold resist. A save with `mods.fire = 6` plus the new test mods reloads `st.fire === 6`. An old charm with only `mods.fire = 6` recomputes to crit ×2, flat 0, increased 0, and more ×1.

## Deliberately not in this PR

- Reclassifying any live attack. The Stage 2 mapping table is still a proposal for Stage 7.
- Loot affixes, unique mods, or shop prices for crit damage, flat, increased, more, type bonus, or conversion. Stage 10.
- A pixel-sheet layout for the new multiplier. The text stats line shows it. Stage 12 owns the satchel sheet.
- Marking bow crits on the floater. The damage already includes the crit. Stage 11.
- Folding champion crit into the player multiplier.
- Teaching life steal the power-attack multiplier, or giving it to bows, Fireball, and Frost Nova.
- Status effects. That is Stage 4, and it was not started.
- A version bump, a GitHub Pages deploy, or a merge.

Stage 4 and a live ship both wait for Jake.
