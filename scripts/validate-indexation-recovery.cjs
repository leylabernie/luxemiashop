#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const middlewarePath = path.join(root, 'middleware.ts');
const robotsPath = path.join(root, 'public', 'robots.txt');
const productHookPath = path.join(root, 'src', 'hooks', 'useShopifyProducts.ts');
const prerenderPath = path.join(root, 'scripts', 'prerender.js');
const shopifyProxyPath = path.join(root, 'src', 'middleware', 'shopifyProxy.ts');
const htmlGeneratorPath = path.join(root, 'src', 'middleware', 'htmlGenerator.ts');
const dynamicSitemapPath = path.join(root, 'src', 'lib', 'dynamicSitemap.ts');
const sitemapPagePath = path.join(root, 'src', 'pages', 'Sitemap.tsx');
const appPath = path.join(root, 'src', 'App.tsx');
const autoRoutesPath = path.join(root, 'src', 'lib', 'autoRoutes.ts');
const prerenderManifestPath = path.join(root, 'src', 'lib', 'prerenderManifest.ts');
const approvedInventoryPath = path.join(root, 'scripts', 'approved-sitemap-inventory.json');
const sitemapGeneratorPath = path.join(root, 'scripts', 'generate-sitemap.cjs');
const indexNowBuilderPath = path.join(root, 'scripts', 'submit-indexnow.cjs');
const indexNowNotifierPath = path.join(root, 'scripts', 'notify-indexnow.cjs');
const indexNowWorkflowPath = path.join(root, '.github', 'workflows', 'indexnow-after-production.yml');
const serviceAddOnsPath = path.join(root, 'src', 'lib', 'serviceAddOns.ts');
const staticFeedGeneratorPath = path.join(root, 'scripts', 'generate-static-feed.cjs');
const vercelFeedPath = path.join(root, 'api', 'merchant-feed.ts');

const middleware = fs.readFileSync(middlewarePath, 'utf8');
const robots = fs.readFileSync(robotsPath, 'utf8');
const productHook = fs.readFileSync(productHookPath, 'utf8');
const prerender = fs.readFileSync(prerenderPath, 'utf8');
const shopifyProxy = fs.readFileSync(shopifyProxyPath, 'utf8');
const htmlGenerator = fs.readFileSync(htmlGeneratorPath, 'utf8');
const dynamicSitemap = fs.readFileSync(dynamicSitemapPath, 'utf8');
const sitemapPage = fs.readFileSync(sitemapPagePath, 'utf8');
const app = fs.readFileSync(appPath, 'utf8');
const autoRoutes = fs.readFileSync(autoRoutesPath, 'utf8');
const prerenderManifest = fs.readFileSync(prerenderManifestPath, 'utf8');
const approvedInventory = JSON.parse(fs.readFileSync(approvedInventoryPath, 'utf8'));
const sitemapGenerator = fs.readFileSync(sitemapGeneratorPath, 'utf8');
const indexNowBuilder = fs.readFileSync(indexNowBuilderPath, 'utf8');
const indexNowNotifier = fs.readFileSync(indexNowNotifierPath, 'utf8');
const indexNowWorkflow = fs.readFileSync(indexNowWorkflowPath, 'utf8');
const serviceAddOns = fs.readFileSync(serviceAddOnsPath, 'utf8');
const staticFeedGenerator = fs.readFileSync(staticFeedGeneratorPath, 'utf8');
const vercelFeed = fs.readFileSync(vercelFeedPath, 'utf8');

const machineReadablePaths = [
  '/robots.txt',
  '/sitemap.xml',
  '/sitemap-products.xml',
  '/sitemap-collections.xml',
  '/sitemap-guides.xml',
  '/sitemap-pages.xml',
  '/sitemap-images.xml',
  '/merchant-feed.xml',
  '/google-shopping-feed.xml',
  '/openai-search-products.jsonl.gz',
  '/llms.txt',
  '/llms-full.txt',
  '/indexnow-manifest.json',
  '/8e3d7c9415b24a5f9c81e62d1a0374bf.txt',
  '/3c4a52b9-542f-4bfe-a61b-9afb42f4312c.txt',
  '/e6b81aa0325a277cfb7c764e603dd9cd.txt',
  '/google4e3f332d00afc8ba.html',
];

