const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const copy = require('../src/lib/welcomeEmailCopy.cjs');
const timing = require('../src/config/shippingTiming.cjs');

const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const email = copy.buildWelcomeEmail({ firstName: 'Aisha' });
const noOffer = copy.buildWelcomeEmail({ firstName: 'Aisha', offerEnabled: false });
const anonymous = copy.buildWelcomeEmail();

// Every sentence of the email, plus the subject and preheader.
const ALL_COPY = [email.subject, email.preheader, ...email.blocks.map((block) => `${block.heading} ${block.body}`), email.legalFooter].join('\n');

/**
 * The only sentence allowed to contain "guarantee" is the one that denies it.
 * Removing it before the forbidden-claim scan keeps the scan honest instead of
 * allowing an exception that a future edit could widen.
 */
const withoutAllowedDenial = ALL_COPY.split(copy.DELIVERY_NOT_GUARANTEED_SENTENCE).join('');

test('the delivery numbers are read from shippingTiming.cjs, not retyped', () => {
  assert.equal(
    copy.READY_TO_SHIP_WINDOW,
    `${timing.READY_TO_SHIP_TOTAL_MIN_DAYS}–${timing.READY_TO_SHIP_TOTAL_MAX_DAYS}`,
  );
  assert.equal(
    copy.DISPATCH_WINDOW,
    `${timing.DEFAULT_READY_DISPATCH_MIN_DAYS}–${timing.DEFAULT_READY_DISPATCH_MAX_DAYS}`,
  );
  assert.equal(copy.TRANSIT_WINDOW, `${timing.STANDARD_TRANSIT_MIN_DAYS}–${timing.STANDARD_TRANSIT_MAX_DAYS}`);
  assert.equal(
    copy.CUSTOM_TAILORED_WINDOW,
    `${timing.CUSTOM_TAILORED_TOTAL_MIN_DAYS}–${timing.CUSTOM_TAILORED_TOTAL_MAX_DAYS}`,
  );
  assert.equal(copy.READY_TO_SHIP_WINDOW, '5–7');
  assert.equal(copy.CUSTOM_TAILORED_WINDOW, '15–18');
});

test('the email states BOTH fulfillment windows, so made-to-measure is not promised the fast one', () => {
  const delivery = email.blocks.find((block) => block.id === 'delivery').body;
  assert.match(delivery, /Ready-to-Ship pieces dispatch in 1–2 business days and arrive in 5–7 business days to the US, UK and Canada/);
  assert.match(delivery, /Custom Tailored outfits take 15–18 business days total once your measurements are confirmed/);
  assert.match(delivery, /Orders ship from India/);
  assert.match(delivery, /3-Point Quality Assurance Check/);
  assert.match(delivery, /tracking after dispatch/);
});

test('no delivery or shipping guarantee is offered anywhere in the email', () => {
  assert.equal(
    ALL_COPY.split(copy.DELIVERY_NOT_GUARANTEED_SENTENCE).length - 1,
    1,
    'the "not guaranteed" sentence must appear exactly once',
  );
  assert.doesNotMatch(withoutAllowedDenial, /guarantee|guaranteed/i);
  assert.doesNotMatch(ALL_COPY, /expedited/i, 'shipping is tracked, not expedited');
  assert.doesNotMatch(ALL_COPY, /insur/i, 'shipment insurance is not published');
  assert.doesNotMatch(ALL_COPY, /handcraft/i, 'stripped by productDescriptionEnrichment.ts');
  assert.doesNotMatch(ALL_COPY, /100%\s*(?:breathable\s*)?cotton/i);
  assert.doesNotMatch(ALL_COPY, /\bdesigner\b/i);
  // The brief's "5–7 day international shipping" without a mode or destination.
  assert.doesNotMatch(ALL_COPY, /5–7\s*(?:business\s*)?days?\s+(?:expedited\s+)?international/i);
});

test('the alteration credit stays a conditional credit, matching returnPolicyCopy.ts', () => {
  const fit = email.blocks.find((block) => block.id === 'fit').body;
  assert.match(fit, /up to \$20 USD in Local Alteration Credit/);
  assert.match(fit, /within 14 days of delivery/);
  assert.match(fit, /2-inch internal seam allowance on both side seams where garment construction permits/);
  assert.match(fit, /custom-stitched blouses, cholis and suit tops/i);
  assert.match(fit, /hello@luxemia\.shop/);
  assert.match(fit, /All sales are final except where applicable law provides otherwise/);
  assert.match(fit, /within 48 hours of delivery/);
  assert.match(fit, /full refund or replacement/);
  assert.doesNotMatch(fit, /saree|lehenga/i, 'the credit is not a saree/lehenga alteration service');

  // Parity with the published policy source: if /returns changes, this fails.
  const policy = read('src/lib/returnPolicyCopy.ts');
  assert.match(policy, /up to \$20 USD in Local Alteration Credit/);
  assert.match(policy, /within 14 days of delivery/);
  assert.match(policy, /RETURN_CLAIM_WINDOW = '48 hours'/);
  assert.equal(copy.RETURN_CLAIM_WINDOW, '48 hours');
});

