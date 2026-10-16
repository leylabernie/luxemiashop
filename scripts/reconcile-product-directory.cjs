#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');

// Run only after generate-sitemap.cjs has validated the completed build.
function reconcileDirectory(html, sitemapXml, readProductHtml) {
  const urls = [...sitemapXml.matchAll(/<loc>(https:\/\/luxemia\.shop\/product\/[a-zA-Z0-9-]+)<\/loc>/g)].map(m => m[1]);
  if (!urls.length || new Set(urls).size !== urls.length) throw new Error('Empty or duplicate product sitemap');
  const paths = new Set(urls.map(url => new URL(url).pathname));
  const existing = [...html.matchAll(/href="(\/product\/[^"]+)"/g)].map(m => m[1]);
  if (existing.some(p => !paths.has(p))) throw new Error('Directory contains a non-sitemap product; reconcile explicitly');
  const known = new Set(existing);
  const additions = urls.filter(url => !known.has(new URL(url).pathname)).map(url => {
    const route = new URL(url).pathname;
    const productHtml = readProductHtml(route);
    const canonicals = [...productHtml.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"[^>]*>/g)];
    const title = productHtml.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1];
    if (canonicals.length !== 1 || canonicals[0][1] !== url || /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(productHtml) || !title) {
      throw new Error(`Product failed directory checks: ${route}`);
    }
    return `<li><a href="${route}">${title}</a></li>`;
  });
  if (!/Browse all \d+ current product listings/.test(html)) throw new Error('Directory count marker missing');
  if (!html.includes('</main>')) throw new Error('Directory main marker missing');
  let result = html.replace(/Browse all \d+ current product listings/, `Browse all ${urls.length} current product listings`);
  if (additions.length) result = result.replace('</main>', `<section aria-label="Additional current products"><h2>More Current Products</h2><ul>${additions.join('')}</ul></section>\n</main>`);
  return result;
}

if (require.main === module) {
  const root = path.resolve(__dirname, '../dist');
  const directory = path.join(root, '_prerender/sitemap.html');
  const output = reconcileDirectory(fs.readFileSync(directory, 'utf8'), fs.readFileSync(path.join(root, 'sitemap-products.xml'), 'utf8'), route => fs.readFileSync(path.join(root, '_prerender', `${route.slice(1)}.html`), 'utf8'));
  fs.writeFileSync(directory, output);
  console.log('[directory] HTML product links reconciled with validated XML sitemap');
}
module.exports = { reconcileDirectory };
