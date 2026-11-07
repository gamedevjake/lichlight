# HUD scaling audit (0.7.18)

Audit only. `index.html` and `version.json` are unchanged (`0.7.18`). No PR.

Measured with headless Chrome from `tools/audit/hud-scale-audit.mjs` (puppeteer-core). Both builds booted a real game, dismissed the portrait gate on phones, dropped a magic item plus a life potion next to the player, held Alt on desktop, and stepped the sim past the depth banner. Lighting was forced to low so the WebGL light pass could not blank the shot. Raw rows are in `tools/audit/out/hud/measurements.json`. Screenshots and the contact sheet are in `tools/audit/out/hud/`.

| Build | Commit | What it is |
| --- | --- | --- |
| before | `743c826` | Live Pages build. Pre-PR #40. Zoom is `ctx.scale(ZOOM)` on the world pass. |
| after | `def57ea` | PR #40, merged. Integer `worldPix` world backing. HUD overlay when zoom ≠ 1. |

## Finding

The 2560×1440 complaint is real, and it is already on `743c826`. PR #40 did not introduce it and does not make a 1× desktop HUD smaller.

What the player is looking at on a desktop is `#deskHud`, the DOM bar along the bottom. `placeDesk101` already computes an integer `k` so that bar's **frame** tracks about 15% of the CSS height (14.4% on every 16:9 DPR-1 monitor in this run: 104px at 720p, 156px at 1080p, 208px at 1440p, 312px at 4K). `buildDesk` then throws that integer away (`const k = 1`, later `void k`) and paints 48px slots, 56px globes, 11px readouts, and 9px hotkey labels on every monitor. At 2560×1440 those controls are 48×48 device px (3.3% of the height) sitting in a 208px frame (14.4%), with the resource line at 11px (0.76%). At 4K the same 48px and 11px controls are 2.2% and 0.51% of the height. The frame grew. The controls did not. That is the disproportion.

Three other systems are in the same picture, and they do not share a scale:

1. **Canvas world + canvas HUD** (`resize`, `SCALE`). Logical view stays near 320×180 on a 16:9 screen because `SCALE = floor(minDim / 170)`. A 6px font and a 5px hunger bar are then presented at `SCALE` device pixels. Their **fraction of the screen is constant** (font 3.33% of height, survival track 2.78% on every 16:9 DPR-1 size). They get larger in device pixels as the monitor grows. They do not get larger as a fraction of the screen, and the canvas life/mana orbs (about 19% of the height) are covered by `#deskHud`.
2. **World item labels** (`drawText` during the world pass). At zoom 1 they match the canvas font (48 device px at 1440p). Zooming out multiplies them by the world zoom and leaves the HUD alone. That split exists on both builds.
3. **Satchel** (`satchelMetrics`, CSS `transform: scale`). Separate from both. Desktop packs do grow (×3 / ×4 / ×5 / ×8 at 720 / 1080 / 1440 / 4K). Slot captions are authored at 4px inside the 420×202 artboard, so a "WPN" label is only 25 device px tall at 1440p. Phones in portrait stay at ×1, so those captions are 5 CSS px and the tabs are 23 CSS px tall.

Windows scaling does not cause the bug. Canvas HUD size follows physical pixels, so 2560×1440 at DPR 1, 1.25, and 1.5 all draw the canvas font at 48 device px. The DOM bar is specified in CSS pixels, so 125% and 150% make the slots **larger** in device pixels (60px and 72px) than 100% (48px). The worst desktop case is 100% scaling on a high-resolution panel.

## Root cause

### 1. Desktop bottom bar: the scale is computed and discarded

`fitUi101` runs at the end of every `resize` and calls `placeDesk101`:

```11228:11238:index.html
function placeDesk101() {
  const el = $('deskHud'); if (!el || !canvas) return;
  const r = canvas.getBoundingClientRect();
  const k = Math.max(1, Math.floor(Math.min((r.width || appW) / 420, (r.height || appH) * 0.15 / 52)));
  const band = Math.max(52, Math.min(r.height * 0.22, 52 * k));
  el.style.left = r.left + 'px';
  el.style.width = Math.max(120, r.width) + 'px';
  el.style.height = band + 'px';
  el.style.top = (r.bottom - band) + 'px';
  el.dataset.k = String(k);
}
```

`k` is "how many 52px bands fit in 15% of the CSS height," also capped by width/420. The band height is `52 * k`, clamped to 22% of the CSS height. On a 16:9 DPR-1 monitor the height term wins, and 52×k lands on 14.4% of the height every time.

