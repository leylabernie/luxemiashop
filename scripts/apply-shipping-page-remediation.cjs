#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const shippingPagePath = path.resolve(__dirname, '..', 'src/pages/Shipping.tsx');
let source = fs.readFileSync(shippingPagePath, 'utf8');

const shippingPromise = "LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. U.S. standard shipping is $12 below $150 and free at $150 and above. International standard shipping is $14.99 below $300 and free at $300 and above. Duties, import taxes, brokerage, or carrier fees may apply unless checkout explicitly states otherwise. Tracking is provided after dispatch.";

if (!/const SHIPPING_PROMISE = '[^']*';/.test(source)) {
  throw new Error('[shipping-page] SHIPPING_PROMISE declaration not found');
}

source = source.replace(
  /const SHIPPING_PROMISE = '[^']*';/,
  `const SHIPPING_PROMISE = '${shippingPromise}';`,
);

if (!source.includes('International standard shipping is $14.99 below $300 and free at $300 and above')) {
  throw new Error('[shipping-page] International shipping promise was not applied');
}

fs.writeFileSync(shippingPagePath, source, 'utf8');
console.log('[shipping-page] Seven-country shipping promise applied.');
