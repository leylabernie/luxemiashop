#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HOME_TITLE = 'LuxeMia Ethnic Wear | Indian Wedding Sarees & Bridal Lehengas USA';
const HOME_TITLE_HTML = HOME_TITLE.replace(/&/g, '&amp;');
const HOME_DESCRIPTION = 'Shop authentic South Asian bridal wear, sarees, lehengas, suits and menswear with tracked shipping to the USA, Canada, UK and supported markets.';
const files = [
  path.join(ROOT, 'dist', 'index.html'),
  path.join(ROOT, 'dist', '_prerender', 'index.html'),
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function setMeta(source, attribute, name, content) {
  const tagPattern = new RegExp(`<meta\\b[^>]*\\b${attribute}=["']${escapeRegex(name)}["'][^>]*>`, 'i');
  const match = source.match(tagPattern);
  const rendered = `<meta ${attribute}="${name}" content="${content}" />`;
  if (!match) return source.replace('</head>', `  ${rendered}\n</head>`);
  const current = match[0];
  const updated = /\bcontent=["'][^"']*["']/i.test(current)
    ? current.replace(/\bcontent=["'][^"']*["']/i, `content="${content}"`)
    : current.replace(/>$/, ` content="${content}" />`);
  return source.replace(current, updated);
}

let updatedCount = 0;
for (const file of files) {
  if (!fs.existsSync(file)) throw new Error(`[built-approved-seo] Missing homepage output: ${file}`);
  let html = fs.readFileSync(file, 'utf8');

  html = /<title>[\s\S]*?<\/title>/i.test(html)
    ? html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${HOME_TITLE_HTML}</title>`)
    : html.replace('</head>', `  <title>${HOME_TITLE_HTML}</title>\n</head>`);
  html = setMeta(html, 'name', 'title', HOME_TITLE);
  html = setMeta(html, 'name', 'description', HOME_DESCRIPTION);
  html = setMeta(html, 'property', 'og:title', HOME_TITLE);
  html = setMeta(html, 'property', 'og:description', HOME_DESCRIPTION);
  html = setMeta(html, 'name', 'twitter:title', HOME_TITLE);
  html = setMeta(html, 'name', 'twitter:description', HOME_DESCRIPTION);

  fs.writeFileSync(file, html, 'utf8');
  updatedCount += 1;

  for (const required of [`<title>${HOME_TITLE_HTML}</title>`, HOME_DESCRIPTION]) {
    if (!html.includes(required)) throw new Error(`[built-approved-seo] ${file} missing built value: ${required}`);
  }
}

console.log(`[built-approved-seo] Final homepage metadata matches the approved source in ${updatedCount} HTML outputs.`);
