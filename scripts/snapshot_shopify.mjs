#!/usr/bin/env node
/**
 * Snapshot all current Shopify products to a CSV file for rollback safety.
 * Captures: Handle, Title, Type, Vendor, Tags, Body HTML summary, Variant price,
 * Image URL, Status. This is the "before" state we can restore from if needed.
 */

import { writeFileSync, mkdirSync } from 'node:fs';

const SHOPIFY_STORE_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
const PAGE_SIZE = 250;
const PAGE_DELAY_MS = 500;

if (!SHOPIFY_ADMIN_TOKEN) {
  console.error('ERROR: SHOPIFY_ADMIN_ACCESS_TOKEN env var required');
  process.exit(1);
}

async function shopifyFetchRaw(path) {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  // Attach the Link header so caller can do cursor pagination
  data._linkHeader = res.headers.get('link') || '';
  return data;
}

async function fetchAllProducts() {
  console.log('Fetching all products (cursor-based pagination)...');
  const all = [];
  let pageInfo = null;
  let pageNum = 1;
  while (true) {
    if (pageNum > 1) await new Promise(r => setTimeout(r, PAGE_DELAY_MS));
    let path = `/products.json?limit=${PAGE_SIZE}&fields=id,handle,title,body_html,vendor,product_type,tags,images,variants,status`;
    if (pageInfo) path += `&page_info=${encodeURIComponent(pageInfo)}`;
    const data = await shopifyFetchRaw(path);
    const products = data.products || [];
    console.log(`  page ${pageNum}: ${products.length} products`);
    all.push(...products);
    if (products.length < PAGE_SIZE) break;

    // Extract next page_info from Link header
    const link = data._linkHeader || '';
    const nextMatch = link.match(/<([^>]+)>;\s*rel="next"/);
    if (!nextMatch) break;
    const nextUrl = new URL(nextMatch[1]);
    pageInfo = nextUrl.searchParams.get('page_info');
    if (!pageInfo) break;
    pageNum++;
    if (pageNum > 10) break;
  }
  return all;
}

function csvEscape(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function main() {
  const products = await fetchAllProducts();
  console.log(`\nTotal: ${products.length} products\n`);

  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outPath = `/home/z/my-project/download/shopify-snapshot-BEFORE-${ts}.csv`;
  mkdirSync('/home/z/my-project/download', { recursive: true });

  const headers = [
    'handle', 'id', 'title', 'product_type', 'vendor', 'tags',
    'status', 'body_html_length', 'variant_count', 'first_variant_price',
    'image_count', 'first_image_src',
  ];
  const lines = [headers.join(',')];
  for (const p of products) {
    lines.push([
      p.handle,
      p.id,
      p.title,
      p.product_type,
      p.vendor,
      p.tags,
      p.status,
      (p.body_html || '').length,
      (p.variants || []).length,
      (p.variants || [])[0]?.price || '',
      (p.images || []).length,
      (p.images || [])[0]?.src || '',
    ].map(csvEscape).join(','));
  }
  writeFileSync(outPath, lines.join('\n') + '\n');

  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`  SNAPSHOT COMPLETE — ROLLBACK FILE CREATED`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`  File: ${outPath}`);
  console.log(`  Rows: ${products.length}`);
  console.log(`  `);
  console.log(`  If anything goes wrong with the fixes, you can restore by`);
  console.log(`  importing this CSV via Shopify Admin → Products → Import`);
  console.log(`  (check "Overwrite existing products with same handle")`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);

  // Quick stats
  const vendorCounts = {};
  const typeCount = {};
  for (const p of products) {
    vendorCount[p.vendor] = (vendorCount[p.vendor] || 0) + 1;
    typeCount[p.product_type] = (typeCount[p.product_type] || 0) + 1;
  }
  console.log('Current vendor distribution:');
  for (const [v, c] of Object.entries(vendorCount).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${c}  ${v}`);
  }
  console.log('\nTop 10 product types:');
  for (const [t, c] of Object.entries(typeCount).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    console.log(`  ${c}  ${t}`);
  }
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