`buildDesk` does not read `dataset.k`:

```11307:11343:index.html
function buildDesk(el) {
  el.dataset.built = '1';
  const k = 1;
  const sz = 48;
  // ... globes are (sz+8), slots are sz, hotkey text is the CSS default ...
  void k;
}
```

CSS then locks the type to absolute pixels (`index.html` 395–409):

- `#deskHud` font is `bold 11px`.
- `.dh-slot .key` is `font-size: 9px`, `bottom: -2px`.
- `.dh-globe b` inherits the 11px face. That is the life/mana number.
- The 9-slice bar (`desk_bar_9slice_64x40_s16.png`) is `background-size: 100% 78%` of the **band**, so the frame scales and the buttons do not.

`#deskHud` is `z-index: 7`. The canvas is underneath it, the text layer is `z-index: 3`, and the PR #40 HUD overlay is `z-index: 2`. The Diablo-style canvas panel (`drawD2Panel`, 30 logical px, orbs of radius 15) is covered. The survival gauges sit just above the band (`drawHUD` calls `drawSurvivalHUD(4, VH - 41, 16)`), so those thin bars are the resource gauges the player still sees.

Measured at 2560×1440, DPR 1, zoom 1, both builds:

| Piece | Device px | % of 1440px height |
| --- | ---: | ---: |
| Band frame | 2560×208 | 14.44% |
| Slot (attack, potions, roll) | 48×48 | 3.33% |
| Globe | 56×56 | 3.89% |
| Globe number and well text | 11px font | 0.76% |
| Hotkey label | 9px font, box 18×11, top 1431 | 0.63%, and 1431+11 = 1442 so the last 2px are clipped off the viewport |
| Canvas font (`LV`, item names) | 48px em, 32px ink | 3.33% em, 2.22% ink |
| Survival track | 40 tall (5 logical × SCALE 8) | 2.78% |
| Canvas orb (hidden under the bar) | 272 diameter | 18.89% |

The hotkey clip is the same 2px at 720p, 1080p, 1440p, and 4K, because `.dh-slot .key` uses `bottom: -2px` and the slots are flush with the bottom of a canvas that fills the viewport.

### 2. Canvas backing: `SCALE` holds the logical grid near 180px

```697:707:index.html
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const { w, h } = viewportSize(); appW = w; appH = h;
  // ...
  const minDim = Math.min(w, h) * dpr;
  SCALE = Math.max(1, Math.floor(minDim / 170));
  VW = Math.floor(w * dpr / SCALE);
  VH = Math.floor(h * dpr / SCALE);
```

`minDim` is the physical short side. `SCALE` is an integer device-pixel multiplier. `VW`×`VH` is the logical framebuffer. On every 16:9 landscape size in this run, that framebuffer is exactly 320×180:

| CSS viewport | DPR | Physical | SCALE | VW×VH |
| --- | ---: | --- | ---: | --- |
| 1280×720 | 1 | 1280×720 | 4 | 320×180 |
| 1920×1080 | 1 | 1920×1080 | 6 | 320×180 |
| 2560×1440 | 1 | 2560×1440 | 8 | 320×180 |
| 3840×2160 | 1 | 3840×2160 | 12 | 320×180 |
| 2048×1152 | 1.25 | 2560×1440 | 8 | 320×180 |
| 1707×960 | 1.5 | 2560×1440 | 8 | 320×180 |
| 412×915 | 3 | 1236×2745 | 7 | 176×392 |
| 390×844 | 3 | 1170×2532 | 6 | 195×422 |
| 768×1024 | 2 | 1536×2048 | 9 | 170×227 |

The short side stays near 170 logical pixels. The long side absorbs the aspect ratio. A portrait phone therefore has a tall logical view (VH 392–422), and a 5px bar is a smaller fraction of that tall screen (about 1.2% of physical height) even though it is still `5 × SCALE` device pixels (35px and 30px).

At zoom 1 the world canvas **is** `VW`×`VH`, and CSS presents it at `SCALE / dpr` CSS pixels per logical pixel (`refitWorldBacking`, around 9479). One logical pixel is `SCALE` physical pixels. Raising `SCALE` does not add HUD texels. It enlarges the same 6px font and 5px bar. The fraction of the screen stays put. That is the "HUD stays a few texels" half of the report: the authoring grid is ~180p. It is not "the texels are never scaled up." They are scaled up, by `SCALE`, and the DOM bar is the layer that skips that scale.

