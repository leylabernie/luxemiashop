#!/usr/bin/env node
/**
 * bulk-write-shopify-seo.mjs
 *
 * Bulk-generate and write Shopify SEO Title + SEO Description fields
 * across all products in the LuxeMia Shopify store, using an LLM
 * (z-ai-web-dev-sdk) to generate the copy.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS
 * ─────────────────────────────────────────────────────────────────────────────
 * The site's product-page rendering (prerender.js, middleware, React) now
 * correctly reads Shopify's seo.title / seo.description fields — but those
 * fields are empty or auto-filled with boilerplate for most products. This
 * script populates them with hand-quality, keyword-rich, length-constrained
 * SEO copy generated per-product.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PREREQUISITES
 * ─────────────────────────────────────────────────────────────────────────────
 * - SHOPIFY_ADMIN_ACCESS_TOKEN env var (NOT the Storefront token — must be
 *   a Shopify Admin API token with write_products scope). Create at:
 *   Shopify Admin → Apps → Develop apps → [your app] → API credentials
 *   → Admin API access token (scopes: write_products, read_products)
 *
 * - Node 18+ (for native fetch)
 *
 * - The z-ai-web-dev-sdk package. It's already installed globally via bun
 *   at /home/z/.bun/install/global/node_modules/z-ai-web-dev-sdk. The script
 *   will resolve it from there if not found locally — see resolveZaiSdk().
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *   # Dry run — fetch products, generate SEO copy, log to CSV, but DON'T write
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node bulk-write-shopify-seo.mjs --dry-run
 *
 *   # Real run — write SEO fields back to Shopify
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node bulk-write-shopify-seo.mjs
 *
 *   # Limit to N products (for testing)
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node bulk-write-shopify-seo.mjs --limit=5
 *
 *   # Skip products that already have non-default SEO fields set
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node bulk-write-shopify-seo.mjs --skip-existing
 *
 *   # Force re-generate even if SEO fields already set
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node bulk-write-shopify-seo.mjs --force
 *
 * Output:
 *   - /home/z/my-project/download/shopify-seo-changes-<timestamp>.csv
 *     Audit log of every product processed (handle, before, after, status).
 *   - stdout: progress and summary.
 */

import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// ─── Config ─────────────────────────────────────────────────────────────────
const SHOPIFY_STORE_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
const SHOP_NAME = 'LuxeMia'; // appended to SEO titles that don't already have it

// Length constraints — Google truncates titles >60 chars and descriptions >155
// chars in search results. We hard-cap and reject anything longer.
const MAX_TITLE_LEN = 60;
const MAX_DESC_LEN = 155;

// Concurrency for LLM calls. Higher = faster but risks rate-limiting.
const LLM_CONCURRENCY = 3;

// Concurrency for Shopify Admin API writes. Keep low to avoid 429s.
const SHOPIFY_WRITE_CONCURRENCY = 2;

