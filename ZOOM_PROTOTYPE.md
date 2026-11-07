# World zoom prototype

Prototype only. Not merged. Not deployed. `version.json` is still `0.7.18`. No combat numbers, loot, or the four combat debts were touched.

- Base: `743c82602252546236fa8f468ae1556dbe7b9fcb` (main, matches the expected `743c826`).
- Audit read first: `64198ec` on `audit/camera-zoom-quality` (`AUDIT_CAMERA_ZOOM_QUALITY.md`).
- Engine stays Canvas 2D. No new renderer.

## What changed

The old zoom was `ctx.scale(ZOOM)` into a backing store whose size was fixed by the monitor (`VW x VH`, with `SCALE = floor(minDim / 170)`). A 1px floor texel was thrown away whenever `ZOOM` was not 1, then the integer CSS scale enlarged the damage.

The world is now drawn 1:1 into a backing store of one pixel per world pixel. That store is CSS-scaled by an integer `worldPix` (device pixels per texel), with `image-rendering: pixelated`. The HUD stays in `VW x VH`. When `worldPix !== SCALE` it is drawn on `#hudLayer` and presented at `SCALE`, so bars and touch controls do not follow the dungeon zoom. Mouse and touch use the same origin as the frame: `round(cam + shake)`, then `(pointer / view) * worldSize`.

`worldPix` is `max(1, round(SCALE * n / 6))` on desktop, for `n` in `2, 3, 4, 5, 6` (`6` is 1x). A step is never allowed below the pixel size that would show more than about 60 tiles across (`ceil(VW * SCALE / 960)`). On the 1080p reference that farthest step is `worldPix = 2`: **60 x 33.75 tiles**, not 120 x 67. Touch steps add `0, 1, 2, 3` device pixels to `SCALE` (zoom in only). Duplicate integers are skipped. Zoom is still not saved, and it is not a settings key.

The camera lerp (`dt * 8`) and the shake offset run at every step. Changing step recenters on the player, then follow and shake behave as they do at 1x. At 1x, `worldPix === SCALE`, the backing store is `VW x VH`, and `zoomApply` is not used.

## 1x comparison

Headless Chrome 156, 1920x1080, DPR 1, same RNG seed, same floor.

`before-desk-1920-z1.png` and `after-desk-1920-z1.png` are both 1920x1080. **72 pixels differ, each by a channel delta of 1** (0.003% of the frame). No shifted tiles, HUD, or player. Backing store at 1x is still 320x180. Lightmap is still 320x180.

## Performance

`render()` only, 20 samples, headless Chrome 156. Memory is world backing + lightmap + the device-pixel text layer + the HUD overlay when it is shown. The text layer is the large piece at 1x (it already was). GL LIGHT stayed off.

### Desktop 1920x1080, DPR 1

| Step | worldPix | Backing | Tiles | avg ms | p95 ms | MB |
| --- | ---: | --- | --- | ---: | ---: | ---: |
| before 1x | — | 320x180 | 20 x 11.25 | 3.09 | 3.9 | 8.35 |
| before 0.75 | — | 320x180 | 20 x 11.25 stored | 2.95 | 3.6 | 8.35 |
| before 0.5 | — | 320x180 | decimated | 3.58 | 8.3 | 8.35 |
| before 0.35 | — | 320x180 | decimated | 4.36 | 8.6 | 8.35 |
| before 0.25 | — | 320x180 | decimated | 5.53 | 8.8 | 8.35 |
| after 1x | 6 | 320x180 | 20 x 11.25 | 2.85 | 3.4 | 8.35 |
| after 0.83 | 5 | 384x216 | 24 x 13.5 | 3.12 | 3.8 | 8.76 |
| after 0.67 | 4 | 480x270 | 30 x 16.88 | 3.53 | 7.7 | 9.12 |
| after 0.50 | 3 | 640x360 | 40 x 22.5 | 4.40 | 9.6 | 9.89 |
| after 0.33 | 2 | 960x540 | 60 x 33.75 | 5.80 | 11.4 | 12.08 |

The farthest desktop step is the heavy one: about 2x the 1x render time and about 3.7 MB more than 1x (two 960x540 buffers). It stays well under a frame at 60 Hz in this headless run.

### Phone emulation 412x915, DPR 3

`SCALE` is 7. Touch steps only. The text layer is about 1232x2744 (the device-pixel HUD text), ~13.2 MB, at every step.

| Step | worldPix | Backing | Tiles | avg ms | p95 ms | MB |
| --- | ---: | --- | --- | ---: | ---: | ---: |
| before 1x | — | 176x392 | 11.0 x 24.5 | 3.17 | 9.2 | 13.42 |
| before 1.15 | — | 176x392 | same store | 3.43 | 11.4 | 13.42 |
| before 1.25 | — | 176x392 | same store | 2.67 | 3.2 | 13.42 |
| before 1.35 | — | 176x392 | same store | 2.81 | 3.3 | 13.42 |
| after 1x | 7 | 176x392 | 11.0 x 24.5 | 3.18 | 9.6 | 13.42 |
| after +1 | 8 | 154x343 | 9.6 x 21.4 | 3.08 | 7.9 | 13.56 |
| after +2 | 9 | 137x305 | 8.6 x 19.1 | 2.59 | 3.4 | 13.49 |
| after +3 | 10 | 123x274 | 7.7 x 17.1 | 2.50 | 3.4 | 13.38 |

