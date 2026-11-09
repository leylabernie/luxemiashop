# Free Traffic Kit — What AI Can Do at $0

**Date:** 2026-11-05
**Companion:** `SEO-AEO-GEO-REVIEW-2026-11-05.md`, `ZERO-CLICK-RECOVERY-2026-11-05.md`, `TWO-DOLLAR-A-DAY-ADDENDUM-2026-11-05.md`
**Rule for everything below:** no invented products, prices, reviews, ratings or delivery promises. Every fact used is already published on luxemia.shop (shipping page, homepage FAQ, BrandStory, Returns). Where a SKU or price is needed, the owner fills the bracket — AI must not guess it.

---

## 0. Done for you already (code, this branch, $0)

| # | Fix | File(s) | Verified |
|---|---|---|---|
| 1 | Doubled-brand page titles (`"... \| LuxeMia USA \| LuxeMia"`) | `src/lib/meta/clamp.ts` + regression test | `node --test tests/seoMetadataLimits.test.mjs` → 6/6 |
| 2 | Homepage FAQ answers invisible to bots/AI (schema with no matching copy) | `src/pages/Index.tsx` — answers stay mounted (`hidden`), `aria-expanded`, first FAQ open by default | source review |
| 3 | Empty `/jewelry` (0 products, noindex) linked from homepage footer content | `src/components/seo/SEOFooterContent.tsx` — replaced with `/ready-to-ship` | grep: 0 `/jewelry` refs remain |
| 4 | Organization schema missing locality + support languages | `src/lib/schema.ts` — `addressLocality: Philadelphia`, `availableLanguage: English/Hindi/Gujarati` (both already stated on-site; **no street address added — none is published on the site, so none was declared**) | source review |
| 5 | Merchant feed must never emit retired (410) products | `scripts/generate-static-feed.cjs` now excludes every handle in `legacyGoneProductHandles.json` in both the live-catalog and snapshot-sanitize paths | `node --check` OK; live feed sampled 2026-11-05 (fresh build timestamp, current handles) |
| 6 | `llms-full.txt` byte-identical to `llms.txt` while robots.txt advertised a "full page inventory" | New `scripts/generate-llms-full.cjs` builds it from `seoArchitecture.json`, excluding empty-catalogue routes | 1,545 → 6,215 bytes, 0 jewelry refs |

## 0b. Round 2 — challenge accepted (same day, still $0)

| # | Fix | File(s) |
|---|---|---|
| 7 | Header nav linked TWO empty collections (Kanchipuram, Mirror Work Lehengas) | `src/components/layout/Header.tsx` — both removed |
| 8 | **No retargeting pixel existed** — every visitor was lost forever, making even $2/day useless | New `src/lib/marketingPixels.ts`: env-driven Meta/Pinterest/TikTok loader, GA4-gated, **no-op until the owner pastes a free ID**; wired in `App.tsx` + `useAnalytics.ts`; PDP sends `ViewContent` keyed by product **handle** to match `meta-catalog.csv` IDs (`ProductDetail.tsx`) |
| 9 | CSP would have blocked any pixel | `vercel.json` — `script-src`/`connect-src` widened for the 3 networks (both header blocks) |
| 10 | Bot-served homepage had no FAQ answers and linked an empty route | `scripts/prerender.js` — full FAQ section mirrored from `Index.tsx`, customizable-outfits link removed |
| 11 | Pixel IDs documented for the owner | `.env.example` — free account instructions, all optional |

**Owner's only remaining step for retargeting:** create the free Meta/Pinterest accounts, paste the IDs into Vercel env vars, redeploy. Five minutes, $0. Until the pool reaches ~500 product viewers, spend nothing — then the $2/day plan in `TWO-DOLLAR-A-DAY-ADDENDUM-2026-11-05.md` switches on.

