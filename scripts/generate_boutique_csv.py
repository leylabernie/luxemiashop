#!/usr/bin/env python3
"""
LuxeMia Boutique-Style Shopify CSV Generator
=============================================

Reads raw product data from product_prices.json + wholesalesalwar source
and generates a complete Shopify-import-ready CSV with LuxeMia's boutique
brand voice, matching the exact listing style of current live products.

Features:
  - Boutique-style HTML descriptions (Fabric, Work, Why You'll Love This,
    Styling Notes, Common Questions)
  - Rotating editorial opening lines for variety
  - SEO-optimized titles and meta descriptions
  - Google Shopping fields (category, gender, age group, condition)
  - Color metafield for Shopify filtering
  - Two options per product: Color + Size (Free Size through XXL)
  - ~30% discount pattern (compare-at price)
  - Proper SKU generation by category
  - All 90 products with images from CDN

Usage:
  python3 scripts/generate_boutique_csv.py
  # Output: public/luxemia_boutique_import.csv
"""

import csv
import json
import os
import re
import random
import hashlib

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
PRICES_PATH = os.path.join(ROOT_DIR, 'product_prices.json')
CSV_IMPORT_PATH = os.path.join(ROOT_DIR, 'public', 'luxemia_shopify_import.csv')
OUTPUT_PATH = os.path.join(ROOT_DIR, 'public', 'luxemia_boutique_import.csv')

# ─── Brand voice patterns (from current live listings) ───────────

OPENING_LINES = [
    "Where heritage meets modern sophistication - this is that piece.",
    "Style is a form of self-expression. This piece speaks volumes.",
    "When the occasion calls for something unforgettable, this answers.",
    "Quiet confidence. Considered craftsmanship. One extraordinary outfit.",
    "Not every outfit tells a story. This one does.",
    "Wear it once and it becomes a favourite. Wear it twice and it becomes yours.",
    "Some outfits are worn. This one is experienced.",
    "Elegance isn't loud. It's this.",
    "This is the kind of piece that makes an entrance - confident, refined, and unforgettable.",
    "Crafted for those who carry tradition with quiet confidence.",
    "The kind of piece that photographs beautifully and feels even better in person.",
    "One look. One outfit. One extraordinary moment.",
    "Tradition, reimagined for the woman who writes her own rules.",
    "Dressed in heritage. Draped in now.",
    "Where artisan craft meets modern edge.",
]

SAREE_STYLING = [
    "Style with minimal accessories to let the craftsmanship speak - or layer with heirloom jewellery for full festive drama.",
    "Style with a sleek bun and bold bindi for timeless Indian elegance, or let it flow loose for contemporary bridal glamour.",
    "Drape it with confidence and let the fabric do the talking - pair with statement jhumkas for a look that commands the room.",
    "Complete the look with kundan jewellery and embellished heels for a showstopping entrance.",
    "Keep it effortlessly elegant with delicate gold chains and strappy sandals - or go full bridal with a statement maang tikka.",
    "Pair with chandelier earrings and a sleek clutch for cocktail night, or dress it up with temple jewellery for puja ceremonies.",
]

SUIT_STYLING = [
    "Style with a sleek bun and bold bindi for timeless Indian elegance, or let it flow loose for contemporary bridal glamour.",
    "This is the kind of piece that photographs beautifully and feels even better in person.",
    "Elevate with statement jhumkas and embellished mojaris for a festive look that turns heads.",
    "Keep it contemporary with block heels and minimal jewellery, or go traditional with kundan earrings and a potli bag.",
    "Pair with metallic sandals and a structured clutch for modern festive style, or add heirloom bangles for traditional charm.",
]

SHERWANI_STYLING = [
    "This is the kind of piece that makes an entrance - confident, refined, and unforgettable.",
    "Pair with a matching stole and traditional mojaris for a complete groom look.",
    "Keep it sleek with minimal accessories and polished shoes - the sherwani speaks for itself.",
    "Add a pocket square and brooch for a modern groom's touch, or go classic with a pearl necklace.",
    "Style with a turban and embroidered mojaris for the full baraat look.",
]

