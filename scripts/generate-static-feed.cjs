#!/usr/bin/env node
/**
 * Generate STATIC Google Merchant Center XML Product Feed at build time.
 *
 * WHY: Build a validated feed artifact that is available as a fallback and can be
 * compared with the live Shopify-backed Vercel feed during release verification.
 *
 * Feed URL: https://luxemia.shop/merchant-feed.xml
 * Live Shopify-backed route: https://luxemia.shop/api/merchant-feed
 *
 * Run: node scripts/generate-static-feed.cjs
 * Automatically run during: npm run build
 */

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

function loadTsModule(relativePath) {
  const result = esbuild.buildSync({
    entryPoints: [path.resolve(__dirname, '..', relativePath)],
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

const {
  getMerchantGoogleProductCategory,
  isExplicitStandaloneOutfitSetTitle,
} = loadTsModule('src/lib/merchantTaxonomy.ts');

const SITE_URL = 'https://luxemia.shop';
const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-10/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';
const MERCHANT_FEED_REFRESH_SOURCE = process.env.MERCHANT_FEED_REFRESH_SOURCE || '';
const IS_RELEASE_BUILD = ['1', 'true'].includes((process.env.CI || '').toLowerCase())
  || process.env.VERCEL === '1'
  || Boolean(process.env.VERCEL_ENV)
  || process.env.GITHUB_ACTIONS === 'true'
  || process.env.NETLIFY === 'true'
  || process.env.CF_PAGES === '1';
const MIN_EXPECTED_OFFER_COUNT = 4210;
const MIN_SIZE_COVERAGE_RATIO = 0.92;
const MIN_MATERIAL_COVERAGE_RATIO = 0.84;
const MAX_LOCAL_SNAPSHOT_AGE_DAYS = 7;

// Canonical brand name. Shopify vendor field can drift in casing
// (e.g. "Luxemia" vs "LuxeMia") which trips Google Merchant Center
// brand-consistency checks. Always emit this exact string.
const BRAND_NAME = 'LuxeMia';
const HIDDEN_BILLING_PRODUCT_HANDLES = new Set([
  'luxemia-tailoring-saree-finishing-add-ons',
]);

const ALL_PRODUCTS_QUERY = `
  query GetAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          description
          handle
          vendor
          productType
          tags
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 11) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                sku
                barcode
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                image {
                  url
                  altText
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

// ─── Helpers ────────────────────────────────────────────────────────────────

function escapeXml(str) {
  if (!str) return '';
  const validXmlText = Array.from(String(str)).filter((character) => {
    const codePoint = character.codePointAt(0) || 0;
    return codePoint === 0x09
      || codePoint === 0x0a
      || codePoint === 0x0d
      || (codePoint >= 0x20 && codePoint <= 0xd7ff)
      || (codePoint >= 0xe000 && codePoint <= 0xfffd)
      || (codePoint >= 0x10000 && codePoint <= 0x10ffff);
  }).join('');

  return validXmlText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function forceJpeg(url) {
  if (!url) return url;
  if (url.includes('cdn.shopify.com') || url.includes('myshopify.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('format', 'jpg');
      parsed.searchParams.set('width', '1500');
      return parsed.toString();
    } catch {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}format=jpg&width=1500`;
    }
  }
  if (url.includes('kesimg.b-cdn.net')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('format', 'jpg');
      return parsed.toString();
    } catch {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}format=jpg`;
    }
  }
  if (!url.match(/\.(jpg|jpeg|png|gif)(\?|$)/i) && !url.includes('format=')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}format=jpg`;
  }
  return url;
}

function getSizes(product) {
  const sizeOption = product.options?.find((option) =>
    isSizeOptionName(option?.name)
  );
  if (!sizeOption) return [];
  return sizeOption.values
    .filter(Boolean)
    .map((value) => value.toLowerCase() === 'free size' ? 'One Size' : value);
}

