#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PRERENDER = path.join(DIST, '_prerender');
const HOME_TITLE = 'LuxeMia Ethnic Wear | Indian Wedding Sarees & Bridal Lehengas USA';
const HOME_DESCRIPTION = 'Shop authentic South Asian bridal wear, sarees, lehengas, suits and menswear with tracked shipping to the USA, Canada, UK and supported markets.';
const SHIPPING_TITLE = 'Shipping Policy & International Rates | LuxeMia';
const failures = [];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(file);
    return entry.name.endsWith('.html') ? [file] : [];
  });
}

function readPrerender(route) {
  const relative = route === '/' ? 'index.html' : `${route.replace(/^\//, '')}.html`;
  const file = path.join(PRERENDER, relative);
  if (!fs.existsSync(file)) {
    failures.push(`built prerender route missing: ${route}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function requireAll(label, source, snippets) {
  for (const snippet of snippets) {
    if (!source.includes(snippet)) failures.push(`${label} missing required built value: ${snippet}`);
  }
}

function requireTitle(label, source, title) {
  const escaped = title.replace(/&/g, '&amp;');
  if (!source.includes(`<title>${title}</title>`) && !source.includes(`<title>${escaped}</title>`)) {
    failures.push(`${label} missing required built title: ${title}`);
  }
}

function inspectJsonLd(label, source, required = false) {
  const scripts = [...source.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  if (required && scripts.length === 0) failures.push(`${label} has no JSON-LD blocks`);
  for (const [index, match] of scripts.entries()) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const serialized = JSON.stringify(parsed);
      if (serialized.includes('MerchantReturnPolicy')) failures.push(`${label} JSON-LD block ${index + 1} contains MerchantReturnPolicy`);
      if (serialized.includes('MerchantReturnNotPermitted')) failures.push(`${label} JSON-LD block ${index + 1} contains MerchantReturnNotPermitted`);
      if (serialized.includes('Glamour Indian Wear')) failures.push(`${label} JSON-LD block ${index + 1} contains unverified legal name`);
      if (serialized.includes('priceValidUntil')) failures.push(`${label} JSON-LD block ${index + 1} contains unsupported priceValidUntil`);
    } catch (error) {
      failures.push(`${label} JSON-LD block ${index + 1} is invalid JSON: ${error.message}`);
    }
  }
}

if (!fs.existsSync(PRERENDER)) {
  console.error('[built-trust] prerender directory does not exist');
  process.exit(1);
}

const allHtmlFiles = walk(DIST);
if (allHtmlFiles.length === 0) failures.push('dist contains no HTML files');

const blocked = [
  /MerchantReturnNotPermitted/i,
  /['"]@type['"]\s*:\s*['"]MerchantReturnPolicy['"]/i,
  /Glamour Indian Wear/i,
  /United States addresses only/i,
  /U\.S\. delivery only/i,
  /\$12[^\n]{0,100}(?:shipping|below \$150)/i,
  /free[^\n]{0,60}\$150/i,
  /International standard shipping is \$14\.99 below \$300/i,
  /Free worldwide shipping/i,
  /Free standard shipping on orders over \$350 to USA, Canada, and Australia/i,
  /All orders ship with full DHL Express tracking/i,
  /Custom sizing:\s*Available on request/i,
  /LuxeMia — Indian Ethnic Wear Online for (?:US|U\.S\.) Delivery/i,
  /priceValidUntil/i,
  /published 1[–-]3 business-day processing/i,
  /processing window of three business days or less/i,
];

for (const file of allHtmlFiles) {
  const relative = path.relative(DIST, file).replace(/\\/g, '/');
  const source = fs.readFileSync(file, 'utf8');
  for (const pattern of blocked) {
    const match = source.match(pattern);
    if (!match || match.index === undefined) continue;
    const line = source.slice(0, match.index).split('\n').length;
    const context = source.slice(Math.max(0, match.index - 90), Math.min(source.length, match.index + match[0].length + 110)).replace(/\s+/g, ' ').trim();
    failures.push(`${relative}:${line} contains blocked built value matching ${pattern}; context: ${context}`);
  }
  inspectJsonLd(relative, source);
}

const home = readPrerender('/');
requireTitle('home', home, HOME_TITLE);
requireAll('home', home, [HOME_DESCRIPTION, '"ClothingStore"', 'AUD, CAD, GBP, MUR, NZD, USD', 'hello@luxemia.shop', '+1-215-341-9990']);
inspectJsonLd('home', home, true);

const shipping = readPrerender('/shipping');
requireTitle('shipping', shipping, SHIPPING_TITLE);
requireAll('shipping', shipping, ['$14.99', '$199', '$24.99', '$299', '$29.99', '$349', '$49.99', '$59.99', 'Canada', 'United Kingdom', 'South Africa', 'Mauritius']);
inspectJsonLd('shipping', shipping, true);

const ready = readPrerender('/ready-to-ship');
requireAll('ready-to-ship', ready, [
  'Ready-to-Ship Indian Ethnic Wear',
  'Every purchasable LuxeMia catalog item is Ready to Ship',
  'Custom Size, Custom Stitching or Made-to-Measure selection',
  'Processing and carrier transit are separate',
  'View route-based rates',
]);
inspectJsonLd('ready-to-ship', ready, true);

const readyProductLinks = new Set(
  [...ready.matchAll(/href="\/product\/([^"?]+)"/g)].map((match) => match[1]),
);
if (readyProductLinks.size < 40) {
  failures.push(`ready-to-ship must contain at least 40 stocked product links; found ${readyProductLinks.size}`);
}

if (failures.length) {
  console.error('[built-trust] Validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`[built-trust] OK — ${allHtmlFiles.length} built HTML pages have aligned metadata, route-based shipping, stocked Ready-to-Ship versus Made-to-Order classification and no false global return schema.`);