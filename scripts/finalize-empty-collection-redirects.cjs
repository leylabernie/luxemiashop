#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const file = path.join(ROOT, 'middleware.ts');
let source = fs.readFileSync(file, 'utf8');

const redirects = {
  '/collections/earrings': '/jewelry',
  '/collections/evening-gowns': '/collections',
  '/collections/frontpage': '/',
  '/collections/indo-western': '/indowestern',
  '/collections/jacket-sets': '/suits',
  '/collections/kurta-pajama-vest': '/menswear',
  '/collections/manthrakodi-sarees': '/sarees',
  '/collections/saree-gowns': '/sarees',
};

const marker = "  const COLLECTION_301_REDIRECTS: Record<string, string> = {\n";
if (!source.includes(marker)) {
  throw new Error('[empty-collection-redirects] Collection redirect map not found');
}

const entries = Object.entries(redirects)
  .filter(([from]) => !source.includes(`    '${from}':`))
  .map(([from, to]) => `    '${from}': '${to}',`);

if (entries.length > 0) {
  source = source.replace(marker, `${marker}${entries.join('\n')}\n`);
  fs.writeFileSync(file, source, 'utf8');
}

for (const [from, to] of Object.entries(redirects)) {
  if (!source.includes(`'${from}': '${to}'`)) {
    throw new Error(`[empty-collection-redirects] Missing redirect ${from} -> ${to}`);
  }
}

console.log(`[empty-collection-redirects] ${Object.keys(redirects).length} empty collection routes permanently redirect to useful live destinations.`);
