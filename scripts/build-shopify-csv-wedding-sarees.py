#!/usr/bin/env python3
"""
Build Shopify CSV for wedding sarees from /tmp/wedding-sarees-final.json.
Same structure as the sherwani CSV (v3):
- Per-product pricing: INR × 2 ÷ 90 = USD
- Compare-at: MRP × 2 ÷ 90 (from source page MRP)
- SEO-rich slug: <color>-<fabric>-wedding-saree-<work>-for-wedding
- Title: <Color> <Fabric> Wedding Saree with <Work> | LuxeMia
- Body HTML with 8 H3 sections (LLM-generated for 23, template for 7)
- ~60 tags per product with mid-tail + long-tail keywords
- Color swatches via Google Shopping custom labels
- Catalog number tag for inventory traceability

Output: /home/z/my-project/download/shopify-wedding-sarees-wholesalesalwar.csv
"""

import csv
import json
import re
import os

OUT_DIR = '/home/z/my-project/download'
os.makedirs(OUT_DIR, exist_ok=True)
OUT_CSV = os.path.join(OUT_DIR, 'shopify-wedding-sarees-wholesalesalwar.csv')

with open('/tmp/wedding-sarees-final.json') as f:
    products = json.load(f)

# Pricing formula: INR × 2 ÷ 90 = USD
def calc_usd_price(inr):
    return round((inr * 2) / 90)

def calc_compare_at(inr_mrp):
    return round((inr_mrp * 2) / 90)

# Shopify CSV columns
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
    s = s.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def sanitize_html(html):
    """Fix unclosed tags by appending missing closers."""
    if not html:
        return html
    tag_pattern = re.compile(r'<(/?)(p|h3|ul|li|strong)([^>]*)>', re.IGNORECASE)
    stack = []
    for match in tag_pattern.finditer(html):
        is_close = match.group(1) == '/'
        tag = match.group(2).lower()
        if is_close:
            if stack and stack[-1] == tag:
                stack.pop()
        else:
            attrs = match.group(3)
            if not attrs.endswith('/'):
                stack.append(tag)
    for tag in reversed(stack):
        html += f'</{tag}>'
    return html


def build_handle(p, idx):
    """Build SEO-rich slug: <color>-<fabric>-wedding-saree-<work>-for-wedding"""
    color = slugify(p.get('color') or 'saree')
    fabric = slugify(p.get('fabric') or 'silk')
    work = slugify(p.get('work') or 'embroidery')
    
    handle = f"{color}-{fabric}-wedding-saree-{work}-for-wedding"
    # Ensure ≤80 chars
    if len(handle) > 80:
        handle = f"{color}-{fabric}-wedding-saree-for-wedding"
    if len(handle) > 80:
        handle = f"{color}-wedding-saree-for-wedding"
    return handle


def build_full_title(p):
    return f"{p['seo_title']} | LuxeMia"


def build_image_alt(p):
    color = p.get('color') or ''
    fabric = p.get('fabric') or ''
    work = p.get('work') or ''
    return f"{color} {fabric} wedding saree with {work} — handcrafted Indian ethnic wear by LuxeMia"


