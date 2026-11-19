#!/usr/bin/env node
/**
 * LuxeMia Royal Bridal Silk Vol-3 — Idempotent Shopify Admin API Publisher
 * ========================================================================
 * Publishes all 14 Royal Bridal Silk Vol-3 listings from src/data/bridalVol3Catalog.json
 * directly into Shopify (10 active with 23 clean base64-uploaded studio photos + 4 draft
 * awaiting photography), sets structured custom.* metafields, and creates all 9 Utsav-style
 * standard (32-46) and Custom Fit variants priced at exact USD = round((INR * 2) / 90, 2).
 *
 * Usage:
 *   node scripts/publish-bridal-vol3-shopify.mjs --dry-run
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node scripts/publish-bridal-vol3-shopify.mjs
 *
 * Alternative (no token needed):
 *   Import catalog-imports/luxemia-royal-bridal-silk-vol3-shopify.csv directly in
 *   Shopify Admin -> Products -> Import after merging so luxemia.shop serves the images.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(ROOT, 'src/data/bridalVol3Catalog.json');

const SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN || 'lovable-project-zlh0w.myshopify.com';
const API_VERSION = process.env.SHOPIFY_ADMIN_API_VERSION || '2025-10';
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
const DRY_RUN = process.argv.includes('--dry-run');
const ACTIVE_ONLY = process.argv.includes('--active-only');

async function adminRest(method, endpoint, body) {
  const res = await fetch(`https://${SHOP_DOMAIN}/admin/api/${API_VERSION}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Shopify Admin ${method} ${endpoint} failed (${res.status}): ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

function buildProductPayload(item) {
  const images = item.images.map((img) => {
    const localFile = path.join(ROOT, 'public', img.jpgPath.replace(/^\//, ''));
    const attachment = fs.readFileSync(localFile).toString('base64');
    return {
      position: img.position,
      filename: path.basename(localFile),
      attachment,
      alt: img.alt,
    };
  });

  const variants = item.variants.map((v) => ({
    option1: v.size,
    sku: v.sku,
    price: v.price,
    compare_at_price: v.compareAtPrice,
    grams: v.grams,
    weight: item.weightKg,
    weight_unit: 'kg',
    inventory_management: 'shopify',
    inventory_policy: 'deny',
    inventory_quantity: v.inventoryQty,
    fulfillment_service: 'manual',
    requires_shipping: true,
    taxable: true,
  }));

  const metafields = [
    {
      namespace: 'global',
      key: 'title_tag',
      type: 'single_line_text_field',
      value: item.seoTitle,
    },
    {
      namespace: 'global',
      key: 'description_tag',
      type: 'single_line_text_field',
      value: item.seoDescription,
    },
    {
      namespace: 'custom',
      key: 'fabric',
      type: 'single_line_text_field',
      value: item.specs.lehengaFabric,
    },
    {
      namespace: 'custom',
      key: 'material',
      type: 'single_line_text_field',
      value: 'Bridal Silk, Soft Net, Viscose',
    },
    {
      namespace: 'custom',
      key: 'occasion',
      type: 'single_line_text_field',
      value: 'Bridal, Wedding, Reception',
    },
    {
      namespace: 'custom',
      key: 'included_components',
      type: 'single_line_text_field',
      value: item.specs.includedPieces,
    },
    {
      namespace: 'custom',
      key: 'ships_within',
      type: 'single_line_text_field',
      value: item.specs.shipsWithin,
    },
  ];

  return {
    title: item.title,
    handle: item.handle,
    body_html: item.bodyHtml,
    vendor: item.vendor,
    product_type: item.productType,
    status: item.status,
    published: item.published,
    tags: item.tags.join(', '),
    options: [{ name: 'Size', values: item.variants.map((v) => v.size) }],
    variants,
    images,
    metafields,
  };
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const targets = ACTIVE_ONLY
    ? catalog.products.filter((p) => p.status === 'active')
    : catalog.products;

  if (!DRY_RUN && !ADMIN_TOKEN) {
    console.error(
      'Missing SHOPIFY_ADMIN_ACCESS_TOKEN. Pass --dry-run to verify payloads or set SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_... to publish.',
    );
    process.exit(1);
  }

  console.log(
    `[publish-bridal-vol3] ${DRY_RUN ? 'DRY RUN' : `Publishing to ${SHOP_DOMAIN}`} — ${targets.length} products (${targets.filter((p) => p.status === 'active').length} active, ${targets.filter((p) => p.status === 'draft').length} draft)`,
  );

  for (const item of targets) {
    const product = buildProductPayload(item);
    if (DRY_RUN) {
      console.log(
        `  [dry-run] ${item.skuBase} (${item.status}) | $${item.priceUsd} (INR ${item.inrPrice}) | ${product.variants.length} variants | ${product.images.length} images | ${item.handle}`,
      );
      continue;
    }

    const existing = await adminRest(
      'GET',
      `/products.json?handle=${encodeURIComponent(item.handle)}&status=any&fields=id,handle,title`,
    );
    const match = existing.products?.[0];
    if (match) {
      const { metafields: _mf, ...updateBody } = product;
      const updated = await adminRest('PUT', `/products/${match.id}.json`, {
        product: { id: match.id, ...updateBody },
      });
      console.log(`  [updated] ${item.handle} -> id ${updated.product.id} (${item.status}, $${item.priceUsd})`);
    } else {
      const created = await adminRest('POST', '/products.json', { product });
      console.log(`  [created] ${item.handle} -> id ${created.product.id} (${item.status}, $${item.priceUsd})`);
    }
  }

  console.log('[publish-bridal-vol3] Done.');
}

main().catch((err) => {
  console.error('[publish-bridal-vol3] Failed:', err.message);
  process.exit(1);
});
