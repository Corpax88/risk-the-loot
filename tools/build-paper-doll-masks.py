"""Build animation-aligned equipment masks for Pappa Hammer.

The source sprite sheets are 4x2 atlases with 512px cells. Each generated mask
keeps that exact layout so the browser can recolor the equipped silhouette once
per loadout, then render a small cached atlas during gameplay.
"""

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUTPUT = ASSETS / "paper-doll"
DEBUG = ROOT / "tmp" / "paper-doll"
CELL = 512
POSES = ("idle", "run", "attack")
SLOTS = ("coat", "boots", "scarf", "hat", "hammer")


HAT_BOXES = {
    "idle": [(110, 48, 260, 125), (120, 50, 265, 126), (116, 51, 262, 126), (114, 48, 265, 125)] * 2,
    "run": [
        (150, 51, 308, 133), (168, 65, 320, 143), (164, 71, 321, 148), (166, 70, 320, 147),
        (150, 53, 310, 135), (159, 68, 318, 148), (154, 53, 316, 136), (154, 52, 316, 136),
    ],
    "attack": [
        (116, 105, 260, 174), (210, 137, 344, 201), (295, 136, 430, 198), (120, 141, 266, 207),
        (125, 151, 270, 214), (220, 145, 345, 205), (165, 114, 305, 181), (140, 111, 285, 181),
    ],
}


HAMMER_BOXES = {
    "idle": [(342, 137, 500, 287)] * 8,
    "run": [(336, 136, 500, 294)] * 8,
    "attack": [
        (333, 176, 484, 326), (88, 178, 195, 326), (86, 61, 258, 216), (371, 207, 512, 363),
        (338, 226, 503, 381), (47, 128, 215, 307), (327, 221, 474, 402), (337, 201, 485, 352),
    ],
}


BOOT_BOXES = {
    "idle": [[(55, 382, 142, 512), (218, 356, 333, 482)]] * 8,
    "run": [
        [(73, 330, 148, 424), (204, 374, 326, 500)],
        [(88, 332, 164, 428), (217, 375, 341, 500)],
        [(88, 332, 164, 428), (218, 375, 342, 500)],
        [(88, 332, 164, 428), (220, 375, 344, 500)],
        [(80, 332, 154, 428), (196, 375, 330, 500)],
        [(55, 400, 172, 512), (224, 394, 356, 512)],
        [(77, 332, 157, 426), (206, 374, 340, 500)],
        [(78, 332, 158, 426), (218, 374, 350, 500)],
    ],
    "attack": [
        [(45, 380, 140, 500), (214, 360, 330, 480)],
        [(100, 380, 210, 500), (310, 360, 426, 480)],
        [(100, 380, 210, 500), (316, 360, 430, 480)],
        [(92, 380, 190, 500), (338, 360, 450, 480)],
        [(70, 380, 175, 500), (340, 360, 458, 482)],
        [(145, 395, 235, 512), (340, 375, 445, 490)],
        [(65, 382, 175, 500), (302, 360, 425, 482)],
        [(65, 380, 178, 500), (305, 358, 435, 482)],
    ],
}


DEBUG_COLORS = {
    "coat": (62, 137, 255, 188),
    "boots": (236, 73, 190, 205),
    "scarf": (48, 220, 112, 210),
    "hat": (255, 78, 72, 205),
    "hammer": (255, 210, 58, 205),
}


def color_flags(pixel):
    r, g, b, a = pixel
    if a < 18:
        return False, False, False, False, False
    highest = max(r, g, b)
    lowest = min(r, g, b)
    red = r > 48 and g < r * .53 and b < r * .66 and r - lowest > 26
    blue = b > 24 and b > r * 1.16 and b > g * 1.04 and b - r > 9
    gold = r > 78 and g > 48 and r > g * 1.03 and g > b * 1.24 and r - b > 34
    cream = r > 116 and g > 98 and b > 78 and highest - lowest < 82
    dark = highest < 67
    return red, blue, gold, cream, dark


