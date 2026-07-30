# Mobile Performance Audit

## Scope

This audit profiles real gameplay paths in Chromium with an iPhone-sized
390x844 viewport at device pixel ratio 3. The headless environment uses
software rendering, so absolute frame rates are intentionally pessimistic.
The same environment was used before and after the changes, making the
relative results useful.

Scenarios covered:

- 64-enemy default Hammerstorm pack
- 64-enemy Black Hole pack
- 64-enemy Stormcaller chain
- Skyglass Leviathan boss
- Stormcaller Armory

## Largest Baseline Bottlenecks

1. Full-resolution canvas rendering and repeated atlas draws dominated the
   dense horde scenarios.
2. Every visual effect could grow independently, creating overdraw and
   allocation pressure during rapid Stormcaller chains.
3. Terrain gradients and the screen vignette were recreated every frame.
4. Off-screen particles, effects, hazards and enemies were still submitted
   for drawing.
5. Static gear/set calculations were repeated inside dynamic combat stat
   calculations and HUD updates.
6. HUD and minimap DOM/canvas work ran at display rate even when their
   information did not need a 60 Hz refresh.
7. Enemy projectiles and temporary effects produced short-lived objects and
   filter arrays.
8. Paused gameplay and overlays continued requesting full-rate presentation.

## Rendering Budget

| Budget | High | Medium | Low |
| --- | ---: | ---: | ---: |
| Device pixel ratio cap | 2.0 | 1.5 | 1.15 |
| Particles | 420 | 220 | 120 |
| Temporary effects | 170 | 112 | 70 |
| Lightning effects | 72 | 44 | 26 |
| Floating combat text | 30 | 20 | 12 |
| Minimap refresh | 20 Hz | 12 Hz | 8 Hz |
| HUD refresh | 30 Hz | 20 Hz | 15 Hz |
| Paused presentation | 12 Hz | 8 Hz | 5 Hz |
| Particle density | 100% | 68% | 40% |
| Glow/shadow intensity | 100% | 62% | disabled |
| Screen shake intensity | 100% | 82% | 62% |

Gameplay entities are not hidden to meet a visual budget. Enemies, hazards,
loot and combat telegraphs remain readable at every quality level.

## Implemented Optimizations

- Added fixed High, Medium and Low quality profiles plus an Auto setting.
- Auto quality steps down only after 2.4 seconds of sustained slow frames and
  steps up only after 12 seconds of recovery, with switch cooldowns to avoid
  oscillation.
- Pooled particles, lightning effects, general temporary effects and enemy
  projectiles.
- Added priority replacement so critical feedback survives when a visual
  budget is full.
- Culled off-screen hazards, enemies, effects and particles from rendering.
- Stopped advancing off-screen particle motion while preserving lifetime.
- Cached screen gradients and static gear/set calculations.
- Throttled HUD, minimap and paused-overlay presentation independently.
- Reduced low-quality terrain ornamentation while preserving collision,
  route readability and map identity.
- Scaled expensive glow and shadow work by quality.
- Preserved the original visual random-number consumption so changing visual
  quality cannot alter combat outcomes, loot or deterministic simulations.

## Profile Comparison

Average frame interval in the software-rendered iPhone stress environment:

| Scenario | Baseline | Optimized | Improvement |
| --- | ---: | ---: | ---: |
| Dense default | about 276 ms | about 167 ms | about 39% |
| Dense Black Hole | about 264 ms | about 187 ms | about 29% |
| Dense Stormcaller | about 145 ms | about 40 ms | about 72% |
| Leviathan boss | about 78 ms | about 24 ms | about 69% |
| Stormcaller Armory | about 63 ms | about 22 ms | about 65% |

These are stress-test comparisons, not claims about physical iPhone frame
rates. Hardware validation remains valuable for thermal throttling and Safari
GPU behavior.

## Validation

- Static DOM/CSS/JavaScript audit
- 5,000 deterministic biome seeds
- Five full deterministic release/balance simulations
- Playwright desktop and iPhone quality-budget tests
- Black Hole, Stormcaller, Hammerstorm, Dash and boss scenarios
- Armory mobile performance and incremental equipment rendering
- Loot reveal and salvage flow
- Settings persistence and adaptive-quality hysteresis
