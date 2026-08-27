#!/usr/bin/env node

/**
 * Final trust/source-of-truth remediation.
 *
 * This runs after the older catalog/shipping migration scripts and makes the
 * final runtime source internally consistent before validation and bundling.
 * It is intentionally idempotent: running it repeatedly must not create drift.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HOME_TITLE = 'LuxeMia Ethnic Wear | Indian Wedding Sarees & Bridal Lehengas USA';
const HOME_DESCRIPTION = 'Shop authentic South Asian bridal wear, wedding sarees, lehengas, salwar kameez and menswear with tracked shipping to the USA, Canada, UK and other supported markets.';
const HOME_H1 = 'Indian Wedding Sarees, Bridal Lehengas & Ethnic Wear';
const SHIPPING_TITLE = 'Shipping Policy & International Rates | LuxeMia';
const SHIPPING_DESCRIPTION = 'Review LuxeMia tracked shipping rates for the United States, Canada, United Kingdom, Australia, New Zealand, South Africa and Mauritius, plus processing, customs and tracking guidance.';
const SHIPPING_CUSTOMS_DESCRIPTION = 'Review LuxeMia international shipping, duties, customs, brokerage and tracking guidance for all seven supported destination countries.';
const FAQ_DESCRIPTION = 'Answers to common LuxeMia questions about orders, seven-country shipping, cancellations, statutory rights, sizing, product issues and care.';
const OG_IMAGE_ALT = 'LuxeMia Ethnic Wear — Sarees, Lehengas & Wedding Outfits';
const DESTINATION_NAMES = 'the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius';
const CURRENCY_TEXT = 'AUD, CAD, GBP, MUR, NZD, USD';
const COUNTRY_OBJECTS = [
  { '@type': 'Country', name: 'United States' },
  { '@type': 'Country', name: 'Canada' },
  { '@type': 'Country', name: 'United Kingdom' },
  { '@type': 'Country', name: 'Australia' },
  { '@type': 'Country', name: 'New Zealand' },
  { '@type': 'Country', name: 'South Africa' },
  { '@type': 'Country', name: 'Mauritius' },
];

const changed = [];

function absolute(relative) {
  return path.join(ROOT, relative);
}

function read(relative) {
  return fs.readFileSync(absolute(relative), 'utf8');
}

function write(relative, content) {
  const file = absolute(relative);
  const before = fs.readFileSync(file, 'utf8');
  if (before === content) return;
  fs.writeFileSync(file, content, 'utf8');
  changed.push(relative);
}

function replaceFunction(source, functionName, replacement) {
  const expression = new RegExp(`(?:export\\s+)?function\\s+${functionName}\\s*\\(`);
  const match = expression.exec(source);
  if (!match) return source;
  const start = match.index;
  const openingBrace = source.indexOf('{', start);
  if (openingBrace < 0) return source;

  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = openingBrace; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '\'' || char === '"' || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return `${source.slice(0, start)}${replacement}${source.slice(index + 1)}`;
      }
    }
  }
  return source;
}

function removeObjectProperty(source, propertyName) {
  let output = source;
  const matcher = new RegExp(`\\b${propertyName}\\s*:`, 'g');
  let safety = 0;
  while (safety < 100) {
    safety += 1;
    matcher.lastIndex = 0;
    const match = matcher.exec(output);
    if (!match) break;

    let start = match.index;
    while (start > 0 && /[ \t]/.test(output[start - 1])) start -= 1;
    if (start > 0 && output[start - 1] === '\n') {
      // Keep the previous newline and remove this complete property line/block.
    } else {
      start = match.index;
    }

    let cursor = match.index + match[0].length;
    while (cursor < output.length && /\s/.test(output[cursor])) cursor += 1;
    const opening = output[cursor];
    const closing = opening === '{' ? '}' : opening === '[' ? ']' : null;

    if (closing) {
      let depth = 0;
      let quote = null;
      let escaped = false;
      for (; cursor < output.length; cursor += 1) {
        const char = output[cursor];
        if (quote) {
          if (escaped) escaped = false;
          else if (char === '\\') escaped = true;
          else if (char === quote) quote = null;
          continue;
        }
        if (char === '\'' || char === '"' || char === '`') {
          quote = char;
          continue;
        }
        if (char === opening) depth += 1;
        if (char === closing) {
          depth -= 1;
          if (depth === 0) {
            cursor += 1;
            break;
          }
        }
      }
    } else {
      while (cursor < output.length && output[cursor] !== ',' && output[cursor] !== '\n') cursor += 1;
    }

    while (cursor < output.length && /[ \t]/.test(output[cursor])) cursor += 1;
    if (output[cursor] === ',') cursor += 1;
    while (cursor < output.length && /[ \t]/.test(output[cursor])) cursor += 1;
    if (output[cursor] === '\n') cursor += 1;

    output = `${output.slice(0, start)}${output.slice(cursor)}`;
  }
  return output;
}

function applySafeTextReplacements(input) {
  return input
    .split('LuxeMia — Indian Ethnic Wear Online for US Delivery').join(OG_IMAGE_ALT)
    .split('LuxeMia — Indian Ethnic Wear Online for U.S. Delivery').join(OG_IMAGE_ALT)
    .split('LuxeMia is an online Indian ethnic wear store serving United States addresses with product details, sizing guidance and tracking after dispatch.')
      .join('LuxeMia is an online Indian ethnic wear store serving shoppers in seven countries with product details, sizing guidance and tracking after dispatch.')
    .split('Online Indian ethnic wear store shipping sarees, lehengas, suits, menswear and Indo-Western outfits to United States addresses.')
      .join('Online Indian ethnic wear store shipping sarees, lehengas, suits, menswear and Indo-Western outfits to seven supported countries.')
    .split('Indian ethnic wear at LuxeMia. Sarees, lehengas, suits and menswear available online with tracked United States shipping.')
      .join('Indian ethnic wear at LuxeMia. Sarees, lehengas, suits and menswear available online with tracked shipping to seven supported countries.')
    .split('tracking provided after dispatch to United States addresses').join('tracking provided after dispatch')
    .split('LuxeMia currently ships to United States addresses only.').join(`LuxeMia ships to ${DESTINATION_NAMES}.`)
    .split('LuxeMia currently ships to United States addresses only').join(`LuxeMia ships to ${DESTINATION_NAMES}`)
    .split('Shipping is available to United States addresses only.').join(`Shipping is available to ${DESTINATION_NAMES}.`)
    .split('Shipping is available to United States addresses only').join(`Shipping is available to ${DESTINATION_NAMES}`)
    .split('United States shipping only.').join('Tracked shipping is available to seven countries.')
    .split('United States shipping only').join('Tracked shipping to seven countries')
    .split('U.S. standard shipping is $12 below $150 and free at $150 and above')
      .join('U.S. standard shipping is $14.99 below $199 and free at $199 and above')
    .split('Standard shipping is $12 below $150 and free at $150 and above')
      .join('U.S. standard shipping is $14.99 below $199 and free at $199 and above')
    .split('Free U.S. shipping at $150 and above; $12 below.')
      .join('Tracked shipping is available to seven countries; route-based rates are shown at checkout.')
    .split('Free U.S. shipping at $150 and above. $12 flat below that.')
      .join('Tracked shipping is available to seven countries; route-based rates are shown at checkout.')
    .split('Shipping is $12 below $150 and free at $150 and above')
      .join('U.S. shipping is $14.99 below $199 and free at $199 and above')
    .split('shipping is free at $150 and above and $12 below')
      .join('U.S. shipping is free at $199 and above and $14.99 below')
    .split('Free U.S. shipping at $150+').join('Tracked shipping to seven supported countries')
    .split('Free U.S. shipping at $150 and above').join('Tracked shipping to seven supported countries')
    .split('United States addresses only').join(DESTINATION_NAMES)
    .split('U.S. delivery only').join('tracked delivery to seven supported countries')
    .split('Glamour Indian Wear').join('LuxeMia');
}

function updateArchitectureObject(architecture) {
  const routes = architecture.routes || {};
  routes['/'] = {
    ...(routes['/'] || {}),
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    h1: HOME_H1,
  };
  if (routes['/lehengas']) {
    routes['/lehengas'].title = 'Bridal & Wedding Lehengas Online USA | LuxeMia';
    routes['/lehengas'].description = 'Shop bridal and wedding-guest lehengas online in the USA. Compare fabric, included pieces, stitching, sizing, availability and product-level processing details.';
  }
  if (routes['/suits']) {
    routes['/suits'].description = 'Shop salwar kameez, Anarkali, sharara and palazzo suits online. Compare fabric, included pieces, stitching, sizing and availability. Tracked shipping is available to seven countries.';
  }
  if (routes['/menswear']) {
    routes['/menswear'].description = 'Shop sherwanis, kurta pajama and Indo-Western menswear online. Compare stated fabric, included pieces, sizes and availability. Tracked shipping is available to seven countries.';
  }
  if (routes['/jewelry']) {
    routes['/jewelry'].description = 'Shop Kundan-style, polki-style and bridal necklace sets. Compare materials, finish, included pieces and measurements. Tracked shipping is available to seven countries.';
  }
  return architecture;
}

function patchArchitectureJson() {
  const relative = 'src/config/seoArchitecture.json';
  const architecture = updateArchitectureObject(JSON.parse(read(relative)));
  write(relative, `${JSON.stringify(architecture, null, 2)}\n`);
}

function patchArchitectureTs() {
  const relative = 'src/config/seoArchitecture.ts';
  let source = read(relative);
  const startMarker = '/* seo-architecture-json:start */';
  const endMarker = '/* seo-architecture-json:end */';
  const markerStart = source.indexOf(startMarker);
  const markerEnd = source.indexOf(endMarker);
  if (markerStart < 0 || markerEnd < 0) throw new Error('[trust] seoArchitecture.ts markers not found');
  const objectStart = source.indexOf('{', markerStart + startMarker.length);
  const objectEnd = source.lastIndexOf('}', markerEnd);
  if (objectStart < 0 || objectEnd < objectStart) throw new Error('[trust] seoArchitecture.ts JSON bounds not found');
  const architecture = updateArchitectureObject(JSON.parse(source.slice(objectStart, objectEnd + 1)));
  source = `${source.slice(0, objectStart)}${JSON.stringify(architecture, null, 2)}${source.slice(objectEnd + 1)}`;
  write(relative, source);
}

