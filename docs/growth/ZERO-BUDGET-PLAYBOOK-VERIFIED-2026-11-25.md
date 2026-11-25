# Zero-Budget Playbook — Verified Against the Live Storefront

**Property**: luxemia.shop · **Date**: 2026-11-25 · **Branch**: `arena/0fa19493-luxemiashop`
**Inputs audited**: `luxemia-zero-budget-playbook.md` (attached) and `luxemia-pinterest-scheduler.xlsx`
(Drive ID `1xRG1Gu3MTqPMnBl5b7KmWYGjIfQ0954w`, sheets *Pin Scheduler* + *Board Architecture*).

**Verdict in one line**: the playbook's *channels* are right and mostly already built in this repo, but its
*copy* repeats five claims luxemia.shop does not publish, and 4 of the 5 scheduled pins point at product
handles that do not exist. Both are fixed below — use the corrected templates and the generated scheduler
instead of the originals.

---

## 1. The only claims anyone may publish (source-of-truth table)

Every outreach reply, pin, DM and creator brief must stay inside this table. Each row is verified in code.

| Claim | Exact published wording | Source of truth |
|---|---|---|
| Ready-to-Ship delivery | **5–7 business days** to US, UK & Canada via DHL/FedEx = **1–2 business days** dispatch after the 3-Point QA Check + **4–5 business days** transit | `src/config/shippingTiming.cjs`, `src/config/shippingPolicy.ts` (`DELIVERY_WINDOW_TIERS`), `/shipping` |
| Custom Tailored delivery | **15–18 business days total** (10–12 tailoring + QA, then transit), counted once per outfit after complete measurements are confirmed | same as above |
| Ship-from | "Orders ship from India." (`SHIPPING_ORIGIN_NOTICE`) | `src/config/shippingPolicy.ts:189` |
| U.S. shipping cost | **$14.99**, free at **$150+** (`US_STANDARD_SHIPPING_RATE`, `US_FREE_SHIPPING_THRESHOLD`) | `src/config/shippingPolicy.ts` |
| Lining | "breathable soft **cotton or crepe** inner lining **where applicable**" | `src/pages/ProductDetail.tsx` FAQ |
| Seam allowance | **2-inch (5 cm)** internal seam allowance on **both side seams**, custom-stitched blouses/cholis/suit tops, **where construction permits** | `src/pages/Alterations.tsx`, `src/components/pdp/SizingAlterationCallout.tsx` |
| Alteration credit | **up to $20 USD** Local Alteration Credit (store credit), email a local tailor's receipt photo **within 14 days of delivery** | `src/pages/Alterations.tsx`, `src/pages/Returns.tsx` |
| Damage/defect recourse | **48-hour** photo-verified protection (no unboxing video required); all sales otherwise final | `src/pages/Returns.tsx` |
| Quality check | **3-Point Quality Assurance Check** before dispatch | `src/pages/Returns.tsx`, `/shipping`, PDP trust strip |
| Support | Philadelphia, PA support desk · **+1-215-341-9990** · WhatsApp on the same number | `src/components/layout/Footer.tsx`, `/returns`, PDP |
| Welcome code | **FIRST10** — enabled in storefront code, **but its Shopify discount is unverified** (see §6) | `src/config/welcomeOffer.ts` |

### Claims that must be struck from every channel

