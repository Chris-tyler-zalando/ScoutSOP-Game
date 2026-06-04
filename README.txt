ZALANDO SCOUT — SYSTEM UPDATE V2.18 — NO BLANK ZONES

Replace only these system files beside your existing assets folder:
- index.html
- styles.css
- game.js
- README.txt

Changes in V2.18:
- Rebuilt large warehouse generation as repeated shelf-wall bands across the entire playable map.
- Narrow, staggered through-points keep navigation possible without creating large bare floor areas.
- Added a fail-safe density scan: any camera-sized patch without enough visible shelving is automatically filled with a short rack wall and one crossing gap.
- Keeps grouped/flipped racks and decorative clutter along the shelf fronts.
- Added versioned CSS/JS references in index.html to reduce stale browser caching while testing updates.

Keep your assets folder unchanged.
