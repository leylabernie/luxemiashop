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

if (HOME_TITLE.length > 58 || HOME_DESCRIPTION.length > 155 || MENSWEAR_DESCRIPTION.length > 155) {
  throw new Error('[route-shipping-seo] Emitted metadata exceeds release limits.');
}
if (!HOME_TITLE.endsWith('| LuxeMia') || !HOME_H1.startsWith('LuxeMia')) {
  throw new Error('[route-shipping-seo] LuxeMia brand placement is invalid.');
}

console.log('[route-shipping-seo] Restored concise branded metadata after route-based shipping remediation.');
