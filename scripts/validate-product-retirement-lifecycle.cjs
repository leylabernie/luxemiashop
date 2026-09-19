#!/usr/bin/env node
/*
 * Fail fast when a retired-product lifecycle is unsafe.
 *
 * A deleted product must have one of two deliberate outcomes:
 *   1. A verified one-to-one product 301 in middleware.ts, or
 *   2. Inclusion in legacyGoneProductHandles.json for a real 410 Gone response.
 *
 * The validator also compares the last built product manifest with Shopify's
 * current catalog. A formerly live product that disappears without either
 * disposition stops the release before middleware can ship an unresolved 404.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const fail = (label, values) => {
  if (values.length === 0) return;
  throw new Error(`${label}: ${values.slice(0, 20).join(', ')}${values.length > 20 ? ` (+${values.length - 20} more)` : ''}`);
};

const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-10/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';
const PRODUCT_HANDLES_QUERY = `
  query ProductHandles($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: UPDATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      edges { node { handle availableForSale } }
    }
  }
`;

function parseProductRedirects(source) {
  const block = source.match(/const PRODUCT_301_REDIRECTS:\s*Record<string, string>\s*=\s*\{([\s\S]*?)\n\};/);
  if (!block) throw new Error('PRODUCT_301_REDIRECTS block was not found in middleware.ts.');
  const redirects = {};
  const re = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = re.exec(block[1]))) redirects[match[1]] = match[2];
  return redirects;
}

function parsePriorPrerenderProductPaths(source) {
  const block = source.match(/PRERENDERED_PRODUCT_HANDLES:\s*Set<string>\s*=\s*new Set\(\[([\s\S]*?)\]\);/);
  if (!block) throw new Error('PRERENDERED_PRODUCT_HANDLES block was not found in src/lib/prerenderManifest.ts.');
  return new Set([...block[1].matchAll(/['"]([^'"]+)['"]/g)].map((match) => `/product/${match[1]}`));
}

async function fetchCurrentProductPaths() {
  const paths = new Set();
  const sellablePaths = new Set();
  let cursor = null;
  let hasNextPage = true;
  while (hasNextPage) {
    const variables = { first: 250 };
    if (cursor) variables.after = cursor;
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: PRODUCT_HANDLES_QUERY, variables }),
    });
    if (!response.ok) throw new Error(`Shopify product lifecycle query failed: ${response.status} ${response.statusText}`);
    const data = await response.json();
    if (data?.errors?.length) throw new Error(`Shopify product lifecycle query returned errors: ${JSON.stringify(data.errors)}`);
    const edges = data?.data?.products?.edges || [];
    for (const edge of edges) {
      if (!edge?.node?.handle) continue;
      const productPath = `/product/${edge.node.handle}`;
      paths.add(productPath);
      if (edge.node.availableForSale) sellablePaths.add(productPath);
    }
    const pageInfo = data?.data?.products?.pageInfo;
    hasNextPage = pageInfo?.hasNextPage ?? false;
    cursor = pageInfo?.endCursor ?? null;
  }
  if (paths.size === 0) throw new Error('Shopify product lifecycle query returned no product handles.');
  return { paths, sellablePaths };
}

async function main() {
  const inventory = JSON.parse(read('scripts/approved-sitemap-inventory.json'));
  const activeProductPaths = new Set((inventory.paths || []).filter((value) => value.startsWith('/product/')));
  const retiredProductPaths = new Set(
    JSON.parse(read('src/data/legacyGoneProductHandles.json')).map((handle) => `/product/${handle}`)
  );
  const redirects = parseProductRedirects(read('middleware.ts'));
  const redirectSources = Object.keys(redirects);
  const redirectTargets = Object.values(redirects);
  const priorPrerenderProductPaths = parsePriorPrerenderProductPaths(read('src/lib/prerenderManifest.ts'));
  const {
    paths: currentShopifyProductPaths,
    sellablePaths: currentSellableShopifyProductPaths,
  } = await fetchCurrentProductPaths();

  fail('Active sitemap product URL is also marked retired', [...activeProductPaths].filter((value) => retiredProductPaths.has(value)));
  fail('Retired product URL still appears in the approved sitemap inventory', [...retiredProductPaths].filter((value) => activeProductPaths.has(value)));
  fail('Product 301 source still appears in the approved sitemap inventory', redirectSources.filter((value) => activeProductPaths.has(value)));
  fail('Product 301 destination is not an active approved sitemap product', redirectTargets.filter((value) => !activeProductPaths.has(value)));
  fail('Product 301 destination is also marked retired', redirectTargets.filter((value) => retiredProductPaths.has(value)));
  fail('Product 301 contains a non-product source', redirectSources.filter((value) => !value.startsWith('/product/')));
  fail('Product 301 contains a non-product destination', redirectTargets.filter((value) => !value.startsWith('/product/')));
  fail(
    'Sellable Storefront product is incorrectly marked retired',
    [...currentSellableShopifyProductPaths].filter((value) => retiredProductPaths.has(value))
  );

  const missingPriorProducts = [...priorPrerenderProductPaths].filter((pathname) =>
    !currentShopifyProductPaths.has(pathname) &&
    !retiredProductPaths.has(pathname) &&
    !redirects[pathname]
  );
  fail('Previously deployed product disappeared from Shopify without a verified 301 or 410 disposition', missingPriorProducts);

  console.log(
    `[retirement-lifecycle] OK — ${retiredProductPaths.size} retired routes, ` +
    `${redirectSources.length} verified one-to-one redirects, ${activeProductPaths.size} active sitemap products, ` +
    `and ${priorPrerenderProductPaths.size} previously deployed product routes reconciled with ` +
    `${currentShopifyProductPaths.size} current Shopify products (${currentSellableShopifyProductPaths.size} sellable).`
  );
}

main().catch((error) => {
  console.error(`[retirement-lifecycle] ${error.message}`);
  process.exitCode = 1;
});