| Banned claim | Where it appears | Why it is false |
|---|---|---|
| "100% breathable cotton lining" | playbook Scenario B, pin PIN-001/002 copy, boards 1/2/4 | The FAQ promises cotton **or crepe** lining **where applicable** — not every style, not always cotton. `src/lib/productDescriptionEnrichment.ts` deliberately strips unverified fabric claims. |
| "Includes 2-inch alteration margins" on a ready-to-wear saree; "on all stitched outfits" (board 4) | playbook Scenarios A/C, pins PIN-001/002/004, board 4 | Margins apply to **custom-stitched** blouses/cholis/suit tops **where construction permits**. A readymade saree has none. |
| "Dispatches via DHL Express in 5-7 days" / "Fast 5-day shipping" | pins PIN-001, board 4 | 5–7 business days is **delivery**, not dispatch. Dispatch is 1–2 business days. Also "Express" is a separately quoted option, not the default. |
| "100% insured DHL Express international shipping" | pin PIN-005 | Shipment insurance is **not published anywhere** in the storefront, policies or feed (`grep -ri insur src/ public/` → 0 hits). |
| "Handcrafted in India with luxury detailing" | pin PIN-005, board 3 | `productDescriptionEnrichment.ts:65-66` **strips** `handcrafted` from catalog copy as unverified craftsmanship. |
| "$20 alteration credit **guarantee**" / "$30 fit guarantee" | pin PIN-002, older growth kits | It is **up to** $20 store credit with a receipt photo inside 14 days. The $30 figure is retired (see §7). |
| Saree price band "$110–$140" | playbook Scenario C | Live catalog: sarees run **$55.00–$219.92, median $89.99** (53 pinnable styles). |

### Real price bands (206 pinnable, in-stock, indexable styles in `public/merchant-feed.xml`)

| Category | Styles | From | Median | Top |
|---|---|---|---|---|
| Saree | 53 | $55.00 | $89.99 | $219.92 |
| Lehenga Choli | 44 | $35.08 | $91.34 | $576.99 |
| Palazzo Suit | 42 | $96.00 | $159.97 | $389.99 |
| Anarkali | 16 | $108.99 | $180.49 | $310.99 |
| Indo-Western | 13 | $154.97 | $205.99 | $275.99 |
| Sharara Suit | 9 | $94.99 | $159.97 | $245.99 |
| **All** | **206** | **$35.08** | **$121.99** | **$576.99** |

121 of 206 styles are under $150 — so "free U.S. shipping at $150+" is a genuine upsell lever, and the
playbook's "ready-to-wear under $200" positioning is accurate (166 of 206).

---

## 2. Pinterest scheduler: what was wrong and what replaces it

### 2.1 Destination URLs — 4 of 5 were invented

`/products/` is also the wrong path: `vercel.json:367` 301-redirects `/products/:handle` → `/product/:handle`,
so every pin would have burned a redirect and split its signal. Canonical is `/product/`.

| Sheet row | Sheet URL handle | Status in catalog | Replacement (live, in stock, ≥3 images) |
|---|---|---|---|
| PIN-001 | `ready-to-wear-embroidered-saree-light-pink` | **Does not exist** — not in `public/merchant-feed.xml`, not in the 323-path approved inventory, not in the 410 gone-routes | `onion-pink-floral-embroidered-silk-saree-with-cutwork-border` — $55.00, Silk, Onion Pink, 4 images |
| PIN-002 | `dusty-pink-silk-beaded-sharara-suit` | **Does not exist** | `sharara-winepink-pauncho` — $117.99, Georgette, Pink, 4 images |
| PIN-003 | `embroidered-net-palazzo-suit-coral` | **Does not exist** | `dusty-pink-simar-silk-embroidered-palazzo-suit-indian-wedding-outfit-3-piece-set` — $164.78, Silk, Dusty Pink, 5 images |
| PIN-004 | `grey-georgette-embroidered-wedding-lehenga-choli` | **Exists** (only valid one) — but listed in the reversible retirement draft `scripts/product-retirement-20260908.json`; it is *not* in `goneRoutes.ts` and is item #1 in the live feed | Kept, path corrected to `/product/`. Re-check the PDP before scheduling. |
| PIN-005 | `sindoori-red-silk-bridal-lehenga` | **Does not exist** | `red-bridal-lehenga-with-heavy-embroidery` — $576.99, Georgette, Red, 10 images |
| PIN-006…023 | `/collections/all` placeholder | Blank template rows | Filled: 29 pins, one per board quota |

### 2.2 Generated replacement files

