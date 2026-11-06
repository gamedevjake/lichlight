# Top-tier damage audit

Analysis only. Measured on `analysis/toptier-damage-audit` from `playtest/combat-stage9` (`65588e6`), whose combat source is Stage 9 `a492023`. `index.html`, `version.json`, `main`, and PR #33 were not changed. No balance numbers in the game were edited.

Re-run with `node tests/audit-toptier.mjs`. It loads `index.html` in headless Chrome and calls the live spawn, `hurtPlayer`, `damageEnemy`, `seResolveTell`, `rollDmg`, and `leech` functions. The captured run is `tests/audit-toptier.result.json` (version **0.7.18**). Spread is locked at 1. Champion crit is off in the hit tables. Block is recorded as a chance and forced off for the per-hit number, because an 8% block would randomly print a 0.

## Finding

Early Super Elites feel harmless because their hits are small and their life total dies before the heavy tell matters. Mitigation is not the cause. A level 2 character with the starter armor still takes almost the full hit. The first boss already occupies the damage band the Super Elite heavy should occupy, which matches "the boss was fun."

A level 2 life total in this code is **70** with no gear, **70** at the median of a depth-1 clear, and **144** if every +life unique that character can wear is equipped at once. **198 life is not a result this branch produces at level 2.** It would require +128 life from mods. The tune below is aimed at the measured 70–104 band.

## Level 2 player

`maxHp = 50 + level * 10 + sum(mods.hp)`. Level 2 with empty mods is 70. `xpNeed(1)` is 30, so the depth-1 Super Elite's 62 xp levels a fresh character to 2 on that kill, with 32 xp toward the 87 needed for level 3.

There are no resistance mods on the affix table or on any unique. Every player resist at this stage is 0. Enemy shots from bosses, Super Elites, and casters stay Physical, so resist would not have applied anyway. Armor is `DEF / (DEF + 30)` and applies to Physical only. A full negate from a shield is a separate roll, capped at 40%.

| Kit | Life | DEF | Block | Armor kept | Damage | Period | Windup | Crit | Leech |
| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: |
| Naked fists | 70 | 0 | 0 | 100% | 2–4 | 0.450s | 0.054s | 5% ×2 | 0 |
| Rusty sword | 70 | 0 | 0 | 100% | 2–5 | 0.450s | 0.081s | 5% ×2 | 0 |
| Short sword, common, item level 1 | 70 | 0 | 0 | 100% | 3–6 | 0.450s | 0.081s | 5% ×2 | 0 |
| Hand axe, common | 70 | 0 | 0 | 100% | 4–8 | 0.500s | 0.140s | 5% ×2 | 0 |
| Short bow, common, item level 2 | 70 | 0 | 0 | 100% | 4–9 | 0.429s | 0.086s | 5% ×2 | 0 |
| Rusty + leather, cap, boots, buckler | 70 | 7 | 8% | 81% | 2–5 | 0.450s | 0.081s | 5% ×2 | 0 |
| All wearable +life uniques at once | 144 | 20 | 11% | 60% | 15–19 | 0.372s | 0.067s | 5% ×2 | 14% |

The 144-life kit is Grandsire Oswin, Tam's Coffin Lid, Lanternjaw, Bloodbound Signet, and Tam's Lantern Bead. Rootwake's +16 life sits on the weapon slot, so it cannot be worn with the sword. Regen at level 2 is 0.5 life per second. Ethereal Ward is a ×0.75 taken multiplier and is not available on a new character. Post-hit invulnerability is 0.45s, shorter than a Super Elite cycle (1.7s) and shorter than contact (1.1s).

Two hundred depth-1 clears (rusty sword, one chest, one Super Elite unique, sometimes one magic drop): life **min 70, median 70, p90 91, max 104**. Defense at the median was 0. The spike from that unique is damage and attack speed, not life.

Movement on an open floor was **62 px/s**, read by stepping the live player for one second.

## Incoming damage, depths 1–5

`hurtPlayer` on a live spawn. Every row matched the spawn formula (`formulaMatch` on all 40 rows). "Dealt" is the unblocked hit. "Armor" is the same hit at DEF 7 (the leather/cap/boots/buckler kit, 81% kept). Hits-to-kill use 70 life. Seconds assume you stand in every hit of that one attack.