def build_tags(p, idx):
    color = (p.get('color') or '').lower()
    # Normalize the source typo "Turquiose" → "Turquoise" in tags
    if color == 'turquiose':
        color = 'turquoise'
    color_slug = color.replace(' ', '-')
    fabric = (p.get('fabric') or '').lower()
    fabric_slug = fabric.replace(' ', '-')
    work = (p.get('work') or 'embroidery').lower()
    work_slug = work.replace(' ', '-')
    occasion = 'wedding'  # primary
    occasion_secondary = (p.get('occasion') or 'party wear').lower()
    
    # Catalog number (1-30 for the 30 products on page 1)
    catalog_num = f"WS{idx:02d}"  # WS = Wedding Sarees
    
    tags = [
        # Product type
        'saree', 'indian saree', 'sari', 'wedding saree', 'bridal saree',
        'saree for wedding', 'indian wedding saree',
        
        # Color
        color,
        f'{color} saree',
        f'{color} wedding saree',
        f'{color} {fabric} saree',
        
        # Fabric
        fabric,
        f'{fabric} saree',
        f'{fabric} wedding saree',
        f'pure {fabric}',
        
        # Work
        work,
        f'{work} work',
        f'{work} saree',
        f'{work} wedding saree',
        
        # Occasion
        occasion, 'bridal', 'reception', 'engagement', 'mehendi',
        f'{occasion} saree',
        'wedding guest saree',
        f'saree for {occasion}',
        f'saree for {occasion} guest',
        f'saree for {occasion} bride',
        f'{occasion_secondary} saree',
        
        # Audience
        'bride', 'bridesmaid', 'mother of bride', 'wedding guest',
        'nri', 'nri bride', 'indian american bride',
        
        # Mid-tail keywords (3-4 words)
        f'{color} saree for wedding',
        f'{color} {fabric} for wedding',
        f'{work} saree for wedding',
        f'indian bride {occasion} wear',
        f'saree for indian {occasion}',
        
        # Long-tail keywords (5-7 words)
        f'{color} {fabric} saree for wedding',
        f'{color} {fabric} {work} saree for wedding',
        f'buy {color} saree online usa',
        f'{color} saree for indian wedding',
        f'premium {fabric} saree for wedding',
        f'handcrafted {work} saree for bride',
        f'saree for wedding in usa',
        f'saree for wedding in canada',
        f'saree for wedding in australia',
        
        # Collection
        'wedding sarees collection',
        'wholesalesalwar wedding sarees',
        
        # Brand + status
        'LuxeMia', 'gender:female', 'women', 'womenswear',
        'new arrival', 'handcrafted', 'premium ethnic wear',
        'worldwide shipping', 'free shipping over 350',
        
        # Catalog number for inventory traceability
        f'catalog:{catalog_num}',
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


# Build CSV rows
rows = []
seen_handles = set()

for idx, p in enumerate(products, 1):
    title = build_full_title(p)
    handle = build_handle(p, idx)
    
    # Ensure handle uniqueness — append catalog number if collision
    base_handle = handle
    suffix = 2
    while handle in seen_handles:
        handle = f"{base_handle}-ws{idx:02d}"
        suffix += 1
        if suffix > 10:
            handle = f"{base_handle}-{p.get('sku') or idx}"
            break
    seen_handles.add(handle)
    
    # SKU — use source SKU if available, otherwise use catalog number
    source_sku = p.get('sku') or f'WS{idx:02d}'
    sku = f"LUX-SAR-WS-{source_sku}"
    
    # Pricing
    usd_price = calc_usd_price(p['price_inr'])
    usd_compare_at = calc_compare_at(p['mrp_inr'])
    
    # Color for Google Shopping (normalize typo)
    color_gs = p.get('color') or ''
    if color_gs.lower() == 'turquiose':
        color_gs = 'Turquoise'
    
    row = {
        'Handle': handle,
        'Title': title,
        'Body (HTML)': sanitize_html(p['body_html']),
        'Vendor': 'LuxeMia',
        'Product Category': '',
        'Type': 'Wedding Saree',
        'Tags': build_tags(p, idx),
        'Published': 'TRUE',
        'Option1 Name': 'Title',
        'Option1 Value': 'Default Title',
        'Option2 Name': '', 'Option2 Value': '',
        'Option3 Name': '', 'Option3 Value': '',
        'Variant SKU': sku,
        'Variant Grams': '700',  # ~700g for a saree with blouse piece
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Qty': '10',
        'Variant Inventory Policy': 'deny',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': f"{usd_price:.2f}",
        'Variant Compare At Price': f"{usd_compare_at:.2f}",
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Barcode': '',
        'Image Src': p['image_url'],
        'Image Position': '1',
        'Image Alt Text': build_image_alt(p),
        'Gift Card': 'FALSE',
        'SEO Title': p['seo_title'],
        'SEO Description': p['seo_description'],
        'Google Shopping / Google Product Category': '5424',  # Sarees & Blouses
        'Google Shopping / Gender': 'female',
        'Google Shopping / Age Group': 'adult',
        'Google Shopping / MPN': sku,
        'Google Shopping / Condition': 'new',
        'Google Shopping / Custom Product': 'FALSE',
        'Google Shopping / Custom Label 0': 'Wedding Saree',
        'Google Shopping / Custom Label 1': p.get('fabric') or '',
        'Google Shopping / Custom Label 2': color_gs,
        'Google Shopping / Custom Label 3': p.get('work') or '',
        'Google Shopping / Custom Label 4': 'Wedding Sarees Collection',
        'Variant Image': p['image_url'],
        'Variant Weight Unit': 'g',
        'Variant Tax Code': '',
        'Cost per item': f"{p['price_inr'] / 90:.2f}",  # INR wholesale / 90
        'Included / United States': 'TRUE',
        'Price / United States': f"{usd_price:.2f}",
        'Compare At Price / United States': f"{usd_compare_at:.2f}",
        'Included / International': 'TRUE',
        'Price / International': f"{usd_price:.2f}",
        'Compare At Price / International': f"{usd_compare_at:.2f}",
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
print(f"  Shopify CSV generated: Wedding Sarees from wholesalesalwar.com")
print(f"{'='*70}")
print(f"  File: {OUT_CSV}")
print(f"  Size: {os.path.getsize(OUT_CSV):,} bytes")
print(f"  Products: {len(rows)}")
print(f"  Pricing: INR × 2 ÷ 90 = USD (per-product wholesale from source)")
print(f"  Compare-at: source MRP × 2 ÷ 90 (preserves the 22% discount)")
print(f"{'='*70}\n")

print(f"=== Pricing summary ===\n")
print(f"  {'#':<3} {'SKU':<10} {'INR ₹':>8} {'USD $':>6} {'Cmp $':>6} {'Disc%':>6}  Title")
for idx, r in enumerate(rows, 1):
    p = products[idx-1]
    inr = p['price_inr']
    usd = float(r['Variant Price'])
    cmp = float(r['Variant Compare At Price'])
    disc = (1 - usd / cmp) * 100 if cmp > 0 else 0
    print(f"  {idx:<3} {p.get('sku') or 'N/A':<10} ₹{inr:>6,} ${usd:>5.0f} ${cmp:>5.0f} {disc:>5.0f}%  {r['Title'][:55]}")

print(f"\n=== Final product list (handle, title, price) ===\n")
for idx, r in enumerate(rows, 1):
    p = products[idx-1]
    print(f"  {r['Handle']}")
    print(f"    Title:  {r['Title']}")
    print(f"    SKU:    {r['Variant SKU']}  |  ${r['Variant Price']} (compare ${r['Variant Compare At Price']})")
    print(f"    SEO T:  {r['SEO Title']} ({len(r['SEO Title'])} chars)")
    print(f"    SEO D:  {r['SEO Description'][:100]}... ({len(r['SEO Description'])} chars)")
    print(f"    Tags:   {len(r['Tags'].split(','))} tags")
    print()
