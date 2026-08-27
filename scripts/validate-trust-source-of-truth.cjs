#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HOME_TITLE = 'LuxeMia Ethnic Wear | Indian Wedding Sarees & Bridal Lehengas USA';
const HOME_DESCRIPTION = 'Shop authentic South Asian bridal wear, sarees, lehengas, suits and menswear with tracked shipping to the USA, Canada, UK and supported markets.';
const SHIPPING_TITLE = 'Shipping Policy & International Rates | LuxeMia';
const failures = [];

const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');

function requireFile(relative) {
  const file = path.join(ROOT, relative);
  if (!fs.existsSync(file)) {
    failures.push(`${relative} is missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function requireAll(relative, snippets) {
  const source = requireFile(relative);
  for (const snippet of snippets) {
    if (!source.includes(snippet)) failures.push(`${relative} missing required value: ${snippet}`);
  }
}

function sourceForCopyValidation(relative, rawSource) {
  if (relative !== 'src/lib/shopify.ts' && relative !== 'scripts/prerender.js') return rawSource;
  // These files intentionally contain regex sanitizers that recognize old copy
  // in incoming supplier descriptions. The pattern text is not emitted output.
  return rawSource
    .split('\n')
    .filter((line) => !line.includes('.replace(/'))
    .join('\n');
}

function block(relative, patterns) {
  const rawSource = requireFile(relative);
  const source = sourceForCopyValidation(relative, rawSource);
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (!match || match.index === undefined) continue;
    const line = source.slice(0, match.index).split('\n').length;
    const context = source
      .slice(Math.max(0, match.index - 70), Math.min(source.length, match.index + match[0].length + 90))
      .replace(/\s+/g, ' ')
      .trim();
    failures.push(`${relative}:${line} contains blocked value matching ${pattern}; context: ${context}`);
  }
}

requireAll('src/config/shippingPolicy.ts', [
  "SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU']",
  'US_STANDARD_SHIPPING_RATE = 14.99',
  'US_FREE_SHIPPING_THRESHOLD = 199',
  "id: 'canada-uk'",
  'standardRate: 24.99',
  'freeShippingThreshold: 299',
  "id: 'australia-new-zealand'",
  'standardRate: 29.99',
  'freeShippingThreshold: 349',
  "id: 'south-africa'",
  'standardRate: 49.99',
  "id: 'mauritius'",
  'standardRate: 59.99',
]);

requireAll('src/config/seoArchitecture.ts', [HOME_TITLE, HOME_DESCRIPTION]);
requireAll('src/config/seoArchitecture.json', [HOME_TITLE, HOME_DESCRIPTION]);
requireAll('src/lib/seoMetadata.ts', [
  SHIPPING_TITLE,
  'seven supported destination countries',
  'mandatory consumer rights',
]);
requireAll('src/components/seo/SEOHead.tsx', [
  HOME_TITLE,
  HOME_DESCRIPTION,
  'tracked shipping to seven supported countries',
]);
requireAll('src/App.tsx', [
  'const ReadyToShip = lazy',
  'path="/ready-to-ship"',
  '<ReadyToShip />',
  'path="/collections/ready-to-ship" element={<Navigate to="/ready-to-ship" replace />}',
  'path="/collections/earrings" element={<Navigate to="/jewelry" replace />}',
  'path="/collections/frontpage" element={<Navigate to="/" replace />}',
  'path="/collections/manthrakodi-sarees" element={<Navigate to="/sarees" replace />}',
]);
requireAll('src/pages/ReadyToShip.tsx', [
  'processingDays <= 3',
  'Processing is the time before dispatch',
  'View route-based rates',
]);
requireAll('src/lib/shopify.ts', [
  'shipsWithinDays?: number | null;',
  'function parseShipsWithinDays',
  'shipsWithinDays: parseShipsWithinDays(node.shipsWithinMetafield?.value)',
]);
requireAll('src/lib/schema.ts', [
  'export function generateReturnPolicySchema()',
  'return null;',
  "SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU']",
  "createService('us-standard-shipping'",
  "createService('canada-uk-standard-shipping'",
  "createService('australia-nz-standard-shipping'",
  "createService('south-africa-standard-shipping'",
  "createService('mauritius-standard-shipping'",
]);
requireAll('index.html', [
  HOME_TITLE,
  HOME_DESCRIPTION,
  '"ClothingStore"',
  'AUD, CAD, GBP, MUR, NZD, USD',
  'hello@luxemia.shop',
  '+1-215-341-9990',
]);
requireAll('scripts/prerender.js', [
  "...create(['CA', 'GB'], 24.99, 299)",
  "...create(['AU', 'NZ'], 29.99, 349)",
  "...create('ZA', 49.99)",
  "...create('MU', 59.99)",
]);

const blockedRuntimePatterns = [
  /MerchantReturnNotPermitted/i,
  /['"]@type['"]\s*:\s*['"]MerchantReturnPolicy['"]/i,
  /Glamour Indian Wear/i,
  /United States addresses only/i,
  /U\.S\. delivery only/i,
  /\$12[^\n]{0,100}(?:shipping|below \$150)/i,
  /free[^\n]{0,60}\$150/i,
  /International standard shipping is \$14\.99 below \$300/i,
  /LuxeMia — Indian Ethnic Wear Online for (?:US|U\.S\.) Delivery/i,
  /Free worldwide shipping/i,
  /All orders ship with full DHL Express tracking/i,
  /Custom sizing:\s*Available on request/i,
];

for (const relative of [
  'index.html',
  'src/config/seoArchitecture.ts',
  'src/config/seoArchitecture.json',
  'src/lib/seoMetadata.ts',
  'src/components/seo/SEOHead.tsx',
  'src/lib/schema.ts',
  'src/pages/Index.tsx',
  'src/pages/Shipping.tsx',
  'src/pages/ShippingCustoms.tsx',
  'src/pages/ReadyToShip.tsx',
  'src/pages/FAQ.tsx',
  'src/pages/Collections.tsx',
  'src/pages/NewArrivals.tsx',
  'src/lib/shopify.ts',
  'scripts/prerender.js',
  'public/llms.txt',
  'api/merchant-feed.ts',
]) {
  block(relative, blockedRuntimePatterns);
}

block('scripts/prerender.js', [
  /priceValidUntil\s*:/i,
  /mpn\s*:\s*(?:productSku|sku)\b/i,
]);

try {
  const ts = read('src/config/seoArchitecture.ts');
  const json = read('src/config/seoArchitecture.json').trim();
  const start = ts.indexOf('/* seo-architecture-json:start */');
  const end = ts.indexOf('/* seo-architecture-json:end */');
  const objectStart = ts.indexOf('{', start);
  const objectEnd = ts.lastIndexOf('}', end);
  if (start < 0 || end < 0 || objectStart < 0 || objectEnd < objectStart) {
    failures.push('src/config/seoArchitecture.ts JSON markers could not be parsed');
  } else {
    const tsObject = JSON.parse(ts.slice(objectStart, objectEnd + 1));
    const jsonObject = JSON.parse(json);
    if (JSON.stringify(tsObject) !== JSON.stringify(jsonObject)) {
      failures.push('src/config/seoArchitecture.ts and src/config/seoArchitecture.json are not identical');
    }
  }
} catch (error) {
  failures.push(`SEO architecture JSON validation failed: ${error.message}`);
}

try {
  const html = read('index.html');
  const scripts = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  if (scripts.length === 0) failures.push('index.html has no JSON-LD');
  for (const [index, match] of scripts.entries()) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const serialized = JSON.stringify(parsed);
      if (serialized.includes('MerchantReturnPolicy')) failures.push(`index.html JSON-LD block ${index + 1} contains MerchantReturnPolicy`);
      if (serialized.includes('Glamour Indian Wear')) failures.push(`index.html JSON-LD block ${index + 1} contains an unverified legal name`);
    } catch (error) {
      failures.push(`index.html JSON-LD block ${index + 1} is invalid JSON: ${error.message}`);
    }
  }
} catch (error) {
  failures.push(`index.html structured-data validation failed: ${error.message}`);
}

if (failures.length) {
  console.error('[trust-source] Validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[trust-source] OK — metadata, route shipping, Ready-to-Ship data, redirects and structured data use the final verified source of truth.');