test('the discount copy carries every qualifier the storefront requires', () => {
  const offer = email.blocks.find((block) => block.id === 'offer').body;
  assert.equal(
    offer,
    'Use code FIRST10 at checkout for 10% off an eligible first order. One use per customer. Final eligibility is confirmed at checkout.',
  );
  assert.match(offer, /10% off an eligible first order/);
  assert.match(offer, /One use per customer\./);
  assert.match(offer, /Final eligibility is confirmed at checkout\./);
  assert.doesNotMatch(ALL_COPY, /no minimum purchase/i, 'retired promotion copy');
  assert.doesNotMatch(ALL_COPY, /LUXE(?:10|15|20)/i, 'retired discount code');
});

test('the discount block mirrors src/config/welcomeOffer.ts and disappears when the offer is off', () => {
  const source = read('src/config/welcomeOffer.ts');
  assert.match(source, /code: 'FIRST10'/);
  assert.match(source, /discountPercent: 10/);
  assert.match(source, /oneUsePerCustomer: true/);
  assert.match(source, /appliesAtCheckout: true/);
  assert.match(source, /enabled: true/);
  assert.equal(copy.FIRST10_CODE, 'FIRST10');
  assert.equal(copy.FIRST10_PERCENT, 10);

  // A disabled offer must remove the claim, not send it with an empty body.
  assert.equal(noOffer.blocks.some((block) => block.id === 'offer'), false);
  assert.doesNotMatch(noOffer.text, /FIRST10/);
  assert.match(noOffer.text, /WHEN IT ARRIVES/, 'the factual blocks still send');
  assert.match(email.text, /YOUR FIRST10 CODE/);
});

test('the email never claims a message is already on its way', () => {
  assert.doesNotMatch(ALL_COPY, /check your inbox|email (?:is on its way|has been sent)|we(?:'ve| have) sent you/i);
});

test('the permission footer keeps the placeholders a sender must fill in', () => {
  assert.match(email.legalFooter, /because you subscribed at luxemia\.shop/);
  assert.match(email.legalFooter, /Unsubscribe any time/);
  // Bracketed on purpose: tests fail if someone ships the template as-is.
  assert.match(copy.POSTAL_ADDRESS_PLACEHOLDER, /^\[OWNER:/);
  assert.match(copy.UNSUBSCRIBE_PLACEHOLDER, /^\[OWNER:/);
  assert.match(email.legalFooter, /\[OWNER: registered business postal address/);
  assert.match(email.legalFooter, /\[OWNER: unsubscribe link/);
  assert.doesNotMatch(email.legalFooter, /\d{3,5}\s+[A-Z][a-z]+\s+(?:St|Street|Ave|Avenue|Rd|Road)/, 'no invented street address');
});

test('subject, preheader and greeting stay inside sending-tool limits', () => {
  assert.ok(email.subject.length <= 65, `subject is ${email.subject.length} chars`);
  assert.ok(email.preheader.length <= 160, `preheader is ${email.preheader.length} chars`);
  assert.match(email.subject, /FIRST10/);
  assert.match(email.text, /^Hi Aisha,\n/, 'a captured first name is used');
  assert.match(anonymous.text, /^Hi,\n/, 'no name means no invented one');
  assert.doesNotMatch(anonymous.text, /Hi undefined/);
});

test('support details match the published desk', () => {
  const support = email.blocks.find((block) => block.id === 'support').body;
  assert.match(support, /hello@luxemia\.shop/);
  assert.match(support, /\+1-215-341-9990/);
  assert.match(support, /WhatsApp/);
  assert.match(support, /Philadelphia/);
  for (const page of ['/shipping', '/returns', '/alterations']) {
    assert.ok(support.includes(`https://luxemia.shop${page}`), `missing ${page}`);
  }
});

test('the send gates are stated, starting with the unverified Shopify discount', () => {
  assert.ok(copy.WELCOME_EMAIL_PREREQUISITES.length >= 4);
  assert.match(copy.WELCOME_EMAIL_PREREQUISITES[0], /ACTIVE Shopify discount/);
  assert.match(copy.WELCOME_EMAIL_PREREQUISITES.join('\n'), /postal address/i);
  assert.match(copy.WELCOME_EMAIL_PREREQUISITES.join('\n'), /SPF\/DKIM/);
  assert.match(copy.WELCOME_EMAIL_PREREQUISITES.join('\n'), /accepts_marketing/);

  const doc = read('docs/growth/email/FIRST10-WELCOME-FLOW.md');
  assert.match(doc, /Customer tagged/);
  assert.match(doc, /FIRST10_LEAD/);
  assert.match(doc, /acceptsMarketing/);
  // Flow cannot email a customer; the doc must not imply otherwise.
  assert.match(doc, /no customer-facing email action/i);
  assert.match(doc, /Send internal email/);
  assert.match(doc, /not mounted anywhere|not mounted/i);
  assert.match(doc, /SUPABASE_WEBHOOK_TABLES=newsletter_subscribers/);
});
