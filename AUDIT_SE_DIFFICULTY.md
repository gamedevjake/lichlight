# Super Elite difficulty audit

Audit only. Gameplay was not changed. `version.json` is still **0.7.18**. Measured on `main` at `e830a531865fbc72ea3db6a632d720e65ac524e2`, which already has the merged midgame half-ramp (`SE_LIFE_TABLE`, `SE_TAKEN_TABLE`, `SE_DMG_TABLE`).

Numbers come from `tools/audit/se-difficulty.html`, run headless by `tools/audit/run-audit.mjs`. The harness calls the live spawn, damage, tell, and poise functions. Spread is fixed at 1. Block is recorded and then not rolled, same as the midgame prototype. Raw output is `tools/audit/out/se-difficulty.json`.

Fight levels are the levels a full clear actually reaches in the loot audit (8 playthroughs): depth 3 at **6**, depth 5 at **9**, depth 8 at **13**, depth 12 at **20**. Depth 12 life is **1172** and the shield is **117**, the same pools as the merged half-ramp.

## What the three tables do at these depths

Nothing derives one table from another. `seLerpTable` draws a straight line between anchors and holds the last anchor after that. Depths 1–4 sit on the first anchor, which is 1.

| Depth | Life × | Taken | Damage × | Life | Shield (10%) |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | 1 | 1 | 1 | 119 | 12 |
| 5 | 1.375 | 0.55 | 2.5 | 194 | 19 |
| 8 | 2.5 | 0.288 | 3.786 | 515 | 52 |
| 12 | 4 | 0.186 | 5.5 | 1172 | 117 |

Taken is the fraction of a player hit the Super Elite keeps, after resist and shock, before the round. Damage multiplies `seBaseDmg717` before the tell ratios (swing ×1, power ×1.7, brand ×0.85 from depth 5 on). The intro (drop plus taunt) is **1.14s** of immunity before any of this starts. That time is not in the kill clocks below.

## Encounter duration

Three builds, plus a white-sword control that lines up with the published half-ramp:

- **Melee.** Best sword at item level = depth (Broad Sword, then Rune Blade from depth 8), rare median damage / attack speed / crit, rare armor.
- **Caster.** Best staff (Gnarled, then Archon from depth 8), rare spell power, same rare armor, Fireball whenever 4 mana is up, plus staff melee.
- **Undergeared.** Rusty Sword, nothing else, at the fight level.
- **White sword.** On-level white sword, no armor. Control only.

"Stand" eats every tell. "Kite" stands outside the power circle and off the swing line, which is still inside sword reach (reach 24 + body 12 = 36; the measured kite point is about 34 away). "Ranged" is Fireball only, further out. Kill time is the same for kite and stand when both can keep swinging. What changes is damage taken.

| Depth | Build | Stand kill | Shield breaks | Body after the shield | Damage taken if you stand | Potions | Dies at | Kite damage |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | Melee | 2.6s | opening swing | 2.6s | 5 | 0 | no | 0 |
| 3 | Caster | 0.9s | opening swing | 0.9s | 0 | 0 | no | 0 |
| 3 | Rusty | 9.9s | 0.9s | 9.0s | 50 | 0 | no | 0 |
| 5 | Melee | **6.0s** | 0.4s | 5.6s | **47** (24% of 199) | 0 | no | **0** |
| 5 | Caster | **2.3s** | opening swing | 2.3s | 13 | 0 | no | **0** |
| 5 | Rusty | 26.1s | 2.3s | 23.9s | 474 | 3 | **21s** | **0** |
| 8 | Melee | 13.9s | 1.3s | 12.6s | 154 | 0 | no | 0 |
| 8 | Caster | 6.9s | 0.5s | 6.5s | 74 | 0 | no | 0 |
| 8 | Rusty | 96s | 8.5s | 88s | 3557 | 3 | **13.5s** | 0 |
| 12 | Melee | **35.2s** | 3.4s | 31.8s | 649 | 3 | no | **0** |
| 12 | Caster | 18.0s | 1.4s | 16.7s | 343 | 1 | no | 0 |
| 12 | Rusty | 247s | 22.5s | 224s | (overwhelmed) | 3 | **10.1s** | 0 |

The depth-12 melee clock matches the half-ramp's published target: **35.2s** for the rare sword, shield included. The white-sword control at depth 12 is **72s**, the same number as that report's white tap. Depth 5 caster at **2.3s** matches that report's rare hybrid. The method is the live hit, not a second formula.

