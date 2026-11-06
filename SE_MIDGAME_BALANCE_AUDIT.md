# Super Elite midgame balance audit

Audit only. No gameplay change, no `version.json` change, no workflow change. Measured on `main` at `5bfb9a8` (game version **0.7.18**), which already includes Stage 10 gear and the early Super Elite tune (depths 1–4 life **80 / 102 / 119 / 133**, depth 5+ unchanged).

The headless harness is `tests/se-midgame-audit.html`, run with `node tools/se-midgame-balance.mjs`. It loads `index.html` and calls the live functions (`seMaxHp717`, `seDmg717`, `seTellMul`, `makeItem`, `computeStats`, `damageEnemy`, `hurtPlayer`, `castSkill`, `attackPeriod`, `applyPoiseDamage`). Crit is the kit's real chance, not a forced crit. Spread is 1. Block is not rolled on the threat hits. Depths 1–5 cannot cast in a normal run; Fireball rows below depth 6 are the formula only.

## Summary

A depth-12 Super Elite dies before its first swing resolves.

| Build at depth 12 | Level | Melee time | Melee + Fireball |
| --- | ---: | ---: | ---: |
| Offensive rare (the reference) | 20, full clear | **1.63 s** | **0.63 s** |
| Same rare kit | 19, the reported case | **1.66 s** | **0.63 s** |
| White Rune Blade, same armor slots empty of damage affixes | 20 | 3.35 s | 0.90 s |
| The Ninth Psalm, same rare armor | 20 | 1.58 s | **0.45 s** |

The pool at depth 12 is **293 life + 29 shield = 322**. An offensive rare hit is about **62**. A Fireball is about **77**. Two bolts and two swings are the whole fight. The swing tell is **1.00 s**, so the kill lands during the windup. Standing in the power tell costs **10** life against a **334** life pool. The Super Elite is not a threat, and dodging it is free.

Duration has already plateaued, at roughly **1.6 s** of melee from depth 8 through depth 20. Weapon scale, `floor(level / 2)`, and spell power `level * 2` keep up with the linear life formula. Making the fight last a minute is not a small life tweak. Against this melee build the pool has to absorb about **45×** as much damage at depth 12, and about **58×** from depth 16 on. Doing that with life alone puts a depth-12 Super Elite near **13,000** life, several times the depth-20 boss. The proposal below splits that into a **4× life** cap (the bar stays under the previous boss) and a **taken-damage** multiplier on player hits only. Depths 1–4 are multiplied by 1, so the early tune stays.

Fireball does not land in the same window as the sword. At depth 12 the rare weave is about **2.6×** faster than tapping. One multiplier cannot put both in 65–85 s. The proposal aims the **sword** at the band and leaves the caster shorter (about 30 s at depth 12, about 20 s with The Ninth Psalm). Spell books are off until depth 6, and Fireball is the efficient mana spend, so this gap is the build.

## 1. Life and damage, depths 1–20

Life, before the early fade:

```14751:14763:index.html
function seBaseHp717(d) {
  d = Math.max(1, Math.floor(+d || 1));
  const base = Math.round(18 + 7 * (d - 1));
  const champ = Math.round(base * 2.2);
  return Math.round(champ * 1.4); // pre-tune body: 1.4× champion. Depth 5+ stays on this number.
}
function seMaxHp717(d) {
  d = d || depth || 1;
  const cur = seBaseHp717(d);
  const fade = seEarlyFade(d);
  if (!(fade > 0)) return cur; // depth 5+ life is the current formula, exactly
  return Math.round(cur * (1 + (80 / 56 - 1) * fade)); // depth 1 is 80, then the bump fades out
}
```

`seEarlyFade` is `max(0, 1 - (d - 1) / 4)`. It is 1 at depth 1 and 0 from depth 5 on. Shield is `round(life * 0.10)`.

Damage:

```14764:14768:index.html
function seDmg717(d) {
  d = d || depth || 1;
  const bump = (typeof dmgBump === 'function') ? dmgBump(d) : 1;
  return (3.2 + 0.85 * (d - 1)) * bump * 1.4 * 1.15;
}
```

`dmgBump` is `1.08 + 0.17 * max(0, 1 - (d - 1) / 10)` for non-bosses. It is flat **1.08** from depth 11 on. Trash uses an extra `mobDmgMul` after depth 12. Super Elites do not.