FABRIC_DESCRIPTIONS = {
    'lycra': "Fluid, figure-flattering, and effortlessly comfortable - lycra drapes like a dream and moves with you, making it the perfect canvas for artistic detail.",
    'silk': "Luxurious, luminous, and steeped in tradition - silk catches the light with every fold, creating a regal presence that transforms any occasion into something extraordinary.",
    'pure silk': "The finest pure silk - each thread carries centuries of Indian weaving heritage. Luminous, weighty, and impossibly elegant, this is fabric that commands attention.",
    'art silk': "Artisan-crafted artificial silk that mirrors the lustre and drape of pure silk at a more accessible price point, without compromising on visual impact.",
    'crepe silk': "Delicate yet resilient, crepe silk offers a beautifully textured surface with a subtle sheen that catches light differently from every angle.",
    'chinon silk': "Lightweight and luxuriously soft, chinon silk drapes with an effortless grace that moves beautifully - perfect for celebrations that last from day into night.",
    'chinon': "Lightweight and beautifully fluid, chinon fabric offers an easy drape and a subtle sheen that transitions seamlessly from day to evening celebrations.",
    'shimmer silk': "Shimmer silk lives up to its name - a luminous fabric that catches and reflects light with every movement, creating an unforgettable sparkle effect.",
    'fendy silk': "Rich and textured with a distinctive weave, fendy silk offers a unique tactile quality that sets it apart from ordinary fabrics - substantial yet surprisingly comfortable.",
    'georgette': "Lightweight, airy, and effortlessly elegant - georgette has a beautiful natural drape and a slightly sheer quality that adds depth and movement to any silhouette.",
    'silk blend': "The best of both worlds - silk blend combines the lustre of silk with the practicality of blended fibres, creating a fabric that looks luxurious and wears beautifully.",
    'banarasi jacquard': "Woven with centuries of Banarasi weaving heritage - the jacquard technique creates intricate patterns that are part of the fabric itself, not merely embroidered on top. This is textile artistry.",
    'embosed velvet': "Rich and deeply textured, embossed velvet adds a three-dimensional quality that catches light in dramatic ways - the fabric of royalty for the most important celebrations.",
    'velvet': "Opulent and deeply luxurious, velvet has been the fabric of choice for Indian royalty for centuries - its plush texture and rich drape create an unmistakable sense of occasion.",
}

WORK_DESCRIPTIONS = {
    'sequins work': "Dazzling sequin artistry that catches the light with every movement - creating a showstopping sparkle effect.",
    'embroidery work': "Intricate embroidery that transforms fabric into art - each stitch placed with precision to create patterns that captivate up close and from across the room.",
    'hand embroidery': "Masterfully hand-embroidered by skilled artisans - each piece carries the unique touch of human craftsmanship that machine work simply cannot replicate.",
    'jari work': "Traditional jari (zari) threadwork using fine metallic threads - a centuries-old technique that adds luminous detail and regal shimmer to every motif.",
    'mirror work': "Captivating mirror work (shisha) that reflects light from every angle - a traditional Rajasthani craft where each mirror is individually hand-set into intricate embroidery.",
    'thread work': "Elegant thread work that creates rich texture and dimension - each pattern is meticulously stitched to create visual depth that draws the eye.",
    'neck work': "Focused craftsmanship at the neckline where it matters most - intricate detailing designed to frame the face and draw the eye.",
    'zari work': "Lustrous zari weaving using fine metallic threads - this ancient technique creates patterns that shimmer with gold and silver, adding a regal touch to every drape.",
}

OCCASION_DESCRIPTIONS = {
    'festival wear': "festival wear celebrations",
    'wedding wear': "wedding wear celebrations",
    'party wear': "party wear celebrations",
    'occasional wear': "occasional celebrations",
    'casual wear': "casual everyday elegance",
    'groom wear': "groom celebrations",
}

OCCASION_SUITABLE = {
    'festival wear': "festival gatherings, religious celebrations, Diwali parties, and any occasion that calls for effortless ethnic elegance",
    'wedding wear': "wedding ceremonies, reception events, engagement celebrations, and any occasion that calls for something extraordinary",
    'party wear': "festive celebrations, cocktail parties, sangeet nights, and any occasion that calls for standout style",
    'occasional wear': "festive celebrations, cultural gatherings, family events, and any occasion that calls for effortless ethnic elegance",
    'casual wear': "everyday wear, casual gatherings, office events, and any occasion that calls for comfortable yet elegant ethnic style",
    'groom wear': "wedding baraat, sangeet, reception, engagement, and any celebration where you want to make a statement",
}