A depth-5 rare sword is a six-second fight. The caster deletes it in two. The rusty sword can win only by never being hit, and then it takes 26s.

## Shield

The shield is 10% of life, rounded, set once at spawn. There is no regeneration.

A live check: spawn at depth 5 (shield 19), cut it to 10, then run `seTick717` for 8 seconds with the player out of melee. The shield is still 10. The only writers are spawn, the hit absorber in `resolveEnemyDamage`, and Hellmouth's bite (25% of the current shield, life untouched). Hellmouth was not part of these fights.

| Depth | Melee | Shield | Time to break | Share of the kill |
| ---: | --- | ---: | ---: | ---: |
| 3 | Broad Sword | 12 | first swing | the opening hit |
| 5 | Broad Sword | 19 | 0.4s | 7% of 6.0s |
| 8 | Rune Blade | 52 | 1.3s | 9% of 13.9s |
| 12 | Rune Blade | 117 | 3.4s | 10% of 35.2s |

The shield is a short opener, not a phase. It pops, the overlay disappears, and the rest of the fight is the life bar. There is no break sound.

## Incoming damage, cadence, variety

Tell geometry is unchanged from the early tune. Swing is 1.00s, locks at 0.25s, lane 52 long and 16 wide. Power is 1.30s and follows the body at radius 10 + the player's 5. Brand is 1.15s, radius 8 + 5, placed on the player, and does not follow. Gaps are 0.70 / 0.90 / 0.75s.

The script is the whole variety:

- Above half life, every attack is a swing.
- From half to a quarter, the pattern is swing, swing, power.
- Below a quarter, it cycles swing, power, brand.

At depth 5 the rare melee fight lands **two swings and one power**. Brand never resolves. Phase 1 (swing only) is 3.0s of the 6.0s. The caster fight lands one swing and is over. Depth 3 melee lands a single swing.

One-hit threat, spread 1, block not rolled. Nyx. Percents are of that build's max life. Kite columns are all zero; the same calls with the player off the lane and outside the circle deal 0.

| Depth | Build | Life | Def | Block | Swing | Power | Brand |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | Rare armor | 159 | 31 | 10% | 5 (3%) | 11 (7%) | 7 (4%) |
| 5 | Rare armor | 199 | 45 | 12% | 13 (7%) | 21 (11%) | 11 (6%) |
| 8 | Rare armor | 243 | 64 | 12% | 20 (8%) | 34 (14%) | 17 (7%) |
| 12 | Rare armor | 334 | 82 | 16% | 32 (10%) | 55 (17%) | 27 (8%) |
| 5 | Rusty, no armor | 140 | 0 | 0 | 31 (22%) | 53 (38%) | 27 (19%) |
| 12 | Rusty, no armor | 250 | 0 | 0 | 120 (48%) | 204 (82%) | 102 (41%) |

Standing still and eating every tell, potions at 40% life (heal is 45% + 10, no cooldown in the game):

- Depth 5 rare armor takes 47, uses **no potion**, and never drops under a comfortable line. Ten naked powers would be required to die, or 24 if three potions are chugged. The fight ends after one power.
- Depth 12 rare armor takes 649 against 334 life, drinks **all 3** starting potions, and lives. Seven naked powers kill; fifteen do if the three potions are used. That fight is long enough for the potions to matter.
- Depth 5 rusty dies on the **third** naked power, or the seventh if three potions are used. The stand sim dies at **21s** with the potions spent, while the Super Elite still has life left. Depth 8 and 12 rusty die on the **second** power even with a potion (107 is 59% of 180; 204 is 82% of 250).

Incoming threat on a geared character is a chip until depth 12, and only if they stand in the tells. Outgoing damage did scale (×2.5 at depth 5, ×5.5 at depth 12). The fight does not last long enough, and does not hit a moving player often enough, for that curve to matter at depth 5.

Fireball after fortitude, Nyx (0 fire resist) versus Magmafiend (20 fire): depth 5 is **36 / 29**, depth 12 is **25 / 20**. Resist moves the caster a little. It does not stop the 2.3s kill.

Player speed is 62. The Super Elite moves at 36. A full-speed strafe clears the swing's 8px half-width in 0.25s with 15.5px of travel. Mid-swing speed is ×0.55, which clears **8.5px against an 8px line**. The dodge works, and it is one pixel from failing if they keep swinging. Brand's 13px radius is a short walk (62 × 1.15s = 71px). Power never reaches a player who stays at sword range.

## What trivializes the fight

