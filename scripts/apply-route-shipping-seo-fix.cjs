#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const write = (relativePath, content) => fs.writeFileSync(path.join(root, relativePath), content, 'utf8');

const HOME_TITLE = 'Indian Wedding Sarees & Bridal Lehengas | LuxeMia';
const HOME_DESCRIPTION = 'Shop South Asian bridal wear, wedding sarees, lehengas, suits and menswear with tracked shipping to the USA, Canada, UK and other supported markets.';
const HOME_H1 = 'LuxeMia Indian Wedding Sarees, Bridal Lehengas & Ethnic Wear';
const MENSWEAR_DESCRIPTION = 'Shop sherwanis, kurta pajama and Indo-Western menswear. Compare fabric, included pieces, sizes, availability and U.S. shipping.';
const DESTINATION_LIST = 'the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius';
const US_RATE_SUMMARY = 'U.S. standard shipping is $14.99 below $199 and free at $199 and above.';
const ROUTE_RATE_SUMMARY = `${US_RATE_SUMMARY} Canada and the UK are $24.99 below $299 and free at $299 and above. Australia and New Zealand are $29.99 below $349 and free at $349 and above. South Africa is $49.99 and Mauritius is $59.99 per order.`;

const architecturePath = 'src/config/seoArchitecture.json';
const architecture = JSON.parse(read(architecturePath));
architecture.routes['/'] = {
  ...architecture.routes['/'],
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  h1: HOME_H1,
};
architecture.routes['/menswear'] = {
  ...architecture.routes['/menswear'],
  description: MENSWEAR_DESCRIPTION,
};

const architectureJson = JSON.stringify(architecture, null, 2);
write(architecturePath, `${architectureJson}\n`);

const runtimePath = 'src/config/seoArchitecture.ts';
let runtimeSource = read(runtimePath);
const runtimePattern = /(\/\* seo-architecture-json:start \*\/)\s*[\s\S]*?\s*(\/\* seo-architecture-json:end \*\/)/;
if (!runtimePattern.test(runtimeSource)) {
  throw new Error('[route-shipping-seo] Runtime SEO architecture block was not found.');
}
runtimeSource = runtimeSource.replace(
  runtimePattern,
  (_match, startMarker, endMarker) => `${startMarker} ${architectureJson} ${endMarker}`,
);
write(runtimePath, runtimeSource);

const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const replaceOnce = (source, pattern, replacement, label) => {
  if (!pattern.test(source)) throw new Error(`[route-shipping-seo] ${label} was not found in index.html.`);
  return source.replace(pattern, replacement);
};

let indexSource = read('index.html');
const escapedTitle = escapeHtml(HOME_TITLE);
const escapedDescription = escapeHtml(HOME_DESCRIPTION);
indexSource = replaceOnce(indexSource, /<title>[\s\S]*?<\/title>/, `<title>${escapedTitle}</title>`, 'title');
indexSource = replaceOnce(indexSource, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapedDescription}" />`, 'meta description');
indexSource = replaceOnce(indexSource, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapedTitle}" />`, 'Open Graph title');
indexSource = replaceOnce(indexSource, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapedDescription}" />`, 'Open Graph description');
indexSource = replaceOnce(indexSource, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapedTitle}" />`, 'Twitter title');
indexSource = replaceOnce(indexSource, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapedDescription}" />`, 'Twitter description');
indexSource = indexSource.replace(
  '<!-- English storefront with U.S.-specific search targeting and United States shipping. -->',
  '<!-- English storefront with multi-country shipping and U.S.-led search targeting. -->',
);
write('index.html', indexSource);

