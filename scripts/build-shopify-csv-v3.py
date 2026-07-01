#!/usr/bin/env python3
"""
Generate a Shopify product import CSV from /tmp/sherwani-final-v2.json
+ /tmp/sherwani-mapping.json.

Key changes from v2:
- Per-product pricing from user-supplied INR wholesale rates
- USD price = (INR × 2) / 90, rounded to nearest dollar
- Compare-at = sale × 1.30, rounded to nearest dollar
- SKU uses catalog number (14401-14411) instead of source image ID
- Catalog number added to tags for searchability

Output: /home/z/my-project/download/shopify-sherwani-out-luk-vol-144-v3.csv
"""

import csv
import json
import re
import os

OUT_DIR = '/home/z/my-project/download'
os.makedirs(OUT_DIR, exist_ok=True)
OUT_CSV = os.path.join(OUT_DIR, 'shopify-sherwani-out-luk-vol-144-v3.csv')

with open('/tmp/sherwani-final-v2.json') as f:
    products_by_source_sku = {p['sku']: p for p in json.load(f)}

with open('/tmp/sherwani-mapping.json') as f:
    mapping = json.load(f)

# Per-product INR wholesale prices (user-supplied)
INR_PRICES = {
    '14401': 5795,
    '14402': 4975,
    '14403': 8850,
    '14404': 6195,
    '14405': 7295,
    '14406': 8750,
    '14407': 3875,
    '14408': 8750,
    '14409': 4195,
    '14410': 6895,
    '14411': 4095,
}


def calc_usd_price(inr_price):
    """USD price = (INR × 2) / 90, rounded to nearest dollar."""
    return round((inr_price * 2) / 90)


def calc_compare_at(usd_price):
    """Compare-at = sale × 1.30, rounded to nearest dollar."""
    return round(usd_price * 1.30)


FIELDNAMES = [
    'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags',
    'Published', 'Option1 Name', 'Option1 Value',
    'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value',
    'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker',
    'Variant Inventory Qty', 'Variant Inventory Policy',
    'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
    'Variant Requires Shipping', 'Variant Taxable', 'Variant Barcode',
    'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card',
    'SEO Title', 'SEO Description',
    'Google Shopping / Google Product Category', 'Google Shopping / Gender',
    'Google Shopping / Age Group', 'Google Shopping / MPN',
    'Google Shopping / Condition', 'Google Shopping / Custom Product',
    'Google Shopping / Custom Label 0', 'Google Shopping / Custom Label 1',
    'Google Shopping / Custom Label 2', 'Google Shopping / Custom Label 3',
    'Google Shopping / Custom Label 4',
    'Variant Image', 'Variant Weight Unit', 'Variant Tax Code', 'Cost per item',
    'Included / United States', 'Price / United States',
    'Compare At Price / United States',
    'Included / International', 'Price / International',
    'Compare At Price / International', 'Status',
]


def slugify(s):
    """Convert string to URL-safe handle."""
    s = s.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = s.strip('-')
    return s


def sanitize_html(html):
    """Fix common LLM HTML issues:
    - Unclosed <p>, <h3>, <ul>, <li>, <strong> tags at end of body
    - Returns sanitized HTML with balanced tags.
    """
    if not html:
        return html
    # Ensure body ends with proper closing — if last paragraph has no </p>, add it
    # Find all unclosed tags by tracking stack
    tag_pattern = re.compile(r'<(/?)(p|h3|ul|li|strong)([^>]*)>', re.IGNORECASE)
    stack = []
    for match in tag_pattern.finditer(html):
        is_close = match.group(1) == '/'
        tag = match.group(2).lower()
        if is_close:
            if stack and stack[-1] == tag:
                stack.pop()
            # else: stray closing tag — leave it, browser will ignore
        else:
            # Self-closing check (e.g., <p/> — rare but possible)
            attrs = match.group(3)
            if not attrs.endswith('/'):
                stack.append(tag)
    # Append missing closing tags in reverse order
    for tag in reversed(stack):
        html += f'</{tag}>'
    return html


def build_handle(item):
    """Build SEO-rich slug: <color>-<fabric>-sherwani-<embroidery>-for-<occasion>-<audience>.

    Examples:
    - black-brocade-sherwani-sequence-for-wedding-groom
    - ivory-raw-silk-sherwani-zardozi-for-engagement
    - royal-blue-brocade-sherwani-zardozi-for-sangeet

    Handles 'Groom Wedding' occasion specially (avoid 'groom-groom' duplication).
    """
    a = item['analysis']
    color = slugify(a['color_primary'])
    fabric = slugify(a['fabric'])
    embroidery = slugify(a['embroidery'].replace(' Work', '').replace(' Thread', ''))
    occasion_raw = item['occasions'][0].lower()
    # If occasion already contains 'groom', don't append audience 'groom'
    audience = '' if 'groom' in occasion_raw else '-groom'
    occasion = slugify(item['occasions'][0])

    # Drop "work" / "thread" from embroidery for shorter slug
    handle = f"{color}-{fabric}-sherwani-{embroidery}-for-{occasion}{audience}"
    # Ensure ≤80 chars (Shopify handle limit)
    if len(handle) > 80:
        # Try without audience
        handle = f"{color}-{fabric}-sherwani-{embroidery}-for-{occasion}"
    if len(handle) > 80:
        # Drop embroidery
        handle = f"{color}-{fabric}-sherwani-for-{occasion}{audience}"
    return handle


