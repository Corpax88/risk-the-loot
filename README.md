# RISK THE LOOT! v0.8.0

A framework-free HTML5 extraction roguelite about pushing deeper, building a field loadout, and deciding when to escape.

## Core loop

1. Upgrade Pappa Hammer in the workshop.
2. Start an expedition.
3. Move, dodge, and collect physical loot items while Pappa Hammer strikes automatically.
4. Open relic caches, combine matching powers, and shape a run with up to three distinct relics.
5. At depth milestones, extract or risk the cargo for stronger rewards and a priority salvage encounter.
6. At Depth 3, choose the valuable Furnace Route or the high-grade-loot Dynamo Route.
7. Defeat that route's three-phase boss and choose its permanent Boss Schematic.
8. Survive extraction to bank scrap, blueprints, the schematic, and a Boss Core. Dying loses everything carried on that expedition.

## Relics and fusion

- Burst Capacitor: adds projectiles to each volley
- Magnetic Core: increases pickup range
- Reactive Plating: blocks incoming hits
- Overdrive Coil: increases movement and fire rate
- Volatile Reactor: increases damage at the cost of maximum health

Matching relics fuse in the same cargo slot up to Power 4. A common relic adds one power and a rare relic adds two, so duplicate finds improve the current build instead of forcing a replacement. Extracted relics still become permanent blueprints.

## Physical loot

- Enemies drop visible items instead of anonymous blue scrap.
- The catalog contains exactly 40 items: 20 common, 10 rare, 5 epic, 3 mythic, and 2 legendary.
- Every item has its own sale value, silhouette, rarity color, and collection record.
- Legendary loot strongly marks the HUD and extraction control. It is intentionally valuable enough to make leaving immediately a serious choice.
- Dying loses every item carried during that expedition; successful extraction sells them into workshop scrap.

## Build synergies

Two compatible relics activate a named build during an expedition:

- Shrapnel Array: every third Burst Capacitor and Volatile Reactor volley explodes
- Flux Drive: Magnetic Core and Overdrive Coil improve dash recharge
- Kinetic Guard: Reactive Plating and Overdrive Coil turn dashes into ramming attacks
- Counter Battery: Reactive Plating blocks answer with a defensive Burst Capacitor volley
- Singularity Reactor: Magnetic Core and Volatile Reactor increase recovered loot value

Compatible cache choices are marked before installation, and the active build remains visible in the expedition HUD.

## Blueprint workshop

- Extracted relics become permanent blueprints.
- Duplicate recoveries increase starter output at 1, 3, and 7 recovered copies: MK I 100%, MK II 115%, and MK III 130%.
- Scrap can calibrate an unlocked blueprint twice for another 10% starter output each time.
- The Blueprint Bench shows the exact current and next effect. Fractional Burst output creates guaranteed echo shots over time, while fractional Plating output grants armor.
- One blueprint can be equipped as the starter relic for future expeditions.
- Starter relics occupy one cargo slot and can still fuse with matching finds.

## Branching expeditions

- Furnace Route: close-range pressure, steam and fire hazards, 16% more loot value, and the Furnace Tyrant.
- Dynamo Route: ranged pressure, arc hazards, 8% better high-grade loot odds, and the Scrap Warden.
- Both routes preserve the same extraction decision and roughly five-minute full-run target.

## Boss Schematics

Boss salvage does not occupy a field-module slot. Each victory offers permanent technology tied to that route:

- Aegis Lattice: adds a starting shield charge, up to three
- Phase Bearings: reduces dash recharge by 6% per rank
- Reclaimer Matrix: raises recovered loot value by 5% per rank
- Impact Temper: charges hammer waves after a dash, then upgrades their damage and adds a second charge

Schematics only become permanent after a successful extraction. Once a boss's schematics are mastered, its data converts into a secured Core Dividend.

## Release features

- Two paced five-minute routes with an early one-minute extraction option
- A meaningful mid-run route choice with different pressure, item odds, loot value, boss, and permanent technology
- Forty physical loot items with five rarity tiers and extraction-driven value
- Relic fusion that lets matching powers grow without consuming another cargo slot
- Permanent Boss Schematic choices that shape future expeditions
- Escalating zone pressure, priority salvage encounters, and field repairs between floors
- Seven route-aware tower zones with their own enemy mix and environmental hazards
- Scrap Hounds, Rivet Sentries, Steam Vents, Arc Lancers, elites, and two multi-phase bosses
- Generated adaptive ambience, layered combat audio, recoil, telegraphs, and impact feedback
- A long-term recovery contract requiring three Boss Cores and twelve recovered blueprints
- First-run visual briefing
- Pause and persistent sound, screen shake, and particle settings
- Career records and expedition reports
- Collapsible playtest tools in Settings for scrap, Pappa Hammer stats, relic cache, legendary loot, repair, both bosses, schematics, and save testing
- Versioned migration for existing local saves
- Keyboard, pointer, multitouch, and iPhone safe-area support
- Entity limits and delta-time simulation for consistent mobile performance

## Playtest build

Version 0.7 keeps all balance data on the device. Expedition reports show the recovered item manifest, route, run time, kills, damage taken, risks accepted, and secured boss technology. The blueprint bench tracks extraction rate, average run length, boss victories, schematic ranks, and how often each relic is installed or fused. The latest twelve run summaries are retained in the local save for tuning and are never uploaded.

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

The release tests cover static DOM and CSS integrity, JavaScript syntax, all 40 item definitions, relic fusion and its power cap, Pappa Hammer's safe extraction, both full expedition routes, save migration, the blueprint bench, first-run briefing, route and relic choices, all route zones, both risk milestones, every boss phase, permanent schematic rewards, extraction, the recovery contract, career progression, and persistent settings.

Built with plain HTML, CSS, JavaScript, and Canvas.
