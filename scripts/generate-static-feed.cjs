#!/usr/bin/env node

/**
 * Generate the deploy-time Google Merchant XML from current Shopify evidence.
 *
 * Integrity rules:
 * - Shopify Storefront API is the only product source.
 * - An offer is emitted only when both Shopify availability flags are exactly
 *   true and the variant has a valid positive price and product-specific image.
 * - Optional facts are emitted only from selected options, single-valued
 *   Shopify options, or explicitly namespaced Shopify tags. Nothing is inferred
 *   from a title, description, product type, filename, or catalog position.
 */

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'dist', 'merchant-feed.xml');
const SITE_URL = 'https://luxemia.shop';
const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_API_VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION || '2025-10';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';
const SHOPIFY_URL = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const HIDDEN_PRODUCT_HANDLES = new Set([
  'luxemia-tailoring-saree-finishing-add-ons',
  'custom-order-balance-payment',
]);

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

const { buildVerifiedProductCopy, sanitizeProductTitle } = loadTsModule('src/lib/productDescriptionEnrichment.ts');
const { normalizeBrandName } = loadTsModule('src/lib/schema.ts');

const PRODUCTS_QUERY = `query MerchantProducts($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    pageInfo { hasNextPage endCursor }
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
        fabricMetafield: metafield(namespace: "custom", key: "fabric") { value }
        materialMetafield: metafield(namespace: "custom", key: "material") { value }
        colorMetafield: metafield(namespace: "custom", key: "color") { value }
        googleProductCategoryMetafield: metafield(namespace: "custom", key: "google_product_category") { value }
        genderMetafield: metafield(namespace: "custom", key: "gender") { value }
        conditionMetafield: metafield(namespace: "custom", key: "condition") { value }
        ageGroupMetafield: metafield(namespace: "custom", key: "age_group") { value }
        sizeTypeMetafield: metafield(namespace: "custom", key: "size_type") { value }
        sizeSystemMetafield: metafield(namespace: "custom", key: "size_system") { value }
        careInstructionsMetafield: metafield(namespace: "custom", key: "care_instructions") { value }
        includedComponentsMetafield: metafield(namespace: "custom", key: "included_components") { value }
        occasionMetafield: metafield(namespace: "custom", key: "occasion") { value }
        shipsWithinMetafield: metafield(namespace: "custom", key: "ships_within") { value }
        options { name values }
        images(first: 11) { edges { node { url } } }
        variants(first: 100) {
          edges {
            node {
              id
              availableForSale
              price { amount currencyCode }
              barcode
              sku
              selectedOptions { name value }
              image { url }
            }
          }
        }
      }
    }
  }
}`;

function cleanText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeXml(value) {
  return cleanText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function xmlTag(name, value) {
  const normalized = cleanText(value);
  return normalized ? `    <${name}>${escapeXml(normalized)}</${name}>` : '';
}

function normalizeOptionName(value) {
  return cleanText(value).toLowerCase();
}

function selectedOption(selectedOptions, names) {
  const allowed = new Set(names);
  return cleanText((selectedOptions || []).find((option) => (
    allowed.has(normalizeOptionName(option?.name))
  ))?.value);
}

function singleProductOption(product, names) {
  const allowed = new Set(names);
  const option = (product.options || []).find((candidate) => (
    allowed.has(normalizeOptionName(candidate?.name))
  ));
  const values = (option?.values || []).map(cleanText).filter(Boolean);
  return values.length === 1 ? values[0] : '';
}

function structuredTagValues(tags, prefixes) {
  const allowed = new Set(prefixes.map((prefix) => prefix.toLowerCase()));
  const values = [];
  for (const rawTag of tags || []) {
    const match = cleanText(rawTag).match(/^([a-z0-9_ -]+)\s*:\s*(.+)$/i);
    if (!match || !allowed.has(match[1].trim().toLowerCase())) continue;
    const value = cleanText(match[2]);
    if (value && !values.includes(value)) values.push(value);
  }
  return values;
}

function explicitValue(product, variant, optionNames, tagPrefixes = optionNames, metafieldNames = []) {
  return selectedOption(variant.selectedOptions, optionNames)
    || singleProductOption(product, optionNames)
    || metafieldNames.map((name) => cleanText(product[name]?.value)).find(Boolean)
    || structuredTagValues(product.tags, tagPrefixes)[0]
    || '';
}

function exactEnumValue(product, metafieldName, prefixes, allowedValues) {
  const value = (cleanText(product[metafieldName]?.value)
    || structuredTagValues(product.tags, prefixes)[0]
    || '').toLowerCase();
  return allowedValues.has(value) ? value : '';
}

function numericShopifyId(gid) {
  return cleanText(gid).match(/\/(\d+)$/)?.[1] || '';
}

function normalizedProductUrl(handle, variantId) {
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(handle) || !/^\d+$/.test(variantId)) return '';
  const url = new URL(`/product/${handle}`, SITE_URL);
  url.searchParams.set('variant', variantId);
  return url.toString();
}

