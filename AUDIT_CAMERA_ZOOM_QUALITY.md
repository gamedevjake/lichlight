# Camera zoom quality audit

Commit `743c82602252546236fa8f468ae1556dbe7b9fcb` (v0.7.18). Audit only. The engine, the zoom steps, `version.json`, and `COMBAT_REDESIGN_CHANGELOG.md` were not changed.

Headless measurements were taken in Chrome 156 (`HeadlessChrome/156.0.0.0`) with the throwaway harness `tools/audit/measure-zoom-blur.html`. The contact sheet is `tools/audit/out/zoom-edge-sheet.png`. Numbers are in `tools/audit/out/metrics.json`. Re-run with `tools/audit/run-zoom-blur.sh`.

## Short answer

The pause-menu zoom is a Canvas 2D transform. It does not resize the game canvas, and it does not use CSS zoom. The world is drawn in 16px tiles, then `ctx.scale(ZOOM, ZOOM)` squeezes or stretches that drawing into a backing store whose size is fixed for the monitor. The HUD is drawn after that transform is removed.

`imageSmoothingEnabled` is already `false` for floor and wall `drawImage`s. In Chrome 156 that flag is honored: a hard edge does not turn into gray pixels. What zoom does instead is throw away texels. A 1px black/white checker (the same frequency as mortar in a 16px floor tile) survives at 1x as a 1px stripe. At 0.5x and 0.25x the same checker collapses to a solid color. With smoothing forced on, that same checker becomes a flat gray ramp. Zoom-in steps 1.15, 1.25, and 1.35 keep the stripes but paint them at mixed 1px and 2px widths.

Zooming out does reveal more of the dungeon. It does not stretch one fixed frame. The cost is that those extra tiles are resampled into the same 320x180-class backing store, then the existing integer CSS scale blows each backing pixel back up to the original chunk size. The picture looks soft because the 16px art has been decimated, not because a blur kernel is running on the world pass.

The smallest change that actually restores 1x sharpness is to stop scaling the world inside that fixed backing store. Pick an integer number of device pixels per world texel, draw the world 1:1 at that size, and composite the HUD at the current integer `SCALE` so the bars do not change size. Snapping the camera, or blitting an offscreen world buffer into today's canvas, was measured and does not bring the checker back.

## 1. How zoom works

The control is the pause-menu button `#mZoom`, label `TEST ZOOM`. It is not stored in settings or in the save.

- Live steps, `index.html` `ZOOM_MOBILE` / `ZOOM_DESKTOP` (line 9808): desktop `0.25, 0.35, 0.5, 0.75, 1`. Touch `1, 1.15, 1.25, 1.35`.
- `zoomSteps074()` (line 9882) picks the touch list when `touchMode` is set, unless `window.__zoomDesk` forces the desktop list.
- `cycleZoom` / `setZoom` (lines 9406–9411). `=` / `+` cycles up, `-` / `_` cycles down, `0` resets. Desktop click cycles toward zoom-out.
- `setZoom` rejects any value not in the active list, and `v074Update` (line 10085) forces `ZOOM` back to 1 if the active list no longer contains it (touch vs mouse).
- The old `ZOOMS = [1, 1.5, 2, 2.5]` at line 9383 is unused. The v0.7.3 comment above it is stale.

`ZOOM` is a runtime `let`. It is not a field of `settings` (line 901) and it is not in the `cryptdelve` save payload (`save()` at line 3910). Reloading the page returns to 1x. Nothing in the save format has to migrate.

The transform is `zoomApply` (line 9404):

```js
function zoomApply(c, sx, sy) {
  if (ZOOM === 1 || !player) return;
  c.translate(VW / 2, VH / 2);
  c.scale(ZOOM, ZOOM);
  c.translate(-(player.x - sx), -(player.y - 4 - sy));
}
```

`render` (line 8537) then does `ctx.translate(-sx, -sy)`. Matrix order cancels `sx` and `sy`. A world point lands at:

```
screen = (VW/2, VH/2) + ZOOM * (world - (player.x, player.y - 4))
```

