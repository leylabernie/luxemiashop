#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const HOME_TITLE = 'Indian Wedding Sarees, Lehengas & Ethnic Wear | LuxeMia';
const HOME_DESCRIPTION = 'Shop South Asian bridal wear, sarees, lehengas, suits and menswear with tracked shipping to seven supported countries.';
const SHIPPING_TITLE = 'Shipping Policy & International Rates | LuxeMia';
const SHIPPING_DESCRIPTION = 'Review LuxeMia tracked shipping rates for the United States, Canada, United Kingdom, Australia, New Zealand, South Africa and Mauritius, plus processing, customs and tracking guidance.';
const OG_IMAGE_ALT = 'LuxeMia Ethnic Wear — Sarees, Lehengas & Wedding Outfits';
const DESTINATIONS = 'the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius';
const COUNTRY_OBJECTS = [
  { '@type': 'Country', name: 'United States' },
  { '@type': 'Country', name: 'Canada' },
  { '@type': 'Country', name: 'United Kingdom' },
  { '@type': 'Country', name: 'Australia' },
  { '@type': 'Country', name: 'New Zealand' },
  { '@type': 'Country', name: 'South Africa' },
  { '@type': 'Country', name: 'Mauritius' },
];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(file);
    return entry.name.endsWith('.html') ? [file] : [];
  });
}