**Corrections to my own earlier reports (verified 2026-11-05, live):**
- `ZERO-CLICK-RECOVERY-2026-11-05.md` said only 3 merchant-feed items pointed at dead products. That was a sampling error in both directions, and the full picture is stranger than either version:
  - The **live** feed (build timestamp 2026-11-05, generated from Shopify at deploy) carries current handles — e.g. `grey-georgette-embroidered-wedding-lehenga-choli` — and is **not** the stale file.
  - The **checked-in snapshot** `public/merchant-feed.xml` is **100% retired: all 739 handles (4,208 items) are in `legacyGoneProductHandles.json` and return real 410s**, with zero overlap against the 337 approved active sitemap products. (An intermediate count of "303 dead" was itself a parsing artifact — it only matched feed links without a `?variant=` parameter. Correct parsing: 739/739.)
  - Consequence: the snapshot is unusable as a fallback and must be refreshed properly (`MERCHANT_FEED_REFRESH_SOURCE` with a current catalog snapshot, per the generator's own header) — hand-editing it would just shrink a dead file. It was therefore restored untouched in this change; what shipped is the generator guard so no future feed — live or fallback — can emit a 410 handle. Do not let anyone "fix" the snapshot by deleting items from it.

**Known test limitation:** `tests/emptyCollectionNavigation.test.mjs` cannot run in this sandbox (`node_modules` absent, `esbuild` missing) — it fails identically on the untouched tree, so this is a pre-existing environment gap, not a regression from these changes.

---

## 1. The honest answer to "can't AI do anything for free?"

Yes — most of the work. What money buys is *other people's attention at scale* (ads). What it does not buy:

| Free, do now | Why it matters in an AI-search world |
|---|---|
| Correct, crawlable facts (fixes above) | ChatGPT/Perplexity/Gemini cite pages they can read. Your FAQ schema previously promised answers that weren't in the HTML. |
| Free listings (Google + Bing Merchant Center) | The only free product-click channel with buying intent. Now fed a clean feed. |
| Google Business Profile posts + reviews | Local "Indian clothing store near me" + brand entity. You start from 0 directory reviews. |
| Pinterest free catalogue | Visual search for wedding outfits; pins keep working for months at $0. |
| WhatsApp to your own contacts | Still the only realistic week-one order. Scripts below. |
| Answer content (guides, Reddit/Quora) | AI engines quote helpful answers. Your 44-article library is an asset — it needs buying-intent angles, per the main review. |

What AI **cannot** do for free: be your customer, leave you a real review, film Mini wearing the product, or make a stranger trust a no-review store. Anyone selling that is selling fabrication — which gets stores suspended.

---

## 2. Copy-paste assets (owner fills [brackets])

### 2.1 WhatsApp broadcast — to EXISTING contacts only (not purchased lists)

> Namaste, this is Mini from LuxeMia in Philadelphia 🙏 I personally check every outfit before it ships. This week I'm helping families find [wedding guest / reception] outfits — if you have an event coming up, reply with your date, size and favourite colour and I'll send you 3 options that are actually in stock. You can talk to me in English, Hindi or Gujarati. Browse here: https://luxemia.shop/ready-to-ship — U.S. shipping is $14.99, free over $150.

Hinglish version:

> Namaste, main Mini, LuxeMia Philadelphia se 🙏 Koi shaadi ya function aa raha hai? Apni date, size aur pasand ka colour bhej dijiye — main khud 3 in-stock options bhej dungi, aur fitting samjha dungi. Call/WhatsApp isi number par: main English, Hindi, Gujarati — teeno mein baat kar sakti hoon.

Rules: one broadcast, personal tone, reply by hand. Do NOT promise discounts unless `FIRST10` is verified live in Shopify Admin → Discounts (still unverified — check before any message mentions a code).

### 2.2 Review ask (send AFTER a real delivery, or to past real customers)

> Namaste [name], Mini from LuxeMia. I hope the [outfit] worked well for your [event]. Would you do me one favour? A short Google review helps other families trust a small store like mine: https://search.google.com/local/writereview?placeid=ChIJw2TQgyx3_WgRbxjTw6E4KhY — even two lines about the fabric and fit helps. Thank you 🙏

Never incentivise, script the wording of the review itself, or ask anyone who didn't buy.

### 2.3 Google Business Profile post (weekly, free)

> Looking for a wedding guest outfit that ships from support right here in Philadelphia? Browse ready-to-ship sarees, lehengas and suits, then call Mini at +1-215-341-9990 in English, Hindi or Gujarati for honest fit help before you order. [link to /ready-to-ship or the week's category]

### 2.4 Pinterest (free catalogue + boards)

Boards to create (names = search phrases): "Indian Wedding Guest Outfits USA", "Ready to Ship Sarees USA", "Lehenga Choli for Reception", "Mother of the Bride Indian Outfits", "Plus Size Indian Ethnic Wear USA".

Pin description template (fill from the actual product page — do not embellish):

> [Product title] — [fabric as listed], sizes [as listed]. From LuxeMia, Philadelphia-based Indian ethnic wear with phone support in English, Hindi & Gujarati. U.S. shipping $14.99, free $150+. See listed stitching/included pieces: [product URL]

### 2.5 Answer-thread reply template (Reddit r/DesiWeddings, Quora, Facebook groups — help first)

Answer the sizing/fit question fully (your sizing guides genuinely rank — position 8). Only then, one line:

> (Disclosure: I run LuxeMia in Philadelphia — happy to help with measurements on WhatsApp even if you buy elsewhere.)

One helpful answer per thread, disclosure always. Mass-posting links = ban + brand damage. AI can draft; Mini must post as herself.

---

## 3. Owner checklist — 7 days, $0, in order

- [ ] **Shopify Admin:** confirm `FIRST10` exists and is active. If not, create it or tell me to remove every mention.
- [ ] **Checkout test:** real phone, real card, complete a purchase, refund yourself. Note every friction point. (3 checkouts → 0 purchases in your GA4 — find out why before anything else.)
- [ ] **Merchant Center:** confirm the cleaned feed reprocesses; clear Diagnostics; confirm free listings opted in.
- [ ] **Bing/Microsoft Merchant Center:** import the Google feed (free; your own `FREE_LISTINGS_WHATSAPP_CHECKLIST.md` already recommends this).
- [ ] **GBP:** claim/verify, add the review-ask link to your phone notes, post 2.3, ask 5 past customers using 2.2.
- [ ] **WhatsApp:** send 2.1 to existing contacts in small batches; reply personally.
- [ ] **Pinterest:** connect the catalogue feed, create the 5 boards, pin 10 real products using 2.4.
- [ ] **Mini, 3 phone videos (20 sec each):** (1) "How I check your outfit before dispatch", (2) "Send me your measurements — I'll tell you honestly if it'll fit", (3) one real in-stock outfit held up to natural light. These feed Pinterest, GBP, WhatsApp and — later — the $2/day retargeting.

## 4. What to expect, honestly

Week 1 at $0: clicks from free listings ≈ 0 (feeds take days to reprocess, rankings take weeks). Realistic week-one order probability still sits almost entirely in §2.1/§2.2 — people who already know Mini. The code fixes are what make weeks 3–12 compound instead of leaking. That is not a consolation prize; uncrawlable FAQ answers, doubled-brand titles and a dead-category link were actively taxing every free channel you have — and the feed guard now guarantees the problem found in the stale snapshot can never reach Google from a future build.
