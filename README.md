# RISK THE LOOT! v0.51.1

A framework-free HTML5 extraction roguelite starring Pappa Hammer. Enter the adventure tower, find equipment, and decide when the gear in your bag is too valuable to risk.

Anime Rush sharpens every part of expedition pacing independently. Enemies arrive aggressively, move with role-specific speed, recover faster, and overlap into the next horde before the arena goes quiet. Pappa moves and animates faster, hammer impacts release sooner, hit reactions are shorter and brighter, and champion loot transitions resolve quickly without losing rarity readability. Regular enemy health is slightly lower to offset the increased pressure.

Procedural Frontier prototypes deterministic modular terrain in Guild Outskirts. Each expedition assembles a connected route from handcrafted entrance, courtyard, crossroads, passage, open-combat and boss modules; Pappa enters at the western edge, hordes use validated module spawn zones and the champion waits at the far end. The minimap exposes the reproducible seed but keeps the boss route hidden until the encounter actually begins, while every other biome and the original fixed arena remain untouched as a fallback.

The v0.50.0 Black Hole Legendary pass gives the Constellation set a fully separate combat presentation: dedicated spawn, idle, pull, pulse, dash, collapse and singularity-burst sheets, a mobile gravity particle system and a living vortex that stays attached to Pappa Hammer. The standard gold Hammerstorm remains exclusive to non-Black-Hole builds. The Adventure Bag header was also removed so the character preview gets the visual focus.

The v0.49.1 Vortex Dash pass lets Pappa Hammer Dash seamlessly while Hammerstorm remains active. Its pull field now stays centered on him throughout the movement, keeps packs gathered around a readable inner radius, and the five-second Hammerstorm introduction is shown only once per save.

The v0.49.0 Black Hole pass adds a production-ready cosmic legendary set for Pappa Hammer. It includes dedicated idle, run and attack sheets, a massive singularity hammer, matching inventory and ground-loot art, and gravity-well impact effects built through the same full-body pipeline as Hammer Choir.

The v0.48.1 balance pass keeps the faster pacing intact while reducing regular raider damage by 18%. Champion damage, movement, attack cadence, wave overlap and horde size are unchanged.

Horde Engine rebuilds regular combat around overlapping packs of 30-60 raiders. New packs arrive before the old one is completely gone, naturally collecting around Pappa while spatial separation keeps the crowd readable. Regular enemies deal individually lighter damage than the old trickle encounters, but being surrounded remains the central threat. Special encounters and extraction now call in compact hordes instead of isolated targets, keeping combat moving toward the next dangerous dive.

Melee Awakening makes courage the combat engine. Pappa only performs automatic hammer impacts at close range, and every outward-reaching player attack is now a physical consequence of a hammer strike: ground fractures, pressure waves, debris, and knockback. Traditional player projectiles and safe ranged damage are gone.

Hammerstorm is always available. Hold the on-screen button, `Q`, or `F` to dive into the densest nearby pack and keep spinning; release to stop and reposition. Nearby enemies increase spin damage and reach, while large packs trigger periodic outer pressure waves. The dive grants only a brief landing window, so sustained spinning remains dangerous instead of becoming permanent invulnerability.

Riskreaver remains the dedicated surrounded build. Two pieces improve movement, four pieces awaken damage scaling from nearby enemies, and the complete five-piece set increases that scaling and heals only from unique enemies struck by Hammerstorm. Healing is capped at 12% of maximum health per activation, so aggressive pack dives can recover a mistake without making Pappa immortal.

Gear Wardrobe replaces the old diagonal paper-doll stripes across every current item. All 20 sets now use authored material, trim, silhouette and emblem profiles across idle, run and attack animations, while all 40 legacy items share the same clean layered renderer. Hammer Choir keeps its bespoke production sprite sheets. Riskreaver, Grand Vault, Crownless King and Fatebound use separate legendary palettes, motifs and animated complete-set presentation so top-tier equipment reads immediately on Pappa Hammer.

Raider Tactics gives regular enemies distinct combat jobs. Rushers weave into range before a short pounce, Gunners alternate precise shots with late-floor fan volleys, Lancers threaten a long narrow thrust, and Shield Guards lock a broad charge lane that reaches past Pappa Hammer instead of stopping short. Dashes crash into physical cover, successful attacks enter visible recovery windows, and authored telegraphs keep every threat readable on mobile and desktop.