`worldToScreen` (lines 2262–2265) and `scr2w` (line 9405) use that same formula. `zoomVis` (lines 2257–2260) is the inverse rectangle: width `VW / ZOOM`, height `VH / ZOOM`, centered on the player. At `ZOOM === 1` the visible rect is the lerped camera `(sx, sy)` with size `VW x VH`.

Consequences of the cancel:

- While zoomed, the lerped `cam` does not move the picture. The view is locked on the player.
- Screen shake is applied as `sx = round(cam + shake)` (line 8535) and then cancelled. Shake does not affect a zoomed frame. At 1x it does.
- `mouseToCanvas` (line 4060) maps the CSS rect of `#game` into `VW x VH`. `clientToWorld` (line 4081) and `cursorWorld` (line 4252) then call `scr2w`. Clicks match the zoomed render. They do not match the 1x camera, on purpose.

There is no CSS `zoom` on the playfield. The comment at line 259 is about the menu and the touch HUD, which use `transform: scale(var(--ui))` because CSS `zoom` double-applied in Chrome. `#game` itself is `image-rendering: pixelated` (line 22) and is sized in JS.

## 2. Render pipeline

`resize` (lines 696–713) picks the backing store once per viewport, independent of `ZOOM`:

```
SCALE = max(1, floor(min(cssW, cssH) * dpr / 170))
VW    = floor(cssW * dpr / SCALE)
VH    = floor(cssH * dpr / SCALE)
canvas.width  = VW
canvas.height = VH
canvas.style size = VW * SCALE / dpr
```

`SCALE` is an integer. Device pixels covered by the canvas equal `VW * SCALE` on both axes, so the CSS present is an integer scale even when the CSS pixel size is fractional (`1920x1080` at dpr 1.25 is backing `342x192`, CSS `1915.2 x 1075.2`, device scale exactly 7). `ctx.imageSmoothingEnabled = false` is set at the end of `resize`, because assigning `canvas.width` resets the context and the default smoothing flag is `true`.

`render` (lines 8530–8606), in order:

| Pass | Space | What |
| --- | --- | --- |
| Clear, smoothing off | screen | `setTransform(identity)`, `imageSmoothingEnabled = false` |
| Text layer clear | device pixels | separate canvas, see below |
| World under `zoomApply` | world, then scaled | floors, walls, pits, props, pickups, player, enemies, some VFX, `drawFog` |
| `ctx.restore` | screen | zoom transform dropped |
| `renderLighting` | screen blit of a world-sized light rect | WebGL multiply, or the `lcan` lightmap |
| World under `zoomApply` again | world, then scaled | torches, emissive, bloom, names, enemy HP bars, world floater text |
| `ctx.restore` | screen | |
| `drawVignette`, plane flash | screen | not zoomed |
| `hudInset074(drawHUD)`, zoom tag | screen | not zoomed |

Floors and walls are 16x16 canvases (`TS = 16`). `makeTile` (line 873) builds them at 16x16. `buildTex` (line 7972) bakes about ten floor and eight wall variants per theme with `fillRect` at 1:1, so the source art is crisp. `texFloor` / `texWall` (lines 7996–7997) pick one of those, or a 16x16 file from `ART_TILES` (line 8382 requires `img.width === TS`). `render` draws them with `ctx.drawImage(tex, tx * 16, ty * 16)` inside the zoom transform. There is no second-resolution tile cache. The 16x16 source is the only mip.

Characters and enemies are the same path: small canvases (`wardSprites`, enemy sprites) drawn with `drawImage` in world pixels, then the same `ctx.scale`. Blades, particles, and a lot of 1px VFX are `fillRect` in world pixels under that same transform, not `drawImage`.

Lighting does not scale the color buffer. It covers `zoomVis` and is then blitted over the whole screen:

