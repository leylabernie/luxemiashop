#!/usr/bin/env node

/**
 * Validate the generated Merchant feed without inventing catalog coverage.
 * Missing optional attributes are valid; unsupported offers must be omitted by
 * the generator instead of completed with title inference or constant defaults.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const feedPath = path.join(PROJECT_ROOT, 'dist', 'merchant-feed.xml');
if (!fs.existsSync(feedPath)) throw new Error('Fresh deploy-time Merchant feed not found in dist/');

const xml = fs.readFileSync(feedPath, 'utf8');

function decodeXml(value) {
  return String(value || '')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function tagValues(block, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...block.matchAll(new RegExp(`<${escaped}>([\\s\\S]*?)<\\/${escaped}>`, 'gi'))]
    .map((match) => decodeXml(match[1]).trim());
}

function one(item, name, id, required = false) {
  const values = tagValues(item, name);
  if (values.length > 1 || (required && values.length !== 1) || values.some((value) => !value)) {
    throw new Error(`${id}: <${name}> must appear ${required ? 'exactly once' : 'at most once'} with a value`);
  }
  return values[0] || '';
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

const invalidXmlCharacter = Array.from(xml).find((character) => {
  const point = character.codePointAt(0) || 0;
  return !(point === 0x09 || point === 0x0a || point === 0x0d
    || (point >= 0x20 && point <= 0xd7ff)
    || (point >= 0xe000 && point <= 0xfffd)
    || (point >= 0x10000 && point <= 0x10ffff));
});
if (invalidXmlCharacter) {
  throw new Error(`Merchant feed contains invalid XML character U+${invalidXmlCharacter.codePointAt(0).toString(16).toUpperCase()}`);
}

const buildDate = tagValues(xml, 'last_build_date')[0] || '';
const buildTime = Date.parse(buildDate);
const age = Date.now() - buildTime;
if (!Number.isFinite(buildTime) || age < -5 * 60 * 1000 || age > 7 * 24 * 60 * 60 * 1000) {
  throw new Error(`Merchant feed last_build_date is missing or stale: ${buildDate || '(missing)'}`);
}

const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
if (items.length === 0) throw new Error('Merchant feed contains no Shopify-evidenced offers');

const seenIds = new Set();
const failures = [];
for (const item of items) {
  try {
    const id = one(item, 'g:id', '(unknown)', true);
    if (id.length > 50 || seenIds.has(id)) throw new Error(`${id}: duplicate or overlong offer ID`);
    seenIds.add(id);

    const groupId = one(item, 'g:item_group_id', id, true);
    const title = one(item, 'g:title', id, true);
    const description = one(item, 'g:description', id, true);
    const link = one(item, 'g:link', id, true);
    const image = one(item, 'g:image_link', id, true);
    const availability = one(item, 'g:availability', id, true);
    const price = one(item, 'g:price', id, true);
    const brand = one(item, 'g:brand', id, true);
    const condition = one(item, 'g:condition', id);
    const category = one(item, 'g:google_product_category', id);
    const gender = one(item, 'g:gender', id);
    const ageGroup = one(item, 'g:age_group', id);
    const sizeType = one(item, 'g:size_type', id);
    const sizeSystem = one(item, 'g:size_system', id);
    const gtin = one(item, 'g:gtin', id);

    if (groupId.length > 50) throw new Error(`${id}: overlong item group ID`);
    if (title.length > 150) throw new Error(`${id}: title exceeds 150 characters`);
    if (description.length > 5000) throw new Error(`${id}: description exceeds 5000 characters`);
    if (brand.length > 70) throw new Error(`${id}: brand exceeds 70 characters`);
    if (availability !== 'in_stock') throw new Error(`${id}: only explicitly available Shopify variants may be published`);
    if (!/^\d+(?:\.\d{1,2})? [A-Z]{3}$/.test(price) || Number(price.split(' ')[0]) <= 0) {
      throw new Error(`${id}: invalid positive variant price ${price}`);
    }
    if (condition && !new Set(['new', 'refurbished', 'used']).has(condition)) throw new Error(`${id}: invalid explicit condition ${condition}`);
    if (category && !/^\d+$/.test(category)) throw new Error(`${id}: non-numeric explicit taxonomy ID`);
    if (gender && !new Set(['male', 'female', 'unisex']).has(gender)) throw new Error(`${id}: invalid explicit gender`);
    if (ageGroup && !new Set(['newborn', 'infant', 'toddler', 'kids', 'adult']).has(ageGroup)) throw new Error(`${id}: invalid explicit age group`);
    if (sizeType && !new Set(['regular', 'petite', 'plus', 'tall', 'big', 'maternity']).has(sizeType)) throw new Error(`${id}: invalid explicit size type`);
    if (sizeSystem && !/^[A-Z]{2}$/.test(sizeSystem)) throw new Error(`${id}: invalid explicit size system`);
    if (gtin && !isValidGtin(gtin)) throw new Error(`${id}: invalid GTIN checksum`);
    if (/<g:(?:mpn|identifier_exists)>/i.test(item)) throw new Error(`${id}: inferred identifier attributes are forbidden`);

    const productUrl = new URL(link);
    if (productUrl.protocol !== 'https:' || productUrl.hostname !== 'luxemia.shop'
      || !/^\/product\/[a-z0-9][a-z0-9-]*$/i.test(productUrl.pathname)
      || !/^\d+$/.test(productUrl.searchParams.get('variant') || '')) {
      throw new Error(`${id}: link is not a canonical LuxeMia variant URL`);
    }

    const allImages = [image, ...tagValues(item, 'g:additional_image_link')];
    if (allImages.length > 11) throw new Error(`${id}: more than 10 additional images`);
    for (const rawImage of allImages) {
      const imageUrl = new URL(rawImage);
      if (imageUrl.protocol !== 'https:' || imageUrl.username || imageUrl.password
        || /(?:og-image|campaign|placeholder)/i.test(imageUrl.pathname)) {
        throw new Error(`${id}: non-product or invalid image ${rawImage}`);
      }
    }
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }
}

for (const forbidden of ['g:target_country', 'g:content_language', 'g:tax', 'g:shipping', 'g:returns', 'g:sale_price_effective_date']) {
  if (new RegExp(`<${forbidden}>`, 'i').test(xml)) failures.push(`account-managed <${forbidden}> is forbidden`);
}

if (failures.length > 0) throw new Error(`Merchant feed integrity failures: ${failures.slice(0, 20).join('; ')}`);

console.log(`[merchant-feed] Validated ${items.length} explicitly available Shopify offers`);