Tells, depth 5+ ratios in the table. Depths 1–4 scale power and brand only:

```14928:14940:index.html
const SE_TELL = {
  swing: { dur: 1.0, gap: 0.7, w: 16, len: 52, hit: 8, mul: 1, act: 'attack', col: '#ff4040' },
  power: { dur: 1.3, gap: 0.9, r: 10, mul: 1.7, act: 'powerup', col: '#ff8040' },
  brand: { dur: 1.15, gap: 0.75, r: 8, mul: 0.85, act: 'attack', col: '#c080ff' }
};
function seTellMul(kind, d) {
  const row = SE_TELL[kind];
  if (!row) return 1;
  const fade = seEarlyFade(d == null ? (depth || 1) : d);
  if (kind === 'power') return row.mul + 1.3 * fade; // 1.7 + 1.3*fade; depth 5+ stays 1.7
  if (kind === 'brand') {
    if (!(fade > 0)) return row.mul; // depth 5+ stays 0.85. The audit's fade-0 brand of 1.15 is not used.
    return 1.15 + 0.85 * fade;
```

`hurtPlayer` then rounds `raw * tellMul` through armor `def / (def + 30)` on Physical. These rows are the pre-armor numbers.

| Depth | Fade | Bump | Base life | Life | Shield | Pool | Raw | Swing | Power | Brand |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 1.00 | 1.250 | 56 | **80** | 8 | 88 | 6.44 | 6.44 | 19.32 | 12.88 |
| 2 | 0.75 | 1.233 | 77 | **102** | 10 | 112 | 8.04 | 8.04 | 21.51 | 14.37 |
| 3 | 0.50 | 1.216 | 98 | **119** | 12 | 131 | 9.59 | 9.59 | 22.54 | 15.11 |
| 4 | 0.25 | 1.199 | 120 | **133** | 13 | 146 | 11.10 | 11.10 | 22.48 | 15.12 |
| 5 | 0 | 1.182 | 141 | **141** | 14 | 155 | 12.56 | 12.56 | 21.35 | 10.68 |
| 6 | 0 | 1.165 | 164 | 164 | 16 | 180 | 13.97 | 13.97 | 23.76 | 11.88 |
| 7 | 0 | 1.148 | 185 | 185 | 19 | 204 | 15.34 | 15.34 | 26.08 | 13.04 |
| 8 | 0 | 1.131 | 206 | 206 | 21 | 227 | 16.66 | 16.66 | 28.32 | 14.16 |
| 9 | 0 | 1.114 | 228 | 228 | 23 | 251 | 17.94 | 17.94 | 30.49 | 15.25 |
| 10 | 0 | 1.097 | 249 | **249** | 25 | 274 | 19.16 | 19.16 | 32.58 | 16.29 |
| 11 | 0 | 1.080 | 272 | 272 | 27 | 299 | 20.34 | 20.34 | 34.58 | 17.29 |
| 12 | 0 | 1.080 | 293 | **293** | 29 | **322** | 21.82 | 21.82 | 37.10 | 18.55 |
| 13 | 0 | 1.080 | 314 | 314 | 31 | 345 | 23.30 | 23.30 | 39.61 | 19.80 |
| 14 | 0 | 1.080 | 336 | 336 | 34 | 370 | 24.78 | 24.78 | 42.12 | 21.06 |
| 15 | 0 | 1.080 | 357 | 357 | 36 | 393 | 26.26 | 26.26 | 44.64 | 22.32 |
| 16 | 0 | 1.080 | 379 | 379 | 38 | 417 | 27.73 | 27.73 | 47.15 | 23.57 |
| 17 | 0 | 1.080 | 400 | 400 | 40 | 440 | 29.21 | 29.21 | 49.66 | 24.83 |
| 18 | 0 | 1.080 | 421 | 421 | 42 | 463 | 30.69 | 30.69 | 52.17 | 26.09 |
| 19 | 0 | 1.080 | 444 | 444 | 44 | 488 | 32.17 | 32.17 | 54.69 | 27.34 |
| 20 | 0 | 1.080 | 465 | 465 | 47 | 512 | 33.65 | 33.65 | 57.20 | 28.60 |

