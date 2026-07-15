# Shopify Admin Fixes Required

These fixes must be done in the **Shopify Admin** (not in code) to resolve remaining store issues.

---

## 1. Compare-at Prices — Now Fully Fixed in Code

The compare-at price issue had **5 root causes** — all have been fixed in code:

| Layer | Issue | Fix |
|-------|-------|-----|
| Storefront API queries | `compareAtPriceRange` not fetched | Added to both queries in `src/lib/shopify.ts` |
| ShopifyProduct interface | Missing `compareAtPriceRange` field | Added to type definition |
| sync-to-shopify | Variants created without `compare_at_price` | Added `compare_at_price` using `original_price_usd` |
| ProductCard / ProductInfo | No rendering of strikethrough prices | Added strikethrough + % off display |
| convertToShopifyFormat | `original_price_usd` dropped | Mapped to `compareAtPriceRange` and variant `compareAtPrice` |

### What you still need to do in Shopify Admin:

1. **Re-import the CSV** or **re-sync products** to ensure `compare_at_price` is set on existing Shopify variants
   - Go to **Products** → **Import** → Upload `public/luxemia_shopify_import.csv`
   - Check "Overwrite any current products that have the same handle"
2. **Or trigger the sync-to-shopify edge function** with `resetSync: true` to re-push all products with compare-at prices

---

## 2. Create Shopify Collections

Products are tagged with collection-friendly tags. Create **Smart Collections** in Shopify Admin:

| Collection | Condition | Handle |
|---|---|---|
| Sarees | Product tag = `Sarees` OR Product type = `Sarees` | `sarees` |
| Salwar Kameez | Product tag = `Salwar Kameez` OR Product type = `Salwar Kameez` | `salwar-kameez` |
| Menswear | Product tag = `Menswear` OR Product type = `Men's Indian Wear` | `menswear` |
| Lehengas | Product tag = `Lehenga` OR Product type = `Lehengas` | `lehengas` |
| Indo-Western | Product tag = `Indo-Western` OR Product type = `Indo Western` | `indo-western` |

---

## 3. Verify Navigation Menu

After creating collections, update the Shopify navigation menu at **Online Store > Navigation**:

| Menu Item | Link To |
|---|---|
| Sarees | `/collections/sarees` |
| Salwar Kameez | `/collections/salwar-kameez` |
| Menswear | `/collections/menswear` |
| Lehengas | `/collections/lehengas` |
| Indo-Western | `/collections/indo-western` |

---

## Code Changes Summary

### Files Modified (commit: April 2026)

| File | Change |
|---|---|
| `src/lib/shopify.ts` | Added `compareAtPriceRange` to ShopifyProduct type + both GraphQL queries |
| `src/components/ui/ProductCard.tsx` | Added strikethrough price + % off badge |
| `src/components/product/ProductInfo.tsx` | Added strikethrough + savings display on product detail |
| `src/components/product/StickyAddToBag.tsx` | Added compare-at price in mobile sticky bar |
| `src/hooks/useScrapedProducts.ts` | Map `original_price_usd` to `compareAtPriceRange` and variant `compareAtPrice` |
| `src/lib/scrapedProducts.ts` | Same mapping for legacy converter |
| `src/data/localProducts.ts` | Added `compareAtPriceRange` + `compareAtPrice` to ShopifyProductNode type |
| `supabase/functions/sync-to-shopify/index.ts` | Added `compare_at_price` to variants + `indowestern` category + `original_price_usd` to interface |
| `src/App.tsx` | Added redirects for `/collections/sarees`, `/collections/indo-western`, etc. |
| `src/components/home/ShopByOccasion.tsx` | Fixed broken `/collections/bridesmaid-dresses` link |
| `build_csv.py` | Already uses per-product INR×2÷90 pricing with compare-at at 1.43x |

---

## 4. Product Data Quality Auto-Fixer (NEW — July 2026)

A new script `scripts/fix-product-quality.mjs` automatically fixes Shopify product data quality issues identified in a comprehensive audit (1,132 issues across 528 of 613 products).

### What it fixes

| Fix | Severity | Description |
|---|---|---|
| `type` | P0 | Fixes product_type mismatches — e.g., "Saree" listed as "Lehenga Choli Set", "Sherwani" listed as "Menswear", "Indian Ethnic Wear" → "Lehenga Choli" |
| `title` | P1 | Removes " \| LuxeMia" suffix, " — Style N" suffix, embedded SKU codes like "(393994-UN-XS)", fixes ALL CAPS, collapses whitespace |
| `color` | P1 | Adds missing color to tags when title mentions a color not in tags (e.g., title says "Green Lehenga" but tags don't include "green") |
| `vendor` | P2 | Standardizes vendor to "LuxeMia" (currently mixed: "luxemia.shop", "Luxemia", "Premium Ethnic") |
| `tags` | P2 | Removes numeric values from tags (size codes that leaked in: "38", "40", "44\"" etc.) |

### What it does NOT fix (requires manual review)

- **Watermark brand references** (e.g., `lapink`) — script reports these in the audit log but does not auto-fix
- **Image supplier codes** (e.g., `CHAAVI-1083` in filename) — cosmetic only, not customer-visible
- **Handle suffixes** (e.g., `-7093`) — requires 301 redirects
- **Navratri tags** — founder decision (remove tags now OR add to Navratri collection later)
- **Description content** — descriptions are not auto-modified (too risky)

### How to run

```bash
# 1. Create Shopify Admin API token (one-time setup)
#    Shopify Admin → Settings → Apps → Develop apps → [your app] → API credentials
#    → Admin API access token (scopes: write_products, read_products)
#    Copy the shpat_xxx token

# 2. Dry run — fetch all products, compute fixes, log before/after, NO writes
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node scripts/fix-product-quality.mjs

# 3. Review the dry-run output + audit CSV at /home/z/my-project/download/shopify-quality-fixes-<timestamp>.csv

# 4. Apply fixes to Shopify (LIVE)
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx node scripts/fix-product-quality.mjs --apply

# Optional flags:
#   --limit=20            Only process first 20 products (for testing)
#   --only=type,title    Only run specific fix categories
#   --skip=tags          Skip specific fix categories
```

### Safety features

- **DRY RUN BY DEFAULT** — no changes written unless `--apply` flag is passed
- **Concurrency = 2** — respects Shopify Admin API rate limits
- **Before/after audit CSV** written to `/home/z/my-project/download/shopify-quality-fixes-<timestamp>.csv`
- **Conservative type fixer** — only fixes egregious mismatches (Saree ↔ Lehenga, Menswear → Sherwani/Kurta, generic → specific). Preserves modern types like "Indo Western Set", "Lehenga Saree", "Saree Gown".
- **Watermark reports** — flagged in audit log for manual image review

### Expected impact

Based on local dry-run against cached Shopify data (613 products):

| Fix | Products affected |
|---|---|
| Product Type (P0) | 18 |
| Title Cleanup (P1) | 107 |
| Add Color Tag (P1) | 252 |
| Vendor Standardization (P2) | 91 |
| Tag Cleanup (P2) | 1 |
| **Total products with at least 1 fix** | **361** |

### Re-running the audit

After applying fixes, the founder can request a re-run of the quality audit (script `09_quality_audit.py` in the agent's workspace) to verify all P0/P1 issues are resolved and identify any new issues.