function patchSeoMetadata() {
  const relative = 'src/lib/seoMetadata.ts';
  let source = applySafeTextReplacements(read(relative));
  source = source
    .replace(
      /const RETURN_POLICY_SEO_DESCRIPTION = '[^']*';/,
      "const RETURN_POLICY_SEO_DESCRIPTION = 'Read LuxeMia’s change-of-mind rules, mandatory consumer rights, cancellation terms and 48-hour process for reporting genuine damage, defects, incorrect items or missing items.';",
    )
    .replace("title: 'U.S. Shipping Policy | LuxeMia'", `title: '${SHIPPING_TITLE}'`)
    .replace("title: 'Shipping Policy & Rates | LuxeMia'", `title: '${SHIPPING_TITLE}'`)
    .replace(/description: 'LuxeMia ships to United States addresses\.[^']*'/, `description: '${SHIPPING_DESCRIPTION}'`)
    .replace("title: 'U.S. Shipping & Taxes | LuxeMia'", "title: 'International Shipping, Duties & Customs | LuxeMia'")
    .replace(/description: "Review LuxeMia's United States shipping rates, tracking and tax guidance before ordering\."/, `description: '${SHIPPING_CUSTOMS_DESCRIPTION}'`)
    .replace(/description: "Answers to common LuxeMia questions about orders,[^"]*"/, `description: '${FAQ_DESCRIPTION}'`)
    .replace("description: 'Discover LuxeMia: Indian occasionwear chosen for weddings, festivals, and meaningful celebrations in the United States.'", "description: 'Discover LuxeMia: Indian occasionwear selected for weddings, festivals and meaningful celebrations, with tracked shipping to seven supported countries.'")
    .replace(/description: "Browse currently listed Indo-Western and fusion outfits at LuxeMia\.[^"]*"/, "description: 'Browse currently listed Indo-Western and fusion outfits at LuxeMia. See exact product details, stitching, sizes, prices, processing information and availability.'")
    .replace(/description: "Browse LuxeMia's online catalog for delivery to United States addresses\.[^"]*"/, "description: 'Browse LuxeMia Indian ethnic wear for shoppers in the United States, Canada, United Kingdom, Australia, New Zealand, South Africa and Mauritius.'")
    .replace(/description: "Browse Indian sarees, lehengas, suits, menswear and jewelry online for delivery to U\.S\. addresses\. Shipping is free at \$150 and above and \$12 below\."/, "description: 'Browse Indian sarees, lehengas, suits, menswear and jewelry online for U.S. delivery. Standard shipping is $14.99 below $199 and free at $199 and above.'")
    .replace(/description: "Browse currently listed sarees at LuxeMia\.[^"]*"/, "description: 'Browse currently listed sarees at LuxeMia. Open each product for exact fabric, color, included pieces, price, processing information and availability.'");
  write(relative, source);
}