```
docs/growth/pinterest/luxemia-pinterest-scheduler-corrected.csv   29 pins  (7/7/5/5/5 = the sheet's own weekly goals)
docs/growth/pinterest/luxemia-pinterest-boards-corrected.csv       5 boards (≤500-char descriptions + correction notes)
scripts/generate-pinterest-scheduler.cjs                           regenerates both from the live catalog
```

Both CSVs keep the sheet's original column names and order (extra verification columns are appended), so
they paste straight into *Pin Scheduler* / *Board Architecture*. PIN-001…PIN-005 stay in the same slots and
the same boards as the original rows.

Guarantees enforced by `tests/pinterestScheduler.test.cjs` (fails the build if violated):

- every destination is `https://luxemia.shop/product/<handle>` — canonical, in `merchant-feed.xml`,
  in `approved-sitemap-inventory.json`, **not** in `goneRoutes.ts`, `in_stock`, ≥2 catalog images;
- no product scheduled twice; each board filled to its weekly goal;
- pin titles ≤100 chars, descriptions ≤500 chars and always containing the destination URL;
- every description states **both** delivery windows (a scheduled pin cannot know the shopper's PDP
  stitching selection, so it must not promise 5–7 days outright);
- none of the banned claims in §1 appear in any pin or board field.

### 2.3 Pin copy formula (as generated)

Title: `[Color] [Fabric] [Category] for [Occasion] | LuxeMia` — occasion comes from the catalog
`occasion:` tag, or the board's target event; never invented from the title.

> **Onion Pink Silk Saree for Wedding Guest | LuxeMia**
> Onion Pink Silk Saree for Wedding Guest. Tracked DHL/FedEx from India: Ready-to-Ship 5–7 business days to
> US/UK/CA, Custom Tailored 15–18 business days total. Lined pieces use a breathable soft cotton or crepe
> inner lining where applicable — the listing states this style's construction. U.S. shipping $14.99, free at
> $150+. Philadelphia support: +1-215-341-9990. Shop at LuxeMia: https://luxemia.shop/product/onion-pink-floral-embroidered-silk-saree-with-cutwork-border

Sentences are dropped whole (never truncated mid-claim) in each board's priority order until the 500-char
budget is met — bridal boards keep the seam-allowance + $20 credit proof, saree boards keep the lining proof.

---

## 3. Community concierge (playbook §1) — corrected reply templates

The channel plan is sound and this repo already ships a better version:
`docs/growth/ANSWER_THREAD_OUTREACH_KIT_2026-09.md` has verified live threads plus F5Bot keyword alerts.
Only the **numbers inside the templates** were wrong. Use these instead:

**Scenario A — event in under two weeks**

> Founder here, so weigh my bias accordingly. If the event is under two weeks away, filter for
> **Ready-to-Ship** only — at LuxeMia those dispatch in 1–2 business days after a 3-Point QA check and
> arrive in **5–7 business days** to the US, UK and Canada via DHL/FedEx. Anything custom-stitched is a
> different clock: **15–18 business days total** after measurements are confirmed. Whichever store you use,
> get the handling time in writing before you pay — "ships from India" plus unstitched fabric plus a
> tailor is where two-week deadlines die.
> Custom-stitched blouses/cholis carry a **2-inch (5 cm) internal seam allowance** where construction
> permits, and we issue **up to $20 USD** Local Alteration Credit against a local tailor's receipt photo
> within 14 days of delivery. Philadelphia support desk: +1-215-341-9990.

**Scenario B — scratchy fabric / lining anxiety**

> The reliable test is whether the listing *states* the lining. Ours say "breathable soft **cotton or crepe**
> inner lining **where applicable**" — and where a style has no lining, the listing says that too. If a store
> won't name the lining fabric, ask before ordering; a photo of the inside seam answers it.
> Two other things worth checking anywhere: whether the **included pieces** are listed (dupatta? blouse?
> churidar?) and whether there's a **pre-dispatch inspection**. We run a 3-Point QA check before dispatch and
> a 48-hour photo-verified window for damaged, defective, misdescribed or incomplete orders.

