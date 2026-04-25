# Shopify Admin Fixes Required

These fixes must be done in the **Shopify Admin** (not in code) to resolve remaining store issues.

---

## 1. Compare-at Prices Not Showing (Strikethrough/Sale Display)

The CSV already has `Compare-at price` populated for every product (1.43x the selling price = ~30% off display). If strikethrough prices are not showing on the live store:

### Fix A: Re-import the CSV
1. Go to **Shopify Admin > Products**
2. Click **Import** (top right)
3. Upload `public/luxemia_shopify_import.csv`
4. Check "Overwrite any current products that have the same handle"
5. After import, verify products show both Price and Compare-at price

### Fix B: Check Theme Settings
1. Go to **Online Store > Themes > Customize**
2. Navigate to a product page
3. Ensure the product price block is configured to show "Compare at" price
4. Some themes require the **Compare at price** to be higher than **Price** AND the product must NOT be in a sale collection for it to display

### Fix C: Bulk Edit (if re-import doesn't work)
1. Go to **Products** > select all > **Bulk edit**
2. Add the "Compare at price" column
3. Verify values are present and higher than the selling price

---

## 2. Create Shopify Collections

Products are tagged with collection-friendly tags. Create **Smart Collections** in Shopify Admin:

### Collection 1: Sarees
- **Type**: Smart Collection
- **Condition**: Product tag = `Sarees` OR Product type = `Sarees`
- **Handle**: `sarees`

### Collection 2: Salwar Kameez
- **Type**: Smart Collection
- **Condition**: Product tag = `Salwar Kameez` OR Product type = `Salwar Kameez`
- **Handle**: `salwar-kameez`

### Collection 3: Menswear
- **Type**: Smart Collection
- **Condition**: Product tag = `Menswear` OR Product type = `Men's Indian Wear`
- **Handle**: `menswear`

### Collection 4: Lehengas
- **Type**: Smart Collection
- **Condition**: Product tag = `Lehenga` (if/when lehenga products are added)
- **Handle**: `lehengas`

### Collection 5: Indo-Western
- **Type**: Smart Collection
- **Condition**: Product tag = `Indo-Western`
- **Handle**: `indo-western`

---

## 3. Verify Navigation Menu

After creating collections, update the Shopify navigation menu:

1. Go to **Online Store > Navigation**
2. Edit the main menu
3. Ensure these links point to the correct Shopify collections:
   - **Sarees** → `/collections/sarees`
   - **Salwar Kameez** → `/collections/salwar-kameez`
   - **Menswear** → `/collections/menswear`
   - **Lehengas** → `/collections/lehengas`
   - **Indo-Western** → `/collections/indo-western`

> **Note**: The React frontend uses flat routes (`/sarees`, `/suits`, etc.) with redirects from `/collections/*`. These are separate from Shopify's native collection URLs.

---

## 4. Price Verification

All prices use the formula: **INR selling price x 2 / 90 = USD price (rounded to .99)**

Example verification:
| Product | INR Price | USD Formula | USD CSV | Compare-at |
|---------|-----------|-------------|---------|------------|
| Lycra Mauve Saree | 4,445 | 4445x2/90 = 98.78 → $98.99 | $98.99 | $141.56 |
| Silk Blue Saree | 13,095 | 13095x2/90 = 291 → $291.99 | $291.99 | $417.55 |
| Art Silk Grey Sherwani | 7,595 | 7595x2/90 = 168.78 → $168.99 | $168.99 | $241.66 |

---

## Quick Summary

| Issue | Status | Where to Fix |
|-------|--------|-------------|
| Compare-at prices in CSV | Fixed (populated) | Re-import CSV in Shopify Admin |
| Strikethrough display | Needs Shopify theme check | Shopify Admin > Themes |
| Collection pages 404 | Fixed (redirects added) | Code pushed to GitHub |
| Broken nav links | Fixed | Code pushed to GitHub |
| Duplicate product names | Fixed (unique IDs added) | Code pushed to GitHub |
| Per-product pricing | Fixed (INR x 2 / 90) | Code pushed to GitHub |
| Shopify collections | Need to create | Shopify Admin > Products > Collections |