const failures = [];
const requireText = (source, needle, label) => {
  if (!source.includes(needle)) failures.push(`Missing ${label}: ${needle}`);
};

requireText(middleware, 'INDEXATION_NOISE_PARAMS', 'query-noise parameter registry');
requireText(middleware, 'withCanonicalQuerySignals', 'HTTP query canonicalization helper');
requireText(middleware, "headers.set('Link'", 'HTTP Link canonical header');
requireText(middleware, "headers.set('X-Robots-Tag', 'noindex, follow')", 'facet noindex directive');
requireText(middleware, "rel=\"canonical\"", 'clean canonical relation');
requireText(middleware, 'STATIC_PASSTHROUGH_PATHS', 'exact static-file passthrough allowlist');
requireText(middleware, 'api(?:/|$)', 'boundary-safe internal matcher exclusions');

for (const hiddenHandle of [
  'luxemia-tailoring-saree-finishing-add-ons',
  'custom-order-balance-payment',
]) {
  for (const [source, label] of [
    [serviceAddOns, 'shared hidden-billing registry'],
    [prerender, 'product prerender exclusion'],
    [sitemapGenerator, 'sitemap exclusion'],
    [staticFeedGenerator, 'static Merchant-feed exclusion'],
    [vercelFeed, 'dynamic Merchant-feed exclusion'],
    [app, 'SPA direct-route guard'],
  ]) {
    requireText(source, hiddenHandle, `${label} for ${hiddenHandle}`);
  }
}

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
requireText(middleware, 'returnProductDeploymentPending()', 'deployment-pending product response');

if (middleware.includes('generateProductHtml') || htmlGenerator.includes('generateProductHtml')) {
  failures.push('The retired standalone product HTML renderer must not remain reachable or defined.');
}

for (const forbidden of ['generateXmlSitemap', 'window.location.origin', 'Download Dynamic Sitemap']) {
  if (dynamicSitemap.includes(forbidden) || sitemapPage.includes(forbidden)) {
    failures.push(`The human sitemap page still exposes a divergent client-generated XML artifact: ${forbidden}`);
  }
}
for (const routePath of machineReadablePaths.filter((value) => value.startsWith('/sitemap'))) {
  requireText(
    sitemapPage,
    `https://luxemia.shop${routePath}`,
    `canonical human-page link to ${routePath}`,
  );
}

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
const unavailableIndex = productRoute.indexOf("productLookup.status === 'unavailable'", foundIndex);
const unavailableResponseIndex = productRoute.indexOf('return returnShopifyUnavailable();', unavailableIndex);
const final404Index = productRoute.indexOf('return return404(request);', unavailableResponseIndex);
const deploymentPendingIndex = productRoute.indexOf('return returnProductDeploymentPending();', foundIndex);
if (!(
  lookupIndex >= 0
  && lookupIndex < foundIndex
  && foundIndex < deploymentPendingIndex
  && deploymentPendingIndex < unavailableIndex
  && foundIndex < unavailableIndex
  && unavailableIndex < unavailableResponseIndex
  && unavailableResponseIndex < final404Index
)) {
  failures.push('Product routing must serve Shopify-backed products, return 503 for upstream failure, and reserve 404 for definitive misses.');
}
if (/jewelryFallback|getJewelryProductByHandle|generateJewelryProductHtml/.test(productRoute)) {
  failures.push('Product routing must not publish a non-Shopify product fallback.');
}