Canvas text does not go through that CSS scale. `drawTextRaw` (802–827) rasterizes Pixelify on `#textLayer`, a device-pixel canvas (`syncTextLayer718`, 765–791):

```802:807:index.html
function drawTextRaw(s, x, y, col, shadow) {
  s = String(s);
  const m = ctx.getTransform();
  const scx = Math.hypot(m.a, m.b) || 1;
  const pix = textPix718();
  const face = Math.max(6, Math.round(6 * scx * pix));
```

`textPix718` (757–764) is `(cssWidth × dpr) / canvas.width`, unless a HUD overlay pass has set `textPixHold`. At zoom 1 that ratio is `SCALE`. The face is `6 × SCALE` device pixels: 24, 36, 48, 72 at 720 / 1080 / 1440 / 4K. Ink height of the top-left "LV" line was 16, 24, and 32px on the first three (Pixelify cap height is 2/3 of the em). The 4K probe window was only 70px tall, so it clipped the 72px face; the em size still follows the same formula. `textW` (748–752) still measures at 6px on the world context, and the label plate is 7 logical pixels tall, so the plate and the glyph scale together.

Icons in the canvas HUD are 1-texel sprites drawn in logical pixels (`drawD2Panel` 4397, `iconBox` 4380, skill icons at 8px, `drawSurvivalHUD` 7675). They pick up `SCALE` only because the whole framebuffer is CSS-scaled. There is no per-widget size.

`fitUi101` also sets `--hud` and `--ui` (11212–11220), clamped to 0.84–1.22 and 0.70–1.35. Those variables scale `#touch`, `#cornerbar`, and `#topbar` (261–262) and the menu overlays (260). They do not scale `#deskHud`. On a 1440p and 4K desktop `--hud` is already sitting on the 1.22 cap, so even the touch cluster would stop growing. Desktop play hides that cluster.

### 3. World labels follow the camera, HUD does not

Item names are drawn in world space, after lighting, still inside the camera translate:

```8607:8612:index.html
  for (const g of ground) { if (!g.item) continue; const d = Math.hypot(g.x - p.x, g.y - p.y);
    if (labelShown(g)) { const nm = g.item.name.toUpperCase(), w = textW(nm);
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(Math.round(g.x - w / 2 - 1), Math.round(g.y - 17), w + 3, 7); drawTextC(nm, g.x, g.y - 16, RCOL[g.item.rarity], false); } }
  // ...
  if (!touchMode && keys.Alt) for (const g of ground) { /* potions, gold, torches, groundLabel */ }
```

`labelShown` (4105): Alt within 400px on desktop; otherwise magic-or-better, or within 40px, or any touch label, and always within 130px. Touch mode shows nearby names without Alt. The plate is 7 logical pixels tall.

On `743c826` this block sits inside `zoomApply`, which does `ctx.scale(ZOOM)`. `drawTextRaw` sees `scx = ZOOM` and `pix = SCALE`, so the face is `6 × SCALE × ZOOM`. The HUD is drawn **after** `ctx.restore()`, so it stays at `6 × SCALE`.

On `def57ea` the world is drawn 1:1 into a backing store and CSS-scaled by `worldPix` (9431–9456, 9479–9488). Labels stay on that world canvas, so `pix = worldPix` and `scx = 1`. The face is `6 × worldPix`. When `worldPix !== SCALE`, `render` (8628–8632) calls `paintHudOverlay` instead of drawing the HUD into the world canvas. The overlay is a `VW`×`VH` bitmap stretched to the same CSS box as the world (`layoutHudOverlay` 9503–9514), and `textPixHold = hudPresentScale()` (9516–9530) forces HUD text back to `(cssWidth × dpr) / VW`, which is `SCALE` (48px at 1440p even while zoomed out).

So the two builds already agree: HUD size is independent of zoom, label size is not. PR #40 keeps that split and makes the world zoom an integer. It does not route HUD through `worldPix`.

Farthest desktop step at 2560×1440:

| Build | Zoom | World backing | Label face | HUD face |
| --- | ---: | --- | ---: | ---: |
| `743c826` | 0.25 | 320×180, then `ctx.scale(0.25)` | 12px | 48px |
| `def57ea` | 0.375 (`worldPix` 3, sixth 2/6, cap ceil(2560/960)=3) | 853×480 | 18px | 48px |

