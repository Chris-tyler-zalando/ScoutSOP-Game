ZALANDO SCOUT — SYSTEM UPDATE V2.58
====================================

This ZIP contains the system files only:
- index.html
- styles.css
- game.js

Keep your existing assets folder beside these files. The new version expects these additional assets in that folder when available:
- palletjack.png
- clothesdamaged.png
- slbox.png
- qs2.jpg (or qs2.png fallback)
- fire.png (extinguisher)
- fire.webp (animated fire)

Changes in V2.57
----------------
- Restored the original pcmenu.jpg image for the Dock Office home screen. The game no longer redraws its own replacement app menu.
- Once an app is clicked, only the menu image is removed and the Jira / Email / Workday / SOP Scout content is drawn on the blank monitor in baseoffice.jpg.
- Reduced the office task-interface drawing area so the task screens fit within the monitor frame.
- Added visible CORRECT / WRONG result screens before an office task moves to the next backlog item or returns to the menu.
- Boxes now generate Email and Workday task progress only. ALM and SL task progress continues to come from shoes.
- Corrected Quarantine Storage: it is now a 30-second falling-item catcher game rather than a drag-and-drop basket screen.
- In Quarantine Storage, clothes.png items belong in DISPOSE and clothesdamaged.png items belong in DESTROY; correct catches score +5 points, and the fall frequency increases across the 30-second round.
- Quarantine Storage triggers on entering the area or being sent there by a box, then uses a 30-second retrigger cooldown.
- Added random Fire Events during normal warehouse play, with a red alarm vignette, guidance arrow to the nearest extinguisher point, carried extinguisher display, return guidance to the fire and time-based scoring.
- Fire event score: +200 within 60 seconds, +150 within 90 seconds, +100 within 120 seconds, +50 within 150 seconds, otherwise +0.

Retained from earlier builds
----------------------------
- Pallet jacks, including one near the Dock, with 30-second speed/protection effect.
- Cockpit help modal, safe zones, task-gated exit, Inventory Check, mobile controls, coffee sprint, score download, carrier toast and increased enemies.


V2.57 additions and corrections:
- Office home screen keeps pcmenu.jpg, moved upward and resized to prevent clipping/white strip.
- Jira interaction buttons are blue with rounded corners.
- Office task puzzles now have an optional 100-point hint system with locked revealed answers or incorrect-selection explanations.
- Task riddles avoid immediately repeating the previous riddle of the same type.
- Fire uses a doubled-size animated DOM WebP overlay for reliable animation and enables automatic 2x emergency response movement while active.
- Hidden Admin Test Mode: press Escape five times from the title screen to launch modules directly without saving test scores.


V2.57 updates:
- QS falling articles and the sorting crate are twice as large.
- Removed the black sign backing so warehouse labels render cleanly without sign panels.
- Fire event now displays an extinguisher pickup in the guided collection area.
- Fire is rendered using a large 75%-opacity base layer plus the animated WebP screen-blend layer.
- Office bottom actions have been shifted to the centre/right to avoid the chair overlap.
- Added up to three separate saved scout profiles with select, continue and delete controls on the title screen.


V2.57 updates:
- Saved-shift profile cards now continue that save directly when clicked.
- Removed the redundant Continue button from the title screen.
- Combined Saved Shifts and Scout Name into one title-screen panel and removed the grey saved-shift backing.
- Removed the title-screen tagline.
- Added even collectible shoe rotation using shoe.png, shoe1.png, shoe2.png and shoe3.png when available.


V2.57 updates:
- Dock is pinned to the top-left and the map size is reduced by roughly 25%.
- Added lane-style light/dark floor overlays.
- Added central elevator using elevator.png with rotating destination labels.
- Added horizontal conveyors using conveyor.png, with moving box.png parcels and occasional moving shoe pickups.
- Improved pickup spacing to prevent stacked clutter.
- Dock office entrance collision is opened up.
- End summary labels cleaned up and renamed.
- Wrong office task answers show error.jpg inside the computer monitor for 2 seconds before the failure message.


V2.57:
- Reworked title panel into a compact two-line layout.
- Removed Saved Shifts / Max 3 text from visible title UI.
- Start button now spans both rows and says Start.
- Empty save slots now appear as 1, 2, 3.


V2.57:
- Moved the compact title panel down so the empty space below it is not stupidly large.

