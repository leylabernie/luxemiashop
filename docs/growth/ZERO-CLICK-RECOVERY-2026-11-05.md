# Zero Click Recovery — LuxeMia

**Date:** 5 November 2026
**Trigger:** owner reports **no orders and no clicks**
**Branch:** `arena/6f9bdcc8-luxemiashop`

---

## 0. First: three corrections to my own report

Before the new plan, three claims in `SEO-AEO-GEO-REVIEW-2026-11-05.md` were wrong. I re-tested and I'm retracting them.

| Claim I made | Reality | Why I was wrong |
|---|---|---|
| "`/sitemap-pages.xml` contains a bare `/daily` entry that returns 404" | **False.** The entry is `<loc>https://luxemia.shop/</loc><changefreq>daily</changefreq><priority>1.0</priority>` — the homepage. My markdown extractor stripped the XML tags and glued `https://luxemia.shop/` + `daily` + `1.0` together. | Parsing artifact, not a site bug. |
| "`/jewelry` is in the sitemap at priority 0.9" | **False.** `/jewelry` is listed in `scripts/generate-sitemap.cjs` but is filtered out at build time by `emptyCatalogRoutes.json`. It is **not** in the live sitemap, and `SEOHead` correctly emits `noindex, follow` for it. | I read the source list, not the built output. |
| "The merchant feed's dead URLs mean a large share of feed items may not resolve" | **Overstated.** The feed is 4,208 variant-level offers across **739 unique products**. Exactly **3 items** point at handles that now return 410. That's 0.07%, not a large share. | I generalised from a grep count instead of counting. |

What still stands from the original review (re-verified this session): `/jewelry` renders **"Showing 0 products"** and is linked from the homepage and `SEOFooterContent.tsx`; `/collections/kanchipuram-sarees` renders 0 products and leaks the string *"The live collection could not be refreshed"*; `/returns` refuses both change-of-mind returns and any fit credit and requires a continuous unboxing video; the Diwali hero is still live with a 12–18 business-day promise; `llms.txt` and `llms-full.txt` are byte-identical; brand casing breaks to "Luxemia" on at least one PDP.

---

## 1. Why you actually have no clicks

You told me you have zero clicks and zero orders. Your own GSC export was 27 clicks and 1,961 impressions over a month. So "no clicks" is directionally correct, and it is **not** caused by a technical fault. I re-checked the fundamentals this session:

- `lovable-project-zlh0w.myshopify.com/products/...` **301s correctly** to `luxemia.shop/product/...`
- Canonicals, hreflang, 410s, 301s, robots, sitemaps: all behave correctly
- Product pages prerender with full content, spec tables, FAQ schema, shipping details
- Google has indexed your pages — brand and category queries return real LuxeMia results

The machine works. **The asset behind it is too thin to earn clicks.** Three facts explain the entire result:

### 1.1 Your catalog collapsed, and the category depth is now uncompetitive

| Signal | Value | Source |
|---|---|---|
| Product handles in the "gone / 410" list | **1,543** | `src/data/legacyGoneProductHandles.json` |
| Products currently in `/collections` | **383** | live page |
| Sarees | ~91 | live `/sarees` |
| Designer sarees | **4** | live `/collections/designer-sarees` |
| Jewelry | **0** | live `/jewelry` |
| Kanchipuram sarees | **0** | live `/collections/kanchipuram-sarees` |
| Gharara suits | **0** | live `/collections/gharara-suits` |

A category page with 4 products cannot rank against Utsav, Cbazaar, Pernia's Pop-Up Shop or Kalki, who each carry hundreds per category. Google has no reason to surface you for "designer sarees" when your designer-saree page has four items. **You are not being suppressed — you are being out-inventoried.**

### 1.2 You have no authority to compensate for thin inventory

No press mentions, no backlinks, no reviews, no social proof, ~0 Google Business Profile reviews, and a brand name that collides with `luxemia.net` (a Miami sneaker boutique), `luxemia.store`, and `@luxe.miaa` on Instagram. When your own brand search returns competitors' stores, a new visitor who half-remembers your name lands on someone else's site.

### 1.3 Geography is working against you

Your `<html lang="en">`, `en-US` hreflang, USD pricing and `.shop` TLD all point at the US — but the server-side rendering happens on Vercel's global edge and your content repeatedly references shipping *from India*. You are competing in the single most contested Indian-ethnic-wear market on earth (US NRI buyers) with 383 SKUs and no reviews. The realistic organic win, if you want one sooner, is **lower-competition geography** (Canada, Australia, New Zealand — which you already ship to) where the same SKU count puts you in the top handful of options.

**Bottom line:** organic search will not send you meaningful clicks this week, this month, or probably this quarter. Anyone who tells you otherwise is selling you something. To get clicks and an order in 7 days you must **buy or borrow attention**, and for that you first have to fix a problem that currently makes buying attention impossible.

---

## 2. The blocker you didn't know you had: you cannot run ads today

