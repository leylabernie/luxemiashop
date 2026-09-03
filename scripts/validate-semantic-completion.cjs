#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
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
const inventoryCollectionSource = read('src/pages/InventoryBackedCollection.tsx');
for (const route of requiredInventoryRoutes) {
  requireText(read('src/App.tsx'), route, `routed inventory collection ${route}`);
  requireText(prerender, route, `prerendered inventory collection ${route}`);
  requireText(read('scripts/generate-routes.cjs'), route, `route manifest collection ${route}`);
  requireText(read('scripts/generate-sitemap.cjs'), route, `collection sitemap route ${route}`);

  const slug = route.slice('/collections/'.length);
  const reactStart = inventoryCollectionSource.indexOf(`  '${slug}': {`);
  const prerenderStart = prerender.indexOf(`    path: '${route}',`);
  if (reactStart < 0 || prerenderStart < 0) {
    throw new Error(`[semantic-completion] Could not locate direct-answer sources for ${route}`);
  }

  const reactBlock = inventoryCollectionSource.slice(reactStart, reactStart + 6000);
  const prerenderBlock = prerender.slice(prerenderStart, prerenderStart + 6000);
  const reactAnswer = reactBlock.match(/\n\s+answer: '([^'\n]+)',/)?.[1];
  const prerenderAnswer = prerenderBlock.match(/content:\s*`<p>([\s\S]*?)<\/p>/)?.[1];
  if (!reactAnswer || !prerenderAnswer) {
    throw new Error(`[semantic-completion] Missing direct answer for ${route}`);
  }
  requireDirectAnswerLength(reactAnswer, `${route} React`);
  requireDirectAnswerLength(prerenderAnswer, `${route} prerender`);
  if (reactAnswer !== prerenderAnswer) {
    throw new Error(`[semantic-completion] React and prerender direct answers differ for ${route}`);
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
