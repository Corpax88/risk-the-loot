#!/usr/bin/env python3
"""Build unique inventory and world-drop art for every non-legendary set item."""

from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets"
SOURCE_ATLAS = ASSET_DIR / "gear-items-atlas.png"
SOURCE_MANIFEST = ASSET_DIR / "gear-atlas.json"
OUTPUT_ATLAS = ASSET_DIR / "set-gear-atlas.png"
OUTPUT_DROPS = ASSET_DIR / "set-gear-drops.png"
OUTPUT_MANIFEST = ASSET_DIR / "set-gear-atlas.json"

SLOTS = ["hat", "scarf", "coat", "hammer", "boots"]
CELL = 256
DROP_CELL = 80

# Legendary sets have hand-painted art in legendary-gear-atlas.png. These are
# the remaining sets that previously reused a small pool of generic sprites.
SETS = [
    ("trailwarden", "TRAILWARDEN", "rare", "#26435b", "#d6aa58"),
    ("ironGuild", "IRON GUILD", "rare", "#303a43", "#c2b9a5"),
    ("redBanner", "RED BANNER", "rare", "#8f2730", "#f0c66a"),
    ("moonlitScout", "MOONLIT SCOUT", "rare", "#263d6b", "#d9e0f0"),
    ("coinseeker", "COINSEEKER", "rare", "#405641", "#e1b34c"),
    ("towerBulwark", "TOWER BULWARK", "epic", "#303f66", "#aebff0"),
    ("stormrunner", "STORMRUNNER", "epic", "#1e4e63", "#9ed9e5"),
    ("hammerChoir", "HAMMER CHOIR", "epic", "#40345f", "#d7c1ff"),
    ("lanternGuard", "LANTERN GUARD", "epic", "#51432d", "#ffe09a"),
    ("grandWayfarer", "GRAND WAYFARER", "epic", "#273f64", "#e4d9c3"),
    ("crimsonOath", "CRIMSON OATH", "mythic", "#631e2c", "#ec9295"),
    ("moonbreaker", "MOONBREAKER", "mythic", "#24274f", "#aebcf0"),
    ("kingsRoad", "KING'S ROAD", "mythic", "#152d55", "#d6aa58"),
    ("phantomCourt", "PHANTOM COURT", "mythic", "#36314d", "#b7c7d9"),
    ("starforge", "STARFORGE", "mythic", "#30243c", "#f0b83e"),
    ("grandVoyager", "GRAND VOYAGER", "mythic", "#234253", "#d6c58f"),
]


def rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[index : index + 2], 16) for index in (0, 2, 4))


