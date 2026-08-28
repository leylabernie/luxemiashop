#!/usr/bin/env node

/**
 * Preserve the deliberate retirement of the two products the owner removed
 * during the catalog-cleanup release. They have no verified one-to-one
 * replacement, so their former product URLs must return a real 410 Gone rather
 * than an unresolved 404 or an unrelated redirect.
 *
 * This finalizer is idempotent and runs before the product-retirement lifecycle
 * validator and gone-route generator during every release build.
 */
const fs = require('fs');
const path = require('path');

// Apply controlled, owner-approved catalog additions first, then immediately
// quarantine any products whose supplier-source media has not passed visual
// cleaning review. Downstream validators therefore read the final safe state.
require('./apply-approved-sherwani-sitemap-additions.cjs');
require('./finalize-supplier-image-quarantine.cjs');

const ROOT = path.resolve(__dirname, '..');
const GONE_HANDLES_FILE = path.join(ROOT, 'src/data/legacyGoneProductHandles.json');
const APPROVED_SITEMAP_FILE = path.join(ROOT, 'scripts/approved-sitemap-inventory.json');
const REQUIRED_RETIRED_HANDLES = [
  'blue-mauve-olive-velvet-satin-shimmer-saree-handwork-blouse',
  'lavender-blush-pink-georgette-lucknowi-chikankari-front-cut-top-palazzo-set',
];
const REQUIRED_RETIRED_PATHS = new Set(
  REQUIRED_RETIRED_HANDLES.map((handle) => `/product/${handle}`),
);

const parsedHandles = JSON.parse(fs.readFileSync(GONE_HANDLES_FILE, 'utf8'));
if (!Array.isArray(parsedHandles)) {
  throw new Error('[owner-retired-products] legacyGoneProductHandles.json must contain an array.');
}

const goneHandles = new Set(parsedHandles.map((value) => String(value).trim()).filter(Boolean));
for (const handle of REQUIRED_RETIRED_HANDLES) goneHandles.add(handle);

const finalizedHandles = [...goneHandles].sort((a, b) => a.localeCompare(b));
fs.writeFileSync(GONE_HANDLES_FILE, `${JSON.stringify(finalizedHandles, null, 2)}\n`, 'utf8');

const inventory = JSON.parse(fs.readFileSync(APPROVED_SITEMAP_FILE, 'utf8'));
if (!Array.isArray(inventory.paths)) {
  throw new Error('[owner-retired-products] approved-sitemap-inventory.json must contain a paths array.');
}

inventory.paths = inventory.paths.filter((pathname) => !REQUIRED_RETIRED_PATHS.has(pathname));
inventory.urlCount = inventory.paths.length;
fs.writeFileSync(APPROVED_SITEMAP_FILE, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');

for (const handle of REQUIRED_RETIRED_HANDLES) {
  if (!finalizedHandles.includes(handle)) {
    throw new Error(`[owner-retired-products] Failed to retain ${handle}.`);
  }
}
for (const pathname of REQUIRED_RETIRED_PATHS) {
  if (inventory.paths.includes(pathname)) {
    throw new Error(`[owner-retired-products] Retired URL remains in approved sitemap inventory: ${pathname}`);
  }
}

console.log(
  `[owner-retired-products] OK — ${REQUIRED_RETIRED_HANDLES.length} owner-removed product URLs are explicitly retired with 410 Gone handling and excluded from the approved sitemap inventory.`,
);
