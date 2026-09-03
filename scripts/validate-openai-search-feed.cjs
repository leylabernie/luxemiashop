#!/usr/bin/env node

/**
 * Validate the stable, organic OpenAI Search product snapshot.
 *
 * No network calls, uploads, Ads setup, credentials, or billing are involved.
 */

const fs = require('fs');
const zlib = require('zlib');
const { TextDecoder } = require('util');
const {
  FUTURE_CLOCK_TOLERANCE_MS,
  MAX_SOURCE_FILE_AGE_MS,
  MERCHANT_FEED_PATH,
  MIN_EXPECTED_OFFER_COUNT,
  OPENAI_SEARCH_FEED_PATH,
  SELLER_NAME,
  assertFreshMerchantSource,
  convertMerchantXml,
} = require('./generate-openai-search-feed.cjs');

const REQUIRED_FIELDS = Object.freeze([
  'is_eligible_search',
  'is_eligible_checkout',
  'is_ads_eligible',
  'item_id',
  'title',
  'description',
  'url',
  'brand',
  'image_url',
  'price',
  'availability',
  'seller_name',
  'target_countries',
]);
const VALID_AVAILABILITY = new Set(['in_stock']);
const VALID_CONDITIONS = new Set(['new', 'refurbished', 'used']);
const VALID_AGE_GROUPS = new Set(['newborn', 'infant', 'toddler', 'kids', 'adult']);
const MONEY_PATTERN = /^(\d+(?:\.\d{1,4})?)\s+([A-Z]{3})$/;
const STALE_SHIPPING_PATTERN = /United States addresses only|U\.S\. standard shipping is \$12 below \$150|Free U\.S\. shipping at \$150/i;

function assertHttpsUrl(value, fieldName, itemId) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Record ${itemId} has invalid ${fieldName}: ${value}`);
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new Error(`Record ${itemId} requires a credential-free HTTPS ${fieldName}`);
  }
}

function assertBoundedString(record, fieldName, maximumLength, required = false) {
  const value = record[fieldName];
  if (value === undefined && !required) return;
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Record ${record.item_id || '(unknown)'} has invalid ${fieldName}`);
  }
  if (value.length > maximumLength) {
    throw new Error(`Record ${record.item_id} ${fieldName} exceeds ${maximumLength} characters`);
  }
  if (/[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error(`Record ${record.item_id} ${fieldName} contains control characters`);
  }
}

function parseValidatedMoney(value, fieldName, itemId) {
  const match = typeof value === 'string' ? value.match(MONEY_PATTERN) : null;
  if (!match || Number(match[1]) <= 0) {
    throw new Error(`Record ${itemId} has invalid ${fieldName}: ${value}`);
  }
  return { amount: Number(match[1]), currency: match[2] };
}