- Canvas path, `renderLightingCanvas` (lines 2815–2833). Buffer is `ceil(VW * lightScale)` by `ceil(VH * lightScale)`. High is 1, low is 0.5 (`lightScale`, line 2255). The context is transformed so one light texel matches one world pixel inside `zoomVis` (`scx = LW / V.w`, which equals `ZOOM` at High). Gradients come from `LGRAD`, a 64x64 radial baked once (lines 2174–2177). `lctx` never sets `imageSmoothingEnabled = false`, and assigning `lcan.width` resets it to `true`, so those gradients are bilinear on purpose.
- The blit back is `drawImage(lcan, 0, 0, VW, VH)` with `imageSmoothingEnabled = true` and `multiply` (line 2833). At High the sizes match, so this is a 1:1 copy. At Low it is a 2x bilinear upscale of the darkness, then a 1px-wide gray step on a hard shadow (measured, below).
- WebGL path, `renderLightingGL` (line 2717). Used only when lighting is High and GL LIGHT is `auto` or `on`. The default is off (`glLightMode`, line 2448). Scene, light, and occlusion textures are `NEAREST` (lines 2625–2628 and 2650–2651). The composite shader multiplies scene by light at the canvas size. The result is `drawImage`'d 1:1 with smoothing off (line 2766). This pass does not add texture blur. The world was already resampled before the scene texture upload.
- `drawBloom` (line 8012) draws the same 64x64 gradients with `lighter` inside the zoom transform. Soft disks, not floor texels.
- `drawVignette` (line 2886) is the other place the main context sets smoothing `true`: three dim fog streaks. It sets the flag back to `false` before returning.

HUD and the minimap run after the second `restore`. `hudInset074` (line 9825) only translates for the safe area. Desktop bars, the D2 panel, and the minimap are in `VW x VH` pixels and then ride the integer `SCALE` to the screen. They do not change size when `ZOOM` changes. Touch buttons are DOM, outside the canvas.

World labels use `drawText`, which reads the current transform (lines 782–809) and rasterizes Pixelify on the device-pixel text canvas introduced in v0.7.18. `textPix718` is `(cssWidth * dpr) / canvas.width`, which is `SCALE` today. The face size is `round(6 * transformScale * SCALE)`. Under zoom, world text grows with `ZOOM`. HUD text is drawn after `restore`, so its transform scale is 1 and it stays at the 1x size.

## 3. Where the picture goes soft

Chrome 156, backing store 320x180, a 16x16 vertical 1px checker drawn the way `render` draws a floor tile. `ramp` is the count of pixels on a scanline that are neither near-black nor near-white. Interior run lengths are the widths of the solid stripes, ignoring the clipped first and last run.

| Zoom | Mode | ramp | Interior stripe widths |
| --- | --- | ---: | --- |
| 1 | game, snapped, smooth, offscreen | 0 | 1, 1, 1, ... |
| 0.75 | game / snapped / offscreen (smoothing off) | 0 | alternating 1 and 2 |
| 0.75 | smoothing forced on | 40 | gray, stripes gone |
| 0.5 | smoothing off | 0 | one solid run (the checker is gone) |
| 0.5 | smoothing on | 48 | the whole scanline is gray |
| 0.35 | smoothing off | 0 | mixed 1 and 2, irregular |
| 0.35 | smoothing on | 40 | gray |
| 0.25 | smoothing off | 0 | one solid run |
| 0.25 | smoothing on | 48 | gray |
| 1.15, 1.25, 1.35 | smoothing off | 0 | mixed 1 and 2 |
| 1.15, 1.25, 1.35 | smoothing on | 35–38 | gray |

At 0.5x and 0.25x the unsmoothed "game" cell and the "snapped" cell came out opposite solid colors (white vs black on the contact sheet). The fractional player position chooses which phase of the checker survives. Walking the player changes that phase, so 1px grout swims and then vanishes. Snapping the origin only picks a stable phase. It does not restore the other column.

An offscreen world buffer blitted with smoothing off into the same 320x180 canvas matched the snapped column. It is not a fix.

`fillRect` of a 1px world mark, under the same `ctx.scale`, is different from `drawImage`. Smoothing off does not apply to fills. Measured gray ramps: zoom 0.5 with a fractional origin, ramp 2; aligned 0.5, ramp 1; 0.75 and 1.25, ramp 2; 0.35, ramp 1. The `drawImage` of a sprite next to it stayed ramp 0. Blades, particles, and other procedural pixels smear even though the floor sprites do not.

