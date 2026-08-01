# Risk the Loot - Gear Catalog v0.59.0

Denne katalogen er generert fra de aktive definisjonene i `script.js`.

## Kort fasit

- Spillet har **150 gear-maler**.
- 40 er frittstaende field-items.
- 115 er set-items: 23 sett x 5 slots.
- Slots: Hat, Scarf, Coat, Hammer og Boots.
- Rarities i aktiv kode: Common, Rare, Epic og Legendary.
- Det finnes ikke Uncommon gear i den aktive loot-tabellen.
- Set-bonuser er kumulative. Et 5-piece set mottar ogsa bonusene fra lavere terskler.
- Vanlige signatures vekkes ved 3 deler og mestres ved 5 deler.
- Riskreaver vekkes ved 4 deler og mestres ved 5 deler.
- Handlava vekkes bare av hele Lava Set (5/5).

## Hva statsa betyr

| Stat | Effekt |
|---|---|
| HP | Flat bonus til maksimal helse. |
| DMG | Flat bonus til grunnskaden pa hammer impacts og fysiske shockwaves. |
| REACH (`magnet`) | Storrelse pa pickup-radiusen for coins, caches og pickups. |
| MOVE | Prosentvis bevegelsesbonus. |
| IMPACT (`fire`) | Raskere melee impacts og raskere Hammerstorm-pulser. |
| ARMOR | Prosentvis skadereduksjon, med en samlet cap pa 45 %. |
| VALUE (`loot`) | Oker coin-verdien. Det oker ikke rarity-sjansen. |
| DASH | Reduserer Dash-recharge, med en samlet cap pa 45 %. |
| CRIT | Critical hit chance, med en samlet cap pa 50 %. |

## Viktig om RNG-stats

Tallene nedenfor er **base stats**. Når et item dropper, skaleres hver stat med:

`base x (1 + 0.014 x (itemLevel - 1) + 0.000015 x (itemLevel - 1)^2) x quality x statRoll`

- Normal `quality` ligger omtrent mellom 0.86 og 1.16.
- Hver stat far i tillegg omtrent 0.94-1.06 tilfeldig variasjon.
- Item level er alltid mellom 1 og 100. Level 100 gir en kontrollert statsmultiplikator pa omtrent 2.53.
- Salgsverdi bruker en egen, litt raskere Level 1-100-kurve: `1 + 0.018 x step + 0.000025 x step^2`.
- Derfor kan to items med samme navn og level ha forskjellige stats.
- Set-bonusene og signature-effektene er faste og har ikke RNG.

## Frittstaende field-items (40)

