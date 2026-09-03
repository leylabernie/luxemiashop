#!/usr/bin/env node
/**
 * Release gate for storefront commerce parity.
 *
 * For one in-stock variant in each representative commercial intent, compare:
 * collection hydration -> visible product price -> Product JSON-LD -> Merchant
 * feed -> a temporary Shopify cart line. This never completes checkout or
 * creates an order.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PRERENDER = path.join(DIST, '_prerender');
const FEED_PATH = path.join(DIST, 'merchant-feed.xml');
const SHOPIFY_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-10/graphql.json';
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';
const IS_RELEASE = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV) || process.env.CI === 'true';

const INTENTS = [
  ['lehengas', '/lehengas'],
  ['sarees', '/sarees'],
  ['suits', '/suits'],
  ['menswear', '/menswear'],
  ['jewelry', '/jewelry'],
  ['ready-to-ship', '/ready-to-ship'],
  ['made-to-order', '/shop-by-fulfillment/made-to-order'],
  ['customizable', '/shop-by-fulfillment/customizable-outfits'],
  ['navratri/festive', '/collections/navratri-outfits'],
];

const CART_MUTATION = `mutation AuditCart($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      lines(first: 1) {
        nodes {
          quantity
          merchandise {
            ... on ProductVariant {
              id
              availableForSale
              price { amount currencyCode }
            }
          }
          cost { totalAmount { amount currencyCode } }
        }
      }
      cost { subtotalAmount { amount currencyCode } }
    }
    userErrors { field message code }
  }
}`;

function routeFile(route) {
  return path.join(PRERENDER, route === '/' ? 'index.html' : `${route.slice(1)}.html`);
}

function decodeXml(value) {
  return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

function extractTag(item, tag) {
  const match = item.match(new RegExp(`<g:${tag}>([\\s\\S]*?)<\\/g:${tag}>`));
  return match ? decodeXml(match[1].trim()) : '';
}

function money(value) {
  const match = String(value).trim().match(/^(\d+(?:\.\d+)?)\s+([A-Z]{3})$/);
  if (!match) throw new Error(`Invalid money value: ${value}`);
  return { amount: Number(match[1]).toFixed(2), currency: match[2] };
}

function assertEqual(actual, expected, label) {
  if (String(actual) !== String(expected)) throw new Error(`${label}: expected ${expected}, received ${actual}`);
}

function collectionProducts(route) {
  const html = fs.readFileSync(routeFile(route), 'utf8');
  const match = html.match(/window\.__INITIAL_DATA__\s*=\s*({[\s\S]*?});<\/script>/);
  if (!match) throw new Error(`${route}: missing initial product data`);
  return JSON.parse(match[1]).products.map((entry) => entry.node);
}

function feedItems() {
  const xml = fs.readFileSync(FEED_PATH, 'utf8');
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
}

function findCandidate(route, items) {
  for (const product of collectionProducts(route)) {
    for (const variant of product.variants?.edges?.map((entry) => entry.node) || []) {
      if (product.availableForSale !== true || variant.availableForSale !== true) continue;
      const numericId = variant.id.split('/').pop();
      const item = items.find((entry) => {
        const link = extractTag(entry, 'link');
        return link === `https://luxemia.shop/product/${product.handle}?variant=${numericId}`;
      });
      if (item) return { product, variant, item, numericId };
    }
  }
  throw new Error(`${route}: no explicitly orderable default variant was shared by the page and Merchant feed`);
}

function productEvidence(handle, numericId) {
  const html = fs.readFileSync(routeFile(`/product/${handle}`), 'utf8');
  const visible = html.match(/<p data-product-primary-offer data-variant-id="(\d+)" data-price="([^"]+)" data-currency="([A-Z]{3})" data-availability="(In Stock|Out of Stock)">Price:\s*<strong>([A-Z]{3})\s+(\d+(?:\.\d+)?)<\/strong>[\s\S]{0,200}?\|\s*(In Stock|Out of Stock)<\/p>/);
  if (!visible) throw new Error(`/product/${handle}: missing visible price`);
  if (visible[1] !== numericId) throw new Error(`/product/${handle}: visible primary offer does not match variant ${numericId}`);
  const schemas = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]));
  const products = schemas.flatMap((schema) => schema['@type'] === 'ProductGroup' ? schema.hasVariant || [] : schema['@type'] === 'Product' ? [schema] : []);
  const schemaProduct = products.find((product) => String(product.url || '').includes(`variant=${numericId}`))
    || (products.length === 1 ? products[0] : null);
  if (!schemaProduct?.offers) throw new Error(`/product/${handle}: missing variant Offer schema`);
  return {
    visible: {
      currency: visible[5],
      amount: Number(visible[6]).toFixed(2),
      availability: visible[7] === 'In Stock' ? 'InStock' : 'OutOfStock',
    },
    schema: {
      currency: schemaProduct.offers.priceCurrency,
      amount: Number(schemaProduct.offers.price).toFixed(2),
      availability: String(schemaProduct.offers.availability).split('/').pop(),
    },
  };
}

async function cartEvidence(variantId) {
  const response = await fetch(SHOPIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN },
    body: JSON.stringify({ query: CART_MUTATION, variables: { input: { lines: [{ merchandiseId: variantId, quantity: 1 }] } } }),
  });
  if (!response.ok) throw new Error(`Shopify cart HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(`Shopify cart GraphQL: ${payload.errors.map((error) => error.message).join('; ')}`);
  const result = payload.data?.cartCreate;
  if (result?.userErrors?.length) throw new Error(`Shopify cart: ${result.userErrors.map((error) => error.message).join('; ')}`);
  const line = result?.cart?.lines?.nodes?.[0];
  if (!line) throw new Error('Shopify cart returned no line');
  return line;
}

async function main() {
  if (!fs.existsSync(FEED_PATH)) throw new Error('merchant-feed.xml is missing');
  if (!TOKEN) {
    if (IS_RELEASE) throw new Error('SHOPIFY_STOREFRONT_TOKEN is required for release commerce parity');
    console.warn('[commerce-parity] Local build has no Storefront token; static page/schema/feed parity will run and temporary-cart checks will be deferred to the release build.');
  }
  const items = feedItems();
  const checked = [];
  for (const [intent, route] of INTENTS) {
    const { product, variant, item, numericId } = findCandidate(route, items);
    const expected = { amount: Number(variant.price.amount).toFixed(2), currency: variant.price.currencyCode };
    const page = productEvidence(product.handle, numericId);
    const feed = money(extractTag(item, 'sale_price') || extractTag(item, 'price'));
    const availability = extractTag(item, 'availability');
    assertEqual(page.visible.amount, expected.amount, `${intent} visible price`);
    assertEqual(page.visible.currency, expected.currency, `${intent} visible currency`);
    assertEqual(page.visible.availability, 'InStock', `${intent} visible availability`);
    assertEqual(page.schema.amount, expected.amount, `${intent} schema price`);
    assertEqual(page.schema.currency, expected.currency, `${intent} schema currency`);
    assertEqual(page.schema.availability, 'InStock', `${intent} schema availability`);
    assertEqual(feed.amount, expected.amount, `${intent} Merchant price`);
    assertEqual(feed.currency, expected.currency, `${intent} Merchant currency`);
    assertEqual(availability, 'in_stock', `${intent} Merchant availability`);
    if (TOKEN) {
      const line = await cartEvidence(variant.id);
      assertEqual(line.merchandise.id, variant.id, `${intent} cart variant`);
      assertEqual(line.merchandise.availableForSale, true, `${intent} cart availability`);
      assertEqual(Number(line.merchandise.price.amount).toFixed(2), expected.amount, `${intent} cart merchandise price`);
      assertEqual(line.merchandise.price.currencyCode, expected.currency, `${intent} cart currency`);
      assertEqual(Number(line.cost.totalAmount.amount).toFixed(2), expected.amount, `${intent} cart line total`);
    }
    checked.push(`${intent}:${product.handle}:${numericId}`);
  }
  console.log(`[commerce-parity] Verified ${checked.length} representative intents across visible price, Product schema, Merchant feed${TOKEN ? ', and temporary Shopify carts' : ''}.`);
  console.log(`[commerce-parity] ${checked.join(' | ')}`);
}

main().catch((error) => {
  console.error(`[commerce-parity] FAILED: ${error.message}`);
  process.exitCode = 1;
});
