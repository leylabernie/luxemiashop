#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HOME_TITLE = 'LuxeMia Ethnic Wear | Indian Wedding Sarees & Bridal Lehengas USA';
const HOME_DESCRIPTION = 'Shop authentic South Asian bridal wear, sarees, lehengas, suits and menswear with tracked shipping to the USA, Canada, UK and supported markets.';
const HOME_H1 = 'LuxeMia Indian Wedding Sarees, Bridal Lehengas & Ethnic Wear';
const DESTINATIONS = 'the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius';

const routeDescriptions = {
  '/lehengas': 'Shop bridal and wedding-guest lehengas online. Compare fabric, included pieces, stitching, sizing, availability and processing details.',
  '/suits': 'Shop salwar kameez, Anarkali, sharara and palazzo suits. Compare fabric, included pieces, stitching, sizing, availability and processing details.',
  '/menswear': 'Shop sherwanis, kurta pajama and Indo-Western menswear. Compare fabric, included pieces, sizes, availability and processing details.',
  '/jewelry': 'Shop Kundan-style, polki-style and bridal necklace sets. Compare materials, finish, included pieces, measurements and availability.',
};

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}

function write(relative, content) {
  fs.writeFileSync(path.join(ROOT, relative), content, 'utf8');
}

function exists(relative) {
  return fs.existsSync(path.join(ROOT, relative));
}

function applyArchitecture(architecture) {
  architecture.routes['/'] = {
    ...architecture.routes['/'],
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    h1: HOME_H1,
  };
  for (const [route, description] of Object.entries(routeDescriptions)) {
    if (architecture.routes[route]) architecture.routes[route].description = description;
  }
  return architecture;
}

const jsonPath = 'src/config/seoArchitecture.json';
const architecture = applyArchitecture(JSON.parse(read(jsonPath)));
const rendered = JSON.stringify(architecture, null, 2);
write(jsonPath, `${rendered}\n`);

const tsPath = 'src/config/seoArchitecture.ts';
let tsSource = read(tsPath);
const pattern = /(\/\* seo-architecture-json:start \*\/)\s*[\s\S]*?\s*(\/\* seo-architecture-json:end \*\/)/;
if (!pattern.test(tsSource)) throw new Error('[approved-seo] Runtime SEO architecture block not found');
tsSource = tsSource.replace(pattern, (_match, start, end) => `${start} ${rendered} ${end}`);
write(tsPath, tsSource);

const seoHeadPath = 'src/components/seo/SEOHead.tsx';
let seoHead = read(seoHeadPath);
seoHead = seoHead
  .replace(/title = '[^']*'/, `title = '${HOME_TITLE}'`)
  .replace(/description = '[^']*'/, `description = '${HOME_DESCRIPTION}'`);
write(seoHeadPath, seoHead);

function normalizeCustomerShippingCopy(relative) {
  let source = read(relative);
  source = source
    .split('$12').join('$14.99')
    .split('$150').join('$199')
    .split('Free US shipping').join('Free U.S. standard shipping')
    .split('free US shipping').join('free U.S. standard shipping')
    .split('Free U.S. shipping').join('Free U.S. standard shipping')
    .split('free U.S. shipping').join('free U.S. standard shipping')
    .split('LuxeMia currently ships to United States addresses only').join(`LuxeMia ships to ${DESTINATIONS}`)
    .split('LuxeMia ships to United States addresses only').join(`LuxeMia ships to ${DESTINATIONS}`)
    .split('United States addresses only').join(DESTINATIONS)
    .split('Only products with a published 1–3 business-day processing window.')
      .join('Products whose semi-stitched option has a verified 3–5 business-day processing window; stitched and made-to-measure options take longer.')
    .split('Only products with a published 1-3 business-day processing window.')
      .join('Products whose semi-stitched option has a verified 3–5 business-day processing window; stitched and made-to-measure options take longer.')
    .replace(
      /answer: 'No\. LuxeMia (?:currently )?ships to [^']*'/g,
      `answer: 'Yes. LuxeMia ships to ${DESTINATIONS}. Review the Shipping page for destination-based rates, duties and processing guidance.'`,
    )
    .replace(
      /answer: 'All sales are final and exchanges are not accepted\. Review the exact product measurements and contact LuxeMia before ordering if the listing is unclear\.'/g,
      "answer: 'Except where applicable law provides otherwise, LuxeMia does not accept voluntary change-of-mind returns or exchanges. Review the exact product measurements and contact LuxeMia before ordering if the listing is unclear.'",
    )
    .replace(
      /answer: 'All sales are final\. Genuine shipping damage or defect, an incorrect item, or a missing item must be reported within 48 hours using the covered-order-issue process\.'/g,
      "answer: 'Under LuxeMia’s voluntary policy, change-of-mind, fit and preference returns are not accepted except where applicable law provides otherwise. Genuine damage, defect, incorrect-item or missing-item claims should be reported within 48 hours using the covered-order-issue process.'",
    )
    .replace(
      /answer: 'Exchanges are not accepted\. Review the Size Guide and contact LuxeMia before ordering if sizing or color details are unclear\.'/g,
      "answer: 'Voluntary size or color exchanges are not accepted except where applicable law provides otherwise. Review the Size Guide and contact LuxeMia before ordering if sizing or color details are unclear.'",
    );
  write(relative, source);
}