function patchLegacyShippingSurface(relativePath) {
  let source = read(relativePath);

  const exactReplacements = [
    [
      'We currently ship to United States addresses only. Standard shipping is $12 for orders below $150 and free at $150 and above. Tracking is emailed after dispatch.',
      `LuxeMia ships to ${DESTINATION_LIST}. ${ROUTE_RATE_SUMMARY} Tracking is emailed after dispatch.`,
    ],
    [
      'U.S. standard shipping is $12 below $150 and free at $150 and above.',
      US_RATE_SUMMARY,
    ],
    [
      'U.S. standard shipping is $12 below $150 and free at $150 and above',
      'U.S. standard shipping is $14.99 below $199 and free at $199 and above',
    ],
    [
      'Standard shipping is free at $150 and above and $12 below $150',
      'U.S. standard shipping is free at $199 and above and $14.99 below $199',
    ],
    [
      'U.S. standard shipping is free at $150 and above and $12 below $150',
      'U.S. standard shipping is free at $199 and above and $14.99 below $199',
    ],
    [
      '$12 USD below $150 USD; free at $150 USD and above',
      '$14.99 USD below $199 USD; free at $199 USD and above',
    ],
    [
      'Free U.S. shipping at $150 and above',
      'Free U.S. standard shipping at $199 and above',
    ],
    [
      'free US shipping at $150 and above',
      'free U.S. standard shipping at $199 and above',
    ],
    [
      '$12 flat below that',
      '$14.99 below $199',
    ],
  ];

  for (const [from, to] of exactReplacements) source = source.split(from).join(to);

  source = source
    .replace(/LuxeMia currently ships to United States addresses only\./g, `LuxeMia ships to ${DESTINATION_LIST}.`)
    .replace(/LuxeMia ships to United States addresses only\./g, `LuxeMia ships to ${DESTINATION_LIST}.`)
    .replace(/Shipping is available to United States addresses only\./g, `Shipping is available to ${DESTINATION_LIST}.`)
    .replace(/Checkout accepts United States addresses only\./g, `Checkout accepts addresses in ${DESTINATION_LIST}.`)
    .replace(/tracked shipping to United States addresses only/g, `tracked shipping to ${DESTINATION_LIST}`)
    .replace(/to United States addresses only/g, `to addresses in ${DESTINATION_LIST}`)
    .replace(/costs \$12 below \$150/g, 'costs $14.99 below $199')
    .replace(/costs \$12 below that/g, 'costs $14.99 below $199')
    .replace(/free at \$150 and above/g, 'free at $199 and above')
    .replace(/free at \$150\+/g, 'free at $199+')
    .replace(/Free U\.S\. shipping at \$150\+/g, 'Free U.S. standard shipping at $199+')
    .replace(/free U\.S\. shipping at \$150\+/g, 'free U.S. standard shipping at $199+');

  if (relativePath === 'public/llms.txt') {
    source = source
      .replace(
        '> LuxeMia is an online Indian ethnic-wear store offering lehengas, sarees, salwar kameez, menswear and jewelry for delivery to United States addresses.',
        `> LuxeMia is an online Indian ethnic-wear store offering lehengas, sarees, salwar kameez, menswear and jewelry for tracked delivery to ${DESTINATION_LIST}.`,
      )
      .replace(
        '- Shipping destination: United States only',
        '- Shipping destinations: United States, Canada, United Kingdom, Australia, New Zealand, South Africa and Mauritius',
      )
      .replace(
        '- International shipping: not currently available',
        '- International standard shipping: Canada/UK $24.99 below $299 and free at $299+; Australia/New Zealand $29.99 below $349 and free at $349+; South Africa $49.99; Mauritius $59.99',
      );
  }

  write(relativePath, source);
}

for (const relativePath of [
  'index.html',
  'src/lib/schema.ts',
  'scripts/prerender.js',
  'public/llms.txt',
]) {
  patchLegacyShippingSurface(relativePath);
}

if (HOME_TITLE.length > 58 || HOME_DESCRIPTION.length > 155 || MENSWEAR_DESCRIPTION.length > 155) {
  throw new Error('[route-shipping-seo] Emitted metadata exceeds release limits.');
}
if (!HOME_TITLE.endsWith('| LuxeMia') || !HOME_H1.startsWith('LuxeMia')) {
  throw new Error('[route-shipping-seo] LuxeMia brand placement is invalid.');
}

console.log('[route-shipping-seo] Restored concise branded metadata and removed legacy route copy after shipping remediation.');