Depth 1 power at defense 0 still rounds to **19**, and the swing to **6**. That matches the early-tune report. Depth 5 brand stays ×0.85, not the audit draft of ×1.15.

Phases do not change these numbers. Phase 1 (above half) is swings only. Phase 2 (half to a quarter) is swing, swing, power. Phase 3 is swing, power, brand. A 1.6 s kill never leaves phase 1.

## 2. Loadouts

Fight level is a two-seed full clear: every non-boss on the floor, the boss on boss floors, ooze splits, then the Super Elite's own XP is granted after the fight. Depth 12 is entered at **19** and the Super Elite is fought at **20**. The reported level 19 is the same fight within a few hundredths of a second (see the level sweep).

| Depth | Fight level | Mobs | Trash XP | Boss XP | Boss life |
| ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 3 | 55 | 198 | 0 | |
| 4 | 7 | 28 | 339 | 0 | |
| 5 | 9 | 58 | 1021 | 350 | Mother Murk 840 |
| 8 | 13 | 70 | 2445 | 0 | |
| 10 | 17 | 88 | 3614 | 550 | The Gnawer King 1365 |
| 12 | **20** | 105 | 4212 | 0 | |
| 15 | 25 | 104 | 6147 | 750 | The Drowned Bell 1890 |
| 16 | 26 | 104 | 6062 | 0 | |
| 20 | 31 | 110 | 7132 | 950 | Sister Vey 2415 |

Item level equals the depth. The base is the best one whose base level is `<= depth + 1`, the same gate as a random drop. Weapons stay on swords: Short Sword at depth 1, Broad Sword at 2–7, Rune Blade from 8. Armor, helm, boots, shield, and amulet use that same gate. Depth 12 wears Dusk Shroud, Bone Visage, Greaves, Tower Shield, Choir Medallion, and a Ring.

Affix numbers are the median of the live `irand` span, not one lucky `makeItem`. At item level 12 those medians are damage **8**, attack speed **20**, crit **11**, defense **8**, life **24**, spell power on the amulet **9**. Whites keep the Stage 10 ward and nothing else. Magic adds damage and attack speed on the weapon, defense on the body, life on the helm. The offensive rare adds crit on the weapon, life on the body, a fire resist on the helm, and a ring with damage 8 and attack speed 10. The unique is the sword unique for that base: Grandsire Oswin, Oathbreaker, then The Ninth Psalm. Its armor is the same offensive rare set.

A separate depth-1 starter is the Rusty Sword plus white leather, cap, boots, and a wooden buckler (ward only).

Twenty-four real `makeItem(12, 2, 'Rune Blade')` rolls, on that same rare armor, expected a melee hit from **43.9 to 59.7**. The median was **47.0**. Ten of the twenty-four sat on **46.7**, a rare blade that did not roll damage, speed, or crit. The offensive kit forces those three medians at once and expects **62**. That is a legal combination, and it is a little stronger than the best of this 24-roll sample. Both clocks are in the tables below.

Required level on the depth-12 rare pieces is **10**. The fight level is 20, so the kit can be worn.

## 3. Time to kill

Clock is continuous melee in range. Period is `0.45 / aspd`. Each swing walks every integer from sheet min to sheet max through `damageEnemy`, then weights a crit by the sheet chance. The pool is life plus shield. Fireball is the live cast expression `(8 + (spell + level * 2) * 1.4) * amp` with the core splash of 1, then `damageEnemy` as Fire. A direct `castSkill(0)` after unlocking the tome spawned a bolt of **73.8**, the same number. Base Fireball burn has base 0, so the tick adds nothing. Kindling is not in this kit.

Hybrid time is melee on its period plus Fireball whenever 4 mana is up. The current fights end in one or two bolts, before mana matters. Mana regen is `1.4 + level * 0.1` per second. At level 20 that is **3.4 / s** against a spam of **8.9 / s**, so a long fight would fall to one bolt every **1.2 s** after about **20 s** of casting. Charge time is a 0.90 s hold at ×2.25 plus the melee period. That is a DPS loss. The charge column is there because the move exists, not because it is the kill.

Offensive rare, the reference:

| Depth | Lv | Sheet | Def | Life | Period | Hit | Fireball | Tap | Hybrid | Charge |
| ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 3 | 7–10 | 15 | 108 | 0.40 | 9.4 | 19 | 3.72 | 1.18 | 5.38 |
| 2 | 4 | 14–19 | 24 | 122 | 0.39 | 18.3 | 22 | 2.39 | 0.90 | 3.49 |
| 3 | 6 | 15–21 | 31 | 159 | 0.39 | 20.0 | 28 | 2.52 | 0.90 | 3.74 |
| 4 | 7 | 17–23 | 37 | 172 | 0.38 | 22.4 | 30 | 2.49 | 0.90 | 3.70 |
| 5 | 9 | 19–25 | 45 | 199 | 0.38 | 24.6 | 37 | 2.36 | 0.90 | 3.56 |
| 6 | 10 | 22–29 | 52 | 203 | 0.37 | 28.8 | 40 | 2.32 | 0.90 | 3.52 |
| 7 | 12 | 23–30 | 55 | 230 | 0.37 | 29.9 | 46 | 2.49 | 0.90 | 3.83 |
| 8 | 13 | 36–48 | 64 | 243 | 0.33 | 47.9 | 50 | 1.56 | 0.66 | 2.59 |
| 9 | 15 | 37–50 | 72 | 270 | 0.33 | 49.6 | 61 | 1.64 | 0.65 | 2.75 |
| 10 | 17 | 41–54 | 75 | 294 | 0.32 | 54.6 | 67 | 1.62 | 0.64 | 2.72 |
| 11 | 18 | 43–56 | 75 | 311 | 0.32 | 56.9 | 71 | 1.67 | 0.63 | 2.84 |
| 12 | 20 | 47–60 | 82 | 334 | 0.32 | 62.1 | 77 | **1.63** | **0.63** | 2.80 |
| 16 | 26 | 57–72 | 95 | 415 | 0.30 | 76.1 | 89 | 1.65 | 0.90 | 2.92 |
| 20 | 31 | 66–84 | 107 | 486 | 0.29 | 88.8 | 106 | 1.66 | 0.86 | 3.04 |

The depth-8 step is the Rune Blade becoming a legal drop (`base level 9 <= depth + 1`). From there the melee clock sits on **1.6 s**.

Same clock, other kits. Tap is melee only. Hybrid is melee plus Fireball.

| Depth | Common tap / hybrid | Magic tap / hybrid | Unique tap / hybrid |
| ---: | --- | --- | --- |
| 1 | 8.38 / 1.80 | 5.32 / 1.35 | 2.14 / 0.90 |
| 1 starter, Rusty | **10.78 / 1.80** | | |
| 4 | 5.21 / 1.35 | 3.49 / 1.21 | 1.90 / 0.85 |
| 5 | 4.75 / 1.35 | 3.27 / 0.90 | 1.85 / 0.84 |
| 12 | 3.35 / 0.90 | 2.30 / 0.90 | 1.58 / **0.45** |
| 16 | 3.65 / 1.23 | 2.40 / 0.99 | 1.73 / 0.45 |
| 20 | 3.99 / 1.35 | 2.51 / 0.96 | 1.85 / 0.45 |

Depths 1–5 hybrid is what the bolt would do if it were unlocked. It is not unlocked. `BOOK_MIN` is `[6, 6, 6]`, and `tomeReady` also requires the Lich Tome. The honest early clock is the tap column. A Rusty Sword at depth 1 is **10.8 s**, in line with the early report's 9.9 s at level 2 (that report used a flat 4-point hit and no crit).

A +20 Fire resist (the magma fiends) moves the depth-12 rare hybrid from 0.63 s to **0.90 s**. Resist is not the brake.

## 4. Can they threaten a level-19 player?

No. Threat hits are `hurtPlayer` at spread 1, block not rolled, regen included in the facetank clock. The depth-12 row is the offensive rare. Level 19 and level 20 wear the same defense (82). Armor fraction is `82 / 112 = 0.73`.

| Depth | Lv | Player life | Def | Swing | Power | Brand | Powers to die | Facetank, eating every power |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 3 | 108 | 15 | 4 | 13 | 9 | 9 | 22 s |
| 4 | 7 | 172 | 37 | 5 | 10 | 7 | 18 | 51 s |
| 5 | 9 | 199 | 45 | 5 | 9 | 4 | 23 | 72 s |
| 12 | 20 | 334 | 82 | **6** | **10** | 5 | **34** | 138 s |
| 12 | 19 | 324 | 82 | 6 | 10 | 5 | 33 | 131 s |
| 16 | 26 | 415 | 95 | 7 | 11 | 6 | 38 | 259 s |
| 20 | 31 | 486 | 107 | 7 | 13 | 6 | 38 | 168 s |