function patchSeoHead() {
  const relative = 'src/components/seo/SEOHead.tsx';
  let source = applySafeTextReplacements(read(relative));
  source = source
    .replace("title = 'Indian Ethnic Wear Online USA | Tracked Shipping | LuxeMia'", `title = '${HOME_TITLE}'`)
    .replace("description = 'Shop Indian outfits for U.S. celebrations: bridal lehengas, wedding sarees, salwar kameez, menswear and jewelry with tracked shipping.'", `description = '${HOME_DESCRIPTION}'`)
    .replace(/`Shop the \$\{product\.name\} at LuxeMia — Indian ethnic wear online with tracked United States shipping\.`/, '`Shop the ${product.name} at LuxeMia — Indian ethnic wear online with tracked shipping to seven supported countries.`');
  write(relative, source);
}

function patchApp() {
  const relative = 'src/App.tsx';
  let source = read(relative);
  if (!source.includes('const ReadyToShip = lazy')) {
    source = source.replace(
      'const CustomizableOutfits = lazy(() => import("./pages/CustomizableOutfits"));',
      'const CustomizableOutfits = lazy(() => import("./pages/CustomizableOutfits"));\nconst ReadyToShip = lazy(() => import("./pages/ReadyToShip"));',
    );
  }
  source = source.replace(
    '<Route path="/ready-to-ship" element={<Navigate to="/collections" replace />} />\n                <Route path="/collections/ready-to-ship" element={<Navigate to="/collections" replace />} />',
    '<Route path="/ready-to-ship" element={<Suspense fallback={<PageLoader />}><ReadyToShip /></Suspense>} />\n                <Route path="/collections/ready-to-ship" element={<Navigate to="/ready-to-ship" replace />} />',
  );

  const redirectMarker = '<Route path="/collections/:handle" element={<Suspense fallback={<PageLoader />}><ShopifyCollection /></Suspense>} />';
  const redirects = [
    '<Route path="/collections/earrings" element={<Navigate to="/jewelry" replace />} />',
    '<Route path="/collections/evening-gowns" element={<Navigate to="/collections" replace />} />',
    '<Route path="/collections/frontpage" element={<Navigate to="/" replace />} />',
    '<Route path="/collections/jacket-sets" element={<Navigate to="/suits" replace />} />',
    '<Route path="/collections/kurta-pajama-vest" element={<Navigate to="/menswear" replace />} />',
    '<Route path="/collections/manthrakodi-sarees" element={<Navigate to="/sarees" replace />} />',
    '<Route path="/collections/saree-gowns" element={<Navigate to="/sarees" replace />} />',
    '<Route path="/collections/navratri-garba-outfits-2026" element={<Navigate to="/collections/navratri-outfits" replace />} />',
  ];
  const missingRedirects = redirects.filter((route) => !source.includes(route));
  if (missingRedirects.length && source.includes(redirectMarker)) {
    source = source.replace(redirectMarker, `${missingRedirects.join('\n                ')}\n                ${redirectMarker}`);
  }
  write(relative, source);
}

