# ALL DETAILS — LuxeMia $0 Recovery: Diagnosis, Edits, and Owner Steps

**Date:** 2026-11-05 · **Site:** https://luxemia.shop · **Branch:** `arena/6f9bdcc8-luxemiashop`
**Status of code:** 14 files modified + 1 new file, **uncommitted in this workspace — not yet on GitHub, not deployed.** Say "commit and push" to publish.
**Full reports:** `docs/audits/SEO-AEO-GEO-REVIEW-2026-11-05.md` · `docs/growth/ZERO-CLICK-RECOVERY-2026-11-05.md` · `docs/growth/TWO-DOLLAR-A-DAY-ADDENDUM-2026-11-05.md` · `docs/growth/FREE-TRAFFIC-KIT-2026-11-05.md`

---

## PART 1 — THE DIAGNOSIS (why no clicks, no orders)

### Your numbers (from your own repo's analytics exports)

| Metric | Value | Source |
|---|---|---|
| Google Search clicks, 13 Sep–10 Oct 2026 | **27 clicks / 1,961 impressions / 1.4% CTR / avg position 16.3** | `docs/audits/search-and-images-2026-10-12.md` |
| GA4 funnel, 6–12 Oct 2026 | **135 sessions → 57 product viewers → 3 carts → 3 checkouts → 0 purchases** | `docs/growth-reference-benchmark-2026-10-13.md` |
| Shopify paid orders that week | **0** | same |
| Retired products returning 410 | **1,543 handles** (`src/data/legacyGoneProductHandles.json`) | repo |
| Live catalogue | ~383 products in `/collections`; `/sarees` ~91; designer sarees **4**; jewelry **0**; Kanchipuram **0**; gharara **0** | live crawl |
| Google reviews on directories | **0** (fyple, merchantcircle) | web check |
| Merchant Center | ID 5773333098, free listings only, product sync Off, 18-day delivery estimate | repo audit |

**Verdict: Google is not suppressing you. You are out-inventoried (4-product categories cannot rank against Utsav/Cbazaar/Kalki), you have zero authority (no reviews/links), and the visitors you do get hit a funnel that has never converted (3 checkouts → 0 purchases). Traffic is not the first bottleneck — trust and the funnel are.**

### Hypotheses tested and RULED OUT with evidence

- Googlebot served broken/noindex pages — **ruled out** (sitemap URLs 200, index/follow, self-canonical).
- www vs apex duplication — **ruled out** (`middleware.ts` enforces www → apex 301).
- Hreflang/canonical drift — **ruled out** (prerender rewrites en-US + x-default per route).
- Store de-indexed — **ruled out** (brand/category SERPs return real pages). Only part of the catalogue is indexed.

### What's already good — do NOT rebuild

Self-referential canonicals · per-bot layered `robots.txt` (Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, ClaudeBot, GPTBot…) · 5-file sitemap index · `llms.txt`, merchant feed, OpenAI search feed all live · real 410s for retired products · rich schema (Organization, ProductGroup, Offer, FAQPage, BreadcrumbList) · 44-article blog with author page, editorial/review policies, NIST/FTC sources · deliberate ethics: `buildAggregateRating()` outputs nothing without real reviews — **keep it that way.**

---

## PART 2 — EVERY EDIT MADE (11 fixes, $0, verified)