for (const relative of ['src/pages/Index.tsx', 'src/pages/FAQ.tsx', 'src/pages/Collections.tsx', 'src/pages/NewArrivals.tsx']) {
  normalizeCustomerShippingCopy(relative);
}

function normalizeEditorialShippingCopy(relative) {
  if (!exists(relative)) return;
  const source = read(relative)
    .split('\n')
    .map((line) => {
      const hasRetiredAmounts = line.includes('$12') && line.includes('$150');
      const isShippingContext = /shipping|delivery|free|orders?\s+(?:below|over|at)/i.test(line);
      if (!hasRetiredAmounts || !isShippingContext) return line;
      return line.replace(/\$12/g, '$14.99').replace(/\$150/g, '$199');
    })
    .join('\n')
    .replace("title: 'United States Shipping Policy'", "title: 'Shipping Policy & International Rates'");
  write(relative, source);
}

for (const relative of ['src/data/blogPosts.ts', 'src/data/recoveredBlogPosts.ts']) {
  normalizeEditorialShippingCopy(relative);
}

let index = read('index.html');
index = index.replace(/<title>[\s\S]*?<\/title>/i, `<title>${HOME_TITLE}</title>`);
const replacements = [
  [/\<meta name="title" content="[^"]*" \/\>/i, `<meta name="title" content="${HOME_TITLE}" />`],
  [/\<meta name="description" content="[^"]*" \/\>/i, `<meta name="description" content="${HOME_DESCRIPTION}" />`],
  [/\<meta property="og:title" content="[^"]*" \/\>/i, `<meta property="og:title" content="${HOME_TITLE}" />`],
  [/\<meta property="og:description" content="[^"]*" \/\>/i, `<meta property="og:description" content="${HOME_DESCRIPTION}" />`],
  [/\<meta name="twitter:title" content="[^"]*" \/\>/i, `<meta name="twitter:title" content="${HOME_TITLE}" />`],
  [/\<meta name="twitter:description" content="[^"]*" \/\>/i, `<meta name="twitter:description" content="${HOME_DESCRIPTION}" />`],
];
for (const [search, replacement] of replacements) index = index.replace(search, replacement);
write('index.html', index);

for (const [route, seo] of Object.entries(architecture.routes)) {
  if (seo.description.length > 155) throw new Error(`[approved-seo] Description exceeds 155 characters: ${route}`);
  if (seo.title.length > 58 && !(route === '/' && seo.title === HOME_TITLE)) {
    throw new Error(`[approved-seo] Title exceeds 58 characters without approved exception: ${route}`);
  }
}
if (!architecture.routes['/'].h1.startsWith('LuxeMia')) throw new Error('[approved-seo] Homepage H1 is not branded');
if (!seoHead.includes(HOME_DESCRIPTION)) throw new Error('[approved-seo] Runtime SEO default description was not updated');
for (const relative of ['src/pages/Index.tsx', 'src/pages/FAQ.tsx', 'src/pages/Collections.tsx', 'src/pages/NewArrivals.tsx', 'src/data/blogPosts.ts', 'src/data/recoveredBlogPosts.ts']) {
  if (!exists(relative)) continue;
  const source = read(relative);
  if (/\$12[^\n]{0,160}(?:shipping|delivery|below \$150)/i.test(source) || /(?:shipping|delivery|free)[^\n]{0,160}\$150/i.test(source)) {
    throw new Error(`[approved-seo] Stale shipping copy remains in ${relative}`);
  }
  if (/published 1[–-]3 business-day processing/i.test(source) || /processing window of three business days or less/i.test(source)) {
    throw new Error(`[approved-seo] Stale Ready-to-Ship processing copy remains in ${relative}`);
  }
}

console.log('[approved-seo] Exact approved homepage title retained; H1, shared descriptions, statutory-right wording, Ready-to-Ship promise and customer-facing/editorial shipping copy meet release rules.');