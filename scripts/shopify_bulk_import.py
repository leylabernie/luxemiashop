#!/usr/bin/env python3
"""
Shopify Bulk Product Import Script for LuxeMia
================================================

Reads products from luxemia_shopify_import.csv and creates them
in Shopify via the Admin REST API.

Features:
  - Deduplication: skips products that already exist (by handle)
  - Rate limiting: respects Shopify API limits
  - Retry with exponential backoff on 429/5xx errors
  - Dry-run mode: preview what would be imported
  - Progress reporting with summary
  - Category filtering and limit support

Usage:
  SHOPIFY_ACCESS_TOKEN=shpat_xxx python3 scripts/shopify_bulk_import.py
  SHOPIFY_ACCESS_TOKEN=shpat_xxx python3 scripts/shopify_bulk_import.py --dry-run
  SHOPIFY_ACCESS_TOKEN=shpat_xxx python3 scripts/shopify_bulk_import.py --limit 10
  SHOPIFY_ACCESS_TOKEN=shpat_xxx python3 scripts/shopify_bulk_import.py --category sarees
  SHOPIFY_ACCESS_TOKEN=shpat_xxx python3 scripts/shopify_bulk_import.py --continue-from "handle-or-title"

Required env vars:
  SHOPIFY_ACCESS_TOKEN  - Shopify Admin API access token (shpat_...)
"""

import csv
import json
import os
import sys
import time
import argparse
import requests  # requests is available in most Python environments

# ─── Configuration ───────────────────────────────────────────────
SHOPIFY_STORE = 'lovable-project-zlh0w.myshopify.com'
SHOPIFY_API_VERSION = '2025-07'
SHOPIFY_ACCESS_TOKEN = os.environ.get('SHOPIFY_ACCESS_TOKEN', '')
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
CSV_PATH = os.path.join(ROOT_DIR, 'public', 'luxemia_shopify_import.csv')

API_DELAY = 0.6       # seconds between API calls (~1.6 req/sec)
MAX_RETRIES = 3
RETRY_BASE_DELAY = 2  # seconds


def log(msg):
    ts = time.strftime('%H:%M:%S')
    print(f"[{ts}] {msg}")


def warn(msg):
    ts = time.strftime('%H:%M:%S')
    print(f"[{ts}] ⚠️  {msg}", file=sys.stderr)


def error(msg):
    ts = time.strftime('%H:%M:%S')
    print(f"[{ts}] ❌ {msg}", file=sys.stderr)


# ─── CSV Parsing ─────────────────────────────────────────────────

def parse_products_from_csv(csv_path):
    """Parse Shopify CSV into a list of product dicts with grouped images."""
    products = []
    current = None

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            title = (row.get('Title') or '').strip()
            handle = (row.get('URL handle') or '').strip()

            if title:
                if current:
                    products.append(current)
                current = {
                    'title': title,
                    'handle': handle,
                    'row': row,
                    'images': [],
                }
                img_url = (row.get('Product image URL') or '').strip()
                if img_url:
                    current['images'].append({
                        'url': img_url,
                        'position': int(row.get('Image position') or 1),
                        'alt': (row.get('Image alt text') or title).strip(),
                    })
            elif current:
                img_url = (row.get('Product image URL') or '').strip()
                if img_url:
                    current['images'].append({
                        'url': img_url,
                        'position': int(row.get('Image position') or len(current['images']) + 1),
                        'alt': (row.get('Image alt text') or current['title']).strip(),
                    })

    if current:
        products.append(current)

    return products


# ─── Build Shopify API Payload ───────────────────────────────────