function validateRecord(record, index) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new Error(`Line ${index + 1} is not a JSON object`);
  }
  for (const fieldName of REQUIRED_FIELDS) {
    if (!(fieldName in record)) {
      throw new Error(`Line ${index + 1} is missing required field ${fieldName}`);
    }
  }

  if (record.is_eligible_search !== true) {
    throw new Error(`Record ${record.item_id} must set is_eligible_search=true`);
  }
  if (record.is_eligible_checkout !== false) {
    throw new Error(`Record ${record.item_id} must set is_eligible_checkout=false`);
  }
  if (record.is_ads_eligible !== false) {
    throw new Error(`Record ${record.item_id} must set is_ads_eligible=false`);
  }
  if (record.seller_name !== SELLER_NAME) {
    throw new Error(`Record ${record.item_id} seller_name must be ${SELLER_NAME}`);
  }
  if (
    !Array.isArray(record.target_countries)
    || record.target_countries.length !== 1
    || record.target_countries[0] !== 'US'
  ) {
    throw new Error(`Record ${record.item_id} target_countries must match the Stable OpenAI value ["US"]`);
  }

  assertBoundedString(record, 'item_id', 100, true);
  if (/\s/.test(record.item_id)) throw new Error(`Record ${record.item_id} item_id cannot contain whitespace`);
  assertBoundedString(record, 'title', 150, true);
  assertBoundedString(record, 'description', 5000, true);
  if (STALE_SHIPPING_PATTERN.test(record.description)) {
    throw new Error(`Record ${record.item_id} contains retired shipping terms`);
  }
  assertBoundedString(record, 'brand', 70, true);
  assertBoundedString(record, 'seller_name', 70, true);
  assertHttpsUrl(record.url, 'url', record.item_id);
  assertHttpsUrl(record.image_url, 'image_url', record.item_id);

  if (record.additional_image_urls !== undefined) {
    if (typeof record.additional_image_urls !== 'string' || !record.additional_image_urls.trim()) {
      throw new Error(`Record ${record.item_id} additional_image_urls must be a comma-separated string when present`);
    }
    const imageUrls = record.additional_image_urls.split(',').map((value) => value.trim()).filter(Boolean);
    const imageSet = new Set(imageUrls);
    if (imageSet.size !== imageUrls.length) {
      throw new Error(`Record ${record.item_id} has duplicate additional_image_urls`);
    }
    imageUrls.forEach((url) => assertHttpsUrl(url, 'additional_image_urls', record.item_id));
  }

  const regularPrice = parseValidatedMoney(record.price, 'price', record.item_id);
  if (record.sale_price !== undefined) {
    const salePrice = parseValidatedMoney(record.sale_price, 'sale_price', record.item_id);
    if (salePrice.currency !== regularPrice.currency || salePrice.amount >= regularPrice.amount) {
      throw new Error(`Record ${record.item_id} sale_price must be lower than price in the same currency`);
    }
  }

  if (!VALID_AVAILABILITY.has(record.availability)) {
    throw new Error(`Record ${record.item_id} has invalid availability ${record.availability}`);
  }
  if (record.condition !== undefined) {
    assertBoundedString(record, 'condition', 30);
    if (!VALID_CONDITIONS.has(record.condition)) {
      throw new Error(`Record ${record.item_id} has unsupported explicit condition ${record.condition}`);
    }
  }
  if (record.product_category !== undefined) assertBoundedString(record, 'product_category', 750);
  if (record.material !== undefined) assertBoundedString(record, 'material', 100);
  if (record.color !== undefined) assertBoundedString(record, 'color', 40);
  if (record.size !== undefined) assertBoundedString(record, 'size', 20);
  if (record.mpn !== undefined) assertBoundedString(record, 'mpn', 70);
  if (record.gtin !== undefined && !/^\d{8,14}$/.test(record.gtin)) {
    throw new Error(`Record ${record.item_id} has invalid gtin`);
  }
  if (record.age_group !== undefined && !VALID_AGE_GROUPS.has(record.age_group)) {
    throw new Error(`Record ${record.item_id} has invalid age_group ${record.age_group}`);
  }
  if (record.size_system !== undefined && !/^[A-Z]{2}$/.test(record.size_system)) {
    throw new Error(`Record ${record.item_id} has invalid size_system ${record.size_system}`);
  }

  if (typeof record.listing_has_variations !== 'boolean') {
    throw new Error(`Record ${record.item_id} requires boolean listing_has_variations`);
  }
  assertBoundedString(record, 'group_id', 100, true);
  if (record.variant_dict !== undefined) {
    if (!record.listing_has_variations || typeof record.variant_dict !== 'object' || Array.isArray(record.variant_dict)) {
      throw new Error(`Record ${record.item_id} has variant_dict without an evidenced grouped listing`);
    }
    const variantEntries = Object.entries(record.variant_dict);
    if (variantEntries.length === 0) {
      throw new Error(`Record ${record.item_id} variant_dict cannot be empty`);
    }
    for (const [key, value] of variantEntries) {
      if (!key || typeof value !== 'string' || !value.trim()) {
        throw new Error(`Record ${record.item_id} has an invalid variant_dict entry`);
      }
    }
  }

  for (const unsupportedAssertion of ['is_digital', 'accepts_returns', 'accepts_exchanges', 'return_policy']) {
    if (unsupportedAssertion in record) {
      throw new Error(`Record ${record.item_id} contains unsupported assertion ${unsupportedAssertion}`);
    }
  }
}

