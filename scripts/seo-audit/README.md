# SEO Audit Scripts

Three Bash scripts for diagnosing the indexation issues reported in Google
Search Console. Run them from the repo root.

## Quick start

```bash
# After deploying fixes, audit the 5 problem URLs from GSC:
./scripts/seo-audit/audit-redirects.sh \
  "https://luxemia.shop/nri/uk" \
  "https://luxemia.shop/our-story" \
  "https://luxemia.shop/jewelry"

# Audit canonical tags on the 4 "Duplicate, Google chose different canonical" URLs:
./scripts/seo-audit/audit-canonicals.sh \
  "https://luxemia.shop/URL1" \
  "https://luxemia.shop/URL2"

# Find any broken internal links in the codebase:
./scripts/seo-audit/find-broken-internal-links.sh
```

## Scripts

### `audit-redirects.sh`

Traces the full redirect chain for one or more URLs. Detects:
- Redirect loops (A → B → A)
- Redirect chains longer than 1 hop (A → B → C should be A → C)
- Soft-404-via-redirect (non-homepage URL that redirects to `/`)

**Fix criteria:** every URL should resolve in ≤ 1 hop, with a final 200 OK
status, on a non-homepage URL. Any URL that fails these criteria needs a
301 to a semantically equivalent page, or a 410 if retired.

### `audit-canonicals.sh`

Checks the canonical URL configuration for one or more URLs. Detects:
- Missing canonical tag in server-rendered HTML
- Multiple canonical tags (invalid HTML)
- Canonical URL that doesn't match the requested URL (non-self-referential)
- `noindex` directives in `X-Robots-Tag` header or `<meta name="robots">`
- Redirects on the canonical URL itself (which invalidate it)

**Fix criteria:** every indexable page should have exactly ONE canonical
tag, self-referential, matching the requested URL after redirects.

### `find-broken-internal-links.sh`

Scans the codebase (`src/`, `public/`, `index.html`) for hardcoded internal
`href="/..."` and `to="/..."` links, then HEAD-checks each one against the
live site. Reports any link that returns non-200 status.

**Fix criteria:** zero broken internal links. Any link that returns 404,
410, or 5xx needs to be either:
1. Replaced with the correct canonical URL in source code, OR
2. Added as a 301 redirect in `vercel.json`, OR
3. Added to `GONE_ROUTES` in `middleware.ts` for a 410 response.

## Environment variables

- `SITE_URL` — override the site URL (default: `https://luxemia.shop`)
- `AUDIT_UA` — override the User-Agent string (default: Googlebot)

```bash
SITE_URL=https://luxemia-staging.vercel.app ./scripts/seo-audit/find-broken-internal-links.sh
```

## Requirements

- `curl` (pre-installed on macOS / Linux)
- `ripgrep` (`rg`) — for `find-broken-internal-links.sh` only
- Internet access to the live site

## When to run

| Trigger | Script |
|---|---|
| After deploying redirect changes | `audit-redirects.sh` against the 5 GSC problem URLs |
| After deploying canonical fixes | `audit-canonicals.sh` against the 4 GSC duplicate-canonical URLs |
| Before every deploy | `find-broken-internal-links.sh` (catches regressions) |
| Weekly SEO health check | All three, against top 20 pages by GSC impressions |
