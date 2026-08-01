#!/usr/bin/env python3
"""Build the Lava Set gear atlases from the five supplied source images.

The source JPEGs use white or baked checkerboard backgrounds.  This script
only removes those neutral, near-white pixels, retains the painted item pixels,
and normalizes each item into the game's existing five-slot atlas layout.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE_DIR = ROOT.parent / "upload"
DEFAULT_ASSET_DIR = ROOT / "assets"

CELL = 256
DROP_CELL = 80
PADDING = 9
SOURCES = [
    ("hat", "80ECE90F-6211-4A82-AF33-2D44882795DD.jpeg"),
    ("scarf", "85D3E5AC-B018-4802-87A7-1A6895D018ED.jpeg"),
    ("coat", "6C974384-29F6-4EF5-8A69-D8500DAEC8EC.jpeg"),
    ("hammer", "96505838-6158-4D9D-9902-EE791CFF1713.jpeg"),
    ("boots", "912D1306-62ED-49ED-9BAB-FD99B5353D5E.jpeg"),
]


def extracted_item(source: Image.Image, slot: str) -> Image.Image:
    """Remove only the neutral light backdrop and return a tight RGBA crop."""
    source = source.convert("RGB")
    rgb = np.asarray(source, dtype=np.float32)
    lightness = (
        rgb[:, :, 0] * 0.2126
        + rgb[:, :, 1] * 0.7152
        + rgb[:, :, 2] * 0.0722
    )
    chroma = rgb.max(axis=2) - rgb.min(axis=2)

    # Dark rock and strongly colored lava are foreground.  The two confidence
    # terms also recover the soft orange heat glow around the silhouettes.
    dark_confidence = np.clip((232.0 - lightness) / 72.0, 0.0, 1.0)
    color_confidence = np.clip((chroma - 5.0) / 35.0, 0.0, 1.0)
    alpha = np.maximum(dark_confidence, color_confidence)

    # Every supplied background is neutral and close to white.  Clearing this
    # band removes both checker values (and JPEG ringing between them) without
    # touching saturated molten highlights.
    # Resolve the neutral region from the outside in.  This removes the pale
    # antialiasing baked into the JPEG backdrop while leaving enclosed metal
    # highlights in the paintings untouched.
    background_candidate = Image.fromarray(
        np.uint8(((lightness >= 190.0) & (chroma <= 22.0)) * 255),
        mode="L",
    )
    for corner in (
        (0, 0),
        (source.width - 1, 0),
        (0, source.height - 1),
        (source.width - 1, source.height - 1),
    ):
        if background_candidate.getpixel(corner) == 255:
            ImageDraw.floodfill(background_candidate, corner, 128, thresh=0)
    neutral_background = np.asarray(background_candidate, dtype=np.uint8) == 128
    alpha[neutral_background] = 0.0

    # The hat source alone is photographed above a soft floor shadow.  It is
    # backdrop rather than part of the hat, so discard neutral pixels beneath
    # the final substantial row of the painted orange brim.
    if slot == "hat":
        row_grid = np.arange(source.height)[:, None]
        floor_shadow = (
            (row_grid > round(source.height * 0.82))
            & (chroma <= 32.0)
        )
        alpha[floor_shadow] = 0.0
    alpha = np.power(alpha, 0.88)

    matte = Image.fromarray(np.uint8(np.clip(alpha * 255.0, 0, 255)), mode="L")
    matte = matte.filter(ImageFilter.GaussianBlur(radius=0.55))

    # Ignore isolated compression specks when resolving the crop, while still
    # retaining them inside the item's compact source region as painted detail.
    strong = np.asarray(matte, dtype=np.uint8) >= 56
    row_minimum = max(3, round(source.width * 0.002))
    column_minimum = max(3, round(source.height * 0.002))
    rows = np.flatnonzero(np.count_nonzero(strong, axis=1) >= row_minimum)
    columns = np.flatnonzero(np.count_nonzero(strong, axis=0) >= column_minimum)
    if not len(rows) or not len(columns):
        raise RuntimeError("Could not isolate a Lava Set item from its background")

    bleed = 8
    left = max(0, int(columns[0]) - bleed)
    top = max(0, int(rows[0]) - bleed)
    right = min(source.width, int(columns[-1]) + bleed + 1)
    bottom = min(source.height, int(rows[-1]) + bleed + 1)

    rgba = source.convert("RGBA")
    rgba.putalpha(matte)
    return rgba.crop((left, top, right, bottom))


def remove_tiny_islands(image: Image.Image, minimum_pixels: int = 20) -> Image.Image:
    """Discard isolated JPEG flecks after downsampling, retaining main art."""
    width, height = image.size
    alpha = bytearray(image.getchannel("A").tobytes())
    support = bytearray(value >= 18 for value in alpha)
    for index, value in enumerate(alpha):
        if value < 18:
            alpha[index] = 0
    for start in range(width * height):
        if not support[start]:
            continue
        stack = [start]
        support[start] = 0
        component: list[int] = []
        while stack:
            index = stack.pop()
            component.append(index)
            x = index % width
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
                if neighbor >= 0 and support[neighbor]:
                    support[neighbor] = 0
                    stack.append(neighbor)
        if len(component) < minimum_pixels:
            for index in component:
                alpha[index] = 0
    image.putalpha(Image.frombytes("L", image.size, bytes(alpha)))
    return image


def normalized_cell(item: Image.Image) -> Image.Image:
    """Fit an extracted source item into one transparent 256px atlas cell."""
    scale = min(
        (CELL - PADDING * 2) / item.width,
        (CELL - PADDING * 2) / item.height,
    )
    size = (
        max(1, round(item.width * scale)),
        max(1, round(item.height * scale)),
    )
    item = item.resize(size, Image.Resampling.LANCZOS)
    cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    cell.alpha_composite(item, ((CELL - size[0]) // 2, (CELL - size[1]) // 2))
    return remove_tiny_islands(cell)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source-dir",
        type=Path,
        default=DEFAULT_SOURCE_DIR,
        help="directory containing the five supplied JPEG files",
    )
    parser.add_argument(
        "--asset-dir",
        type=Path,
        default=DEFAULT_ASSET_DIR,
        help="output directory for the two atlases",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    atlas = Image.new("RGBA", (CELL * len(SOURCES), CELL), (0, 0, 0, 0))
    drops = Image.new(
        "RGBA",
        (DROP_CELL * len(SOURCES), DROP_CELL),
        (0, 0, 0, 0),
    )

    for column, (slot, filename) in enumerate(SOURCES):
        source_path = args.source_dir / filename
        if not source_path.is_file():
            raise FileNotFoundError(f"Missing {slot} source: {source_path}")
        cell = normalized_cell(extracted_item(Image.open(source_path), slot))
        atlas.alpha_composite(cell, (column * CELL, 0))
        drop = cell.resize((DROP_CELL, DROP_CELL), Image.Resampling.LANCZOS)
        drops.alpha_composite(drop, (column * DROP_CELL, 0))

    args.asset_dir.mkdir(parents=True, exist_ok=True)
    atlas_path = args.asset_dir / "lava-gear-icons-v1.png"
    drops_path = args.asset_dir / "lava-gear-drops-v1.png"
    atlas.save(atlas_path, optimize=True)
    drops.save(drops_path, optimize=True)
    print(f"Wrote {atlas.size} Lava Set atlas to {atlas_path}")
    print(f"Wrote {drops.size} Lava Set drop atlas to {drops_path}")


if __name__ == "__main__":
    main()