V2.57:
- Office/dock collision restored with a forgiving inset footprint instead of being fully removed.
- Inventory Check now runs 60 seconds, uses a 6x5 grid, larger cells, and one-click neighbour-only swaps.
- Quarantine Chaos now runs 60 seconds, lets the crate move half off-screen so each side can reach the screen edge, and removes extra drawn Dispose/Destroy labels.
- Area sign images are restored behind labels without artificial black backing.
- Conveyors added to the top/bottom of QS and Inventory zones so those areas read as side-entry work zones.
- Fire extinguishing now plays a spray noise, shows a spray effect, fades the fire out, and shows the fire-extinguished points toast.

V2.57:
- Space / Action no longer opens the office from anywhere in the Dock; it only opens near the office door.
- Dock start position moved away from the conveyor/collision area.
- Dock conveyor shifted so it does not trap the starting point.
- Light/dark walking-path overlays made more visible.
- Conveyor pieces now draw with drop shadows too.

V2.57:
- Elevator visual/navigation hub reduced to about half size while preserving the 2:1 elevator image ratio.
- Shelf placement rules tightened: shelves now snap to aligned aisle rows.
- Shelf runs are placed as whole groups of 4–6 shelves, with deliberate lane gaps only between groups.
- Removed the previous orphan/staggered partial shelf dividers that caused random out-of-line shelves.
- Empty-patch filler now adds aligned shelf runs instead of scattered loose shelves.

V2.57:
- Locked map rules from the sketch.
- Tile size is now 100px.
- Standard map size is now fixed at 80 x 50 tiles.
- Dock is fixed at the top-left.
- Elevator is fixed in the central pod.
- Inventory, Quarantine, Exit and Kitchens rotate between reserved area pods each warehouse.
- A fixed light corridor skeleton is kept open.
- Shelf/maze generation is restricted to the remaining grey blocks.
- Pickups now prefer the light walkable corridor cells.
- Shelf runs remain aligned rather than scattered.

V2.57:
- Dock driveway extends left off-map, with truck entering/leaving from the left.
- Dock office/building is about 25% larger and positioned at the far-right of the driveway.
- Dock driveway has traffic cone guide rows with gaps.
- Dock area has top and bottom conveyor boundaries.
- inventory1.png, table.png and table2.png are scaled up in the Inventory area.
- table3.png is no longer used.
- Kitchen image is 25% larger and centered in its kitchen pod.
- Quarantine area now places large mouldy boxes mostly along bottom/sides, with small boxes and conveyors inside.
- Area pod dark fill removed; only a very faint outline remains.
- Cone guides added along open walking lanes where shelves are not present.

V2.57:
- Cleared shelf/border boxes and clutter from the left-side Dock driveway/road.
- Dock driveway is now treated as a safe zone; robots/forklifts should not enter or path through it.
- Elevator pod is now treated as a safe zone; robots/forklifts should not enter or path through it.
- Conveyor moving items are drawn slightly higher so they sit on the belt instead of looking like they are falling off.
- Elevator image is drawn at 60% scale inside its pod.
- Elevator destination labels are now drawn inside the black label boxes above the doors.
- Future note locked: when boss levels are added, there should be a boss every 3 levels, and defeating a boss should add an extra heart capacity.

V2.57:
- Added No EAN on Shipping Notice scanner mini-game.
- Box loot can now trigger the No EAN scanner task.
- Uses welcome3.jpg as the briefing screen.
- Supports scanner.png, scanner2.png and scanner3.png feedback states.
- Supports a full scanner/conveyor background using noeanbg.jpg/png, scannerbg.jpg/png, or conveyorbg.jpg/png.
- Scanner moves left/right, snaps through fixed angles, Space fires a red scanner beam, Enter resets to centre/90°.
- One target category per 60-second round: SHOES, TOPS or PANTS.
- Correct hit +15, wrong hit -30, missed target -30; penalties at zero score cost hearts.
- Wrong hits flash the screen red and do not remove the wrong item.
- Added Admin Test button for No EAN Scanner.

V2.57:
- No EAN Scanner briefing still uses welcome3.jpg.
- No EAN Scanner gameplay now prioritizes conveyor.jpg as the background image.
- Removed welcome3.jpg as the gameplay background fallback so the instruction image is not accidentally used during play.

V2.57:
- Fixed No EAN scanner sprite aspect ratio. scanner.png is 229x500, so it is now drawn tall instead of squashed.
- Replaced the long horizontal No EAN stats box with a narrow vertical HUD in the left-side open space.
- Moved the start target toast lower so it does not fight the HUD.