def mix(a: tuple[int, int, int], b: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    return tuple(round(left * (1 - amount) + right * amount) for left, right in zip(a, b))


def closest_opaque_point(alpha: Image.Image, target: tuple[int, int]) -> tuple[int, int]:
    pixels = alpha.load()
    best = target
    best_distance = float("inf")
    for y in range(12, CELL - 12, 3):
        for x in range(12, CELL - 12, 3):
            if pixels[x, y] < 150:
                continue
            distance = (x - target[0]) ** 2 + (y - target[1]) ** 2
            if distance < best_distance:
                best = (x, y)
                best_distance = distance
    return best


def draw_signature(draw: ImageDraw.ImageDraw, center: tuple[int, int], radius: int, style: int, accent: tuple[int, int, int]) -> None:
    x, y = center
    dark = (10, 15, 24, 235)
    bright = (*mix(accent, (255, 255, 255), 0.28), 255)
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=dark, outline=bright, width=2)
    inner = max(4, radius - 5)
    mode = style % 6
    if mode == 0:
        points = []
        for index in range(8):
            angle = -math.pi / 2 + index * math.pi / 4
            length = inner if index % 2 == 0 else inner * 0.45
            points.append((x + math.cos(angle) * length, y + math.sin(angle) * length))
        draw.polygon(points, fill=bright)
    elif mode == 1:
        draw.polygon([(x, y - inner), (x + inner, y), (x, y + inner), (x - inner, y)], outline=bright, width=3)
        draw.ellipse((x - 2, y - 2, x + 2, y + 2), fill=bright)
    elif mode == 2:
        draw.arc((x - inner, y - inner, x + inner, y + inner), 28, 332, fill=bright, width=3)
        draw.line((x - inner // 2, y, x + inner, y), fill=bright, width=2)
    elif mode == 3:
        draw.line((x - inner, y - inner, x + inner, y + inner), fill=bright, width=3)
        draw.line((x + inner, y - inner, x - inner, y + inner), fill=bright, width=3)
    elif mode == 4:
        draw.ellipse((x - inner, y - inner, x + inner, y + inner), outline=bright, width=3)
        draw.ellipse((x - 2, y - 2, x + 2, y + 2), fill=bright)
    else:
        for offset in (-inner // 2, 0, inner // 2):
            draw.line((x - inner, y + offset, x + inner, y + offset), fill=bright, width=2)


def tint_item(source: Image.Image, color: str, accent: str, set_index: int, slot_index: int) -> Image.Image:
    source = source.convert("RGBA")
    alpha = source.getchannel("A")
    base = rgb(color)
    highlight = rgb(accent)
    gray = ImageOps.grayscale(source)
    tinted = ImageOps.colorize(
        gray,
        black=mix(base, (0, 0, 0), 0.72),
        mid=mix(base, highlight, 0.18),
        white=mix(highlight, (255, 255, 255), 0.42),
        midpoint=132,
    ).convert("RGBA")
    tinted.putalpha(alpha)
    result = Image.blend(source, tinted, 0.58)
    result.putalpha(alpha)

    # Set-specific trim is clipped to the item, preserving the painted detail.
    trim = Image.new("RGBA", source.size, (0, 0, 0, 0))
    trim_draw = ImageDraw.Draw(trim)
    spacing = 26 + (set_index % 4) * 4
    offset = (set_index * 13 + slot_index * 7) % spacing
    trim_color = (*highlight, 54 if set_index < 10 else 72)
    for line in range(-CELL, CELL * 2, spacing):
        if set_index % 2:
            trim_draw.line((line + offset, 0, line - CELL + offset, CELL), fill=trim_color, width=2)
        else:
            trim_draw.line((line + offset, 0, line + CELL + offset, CELL), fill=trim_color, width=2)
    trim.putalpha(ImageChops.multiply(trim.getchannel("A"), alpha))
    result = Image.alpha_composite(result, trim)

    # A compact crest makes every set immediately recognizable in tiny slots.
    bbox = alpha.getbbox()
    if bbox:
        wanted = (bbox[2] - 24, round(bbox[1] + (bbox[3] - bbox[1]) * 0.44))
        center = closest_opaque_point(alpha, wanted)
        crest = Image.new("RGBA", source.size, (0, 0, 0, 0))
        draw_signature(ImageDraw.Draw(crest), center, 13, set_index, highlight)
        crest.putalpha(ImageChops.multiply(crest.getchannel("A"), alpha.filter(ImageFilter.MaxFilter(5))))
        result = Image.alpha_composite(result, crest)

    # A restrained colored edge keeps dark items readable against the bag.
    outside = ImageChops.subtract(alpha.filter(ImageFilter.MaxFilter(5)), alpha)
    edge = Image.new("RGBA", source.size, (*mix(highlight, (255, 255, 255), 0.12), 0))
    edge.putalpha(outside.point(lambda value: round(value * 0.34)))
    return Image.alpha_composite(edge, result)


def main() -> None:
    base = Image.open(SOURCE_ATLAS).convert("RGBA")
    source_manifest = json.loads(SOURCE_MANIFEST.read_text(encoding="utf-8"))
    by_slot: dict[str, list[dict]] = {slot: [] for slot in SLOTS}
    for item in source_manifest["items"]:
        by_slot[item["slot"]].append(item)

    atlas = Image.new("RGBA", (CELL * len(SLOTS), CELL * len(SETS)), (0, 0, 0, 0))
    drops = Image.new("RGBA", (DROP_CELL * len(SLOTS), DROP_CELL * len(SETS)), (0, 0, 0, 0))
    manifest = {
        "version": 1,
        "cellSize": CELL,
        "dropCellSize": DROP_CELL,
        "columns": len(SLOTS),
        "rows": len(SETS),
        "slotOrder": SLOTS,
        "sets": [],
        "items": [],
    }

    for row, (set_id, set_name, rarity, color, accent) in enumerate(SETS):
        manifest["sets"].append({"id": set_id, "name": set_name, "rarity": rarity, "row": row})
        for column, slot in enumerate(SLOTS):
            sources = by_slot[slot]
            source_entry = sources[(row * 3 + column) % len(sources)]
            source_box = (
                source_entry["column"] * CELL,
                source_entry["row"] * CELL,
                (source_entry["column"] + 1) * CELL,
                (source_entry["row"] + 1) * CELL,
            )
            cell = tint_item(base.crop(source_box), color, accent, row, column)
            atlas.alpha_composite(cell, (column * CELL, row * CELL))
            drops.alpha_composite(cell.resize((DROP_CELL, DROP_CELL), Image.Resampling.LANCZOS), (column * DROP_CELL, row * DROP_CELL))
            manifest["items"].append(
                {
                    "id": f"{set_id}-{slot}",
                    "setId": set_id,
                    "slot": slot,
                    "rarity": rarity,
                    "column": column,
                    "row": row,
                    "sourceId": source_entry["id"],
                }
            )

    atlas.save(OUTPUT_ATLAS, optimize=True)
    drops.save(OUTPUT_DROPS, optimize=True)
    OUTPUT_MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(manifest['items'])} unique set items to {OUTPUT_ATLAS.name} and {OUTPUT_DROPS.name}")


if __name__ == "__main__":
    main()
