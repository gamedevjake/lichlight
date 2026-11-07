# Stage 11 audit — weapon swing SFX plays late

**Implementation note.** The correction under "Smallest safe correction" is what this branch implements. The audit below is unchanged. Two items stay open on purpose and are not part of the timing fix: a player arrow plays `cbt_kill_confirm_01` on every despawn (hit, wall, or timeout), and `player_bow_release` is not in the sample pack, so a default bow falls back to the light melee swoosh at arrow spawn. `version.json` is still 0.7.18. Nothing is deployed.

**Status at audit time: AUDIT ONLY.** The notes below were written before the fix. `version.json` was not edited. `.github` workflows were not touched.

Audited tree: `main` at `5bfb9a8` (`Add a manual GitHub Pages publish workflow (#36)`), file `index.html`.

Playtesters hear the weapon swoosh after the attack. The swoosh is scheduled in the same call that applies damage, which is the end of the windup. The blade has already traveled 62% of its arc by then. The wav files are not sitting on a long silent head.

The four open combat debts stay open. This note does not propose edits to them:

1. Crab shell versus bite (`prevented: 'crab'` / contact still skips `mode === 'open'`).
2. Crit chance stays `5 + mods.crit`, uncapped.
3. Curse `lifeDrain` is still not added to `leech`. `curseHooks` keeps `lifeDrainWired: false` (`index.html` around line 5531).
4. Life steal stays the pre-mitigation number and still skips bows, Fireball, and Frost Nova.

## Root cause

Melee swing audio is a layer inside the hit-resolution cues `meat` and `whiff`. Those cues run at the bottom of `doAttack`, after the overlap test and `damageEnemy`. A normal attack reaches `doAttack` only from `commitArmed`, when `atkWind` hits 0.

The visible swing starts earlier, in `armAttack`, which sets `p.swing = period` at the same moment the windup clock starts. From that frame until commit, the blade is moving and the bus is silent. Hitstop then freezes that strike pose for 22–60 ms while the sample, which just started, plays out.

There is one hit query. It is not a multi-frame active window. Damage and the swoosh are the same instant.

Asset leading silence does not explain the report. Every `player_swing_*` file crosses −40 dBFS inside 4 ms. The loud body of the light swoosh peaks about 51–62 ms into the file, and the heavy swoosh about 128–142 ms in. That body lands after the hit because the file is started at the hit.

## 1. Timeline

Clock is seconds of game time. The loop is `requestAnimationFrame` with `dt` capped at 50 ms (`loop`, around line 9695). Frame counts below are that duration at 60 fps (16.67 ms). Windup is a fraction of the attack period, so increased attack speed shortens it. The table is the weapon's own `spd` and 0 increased attack speed.

```
period = 0.45 / aspd
aspd   = weapon.spd * (1 + ias/100)     // fists use spd 1
windup = period * family.windup
```

`WEAPON_FAMILIES` (`index.html` 6217–6223) and `attackPeriod` (6240–6242):

| Family | Base `spd` | Period | Windup (swing start → hit + swoosh) | 60 fps frames | Recovery after the hit | Hitstop on a landed tap |
| --- | --- | --- | --- | --- | --- | --- |
| Fists | 1.00 | 450 ms | 54 ms | 3.2 | 396 ms | 22 ms |
| Sword (Short, Rusty, Broad) | 1.00 | 450 ms | 81 ms | 4.9 | 369 ms | 30 ms |
| Rune Blade (still sword) | 1.10 | 409 ms | 74 ms | 4.4 | 335 ms | 30 ms |
| Hand Axe | 0.90 | 500 ms | 140 ms | 8.4 | 360 ms | 40 ms |
| War Axe | 0.85 | 529 ms | 148 ms | 8.9 | 381 ms | 40 ms |
| Staff | 1.00 | 450 ms | 99 ms | 5.9 | 351 ms | 22 ms |
| Great Maul | 0.70 | 643 ms | 244 ms | 14.7 | 399 ms | 55 ms |
| Short Bow | 1.05 | 429 ms | 86 ms, then the arrow spawns | 5.1 | 343 ms | 18 ms, on release, even with no target |

Family fractions: fist 0.12, sword 0.18, axe 0.28, maul 0.38, staff 0.22, bow 0.20.

### What each mark on that clock is

