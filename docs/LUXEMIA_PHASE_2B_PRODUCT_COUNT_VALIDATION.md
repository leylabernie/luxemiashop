# LuxeMia Phase 2B Product Count Validation

## Executive summary

This audit validates the first 12 proposed buyer-intent collection pages from the Phase 2A roadmap before any new routes are built. No storefront routes, sitemap entries, robots entries, `llms.txt` entries, or Shopify integration code should be changed from this report alone.

Primary evidence used:

- Current storefront collection rules in `src/hooks/useShopifyProducts.ts`
- Current product filtering patterns in `src/lib/productFilters.ts`
- Shopify-facing product title and price records in `product_prices.json`
- Local product datasets in `src/data/localProducts.ts`, `src/data/sareeProducts.ts`, `src/data/suitProducts.ts`, and `src/data/menswearProducts.ts`
- Supporting SEO/product wording patterns in `src/data/*SeoData.json`

Audit rule:

- Recommend implementation only when the page has at least 3 honest matching products.
- Do not count generic words where the intent requires stronger evidence.
- Do not use `availableForSale` alone for Ready to Ship.
- Do not use broad festival terms for Navratri-style logic.
- Mark pages that depend on weak or missing tags as "Needs tagging cleanup first."

## Validation table

| Proposed page | Proposed route | Collection key | Matching rule | Estimated matching product count | Sample matching product titles / handles | False-positive risks | Decision | Reason |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| Ready to Wear | `/collections/ready-to-wear` | `ready-to-wear` | Require `readymade`, `ready to wear`, `ready-to-wear`, `pre-stitched`, `stitched`, or `pre-draped`; exclude unstitched products. | 63 Shopify-facing title matches in `product_prices.json`. | `Lycra Mauve Festival Wear Sequins Work Readymade Saree` / `lycra-mauve-festival-wear-sequins-work-readymade-saree-394402`; `Crepe Silk Multi Color Party Wear Embroidery Work Readymade Plazzo Suit` / `crepe-silk-multi-color-party-wear-embroidery-work-readymade-plazzo-suit-394469`; `Art Silk Grey Wedding Wear Hand Embroidery Readymade Groom Sherwani` / `art-silk-grey-wedding-wear-hand-embroidery-readymade-groom-sherwani-386005` | "Readymade" confirms stitched/ready-to-wear status, but not necessarily alteration needs or delivery speed. | Build now | Strong count, strong buyer intent, and the signal is visible in product titles rather than inferred from generic category text. |
| Ready to Ship | `/collections/ready-to-ship` | `ready-to-ship` | Require `ready to ship`, `ready-to-ship`, `in stock`, `ships fast`, `express`, or a reliable fulfillment timing tag. Do not use `availableForSale` alone. | 0 reliable timing matches. | None found with a reliable ship-timing signal. | High risk if built from availability alone because available products may still require processing, sourcing, stitching, or international fulfillment time. | Needs tagging cleanup first | Add explicit Shopify tags or metafields such as `ready-to-ship`, `ships-in-3-days`, or `in-stock-us` before building. |
| Sangeet Outfits | `/collections/sangeet-outfits` | `sangeet-outfits` | Non-menswear and non-bridal products with explicit `sangeet`, `dance`, `party wear`, `sequins`, `lightweight`, `sharara`, `anarkali`, or reception-adjacent styling. | 9 Shopify-facing title matches from `product_prices.json`; 39 additional fixture matches. | `Chinon Silk Wine Party Wear Embroidery Work Readymade Plazzo Suit` / `chinon-silk-wine-party-wear-embroidery-work-readymade-plazzo-suit-394466`; `Lycra Blue Festival Wear Sequins Work Readymade Saree` / `lycra-blue-festival-wear-sequins-work-readymade-saree-394401`; `Dusty Rose Silk Party Anarkali Suit` / `dusty-rose-silk-party-anarkali` | Generic "party wear" can be broader than Sangeet; matcher should prefer dance-friendly suits, shararas, sarees, anarkalis, sequins, and explicit Sangeet descriptions. | Build now | Clears the 3-product threshold with real title signals and has strong wedding-event SEO/conversion value. |
| Haldi Outfits | `/collections/haldi-outfits` | `haldi-outfits` | Require explicit `haldi` or yellow/mustard/lime-yellow plus ceremony, wedding, festive, saree, suit, anarkali, gown, or party-wear context. Do not include every yellow casual item. | 4 Shopify-facing title matches from `product_prices.json`; 7 additional fixture matches. | `Silk Yellow Wedding Wear Embroidery Work Saree` / `silk-yellow-wedding-wear-embroidery-work-saree-394441`; `Chinon Silk Lime Yellow Party Wear Embroidery Work Readymade Plazzo Suit` / `chinon-silk-lime-yellow-party-wear-embroidery-work-readymade-plazzo-suit-394465`; `Yellow Faux Georgette Anarkali Gown` / `yellow-georgette-anarkali-gown` | Color-only matching can pull in yellow products that are not ceremony-appropriate. Keep the rule color plus ceremony/festive/product context. | Build now | Count is above threshold and the route has strong pre-wedding search intent. Build with strict non-casual safeguards. |
| Bridesmaid Outfits | `/collections/bridesmaid-outfits` | `bridesmaid-outfits` | Prefer explicit `bridesmaid`; otherwise require non-bridal wedding guest products with pastel, lightweight, coordinated, Sangeet, reception, or wedding-party styling. Exclude bridal and groom products. | 2 Shopify-facing inferred matches; 26 fixture matches by pastel/lightweight/wedding-party logic. | `Silk Light Pink Wedding Wear Embroidery Work Saree` / `silk-light-pink-wedding-wear-embroidery-work-saree-394455`; `Silk Light Pink Occasional Wear Mirror Work Readymade Patiyala Suit` / `silk-light-pink-occasional-wear-mirror-work-readymade-patiyala-suit-394005`; `Blush Georgette Party Lehenga` / `blush-georgette-party-lehenga` | No reliable explicit bridesmaid tag surfaced. Pastel or light pink alone is not enough for bridesmaid intent. | Needs tagging cleanup first | Inventory can support the page later, but live Shopify-facing data needs explicit bridesmaid, wedding-party, coordinated, or non-bridal guest tags before launch. |
| Groom Outfits | `/collections/groom-outfits` | `groom-outfits` | Require menswear plus `groom`, `sherwani`, or wedding menswear signals. Exclude women's bridal products. | 29 priced Shopify-facing matches in `product_prices.json`; 18 additional fixture matches. | `Art Silk Grey Wedding Wear Hand Embroidery Readymade Groom Sherwani` / `art-silk-grey-wedding-wear-hand-embroidery-readymade-groom-sherwani-386005`; `Banarasi Jacquard Black Wedding Wear Neck Work Readymade Groom Sherwani` / `banarasi-jacquard-black-wedding-wear-neck-work-readymade-groom-sherwani-385999`; `Art Silk Wine Wedding Wear Embroidery Work Readymade Sherwani` / `art-silk-wine-wedding-wear-embroidery-work-readymade-sherwani-385509` | Some sherwanis may suit groomsmen or wedding guests too, but the groom/sherwani/wedding signal is still honest. | Build now | Strong inventory depth and high conversion intent for premium menswear. |
| Kurta Pajama | `/collections/kurta-pajama` | `kurta-pajama` | Require menswear plus exact `kurta pajama`, `dhoti kurta`, or `pathani`; exclude women's kurta sets. | 8 fixture matches in `src/data/menswearProducts.ts`; 0 matches in `product_prices.json`. | `Baby Pink Cotton Kurta Pajama Set` / `baby-pink-cotton-kurta-pajama`; `Blue Cotton Kurta Pajama Set` / `blue-cotton-kurta-pajama`; `Yellow Cotton Kurta Pajama Set` / `yellow-cotton-kurta-pajama` | Current Shopify-facing price file does not show these products, so Phase 2C should verify live Shopify product availability before route launch. | Build now | The repo has 8 exact menswear product records and existing category logic already recognizes `Kurta Pajama` as menswear. Build after confirming live products are still published. |
| Sarees Under $100 | `/collections/sarees-under-100` | `sarees-under-100` | Saree or sari product with min price under 100 USD; exclude jewelry and non-sarees. | 10 Shopify-facing title/price matches in `product_prices.json`; 22 additional fixture matches. | `Lycra Mauve Festival Wear Sequins Work Readymade Saree` / `lycra-mauve-festival-wear-sequins-work-readymade-saree-394402`; `Silk Blend Navy Blue Casual Wear Jari Work Saree` / `silk-blend-navy-blue-casual-wear-jari-work-saree-394451`; `Pure Silk Multi Color Occasional Wear Embroidery Work Saree` / `pure-silk-multi-color-occasional-wear-embroidery-work-saree-394266` | Under-$100 pages can attract bargain traffic; copy should not imply heavy bridal quality at this price point. | Build now | Clear budget intent, clean price rule, and enough real products. |
| Suits Under $150 | `/collections/suits-under-150` | `suits-under-150` | Women's suit, salwar, anarkali, sharara, gharara, palazzo/plazzo, patiala, churidar, or kameez product under 150 USD; apply menswear exclusion. | 29 Shopify-facing title/price matches in `product_prices.json`; 23 additional fixture matches. | `Crepe Silk Multi Color Party Wear Embroidery Work Readymade Plazzo Suit` / `crepe-silk-multi-color-party-wear-embroidery-work-readymade-plazzo-suit-394469`; `Shimmer Silk Pink Festival Wear Embroidery Work Readymade Plazzo Suit` / `shimmer-silk-pink-festival-wear-embroidery-work-readymade-plazzo-suit`; `Silk Green Occasional Wear Mirror Work Readymade Patiyala Suit` / `silk-green-occasional-wear-mirror-work-readymade-patiyala-suit-394004` | Must keep menswear exclusion because "suit" can also mean men's suit in generic matching. | Build now | Strong count, strong affordability intent, and a clean rule using product type/title plus price. |
| Wedding Guest Outfits Under $250 | `/collections/wedding-guest-outfits-under-250` | `wedding-guest-outfits-under-250` | Non-menswear, non-bridal products under 250 USD with wedding guest, wedding, reception, Sangeet, party wear, cocktail, festive, or occasion context. | 45 Shopify-facing title/price matches in `product_prices.json`; 45 additional fixture matches. | `Silk Multi Color Wedding Wear Embroidery Work Saree` / `silk-multi-color-wedding-wear-embroidery-work-saree-394462`; `Silk Rani Pink Wedding Wear Embroidery Work Saree` / `silk-rani-pink-wedding-wear-embroidery-work-saree-394459`; `Fendy Silk Black Festival Wear Embroidery Work Readymade Plazzo Suit` / `fendy-silk-black-festival-wear-embroidery-work-readymade-plazzo-suit-394115` | Generic wedding wear can include family, party, or festive products; exclude bridal, groom, and heavy bridal lehenga signals. | Build now | Very strong count and a high-value long-tail query combining budget and wedding intent. |
| Banarasi Sarees | `/collections/banarasi-sarees` | `banarasi-sarees` | Require saree plus `Banarasi`, `Benares`, or `Kashi Banarasi` in product type, title, tag, or description. | 2 fixture matches; 0 Shopify-facing saree matches in `product_prices.json`. | `Banarasi Silk Mustard Festival Wear Weaving Saree` / `banarasi-silk-mustard-festival-weaving-saree`; `Banarasi Silk Mint Green Festival Wear Weaving Saree` / `banarasi-silk-mint-green-festival-weaving-saree` | Product price file contains Banarasi sherwanis, not Banarasi sarees. Do not count sherwanis for a saree page. | Defer | Below the 3-product threshold for honest Banarasi saree inventory. |
| Pre-Draped Sarees | `/collections/pre-draped-sarees` | `pre-draped-sarees` | Require saree plus `pre-draped`, `ready-to-wear saree`, `readymade saree`, `saree gown`, or `stitched saree`; do not include ordinary sarees. | 3 Shopify-facing title matches in `product_prices.json`. | `Lycra Mauve Festival Wear Sequins Work Readymade Saree` / `lycra-mauve-festival-wear-sequins-work-readymade-saree-394402`; `Lycra Blue Festival Wear Sequins Work Readymade Saree` / `lycra-blue-festival-wear-sequins-work-readymade-saree-394401`; `Lycra Brown Festival Wear Sequins Work Readymade Saree` / `lycra-brown-festival-wear-sequins-work-readymade-saree-394400` | Exactly 3 products is fragile. Also, "readymade saree" should be checked against photos/product details to confirm it behaves like a convenience/pre-draped product. | Build now | Meets the minimum threshold exactly and has strong convenience intent, but should be launched after Ready to Wear and monitored for thin inventory. |

