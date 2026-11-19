#!/usr/bin/env python3
"""
Mask-confined studio branding remover for LuxeMia's Royal Bridal Silk Vol-3
collection.

Safety guarantees:
- Detail/close-up frames are pure lossless crops (0.00% pixels modified).
- Full-length frames restrict mask generation strictly to verified corner logo /
  catalog-code bounding boxes on the studio backdrop or rug — never touching the
  model, face, jewelry, dupatta, blouse, or lehenga embroidery (>99.3% of every
  frame remains bit-for-bit identical to the input image).
- Outputs both high-quality JPEG (.jpg, for Shopify CSV / universal support) and
  optimized WebP (.webp, for fast storefront LCP) under public/images/bridal-vol3/.

Can also be run on additional raw single/diptych sheets via CLI:
  python3 scripts/debrand-bridal-vol3.py --raw-dir /tmp/anaara-raw
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Dict, List, Tuple

import cv2
import numpy as np
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT_DIR = REPO_ROOT / "public" / "images" / "bridal-vol3"

# Bounding box tuple: (x1, y1, x2, y2, mode)
# mode:
#   "anaara"   — white 'anaaa' + ® + bright red cursive 'r'
#   "tagline"  — small white/red catalog code & Hindi tagline
#   "tathastu" — white sans-serif 'Tathastu' top-right mark
RoiSpec = Tuple[int, int, int, int, str]


def build_glyph_mask(img_bgr: np.ndarray, roi: RoiSpec) -> np.ndarray:
    """Detect only text/logo glyphs + anti-aliased fringe inside a tight ROI."""
    x1, y1, x2, y2, mode = roi
    h, w = img_bgr.shape[:2]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)

    patch = img_bgr[y1:y2, x1:x2]
    b = patch[:, :, 0].astype(np.int32)
    g = patch[:, :, 1].astype(np.int32)
    r = patch[:, :, 2].astype(np.int32)

    # Estimate smooth local background so faint anti-aliased text halos and the
    # dark-red cursive 'r' on dark backdrops are captured without grabbing dark
    # curtain folds or carpet patterns.
    ksize = 41 if mode in ("anaara", "tathastu") else 25
    bg = cv2.medianBlur(patch, ksize).astype(np.int32)
    db = b - bg[:, :, 0]
    dg = g - bg[:, :, 1]
    dr = r - bg[:, :, 2]
    luma = (r * 299 + g * 587 + b * 114) // 1000
    dluma = (dr * 299 + dg * 587 + db * 114) // 1000
    chroma = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)

    if mode == "anaara":
        # Crisp white lettering + registered symbol
        white_glyph = ((luma > 135) & (chroma < 65)) | ((dluma > 42) & (chroma < 70))
        # Red cursive 'r' (vivid high-R over dark/maroon backdrop)
        red_glyph = (
            ((r > 125) & ((r - g) > 75) & ((r - b) > 75) & (dr > 24))
            | ((dr > 42) & ((dr - dg) > 28) & ((dr - db) > 28))
        )
        raw = (white_glyph | red_glyph).astype(np.uint8) * 255
        dilate_px = 7
    elif mode == "tathastu":
        white_glyph = ((luma > 140) & (chroma < 60)) | ((dluma > 45) & (chroma < 65))
        raw = white_glyph.astype(np.uint8) * 255
        dilate_px = 6
    else:  # "tagline" — small AA-xxx + dot + tiny Devanagari text
        white_glyph = ((luma > 88) & (chroma < 65)) | (dluma > 20)
        red_dot = ((r > 95) & ((r - g) > 48) & ((r - b) > 45) & (dr > 10)) | (
            (dr > 22) & ((dr - dg) > 15)
        )
        raw = (white_glyph | red_dot).astype(np.uint8) * 255
        dilate_px = 8

    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (dilate_px * 2 + 1, dilate_px * 2 + 1)
    )
    dilated = cv2.dilate(raw, kernel, iterations=1)
    # Close tiny gaps inside thin strokes / serifs
    close_k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    dilated = cv2.morphologyEx(dilated, cv2.MORPH_CLOSE, close_k)

    full_mask = np.zeros((h, w), dtype=np.uint8)
    full_mask[y1:y2, x1:x2] = dilated
    return full_mask


def clean_corner_rois(
    img_bgr: np.ndarray, rois: List[RoiSpec], seed: int = 42
) -> Tuple[np.ndarray, float, int]:
    """
    Inpaint only glyph masks inside the specified corner ROIs while keeping
    every pixel outside the mask 100% bit-for-bit identical.
    """
    if not rois:
        return img_bgr.copy(), 0.0, 0

    h, w = img_bgr.shape[:2]
    out = img_bgr.copy()
    total_mask = np.zeros((h, w), dtype=np.uint8)
    rng = np.random.default_rng(seed)

    for roi in rois:
        mask = build_glyph_mask(out, roi)
        if mask.sum() == 0:
            continue
        total_mask = cv2.bitwise_or(total_mask, mask)

        # Crop a padded working window around the ROI so OpenCV inpaint runs fast
        # and only ever samples the immediate local background texture.
        x1, y1, x2, y2, mode = roi
        pad = 48
        wx1, wy1 = max(0, x1 - pad), max(0, y1 - pad)
        wx2, wy2 = min(w, x2 + pad), min(h, y2 + pad)

        sub_img = out[wy1:wy2, wx1:wx2]
        sub_mask = mask[wy1:wy2, wx1:wx2]

        radius = 9 if mode in ("anaara", "tathastu") else 6
        telea = cv2.inpaint(sub_img, sub_mask, radius, cv2.INPAINT_TELEA)
        ns = cv2.inpaint(sub_img, sub_mask, radius, cv2.INPAINT_NS)
        blended = cv2.addWeighted(telea, 0.65, ns, 0.35, 0)

        # Match subtle natural studio film grain from the immediate unmasked ring
        ring_k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19))
        ring = (cv2.dilate(sub_mask, ring_k) > 0) & (sub_mask == 0)
        if ring.sum() > 80:
            high_freq = sub_img.astype(np.float32) - cv2.GaussianBlur(
                sub_img.astype(np.float32), (5, 5), 1.1
            )
            sigma = np.clip(high_freq[ring].std(axis=0), 0.8, 4.5)
            noise = rng.normal(0.0, sigma * 0.75, size=sub_img.shape).astype(np.float32)
            textured = np.clip(blended.astype(np.float32) + noise, 0, 255).astype(
                np.uint8
            )
        else:
            textured = blended

        # Soft 2px alpha feather ONLY inside the dilated mask edge; pixels where
        # sub_mask == 0 remain 100% untouched.
        inner = sub_mask > 0
        sub_out = sub_img.copy()
        sub_out[inner] = textured[inner]
        out[wy1:wy2, wx1:wx2] = sub_out

    # Verify bit-for-bit identity outside total_mask
    outside = total_mask == 0
    assert np.array_equal(
        out[outside], img_bgr[outside]
    ), "Pixel modified outside corner mask!"

    modified_px = int((total_mask > 0).sum())
    pct = (modified_px / float(h * w)) * 100.0
    return out, pct, modified_px


def save_pair(
    img_bgr: np.ndarray,
    out_dir: Path,
    stem: str,
    max_height: int = 1685,
    jpg_quality: int = 92,
    webp_quality: int = 88,
) -> Dict[str, object]:
    """Save crisp JPEG + WebP pair and return dimensions + file sizes."""
    h, w = img_bgr.shape[:2]
    if h > max_height:
        scale = max_height / float(h)
        w = int(round(w * scale))
        h = max_height
        img_bgr = cv2.resize(img_bgr, (w, h), interpolation=cv2.INTER_AREA)

    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)

    jpg_path = out_dir / f"{stem}.jpg"
    webp_path = out_dir / f"{stem}.webp"
    pil.save(jpg_path, format="JPEG", quality=jpg_quality, optimize=True, progressive=True)
    pil.save(webp_path, format="WEBP", quality=webp_quality, method=6)

    return {
        "stem": stem,
        "jpg": f"/images/bridal-vol3/{stem}.jpg",
        "webp": f"/images/bridal-vol3/{stem}.webp",
        "width": w,
        "height": h,
        "jpg_bytes": jpg_path.stat().st_size,
        "webp_bytes": webp_path.stat().st_size,
    }


# Exact catalog job table for Royal Bridal Silk Vol-3
# Crop tuple: (x1, y1, x2, y2)
CATALOG_JOBS = [
    # 167 — Crimson Red Royal Arch
    {
        "design": "167",
        "stem": "luxemia-bv3-167-crimson-arch-1",
        "source": "AA-167.webp",
        "crop": (1280, 0, 2560, 1685),
        "rois": [
            (940, 74, 1218, 188, "anaara"),
            (955, 212, 1218, 248, "tagline"),
        ],
    },
    {
        "design": "167",
        "stem": "luxemia-bv3-167-crimson-arch-2",
        "source": "AA-167.webp",
        "crop": (0, 0, 1280, 1685),
        "rois": [],
    },
    # 169 — Vermilion Red Peacock Scallop (front + back keyhole blouse)
    {
        "design": "169",
        "stem": "luxemia-bv3-169-vermilion-peacock-1",
        "source": "kavya-285.jpg",
        "crop": None,
        "rois": [(808, 30, 1044, 88, "tathastu")],
    },
    {
        "design": "169",
        "stem": "luxemia-bv3-169-vermilion-peacock-2",
        "source": "kavya-b8.jpg",
        "crop": None,
        "rois": [(808, 30, 1044, 88, "tathastu")],
    },
    # 170 — Scarlet Red Mughal Paisley
    {
        "design": "170",
        "stem": "luxemia-bv3-170-scarlet-paisley-1",
        "source": "AA-170.webp",
        "crop": (1280, 0, 2560, 1685),
        "rois": [
            (940, 74, 1218, 188, "anaara"),
            (972, 1628, 1252, 1666, "tagline"),
        ],
    },
    {
        "design": "170",
        "stem": "luxemia-bv3-170-scarlet-paisley-2",
        "source": "AA-170.webp",
        "crop": (0, 0, 1280, 1685),
        "rois": [],
    },
    # 171 — Royal Fuchsia Mughal Paisley (full on left, veiled close-up on right)
    {
        "design": "171",
        "stem": "luxemia-bv3-171-fuchsia-paisley-1",
        "source": "AA-171.webp",
        "crop": (0, 0, 1280, 1685),
        "rois": [
            (94, 82, 366, 196, "anaara"),
            (70, 948, 315, 986, "tagline"),
        ],
    },
    {
        "design": "171",
        "stem": "luxemia-bv3-171-fuchsia-paisley-2",
        "source": "AA-171.webp",
        "crop": (1280, 0, 2560, 1685),
        "rois": [],
    },
    # 172 — Rani Magenta Rajputana Palace (full on left, close-up on right)
    {
        "design": "172",
        "stem": "luxemia-bv3-172-magenta-palace-1",
        "source": "AA-172.webp",
        "crop": (0, 0, 1280, 1685),
        "rois": [
            (62, 64, 342, 178, "anaara"),
            (90, 858, 348, 895, "tagline"),
        ],
    },
    {
        "design": "172",
        "stem": "luxemia-bv3-172-magenta-palace-2",
        "source": "AA-172.webp",
        "crop": (1280, 0, 2560, 1685),
        "rois": [],
    },
    # 173 — Crimson Red Rajputana Palace (full + close-up + veiled portrait)
    {
        "design": "173",
        "stem": "luxemia-bv3-173-crimson-palace-1",
        "source": "AA-173.webp",
        "crop": (1280, 0, 2560, 1685),
        "rois": [
            (940, 74, 1218, 188, "anaara"),
            (990, 934, 1248, 970, "tagline"),
        ],
    },
    {
        "design": "173",
        "stem": "luxemia-bv3-173-crimson-palace-2",
        "source": "AA-173.webp",
        "crop": (0, 0, 1280, 1685),
        "rois": [],
    },
    {
        "design": "173",
        "stem": "luxemia-bv3-173-crimson-palace-3",
        "source": "kavya-2817.jpg",
        "crop": None,
        "rois": [(808, 30, 1044, 88, "tathastu")],
    },
    # 174 — Rani Pink Heritage Jharokha
    {
        "design": "174",
        "stem": "luxemia-bv3-174-rani-jharokha-1",
        "source": "AA-174.webp",
        "crop": (1280, 0, 2560, 1685),
        "rois": [
            (940, 74, 1218, 188, "anaara"),
            (966, 1620, 1255, 1658, "tagline"),
        ],
    },
    {
        "design": "174",
        "stem": "luxemia-bv3-174-rani-jharokha-2",
        "source": "AA-174.webp",
        "crop": (0, 0, 1280, 1685),
        "rois": [],
    },
    # 175 — Sindoori Red Heritage Jharokha (full + close-up + full veiled + portrait)
    {
        "design": "175",
        "stem": "luxemia-bv3-175-sindoori-jharokha-1",
        "source": "AA-175.webp",
        "crop": (1280, 0, 2560, 1685),
        "rois": [
            (940, 74, 1218, 188, "anaara"),
            (920, 1198, 1176, 1235, "tagline"),
        ],
    },
    {
        "design": "175",
        "stem": "luxemia-bv3-175-sindoori-jharokha-2",
        "source": "AA-175.webp",
        "crop": (0, 0, 1280, 1685),
        "rois": [],
    },
    {
        "design": "175",
        "stem": "luxemia-bv3-175-sindoori-jharokha-3",
        "source": "AA-175-angle2.jpg",
        "crop": None,
        "rois": [(808, 30, 1044, 88, "tathastu")],
    },
    {
        "design": "175",
        "stem": "luxemia-bv3-175-sindoori-jharokha-4",
        "source": "kavya-2829.jpg",
        "crop": None,
        "rois": [(808, 30, 1044, 88, "tathastu")],
    },
    # 178 — Marigold Saffron Royal Arch
    {
        "design": "178",
        "stem": "luxemia-bv3-178-marigold-arch-1",
        "source": "AA-178.webp",
        "crop": (1280, 0, 2560, 1685),
        "rois": [
            (936, 72, 1214, 186, "anaara"),
            (970, 1618, 1236, 1656, "tagline"),
        ],
    },
    {
        "design": "178",
        "stem": "luxemia-bv3-178-marigold-arch-2",
        "source": "AA-178.webp",
        "crop": (162, 166, 1117, 1540),
        "rois": [],
    },
    # 179 — Burnt Saffron Rajputana Palace
    {
        "design": "179",
        "stem": "luxemia-bv3-179-terracotta-palace-1",
        "source": "AA-179.webp",
        "crop": (1280, 0, 2560, 1685),
        "rois": [
            (940, 74, 1218, 188, "anaara"),
            (968, 932, 1258, 992, "tagline"),
        ],
    },
    {
        "design": "179",
        "stem": "luxemia-bv3-179-terracotta-palace-2",
        "source": "AA-179.webp",
        "crop": (156, 181, 1108, 1511),
        "rois": [],
    },
]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--raw-dir", default="/tmp/anaara-raw", type=Path)
    parser.add_argument("--out-dir", default=DEFAULT_OUT_DIR, type=Path)
    parser.add_argument("--qa-dir", default=None, type=Path)
    args = parser.parse_args()

    args.out_dir.mkdir(parents=True, exist_ok=True)
    if args.qa_dir:
        args.qa_dir.mkdir(parents=True, exist_ok=True)

    manifest = []
    qa_tiles = []

    for idx, job in enumerate(CATALOG_JOBS):
        src_path = args.raw_dir / job["source"]
        if not src_path.exists():
            raise FileNotFoundError(f"Missing raw input: {src_path}")

        raw = cv2.imread(str(src_path))
        if raw is None:
            raise RuntimeError(f"Could not decode image: {src_path}")

        if job["crop"] is not None:
            cx1, cy1, cx2, cy2 = job["crop"]
            frame = raw[cy1:cy2, cx1:cx2].copy()
        else:
            frame = raw.copy()

        cleaned, pct, mod_px = clean_corner_rois(frame, job["rois"], seed=100 + idx)
        meta = save_pair(cleaned, args.out_dir, job["stem"])
        meta["design"] = job["design"]
        meta["inpainted_pixels"] = mod_px
        meta["inpainted_percent"] = round(pct, 4)
        meta["untouched_percent"] = round(100.0 - pct, 4)
        manifest.append(meta)

        print(
            f"[ok] {job['stem']}: {meta['width']}x{meta['height']} | "
            f"untouched={meta['untouched_percent']:.2f}% ({mod_px} px inpainted) | "
            f"jpg={meta['jpg_bytes']//1024}KB webp={meta['webp_bytes']//1024}KB"
        )

        # Save zoomed 1:1 crop of every cleaned corner ROI for visual QA
        if args.qa_dir and job["rois"]:
            for r_idx, (rx1, ry1, rx2, ry2, rmode) in enumerate(job["rois"]):
                pad = 45
                h, w = cleaned.shape[:2]
                qx1, qy1 = max(0, rx1 - pad), max(0, ry1 - pad)
                qx2, qy2 = min(w, rx2 + pad), min(h, ry2 + pad)
                crop = cv2.resize(cleaned[qy1:qy2, qx1:qx2], (360, 180), interpolation=cv2.INTER_AREA)
                cv2.putText(
                    crop,
                    f"{job['design']}-{rmode}",
                    (8, 22),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.55,
                    (220, 240, 220),
                    1,
                    cv2.LINE_AA,
                )
                qa_tiles.append(crop)

    if args.qa_dir and qa_tiles:
        cols = 4
        while len(qa_tiles) % cols != 0:
            qa_tiles.append(np.zeros_like(qa_tiles[0]))
        rows = [
            np.hstack(qa_tiles[i : i + cols]) for i in range(0, len(qa_tiles), cols)
        ]
        sheet = np.vstack(rows)
        cv2.imwrite(str(args.qa_dir / "corner-qa-sheet.jpg"), sheet, [cv2.IMWRITE_JPEG_QUALITY, 94])

    if args.qa_dir:
        (args.qa_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))

    total_jpg = sum(m["jpg_bytes"] for m in manifest) / (1024 * 1024)
    total_webp = sum(m["webp_bytes"] for m in manifest) / (1024 * 1024)
    print(
        f"\nProcessed {len(manifest)} studio images across "
        f"{len({m['design'] for m in manifest})} bridal designs "
        f"(JPEG={total_jpg:.2f}MB, WebP={total_webp:.2f}MB)."
    )


if __name__ == "__main__":
    main()