def build_shopify_payload(product):
    """Convert parsed product data to Shopify Admin API product payload."""
    row = product['row']
    title = product['title']

    price = (row.get('Price') or '').strip()
    compare_at_price = (row.get('Compare-at price') or '').strip()
    sku = (row.get('SKU') or '').strip()
    option1_name = (row.get('Option1 name') or '').strip()
    option1_value = (row.get('Option1 value') or '').strip()
    inventory_qty = int(row.get('Inventory quantity') or 50)
    continue_selling = (row.get('Continue selling when out of stock') or 'DENY').strip().upper() == 'CONTINUE'
    weight = row.get('Weight value (grams)', '').strip()
    weight_unit = (row.get('Weight unit for display') or 'kg').strip()
    requires_shipping = (row.get('Requires shipping') or 'TRUE').strip().upper() == 'TRUE'
    taxable = (row.get('Charge tax') or 'TRUE').strip().upper() == 'TRUE'
    vendor = (row.get('Vendor') or 'LuxemiaShop').strip()
    product_type = (row.get('Type') or '').strip()
    tags = (row.get('Tags') or '').strip()
    status = (row.get('Status') or 'active').strip().lower()
    published = (row.get('Published on online store') or 'TRUE').strip().upper() == 'TRUE'
    description = (row.get('Description') or '').strip()
    seo_title = (row.get('SEO title') or '').strip()
    seo_description = (row.get('SEO description') or '').strip()
    google_category = (row.get('Google Shopping / Google product category') or '').strip()
    google_gender = (row.get('Google Shopping / Gender') or '').strip()
    google_age_group = (row.get('Google Shopping / Age group') or '').strip()
    google_condition = (row.get('Google Shopping / Condition') or 'New').strip()
    color_metafield = (row.get('Color (product.metafields.shopify.color-pattern)') or '').strip()
    barcode = (row.get('Barcode') or '').strip()

    # Build images
    sorted_images = sorted(product['images'], key=lambda x: x['position'])
    shopify_images = [{'src': img['url'], 'alt': img['alt'] or title} for img in sorted_images]

    # Build variant
    variant = {
        'price': price or '0.00',
        'inventory_management': 'shopify',
        'inventory_quantity': inventory_qty,
        'inventory_policy': 'continue' if continue_selling else 'deny',
        'requires_shipping': requires_shipping,
        'taxable': taxable,
    }

    if compare_at_price:
        variant['compare_at_price'] = compare_at_price
    if sku:
        variant['sku'] = sku
    if barcode:
        variant['barcode'] = barcode
    if weight and float(weight) > 0:
        variant['weight'] = float(weight)
        variant['weight_unit'] = weight_unit
    if option1_name and option1_value:
        variant['option1'] = option1_value

    # Build metafields
    metafields = []
    if color_metafield:
        metafields.append({
            'namespace': 'shopify',
            'key': 'color-pattern',
            'value': color_metafield,
            'type': 'single_line_text_field',
        })
    if google_category:
        metafields.append({
            'namespace': 'google',
            'key': 'product_category',
            'value': google_category,
            'type': 'single_line_text_field',
        })
    if google_gender:
        metafields.append({
            'namespace': 'google',
            'key': 'gender',
            'value': google_gender,
            'type': 'single_line_text_field',
        })
    if google_age_group:
        metafields.append({
            'namespace': 'google',
            'key': 'age_group',
            'value': google_age_group,
            'type': 'single_line_text_field',
        })
    if google_condition:
        metafields.append({
            'namespace': 'google',
            'key': 'condition',
            'value': google_condition,
            'type': 'single_line_text_field',
        })

    # Build payload
    payload = {
        'product': {
            'title': title,
            'body_html': description or None,
            'vendor': vendor,
            'product_type': product_type or None,
            'tags': tags or None,
            'status': 'active' if status == 'active' else 'draft',
            'published': published,
            'variants': [variant],
        }
    }

    if product['handle']:
        payload['product']['handle'] = product['handle']
    if shopify_images:
        payload['product']['images'] = shopify_images
    if option1_name and option1_value:
        payload['product']['options'] = [{'name': option1_name, 'values': [option1_value]}]
    if metafields:
        payload['product']['metafields'] = metafields
    if seo_title or seo_description:
        payload['product']['seo'] = {}
        if seo_title:
            payload['product']['seo']['title'] = seo_title
        if seo_description:
            payload['product']['seo']['description'] = seo_description

    # Remove None values
    product_dict = payload['product']
    for key in list(product_dict.keys()):
        if product_dict[key] is None:
            del product_dict[key]

    return payload


# ─── Shopify API Calls ───────────────────────────────────────────

