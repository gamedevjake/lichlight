# Lichlight SE1 — Super Elite art pack (PARKED)

20 mid-tier gate sub-bosses traced from Jake's concept sheet (`super_elites_sheet_20.jpg`, 5×4, L→R top→bottom).
Brief: `cryptdelve_loot/lichlight_v0717_next.md` § SE1. **Parked — live untouched; Neo wires after Eve+Jake pre-GO + Jake GO.**

## Contract (same as the CORE enemy/boss anim pack)
- One horizontal strip per (id, state): `sprites/se_<slug>/se_<slug>_<state>.png`. Frames L→R, no padding. **Cell 48×48**; height = 48, width = 48 × frames (Neo derives frame count from width). Max strip 384px wide (8 frames).
- Hard alpha 0/255, 1px `#0e0a12` outline, right-facing only (Neo mirrors), bottom-centre pivot, feet on row 47.
- Per-SE palette ≤16 colours + outline, sampled from the sheet. No baked ground shadow or glow.
- Bob is baked into idle/walk. Floaters (pale_shade, veilwraith, ymir, vorag) lift 1–2px on idle/walk frames 2–4; f1 always sits on the ground. Hover/drop height stays in code.
- Portrait: `sprites/se_<slug>/se_<slug>_portrait.png`, 64×64 slate+brass card (same style as the boss portraits, with 3 brass "SE" pips at top centre). Made from the higher-res native trace.

| state | frames | ms | loop | hitFrame | notes |
|---|---|---|---|---|---|
| idle | 4 | 200 | loop | – | breath/bob |
| walk | 4 | 130 | loop | – | |
| attack | 4 | 95 | once | **3** | f1 anticipate, f2 wind, f3 hit, f4 recover |
| taunt | 6 | 110 | once | – | intro invuln showboat (squash → stretch → peak gesture + shout ticks → hold f6 until taunt-done SFX) |
| death | 8 | 110 | once, hold last | – | corpse on ground line |
| powerup | 6 | 100 | once | **4** | f1 crouch, f2 energy rim, f3 white-hot surge + crackle, **f4 RELEASE** (spawn `powerupVfx`, deal damage), f5–6 recover |
| hurt *(optional bonus)* | 2 | 60 | once | – | CORE parity; fallback = existing white flash |

## Roster (stable ids)
Trinity named the five unlabeled row-1 portraits and the armored ghost in row 2 (Pale Shade, Bonewarden, Arachnex, Veilwraith, Magmafiend, Graveguard).

| # | sheet | id | display | archetype | anim family | attackVfx | powerupVfx |
|---|---|---|---|---|---|---|---|
| 1 | r1c1 | `se_pale_shade` | Pale Shade | spirit | spirit | `spectral_wave` | `shadow_bolt` |
| 2 | r1c2 | `se_bonewarden` | Bonewarden | undead melee | biped | `smash_shockwave` | `bone_shatter` |
| 3 | r1c3 | `se_arachnex` | Arachnex | beast/horror | quad | `web_lash` | `poison_spray` |
| 4 | r1c4 | `se_veilwraith` | Veilwraith | spirit | spirit | `spectral_wave` | `frost_burst` |
| 5 | r1c5 | `se_magmafiend` | Magmafiend | elemental (fire) | heavy | `fire_burst` | `smash_shockwave` |
| 6 | r2c1 | `se_graveguard` | Graveguard | spirit (armored) | biped | `slash_arc` | `spectral_wave` |
| 7 | r2c2 | `se_morbius` | Morbius | undead melee | biped | `poison_spray` | `bite_chomp` |
| 8 | r2c3 | `se_archon` | Archon | mage/caster | robe | `arcane_orb` | `rune_slam` |
| 9 | r2c4 | `se_ironbound` | Ironbound | undead melee (armored) | heavy | `smash_shockwave` | `rune_slam` |
| 10 | r2c5 | `se_ymir` | Ymir | elemental (ice) | float | `frost_burst` | `smash_shockwave` |
| 11 | r3c1 | `se_thanatos` | Thanatos | spirit/caster | biped | `shadow_bolt` | `arcane_orb` |
| 12 | r3c2 | `se_nyx` | Nyx | beast/horror (assassin) | biped | `dagger_flash` | `poison_spray` |
| 13 | r3c3 | `se_golgoth` | Golgoth | golem | heavy | `smash_shockwave` | `rune_slam` |
| 14 | r3c4 | `se_vorag` | Vorag | beast/horror | float | `bite_chomp` | `shadow_bolt` |
| 15 | r3c5 | `se_roderick` | Roderick | spirit (knight) | biped | `slash_arc` | `spectral_wave` |
| 16 | r4c1 | `se_blight_weaver` | Blight-Weaver | mage/caster (gorgon) | slither | `bite_chomp` | `poison_spray` |
| 17 | r4c2 | `se_xalkor` | Xal'kor | mage/caster | robe | `shadow_bolt` | `bone_shatter` |
| 18 | r4c3 | `se_ember_fiend` | Ember-Fiend | elemental (fire) | biped | `fire_burst` | `lantern_flare` |
| 19 | r4c4 | `se_corpse_stalker` | Corpse-Stalker | undead melee | biped | `slash_arc` | `bone_shatter` |
| 20 | r4c5 | `se_overseer` | Overseer | mage/caster | robe | `lantern_flare` | `arcane_orb` |