This is the most important finding of this session. **There is no Meta Pixel, no TikTok pixel, and no Pinterest tag anywhere in the codebase.** I grepped `src/`, `api/`, `supabase/`, and `index.html` for `fbq(`, `connect.facebook.net`, `pintrk`, `tiktok` pixel, and Conversions API — zero matches. The only tag on the site is GA4 (`G-D1NN0TC3Y0`).

Worse: even if you pasted a pixel in tonight, **your own Content-Security-Policy would block it.** From `vercel.json`:

```
script-src 'self' 'unsafe-inline' 'unsafe-eval'
  https://www.googletagmanager.com https://www.google-analytics.com
  https://apis.google.com https://cdn.shopify.com
```

`connect.facebook.net`, `analytics.tiktok.com` and `ct.pinterest.com` are not allowed. `connect-src` doesn't include Facebook's CAPI endpoint either. So the tag loads nothing, fires nothing, and you would conclude "ads don't work for us" — when in fact you were running unmeasured, unoptimised ads.

Compounding problems in the same area:

| Gap | Evidence | Consequence |
|---|---|---|
| No Meta Commerce catalog connected | `public/feeds/meta-catalog.csv` exists (155 products, 137 in stock) but there's no catalogue ID, no `content_id` in GA4, no pixel | You can't run Advantage+ Shopping, dynamic retargeting, or product ads at all |
| CSP blocks Meta/TikTok/Pinterest | `vercel.json` `script-src` / `connect-src` | Any new pixel is silently dead |
| GA4 `purchase` is unreliable | Your own audit: *"GA4 missed the Shopify paid order in the broader 28-day period; it is not a reliable sales source until purchase tracking is repaired"* | You cannot measure a sale even when one happens |
| Checkout leaves your domain | Checkout runs on `lovable-project-zlh0w.myshopify.com` | Cross-domain session break; GA4 `linked_domains` lists only `luxemia.shop` |
| No email platform | Only `abandoned-cart-reminder` + Resend edge function, **no scheduler configured** | No abandoned-cart recovery, no welcome flow, no list building |
| Google Merchant Center under-used | Docs confirm: free listings only, **product sync OFF**, 18-day delivery estimate, GCR onboarding never verified | Your single best zero-cost click source is running at partial strength |

**Sequencing conclusion:** the pixel + CSP fix is a **Day 1 prerequisite**, not an optimisation. Without it, every dollar you spend on ads is unmeasurable and unoptimisable, and you will burn your budget learning nothing.

---

## 3. What actually generates clicks in 72 hours, ranked by expected yield

For a store with 383 in-stock SKUs, priced $30–$300, shipping from India with 12–18 day delivery, in the US NRI wedding market:

### Tier 1 — do today, highest probability of clicks AND an order

**A. Google Merchant Center free listings — repair, don't rebuild**
You already have feed + merchant ID 5773333098 + seven shipping services configured. Free listings put product images in front of people *actively searching to buy*, at zero cost per click. Fix in this order:
1. Merchant Center → Growth → Programs → **"Surfaces across Google / free listings"** — confirm status. If "Not approved", open Diagnostics and fix the attribute errors (they are almost always GTIN/brand/condition, not account-level).
2. **Cut the 18-day delivery estimate.** Ads and listings showing 18-day delivery are suppressed in ranking versus a competitor promising 5 days. You cannot beat them on speed — but you also don't need to *advertise* the worst case. Set the estimate to the real median (you dispatch in 3–4 business days; standard transit is 9–14), and use your existing $150 free-shipping threshold as the merchandising hook instead.
3. **Turn on Microsoft/Bing Merchant Center.** Your own `docs/growth/FREE_LISTINGS_WHATSAPP_CHECKLIST.md` says it best: a fraction of Google's traffic and almost no Indian-ethnic-wear competitors bidding there. 10 minutes of setup. This is the single best clicks-per-minute action available to you today.
4. Fix the 3 dead feed URLs so you don't accumulate disapprovals.

**B. Meta — pixel + catalogue + one campaign**
1. Add the Meta Pixel (base + `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`) **and** widen the CSP in `vercel.json` to allow it. This is a code change I can make for you on this branch.
2. Connect the catalogue using the existing `public/feeds/meta-catalog.csv` (already merchant-formatted, 137 in-stock items).
3. Run **one** campaign: Advantage+ Shopping, broad US+CA women 28–55, $40–60/day, budget concentrated on your 12 best ready-to-wear SKUs.
4. Creative: three 15–20s phone videos — one saree drape, one sharara in motion, one fabric close-up in daylight. Real, unpolished, vertical. Polished studio video underperforms here.
5. Do **not** expect profit in week one. Expect to learn cost-per-add-to-cart. Revenue comes in weeks 3–6 once the pixel has signal.

