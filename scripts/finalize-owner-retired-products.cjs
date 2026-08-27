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

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'src/data/legacyGoneProductHandles.json');
const REQUIRED_RETIRED_HANDLES = [
  'blue-mauve-olive-velvet-satin-shimmer-saree-handwork-blouse',
  'lavender-blush-pink-georgette-lucknowi-chikankari-front-cut-top-palazzo-set',
];

const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8'));
if (!Array.isArray(parsed)) {
  throw new Error('[owner-retired-products] legacyGoneProductHandles.json must contain an array.');
}

const before = new Set(parsed.map((value) => String(value).trim()).filter(Boolean));
for (const handle of REQUIRED_RETIRED_HANDLES) before.add(handle);

const finalized = [...before].sort((a, b) => a.localeCompare(b));
fs.writeFileSync(FILE, `${JSON.stringify(finalized, null, 2)}\n`, 'utf8');

for (const handle of REQUIRED_RETIRED_HANDLES) {
  if (!finalized.includes(handle)) {
    throw new Error(`[owner-retired-products] Failed to retain ${handle}.`);
  }
}

console.log(
  `[owner-retired-products] OK — ${REQUIRED_RETIRED_HANDLES.length} owner-removed product URLs are explicitly retired with 410 Gone handling.`,
);
