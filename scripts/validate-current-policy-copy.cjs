#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const roots = [
  'index.html',
  'api',
  'src/components',
  'src/data',
  'src/pages',
  'src/lib/seoMetadata.ts',
  'src/lib/productDescriptionEnrichment.ts',
  'supabase/functions',
  'scripts/build-shopify-csv-kundan.py',
  'scripts/build-shopify-csv-v2.py',
  'scripts/build-shopify-csv-v3.py',
  'scripts/build-shopify-csv-wedding-sarees.py',
  'scripts/template-fallback-wedding-sarees.py',
];
const supportedExtensions = new Set(['.html', '.ts', '.tsx', '.js', '.cjs', '.py']);

function listFiles(relativePath) {
  const absolutePath = path.join(PROJECT_ROOT, relativePath);
  const stat = fs.statSync(absolutePath);
  if (stat.isFile()) return [absolutePath];
  return fs.readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(absolutePath, entry.name);
    if (entry.isDirectory()) return listFiles(path.relative(PROJECT_ROOT, child));
    return supportedExtensions.has(path.extname(entry.name)) ? [child] : [];
  });
}

const blockedPatterns = [
  /LuxeMia ships only to (?:the )?United States/i,
  /LuxeMia currently ships to (?:the )?United States addresses/i,
  /We currently ship to (?:the )?United States addresses only/i,
  /currently serves? United States shoppers only/i,
  /United States addresses only/i,
  /United States shipping only/i,
  /Current LuxeMia product listings for delivery to United States addresses/i,
  /free (?:for orders )?over \$150/i,
  /U\.S\. Shipping Policy/i,
  /(?:free shipping|free delivery)[^\n<]{0,100}\$?350/i,
  /(?:delivered|delivery) (?:in|within) 7[–-]10 business days/i,
  /15[ -]day return policy/i,
  /Philadelphia headquarters?/i,
  /fits? all body types/i,
  /meets? (?:the |our )?highest standards/i,
  /delivery in 2 business days to ship to all three countries/i,
];

const failures = [];
for (const filePath of roots.flatMap(listFiles)) {
  const text = fs.readFileSync(filePath, 'utf8');
  for (const pattern of blockedPatterns) {
    if (pattern.test(text)) {
      failures.push(`${path.relative(PROJECT_ROOT, filePath)} matches ${pattern}`);
    }
  }
}

if (failures.length > 0) {
  console.error('[policy-copy] Stale or unsupported copy found:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[policy-copy] OK — user-facing source and catalog templates contain no blocked legacy policy copy.');
