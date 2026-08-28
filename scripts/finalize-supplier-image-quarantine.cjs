#!/usr/bin/env node

/**
 * Temporarily quarantine the nine catalog 35757 sherwanis after the owner
 * identified that their supplier-source images had not been visually cleared.
 *
 * The Shopify products remain as reversible drafts with corrected prices. Their
 * previously deployed headless URLs are deliberately removed from the approved
 * sitemap and marked 410 Gone until clean, brand-free media has been reviewed
 * and the quarantine is explicitly lifted in a later controlled release.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GONE_HANDLES_FILE = path.join(ROOT, 'src/data/legacyGoneProductHandles.json');
const APPROVED_SITEMAP_FILE = path.join(ROOT, 'scripts/approved-sitemap-inventory.json');
const QUARANTINED_HANDLES = [
  'cream-fancy-work-art-silk-wedding-sherwani-with-stole',
  'teal-blue-fancy-work-art-silk-wedding-sherwani-with-stole',
  'beige-fancy-work-art-silk-groom-sherwani-with-stole',
  'pista-green-fancy-work-art-silk-wedding-sherwani-with-stole',
  'dark-peach-fancy-work-art-silk-groom-sherwani-with-stole',
  'grey-fancy-work-art-silk-wedding-sherwani-with-stole',
  'beige-thread-work-art-silk-groom-sherwani-with-stole',
  'cream-thread-work-art-silk-wedding-sherwani-with-stole-design-i',
  'cream-thread-work-art-silk-wedding-sherwani-with-stole-design-ii',
];
const QUARANTINED_PATHS = new Set(
  QUARANTINED_HANDLES.map((handle) => `/product/${handle}`),
);

const parsedGoneHandles = JSON.parse(fs.readFileSync(GONE_HANDLES_FILE, 'utf8'));
if (!Array.isArray(parsedGoneHandles)) {
  throw new Error('[supplier-image-quarantine] legacyGoneProductHandles.json must contain an array.');
}

const goneHandles = new Set(
  parsedGoneHandles.map((value) => String(value).trim()).filter(Boolean),
);
for (const handle of QUARANTINED_HANDLES) goneHandles.add(handle);

const finalizedGoneHandles = [...goneHandles].sort((a, b) => a.localeCompare(b));
fs.writeFileSync(
  GONE_HANDLES_FILE,
  `${JSON.stringify(finalizedGoneHandles, null, 2)}\n`,
  'utf8',
);

const inventory = JSON.parse(fs.readFileSync(APPROVED_SITEMAP_FILE, 'utf8'));
if (!Array.isArray(inventory.paths)) {
  throw new Error('[supplier-image-quarantine] approved-sitemap-inventory.json must contain a paths array.');
}

inventory.source =
  '2026-08-28 controlled catalog inventory: retained verified live products while quarantining nine catalog 35757 sherwanis whose supplier-source images require visual cleaning and approval before republication';
inventory.capturedOn = '2026-08-28';
inventory.paths = inventory.paths.filter((pathname) => !QUARANTINED_PATHS.has(pathname));
inventory.urlCount = inventory.paths.length;
fs.writeFileSync(
  APPROVED_SITEMAP_FILE,
  `${JSON.stringify(inventory, null, 2)}\n`,
  'utf8',
);

for (const handle of QUARANTINED_HANDLES) {
  if (!finalizedGoneHandles.includes(handle)) {
    throw new Error(`[supplier-image-quarantine] Failed to quarantine ${handle}.`);
  }
}
for (const pathname of QUARANTINED_PATHS) {
  if (inventory.paths.includes(pathname)) {
    throw new Error(`[supplier-image-quarantine] Quarantined URL remains approved: ${pathname}`);
  }
}

console.log(
  `[supplier-image-quarantine] OK — ${QUARANTINED_HANDLES.length} catalog 35757 product URLs are excluded from sitemap and Merchant output and resolve as 410 Gone until clean images are approved.`,
);