Champion Rituals gives every boss a more readable three-act fight. Phase changes now clear old projectiles and briefly stagger the champion, creating a deliberate breath before the next pattern. Vault Warden seals parts of the arena and closes a visible lock corridor, Crimson Champion telegraphs sweeping cleaves between its projectile salvos, and Skyglass Leviathan crosses the lagoon with tidal lanes alongside its undertow pools. Physical cover blocks the new lane attacks, preserving the arena's positional strategy.

Gear 2.0 gives all 20 hero sets a playstyle-defining signature. Existing ranged-facing labels are presented as melee reinforcement: Impact Speed, Hammer Echoes, ground-breaking impacts, dash slams, critical chains, and physical shockwaves. Most signatures awaken at three matching pieces and master at five; Riskreaver uses a deliberate 2/4/5 progression for its surrounded build.

This project is in active playtest development. Better gameplay and cleaner systems take priority over preserving old save formats; save resets are acceptable when a feature needs a better data model.

Pappa's original painted hammer animation remains the active version. Champion's Mark replaces the obsolete pickup-magnet relic with a boss-focused reward that supports the equipment loop.

The Grand Vault is now a repeatable long-term reward. Every cycle charges from three newly secured Boss Seals and twelve newly recovered relic copies. Its workshop tracker warms up near completion, becomes interactive when full, and opens with a dedicated reveal ceremony. Each opening guarantees level-appropriate set gear, can contain a bonus item, deposits rewards directly into the Adventure Bag, and then begins the next vault cycle without removing permanent progression.

Champion Loot Orbs make boss rewards physical. A defeated champion is erased by an anime-style pillar of light and screen flash; as it fades, a rarity-colored shell materializes, floats above the arena and waits to be tapped. The orb fractures into luminous pieces before the loot reveal begins. The reveal supports touch selection, larger mobile text, and a direct comparison against the item currently equipped in that slot.

Hold for Info gives the full interface one consistent help language. Hover or keyboard focus reveals contextual details on desktop; a deliberate hold does the same on mobile without firing click-based controls. Resources, loadout stats, progression, route choices, results, settings and every action use authored explanations instead of generic browser labels. Equipment uses a richer rarity, stat and current-loadout comparison preview.

The Adventure Atlas turns Pappa Level into visible world progression. Guild Frontier is available immediately; Ashen Foundry, Moonfall Gardens, Skyglass Lagoon and Crown Summit unlock at levels 4, 8, 12 and 16. Every destination has its own five-zone visual identity, enemy mix, combat scaling, coin value and boss-gear luck profile.

Skyglass Lagoon now ends with the animated Skyglass Leviathan. Its three bespoke phases combine readable crystal fans, rotating tide shards and clearly telegraphed undertow pools.

The expedition view now has a compact world minimap with Pappa's facing, the visible camera area, solid cover, active champion and pulsing rare-cache markers. A low-profile ARPG-style experience rail tracks real boss XP and celebrates Pappa level-ups without covering combat.

Dreamworld Expedition gives Moonfall Gardens a complete illustrated environment identity. A seamless indigo arena floor, moonlit ruins, dream trees, lanterns, shrines, crystal growths and physical cover now replace its generic procedural scenery. Assets use bottom-center world anchors, camera culling, restrained glow and front-layer occlusion so Pappa can move behind tall ruins while all existing collision and line-of-sight rules remain intact.

Skyglass Lagoon opens at Pappa Level 12 as the bridge between Moonfall Gardens and Crown Summit. Its seamless star-water floor, floating reef landmarks, jellyfish lanterns, coral gardens, pearl shrines and glass cover establish a brighter celestial-lagoon identity without changing combat rules. Large landmarks remain near the world perimeter, mobile rendering is camera-culled, and every illustrated wall continues to use the existing obstacle rectangle for collision and line of sight.

The expedition HUD now uses one compact status row on mobile and desktop. Health, floor, risk, cargo and boss phases remain visible without taking a second gameplay row, while the workshop header shrinks during expeditions. Every button and important status indicator has contextual help: hover or keyboard focus shows it on desktop, and holding reveals the same explanation on mobile without accidentally firing the control.

