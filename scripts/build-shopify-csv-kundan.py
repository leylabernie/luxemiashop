#!/usr/bin/env python3
"""
Build Shopify CSV for Kundan jewelry products.

Uses template-based body HTML (no LLM) for all 17 products since the LLM
rate-limit storm prevented generation. Template uses the same 8-section
structure as the sherwani/wedding-saree CSVs:
1. Direct-answer opening paragraph
2. Why Brides Choose <Stone Type> <Jewelry Type>
3. What Makes This <Stone Type> Piece Special
4. Perfect For These Occasions
5. How to Style This <Color> Kundan Necklace
6. Jewelry Care & Shipping
7. Frequently Asked Questions
8. The LuxeMia Promise

Each product's body HTML is dynamically generated using its VLM-extracted
attributes (color, stone type, jewelry type, style notes, metal color).

Pricing: $80-$150 USD per user instruction, with compare-at = sale × 1.30
(preserves ~23% discount display).

Output: /home/z/my-project/download/shopify-kundan-bridal-jewelry.csv
"""

import csv
import json
import re
import os
import shutil

OUT_DIR = '/home/z/my-project/download'
os.makedirs(OUT_DIR, exist_ok=True)
OUT_CSV = os.path.join(OUT_DIR, 'shopify-kundan-bridal-jewelry.csv')

# Also copy the images into download/ so Shopify can grab them from a stable path
# if needed (Shopify will re-host on import anyway, but having a local copy helps
# for verification)
IMG_OUT_DIR = os.path.join(OUT_DIR, 'kundan-images')
os.makedirs(IMG_OUT_DIR, exist_ok=True)

with open('/tmp/kundan-products-paired.json') as f:
    products = json.load(f)


# ─── Image hosting ──────────────────────────────────────────────────────────
# Shopify can't fetch images from /tmp paths. We need stable URLs.
# Strategy: copy images to /home/z/my-project/download/kundan-images/ and use
# relative paths in the CSV. Shopify will then re-host them on import.
# BUT — Shopify CSV requires absolute URLs for Image Src.
# Best approach: use the original Google Drive direct-download URLs (still valid).
with open('/tmp/gdrive-mapping.json') as f:
    gdrive_map = json.load(f)
# Build filename → file_id map (use first occurrence for deduped files)
fname_to_fid = {}
for entry in gdrive_map:
    if entry['filename'] not in fname_to_fid:
        fname_to_fid[entry['filename']] = entry['file_id']

def get_image_url(filename):
    """Return a stable URL for the image. Use Google Drive direct-download URL."""
    if not filename:
        return None
    fid = fname_to_fid.get(filename)
    if fid:
        return f"https://drive.google.com/uc?export=view&id={fid}"
    return None


# ─── Template-based body HTML generator ─────────────────────────────────────
# Per-color styling recommendations
COLOR_STYLING = {
    'Clear': ('a red, maroon, or wine bridal lehenga for classic contrast', 'gold jhumkas or chandbalis as secondary earrings'),
    'Pearl White': ('an ivory, cream, or pastel lehenga for a soft romantic look', 'pearl-detailed kaleeras and a pearl-embroidered potli bag'),
    'Multicolor': ('a multi-colored or pastel bridal lehenga that picks up the stone colors', 'minimal additional jewelry to let the necklace be the statement piece'),
    'Green': ('a red, maroon, or pink bridal lehenga for complementary contrast', 'green-stone kaleeras and a matching emerald ring'),
    'Red': ('a gold, cream, or ivory bridal lehenga to let the red stones pop', 'gold bangles and a delicate nose ring for traditional polish'),
}

# Per-stone-type craftsmanship description
STONE_CRAFT = {
    'kundan with stone': 'hand-set Kundan stones framed with uncut polki accents, using traditional Rajasthani setting techniques passed down through generations of master jewelers',
    'kundan': 'hand-set Kundan stones using traditional Rajasthani setting techniques, where each stone is framed in 24k gold foil and set by master jewelers',
    'uncut polki': 'natural uncut polki diamonds set in traditional Indian style, with each stone hand-selected for its unique character and fire',
    'mixed': 'a combination of Kundan stones, uncut polki, and accent stones, set using traditional Rajasthani techniques',
}

