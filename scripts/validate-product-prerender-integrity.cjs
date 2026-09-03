#!/usr/bin/env node

/**
 * Product-prerender release gate.
 *
 * Source checks make fail-closed catalog behavior non-optional. Built checks
 * prove that the emitted route/file set equals the complete eligible Shopify
 * snapshot recorded by prerender.js and that every product fact comes from
 * that product's initial Shopify payload.
 */

const fs = require('fs');
const path = require('path');
const {
  parseJsonLdScripts,
  validateItemListParity,
} = require('./prerender-validation-helpers.cjs');

const ROOT = path.resolve(__dirname, '..');
const PRERENDER_SOURCE = path.join(ROOT, 'scripts', 'prerender.js');
const PRODUCT_INFO_SOURCE = path.join(ROOT, 'src', 'components', 'product', 'ProductInfo.tsx');
const PRODUCT_DETAIL_SOURCE = path.join(ROOT, 'src', 'pages', 'ProductDetail.tsx');
const READY_TO_SHIP_SOURCE = path.join(ROOT, 'src', 'pages', 'ReadyToShip.tsx');
const SHOPIFY_PRODUCTS_HOOK_SOURCE = path.join(ROOT, 'src', 'hooks', 'useShopifyProducts.ts');
const MIDDLEWARE_SOURCE = path.join(ROOT, 'middleware.ts');
const PRERENDER_DIR = path.join(ROOT, 'dist', '_prerender');
const PRODUCT_DIR = path.join(PRERENDER_DIR, 'product');
const MANIFEST_PATH = path.join(PRERENDER_DIR, 'manifest.json');
const REQUIRE_BUILT = process.argv.includes('--require-built');
const SITE_URL = 'https://luxemia.shop';
const ALL_DESTINATIONS = 'United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius';
const MISSING_CARE_COPY = 'Product-specific care instructions were not supplied in the current listing.';
const failures = [];

function fail(message) {
  failures.push(message);
}

function requireSource(pattern, label) {
  if (!pattern.test(source)) fail(`source is missing ${label}`);
}

function forbidSource(pattern, label) {
  if (pattern.test(source)) fail(`source still contains ${label}`);
}

function routeSourceBlock(routePath) {
  const marker = `path: '${routePath}',`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) {
    fail(`source is missing ${routePath} prerender route`);
    return '';
  }
  const blockStart = source.lastIndexOf('  {', markerIndex);
  const nextBlock = source.indexOf('\n  {', markerIndex + marker.length);
  return source.slice(blockStart, nextBlock < 0 ? source.length : nextBlock);
}

function functionSourceBlock(functionName, nextFunctionName) {
  const start = source.indexOf(`function ${functionName}(`);
  const end = source.indexOf(`function ${nextFunctionName}(`, start + 1);
  if (start < 0 || end < 0) {
    fail(`source is missing ${functionName} or its ${nextFunctionName} boundary`);
    return '';
  }
  return source.slice(start, end);
}

