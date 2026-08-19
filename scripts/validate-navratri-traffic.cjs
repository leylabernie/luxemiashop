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

function count(haystack, pattern) {
  return [...haystack.matchAll(pattern)].length;
}

const collectionPath = 'dist/_prerender/collections/navratri-outfits.html';
const articlePath = 'dist/_prerender/blog/navratri-9-day-color-guide-2026.html';
const homepagePath = 'dist/_prerender/index.html';
const collectionHtml = read(collectionPath);
const articleHtml = read(articlePath);
const homepageHtml = read(homepagePath);
const feedXml = read('dist/merchant-feed.xml');
const sitemapXml = read('dist/sitemap.xml');

requireText(collectionHtml, '<title>Navratri Outfits USA 2026 | Garba Styles | LuxeMia</title>', 'collection search title');
requireText(collectionHtml, '<link rel="canonical" href="https://luxemia.shop/collections/navratri-outfits"', 'collection canonical');
requireText(collectionHtml, '<h1>Navratri Outfits for Garba in the USA</h1>', 'collection H1');
requireText(collectionHtml, '"@type":"CollectionPage"', 'CollectionPage schema');
requireText(collectionHtml, '"@type":"ItemList"', 'ItemList schema');
requireText(collectionHtml, 'https://luxemia.shop/collections/navratri-outfits#products', 'linked collection product schema');
requireText(collectionHtml, '/blog/navratri-9-day-color-guide-2026', 'collection-to-guide internal link');
requireText(collectionHtml, 'WELCOME10', 'collection first-order offer');

const collectionProductLinks = new Set(
  [...collectionHtml.matchAll(/href="\/product\/([^"?]+)"/g)].map((match) => match[1])
);
if (collectionProductLinks.size < 12) {
  throw new Error(`[navratri-traffic] Collection prerender contains only ${collectionProductLinks.size} unique product links`);
}

requireText(articleHtml, '<title>Navratri 2026 USA: Garba &amp; Chaniya Choli Guide | LuxeMia</title>', 'article search title');
requireText(articleHtml, '<link rel="canonical" href="https://luxemia.shop/blog/navratri-9-day-color-guide-2026"', 'article canonical');
requireText(articleHtml, 'dateModified":"2026-08-19"', 'article review date');
requireText(articleHtml, 'https://www.timeanddate.com/holidays/us/hindu-navaratri', 'United States date source');
requireText(articleHtml, 'href="/collections/navratri-outfits"', 'guide-to-collection internal link');
requireText(articleHtml, 'WELCOME10', 'article first-order offer');

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
]) {
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const occurrences = count(sitemapXml, new RegExp(`<loc>${escaped}<\\/loc>`, 'g'));
  if (occurrences !== 1) {
    throw new Error(`[navratri-traffic] Sitemap must contain ${url} exactly once; found ${occurrences}`);
  }
}

console.log(`[navratri-traffic] OK — ${collectionProductLinks.size} collection products, bidirectional guide links, CollectionPage/ItemList schema, 30 Merchant priority groups, full product-type hierarchy, and sitemap coverage verified.`);
