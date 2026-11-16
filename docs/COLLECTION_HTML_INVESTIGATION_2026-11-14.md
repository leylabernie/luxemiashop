# Collection HTML investigation — 2026-11-14

## Current disposition

A lossless collection-image deduplication candidate is now implemented and successfully built in **preview only** at commit `c7a032c7fa91e0dbe71c093587926df1bd25d054`. See the final section for current results. Desktop/mobile, real transfer and no-order checkout verification are still outstanding. Do not merge/promote without that evidence and separate production approval. Order #1002 remains untouched.

## Initial disposition (historical; superseded by follow-up below)

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


## Follow-up: measured preview build evidence

The earlier access limitations remain for direct production HTTP and browser testing, but **preview build-output attribution is now available**. The connector was initially scoped to the other project referenced by the GitHub bot; discovery located the authorized `labbhamini-7947s-projects/luxemiashop` project. The deployed-file tree endpoint returned 404, so an additional read-only build-end diagnostic now logs the measurements during Vercel preview builds only. It skips outside preview and never rewrites the generated HTML.

Evidence deployment: https://vercel.com/labbhamini-7947s-projects/luxemiashop/8dxaw8j1voqLFNKbV7etNKv6UQZV

Immutable preview: https://luxemiashop-9i0vpnjvx-labbhamini-7947s-projects.vercel.app

Measured commit: `3fd6f68b355f815c8563a94c09d1bc54e6155082`. Vercel reports READY/STAGED, not promoted to production. Audit log timestamps: `1794615496418` and `1794615496419` milliseconds since epoch. These are actual final prerender build files from the full preview build, **not a reproduction of the production HTTP response or measured transfer**.

| Measure, bytes | `/collections` | `/collections/banarasi-sarees` |
| --- | ---: | ---: |
| Uncompressed final prerender HTML | 1,027,301 | 1,282,499 |
| Initial-data script element | 738,713 | 1,094,251 |
| Variant fields, JSON reserialized | 602,607 | 1,016,112 |
| Description fields, JSON reserialized | 48,256 | 32,518 |
| Image fields, JSON reserialized | 43,820 | 16,317 |
| Structured-data script elements | 164,389 | 116,324 |
| Non-script HTML | 120,211 | 67,936 |
| Hydration product count | 50 | 34 |
| Product link occurrences | 253 | 34 |
| Estimated gzip body (Node defaults) | 78,155 | 68,658 |
| Estimated Brotli body (Node defaults) | 40,514 | 29,108 |
| Measured encoded HTTP transfer | unavailable | unavailable |

Variant data is approximately 59% and 79% of total decoded HTML respectively (field reserialization measure). The build-output magnitudes corroborate the reported observations, but must not be relabeled as live production measurements. Both pages parsed without JSON-LD or hydration JSON errors. Each contains one ItemList and one CollectionPage; that does not constitute a complete schema validator result. Compression is substantial, so decoded size alone does not prove excessive transfer cost or a CWV regression.

### Safety decision

No products, variants, options, prices, images, descriptions, structured data, cards or overflow links were removed. The largest contributor is purchasing-related variant data. A collection-specific representation or lossless encoding needs round-trip/consumer tests and real browser checks before it can be called a safe optimization. Merely deleting this data is not justified by these measurements. The request's fail-safe applies: report the measured cause rather than force an unverified optimization. No before/after reduction is claimed.

### Additional files and checks

- `package.json`: appends `node tools/audit-built-collections.mjs` after the existing full build; diagnostic script skips outside preview. The preceding build pipeline is unchanged.
- `tools/audit-built-collections.mjs`: reads only the two generated prerender files, emits attribution and explicitly labeled compression estimates, does not fetch or mutate catalog/store/order data.
- `tests/builtCollectionAudit.test.mjs`: 3 tests for nonmutation, skipping production and missing files. Together with the existing audit tests, 6/6 passed.
- Re-ran `npm test`, lint and TypeScript successfully after adding this hook.
- The **full Vercel preview build succeeded**, including final validation steps. Logs explicitly confirm IndexNow submission was skipped for preview. This supersedes the earlier statement that only a development-mode bundle had been verified; a local full build was still not run.
- Build logs also report an existing seasonal Navratri validation skip for archived inventory and an existing deprecated edge-runtime warning. Neither was altered.

Browser/checkout/CWV checks remain NOT executed, and no production deployment was performed. Rollback additionally removes the appended package build command and the two new built-audit files; no deployed runtime logic or tracking settings require restoration.


## Implemented candidate: lossless variant-image deduplication

Commit: `c7a032c7fa91e0dbe71c093587926df1bd25d054`.

Ready preview: https://luxemiashop-1gg71xwb5-labbhamini-7947s-projects.vercel.app

Build evidence: https://vercel.com/labbhamini-7947s-projects/luxemiashop/Arftpit7WdP9We4q6T17QGtH2R6a

### How it works and what is preserved

Only `/collections` and `/collections/*` hydration payloads are eligible. Variant image objects are stored once in a JSON table and represented by indices in the transmitted payload. An immediately following, synchronous inline script restores every variant image before the existing deferred application modules run. The hooks receive the original object shape. Each restored image is independently copied, preserving the mutation isolation of the original JSON parse. No asynchronous request, library download, eval, or new CSP permission is introduced.

