# RISK THE LOOT!

A framework-free HTML5 roguelite prototype about pushing deeper, collecting scrap, and deciding when to escape.

## Core loop

1. Upgrade the rig in the workshop.
2. Start an expedition.
3. Move, dodge, and collect scrap while the rig fires automatically.
4. At depth milestones, extract or risk the cargo for stronger rewards and an elite encounter.
5. Survive extraction to bank the scrap. Dying loses everything carried on that expedition.

## Controls

- Move: `WASD`, arrow keys, or the mobile joystick
- Dash: `Space` or the on-screen dash button
- Combat: automatic targeting and firing

## Run locally

```powershell
python -m http.server 4174 --bind 127.0.0.1
```

Open `http://127.0.0.1:4174` in a browser.

Built with plain HTML, CSS, JavaScript, and Canvas.