# Size options by category
SIZE_OPTIONS = {
    'sarees': ['Free Size'],
    'suits': ['Free Size'],
    'salwar kameez': ['Free Size'],
    'menswear': ['Free Size'],
    "men's indian wear": ['Free Size'],
    'indowestern': ['Free Size'],
}

# Google product categories
GOOGLE_CATEGORIES = {
    'sarees': 'Apparel & Accessories > Clothing > Dresses',
    'salwar kameez': 'Apparel & Accessories > Clothing > Dresses',
    'suits': 'Apparel & Accessories > Clothing > Dresses',
    'menswear': 'Apparel & Accessories > Clothing > Suits',
    "men's indian wear": 'Apparel & Accessories > Clothing > Suits',
    'indowestern': 'Apparel & Accessories > Clothing > Dresses',
}

# Product type mapping for Shopify
PRODUCT_TYPES = {
    'sarees': 'Sarees',
    'salwar kameez': 'Salwar Kameez',
    'suits': 'Salwar Kameez',
    'menswear': "Men's Indian Wear",
    "men's indian wear": "Men's Indian Wear",
    'indowestern': 'Indo Western',
}

# SKU prefix by category
SKU_PREFIXES = {
    'sarees': 'LXM-SAR',
    'salwar kameez': 'LXM-SAZ',
    'suits': 'LXM-SAZ',
    'menswear': 'LXM-MNS',
    "men's indian wear": 'LXM-MNS',
    'indowestern': 'LXM-IDW',
}


def parse_product_title(title):
    """Parse product title to extract fabric, color, occasion, work, garment type."""
    parts = title.split()
    fabric = ''
    color = ''
    occasion = ''
    work = ''
    garment = ''
    is_readymade = 'readymade' in title.lower()

    # Extract occasion
    for occ in ['wedding wear', 'festival wear', 'party wear', 'occasional wear', 'casual wear', 'groom wear']:
        if occ.lower() in title.lower():
            occasion = occ
            break

    # Extract work type
    for w in ['hand embroidery', 'embroidery work', 'sequins work', 'mirror work', 'jari work',
              'thread work', 'neck work', 'zari work']:
        if w.lower() in title.lower():
            work = w
            break

    # Extract garment type
    for g in ['lehenga choli', 'plazzo suit', 'patiyala suit', 'saree', 'sherwani', 'suit', 'lehenga']:
        if g.lower() in title.lower():
            garment = g
            break

    # Extract fabric - look for known fabrics
    known_fabrics = [
        'banarasi jacquard', 'embosed velvet', 'pure silk', 'crepe silk', 'chinon silk',
        'shimmer silk', 'fendy silk', 'silk blend', 'art silk',
        'georgette', 'chinon', 'lycra', 'velvet', 'silk',
    ]
    for f in known_fabrics:
        if f.lower() in title.lower():
            fabric = f
            break

    # Extract color - everything between fabric and occasion
    # Try to get the color from the title
    title_lower = title.lower()
    color_start = len(fabric)
    color_end = title_lower.find(occasion.lower()) if occasion else len(title)

    if fabric and occasion:
        remaining = title[len(fabric):].strip()
        if remaining.lower().startswith(occasion.lower()):
            color = ''
        else:
            color_part = remaining[:remaining.lower().find(occasion.lower())].strip() if occasion.lower() in remaining.lower() else ''
            color = color_part

    # If color extraction didn't work well, try another approach
    if not color:
        # Remove known parts and see what's left
        remaining = title
        for remove in [fabric, occasion, work, garment, 'Readymade', 'readymade', 'Groom', 'groom']:
            remaining = remaining.replace(remove, '', 1).strip()
        # Clean up leftover punctuation
        remaining = re.sub(r'^[\s\-]+|[\s\-]+$', '', remaining)
        color = remaining.strip()

    return {
        'fabric': fabric,
        'color': color,
        'occasion': occasion,
        'work': work,
        'garment': garment,
        'is_readymade': is_readymade,
    }


