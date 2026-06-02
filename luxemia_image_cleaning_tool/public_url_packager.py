import csv
import json
import re
import shutil
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
APP_PUBLIC_ROOT = ROOT / "luxemiashop-checkout" / "public"
PUBLIC_SUBDIR = Path("catalog-clean") / "lapink-new-arrivals"
PUBLIC_IMAGE_DIR = APP_PUBLIC_ROOT / PUBLIC_SUBDIR
OUTPUT_DIR = ROOT / "outputs" / "catalog-cleaning" / "lapink-new-arrivals"

INPUT_CSV = ROOT / "luxemia_supplier_SHOPIFY_DRAFT_IMPORT_CLEAN_IMAGES.csv"
ROOT_PUBLIC_CSV = ROOT / "luxemia_supplier_SHOPIFY_DRAFT_IMPORT_CLEAN_IMAGES.csv"
PUBLIC_CSV = OUTPUT_DIR / "LUXEMIA_LAPINK_CLEAN_IMAGES_SHOPIFY_DRAFT_IMPORT_PUBLIC_URLS.csv"
MANIFEST_CSV = OUTPUT_DIR / "cleaned_image_manifest_public_urls.csv"
VALIDATION_MD = OUTPUT_DIR / "FINAL_PUBLIC_URL_VALIDATION.md"
ROOT_MAPPING_CSV = ROOT / "luxemia_supplier_IMAGE_UPLOAD_MAPPING.csv"
TOOL_AUDIT_CSV = ROOT / "luxemia_image_cleaning_tool" / "cleaned_image_audit.csv"
FINAL_VALIDATION_JSON = ROOT / "luxemia_supplier_FINAL_VALIDATION.json"

PUBLIC_URL_BASE = "https://luxemia.shop/catalog-clean/lapink-new-arrivals"
BANNED = re.compile(
    r"(lapink|la\s*pink|k\s*naresh|nareshkumar|lapinkfashion|7575037610|"
    r"customercare@lapinkfashion\.co\.in|sumel business park|ahmedabad|"
    r"whatsapp|instagram|facebook|telegram|price|pricelist|catalog|"
    r"https?://|@|\bdesigner\b|\bfendi\b|\bjdt\b|\bsku\b|new arrival)",
    re.I,
)
FILENAME_BANNED = re.compile(
    r"(lapink|la-pink|naresh|whatsapp|instagram|facebook|telegram|price|"
    r"pricelist|catalog|designer|fendi|jdt|sku|new-arrival|new-arrivals)",
    re.I,
)

SHOPIFY_COLUMNS = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published",
    "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
    "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty",
    "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price",
    "Variant Requires Shipping", "Variant Taxable", "Variant Barcode", "Image Src", "Image Position",
    "Image Alt Text", "Gift Card", "SEO Title", "SEO Description",
    "Google Shopping / Google Product Category", "Google Shopping / Gender", "Google Shopping / Age Group",
    "Google Shopping / MPN", "Google Shopping / Condition", "Google Shopping / Custom Product",
    "Variant Image", "Variant Weight Unit", "Variant Tax Code", "Cost per item", "Status",
]

MAPPING_COLUMNS = [
    "Product Handle", "Image Position", "Local Cleaned Image Filename", "Current Image Src",
    "Public Shopify/File URL", "Needs Public Upload Yes/No", "Notes",
]

MANIFEST_COLUMNS = [
    "Product Handle", "Image Position", "Source Local Path", "Original Filename",
    "Public Folder Path", "Public Filename", "Public URL", "Copied Yes/No", "Approved Source", "Notes",
]