const requiredNoiseParameters = [
  'sort_by',
  'sort',
  'filter',
  'grid',
  'q',
  'sub',
  'color',
  'fabric',
  'size',
  'price_min',
  'price_max',
  'price',
  'work',
  'style',
  'occasion',
  'availability',
  'gender',
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

// Every approved sitemap/IndexNow product must have a committed prerender.
// The build then compares the approved set to fresh Shopify evidence and fails
// on either an ineligible approved product or an eligible omission. The reverse
// is deliberately not a source invariant: an unavailable but still useful
// product page may remain prerendered while being excluded from the sitemap.
const parseSetValues = (source, exportName) => {
  const block = source.match(new RegExp(`${exportName}[^=]*=\\s*new Set\\(\\[([\\s\\S]*?)\\]\\);`))?.[1] || '';
  return [...block.matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1]);
};
const productManifestHandles = parseSetValues(prerenderManifest, 'PRERENDERED_PRODUCT_HANDLES');
const routeManifestPaths = new Set(parseSetValues(autoRoutes, 'PRERENDERED_ROUTES'));
const approvedPaths = Array.isArray(approvedInventory.paths) ? approvedInventory.paths : [];
const approvedProductHandles = approvedPaths
  .filter((routePath) => routePath.startsWith('/product/'))
  .map((routePath) => routePath.slice('/product/'.length));
const productManifestSet = new Set(productManifestHandles);
const approvedProductSet = new Set(approvedProductHandles);
for (const hiddenHandle of [
  'luxemia-tailoring-saree-finishing-add-ons',
  'custom-order-balance-payment',
]) {
  if (productManifestHandles.includes(hiddenHandle)) {
    failures.push(`Hidden billing handle must not appear in the product prerender manifest: ${hiddenHandle}`);
  }
  if (approvedProductHandles.includes(hiddenHandle)) {
    failures.push(`Hidden billing handle must not appear in the approved sitemap inventory: ${hiddenHandle}`);
  }
}
if (
  approvedInventory.urlCount !== approvedPaths.length
  || new Set(approvedPaths).size !== approvedPaths.length
  || productManifestSet.size !== productManifestHandles.length
  || approvedProductSet.size !== approvedProductHandles.length
) {
  failures.push('Approved sitemap and committed product-prerender inventories must declare exact, duplicate-free counts.');
}
const unprerenderedApprovedProducts = approvedProductHandles.filter((handle) => !productManifestSet.has(handle));
if (unprerenderedApprovedProducts.length > 0) {
  failures.push(
    `Approved sitemap/IndexNow products have no committed prerender: ${unprerenderedApprovedProducts.join(', ')}.`,
  );
}
for (const routePath of approvedPaths.filter((value) => !value.startsWith('/product/'))) {
  if (!routeManifestPaths.has(routePath)) failures.push(`Approved non-product sitemap route is absent from the prerender manifest: ${routePath}`);
}
if (!approvedInventory.source?.includes(`${approvedProductHandles.length} live, orderable products`)) {
  failures.push('Approved sitemap provenance does not state its exact gated product count.');
}

for (const [needle, label] of [
  ['getSitemapProductEvidenceFailures', 'Shopify product-evidence gate'],
  ["product?.availableForSale !== true", 'product availability gate'],
  ['availableVariants.length === 0', 'available-variant gate'],
  ['isPositiveUsdMoney', 'positive USD price gate'],
  ['product?.variants?.pageInfo?.hasNextPage', 'complete-variant-set gate'],
  ['duplicatePrimaryImages', 'primary-image collision gate'],
  ['RETIRED_PRODUCT_HANDLES', 'retired-product exclusion gate'],
  ['HIDDEN_BILLING_PRODUCT_HANDLES', 'hidden billing-product exclusion gate'],
  ['unapprovedEligibleProducts', 'eligible-product omission gate'],
  ['validatePrerenderedRoute', 'built canonical/indexability gate'],
  ['hasSubstantiveCopy', 'built substantive-copy gate'],
  ['hasPurchasableOffer', 'built orderability gate'],
  ["const names = ['products', 'collections', 'guides', 'pages', 'images'];", 'five-file sitemap index'],
  ['lastmodByName', 'scoped meaningful lastmod aggregation'],
]) requireText(sitemapGenerator, needle, label);

for (const agent of ['*', 'Googlebot', 'Bingbot', 'OAI-SearchBot', 'PerplexityBot']) {
  requireText(robots, `User-agent: ${agent}`, `${agent} robots group`);
}
for (const privatePath of ['/admin', '/account', '/auth', '/wishlist', '/cart', '/checkout', '/api/', '/order-confirmation', '/_prerender/']) {
  requireText(robots, `Disallow: ${privatePath}`, `private robots exclusion ${privatePath}`);
}