## Top 5 pages to build first

1. Ready to Wear (`/collections/ready-to-wear`) - 63 Shopify-facing readymade matches; highest convenience and conversion value.
2. Suits Under $150 (`/collections/suits-under-150`) - 29 Shopify-facing matches; clean price/product rule and strong budget intent.
3. Wedding Guest Outfits Under $250 (`/collections/wedding-guest-outfits-under-250`) - 45 Shopify-facing matches; excellent SEO and conversion overlap.
4. Sarees Under $100 (`/collections/sarees-under-100`) - 10 Shopify-facing matches; clean rule and accessible entry point.
5. Groom Outfits (`/collections/groom-outfits`) - 29 priced Shopify-facing groom/sherwani matches; high-ticket menswear conversion page.

Near-next candidates:

- Sangeet Outfits: build after the top 5 if the matcher stays strict about dance-friendly party/reception styles.
- Haldi Outfits: build after Sangeet with color plus ceremony safeguards.
- Kurta Pajama: build after confirming the 8 fixture products are currently published in Shopify.
- Pre-Draped Sarees: build after Ready to Wear because it has exactly 3 matches and is more fragile.

## Pages to avoid building now

- Ready to Ship: no reliable shipping-speed tag or metafield found. Do not build from `availableForSale` alone.
- Banarasi Sarees: only 2 honest Banarasi saree matches. Banarasi sherwanis do not count.
- Bridesmaid Outfits: inventory is promising, but the Shopify-facing evidence lacks explicit bridesmaid or wedding-party tagging. Build after tagging cleanup.