def build_full_title(item):
    """Shopify product title — SEO title + ' | LuxeMia' suffix."""
    return f"{item['seo_title']} | LuxeMia"


def build_image_alt(item):
    """Descriptive alt text for accessibility + image SEO."""
    a = item['analysis']
    occasions = item['occasions']
    return (f"{a['color_primary']} {a['fabric']} sherwani with {a['embroidery']} "
            f"for {occasions[0]} groom — handcrafted Indian menswear by LuxeMia")


def build_tags(item, catalog_num=None):
    """Build comprehensive tag list with mid-tail + long-tail keywords.
    """
    a = item['analysis']
    color = a['color_primary'].lower()
    color_sec = (a.get('color_secondary') or '').lower()
    fabric = a['fabric'].lower()
    embroidery = a['embroidery'].lower().replace(' work', '').replace(' thread', '')
    occasions = [o.lower() for o in item['occasions']]
    occ1 = occasions[0]
    occ2 = occasions[1] if len(occasions) > 1 else occ1

    tags = [
        # Product type
        'sherwani', 'indian sherwani', 'menswear', 'indian menswear',
        'groom wear', 'groom sherwani', 'wedding sherwani',

        # Color (primary)
        color,
        f'{color} sherwani',
        f'{color} {fabric} sherwani',

        # Color (secondary, if any)
    ]
    if color_sec and color_sec != 'none':
        tags.append(color_sec)
        tags.append(f'{color} {color_sec} sherwani')

    tags.extend([
        # Fabric
        fabric,
        f'{fabric} sherwani',
        f'pure {fabric}',
        'armani silk',  # Collection name
        'pure heavy armani',

        # Embroidery
        embroidery,
        f'{embroidery} work',
        f'{embroidery} sherwani',
        f'{fabric} {embroidery} sherwani',

        # Occasions
        occ1, occ2,
        f'{occ1} sherwani',
        f'{occ2} sherwani',
        f'sherwani for {occ1}',
        f'sherwani for {occ2}',
        'indian wedding', 'wedding wear', 'wedding outfit',

        # Audience
        'groom', 'groomsmen', 'groom to be',
        'nri', 'nri groom', 'indian american groom',

        # Mid-tail keywords (3-4 words)
        f'{color} sherwani for {occ1}',
        f'{color} {fabric} for {occ1}',
        f'{embroidery} sherwani for {occ1}',
        f'indian groom {occ1} wear',
        f'sherwani for indian {occ1}',

        # Long-tail keywords (5-7 words) — high-intent search queries
        f'{color} {fabric} sherwani for {occ1} groom',
        f'{color} {fabric} {embroidery} sherwani for {occ1}',
        f'buy {color} sherwani online usa',
        f'{color} sherwani for indian {occ1}',
        f'premium {fabric} sherwani for {occ1}',
        f'handcrafted {embroidery} sherwani for groom',
        f'sherwani for {occ1} in usa',
        f'sherwani for {occ1} in canada',
        f'sherwani for {occ1} in australia',

        # Collection
        'out luk vol 144',
        'out luk volume 144',
        'pure heavy armani collection',
        'sequence work collection',

        # Brand + status
        'LuxeMia', 'gender:male', 'men', 'menswear',
        'new arrival', 'handcrafted', 'premium menswear',
        'worldwide shipping', 'free shipping over 350',
    ])

    # Add catalog number as a tag for searchability
    if catalog_num:
        tags.append(f'catalog:{catalog_num}')

    # Remove duplicates while preserving order
    seen = set()
    unique = []
    for t in tags:
        t = t.strip()
        if t and t not in seen:
            seen.add(t)
            unique.append(t)
    return ', '.join(unique)


def build_metafields_description(item):
    """For Cost per item — leave blank for admin to set."""
    return ''


# Build CSV rows — iterate in catalog order (14401, 14402, ...)
rows = []
seen_handles = set()