function normalizedImageUrl(value) {
  try {
    const parsed = new URL(cleanText(value));
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return '';
    if (/(?:og-image|campaign|placeholder)/i.test(parsed.pathname)) return '';
    if (/^(?:cdn\.shopify\.com|[^.]+\.myshopify\.com)$/i.test(parsed.hostname)) {
      parsed.searchParams.set('width', '1500');
      parsed.searchParams.set('format', 'jpg');
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

function validMoney(price) {
  const amount = cleanText(price?.amount);
  const currency = cleanText(price?.currencyCode).toUpperCase();
  if (!/^\d+(?:\.\d{1,4})?$/.test(amount) || Number(amount) <= 0 || !/^[A-Z]{3}$/.test(currency)) {
    return null;
  }
  return { amount: Number(amount).toFixed(2), currency };
}

function validGtin(value) {
  const digits = cleanText(value).replace(/[\s-]/g, '');
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(digits)) return '';
  const body = digits.slice(0, -1);
  let sum = 0;
  let weight = 3;
  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * weight;
    weight = weight === 3 ? 1 : 3;
  }
  return (10 - (sum % 10)) % 10 === Number(digits.at(-1)) ? digits : '';
}

function buildItem(product, variant) {
  if (product.availableForSale !== true || variant.availableForSale !== true) return null;

  const productId = numericShopifyId(product.id);
  const variantId = numericShopifyId(variant.id);
  const title = cleanText(sanitizeProductTitle(product.title)).slice(0, 150);
  const description = cleanText(buildVerifiedProductCopy(product)).slice(0, 5000);
  const brand = cleanText(normalizeBrandName(product.vendor)).slice(0, 70);
  const handle = cleanText(product.handle);
  const price = validMoney(variant.price);
  const imageCandidates = [
    variant.image?.url,
    ...(product.images?.edges || []).map((edge) => edge?.node?.url),
  ].map(normalizedImageUrl).filter(Boolean);
  const images = [...new Set(imageCandidates)];
  const link = normalizedProductUrl(handle, variantId);

  // Required fields are never substituted. A missing canonical fact excludes
  // the offer and is reported in the build summary.
  if (!productId || !variantId || !title || !description || !brand || !price || !link || images.length === 0) {
    return null;
  }

  const color = explicitValue(product, variant, ['color', 'colour'], ['color', 'colour'], ['colorMetafield']);
  const material = explicitValue(product, variant, ['material', 'fabric'], ['material', 'fabric'], ['materialMetafield', 'fabricMetafield']);
  const size = explicitValue(
    product,
    variant,
    ['size', 'standard size', 'blouse size', 'bust size', 'chest size', 'stitching size'],
    ['size'],
  );
  const condition = exactEnumValue(product, 'conditionMetafield', ['condition'], new Set(['new', 'refurbished', 'used']));
  const gender = exactEnumValue(product, 'genderMetafield', ['gender'], new Set(['male', 'female', 'unisex']));
  const ageGroup = exactEnumValue(product, 'ageGroupMetafield', ['age_group', 'age group'], new Set(['newborn', 'infant', 'toddler', 'kids', 'adult']));
  const sizeType = exactEnumValue(product, 'sizeTypeMetafield', ['size_type', 'size type'], new Set(['regular', 'petite', 'plus', 'tall', 'big', 'maternity']));
  const sizeSystem = (cleanText(product.sizeSystemMetafield?.value)
    || structuredTagValues(product.tags, ['size_system', 'size system'])[0]
    || '').toUpperCase();
  const googleCategory = cleanText(product.googleProductCategoryMetafield?.value)
    || structuredTagValues(product.tags, ['google_product_category', 'google product category'])[0]
    || '';
  const pattern = structuredTagValues(product.tags, ['pattern'])[0] || '';
  const highlights = structuredTagValues(product.tags, ['highlight', 'product_highlight']).slice(0, 10);
  const productType = cleanText(product.productType).slice(0, 750);
  const gtin = validGtin(variant.barcode);

  const lines = [
    '  <item>',
    xmlTag('g:id', variantId),
    xmlTag('g:item_group_id', productId),
    xmlTag('g:title', title),
    xmlTag('g:description', description),
    xmlTag('g:link', link),
    xmlTag('g:image_link', images[0]),
    ...images.slice(1, 11).map((image) => xmlTag('g:additional_image_link', image)),
    xmlTag('g:availability', 'in_stock'),
    xmlTag('g:price', `${price.amount} ${price.currency}`),
    xmlTag('g:brand', brand),
    productType ? xmlTag('g:product_type', productType) : '',
    /^\d+$/.test(googleCategory) ? xmlTag('g:google_product_category', googleCategory) : '',
    condition ? xmlTag('g:condition', condition) : '',
    gender ? xmlTag('g:gender', gender) : '',
    ageGroup ? xmlTag('g:age_group', ageGroup) : '',
    color ? xmlTag('g:color', color) : '',
    material ? xmlTag('g:material', material) : '',
    pattern ? xmlTag('g:pattern', pattern) : '',
    size ? xmlTag('g:size', size) : '',
    sizeType ? xmlTag('g:size_type', sizeType) : '',
    /^[A-Z]{2}$/.test(sizeSystem) ? xmlTag('g:size_system', sizeSystem) : '',
    gtin ? xmlTag('g:gtin', gtin) : '',
    ...highlights.map((highlight) => xmlTag('g:product_highlight', highlight)),
    '  </item>',
  ].filter(Boolean);
  return lines.join('\n');
}

async function fetchAllProducts() {
  if (!SHOPIFY_STOREFRONT_TOKEN) {
    throw new Error('SHOPIFY_STOREFRONT_TOKEN is required; a cached or synthetic catalog is not permitted');
  }

  const products = [];
  let after = null;
  do {
    const response = await fetch(SHOPIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: PRODUCTS_QUERY, variables: { first: 250, after } }),
    });
    if (!response.ok) throw new Error(`Shopify Storefront API returned HTTP ${response.status}`);
    const json = await response.json();
    if (json.errors?.length) {
      throw new Error(`Shopify Storefront API returned GraphQL errors: ${json.errors.map((error) => error.message).join('; ')}`);
    }
    const connection = json.data?.products;
    if (!connection || !Array.isArray(connection.edges)) {
      throw new Error('Shopify Storefront API returned an invalid products connection');
    }
    products.push(...connection.edges.map((edge) => edge?.node).filter(Boolean));
    after = connection.pageInfo?.hasNextPage === true ? connection.pageInfo?.endCursor : null;
    if (connection.pageInfo?.hasNextPage === true && !after) {
      throw new Error('Shopify pagination indicated another page without an end cursor');
    }
  } while (after);
  return products;
}

