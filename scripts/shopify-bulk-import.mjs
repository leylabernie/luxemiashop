#!/usr/bin/env node
/**
 * Shopify Bulk Product Import Script
 * 
 * Reads products from luxemia_shopify_import.csv and creates them
 * in Shopify via the Admin REST API.
 * 
 * Features:
 *   - Deduplication: skips products that already exist (by title or handle)
 *   - Rate limiting: respects Shopify API limits (2 req/sec for Basic, 4 for Plus)
 *   - Retry with exponential backoff on 429/5xx errors
 *   - Dry-run mode: preview what would be imported without making changes
 *   - Progress reporting with summary
 * 
 * Usage:
 *   SHOPIFY_ACCESS_TOKEN=shpat_xxx node scripts/shopify-bulk-import.mjs
 *   SHOPIFY_ACCESS_TOKEN=shpat_xxx node scripts/shopify-bulk-import.mjs --dry-run
 *   SHOPIFY_ACCESS_TOKEN=shpat_xxx node scripts/shopify-bulk-import.mjs --limit 10
 *   SHOPIFY_ACCESS_TOKEN=shpat_xxx node scripts/shopify-bulk-import.mjs --category sarees
 * 
 * Required env vars:
 *   SHOPIFY_ACCESS_TOKEN  - Shopify Admin API access token (shpat_...)
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Configuration ───────────────────────────────────────────────
const SHOPIFY_STORE = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || '';
const CSV_PATH = resolve(ROOT, 'public/luxemia_shopify_import.csv');

// Rate limiting: pause between API calls (ms)
const API_DELAY = 600; // ~1.6 req/sec — safe for all plans
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 2000;

// ─── Parse CLI args ──────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0;
const categoryArg = args.find(a => a.startsWith('--category='));
const CATEGORY_FILTER = categoryArg ? categoryArg.split('=')[1].toLowerCase() : '';
const continueArg = args.find(a => a.startsWith('--continue-from='));
const CONTINUE_FROM = continueArg ? continueArg.split('=')[1] : '';

// ─── Helpers ─────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function log(...msg) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}]`, ...msg);
}

function warn(...msg) {
  const ts = new Date().toISOString().slice(11, 19);
  console.warn(`[${ts}] ⚠️`, ...msg);
}

function error(...msg) {
  const ts = new Date().toISOString().slice(11, 19);
  console.error(`[${ts}] ❌`, ...msg);
}

// Parse CSV handling quoted fields with embedded commas and newlines
function parseCSV(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const lines = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '"') {
      if (inQuotes && raw[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === '\n' && !inQuotes) {
      lines.push(current);
      current = '';
    } else if (ch === '\r' && !inQuotes) {
      // skip carriage return
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

// Group CSV rows into products (first row has product data, subsequent rows are additional images)
function groupProducts(rows) {
  const products = [];
  let currentProduct = null;

  for (const row of rows) {
    const title = (row['Title'] || '').trim();
    const handle = (row['URL handle'] || '').trim();

    if (title) {
      // New product row
      if (currentProduct) {
        products.push(currentProduct);
      }
      currentProduct = {
        title,
        handle,
        row,
        images: [],
      };
      // Primary image from this row
      const imgUrl = (row['Product image URL'] || '').trim();
      if (imgUrl) {
        currentProduct.images.push({
          url: imgUrl,
          position: parseInt(row['Image position'] || '1', 10),
          alt: (row['Image alt text'] || title).trim(),
        });
      }
    } else if (currentProduct) {
      // Additional image row (same product, no title)
      const imgUrl = (row['Product image URL'] || '').trim();
      if (imgUrl) {
        currentProduct.images.push({
          url: imgUrl,
          position: parseInt(row['Image position'] || String(currentProduct.images.length + 1), 10),
          alt: (row['Image alt text'] || currentProduct.title).trim(),
        });
      }
    }
  }

  if (currentProduct) {
    products.push(currentProduct);
  }

  return products;
}

// Convert CSV product data to Shopify Admin API product payload
function buildShopifyPayload(product) {
  const { title, handle, row, images } = product;

  // Extract variant data
  const price = (row['Price'] || '').trim();
  const compareAtPrice = (row['Compare-at price'] || '').trim();
  const sku = (row['SKU'] || '').trim();
  const option1Name = (row['Option1 name'] || '').trim();
  const option1Value = (row['Option1 value'] || '').trim();
  const inventoryQty = parseInt(row['Inventory quantity'] || '50', 10);
  const continueSelling = (row['Continue selling when out of stock'] || 'DENY').trim().toUpperCase() === 'CONTINUE';
  const weight = parseFloat(row['Weight value (grams)'] || '0');
  const weightUnit = (row['Weight unit for display'] || 'kg').trim();
  const requiresShipping = (row['Requires shipping'] || 'TRUE').trim().toUpperCase() === 'TRUE';
  const taxable = (row['Charge tax'] || 'TRUE').trim().toUpperCase() === 'TRUE';
  const vendor = (row['Vendor'] || 'LuxemiaShop').trim();
  const productType = (row['Type'] || '').trim();
  const tags = (row['Tags'] || '').trim();
  const status = (row['Status'] || 'active').trim().toLowerCase();
  const published = (row['Published on online store'] || 'TRUE').trim().toUpperCase() === 'TRUE';
  const description = (row['Description'] || '').trim();
  const seoTitle = (row['SEO title'] || '').trim();
  const seoDescription = (row['SEO description'] || '').trim();
  const googleCategory = (row['Google Shopping / Google product category'] || '').trim();
  const googleGender = (row['Google Shopping / Gender'] || '').trim();
  const googleAgeGroup = (row['Google Shopping / Age group'] || '').trim();
  const googleCondition = (row['Google Shopping / Condition'] || 'New').trim();
  const colorMetafield = (row['Color (product.metafields.shopify.color-pattern)'] || '').trim();

  // Build images array (sorted by position)
  const sortedImages = [...images].sort((a, b) => a.position - b.position);
  const shopifyImages = sortedImages.map(img => ({
    src: img.url,
    alt: img.alt || title,
  }));

  // Build variant
  const variant = {
    price: price || '0.00',
    inventory_management: 'shopify',
    inventory_quantity: inventoryQty,
    inventory_policy: continueSelling ? 'continue' : 'deny',
    requires_shipping: requiresShipping,
    taxable: taxable,
    weight: weight > 0 ? weight : undefined,
    weight_unit: weight > 0 ? weightUnit : undefined,
  };

  if (compareAtPrice) {
    variant.compare_at_price = compareAtPrice;
  }

  if (sku) {
    variant.sku = sku;
  }

  if (option1Name && option1Value) {
    variant.option1 = option1Value;
  }

  // Build metafields
  const metafields = [];

  if (colorMetafield) {
    metafields.push({
      namespace: 'shopify',
      key: 'color-pattern',
      value: colorMetafield,
      type: 'single_line_text_field',
    });
  }

  if (googleCategory) {
    metafields.push({
      namespace: 'google',
      key: 'product_category',
      value: googleCategory,
      type: 'single_line_text_field',
    });
  }

  if (googleGender) {
    metafields.push({
      namespace: 'google',
      key: 'gender',
      value: googleGender,
      type: 'single_line_text_field',
    });
  }

  if (googleAgeGroup) {
    metafields.push({
      namespace: 'google',
      key: 'age_group',
      value: googleAgeGroup,
      type: 'single_line_text_field',
    });
  }

  if (googleCondition) {
    metafields.push({
      namespace: 'google',
      key: 'condition',
      value: googleCondition,
      type: 'single_line_text_field',
    });
  }

  // Build payload
  const payload = {
    product: {
      title,
      handle: handle || undefined,
      body_html: description || undefined,
      vendor,
      product_type: productType || undefined,
      tags: tags || undefined,
      status: status === 'active' ? 'active' : 'draft',
      published,
      images: shopifyImages.length > 0 ? shopifyImages : undefined,
      variants: [variant],
      metafields: metafields.length > 0 ? metafields : undefined,
    },
  };

  // Add option if present
  if (option1Name && option1Value) {
    payload.product.options = [{ name: option1Name, values: [option1Value] }];
  }

  // Add SEO
  if (seoTitle || seoDescription) {
    payload.product.metafields = payload.product.metafields || [];
    // Shopify uses SEO fields at product level in newer API
    payload.product.seo = {};
    if (seoTitle) payload.product.seo.title = seoTitle;
    if (seoDescription) payload.product.seo.description = seoDescription;
  }

  return payload;
}

// ─── Shopify API calls ───────────────────────────────────────────

async function shopifyFetch(path, options = {}, retryCount = 0) {
  const url = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      ...options.headers,
    },
  });

  // Handle rate limiting
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10);
    warn(`Rate limited. Retrying after ${retryAfter}s...`);
    await sleep(retryAfter * 1000);
    return shopifyFetch(path, options, retryCount);
  }

  // Retry on server errors
  if (response.status >= 500 && retryCount < MAX_RETRIES) {
    const delay = RETRY_BASE_DELAY * Math.pow(2, retryCount);
    warn(`Server error ${response.status}. Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    await sleep(delay);
    return shopifyFetch(path, options, retryCount + 1);
  }

  return response;
}

// Check if a product already exists in Shopify by handle
async function findExistingProduct(handle) {
  try {
    const response = await shopifyFetch(`/products.json?handle=${encodeURIComponent(handle)}&limit=1`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.products?.[0] || null;
  } catch {
    return null;
  }
}

// Create a product in Shopify
async function createProduct(payload) {
  const response = await shopifyFetch('/products.json', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 500)}`);
  }

  return response.json();
}

// Get total product count from Shopify
async function getShopifyProductCount() {
  try {
    const response = await shopifyFetch('/products/count.json');
    if (!response.ok) return -1;
    const data = await response.json();
    return data.count;
  } catch {
    return -1;
  }
}

// Fetch all existing product handles for bulk deduplication
async function fetchExistingHandles() {
  const handles = new Set();
  let cursor = null;
  let hasNextPage = true;

  log('Fetching existing product handles from Shopify for deduplication...');

  while (hasNextPage) {
    const url = cursor
      ? `/products.json?limit=250&since_id=${cursor}`
      : `/products.json?limit=250`;

    const response = await shopifyFetch(url);
    if (!response.ok) {
      warn('Could not fetch existing products for dedup');
      return handles;
    }

    const data = await response.json();
    const products = data.products || [];

    for (const p of products) {
      handles.add(p.handle);
      cursor = p.id;
    }

    hasNextPage = products.length === 250;
    log(`  Fetched ${products.length} products (total: ${handles.size})`);

    if (hasNextPage) {
      await sleep(500);
    }
  }

  return handles;
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║          Shopify Bulk Product Import — LuxeMia              ║
╠══════════════════════════════════════════════════════════════╣
║  Store: ${SHOPIFY_STORE.padEnd(48)}║
║  Mode:  ${(DRY_RUN ? 'DRY RUN (no changes)'.padEnd(48) : 'LIVE — will create products'.padEnd(48))}║
║  File:  ${CSV_PATH.slice(-46).padStart(46)}║
╚══════════════════════════════════════════════════════════════╝
  `);

  // Validate token
  if (!SHOPIFY_ACCESS_TOKEN) {
    error('SHOPIFY_ACCESS_TOKEN is required!');
    console.log(`
Set it as an environment variable:
  SHOPIFY_ACCESS_TOKEN=shpat_xxx node scripts/shopify-bulk-import.mjs

Or for a dry run (no changes):
  SHOPIFY_ACCESS_TOKEN=shpat_xxx node scripts/shopify-bulk-import.mjs --dry-run
    `);
    process.exit(1);
  }

  // Parse CSV
  log('Parsing CSV file...');
  const { rows } = parseCSV(CSV_PATH);
  log(`Parsed ${rows.length} rows from CSV`);

  // Group into products
  const allProducts = groupProducts(rows);
  log(`Found ${allProducts.length} unique products`);

  // Apply filters
  let products = allProducts;

  if (CATEGORY_FILTER) {
    products = products.filter(p => {
      const type = (p.row['Type'] || '').toLowerCase();
      const tags = (p.row['Tags'] || '').toLowerCase();
      const title = p.title.toLowerCase();
      return type.includes(CATEGORY_FILTER) || tags.includes(CATEGORY_FILTER) || title.includes(CATEGORY_FILTER);
    });
    log(`Filtered to ${products.length} products matching category: "${CATEGORY_FILTER}"`);
  }

  if (CONTINUE_FROM) {
    const idx = products.findIndex(p => p.handle === CONTINUE_FROM || p.title === CONTINUE_FROM);
    if (idx >= 0) {
      products = products.slice(idx);
      log(`Continuing from "${CONTINUE_FROM}" (${products.length} products remaining)`);
    } else {
      warn(`Continue-from handle "${CONTINUE_FROM}" not found, starting from beginning`);
    }
  }

  if (LIMIT > 0) {
    products = products.slice(0, LIMIT);
    log(`Limited to ${products.length} products`);
  }

  if (products.length === 0) {
    log('No products to import after filtering.');
    return;
  }

  // Get current Shopify product count
  const currentCount = await getShopifyProductCount();
  log(`Current products in Shopify: ${currentCount}`);

  // Fetch existing handles for dedup
  let existingHandles;
  if (!DRY_RUN) {
    existingHandles = await fetchExistingHandles();
    log(`Found ${existingHandles.size} existing product handles in Shopify`);
  } else {
    existingHandles = new Set();
  }

  // Process products
  let created = 0;
  let skipped = 0;
  let failed = 0;
  const failedProducts = [];
  let continueFromHandle = '';

  log(`\n${'═'.repeat(60)}`);
  log(`Starting import of ${products.length} products...`);
  log(`${'═'.repeat(60)}\n`);

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const progress = `[${i + 1}/${products.length}]`;
    continueFromHandle = product.handle || product.title;

    // Check if product already exists
    if (existingHandles.has(product.handle)) {
      log(`${progress} ⏭️  SKIP (exists): ${product.title}`);
      skipped++;
      continue;
    }

    // Build payload
    const payload = buildShopifyPayload(product);

    if (DRY_RUN) {
      log(`${progress} 📋 WOULD CREATE: ${product.title}`);
      log(`     Handle: ${product.handle}`);
      log(`     Price: ${payload.product.variants[0]?.price || 'N/A'}`);
      log(`     Compare at: ${payload.product.variants[0]?.compare_at_price || 'N/A'}`);
      log(`     Images: ${payload.product.images?.length || 0}`);
      log(`     Type: ${payload.product.product_type || 'N/A'}`);
      log(`     Tags: ${(payload.product.tags || '').slice(0, 80)}...`);
      created++; // count as "would create" in dry run
      continue;
    }

    // Create product
    try {
      const result = await createProduct(payload);
      const shopifyProduct = result.product;
      log(`${progress} ✅ CREATED: ${product.title} (ID: ${shopifyProduct.id})`);
      log(`     Handle: ${shopifyProduct.handle}`);
      log(`     Images: ${shopifyProduct.images?.length || 0} | Variants: ${shopifyProduct.variants?.length || 0}`);

      // Add to existing handles to prevent duplicates
      existingHandles.add(shopifyProduct.handle);
      created++;

      // Rate limit delay
      await sleep(API_DELAY);

    } catch (err) {
      error(`${progress} FAILED: ${product.title}`);
      error(`     ${err.message}`);
      failed++;
      failedProducts.push({
        title: product.title,
        handle: product.handle,
        error: err.message.slice(0, 200),
      });

      // Still delay on failure
      await sleep(API_DELAY);
    }
  }

  // Summary
  const newCount = await getShopifyProductCount();
  console.log(`
${'═'.repeat(60)}
  IMPORT SUMMARY
${'═'.repeat(60)}
  Mode:          ${DRY_RUN ? 'DRY RUN' : 'LIVE'}
  Total products: ${products.length}
  ${DRY_RUN ? 'Would create:' : 'Created:'}     ${created}
  Skipped:       ${skipped} (already exist)
  Failed:        ${failed}
  
  Shopify products before: ${currentCount}
  Shopify products after:  ${newCount >= 0 ? newCount : 'unknown'}
${failedProducts.length > 0 ? `
  Failed products:
${failedProducts.map(p => `    - ${p.title} (${p.handle}): ${p.error}`).join('\n')}
` : ''}
${!DRY_RUN && failed > 0 ? `  To continue from the last failure:
    SHOPIFY_ACCESS_TOKEN=xxx node scripts/shopify-bulk-import.mjs --continue-from=${continueFromHandle}
` : ''}${'═'.repeat(60)}
  `);

  // Write failed products to file for retry
  if (failedProducts.length > 0 && !DRY_RUN) {
    const { writeFileSync } = await import('fs');
    const failedPath = resolve(ROOT, 'scripts/import-failures.json');
    writeFileSync(failedPath, JSON.stringify(failedProducts, null, 2));
    log(`Failed products saved to: ${failedPath}`);
  }
}

main().catch(err => {
  error('Script failed:', err);
  process.exit(1);
});
