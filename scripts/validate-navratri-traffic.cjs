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
const genericLehengasHtml = read('dist/_prerender/lehengas.html');
const feedXml = read('dist/merchant-feed.xml');
const sitemapIndexXml = read('dist/sitemap.xml');
const canonicalSitemapNames = [
  'products',
  'collections',
  'guides',
  'pages',
];
for (const name of [...canonicalSitemapNames, 'images']) {
  requireText(sitemapIndexXml, `/sitemap-${name}.xml`, `${name} sitemap index entry`);
}
const sitemapXml = canonicalSitemapNames.map((name) => {
  return read(`dist/sitemap-${name}.xml`);
}).join('\n');
const blogSource = read('src/data/blogPosts.ts');
const reviewedAt = blogSource.match(/const GROWTH_CONTENT_REVIEWED_AT = '(\d{4}-\d{2}-\d{2})';/)?.[1];
if (!reviewedAt) {
  throw new Error('[navratri-traffic] GROWTH_CONTENT_REVIEWED_AT is missing from src/data/blogPosts.ts');
}

const genericLehengaPayload = genericLehengasHtml.match(
  /window\.__INITIAL_DATA__\s*=\s*({[\s\S]*?});<\/script>/,
)?.[1];
if (!genericLehengaPayload) {
  throw new Error('[navratri-traffic] Generic /lehengas prerender is missing hydration product data');
}
const genericLehengas = JSON.parse(genericLehengaPayload).products.map((entry) => entry.node);
if (genericLehengas.length < 12) {
  throw new Error(`[navratri-traffic] Generic /lehengas has only ${genericLehengas.length} prerendered products`);
}
const weddingIntent = /\b(?:bridal|bride|wedding|reception|sangeet|engagement|mehendi|mehndi|haldi|bridesmaid)\b/i;
const festivalIntent = /\b(?:navratri|garba|dandiya|raas|chaniya(?:[-\s]+choli)?)\b/i;
const intentTier = (product) => {
  const text = [product.title || '', product.productType || '', ...(product.tags || [])].join(' ');
  if (festivalIntent.test(text)) return 2;
  if (weddingIntent.test(text)) return 0;
  return 1;
};
const genericTiers = genericLehengas.map(intentTier);
for (let index = 1; index < genericTiers.length; index += 1) {
  if (genericTiers[index] < genericTiers[index - 1]) {
    throw new Error('[navratri-traffic] Generic /lehengas is not partitioned wedding, neutral, then Navratri/Garba');
  }
}
if (genericTiers.includes(0) && genericTiers[0] !== 0) {
  throw new Error('[navratri-traffic] Generic /lehengas is not led by available wedding/bridal intent');
}
const firstMerchandisingWindow = genericTiers.slice(0, 24);
const festiveTopCount = firstMerchandisingWindow.filter((tier) => tier === 2).length;
if (festiveTopCount > Math.floor(firstMerchandisingWindow.length * 0.25)) {
  throw new Error(`[navratri-traffic] Navratri/Garba products occupy ${festiveTopCount} of the first ${firstMerchandisingWindow.length} generic lehenga slots`);
}

requireText(collectionHtml, '<title>Navratri Outfits 2026 | Garba Styles | LuxeMia</title>', 'collection search title');
requireText(collectionHtml, '<link rel="canonical" href="https://luxemia.shop/collections/navratri-outfits"', 'collection canonical');
requireText(collectionHtml, '<h1>Navratri Outfits for Garba</h1>', 'collection H1');
requirePattern(collectionHtml, /"@type"\s*:\s*"CollectionPage"/, 'CollectionPage schema');
requirePattern(collectionHtml, /"@type"\s*:\s*"ItemList"/, 'ItemList schema');
requireText(collectionHtml, 'https://luxemia.shop/collections/navratri-outfits#itemlist', 'linked collection product schema');
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

const merchantProductHandles = new Set(
  [...feedXml.matchAll(/<item>[\s\S]*?<\/item>/gi)]
    .map((match) => match[0])
    .map((item) => {
      const link = item.match(/<g:link>([\s\S]*?)<\/g:link>/i)?.[1]?.replace(/&amp;/g, '&') || '';
      try {
        return new URL(link).pathname.match(/^\/product\/([a-z0-9][a-z0-9-]*)\/?$/i)?.[1] || '';
      } catch {
        return '';
      }
    })
    .filter(Boolean)
);
for (const handle of REQUIRED_NAVRATRI_PRODUCT_HANDLES) {
  if (!merchantProductHandles.has(handle)) {
    throw new Error(`[navratri-traffic] Merchant feed is missing published Navratri product ${handle}`);
  }
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

console.log(`[navratri-traffic] OK — ${collectionProductLinks.size} seasonal products including all ${REQUIRED_NAVRATRI_PRODUCT_HANDLES.length} published listings; generic /lehengas is wedding-led with ${festiveTopCount}/${firstMerchandisingWindow.length} explicit Navratri/Garba products in its first window; guide links, schema, Merchant coverage for every required listing, prerendering, and sitemaps verified.`);
