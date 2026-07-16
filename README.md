# RISK THE LOOT! v0.9.0

A framework-free HTML5 extraction roguelite starring Pappa Hammer. Push higher through a dangerous adventure tower, assemble a three-relic build, and decide when the treasure in your bag is too valuable to risk.

## Visual direction

Version 0.9 moves the entire game into Pappa Hammer's clean anime-adventure world:

- A navy, ivory, crimson, and gold palette shared by characters, environments, combat, and UI
- A warm illustrated guild workshop instead of a futuristic machine bay
- Dedicated readable art for Pappa Hammer, four enemy roles, and both champions
- Physical treasure chests, coins, maps, crowns, charms, and hammer-shaped attacks
- Restrained effects that keep silhouettes and incoming attacks clear on mobile

## Core loop

1. Improve Pappa Hammer in the guild workshop.
2. Equip one recovered Lucky Relic and start an expedition.
3. Move, dodge, and gather physical loot while Pappa Hammer attacks automatically.
4. Open treasure chests, fuse matching relic powers, and shape a three-relic build.
5. At floor milestones, extract safely or risk the loot for stronger rewards.
6. Choose the lucrative Crimson Path or the rare-loot Moonlit Path.
7. Defeat the path's three-phase champion and choose a permanent Boss Trophy.
8. Survive extraction to bank coins, relic progress, a trophy, and a Boss Seal. Defeat means losing everything carried on that expedition.

## Relics and fusion

- Hammer Echo adds another hammer wave to each strike.
- Lucky Satchel increases pickup range.
- Guard Charm blocks incoming hits.
- Battle Rhythm increases movement and attack rate.
- Reckless Swing increases damage at the cost of maximum health.

Matching relics fuse in the same cargo slot up to Power 4. A common relic adds one power and a rare relic adds two. Recovered relic copies permanently improve the Lucky Relic selected for future expeditions.

## Physical loot

- Enemies drop visible items rather than anonymous currency fragments.
- The catalog contains 40 items: 20 common, 10 rare, 5 epic, 3 mythic, and 2 legendary.
- Every item has its own value, silhouette, rarity color, and collection record.
- Legendary loot strongly marks the HUD and extraction control, creating the central "risk it or leave" decision.

## Build synergies

- Grand Slam: Hammer Echo and Reckless Swing make every third strike explode.
- Treasure Sprint: Lucky Satchel and Battle Rhythm improve dash recharge.
- Shoulder Charge: Guard Charm and Battle Rhythm turn dashes into ramming attacks.
- Counterstrike: blocking a hit releases a defensive hammer wave.
- Golden Instinct: Lucky Satchel and Reckless Swing increase recovered loot value.

## Adventure paths

- Crimson Path: shield guards, close-range pressure, banner hazards, 16% more loot value, and the Crimson Champion.
- Moonlit Path: crossbow scouts, lancers, moon-seal hazards, 8% better high-grade loot odds, and the Vault Warden.

Both paths preserve the same extraction decisions and approximately five-minute full-run target. This visual overhaul does not alter combat balance, timings, costs, drop rates, or progression values.

## Permanent trophies

- Guardian Crest adds a starting guard charge.
- Traveler's Boots reduce dash recharge.
- Merchant's Favor raises recovered loot value.
- Champion's Lesson charges explosive hammer waves after a dash.

Boss Trophies only become permanent after a successful extraction. Once every trophy from a champion is mastered, later victories grant a guaranteed Merchant Gift instead.

## Controls

- Move: `WASD`, arrow keys, or the mobile joystick
- Dash: `Space` or the on-screen dash button
- Extract: `E` or the on-screen extract button
- Pause/settings: `Escape` or the gear button
- Combat: automatic targeting and hammer strikes

## Run locally

```powershell
python -m http.server 4175 --bind 0.0.0.0
```

Open `http://127.0.0.1:4175` on the computer, or use the computer's local IP address on a phone connected to the same network.

## Verify the release loop

```powershell
npm test
```

The release tests cover DOM and CSS integrity, JavaScript syntax, all 40 loot items, relic fusion, both complete paths, every boss phase, save migration, permanent trophies, safe and boss extraction, career progression, settings, and developer tools.

Built with plain HTML, CSS, JavaScript, Canvas, and PNG assets.
