const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('welcome offer source of truth: FIRST10, 10%, one use per customer, applied at checkout', async () => {
  const { WELCOME_OFFER } = await import(path.join(root, 'src/config/welcomeOffer.ts'));

  assert.equal(WELCOME_OFFER.code, 'FIRST10');
  assert.equal(WELCOME_OFFER.discountPercent, 10);
  assert.equal(WELCOME_OFFER.oneUsePerCustomer, true);
  assert.equal(WELCOME_OFFER.appliesAtCheckout, true);
  assert.equal(WELCOME_OFFER.usFreeShippingAfterDiscounts, true);
  assert.equal(WELCOME_OFFER.enabled, true);
});

test('welcome offer copy never references retired codes', () => {
  const source = fs.readFileSync(path.join(root, 'src/config/welcomeOffer.ts'), 'utf8');
  assert.doesNotMatch(source, /LUXE10/);
  assert.doesNotMatch(source, /LUXE15/);
  assert.doesNotMatch(source, /LUXE20/);
  assert.match(source, /one use per customer/);
  assert.match(source, /checkout/);
});
