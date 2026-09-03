#!/usr/bin/env node

/**
 * Build LuxeMia's organic OpenAI product-search snapshot from the validated
 * Google Merchant XML produced immediately before this step.
 *
 * This script does not upload anything, create an Ads account, enable billing,
 * or make products eligible for Ads. Every record explicitly keeps checkout
 * and Ads disabled.
 *
 * Stable OpenAI file-upload docs:
 * https://developers.openai.com/commerce/specs/file-upload/overview
 * https://developers.openai.com/commerce/specs/file-upload/products
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MERCHANT_FEED_PATH = path.join(PROJECT_ROOT, 'dist', 'merchant-feed.xml');
const OPENAI_SEARCH_FEED_PATH = path.join(PROJECT_ROOT, 'dist', 'openai-search-products.jsonl.gz');
const MIN_EXPECTED_OFFER_COUNT = 1;
const MAX_SOURCE_FILE_AGE_MS = 30 * 60 * 1000;
const MAX_SOURCE_BUILD_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const FUTURE_CLOCK_TOLERANCE_MS = 5 * 60 * 1000;
const SELLER_NAME = 'LuxeMia';
const SELLER_URL = 'https://luxemia.shop';

// LuxeMia currently ships to US, CA, GB, AU, NZ, ZA, and MU. The Stable
// OpenAI file-upload schema currently lists only US as a supported value for
// target_countries, so this feed intentionally declares US only rather than
// publishing unsupported country codes. Expand this only when OpenAI's Stable
// schema officially supports the other six destinations.
const OPENAI_SUPPORTED_TARGET_COUNTRIES = Object.freeze(['US']);

const AVAILABILITY_MAP = Object.freeze({
  in_stock: 'in_stock',
});

function decodeXmlEntities(value) {
  return String(value || '')
    .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/i, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_match, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function normalizePlainText(value) {
  return decodeXmlEntities(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function readTag(xml, tagName) {
  const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(xml || '').match(
    new RegExp(`<${escapedTagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTagName}>`, 'i'),
  );
  return normalizePlainText(match?.[1] || '');
}

function readTags(xml, tagName) {
  const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...String(xml || '').matchAll(
    new RegExp(`<${escapedTagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTagName}>`, 'gi'),
  )].map((match) => normalizePlainText(match[1])).filter(Boolean);
}

function readMerchantItemBlocks(xml) {
  return [...String(xml || '').matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)]
    .map((match) => match[1]);
}

function parseMoney(value, fieldName, itemId) {
  const match = String(value || '').trim().match(/^(\d+(?:\.\d{1,4})?)\s+([A-Z]{3})$/);
  if (!match || Number(match[1]) <= 0) {
    throw new Error(`Merchant item ${itemId || '(unknown)'} has invalid ${fieldName}: ${value || '(missing)'}`);
  }
  return {
    amount: Number(match[1]),
    currency: match[2],
    formatted: `${match[1]} ${match[2]}`,
  };
}

function optionalBounded(value, maximumLength) {
  const normalized = normalizePlainText(value);
  return normalized && normalized.length <= maximumLength ? normalized : '';
}

function asHttpsUrl(value, fieldName, itemId) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Merchant item ${itemId || '(unknown)'} has invalid ${fieldName}: ${value || '(missing)'}`);
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new Error(`Merchant item ${itemId || '(unknown)'} requires a credential-free HTTPS ${fieldName}`);
  }
  return parsed.toString();
}

function buildVariantDictionary(itemXml) {
  const entries = [
    ['color', readTag(itemXml, 'g:color')],
    ['size', readTag(itemXml, 'g:size')],
    ['material', readTag(itemXml, 'g:material')],
    ['age_group', readTag(itemXml, 'g:age_group')],
    ['gender', readTag(itemXml, 'g:gender')],
    ['pattern', readTag(itemXml, 'g:pattern')],
    ['size_type', readTag(itemXml, 'g:size_type')],
  ].filter(([, value]) => Boolean(value));
  return Object.fromEntries(entries);
}

function merchantItemToOpenAIRecord(itemXml, groupCounts = new Map()) {
  const itemId = readTag(itemXml, 'g:id');
  const title = readTag(itemXml, 'g:title');
  const description = readTag(itemXml, 'g:description');
  const url = asHttpsUrl(readTag(itemXml, 'g:link'), 'url', itemId);
  const imageUrl = asHttpsUrl(readTag(itemXml, 'g:image_link'), 'image_url', itemId);
  const regularPrice = parseMoney(readTag(itemXml, 'g:price'), 'price', itemId);
  const salePriceValue = readTag(itemXml, 'g:sale_price');
  const salePrice = salePriceValue ? parseMoney(salePriceValue, 'sale_price', itemId) : null;
  if (salePrice && (salePrice.currency !== regularPrice.currency || salePrice.amount >= regularPrice.amount)) {
    throw new Error(`Merchant item ${itemId} has a sale_price that is not lower than price in the same currency`);
  }

  const rawAvailability = readTag(itemXml, 'g:availability').toLowerCase();
  const availability = AVAILABILITY_MAP[rawAvailability];
  if (!availability) {
    throw new Error(`Merchant item ${itemId} has unsupported availability: ${rawAvailability || '(missing)'}`);
  }
  const groupId = readTag(itemXml, 'g:item_group_id');
  const variantDictionary = buildVariantDictionary(itemXml);
  const additionalImageUrls = [...new Set(readTags(itemXml, 'g:additional_image_link'))]
    .filter((candidate) => candidate !== imageUrl)
    .map((candidate) => asHttpsUrl(candidate, 'additional_image_urls', itemId));
  const gtin = readTag(itemXml, 'g:gtin').replace(/[\s-]/g, '');
  const mpn = optionalBounded(readTag(itemXml, 'g:mpn'), 70);
  const color = optionalBounded(readTag(itemXml, 'g:color'), 40);
  // Some catalog size labels include tailoring notes longer than the Stable
  // field's 20-character limit. Preserve the complete label in variant_dict
  // and omit only the overlong top-level convenience field.
  const size = optionalBounded(readTag(itemXml, 'g:size'), 20);
  const material = optionalBounded(readTag(itemXml, 'g:material'), 100);
  const productCategory = readTag(itemXml, 'g:product_type')
    || readTag(itemXml, 'g:google_product_category');
  const condition = readTag(itemXml, 'g:condition').toLowerCase();
  if (condition && !new Set(['new', 'refurbished', 'used']).has(condition)) {
    throw new Error(`Merchant item ${itemId} has unsupported explicit condition: ${condition}`);
  }

  const record = {
    is_eligible_search: true,
    is_eligible_checkout: false,
    is_ads_eligible: false,
    item_id: itemId,
    title,
    description,
    url,
    brand: readTag(itemXml, 'g:brand'),
    image_url: imageUrl,
    price: regularPrice.formatted,
    availability,
    seller_name: SELLER_NAME,
    seller_url: SELLER_URL,
    target_countries: [...OPENAI_SUPPORTED_TARGET_COUNTRIES],
  };

  // Stable OpenAI schema defines this field as one comma-separated string,
  // even when the JSONL transport is used.
  if (additionalImageUrls.length > 0) record.additional_image_urls = additionalImageUrls.join(',');
  if (salePrice) record.sale_price = salePrice.formatted;
  if (condition) record.condition = condition;
  if (productCategory) record.product_category = productCategory;
  if (/^\d{8,14}$/.test(gtin)) record.gtin = gtin;
  if (mpn) record.mpn = mpn;
  if (material) record.material = material;

  const ageGroup = readTag(itemXml, 'g:age_group').toLowerCase();
  if (ageGroup) record.age_group = ageGroup;

  if (groupId) {
    record.group_id = groupId;
    record.listing_has_variations = (groupCounts.get(groupId) || 0) > 1;
    const itemGroupTitle = optionalBounded(readTag(itemXml, 'g:item_group_title'), 150);
    if (itemGroupTitle) record.item_group_title = itemGroupTitle;
    if (record.listing_has_variations && Object.keys(variantDictionary).length > 0) {
      record.variant_dict = variantDictionary;
    }
  } else {
    record.group_id = itemId;
    record.listing_has_variations = false;
  }

  if (color) record.color = color;
  if (size) record.size = size;

  const sizeSystem = readTag(itemXml, 'g:size_system').toUpperCase();
  if (/^[A-Z]{2}$/.test(sizeSystem)) record.size_system = sizeSystem;

  const gender = readTag(itemXml, 'g:gender').toLowerCase();
  if (gender) record.gender = gender;

  return record;
}

function convertMerchantXml(xml) {
  const itemBlocks = readMerchantItemBlocks(xml);
  const groupCounts = new Map();
  for (const itemXml of itemBlocks) {
    const groupId = readTag(itemXml, 'g:item_group_id');
    if (groupId) groupCounts.set(groupId, (groupCounts.get(groupId) || 0) + 1);
  }
  return itemBlocks.map((itemXml) => merchantItemToOpenAIRecord(itemXml, groupCounts));
}

function assertFreshMerchantSource(sourcePath, xml, options = {}) {
  const now = options.now ?? Date.now();
  const minExpectedOfferCount = options.minExpectedOfferCount ?? MIN_EXPECTED_OFFER_COUNT;
  const maxSourceFileAgeMs = options.maxSourceFileAgeMs ?? MAX_SOURCE_FILE_AGE_MS;
  const maxSourceBuildAgeMs = options.maxSourceBuildAgeMs ?? MAX_SOURCE_BUILD_AGE_MS;
  const sourceStats = fs.statSync(sourcePath);
  const fileAgeMs = now - sourceStats.mtimeMs;
  if (fileAgeMs < -FUTURE_CLOCK_TOLERANCE_MS || fileAgeMs > maxSourceFileAgeMs) {
    throw new Error(
      `Merchant source must be freshly generated before this step; file age is ${Math.round(fileAgeMs / 1000)} seconds`,
    );
  }

  const buildDateValue = readTag(xml, 'last_build_date');
  const buildDateMs = Date.parse(buildDateValue);
  const buildAgeMs = now - buildDateMs;
  if (!Number.isFinite(buildDateMs)) {
    throw new Error('Merchant source is missing a valid last_build_date');
  }
  if (buildAgeMs < -FUTURE_CLOCK_TOLERANCE_MS || buildAgeMs > maxSourceBuildAgeMs) {
    throw new Error(`Merchant source last_build_date is outside the approved freshness window: ${buildDateValue}`);
  }

  const offerCount = readMerchantItemBlocks(xml).length;
  if (offerCount < minExpectedOfferCount) {
    throw new Error(`Merchant source has ${offerCount} offers; minimum is ${minExpectedOfferCount}`);
  }

  return { sourceStats, buildDateValue, buildDateMs, offerCount };
}

function writeRecordsGzip(records, outputPath) {
  const jsonl = `${records.map((record) => JSON.stringify(record)).join('\n')}\n`;
  const compressed = zlib.gzipSync(Buffer.from(jsonl, 'utf8'), {
    level: zlib.constants.Z_BEST_COMPRESSION,
  });
  const temporaryPath = `${outputPath}.tmp-${process.pid}`;
  try {
    fs.writeFileSync(temporaryPath, compressed);
    fs.renameSync(temporaryPath, outputPath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
}

function generateOpenAISearchFeed(options = {}) {
  const sourcePath = options.sourcePath || MERCHANT_FEED_PATH;
  const outputPath = options.outputPath || OPENAI_SEARCH_FEED_PATH;
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Fresh merchant feed not found: ${sourcePath}`);
  }

  const xml = fs.readFileSync(sourcePath, 'utf8');
  const freshness = assertFreshMerchantSource(sourcePath, xml, options);
  const records = convertMerchantXml(xml);
  if (records.length !== freshness.offerCount) {
    throw new Error(`Converted ${records.length} records from ${freshness.offerCount} merchant offers`);
  }

  const uniqueIds = new Set(records.map((record) => record.item_id));
  if (uniqueIds.size !== records.length) {
    throw new Error(`Merchant source contains ${records.length - uniqueIds.size} duplicate item IDs`);
  }

  writeRecordsGzip(records, outputPath);
  console.log(
    `[openai-search-feed] Wrote ${records.length} organic-search records to ${path.relative(PROJECT_ROOT, outputPath)}`,
  );
  console.log('[openai-search-feed] Eligibility: search=true, checkout=false, ads=false; Stable target_countries=US');
  return { records, ...freshness };
}

if (require.main === module) {
  generateOpenAISearchFeed();
}

module.exports = {
  FUTURE_CLOCK_TOLERANCE_MS,
  MAX_SOURCE_BUILD_AGE_MS,
  MAX_SOURCE_FILE_AGE_MS,
  MERCHANT_FEED_PATH,
  MIN_EXPECTED_OFFER_COUNT,
  OPENAI_SEARCH_FEED_PATH,
  OPENAI_SUPPORTED_TARGET_COUNTRIES,
  SELLER_NAME,
  SELLER_URL,
  assertFreshMerchantSource,
  convertMerchantXml,
  generateOpenAISearchFeed,
  merchantItemToOpenAIRecord,
  readMerchantItemBlocks,
  readTag,
  writeRecordsGzip,
};
