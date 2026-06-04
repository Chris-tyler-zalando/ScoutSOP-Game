ZALANDO SCOUT — SYSTEM UPDATE V2.27
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

Changes in V2.27
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


V2.27 additions and corrections:
- Office home screen keeps pcmenu.jpg, moved upward and resized to prevent clipping/white strip.
- Jira interaction buttons are blue with rounded corners.
- Office task puzzles now have an optional 100-point hint system with locked revealed answers or incorrect-selection explanations.
- Task riddles avoid immediately repeating the previous riddle of the same type.
- Fire uses a doubled-size animated DOM WebP overlay for reliable animation and enables automatic 2x emergency response movement while active.
- Hidden Admin Test Mode: press Escape five times from the title screen to launch modules directly without saving test scores.