| # | Problem | Fix | File(s) | Verification |
|---|---|---|---|---|
| 1 | Product titles doubled the brand: `"Purple Palazzo Set \| LuxeMia USA \| LuxeMia"` (`ProductDetail` appends `\| LuxeMia USA`, `clampTitle` only stripped `\| LuxeMia`) | Strip optional `USA` qualifier with the brand suffix; new regression tests for `\| LuxeMia USA` inputs | `src/lib/meta/clamp.ts`, `tests/seoMetadataLimits.test.mjs` | `node --test tests/seoMetadataLimits.test.mjs` → **6/6 pass** |
| 2 | Homepage FAQ answers unmounted when closed → absent from HTML while FAQPage schema declared them (schema/content mismatch) | Answers stay mounted with `hidden` + `aria-expanded`; first FAQ open by default | `src/pages/Index.tsx` | source review |
| 3 | Empty `/jewelry` (0 products, noindex) linked from homepage footer content | Both links removed; block replaced with `/ready-to-ship` (50 live products) | `src/components/seo/SEOFooterContent.tsx` | grep → 0 `/jewelry` refs |
| 4 | Organization schema had only country+region; support languages undeclared | Added `addressLocality: 'Philadelphia'`, `availableLanguage: [English, Hindi, Gujarati]` — **both already public on-site** (Footer, BrandStory, Returns). No street address added: the site doesn't publish one, so none was declared | `src/lib/schema.ts` | source review |
| 5 | Merchant feed could emit retired (410) products | Generator now excludes every handle in `legacyGoneProductHandles.json` in both live-catalog and snapshot paths | `scripts/generate-static-feed.cjs` | `node --check` OK |
| 6 | `llms-full.txt` byte-identical to `llms.txt` (1,545 bytes) while `robots.txt` advertised a "full page inventory" | New generator builds a real inventory from `seoArchitecture.json`, excluding empty-catalogue routes | `scripts/generate-llms-full.cjs` (new), `public/llms-full.txt` regenerated | 1,545 → 6,215 bytes, 15 routes, 0 jewelry refs |
| 7 | Header nav linked TWO empty collections | Removed Kanchipuram Sarees + Mirror Work Lehengas from nav | `src/components/layout/Header.tsx` | grep clean |
| 8 | **No Meta/Pinterest/TikTok pixel anywhere (grep: zero matches)** — every visitor lost; retargeting impossible | New env-driven loader: no ID set = loads nothing (no invented IDs); GA4 production-gated like your existing analytics; PDP `ViewContent` sends the product **handle** to match `public/feeds/meta-catalog.csv` IDs | `src/lib/marketingPixels.ts` (new), `src/App.tsx`, `src/hooks/useAnalytics.ts`, `src/pages/ProductDetail.tsx` | source review + syntax |
| 9 | `vercel.json` CSP would block any pixel (`connect.facebook.net` etc. absent) | `script-src` + `connect-src` widened for Facebook/TikTok/Pinterest in both header blocks | `vercel.json` | JSON still parses |
| 10 | Bot-served homepage (prerender) had NO FAQ answers and linked the empty customizable-outfits route | Full FAQ section mirrored from `Index.tsx`; dead link removed | `scripts/prerender.js` | `node --check` OK |
| 11 | Pixel setup undocumented | Free-account instructions added | `.env.example` | — |

**Test limitation (pre-existing):** `tests/emptyCollectionNavigation.test.mjs` can't run in this sandbox (no `node_modules`/`esbuild`) — it fails identically on the untouched tree. Not a regression.

### Corrections to my own earlier claims (kept on record)

