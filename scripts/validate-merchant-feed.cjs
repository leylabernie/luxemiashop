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
  for (const tag of ['g:id', 'g:title', 'g:description', 'g:link', 'g:image_link', 'g:availability', 'g:price', 'g:condition', 'g:brand']) {
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
  `[merchant-feed] Validated ${itemIds.length} unique products, ${groupIds.length} group IDs, required attributes, identifiers, product-specific HTTPS images, and current policy-safe descriptions/highlights`
);
