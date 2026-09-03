#!/usr/bin/env node

/**
 * Release guard for fulfillment merchandising.
 *
 * This file used to rewrite storefront, filter, prerender, and validator source
 * during every build. Those rewrites encoded the disproven assumption that any
 * purchasable non-custom item was Ready to Ship. The current source is authored
 * directly and this build step is intentionally validation-only: a later build
 * can fail, but it cannot silently restore the negative-inference rule.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const failures = [];

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}

function requireMatch(relative, source, expression, label) {
  if (!expression.test(source)) failures.push(`${relative}: missing ${label}`);
}

function requireAbsent(relative, source, expression, label) {
  if (expression.test(source)) failures.push(`${relative}: contains ${label}`);
}

const evidence = read('src/lib/readyToShipEvidence.ts');
requireMatch(
  'src/lib/readyToShipEvidence.ts',
  evidence,
  /READY_TO_SHIP_TAG[\s\S]*?availability\|fulfillment\|shipping\|status[\s\S]*?ready\[\\s_-\]\*to\[\\s_-\]\*ship/,
  'explicit ready-to-ship tag evidence',
);
requireMatch(
  'src/lib/readyToShipEvidence.ts',
  evidence,
  /shipsWithinMetafield\?\.value \?\? node\.shipsWithinDays \?\? node\.shipsWithin/,
  'positive ships-within evidence',
);

const hook = read('src/hooks/useShopifyProducts.ts');
requireMatch('src/hooks/useShopifyProducts.ts', hook, /hasExplicitReadyToShipEvidence\(product\.node\)/, 'positive Ready-to-Ship evidence gate');
requireMatch('src/hooks/useShopifyProducts.ts', hook, /product\.node\.availableForSale !== true/, 'positive product-availability gate');
requireMatch('src/hooks/useShopifyProducts.ts', hook, /variants\.length > 0 && variants\.some\(\(edge\) => edge\.node\.availableForSale === true\)/, 'positive available-variant gate');
requireMatch('src/hooks/useShopifyProducts.ts', hook, /isMadeToOrderProduct\(product\.node\.handle, product\.node\.tags\)/, 'Made-to-Order exclusion');

const readyPage = read('src/pages/ReadyToShip.tsx');
requireMatch('src/pages/ReadyToShip.tsx', readyPage, /hasExplicitReadyToShipEvidence\(product\.node\)/, 'positive Ready-to-Ship evidence gate');
requireMatch('src/pages/ReadyToShip.tsx', readyPage, /product\.node\.availableForSale !== true/, 'positive product-availability gate');
requireMatch(
  'src/pages/ReadyToShip.tsx',
  readyPage,
  /noIndex=\{!isLoading && !error && sortedProducts\.length === 0\}/,
  'successful empty-result noindex without treating a transient catalog error as an empty catalog',
);
requireAbsent('src/pages/ReadyToShip.tsx', readyPage, /Every purchasable|unless explicitly marked Made to Order/i, 'negative-only Ready-to-Ship inference');

const standards = read('src/config/collectionStandards.ts');
requireMatch('src/config/collectionStandards.ts', standards, /explicitly identifies ready-to-ship status through a supported tag or positive ships-within value/, 'positive-evidence direct answer');
requireAbsent('src/config/collectionStandards.ts', standards, /Every purchasable LuxeMia catalog item is Ready to Ship/i, 'universal Ready-to-Ship claim');

const prerender = read('scripts/prerender.js');
requireMatch('scripts/prerender.js', prerender, /loadTsModule\('src\/lib\/readyToShipEvidence\.ts'\)/, 'shared positive-evidence module loading');
requireMatch('scripts/prerender.js', prerender, /filter\(\(product\) => hasExplicitReadyToShipEvidence\(product\)\)/, 'positive Ready-to-Ship evidence filter');
requireMatch(
  'scripts/prerender.js',
  prerender,
  /function isExplicitlyOrderable\(product\)[\s\S]*?product\?\.availableForSale === true[\s\S]*?variants\.length > 0[\s\S]*?variants\.some\(\(variant\) => variant\?\.node\?\.availableForSale === true\)/,
  'shared positive product-and-variant orderability gate',
);
requireMatch('scripts/prerender.js', prerender, /category === 'ready-to-ship'[\s\S]*?\.filter\(isExplicitlyOrderable\)/, 'Ready-to-Ship orderability filter');
requireMatch('scripts/prerender.js', prerender, /route\.category === 'ready-to-ship' && collectionProducts\.length === 0/, 'empty-result status branch');
requireMatch('scripts/prerender.js', prerender, /No current products met the explicit ready-to-ship evidence and available-variant requirements/, 'neutral empty-result copy');
requireAbsent('scripts/prerender.js', prerender, /Every purchasable LuxeMia catalog item is Ready to Ship|Purchasable catalog items are ready to ship unless/i, 'negative-only Ready-to-Ship inference');

if (failures.length > 0) {
  console.error(`[competitor-merchandising] FAILED (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[competitor-merchandising] OK — validation-only guard confirms positive Ready-to-Ship catalog evidence, available variants, Made-to-Order exclusion, and noindex handling for an empty result.');