The original catalog is never mutated. Metadata, canonical URLs, crawlable product cards/links, overflow links, schema and indexing rules are not rewritten. No variants or fields (including SKUs, prices, options, availability, image alt text and null fields) are removed. Product-page payloads and homepage payloads retain the original representation. Small collections keep the old representation if the table plus restoration-script overhead would not reduce decoded bytes. Malformed image references cause restoration to return null so existing hooks use their live-fetch path instead of consuming partial variant data.

This reduces decoded HTML, **not the final in-memory variant data**, and adds synchronous restoration work. No browser CPU or CWV improvement is claimed.

### Controlled comparison using owner-supplied production HTML

The owner uploaded `Collections.html` and `production-banarasi.html` copied from Chrome Network responses. These are saved UTF-8 file sizes, not exact encoded wire measurements. Only the initial-data script was replaced and the restoration script added; the rest of each HTML string was asserted unchanged. Executing both new scripts in an isolated JavaScript context produced a deep-equal copy of the entire original initial-data object for both files. Uploaded source files and generated copies are not committed.

| Bytes | Collections before | Collections candidate | Banarasi before | Banarasi candidate |
| --- | ---: | ---: | ---: | ---: |
| Saved decoded HTML | 1,031,286 | 809,813 | 1,285,392 | 883,804 |
| Estimated gzip, Node defaults | 78,220 | 76,788 | 68,637 | 59,731 |
| Estimated Brotli, Node defaults | 40,579 | 40,433 | 29,054 | 29,351 |

The Banarasi saved-file Brotli estimate **increases 297 bytes** despite the decoded reduction. Production screenshots show `Content-Encoding: br` and Chrome's 47.8 kB transferred figure for the original Banarasi document; that browser figure is not directly comparable with local Node defaults and may include headers. We do not claim a measured HTTP transfer improvement. Collections actual HTTP transfer and preview transfer measurements remain unavailable.

### Full Vercel preview build comparison

Baseline: measured commit `3fd6f68`, deployment `8dxaw8j1voqLFNKbV7etNKv6UQZV`.
Candidate: measured commit `c7a032c`, deployment `Arftpit7WdP9We4q6T17QGtH2R6a`.

| Measure | Collections baseline | Collections candidate | Banarasi baseline | Banarasi candidate |
| --- | ---: | ---: | ---: | ---: |
| Final decoded HTML bytes | 1,027,301 | 805,828 | 1,282,499 | 880,911 |
| Estimated gzip body bytes | 78,155 | 76,720 | 68,658 | 59,751 |
| Estimated Brotli body bytes | 40,514 | 40,383 | 29,108 | 29,163 |
| Non-script HTML bytes | 120,211 | 120,211 | 67,936 | 67,936 |
| JSON-LD element bytes | 164,389 | 164,389 | 116,324 | 116,324 |
| Hydration products | 50 | 50 | 34 | 34 |
| Product link occurrences | 253 | 253 | 34 | 34 |

Decoded reduction: 221,473 bytes (~21.6%) and 401,588 bytes (~31.3%). Preview Brotli estimate increases 55 bytes on Banarasi. Both builds had identical reported non-script/schema bytes, product counts and link counts. Candidate hydration and JSON-LD parse without errors. The audit now reconstructs image references before field attribution; field totals describe restored JSON, not encoded payload slices. Restoration script overhead is included in total HTML/all-script counts, but not in the initial-data script element count alone.

### Automated validation and remaining release gates

- Five new tests cover deep equality, independent image objects, distinct/null/missing images, hostile script-closing and dollar-token strings, zero prices, sold-out variants, route/small-payload exclusions, malformed references and the real collection renderer's adjacent script execution.
- New tests run in `npm test` and `test:purchase-flow`, so the Vercel full build exercises them too.
- `npm test`: main suite 874 tests, 869 passed / 5 skipped; reviewed collections 11 passed; newsletter 33 passed. No failures.
- Six audit-tool tests passed separately; five new encoding tests passed separately (11/11 combined).
- Lint: exit 0, four existing warnings; TypeScript: exit 0; development build: exit 0.
- Full Vercel preview build: success, READY/STAGED, IndexNow submission skipped. Existing seasonal validation skip and edge-runtime deprecation warning remain.
- **Not browser-verified:** desktop/mobile behavior, actual transfer sizes, browser CPU/CWV, no-order cart-to-checkout, GA4 session continuity and CSP runtime console. Do not treat VM script execution as a browser check. All original browsing/cart validation gates remain required before recommending a release.

### Candidate changed files and rollback

- `src/lib/collectionHydration.cjs`: build-time deduplication and self-contained restoration.
- `scripts/prerender.js`: emit compact JSON plus synchronous restoration only for eligible collection routes; original product serializer unchanged.
- `tools/collection-html-audit.mjs`: decode compact transport for attribution without evaluating JavaScript.
- `tests/collectionHydration.test.cjs`: new regression coverage.
- `package.json`: includes the new regression tests (in addition to the earlier preview-only audit hook).
- This report, with earlier diagnostic files retained.

Rollback the optimization by reverting commit `c7a032c` on the working branch (with corresponding report updates). This restores the original collection hydration scripts without catalog, order, consent, tracking, DNS or payment migrations. No production deployment, merge, new sender or order action was performed.
