#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

function decodeXmlEntities(value) {
  return value
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
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

const GOOGLE_PRODUCT_CATEGORY = Object.freeze({
  CLOTHING: '1604',
  SHIRTS_AND_TOPS: '212',
  SKIRTS: '1581',
  PANTS: '204',
  DRESSES: '2271',
  JUMPSUITS_AND_ROMPERS: '5250',
  OUTFIT_SETS: '7313',
  TRADITIONAL_AND_CEREMONIAL_CLOTHING: '5388',
  SARIS_AND_LEHENGAS: '8248',
  JEWELRY: '188',
  BRACELETS: '191',
  EARRINGS: '194',
  NECKLACES: '196',
  RINGS: '200',
  JEWELRY_SETS: '6463',
});

function expectedGoogleProductCategory(productType, title) {
  const typeText = (productType || '').toLowerCase();
  const titleText = (title || '').toLowerCase();
  const text = `${typeText} ${titleText}`;

  if (/\b(?:jewelry|jewellery|necklaces?|chokers?|earrings?|bangles?|bracelets?|maang tikka|rings?)\b/.test(text)) {
    if (/\b(?:sets?|combos?)\b/.test(text)) return GOOGLE_PRODUCT_CATEGORY.JEWELRY_SETS;
    if (/\b(?:necklaces?|chokers?)\b/.test(text)) return GOOGLE_PRODUCT_CATEGORY.NECKLACES;
    if (/\bearrings?\b/.test(text)) return GOOGLE_PRODUCT_CATEGORY.EARRINGS;
    if (/\b(?:bangles?|bracelets?)\b/.test(text)) return GOOGLE_PRODUCT_CATEGORY.BRACELETS;
    if (/\brings?\b/.test(text)) return GOOGLE_PRODUCT_CATEGORY.RINGS;
    return GOOGLE_PRODUCT_CATEGORY.JEWELRY;
  }
  if (/\bblouses?\b/.test(typeText)) return GOOGLE_PRODUCT_CATEGORY.SHIRTS_AND_TOPS;
  if (/\b(?:sarees?|saris?|lehengas?|lehngas?|chaniyas?|cholis?)\b/.test(text)) return GOOGLE_PRODUCT_CATEGORY.SARIS_AND_LEHENGAS;
  if (/\b(?:jumpsuits?|rompers?)\b/.test(text)) return GOOGLE_PRODUCT_CATEGORY.JUMPSUITS_AND_ROMPERS;
  if (/\b(?:sets?|suits?)\b/.test(typeText)
    || /\b(?:salwars?|kameez|shararas?|ghararas?|gararas?|palazzos?|plazzos?|churidars?|patialas?|co-?ords?|outfit sets?)\b/.test(text)
    || /\b(?:anarkalis?|capes?|kurtas?)\b[^.]{0,30}\b(?:sets?|suits?|with dupatta)\b/.test(text)
    || /\b(?:sets?|suits?)\b[^.]{0,30}\b(?:anarkalis?|capes?|kurtas?)\b/.test(text)) {
    return GOOGLE_PRODUCT_CATEGORY.OUTFIT_SETS;
  }
  if (/\b(?:sherwanis?|nehru jackets?|jodhpuris?|groom wear|traditional|ceremonial|indo.?western|fusion|kurtas?)\b/.test(text)) {
    return GOOGLE_PRODUCT_CATEGORY.TRADITIONAL_AND_CEREMONIAL_CLOTHING;
  }
  if (/\b(?:anarkalis?|gowns?|dresses?)\b/.test(text)) return GOOGLE_PRODUCT_CATEGORY.DRESSES;
  if (/\b(?:kurtis?|blouses?|tops?)\b/.test(text)) return GOOGLE_PRODUCT_CATEGORY.SHIRTS_AND_TOPS;
  if (/\bskirts?\b/.test(text)) return GOOGLE_PRODUCT_CATEGORY.SKIRTS;
  if (/\b(?:pants|trousers)\b/.test(text)) return GOOGLE_PRODUCT_CATEGORY.PANTS;
  return GOOGLE_PRODUCT_CATEGORY.CLOTHING;
}

const taxonomyFixtures = [
  ['Designer Saree', 'Ready to Wear – Blouse Stitched', GOOGLE_PRODUCT_CATEGORY.SARIS_AND_LEHENGAS],
  ['Saree Blouse', 'Peacock Mirror Work Blouse', GOOGLE_PRODUCT_CATEGORY.SHIRTS_AND_TOPS],
  ['Bridal Lehengas', 'Express Tailoring Available', GOOGLE_PRODUCT_CATEGORY.SARIS_AND_LEHENGAS],
  ['Skirt Set', 'Embroidered Skirt Set', GOOGLE_PRODUCT_CATEGORY.OUTFIT_SETS],
  ['Three-Piece Set', 'Three-Piece Festive Set', GOOGLE_PRODUCT_CATEGORY.OUTFIT_SETS],
  ['Wedding Suit', 'Wedding Suit with Dupatta', GOOGLE_PRODUCT_CATEGORY.OUTFIT_SETS],
  ["Men's Kurta", 'Embroidered Festive Kurta', GOOGLE_PRODUCT_CATEGORY.TRADITIONAL_AND_CEREMONIAL_CLOTHING],
  ['Jewelry Sets', 'Necklace and Earring Combos', GOOGLE_PRODUCT_CATEGORY.JEWELRY_SETS],
];
const taxonomyFixtureFailures = taxonomyFixtures.filter(([productType, title, expected]) => (
  expectedGoogleProductCategory(productType, title) !== expected
));
if (taxonomyFixtureFailures.length > 0) {
  throw new Error(`Merchant taxonomy classifier failed ${taxonomyFixtureFailures.length} fixed precedence fixture(s)`);
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
const legacyCategoryIds = new Set(['193', '2104', '2195', '2197', '5424']);
const jewelryCategoryIds = new Set([
  GOOGLE_PRODUCT_CATEGORY.JEWELRY,
  GOOGLE_PRODUCT_CATEGORY.BRACELETS,
  GOOGLE_PRODUCT_CATEGORY.EARRINGS,
  GOOGLE_PRODUCT_CATEGORY.NECKLACES,
  GOOGLE_PRODUCT_CATEGORY.RINGS,
  GOOGLE_PRODUCT_CATEGORY.JEWELRY_SETS,
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
  const expected = expectedGoogleProductCategory(productType, title);
  if (actual !== expected) categoryFailures.push(`${id}: expected ${expected}, found ${actual || '(missing)'}`);
  if (legacyCategoryIds.has(actual)) categoryFailures.push(`${id}: forbidden legacy category ${actual}`);

  const merchantProductType = decodeXmlEntities(item.match(/<g:product_type>([\s\S]*?)<\/g:product_type>/i)?.[1] || '').trim();
  const hasJewelryHierarchy = />\s*Jewelry\s*>/i.test(merchantProductType);
  if (jewelryCategoryIds.has(actual) !== hasJewelryHierarchy) {
    productTypeCategoryFailures.push(`${id}: category ${actual || '(missing)'} conflicts with ${merchantProductType || '(missing product type)'}`);
  }

  const expectedHierarchyLeaf = {
    [GOOGLE_PRODUCT_CATEGORY.SHIRTS_AND_TOPS]: /Saree Blouses$/i,
    [GOOGLE_PRODUCT_CATEGORY.SARIS_AND_LEHENGAS]: /(?:Sarees|Lehengas & Chaniya Choli)$/i,
    [GOOGLE_PRODUCT_CATEGORY.OUTFIT_SETS]: /Outfit Sets$/i,
    [GOOGLE_PRODUCT_CATEGORY.TRADITIONAL_AND_CEREMONIAL_CLOTHING]: /(?:Sherwanis & Men's Kurtas|Indo-Western Clothing)$/i,
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
for (const item of itemBlocks) {
  const id = item.match(/<g:id>([^<]+)<\/g:id>/i)?.[1] || '(unknown id)';
  const image = item.match(/<g:image_link>([\s\S]*?)<\/g:image_link>/i)?.[1]?.trim() || '';
  const normalizedImage = image.replace(/&amp;/g, '&');
  const isHttpUrl = /^https:\/\//i.test(normalizedImage);
  const isGenericFallback = /luxemia\.shop\/(?:og-image\.jpg|images\/campaigns\/|placeholder(?:[-_.\/]|$))/i.test(normalizedImage);

  if (!isHttpUrl || isGenericFallback) {
    imageFailures.push(`${id}: ${image || '(missing)'}`);
  }
}
if (imageFailures.length > 0) {
  throw new Error(
    `Merchant feed contains ${imageFailures.length} offer(s) without a product-specific HTTPS image: ${imageFailures.slice(0, 10).join('; ')}`
  );
}

// Country, language, tax, and threshold-based shipping are configured at
// Merchant Center's data-source/account level. Item shipping would override
// the accurate "$12 below $150, free at $150+" account rule.
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

const staleClaimPatterns = [
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