A clean dodge deals 0. The i-frames after a hit are 0.45 s, and the next tell's windup is longer than that, so they do not cover the next hit. They also do not matter, because the Super Elite dies before the first hit.

Player DPS at the depth-12 rare, level 20:

| Source | Hit | Period | Damage per second | Notes |
| --- | ---: | ---: | ---: | --- |
| Tap | 62 | 0.315 s | ~197 | Expected crit at 16%, ×2 |
| Full charge | ×2.25 | 0.90 + 0.315 s | ~115 | Slower than tapping |
| Fireball | 77 | 0.45 s while mana lasts | ~171, then ~65 | 4 mana, regen 3.4 / s |
| Both | | | the 0.63 s kill | Two bolts, pool is gone |
| Whirlwind | 97 | 1.6 s, 8 mana | 12 per mana | Fireball is 18.5 per mana |

## 5. Sensitivity

Depth 12, level 19, pool 322. The weapon rows drop the damage ring so the blade is the only change. The full-kit row keeps the ring, which is why its attack speed is 1.43 rather than 1.32.

| Weapon, ring off | Attack speed | Expected hit | Tap | Hybrid |
| --- | ---: | ---: | ---: | ---: |
| White Short Sword | 1.00 | 16 | 9.2 s | 1.35 s |
| Rare Short Sword, median damage and speed | 1.20 | 27 | 4.5 s | 1.13 s |
| Rare Broad Sword | 1.20 | 35 | 3.5 s | 0.90 s |
| Rare Rune Blade, median damage, speed, crit | 1.32 | 52 | 2.13 s | 0.90 s |
| Same blade, high rolls of those three | 1.47 | 62 | 1.58 s | 0.61 s |
| Rare Great Maul | 0.84 | 56 | 3.10 s | 0.90 s |
| Rare Archon Staff | 1.20 | 42 | 2.89 s | 0.90 s |
| Grandsire Oswin, item level 12 | 1.32 | 28 | 3.95 s | 1.02 s |
| Widow's Harvest | 1.05 | 65 | 2.10 s | 0.85 s |
| The Ninth Psalm | 1.10 | 66 | 1.99 s | **0.45 s** |
| Choirmaster's Baton | 1.00 | 40 | 3.67 s | **0.45 s** |

The full offensive rare, ring included, is the 1.63 s / 0.63 s reference at level 20 (1.66 s / 0.63 s at level 19). A rolled rare blade on that armor, median of 24 drops, expects a hit of 47. With only the ring's attack speed that is about **2.6 s** of tapping.

Level, same offensive rare, depth 12:

| Level | Tap | Hybrid | Fireball |
| ---: | ---: | ---: | ---: |
| 10 | 1.80 s | 0.94 s | 49 |
| 14 | 1.73 s | 0.90 s | 60 |
| 16 | 1.70 s | 0.90 s | 65 |
| 19 | 1.66 s | 0.63 s | 74 |
| 22 | 1.60 s | 0.63 s | 82 |
| 25 | 1.57 s | 0.63 s | 91 |

Level is a small melee change and a large Fireball change, because spell power adds `level * 2` before the ×1.4.

Affixes on the offensive rare, level 19:

| Case | Crit | Tap | Hybrid |
| --- | ---: | ---: | ---: |
| Median damage, speed, crit | 16% | 1.66 s | 0.63 s |
| Damage only, no speed, no crit | 5% | 2.17 s | 0.90 s |
| High speed and high crit | 23% | 1.27 s | 0.57 s |
| Crit on weapon, helm, ring, and amulet, high rolls | **77%** | 1.01 s | 0.45 s |
| +8 added Physical and +8 added Fire | 16% | 1.47 s | 0.63 s |

Attack speed and crit move the melee clock by about a second. They do not create the problem. The pool does. The 77% crit case is the open uncapped-crit debt, and it still does not reach 100% without further sources. See the debts section.

## 6. Stagger, recovery, kiting