Contact cadence is 1.1s (1.0s for a boss). Champions roll ×2.2 life and ×1.4 damage. Their contact cooldown stays 1.1s. Affixes do not multiply that damage. Champion crit, which is off in this table, is a separate 10% roll for +5% of the pre-armor amount after armor. On a 5-damage hit that bonus rounds to 0 or 1.

### Depth 1

| Enemy | Attack | Tell | Raw | Dealt | HTK | Armor dealt | Enemy HP |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Slime | contact | — | 3.75 | 4 | 18 | 3 | 12 |
| Slime champion | contact | — | 5.25 | 5 | 14 | 4 | 26 |
| Bat / rat | contact | — | 2.50 | 3 | 24 | 2 | 6 / 5 |
| Bat / rat champion | contact | — | 3.50 | 4 | 18 | 3 | 13 / 11 |

A slime that is allowed to bite every 1.1s needs 19.8s to kill a naked level 2. A champion slime needs 15.4s.

### Depth 2

| Enemy | Attack | Raw | Dealt | HTK | Armor | Enemy HP |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Slime | contact | 4.93 | 5 | 14 | 4 | 16 |
| Slime champion | contact | 6.90 | 7 | 10 | 6 | 35 |
| Skeleton | contact | 8.02 | 8 | 9 | 6 | 26 |
| Skeleton champion | contact | 11.22 | 11 | 7 | 9 | 57 |
| Ooze | contact | 6.41 | 6 | 12 | 5 | 33 |
| Ooze champion | contact | 8.98 | 9 | 8 | 7 | 73 |

### Depth 3

| Enemy | Attack | Tell | Raw | Dealt | HTK | Armor | Enemy HP |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Cultist | contact or bolt | bolt has none | 8.51 | 9 | 8 | 7 | 22 |
| Cultist champion | contact or bolt | — | 11.92 | 12 | 6 | 10 | 48 |
| Grave eel | contact or erupt | erupt 0.55s | 11.19 | 11 | 7 | 9 | 28 |
| Grave eel champion | contact or erupt | 0.55s | 15.66 | 16 | 5 | 13 | 62 |
| Skeleton | contact | — | 9.73 | 10 | 7 | 8 | 32 |
| Skeleton champion | contact | — | 13.62 | 14 | 5 | 11 | 70 |

### Depth 4

These are already in the boss-hop band. They are listed so the early Super Elite can be compared with them. No change is proposed here.

| Enemy | Attack | Tell | Raw | Dealt | HTK | Armor | Enemy HP |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Drowned | contact (puddle slows, 0 damage) | — | 12.95 | 13 | 6 | 10 | 61 |
| Drowned champion | contact | — | 18.13 | 18 | 4 | 15 | 134 |
| Bloater | blast, no contact | 0.90s | 18.70 | 19 | 4 | 15 | 28 |
| Bloater champion | blast | 0.90s | 26.19 | 26 | 3 | 21 | 62 |
| Zombie walker | heavy swing, no contact | 0.60s | 16.07 | 16 | 5 | 13 | 54 |
| Zombie champion | heavy swing | 0.60s | 22.49 | 22 | 4 | 18 | 119 |
| Skeleton champion | volatile burst | 0.70s | 7 | 7 | 10 | — | 84 |
| Skeleton champion | brand circle | 0.85s | 6 | 6 | 12 | — | 84 |

The elite volatile and brand bursts are capped at 30% and 22% of player life and, at this life total, come out smaller than the contact hit. They are not the threat.

### Depth 5 trash

| Enemy | Attack | Tell | Raw | Dealt | HTK | Armor | Enemy HP |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Archer | contact | — | 10.87 | 11 | 7 | 9 | 34 |
| Archer | one arrow (×0.8, three fly) | none | 8.70 | 9 | 8 | 7 | 34 |
| Archer champion | contact | — | 15.22 | 15 | 5 | 12 | 75 |
| Archer champion | one arrow | none | 12.18 | 12 | 6 | 10 | 75 |
| Wisp | shot after the blink | 0.50s | 10.87 | 11 | 7 | 9 | 26 |
| Wisp champion | shot | 0.50s | 15.22 | 15 | 5 | 12 | 57 |
| Drowned | contact | — | 14.66 | 15 | 5 | 12 | 70 |
| Drowned champion | contact | — | 20.52 | 21 | 4 | 17 | 154 |