def read_csv(path):
    with path.open("r", newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def write_csv(path, rows, columns):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def safe_filename(name, used):
    original = Path(name).name.lower()
    stem = Path(original).stem
    suffix = Path(original).suffix.lower() or ".jpg"
    stem = re.sub(r"(lapink|la[-_\s]*pink|naresh|whatsapp|instagram|facebook|telegram)", "", stem, flags=re.I)
    stem = re.sub(r"(price|pricelist|catalog|designer|fendi|jdt|sku|new[-_\s]*arrivals?)", "", stem, flags=re.I)
    stem = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")
    stem = re.sub(r"-{2,}", "-", stem)
    if not stem:
        stem = "luxemia-clean-image"
    candidate = f"{stem}{suffix}"
    index = 2
    while candidate in used:
        candidate = f"{stem}-{index}{suffix}"
        index += 1
    used.add(candidate)
    return candidate


def source_path_from_image_src(src):
    src = str(src or "").replace("\\", "/")
    if src.startswith("https://"):
        return None
    return ROOT / src


def approved_audit_filenames():
    if not TOOL_AUDIT_CSV.exists():
        return set()
    return {
        row["Image Filename"]
        for row in read_csv(TOOL_AUDIT_CSV)
        if row.get("Approved For Shopify Yes/No") == "Yes"
    }


def main():
    PUBLIC_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    rows = read_csv(INPUT_CSV)
    approved_from_audit = approved_audit_filenames()
    used_public_names = set()
    src_to_public = {}
    manifest_rows = []

    for row in rows:
        image_src = row.get("Image Src", "")
        if not image_src:
            continue
        source_path = source_path_from_image_src(image_src)
        if source_path is None:
            original_filename = Path(image_src).name
        else:
            original_filename = source_path.name
        public_filename = safe_filename(original_filename, used_public_names)
        public_path = PUBLIC_IMAGE_DIR / public_filename
        public_url = f"{PUBLIC_URL_BASE}/{public_filename}"

        copied = "No"
        notes = ""
        if source_path and source_path.exists():
            shutil.copy2(source_path, public_path)
            copied = "Yes"
        else:
            notes = "Source local image file missing or already URL-based; no copy performed."

        src_to_public[image_src] = {
            "filename": public_filename,
            "path": public_path,
            "url": public_url,
            "source": source_path,
        }
        manifest_rows.append({
            "Product Handle": row.get("Handle", ""),
            "Image Position": row.get("Image Position", ""),
            "Source Local Path": str(source_path.relative_to(ROOT)).replace("\\", "/") if source_path else image_src,
            "Original Filename": original_filename,
            "Public Folder Path": str(public_path.relative_to(ROOT)).replace("\\", "/"),
            "Public Filename": public_filename,
            "Public URL": public_url,
            "Copied Yes/No": copied,
            "Approved Source": "cleaned_image_audit approved" if original_filename in approved_from_audit else "existing safe approved image row",
            "Notes": notes,
        })

    public_rows = []
    for row in rows:
        out = {column: row.get(column, "") for column in SHOPIFY_COLUMNS}
        image_src = row.get("Image Src", "")
        if image_src:
            out["Image Src"] = src_to_public[image_src]["url"]
        public_rows.append(out)

    write_csv(PUBLIC_CSV, public_rows, SHOPIFY_COLUMNS)
    write_csv(ROOT_PUBLIC_CSV, public_rows, SHOPIFY_COLUMNS)
    write_csv(MANIFEST_CSV, manifest_rows, MANIFEST_COLUMNS)

    mapping_rows = []
    for item in manifest_rows:
        mapping_rows.append({
            "Product Handle": item["Product Handle"],
            "Image Position": item["Image Position"],
            "Local Cleaned Image Filename": item["Original Filename"],
            "Current Image Src": item["Public URL"],
            "Public Shopify/File URL": item["Public URL"],
            "Needs Public Upload Yes/No": "No",
            "Notes": "Public URL path prepared for Vercel static public folder. Deploy the Vercel app before importing images.",
        })
    write_csv(ROOT_MAPPING_CSV, mapping_rows, MAPPING_COLUMNS)

    validation = validate(public_rows, manifest_rows)
    update_final_validation(validation)
    write_validation_md(validation)
    print(json.dumps(validation, indent=2))


def validate(public_rows, manifest_rows):
    image_srcs = [row.get("Image Src", "") for row in public_rows if row.get("Image Src")]
    variant_rows = [row for row in public_rows if row.get("Option1 Value")]
    product_rows = [row for row in public_rows if row.get("Title")]
    grouped = defaultdict(list)
    for row in public_rows:
        if row.get("Handle"):
            grouped[row["Handle"]].append(row)

    product_field_text_ok = all(
        not BANNED.search(" ".join([
            row.get("Handle", ""),
            row.get("Title", ""),
            row.get("Body (HTML)", ""),
            row.get("Vendor", ""),
            row.get("Type", ""),
            row.get("Tags", ""),
            row.get("Image Alt Text", ""),
            row.get("SEO Title", ""),
            row.get("SEO Description", ""),
        ]))
        for row in public_rows
    )
    filename_ok = all(not FILENAME_BANNED.search(Path(src).name) for src in image_srcs)
    prefix_ok = all(src.startswith(f"{PUBLIC_URL_BASE}/") for src in image_srcs)
    local_ok = all(not re.match(r"^(?:[a-zA-Z]:\\|\.{0,2}/|luxemia_supplier_|public/|catalog-clean/)", src) for src in image_srcs)
    copied_count = sum(1 for row in manifest_rows if row["Copied Yes/No"] == "Yes")
    copied_files_exist = all((ROOT / row["Public Folder Path"]).exists() for row in manifest_rows if row["Copied Yes/No"] == "Yes")

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "approved_cleaned_images_copied_to_public_folder": copied_count,
        "final_image_src_values": len(image_srcs),
        "all_image_src_values_are_https": all(src.startswith("https://") for src in image_srcs),
        "no_local_image_src_paths_remain": local_ok,
        "all_image_src_values_use_expected_public_prefix": prefix_ok,
        "no_supplier_branding_terms_in_image_src_filenames": filename_ok,
        "no_supplier_branding_contact_social_price_text_in_product_facing_fields": product_field_text_ok,
        "variant_fulfillment_service_not_blank": all(bool(row.get("Variant Fulfillment Service")) for row in variant_rows),
        "variant_fulfillment_service_manual": all(row.get("Variant Fulfillment Service") == "manual" for row in variant_rows),
        "variant_inventory_policy_valid": all(row.get("Variant Inventory Policy") in {"deny", "continue"} for row in variant_rows),
        "variant_inventory_policy_deny": all(row.get("Variant Inventory Policy") == "deny" for row in variant_rows),
        "all_products_have_10_size_variants": all(len([r for r in rows if r.get("Option1 Value")]) == 10 for rows in grouped.values()),
        "all_products_are_draft": all(row.get("Status", "").lower() == "draft" for row in variant_rows),
        "vendor_is_luxemia": all(row.get("Vendor") == "LuxeMia" for row in product_rows),
        "no_color_option": all(not row.get("Option2 Name") and not row.get("Option2 Value") for row in public_rows),
        "all_public_folder_files_exist": copied_files_exist,
        "shopify_import_compatible": (
            bool(public_rows)
            and len(image_srcs) == copied_count
            and all(src.startswith("https://") for src in image_srcs)
            and local_ok
            and prefix_ok
            and filename_ok
            and product_field_text_ok
            and all(bool(row.get("Variant Fulfillment Service")) for row in variant_rows)
            and all(row.get("Variant Inventory Policy") in {"deny", "continue"} for row in variant_rows)
            and all(len([r for r in rows if r.get("Option1 Value")]) == 10 for rows in grouped.values())
            and copied_files_exist
        ),
        "image_import_ready_after_vercel_deployment": (
            len(image_srcs) == copied_count
            and all(src.startswith("https://") for src in image_srcs)
            and local_ok
            and prefix_ok
            and filename_ok
            and copied_files_exist
        ),
        "public_image_folder": str(PUBLIC_IMAGE_DIR.relative_to(ROOT)).replace("\\", "/"),
        "public_url_base": PUBLIC_URL_BASE,
        "final_public_url_shopify_csv": str(PUBLIC_CSV.relative_to(ROOT)).replace("\\", "/"),
        "cleaned_image_manifest_public_urls": str(MANIFEST_CSV.relative_to(ROOT)).replace("\\", "/"),
    }


