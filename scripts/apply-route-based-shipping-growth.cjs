#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ALL_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'];
const DESTINATIONS = 'the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius';
const ROUTE_SUMMARY = 'U.S. standard shipping is $14.99 below $199 and free at $199+. Canada and the UK are $24.99 below $299 and free at $299+. Australia and New Zealand are $29.99 below $349 and free at $349+. South Africa is $49.99 and Mauritius is $59.99 per order.';

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}

function write(relative, content) {
  fs.writeFileSync(path.join(ROOT, relative), content, 'utf8');
}

function replaceFunction(source, functionName, replacement) {
  const match = new RegExp(`(?:export\\s+)?function\\s+${functionName}\\s*\\(`).exec(source);
  if (!match) throw new Error(`[route-shipping] Function not found: ${functionName}`);
  const start = match.index;
  const opening = source.indexOf('{', start);
  if (opening < 0) throw new Error(`[route-shipping] Opening brace not found: ${functionName}`);
  let depth = 0;
  for (let index = opening; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) return `${source.slice(0, start)}${replacement}${source.slice(index + 1)}`;
    }
  }
  throw new Error(`[route-shipping] Closing brace not found: ${functionName}`);
}

function patchSeoArchitecture() {
  const replacements = [
    ['Indian Ethnic Wear, Sarees & Lehengas USA | LuxeMia', 'LuxeMia Ethnic Wear | Indian Wedding Sarees & Bridal Lehengas USA'],
    ['Shop LuxeMia Indian ethnic wear for U.S. celebrations: bridal lehengas, wedding sarees, salwar kameez, menswear and jewelry with tracked shipping.', 'Shop South Asian bridal wear, wedding sarees, lehengas, suits and menswear with tracked shipping to the USA, Canada, UK and other supported markets.'],
    ['LuxeMia Indian Ethnic Wear for U.S. Weddings & Celebrations', 'Indian Wedding Sarees, Bridal Lehengas & Ethnic Wear'],
    ['Free U.S. shipping at $150+.', 'U.S. shipping is free at $199+.'],
  ];
  for (const relative of ['src/config/seoArchitecture.ts', 'src/config/seoArchitecture.json']) {
    let source = read(relative);
    for (const [from, to] of replacements) source = source.split(from).join(to);
    write(relative, source);
  }
}

function patchHomepage() {
  const relative = 'src/pages/Index.tsx';
  let source = read(relative);
  source = source
    .replace(
      /question: "Where does LuxeMia ship Indian ethnic wear\?",\s*answer: "[^"]*"/,
      `question: "Where does LuxeMia ship Indian ethnic wear?",\n    answer: "LuxeMia ships to ${DESTINATIONS}. ${ROUTE_SUMMARY}"`,
    )
    .replace(
      /question: "How much is US shipping\?",\s*answer: "[^"]*"/,
      'question: "How much is U.S. shipping?",\n    answer: "U.S. standard shipping is $14.99 below $199 and free at $199 and above after discounts. Other countries use route-based rates shown on the Shipping page."',
    )
    .replace('Thoughtful U.S. delivery', 'Tracked delivery to 7 countries');

  if (!source.includes('id="shop-by-need-heading"')) {
    const anchor = '        <section aria-labelledby="homepage-heading"';
    const section = `        <section aria-labelledby="shop-by-need-heading" className="border-b border-[#eaded6] bg-[#fffaf6] py-12 sm:py-16">\n          <div className="container mx-auto max-w-7xl px-5 sm:px-8">\n            <div className="max-w-2xl">\n              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a96f72]">Start with what matters most</p>\n              <h2 id="shop-by-need-heading" className="mt-3 font-serif text-3xl text-[#291f20] sm:text-4xl">A clearer way to find the right outfit.</h2>\n              <p className="mt-4 text-sm leading-7 text-[#665a59] sm:text-base">Shop by processing time, occasion, fit support or destination before comparing individual product details.</p>\n            </div>\n            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">\n              {[\n                { title: 'Need it sooner', copy: 'Only products with a published 1–3 business-day processing window.', href: '/ready-to-ship', cta: 'Shop ready to ship' },\n                { title: 'Shop the event', copy: 'Browse wedding, festive, reception, Navratri and guest-ready edits.', href: '/collections', cta: 'Explore collections' },\n                { title: 'Fit and customization', copy: 'See only the size, stitching or made-to-measure options stated on each listing.', href: '/collections/customizable-indian-outfits', cta: 'View custom options' },\n                { title: 'Know delivery costs', copy: 'Compare route-based rates, free-shipping thresholds, duties and timing.', href: '/shipping', cta: 'Review shipping' },\n              ].map((item) => (\n                <Link key={item.title} to={item.href} className="group rounded-sm border border-[#eaded6] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#c99591] hover:shadow-lg">\n                  <h3 className="font-serif text-xl text-[#291f20]">{item.title}</h3>\n                  <p className="mt-3 text-sm leading-6 text-[#716563]">{item.copy}</p>\n                  <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a96f72]">{item.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>\n                </Link>\n              ))}\n            </div>\n          </div>\n        </section>\n\n`;
    if (!source.includes(anchor)) throw new Error('[route-shipping] Homepage insertion anchor not found');
    source = source.replace(anchor, `${section}${anchor}`);
  }
  write(relative, source);
}

