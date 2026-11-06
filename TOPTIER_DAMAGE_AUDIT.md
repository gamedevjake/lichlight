# Top-tier damage audit

Analysis only. Measured on `analysis/toptier-damage-audit` from `playtest/combat-stage9` (`65588e6`), whose combat source is Stage 9 `a492023`. `index.html`, `version.json`, `main`, and PR #33 were not changed. No balance numbers in the game were edited.

Re-run with `node tests/audit-toptier.mjs`. It loads `index.html` in headless Chrome and calls the live spawn, `hurtPlayer`, `damageEnemy`, `seResolveTell`, `rollDmg`, and `leech` functions. The captured run is `tests/audit-toptier.result.json` (version **0.7.18**). Spread is locked at 1. Champion crit is off in the hit tables. Block is recorded as a chance and forced off for the per-hit number, because an 8% block would randomly print a 0.

## Finding

Early Super Elites feel harmless because their hits are small and their life total dies before the heavy tell matters. Mitigation is not the cause. A level 2 character with the starter armor still takes almost the full hit. The first boss already occupies the damage band the Super Elite heavy should occupy, which matches "the boss was fun."

A level 2 life total with no gear is **70**. A full loot of depths 1 and 2, with the one Super Elite a level 2 character is allowed to kill, lands at **74 median, 91 at p90, 102 at p99, 111 at the max** of 240 generated floors. **198 did not occur.** It is 87 life past that max. The heavy-hit tune stays on this 74–111 band.

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

Two hundred depth-1 clears (rusty sword, one chest, one Super Elite unique, sometimes one magic drop): life **min 70, median 70, p90 91, max 96** on this run (the trial before it topped out at 104). Defense at the median was 0. The spike from that one unique is damage and attack speed, not life.

Movement on an open floor was **62 px/s**, read by stepping the live player for one second.

## Why a level 2 reading can say ~198

The number on screen is current life, and current life is clamped to `maxHp`. It is not shield, ward, barrier, or a second pool.

| Surface | What it prints | Level 2, no gear, in `playtest.html` |
| --- | --- | --- |
| Desktop globe (`#deskHud .dh-globe.hp b`) | `Math.ceil(p.hp)` | **70** |
| Character line (`paintChar`) | `LIFE current/max` | **LIFE 70/70** |
| Same character line, level | `LEVEL` + `p.lvl` | **LEVEL 2** |
| Touch heart badge `#nHP` | `p.hpPot`, and only while touch mode is on | Desktop left the badge at its HTML default **0**. Potions were 3. The badge is not life. |
| Barrier | separate absorb, not added into the globe | 0 |

`playtest.html` does not change the life formula. The boot script prefixes `localStorage` and sets image CORS. Checked live, in that frame:

| Playtest action | Level | Life | Max |
| --- | ---: | ---: | ---: |
| New run | 1 | 60 | 60 |
| Set level to 2 and recompute | 2 | 70 | 70 |
| God mode | 2 | 70 | 70 |
| Heal | 2 | 70 | 70 |
| Set depth to 4 (`startFloor(4, true)`) | 2 | 70 | 70 |
| Dev menu Short Sword | 2 | 70 | 70, damage 3–6 |

God mode sets `isInvincible` and `shiftT = 1e9`, and fills hunger, thirst, and rest. It writes life only when life is already below 1, and then it writes `maxHp`. Heal assigns `hp = maxHp` and `mp = maxMp`. Depth and the dev sword call `computeStats()`. None of them add a life mod. Stage 10 affixes are not in this build.

`maxHp = 50 + 20 + sum(mods.hp)` at level 2, so 198 means **+128 life from gear**. Hand-building the single best legal piece for every slot and equipping them does return **207**. The floors do not hand you that set.