**Input.** A tap does not swing on the press. `held.attack` starts a charge. Releasing under 0.35 s sets `tapA` and returns; the next `update` calls `armAttack` (`updateAttack074`, 9926–9935). That is one extra frame after key-up or button-up, about 17 ms at 60 fps. A press and release inside one frame takes the `tapQ` path and arms on the next update, with no extra frame. This gap is real and it is not the late swoosh.

**Swing animation start.** `armAttack` (6269–6291) sets, in one call:

```javascript
// index.html armAttack, the tap / bow path
const period = attackPeriod();
p.atkCd = period;
p.atkPhase = 'windup';
p.atkKind = use === 'bow' || fam.id === 'bow' ? 'bow' : 'tap';
p.atkWind = period * fam.windup;   // hit + swoosh wait this long
p.swingDur = period;
p.swingHit = p.atkWind;            // blade reaches k = 0.62 here
p.swing = period;                  // visible swing starts now, silent
```

`drawPlayer` (8629–8636) maps `elapsed = swingDur - swing` through the arc. At elapsed 0 the blade is at the back of the arc (`k = 0`). `k` reaches 0.62 exactly when `elapsed === swingHit`, which is the windup length. The facing line is `k = 0.5`, so the strike pose is slightly past center. No sample is started in `armAttack`.

**Active hit / damage.** `tickAttackSched` (6315–6318) subtracts `dt` from `atkWind` and calls `commitArmed` when it reaches 0. `commitArmed` (6298–6305) sets phase `recover` and calls `doAttack` with `atkKeepCd` set, so the period and the swing clock already running are left alone. `doAttack` (6363–6377) then does the only melee query and applies damage before any cue:

```javascript
// index.html, doAttack
meleeSfx = true; smpCrit = false; smpHitEnt = null;
// reach + arc test, then for each enemy in the arc:
damageEnemy(e, rolled.d, /* knock */, /* packet */); landed = true;
meleeSfx = false; sfx(landed ? 'meat' : 'whiff');
if (landed) { wearWeapon(); impactFeedback(PWR_MUL > 1 ? 'power' : 'tap'); }
```

There is no hit window. A target present at commit is hit once. A target that was inside the arc during the windup and has left by commit is missed. Stage 6 already locks "no damage during windup, damage at the end of windup" (`tests/stage6-weapons.html`).

**Swoosh.** `meat` and `whiff` both start with `swingCue()` and schedule it at `currentTime + 0` (1093–1094). Impact is `+20 ms`. A miss puff is `+30 ms`. Material layer is `+30 ms`.

**After the hit.** `impactFeedback` (6262–6267) sets `hitStopLeft` to the family hitstop, capped at 60 ms, and `×1.15` on a power hit (still capped at 60 ms, so a maul power hold is 60 ms). `update` (6580–6582) spends that time out of `p.swing` only. Audio uses `actx.currentTime` and keeps running. The strike pose is held while the swoosh plays.

### Where the loud part of the file sits

Measured on the wavs (see section 3). "Peak if started at commit" is windup plus the file's peak time. "Peak if started at arm" is the file peak alone, which is where the same asset would sit after the correction below.

| Family | Swoosh cue | File peak | Peak heard today (from blade start) | Peak relative to the hit, today |
| --- | --- | --- | --- | --- |
| Fists, sword, staff | `player_swing_light_01` | 51–62 ms | 105–161 ms | 51–62 ms after the hit |
| Axe, maul | `player_swing_heavy_01` | 128–142 ms | 268–386 ms | 128–142 ms after the hit |
| Short Bow, default | light swoosh, because `player_bow_release` is not in the pack | 51–62 ms | 137–148 ms | 51–62 ms after the arrow exists |
| Unique bows | banshee / spine / hellmouth cue | about 2 ms | about 88 ms | on the release |

A sword's air is loudest about 136 ms after the blade leaves the backswing, and about 55 ms after damage. A maul's air is loudest about 375 ms after the blade starts, and about 135 ms after damage. That is the report.

### Charged attacks

`PWR` is min 0.35 s, full 0.9 s (`index.html` 9789). Holding past the minimum slows movement to `×0.6` (6591). Crossing full plays one procedural beep, not a sample (`sfxTone('square', 880, 1320, .09, .025)` at 9926 and 9939). There is no charge asset and no charge loop. Releasing under 0.35 s is a normal tap.