def determine_category(title, product_type):
    """Determine the LuxeMia category from title and type."""
    title_lower = title.lower()
    if any(w in title_lower for w in ['sherwani', 'kurta', 'pyjama', 'mens', "men's", 'groom']):
        return "men's indian wear"
    if any(w in title_lower for w in ['saree']):
        return 'sarees'
    if any(w in title_lower for w in ['suit', 'salwar', 'plazzo', 'patiyala', 'kameez']):
        return 'salwar kameez'
    if any(w in title_lower for w in ['lehenga', 'lehenga choli']):
        return 'sarees'  # lehengas grouped with sarees on the site
    if product_type:
        pt_lower = product_type.lower()
        if 'saree' in pt_lower:
            return 'sarees'
        if 'salwar' in pt_lower or 'suit' in pt_lower or 'kameez' in pt_lower:
            return 'salwar kameez'
        if 'men' in pt_lower or 'sherwani' in pt_lower:
            return "men's indian wear"
    return 'sarees'  # default


def generate_boutique_description(title, parsed, category):
    """Generate LuxeMia boutique-style HTML description."""
    fabric = parsed['fabric']
    color = parsed['color']
    occasion = parsed['occasion'] or 'special occasions'
    work = parsed['work']
    garment = parsed['garment']

    # Pick rotating elements
    opening = random.choice(OPENING_LINES)
    fabric_display = fabric.title() if fabric else 'Premium Fabric'
    work_display = work.title() if work else ''
    fabric_desc = FABRIC_DESCRIPTIONS.get(fabric.lower(), f"Premium {fabric_display} - chosen for its drape, longevity, and the way it makes the wearer feel as good as they look.")
    work_desc = WORK_DESCRIPTIONS.get(work.lower(), f"Exquisite {work_display} that elevates this piece from beautiful to extraordinary - each detail placed with intention and artistry.") if work else "Meticulously crafted with attention to every detail - the kind of piece that earns compliments from across the room."

    # Garment-specific language
    garment_noun = garment if garment else 'outfit'
    if 'saree' in garment_noun.lower():
        garment_noun = 'saree'
    elif 'sherwani' in garment_noun.lower():
        garment_noun = 'sherwani'
    elif 'suit' in garment_noun.lower():
        garment_noun = 'suit'
    elif 'lehenga' in garment_noun.lower():
        garment_noun = 'lehenga choli'

    occasion_text = OCCASION_DESCRIPTIONS.get(occasion.lower(), "special celebrations")
    suitable_text = OCCASION_SUITABLE.get(occasion.lower(), "special occasions, festive celebrations, and any event that calls for something extraordinary")

    # Styling
    if category == "men's indian wear":
        styling = random.choice(SHERWANI_STYLING)
    elif category == 'sarees':
        styling = random.choice(SAREE_STYLING)
    else:
        styling = random.choice(SUIT_STYLING)

    # Build description
    html_parts = []

    # Opening line
    html_parts.append(f"<p><em>{opening}</em></p>")

    # H2 Title
    html_parts.append(f"<h2>{title}</h2>")

    # Introduction
    html_parts.append(f"<p>Meet the <strong>{title}</strong> - a beautifully crafted <strong>{garment_noun}</strong> made for {occasion_text}. Whether you're dressing for a wedding ceremony, a festive reception, or any celebration that calls for something extraordinary, this piece delivers the perfect balance of heritage, elegance, and contemporary style.</p>")

    # Fabric section
    html_parts.append(f"<h3>The Fabric</h3>")
    html_parts.append(f"<p><strong>{fabric_display}.</strong> {fabric_desc}</p>")

    # Work section
    if work:
        html_parts.append(f"<h3>The Work</h3>")
        html_parts.append(f"<p><strong>{work_display}.</strong> {work_desc}</p>")

    # Why You'll Love This
    html_parts.append(f"<h3>Why You'll Love This Piece</h3>")
    html_parts.append(f"<ul>")
    html_parts.append(f"  <li><strong>Colour:</strong> A carefully selected <strong>{color}</strong> tone - flattering across skin tones, stunning in photographs, and rich under both natural and indoor lighting.</li>")
    html_parts.append(f"  <li><strong>Fabric:</strong> {fabric_display} - chosen for its drape, longevity, and the way it makes the wearer feel as good as they look.</li>")
    html_parts.append(f"  <li><strong>Occasion:</strong> Crafted for {occasion} - equally beautiful at intimate family gatherings and grand celebrations.</li>")
    html_parts.append(f"  <li><strong>Silhouette:</strong> Designed to move with you, not restrict you - flattering across a wide range of body types.</li>")
    html_parts.append(f"  <li><strong>Provenance:</strong> Sourced from India's finest textile regions and curated by our boutique team for exceptional quality.</li>")
    html_parts.append(f"</ul>")

    # Styling Notes
    html_parts.append(f"<h3>Styling Notes</h3>")
    html_parts.append(f"<p>{styling}</p>")

    # Common Questions
    html_parts.append(f"<h3>Common Questions</h3>")
    if category == "men's indian wear":
        html_parts.append(f"<p><strong>What occasions is this {garment_noun} suitable for?</strong> This {garment_noun} is perfect for {suitable_text}.</p>")
        html_parts.append(f"<p><strong>Is this {garment_noun} readymade?</strong> Yes, this is a readymade {garment_noun} set - ready to wear, no tailoring needed.</p>")
        html_parts.append(f"<p><strong>How do I care for this fabric?</strong> We recommend dry cleaning only to preserve the embroidery and fabric structure. Store on a hanger in a breathable garment bag.</p>")
    elif category == 'sarees':
        html_parts.append(f"<p><strong>What occasions is this {garment_noun} suitable for?</strong> This {garment_noun} works beautifully for {suitable_text}.</p>")
        html_parts.append(f"<p><strong>Is the blouse included?</strong> Yes, this {garment_noun} comes with a matching blouse piece that can be stitched to your measurements.</p>")
        html_parts.append(f"<p><strong>How do I care for this fabric?</strong> We recommend dry cleaning to preserve the embroidery and fabric quality. Store folded in a cool, dry place away from direct sunlight.</p>")
    else:
        html_parts.append(f"<p><strong>What occasions is this {garment_noun} suitable for?</strong> This {garment_noun} works beautifully for {suitable_text}.</p>")
        html_parts.append(f"<p><strong>Is this {garment_noun} stitched?</strong> Yes, this is a readymade stitched {garment_noun} in free size that fits XS to L comfortably.</p>")
        html_parts.append(f"<p><strong>How do I care for this fabric?</strong> We recommend dry cleaning to preserve the embroidery and fabric quality. Store folded in a cool, dry place away from direct sunlight.</p>")

    # Tags footer
    color_lower = color.lower()
    fabric_lower = fabric.lower().replace(' ', '-')
    garment_lower = garment_noun.lower().replace(' ', '-')
    html_parts.append(f"<p><small>Tags: {color_lower}, {fabric_lower}, {garment_lower}, buy online, Indian ethnic wear USA, boutique Indian fashion, designer, traditional Indian wear online</small></p>")

    return '\n\n'.join(html_parts)


