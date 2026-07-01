#!/usr/bin/env node
/**
 * bulk-write-shopify-seo.mjs
 *
 * Reads a CSV of (Handle, SEO Title, SEO Description) rows and writes
 * those exact values to the corresponding Shopify products via the
 * Admin REST API. No LLM generation — the user supplies Claude-reviewed
 * batches one at a time, this script just applies them.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PREREQUISITES
 * ─────────────────────────────────────────────────────────────────────────────
 * - SHOPIFY_ADMIN_ACCESS_TOKEN env var (Admin API token with write_products
 *   scope, NOT the Storefront token). Create at:
 *   Shopify Admin → Apps → Develop apps → [your app] → API credentials
 *   → Admin API access token (scopes: write_products, read_products)
 *
 * - Node 18+ (for native fetch and fs/promises)
 *
 * - Input CSV with header row: Handle,SEO Title,SEO Description
 *   (column names case-insensitive; "seo_title"/"seotitle" also accepted)
 *   Quote values containing commas per RFC 4180.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *   # Dry run — validate CSV, fetch current Shopify values, log diff, no writes
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx \
 *     node bulk-write-shopify-seo.mjs --csv=/path/to/batch.csv --dry-run
 *
 *   # Real run — write SEO fields to Shopify
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx \
 *     node bulk-write-shopify-seo.mjs --csv=/path/to/batch.csv
 *
 *   # Limit to N rows (for testing)
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx \
 *     node bulk-write-shopify-seo.mjs --csv=/path/to/batch.csv --limit=5
 *
 *   # Skip rows where Shopify already has the exact same values
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx \
 *     node bulk-write-shopify-seo.mjs --csv=/path/to/batch.csv --skip-unchanged
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CSV FORMAT
 * ─────────────────────────────────────────────────────────────────────────────
 *   Handle,SEO Title,SEO Description
 *   shimmer-tissue-stone-bridal-lehenga-lavish-reception-040,"Teal Tissue Lehenga for Lavish Receptions","Command every gaze in shimmer teal tissue with stone setting handwork..."
 *   red-raw-cutdana-bridal-lehenga-grand-reception-029,"Red Raw Silk Cutdana Bridal Lehenga","Luxuriate in red raw silk adorned with cutdana handwork..."
 *
 *   - Header row required (case-insensitive).
 *   - Handle must match the product's Shopify handle (URL slug).
 *   - SEO Title and SEO Description will be applied verbatim.
 *   - Values containing commas MUST be quoted. Embedded quotes escaped as "".
 *   - Blank rows ignored. Rows with empty Handle skipped with warning.
 *   - Rows with empty SEO Title OR empty SEO Description are skipped with
 *     error (we never write one field without the other).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LENGTH VALIDATION
 * ─────────────────────────────────────────────────────────────────────────────
 * Google truncates titles >60 chars and descriptions >155 chars. This script
 * does NOT auto-truncate — it WARNS and asks for confirmation. Use --force
 * to write values that exceed the limits anyway:
 *
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx \
 *     node bulk-write-shopify-seo.mjs --csv=/path/to/batch.csv --force
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * OUTPUT
 * ─────────────────────────────────────────────────────────────────────────────
 * - stdout: progress + summary + sample before/after
 * - /home/z/my-project/download/shopify-seo-changes-<timestamp>.csv
 *   Audit log: handle, status, before_seo_title, before_seo_description,
 *   after_seo_title, after_seo_description, error
 */

import { readFile } from 'node:fs/promises';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// ─── Config ─────────────────────────────────────────────────────────────────
const SHOPIFY_STORE_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';

// Length thresholds (warnings, not hard caps unless --force is absent)
const TITLE_WARN_LEN = 60;
const DESC_WARN_LEN = 155;

// Concurrency for Shopify Admin API writes. Keep low to avoid 429s.
const SHOPIFY_WRITE_CONCURRENCY = 2;

