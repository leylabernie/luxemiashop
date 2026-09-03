# LuxeMia search-recovery implementation record

Property: `https://luxemia.shop`
Repository: `leylabernie/luxemiashop`

This document separates source findings from Google outcomes. It does not claim that the current worktree is merged, deployed, recrawled, indexed, or accepted by Google Search Console or Google Merchant Center.

## Reported performance context

An earlier GSC snapshot supplied for the audit showed daily impressions falling from roughly 440 to 36 and clicks from roughly 6 to 0. Those figures are historical context. Current dates, query/page segments, indexing states, and recrawl evidence must be read from GSC before drawing a causal conclusion.

## Source findings

The historical implementation contained several material risks:

- base-template `hreflang` values could disagree with a route's self-canonical URL in prerendered output;
- Shopify API clients and build-time generators used inconsistent versions;
- source-mutating build scripts could reintroduce stale SEO, shipping, entity, and catalog copy;
- static or heuristic product fallbacks could emit pages, schema, feeds, or sitemap URLs without current Shopify evidence;
- query/filter URLs and retired product paths required consistent canonical, robots, redirect, 404, or 410 handling.

These defects are plausible contributors to discovery or canonical-selection problems. Source inspection alone cannot assign a percentage of the traffic decline to any one defect or prove that Google dropped pages for that reason.

## Current source safeguards

- Canonical URLs and stable entity identifiers use `https://luxemia.shop`.
- Machine-readable endpoints redirect `www` to the apex host.
- Indexable routes use self-canonicals; uncontrolled filters and internal search are excluded from indexation without creating broad facet crawl paths.
- Unknown or unavailable Shopify product lookups fail closed instead of receiving fabricated product HTML.
- Product pages, Product schema, Merchant offers, AI-search records, checkout links, and sitemap membership derive from current Shopify data and explicit evidence.
- Product orderability and availability require explicit positive availability.
- Sitemap output is generated from canonical, substantive, prerendered routes and separated by route class.
- Feed and sitemap snapshots are generated into the deployable artifact, not maintained as stale public source files.
- Release scripts validate committed source; retired source mutators are absent and cannot run during a build.
- IndexNow notifications describe submitted changes only and do not claim guaranteed crawl or indexation.

## Required verification for an exact revision

Before merge:

1. run lint, TypeScript, tests, and every release validator;
2. run the full build with the required Shopify credentials;
3. confirm the build does not alter tracked source;
4. validate representative generated products, collections, guides, trust pages, schemas, feeds, and sitemap files;
5. inspect a READY Vercel preview for the exact commit.

After merge:

1. wait for the production deployment of that commit to reach READY;
2. verify apex and `www` behavior, status, canonical, robots meta, `X-Robots-Tag`, structured data, internal links, and product facts on representative routes;
3. verify public robots, sitemap index and splits, Merchant feed, AI-search feed, `llms.txt`, and change manifest;
4. record the exact production commit and deployment identifier.

## Search Console and Merchant Center

GSC remains the authority for Google-selected canonical, crawl date, indexed state, sitemap processing, exclusions, impressions, and clicks. After live verification, inspect a small representative set with URL Inspection, submit or confirm the canonical sitemap, and validate only issue groups whose live examples now pass. A request does not force or accelerate indexing.

GMC remains the authority for feed fetches, item diagnostics, policy status, destinations, price/availability mismatches, and product approval. Generated-feed validation is necessary but is not proof of ingestion or approval.

## Monitoring standard

Track crawl/indexing state and search performance after recrawl without promising a recovery date, traffic target, or ranking outcome. Compare consistent page/query segments and annotate deployment dates. Treat correlation as a lead for investigation, not proof of causation.