## Tagging and product data cleanup needed

1. Add fulfillment timing tags or metafields for shipping-intent pages:
   - `ready-to-ship`
   - `ships-in-3-days`
   - `ships-in-5-days`
   - `in-stock-us` if inventory is physically in the US
   - `made-to-order` or `custom` for products that should not appear on Ready to Ship

2. Add wedding role tags where the product genuinely fits:
   - `bridesmaid`
   - `wedding-party`
   - `non-bridal-wedding-guest`
   - `groom`
   - `groomsmen`

3. Normalize menswear product types:
   - Use `Kurta Pajama` for men's kurta pajama products.
   - Use `Sherwani` or `Groom Sherwani` for sherwanis.
   - Keep women's `Kurta Set` separate from men's `Kurta Pajama`.

4. Normalize readiness/convenience tags:
   - `ready-to-wear`
   - `readymade`
   - `pre-stitched`
   - `pre-draped-saree`
   - `saree-gown`
   - `unstitched` where applicable, so exclusions are reliable.

5. Add fabric/style tags only where true:
   - `banarasi-saree`
   - `banarasi-silk`
   - `pre-draped-saree`
   - `mirror-work`
   - `sequins`
   - `lightweight`

## Recommended Phase 2C implementation order

1. Implement shared buyer-intent collection rule helpers and a minimum-count guard.
2. Build Ready to Wear.
3. Build Suits Under $150.
4. Build Wedding Guest Outfits Under $250.
5. Build Sarees Under $100.
6. Build Groom Outfits.
7. Build Sangeet Outfits.
8. Build Haldi Outfits.
9. Build Kurta Pajama after live Shopify publication verification.
10. Build Pre-Draped Sarees after photo/detail verification and only if count remains at least 3.
11. Defer Bridesmaid Outfits until role tags are cleaned up.
12. Defer Ready to Ship until fulfillment timing tags/metafields exist.
13. Defer Banarasi Sarees until at least 3 true Banarasi sarees are published.

## Build status

No code was changed in Phase 2B. This is a docs-only audit, so the full build should be skipped.