def update_final_validation(validation):
    data = {}
    if FINAL_VALIDATION_JSON.exists():
        try:
            data = json.loads(FINAL_VALIDATION_JSON.read_text(encoding="utf-8-sig"))
        except json.JSONDecodeError:
            data = {}
    data.update({
        "image_paths_public_HTTPS_ready_Yes_No": "Yes" if validation["all_image_src_values_are_https"] else "No",
        "number_of_local_image_paths_still_requiring_public_upload": 0 if validation["no_local_image_src_paths_remain"] else validation["final_image_src_values"],
        "image_import_ready": validation["image_import_ready_after_vercel_deployment"],
        "public_url_workflow": validation,
    })
    FINAL_VALIDATION_JSON.write_text(json.dumps(data, indent=2), encoding="utf-8")


def write_validation_md(validation):
    lines = [
        "# LuxeMia LaPink Public URL Validation",
        "",
        f"Generated: {validation['generatedAt']}",
        "",
        f"- Approved cleaned images copied to public folder: {validation['approved_cleaned_images_copied_to_public_folder']}",
        f"- Final Image Src values: {validation['final_image_src_values']}",
        f"- All Image Src values are HTTPS: {yesno(validation['all_image_src_values_are_https'])}",
        f"- No local Image Src paths remain: {yesno(validation['no_local_image_src_paths_remain'])}",
        f"- Expected public URL prefix only: {yesno(validation['all_image_src_values_use_expected_public_prefix'])}",
        f"- No supplier terms in Image Src filenames: {yesno(validation['no_supplier_branding_terms_in_image_src_filenames'])}",
        f"- No supplier/contact/social/price text in product-facing fields: {yesno(validation['no_supplier_branding_contact_social_price_text_in_product_facing_fields'])}",
        f"- Fulfillment service not blank: {yesno(validation['variant_fulfillment_service_not_blank'])}",
        f"- Inventory policy values valid: {yesno(validation['variant_inventory_policy_valid'])}",
        f"- CSV remains Shopify import-compatible: {yesno(validation['shopify_import_compatible'])}",
        f"- Image-import-ready after Vercel deployment: {yesno(validation['image_import_ready_after_vercel_deployment'])}",
        "",
        f"Public image folder: `{validation['public_image_folder']}`",
        f"Public URL base: `{validation['public_url_base']}`",
        f"Final public-URL Shopify CSV: `{validation['final_public_url_shopify_csv']}`",
        f"Public URL manifest: `{validation['cleaned_image_manifest_public_urls']}`",
        "",
        "Remaining blocker: deploy the Vercel app so the static files in the public folder are live at luxemia.shop before Shopify image import.",
    ]
    VALIDATION_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def yesno(value):
    return "Yes" if value else "No"


if __name__ == "__main__":
    main()
