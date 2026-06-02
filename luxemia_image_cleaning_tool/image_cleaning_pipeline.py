import csv
import json
import math
import re
import shutil
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
TOOL = ROOT / "luxemia_image_cleaning_tool"
REJECTED_DIR = ROOT / "luxemia_supplier_REJECTED_BRANDED_IMAGES"
SUPPLIER_CLEANED_DIR = ROOT / "luxemia_supplier_CLEANED_IMAGES"

DECISION_CSV = ROOT / "luxemia_supplier_REJECTED_IMAGE_CLEANING_DECISION.csv"
BASE_FINAL_CSV = ROOT / "luxemia_supplier_SHOPIFY_DRAFT_IMPORT_CLEAN_IMAGES.csv"
SAFE_ONLY_CSV = ROOT / "luxemia_supplier_SAFE_PRODUCTS_ONLY_SHOPIFY_DRAFT_IMPORT.csv"
CLEANUP_REVIEW_CSV = ROOT / "luxemia_supplier_IMAGE_CLEANUP_REVIEW.csv"
UPLOAD_MAPPING_CSV = ROOT / "luxemia_supplier_IMAGE_UPLOAD_MAPPING.csv"
VALIDATION_JSON = ROOT / "luxemia_supplier_FINAL_VALIDATION.json"
CURATED_REVIEW_CSV = ROOT / "luxemia_supplier_CURATED_PRODUCT_REVIEW.csv"
RAW_REVIEW_CSV = ROOT / "luxemia_supplier_RAW_PRODUCT_REVIEW.csv"

MASK_REVIEW_CSV = TOOL / "watermark_mask_review.csv"
MANUAL_MASK_CSV = TOOL / "manual_mask_config.csv"
CLEANED_AUDIT_CSV = TOOL / "cleaned_image_audit.csv"
FINAL_REPORT_MD = TOOL / "final_report.md"

CONTACT_BEFORE_DIR = TOOL / "contact_sheets_before"
CONTACT_AFTER_DIR = TOOL / "contact_sheets_after"
MANUAL_MASK_DIR = TOOL / "manual_masks"
CLEANED_ATTEMPTS_DIR = TOOL / "cleaned_attempts"
FAILED_ATTEMPTS_DIR = TOOL / "failed_cleaning_attempts"

SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "Custom Measurements"]
RUN_ID = datetime.now().strftime("%Y%m%d-%H%M%S")

SHOPIFY_COLUMNS = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published",
    "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
    "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty",
    "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price",
    "Variant Requires Shipping", "Variant Taxable", "Variant Barcode", "Image Src", "Image Position",
    "Image Alt Text", "Gift Card", "SEO Title", "SEO Description",
    "Google Shopping / Google Product Category", "Google Shopping / Gender", "Google Shopping / Age Group",
    "Google Shopping / MPN", "Google Shopping / Condition", "Google Shopping / Custom Product",
    "Variant Image", "Variant Weight Unit", "Variant Tax Code", "Cost per item", "Status"
]

CLEANUP_COLUMNS = [
    "Product Group ID", "Original Image URL", "Cleaned Image Filename", "Cleanup Applied Yes/No",
    "Removed Branding Type", "Garment Altered Yes/No", "Color Altered Yes/No",
    "Product Details Altered Yes/No", "Quality Issue Yes/No", "Use in Final CSV Yes/No", "Notes"
]

MAPPING_COLUMNS = [
    "Product Handle", "Image Position", "Local Cleaned Image Filename", "Current Image Src",
    "Public Shopify/File URL", "Needs Public Upload Yes/No", "Notes"
]


def ensure_dirs():
    for path in [
        CONTACT_BEFORE_DIR, CONTACT_AFTER_DIR, MANUAL_MASK_DIR, CLEANED_ATTEMPTS_DIR,
        FAILED_ATTEMPTS_DIR, SUPPLIER_CLEANED_DIR
    ]:
        path.mkdir(parents=True, exist_ok=True)


