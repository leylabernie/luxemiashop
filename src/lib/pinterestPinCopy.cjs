'use strict';

/**
 * Pinterest / social pin copy builders — shared by the storefront share
 * buttons (`src/lib/pinterestPin.ts`) and the offline pin scheduler generator
 * (`scripts/generate-pinterest-scheduler.cjs`) so published pins and on-page
 * share copy can never drift apart.
 *
 * Every sentence here repeats a fact that is already published on
 * luxemia.shop, with its qualifier intact:
 *
 * - Delivery windows: `src/config/shippingTiming.cjs` (the source of truth
 *   behind /shipping). Ready-to-Ship = 1–2 business days dispatch + 4–5
 *   business days transit = 5–7 business days to US/UK/CA via DHL/FedEx.
 *   Custom Tailored = 15–18 business days total. Orders ship from India.
 * - Lining: "breathable soft cotton or crepe inner lining where applicable"
 *   (product FAQ). Never "100% cotton" for every style.
 * - Seam allowance: 2-inch (5 cm) internal allowance on both side seams of
 *   custom-stitched blouses, cholis and suit tops where construction permits,
 *   backed by up to $20 USD Local Alteration Credit claimed with a tailor's
 *   receipt photo within 14 days of delivery (/alterations, /returns).
 * - U.S. shipping $14.99, free at $150+ (`src/config/shippingPolicy.ts`).
 * - Philadelphia support desk: +1-215-341-9990.
 *
 * Never added here because the storefront does not publish them: shipment
 * insurance, "handcrafted" (stripped by productDescriptionEnrichment.ts),
 * "designer", or any fit "guarantee".
 */

const timing = require('../config/shippingTiming.cjs');

// Mirror of US_STANDARD_SHIPPING_RATE / US_FREE_SHIPPING_THRESHOLD in
// src/config/shippingPolicy.ts. tests/pinterestPinCopy.test.cjs fails if the
// policy module changes without this file.
const US_STANDARD_SHIPPING_RATE = 14.99;
const US_FREE_SHIPPING_THRESHOLD = 150;
const SUPPORT_PHONE = '+1-215-341-9990';
const LOCAL_ALTERATION_CREDIT_USD = 20;
const ALTERATION_CLAIM_DAYS = 14;
const SEAM_ALLOWANCE_INCHES = 2;
const SEAM_ALLOWANCE_CM = 5;

/** Pinterest truncates pin titles at 100 characters. */
const PIN_TITLE_MAX_LENGTH = 100;
/** Pinterest truncates pin descriptions at 500 characters. */
const PIN_DESCRIPTION_MAX_LENGTH = 500;

const range = (min, max) => `${min}–${max}`;

const READY_TO_SHIP_WINDOW = range(
  timing.READY_TO_SHIP_TOTAL_MIN_DAYS,
  timing.READY_TO_SHIP_TOTAL_MAX_DAYS,
);
const CUSTOM_TAILORED_WINDOW = range(
  timing.CUSTOM_TAILORED_TOTAL_MIN_DAYS,
  timing.CUSTOM_TAILORED_TOTAL_MAX_DAYS,
);
const DISPATCH_WINDOW = range(
  timing.DEFAULT_READY_DISPATCH_MIN_DAYS,
  timing.DEFAULT_READY_DISPATCH_MAX_DAYS,
);
const TRANSIT_WINDOW = range(timing.STANDARD_TRANSIT_MIN_DAYS, timing.STANDARD_TRANSIT_MAX_DAYS);

const cleanPart = (value) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/\s*\|\s*LuxeMia\s*$/i, '')
    .trim();