function patchCart() {
  const relative = 'src/components/cart/CartDrawer.tsx';
  let source = read(relative);
  if (!source.includes("@/config/shippingPolicy")) {
    const importAnchor = "} from '@/config/rakshaBandhanCampaign';";
    source = source.replace(importAnchor, `${importAnchor}\nimport { SHIPPING_POLICY_SUMMARY, US_FREE_SHIPPING_THRESHOLD } from '@/config/shippingPolicy';`);
  }
  source = source
    .replace(/const FREE_SHIPPING_THRESHOLD = \d+;/, 'const FREE_SHIPPING_THRESHOLD = US_FREE_SHIPPING_THRESHOLD;')
    .replace(/const SHIPPING_PROMISE = '[^']*';/, 'const SHIPPING_PROMISE = SHIPPING_POLICY_SUMMARY;')
    .replace('Your current subtotal qualifies for free U.S. shipping', 'Your current subtotal qualifies for free U.S. standard shipping')
    .replace('away from complimentary U.S. shipping', 'away from free U.S. standard shipping')
    .replace('Discounts are applied before shipping eligibility. U.S. delivery only; taxes and final delivery options are calculated at checkout.', 'Discounts are applied before shipping eligibility. Destination, local-currency conversion, duties and final delivery options are confirmed at checkout.');
  write(relative, source);
}

function patchTextSurfaces() {
  const roots = ['index.html', 'api', 'public', 'src', 'supabase/functions', 'scripts/prerender.js'];
  const extensions = new Set(['.html', '.ts', '.tsx', '.js', '.cjs', '.txt', '.md', '.json']);
  const skip = new Set(['apply-route-based-shipping-growth.cjs', 'validate-route-based-shipping.cjs']);
  const files = [];
  const walk = (relative) => {
    const absolute = path.join(ROOT, relative);
    if (!fs.existsSync(absolute)) return;
    const stat = fs.statSync(absolute);
    if (stat.isFile()) {
      if (extensions.has(path.extname(absolute)) && !skip.has(path.basename(absolute))) files.push(relative);
      return;
    }
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) walk(path.join(relative, entry.name));
  };
  roots.forEach(walk);

  const replacements = [
    ['U.S. standard shipping is $12 below $150 and free at $150 and above.', 'U.S. standard shipping is $14.99 below $199 and free at $199 and above.'],
    ['U.S. standard shipping is $12 below $150 and free at $150 and above', 'U.S. standard shipping is $14.99 below $199 and free at $199 and above'],
    ['Standard shipping is $12 below $150 and free at $150 and above.', 'U.S. standard shipping is $14.99 below $199 and free at $199 and above.'],
    ['$12 standard shipping below $150', '$14.99 U.S. standard shipping below $199'],
    ['Free U.S. shipping at $150 and above', 'Free U.S. standard shipping at $199 and above'],
    ['free U.S. shipping at $150 and above', 'free U.S. standard shipping at $199 and above'],
    ['Free U.S. shipping at $150+', 'Free U.S. standard shipping at $199+'],
    ['free at $150+', 'free at $199+'],
    ['International standard shipping is $14.99 below $300 and free at $300 and above.', ROUTE_SUMMARY],
    ['International standard shipping is $14.99 below $300 and free at $300 and above', ROUTE_SUMMARY],
    ['$14.99 USD below $300 USD; free at $300 USD and above', 'Canada/UK: $24.99 below $299, free at $299+; Australia/New Zealand: $29.99 below $349, free at $349+; South Africa: $49.99; Mauritius: $59.99'],
  ];

  for (const relative of files) {
    let source = read(relative);
    const original = source;
    for (const [from, to] of replacements) source = source.split(from).join(to);
    if (source !== original) write(relative, source);
  }
}

