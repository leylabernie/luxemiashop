'use strict';

/**
 * FIRST10 welcome email copy — the message that goes out when
 * `api/sync-lead.ts` tags a Shopify customer `FIRST10_LEAD`.
 *
 * Why this is a module and not just a paragraph in a doc: every number here is
 * read from `src/config/shippingTiming.cjs` and mirrors
 * `src/lib/returnPolicyCopy.ts` / `src/config/welcomeOffer.ts`, and
 * `tests/welcomeEmailCopy.test.cjs` fails if those sources move. An email that
 * drifts from /shipping or /returns is the same defect as a pin that does —
 * it is a claim in writing, sent to a named person.
 *
 * ── Two claims from the original brief are deliberately NOT here ─────────────
 *
 * 1. "Delivery Guarantee: 5–7 Day Expedited International Shipping via DHL".
 *    `shippingTiming.cjs` states verbatim: "Delivery dates are estimates and are
 *    not guaranteed." And 5–7 business days is the **Ready-to-Ship** window to
 *    the US, UK and Canada only (1–2 business days dispatch after the 3-Point
 *    Quality Assurance Check + 4–5 business days DHL/FedEx transit). Custom
 *    Tailored outfits are 15–18 business days total. Quoting one number for both
 *    would promise the fast window on made-to-measure orders, which is exactly
 *    the error corrected across the Pinterest copy.
 *
 * 2. "$20 Saree/Lehenga Custom Alteration Credit Guarantee". The published
 *    policy (`returnPolicyCopy.ALTERATION_CREDIT_SUMMARY`) is **up to** $20 USD
 *    in Local Alteration Credit on custom-stitched blouses, cholis and suit tops,
 *    claimed by emailing a local tailor's receipt to hello@luxemia.shop within
 *    14 days of delivery, backed by a 2-inch internal seam allowance where
 *    garment construction permits. It is a credit against a local tailor's work,
 *    not a guarantee, and not an alteration service for sarees or lehengas.
 *
 * Nothing here may add a claim the storefront does not publish: no shipment
 * insurance, no "handcrafted", no "designer", no fit guarantee, no promise that
 * an email is on its way.
 */

const timing = require('../config/shippingTiming.cjs');

// Mirror of src/config/welcomeOffer.ts (WELCOME_OFFER). The parity test reads
// the TS source directly, so changing one without the other fails CI.
const FIRST10_CODE = 'FIRST10';
const FIRST10_PERCENT = 10;

// Mirror of src/lib/returnPolicyCopy.ts.
const RETURN_CLAIM_WINDOW = '48 hours';
const LOCAL_ALTERATION_CREDIT_USD = 20;
const ALTERATION_CLAIM_DAYS = 14;
const SEAM_ALLOWANCE_INCHES = 2;
const SUPPORT_EMAIL = 'hello@luxemia.shop';
const SUPPORT_PHONE = '+1-215-341-9990';
const STORE_ORIGIN = 'https://luxemia.shop';

/** @param {number} min @param {number} max */
const range = (min, max) => `${min}–${max}`;

const READY_TO_SHIP_WINDOW = range(
  timing.READY_TO_SHIP_TOTAL_MIN_DAYS,
  timing.READY_TO_SHIP_TOTAL_MAX_DAYS,
);
const DISPATCH_WINDOW = range(
  timing.DEFAULT_READY_DISPATCH_MIN_DAYS,
  timing.DEFAULT_READY_DISPATCH_MAX_DAYS,
);
const TRANSIT_WINDOW = range(timing.STANDARD_TRANSIT_MIN_DAYS, timing.STANDARD_TRANSIT_MAX_DAYS);
const CUSTOM_TAILORED_WINDOW = range(
  timing.CUSTOM_TAILORED_TOTAL_MIN_DAYS,
  timing.CUSTOM_TAILORED_TOTAL_MAX_DAYS,
);

/** The one sentence in which the word "guaranteed" may appear. */
const DELIVERY_NOT_GUARANTEED_SENTENCE = 'Delivery dates are estimates and are not guaranteed.';

/**
 * CAN-SPAM (and the UK/CA equivalents) require a valid physical postal address
 * in every commercial email. luxemia.shop publishes only "Philadelphia, PA ·
 * U.S. Support Desk" (Footer.tsx) — no street address — so this stays an
 * obvious placeholder rather than an invented one. The test asserts it is still
 * bracketed, i.e. that nobody can send this template without filling it in.
 */
const POSTAL_ADDRESS_PLACEHOLDER =
  '[OWNER: registered business postal address — required in every commercial email]';

const UNSUBSCRIBE_PLACEHOLDER =
  '[OWNER: unsubscribe link from your sending tool — must work in one click]';

/** Gates that must be cleared before this email is sent to anyone. */
const WELCOME_EMAIL_PREREQUISITES = [
  `${FIRST10_CODE} exists as an ACTIVE Shopify discount (${FIRST10_PERCENT}% off, one use per customer, online store channel). src/config/welcomeOffer.ts warns in-code that advertising a dead code is worse than no code.`,
  'The postal address and unsubscribe placeholders below are filled in with real values.',
  `The sending domain for ${SUPPORT_EMAIL} has SPF/DKIM configured, so the first email a new subscriber gets is not junk-foldered.`,
  'The Flow condition still requires marketing consent (accepts_marketing), so a transactional cart capture is never emailed as a subscriber.',
];

/**
 * Blocks in send order. `includeWhen` keeps a block out of the email entirely
 * rather than sending it with an empty body — a disabled offer must not be
 * advertised, which is how the storefront already behaves
 * (`WELCOME_OFFER.enabled ? code : null`).
 */
