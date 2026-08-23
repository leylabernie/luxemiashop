#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const middlewarePath = path.join(root, 'middleware.ts');
const robotsPath = path.join(root, 'public', 'robots.txt');

const middleware = fs.readFileSync(middlewarePath, 'utf8');
const robots = fs.readFileSync(robotsPath, 'utf8');

const failures = [];
const requireText = (source, needle, label) => {
  if (!source.includes(needle)) failures.push(`Missing ${label}: ${needle}`);
};

requireText(middleware, 'INDEXATION_NOISE_PARAMS', 'query-noise parameter registry');
requireText(middleware, 'withCanonicalQuerySignals', 'HTTP query canonicalization helper');
requireText(middleware, "headers.set('Link'", 'HTTP Link canonical header');
requireText(middleware, "headers.set('X-Robots-Tag', 'noindex, follow')", 'facet noindex directive');
requireText(middleware, "rel=\"canonical\"", 'clean canonical relation');

const requiredNoiseParameters = [
  'sort_by',
  'filter',
  'grid',
  'q',
  'sub',
  'color',
  'fabric',
  'size',
  'price_min',
  'price_max',
];

for (const parameter of requiredNoiseParameters) {
  requireText(middleware, `'${parameter}'`, `indexation-noise parameter ${parameter}`);
}

const registryMatch = middleware.match(
  /const INDEXATION_NOISE_PARAMS[^=]*=\s*new Set(?:<string>)?\(\[([\s\S]*?)\]\);/,
);
if (!registryMatch) {
  failures.push('Could not parse INDEXATION_NOISE_PARAMS.');
} else if (/['"]variant['"]/.test(registryMatch[1])) {
  failures.push('variant must remain canonical-only; do not noindex or robots-block Merchant/product variant landing URLs.');
}

const queryDisallows = robots
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /^Disallow:/i.test(line) && line.includes('?'));

if (queryDisallows.length > 0) {
  failures.push(
    `robots.txt blocks query URLs before crawlers can read their canonical/noindex signals: ${queryDisallows.join(', ')}`,
  );
}

requireText(robots, '?variant=', 'variant crawl/canonical safeguard comment');
requireText(robots, 'Sitemap: https://luxemia.shop/sitemap.xml', 'authoritative sitemap declaration');

if (failures.length > 0) {
  console.error('Indexation recovery validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  'Indexation recovery validation passed: public query duplicates expose clean canonicals, facet/search noise is noindex/follow, variant URLs stay crawlable, and the canonical sitemap remains declared.',
);
