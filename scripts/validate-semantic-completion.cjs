#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const requireText = (source, value, label) => {
  if (!source.includes(value)) throw new Error(`[semantic-completion] Missing ${label}: ${value}`);
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
}
const sitemapIndex = read('dist/sitemap.xml');
requireText(sitemapIndex, '<sitemapindex', 'sitemap index');
for (const name of ['products', 'collections', 'guides', 'pages', 'images']) {
  requireText(sitemapIndex, `/sitemap-${name}.xml`, `${name} sitemap index entry`);
}

const indexNow = read('scripts/submit-indexnow.cjs');
requireText(indexNow, 'https://api.indexnow.org/indexnow', 'IndexNow endpoint');
requireText(indexNow, 'PRODUCTION_MANIFEST_URL', 'production IndexNow manifest comparison');
requireText(indexNow, 'substantiveHash', 'substantive HTML change hashing');
requireText(indexNow, 'IndexNow is a discovery notification, not an indexing guarantee', 'IndexNow disclaimer');

const indexNowManifestPath = path.join(root, 'dist', 'indexnow-manifest.json');
if (!fs.existsSync(indexNowManifestPath)) throw new Error('[semantic-completion] Missing generated IndexNow manifest');
const indexNowManifest = JSON.parse(fs.readFileSync(indexNowManifestPath, 'utf8'));
if (indexNowManifest.version !== 1 || !indexNowManifest.entries || Object.keys(indexNowManifest.entries).length === 0) {
  throw new Error('[semantic-completion] Generated IndexNow manifest is empty or invalid');
}

const requiredInventoryRoutes = [
  '/collections/navratri-chaniya-choli',
  '/collections/garba-outfits',
  '/collections/groomsmen-outfits',
  '/collections/sangeet-outfits',
  '/collections/reception-outfits',
];
for (const route of requiredInventoryRoutes) {
  requireText(read('src/App.tsx'), route, `routed inventory collection ${route}`);
  requireText(prerender, route, `prerendered inventory collection ${route}`);
  requireText(read('scripts/generate-routes.cjs'), route, `route manifest collection ${route}`);
  requireText(read('scripts/generate-sitemap.cjs'), route, `collection sitemap route ${route}`);
}
const vercelConfiguration = read('vercel.json');
if (vercelConfiguration.includes('"source": "/collections/reception-outfits"')) {
  throw new Error('[semantic-completion] Reception inventory page must not be shadowed by a Vercel redirect');
}
for (const forbiddenThinRoute of ['/collections/navratri-menswear']) {
  if ([read('src/App.tsx'), prerender, read('scripts/generate-routes.cjs'), read('scripts/generate-sitemap.cjs')]
    .some((source) => source.includes(forbiddenThinRoute))) {
    throw new Error(`[semantic-completion] Unsupported thin collection route was published: ${forbiddenThinRoute}`);
  }
}

console.log('[semantic-completion] Stable entities, inventory-backed collections, five-part sitemap index, and change-aware IndexNow discovery are enforced.');