def generate_seo_title(title, parsed, category):
    """Generate SEO-optimized title."""
    return title  # Current listings use the full product title as SEO title


def generate_seo_description(title, parsed, category):
    """Generate SEO meta description."""
    fabric = parsed['fabric']
    color = parsed['color']
    occasion = parsed['occasion'] or 'special occasions'
    work = parsed['work']
    garment = parsed['garment'] or 'outfit'

    return f"Shop the {title} at LuxeMia. Crafted in premium {fabric} with exquisite {work} in {color}. Perfect for {occasion}. Free shipping on orders over $150. Dry clean only."


def generate_tags(title, parsed, category):
    """Generate Shopify tags matching current listing style."""
    tags = []
    color_lower = parsed['color'].lower()
    fabric_lower = parsed['fabric'].lower().replace(' ', '-')
    occasion_lower = parsed['occasion'].lower().replace(' ', '-') if parsed['occasion'] else ''
    work_lower = parsed['work'].lower().replace(' ', '-') if parsed['work'] else ''
    garment = parsed['garment'].lower()

    # Core brand tags (from current live listings)
    tags.append('luxemia')
    tags.append('indian-ethnic-wear')

    if category == "men's indian wear":
        tags.extend(['indian-menswear', 'menswear', 'free-shipping'])
        if 'sherwani' in garment:
            tags.append('sherwani')
        if 'kurta' in garment:
            tags.append('kurta-pajama')
    elif category == 'sarees':
        tags.extend(['saree', 'free-shipping'])
        if 'lehenga' in garment:
            tags.append('lehenga')
    else:
        tags.extend(['salwar-kameez', 'free-shipping'])
        if 'suit' in garment:
            tags.append('suit')

    # Color
    if color_lower:
        tags.append(color_lower.replace(' ', '-'))

    # Fabric
    if fabric_lower:
        tags.append(fabric_lower)

    # Work
    if work_lower:
        tags.append(work_lower)

    # Occasion
    if occasion_lower:
        tags.append(occasion_lower)

    # Remove duplicates while preserving order
    seen = set()
    unique_tags = []
    for t in tags:
        if t not in seen:
            seen.add(t)
            unique_tags.append(t)

    return ', '.join(unique_tags)