for (const [source, checks] of [
  [indexNowBuilder, ['semanticPayload', "const SITEMAPS = ['products', 'collections', 'guides', 'pages'];", 'retiredCount', 'redirectChangedCount']],
  [indexNowNotifier, ["INDEXNOW_POST_DEPLOY !== '1'", "['initial-baseline', 'ready-after-deploy']", 'IndexNow is a discovery notification, not an indexing guarantee']],
  [indexNowWorkflow, ['deployment_status:', "state == 'success'", 'INDEXNOW_POST_DEPLOY:']],
]) {
  for (const check of checks) requireText(source, check, `IndexNow staged-delivery guard ${check}`);
}

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

async function validateCanonicalHostAndFeedAliases() {
  const middlewareBundle = esbuild.buildSync({
    entryPoints: [middlewarePath],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    write: false,
    logLevel: 'silent',
  }).outputFiles[0].text;
  const middlewareModule = { exports: {} };
  new Function('module', 'exports', 'require', middlewareBundle)(
    middlewareModule,
    middlewareModule.exports,
    require,
  );
  const builtMiddleware = middlewareModule.exports;
  const configuredMatchers = new Set(builtMiddleware.config?.matcher || []);

  for (const routePath of machineReadablePaths) {
    if (!configuredMatchers.has(routePath)) {
      failures.push(`Machine-readable route bypasses canonical-host middleware: ${routePath}`);
      continue;
    }
    const response = await builtMiddleware.default(
      new Request(`https://www.luxemia.shop${routePath}`),
    );
    const expectedLocation = `https://luxemia.shop${routePath}`;
    if (response.status !== 301 || response.headers.get('location') !== expectedLocation) {
      failures.push(
        `www machine-readable route must 301 directly to ${expectedLocation}: ${routePath} `
        + `(received ${response.status} ${response.headers.get('location') || '(no location)'})`,
      );
    }
  }

  for (const [source, destination] of [
    ['http://luxemia.shop/lehengas?color=red', 'https://luxemia.shop/lehengas?color=red'],
    ['http://www.luxemia.shop/sarees', 'https://luxemia.shop/sarees'],
    ['https://www.luxemia.shop/shipping/canada', 'https://luxemia.shop/shipping/canada'],
  ]) {
    const response = await builtMiddleware.default(new Request(source));
    if (response.status !== 301 || response.headers.get('location') !== destination) {
      failures.push(`Canonical host redirect must be one 301 hop from ${source} to ${destination}.`);
    }
  }

  const vercelConfig = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const spaFallback = (vercelConfig.rewrites || []).find((entry) => entry.destination === '/index.html');
  if (!spaFallback?.source.includes('.*\\..*')) {
    failures.push('The Vercel SPA fallback must exclude every dotted path so unknown file-like URLs cannot become soft 404s.');
  }
  for (const [artifactPath, contentType] of [
    ['/indexnow-manifest.json', 'application/json; charset=utf-8'],
    ['/8e3d7c9415b24a5f9c81e62d1a0374bf.txt', 'text/plain; charset=utf-8'],
  ]) {
    const headerRule = (vercelConfig.headers || []).find((entry) => entry.source === artifactPath);
    const headers = new Map((headerRule?.headers || []).map((entry) => [entry.key.toLowerCase(), entry.value]));
    if (headers.get('content-type') !== contentType || !headers.has('cache-control')) {
      failures.push(`${artifactPath} must have explicit content-type and cache-control headers.`);
    }
  }
  const canonicalFeedUrl = 'https://luxemia.shop/merchant-feed.xml';
  const feedAliases = [
    '/feed.xml',
    '/shopping-feed.xml',
    '/products.xml',
    '/google-shopping.xml',
    '/feed.tsv',
    '/api/merchant-feed',
    '/google-shopping-feed.xml',
  ];
  for (const alias of feedAliases) {
    const redirect = (vercelConfig.redirects || []).find((entry) => entry.source === alias);
    if (!redirect || redirect.statusCode !== 301 || redirect.destination !== canonicalFeedUrl) {
      failures.push(`${alias} must 301 directly to the canonical apex Merchant feed URL`);
    }
    if ((vercelConfig.rewrites || []).some((entry) => entry.source === alias)) {
      failures.push(`${alias} must not remain a duplicate 200 rewrite of the Merchant feed`);
    }
  }

  const originalFetch = global.fetch;
  try {
    global.fetch = async (input) => {
      const requestUrl = String(input instanceof Request ? input.url : input);
      if (requestUrl.endsWith('/_prerender/lehengas.html')) {
        return new Response('<!doctype html><html><head><title>Lehengas</title></head><body><h1>Lehengas</h1></body></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
      if (requestUrl.endsWith('/_prerender/404.html')) {
        return new Response('<!doctype html><html><head><meta name="robots" content="noindex,nofollow"><title>Not Found</title></head><body><h1>Not Found</h1></body></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
      if (!requestUrl.startsWith('https://lovable-project-zlh0w.myshopify.com/')) {
        throw new Error(`Unexpected validator fetch: ${requestUrl}`);
      }
      return new Response(JSON.stringify({
        data: {
          product: {
            handle: 'validator-new-live-product',
            title: 'Validator Live Product',
            priceRange: { minVariantPrice: { amount: '999.99', currencyCode: 'USD' } },
            images: { edges: [] },
            variants: { edges: [] },
            options: [],
          },
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const pendingResponse = await builtMiddleware.default(
      new Request('https://luxemia.shop/product/validator-new-live-product'),
    );
    const pendingBody = await pendingResponse.text();
    if (
      pendingResponse.status !== 503
      || pendingResponse.headers.get('x-robots-tag') !== 'noindex, nofollow'
      || pendingResponse.headers.get('cache-control') !== 'no-store'
      || !pendingBody.includes('next storefront deployment')
      || /Validator Live Product|999\.99|InStock|OutOfStock|application\/ld\+json/i.test(pendingBody)
    ) {
      failures.push('A live Shopify product absent from the prerender manifest must return a fact-free, noindex, no-store 503 deployment-pending response.');
    }

    const facetResponse = await builtMiddleware.default(
      new Request('https://luxemia.shop/lehengas?color=red&sort_by=price-ascending'),
    );
    if (
      facetResponse.status !== 200
      || facetResponse.headers.get('x-robots-tag') !== 'noindex, follow'
      || facetResponse.headers.get('link') !== '<https://luxemia.shop/lehengas>; rel="canonical"'
    ) {
      failures.push('Uncontrolled facet/sort URLs must return clean-parent canonical and HTTP noindex,follow signals.');
    }

    const goneResponse = await builtMiddleware.default(
      new Request('https://luxemia.shop/blog/jj-valaya-royal-couture-house-of-valaya'),
    );
    if (goneResponse.status !== 410 || goneResponse.headers.get('x-robots-tag') !== 'noindex, nofollow') {
      failures.push('A verified retired editorial URL without an exact replacement must return 410 noindex,nofollow.');
    }

    for (const missingPath of [
      '/validator-definitive-missing-page',
      '/definitely-missing.html',
      '/definitely-missing.php',
      '/definitely-missing.pdf',
      '/folder.with-dot/page',
      '/apiary',
      '/assets-old',
    ]) {
      const missingResponse = await builtMiddleware.default(
        new Request(`https://luxemia.shop${missingPath}`),
      );
      const missingBody = await missingResponse.text();
      if (
        missingResponse.status !== 404
        || missingResponse.headers.get('x-robots-tag') !== 'noindex, nofollow'
        || missingResponse.headers.has('x-middleware-next')
        || missingResponse.headers.has('link')
        || !/<meta\s+name=["']robots["']\s+content=["']noindex,nofollow["']\s*\/?\s*>/i.test(missingBody)
        || /<link\b[^>]*\brel=["']canonical["']/i.test(missingBody)
      ) {
        failures.push(`${missingPath} must return a real 404 with matching noindex,nofollow HTTP and HTML signals and no canonical.`);
      }
    }

    for (const hiddenHandle of [
      'luxemia-tailoring-saree-finishing-add-ons',
      'custom-order-balance-payment',
    ]) {
      const hiddenResponse = await builtMiddleware.default(
        new Request(`https://luxemia.shop/product/${hiddenHandle}`),
      );
      const hiddenBody = await hiddenResponse.text();
      if (
        hiddenResponse.status !== 404
        || hiddenResponse.headers.get('x-robots-tag') !== 'noindex, nofollow'
        || /rel=["']canonical["']|application\/ld\+json|ProductGroup/i.test(hiddenBody)
      ) {
        failures.push(`Internal billing handle must return a schema-free, non-canonical 404: ${hiddenHandle}.`);
      }
    }

    const previewResponse = await builtMiddleware.default(
      new Request('https://validator-preview.vercel.app/robots.txt'),
    );
    if (previewResponse.headers.get('x-robots-tag') !== 'noindex, nofollow') {
      failures.push('Preview-host responses must be protected by HTTP noindex,nofollow.');
    }
  } finally {
    global.fetch = originalFetch;
  }

  const { buildNotificationPlan, collectRedirectInventory } = require('./submit-indexnow.cjs');
  const fixtureSource = 'https://luxemia.shop/validator-new-redirect-source';
  const fixtureRedirects = {
    [fixtureSource]: {
      destination: 'https://luxemia.shop/validator-final-destination',
      statusCode: 301,
      hash: 'fixture-hash',
    },
  };
  const fixturePlan = buildNotificationPlan(
    {},
    fixtureRedirects,
    { entries: {}, redirects: {} },
    'compared',
  );
  if (
    fixturePlan.redirectChangedCount !== 1
    || fixturePlan.redirectRemovedCount !== 0
    || fixturePlan.urls.length !== 1
    || fixturePlan.urls[0] !== fixtureSource
  ) {
    failures.push('IndexNow planning does not notify a newly introduced redirect source.');
  }

  const redirectInventory = collectRedirectInventory();
  for (const match of app.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<Navigate\s+to="([^"]+)"/g)) {
    const source = new URL(match[1], 'https://luxemia.shop').toString();
    const expectedDestination = new URL(match[2], 'https://luxemia.shop').toString();
    const redirect = redirectInventory[source];
    if (!redirect || redirect.statusCode !== 301 || redirect.destination !== expectedDestination) {
      failures.push(`SPA redirect ${match[1]} -> ${match[2]} lacks the same direct server-side 301.`);
    }
  }
  for (const source of [
    'https://luxemia.shop/bestsellers',
    'https://luxemia.shop/nri/uk',
    'https://luxemia.shop/product/green-net-sequins-occasion-lehenga-choli',
    'https://luxemia.shop/collections/earrings',
    'https://luxemia.shop/blog/how-to-measure-yourself-for-a-saree-or-lehenga',
    'https://luxemia.shop/feed.xml',
  ]) {
    if (!redirectInventory[source]) failures.push(`IndexNow redirect inventory is missing ${source}`);
  }
}

async function main() {
  await validateCanonicalHostAndFeedAliases();

  if (failures.length > 0) {
    console.error('Indexation recovery validation failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `Indexation recovery validation passed: ${approvedProductHandles.length} approved product URLs exactly match the committed prerender and sitemap/IndexNow inventories; public query duplicates expose clean canonicals; 410/404 and preview responses fail closed; all SPA redirects have direct server 301s; transient Shopify failures stay out of the 404/cache path; live products outside the deployed prerender fail closed; variant URLs stay crawlable; the first 50 collection products paint immediately; the full catalog refreshes after hydration; the complete crawlable product directory remains available; the human sitemap links only deployment-generated XML; redirect sources enter post-deploy IndexNow planning; and ${machineReadablePaths.length} machine-readable routes plus all feed aliases enforce the apex host.`,
  );
}

main().catch((error) => {
  console.error(`Indexation recovery validation failed: ${error.message}`);
  process.exitCode = 1;
});