def component_indices(binary):
    width = height = CELL
    seen = bytearray(width * height)
    components = []
    for start, enabled in enumerate(binary):
        if not enabled or seen[start]:
            continue
        seen[start] = 1
        queue = deque([start])
        points = []
        while queue:
            index = queue.popleft()
            points.append(index)
            x = index % width
            y = index // width
            for neighbor in (
                index - 1 if x else -1,
                index + 1 if x + 1 < width else -1,
                index - width if y else -1,
                index + width if y + 1 < height else -1,
            ):
                if neighbor >= 0 and binary[neighbor] and not seen[neighbor]:
                    seen[neighbor] = 1
                    queue.append(neighbor)
        components.append(points)
    return components


def box_contains(box, x, y):
    return box[0] <= x < box[2] and box[1] <= y < box[3]


def build_frame_masks(frame, pose, frame_index):
    pixels = list(frame.get_flattened_data())
    alpha = frame.getchannel("A")
    flags = [color_flags(pixel) for pixel in pixels]
    hat_box = HAT_BOXES[pose][frame_index]
    hammer_box = HAMMER_BOXES[pose][frame_index]
    boot_boxes = BOOT_BOXES[pose][frame_index]

    red_binary = bytearray(flag[0] for flag in flags)
    red_components = component_indices(red_binary)
    red_components.sort(key=len, reverse=True)
    scarf_points = set()
    if red_components:
        largest = len(red_components[0])
        for component in red_components:
            ys = [point // CELL for point in component]
            if len(component) >= max(18, largest // 8) and min(ys) < 330:
                scarf_points.update(component)

    masks = {slot: Image.new("L", (CELL, CELL), 0) for slot in SLOTS}
    mask_pixels = {slot: bytearray(CELL * CELL) for slot in SLOTS}
    for index, pixel_alpha in enumerate(alpha.get_flattened_data()):
        if pixel_alpha < 18:
            continue
        x = index % CELL
        y = index // CELL
        red, blue, gold, cream, dark = flags[index]
        in_hat = box_contains(hat_box, x, y)
        in_hammer = box_contains(hammer_box, x, y)
        in_boot = any(box_contains(box, x, y) for box in boot_boxes)

        if blue and not in_hat and not in_hammer and not in_boot:
            mask_pixels["coat"][index] = pixel_alpha
        if in_boot and (red or cream):
            mask_pixels["boots"][index] = pixel_alpha
        if index in scarf_points and red:
            mask_pixels["scarf"][index] = pixel_alpha
        if in_hat and (blue or dark):
            mask_pixels["hat"][index] = pixel_alpha
        if in_hammer and (blue or dark):
            mask_pixels["hammer"][index] = pixel_alpha

    dilation = {"coat": 3, "boots": 5, "scarf": 3, "hat": 3, "hammer": 5}
    for slot, mask in masks.items():
        mask.frombytes(bytes(mask_pixels[slot]))
        grown = mask.filter(ImageFilter.MaxFilter(dilation[slot]))
        # Keep every soft edge inside the painted source silhouette.
        masks[slot] = Image.composite(grown, Image.new("L", (CELL, CELL), 0), alpha)
    return masks


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    DEBUG.mkdir(parents=True, exist_ok=True)
    for pose in POSES:
        source_path = ASSETS / f"pappa-hammer-{pose}-v2.png"
        source = Image.open(source_path).convert("RGBA")
        atlases = {slot: Image.new("L", source.size, 0) for slot in SLOTS}
        debug = source.copy()
        for frame_index in range(8):
            x = frame_index % 4 * CELL
            y = frame_index // 4 * CELL
            frame = source.crop((x, y, x + CELL, y + CELL))
            masks = build_frame_masks(frame, pose, frame_index)
            for slot, mask in masks.items():
                atlases[slot].paste(mask, (x, y))
                tint = Image.new("RGBA", (CELL, CELL), DEBUG_COLORS[slot])
                tint.putalpha(mask.point(lambda value: value * DEBUG_COLORS[slot][3] // 255))
                debug.alpha_composite(tint, (x, y))
        for slot, atlas in atlases.items():
            rgba = Image.new("RGBA", atlas.size, (255, 255, 255, 0))
            rgba.putalpha(atlas)
            rgba.save(OUTPUT / f"{pose}-{slot}.png", optimize=True)
        debug.save(DEBUG / f"{pose}-masks.png", optimize=True)
    print(f"Built {len(POSES) * len(SLOTS)} masks in {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
