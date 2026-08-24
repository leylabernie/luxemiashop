#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const {
  containsExactPhrase,
  inferColorFromText,
} = require('../merchant-feed-color.cjs');
const {
  getSizeOption,
  isSizeOptionName,
  normalizeOptionName,
} = require('../merchant-feed-size.cjs');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function loadTsModule(relativePath) {
  const result = esbuild.buildSync({
    entryPoints: [path.join(PROJECT_ROOT, relativePath)],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    write: false,
    logLevel: 'silent',
  });
  const module = { exports: {} };
  const execute = new Function('module', 'exports', 'require', result.outputFiles[0].text);
  execute(module, module.exports, require);
  return module.exports;
}

const { inferProductSpecColors } = loadTsModule('src/lib/productSpecColor.ts');
const {
  isProductSizeOptionName: isStorefrontSizeOptionName,
  shouldRenderShopifyProductOption,
} = loadTsModule('src/lib/productOptionNames.ts');
const {
  MERCHANT_GOOGLE_PRODUCT_CATEGORY,
  getMerchantGoogleProductCategory,
} = loadTsModule('src/lib/merchantTaxonomy.ts');
const {
  forceJpegForGmc: forceSchemaJpegForGmc,
  getGoogleProductCategory: getSchemaGoogleProductCategory,
} = loadTsModule('src/lib/schema.ts');

const shopifySource = fs.readFileSync(path.join(PROJECT_ROOT, 'src/lib/shopify.ts'), 'utf8');
const prerenderSource = fs.readFileSync(path.join(PROJECT_ROOT, 'scripts/prerender.js'), 'utf8');
const schemaImageFixture = forceSchemaJpegForGmc('https://cdn.shopify.com/s/files/1/product.png?v=1');
const prerenderImageHelper = prerenderSource.match(/function forceJpegForGmc\(url\) \{[\s\S]*?\n\}/)?.[0] || '';
if (
  !/[?&]width=1500(?:&|$)/.test(schemaImageFixture)
  || !/[?&]format=jpg(?:&|$)/.test(schemaImageFixture)
  || !prerenderImageHelper.includes('width=1500')
  || prerenderImageHelper.includes('width=1200')
) {
  throw new Error('Product schema/prerender image normalization is not aligned with the 1500px JPEG merchant feed rule');
}
const queryVariantLimitFailures = [
  ['PRODUCT_BY_HANDLE_QUERY', shopifySource],
  ['COLLECTION_BY_HANDLE_QUERY', shopifySource],
  ['ALL_PRODUCTS_QUERY', prerenderSource],
].filter(([queryName, source]) => {
  const queryMatch = source.match(new RegExp(`const ${queryName} = ` + '`([\\s\\S]*?)`;'));
  return !queryMatch || !/variants\(first:\s*100\)/.test(queryMatch[1]);
});
if (queryVariantLimitFailures.length > 0) {
  throw new Error(`Storefront/prerender variant query cap regressed below 100: ${queryVariantLimitFailures.map(([name]) => name).join(', ')}`);
}

const candidates = [
  path.resolve(__dirname, '../dist/merchant-feed.xml'),
  path.resolve(__dirname, '../public/merchant-feed.xml'),
];
const feedPath = candidates.find((candidate) => fs.existsSync(candidate));

if (!feedPath) {
  throw new Error('Merchant feed not found in dist/ or public/');
}

const xml = fs.readFileSync(feedPath, 'utf8');

const invalidXmlCharacter = Array.from(xml).find((character) => {
  const codePoint = character.codePointAt(0) || 0;
  return !(
    codePoint === 0x09
    || codePoint === 0x0a
    || codePoint === 0x0d
    || (codePoint >= 0x20 && codePoint <= 0xd7ff)
    || (codePoint >= 0xe000 && codePoint <= 0xfffd)
    || (codePoint >= 0x10000 && codePoint <= 0x10ffff)
  );
});
if (invalidXmlCharacter) {
  throw new Error(`Merchant feed contains an invalid XML 1.0 character (U+${invalidXmlCharacter.codePointAt(0).toString(16).toUpperCase()})`);
}

const itemBlocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
const itemIds = [...xml.matchAll(/<g:id>([^<]+)<\/g:id>/g)].map((match) => match[1]);
const groupIds = [...xml.matchAll(/<g:item_group_id>([^<]+)<\/g:item_group_id>/g)].map((match) => match[1]);
const sizeAttributeCount = (xml.match(/<g:size>/gi) || []).length;
const materialAttributeCount = (xml.match(/<g:material>/gi) || []).length;
const feedBuildDateValue = xml.match(/<last_build_date>([^<]+)<\/last_build_date>/i)?.[1]?.trim() || '';
const feedBuildDateMs = Date.parse(feedBuildDateValue);
const feedAgeMs = Date.now() - feedBuildDateMs;
const maximumFeedAgeMs = 7 * 24 * 60 * 60 * 1000;
const coverageFailures = [];
// Allow small catalog churn while still rejecting the known degraded
// 4,208-offer / 3,178-size / 0-material no-token artifact.
if (itemBlocks.length < 4210) coverageFailures.push(`${itemBlocks.length} offers (minimum 4210)`);
if (itemBlocks.length > 0 && sizeAttributeCount / itemBlocks.length < 0.92) {
  coverageFailures.push(`${sizeAttributeCount}/${itemBlocks.length} sized offers (minimum 92%)`);
}
if (itemBlocks.length > 0 && materialAttributeCount / itemBlocks.length < 0.84) {
  coverageFailures.push(`${materialAttributeCount}/${itemBlocks.length} material offers (minimum 84%)`);
}
if (!Number.isFinite(feedBuildDateMs)) coverageFailures.push('missing or invalid last_build_date');
if (Number.isFinite(feedBuildDateMs) && (feedAgeMs < 0 || feedAgeMs > maximumFeedAgeMs)) {
  coverageFailures.push(`last_build_date ${feedBuildDateValue} is outside the 7-day validation window`);
}
if (coverageFailures.length > 0) {
  throw new Error(`Merchant feed freshness/coverage regression: ${coverageFailures.join('; ')}`);
}