A release at or above 0.35 s calls `armAttack('power')`, which skips the windup and calls `powerAttack074` (6274–6277, 9901–9905). That function calls `doAttack` immediately, so damage, the swoosh, and the impact layer all start on the release frame. After `doAttack` returns it assigns the power pose: `swing = swingDur = 0.3`, `swingHit = 0.08`. The 300 ms arc and its 80 ms strike mark begin after the audio has already been scheduled. A heavy swoosh then peaks about 130 ms into that 300 ms arc, after the 80 ms pose mark, and the impact sample has been playing since `+20 ms`.

Bows do not power-attack. `updateAttack074` clears `chg` for a bow (9913–9924). `powerAttack074` redirects a bow into `doAttack` / `fireBow` with `PWR_MUL` left at 1.

### Bows

`fireBow` (10588–10612) runs from the `doAttack` wrapper at 10743–10744, so a scheduled shot still waits out the bow windup. At commit it spawns the arrow (`BOW_SPEED` 220, life 0.95 s) and plays audio:

```javascript
// index.html fireBow, after the arrow is pushed
const cueId = style === 'Scream of the Banshee' ? 'player_bow_banshee_01'
  : style === 'Spine of the First Lich' ? 'player_bow_spine_01'
  : style === 'Hellmouth Strider' ? 'player_bow_hellmouth_01' : '';
if (cueId) cue(cueId);
else { if (!cue('player_bow_release')) cue('player_swing_light_01'); }
```

`player_bow_release` is not in `assets/sfx/sfx.json` and there is no such file. A normal Short Bow therefore plays the light melee swoosh at arrow spawn. The draw pose is the opposite of a melee windup: `drawBow716` (13863–13865) sets string pull from `swing / dur`, and `swing` starts at the full period, so the string is fully back at arm time and eases forward during the silent 86 ms. The snap to 35% pull happens in `fireBow` on the same call as the cue.

Arrow death (6643) calls `sfxAt('hit', ...)` with `sfxEnt` unset. `SFX_CUE.hit` (1096–1098) then resolves to `cbt_kill_confirm_01` on a hit, a wall, and a timeout. Enemy arrows are the ones that play `cbt_proj_arrow_impact_01` (`smpTick`, 1186), and only for `owner === 'e'`. A player shot does not play `cbt_proj_arrow_fly_01` either (1184 is also `owner === 'e'`).

## 2. The sound is tied to hit resolution

`swingCue` (1083–1084) picks the family. `heavyWeapon` is axe or maul only. Fists, swords, and staves use the light pool. The cue tables:

```javascript
// index.html SFX_CUE
whiff: () => [swingCue(), ['cbt_miss_01', { delay: .03 }]],
meat: () => {
  const h = smpCrit ? 'cbt_hit_crit_01' : heavyWeapon() ? 'cbt_hit_heavy_01' : 'cbt_hit_light_01';
  return [swingCue(), [h, { delay: .02 }]].concat(material ? [[material, { delay: .03, vol: .6 }]] : []);
},
```

`SFX_CUE.swing` (1087) is the light id only. Traps pass their own cue. Live melee does not call `sfx('swing')`. It calls `sfx('meat')` or `sfx('whiff')`, and those functions prepend the swoosh.

A miss plays the swoosh. It also plays `cbt_miss_01` 30 ms later. An impact plays only when `landed` is true, but it is glued to the swoosh, so the swoosh cannot move without editing this table.

`meleeSfx` (set true around the damage loop, 6363–6376) suppresses the separate enemy flinch (`ehit`, around 5184) so a melee connect does not also play `cbt_hit_*` a second time. The melee impact is the `meat` layer.

If the sample pack is off (`file://`, fetch failure, or `window.__noSampleSfx`), `sfxSample` returns false and the procedural voices run at the same call. Procedural `whiff` is a 140 ms bandpass sweep. Procedural `meat` is a sweep plus a body tone delayed 30 ms (7493–7494). Same moment, no separate anticipatory whoosh. The standalone procedural `swing` voice (80 ms triangle, the `S` table around line 995) is not what attacks play.

Whirlwind is a different path. `castSkill` calls `sfx('whirl')` when the spin starts (6504). That maps to `player_swing_heavy_01` at cast time (1092). It is already on the skill start. This audit does not move it.

Direct `doAttack(true)` from a secret (4244), a torch or prop (4267), and a vine (8238) skips `armAttack`. Those calls hit and play `meat`/`whiff` in the same turn. Stage 6 documents that a direct `doAttack` stays instant. A fix has to keep that.

