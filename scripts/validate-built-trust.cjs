#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const HOME_TITLE = 'LuxeMia Ethnic Wear | Indian Wedding Sarees & Bridal Lehengas USA';
const HOME_DESCRIPTION = 'Shop authentic South Asian bridal wear, wedding sarees, lehengas, salwar kameez and menswear with tracked shipping to the USA, Canada, UK and other supported markets.';
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

function readBuilt(relative) {
  const candidates = [
    path.join(DIST, relative),
    path.join(DIST, relative.replace(/\/index\.html$/, '.html')),
  ];
  const file = candidates.find((candidate) => fs.existsSync(candidate));
  if (!file) {
    failures.push(`built route missing: ${relative}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function requireAll(label, source, snippets) {
  for (const snippet of snippets) {
    if (!source.includes(snippet)) failures.push(`${label} missing required built value: ${snippet}`);
  }
}

function inspectJsonLd(label, source) {
  const scripts = [...source.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  if (scripts.length === 0) failures.push(`${label} has no JSON-LD blocks`);
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

if (!fs.existsSync(DIST)) {
  console.error('[built-trust] dist directory does not exist');
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
];

for (const file of allHtmlFiles) {
  const relative = path.relative(DIST, file).replace(/\\/g, '/');
  const source = fs.readFileSync(file, 'utf8');
  for (const pattern of blocked) {
    const match = source.match(pattern);
    if (!match || match.index === undefined) continue;
    const line = source.slice(0, match.index).split('\n').length;
    failures.push(`${relative}:${line} contains blocked built value matching ${pattern}`);
  }
  inspectJsonLd(relative, source);
}

const home = readBuilt('index.html');
requireAll('home', home, [
  `<title>${HOME_TITLE}</title>`,
  HOME_DESCRIPTION,
  '"ClothingStore"',
  'AUD, CAD, GBP, MUR, NZD, USD',
  'hello@luxemia.shop',
  '+1-215-341-9990',
]);

const shipping = readBuilt('shipping/index.html');
requireAll('shipping', shipping, [
  `<title>${SHIPPING_TITLE}</title>`,
  '$14.99',
  '$199',
  '$24.99',
  '$299',
  '$29.99',
  '$349',
  '$49.99',
  '$59.99',
  'Canada',
  'United Kingdom',
  'South Africa',
  'Mauritius',
]);

const ready = readBuilt('ready-to-ship/index.html');
requireAll('ready-to-ship', ready, [
  'Ready-to-Ship Indian Ethnic Wear',
  'Processing is the time before dispatch',
  'View route-based rates',
]);

const collectionRedirectTargets = [
  'collections/earrings/index.html',
  'collections/frontpage/index.html',
  'collections/manthrakodi-sarees/index.html',
];
for (const relative of collectionRedirectTargets) {
  const file = path.join(DIST, relative);
  if (fs.existsSync(file)) {
    const source = fs.readFileSync(file, 'utf8');
    if (!/noindex/i.test(source) && !/http-equiv=["']refresh/i.test(source)) {
      failures.push(`${relative} exists without a noindex or redirect signal`);
    }
  }
}

if (failures.length) {
  console.error('[built-trust] Validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`[built-trust] OK — ${allHtmlFiles.length} built HTML pages have aligned metadata, route-based shipping, Ready-to-Ship output and no false global return schema.`);