def generate_body_html(p):
    a = p['analysis']
    color = a.get('color_primary', 'Clear')
    stone = a.get('stone_type', 'kundan with stone')
    stone_clean = stone.replace(' with stone', ' with Stone').title()
    jtype = a.get('jewelry_type', 'necklace set')
    jtype_clean = jtype.replace('_', ' ').title()
    style_notes = a.get('style_notes', '')
    metal = a.get('metal_color', 'gold')
    occasion = a.get('occasion', 'bridal').title()
    has_maang_tikka = 'maang tikka' in style_notes.lower() or jtype == 'full bridal set'
    
    includes = 'necklace, matching earrings, and maang tikka' if has_maang_tikka else 'necklace and matching earrings'
    craft = STONE_CRAFT.get(stone, STONE_CRAFT['kundan with stone'])
    styling_outfit, styling_acc = COLOR_STYLING.get(color, COLOR_STYLING['Clear'])
    
    body = f"""<p>The {color.lower()} {stone.lower()} {jtype.lower()} is designed for the modern NRI bride who wants to make a regal statement on her wedding day. This handcrafted piece includes {includes}, with each stone set by master jewelers using traditional Indian techniques. {style_notes.capitalize() if style_notes else 'The intricate detailing photographs beautifully in both natural daylight and evening lighting.'}</p>

<h3>Why Brides Choose {stone_clean} {jtype_clean}</h3>
<p>{stone_clean} jewelry has been a cornerstone of Indian bridal adornment for centuries, prized for its regal appearance and the way it catches light from every angle. The {metal} setting complements a wide range of bridal lehengas and sarees, while the {color.lower()} stones flatter most skin tones and pair effortlessly with both gold and diamond accent jewelry. Brides love {stone_clean.lower()} for its versatility — equally appropriate for the main wedding ceremony, the reception, or pre-wedding events like the mehendi and sangeet.</p>

<h3>What Makes This {stone_clean} Piece Special</h3>
<p>Each piece in our Kundan collection features {craft}. The setting uses fine metal work and traditional techniques passed down through generations of Indian artisans. Every motif is intentional — drawing from Mughal-era florals, paisley patterns, and geometric borders that have graced Indian bridal jewelry for centuries. The result is a piece that feels both deeply traditional and refreshingly modern.</p>

<h3>Perfect For These Occasions</h3>
<ul>
<li><strong>Wedding ceremonies</strong> — The rich stone work and intricate detailing make it ideal for the main wedding day</li>
<li><strong>Reception parties</strong> — Statement piece that photographs beautifully under evening lighting</li>
<li><strong>Engagement functions</strong> — Sophisticated choice for this intimate pre-wedding celebration</li>
<li><strong>Sangeet and mehendi</strong> — Stand out at every pre-wedding celebration</li>
</ul>

<h3>How to Style This {color} Kundan Necklace</h3>
<p>Pair this {color.lower()} {stone.lower()} {jtype.lower()} with {styling_outfit}. Complete the look with {styling_acc}. For footwear, choose embroidered mojaris or heels in gold or nude tones. Add a fresh flower gajra in your hair for traditional ceremonies, or opt for a maang tikka and jhoomar for a more regal reception look.</p>

<h3>Jewelry Care & Shipping</h3>
<ul>
<li><strong>Care:</strong> Store in the provided velvet pouch away from moisture and direct sunlight. Avoid contact with perfume, hairspray, and water. Gently wipe with a soft dry cloth after each wear.</li>
<li><strong>Maintenance:</strong> For deep cleaning, take to a professional jewelry cleaner. Do not use chemical cleaners at home — they can damage the Kundan setting.</li>
<li><strong>Shipping:</strong> Free DHL/USPS/UPS delivery to USA, Canada, and Australia within 7-10 business days. Each piece ships in a signature gift box.</li>
</ul>

<h3>Frequently Asked Questions</h3>
<p><strong>Is this Kundan jewelry or real diamond jewelry?</strong> Our Kundan jewelry uses traditional Indian stone-setting techniques with glass-based Kundan stones and uncut polki accents. It offers the look of fine diamond jewelry at a fraction of the cost, making it perfect for brides who want a regal appearance without the investment of real diamonds.</p>
<p><strong>What's included in the set?</strong> This set includes {includes}. The necklace features an adjustable dori (thread) closure for a comfortable fit, and the earrings come with secure push-backs.</p>
<p><strong>How long does shipping take to USA, Canada, Australia?</strong> We offer express shipping via DHL/USPS/UPS with delivery in 7-10 business days to all three countries. Shipping is free on orders over $350, with a flat $25 rate for orders under $350.</p>

<h3>The LuxeMia Promise</h3>
<p>Every piece in our Kundan collection is hand-selected for its exceptional craftsmanship, traditional techniques, and timeless appeal. We're proud to offer worldwide shipping directly from our Philadelphia headquarters to your doorstep — bringing authentic Indian bridal jewelry to NRI brides across USA, Canada, and Australia.</p>"""
    
    return body