## 3. Scheduling and leading silence

### What the mixer does

`smpPlay` (1057–1075) starts the buffer at `actx.currentTime + (o.delay || 0)`. The swoosh delay is 0. Impact delay is 0.02 s. Miss delay is 0.03 s. There is no negative offset and no look-ahead against the animation clock.

Playback rate jitters about ±4% and gain about ±1.5 dB (1064–1066). That does not postpone `start`.

`player_swing_*` is not in `SMP_CAP` (1028). A burst of hits can steal the oldest `cbt_hit` voice (cap 4) or the oldest of 32 voices. Steal stops a voice. It does not queue one for later.

`smpInit` (1030–1041) fetches `sfx.json` and decodes six files at a time, with `ui_`, `player_`, and `cbt_` first. `sfxSample` (1109–1116) returns true for a mapped type even when `smpPlay` returns false because the buffer is not decoded yet. The procedural voice is skipped. The result is a missing sound, not a sound that arrives late. A swing in the first second after the context is created can be silent. It does not systematically trail the swing.

`initAudio` (907–924) runs on `touchend`, `click`, and `keydown` in the capture phase (924), and again on attack keydown (4037) and desktop mousedown (4294). A suspended or interrupted context is resumed. `currentTime` does not advance while suspended, so a `start(now)` that was scheduled suspended plays when the context runs. The attack gesture is the resume gesture, and the swoosh for a normal melee is still a windup later. Resume order does not add the 50–240 ms gap.

Hitstop does not delay the audio clock. It holds the pose after the sample has started, which makes the air sit on the frozen strike.

### Leading silence

Threshold is the first sample at or above −40 dBFS (linear 0.01). RMS column is the start of the first 5 ms window whose RMS crosses the same threshold. Peak is the loudest sample. All of these files are 48 kHz.

Swing, bow, release, and the one whoosh asset:

| File | Duration | Peak dBFS | Lead to −40 dBFS | 5 ms RMS lead | Time of peak | −20 dBFS onset |
| --- | --- | --- | --- | --- | --- | --- |
| `player_swing_light_01.wav` | 256 ms | −1.0 | 2.1 ms | 0.7 ms | 53 ms | 17 ms |
| `player_swing_light_02.wav` | 279 ms | −1.0 | 3.6 ms | 1.3 ms | 59 ms | 22 ms |
| `player_swing_light_03.wav` | 247 ms | −1.0 | 1.5 ms | 0.0 ms | 51 ms | 12 ms |
| `player_swing_light_04.wav` | 294 ms | −1.0 | 2.7 ms | 0.3 ms | 62 ms | 16 ms |
| `player_swing_heavy_01.wav` | 457 ms | −1.0 | 0.3 ms | 0.0 ms | 129 ms | 15 ms |
| `player_swing_heavy_02.wav` | 435 ms | −1.0 | 0.3 ms | 0.0 ms | 142 ms | 21 ms |
| `player_swing_heavy_03.wav` | 460 ms | −1.0 | 0.3 ms | 0.0 ms | 128 ms | 14 ms |
| `player_bow_banshee_01.wav` | 293 ms | −1.0 | 0.0 ms | 0.0 ms | 1.8 ms | 0.1 ms |
| `player_bow_hellmouth_01.wav` | 323 ms | −1.0 | 0.0 ms | 0.0 ms | 1.9 ms | 0.0 ms |
| `player_bow_spine_01.wav` | 232 ms | −1.0 | 0.0 ms | 0.0 ms | 2.1 ms | 0.1 ms |
| `player_cast_release_01.wav` | 573 ms | −1.0 | 0.0 ms | 0.0 ms | 4.5 ms | 0.0 ms |
| `player_cast_release_02.wav` | 567 ms | −1.0 | 0.0 ms | 0.0 ms | 4.6 ms | 0.1 ms |
| `player_cast_release_03.wav` | 574 ms | −1.0 | 0.0 ms | 0.0 ms | 1.3 ms | 0.1 ms |
| `player_spectral_clone_whoosh_01.wav` | 444 ms | −1.0 | 0.0 ms | 8.3 ms | 144 ms | 39 ms |

`player_cast_release_*` is Fireball, Frost Nova, and the `nova` cue. It is not the weapon charge. `player_spectral_clone_whoosh_01` is the clone, not a weapon. No file under `assets/sfx/` has `charge` in the name. There is no `player_bow_release`.

