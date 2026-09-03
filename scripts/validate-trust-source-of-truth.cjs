#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HOME_TITLE = 'Indian Wedding Sarees, Lehengas & Ethnic Wear | LuxeMia';
const HOME_DESCRIPTION = 'Shop South Asian bridal wear, sarees, lehengas, suits and menswear with tracked shipping to seven supported countries.';
const SHIPPING_TITLE = 'Shipping Policy & International Rates | LuxeMia';
const failures = [];

const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');

function requireFile(relative) {
  const file = path.join(ROOT, relative);
  if (!fs.existsSync(file)) {
    failures.push(`${relative} is missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function requireAll(relative, snippets) {
  const source = requireFile(relative);
  for (const snippet of snippets) {
    if (!source.includes(snippet)) failures.push(`${relative} missing required value: ${snippet}`);
  }
}

function sourceForCopyValidation(relative, rawSource) {
  if (relative !== 'src/lib/shopify.ts' && relative !== 'scripts/prerender.js') return rawSource;
  // These files intentionally contain regex sanitizers that recognize old copy
  // in incoming supplier descriptions. The pattern text is not emitted output.
  return rawSource
    .split('\n')
    .filter((line) => !line.includes('.replace(/'))
    .join('\n');
}

function block(relative, patterns) {
  const rawSource = requireFile(relative);
  const source = sourceForCopyValidation(relative, rawSource);
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (!match || match.index === undefined) continue;
    const line = source.slice(0, match.index).split('\n').length;
    const context = source
      .slice(Math.max(0, match.index - 70), Math.min(source.length, match.index + match[0].length + 90))
      .replace(/\s+/g, ' ')
      .trim();
    failures.push(`${relative}:${line} contains blocked value matching ${pattern}; context: ${context}`);
  }
}

requireAll('src/config/shippingPolicy.ts', [
  "SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU']",
  'US_STANDARD_SHIPPING_RATE = 14.99',
  'US_FREE_SHIPPING_THRESHOLD = 199',
  "id: 'canada-uk'",
  'standardRate: 24.99',
  'freeShippingThreshold: 299',
  "id: 'australia-new-zealand'",
  'standardRate: 29.99',
  'freeShippingThreshold: 349',
  "id: 'south-africa'",
  'standardRate: 49.99',
  "id: 'mauritius'",
  'standardRate: 59.99',
]);

requireAll('src/config/seoArchitecture.ts', [HOME_TITLE, HOME_DESCRIPTION]);
requireAll('src/config/seoArchitecture.json', [HOME_TITLE, HOME_DESCRIPTION]);
requireAll('src/lib/seoMetadata.ts', [
  SHIPPING_TITLE,
  'seven supported destination countries',
  'mandatory consumer rights',
]);
requireAll('src/components/seo/SEOHead.tsx', [
  HOME_TITLE,
  HOME_DESCRIPTION,
  'tracked shipping to seven supported countries',
]);
requireAll('src/App.tsx', [
  'const ReadyToShip = lazy',
  'path="/ready-to-ship"',
  '<ReadyToShip />',
  'path="/collections/ready-to-ship" element={<Navigate to="/ready-to-ship" replace />}',
  'path="/collections/earrings" element={<Navigate to="/jewelry" replace />}',
  'path="/collections/frontpage" element={<Navigate to="/" replace />}',
  'path="/collections/manthrakodi-sarees" element={<Navigate to="/sarees" replace />}',
]);
requireAll('src/pages/ReadyToShip.tsx', [
  'isMadeToOrderProduct(product.node.handle, product.node.tags)',
  'hasExplicitReadyToShipEvidence(product.node)',
  'variants.length > 0 && variants.some((edge) => edge.node.availableForSale === true)',
  'noIndex={!isLoading && !error && sortedProducts.length === 0}',
  'CollectionDirectAnswer path="/ready-to-ship"',
  'View route-based rates',
]);
requireAll('src/config/collectionStandards.ts', [
  'catalog record explicitly identifies ready-to-ship status through a supported tag or positive ships-within value',
  'Availability for sale and the absence of a made-to-order label do not prove ready-to-ship status',
]);
block('src/config/collectionStandards.ts', [
  /Every purchasable LuxeMia catalog item is Ready to Ship/i,
]);
requireAll('src/lib/productFilters.ts', [
  'isMadeToOrderProduct(p.node.handle, p.node.tags)',
  "valueLower.includes('ready')",
]);
requireAll('src/hooks/useShopifyProducts.ts', [
  'isMadeToOrderProduct(product.node.handle, product.node.tags)',
  'hasExplicitReadyToShipEvidence(product.node)',
  'variants.length > 0 && variants.some((edge) => edge.node.availableForSale === true)',
  "const CACHE_VERSION = 'v14'",
]);
requireAll('src/lib/readyToShipEvidence.ts', [
  'hasExplicitReadyToShipEvidence',
  'node.shipsWithinMetafield?.value ?? node.shipsWithinDays ?? node.shipsWithin',
]);
requireAll('src/lib/shopify.ts', [
  'shipsWithinDays?: number | null;',
  'function parseShipsWithinDays',
  'shipsWithinDays: parseShipsWithinDays(node.shipsWithinMetafield?.value)',
]);
requireAll('src/lib/schema.ts', [
  'export function generateReturnPolicySchema()',
  'return null;',
  "SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU']",
  "createService('us-standard-shipping'",
  "createService('canada-uk-standard-shipping'",
  "createService('australia-nz-standard-shipping'",
  "createService('south-africa-standard-shipping'",
  "createService('mauritius-standard-shipping'",
  "currenciesAccepted: 'USD'",
]);
requireAll('index.html', [
  HOME_TITLE,
  HOME_DESCRIPTION,
  '"ClothingStore"',
  '"currenciesAccepted": "USD"',
  'hello@luxemia.shop',
  '+1-215-341-9990',
]);
block('src/lib/schema.ts', [/AUD,\s*CAD,\s*GBP,\s*MUR,\s*NZD,\s*USD/i]);
block('index.html', [/AUD,\s*CAD,\s*GBP,\s*MUR,\s*NZD,\s*USD/i]);
requireAll('src/lib/returnPolicyCopy.ts', [
  'Change-of-mind purchases are final sale.',
  'reported promptly—preferably within 48 hours of delivery',
  'with available photos and, when available, unboxing evidence',
  'A missing video does not by itself remove rights that cannot legally be excluded.',
]);
requireAll('scripts/prerender.js', [
  "...create(['CA', 'GB'], 24.99, 299)",
  "...create(['AU', 'NZ'], 29.99, 349)",
  "...create('ZA', 49.99)",
  "...create('MU', 59.99)",
]);
requireAll('CREAO_AI_PROMPT.md', [
  'Evidence-Only Shopify Catalog Draft Prompt',
  'luxemia_catalog_evidence.csv',
  'Product status | `draft`',
  'Published | `FALSE`',
  'Do not invent or hardcode',
  'A non-empty factual field lacks a matching evidence row',
]);
requireAll('supabase/migrations/20260902221500_secure_consultation_lead_access.sql', [
  'DROP POLICY IF EXISTS "Allow authenticated read"',
  'REVOKE SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER',
  'FROM anon, authenticated',
  'GRANT ALL ON public.consultation_leads TO service_role',
]);
requireAll('src/data/semanticCommerceGuides.ts', [
  'https://www.nist.gov/publications/body-dimensions-apparel',
  'https://www.ftc.gov/legal-library/browse/rules/care-labeling-textile-wearing-apparel-certain-piece-goods',
  'https://www.cbp.gov/trade/basic-import-export/internet-purchases',
  'https://www.vam.ac.uk/articles/indian-textiles',
  '/collections/groomsmen-outfits',
]);
requireAll('src/components/product/ProductTabs.tsx', [
  'Only explicitly prefixed fact tags are displayed',
  'does not infer fabric, fiber composition, included pieces, color, work, or occasion',
  'does not apply a universal chart to this item',
  'A product-specific care instruction was not supplied',
]);
requireAll('middleware.ts', [
  "if (productLookup.status === 'unavailable')",
  'return return404(request);',
]);
block('middleware.ts', [
  /jewelryFallback/i,
  /generateJewelryProductHtml/i,
]);

const blockedRuntimePatterns = [
  /MerchantReturnNotPermitted/i,
  /['"]@type['"]\s*:\s*['"]MerchantReturnPolicy['"]/i,
  /Glamour Indian Wear/i,
  /United States addresses only/i,
  /U\.S\. delivery only/i,
  /\$12(?!\d)[^\n]{0,100}(?:shipping|below \$150)/i,
  /free[^\n]{0,60}\$150/i,
  /International standard shipping is \$14\.99 below \$300/i,
  /LuxeMia — Indian Ethnic Wear Online for (?:US|U\.S\.) Delivery/i,
  /Free worldwide shipping/i,
  /free shipping[^\n]{0,80}(?:over|above|at) \$350/i,
  /orders? (?:over|above) \$350[^\n]{0,80}free shipping/i,
  /All orders ship with full DHL Express tracking/i,
  /Custom sizing:\s*Available on request/i,
  /published 1[–-]3 business-day processing/i,
  /processing window of three business days or less/i,
  /\$30 Fit Guarantee/i,
  /Free Custom Stitching/i,
  /Made-to-measure included/i,
];

const blockedPolicyPatterns = [
  /\bAll sales are final\b/i,
  /\bAll sales final\b/i,
  /\bmandatory unboxing video\b/i,
  /\bcontinuous unboxing(?:\/opening)? video is required\b/i,
  /\bcontact (?:us|LuxeMia) within 48 hours\b/i,
  /\bmust be reported within 48 hours\b/i,
  /\bmust be submitted within 48 hours\b/i,
  /\bclaims? accepted within 48 hours\b/i,
  /\balongside the required video\b/i,
  /\binclude the required photos\b/i,
];

const blockedCatalogMarketingPatterns = [
  /\bnear-perfect fit\b/i,
  /\b(?:3-5|6-8|8-10) business days\b/i,
  /\bcomfortable for all-day wear\b/i,
  /\bHand-crafted\b/i,
  /\bflatters all skin tones\b/i,
  /\b200\+ style combinations\b/i,
  /\bauthentic\b/i,
  /\bSourced directly from India's textile hubs\b/i,
  /\bquality-inspected before shipping\b/i,
  /\bhigh-quality\b/i,
  /\bpremium\s+(?:georgette|fabric|quality)\b/i,
  /\bbreathable\b/i,
  /\bdesigner-quality\b/i,
  /\bperfect for\b/i,
  /\baffordable luxury\b/i,
  /\bflattering across skin tones\b/i,
];

const blockedCatalogPromptInstructions = [
  /USD_selling_price\s*=\s*INR_selling_price/i,
  /Inventory quantity[^\n]{0,80}Always\s+`?50/i,
  /Status[^\n]{0,80}Always\s+`?Active/i,
  /Vendor[^\n]{0,80}Always\s+`?LuxemiaShop/i,
  /Yes, this \[product type\] comes with a matching blouse piece/i,
  /We recommend dry cleaning to preserve/i,
  /Sourced from India's finest textile regions/i,
  /Fabric Descriptions\s*\n\s*\|/i,
  /Work Descriptions\s*\n\s*\|/i,
];

for (const relative of [
  'index.html',
  'src/config/seoArchitecture.ts',
  'src/config/seoArchitecture.json',
  'src/lib/seoMetadata.ts',
  'src/components/seo/SEOHead.tsx',
  'src/lib/schema.ts',
  'src/pages/Index.tsx',
  'src/pages/Shipping.tsx',
  'src/pages/ShippingCustoms.tsx',
  'src/pages/ReadyToShip.tsx',
  'src/pages/FAQ.tsx',
  'src/pages/Collections.tsx',
  'src/pages/NewArrivals.tsx',
  'src/lib/shopify.ts',
  'scripts/prerender.js',
  'public/llms.txt',
  'api/merchant-feed.ts',
  'shopify-vol34-FINAL.csv',
  'shopify-vol34-georgette-lehengas.csv',
  'CREAO_AI_PROMPT.md',
  'LUXEMIA_GROWTH_REPORT.md',
]) {
  block(relative, blockedRuntimePatterns);
}

for (const relative of [
  'index.html',
  'src/lib/returnPolicyCopy.ts',
  'src/lib/seoMetadata.ts',
  'src/pages/Returns.tsx',
  'src/pages/FAQ.tsx',
  'src/pages/NavratriOutfits.tsx',
  'src/pages/CareGuide.tsx',
  'src/pages/Privacy.tsx',
  'src/pages/Terms.tsx',
  'src/pages/SemanticCommercePage.tsx',
  'src/components/product/ProductInfo.tsx',
  'src/components/product/ProductTabs.tsx',
  'src/middleware/htmlGenerator.ts',
  'supabase/functions/sync-to-shopify/index.ts',
  'scripts/prerender.js',
  'shopify-vol34-FINAL.csv',
  'shopify-vol34-georgette-lehengas.csv',
  'LUXEMIA_GROWTH_REPORT.md',
]) {
  block(relative, blockedPolicyPatterns);
}

for (const relative of [
  'shopify-vol34-FINAL.csv',
  'shopify-vol34-georgette-lehengas.csv',
]) {
  block(relative, blockedCatalogMarketingPatterns);
}

block('CREAO_AI_PROMPT.md', blockedCatalogPromptInstructions);

block('scripts/prerender.js', [
  /priceValidUntil\s*:/i,
  /mpn\s*:\s*(?:productSku|sku)\b/i,
]);

try {
  const ts = read('src/config/seoArchitecture.ts');
  const json = read('src/config/seoArchitecture.json').trim();
  const start = ts.indexOf('/* seo-architecture-json:start */');
  const end = ts.indexOf('/* seo-architecture-json:end */');
  const objectStart = ts.indexOf('{', start);
  const objectEnd = ts.lastIndexOf('}', end);
  if (start < 0 || end < 0 || objectStart < 0 || objectEnd < objectStart) {
    failures.push('src/config/seoArchitecture.ts JSON markers could not be parsed');
  } else {
    const tsObject = JSON.parse(ts.slice(objectStart, objectEnd + 1));
    const jsonObject = JSON.parse(json);
    if (JSON.stringify(tsObject) !== JSON.stringify(jsonObject)) {
      failures.push('src/config/seoArchitecture.ts and src/config/seoArchitecture.json are not identical');
    }
  }
} catch (error) {
  failures.push(`SEO architecture JSON validation failed: ${error.message}`);
}

try {
  const html = read('index.html');
  const scripts = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  if (scripts.length === 0) failures.push('index.html has no JSON-LD');
  for (const [index, match] of scripts.entries()) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const serialized = JSON.stringify(parsed);
      if (serialized.includes('MerchantReturnPolicy')) failures.push(`index.html JSON-LD block ${index + 1} contains MerchantReturnPolicy`);
      if (serialized.includes('Glamour Indian Wear')) failures.push(`index.html JSON-LD block ${index + 1} contains an unverified legal name`);
      if (Array.isArray(parsed['@graph'])) {
        const organizations = parsed['@graph'].filter(node => node && node['@id'] === 'https://luxemia.shop/#organization');
        if (organizations.length !== 1) failures.push(`index.html JSON-LD must define exactly one #organization node; found ${organizations.length}`);
        const types = organizations[0]?.['@type'];
        const typeList = Array.isArray(types) ? types : [types];
        for (const requiredType of ['Organization', 'OnlineStore', 'ClothingStore']) {
          if (!typeList.includes(requiredType)) failures.push(`index.html #organization is missing @type ${requiredType}`);
        }
      }
    } catch (error) {
      failures.push(`index.html JSON-LD block ${index + 1} is invalid JSON: ${error.message}`);
    }
  }
} catch (error) {
  failures.push(`index.html structured-data validation failed: ${error.message}`);
}

if (failures.length) {
  console.error('[trust-source] Validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[trust-source] OK — metadata, route shipping, positive-evidence Ready-to-Ship classification, redirects and structured data use the final source of truth.');