## Super Elites

Live Bonewarden, `seDmg717` × the Stage 9 multiplier, then `hurtPlayer`. The swing row was also resolved by `seResolveTell`: standing on the lane took 6, standing 14px off the lane took 0. The hitbox and the damage function agree.

Phase 1 swings until half life. Phase 2 adds a power smash every third action. Phase 3 (quarter life) adds the brand. A fight that ends in phase 1 never shows the heavy.

| Depth | HP | Shield | Swing dealt (HTK) | Power (HTK) | Brand (HTK) | DEF 7 swing / power / brand |
| ---: | ---: | ---: | --- | --- | --- | --- |
| 1 | 56 | 6 | 6 (12) | 11 (7) | 5 (14) | 5 / 9 / 4 |
| 2 | 77 | 8 | 8 (9) | 14 (5) | 7 (10) | 7 / 11 / 6 |
| 3 | 98 | 10 | 10 (7) | 16 (5) | 8 (9) | 8 / 13 / 7 |
| 4 | 120 | 12 | 11 (7) | 19 (4) | 9 (8) | 9 / 15 / 8 |
| 5 | 141 | 14 | 13 (6) | 21 (4) | 11 (7) | 10 / 17 / 9 |

Tells, unchanged and worth keeping: swing 1.00s (locks at 0.25s, lane half-width 8px), then a 0.70s gap. Power 1.30s, radius 10, gap 0.90s. Brand 1.15s, radius 8, gap 0.75s. At 62 px/s the 0.75s after the swing locks is 46px of travel. At the 0.2 move floor it is 9.3px, which still clears the 8px half-width. The dodge is real. The failure just does not hurt.

Depth 1 power is 11. Mother Murk's hop, the attack the playtest liked, is 20. A depth-4 bloater champion blast is 26. The early heavy is the low one.

## Bosses

Bosses are placed on depths that divide by 5. Depth 5 is Mother Murk: patterns hop and summon, then ring. The other rows are the same live formula evaluated at that depth (`(8 + 2.2*(d-1)) * dmgBump(d, true)`, cycle 0, ×1 HP) so the early gap is visible. The depth-5 row was also hit on the spawned boss (840 life, 210 shield, base damage 18.144). Dealt numbers matched.

| Depth | Placed | Base | HP | Shield | Contact | Charge ×1.3 | Hop ×1.1 | Slam ×1.15 | Ring bullet ×0.7 |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | no | 8.64 | 420 | 105 | 9 | 11 | 10 | 10 | 6 |
| 2 | no | 11.02 | 525 | 131 | 11 | 14 | 12 | 13 | 8 |
| 3 | no | 13.39 | 630 | 158 | 13 | 17 | 15 | 15 | 9 |
| 4 | no | 15.77 | 735 | 184 | 16 | 21 | 17 | 18 | 11 |
| 5 | Murk | 18.14 | 840 | 210 | 18 | 24 | 20 | 21 | 13 |

Other pattern multipliers, same depth-5 base, same `hurtPlayer`: nova ×1.1 = 20, beam ×1.0 = 18, spread bolt ×0.7 = 13, spiral shot ×0.6 = 11, lob ×0.9 = 16. Enrage speeds movement and the pattern clock. It does not multiply damage. Awaken (2.8s) blocks poise and the next pattern. Contact during awaken still hurts.

Murk's hop is 4 hits on 70 life, on a 0.85s circle you can walk out of. That is the reference for a failed heavy. No boss number should move.

## Time to kill the Super Elite and the boss

Average of the live sheet min and max, non-crit, through `damageEnemy`, including the shield. Bow travel is extra: arrows move at 220 px/s, so a shot from 80px away adds about 0.36s once. The table is the attack cycle only.