Impact and miss, same threshold:

| Pool | Files | Lead to −40 dBFS | Peak of the file |
| --- | --- | --- | --- |
| `cbt_hit_light_01`–`05` | 5 | 0.00 ms | 2.2–2.7 ms |
| `cbt_hit_heavy_01`–`04` | 4 | 0.00–0.04 ms | 14–17 ms, except `heavy_04` at 47 ms |
| `cbt_hit_crit_01`–`03` | 3 | 0.00–0.02 ms | 15–16 ms |
| `cbt_hit_armor_01`–`03` | 3 | 0.00 ms | 2.4–3.4 ms |
| `cbt_hit_flesh_01`–`03` | 3 | 0.00–0.04 ms | 4.4–4.8 ms |
| `cbt_hit_bone_01`–`03` | 3 | 0.00 ms | 0.6–1.9 ms |
| `cbt_block_01`–`03` | 3 | 0.00 ms | 3.3–4.5 ms |
| `cbt_proj_arrow_impact_01`–`03` | 3 | 0.00–0.04 ms | 4.1–5.9 ms |
| `cbt_miss_01`–`03` | 3 | 2.2–5.6 ms | 48–51 ms |

Scheduled on top of that, a melee impact is about 20 ms after damage plus a couple of milliseconds of file onset. A miss puff is about 30 ms plus a 48–51 ms file peak, so the miss air is loudest about 80 ms after the whiff call. The swing files' late peaks are the whoosh body (the heavy ones are still under −20 dBFS for the first 14–21 ms), not a block of digital silence. Trimming them would make the whoosh loud at the hit. It would not move the whoosh to the start of the swing.

## 4. Families, charge, release, misses

| Attack | Swing / release | Impact | Miss |
| --- | --- | --- | --- |
| Fist, sword, staff tap | `player_swing_light_01` (4 variants), at commit | `cbt_hit_light_01`, or `cbt_hit_crit_01` on a crit, +20 ms. Bone / flesh / armor layer +30 ms at volume 0.6 when `enmMat` matches | Light swoosh plus `cbt_miss_01` at +30 ms |
| Axe, maul tap | `player_swing_heavy_01` (3 variants), at commit | `cbt_hit_heavy_01`, or crit, same delays | Heavy swoosh plus `cbt_miss_01` |
| Any melee power | Same family swoosh, on the release frame, bundled with the impact | Same impact rules. `PWR_MUL` only changes damage, reach, knockback, and hitstop. It does not pick a different cue | Same swoosh plus miss puff, on the release frame |
| Charge | Silent from press until full. At 0.9 s, one 90 ms square beep, gain 0.025, both on the touch/keyboard hold and on the mouse-button charge | No impact until release | A hold that never reaches 0.35 s becomes a tap. No beep |
| Default bow | Light melee swoosh at arrow spawn. `player_bow_release` is absent, so `cue` returns false and the fallback runs | `cbt_kill_confirm_01` when the arrow ends, including a wall or a timeout. `cbt_proj_arrow_impact_01` is not used for player arrows | That same kill-confirm sting. No `cbt_miss_01` |
| Banshee, Spine, Hellmouth bows | The matching `player_bow_*` cue at arrow spawn. No light swoosh | Same kill-confirm on arrow end | Same |
| Whirlwind | `player_swing_heavy_01` when the cast starts | No separate hit layer | The heavy sample still plays with an empty radius |
| Secret, torch, vine `doAttack(true)` | `meat` / `whiff` on that call. Windup is skipped. Visual swing is the legacy 0.22 s / hit 0.08 s because `atkKeepCd` is false (6359–6361) | Same melee impact rules | Same |

`enmMat` (1082): guards and `th === 'construct'` use armor, bone or a `skel` type uses bone, drowned or `an === 'squash'` uses flesh, everything else has no material layer.

## 5. Touch and desktop

Both ends call the same functions. `updateAttack074` is the keyboard and touch hold path. `clickAttack074` is the desktop click-an-enemy path. Audio is inside `doAttack` / `fireBow`, not in the input handlers. A committed tap of a given family plays the same cues on both.