Zoom-in shrinks the world buffer. It does not allocate a larger lightmap than 1x.

## Screenshots

Full frames and the contact sheet are in `tools/audit/out/` (also copied to the agent artifacts). Contact sheet: `tools/audit/out/zoom-contact-sheet.png`.

Desktop 1920x1080, DPR 1:

- `before-desk-1920-z1.png`, `before-desk-1920-z0.75.png`, `before-desk-1920-z0.5.png`, `before-desk-1920-z0.35.png`, `before-desk-1920-z0.25.png`
- `after-desk-1920-z1.png`, `after-desk-1920-z5-6.png` (0.83), `after-desk-1920-z4-6.png` (0.67), `after-desk-1920-z0.5.png`, `after-desk-1920-zfar.png` (0.33, 60 tiles)

Phone 412x915, DPR 3:

- `before-phone-412-z1.png`, `before-phone-412-z1.15.png`, `before-phone-412-z1.25.png`, `before-phone-412-z1.35.png`
- `after-phone-412-z1.png`, `after-phone-412-add1.png`, `after-phone-412-add2.png`, `after-phone-412-add3.png`

Numbers: `tools/audit/out/zoom-perf.json`.

## Tests

`tests/camera-zoom.html`: **PASS / 108** in headless Chrome 156. It checks sharpness (ramp 0, one interior run length) at every shipped step for DPR 1, 1.25, 1.5, 2, 2.625, and 3; the 1080p tile counts; camera lerp and shake at 1x and at the far step; click/tap aim including after resize; melee reach and arrow hits; torch radius; an unexplored tile staying dark; HUD device scale, minimap ink, desktop bar size, joystick and attack button position; save-while-zoomed reloading at 1x with gold and position; smoothing off after resize.

Existing suites were run on this branch and again against main's `index.html` (`743c826`) in the same Chrome.

New failure names, not present on main:

| Suite | New failures |
| --- | --- |
| `tests/v075.html` | `f1 desktop steps`, `f1 minus from 1`, `f1 out to 0.25`, `f1 plus toward 1` |
| `tests/v076.html` | `b1 far fog`, `b1 screen dark` |

`v075` locks the old step list `0.25, 0.35, 0.5, 0.75, 1`. Those four checks fail because the shipped steps are the integer sixths. `f3 multi select` fails on both. `f4 skins rotate` failed on main only (known flake) and did not fail here.

`v076` still passes its wide-frustum check via `setZoom(0.35)` snapping to the nearest integer step. `b1 far fog` and `b1 screen dark` sample `worldToScreen` as if the canvas were still `VW x VH`. The zoomed backing store is larger than that, so those two probes no longer land on the edge texels. Lighting itself is covered by `tests/camera-zoom.html` (torch radius unchanged, unexplored tile dark, remembered tile tinted).

Shared with main, not introduced here: version pins that expect `0.7.11` (and the satchel scale checks inside `v0715` / `v07151`), `v07103` stats/name, `v0711` gold/tome/stats, `v0712` and `v0713` shop layout, `v077` `f4 pool` and `f5 shop boss`, `v078-play` `f11 champions only`, `v0781` `f1 boss hits`. `v07152` resize race, `v0714` footer, and `v077` `f2 brazier` did not fail on either run. `stage8` `harbinger telegraphs before the rat` failed on main only.

Combat stage suites `stage1` through `stage7`, `stage9`, `stage10`, `stage11`, plus `early-balance` and `se-midgame-prototype`, passed on both. `stage8` passed on this branch.

## Risks and open questions

- DPR 1.25 on a 1920x1080 CSS window: `round(7 * 2 / 6)` is 2, which would be ~75 tiles, so the 60-tile cap raises that step to `worldPix` 3 (~50 tiles). The reference 1080p DPR 1 case stays exactly 60 x 33.75. Worth a look on a real 125% Windows desktop.
- A short window (`SCALE` 3, the 960x540 test iframe) collapses five sixths to three distinct pixels, and the far step is `worldPix` 1 (60 tiles across that smaller glass, not 120 on 1080p).
- Safari has ignored `imageSmoothingEnabled` under `ctx.scale` in older versions. This path does not scale the world with a transform; the present is an integer CSS scale. Still needs one device screenshot.
- Galaxy S25 Ultra CSS viewport is still unknown. The 412x915 DPR 3 run is an emulation, not that phone.
- Low lighting still bilinear-upscales inside the world buffer, then the integer present stays nearest. Not re-shot with lighting set to Low.
- WebGL LIGHT was left off (the default). The zoomed blit uses the world-buffer size and the existing NEAREST filters. It was not timed with GL on.
- Zoom is still a session toggle. A save made while zoomed reloads at 1x on purpose.
- The 1x frame is not bit-exact: 72 pixels differ by 1 level. I did not find a shifted sprite or HUD.
