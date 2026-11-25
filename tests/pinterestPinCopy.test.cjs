const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pinCopy = require('../src/lib/pinterestPinCopy.cjs');
const timing = require('../src/config/shippingTiming.cjs');

const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

/**
 * Forbidden-claim scans must judge shipped copy, not the comments that explain
 * why a claim is banned. Strip line and block comments before scanning.
 */
const copyOnly = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/^\s*\/\/.*$/gm, ' ')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ');

// Claims that are NOT published on luxemia.shop and must never reach a pin.
const FORBIDDEN_PIN_CLAIMS = [
  [/100%\s*(?:breathable\s*)?cotton/i, '100% cotton lining'],
  [/insur/i, 'shipment insurance'],
  [/handcraft/i, 'handcrafted (stripped by productDescriptionEnrichment.ts)'],
  [/guarantee/i, 'fit guarantee'],
  [/on all stitched outfits/i, 'margins on every outfit'],
  [/dispatch(?:es|ing)?[^.]{0,40}5[–-]7\s*(?:business\s*)?days/i, 'dispatch in 5-7 days'],
  [/\b3[–-]5\s*(?:business\s*)?days\b/i, 'unsupported 3-5 day window'],
  [/\bluxemia\.shop\/products\//i, 'non-canonical /products/ path'],
];

test('pin copy module exposes the builders the storefront and scheduler share', () => {
  ['buildPinTitle', 'buildPinDescription', 'occasionFromTags', 'resolvePinFulfillment', 'withShareUtm']
    .forEach((name) => assert.equal(typeof pinCopy[name], 'function', `${name} missing`));
});

test('delivery windows come from the shipping source of truth, not hardcoded copy', () => {
  assert.equal(pinCopy.READY_TO_SHIP_WINDOW, `${timing.READY_TO_SHIP_TOTAL_MIN_DAYS}–${timing.READY_TO_SHIP_TOTAL_MAX_DAYS}`);
  assert.equal(pinCopy.CUSTOM_TAILORED_WINDOW, `${timing.CUSTOM_TAILORED_TOTAL_MIN_DAYS}–${timing.CUSTOM_TAILORED_TOTAL_MAX_DAYS}`);
  assert.equal(pinCopy.DISPATCH_WINDOW, `${timing.DEFAULT_READY_DISPATCH_MIN_DAYS}–${timing.DEFAULT_READY_DISPATCH_MAX_DAYS}`);
  assert.equal(pinCopy.TRANSIT_WINDOW, `${timing.STANDARD_TRANSIT_MIN_DAYS}–${timing.STANDARD_TRANSIT_MAX_DAYS}`);
});

test('shipping rate and threshold mirror src/config/shippingPolicy.ts', () => {
  const policy = read('src/config/shippingPolicy.ts');
  assert.match(policy, /US_STANDARD_SHIPPING_RATE = ([\d.]+)/);
  assert.match(policy, /US_FREE_SHIPPING_THRESHOLD = (\d+)/);
  assert.equal(pinCopy.US_STANDARD_SHIPPING_RATE, Number.parseFloat(policy.match(/US_STANDARD_SHIPPING_RATE = ([\d.]+)/)[1]));
  assert.equal(pinCopy.US_FREE_SHIPPING_THRESHOLD, Number.parseInt(policy.match(/US_FREE_SHIPPING_THRESHOLD = (\d+)/)[1], 10));
});

test('pin title follows [Color] [Fabric] [Category] for [Occasion] | LuxeMia', () => {
  const title = pinCopy.buildPinTitle({
    title: "LuxeMia Women's Wedding Saree Silk Embroidered Onion Pink",
    color: 'Onion Pink',
    material: 'Silk',
    category: 'Saree',
    occasion: 'Wedding Guest',
    url: 'https://luxemia.shop/product/onion-pink-saree',
  });
  assert.equal(title, 'Onion Pink Silk Saree for Wedding Guest | LuxeMia');
  assert.ok(title.length <= pinCopy.PIN_TITLE_MAX_LENGTH);
});

test('pin title falls back to the product title when attributes are missing', () => {
  const title = pinCopy.buildPinTitle({ title: 'Emerald Velvet Anarkali', url: 'https://luxemia.shop/product/x' });
  assert.equal(title, 'Emerald Velvet Anarkali | LuxeMia');
});

test('pin titles are truncated at Pinterest’s 100-character limit on a word boundary', () => {
  const title = pinCopy.buildPinTitle({ title: 'Word '.repeat(60).trim(), url: 'https://luxemia.shop/product/x' });
  assert.ok(title.length <= pinCopy.PIN_TITLE_MAX_LENGTH, `title was ${title.length} chars`);
});

test('pin descriptions stay inside 500 characters and always keep the product URL', () => {
  const url = 'https://luxemia.shop/product/dusty-pink-simar-silk-embroidered-palazzo-suit-indian-wedding-outfit-3-piece-set';
  ['ready-to-ship', 'custom-tailored', 'unstitched', 'both', 'unknown'].forEach((fulfillment) => {
    const description = pinCopy.buildPinDescription({
      title: 'Dusty Pink Silk Palazzo Suit for Wedding Guest',
      url,
      fulfillment,
    });
    assert.ok(description.length <= pinCopy.PIN_DESCRIPTION_MAX_LENGTH, `${fulfillment}: ${description.length} chars`);
    assert.ok(description.includes(url), `${fulfillment} dropped the destination URL`);
  });
});

test('pin copy keeps every qualifier that makes the published claims true', () => {
  const description = pinCopy.buildPinDescription({
    title: 'Red Georgette Lehenga Choli',
    url: 'https://luxemia.shop/product/red-bridal-lehenga-with-heavy-embroidery',
    fulfillment: 'ready-to-ship',
  });
  assert.match(description, /where applicable/);
  assert.ok(pinCopy.MARGIN_SENTENCE.includes('where construction permits'));
  assert.ok(pinCopy.MARGIN_SENTENCE.includes(`up to $${pinCopy.LOCAL_ALTERATION_CREDIT_USD} USD`));
  assert.ok(pinCopy.MARGIN_SENTENCE.includes(`within ${pinCopy.ALTERATION_CLAIM_DAYS} days of delivery`));
  assert.ok(pinCopy.MARGIN_SENTENCE.includes(`${pinCopy.SEAM_ALLOWANCE_INCHES}-inch (${pinCopy.SEAM_ALLOWANCE_CM} cm)`));
});

test('no pin sentence makes a claim the storefront does not publish', () => {
  const sentences = [
    ...Object.values(pinCopy.DELIVERY_SENTENCES),
    pinCopy.LINING_SENTENCE,
    pinCopy.MARGIN_SENTENCE,
    pinCopy.SUPPORT_SENTENCE,
  ];
  sentences.forEach((sentence) => {
    FORBIDDEN_PIN_CLAIMS.forEach(([pattern, label]) => {
      assert.doesNotMatch(sentence, pattern, `pin copy contains "${label}": ${sentence}`);
    });
  });
});

test('a custom-tailored or confirm-first listing can never inherit the 5–7 day window', () => {
  assert.equal(pinCopy.resolvePinFulfillment({ shipsWithinDays: 1, isCustomTailored: true }), 'custom-tailored');
  assert.equal(pinCopy.resolvePinFulfillment({ shipsWithinDays: 1, confirmAvailability: true }), 'custom-tailored');
  assert.equal(pinCopy.resolvePinFulfillment({ shipsWithinDays: 1, isUnstitched: true }), 'unstitched');
  assert.equal(pinCopy.resolvePinFulfillment({ shipsWithinDays: 1 }), 'ready-to-ship');
  assert.equal(pinCopy.resolvePinFulfillment({ shipsWithinDays: 2 }), 'ready-to-ship');
  // Beyond the stocked dispatch window the fast promise must not be made.
  assert.equal(pinCopy.resolvePinFulfillment({ shipsWithinDays: 5 }), 'unknown');
  assert.equal(pinCopy.resolvePinFulfillment({}), 'unknown');
  assert.equal(pinCopy.resolvePinFulfillment({ shipsWithinDays: null }), 'unknown');
  assert.doesNotMatch(
    pinCopy.buildPinDescription({ title: 'X', url: 'https://luxemia.shop/product/x', fulfillment: 'custom-tailored' }),
    /Ready-to-Ship/,
  );
});

test('occasion copy comes from the catalog occasion tag only', () => {
  assert.equal(pinCopy.occasionFromTags(['color:red', 'occasion:wedding guest']), 'Wedding Guest');
  assert.equal(pinCopy.occasionFromTags(['color:red']), undefined);
  assert.equal(pinCopy.occasionFromTags(undefined), undefined);
});

test('UTM tagging never duplicates parameters or breaks ?variant= links', () => {
  const tagged = pinCopy.withShareUtm('https://luxemia.shop/product/x?variant=123', 'pinterest');
  assert.equal(tagged, 'https://luxemia.shop/product/x?variant=123&utm_source=pinterest&utm_medium=organic_social&utm_campaign=product_share');
  assert.equal(pinCopy.withShareUtm(tagged, 'whatsapp'), tagged);
  assert.equal(pinCopy.withShareUtm('', 'pinterest'), '');
});

test('SocialShare builds rich pin copy and per-channel attribution', () => {
  const source = copyOnly(read('src/components/product/SocialShare.tsx'));
  assert.match(source, /buildPinterestPinDescription/);
  assert.match(source, /withShareUtm\(productUrl, 'pinterest'\)/);
  assert.match(source, /withShareUtm\(productUrl, 'whatsapp'\)/);
  assert.match(source, /withShareUtm\(productUrl, 'facebook'\)/);
  assert.match(source, /fulfillment/);
  // The retired generic description must not come back.
  assert.doesNotMatch(source, /Indian ethnic wear from LuxeMia/);
  FORBIDDEN_PIN_CLAIMS.forEach(([pattern, label]) => {
    assert.doesNotMatch(source, pattern, `SocialShare contains "${label}"`);
  });
});

test('ProductInfo passes catalog attributes and the real fulfillment state to SocialShare', () => {
  const source = read('src/components/product/ProductInfo.tsx');
  assert.match(source, /import \{ occasionFromTags, resolvePinFulfillment \} from '@\/lib\/pinterestPin'/);
  assert.match(source, /const pinFulfillment = resolvePinFulfillment\(\{/);
  assert.match(source, /isCustomTailored: requiresNativeTimingConfirmation \|\| hasSelectedAlterations \|\| currentSelectionIsMadeToOrder/);
  assert.match(source, /const pinOccasion = occasionFromTags\(product\.tags\)/);
  assert.match(source, /productColor=\{productSpecs\.color\}/);
  assert.match(source, /productMaterial=\{productSpecs\.fabric\}/);
  assert.match(source, /fulfillment=\{pinFulfillment\}/);
});

test('the typed wrapper delegates to the shared CJS copy module', () => {
  const source = copyOnly(read('src/lib/pinterestPin.ts'));
  assert.match(source, /from '\.\/pinterestPinCopy\.cjs'/);
  assert.match(source, /export function buildPinterestPinDescription/);
  assert.match(source, /export function resolvePinFulfillment/);
  FORBIDDEN_PIN_CLAIMS.forEach(([pattern, label]) => {
    assert.doesNotMatch(source, pattern, `pinterestPin.ts contains "${label}"`);
  });
});