for m in mapping:
    catalog_num = m['catalog_num']
    source_sku = m['source_sku']
    image_url = m['image_url']

    if source_sku not in products_by_source_sku:
        print(f'⚠️  Source SKU {source_sku} (catalog {catalog_num}) not found in VLM/LLM data — skipping.')
        continue

    p = products_by_source_sku[source_sku]
    # Attach catalog number + override image URL (use mapping's authoritative URL)
    p['catalog_num'] = catalog_num
    p['image_url'] = image_url

    a = p['analysis']
    title = build_full_title(p)
    handle = build_handle(p)

    # Ensure handle uniqueness — append catalog number if collision
    base_handle = handle
    suffix = 2
    while handle in seen_handles:
        handle = f"{base_handle}-{catalog_num}"
        suffix += 1
        if suffix > 10:
            handle = f"{base_handle}-{source_sku}"
            break
    seen_handles.add(handle)

    # SKU uses catalog number (more meaningful than source image ID)
    sku = f"LUX-SHW-OLV144-{catalog_num}"

    # Per-product pricing from user-supplied INR wholesale
    inr_price = INR_PRICES[catalog_num]
    price_usd = calc_usd_price(inr_price)
    compare_at_usd = calc_compare_at(price_usd)

    row = {
        'Handle': handle,
        'Title': title,
        'Body (HTML)': sanitize_html(p['body_html']),
        'Vendor': 'LuxeMia',
        'Product Category': '',
        'Type': 'Sherwani',
        'Tags': build_tags(p, catalog_num),
        'Published': 'TRUE',
        'Option1 Name': 'Title',
        'Option1 Value': 'Default Title',
        'Option2 Name': '', 'Option2 Value': '',
        'Option3 Name': '', 'Option3 Value': '',
        'Variant SKU': sku,
        'Variant Grams': '1500',
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Qty': '10',
        'Variant Inventory Policy': 'deny',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': f"{price_usd:.2f}",
        'Variant Compare At Price': f"{compare_at_usd:.2f}",
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Barcode': '',
        'Image Src': image_url,
        'Image Position': '1',
        'Image Alt Text': build_image_alt(p),
        'Gift Card': 'FALSE',
        'SEO Title': p['seo_title'],
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
        'Variant Image': image_url,
        'Variant Weight Unit': 'g',
        'Variant Tax Code': '',
        'Cost per item': f"{inr_price / 90:.2f}",  # INR wholesale converted to USD at 90 INR/USD
        'Included / United States': 'TRUE',
        'Price / United States': f"{price_usd:.2f}",
        'Compare At Price / United States': f"{compare_at_usd:.2f}",
        'Included / International': 'TRUE',
        'Price / International': f"{price_usd:.2f}",
        'Compare At Price / International': f"{compare_at_usd:.2f}",
        'Status': 'active',
    }
    rows.append(row)

# Write CSV
with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=FIELDNAMES, quoting=csv.QUOTE_ALL)
    writer.writeheader()
    writer.writerows(rows)

# Validation + summary
print(f"\n{'='*70}")
print(f"  Shopify CSV generated: v3 with per-product pricing")
print(f"{'='*70}")
print(f"  File: {OUT_CSV}")
print(f"  Size: {os.path.getsize(OUT_CSV):,} bytes")
print(f"  Products: {len(rows)}")
print(f"  Pricing formula: INR × 2 ÷ 90 = USD (per-product wholesale rates)")
print(f"  Compare-at: sale × 1.30 (rounded to nearest dollar)")
print(f"{'='*70}\n")

print(f"=== Pricing summary ===\n")
print(f"  {'Cat#':<6} {'Source SKU':<10} {'INR':>8} {'USD':>6} {'Cmp@':>6} {'Disc%':>6}  Title")
for r in rows:
    p = next((p for p in products_by_source_sku.values() if p.get('catalog_num') and f"LUX-SHW-OLV144-{p['catalog_num']}" == r['Variant SKU']), None)
    if not p:
        continue
    catalog_num = p['catalog_num']
    inr = INR_PRICES[catalog_num]
    usd = float(r['Variant Price'])
    cmp = float(r['Variant Compare At Price'])
    disc_pct = (1 - usd / cmp) * 100
    print(f"  {catalog_num:<6} {p['sku']:<10} ₹{inr:>6,} ${usd:>5.0f} ${cmp:>5.0f} {disc_pct:>5.0f}%  {r['Title'][:55]}")

print(f"\n=== Final product list (handle, title, price, occasions) ===\n")
for r in rows:
    p = next((p for p in products_by_source_sku.values() if p.get('catalog_num') and f"LUX-SHW-OLV144-{p['catalog_num']}" == r['Variant SKU']), None)
    if p:
        occs = ' + '.join(p['occasions'])
    else:
        occs = '?'
    print(f"  {r['Handle']}")
    print(f"    Title:  {r['Title']}")
    print(f"    SKU:    {r['Variant SKU']}  |  ${r['Variant Price']} (compare ${r['Variant Compare At Price']})  |  Occasions: {occs}")
    print(f"    SEO T:  {r['SEO Title']} ({len(r['SEO Title'])} chars)")
    print(f"    SEO D:  {r['SEO Description'][:100]}... ({len(r['SEO Description'])} chars)")
    print(f"    Tags:   {len(r['Tags'].split(','))} tags")
    print(f"    Image:  {r['Image Src']}")
    print()