function sameSet(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function parseJsonLd(html, route) {
  const schemaFailures = [];
  const schemas = parseJsonLdScripts(html, route, schemaFailures).map(({ schema }) => schema);
  schemaFailures.forEach(fail);
  return schemas;
}

function parseInitialProduct(html, route) {
  const match = html.match(/window\.__INITIAL_PRODUCT_DATA__\s*=\s*({[\s\S]*?});<\/script>/);
  if (!match) {
    fail(`${route}: missing initial Shopify product payload`);
    return null;
  }
  try {
    return JSON.parse(match[1])?.product || null;
  } catch (error) {
    fail(`${route}: invalid initial Shopify product payload (${error.message})`);
    return null;
  }
}

function normalizeBrand(vendor) {
  const raw = String(vendor || '').trim();
  if (!raw) return '';
  return /^luxemi(?:a|ashop)$/i.test(raw.replace(/[^a-z0-9]/gi, '')) ? 'LuxeMia' : '';
}

function validateBrand(brand, vendor, route, label) {
  const expected = normalizeBrand(vendor);
  if (!expected) {
    if (brand !== undefined) fail(`${route}: ${label} publishes a brand without Shopify vendor evidence`);
    return;
  }
  if (!brand || brand['@id'] !== `${SITE_URL}/#brand` || Object.keys(brand).length !== 1) {
    fail(`${route}: ${label} must reference the canonical LuxeMia #brand node`);
  }
}

function verifiedItemCondition(product) {
  const conditionTag = (product.tags || []).find((tag) => /^condition\s*[:=]\s*\S/i.test(String(tag).trim()));
  const raw = String(
    product.conditionMetafield?.value
    || (conditionTag ? String(conditionTag).replace(/^condition\s*[:=]\s*/i, '') : ''),
  ).trim().toLowerCase().replace(/[\s_-]+/g, '');
  const conditions = {
    new: 'NewCondition',
    newcondition: 'NewCondition',
    used: 'UsedCondition',
    usedcondition: 'UsedCondition',
    preowned: 'UsedCondition',
    refurbished: 'RefurbishedCondition',
    refurbishedcondition: 'RefurbishedCondition',
    damaged: 'DamagedCondition',
    damagedcondition: 'DamagedCondition',
  };
  return conditions[raw] ? `https://schema.org/${conditions[raw]}` : undefined;
}

function validMoney(money) {
  return typeof money?.amount === 'string'
    && money.amount.trim() !== ''
    && Number.isFinite(Number(money.amount))
    && Number(money.amount) > 0
    && /^[A-Z]{3}$/.test(String(money.currencyCode || ''));
}

function comparableImageUrl(value) {
  try {
    const url = new URL(value);
    url.searchParams.delete('format');
    url.searchParams.delete('width');
    return `${url.origin}${url.pathname}`;
  } catch {
    return String(value || '').split('?')[0];
  }
}

function productSchemasForRoute(schemas, canonical) {
  return schemas.filter((schema) => (
    (schema?.['@type'] === 'ProductGroup' || schema?.['@type'] === 'Product')
    && (schema.url === canonical || schema['@id'] === `${canonical}#productgroup` || schema['@id'] === `${canonical}#product`)
  ));
}

function hasExplicitReadyToShipEvidence(product) {
  const tagPattern = /^(?:(?:availability|fulfillment|shipping|status)\s*[:=]\s*)?ready[\s_-]*to[\s_-]*ship$/i;
  if ((product.tags || []).some((tag) => tagPattern.test(String(tag).trim()))) return true;
  const rawDays = product.shipsWithinMetafield?.value ?? product.shipsWithinDays ?? product.shipsWithin;
  if (typeof rawDays === 'number') return Number.isFinite(rawDays) && rawDays > 0;
  if (typeof rawDays !== 'string' || !rawDays.trim()) return false;
  const match = rawDays.match(/\d+/);
  return Boolean(match && Number.parseInt(match[0], 10) > 0);
}

function isMadeToOrder(product) {
  const tags = new Set((product.tags || []).map((tag) => String(tag).trim().toLowerCase()));
  return ['made to order', 'availability:made to order', 'custom-made'].some((tag) => tags.has(tag));
}

function validateBuiltReadyToShipCollection() {
  const route = '/ready-to-ship';
  const file = path.join(PRERENDER_DIR, 'ready-to-ship.html');
  if (!fs.existsSync(file)) {
    fail(`${route}: built prerender is missing`);
    return;
  }
  const html = fs.readFileSync(file, 'utf8');
  const payloadMatch = html.match(/window\.__INITIAL_DATA__\s*=\s*({[\s\S]*?});<\/script>/);
  const schemas = parseJsonLd(html, route);
  const collectionSchemas = schemas.filter((schema) => schema?.['@type'] === 'CollectionPage');
  const itemLists = schemas.filter((schema) => schema?.['@type'] === 'ItemList');

  if (!payloadMatch) {
    if (!/<meta name="robots" content="noindex, follow" \/>/.test(html)) {
      fail(`${route}: empty evidence result is not noindexed`);
    }
    if (!html.includes('No current products met the explicit ready-to-ship evidence and available-variant requirements')) {
      fail(`${route}: empty evidence result lacks its neutral status explanation`);
    }
    if (/data-collection-products|data-collection-decision-table/.test(html)) {
      fail(`${route}: empty evidence result is emitted as a substantive collection`);
    }
    if (collectionSchemas.length > 0 || itemLists.length > 0) {
      fail(`${route}: empty evidence result emits CollectionPage or ItemList schema`);
    }
    return;
  }

  let products;
  try {
    products = JSON.parse(payloadMatch[1])?.products?.map((entry) => entry.node) || [];
  } catch (error) {
    fail(`${route}: invalid initial collection payload (${error.message})`);
    return;
  }
  if (products.length === 0) fail(`${route}: emitted an empty initial collection payload`);
  if (/content="noindex, follow"/.test(html)) fail(`${route}: positive evidence result is noindexed`);
  products.forEach((product) => {
    if (!hasExplicitReadyToShipEvidence(product)) fail(`${route}: ${product.handle} lacks positive Ready-to-Ship catalog evidence`);
    if (product.availableForSale !== true) fail(`${route}: ${product.handle} is not currently available for sale`);
    if (isMadeToOrder(product)) fail(`${route}: ${product.handle} is marked Made to Order`);
    const variants = product.variants?.edges?.map((edge) => edge.node) || [];
    if (variants.length === 0 || !variants.some((variant) => variant.availableForSale === true)) {
      fail(`${route}: ${product.handle} lacks an available Shopify variant`);
    }
  });
  if (collectionSchemas.length !== 1 || itemLists.length !== 1) {
    fail(`${route}: positive evidence result must emit one CollectionPage and one ItemList schema`);
  } else {
    const payloadHandles = products.map((product) => product.handle);
    if (validateItemListParity(itemLists[0], payloadHandles)) {
      fail(`${route}: ItemList products do not equal the first 30 products in the positive-evidence hydration payload`);
    }
  }
}

function validateBuiltProduct(handle) {
  const route = `/product/${handle}`;
  const canonical = `${SITE_URL}${route}`;
  const file = path.join(PRODUCT_DIR, `${handle}.html`);
  const html = fs.readFileSync(file, 'utf8');
  const product = parseInitialProduct(html, route);
  if (!product) return;
  if (product.handle !== handle) fail(`${route}: payload handle is ${product.handle || '(missing)'}`);
  if (!String(product.title || '').trim()) fail(`${route}: payload title is missing`);
  if (typeof product.availableForSale !== 'boolean') fail(`${route}: payload product availability is missing`);
  if (!validMoney(product.priceRange?.minVariantPrice)) fail(`${route}: payload minimum price/currency is invalid`);

  const sourceImages = product.images?.edges
    ?.map((edge) => edge?.node?.url)
    .filter(Boolean) || [];
  if (sourceImages.length === 0) fail(`${route}: payload has no Shopify image`);
  const comparableSourceImages = new Set(sourceImages.map(comparableImageUrl));

  const variants = product.variants?.edges?.map((edge) => edge?.node).filter(Boolean) || [];
  if (variants.length === 0) fail(`${route}: payload has no Shopify variant`);
  const variantsById = new Map();
  variants.forEach((variant, index) => {
    const numericId = String(variant?.id || '').split('/').pop();
    if (!numericId) fail(`${route}: variant ${index + 1} has no Shopify ID`);
    if (numericId) variantsById.set(numericId, variant);
    if (typeof variant?.availableForSale !== 'boolean') fail(`${route}: variant ${index + 1} has no availability`);
    if (!validMoney(variant?.price)) fail(`${route}: variant ${index + 1} has invalid price/currency`);
    if (variant?.image?.url) comparableSourceImages.add(comparableImageUrl(variant.image.url));
  });
  const purchaseCtas = new Map();
  for (const match of html.matchAll(/<a data-product-variant-cta="true" data-variant-id="(\d+)" data-price="([^"]+)" data-currency="([A-Z]{3})" href="([^"]+)">/g)) {
    if (purchaseCtas.has(match[1])) fail(`${route}: duplicate static purchase CTA for Shopify variant ${match[1]}`);
    purchaseCtas.set(match[1], {
      price: match[2],
      currency: match[3],
      href: match[4],
    });
  }
  const availableVariantIds = variants
    .filter((variant) => product.availableForSale === true && variant.availableForSale === true)
    .map((variant) => String(variant.id).split('/').pop())
    .sort();
  if (!sameSet([...purchaseCtas.keys()].sort(), availableVariantIds)) {
    fail(`${route}: static purchase CTA set does not exactly equal available Shopify variants`);
  }

  const expectedVisibleAvailability = product.availableForSale === true
    && variants.some((variant) => variant.availableForSale === true)
    ? 'In Stock'
    : 'Out of Stock';
  const visible = html.match(/<p data-product-primary-offer data-variant-id="(\d+)" data-price="([^"]+)" data-currency="([A-Z]{3})" data-availability="(In Stock|Out of Stock)">Price:\s*<strong>([A-Z]{3})\s+(\d+(?:\.\d+)?)<\/strong>[\s\S]{0,220}?\|\s*(In Stock|Out of Stock)<\/p>/);
  if (!visible) {
    fail(`${route}: visible price, currency, and availability are missing`);
  } else {
    const defaultVariant = (product.availableForSale === true
      ? variants.find((variant) => variant.availableForSale === true)
      : undefined) || variants[0];
    const defaultVariantId = String(defaultVariant?.id || '').split('/').pop();
    if (visible[1] !== defaultVariantId) fail(`${route}: primary offer does not identify the default Shopify variant`);
    if (Number(visible[2]).toFixed(2) !== Number(defaultVariant?.price?.amount).toFixed(2)
      || Number(visible[6]).toFixed(2) !== Number(defaultVariant?.price?.amount).toFixed(2)) {
      fail(`${route}: visible price does not match the default Shopify variant`);
    }
    if (visible[3] !== defaultVariant?.price?.currencyCode || visible[5] !== defaultVariant?.price?.currencyCode) {
      fail(`${route}: visible currency does not match the default Shopify variant`);
    }
    if (visible[4] !== expectedVisibleAvailability || visible[7] !== expectedVisibleAvailability) {
      fail(`${route}: visible availability does not match Shopify`);
    }
  }

  if (!html.includes(`<dt>Ships to</dt><dd>${ALL_DESTINATIONS}</dd>`)) {
    fail(`${route}: visible Ships to row does not name all seven supported countries`);
  }
  if (/Dry cleaning is recommended for embroidered or embellished ethnic wear/i.test(html)) {
    fail(`${route}: contains inferred apparel dry-cleaning advice`);
  }
  const isJewelry = /\b(jewel|jewell|necklace|choker|earring|bangle|bracelet|ring|maang\s*tikka|anklet|kundan|polki)\b/i
    .test(`${product.productType || ''} ${product.title || ''}`);
  const hasCareEvidence = (product.tags || []).some((tag) => /^(?:care|care instructions)\s*:\s*\S/i.test(String(tag)))
    || /(?:^|\s)(?:Care|Care Instructions)\s*:\s*\S/i.test(String(product.description || ''));
  if (!isJewelry && !hasCareEvidence && !html.includes(MISSING_CARE_COPY)) {
    fail(`${route}: missing apparel care is not disclosed as unsupplied`);
  }

  const routeSchemas = productSchemasForRoute(parseJsonLd(html, route), canonical);
  if (routeSchemas.length !== 1) {
    fail(`${route}: expected one canonical Product or ProductGroup schema, found ${routeSchemas.length}`);
    return;
  }
  const rootSchema = routeSchemas[0];
  validateBrand(rootSchema.brand, product.vendor, route, rootSchema['@type']);
  const expectedCondition = verifiedItemCondition(product);
  const validateSchemaImages = (schemaImagesValue, label) => {
    const schemaImages = Array.isArray(schemaImagesValue) ? schemaImagesValue : [schemaImagesValue].filter(Boolean);
    if (schemaImages.length === 0) fail(`${route}: ${label} has no Shopify image`);
    for (const image of schemaImages) {
      if (/\/og-image\.jpg(?:\?|$)/i.test(String(image))) fail(`${route}: ${label} uses the sitewide placeholder image`);
      if (!comparableSourceImages.has(comparableImageUrl(image))) fail(`${route}: ${label} image is absent from the Shopify payload`);
    }
  };
  validateSchemaImages(rootSchema.image, rootSchema['@type']);
  const schemaProducts = rootSchema['@type'] === 'ProductGroup' ? rootSchema.hasVariant || [] : [rootSchema];
  if (rootSchema['@type'] === 'ProductGroup' && schemaProducts.length !== variants.length) {
    fail(`${route}: ProductGroup variant count does not match Shopify payload`);
  }

  schemaProducts.forEach((schemaProduct, index) => {
    validateBrand(schemaProduct.brand, product.vendor, route, `Product schema ${index + 1}`);
    if (schemaProduct !== rootSchema) validateSchemaImages(schemaProduct.image, `Product schema ${index + 1}`);

    const offer = schemaProduct.offers;
    if (!offer) {
      fail(`${route}: Product schema ${index + 1} has no Offer`);
      return;
    }
    const variantParam = String(offer.url || '').match(/[?&]variant=(\d+)/)?.[1];
    const expectedVariant = variantParam
      ? variantsById.get(variantParam)
      : undefined;
    if (!expectedVariant) {
      fail(`${route}: Product schema ${index + 1} Offer URL does not identify a current Shopify variant`);
      return;
    }
    const expectedOfferUrl = `${canonical}?variant=${variantParam}`;
    if (offer.url !== expectedOfferUrl || offer['@id'] !== `${expectedOfferUrl}#offer`) {
      fail(`${route}: Product schema ${index + 1} does not use the exact current variant URL for its Offer`);
    }
    if (offer.itemCondition !== expectedCondition) {
      fail(`${route}: Product schema ${index + 1} condition is not supported by Shopify condition evidence`);
    }
    if (schemaProduct === rootSchema && schemaProduct.itemCondition !== expectedCondition) {
      fail(`${route}: root Product condition is not supported by Shopify condition evidence`);
    }
    if (Number(offer.price).toFixed(2) !== Number(expectedVariant.price.amount).toFixed(2)) {
      fail(`${route}: Product schema ${index + 1} price does not match its Shopify variant`);
    }
    if (offer.priceCurrency !== expectedVariant.price.currencyCode) {
      fail(`${route}: Product schema ${index + 1} currency does not match its Shopify variant`);
    }
    const expectedAvailability = product.availableForSale === true && expectedVariant.availableForSale === true
      ? 'InStock'
      : 'OutOfStock';
    if (String(offer.availability || '').split('/').pop() !== expectedAvailability) {
      fail(`${route}: Product schema ${index + 1} availability does not match its Shopify variant`);
    }
    const purchaseCta = purchaseCtas.get(variantParam);
    if (product.availableForSale === true && expectedVariant.availableForSale === true) {
      if (!purchaseCta) {
        fail(`${route}: in-stock Product schema ${index + 1} has no exact-variant static purchase CTA`);
      } else {
        if (purchaseCta.href !== `${expectedOfferUrl}#product-purchase`) {
          fail(`${route}: Product schema ${index + 1} purchase CTA does not target its exact live variant controls`);
        }
        if (Number(purchaseCta.price).toFixed(2) !== Number(expectedVariant.price.amount).toFixed(2)
          || purchaseCta.currency !== expectedVariant.price.currencyCode) {
          fail(`${route}: Product schema ${index + 1} purchase CTA price/currency does not match Shopify`);
        }
      }
    } else if (purchaseCta) {
      fail(`${route}: out-of-stock Product schema ${index + 1} incorrectly has a purchase CTA`);
    }
  });
}

