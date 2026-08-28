#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
  const absolutePath = path.join(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`[navratri-traffic] Missing required build artifact: ${relativePath}`);
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    throw new Error(`[navratri-traffic] ${label} is missing: ${needle}`);
  }
}

function requirePattern(haystack, pattern, label) {
  if (!pattern.test(haystack)) {
    throw new Error(`[navratri-traffic] ${label} is missing: ${pattern}`);
  }
}

function count(haystack, pattern) {
  return [...haystack.matchAll(pattern)].length;
}

const REQUIRED_NAVRATRI_PRODUCT_HANDLES = [
  'pure-cotton-gamthi-work-navratri-lehenga-choli-set',
  'pink-pure-rayon-gamthi-gota-patti-navratri-lehenga-choli-set',
  'red-pure-cotton-gamthi-mirror-work-navratri-lehenga-choli-set',
  'blue-white-muslin-kutchi-mirror-digital-print-lehenga-choli-set',
  'maroon-pure-cotton-gamthi-mirror-navratri-lehenga-choli-set',
  'blue-cora-cotton-bandhej-gamthi-navratri-lehenga-top-set',
  'lime-white-pure-cotton-mirror-gota-patti-lehenga-choli-set',
  'red-pure-cotton-mirror-work-navratri-lehenga-set-with-purse',
  'muslin-cotton-real-mirror-work-navratri-lehenga-choli-set',
  'butter-silk-digital-print-mirror-work-navratri-lehenga-choli-set',
  'butter-silk-real-mirror-work-navratri-lehenga-choli-set',
  'black-butter-silk-real-mirror-gota-patti-navratri-lehenga-choli',
  'dola-silk-bandhani-ajrakh-navratri-chaniya-choli-set',
  'soft-gaji-silk-zari-border-navratri-lehenga-choli-set',
  'black-jam-cotton-8-meter-flare-navratri-lehenga-set',
  'black-maroon-rayon-kodi-lace-navratri-lehenga-choli-set',
];

const collectionPath = 'dist/_prerender/collections/navratri-outfits.html';
const articlePath = 'dist/_prerender/blog/navratri-9-day-color-guide-2026.html';
const homepagePath = 'dist/_prerender/index.html';
const collectionHtml = read(collectionPath);
const articleHtml = read(articlePath);
const homepageHtml = read(homepagePath);
const feedXml = read('dist/merchant-feed.xml');
const sitemapXml = read('dist/sitemap.xml');
const blogSource = read('src/data/blogPosts.ts');
const reviewedAt = blogSource.match(/const GROWTH_CONTENT_REVIEWED_AT = '(\d{4}-\d{2}-\d{2})';/)?.[1];
if (!reviewedAt) {
  throw new Error('[navratri-traffic] GROWTH_CONTENT_REVIEWED_AT is missing from src/data/blogPosts.ts');
}

requireText(collectionHtml, '<title>Navratri Outfits USA 2026 | Garba Styles | LuxeMia</title>', 'collection search title');
requireText(collectionHtml, '<link rel="canonical" href="https://luxemia.shop/collections/navratri-outfits"', 'collection canonical');
requireText(collectionHtml, '<h1>Navratri Outfits for Garba in the USA</h1>', 'collection H1');
requirePattern(collectionHtml, /"@type"\s*:\s*"CollectionPage"/, 'CollectionPage schema');
requirePattern(collectionHtml, /"@type"\s*:\s*"ItemList"/, 'ItemList schema');
requireText(collectionHtml, 'https://luxemia.shop/collections/navratri-outfits#products', 'linked collection product schema');
requireText(collectionHtml, '/blog/navratri-9-day-color-guide-2026', 'collection-to-guide internal link');
requireText(collectionHtml, 'LUXE10', 'collection first-order offer');

