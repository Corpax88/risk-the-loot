# RISK THE LOOT! v0.12.0

A framework-free HTML5 extraction roguelite starring Pappa Hammer. Enter the adventure tower, find equipment, and decide when the gear in your bag is too valuable to risk.

## The Loadout loop

1. Equip Pappa Hammer in the guild workshop.
2. Choose one recovered Lucky Relic and begin an expedition.
3. Move and dodge while Pappa attacks automatically.
4. Recover physical gear from enemies and treasure chests.
5. At floor milestones, extract safely or push deeper for better rarity odds and value.
6. Survive extraction to secure every carried item. Dying loses the expedition bag.
7. Equip upgrades in the Gear Locker or sell spare copies for coins.
8. Return stronger and challenge either tower path and its three-phase champion.

There are no direct damage, health, or pickup-range purchases for new saves. Character progression now comes from equipment the player actually risks in the field.

## Equipment

The catalog has exactly 40 equippable items:

- 20 Common
- 10 Rare
- 5 Epic
- 3 Mythic
- 2 Legendary

Pappa has five equipment slots: Hat, Scarf, Coat, Hammer, and Boots. Gear can change health, hammer damage, pickup reach, movement speed, strike rate, armor, loot value, dash recharge, and critical chance.

Every catalog item has its own silhouette, color treatment, emblem, and field pickup appearance. Equipped gear changes Pappa Hammer's silhouette and colors in combat. Empty slots automatically equip the strongest matching item after the first successful recovery.

The Gear Locker has a live Pappa Hammer preview, five dedicated worn slots, combined equipment stats, slot filters, and rarity filters. `Sell Filtered` sells every matching unequipped copy after confirmation. The copy currently worn by Pappa is always reserved and can never be sold, even when selling an entire rarity.

Pappa Hammer now uses dedicated eight-frame idle, run, and attack animation sheets. The Gear Locker preview keeps breathing and shifting while equipped item layers remain visible, so loadout changes can be judged on a living character rather than a still portrait.

Legendary equipment creates a distinct HUD state and extraction signal. The intended reaction is simple: when one drops, leaving alive should suddenly matter more than finishing the floor.

Existing v0.9 saves migrate automatically. Previously collected loot becomes owned gear, the best recovered item in every slot is equipped, and old workshop upgrade levels remain as hidden legacy bonuses so progression is not erased.

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

The automated release suite covers DOM/CSS integrity, JavaScript syntax, all rarity counts, five gear slots, old-save migration, real gear stats, the Gear Locker, relic fusion, safe extraction, both full boss paths, permanent trophies, career progression, settings, and developer tools.

Built with plain HTML, CSS, JavaScript, Canvas, and PNG assets.
