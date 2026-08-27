#!/usr/bin/env node

/**
 * Finalize the catalog-discovery and product-merchandising features adapted
 * from established international ethnic-wear retailers.
 *
 * The repository contains several older migration scripts. This finalizer runs
 * after them, writes the intended release state, and then validates the result.
 * It is deliberately idempotent so repeated Vercel builds cannot create drift.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const changed = [];

const DESTINATIONS = 'the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius';
const PRODUCT_SHIPPING_ANSWER = `LuxeMia ships to ${DESTINATIONS}. U.S. standard shipping is $14.99 below $199 and free at $199 and above. Other destinations use route-based rates shown on the Shipping page and at checkout. Tracking is emailed after dispatch.`;
const PRODUCT_DELIVERY_ANSWER = 'Delivery timing depends on the item and selected options. Product pages show any verified processing estimate before dispatch; carrier transit begins after dispatch. Tracking is emailed after dispatch, and route-based shipping is available to seven supported countries.';

function absolute(relative) {
  return path.join(ROOT, relative);
}

function read(relative) {
  return fs.readFileSync(absolute(relative), 'utf8');
}

function write(relative, content) {
  const file = absolute(relative);
  const before = fs.readFileSync(file, 'utf8');
  if (before === content) return;
  fs.writeFileSync(file, content, 'utf8');
  changed.push(relative);
}

function requireMatch(relative, source, expression, label) {
  if (!expression.test(source)) {
    throw new Error(`[competitor-merchandising] ${relative} missing ${label}`);
  }
}

function patchProductDetail() {
  const relative = 'src/pages/ProductDetail.tsx';
  let source = read(relative);

  source = source.replace(
    /question:\s*`Does LuxeMia ship the \$\{product\.title\} within the United States\?`,\s*\n\s*answer:\s*'[^']*',/,
    `question: \`Where does LuxeMia ship the \${product.title}?\`,\n      answer: '${PRODUCT_SHIPPING_ANSWER}',`,
  );

  source = source.replace(
    /:\s*'Delivery timing depends on the item and selected options\.[^']*'/,
    `: '${PRODUCT_DELIVERY_ANSWER}'`,
  );

  write(relative, source);
}

function patchFilterState() {
  const relative = 'src/hooks/useListingFilters.ts';
  let source = read(relative);

  source = source.replace(
    "const SORT_OPTIONS = ['featured', 'newest', 'price-asc', 'price-desc'] as const;",
    "const SORT_OPTIONS = ['featured', 'newest', 'fastest', 'price-asc', 'price-desc'] as const;",
  );

  write(relative, source);
}

function patchCategoryListing() {
  const relative = 'src/components/collections/CategoryListing.tsx';
  let source = read(relative);

  if (!source.includes("{ label: 'Faster Delivery', value: 'fastest' }")) {
    source = source.replace(
      "  { label: 'Newest', value: 'newest' },",
      "  { label: 'Newest', value: 'newest' },\n  { label: 'Faster Delivery', value: 'fastest' },",
    );
  }

  write(relative, source);
}

function patchProductFilters() {
  const relative = 'src/lib/productFilters.ts';
  let source = read(relative);

  if (!source.includes("import { getProductShipsWithin } from '@/lib/shipBy';")) {
    source = source.replace(
      "import { isProductSizeOptionName } from '@/lib/productOptionNames';",
      "import { isProductSizeOptionName } from '@/lib/productOptionNames';\nimport { getProductShipsWithin } from '@/lib/shipBy';",
    );
  }

  source = source.replace(
    /if \(valueLower\.includes\('ready'\)\) \{[\s\S]*?return hasAvailable && hasReadyTag;\s*\}/,
    `if (valueLower.includes('ready')) {\n            const hasAvailable = variants.some(v => v.node.availableForSale);\n            const shipsWithinDays = getProductShipsWithin(p.node);\n            // "Ready to Ship" is a delivery promise, not a loose marketing tag.\n            // Require the same verified product metafield used by the dedicated\n            // Ready-to-Ship page and structured data.\n            return hasAvailable && shipsWithinDays !== null && shipsWithinDays <= 5;\n          }`,
  );

  if (!source.includes("case 'fastest':")) {
    source = source.replace(
      "  switch (sortBy) {\n    case 'price-asc':",
      `  switch (sortBy) {\n    case 'fastest':\n      sorted.sort((a, b) => {\n        const aDays = getProductShipsWithin(a.node) ?? Number.POSITIVE_INFINITY;\n        const bDays = getProductShipsWithin(b.node) ?? Number.POSITIVE_INFINITY;\n        if (aDays !== bDays) return aDays - bDays;\n        return new Date(b.node.createdAt).getTime() - new Date(a.node.createdAt).getTime();\n      });\n      break;\n    case 'price-asc':`,
    );
  }

  write(relative, source);
}

function patchCategoryConfiguration() {
  const relative = 'src/config/categoryConfig.tsx';
  let source = read(relative);

  source = source
    .split("{ value: 'ready to ship', label: 'Ready to Ship' }")
    .join("{ value: 'ready to ship', label: 'Ready to Ship — up to 5 business days' }");

  write(relative, source);
}

function patchRuntimeShippingSanitizer() {
  const relative = 'src/lib/shopify.ts';
  let source = read(relative);

  source = source
    .split('Free U.S. shipping at $150 and above. $12 flat below that. Tracking provided after dispatch.')
      .join('Tracked shipping is available to seven countries. U.S. shipping is $14.99 below $199 and free at $199 and above. Tracking is provided after dispatch.')
    .split('United States shipping only. Standard shipping is $12 below $150 and free at $150 and above')
      .join('Tracked shipping is available to seven countries. U.S. shipping is $14.99 below $199 and free at $199 and above')
    .split('United States shipping only. Standard shipping is $12 below $150 and free at $150 and above')
      .join('Tracked shipping is available to seven countries. U.S. shipping is $14.99 below $199 and free at $199 and above')
    .split('United States shipping only')
      .join('Tracked shipping to seven supported countries')
    .split('USA, Canada, and Australia')
      .join('the seven supported destination countries');

  write(relative, source);
}

function patchMerchantFeedSource() {
  const relative = 'scripts/generate-static-feed.cjs';
  let source = read(relative);

  source = source
    .split('Tracked U.S. delivery and free shipping on orders $150+')
      .join('Tracked shipping to seven countries; U.S. shipping is free at $199+')
    .split('Free U.S. shipping on orders $150+')
      .join('U.S. shipping is free at $199+')
    .split('Free U.S. shipping at $150 and above')
      .join('U.S. shipping is free at $199 and above')
    .split('Tracked U.S. delivery')
      .join('Tracked shipping to seven supported countries');

  write(relative, source);
}

function extendTrustValidation() {
  const relative = 'scripts/validate-trust-source-of-truth.cjs';
  let source = read(relative);

  if (!source.includes("  'src/pages/ProductDetail.tsx',")) {
    source = source.replace(
      "  'src/pages/ReadyToShip.tsx',",
      "  'src/pages/ReadyToShip.tsx',\n  'src/pages/ProductDetail.tsx',",
    );
  }

  write(relative, source);
}

function validateFinalState() {
  const productDetail = read('src/pages/ProductDetail.tsx');
  requireMatch(
    'src/pages/ProductDetail.tsx',
    productDetail,
    /Where does LuxeMia ship the \$\{product\.title\}\?/,
    'international product shipping FAQ',
  );
  requireMatch(
    'src/pages/ProductDetail.tsx',
    productDetail,
    /route-based shipping is available to seven supported countries/,
    'processing-versus-transit answer',
  );

  const completeTheLook = read('src/components/product/CompleteTheLook.tsx');
  requireMatch(
    'src/components/product/CompleteTheLook.tsx',
    completeTheLook,
    /fetchProducts\(80\)/,
    'live Shopify recommendation pool',
  );
  if (/jewelryProducts|JewelryProduct/.test(completeTheLook)) {
    throw new Error('[competitor-merchandising] CompleteTheLook still depends on local non-Shopify inventory');
  }
  requireMatch(
    'src/components/product/CompleteTheLook.tsx',
    completeTheLook,
    /variants\.length !== 1/,
    'safe single-variant quick-add boundary',
  );

  const filters = read('src/lib/productFilters.ts');
  requireMatch(
    'src/lib/productFilters.ts',
    filters,
    /getProductShipsWithin/,
    'verified processing-time filter',
  );
  requireMatch(
    'src/lib/productFilters.ts',
    filters,
    /case 'fastest':/,
    'faster-delivery sort',
  );

  const listing = read('src/components/collections/CategoryListing.tsx');
  requireMatch(
    'src/components/collections/CategoryListing.tsx',
    listing,
    /Faster Delivery/,
    'buyer-visible faster-delivery sort',
  );

  const filterState = read('src/hooks/useListingFilters.ts');
  requireMatch(
    'src/hooks/useListingFilters.ts',
    filterState,
    /'fastest'/,
    'shareable faster-delivery URL state',
  );

  const categoryConfig = read('src/config/categoryConfig.tsx');
  requireMatch(
    'src/config/categoryConfig.tsx',
    categoryConfig,
    /Ready to Ship — up to 5 business days/,
    'truthful Ready-to-Ship filter label',
  );

  const merchantSource = read('scripts/generate-static-feed.cjs');
  for (const blocked of [
    /Tracked U\.S\. delivery/i,
    /free shipping on orders \$150/i,
    /Free U\.S\. shipping at \$150/i,
  ]) {
    if (blocked.test(merchantSource)) {
      throw new Error(`[competitor-merchandising] Merchant source still contains ${blocked}`);
    }
  }

  const runtimeSource = read('src/lib/shopify.ts')
    .split('\n')
    .filter((line) => !line.includes('.replace(/'))
    .join('\n');
  for (const blocked of [
    /United States shipping only/i,
    /\$12[^\n]{0,80}\$150/i,
    /Free U\.S\. shipping at \$150/i,
  ]) {
    if (blocked.test(runtimeSource)) {
      throw new Error(`[competitor-merchandising] Runtime Shopify source still contains ${blocked}`);
    }
  }
}

patchProductDetail();
patchFilterState();
patchCategoryListing();
patchProductFilters();
patchCategoryConfiguration();
patchRuntimeShippingSanitizer();
patchMerchantFeedSource();
extendTrustValidation();
validateFinalState();

console.log(
  `[competitor-merchandising] OK — live Complete the Look, verified five-day filtering, faster-delivery sorting, international product FAQs, and source-aligned Merchant shipping finalized${changed.length ? ` across ${changed.length} file(s)` : ''}.`,
);