| Weapon | Sheet | Period | Depth 1 SE | Depth 3 SE | Depth 5 SE | Murk (840+210) |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Fists | 2–4 | 0.450s | 9.5s / 21 hits | 16.2s | 23.4s | 157.5s |
| Rusty sword | 2–5 | 0.450s | 7.2s / 16 | 12.1s | 17.5s | 118.4s |
| Short sword, common | 3–6 | 0.450s | 5.9s | 9.9s | 13.9s | 94.5s |
| Hand axe, common | 4–8 | 0.500s | 5.5s | 9.0s | 13.0s | 87.5s |
| Short bow, common | 4–9 | 0.429s | 3.9s | 6.9s | 9.9s | 64.4s |
| Rare sword, +damage (Bone Fang) | 4–7 | 0.450s | 5.0s | 8.1s | 11.7s | 78.8s |
| Rare sword, +haste (Rot Brand) | 3–6, 1.07 aspd | 0.421s | 5.5s | 9.3s | 13.1s | 88.4s |
| Grandsire Oswin | 10–14, 1.21 aspd | 0.372s | 2.2s / 6 | 3.3s | 4.8s | 32.7s |
| Gravedigger's Due | 12–18, 18% crit | 0.500s | 2.5s | 4.0s | 5.5s | 35.0s |
| Scream of the Banshee | 11–17, 16% crit | 0.429s | 2.1s | 3.4s | 5.1s | 32.2s |

Grandsire at depth 1 spends the shield on the first hit and crosses half life on hit 4 (1.5s). The power tell is 1.3s. The kill lands at 2.2s, so the heavy often never resolves. That is the "dies fast" report, and it is the unique, not the rusty sword. The rusty sword does reach phase 2 (7.2s total) and still only loses 11 life if it eats the power.

A common bow kills the depth-1 Super Elite faster than a rusty sword (3.9s vs 7.2s) because 4–9 averages higher than 2–5. The playtest jump is the unique sword after that bow: shorter cycle, shorter windup, no flight time, and a power attack the bow refuses.

## Root cause

Four layers, in the order they showed up in the measurements.

1. **Attack values.** Depth-1 Super Elite base damage is 6.44. Swing keeps it (6 dealt). Power is ×1.7 (11). Brand is ×0.85 (5), which is softer than the swing. Murk's hop is 20. A depth-4 champion bloater is 26. The early heavy is simply a small number.

2. **Mitigation is a small share of that.** DEF 7 turns the depth-1 power from 11 into 9. Block is an 8% full negate, not a damage cut. Resists are 0. The 0.45s iframe does not cover the 1.7s cycle. Armor and block are not why the fight feels safe.

3. **The tell works, and a clean dodge deals 0.** `seResolveTell` dealt 6 on the lane and 0 six pixels outside the half-width. Standing in the failure case is optional, and the failure case is 11 life (16% of 70, 11% of the 104-life clear).

4. **The heavy is gated behind a life total the unique deletes.** Phase 2 starts at half of 56. Grandsire's 12-damage swings finish the fight inside one power windup. Hellmouth's ×1.10 mark and 25% shield bite make that kill slightly faster. They are not the reason the hits are soft.

Stagger is not a practical answer on this enemy. Super Elite poise is 360 with a 0.30 taken multiplier. A sword light is 18 poise, so **67** connecting swings are required before `stagger` lands and `clearActorWindup` drops the tell. The whole fight is 6 to 16 hits. The cancel itself works (the 67th hit did stagger). It just does not come up. Incoming Super Elite swings are skill-class poise (8). The player staggers on swing 18, long after 70 life is gone if they are eating hits, and irrelevant if they are dodging.

## Sword speed and stacking

No unintended double stack showed up on the live swing.

Attack period is `0.45 / aspd`, and `aspd = weapon.spd * (1 + sum(ias) / 100)`. The family windup is a fraction of that period (sword 0.18, bow 0.20, axe 0.28). It does not multiply damage. A 10-damage packet dealt 10 with `weaponFamily: 'sword'` and 10 with `weaponFamily: 'axe'`.

Grandsire's 21% increased attack speed plus a ring's 10 and a cap's 10 produced aspd **1.41**, which is `1 * (1 + 41/100)`. One sum. The sword alone is 1.21, period 0.372s, windup 0.067s. A rolled rare haste sword in the same audit was only 1.07. The responsiveness the playtest liked is this unique, applied once.

