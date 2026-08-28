#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://luxemia.shop';

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(`[storefront-performance] ${message}`);
}

const sourceIndex = read('index.html');
assert(
  sourceIndex.includes('/images/hero-carousel/navratri-lehenga.webp') &&
    sourceIndex.includes('/images/hero-carousel/navratri-lehenga-desktop.webp'),
  'The current Navratri LCP images are not preloaded in index.html.',
);
assert(
  !sourceIndex.includes('href="/images/campaigns/new-indian-ethnic-wear-2026-mobile.webp"') &&
    !sourceIndex.includes('href="/images/campaigns/new-indian-ethnic-wear-2026-desktop.webp"'),
  'The retired New Arrivals campaign image is still preloaded on the homepage.',
);

const banner = read('src/components/home/NewArrivalsBanner.tsx');
assert(!banner.includes('const preloadedImage = new Image();'), 'The hero still eagerly preloads its next slide.');
assert(
  banner.includes("fetchPriority={index === 0 ? 'high' : 'low'}"),
  'Hero fetch priority is not restricted to the first LCP slide.',
);

const hook = read('src/hooks/useShopifyProducts.ts');
assert(
  hook.includes('storefrontQuery?: string') && hook.includes('fetchAllProducts(storefrontQuery)'),
  'The Shopify product hook does not support a scoped Storefront query.',
);

for (const relativePath of [
  'src/components/home/NewArrivals.tsx',
  'src/pages/NewArrivals.tsx',
]) {
  const source = read(relativePath);
  assert(!source.includes('useShopifyProducts(undefined, true)'), `${relativePath} still forces a complete catalog refresh.`);
  assert(source.includes("created_at:>='"), `${relativePath} does not limit its request to recent products.`);
  assert(
    source.includes('useShopifyProducts(undefined, false, RECENT_PRODUCT_QUERY)'),
    `${relativePath} is not using the recent-product query.`,
  );
}

const builtFiles = ['dist/index.html', 'dist/_prerender/index.html'].filter((relativePath) =>
  fs.existsSync(path.join(ROOT, relativePath)),
);
assert(builtFiles.length > 0, 'No built homepage HTML was found.');

for (const relativePath of builtFiles) {
  const html = read(relativePath);
  assert(
    html.includes('/images/hero-carousel/navratri-lehenga.webp') ||
      html.includes('/images/hero-carousel/navratri-lehenga-desktop.webp'),
    `${relativePath} does not preload the active Navratri hero.`,
  );
  assert(
    !html.includes('href="/images/campaigns/new-indian-ethnic-wear-2026-mobile.webp"') &&
      !html.includes('href="/images/campaigns/new-indian-ethnic-wear-2026-desktop.webp"'),
    `${relativePath} still preloads an inactive campaign image.`,
  );

  const scriptPattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let productSchema = null;
  let match;
  while ((match = scriptPattern.exec(html))) {
    try {
      const parsed = JSON.parse(String(match[1]).trim());
      if (parsed?.['@id'] === `${SITE_URL}/#products`) {
        productSchema = parsed;
        break;
      }
    } catch {
      // Other JSON-LD scripts are validated elsewhere.
    }
  }

  assert(productSchema, `${relativePath} is missing the homepage product discovery ItemList.`);
  assert(
    Array.isArray(productSchema.itemListElement) && productSchema.itemListElement.length <= 6,
    `${relativePath} homepage ItemList contains more than six products.`,
  );
  assert(
    !JSON.stringify(productSchema).includes('shippingDetails'),
    `${relativePath} repeats shippingDetails inside homepage product discovery schema.`,
  );

  console.log(`[storefront-performance] ${relativePath}: ${Buffer.byteLength(html)} bytes.`);
}

console.log(
  '[storefront-performance] OK — active-hero preload, scoped recent-product requests, deferred below-fold media, and compact homepage schema are enforced.',
);