| Rarity | Slot | Item | Base stats | Assetdekning |
|---|---|---|---|---|
| Common | Hat | Guild Work Hat | +5 HP | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Hat | Scout Brim | +2% MOVE | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Hat | Iron-Band Fedora | +0.6 DMG | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Hat | Compass Hat | +7 REACH | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Scarf | Red Work Scarf | +6 HP | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Scarf | Trail Wrap | +7 REACH | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Scarf | Lucky Kerchief | +3% VALUE | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Scarf | Duelist Ribbon | +2.5% IMPACT | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Coat | Padded Guild Coat | +10 HP | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Coat | Roadwarden Coat | +1.5% ARMOR | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Coat | Sailcloth Duster | +2.5% MOVE | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Coat | Stitched Navy Coat | +6 HP, +0.6 DMG | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Hammer | Oak Block Hammer | +1.2 DMG | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Hammer | Brass-Capped Hammer | +1.5 DMG | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Hammer | Quicksmith Mallet | +0.7 DMG, +3% IMPACT | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Hammer | Heavy Guild Hammer | +2.1 DMG | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Boots | Laced Work Boots | +2.5% MOVE | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Boots | Tower-Grip Boots | -3.5% DASH | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Boots | Scavenger Boots | +8 REACH | Field atlas + drop atlas + Gear 2.0 mask |
| Common | Boots | Iron-Toe Boots | +7 HP | Field atlas + drop atlas + Gear 2.0 mask |
| Rare | Hat | Lantern Captain Hat | +6% VALUE, +9 REACH | Field atlas + drop atlas + Gear 2.0 mask |
| Rare | Hat | Warden Lens Hat | +4% CRIT, +7 REACH | Field atlas + drop atlas + Gear 2.0 mask |
| Rare | Scarf | Crimson Banner Scarf | +5.5% IMPACT, +1.2 DMG | Field atlas + drop atlas + Gear 2.0 mask |
| Rare | Scarf | Moonweave Scarf | +5.5% VALUE, +4% MOVE | Field atlas + drop atlas + Gear 2.0 mask |
| Rare | Coat | Vanguard Longcoat | +22 HP, +3.5% ARMOR | Field atlas + drop atlas + Gear 2.0 mask |
| Rare | Coat | Merchant Prince's Coat | +11% VALUE, +12 REACH | Field atlas + drop atlas + Gear 2.0 mask |
| Rare | Hammer | Starforged Maul | +4 DMG, +3.5% CRIT | Field atlas + drop atlas + Gear 2.0 mask |
| Rare | Hammer | Echoing Squarehammer | +3 DMG, +6.5% IMPACT | Field atlas + drop atlas + Gear 2.0 mask |
| Rare | Boots | Windstep Boots | +7.5% MOVE, -7% DASH | Field atlas + drop atlas + Gear 2.0 mask |
| Rare | Boots | Vaultbreaker Boots | +12 HP, +4.5% MOVE | Field atlas + drop atlas + Gear 2.0 mask |
| Epic | Hat | Compass Crown | +10% CRIT, +16 REACH, +8% VALUE | Field atlas + drop atlas + Gear 2.0 mask |
| Epic | Scarf | Unfading Crimson Scarf | +12% IMPACT, +8% MOVE | Field atlas + drop atlas + Gear 2.0 mask |
| Epic | Coat | Midnight Captain's Coat | +38 HP, +7% ARMOR | Field atlas + drop atlas + Gear 2.0 mask |
| Epic | Hammer | Champion's Sunhammer | +7 DMG, +8% CRIT | Field atlas + drop atlas + Gear 2.0 mask |
| Epic | Boots | Horizon Strider Boots | +13% MOVE, -16% DASH | Field atlas + drop atlas + Gear 2.0 mask |
| Legendary | Hat | Crown of the Lost Road | +16% CRIT, +20% VALUE, +22 REACH | Field atlas + drop atlas + Gear 2.0 mask |
| Legendary | Coat | King's Oathcoat | +65 HP, +12% ARMOR, +4.5% MOVE | Field atlas + drop atlas + Gear 2.0 mask |
| Legendary | Hammer | Moonbreaker Hammer | +12 DMG, +15% IMPACT, +12% CRIT | Field atlas + drop atlas + Gear 2.0 mask |
| Legendary | Hammer | RISKREAVER | +20 DMG, +22% IMPACT, +22% CRIT | Dedicated legendary item/drop atlas cell; no full animation sheet |
| Legendary | Coat | Grand Vault Coat | +90 HP, +15% ARMOR, +10% MOVE | Dedicated legendary item/drop atlas cell; no full animation sheet |

## Hvordan de 115 set-item-statsa bygges

Hvert sett har disse fem item-navnene:

1. `[SET] Crown`
2. `[SET] Oathwrap`
3. `[SET] Longcoat`
4. `[SET] Great Hammer`
5. `[SET] Striders`

Lava Set bruker egne navn som matcher de dedikerte assetene: `Lava Hat`, `Living Lava Scarf`, `Lava Coat`, `Lava Hammer` og `Lava Boots`.

Alle far en rarity-skalert slot-base:

| Rarity | Crown | Oathwrap | Longcoat | Great Hammer | Striders |
|---|---|---|---|---|---|
| Rare | +5 HP, +0.8% CRIT | +1.4% MOVE, +1.4% IMPACT | +12 HP, +1% ARMOR | +1.5 DMG, +0.7% CRIT | +2% MOVE, -2% DASH |
| Epic | +6.4 HP, +1.024% CRIT | +1.792% MOVE, +1.792% IMPACT | +15.36 HP, +1.28% ARMOR | +1.92 DMG, +0.896% CRIT | +2.56% MOVE, -2.56% DASH |
| Legendary | +7.75 HP, +1.24% CRIT | +2.17% MOVE, +2.17% IMPACT | +18.6 HP, +1.55% ARMOR | +2.325 DMG, +1.085% CRIT | +3.1% MOVE, -3.1% DASH |
| Legendary | +11 HP, +1.76% CRIT | +3.08% MOVE, +3.08% IMPACT | +26.4 HP, +2.2% ARMOR | +3.3 DMG, +1.54% CRIT | +4.4% MOVE, -4.4% DASH |

I tillegg far Crown, Longcoat og Striders settets **Focus A**. Oathwrap og Great Hammer far **Focus B**:

| Rarity | HP | DMG | REACH | MOVE | IMPACT | ARMOR | VALUE | DASH | CRIT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Rare | 7 | 1.1 | 8 | 1.2% | 1.4% | 0.9% | 1.8% | 1.6% | 1.2% |
| Epic | 8.96 | 1.408 | 10.24 | 1.536% | 1.792% | 1.152% | 2.304% | 2.048% | 1.536% |
| Legendary | 10.85 | 1.705 | 12.4 | 1.86% | 2.17% | 1.395% | 2.79% | 2.48% | 1.86% |
| Legendary | 15.4 | 2.42 | 17.6 | 2.64% | 3.08% | 1.98% | 3.96% | 3.52% | 2.64% |

Eksempel: Hammer Choir har Focus A = DMG og Focus B = IMPACT. Hammer Choir Crown, Longcoat og Striders far derfor ekstra DMG, mens Oathwrap og Great Hammer far ekstra IMPACT.

## Alle 23 gear sets

`Assets` beskriver om settet har samme type assets som Hammer Choir.