def shopify_request(path, method='GET', body=None, retry_count=0):
    """Make a Shopify Admin API request with retry logic."""
    url = f'https://{SHOPIFY_STORE}/admin/api/{SHOPIFY_API_VERSION}{path}'
    headers = {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
    }

    kwargs = {'method': method, 'headers': headers}
    if body:
        kwargs['data'] = json.dumps(body)

    response = requests.request(url=url, **kwargs)

    # Rate limiting
    if response.status_code == 429:
        retry_after = int(response.headers.get('Retry-After', 2))
        warn(f'Rate limited. Retrying after {retry_after}s...')
        time.sleep(retry_after)
        return shopify_request(path, method, body, retry_count)

    # Server error retry
    if response.status_code >= 500 and retry_count < MAX_RETRIES:
        delay = RETRY_BASE_DELAY * (2 ** retry_count)
        warn(f'Server error {response.status_code}. Retrying in {delay}s (attempt {retry_count + 1}/{MAX_RETRIES})...')
        time.sleep(delay)
        return shopify_request(path, method, body, retry_count + 1)

    return response


def get_product_count():
    """Get total product count from Shopify."""
    try:
        response = shopify_request('/products/count.json')
        if response.ok:
            return response.json().get('count', -1)
    except Exception:
        pass
    return -1


def fetch_existing_handles():
    """Fetch all existing product handles for deduplication."""
    handles = set()
    since_id = None

    log('Fetching existing product handles from Shopify for deduplication...')

    while True:
        url = f'/products.json?limit=250&fields=id,handle'
        if since_id:
            url += f'&since_id={since_id}'

        response = shopify_request(url)
        if not response.ok:
            warn('Could not fetch existing products for dedup')
            return handles

        data = response.json()
        products = data.get('products', [])

        for p in products:
            handles.add(p['handle'])
            since_id = p['id']

        if len(products) < 250:
            break

        log(f'  Fetched {len(products)} products (total: {len(handles)})')
        time.sleep(0.5)

    return handles


def create_product(payload):
    """Create a product in Shopify."""
    response = shopify_request('/products.json', method='POST', body=payload)

    if not response.ok:
        error_text = response.text[:500]
        raise Exception(f'HTTP {response.status_code}: {error_text}')

    return response.json()