const WELCOME_EMAIL_BLOCKS = [
  {
    id: 'offer',
    heading: `Your ${FIRST10_CODE} code`,
    body: `Use code ${FIRST10_CODE} at checkout for ${FIRST10_PERCENT}% off an eligible first order. `
      + 'One use per customer. Final eligibility is confirmed at checkout.',
    /** @param {{ offerEnabled?: boolean }} context */
    includeWhen: (context) => context.offerEnabled !== false,
  },
  {
    id: 'delivery',
    heading: 'When it arrives',
    body: `Orders ship from India after our 3-Point Quality Assurance Check. Ready-to-Ship pieces `
      + `dispatch in ${DISPATCH_WINDOW} business days and arrive in ${READY_TO_SHIP_WINDOW} business `
      + `days to the US, UK and Canada via tracked DHL/FedEx (${TRANSIT_WINDOW} business days in `
      + `transit). Custom Tailored outfits take ${CUSTOM_TAILORED_WINDOW} business days total once `
      + 'your measurements are confirmed. Every listing states which one you are ordering, and you '
      + `get tracking after dispatch. ${DELIVERY_NOT_GUARANTEED_SENTENCE}`,
  },
  {
    id: 'fit',
    heading: 'If the fit needs a touch-up',
    body: `Custom-stitched blouses, cholis and suit tops include a ${SEAM_ALLOWANCE_INCHES}-inch `
      + 'internal seam allowance on both side seams where garment construction permits, plus up to '
      + `$${LOCAL_ALTERATION_CREDIT_USD} USD in Local Alteration Credit when you email your local `
      + `tailor's receipt to ${SUPPORT_EMAIL} within ${ALTERATION_CLAIM_DAYS} days of delivery. All `
      + 'sales are final except where applicable law provides otherwise; if something arrives '
      + `damaged, defective, misdescribed or incomplete, contact us within ${RETURN_CLAIM_WINDOW} of `
      + 'delivery with photos for a full refund or replacement.',
  },
  {
    id: 'support',
    heading: 'Talk to a person',
    body: `Reply to this email, write to ${SUPPORT_EMAIL}, or message ${SUPPORT_PHONE} on WhatsApp. `
      + `The support desk is in Philadelphia. Shipping, returns and alteration terms are published at `
      + `${STORE_ORIGIN}/shipping, ${STORE_ORIGIN}/returns and ${STORE_ORIGIN}/alterations.`,
  },
];

const WELCOME_EMAIL_SUBJECT = `Your ${FIRST10_CODE} code is ready — plus what to expect on delivery`;

const WELCOME_EMAIL_PREHEADER =
  `${FIRST10_PERCENT}% off an eligible first order, tracked delivery from India, and up to `
  + `$${LOCAL_ALTERATION_CREDIT_USD} Local Alteration Credit if a local tailor adjusts the fit.`;

/**
 * The permission + identity footer every commercial email must carry. Kept as a
 * separate export so a sending tool can bind it to its own unsubscribe merge tag.
 */
const WELCOME_EMAIL_LEGAL_FOOTER = [
  "You're receiving this because you subscribed at luxemia.shop.",
  `Unsubscribe any time: ${UNSUBSCRIBE_PLACEHOLDER}`,
  `LuxeMia · ${POSTAL_ADDRESS_PLACEHOLDER}`,
].join('\n');

/**
 * Render the email. Plain text on purpose: it pastes into Shopify Email, a Flow
 * internal notification, or any provider without template work.
 *
 * @param {object} [context]
 * @param {string} [context.firstName]  Shopify customer first name, if captured.
 * @param {boolean} [context.offerEnabled]  false omits the discount block entirely.
 */
function buildWelcomeEmail(context = {}) {
  const blocks = WELCOME_EMAIL_BLOCKS.filter(
    (block) => typeof block.includeWhen === 'function' ? block.includeWhen(context) : true,
  ).map(({ id, heading, body }) => ({ id, heading, body }));

  const greeting = context.firstName ? `Hi ${context.firstName},` : 'Hi,';
  const text = [
    greeting,
    '',
    'Thank you for joining LuxeMia. Here is everything you need for your first order.',
    '',
    ...blocks.flatMap((block) => [block.heading.toUpperCase(), block.body, '']),
    WELCOME_EMAIL_LEGAL_FOOTER,
    '',
  ].join('\n');

  return {
    subject: WELCOME_EMAIL_SUBJECT,
    preheader: WELCOME_EMAIL_PREHEADER,
    blocks,
    legalFooter: WELCOME_EMAIL_LEGAL_FOOTER,
    text,
  };
}

module.exports = {
  FIRST10_CODE,
  FIRST10_PERCENT,
  RETURN_CLAIM_WINDOW,
  LOCAL_ALTERATION_CREDIT_USD,
  ALTERATION_CLAIM_DAYS,
  SEAM_ALLOWANCE_INCHES,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  STORE_ORIGIN,
  READY_TO_SHIP_WINDOW,
  DISPATCH_WINDOW,
  TRANSIT_WINDOW,
  CUSTOM_TAILORED_WINDOW,
  DELIVERY_NOT_GUARANTEED_SENTENCE,
  POSTAL_ADDRESS_PLACEHOLDER,
  UNSUBSCRIBE_PLACEHOLDER,
  WELCOME_EMAIL_PREREQUISITES,
  WELCOME_EMAIL_BLOCKS,
  WELCOME_EMAIL_SUBJECT,
  WELCOME_EMAIL_PREHEADER,
  WELCOME_EMAIL_LEGAL_FOOTER,
  buildWelcomeEmail,
};
