#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const SITEMAP_PATH = path.join(DIST_DIR, 'sitemap-collections.xml');
const SITE_URL = 'https://luxemia.shop';
const SOURCE_ONLY = process.argv.includes('--source-only');

function fail(message) {
  console.error(`[collection-standard] ${message}`);
  process.exitCode = 1;
}

function readSource(relativePath) {
  return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf8');
}

function loadTsModule(relativePath) {
  const result = esbuild.buildSync({
    entryPoints: [path.join(PROJECT_ROOT, relativePath)],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    write: false,
    logLevel: 'silent',
  });
  const loadedModule = { exports: {} };
  const execute = new Function('module', 'exports', 'require', result.outputFiles[0].text);
  execute(loadedModule, loadedModule.exports, require);
  return loadedModule.exports;
}

function validateSourceInvariants() {
  const productHook = readSource('src/hooks/useShopifyProducts.ts');
  const categoryFilter = productHook.match(
    /const filterByCategory\s*=\s*\([\s\S]*?\)\s*:\s*ShopifyProduct\[\]\s*=>\s*\{([\s\S]*?)\n\};\n\n\/\/ Enrich products/,
  )?.[1] || '';
  const readyBranch = categoryFilter.match(
    /if\s*\(category\s*===\s*['"]ready-to-ship['"]\)\s*\{([\s\S]*?)\n\s*\}\n\n\s*if\s*\(category\s*===\s*['"]made-to-order['"]\)/,
  )?.[1] || '';
  if (!readyBranch) {
    fail('source: filterByCategory is missing an explicit ready-to-ship branch before the generic fallback.');
  } else {
    if (!/product\.node\.availableForSale\s*!==\s*true/.test(readyBranch)) {
      fail('source: ready-to-ship filtering does not require positive product availability.');
    }
    if (!/if\s*\(\s*isMadeToOrderProduct\(\s*product\.node\.handle\s*,\s*product\.node\.tags\s*\)\s*\)\s*return false/.test(readyBranch)) {
      fail('source: ready-to-ship filtering does not reject explicitly made-to-order products.');
    }
    if (!/hasExplicitReadyToShipEvidence\(product\.node\)/.test(readyBranch)) {
      fail('source: ready-to-ship filtering does not require positive catalog evidence.');
    }
    if (!/variants\.length\s*>\s*0\s*&&\s*variants\.some\([\s\S]*?availableForSale\s*===\s*true/.test(readyBranch)) {
      fail('source: ready-to-ship filtering does not require a positively available variant.');
    }
  }

  const madeToOrderBranch = categoryFilter.match(
    /if\s*\(category\s*===\s*['"]made-to-order['"]\)\s*\{([\s\S]*?)\n\s*\}\n\n\s*if\s*\(category\s*===\s*['"]customizable['"]\)/,
  )?.[1] || '';
  if (
    !/isMadeToOrderProduct\(product\.node\.handle,\s*product\.node\.tags\)/.test(madeToOrderBranch)
    || !/isProductExplicitlyOrderable\(product\.node\)/.test(madeToOrderBranch)
  ) {
    fail('source: made-to-order filtering must require an explicit catalog label and an orderable product variant.');
  }

  const prerender = readSource('scripts/prerender.js');
  const prerenderOrderability = /function isExplicitlyOrderable\(product\)[\s\S]*?product\?\.availableForSale === true[\s\S]*?variants\.length > 0[\s\S]*?variants\.some\(\(variant\) => variant\?\.node\?\.availableForSale === true\)/.test(prerender);
  const prerenderReadyBranch = prerender.match(
    /if\s*\(category\s*===\s*['"]ready-to-ship['"]\)\s*\{([\s\S]*?)\n\s*\}\n\s*if\s*\(category\s*===\s*['"]made-to-order['"]\)/,
  )?.[1] || '';
  if (
    !prerenderOrderability
    || !/\.filter\(isExplicitlyOrderable\)/.test(prerenderReadyBranch)
    || !/!isMadeToOrderProduct\(product\)/.test(prerenderReadyBranch)
    || !/hasExplicitReadyToShipEvidence\(product\)/.test(prerenderReadyBranch)
  ) {
    fail('source: prerender ready-to-ship filtering is not aligned with the positive-evidence and availability rules.');
  }

  const prerenderMadeToOrderBranch = prerender.match(
    /if\s*\(category\s*===\s*['"]made-to-order['"]\)\s*\{([\s\S]*?)\n\s*\}\n\s*if\s*\(category\s*===\s*['"]customizable['"]\)/,
  )?.[1] || '';
  if (
    !/hasExplicitMadeToOrderEvidence\(product\)/.test(prerenderMadeToOrderBranch)
    || !prerenderOrderability
    || !/\.filter\(isExplicitlyOrderable\)/.test(prerenderMadeToOrderBranch)
  ) {
    fail('source: prerender made-to-order filtering must mirror explicit catalog evidence and product/variant availability.');
  }

  const readyPage = readSource('src/pages/ReadyToShip.tsx');
  if (!/hasExplicitReadyToShipEvidence\(product\.node\)/.test(readyPage)) {
    fail('source: /ready-to-ship does not require positive catalog evidence.');
  }
  if (!/noIndex=\{!isLoading\s*&&\s*!error\s*&&\s*sortedProducts\.length\s*===\s*0\}/.test(readyPage)) {
    fail('source: empty /ready-to-ship results do not become noindex.');
  }

  const semanticPage = readSource('src/pages/SemanticCommercePage.tsx');
  if (
    !/standard\.category\s*===\s*['"]ready-to-ship['"]/.test(semanticPage)
    || !/standard\.category\s*===\s*['"]made-to-order['"]/.test(semanticPage)
    || !/evidenceBoundFulfillmentPage\s*&&\s*!isLoading\s*&&\s*!error\s*&&\s*products\.length\s*===\s*0/.test(semanticPage)
  ) {
    fail('source: empty evidence-bound fulfillment results do not become noindex.');
  }

  let collectionStandards;
  try {
    collectionStandards = loadTsModule('src/config/collectionStandards.ts');
  } catch (error) {
    fail(`source: unable to load collection standards: ${error.message}`);
  }

  if (collectionStandards) {
    const { getCollectionStandard, INDEXABLE_COLLECTION_PATHS } = collectionStandards;
    if (getCollectionStandard?.('/festive-wear')?.category !== 'occasion:festive') {
      fail('source: /festive-wear must use the intent-scoped occasion:festive catalog filter.');
    }
    if (getCollectionStandard?.('/wedding-events')?.category !== 'occasion:wedding-event') {
      fail('source: /wedding-events must use the intent-scoped occasion:wedding-event catalog filter.');
    }
    if (getCollectionStandard?.('/shop-by-fulfillment/made-to-order')?.category !== 'made-to-order') {
      fail('source: /shop-by-fulfillment/made-to-order must use its exact made-to-order evidence filter.');
    }
    const readyStandard = getCollectionStandard?.('/ready-to-ship');
    if (!/explicitly identifies ready-to-ship status/i.test(readyStandard?.directAnswer || '')
      || /unless .*made to order|every purchasable/i.test(readyStandard?.directAnswer || '')) {
      fail('source: /ready-to-ship direct answer must require positive evidence and must not infer status by exclusion.');
    }
    if (!Array.isArray(INDEXABLE_COLLECTION_PATHS) || INDEXABLE_COLLECTION_PATHS.length === 0) {
      fail('source: collection standards export no indexable collection inventory.');
    } else if (new Set(INDEXABLE_COLLECTION_PATHS).size !== INDEXABLE_COLLECTION_PATHS.length) {
      fail('source: collection standards contain duplicate indexable routes.');
    }

    const sitemapSource = readSource('scripts/generate-sitemap.cjs');
    const staticPagesBlock = sitemapSource.match(/const staticPages\s*=\s*\[([\s\S]*?)\n\];/)?.[1] || '';
    const staticPaths = [...staticPagesBlock.matchAll(/\{\s*loc:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
    const commercialRoots = new Set([
      '/lehengas', '/sarees', '/suits', '/menswear', '/jewelry', '/indowestern',
      '/new-arrivals', '/ready-to-ship', '/festive-wear',
      '/indian-wedding-guest-outfits', '/wedding-events', '/shop-by-fulfillment',
    ]);
    const sitemapCollectionPaths = staticPaths.filter((routePath) => (
      routePath.startsWith('/collections')
      || commercialRoots.has(routePath)
      || routePath.startsWith('/shop-by-fulfillment/')
    ));
    const configuredPaths = new Set(INDEXABLE_COLLECTION_PATHS || []);
    const sitemapPaths = new Set(sitemapCollectionPaths);
    const missingFromSitemap = [...configuredPaths].filter((routePath) => !sitemapPaths.has(routePath));
    const missingStandard = [...sitemapPaths].filter((routePath) => !configuredPaths.has(routePath));
    if (missingFromSitemap.length > 0 || missingStandard.length > 0) {
      fail(
        `source: collection standard and sitemap inventories differ `
        + `(missing from sitemap: ${missingFromSitemap.join(', ') || 'none'}; `
        + `missing standard: ${missingStandard.join(', ') || 'none'}).`,
      );
    }

    try {
      const approvedInventory = JSON.parse(readSource('scripts/approved-sitemap-inventory.json'));
      const approvedPaths = new Set(approvedInventory.paths || []);
      for (const routePath of INDEXABLE_COLLECTION_PATHS || []) {
        const standard = getCollectionStandard(routePath);
        if (!standard?.faqs?.some((faq) => /Which products appear in/i.test(faq?.question || ''))) {
          fail(`source: ${routePath} is missing a collection-specific product-eligibility FAQ.`);
        }
        const internalLinks = [
          ...(standard?.chooseBy || []),
          ...(standard?.guideLinks || []),
          { href: '/shipping' },
          { href: '/returns#merchant-return-policy' },
          { href: '/contact' },
        ];
        for (const { href } of internalLinks) {
          const targetPath = href.split(/[?#]/, 1)[0] || '/';
          if (!approvedPaths.has(targetPath)) {
            fail(`source: ${routePath} links to ${href}, which is outside the approved substantive URL inventory.`);
          }
        }
      }
    } catch (error) {
      fail(`source: unable to validate collection links against the approved URL inventory: ${error.message}`);
    }

    const customizableAnswer = getCollectionStandard?.('/collections/customizable-indian-outfits')?.directAnswer || '';
    const customizableWordCount = customizableAnswer.trim().split(/\s+/).filter(Boolean).length;
    if (customizableWordCount < 40 || customizableWordCount > 70) {
      fail(`source: customizable direct answer must contain 40–70 words, found ${customizableWordCount}.`);
    }
  }

  let occasionSignals = {};
  try {
    occasionSignals = JSON.parse(readSource('src/data/occasionSignals.json'));
  } catch (error) {
    fail(`source: occasionSignals.json is invalid JSON: ${error.message}`);
  }
  const signalRequirements = {
    festive: [
      ['Diwali/festive', /^(?:diwali|festive|festival)$/i],
      ['Eid', /^(?:eid|ramadan)$/i],
      ['Navratri/Garba', /^(?:navratri|garba|chaniya|dandiya)$/i],
    ],
    'wedding-event': [
      ['Mehendi', /^(?:mehendi|mehndi)$/i],
      ['Haldi', /^(?:haldi|turmeric)$/i],
      ['Sangeet', /^sangeet$/i],
      ['reception', /^reception$/i],
    ],
  };
  for (const [group, requirements] of Object.entries(signalRequirements)) {
    const signals = occasionSignals[group];
    if (!Array.isArray(signals) || signals.length === 0 || signals.some((signal) => typeof signal !== 'string' || !signal.trim())) {
      fail(`source: occasion signal group ${group} must contain nonblank signals.`);
      continue;
    }
    for (const [label, pattern] of requirements) {
      if (!signals.some((signal) => pattern.test(signal.trim()))) {
        fail(`source: occasion signal group ${group} is missing ${label} coverage.`);
      }
    }
  }

  const decisionSupport = readSource('src/components/collections/CollectionDecisionSupport.tsx');
  for (const href of ['/shipping', '/returns#merchant-return-policy', '/contact']) {
    if (!decisionSupport.includes(`to="${href}"`)) {
      fail(`source: hydrated collection decision support is missing ${href}.`);
    }
  }
  const currentProductGrid = decisionSupport.match(/const CurrentProductLinks\s*=([\s\S]*?)\n\};\n\nconst FetchedProductLinks/)?.[1] || '';
  if (
    !currentProductGrid.includes('<ProductCard')
    || !currentProductGrid.includes('product={product}')
    || !currentProductGrid.includes('showQuickAdd={false}')
    || !/grid-cols-2/.test(currentProductGrid)
  ) {
    fail('source: hydrated collection support must render a shoppable ProductCard grid with fabricated quick-add disabled.');
  }

  const hydratedPages = new Map([
    ['src/pages/DiwaliOutfits.tsx', '/collections/diwali-outfits'],
    ['src/pages/WeddingGuestOutfits.tsx', '/collections/wedding-guest-outfits'],
    ['src/pages/MehendiOutfits.tsx', '/collections/mehendi-outfits'],
    ['src/pages/EidOutfits.tsx', '/collections/eid-outfits'],
    ['src/pages/HaldiOutfits.tsx', '/collections/haldi-outfits'],
  ]);
  for (const [relativePath, routePath] of hydratedPages) {
    const page = readSource(relativePath);
    const main = page.match(/<main\b[\s\S]*?<\/main>/)?.[0] || '';
    const supportTag = main.match(/<CollectionDecisionSupport\b[\s\S]*?\/>/)?.[0] || '';
    if (
      !supportTag.includes(`path="${routePath}"`)
      || !supportTag.includes('products={sortedProducts}')
      || !supportTag.includes('showFaqs={false}')
    ) {
      fail(`source: ${relativePath} is missing route-scoped hydrated collection decision support.`);
    }
    const seoTag = page.match(/<SEOHead\b[\s\S]*?\/>/)?.[0] || '';
    if (
      !seoTag.includes('type="collection"')
      || !seoTag.includes('collection={!isLoading && !error')
      || !seoTag.includes('items: collectionItems')
    ) {
      fail(`source: ${relativePath} is missing hydrated CollectionPage and ItemList inputs.`);
    }
  }

  const customizablePage = readSource('src/pages/CustomizableOutfits.tsx');
  if (!/<h1\b[^>]*>Customizable Indian Outfits<\/h1>\s*<CollectionDirectAnswer\b[^>]*path="\/collections\/customizable-indian-outfits"[^>]*\/>/.test(customizablePage)) {
    fail('source: CustomizableOutfits must render its verified 40–70-word direct answer immediately after the H1.');
  }
  const customizableMain = customizablePage.match(/<main\b[\s\S]*?<\/main>/)?.[0] || '';
  const customizableSupport = customizableMain.match(/<CollectionDecisionSupport\b[\s\S]*?\/>/)?.[0] || '';
  if (
    !customizableSupport.includes('path="/collections/customizable-indian-outfits"')
    || !customizableSupport.includes('products={sortedProducts}')
    || !customizableSupport.includes('showFaqs={false}')
  ) {
    fail('source: CustomizableOutfits is missing route-scoped hydrated collection decision support.');
  }

  const hydratedSchemaRenderers = [
    'src/components/collections/CategoryListing.tsx',
    'src/pages/Collections.tsx',
    'src/pages/CustomizableOutfits.tsx',
    'src/pages/Indowestern.tsx',
    'src/pages/InventoryBackedCollection.tsx',
    'src/pages/NavratriOutfits.tsx',
    'src/pages/NewArrivals.tsx',
    'src/pages/ReadyToShip.tsx',
    'src/pages/SemanticCommercePage.tsx',
    'src/pages/ShopifyCollection.tsx',
  ];
  for (const relativePath of hydratedSchemaRenderers) {
    const renderer = readSource(relativePath);
    const seoTag = renderer.match(/<SEOHead\b[\s\S]*?\/>/)?.[0] || '';
    if (!seoTag.includes('collection=')) {
      fail(`source: ${relativePath} does not preserve collection schema after hydration.`);
    }
    if (!seoTag.includes('breadcrumbs=')) {
      fail(`source: ${relativePath} does not preserve BreadcrumbList schema after hydration.`);
    }
  }

  const seoHead = readSource('src/components/seo/SEOHead.tsx');
  const itemListBuilder = seoHead.match(/const collectionItemListSchema\s*=\s*collection([\s\S]*?)\n\s*: null;/)?.[1] || '';
  if (!itemListBuilder.includes("'@type': 'ListItem'") || /['"]@type['"]\s*:\s*['"]Product(?:Group)?['"]/.test(itemListBuilder)) {
    fail('source: hydrated collection ItemList must contain broad ListItem references without Product or ProductGroup markup.');
  }
  if (!seoHead.includes('const collectionPageSchema = collection')) {
    fail('source: SEOHead is missing hydrated CollectionPage schema generation.');
  }

  const categoryListing = readSource('src/components/collections/CategoryListing.tsx');
  if (!/const canonical\s*=\s*hasListingQueryState\s*\?\s*config\.canonical\s*:\s*activeSubcategory\?\.seoCanonical\s*\|\|\s*config\.canonical/.test(categoryListing)) {
    fail('source: hydrated multi-parameter facets must canonicalize to the parent collection.');
  }
  if (!categoryListing.includes('noIndexFollow={hasListingQueryState}')) {
    fail('source: hydrated collection facets must emit noindex, follow.');
  }

  const middleware = readSource('middleware.ts');
  const cleanCanonicalFunction = middleware.match(/function getCleanFacetCanonicalPath\(url: URL\): string \{[\s\S]*?\n\}/)?.[0] || '';
  const legacyRedirectFunction = middleware.match(/function getLegacyFacetRedirectPath\(url: URL\): string \| null \{[\s\S]*?\n\}/)?.[0] || '';
  if (!cleanCanonicalFunction || !legacyRedirectFunction) {
    fail('source: unable to locate facet canonical and redirect functions for behavioral validation.');
  } else {
    try {
      const compiled = esbuild.transformSync(
        `${cleanCanonicalFunction}\n${legacyRedirectFunction}\nmodule.exports = { getCleanFacetCanonicalPath, getLegacyFacetRedirectPath };`,
        { loader: 'ts', format: 'cjs', target: 'es2020' },
      ).code;
      const loadedModule = { exports: {} };
      const getDedicatedSubcategoryPath = (category, subcategory) => (
        category === 'lehengas' && subcategory === 'bridal'
          ? '/collections/bridal-lehengas'
          : null
      );
      new Function('module', 'exports', 'require', 'getDedicatedSubcategoryPath', compiled)(
        loadedModule,
        loadedModule.exports,
        require,
        getDedicatedSubcategoryPath,
      );
      const { getCleanFacetCanonicalPath, getLegacyFacetRedirectPath } = loadedModule.exports;
      const cases = [
        ['https://luxemia.shop/lehengas?sub=bridal', '/collections/bridal-lehengas', '/collections/bridal-lehengas'],
        ['https://luxemia.shop/lehengas?sub=bridal&sort=price-asc', '/lehengas', null],
        ['https://luxemia.shop/lehengas?sub=bridal&utm_source=test', '/lehengas', null],
        ['https://luxemia.shop/lehengas', '/lehengas', null],
      ];
      for (const [url, expectedCanonical, expectedRedirect] of cases) {
        const parsed = new URL(url);
        if (getCleanFacetCanonicalPath(parsed) !== expectedCanonical) {
          fail(`source: incorrect facet canonical for ${url}.`);
        }
        if (getLegacyFacetRedirectPath(parsed) !== expectedRedirect) {
          fail(`source: incorrect facet redirect for ${url}.`);
        }
      }
    } catch (error) {
      fail(`source: facet canonical behavior could not be executed: ${error.message}`);
    }
  }
  if (!middleware.includes("headers.set('X-Robots-Tag', 'noindex, follow')")) {
    fail('source: query facets are missing the HTTP noindex, follow directive.');
  }
  if (!middleware.includes("headers.set('Link', `<https://luxemia.shop${getCleanFacetCanonicalPath(url)}>; rel=\"canonical\"`)")) {
    fail('source: query facets are missing the HTTP canonical Link signal.');
  }
}

function prerenderFileForRoute(routePath) {
  if (routePath === '/') return path.join(DIST_DIR, '_prerender', 'index.html');
  return path.join(DIST_DIR, '_prerender', `${routePath.slice(1)}.html`);
}

function stripTags(value) {
  return String(value || '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|#39|rsquo|ldquo|rdquo|ndash|mdash);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function schemaTypes(value, result = new Set()) {
  if (Array.isArray(value)) {
    for (const entry of value) schemaTypes(entry, result);
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  const type = value['@type'];
  if (Array.isArray(type)) type.forEach((entry) => result.add(entry));
  else if (typeof type === 'string') result.add(type);
  for (const nested of Object.values(value)) schemaTypes(nested, result);
  return result;
}

const linkedProductCache = new Map();
const linkedPageCache = new Map();
function linkedPageErrors(routePath) {
  if (linkedPageCache.has(routePath)) return linkedPageCache.get(routePath);

  const errors = [];
  const htmlPath = prerenderFileForRoute(routePath);
  if (!fs.existsSync(htmlPath)) {
    errors.push('has no prerendered response');
  } else {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const canonical = routePath === '/' ? `${SITE_URL}/` : `${SITE_URL}${routePath}`;
    if (!html.includes(`<link rel="canonical" href="${canonical}"`)) errors.push('is not self-canonical');
    if (/content="noindex/i.test(html)) errors.push('is noindex');
    const h1 = stripTags(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
    if (!h1) errors.push('has no substantive H1');
  }

  linkedPageCache.set(routePath, errors);
  return errors;
}

function linkedProductErrors(handle) {
  if (linkedProductCache.has(handle)) return linkedProductCache.get(handle);

  const errors = [];
  const htmlPath = path.join(DIST_DIR, '_prerender', 'product', `${handle}.html`);
  if (!fs.existsSync(htmlPath)) {
    errors.push('has no prerendered product response');
  } else {
    const html = fs.readFileSync(htmlPath, 'utf8');
    if (!html.includes(`<link rel="canonical" href="${SITE_URL}/product/${handle}"`)) {
      errors.push('is not self-canonical');
    }
    if (/content="noindex/i.test(html)) errors.push('is noindex');
    const main = html.match(/<main\s+id="seo-prerender"[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
    const h1 = stripTags(main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
    if (!h1) errors.push('has no substantive product H1');

    const types = new Set();
    for (const match of html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        schemaTypes(JSON.parse(match[1]), types);
      } catch {
        // Invalid JSON-LD is reported by the route-level build validators; here
        // the missing Product type below is enough to reject a thin target.
      }
    }
    if (!types.has('Product') && !types.has('ProductGroup')) {
      errors.push('has no Product or ProductGroup JSON-LD');
    }
  }

  linkedProductCache.set(handle, errors);
  return errors;
}

validateSourceInvariants();
if (process.exitCode) process.exit(process.exitCode);
if (SOURCE_ONLY) {
  console.log('[collection-standard] PASS: source collection filters, intent scopes, hydrated renderers, sitemap inventory and facet canonical behavior are aligned.');
  process.exit(0);
}

if (!fs.existsSync(SITEMAP_PATH)) {
  fail('dist/sitemap-collections.xml is missing; generate the production build first.');
  process.exit();
}

const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
const routePaths = [...sitemap.matchAll(/<loc>https:\/\/luxemia\.shop([^<]*)<\/loc>/g)]
  .map((match) => match[1] || '/');

if (routePaths.length === 0) {
  fail('The collection sitemap contains no URLs.');
  process.exit();
}

const duplicates = routePaths.filter((routePath, index) => routePaths.indexOf(routePath) !== index);
if (duplicates.length > 0) fail(`Duplicate collection sitemap URLs: ${[...new Set(duplicates)].join(', ')}`);

let passed = 0;
for (const routePath of routePaths) {
  const htmlPath = prerenderFileForRoute(routePath);
  if (!fs.existsSync(htmlPath)) {
    fail(`${routePath}: missing prerendered HTML at ${path.relative(PROJECT_ROOT, htmlPath)}`);
    continue;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const main = html.match(/<main\s+id="seo-prerender"[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!main) {
    fail(`${routePath}: missing bot-visible #seo-prerender main content`);
    continue;
  }

  const errors = [];
  const h1s = [...main.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1s.length !== 1) errors.push(`expected exactly one H1, found ${h1s.length}`);
  if (h1s.length === 1 && stripTags(h1s[0][1]).split(/\s+/).filter(Boolean).length < 2) {
    errors.push('H1 is too broad to identify the collection precisely');
  }

  const immediateAnswer = main.match(/<h1\b[^>]*>[\s\S]*?<\/h1>\s*<p\s+data-collection-direct-answer(?:="[^"]*")?[^>]*>([\s\S]*?)<\/p>/i)?.[1];
  if (!immediateAnswer) {
    errors.push('missing direct answer immediately after H1');
  } else {
    const answerWordCount = stripTags(immediateAnswer).split(/\s+/).filter(Boolean).length;
    if (answerWordCount < 40 || answerWordCount > 70) {
      errors.push(`direct answer must contain 40–70 words, found ${answerWordCount}`);
    }
  }

  const standardBlock = main.match(/<section\s+data-collection-standard(?:\s|>)[^>]*>([\s\S]*?)<\/section>/i)?.[1] || '';
  if (!standardBlock) {
    errors.push('missing data-collection-standard decision-support section');
  } else {
    if (!/aria-label="Choose by shopping need"/i.test(standardBlock) || !/<a\b[^>]*href="\/[^"]+"/i.test(standardBlock)) {
      errors.push('missing linked choose-by guidance');
    }
    const decisionTable = standardBlock.match(/<table\s+data-collection-decision-table[^>]*>([\s\S]*?)<\/table>/i)?.[1];
    if (!decisionTable || (decisionTable.match(/<tr\b/gi) || []).length < 4) {
      errors.push('missing explicit comparison table with at least three options');
    }
    if (!/data-collection-selection-guidance/i.test(standardBlock) || !/Product selection guidance/i.test(standardBlock)) {
      errors.push('missing product-selection guidance');
    }
    const guides = standardBlock.match(/<ul\s+data-collection-guides[^>]*>([\s\S]*?)<\/ul>/i)?.[1] || '';
    const guideLinks = [...guides.matchAll(/href="([^"]+)"/gi)].map((match) => match[1]);
    if (guideLinks.length < 2 || !guideLinks.some((href) => href.startsWith('/blog/') || href === '/sizing-measurements-guide' || href === '/care-guide')) {
      errors.push('missing relevant guide links');
    }
    for (const requiredHref of ['/shipping', '/returns#merchant-return-policy', '/contact']) {
      if (!standardBlock.includes(`href="${requiredHref}"`)) errors.push(`missing support link ${requiredHref}`);
    }
    const standardLinks = [...standardBlock.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/gi)]
      .map((match) => match[1] || '/');
    for (const targetPath of new Set(standardLinks)) {
      const targetErrors = linkedPageErrors(targetPath);
      if (targetErrors.length > 0) {
        errors.push(`linked page ${targetPath} ${targetErrors.join(', ')}`);
      }
    }
    const faqBlock = standardBlock.match(/<div\s+data-collection-faqs[^>]*>([\s\S]*?)<\/div>/i)?.[1] || '';
    if ((faqBlock.match(/<h3\b/gi) || []).length < 3 || (faqBlock.match(/<p\b/gi) || []).length < 3) {
      errors.push('missing at least three visible collection FAQs');
    }
    if (!/Which products appear in/i.test(faqBlock)) {
      errors.push('missing a collection-specific product-eligibility FAQ');
    }
  }

  const productBlock = main.match(/<section\s+data-collection-products[^>]*>([\s\S]*?)<\/section>/i)?.[1] || '';
  const productLinks = [...productBlock.matchAll(/href="\/product\/([^"?#]+)"/gi)];
  if (productLinks.length === 0) errors.push('missing current product links/grid');
  for (const handle of new Set(productLinks.map((match) => match[1]))) {
    const targetErrors = linkedProductErrors(handle);
    if (targetErrors.length > 0) {
      errors.push(`linked product /product/${handle} ${targetErrors.join(', ')}`);
    }
  }
  if (
    (routePath === '/ready-to-ship' || routePath === '/shop-by-fulfillment/ready-to-ship')
    && /Currently Unavailable/i.test(productBlock)
  ) {
    errors.push('ready-to-ship grid contains an unavailable product');
  }

  const types = new Set();
  for (const match of html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1]);
      schemaTypes(parsed, types);
    } catch (error) {
      errors.push(`invalid JSON-LD: ${error.message}`);
    }
  }
  if (types.has('Product') || types.has('ProductGroup')) {
    errors.push('broad collection contains Product or ProductGroup JSON-LD at any nesting level');
  }
  for (const requiredType of ['CollectionPage', 'ItemList', 'BreadcrumbList']) {
    if (!types.has(requiredType)) errors.push(`missing ${requiredType} JSON-LD`);
  }

  if (!html.includes(`<link rel="canonical" href="${SITE_URL}${routePath}"`)) {
    errors.push('missing self-referencing canonical');
  }
  if (/content="noindex/i.test(html)) errors.push('collection sitemap URL is noindex');

  if (errors.length > 0) fail(`${routePath}: ${errors.join('; ')}`);
  else passed += 1;
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`[collection-standard] PASS: ${passed}/${routePaths.length} collection sitemap URLs have the complete buying-decision and schema standard.`);
