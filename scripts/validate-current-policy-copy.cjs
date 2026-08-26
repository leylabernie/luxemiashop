#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const roots = [
  'index.html',
  'api',
  'public',
  'src',
  'supabase/functions',
  'scripts',
  'CREAO_AI_PROMPT.md',
  'build_csv.py',
  'build_boutique_csv.py',
];
const supportedExtensions = new Set(['.html', '.ts', '.tsx', '.js', '.cjs', '.py', '.txt', '.md', '.json']);
const skippedBasenames = new Set([
  'apply-international-shipping-remediation.cjs',
  'validate-current-policy-copy.cjs',
]);

function listFiles(relativePath) {
  const absolutePath = path.join(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) return [];
  const stat = fs.statSync(absolutePath);
  if (stat.isFile()) return supportedExtensions.has(path.extname(absolutePath)) ? [absolutePath] : [];
  return fs.readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(absolutePath, entry.name);
    if (entry.isDirectory()) return listFiles(path.relative(PROJECT_ROOT, child));
    return supportedExtensions.has(path.extname(entry.name)) ? [child] : [];
  });
}

// Current verified policy:
// - U.S.: $12 below $150; free at $150+
// - CA, GB, AU, NZ, ZA, MU: $14.99 below $300; free at $300+
// - All sales final; covered damage/incorrect/missing-item reports within 48 hours.
const blockedPatterns = [
  /LuxeMia currently ships to United States addresses only/i,
  /Shipping is available to United States addresses only/i,
  /We currently ship to United States addresses only/i,
  /United States shipping only/i,
  /Shipping destination: United States only/i,
  /Shipping destination: United States addresses only/i,
  /International shipping: not currently available/i,
  /international shipping is not currently available/i,
  /Current LuxeMia product listings (?:with|for) delivery to United States addresses/i,
  /eligible U\.S\. standard-stock items may be returned/i,
  /accepts return requests made within 30 calendar days/i,
  /MerchantReturnFiniteReturnWindow/i,
  /merchantReturnDays/i,
  /15[ -]day return policy/i,
  /fits? all body types/i,
  /meets? (?:the |our )?highest standards/i,
  /delivery in 2 business days to ship to all three countries/i,
  /\$12(?: flat)? (?:for orders )?below \$135/i,
  /free (?:U\.S\. )?shipping (?:at|on orders over) \$135/i,
  /free at \$135(?: and above|\+)/i,
  /(?:shipping|delivery)[^\n]{0,120}(?<!\\)\$135/i,
  /(?<!\\)\$135[^\n]{0,120}(?:shipping|delivery)/i,
];

const requiredSnippets = {
  'package.json': [
    'node scripts/apply-international-shipping-remediation.cjs',
    '"validate:policy-copy": "node scripts/apply-international-shipping-remediation.cjs && node scripts/validate-current-policy-copy.cjs"',
  ],
  'src/components/cart/CartDrawer.tsx': [
    'const FREE_SHIPPING_THRESHOLD = 150;',
    'Discounts are applied before shipping eligibility.',
  ],
  'src/lib/schema.ts': [
    "export const SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'];",
    "export const INTERNATIONAL_SHIPPING_COUNTRIES = ['CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'];",
    '#international-standard-shipping',
    'value: 14.99',
    'maxValue: 299.99',
    'minValue: 300',
    'returnPolicyCategory: \'https://schema.org/MerchantReturnNotPermitted\'',
    'returnPolicyCountry: SHIPPING_COUNTRIES',
  ],
  'scripts/prerender.js': [
    "addressCountry: ['CA', 'GB', 'AU', 'NZ', 'ZA', 'MU']",
    'value: 14.99',
    'maxValue: 299.99',
    'minValue: 300',
  ],
  'index.html': [
    'https://luxemia.shop/#international-standard-shipping',
    '"value": 14.99',
    '"maxValue": 299.99',
    '"minValue": 300',
    '"MU"',
    '"returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"',
  ],
  'src/pages/Shipping.tsx': [
    'International standard shipping is $14.99 below $300 and free at $300 and above',
  ],
  'src/pages/ShippingCustoms.tsx': [
    'International Shipping, Duties & Taxes',
  ],
  'public/llms.txt': [
    'International standard shipping: $14.99 USD below $300 USD; free at $300 USD and above',
  ],
  'api/merchant-feed.ts': [
    'Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius',
  ],
};

const failures = [];
for (const filePath of roots.flatMap(listFiles)) {
  if (skippedBasenames.has(path.basename(filePath))) continue;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const pattern of blockedPatterns) {
    if (pattern.test(text)) failures.push(`${path.relative(PROJECT_ROOT, filePath)} matches ${pattern}`);
  }
}

for (const [relativePath, snippets] of Object.entries(requiredSnippets)) {
  const absolutePath = path.join(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`${relativePath} does not exist`);
    continue;
  }
  const text = fs.readFileSync(absolutePath, 'utf8');
  for (const snippet of snippets) {
    if (!text.includes(snippet)) failures.push(`${relativePath} is missing required policy fragment: ${snippet}`);
  }
}

if (failures.length > 0) {
  console.error('[policy-copy] Stale, contradictory, or unsupported policy copy found:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[policy-copy] OK — seven-country shipping, exact thresholds, and final-sale terms are aligned across storefront, schema, feeds, and generated copy.');