function patchShopifyRuntime() {
  const relative = 'src/lib/shopify.ts';
  let source = applySafeTextReplacements(read(relative));
  if (!source.includes('shipsWithinDays?: number | null;')) {
    source = source.replace('    shipsWithin?: number | null;', '    shipsWithin?: number | null;\n    shipsWithinDays?: number | null;');
  }
  if (!source.includes('function parseShipsWithinDays')) {
    source = source.replace(
      'function sanitizeProductNode<T extends ShopifyProduct[\'node\']>(node: T): T {',
      `function parseShipsWithinDays(value?: string | null): number | null {\n  const match = (value || '').match(/\\d+/);\n  if (!match) return null;\n  const days = Number.parseInt(match[0], 10);\n  return Number.isFinite(days) && days > 0 ? days : null;\n}\n\nfunction sanitizeProductNode<T extends ShopifyProduct['node']>(node: T): T {`,
    );
  }
  if (!source.includes('shipsWithinDays: parseShipsWithinDays(node.shipsWithinMetafield?.value)')) {
    source = source.replace(
      '    metadata,\n    description:',
      '    metadata,\n    shipsWithinDays: parseShipsWithinDays(node.shipsWithinMetafield?.value),\n    shipsWithin: parseShipsWithinDays(node.shipsWithinMetafield?.value),\n    description:',
    );
  }
  source = source
    .replace(/\n\s*\.replace\(\/ready\[- \]to\[- \]ship\/gi, 'available online'\)/g, '')
    .replace(/\.replace\(\/USA, Canada, and Australia\/gi, 'the United States'\)/g, `.replace(/USA, Canada, and Australia/gi, '${DESTINATION_NAMES}')`)
    .replace(/\.replace\(\/from the USA\/gi, 'with U\.S\. delivery'\)/g, ".replace(/from the USA/gi, 'with tracked delivery')");
  write(relative, source);
}