function readGzipJsonl(feedPath) {
  const compressed = fs.readFileSync(feedPath);
  if (compressed.length < 2 || compressed[0] !== 0x1f || compressed[1] !== 0x8b) {
    throw new Error('OpenAI Search feed is not a gzip file');
  }
  let decompressed;
  try {
    decompressed = zlib.gunzipSync(compressed);
  } catch (error) {
    throw new Error(`OpenAI Search feed cannot be decompressed: ${error.message}`);
  }

  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(decompressed);
  } catch (error) {
    throw new Error(`OpenAI Search feed is not valid UTF-8: ${error.message}`);
  }
  if (!text.endsWith('\n')) throw new Error('OpenAI Search JSONL must end with a newline');

  const lines = text.slice(0, -1).split('\n');
  if (lines.length === 0 || lines.some((line) => !line.trim())) {
    throw new Error('OpenAI Search JSONL contains an empty record');
  }
  return lines.map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`OpenAI Search JSONL line ${index + 1} is invalid JSON: ${error.message}`);
    }
  });
}

function validateRecords(records, expectedRecords, options = {}) {
  const minExpectedOfferCount = options.minExpectedOfferCount ?? MIN_EXPECTED_OFFER_COUNT;
  if (records.length < minExpectedOfferCount) {
    throw new Error(`OpenAI Search feed has ${records.length} records; minimum is ${minExpectedOfferCount}`);
  }
  if (records.length !== expectedRecords.length) {
    throw new Error(`OpenAI Search feed has ${records.length} records; merchant source has ${expectedRecords.length}`);
  }

  const itemIds = new Set();
  records.forEach((record, index) => {
    validateRecord(record, index);
    if (itemIds.has(record.item_id)) throw new Error(`Duplicate OpenAI Search item_id: ${record.item_id}`);
    itemIds.add(record.item_id);

    // Full snapshots should be a lossless, deterministic transformation of the
    // merchant snapshot rather than a separately maintained catalog.
    if (JSON.stringify(record) !== JSON.stringify(expectedRecords[index])) {
      throw new Error(`Record ${record.item_id} does not match freshly generated merchant source data`);
    }
  });
}

function validateOpenAISearchFeed(options = {}) {
  const sourcePath = options.sourcePath || MERCHANT_FEED_PATH;
  const feedPath = options.feedPath || OPENAI_SEARCH_FEED_PATH;
  const now = options.now ?? Date.now();
  if (!fs.existsSync(sourcePath)) throw new Error(`Merchant source not found: ${sourcePath}`);
  if (!fs.existsSync(feedPath)) throw new Error(`OpenAI Search feed not found: ${feedPath}`);

  const sourceXml = fs.readFileSync(sourcePath, 'utf8');
  const freshness = assertFreshMerchantSource(sourcePath, sourceXml, options);
  const feedStats = fs.statSync(feedPath);
  const feedAgeMs = now - feedStats.mtimeMs;
  if (feedAgeMs < -FUTURE_CLOCK_TOLERANCE_MS || feedAgeMs > (options.maxSourceFileAgeMs ?? MAX_SOURCE_FILE_AGE_MS)) {
    throw new Error(`OpenAI Search feed is not fresh; file age is ${Math.round(feedAgeMs / 1000)} seconds`);
  }
  if (feedStats.mtimeMs + 1000 < freshness.sourceStats.mtimeMs) {
    throw new Error('OpenAI Search feed is older than dist/merchant-feed.xml');
  }

  const expectedRecords = convertMerchantXml(sourceXml);
  const records = readGzipJsonl(feedPath);
  validateRecords(records, expectedRecords, options);

  console.log(
    `[openai-search-feed] Validated ${records.length} organic-search records (search=true, checkout=false, ads=false, target=US)`,
  );
  return { records, expectedRecords, ...freshness };
}

if (require.main === module) {
  validateOpenAISearchFeed();
}

module.exports = {
  readGzipJsonl,
  validateOpenAISearchFeed,
  validateRecord,
  validateRecords,
};
