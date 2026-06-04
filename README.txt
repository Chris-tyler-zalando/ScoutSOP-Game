ZALANDO SCOUT — SYSTEM UPDATE V2.16

Replace these system files only:
- index.html
- styles.css
- game.js
- README.txt

Keep your existing assets folder and add `smallbox3.png` if not already present.

Changes:
- Warehouses 1–4 are now double the previous map size.
- From Warehouse 5 onward, the map doubles again.
- Renderer is camera-limited so the much larger floors do not allocate a massive full-map image layer.
- Exit is positioned far from the Dock and surrounded by a zig-zag rack approach.
- Ordered rack lanes extend across the larger warehouse with cross-aisle breaks.
- Pickup and coffee density scales with map size.
- `smallbox3.png` added to decorative clutter.
- Decorative clutter uses only 100%, 50%, or 30% size variants and has no collision.

New optional asset:
- assets/smallbox3.png
