# Collection HTML investigation — 2026-11-14

## Disposition

**Diagnostic-only, not a size optimization or a performance release.** No storefront, checkout, analytics, CSP, indexing or tracking configuration changed. Do not merge/deploy to production as an optimization. The request explicitly permits reporting that a safe reduction is not clear; this investigation cannot yet establish one. Order #1002 was not accessed.

## Production measurements

| Route | Prior observation supplied by owner | Reproduced decoded HTML bytes | Encoded response-body bytes |
| --- | --- | --- | --- |
| `/collections` | approximately 1 MB returned HTML | unavailable | unavailable |
| `/collections/banarasi-sarees` | approximately 1.28 MB returned HTML | unavailable | unavailable |

Both URLs failed TLS connection establishment from this environment, using curl and the new audit tool. No HTTP response body or encoding headers were obtained. This environment restricts outbound hosts and does not include luxemia.shop or Shopify. These are access failures, not evidence of a production outage. Do not treat the owner's approximate observations as reproduced measurements or as compressed transfer sizes. Before/after reductions and CWV/LCP/INP/CLS results are unavailable. No runtime optimization was applied, so no improvement is claimed.

## Code-inspected contributors and requirements (not measured rankings)

In `scripts/prerender.js`:

- Collection rendering selects up to the existing `MAX_COLLECTION_PRODUCTS = 50`. It also generates approved overflow product links. Neither limit nor overflow behavior was changed.
- `buildInitialDataPayload` embeds `window.__INITIAL_DATA__`. Each node retains descriptions, tags, prices, images, variants and options. The build query requests up to 20 images and 100 variants per product. These multiplicative payloads are a plausible contributor, but their production byte contribution remains unmeasured.
- `generateCollectionProductHtml` separately emits crawlable product cards, responsive image URLs, titles, prices and availability. Their repetition of JSON fields is intentional: JSON alone does not provide visible crawlable product links/cards.
- `generateItemListJsonLd` emits Product/Offer records inside an ItemList, including descriptions, images, prices, availability and shipping references. A separate CollectionPage links to that list. This is not automatically duplicate structured data merely because it repeats visible facts. Actual response schema counts still need inspection.
- `buildHydrationProductNode` is shared with product-page initial data. Trimming it globally could remove required product options, images or variant information on direct product visits.
- `useShopifyProducts` seeds immediate rendering from route-matched initial data, maintains catalog caching, and fetches the live catalog. `useShopifyCollection` seeds from the collection payload and refreshes collection data. Removing fields or initial products needs consumer-level evidence, particularly during slow/failed refresh, not just a successful online visit.

Candidate follow-up: measure per-field costs first, then investigate a collection-only representation or lossless encoding with exact round-trip tests. Do not drop variants, gallery images, descriptions, schema, cards or products merely because they appear large. No such removal is proposed here.

## Reproducible read-only tooling

```
node tools/collection-html-audit.mjs https://luxemia.shop/collections
node tools/collection-html-audit.mjs https://luxemia.shop/collections/banarasi-sarees
node tools/collection-html-audit.mjs --file saved-preview-response.html
node --test tests/collectionHtmlAudit.test.mjs
```

The remote command performs one HTTPS GET, asks for Brotli/gzip, records the actual content encoding and encoded body length, decodes it and counts UTF-8 HTML bytes. It does not follow redirects, execute scripts, load assets, or contact checkout. Only the two approved collection URLs are accepted. A local saved HTML file has **unknown transfer size**; the tool does not replace that measurement with a local gzip estimate. Transfer counts exclude HTTP headers, TLS and subresources.

Attribution includes all script elements, non-script HTML, initial-data script, JSON-LD script elements, parsed schema types, product-link occurrences and per-hydration-field reserialized JSON bytes. Script categories are subsets, not additive totals. Field reserialization sizes are diagnostic, not exact slices of the source or encoded network costs. Regex-based inspection targets this repository's generated HTML; it is not a general HTML parser or structured-data validator. Parse errors are reported; inline JavaScript is never evaluated. Saved browser HAR/Network evidence should supplement these figures, since the audit User-Agent may receive a different cached/middleware response from a browser or crawler.

## Executed checks

- `node --test tests/collectionHtmlAudit.test.mjs`: 3 passed.
- `npm test`: successful. Main suite: 869 tests, 864 passed, 5 skipped; reviewed collections: 11 passed; newsletter: 33 passed. Existing cart, checkout URL/integrity, product flow, analytics/linker and schema checks are included, but are code checks, not Shopify browser transactions.
- `npm run lint`: exit 0; 4 existing React hook dependency warnings, 0 errors.
- `npx tsc --noEmit -p tsconfig.app.json`: exit 0.
- `npm run build:dev`: exit 0 (Vite development-mode bundle, approximately 13.76 seconds). This is **not** the complete production prerender build or a page-load performance measurement.
- Full `npm run build` was not run: it includes source-rewriting stages, requires fresh Shopify catalog access, generates feeds/sitemaps and can submit IndexNow notifications outside preview/development. No incomplete/stale catalog fallback was substituted.

## Browser and checkout matrix — NOT executed

No browser automation capability was available in this session, and Shopify/production network access is restricted. All of the following remain unverified on desktop and mobile:

- Both collection pages: crawlable product inventory, links, navigation, images, filters, sorting, search, pagination and metadata/canonical/indexing parity.
- Representative saree, sized garment and service-eligible product pages: images, size/options, live availability, price and validation states.
- No-order cart-to-checkout: correct products/variant IDs, selected sizes/options, quantities, currency/prices, service add-ons and measurement/custom attributes; edit a quantity, reload the cart, then verify checkout reflects the latest cart rather than an old checkout URL.
- GA4 cid/sid/linker continuity and absence of CSP errors in the preview. Existing PR #295 implementation and CSP files were not modified.

For an actual optimization preview, repeat this matrix with current in-stock fixtures, preserve all inventory/sizing/tailoring/measurement/cart-integrity gates, stop before payment/order submission, and record viewport dimensions, preview SHA, exact expected/actual cart lines and sanitized screenshots/network evidence. Never use order #1002's status page. No order completion, purchase sender, Google & YouTube/consent/Shop Pay/DNS/payment/shipping change, fulfillment, cancellation, restock or cleanup is part of this work.

## Changed files and rollback

- `tools/collection-html-audit.mjs`: standalone read-only analysis CLI, not imported by the app or build.
- `tests/collectionHtmlAudit.test.mjs`: standalone CLI tests.
- This report.

Rollback: close the diagnostic PR or revert its single diagnostic commit. There is no runtime change, migration or tracking configuration to undo. Any later optimization requires its own measured before/after preview evidence and production remains subject to separate owner approval.
