#!/usr/bin/env node
/*
 * Fail fast when a retired-product lifecycle is unsafe.
 *
 * A deleted product must have one of two deliberate outcomes:
 *   1. A verified one-to-one product 301 in middleware.ts, or
 *   2. Inclusion in legacyGoneProductHandles.json for a real 410 Gone response.
 *
 * The sitemap must contain final, active, indexable product URLs only. This
 * validator protects that invariant before Vite bundles middleware.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const fail = (label, values) => {
  if (values.length === 0) return;
  throw new Error(`${label}: ${values.slice(0, 20).join(', ')}${values.length > 20 ? ` (+${values.length - 20} more)` : ''}`);
};

function parseProductRedirects(source) {
  const block = source.match(/const PRODUCT_301_REDIRECTS:\s*Record<string, string>\s*=\s*\{([\s\S]*?)\n\};/);
  if (!block) throw new Error('PRODUCT_301_REDIRECTS block was not found in middleware.ts.');
  const redirects = {};
  const re = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = re.exec(block[1]))) redirects[match[1]] = match[2];
  return redirects;
}

function main() {
  const inventory = JSON.parse(read('scripts/approved-sitemap-inventory.json'));
  const activeProductPaths = new Set((inventory.paths || []).filter((value) => value.startsWith('/product/')));
  const retiredProductPaths = new Set(
    JSON.parse(read('src/data/legacyGoneProductHandles.json')).map((handle) => `/product/${handle}`)
  );
  const redirects = parseProductRedirects(read('middleware.ts'));
  const redirectSources = Object.keys(redirects);
  const redirectTargets = Object.values(redirects);

  fail('Active sitemap product URL is also marked retired', [...activeProductPaths].filter((value) => retiredProductPaths.has(value)));
  fail('Retired product URL still appears in the approved sitemap inventory', [...retiredProductPaths].filter((value) => activeProductPaths.has(value)));
  fail('Product 301 source still appears in the approved sitemap inventory', redirectSources.filter((value) => activeProductPaths.has(value)));
  fail('Product 301 destination is not an active approved sitemap product', redirectTargets.filter((value) => !activeProductPaths.has(value)));
  fail('Product 301 destination is also marked retired', redirectTargets.filter((value) => retiredProductPaths.has(value)));
  fail('Product 301 contains a non-product source', redirectSources.filter((value) => !value.startsWith('/product/')));
  fail('Product 301 contains a non-product destination', redirectTargets.filter((value) => !value.startsWith('/product/')));

  console.log(
    `[retirement-lifecycle] OK — ${retiredProductPaths.size} retired product routes, ` +
    `${redirectSources.length} verified one-to-one redirects, and ${activeProductPaths.size} active sitemap products are mutually consistent.`
  );
}

try {
  main();
} catch (error) {
  console.error(`[retirement-lifecycle] ${error.message}`);
  process.exitCode = 1;
}