// ─── CLI args ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const SKIP_UNCHANGED = args.includes('--skip-unchanged');
const CSV_ARG = args.find(a => a.startsWith('--csv='));
const LIMIT_ARG = args.find(a => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : 0;

if (!SHOPIFY_ADMIN_TOKEN) {
  console.error('ERROR: SHOPIFY_ADMIN_ACCESS_TOKEN env var is required.');
  console.error('Create a Shopify Admin API token with write_products scope at:');
  console.error('  Shopify Admin → Apps → Develop apps → [your app] → API credentials');
  process.exit(1);
}
if (!CSV_ARG) {
  console.error('ERROR: --csv=<path> is required.');
  console.error('Usage: SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node bulk-write-shopify-seo.mjs --csv=/path/to/batch.csv [--dry-run] [--limit=N] [--skip-unchanged] [--force]');
  process.exit(1);
}
const CSV_PATH = CSV_ARG.split('=')[1];

console.log(`\n═══════════════════════════════════════════════════════════════`);
console.log(`  LuxeMia Bulk SEO Writer (CSV-driven, no LLM)`);
console.log(`═══════════════════════════════════════════════════════════════`);
console.log(`  Mode:             ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (will write to Shopify)'}`);
console.log(`  CSV:              ${CSV_PATH}`);
console.log(`  Store:            ${SHOPIFY_STORE_DOMAIN}`);
console.log(`  API version:      ${SHOPIFY_API_VERSION}`);
console.log(`  Skip unchanged:   ${SKIP_UNCHANGED ? 'yes' : 'no'}`);
console.log(`  Force over-limit: ${FORCE ? 'yes (will write titles >60 chars / descs >155 chars)' : 'no (will reject over-limit rows)'}`);
console.log(`  Limit:            ${LIMIT || 'no limit'}`);
console.log(`  Write concurrency: ${SHOPIFY_WRITE_CONCURRENCY}`);
console.log(`═══════════════════════════════════════════════════════════════\n`);

// ─── CSV parser (RFC 4180) ──────────────────────────────────────────────────
// Minimal but correct: handles quoted fields, escaped quotes (""),
// embedded newlines inside quotes, trailing newline.
function parseCsv(text) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++; // skip escaped quote
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else if (c === '\r') {
        // skip — handled by \n
      } else {
        field += c;
      }
    }
  }
  // Last field/row if file doesn't end with newline
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function normalizeHeader(h) {
  return h.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

async function readCsv(path) {
  const text = await readFile(path, 'utf8');
  const rows = parseCsv(text);
  if (rows.length === 0) {
    throw new Error('CSV is empty.');
  }

  // Find header row (first row that contains a handle-ish column)
  const header = rows[0].map(normalizeHeader);
  const handleIdx = header.findIndex(h => h === 'handle' || h === 'slug' || h === 'urlslug');
  const titleIdx = header.findIndex(h => h === 'seotitle' || h === 'title');
  const descIdx = header.findIndex(h => h === 'seodescription' || h === 'description' || h === 'metadescription');

  if (handleIdx === -1) {
    throw new Error(`CSV header missing "Handle" column. Found: ${header.join(', ')}`);
  }
  if (titleIdx === -1) {
    throw new Error(`CSV header missing "SEO Title" column. Found: ${header.join(', ')}`);
  }
  if (descIdx === -1) {
    throw new Error(`CSV header missing "SEO Description" column. Found: ${header.join(', ')}`);
  }

  const records = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Skip blank rows
    if (row.length === 0 || (row.length === 1 && row[0].trim() === '')) continue;
    const handle = (row[handleIdx] || '').trim();
    const seoTitle = (row[titleIdx] || '').trim();
    const seoDescription = (row[descIdx] || '').trim();
    records.push({ handle, seoTitle, seoDescription, lineNumber: i + 1 });
  }

  return records;
}

// ─── Shopify Admin API ──────────────────────────────────────────────────────
async function shopifyAdminFetch(path, init = {}) {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Shopify ${init.method || 'GET'} ${path} → ${res.status}: ${text.slice(0, 300)}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }
  return res.json();
}

// Look up product ID + current SEO fields by handle.
// Uses the product listing endpoint which is faster than searching products.
async function fetchProductByHandle(handle) {
  // The /products.json endpoint doesn't support filter by handle directly.
  // Use the product listing endpoint (no auth issue, public-ish) OR the
  // products search. The cleanest approach: GET /products.json?handle=<h>
  // Shopify supports this filter.
  const data = await shopifyAdminFetch(
    `/products.json?limit=1&fields=id,handle,seo_title,seo_description,title&handle=${encodeURIComponent(handle)}`
  );
  return (data.products && data.products[0]) || null;
}

async function writeProductSeo(productId, seoTitle, seoDescription) {
  return shopifyAdminFetch(`/products/${productId}.json`, {
    method: 'PUT',
    body: JSON.stringify({
      product: {
        id: productId,
        // Shopify REST uses snake_case seo_title / seo_description at the
        // product top level — different from Storefront GraphQL's
        // seo { title, description } shape.
        seo_title: seoTitle,
        seo_description: seoDescription,
      },
    }),
  });
}