def generate_seo_title(p):
    a = p['analysis']
    stone = a['stone_type'].replace(' with stone', ' with Stone').title()
    jtype = a['jewelry_type']
    if jtype == 'full bridal set':
        type_label = 'Bridal Set'
    elif jtype == 'necklace set':
        type_label = 'Necklace Set'
    else:
        type_label = jtype.replace('_', ' ').title()
    
    candidates = [
        f"{stone} {type_label} for Wedding",
        f"{stone} {type_label} for Bridal",
        f"{a['color_primary']} {stone} {type_label}",
        f"{stone} {type_label}",
    ]
    for c in candidates:
        if len(c) <= 60:
            return c
    return candidates[-1]


def generate_seo_description(p):
    a = p['analysis']
    stone = a['stone_type'].replace(' with stone', ' with Stone').lower()
    jtype = a['jewelry_type'].replace('_', ' ').lower()
    color = a['color_primary'].lower()
    
    candidates = [
        f"Shop this {color} {stone} {jtype} for weddings. Handcrafted for brides. Free shipping USA, Canada, Australia.",
        f"{a['color_primary']} {stone} {jtype} for brides — handcrafted Indian bridal jewelry. Free shipping over $350 to USA, Canada & Australia.",
        f"Buy {color} {stone} {jtype} online. Premium bridal jewelry. Free shipping to USA, Canada, Australia.",
    ]
    for c in candidates:
        if len(c) <= 155:
            return c
    return candidates[0].slice(0, 152).trimEnd() + '…' if False else candidates[0][:152].rstrip() + '…'


def disambiguate_seo_titles(products):
    """If multiple products have the same SEO title, append color or color+index."""
    title_counts = {}
    for p in products:
        title_counts[p['seo_title']] = title_counts.get(p['seo_title'], 0) + 1
    
    seen = {}
    for p in products:
        if title_counts[p['seo_title']] > 1:
            seen[p['seo_title']] = seen.get(p['seo_title'], 0) + 1
            if seen[p['seo_title']] > 1:
                # Append color
                a = p['analysis']
                candidate = f"{p['seo_title']} {a['color_primary']}"
                if len(candidate) > 60:
                    candidate = f"{p['seo_title'].split(' for ')[0]} {a['color_primary']}"
                if len(candidate) > 60:
                    candidate = f"{p['seo_title']} #{p['product_idx']}"
                p['seo_title'] = candidate


# ─── Shopify CSV columns ────────────────────────────────────────────────────
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


def build_handle(p):
    a = p['analysis']
    color = slugify(a['color_primary'])
    stone = slugify(a['stone_type'].replace(' with stone', ''))
    jtype = 'necklace-set' if a['jewelry_type'] != 'full bridal set' else 'bridal-set'
    
    handle = f"{color}-{stone}-{jtype}-for-wedding"
    if len(handle) > 80:
        handle = f"{color}-{stone}-{jtype}-for-wedding"
    if len(handle) > 80:
        handle = f"{color}-{stone}-for-wedding"
    return handle


def build_full_title(p):
    return f"{p['seo_title']} | LuxeMia"


def build_image_alt(p):
    a = p['analysis']
    color = a['color_primary']
    stone = a['stone_type'].replace(' with stone', 'with Stone')
    jtype = a['jewelry_type'].replace('_', ' ').title()
    return f"{color} {stone} {jtype} — handcrafted Indian bridal jewelry by LuxeMia"


