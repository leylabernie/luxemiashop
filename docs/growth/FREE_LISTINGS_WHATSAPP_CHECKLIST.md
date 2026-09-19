# Free Listings + WhatsApp Setup Checklist

**Property**: luxemia.shop · **Date**: 2026-09-18
**Why this matters**: free product listings (Google Shopping tab, Bing) put your products in front of buyers *without rankings or ads*. The site feed (`merchant-feed.xml`) is generated and validated on every build — the remaining work is account-side, which needs your logins.

---

## 1. Google Merchant Center — free listings (highest priority)

Feed URL: `https://luxemia.shop/merchant-feed.xml` (regenerated and validated on every deploy).

**Steps (Admin → [merchants.google.com](https://merchants.google.com)):**

1. **Website claim**: Settings → Website → verify luxemia.shop is claimed (if another MC account holds the claim, reclaim it — orphaned claims from old agencies are common).
2. **Check "Surfaces across Google" / free listings status**: Growth → Programs. If it shows "Approved" — confirm products are actually showing (search Google Shopping for a few of your product names). If "Pending", fix the diagnostics in step 3 and re-submit. If "Not approved", open the issues list — they are usually specific feed attributes, not the whole account.
3. **Products → Diagnostics**: clear every "item issue". The common ones for ethnic wear:
   - Missing `size`/`color` on variant items (feed generator covers these — confirm per-item)
   - Image quality/min-size rejections (feed validator enforces product-specific images already)
   - Price/availability mismatch between feed and landing page (the storefront reads live Shopify data, so this stays in sync automatically)
4. **Shipping settings**: must match the site exactly — US standard **free at $199+, $14.99 below**; international rates per the `/shipping` page. Mismatches between GMC shipping and the checkout price are the #1 cause of item disapprovals.
5. **Returns policy**: declare it exactly as `/returns` states (final sale; 48-hour defect/damage claims window). Accuracy here matters more than attractiveness — GMC penalizes mismatched policies.
6. **Sales tax**: configure by state (Shopify collects at checkout; MC needs a matching tax setting for US listings).
7. Re-submit the feed after any fix, then give Google 3–7 days to approve and start serving.

**Success check**: search `site:google.com/shopping` won't work — instead search Google Shopping for "kundan necklace set", "green lehenga", "chaniya choli" and confirm LuxeMia items appear. impressions then show in MC → Performance.

## 2. Microsoft Merchant Center — Bing free listings (10 minutes, zero competition)

1. [Microsoft Advertising](https://about.ads.microsoft.com) → Merchant Center → create store.
2. Same feed URL, catalog settings mirroring GMC (shipping $14.99/<$199, free $199+; returns policy as above).
3. Bing's Shopping tab has a fraction of Google's traffic but almost **no Indian-ethnic-wear competitors run free listings there** — cheap incremental demand.

## 3. WhatsApp Business (the widget is already live on the site)

The floating WhatsApp button is installed; make the other side convert:

1. Download **WhatsApp Business** (separate from personal WhatsApp) and register the store number.
2. **Business profile**: luxemia.shop link, address, email, category "Clothing Store", catalog enabled.
3. **Catalog**: add the top 20 best-margin/best-photo products (bridal lehengas + Navratri chaniya cholis — the season runs now through Diwali) with price + short description; catalog items link back to product pages.
4. **Greeting message** (auto-reply when someone first messages):
   > Hi! Thanks for reaching out to LuxeMia 🪷 Ask me anything about sizing, fabrics, or delivery to the US. First order? Code FIRST10 takes 10% off. Custom stitching available.
5. **Away message** (off-hours):
   > Thanks for messaging LuxeMia! We're away right now — leave your question and we'll reply first thing. You can also browse [luxemia.shop](https://luxemia.shop) — FIRST10 takes 10% off your first order.
6. **Quick replies** (type `/` in chat): `/sizing` (size chart link + measurement instructions), `/shipping` (rates + timeline), `/fit` ($30 fit guarantee explanation), `/custom` (custom stitching process).
7. Add a WhatsApp status post 2–3×/week (new arrivals, festival countdowns) — status views are free reach to every saved contact.

## 4. Quick wins to do alongside

- **Bing Places**: if the business has a real US address, register it — Bing local results are underserved.
- **Google Business Profile**: same, if there's a physical/registered office address — "Indian clothing store near me" demand is real and free.
- Pin the FIRST10 announcement + shipping promise into the site's Instagram-agnostic surfaces you DO control: email footer, order confirmation pages.

---

**Owner time estimate**: GMC check ~20 min (if claimed and pending, up to 1–2 h for diagnostics), Microsoft MC ~15 min, WhatsApp Business ~45 min with catalog seeding.
