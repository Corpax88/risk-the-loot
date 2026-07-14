# RISK THE LOOT! v0.2.0

A framework-free HTML5 extraction roguelite about pushing deeper, building a field loadout, and deciding when to escape.

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

## Blueprint workshop

- Extracted modules become permanent blueprints.
- Duplicate recoveries increase blueprint mastery at 1, 3, and 7 copies.
- Scrap can tune an unlocked blueprint twice.
- One blueprint can be equipped as the starter module for future expeditions.
- Starter modules occupy one cargo slot and cannot be recovered again for free.

## Release features

- First-run visual briefing
- Pause and persistent sound, screen shake, and particle settings
- Career records and expedition reports
- Versioned migration for existing local saves
- Keyboard, pointer, multitouch, and iPhone safe-area support
- Entity limits and delta-time simulation for consistent mobile performance

## Controls

- Move: `WASD`, arrow keys, or the mobile joystick
- Dash: `Space` or the on-screen dash button
- Extract: `E` or the on-screen extract button
- Pause/settings: `Escape` or the gear button
- Combat: automatic targeting and firing

## Run locally

```powershell
python -m http.server 4175 --bind 0.0.0.0
```

Open `http://127.0.0.1:4175` on the computer, or use the computer's local IP address to test on a phone connected to the same network.

## Verify the release loop

```powershell
node tests/release-smoke.js
```

The smoke test covers save migration, the blueprint bench, first-run briefing, module choices, both risk milestones, the Scrap Warden, extraction, career progression, and persistent settings.

Built with plain HTML, CSS, JavaScript, and Canvas.