async function main() {
  const products = await fetchAllProducts();
  const items = [];
  let invalidAvailableOffers = 0;
  for (const product of products) {
    if (HIDDEN_PRODUCT_HANDLES.has(cleanText(product.handle))) continue;
    if (!(product.availableForSale === true)) {
      if (typeof product.availableForSale !== 'boolean') {
        invalidAvailableOffers += Math.max(1, product.variants?.edges?.length || 0);
      }
      continue;
    }
    for (const edge of product.variants?.edges || []) {
      const variant = edge?.node || {};
      if (!(variant.availableForSale === true)) {
        if (typeof variant.availableForSale !== 'boolean') invalidAvailableOffers += 1;
        continue;
      }
      const item = buildItem(product, variant);
      if (item) items.push(item);
      else invalidAvailableOffers += 1;
    }
  }
  if (invalidAvailableOffers > 0) {
    throw new Error(`${invalidAvailableOffers} available Shopify variants lack required explicit feed evidence`);
  }
  if (items.length === 0) {
    throw new Error('Shopify returned no complete, explicitly available merchant offers');
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>LuxeMia current Shopify products</title>
  <link>${SITE_URL}</link>
  <description>Current product offers sourced directly from Shopify.</description>
  <last_build_date>${new Date().toUTCString()}</last_build_date>
${items.join('\n')}
</channel>
</rss>
`;
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
  console.log(`[merchant-feed] Wrote ${items.length} complete, explicitly available Shopify offers`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[merchant-feed] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}

module.exports = {
  buildItem,
  cleanText,
  explicitValue,
  structuredTagValues,
  validGtin,
  validMoney,
};
