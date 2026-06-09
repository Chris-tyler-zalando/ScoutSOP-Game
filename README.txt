ScoutSOP Game V2.69 — Live Asset Loader Fix

This build is based on the V2.69 cleaned asset references.

Changes:
- Loads assets with a concurrency limit of 8 instead of firing all image requests at once.
- Increased per-asset timeout from 3.5 seconds to 22 seconds and added one retry before fallback.
- Adds window.SOP_ASSET_STATUS and console.table(assetStatus) so the live site clearly reports what loaded, timed out, or fell back.
- Makes important visible gameplay assets required rather than silently optional: office, palletjack, elevator, conveyor, minimap, printers, bathroom, boss files, scanner/no-EAN assets, etc.
- Keeps unused references removed: fireball_sheet.png, car_battle_sheet.png, jira.jpg, minimap fallbacks that do not exist, and no-EAN placeholder filenames that do not exist.
- Printer filler area is now 50% smaller.
- Bathroom/First Aid filler area is now 40% smaller.
- Printer/bathroom room art is placed first so boxes/shelves/crates draw over it.
- Truck drawing now guards against a missing image rather than risking a draw error.

Upload these three files to the repo root beside /assets:
- index.html
- game.js
- styles.css

Then hard reload the live page and confirm it loads game.js?v=2.68.

V2.69:
- Added Admin → File Audit: shows each configured asset, filename, native dimensions, and current in-game draw usage/dimensions.
- Added gameplay zoom buttons beside the controls; zoom is capped to two steps in or out.
- Minimap is 25% smaller and uses the actual minimap image aspect ratio to remove grey letterbox bars.
- Map generation now follows the uploaded custom map style more closely: fewer broad yellow corridors and pod placement based on the 80×50 reference layout.
- Conveyor protection updated: boxes, crates, pallets, cones and decorative clutter are removed/blocked from conveyor belts and conveyor machines.
- Conveyor placement rule is reinforced: belt and machine use the same Y draw line.
- Cones now spawn as deliberate lines and avoid clumping into useless blocks.
- Printer/bathroom zones reserve a buffer so crates do not overlap or sit too close to the room image.
- Double-clicking the speaker now toggles mute and restores the previous volume.
