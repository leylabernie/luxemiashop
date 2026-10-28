#!/usr/bin/env node
// This is a fixed, owner-authorized batch guard, never an automatic age policy.
const fs = require('node:fs');
const path = require('node:path');
const plan = require('./product-age-archive-20261026.json');
const baseline = require('./product-retirement-20260908.json');
const root = path.resolve(__dirname, '../dist');
const archived = new Set([...plan.archived, ...require('./product-owner-archive-20261028.json').archived].map(p => p.handle));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sitemap = read('sitemap-products.xml');
const feed = read('merchant-feed.xml');
const paths = new Set([...sitemap.matchAll(/<loc>https:\/\/luxemia\.shop\/product\/([^<]+)<\/loc>/g)].map(m => m[1]));
for (const p of baseline.retained) {
  if (!paths.has(p.handle)) throw new Error(`Retained product missing from sitemap: ${p.handle}`);
  if (!feed.includes(`/product/${p.handle}&`) && !feed.includes(`/product/${p.handle}?`) && !feed.includes(`/product/${p.handle}<`)) {
    throw new Error(`Retained product missing from feed: ${p.handle}`);
  }
}
function check(file) {
  const text = fs.readFileSync(file, 'utf8');
  // Match full handles/paths only, not words or partial product names.
  for (const handle of archived) {
    if (new RegExp(`/product/${handle}(?=[?"'<&\\s]|$)`).test(text)) {
      throw new Error(`Archived shopping link/offer in ${path.relative(root, file)}: ${handle}`);
    }
  }
}
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) walk(file);
    else if (/\.(html|xml|csv|txt)$/.test(item.name)) check(file);
  }
}
walk(root);
for (const handle of archived) {
  if (fs.existsSync(path.join(root, '_prerender/product', `${handle}.html`))) throw new Error(`Archived static product remains: ${handle}`);
}
for (const handle of ['mirror-work-lehengas', 'customizable-indian-outfits']) {
  const route = `/collections/${handle}`;
  const empty = read(`_prerender${route}.html`);
  if (!/<meta[^>]*name="robots"[^>]*content="noindex, follow"/.test(empty)) throw new Error(`Empty ${handle} is indexable`);
  if (/"@type"\s*:\s*"(?:Product|ProductGroup|ItemList|CollectionPage)"/.test(empty)) throw new Error(`Empty ${handle} has shopping schema`);
  if (read('sitemap-collections.xml').includes(route)) throw new Error(`Empty ${handle} remains in sitemap`);
  for (const file of ['_prerender/index.html', '_prerender/lehengas.html', '_prerender/collections.html']) {
    if (read(file).includes(`href="${route}"`)) throw new Error(`Empty ${handle} shopping link in ${file}`);
  }
}
console.log(`[age-archive] Exact ${archived.size} archives absent from built HTML/public feeds; ${baseline.retained.length} survivors preserved; mirror and customizable collections safely empty.`);
