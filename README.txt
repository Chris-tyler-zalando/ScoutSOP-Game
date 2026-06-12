ZALANDO SCOUT — SYSTEM UPDATE V2.74
====================================

This ZIP contains the system files only:
- index.html
- styles.css
- game.js
- custom_map_layout (1).json

Keep your existing /assets folder beside these files. Image and sound asset paths have not changed.

Baseline
--------
This build continues from V2.73 mobile mini-game hotfix.

Changes in V2.74
----------------
- Added a quick translucent PATH BLOCKED toast when the player keeps walking into a blocked object/wall.
- Bathroom/first-aid decorative room art is now drawn as a background layer after the cement floor and before shelves/boxes/player layers, so the scout should not visually walk behind it.
- Bathroom background art is also treated as a protected visual zone when placing filler shelves/boxes, so clutter should avoid covering it as much as possible.
- Mobile top-right phone/desktop and mute buttons are pinned tighter to the top-right corner with stronger shadows.
- No EAN Scanner now plays a laser sound when scanning, a success sound on correct target, and an error sound on wrong target.
- Sperrlager/QS now plays a mechanical success sound for a correct catch and a mechanical error sound for a wrong catch.
- Added admin URL access. Use any of these:
  - index.html?admin=1
  - index.html?mode=admin
  - index.html#admin
- Crazy Ivan boss death handling changed: if the player dies during Ivan, Continue restarts the Ivan scene instead of returning to the dock.
- Crazy Ivan mobile performance pass:
  - mobile boss mode caps boss rendering to about 30fps,
  - reduces expensive boss glow/gradient effects on mobile,
  - uses a fixed 2000px boss arena width on mobile,
  - slightly simplifies/scales boss actors for mobile performance.
- Cache refs bumped to 2.74.

Files changed
-------------
- index.html
- styles.css
- game.js
- README.txt

Testing notes
-------------
After uploading, open the page with:
  index.html?v=274

On mobile, test:
- PATH BLOCKED toast when walking into shelves/walls.
- Bathroom/first-aid pod drawing order.
- No EAN scan sounds and controls.
- Sperrlager correct/wrong catch sounds.
- Admin URL.
- Ivan fight speed and Continue behaviour after death.
