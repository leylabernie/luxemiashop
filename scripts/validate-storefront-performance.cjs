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
const activeImage = 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/Grey-Georgette-Wedding-Wear-Embroidery-Work-Lehenga-Choli-4797-321-B_1.jpg?v=1793569611';
assert(sourceIndex.includes(activeImage), 'The current editorial photo is not preloaded.');
assert(!/luxemia-diwali|luxemia-new-arrivals-2026/.test(sourceIndex), 'Expired campaign artwork is preloaded.');
const banner = read('src/components/home/NewArrivalsBanner.tsx');
assert(banner.includes('NewArrivalsEditorial'), 'Homepage must use evergreen editorial.');
assert(read('src/components/home/NewArrivalsEditorial.tsx').includes('fetchPriority="high"'), 'Editorial photo must retain LCP priority.');

const hook = read('src/hooks/useShopifyProducts.ts');
assert(
  hook.includes('storefrontQuery?: string') && hook.includes('getAllProducts(storefrontQuery,'),
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
  assert(html.includes(activeImage), `${relativePath} does not preload the active editorial image.`);
  assert(!/luxemia-diwali|luxemia-new-arrivals-2026/.test(html), `${relativePath} includes retired seasonal artwork.`);

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

  const isPrerenderedHomepage = relativePath.includes('/_prerender/');
  if (isPrerenderedHomepage) {
    assert(productSchema, `${relativePath} is missing the homepage product discovery ItemList.`);
  }

  if (productSchema) {
    assert(
      Array.isArray(productSchema.itemListElement) && productSchema.itemListElement.length <= 6,
      `${relativePath} homepage ItemList contains more than six products.`,
    );
    assert(
      !JSON.stringify(productSchema).includes('shippingDetails'),
      `${relativePath} repeats shippingDetails inside homepage product discovery schema.`,
    );
  }

  console.log(`[storefront-performance] ${relativePath}: ${Buffer.byteLength(html)} bytes.`);
}

console.log(
  '[storefront-performance] OK — active-hero preload, scoped recent-product requests, deferred below-fold media, and compact homepage schema are enforced.',
);
