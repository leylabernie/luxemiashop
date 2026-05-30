#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://luxemia.shop';
const FALLBACK_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-07/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';
const ROOT = path.resolve(__dirname, '..');

const ALL_PRODUCTS_QUERY = `
  query GetAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: UPDATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          handle
          images(first: 1) { edges { node { url } } }
        }
      }
    }
  }
`;

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

async function fetchLiveProducts() {
  if (!SHOPIFY_STOREFRONT_TOKEN) {
    throw new Error('SHOPIFY_STOREFRONT_TOKEN is required for product SEO parity validation.');
  }

  const products = [];
  let cursor = null;

  for (;;) {
    const variables = { first: 250 };
    if (cursor) variables.after = cursor;

    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: ALL_PRODUCTS_QUERY, variables }),
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const productsData = data?.data?.products;
    if (!productsData) {
      throw new Error('Shopify API response did not include products.');
    }

    products.push(...(productsData.edges || []).map(edge => edge.node).filter(Boolean));
    if (!productsData.pageInfo?.hasNextPage) break;
    cursor = productsData.pageInfo.endCursor;
  }

  return products;
}

function productHandlesFromSitemap(file) {
  const xml = read(file);
  const handles = [];
  const withoutImage = [];

  for (const match of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const block = match[1];
    const loc = block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1]?.trim();
    if (!loc) continue;

    let pathname;
    try {
      pathname = new URL(loc).pathname.replace(/\/$/, '');
    } catch {
      pathname = loc.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '');
    }

    if (!pathname.startsWith('/product/')) continue;
    const handle = pathname.slice('/product/'.length);
    handles.push(handle);
    if (!block.includes('<image:image>')) withoutImage.push(handle);
  }

  return { handles, withoutImage };
}

function productHandlesFromPrerender() {
  const productDir = path.join(ROOT, 'dist', '_prerender', 'product');
  if (!fs.existsSync(productDir)) return [];

  return fs
    .readdirSync(productDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
    .map(entry => entry.name.replace(/\.html$/, ''))
    .sort();
}

function fallbackSchemaHandles() {
  const productDir = path.join(ROOT, 'dist', '_prerender', 'product');
  if (!fs.existsSync(productDir)) return [];

  const handles = [];
  for (const entry of fs.readdirSync(productDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const handle = entry.name.replace(/\.html$/, '');
    const html = read(path.join(productDir, entry.name));
    const productSchemas = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
      .map(match => match[1])
      .filter(body => body.includes('"@type":"Product"') || body.includes('"@type": "Product"'));
    if (productSchemas.some(body => body.includes(FALLBACK_OG_IMAGE))) {
      handles.push(handle);
    }
  }
  return handles.sort();
}

function diff(left, right) {
  const rightSet = new Set(right);
  return left.filter(item => !rightSet.has(item)).sort();
}

function logList(label, items) {
  console.log(`[validate:product-seo] ${label}: ${items.length ? items.join(', ') : 'none'}`);
}

(async () => {
  const liveProducts = await fetchLiveProducts();
  const liveHandles = liveProducts.map(product => product.handle).filter(Boolean).sort();
  const liveNoImage = liveProducts
    .filter(product => !(product.images?.edges || []).length)
    .map(product => product.handle)
    .filter(Boolean)
    .sort();

  const sitemap = productHandlesFromSitemap(path.join(ROOT, 'dist', 'sitemap.xml'));
  const prerenderHandles = productHandlesFromPrerender();
  const fallbackHandles = fallbackSchemaHandles();

  const sitemapMissingPrerender = diff(sitemap.handles, prerenderHandles);
  const prerenderNotInSitemap = diff(prerenderHandles, sitemap.handles);
  const sitemapNotLive = diff(sitemap.handles, liveHandles);
  const liveNotSitemap = diff(liveHandles, sitemap.handles);

  console.log('[validate:product-seo] Product route parity');
  console.log(`[validate:product-seo] live handles: ${liveHandles.length}`);
  console.log(`[validate:product-seo] dist sitemap product URLs: ${sitemap.handles.length}`);
  console.log(`[validate:product-seo] prerender product files: ${prerenderHandles.length}`);
  console.log(`[validate:product-seo] sitemap products missing prerender: ${sitemapMissingPrerender.length}`);
  console.log(`[validate:product-seo] prerender products not in sitemap: ${prerenderNotInSitemap.length}`);
  console.log(`[validate:product-seo] sitemap products without image:image: ${sitemap.withoutImage.length}`);
  console.log(`[validate:product-seo] prerender pages using fallback JSON-LD image: ${fallbackHandles.length}`);

  logList('sitemap products without image:image', sitemap.withoutImage);
  logList('live Shopify products without images', liveNoImage);
  logList('fallback JSON-LD handles', fallbackHandles);

  const hasRouteMismatch =
    sitemapMissingPrerender.length > 0 ||
    prerenderNotInSitemap.length > 0 ||
    sitemapNotLive.length > 0 ||
    liveNotSitemap.length > 0;

  if (hasRouteMismatch) {
    logList('sitemap products missing prerender', sitemapMissingPrerender);
    logList('prerender products not in sitemap', prerenderNotInSitemap);
    logList('sitemap products not in live Shopify', sitemapNotLive);
    logList('live Shopify products missing sitemap', liveNotSitemap);
    process.exit(1);
  }

  if (sitemap.withoutImage.length || fallbackHandles.length) {
    console.warn('[validate:product-seo] WARNING: image gaps found. These do not fail route parity validation.');
  }

  console.log('[validate:product-seo] OK: live Shopify, product prerender, and dist sitemap routes are in sync.');
})().catch(error => {
  console.error(`[validate:product-seo] ERROR: ${error.message}`);
  process.exit(1);
});
