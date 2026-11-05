# LuxeMia: SEO / AEO / GEO Review & 7-Day Revenue Plan

**Property:** https://luxemia.shop (apex; `www` 301s to apex)
**Review date:** 5 November 2026
**Reviewer role:** SEO + AEO (answer engine) + GEO (generative engine) + conversion
**Method:** live crawl of 30+ URLs via rendered fetch, repository audit of the current HEAD (`f33c847`), cross-check of the repo's own audit trail (`docs/audits`, `docs/growth`), and third-party corroboration (organic SERP presence, brand/social footprint, Google Business Profile).

**Assumption to state up front:** the calendar is the single most important fact in this review. **Diwali 2026 is Sunday 8 November** — three days from today. Every product page quotes **12–18 business days** to a U.S. door. So no Diwali purchase made today can arrive for Diwali, and the homepage hero is still the Diwali campaign. That is a conversion and a trust problem on every single visit, and it is the first thing to fix (Day 1, §5).

---

## 1. The honest diagnosis: this is not a "get traffic" problem

Three numbers from the repo's own measurement trail frame everything else:

| Metric | Value | Source |
|---|---|---|
| GSC clicks, 13 Sep – 10 Oct 2026 | **27 clicks**, 1,961 impressions, 1.4% CTR, avg position 16.3 | `docs/audits/search-and-images-2026-10-12.md` |
| GA4 funnel, 6–12 Oct 2026 | 135 sessions → 57 product viewers → 3 carts → 3 checkouts → **0 purchases** | `docs/growth-reference-benchmark-2026-10-13.md` |
| Paid orders, 6–12 Oct 2026 | **0** | same |

Read that funnel again: **3 checkouts, 0 purchases.** Organic traffic is not your bottleneck this week. A store that gets 27 clicks a month and converts 3 checkouts into 0 sales will not be saved by ranking for one more keyword. In the next seven days the sales have to come from *demand you control* — your existing contacts, WhatsApp, and paid social — pointed at a store that finally converts. Organic and AI-engine work is a 30–120 day compounding asset that you start this week and harvest later.

I'm giving you both. §3–§4 is the organic/AEO/GEO build. §5 is the 7-day revenue sprint. If you only do one, do §5.

### What is already genuinely good (don't let anyone rebuild this)

This is a better technical foundation than most headless Shopify stores I audit:

- Self-referential canonicals, clean `en-US` + `x-default` hreflang, real 410s for retired products, 301s for legacy `/products/` URLs, layered per-bot robots.txt, five child sitemaps, `llms.txt`, an OpenAI product feed, and Merchant Center shipping/return schema.
- Prerendered HTML for bots with FAQPage JSON-LD, semantic spec tables, ProductGroup + `hasVariant` + Offer + `shippingDetails`.
- A **44-article, source-cited, fact-checked editorial library** with author pages, review dates and an editorial policy. That is a genuine GEO asset — most of your competitors' blogs are unpublishable fluff.
- A uniquely strong trust story (Mini, Surat textile family, answers the phone in English/Hindi/Gujarati) that is *currently buried inside prose paragraphs* instead of being used as a conversion weapon.
- Product pages that state dimensions, included pieces, "supplier size labels, not body measurements", and the difference between processing and transit. That honesty is rare and it is exactly what AI answer engines reward.

The problem is not the machine. It's the message, the proof, and the moment of decision.

---

## 2. The four things actually blocking sales

### 2.1 The returns page is a conversion killer, and it is engineered that way

Live copy from `/returns`:

> "…change-of-mind returns impossible without losing more in shipping than the refund is worth — so I won't pretend otherwise."
> Size doesn't fit → "**Alteration and store credits are not offered.**"
> Damage claims require "a **continuous unboxing/opening video**… The continuous unboxing/opening video is **required**."

