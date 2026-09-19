#!/usr/bin/env python3
"""
Generate a Shopify product import CSV from /tmp/sherwani-final.json.

Each design = 1 separate Shopify product (per user instruction "each
variant must be treated as separate product"). Each product has a single
default variant ("Default Title") since the source catalog has no size
variants — the user can add size variants in Shopify admin later if
needed.

Output: /home/z/my-project/download/shopify-sherwani-out-luk-vol-144.csv

Shopify CSV format reference:
https://help.shopify.com/en/manual/products/import-export/using-csv
"""

import csv
import json
import re
import os
from urllib.parse import urlparse

OUT_DIR = '/home/z/my-project/download'
os.makedirs(OUT_DIR, exist_ok=True)
OUT_CSV = os.path.join(OUT_DIR, 'shopify-sherwani-out-luk-vol-144.csv')

with open('/tmp/sherwani-final.json') as f:
    products = json.load(f)

# Shopify CSV columns (official order as of 2024-2025)
# Reference: https://help.shopify.com/en/manual/products/import-export/using-csv#product-csv-file-format
FIELDNAMES = [
    'Handle',
    'Title',
    'Body (HTML)',
    'Vendor',
    'Product Category',
    'Type',
    'Tags',
    'Published',
    'Option1 Name',
    'Option1 Value',
    'Option2 Name',
    'Option2 Value',
    'Option3 Name',
    'Option3 Value',
    'Variant SKU',
    'Variant Grams',
    'Variant Inventory Tracker',
    'Variant Inventory Qty',
    'Variant Inventory Policy',
    'Variant Fulfillment Service',
    'Variant Price',
    'Variant Compare At Price',
    'Variant Requires Shipping',
    'Variant Taxable',
    'Variant Barcode',
    'Image Src',
    'Image Position',
    'Image Alt Text',
    'Gift Card',
    'SEO Title',
    'SEO Description',
    'Google Shopping / Google Product Category',
    'Google Shopping / Gender',
    'Google Shopping / Age Group',
    'Google Shopping / MPN',
    'Google Shopping / Condition',
    'Google Shopping / Custom Product',
    'Google Shopping / Custom Label 0',
    'Google Shopping / Custom Label 1',
    'Google Shopping / Custom Label 2',
    'Google Shopping / Custom Label 3',
    'Google Shopping / Custom Label 4',
    'Variant Image',
    'Variant Weight Unit',
    'Variant Tax Code',
    'Cost per item',
    'Included / United States',
    'Price / United States',
    'Compare At Price / United States',
    'Included / International',
    'Price / International',
    'Compare At Price / International',
    'Status',
]


def slugify(s):
    """Convert title to URL-safe handle."""
    s = s.lower()
    # Replace non-alphanumeric with hyphens
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = s.strip('-')
    return s


def dedupe_titles(products):
    """If multiple products have the same SEO title, append SKU to disambiguate.

    Strategy:
    - 1st occurrence: keep clean title
    - 2nd+ occurrence: shorten by dropping 'with <Embroidery>' and appending SKU
      e.g., 'Ivory Raw Silk Sherwani with Resham Thread Embroidery' (#658089, #658055)
            becomes 'Ivory Raw Silk Sherwani - 658055' for the 2nd occurrence
    """
    title_counts = {}
    for p in products:
        t = p['analysis']['seo_title']
        title_counts[t] = title_counts.get(t, 0) + 1

    seen = {}
    for p in products:
        t = p['analysis']['seo_title']
        if title_counts[t] > 1:
            seen[t] = seen.get(t, 0) + 1
            if seen[t] > 1:
                # Shorten: drop "with X" suffix and append SKU
                # "Ivory Raw Silk Sherwani with Resham Thread Embroidery"
                # → "Ivory Raw Silk Sherwani 658055"
                short = re.sub(r'\s+with\s+\w+(\s+\w+)*\s+embroidery$', '', t, flags=re.IGNORECASE)
                short = re.sub(r'\s+with\s+\w+(\s+\w+)*\s+work$', '', short, flags=re.IGNORECASE)
                # If still no change, just append SKU
                if short == t:
                    short = t.rsplit(' with ', 1)[0]
                p['analysis']['seo_title'] = f"{short} {p['sku']}"
    return products


def get_compare_at_price(price):
    """Set compare-at price ~30% above the sale price for discount display."""
    p = float(price)
    c = round(p * 1.3, 2)
    # Round to nearest 0.99
    c = int(c) - 0.01
    return f"{c:.2f}"


def get_price_for_color(color_primary):
    """Premium pricing — vary slightly by color to avoid identical SKUs."""
    base = 299.00
    # Premium colors get +$30
    premium = {'Ivory', 'Champagne', 'Wine'}
    if color_primary in premium:
        base = 329.00
    return f"{base:.2f}"


