#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DESTINATIONS = 'the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius';
const ROUTE_SUMMARY = 'U.S. standard shipping is $14.99 below $199 and free at $199+. Canada and the UK are $24.99 below $299 and free at $299+. Australia and New Zealand are $29.99 below $349 and free at $349+. South Africa is $49.99 and Mauritius is $59.99 per order.';
const roots = ['index.html', 'api', 'public', 'src', 'supabase/functions', 'CREAO_AI_PROMPT.md', 'build_csv.py', 'build_boutique_csv.py'];
const extensions = new Set(['.html', '.ts', '.tsx', '.js', '.cjs', '.py', '.txt', '.md', '.json']);
const skipped = new Set([
  'apply-legacy-shipping-copy-cleanup.cjs',
  'apply-route-based-shipping-growth.cjs',
  'validate-route-based-shipping.cjs',
  'apply-international-shipping-remediation.cjs',
  'apply-shipping-page-remediation.cjs',
  'validate-current-policy-copy.cjs',
]);

const replacements = [
  ['LuxeMia currently ships to United States addresses only.', `LuxeMia ships to ${DESTINATIONS}.`],
  ['LuxeMia currently ships to United States addresses only', `LuxeMia ships to ${DESTINATIONS}`],
  ['LuxeMia currently accepts United States shipping addresses only.', `LuxeMia accepts shipping addresses in ${DESTINATIONS}.`],
  ['LuxeMia currently accepts United States shipping addresses only', `LuxeMia accepts shipping addresses in ${DESTINATIONS}`],
  ['Shipping is available to United States addresses only.', `Shipping is available to ${DESTINATIONS}.`],
  ['Shipping is available to United States addresses only', `Shipping is available to ${DESTINATIONS}`],
  ['We currently ship to United States addresses only.', `We ship to ${DESTINATIONS}.`],
  ['We currently ship to United States addresses only', `We ship to ${DESTINATIONS}`],
  ['United States shipping only.', 'Shipping is available to seven countries.'],
  ['United States shipping only', 'Shipping to seven countries'],
  ['International shipping is not currently available.', ROUTE_SUMMARY],
  ['international shipping is not currently available.', ROUTE_SUMMARY],
  ['International shipping: not currently available', ROUTE_SUMMARY],
  ['Shipping destination: United States addresses only', `Shipping destinations: ${DESTINATIONS}`],
  ['Shipping destination: United States only', `Shipping destinations: ${DESTINATIONS}`],
  ['Current LuxeMia product listings with delivery to United States addresses only.', `Current LuxeMia product listings with delivery to ${DESTINATIONS}.`],
  ['Current LuxeMia product listings for delivery to United States addresses.', `Current LuxeMia product listings with delivery to ${DESTINATIONS}.`],
  ['Premium Indian Ethnic Wear with Tracked U.S. Shipping', 'Indian Ethnic Wear with Tracked Shipping to Seven Countries'],
  ['U.S. Shipping and Final-Sale Policy', 'Shipping and Final-Sale Policy'],
  ['U.S. Shipping & Taxes', 'International Shipping, Duties & Taxes'],
  ['U.S. Shipping Policy', 'Shipping Policy'],
  ['United States shipping addresses', 'shipping addresses in seven countries'],
  ['serving United States addresses', 'serving shoppers in seven countries'],
  ['for United States shoppers', 'for shoppers in seven countries'],
];

function list(relative) {
  const absolute = path.join(ROOT, relative);
  if (!fs.existsSync(absolute)) return [];
  const stat = fs.statSync(absolute);
  if (stat.isFile()) return extensions.has(path.extname(absolute)) && !skipped.has(path.basename(absolute)) ? [absolute] : [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => list(path.relative(ROOT, path.join(absolute, entry.name))));
}

let changed = 0;
for (const file of roots.flatMap(list)) {
  const original = fs.readFileSync(file, 'utf8');
  let updated = original;
  for (const [from, to] of replacements) updated = updated.split(from).join(to);
  updated = updated
    .replace(/\bUnited States addresses only\b/g, DESTINATIONS)
    .replace(/\bU\.S\.-only shipping\b/gi, 'seven-country shipping')
    .replace(/\bUS-only shipping\b/gi, 'seven-country shipping');
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    changed += 1;
  }
}

console.log(`[legacy-shipping] Removed stale U.S.-only copy from ${changed} source surfaces.`);