Max zoom-out on the new build is less far (the integer cap refuses a step below ~60 tiles on the long axis), so labels at the farthest step are 18px instead of 12px. HUD device size is unchanged. A player who lives zoomed out will see names smaller than the HUD on both builds. A player at the default 1× will not. Default `zoomSixth` is 6, and `worldPix` equals `SCALE`.

### 4. Satchel and tooltips are a third scale

`satchelMetrics` (11597–11656) picks a scale for a fixed 420×202 artboard (`#satArt`), applied as `transform: scale(...)` with `image-rendering: pixelated` (`sizeSatchel`, 11658–11672). Desktop (`aw >= 1024` and not touch):

```11628:11630:index.html
  } else if (!touchish && aw >= 1024) {
    scale = Math.max(peek, Math.min(fit, 3));
    mode = 'desktop';
```

`peek` is the largest integer that fits in 88% of the safe viewport. `Math.min(fit, 3)` does not cap the result, because `peek` is outside that `min`. Once `peek` exceeds 3, the scale is `peek`. Measured desktop scales: ×3 at 1280×720, ×4 at 1920×1080, ×5 at 2560×1440, ×8 at 3840×2160. At 150% Windows (CSS 1707×960) the scale drops to ×3, because the fit is done in CSS pixels.

Slot captions are `font-size: 4px` inside the artboard (365). Visual size is `4 × satchelScale` CSS px. "WPN" measured 72×15, 96×20, 120×25, and 192×40 device px at 720 / 1080 / 1440 / 4K. At 1440p that is 1.7% of the height, smaller than world item names (3.3% em) and easy to lose next to a ×5 pack. The inventory pane's real item text is `pxText` at `8 × eff` device px on a canvas whose CSS size is the unscaled artboard (`pxText` 11766, `uiEff718` 11741). The pack transform then multiplies it, so body copy tracks the satchel scale. The 4px `.lbl` captions do too, from a much smaller base.

Portrait phones and the 768×1024 tablet took the `compact` path at scale 1. The ×2 floor only runs when `420 × 2 <= aw` (11635). A 412px-wide phone cannot fit an 840px pack, so the floor never applies. The host is clipped to the screen (412×202 or 390×202 CSS). Measured on both phone sizes, both builds:

| Control | CSS px | 44px touch target |
| --- | ---: | --- |
| Satchel tab | 73×23 | fail (height) |
| Close | 56×20 | fail (height) |
| "WPN" caption | 24×5 | not a control; unreadable |
| `#gtip` font | 13px (14px only kicks in at `min-width: 900px`, line 171) | n/a |

`#gtip` (121–122, 4087–4103) is `position: fixed` in CSS pixels. It does not inherit the satchel transform or `SCALE`.

The mobile hold card is a different path. Ground and slot presses of ~350ms call `showTip` (`touchItemStart` 4159, `slotTipHandlers` 4188). Inside the satchel, `showTip` is wrapped to `showItemHold711` when `slotLP` is set (12432–12434), which builds `#holdStats` with `pxText`. `#holdStats` is `position: fixed` on the body (421), not inside `#satArt`, so the pack's CSS scale does not apply. `uiEff718` is `round(satchelScale × dpr)`. At phone scale 1 and DPR 3 that is 3, and `pxText` draws an 8px face times that factor into a 3× backing store, which comes out to about 8 CSS px of type in a card hardcoded around 200×220 CSS px (`showHold711` 12407–12422). Readable as device pixels (about 24px) and still a fixed CSS size, unrelated to `SCALE` and unrelated to PR #40.

### 5. Touch targets and safe area

`--hud` on the three touch viewports was 0.84, 0.84, and 0.96. Base sizes come from the CSS (`#bAtk` 88, skills/roll 56, `#bHP`/`#bInv` overridden to 48 at line 270, `#tPause` 32, `#tMap` 48, `#glHud` 28 and **not** inside the `--hud` transform). After `--hud`:

| Control | 412×915 and 390×844, DPR 3 | 768×1024, DPR 2 | ≥ 44 CSS px |
| --- | ---: | ---: | --- |
| Attack | 73.92 | 84.48 | pass |
| Roll | 47.04 | 53.76 | pass |
| Heal / mana / satchel | 40.32 | 46.08 | fail on the phones, pass on the tablet |
| Map | 40.32 | 46.08 | fail on the phones, pass on the tablet |
| Pause | 26.88 | 30.72 | fail |
| Light dev button | 28 | 28 | fail, and it is not scaled by `--hud` |
| Joystick base | 120 × 0.84 = 100.8 CSS | 115.2 CSS | pass |

