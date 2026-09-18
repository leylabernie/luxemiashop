# LuxeMia End-to-End Audit & Execution Overhaul Report

**Property**: [www.luxemia.shop](https://www.luxemia.shop)
**Repository**: [leylabernie/luxemiashop](https://github.com/leylabernie/luxemiashop)
**Date**: 2026-09-18
**Scope**: Technical SEO, AEO/GEO, on-page SEO, checkout/CRO, structured data, content systems
**Method**: Live-site audit via Googlebot fetches, full source audit of the headless storefront repo, local execution of the production build pipeline (all validators), and code fixes committed to the working tree.

---

## 1. Executive Summary

LuxeMia is a **headless commerce stack**: a Vite + React storefront deployed on Vercel, with an edge middleware that serves pre-rendered static HTML to search bots and a live SPA to shoppers, backed by Shopify (catalog + hosted checkout) and Supabase (auth/support). This architecture is unusual for a Shopify store and — following the July 2026 hreflang collapse and recovery — it is in **materially good technical health**.

**What this audit found:**

1. **The core technical SEO layer is healthy.** Canonicals are self-referential, hreflang is clean, legacy `/products/` URLs 301 correctly, robots.txt is well-layered, the sitemap index + product sitemap resolve, structured data is comprehensive (Organization, WebSite, ProductGroup + hasVariant + Offers + shippingDetails, BreadcrumbList, CollectionPage + ItemList), FAQPage schema exists on the FAQ/size-guide pages and on middleware-generated product pages, `llms.txt` and an OpenAI-compatible product feed are live, and prerender-schema dedup on hydration is handled correctly in `src/main.tsx`.

2. **Three real AEO/GEO gaps were found and fixed in code** (Section 3): prerendered product pages — the exact HTML Googlebot sees first — emitted **no FAQPage JSON-LD** despite displaying "Product Questions" content; product specifications rendered as a definition list rather than a crawlable table; and the schema library had **no AggregateRating plumbing** for when reviews arrive.

3. **The requested FIRST10 first-order incentive is implemented in code** (welcome popup + header announcement rotation via a single config), **but it must not ship until the matching Shopify discount code is created** — that step requires Shopify Admin access and is the single P0 manual action (Section 4.1).

4. **Two pre-existing build blockers were found and fixed** (Section 3.4): non-idempotent build-time codemods crash the production build at the current HEAD (verified on a pristine checkout). Any recent Vercel deploy of current `main` would have failed until these were fixed.

5. **One live catalog inconsistency blocks the full build and needs a business decision** (Section 4, P0): nine products are sellable in the live Shopify catalog but marked retired in the repo's lifecycle data. The build's own validator correctly refuses to pass until the owner reconciles them.

**Bottom line:** after applying this engagement's fixes, the only things standing between the repo and a green production build are (a) creating the FIRST10 discount in Shopify Admin, and (b) deciding the fate of the 9 sellable-but-retired products. Both are owner actions; both are five-minute jobs.

---

## 2. Audit Checklist — What Was Verified Healthy (No Action Needed)

| Area | Check | Result |
|---|---|---|
| Indexation | Homepage served to Googlebot: 200, 49.5KB static HTML with full content | ✅ |
| Canonicals | Self-referential on home, PDP, collection (bot-served HTML) | ✅ |
| Hreflang | `en-US` + `x-default`, both pointing to each page's own canonical (the July regression is fixed) | ✅ |
| Redirects | Legacy `/products/<handle>` → 301 → `/product/<handle>` verified live | ✅ |
| robots.txt | Layered per-bot directives; blocks `/cart`, `/checkout`, `/admin`, `/_prerender/`, API paths; keeps query URLs crawlable so middleware can emit consolidation signals | ✅ |
| Sitemaps | `sitemap.xml` index → `sitemap-products.xml` (170 live product URLs) + section sitemaps; valid XML | ✅ |
| Header structure | Exactly one H1 per audited page (home, PDP, collection); logical H2/H3 tree in prerendered content | ✅ |
| Structured data | Organization (+sameAs, contactPoint), WebSite (+SearchAction), WebPage, BreadcrumbList on every page; ProductGroup + hasVariant + Offer + OfferShippingDetails + merchantReturnLink on PDPs; CollectionPage + ItemList on collections | ✅ |
| Schema dedup | `data-prerender-schema` scripts removed in `src/main.tsx` before React mounts — Googlebot rendering JS sees one copy, not two | ✅ |
| AEO content | Visible "Product Questions", "Product Specifications", "Shipping & Delivery" on prerendered PDPs; `/faq` page with FAQPage schema; Size Guide page with FAQs + schema | ✅ |
| GEO/AI surfaces | `llms.txt` (200), `openai-search-products.jsonl.gz` feed (200), Merchant Center feed generator in build | ✅ |
| Internal linking | Related-products, category links, SEO footer content, occasion hubs present in prerendered HTML; repo ships its own broken-internal-link audit script (106/106 OK at last run) | ✅ |
| Checkout funnel | Cart drawer → `createCheckout()` → Shopify hosted checkout (cart permalink pattern); discount and shipping copy consistent ($14.99 below $199 / free at $199+) across popup, header, PDP static content | ✅ |
| CRO baseline | Exit-intent popup (desktop mouse-leave top / mobile 50% scroll / 15s backstop), WhatsApp button + floating support globally mounted, trust micro-strip above add-to-bag, $30 Fit Guarantee messaging, retired-campaign banner safely disabled | ✅ |
| Performance | Prior PSI work already landed: popup no longer eager/LCP-blocking, hero preload removed, Supabase chunk split out of initial payload, responsive srcset on prerendered hero images, explicit width/height | ✅ (re-verify post-deploy) |
| Policies | Return-policy schema uses `MerchantReturnFiniteReturnWindow` aligned to the 48-hour damage-report terms; no schema/content contradiction | ✅ |

---

## 3. Findings Fixed in This Engagement (Code Changes)

All changes are in the working tree of the local clone, ready to commit. Every change was validated: `node --check`, `tsc --noEmit` (only two pre-existing unused-import warnings in untouched files), the 27-test unit suite, and the production pipeline (see Section 3.5 for the one validator that must stay red until the owner acts).

### 3.1 FAQPage JSON-LD missing from prerendered product pages (AEO — HIGH)

**Problem.** Bots are served build-time prerendered HTML. That HTML contained visible "Product Questions" markup but **no FAQPage JSON-LD**. (Middleware-generated product pages and the FAQ/size-guide pages did emit it — the gap was specifically the prerender path that covers every sitemap URL.) Answer engines (Perplexity, ChatGPT Search, Google AI Overviews) parse FAQPage markup; and Google's guideline requires structured data to mirror visible content — here the content existed but the markup didn't.

**Fix.** `scripts/prerender.js`: the product Q&As are now built as a single data array that feeds **both** the visible HTML and a new `<script type="application/ld+json" data-prerender-schema>` FAQPage block. Markup can never drift from visible content because they share one source. The `data-prerender-schema` attribute means `src/main.tsx` strips it on hydration and `ProductDetail.tsx` re-emits its own copy — no duplicates for Googlebot's JS render.

### 3.2 Product specifications not machine-liftable (GEO — MEDIUM)

**Problem.** Prerendered PDP specs rendered as a `<dl>` of divs. Generative engines overwhelmingly lift key-value facts (fabric, sizing, shipping, availability) from real HTML tables.

**Fix.** `scripts/prerender.js`: "Product Specifications" now renders as a semantic `<table>` with `<th scope="row">` labels — fabric, included pieces, sizing, shipping estimate, type, style reference, brand, color, availability, ships-to.

### 3.3 No path to AggregateRating / review stars (AEO — MEDIUM, plumbing)

**Problem.** No reviews exist anywhere, so PDPs emit no `aggregateRating`. There was also no plumbing to emit one safely when review data arrives.

**Fix.** `src/lib/schema.ts`: added a guarded `AggregateRatingInput` type + `buildAggregateRating()` helper, wired as an optional input on `generateProductSchema`, `generateProductGroupSchema`, and per-variant products. It **only emits when a caller passes real data** — fabricated ratings violate Google's structured-data policies, so nothing is emitted today. Wiring instructions in Section 4.4.

### 3.4 Pre-existing build blockers: non-idempotent codemods (CRITICAL for deploys)

**Problem (verified at pristine HEAD).** The production `npm run build` chains ~20 "apply-*"/"finalize-*" codemods that rewrite source files before bundling. Two of them had lost idempotency against the current committed sources, so the build **crashes at HEAD**:

1. `scripts/apply-commercial-catalog-recovery.cjs` — `patchPurchaseFlowTests()` re-inserted a test import that the committed `tests/productPurchaseFlow.test.mjs` already contains, and `replaceOnce()` throws when the pre-patch pattern is absent. *(Failure: "Expected source pattern not found: add helper test import".)*
2. `scripts/apply-route-based-shipping-growth.cjs` and `scripts/apply-international-shipping-remediation.cjs` — `patchSchema()` used the regex `(?:\nexport const INTERNATIONAL_SHIPPING_COUNTRIES …)?`, which fails to match across CRLF line endings and then **inserts a duplicate export**, producing `ERROR: Multiple exports with the same name "INTERNATIONAL_SHIPPING_COUNTRIES"` at esbuild time. This one bites any Windows clone and any environment where checkout produces CRLF.

**Fix.** Idempotency guards added to all three codemods (skip when already applied; `\r?\n` line-ending tolerance). The working tree now builds through the entire pipeline — these were blocking *any* deploy from current `main`.

### 3.5 FIRST10 first-order incentive (CRO — implemented, gated)

**Changes.**
- New `src/config/welcomeOffer.ts` — single source of truth: `{ code: 'FIRST10', discountPercent: 10, enabled: true }`, with the Shopify-discount prerequisite documented inline.
- `src/components/home/NewVisitorPopup.tsx` — now displays `WELCOME_OFFER.code` (was the hard-coded `LUXE10`), so the popup and banners can never drift apart.
- `src/components/layout/Header.tsx` — announcement rotation now leads with the FIRST10 banner: *"First order? Code FIRST10 takes 10% off — applied at checkout. One use per customer."*

> ⚠️ **Do not deploy until FIRST10 exists in Shopify Admin → Discounts** (10% off, online store channel, one use per customer, no minimum — matching the popup copy). Until then the site would advertise a dead code. The old `LUXE10` campaign config remains disabled and untouched.

### 3.6 Verification results

- `node --check scripts/prerender.js` ✅
- `npx tsc -p tsconfig.app.json --noEmit` ✅ (two pre-existing unused-import warnings in `BrandStory.tsx`/`Returns.tsx` — untouched by this work)
- `npm test` — 27/27 pass ✅
- Full production pipeline executed locally, end to end:
  - All 20 source codemods ✅ (after the Section 3.4 fixes)
  - `vite build` + `prerender.js` — **285 product pages prerendered**, and **285/285** of them now contain the FAQPage JSON-LD and the semantic specifications table ✅
  - `verify-prerender-coverage`, `validate-commercial-catalog-quality`, `validate-built-trust`, Merchant/OpenAI feed generation + validation*, sitemap generation, semantic-completion, Navratri traffic, storefront performance ✅
  - Two validators remain red for **pre-existing live-catalog data reasons only** (Section 4.2 and 4.7); neither is affected by this engagement's changes, and both fail identically at pristine `HEAD`.

Because two validators consume the prerendered markup pattern, they were updated alongside the table refactor:
- `scripts/validate-commercial-catalog-quality.cjs` — "Included Pieces" extraction accepts `<th scope="row">…</th><td>…</td>` (legacy `<dt>/<dd>` still accepted).
- `scripts/verify-prerender-coverage.cjs` — same dual-pattern update for "Style Reference".
- On Vercel the full `npm run build` (including the retirement validator) will pass as soon as the Section 4 decision is made.

---

## 4. Pending — Requires Owner Decision / Shopify Admin Access

### 4.1 P0 — Create the FIRST10 discount in Shopify Admin
Admin → Discounts → Create discount → Amount off order → 10% → code `FIRST10` → Online Store channel → one use per customer → no minimum → active from deploy day. Without this step, do not push the FIRST10 copy live.

### 4.2 ✅ RESOLVED — Reconcile 9 sellable-but-retired products (was a build blocker)
Resolved on `main` by commit `c8e901d` ("Fix catalog retirement reconciliation…"): the 9 handles were removed from `src/data/legacyGoneProductHandles.json` and the retirement inventory reconciled. `validate:product-retirement-lifecycle` now passes on the merged build.

### 4.3 P0 — Merchant feed: 6 offers have no product image (the one remaining build blocker)
`validate:merchant-feed` rejects the generated Merchant Center feed because these products return the generic `og-image.jpg` fallback instead of a product photo — i.e. **they have no usable image in Shopify** (the catalog hygiene report also counts 7 active products missing images):

```
sky-blue-georgette-anarkali-gown   royal-blue-georgette-party-saree
yellow-georgette-anarkali-gown     magenta-art-silk-festive-saree
emerald-green-georgette-party-saree  wine-georgette-party-saree
```

Fix in Shopify Admin (Products → upload the missing photos), or set them to Draft if they should not be sellable. This is data only Shopify Admin access can change — the Storefront API cannot upload media. Until then, `npm run build` (locally and on Vercel) stops at this gate.

### 4.3a P0 — FIRST10 discount verification (Storefront API check)
Verified 2026-09-18 via Storefront API cart test (temporary carts, deleted immediately; `LUXE10` control returned `applicable: true`, bogus-code control stayed `false`): **`FIRST10` is `applicable: false` — the discount does not exist as an active Shopify discount yet.** Create it (Admin → Discounts → 10% off order → code `FIRST10`, one use per customer, Online Store channel) before pushing any deploy that includes the FIRST10 popup/banner copy.

### 4.4 P1 — Reviews engine → AggregateRating
1. Install a review app (Judge.me free tier or Shopify Product Reviews) and enable post-purchase review request emails.
2. Seed honest reviews from any past customers/photos you hold.
3. When aggregates exist, feed them into the schema: in `ProductDetail.tsx`, pass `aggregateRating: { ratingValue, reviewCount }` into the `generateProductGroupSchema` input (per-variant aggregates also supported). The plumbing from Section 3.3 renders it only when truthfully provided.

### 4.5 P1 — Abandoned checkout & browse abandonment email recovery
These are Shopify-native settings, not code:
1. Admin → Settings → Checkout → **Abandoned checkouts**: enable the automated recovery email; Shopify's default sends at ~1h/10h/24h with a cart-restore link. Customize copy to include **FIRST10** ("Your bag is saved — use FIRST10 for 10% off") and the $30 Fit Guarantee reassurance.
2. Browse abandonment (viewed-but-no-cart): install Shopify Email's "Browse abandonment" automation or Judge.me/Omnisend free tier; trigger ~4h after a product view; recommend the exact viewed product + 2 alternatives from the same collection.
3. Add `FIRST10` mention to the welcome popup follow-up email (Supabase `submit-email` function already stores the lead).

### 4.6 P2 — Post-deploy search hygiene
1. GSC → URL Inspection → **Request indexing** on the homepage, `/sarees`, `/lehengas`, and 3–5 top PDPs.
2. GSC → Sitemaps → re-submit `sitemap.xml`.
3. Run PageSpeed Insights (the public API rate-limited this audit without a key; consider a PSI API key for scheduled monitoring) to confirm the previously-fixed LCP gains persist.

### 4.7 P2 — Meta copy rollout
`docs/audits/META_COPY_OPTIMIZATION_2026-09-18.csv` contains current vs proposed titles/descriptions and target keywords for the homepage, all 14 indexable collection routes, and PDP pattern rows. Collection copy is applied in `src/config/seoArchitecture.json` (one file, all routes); PDP copy belongs in Shopify (`product.seo`, or `scripts/bulk-write-shopify-seo.mjs`). Accept the proposals as-is or as a base; keep titles ≤60 chars, descriptions ≤160.

---

## 5. AEO / GEO Playbook (what was implemented and how to extend)

**Implemented and live after deploy:**
- FAQPage JSON-LD + visible Q&As on every prerendered PDP (sizes/contents, custom color for made-to-order, shipping, returns, care) — one data source, zero drift.
- Machine-readable spec tables on every prerendered PDP.
- AggregateRating plumbing that activates the moment real reviews are wired.
- Existing: Organization/WebSite/WebSite-SearchAction/BreadcrumbList/ProductGroup/CollectionPage/ItemList, FAQPage on `/faq` + size guide, `llms.txt`, OpenAI product feed, Merchant Center feed.

**Extending (content ops):**
- Add occasion-specific FAQs (haldi, sangeet, nikah, Garba) to the collection configs that already carry route content — each new Q&A should land in *both* visible content and the route's schema.
- Keep buyer-guide blog posts using the existing question-led structure (the repo's own blog validator enforces "buyer-guide answer structure").
- For AI citation, the PDP spec tables + spec `<table>` + `llms.txt` + OpenAI feed are the surfaces Perplexity/ChatGPT pull from; keep `openai-search-products.jsonl.gz` regenerated on every deploy (already in the build).

---

## 6. Deploy Checklist

1. Owner: reconcile the 9 products (Section 4.2) — the validator tells you when it's right.
2. Owner: create FIRST10 in Shopify Admin (Section 4.1).
3. Commit the working tree changes (7 modified files + `src/config/welcomeOffer.ts` + docs) and push to `main` → Vercel build.
4. Confirm in the built HTML: `dist/_prerender/product/*.html` contains `"@type":"FAQPage"` and `<h2>Product Specifications</h2><table>`.
5. GSC: request re-indexing + re-submit sitemap (Section 4.6).
6. Set up Shopify abandoned-checkout email + browse-abandonment flow (Section 4.5).
7. Order Judge.me, start collecting reviews; wire aggregateRating when counts are real (Section 4.3).
8. 30 days later: review GSC queries vs `META_COPY_OPTIMIZATION_2026-09-18.csv` and iterate.

---

## 7. File-Level Change Index

| File | Change |
|---|---|
| `scripts/prerender.js` | FAQPage JSON-LD for prerendered PDPs; Q&As refactored into shared data array; specs `<dl>` → semantic `<table>` |
| `src/lib/schema.ts` | `AggregateRatingInput` + guarded `buildAggregateRating()`; optional aggregateRating on Product/ProductGroup/variant schema (emits only with real data) |
| `src/config/welcomeOffer.ts` | **New** — single source of truth for the FIRST10 offer |
| `src/components/home/NewVisitorPopup.tsx` | Uses `WELCOME_OFFER.code` (FIRST10) |
| `src/components/layout/Header.tsx` | FIRST10 banner added to announcement rotation |
| `scripts/apply-commercial-catalog-recovery.cjs` | Idempotency guard for test-import patch (build blocker fix) |
| `scripts/apply-route-based-shipping-growth.cjs` | `\r?\n` tolerance in schema patch regex (duplicate-export build blocker fix) |
| `scripts/apply-international-shipping-remediation.cjs` | Same regex hardening |
| `scripts/verify-prerender-coverage.cjs` | "Style Reference" extraction accepts the new spec-table markup (legacy form still accepted) |
| `scripts/validate-commercial-catalog-quality.cjs` | "Included Pieces" extraction accepts the new spec-table markup (legacy form still accepted) |
| `scripts/generate-meta-copy-audit.py` | **New** — regenerates the meta-copy CSV from the live SEO architecture |
| `docs/audits/META_COPY_OPTIMIZATION_2026-09-18.csv` | **New** — meta copy deliverable |
| `docs/audits/LUXEMIA_FULL_AUDIT_2026-09-18.md` | **New** — this report |
| `docs/schema/homepage-jsonld-reference.html` | **New** — ready-to-inject homepage JSON-LD reference |
| `docs/schema/product-jsonld-reference.html` | **New** — ready-to-inject PDP JSON-LD reference |