| Set | Rarity / unlock | Focus A / B | Faste set-bonuser | Signature (Awakened / Mastered) | Assets |
|---|---|---|---|---|---|
| Trailwarden | Rare / Lv 1 | MOVE / REACH | 2p: +4% MOVE, +12 REACH; 3p: +16 HP; 5p: +2.4 DMG, +2.5% CRIT | Trail Momentum: kills reduserer Dash recovery / sterkere reduksjon og elite reset | Gear 2.0 set-atlas + drop-atlas + layers |
| Iron Guild | Rare / Lv 1 | HP / ARMOR | 2p: +18 HP; 3p: +3.5% ARMOR; 5p: +26 HP, +2 DMG | Iron Will: under 40% HP gir +12% DMG og +6% ARMOR / +20% DMG og +10% ARMOR | Gear 2.0 set-atlas + drop-atlas + layers |
| Red Banner | Rare / Lv 5 | DMG / IMPACT | 2p: +2 DMG; 3p: +4% IMPACT; 5p: +3.5% CRIT, +2.8 DMG | Banner Breaker: hvert femte impact lager ground fracture / hvert fjerde lager stor shockwave | Gear 2.0 set-atlas + drop-atlas + layers |
| Moonlit Scout | Rare / Lv 5 | CRIT / DASH | 2p: +2.5% CRIT; 3p: -5.5% DASH; 5p: +5% MOVE, +3.5% CRIT | Moonstep: Dash garanterer neste crit / Dash garanterer de neste to crits | Gear 2.0 set-atlas + drop-atlas + layers |
| Coinseeker | Rare / Lv 8 | VALUE / REACH | 2p: +5% VALUE; 3p: +18 REACH; 5p: +8% VALUE, +3.5% MOVE | Gilded Bounty: +30% coins / +60% coins og ekstra elite bounty | Gear 2.0 set-atlas + drop-atlas + layers |
| Tower Bulwark | Epic / Lv 12 | ARMOR / HP | 2p: +3% ARMOR; 3p: +24 HP; 5p: +4.5% ARMOR, +1.8 DMG | Last Bastion: blokker ett hit hvert 8. sekund / 6 sekunder og svar med hammer burst | Gear 2.0 set-atlas + drop-atlas + layers |
| **Stormcaller** | Legendary / Lv 12 | MOVE / DASH | 2p: +4.5% MOVE; 3p: -6% DASH; 5p: +5.5% IMPACT, +4% MOVE | I Am the Lightning: Dash lager en kort storm trail / tap-baserte chain-dashes, storm armor og sikre hopp gjennom fiender | **Tre fullfigur-sheets, eget ikon/drop-atlas og dedikert lightning-VFX** |
| **Hammer Choir** | Epic / Lv 16 | DMG / IMPACT | 2p: +3.5% IMPACT; 3p: +2.7 DMG; 5p: +4% CRIT, +4.5% IMPACT | Resonant Slam: hvert fjerde strike gir shockwave / hvert tredje gir stor, sterk shockwave | **Tre fullfigur-sheets: idle, run og attack (8 frames hver), pluss Gear 2.0 atlas/layers** |
| Lantern Guard | Epic / Lv 16 | HP / REACH | 2p: +20 HP; 3p: +20 REACH; 5p: +3.5% ARMOR, +4.5% VALUE | Guiding Light: ny floor gir en guard charge / to charges og litt healing | Gear 2.0 set-atlas + drop-atlas + layers |
| Grand Wayfarer | Epic / Lv 20 | MOVE / HP | 2p: +3.5% MOVE, +10 HP; 3p: +2 DMG; 5p: +3% CRIT, +5% VALUE | Long Road: bevegelse lader neste strike opptil +25% / raskere lading, opptil +45% | Gear 2.0 set-atlas + drop-atlas + layers |
| Crimson Oath | Legendary / Lv 25 | DMG / CRIT | 2p: +3.8 DMG; 3p: +5.5% CRIT; 5p: +5.2 DMG, +6% IMPACT | Blood Echo: crit sprer skade til naere fiender / lengre, sterkere echo og raskere neste strike | Gear 2.0 set-atlas + drop-atlas + layers |
| Moonbreaker | Legendary / Lv 30 | CRIT / IMPACT | 2p: +4.5% CRIT; 3p: +6.5% IMPACT; 5p: +7% CRIT, +3.5 DMG | Crescent Fracture: crit fracture treffer en ny fiende / kjeder gjennom to fiender | Gear 2.0 set-atlas + drop-atlas + layers |
| King's Road | Legendary / Lv 35 | HP / VALUE | 2p: +34 HP; 3p: +9% VALUE; 5p: +6% ARMOR, +3.2 DMG | Royal Feast: elite kill healer 5% / healer 9% og gir guard charge | Gear 2.0 set-atlas + drop-atlas + layers |
| Phantom Court | Legendary / Lv 40 | MOVE / ARMOR | 2p: +6.5% MOVE; 3p: +5.5% ARMOR; 5p: -8% DASH, +5% CRIT | Phantom Veil: Dash gir lengre evade og +25% neste strike / +45% neste strike | Gear 2.0 set-atlas + drop-atlas + layers |
| Starforge | Legendary / Lv 45 | DMG / ARMOR | 2p: +4.2 DMG; 3p: +5% ARMOR; 5p: +5 DMG, +4.5% CRIT | Starfall: hvert sjette strike blir star impact / hvert fjerde blir sterkere star impact | Gear 2.0 set-atlas + drop-atlas + layers |
| Grand Voyager | Legendary / Lv 50 | VALUE / MOVE | 2p: +8% VALUE; 3p: +7% MOVE; 5p: +30 REACH, +5.5% IMPACT | Uncharted Fortune: hver floor gir coins / doble coins og bonus cache pa dypere floors | Gear 2.0 set-atlas + drop-atlas + layers |
| **Lava Set** | Legendary / Lv 55 | DMG / IMPACT | 2p: +4 DMG; 3p: +6% IMPACT; 5p: +5 DMG, +5% CRIT; Handlava krever hele settet | Handlava (bare 5/5): to levende skjerfarmer prioriterer fiender utenfor hammerrekkevidde, griper og svinger dem inn i andre fiender, kaster mot naere flokker og slipper dem innenfor Spin-rekkevidde | **Tre fullfigur-sheets, eget ikon/drop-atlas, seks Handlava-sheets og animert lava-treffsprut** |
| **Nature Set** | Legendary / Lv 60 | ARMOR / MOVE | 2p: +4% ARMOR; 3p: +6% MOVE; 5p: +38 HP, +3.5 DMG; Ancient Pact krever hele settet | Ancient Pact (bare 5/5): en udodelig Ancient Ent finner den storste flokken, slammer den opp, binder opptil seks fiender med Rootwhip og holder dem klare for Hammerstorm. Bosser blir bare staggered | **Tre fullfigur-sheets, eget ikon/drop-atlas, Ancient Ent-sheet og Rootwhip trap-sheet** |
| Riskreaver | Legendary / Lv 65 | DMG / CRIT | 2p: +8% MOVE; 4p: +6 DMG, +5% CRIT; 5p: +8 DMG, +8% IMPACT, +5% CRIT | Crowd Hunger: fiender rundt deg oker skade og Hammerstorm-radius / mye sterkere surrounded scaling og begrenset Hammerstorm lifesteal | Dedicated legendary item/drop atlas + Gear 2.0 legendary layers |
| Grand Vault | Legendary / Lv 72 | HP / ARMOR | 2p: +55 HP; 3p: +8% ARMOR; 5p: +14% VALUE, +45 HP, +4 DMG | Vaultbound: to unsecured boss-items gir guard charge / hvert item gir charge, maks to | Dedicated legendary item/drop atlas + Gear 2.0 legendary layers |
| Crownless King | Legendary / Lv 80 | DMG / HP | 2p: +5 DMG, +28 HP; 3p: +7% CRIT, +5% ARMOR; 5p: +8% MOVE, +8% IMPACT, +10% VALUE | Kingslayer: elites/bosser under 30% HP tar +20% / under 40% tar +35% | Dedicated legendary item/drop atlas + Gear 2.0 legendary layers |
| Fatebound | Legendary / Lv 92 | CRIT / MOVE | 2p: +7% CRIT, +5% MOVE; 3p: +8.5% IMPACT, -9% DASH; 5p: +9 DMG, +6% CRIT, +8% VALUE | Fated Strike: hvert syvende strike garanterer crit / hvert femte critter og ett dodsfall avverges per expedition | Dedicated legendary item/drop atlas + Gear 2.0 legendary layers |
| **Black Hole** | Legendary / Lv 86 | DMG / ARMOR | 2p: +5% ARMOR, +4 DMG; 3p: +6% CRIT, +6% IMPACT; 5p: +8 DMG, +7% IMPACT, +4% CRIT | Gravity Well: hvert femte strike trekker flokken inn / hvert tredje lager en stor, sterk singularitet | **Tre fullfigur-sheets, eget ikon/drop-atlas og animert vortex-VFX** |

