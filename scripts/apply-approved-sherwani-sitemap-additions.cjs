#!/usr/bin/env node

/**
 * Add the owner-approved Surat Wholesale Shop catalog 35757 sherwanis to the
 * controlled sitemap inventory before the normal retirement finalizer and
 * release validators run.
 *
 * Keeping this as an idempotent build-time finalizer avoids silently opening
 * the sitemap to every Shopify candidate product while ensuring these nine
 * reviewed, published products receive the same prerender and sitemap checks
 * as the existing approved catalog.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APPROVED_SITEMAP_FILE = path.join(ROOT, 'scripts/approved-sitemap-inventory.json');
const CAPTURED_ON = '2026-08-28';
const APPROVED_SHERWANI_PATHS = [
  '/product/cream-fancy-work-art-silk-wedding-sherwani-with-stole',
  '/product/teal-blue-fancy-work-art-silk-wedding-sherwani-with-stole',
  '/product/beige-fancy-work-art-silk-groom-sherwani-with-stole',
  '/product/pista-green-fancy-work-art-silk-wedding-sherwani-with-stole',
  '/product/dark-peach-fancy-work-art-silk-groom-sherwani-with-stole',
  '/product/grey-fancy-work-art-silk-wedding-sherwani-with-stole',
  '/product/beige-thread-work-art-silk-groom-sherwani-with-stole',
  '/product/cream-thread-work-art-silk-wedding-sherwani-with-stole-design-i',
  '/product/cream-thread-work-art-silk-wedding-sherwani-with-stole-design-ii',
];

const inventory = JSON.parse(fs.readFileSync(APPROVED_SITEMAP_FILE, 'utf8'));
if (!Array.isArray(inventory.paths)) {
  throw new Error('[approved-sherwani-sitemap] approved-sitemap-inventory.json must contain a paths array.');
}

const originalPaths = inventory.paths.map((value) => String(value).trim()).filter(Boolean);
const originalPathSet = new Set(originalPaths);
if (originalPathSet.size !== originalPaths.length) {
  throw new Error('[approved-sherwani-sitemap] Existing approved sitemap inventory contains duplicate paths.');
}

for (const pathname of APPROVED_SHERWANI_PATHS) {
  if (!pathname.startsWith('/product/')) {
    throw new Error(`[approved-sherwani-sitemap] Invalid product path: ${pathname}`);
  }
  if (!originalPathSet.has(pathname)) {
    originalPaths.push(pathname);
    originalPathSet.add(pathname);
  }
}

for (const pathname of APPROVED_SHERWANI_PATHS) {
  if (!originalPathSet.has(pathname)) {
    throw new Error(`[approved-sherwani-sitemap] Failed to approve ${pathname}.`);
  }
}

inventory.source =
  '2026-08-28 catalog release: retained the verified recovery inventory and added nine published Surat Wholesale Shop catalog 35757 art-silk sherwanis after product, publication, pricing, image, SEO, storefront, and Merchant-feed checks; hidden billing and unreviewed candidates remain excluded';
inventory.capturedOn = CAPTURED_ON;
inventory.paths = originalPaths;
inventory.urlCount = originalPaths.length;

fs.writeFileSync(APPROVED_SITEMAP_FILE, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');

console.log(
  `[approved-sherwani-sitemap] OK — ${APPROVED_SHERWANI_PATHS.length} reviewed catalog 35757 sherwani URLs are present in the ${inventory.urlCount}-URL approved inventory before retirement finalization.`,
);
