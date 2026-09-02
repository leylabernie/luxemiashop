#!/usr/bin/env node
/**
 * Production guard for product-discovery uniqueness.
 *
 * Search engines should not receive multiple approved product URLs with the
 * same title, meta description, or primary visible product description. The
 * prerender pipeline adds a verified product style reference when otherwise
 * similar products have distinct SKU families. This validator makes that
 * distinction mandatory for every approved product URL.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PRERENDER_ROOT = path.join(ROOT, 'dist/_prerender');
const INVENTORY_PATH = path.join(ROOT, 'scripts/approved-sitemap-inventory.json');

function decodeHtml(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function normalizeText(value) {
  return decodeHtml(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function getAttribute(tag, attribute) {
  const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tag.match(new RegExp(`\\b${escaped}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match?.[2] ?? '';
}

function extractTitle(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '';
}

function extractMetaDescription(html) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    if (getAttribute(tag, 'name').toLowerCase() === 'description') {
      return getAttribute(tag, 'content');
    }
  }
  return '';
}

function extractVisibleProductDescription(html) {
  const main = html.match(/<main\b[^>]*id=["']seo-prerender["'][^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  return main.match(/<h2>Product Description<\/h2>\s*<p>([\s\S]*?)<\/p>/i)?.[1] ?? '';
}

function collectDuplicateGroups(records, field) {
  const groups = new Map();
  for (const record of records) {
    const value = record[field];
    if (!value) continue;
    const group = groups.get(value) ?? [];
    group.push(record.route);
    groups.set(value, group);
  }
  return [...groups.entries()]
    .filter(([, routes]) => routes.length > 1)
    .map(([value, routes]) => ({ value, routes }));
}

if (!fs.existsSync(INVENTORY_PATH)) {
  throw new Error(`[product-uniqueness] Missing approved inventory: ${INVENTORY_PATH}`);
}

const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
const productRoutes = (inventory.paths ?? []).filter((route) => route.startsWith('/product/'));
if (productRoutes.length === 0) {
  throw new Error('[product-uniqueness] Approved inventory contains no product routes.');
}

const records = [];
const failures = [];
for (const route of productRoutes) {
  const filePath = path.join(PRERENDER_ROOT, `${route.slice(1)}.html`);
  if (!fs.existsSync(filePath)) {
    failures.push(`${route}: prerender file is missing`);
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const title = normalizeText(extractTitle(html));
  const metaDescription = normalizeText(extractMetaDescription(html));
  const productDescription = normalizeText(extractVisibleProductDescription(html));

  if (!title) failures.push(`${route}: title is missing`);
  if (!metaDescription) failures.push(`${route}: meta description is missing`);
  if (!productDescription) failures.push(`${route}: visible product description is missing`);

  records.push({ route, title, metaDescription, productDescription });
}

for (const field of ['title', 'metaDescription', 'productDescription']) {
  for (const group of collectDuplicateGroups(records, field)) {
    failures.push(
      `${field} duplicate (${group.routes.length}): ${group.routes.join(', ')} :: ${group.value.slice(0, 180)}`,
    );
  }
}

if (failures.length > 0) {
  console.error(`[product-uniqueness] FAILED — ${failures.length} product discovery issue(s).`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log(
  `[product-uniqueness] OK — ${records.length} approved product pages have unique titles, meta descriptions, and visible product descriptions.`,
);