function decodeXmlEntities(value) {
  return value
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

const sizeOptionFixtures = [
  ['Size', 'M', true],
  [' STANDARD SIZE ', 'XS', true],
  ['Blouse   Size', '40 in — Ready-Made', true],
  ['bUsT sIzE', '38', true],
  ['Chest Size', '42', true],
  ['Stitching Size', 'Custom', true],
  ['Sizing & Stitching', 'Unstitched / Semi-Stitched Fabric', false],
  ['Color', 'Red', false],
];
const sizeOptionFixtureFailures = sizeOptionFixtures.filter(([name, value, expected]) => {
  const options = [{ name, value }];
  return isSizeOptionName(name) !== expected
    || Boolean(getSizeOption(options)) !== expected;
});
if (sizeOptionFixtureFailures.length > 0 || normalizeOptionName(' Blouse   Size ') !== 'blouse size') {
  throw new Error(`Merchant size-option normalization failed ${sizeOptionFixtureFailures.length || 1} boundary fixture(s)`);
}

const storefrontNumericSizeFixtures = ['Bust Size', 'Chest Size', 'Blouse Size', 'Stitching Size'];
const numericOptionValues = ['34', '36', '38'];
const hiddenStorefrontSizeAliases = storefrontNumericSizeFixtures.filter((name) => (
  !isStorefrontSizeOptionName(name)
  || !shouldRenderShopifyProductOption(
    { name, values: numericOptionValues },
    { isStitchable: true },
  )
));
if (
  hiddenStorefrontSizeAliases.length > 0
  || shouldRenderShopifyProductOption(
    { name: 'Stitching Service', values: ['Semi-Stitched', 'Ready to Wear'] },
    { isStitchable: true },
  )
) {
  throw new Error(`Storefront numeric size selector failed alias fixtures: ${hiddenStorefrontSizeAliases.join(', ') || 'stitching-service control'}`);
}

const colorInferenceFixtures = [
  ['Powder Blue Chinon Silk Embroidered Palazzo Suit', 'Powder Blue'],
  ['Black Chinon Silk Embroidered Palazzo Suit', 'Black'],
  ['Teal Green Chinon Embroidered Palazzo Suit', 'Teal Green'],
  ['Red Embroidered Anarkali Suit', 'Red'],
  ['Madhuri Dixit-Inspired Rangoli Silk Sequin Saree', ''],
];
const colorInferenceFailures = colorInferenceFixtures.filter(([title, expected]) => (
  inferColorFromText(title) !== expected
));
if (colorInferenceFailures.length > 0) {
  throw new Error(`Merchant color inference failed ${colorInferenceFailures.length} boundary fixture(s)`);
}

const productSpecColorFixtures = [
  [['Powder Blue', 'Embroidered Palazzo Suit'], ['blue']],
  [['Madhuri Dixit-Inspired', 'Rangoli Silk'], []],
  [['Red Embroidered Anarkali Suit'], ['red']],
  [['infrared', 'redwood'], []],
  [['Hot Pink'], ['hot pink']],
  [['Sea Green'], ['sea green']],
  [['Royal Blue'], ['royal blue']],
];
const productSpecColorFailures = productSpecColorFixtures.filter(([tags, expected]) => (
  JSON.stringify(inferProductSpecColors(tags)) !== JSON.stringify(expected)
));
const productInfoSource = fs.readFileSync(
  path.join(PROJECT_ROOT, 'src/components/product/ProductInfo.tsx'),
  'utf8',
);
if (
  productSpecColorFailures.length > 0
  || !productInfoSource.includes('const foundColors = inferProductSpecColors(catalogTags);')
  || productInfoSource.includes('lowerTags.some(t => t.includes(c))')
) {
  throw new Error(`Storefront product-spec color inference failed ${productSpecColorFailures.length || 1} boundary fixture(s)`);
}
if (
  !productInfoSource.includes('.filter((option) => shouldRenderShopifyProductOption(option, {')
  || productInfoSource.includes('productHasNumericSizes && isProductSizeOptionName(option.name)')
) {
  throw new Error('ProductInfo must render Shopify numeric size variants through the selectedOptions-wired native option picker');
}

const VARIANT_PARITY_HANDLE = 'muslin-cotton-multi-color-navratri-wear-mirror-work-lehenga-choli-030';
const variantPrerenderPath = path.join(
  PROJECT_ROOT,
  'dist/_prerender/product',
  `${VARIANT_PARITY_HANDLE}.html`,
);
if (!fs.existsSync(variantPrerenderPath)) {
  throw new Error(`Missing variant-parity prerender fixture: ${variantPrerenderPath}`);
}

const variantPrerenderHtml = fs.readFileSync(variantPrerenderPath, 'utf8');
const initialProductMatch = variantPrerenderHtml.match(
  /window\.__INITIAL_PRODUCT_DATA__\s*=\s*([\s\S]*?);<\/script>/,
);
if (!initialProductMatch) {
  throw new Error(`Missing initial product payload for ${VARIANT_PARITY_HANDLE}`);
}
const initialProduct = JSON.parse(initialProductMatch[1]).product;
const storefrontVariantIds = (initialProduct?.variants?.edges || [])
  .map((edge) => edge?.node?.id?.split('/').pop())
  .filter(Boolean);
const feedVariantIds = itemBlocks
  .map((item) => decodeXmlEntities(item.match(/<g:link>([\s\S]*?)<\/g:link>/i)?.[1] || '').trim())
  .map((link) => {
    try {
      const url = new URL(link);
      return url.pathname === `/product/${VARIANT_PARITY_HANDLE}`
        ? url.searchParams.get('variant')
        : null;
    } catch {
      return null;
    }
  })
  .filter(Boolean);
const sortedIds = (ids) => [...new Set(ids)].sort();
if (
  feedVariantIds.length <= 20
  || JSON.stringify(sortedIds(storefrontVariantIds)) !== JSON.stringify(sortedIds(feedVariantIds))
) {
  throw new Error(
    `Variant parity failed for ${VARIANT_PARITY_HANDLE}: storefront/prerender ${storefrontVariantIds.length}, feed ${feedVariantIds.length}`,
  );
}

const productGroupSchema = [...variantPrerenderHtml.matchAll(
  /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
)]
  .map((match) => {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  })
  .find((schema) => schema?.['@type'] === 'ProductGroup');
if (!productGroupSchema) {
  throw new Error(`Missing ProductGroup schema for ${VARIANT_PARITY_HANDLE}`);
}
const schemaVariantIds = (productGroupSchema.hasVariant || [])
  .map((variant) => {
    try {
      return new URL(variant.url).searchParams.get('variant');
    } catch {
      return null;
    }
  })
  .filter(Boolean);
const expectedVariesBy = [
  ...((productGroupSchema.hasVariant || []).some((variant) => Boolean(variant.color)) ? ['https://schema.org/color'] : []),
  ...((productGroupSchema.hasVariant || []).some((variant) => Boolean(variant.size)) ? ['https://schema.org/size'] : []),
];
if (
  JSON.stringify(sortedIds(schemaVariantIds)) !== JSON.stringify(sortedIds(feedVariantIds))
  || JSON.stringify(productGroupSchema.variesBy || []) !== JSON.stringify(expectedVariesBy)
  || JSON.stringify(expectedVariesBy) !== JSON.stringify(['https://schema.org/size'])
) {
  throw new Error(`ProductGroup variant IDs/variesBy are not aligned for ${VARIANT_PARITY_HANDLE}`);
}

if (itemIds.length === 0) {
  throw new Error('Merchant feed contains no product IDs');
}
if (itemBlocks.length !== itemIds.length) {
  throw new Error(`Merchant feed has ${itemBlocks.length} item blocks for ${itemIds.length} product IDs`);
}

const longItemIds = itemIds.filter((id) => id.length > 50);
const longGroupIds = groupIds.filter((id) => id.length > 50);
const duplicateItemIds = itemIds.filter((id, index) => itemIds.indexOf(id) !== index);

if (longItemIds.length > 0) {
  throw new Error(`Merchant feed contains ${longItemIds.length} product IDs longer than 50 characters`);
}
if (longGroupIds.length > 0) {
  throw new Error(`Merchant feed contains ${longGroupIds.length} item group IDs longer than 50 characters`);
}
if (duplicateItemIds.length > 0) {
  throw new Error(`Merchant feed contains ${new Set(duplicateItemIds).size} duplicate product IDs`);
}

const merchantTitles = itemBlocks.map((item) => decodeXmlEntities(item.match(/<g:title>([\s\S]*?)<\/g:title>/i)?.[1] || '').trim());
const longMerchantTitles = merchantTitles.filter((title) => title.length > 150);
if (longMerchantTitles.length > 0) {
  throw new Error(`Merchant feed contains ${longMerchantTitles.length} title(s) longer than 150 characters`);
}

const productTypes = itemBlocks.map((item) => decodeXmlEntities(item.match(/<g:product_type>([\s\S]*?)<\/g:product_type>/i)?.[1] || '').trim());
const invalidProductTypes = productTypes.filter((productType) => {
  const levels = productType.split('>').map((level) => level.trim()).filter(Boolean);
  return levels.length < 3 || levels[0] !== 'Apparel & Accessories';
});
if (invalidProductTypes.length > 0) {
  throw new Error(`Merchant feed contains ${invalidProductTypes.length} product type(s) without the required Apparel & Accessories hierarchy`);
}

const taxonomyFixtures = [
  ['Designer Saree', 'Ready to Wear – Blouse Stitched', MERCHANT_GOOGLE_PRODUCT_CATEGORY.SARIS_AND_LEHENGAS],
  ['Saree Blouse', 'Peacock Mirror Work Blouse', MERCHANT_GOOGLE_PRODUCT_CATEGORY.SHIRTS_AND_TOPS],
  ['Bridal Lehengas', 'Express Tailoring Available', MERCHANT_GOOGLE_PRODUCT_CATEGORY.SARIS_AND_LEHENGAS],
  ['Skirt Set', 'Embroidered Skirt Set', MERCHANT_GOOGLE_PRODUCT_CATEGORY.OUTFIT_SETS],
  ['Three-Piece Set', 'Three-Piece Festive Set', MERCHANT_GOOGLE_PRODUCT_CATEGORY.OUTFIT_SETS],
  ['Wedding Suit', 'Wedding Suit with Dupatta', MERCHANT_GOOGLE_PRODUCT_CATEGORY.OUTFIT_SETS],
  ['Saree', 'Embroidered Three Piece Crepe Set', MERCHANT_GOOGLE_PRODUCT_CATEGORY.OUTFIT_SETS],
  ['Saree', 'Three Piece Saree Set', MERCHANT_GOOGLE_PRODUCT_CATEGORY.SARIS_AND_LEHENGAS],
  ["Men's Kurta", 'Embroidered Festive Kurta', MERCHANT_GOOGLE_PRODUCT_CATEGORY.TRADITIONAL_AND_CEREMONIAL_CLOTHING],
  ['Anarkali', 'Embroidered Anarkali Gown', MERCHANT_GOOGLE_PRODUCT_CATEGORY.TRADITIONAL_AND_CEREMONIAL_CLOTHING],
  ['Necklace', 'Kundan Necklace', MERCHANT_GOOGLE_PRODUCT_CATEGORY.NECKLACES],
  ['Jewelry Sets', 'Necklace and Earring Combos', MERCHANT_GOOGLE_PRODUCT_CATEGORY.JEWELRY_SETS],
];
const taxonomyFixtureFailures = taxonomyFixtures.filter(([productType, title, expected]) => (
  getMerchantGoogleProductCategory(productType, title) !== expected
  || getSchemaGoogleProductCategory(productType, title) !== expected
));
if (taxonomyFixtureFailures.length > 0) {
  throw new Error(`Merchant feed/schema taxonomy parity failed ${taxonomyFixtureFailures.length} fixed precedence fixture(s)`);
}

for (const relativePath of [
  'scripts/generate-static-feed.cjs',
  'api/merchant-feed.ts',
  'supabase/functions/merchant-feed/index.ts',
  'src/lib/schema.ts',
]) {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf8');
  if (!source.includes('getMerchantGoogleProductCategory')) {
    throw new Error(`${relativePath} does not use the shared merchant taxonomy classifier`);
  }
}

function expectedGender(productType, title) {
  const text = `${productType || ''} ${title || ''}`.toLowerCase();
  if (/\b(?:women|womens|women's|female)\b/.test(text)) return 'female';
  if (/\b(?:men|mens|men's|male|groom|sherwanis?|kurta pajama|nehru jackets?|jodhpuris?)\b/.test(text)) return 'male';
  return 'female';
}

const categoryFailures = [];
const productTypeCategoryFailures = [];
const genderFailures = [];
const legacyCategoryIds = new Set(['193', '2104', '2195', '2197', '2271', '5424']);
const jewelryCategoryIds = new Set([
  MERCHANT_GOOGLE_PRODUCT_CATEGORY.JEWELRY,
  MERCHANT_GOOGLE_PRODUCT_CATEGORY.BRACELETS,
  MERCHANT_GOOGLE_PRODUCT_CATEGORY.EARRINGS,
  MERCHANT_GOOGLE_PRODUCT_CATEGORY.NECKLACES,
  MERCHANT_GOOGLE_PRODUCT_CATEGORY.RINGS,
  MERCHANT_GOOGLE_PRODUCT_CATEGORY.JEWELRY_SETS,
]);
for (const item of itemBlocks) {
  const id = item.match(/<g:id>([^<]+)<\/g:id>/i)?.[1] || '(unknown id)';
  const title = decodeXmlEntities(
    item.match(/<g:item_group_title>([\s\S]*?)<\/g:item_group_title>/i)?.[1]
      || item.match(/<g:title>([\s\S]*?)<\/g:title>/i)?.[1]
      || ''
  ).trim();
  const productType = decodeXmlEntities(
    item.match(/<g:custom_label_0>([\s\S]*?)<\/g:custom_label_0>/i)?.[1]
      || item.match(/<g:product_type>([\s\S]*?)<\/g:product_type>/i)?.[1]
      || ''
  ).trim();
  const actual = item.match(/<g:google_product_category>([^<]+)<\/g:google_product_category>/i)?.[1]?.trim() || '';
  const expected = getMerchantGoogleProductCategory(productType, title);
  if (actual !== expected) categoryFailures.push(`${id}: expected ${expected}, found ${actual || '(missing)'}`);
  if (legacyCategoryIds.has(actual)) categoryFailures.push(`${id}: forbidden legacy category ${actual}`);

  const merchantProductType = decodeXmlEntities(item.match(/<g:product_type>([\s\S]*?)<\/g:product_type>/i)?.[1] || '').trim();
  const hasJewelryHierarchy = />\s*Jewelry\s*>/i.test(merchantProductType);
  if (jewelryCategoryIds.has(actual) !== hasJewelryHierarchy) {
    productTypeCategoryFailures.push(`${id}: category ${actual || '(missing)'} conflicts with ${merchantProductType || '(missing product type)'}`);
  }

  const expectedHierarchyLeaf = {
    [MERCHANT_GOOGLE_PRODUCT_CATEGORY.SHIRTS_AND_TOPS]: /Saree Blouses$/i,
    [MERCHANT_GOOGLE_PRODUCT_CATEGORY.SARIS_AND_LEHENGAS]: /(?:Sarees|Lehengas & Chaniya Choli)$/i,
    [MERCHANT_GOOGLE_PRODUCT_CATEGORY.OUTFIT_SETS]: /Outfit Sets$/i,
    [MERCHANT_GOOGLE_PRODUCT_CATEGORY.TRADITIONAL_AND_CEREMONIAL_CLOTHING]: /(?:Traditional & Ceremonial Clothing|Indo-Western Clothing)/i,
  }[actual];
  if (expectedHierarchyLeaf && !expectedHierarchyLeaf.test(merchantProductType)) {
    productTypeCategoryFailures.push(`${id}: category ${actual} has misaligned hierarchy ${merchantProductType || '(missing product type)'}`);
  }

  const actualGender = item.match(/<g:gender>([^<]+)<\/g:gender>/i)?.[1]?.trim() || '';
  const expectedItemGender = expectedGender(productType, title);
  if (actualGender !== expectedItemGender) {
    genderFailures.push(`${id}: expected ${expectedItemGender}, found ${actualGender || '(missing)'}`);
  }
}
if (categoryFailures.length > 0) {
  throw new Error(`Merchant feed has Google taxonomy failures: ${categoryFailures.slice(0, 10).join('; ')}`);
}
if (productTypeCategoryFailures.length > 0) {
  throw new Error(`Merchant feed has product-type/category alignment failures: ${productTypeCategoryFailures.slice(0, 10).join('; ')}`);
}
if (genderFailures.length > 0) {
  throw new Error(`Merchant feed has gender-classification failures: ${genderFailures.slice(0, 10).join('; ')}`);
}

const navratriPriorityItems = itemBlocks.filter((item) => /<g:custom_label_1>navratri_2026_priority<\/g:custom_label_1>/i.test(item));
const navratriPriorityHandles = new Set(navratriPriorityItems.map((item) => {
  const link = decodeXmlEntities(item.match(/<g:link>([\s\S]*?)<\/g:link>/i)?.[1] || '');
  try {
    return new URL(link).pathname.replace(/^\/product\//, '').replace(/\/+$/, '');
  } catch {
    return '';
  }
}).filter(Boolean));
if (navratriPriorityHandles.size !== 30) {
  throw new Error(`Merchant feed must contain exactly 30 Navratri priority product groups; found ${navratriPriorityHandles.size}`);
}
const weakNavratriPriorityTitles = navratriPriorityItems.filter((item) => {
  const title = decodeXmlEntities(item.match(/<g:title>([\s\S]*?)<\/g:title>/i)?.[1] || '');
  return !/\bnavratri\b/i.test(title) || !/\bgarba\b/i.test(title);
});
if (weakNavratriPriorityTitles.length > 0) {
  throw new Error(`Merchant feed contains ${weakNavratriPriorityTitles.length} Navratri priority title(s) missing Navratri or Garba relevance`);
}

function tagCount(item, tag) {
  return [...item.matchAll(new RegExp(`<${tag}>[\\s\\S]*?<\\/${tag}>`, 'gi'))].length;
}

function isValidGtin(value) {
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(value)) return false;
  const body = value.slice(0, -1);
  let sum = 0;
  let weight = 3;
  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * weight;
    weight = weight === 3 ? 1 : 3;
  }
  return (10 - (sum % 10)) % 10 === Number(value.at(-1));
}

const requiredTagFailures = [];
const identifierFailures = [];
for (const item of itemBlocks) {
  const id = item.match(/<g:id>([^<]+)<\/g:id>/i)?.[1] || '(unknown id)';
  for (const tag of ['g:id', 'g:title', 'g:description', 'g:link', 'g:image_link', 'g:availability', 'g:price', 'g:condition', 'g:brand', 'g:google_product_category']) {
    const count = tagCount(item, tag);
    if (count !== 1) requiredTagFailures.push(`${id}: <${tag}> appears ${count} time(s)`);
  }

  const availability = item.match(/<g:availability>([^<]+)<\/g:availability>/i)?.[1] || '';
  if (!['in_stock', 'out_of_stock', 'preorder', 'backorder'].includes(availability)) {
    requiredTagFailures.push(`${id}: invalid availability ${availability || '(missing)'}`);
  }

  const gtins = [...item.matchAll(/<g:gtin>([^<]+)<\/g:gtin>/gi)].map((match) => match[1].trim());
  const mpnCount = tagCount(item, 'g:mpn');
  const identifierExistsNo = /<g:identifier_exists>\s*no\s*<\/g:identifier_exists>/i.test(item);
  for (const gtin of gtins) {
    if (!isValidGtin(gtin)) identifierFailures.push(`${id}: invalid GTIN ${gtin}`);
  }
  if (identifierExistsNo && (gtins.length > 0 || mpnCount > 0)) {
    identifierFailures.push(`${id}: identifier_exists=no conflicts with GTIN/MPN`);
  }
  if (!identifierExistsNo && gtins.length === 0 && mpnCount === 0) {
    identifierFailures.push(`${id}: missing GTIN, MPN, or identifier_exists=no`);
  }
}
if (requiredTagFailures.length > 0) {
  throw new Error(`Merchant feed has required-attribute failures: ${requiredTagFailures.slice(0, 10).join('; ')}`);
}
if (identifierFailures.length > 0) {
  throw new Error(`Merchant feed has identifier failures: ${identifierFailures.slice(0, 10).join('; ')}`);
}

// Every offer must use a real product image. Generic storefront campaign or OG
// images can keep an otherwise incomplete Shopify product in the feed while
// showing shoppers the wrong item. Fail the deployment instead of publishing
// that mismatch to Merchant Center.
const imageFailures = [];
const imageAttributeFailures = [];
for (const item of itemBlocks) {
  const id = item.match(/<g:id>([^<]+)<\/g:id>/i)?.[1] || '(unknown id)';
  const image = item.match(/<g:image_link>([\s\S]*?)<\/g:image_link>/i)?.[1]?.trim() || '';
  const additionalImages = [...item.matchAll(/<g:additional_image_link>([\s\S]*?)<\/g:additional_image_link>/gi)]
    .map((match) => match[1].trim());
  if (additionalImages.length > 10) {
    imageAttributeFailures.push(`${id}: ${additionalImages.length} additional images exceeds 10`);
  }

  for (const rawImage of [image, ...additionalImages]) {
    const normalizedImage = decodeXmlEntities(rawImage);
    const isHttpUrl = /^https:\/\//i.test(normalizedImage);
    const isGenericFallback = /luxemia\.shop\/(?:og-image\.jpg|images\/campaigns\/|placeholder(?:[-_.\/]|$))/i.test(normalizedImage);

    if (!isHttpUrl || isGenericFallback) {
      imageFailures.push(`${id}: ${rawImage || '(missing)'}`);
      continue;
    }

    try {
      const parsedImage = new URL(normalizedImage);
      if (/^(?:cdn\.shopify\.com|[^.]+\.myshopify\.com)$/i.test(parsedImage.hostname)) {
        if (parsedImage.searchParams.get('width') !== '1500' || parsedImage.searchParams.get('format') !== 'jpg') {
          imageAttributeFailures.push(`${id}: Shopify image is not requested as 1500px JPEG`);
        }
      }
    } catch {
      imageFailures.push(`${id}: ${rawImage || '(missing)'}`);
    }
  }
}
if (imageFailures.length > 0) {
  throw new Error(
    `Merchant feed contains ${imageFailures.length} offer(s) without a product-specific HTTPS image: ${imageFailures.slice(0, 10).join('; ')}`
  );
}
if (imageAttributeFailures.length > 0) {
  throw new Error(
    `Merchant feed has image-attribute failures: ${imageAttributeFailures.slice(0, 10).join('; ')}`
  );
}

// Country, language, tax, and threshold-based shipping are configured at
// Merchant Center's data-source/account level. Item shipping would override
// the accurate "$12 below $135, free at $135+" account rule.
for (const accountManagedTag of ['g:target_country', 'g:content_language', 'g:tax', 'g:shipping']) {
  if (xml.includes(`<${accountManagedTag}>`)) {
    throw new Error(`Merchant feed contains account-managed attribute <${accountManagedTag}>`);
  }
}
if (/<g:returns>/i.test(xml)) {
  throw new Error('Merchant feed contains item-level returns that can conflict with the Merchant Center account policy');
}
if (/<g:sale_price_effective_date>/i.test(xml)) {
  throw new Error('Merchant feed contains a sale window without a catalog-backed promotion schedule');
}

const legacyDeliveryCopy = /delivered in 7-10 business days via DHL\/USPS\/UPS to the United States/i;
if (legacyDeliveryCopy.test(xml)) {
  throw new Error('Merchant feed contains outdated 7-10 business day delivery copy');
}

const descriptions = [...xml.matchAll(/<g:description>([\s\S]*?)<\/g:description>/gi)].map((match) => match[1]);
const highlights = [...xml.matchAll(/<g:product_highlight>([\s\S]*?)<\/g:product_highlight>/gi)].map((match) => match[1]);
if (descriptions.length !== itemIds.length) {
  throw new Error(`Merchant feed has ${descriptions.length} descriptions for ${itemIds.length} products`);
}

const shortDescriptions = descriptions.filter((description) => description.replace(/&[^;]+;/g, ' ').trim().length < 150);
if (shortDescriptions.length > 0) {
  throw new Error(`Merchant feed contains ${shortDescriptions.length} descriptions shorter than 150 characters`);
}

const descriptionAlignmentFailures = itemBlocks.filter((item) => {
  const title = decodeXmlEntities(item.match(/<g:title>([\s\S]*?)<\/g:title>/i)?.[1] || '').trim();
  const description = decodeXmlEntities(item.match(/<g:description>([\s\S]*?)<\/g:description>/i)?.[1] || '').trim();
  return !description.startsWith(`${title} from LuxeMia.`) || !description.includes('Style:');
});
if (descriptionAlignmentFailures.length > 0) {
  throw new Error(`Merchant feed contains ${descriptionAlignmentFailures.length} offer description(s) without matching variant title and structured style details`);
}

const colorAlignmentFailures = [];
const sizeAlignmentFailures = [];
const materialAlignmentFailures = [];
for (const item of itemBlocks) {
  const id = item.match(/<g:id>([^<]+)<\/g:id>/i)?.[1] || '(unknown id)';
  const title = decodeXmlEntities(item.match(/<g:title>([\s\S]*?)<\/g:title>/i)?.[1] || '').trim();
  const description = decodeXmlEntities(item.match(/<g:description>([\s\S]*?)<\/g:description>/i)?.[1] || '').trim();
  const color = decodeXmlEntities(item.match(/<g:color>([\s\S]*?)<\/g:color>/i)?.[1] || '').trim();
  const size = decodeXmlEntities(item.match(/<g:size>([\s\S]*?)<\/g:size>/i)?.[1] || '').trim();
  const material = decodeXmlEntities(item.match(/<g:material>([\s\S]*?)<\/g:material>/i)?.[1] || '').trim();

  if (color && color !== 'Multi-Color') {
    const exactTitleColor = containsExactPhrase(title, color);
    const inferredTitleColor = inferColorFromText(title);
    const embeddedSubstringOnly = title.toLowerCase().includes(color.toLowerCase()) && !exactTitleColor;
    if (
      !description.includes(`Color: ${color}`)
      || embeddedSubstringOnly
      || (inferredTitleColor && !exactTitleColor)
    ) {
      colorAlignmentFailures.push(`${id}: ${color} is not aligned with title/description`);
    }
  }
  if (size && !description.includes(`Size: ${size}`)) {
    sizeAlignmentFailures.push(`${id}: ${size} is not aligned with the description`);
  }
  const namedSize = description.match(
    /\b(?:Standard Size|Blouse Size):\s*(.+?)(?=;\s*[A-Za-z][^:;]*:|\.\s+Review the product images\b|$)/i
  )?.[1]?.trim();
  if (namedSize && size !== namedSize) {
    sizeAlignmentFailures.push(`${id}: named size ${namedSize} is missing from g:size`);
  }
  const describedMaterial = description.match(
    /(?:^|[.|])\s*Material:\s*(.+?)(?=\s*\||\.\s+|$)/i
  )?.[1]?.trim();
  if (describedMaterial && material !== describedMaterial) {
    materialAlignmentFailures.push(`${id}: described material ${describedMaterial} is missing from g:material`);
  } else if (material && !description.includes(`Material: ${material}`)) {
    materialAlignmentFailures.push(`${id}: g:material ${material} is not aligned with the description`);
  }
}
if (colorAlignmentFailures.length > 0) {
  throw new Error(`Merchant feed has color-alignment failures: ${colorAlignmentFailures.slice(0, 10).join('; ')}`);
}
if (sizeAlignmentFailures.length > 0) {
  throw new Error(`Merchant feed has size-alignment failures: ${sizeAlignmentFailures.slice(0, 10).join('; ')}`);
}
if (materialAlignmentFailures.length > 0) {
  throw new Error(`Merchant feed has material-alignment failures: ${materialAlignmentFailures.slice(0, 10).join('; ')}`);
}

const staleClaimPatterns = [
  /(?:shipping|delivery)[^<\n]{0,120}\$150|\$150[^<\n]{0,120}(?:shipping|delivery)/i,
  /(?:free shipping|free delivery)[^<]{0,80}\$350/i,
  /7[–-]10 business days/i,
  /15[ -]day return/i,
  /Philadelphia headquarters?/i,
  /authentic Indian ethnic wear/i,
  /highest standards?/i,
  /flatter(?:s|ing)? (?:all|every) bod(?:y|ies)/i,
  /guaranteed fit/i,
  /free worldwide shipping/i,
  /USA, Canada (?:&amp;|&|and) Australia/i,
  /ships? within 1[–-]2 business days from the USA/i,
  /5-day express delivery/i,
  /artisan[- ]made|handcrafted/i,
];
const generatedCopy = [...descriptions, ...highlights].join('\n');
for (const pattern of staleClaimPatterns) {
  if (pattern.test(generatedCopy)) {
    throw new Error(`Merchant feed contains blocked stale or unsupported copy matching ${pattern}`);
  }
}

console.log(
  `[merchant-feed] Validated ${itemIds.length} unique offers, ${groupIds.length} group IDs, 30 Navratri priority product groups, current Google taxonomy mappings, hierarchical product types, Merchant title limits, required attributes, identifiers, product-specific HTTPS images, and variant-aligned policy-safe descriptions/highlights`
);
