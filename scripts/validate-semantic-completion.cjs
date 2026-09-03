#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const loadTsModule = (relative) => {
  const result = esbuild.buildSync({
    entryPoints: [path.join(root, relative)],
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
};
const normalizeHtmlText = (value) => String(value || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(#x[\da-f]+|#\d+|amp|quot|lt|gt|apos|nbsp);/gi, (match, entity) => {
    const normalized = entity.toLowerCase();
    if (normalized === 'amp') return '&';
    if (normalized === 'quot') return '"';
    if (normalized === 'lt') return '<';
    if (normalized === 'gt') return '>';
    if (normalized === 'apos') return "'";
    if (normalized === 'nbsp') return ' ';
    const radix = normalized.startsWith('#x') ? 16 : 10;
    const digits = normalized.replace(/^#x?/, '');
    const codePoint = Number.parseInt(digits, radix);
    return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10FFFF
      ? String.fromCodePoint(codePoint)
      : match;
  })
  .replace(/\s+/g, ' ')
  .trim();
const collectSchemaByType = (value, expectedType, result = []) => {
  if (Array.isArray(value)) {
    for (const entry of value) collectSchemaByType(entry, expectedType, result);
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
  if (types.includes(expectedType)) result.push(value);
  for (const nested of Object.values(value)) collectSchemaByType(nested, expectedType, result);
  return result;
};
const requireText = (source, value, label) => {
  if (!source.includes(value)) throw new Error(`[semantic-completion] Missing ${label}: ${value}`);
};
const wordCount = (value) => String(value)
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(?:[a-z]+|#\d+|#x[a-f0-9]+);/gi, ' ')
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .length;
const requireDirectAnswerLength = (answer, label) => {
  const count = wordCount(answer);
  if (count < 40 || count > 70) {
    throw new Error(`[semantic-completion] ${label} direct answer must contain 40–70 words; found ${count}`);
  }
};

const index = read('index.html');
const schema = read('src/lib/schema.ts');
const prerender = read('scripts/prerender.js');
const allSchemaSources = `${index}\n${schema}\n${prerender}`;
for (const id of ['#organization', '#website', '#brand', '#customer-support']) {
  requireText(allSchemaSources, id, `stable entity ID ${id}`);
}
if (/\/#org(?![A-Za-z0-9_-])/.test(allSchemaSources)) {
  throw new Error('[semantic-completion] Legacy /#org entity ID remains');
}
requireText(prerender, "'@type': 'CollectionPage'", 'CollectionPage schema');
requireText(prerender, "'@type': 'ItemList'", 'ItemList schema');

for (const name of ['products', 'collections', 'guides', 'pages', 'images']) {
  const file = path.join(root, 'dist', `sitemap-${name}.xml`);
  if (!fs.existsSync(file)) throw new Error(`[semantic-completion] Missing scoped sitemap: sitemap-${name}.xml`);
  const xml = fs.readFileSync(file, 'utf8');
  requireText(xml, '<urlset', `${name} urlset`);
  const urlCount = (xml.match(/<url>/g) || []).length;
  const lastmodCount = (xml.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length;
  if (urlCount === 0 || lastmodCount !== urlCount) {
    throw new Error(`[semantic-completion] ${name} sitemap needs one meaningful lastmod per URL; found ${lastmodCount}/${urlCount}`);
  }
}
const sitemapIndex = read('dist/sitemap.xml');
requireText(sitemapIndex, '<sitemapindex', 'sitemap index');
for (const name of ['products', 'collections', 'guides', 'pages', 'images']) {
  requireText(sitemapIndex, `/sitemap-${name}.xml`, `${name} sitemap index entry`);
}
if ((sitemapIndex.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length !== 5) {
  throw new Error('[semantic-completion] Sitemap index needs a content-derived lastmod for all five scoped sitemaps');
}
const sitemapGenerator = read('scripts/generate-sitemap.cjs');
requireText(sitemapGenerator, 'STATIC_CONTENT_REVIEWED_AT', 'meaningful static-page lastmod source');
requireText(sitemapGenerator, 'lastmodByName', 'content-derived scoped sitemap lastmod');

// Merchant discovery and organic discovery must cover the same public product
// pages. The feed can contain several variant offers per product, but no feed
// handle may be absent from the product sitemap and no sitemapped product may
// lack an orderable Merchant offer.
const merchantFeedPath = path.join(root, 'dist', 'merchant-feed.xml');
if (!fs.existsSync(merchantFeedPath)) {
  throw new Error('[semantic-completion] Missing generated Merchant feed');
}
const merchantFeed = fs.readFileSync(merchantFeedPath, 'utf8');
const merchantProductUrls = new Set(
  [...merchantFeed.matchAll(/<g:link>([\s\S]*?)<\/g:link>/gi)]
    .map((match) => normalizeHtmlText(match[1]))
    .map((value) => {
      try {
        const url = new URL(value);
        return url.origin === 'https://luxemia.shop' && url.pathname.startsWith('/product/')
          ? `${url.origin}${url.pathname}`
          : '';
      } catch {
        return '';
      }
    })
    .filter(Boolean),
);
const sitemapProductUrls = new Set(
  [...read('dist/sitemap-products.xml').matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => normalizeHtmlText(match[1])),
);
const feedOnlyProducts = [...merchantProductUrls].filter((url) => !sitemapProductUrls.has(url));
const sitemapOnlyProducts = [...sitemapProductUrls].filter((url) => !merchantProductUrls.has(url));
if (
  merchantProductUrls.size === 0
  || sitemapProductUrls.size === 0
  || feedOnlyProducts.length > 0
  || sitemapOnlyProducts.length > 0
) {
  throw new Error(
    `[semantic-completion] Merchant/sitemap product coverage differs: `
    + `${merchantProductUrls.size} Merchant products, ${sitemapProductUrls.size} sitemap products, `
    + `${feedOnlyProducts.length} feed-only, ${sitemapOnlyProducts.length} sitemap-only.`,
  );
}

const indexNow = read('scripts/submit-indexnow.cjs');
const indexNowNotifier = read('scripts/notify-indexnow.cjs');
const indexNowWorkflow = read('.github/workflows/indexnow-after-production.yml');
requireText(indexNow, 'PRODUCTION_MANIFEST_URL', 'production IndexNow manifest comparison');
requireText(indexNow, 'substantiveHash', 'substantive HTML change hashing');
requireText(indexNow, "process.env.VERCEL_ENV === 'production'", 'production-only IndexNow comparison guard');
requireText(indexNow, 'semanticPayload', 'build-artifact-independent semantic hashing');
requireText(indexNow, 'notificationPlan', 'post-deploy notification plan');
requireText(indexNow, 'collectRedirectInventory', 'deterministic redirect-source inventory');
requireText(indexNow, 'redirectChangedCount', 'redirect-change notification count');
requireText(indexNow, 'redirectRemovedCount', 'removed-redirect notification count');
requireText(indexNow, "status: 'baseline-unavailable'", 'safe baseline-failure status');
requireText(indexNow, 'No build-time network submission was made', 'no build-time submission statement');
if (indexNow.includes('api.indexnow.org/indexnow')) {
  throw new Error('[semantic-completion] The build-time manifest script must not contain the IndexNow submission endpoint');
}
requireText(indexNowNotifier, 'https://api.indexnow.org/indexnow', 'post-deploy IndexNow endpoint');
requireText(indexNowNotifier, "process.env.INDEXNOW_POST_DEPLOY !== '1'", 'explicit post-deploy execution guard');
requireText(indexNowNotifier, 'MAX_BATCH_SIZE = 10000', 'IndexNow batch limit');
requireText(indexNowNotifier, "plan.status === 'baseline-unavailable'", 'baseline failure refusal');
requireText(indexNowNotifier, 'IndexNow is a discovery notification, not an indexing guarantee', 'IndexNow disclaimer');
requireText(indexNowWorkflow, 'deployment_status:', 'post-production deployment event');
requireText(indexNowWorkflow, "INDEXNOW_POST_DEPLOY: '1'", 'post-deploy workflow guard');
requireText(indexNowWorkflow, 'node scripts/notify-indexnow.cjs', 'post-deploy notifier execution');

const indexNowManifestPath = path.join(root, 'dist', 'indexnow-manifest.json');
if (!fs.existsSync(indexNowManifestPath)) throw new Error('[semantic-completion] Missing generated IndexNow manifest');
const indexNowManifest = JSON.parse(fs.readFileSync(indexNowManifestPath, 'utf8'));
if (
  indexNowManifest.version !== 3
  || typeof indexNowManifest.releaseId !== 'string'
  || !indexNowManifest.entries
  || Object.keys(indexNowManifest.entries).length === 0
  || !indexNowManifest.redirects
  || Object.keys(indexNowManifest.redirects).length === 0
  || !indexNowManifest.notificationPlan
  || !Array.isArray(indexNowManifest.notificationPlan.urls)
) {
  throw new Error('[semantic-completion] Generated IndexNow v3 page-and-redirect manifest is empty or invalid');
}

const requiredInventoryRoutes = [
  '/collections/wedding-guest-lehengas',
  '/collections/wedding-guest-kurta-sets',
  '/collections/diwali-womenswear',
  '/collections/diwali-menswear',
  '/collections/navratri-chaniya-choli',
  '/collections/garba-outfits',
  '/collections/groomsmen-outfits',
  '/collections/sangeet-outfits',
  '/collections/reception-outfits',
];
const appSource = read('src/App.tsx');
const inventoryCollectionSource = read('src/pages/InventoryBackedCollection.tsx');
const { getCollectionStandard } = loadTsModule('src/config/collectionStandards.ts');
const inventoryFaqSchemaPaths = prerender.match(
  /const INVENTORY_BACKED_COLLECTION_PATHS = new Set\(\[([\s\S]*?)\]\);/,
)?.[1] || '';
requireText(inventoryCollectionSource, 'answer: standard.directAnswer', 'shared React collection direct-answer consumer');
requireText(prerender, 'route.collectionStandard = standard', 'shared prerender collection-standard assignment');
requireText(prerender, 'escapeHtml(collectionStandard.directAnswer)', 'shared prerender collection direct-answer consumer');
for (const route of requiredInventoryRoutes) {
  const slug = route.slice('/collections/'.length);
  requireText(
    appSource,
    `<Route path="${route}" element={<Suspense fallback={<PageLoader />}><InventoryBackedCollection landing="${slug}" /></Suspense>} />`,
    `exact routed inventory landing ${route}`,
  );
  requireText(prerender, route, `prerendered inventory collection ${route}`);
  requireText(read('scripts/generate-routes.cjs'), route, `route manifest collection ${route}`);
  requireText(read('scripts/generate-sitemap.cjs'), route, `collection sitemap route ${route}`);

  const reactStart = inventoryCollectionSource.indexOf(`  '${slug}': withCollectionStandard({`);
  const prerenderStart = prerender.indexOf(`    path: '${route}',`);
  if (reactStart < 0 || prerenderStart < 0) {
    throw new Error(`[semantic-completion] ${route} must use the shared collection-standard path`);
  }

  const reactEnd = inventoryCollectionSource.indexOf('\n  }),', reactStart);
  if (reactEnd < 0) {
    throw new Error(`[semantic-completion] Could not bound the React collection config for ${route}`);
  }
  const reactBlock = inventoryCollectionSource.slice(reactStart, reactEnd);
  const prerenderEnd = prerender.indexOf('\n  },', prerenderStart);
  if (prerenderEnd < 0) {
    throw new Error(`[semantic-completion] Could not bound the prerender route for ${route}`);
  }
  const prerenderBlock = prerender.slice(prerenderStart, prerenderEnd);
  if (!/\n\s+content:\s*'',/.test(prerenderBlock)) {
    throw new Error(`[semantic-completion] ${route} duplicates shared standard copy in its prerender route`);
  }
  requireText(inventoryFaqSchemaPaths, `'${route}'`, `inventory FAQ schema route ${route}`);

  const answer = getCollectionStandard?.(route)?.directAnswer;
  if (!answer) throw new Error(`[semantic-completion] Missing shared direct answer for ${route}`);
  const standard = getCollectionStandard(route);
  if (!reactBlock.includes(`slug: '${slug}'`) || !reactBlock.includes(`category: '${standard.category}'`)) {
    throw new Error(`[semantic-completion] React slug or category differs from the shared source for ${route}`);
  }
  if (!prerenderBlock.includes(`category: '${standard.category}'`)) {
    throw new Error(`[semantic-completion] Prerender category differs from the shared source for ${route}`);
  }
  for (const field of ['category', 'title', 'description', 'h1']) {
    const pattern = new RegExp(`\\n\\s+${field}: '([^'\\n]+)'`);
    const reactValue = reactBlock.match(pattern)?.[1];
    const prerenderValue = prerenderBlock.match(pattern)?.[1];
    if (!reactValue || reactValue !== prerenderValue) {
      throw new Error(`[semantic-completion] React and prerender ${field} differ for ${route}`);
    }
  }
  requireDirectAnswerLength(answer, `${route} shared`);

  const builtPath = path.join(root, 'dist', '_prerender', `${route.slice(1)}.html`);
  if (!fs.existsSync(builtPath)) {
    throw new Error(`[semantic-completion] Missing built inventory collection: ${route}`);
  }
  const builtHtml = fs.readFileSync(builtPath, 'utf8');
  const mainMatches = [...builtHtml.matchAll(/<main\b(?=[^>]*\bid=["']seo-prerender["'])[^>]*>([\s\S]*?)<\/main>/gi)];
  if (mainMatches.length !== 1) {
    throw new Error(`[semantic-completion] Expected one built #seo-prerender main for ${route}; found ${mainMatches.length}`);
  }
  const main = mainMatches[0][1];
  const answerMatches = [...main.matchAll(/<p\b(?=[^>]*\bdata-collection-direct-answer\b)[^>]*>([\s\S]*?)<\/p>/gi)];
  const immediateAnswer = main.match(
    /<h1\b[^>]*>[\s\S]*?<\/h1>\s*<p\b(?=[^>]*\bdata-collection-direct-answer\b)[^>]*>([\s\S]*?)<\/p>/i,
  )?.[1];
  if (answerMatches.length !== 1 || !immediateAnswer) {
    throw new Error(`[semantic-completion] Expected one immediate built direct answer for ${route}; found ${answerMatches.length}`);
  }
  if (normalizeHtmlText(immediateAnswer) !== normalizeHtmlText(answer)) {
    throw new Error(`[semantic-completion] Built direct answer differs from the shared source for ${route}`);
  }

  const visibleFaqBlocks = [...main.matchAll(/<div\b(?=[^>]*\bdata-collection-faqs\b)[^>]*>([\s\S]*?)<\/div>/gi)];
  const visibleFaqs = visibleFaqBlocks.length === 1
    ? [...visibleFaqBlocks[0][1].matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((match) => ({
        question: normalizeHtmlText(match[1]),
        answer: normalizeHtmlText(match[2]),
      }))
    : [];
  const expectedFaqs = standard.faqs.map((faq) => ({
    question: normalizeHtmlText(faq.question),
    answer: normalizeHtmlText(faq.answer),
  }));
  if (visibleFaqBlocks.length !== 1 || JSON.stringify(visibleFaqs) !== JSON.stringify(expectedFaqs)) {
    throw new Error(`[semantic-completion] Built visible FAQs differ from the shared source for ${route}`);
  }

  const faqPages = [];
  for (const match of builtHtml.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      collectSchemaByType(JSON.parse(match[1]), 'FAQPage', faqPages);
    } catch {
      // Other build validators report malformed JSON-LD. This invariant still
      // fails below when it cannot find the exact inventory FAQPage.
    }
  }
  if (faqPages.length !== 1) {
    throw new Error(`[semantic-completion] Expected one built FAQPage for ${route}; found ${faqPages.length}`);
  }
  const builtFaqs = Array.isArray(faqPages[0].mainEntity)
    ? faqPages[0].mainEntity.map((question) => ({
      question: question?.name,
      answer: question?.acceptedAnswer?.text,
    }))
    : [];
  if (JSON.stringify(builtFaqs) !== JSON.stringify(standard.faqs)) {
    throw new Error(`[semantic-completion] Built FAQPage differs from the shared source for ${route}`);
  }
}
for (const route of ['/collections/palazzo-suits', '/collections/sherwani-for-groom', '/collections/banarasi-sarees']) {
  requireText(read('src/App.tsx'), route, `routed durable-intent collection ${route}`);
  requireText(prerender, route, `prerendered durable-intent collection ${route}`);
  requireText(read('scripts/generate-routes.cjs'), route, `route manifest collection ${route}`);
  requireText(read('scripts/generate-sitemap.cjs'), route, `collection sitemap route ${route}`);
  requireText(read('src/config/collectionStandards.ts'), route, `collection standard ${route}`);
  requireText(read('public/llms-full.txt'), `https://luxemia.shop${route}`, `LLM canonical inventory ${route}`);
}
const vercelConfiguration = read('vercel.json');
const middleware = read('middleware.ts');
if (
  vercelConfiguration.includes('"source": "/collections/reception-outfits"')
  || /['"]\/collections\/reception-outfits['"]\s*:/.test(middleware)
) {
  throw new Error('[semantic-completion] Reception inventory page must not be shadowed by a Vercel or middleware redirect');
}
for (const forbiddenThinRoute of ['/collections/navratri-menswear', '/collections/indo-western-menswear']) {
  if ([read('src/App.tsx'), prerender, read('scripts/generate-routes.cjs'), read('scripts/generate-sitemap.cjs')]
    .some((source) => source.includes(forbiddenThinRoute))) {
    throw new Error(`[semantic-completion] Unsupported thin collection route was published: ${forbiddenThinRoute}`);
  }
}

console.log('[semantic-completion] Stable entities, inventory-backed collections, five-part sitemap index, and change-aware IndexNow discovery are enforced.');
