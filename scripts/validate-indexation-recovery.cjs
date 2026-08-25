#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const middlewarePath = path.join(root, 'middleware.ts');
const robotsPath = path.join(root, 'public', 'robots.txt');
const productHookPath = path.join(root, 'src', 'hooks', 'useShopifyProducts.ts');
const prerenderPath = path.join(root, 'scripts', 'prerender.js');
const shopifyProxyPath = path.join(root, 'src', 'middleware', 'shopifyProxy.ts');

const middleware = fs.readFileSync(middlewarePath, 'utf8');
const robots = fs.readFileSync(robotsPath, 'utf8');
const productHook = fs.readFileSync(productHookPath, 'utf8');
const prerender = fs.readFileSync(prerenderPath, 'utf8');
const shopifyProxy = fs.readFileSync(shopifyProxyPath, 'utf8');

const failures = [];
const requireText = (source, needle, label) => {
  if (!source.includes(needle)) failures.push(`Missing ${label}: ${needle}`);
};

requireText(middleware, 'INDEXATION_NOISE_PARAMS', 'query-noise parameter registry');
requireText(middleware, 'withCanonicalQuerySignals', 'HTTP query canonicalization helper');
requireText(middleware, "headers.set('Link'", 'HTTP Link canonical header');
requireText(middleware, "headers.set('X-Robots-Tag', 'noindex, follow')", 'facet noindex directive');
requireText(middleware, "rel=\"canonical\"", 'clean canonical relation');

requireText(shopifyProxy, "{ status: 'found'; product: ShopifyProduct }", 'found Shopify lookup result');
requireText(shopifyProxy, "{ status: 'not_found' }", 'definitive Shopify not-found result');
requireText(shopifyProxy, "{ status: 'unavailable' }", 'transient Shopify unavailable result');
requireText(shopifyProxy, "{ status: 'unavailable' }\n>", 'unavailable cache exclusion');
requireText(shopifyProxy, 'function isShopifyProduct(value: unknown): value is ShopifyProduct', 'Shopify product shape guard');
requireText(shopifyProxy, 'Array.isArray(value)', 'Shopify product array rejection');
requireText(shopifyProxy, 'Array.isArray(product.images?.edges)', 'Shopify image-edge validation');
requireText(shopifyProxy, 'Array.isArray(product.variants?.edges)', 'Shopify variant-edge validation');
requireText(shopifyProxy, 'Array.isArray(product.options)', 'Shopify options validation');
requireText(shopifyProxy, 'if (!response.ok)', 'Shopify HTTP error handling');
requireText(shopifyProxy, 'payload?.errors !== undefined', 'Shopify GraphQL error handling');
requireText(shopifyProxy, "product === null\n      ? { status: 'not_found' }\n      : { status: 'found', product }", 'definitive Shopify lookup classification');
requireText(middleware, "productLookup.status === 'found'", 'found-product middleware branch');
requireText(middleware, "productLookup.status === 'unavailable'", 'unavailable-product middleware branch');

if (shopifyProxy.includes('Promise<ShopifyProduct | null>')) {
  failures.push('The Shopify proxy still exposes null as an ambiguous lookup result.');
}