function getGender(productType, title) {
  const text = `${productType || ''} ${title || ''}`.toLowerCase();
  if (/\b(?:women|womens|women's|female)\b/.test(text)) return 'female';
  if (/\b(?:men|mens|men's|male|groom|sherwanis?|kurta pajama|nehru jackets?|jodhpuris?)\b/.test(text)) return 'male';
  return 'female';
}

// Always return the canonical brand string. Shopify's `vendor` field is
// merchant-supplied and can be empty or have wrong casing; normalize anything
// that looks like our own brand and fall back to BRAND_NAME otherwise.
function normalizeBrand(vendor) {
  const raw = (vendor || '').trim();
  if (!raw) return BRAND_NAME;
  if (/^luxemi(?:a|ashop)$/i.test(raw.replace(/[^a-z0-9]/gi, ''))) return BRAND_NAME;
  return raw;
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

function normalizeGtin(value) {
  const digits = (value || '').replace(/[\s-]/g, '');
  return isValidGtin(digits) ? digits : '';
}

function normalizeMpn(value) {
  return Array.from(value || '')
    .filter((character) => {
      const codePoint = character.codePointAt(0) || 0;
      return codePoint >= 0x20 && codePoint !== 0x7f;
    })
    .join('')
    .trim()
    .slice(0, 70);
}

/** Simple string hash for deterministic picking. */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

function sanitizeFeedTitle(text) {
  return text
    .replace(/\s*\|\s*Ready to Ship/gi, '')
    .replace(/ready[- ]to[- ]ship/gi, 'available online')
    .replace(/\b(?:buy|shop now)\b/gi, '')
    .replace(/\b(?:handcrafted|artisan[- ]made|authentic)\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/^[-–—|:;,\s]+|[-–—|:;,\s]+$/g, '')
    .trim();
}

const MERCHANT_TITLE_MAX_LENGTH = 150;
const NAVRATRI_PRIORITY_PRODUCT_LIMIT = 30;

function trimMerchantTitle(text, maxLength = MERCHANT_TITLE_MAX_LENGTH) {
  const clean = sanitizeFeedTitle(text);
  if (clean.length <= maxLength) return clean;
  const shortened = clean.slice(0, maxLength + 1).replace(/\s+\S*$/, '').trim();
  return shortened || clean.slice(0, maxLength).trim();
}

function merchantProductSearchText(product) {
  return [
    product.handle || '',
    product.title || '',
    product.productType || '',
    ...(product.tags || []),
  ].join(' ').toLowerCase();
}

function navratriPriorityScore(product) {
  const text = merchantProductSearchText(product);
  let score = 0;
  if (/\bnavratri\b/.test(text)) score += 12;
  if (/\bgarba\b/.test(text)) score += 8;
  if (/\bchaniya\b/.test(text)) score += 6;
  if (/\bdandiya\b/.test(text)) score += 4;
  if (/\bmirror\b/.test(text)) score += 2;
  if (/\b(?:lehenga|choli)\b/.test(text)) score += 1;
  return score;
}

function selectNavratriPriorityHandles(products) {
  const uniqueProducts = new Map();
  for (const product of products) {
    if (!product?.handle || uniqueProducts.has(product.handle)) continue;
    const score = navratriPriorityScore(product);
    if (score > 0) uniqueProducts.set(product.handle, { product, score });
  }

  return new Set(
    [...uniqueProducts.values()]
      .sort((a, b) => b.score - a.score || a.product.handle.localeCompare(b.product.handle))
      .slice(0, NAVRATRI_PRIORITY_PRODUCT_LIMIT)
      .map(({ product }) => product.handle)
  );
}

function buildMerchantBaseTitle(baseTitle, handle, navratriPriorityHandles) {
  let title = sanitizeFeedTitle(baseTitle);
  if (!navratriPriorityHandles.has(handle)) return trimMerchantTitle(title);

  const missingSeasonalTerms = [];
  if (!/\bnavratri\b/i.test(title)) missingSeasonalTerms.push('Navratri');
  if (!/\bgarba\b/i.test(title)) missingSeasonalTerms.push('Garba Outfit');
  if (missingSeasonalTerms.length > 0) {
    title = `${title} — ${missingSeasonalTerms.join(' ')}`;
  }
  return trimMerchantTitle(title);
}

function composeMerchantVariantTitle(baseTitle, variantLabel) {
  const cleanBase = sanitizeFeedTitle(baseTitle);
  const cleanVariant = sanitizeFeedTitle(variantLabel || '');
  if (!cleanVariant) return trimMerchantTitle(cleanBase);

  const separator = ' — ';
  const maximumBaseLength = Math.max(40, MERCHANT_TITLE_MAX_LENGTH - separator.length - cleanVariant.length);
  return `${trimMerchantTitle(cleanBase, maximumBaseLength)}${separator}${cleanVariant}`.slice(0, MERCHANT_TITLE_MAX_LENGTH).trim();
}

function getMerchantProductType(productType, title) {
  const typeText = (productType || '').toLowerCase();
  const titleText = (title || '').toLowerCase();
  const text = `${typeText} ${titleText}`;
  const root = 'Apparel & Accessories';

  if (/\b(?:jewelry|jewellery|necklaces?|chokers?|earrings?|bangles?|bracelets?|maang tikka|rings?)\b/.test(text)) {
    return `${root} > Jewelry > Indian Jewelry`;
  }
  if (/\bblouses?\b/.test(typeText)) {
    return `${root} > Clothing > Traditional & Ceremonial Clothing > Saree Blouses`;
  }
  if (isExplicitStandaloneOutfitSetTitle(title)) {
    return `${root} > Clothing > Outfit Sets`;
  }
  if (/\b(?:sarees?|saris?)\b/.test(text)) {
    return `${root} > Clothing > Traditional & Ceremonial Clothing > Sarees`;
  }
  if (/\b(?:lehengas?|lehngas?|chaniyas?|cholis?)\b/.test(text)) {
    return `${root} > Clothing > Traditional & Ceremonial Clothing > Lehengas & Chaniya Choli`;
  }
  if (/\b(?:sets?|suits?)\b/.test(typeText)
    || /\b(?:salwars?|kameez|shararas?|ghararas?|gararas?|palazzos?|plazzos?|churidars?|patialas?|co-?ords?|outfit sets?)\b/.test(text)
    || /\b(?:anarkalis?|capes?|kurtas?)\b[^.]{0,30}\b(?:sets?|suits?|with dupatta)\b/.test(text)
    || /\b(?:sets?|suits?)\b[^.]{0,30}\b(?:anarkalis?|capes?|kurtas?)\b/.test(text)) {
    return `${root} > Clothing > Outfit Sets`;
  }
  if (/\b(?:sherwanis?|men|mens|men's|menswear|kurta pajama|nehru jackets?|jodhpuris?)\b/.test(text)) {
    return `${root} > Clothing > Traditional & Ceremonial Clothing > Sherwanis & Men's Kurtas`;
  }
  if (/\b(?:salwars?|kameez|shararas?|ghararas?|anarkalis?|palazzos?|plazzos?|churidars?|patialas?|kurtis?)\b/.test(text)) {
    return `${root} > Clothing > Traditional & Ceremonial Clothing > Salwar Kameez & Suits`;
  }
  if (/\bblouses?\b/.test(text)) {
    return `${root} > Clothing > Traditional & Ceremonial Clothing > Saree Blouses`;
  }
  if (/\b(?:indo.?western|fusion|co-?ords?|jumpsuits?|cape sets?)\b/.test(text)) {
    return `${root} > Clothing > Indian Ethnic Wear > Indo-Western Clothing`;
  }
  return `${root} > Clothing > Indian Ethnic Wear`;
}

function sanitizeShippingAndBoilerplate(text) {
  return text
    .replace(/Free worldwide shipping to [^.]+?(?:arriving in |delivered in |within )?7-10 business days/gi, 'Shipping is available to United States addresses only. Current U.S. rates and services are shown at checkout')
    .replace(/Free worldwide shipping to [^.]+?via DHL\/USPS\/UPS/gi, 'Shipping is available to United States addresses only. Current U.S. rates and services are shown at checkout')
    .replace(/Ships within 1[–-]2 business days from the USA\.\s*Free shipping on orders over \$99\./gi, 'Free U.S. shipping at $135 and above. $12 flat below that. Tracking provided after dispatch.')
    .replace(/Shipping:\s*5-day express delivery to USA and Canada/gi, 'Shipping: Tracking provided after dispatch')
    .replace(/ready to ship Indian wear USA/gi, 'Indian ethnic wear online')
    .replace(/Free delivery over \$350,?\s*7-10 business days to USA, Canada, and Australia via [^.]+\./gi, 'Shipping is available to United States addresses only. Current U.S. rates and services are shown at checkout.')
    .replace(/Fast Worldwide Shipping - Free shipping on orders over \$350, delivered in 7-10 business days to USA, Canada, and Australia/gi, 'Shipping is available to United States addresses only. Current U.S. rates and services are shown at checkout')
    .replace(/Shipping: Free shipping on orders over \$350, delivered within 7-10 business days to USA, Canada, and Australia/gi, 'Shipping: available to United States addresses only, with current rates shown at checkout')
    .replace(/Shipping: Free delivery over \$350, 7-10 business days to USA, Canada, and Australia via premium courier services/gi, 'Shipping: available to United States addresses only, with current rates shown at checkout')
    .replace(/Free shipping on orders over \$350/gi, 'Current U.S. shipping shown at checkout')
    .replace(/free shipping on orders over \$350/gi, 'current U.S. shipping shown at checkout')
    .replace(/Shipping:\s*Free U\.S\. shipping over \$150;\s*delivered in 7-10 business days via DHL\/USPS\/UPS to the United States/gi, 'Shipping: Free U.S. shipping at $135 and above. $12 flat below that. Estimated delivery is 6-17 business days; tracking provided after dispatch')
    .replace(/delivered in 7-10 business days via DHL\/USPS\/UPS to the United States/gi, 'estimated delivery is 6-17 business days with tracking after dispatch')
    .replace(/7-10 business days to USA, Canada, and Australia/gi, 'tracking provided after dispatch to United States addresses')
    .replace(/USA, Canada, and Australia/gi, 'the United States')
    .replace(/worldwide shipping/gi, 'United States shipping only')
    .replace(/perfect blend of tradition and modernit[y]/gi, 'clear balance of traditional craft and ready-to-wear ease')
    .slice(0, 5000);
}

// Build a deterministic, GMC-friendly description (>=150 chars) from product
// attributes when Shopify's description is missing or too short. Avoids the
// previous fallback that produced ~110-char strings and triggered GMC
// "description too short" warnings on hundreds of items.
//
// GMC RECOMMENDATION FIX: Always include explicit "Color: X" in descriptions.
// Google Merchant Center flagged 193 products as needing color details in
// descriptions. Even when color appears in the title or g:color attribute,
// GMC wants it explicitly stated in the description text as well.
//
// GMC RECOMMENDATION FIX (Round 2): "Update descriptions for Salwar Suits —
// Add missing details to 194 products." For salwar suit types, we now generate
// rich multi-paragraph descriptions that include outfit components (kameez +
// bottom + dupatta), bottom style, work details, stitching options, and care.
function normalizeFeedDeliveryCopy(xml) {
  return xml.replace(
    /delivered in 7-10 business days via DHL\/USPS\/UPS to the United States/gi,
    'estimated delivery is 6-17 business days with tracking after dispatch'
  );
}

function normalizeFeedWhitespace(xml) {
  return `${xml.replace(/[ \t]+$/gm, '').trim()}\n`;
}

function decodeXml(text) {
  return (text || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function readItemTag(itemXml, tagName) {
  const match = itemXml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return decodeXml(match?.[1] || '').trim();
}

function readSizeOptionFromDescription(description) {
  const optionText = String(description || '').match(
    /\bSelected options:\s*(.+?)(?:\.\s+Review the product images\b|$)/i
  )?.[1];
  if (!optionText) return '';

  for (const detail of optionText.split(/\s*;\s*/)) {
    const separatorIndex = detail.indexOf(':');
    if (separatorIndex < 1) continue;
    const optionName = detail.slice(0, separatorIndex);
    const optionValue = detail.slice(separatorIndex + 1).trim();
    if (isSizeOptionName(optionName) && optionValue) return optionValue;
  }

  return '';
}

function readMaterialFromDescription(description) {
  return String(description || '').match(
    /(?:^|[.|])\s*Material:\s*(.+?)(?=\s*\||\.\s+|$)/i
  )?.[1]?.trim() || '';
}

function readProductHandleFromItem(itemXml) {
  const link = readItemTag(itemXml, 'g:link');
  try {
    return new URL(link).pathname.replace(/^\/product\//, '').replace(/\/+$/, '');
  } catch {
    return '';
  }
}

function getStructuredColorFromTags(tags) {
  for (const tag of tags || []) {
    const match = String(tag).match(/^colou?r\s*:\s*(.+)$/i);
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

function resolveProductColor(product, selectedOptions, variantLabel = '') {
  const colorSelection = (selectedOptions || []).find((option) =>
    ['color', 'colour'].includes(option.name?.toLowerCase())
  );
  if (colorSelection?.value) return colorSelection.value.trim();

  const colorOption = product.options?.find((option) =>
    ['color', 'colour'].includes(option.name?.toLowerCase())
  );
  if (colorOption?.values?.length === 1 && colorOption.values[0]) {
    return colorOption.values[0].trim();
  }

  const taggedColor = getStructuredColorFromTags(product.tags);
  if (taggedColor) return taggedColor;

  return inferColorFromText(`${product.title || ''} ${variantLabel}`);
}

function sanitizeExistingFeedXml(xml) {
  let itemCount = 0;

  const fallbackProducts = [...xml.matchAll(/<item>[\s\S]*?<\/item>/gi)].map(([itemXml]) => ({
    handle: readProductHandleFromItem(itemXml),
    title: readItemTag(itemXml, 'g:item_group_title') || readItemTag(itemXml, 'g:title'),
    productType: readItemTag(itemXml, 'g:custom_label_0') || readItemTag(itemXml, 'g:product_type'),
    tags: [],
  }));
  const navratriPriorityHandles = selectNavratriPriorityHandles(fallbackProducts);

  let sanitized = xml.replace(/<item>[\s\S]*?<\/item>/gi, (itemXml) => {
    itemCount += 1;
    const handle = readProductHandleFromItem(itemXml);
    const rawTitle = readItemTag(itemXml, 'g:title') || 'Indian ethnic wear';
    const rawGroupTitle = readItemTag(itemXml, 'g:item_group_title');
    const originalBaseTitle = rawGroupTitle || rawTitle.split(/\s+[—–]\s+/)[0] || rawTitle;
    const merchantBaseTitle = buildMerchantBaseTitle(originalBaseTitle, handle, navratriPriorityHandles);
    const variantLabel = rawGroupTitle && rawTitle.startsWith(rawGroupTitle)
      ? rawTitle.slice(rawGroupTitle.length).replace(/^\s*[—–-]\s*/, '')
      : rawTitle.match(/\s+[—–]\s+(.+)$/)?.[1]?.trim() || '';
    const title = composeMerchantVariantTitle(merchantBaseTitle, variantLabel);
    const rawProductType = readItemTag(itemXml, 'g:custom_label_0')
      || readItemTag(itemXml, 'g:product_type')
      || 'Ethnic Wear';
    const productType = getMerchantProductType(rawProductType, merchantBaseTitle);
    const existingColor = readItemTag(itemXml, 'g:color');
    const existingDescription = readItemTag(itemXml, 'g:description');
    const inferredColor = inferColorFromText(originalBaseTitle);
    const color = containsExactPhrase(rawTitle, existingColor)
      || containsExactPhrase(existingDescription, existingColor)
      ? existingColor
      : inferredColor || 'Multi-Color';
    const material = readItemTag(itemXml, 'g:material')
      || readMaterialFromDescription(existingDescription);
    const size = readItemTag(itemXml, 'g:size')
      || readSizeOptionFromDescription(existingDescription);
    const pattern = readItemTag(itemXml, 'g:pattern');
    const fallbackProduct = {
      title,
      productType: rawProductType,
      tags: pattern ? [`work:${pattern}`] : [],
    };
    const description = buildDescription(
      fallbackProduct,
      color,
      material,
      productType,
      title,
      size ? [{ name: 'Size', value: size }] : [],
    );
    const googleProductCategory = getMerchantGoogleProductCategory(rawProductType, merchantBaseTitle);
    const gender = getGender(rawProductType, merchantBaseTitle);
    const highlights = generateProductHighlights(fallbackProduct, color, material, productType, title, size);

    let item = itemXml
      .replace(/<g:title>[\s\S]*?<\/g:title>/i, `<g:title>${escapeXml(title)}</g:title>`)
      .replace(/<g:description>[\s\S]*?<\/g:description>/i, `<g:description>${escapeXml(description)}</g:description>`)
      .replace(/<g:google_product_category>[\s\S]*?<\/g:google_product_category>/i, `<g:google_product_category>${googleProductCategory}</g:google_product_category>`)
      .replace(/<g:product_type>[\s\S]*?<\/g:product_type>/i, `<g:product_type>${escapeXml(productType)}</g:product_type>`)
      .replace(/<g:gender>[\s\S]*?<\/g:gender>/i, `<g:gender>${gender}</g:gender>`)
      .replace(/<g:color>[\s\S]*?<\/g:color>/i, `<g:color>${escapeXml(color)}</g:color>`)
      .replace(/\s*<g:product_highlight>[\s\S]*?<\/g:product_highlight>/gi, '')
      .replace(/\s*<g:custom_label_1>[\s\S]*?<\/g:custom_label_1>/gi, '')
      .replace(/\s*<g:sale_price_effective_date>[\s\S]*?<\/g:sale_price_effective_date>/gi, '')
      .replace(/\s*<g:returns>[\s\S]*?<\/g:returns>/gi, '');

    item = item.replace(
      /<g:(image_link|additional_image_link)>([\s\S]*?)<\/g:\1>/gi,
      (_match, tagName, imageUrl) => `<g:${tagName}>${escapeXml(forceJpeg(decodeXml(imageUrl).trim()))}</g:${tagName}>`
    );

    if (rawGroupTitle) {
      item = item.replace(
        /<g:item_group_title>[\s\S]*?<\/g:item_group_title>/i,
        `<g:item_group_title>${escapeXml(merchantBaseTitle)}</g:item_group_title>`
      );
    }

    if (navratriPriorityHandles.has(handle)) {
      item = item.replace(
        /\s*<g:custom_label_0>/i,
        '\n    <g:custom_label_1>navratri_2026_priority</g:custom_label_1>\n    <g:custom_label_0>'
      );
    }

    if (size && !/<g:size>/i.test(item)) {
      item = item.replace(
        /\s*<\/item>/i,
        `\n    <g:size>${escapeXml(size)}</g:size>\n    <g:size_type>regular</g:size_type>\n    <g:size_system>US</g:size_system>\n  </item>`
      );
    }

    if (material && !/<g:material>/i.test(item)) {
      item = item.replace(
        /\s*<\/item>/i,
        `\n    <g:material>${escapeXml(material)}</g:material>\n  </item>`
      );
    }

    if (/<g:gender>/i.test(item)) {
      item = item.replace(/\s*<g:gender>/i, `\n${highlights}\n    <g:gender>`);
    } else {
      item = item.replace(/\s*<\/item>/i, `\n${highlights}\n  </item>`);
    }
    return item;
  });

  if (itemCount === 0) {
    throw new Error('Fallback merchant feed contains no products');
  }

  console.log(`[merchant-feed] Prioritized ${navratriPriorityHandles.size} Navratri product groups for seasonal title relevance`);

  sanitized = sanitized
    .replace(
      /<description>[\s\S]*?<\/description>/i,
      '<description>Shop Indian ethnic wear online at LuxeMia with shipping to United States addresses only.</description>'
    )
    .replace(/<last_build_date>[\s\S]*?<\/last_build_date>/i, `<last_build_date>${new Date().toISOString()}</last_build_date>`);

  return normalizeFeedWhitespace(normalizeFeedDeliveryCopy(sanitized));
}

function getFeedSnapshotStats(xml) {
  const buildDateValue = xml.match(/<last_build_date>([^<]+)<\/last_build_date>/i)?.[1]?.trim() || '';
  return {
    offers: (xml.match(/<item>/gi) || []).length,
    sizes: (xml.match(/<g:size>/gi) || []).length,
    materials: (xml.match(/<g:material>/gi) || []).length,
    buildDateValue,
    buildDateMs: Date.parse(buildDateValue),
  };
}

function assertFeedSnapshotCoverage(xml, sourceLabel) {
  const stats = getFeedSnapshotStats(xml);
  const ageMs = Date.now() - stats.buildDateMs;
  const maxAgeMs = MAX_LOCAL_SNAPSHOT_AGE_DAYS * 24 * 60 * 60 * 1000;
  const failures = [];
  if (stats.offers < MIN_EXPECTED_OFFER_COUNT) failures.push(`${stats.offers} offers (minimum ${MIN_EXPECTED_OFFER_COUNT})`);
  if (stats.offers > 0 && stats.sizes / stats.offers < MIN_SIZE_COVERAGE_RATIO) {
    failures.push(`${stats.sizes}/${stats.offers} sized offers (minimum ${(MIN_SIZE_COVERAGE_RATIO * 100).toFixed(0)}%)`);
  }
  if (stats.offers > 0 && stats.materials / stats.offers < MIN_MATERIAL_COVERAGE_RATIO) {
    failures.push(`${stats.materials}/${stats.offers} material offers (minimum ${(MIN_MATERIAL_COVERAGE_RATIO * 100).toFixed(0)}%)`);
  }
  if (!Number.isFinite(stats.buildDateMs)) failures.push('missing or invalid last_build_date');
  if (Number.isFinite(stats.buildDateMs) && (ageMs < 0 || ageMs > maxAgeMs)) {
    failures.push(`last_build_date ${stats.buildDateValue} is outside the ${MAX_LOCAL_SNAPSHOT_AGE_DAYS}-day local fallback window`);
  }
  if (failures.length > 0) {
    throw new Error(`${sourceLabel} is not a release-safe merchant snapshot: ${failures.join('; ')}`);
  }
  return stats;
}

function copyValidatedFallbackFeed() {
  const existingFeed = path.resolve(__dirname, '../public/merchant-feed.xml');
  if (!fs.existsSync(existingFeed)) return false;

  const existingXml = fs.readFileSync(existingFeed, 'utf8');
  const stats = assertFeedSnapshotCoverage(existingXml, 'Checked-in public/merchant-feed.xml');
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, 'merchant-feed.xml'), existingXml, 'utf8');
  console.log(`[merchant-feed] Preserved validated local snapshot (${stats.offers} offers, ${stats.sizes} sizes, ${stats.materials} materials); public/ was not rewritten`);
  return true;
}

function refreshFeedFromExplicitSnapshot(sourcePath) {
  if (IS_RELEASE_BUILD) {
    throw new Error('MERCHANT_FEED_REFRESH_SOURCE is a local recovery workflow; release/CI builds require fresh Shopify API data');
  }
  const resolvedSource = path.resolve(sourcePath);
  if (!fs.existsSync(resolvedSource)) {
    throw new Error(`Merchant feed refresh source does not exist: ${resolvedSource}`);
  }
  console.log(`[merchant-feed] Rebuilding the checked-in feed from explicit source ${resolvedSource}`);
  const safeXml = sanitizeExistingFeedXml(fs.readFileSync(resolvedSource, 'utf8'));
  const stats = assertFeedSnapshotCoverage(safeXml, `Refreshed snapshot from ${resolvedSource}`);
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, 'merchant-feed.xml'), safeXml, 'utf8');
  fs.writeFileSync(path.resolve(__dirname, '../public/merchant-feed.xml'), safeXml, 'utf8');
  console.log(`[merchant-feed] Refreshed public/ and dist/ with ${stats.offers} offers, ${stats.sizes} sizes, and ${stats.materials} materials`);
}

function getStructuredTagValues(product, prefix) {
  const matcher = new RegExp(`^${prefix}\\s*:\\s*(.+)$`, 'i');
  return [...new Set((product.tags || [])
    .map((tag) => tag.match(matcher)?.[1]?.trim() || '')
    .filter(Boolean))];
}

function buildDescription(product, color, material, productType, displayTitle = '', selectedOptions = []) {
  // Merchant descriptions are rebuilt from structured catalog fields. Shopify
  // prose is intentionally excluded because old marketing and policy claims can
  // otherwise re-enter the feed long after the storefront copy is corrected.
  const title = sanitizeFeedTitle(displayTitle || product.title || 'Indian ethnic wear');
  const rawProductType = (product.productType || productType.split('>').at(-1) || 'Indian ethnic wear').trim();
  const structuredMaterial = material
    || getStructuredTagValues(product, 'material')[0]
    || getStructuredTagValues(product, 'fabric')[0]
    || '';
  const work = getStructuredTagValues(product, 'work')[0] || '';
  const includedPieces = getStructuredTagValues(product, 'included');
  const sizeSelection = getSizeOption(selectedOptions);
  const optionDetails = [...new Map((selectedOptions || [])
    .filter((option) => option?.name && option?.value)
    .filter((option) => normalizeOptionName(option.name) !== 'title' && normalizeOptionName(option.value) !== 'default title')
    .filter((option) => !['color', 'colour'].includes(normalizeOptionName(option.name)) && !isSizeOptionName(option.name))
    .map((option) => [normalizeOptionName(option.name), `${option.name}: ${option.value}`]))
    .values()];
  const parts = [];
  parts.push(`${title} from LuxeMia.`);

  const detailsParts = [];
  if (rawProductType) detailsParts.push(`Style: ${rawProductType}`);
  if (color) detailsParts.push(`Color: ${color}`);
  if (structuredMaterial) detailsParts.push(`Material: ${structuredMaterial}`);
  if (sizeSelection?.value) detailsParts.push(`Size: ${sizeSelection.value}`);
  if (work) detailsParts.push(`Design detail: ${work}`);
  if (detailsParts.length > 0) {
    parts.push(`${detailsParts.join(' | ')}.`);
  }
  if (includedPieces.length > 0) {
    parts.push(`Included pieces: ${includedPieces.join('; ')}.`);
  }
  if (optionDetails.length > 0) {
    parts.push(`Selected options: ${optionDetails.join('; ')}.`);
  }
  parts.push('Review the product images and available options for exact pieces, measurements, stitching status, price, and current availability before ordering.');
  parts.push('Shipping is available to United States addresses only. U.S. standard shipping is $12 below $135 and free at $135 and above. Tracking is provided after dispatch.');

  let out = parts.join(' ').trim();
  // Tight safety net: if attributes were sparse and we still landed under
  // 150 chars, append a closing line so GMC never sees a sub-150 description.
  if (out.length < 150) {
    out += ` Discover more Indian ethnic wear, sarees, lehengas and salwar suits at LuxeMia, with delivery to United States addresses only.`;
  }
  return sanitizeShippingAndBoilerplate(out);
}

// Shipping is intentionally managed at the Merchant Center account level so
// the $135 free-shipping threshold can be represented accurately. Item-level
// shipping entries would override that threshold and can make a $12 order look free.

function generateProductHighlights(product, color, material, productType, title, size) {
  const highlights = [];
  const safeTags = (product.tags || []).filter((tag) =>
    !/(?:ship|deliver|return|refund|free|worldwide|guarantee|authentic|artisan|handmade|headquarter|USA|United States|Canada|Australia|DHL|USPS|UPS|FedEx)/i.test(tag)
  );
  const source = [
    title,
    productType,
    ...safeTags,
  ].join(' ').toLowerCase();

  if (color) highlights.push(`Color: ${color}`);
  if (material) highlights.push(`Material: ${material}`);

  const workTypes = [
    { pattern: /chikankari/, label: 'Chikankari embroidery' },
    { pattern: /zardozi|zardosi/, label: 'Zardozi embroidery' },
    { pattern: /zari/, label: 'Zari work' },
    { pattern: /sequin/, label: 'Sequin work' },
    { pattern: /mirror/, label: 'Mirror work' },
    { pattern: /aari/, label: 'Aari work' },
    { pattern: /embroider/, label: 'Embroidery' },
    { pattern: /woven|weaving/, label: 'Woven detailing' },
    { pattern: /print/, label: 'Printed detailing' },
  ];
  const work = workTypes.find(({ pattern }) => pattern.test(source));
  if (work) highlights.push(`Features ${work.label.toLowerCase()}`);

  if (productType) highlights.push(`Product type: ${productType}`);
  if (size) highlights.push(`Size option: ${size}`);
  highlights.push('Shipping to United States addresses only; current rates are shown at checkout');

  return highlights.slice(0, 5).map((highlight) =>
    `    <g:product_highlight>${escapeXml(highlight.slice(0, 150))}</g:product_highlight>`
  ).join('\n');
}

// ─── Shopify API Fetch ──────────────────────────────────────────────────────

async function fetchAllProducts() {
  const allProducts = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const variables = { first: 250 };
    if (cursor) variables.after = cursor;

    console.log(`[merchant-feed] Fetching products page (cursor: ${cursor || 'start'})...`);

    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: ALL_PRODUCTS_QUERY, variables }),
    });

    if (!response.ok) {
      console.error(`[merchant-feed] Shopify API error: ${response.status} ${response.statusText}`);
      break;
    }

    const data = await response.json();
    const edges = data?.data?.products?.edges || [];
    allProducts.push(...edges.map(e => e.node));

    const pageInfo = data?.data?.products?.pageInfo;
    hasNextPage = pageInfo?.hasNextPage ?? false;
    cursor = pageInfo?.endCursor ?? null;
  }

  console.log(`[merchant-feed] Fetched ${allProducts.length} total products from Shopify`);
  return allProducts.filter((product) =>
    product.availableForSale !== false &&
    !HIDDEN_BILLING_PRODUCT_HANDLES.has(product.handle),
  );
}

// ─── XML Item Generation ────────────────────────────────────────────────────

// Merchant Center limits both id and item_group_id to 50 characters.
// Preserve every already-compliant ID so existing approved offers keep their
// history. Only long handle-based IDs fall back to stable Shopify numeric IDs.
function fitMerchantId(rawId, stableFallback) {
  if (rawId.length <= 50) return rawId;
  if (stableFallback && stableFallback.length <= 50) return stableFallback;

  const hash = Math.abs(hashCode(rawId)).toString(36);
  const prefixLength = Math.max(1, 49 - hash.length);
  return `${rawId.slice(0, prefixLength)}-${hash}`.slice(0, 50);
}

function generateProductItemXml(product, variant, titleCounts, navratriPriorityHandles) {
  const handle = product.handle;
  const variantId = variant.id?.split('/').pop() || '';
  const variants = product.variants.edges.map((edge) => edge.node);
  const isVariantGroup = variants.length > 1;
  const selectedOptions = variant.selectedOptions || [];
  const meaningfulOptions = selectedOptions.filter((option) =>
    option.name?.toLowerCase() !== 'title' &&
    option.value?.toLowerCase() !== 'default title'
  );
  const variantLabel = [...new Set(meaningfulOptions.map((option) => option.value).filter(Boolean))].join(' / ');

  const sizeSelection = getSizeOption(selectedOptions);
  const materialSelection = selectedOptions.find((option) =>
    ['fabric', 'material'].includes(option.name?.toLowerCase())
  );
  const materialOption = product.options?.find((option) =>
    ['fabric', 'material'].includes(option.name?.toLowerCase())
  );

  const color = resolveProductColor(product, selectedOptions, variantLabel);

  const structuredMaterial = getStructuredTagValues(product, 'material')[0]
    || getStructuredTagValues(product, 'fabric')[0]
    || '';
  const material = materialSelection?.value
    || (materialOption?.values?.length === 1 ? materialOption.values[0] : '')
    || structuredMaterial;
  const size = sizeSelection?.value || '';
  const link = `${SITE_URL}/product/${handle}${isVariantGroup && variantId ? `?variant=${encodeURIComponent(variantId)}` : ''}`;
  const primaryImage = variant.image?.url || product.images.edges[0]?.node.url;
  const imageUrl = primaryImage ? forceJpeg(primaryImage) : `${SITE_URL}/og-image.jpg`;
  const additionalImages = product.images.edges
    .map((edge) => edge.node.url)
    .filter((url) => url && url !== primaryImage)
    .slice(0, 10)
    .map(forceJpeg);

  const variantPrice = variant.price || product.priceRange.minVariantPrice;
  const price = parseFloat(variantPrice.amount);
  const currency = variantPrice.currencyCode;
  const compareAt = variant.compareAtPrice?.amount ? parseFloat(variant.compareAtPrice.amount) : 0;
  const hasDiscount = compareAt > price;
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Invalid price for variant ${variant.id}`);
  }
  const availability = variant.availableForSale === false ? 'out_of_stock' : 'in_stock';

  const rawProductType = product.productType || 'Ethnic Wear';
  const productType = getMerchantProductType(rawProductType, product.title);
  const googleProductCategory = getMerchantGoogleProductCategory(rawProductType, product.title);
  const gender = getGender(rawProductType, product.title);
  const rawSku = variant.sku || variantId || '';
  const sku = rawSku.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_-]/g, '');
  const brand = normalizeBrand(product.vendor);
  const gtin = normalizeGtin(variant.barcode);
  const mpn = brand === BRAND_NAME && !gtin ? normalizeMpn(variant.sku) : '';
  const identifiers = gtin
    ? `<g:gtin>${gtin}</g:gtin>`
    : mpn
      ? `<g:mpn>${escapeXml(mpn)}</g:mpn>`
      : '<g:identifier_exists>no</g:identifier_exists>';
  const patternTag = product.tags?.find((tag) =>
    /embroider|work|print|woven/i.test(tag)
  ) || '';

  const baseTitle = product.title || '';
  const merchantBaseTitle = buildMerchantBaseTitle(baseTitle, handle, navratriPriorityHandles);
  let displayTitle = merchantBaseTitle;
  if (variantLabel) {
    displayTitle = composeMerchantVariantTitle(merchantBaseTitle, variantLabel);
  } else if (titleCounts && titleCounts.get(baseTitle) > 1) {
    displayTitle = composeMerchantVariantTitle(merchantBaseTitle, sku || handle);
  }
  const description = buildDescription(
    product,
    color,
    material,
    productType,
    displayTitle,
    meaningfulOptions,
  );

  const productId = product.id?.split('/').pop() || '';
  const rawItemId = isVariantGroup ? `${handle}-${variantId}` : handle;
  const fallbackItemId = isVariantGroup
    ? `p${productId}-v${variantId}`
    : `p${productId}`;
  const itemId = fitMerchantId(rawItemId, fallbackItemId);
  const itemGroupId = fitMerchantId(handle, `p${productId}`);
  const groupFields = isVariantGroup
    ? `
    <g:item_group_id>${escapeXml(itemGroupId)}</g:item_group_id>
    <g:item_group_title>${escapeXml(merchantBaseTitle)}</g:item_group_title>`
    : '';

  return `
  <item>
    <g:id>${escapeXml(itemId)}</g:id>${groupFields}
    <g:title>${escapeXml(displayTitle)}</g:title>
    <g:description>${escapeXml(description)}</g:description>
    <g:link>${escapeXml(link)}</g:link>
    <g:image_link>${escapeXml(imageUrl)}</g:image_link>
    ${additionalImages.map((image) => `<g:additional_image_link>${escapeXml(image)}</g:additional_image_link>`).join('\n    ')}
    <g:availability>${availability}</g:availability>
    <g:price>${hasDiscount ? compareAt.toFixed(2) : price.toFixed(2)} ${currency}</g:price>
    ${hasDiscount ? `<g:sale_price>${price.toFixed(2)} ${currency}</g:sale_price>` : ''}
    <g:condition>new</g:condition>
    <g:brand>${escapeXml(brand)}</g:brand>
    <g:google_product_category>${googleProductCategory}</g:google_product_category>
    <g:product_type>${escapeXml(productType)}</g:product_type>
    ${generateProductHighlights(product, color, material, productType, displayTitle, size)}
    <g:gender>${gender}</g:gender>
    <g:age_group>adult</g:age_group>
    <g:color>${escapeXml(color || 'Multi-Color')}</g:color>
    ${material ? `<g:material>${escapeXml(material)}</g:material>` : ''}
    ${patternTag ? `<g:pattern>${escapeXml(patternTag)}</g:pattern>` : ''}
    ${size ? `<g:size>${escapeXml(size)}</g:size>` : ''}
    ${size ? '<g:size_type>regular</g:size_type>' : ''}
    ${size ? '<g:size_system>US</g:size_system>' : ''}
    ${identifiers}
    <g:custom_label_0>${escapeXml(rawProductType)}</g:custom_label_0>
    ${navratriPriorityHandles.has(handle) ? '<g:custom_label_1>navratri_2026_priority</g:custom_label_1>' : ''}
  </item>`;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('[merchant-feed] Generating static Google Merchant Center XML feed...');

  if (MERCHANT_FEED_REFRESH_SOURCE) {
    refreshFeedFromExplicitSnapshot(MERCHANT_FEED_REFRESH_SOURCE);
    return;
  }

  if (IS_RELEASE_BUILD && !SHOPIFY_STOREFRONT_TOKEN) {
    throw new Error('Release/CI merchant feed generation requires SHOPIFY_STOREFRONT_TOKEN; refusing to publish a fallback snapshot');
  }

  let products = [];
  if (SHOPIFY_STOREFRONT_TOKEN) {
    try {
      products = await fetchAllProducts();
    } catch (error) {
      console.error('[merchant-feed] Failed to fetch from Shopify API:', error);
    }
  } else {
    console.log('[merchant-feed] Storefront token is not available locally; validating and preserving the checked-in snapshot.');
  }

  if (products.length === 0) {
    if (IS_RELEASE_BUILD) {
      throw new Error('Shopify returned no usable products during a release/CI build; refusing to publish a fallback snapshot');
    }
    console.log('[merchant-feed] Shopify returned no usable products; validating the checked-in local snapshot without rewriting it.');
    if (copyValidatedFallbackFeed()) return;
    throw new Error('Shopify returned no products and no validated local snapshot is available');
  }

  // Pre-compute title occurrence counts so duplicates can be disambiguated
  // deterministically with a color + SKU-tail suffix in generateProductItemXml.
  const titleCounts = new Map();
  for (const p of products) {
    const t = p.title || '';
    titleCounts.set(t, (titleCounts.get(t) || 0) + 1);
  }

  const navratriPriorityHandles = selectNavratriPriorityHandles(products);
  console.log(`[merchant-feed] Prioritized ${navratriPriorityHandles.size} Navratri product groups for seasonal title relevance`);

  const itemsXml = products
    .flatMap((product) =>
      product.variants.edges.map((edge) =>
        generateProductItemXml(product, edge.node, titleCounts, navratriPriorityHandles)
      )
    )
    .join('\n');

  const rawFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>LuxeMia - Indian Ethnic Wear</title>
  <link>${SITE_URL}</link>
  <description>Shop Indian ethnic wear online at LuxeMia with shipping to United States addresses only.</description>
  <last_build_date>${new Date().toISOString()}</last_build_date>
${itemsXml}
</channel>
</rss>`;
  const feed = normalizeFeedWhitespace(normalizeFeedDeliveryCopy(rawFeed));

  // Write to dist/ directory (Vercel serves static files from dist/)
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  const distPath = path.join(distDir, 'merchant-feed.xml');
  fs.writeFileSync(distPath, feed, 'utf8');
  console.log(`[merchant-feed] Written feed to ${distPath} (${(feed.length / 1024).toFixed(1)} KB, ${products.length} products)`);

  console.log('[merchant-feed] Checked-in public/merchant-feed.xml was not changed; refresh it only with MERCHANT_FEED_REFRESH_SOURCE');
}

main().catch(err => {
  console.error('[merchant-feed] Fatal error:', err);
  process.exit(1);
});