# ─── Main ────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Shopify Bulk Product Import — LuxeMia')
    parser.add_argument('--dry-run', action='store_true', help='Preview without making changes')
    parser.add_argument('--limit', type=int, default=0, help='Max products to import')
    parser.add_argument('--category', type=str, default='', help='Filter by category/type')
    parser.add_argument('--continue-from', type=str, default='', help='Continue from a specific handle or title')
    args = parser.parse_args()

    print(f"""
╔══════════════════════════════════════════════════════════════╗
║          Shopify Bulk Product Import — LuxeMia              ║
╠══════════════════════════════════════════════════════════════╣
║  Store: {SHOPIFY_STORE:<48}║
║  Mode:  {'DRY RUN (no changes)' if args.dry_run else 'LIVE — will create products':<48}║
║  File:  {CSV_PATH[-46:]:>46}║
╚══════════════════════════════════════════════════════════════╝
    """)

    # Validate token
    if not SHOPIFY_ACCESS_TOKEN:
        error('SHOPIFY_ACCESS_TOKEN is required!')
        print("""
Set it as an environment variable:
  SHOPIFY_ACCESS_TOKEN=shpat_xxx python3 scripts/shopify_bulk_import.py

Or for a dry run (no changes):
  SHOPIFY_ACCESS_TOKEN=shpat_xxx python3 scripts/shopify_bulk_import.py --dry-run
        """)
        sys.exit(1)

    # Parse CSV
    log('Parsing CSV file...')
    products = parse_products_from_csv(CSV_PATH)
    log(f'Found {len(products)} unique products')

    # Apply filters
    if args.category:
        cat_lower = args.category.lower()
        products = [p for p in products if
                    cat_lower in (p['row'].get('Type') or '').lower() or
                    cat_lower in (p['row'].get('Tags') or '').lower() or
                    cat_lower in p['title'].lower()]
        log(f'Filtered to {len(products)} products matching category: "{args.category}"')

    if args.continue_from:
        idx = next((i for i, p in enumerate(products)
                     if p['handle'] == args.continue_from or p['title'] == args.continue_from), -1)
        if idx >= 0:
            products = products[idx:]
            log(f'Continuing from "{args.continue_from}" ({len(products)} products remaining)')
        else:
            warn(f'Continue-from "{args.continue_from}" not found, starting from beginning')

    if args.limit > 0:
        products = products[:args.limit]
        log(f'Limited to {len(products)} products')

    if not products:
        log('No products to import after filtering.')
        return

    # Get current Shopify product count
    current_count = get_product_count()
    log(f'Current products in Shopify: {current_count}')

    # Fetch existing handles for dedup
    existing_handles = set()
    if not args.dry_run:
        existing_handles = fetch_existing_handles()
        log(f'Found {len(existing_handles)} existing product handles in Shopify')

    # Process products
    created = 0
    skipped = 0
    failed = 0
    failed_products = []
    continue_from_handle = ''

    print(f'\n{"═" * 60}')
    print(f'Starting import of {len(products)} products...')
    print(f'{"═" * 60}\n')

    for i, product in enumerate(products):
        progress = f'[{i + 1}/{len(products)}]'
        continue_from_handle = product['handle'] or product['title']

        # Check if product already exists
        if product['handle'] in existing_handles:
            log(f'{progress} ⏭️  SKIP (exists): {product["title"]}')
            skipped += 1
            continue

        # Build payload
        payload = build_shopify_payload(product)

        if args.dry_run:
            variant = payload['product'].get('variants', [{}])[0]
            log(f'{progress} 📋 WOULD CREATE: {product["title"]}')
            log(f'     Handle: {product["handle"]}')
            log(f'     Price: ${variant.get("price", "N/A")}')
            log(f'     Compare-at: ${variant.get("compare_at_price", "N/A")}')
            log(f'     Images: {len(payload["product"].get("images", []))}')
            log(f'     Type: {payload["product"].get("product_type", "N/A")}')
            log(f'     Tags: {(payload["product"].get("tags", ""))[:80]}...')
            created += 1
            continue

        # Create product
        try:
            result = create_product(payload)
            sp = result.get('product', {})
            log(f'{progress} ✅ CREATED: {product["title"]} (ID: {sp.get("id")})')
            log(f'     Handle: {sp.get("handle")} | Images: {len(sp.get("images", []))} | Variants: {len(sp.get("variants", []))}')

            existing_handles.add(sp.get('handle', product['handle']))
            created += 1
            time.sleep(API_DELAY)

        except Exception as err:
            error(f'{progress} FAILED: {product["title"]}')
            error(f'     {str(err)[:200]}')
            failed += 1
            failed_products.append({
                'title': product['title'],
                'handle': product['handle'],
                'error': str(err)[:200],
            })
            time.sleep(API_DELAY)

    # Get final count
    new_count = get_product_count()

    # Summary
    print(f"""
{"═" * 60}
  IMPORT SUMMARY
{"═" * 60}
  Mode:           {'DRY RUN' if args.dry_run else 'LIVE'}
  Total products: {len(products)}
  {'Would create:' if args.dry_run else 'Created:'}      {created}
  Skipped:        {skipped} (already exist)
  Failed:         {failed}

  Shopify products before: {current_count}
  Shopify products after:  {new_count if new_count >= 0 else 'unknown'}
""")

    if failed_products:
        print('  Failed products:')
        for p in failed_products:
            print(f'    - {p["title"]} ({p["handle"]}): {p["error"]}')
        print()

    if not args.dry_run and failed > 0:
        print(f'  To continue from the last failure:')
        print(f'    SHOPIFY_ACCESS_TOKEN=xxx python3 scripts/shopify_bulk_import.py --continue-from="{continue_from_handle}"')
        print()

    print(f'{"═" * 60}')

    # Save failed products to file for retry
    if failed_products and not args.dry_run:
        failed_path = os.path.join(SCRIPT_DIR, 'import-failures.json')
        with open(failed_path, 'w') as f:
            json.dump(failed_products, f, indent=2)
        log(f'Failed products saved to: {failed_path}')


if __name__ == '__main__':
    main()
