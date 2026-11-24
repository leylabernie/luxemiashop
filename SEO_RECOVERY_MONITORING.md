# GSC Recovery Monitoring — luxemia.shop

**Day 0: 2026-11-24** · Owner action required: Google Search Console (manual)
**Root cause & fix:** see [SEO_RECOVERY_REPORT.md](./SEO_RECOVERY_REPORT.md). The hreflang/canonical conflict fix in `scripts/prerender.js` is present in this branch and was promoted to `luxemia.shop` / `www.luxemia.shop` (deployment `dpl_54LMA9fFdxXD5gktpYPnJt6kudgL`).

> No deployment was performed in this session. The monitoring infrastructure (tracking tab, live-tag verifier, tests) was added; see §5.
**Tracking sheet:** [Google Sheet → "Recovery Tracking" tab](https://docs.google.com/spreadsheets/d/1Zn4boY0awsO9tSxFfuijA643hx68jDxF5Wlewn9bK6M/edit#gid=1981660601)

---

## 1. Data source

Google Sheets export `luxemia.shop-Performance-on-Search-2026-11-24`
(`1Zn4boY0awsO9tSxFfuijA643hx68jDxF5Wlewn9bK6M`), tabs: Chart, Queries, Pages, Countries, Devices, Search appearance, Filters.

- Search type: **Web**, date filter: **Last 3 months**
- Daily data: **2026-08-23 → 2026-11-22** (92 days); export date 2026-11-24
- GSC data lags ~2 days, so the most recent complete day is 2026-11-22
- Baseline used in the recovery report: **~440 impressions/day, ~6 clicks/day**
- Live checkpoint log: the **"Recovery Tracking" tab** in this spreadsheet — Day-0 baseline pre-filled, dated checkpoints Nov 26 → Dec 8, auto-calculating % of target, and a daily-impressions chart

**Important:** because the fixed deployment has only just gone live, none of the numbers below reflect it yet. These are the clean **Day-0 baseline** against which the fix must be measured.

## 2. Current traffic (Day-0 baseline)

| Window | Clicks/day | Impr/day | Avg. position | vs. 440 impr/day |
|---|---|---|---|---|
| Collapse trough, Aug 23 – Sep 25 (34 d) | 0.12 | 28.8 | 58.3 | 6.5% (−93.5%) |
| Recovery, Sep 26 – Nov 22 (58 d) | 1.34 | 132.9 | 14.1 | 30.2% |
| October (31 d) | 1.23 | 123.4 | 12.5 | 28.0% |
| November 1 – 22 | 1.45 | 152.9 | 17.6 | 34.8% |
| **Last 28 days (Oct 26 – Nov 22)** | **1.39** | **156.1** | **16.2** | **35.5% (−64.5%)** |
| **Last 7 days (Nov 16 – Nov 22)** | **0.71** | **165.3** | **15.9** | **37.6% (−62.4%)** |

Whole-window totals: **82 clicks / 8,686 impressions** over 92 days. Best single day: 2026-10-27 (217 impressions, 2 clicks). Last 7 days: 5 clicks, 1,157 impressions, 4 zero-click days (CTR 0.43%).

**Reading:** the "clicks to 0 / −92% impressions" collapse is visible in the Aug 23 – Sep 25 trough. A sharp inflection on **2026-09-26** (impressions 35 → 130, avg. position 23.4 → 10.9) began a partial recovery, but traffic has **plateaued around 150–165 impressions/day and 1–1.5 clicks/day since late October** — roughly one-third of baseline impressions and one-fifth of baseline clicks. Recovery has stalled well short of full restoration; that residual gap is what the hreflang fix should close.

### De-indexation signature still visible (3-month aggregates)

Almost all clicks come from the homepage and two editorial pages; commercial category pages get impressions but **zero clicks** at very poor positions:

| Page | Clicks | Impr | CTR | Position |
|---|---|---|---|---|
| `/` | 40 | 1,150 | 3.48% | 5.78 |
| `/blog/indian-to-us-clothing-size-conversion-guide` | 14 | 3,649 | 0.38% | 8.41 |
| `/sizing-measurements-guide` | 11 | 724 | 1.52% | 12.95 |
| `/sarees` | 0 | 1,076 | 0% | 46.02 |
| `/lehengas` | 0 | 406 | 0% | 60.53 |
| `/collections/sharara-suits` | 0 | 214 | 0% | 54.54 |
| `/collections/party-wear-lehengas` | 0 | 144 | 0% | 72.19 |
| `/collections/designer-sarees` | 0 | 123 | 0% | 51.24 |
| `/collections/wedding-guest-outfits` | 0 | 116 | 0% | 37.92 |
| `/collections/wedding-sarees` | 0 | 63 | 0% | 31.86 |
| `/collections/bridal-lehengas` | 1 | 82 | 1.22% | 61.96 |

Queries tell the same story: brand terms (`luxemia`, `luxmiya`) get the clicks, while high-intent commercial queries (`wedding sarees` 126 impr / pos 59.02, `wedding saree` 111 / 77.41, `indian wedding sarees` 96 / 60.71, `bridal lehenga` 62 / 73.45) get **0 clicks**. "Product snippets" search appearance: 1,372 impressions, 2 clicks, avg. position 55.67.

## 3. Manual actions to do in Google Search Console (today)

### A. Confirm the fix is actually live before requesting indexing

From a terminal (or GSC → **URL Inspection → Test Live URL → View Tested Page → HTML**), on any product page:

```bash
curl -s -A "Googlebot" https://luxemia.shop/product/deep-purple-gold-butta-kanjivaram-silk-saree | grep -E "canonical|hreflang"
```

Expected: the `<link rel="canonical">` and **both** hreflang alternates (`en-US`, `x-default`) point to that same product URL. Any hreflang still pointing to `https://luxemia.shop/` means the old prerendered assets are still being served — **stop and re-check the Vercel deployment/alias before spending indexing requests**.

**Automated alternative (recommended):** `node scripts/verify-live-seo-tags.cjs` checks all 12 priority URLs as Googlebot and exits non-zero on any mismatch. After a local build, `node scripts/verify-live-seo-tags.cjs --dir dist/_prerender` validates every prerendered page with no network access; `--selftest` verifies the parser offline. Its logic is covered by `tests/liveSeoTagsVerifier.test.cjs` inside `npm test`.

Also confirm the Vercel production deployment is `READY` and promoted to both `luxemia.shop` and `www.luxemia.shop`, and that `SHOPIFY_STOREFRONT_TOKEN` is set in production env vars (see §7 of the recovery report). The Vercel connector in this session could authenticate but returned **Access denied** on deployment reads, so this could not be verified here.

### B. URL Inspection + Request Indexing (priority list)

GSC caps Request Indexing to a small daily quota, so do these in priority order and repeat with the next batch on subsequent days. Use the highest-impression, zero-click pages first, plus a couple of representative product URLs:

1. `https://luxemia.shop/sarees`
2. `https://luxemia.shop/lehengas`
3. `https://luxemia.shop/collections/sharara-suits`
4. `https://luxemia.shop/collections/party-wear-lehengas`
5. `https://luxemia.shop/collections/designer-sarees`
6. `https://luxemia.shop/collections/wedding-guest-outfits`
7. `https://luxemia.shop/collections/wedding-sarees`
8. `https://luxemia.shop/collections/bridal-lehengas`
9. `https://luxemia.shop/product/deep-purple-gold-butta-kanjivaram-silk-saree`
10. `https://luxemia.shop/product/black-maroon-rayon-kodi-lace-navratri-lehenga-choli-set`

For each: **URL Inspection → Test Live URL** (confirm canonical + hreflang are self-referential and the page returns 200, not a soft 404) → **Request Indexing**. Record the "Google-selected canonical" and coverage status shown.

### C. Resubmit the sitemap

`sitemap.xml` is a **sitemap index**, not a URL list. It references five children that are generated at build time by `scripts/generate-sitemap.cjs`:

- `/sitemap-products.xml`
- `/sitemap-collections.xml`
- `/sitemap-guides.xml`
- `/sitemap-pages.xml`
- `/sitemap-images.xml`

Before resubmitting, verify all six URLs return **200 OK**, the child sitemaps contain live canonical URLs, and the index `lastmod` is a fresh date (the checked-in `public/sitemap.xml` fallback is stale at `2026-09-26`; the build-generated version uses the build date). Then in GSC → **Sitemaps**: remove/re-add or resubmit `https://luxemia.shop/sitemap.xml` and confirm status **Success** with a plausible discovered-URL count. If GSC reports "Couldn't fetch" for children, resubmit each child individually.

**Verified live on 2026-11-24:** the production `/sitemap.xml` index reports `lastmod` **2026-11-24** — i.e. the fresh build-generated index, not the stale `2026-09-26` fallback checked into `public/`. All five child sitemaps (`products`, `collections`, `guides`, `pages`, `images`) resolve with populated canonical URL lists, and `/robots.txt` declares `Sitemap: https://luxemia.shop/sitemap.xml` while keeping `/product/`, `/collections/`, `/sarees` and `/lehengas` crawlable for Googlebot. Resubmission can therefore proceed without a rebuild first.

Note: production builds also call `scripts/submit-indexnow.cjs` to notify IndexNow. That is a discovery signal only and does **not** replace GSC Request Indexing.

### D. Record the Pages (Indexing) report snapshot

In GSC → **Indexing → Pages**, note today's counts for: "Duplicate, Google chose different canonical", "Crawled – currently not indexed", "Indexed", and "Excluded". These are the leading indicators — they should fall before impressions rise. Use **Validate Fix** on the duplicate/canonical groups once the live HTML is confirmed correct (more efficient than requesting indexing URL-by-URL).

## 4. Monitoring schedule (from the recovery report's 3–14 day timeline)

| Checkpoint | Date | What to check | Expected signal |
|---|---|---|---|
| Day 1–2 | Nov 25–26 | URL Inspection live test, GSC Sitemaps status, Vercel build/alias | Corrected HTML served; sitemap "Success"; recrawl begins |
| Day 3–5 | Nov 27–29 | Pages report, Performance (compare last 7 d vs. prior 7 d) | "Duplicate / different canonical" counts start dropping; hreflang errors clear |
| Day 5–10 | Nov 29 – Dec 4 | Performance 28-day view, Pages indexed count, commercial query positions | Impressions climb from ~165/day toward **200+/day**; product URLs returning to index; positions for `wedding sarees` etc. improve from 60–80 |
| Day 10–14 | Dec 4 – Dec 8 | Performance, Queries, Pages | Approaching **440+/day impressions** and **6+/day clicks**; category-page clicks > 0 |

Compare like-for-like **7-day and 28-day rolling averages**, not single days (daily clicks are noisy: 4 of the last 7 days had 0 clicks). Remember the ~2-day GSC lag: a change visible on Nov 26 reflects crawling through ~Nov 24. Log each check-in in the **Recovery Tracking** tab (columns D–E for 7-day totals; column H computes % of the 440/day target automatically).

### Escalation triggers

- By **Dec 4 (Day 10)**, 7-day average still ≤ 165 impressions/day, or duplicate/canonical exclusions not declining → re-run the curl check with `?` and `www.` variants, confirm the Vercel edge middleware is serving the `_prerender` HTML and not `dist/index.html`, and confirm the production build ran the full `npm run build` pipeline (prerender + sitemap generation), not just `vite build`.
- If Google-selected canonical still resolves to `/` for product URLs → the fix is not live; re-deploy before further indexing requests.
- If sitemaps show "Couldn't fetch" or 404 on children → regenerate via `npm run build` and check the deployment's `dist/` contents.
- Clicks and CTR lagging impressions is normal at this stage (positions ~16–20, low intent). Judge success on impressions + indexed-page counts first, CTR later.

## 5. Verification done in this session (2026-11-24)

- Branch `arena/07268761-luxemiashop`; the hreflang fix is present in `scripts/prerender.js` (~lines 2640–2675): canonical, `og:url`, `en-US` and `x-default` hreflang tags rewritten to each route's canonical URL; hreflang/canonical removed for `noIndex` routes. `index.html` base template has 2 hreflang tags (lines 70–71), matching the script. The only working-tree changes are the monitoring additions below.
- Dependencies installed (`npm ci`), then `npm test` → **982 tests, 0 failures** (938 + 11 + 33); `npx vite build` → **clean**.
- Added `scripts/verify-live-seo-tags.cjs` (live / `--dir` / `--selftest` modes) and `tests/liveSeoTagsVerifier.test.cjs` (11 cases), wired into `npm test`; `.gitignore` gained a negation so the script is tracked. Selftest: **6/6 passed**. `--dir` smoke test on fixture HTML: **3/4 OK**, correctly flagging a deliberately broken homepage-pointing hreflang.
- Added the **"Recovery Tracking"** tab to the GSC spreadsheet: baseline + reference tables, dated checkpoint rows with % -of-target formulas, 92-row daily series mirrored from the Chart tab, and a line chart of daily impressions (chart id `1357200394`).
- Verified the live site end to end over HTTPS: homepage and product pages render, welcome offer is **`FIRST10`**, `/sitemap.xml` (`lastmod` 2026-11-24) plus all 5 child sitemaps are populated, and `/robots.txt` is correct.
- Validators: `validate:indexation-recovery`, `validate:seo-architecture`, `validate:shopify-catalog`, `validate:policy-copy`, `validate:blog`, `validate:legacy-redirects` all **OK**. `validate:product-retirement-lifecycle` reported `fetch failed` — it needs live Shopify API access, which this sandbox does not have. This is an environment limitation, not a code regression; it must pass in the Vercel build environment (which has `SHOPIFY_STOREFRONT_TOKEN`).
- Vercel connector: `get_authenticated_user` succeeded (account `lab.bhamini@gmail.com`, flagged `limited`), but `get_deployment`, `list_deployments`, `list_projects` and `get_domain` all returned **Access denied** — the token lacks deployment/project read scope, even with the correct `team_id`. The Vercel dashboard (or a token with those scopes) is needed to confirm deployment `dpl_54LMA9fFdxXD5gktpYPnJt6kudgL` is READY on both domains. The fresh sitemap `lastmod` is strong indirect evidence that the full production build ran today.
- Page fetching reaches the live site but strips `<head>` markup, and the bash sandbox has no outbound HTTPS to `luxemia.shop`, so canonical/hreflang must still be confirmed with the curl/verifier command above or GSC's live test. This is the one check that cannot be completed from this environment.

## 6. Constraints preserved

- Welcome offer `FIRST10` only; no retired codes (`LUXE10`, `LUXE15`, `LUXE20`).
- No forbidden claims (`MerchantReturnPolicy`, `priceValidUntil`, `worldwide`, `handcrafted`, `artisan-made`, `100% authentic`) in SEO/schema/copy surfaces enforced by the validators.
- The live product page shows `FIRST10` and no retired codes; no forbidden claims were introduced (all edits are docs + a verifier script + a test).
- No deployment was performed: all validators + `npm test` + `npx vite build` remain the gate before any future deploy.