// ─── CLI args ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const SKIP_EXISTING = args.includes('--skip-existing');
const LIMIT_ARG = args.find(a => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : 0;

if (!SHOPIFY_ADMIN_TOKEN) {
  console.error('ERROR: SHOPIFY_ADMIN_ACCESS_TOKEN env var is required.');
  console.error('Create a Shopify Admin API token with write_products scope at:');
  console.error('  Shopify Admin → Apps → Develop apps → [your app] → API credentials');
  process.exit(1);
}

console.log(`\n═══════════════════════════════════════════════════════════════`);
console.log(`  LuxeMia Bulk SEO Writer`);
console.log(`═══════════════════════════════════════════════════════════════`);
console.log(`  Mode:           ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (will write to Shopify)'}`);
console.log(`  Store:          ${SHOPIFY_STORE_DOMAIN}`);
console.log(`  API version:    ${SHOPIFY_API_VERSION}`);
console.log(`  Force regen:    ${FORCE ? 'yes' : 'no'}`);
console.log(`  Skip existing:  ${SKIP_EXISTING ? 'yes' : 'no'}`);
console.log(`  Limit:          ${LIMIT || 'no limit'}`);
console.log(`  Max title len:  ${MAX_TITLE_LEN}`);
console.log(`  Max desc len:   ${MAX_DESC_LEN}`);
console.log(`  LLM concurrency: ${LLM_CONCURRENCY}`);
console.log(`═══════════════════════════════════════════════════════════════\n`);

// ─── Resolve z-ai-web-dev-sdk ───────────────────────────────────────────────
// Try local node_modules first, then fall back to bun's global install.
// The SDK is exported as a CommonJS module with `default` being the
// constructor function that has `.create()`. So `require('z-ai-web-dev-sdk')`
// returns `{ __esModule: true, default: [Function] }` — we need `.default`.
function resolveZaiSdk() {
  const require = createRequire(import.meta.url);
  const candidates = [
    'z-ai-web-dev-sdk',
    '/home/z/.bun/install/global/node_modules/z-ai-web-dev-sdk',
  ];
  for (const p of candidates) {
    try {
      const mod = require(p);
      // Handle both shapes: `{ default: fn }` (CommonJS interop) and `fn` directly
      return mod.default || mod;
    } catch {
      // try next
    }
  }
  throw new Error(
    'Could not resolve z-ai-web-dev-sdk. Install it locally with `npm i z-ai-web-dev-sdk` or ensure the global bun install is accessible.'
  );
}

const ZAI = resolveZaiSdk();
const zai = await ZAI.create();

// ─── Shopify Admin API helpers ──────────────────────────────────────────────
async function shopifyFetch(path, init = {}) {
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
    throw new Error(`Shopify ${init.method || 'GET'} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function fetchAllProducts() {
  const all = [];
  let path = `/products.json?limit=250&fields=id,handle,title,product_type,body_html,tags,vendor,seo_title,seo_description,options`;
  let pageCount = 0;
  while (path) {
    const data = await shopifyFetch(path);
    const products = data.products || [];
    all.push(...products);
    pageCount++;
    console.log(`  fetched page ${pageCount}: ${products.length} products (total: ${all.length})`);
    // Shopify REST pagination uses Link header — extract next page_info
    // We need to use the response object, so re-fetch with parse:
    // Simpler: use page_info-based URL reconstruction. Shopify's response
    // doesn't include pagination cursor in body; we need to capture headers.
    // Re-do this properly below.
    break; // placeholder — real pagination handled in fetchAllProductsV2
  }
  return all;
}

// Shopify REST pagination uses the Link header (rel="next").
// We need raw response access, so use a lower-level fetch here.
async function fetchAllProductsV2() {
  const all = [];
  let url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250&fields=id,handle,title,product_type,body_html,tags,vendor,seo_title,seo_description,options`;
  let pageCount = 0;
  while (url) {
    const res = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Shopify GET products → ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = await res.json();
    const products = data.products || [];
    all.push(...products);
    pageCount++;
    console.log(`  fetched page ${pageCount}: ${products.length} products (total: ${all.length})`);

    // Parse Link header for next page
    const link = res.headers.get('link') || '';
    const nextMatch = link.match(/<([^>]+)>;\s*rel="next"/);
    url = nextMatch ? nextMatch[1] : null;
  }
  return all;
}

async function writeProductSeo(productId, seoTitle, seoDescription) {
  return shopifyFetch(`/products/${productId}.json`, {
    method: 'PUT',
    body: JSON.stringify({
      product: {
        id: productId,
        // Shopify REST uses seo_title / seo_description (snake_case)
        // at the product top level — not the seo: { title, description }
        // shape used by the Storefront GraphQL API.
        seo_title: seoTitle,
        seo_description: seoDescription,
      },
    }),
  });
}

// ─── HTML stripping + truncation ────────────────────────────────────────────
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(s, max) {
  if (!s) return '';
  if (s.length <= max) return s;
  // Try to cut at last space before max
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.7 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

// ─── LLM SEO generation ─────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert SEO copywriter for LuxeMia, a luxury Indian ethnic wear store shipping to USA, Canada, and Australia. You write Shopify product SEO titles and meta descriptions that:

1. Rank well for high-intent keywords (product type + color + fabric + occasion)
2. Read naturally — never keyword-stuffed
3. Are unique per product — never template-driven
4. Match search intent (commercial / transactional)
5. Stay within length limits:
   - SEO title: 50–60 characters (max 60). Do NOT append " | LuxeMia" — the script will handle that.
   - SEO description: 140–155 characters (max 155)
6. Include a soft CTA when space allows ("Shop now", "Free shipping", etc.)
7. Avoid marketing fluff like "stunning", "exquisite", "beautiful" unless genuinely distinctive
8. Use the customer's language: "bridal lehenga", "silk saree", "sharara suit", not internal jargon

Respond ONLY with valid JSON — no markdown, no explanation. Format:
{"seo_title":"...","seo_description":"..."}`;

function buildUserPrompt(product) {
  const desc = stripHtml(product.body_html).slice(0, 600);
  const tags = (product.tags || '').split(',').map(t => t.trim()).filter(Boolean).slice(0, 12);
  const options = (product.options || [])
    .filter(o => o.name && o.values && o.values.length)
    .map(o => `${o.name}: ${o.values.slice(0, 6).join('/')}`)
    .join('; ');
  const vendor = product.vendor || '';

  return `Generate SEO title + description for this Shopify product.

PRODUCT DATA:
- Title: ${product.title}
- Type: ${product.product_type || '(unspecified)'}
- Vendor: ${vendor}
- Tags: ${tags.join(', ')}
- Options: ${options}
- Body description (first 600 chars): ${desc}

REQUIREMENTS:
- SEO title must mention the most distinctive feature (color + fabric + product type).
- SEO description must include the product type + key feature + soft CTA.
- Do NOT include " | LuxeMia" in the title — it's appended automatically.
- Return ONLY JSON.`;
}

async function generateSeo(product, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(product) },
        ],
        thinking: { type: 'disabled' },
      });
      let raw = completion.choices?.[0]?.message?.content || '';
      // Strip any markdown fences the model might add despite instructions
      raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(raw);
      let seoTitle = (parsed.seo_title || '').trim();
      let seoDesc = (parsed.seo_description || '').trim();

      // Hard truncate if over limit (LLMs sometimes off-by-a-few)
      seoTitle = truncate(seoTitle, MAX_TITLE_LEN);
      seoDesc = truncate(seoDesc, MAX_DESC_LEN);

      return { seo_title: seoTitle, seo_description: seoDesc };
    } catch (err) {
      if (attempt < retries) {
        console.log(`    ⚠️  LLM attempt ${attempt + 1} failed: ${err.message}. Retrying...`);
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      throw new Error(`LLM failed after ${retries + 1} attempts: ${err.message}`);
    }
  }
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
        results[i] = { error: err.message };
      }
      completed++;
      if (completed % 10 === 0 || completed === total) {
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
  console.log('\n▼ Fetching all products from Shopify Admin API...\n');
  const products = await fetchAllProductsV2();
  console.log(`\n  Total products fetched: ${products.length}\n`);

  // Filter: which products need SEO generation?
  let targets = products;
  if (SKIP_EXISTING && !FORCE) {
    targets = products.filter(p => {
      const t = (p.seo_title || '').trim();
      const d = (p.seo_description || '').trim();
      // Heuristic: skip if both fields are non-empty AND non-default
      // (default = matches Shopify's auto-generated "{title}" pattern)
      return !t || !d || t === p.title;
    });
    console.log(`  After --skip-existing filter: ${targets.length} products need SEO generation\n`);
  }
  if (LIMIT > 0) {
    targets = targets.slice(0, LIMIT);
    console.log(`  After --limit=${LIMIT}: ${targets.length} products\n`);
  }

  if (targets.length === 0) {
    console.log('  No products to process. Exiting.');
    return;
  }

  console.log(`▼ Generating SEO copy via LLM for ${targets.length} products (concurrency: ${LLM_CONCURRENCY})...\n`);
  const generated = await runWithConcurrency(
    targets,
    async (product) => {
      try {
        const seo = await generateSeo(product);
        // Append " | LuxeMia" to title if it doesn't already contain "LuxeMia"
        // AND if there's room. This matches the existing prerender fallback template.
        let finalTitle = seo.seo_title;
        if (!/luxemia/i.test(finalTitle)) {
          const withSuffix = `${finalTitle} | ${SHOP_NAME}`;
          finalTitle = withSuffix.length <= MAX_TITLE_LEN ? withSuffix : finalTitle;
        }
        return {
          product,
          before: { seo_title: product.seo_title || '', seo_description: product.seo_description || '' },
          after: { seo_title: finalTitle, seo_description: seo.seo_description },
        };
      } catch (err) {
        return { product, error: err.message };
      }
    },
    LLM_CONCURRENCY
  );

  const ok = generated.filter(g => g.after);
  const failed = generated.filter(g => g.error);
  console.log(`\n  Generated: ${ok.length} | Failed: ${failed.length}\n`);

  if (failed.length > 0) {
    console.log('  Failures:');
    for (const f of failed.slice(0, 5)) {
      console.log(`    • ${f.product.handle}: ${f.error}`);
    }
    if (failed.length > 5) console.log(`    ... and ${failed.length - 5} more`);
  }

  // ─── Write back to Shopify ───
  let writeResults = [];
  if (DRY_RUN) {
    console.log(`\n▼ DRY RUN — skipping Shopify writes. (Use without --dry-run to actually write.)\n`);
    writeResults = ok.map(g => ({
      product_id: g.product.id,
      handle: g.product.handle,
      status: 'dry_run',
      before: g.before,
      after: g.after,
    }));
  } else {
    console.log(`\n▼ Writing SEO fields back to Shopify (concurrency: ${SHOPIFY_WRITE_CONCURRENCY})...\n`);
    writeResults = await runWithConcurrency(
      ok,
      async (g) => {
        try {
          await writeProductSeo(g.product.id, g.after.seo_title, g.after.seo_description);
          return {
            product_id: g.product.id,
            handle: g.product.handle,
            status: 'success',
            before: g.before,
            after: g.after,
          };
        } catch (err) {
          return {
            product_id: g.product.id,
            handle: g.product.handle,
            status: 'error',
            error: err.message,
            before: g.before,
            after: g.after,
          };
        }
      },
      SHOPIFY_WRITE_CONCURRENCY
    );
  }

  // ─── Write audit CSV ───
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const csvPath = join('/home/z/my-project/download', `shopify-seo-changes-${ts}.csv`);
  mkdirSync('/home/z/my-project/download', { recursive: true });

  const csvRows = [
    'product_id,handle,status,before_seo_title,before_seo_description,after_seo_title,after_seo_description,error',
  ];
  for (const r of writeResults) {
    const esc = v => `"${String(v || '').replace(/"/g, '""')}"`;
    csvRows.push([
      r.product_id,
      r.handle,
      r.status,
      r.before?.seo_title || '',
      r.before?.seo_description || '',
      r.after?.seo_title || '',
      r.after?.seo_description || '',
      r.error || '',
    ].map(esc).join(','));
  }
  writeFileSync(csvPath, csvRows.join('\n'));

  // ─── Summary ───
  const successCount = writeResults.filter(r => r.status === 'success' || r.status === 'dry_run').length;
  const errorCount = writeResults.filter(r => r.status === 'error').length;

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`  SUMMARY`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`  Total products:   ${products.length}`);
  console.log(`  Processed:        ${targets.length}`);
  console.log(`  ${DRY_RUN ? 'Would write' : 'Wrote'}:      ${successCount}`);
  console.log(`  Errors:           ${errorCount}`);
  console.log(`  Audit CSV:        ${csvPath}`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);

  // Print a few sample before/after for visual review
  console.log('Sample before/after (first 5):\n');
  for (const r of writeResults.slice(0, 5)) {
    console.log(`  ${r.handle}`);
    console.log(`    BEFORE title: ${r.before?.seo_title || '(empty)'}`);
    console.log(`    AFTER  title: ${r.after?.seo_title || '(error)'}`);
    console.log(`    BEFORE desc:  ${(r.before?.seo_description || '(empty)').slice(0, 100)}`);
    console.log(`    AFTER  desc:  ${(r.after?.seo_description || '').slice(0, 100)}`);
    console.log('');
  }
}

main().catch(err => {
  console.error('\nFATAL:', err);
  process.exit(1);
});
