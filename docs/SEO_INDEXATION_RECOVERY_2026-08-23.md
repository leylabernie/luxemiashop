# LuxeMia SEO indexation recovery — implementation record

Date: 2026-08-23  
Source plan: `Luxemia_Shop_SEO_Recovery_Action_Plan.pdf`  
Production domain: `https://luxemia.shop`

## Implemented in this release

1. **HTTP-level query consolidation for every public HTML route**
   - All public URLs with a query string receive an HTTP `Link` header pointing to the clean, parameter-free canonical URL.
   - Known sorting, filtering, grid, internal-search, and collection-facet parameters receive `X-Robots-Tag: noindex, follow` in addition to the clean canonical.
   - Product `?variant=` URLs remain crawlable and canonical-only. They are not robots-blocked or noindexed because they can be legitimate product-variant and Merchant landing URLs.
   - Tracking parameters remain usable for attribution while consolidating to the clean canonical.

2. **Permanent release guard**
   - `scripts/validate-indexation-recovery.cjs` fails the build if query canonicalization, facet noindex handling, the variant safeguard, or the authoritative sitemap declaration regresses.
   - The validator also fails if a future change blocks query URLs in `robots.txt` before crawlers can read the HTTP canonical/noindex signals.

3. **Existing protections retained and verified by the build**
   - HTTPS apex-domain and trailing-slash consolidation.
   - Self-referencing clean canonicals on indexable pages.
   - Exact one-to-one 301 redirects for verified replacements.
   - True 404/410 responses when no relevant replacement exists.
   - Build-generated sitemap restricted to approved, prerendered, indexable, self-canonical destinations with no exact redirect-source conflicts.

## Deliberate safety corrections to the supplied plan

### No blanket robots.txt block for `?variant=`

Blocking a URL prevents crawlers from reading the page-level canonical. LuxeMia also uses product variants in commerce contexts. This release therefore uses a clean HTTP canonical for `?variant=` while reserving `noindex, follow` for filter/search URL noise.

### No blanket 301 of all 264 reported 404s

The supplied PDF contains aggregate counts but not the exact 264-URL export. Redirects are added only when the old URL and destination are a verified semantic match. URLs with no genuine replacement must remain true 404 or 410 responses; sending unrelated products to broad collections would create soft-404 signals and a poor shopper experience.

### Do not delete a healthy sitemap submission

The generated `https://luxemia.shop/sitemap.xml` remains the single authoritative sitemap. It is regenerated and validated during every production build. Search Console submission or resubmission is an owner-account action; deleting a valid sitemap record is not required for this code release.

## Remaining Search Console actions

These actions cannot be performed through the website repository or the Search Console API used by this project:

1. Obtain the exact current URL exports for:
   - Not found (404)
   - Crawled — currently not indexed
   - Duplicate, Google chose different canonical
   - Page with redirect
2. Classify every 404 as exact replacement, retired with no replacement, current route defect, or intentionally redirected source.
3. After production verification, use Search Console to validate only the issue groups whose live examples now pass.
4. Use URL Inspection to request indexing for a small set of priority canonical pages; repeated requests do not accelerate crawling.

## Release acceptance checks

- `npm run validate:indexation-recovery`
- `npm run lint`
- Full production build
- Representative live responses:
  - clean category: indexable, self-canonical
  - filtered category: 200, `noindex, follow`, clean canonical Link
  - product with `?variant=`: 200, clean canonical Link, not robots-blocked
  - retired URL: exact 301, true 404, or 410 according to verified disposition
  - sitemap: 200 and contains only approved canonical destinations
