#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const replacements = [
  [
    'Standard shipping is $12 for orders below $150 and free at $199 and above.',
    'U.S. standard shipping is $14.99 below $199 and free at $199 and above.',
  ],
  [
    'U.S. shipping is $12 below $150 and free at $199 and above.',
    'U.S. standard shipping is $14.99 below $199 and free at $199 and above.',
  ],
  [
    '$12 below $150 and free at $199+',
    '$14.99 below $199 and free at $199+',
  ],
  [
    'Free U.S. shipping is available at $150 and above, with $12 flat-rate shipping below $150.',
    'Free U.S. standard shipping is available at $199 and above, with $14.99 shipping below $199.',
  ],
  [
    'Free U.S. standard shipping applies at $150 and above; shipping is $12 below that threshold.',
    'Free U.S. standard shipping applies at $199 and above; shipping is $14.99 below $199.',
  ],
  [
    'Free U.S. shipping applies at $150 and above.',
    'Free U.S. standard shipping applies at $199 and above.',
  ],
  [
    'Free shipping at $150 and above; $12 below. Tracking after dispatch.',
    'U.S. standard shipping is free at $199 and above and $14.99 below $199. Tracking follows dispatch.',
  ],
  [
    'U.S. standard shipping is free when the checkout subtotal after discounts is $150 or more and costs $14.99 below $199.',
    'U.S. standard shipping is free when the checkout subtotal after discounts is $199 or more and costs $14.99 below $199.',
  ],
];

let changedFiles = 0;
for (const relativePath of [
  'index.html',
  'src/lib/schema.ts',
  'scripts/prerender.js',
]) {
  const absolutePath = path.join(root, relativePath);
  let source = fs.readFileSync(absolutePath, 'utf8');
  const original = source;
  for (const [from, to] of replacements) source = source.split(from).join(to);
  if (source !== original) {
    fs.writeFileSync(absolutePath, source, 'utf8');
    changedFiles += 1;
  }
}

console.log(`[route-shipping-final] Removed hybrid legacy shipping fragments from ${changedFiles} source surfaces.`);
