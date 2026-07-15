#!/usr/bin/env node
/**
 * fix-product-quality.mjs
 *
 * Auto-fixes Shopify product data quality issues identified in the audit:
 *   - P0: Type mismatches (title says "Saree" but product_type is wrong)
 *   - P0: Watermark brand references (lapink etc. — REPORTED, not auto-fixed)
 *   - P1: Title cleanup (remove " | LuxeMia" suffix, remove SKU codes, fix ALL CAPS)
 *   - P1: Missing color tags (title says "Green" but tags don't include "green")
 *   - P2: Vendor standardization (luxemia.shop / Luxemia / Premium Ethnic → LuxeMia)
 *   - P2: Tag cleanup (remove numeric values from tags)
 *   - P2: Title whitespace (leading/trailing/double spaces)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PREREQUISITES
 * ─────────────────────────────────────────────────────────────────────────────
 * - SHOPIFY_ADMIN_ACCESS_TOKEN env var (Admin API token with write_products scope)
 *   Create at: Shopify Admin → Apps → Develop apps → [your app] → API credentials
 *   Scopes needed: write_products, read_products
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *   # Dry run — fetch all products, compute fixes, log before/after, NO writes
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node scripts/fix-product-quality.mjs
 *
 *   # Dry run + limit to N products (for testing)
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node scripts/fix-product-quality.mjs --limit=20
 *
 *   # Apply fixes to Shopify (LIVE)
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node scripts/fix-product-quality.mjs --apply
 *
 *   # Apply only specific fix categories
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node scripts/fix-product-quality.mjs --apply --only=type,title,vendor
 *
 *   # Skip specific fix categories
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node scripts/fix-product-quality.mjs --apply --skip=tags
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FIX CATEGORIES
 * ─────────────────────────────────────────────────────────────────────────────
 *   type      — Fix product_type to match what the title says (P0)
 *   title     — Remove " | LuxeMia" suffix, SKU codes, fix ALL CAPS, whitespace (P1)
 *   color     — Add missing color to tags when title mentions a color not in tags (P1)
 *   vendor    — Standardize vendor to "LuxeMia" (P2)
 *   tags      — Remove numeric values from tags (P2)
 *
 * ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 * SAFETY
 * ─────────────────────────────────────────────────────────────────────────────
 * - DRY RUN BY DEFAULT. The script will not write anything unless --apply is passed.
 * - All changes logged to /home/z/my-project/download/shopify-quality-fixes-<timestamp>.csv
 * - Concurrency limited to 2 parallel writes to avoid Shopify rate limits (429s)
 * - If a fix would change a product_type to something already correct, it's skipped
 * - Watermark brand issues (lapink etc.) are REPORTED ONLY, not auto-fixed
 *   (those need the founder to manually review and replace the image)
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// ─── Config ─────────────────────────────────────────────────────────────────
const SHOPIFY_STORE_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';

// Concurrency for Shopify Admin API writes. Keep low to avoid 429s.
const SHOPIFY_WRITE_CONCURRENCY = 2;
// Page size for fetching products (Shopify max is 250)
const SHOPIFY_PAGE_SIZE = 250;
// Delay between page fetches to respect rate limits (ms)
const PAGE_DELAY_MS = 500;

// ─── CLI args ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const LIMIT_ARG = args.find(a => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : 0;
const ONLY_ARG = args.find(a => a.startsWith('--only='));
const SKIP_ARG = args.find(a => a.startsWith('--skip='));

const ONLY = ONLY_ARG ? ONLY_ARG.split('=')[1].split(',').map(s => s.trim()) : null;
const SKIP = SKIP_ARG ? SKIP_ARG.split('=')[1].split(',').map(s => s.trim()) : [];

const ALL_FIXES = ['type', 'title', 'color', 'vendor', 'tags'];
const ACTIVE_FIXES = (ONLY || ALL_FIXES).filter(f => !SKIP.includes(f));

if (!SHOPIFY_ADMIN_TOKEN) {
  console.error('ERROR: SHOPIFY_ADMIN_ACCESS_TOKEN env var is required.');
  console.error('Create a Shopify Admin API token with write_products scope at:');
  console.error('  Shopify Admin → Apps → Develop apps → [your app] → API credentials');
  console.error('  → Admin API access token (scopes: write_products, read_products)');
  console.error('');
  console.error('Usage:');
  console.error('  SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node scripts/fix-product-quality.mjs [--apply] [--limit=N] [--only=type,title] [--skip=tags]');
  process.exit(1);
}

console.log(`\n═══════════════════════════════════════════════════════════════`);
console.log(`  LuxeMia Product Quality Auto-Fixer`);
console.log(`═══════════════════════════════════════════════════════════════`);
console.log(`  Mode:             ${APPLY ? 'LIVE (will write to Shopify)' : 'DRY RUN (no writes)'}`);
console.log(`  Store:            ${SHOPIFY_STORE_DOMAIN}`);
console.log(`  API version:      ${SHOPIFY_API_VERSION}`);
console.log(`  Active fixes:     ${ACTIVE_FIXES.join(', ')}`);
console.log(`  Limit:            ${LIMIT || 'no limit'}`);
console.log(`  Write concurrency: ${SHOPIFY_WRITE_CONCURRENCY}`);
console.log(`═══════════════════════════════════════════════════════════════\n`);

// ─── Color dictionary ────────────────────────────────────────────────────────
const COLOR_SYNONYMS = {
  maroon: 'maroon', wine: 'wine', burgundy: 'wine', red: 'red',
  pink: 'pink', rani: 'pink', rose: 'pink', magenta: 'pink', fuchsia: 'pink',
  peach: 'peach', coral: 'peach',
  orange: 'orange', rust: 'orange', burnt: 'orange',
  yellow: 'yellow', mustard: 'yellow', haldi: 'yellow',
  green: 'green', olive: 'green', emerald: 'green', mint: 'green',
  teal: 'teal', turquoise: 'teal', turquiose: 'teal',
  blue: 'blue', navy: 'blue', 'royal blue': 'blue', 'sky blue': 'blue', 'dusty blue': 'blue', 'powder blue': 'blue', indigo: 'blue',
  purple: 'purple', lavender: 'purple', violet: 'purple', mauve: 'purple', plum: 'purple', eggplant: 'purple',
  white: 'white', ivory: 'white', cream: 'white', 'off white': 'white', beige: 'white',
  black: 'black', grey: 'grey', gray: 'grey',
  gold: 'gold', golden: 'gold', champagne: 'gold', copper: 'gold',
  brown: 'brown',
  multi: 'multi', multicolor: 'multi', 'multi color': 'multi', multicolour: 'multi',
};

// ─── Type detection patterns ─────────────────────────────────────────────────
const TYPE_PATTERNS = [
  { type: 'Lehenga Choli',       patterns: [/\blehenga\b/i, /\bghagra\b/i],                   productTypeContains: 'lehenga' },
  { type: 'Saree',               patterns: [/\bsaree\b/i, /\bsari\b/i],                       productTypeContains: 'saree' },
  { type: 'Sharara Suit',        patterns: [/\bsharara\b/i],                                   productTypeContains: 'sharara' },
  { type: 'Palazzo Suit',        patterns: [/\bpalazzo\b/i],                                   productTypeContains: 'palazzo' },
  { type: 'Anarkali Suit',       patterns: [/\banarkali\b/i],                                  productTypeContains: 'anarkali' },
  { type: 'Salwar Suit',         patterns: [/\bsalwar\b/i, /\bkameez\b/i],                    productTypeContains: 'salwar' },
  { type: 'Sherwani',            patterns: [/\bsherwani\b/i],                                  productTypeContains: 'sherwani' },
  { type: "Men's Kurta",         patterns: [/\bkurta\b/i, /\bkurta\s+pajama\b/i],             productTypeContains: 'kurta' },
  { type: 'Saree Gown',          patterns: [/\bsaree\s+gown\b/i, /\bgown\b/i],                productTypeContains: 'gown' },
  { type: 'Jewelry Set',         patterns: [/\bkundan\b/i, /\bnecklace\b/i, /\bchoker\b/i, /\bjewelry\b/i, /\bjewellery\b/i], productTypeContains: 'jewel' },
];

// Standard vendors — only "LuxeMia" is acceptable
const STANDARD_VENDOR = 'LuxeMia';

// Watermark brands — REPORTED ONLY, never auto-fixed
const WATERMARK_BRANDS = ['lapink', 'la pink', 'la-pink'];

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

async function fetchAllProducts() {
  console.log(`▼ Fetching all products from Shopify...\n`);
  const all = [];
  let page = 1;
  let lastCount = 0;
  while (true) {
    if (page > 1) {
      await new Promise(r => setTimeout(r, PAGE_DELAY_MS));
    }
    const data = await shopifyAdminFetch(
      `/products.json?limit=${SHOPIFY_PAGE_SIZE}&page=${page}&fields=id,handle,title,body_html,vendor,product_type,tags,images,options,variants`
    );
    const products = data.products || [];
    console.log(`  page ${page}: ${products.length} products`);
    all.push(...products);
    lastCount = products.length;
    if (products.length < SHOPIFY_PAGE_SIZE) break;
    page++;
    if (page > 10) {
      console.log(`  ⚠️  Hit safety cap of 10 pages; stopping.`);
      break;
    }
  }
  console.log(`\n  ✓ Total fetched: ${all.length}\n`);
  return all;
}

async function updateProduct(productId, updates) {
  return shopifyAdminFetch(`/products/${productId}.json`, {
    method: 'PUT',
    body: JSON.stringify({ product: { id: productId, ...updates } }),
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
      if (completed % 10 === 0 || completed === total) {
        process.stdout.write(`\r  progress: ${completed}/${total} `);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  process.stdout.write('\n');
  return results;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function parseTags(tags) {
  if (Array.isArray(tags)) return tags.map(t => t.trim()).filter(Boolean);
  if (typeof tags === 'string') {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
}

function extractColorFromText(text) {
  if (!text) return null;
  const textLower = text.toLowerCase();
  // Sort synonyms by length descending so multi-word ones match first
  const sorted = Object.keys(COLOR_SYNONYMS).sort((a, b) => b.length - a.length);
  for (const syn of sorted) {
    const pattern = new RegExp(`(?:^|[^a-z])${escapeRegex(syn)}(?:[^a-z]|$)`, 'i');
    if (pattern.test(textLower)) {
      return COLOR_SYNONYMS[syn];
    }
  }
  return null;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function detectTypeFromTitle(title) {
  if (!title) return null;
  for (const { type, patterns } of TYPE_PATTERNS) {
    for (const pat of patterns) {
      if (pat.test(title)) return type;
    }
  }
  return null;
}

function isMenswear(product) {
  const pt = (product.product_type || '').toLowerCase();
  const tags = parseTags(product.tags).map(t => t.toLowerCase());
  const title = (product.title || '').toLowerCase();
  if (pt === 'menswear' || pt === 'sherwani' || pt === "men's kurta") return true;
  if (tags.some(t => ['menswear', 'sherwani', 'groom', "men's-kurta", 'kurta-pyjama', 'ethnic-menswear'].includes(t))) return true;
  if (/\bsherwani\b/.test(title) || /\bkurta\s+pajama\b/.test(title)) return true;
  return false;
}

function titleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Fixers ─────────────────────────────────────────────────────────────────
// Each fixer returns { changes: { field: newValue }, notes: [strings] } or null if no fix needed.

function fixType(product) {
  const title = (product.title || '').trim();
  const currentType = (product.product_type || '').trim();
  if (!title || !currentType) return null;

  const detectedType = detectTypeFromTitle(title);
  if (!detectedType) return null;

  const currentLower = currentType.toLowerCase();
  const detectedLower = detectedType.toLowerCase();
  const titleLower = title.toLowerCase();

  // If current type already matches detected type (loose match), no fix needed
  if (currentLower.includes(detectedLower) || detectedLower.includes(currentLower)) {
    return null;
  }

  // ─── GUARD: Skip when current type is modern/acceptable and title mentions modern silhouettes ───
  // "Indo Western Set", "Crop Top + Palazzo", "Designer Set", "Party Wear Set" are intentional
  // modern classifications that may include palazzo/sharara/anarkali silhouettes as components.
  // Don't override these with the legacy "Palazzo Suit" / "Sharara Suit" / "Anarkali Suit" types.
  // "Lehenga Saree" is a real hybrid product type (saree with lehenga-style flare) — preserve it.
  const MODERN_TYPES = new Set([
    'indo western set', 'indo-western', 'indo western', 'designer set',
    'party wear set', 'festive set', 'ethnic set', 'suit set', 'skirt set',
    'lehenga saree', 'saree gown',
  ]);
  if (MODERN_TYPES.has(currentLower)) {
    return null;
  }

  // ─── GUARD: If title explicitly mentions "Indo Western", "Crop Top", "Gown" — don't change type ───
  // (these are intentional design classifications, not type mismatches)
  if (/\bindo\s+western\b/i.test(title) || /\bcrop\s+top\b/i.test(title)) {
    return null;
  }

  // ─── ALLOWED: Generic types that should be upgraded ───
  // "Indian Ethnic Wear", "Menswear", "Ethnic Wear" are too generic — replace with detected type
  const GENERIC_TYPES = new Set([
    'indian ethnic wear', 'ethnic wear', 'menswear', 'occasional', 'occasional wear',
    'ethnic', 'clothing', 'apparel',
  ]);
  const isCurrentGeneric = GENERIC_TYPES.has(currentLower);

  // ─── ALLOWED: Egregious mismatches (clearly wrong type) ───
  // Saree vs Lehenga, Sherwani vs Menswear, Kurta vs Menswear, etc.
  const EGREGIOUS_PAIRS = [
    // title says X, current type is Y — both wrong
    { detected: 'saree',            currentContains: 'lehenga' },
    { detected: 'lehenga choli',    currentContains: 'saree' },
    { detected: 'sherwani',         currentContains: 'menswear' },
    { detected: "men's kurta",      currentContains: 'menswear' },
    { detected: 'sherwani',         currentContains: 'kurta' }, // sherwani is more specific than kurta
    { detected: 'saree gown',       currentContains: 'lehenga' },
    { detected: 'saree gown',       currentContains: 'suit' },
    { detected: 'jewelry set',      currentContains: 'lehenga' },
    { detected: 'jewelry set',      currentContains: 'saree' },
    { detected: 'jewelry set',      currentContains: 'suit' },
  ];
  const isEgregious = EGREGIOUS_PAIRS.some(p =>
    detectedLower === p.detected && currentLower.includes(p.currentContains)
  );

  if (!isCurrentGeneric && !isEgregious) {
    return null;
  }

  return {
    changes: { product_type: detectedType },
    notes: [`product_type: "${currentType}" → "${detectedType}"`],
  };
}

function fixTitle(product) {
  const title = (product.title || '').trim();
  if (!title) return null;

  let newTitle = title;
  const notes = [];

  // Remove " | LuxeMia" / " — LuxeMia" / " - LuxeMia" suffix
  const suffixMatch = newTitle.match(/\s+[|\-–—]\s+LuxeMia\s*$/i);
  if (suffixMatch) {
    newTitle = newTitle.replace(/\s+[|\-–—]\s+LuxeMia\s*$/i, '');
    notes.push(`removed " | LuxeMia" suffix`);
  }

  // Remove SKU codes like "393994-UN-XS" or "(393994-UN-XS)"
  const skuMatch = newTitle.match(/\s*[-—]?\s*(?:Luxemia\s*[—-]\s*)?(?:Pink|Purple|Blue|Green|...)\s*[—-]\s*[A-Za-z]+\s*Edition\s*\(\d+-\w+-\w+\)/i);
  // Simpler: catch patterns like " — Style 2" at end
  const styleMatch = newTitle.match(/\s+[—-]\s+Style\s+\d+$/i);
  if (styleMatch) {
    newTitle = newTitle.replace(/\s+[—-]\s+Style\s+\d+$/i, '');
    notes.push(`removed " — Style N" suffix`);
  }

  // Catch SKU codes like "393994-UN-XS" embedded in title
  const codeMatch = newTitle.match(/\s+\(\d{5,}-\w+-\w+\)/);
  if (codeMatch) {
    newTitle = newTitle.replace(/\s+\(\d{5,}-\w+-\w+\)/g, '');
    notes.push(`removed SKU code "(123456-UN-XS)"`);
  }
  // Also handle without parens: " — Pink — Casual Edition (394289-UN-XS)"
  const editionMatch = newTitle.match(/\s+[—-]\s+\w+\s+[—-]\s+\w+\s+Edition\s*\(\d+-\w+-\w+\)/i);
  if (editionMatch) {
    newTitle = newTitle.replace(/\s+[—-]\s+\w+\s+[—-]\s+\w+\s+Edition\s*\(\d+-\w+-\w+\)/gi, '');
    notes.push(`removed " — Color — Edition (SKU)" suffix`);
  }
  // Generic: any "(NNNNNN-XX-XX)" pattern
  const genericCodeMatch = newTitle.match(/\s+\(\d{5,}-[^)]+\)/);
  if (genericCodeMatch) {
    newTitle = newTitle.replace(/\s+\(\d{5,}-[^)]+\)/g, '');
    notes.push(`removed numeric code suffix`);
  }

  // Fix ALL CAPS titles (>10 chars, looks spammy)
  if (newTitle.length > 10 && newTitle === newTitle.toUpperCase() && /[A-Z]{4}/.test(newTitle)) {
    newTitle = titleCase(newTitle);
    notes.push(`converted ALL CAPS to Title Case`);
  }

  // Fix whitespace
  const trimmed = newTitle.trim();
  if (trimmed !== newTitle) {
    newTitle = trimmed;
    notes.push(`trimmed whitespace`);
  }
  if (/\s{2,}/.test(newTitle)) {
    newTitle = newTitle.replace(/\s{2,}/g, ' ');
    notes.push(`collapsed double spaces`);
  }

  if (newTitle === title) return null;
  return { changes: { title: newTitle }, notes };
}

function fixColor(product) {
  const title = product.title || '';
  const tags = parseTags(product.tags);
  if (!title) return null;

  const titleColor = extractColorFromText(title);
  if (!titleColor) return null;

  // Check if title color (or a synonym) already in tags
  const tagsLower = tags.map(t => t.toLowerCase());
  const hasColorInTags = Object.entries(COLOR_SYNONYMS)
    .filter(([syn, canon]) => canon === titleColor)
    .some(([syn]) => tagsLower.includes(syn));

  if (hasColorInTags) return null;

  // Add the canonical color to tags
  const newTags = [...tags, titleColor];
  return {
    changes: { tags: newTags.join(', ') },
    notes: [`added "${titleColor}" to tags (title mentions this color)`],
  };
}

function fixVendor(product) {
  const vendor = (product.vendor || '').trim();
  if (!vendor || vendor === STANDARD_VENDOR) return null;
  return {
    changes: { vendor: STANDARD_VENDOR },
    notes: [`vendor: "${vendor}" → "${STANDARD_VENDOR}"`],
  };
}

function fixTags(product) {
  const tags = parseTags(product.tags);
  if (tags.length === 0) return null;

  // Remove tags that are pure numbers or look like size codes (e.g., "38", "40", "44\"")
  // Also remove obvious size-like values that leaked into tags
  const sizeValues = new Set(['xs', 's', 'm', 'l', 'xl', 'xxl', '3xl', '4xl', '5xl', '6xl',
    '32', '34', '36', '38', '40', '42', '44', '46', '48', '50',
    '32"', '34"', '36"', '38"', '40"', '42"', '44"', '46"', '48"',
    'work36', 'work38', 'work40', 'work42', 'work44',
  ]);

  const cleanedTags = tags.filter(t => {
    const tLower = t.toLowerCase().trim();
    // Skip if it's a size value
    if (sizeValues.has(tLower)) return false;
    // Skip if it's a pure number
    if (/^\d+$/.test(tLower)) return false;
    // Skip if it looks like "36-" or "size-38" patterns
    if (/^(size[-_]?)?\d{2}"?$/.test(tLower)) return false;
    // Skip if it's a numeric code like "393994-UN-XS"
    if (/^\d{5,}-\w+-\w+$/.test(tLower)) return false;
    return true;
  });

  if (cleanedTags.length === tags.length) return null;
  const removed = tags.filter(t => !cleanedTags.includes(t));
  return {
    changes: { tags: cleanedTags.join(', ') },
    notes: [`removed ${removed.length} numeric/size tag(s): ${removed.slice(0, 5).join(', ')}${removed.length > 5 ? '...' : ''}`],
  };
}

// ─── Watermark brand detection (REPORTED ONLY, never auto-fixed) ──────────────
function detectWatermarkBrand(product) {
  const title = (product.title || '').toLowerCase();
  const tags = parseTags(product.tags).map(t => t.toLowerCase()).join(' ');
  const images = product.images || [];
  const firstImageSrc = images[0]?.src || '';
  const imageLower = firstImageSrc.toLowerCase();
  for (const brand of WATERMARK_BRANDS) {
    if (title.includes(brand) || tags.includes(brand) || imageLower.includes(brand)) {
      return brand;
    }
  }
  return null;
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  // 1. Fetch all products
  const products = await fetchAllProducts();
  const targetProducts = LIMIT > 0 ? products.slice(0, LIMIT) : products;
  console.log(`\n▼ Analyzing ${targetProducts.length} products for fixes...\n`);

  // 2. Compute fixes for each product
  const fixers = {
    type:   { fn: fixType,   label: 'Product Type (P0)' },
    title:  { fn: fixTitle,  label: 'Title Cleanup (P1)' },
    color:  { fn: fixColor,  label: 'Add Color Tag (P1)' },
    vendor: { fn: fixVendor, label: 'Vendor Standardization (P2)' },
    tags:   { fn: fixTags,   label: 'Tag Cleanup (P2)' },
  };

  const activeFixers = Object.entries(fixers).filter(([key]) => ACTIVE_FIXES.includes(key));

  const plannedChanges = [];
  const watermarkReports = [];
  const fixCounts = {};

  for (const product of targetProducts) {
    // Check watermark brand first (report-only)
    const watermark = detectWatermarkBrand(product);
    if (watermark) {
      watermarkReports.push({
        product_id: product.id,
        handle: product.handle,
        title: product.title,
        watermark_brand: watermark,
        image_url: product.images?.[0]?.src || '',
        product_url: `https://luxemia.shop/product/${product.handle}`,
      });
    }

    // Apply each active fixer, merging changes
    const mergedChanges = {};
    const allNotes = [];
    const fixesApplied = [];

    for (const [key, fixer] of activeFixers) {
      const result = fixer.fn(product);
      if (result) {
        Object.assign(mergedChanges, result.changes);
        allNotes.push(...result.notes);
        fixesApplied.push(key);
        fixCounts[key] = (fixCounts[key] || 0) + 1;
      }
    }

    if (Object.keys(mergedChanges).length > 0) {
      plannedChanges.push({
        product_id: product.id,
        handle: product.handle,
        product_url: `https://luxemia.shop/product/${product.handle}`,
        before: {
          title: product.title,
          product_type: product.product_type,
          vendor: product.vendor,
          tags: product.tags,
        },
        after: mergedChanges,
        notes: allNotes,
        fixes_applied: fixesApplied,
      });
    }
  }

  // 3. Print summary
  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`  PLANNED CHANGES`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`  Total products analyzed:    ${targetProducts.length}`);
  console.log(`  Products needing fixes:     ${plannedChanges.length}`);
  console.log(`  Watermark brand reports:    ${watermarkReports.length} (REPORTED ONLY — needs manual review)`);
  console.log(`  `);
  console.log(`  Fixes by category:`);
  for (const [key, fixer] of activeFixers) {
    console.log(`    ${fixer.label.padEnd(36)} ${fixCounts[key] || 0} products`);
  }
  console.log(`═══════════════════════════════════════════════════════════════\n`);

  // 4. Sample before/after (first 10)
  if (plannedChanges.length > 0) {
    console.log(`Sample planned changes (first 10):\n`);
    for (const pc of plannedChanges.slice(0, 10)) {
      console.log(`  ▼ ${pc.handle}`);
      console.log(`    ${pc.product_url}`);
      for (const note of pc.notes) {
        console.log(`    • ${note}`);
      }
      console.log('');
    }
    if (plannedChanges.length > 10) {
      console.log(`  ... and ${plannedChanges.length - 10} more (see audit CSV for full list)\n`);
    }
  }

  // 5. Watermark reports
  if (watermarkReports.length > 0) {
    console.log(`\n⚠️  WATERMARK BRAND REFERENCES (manual review required):\n`);
    for (const w of watermarkReports) {
      console.log(`  • ${w.title}`);
      console.log(`    handle: ${w.handle}`);
      console.log(`    brand:  ${w.watermark_brand}`);
      console.log(`    image:  ${w.image_url}`);
      console.log(`    url:    ${w.product_url}`);
      console.log('');
    }
  }

  // 6. Apply or skip
  let writeResults = [];
  if (!APPLY) {
    console.log(`\n▼ DRY RUN — no changes written to Shopify.`);
    console.log(`  To apply these fixes, re-run with --apply flag:`);
    console.log(`  SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node scripts/fix-product-quality.mjs --apply\n`);
    writeResults = plannedChanges.map(pc => ({
      ...pc,
      status: 'dry_run',
    }));
  } else {
    console.log(`\n▼ APPLYING fixes to Shopify (concurrency: ${SHOPIFY_WRITE_CONCURRENCY})...\n`);
    writeResults = await runWithConcurrency(
      plannedChanges,
      async (pc) => {
        try {
          await updateProduct(pc.product_id, pc.after);
          return { ...pc, status: 'success' };
        } catch (err) {
          return { ...pc, status: 'error', error: err.message };
        }
      },
      SHOPIFY_WRITE_CONCURRENCY
    );

    const successCount = writeResults.filter(r => r.status === 'success').length;
    const errorCount = writeResults.filter(r => r.status === 'error').length;
    console.log(`\n  ✓ Success: ${successCount}`);
    console.log(`  ✗ Errors:  ${errorCount}`);

    if (errorCount > 0) {
      console.log(`\n  First 5 errors:`);
      for (const r of writeResults.filter(r => r.status === 'error').slice(0, 5)) {
        console.log(`    ${r.handle}: ${r.error}`);
      }
    }
  }

  // 7. Write audit CSV
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const csvOutPath = join('/home/z/my-project/download', `shopify-quality-fixes-${ts}.csv`);
  mkdirSync('/home/z/my-project/download', { recursive: true });

  const csvRows = [
    'handle,product_id,status,fixes_applied,notes,before_title,after_title,before_product_type,after_product_type,before_vendor,after_vendor,before_tags,after_tags,error',
  ];
  for (const r of writeResults) {
    const esc = v => `"${String(v || '').replace(/"/g, '""')}"`;
    csvRows.push([
      r.handle || '',
      r.product_id || '',
      r.status || '',
      (r.fixes_applied || []).join('|'),
      (r.notes || []).join('|'),
      r.before?.title || '',
      r.after?.title || '',
      r.before?.product_type || '',
      r.after?.product_type || '',
      r.before?.vendor || '',
      r.after?.vendor || '',
      r.before?.tags || '',
      r.after?.tags || '',
      r.error || '',
    ].map(esc).join(','));
  }
  // Also add watermark reports as rows with status="watermark_review"
  for (const w of watermarkReports) {
    const esc = v => `"${String(v || '').replace(/"/g, '""')}"`;
    csvRows.push([
      w.handle,
      w.product_id,
      'watermark_review',
      'watermark_brand',
      `Detected watermark brand: ${w.watermark_brand}`,
      w.title,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ].map(esc).join(','));
  }
  writeFileSync(csvOutPath, csvRows.join('\n'));

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`  AUDIT LOG`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`  Audit CSV: ${csvOutPath}`);
  console.log(`  Total rows: ${writeResults.length + watermarkReports.length}`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);
}

main().catch(err => {
  console.error('\nFATAL:', err);
  process.exit(1);
});