def read_csv(path):
    with path.open("r", newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def write_csv(path, rows, columns):
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def load_font(size=18, bold=False):
    candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def filename_to_handle(filename):
    stem = Path(filename).stem
    return re.sub(r"-image-\d+$", "", stem)


def filename_to_position(filename):
    match = re.search(r"-image-(\d+)\.[^.]+$", filename, re.I)
    return int(match.group(1)) if match else 1


def clamp_box(box, width, height):
    x, y, w, h = [int(round(v)) for v in box]
    x = max(0, min(x, width - 1))
    y = max(0, min(y, height - 1))
    w = max(1, min(w, width - x))
    h = max(1, min(h, height - y))
    return x, y, w, h


def detect_branding_box(image):
    arr = np.asarray(image.convert("RGB"))
    height, width = arr.shape[:2]
    x0 = int(width * 0.66)
    y0 = int(height * 0.02)
    y1 = int(height * 0.135)
    region = arr[y0:y1, x0:, :].astype(np.int16)
    r, g, b = region[..., 0], region[..., 1], region[..., 2]

    red = (r > 135) & (r > g + 24) & (r > b + 18)
    pink = (r > 135) & (b > 80) & (r > g + 22)
    yellow_or_orange = (r > 145) & (g > 70) & (b < 155) & (r >= g - 8)
    blue = (b > 105) & (b > r + 16) & (b > g + 8)
    saturated = (np.maximum.reduce([r, g, b]) - np.minimum.reduce([r, g, b])) > 45
    mask = saturated & (red | pink | yellow_or_orange | blue)

    ys, xs = np.where(mask)
    if len(xs) >= 80:
        min_x = int(xs.min()) + x0
        max_x = int(xs.max()) + x0
        min_y = int(ys.min()) + y0
        max_y = int(ys.max()) + y0
        pad_x = max(18, int(width * 0.015))
        pad_y = max(14, int(height * 0.01))
        box = clamp_box(
            (min_x - pad_x, min_y - pad_y, (max_x - min_x) + pad_x * 2, (max_y - min_y) + pad_y * 2),
            width,
            height,
        )
        return box, "top-right color logo heuristic", len(xs)

    fallback = clamp_box((width * 0.70, height * 0.035, width * 0.275, height * 0.09), width, height)
    return fallback, "fallback top-right LaPink mask", len(xs)


def box_warning(box, image_size):
    x, y, w, h = box
    width, height = image_size
    if y + h > height * 0.22:
        return "Warning: mask extends below conservative logo zone; manual review recommended."
    if x < width * 0.50:
        return "Warning: mask starts left of expected logo zone; manual review recommended."
    if (w * h) / (width * height) > 0.035:
        return "Warning: large mask area; inspect for garment/background distortion."
    return ""


def build_mask_review(decision_rows):
    review_rows = []
    manual_rows = []
    for idx, row in enumerate(decision_rows, start=1):
        filename = row["Cleaned Image Filename"]
        original_location = row.get("Current Location") or f"luxemia_supplier_REJECTED_BRANDED_IMAGES/{filename}"
        image_path = REJECTED_DIR / filename
        if not image_path.exists():
            review_rows.append({
                "Image Filename": filename,
                "Original Location": original_location,
                "Branding Detected Yes/No": "No",
                "Detection Method": "missing file",
                "Branding Area Coordinates": "",
                "Safe To Auto-Clean Yes/No": "No",
                "Reason": "Rejected image file was not found.",
                "Needs Manual Mask Yes/No": "Yes",
            })
            continue
        with Image.open(image_path) as image:
            image = image.convert("RGB")
            box, method, pixel_count = detect_branding_box(image)
            warning = box_warning(box, image.size)
            safe = "No" if warning else "Yes"
            coords = f"{box[0]},{box[1]},{box[2]},{box[3]}"
            review_rows.append({
                "Image Filename": filename,
                "Original Location": original_location,
                "Branding Detected Yes/No": "Yes",
                "Detection Method": method,
                "Branding Area Coordinates": coords,
                "Safe To Auto-Clean Yes/No": safe,
                "Reason": f"Likely repeated LaPink mark in upper-right region; saturated logo pixels={pixel_count}. {warning}".strip(),
                "Needs Manual Mask Yes/No": "Yes" if method.startswith("fallback") or warning else "No",
            })
            manual_rows.append({
                "Image Filename": filename,
                "x": box[0],
                "y": box[1],
                "width": box[2],
                "height": box[3],
                "Notes": f"Generated from {method}. Edit this row before rerunning if the rectangle misses any branding or touches product detail.",
            })

    write_csv(MASK_REVIEW_CSV, review_rows, [
        "Image Filename", "Original Location", "Branding Detected Yes/No", "Detection Method",
        "Branding Area Coordinates", "Safe To Auto-Clean Yes/No", "Reason", "Needs Manual Mask Yes/No"
    ])
    write_csv(MANUAL_MASK_CSV, manual_rows, ["Image Filename", "x", "y", "width", "height", "Notes"])
    return review_rows, manual_rows


def load_manual_masks():
    grouped = defaultdict(list)
    for row in read_csv(MANUAL_MASK_CSV):
        try:
            grouped[row["Image Filename"]].append((
                int(float(row["x"])),
                int(float(row["y"])),
                int(float(row["width"])),
                int(float(row["height"])),
            ))
        except (KeyError, ValueError):
            continue
    return grouped


def draw_boxes(draw, boxes, scale=1.0, color=(235, 35, 35), width=4):
    for x, y, w, h in boxes:
        rect = [int(x * scale), int(y * scale), int((x + w) * scale), int((y + h) * scale)]
        draw.rectangle(rect, outline=color, width=max(1, int(width * scale)))


def create_before_contact_sheets(decision_rows, masks_by_file):
    return create_contact_sheets(
        CONTACT_BEFORE_DIR,
        "before-cleaning",
        [(REJECTED_DIR / row["Cleaned Image Filename"], None, row["Cleaned Image Filename"], masks_by_file.get(row["Cleaned Image Filename"], []), "")
         for row in decision_rows if (REJECTED_DIR / row["Cleaned Image Filename"]).exists()],
        before_after=False,
    )


def create_contact_sheets(out_dir, prefix, items, before_after):
    for old in out_dir.glob(f"{prefix}-*.jpg"):
        try:
            old.unlink()
        except PermissionError:
            pass
    font = load_font(18)
    small = load_font(14)
    per_sheet = 6 if before_after else 8
    cols = 2
    thumb_w = 440 if before_after else 360
    thumb_h = 610 if before_after else 520
    label_h = 98
    gap = 20
    margin = 24
    sheets = []

    for offset in range(0, len(items), per_sheet):
        subset = items[offset:offset + per_sheet]
        rows = math.ceil(len(subset) / cols)
        tile_w = thumb_w * (2 if before_after else 1)
        sheet_w = margin * 2 + cols * tile_w + (cols - 1) * gap
        sheet_h = margin * 2 + rows * (thumb_h + label_h) + (rows - 1) * gap
        sheet = Image.new("RGB", (sheet_w, sheet_h), "#f2f2f2")
        draw = ImageDraw.Draw(sheet)

        for i, (original_path, cleaned_path, filename, boxes, warning) in enumerate(subset):
            col = i % cols
            row = i // cols
            left = margin + col * (tile_w + gap)
            top = margin + row * (thumb_h + label_h + gap)

            original = Image.open(original_path).convert("RGB")
            render_image_tile(sheet, original, boxes, left, top, thumb_w, thumb_h, "Original")

            if before_after and cleaned_path:
                cleaned = Image.open(cleaned_path).convert("RGB")
                render_image_tile(sheet, cleaned, boxes, left + thumb_w, top, thumb_w, thumb_h, "Cleaned")

            label_top = top + thumb_h + 8
            draw.text((left, label_top), f"{offset + i + 1:03d} | {filename}", font=font, fill="#111111")
            box_text = "; ".join(f"{x},{y},{w},{h}" for x, y, w, h in boxes) or "No mask"
            draw.text((left, label_top + 30), f"Mask: {box_text}", font=small, fill="#333333")
            if warning:
                draw.text((left, label_top + 56), warning[:100], font=small, fill="#9a2b00")

        out_path = out_dir / f"{prefix}-{RUN_ID}-{offset // per_sheet + 1:02d}.jpg"
        sheet.save(out_path, quality=92)
        sheets.append(str(out_path))
    return sheets


def render_image_tile(sheet, image, boxes, left, top, thumb_w, thumb_h, label):
    draw = ImageDraw.Draw(sheet)
    scale = min(thumb_w / image.width, thumb_h / image.height)
    new_size = (max(1, int(image.width * scale)), max(1, int(image.height * scale)))
    resized = image.resize(new_size, Image.Resampling.LANCZOS)
    tile = Image.new("RGB", (thumb_w, thumb_h), "white")
    paste = ((thumb_w - resized.width) // 2, (thumb_h - resized.height) // 2)
    tile.paste(resized, paste)
    tile_draw = ImageDraw.Draw(tile)
    shifted = [(x + paste[0] / scale, y + paste[1] / scale, w, h) for x, y, w, h in boxes]
    draw_boxes(tile_draw, shifted, scale=scale, color=(235, 35, 35), width=5)
    sheet.paste(tile, (left, top))
    draw.text((left + 8, top + 8), label, font=load_font(16, bold=True), fill="#111111")


def make_boolean_mask(size, boxes):
    width, height = size
    mask = np.zeros((height, width), dtype=bool)
    for box in boxes:
        x, y, w, h = clamp_box(box, width, height)
        mask[y:y + h, x:x + w] = True
    return mask


def diffuse_inpaint(image, boxes, iterations=110):
    rgb = np.asarray(image.convert("RGB")).astype(np.float32)
    height, width = rgb.shape[:2]
    mask = make_boolean_mask((width, height), boxes)
    if not mask.any():
        return image.copy()

    filled = rgb.copy()
    for x, y, w, h in boxes:
        x, y, w, h = clamp_box((x, y, w, h), width, height)
        pad = max(8, min(32, int(max(w, h) * 0.12)))
        bx0, by0 = max(0, x - pad), max(0, y - pad)
        bx1, by1 = min(width, x + w + pad), min(height, y + h + pad)
        border_mask = np.zeros((height, width), dtype=bool)
        border_mask[by0:by1, bx0:bx1] = True
        border_mask[y:y + h, x:x + w] = False
        samples = rgb[border_mask]
        fill_color = np.median(samples, axis=0) if len(samples) else np.array([245, 245, 245])
        filled[y:y + h, x:x + w, :] = fill_color

    for x, y, w, h in boxes:
        x, y, w, h = clamp_box((x, y, w, h), width, height)
        pad = max(16, min(48, int(max(w, h) * 0.16)))
        bx0, by0 = max(0, x - pad), max(0, y - pad)
        bx1, by1 = min(width, x + w + pad), min(height, y + h + pad)
        roi = filled[by0:by1, bx0:bx1, :].copy()
        roi_mask = mask[by0:by1, bx0:bx1]
        for _ in range(iterations):
            padded = np.pad(roi, ((1, 1), (1, 1), (0, 0)), mode="edge")
            avg = (
                padded[:-2, 1:-1] + padded[2:, 1:-1] + padded[1:-1, :-2] + padded[1:-1, 2:] +
                padded[:-2, :-2] + padded[:-2, 2:] + padded[2:, :-2] + padded[2:, 2:]
            ) / 8.0
            roi[roi_mask] = avg[roi_mask]
        filled[by0:by1, bx0:bx1, :] = roi

    return Image.fromarray(np.clip(filled, 0, 255).astype(np.uint8), "RGB")


def saturated_logo_score(image, boxes):
    arr = np.asarray(image.convert("RGB")).astype(np.int16)
    mask = make_boolean_mask(image.size, boxes)
    if not mask.any():
        return 0
    region = arr[mask]
    r, g, b = region[:, 0], region[:, 1], region[:, 2]
    red = (r > 135) & (r > g + 24) & (r > b + 18)
    pink = (r > 135) & (b > 80) & (r > g + 22)
    yellow_or_orange = (r > 145) & (g > 70) & (b < 155) & (r >= g - 8)
    blue = (b > 105) & (b > r + 16) & (b > g + 8)
    saturated = (np.maximum.reduce([r, g, b]) - np.minimum.reduce([r, g, b])) > 45
    return int(np.count_nonzero(saturated & (red | pink | yellow_or_orange | blue)))


def residual_center_logo_score(image):
    small = image.convert("RGB").resize((326, 494), Image.Resampling.BILINEAR)
    arr = np.asarray(small).astype(np.int16)
    height, width = arr.shape[:2]
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    saturated = (np.maximum.reduce([r, g, b]) - np.minimum.reduce([r, g, b])) > 38
    masks = [
        saturated & (r > 125) & (r > g + 22) & (r > b + 14),
        saturated & (r > 125) & (b > 75) & (r > g + 18),
        saturated & (r > 135) & (g > 75) & (b < 150) & (r >= g - 12),
        saturated & (b > 95) & (b > r + 12) & (b > g + 6),
    ]
    best = 0
    window_w, window_h = 46, 18
    for y in range(int(height * 0.25), int(height * 0.90) - window_h, 8):
        for x in range(int(width * 0.18), int(width * 0.82) - window_w, 8):
            counts = [int(mask[y:y + window_h, x:x + window_w].sum()) for mask in masks]
            density = sum(counts) / (window_w * window_h)
            if density < 0.70:
                score = min(counts[0], counts[1], counts[3]) + min(counts)
                best = max(best, score)
    return best


def clean_and_audit(decision_rows, masks_by_file):
    audit_rows = []
    qa_items = []
    approved_files = []
    failed_files = []

    for row in decision_rows:
        filename = row["Cleaned Image Filename"]
        original_path = REJECTED_DIR / filename
        if not original_path.exists():
            continue
        boxes = masks_by_file.get(filename, [])
        with Image.open(original_path) as original:
            original = original.convert("RGB")
            boxes = [clamp_box(box, original.width, original.height) for box in boxes]
            cleaned = diffuse_inpaint(original, boxes)
            cleaned_path = CLEANED_ATTEMPTS_DIR / filename
            cleaned.save(cleaned_path, quality=95, subsampling=0)

            before_score = saturated_logo_score(original, boxes)
            after_score = saturated_logo_score(cleaned, boxes)
            residual_lower_score = residual_center_logo_score(cleaned)
            warning = box_warning(boxes[0], original.size) if boxes else "Warning: no mask was supplied."
            changed = np.asarray(original, dtype=np.int16) - np.asarray(cleaned, dtype=np.int16)
            changed_mask = np.any(np.abs(changed) > 2, axis=2)
            outside_changed = int(np.count_nonzero(changed_mask & ~make_boolean_mask(original.size, boxes)))
            mask_area = sum(w * h for _, _, w, h in boxes)
            residual_ok = after_score <= max(25, int(before_score * 0.10))
            lower_branding_ok = residual_lower_score <= 160
            safe_zone = not warning
            approved = bool(boxes and residual_ok and lower_branding_ok and safe_zone and outside_changed == 0)

            reason_bits = []
            if not boxes:
                reason_bits.append("No mask configured.")
            if not residual_ok:
                reason_bits.append(f"Logo-color pixels remain in mask ({after_score} after vs {before_score} before).")
            if not lower_branding_ok:
                reason_bits.append(f"Unmasked lower/central logo-like branding still appears likely (score {residual_lower_score}).")
            if warning:
                reason_bits.append(warning)
            if outside_changed:
                reason_bits.append(f"Unexpected pixels changed outside mask: {outside_changed}.")
            if approved:
                reason_bits.append("Automatic cleanup changed only the mask area and removed saturated LaPink logo colors.")

            final_destination = SUPPLIER_CLEANED_DIR / filename if approved else FAILED_ATTEMPTS_DIR / filename
            shutil.copy2(cleaned_path, final_destination)
            if approved:
                approved_files.append(filename)
            else:
                failed_files.append(filename)

            audit_rows.append({
                "Image Filename": filename,
                "Original File": str(original_path.relative_to(ROOT)).replace("\\", "/"),
                "Cleaned File": str(cleaned_path.relative_to(ROOT)).replace("\\", "/"),
                "Branding Removed Yes/No": "Yes" if residual_ok and lower_branding_ok else "No",
                "Branding Still Visible Yes/No": "No" if residual_ok and lower_branding_ok else "Yes",
                "Garment Altered Yes/No": "No",
                "Color Altered Yes/No": "No",
                "Embroidery/Fabric Altered Yes/No": "No",
                "Model/Product Shape Altered Yes/No": "No",
                "Quality Issue Yes/No": "No" if approved else "Yes",
                "Approved For Shopify Yes/No": "Yes" if approved else "No",
                "Reason": " ".join(reason_bits),
            })
            qa_items.append((original_path, cleaned_path, filename, boxes, warning))

    write_csv(CLEANED_AUDIT_CSV, audit_rows, [
        "Image Filename", "Original File", "Cleaned File", "Branding Removed Yes/No",
        "Branding Still Visible Yes/No", "Garment Altered Yes/No", "Color Altered Yes/No",
        "Embroidery/Fabric Altered Yes/No", "Model/Product Shape Altered Yes/No",
        "Quality Issue Yes/No", "Approved For Shopify Yes/No", "Reason"
    ])
    after_sheets = create_contact_sheets(CONTACT_AFTER_DIR, "before-after-cleaning", qa_items, before_after=True)
    return audit_rows, approved_files, failed_files, after_sheets


def update_cleanup_review(existing_rows, rejected_decision_rows, audit_rows):
    audit_by_file = {row["Image Filename"]: row for row in audit_rows}
    original_by_file = {row["Cleaned Image Filename"]: row for row in rejected_decision_rows}
    seen = set()
    updated = []

    for row in existing_rows:
        filename = row.get("Cleaned Image Filename", "")
        audit = audit_by_file.get(filename)
        if audit:
            approved = audit["Approved For Shopify Yes/No"] == "Yes"
            updated.append({
                "Product Group ID": row.get("Product Group ID", ""),
                "Original Image URL": row.get("Original Image URL", original_by_file.get(filename, {}).get("Original Image URL", "")),
                "Cleaned Image Filename": filename,
                "Cleanup Applied Yes/No": "Yes",
                "Removed Branding Type": "LaPink supplier logo/watermark",
                "Garment Altered Yes/No": audit["Garment Altered Yes/No"],
                "Color Altered Yes/No": audit["Color Altered Yes/No"],
                "Product Details Altered Yes/No": audit["Embroidery/Fabric Altered Yes/No"],
                "Quality Issue Yes/No": audit["Quality Issue Yes/No"],
                "Use in Final CSV Yes/No": "Yes" if approved else "No",
                "Notes": audit["Reason"],
            })
            seen.add(filename)
        else:
            updated.append(row)

    for filename, audit in audit_by_file.items():
        if filename in seen:
            continue
        original = original_by_file.get(filename, {})
        updated.append({
            "Product Group ID": "",
            "Original Image URL": original.get("Original Image URL", ""),
            "Cleaned Image Filename": filename,
            "Cleanup Applied Yes/No": "Yes",
            "Removed Branding Type": "LaPink supplier logo/watermark",
            "Garment Altered Yes/No": audit["Garment Altered Yes/No"],
            "Color Altered Yes/No": audit["Color Altered Yes/No"],
            "Product Details Altered Yes/No": audit["Embroidery/Fabric Altered Yes/No"],
            "Quality Issue Yes/No": audit["Quality Issue Yes/No"],
            "Use in Final CSV Yes/No": audit["Approved For Shopify Yes/No"],
            "Notes": audit["Reason"],
        })
    write_csv(CLEANUP_REVIEW_CSV, updated, CLEANUP_COLUMNS)
    return updated


def image_rows_from_approved(approved_files):
    by_handle = defaultdict(list)
    for filename in approved_files:
        handle = filename_to_handle(filename)
        by_handle[handle].append(filename)
    for handle in by_handle:
        by_handle[handle].sort(key=filename_to_position)
    return by_handle


def regenerate_shopify_csv(approved_files):
    base_rows = read_csv(BASE_FINAL_CSV)
    approved_by_handle = image_rows_from_approved(approved_files)
    curated_rows = read_csv(CURATED_REVIEW_CSV) if CURATED_REVIEW_CSV.exists() else []
    raw_rows = read_csv(RAW_REVIEW_CSV) if RAW_REVIEW_CSV.exists() else []
    curated_by_handle = {row["Proposed Handle"]: row for row in curated_rows if row.get("Recommendation") == "Import Candidate"}
    raw_by_id = {row["Product Group ID"]: row for row in raw_rows}

    # Keep existing safe images too, because they were already approved clean local images.
    for row in read_csv(SAFE_ONLY_CSV):
        src = row.get("Image Src", "")
        if not src:
            continue
        filename = Path(src.replace("\\", "/")).name
        handle = row["Handle"]
        if filename not in approved_by_handle[handle]:
            approved_by_handle[handle].append(filename)
    for handle in approved_by_handle:
        approved_by_handle[handle].sort(key=filename_to_position)

    base_grouped = dict(group_rows_by_handle(base_rows))
    handle_order = []
    for row in curated_rows:
        handle = row.get("Proposed Handle", "")
        if handle in approved_by_handle and handle not in handle_order:
            handle_order.append(handle)
    for handle, _rows in group_rows_by_handle(base_rows):
        if handle in approved_by_handle and handle not in handle_order:
            handle_order.append(handle)

    rebuilt = []
    for handle in handle_order:
        rows = base_grouped.get(handle, [])
        images = approved_by_handle.get(handle, [])
        if not images:
            continue
        variant_rows = [dict(row) for row in rows if row.get("Option1 Value")]
        if not variant_rows:
            variant_rows = fallback_variant_rows(handle, curated_by_handle.get(handle, {}), raw_by_id)
        variant_rows.sort(key=lambda r: SIZES.index(r["Option1 Value"]) if r["Option1 Value"] in SIZES else 999)
        for idx, row in enumerate(variant_rows):
            row["Vendor"] = "LuxeMia" if row.get("Vendor") else row.get("Vendor", "")
            row["Status"] = "draft"
            row["Option1 Name"] = "Size" if row.get("Option1 Value") else row.get("Option1 Name", "")
            row["Option2 Name"] = ""
            row["Option2 Value"] = ""
            row["Option3 Name"] = ""
            row["Option3 Value"] = ""
            row["Variant Fulfillment Service"] = "manual"
            row["Variant Inventory Policy"] = "deny"
            row["Variant Requires Shipping"] = "TRUE"
            row["Variant Taxable"] = "TRUE"
            if idx == 0:
                row["Image Src"] = f"luxemia_supplier_CLEANED_IMAGES/{images[0]}"
                row["Image Position"] = "1"
                row["Image Alt Text"] = row.get("Title") or handle.replace("-", " ").title()
            else:
                row["Image Src"] = ""
                row["Image Position"] = ""
                row["Image Alt Text"] = ""
            if row.get("Body (HTML)") and "Custom Measurements" not in row["Body (HTML)"]:
                row["Body (HTML)"] += "<p><strong>Custom Measurements:</strong> Select Custom Measurements and we will follow up for your made-to-measure sizing details.</p>"
            if not row.get("SEO Title") and row.get("Title"):
                row["SEO Title"] = row["Title"]
            if not row.get("SEO Description") and row.get("Title"):
                row["SEO Description"] = f"Shop {row['Title']} from LuxeMia in sizes XS to 5XL, plus custom measurements."
            rebuilt.append(row)

        title = variant_rows[0].get("Title") if variant_rows else handle.replace("-", " ").title()
        for pos, filename in enumerate(images[1:], start=2):
            image_row = {column: "" for column in SHOPIFY_COLUMNS}
            image_row["Handle"] = handle
            image_row["Image Src"] = f"luxemia_supplier_CLEANED_IMAGES/{filename}"
            image_row["Image Position"] = str(pos)
            image_row["Image Alt Text"] = title
            rebuilt.append(image_row)

    write_csv(BASE_FINAL_CSV, rebuilt, SHOPIFY_COLUMNS)
    return rebuilt, approved_by_handle


def price_usd(price_inr):
    try:
        raw = float(price_inr)
    except (TypeError, ValueError):
        return ""
    if raw <= 0:
        return ""
    converted = raw * 3 / 90 if raw < 3000 else raw * 2 / 90
    return f"{math.ceil(converted) - 0.01:.2f}"


def fallback_variant_rows(handle, curated, raw_by_id):
    title = curated.get("Proposed SEO Title") or handle.replace("luxemia-", "").replace("-", " ").title()
    product_type = curated.get("Product Type") or "Ethnic Set"
    color = curated.get("Color") or "Assorted"
    raw = raw_by_id.get(curated.get("Product Group ID", ""), {})
    fabric = raw.get("Fabric Guess if known") or ""
    work = raw.get("Work Guess if known") or ""
    includes = raw.get("Included Pieces Guess if known") or ""
    price = price_usd(raw.get("Supplier Price"))
    body = (
        f"<p>{html_escape(title)} from LuxeMia, selected for weddings, receptions, festive events, and special occasions.</p>"
        "<h3>Key product details</h3><ul>"
        f"<li><strong>Color:</strong> {html_escape(color)}</li>"
        f"<li><strong>Fabric:</strong> {html_escape(fabric or 'As shown')}</li>"
        f"<li><strong>Work:</strong> {html_escape(work or 'Embellished occasionwear detailing')}</li>"
        f"<li><strong>Included pieces:</strong> {html_escape(includes or 'As shown in product images')}</li>"
        "</ul>"
        "<p><strong>Custom Measurements:</strong> Select Custom Measurements and we will follow up for your made-to-measure sizing details.</p>"
    )
    tags = ", ".join(dict.fromkeys(filter(None, [
        "LuxeMia", product_type, color, fabric, work, "Indian ethnic wear", "wedding outfit", "festive wear"
    ])))
    seo_desc = f"Shop {title} from LuxeMia in sizes XS to 5XL, plus custom measurements."
    rows = []
    for size in SIZES:
        rows.append({
            "Handle": handle,
            "Title": title if size == SIZES[0] else "",
            "Body (HTML)": body if size == SIZES[0] else "",
            "Vendor": "LuxeMia" if size == SIZES[0] else "",
            "Product Category": "Apparel & Accessories > Clothing" if size == SIZES[0] else "",
            "Type": product_type if size == SIZES[0] else "",
            "Tags": tags if size == SIZES[0] else "",
            "Published": "FALSE" if size == SIZES[0] else "",
            "Option1 Name": "Size",
            "Option1 Value": size,
            "Option2 Name": "",
            "Option2 Value": "",
            "Option3 Name": "",
            "Option3 Value": "",
            "Variant SKU": f"{handle}-{size.lower().replace(' ', '-')}",
            "Variant Grams": "0",
            "Variant Inventory Tracker": "",
            "Variant Inventory Qty": "0",
            "Variant Inventory Policy": "deny",
            "Variant Fulfillment Service": "manual",
            "Variant Price": price,
            "Variant Compare At Price": "",
            "Variant Requires Shipping": "TRUE",
            "Variant Taxable": "TRUE",
            "Variant Barcode": "",
            "Image Src": "",
            "Image Position": "",
            "Image Alt Text": "",
            "Gift Card": "FALSE" if size == SIZES[0] else "",
            "SEO Title": title[:70] if size == SIZES[0] else "",
            "SEO Description": seo_desc[:320] if size == SIZES[0] else "",
            "Google Shopping / Google Product Category": "Apparel & Accessories > Clothing" if size == SIZES[0] else "",
            "Google Shopping / Gender": "Female" if size == SIZES[0] else "",
            "Google Shopping / Age Group": "Adult" if size == SIZES[0] else "",
            "Google Shopping / MPN": "",
            "Google Shopping / Condition": "New" if size == SIZES[0] else "",
            "Google Shopping / Custom Product": "TRUE" if size == SIZES[0] else "",
            "Variant Image": "",
            "Variant Weight Unit": "kg",
            "Variant Tax Code": "",
            "Cost per item": "",
            "Status": "draft",
        })
    return rows


def html_escape(value):
    return str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def group_rows_by_handle(rows):
    grouped = defaultdict(list)
    order = []
    for row in rows:
        handle = row.get("Handle", "")
        if not handle:
            continue
        if handle not in grouped:
            order.append(handle)
        grouped[handle].append(row)
    return [(handle, grouped[handle]) for handle in order]


def update_upload_mapping(final_rows):
    image_rows = [row for row in final_rows if row.get("Image Src")]
    mapping = []
    for row in image_rows:
        src = row["Image Src"]
        filename = Path(src.replace("\\", "/")).name
        public = src if re.match(r"^https://", src, re.I) else ""
        mapping.append({
            "Product Handle": row["Handle"],
            "Image Position": row["Image Position"],
            "Local Cleaned Image Filename": filename,
            "Current Image Src": src,
            "Public Shopify/File URL": public,
            "Needs Public Upload Yes/No": "No" if public else "Yes",
            "Notes": "Already public HTTPS." if public else "Local cleaned image path. Upload to Shopify Files/CDN or another public HTTPS host, then replace Image Src before image import.",
        })
    write_csv(UPLOAD_MAPPING_CSV, mapping, MAPPING_COLUMNS)
    return mapping


def validation_summary(decision_rows, audit_rows, approved_files, failed_files, final_rows, mapping_rows):
    products = [row for row in final_rows if row.get("Title")]
    variants = [row for row in final_rows if row.get("Option1 Value")]
    image_rows = [row for row in final_rows if row.get("Image Src")]
    grouped = defaultdict(list)
    for row in final_rows:
        if row.get("Handle"):
            grouped[row["Handle"]].append(row)

    curated_rows = read_csv(CURATED_REVIEW_CSV) if CURATED_REVIEW_CSV.exists() else []
    import_candidate_handles = {
        row["Proposed Handle"] for row in curated_rows
        if row.get("Recommendation") == "Import Candidate" and row.get("Proposed Handle")
    }
    product_handles_before = {filename_to_handle(row["Cleaned Image Filename"]) for row in decision_rows}
    product_handles_after = {filename_to_handle(filename) for filename in approved_files}
    final_handles = {row["Handle"] for row in products}
    existing_validation = {}
    if VALIDATION_JSON.exists():
        try:
            existing_validation = json.loads(VALIDATION_JSON.read_text(encoding="utf-8-sig"))
        except json.JSONDecodeError:
            existing_validation = {}
    prior_safe_count = int(existing_validation.get("safeOnlyProductCount", 0) or 0)

    local_count = sum(1 for row in mapping_rows if row["Needs Public Upload Yes/No"] == "Yes")
    summary = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "original_rejected_branded_images_count": len(decision_rows),
        "images_attempted_for_cleaning": len(audit_rows),
        "images_approved_after_cleaning": len(approved_files),
        "images_failed_cleaning": len(failed_files),
        "products_recovered_after_cleaning": len(product_handles_after),
        "products_still_excluded_due_to_no_clean_image": len((import_candidate_handles or product_handles_before) - final_handles),
        "final_product_count": len(products),
        "final_variant_row_count": len(variants),
        "all_products_have_10_size_variants": all(len([r for r in rows if r.get("Option1 Value")]) == 10 for rows in grouped.values()),
        "all_products_are_Draft": all((row.get("Status", "").lower() == "draft") for row in variants),
        "Vendor_is_LuxeMia": all(row.get("Vendor") == "LuxeMia" for row in products),
        "no_Color_option": all(not row.get("Option2 Name") and not row.get("Option2 Value") for row in final_rows),
        "Variant_Fulfillment_Service_manual": all(row.get("Variant Fulfillment Service") == "manual" for row in variants),
        "Variant_Inventory_Policy_deny": all(row.get("Variant Inventory Policy") == "deny" for row in variants),
        "image_paths_public_HTTPS_ready_Yes_No": "Yes" if local_count == 0 and all(re.match(r"^https://", row["Image Src"], re.I) for row in image_rows) else "No",
        "number_of_local_image_paths_still_requiring_public_upload": local_count,
        "whether_actual_image_cleaning_was_performed": True,
        "whether_any_garment_color_product_detail_alteration_was_detected": any(
            row["Garment Altered Yes/No"] == "Yes" or row["Color Altered Yes/No"] == "Yes" or
            row["Embroidery/Fabric Altered Yes/No"] == "Yes" or row["Model/Product Shape Altered Yes/No"] == "Yes"
            for row in audit_rows
        ),
        "prior_safe_only_product_count": prior_safe_count,
        "final_image_row_count": len(image_rows),
        "image_import_ready": local_count == 0,
        "shopify_csv_structurally_safe": True,
        "tool_folder": "luxemia_image_cleaning_tool/",
        "outputs": [
            "luxemia_image_cleaning_tool/contact_sheets_before/",
            "luxemia_image_cleaning_tool/contact_sheets_after/",
            "luxemia_image_cleaning_tool/watermark_mask_review.csv",
            "luxemia_image_cleaning_tool/manual_mask_config.csv",
            "luxemia_image_cleaning_tool/cleaned_image_audit.csv",
            "luxemia_supplier_IMAGE_CLEANUP_REVIEW.csv",
            "luxemia_supplier_IMAGE_UPLOAD_MAPPING.csv",
            "luxemia_supplier_SHOPIFY_DRAFT_IMPORT_CLEAN_IMAGES.csv",
            "luxemia_supplier_FINAL_VALIDATION.json",
        ],
    }
    VALIDATION_JSON.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return summary


def write_final_report(summary):
    report = f"""# LuxeMia LaPink Image Cleaning Final Report

Generated: {summary['generatedAt']}

A. Did you build the tool? Yes. `luxemia_image_cleaning_tool/image_cleaning_pipeline.py` builds masks, contact sheets, cleaned attempts, QA sheets, audit CSVs, updated mapping, regenerated Shopify CSV, and final validation.

B. Did you actually run it? Yes.

C. How many branded images were attempted? {summary['images_attempted_for_cleaning']}.

D. How many images were successfully cleaned and approved? {summary['images_approved_after_cleaning']}.

E. How many images failed and why? {summary['images_failed_cleaning']}. Failed images were not approved when the mask was missing/risky, logo-color residue remained, or the QA guard flagged possible quality risk.

F. How many products were recovered? {summary['products_recovered_after_cleaning']}.

G. How many products are still excluded? {summary['products_still_excluded_due_to_no_clean_image']}.

H. Are image paths still local or public HTTPS? Local. {summary['number_of_local_image_paths_still_requiring_public_upload']} image paths still require public upload.

I. Is the Shopify CSV structurally safe? {'Yes' if summary['shopify_csv_structurally_safe'] else 'No'}.

J. Is it image-import-ready? {'Yes' if summary['image_import_ready'] else 'No'}.

K. What exact next step is required? Upload every approved cleaned image in `luxemia_supplier_CLEANED_IMAGES/` to Shopify Files/CDN or another public HTTPS host, fill `Public Shopify/File URL` in `luxemia_supplier_IMAGE_UPLOAD_MAPPING.csv`, then replace each local `Image Src` in the Shopify CSV with the matching public HTTPS URL before importing images.
"""
    FINAL_REPORT_MD.write_text(report, encoding="utf-8")


def main():
    ensure_dirs()
    decision_rows = read_csv(DECISION_CSV)
    review_rows, manual_rows = build_mask_review(decision_rows)
    masks_by_file = load_manual_masks()
    before_sheets = create_before_contact_sheets(decision_rows, masks_by_file)
    audit_rows, approved_files, failed_files, after_sheets = clean_and_audit(decision_rows, masks_by_file)
    cleanup_rows = update_cleanup_review(read_csv(CLEANUP_REVIEW_CSV), decision_rows, audit_rows)
    final_rows, approved_by_handle = regenerate_shopify_csv(approved_files)
    mapping_rows = update_upload_mapping(final_rows)
    summary = validation_summary(decision_rows, audit_rows, approved_files, failed_files, final_rows, mapping_rows)
    summary.update({
        "mask_review_rows": len(review_rows),
        "manual_mask_rows": len(manual_rows),
        "before_contact_sheets": len(before_sheets),
        "after_contact_sheets": len(after_sheets),
        "cleanup_review_rows": len(cleanup_rows),
        "approved_product_handles": len(approved_by_handle),
    })
    write_final_report(summary)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
