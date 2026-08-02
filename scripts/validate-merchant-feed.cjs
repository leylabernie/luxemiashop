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

for (const obsoleteTag of ['g:target_country', 'g:content_language', 'g:tax']) {
  if (xml.includes(`<${obsoleteTag}>`)) {
    throw new Error(`Merchant feed contains obsolete or source-level attribute <${obsoleteTag}>`);
  }
}

console.log(
  `[merchant-feed] Validated ${itemIds.length} unique product IDs and ${groupIds.length} group IDs; all are 50 characters or fewer`
);