function patchSchema() {
  const relative = 'src/lib/schema.ts';
  let source = applySafeTextReplacements(read(relative));
  source = source
    .replace("export const LEGAL_BUSINESS_NAME = 'Glamour Indian Wear';", 'export const LEGAL_BUSINESS_NAME = BRAND_NAME;')
    .replace(/\n\s*legalName: LEGAL_BUSINESS_NAME,?/g, '');
  source = replaceFunction(
    source,
    'generateReturnPolicySchema',
    "export function generateReturnPolicySchema() {\n  // Country-specific statutory rights and voluntary return rules cannot be\n  // represented accurately by one global MerchantReturnPolicy object.\n  // Merchant Center remains the source of truth for country-level settings.\n  return null;\n}",
  );
  source = removeObjectProperty(source, 'hasMerchantReturnPolicy');
  source = source.replace(
    /\n\s*sameAs:\s*\[\s*'https:\/\/www\.instagram\.com\/[^\]]+\],?/m,
    '',
  );
  write(relative, source);
}

function cleanSchemaValue(value) {
  if (Array.isArray(value)) {
    return value.map(cleanSchemaValue).filter((item) => item !== null && item !== undefined);
  }
  if (!value || typeof value !== 'object') return value;
  const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
  if (types.includes('MerchantReturnPolicy')) return null;

  const cleaned = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === 'hasMerchantReturnPolicy' || key === 'legalName' || key === 'sameAs' || key === 'paymentAccepted') continue;
    if (key === 'priceValidUntil') continue;
    const next = cleanSchemaValue(child);
    if (next !== null && next !== undefined) cleaned[key] = next;
  }

  const cleanedTypes = Array.isArray(cleaned['@type']) ? cleaned['@type'] : [cleaned['@type']];
  if (cleanedTypes.includes('Organization')) {
    cleaned.name = 'LuxeMia';
    cleaned.description = 'LuxeMia is an online Indian ethnic wear store serving shoppers in seven countries with product details, sizing guidance and tracking after dispatch.';
    if (cleaned.contactPoint && typeof cleaned.contactPoint === 'object') {
      cleaned.contactPoint.areaServed = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'];
      cleaned.contactPoint.email = 'hello@luxemia.shop';
      cleaned.contactPoint.telephone = '+1-215-341-9990';
    }
  }
  if (cleanedTypes.includes('OnlineStore') || cleanedTypes.includes('ClothingStore')) {
    cleaned['@type'] = ['OnlineStore', 'ClothingStore'];
    cleaned.name = 'LuxeMia Ethnic Wear';
    cleaned.description = 'Authentic South Asian ethnic wear, wedding sarees, bridal lehengas, suits and menswear with tracked shipping to seven supported countries.';
    cleaned.areaServed = COUNTRY_OBJECTS;
    cleaned.currenciesAccepted = CURRENCY_TEXT;
  }
  if (cleaned['@type'] === 'Offer' && cleaned.mpn && cleaned.sku && cleaned.mpn === cleaned.sku) {
    delete cleaned.mpn;
  }
  return cleaned;
}

