# LuxeMia active catalog audit — 2026-11-11

## Scope and method

This snapshot covers **292 active Shopify products**, collected from six paginated `status:active` product-list responses. It is a read-only catalog audit: no product, price, inventory, status, publication, or DNS changes were made. The list endpoint exposes product title, type, variant count, inventory total, and timestamps; it does not expose the full HTML description, supplier measurement source, or all metafields. Those fields remain exceptions requiring a deeper product-detail export or merchant/supplier confirmation.

## Active products by Shopify product type

| Product type | Active products |
|---|---:|
| Lehenga Choli | 66 |
| Saree | 64 |
| Palazzo Suit | 42 |
| Anarkali | 19 |
| Indo-Western | 13 |
| Men’s Kurta Pajama | 13 |
| Sharara Suit | 13 |
| Blouse | 10 |
| Salwar Suit | 9 |
| Kids Boy Set | 7 |
| Salwar Kameez | 6 |
| Couple Set | 5 |
| Jewelry | 5 |
| Men’s Kurta Pajama with Jacket | 5 |
| Peplum Palazzo Suit | 5 |
| Palazzo Set | 4 |
| Suit Set | 3 |
| Anarkali Suit | 1 |
| Lehenga Set | 1 |
| Service Add-On | 1 |
| **Total** | **292** |

## Read-only findings

- **85 active products** report zero total inventory in the Admin snapshot. They were not archived, unpublished, or otherwise changed. Availability behavior should be checked on the live product route before promotion.
- **7 products** have more than 20 variants. These require careful route and variant-selection checks because a product may contain multiple color/size combinations and a large variant payload.
- The active catalog includes a **Service Add-On** product. It should remain excluded from ordinary garment merchandising and promotion.
- The catalog contains explicit unstitched products and ready-to-wear wording in titles/types, but title wording alone is not sufficient evidence for every listing. The storefront should display construction only from explicit Shopify description/tags/metafields, never from inferred size labels.

## Description mismatch fix

The storefront root cause was a manual `hasReviewedProductCopy` gate. It allowed full HTML descriptions only for a small reviewed subset, while other product pages received generated summaries. The current branch now renders each product’s current Shopify `descriptionHtml` through the existing safe HTML sanitization path for interactive details, initial hydration, and prerendered body content. The stricter reviewed-copy gate remains for generated SEO/fact copy, so unverified descriptions are not promoted into metadata or synthesized catalog claims.

The six initial test products are:

- `/product/olive-green-chinon-embroidered-readymade-palazzo-suit`
- `/product/off-white-crepe-embroidered-readymade-sharara-suit`
- `/product/teal-blue-chanderi-embroidered-readymade-salwar-suit`
- `/product/olive-gold-crush-tissue-embroidered-salwar-suit-festive-wear`
- `/product/pink-pure-mulmul-embroidered-anarkali-suit-occasion-wear`
- `/product/grey-shimmer-silk-embroidered-salwar-suit-occasion-wear`

## Supplier and merchant-confirmation exceptions

These are intentionally not invented or bulk-written:

- Style-specific bust, waist, hip, and garment-length measurements, including units and whether they are body or finished-garment measurements.
- Exact included pieces, lining, stitching/finishing state, and accessory exclusions where the Shopify description does not explicitly state them.
- Whether a numbered option such as 38, 40, 42, or 44 maps to any particular US size or body measurement.
- Product-specific alteration availability, charges, and measurement-submission instructions beyond the options explicitly represented in Shopify.
- Any claim that an active product is delivery-suitable for a customer’s fixed event date.

## Next implementation work

1. Keep the current safe Shopify-description rendering change in the draft PR and validate the six initial routes in the Vercel preview.
2. Export full product-detail data for the active catalog, including description HTML, tags, options, variants, and relevant custom metafields, then classify explicit construction/inclusion/measurement facts by product type.
3. Add only source-backed structured display fields (for example, construction status and included pieces) where the Shopify record already contains the fact; produce a supplier exception list for the remainder.
4. Verify the shared shipping source and checkout configuration before adding or changing mobile purchase messaging.
5. Validate analytics events separately in a logged-out test session, respecting consent and without placing a real order.

## Change safety

No archived or draft products were published. No Shopify product records were edited during this audit. Prices, inventory, checkout, domain, DNS, return policy, and product status were left unchanged.