Integer upscale of a crisp buffer, which is what `SCALE` does on the way to the screen, added no gray: 6x `drawImage` with smoothing off had ramp 0. The same blit with smoothing on had ramp 5. A 7.5x blit with smoothing on had ramp 6. The present step is not the dungeon blur, as long as it stays nearest and integer. The damage is already in the backing store.

Low-quality lighting, measured separately: a half-res hard shadow (`160x90` into `320x180`) upscaled with smoothing on adds a 1px gray step at the cut (`shadowCutRamp: 1` at zoom 1 and at 0.35). That softens darkness edges. It is not what flattens the floor checker.

## 4. DPR, backing store, caches, satchel

Backing-store size for a few viewports, from the same formula as `resize`. `b2d` is device pixels per backing pixel and is always the integer `SCALE`. `cssFrac` means the CSS width is not a whole pixel. `occ` is `VW * VH * 24`, the WebGL occlusion stack (`GL_MAX_OCC` is 24) if GL LIGHT is turned on. It does not grow with zoom today, because the canvas does not grow with zoom.

| Viewport | SCALE | Backing | CSS fractional | b2d | Light high px | Light low px | Occ |
| --- | ---: | --- | --- | ---: | ---: | ---: | ---: |
| 1920x1080 @1 | 6 | 320x180 | no | 6 | 57600 | 14400 | 1.38 MB |
| 1920x1080 @1.25 | 7 | 342x192 | yes | 7 | 65664 | 16416 | 1.58 MB |
| 1920x1080 @1.5 | 9 | 320x180 | no | 9 | 57600 | 14400 | 1.38 MB |
| 1920x1080 @2 | 12 | 320x180 | no | 12 | 57600 | 14400 | 1.38 MB |
| 2560x1440 @1 | 8 | 320x180 | no | 8 | 57600 | 14400 | 1.38 MB |
| 2560x1440 @2 | 16 | 320x180 | no | 16 | 57600 | 14400 | 1.38 MB |
| 1512x982 @2 | 11 | 274x178 | no | 11 | 48772 | 12193 | 1.17 MB |
| 844x390 @3 (phone landscape guess) | 6 | 422x195 | no | 6 | 82290 | 20678 | 1.97 MB |
| 1044x480 @3 | 8 | 391x180 | yes | 8 | 70380 | 17640 | 1.69 MB |
| 780x360 @3.75 | 7 | 417x192 | yes | 7 | 80064 | 20064 | 1.92 MB |
| 892x412 @2.625 | 6 | 390x180 | yes | 6 | 70200 | 17550 | 1.68 MB |

`SCALE` absorbs DPR. A 1440p monitor at dpr 2 still gets a 320x180 world buffer, presented at 16 device pixels per texel. Zoom never allocates a larger tile or a larger light cache. `LGRAD` stays 64x64. `polyCache` stores raycast polygons, not pixels. The vignette canvas is `VW x VH`.

Pack B is a different scaler and it does not touch the dungeon. `satchelMetrics` (line 11395) sizes a 420x202 art board. Desktop uses an integer CSS `transform: scale`. Touch landscape uses a fractional scale, about 86% of the glass width, clamped to about 2.2–3.4 (lines 11417–11425). `sizeSatchel` (line 11456) writes that scale onto `#satArt`. `uiEff718` (line 11539) is `round(satchelScale * dpr)` and `crispCtx` (line 11544) sizes text canvases in that many backing pixels, then the whole board is CSS-scaled again. Fractional landscape scale can blur the pack art. It does not change `ZOOM`, `VW`, or the floor tiles. A camera fix must not write `appW` / `appH`, because the satchel reads those.

`imageSmoothingEnabled` on the main context is set `false` every frame at the start of `render`, and again after the light blit and after the vignette streaks. The only `true` assignments on that context are the light blit (line 2833) and the vignette streaks (line 2886). Both sit inside a `save` / explicit reset, outside the world scale. The lightmap context is the one that stays smooth, and it only draws gradients and explored-tile fills.

## 5. What a true world-space zoom would be

