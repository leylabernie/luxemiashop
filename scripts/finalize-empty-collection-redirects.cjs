#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const file = path.join(ROOT, 'middleware.ts');
const source = fs.readFileSync(file, 'utf8');

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

for (const [from, to] of Object.entries(redirects)) {
  const committedEntry = `    '${from}': '${to}',`;
  if (!source.includes(committedEntry)) {
    throw new Error(`[empty-collection-redirects] Missing committed redirect ${from} -> ${to}`);
  }
}

console.log(`[empty-collection-redirects] ${Object.keys(redirects).length} committed middleware redirects verified.`);