const shippingServicesFunction = `export function generateUsShippingServiceSchema() {
  const createService = (id: string, name: string, countries: string | string[], rate: number, freeThreshold?: number) => ({
    '@type': 'ShippingService',
    '@id': \`${'${SITE_URL}'}/#${'${id}'}\`,
    name,
    shippingConditions: [
      {
        '@type': 'ShippingConditions',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: countries },
        ...(freeThreshold ? { orderValue: { '@type': 'MonetaryAmount', minValue: 0, maxValue: freeThreshold - 0.01, currency: 'USD' } } : {}),
        shippingRate: { '@type': 'MonetaryAmount', value: rate, currency: 'USD' },
      },
      ...(freeThreshold ? [{
        '@type': 'ShippingConditions',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: countries },
        orderValue: { '@type': 'MonetaryAmount', minValue: freeThreshold, currency: 'USD' },
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
      }] : []),
    ],
  });

  return [
    createService('us-standard-shipping', 'LuxeMia U.S. Standard Shipping', 'US', 14.99, 199),
    createService('canada-uk-standard-shipping', 'LuxeMia Canada and UK Standard Shipping', ['CA', 'GB'], 24.99, 299),
    createService('australia-nz-standard-shipping', 'LuxeMia Australia and New Zealand Standard Shipping', ['AU', 'NZ'], 29.99, 349),
    createService('south-africa-standard-shipping', 'LuxeMia South Africa Standard Shipping', 'ZA', 49.99),
    createService('mauritius-standard-shipping', 'LuxeMia Mauritius Standard Shipping', 'MU', 59.99),
  ];
}`;

const productShippingFunction = `export function generateUsProductShippingDetails(shipsWithinDays?: number | null) {
  const handlingDays = normalizeShipsWithinDays(shipsWithinDays);
  const deliveryTime = handlingDays ? {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: handlingDays, unitCode: 'DAY' },
  } : null;
  const withTime = (details: Record<string, unknown>) => ({ ...details, ...(deliveryTime && { deliveryTime }) });
  const create = (countries: string | string[], rate: number, freeThreshold?: number) => [
    withTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: countries },
      ...(freeThreshold ? { orderValue: { '@type': 'MonetaryAmount', maxValue: freeThreshold - 0.01, currency: 'USD' } } : {}),
      shippingRate: { '@type': 'MonetaryAmount', value: rate, currency: 'USD' },
    }),
    ...(freeThreshold ? [withTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: countries },
      orderValue: { '@type': 'MonetaryAmount', minValue: freeThreshold, currency: 'USD' },
      shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
    })] : []),
  ];
  return [
    ...create('US', 14.99, 199),
    ...create(['CA', 'GB'], 24.99, 299),
    ...create(['AU', 'NZ'], 29.99, 349),
    ...create('ZA', 49.99),
    ...create('MU', 59.99),
  ];
}`;

const prerenderProductShippingFunction = `function generateUsProductShippingDetails(shipsWithinDays) {
  const handlingDays = Number.isFinite(shipsWithinDays) && shipsWithinDays > 0 ? Math.trunc(shipsWithinDays) : null;
  const deliveryTime = handlingDays ? {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: handlingDays, unitCode: 'DAY' },
  } : null;
  const withTime = (details) => ({ ...details, ...(deliveryTime ? { deliveryTime } : {}) });
  const create = (countries, rate, freeThreshold) => [
    withTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: countries },
      ...(freeThreshold ? { orderValue: { '@type': 'MonetaryAmount', maxValue: freeThreshold - 0.01, currency: 'USD' } } : {}),
      shippingRate: { '@type': 'MonetaryAmount', value: rate, currency: 'USD' },
    }),
    ...(freeThreshold ? [withTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: countries },
      orderValue: { '@type': 'MonetaryAmount', minValue: freeThreshold, currency: 'USD' },
      shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
    })] : []),
  ];
  return [
    ...create('US', 14.99, 199),
    ...create(['CA', 'GB'], 24.99, 299),
    ...create(['AU', 'NZ'], 29.99, 349),
    ...create('ZA', 49.99),
    ...create('MU', 59.99),
  ];
}`;

function patchSchema() {
  let schema = read('src/lib/schema.ts');
  schema = schema.replace(
    /export const SHIPPING_COUNTRIES = \[[^\]]*\];(?:\nexport const INTERNATIONAL_SHIPPING_COUNTRIES = \[[^\]]*\];)?/,
    "export const SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'];\nexport const INTERNATIONAL_SHIPPING_COUNTRIES = ['CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'];",
  );
  schema = schema.replace("'@type': 'OnlineStore',", "'@type': ['OnlineStore', 'ClothingStore'],");
  schema = replaceFunction(schema, 'generateUsShippingServiceSchema', shippingServicesFunction);
  schema = replaceFunction(schema, 'generateUsProductShippingDetails', productShippingFunction);
  write('src/lib/schema.ts', schema);

  let prerender = read('scripts/prerender.js');
  prerender = replaceFunction(prerender, 'generateUsProductShippingDetails', prerenderProductShippingFunction);
  write('scripts/prerender.js', prerender);
}