| Path | How the swing is armed | Charge | When the swoosh starts, relative to the gesture |
| --- | --- | --- | --- |
| Keyboard `J` (`KEYMAP`, 4020, 4039) | Press sets `held.attack` and `tapQ`. The next update starts the charge and clears `tapQ`. Release sets `tapA`. The update after that calls `armAttack('tap')` | Yes. Full beep at 0.9 s. Release at ≥ 0.35 s is `armAttack('power')` on that update | Swoosh at end of windup, which itself starts one frame after key-up |
| Touch `#bAtk` (4433–4438) | `pointerdown` sets `held.attack` and `tapQ`. A hold that crosses a frame uses the same charge path as `J`. A press and release inside one frame still has `tapQ` set and arms on the next update | Yes, same 0.35 / 0.9 s rules | Same cues as `J` |
| Swipe onto `#bAtk` (11340) | Forces `held.attack` and clears it about 90 ms later | Too short to reach 0.35 s, so it is a tap | Same cues |
| Desktop click an enemy (4229–4232, 9936–9949) | While `dm.left` is down and the click-walk is in melee range, `mchg` charges and no swing starts. On mouse-up, the next `update` arms a tap or a power in that same call | Yes, with the same full beep | Same cues. The arm happens on the first update that sees the button up, without the keyboard path's extra `tapA` frame |
| Ctrl+click (4263) | Sets `held.attack` and `tapQ`, no walk. Mouse-up clears `held.attack` (4302). Same release path as `J` | Yes | Same cues. Facing comes from the cursor because `fixed` is false |
| Desktop HUD attack slot (`deskAct`, 11124) | `pointerdown` sets `held.attack`, then an 80 ms timeout clears it | No. 80 ms is under 0.35 s, so this control cannot charge | Same tap cues, after the 80 ms synthetic hold plus the extra arm frame |
| Secret, torch, vine | `doAttack(true)` on arrival | No | Swoosh on that call, together with damage |

`initAudio` on the first touch is the `touchend` listener. The button's `pointerup` clears `held.attack` before that `touchend`. The swoosh is still a windup after the release, so the context is up before the sample. The first-second decode gap in section 3 applies to both.

## Smallest safe correction

Move the melee swoosh from the hit bundle to the frame that starts the visible swing. Leave damage, windup length, period, reach, arc, knockback, poise, hitstop, and the four debts alone. Do not trim wavs in this change. Do not add a charge loop. There is no charge file, and a loop would be a second feature.

### Sketch

`index.html` only.

1. Stop prepending `swingCue()` inside `whiff` and `meat`. `whiff` stays `cbt_miss_01` at +30 ms. `meat` stays the hit, the crit, and the material layer.

2. Add a helper that logs the logical type (so tests can see it) and still picks heavy vs light:

```javascript
function playSwingCue() {
  sfx('swing', { cue: swingCue() });
}
```

`sfxSample` already prefers `o.cue` over `SFX_CUE.swing`, and `SFX_CUE.swing` is hard-coded to the light id. Calling `sfx('swing')` with no override would play a light swoosh for an axe. The override is required. `cue(swingCue())` would play the right file and would not show up in `sfxLog`.

3. In `armAttack`, on the tap path, after `p.swing` is set and before the `atkWind === 0` immediate commit: if `p.atkKind !== 'bow'`, call `playSwingCue()` and set `p.swingVoiced = true`. Leave bows to `fireBow`.

4. At the top of `powerAttack074`, after the bow redirect, call `playSwingCue()` and set `p.swingVoiced = true`. That is the release frame, which is also the frame that assigns the 300 ms arc. The full-charge beep stays where it is.

5. In melee `doAttack`, immediately before `sfx(landed ? 'meat' : 'whiff')`:

```javascript
if (!p.swingVoiced) playSwingCue();
p.swingVoiced = false;
sfx(landed ? 'meat' : 'whiff');
```

A scheduled tap already played the swoosh at arm time, so commit only plays impact or the miss puff. A direct `doAttack` (secret, torch, vine, and the Stage 6 "direct swing replaces the windup" case) still plays one swoosh, on that call, because the flag is clear. Windup length and the damage call do not move.

6. Clear `p.swingVoiced` wherever a windup is thrown away without `doAttack`: `clearAttackArm`, the crowd-control / roll abort inside `tickAttackSched` (6311–6313), and `die`. `startRoll` already calls `clearAttackArm`. If the flag survives a cancel, the next direct `doAttack` would skip its swoosh.

