# RISK THE LOOT! v0.5.0

A framework-free HTML5 extraction roguelite about pushing deeper, building a field loadout, and deciding when to escape.

## Core loop

1. Upgrade the rig in the workshop.
2. Start an expedition.
3. Move, dodge, and collect scrap while the rig fires automatically.
4. Open salvage caches and shape a run with up to three field modules.
5. At depth milestones, extract or risk the cargo for stronger rewards and a priority salvage encounter.
6. Defeat the three-phase Scrap Warden at Depth 5 and choose a permanent Warden Schematic.
7. Survive extraction to bank scrap, blueprints, the schematic, and a Warden Core. Dying loses everything carried on that expedition.

## Field modules

- Burst Capacitor: adds projectiles to each volley
- Magnetic Core: increases pickup range
- Reactive Plating: blocks incoming hits
- Overdrive Coil: increases movement and fire rate
- Volatile Reactor: increases damage at the cost of maximum health

Rare modules provide double power. The workshop gains new visual machinery as permanent upgrades and blueprints accumulate.

## Build synergies

Two compatible field modules activate a named build during an expedition:

- Shrapnel Array: every third Burst Capacitor and Volatile Reactor volley explodes
- Flux Drive: Magnetic Core and Overdrive Coil improve dash recharge
- Kinetic Guard: Reactive Plating and Overdrive Coil turn dashes into ramming attacks
- Counter Battery: Reactive Plating blocks answer with a defensive Burst Capacitor volley
- Singularity Reactor: Magnetic Core and Volatile Reactor increase recovered scrap

Compatible cache choices are marked before installation, and the active build remains visible in the expedition HUD.

## Blueprint workshop

- Extracted modules become permanent blueprints.
- Duplicate recoveries increase blueprint mastery at 1, 3, and 7 copies.
- Scrap can tune an unlocked blueprint twice.
- One blueprint can be equipped as the starter module for future expeditions.
- Starter modules occupy one cargo slot and cannot be recovered again for free.

## Warden Schematics

Boss salvage no longer occupies a field-module slot at the end of a run. Each Warden victory offers permanent technology for future expeditions:

- Aegis Lattice: adds a starting shield charge, up to three
- Phase Bearings: reduces dash recharge by 6% per rank
- Reclaimer Matrix: raises recovered scrap value by 5% per rank

Schematics only become permanent after a successful extraction. Once every schematic is mastered, Warden data converts into a secured Core Dividend.

## Release features

- A paced five-minute Warden route with an early one-minute extraction option
- Permanent Warden Schematic choices that shape future expeditions
- Escalating zone pressure, priority salvage encounters, and field repairs between floors
- Five visually distinct tower zones with their own enemy mix and environmental hazards
- Scrap Hounds, Rivet Sentries, Steam Vents, Arc Lancers, elites, and a multi-phase Warden
- Generated adaptive ambience, layered combat audio, recoil, telegraphs, and impact feedback
- A long-term recovery contract requiring three Warden Cores and twelve recovered blueprints
- First-run visual briefing
- Pause and persistent sound, screen shake, and particle settings
- Career records and expedition reports
- Versioned migration for existing local saves
- Keyboard, pointer, multitouch, and iPhone safe-area support
- Entity limits and delta-time simulation for consistent mobile performance

## Playtest build

Version 0.5 keeps all balance data on the device. Expedition reports show run time, kills, damage taken, risks accepted, and secured Warden technology. The blueprint bench tracks extraction rate, average run length, Warden victories, schematic ranks, and how often each module is installed. The latest twelve run summaries are retained in the local save for tuning and are never uploaded.

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
npm test
```

The release tests cover static DOM and CSS integrity, JavaScript syntax, a fresh rig's safe extraction, a mid-level Warden run, save migration, the blueprint bench, first-run briefing, module choices, all five zones, both risk milestones, all Warden phases, permanent schematic rewards, extraction, the recovery contract, career progression, and persistent settings.

Built with plain HTML, CSS, JavaScript, and Canvas.
