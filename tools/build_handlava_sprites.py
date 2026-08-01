#!/usr/bin/env python3
"""Normalize the approved Handlava animation art into compact game spritesheets."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


PHASES = ("idle", "extend", "grab", "swing", "throw", "retract")
CELL = 256
SHEET_WIDTH = CELL * 4
SHEET_HEIGHT = CELL

# The source art was composed as four silhouettes without a rigid grid. These
# cuts fall only in transparent gaps and keep every painted pixel intact.
SOURCE_CUTS = {
    "idle": (0, 507, 982, 1472, 1983),
    "extend": (0, 336, 833, 1373, 1983),
    "grab": (0, 507, 981, 1464, 1983),
    "swing": (0, 520, 951, 1414, 1983),
    "throw": (0, 483, 981, 1474, 1983),
    "retract": (0, 565, 1055, 1501, 1983),
}


def opaque_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 10 else 0).getbbox()
    if bbox is None:
        raise ValueError("source frame has no visible pixels")
    return bbox


def clean_fringe(image: Image.Image) -> Image.Image:
    """Remove residual green key spill without repainting the supplied art."""
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha and green > red * 1.22 and green > blue * 1.12:
                alpha = max(0, alpha - min(255, (green - max(red, blue)) * 3))
                pixels[x, y] = (red, min(green, max(red, blue)), blue, alpha)
    return image


def build_phase(source: Path, phase: str) -> Image.Image:
    image = clean_fringe(Image.open(source).convert("RGBA"))
    expected_width = SOURCE_CUTS[phase][-1]
    if image.width != expected_width:
        raise ValueError(f"{source} must be {expected_width}px wide, got {image.width}")

    cuts = SOURCE_CUTS[phase]
    frames: list[Image.Image] = []
    boxes: list[tuple[int, int, int, int]] = []
    for index in range(4):
        frame = image.crop((cuts[index], 0, cuts[index + 1], image.height))
        bbox = opaque_bbox(frame)
        frames.append(frame.crop(bbox))
        boxes.append(bbox)

    max_width = max(frame.width for frame in frames)
    max_height = max(frame.height for frame in frames)
    scale = min(238 / max_width, 220 / max_height)
    sheet = Image.new("RGBA", (SHEET_WIDTH, SHEET_HEIGHT))

    for index, frame in enumerate(frames):
        width = max(1, round(frame.width * scale))
        height = max(1, round(frame.height * scale))
        resized = frame.resize((width, height), Image.Resampling.LANCZOS)
        x = index * CELL + 9
        y = (CELL - height) // 2
        sheet.alpha_composite(resized, (x, y))

    return sheet


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("source_dir", type=Path, help="directory containing idle.png through retract.png")
    parser.add_argument("output_dir", type=Path, help="game asset directory")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for phase in PHASES:
        output = args.output_dir / f"handlava-{phase}-v1.png"
        build_phase(args.source_dir / f"{phase}.png", phase).save(output, optimize=True)
        print(output)


if __name__ == "__main__":
    main()
