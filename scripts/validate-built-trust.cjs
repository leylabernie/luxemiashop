#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PRERENDER = path.join(DIST, '_prerender');
const HOME_TITLE = 'Indian Wedding Sarees, Lehengas & Ethnic Wear | LuxeMia';
const HOME_DESCRIPTION = 'Shop South Asian bridal wear, sarees, lehengas, suits and menswear with tracked shipping to seven supported countries.';
const SHIPPING_TITLE = 'Shipping Policy & International Rates | LuxeMia';
const failures = [];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(file);
    return entry.name.endsWith('.html') ? [file] : [];
  });
}

function readPrerender(route) {
  const relative = route === '/' ? 'index.html' : `${route.replace(/^\//, '')}.html`;
  const file = path.join(PRERENDER, relative);
  if (!fs.existsSync(file)) {
    failures.push(`built prerender route missing: ${route}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function requireAll(label, source, snippets) {
  for (const snippet of snippets) {
    if (!source.includes(snippet)) failures.push(`${label} missing required built value: ${snippet}`);
  }
}

function requireTitle(label, source, title) {
  const escaped = title.replace(/&/g, '&amp;');
  if (!source.includes(`<title>${title}</title>`) && !source.includes(`<title>${escaped}</title>`)) {
    failures.push(`${label} missing required built title: ${title}`);
  }
}

function inspectJsonLd(label, source, required = false) {
  const scripts = [...source.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  if (required && scripts.length === 0) failures.push(`${label} has no JSON-LD blocks`);
  for (const [index, match] of scripts.entries()) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const serialized = JSON.stringify(parsed);
      if (serialized.includes('MerchantReturnPolicy')) failures.push(`${label} JSON-LD block ${index + 1} contains MerchantReturnPolicy`);
      if (serialized.includes('MerchantReturnNotPermitted')) failures.push(`${label} JSON-LD block ${index + 1} contains MerchantReturnNotPermitted`);
      if (serialized.includes('Glamour Indian Wear')) failures.push(`${label} JSON-LD block ${index + 1} contains unverified legal name`);
      if (serialized.includes('priceValidUntil')) failures.push(`${label} JSON-LD block ${index + 1} contains unsupported priceValidUntil`);
    } catch (error) {
      failures.push(`${label} JSON-LD block ${index + 1} is invalid JSON: ${error.message}`);
    }
  }
}

if (!fs.existsSync(PRERENDER)) {
  console.error('[built-trust] prerender directory does not exist');
  process.exit(1);
}

const allHtmlFiles = walk(DIST);
if (allHtmlFiles.length === 0) failures.push('dist contains no HTML files');

const blocked = [
  /MerchantReturnNotPermitted/i,
  /['"]@type['"]\s*:\s*['"]MerchantReturnPolicy['"]/i,
  /Glamour Indian Wear/i,
  /United States addresses only/i,
  /U\.S\. delivery only/i,
  /\$12[^\n]{0,100}(?:shipping|below \$150)/i,
  /free[^\n]{0,60}\$150/i,
  /International standard shipping is \$14\.99 below \$300/i,
  /Free worldwide shipping/i,
  /Free standard shipping on orders over \$350 to USA, Canada, and Australia/i,
  /All orders ship with full DHL Express tracking/i,
  /Custom sizing:\s*Available on request/i,
  /LuxeMia — Indian Ethnic Wear Online for (?:US|U\.S\.) Delivery/i,
  /priceValidUntil/i,
  /published 1[–-]3 business-day processing/i,
  /processing window of three business days or less/i,
  /After that window, cancellation requests are not accepted/i,
  /database row-level controls/i,
  /AUD,\s*CAD,\s*GBP,\s*MUR,\s*NZD,\s*USD/i,
  /(?:U\.S\.|USA|US)-based (?:online )?(?:customer )?support/i,
  /U\.S\.-based online retail team/i,
  /LuxeMia participates in Google Customer Reviews/i,
  /On an eligible order(?:-| )confirmation page,[^\n]{0,180}(?:Google|opt-in|survey)/i,
  /Google sends and hosts the survey/i,
  /tracking(?: details)? (?:are )?(?:emailed|provided|sent)(?: after dispatch| when the shipping label is created)?/i,
  /(?:items|orders) receive tracking after dispatch/i,
];

for (const file of allHtmlFiles) {
  const relative = path.relative(DIST, file).replace(/\\/g, '/');
  const source = fs.readFileSync(file, 'utf8');
  for (const pattern of blocked) {
    const match = source.match(pattern);
    if (!match || match.index === undefined) continue;
    const line = source.slice(0, match.index).split('\n').length;
    const context = source.slice(Math.max(0, match.index - 90), Math.min(source.length, match.index + match[0].length + 110)).replace(/\s+/g, ' ').trim();
    failures.push(`${relative}:${line} contains blocked built value matching ${pattern}; context: ${context}`);
  }
  inspectJsonLd(relative, source);
}

const home = readPrerender('/');
requireTitle('home', home, HOME_TITLE);
requireAll('home', home, [HOME_DESCRIPTION, '"ClothingStore"', 'hello@luxemia.shop', '+1-215-341-9990']);
if (!/"currenciesAccepted"\s*:\s*"USD"/.test(home)) {
  failures.push('home missing exact USD currenciesAccepted value');
}
inspectJsonLd('home', home, true);

const shipping = readPrerender('/shipping');
requireTitle('shipping', shipping, SHIPPING_TITLE);
requireAll('shipping', shipping, ['$14.99', '$199', '$24.99', '$299', '$29.99', '$349', '$49.99', '$59.99', 'Canada', 'United Kingdom', 'South Africa', 'Mauritius', 'When tracking is issued, carrier scans can appear after label creation.']);
inspectJsonLd('shipping', shipping, true);

const ready = readPrerender('/ready-to-ship');
requireAll('ready-to-ship', ready, ['Ready-to-Ship Indian Ethnic Wear']);
inspectJsonLd('ready-to-ship', ready, true);

const readyProductLinks = new Set(
  [...ready.matchAll(/href="\/product\/([^"?]+)"/g)].map((match) => match[1]),
);
const readyHasProductPayload = /window\.__INITIAL_DATA__\s*=/.test(ready);
if (readyHasProductPayload) {
  requireAll('ready-to-ship', ready, [
    'explicitly identifies ready-to-ship status through a supported tag or positive ships-within value',
    'Sale availability by itself is not evidence of stocked fulfillment',
    'Processing and carrier transit are separate',
    'View route-based rates',
  ]);
  if (readyProductLinks.size === 0) failures.push('ready-to-ship has a product payload but no crawlable product links');
  if (/content="noindex, follow"/.test(ready)) failures.push('ready-to-ship has products but is noindexed');
} else {
  requireAll('ready-to-ship empty result', ready, [
    'content="noindex, follow"',
    'No current products met the explicit ready-to-ship evidence and available-variant requirements',
  ]);
  if (readyProductLinks.size > 0) failures.push('empty ready-to-ship result contains product links');
  if (/['"]@type['"]\s*:\s*['"](?:CollectionPage|ItemList)['"]/.test(ready)) {
    failures.push('empty ready-to-ship result contains substantive collection schema');
  }
}

const about = readPrerender('/about');
requireAll('about', about, [
  'online-only Indian ethnic wear store',
  'product-specific information and online support',
  'There is no public walk-in showroom',
  'A general fabric name is not presented as an exact fiber composition',
  'availability to buy does not itself prove immediate dispatch',
  '/editorial-policy',
  '/review-policy',
]);

const contact = readPrerender('/contact');
requireAll('contact', contact, [
  'Reach online support by email, phone, WhatsApp or the contact form',
  'mailto:hello@luxemia.shop',
  'tel:+12153419990',
  'https://wa.me/12153419990',
  'response times vary and same-day replies are not guaranteed',
  'Do not send payment-card details',
  '/privacy',
  '/returns',
]);

const privacy = readPrerender('/privacy');
requireAll('privacy', privacy, [
  'Merely using the site is not consent to optional analytics',
  'measurements, budget, event date, free-text requirements',
  'Shopify and checkout/payment services',
  'Supabase',
  'Google Analytics is not loaded from the initial HTML',
  'any future Customer Reviews badge or survey processing only under the verified conditions described below',
  'The public LuxeMia return page does not trust order identifiers, email addresses, totals, countries or delivery dates supplied in its URL',
  'If a required value is unavailable or cannot be verified, the survey must not render',
  'If a survey is later verified and enabled',
  'No internet service can guarantee complete security',
  'Privacy request',
]);

const terms = readPrerender('/terms');
requireAll('terms', terms, [
  'exact product page is the source of truth',
  'Shopify-hosted checkout',
  'Ready-to-ship',
  'Processing occurs before carrier transit',
  'Change-of-mind purchases are final sale',
  'rights that cannot legally be excluded',
  'other rights holders',
]);

const support = readPrerender('/us-support');
requireTitle('us-support', support, 'Online Support for U.S. Customers | LuxeMia');
requireAll('us-support', support, [
  'Requests are reviewed through the online queue',
  'mailto:hello@luxemia.shop',
  'https://wa.me/12153419990',
  'Address changes may not be possible after fulfillment begins',
  'continuous unboxing video when available',
  'it does not remove rights that cannot legally be excluded',
]);

const editorial = readPrerender('/editorial-policy');
requireAll('editorial-policy', editorial, [
  'tags, metafields or other traceable catalog evidence',
  'Material names are not converted into fiber percentages',
  'not inferred from sale availability alone',
  'primary or established sources',
  'publication and last-reviewed dates',
  'supporting source',
]);

const review = readPrerender('/review-policy');
requireTitle('review-policy', review, 'Customer Review Program Conditions | LuxeMia');
requireAll('review-policy', review, [
  'This page does not claim that Google Customer Reviews enrollment, survey eligibility or a seller rating is currently active',
  'with the shopper deciding whether to opt in',
  'The public LuxeMia return page has no signed Shopify order context',
  'A survey integration may be enabled only in Shopify’s protected post-purchase context',
  'If a required field is unavailable or cannot be verified, the survey must not render',
  'The shopper must retain the optional opt-in choice described by the provider.',
  'does not create, seed, rewrite or selectively suppress customer reviews',
  'A badge-script request by itself is not evidence that enrollment, survey eligibility or a seller rating is active',
  '/editorial-policy',
]);

if (failures.length) {
  console.error('[built-trust] Validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`[built-trust] OK — ${allHtmlFiles.length} built HTML pages have aligned metadata, route-based shipping, positive-evidence Ready-to-Ship classification and no false global return schema.`);