**Kiting.** Every kite and ranged row dealt **0**. The safe ring (sword reach 36, power radius 15) is 21px wide. Strafing the swing is free. Brand, the one tell that is dropped on the player, is not in the script until the last quarter, and the depth-5 geared fights end before it lands.

**Burst.** The caster's Fireball plus staff melee kills depth 5 in **2.3s** and depth 3 in **0.9s**. Mana regen never becomes the limit on a fight that short. Six bolts and six staff hits are enough.

**Poise does not.** Super tier is 360 poise, takes 30% of a hit, and regenerates only after 3.2s without a hit. A sword tap is 5.4 poise. The first stagger is the **67th** tap, **25s** in. A staff tap takes **100** hits, **40s**. A depth-5 melee fight is 17 taps. Depth 12 melee breaks poise twice and spends **0.5s** staggered. Stagger cancels a tell, and that is not where the kill time comes from. Freeze is already immune on a Super Elite.

Ranged safety is total for Fireball. The bolt does not need the caster to enter any tell.

## Feedback that exists, and feedback that is missing

What exists, per attack:

- A flat telegraph. Swing is a red line. Power is an orange circle that follows. Brand is a purple circle that does not. The shape blinks in the last quarter of the windup.
- Two body clips for three attacks. Swing and brand both play `attack`. Power plays `powerup`.
- The attack clip is 4 frames at 95ms. Its hit frame is at **0.285s**. Damage, the attack cue, and the VFX all wait until the tell ends: **1.00 / 1.30 / 1.15s**. The sprite has finished the strike about **0.7s** before anything hits.
- One attack cue per Super Elite, shared by swing, power, and brand. Eight cues cover all twenty elites (`enm_se_attack_01` through `_08`). Volume is 1.0 on power and 0.85 otherwise. There is no tell-start sound.
- Fourteen VFX ids, spawned at resolve, beside the body. Brand uses the attack VFX, not its own.
- On a connect, the player gets the ordinary hurt sound, a trauma shake, a 4px push, a red number, and 0.45s of iframe. That iframe is shorter than the next gap, so it does not cover the next tell.
- Drop, three laughs, taunt-done, two deaths, and two victory stingers exist and are not part of the attack.
- A shield overlay from a pool of 20. It draws while `shield > 0` and then it is gone.

What is missing:

- `sePose717` never plays the hurt clip. The frames are in the manifest as an optional state. A hit flashes a white rectangle for 0.12s.
- `seResolveTell` does not call `impactFeedback`. There is no hitstop on the Super Elite. The player's whoosh is a different system and was not touched.
- No separate swing, power, and brand sounds. No shield-break sound. No projectile, slam, or dash VFX, because those attacks do not exist.
- The telegraph does not use the Super Elite's own VFX during the windup.

The attacks feel dull because three tells share two animations and one sound, and the sound and the flash happen long after the picture has already struck.

## Durability, not decisions

At depth 5 the rare sword spends 6.0s to do 47 damage if the player stands still, and the same 6.0s to do 0 damage if they take one step sideways. The decision that exists removes the threat. The threat that exists does not ask for a potion. Depth 12 is the same shape on a longer bar: 35.2s, and kiting is still free. The half-ramp did its job on the depth-12 clock. It did not give depth 5 a new decision, and the script still withholds brand and most powers until the fight is already over.

The rusty player is the opposite problem. Standing in the ×2.5 / ×5.5 curve with no armor is lethal (second or third power). Kiting is still a zero-damage win, just a long one. That is a durability check with an opt-out, not a fight.

## Recommended changes

Do not add more life at depth 12. The rare sword is already the 35s fight the half-ramp asked for. Do not take the other half of the taken ramp. A durability-only bump that turns the depth-5 rare sword from 6.0s into 12.8s (life ×1.375 → ×2.4 and taken 0.55 → 0.45, depth 12 anchors left alone) also turns the rusty kite from 26s into **56s** and the depth-8 rusty kite from 96s into **131s**, and the geared player who strafes still takes **zero**. That projection is in the JSON as `projTtk`. It is the wrong lever.

### Patterns