// ─── Concurrency pool ───────────────────────────────────────────────────────
async function runWithConcurrency(items, fn, concurrency) {
  const results = new Array(items.length);
  let next = 0;
  let completed = 0;
  const total = items.length;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = await fn(items[i], i);
      } catch (err) {
        results[i] = { error: err.message, ...(items[i] || {}) };
      }
      completed++;
      if (completed % 5 === 0 || completed === total) {
        process.stdout.write(`\r  progress: ${completed}/${total} `);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  process.stdout.write('\n');
  return results;
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n▼ Reading CSV: ${CSV_PATH}\n`);
  let records;
  try {
    records = await readCsv(CSV_PATH);
  } catch (err) {
    console.error(`\n✗ CSV read failed: ${err.message}`);
    process.exit(1);
  }
  console.log(`  Parsed ${records.length} data rows.\n`);

  // ─── Pre-flight validation ──────────────────────────────────────────────
  const valid = [];
  const rejected = [];
  for (const r of records) {
    const issues = [];
    if (!r.handle) issues.push('empty handle');
    if (!r.seoTitle) issues.push('empty SEO Title');
    if (!r.seoDescription) issues.push('empty SEO Description');
    if (!FORCE) {
      if (r.seoTitle.length > TITLE_WARN_LEN) issues.push(`title ${r.seoTitle.length} > ${TITLE_WARN_LEN}`);
      if (r.seoDescription.length > DESC_WARN_LEN) issues.push(`desc ${r.seoDescription.length} > ${DESC_WARN_LEN}`);
    }
    if (issues.length > 0) {
      rejected.push({ ...r, issues });
    } else {
      valid.push(r);
    }
  }

  if (rejected.length > 0) {
    console.log(`  ⚠️  Rejected ${rejected.length} rows:`);
    for (const r of rejected.slice(0, 10)) {
      console.log(`    line ${r.lineNumber}: ${r.handle || '(no handle)'} — ${r.issues.join(', ')}`);
    }
    if (rejected.length > 10) console.log(`    ... and ${rejected.length - 10} more`);
    if (!FORCE) {
      console.log(`\n  (Use --force to write over-limit rows anyway.)`);
    }
    console.log('');
  }

  if (valid.length === 0) {
    console.log('  No valid rows to process. Exiting.');
    return;
  }

  let targets = valid;
  if (LIMIT > 0) {
    targets = valid.slice(0, LIMIT);
    console.log(`  After --limit=${LIMIT}: ${targets.length} rows\n`);
  }

  // ─── Look up each product by handle (concurrent) ─────────────────────────
  console.log(`▼ Looking up ${targets.length} products by handle in Shopify...\n`);
  const lookups = await runWithConcurrency(
    targets,
    async (r) => {
      try {
        const product = await fetchProductByHandle(r.handle);
        if (!product) {
          return { ...r, status: 'not_found', error: `No Shopify product with handle "${r.handle}"` };
        }
        return {
          ...r,
          product_id: product.id,
          product_title: product.title,
          before: { seo_title: product.seo_title || '', seo_description: product.seo_description || '' },
        };
      } catch (err) {
        return { ...r, status: 'lookup_error', error: err.message };
      }
    },
    SHOPIFY_WRITE_CONCURRENCY
  );

  const notFound = lookups.filter(l => l.status === 'not_found');
  const lookupErrors = lookups.filter(l => l.status === 'lookup_error');
  const readyToWrite = lookups.filter(l => l.product_id);

  if (notFound.length > 0) {
    console.log(`\n  ⚠️  ${notFound.length} handles not found in Shopify:`);
    for (const r of notFound.slice(0, 10)) {
      console.log(`    ${r.handle}`);
    }
    if (notFound.length > 10) console.log(`    ... and ${notFound.length - 10} more`);
  }
  if (lookupErrors.length > 0) {
    console.log(`\n  ⚠️  ${lookupErrors.length} lookup errors:`);
    for (const r of lookupErrors.slice(0, 5)) {
      console.log(`    ${r.handle}: ${r.error}`);
    }
  }

  console.log(`\n  Ready to write: ${readyToWrite.length}\n`);

  // ─── Filter: skip unchanged (optional) ───────────────────────────────────
  let toWrite = readyToWrite;
  if (SKIP_UNCHANGED) {
    toWrite = readyToWrite.filter(r => {
      const sameTitle = (r.before.seo_title || '').trim() === r.seoTitle.trim();
      const sameDesc = (r.before.seo_description || '').trim() === r.seoDescription.trim();
      return !(sameTitle && sameDesc);
    });
    const skipped = readyToWrite.length - toWrite.length;
    console.log(`  --skip-unchanged: skipped ${skipped} rows where Shopify already matches.\n`);
  }

  if (toWrite.length === 0) {
    console.log('  Nothing to write. Exiting.');
    return;
  }

  // ─── Write to Shopify ────────────────────────────────────────────────────
  let writeResults;
  if (DRY_RUN) {
    console.log(`▼ DRY RUN — skipping Shopify writes. (Remove --dry-run to write.)\n`);
    writeResults = toWrite.map(r => ({
      handle: r.handle,
      product_id: r.product_id,
      status: 'dry_run',
      before: r.before,
      after: { seo_title: r.seoTitle, seo_description: r.seoDescription },
    }));
  } else {
    console.log(`▼ Writing SEO fields to Shopify (concurrency: ${SHOPIFY_WRITE_CONCURRENCY})...\n`);
    writeResults = await runWithConcurrency(
      toWrite,
      async (r) => {
        try {
          await writeProductSeo(r.product_id, r.seoTitle, r.seoDescription);
          return {
            handle: r.handle,
            product_id: r.product_id,
            status: 'success',
            before: r.before,
            after: { seo_title: r.seoTitle, seo_description: r.seoDescription },
          };
        } catch (err) {
          return {
            handle: r.handle,
            product_id: r.product_id,
            status: 'error',
            error: err.message,
            before: r.before,
            after: { seo_title: r.seoTitle, seo_description: r.seoDescription },
          };
        }
      },
      SHOPIFY_WRITE_CONCURRENCY
    );
  }

  // ─── Audit CSV ───────────────────────────────────────────────────────────
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const csvOutPath = join('/home/z/my-project/download', `shopify-seo-changes-${ts}.csv`);
  mkdirSync('/home/z/my-project/download', { recursive: true });

  const csvRows = [
    'handle,product_id,status,before_seo_title,before_seo_description,after_seo_title,after_seo_description,error',
  ];
  // Include lookups that failed + write results
  const allResults = [
    ...notFound.map(r => ({ handle: r.handle, product_id: '', status: 'not_found', before: null, after: null, error: r.error })),
    ...lookupErrors.map(r => ({ handle: r.handle, product_id: '', status: 'lookup_error', before: null, after: null, error: r.error })),
    ...writeResults,
  ];
  for (const r of allResults) {
    const esc = v => `"${String(v || '').replace(/"/g, '""')}"`;
    csvRows.push([
      r.handle || '',
      r.product_id || '',
      r.status || '',
      r.before?.seo_title || '',
      r.before?.seo_description || '',
      r.after?.seo_title || '',
      r.after?.seo_description || '',
      r.error || '',
    ].map(esc).join(','));
  }
  writeFileSync(csvOutPath, csvRows.join('\n'));

  // ─── Summary ─────────────────────────────────────────────────────────────
  const successCount = writeResults.filter(r => r.status === 'success' || r.status === 'dry_run').length;
  const errorCount = writeResults.filter(r => r.status === 'error').length;

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`  SUMMARY`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`  CSV rows parsed:      ${records.length}`);
  console.log(`  Rejected (validation):${rejected.length}`);
  console.log(`  Handles not found:    ${notFound.length}`);
  console.log(`  Lookup errors:        ${lookupErrors.length}`);
  console.log(`  ${DRY_RUN ? 'Would write' : 'Wrote'}:           ${successCount}`);
  console.log(`  Write errors:         ${errorCount}`);
  console.log(`  Audit CSV:            ${csvOutPath}`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);

  // ─── Sample before/after ─────────────────────────────────────────────────
  console.log('Sample before/after (first 5 written):\n');
  for (const r of writeResults.slice(0, 5)) {
    console.log(`  ${r.handle}`);
    console.log(`    BEFORE title: ${r.before?.seo_title || '(empty)'}`);
    console.log(`    AFTER  title: ${r.after?.seo_title}`);
    console.log(`    BEFORE desc:  ${(r.before?.seo_description || '(empty)').slice(0, 100)}${r.before?.seo_description && r.before.seo_description.length > 100 ? '…' : ''}`);
    console.log(`    AFTER  desc:  ${(r.after?.seo_description || '').slice(0, 100)}${r.after?.seo_description && r.after.seo_description.length > 100 ? '…' : ''}`);
    if (r.error) console.log(`    ERROR:        ${r.error}`);
    console.log('');
  }
}

main().catch(err => {
  console.error('\nFATAL:', err);
  process.exit(1);
});
