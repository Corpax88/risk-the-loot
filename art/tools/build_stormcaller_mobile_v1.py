from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw


ROOT = Path(__file__).resolve().parents[2]
MASTER = ROOT / "assets" / "pappa-hammer-player-mobile-v1.png"
WORK = ROOT / "art" / "working" / "legendary" / "stormcaller" / "mobile-v1"
FULL_REFERENCE = WORK / "transparent-v2" / "stormcaller_full.png"
ISOLATED = WORK / "transparent-v2"
RUNTIME = ROOT / "assets" / "equipment" / "stormcaller"
EXPORTS = ROOT / "art" / "exports"

CANVAS = (768, 768)
LAYER_ORDER = ("cape", "legs", "boots", "chest", "scarf", "hat", "weapon")

# All masks are defined once against the approved 768x768 Pappa master. Every
# Stormcaller layer is cut from the same dressed reference, so proportions and
# perspective cannot drift independently between slots.
ADD_SHAPES = {
    "cape": [
        [(18, 306), (72, 220), (168, 142), (286, 126), (354, 190),
         (382, 378), (334, 548), (208, 614), (58, 594), (24, 470)],
    ],
    "legs": [
        [(154, 318), (564, 318), (604, 482), (574, 596), (474, 620),
         (382, 548), (314, 570), (188, 622), (116, 532)],
    ],
    "boots": [
        [(108, 444), (302, 438), (320, 700), (254, 744), (92, 736), (82, 570)],
        [(414, 432), (588, 436), (616, 676), (552, 716), (404, 690)],
    ],
    "chest": [
        [(168, 134), (460, 118), (558, 190), (586, 318), (548, 388),
         (482, 376), (422, 338), (326, 370), (220, 350), (166, 266)],
    ],
    "scarf": [
        [(108, 116), (466, 110), (492, 210), (444, 260), (304, 246),
         (184, 226), (100, 196)],
    ],
    "hat": [
        [(270, 22), (432, 18), (456, 154), (408, 176), (274, 158)],
    ],
    "weapon": [
        [(42, 290), (768, 290), (768, 354), (42, 354)],
        [(576, 164), (768, 164), (768, 452), (576, 452)],
    ],
}

SUBTRACT_SHAPES = {
    # Keep the approved master's face, beard and both hands untouched.
    "scarf": [
        [(286, 72), (440, 74), (466, 168), (428, 224), (328, 222), (278, 170)],
    ],
    "chest": [
        [(432, 258), (566, 258), (582, 354), (438, 368)],
    ],
}


def scaled_reference() -> Image.Image:
    source = Image.open(FULL_REFERENCE).convert("RGBA")
    return source.resize(CANVAS, Image.Resampling.LANCZOS)


def fit_isolated(slot: str, rect: tuple[int, int, int, int]) -> Image.Image:
    source = Image.open(ISOLATED / f"{slot}.png").convert("RGBA")
    bounds = source.getchannel("A").getbbox()
    if not bounds:
        raise ValueError(f"{slot} source has no visible pixels")
    source = source.crop(bounds)
    left, top, right, bottom = rect
    scale = min((right - left) / source.width, (bottom - top) / source.height)
    size = (round(source.width * scale), round(source.height * scale))
    source = source.resize(size, Image.Resampling.LANCZOS)
    x = left + ((right - left) - source.width) // 2
    y = top + ((bottom - top) - source.height) // 2
    result = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    result.alpha_composite(source, (x, y))
    return result


def cut_layer(source: Image.Image, slot: str) -> Image.Image:
    mask = Image.new("L", CANVAS, 0)
    draw = ImageDraw.Draw(mask)
    for polygon in ADD_SHAPES[slot]:
        draw.polygon(polygon, fill=255)
    for polygon in SUBTRACT_SHAPES.get(slot, ()):
        draw.polygon(polygon, fill=0)

    alpha = source.getchannel("A")
    alpha = Image.composite(alpha, Image.new("L", CANVAS, 0), mask)
    layer = source.copy()
    layer.putalpha(alpha)
    return layer


def reveal_master_hands(layer: Image.Image, master: Image.Image) -> Image.Image:
    hand_region = Image.new("L", CANVAS, 0)
    draw = ImageDraw.Draw(hand_region)
    draw.polygon([(414, 238), (508, 232), (526, 342), (420, 354)], fill=255)
    draw.polygon([(494, 232), (588, 236), (596, 348), (500, 354)], fill=255)
    exact_hands = ImageChops.multiply(master.getchannel("A"), hand_region)
    result = layer.copy()
    result.putalpha(ImageChops.subtract(result.getchannel("A"), exact_hands))
    return result


def save_layer(slot: str, image: Image.Image) -> None:
    name = f"legendary_stormcaller_{slot}_01.png"
    runtime_path = RUNTIME / name
    export_path = EXPORTS / slot / name
    runtime_path.parent.mkdir(parents=True, exist_ok=True)
    export_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(runtime_path, optimize=True)
    image.save(export_path, optimize=True)


def build() -> None:
    master = Image.open(MASTER).convert("RGBA")
    if master.size != CANVAS:
        raise ValueError(f"master must be {CANVAS}, got {master.size}")

    dressed = scaled_reference()
    built = {slot: cut_layer(dressed, slot) for slot in LAYER_ORDER}
    built["legs"] = fit_isolated("legs", (82, 286, 620, 720))
    built["boots"] = fit_isolated("boots", (58, 390, 632, 760))
    built["weapon"] = reveal_master_hands(built["weapon"], master)
    for slot, image in built.items():
        save_layer(slot, image)

    preview = Image.new("RGBA", CANVAS, (18, 22, 29, 255))
    preview.alpha_composite(built["cape"])
    preview.alpha_composite(master)
    for slot in LAYER_ORDER[1:]:
        preview.alpha_composite(built[slot])
    preview.save(WORK / "legendary_stormcaller_mobile_v1_preview.png", optimize=True)


if __name__ == "__main__":
    build()