Bow release stays in `fireBow`. Moving it to `armAttack` would play the light whoosh while the string is still fully drawn and would leave arrow spawn silent. The default bow's late feel is the same commit-time trigger, plus the light file peaking about 55 ms after the arrow exists. Fixing that means a real `player_bow_release` asset (or accepting the light swoosh and starting it on the release snap, which is already the call site). That is not required to fix melee.

Player-arrow `cbt_kill_confirm_01` on every despawn is a separate contact bug. Leave it out of this patch. `damageEnemy` already plays the death cue when the shot kills. Swapping the despawn sting for `cbt_proj_arrow_impact_01` only when `struck` is set is a follow-up, and it changes a sound players already hear on misses.

### What stays put

- `WEAPON_FAMILIES`, `attackPeriod`, `commitArmed`'s call into `doAttack`, the overlap test, `rollDmg`, `leech`, `damageEnemy` packets, `PWR` multipliers, `impactFeedback`, bow projectile speed and damage.
- `lifeDrainWired`, crit chance, crab shell, and which skills call `leech`.
- Whirlwind's `sfx('whirl')`.
- The 0.9 s charge beep.
- Wav files, `sfx.json`, `version.json`, workflows.

### Risk

- A roll or a stagger during windup will already have played the swoosh. That matches "sound when the swing starts." It is a new sound on a cancelled swing. Clearing the flag on those aborts is what keeps the next swing honest.
- `sfxLog` gains a leading `'swing'` on every melee attack. Current harnesses do not assert `meat` / `whiff` order. `sfxLast` after a hit is still `meat`.
- Power attacks keep impact on the release frame, because that is when damage is applied. The heavy file's loud body still peaks about 130 ms into the 300 ms power arc (visual strike mark 80 ms). That is the recording, not the trigger. A later asset pass can tighten the heavy files. Doing it in this patch would make today's late trigger even louder at the hit.
- First-second decode can still drop the new earlier swoosh. Same rule as today: mapped and undecoded means silence.
- Do not start the swoosh from `drawPlayer`. Draw runs after `update`, and a dropped frame would move the sound.

### Tests to add

A new `tests/stage11-weapon-sfx.html` that boots the game the way `tests/stage6-weapons.html` does, with `window.__noSampleSfx` left off or on. `sfxLog` is already on `window.game`. Assert logical types, not decoded audio.

- Sword tap, enemy out of arc: `beginAttack('tap')` logs `'swing'` while `attackState().phase === 'windup'` and HP is unchanged. Stepping the windup (81 ms at `aspd` 1) logs `'whiff'` once and does not log a second `'swing'`. HP stays unchanged. `atkCd` stays inside the period the Stage 6 test already checks.
- Same tap with an enemy in reach: `'swing'` during windup, `'meat'` on the step that drops HP, one hit, the Stage 6 damage number unchanged.
- Axe and maul: the logged type is still `'swing'` (the cue override is what selects heavy). Windup before damage matches `period * 0.28` and `period * 0.38`.
- Hold 0.2 s: `sfxLog` has no `'swing'`. Release under 0.35 s: one `'swing'`, then windup, then one `meat` or `whiff`.
- Release at 0.9 s: `'swing'` and `'meat'`/`'whiff'` land on the release step, HP changes on that step, and the power pose is `swingDur === 0.3`. Damage stays on the existing power multiplier. No extra windup.
- Bow: no `'swing'` during the 86 ms windup. After commit, one player arrow exists and HP has not changed yet. Do not require `player_bow_release`.
- `doAttack(true)` with no windup: one `'swing'` and one `meat`/`whiff` in that call, one hit, phase is not left in `windup`.
- Roll during windup: `'swing'` may already be logged, HP unchanged, phase not `windup`, `atkCd` still up. The next tap logs a new `'swing'`.
- Re-run `tests/stage6-weapons.html`. Its windup, buffer, bow-is-not-a-power-attack, and cancel checks should stay green. Do not add assertions on crit cap, `lifeDrainWired`, leech amount, or crab shell.

## Files read

- `index.html` — audio bus, `SFX_CUE`, `smpPlay`, attack scheduler, `doAttack`, `fireBow`, charge, draw, input.
- `assets/sfx/sfx.json` and the wavs listed above.
- `tests/stage6-weapons.html` — windup and damage locks to leave green.
- `COMBAT_REDESIGN_CHANGELOG.md` — the four open debts (around 2161 and 2683) and the note that a direct `doAttack` stays instant.