**Scenario C — comparing stores**

> Quick policy comparison for US/UK buyers, with our own numbers stated plainly:
> **LuxeMia** — Ready-to-Ship 5–7 business days, Custom Tailored 15–18 business days total, ships from India
> via DHL/FedEx. U.S. shipping $14.99, **free at $150+**. Up to $20 USD Local Alteration Credit within 14
> days. Most styles $55–$220; median $121.99.
> For the other stores, check their published handling time and returns window on the day you order — those
> policies change often and I'd rather you read theirs than trust my summary.
> Disclosure: it's my store. If my catalog isn't right for you, the checklist above still applies.

Rules that stay: help first, disclose ownership, never post two identical replies, never claim a
competitor's lead time as fact.

---

## 4. Already built in this repo — do not rebuild

| Playbook ask | Already shipped |
|---|---|
| Sitemap submission / indexation | `public/sitemap.xml` (index of scoped sitemaps), `scripts/generate-sitemap.cjs`, `scripts/submit-indexnow.cjs`, `scripts/approved-sitemap-inventory.json` (323 paths) |
| AI-search / zero-click visibility | `public/robots.txt` allows GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Applebot, Google-Extended; `public/llms.txt` + `llms-full.txt`; `scripts/generate-openai-search-feed.cjs`; bot HTML prerender in `scripts/prerender.js` |
| GMC feed for free listings | `public/merchant-feed.xml` (1,700 items / 237 groups, regenerated + validated every build), `/api/gmc-feed`, `/api/merchant-feed`, `catalog-imports/luxemia-gmc-feed-optimized.csv`, `scripts/validate-merchant-feed.cjs` |
| Rich product metadata | `src/components/seo/SEOHead.tsx` (OG/Twitter/product price meta), Product + ProductGroup + FAQ + Breadcrumb JSON-LD, canonical normalization to `luxemia.shop` |
| Social sharing on PDPs | `src/components/product/SocialShare.tsx` (WhatsApp / Pinterest / Facebook / Web Share), rendered desktop + mobile from `ProductInfo.tsx` |
| Country landing pages for NRI traffic | `src/pages/nri/` (USA, UK, Canada, general) |
| Pixels without spend | consent-gated Meta/Pinterest/TikTok loader; no-ops until IDs are set (`.env.example`) |
| **Pinterest domain claim** | `index.html:74` already publishes `<meta name="p:domain_verify" content="b17dac3c…">` — the token is live, so claiming is a settings-side paste, not a code change |
| **Pinterest catalog feed** | Pinterest's catalog import accepts a Google Shopping–format feed, which `public/merchant-feed.xml` already is (`rss 2.0` + `xmlns:g`), served at `/merchant-feed.xml`, `/feed.xml`, `/shopping-feed.xml`, `/products.xml`, `/google-shopping.xml` and `/api/merchant-feed` (aliases in `vercel.json`), and explicitly allowed in `robots.txt` |
| Cart email capture | `src/components/cart/EmailCaptureModal.tsx` → Supabase `submit-email` |
| Policy surfaces pins promise | `/shipping`, `/returns`, `/alterations`, `SizingAlterationCallout`, PDP trust strip + delivery badge |

---

## 5. Changed in code today (Pinterest gap closed)

