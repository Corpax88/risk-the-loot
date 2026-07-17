# RISK THE LOOT! v0.19.0

A framework-free HTML5 extraction roguelite starring Pappa Hammer. Enter the adventure tower, find equipment, and decide when the gear in your bag is too valuable to risk.

## The Loadout loop

1. Equip Pappa Hammer in the guild workshop.
2. Choose one recovered Lucky Relic and begin an expedition.
3. Move and dodge while Pappa attacks automatically.
4. Defeat enemies for coins and challenge a floor champion for equipment.
5. At floor milestones, extract safely or push deeper for stronger boss rewards.
6. Survive extraction to secure every carried item. Dying loses the expedition bag.
7. Equip upgrades in the Gear Locker or sell spare copies for coins.
8. Return stronger and challenge either tower path and its three-phase champion.

There are no direct damage, health, or pickup-range purchases for new saves. Character progression now comes from equipment the player actually risks in the field.

## Pappa levels and equipment

Pappa Hammer earns boss XP and levels up whenever a champion falls. Every level adds a little base health and damage, but the champions also gain health and damage. Higher levels open stronger equipment pools:

- Rare set gear can drop immediately.
- Epic set gear begins at Pappa level 4.
- Mythic set gear begins at Pappa level 8.
- Legendary set gear begins at Pappa level 16.

The boss catalog contains exactly 100 set items: 20 named sets with a Hat, Scarf, Coat, Hammer, and Boots in each set. Five sets are Rare, five are Epic, six are Mythic, and four are Legendary. Ordinary enemies only drop coins; equipment is reserved for boss victories.

Every recovered piece is a unique item instance with its own item level, quality roll, randomized stats, and sale value. Finding the same named piece again can therefore still produce a meaningful upgrade. Gear can change health, hammer damage, pickup reach, movement speed, strike rate, armor, loot value, dash recharge, and critical chance.

Each set has fixed 2-piece, 3-piece, and 5-piece bonuses designed around its rarity and theme. The individual piece rolls vary, while the set milestones always remain predictable.

Equipment uses a fixed anime gear atlas for readable slot silhouettes, while set colors, marks, names, and paper-doll treatments distinguish the 100 boss pieces. Locker cards, equipped slots, recovery reports, pickup notices, and boss drops keep the same item identity. Empty slots automatically equip the strongest matching item after the first successful recovery.

All 20 Legendary set pieces now use dedicated hand-authored sprite art instead of shared silhouettes. Riskreaver, Grand Vault, Crownless King, and Fatebound each have a complete Crown, Oathwrap, Longcoat, Great Hammer, and Striders family with a distinct set identity. The same transparent art appears in the Adventure Bag, equipped slots, item comparison, world drops, pickup reveal, and post-run report. A deterministic atlas builder keeps the full-size and mobile drop sheets aligned.

The Adventure Bag now separates loot management from the character loadout. The **Bag** view uses a dedicated illustrated anime field bag with readable category filters, a compact item grid, rarity totals, sorting, protected bulk selling, and a focused comparison panel. The **Pappa** view gives the live character preview room to breathe with a draggable 360-degree turntable, Pappa level and boss XP, five dedicated worn slots, active set milestones, and combined equipment stats. Selecting a worn slot returns directly to the matching bag category. `Sell Filtered` sells every matching unequipped item after confirmation. Gear currently worn by Pappa is always reserved and can never be sold.

Pappa Hammer uses dedicated eight-frame idle, run, and attack animation sheets. Every equipped slot now recolors and details the correct moving part through 15 frame-matched paper-doll masks, so hats, scarves, coats, hammers, and boots remain attached throughout all three animations. The same composed loadout appears in the living Gear Locker preview and during expeditions.

The composed hero keeps the original 512px frame resolution for crisp Retina rendering. Equipment colors are applied as material accents rather than a heavy full-body tint, while Epic, Mythic, and Legendary loadouts add increasingly distinct patterns, trim, inventory presentation, and restrained in-game auras. The runtime masks remain memory-optimized for iPhone Safari.

The post-run report groups equipment by rarity and shows each piece's level, slot, set, stat roll, quality, and value. Legendary equipment creates a distinct HUD state and extraction signal. The intended reaction is simple: when one drops, leaving alive should suddenly matter more than finishing the floor.

Existing saves migrate automatically. Old stacked inventory copies become separate protected gear instances, equipped pieces remain equipped, and old workshop upgrade levels remain as hidden legacy bonuses so progression is not erased.

## Lucky Relics

Gear is permanent loadout progression. Lucky Relics still shape the temporary build inside each expedition:

- Hammer Echo adds another hammer wave to each strike.
- Lucky Satchel increases pickup range.
- Guard Charm blocks incoming hits.
- Battle Rhythm increases movement and attack rate.
- Reckless Swing increases damage at the cost of maximum health.

Matching relics fuse in the same cargo slot up to Power 4. A common relic adds one power and a rare relic adds two. Recovered copies improve the Lucky Relic selected for later expeditions.

## Adventure paths

- Crimson Path offers 16% more sale value and ends with the Crimson Champion.
- Moonlit Path improves high-grade gear odds and ends with the Vault Warden.

Both bosses have distinct movement, projectiles, hazards, phases, and permanent Boss Trophy rewards.

## Controls

- Move: `WASD`, arrow keys, or the mobile joystick
- Dash: `Space` or the on-screen dash button
- Extract: `E` or the on-screen extract button
- Pause/settings: `Escape` or the top-right settings button
- Combat: automatic targeting and ranged melee hammer arcs

## Run locally

```powershell
python -m http.server 4175 --bind 0.0.0.0
```

Open `http://127.0.0.1:4175` on the computer, or use the computer's local IP address on a phone connected to the same network.

## Verify

```powershell
npm test
```

The automated release suite covers DOM/CSS integrity, JavaScript syntax, all 20 sets and 100 set pieces, five gear slots, unique-item migration, RNG item rolls, fixed set bonuses, boss-only equipment, Pappa levels, the rotating Gear Locker, relic fusion, safe extraction, both full boss paths, permanent trophies, career progression, settings, and developer tools.

Built with plain HTML, CSS, JavaScript, Canvas, and PNG assets.

The paper-doll masks can be rebuilt after editing the Pappa Hammer source sheets with `python tools/build-paper-doll-masks.py`.

The Legendary inventory and drop atlases can be rebuilt from the transparent source strips in `tmp/legendary` with `python tools/build-legendary-gear-atlas.py`.
