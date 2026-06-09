ScoutSOP Game V2.68 — Live Asset Loader Fix

This build is based on the V2.67 cleaned asset references.

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