const collectionProductLinks = new Set(
  [...collectionHtml.matchAll(/href="\/product\/([^"?]+)"/g)].map((match) => match[1])
);
if (collectionProductLinks.size < 12) {
  throw new Error(`[navratri-traffic] Collection prerender contains only ${collectionProductLinks.size} unique product links`);
}
for (const handle of REQUIRED_NAVRATRI_PRODUCT_HANDLES) {
  if (!collectionProductLinks.has(handle)) {
    throw new Error(`[navratri-traffic] Collection prerender is missing published Navratri product ${handle}`);
  }
  const productPrerenderPath = path.join(PROJECT_ROOT, 'dist', '_prerender', 'product', `${handle}.html`);
  if (!fs.existsSync(productPrerenderPath)) {
    throw new Error(`[navratri-traffic] Published Navratri product is not prerendered: ${handle}`);
  }
}

requireText(articleHtml, '<title>Navratri 2026 USA: Garba &amp; Chaniya Choli Guide | LuxeMia</title>', 'article search title');
requireText(articleHtml, '<link rel="canonical" href="https://luxemia.shop/blog/navratri-9-day-color-guide-2026"', 'article canonical');
requirePattern(
  articleHtml,
  new RegExp(`"dateModified"\\s*:\\s*"${reviewedAt}"`),
  `article review date ${reviewedAt}`,
);
requireText(articleHtml, 'https://www.timeanddate.com/holidays/us/hindu-navaratri', 'United States date source');
requireText(articleHtml, 'href="/collections/navratri-outfits"', 'guide-to-collection internal link');
requireText(articleHtml, 'LUXE10', 'article first-order offer');

requireText(homepageHtml, 'href="/collections/navratri-outfits"', 'homepage Navratri collection link');
requireText(homepageHtml, 'href="/blog/navratri-9-day-color-guide-2026"', 'homepage Navratri guide link');

const priorityItems = [...feedXml.matchAll(/<item>[\s\S]*?<\/item>/gi)]
  .map((match) => match[0])
  .filter((item) => /<g:custom_label_1>navratri_2026_priority<\/g:custom_label_1>/i.test(item));
const priorityHandles = new Set(priorityItems.map((item) => {
  const link = item.match(/<g:link>([\s\S]*?)<\/g:link>/i)?.[1]?.replace(/&amp;/g, '&') || '';
  try {
    return new URL(link).pathname.replace(/^\/product\//, '').replace(/\/+$/, '');
  } catch {
    return '';
  }
}).filter(Boolean));
if (priorityHandles.size !== 30) {
  throw new Error(`[navratri-traffic] Expected 30 priority Merchant product groups; found ${priorityHandles.size}`);
}

const hierarchicalTypes = count(feedXml, /<g:product_type>Apparel &amp; Accessories &gt; [^<]+<\/g:product_type>/g);
const feedItems = count(feedXml, /<item>/g);
if (hierarchicalTypes !== feedItems) {
  throw new Error(`[navratri-traffic] Hierarchical product types cover ${hierarchicalTypes} of ${feedItems} Merchant offers`);
}

for (const url of [
  'https://luxemia.shop/collections/navratri-outfits',
  'https://luxemia.shop/blog/navratri-9-day-color-guide-2026',
  ...REQUIRED_NAVRATRI_PRODUCT_HANDLES.map((handle) => `https://luxemia.shop/product/${handle}`),
]) {
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const occurrences = count(sitemapXml, new RegExp(`<loc>${escaped}<\\/loc>`, 'g'));
  if (occurrences !== 1) {
    throw new Error(`[navratri-traffic] Sitemap must contain ${url} exactly once; found ${occurrences}`);
  }
}

console.log(`[navratri-traffic] OK — ${collectionProductLinks.size} collection products including all ${REQUIRED_NAVRATRI_PRODUCT_HANDLES.length} published seasonal listings, bidirectional guide links, CollectionPage/ItemList schema, 30 Merchant priority groups, full product-type hierarchy, prerender coverage, and sitemap coverage verified.`);
