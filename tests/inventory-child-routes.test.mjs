import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const projectRoot = path.resolve(import.meta.dirname, '..');
const read = (relativePath) => readFile(path.join(projectRoot, relativePath), 'utf8');
const require = createRequire(import.meta.url);
const {
  parseJsonLdScripts,
  validateItemListParity,
} = require('../scripts/prerender-validation-helpers.cjs');

const [
  app,
  hook,
  inventoryPage,
  semanticPage,
  categoryListing,
  collectionDecisionSupport,
  customizablePage,
  readyToShipPage,
  shopifyCollectionPage,
  shopifyCollectionHook,
  shopifySource,
  completeTheLook,
  standards,
  prerender,
  routeGenerator,
  routeManifest,
  autoRoutes,
  sitemapGenerator,
  approvedInventorySource,
  llmsFull,
  collectionsPage,
  weddingGuestPage,
  diwaliPage,
  eligibilitySource,
  coverageValidator,
  productPrerenderValidator,
] = await Promise.all([
  read('src/App.tsx'),
  read('src/hooks/useShopifyProducts.ts'),
  read('src/pages/InventoryBackedCollection.tsx'),
  read('src/pages/SemanticCommercePage.tsx'),
  read('src/components/collections/CategoryListing.tsx'),
  read('src/components/collections/CollectionDecisionSupport.tsx'),
  read('src/pages/CustomizableOutfits.tsx'),
  read('src/pages/ReadyToShip.tsx'),
  read('src/pages/ShopifyCollection.tsx'),
  read('src/hooks/useShopifyCollection.ts'),
  read('src/lib/shopify.ts'),
  read('src/components/product/CompleteTheLook.tsx'),
  read('src/config/collectionStandards.ts'),
  read('scripts/prerender.js'),
  read('scripts/generate-routes.cjs'),
  read('scripts/routes.json'),
  read('src/lib/autoRoutes.ts'),
  read('scripts/generate-sitemap.cjs'),
  read('scripts/approved-sitemap-inventory.json'),
  read('public/llms-full.txt'),
  read('src/pages/Collections.tsx'),
  read('src/pages/WeddingGuestOutfits.tsx'),
  read('src/pages/DiwaliOutfits.tsx'),
  read('src/lib/intentCollectionEligibility.ts'),
  read('scripts/verify-prerender-coverage.cjs'),
  read('scripts/validate-product-prerender-integrity.cjs'),
]);