**C. Pinterest — free, and structurally right for this category**
Occasionwear is one of Pinterest's strongest verticals, and "Indian wedding guest outfit" / "sangeet outfit ideas" / "mehendi dress" are heavily searched. Connect the catalogue, create three boards (Wedding Guest, Sangeet & Mehendi, Festive), pin your 12 hero SKUs with keyword-rich titles, and pin your 3 videos as Idea Pins. Zero cost, compounding timeline.

### Tier 2 — this week, but demand you already own

**D. The people who already know you.** Your phone number is on every page. Your business came from friends-of-friends. **This is where your first order almost certainly comes from.** A personal, non-blast WhatsApp to every past contact and every person who has ever asked Mini for help: *"I have 12 pieces ready to ship this week for December weddings. Send me your measurements and I'll check them against the actual garment before you pay."* This converts at a rate no ad will match for you right now, because it carries the trust you have not yet built on the website.

**E. Google Business Profile.** You link a `placeid` review URL from the footer, so the profile exists — but third-party directories still show 0 reviews. Ask every past customer this week. GBP feeds Maps, local packs, and AI Overviews, and it's the only place you can appear with a rating today.

### Tier 3 — start now, harvest in 60–120 days

Answer-intent pages and the GEO fact blocks from §4 of the main review. Do these because they compound, not because they'll produce a click this week.

---

## 4. The realistic 7-day expectation

| Day | Action | Expected clicks | Expected orders |
|---|---|---|---|
| 1 | CSP + pixel, Meta catalogue, Bing Merchant, Merchant Center diagnostics | 0 | 0 |
| 2 | Creative shoot; Pinterest boards; WhatsApp to own list | 50–200 (own list) | **0–2** |
| 3 | Meta campaign live at $50/day | 300–800 | 0–1 |
| 4–5 | Optimise: kill ad sets under 1.5% CTR; turn on abandoned cart | 500–1,200 | 0–2 |
| 6–7 | Retargeting live; GMC approvals land | 500–1,500 | 0–2 |
| **Week total** | | **~1,500–4,000 sessions** | **1–5 orders, realistically 1–2** |

That is the honest number. One to two orders. If someone promises you ten, ask them what their cost per acquisition was.

**The strategic point:** your problem is not that you cannot get clicks. It is that 135 sessions in a week produced 3 checkouts and 0 purchases. Even at zero traffic, that funnel is the thing to fix — because the moment you *do* buy clicks, a funnel that loses every checkout wastes all of them. §2 of the main review (returns policy, reviews, the fit guarantee, the dead Diwali hero) is therefore not a "later" item. It is the multiplier on every dollar and every click described above.

---

## 5. What I need from you to go further

Four decisions, then I can execute on this branch:

1. **Do you have a Shopify discount code live?** `FIRST10` is referenced in the popup, header, a blog post and the Navratri page. If it doesn't exist in Admin → Discounts, it's a broken promise on every visit.
2. **Meta ad budget — is $40–60/day available for 14 days?** Below ~$300 total there isn't enough signal for the pixel to learn, and the exercise is not worth starting.
3. **Can Mini record three 20-second phone videos this week?** Without original creative, Meta will not deliver cheaply in a visual category.
4. **Restock Kanjivaram + jewelry, or retire both categories?** Two sitemap-priority pages render zero products and are linked from your homepage. Right now they cost you trust on every visit.

Say the word and I will implement, on this branch, tested where the repo allows: the Meta/TikTok/Pinterest pixel with a corrected CSP, `content_id` mapping to the existing catalogue CSV, the missing `purchase` verification path, removal of the 3 dead feed URLs from the generator, removal of the `$30 Fit Guarantee`-less return copy, the homepage FAQ answers in prerendered HTML, and the Organization schema address/founder/GBP fields.

---

## Appendix: evidence log for this session

| Check | Result |
|---|---|
| `lovable-project-zlh0w.myshopify.com/products/{handle}` | 301 → `luxemia.shop/product/{handle}` ✅ |
| Meta Pixel / TikTok / Pinterest tag in codebase | **None found** ❌ |
| CSP `script-src` allows Meta/TikTok/Pinterest | **No** ❌ |
| CSP `connect-src` allows CAPI | **No** ❌ |
| `public/feeds/meta-catalog.csv` | 155 products, 137 in stock, merchant-formatted ✅ but not connected to a pixel |
| Merchant feed | 4,208 variant offers / **739 unique products** / 3 dead links |
| `/collections` product count | 383 |
| `/collections/designer-sarees` | **4 products** |
| `/jewelry` | 0 products, linked from homepage, correctly `noindex` + excluded from sitemap |
| `/collections/kanchipuram-sarees` | 0 products + leaked refresh-error string |
| `legacyGoneProductHandles.json` | **1,543** retired handles |
| GA4 `purchase` reliability | Documented unreliable in own audit |
| Email platform / cart recovery scheduled | **Not scheduled** |
| Merchant Center product sync | **Off**; free listings only |
| Google Business Profile reviews | 0 visible in third-party directories |
