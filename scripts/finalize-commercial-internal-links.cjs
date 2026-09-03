#!/usr/bin/env node
/**
 * Replace the generic editorial link block on prerendered product pages with
 * purchase-intent navigation. Product pages should pass internal authority to
 * shoppable collections and assisted-order paths rather than sitewide designer
 * profiles or glossary articles.
 */

const fs = require('fs');
const path = require('path');

const PRERENDER_ROOT = path.resolve(__dirname, '../dist/_prerender');
const PRODUCT_ROOT = path.join(PRERENDER_ROOT, 'product');
const APPROVED_INVENTORY_PATH = path.resolve(__dirname, 'approved-sitemap-inventory.json');

const COMMERCIAL_LINKS = [
  ['/ready-to-ship', 'Ready-to-Ship Indian Outfits'],
  ['/collections/wedding-guest-outfits', 'Indian Wedding Guest Outfits'],
  ['/collections/bridal-lehengas', 'Bridal Lehengas'],
  ['/collections/wedding-sarees', 'Wedding Sarees'],
  ['/collections/sharara-suits', 'Sharara Suits'],
  ['/menswear', "Men's Wedding Wear"],
  ['/wedding-party-orders', 'Wedding Party & Group Orders'],
];

const EDITORIAL_BLOCK = /<nav aria-label="Featured shopping guides">[\s\S]*?<\/nav>/g;
const REPLACEMENT_BLOCK = `      <nav aria-label="Shop purchase-intent collections">
        ${COMMERCIAL_LINKS.map(([href, label]) => `<a href="${href}">${label}</a>`).join(' |\n        ')}
      </nav>`;

function walkHtmlFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkHtmlFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(fullPath);
  }
  return files;
}

if (!fs.existsSync(PRODUCT_ROOT)) {
  throw new Error(`[commercial-links] Product prerender directory not found: ${PRODUCT_ROOT}`);
}

const approvedPaths = new Set(
  JSON.parse(fs.readFileSync(APPROVED_INVENTORY_PATH, 'utf8')).paths,
);
for (const [href] of COMMERCIAL_LINKS) {
  if (!approvedPaths.has(href)) {
    throw new Error(`[commercial-links] Commercial destination is not in the approved sitemap inventory: ${href}`);
  }
}

const productFiles = walkHtmlFiles(PRODUCT_ROOT);
if (productFiles.length === 0) {
  throw new Error('[commercial-links] No prerendered product files were found.');
}

let changed = 0;
let alreadyAligned = 0;
for (const filePath of productFiles) {
  const source = fs.readFileSync(filePath, 'utf8');
  if (!source.includes('aria-label="Featured shopping guides"')) {
    if (!source.includes('aria-label="Shop purchase-intent collections"')) {
      throw new Error(`[commercial-links] Product page contains neither the legacy nor approved commercial navigation: ${filePath}`);
    }
    alreadyAligned += 1;
    continue;
  }

  const output = source.replace(EDITORIAL_BLOCK, REPLACEMENT_BLOCK);
  if (output === source) {
    throw new Error(`[commercial-links] Failed to replace the editorial block in ${filePath}`);
  }
  if (output.includes('aria-label="Featured shopping guides"')) {
    throw new Error(`[commercial-links] Legacy editorial navigation remains in ${filePath}`);
  }
  if (!output.includes('aria-label="Shop purchase-intent collections"')) {
    throw new Error(`[commercial-links] Commercial navigation is missing from ${filePath}`);
  }

  fs.writeFileSync(filePath, output, 'utf8');
  changed += 1;
}

console.log(
  `[commercial-links] Replaced editorial navigation with purchase-intent links on ${changed} product pages; ${alreadyAligned} product pages were already aligned.`,
);