Keep the visible-rectangle idea in `zoomVis`: zoom-out shows more tiles, zoom-in shows fewer, the player stays centered, the HUD is not scaled.

Stop implementing that rectangle with `ctx.scale(ZOOM)` into a fixed `VW x VH` buffer. That buffer has one pixel per world texel only at `ZOOM === 1`. Every other step maps several world texels onto one backing pixel, or one texel onto a non-integer number of backing pixels, and the integer `SCALE` then enlarges the damage.

The Canvas 2D version that stays sharp:

1. Leave `resize()` and the HUD coordinate system (`VW`, `VH`, `SCALE`) alone.
2. Choose an integer `worldPix = max(1, round(SCALE * ZOOM))` device pixels per world texel.
3. Draw the world with `setTransform(worldPix, 0, 0, worldPix, ox, oy)` onto a canvas whose backing store is the device-pixel size of the game rect (`VW * SCALE` by `VH * SCALE`), or draw 1:1 into a world-sized buffer and `drawImage` it with destination size `width * worldPix`. `ox` and `oy` have to be integers. `imageSmoothingEnabled` stays `false` after every resize of that canvas.
4. Draw the light buffer at one texel per world pixel (High already does this at 1x) and present it with the same integer transform. Do not bilinear-upscale it across the device pixels.
5. Draw the HUD in the existing `VW x VH` space and present it with `setTransform(SCALE, 0, 0, SCALE, 0, 0)`. A 70px bar stays `70 * SCALE` device pixels at every zoom.
6. Map pointers in device pixels: `(device - origin) / worldPix`. Use that one function for render, `clientToWorld`, and `cursorWorld`.

At 1x, `worldPix === SCALE` and the world buffer is the current `VW x VH`. Cost matches today. Zoom-out lowers `worldPix` and the world buffer grows. Zoom-in raises `worldPix` and the world buffer shrinks. Phones only zoom in, so their buffers get smaller.

On 1920x1080 at dpr 1 (`SCALE` 6), integer pixels cannot hit every current step's field of view:

| Step | Today, tiles across x down | Today, device px per texel (average) | Integer `worldPix` | Tiles across x down | Notes |
| --- | --- | --- | ---: | --- | --- |
| 1 | 20 x 11.25 | 6 | 6 | 20 x 11.25 | same picture |
| 0.75 | 26.67 x 15 | 4.5 | 5 (or 4) | 24 x 13.5 (or 30 x 16.9) | 4.5 cannot be an integer pixel |
| 0.5 | 40 x 22.5 | 3, but stored as decimated 6px chunks | 3 | 40 x 22.5 | same field of view, every texel kept |
| 0.35 | 57.14 x 32.14 | 2.1 | 2 | 60 x 33.75 | close |
| 0.25 | 80 x 45 | 1.5, checker destroyed | 2, or 1 | 60 x 33.75, or 120 x 67.5 | 1.5 cannot be an integer pixel |

0.5x is the step where the field of view can stay identical and the art becomes sharp. 0.25x cannot: a 1.5 device-pixel texel is the blur, and the nearest integers are a slightly tighter view (`worldPix` 2, 60 tiles) or a much wider one (`worldPix` 1, 120 tiles). Recommend replacing 0.35 and 0.25 with two distinct integer steps rather than rounding both to 2.

Phone landscape guess 844x390 at dpr 3 (`SCALE` 6, device 2532x1170), touch steps only:

| Step | Today tiles | `round(6 * step)` | Tiles at that integer |
| --- | --- | ---: | --- |
| 1 | 26.4 x 12.2 | 6 | same |
| 1.15 | 22.9 x 10.6 | 7 | 22.6 x 10.4 |
| 1.25 | 21.1 x 9.8 | 8 | 19.8 x 9.1 |
| 1.35 | 19.5 x 9.0 | 8 | same as 1.25 |

1.25 and 1.35 collapse. Four distinct phone steps are `SCALE`, `SCALE+1`, `SCALE+2`, `SCALE+3` (6, 7, 8, 9 here), not the current fractional list.

## 6. More world, not a stretched frame

