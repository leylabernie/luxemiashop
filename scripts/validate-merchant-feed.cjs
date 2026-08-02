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
const itemIds = [...xml.matchAll(/<g:id>([^<]+)<\/g:id>/g)].map((match) => match[1]);
const groupIds = [...xml.matchAll(/<g:item_group_id>([^<]+)<\/g:item_group_id>/g)].map((match) => match[1]);

if (itemIds.length === 0) {
  throw new Error('Merchant feed contains no product IDs');
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

// Country, language, tax, and threshold-based shipping are configured at
// Merchant Center's data-source/account level. Item shipping would override
// the accurate "$12 below $150, free at $150+" account rule.
for (const accountManagedTag of ['g:target_country', 'g:content_language', 'g:tax', 'g:shipping']) {
  if (xml.includes(`<${accountManagedTag}>`)) {
    throw new Error(`Merchant feed contains account-managed attribute <${accountManagedTag}>`);
  }
}

const staleDeliveryPhrases = [
  'delivered in 7-10 business days via DHL/USPS/UPS to the United States',
];
const normalizedXml = xml.toLowerCase();
for (const stalePhrase of staleDeliveryPhrases) {
  if (normalizedXml.includes(stalePhrase.toLowerCase())) {
    throw new Error(`Merchant feed contains stale delivery promise: "${stalePhrase}"`);
  }
}

console.log(
  `[merchant-feed] Validated ${itemIds.length} unique product IDs and ${groupIds.length} group IDs; all are 50 characters or fewer`
);
