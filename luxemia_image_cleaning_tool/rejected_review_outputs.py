import csv
import math
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
AUDIT_CSV = ROOT / "luxemia_image_cleaning_tool" / "cleaned_image_audit.csv"
REJECTED_DIR = ROOT / "luxemia_supplier_REJECTED_BRANDED_IMAGES"
ATTEMPTS_DIR = ROOT / "luxemia_image_cleaning_tool" / "cleaned_attempts"
OUT_DIR = ROOT / "outputs" / "catalog-cleaning" / "lapink-new-arrivals"
SHEET_DIR = OUT_DIR / "rejected_unfixable_contact_sheets"
REJECTED_CSV = OUT_DIR / "rejected_after_cleaning.csv"


def read_csv(path):
    with path.open("r", newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def write_csv(path, rows, columns):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def font(size, bold=False):
    path = Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf")
    if path.exists():
        return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def fit_image(image, width, height):
    scale = min(width / image.width, height / image.height)
    resized = image.resize((max(1, int(image.width * scale)), max(1, int(image.height * scale))), Image.Resampling.LANCZOS)
    tile = Image.new("RGB", (width, height), "white")
    tile.paste(resized, ((width - resized.width) // 2, (height - resized.height) // 2))
    return tile


def make_sheets(rows):
    SHEET_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    per_sheet = 4
    thumb_w, thumb_h = 360, 520
    label_h = 120
    gap = 24
    margin = 24
    title_font = font(16, True)
    small_font = font(13)
    sheet_paths = []

    for offset in range(0, len(rows), per_sheet):
        batch = rows[offset:offset + per_sheet]
        cols = 2
        tile_w = thumb_w * 2
        sheet_w = margin * 2 + cols * tile_w + (cols - 1) * gap
        sheet_h = margin * 2 + math.ceil(len(batch) / cols) * (thumb_h + label_h) + gap
        sheet = Image.new("RGB", (sheet_w, sheet_h), "#f2f2f2")
        draw = ImageDraw.Draw(sheet)

        for index, row in enumerate(batch):
            col = index % cols
            line = index // cols
            left = margin + col * (tile_w + gap)
            top = margin + line * (thumb_h + label_h + gap)
            filename = row["Image Filename"]
            original = Image.open(REJECTED_DIR / filename).convert("RGB")
            cleaned = Image.open(ATTEMPTS_DIR / filename).convert("RGB")
            sheet.paste(fit_image(original, thumb_w, thumb_h), (left, top))
            sheet.paste(fit_image(cleaned, thumb_w, thumb_h), (left + thumb_w, top))
            draw.text((left + 8, top + 8), "Original", font=title_font, fill="#111")
            draw.text((left + thumb_w + 8, top + 8), "Cleaned Attempt", font=title_font, fill="#111")
            label_top = top + thumb_h + 8
            draw.text((left, label_top), f"{offset + index + 1:03d} | {filename}", font=title_font, fill="#111")
            reason = row["Reason"]
            draw.text((left, label_top + 28), reason[:125], font=small_font, fill="#7a2500")
            if len(reason) > 125:
                draw.text((left, label_top + 48), reason[125:250], font=small_font, fill="#7a2500")

        out = SHEET_DIR / f"rejected-unfixable-{stamp}-{offset // per_sheet + 1:02d}.jpg"
        sheet.save(out, quality=92)
        sheet_paths.append(out)
    return sheet_paths


def main():
    rows = [row for row in read_csv(AUDIT_CSV) if row.get("Approved For Shopify Yes/No") == "No"]
    write_csv(REJECTED_CSV, rows, list(rows[0].keys()) if rows else [])
    sheets = make_sheets(rows)
    print(f"rejected_rows={len(rows)}")
    print(f"rejected_contact_sheets={len(sheets)}")
    print(f"rejected_csv={REJECTED_CSV}")
    print(f"sheet_dir={SHEET_DIR}")


if __name__ == "__main__":
    main()