const truncateToWord = (value, max) => {
  if (value.length <= max) return value;
  const slice = value.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trim()}…`;
};

const titleCase = (value) => String(value).replace(/\b[a-z]/g, (character) => character.toUpperCase());

/**
 * Pin title formula: `[Color] [Fabric] [Category] for [Occasion] | LuxeMia`.
 * Falls back to the cleaned product title when catalog attributes are missing.
 */
function buildPinTitle(input = {}) {
  const lead = [cleanPart(input.color), cleanPart(input.material), cleanPart(input.category)]
    .filter(Boolean)
    .join(' ');
  const occasion = cleanPart(input.occasion);
  const base = lead
    ? `${lead}${occasion ? ` for ${occasion}` : ''}`
    : cleanPart(String(input.title || '').replace(/^LuxeMia\s+(?:Women's|Men's|Kids)\s+/i, ''))
      || 'Indian Ethnic Wear';
  return truncateToWord(`${base} | LuxeMia`, PIN_TITLE_MAX_LENGTH);
}

// Pinterest truncates pin descriptions at 500 characters and board
// descriptions at 500 as well, so every sentence stays short enough that a pin
// can carry the delivery window, one proof point and the support line at once.
// Qualifiers are never shortened away — they are what keeps the copy truthful.
const DELIVERY_SENTENCES = {
  'ready-to-ship':
    `Ready-to-Ship: ${READY_TO_SHIP_WINDOW} business days to the US, UK & Canada `
    + `(${DISPATCH_WINDOW} business days dispatch after our 3-Point QA Check + ${TRANSIT_WINDOW} business days DHL/FedEx transit).`,
  'custom-tailored':
    `Custom Tailored: ${CUSTOM_TAILORED_WINDOW} business days total once measurements are confirmed.`,
  unstitched:
    `Unstitched set — the listing states the included pieces. Ready-to-Ship unstitched sets arrive in ${READY_TO_SHIP_WINDOW} business days to the US, UK & Canada.`,
  // Used by scheduled pins: the shopper picks stitched or custom on the PDP,
  // so both published windows are stated instead of promising the fast one.
  both:
    `Tracked DHL/FedEx from India: Ready-to-Ship ${READY_TO_SHIP_WINDOW} business days to US/UK/CA, Custom Tailored ${CUSTOM_TAILORED_WINDOW} business days total.`,
  unknown: 'Check the listing for this style’s dispatch and delivery window.',
};

const LINING_SENTENCE =
  'Lined pieces use a breathable soft cotton or crepe inner lining where applicable — the listing states this style’s construction.';

const MARGIN_SENTENCE =
  `Custom-stitched blouses, cholis and suit tops carry a ${SEAM_ALLOWANCE_INCHES}-inch (${SEAM_ALLOWANCE_CM} cm) internal seam allowance where construction permits, with up to $${LOCAL_ALTERATION_CREDIT_USD} USD Local Alteration Credit claimed within ${ALTERATION_CLAIM_DAYS} days of delivery.`;

const SUPPORT_SENTENCE =
  `U.S. shipping $${US_STANDARD_SHIPPING_RATE.toFixed(2)}, free at $${US_FREE_SHIPPING_THRESHOLD}+. Philadelphia support: ${SUPPORT_PHONE}.`;

/**
 * Pin description: published facts only, in priority order, always keeping the
 * canonical product URL inside Pinterest's 500-character limit. Lower-priority
 * sentences are dropped whole rather than truncated mid-claim.
 */
function buildPinDescription(input = {}) {
  const title = cleanPart(input.title) || 'Indian ethnic wear';
  const fulfillment = DELIVERY_SENTENCES[input.fulfillment] ? input.fulfillment : 'unknown';
  const shopLine = `Shop at LuxeMia: ${input.url || 'https://luxemia.shop'}`;
  const lead = `${title}. ${DELIVERY_SENTENCES[fulfillment]}`;
  const optional = [LINING_SENTENCE, MARGIN_SENTENCE, SUPPORT_SENTENCE];

  let description = `${lead} ${shopLine}`;
  const included = [];
  for (const sentence of optional) {
    const candidate = [lead, ...included, sentence, shopLine].join(' ');
    if (candidate.length <= PIN_DESCRIPTION_MAX_LENGTH) {
      included.push(sentence);
      description = candidate;
    }
  }
  return description.length <= PIN_DESCRIPTION_MAX_LENGTH
    ? description
    : truncateToWord(description, PIN_DESCRIPTION_MAX_LENGTH);
}

/** Read the catalog `occasion:` tag; never infer an occasion from the title. */
function occasionFromTags(tags) {
  const value = (tags || [])
    .map((tag) => String(tag).match(/^\s*occasion\s*:\s*(.+)$/i)?.[1]?.trim())
    .find(Boolean);
  return value ? titleCase(value) : undefined;
}

/**
 * A listing only earns the Ready-to-Ship window when the storefront already
 * shows it: an explicit dispatch metafield inside the stocked 1–2 day window
 * and no custom stitching, alteration, made-to-order or confirm-first state.
 */
function resolvePinFulfillment(context = {}) {
  const {
    shipsWithinDays = null,
    isUnstitched = false,
    isCustomTailored = false,
    confirmAvailability = false,
  } = context;
  if (isCustomTailored || confirmAvailability) return 'custom-tailored';
  if (isUnstitched) return 'unstitched';
  if (
    typeof shipsWithinDays === 'number'
    && shipsWithinDays >= timing.DEFAULT_READY_DISPATCH_MIN_DAYS
    && shipsWithinDays <= timing.DEFAULT_READY_DISPATCH_MAX_DAYS
  ) {
    return 'ready-to-ship';
  }
  return 'unknown';
}

/** Append UTM parameters without duplicating them or breaking ?variant=. */
function withShareUtm(url, source, medium = 'organic_social', campaign = 'product_share') {
  if (!url || /[?&]utm_source=/i.test(url)) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}utm_source=${encodeURIComponent(source)}&utm_medium=${encodeURIComponent(medium)}&utm_campaign=${encodeURIComponent(campaign)}`;
}

function buildPinterestShareUrl(input = {}) {
  const destination = withShareUtm(input.url, 'pinterest');
  const description = buildPinDescription({ ...input, url: destination });
  return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(destination)}${
    input.image ? `&media=${encodeURIComponent(input.image)}` : ''
  }&description=${encodeURIComponent(description)}`;
}

function buildWhatsAppShareText(title, url) {
  return `Check out ${cleanPart(title) || 'Indian ethnic wear'} at LuxeMia\n\n${withShareUtm(url, 'whatsapp')}`;
}

function buildFacebookShareText(title, url) {
  return `${cleanPart(title) || 'Indian ethnic wear'} — LuxeMia\n${withShareUtm(url, 'facebook')}`;
}

module.exports = {
  PIN_TITLE_MAX_LENGTH,
  PIN_DESCRIPTION_MAX_LENGTH,
  US_STANDARD_SHIPPING_RATE,
  US_FREE_SHIPPING_THRESHOLD,
  SUPPORT_PHONE,
  LOCAL_ALTERATION_CREDIT_USD,
  ALTERATION_CLAIM_DAYS,
  SEAM_ALLOWANCE_INCHES,
  SEAM_ALLOWANCE_CM,
  READY_TO_SHIP_WINDOW,
  CUSTOM_TAILORED_WINDOW,
  DISPATCH_WINDOW,
  TRANSIT_WINDOW,
  DELIVERY_SENTENCES,
  LINING_SENTENCE,
  MARGIN_SENTENCE,
  SUPPORT_SENTENCE,
  buildPinTitle,
  buildPinDescription,
  occasionFromTags,
  resolvePinFulfillment,
  withShareUtm,
  buildPinterestShareUrl,
  buildWhatsAppShareText,
  buildFacebookShareText,
};
