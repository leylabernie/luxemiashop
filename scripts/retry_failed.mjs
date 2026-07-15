#!/usr/bin/env node
/**
 * Retry failed product updates from a previous audit log CSV.
 * Reads the audit CSV, finds rows with status="error", and retries
 * them one at a time (concurrency=1) with a 1-second delay between
 * each retry to avoid rate limits.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SHOPIFY_STORE_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';

if (!SHOPIFY_ADMIN_TOKEN) {
  console.error('ERROR: SHOPIFY_ADMIN_ACCESS_TOKEN env var required');
  process.exit(1);
}

const args = process.argv.slice(2);
const CSV_ARG = args.find(a => a.startsWith('--csv='));
if (!CSV_ARG) {
  console.error('ERROR: --csv=<path> is required');
  console.error('Usage: SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node retry-failed.mjs --csv=/path/to/audit.csv');
  process.exit(1);
}
const CSV_PATH = CSV_ARG.split('=')[1];

// Parse the audit CSV (RFC 4180)
function parseCsv(text) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else { field += c; }
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

const text = readFileSync(CSV_PATH, 'utf8');
const rows = parseCsv(text);
const headers = rows[0];
const dataRows = rows.slice(1).map(r => {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = r[i] || ''; });
  return obj;
});

// Find failed rows
const failed = dataRows.filter(r => r.status === 'error');
console.log(`\nLoaded ${dataRows.length} rows from ${CSV_PATH}`);
console.log(`Found ${failed.length} failed rows to retry\n`);

if (failed.length === 0) {
  console.log('Nothing to retry.');
  process.exit(0);
}

// For each failed row, parse the after_* fields and retry the PUT
async function retryOne(row) {
  const productId = row.product_id;
  if (!productId) {
    return { ...row, status: 'skipped', error: 'no product_id' };
  }

  // Reconstruct the update payload from after_* fields
  const updates = {};
  if (row.after_title) updates.title = row.after_title;
  if (row.after_product_type) updates.product_type = row.after_product_type;
  if (row.after_vendor) updates.vendor = row.after_vendor;
  if (row.after_tags) updates.tags = row.after_tags;

  if (Object.keys(updates).length === 0) {
    return { ...row, status: 'skipped', error: 'no updates to apply' };
  }

  try {
    const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
      },
      body: JSON.stringify({ product: { id: parseInt(productId), ...updates } }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ...row, status: 'error', error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ...row, status: 'success', error: '' };
  } catch (err) {
    return { ...row, status: 'error', error: err.message };
  }
}

async function main() {
  const results = [];
  let success = 0;
  let stillFailed = 0;
  for (let i = 0; i < failed.length; i++) {
    const r = failed[i];
    process.stdout.write(`\r  retry ${i + 1}/${failed.length}: ${r.handle.slice(0, 50).padEnd(50)} `);
    const result = await retryOne(r);
    results.push(result);
    if (result.status === 'success') success++;
    else stillFailed++;
    await new Promise(resolve => setTimeout(resolve, 1000));  // 1s delay between retries
  }
  process.stdout.write('\n');

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`  RETRY SUMMARY`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`  Retried:        ${failed.length}`);
  console.log(`  ✓ Success:      ${success}`);
  console.log(`  ✗ Still failed: ${stillFailed}`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);

  if (stillFailed > 0) {
    console.log('Still failed:');
    for (const r of results.filter(r => r.status === 'error')) {
      console.log(`  ${r.handle}: ${r.error}`);
    }
  }

  // Write retry audit log
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const csvOutPath = `/home/z/my-project/download/shopify-retry-results-${ts}.csv`;
  const csvLines = ['handle,product_id,status,error'];
  const esc = v => `"${String(v || '').replace(/"/g, '""')}"`;
  for (const r of results) {
    csvLines.push([r.handle, r.product_id, r.status, r.error].map(esc).join(','));
  }
  writeFileSync(csvOutPath, csvLines.join('\n'));
  console.log(`\nRetry audit log: ${csvOutPath}`);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
