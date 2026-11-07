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

## Follow-up after conditional approval

Head reviewed was `018199f`. These updates stay on the same branch. No gameplay, save, audio, or `version.json` change. No rendering bug turned up, so `index.html` was not edited again.

### Assertion updates

| Check | Old assertion | New assertion |
| --- | --- | --- |
| `v075` `f1 desktop steps` | `zoomSteps()` is exactly `0.25,0.35,0.5,0.75,1` | The list is exactly the distinct integer sixths for this viewport (`2,3,4,5,6` of `SCALE`, 60-tile cap, duplicates removed), widest first, `1` last, each `worldPix` a strictly increasing integer |
| `v075` `f1 minus from 1` | One zoom-out from 1x lands on exactly `0.75` | One zoom-out lands on exactly the adjacent wider step (ratio and `worldPix`), still below `SCALE` |
| `v075` `f1 out to 0.25` | Three more zoom-outs land on exactly `0.25` | The same walk — `(list length - 2)` more zoom-outs, which is 3 when five steps exist — lands on exactly the far integer step, and the view is wider than `VW × VH` |
| `v075` `f1 plus toward 1` | One zoom-in from the far step lands on exactly `0.35` | One zoom-in lands on exactly the next step toward 1x (index 1), not the far pixel |
| `v076` `b1 far fog` | A floor tile past the torch, whose old `VW × VH` screen point cleared the HUD, has lightmap sum `< 80` | The same darkness rule. The point must sit inside the world backing store (inset 4px), because `worldToScreen` is now one backing pixel per world pixel |
| `v076` `b1 screen dark` | That screen pixel, read in the `VW × VH` canvas, has sum `< 90` | That backing-store pixel, read on the world canvas, still has sum `< 90` |

`v075` is now FAIL 1 / 60, and the only failure is `f3 multi select`, which also fails on main. `v076` is PASS / 48.

### Extra checks in `tests/camera-zoom.html`

The suite is now **PASS / 125**, including the original 108.

- Low lighting at 1x and at the far step: torch sum `> 80`, an unexplored tile sum `< 80`, lightmap width is half the world buffer (160 vs 320 at 1x on the test iframe; 480 vs 960 at the far step).
- WebGL (`settings.glLight = 'on'`, High) at 1x and at the far step: path is `webgl`, torch bright, unexplored tile sum 29.
- DPR 1.25 at CSS 1536×864: `SCALE` 6, 1x backing 320×180, far `worldPix` 2, backing 960×540, **60 × 33.75 tiles**, steps `2,3,4,5,6`. That CSS size is 1920×1080 device pixels, so it matches the 1080p reference rather than the wider DPR-1.25-at-1920×1080 case.

### Lighting and 125% screenshots

Headless Chrome 156. Unexplored lightmap samples are sum 29 where the wide view can see past the start room. `imageSmoothingEnabled` stayed false on the present canvas. HUD size did not follow the zoom.

| Frame | Path | worldPix | Backing | Light buffer | Near sum | Far sum | avg ms |
| --- | --- | ---: | --- | --- | ---: | ---: | ---: |
| `light-desk-low-1x.png` | canvas Low | 6 | 320×180 | 160×90 | 576 | none in the 1x window | 2.33 |
| `light-desk-low-far.png` | canvas Low | 2 | 960×540 | 480×270 | 576 | 29 | 6.51 |
| `light-desk-gl-1x.png` | webgl High | 6 | 320×180 | GL at 320×180 | 765 | none in the 1x window | 36.4 |
| `light-desk-gl-far.png` | webgl High | 2 | 960×540 | GL at 960×540 | 765 | 29 | 311 |
| `win125-1536-1x.png` | canvas High | 6 | 320×180 | 320×180 | 563 | none in the 1x window | 4.16 |
| `win125-1536-far.png` | canvas High | 2 | 960×540 | 960×540 | 563 | 29 | 9.2 |

The 1x window is only 320×180, so a fresh start room often has no unexplored floor both on screen and more than 140px from the player. The wide step does, and that tile stays at the void color (29) for Low, WebGL, and the 125% far shot.

WebGL at the far step averaged 311 ms/frame in this headless process (software GL, full 960×540 occlusion upload). The canvas path for the same view averaged 6.5 ms. The picture is right: torch in the middle, black outside it, HUD unchanged. This is a cost note, not a fog bug. GL LIGHT remains off by default.

### Remaining failures versus main `743c826`

No new failure names. `v075` `f1 *` and `v076` `b1 far fog` / `b1 screen dark` are gone.

Still failing on both this branch and main: version pins that expect `0.7.11`; `v07103` stats/name; `v0711` gold/tome/stats; `v0712` and `v0713` shop layout; `v0715` / `v07151` satchel scale; `v075` `f3 multi select`; `v077` `f4 pool` and `f5 shop boss`; `v078-play` `f11 champions only`; `v0781` `f1 boss hits`. Main also failed `v075` `f4 skins rotate`, `stage8` `harbinger telegraphs before the rat`, and `v078` `notes` / `changelog`. Those did not fail here. `v07152` resize race, `v0714` footer, and `v077` `f2 brazier` did not fail on either run.

### Still open

- A 1920×1080 CSS window at DPR 1.25 (device 2400×1350) still uses the 60-tile cap, so the far step is about 50 tiles, not 60. The requested 125% case (1536×864 CSS) does not hit that cap.
- Safari, a real S25 viewport, and a real GPU timing of GL LIGHT at 960×540 are unchecked.
- Zoom is still not saved. 1x is still 72 pixels off bit-exact, each by one level.
