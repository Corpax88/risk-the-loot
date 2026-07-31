# Equipment Performance Report

## Bottlenecks found

- Equipping synchronously rebuilt three complete paper-doll animation atlases before the browser could paint.
- The complete base loadout, rarity summary, desktop details and mobile details were rebuilt for every equip, including hidden UI.
- `localStorage` serialization and the first audio-context startup happened inside the input handler.
- Forced layout reads restarted equip animations and slot effects.
- Moving from an item card to its Equip button rebuilt the details panel and could detach the button during interaction.

## Pipeline changes

- The selected item's already-cached live preview is committed immediately to Pappa Hammer.
- Full idle/run/attack atlas composition is deferred until leaving the Armory, where gameplay needs those poses.
- Equip updates only the character summary, stats, equipment slots, set progress, affected item states and the visible comparison panel.
- Persistence is debounced and flushed on Armory close, page hide and document hide.
- Audio is primed when the Armory opens.
- Forced layout reads were removed from normal equip feedback.
- Hover previews no longer rebuild the selected-item action panel.

## Playwright instrumentation

Every equip records:

- input, state, save queue, character, stats, slot, card and comparison markers
- first-frame and completed-paint markers
- duration for each pipeline step
- render counts for full/grid/incremental/detail/paper-doll work
- active full set and whether it uses a production full-figure skin

Run the focused suite with:

```powershell
npm run test:equip-performance
```

## Measured result

Baseline iPhone measurement before the fix:

- input to visible update: about 377 ms
- total completion: about 817 ms

Representative optimized measurements:

- desktop input to all visible surfaces: about 50 ms
- desktop completion: about 106 ms
- iPhone input to all visible surfaces: about 30 ms
- iPhone completion: about 84 ms
- 20 rapid equips: about 31 ms average visible update, about 136 ms average completion
- no full Armory renders, inventory-grid rebuilds, synchronous paper-doll builds, empty character frames or layout shifts during equip

Exact timing varies with hardware and browser scheduling. The Playwright assertions keep normal equips below 100 ms to visible update and 200 ms to completion, with a slightly wider completion ceiling for the artificial 20-equip stress sequence.
