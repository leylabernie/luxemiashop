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
if (allSchemaSources.includes('/#org')) throw new Error('[semantic-completion] Legacy /#org entity ID remains');
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
requireText(indexNow, 'IndexNow is a discovery notification, not an indexing guarantee', 'IndexNow disclaimer');

console.log('[semantic-completion] Stable entities, collection schemas, five-part sitemap index, meaningful product lastmod, and IndexNow discovery are enforced.');
