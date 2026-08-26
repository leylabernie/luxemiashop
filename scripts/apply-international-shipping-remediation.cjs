#!/usr/bin/env node

/**
 * Restore LuxeMia's verified seven-country shipping policy before validation,
 * bundling, prerendering, and feed generation.
 *
 * The storefront, Shopify Markets, checkout zones, Merchant Center account
 * settings, structured data, and generated catalog copy must agree on:
 * - United States: $12 below $150; free at $150+
 * - Canada, United Kingdom, Australia, New Zealand, South Africa, Mauritius:
 *   $14.99 below $300; free at $300+
 * - Final-sale / covered-order-issue policy remains unchanged.
 *
 * This script is intentionally idempotent. It also repairs generated source
 * surfaces that previously reintroduced a U.S.-only claim during releases.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'];
const INTERNATIONAL_SHIPPING_COUNTRIES = ['CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'];
const DESTINATIONS = 'the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius';
const DESTINATIONS_NO_ARTICLE = 'United States, Canada, United Kingdom, Australia, New Zealand, South Africa, and Mauritius';
const INTERNATIONAL_RATE_COPY = 'International standard shipping is $14.99 below $300 and free at $300 and above';
const SHIPPING_PROMISE = `Shipping is available to ${DESTINATIONS}. U.S. standard shipping is $12 below $150 and free at $150 and above. ${INTERNATIONAL_RATE_COPY}. Duties, import taxes, brokerage, or carrier fees may apply unless checkout explicitly states otherwise. Tracking is provided after dispatch.`;

const roots = [
  'index.html',
  'api',
  'public',
  'src',
  'supabase/functions',
  'scripts',
  'CREAO_AI_PROMPT.md',
  'build_csv.py',
  'build_boutique_csv.py',
];
const supportedExtensions = new Set(['.html', '.ts', '.tsx', '.js', '.cjs', '.py', '.txt', '.md', '.json']);
const skipBasenames = new Set([
  'apply-international-shipping-remediation.cjs',
  'validate-current-policy-copy.cjs',
]);

function listFiles(relativePath) {
  const absolutePath = path.join(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) return [];
  const stat = fs.statSync(absolutePath);
  if (stat.isFile()) return supportedExtensions.has(path.extname(absolutePath)) ? [absolutePath] : [];
  return fs.readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(absolutePath, entry.name);
    if (entry.isDirectory()) return listFiles(path.relative(PROJECT_ROOT, child));
    return supportedExtensions.has(path.extname(entry.name)) ? [child] : [];
  });
}

function replaceFunction(source, functionName, replacement) {
  const expression = new RegExp(`(?:export\\s+)?function\\s+${functionName}\\s*\\(`);
  const match = expression.exec(source);
  if (!match) throw new Error(`[international-shipping] Function not found: ${functionName}`);
  const start = match.index;
  const openingBrace = source.indexOf('{', start);
  if (openingBrace < 0) throw new Error(`[international-shipping] Opening brace not found: ${functionName}`);

  let depth = 0;
  for (let index = openingBrace; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return `${source.slice(0, start)}${replacement}${source.slice(index + 1)}`;
      }
    }
  }
  throw new Error(`[international-shipping] Closing brace not found: ${functionName}`);
}

function applyTextReplacements(input) {
  let text = input;
  const replacements = [
    ['LuxeMia currently ships to United States addresses only.', `LuxeMia ships to ${DESTINATIONS}.`],
    ['LuxeMia currently ships to United States addresses only', `LuxeMia ships to ${DESTINATIONS}`],
    ['LuxeMia currently accepts United States shipping addresses only.', `LuxeMia accepts shipping addresses in ${DESTINATIONS}.`],
    ['LuxeMia currently accepts United States shipping addresses only', `LuxeMia accepts shipping addresses in ${DESTINATIONS}`],
    ['Shipping is available to United States addresses only.', `Shipping is available to ${DESTINATIONS}.`],
    ['Shipping is available to United States addresses only', `Shipping is available to ${DESTINATIONS}`],
    ['We currently ship to United States addresses only.', `We ship to ${DESTINATIONS}.`],
    ['We currently ship to United States addresses only', `We ship to ${DESTINATIONS}`],
    ['United States shipping only.', 'Shipping is available to seven countries.'],
    ['United States shipping only', 'Shipping to seven countries'],
    ['International shipping is not currently available.', `${INTERNATIONAL_RATE_COPY}. Duties, import taxes, brokerage, or carrier fees may apply unless checkout explicitly states otherwise.`],
    ['international shipping is not currently available.', `${INTERNATIONAL_RATE_COPY}. Duties, import taxes, brokerage, or carrier fees may apply unless checkout explicitly states otherwise.`],
    ['International shipping: not currently available', 'International standard shipping: $14.99 USD below $300 USD; free at $300 USD and above'],
    ['International rates are shown at checkout.', `${INTERNATIONAL_RATE_COPY}; checkout shows the final available service.`],
    ['international rates are shown at checkout.', `${INTERNATIONAL_RATE_COPY}; checkout shows the final available service.`],
    ['International rates are shown at checkout', `${INTERNATIONAL_RATE_COPY}; checkout shows the final available service`],
    ['international rates are shown at checkout', `${INTERNATIONAL_RATE_COPY}; checkout shows the final available service`],
    ['Shipping destination: United States addresses only', `Shipping destinations: ${DESTINATIONS_NO_ARTICLE}`],
    ['Shipping destination: United States only', `Shipping destinations: ${DESTINATIONS_NO_ARTICLE}`],
    ['- Shipping destination: United States only', `- Shipping destinations: ${DESTINATIONS_NO_ARTICLE}`],
    ['Current LuxeMia product listings with delivery to United States addresses only.', `Current LuxeMia product listings with delivery to ${DESTINATIONS}.`],
    ['Current LuxeMia product listings for delivery to United States addresses.', `Current LuxeMia product listings with delivery to ${DESTINATIONS}.`],
    ['Premium Indian Ethnic Wear with Tracked U.S. Shipping', 'Indian Ethnic Wear with Tracked Shipping to Seven Countries'],
    ['U.S. Shipping and Final-Sale Policy', 'Shipping and Final-Sale Policy'],
    ['U.S. Shipping & Taxes', 'International Shipping, Duties & Taxes'],
    ['U.S. Shipping Policy', 'Shipping Policy'],
    ['U.S. Only', '7 Countries'],
    ['United States shipping addresses', 'shipping addresses in seven countries'],
    ['Confirm the complete and correct U.S. delivery address', 'Confirm the complete and correct delivery address for your destination country'],
    ['for United States shoppers', 'for shoppers in seven countries'],
    ['serving United States addresses', 'serving shoppers in seven countries'],
    ['Online Indian ethnic wear store shipping sarees, lehengas, suits, menswear and Indo-Western outfits to United States addresses.', 'Online Indian ethnic wear store shipping sarees, lehengas, suits, menswear and Indo-Western outfits to seven countries.'],
    ['Indian ethnic wear at LuxeMia. Sarees, lehengas, suits and menswear available online with tracked United States shipping.', 'Indian ethnic wear at LuxeMia. Sarees, lehengas, suits and menswear available online with tracked shipping to seven countries.'],
    ['LuxeMia is an online Indian ethnic wear store serving United States addresses with product details, sizing guidance and tracking after dispatch.', 'LuxeMia is an online Indian ethnic wear store serving shoppers in seven countries with product details, sizing guidance and tracking after dispatch.'],
    ['LuxeMia — Indian Ethnic Wear Online for US Delivery', 'LuxeMia — Indian Ethnic Wear Online with International Delivery'],
    [".replace(/USA, Canada, and Australia/gi, 'the United States')", ".replace(/USA, Canada, and Australia/gi, 'the United States, Canada, and Australia')"],
    ["'tracking provided after dispatch to United States addresses'", "'tracking provided after dispatch'"],
    ["'Shipping is available to United States addresses only. Current U.S. rates and services are shown at checkout'", `'Shipping is available to ${DESTINATIONS}. Current rates and services are shown at checkout'`],
  ];

  for (const [from, to] of replacements) text = text.split(from).join(to);

  text = text
    .replace(/\bUnited States addresses only\b/g, DESTINATIONS)
    .replace(/\bU\.S\.-only shipping\b/gi, 'seven-country shipping')
    .replace(/\bUS-only shipping\b/gi, 'seven-country shipping')
    .replace(
      /U\.S\. standard shipping is \$12 below \$150 and free at \$150 and above\. Tracking is provided after dispatch\./g,
      `U.S. standard shipping is $12 below $150 and free at $150 and above. ${INTERNATIONAL_RATE_COPY}. Tracking is provided after dispatch.`,
    )
    .replace(
      /U\.S\. standard shipping is \$12 below \$150 and free at \$150 and above; international rates are shown at checkout\./gi,
      `U.S. standard shipping is $12 below $150 and free at $150 and above; ${INTERNATIONAL_RATE_COPY.toLowerCase()}.`,
    )
    .replace(
      /Standard shipping is \$12 for orders below \$150 and free at \$150 and above\. Tracking is emailed after dispatch\./g,
      `U.S. standard shipping is $12 below $150 and free at $150 and above. ${INTERNATIONAL_RATE_COPY}. Tracking is emailed after dispatch.`,
    );

  return text;
}

const schemaShippingServiceFunction = `export function generateUsShippingServiceSchema() {
  const internationalDestination = {
    '@type': 'DefinedRegion',
    addressCountry: INTERNATIONAL_SHIPPING_COUNTRIES,
  };

  return [
    {
      '@type': 'ShippingService',
      '@id': \`${'${SITE_URL}'}/#us-standard-shipping\`,
      name: 'LuxeMia U.S. Standard Shipping',
      shippingConditions: [
        {
          '@type': 'ShippingConditions',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
          orderValue: { '@type': 'MonetaryAmount', minValue: 0, maxValue: 149.99, currency: 'USD' },
          shippingRate: { '@type': 'MonetaryAmount', value: 12, currency: 'USD' },
        },
        {
          '@type': 'ShippingConditions',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
          orderValue: { '@type': 'MonetaryAmount', minValue: 150, currency: 'USD' },
          shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
        },
      ],
    },
    {
      '@type': 'ShippingService',
      '@id': \`${'${SITE_URL}'}/#international-standard-shipping\`,
      name: 'LuxeMia International Standard Shipping',
      shippingConditions: [
        {
          '@type': 'ShippingConditions',
          shippingDestination: internationalDestination,
          orderValue: { '@type': 'MonetaryAmount', minValue: 0, maxValue: 299.99, currency: 'USD' },
          shippingRate: { '@type': 'MonetaryAmount', value: 14.99, currency: 'USD' },
        },
        {
          '@type': 'ShippingConditions',
          shippingDestination: internationalDestination,
          orderValue: { '@type': 'MonetaryAmount', minValue: 300, currency: 'USD' },
          shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
        },
      ],
    },
  ];
}`;

const schemaProductShippingFunction = `export function generateUsProductShippingDetails(shipsWithinDays?: number | null) {
  const handlingDays = normalizeShipsWithinDays(shipsWithinDays);
  const deliveryTime = handlingDays
    ? {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 0,
          maxValue: handlingDays,
          unitCode: 'DAY',
        },
      }
    : null;

  const withDeliveryTime = (details: Record<string, unknown>) => ({
    ...details,
    ...(deliveryTime && { deliveryTime }),
  });

  return [
    withDeliveryTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
      orderValue: { '@type': 'MonetaryAmount', maxValue: 149.99, currency: 'USD' },
      shippingRate: { '@type': 'MonetaryAmount', value: 12, currency: 'USD' },
    }),
    withDeliveryTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
      orderValue: { '@type': 'MonetaryAmount', minValue: 150, currency: 'USD' },
      shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
    }),
    withDeliveryTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: INTERNATIONAL_SHIPPING_COUNTRIES },
      orderValue: { '@type': 'MonetaryAmount', maxValue: 299.99, currency: 'USD' },
      shippingRate: { '@type': 'MonetaryAmount', value: 14.99, currency: 'USD' },
    }),
    withDeliveryTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: INTERNATIONAL_SHIPPING_COUNTRIES },
      orderValue: { '@type': 'MonetaryAmount', minValue: 300, currency: 'USD' },
      shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
    }),
  ];
}`;

const prerenderProductShippingFunction = `function generateUsProductShippingDetails(shipsWithinDays) {
  const handlingDays = Number.isFinite(shipsWithinDays) && shipsWithinDays > 0
    ? Math.trunc(shipsWithinDays)
    : null;
  const deliveryTime = handlingDays
    ? {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 0,
          maxValue: handlingDays,
          unitCode: 'DAY',
        },
      }
    : null;
  const withDeliveryTime = (details) => ({
    ...details,
    ...(deliveryTime ? { deliveryTime } : {}),
  });

  return [
    withDeliveryTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
      orderValue: { '@type': 'MonetaryAmount', maxValue: 149.99, currency: 'USD' },
      shippingRate: { '@type': 'MonetaryAmount', value: 12, currency: 'USD' },
    }),
    withDeliveryTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
      orderValue: { '@type': 'MonetaryAmount', minValue: 150, currency: 'USD' },
      shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
    }),
    withDeliveryTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: ['CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'] },
      orderValue: { '@type': 'MonetaryAmount', maxValue: 299.99, currency: 'USD' },
      shippingRate: { '@type': 'MonetaryAmount', value: 14.99, currency: 'USD' },
    }),
    withDeliveryTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: ['CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'] },
      orderValue: { '@type': 'MonetaryAmount', minValue: 300, currency: 'USD' },
      shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
    }),
  ];
}`;

function patchSchemaSource(source) {
  let output = source.replace(
    /export const SHIPPING_COUNTRIES = \[[^\]]*\];(?:\nexport const INTERNATIONAL_SHIPPING_COUNTRIES = \[[^\]]*\];)?/,
    `export const SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'];\nexport const INTERNATIONAL_SHIPPING_COUNTRIES = ['CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'];`,
  );
  output = output
    .replace("applicableCountry: 'US',", 'applicableCountry: SHIPPING_COUNTRIES,')
    .replace("returnPolicyCountry: 'US',", 'returnPolicyCountry: SHIPPING_COUNTRIES,')
    .replace(
      "description: 'LuxeMia is an online Indian ethnic wear store serving United States addresses with product details, sizing guidance and tracking after dispatch.',",
      "description: 'LuxeMia is an online Indian ethnic wear store serving shoppers in seven countries with product details, sizing guidance and tracking after dispatch.',",
    );
  output = replaceFunction(output, 'generateUsShippingServiceSchema', schemaShippingServiceFunction);
  output = replaceFunction(output, 'generateUsProductShippingDetails', schemaProductShippingFunction);
  return output;
}

function patchPrerenderSource(source) {
  return replaceFunction(source, 'generateUsProductShippingDetails', prerenderProductShippingFunction);
}

function patchIndexStructuredData(html) {
  const marker = '<script type="application/ld+json">';
  const scriptStart = html.indexOf(marker);
  if (scriptStart < 0) throw new Error('[international-shipping] Homepage JSON-LD script not found');
  const jsonStart = html.indexOf('{', scriptStart);
  const scriptEnd = html.indexOf('</script>', jsonStart);
  if (jsonStart < 0 || scriptEnd < 0) throw new Error('[international-shipping] Homepage JSON-LD bounds not found');

  const data = JSON.parse(html.slice(jsonStart, scriptEnd).trim());
  const graph = Array.isArray(data['@graph']) ? data['@graph'] : [];
  const organization = graph.find((node) => node['@type'] === 'Organization');
  const store = graph.find((node) => node['@type'] === 'OnlineStore');
  const returnPolicy = graph.find((node) => node['@type'] === 'MerchantReturnPolicy');

  if (!organization || !store || !returnPolicy) {
    throw new Error('[international-shipping] Required homepage schema nodes not found');
  }

  organization.description = 'Indian ethnic wear at LuxeMia. Sarees, lehengas, suits and menswear available online with tracked shipping to seven countries.';
  organization.contactPoint.areaServed = SHIPPING_COUNTRIES;
  organization.hasShippingService = [
    { '@id': 'https://luxemia.shop/#us-standard-shipping' },
    { '@id': 'https://luxemia.shop/#international-standard-shipping' },
  ];

  store.description = 'Online Indian ethnic wear store shipping sarees, lehengas, suits, menswear and Indo-Western outfits to seven countries.';
  store.areaServed = [
    { '@type': 'Country', name: 'United States' },
    { '@type': 'Country', name: 'Canada' },
    { '@type': 'Country', name: 'United Kingdom' },
    { '@type': 'Country', name: 'Australia' },
    { '@type': 'Country', name: 'New Zealand' },
    { '@type': 'Country', name: 'South Africa' },
    { '@type': 'Country', name: 'Mauritius' },
  ];
  store.hasShippingService = organization.hasShippingService;

  returnPolicy.applicableCountry = SHIPPING_COUNTRIES;
  returnPolicy.returnPolicyCountry = SHIPPING_COUNTRIES;

  data['@graph'] = graph.filter((node) => ![
    'https://luxemia.shop/#us-standard-shipping',
    'https://luxemia.shop/#international-standard-shipping',
  ].includes(node['@id']));

  data['@graph'].push(
    {
      '@type': 'ShippingService',
      '@id': 'https://luxemia.shop/#us-standard-shipping',
      name: 'LuxeMia U.S. Standard Shipping',
      shippingConditions: [
        {
          '@type': 'ShippingConditions',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
          orderValue: { '@type': 'MonetaryAmount', minValue: 0, maxValue: 149.99, currency: 'USD' },
          shippingRate: { '@type': 'MonetaryAmount', value: 12, currency: 'USD' },
        },
        {
          '@type': 'ShippingConditions',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
          orderValue: { '@type': 'MonetaryAmount', minValue: 150, currency: 'USD' },
          shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
        },
      ],
    },
    {
      '@type': 'ShippingService',
      '@id': 'https://luxemia.shop/#international-standard-shipping',
      name: 'LuxeMia International Standard Shipping',
      shippingConditions: [
        {
          '@type': 'ShippingConditions',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: INTERNATIONAL_SHIPPING_COUNTRIES },
          orderValue: { '@type': 'MonetaryAmount', minValue: 0, maxValue: 299.99, currency: 'USD' },
          shippingRate: { '@type': 'MonetaryAmount', value: 14.99, currency: 'USD' },
        },
        {
          '@type': 'ShippingConditions',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: INTERNATIONAL_SHIPPING_COUNTRIES },
          orderValue: { '@type': 'MonetaryAmount', minValue: 300, currency: 'USD' },
          shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
        },
      ],
    },
  );

  const indent = '    ';
  const rendered = JSON.stringify(data, null, 2).split('\n').map((line) => `${indent}${line}`).join('\n');
  return `${html.slice(0, jsonStart)}${rendered}\n    ${html.slice(scriptEnd)}`;
}

const changedFiles = [];
for (const filePath of roots.flatMap(listFiles)) {
  if (skipBasenames.has(path.basename(filePath))) continue;
  const original = fs.readFileSync(filePath, 'utf8');
  let updated = applyTextReplacements(original);
  const relativePath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');

  if (relativePath === 'src/lib/schema.ts') updated = patchSchemaSource(updated);
  if (relativePath === 'scripts/prerender.js') updated = patchPrerenderSource(updated);
  if (relativePath === 'index.html') updated = patchIndexStructuredData(updated);

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    changedFiles.push(relativePath);
  }
}

const requiredChecks = {
  'src/lib/schema.ts': [
    "export const SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'];",
    '#international-standard-shipping',
    'value: 14.99',
    'minValue: 300',
    'returnPolicyCountry: SHIPPING_COUNTRIES',
  ],
  'scripts/prerender.js': [
    "addressCountry: ['CA', 'GB', 'AU', 'NZ', 'ZA', 'MU']",
    'value: 14.99',
    'minValue: 300',
  ],
  'index.html': [
    'https://luxemia.shop/#international-standard-shipping',
    '"value": 14.99',
    '"minValue": 300',
    '"MU"',
  ],
  'src/pages/Shipping.tsx': [
    'International standard shipping is $14.99 below $300 and free at $300 and above',
  ],
};

for (const [relativePath, fragments] of Object.entries(requiredChecks)) {
  const text = fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf8');
  for (const fragment of fragments) {
    if (!text.includes(fragment)) {
      throw new Error(`[international-shipping] ${relativePath} is missing required fragment: ${fragment}`);
    }
  }
}

console.log(`[international-shipping] Seven-country policy applied and verified across ${changedFiles.length} source surfaces.`);