const source = fs.readFileSync(PRERENDER_SOURCE, 'utf8');
const productInfoSource = fs.readFileSync(PRODUCT_INFO_SOURCE, 'utf8');
const productDetailSource = fs.readFileSync(PRODUCT_DETAIL_SOURCE, 'utf8');
const readyToShipSource = fs.readFileSync(READY_TO_SHIP_SOURCE, 'utf8');
const shopifyProductsHookSource = fs.readFileSync(SHOPIFY_PRODUCTS_HOOK_SOURCE, 'utf8');
const middlewareSource = fs.readFileSync(MIDDLEWARE_SOURCE, 'utf8');

forbidSource(/\bFALLBACK_(?:OG_IMAGE|PRICE|CURRENCY)\b/, 'product price/image/currency fallback constants');
forbidSource(/\bfallbackDesc\b/, 'synthetic fallback product description');
forbidSource(/route\.product\s*\|\|\s*null/, 'product-route fallback when Shopify lookup misses');
forbidSource(/\bapplyCustomizableProductDetails\b|\bCUSTOM_PRODUCT_TIMING\b/, 'prerender-only product-title, description, tag, or timing overrides');
forbidSource(/itemCondition\s*:\s*['"]https:\/\/schema\.org\/NewCondition['"]/, 'unconditional NewCondition schema');
forbidSource(/if \(!raw\) return ['"]LuxeMia['"]/, 'LuxeMia brand fallback for a missing Shopify vendor');
forbidSource(/Dry cleaning is recommended for embroidered or embellished ethnic wear/i, 'inferred apparel dry-cleaning advice');
requireSource(/SHOPIFY_STOREFRONT_TOKEN is required; product prerendering cannot use cached or hardcoded fallbacks/, 'mandatory live Shopify token guard');
requireSource(/Live Shopify product fetch returned no eligible products/, 'empty live-catalog build failure');
requireSource(/Live Shopify product fetch exceeded the 2,000-product pagination guard/, 'complete-pagination build failure');
requireSource(/!productMap\.has\(routePath\.slice\('\/product\/'\.length\)\)/, 'stale product-route pruning against productMap');
requireSource(/assertExactLiveProductRouteSet\(routes, productMap\)/, 'exact live-catalog route-set assertion');
requireSource(/getLiveProductPrerenderEvidence\(live\)/, 'source-backed Product schema evidence gate');
requireSource(/getLiveProductPrerenderEvidence\(p\)/, 'source-backed visible product evidence gate');
requireSource(/loadTsModule\('src\/lib\/productDescriptionEnrichment\.ts'\)/, 'shared evidence-safe product-copy module loading');
requireSource(/const buildVerifiedProductCopy\s*=\s*productDescriptionModule\.buildVerifiedProductCopy/, 'shared product-copy builder assignment');
requireSource(/const sanitizeProductTitle\s*=\s*productDescriptionModule\.sanitizeProductTitle/, 'shared product-title sanitizer assignment');
requireSource(/loadTsModule\('src\/lib\/productEvidence\.ts'\)/, 'shared customization-evidence module loading');
requireSource(/hasExplicitCustomizationEvidence\s*=\s*productEvidenceModule\.hasExplicitCustomizationEvidence/, 'shared customization-evidence assignment');
requireSource(/conditionMetafield: metafield\(namespace: "custom", key: "condition"\)/, 'Shopify condition metafield query');
requireSource(/productItemCondition \? \{ itemCondition: productItemCondition \} : \{\}/, 'condition schema omission without explicit evidence');
requireSource(new RegExp(`<dt>Ships to<\\/dt><dd>${ALL_DESTINATIONS}<\\/dd>`), 'all-seven-country visible Ships to row');
requireSource(new RegExp(MISSING_CARE_COPY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'explicit missing product-care disclosure');
requireSource(/function normalizeBrand[\s\S]*?\^luxemi[\s\S]*?\? 'LuxeMia' : ''/, 'explicit LuxeMia-only vendor allowlist');
requireSource(/function generateProductBrandSchema[\s\S]*?name === 'LuxeMia'[\s\S]*?'@id': `\$\{SITE_URL\}\/\#brand`/, 'canonical LuxeMia brand reference');
requireSource(/function generateProductBrandSchema[\s\S]*?if \(!name\) return undefined/, 'brand omission without Shopify vendor evidence');
requireSource(/function getProductVariantUrl[\s\S]*?variant\?\.id[\s\S]*?\?variant=\$\{encodeURIComponent\(numericVariantId\)\}/, 'exact Shopify variant URL construction');
requireSource(/const openGraphType = route\.path\.startsWith\('\/product\/'\)[\s\S]*?\? 'product'/, 'raw product Open Graph type');
requireSource(/data-product-variant-cta="true"[\s\S]*?#product-purchase/, 'exact-variant static purchase CTA');
requireSource(/availableForSale:\s*product\.availableForSale === true && variants\.some\(\(variant\) => variant\.availableForSale === true\)/, 'product-and-variant visible availability gate');
requireSource(/data-product-primary-offer data-variant-id=/, 'machine-identifiable primary Shopify variant offer');
forbidSource(/CUSTOMIZABLE_PRODUCTS_BY_HANDLE|customizableProducts\.json/, 'legacy handle-list fulfillment classification');
forbidSource(/\bmpn\s*:/, 'SKU-inferred MPN schema');

if (/\bmpn\s*:/.test(productDetailSource)) {
  fail('ProductDetail still supplies an MPN without a dedicated verified MPN source');
}
if (!/const schemaOfferUrl = product && \/\^\\d\+\$\/\.test\(schemaVariantId\)/.test(productDetailSource)
  || !/\?variant=\$\{encodeURIComponent\(schemaVariantId\)\}/.test(productDetailSource)
  || !/offerUrl:\s*schemaOfferUrl/.test(productDetailSource)) {
  fail('ProductDetail does not preserve the exact Shopify variant URL in hydrated single-variant Offer schema');
}
if (!/collection=\{!isLoading && !error && sortedProducts\.length > 0/.test(readyToShipSource)) {
  fail('ReadyToShip must omit hydrated collection schemas for a confirmed empty result');
}
if (!/function getInitialData[\s\S]*?prerenderedFeaturedRank:\s*index \+ 1/.test(shopifyProductsHookSource)) {
  fail('useShopifyProducts must preserve the build-validated featured order during initial hydration');
}
for (const required of [
  /function getVariantAwareProductResponse/,
  /data-product-variant-cta="true"/,
  /data-product-primary-offer/,
  /Number\(offer\[1\]\) <= 0/,
  /if \(variantResponse\) return variantResponse/,
]) {
  if (!required.test(middlewareSource)) {
    fail(`middleware is missing exact-variant initial-offer evidence gate matching ${required}`);
  }
}

const collectionCardBlock = functionSourceBlock('generateCollectionProductHtml', 'generateCollectionStandardHtml');
if (/currencyCode\s*\|\|/.test(collectionCardBlock) || /availableForSale\s*!==\s*false/.test(collectionCardBlock)) {
  fail('collection-card HTML still defaults currency or infers availability from a non-false value');
}
if (!/isValidShopifyMoney\(priceMoney\)/.test(collectionCardBlock)
  || !/isExplicitlyOrderable\(p\)/.test(collectionCardBlock)
  || !/cannot appear in collection HTML without an explicit valid Shopify price and currency/.test(collectionCardBlock)) {
  fail('collection-card HTML does not require explicit valid Shopify money and strict positive availability');
}

const genericSevenCountryRoutes = [
  '/',
  '/lehengas',
  '/sarees',
  '/collections/manthrakodi-sarees',
  '/collections/customizable-indian-outfits',
  '/products',
  '/collections/bridal-lehengas',
  '/collections/sharara-suits',
  '/collections/gharara-suits',
  '/collections/anarkali-suits',
  '/collections/party-wear-lehengas',
  '/collections/wedding-sarees',
  '/collections/designer-sarees',
  '/faq',
  '/new-arrivals',
  '/indowestern',
  '/collections/diwali-outfits',
  '/collections/wedding-guest-outfits',
  '/collections/mehendi-outfits',
  '/collections/haldi-outfits',
  '/collections/eid-outfits',
];
for (const routePath of genericSevenCountryRoutes) {
  const block = routeSourceBlock(routePath);
  if (/U\.S\. (?:standard )?shipping|U\.S\. shipping information|for U\.S\. delivery|Ready-to-Ship[^<\n]*in the USA/i.test(block)) {
    fail(`${routePath} uses U.S.-only shipping copy despite serving seven destination countries`);
  }
}
requireSource(/Review destination-specific rates on the shipping page; checkout is the final source of truth/, 'neutral destination-specific product shipping copy');
forbidSource(/function inferIncludedPiecesFromTitle\b/, 'title-inferred included-piece claims');

const catalogFetchIndex = source.indexOf('const productMap = await fetchAllShopifyProducts();');
const catalogValidationIndex = source.indexOf(
  'for (const product of productMap.values()) getLiveProductPrerenderEvidence(product);',
  catalogFetchIndex,
);
const prerenderCleanupIndex = source.indexOf('fs.rmSync(prerenderDir, { recursive: true });', catalogValidationIndex);
if (!(catalogFetchIndex >= 0 && catalogValidationIndex > catalogFetchIndex && prerenderCleanupIndex > catalogValidationIndex)) {
  fail('complete live product evidence is not validated before prior prerender artifacts are removed');
}

if (!/requestedVariantId\s*=\s*searchParams\.get\('variant'\)/.test(productInfoSource)
  || !/edge\.node\.id\.endsWith\(`\/\$\{requestedVariantId\}`\)/.test(productInfoSource)
  || !/<div id="product-purchase"/.test(productInfoSource)
  || !/onClick=\{handleAddToCart\}/.test(productInfoSource)) {
  fail('ProductInfo does not connect exact variant URLs to the live Add to Bag purchase controls');
}

const sanitizerMatch = source.match(/\.replace\(\/the seven supported destination countries\/gi,\s*'([^']+)'\)/);
if (!sanitizerMatch || sanitizerMatch[1] !== `the ${ALL_DESTINATIONS}`) {
  fail('sanitizer does not expand “the seven supported destination countries” to all seven country names');
}

const lookbookBlock = routeSourceBlock('/lookbook');
if (/\b(?:luxurious|perfect(?:ly)?|curated)\b/i.test(lookbookBlock)) {
  fail('/lookbook prerender still contains unsupported luxury, perfection, or curation claims');
}
if (!/groups current LuxeMia listings by configured product tags/i.test(lookbookBlock)
  || !/a section label is a browsing theme, not proof/i.test(lookbookBlock)) {
  fail('/lookbook prerender does not disclose its tag-based grouping method and limits');
}

const styleQuizBlock = routeSourceBlock('/style-quiz');
if (/\b(?:perfect|personali[sz]ed|signature style)\b/i.test(styleQuizBlock)) {
  fail('/style-quiz prerender still promises perfect or personalized results');
}
if (!/applies automated rules to current LuxeMia products/i.test(styleQuizBlock)
  || !/not individualized styling, fit, cultural-suitability or event-date advice/i.test(styleQuizBlock)) {
  fail('/style-quiz prerender does not disclose its automated filtering method and limits');
}

requireSource(/loadTsModule\('src\/lib\/readyToShipEvidence\.ts'\)/, 'shared Ready-to-Ship evidence module loading');
requireSource(/filter\(\(product\) => hasExplicitReadyToShipEvidence\(product\)\)/, 'positive Ready-to-Ship catalog-evidence filter');
requireSource(/function isExplicitlyOrderable[\s\S]*?product\?\.availableForSale === true[\s\S]*?variants\.some\(\(variant\) => variant\?\.node\?\.availableForSale === true\)/, 'shared strict product-and-variant orderability gate');
requireSource(/category === 'ready-to-ship'[\s\S]*?\.filter\(isExplicitlyOrderable\)/, 'positive Ready-to-Ship strict orderability filter');
requireSource(/route\.category === 'ready-to-ship' && collectionProducts\.length === 0[\s\S]*?No current products met the explicit ready-to-ship evidence and available-variant requirements/, 'neutral empty Ready-to-Ship status branch');

const readyBlock = routeSourceBlock('/ready-to-ship');
const fulfillmentReadyBlock = routeSourceBlock('/shop-by-fulfillment/ready-to-ship');
const lehengasBlock = routeSourceBlock('/lehengas');
for (const [label, block] of [
  ['/ready-to-ship', readyBlock],
  ['/shop-by-fulfillment/ready-to-ship', fulfillmentReadyBlock],
  ['/lehengas', lehengasBlock],
]) {
  if (/Every purchasable|unless (?:the product is )?explicitly marked Made to Order|stocked non-custom products/i.test(block)) {
    fail(`${label} prerender still infers Ready-to-Ship status from the absence of Made-to-Order evidence`);
  }
}
if (!/supported tag or positive ships-within value/i.test(readyBlock)
  || !/Sale availability by itself is not evidence of stocked fulfillment/i.test(readyBlock)) {
  fail('/ready-to-ship prerender does not state its positive catalog-evidence rule');
}
if (!/supported ready-to-ship tag or positive ships-within value/i.test(fulfillmentReadyBlock)
  || !/Sale availability alone does not prove this fulfillment status/i.test(fulfillmentReadyBlock)) {
  fail('/shop-by-fulfillment/ready-to-ship prerender does not state its positive catalog-evidence rule');
}
if (!lehengasBlock.includes(ALL_DESTINATIONS) || !/Ready to Ship filter only for products with positive catalog evidence/i.test(lehengasBlock)) {
  fail('/lehengas prerender is not aligned with seven-country shipping and positive Ready-to-Ship evidence');
}

if (REQUIRE_BUILT) {
  if (!fs.existsSync(MANIFEST_PATH) || !fs.existsSync(PRODUCT_DIR)) {
    fail('built prerender manifest/product directory is missing');
  } else {
    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    } catch (error) {
      fail(`built prerender manifest is invalid JSON (${error.message})`);
    }
    if (manifest) {
      const productHandles = Array.isArray(manifest.productHandles) ? manifest.productHandles : [];
      const eligibleHandles = Array.isArray(manifest.eligibleLiveProductHandles) ? manifest.eligibleLiveProductHandles : [];
      const productRouteHandles = (manifest.routes || [])
        .filter((route) => route.startsWith('/product/'))
        .map((route) => route.slice('/product/'.length));
      const productFiles = fs.readdirSync(PRODUCT_DIR)
        .filter((file) => file.endsWith('.html'))
        .map((file) => file.slice(0, -'.html'.length));
      const expected = sortedUnique(eligibleHandles);
      if (expected.length === 0) fail('built manifest recorded an empty eligible live Shopify catalog');
      if (eligibleHandles.length !== expected.length) fail('eligible live product manifest contains duplicate handles');
      if (productHandles.length !== expected.length) fail('manifest product handles contain duplicates or omissions');
      if (productRouteHandles.length !== expected.length) fail('manifest product routes contain duplicates or omissions');
      if (productFiles.length !== expected.length) fail('emitted product HTML files contain duplicates or omissions');
      if (!sameSet(sortedUnique(productHandles), expected)) fail('manifest product handles do not equal eligible live Shopify handles');
      if (!sameSet(sortedUnique(productRouteHandles), expected)) fail('manifest product routes do not equal eligible live Shopify handles');
      if (!sameSet(sortedUnique(productFiles), expected)) fail('emitted product HTML files do not equal eligible live Shopify handles');
      if (manifest.catalogIntegrity?.exactProductSet !== true) fail('manifest does not attest its exact live product set');
      if (manifest.catalogIntegrity?.eligibleProductCount !== expected.length) fail('manifest eligible product count is inconsistent');
      for (const handle of expected) validateBuiltProduct(handle);
      validateBuiltReadyToShipCollection();
    }
  }
}

if (failures.length > 0) {
  console.error(`[product-prerender-integrity] FAILED (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `[product-prerender-integrity] OK — fail-closed live catalog, exact product-route parity, source-backed commerce facts, exact-variant purchase controls, seven-country visibility, evidence-only care, and canonical brand linkage verified${REQUIRE_BUILT ? ' in source and built HTML' : ' in source'}.`,
);