## Attack VFX kits — `vfx/vfx_<kit>.png`
48×48 frames, hard alpha, outlined, play once. Each SE's mapping is `attackVfx` / `powerupVfx` in `manifest.json`. Kits are shared across SEs (many-to-one), so one kit can be tinted or reused for later SEs.

| kit | frames | ms | anchor | used by |
|---|---|---|---|---|
| `slash_arc` | 5 | 70 | centre on weapon tip / front of body at chest height | graveguard, roderick, corpse_stalker |
| `smash_shockwave` | 5 | 80 | bottom-centre on impact point (ground line = row 42-44) | bonewarden, magmafiend, ironbound, ymir, golgoth |
| `frost_burst` | 5 | 80 | centre on target / hit point | veilwraith, ymir |
| `fire_burst` | 6 | 80 | centre on target / hit point | magmafiend, ember_fiend |
| `poison_spray` | 5 | 80 | left-centre at mouth/hand; sprays right (mirror for left-facing) | arachnex, morbius, nyx, blight_weaver |
| `shadow_bolt` | 5 | 70 | travels L->R inside the cell; spawn at hand, or loop f2-f4 as a projectile | pale_shade, thanatos, vorag, xalkor |
| `arcane_orb` | 6 | 90 | centre on hand (f1-4 charge) then target (f5-6 burst) | archon, thanatos, overseer |
| `bone_shatter` | 5 | 80 | centre on hit point | bonewarden, xalkor, corpse_stalker |
| `web_lash` | 5 | 70 | left-centre at spinneret; strand lashes right and webs at f3+ | arachnex |
| `spectral_wave` | 5 | 80 | band sweeps L->R through the cell | pale_shade, veilwraith, graveguard, roderick |
| `bite_chomp` | 4 | 70 | centre on target; jaws close on f3 | morbius, vorag, blight_weaver |
| `lantern_flare` | 5 | 80 | centre on lantern / caster hand | ember_fiend, overseer |
| `dagger_flash` | 4 | 60 | centre on target; X cross on f3 | nyx |
| `rune_slam` | 6 | 90 | bottom-centre on target (ground rune circle + pillar) | archon, ironbound, golgoth |

