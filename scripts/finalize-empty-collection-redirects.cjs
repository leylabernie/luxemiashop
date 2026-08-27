#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const file = path.join(ROOT, 'vercel.json');
const config = JSON.parse(fs.readFileSync(file, 'utf8'));

const expected = {
  '/collections/earrings': '/jewelry',
  '/collections/evening-gowns': '/collections',
  '/collections/frontpage': '/',
  '/collections/indo-western': '/indowestern',
  '/collections/jacket-sets': '/suits',
  '/collections/kurta-pajama-vest': '/menswear',
  '/collections/manthrakodi-sarees': '/sarees',
  '/collections/saree-gowns': '/sarees',
};

if (!Array.isArray(config.redirects)) {
  throw new Error('[empty-collection-redirects] vercel.json redirects array not found');
}

for (const [source, destination] of Object.entries(expected)) {
  const matches = config.redirects.filter((entry) => entry.source === source);
  if (matches.length !== 1) {
    throw new Error(`[empty-collection-redirects] Expected one ${source} redirect; found ${matches.length}`);
  }

  const redirect = matches[0];
  if (redirect.destination !== destination || redirect.statusCode !== 301) {
    throw new Error(
      `[empty-collection-redirects] Invalid ${source} redirect: ${JSON.stringify(redirect)}`,
    );
  }
}

console.log(
  `[empty-collection-redirects] ${Object.keys(expected).length} committed Vercel 301 redirects verified.`,
);