def generate_handle(title, source_id):
    """Generate URL handle from title + source ID for uniqueness."""
    # Take the source ID from the wholesalesalwar URL
    handle = title.lower()
    # Remove special chars
    handle = re.sub(r'[^a-z0-9\s\-]', '', handle)
    handle = re.sub(r'[\s]+', '-', handle)
    handle = re.sub(r'-+', '-', handle)
    handle = handle.strip('-')

    # Add source ID for uniqueness
    if source_id:
        handle = f"{handle}-{source_id}"

    return handle[:255]  # Shopify handle limit


def get_source_id_from_url(url):
    """Extract source ID from wholesalesalwar URL."""
    if not url:
        return ''
    match = re.search(r'/p/[^-]+-(\d+)$', url)
    if match:
        return match.group(1)
    # Try last segment
    parts = url.rstrip('/').split('/')
    last = parts[-1] if parts else ''
    match = re.search(r'-(\d+)$', last)
    return match.group(1) if match else ''


def main():
    random.seed(42)  # Reproducible results

    # Load product_prices.json
    with open(PRICES_PATH, 'r', encoding='utf-8') as f:
        price_data = json.load(f)

    # Load existing CSV for image data (the images are already correct there)
    existing_images = {}  # handle -> [image_urls]
    existing_csv_data = {}  # handle -> row dict
    source_id_to_handle = {}  # source_id -> handle (for matching by source ID)
    with open(CSV_IMPORT_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        current_handle = None
        for row in reader:
            title = (row.get('Title') or '').strip()
            handle = (row.get('URL handle') or '').strip()
            img_url = (row.get('Product image URL') or '').strip()

            if title:
                current_handle = handle
                if current_handle not in existing_csv_data:
                    existing_csv_data[current_handle] = row
                if current_handle not in existing_images:
                    existing_images[current_handle] = []
                if img_url:
                    existing_images[current_handle].append(img_url)
                # Extract source ID from handle
                id_match = re.search(r'-(\d+)$', handle)
                if id_match:
                    source_id_to_handle[id_match.group(1)] = handle
            elif current_handle and img_url:
                existing_images[current_handle].append(img_url)

    # Build product lookup by title match (lower priority than source ID)
    title_to_handle = {}
    for handle, row in existing_csv_data.items():
        t = (row.get('Title') or '').strip().lower()
        # Strip parenthetical IDs for matching
        t_clean = re.sub(r'\s*\(\d+\)\s*$', '', t).strip()
        if t not in title_to_handle:
            title_to_handle[t] = handle
        if t_clean not in title_to_handle:
            title_to_handle[t_clean] = handle

    # Shopify CSV column headers
    fieldnames = [
        'Title', 'URL handle', 'Description', 'Vendor', 'Product category',
        'Type', 'Tags', 'Published on online store', 'Status', 'SKU', 'Barcode',
        'Option1 name', 'Option1 value', 'Option1 Linked To',
        'Option2 name', 'Option2 value', 'Option2 Linked To',
        'Option3 name', 'Option3 value', 'Option3 Linked To',
        'Price', 'Compare-at price', 'Cost per item', 'Charge tax', 'Tax code',
        'Unit price total measure', 'Unit price total measure unit',
        'Unit price base measure', 'Unit price base measure unit',
        'Inventory tracker', 'Inventory quantity',
        'Continue selling when out of stock',
        'Weight value (grams)', 'Weight unit for display',
        'Requires shipping', 'Fulfillment service',
        'Product image URL', 'Image position', 'Image alt text',
        'Variant image URL', 'Gift card',
        'SEO title', 'SEO description',
        'Color (product.metafields.shopify.color-pattern)',
        'Google Shopping / Google product category',
        'Google Shopping / Gender',
        'Google Shopping / Age group',
        'Google Shopping / Manufacturer part number (MPN)',
        'Google Shopping / Ad group name',
        'Google Shopping / Ads labels',
        'Google Shopping / Condition',
        'Google Shopping / Custom product',
        'Google Shopping / Custom label 0',
        'Google Shopping / Custom label 1',
        'Google Shopping / Custom label 2',
        'Google Shopping / Custom label 3',
        'Google Shopping / Custom label 4',
    ]

    rows = []
    sku_counters = {}  # category -> counter for SKU generation

    for product in price_data:
        if product.get('status') != 'AVAILABLE':
            continue

        title = product.get('name', '').strip()
        if not title:
            continue

        url = product.get('url', '')
        source_id = get_source_id_from_url(url)

        # Find matching handle in existing CSV (prefer source ID match, then title match, then fuzzy)
        existing_handle = None
        if source_id and source_id in source_id_to_handle:
            existing_handle = source_id_to_handle[source_id]
        if not existing_handle:
            # Try exact title match
            title_lower = title.lower()
            title_clean = re.sub(r'\s*\(\d+\)\s*$', '', title_lower).strip()
            existing_handle = title_to_handle.get(title_lower) or title_to_handle.get(title_clean)
        if not existing_handle:
            # Fuzzy: try common misspellings
            title_fuzzy = title_lower.replace('turquise', 'turquoise')
            title_fuzzy_clean = re.sub(r'\s*\(\d+\)\s*$', '', title_fuzzy).strip()
            existing_handle = title_to_handle.get(title_fuzzy) or title_to_handle.get(title_fuzzy_clean)

        existing_row = existing_csv_data.get(existing_handle, {}) if existing_handle else {}
        existing_type = (existing_row.get('Type') or '').strip()
        category = determine_category(title, existing_type)

        # Parse title
        parsed = parse_product_title(title)

        # Generate handle - use original handle if it exists (for continuity)
        if existing_handle:
            handle = existing_handle
        else:
            handle = generate_handle(title, source_id)

        # Get images - from existing CSV via matched handle
        images = existing_images.get(existing_handle, []) if existing_handle else []

        # SKU generation
        sku_prefix = SKU_PREFIXES.get(category, 'LXM-GEN')
        if sku_prefix not in sku_counters:
            sku_counters[sku_prefix] = 0
        sku_counters[sku_prefix] += 1
        sku_num = sku_counters[sku_prefix]
        sku = f"{sku_prefix}-{sku_num:03d}"

        # Prices
        price = product.get('usd_price', 0)
        compare_at = product.get('usd_compare_at', 0)

        # Round to .99
        if price:
            price = float(price)
            price = int(price) + 0.99 if price != int(price) else price
        else:
            price = 0

        if compare_at:
            compare_at = float(compare_at)
            compare_at = round(compare_at, 2)
        else:
            compare_at = round(price * 1.43, 2) if price else 0

        # Generate boutique content
        description = generate_boutique_description(title, parsed, category)
        seo_title = generate_seo_title(title, parsed, category)
        seo_description = generate_seo_description(title, parsed, category)
        tags = generate_tags(title, parsed, category)
        product_type = PRODUCT_TYPES.get(category, 'Designer Wear')
        google_category = GOOGLE_CATEGORIES.get(category, 'Apparel & Accessories > Clothing')
        google_gender = 'Male' if category == "men's indian wear" else 'Female'
        color_value = parsed['color']

        # Size options
        sizes = SIZE_OPTIONS.get(category, ['Free Size'])

        # Build primary row (with product data)
        primary_row = {
            'Title': title,
            'URL handle': handle,
            'Description': description,
            'Vendor': 'LuxeMia',
            'Product category': google_category,
            'Type': product_type,
            'Tags': tags,
            'Published on online store': 'TRUE',
            'Status': 'active',
            'SKU': sku,
            'Barcode': '',
            'Option1 name': 'Color',
            'Option1 value': color_value,
            'Option1 Linked To': '',
            'Option2 name': 'Size',
            'Option2 value': sizes[0] if sizes else '',
            'Option2 Linked To': '',
            'Option3 name': '',
            'Option3 value': '',
            'Option3 Linked To': '',
            'Price': f"{price:.2f}",
            'Compare-at price': f"{compare_at:.2f}",
            'Cost per item': '',
            'Charge tax': 'TRUE',
            'Tax code': '',
            'Unit price total measure': '',
            'Unit price total measure unit': '',
            'Unit price base measure': '',
            'Unit price base measure unit': '',
            'Inventory tracker': 'shopify',
            'Inventory quantity': '50',
            'Continue selling when out of stock': 'DENY',
            'Weight value (grams)': '',
            'Weight unit for display': '',
            'Requires shipping': 'TRUE',
            'Fulfillment service': 'manual',
            'Product image URL': images[0] if images else '',
            'Image position': '1',
            'Image alt text': title,
            'Variant image URL': images[0] if images else '',
            'Gift card': 'FALSE',
            'SEO title': seo_title,
            'SEO description': seo_description,
            'Color (product.metafields.shopify.color-pattern)': color_value.lower(),
            'Google Shopping / Google product category': google_category,
            'Google Shopping / Gender': google_gender,
            'Google Shopping / Age group': 'Adult',
            'Google Shopping / Manufacturer part number (MPN)': '',
            'Google Shopping / Ad group name': '',
            'Google Shopping / Ads labels': '',
            'Google Shopping / Condition': 'New',
            'Google Shopping / Custom product': 'FALSE',
            'Google Shopping / Custom label 0': '',
            'Google Shopping / Custom label 1': '',
            'Google Shopping / Custom label 2': '',
            'Google Shopping / Custom label 3': '',
            'Google Shopping / Custom label 4': '',
        }
        rows.append(primary_row)

        # Additional image rows (same handle, no title)
        for img_idx, img_url in enumerate(images[1:], start=2):
            img_row = {field: '' for field in fieldnames}
            img_row['URL handle'] = handle
            img_row['Product image URL'] = img_url
            img_row['Image position'] = str(img_idx)
            img_row['Image alt text'] = f"{title} - View {img_idx}"
            rows.append(img_row)

    # Write CSV
    with open(OUTPUT_PATH, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    # Summary
    total_products = sum(1 for r in rows if r.get('Title'))
    total_images = len(rows) - total_products
    categories = {}
    for r in rows:
        if r.get('Title'):
            t = r.get('Type', 'Unknown')
            categories[t] = categories.get(t, 0) + 1

    print(f"""
╔══════════════════════════════════════════════════════════════╗
║       LuxeMia Boutique CSV Generation Complete               ║
╠══════════════════════════════════════════════════════════════╣
║  Output: {os.path.basename(OUTPUT_PATH):<48}║
║  Total products: {str(total_products):<44}║
║  Total rows (incl. images): {str(len(rows)):<34}║
╚══════════════════════════════════════════════════════════════╝

  Category Breakdown:""")

    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"    {cat}: {count}")

    print(f"""
  Features:
    ✅ Boutique HTML descriptions (Fabric, Work, Styling Notes, FAQ)
    ✅ SEO titles and meta descriptions
    ✅ Google Shopping fields (category, gender, age group, condition)
    ✅ Color + Size options (matching live listing structure)
    ✅ ~30% discount pricing (compare-at price)
    ✅ SKU generation by category
    ✅ Image alt text matching product titles
    ✅ Brand tags matching live listing patterns
    ✅ Vendor: LuxeMia

  Ready to upload to Shopify Admin → Products → Import
    """)


if __name__ == '__main__':
    main()