Buttons are anchored with `right` / `bottom` plus `env(safe-area-inset-*)` (41–48, 75, 229–232). The joystick origin is divided by `hudScale()` so the `--hud` transform does not walk it off the corner (`joyRest` 4431). That coupling has to stay if `--hud` changes.

Canvas safe area is a second mechanism, and only while `touchMode` is on. `#safeProbe` (190) carries `padding: env(safe-area-inset-*)`. `readSafe074` (10000–10005) converts those CSS pixels to logical HUD pixels with `k = dpr / SCALE`, plus 4px when any inset is set. `hudInset074` (10006–10010) translates the HUD by that and shrinks `VW`/`VH` for the draw. Desktop passes a zero inset on purpose. `#deskHud` does not consult `env()` at all; it is pinned to the canvas rect.

Chrome in this run reports env insets of 0. A synthetic `window.__safeInsets = { t: 47, b: 34 }` on the 390×844 DPR 3 phone moved the text-layer ink from y=35 to y=191. That is `ceil((47+4) × 3/6) = 26` logical pixels times `hudPresent` 6. The DOM attack and pause buttons stayed at the same `top` (748.23 and 813.75), because `__safeInsets` does not change `env()`. Screenshot: `tools/audit/out/hud/after-phone-390x844-safe.png`. A real notch will move the DOM cluster and the canvas HUD by different rules, and the desktop bar will ignore the home indicator.

## Did PR #40 cause it?

No. At zoom 1 every HUD number in this audit matches across `743c826` and `def57ea`: `SCALE`, `VW`×`VH`, canvas font, survival bar, desk slot, globe, 11px type, `--hud`, and satchel scale. The screenshots of the bottom band match. See `tools/audit/out/hud/contact-sheet.png`.

PR #40's HUD work is the overlay used only when `worldPix !== SCALE` (`paintHudOverlay`, `textPixHold`). Its job is to stop the world zoom from resizing the bars. The pre-PR #40 HUD was already drawn after `zoomApply` restored the transform, so zoom-out was already not shrinking the HUD. The new farthest step shrinks world labels less than the old 0.25× step (18px vs 12px at 1440p). Nothing in the PR #40 diff changes `placeDesk101`, `buildDesk`, `fitUi101`, `satchelMetrics`, `drawHUD`, or `drawText`'s 6px base.

## PR #39 and the mobile tooltip

PR #39 (`cursor/early-loot-level-gate-e8cc`, open) gates `makeItem0` so a level 1–2 character does not roll rares or uniques. The diff does not touch `drawText`, `textW`, `labelShown`, `groundLabel`, `#gtip`, `showHold711`, `satchelMetrics`, or the desk bar. The branch contains `def57ea`, so it inherits the PR #40 camera and this same HUD math.

What it does change is the string that lands in `g.item.name`. World labels print `name.toUpperCase()` in `RCOL[rarity]` on a plate sized by `textW` at 6px. Early names become ordinary magic names (shorter, blue) instead of rare or unique names (longer, gold). The face size does not change. A shorter name makes a narrower plate, which can hide how small the type is until level 3, when the old long names return on the same 6px / 11px metrics. Required level is part of the hold card and the item card (`itemStatLines711`), not part of the floating world label.

The mobile tooltip system is unchanged by either PR. Quick tap still picks up. A 350ms hold still opens `#gtip` on the ground and `#holdStats` in the satchel. Both are fixed CSS layouts. Neither reads `SCALE` or `worldPix`.

## Sizing table

Device pixels are physical. "%H" is the device height divided by the physical screen height. Canvas font is the Pixelify em (`6 × SCALE` at zoom 1). Desk font is the computed 11px face times DPR. Before and after match on every zoom-1 row; the zoom-far rows are the only split. Satchel "WPN" is the character-tab caption's border box.

