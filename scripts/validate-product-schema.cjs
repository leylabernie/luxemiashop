#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function expectedPrices(price, compareAtPrice) {
  const active = Number(price);
  const compare = compareAtPrice == null ? 0 : Number(compareAtPrice);
  const discounted = Number.isFinite(active) && Number.isFinite(compare) && compare > active;
  return {
    active: String(price),
    strikethrough: discounted ? String(compareAtPrice) : undefined,
  };
}

const regular = expectedPrices('129.00', null);
assert(regular.active === '129.00', 'regular active price changed');
assert(regular.strikethrough === undefined, 'regular product received a strikethrough price');

const sale = expectedPrices('99.00', '149.00');
assert(sale.active === '99.00', 'sale active price is not the current Shopify price');
assert(sale.strikethrough === '149.00', 'sale compare-at price is not the strikethrough price');

const invalidCompare = expectedPrices('149.00', '99.00');
assert(invalidCompare.strikethrough === undefined, 'lower compare-at price was treated as a discount');

const schema = read('src/lib/schema.ts');
assert(schema.includes('schemaPrice: priceData.price'), 'Offer.price is not sourced from the active price');
assert(schema.includes('schemaStrikethroughPrice'), 'strikethrough helper is missing');
assert(schema.includes('https://schema.org/StrikethroughPrice'), 'StrikethroughPrice markup is missing');
assert(!schema.includes('https://schema.org/SalePrice'), 'active price is incorrectly marked as SalePrice');
assert(!schema.includes('priceValidUntil:'), 'synthetic priceValidUntil remains');
assert(!schema.includes('validThrough: new Date'), 'synthetic sale duration remains');

const seoHead = read('src/components/seo/SEOHead.tsx');
assert(seoHead.includes('<meta property="product:price:amount" content={product.price} />'), 'client Open Graph price is not active price');
assert(!seoHead.includes('product:sale_price'), 'client duplicate sale price tags remain');

const htmlGenerator = read('src/middleware/htmlGenerator.ts');
assert(htmlGenerator.includes('const schemaPrice = price;'), 'server Open Graph price is not active price');
assert(!htmlGenerator.includes('product:sale_price'), 'server duplicate sale price tags remain');

const jewelry = read('src/middleware/jewelryFallback.ts');
assert(jewelry.includes('<meta property="product:price:amount" content="${price}">'), 'jewelry fallback Open Graph price is not active price');
assert(!jewelry.includes('product:sale_price'), 'jewelry fallback duplicate sale price tag remains');

console.log('[product-schema] OK — active and strikethrough prices are consistent in every rendering path.');
