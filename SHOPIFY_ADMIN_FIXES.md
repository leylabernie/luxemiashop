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
