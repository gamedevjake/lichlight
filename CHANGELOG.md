# Changelog

All notable changes to Lichlight, newest first. Each version is also published on the [GitHub Releases page](https://github.com/gamedevjake/lichlight/releases).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [0.7.18] - 2026-11-04

_Super Elite deaths stay playable, and the words are sharp_

### Fixed
- Killing a Super Elite no longer freezes the run or wipes the health bars. The stairs open, the fight music stops, and that character can move, open the satchel, and save. Loading the same character afterwards stays in the room with the Super Elite gone. A save that was stuck in that moment comes back playable.
- Words on the field, the health display, the depth banner, and the satchel pages are sharp again. The tab labels and buttons were already sharp and stay that way.

## [0.7.17] - 2026-11-04

_Super Elites, shields, and a font you can read_

### Added
- Hit text and enemy health can be turned off from the menu. Bosses and Super Elites still show their bars. When enemy health is on, the enemy you are pointing at or fighting gets a bar at the top of the screen, including on a phone.
- Bosses have more health, and a blue shield that has to break before their health moves.
- A Super Elite waits at the way down on every floor. You cannot descend until that one is dead. They drop from above, taunt, and only then can be hurt. Each one carries a random shield look, and the kill drops gold, food, a unique, and rarely a Gate Key.

### Changed
- All of the words you read, on the field and in the menus, use Pixelify Sans.
- Damage numbers, heals, and pickup text leave sooner, and they fade out over the last part of that time. Big banners stay as long as they did.
- Music can be turned up louder. The music slider still sets how loud it is.

### Fixed
- Dragging the satchel's item text on a phone no longer blurs the words.
- The full map uses only the map slider for how solid it looks. Dimming the rest of the interface no longer washes the map out.

## [0.7.16] - 2026-11-03

_Painted foes, a fuller character page, and a pedlar you can read_

### Added
- The character page shows a larger portrait, with your gear set around it and your full record filling the page.
- A bow in your hands is drawn and fired as a bow. Swords still swing.
- Boss fights play the new layered music, including on phones, and fall back to the old boss theme if a stem will not load.
- Enemies and bosses use the new painted sprites, and they idle, walk, attack, flinch, and die.
- Crypt rooms use the new stonework. Some rooms are the organic cut. Props and hanging cages dress the halls.

### Changed
- Damage numbers fly off in the direction of the hit, then fade. A critical hit stays up longer and is drawn larger.
- Switching satchel tabs makes a short flick.
- The Hollow Pedlar's stall uses the same frame and buttons as the satchel. Every row can be tapped, and the words are no longer smeared.

### Fixed
- Ethereal Shift's shimmer matches your height.
- Long item powers, such as Barrier, are no longer cut off on the left and right.

## [0.7.15.2] - 2026-11-01

_The pack fills a phone turned sideways_

### Fixed
- The backpack on a phone turned sideways fills most of the screen. The tabs stay on the glass, and the bottom of the bag can sit past the edge. On a computer monitor the bag stays the size it was, with the life and mana bars still showing in the corner.

## [0.7.15.1] - 2026-11-01

_The pack stays large on a short phone_

### Fixed
- The backpack on a phone turned sideways stays large. A short screen no longer shrinks it to a small bag in the middle of the glass.

## [0.7.15] - 2026-11-01

_A bigger pack, and the whole spell name_

### Changed
- The backpack on a wide screen is larger. On a 1080p monitor it fills most of the view, and the life and mana bars in the corner still show. A phone on its side stays the size that fits the screen.

### Fixed
- Spell names in the Lich Tome no longer cut off. Ethereal Shield is written out in full.

## [0.7.14] - 2026-11-01

_The pack keeps its shape_

### Fixed
- **Backpack layout.** On a wide screen the bag stays the compact pack: seven columns of square slots, and the item card fills the right side. It no longer stretches into a long strip.
- **Bag tabs.** The tabs stay the gold all-caps labels and sit on the frame. A wide screen no longer turns them into tiny mixed-case words.

## [0.7.13] - 2026-11-01

_The chest waits, the words are whole, and the bosses have a pulse_

### Added
- **Boss gate.** The pre-fight talk is a larger framed window: name plate, title, portrait at the top right, and the boss's lines in a parchment bubble. Words appear one at a time. Click the bubble or press Space to finish the line. Esc or Enter still starts the fight.
- **Boss music.** Each boss fight layers three stems as their life drops (full, then the middle layer, then the top). The music loops with a short crossfade, fades out when the boss or you die, and the dungeon music comes back. Mother Murk and every other even boss use the first theme. The Gnawer King, Oswin, and the other odd bosses use the second.

### Changed
- **Item cards** spell the stats out: Damage, Speed, Defense, Block Chance, Critical Strike Chance, Required Level, Durability. An upgrade compared with what you have worn is green. A downgrade is red.
- **The name** on a card is a little larger, centered when it is one line, and no longer sits on the tan banner or between the side dashes. Long names still wrap.
- **Spell buttons** on the HUD show up only after a spell is assigned to that slot. Empty slots stay hidden.
- **Breakables** only break when the swing, the staff, the bow shot, or the spell actually reaches them.
- **The victory chest** stays shut until you open it. It still holds 100 gold. Coins sprayed by the boss's death are about half of what they were, and never more than 49, so the chest is the larger pile.
- **The trader** is on every boss floor, including depth 5. If the side room will not fit, the pedlar waits in the boss room and steps out after the fight.
- **The Hollow Pedlar's counter** matches the satchel. A wide dark panel, gold pixel borders, spelled-out stock rows, and a 5 by 4 sell grid. More than twenty backpack items scroll instead of disappearing. BUY ITEM, SELL ITEM, SELL ALL, and REPAIR ALL sit in the footer. LEAVE is the red bar under them.
- **Satchel buttons** along the bottom stay in one place when you select a different item. Long cards scroll inside the panel, with a fade when more text is waiting.

### Fixed
- Press-and-hold item stats no longer open on the Inventory tab, where the card is already open. On the other tabs the card stays where it first appeared instead of jumping to the middle of the screen.

## [0.7.12.1] - 2026-10-31

_Long item names stay inside the card_

### Fixed
- **Item names** in the satchel wrap onto more than one line when they are too long for the card. A name like Vampiric Broad Sword of the Whale sits on two centered lines, with a line under it, then the item type, then the stats. The card grows just enough to hold the extra line. Press-and-hold uses the same wrap. Short names stay on one line.

## [0.7.12] - 2026-10-31

_Readable cards, a wider pedlar, bows in the loot_

### Added
- **Scroll fades.** Shop lists, the character sheet, the Lich Tome, notes, and long item cards fade at the top and bottom when there is more to read. Drag inside the panel to move them.
- **Bows drop.** A Short Bow can show up anywhere other weapons drop, including the trader. The three unique bows can roll with the other uniques.

### Changed
- **Damage numbers** show on enemies and bosses. Your own hits, burns, spikes, and pit falls no longer print a number on you. Healing and other words are unchanged.
- **Item cards** in the satchel and on press-and-hold use one line height, wrap the lore, and keep every stat. Compared with what you have worn, the difference is in red, like `DMG 8-14 (+3)`.
- **Lich Tome** lists learned spells in a grid of inventory-sized tiles with icons and names. Press and hold still opens the spell card.
- **Character** stats sit in two columns. The idle portrait is drawn at least twice as large and centered beside them.
- **The Hollow Pedlar** uses a wide bench: a buy list, a sell grid with the same square cells as the satchel, and a footer of SELL, SELL ALL, LEAVE, and REPAIR ALL. Sealed Uniques and Repair use the full width.
- **NEW** on a satchel cell is drawn on top of the frame.
- Opening the satchel within 5 seconds of a pickup lands on that pickup's tab. The newest pickup wins if you grabbed more than one kind. After 5 seconds the bag opens where you left it.

### Fixed
- Item stats and lore no longer draw on top of each other or cut off at the edge of the card.
- A locked chest no longer opens when you attack it, so a swing cannot spend a key. The action button still opens it. Unlocked chests still open the way they did.
- Clicking the far side of a bottomless pit no longer walks you the wrong way. The route goes around, or you stop if there is no way through.

## [0.7.11] - 2026-10-31

_The gate, the chest, and the card_

### Added
- **Shop in the boss room.** The Hollow Pedlar waits behind a gate in the boss room. The gate opens about three seconds after the boss falls. No shop before the first boss.
- **Exit scraps.** Four Map Fragments mark the exit door on the map. They do not reveal the floor.
- **Victory chest.** About two seconds after a boss falls, a wood and iron chest bursts open and spits 100 gold. A victory chant plays with the burst.
- **Boss laugh on the way down.** Using a dungeon exit plays a low laugh, once.
- **Map button.** It is the same size as the potions, and you can drag it with the other touch buttons. Dragged buttons snap to a small grid.
- **Character card.** The Character tab drops the Gate button and lists more of the run: necro potions, keys, death tolls, favorite spell, favorite weapon. Your hero stands there in the gear you have on, and idles.
- **Spell cards.** Press and hold a spell in the Lich Tome to read what it does. The page shows the spell's icon.
- **Puzzle loot.** A chest or secret that only opens after a puzzle always has loot, including one greater rare.

### Changed
- **Hellmouth** swallows ordinary enemies only. A boss in the maw takes 10% more damage while the skill lasts, and is not devoured.
- **Sconce doors** open when every sconce is lit, in any order.
- **Map opacity.** The slider, all the way up, makes the map 90% opaque.
- **Repair Potion** opens the Character panel so you can choose what to repair.
- **Examine** repeats the first line. It no longer says there is nothing else to see.
- **The move pad** stays where you put your thumb. The knob follows. The base does not slide until you let go.

### Fixed
- Puzzle doors block both ways until the puzzle is solved. A secret passage can no longer walk you around one. If you are already stuck on the far side, the door opens so you are not sealed in.
- Swiping across the spell buttons no longer leaves a spell held down, casting on its own.
- HUD buttons no longer draw text on top of the art.
- The satchel's new-item badge is no longer clipped by the button.
- Notes in the satchel scroll.
- Braziers stay cold, and use the unlit art, until you light them.
- Item stats in the satchel scroll, in the side panel and in the press-and-hold card. Footer buttons no longer sit on top of each other.
- Consumable slots draw their icons. Lich Tome spells draw theirs, in the same lettering as item stats.

## [0.7.10.3] - 2026-10-31

_The satchel matches the mock_

### Fixed
- The bag was still the old inventory with six tabs stuck on top. Inventory is the wide satchel from the mock: seven columns, three rows, and the item's stats in their own panel.
- An item's name, damage, and the line under it no longer draw on top of each other.
- Sort, Mark All Seen, and Drop All sit on the left. Equip, Drop, and Close sit on the right. Close leaves the bag. Close Notes only leaves the notes.

## [0.7.10.2] - 2026-10-31

_The screen sits in the middle_

### Fixed
- The whole screen sat down and to the right. The title, the buttons, and the settings were cut off along the right and the bottom. The same shift showed up in a run. The picture is centered again, on the title screen and while you play.
- The tabbed satchel is still there: Character, Inventory, Consumables, Notes, Lich Tome, and Map.

## [0.7.10.1] - 2026-10-31

_Plates, pages, and the tombstone_

### Added
- **Satchel tabs.** The bag is one wide panel: Character, Inventory, Consumables, Notes, Lich Tome, and Map. Inventory puts the item's stats beside the grid. Close leaves the bag. Close Notes only leaves the notes.
- **Lich Tome tabs.** Spells, Recipes, and Enchantments. Recipes and enchantments are empty for now. With the tome and no pages, the book says the pages were torn out.
- **Four spell slots.** From the tome, put any unlocked spell in a slot. The bar shows those four. Desktop uses brass life and mana globes and the same four slots, and the bar fits the window.
- **Tombstones.** Necro Potion brings you back on the same floor, leaves a stone where you fell, and marks that spot on the map. Another death adds another stone. The mark moves to the latest one.
- **Characters on pause.** Switch the active save without quitting to the title.

### Changed
- **HUD plates.** Attack, dodge, spells, potions, the satchel, light, examine, pull, pause, and the map sit on round plates. Pause and map are square, not squashed. The satchel icon is back.
- **Menus scale** so the title, pause, bag, and settings fit wide and tall screens.
- **Spells stay hidden** until you have the Lich Tome and that page. No locked books on the bar.
- **Spell pages wait** until the tome is in your pack. Cracked walls, pots, chests, and champions do not drop them before that.
- **Enemies lose interest.** If they cannot see you, or cannot reach you, they stop after about five seconds, show a question mark, and go back to patrol. They do not pace in place.
- **Spectral Clone** pulls aggro. Monsters chase the copy, not the tile you slipped to.
- **GL LIGHT** starts OFF until you turn it on.
- **Messages linger** about two seconds longer.
- **Starvation can kill.** An empty stomach drains life to 0. Thirst and exhaustion still stop at 1.
- **The Necro Potion counter** stays hidden until you find the first one.

### Fixed
- Right-click before the tome says "You have not discovered the Lich Tome". After the tome, with nothing to cast, it says "Discover spells hidden in the world to use the Lich Tome".
- An empty spell slot says "No spell assigned to that slot".
- The new spell buttons can be dragged in touch controls, and the spot sticks.
- Holding a charged attack no longer blocks dodge or a spell. A swipe across attack, dodge, and spells fires each one. Map, potions, mana, and the bag do not.

## [0.7.10] - 2026-10-30

_Lich Tome and the torn pages_

### Added
- **Lich Tome**: the first boss drops a book on the floor. Pick it up and the game tells you the pages have been torn out. Until you have the tome, spells do nothing.
- **Spell pages**: torn pages are hidden in cracked stone, pots and barrels, locked chests, secret rooms, and on champions. Each page puts one spell back in the tome: Fireball, Whirlwind, Frost Nova, Spectral Clone, Ethereal Shield, Ethereal Shift, or Hellmouth.
- **Spectral Clone**: sends a magenta copy of you along your aim. Monsters chase the copy. While it lasts, hits pass through you. It fades out after a few seconds.
- **Ethereal Shield**: a green ward for a short time. Blows that land hurt less. Your steps leave green sparks behind you.
- **Ethereal Shift**: you flicker out of reach. For a short time nothing can hurt you, and fire, poison, and webs do not take hold.
- **Hellmouth**: opens a burning pit under every monster you can see in front of you. Walls block it. The monster freezes, sinks into the floor, and is gone. A dark scar and ash remain.
- **Unique bows**: Scream of the Banshee, Spine of the First Lich, and Hellmouth Strider each fire a different arrow. A plain bow fires a cyan arrow.
- **New sounds** for the tome, the pages, the four spells, and the three unique bows.

### Changed
- **Floor braziers** that are out give off no light and stay hidden in the dark. Light one with your torch and the same bowl burns, with a short flicker.
- **Touch buttons, the move stick, and the menus** use the new saturated crypt art. The buttons are in the same places.

### Fixed
- **Unlit braziers** no longer show up as a glow in rooms you have not reached.

## [0.7.9] - 2026-10-29

_Cold torches, longer light, gold that shines_

### Added
- **Gold tally**: pick up more than 20 gold within 2 seconds and further coins merge into one number above your head, the total of that burst. The tally clears after 1 second without a pickup.
- **Gold count**: a gold readout on the play HUD. It shakes, then counts up one piece at a time.
- **Gold shimmer**: coins twinkle. The bright pixels stay visible in the dark.
- **Boss taunts**: when a boss hits you and you take damage, the boss may taunt or laugh. It will not repeat the same line immediately, and it will not spam on a combo.
- **Map opacity**: a MAP slider on the title and pause menus, from 10% to 100%. 100% is the current map. 10% is faint.

### Changed
- **Wall torches and floor braziers** start cold. Light them with a burning torch. They stay lit, so you can mark a path. A lit one still relights your own torch.
- **Held torches** burn for twice as long (170 seconds, was 85).
- **Champion critical hits** land 10% of the time at every level. The crit adds 5% of that hit's base damage. If you are holding a lit torch, the crit puts it out.
- **Rest** works in secret rooms, in the squeeze through a wall gap, and inside a secret passage. Corridors are still too exposed. Enemies nearby still stop you.
- **Resurrect** is hidden on the death screen unless you are carrying at least one Necro Potion. New Game is always there.

## [0.7.8.1] - 2026-10-29

_Less gold, walkable spikes, the tuned light, quieter water_

### Changed
- **Gold**: only champions, bosses, and chests drop it. Ordinary monsters, cracked stone, pots, rituals, vaults, and loose piles do not. Those remaining drops happen 30% as often as in v0.7.8.
- **Spike pits**: you walk across them. They still cut you while you stand on them, and a thought bubble says something like "Ouch, spikes! I should be careful." Nothing snaps you back.
- **Light**: the live look is the desktop Lighting (Dev) tune. Seen `#0E143E`, void `#08070E`, a wider penumbra, a hotter torch core, and a full unarmed circle in `#1D81BF`. The dev panel stays off on GitHub Pages.
- **Icy water**: simpler 8-bit water tiles, and the ripple moves at half the old speed.

### Fixed
- **Gold on pits**: a coin that drops or bounces onto a bottomless pit falls in. It does not sit on the void, and you cannot pick it up from there.

## [0.7.8] - 2026-10-29

_Death, coins, and the boss hall_

### Added
- **WebGL2 lighting**: on High, with GL LIGHT set to AUTO or ON, darkness is a fullscreen shader. Smooth falloff, a hotter torch core, and a little fill on floors you have already seen. GL LIGHT OFF, or Low quality (the phone default), keeps the old Canvas light.
- **GL LIGHT**: AUTO / ON / OFF in the title and pause menus, saved with the other settings.
- **Lighting (Dev)**: a sun button on playtest builds only (githack, localhost, or `?lichDev=1`). It never appears on GitHub Pages, even with that link.
- **YOU HAVE DIED**: when your life hits 0, a short death plays, then huge red letters and two choices. **New Game** starts over. **Resurrect** spends one Necro Potion and wakes you on the same stone at half life. With no potion, Resurrect cannot be chosen.
- **Three deaths**: starvation drops you and marks the eyes with an X. A killing blow cuts you apart in blood. Fire chars the body down to a skeleton, then it falls. Each one runs about three and a half seconds. No new character frames — these are drawn in the game.
- **Necro Potion**: a teal flask with a bone-skull mark. Bosses drop it, and not every time. You can carry two. It is only spent on Resurrect.
- **Death sounds**: the death animation ducks the music and plays the new death bed. The overlay plays the doom sting on its own. Resurrect has its own sound and does not play the shrine revive.
- **Loose gold**: every 1 gold is its own coin. A 5 gold drop bursts into five coins that bounce, then sit to be picked up.
- **Sealed uniques**: the Hollow Pedlar sells three sealed weapons, armor, or jewelry pieces. The button shows the price and nothing else. Paying rolls the stats, and a higher price rolls better. A trader deeper in the crypt rolls stronger gear than one near the surface.

### Changed
- **Boss approach**: the boss room sits at the end of a long hall. A locked puzzle door closes that hall. The blood-offering door is at the far end, then the boss. You cannot walk into either from the spawn room.
- **Doors**: dungeon doors are still placed at random, and they stay out of the room you arrive in and the tiles right beside it.
- **Spell books**: none before depth 6, after the first boss. Depth 6 can hold the next book you have not read.
- **Gold**: drop chances that hand out gold are cut in half, and the big guaranteed piles (bosses, chests, vaults) are half as fat as in v0.7.7.

### Fixed
- **Lava and acid**: monsters no longer appear in those pools, and they do not walk across them as if the floor were safe.
- **Arrival**: a new depth does not put monsters in the room you enter, or on the step just outside it.
- **Seen and Void colors** follow the dev pickers on both the shader and the Canvas light.
- **Unarmed light** is its own full circle. It no longer borrows the held torch's cone.

## [0.7.7] - 2026-10-27

_Move during a spike bite, map icons for what you have seen, flames that light your torch, room tile sets, a wider ambience mix, acid and lava pits that are not a black void_

### Fixed
- **Spiked gaps (B1)**: the 5% life bite and the snap back onto the tile you left are unchanged, and a dodge roll still hops the gap. The bite no longer roots you. You can walk, strafe, and dodge while the ticks land.

### Added
- **Map icons (F1)**: the first time a puzzle sconce, lever, dais, plaque, crank, glyph socket, secret wall, platform, dark portal, or sink stone is on a seen tile, its 8×8 icon is drawn on the map (M). Anything not yet seen stays off the map. The marks follow the floor save.
- **Falling into acid or lava (F6)**: a pit over acid or lava draws the liquid void, rims, holes, and splash. Other pits stay the black void. The fall still costs half your life and does not kill you.

### Changed
- **Relighting (F2)**: any burning world flame — wall torch, brazier, lit puzzle sconce, iron flame, or fire pit — lights your torch with the same LIGHT TORCH use. A cold sconce or a snuffed torch does not.
- **Puzzle sconces (F3)**: lit and unlit sconces use the standout brazier art, with a short flicker while they burn.
- **Room tiles (F4)**: each room picks one variant for its floor and walls together. The letter is blank (the tiles already in the game), a, b, or c. Corridors share one letter. Castle, ice, bloody, demonic, lava, and damp sets stay in their own family.
- **Ambience (F5)**: each floor rolls one bed and one explore track from its depth band, then crossfades to the next bed over 1.5–3 seconds. The last beds and the last track are skipped when the pool allows it. Ice leans wet and cave. Bloody, demonic, and lava planes lean deep crypt, bone, and the fire track. A lava room can switch to `amb_fire_hall_loop_01` when that cue is shipped; it is not in this pack, so those rooms keep the floor bed. Undercroft and catacomb bone sit a little quieter. One-shots stay on the 8–30 second gap, with no two of the same cue back to back.

## [0.7.6] - 2026-10-27

_Zoom fog, hazard rooms, spiked gaps you can fall into, prism light, quieter acid and lava_

### Fixed
- **Desktop zoom fog (B1)**: at 0.25x, 0.35x, 0.5x, 0.75x and 1x, the lightmap, torch light, fog and shadows cover the same world the camera shows. Unexplored and unlit rooms stay hidden when you zoom out. Phone zoom steps are unchanged.
- **Rituals in hazard rooms (B2)**: a ritual site no longer appears in an acid or lava room, including on the stone path through the pool.
- **Spiked gaps (B3)**: a spiked hallway gap is a pit you can walk into, not a solid wall. Walking in drops you onto the spikes for 5% of your max life over 2 seconds (never the killing blow), then puts you back on the tile you left. A dodge roll or leap still hops the gap.

### Added
- **Drink gulp (F2)**: a successful drink plays `player_drink_gulp_01`–`03` once (`drink_gulp`). Potion drinks keep their own cue.
- **Eat munch (F3)**: eating a ration plays `player_eat_munch_01`–`03` once (`eat_munch`). It does not play the gulp.
- **Tile sink (F6)**: a sinking stone plays `wld_tile_sink_01`–`03` once, from where the stone is, when the drop starts.

### Changed
- **Prism solve light (F1)**: solving a prism casts a soft green light with falloff. It spills through open doors into nearby halls and stops at walls. The old flat room fill is gone.
- **Louder rest (F4)**: sleep uses `player_rest_snore_v2_loop_01`, and waking uses `player_rest_refreshed_v2_01`–`02`. The old rest bed is not played on top.
- **Quieter acid and lava (F5)**: hazard pools use the quieter tiles, with a few bubbles (and lava embers) on top. Acid glows `#5CFF3A`. Lava glows `#FF7A1A`, with a faint outline on the pool's edge.
- **Map (F7)**: the M map has no cell grid, and the overlay is more transparent.
- **Spike-gap art (F8)**: spiked gaps draw `spike_gap_h` and `spike_gap_v` instead of a procedural fill.
- **Glimmer pools (F9)**: one drink from a pool grants +25% bonus XP. Another drink from that same pool does nothing.

## [0.7.5] - 2026-10-27

_Chase, true loot deltas, prism vaults, scarcer gold, a shop after every boss_

### Fixed
- **Enemy chase (B1)**: a monster that sees you, including on a diagonal within about 5 tiles, alerts and then keeps walking toward you. It attacks while it is next to you, and it only gives up once you get far enough away. Fear still makes it flee.
- **Tooltip deltas (B2)**: comparing a drop to what you have equipped shows the new value and the real change, as in `+10% damage (+5%)`. Equal stats are left off. A skill bonus such as Frost Nova is one line, and the comparison no longer stacks a second `+` or `-` in front of the number.
- **Prism reward (B3)**: solving the prism no longer opens a stair-shaped hole in the wall. A gate opens into a side room with a gold-filled chest, and the chest sits off the doorway. The open gate glows the prism's pale green.
- **Names behind gates (B4)**: loot and chest names stay hidden until the gate is open and you have walked into that room.

### Added
- **Shop after every boss (F3)**: when a boss falls, a wall crumbles into the Crypt Shop. The Hollow Pedlar greets you with a random line. Sell several backpack items at once, or **Sell All** after a confirm that shows the gold. Equipped gear is not sold.
- **Stash & notes (F5)**: the bag has a **NOTES** page. Glyph scraps scattered through the dungeon are copied into it, and the two notes on a prism floor together spell the sequence.
- **Starve and thirst (F6)**: while hunger or thirst is actually draining your life, a thought bubble says "I'm starving to death!" or "I'm dying of thirst!" It does not repeat every moment, and it stops once you eat or drink.
- **Spiked hallway gaps (F7)**: some corridors are broken by a spiked tile. A dodge roll hops across. Walking in deals 5% of your max life over 2 seconds (never the killing blow) and puts you back on the tile you left. Click-to-walk goes around them.

### Changed
- **Desktop zoom (F1)**: on a computer, zoom steps are 0.25x / 0.35x / 0.5x / 0.75x / 1x, and minus zooms out from 1x. Phones stay on 1x / 1.15x / 1.25x / 1.35x.
- **Scarcer gold (F2)**: ordinary kills, pots, props, and chests pay less. Boss piles and the prism bonus room stay rich.
- **Prism halls (F4)**: the crank sits at the base of a shorter prism. Wall glyphs are scratched and harder to read. A prism shows up about once every 7 floors, and each visit uses a different shell (default, hex, twin, or stump) plus a little dressing. The hall glows green, and solving it floods the room with prism light. Beam contact blooms are unchanged.

## [0.7.4] - 2026-10-26

_iPhone UI, puzzle polish, skill FX, power attack, enemy AI_

### Fixed
- **iPhone main menu (B1)**: the title menu and pause menu now sit inside the safe area and scroll if needed. The version bar and Add to Home Screen hint no longer cover buttons on any iPhone size.
- **HUD safe area (B2)**: the HUD, messages and touch HUD are inset from the notch, Dynamic Island and home indicator.
- **Glimmer pools (B4)**: no more braziers or wall torches on top of glimmer pools, and DRINK now wins over nearby props, so drinking always works.
- **Click-to-walk around pits (B5)**: on desktop, clicking across a pit now walks around it instead of heading for the edge and sliding the wrong way.

### Added
- **Secret glimmer (F1)**: unfound secret walls and squeeze gaps give off a faint shimmer that brightens as you get close.
- **Skill icons (F2)**: Fireball, Whirlwind and Frost Nova have pixel-art icons, with a padlock until you learn them, on desktop and touch.
- **Snakes (F3)**: snakes are critters now, not enemies. They flee from you and squeeze away under the nearest wall.
- **8-bit puzzle art (F5)**: new pressure pads, platforms and prism puzzle sprites.
- **Skill FX (F8)**: new cast and impact effects for all three skills. The avatar spins during Whirlwind, and Frost Nova is denser and colder.
- **Power attack (F9)**: tap attack for a normal swing. Hold it to charge (you'll see a growing ring and glow), then release for up to 2.25x damage, longer reach and a big knockback. This works with the J key, the touch attack button, a click on an enemy and Ctrl+click. You move slower while charging.
- **Enemy AI rewrite (F11)**: enemies move on the grid. They patrol one tile at a time and spot you only when you share their row or column within 6 tiles with a clear line. Then they show a "!" and pause briefly before charging in a straight line. A charger that hits a wall is stunned for a moment. Ranged and special attacks still fire once they're engaged.

### Changed
- **Ice (F4)**: the Frozen Crypt is no longer part of the normal depth cycle. Ice now appears only in bonus rooms (dark-portal planes).
- **Mobile zoom (F6)**: zoom steps on phones are 1x / 1.15x / 1.25x / 1.35x. Desktop zoom is unchanged.
- **Squeeze tip (F7)**: the "squeeze through" tip appears only once, ever (per run and per device).
- **Descend (F10)**: the way down no longer has an Examine step. A rotating "Descend into the deep" style prompt appears, and one USE takes you to the next level. Boss floors still bar the way.

## [0.7.3.1] - 2026-10-26

_Auto-equip when slot empty_

### Changed
- **Auto-equip on pickup**: when you pick up a weapon, armor (helm, body, boots or shield) or jewelry (ring or amulet) and the matching slot is empty, it is equipped straight away.
  - If that slot is already filled, the item goes to your inventory as before. Equipped gear is never swapped out.
  - This applies to ground loot, chests and every other pickup path.
  - Gear above your level still stays in the bag. A full backpack still accepts an item that can go straight onto an empty slot.
  - Pickup sounds, thoughts, unique lore, stacks and saves are unchanged.

## [0.7.3] - 2026-10-26

_Zoom, castle floors, prism puzzle, dark portals, survival and softer light_

### Added
- **Test zoom**: open the pause menu and tap **TEST ZOOM** to step through 1x, 1.5x, 2x, 2.5x and back to 1x. On desktop, **=** zooms in, **-** zooms out and **0** resets. The camera stays centred on you and the HUD is never scaled. A small "ZOOM 2X (TEST)" tag shows at the bottom while zoomed. This is a test setting for judging pixel scale.
- **Castle dungeon floors**: a new stone-castle look from depth 8. It mixes Trinity's castle floors, walls and wall tops with the classic damp crypt tiles, and corridors often get worn path stones. Rooms get iron wall torches, iron braziers, swaying banners, hanging chains, moss drips, candle clusters, crates, barrels, pillars, shields and urns. Its floor banner reads THE CASTLE DUNGEON.
- **Lich-light prism puzzle**: from depth 3, some long halls hold a tall crystal prism on a stone dais.
  - **Examine** the vine-covered plaque on the north wall ("There's something behind here..."). Then hold a lit torch to it and **BURN VINES** to reveal the glyph order.
  - **TURN CRANK** rotates the dais, and the green Lich-light beam sweeps the walls. When the beam rests on a glyph, it lights it.
  - Light the glyphs in the plaque's order. A wrong glyph sputters with an "incorrect" cue, but you keep the progress you have made. When the last glyph locks, the wall slides open on a gilt chest.
  - The puzzle uses 3 glyphs, or 4 from depth 8 (one of them on a side wall). It first appears between depths 3 and 5 and never shows up on more than two floors in a row.
- **Dark portals**: past depth 10, killing a boss sometimes (20%) tears open a **dark portal** where it fell.
  - Step through to reach a short-lived reward plane with bloody, demonic or molten-lava tiles. It has no enemies, and every room holds gold, potions and up to 4 gilt chests.
  - A timer shows how long you have (60s). The plane shudders at 30%, tears at 15% and screams at 5%.
  - Return early through the exit portal, or get thrown back to the boss floor when it closes. Saving while inside saves the boss floor.
- **Ambience variety**: each floor now has one ambience bed that changes from floor to floor (stone crypt, stone hall, corridor wind, deep crypt or wet cave).
  - Safe rooms (the start room with no one chasing you, hidden rooms and prism halls) crossfade to a quiet chamber bed.
  - Occasional one-shots play every 8-30s: echoing drips, distant stone rumbles, corridor gusts and, rarely, a creature murmur. Each one varies its pitch and stereo position slightly.
- **Dungeon-door hum**: the way down hums and glows faintly as you get close. The sound and the glow fade in together, with one shared falloff.
- **Resting**: you snore while you sleep, and you wake up "refreshed and rested".

### Changed
- **Enemy density follows depth** (replaces the flat x2 from 0.7.2):
  - Depths 1-3 are back to 1x, 4-6 are 1.25x and 7-10 are 1.5x.
  - Past depth 10, density goes up by +0.5x per floor up to a cap of 2.5x, which is reached at depth 12.
  - Past the cap, enemy damage rises by +8% per floor instead, up to 2.5x.
  - The enemy cap stays at 120.
- **Softer light falloff**: light now fades more gently, so more of each lit wall face shows its full height instead of just a sliver.
- **Smaller torches**:
  - Your torch reach goes from 128 to 96 px and its brightness drops slightly.
  - Wall torch reach goes from 74 to 58 px and brazier reach from 84 to 66 px.
- **Biome cycle**: normal floors now use the classic, ice and castle looks:
  - Depths 1-3 classic.
  - Depths 4-7 ice.
  - Depths 8-15 castle.
  - Depths 16-19 ice.
  - After that, bands of 4 floors cycle castle, castle, ice.
  - The bloody, demonic and lava looks only appear in dark-portal planes.
- **Survival has teeth**:
  - An empty **food** meter drains your life.
  - An empty **water** meter also makes spells cost 1.6x mana.
  - An empty **rest** meter drains life harder (3x the old rate), adds +1x to mana costs (2.6x if you are also parched), and puts out your own faint light. Your torch and magic light still work.
- **Sinking stones fall faster**: a stone starts to sink 0.8s after you step on it (was 1.5s), and it drops quicker once it starts.
- **Ledge traverse, squeeze-through, teetering and falling** now draw your own layered character with all your equipped gear, instead of a generic sprite.
- **Fire-pit relight**: LIGHT TORCH now only shows when you are right up against the flames, instead of anywhere near the pit.
- **Interact and notice text** stays on screen 1.5s longer (3.7s). It now sits low on the screen so it no longer overlaps thought bubbles.

### Fixed
- **Enemies no longer spawn in sinking-floor rooms**, either when the floor is generated or when they are summoned later.
- Older saves made on a bloody, demonic or lava floor load as that depth's new biome.

### Credits
- Castle dungeon tiles and props, the Lich-light prism puzzle art (prism, dais, glyphs, plaque and vines, crank, beam and slide wall), and the dark portal and plane FX art by **Trinity**.
- Ambience beds and one-shots, prism cues (`wld_prism_*`), dark portal cues (`wld_dark_portal_*`), door hum loops (`wld_door_hum_loop_01-03`), and the rest snore and refreshed cues by **Razz**.

## [0.7.2] - 2026-10-25

_Biomes, levers and platforms, secret squeezes, double mobs and soft shadows_

### Added
- **Four biomes**: from depth 4 the dungeon changes look every 4 floors. Each biome has its own floor, wall-face and wall-top tiles, plus 2-4 props per room: animated ones (4 frames at 8-10 fps) and static ones. Hanging props sit just under the wall face, and the braziers, crystals, soul flames and vents give off their own coloured light. Each biome also has its own floor banner.
  - **Depths 1-3**: the classic crypt (unchanged).
  - **Depths 4-7**: the Frozen Crypt (ice).
  - **Depths 8-11**: the Bleeding Vaults (bloody).
  - **Depths 12-15**: the Demon Halls (demonic).
  - **Depths 16-19**: the Molten Deep (lava).
  - **Depths 20+**: the cycle repeats (20 ice, 24 bloody, and so on).
- **Levers and moving platforms**: from depth 3, some rooms are split by a **3-tile chasm**. A stone sled sits in the chasm, with a **lever on each bank**. Pull the lever on your side to call the sled or send it back. Stand on the sled and pull the lever to ride it across (the trip takes about 2 seconds, with chains and dust). The sled is solid ground.
- **Rising-platform puzzles**: from depth 2, some rooms have a 5x5 pit with a small **island** in the middle that holds loot (an item plus gold). Two stone pads under the south bridge are **lowered** into the dark. Pull the lever and the pads rise (lowered, then mid, then raised), and you can walk out to the island.
  - From depth 6 there are **two levers marked I and II**. You must pull them in order. Pulling them in the wrong order clanks both back.
- **Secret squeeze rooms**: from depth 2, look for a **broken gap in a wall**. USE it from the south to examine it ("A narrow gap... I could squeeze through"), then USE it again to **squeeze through**. Your character edges sideways through the gap and dust falls. Behind it is a small hidden chamber with a **gilt chest** (a guaranteed rare item with a 20% chance of a unique, gold, and sometimes a repair potion), a gold urn and candles. Squeeze back out the same way. Deeper floors can have two of these rooms.
- **Relight your torch at a fire pit**: stand at the rim of a fire pit (not in the flames) and USE "LIGHT TORCH".
- **Enemy vocals**: enemies now **moan or groan while idle** (moan for undead, groan for beasts), **growl** when they spot you, **groan** the first time they drop below half life, and **grunt** as they attack or lunge. These are separate from the existing attack grunts, and they are throttled so packs don't drown each other out.
- **Burning sound**: catching fire plays an ignite cue, and a crackle loops for **as long as you burn**. It stops when the burn ends, when you roll the fire out, or when water puts you out.

### Changed
- **Twice as many enemies**: the per-room spawn budget is doubled and the enemy cap is raised from 60 to 120. Expect roughly 70-110 enemies per floor, where v0.7.1 had about 36-49. This is meant as a deliberately chaotic experiment and will be tuned after playtesting.
- **Gold and life drops ~45% rarer**:
  - Kill gold: 24% to 13%.
  - Kill life potion: 8% to 4.5%.
  - Room floor drop: 25% to 14%.
  - Minion gold: 12% to 7%.
  - Champion potion: 50% to 28%.
  - Pots and barrels: gold 18% to 10%, potion 5% to 2.8%.
  - Chests are unchanged.
  - Because there are twice as many enemies, gold and life per floor from kills comes out roughly the same as before. Per kill, it is about half.
- **Torch shadows**: shadow edges now fade to black in **4 steps on High** lighting and **3 steps on Low**, instead of a single hard edge. This applies to your torch, fire pits and the big biome lights.
- **Brighter fire pits**: the light radius of a large pit grows from 46 to 80 px, and a huge pit from 54 to 116 px. Both have a hotter core.
- **Examine is for gameplay only**: statues, coffins, ritual sites and other flavour props no longer show an EXAMINE prompt or a thought bubble. Examine still works on doors and ways down, levers, wall gaps and similar things. Ambient bubbles are suppressed near doors and ways down.
- **Tap or click a bubble to close it**: tapping or clicking a thought or Examine bubble closes it. That tap does nothing else, so it never attacks, walks or uses anything.
- **Inventory scrolling on touch**: drag anywhere on the bag grid to scroll, including when you start the drag on an item, and the scroll keeps some momentum after you let go. An item is selected only when you lift your finger without dragging. Double-tap still equips. Desktop mouse and wheel work as before.

### Fixed
- **Enemies seeing through walls and around corners**: detection now needs true line of sight. Three tile rays must be clear, so enemies can't spot you through the touching corners of two walls or past the edge of a wall. Ghosts and other wall-phasing enemies can still move through walls, but they can't **see** through them. A chaser that loses sight of you goes to where it **last saw** you, then gives up after 4 seconds.
- **Fire pits**: catching fire now uses the **flames themselves** as the hitbox. Before, it used the whole pit square, so stepping on the rim or a corner set you alight.

### Credits
- Biome tiles and props (ice, bloody, demonic, lava), lever and platform art, and the squeeze-through animation, wall-gap and secret-room art by **Trinity**.
- Enemy vocals (`enm_voc_groan`, `growl`, `moan` and `grunt`, 3 variants each) and the burn ignite / crackle-loop cues (`cbt_status_burn_apply`, `cbt_status_burn_loop`) by **Razz**.

## [0.7.1] - 2026-10-25

_Pits, hazard rooms, fire pits, wall doors and examine-to-descend_

### Added
- **Bottomless pits**: from depth 2, some corridors have a bottomless pit 2-3 tiles across, and bigger rooms on depth 3 and below can have a small hole in the floor. You can't walk across a pit, and click-walk routes go around holes. To cross, stand at the edge and **USE the wall ledge** ("CLIMB LEDGE"). Your character grabs the ledge and inches across the wall on their own. You can't steer while crossing, it takes about 2 seconds, and it works in both directions (the inch frames are mirrored for the way back). Holes in rooms you just walk around.
- **Falling in**: if you push into a pit's edge for about 1 second (you teeter first), or dodge-roll into one, you fall. The fall takes **50% of your max life** but **never kills you** (at worst it leaves you on 1 HP). You drop out of sight, Razz's pit-fall scare plays (a whoosh and a low shudder, 3 variants, mixed +2 dB because it's bass-heavy), and you climb back out on the **last safe tile you stood on**, usually the edge you fell from. You get 1 second of invulnerability afterwards. Pits are saved with the floor.
- **Hazard rooms**: from depth 3, some rooms are flooded with **water**, **acid** or **lava**, or set with **spikes**. A stone path runs from every way into the room to the middle.
  - **Water**: 1.5% of max life per second and 45% slower movement. It can't kill you, and it puts out fire.
  - **Acid** (depth 4+): 6% of max life per second.
  - **Lava** (depth 7+): 12% of max life per second, and it sets you on fire.
  - **Spikes**: up for 1 second out of every 2.4. They hit for 10% of max life each time they rise while you're on them.
  - Dodge-rolling skips hazard contact while you're mid-roll. Floor themes have favourites: water in the Sunken Streets, acid in the Rotting Warrens, spikes in the Ossuary, lava or spikes in the Pale Choir.
- **Sinking stones**: path stones sink if you stand on one too long. After **1.5 s** on a stone it sinks (risen, then wet, then sunken over 0.35 s). A sunken stone counts as the hazard, so standing on it hurts. It comes back up **3.2 s** later (sunken, then wet, then risen over 0.35 s). Keep moving.
- **Fire pits**: large burning pits (2x2) appear from depth 6, and huge ones (3x3) can appear from depth 10. They give off embers and warm light. Stepping in sets you **on fire**: the flames show for **3 s** and you take **8% of max life over 4 s**. **Each dodge roll cuts 1 s** off both the flames and the burn, so each roll saves 2% of your life, and two rolls put the fire out after 2 s. Water puts you out too.
- **Wall doors**: some door-type ways down are now set into the room's back wall, with a doorframe and steps (wood, iron, demon, bloody, bone, rune and rusty styles). About half of the matching entrances (gate, demon, bloody, rusty, wooden, bone and rune) use the wall version. When you go in, the door swings open (closed, ajar, half, open) and then the climb-down plays.

### Changed
- **Examine to descend**: walking onto the way down no longer takes you down. **USE it** (F, the USE button, or click it) to examine it, then **USE it again** within 8 seconds ("DESCEND" / "ENTER DOOR") to climb down. Boss floors still need the boss dead first. The help text is updated.
- **Footsteps 40% quieter**: the walking sound plays at 60% of its old volume (mixer change only, the sample is the same).
- **HUD buttons (touch)**: the **sound button is gone** from the HUD. Sound is now only a toggle in the pause menu (SOUND: ON/OFF). **Pause** has moved to the **lower left** and **Map** to the **lower right**. Fullscreen stays at the top. On desktop, ESC still pauses and M / TAB opens the map.

### Credits
- Pit, ledge-traversal, hazard, sinking-stone, fire-pit, burn and wall-door art by **Trinity**.
- Pit-fall scare SFX (`wld_pit_fall_scare_01`-`03`) by **Razz**.

## [0.7.0] - 2026-10-25

_Varied entrances, climb-down, critters and empty chests_

### Added
- **A different way down on every floor**: the way to the next depth isn't always plain stairs now. Each floor picks one of 16 entrances: stairs, an elevator, a hole in the ceiling, a barred gate, a demon door, a bloody door, a rusty gate, a scary wooden door, a glowing portal (purple, cyan, green, red or gold), a demonic mirror, a bone door, an ice door, a rune door, a moss door, sealed stone, or a cult curtain. You never get the same one two floors in a row, and the floor's theme makes some more likely (bone doors in the Ossuary, mirrors and rune doors in the Pale Choir, and so on). Your save remembers the entrance, so **Continue** shows the same one. The map still marks the exit in yellow.
- **Climb-down**: stepping onto the entrance no longer cuts straight to the next floor. Your character walks onto it and climbs down in four short frames (about half a second; there are male and female versions). Controls pause and the camera stays on the entrance until you reach the next depth. The descent sound is the same as before.
- **Animated portals**: portal entrances loop a four-frame swirl at about 9 fps and give off a soft glow in their own colour.
- **Entrance effects**: some entrances give off a few particles while they're on screen. Portals have rising motes in the portal's colour. The demon door has red embers from its eyes and mouth. The demonic mirror has a purple shimmer and the odd eye glint. The bloody door drips blood now and then. The rune door has cyan sparkles around its glyph ring, and the ice door gives off frost and vapour. The cult curtain sheds slow purple incense dust, and the ceiling hole has dust drifting down its light shaft. Stairs, the elevator, the gates, and the wood, bone, moss and sealed-stone doors are plain sprites. All the effects are kept light so the floor stays easy to read.
- **Critters**: spiders, beetles, flies, centipedes, glow worms, fireflies and snakes now live in the dungeon. There are only a few on each floor (about 3 to 9, more on deeper floors), and each floor's theme picks the mix (glow worms and fireflies in the damp Sunken Streets, snakes and spiders in the Ossuary). Flies gather at bloody doors and snakes at bone and moss doors. Critters are harmless and run away when you get close. Glow worms and fireflies glow softly in the dark.
- **Skitter-outs**: now and then, a few bugs scurry out when you open a door (about 1 in 4 doors), break a pot or barrel (about 1 in 5), or open an empty supply chest (about 3 in 4). They scatter and are gone after a few seconds.

### Changed
- **Some supply chests are empty**: about **1 in 3** keyless supply chests (33%) now has nothing inside. When that happens you'll see "Empty." or "Empty... something skitters out!". Locked chests that need a key still always hold loot.

### Credits
- Entrance, portal, climb-down and critter art by **Trinity**.

## [0.6.4] - 2026-10-25

_Razz's music v2 and glyph light sounds_

### Changed
- **New music from Razz (v2)**: all 11 tracks are replaced: title, the three exploration themes (crypt, cave and fire), combat, shop, boss, and the floor-entry, room-clear, victory and game-over stingers. There are fewer bells. The new tracks are gloomier, rougher and grungier, with the same mysterious fantasy feel.
- The boss track still switches to its heavier second half at 60 s when the boss enrages. Crossfades, music ducking, Music Off and the BATTLE MUSIC setting for combat music all work as before.

### Added
- **Glyph light sound**: each correct rune you touch on a rune-puzzle door now plays a soft swell. There are three variants (glass shimmer, low stone hum, and both together), and you won't hear the same one twice in a row. Wrong order still plays the error sound, and levers keep their own clank.

## [0.6.3] - 2026-10-25

_Hotfix: examine, F-to-use, aggro, loot rooms, supply chests, unequip, champion glow, full saves_

### Fixed
- **Examine spam (B1):** each statue, coffin, ritual site, bowl, niche or sealed door shows its full examine text once. After that you get a short **"NOTHING ELSE TO SEE."** Examined spots are remembered in the save.
- **F to Examine / Use on PC (B2):** a mouse click no longer opens, examines, pulls, drinks, reads or trades. Press **F** for that. Clicks still walk, attack, pick up items and work in menus. The touch USE button is unchanged.
- **Enemies that ignored you (B3):** mobs with short sight (slimes, oozes, rats, drowned, walkers...) now notice you within about 150px when they have line of sight. They no longer wait for you to hit first. A mob that wakes also wakes its neighbours. Ambushers are unchanged on purpose: mimics stay disguised until you're close, eels stay under water, and guards hold their post.
- **Empty locked rooms (B4):** every room behind a puzzle, Spell Book door, gate key or sliding slab now holds loot. If generation left it bare, it gets gold, a potion and sometimes gear. Spell Book niches also get a small stash.
- **Click-to-move (B6):** move clicks count only on walkable floor you've already explored. Clicks on walls, void, vines or blocks are ignored, and dragging across a wall keeps your last floor target.
- **UNEQUIP (B7):** the button works again (PC and touch). The Rusty Sword used to put itself straight back in your hand. Now it auto-equips only once, when you pick it up.
- **Full save state (B10):** saving now stores the whole floor and where you stand. That covers depth, position, layout, explored map, open doors, puzzle progress, opened chests, broken secrets, loot on the ground, enemies, life and mana. **Continue** puts you back on the same spot. The game saves on pause, when the tab hides or closes, and every ~12 s while you play. Old saves still continue on a fresh floor. Death still ends the run.

### Added
- **No-key supply chests (B5):** 1-2 per floor. They're plain wooden chests with no lock plate (tan on the map). They open with F, or you can smash them, and hold only gold, life or mana. Locked chests keep the better loot.

### Changed
- **Champion look (B8):** the solid blue box is gone. Champions now have a soft blue glow under them and a pulsing outline. The CHAMPION name stays.
- **Thought bubbles (B9):** no more random, idle, mood or monster bubbles. Bubbles appear only when you Examine something or read a Spell Book.
- Audio is the same as v0.6.2: all SFX, the music beds and stingers, ducking and the AMBIENCE slider.

## [0.6.2] - 2026-10-25

_Razz's music, ambience slider and polish sounds_

### Added
- **Music by Razz**: real music now replaces the synth drones. There are 7 looping tracks:
  - title screen
  - three exploration themes, chosen by floor (crypt, cave and fire)
  - combat (only when **BATTLE MUSIC** is on, which is still Off by default)
  - shop
  - boss (it shifts into its second, heavier half when the boss enrages)

  Tracks crossfade as you go. When you come back from a fight or the shop, exploration music picks up where it left off.
- **Music stingers**: a short phrase when you reach a new floor, a small "room clear" tag after a fight of three or more kills, a victory theme when the final boss falls, and a game-over theme. The music dips under each stinger.
- **AMBIENCE volume slider** (beside MUSIC and SFX). It's saved with your settings. Ambience beds, drips, wind gusts and distant creepy sounds follow it, and Sound Off still mutes everything.
- **More sounds (P2 polish tier)**: 10 more cues, including cave drips, wind gusts, distant moans and chains, a sewer bed on the catacomb floors, the rolling boulder trap, the mimic reveal, a wobble when you're slowed, a "game loaded" chime on Continue, a soft tick when a tooltip appears, and an idle fidget if you stand still for a while.

### Changed
- **Mixing**: the music dips 3–6 dB under big moments (level up, boss intro, rare loot, floor entry, game over, boss phase change and death). When you get hit, music and ambience duck for about 150 ms so the hit always reads. Ambience sits a little lower while music plays and during fights.
- Every sound layers on top of the others. A new sound only cuts off an older one when too many of the same kind play at once (for example footsteps or coins).
- If the music can't load (offline or opened as a local file), the game falls back to the old synthesized music.

### Notes
- Version 0.6.1 (the first sample-sound release) never finished publishing to the live site. This build includes all of it: 116 sound cues across P0 + P1 + P2, plus 11 music tracks. Everything is still an approved placeholder until the final masters arrive.

## [0.6.1] - 2026-10-25

_Razz's sound effects_

### Added
- **Real sound effects**: Razz's Lichlight sound pack is now in the game. 105 cues from the first two tiers (P0 + P1), 213 sample files, replace the old synth beeps wherever there's a matching sound:
  - **Combat**: light and heavy swings (axes and mauls sound heavier), hits, crits, misses, and bone / armour / flesh hit layers. Also kill confirms, blocks, shield up / break, and a fizzle when you're out of mana.
  - **Spells and projectiles**: cast release, a looping crackle that follows each Fireball, the Fireball impact, Frost Nova, and arrows whizzing and thunking. Cultist and wisp bolts hum while they're in the air, and boss volleys get their own sound.
  - **Enemies**: barks when they notice you (skeletons rattle, ghosts wail), hurt sounds, deaths for grunts, archers, slimes and elites, and attack swings and wind-up tells. Bosses get an intro sting, an enrage roar and a death collapse. Bomber blasts explode.
  - **World**: wooden doors and iron gates, locked doors and chests, chest opening and loot drops, levers, pressure plates and grinding slabs. Also dart, pit and flame traps, the stairs down, pots and crates, torches and secret walls.
  - **Pickups and shop**: gold (rapid pickups climb in pitch), potions, keys, items, rare and unique finds, drinking, the merchant greeting, buying, selling and "can't afford".
  - **Player and feedback**: footsteps on stone, dodge, getting hurt, death and the game-over sting, level up, a floor-entry sting, a low-life warning with a quiet heartbeat, and a chime when Whirlwind or Frost Nova is ready again.
  - **Menus**: clicks, ON / OFF toggles, inventory, pause menu and map open / close, equip sounds (weapon, armour, trinket), the volume slider tick and the new-game confirm.
  - **Ambience**: a quiet looping bed under each floor (stone crypt or wet cave), the shop hearth, and a tense drone near a sleeping boss.

### Changed
- Variations of a sound never play the same clip twice in a row, and most get a slight random pitch change so repeats sound less mechanical.
- Sound On/Off and the SFX volume slider control all of the new sounds. Sound Off is still completely silent, music is still synthesized, and battle music still starts Off.
- A few sounds without a sampled version yet (vines, webs, boss voices, drips and wind, sleeping, eating, examining) keep their synth sounds. If the sound pack can't load (offline or opened as a local file), the game uses the old synth sounds.

### Notes
- These are approved **placeholder** sounds for timing and mix. Final masters will be dropped in later under the same names.

## [0.6.0] - 2026-10-25

_Characters, spell books, vines and wardrobe_

### Added
- **Characters**: keep up to six heroes, each with its own run. The title screen shows who you're playing; **CHARACTERS** lets you play, change the look of, add or delete a hero. Your existing save becomes the first character (WANDERER) automatically, nothing is lost.
- **Character look + wardrobe**: pick skin, hair and cloak colours. What you wear now shows on your hero in the dungeon: armour, helm and boots recolour the sprite, and shields, amulets, rings and your weapon (tinted by rarity) are drawn on top.
- **Spell Books**: skills are no longer handed out by level. Each skill's book is hidden behind a sealed puzzle door (levers, runes or pressure plates). Read it to learn the skill. Fireball can turn up from depth 1, Whirlwind from depth 3 and Frost Nova from depth 6. Existing saves keep every skill their level already unlocked.
- **Fists first**: new heroes start bare-handed. A worn **Rusty Sword** lies beside some old remains in a room near the start, and you pick it up and wield it automatically.
- **Vines** (depth 2+): thick tangles that block corridors. Cut them with any weapon (fists work, slowly), burn them with your torch (USE) or a Fireball, or spin through them with Whirlwind. They never block the way to the stairs.
- **Mushrooms**: clusters grow in damp corners, by water, fog, coffins and niches. Some glow faintly teal or violet.
- **Slow walkers**: Rotting Zombies (depth 4+), Lumbering Skeletons (7+), Brood Spiders (10+) and Goblin Brutes (13+). They lurch slowly and wind up a heavy, telegraphed swing.
- **Item art by rarity**: magic, rare and unique items get their own icons, with recoloured metal, gem studs and a halo on uniques. Each icon is seeded from the item's name and powers, so the same unique always looks the same. Normal items keep the classic art.
- **Custom art loader**: PNGs listed in `assets/manifest.json` replace item icons, floor tiles or wall faces (see `assets/README.md`). The game runs fine without them.
- **More to examine**: statues (idols, knights, saints), offering bowls, coffins, burial niches and ritual sites. Some lines hint at hollow walls or a hidden book nearby.
- **UI DIM** setting (OFF / LOW / MED) fades the HUD, touch buttons and top bar without darkening the dungeon. It's saved with your settings.
- **Unique drops** flash, send out a shockwave and play their own fanfare.
- **First gear in an empty slot** gets a grunt and a drum roll.
- **Puzzle glimmer**: levers, runes, plates, push blocks and open books sparkle faintly.

### Changed
- Examining doors and objects now shows a short thought bubble instead of a long banner message.
- Your thought bubbles stay up longer (about 5s). Bubbles no longer shimmer or ghost while you move.
- Puzzle doors grind open more slowly with a longer rumble. Lever puzzles answer with a distant echo, and the opened door blinks on the map.
- The map (M) is more see-through.
- The depth banner is bigger, stays longer and sits near the top of the screen.
- Early loot is leaner while you're level 1–2: fewer drops, less gold and mostly plain chest gear. Rations and torches can stand in for chest items.
- Enemies hit a little harder, most noticeably on the first floors (+25% at depth 1, easing to +8%).

## [0.5.0] - 2026-10-24

_Shields, amulets, powers, set pieces and puzzles_

### Added
- **Shields**: a new gear slot with 8 bases from Wooden Buckler to Choir Pavise. Shields give Defense and a **chance to block** (capped at 40%). A block stops the whole hit with a clang, but damage over time is never blocked. Shields have durability and wear when you block or get hit.
- **Amulets**: a new gear slot with 8 bases, each with its own built-in bonus. Amulets have durability too.
- **Special powers on gear**: purple tooltip lines. A power can be a barrier that absorbs damage when your life drops low, when you're struck, or when you block. Others are thorns, mana or life on kill, a slowing aura, a fear pulse that makes enemies flee, a longer dodge window, or a bonus to Fireball, Whirlwind or Frost Nova damage.
  - Rares sometimes roll a power.
  - Every unique has a designed set of powers.
- **20 new uniques by Eve**: 10 amulets and 10 shields, each with lore. Three amulets **sense secret walls** while you wear them: nearby cracks glow, ping and show on the map. Several of the original uniques also gained a signature power, and they get it on old saves too.
- **Sleep fades to black**: the screen goes dark, one soft tick plays per hour slept, then it fades back in with you rested.
- **Set pieces**: ritual circles with candles and an altar (sometimes with a little gold), standing pools you can drink from, green and blue fog, coffins, skull piles, cobwebbed corners, broken pillars, rubble, moss, hanging chains, barred windows and crypt niches.
- **Cobwebs across corridors** (depth 2+):
  - They slow you down and burn your torch 3× faster while you're inside them.
  - A lit torch smoulders through a web in about half a second, a Fireball burns one instantly, and two sword hits tear one apart.
  - Webs never fully block the way.
- **Passage puzzles** (depth 3+): stone slabs that seal off part of a floor. You open one of three ways:
  - pull three levers
  - light three cold sconces in order (count the ember marks)
  - push a stone block onto a plate
  
  Every part of the puzzle is always on your side of the slab.
- **Sliding doors**: puzzle slabs grind open slowly, with dust and a rumble, then land with a thud.
- **More door styles**: iron or rusted gates, plus wooden, bone-bound, barred and plain stone doors.
- **Floor and wall variety**: each crypt theme has its own stone colours, with 10 floor and 8 wall patterns (cracks, drains, missing bricks, niches, damp streaks, moss).
- **Bloom**: a soft glow on torches, braziers, candles and your spells. It's lighter on Low lighting.
- **Boss voices**: every boss type has its own intro, attack, hurt, death and signature sounds, slightly re-pitched for each boss.
- **Ambience that changes with depth**: the background drone shifts across five depth tiers, with different drips, distant booms and an occasional faint melody.
- **Triple the thought bubbles** (Eve's lines). New moods cover darkness, running out of potions, after a kill, a boss nearby, cobwebs and puzzles. A line never repeats until at least six others have played.
- **Touch layout editor** (pause → TOUCH CONTROLS): drag any button where you want it, swap sides to put the stick on the right, or reset to default. Your layout is saved.

### Changed
- Opening a secret passage now has a deeper, echoing sound from the space behind the wall.
- The inventory has 7 equipment slots: weapon, shield, helm, armor, boots, ring and amulet.

### Fixed
- **A gate next to a water stream couldn't be opened**: USE kept choosing DRINK instead. Doors, gates, chests and the trader now take priority over drinking. Streams also no longer spawn next to doors, gates or vault and shop doorways.

## [0.4.6] - 2026-10-24

_Sound pass: skill voices, world tells, sparse crypt ambience_

### Added
- **Skills have their own voices.** **Fireball** casts with a fiery whoosh and lands with a deep amber boom. **Whirlwind** makes a spinning, blade-in-the-air rush. **Frost Nova** cracks like ice and rings like glass.
- **A soft puff when a wall torch goes out.** Knocking out a sconce with your weapon, a skill, or an enemy shot makes its own quiet puff and hiss. Your own torch burning out still sounds like it used to.
- **New world sounds.** Chests creak open with a clink of coins. Locked chests and gates rattle. Chest keys ring brightly and Gate Keys ring heavy and iron. A Gate Key turns and the gate grinds open. Blood doors drink with a heartbeat. Secret passages rumble as the stone shifts, and cracked stone crumbles. Glimmering pools chime when you drink. The stairs sound like footsteps going down.
- **Bosses** have a rising toll when they awaken and a roar when they enrage.

### Changed
- **Melee sounds different when you hit and when you miss.** A hit lands with a meaty thud. A miss is just a whoosh of air. Enemies flinch with their own sound, separate from yours when you get hurt.
- **The crypt sounds more alive, but stays quiet.** Torches and braziers crackle softly when you're close and fall silent as you walk away, and you can hear which side they're on. A sputtering torch spits and pops. Near water you hear more drips, with a damp echo, and once in a while a distant splash. Wind is a little stronger in long corridors. Sometimes you'll hear a faint groan or shuffling feet from something that hasn't noticed you yet. Monsters growl less often when they spot you. No two ambient sounds play within half a second of each other.
- **Mix.** Getting hurt and dying are now the loudest sounds. Combat and world sounds sit in the middle, and ambience sits quietly underneath.

Sound Off, the SFX slider and the iOS silent switch work as before. Battle music still starts Off. Saves aren't affected.

## [0.4.5] - 2026-10-24

_Lighting pass: skill glows, livelier torches, glimmering pools_

### Added
- **Glimmering pools.** Now and then a floor holds a rare pool of faintly glowing teal water, with a silver rim and a slow sparkle. It's different from ordinary basins and running water. Most floors have none, and a floor never has more than one. Drink from it with **F** / **USE** (**DRINK GLIMMER**). It restores thirst and gives you **+25% XP for 5 minutes**. Drinking again resets the timer to 5:00. The bonus doesn't stack. Each pool has two drinks. While the bonus is active, a teal **XP+25% m:ss** timer shows on the HUD and in your character stats, and the bonus carries over between saves.
- **Skill-colored light.** Every skill now lights the crypt in its own color. **Fireball** casts a rich amber-orange glow, brighter than ordinary fire, and leaves a short afterglow where it hits. **Whirlwind** throws a warm steel and dusty-gold halo around you while you spin. **Frost Nova** flashes ice cyan instead of the old purple-blue.

### Changed
- **Livelier torches.** Wall torches, braziers and your own torch flicker more noticeably, and each flame now has a small glow of its own. The flicker is smooth, so it doesn't strobe. A sputtering torch wavers much harder before it dies.
- **Richer light colors.** Torchlight is a slightly warmer amber, and cold and magic light is a deeper blue. Brightness is about the same. The **LIGHTING: HIGH / LOW** option still works as before.

## [0.4.4] - 2026-10-24

_Evening playtest: darker crypts, real secret passages_

### Changed
- **Chests open only when you ask.** Click a chest, or press **F** / **USE** next to it. Walking into a chest no longer opens it. Locked chests still need a key.
- **Torches no longer relight themselves.** When your torch burns out you stay in the dark until you press **F** (**USE** on a phone), which lights one spare torch if you have one. A hint tells you when this happens. Torches you pick up also wait for **F**.
- **Darker floors.** There are far fewer lit wall torches (about a quarter as many as before). Braziers are still around as safe spots of light.
- **Smoother lighting.** The light map now renders at full resolution, so shadows are much less blocky. A new **LIGHTING: HIGH / LOW** option in the pause menu switches between full and half resolution (the old look). The default is High on computers and Low on touch screens, and your choice is saved.
- **More secret passages, and they lead somewhere.** Each floor has 1–3 hidden tunnels that link two rooms far apart on the floor, so they work as real shortcuts. Both ends are sealed with cracked stone that you can break from either side. Map Fragments show them on the map.

### Fixed
- **Ghosts and other spirits can't see through walls anymore.** Every monster needs line of sight to notice you. Spirits can still drift through stone, but only toward the spot where they last saw you, and they give up after a few seconds.
- **Anything that hits a lit wall torch puts it out:** melee, Fireball, Whirlwind, Frost Nova, and enemy projectiles. It stays out for the rest of the floor.

## [0.4.3] - 2026-10-24

_No more torch farming from sconces_

### Fixed
- Wall torches can no longer be taken from their sconces. Walking up to or clicking a lit wall torch used to add it to your torch count, which let you farm torches. Now clicking a lit wall torch (or swinging at it) knocks it out, and **F** / **USE** at a lit wall torch or brazier relights your own torch without putting the wall torch out. You can still relight an empty sconce from your own torch. Torches lying on the floor are picked up as before.

## [0.4.2] - 2026-10-24

_Depth 1 playtest fixes_

### Changed
- **Floors 1–3 are livelier.** Fewer empty rooms on the first three floors: about 8% are quiet, down from 22%. The first two rooms past the start always have monsters, and early packs are a little bigger. Deeper floors are unchanged.
- **Cheaper spells.** Fireball costs 4 mana (was 5) and Whirlwind costs 8 (was 9). Frost Nova stays at 14.
- **Easier-to-read inventory.** The bag, stats, item details, lore, and tooltips use larger text, especially on computer screens. On phones, the stats list scrolls instead of getting cut off.
- **Clicking a wall torch or a breakable prop** now walks you up to it and swings, instead of trying to walk into the wall. The cursor turns red over them.

### Fixed
- Knocking out wall torches was unreliable. Any melee swing (click or J) while you're next to a lit wall torch and facing it now puts it out.

## [0.4.1] - 2026-10-24

_Gate Keys on the floor_

### Changed
- Most iron gates now have a **Gate Key** lying somewhere on the same floor, so vaults aren't locked away unless you happen to find the trader.

## [0.4.0] - 2026-10-24

_Feature Brief v1: bigger crypts, survival, shop, doors and traps_

### Added
- **Bigger floors.** Each floor has about 1.7 times as many rooms. Some rooms are quiet now, so the extra space doesn't mean wall-to-wall monsters.
- **Explored map.** Press **M** (or Tab) on a computer, or tap the ⌗ button on a phone, to see the part of the current floor you've explored. It shows doors, water, and the trader.
- **Map Fragments.** These are very rare. Collect 4 and use them from your bag to reveal the whole floor, including hidden walls and traps.
- **Sealed doors and vaults.** Stone doors open with a puzzle in the room: pull levers in the colour order painted on the door, touch runes in the order carved on it, or stand on every pressure plate. Iron gates need a **Gate Key**, which is separate from chest keys. Vaults behind them hold good loot.
- **Blood doors.** The boss room is sealed by a blood door that costs 15% of your max life to open. It never kills you; if you're too hurt, it refuses until you heal.
- **Traps in narrow corridors.** Pitfalls, dart traps, collapsing ceilings, rolling stones, and fire jets. Each one flashes a warning first, so you have time to roll.
- **Breakable props.** Barrels, urns, bone piles, and chained skeletons break apart when you hit them, and sometimes drop gold, a potion, a ration, or a map fragment. Floors are also damper: more puddles, mould, and running water.
- **Torches.** Hit a wall torch to knock it out. Walk up to a lit torch or brazier and press **F** / **USE** to relight your own torch, or use a lit torch on an empty sconce to relight it.
- **Survival.** New Food, Water, and Rest bars. When one runs low you move slower. When one is empty you slowly lose life, but that alone never kills you. Eat rations from your bag, drink from stone basins and running water, and **REST** for 1 to 8 hours in a quiet room with no enemies nearby. 6 to 8 hours is a full rest. You start with 2 rations.
- **The Hollow Pedlar.** A rare crypt shop, usually on the floor right after a boss. Sell backpack items, repair everything at once, and buy potions, rations, and Gate Keys.
- **Satchels and backpacks.** The Bone King and later bosses can drop bags that add 5 or 10 bag slots (40 max).
- **Drop All.** A **DROP ALL** button in the bag drops every backpack item after you confirm "Drop all items?". Shift+click skips the confirm. Equipped gear is never dropped.
- **Boss parley.** Walking up to a boss now pauses for a short exchange before the fight, with three replies to pick from. **BEGIN** (or Esc / Enter) always starts the fight.
- **Thought bubbles.** Every so often your hero, or more rarely a monster, has something to say.
- **Ambient sound.** Crackling torches, dripping water, wind in the corridors, and growls when monsters spot you.
- **Battle music option.** The combat track is now **Off** by default. Turn it on with **BATTLE MUSIC** in the menu.
- **Skill keys.** On a computer, **1 / 2 / 3** now cast a skill toward the mouse instead of switching skills. **F1 to F3** (or clicking a skill box on the bottom bar) still pick the right-click skill. Pause → **SKILL KEYS** lets you choose which skill each key and right-click casts.
- New keys: **F** to use or interact, **R** to eat, **Z** to rest. On phones, a **USE** button appears when you're next to something you can use.

### Changed
- **Stand in place is now Ctrl.** Hold Ctrl and you stay put. Ctrl+left-click attacks toward the cursor without moving. Shift no longer does this; Shift+click is a normal click.
- Loot never lands inside a wall anymore, including monster drops, gold, potions, uniques, and Drop All.
- Restyled menus and panels in stone, parchment, bone, and iron.
- Smoother torch and brazier flicker, and a cool glow over water.

### Fixed
- Items dropped next to a wall could end up stuck in the wall where you couldn't reach them.

## [0.3.2] - 2026-10-24

_Update prompt_

### Added
- **Update prompt.** When a newer build of Lichlight is live, the game tells you when it launches or when you come back to it. Tap **Update** to reload into the latest version (your saved progress stays). Tap **Later** to keep playing; you will be asked again next time you return to the game.
- If you are in the middle of a run, the prompt waits until you pause, take the stairs, die, or return to the title screen, so it never interrupts a fight.

## [0.3.1] - 2026-10-24

_Rarer keys and version display_

### Changed
- **Keys are rarer.** There are now about 3 keys for every 4 locked chests, so you can't open every chest and each key matters.
  - Champions drop a key 12% of the time (it was 30%), and only one champion key can drop per floor.
  - Cracked tiles and bricks hide keys less often. Sometimes there's gold, a torch, or nothing behind them instead.
  - Every floor still gives you a chance to find a key.

### Added
- The version number now shows in the top-right corner of the title screen and pause menu, with a **What's new** link to these release notes.
- A changelog listing what changed in each version.

## [0.3.0] - 2026-10-24

_Level requirements, durability and Repair Potions_

### Added
- **Level requirements on gear.** Every item now has a required level.
  - Gear from floors 1-2 is always level 1. Deeper and rarer gear needs a higher level. Boss uniques have a set requirement based on the boss's floor, so they may need a few more levels.
  - Tooltips show **Required Level: N**, in red if you're too low.
  - Gear you can't wear yet is tinted red in your bag with its level shown, and the EQUIP button says "Requires level N".
- **Durability.** Weapons and armor wear out. Rings don't.
  - Weapons wear as you land hits, and armor wears as you take hits. A normal weapon lasts a few floors.
  - Tooltips show **Durability: current / max**.
  - A yellow warning icon appears at 25%. Below 10% the icon turns red and you get a one-time warning: "Your ___ is about to break!"
- **Items shatter at 0 durability.** They're gone for good, with a glassy shatter sound, "___ shattered!" text, and shards left on the floor. If your weapon shatters, you fight with your fists until you equip another one.
- **Repair Potions** (orange flask). They're the only way to repair gear.
  - They're picked up automatically and stack. You'll find them lying on the floor, in chests, and on champions, and rarely from regular monsters. Every boss drops one.
  - To repair: open your bag, select the potion, then tap any worn item (equipped or in your backpack). It's restored to full durability. **CANCEL** or Esc backs out.
  - New characters start with one. Your count shows in the HUD.

### Saves
- Old saves keep working. Your gear gets level requirements and full durability when you load, and anything you're already wearing stays equipped.

## [0.2.0] - 2026-10-24

_Monsters, bosses, darkness, chests and Diablo-style controls_

### Added
- **30 monster types**, each with its own behavior, plus tougher champion versions.
- **20 bosses**, one every 5th floor, ending with Oswin, the Bone King, on floor 100. After that they come back as stronger "+1", "+2" versions. Each boss has its own attack patterns and gets more dangerous as it loses health.
- **Screenshake** on big hits, with an Off / Low / Full setting in the pause menu.
- **Darkness and light.**
  - You start with only a faint glow.
  - Torches light up the area for about 85 seconds. You can carry up to 5 spares, and a meter shows how much is left.
  - Wall sconces and braziers light rooms, and walls block light.
  - Some unique rings give off magic light.
  - The minimap only shows places you've explored.
- **Locked chests and hidden keys.** There are 1-3 locked chests per floor, holding magic and rare gear. Keys are hidden under cracked floor tiles and behind cracked bricks. Hit them or roll into them to break them.
- **Click or tap to pick up gear.** Gold, potions, keys, and torches are still picked up automatically.
  - On a computer, hover over an item to see its stats compared with what you're wearing. On a phone, press and hold it.
  - If your backpack is full, you'll see a message and the item stays on the ground.
- **NEW tags** on freshly looted items, with a counter on the bag button and a **MARK ALL SEEN** button.
- **Diablo 2-style computer controls.**
  - Click to walk (it finds a path around walls), and click an enemy to attack it. Shift+click attacks in place.
  - Right-click casts your selected skill. Choose the skill with 1/2/3 or F1-F3.
  - Space dodge-rolls toward the cursor. Tab opens the map, and holding Alt shows item labels.
  - Hovering over an enemy shows its health bar. There's a new gauntlet cursor.
  - A new bottom HUD shows life and mana orbs, a potion belt, skills, an XP bar, keys, and torches.
  - Touch controls are unchanged.

### Changed
- **Loot rebalance.**
  - Regular monsters and champions drop only gold, potions, and the occasional normal item.
  - Magic and rare gear comes from chests and bosses.
  - Only bosses drop uniques. Each boss always drops one unique plus rare gear.
- On a computer, Shift no longer dodge-rolls (it's now attack in place). Use Space or K to roll.

### Fixed
- Click-to-walk no longer gets stuck on wall corners, and any walk in progress is cancelled when you take the stairs.

## [0.1.1] - 2026-10-24

_README and how to play_

### Added
- A README on GitHub covering the story, how to load the game on iPhone, Android, and computers, how to play, and the full controls.

## [0.1.0] - 2026-10-24

_First public release_

First public release, playable in your browser at https://gamedevjake.github.io/lichlight/

### Added
- **Lichlight**, a retro pixel-art dungeon crawler. Beneath drowned Vaelmoor, King Oswin Hollowmere sold his soul to the Pale Choir, and now the Bone King waits below.
- Endless randomly generated crypt floors, with champions and a boss guarding the stairs every 5th floor.
- **Mobile-first controls** in landscape: a floating joystick, an auto-aiming attack button, a dodge roll that makes you briefly invulnerable, and the skills Fireball, Whirlwind, and Frost Nova, plus life and mana potions. Keyboard controls work on computers.
- **Diablo-style loot** in four rarities: white normal, blue magic, yellow rare, and gold unique. Named uniques each come with their own lore.
- An inventory where you can equip, drop, and compare items, plus a **SORT** button.
- **Music.** Ambient and combat tracks crossfade, and boss fights get more intense music. The pause menu has sound and music toggles and volume sliders.
- **Autosave** every time you reach a new floor. Choose **Continue** on the title screen to resume.
- **iPhone support.** It plays in Safari, Add to Home Screen gives you fullscreen with its own icon, sound starts on your first tap, and the layout works around the notch. Android has a fullscreen button.
- Hosted on GitHub Pages.

[0.7.15.2]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.15.2
[0.7.15.1]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.15.1
[0.7.17]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.17
[0.7.15]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.15
[0.7.14]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.14
[0.7.13]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.13
[0.7.12.1]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.12.1
[0.7.12]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.12
[0.7.3.1]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.3.1
[0.7.10.1]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.10.1
[0.7.11]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.11
[0.7.10.3]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.10.3
[0.7.10.2]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.10.2
[0.7.10]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.10
[0.7.9]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.9
[0.7.8.1]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.8.1
[0.7.8]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.8
[0.7.5]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.5
[0.7.4]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.4
[0.7.3]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.3
[0.7.2]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.2
[0.7.1]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.1
[0.7.0]: https://github.com/gamedevjake/lichlight/releases/tag/v0.7.0
[0.6.4]: https://github.com/gamedevjake/lichlight/releases/tag/v0.6.4
[0.6.3]: https://github.com/gamedevjake/lichlight/releases/tag/v0.6.3
[0.6.2]: https://github.com/gamedevjake/lichlight/releases/tag/v0.6.2
[0.6.1]: https://github.com/gamedevjake/lichlight/releases/tag/v0.6.1
[0.6.0]: https://github.com/gamedevjake/lichlight/releases/tag/v0.6.0
[0.5.0]: https://github.com/gamedevjake/lichlight/releases/tag/v0.5.0
[0.4.6]: https://github.com/gamedevjake/lichlight/releases/tag/v0.4.6
[0.4.5]: https://github.com/gamedevjake/lichlight/releases/tag/v0.4.5
[0.4.4]: https://github.com/gamedevjake/lichlight/releases/tag/v0.4.4
[0.4.3]: https://github.com/gamedevjake/lichlight/releases/tag/v0.4.3
[0.4.2]: https://github.com/gamedevjake/lichlight/releases/tag/v0.4.2
[0.4.1]: https://github.com/gamedevjake/lichlight/releases/tag/v0.4.1
[0.4.0]: https://github.com/gamedevjake/lichlight/releases/tag/v0.4.0
[0.3.2]: https://github.com/gamedevjake/lichlight/releases/tag/v0.3.2
[0.3.1]: https://github.com/gamedevjake/lichlight/releases/tag/v0.3.1
[0.3.0]: https://github.com/gamedevjake/lichlight/releases/tag/v0.3.0
[0.2.0]: https://github.com/gamedevjake/lichlight/releases/tag/v0.2.0
[0.1.1]: https://github.com/gamedevjake/lichlight/releases/tag/v0.1.1
[0.1.0]: https://github.com/gamedevjake/lichlight/releases/tag/v0.1.0