## Asset-fasit

### Fullstendig samme asset-type som Hammer Choir

Fem sett bruker na den ferdigtegnede fullfigur-pipelinen.

Hammer Choir har:

- `assets/hammer-choir-idle-v1.png`
- `assets/hammer-choir-run-v1.png`
- `assets/hammer-choir-attack-v1.png`
- Hvert sheet er 2048 x 1024 og inneholder 8 frames.

Nar hele Hammer Choir-settet er equipped, bytter spillet til disse ferdigtegnede fullfigur-animasjonene.

Black Hole har:

- `assets/black-hole-hammer-idle-v1.png`
- `assets/black-hole-hammer-run-v1.png`
- `assets/black-hole-hammer-attack-v1.png`
- `assets/black-hole-hammer-vfx-v1.png`
- `assets/black-hole-gear-icons-v1.png`
- `assets/black-hole-gear-drops-v1.png`
- Fullfigur-sheetene og VFX-sheetet er 2048 x 1024 med 8 frames.
- Nar hele settet er equipped, brukes den morkebla cosmic fullfigur-animasjonen. Gravity Well bruker det egne VFX-sheetet i kamp.

Stormcaller har:

- `assets/stormcaller-hammer-idle-v1.png`
- `assets/stormcaller-hammer-run-v1.png`
- `assets/stormcaller-hammer-attack-v1.png`
- `assets/stormcaller-gear-icons-v1.png`
- `assets/stormcaller-gear-drops-v1.png`
- Fullfigur-sheetene er 2048 x 1024 med 8 frames.
- Nar hele settet er equipped, brukes den morke storm-metal-transformasjonen med kontinuerlig elektrisk aura.
- Chain-dash bruker egne avreise-, trail-, afterimage-, impact- og kill-effekter som skalerer med chain-tempo.