function patchHomepageJsonLd() {
  const relative = 'index.html';
  let html = read(relative);
  html = html.replace(/<title>[^<]*<\/title>/, '<title>LuxeMia Ethnic Wear | Indian Wedding Sarees & Bridal Lehengas USA</title>');
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/>/, '<meta name="description" content="Shop South Asian bridal wear, wedding sarees, lehengas, suits and menswear with tracked shipping to the USA, Canada, UK and other supported markets." />');

  const marker = '<script type="application/ld+json">';
  const scriptStart = html.indexOf(marker);
  const jsonStart = html.indexOf('{', scriptStart);
  const scriptEnd = html.indexOf('</script>', jsonStart);
  if (scriptStart < 0 || jsonStart < 0 || scriptEnd < 0) throw new Error('[route-shipping] Homepage JSON-LD not found');
  const data = JSON.parse(html.slice(jsonStart, scriptEnd).trim());
  const graph = Array.isArray(data['@graph']) ? data['@graph'] : [];
  const organization = graph.find((node) => node['@type'] === 'Organization');
  const store = graph.find((node) => node['@type'] === 'OnlineStore' || (Array.isArray(node['@type']) && node['@type'].includes('OnlineStore')));
  const returnPolicy = graph.find((node) => node['@type'] === 'MerchantReturnPolicy');
  if (!organization || !store) throw new Error('[route-shipping] Required homepage entity nodes missing');

  const serviceIds = [
    'us-standard-shipping',
    'canada-uk-standard-shipping',
    'australia-nz-standard-shipping',
    'south-africa-standard-shipping',
    'mauritius-standard-shipping',
  ];
  organization.description = 'Indian ethnic wear, wedding sarees, bridal lehengas, suits and menswear with tracked delivery to seven countries.';
  organization.contactPoint.areaServed = ALL_COUNTRIES;
  organization.hasShippingService = serviceIds.map((id) => ({ '@id': `https://luxemia.shop/#${id}` }));
  store['@type'] = ['OnlineStore', 'ClothingStore'];
  store.description = 'South Asian ethnic wear store offering sarees, lehengas, suits and menswear with route-based tracked shipping.';
  store.areaServed = ALL_COUNTRIES.map((code) => ({ '@type': 'Country', name: code }));
  store.hasShippingService = organization.hasShippingService;
  // Older source snapshots contained one global MerchantReturnPolicy. The
  // final trust normalizer intentionally removes it because country-specific
  // mandatory rights and the voluntary final-sale rule cannot be represented
  // accurately by one machine-readable category. Keep this migration
  // idempotent when that optional legacy node is already absent.
  if (returnPolicy) {
    returnPolicy.applicableCountry = ALL_COUNTRIES;
    returnPolicy.returnPolicyCountry = ALL_COUNTRIES;
  }

  const makeService = (id, name, countries, rate, threshold) => ({
    '@type': 'ShippingService',
    '@id': `https://luxemia.shop/#${id}`,
    name,
    shippingConditions: [
      {
        '@type': 'ShippingConditions',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: countries },
        ...(threshold ? { orderValue: { '@type': 'MonetaryAmount', minValue: 0, maxValue: threshold - 0.01, currency: 'USD' } } : {}),
        shippingRate: { '@type': 'MonetaryAmount', value: rate, currency: 'USD' },
      },
      ...(threshold ? [{
        '@type': 'ShippingConditions',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: countries },
        orderValue: { '@type': 'MonetaryAmount', minValue: threshold, currency: 'USD' },
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
      }] : []),
    ],
  });

  data['@graph'] = graph.filter((node) => node['@type'] !== 'ShippingService');
  data['@graph'].push(
    makeService('us-standard-shipping', 'LuxeMia U.S. Standard Shipping', 'US', 14.99, 199),
    makeService('canada-uk-standard-shipping', 'LuxeMia Canada and UK Standard Shipping', ['CA', 'GB'], 24.99, 299),
    makeService('australia-nz-standard-shipping', 'LuxeMia Australia and New Zealand Standard Shipping', ['AU', 'NZ'], 29.99, 349),
    makeService('south-africa-standard-shipping', 'LuxeMia South Africa Standard Shipping', 'ZA', 49.99),
    makeService('mauritius-standard-shipping', 'LuxeMia Mauritius Standard Shipping', 'MU', 59.99),
  );

  const rendered = JSON.stringify(data, null, 2).split('\n').map((line) => `    ${line}`).join('\n');
  html = `${html.slice(0, jsonStart)}${rendered}\n    ${html.slice(scriptEnd)}`;
  write(relative, html);
}

patchSeoArchitecture();
patchHomepage();
patchCart();
patchTextSurfaces();
patchSchema();
patchHomepageJsonLd();

console.log('[route-shipping] Route-based rates, schema, metadata and buyer-discovery paths applied.');
