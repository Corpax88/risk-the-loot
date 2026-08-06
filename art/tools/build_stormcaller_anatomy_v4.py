"""Assemble the anatomy-first Stormcaller v4 production layers.

Generated source objects are treated as editable art references only. They are
trimmed, fitted to the immutable master landmarks, and restored to the full
1402x1122 canonical canvas before review or publication.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
MASTER_PATH = ROOT / "art/masters/pappa_hammer_master_v1.png"
GENERATED = ROOT / "art/working/legendary/stormcaller/anatomy-v4/generated"
WORK_DIR = ROOT / "art/working/legendary/stormcaller/anatomy-v4/fitted"
RUNTIME = ROOT / "assets/equipment/stormcaller"
EXPORT_ROOT = ROOT / "art/exports"
CANVAS = (1402, 1122)
ORDER = ("cape", "legs", "boots", "chest", "scarf", "hat", "weapon")

# These boxes are tied to the master landmarks, not to an inventory viewport.
# They intentionally include armor volume around the underlying anatomy.
TARGETS = {
    "cape": (92, 205, 885, 885),
    "legs": (198, 468, 902, 1038),
    "chest": (305, 170, 915, 590),
    "scarf": (265, 190, 730, 410),
    "hat": (470, 50, 715, 200),
    "weapon": (370, 255, 1210, 635),
}


def crop_visible(image: Image.Image) -> Image.Image:
    bounds = image.getchannel("A").getbbox()
    if not bounds:
        raise RuntimeError("Generated layer has no visible pixels")
    return image.crop(bounds)


def place_object(source: Image.Image, target: tuple[int, int, int, int]) -> Image.Image:
    obj = crop_visible(source)
    x0, y0, x1, y1 = target
    fitted = obj.resize((x1 - x0, y1 - y0), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    canvas.alpha_composite(fitted, (x0, y0))
    return canvas


def build_boots(source: Image.Image) -> Image.Image:
    # The source contains two perspective-distinct boots. Fit them independently
    # to Pappa's two planted feet instead of treating them as a mirrored pair.
    left = source.crop((120, 285, 565, 990))
    right = source.crop((760, 250, 1245, 915))
    left = crop_visible(left).resize((282, 410), Image.Resampling.LANCZOS)
    right = crop_visible(right).resize((270, 365), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    canvas.alpha_composite(left, (168, 638))
    canvas.alpha_composite(right, (637, 638))
    return canvas


def clear_weapon_hands(weapon: Image.Image) -> Image.Image:
    # Weapon renders above the base, so the handle needs one precise opening for
    # the unchanged master hands. The shaft remains continuous on both sides.
    mask = Image.new("L", CANVAS, 0)
    points = [
        (742, 401),
        (782, 388),
        (834, 397),
        (885, 421),
        (915, 452),
        (912, 490),
        (878, 521),
        (818, 519),
        (770, 495),
        (741, 462),
    ]
    ImageDraw.Draw(mask).polygon(points, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.25))
    alpha = weapon.getchannel("A")
    alpha.paste(0, mask=mask)
    weapon.putalpha(alpha)
    return weapon


def clear_legs_below_knees(legs: Image.Image) -> Image.Image:
    """Keep trousers in Legs; shin armor belongs exclusively to Boots."""
    alpha = legs.getchannel("A")
    draw = ImageDraw.Draw(alpha)
    draw.polygon([(165, 720), (438, 700), (520, 1122), (90, 1122)], fill=0)
    draw.polygon([(625, 690), (915, 690), (1010, 1122), (570, 1122)], fill=0)
    legs.putalpha(alpha)
    return legs


def source_for(slot: str) -> Image.Image:
    path = GENERATED / f"{slot}_cutout.png"
    if not path.exists():
        raise FileNotFoundError(path)
    return Image.open(path).convert("RGBA")


def build_layer(slot: str) -> Image.Image:
    source = source_for(slot)
    if slot == "boots":
        return build_boots(source)
    layer = place_object(source, TARGETS[slot])
    if slot == "weapon":
        return clear_weapon_hands(layer)
    if slot == "legs":
        return clear_legs_below_knees(layer)
    return layer


def build(publish: bool) -> None:
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    master = Image.open(MASTER_PATH).convert("RGBA")
    if master.size != CANVAS:
        raise RuntimeError(f"Unexpected master canvas: {master.size}")

    layers = {slot: build_layer(slot) for slot in ORDER}
    for slot, layer in layers.items():
        layer.save(WORK_DIR / f"legendary_stormcaller_{slot}_02.png", "PNG", optimize=True)

    preview = Image.alpha_composite(layers["cape"], master)
    for slot in ("legs", "boots", "chest", "scarf", "hat", "weapon"):
        preview = Image.alpha_composite(preview, layers[slot])
    preview.save(WORK_DIR / "legendary_stormcaller_set_02_preview.png", "PNG", optimize=True)

    for slot in ORDER:
        if slot == "cape":
            review = Image.alpha_composite(layers[slot], master)
        else:
            review = Image.alpha_composite(master, layers[slot])
        review.save(WORK_DIR / f"review_{slot}.png", "PNG", optimize=True)

    manifest = {
        "master": str(MASTER_PATH.relative_to(ROOT)).replace("\\", "/"),
        "canvas": list(CANVAS),
        "version": "stormcaller-anatomy-v4",
        "layerOrder": list(ORDER),
        "targets": {key: list(value) for key, value in TARGETS.items()},
        "boots": {
            "leftTarget": [168, 638, 450, 1048],
            "rightTarget": [637, 638, 907, 1003],
        },
        "masterModified": False,
    }
    (WORK_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    if publish:
        for slot, layer in layers.items():
            filename = f"legendary_stormcaller_{slot}_01.png"
            layer.save(RUNTIME / filename, "PNG", optimize=True)
            export = EXPORT_ROOT / slot / filename
            export.parent.mkdir(parents=True, exist_ok=True)
            layer.save(export, "PNG", optimize=True)
        preview.save(
            ROOT / "art/working/legendary/stormcaller/legendary_stormcaller_set_01_preview.png",
            "PNG",
            optimize=True,
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--publish", action="store_true")
    build(parser.parse_args().publish)