Confirmed in `zoomVis`: the world rectangle is `VW / ZOOM` by `VH / ZOOM`. Tile draws in `render` (line 8538) iterate that rectangle plus a one-tile pad, not the 1x window. Culling (`offView`, bloom, critters, emissive) uses the same rect.

1920x1080 @ dpr 1, player at a fractional tile, including the pad the renderer actually loops:

| Zoom | World px | Tiles visible | Tile `drawImage`s | Device px per world texel |
| --- | --- | --- | ---: | --- |
| 1 | 320 x 180 | 20 x 11.25 | 360 | 6, integer |
| 0.75 | 427 x 240 | 26.67 x 15 | 570 | 4.5 |
| 0.5 | 640 x 360 | 40 x 22.5 | 1188 | 3 average, not stored that way |
| 0.35 | 914 x 514 | 57.14 x 32.14 | 2232 | 2.1 |
| 0.25 | 1280 x 720 | 80 x 45 | 4116 | 1.5 |

The 1x camera still lerps (`cam` update at line 6691). The zoomed camera does not use that lerp. Switching from 1x to 0.75 jumps from a lagged camera to a hard lock on `(player.x, player.y - 4)`.

## 7. Performance

The main canvas fill stays `VW * VH` at every zoom today. Zoom-out spends more `drawImage` calls (360 to about 4100 floor tiles on 1080p at 0.25x) and simulates a wider cull rect. Zoom-in does the opposite. The lightmap and the WebGL occlusion stack stay at the backing-store size, so zoom does not allocate a bigger darkness buffer. Each light's on-screen radius shrinks as `ZOOM` drops, because a 96px torch becomes `96 * ZOOM` backing pixels.

The sharp present moves cost onto zoom-out, where it belongs:

| `worldPix` on 1080p | World buffer | vs today's 320x180 | Occ stack if GL is on |
| ---: | --- | ---: | --- |
| 6 (1x) | 320x180 | 1x | 1.38 MB |
| 3 (the 0.5x field of view) | 640x360 | 4x | 5.5 MB |
| 2 | 960x540 | 9x | 12.4 MB |
| 1 | 1920x1080 | 18x | about 50 MB |

GL LIGHT defaults off, so the common path is the canvas lightmap at the world-buffer size, not the occlusion upload. A 640x360 lightmap is a reasonable desktop zoom. `worldPix` 1 is a full-HD fill plus a full-HD lightmap; keep that as an explicit farthest step, not the default far step. Phones never take the desktop list, and zoom-in makes the world buffer smaller than today.

S25 Ultra is not in this environment. At dpr 3 and a landscape CSS size around 800–1000 px, `SCALE` lands around 6–8 and the backing store stays on the order of 400x200. The formula is in section 4. The device's real CSS viewport and DPR still need a check. Nothing in the phone zoom list makes the buffer larger than 1x.

## 8. Recommended change, tests, risks

Do this, and nothing wider:

1. Add `worldPix` as above. Draw the world and the light with that integer transform onto a device-pixel present. Draw the HUD with `SCALE`, unchanged coordinates.
2. Point `zoomVis`, `worldToScreen`, `scr2w`, and `clientToWorld` at the same origin and the same `worldPix`.
3. Retune the step list to distinct integers. Desktop, relative to `SCALE`: `1`, `1/2`, `1/3`, `1/6` of the 1x pixel (drop 0.75 and 0.35, which cannot be integer device pixels). Phone: `SCALE + 0, 1, 2, 3` instead of 1.15 / 1.25 / 1.35.
4. Keep `ZOOM` out of the save and out of `version.json`.
5. Do not retune `satchelMetrics`.

A camera-origin snap by itself, or an offscreen blit into the current canvas, should not ship as the fix. Both were measured. The checker stays destroyed at 0.5x and 0.25x.

### Tests