| File | Change |
|---|---|
| `src/lib/pinterestPinCopy.cjs` | **New.** Single source of pin/board copy. Delivery numbers are read from `src/config/shippingTiming.cjs`, so pins cannot drift from `/shipping`. Holds the banned-claim rules in its header. |
| `src/lib/pinterestPin.ts` | **New.** Typed wrapper for the storefront: `buildPinterestPinTitle`, `buildPinterestPinDescription`, `occasionFromTags`, `resolvePinFulfillment`, `withShareUtm`. |
| `src/components/product/SocialShare.tsx` | Pinterest share now sends the **rich pin description** instead of `"<title> — Indian ethnic wear from LuxeMia"`, and each channel gets its own `utm_source` (pinterest / whatsapp / facebook) without touching the canonical URL. |
| `src/components/product/ProductInfo.tsx` | Passes catalog `color` / `fabric` / `type`, the `occasion:` tag, and the **real fulfillment state** of the shopper's current selection (unstitched, custom-tailored, confirm-first, ready-to-ship) into both share bars. |
| `scripts/generate-pinterest-scheduler.cjs` | **New.** Regenerates both CSVs from the live catalog with the guards in §2.2. |
| `docs/growth/pinterest/*.csv` | **New.** 29 corrected pins + 5 corrected boards. |
| `tests/pinterestPinCopy.test.cjs`, `tests/pinterestScheduler.test.cjs` | **New**, wired into `npm test`. 28 assertions pass alongside the existing `socialShare` suite. |
| `api/sync-lead.ts`, `tests/syncLead.test.mjs` | **New** (same pass, different gap). Supabase Database Webhook → Shopify customer sync that tags every lead `FIRST10_LEAD`; see §6.9. 35 assertions, wired into `npm test`. |

Key behavior: `resolvePinFulfillment()` only returns `ready-to-ship` when the storefront already shows a
1–2 business-day dispatch metafield and the selection has no stitching, alteration, made-to-order or
confirm-first state. A custom-tailored selection can never inherit the 5–7 day promise in share copy.

---

## 6. Owner-only actions (need logins; ~4 h total)

1. **Pinterest Business account → create the 5 boards** from `luxemia-pinterest-boards-corrected.csv`
   (names, keyword clusters and descriptions are paste-ready). ~30 min.
2. **Bulk-pin the 29 rows** — via whatever bulk/scheduling workflow your Pinterest business account offers,
   or manually at 2–3 pins/day from the CSV (each row carries date, EST time, title, description, image URL
   and destination). Pinterest's recommended pin ratio is 2:3; the CSV's Shopify CDN image URLs take
   `width` / `height` / `crop` query params — render one crop before batch-pinning to confirm the framing. ~60 min.
3. **Claim the domain — the verification tag is already live.** `index.html:74` publishes
   `<meta name="p:domain_verify" content="b17dac3ccfc98d12ec596843262152c7"/>`, so in Pinterest →
   Settings → Claimed accounts, enter `luxemia.shop` and confirm; no deploy is needed. Then run the rich-pin
   validator on one PDP: product rich pins read the `og:type=product` + price/availability meta that
   `SEOHead.tsx` already emits. ~15 min.
3b. **Connect the catalog for product pins at scale (still $0).** Pinterest's catalog import takes a Google
   Shopping feed URL — point it at `https://luxemia.shop/merchant-feed.xml` (regenerated and validated on
   every build, 1,700 items / 237 product groups, retired and 410 handles already excluded). This is what
   turns 206 pinnable styles into product pins without 206 manual uploads, and it keeps price/availability
   in sync so pins never advertise a stale price. ~30 min.
4. **Verify FIRST10 exists in Shopify** before any template or pin advertises it. `src/config/welcomeOffer.ts`
   ships `enabled: true` and warns in-code that advertising a dead discount code is worse than no code.
   Test it in checkout; if absent, create it or flip the flag. ~10 min.
5. **GMC free listings + Microsoft Merchant Center**: follow `docs/growth/FREE_LISTINGS_WHATSAPP_CHECKLIST.md`
   but with **corrected numbers** — U.S. shipping $14.99 with free at **$150+** (that doc says $199), returns
   as `/returns` states (final sale + 48-hour photo-verified window + up to **$20** alteration credit, not $30).
   A feed/shipping mismatch is the top cause of item disapprovals. ~45 min.
6. **GSC + Bing**: submit `sitemap.xml`, URL-inspect the 29 pinned PDPs, request indexing. IndexNow already
   submits automatically on build. ~20 min.