def build_tags(p):
    a = p['analysis']
    color = a['color_primary'].lower()
    stone = a['stone_type'].lower().replace(' with stone', '')
    stone_label = a['stone_type'].replace(' with stone', ' with Stone').lower()
    jtype = a['jewelry_type'].replace('_', ' ').lower()
    occasion = a.get('occasion', 'bridal').lower()
    catalog_num = f"KJ{p['product_idx']:02d}"  # KJ = Kundan Jewelry
    
    tags = [
        # ─── Tag-prefixes (preferred by productFilters.ts v2) ───
        f'color:{color}',
        f'stone:{stone}',
        f'material:kundan',
        f'occasion:{occasion}',
        'occasion:wedding',
        'occasion:reception',
        'role:bride',
        'role:bridesmaid',
        'audience:nri',
        'gender:female',
        f'metal:{a.get("metal_color", "gold")}',
        
        # ─── Bare tags ───
        
        # Product type
        'kundan jewelry', 'indian jewelry', 'bridal jewelry', 'wedding jewelry',
        'kundan necklace', 'kundan necklace set', 'bridal necklace set',
        'indian bridal jewelry', 'wedding necklace set',
        
        # Stone
        stone,
        f'{stone} jewelry',
        f'{stone} necklace',
        'kundan', 'polki', 'uncut polki',
        
        # Color
        color,
        f'{color} jewelry',
        f'{color} necklace',
        f'{color} kundan necklace',
        
        # Jewelry type
        jtype,
        f'{jtype} for wedding',
        'necklace set', 'choker necklace', 'bridal set',
        
        # Occasion
        occasion, 'wedding', 'bridal', 'reception', 'engagement',
        'mehendi', 'sangeet',
        f'{occasion} jewelry',
        'wedding jewelry set',
        f'jewelry for {occasion}',
        f'jewelry for wedding',
        
        # Audience
        'bride', 'bridesmaid', 'mother of bride', 'wedding guest',
        'nri', 'nri bride', 'indian american bride',
        
        # Mid-tail keywords (3-4 words)
        f'{color} kundan for wedding',
        f'{stone} necklace for wedding',
        f'indian bride {occasion} jewelry',
        f'kundan jewelry for wedding',
        
        # Long-tail keywords (5-7 words)
        f'{color} {stone} necklace for wedding',
        f'{color} kundan {jtype} for bride',
        f'buy kundan jewelry online usa',
        f'kundan necklace for indian wedding',
        f'premium {stone} necklace for wedding',
        f'handcrafted kundan jewelry for bride',
        f'bridal jewelry for wedding in usa',
        f'bridal jewelry for wedding in canada',
        f'bridal jewelry for wedding in australia',
        
        # Collection
        'kundan bridal jewelry collection',
        
        # Brand + status
        'LuxeMia', 'gender:female', 'women', 'womenswear',
        'new arrival', 'handcrafted', 'premium jewelry',
        'worldwide shipping', 'free shipping over 350',
        
        # Catalog number
        f'catalog:{catalog_num}',
    ]
    
    # Remove duplicates
    seen = set()
    unique = []
    for t in tags:
        t = t.strip()
        if t and t not in seen:
            seen.add(t)
            unique.append(t)
    return ', '.join(unique)


# ─── Generate SEO content + body HTML for all products ──────────────────────
print(f"Generating template-based body HTML + SEO content for {len(products)} products...\n")

for p in products:
    p['seo_title'] = generate_seo_title(p)
    p['seo_description'] = generate_seo_description(p)
    p['body_html'] = generate_body_html(p)
    print(f"  ✓ {p['product_idx']}. {p['name']}")

# Disambiguate duplicate SEO titles
disambiguate_seo_titles(products)

print(f"\n=== Final SEO titles ===")
for p in products:
    print(f"  {p['product_idx']:2}. ({p['seo_title'].length() if hasattr(p['seo_title'], 'length') else len(p['seo_title'])} chars) {p['seo_title']}")


# ─── Build CSV rows ─────────────────────────────────────────────────────────
rows = []
seen_handles = set()

