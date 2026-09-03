# LuxeMia semantic-commerce implementation record

Property: `https://luxemia.shop`
Repository: `leylabernie/luxemiashop`
Document role: source-level controls and release criteria

This document deliberately does not claim that the current worktree is merged, deployed, indexed, approved by Google Merchant Center, or producing a particular commercial result. Exact commit, preview, production deployment, and live-response evidence belong in the final release handoff.

## Verified operating facts

- LuxeMia is an online-only Indian ethnic-wear store.
- Checkout currently supports the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius.
- All published shipping amounts are USD: U.S. $14.99/free at $199; Canada and the UK $24.99/free at $299; Australia and New Zealand $29.99/free at $349; South Africa $49.99; Mauritius $59.99.
- `LUXE10` is an active Shopify first-order offer for 10% off the entire order, with no minimum and one use per customer. The checkout remains authoritative for eligibility and application.
- Change-of-mind purchases are final sale, subject to applicable law. Damage, defects, material misdescription, incorrect items, and missing pieces use the covered-order-issue process. Reporting within 48 hours is preferred for evidence review; it is not presented as a blanket loss of non-excludable rights, and an unboxing video is requested only when available.

## Evidence rules

The storefront, prerenderer, structured data, Merchant feed, and AI-search export must use the current Shopify record and selected variant for product identity, price, currency, availability, and offered options.

Optional facts are shown only when an explicit listing field, prefixed fact tag, or reviewed evidence marker supports them. The following are omitted when not supplied:

- fiber composition and material detail;
- included pieces;
- origin, artisan, handwork, authenticity, and environmental certifications;
- SKU, GTIN, MPN, brand, and item condition;
- universal size conversions, fit promises, alteration allowances, and customization choices;
- ready-to-ship or made-to-order status;
- processing estimates and event-date delivery promises.

Omission of an unverifiable optional fact is the intended safe result, not an unfinished placeholder.

## Implemented source controls

- Canonical URLs, internal URLs, feeds, sitemaps, and entity identifiers use the non-`www` origin.
- Trust, shipping, returns, privacy, editorial, review, support, sizing, country-shipping, fulfillment, collection, and guide pages use one policy source of truth.
- Ready-to-ship requires positive catalog evidence; sale availability alone is insufficient.
- Product copy is rebuilt from explicit catalog evidence rather than preserving unreviewed supplier marketing prose.
- Collection and product orderability use explicit positive availability.
- Product schema omits optional facts that cannot be verified and does not invent price, currency, condition, availability, brand, address, or a person.
- Analytics remains off until the shopper accepts it; URLs and event fields are minimized, and decline or withdrawal disables collection.
- Source-mutating catalog, SEO, shipping, and fallback generators are retired. The production build validates committed source and generates deployable artifacts without rewriting tracked source.
- Static product/feed/sitemap snapshots are not treated as current inventory. Shopify-backed generation fails closed when required catalog access is unavailable.

## Claims intentionally retired

The current implementation must not restore any of these statements without fresh, documented merchant evidence and matching operational terms:

- U.S.-only or worldwide shipping;
- retired shipping prices, thresholds, or one-rate international shipping copy that conflicts with the current route table;
- universal fast dispatch, fixed transit, or delivery-by-event promises;
- universal custom sizing, free stitching, made-to-measure, fit guarantee, or alteration credit;
- universal product components, fiber composition, comfort, origin, authenticity, artisan, quality-inspection, or sustainability claims;
- invented customer reviews, reviewer identities, credentials, business addresses, or legal names.

## Release acceptance

A source change is not complete merely because an individual validator passes. Release acceptance requires:

1. lint, TypeScript, unit tests, and every source validator;
2. a token-backed production build with strict Shopify product prerendering;
3. generated-product, schema, feed, sitemap, privacy, claim, and internal-link validation;
4. a clean Vercel preview for the exact commit;
5. representative preview and production checks for status, canonical, robots, response headers, product facts, schema, internal links, shipping copy, and machine-readable files;
6. explicit reporting of any external operation that could not be completed.

## External systems

- Google Search Console controls crawl/index reports, sitemap submission status, URL Inspection, and validation workflows. Repository work cannot establish those outcomes.
- Google Merchant Center controls feed processing, item diagnostics, policy review, and account status. A locally valid feed is not proof of GMC acceptance.
- Existing Supabase Edge Functions and database migrations require access to the correct Supabase project. Deleting a function source from Git does not undeploy an already published function.
- Search engines, carriers, payment providers, and customers control events outside the storefront. No indexing, ranking, traffic, conversion, carrier, or revenue result is guaranteed.

## Measurement

After the exact production revision is live, compare GSC crawl/indexing and search performance, Shopify funnel events, checkout handoff, and support outcomes over meaningful periods. Treat changes as observations rather than proof that one deployment caused them. Set commercial targets only after establishing a verified baseline and responsible owner.