7. **Abandoned-cart recovery**: the playbook's Week 3–4 item does not exist yet — `EmailCaptureModal` saves
   the address to Supabase but nothing emails or WhatsApps it. Cheapest $0 path: a Shopify Flow / Klaviyo-free
   manual export of `submit-email` rows each morning, or Shopify's built-in abandoned-checkout email (enable
   in Settings → Notifications). Decide before promising "automated recovery" in any doc. ~30 min.
8. **Creator barter tracking**: no referral-code or gifting tracker exists in the repo. If the barter engine
   runs, give each creator a distinct Shopify discount code (e.g. `AISHA10`) so usage is measurable —
   do **not** reuse FIRST10, or the channel is unattributable. ~30 min.
9. **Switch on the lead → Shopify sync (`api/sync-lead.ts`, code is merged but inert until you do this).**
   Today a FIRST10 signup lands in Supabase and nowhere else; this endpoint makes the same lead a tagged
   Shopify customer so it is visible, segmentable and exportable where the rest of the business lives.
   ~25 min, all in admin UIs:
   - **Shopify** → Settings → Apps and sales channels → Develop apps: create (or reuse) a custom app with
     `read_customers` + `write_customers`, grant it **access to protected customer data**, and copy the
     Admin API access token into Vercel as `SHOPIFY_ADMIN_API_TOKEN`.
   - **Vercel** → Project → Settings → Environment Variables: add `SUPABASE_WEBHOOK_SECRET` (any long
     random string, e.g. `openssl rand -hex 32`). Without it the endpoint answers `503` for everyone — it
     fails closed rather than accepting unauthenticated writes.
   - **Supabase** → Database → Webhooks → Create a new hook: event **INSERT**, and pick the lead table.
     **Note:** this project has no `email_captures` table — the live capture tables are
     `newsletter_subscribers` (FIRST10 signups, written by `supabase/functions/submit-email`) and
     `abandoned_carts` (cart reminders). Set `SUPABASE_WEBHOOK_TABLES=newsletter_subscribers` (comma-separate
     for both) so the endpoint accepts the table you actually hooked; the default `email_captures` is there
     to match the requested contract if you create that table later. Method `POST`, HTTP header
     `x-supabase-webhook-secret` = the same secret, URL `https://luxemia.shop/api/sync-lead`.
   - **Consent behaviour to know before you enable it:** a record whose `type`/`source` says `cart` is synced
     and tagged but is **not** marked as a marketing subscriber, because `/privacy` publishes that marketing
     emails go out "only with your consent". Everything else is created with `accepts_marketing: true`,
     `marketing_opt_in_level: single_opt_in` and the `FIRST10_LEAD` tag. Flip
     `SYNC_LEAD_DEFAULT_MARKETING_CONSENT=false` if you want an explicit opt-in column on every row first.
   - **What this does not do:** it sends no email. Item 7 (the abandoned-cart sequence) is still open; this
     only makes the audience real in Shopify so whatever you send next has a list to target.

---

## 7. Stale internal docs that contradict published policy

These will re-infect outreach copy if left as-is. They predate the current policy values.

| Doc | Stale claim | Current truth |
|---|---|---|
| `docs/growth/ANSWER_THREAD_OUTREACH_KIT_2026-09.md` | "free over $199", "$30 tailoring credit", "$30 fit guarantee", "most items ship in days" | free at **$150+**; **up to $20** Local Alteration Credit within 14 days; Ready-to-Ship **5–7 business days** |
| `docs/growth/FREE_LISTINGS_WHATSAPP_CHECKLIST.md` | GMC/Bing shipping "free at $199+", "/fit ($30 fit guarantee)" | free at **$150+**; **$20** credit |
| `docs/audits/LUXEMIA_FULL_AUDIT_2026-09-18.md`, `docs/audits/META_COPY_OPTIMIZATION_2026-09-18.csv`, `docs/audits/SEO-AEO-GEO-REVIEW-2026-11-05.md`, `docs/growth/ZERO-CLICK-RECOVERY-2026-11-05.md`, `docs/launch/LUXEMIA_DAY1_LAUNCH_PACK.md`, `docs/growth/module-1-keyword-map-2026-09-14.md`, `docs/catalog-fulfillment-rule.md`, `docs/utsav-comparison-2026-10-08.md` | various `$199` / `$30` references | same as above |