For a $55–$300 wedding-garment purchase from an unfamiliar brand, this reads as: *if it's wrong, you own it.* The unboxing-video requirement in particular reads as adversarial — it says "we expect you to lie to us."

I understand the economics: return shipping to India is $30–$50 and suppliers won't take it back. But you are paying for that protection twice — once in lost sales, and again because the page scares away exactly the high-intent buyers who were ready to spend $200. Note also that an earlier audit claims a "$30 Fit Guarantee" was added; **`grep` finds no such offer in `src/`**. It does not exist on the live site.

**Fix (do this today, it's copy, not operations):** replace the current page with a **$25–$35 local tailoring credit** on any standard-size item that doesn't fit, claimed with photos, no return shipping involved. You keep the garment, you keep the margin, and the shopper hears "we'll make it fit." Keep the unboxing video for *damage* claims only, and demote it below the fold — never in the at-a-glance table. Rewrite the table's second row to: *"Size doesn't fit → we cover up to $30 of local tailoring."*

### 2.2 There is zero social proof on a trust-dependent purchase

I checked the schema library: `buildAggregateRating()` exists and is deliberately hard-wired to output nothing until a real review source is wired in. That's ethically correct and commercially expensive. The result is that **every product page shows no rating, no review count, and no customer photo.** For an unknown brand selling occasionwear, that alone can halve conversion.

Meanwhile the external footprint is thin enough to be a liability: Instagram `@luxemiausa` (the only handle in `sameAs`), a Facebook page, a Pinterest and a TikTok — none with visible traction, and the brand name collides with an unrelated Miami sneaker store and a `luxemia.net` / `luxemia.store` storefront. AI engines searching "LuxeMia" today can resolve the wrong entity.

**Fix (this week):**
1. Install Judge.me (free tier) on the Shopify products, and put the review widget on the storefront PDP **above** the tabs.
2. Email your last 90 days of buyers — even 15 responses changes every page on the site.
3. Add **photo reviews** with the prompt: "send us the photo from the wedding." That is your single best-fit asset for this category.
4. Add first-party proof you already own and are not using: *"Mini answers in English, Hindi or Gujarati"*, *"real garment measurements before you order"*, *"garments sourced from my family's Surat textile contacts."* Move these from the About page into a 3-tile strip under Add to Bag.

### 2.3 The hero is a dead campaign and the promise arrives too late

`NewArrivalsBanner.tsx` still leads with `luxemia-diwali-2026-*` on 5 November with a 12–18 business-day delivery window. A visitor who wants Diwali outfits is being told, implicitly, "too late" — and a visitor shopping for a December wedding has to scroll past a Diwali banner to find out you can help them.

There is a second, subtler problem: the site's *strongest* claim — **"we'll check your measurements against the actual garment before you order, and tell you honestly if it won't fit"** — is not above the fold anywhere. It is the answer to the only question this customer has.

**Fix:** swap the hero to the **December 2026–February 2027 wedding season** with an explicit, honest deadline line: *"Order by 20 November for a 12 December wedding"* (compute it from 18 business days; make it real, and update it weekly). Put the fit-check promise as the hero subhead and a persistent bar: *"Free fit check — send your measurements, we'll confirm against the actual garment before you pay."* That is a differentiator none of Utsav / Cbazaar / Pernia's can match at your size, and it costs you nothing but Mini's time.

### 2.4 The catalog itself is leaking trust (and this one is urgent)

Four defects that a shopper can hit in their first five minutes:

1. **The brand is spelled two ways on the same product page.** `/product/sharara-royalblue` renders the heading brand as **"Luxemia"** while the page title and seller field say **"LuxeMia"**. This is a crawler-visible inconsistency and a shopper-visible sloppiness signal.
2. **`/jewelry` — a page in your sitemap at priority 0.9 and linked from the homepage — renders "Showing 0 products."** Bridal jewelry is a high-intent, high-margin category you are advertising and cannot fulfil.
3. **`/collections/kanchipuram-sarees`** — also in the sitemap at 0.9 — says "No qualifying products are currently available" *and* leaks the internal error string "The live collection could not be refreshed. Please try again shortly." Pure-Kanjivaram is one of the most valuable searches in this category.
4. **Price incoherence.** The same catalogue shows $18.89 for a "Soft Silk Paithani Saree with Gold Zari" and $299.67 for a Korvai Kanjivaram. A $18.89 silk Paithani does not exist; to a knowledgeable NRI buyer, it says "these are photos of something else." Meanwhile your `merchant-feed.xml` contains **4,208 offers** while the live collection index says **383 products** — a 10× gap that also means a large share of feed URLs may not resolve.

**Fix:** break the `/jewelry` and Kanchipuram links *today* (or 301 them to `/collections`) until they have stock; strip every dangling hero/link; and set a price floor — delist anything under ~$40 in the saree category, because a $18 silk saree costs you more in credibility than it earns in margin. Then reconcile the feed: I verified in the repo that `public/merchant-feed.xml` still contains two handles that now return **HTTP 410** (`deep-green-vairaoosi-kanjivaram-silk-saree`, `soft-silk-paithani-saree-with-gold-zari`). Dead links in a Merchant Center feed generate item disapprovals and account-level quality warnings.

---

## 3. SEO: what to fix, ranked

### P0 — do this week

**1. Homepage FAQ answers are missing from the prerendered HTML.**
`src/pages/Index.tsx` renders a hand-rolled accordion that **unmounts** answers (`{openFaq === index && <div>…}`), and the prerendered home page (`scripts/prerender.js`, `path: '/'`) contains no FAQ block at all. Live, bot-served HTML therefore shows seven questions and **zero answers** — while `SEOHead` still emits FAQPage schema for them. Visible-content/schema mismatch, and nothing for an AI engine to quote from your most-linked page. Fix: render answers always-present with `hidden` toggling + `aria-expanded`, and add a real FAQ block to the prerendered home route.

**2. Dead collection links and empty commercial pages.** See §2.4 items 2–3. Google is being served "0 products" at priority 0.9.

**3. Merchant feed contains 410 URLs.** See §2.4 item 4.
`/product/<handle>` → 410 for handles still advertised. Also `product_prices.json` and the legacy description generators still carry stale `$350` free-shipping copy (mitigated by build-time rewrites, but the source of truth should be cleaned).

**4. Thin, duplicated product body copy.**
`/product/off-white-crepe-embroidered-readymade-sharara-suit` renders a single flattened paragraph *inside* the tab ("Off-White Crepe Embroidered Readymade Sharara Suit is available from LuxeMia online in the USA. Product category: Sharara Suit. …Fabric and Design Color: Off-White Fabric: Crepe…") — unbroken text with no line breaks, plus the boilerplate openers "is a saree available from LuxeMia online in the USA. Review the listing for blouse inclusion…" repeated across dozens of pages. This is textbook near-duplicate thin content on your money pages. Fix: template the *structure* but vary the *substance* — first sentence must name the colour, fabric, work and occasion; add one paragraph of genuine per-product detail (drape behaviour, when to wear it, what it pairs with) written or voice-noted by Mini in 60 seconds per hero SKU. Do the top 30 SKUs first, not all 383.

### P1 — next 30 days

**5. Ambiguous product titles cost you the SERP.**
Every PDP title is `{Product Name} | LuxeMia USA` → clamped to 58 characters by `src/lib/meta/clamp.ts`. Two effects: (a) your brand sits in every title eating 13 characters; (b) the tail of the description gets cut with an ellipsis. Live examples I verified: `"Designer Hand-Embroidered Net Saree with Bead… | LuxeMia"`, `"Off-White Crepe Embroidered Readymade Sharara… | LuxeMia"`. And on short titles the clamp produces `"Purple Palazzo Set | LuxeMia USA | LuxeMia"` — a doubled brand. Real buyers search `"pre-draped georgette saree usa"`, `"readymade sharara suit sangeet"`, `"plus size lehenga chaniya choli"`, not SKU names. Rewrite titles as **`{Keyword phrase} — {differentiator} | LuxeMia`**, one brand token, ≤60 chars, and fix `clamp.ts` to strip a `| LuxeMia USA` suffix before appending `| LuxeMia`.

**6. You cannot rank for the 3 highest-intent terms, because you have no product for them.**
`/collections/kanchipuram-sarees` = 0 products. `/jewelry` = 0 products. `site:` shows the kanjivaram sarees that used to be on the site now 410. These are the three highest-margin, highest-intent categories in U.S. NRI ethnic wear. Until you stock them, ranking for them is impossible — and *advertising* them damages trust. Decision needed from the owner: restock or de-link.

**7. Blog is strong on the wrong axis.**
44 fact-checked articles is excellent GEO material, but the topic mix skews explainer ("what does a saree cost", "lehenga vs sharara") rather than **buying-intent**. Your own GSC data confirms it: 3 of your 4 top pages are sizing guides; `/sarees` ranks at position 62. Add 3–5 articles this month that sit one click from a purchase: *"Where to buy a readymade sharara suit in the US in 2026"*, *"What to wear to a December 2026 Indian wedding in the US"*, *"How much does a wedding-guest lehenga really cost, delivered"*. Each must link to a stocked collection with an in-stock example.

**8. Zero non-brand authority.** No press, no backlinks, no podcast, no directory presence that I can find beyond a stale MapQuest/MerchantCircle listing for the legal entity. Realistically the fastest links available to you are: local Philadelphia/South-Asian community publications, wedding-planning directories (Zola/WeddingWire vendor listings), wedding-planner and day-of-coordinator partnerships, and *the vendors you already know in Surat* (supplier "where to buy internationally" pages). Your `docs/growth/ANSWER_THREAD_OUTREACH_KIT_2026-09.md` is a good start — but outreach without a review-backed store converts poorly. Do §2.2 first.

---

## 4. AEO & GEO: being the answer, not just a result

You are technically *prepared* for AI search — `llms.txt`, an OpenAI JSONL feed, permissive robots for GPTBot / OAI-SearchBot / PerplexityBot / ClaudeBot / Google-Extended, structured data. But prepared ≠ chosen. What generative engines actually cite is **direct, specific, self-contained factual statements**. Your site is unusually honest but written in hedged, defensive prose ("LuxeMia does not treat a style name as proof of fiber, weaving method or origin"; "Review the exact listing before ordering"). That is legally safe and *cognitively unusable*.

### The core GEO fix: add a fact block to every product page

Every PDP should open with a liftable, unambiguous block — table or definition list — that an engine can quote verbatim:

```
Product type:        Ready-to-wear sharara suit (3 pieces: kurta, sharara, dupatta)
Fabric:              Crepe, embroidered
Colours available:   Off-white
Sizes:               38, 40, 42, 44 (supplier labels; see measurement table)
Ready to wear:       Yes — stitched
Dispatch:            3–4 business days from India
Delivery to US:      12–18 business days total, tracked, $14.99 (free over $150)
Returns:             Change-of-mind not accepted; $30 local tailoring credit if the fit is wrong
Fit help:            Free pre-purchase measurement check by WhatsApp
```

You already render most of these facts — as prose inside tabs, at three different scroll depths, with different wording per page. Consolidate them into one consistent, machine-liftable block at the top. This one change is worth more for AI citation than any amount of new content.

### Additional AEO work

- **`llms.txt` = `llms-full.txt`.** I diffed them: **byte-identical.** `robots.txt` advertises `llms-full.txt` as "full page inventory" — a promise the file does not keep. Either generate a real inventory (collections + 20 hero products + the 44 guides, with one-line answers each) or delete the claim.
- **Put the answer first in the blog.** Your articles are well-sourced but bury the answer. Add a 2–3 sentence "The short answer" box under the H1 of every guide. That is the passage Perplexity and ChatGPT lift.
- **Own the entity, not just the URL.** Add to `Organization` schema: real `streetAddress` + `addressLocality` + `postalCode` (the Philadelphia address that already appears on your MapQuest and city-directory listings), `sameAs` including the Google Business Profile, and a `founder` Person node for Mini. Right now `legalName` is absent and the address is only "Pennsylvania" — AI engines resolving "LuxeMia" have almost nothing to disambiguate you from `luxemia.net` and the Miami storefront.
- **Google Business Profile.** `src/components/layout/Footer.tsx` links a `placeid=ChIJw2TQgyx3_WgRbxjTw6E4KhY` review URL, so a profile exists — yet third-party directories still show 0 reviews. Ask every past customer for a Google review this week. GBP is the cheapest local + AI-visible proof you have, and it feeds Maps, AI Overviews and Perplexity.
- **Answer the questions people actually type into ChatGPT.** Build 5 landing pages that are literal answers, not category grids: *"Is it safe to buy a saree online from India to the US?"*, *"Which US store ships Indian wedding outfits fastest?"*, *"How do I know my lehenga size from India?"*, *"What does a wedding-guest lehenga cost delivered in the US?"*, *"Readymade vs unstitched: which should I buy?"* Each: one-paragraph answer, a comparison table, three in-stock products, and a clear price/delivery/return fact block.

### GEO reality check

Do not expect AI engines to drive revenue in seven days. ChatGPT Shopping / Perplexity referrals are still low-volume in occasionwear, and your feed correctly sets `is_eligible_checkout: false` (a deliberate, defensible choice — you can't honour checkout for a 12–18 day lead time as an instant purchase). Treat GEO as compounding: the fact blocks and answer pages you ship this week are what get cited in January.

---

## 5. The 7-day plan that can actually produce sales

Target: **first 5 paid orders.** This is achievable *only* with demand you already own. Organic will not deliver it.

### Day 0 (today) — unblock the funnel, 4 hours of work
| # | Action | Owner | Done when |
|---|---|---|---|
| 1 | Kill the Diwali hero. New hero = **"Order by 20 Nov for a December wedding"** with live countdown. | Dev | Homepage shows wedding-season hero |
| 2 | Rewrite `/returns`: "$30 local tailoring credit if the size is wrong." Remove unboxing video from the at-a-glance table. | Mini + Dev | Page live, schema updated to match |
| 3 | De-link `/jewelry` and `/collections/kanchipuram-sarees` (or redirect to `/collections`) and remove from sitemap. | Dev | `grep -r jewelry src/config/emptyCatalogRoutes.json` shows `/jewelry` |
| 4 | Normalise brand casing ("Luxemia" → "LuxeMia") everywhere. | Dev | No `Luxemia` in rendered HTML |
| 5 | Free-fit-check bar above Add to Bag on every PDP. | Dev | Visible on 10 sampled PDPs |
| 6 | Confirm **FIRST10** exists in Shopify Admin → Discounts (10% off, one use/customer). It is referenced on the popup, header, Navratri page and a blog post. | Owner | Test cart applies it |

### Day 1 — give yourself something to sell with
- Pick the **12 SKUs you can physically vouch for** (highest margin, best photos, in stock, ready-to-wear). Make them a `/collections/ready-for-december` page with a real order-by date per item.
- Shoot or repurpose **3 phone videos (20s each)**: one saree drape, one sharara in motion, one fabric close-up in daylight. Vertical. This is your paid-social and Pinterest creative, and it is also the highest-value asset your PDPs are missing.
- Turn on **Judge.me**; email the last 90 days of buyers with a one-question ask.

### Day 2–3 — put demand into the funnel
- **WhatsApp your own list first.** Your phone (+1-215-341-9990) is on every page; your customer base came from friends-of-friends. Send a personal, non-blast message to every past contact: *"I've got 12 pieces ready to ship this week for December weddings. I'll check your measurements myself before you pay."* This will outperform every ad dollar you can spend in 7 days.
- **Meta ads: $40–60/day**, one campaign, broad US + CA women 28–55, interest Indian wedding / NRI. Creative = the 3 videos. Landing page = the 12-SKU page, **not** the homepage. Objective = Purchase (or Add to Cart if purchase volume is too thin to optimise). Two ad sets, 3 creatives, kill anything under 1.5% CTR after 48h.
- **Retargeting at $10–15/day** to PDP viewers and cart abandoners with the $30 fit credit as the hook.
- **Pinterest**: pin all 12 products to 3 boards (Wedding Guest, Sangeet/Mehendi, Diwali-to-wedding) with keyword-rich titles. Ethnic occasionwear is one of Pinterest's strongest verticals and it is free traffic that keeps giving.

### Day 4–5 — recover the money already in the room
- **Abandoned cart sequence.** You have `supabase/functions/abandoned-cart-reminder` and Resend wired but no scheduler in `supabase/config.toml`. Turn on a 3-touch sequence: 1h (nudge + fit help), 24h (FIRST10 reminder), 72h (last call + order-by date). This is usually the single highest-ROI fix in a store with traffic and no sales.
- **Live "ask Mini" window.** Announce two 2-hour slots where Mini answers WhatsApp instantly, posted on Instagram, in the header bar, and in the popup. Personal service is your unfair advantage — make it a scheduled event.
- **Checkout integrity test.** Your own audit records 3 checkouts → 0 purchases. Test the real path end-to-end on a real mobile device with a real card (buy from yourself, refund after). Verify: shipping shows $14.99/free-at-$150 correctly, FIRST10 applies, no cross-domain session loss between `luxemia.shop` and `lovable-project-zlh0w.myshopify.com`, and the confirmation page fires GA4 `purchase`. **A silent checkout break would explain the entire 0-sales history — this is the highest-value hour of the week.**

### Day 6–7 — compound
- Publish the first **"answer" landing page** (§4) and one buying-intent article (§3 item 7).
- Add the **fact block** to your 12 hero PDPs.
- Add FAQ answers to the prerendered homepage + fix `aria-expanded`.
- Request IndexNow / resubmit sitemaps in GSC and Bing after the de-linking changes.
- Set the week's scoreboard: sessions, PDP views, add-to-cart rate, checkout rate, **orders**, and WhatsApp conversations started. Nothing else.

---

## 6. What "traffic and sales in one week" honestly looks like

I won't sell you a fantasy. Here is the realistic distribution of outcomes:

| Channel | Traffic in 7 days | Sales in 7 days | Sales in 90 days |
|---|---|---|---|
| Own list / WhatsApp / past customers | Low (100–400) | **High — best odds of your first 5 orders** | Recurring |
| Meta paid (at $40–60/day) | 1,500–4,000 sessions | 0–8 orders depending on creative + offer | 15–40/mo once creative is proven |
| Pinterest | 100–500 | 0–3 | 10–30/mo compounding |
| Organic search | ~0 change | 0 | 5–20/mo by Feb if §3 P0 is done |
| AI answer engines | ~0 change | 0 | 3–15/mo by Q1 if §4 is done |
| Google Merchant Center | existing free listings | 0–5 | 10–30/mo once disapprovals clear |

**The 90-day target is not "more traffic." It is: 5 paid orders/week at a 2%+ conversion rate.** You currently have the traffic to test that thesis; you do not have the trust assets (reviews, a survivable returns policy, honest deadlines) to convert it. Fix those four things and the existing ~135 sessions/week start producing orders. That is a $0 media fix worth more than any ranking you can win this month.

---

## 7. Prioritised backlog

**P0 — this week (revenue-blocking)**
1. Diwali hero → December-wedding hero with a real order-by date.
2. Returns policy → $30 local tailoring credit; unboxing video demoted to damage-only.
3. End-to-end checkout test on a real mobile device + real card.
4. Turn on abandoned-cart email sequence (scheduler + 3 touches).
5. De-link empty `/jewelry` and `/collections/kanchipuram-sarees`; remove from sitemap.
6. Confirm FIRST10 exists in Shopify; fix brand casing.
7. Judge.me live + review request to all past buyers + Google Business Profile review asks.

**P1 — next 30 days**
8. Prerender homepage FAQ answers; `aria-expanded` on the accordion.
9. Reconcile merchant feed (410 URLs), clean `$350` copy at source, resolve the 4,208-vs-383 product gap.
10. Fact block on all PDPs; per-product body copy for the top 30 SKUs.
11. Rewrite PDP titles with keyword-first phrasing; fix `clamp.ts` doubled-brand bug.
12. Real `llms-full.txt`; "The short answer" box on all 44 articles.
13. Organization schema: street address, legal name, founder Person, GBP in `sameAs`.
14. 5 answer-intent landing pages; 3 buying-intent articles.
15. Restock decision on Kanjivaram + jewelry, or formally retire both categories.

**P2 — this quarter**
16. Launch a U.S. tailoring-credit partner (local alterations in 5 metros) so the fit promise becomes a real, scalable guarantee.
17. Build a genuine UGC library (photo reviews → PDP galleries → Pinterest → ads).
18. Community/press link acquisition: Philadelphia South-Asian media, wedding planners, supplier "where to buy" pages.
19. Weekly "order-by date" module driven from shipping config so seasonal promises never go stale again.
20. Consider a real review/rating feed into `buildAggregateRating()` — the plumbing is already written and waiting.

---

## Appendix: live evidence log (5 Nov 2026)

| URL | Observation |
|---|---|
| `/` | Diwali hero; 7 FAQ questions with **no answers** in bot-served HTML; `0 of 2` slide markers |
| `/product/aqua-blue-…jacquard-silk-saree` | Works; $55.99; "Product Description" is 3 boilerplate sentences |
| `/product/designer-embroidered-net-saree` | Body copy duplicated in a flattened paragraph; title clamped to `…with Bead… \| LuxeMia` |
| `/product/off-white-crepe-…-sharara-suit` | Duplicated tab copy with no line breaks |
| `/product/sharara-royalblue` | Brand rendered as **"Luxemia"** |
| `/product/deep-green-vairaoosi-kanjivaram-silk-saree` | **410 Gone**, still in `public/merchant-feed.xml` |
| `/product/soft-silk-paithani-saree-with-gold-zari` | **410 Gone**, still in `public/merchant-feed.xml` |
| `/jewelry` | **"Showing 0 products"**, in sitemap at 0.9, linked from homepage |
| `/collections/kanchipuram-sarees` | **0 products** + leaked error text "The live collection could not be refreshed" |
| `/collections/gharara-suits` | 0 products, still linked from `/indian-ethnic-wear-usa` |
| `/collections` | 383 products vs **4,208** offers in the Merchant feed |
| `/returns` | Change-of-mind refused; no fit credit; mandatory continuous unboxing video |
| `/sitemap-pages.xml` | Contains a bare `/daily` entry that returns **404** |
| `/llms.txt` vs `/llms-full.txt` | **Byte-identical** |
| SERP (`site:luxemia.shop`) | Brand + category pages resolve; Kanjivaram product URLs in the index are dead |
| Brand SERP | Collides with `luxemia.net` (Miami sneaker store), `luxemia.store`, `@luxe.miaa` |
| GBP / directories | Profile placeid exists; third-party listings show **0 reviews** |
| Calendar | Diwali = **8 Nov 2026**; product delivery = **12–18 business days** |