V2.57:
- Rebuilt the No EAN item path against conveyor.jpg using a 1672x941 coordinate base.
- Items now follow the visible conveyor belt centreline instead of sliding through the open floor.
- Added item visual offsets so shoes/clothes sit on the belt surface more naturally.
- Moved the No EAN HUD down into the left-side vertical space instead of the top area.
- Scanner beam origin now uses the top centre of the tall scanner sprite.
- Scanner start and movement limits now follow the 1672x941 movement-band spec.

V2.57:
- No EAN scanner now uses dedicated category sprite cards: shoes.webp, tops.webp, pants.webp.
- Removed the max-active item cap for No EAN so the conveyor does not get empty gaps as the 60-second round accelerates.
- Spawning now uses a tighter path-gap rule instead of a hard item limit.
- Spawn intervals are denser across the whole round.
- Spawn mix is balanced so each round gets plenty of target items and distractors.

V2.57:
- Fixed No EAN sprite-card slicing for shoes.webp, tops.webp and pants.webp.
- No EAN sprite cards now use a fixed 4x3 grid with alpha-bounds cropping, so items are not cut from the wrong grid.
- Added a stronger dark drop shadow behind No EAN clothes/shoe sprites.
- Added conveyor2.png support as a single conveyor machine/end-cap per conveyor run.
- conveyor2.png is only placed at one end of a conveyor run, not between repeated conveyor pieces.
- conveyor2.png flips when it is on the left side so the machine faces into the conveyor.
- Moving conveyor items now use the extended conveyor path including the conveyor2 end-cap area.

V2.57:
- Added minimap.webp support, scaled into a top-right minimap HUD.
- Minimap markers: flashing player, fire, extinguisher, active truck, and optional debug robots.
- Added Ctrl+Shift+Space debug overlay: red collision boxes and green interaction/click zones.
- Admin/office mode now shows green app click boxes for monitor hotspots.
- Fire cooldown changed to 10 minutes after resolution, with less aggressive initial fire timing.
- Inventory, Sperrlager/QS, No EAN and office task modules now use 5-minute cooldowns.
- Pallet jack riders cannot start Inventory Check or Sperrlager.
- Pallet jack robot/forklift hit disables that enemy for 5 minutes.
- Robot counts now use the 10/8/6 repeating warehouse density pattern and far fewer forklifts.
- Fixed conveyor2.png placement: one machine per run, attached after the normal conveyor, not overlapping.
- Conveyor moving items now stop at the machine entrance.
- Kitchen coffee is placed to the right of the refrigerator.
- Elevator destination text moved into the black sign boxes.
- Inventory top bar shortened so timer avoids the top-right buttons.
- Quarantine Chaos renamed to Sperrlager: Items in bad condition and falling items are about 20% faster.
- No EAN target selection avoids immediate repeats, and the right-side conveyor path is pulled left.

V2.57:
- Added level-based required task counts: warehouse 1 requires any 2 tasks, warehouse 2 requires any 3 tasks, warehouse 3+ requires all 4 task types.
- Reworked box rewards into a filtered loot table so cooldown tasks cannot be awarded while unavailable.
- Operational Excellence now unlocks the exit route and shows the new message.
- SOPScout token pickup now flashes scoticon.png with a glow and the new office-help toast.
- Robot count is now fixed by cycle: 15 / 20 / 30 robots.
- Random clutter and box placement now avoid tables, machinery, task props, conveyors, dock road, elevator, and mandatory clear paths.
- Consolidated safe-zone logic through isSafeZone(tile).
- Minimap marker drawing is more visible and live-state focused.
- Conveyor draw alignment moved slightly down and No EAN right-side path pulled left.

V2.57:
- Added Crazy Ivan boss fight after every third warehouse.
- Added it2.jpg intro flow, bossbg.jpg scrolling arena, boss1.webp animated boss, fireball.webp projectiles, car.webp battle vehicle, car.png victory car, bossbg1.jpg victory background, and actionssprite.png win animation support.
- Boss has 6 hearts. Vertical forklift rams deal 2 damage. Unlimited thrown offline-stock shoes deal 1 damage and spin while travelling upward.
- Player enters the boss fight with full current max-heart capacity.
- Defeating Ivan grants +1 max heart capacity and shows a score-board style summary with the extra-heart reward.
- boss.mp3, robot1.mp3, robot2.mp3, robot3.mp3, and success.mp3 are supported when present in assets.

V2.57:
- Fixed startup/gameplay freeze caused by old MAX_HEARTS references after maxHearts was introduced.
- Saved shifts now preserve maxHearts.
- Name input no longer swallows gameplay movement keys after the intro.
- Starting/continuing a shift blurs the title input and clears stuck keys.

