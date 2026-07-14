# RISK THE LOOT!

A framework-free HTML5 roguelite prototype about pushing deeper, collecting scrap, and deciding when to escape.

## Core loop

1. Upgrade the rig in the workshop.
2. Start an expedition.
3. Move, dodge, and collect scrap while the rig fires automatically.
4. Open salvage caches and shape a run with up to three field modules.
5. At depth milestones, extract or risk the cargo for stronger rewards and an elite encounter.
6. Defeat the Scrap Warden at Depth 5 for guaranteed rare salvage.
7. Survive extraction to bank scrap and recovered module blueprints. Dying loses everything carried on that expedition.

## Field modules

- Burst Capacitor: adds projectiles to each volley
- Magnetic Core: increases pickup range
- Reactive Plating: blocks incoming hits
- Overdrive Coil: increases movement and fire rate
- Volatile Reactor: increases damage at the cost of maximum health

Rare modules provide double power. The workshop gains new visual machinery as permanent upgrades and blueprints accumulate.

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