| Viewport | Phys. height | SCALE | Canvas font | Survival bar | Desk slot | Desk 11px font | Band | Satchel | WPN label |
| --- | ---: | ---: | --- | --- | --- | --- | --- | ---: | --- |
| 1280×720 DPR 1 | 720 | 4 | 24px, 3.33% | 20px, 2.78% | 48px, 6.67% | 11px, 1.53% | 104px, 14.4% | ×3 | 72×15 |
| 1920×1080 DPR 1 | 1080 | 6 | 36px, 3.33% | 30px, 2.78% | 48px, 4.44% | 11px, 1.02% | 156px, 14.4% | ×4 | 96×20 |
| 2560×1440 DPR 1 | 1440 | 8 | 48px, 3.33% | 40px, 2.78% | 48px, 3.33% | 11px, 0.76% | 208px, 14.4% | ×5 | 120×25 |
| 3840×2160 DPR 1 | 2160 | 12 | 72px, 3.33% | 60px, 2.78% | 48px, 2.22% | 11px, 0.51% | 312px, 14.4% | ×8 | 192×40 |
| 2048×1152 DPR 1.25 | 1440 | 8 | 48px, 3.33% | 40px, 2.78% | 60px, 4.17% | 13.8px, 0.95% | 195px, 13.5% | ×4 | 120×25 |
| 1707×960 DPR 1.5 | 1440 | 8 | 48px, 3.33% | 40px, 2.78% | 72px, 5.00% | 16.5px, 1.15% | 156px, 10.8% | ×3 | 108×22.5 |
| 412×915 DPR 3 | 2745 | 7 | 42px, 1.53% | 35px, 1.27% | touch HUD, no desk bar | — | — | ×1 | 72×15 dev (24×5 CSS) |
| 390×844 DPR 3 | 2532 | 6 | 36px, 1.42% | 30px, 1.18% | touch HUD | — | — | ×1 | 72×15 dev (24×5 CSS) |
| 768×1024 DPR 2 | 2048 | 9 | 54px, 2.64% | 45px, 2.20% | touch HUD | — | — | ×1 | 48×10 dev (24×5 CSS) |

Zoom-far at 2560×1440, DPR 1:

| Build | Zoom | Label face | HUD face |
| --- | ---: | ---: | ---: |
| `743c826` | 0.25 | 12px (0.83% H) | 48px (3.33% H) |
| `def57ea` | 0.375 | 18px (1.25% H) | 48px (3.33% H) |

Representative shots:

- 1440p bottom band, both builds: `before-2560x1440-bottom.png`, `after-2560x1440-bottom.png`
- 4K bottom band (same 48px cluster in a taller frame): `after-3840x2160-bottom.png`
- 1440p full frame, labels at 1×: `after-2560x1440.png`
- Zoomed out, labels shrink, bar does not: `before-2560x1440-far.png`, `after-2560x1440-far.png`
- Phone portrait, touch cluster: `after-phone-412x915.png`
- Tablet: `after-tablet-768x1024.png`
- Satchel ×5: `after-2560x1440-satchel.png`
- Contact sheet: `contact-sheet.png`

## Proposed HUD scale

Keep world `SCALE` and `worldPix` exactly as they are. The camera zoom and the amount of dungeon on screen should not move when the player asks for a bigger HUD.

Add one integer, `hudScale`, chosen from the physical height so Windows DPR cannot double-apply:

```text
userMul = { auto: 1, 75: 0.75, 100: 1, 125: 1.25, 150: 1.5 }[settings.hudScale]
hudScale = clamp(round(physH * 0.15 * userMul / 52), 1, 6)
```

`52` is the band unit `placeDesk101` already uses. `0.15` is the fraction that function already targets. At DPR 1 this is the same integer `placeDesk101` computes today and then ignores. At 2560×1440 it is 4 for Auto/100%, 3 for 75%, 5 for 125%, 6 for 150%. At 720p Auto it is 2. At 1080p Auto it is 3. At 4K Auto it is 6. At 2048×1152 DPR 1.25 and at 1707×960 DPR 1.5 the physical height is still 1440, so Auto stays 4 and the cluster stays the same device size as 100% (slot 48×4 = 192 device px, 13.3% of 1440). CSS size is `designPx * hudScale / dpr`, rounded so the device size is an integer. Pixel art stays on whole pixels. `image-rendering: pixelated` stays.

Apply `hudScale` only to the desktop DOM bar:

- Slot side `48 * hudScale / dpr` CSS px. Globe side `56 * hudScale / dpr`.
- Well and globe numbers `11 * hudScale / dpr`. Hotkeys `9 * hudScale / dpr`.
- Band height `52 * hudScale / dpr` CSS px, still capped around 22% of the CSS height so a 150% setting cannot eat the screen.
- Hotkey `bottom: 2px` (inside the slot) so the label is not clipped.
- Rebuild the bar when `hudScale` changes. `buildDesk` should read the integer instead of hardcoding `k = 1`. Anchoring stays what `placeDesk101` does now: the bar's box is the canvas rect, children are `flex-end` / `space-between`. Width budget at hudScale 4 on 2560px is about 2×224px globes plus 7×192px slots, under 1800px, so the cluster still fits with a flexible well.