const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'luxemia-intent-routes-'));
await build({
  entryPoints: {
    eligibility: path.join(projectRoot, 'src/lib/intentCollectionEligibility.ts'),
    standards: path.join(projectRoot, 'src/config/collectionStandards.ts'),
    shopify: path.join(projectRoot, 'src/lib/shopify.ts'),
    shopifyCollectionHook: path.join(projectRoot, 'src/hooks/useShopifyCollection.ts'),
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: temporaryDirectory,
  logLevel: 'silent',
  define: {
    'import.meta.env': '{}',
  },
  plugins: [{
    name: 'stub-catalog-error-toast',
    setup(buildContext) {
      buildContext.onResolve({ filter: /^sonner$/ }, () => ({
        namespace: 'catalog-error-test',
        path: 'sonner',
      }));
      buildContext.onLoad({ filter: /.*/, namespace: 'catalog-error-test' }, () => ({
        contents: 'export const toast = { error() {} };',
        loader: 'js',
      }));
    },
  }],
});
const { isEligibleForDurableIntent } = await import(pathToFileURL(path.join(temporaryDirectory, 'eligibility.js')).href);
const { getCollectionStandard } = await import(pathToFileURL(path.join(temporaryDirectory, 'standards.js')).href);
const { fetchAllProducts, fetchCollectionByHandle, fetchProducts } = await import(pathToFileURL(path.join(temporaryDirectory, 'shopify.js')).href);
const { selectShopifyCollectionStateForHandle } = await import(pathToFileURL(path.join(temporaryDirectory, 'shopifyCollectionHook.js')).href);

test.after(async () => {
  await rm(temporaryDirectory, { recursive: true, force: true });
});

const approvedInventory = JSON.parse(approvedInventorySource);
const generatedRoutePaths = new Set(JSON.parse(routeManifest));
const autoRoutePaths = new Set(
  [...autoRoutes.matchAll(/^\s*['"]([^'"]+)['"],?$/gm)].map((match) => match[1]),
);

const routes = [
  ['/collections/wedding-guest-lehengas', 'occasion:wedding-guest-lehengas'],
  ['/collections/wedding-guest-kurta-sets', 'occasion:wedding-guest-kurta-sets'],
  ['/collections/diwali-womenswear', 'occasion:diwali-womenswear'],
  ['/collections/diwali-menswear', 'occasion:diwali-menswear'],
];

test('durable wedding-guest and Diwali child intents have one canonical source-to-discovery path', () => {
  for (const [routePath, category] of routes) {
    const slug = routePath.slice('/collections/'.length);
    assert.match(app, new RegExp(`<Route path="${routePath}"`));
    assert.match(inventoryPage, new RegExp(`'${slug}': withCollectionStandard\\(\\{[\\s\\S]*?category: '${category}'`));
    assert.match(standards, new RegExp(`'${routePath}': \\{[^\\n]*category: '${category}'`));
    assert.match(prerender, new RegExp(`path: '${routePath}',[\\s\\S]{0,160}category: '${category}'`));
    assert.ok(routeGenerator.includes(`'${routePath}'`));
    assert.ok(generatedRoutePaths.has(routePath));
    assert.ok(autoRoutePaths.has(routePath));
    assert.ok(sitemapGenerator.includes(`loc: '${routePath}'`));
    assert.ok(approvedInventory.paths.includes(routePath));
    assert.ok(llmsFull.includes(`https://luxemia.shop${routePath}`));

    const standard = getCollectionStandard(routePath);
    assert.ok(standard, `${routePath} has a shared collection standard`);
    const routeBlock = prerender.slice(prerender.indexOf(`    path: '${routePath}',`), prerender.indexOf('  },', prerender.indexOf(`    path: '${routePath}',`)) + 4);
    assert.match(routeBlock, /content: '',/, `${routePath} has no duplicate prerender copy`);
    const wordCount = standard.directAnswer.trim().split(/\s+/).filter(Boolean).length;
    assert.ok(wordCount >= 40 && wordCount <= 70, `${routePath} has ${wordCount} direct-answer words`);
  }
  assert.match(inventoryPage, /answer: standard\.directAnswer/);
  assert.match(prerender, /data-collection-direct-answer/);
});

test('client and prerender share strict durable-intent eligibility with representative fixtures', () => {
  assert.match(hook, /isEligibleForDurableIntent\(product\.node, occasion\)/);
  assert.match(prerender, /loadTsModule\('src\/lib\/intentCollectionEligibility\.ts'\)/);
  assert.match(prerender, /isEligibleForDurableIntent\(product, occasion\)/);
  assert.match(eligibilitySource, /occasionMetafield/);
  assert.match(prerender, /occasionMetafield: metafield/);
  assert.match(prerender, /genderMetafield: metafield/);

  const product = ({ title, productType, tags = [] }) => ({
    title,
    productType,
    tags,
    availableForSale: true,
    variants: { edges: [{ node: { title: 'Default', availableForSale: true, selectedOptions: [] } }] },
  });
  const expect = (intent, fixture, eligible) => assert.equal(
    isEligibleForDurableIntent(product(fixture), intent),
    eligible,
    `${intent}: ${fixture.title}`,
  );

  expect('wedding-guest-lehengas', { title: 'Blue Lehenga for Wedding-Guests', productType: 'Lehenga Choli' }, true);
  expect('wedding-guest-lehengas', { title: 'Bridal Lehenga for Sangeet', productType: 'Bridal Lehenga', tags: ['wedding guest'] }, false);
  expect('wedding-guest-lehengas', { title: 'Reception Lehenga', productType: 'Lehenga Choli', tags: ['reception'] }, false);
  expect('wedding-guest-kurta-sets', { title: 'Kurta Dhoti Set for Wedding Guests', productType: "Men's Kurta" }, true);
  expect('wedding-guest-kurta-sets', { title: 'Kurta with Nehru Jacket', productType: "Men's Kurta", tags: ['wedding_guest'] }, true);
  expect('wedding-guest-kurta-sets', { title: "Men's Kurta for Reception", productType: "Men's Kurta", tags: ['wedding guest'] }, false);
  expect('diwali-womenswear', { title: 'Mirror Work Three-Piece Set', productType: 'Three-Piece Set', tags: ['Diwali'] }, true);
  expect('diwali-womenswear', { title: 'Festive Skirt Set', productType: 'Skirt Set', tags: ['festival'] }, true);
  expect('diwali-womenswear', { title: 'Halter Blouse', productType: 'Saree Blouse', tags: ['Diwali'] }, false);
  expect('diwali-womenswear', { title: 'Kundan Necklace', productType: 'Jewelry Set', tags: ['festival'] }, false);
  expect('diwali-menswear', { title: "Men's Festive Kurta", productType: "Men's Kurta", tags: ['Diwali'] }, true);
  expect('diwali-menswear', { title: "Men's Festive Turban", productType: 'Turban', tags: ['Diwali', 'men'] }, false);

  assert.match(inventoryPage, /noIndexFollow=\{!isLoading && !error && sortedProducts\.length === 0\}/);
  assert.match(prerender, /generateItemListJsonLd\(collectionProducts\.slice\(0, 30\), route\.h1, route\.path\)/);
  assert.match(hook, /function getInitialData[\s\S]*?prerenderedFeaturedRank: index \+ 1/);
  assert.match(prerender, /generateFaqPageJsonLd\(collectionStandard\.faqs\)/);
  assert.match(prerender, /route\.category\s*\? 'collection'/);
  assert.match(prerender, /<meta property="og:type" content="\$\{openGraphType\}"/);
  assert.match(coverageValidator, /parseJsonLdScripts\(html, route, schemaFailures\)/);
  assert.match(coverageValidator, /validateItemListParity\(itemList, payloadHandles\)/);
  assert.doesNotMatch(coverageValidator, /<script type="application\\\/ld\\\+json">/);
  assert.match(productPrerenderValidator, /validateItemListParity\(itemLists\[0\], payloadHandles\)/);
  assert.match(productPrerenderValidator, /parseJsonLdScripts\(html, route, schemaFailures\)/);
  assert.doesNotMatch(productPrerenderValidator, /sameSet\(sortedUnique\(itemHandles\), sortedUnique\(payloadHandles\)\)/);
});

test('prerender validation accepts attributed schemas and the intentional 30-product ItemList cap', () => {
  const payloadHandles = Array.from({ length: 50 }, (_, index) => `product-${index + 1}`);
  const itemList = {
    '@type': 'ItemList',
    numberOfItems: 30,
    itemListElement: payloadHandles.slice(0, 30).map((handle, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://luxemia.shop/product/${handle}`,
    })),
  };
  const html = [
    '<script data-prerender-schema type="application/ld+json">',
    JSON.stringify(itemList),
    '</script>',
    '<script nonce="fixture" TYPE="application/ld+json" data-prerender-schema>',
    JSON.stringify({ '@type': 'CollectionPage' }),
    '</script>',
  ].join('');
  const failures = [];
  const parsed = parseJsonLdScripts(html, '/collections/fixture', failures);

  assert.deepEqual(failures, []);
  assert.equal(parsed.length, 2);
  assert.deepEqual(parsed[0].schema, itemList);
  assert.equal(validateItemListParity(parsed[0].schema, payloadHandles), null);

  const shortPayload = payloadHandles.slice(0, 25);
  const nestedUrlItemList = {
    '@type': 'ItemList',
    numberOfItems: 25,
    itemListElement: shortPayload.map((handle, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: { url: `https://luxemia.shop/product/${handle}` },
    })),
  };
  assert.equal(validateItemListParity(nestedUrlItemList, shortPayload), null);

  const wrongLastProduct = structuredClone(itemList);
  wrongLastProduct.itemListElement[29].url = 'https://luxemia.shop/product/wrong-product';
  assert.match(validateItemListParity(wrongLastProduct, payloadHandles), /do not match/);

  const wrongCount = { ...itemList, numberOfItems: 50 };
  assert.match(validateItemListParity(wrongCount, payloadHandles), /do not match/);

  const wrongOrigin = structuredClone(itemList);
  wrongOrigin.itemListElement[0].url = 'https://evil.example/product/product-1';
  assert.match(validateItemListParity(wrongOrigin, payloadHandles), /do not match/);

  const wrongPosition = structuredClone(itemList);
  wrongPosition.itemListElement[0].position = 2;
  assert.match(validateItemListParity(wrongPosition, payloadHandles), /do not match/);
});