Crit on the live path is applied once. `rollDmg` multiplies, then `damageEnemy` is called with `critApplied: true`, and the dealt hit equals that product. One captured pair: base 11, multiplier 2, rolled 22, dealt 22. Calling the resolver again with `critPending` on that already-doubled 22 dealt 44. That second multiply is a footgun for a caller who sets both. The sword and the bow do not. Crit chance itself has no cap (`critChance` is the sheet plus a skill mod). That remains the open debt, and it is not what makes Grandsire fast today (Grandsire is 5% crit).

Life steal reads the pre-mitigation number. At 6% leech, a 12-damage roll healed 0.72, while a ram (armor ×0.4) took 5 from that same 12. Bows call `noteLeechSkip` and heal 0. Curse `lifeDrain` is stored and `curseHooks` reports `lifeDrainWired: false`.

Grandsire's 10–14 sheet at level 2 is the designed unique stack, all visible, none doubled: item-level scale 1.06, the unique's extra ×1.3 on the base, flat +6 damage (the mod scaled by 1.05), and `floor(level/2) = 1`. The flat +6 on a 3–7 base is the damage jump. Combined with 21% attack speed it is a large weapon. It is just available on the first Super Elite, the same kill that reaches level 2, which is the level the unique requires.

## Proposed values

Change the early heavies, and give the depth-1 Super Elite enough life that one of those heavies can finish winding up. Leave the swing, the tells, the boss, trash contact, sword timing, and Hellmouth where they are.

`fade(d) = max(0, 1 - (d - 1) / 4)`. It is 1 at depth 1 and 0 at depth 5.

- Power multiplier `1.7 + 1.3 * fade(d)`. Depth 5 stays ×1.7.
- Brand multiplier `1.15 + 0.85 * fade(d)`. Depth 5 becomes ×1.15, up from ×0.85, so the brand stays a real hit and stays under the power.
- Swing multiplier stays 1.
- The last factor inside `seMaxHp717` becomes `1.4 + 1.4 * fade(d)`. Depth 1 is ×2.8 a champion. Depth 5 stays ×1.4. Shield stays 10% of that life.

The dealt numbers below were passed through `hurtPlayer` at DEF 0. The DEF 7 column is the same round the live armor hits matched (`raw * 30/37`).

### Damage before / after, naked 70 life

| Depth | Swing now → proposed (HTK) | Power now → proposed (HTK) | Brand now → proposed (HTK) | Power at DEF 7 |
| ---: | --- | --- | --- | ---: |
| 1 | 6 → 6 (12 → 12) | 11 → **19** (7 → 4) | 5 → **13** (14 → 6) | 16 |
| 2 | 8 → 8 (9) | 14 → **22** (5 → 4) | 7 → **14** (10 → 5) | 18 |
| 3 | 10 → 10 (7) | 16 → **23** (5 → 4) | 8 → **15** (9 → 5) | 18 |
| 4 | 11 → 11 (7) | 19 → **22** (4 → 4) | 9 → **15** (8 → 5) | 18 |
| 5 | 13 → 13 (6) | 21 → **21** (4) | 11 → **14** (7 → 5) | 17 |

Depth-1 power at 19 is one point under Murk's hop (20) and under a depth-4 champion bloater (26). Four clean failures kill a naked level 2. Three failures leave them at 13 life. On the measured depth-1 clear (life 70–104) that is 4–6 failures. On the 144-life trophy kit it is 8. A reported 198 would be 11, and this branch does not produce that life total.

The brand at 13 is the smaller circle: two failures short of a power, still above the swing, still walkable in 1.15s.

### Life and time to kill before / after

| Depth | HP now → proposed | Shield | Rusty now → proposed | Grandsire now → proposed |
| ---: | --- | ---: | --- | --- |
| 1 | 56 → **112** | 6 → 11 | 7.2s → **13.9s** (16 → 31 hits) | 2.2s → **4.1s** (6 → 11) |
| 2 | 77 → **135** | 8 → 14 | 9.9s → **17.1s** | 3.0s → **4.8s** |
| 3 | 98 → **147** | 10 → 15 | 12.1s → **18.4s** | 3.3s → **5.2s** |
| 4 | 120 → **151** | 12 → 15 | 14.8s → **18.9s** | 4.1s → **5.2s** |
| 5 | 141 → **141** | 14 → 14 | 17.5s → 17.5s | 4.8s → 4.8s |