A fresh character who clears both early floors for real was run 240 times. Each trial generated the floor, took every placed item (sealed rooms, vaults, islands), opened every keyed chest at the live 50% item gate, rolled champion whites, rolled the depth-2 gilt secret chest at its 55% / 20% unique rate, and added the depth-1 Super Elite unique. Anything with required level above 2 stayed in the bag. Best life per slot was equipped. There is no percent-life mod, no socket, and no set bonus. One Bone Pendant whose mod was 20 produced max life 90, which is 70 + 20 with nothing left over, so `computeStats` does not count a life mod twice.

| | Life |
| --- | ---: |
| Minimum | 70 |
| Median | 74 |
| p90 | 91 |
| p99 | 102 |
| Maximum | 111 |
| Runs at 190 or 198 | 0 of 240 |

The best single run was 111: Lanternjaw +21 from the Super Elite, a white Bone Pendant +10, a magic broad sword +10 life, and a magic armor with no life. That is +41, not +128.

What the earlier one-chest trial missed, and what still does not reach 198:

| Source | On depths 1–2? | What it adds |
| --- | --- | --- |
| Super Elite `bossUnique(depth)` | Yes, and the stairs are locked until it dies | One unique. Item level equals the depth. The life uniques that fit at level 2 are about +21. |
| Keyed chests | 1–3 a floor, half of them drop gear while level ≤ 2 | Item level depth+1. Depth 2 is item level 3. |
| Sealed rooms, vaults, islands | Placed on the floor | Same chest table, or one step higher. |
| Gilt secret chest | Depth ≥ 2, 55% of floors | `makeItem(depth+2)`, 20% unique. Depth 2 is item level 4. Required level is 3 or 4, so a level 2 character cannot wear it. |
| Hollow Pedlar | Boss floors only. `placeShop` returns immediately when the depth is not a boss depth. | Not on floors 1–2. The earlier shop sample was a source this play never meets. |
| Second Super Elite | The kill is legal. Staying level 2 is not. | Depth-1 elite is 62 xp and reaches level 2 with 32/87. Depth-2 elite is 76 xp. 32+76 crosses 87. Both elites end at **level 3** with 21 xp left. |

Killing the second elite and then wearing everything of required level ≤ 3, including that unique, was in the same 240 runs. Life at level 3 was **80 minimum, 101 median, 155 maximum**. Hollowmere Mail is about +44 and requires level 3, so it arrives on the kill that leaves level 2. 155 is still 43 short of 198.

Required level is enforced. `equipFrom` and the empty-slot auto-equip both call `canWear`. The best level-2 run had a generated piece it was not allowed to put on. Save and load run `computeStats` once from the items. No second copy of a mod is added.

The number 198 at character level 2 is not a drop path in this build. Two readings fit an honest run that never opened the dev menu. The satchel stamps **LV** and the item's level on the gear card, separate from **LEVEL** on the character line, so a level-2 item can sit next to a much higher life total. Character level 14 is base life 190 (`50 + 14*10`). One small life roll makes 198, and that is an ordinary mid-dungeon total, not an early one. The early band to tune against is **74–111**.

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

3. **The tell works, and a clean dodge deals 0.** `seResolveTell` dealt 6 on the lane and 0 six pixels outside the half-width. Standing in the failure case is optional, and the failure case is 11 life (16% of 70, about 11% of a 100-life clear).

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

Keep the heavy-damage increases. Cut the life bump from the earlier 112 draft down to **80** at depth 1, then fade it out so depth 5 stays 141. Leave the swing, the tells, the boss, trash contact, sword timing, and Hellmouth where they are.

`fade(d) = max(0, 1 - (d - 1) / 4)`. It is 1 at depth 1 and 0 at depth 5.

- Power multiplier `1.7 + 1.3 * fade(d)`. Depth 5 stays ×1.7.
- Brand multiplier `1.15 + 0.85 * fade(d)`. Depth 5 becomes ×1.15, up from ×0.85, so the brand stays a real hit and stays under the power.
- Swing multiplier stays 1.
- Life is `round(currentLife * (1 + (80/56 - 1) * fade(d)))`, and depth 5 is left on the current 141. Shield stays 10% of that life.

