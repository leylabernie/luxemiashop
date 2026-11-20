const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const retiredCodes = /LUXE10|LUXE15|LUXE20/;
const welcomeCopy =
  'One use per customer · entered at checkout · U.S. free shipping $150+ applies after discounts';

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

test('CartDrawer shows a FIRST10 copy-code pill above Proceed to Secure Checkout with compliant copy', () => {
  const source = read('src/components/cart/CartDrawer.tsx');

  assert.match(source, /import \{ WELCOME_OFFER \} from '@\/config\/welcomeOffer'/);
  assert.match(source, /const copyWelcomeCode/);
  assert.match(source, /navigator\.clipboard\.writeText\(WELCOME_OFFER\.code\)/);
  assert(source.includes(welcomeCopy));
  assert.match(source, /First order\? Copy \{WELCOME_OFFER\.code\} → \{WELCOME_OFFER\.discountPercent\} percent off at checkout/);

  // The pill is rendered immediately ahead of the checkout CTA and never displaces it.
  assert(source.indexOf('WELCOME_OFFER.enabled && checkoutUrl') > -1);
  assert(
    source.indexOf('First order? Copy') < source.indexOf('Proceed to Secure Checkout'),
    'welcome pill must precede Proceed to Secure Checkout',
  );
  assert.doesNotMatch(source, retiredCodes);
});

test('ProductInfo shows a FIRST10 copy-code pill near the price block with compliant copy', () => {
  const source = read('src/components/product/ProductInfo.tsx');

  assert.match(source, /import \{ WELCOME_OFFER \} from '@\/config\/welcomeOffer'/);
  assert.match(source, /const copyWelcomeCode/);
  assert.match(source, /navigator\.clipboard\.writeText\(WELCOME_OFFER\.code\)/);
  assert(source.includes(welcomeCopy));
  assert.match(source, /First order: \{WELCOME_OFFER\.code\} → \{WELCOME_OFFER\.discountPercent\} percent off at checkout/);

  // Near (after) the price block, before the purchase controls.
  assert(source.indexOf('{/* Price */}') < source.indexOf('First order:'));
  assert(source.indexOf('First order:') < source.indexOf('{/* ─── Essential Purchase Controls'));
  assert.doesNotMatch(source, retiredCodes);
});

test('ProductInfo surfaces the U.S. delivery window inside #product-add-to-bag', () => {
  const source = read('src/components/product/ProductInfo.tsx');

  assert.match(source, /usDeliveryWindowNotice/);
  const addToBagStart = source.indexOf('id="product-add-to-bag"');
  assert(addToBagStart > -1);
  const noticeInAddToBag = source.indexOf('usDeliveryWindowNotice', addToBagStart);
  assert(noticeInAddToBag > addToBagStart);
  assert(noticeInAddToBag < source.indexOf('<ProductDeliverySummary', addToBagStart));
  assert.doesNotMatch(source, retiredCodes);
});

test('cartStore fires consent-gated conversion pixels alongside GA4 events', () => {
  const source = read('src/stores/cartStore.ts');

  assert.match(source, /import \{ trackMarketingAddToCart, trackMarketingInitiateCheckout \} from '@\/lib\/marketingPixels'/);

  const addItemBody = source.slice(
    source.indexOf('addItem: (item) => {'),
    source.indexOf('updateQuantity: (variantId, quantity, customAttributes) => {'),
  );
  assert(addItemBody.includes('trackMarketingAddToCart(item.variantId'));

  const updateQuantityBody = source.slice(
    source.indexOf('updateQuantity: (variantId, quantity, customAttributes) => {'),
    source.indexOf('removeItem: (variantId, customAttributes) => {'),
  );
  assert(updateQuantityBody.includes('trackMarketingAddToCart(current.variantId'));

  assert(source.includes('trackMarketingInitiateCheckout('));
  assert.doesNotMatch(source, retiredCodes);
});

test('no retired discount codes appear anywhere in the four feature files', () => {
  for (const relative of [
    'src/components/cart/CartDrawer.tsx',
    'src/components/product/ProductInfo.tsx',
    'src/config/welcomeOffer.ts',
    'src/lib/marketingPixels.ts',
    'src/stores/cartStore.ts',
    'src/components/MarketingConsent.tsx',
  ]) {
    const source = read(relative);
    assert.doesNotMatch(source, retiredCodes, `${relative} must not reference retired codes`);
  }
});