function replaceMeta(html, attribute, name, value) {
  const expression = new RegExp(`<meta\\s+${attribute}=["']${name}["']\\s+content=["'][^"']*["']\\s*\\/?>(?![\\s\\S]*<meta\\s+${attribute}=["']${name}["'])`, 'i');
  const replacement = `<meta ${attribute}="${name}" content="${value}" />`;
  if (expression.test(html)) return html.replace(expression, replacement);
  return html.replace('</head>', `  ${replacement}\n</head>`);
}

function patchIndex() {
  const relative = 'index.html';
  let html = applySafeTextReplacements(read(relative));
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${HOME_TITLE}</title>`);
  html = replaceMeta(html, 'name', 'title', HOME_TITLE);
  html = replaceMeta(html, 'name', 'description', HOME_DESCRIPTION);
  html = replaceMeta(html, 'property', 'og:title', HOME_TITLE);
  html = replaceMeta(html, 'property', 'og:description', HOME_DESCRIPTION);
  html = replaceMeta(html, 'property', 'og:image:alt', OG_IMAGE_ALT);
  html = replaceMeta(html, 'name', 'twitter:title', HOME_TITLE);
  html = replaceMeta(html, 'name', 'twitter:description', HOME_DESCRIPTION);
  html = replaceMeta(html, 'name', 'twitter:image:alt', OG_IMAGE_ALT);

  html = html.replace(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi, (full, body) => {
    try {
      const parsed = JSON.parse(body.trim());
      const cleaned = cleanSchemaValue(parsed);
      if (cleaned === null) return '';
      return `<script type="application/ld+json">\n${JSON.stringify(cleaned, null, 2)}\n</script>`;
    } catch {
      return full;
    }
  });

  html = html
    .replace(/All sales are final and exchanges are not accepted\./g, 'Except where applicable law provides otherwise, LuxeMia does not accept voluntary change-of-mind returns or exchanges.')
    .replace(/Shipping is available to the United States only\./g, `Shipping is available to ${DESTINATION_NAMES}.`);
  write(relative, html);
}

function patchPrerender() {
  const relative = 'scripts/prerender.js';
  let source = applySafeTextReplacements(read(relative));
  source = removeObjectProperty(source, 'hasMerchantReturnPolicy');
  source = removeObjectProperty(source, 'priceValidUntil');
  source = source
    .replace(/\bmpn:\s*productSku,?/g, '')
    .replace(/\bmpn:\s*sku,?/g, '')
    .split("seller: { '@type': 'Organization', name: 'LuxeMia', alternateName: 'LuxeMia' }")
      .join("seller: { '@type': 'Organization', name: 'LuxeMia' }")
    .split('Custom sizing: Available on request').join('Product measurements: Review the exact listing')
    .split('Handcrafted with love by Indian artisans.').join('Review each product page for the exact supplied fabric, construction and included pieces.')
    .split('Ships to: USA, Canada, Australia').join('Ships to: United States, Canada, United Kingdom, Australia, New Zealand, South Africa, Mauritius')
    .split('Standard delivery: 7–10 business days').join('Carrier transit: Confirmed after dispatch based on destination and service')
    .split('Express delivery: 3–5 business days').join('Express delivery: Available only by confirmed quote before ordering')
    .split('Indian Wedding Sarees & Bridal Lehengas | LuxeMia').join(HOME_TITLE)
    .split('Indian Wedding Sarees &amp; Bridal Lehengas | LuxeMia').join(HOME_TITLE)
    .split('U.S. Shipping Policy | LuxeMia').join(SHIPPING_TITLE);
  write(relative, source);
}

function patchRouteValidator() {
  const relative = 'scripts/validate-route-based-shipping.cjs';
  let source = read(relative);
  source = source
    .split('Indian Wedding Sarees & Bridal Lehengas | LuxeMia').join(HOME_TITLE)
    .split('Indian Wedding Sarees &amp; Bridal Lehengas | LuxeMia').join(HOME_TITLE);
  if (!source.includes('/MerchantReturnPolicy/i')) {
    source = source.replace(
      'const blocked = [',
      'const blocked = [\n  /MerchantReturnPolicy/i,\n  /MerchantReturnNotPermitted/i,\n  /Glamour Indian Wear/i,',
    );
  }
  write(relative, source);
}

function patchSupportingTrustFiles() {
  const files = [
    'src/pages/Index.tsx',
    'src/pages/FAQ.tsx',
    'src/pages/Collections.tsx',
    'src/pages/NewArrivals.tsx',
    'src/pages/Privacy.tsx',
    'src/pages/nri/USA.tsx',
    'src/pages/nri/NRIGeneral.tsx',
    'src/pages/nri/NRILandingPage.tsx',
    'src/middleware/htmlGenerator.ts',
    'src/config/categoryConfig.tsx',
    'public/llms.txt',
    'api/merchant-feed.ts',
  ];
  for (const relative of files) {
    if (!fs.existsSync(absolute(relative))) continue;
    write(relative, applySafeTextReplacements(read(relative)));
  }
}

patchArchitectureJson();
patchArchitectureTs();
patchSeoMetadata();
patchSeoHead();
patchApp();
patchShopifyRuntime();
patchSchema();
patchIndex();
patchPrerender();
patchRouteValidator();
patchSupportingTrustFiles();

const required = {
  'src/config/seoArchitecture.ts': [HOME_TITLE, HOME_DESCRIPTION],
  'src/config/seoArchitecture.json': [HOME_TITLE, HOME_DESCRIPTION],
  'src/lib/seoMetadata.ts': [SHIPPING_TITLE, SHIPPING_DESCRIPTION, FAQ_DESCRIPTION],
  'src/App.tsx': ['const ReadyToShip = lazy', '<ReadyToShip />', '/collections/earrings'],
  'src/lib/shopify.ts': ['shipsWithinDays?: number | null;', 'shipsWithinDays: parseShipsWithinDays(node.shipsWithinMetafield?.value)'],
  'index.html': [HOME_TITLE, '"ClothingStore"', CURRENCY_TEXT],
};
for (const [relative, snippets] of Object.entries(required)) {
  const content = read(relative);
  for (const snippet of snippets) {
    if (!content.includes(snippet)) throw new Error(`[trust] ${relative} missing required value: ${snippet}`);
  }
}
for (const relative of ['src/lib/schema.ts', 'index.html', 'scripts/prerender.js']) {
  const content = read(relative);
  for (const blocked of ['MerchantReturnNotPermitted', 'Glamour Indian Wear']) {
    if (content.includes(blocked)) throw new Error(`[trust] ${relative} still contains blocked value: ${blocked}`);
  }
}

console.log(`[trust] Final trust source applied across ${changed.length} file(s).`);