The dealt numbers below were passed through `hurtPlayer` at DEF 0. Hits-to-kill are on 70 life. The DEF 7 column is the same round the live armor hits matched (`raw * 30/37`).

### Heavies, naked 70 life

| Depth | Power now → proposed (hits to kill) | Brand now → proposed (hits to kill) | Power at DEF 7 | Life now → proposed | Shield |
| ---: | --- | --- | ---: | --- | ---: |
| 1 | 11 → **19** (7 → 4) | 5 → **13** (14 → 6) | 16 | 56 → **80** | 6 → 8 |
| 2 | 14 → **22** (5 → 4) | 7 → **14** (10 → 5) | 18 | 77 → **102** | 8 → 10 |
| 3 | 16 → **23** (5 → 4) | 8 → **15** (9 → 5) | 18 | 98 → **119** | 10 → 12 |
| 4 | 19 → **22** (4 → 4) | 9 → **15** (8 → 5) | 18 | 120 → **133** | 12 → 13 |
| 5 | 21 → **21** (4) | 11 → **14** (7 → 5) | 17 | 141 → **141** | 14 → 14 |

Depth-1 power at 19 is one point under Murk's hop (20). Four clean failures kill a naked level 2. On the measured depth-1 clear (about 70–100 life) that is 4–6 failures. On a hand-built 207-life set that the floors do not drop, it is 11. Swing damage does not move, so the basic sidestep stays a 6.

### Time to kill, and whether a power tell finishes

A power "lands" here if the fight, after life crosses 50%, still has **1.30s** left. That is the power's tell, started the moment phase 2 begins, while the player keeps swinging. Brand is later (25% life) and is the second punish, not the one this column is counting. Times use the proposed life and shield and the live sheet average. The max column is the top of that weapon's damage roll.

| Depth | Weapon | Damage | Time to kill | Window after half life | Power finishes |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | Rusty sword | 4 (max 5) | 9.9s | 4.5s | yes |
| 1 | Short sword, common | 5 (max 6) | 8.1s | 3.6s | yes |
| 1 | Rare sword, +damage | 6 (max 7) | 6.8s | 3.2s | yes |
| 1 | Grandsire Oswin | 12 (max 14) | 3.0s | 1.5s (max roll 1.1s) | yes on the average, no on a 14 |
| 2 | Rusty / common / rare | 4 / 5 / 6 | 12.6s / 10.3s / 8.6s | 5.4s / 4.5s / 3.6s | yes |
| 2 | Grandsire | 12 (max 14) | 3.7s | 1.5s (max roll 1.1s) | yes on the average, no on a 14 |
| 3 | Rusty / common / rare / Grandsire | 4 / 5 / 6 / 12 | 14.8s / 12.1s / 9.9s / 4.1s | 6.7s / 5.4s / 4.5s / 1.9s | yes, including Grandsire's 14 |
| 4 | Rusty / common / rare / Grandsire | 4 / 5 / 6 / 12 | 16.6s / 13.5s / 11.2s / 4.8s | 7.6s / 6.3s / 4.9s / 2.2s | yes, including the 14 |
| 5 | Rusty / common / rare / Grandsire | 4 / 5 / 6 / 12 | 17.5s / 13.9s / 11.7s / 4.8s | 7.6s / 6.3s / 4.9s / 1.9s | yes, including the 14 |

80 is the right depth-1 life, not 112 and not a further bump. Rusty stays at **9.9s** (22 hits), which is a gate and not a long slap fight. Common and rare leave 3–4 seconds after half life, enough for two power tells. Average Grandsire (12 damage, 0.372s) still has **1.5s** after half life, so the 1.30s tell resolves once, and the sword is still three times faster than the rusty sword. A 14-damage Grandsire roll has 1.1s left and kills during the tell. That is the top of the unique's range doing the thing the unique is for. Raising depth 1 to about 90 would catch that one roll and would push the rusty fight to about 11s. 80 already gives every ordinary weapon, every rare in this table, and the average unique a finished power. Depth 5 is unchanged, so a late unique fight stays 4.8s next to a power that already deals 21.

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

