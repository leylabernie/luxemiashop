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
  'build_csv.py',
  'build_boutique_csv.py',
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
  /Shipping is available to seven countries/i,
  /shipping to seven countries/i,
  /seven supported countries/i,
  /ships to the United States, Canada, the United Kingdom/i,
  /shipping to the United States, Canada, the United Kingdom/i,
  /shipping is available to the United States, Canada/i,
  /checkout accepts addresses in the United States, Canada/i,
  /international standard shipping is/i,
  /international rates are shown at checkout/i,
  /eligible U\.S\. standard-stock items may be returned/i,
  /accepts return requests made within 30 calendar days/i,
  /MerchantReturnFiniteReturnWindow/i,
  /merchantReturnDays/i,
  /15[ -]day return policy/i,
  /fits? all body types/i,
  /meets? (?:the |our )?highest standards/i,
  /delivery in 2 business days to ship to all three countries/i,
];

const failures = [];
for (const filePath of roots.flatMap(listFiles)) {
  if (path.basename(filePath).startsWith('validate-')) continue;
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