At depth 1, Grandsire crosses half of 112 on hit 6 (2.2s). The power tell can then finish at about 3.5s, and the kill is at 4.1s, so one failed power lands and the sword still ends the fight well ahead of the rusty sword's 13.9s. Murk stays at 118s on that rusty sword. The Super Elite remains the shorter fight.

Keep these as they are while applying the numbers above:

- Sword period `0.45 / aspd` and the 0.18 windup fraction.
- Bow period, bow flight, and the rule that a bow draw is not a power attack.
- Tell durations, lock times, lane width, and circle radii. The depth-1 swing dodge was measured at 6 damage on the lane and 0 off it.
- `clearActorWindup` when a stagger does land. Do not spend this change on Super Elite poise. Sixty-seven lights to stagger is what keeps the tell as the counterplay.
- Boss life, boss shield, hop, contact, and the other pattern multipliers.
- Trash and champion contact, including the depth-4 blasts that already hit for 19–26.
- Hellmouth's mark and bite.

## Unique-drop progression

Separate from the damage tune. The early unique is why a bow turns into a much faster sword on floor 1.

`seLoot717` calls `bossUnique(depth)` on every Super Elite death, then 25 gold, a ration, and a 6.5% gate key. `killEnemy` grants the 62 xp before that drop. A fresh character hits level 2 on the depth-1 kill, and every unique in the depth-1 pool has required level 2, so the drop can be worn on the same frame.

The depth-1 pool, from `eligibleUniques(1)`, includes Grandsire Oswin (10–14, 21% attack speed, 6% leech), Gravedigger's Due (12–18, 18% crit), and the three unique bows (Scream of the Banshee 11–17 with 16% crit, Spine of the First Lich, Hellmouth Strider). Those are the weapons in the time-to-kill table that finish a Super Elite in about 2 seconds. A rare sword from the same floors rolled around 4–7 damage and, in the haste sample, 7% attack speed. The unique is a different tier, handed out by the first gate.

`bossUnique` can also rewrite `item.lvl` back to the asked level after rolling stats at `L+k`, when the unique pool at `L` is empty. Thirty depth-1 drops in this run all stayed item level 1, because that pool is not empty. The rewrite is latent. If it ever fires, the mods keep the higher level's scale. Worth fixing whenever loot is next touched, and it is not what produced this playtest.

Recommendation:

- Depths 1 and 2: the Super Elite drops a **rare**, using the same `makeItem(depth, 2)` path chests already use for rares, and does not call `bossUnique`. Gold, ration, and the gate-key roll stay.
- The depth-5 boss stays the first guaranteed unique, with the rare and magic drops it already has.
- From depth 3 on, a Super Elite may drop a unique again. By then the player has seen the boss's hop and the floor's own champions, and a 4–5s unique kill sits next to a heavy that deals about 23.
- Leave Grandsire's attack speed and damage alone. The sword should still feel like that when it shows up at the boss.

That keeps a floor-1 Super Elite as a fight and a rare drop, and keeps the unique as the thing the first boss pays.

## Outstanding debts

These are real and they are outside this tune. Stage 9 already listed them. This run confirmed the ones that touch the numbers above.

- **Crit chance is uncapped.** `critChance` adds the sheet to the skill mod and stops there. The live sword applies the ×2 once. A caller that sets `critPending` on an already-multiplied amount applies it twice (22 became 44 in this run).
- **Curse life drain is not wired.** `curseHooks` reports `lifeDrainWired: false`. The outgoing curse penalty and the resist cut do run.
- **Life steal uses the pre-mitigation amount**, and bows, Fireball, and Frost Nova skip it. The ram check healed 0.72 from a 12 roll that the ram's armor reduced to 5.
- **The vault crab** still ignores damage while shelled. It first appears at depth 14, so it is not part of the depth 1–5 threat gap.

## How to read a follow-up

`node tests/audit-toptier.mjs` rewrites `tests/audit-toptier.result.json`. The loot trial is random, so the 70 / 91 / 104 life spread will move by a few points. Spawn damage, the Super Elite resolver, and the proposal's `hurtPlayer` results should match the tables above as long as `index.html` is the Stage 9 combat source.