Gold (25), the ration, and the 6.5% gate key stay on every Super Elite. A missed unique is still a rare from `makeItem(depth, 2)`. Bosses keep the guaranteed unique they already drop. Grandsire's attack speed and damage stay as they are for when that boss pays one out.

| Depth | Super Elite unique chance | If it misses | Boss unique | Expected uniques from SEs so far | Expected uniques including bosses |
| ---: | ---: | --- | --- | ---: | ---: |
| 1 | **0%** | guaranteed rare | — | 0 | 0 |
| 2 | **0%** | guaranteed rare | — | 0 | 0 |
| 3 | **20%** | rare | — | 0.20 | 0.20 |
| 4 | **35%** | rare | — | 0.55 | 0.55 |
| 5 | **50%** | rare | **100%** (first guaranteed) | 1.05 | **2.05** |
| 6–9 | **70%** | rare | 100% on boss floors | — | — |
| 10+ | **100%** | — | 100% on boss floors | — | — |

Chance of no Super Elite unique before the depth-5 boss is `0.80 * 0.65 = 0.52`. Chance the boss is the first unique at all, counting the depth-5 Super Elite's own 50%, is `0.80 * 0.65 * 0.50 = 0.26`. The boss is the first drop that cannot miss. The two floors before it are allowed to spike, and together they average 0.55 uniques. From depth 6 the Super Elite is a unique most of the time, and from depth 10 it is a unique every time, so the gate stays a reward after the player already has the boss drop.

## Early life against the approved heavies

Power 19 and brand 13, Super Elite life 80 at depth 1. Hits-to-kill use the measured level-2 band, not the 198 report.

| Life | Where it comes from | Powers of 19 to die | Brands of 13 to die |
| ---: | --- | ---: | ---: |
| 70 | No gear | 4 | 6 |
| 74 | Median full clear of floors 1–2 | 4 | 6 |
| 91 | p90 | 5 | 7 |
| 102 | p99 | 6 | 8 |
| 111 | Best of 240 clears | 6 | 9 |
| 198 | Not produced at level 2 | 11 | 16 |

A median clear's weapon in these runs is a common or magic sword around 4–8 damage. Against 80 life and an 8 shield that is about 15 hits and about 7 seconds, and the power tell has several seconds left after half life. The best clear's broad sword was 6–11 and still finished inside about 5 seconds. Raising the heavies again to threaten 198 life would make the character these floors actually create die in two hits. The 19 / 13 / 80 package already does that job for 74–111 life.

## Loot corrections

These are the changes that match the drops. They are not more enemy damage.

| Change | Now | Proposed |
| --- | --- | --- |
| Super Elite unique, depths 1–2 | 100% via `bossUnique` | **0%.** Guaranteed rare (`makeItem(depth, 2)`). Gold, ration, and the 6.5% gate key stay. |
| Super Elite unique, depths 3, 4, 5 | 100% | **20%, 35%, 50%**, otherwise the same rare. Depth-5 boss stays the first 100% unique. |
| Super Elite unique, depths 6–9 / 10+ | 100% | **70% / 100%** |
| Required level for magic and rare | Any item level ≤ 3 is required level 1, so a depth-2 chest (item level 3) is wearable at level 1 | Whites keep that shortcut. Magic and rare use the existing formula. An item level 3 rare then requires level 3. |
| Gilt secret chest before depth 5 | `makeItem(depth+2)`, 20% unique. Depth 2 rolls item level 4. | `makeItem(depth+1, 2)`, rare only, until depth 5. From depth 5, 20% unique at item level `depth+1`. |

No life mod is counted twice, and required level is already checked on equip. The Bone Pendant's +10 implicit does add to a life affix when one rolls: sampled rares reached **+27**, and `computeStats` added that 20-point example once (life 90). That piece is rare and, under the required-level change above, a rare pendant of item level 3 waits until level 3. A white pendant is still +10 and still wearable.

