#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const failures = [];
const requireAll = (relative, snippets) => {
  const source = read(relative);
  for (const snippet of snippets) {
    if (!source.includes(snippet)) failures.push(`${relative} missing: ${snippet}`);
  }
};

requireAll('package.json', [
  'node scripts/apply-route-based-shipping-growth.cjs',
  'node scripts/apply-route-shipping-seo-fix.cjs',
  'node scripts/validate-route-based-shipping.cjs',
]);
requireAll('src/config/shippingPolicy.ts', [
  'US_FREE_SHIPPING_THRESHOLD = 199',
  'standardRate: 24.99',
  'standardRate: 29.99',
  'standardRate: 49.99',
  'standardRate: 59.99',
]);
requireAll('src/pages/Shipping.tsx', [
  'Standard Shipping Rates',
  'Processing and carrier transit are stated separately',
  'Express service is never assumed',
]);
requireAll('src/pages/ShippingCustoms.tsx', [
  'International Shipping, Duties & Taxes',
  'Do not assume an international parcel is duty paid',
]);
requireAll('src/pages/ReadyToShip.tsx', [
  'processingDays <= 3',
  'Processing is the time before dispatch',
]);
requireAll('src/pages/Index.tsx', [
  'id="shop-by-need-heading"',
  'Tracked delivery to 7 countries',
  'LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius',
]);
requireAll('src/components/cart/CartDrawer.tsx', [
  'US_FREE_SHIPPING_THRESHOLD',
  'Destination, local-currency conversion, duties and final delivery options are confirmed at checkout.',
]);
requireAll('src/config/seoArchitecture.ts', [
  'LuxeMia Ethnic Wear | Indian Wedding Sarees & Bridal Lehengas USA',
  'tracked shipping to the USA, Canada, UK and other supported markets',
]);
requireAll('src/config/seoArchitecture.json', [
  'LuxeMia Ethnic Wear | Indian Wedding Sarees & Bridal Lehengas USA',
]);
requireAll('src/lib/schema.ts', [
  "SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU']",
  "createService('us-standard-shipping'",
  "createService('canada-uk-standard-shipping'",
  "createService('australia-nz-standard-shipping'",
  "createService('south-africa-standard-shipping'",
  "createService('mauritius-standard-shipping'",
]);
requireAll('scripts/prerender.js', [
  "...create(['CA', 'GB'], 24.99, 299)",
  "...create(['AU', 'NZ'], 29.99, 349)",
  "...create('ZA', 49.99)",
  "...create('MU', 59.99)",
]);
requireAll('index.html', [
  'LuxeMia Ethnic Wear | Indian Wedding Sarees & Bridal Lehengas USA',
  'https://luxemia.shop/#canada-uk-standard-shipping',
  'https://luxemia.shop/#australia-nz-standard-shipping',
  'https://luxemia.shop/#south-africa-standard-shipping',
  'https://luxemia.shop/#mauritius-standard-shipping',
  '"ClothingStore"',
]);

const blocked = [
  /MerchantReturnPolicy/i,
  /MerchantReturnNotPermitted/i,
  /Glamour Indian Wear/i,
  /United States addresses only/i,
  /U\.S\. delivery only/i,
  /\$12[^\n]{0,80}(?:shipping|below \$150)/i,
  /free[^\n]{0,50}\$150/i,
  /International standard shipping is \$14\.99 below \$300/i,
];

const removeSanitizerRegexLiterals = (source) => source
  .split('\n')
  .map((line) => line.includes('.replace(/')
    ? line.replace(/\.replace\(\/.*\/[dgimsuvy]*,\s*/, '.replace(<legacy-pattern>, ')
    : line)
  .join('\n');

for (const relative of [
  'index.html',
  'src/pages/Index.tsx',
  'src/pages/Shipping.tsx',
  'src/pages/ShippingCustoms.tsx',
  'src/pages/ReadyToShip.tsx',
  'src/components/cart/CartDrawer.tsx',
  'src/lib/schema.ts',
  'scripts/prerender.js',
  'public/llms.txt',
  'api/merchant-feed.ts',
]) {
  const rawSource = read(relative);
  const source = relative === 'scripts/prerender.js'
    ? removeSanitizerRegexLiterals(rawSource)
    : rawSource;
  for (const pattern of blocked) {
    const match = source.match(pattern);
    if (!match || match.index === undefined) continue;
    const line = source.slice(0, match.index).split('\n').length;
    const context = source
      .slice(Math.max(0, match.index - 80), Math.min(source.length, match.index + match[0].length + 80))
      .replace(/\s+/g, ' ')
      .trim();
    failures.push(`${relative}:${line} contains stale policy matching ${pattern}; context: ${context}`);
  }
}

if (failures.length) {
  console.error('[route-shipping] Validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[route-shipping] OK — five route-based zones, exact thresholds, structured data, Ready-to-Ship filtering and homepage discovery are aligned.');