- Sharpness. The harness's 1px checker, at every shipped step and at dpr 1, 1.25, and 3, has a single interior run length and ramp 0. At the 0.5x field of view that run length is `worldPix` (3 on 1080p @1), not a solid 48px block.
- Field of view. Tile counts match the table in section 5, including the pad in the floor loop.
- Camera. At 1x the cam lerp and shake match current behavior. At other steps the player anchor stays centered, and the origin used by `drawImage` is the origin used by `cursorWorld` within one world texel.
- Mouse and touch. Click and tap a tile center at each step, before and after resize, and the walk target is that tile. The joystick stays in CSS space and does not shift when `worldPix` changes. Hover inspect and melee click-to-attack still resolve the enemy under the cursor.
- Combat. `MELEE_REACH` (20 world px) and projectile hits do not depend on zoom. A swing at 0.5x connects at the same world distance as at 1x.
- HUD. The desktop HP bar, minimap, and skill icons keep the same device-pixel size at 1x and at the far step. The touch DOM buttons do not move. The zoom label still reads the active step. World names stay readable and do not jump to a 6x face size.
- Text layer. `textPix718` still assumes what it assumes today, or it is retargeted on purpose. v0.7.18's "text not smeared by the playfield scale" property still holds.
- Lighting. An unexplored room stays black at the widest step. A torch's world radius is unchanged. The light blit is nearest at the present step (`shadowCutRamp` does not grow with `SCALE`).
- Saves and settings. Save at a zoomed step, reload, position and inventory match, zoom is 1 unless persistence is added on purpose. `cryptdelve-settings` gains no zoom key. `version.json` stays `0.7.18`.
- Resize and orientation. Rotate a coarse pointer. `SCALE`, `worldPix`, and the satchel scale recompute from the viewport only. The pack does not jump because the dungeon zoom changed. `imageSmoothingEnabled` is false on the present canvas after the resize assignment.

### Risks

- HUD drawn under `worldPix` by mistake would shrink at zoom-out, because `VW` would no longer match the present buffer. The HUD pass has to stay in `SCALE` space.
- `drawText` multiplies by the live transform scale. A device-pixel canvas with a `worldPix` transform will inflate world labels unless the text layer is pointed at the HUD scale explicitly.
- Putting the present buffer on `#game` changes `textPix718`, which divides by `canvas.width`. Safer to leave `#game` as the logical canvas and present on another canvas, or to update `textPix718` in the same change.
- Shake and camera lag start affecting zoomed frames if the new path uses `cam` the way 1x does. That is desirable and it is a feel change.
- `worldPix` 1 on a 1080p screen is a full-HD world plus a full-HD lightmap. Fine as a farthest step, heavy as a default.
- Low lighting's bilinear upscale should happen in world pixels, then the integer present. Doing it again across device pixels doubles the soft edge.
- WebGL scene upload must stay `NEAREST` and the same size as the buffer it samples. A non-integer UV scale there reintroduces the blur the Canvas path just removed.
- `lcan.width` and `canvas.width` reset smoothing to `true`. Any new canvas has to set it false after every size change, on the context that draws the tiles.

### Uncertainties that need a device

- Galaxy S25 Ultra CSS viewport and `devicePixelRatio`. The audit uses the `resize` formula at dpr 3, 3.75, and 2.625. It does not have the phone's real `innerWidth`.
- Safari. Chrome 156 keeps `drawImage` nearest under `ctx.scale`. Safari has ignored `imageSmoothingEnabled = false` under transforms in older versions. If iOS is bilinear on top of this decimation, the phone zoom-in steps will look worse than the contact sheet. Needs one iPhone screenshot of the 1px checker harness.
- The compositor, as opposed to `drawImage`. This Chrome's canvas blit at an integer scale added no gray. The game also sets `image-rendering: pixelated` on `#game`, and some viewports have a fractional CSS size even though the device scale is an integer. A screenshot of the real canvas on Windows at 125% and on the S25 is the check. The harness did not photograph the compositor.
- Whether the farthest step should be `worldPix` 2 (60 tiles, sharp, less far than today's 80) or `worldPix` 1 (120 tiles, sharp, heavier). That is a product choice the measurements cannot make.
- Player preference between "same fat pixel, missing texels" (today at 0.5x) and "smaller crisp pixel, same tile count" (the proposed 0.5x). The second is the one that matches 1x art.