function cleanSchema(value) {
  if (Array.isArray(value)) return value.map(cleanSchema).filter((item) => item !== null && item !== undefined);
  if (!value || typeof value !== 'object') return value;

  const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
  if (types.includes('MerchantReturnPolicy')) return null;

  const output = {};
  for (const [key, child] of Object.entries(value)) {
    if (['hasMerchantReturnPolicy', 'legalName', 'sameAs', 'paymentAccepted', 'priceValidUntil'].includes(key)) continue;
    const cleaned = cleanSchema(child);
    if (cleaned !== null && cleaned !== undefined) output[key] = cleaned;
  }

  const outputTypes = Array.isArray(output['@type']) ? output['@type'] : [output['@type']];
  const schemaId = typeof output['@id'] === 'string' ? output['@id'] : '';
  const isCanonicalStore = outputTypes.includes('OnlineStore')
    || outputTypes.includes('ClothingStore')
    || /\/(?:#organization|#store)$/.test(schemaId);
  if (outputTypes.includes('Organization') && isCanonicalStore) {
    output.name = 'LuxeMia';
    output.description = 'LuxeMia is an online Indian ethnic wear store serving shoppers in seven countries with product details, sizing guidance and tracking after dispatch.';
    if (output.contactPoint && typeof output.contactPoint === 'object') {
      output.contactPoint.email = 'hello@luxemia.shop';
      output.contactPoint.telephone = '+1-215-341-9990';
      output.contactPoint.areaServed = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'];
    }
  }
  if (isCanonicalStore && (outputTypes.includes('OnlineStore') || outputTypes.includes('ClothingStore'))) {
    output['@type'] = ['Organization', 'OnlineStore', 'ClothingStore'];
    output.name = 'LuxeMia';
    output.description = 'LuxeMia is an online Indian ethnic wear store serving shoppers in seven countries with product details, sizing guidance and tracking after dispatch.';
    output.areaServed = COUNTRY_OBJECTS;
    output.currenciesAccepted = 'AUD, CAD, GBP, MUR, NZD, USD';
  }
  if (output.mpn && output.sku && output.mpn === output.sku) delete output.mpn;
  return output;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function setMeta(html, attribute, key, content) {
  const tagExpression = new RegExp(`<meta\\b[^>]*\\b${attribute}=["']${escapeRegex(key)}["'][^>]*>`, 'i');
  const match = html.match(tagExpression);
  const rendered = `<meta ${attribute}="${key}" content="${content}" />`;
  if (!match) return html.replace('</head>', `  ${rendered}\n</head>`);
  const tag = match[0];
  const updated = /\bcontent=["'][^"']*["']/i.test(tag)
    ? tag.replace(/\bcontent=["'][^"']*["']/i, `content="${content}"`)
    : tag.replace(/>$/, ` content="${content}" />`);
  return html.replace(tag, updated);
}

function setTitle(html, title) {
  return /<title>[\s\S]*?<\/title>/i.test(html)
    ? html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
    : html.replace('</head>', `  <title>${title}</title>\n</head>`);
}

function cleanText(html) {
  return html
    .split('LuxeMia — Indian Ethnic Wear Online for US Delivery').join(OG_IMAGE_ALT)
    .split('LuxeMia — Indian Ethnic Wear Online for U.S. Delivery').join(OG_IMAGE_ALT)
    .split('Glamour Indian Wear').join('LuxeMia')
    .split('United States addresses only').join(DESTINATIONS)
    .split('U.S. delivery only').join('tracked delivery to seven supported countries')
    .split('U.S. standard shipping is $12 below $150 and free at $150 and above')
      .join('U.S. standard shipping is $14.99 below $199 and free at $199 and above')
    .split('Standard shipping is $12 below $150 and free at $150 and above')
      .join('U.S. standard shipping is $14.99 below $199 and free at $199 and above')
    .split('Free standard shipping on orders over $350 to USA, Canada, and Australia. Flat rate $25 per order for orders under $350.')
      .join('Route-based tracked shipping is available to seven countries. Checkout shows the final destination-specific service and charge.')
    .split('All orders ship with full DHL Express tracking.').join('Tracking is provided after dispatch; the carrier is selected by route and service availability.')
    .split('Ships to: USA, Canada, Australia').join('Ships to: United States, Canada, United Kingdom, Australia, New Zealand, South Africa, Mauritius')
    .split('Custom sizing: Available on request').join('Product measurements: Review the exact listing')
    .split('Indian Wedding Sarees & Bridal Lehengas | LuxeMia').join(HOME_TITLE)
    .split('U.S. Shipping Policy | LuxeMia').join(SHIPPING_TITLE);
}

let changed = 0;
const files = walk(DIST);
for (const file of files) {
  const relative = path.relative(DIST, file).replace(/\\/g, '/');
  const before = fs.readFileSync(file, 'utf8');
  let html = cleanText(before);

  html = html.replace(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi, (full, body) => {
    try {
      const parsed = JSON.parse(body.trim());
      const cleaned = cleanSchema(parsed);
      if (cleaned === null) return '';
      return `<script type="application/ld+json">\n${JSON.stringify(cleaned, null, 2)}\n</script>`;
    } catch {
      return full;
    }
  });

  if (relative === 'index.html') {
    html = setTitle(html, HOME_TITLE);
    html = setMeta(html, 'name', 'title', HOME_TITLE);
    html = setMeta(html, 'name', 'description', HOME_DESCRIPTION);
    html = setMeta(html, 'property', 'og:title', HOME_TITLE);
    html = setMeta(html, 'property', 'og:description', HOME_DESCRIPTION);
    html = setMeta(html, 'name', 'twitter:title', HOME_TITLE);
    html = setMeta(html, 'name', 'twitter:description', HOME_DESCRIPTION);
  }

  if (relative === 'shipping/index.html' || relative === 'shipping.html') {
    html = setTitle(html, SHIPPING_TITLE);
    html = setMeta(html, 'name', 'title', SHIPPING_TITLE);
    html = setMeta(html, 'name', 'description', SHIPPING_DESCRIPTION);
    html = setMeta(html, 'property', 'og:title', SHIPPING_TITLE);
    html = setMeta(html, 'property', 'og:description', SHIPPING_DESCRIPTION);
    html = setMeta(html, 'name', 'twitter:title', SHIPPING_TITLE);
    html = setMeta(html, 'name', 'twitter:description', SHIPPING_DESCRIPTION);
  }

  html = setMeta(html, 'property', 'og:image:alt', OG_IMAGE_ALT);
  html = setMeta(html, 'name', 'twitter:image:alt', OG_IMAGE_ALT);

  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    changed += 1;
  }
}

console.log(`[built-trust] Postprocessed ${changed} of ${files.length} HTML file(s).`);