Historical audits are records of a point in time and were left untouched; the two **growth kits in
`docs/growth/` are live playbooks people copy from**, so they should be updated or get a header warning
pointing here. Not done in this pass — it rewrites copy outside the Pinterest scope of the request.

---

## 8. Corrected 30-day timeline

```
Week 1 — Foundations (owner, ~2 h)
├── Day 1: Verify FIRST10 in Shopify checkout (§6.4). Fix or disable before advertising it.
├── Day 1: GSC sitemap + URL-inspect the 29 pinned PDPs; Bing Webmaster Tools (feeds Copilot/ChatGPT).
├── Day 2: GMC free listings + Microsoft Merchant Center with $14.99 / free $150+ and /returns policy text.
├── Day 2: Create the 5 Pinterest boards from luxemia-pinterest-boards-corrected.csv; claim luxemia.shop
│          (p:domain_verify tag is already live) and connect /merchant-feed.xml as the catalog source.
└── Day 3-7: Pin 2/day from the scheduler CSV (PIN-001…PIN-010).

Week 2 — Community + creators (owner, ~1 h/day)
├── Day 8-10: 10 value-first replies using §3 templates (threads in ANSWER_THREAD_OUTREACH_KIT).
│             Set up F5Bot alerts for: lehenga online, saree online usa, sharara online, desi wedding outfit.
├── Day 11-12: 15 creator DMs (5k-30k followers). Gift ONE outfit in the $110-$165 band
│              (e.g. sharara-winepink-pauncho $117.99 or a $159.97 palazzo set) — not a $577 bridal piece.
├── Day 12: Issue each creator a UNIQUE discount code; never share FIRST10 for barter tracking.
└── Day 13-14: Pin PIN-011…PIN-020. Watch GA4 Acquisition → organic social (utm_source=pinterest now works).

Week 3-4 — Amplify + recover (owner, ~45 min/day)
├── Day 15-21: Repost creator UGC to WhatsApp status + Pinterest (idea pins from the same PDP images).
├── Day 22-24: Pin PIN-021…PIN-029. Regenerate the next month:
│              node scripts/generate-pinterest-scheduler.cjs  (picks up new catalog arrivals automatically)
├── Day 25-27: Enable abandoned-checkout email (§6.7) — the only playbook item with no code behind it yet.
└── Day 28-30: Review GA4 by utm_source, GMC free-listing impressions, and Pinterest outbound clicks.
               Double the board that produced clicks; drop the one that didn't.
```

**Attribution note**: pins created from the PDP share button and the scheduler CSV both carry
`utm_source=pinterest&utm_medium=organic_social`, WhatsApp carries `utm_source=whatsapp`, Facebook
`utm_source=facebook`. The canonical URL on the page is untouched, so SEO is unaffected.

---

## 9. Regenerating the scheduler

```bash
node scripts/generate-pinterest-scheduler.cjs     # rewrites both CSVs from public/merchant-feed.xml
npm test                                           # includes the two new pin suites
```

Inputs: `public/merchant-feed.xml` (live product set), `scripts/approved-sitemap-inventory.json`
(indexable paths), `src/lib/goneRoutes.ts` (410 handles), `scripts/product-retirement-20260908.json`
(reversible draft — kept as a warning note rather than a hard exclusion). Selection prefers styles with more
catalog images (better pin creative), then aspirational price, except the comfort/fit board which prefers
accessible price. Because the feed is a build artifact, run `npm run build` first if the catalog changed.