Enemy Awakening gives each raider a readable movement personality, keeps ranged attacks inside the visible combat area, and turns the Shield Guard's charge into a locked crimson danger lane instead of an ambiguous ring. Enemy animation accents are deterministic, so added life and polish do not disturb encounter or loot randomness.

Cover & Spoils opens the combat camera and adds solid guild barricades throughout each destination. Pappa, enemies, dashes, and projectiles all collide with them, while line-of-sight targeting lets either side use cover tactically. The old pre-boss Risk It interruption is gone; danger now rises automatically with the tower floors. Destination cards show exact Epic-or-better odds and extra-drop chances, and boss gear erupts from the champion's fall position into a high-contrast rarity reveal before the extraction decision.

## The Loadout loop

1. Equip Pappa Hammer in the guild workshop.
2. Choose one recovered Lucky Relic and begin an expedition.
3. Move and dodge while Pappa attacks automatically.
4. Defeat enemies for coins and challenge a floor champion for equipment.
5. Watch the champion's equipment drop into the unsecured expedition bag, then choose **Extract Now** or **Go Deeper**.
6. Going deeper starts a faster, harder ascent with stronger gear rolls, more drops, and every previous reward still at risk.
7. Survive the final extraction ambush to secure carried gear, trophies, and Boss Seals. Dying loses the entire expedition haul.
8. Equip upgrades in the Gear Locker or sell spare copies for coins.
9. Return stronger and challenge either tower path and its three-phase champion.

There are no direct damage, health, or pickup-range purchases for new saves. Character progression now comes from equipment the player actually risks in the field.

Every item now has its own inventory and field-drop asset. Mouse hover and keyboard focus reveal a compact comparison card with the exact item art, rarity, level, rolled stats, power and sale value; holding on touch devices opens the same comparison without equipping, selling or selecting the item.

## Pappa levels and equipment

Pappa Hammer earns boss XP and levels up whenever a champion falls. Every level adds a little base health and damage, but the champions also gain health and damage. Higher levels open stronger equipment pools:

- Rare set gear can drop immediately.
- Epic set gear begins at Pappa level 4.
- Mythic set gear begins at Pappa level 8.
- Legendary set gear begins at Pappa level 16.

The boss catalog contains exactly 100 set items: 20 named sets with a Hat, Scarf, Coat, Hammer, and Boots in each set. Five sets are Rare, five are Epic, six are Mythic, and four are Legendary. Ordinary enemies only drop coins; equipment is reserved for boss victories.

Every recovered piece is a unique item instance with its own item level, quality roll, randomized stats, and sale value. Finding the same named piece again can therefore still produce a meaningful upgrade. Gear can change health, hammer damage, pickup reach, movement speed, strike rate, armor, loot value, dash recharge, and critical chance.

Set milestones are fixed and predictable while individual piece rolls vary. Most sets use 2-piece, 3-piece, and 5-piece bonuses; Riskreaver uses 2-piece, 4-piece, and 5-piece milestones to reserve its aggressive sustain for a committed build.

Equipment uses a fixed anime gear atlas for readable slot silhouettes, while set colors, marks, names, and paper-doll treatments distinguish the 100 boss pieces. Locker cards, equipped slots, recovery reports, pickup notices, and boss drops keep the same item identity. Empty slots automatically equip the strongest matching item after the first successful recovery.

All 20 Legendary set pieces now use dedicated hand-authored sprite art instead of shared silhouettes. Riskreaver, Grand Vault, Crownless King, and Fatebound each have a complete Crown, Oathwrap, Longcoat, Great Hammer, and Striders family with a distinct set identity. The same transparent art appears in the Adventure Bag, equipped slots, item comparison, world drops, pickup reveal, and post-run report. A deterministic atlas builder keeps the full-size and mobile drop sheets aligned.

The Adventure Bag now separates loot management from the character loadout. The **Bag** view uses a dedicated illustrated anime field bag with readable category filters, a compact item grid, rarity totals, sorting, protected bulk selling, and a focused comparison panel. The **Pappa** view gives the live character preview room to breathe with a draggable 360-degree turntable, Pappa level and boss XP, five dedicated worn slots, active set milestones, and combined equipment stats. Selecting a worn slot returns directly to the matching bag category. `Sell Filtered` sells every matching unequipped item after confirmation. Gear currently worn by Pappa is always reserved and can never be sold.

