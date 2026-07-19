#!/usr/bin/env python3
"""Build the dedicated legendary gear atlases from four transparent strips."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "tmp" / "legendary"
ASSET_DIR = ROOT / "assets"
SETS = [
    ("riskreaver", "RISKREAVER", "riskreaver-alpha.png"),
    ("grandVault", "GRAND VAULT", "grand-vault-alpha.png"),
    ("crownlessKing", "CROWNLESS KING", "crownless-king-alpha.png"),
    ("fatebound", "FATEBOUND", "fatebound-alpha.png"),
]
SLOTS = ["hat", "scarf", "coat", "hammer", "boots"]
LEGACY_ITEMS = [
    ("wardenSingularity", "Grand Vault Coat", "coat"),
    ("tyrantEmbercore", "RISKREAVER", "hammer"),
]
CELL = 512
DROP_CELL = 160
ALPHA_THRESHOLD = 18
MIN_COMPONENT_PIXELS = 24


def isolate_items(image: Image.Image) -> list[tuple[Image.Image, tuple[int, int, int, int]]]:
    """Separate five horizontally arranged items without clipping overlaps."""
    width, height = image.size
    alpha = image.getchannel("A")
    mask = bytearray(1 if value >= ALPHA_THRESHOLD else 0 for value in alpha.tobytes())
    components: list[dict] = []

    for start in range(width * height):
        if not mask[start]:
            continue
        stack = [start]
        mask[start] = 0
        pixels: list[int] = []
        sum_x = 0
        while stack:
            index = stack.pop()
            pixels.append(index)
            x = index % width
            sum_x += x
            left = x > 0
            right = x + 1 < width
            for neighbor in (
                index - 1 if left else -1,
                index + 1 if right else -1,
                index - width if index >= width else -1,
                index + width if index < width * (height - 1) else -1,
                index - width - 1 if left and index >= width else -1,
                index - width + 1 if right and index >= width else -1,
                index + width - 1 if left and index < width * (height - 1) else -1,
                index + width + 1 if right and index < width * (height - 1) else -1,
            ):
                if neighbor >= 0 and mask[neighbor]:
                    mask[neighbor] = 0
                    stack.append(neighbor)
        if len(pixels) >= MIN_COMPONENT_PIXELS:
            components.append({"pixels": pixels, "weight": len(pixels), "center": sum_x / len(pixels)})

    if len(components) < len(SLOTS):
        raise RuntimeError(f"Expected at least five item components, found {len(components)}")

    centers = [width * (index + 0.5) / len(SLOTS) for index in range(len(SLOTS))]
    groups: list[list[dict]] = []
    for _ in range(12):
        groups = [[] for _ in SLOTS]
        for component in components:
            group = min(range(len(centers)), key=lambda index: abs(component["center"] - centers[index]))
            groups[group].append(component)
        next_centers = []
        for index, group in enumerate(groups):
            if not group:
                next_centers.append(centers[index])
                continue
            weight = sum(component["weight"] for component in group)
            next_centers.append(sum(component["center"] * component["weight"] for component in group) / weight)
        if all(abs(a - b) < 0.01 for a, b in zip(centers, next_centers)):
            break
        centers = next_centers

    if any(not group for group in groups):
        raise RuntimeError("Could not resolve every legendary item cluster")

    isolated: list[tuple[Image.Image, tuple[int, int, int, int]]] = []
    for group in groups:
        item_mask = bytearray(width * height)
        for component in group:
            for index in component["pixels"]:
                item_mask[index] = 255
        matte = Image.frombytes("L", image.size, bytes(item_mask))
        item = Image.new("RGBA", image.size, (0, 0, 0, 0))
        item.paste(image, (0, 0), matte)
        bbox = item.getchannel("A").getbbox()
        if bbox is None:
            raise RuntimeError("Legendary item cluster is empty")
        isolated.append((item.crop(bbox), bbox))
    return isolated


def normalized_cell(crop: Image.Image) -> Image.Image:

    # Leave enough breathing room for the premium frame while keeping every
    # silhouette large and equally legible on a phone.
    padding = 22
    scale = min((CELL - padding * 2) / crop.width, (CELL - padding * 2) / crop.height)
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    crop = crop.resize(size, Image.Resampling.LANCZOS)
    cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    cell.alpha_composite(crop, ((CELL - size[0]) // 2, (CELL - size[1]) // 2))
    return cell


def main() -> None:
    rows = len(SETS) + 1
    atlas = Image.new("RGBA", (CELL * len(SLOTS), CELL * rows), (0, 0, 0, 0))
    drops = Image.new("RGBA", (DROP_CELL * len(SLOTS), DROP_CELL * rows), (0, 0, 0, 0))
    manifest = {
        "version": 1,
        "cellSize": CELL,
        "dropCellSize": DROP_CELL,
        "columns": len(SLOTS),
        "rows": rows,
        "slotOrder": SLOTS,
        "sets": [],
        "items": [],
    }

    for row, (set_id, set_name, filename) in enumerate(SETS):
        source_path = SOURCE_DIR / filename
        source = Image.open(source_path).convert("RGBA")
        items = isolate_items(source)
        manifest["sets"].append({"id": set_id, "name": set_name, "row": row})
        for column, (slot, (item_source, source_bbox)) in enumerate(zip(SLOTS, items)):
            cell = normalized_cell(item_source)
            atlas.alpha_composite(cell, (column * CELL, row * CELL))
            drop = cell.resize((DROP_CELL, DROP_CELL), Image.Resampling.LANCZOS)
            drops.alpha_composite(drop, (column * DROP_CELL, row * DROP_CELL))
            manifest["items"].append(
                {
                    "id": f"{set_id}-{slot}",
                    "setId": set_id,
                    "slot": slot,
                    "column": column,
                    "row": row,
                    "sourceBounds": list(source_bbox),
                }
            )

    # The two legacy legendary rewards used to borrow cells from newer sets.
    # Promote their original painted silhouettes into a dedicated premium row
    # so every catalog entry keeps a distinct identity.
    base_atlas = Image.open(ASSET_DIR / "gear-items-atlas.png").convert("RGBA")
    base_manifest = json.loads((ASSET_DIR / "gear-atlas.json").read_text(encoding="utf-8"))
    base_by_id = {item["id"]: item for item in base_manifest["items"]}
    legacy_row = len(SETS)
    manifest["sets"].append({"id": "legacy", "name": "LEGACY LEGENDARIES", "row": legacy_row})
    for item_id, item_name, slot in LEGACY_ITEMS:
        source_entry = base_by_id[item_id]
        box = (
            source_entry["column"] * 256,
            source_entry["row"] * 256,
            (source_entry["column"] + 1) * 256,
            (source_entry["row"] + 1) * 256,
        )
        source = base_atlas.crop(box)
        bounds = source.getchannel("A").getbbox()
        if bounds is None:
            raise RuntimeError(f"Legacy legendary source is empty: {item_id}")
        cell = normalized_cell(source.crop(bounds))
        column = SLOTS.index(slot)
        atlas.alpha_composite(cell, (column * CELL, legacy_row * CELL))
        drops.alpha_composite(cell.resize((DROP_CELL, DROP_CELL), Image.Resampling.LANCZOS), (column * DROP_CELL, legacy_row * DROP_CELL))
        manifest["items"].append(
            {
                "id": item_id,
                "name": item_name,
                "slot": slot,
                "column": column,
                "row": legacy_row,
                "legacy": True,
                "sourceBounds": list(bounds),
            }
        )

    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    atlas.save(ASSET_DIR / "legendary-gear-atlas.png", optimize=True)
    drops.save(ASSET_DIR / "legendary-gear-drops.png", optimize=True)
    (ASSET_DIR / "legendary-gear-atlas.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Wrote {atlas.size} legendary atlas and {drops.size} drop atlas")


if __name__ == "__main__":
    main()