Measured on a live `step`: player **62 px/s**, **34.1 px/s** while a swing timer is up. Super Elite chase is the spawn speed **36 px/s** (`seTick717` moves `e.spd * seMoveMul`, and `spd` is 36). One clean chase step covered 36 px/s. A later step in the same room was faster because a Fireball bolt was still in the air and knocked the actor. The constant is 36.

| Tell | Dodge | Time at 62 px/s | Time while swinging | Windup left |
| --- | --- | ---: | ---: | --- |
| Swing, 8 px off the lane, lock at 0.25 s | sidestep | 0.13 s | 0.24 s | 0.75 s |
| Power, circle radius 15, follows the body | step out | 0.24 s | | 1.30 s |
| Brand, circle radius 13, stays where it was drawn | walk out | 0.21 s | | 1.15 s |

Sword reach is 24 + the Super Elite's radius 12, so a hit connects out to **36 px**. The power circle is **15 px**. There is a **21 px** ring where the sword connects and the power does not. Maul and staff are longer. A caster who is not swinging runs at 62 against 36 and is only in brand range (160 px). Brand does not follow.

There is no contact damage (`noContact: true`). There is no leash: `seTick717` chases for as long as the player is outside melee, with no aggro drop. `moveEnt` tries X and Y separately, so a wall on one axis does not stop the other. A one-tile niche is 16 px and the body radius is 12, so a tight corner can stall the chase. That is a real exploit and it is not why depth 12 feels easy. The fight is over before pathing matters.

Poise, live `applyPoiseDamage`, Super Elite tier (360 poise, 0.30 taken, 0.32 s stagger, 4.8 s immunity):

| Family | Class amount | Hits to the first stagger | Time on the rare clock |
| --- | ---: | ---: | ---: |
| Sword light | 18 | 67 | ~21 s |
| Sword full charge | 52 | 24 | the hold makes this slower |
| Axe light | 28 | 43 | |
| Maul light | 40 | 30 | ~16 s at maul speed |
| Staff spell | 22 | 55 | |

The current fight is 1.6 s. Stagger never happens. A 75 s fight would stagger a sword about three times, under 2% of the clock. Stagger does not trivialize this encounter, and lengthening the fight will not make it the win condition.

Fear clears a tell that has not landed. Freeze cannot land (`statusHeavy`). Chill slow on a Super Elite is cut by `HEAVY_CHILL` (0.4). None of that is available in the first second.

## 7. Elite affixes

They are not on Super Elites.

```3270:3272:index.html
function applyEliteAffixes(e, opt) {
  opt = opt || {};
  if (!e || e.superElite || (e.T && (e.T.boss || e.T.superElite))) return null;
```

Stage 9 gave them a resist profile instead. Each profile sums to 0 and stays inside ±20. Physical ignores it. Fire moves a bolt by at most 20%, which at depth 12 is the difference between 0.63 s and 0.90 s. Bulwark, shroud, volatile, brand, and the rest never run. Putting champion affixes on a gate fight would add shroud immunity and stacked control on top of a body that already dies instantly. That is the wrong lever. The phase pattern (a power, then a brand) is the Super Elite's own pressure, and it currently does not get a turn.

Hellmouth, from Stage 9, does not delete the Super Elite. It bites 25% of the current shield once and marks +10% damage for 3 seconds. On a 322 pool the bite is about 7. It is not why the fight is short, and it should stay as it is.

## Open combat debts

They do not move this result much. None of them should be closed in a balance pass.

- **Crab shell versus bite.** The shell check is `T.ai === 'crab'`. Super Elites are not crabs.
- **Uncapped crit.** The reference kit is 16%. A four-slot high roll reached **77%** and cut the tap from 1.66 s to 1.01 s. After the proposal's 45× effective health that is about 45 s against the reference 74 s. Still a fight. Chance above 100% would only mean every hit crits. It would not multiply past the crit-hit number.
- **Curse life drain is not in leech.** Super Elites do not apply curse. The hex affix stores life drain 0.
- **Life steal uses the pre-mitigation number, and not bows or Fireball.** On a physical hit against a Super Elite there is no enemy armor, so pre-mitigation 53 healed 4.2 life at 8% leech and the post-mitigation hit was 52.5. The debt does not shorten the kill. Fireball does not leech, which is already how the hybrid clock was measured.

## Proposal

