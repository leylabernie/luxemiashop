#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HOME_TITLE = 'LuxeMia Ethnic Wear | Indian Wedding Sarees & Bridal Lehengas USA';
const HOME_DESCRIPTION = 'Shop authentic South Asian bridal wear, sarees, lehengas, suits and menswear with tracked shipping to the USA, Canada, UK and supported markets.';
const HOME_H1 = 'LuxeMia Indian Wedding Sarees, Bridal Lehengas & Ethnic Wear';

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

const pageReplacements = new Map([
  ['src/pages/FAQ.tsx', [
    [
      "answer: 'Yes. We offer free US shipping at $150 and above. A flat $12 shipping rate applies below $150.'",
      "answer: 'U.S. standard shipping is $14.99 below $199 and free at $199 and above. Other countries use route-based rates shown on the Shipping page.'",
    ],
  ]],
  ['src/pages/Collections.tsx', [
    ['free U.S. standard shipping at $150 and above', 'free U.S. standard shipping at $199 and above'],
    ['a $12 rate below $150', 'a $14.99 rate below $199'],
  ]],
  ['src/pages/NewArrivals.tsx', [
    ['Free U.S. shipping applies at $150 and above', 'Free U.S. standard shipping applies at $199 and above'],
    ['shipping is $12 below that', 'U.S. shipping is $14.99 below $199'],
  ]],
]);
for (const [relative, replacements] of pageReplacements) {
  let source = read(relative);
  for (const [from, to] of replacements) source = source.split(from).join(to);
  write(relative, source);
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
for (const relative of pageReplacements.keys()) {
  const source = read(relative);
  if (/\$12[^\n]{0,100}(?:shipping|below \$150)/i.test(source) || /free[^\n]{0,60}\$150/i.test(source)) {
    throw new Error(`[approved-seo] Stale shipping copy remains in ${relative}`);
  }
}

console.log('[approved-seo] Exact approved homepage title retained; H1, shared descriptions and customer-facing shipping copy meet release rules.');