const cacheWrites = shopifyProxy.match(/productCache\.set\(/g)?.length || 0;
if (cacheWrites !== 1) {
  failures.push(`Expected one guarded Shopify product-cache write, found ${cacheWrites}.`);
}

const unavailableReturns = shopifyProxy.match(/return \{ status: 'unavailable' \};/g)?.length || 0;
if (unavailableReturns < 4) {
  failures.push('HTTP, GraphQL, malformed-payload, and thrown Shopify failures must all return unavailable.');
}

const unavailableHelper = middleware.match(
  /function returnShopifyUnavailable\(\): Response \{([\s\S]*?)\n\}/,
)?.[1] || '';
requireText(unavailableHelper, 'status: 503', 'Shopify unavailable 503 status');
requireText(unavailableHelper, "'Cache-Control': 'no-store'", 'Shopify unavailable no-store directive');
requireText(unavailableHelper, "'Retry-After': '60'", 'Shopify unavailable retry guidance');

const productRouteStart = middleware.indexOf("if (pathname.startsWith('/product/'))");
const productRouteEnd = middleware.indexOf('// Preserve SEO equity for legacy size-guide URLs', productRouteStart);
const productRoute = productRouteStart >= 0 && productRouteEnd > productRouteStart
  ? middleware.slice(productRouteStart, productRouteEnd)
  : '';
const lookupIndex = productRoute.indexOf('const productLookup = await fetchProductByHandle(handle);');
const foundIndex = productRoute.indexOf("productLookup.status === 'found'", lookupIndex);
const jewelryIndex = productRoute.indexOf('getJewelryProductByHandle(handle)', foundIndex);
const unavailableIndex = productRoute.indexOf("productLookup.status === 'unavailable'", jewelryIndex);
const unavailableResponseIndex = productRoute.indexOf('return returnShopifyUnavailable();', unavailableIndex);
const final404Index = productRoute.indexOf('return return404(request);', unavailableResponseIndex);
if (!(
  lookupIndex >= 0
  && lookupIndex < foundIndex
  && foundIndex < jewelryIndex
  && jewelryIndex < unavailableIndex
  && unavailableIndex < unavailableResponseIndex
  && unavailableResponseIndex < final404Index
)) {
  failures.push('Product routing must serve found/local products, return 503 for upstream failure, and reserve 404 for definitive misses.');
}

const requiredNoiseParameters = [
  'sort_by',
  'filter',
  'grid',
  'q',
  'sub',
  'color',
  'fabric',
  'size',
  'price_min',
  'price_max',
];

for (const parameter of requiredNoiseParameters) {
  requireText(middleware, `'${parameter}'`, `indexation-noise parameter ${parameter}`);
}

const registryMatch = middleware.match(
  /const INDEXATION_NOISE_PARAMS[^=]*=\s*new Set(?:<string>)?\(\[([\s\S]*?)\]\);/,
);
if (!registryMatch) {
  failures.push('Could not parse INDEXATION_NOISE_PARAMS.');
} else if (/['"]variant['"]/.test(registryMatch[1])) {
  failures.push('variant must remain canonical-only; do not noindex or robots-block Merchant/product variant landing URLs.');
}

const queryDisallows = robots
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /^Disallow:/i.test(line) && line.includes('?'));

if (queryDisallows.length > 0) {
  failures.push(
    `robots.txt blocks query URLs before crawlers can read their canonical/noindex signals: ${queryDisallows.join(', ')}`,
  );
}

requireText(robots, '?variant=', 'variant crawl/canonical safeguard comment');
requireText(robots, 'Sitemap: https://luxemia.shop/sitemap.xml', 'authoritative sitemap declaration');

requireText(prerender, 'const MAX_COLLECTION_PRODUCTS = 50;', 'bounded first-paint collection payload');
requireText(prerender, 'generateApprovedProductDirectoryHtml', 'complete product directory generator');
requireText(prerender, 'aria-label="Complete product directory"', 'crawlable complete product directory');

const initialIndex = productHook.indexOf('if (initial) {');
const firstPaintIndex = productHook.indexOf('applyProducts(initial);', initialIndex);
const loadingCompleteIndex = productHook.indexOf('setIsLoading(false);', firstPaintIndex);
const fullCatalogIndex = productHook.indexOf('await getAllProducts()', loadingCompleteIndex);
const fullCatalogApplyIndex = productHook.indexOf('applyProducts(fullCatalog);', fullCatalogIndex);
const initialReturnIndex = productHook.indexOf('\n          return;', fullCatalogApplyIndex);

if (
  initialIndex < 0
  || firstPaintIndex < 0
  || loadingCompleteIndex < 0
  || fullCatalogIndex < 0
  || fullCatalogApplyIndex < 0
  || initialReturnIndex < 0
) {
  failures.push('Could not verify the prerender-first/full-catalog-second hydration sequence.');
} else if (!(
  initialIndex < firstPaintIndex
  && firstPaintIndex < loadingCompleteIndex
  && loadingCompleteIndex < fullCatalogIndex
  && fullCatalogIndex < fullCatalogApplyIndex
  && fullCatalogApplyIndex < initialReturnIndex
)) {
  failures.push('Category hydration must paint prerendered products before fetching and applying the full catalog.');
}

requireText(productHook, 'window.__INITIAL_DATA__ = undefined;', 'route-scoped hydration payload cleanup');
requireText(productHook, 'let cancelled = false;', 'unmounted-request cancellation guard');
requireText(productHook, 'Unable to refresh the complete Shopify catalog', 'non-blocking background refresh fallback');

if (failures.length > 0) {
  console.error('Indexation recovery validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  'Indexation recovery validation passed: public query duplicates expose clean canonicals, transient Shopify failures stay out of the 404/cache path, variant URLs stay crawlable, the first 50 collection products paint immediately, the full catalog refreshes after hydration, and the complete crawlable product directory remains available.',
);
