ZALANDO SCOUT — SYSTEM UPDATE V2.41
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

Changes in V2.41
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


V2.41 additions and corrections:
- Office home screen keeps pcmenu.jpg, moved upward and resized to prevent clipping/white strip.
- Jira interaction buttons are blue with rounded corners.
- Office task puzzles now have an optional 100-point hint system with locked revealed answers or incorrect-selection explanations.
- Task riddles avoid immediately repeating the previous riddle of the same type.
- Fire uses a doubled-size animated DOM WebP overlay for reliable animation and enables automatic 2x emergency response movement while active.
- Hidden Admin Test Mode: press Escape five times from the title screen to launch modules directly without saving test scores.


V2.41 updates:
- QS falling articles and the sorting crate are twice as large.
- Removed the black sign backing so warehouse labels render cleanly without sign panels.
- Fire event now displays an extinguisher pickup in the guided collection area.
- Fire is rendered using a large 75%-opacity base layer plus the animated WebP screen-blend layer.
- Office bottom actions have been shifted to the centre/right to avoid the chair overlap.
- Added up to three separate saved scout profiles with select, continue and delete controls on the title screen.


V2.41 updates:
- Saved-shift profile cards now continue that save directly when clicked.
- Removed the redundant Continue button from the title screen.
- Combined Saved Shifts and Scout Name into one title-screen panel and removed the grey saved-shift backing.
- Removed the title-screen tagline.
- Added even collectible shoe rotation using shoe.png, shoe1.png, shoe2.png and shoe3.png when available.


V2.41 updates:
- Dock is pinned to the top-left and the map size is reduced by roughly 25%.
- Added lane-style light/dark floor overlays.
- Added central elevator using elevator.png with rotating destination labels.
- Added horizontal conveyors using conveyor.png, with moving box.png parcels and occasional moving shoe pickups.
- Improved pickup spacing to prevent stacked clutter.
- Dock office entrance collision is opened up.
- End summary labels cleaned up and renamed.
- Wrong office task answers show error.jpg inside the computer monitor for 2 seconds before the failure message.


V2.41:
- Reworked title panel into a compact two-line layout.
- Removed Saved Shifts / Max 3 text from visible title UI.
- Start button now spans both rows and says Start.
- Empty save slots now appear as 1, 2, 3.


V2.41:
- Moved the compact title panel down so the empty space below it is not stupidly large.

V2.41:
- Office/dock collision restored with a forgiving inset footprint instead of being fully removed.
- Inventory Check now runs 60 seconds, uses a 6x5 grid, larger cells, and one-click neighbour-only swaps.
- Quarantine Chaos now runs 60 seconds, lets the crate move half off-screen so each side can reach the screen edge, and removes extra drawn Dispose/Destroy labels.
- Area sign images are restored behind labels without artificial black backing.
- Conveyors added to the top/bottom of QS and Inventory zones so those areas read as side-entry work zones.
- Fire extinguishing now plays a spray noise, shows a spray effect, fades the fire out, and shows the fire-extinguished points toast.

V2.41:
- Space / Action no longer opens the office from anywhere in the Dock; it only opens near the office door.
- Dock start position moved away from the conveyor/collision area.
- Dock conveyor shifted so it does not trap the starting point.
- Light/dark walking-path overlays made more visible.
- Conveyor pieces now draw with drop shadows too.

V2.41:
- Elevator visual/navigation hub reduced to about half size while preserving the 2:1 elevator image ratio.
- Shelf placement rules tightened: shelves now snap to aligned aisle rows.
- Shelf runs are placed as whole groups of 4–6 shelves, with deliberate lane gaps only between groups.
- Removed the previous orphan/staggered partial shelf dividers that caused random out-of-line shelves.
- Empty-patch filler now adds aligned shelf runs instead of scattered loose shelves.

V2.41:
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

V2.41:
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

V2.41:
- Cleared shelf/border boxes and clutter from the left-side Dock driveway/road.
- Dock driveway is now treated as a safe zone; robots/forklifts should not enter or path through it.
- Elevator pod is now treated as a safe zone; robots/forklifts should not enter or path through it.
- Conveyor moving items are drawn slightly higher so they sit on the belt instead of looking like they are falling off.
- Elevator image is drawn at 60% scale inside its pod.
- Elevator destination labels are now drawn inside the black label boxes above the doors.
- Future note locked: when boss levels are added, there should be a boss every 3 levels, and defeating a boss should add an extra heart capacity.

V2.41:
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

V2.41:
- No EAN Scanner briefing still uses welcome3.jpg.
- No EAN Scanner gameplay now prioritizes conveyor.jpg as the background image.
- Removed welcome3.jpg as the gameplay background fallback so the instruction image is not accidentally used during play.
