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

// Apply controlled, owner-approved catalog additions first. The catalog 35757
// sherwanis now have reviewed, brand-free media and are deliberately released
// from their temporary 410 quarantine before downstream validation.
require('./apply-approved-sherwani-sitemap-additions.cjs');

const ROOT = path.resolve(__dirname, '..');
const GONE_HANDLES_FILE = path.join(ROOT, 'src/data/legacyGoneProductHandles.json');
const APPROVED_SITEMAP_FILE = path.join(ROOT, 'scripts/approved-sitemap-inventory.json');
const retirement = require('./product-retirement-20260908.json');
for (const product of retirement.retired) {
  if (!(product.createdAt < retirement.cutoff)) throw new Error('Retirement age check failed: ' + product.handle);
}
const REQUIRED_RETIRED_HANDLES = [
  ...retirement.retired.map(product => product.handle),
  'blue-mauve-olive-velvet-satin-shimmer-saree-handwork-blouse',
  'lavender-blush-pink-georgette-lucknowi-chikankari-front-cut-top-palazzo-set',
];
const REQUIRED_RETIRED_PATHS = new Set(
  REQUIRED_RETIRED_HANDLES.map((handle) => `/product/${handle}`),
);

// A legacy alias cannot keep redirecting into a product retired in this release.
const middlewarePath = path.join(ROOT, 'middleware.ts');
let middleware = fs.readFileSync(middlewarePath, 'utf8');
middleware = middleware.replace(/(const PRODUCT_301_REDIRECTS: Record<string, string> = \{)([\s\S]*?)(\n\};)/, (_match, start, body, end) => {
  const filtered = body.replace(/^[ \t]*['"]([^'"]+)['"]:[ \t]*['"]([^'"]+)['"],?[ \t]*(?:\n|$)/gm, (line, source, target) => {
    if (!REQUIRED_RETIRED_PATHS.has(target)) return line;
    REQUIRED_RETIRED_HANDLES.push(source.replace(/^\/product\//, ''));
    REQUIRED_RETIRED_PATHS.add(source);
    return '';
  });
  return start + filtered + end;
});
fs.writeFileSync(middlewarePath, middleware);

const vercelPath = path.join(ROOT, 'vercel.json');
const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
let changed = true;
while (changed) {
  changed = false;
  vercel.redirects = vercel.redirects.filter(redirect => {
    if (!REQUIRED_RETIRED_PATHS.has(redirect.destination)) return true;
    if (!redirect.source.startsWith('/product/')) throw new Error('Review non-product retirement alias: ' + redirect.source);
    REQUIRED_RETIRED_HANDLES.push(redirect.source.slice('/product/'.length));
    REQUIRED_RETIRED_PATHS.add(redirect.source);
    changed = true;
    return false;
  });
}
fs.writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + '\n');

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

const emptyCatalogRoutes = new Set(require('../src/config/emptyCatalogRoutes.json'));
inventory.paths = inventory.paths.filter((pathname) => !REQUIRED_RETIRED_PATHS.has(pathname) && !emptyCatalogRoutes.has(pathname));
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