V2.57:
- Cleared pending list items: removed return reward, improved filtered loot, stronger shoe availability, pushable smallbox3, area-edge shelves/boxes, conveyor-machine alignment, No EAN path pull-left, QS timer layout, elevator label/helper text, live minimap visibility, admin drag/collapse/edit, and carry-forward resources between warehouses.

V2.57:
- Rebuilt car_battle_sheet.png from car.webp using edge-connected black removal so only visible car pixels draw.
- Boss car now draws from the cropped transparent sprite sheet and preserves aspect ratio.
- Boss/car/fireball visuals adjusted: Ivan larger, fireballs larger/glowing from chest, victory car larger.
- Forklift enemies now flip horizontally when moving right so they face their travel direction.
- Conveyor drawing now uses same-scale same-top placement for conveyor.png and conveyor2.png; no fake vertical centering.
- Moving conveyor item lane adjusted to sit on the visible belt surface.
- Filler room prop installer now actually runs, supports printers/bathroom, and adds denser box/shelf walls around pods.
- Added Admin Build a Map mode with prop palette, grid view, place/erase, zoom hotkeys, and JSON export.

V2.57:
- Admin Test Mode panel is now fixed to the browser viewport and can be dragged into the black side margins outside the 16:9 play area.
- Build a Map controls moved into a draggable DOM panel instead of being locked inside the canvas.
- Build a Map panel can be dragged into the black side margins, collapsed, zoomed, switched between place/erase, and used to export JSON.
- Map Builder canvas is now free to use the full play area for the map.

V2.57:
- Build a Map is now a template editor with editable yellow path blocks and green area pods.
- Shows all default pods including top-right and bottom-middle.
- Green areas and yellow paths can be placed, moved, resized with corner handles, selected, duplicated, and deleted.
- Dock and elevator area blocks display their actual images when available.
- Tools added: Place, Erase, Move, Select.
- Select supports click selection, drag-select marquee, centre-dot moving, and right-click menu actions.
- Prop palette is now two columns with smaller buttons.

V2.57:
- Fixed Build a Map opening blank.
- Added the missing uid() helper used by editable green/yellow map objects.
- Added safe draw guards for missing map-builder arrays.
- Kept the advanced map-builder controls from V2.57.

V2.57:
- Fixed Build a Map right-click actions.
- Yellow Path and Green Area placement now works by click-dragging a rectangle.
- Middle mouse / mouse wheel button drag now pans the map workspace.
- Control panel buttons and padding reduced.
- Prop palette is now a compact 3-column icon-only grid.

V2.57:
- Build a Map objects can now be dragged partially outside the 80x50 board.
- Movement/resizing only clamps when less than roughly one tile would remain on the board.
- This lets shelves/large props sit over the edge like real boundary decoration without losing them completely.

V2.57:
- Added named Save and Load for Build a Map using browser local storage.
- Back/Escape now autosaves the current map before leaving the builder.
- Header now has emoji Back, Collapse, and Close controls.
- Tool controls are emoji-style.
- Green Area and Yellow Path buttons now use colored dots.
- Added new prop placement scale buttons: 1x, 2x, 3x.
- Added Rescale selected objects button with 1x/2x/3x choices.
- Added layer ordering to right-click menu: Bring front, Move forward, Move backward, Send back.
- Right-click menu still includes Duplicate, Delete, Flip, Collision.
- Prop palette remains compact 3-column icon-only.

V2.57:
- Dock/carrier delivery response timer changed from 30 seconds to 60 seconds.
- Delivery prompt text updated to say 60 seconds.

V2.58 boss hotfix:
- Boss music now starts as soon as the boss intro screen appears.
- Removed main-canvas rectangle tinting that caused visible square backgrounds around boss/player/fireball assets.
- Rebuilt car_battle_sheet.png from car.webp with edge-connected black background removed and square 1100x1100 frames.
- Added fireball_sheet.png from fireball.webp so fireballs animate manually.
- Boss victory now switches to bossVictory mode immediately, stops future fireballs/voices, clears current fireballs and clears shoe projectiles.
- Fireballs now originate from Ivan's chest cannon area and are larger/glowing.
- Space/action now throws boss shoes from the boss fight, with larger spinning projectiles and a wider boss hitbox.
- Boss battle car is drawn square to preserve the original character/car aspect ratio.
- Victory car is larger and the winning scout animation is about double size with correct sprite-frame aspect ratio.