Three multipliers, each **1 at depths 1–4**, so life stays 80 / 102 / 119 / 133, tell ratios stay, and depth-1 power stays 19 at defense 0.

`t` is 0 through depth 4. From depth 5 to depth 12 it is `(d - 5) / 7` on the effective and damage ramps, and `(d - 4) / 8` on life. Life then stays at 4×. From depth 12 to depth 16 the effective multiplier and the damage multiplier finish their climb and then hold.

| | Depths 1–4 | Depth 5 | Depth 12 | Depth 16+ |
| --- | --- | --- | --- | --- |
| Life multiplier | 1 | 1.375 | **4** | 4 |
| Effective damage the player must deal | 1 | 4 | **45** | **58** |
| Fraction of a player hit that is kept | 1 | 0.344 | **0.089** | 0.069 |
| Outgoing damage multiplier | 1 | 2.5 | **5.5** | 7 |

Life is applied to the result of `seMaxHp717`, after the fade, so the early blend is untouched. Shield stays 10% of the new life.

The kept-fraction is applied in `resolveEnemyDamage` to player hits only, after resist and shock, before the round and before the shield. It is not a resist and it does not change the ±20 profiles. Depth 12 keeps **8.9%** of a player hit. That is the spongy part, and it is the cost of a 75 s sword fight without a 13,000 life bar.

Outgoing damage is `seDmg717` times the damage multiplier, then the existing tell ratios. Tell durations, the 0.25 s swing lock, the lane, and the circle radii stay.

Reference clock for the band: offensive rare, tap, no spell, fight level from the clear. Depth 12 at level 19 is 1.66 s instead of 1.63 s, so the same multiplier lands at 75 s.

| Depth | Life now → proposed | Pool | Tap now → proposed | Hybrid now → proposed | Band | Sword in band? |
| ---: | --- | ---: | --- | --- | --- | --- |
| 1 | 80 → 80 | 88 | 3.7 → 3.7 | 1.2 → 1.2 | 25–45 | no, left on the early tune |
| 4 | 133 → 133 | 146 | 2.5 → 2.5 | 0.9 → 0.9 | 25–45 | no, same reason |
| 5 | 141 → 194 | 213 | 2.4 → **9.4** | 0.9 → 3.6 | 45–65 | under the band, on purpose |
| 8 | 206 → 515 | 567 | 1.6 → 34 | 0.66 → 14 | 45–65 | under |
| 9 | 228 → 656 | 722 | 1.6 → **45** | 0.65 → 18 | 45–65 | at the floor |
| 10 | 249 → 809 | 890 | 1.6 → 54 | 0.64 → 21 | 65–85 | under |
| 12 | 293 → **1172** | **1289** | 1.63 → **73** | 0.63 → **28** | 65–85 | yes |
| 15 | 357 → 1428 | 1571 | 1.7 → 92 | 0.90 → 49 | 65–85 | just over the top |
| 16 | 379 → 1516 | 1668 | 1.65 → **96** | 0.90 → 52 | 85–105 | yes |
| 20 | 465 → 1860 | 2046 | 1.66 → 96 | 0.86 → 50 | 85–105 | yes |

Hybrid times are the short-fight ratio times the effective multiplier. Past about 20 s the mana pool empties and Fireball slows down, so the 28 s depth-12 figure is a few seconds short of the real weave. It is not in the 65–85 s band. The Ninth Psalm weave is about **20 s** at depth 12. A white Rune Blade tap becomes about **150 s**. That is the build spread: the band is the offensive rare sword, casters finish sooner, whites take about twice as long.

Threat after the damage multiplier, same rare armor. A power should be a mistake, not a one-shot.

| Depth | Player life | Power now → proposed | Share of life | Swing proposed |
| ---: | ---: | --- | ---: | ---: |
| 1 | 108 | 13 → 13 | 12% | 4 |
| 5 | 199 | 9 → 23 | 12% | 13 |
| 12 | 334 | 10 → **55** | **16%** | 33 |
| 16 | 415 | 11 → 77 | 19% | 49 |
| 20 | 486 | 13 → 91 | 19% | 49 |

Six eaten powers kill at depth 12. Eating every swing kills in roughly a dozen hits, on the order of 20 s, against a 73 s kill. A player who dodges most tells lives. A player who stands in them does not. Tell timing is unchanged, so the dodge that already works still works.

