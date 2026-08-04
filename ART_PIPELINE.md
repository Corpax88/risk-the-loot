# Risk the Loot Art Pipeline

This workspace is intentionally separate from active game code and production assets. It is the source area for editable Krita files, alignment references, reviews, and lossless PNG exports.

## Installed Tool

- Krita: 5.3.3
- Package: `KDE.Krita`
- Installation: official Windows Package Manager (`winget`)
- Install command: `winget install --id KDE.Krita --exact --source winget`
- Executable: `C:\Program Files\Krita (x64)\bin\krita.exe`
- AI inpainting plugin: not installed; the available setups require separate model/dependency downloads and are unnecessary for this safe base pipeline.

## Folder Structure

```text
art/
  masters/                         Immutable alignment copies
  templates/                       Reusable Krita templates
  working/
    common/                         Editable .kra source files
    rare/
    epic/
    legendary/
  exports/
    base/                           Approved base exports only
    cape/
    legs/
    boots/
    chest/
    scarf/
    hat/
    weapon/
    effects/
    icons/                          Inventory icons, including jewelry
  references/                       Alignment checks and visual references
  archive/                          Dated superseded .kra files; never overwrite
  tools/                            Safe build, export, and validation scripts
```

## Master Base

`art/masters/pappa_hammer_master.png` is the only alignment master in this pipeline.

- Canvas: 1402 x 1122 pixels
- Format: transparent RGBA PNG
- Origin: top-left at `(0, 0)`
- SHA-256: `C89B0CD2C7CD9F786813B06DB779F6A9EF1568AA369EC1A6F4619201F2072F17`
- Source copy: `assets/pappa-hammer-player.png`

The art copy is byte-for-byte identical to its source. Never move, crop, resize, rotate, repaint, flatten over, or overwrite either file.

## Opening the Template

Open `art/templates/pappa_hammer_equipment_template.kra` in Krita. Immediately use **Save As** into the correct `art/working/<rarity>/` folder. Never paint directly in the template.

The top-to-bottom layer groups are:

1. `09_Effects`
2. `08_Weapon`
3. `07_Hat`
4. `06_Scarf`
5. `05_Chest`
6. `04_Boots`
7. `03_Legs`
8. `02_Base_Body_REFERENCE_LOCKED`
9. `01_Cape`

The Base Body group and its master layer are locked. They exist only for alignment and must not be included in a gear export.

`09_Effects` contains a hidden, locked `ALIGNMENT_GUIDES_REFERENCE_LOCKED` layer. It can be shown while checking alignment, then hidden again before normal review. Its markers identify:

- Canvas center: `x=701`
- Head/body anchor: `x=594`, head line `y=174`
- Torso: `y=360`
- Hands/weapon grip: `x=835`, `y=455`
- Waist: `y=548`
- Knees: `y=748`
- Feet: `y=1010`
- Ground line: `y=1072`

## Creating Gear

1. Open the template and save a new `.kra` in `art/working/<rarity>/`.
2. Paint or paste the gear into exactly one production group.
3. Keep the master canvas at 1402 x 1122.
4. Keep the master origin and transparent padding unchanged.
5. Do not auto-crop or resize the canvas.
6. Use the locked body and optional guide layer only for alignment.
7. Hide guide/reference layers for review.
8. Save the editable `.kra` before exporting.

Actual drawing, cleanup, masking, inpainting, and visual approval are manual Krita tasks. The scripts only build structure, isolate a production group, export, and validate.

## Export Rules

Every character gear export must be:

- One transparent, lossless RGBA PNG
- Exactly 1402 x 1122 pixels
- Full master canvas with original transparent padding
- No text, background, frame, mockup, or base body
- No resizing, trimming, or auto-cropping
- One slot only: cape, legs, boots, chest, scarf, hat, weapon, or effects

Filename format:

```text
rarity_setname_slot_variant.png
legendary_whirlwind_hat_01.png
```

Allowed rarity names are `common`, `rare`, `epic`, and `legendary`. Use lowercase ASCII, underscores, and a two-digit variant number.

### Safe Slot Export

From the `risk-the-loot` directory:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\art\tools\Export-KritaSlot.ps1 `
  -SourceKra .\art\working\legendary\legendary_whirlwind_hat_01.kra `
  -Group 07_Hat `
  -OutputPng .\art\exports\hat\legendary_whirlwind_hat_01.png
```

The exporter copies the `.kra` to the system temporary directory, changes visibility only in that temporary copy, exports through Krita, validates the PNG, and deletes the temporary copy. It never saves, flattens, or edits the working `.kra`.

Run standalone validation with:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\art\tools\Validate-KritaExport.ps1 `
  -PngPath .\art\exports\hat\legendary_whirlwind_hat_01.png
```

## Inventory Icons and Jewelry

Inventory icons are separate presentation assets in `art/exports/icons/`. They may use an icon-sized canvas approved by the UI art lead and are never rendered on Pappa Hammer.

- Necklace: icon only
- Ring 1: icon only
- Ring 2: icon only

Do not create character-layer exports for necklaces or rings.

## Alignment Verification

Before approving an export:

1. Confirm the exported PNG is 1402 x 1122 RGBA.
2. Reimport it as a layer at `(0, 0)` above the locked master.
3. Do not transform the imported layer.
4. Check head, torso, hands/grip, waist, knees, feet, and ground line.
5. Toggle the gear layer repeatedly; there must be no drift.
6. Hide the master and confirm the PNG contains only the gear and transparency.

The automated example is:

- Working file: `art/working/common/common_alignment_test_hat_01.kra`
- Gear-only export: `art/exports/hat/common_alignment_test_hat_01.png`
- Reimport check: `art/references/alignment_reimport_validation.kra`
- Machine-readable result: `art/references/pipeline_validation.json`

The cyan test marker is an alignment test, not production artwork.

## Asset Definitions

- **Master base:** immutable underwear-only Pappa Hammer alignment source.
- **Gear asset:** one full-canvas transparent PNG for one rendered equipment slot.
- **Inventory icon:** UI-only item image; never used as an equipped body layer.
- **Mockup:** presentation/reference image; never shipped or exported as gear.
- **Sprite sheet:** multiple animation frames on a documented grid; not interchangeable with a static gear layer.

## Backup and Archive

1. Keep current editable work under `art/working/<rarity>/`.
2. Before a destructive visual revision, copy the `.kra` into `art/archive/YYYY-MM-DD/`.
3. Add a short suffix such as `_before_silhouette_pass`.
4. Never overwrite an archived file.
5. Production promotion should copy an approved export; it must not move or delete the working source.

## Rebuilding the Template

The checked-in template is ready to use. If it must be reproduced from the immutable master:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\art\tools\Build-KritaPipeline.ps1
```

This command writes only inside `art/templates`, the example `art/working/common` file, the example export, and `art/references`. It verifies that the copied master still matches the production source by SHA-256.

## Manual Steps Still Required

- Draw and clean production gear manually in Krita.
- Visually approve each item at full size and intended in-game size.
- Create inventory icons separately.
- Archive superseded `.kra` files before major repainting.
- Promote approved exports into production only through a separate, explicit game-asset task.