for p in products:
    title = build_full_title(p)
    handle = build_handle(p)
    
    # Ensure handle uniqueness — append catalog number if collision
    base_handle = handle
    suffix = 2
    while handle in seen_handles:
        handle = f"{base_handle}-kj{p['product_idx']:02d}"
        suffix += 1
        if suffix > 10:
            handle = f"{base_handle}-{p['product_idx']}"
            break
    seen_handles.add(handle)
    
    sku = f"LUX-KJ-KJ{p['product_idx']:02d}"
    
    # Primary image (mockup if available, else product-only)
    primary_image_url = get_image_url(p['primary_image'])
    secondary_image_url = get_image_url(p['secondary_image']) if p['secondary_image'] else None
    
    # If we have 2 images, the primary row gets Image Position 1, and we add a second row for Image Position 2
    # Shopify CSV format: 1 row per product variant, plus additional rows for additional images
    # (each additional image gets its own row with same Handle but blank Variant fields)
    
    a = p['analysis']
    color_gs = a['color_primary']
    stone_gs = a['stone_type'].replace(' with stone', ' with Stone')
    
    # Main row (with variant + primary image)
    main_row = {
        'Handle': handle,
        'Title': title,
        'Body (HTML)': sanitize_html(p['body_html']),
        'Vendor': 'LuxeMia',
        'Product Category': '188',  # Apparel & Accessories > Jewelry
        'Type': 'Kundan Necklace Set',
        'Tags': build_tags(p),
        'Published': 'TRUE',
        'Option1 Name': 'Title',
        'Option1 Value': 'Default Title',
        'Option2 Name': '', 'Option2 Value': '',
        'Option3 Name': '', 'Option3 Value': '',
        'Variant SKU': sku,
        'Variant Grams': '300',  # ~300g for a necklace set
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Qty': '5',
        'Variant Inventory Policy': 'deny',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': f"{p['price_usd']:.2f}",
        'Variant Compare At Price': f"{p['compare_at_usd']:.2f}",
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Barcode': '',
        'Image Src': primary_image_url,
        'Image Position': '1',
        'Image Alt Text': build_image_alt(p),
        'Gift Card': 'FALSE',
        'SEO Title': p['seo_title'],
        'SEO Description': p['seo_description'],
        'Google Shopping / Google Product Category': '188',  # Jewelry
        'Google Shopping / Gender': 'female',
        'Google Shopping / Age Group': 'adult',
        'Google Shopping / MPN': sku,
        'Google Shopping / Condition': 'new',
        'Google Shopping / Custom Product': 'FALSE',
        'Google Shopping / Custom Label 0': 'Kundan Jewelry',
        'Google Shopping / Custom Label 1': stone_gs,
        'Google Shopping / Custom Label 2': color_gs,
        'Google Shopping / Custom Label 3': a['jewelry_type'].replace('_', ' ').title(),
        'Google Shopping / Custom Label 4': 'Kundan Bridal Jewelry Collection',
        'Variant Image': primary_image_url,
        'Variant Weight Unit': 'g',
        'Variant Tax Code': '',
        'Cost per item': f"{p['price_usd'] / 2:.2f}",  # 50% margin assumption
        'Included / United States': 'TRUE',
        'Price / United States': f"{p['price_usd']:.2f}",
        'Compare At Price / United States': f"{p['compare_at_usd']:.2f}",
        'Included / International': 'TRUE',
        'Price / International': f"{p['price_usd']:.2f}",
        'Compare At Price / International': f"{p['compare_at_usd']:.2f}",
        'Status': 'active',
    }
    rows.append(main_row)
    
    # Second image row (mockup or product-only — whichever is the secondary)
    if secondary_image_url:
        second_row = {field: '' for field in FIELDNAMES}
        second_row['Handle'] = handle
        second_row['Image Src'] = secondary_image_url
        second_row['Image Position'] = '2'
        second_row['Image Alt Text'] = build_image_alt(p)
        rows.append(second_row)


# ─── Write CSV ──────────────────────────────────────────────────────────────
with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=FIELDNAMES, quoting=csv.QUOTE_ALL)
    writer.writeheader()
    writer.writerows(rows)


# ─── Validation + summary ───────────────────────────────────────────────────
print(f"\n{'='*70}")
print(f"  Shopify CSV generated: Kundan Bridal Jewelry")
print(f"{'='*70}")
print(f"  File: {OUT_CSV}")
print(f"  Size: {os.path.getsize(OUT_CSV):,} bytes")
print(f"  Products: {len(products)}")
print(f"  CSV rows: {len(rows)} (includes second-image rows for paired products)")
print(f"  Pricing: $80-$150 USD (per user instruction)")
print(f"  Compare-at: sale × 1.30 (~23% discount display)")
print(f"{'='*70}\n")

print(f"=== Pricing summary ===\n")
print(f"  {'#':<3} {'SKU':<15} {'Price':>6} {'Cmp@':>5} {'Disc%':>6}  {'Images':<8}  Title")
print("-" * 110)
for p in products:
    disc = (1 - p['price_usd'] / p['compare_at_usd']) * 100
    img = '2 images' if p['secondary_image'] else '1 image'
    print(f"  {p['product_idx']:<3} LUX-KJ-KJ{p['product_idx']:02d}  ${p['price_usd']:>4} ${p['compare_at_usd']:>4} {disc:>5.0f}%  {img:<8}  {p['name'][:50]}")

print(f"\n=== Final product list ===\n")
for p in products:
    print(f"  {build_handle(p)}")
    print(f"    Title:  {build_full_title(p)}")
    print(f"    SKU:    LUX-KJ-KJ{p['product_idx']:02d}  |  ${p['price_usd']} (compare ${p['compare_at_usd']})")
    print(f"    SEO T:  {p['seo_title']} ({len(p['seo_title'])} chars)")
    print(f"    SEO D:  {p['seo_description'][:90]}... ({len(p['seo_description'])} chars)")
    print(f"    Body:   {len(p['body_html'])} chars, {sum(1 for _ in re.findall(r'<h3>', p['body_html']))} H3 sections")
    print(f"    Tags:   {len(build_tags(p).split(','))} tags")
    print(f"    Image:  {p['primary_image']}" + (f" + {p['secondary_image']}" if p['secondary_image'] else ""))
    print()

print(f"\n✅ CSV saved to: {OUT_CSV}")