Pappa Hammer uses dedicated eight-frame idle, run, and attack animation sheets. Every equipped slot recolors and details the correct moving part through 15 frame-matched paper-doll masks, so hats, scarves, coats, hammers, and boots remain attached throughout all three animations. The complete five-piece Hammer Choir set now upgrades into three dedicated production spritesheets with a genuinely new violet longcoat, shoulder armor, hat, scarf, reinforced boots, musical insignia, and square great hammer. The same animated full-set identity appears in the living Gear Locker preview and during expeditions.

The composed hero keeps the original 512px frame resolution for crisp Retina rendering. Equipment colors are applied as material accents rather than a heavy full-body tint, while Epic, Mythic, and Legendary loadouts add increasingly distinct patterns, trim, inventory presentation, and restrained in-game auras. The runtime masks remain memory-optimized for iPhone Safari.

Boss victories now use a staged loot ritual instead of immediately ending the expedition. Each recovered piece is shown with its real art, rarity, stats, sale value, and current unsecured haul before the player makes the central decision: bank it or risk it. Legendary equipment creates a distinct reveal and HUD state so finding one changes the emotional temperature of the run immediately.

Choosing **Go Deeper** preserves the complete unsecured bag and starts another five-floor ascent with increased risk, stronger gear levels, improved rarity odds, and additional boss drops. Multiple champion victories stack Boss Seals, but neither seals nor the selected Boss Trophy are banked until extraction succeeds. The post-run report then groups secured equipment by rarity and shows each piece's level, slot, set, stat roll, quality, and value.

Existing saves migrate automatically. Old stacked inventory copies become separate protected gear instances, equipped pieces remain equipped, and old workshop upgrade levels remain as hidden legacy bonuses so progression is not erased.

## Lucky Relics

Gear is permanent loadout progression. Lucky Relics still shape the temporary build inside each expedition:

- Hammer Echo adds another hammer wave to each strike.
- Champion's Mark increases damage against elites and bosses and can add one extra boss drop.
- Guard Charm blocks incoming hits.
- Battle Rhythm increases movement and attack rate.
- Reckless Swing increases damage at the cost of maximum health.

Matching relics fuse in the same cargo slot up to Power 4. A common relic adds one power and a rare relic adds two. Recovered copies improve the Lucky Relic selected for later expeditions.

Champion's Mark combines with Battle Rhythm for Relentless Pursuit, which recharges Dash after an elite takedown. Combined with Reckless Swing it becomes Final Verdict, adding a finishing damage bonus against wounded bosses. Existing Lucky Satchel unlocks migrate to Champion's Mark automatically.

## Adventure paths

- Crimson Path offers 16% more sale value and ends with the Crimson Champion.
- Moonlit Path improves high-grade gear odds and ends with the Vault Warden.

All three champions have distinct movement, projectiles, arena hazards, phases, and permanent Boss Trophy rewards.

## Controls

- Move: `WASD`, arrow keys, or the mobile joystick
- Hold Hammerstorm: hold `Q`, `F`, or the on-screen Hold button
- Dash: `Space` or the on-screen dash button
- Extract: `E` or the on-screen extract button
- Pause/settings: `Escape` or the top-right settings button
- Combat: automatic close-range hammer impacts; no player ranged DPS

## Run locally

```powershell
python -m http.server 4175 --bind 0.0.0.0
```

Open `http://127.0.0.1:4175` on the computer, or use the computer's local IP address on a phone connected to the same network.

## Verify

```powershell
npm test
```

The automated release suite covers DOM/CSS integrity, JavaScript syntax, all 20 sets and 100 set pieces, five gear slots, unique-item migration, RNG item rolls, fixed set bonuses, boss-only equipment, Pappa levels, the rotating Gear Locker, relic fusion, safe extraction, the boss-loot ritual, a two-champion Go Deeper chain, extraction ambushes, both full boss paths, permanent trophies, career progression, settings, and developer tools.

Run the Chromium browser test with:

```powershell
npm run test:browser
```

For Playwright's interactive test runner, use `npm run test:browser:ui`.

Built with plain HTML, CSS, JavaScript, Canvas, and PNG assets.

The paper-doll masks can be rebuilt after editing the Pappa Hammer source sheets with `python tools/build-paper-doll-masks.py`.

The Legendary inventory and drop atlases can be rebuilt from the transparent source strips in `tmp/legendary` with `python tools/build-legendary-gear-atlas.py`.
