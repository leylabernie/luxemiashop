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
  `[merchant-feed] Validated ${itemIds.length} unique products, ${groupIds.length} group IDs, product-specific HTTPS images, and current policy-safe descriptions/highlights`
);