Leave canvas body text on `6 × SCALE`. It is already 3.33% of a 16:9 screen, and multiplying it by `hudScale` again would turn "LV 1" into a 192px headline at 1440p. The canvas orbs are hidden behind the bar; once the DOM globes are actually 56×hudScale they are the resource gauges. Optional second step, still independent of zoom: draw the F/W/R tracks in screen space at a thickness of `max(5 * SCALE, round(physH * 0.012))` so they stay at least ~1.2% of the physical height instead of a permanent 5 texels. Do that on the HUD overlay (or the text/HUD layer), not by changing `VW`/`VH`.

World item labels should stop following `worldPix`. Rasterize them at the HUD face (`6 × SCALE`, times `userMul` if you want the setting to reach names) in screen space, the same way the overlay already isolates HUD text with `textPixHold`. Zoom-out then reveals more dungeon without shrinking the names. Plates stay 7 HUD pixels tall so they still match the glyph.

Do not feed `hudScale` into `satchelMetrics`. The pack already has its own fit. Two optional satchel fixes, separate from this bug: give `.lbl` a larger artboard size than 4px, and on portrait phones use the width-bound fractional scale the landscape path already has (`mobileLand`) instead of getting stuck at ×1. Tooltip `#gtip` and `#holdStats` should use the same `hudScale` face if they are going to stay readable at 4K; today they are 13–14 CSS px and ~8 CSS px respectively.

Touch keeps `--hud`, with a floor instead of the desktop formula. The desktop formula uses physical height and would turn a 48px button into something wider than a phone. Concrete floor, in CSS pixels, after `--hud`:

- Every `#touch .btn`, `#tPause`, `#tMap`, and `#glHud` is at least 44×44 CSS px.
- Measured gaps: pause needs the scale to reach 44/32 = 1.375, or its base size becomes 44; heal/map need at least 44/48 = 0.92 so the 0.84 phone floor is what pushes them under the line; `#glHud` needs a 44px box of its own because it is outside the transform.
- Keep `transform-origin: 0 0` plus the `100% / var(--hud)` box, and keep `joyRest` dividing positions by `hudScale()`. Re-run `joyRest` and `placeDesk101` whenever the setting changes.
- Safe area: add `env(safe-area-inset-bottom)` to the desk band's bottom offset, and keep `readSafe074` for the canvas HUD. One source (`#safeProbe`) should feed both, so a notch cannot move the canvas bars and leave the DOM cluster on top of them.

### Setting

Store it on the settings object (`index.html` 918) and save it with `saveSettings` (921) under `localStorage['cryptdelve-settings']`.

```text
settings.hudScale = 'auto' | '75' | '100' | '125' | '150'
```

Default `'auto'`. Missing key means auto, so old settings blobs keep working. Do not write it into the run save (`localStorage['cryptdelve']`, `save()` at 3935) or the profile slots. A menu row next to the existing audio options (`aopts`, around 68–70) is enough: Auto, 75, 100, 125, 150. Changing it calls the same path as `resize` (recompute `hudScale`, rebuild the desk, `joyRest`).

## Implementation steps

1. Add `computeHudScale(cssW, cssH, dpr, settings.hudScale)` next to `backingMetrics` (9470). Pure function, no DOM. Unit-test it at the nine viewports above plus the two zoom ratios.
2. Call it from `fitUi101` / `placeDesk101`. Pass the integer into `buildDesk`. Delete the hardcoded `k = 1`.
3. Scale slot, globe, well, and key CSS from that integer. Round device pixels first, then divide by DPR. Keep `image-rendering: pixelated`.
4. Move hotkey labels inside the slot (`bottom: 2px`).
5. Pad `#deskHud` with `env(safe-area-inset-bottom)`.
6. In `drawTextRaw`, when the draw is a world label (the ground-name calls at 8607–8612), use `textPixHold`-style HUD pixels (`SCALE`) instead of `worldPix`, including while the overlay is up. Do not change floater combat text in the same pass unless you want it locked too; those read as world juice and can stay on `worldPix`.
7. Add the settings field, the menu control, and the localStorage round-trip. Confirm a saved game written before and after the change still loads, and that the run JSON has no `hudScale` key.
8. Raise the touch floor to 44 CSS px and include `#glHud`. Re-check the 390×844 cluster for overlap; the pause button is the one that has to grow the most (26.9 → 44).
9. Leave `SCALE`, `worldPix`, `zoomSixth`, and `satchelMetrics` alone in this change.