def build_tags(item):
    """Build a comma-separated tag list."""
    a = item['analysis']
    tags = [
        'sherwani', 'menswear', 'groom wear', 'wedding sherwani',
        a['fabric'].lower(),
        a['embroidery'].lower().replace(' work', '').replace('thread', '').strip(),
        a['color_primary'].lower(),
        'out luk vol 144',
        'armani silk',
        'sequence work',
        'LuxeMia',
        'gender:male', 'men', 'menswear',
        'new arrival',
    ]
    # Remove duplicates while preserving order
    seen = set()
    unique = []
    for t in tags:
        t = t.strip()
        if t and t not in seen:
            seen.add(t)
            unique.append(t)
    return ', '.join(unique)


def build_full_title(item):
    """Full Shopify product title — append ' | LuxeMia' to the SEO title."""
    return f"{item['analysis']['seo_title']} | LuxeMia"


products = dedupe_titles(products)

# Build CSV rows. Each product = 2 rows:
#   Row 1: Product + Variant (with Image Src)
#   Row 2: (optional) Additional images — we only have 1 image per product, so 1 row each.
rows = []

for p in products:
    a = p['analysis']
    title = build_full_title(p)
    handle = slugify(title)
    # Ensure handle is unique — append SKU if needed
    base_handle = handle
    suffix = 2
    while any(r['Handle'] == handle and r['Title'] for r in rows):
        handle = f"{base_handle}-{suffix}"
        suffix += 1

    sku = f"LUX-SHW-OLV144-{p['sku']}"
    price = get_price_for_color(a['color_primary'])
    compare_at = get_compare_at_price(price)

    row = {
        'Handle': handle,
        'Title': title,
        'Body (HTML)': p['body_html'],
        'Vendor': 'LuxeMia',
        'Product Category': '',  # Leave blank — set in Shopify admin
        'Type': 'Sherwani',
        'Tags': build_tags(p),
        'Published': 'TRUE',
        'Option1 Name': 'Title',
        'Option1 Value': 'Default Title',
        'Option2 Name': '',
        'Option2 Value': '',
        'Option3 Name': '',
        'Option3 Value': '',
        'Variant SKU': sku,
        'Variant Grams': '1500',  # ~1.5kg for a sherwani
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Qty': '10',  # Default stock
        'Variant Inventory Policy': 'deny',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': price,
        'Variant Compare At Price': compare_at,
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Barcode': '',
        'Image Src': p['image_url'],
        'Image Position': '1',
        'Image Alt Text': f"{a['color_primary']} {a['fabric']} Sherwani with {a['embroidery']} | LuxeMia",
        'Gift Card': 'FALSE',
        'SEO Title': a['seo_title'],
        'SEO Description': p['seo_description'],
        'Google Shopping / Google Product Category': '1604',
        'Google Shopping / Gender': 'male',
        'Google Shopping / Age Group': 'adult',
        'Google Shopping / MPN': sku,
        'Google Shopping / Condition': 'new',
        'Google Shopping / Custom Product': 'FALSE',
        'Google Shopping / Custom Label 0': 'Sherwani',
        'Google Shopping / Custom Label 1': a['fabric'],
        'Google Shopping / Custom Label 2': a['color_primary'],
        'Google Shopping / Custom Label 3': a['embroidery'],
        'Google Shopping / Custom Label 4': 'Out Luk Vol 144',
        'Variant Image': p['image_url'],
        'Variant Weight Unit': 'g',
        'Variant Tax Code': '',
        'Cost per item': '',  # Set in Shopify admin
        'Included / United States': 'TRUE',
        'Price / United States': price,
        'Compare At Price / United States': compare_at,
        'Included / International': 'TRUE',
        'Price / International': price,
        'Compare At Price / International': compare_at,
        'Status': 'active',
    }
    rows.append(row)

# Write CSV — use newline='' to avoid extra blank lines on Windows,
# and quoting=QUOTE_ALL to safely handle HTML with commas/quotes/newlines.
with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=FIELDNAMES, quoting=csv.QUOTE_ALL)
    writer.writeheader()
    writer.writerows(rows)

print(f"\n✓ Wrote {len(rows)} product rows to:")
print(f"  {OUT_CSV}")
print(f"  File size: {os.path.getsize(OUT_CSV):,} bytes")
print()
print('=== Sample (first 3 rows, key columns) ===')
for r in rows[:3]:
    print(f"\n  Handle:    {r['Handle']}")
    print(f"  Title:     {r['Title']}")
    print(f"  SKU:       {r['Variant SKU']}")
    print(f"  Price:     ${r['Variant Price']} (compare at ${r['Variant Compare At Price']})")
    print(f"  Image:     {r['Image Src']}")
    print(f"  SEO Title: {r['SEO Title']}")
    print(f"  SEO Desc:  {r['SEO Description'][:100]}...")
    print(f"  Tags:      {r['Tags'][:120]}...")