Boss pools, for scale. Boss shield is 25% of boss life.

| Floor | Boss pool | Proposed Super Elite pool |
| --- | ---: | ---: |
| 5 Mother Murk | 1050 | 213 |
| 10 The Gnawer King | 1706 | 890 at depth 10, **1289 at depth 12** |
| 15 The Drowned Bell | 2362 | 1571 |
| 20 Sister Vey | 3019 | 2046 |

The depth-12 bar stays under the depth-10 boss. Hellmouth's bite grows with the shield (about 29 of a 117 shield) and is still one nick on a 1172 life bar.

### Why not the literal early band

The provisional 25–45 s at depths 1–4 would multiply the Rusty Sword clock by about three (10.8 s → ~30 s) and the offensive rare by about ten. The last tune just set those four floors, and its success test was that a power tell still finishes. That test would still pass at 30 s, but it reopens a patch that was merged to stop early Super Elites from being either free or spiky. The data says the complaint starts when the Rune Blade and Fireball come online, not on floor 1. Leave 1–4 alone.

Hitting 45 s already at depth 5 is a **19×** step the floor after that protection ends (2.4 s → 45 s). The ramp above is a **4×** step (2.4 s → 9 s), then a climb that reaches the band at depth 12. Depths 5–8 stay under 45–65 s. That is deliberate.

### Behavior lever, separate

Do not shorten tells. The fair dodge is already the sidestep, and the window is large on purpose.

Optional, and not part of the numbers above: grow the power radius from 10 toward the high 20s so the sword's safe ring shrinks. A staff and a bow would still reach from outside it. That costs uptime on the power tell only, in phases 2 and 3, and it preserves the 1.3 s telegraph. It is a spacing fix, not a health fix. Shipping it together with the 45× effective health would double-count.

Do not add champion affixes to Super Elites.

### First playtest step

A 45× jump in one patch will feel like the hits stopped working (a 62-point swing becomes about 6). A sane first step is half the post-depth-4 effective multiplier (depth 12 around **35 s** of melee, hits kept around 18%). If that still feels like a speed bump, take the rest of the climb. If the small numbers feel wrong, stop there and do not force the 75 s band.

## Tests to add when this is implemented

Not added here.

- Depth 1 life is 80, depth 4 is 133, depth 5 is `round(141 * lifeMul(5))`, depth 12 is `round(293 * 4)`.
- Depth 5+ power ratio is still 1.7 and brand is still 0.85. Depth 1 power at defense 0 still rounds to 19.
- Offensive rare tap at depth 12, spread 1, the kit in this audit, lands in 65–85 s. The same kit at depth 16 lands in 85–105 s. Depth 1 Rusty tap stays under 15 s.
- A sidestep of the swing deals 0. Tell durations and the 0.25 s lock are unchanged.
- The kept-fraction does not apply to trash or bosses, and it is not a resist.
- Super Elites still have no affix. Hellmouth still does not delete them. The crab shell check is untouched.
- Record the white Rune Blade tap at depth 12. If it is past two minutes, the effective multiplier is too high for the loot that actually drops.
- Record The Ninth Psalm hybrid. It will be near 20 s. That is expected, not a miss, unless a follow-up specifically slows spell hits on Super Elites.

## Risks

- **Spongy hits.** Depth 12 keeps 9% of a player hit. The bar moves. The numbers look small. The half-step above is the way to find out if that is acceptable.
- **White gear runs long.** About 150 s at depth 12 if the offensive rare is the 73 s fight.
- **Casters stay ahead of the band.** Fireball and The Ninth Psalm finish several times faster. Closing that gap means a spell-only taken multiplier, which is a second patch and a real hit to the caster build. This proposal does not do it.
- **Depth 5 is the first fortified floor.** Four times the depth-4 sword clock, still far under a minute. Watch the first Super Elite after the early floors.
- **Boss comparison.** The proposed pools stay under the boss on the previous boss floor. If life is raised past 4× to make hits feel bigger, the Super Elite bar passes the boss. Do not do both a bigger bar and a harsher taken-fraction.
- **Hellmouth and the shield** scale up with life and remain a small fraction of the bar.
- **The four open debts** skew this measurement by less than the gap between a white blade and an offensive rare. Leave them open.