1. "`/sitemap-pages.xml` lists a bare `/daily` URL that 404s" — **my error**, a parsing artifact (it was the homepage's `<changefreq>daily</changefreq>`). Retracted.
2. "`/jewelry` is in the sitemap at priority 0.9" — **my error**; it's filtered out at build by `emptyCatalogRoutes`. Retracted.
3. "Only 3 merchant-feed items point at dead products" — **wrong twice.** Live feed (built from Shopify at deploy, fresh 2026-11-05 timestamp) carries current handles and is fine. The **checked-in snapshot** `public/merchant-feed.xml` is **100% retired — all 739 handles / 4,208 items return 410**, zero overlap with your 337 active sitemap products. (An intermediate "303 dead" count was also mine — it only matched links without `?variant=`.) The snapshot must be refreshed via `MERCHANT_FEED_REFRESH_SOURCE`, not hand-edited; it was restored untouched, and fix #5 guarantees no future feed can emit a 410 handle.

---

## PART 3 — YOUR BUSINESS FACTS (verified, used in the fixes)

- **Brand:** LuxeMia · **Site:** luxemia.shop · **Shopify:** lovable-project-zlh0w.myshopify.com (Storefront API 2025-10)
- **Legal entity (per /terms):** Glamour Indian Wear, Philadelphia, PA — phone **+1-215-341-9990**, WhatsApp **https://wa.me/12153419990**, email **hello@luxemia.shop**
- **Founder:** Mini — Surat textile family, 30 yrs in the U.S., answers personally in **English, Hindi, Gujarati**
- **Shipping (published):** US $14.99, free $150+ · CA/UK $24.99, free $299+ · AU/NZ $29.99, free $349+ · ZA $49.99 · MU $59.99 · dispatch 3–4 business days, transit 9–14 → **12–18 business days total** (15–21 with alterations)
- **Returns (published):** change-of-mind returns not accepted; damage/defect claims within **48 hours** with photos + continuous unboxing video; "orders ship from India" framing in `returnPolicyCopy.ts`
- **Welcome code in code:** `FIRST10` (10%) — referenced in header, popup, Navratri page, blog. **Unverified in Shopify Admin — see Step 1 below**
- **Prices reality check:** merchant-feed median $115.99; 74.5% of offers under the $150 free-shipping threshold
- **Diwali 2026 = 8 Nov 2026** — the homepage Diwali hero is now a dead campaign against a 12–18-day delivery promise. Swap it (Step 5)

---

## PART 4 — WHAT ONLY YOU CAN DO (all free, in order)

### Step 1 — Verify FIRST10 (2 minutes)
Shopify Admin → Discounts. If `FIRST10` (10% off, one use per customer, online store) is not active, create it — or tell me and I'll strip every mention from the code. Right now a dead code may be promised at the exact moment of purchase.

### Step 2 — Test your own checkout (30 minutes, highest-value hour of the week)
On your phone, real card, buy the cheapest in-stock item, complete payment, then refund yourself. Write down every friction point. Your funnel shows 3 checkouts → 0 purchases; until you see why, all traffic work is decoration.

### Step 3 — Activate the free pixels I built (15 minutes, $0)
1. **Meta:** business.facebook.com → Events Manager → Connect Data → Web → Create Pixel → copy the numeric ID.
2. **Pinterest:** ads.pinterest.com → Conversions → create tag → copy ID. (Account creation is free; you never have to run ads.)
3. **TikTok (optional):** ads.tiktok.com → Tools → Events → Web Events → copy pixel ID.
4. **Vercel:** project → Settings → Environment Variables (Production) → add `VITE_META_PIXEL_ID`, `VITE_PINTEREST_TAG_ID`, `VITE_TIKTOK_PIXEL_ID` → Redeploy.
Done. The code loads them only on luxemia.shop, sends PageView + product ViewContent automatically. No IDs = nothing loads.

### Step 4 — Free listings (1 hour)
- **Google Merchant Center (5773333098):** confirm the feed reprocesses after deployment; clear Diagnostics; confirm free listings are opted in (Growth → Programs).
- **Microsoft/Bing Merchant Center:** create free account → import the Google feed. Low competition, your own repo already flagged this as high-yield.
- **Pinterest catalogue:** connect `https://luxemia.shop/feeds/meta-catalog.csv` (155 products, already built, currently unused). Create boards: "Indian Wedding Guest Outfits USA", "Ready to Ship Sarees USA", "Lehenga Choli for Reception", "Mother of the Bride Indian Outfits", "Plus Size Indian Ethnic Wear USA".

### Step 5 — Fix the two conversion killers (1 hour)
- **Homepage hero:** replace Diwali creative with "Order by 20 Nov for December wedding delivery" (honest against 12–18 business days). Assets pattern: `public/images/campaigns/`.
- **GBP:** post weekly, and send the review ask (Part 5) to every past real customer. Review link: https://search.google.com/local/writereview?placeid=ChIJw2TQgyx3_WgRbxjTw6E4KhY

### Step 6 — WhatsApp your existing contacts (Part 5 scripts)
Small batches, personal replies. This remains your only realistic week-one order source.

### Step 7 — Three 20-second phone videos of Mini
① "How I check your outfit before dispatch" ② "Send me your measurements — I'll tell you honestly if it'll fit" ③ One in-stock outfit in natural light. These feed WhatsApp, GBP, Pinterest — and later, retargeting creative.

---

## PART 5 — COPY-PASTE SCRIPTS (from FREE-TRAFFIC-KIT)

**WhatsApp broadcast (English):**
> Namaste, this is Mini from LuxeMia in Philadelphia 🙏 I personally check every outfit before it ships. If you have an event coming up, reply with your date, size and favourite colour and I'll send you 3 options that are actually in stock. You can talk to me in English, Hindi or Gujarati. Browse here: https://luxemia.shop/ready-to-ship — U.S. shipping is $14.99, free over $150.

**WhatsApp (Hinglish):**
> Namaste, main Mini, LuxeMia Philadelphia se 🙏 Koi shaadi ya function aa raha hai? Apni date, size aur pasand ka colour bhej dijiye — main khud 3 in-stock options bhej dungi, aur fitting samjha dungi. Call/WhatsApp isi number par: main English, Hindi, Gujarati — teeno mein baat kar sakti hoon.

**Review ask (real customers only, never incentivised):**
> Namaste [name], Mini from LuxeMia. I hope the [outfit] worked well for your [event]. Would you do me one favour? A short Google review helps other families trust a small store like mine: https://search.google.com/local/writereview?placeid=ChIJw2TQgyx3_WgRbxjTw6E4KhY — even two lines about the fabric and fit helps. Thank you 🙏

**GBP weekly post:**
> Looking for a wedding guest outfit with support right here in Philadelphia? Browse ready-to-ship sarees, lehengas and suits, then call Mini at +1-215-341-9990 in English, Hindi or Gujarati for honest fit help before you order. [link]

**Do not mention any discount code in any message until Step 1 is verified.**

---

## PART 6 — THE $2/DAY, EXPLAINED IN FULL

- $2/day = $14/week ≈ $60/month. At US ethnic-fashion CPMs ($15–30) that's ~65–130 impressions/day → **0–2 clicks/day**. You need 100–200 cold clicks per order at a normal conversion rate; your current rate is 0%. Cold ads at $2/day = months of spend before a sale is even statistically possible, and Meta never exits its learning phase (~50 conversions/week needed).
- **The one job $2/day CAN do: retargeting.** A few hundred warm product-viewers cost $1–3/day to reach repeatedly. That's why Part 2 #8 exists — build the pool free first.
- **Switch-on trigger:** 500+ pixel product viewers, OR your first order (proof the funnel closes). Then: one ad set, website/product viewers 180 days, US+CA, Mini's videos, 12 vouched in-stock SKUs.
- **Alternative:** bank 30 days → one $20/day × 3-day hyper-local (Philadelphia 15–25 mi) Click-to-WhatsApp burst. Or spend the $60 subsidising free shipping on the first 4 orders — buying proof (reviews, photos, purchase events) instead of impressions.
- **Realistic expectations:** Week 1 — ~0 from ads/listings; 0–2 orders possible, almost certainly from your own contacts. Month 2–3 at $2/day retargeting — first paid order becomes plausible. 90-day goal: 5 paid orders/week at 2%+ conversion. Anyone promising more, faster, at $0–2/day is lying to you.

---

## PART 7 — GIT STATE (exact)

- Branch: `arena/6f9bdcc8-luxemiashop` · HEAD: `f33c847` (unchanged)
- Modified (14): `.env.example`, `public/llms-full.txt`, `scripts/generate-static-feed.cjs`, `scripts/prerender.js`, `src/App.tsx`, `src/components/layout/Header.tsx`, `src/components/seo/SEOFooterContent.tsx`, `src/hooks/useAnalytics.ts`, `src/lib/meta/clamp.ts`, `src/lib/schema.ts`, `src/pages/Index.tsx`, `src/pages/ProductDetail.tsx`, `tests/seoMetadataLimits.test.mjs`, `vercel.json` — 131 insertions, 40 deletions
- New: `src/lib/marketingPixels.ts`, `scripts/generate-llms-full.cjs` (note: `.gitignore` has `scripts/*` — this file needs `git add -f` when committing), and 5 docs (`docs/audits/SEO-AEO-GEO-REVIEW-2026-11-05.md`, `docs/growth/ZERO-CLICK-RECOVERY-2026-11-05.md`, `docs/growth/TWO-DOLLAR-A-DAY-ADDENDUM-2026-11-05.md`, `docs/growth/FREE-TRAFFIC-KIT-2026-11-05.md`, this file)
- **Nothing committed, pushed, or deployed.** luxemia.shop is unchanged until you say "commit and push" (then merge the PR / deploy on Vercel as usual).
