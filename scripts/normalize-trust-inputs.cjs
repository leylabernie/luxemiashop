#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const relative = 'src/lib/seoMetadata.ts';
const file = path.join(ROOT, relative);
let source = fs.readFileSync(file, 'utf8');

const SHIPPING_TITLE = 'Shipping Policy & International Rates | LuxeMia';
const SHIPPING_DESCRIPTION = 'Review LuxeMia tracked shipping rates for the United States, Canada, United Kingdom, Australia, New Zealand, South Africa and Mauritius, plus processing, customs and tracking guidance.';
const SHIPPING_CUSTOMS_TITLE = 'International Shipping, Duties & Customs | LuxeMia';
const SHIPPING_CUSTOMS_DESCRIPTION = 'Review LuxeMia international shipping, duties, customs, brokerage and tracking guidance for all seven supported destination countries.';
const FAQ_DESCRIPTION = 'Answers to common LuxeMia questions about orders, seven-country shipping, cancellations, statutory rights, sizing, product issues and care.';

function patchRouteBlock(input, route, title, description) {
  const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const blockPattern = new RegExp(`('${escapedRoute}'\\s*:\\s*\\{)([\\s\\S]*?)(\\n\\s*\\},)`, 'm');
  const match = input.match(blockPattern);
  if (!match) throw new Error(`[trust-inputs] Route block not found: ${route}`);

  let body = match[2];
  body = /\n\s*title:\s*['"][^'"]*['"]\s*,?/.test(body)
    ? body.replace(/\n\s*title:\s*['"][^'"]*['"]\s*,?/, `\n    title: '${title}',`)
    : `\n    title: '${title}',${body}`;
  body = /\n\s*description:\s*['"][\s\S]*?['"]\s*,?/.test(body)
    ? body.replace(/\n\s*description:\s*['"][\s\S]*?['"]\s*,?/, `\n    description: '${description}',`)
    : `${body}\n    description: '${description}',`;

  return input.replace(blockPattern, `${match[1]}${body}${match[3]}`);
}

source = patchRouteBlock(source, '/shipping', SHIPPING_TITLE, SHIPPING_DESCRIPTION);
source = patchRouteBlock(source, '/pages/shipping-customs', SHIPPING_CUSTOMS_TITLE, SHIPPING_CUSTOMS_DESCRIPTION);
source = patchRouteBlock(source, '/faq', 'FAQ | Frequently Asked Questions | LuxeMia', FAQ_DESCRIPTION);

fs.writeFileSync(file, source, 'utf8');

for (const required of [SHIPPING_TITLE, SHIPPING_DESCRIPTION, SHIPPING_CUSTOMS_TITLE, SHIPPING_CUSTOMS_DESCRIPTION, FAQ_DESCRIPTION]) {
  if (!source.includes(required)) throw new Error(`[trust-inputs] Missing normalized value: ${required}`);
}

console.log('[trust-inputs] Normalized shipping, customs and FAQ metadata variants.');
