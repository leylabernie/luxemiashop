#!/usr/bin/env node
/**
 * Post-build Search Console cleanup.
 *
 * This runs after prerendering and before sitemap/feed publication. It fixes the
 * issues Google reported in exported Search Console files:
 * - FAQ rich result: duplicate FAQPage JSON-LD on /faq static output.
 * - Merchant listings: Product JSON-LD with a missing or empty image field.
 *
 * It is intentionally conservative: it only edits built HTML inside dist/.
 */
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '../dist');
const FALLBACK_IMAGE = 'https://luxemia.shop/og-image.jpg';

function walkHtmlFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

function isType(node, type) {
  const nodeType = node && node['@type'];
  return nodeType === type || (Array.isArray(nodeType) && nodeType.includes(type));
}

function hasTypeDeep(node, type) {
  if (!node || typeof node !== 'object') return false;
  if (isType(node, type)) return true;
  if (Array.isArray(node)) return node.some(item => hasTypeDeep(item, type));
  if (Array.isArray(node['@graph'])) return node['@graph'].some(item => hasTypeDeep(item, type));
  return false;
}

function ensureProductImages(node) {
  if (!node || typeof node !== 'object') return false;

  let changed = false;

  if (Array.isArray(node)) {
    for (const item of node) {
      if (ensureProductImages(item)) changed = true;
    }
    return changed;
  }

  if (isType(node, 'Product')) {
    const image = node.image;
    const hasImage = Array.isArray(image)
      ? image.some(item => typeof item === 'string' && item.trim().length > 0)
      : typeof image === 'string' && image.trim().length > 0;

    if (!hasImage) {
      node.image = [FALLBACK_IMAGE];
      changed = true;
    }
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === 'object' && ensureProductImages(value)) {
      changed = true;
    }
  }

  return changed;
}

function isFaqStaticOutput(filePath) {
  const normalized = filePath.split(path.sep).join('/');
  return normalized.endsWith('/faq.html') || normalized.endsWith('/_prerender/faq.html');
}

function fixHtmlFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  let removedFaqScripts = 0;
  let productImagesFixed = 0;

  html = html.replace(/<script\b([^>]*type=["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, rawJson) => {
    let parsed;
    try {
      parsed = JSON.parse(rawJson.trim());
    } catch {
      return match;
    }

    if (isFaqStaticOutput(filePath) && hasTypeDeep(parsed, 'FAQPage')) {
      removedFaqScripts += 1;
      changed = true;
      return '';
    }

    if (ensureProductImages(parsed)) {
      productImagesFixed += 1;
      changed = true;
      return `<script${attrs}>${JSON.stringify(parsed)}</script>`;
    }

    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
  }

  return { changed, removedFaqScripts, productImagesFixed };
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.warn(`[search-console-fix] dist directory not found: ${DIST_DIR}`);
    return;
  }

  const files = walkHtmlFiles(DIST_DIR);
  let changedFiles = 0;
  let removedFaqScripts = 0;
  let productImagesFixed = 0;

  for (const file of files) {
    const result = fixHtmlFile(file);
    if (result.changed) changedFiles += 1;
    removedFaqScripts += result.removedFaqScripts;
    productImagesFixed += result.productImagesFixed;
  }

  console.log(`[search-console-fix] Scanned ${files.length} HTML files.`);
  console.log(`[search-console-fix] Updated ${changedFiles} files; removed ${removedFaqScripts} duplicate-prone FAQPage scripts; fixed ${productImagesFixed} Product image schemas.`);
}

main();
