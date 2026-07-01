#!/usr/bin/env python3
"""
Generate a Shopify product import CSV from /tmp/sherwani-final-v2.json.

Key changes from v1:
- Pricing: INR wholesale × 2 ÷ 90 = USD price
- Slug/handle: includes color, fabric, type, embroidery, occasion, audience
- Title: includes color, fabric, embroidery, occasion
- Tags: expanded with mid-tail + long-tail keywords for Google/Bing/AI search
- SEO Title + Description: include occasion + audience + shipping
- Compare-at: 28.7% above sale price ($399 vs $310)

Output: /home/z/my-project/download/shopify-sherwani-out-luk-vol-144-v2.csv
"""

import csv
import json
import re
import os

OUT_DIR = '/home/z/my-project/download'
os.makedirs(OUT_DIR, exist_ok=True)
OUT_CSV = os.path.join(OUT_DIR, 'shopify-sherwani-out-luk-vol-144-v2.csv')

with open('/tmp/sherwani-final-v2.json') as f:
    products = json.load(f)

# Pricing config — INR wholesale × 2 ÷ 90 = USD
INR_WHOLESALE = 13990  # Mid-tier wholesale rate per sherwani
PRICE_USD = round((INR_WHOLESALE * 2) / 90, 2)
# Round to .00 ending — use $310.00
PRICE_USD = 310.00
COMPARE_AT_USD = 399.00  # ~28.7% above — clean number, looks like a deal

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


def build_tags(item):
    """Build comprehensive tag list with mid-tail + long-tail keywords.

    Tag categories:
    - Product type (sherwani, menswear, indian menswear)
    - Color (black, ivory, etc. + color + product combos)
    - Fabric (raw silk, brocade + fabric + product combos)
    - Embroidery (zardozi, sequence + work + product combos)
    - Occasion (wedding, groom, reception, engagement, sangeet, mehndi, haldi)
    - Audience (groom, groomsmen, NRI, USA, Canada, Australia)
    - Collection (out luk vol 144, armani silk, pure heavy)
    - Mid-tail keywords (3-4 word phrases)
    - Long-tail keywords (5-7 word phrases)
    - Brand + status (LuxeMia, new arrival, premium)
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


# Build CSV rows
rows = []
seen_handles = set()

for p in products:
    a = p['analysis']
    title = build_full_title(p)
    handle = build_handle(p)

    # Ensure handle uniqueness — append SKU digits if collision
    base_handle = handle
    suffix = 2
    while handle in seen_handles:
        handle = f"{base_handle}-{p['sku'][-4:]}"
        suffix += 1
        if suffix > 10:
            handle = f"{base_handle}-{p['sku']}"
            break
    seen_handles.add(handle)

    sku = f"LUX-SHW-OLV144-{p['sku']}"

    row = {
        'Handle': handle,
        'Title': title,
        'Body (HTML)': sanitize_html(p['body_html']),
        'Vendor': 'LuxeMia',
        'Product Category': '',
        'Type': 'Sherwani',
        'Tags': build_tags(p),
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
        'Variant Price': f"{PRICE_USD:.2f}",
        'Variant Compare At Price': f"{COMPARE_AT_USD:.2f}",
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Barcode': '',
        'Image Src': p['image_url'],
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
        'Variant Image': p['image_url'],
        'Variant Weight Unit': 'g',
        'Variant Tax Code': '',
        'Cost per item': '',
        'Included / United States': 'TRUE',
        'Price / United States': f"{PRICE_USD:.2f}",
        'Compare At Price / United States': f"{COMPARE_AT_USD:.2f}",
        'Included / International': 'TRUE',
        'Price / International': f"{PRICE_USD:.2f}",
        'Compare At Price / International': f"{COMPARE_AT_USD:.2f}",
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
print(f"  Shopify CSV generated: v2 with SEO + AI-search optimization")
print(f"{'='*70}")
print(f"  File: {OUT_CSV}")
print(f"  Size: {os.path.getsize(OUT_CSV):,} bytes")
print(f"  Products: {len(rows)}")
print(f"  Pricing: ₹{INR_WHOLESALE:,} wholesale × 2 ÷ 90 = ${PRICE_USD:.2f} USD")
print(f"  Compare at: ${COMPARE_AT_USD:.2f} ({(COMPARE_AT_USD/PRICE_USD - 1)*100:.1f}% above)")
print(f"{'='*70}\n")

print(f"=== Final product list (handle, title, price, occasions) ===\n")
for r in rows:
    p = next((p for p in products if f"LUX-SHW-OLV144-{p['sku']}" == r['Variant SKU']), None)
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