After the depth 1–2 unique is removed, the best sampled clear loses its +21 Lanternjaw and falls from 111 into the 90s. The median, which usually did not roll a life unique, stays near 74. Power 19 remains a four-to-six hit mistake on that band.

## Fireball mana

Holding Fireball does spend mana. There is no missed deduction, no refund of the cast, and no second pool. A level 2 character with full thirst and rest, no gear, was stepped for 8 seconds while `castSkill(0)` fired whenever the cooldown allowed.

Fireball's sheet cost is **4** mana and its cooldown is **0.45s**. `manaCost` returns 4 when thirst and rest are above empty. Mana regen is `1.4 + level * 0.1` per second and does not read gear. At level 2 that is **1.6 per second**. The pool is `20 + level * 5 + mods.mp`, so **30** with no gear.

| Second | Mana left | Casts so far |
| ---: | ---: | ---: |
| 0 | 30 | 0 |
| 1 | 23.6 | 2 |
| 2 | 17.2 | 4 |
| 3 | 10.8 | 6 |
| 4 | 4.4 | 8 |
| 5 | 2.0 | 9 |
| 8 | 2.8 | 10 |

Spent over those 8 seconds: 40 mana, exactly 10 casts at 4. End mana 2.8 matches `30 - 40 + 1.6 * 8`. The button can be held at 1/0.45 ≈ **2.2 casts per second** until the pool is gone, which is about **4 seconds** from full. After that the sustainable rate is `1.6 / 4 = 0.4` casts per second, one Fireball every 2.5 seconds, whenever regen has saved up another 4. That is the whole "little depletion" feeling if the player is tapping rather than holding: four taps is 16 mana, and 1.6 per second puts it back in 10 seconds.

Eye of the Choir, a depth-1 unique, is the case that actually looks bottomless for a while. At item level 1 it is **+53 mana** (pool 83) and **+3 mana per kill**. The same 8-second hold cast 16 times, spent 64, and ended at 31.8, again matching cost plus regen. The pool would last about `(83) / (4/0.45 - 1.6) ≈ 11 seconds` of holding. One cast then one kill, with experience zeroed so the kill could not level, went **83 → 79 → 82**. The cast removed 4. The kill put 3 back. Net −1, plus regen. A level-up is a separate refill: `gainXp` sets mana to the new maximum. A pull that levels and drops Eye of the Choir will look like Fireball is free. The cast itself is not free.

Empty thirst raises the cost to **7** (`ceil(4 * 1.6)`). Empty rest raises it to **8** (`ceil(4 * 2.0)`). Both empty is **11** (`ceil(4 * 2.6)`). Those make the pool smaller, not larger. Playtest Heal and a fresh `startFloor` do refill mana to max. That is the dev button and a new floor, not the combat drain.

## Outstanding debts

These are real and they are outside this tune. Stage 9 already listed them. This run confirmed the ones that touch the numbers above.

- **Crit chance is uncapped.** `critChance` adds the sheet to the skill mod and stops there. The live sword applies the ×2 once. A caller that sets `critPending` on an already-multiplied amount applies it twice (22 became 44 in this run).
- **Curse life drain is not wired.** `curseHooks` reports `lifeDrainWired: false`. The outgoing curse penalty and the resist cut do run.
- **Life steal uses the pre-mitigation amount**, and bows, Fireball, and Frost Nova skip it. The ram check healed 0.72 from a 12 roll that the ram's armor reduced to 5.
- **The vault crab** still ignores damage while shelled. It first appears at depth 14, so it is not part of the depth 1–5 threat gap.

## How to read a follow-up

`node tests/audit-toptier.mjs` rewrites `tests/audit-toptier.result.json`. The loot trial is random, so the 70 / 91 / ~100 life spread will move by a few points. Spawn damage, the Super Elite resolver, and the proposal's `hurtPlayer` results should match the tables above as long as `index.html` is the Stage 9 combat source.