### Lava Set / Handlava

Lava Set har:

- `assets/lava-gear-icons-v1.png`
- `assets/lava-gear-drops-v1.png`
- `assets/lava-hammer-idle-v1.png`
- `assets/lava-hammer-run-v1.png`
- `assets/lava-hammer-attack-v1.png`
- `assets/handlava-hit-splash-v1.png`
- `assets/handlava-idle-v1.png`
- `assets/handlava-extend-v1.png`
- `assets/handlava-grab-v1.png`
- `assets/handlava-swing-v1.png`
- `assets/handlava-throw-v1.png`
- `assets/handlava-retract-v1.png`
- Fullt 5/5-sett bruker den ferdigtegnede Lava-transformasjonen i idle, run og attack. Handlava er en eksklusiv 5/5-signature. De to armene deler pooler for varme-, trail- og impact-effekter, spruter animert lava ved faktiske treff og lar fiender lande naer nok til Hammerstorm-oppfolging.

### Nature Set / Ancient Pact

Nature Set har:

- `assets/nature-gear-icons-v1.png`
- `assets/nature-gear-drops-v1.png`
- `assets/nature-hammer-idle-v1.png`
- `assets/nature-hammer-run-v1.png`
- `assets/nature-hammer-attack-v1.png`
- `assets/ancient-ent-v1.png`
- `assets/nature-root-trap-v1.png`
- Fullt 5/5-sett bruker den ferdigtegnede Nature-transformasjonen. Ancient Ent er en permanent, udodelig kontroll-alliert som velger den storste naere flokken. Rootwhip trekker og fordeler opptil seks fiender rundt Enten uten a stable dem pa samme punkt. Elitefiender trekkes svakere, mens bosser er immune mot grep og bare blir staggered.

### Hva de andre settene faktisk har

Alle 23 sett har:

- En egen `SET_VISUAL_PROFILES`-profil.
- Egne item-ikoner i atlas.
- Egne mini drop-assets.
- Gear 2.0 paper-doll rendering for Hat, Scarf, Coat, Hammer og Boots.
- Rendering i Idle, Run, Attack, Character Preview og Inventory.

Settene uten dedikerte fullfigur-sheets bruker:

- `assets/set-gear-atlas.png`
- `assets/set-gear-drops.png`

De fire opprinnelige Legendary-settene bruker:

- `assets/legendary-gear-atlas.png`
- `assets/legendary-gear-drops.png`

Dette betyr at de andre settene **ikke mangler visuell rendering**, men de har ikke egne, handtegnede fullfigur-spritesheets slik Hammer Choir har. De komponeres dynamisk av baseanimasjon + Gear 2.0-lag.