## Regression test plan

Extend the style of `tests/camera-zoom.html`. Headless Chrome, both `743c826` and the new commit, so a future zoom change cannot silently resize the bar.

- `computeHudScale` at 1280×720, 1920×1080, 2560×1440, 3840×2160, all DPR 1: Auto returns 2, 3, 4, 6. 75/100/125/150 at 1440p return 3, 4, 5, 6. Values are integers in 1..6.
- Same physical 2560×1440 at DPR 1, 1.25 (CSS 2048×1152), and 1.5 (CSS 1707×960): Auto returns the same integer, and the slot's device height matches within 1px.
- Zoom 1 and farthest zoom at 2560×1440: desk slot device size identical; canvas HUD face identical; world-label face identical to the HUD face (this is the behavior change in step 6). `worldPix` and `viewWorldSize` still match `tests/camera-zoom.html`.
- `cryptdelve-settings` contains `hudScale` after toggling 150. `cryptdelve` JSON does not. Reloading with no key behaves as auto.
- Touch, 412×915 DPR 3, 390×844 DPR 3, 768×1024 DPR 2: every `#touch .btn`, `#tPause`, `#tMap`, `#glHud` box is ≥ 44 CSS px. Attack stays on screen. Joystick rest position stays inside the viewport.
- Synthetic `__safeInsets` `{t:47,b:34}` on 390×844 DPR 3: text-layer HUD origin shifts by `ceil((47+4)*dpr/SCALE)` logical pixels, and the DOM cluster's `bottom` grows by the same CSS inset. Buttons still contain their glyphs.
- Satchel scale at 2560×1440 stays ×5 when `hudScale` changes. Slot caption test is separate if the 4px label is fixed later.
- Existing `tests/camera-zoom.html`, `tests/v075.html` zoom checks, and `tests/v076.html` fog checks stay green. `version.json` stays 0.7.18 until a real release.

## Performance and compatibility

- The desk art is already small PNGs drawn with `image-rendering: pixelated`. Scaling those boxes in CSS does not allocate a framebuffer. Rebuilding the bar on resize is a handful of DOM nodes. Do not also blit the HUD into a second full-resolution canvas; `#textLayer` is already `css × dpr` (about 33MB of RGBA at 4K).
- `hudScale` maxes at 6, so a 150% setting on 4K cannot request a seventh enlargement. The 22% band cap stops the frame covering the playfield.
- Fractional DPR: compute the integer in device pixels, then the CSS length is `device / dpr` and may be fractional. That is the same trick `syncTextLayer718` uses to land on whole device pixels.
- Do not use CSS `zoom`. The comment at line 259 records that Chrome already divides a zoomed percentage by `zoom` and the touch HUD slid off the glass.
- `visualViewport` is already what `resize` listens to (690–696, 737). `placeDesk101` reads the canvas rect, so a toolbar show/hide on iOS moves the bar with the canvas. Recompute `hudScale` there too.
- Moving a window between a DPR-1 and a DPR-2 monitor must recompute from `devicePixelRatio` inside `resize`. The setting itself stays a preference, not a cached pixel size.
- Pixelify at `11 * hudScale` (44px at 1440p Auto) is a size the text layer already rasterizes for canvas text. No new font asset.
- The dark-fantasy frame stays the existing 9-slice and the existing globe/slot PNGs. This change only stops drawing them at a fixed 48px inside a frame that already grew.
- Risk worth a playtest: at hudScale 4 the cluster is four times wider than today. The width budget fits 2560 and 3840, and it is tight at 1280 if the well also has a minimum. If 1280 overflows, let the well shrink before the slots drop below `48 * hudScale`, and wrap nothing.
- Risk: locking world labels to HUD size makes them larger than nearby sprites when zoomed out (18px today vs 48px after, at 1440p farthest). That is the point of separating them from the camera. Combat floaters can stay on `worldPix` so crit numbers still match the creature they belong to.

## How to reproduce

```text
# from the repo root, with puppeteer-core installed
node tools/audit/hud-scale-audit.mjs
```

The script serves `index.html` at `def57ea` and `git show 743c826:index.html` (with a `<base href="/">` so assets resolve). Output lands in `tools/audit/out/hud/`. `HUD_ONLY=2560x1440` limits the run. Chrome was `/usr/bin/google-chrome`, headless, `--no-sandbox`.
