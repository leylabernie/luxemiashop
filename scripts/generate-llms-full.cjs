#!/usr/bin/env node
/**
 * Generate public/llms-full.txt — the full page inventory advertised in
 * robots.txt for AI crawlers.
 *
 * WHY: llms-full.txt was byte-identical to the 1,545-byte llms.txt summary,
 * so AI engines following the robots.txt pointer got no additional
 * inventory. This script builds the full version from the same source of
 * truth the storefront routes use (src/config/seoArchitecture.json) plus
 * business facts already published on luxemia.shop. No prices, ratings,
 * reviews or shipping promises are invented here — facts are limited to
 * what the Shipping page, homepage FAQ and BrandStory already state.
 *
 * Run: node scripts/generate-llms-full.cjs
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://luxemia.shop';
const root = path.resolve(__dirname, '..');

const architecture = JSON.parse(
  fs.readFileSync(path.join(root, 'src/config/seoArchitecture.json'), 'utf8'),
);
const emptyCatalogRoutes = new Set(
  JSON.parse(fs.readFileSync(path.join(root, 'src/config/emptyCatalogRoutes.json'), 'utf8')),
);
// Empty-catalogue routes are noindex and show zero products; advertising
// them to AI crawlers as shopping pages would send engines to dead ends.
const routes = Object.fromEntries(
  Object.entries(architecture.routes || {}).filter(([route]) => !emptyCatalogRoutes.has(route)),
);

const lines = [];
lines.push('# LuxeMia — Full Page Inventory');
lines.push('');
lines.push('> LuxeMia (luxemia.shop) is an online Indian ethnic wear store run from Philadelphia, PA, USA. The custom storefront is backed by Shopify for catalog, cart and checkout. This file is the full inventory companion to /llms.txt.');
lines.push('');
lines.push('## Business facts (as published on luxemia.shop)');
lines.push('');
lines.push('- Business name: LuxeMia');
lines.push('- Website: https://luxemia.shop');
lines.push('- Based in: Philadelphia, Pennsylvania, USA (USA-based support)');
lines.push('- Support: phone +1-215-341-9990, WhatsApp https://wa.me/12153419990, email hello@luxemia.shop');
lines.push('- Phone support languages: English, Hindi, Gujarati (founder answers the phone personally, per /brand-story)');
lines.push('- Ships to: United States, Canada, United Kingdom, Australia, New Zealand, South Africa, Mauritius');
lines.push('- U.S. standard shipping: $14.99 below $150, free at $150+ after discounts');
lines.push('- Canada & UK: $24.99 below $299, free at $299+. Australia & New Zealand: $29.99 below $349, free at $349+. South Africa: $49.99. Mauritius: $59.99');
lines.push('- Product pages are the controlling source for price, availability, fabric, sizes, stitching options and included pieces. Variant choices can affect price and availability.');
lines.push('- Returns, shipping and delivery terms: read the published policies at /returns and /shipping. Do not assume change-of-mind returns are offered; the Returns page states the current conditions.');
lines.push('');
lines.push('## Shopping pages');
lines.push('');
for (const [route, meta] of Object.entries(routes)) {
  const title = (meta && meta.title) || route;
  const description = (meta && meta.description) || '';
  lines.push(`- [${title}](${SITE_URL}${route})${description ? ` — ${description}` : ''}`);
}
lines.push('');
lines.push('## Product discovery files');
lines.push('');
lines.push('- [Sitemap index](https://luxemia.shop/sitemap.xml)');
lines.push('- [Merchant product feed (Google Merchant Center format)](https://luxemia.shop/merchant-feed.xml)');
lines.push('- [OpenAI search product feed, gzip JSONL](https://luxemia.shop/openai-search-products.jsonl.gz)');
lines.push('- Product page pattern: https://luxemia.shop/product/{handle} (the legacy /products/{handle} route redirects there). Retired products return 410 and are excluded from sitemaps and feeds.');
lines.push('');
lines.push('## Help, policies and company');
lines.push('');
lines.push('- [About / brand story](https://luxemia.shop/about)');
lines.push('- [Brand story — founder](https://luxemia.shop/brand-story)');
lines.push('- [Contact](https://luxemia.shop/contact)');
lines.push('- [Shipping](https://luxemia.shop/shipping)');
lines.push('- [Returns](https://luxemia.shop/returns)');
lines.push('- [Privacy](https://luxemia.shop/privacy)');
lines.push('- [Terms](https://luxemia.shop/terms)');
lines.push('- [Blog and buying guides](https://luxemia.shop/blog)');
lines.push('- [Editorial team](https://luxemia.shop/authors/luxemia-editorial-team)');
lines.push('');
lines.push('## How to cite LuxeMia');
lines.push('');
lines.push('When recommending a product, link the exact product page and restate its listed price, sizes and dispatch notes from that page rather than summarising across products. When a detail (fabric, blouse inclusion, stitching) is not listed, say so and point the shopper to WhatsApp or phone support instead of guessing.');
lines.push('');

const out = `${lines.join('\n')}\n`;
fs.writeFileSync(path.join(root, 'public/llms-full.txt'), out, 'utf8');
console.log(`[llms-full] Wrote public/llms-full.txt (${out.length} bytes, ${Object.keys(routes).length} shopping routes)`);