test('catalog fetch failures stay indexable and show a retry state without claiming zero inventory', () => {
  assert.match(inventoryPage, /const \{ products, isLoading, error \} = useShopifyProducts\(config\.category\)/);
  assert.match(inventoryPage, /collection=\{!isLoading && !error/);
  assert.match(inventoryPage, /: error\s*\? 'Current inventory is temporarily unavailable'/);
  assert.match(inventoryPage, /\) : error \? \(\s*<CatalogLoadError/);
  assert.match(inventoryPage, /<a href=\{retryHref\}>Try again<\/a>/);
  assert.match(inventoryPage, /No verified products currently available/);

  for (const [label, source, category, retryHref] of [
    ['wedding-guest parent', weddingGuestPage, 'occasion:wedding-guest', '/collections/wedding-guest-outfits'],
    ['Diwali parent', diwaliPage, 'occasion:diwali', '/collections/diwali-outfits'],
  ]) {
    assert.match(source, new RegExp(`const \\{ products, isLoading, error \\} = useShopifyProducts\\('${category}'\\)`));
    assert.match(source, /collection=\{!isLoading && !error/, `${label} omits catalog schema unless the fetch succeeds`);
    assert.match(source, /noIndexFollow=\{!isLoading && !error && sortedProducts\.length === 0\}/);
    assert.match(source, /: error\s*\? 'Current inventory is temporarily unavailable'/, `${label} does not report a zero count on error`);
    assert.match(source, /\{!error \? \(\s*<DropdownMenu>/, `${label} suppresses sorting on error`);
    assert.match(source, new RegExp(`\\) : error \\? \\(\\s*<CatalogLoadError retryHref="${retryHref}" \\/>`));
    assert.match(source, /\{hasMore && !isLoading && !error \? \(/, `${label} suppresses pagination on error`);
    assert.match(source, /\{!error \? <CollectionDecisionSupport/, `${label} suppresses product decision support on error`);
  }

  assert.match(semanticPage, /const \{ products, isLoading, error \} = useShopifyProducts\(standard\.category\)/);
  assert.match(semanticPage, /evidenceBoundFulfillmentPage && !isLoading && !error && products\.length === 0/);
  assert.match(semanticPage, /collection=\{collectionStandard && !isLoading && !error/);
  assert.match(semanticPage, /\? error\s*\? <CatalogLoadError retryHref=\{pathname\} \/>/);
  assert.match(semanticPage, /href=\{retryHref\}[\s\S]{0,80}>\s*Try again/);

  assert.match(categoryListing, /const \{ products, isLoading, error \} = useShopifyPaginatedProducts\(config\.slug\)/);
  assert.match(categoryListing, /collection=\{!isLoading && !error/);
  assert.match(categoryListing, /: error \? \(\s*<CatalogLoadError retryHref=/);
  assert.match(categoryListing, /Current products are temporarily unavailable/);
  assert.match(categoryListing, /\{!error \? <CollectionDecisionSupport/);

  assert.match(shopifyCollectionPage, /const noIndexFollow = !isLoading && !error && purchasableProducts\.length === 0/);
  assert.match(shopifyCollectionPage, /collection=\{!isLoading && !error/);
  assert.match(shopifyCollectionPage, /!isLoading && !error && purchasableProducts\.length > 0/);
  assert.match(shopifyCollectionPage, /: error \? \(\s*<CatalogLoadError retryHref=\{collectionPath\}/);
  assert.match(shopifyCollectionPage, /\{!error \? <CollectionDecisionSupport/);

  assert.match(readyToShipPage, /const \{ products, isLoading, error \} = useShopifyProducts\(\)/);
  assert.match(readyToShipPage, /noIndex=\{!isLoading && !error && sortedProducts\.length === 0\}/);
  assert.match(readyToShipPage, /collection=\{!isLoading && !error && sortedProducts\.length > 0/);
  assert.match(readyToShipPage, /: error \? \(\s*<CatalogLoadError \/>/);
  assert.match(readyToShipPage, /\{!error \? <CollectionDecisionSupport/);

  assert.match(customizablePage, /collection=\{!isLoading && !error/);
  assert.match(customizablePage, /: error\s*\? 'Current customizable inventory is temporarily unavailable'/);
  assert.match(customizablePage, /\{error \? \(\s*<CatalogLoadError \/>/);
  assert.match(customizablePage, /\{!error \? <CollectionDecisionSupport/);

  assert.match(collectionDecisionSupport, /const \{ products, isLoading, error \} = useShopifyProducts\(category\)/);
  assert.match(collectionDecisionSupport, /\{error \? \(\s*<div[^>]+role="alert"/);
  assert.match(collectionDecisionSupport, /retryHref=\{retryHref\}/);

  assert.match(shopifySource, /throw new Error\('Shopify Storefront API request failed with HTTP 402/);
  assert.match(shopifySource, /Shopify product catalog returned an invalid response/);
  assert.match(shopifySource, /if \(collection === null\) return null/);
  assert.match(shopifyCollectionHook, /requestedHandle: handle/);
  assert.match(shopifyCollectionHook, /catch \(loadError\)[\s\S]*?error: true/);
  assert.match(shopifyCollectionHook, /finally \{[\s\S]*?isLoading: false/);
  assert.match(shopifyCollectionHook, /return selectShopifyCollectionStateForHandle\(handle, state, initialProducts\)/);
  assert.match(completeTheLook, /catch \(error\)[\s\S]*?Unable to load optional related products/);
});

test('collection route-param changes never expose the previous handle on the first render', () => {
  const collectionAProduct = { node: { id: 'product-a' } };
  const collectionBProduct = { node: { id: 'product-b' } };
  const collectionAState = {
    requestedHandle: 'collection-a',
    collection: { handle: 'collection-a' },
    products: [collectionAProduct],
    isLoading: false,
    error: true,
  };

  const firstCollectionBRender = selectShopifyCollectionStateForHandle(
    'collection-b',
    collectionAState,
    null,
  );
  assert.deepEqual(firstCollectionBRender, {
    collection: null,
    products: [],
    isLoading: true,
    error: false,
  });

  const firstPrerenderedCollectionBRender = selectShopifyCollectionStateForHandle(
    'collection-b',
    collectionAState,
    [collectionBProduct],
  );
  assert.equal(firstPrerenderedCollectionBRender.collection, null);
  assert.deepEqual(firstPrerenderedCollectionBRender.products, [collectionBProduct]);
  assert.equal(firstPrerenderedCollectionBRender.isLoading, false);
  assert.equal(firstPrerenderedCollectionBRender.error, false);
  assert.doesNotMatch(JSON.stringify(firstPrerenderedCollectionBRender), /product-a|collection-a/);
});

test('successful Shopify list and collection empties remain confirmed data states', async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          products: {
            edges: [],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      }),
    });
    assert.deepEqual(await fetchAllProducts(), []);
    assert.deepEqual(await fetchProducts(12), []);

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ data: { collection: null } }),
    });
    assert.equal(await fetchCollectionByHandle('confirmed-missing-collection'), null);

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          collection: {
            id: 'gid://shopify/Collection/1',
            title: 'Empty collection',
            handle: 'empty-collection',
            description: '',
            descriptionHtml: '',
            image: null,
            products: { edges: [] },
          },
        },
      }),
    });
    const emptyCollection = await fetchCollectionByHandle('empty-collection');
    assert.deepEqual(emptyCollection?.products, []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Shopify list and collection fetches propagate transient, billing, and abort failures', async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async () => {
      throw new TypeError('catalog network unavailable');
    };
    await assert.rejects(fetchAllProducts(), /catalog network unavailable/);
    await assert.rejects(fetchProducts(12), /catalog network unavailable/);
    await assert.rejects(fetchCollectionByHandle('network-failure'), /catalog network unavailable/);

    globalThis.fetch = async () => ({
      ok: false,
      status: 402,
      json: async () => ({}),
    });
    await assert.rejects(fetchAllProducts(), /HTTP 402 \(payment required\)/);

    let pageRequestCount = 0;
    globalThis.fetch = async () => {
      pageRequestCount += 1;
      if (pageRequestCount === 1) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              products: {
                edges: [],
                pageInfo: { hasNextPage: true, endCursor: 'next-page' },
              },
            },
          }),
        };
      }
      throw new Error('second catalog page unavailable');
    };
    await assert.rejects(fetchAllProducts(), /second catalog page unavailable/);
    assert.equal(pageRequestCount, 2);

    const abortError = new Error('catalog request aborted');
    abortError.name = 'AbortError';
    globalThis.fetch = async () => {
      throw abortError;
    };
    await assert.rejects(
      fetchCollectionByHandle('aborted-collection', new AbortController().signal),
      (error) => error?.name === 'AbortError',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('large collection grids page rendered cards without truncating totals or schema inputs', () => {
  for (const [label, source] of [
    ['inventory-backed collections', inventoryPage],
    ['wedding-guest parent', weddingGuestPage],
    ['Diwali parent', diwaliPage],
  ]) {
    assert.match(source, /const PRODUCTS_PER_PAGE = 24;/, `${label} has a bounded initial render`);
    assert.match(source, /const SCHEMA_PRODUCT_LIMIT = 30;/, `${label} keeps an independent schema cap`);
    assert.match(source, /const \[visibleCount, setVisibleCount\] = useState\(PRODUCTS_PER_PAGE\);/);
    assert.match(source, /const visibleProducts = sortedProducts\.slice\(0, visibleCount\);/);
    assert.match(source, /visibleProducts\.map\(\(product, index\) =>/);
    assert.doesNotMatch(source, /\{sortedProducts\.map\(\(product, index\) =>/);
    assert.match(source, /setVisibleCount\(\(currentCount\) => Math\.min\(/, `${label} loads another bounded batch`);
    assert.match(source, /Load more \(\{sortedProducts\.length - visibleProducts\.length\} remaining\)/);
    assert.match(source, /\$\{visibleProducts\.length\} of \$\{sortedProducts\.length\}/, `${label} reports the full result total`);
    assert.match(source, /handleSortChange[\s\S]{0,180}setVisibleCount\(PRODUCTS_PER_PAGE\);/, `${label} resets pagination after sorting`);
    assert.doesNotMatch(source, /<Link\b[^>]*>\s*<Button\b/, `${label} has no nested link and button controls`);
  }

  assert.match(inventoryPage, /sortedProducts\.slice\(0, SCHEMA_PRODUCT_LIMIT\)\.map/);
  assert.match(inventoryPage, /<InventoryBackedCollectionContent key=\{landing\} landing=\{landing\} \/>/, 'inventory routes reset pagination when the route changes');
  assert.match(weddingGuestPage, /toCollectionSchemaItems\(sortedProducts, SCHEMA_PRODUCT_LIMIT\)/);
  assert.match(diwaliPage, /toCollectionSchemaItems\(sortedProducts, SCHEMA_PRODUCT_LIMIT\)/);
});

test('parent pages link to supported children while thin unsupported children stay unpublished', () => {
  for (const routePath of ['/collections/wedding-guest-lehengas', '/collections/wedding-guest-kurta-sets']) {
    assert.ok(collectionsPage.includes(routePath));
    assert.ok(weddingGuestPage.includes(routePath));
  }
  for (const routePath of ['/collections/diwali-womenswear', '/collections/diwali-menswear']) {
    assert.ok(collectionsPage.includes(routePath));
    assert.ok(diwaliPage.includes(routePath));
  }
  for (const thinRoute of ['/collections/navratri-menswear', '/collections/indo-western-menswear']) {
    for (const source of [app, prerender, routeGenerator, sitemapGenerator, llmsFull]) {
      assert.ok(!source.includes(thinRoute), `${thinRoute} must not be published without durable inventory`);
    }
  }
});