1. From depth 5, start on the phase-3 rotation (swing, power, brand). The first six seconds should show all three tells. Today brand's damage number is unused until the last quarter, which geared players never reach.
2. Close the safe ring. Power radius 10 (15 with the body) against sword reach 36 is a 21px free lane. Set the power radius so a player at sword reach is inside it (radius about 36, the tell's `r` near 31). Staff reach is 52, so this does not touch a caster standing back. That is what the bolt below is for.
3. Add one ranged tell: a slow bolt with its own windup, about brand damage (11 at depth 5 in rare armor, 6% of life; 27 at depth 12, 8%). It is the answer to Fireball range and to the staff's long reach. One bolt every cycle, not a barrage.
4. Move the swing lock from 0.25s to about 0.12s. Mid-swing speed then covers about 5px of an 8px line, so a player who keeps attacking gets hit, and a player who stops to step does not. The dodge becomes a choice. Today it is automatic.

Projected threat if the ring is closed and the player eats tells the way the stand sim already does. Kill times stay on the current clocks, because closing the ring does not add life.

| Depth | Build | Kill time, unchanged | Damage if they eat the tells | Potions | Outcome |
| ---: | --- | ---: | ---: | ---: | --- |
| 5 | Rare melee | 6.0s | 47 (24%) | 0 | lives, finally has to respect the circle |
| 5 | Caster in melee | 2.3s | 13, plus the new bolt if the fight lasts a cycle | 0 | still a short kill; see below |
| 5 | Rusty, standing | dies at 21s | the current 474 | 3 | already a loss; kiting is no longer a free win |
| 12 | Rare melee | 35.2s | 649, 3 potions | 3 | the current stand result, which is a real fight, and kiting no longer skips it |

The caster at depth 5 stays a **2.3s** kill if Fireball is left as it is. Stretching everyone's life until that kill takes 8s (about ×3.5 effective life) pushes the rusty kite toward **90s**. That is a sponge. Spell damage is a separate dial from the attack patterns. This audit does not recommend turning it.

A tighter swing gap (0.70 → 0.40) on top of the new rotation puts roughly one extra swing and a brand into the depth-5 window: about **58** damage instead of 47, still under a potion, still not a kill. Use that only if a playtest of the closed ring still feels thin. It is not required to fix "I strafed and took nothing."

### Feedback

Wire these to the tell, and do not touch the player whoosh.

- Play the attack VFX when the tell starts, and again on the hit. Deal the damage on the clip's hit frame, or stretch the clip so the strike and the number are the same moment. The current 0.7s gap is the dull hit.
- Three cues: a swing, a power, a brand. The per-elite attack file can stay as a color on top. It cannot be the only sound for all three.
- A short sound at tell start, distinct from the player's swing. The line and the circle are silent today.
- Play the hurt pose that already exists. A white flash is not an impact.
- A crack when the shield hits 0, and drop the overlay on that frame. The shield never comes back, so the break should be obvious.

### Damage versus life

Leave `SE_LIFE_TABLE` and `SE_TAKEN_TABLE` where the half-ramp put them. Depth 12 stays a 35s rare sword. Depth 5 stays a short clock, and the danger comes from no longer being able to take zero. Outgoing `SE_DMG_TABLE` is already the full curve; raising it further makes the rusty second-power death worse and does not touch a player who strafes.

## Regression test plan

Re-run `node tools/audit/run-audit.mjs se` against a local server. Spread 1, block not rolled, Nyx, the same four builds and the same levels (6 / 9 / 13 / 20).

Lock the current game before any tune:

- Depth 5 life 194, shield 19, taken 0.55, damage ×2.5. Depth 12 life 1172, shield 117, taken 0.186, damage ×5.5.
- Rare melee kill time: depth 5 in **5.0–7.0s**, depth 12 in **32–40s**. White sword, no armor, depth 12 in **65–80s**. Caster depth 5 under **3.5s**.
- Kite damage at the current radius is 0 for swing, power, and brand. A player at distance 34 from Nyx takes 0 from power.
- Shield cut to half and ticked for 8s with `seTick717` does not move.
- A sword does not stagger a Super Elite in under 60 taps. The depth-5 melee fight reports 0 poise breaks.
- Intro, drop plus taunt, finishes between 1.0 and 1.3s. `sePose717` still does not reference hurt. Swing and brand still share the attack clip. Damage still resolves at 1.00 / 1.30 / 1.15s.

After the pattern change, replace the kite assertion:

- The same distance-34 point takes the power hit (13 at depth 5 in rare armor, 21 at depth 5 with no armor).
- A depth-5 rare melee fight resolves at least one swing, one power, and one brand.
- Kill time for the rare sword stays inside **5–8s** at depth 5 and **32–40s** at depth 12. If it leaves that band, life was changed and this audit's recommendation was not followed.
- Rusty stand at depth 5 still dies before the kill when potions are spent. Rusty kite no longer records 0 damage.