## Shield FX pool (20 reusable looks) — `shields/shield_fx_NN_<slug>.png`
- This is a **pool. No look is locked to an SE.** At spawn Neo sets `e.shieldFx` from the pool (random is fine; avoid repeating the previous floor's look). Any SE can wear any shield.
- 64×64 overlay, 4-frame loop. Draw at **(bodyCellX − 8, bodyCellY − 8)**, so the ring centre lands on the 48×48 body centre. Draw over the body. The centre is transparent so the body shows through (verify checks centre coverage ≤8%).
- Draw while `shield > 0`; hide at 0 (a break flash is up to Neo, or wave 2). The SE shield is 10% of max HP (separate from B1).
- Names: use the index (`shield_fx_07`) or the slug (`holy_halo`). Both are in `manifest.json → shields.pool`.

| # | id | slug | file | ms |
|---|---|---|---|---|
| 01 | `shield_fx_01` | `rune_ring` | `shields/shield_fx_01_rune_ring.png` | 150 |
| 02 | `shield_fx_02` | `hex_barrier` | `shields/shield_fx_02_hex_barrier.png` | 140 |
| 03 | `shield_fx_03` | `ice_shell` | `shields/shield_fx_03_ice_shell.png` | 170 |
| 04 | `shield_fx_04` | `flame_veil` | `shields/shield_fx_04_flame_veil.png` | 120 |
| 05 | `shield_fx_05` | `bone_cage` | `shields/shield_fx_05_bone_cage.png` | 180 |
| 06 | `shield_fx_06` | `shadow_orbit` | `shields/shield_fx_06_shadow_orbit.png` | 140 |
| 07 | `shield_fx_07` | `holy_halo` | `shields/shield_fx_07_holy_halo.png` | 160 |
| 08 | `shield_fx_08` | `poison_bubble` | `shields/shield_fx_08_poison_bubble.png` | 170 |
| 09 | `shield_fx_09` | `arcane_sigil` | `shields/shield_fx_09_arcane_sigil.png` | 150 |
| 10 | `shield_fx_10` | `storm_arc` | `shields/shield_fx_10_storm_arc.png` | 120 |
| 11 | `shield_fx_11` | `blood_thorns` | `shields/shield_fx_11_blood_thorns.png` | 160 |
| 12 | `shield_fx_12` | `spectral_chains` | `shields/shield_fx_12_spectral_chains.png` | 150 |
| 13 | `shield_fx_13` | `stone_aegis` | `shields/shield_fx_13_stone_aegis.png` | 170 |
| 14 | `shield_fx_14` | `frost_crystals` | `shields/shield_fx_14_frost_crystals.png` | 150 |
| 15 | `shield_fx_15` | `void_rift` | `shields/shield_fx_15_void_rift.png` | 130 |
| 16 | `shield_fx_16` | `ember_motes` | `shields/shield_fx_16_ember_motes.png` | 130 |
| 17 | `shield_fx_17` | `web_shroud` | `shields/shield_fx_17_web_shroud.png` | 180 |
| 18 | `shield_fx_18` | `soul_wisps` | `shields/shield_fx_18_soul_wisps.png` | 140 |
| 19 | `shield_fx_19` | `iron_bulwark` | `shields/shield_fx_19_iron_bulwark.png` | 180 |
| 20 | `shield_fx_20` | `eclipse_crescent` | `shields/shield_fx_20_eclipse_crescent.png` | 150 |

## Files
```
super_elites/
  super_elites_sheet_20.jpg     Jake's concept sheet (kept)
  sprite_data.json              traced masters: native rows + 48-cell 'rows' + palette per SE (hand-editable)
  manifest.json                 ids, states, frames, ms, loop, hitFrame, attackVfx, powerupVfx, cell, vfx kits, shield pool
  sprites/se_<slug>/            7 strips + portrait per SE
  vfx/  shields/
  previews/                     se_roster_idle_preview.png, se_anims_preview_x2_part1-4.png,
                                shield_pool_preview.png, vfx_kits_preview.png, gif/ (one GIF per strip/kit/shield; review only, not assets)
  tools/                        trace_se.py (one-time sheet trace), areafit.py, core_anim_ops.py (vendored CORE ops),
                                gen_super_elites.py (generator), verify_se.py
  lichlight_super_elites.zip
```
Rebuild: `cd tools && python3 gen_super_elites.py && python3 verify_se.py`. The build is deterministic: no RNG, and re-runs are byte-identical.

## Trace notes
The sheet is real pixel art on a 6px grid (phase x%6=0, y%6=2), which gives 400×298 native pixels. Each native pixel is centre-sampled, the slate background is flood-filled out, and the name labels are dropped. Each SE is quantized (deterministic k-means) to ≤15 colours. An area-coverage pixel downscale (`areafit.py`) fits it into a 36px box for the 48 cell. That downscale keeps the sheet's own outline and rare accents (eyes, runes, slime).
