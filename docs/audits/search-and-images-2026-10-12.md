# Search and product image follow-up — 12 October 2026

## Missing URLs

All 495 examples exported from the Search Console 404 report were checked against the live site: 369 returned 410, 117 returned 404, and 9 returned 200. No example returned a current server error.

The 117 remaining 404s comprise 101 product URLs, 15 blog URLs, and `/34`. None appears in the 956 paths in the current sitemap index and its five child sitemaps. No exact product/blog route is referenced in tracked site source. None of the 101 product handles matches the current Shopify catalog, including archived and draft products. No verified one-to-one replacement was found in the Shopify redirect records. The blog slugs are absent from the published article source.

Disposition: retain truthful 404 responses for missing content. Do not redirect these URLs to unrelated products, categories, or the homepage. Do not restore deliberately removed products or create articles solely to eliminate a historical report entry. This does not establish the original deletion reason for every URL. Reassess an individual URL if its original product identity or replacement becomes available.

Google guidance: https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors

## Images

Checked all 429 active Shopify products and every gallery image (no gallery pagination was truncated). At a conservative 1500-pixel minimum on both dimensions, 42 primary images meet that threshold; 387 do not, including missing primary images. Eleven products have larger gallery alternatives.

Reviewed all eleven visually. Eight have suitable full-length alternatives and are explicitly mapped in `src/data/merchantImageSelections.json`. Three designer sarees retain their current on-model primary photos because the larger alternatives are mannequin images. The selector falls back to the existing image if the reviewed replacement leaves the product gallery, and preserves different variant images. It changes merchant feeds only.

The remaining 376 products have no gallery image meeting this 1500-pixel threshold. This is an internal audit threshold, not a claim about Google's Store Quality formula. Higher-resolution source photographs are needed for further real resolution improvement; requesting a larger CDN width does not add original detail.

## Google Customer Reviews

Merchant Center has the program enabled but reported no opt-in display in over 30 days. This warning alone does not prove malfunction when order volume is low. Browser inspection confirmed Google & YouTube is installed and connected; the connector's installed-app list had been incomplete. The Google Customer Reviews block was added to the active Thank you configuration, saved, and detected by Google's setup wizard. The merchant-approved 18-day default delivery estimate persisted after reload. The preview still displays a setup warning, so live survey activation remains unverified. No order was placed and no customer email was submitted.

Google integration requirements: https://support.google.com/merchants/answer/14629205
Shopify checkout customization: https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-apps

## Search and purchase-path follow-up

GSC Web, September 13–October 10, 2026: 27 clicks, 1,961 property impressions, 1.4% CTR, average position 16.3. Page-level impressions are not additive to property-level impressions.

| Page | Clicks | Impressions | Average position |
| --- | ---: | ---: | ---: |
| Indian-to-US sizing article | 3 | 759 | 8.0 |
| Homepage | 15 | 286 | 6.0 |
| Measurement guide | 3 | 220 | 7.7 |
| Sarees | 0 | 163 | 62.3 |
| Designer sarees | 0 | 66 | 44.6 |
| Lehengas | 0 | 54 | 47.0 |
| Magenta kurti set 9827 | 0 | 12 | 11.5 |

The leading pages mostly serve sizing information; shopping-category visibility is much weaker. This is evidence against attributing low clicks solely to titles. The sample is too small to establish conversion failure or a product-level CTR problem. The sizing article title and excerpt were clarified without changing its URL or measurement guidance. Existing measurement-guide shopping links are already present.

Tested the magenta kurti set in size 38: add-to-cart and checkout navigation succeeded, and LUXE10 reduced $87.99 to $79.20. Shipping calculation and payment completion were not tested because no customer address or payment was submitted. Checkout's store-logo link targets the Shopify domain; this was observed, not changed. This browser check was desktop, not a completed mobile-device test.

The product's above-purchase dispatch notice still used a vague confirmation fallback. Updated the default ready-stock notice to the merchant-approved shared shipping estimates, retaining explicit processing, made-to-order, unstitched and availability-confirmation exceptions.

## Continued audit and fixes — 12 October 2026

Started from verified current main `b27fd2080309b2908ac00fd41aba1db4b6ebf25e` in a fresh checkout; the old workspace contained already-published edits and was not reused for changes.

### Shipping and checkout

Read all Shopify delivery profiles, location groups, zones and methods with complete pagination. One default General profile covers seven countries. Active USD rates: US $14.99 below $150, free from $150; Canada/UK $24.99 below $299, free from $299; Australia/New Zealand $29.99 below $349, free from $349; South Africa $49.99 and Mauritius $59.99. No express shipping method is configured. Clarified the default product timing notice so express requires a separate quote and confirmation before ordering, consistent with the existing shipping-consolidation policy. No express price was invented.

The Shopify checkout SHIPPING_POLICY still stated free U.S. shipping from $199 and ready-stock processing of 1–3 business days. Corrected it to $150 and the merchant-approved 3–4 day dispatch, standard 9–14 day transit / 12–18 day total and separately confirmed express 3–6 day transit / 6–10 day total. Saved through the authorized admin browser because the connector lacks write_legal_policies; read back the saved policy through the connector. Preserved customization exceptions and the covered-issue return policy. Also replaced stale 3–5 business-day ready-stock claims on the Vercel homepage and USA landing page.

Live test: magenta kurti set, size 38, $87.99; LUXE10 produced $79.20. A rate lookup using only Philadelphia, PA, ZIP 19103 and US returned U.S. Standard $14.99, total $94.19, with no express choice. No contact email, name, street address, payment or order was submitted. Removed the test item and verified the cart was empty. This verifies one destination and basket, not every address or the free-shipping checkout boundary.

Clicked the live checkout logo: although its href uses the permanent myshopify domain, navigation returned to https://luxemia.shop/ and retained the cart. No logo or DNS change is needed on this evidence. Post-purchase return behavior remains unverified.

Merchant Center's seven shipping services are visible and marked Complete, but advertise 2–10 days. The U.S. editor specifically shows one handling business day plus 1–9 transit business days, Monday–Friday. The U.S. advanced cost table correctly charges $14.99 from $0.01 through $149.99 and free from $150.00. Do not replace Google's working-day fields until calendar versus business days and operating-day treatment are established. Google & YouTube Shipping Information sync is On; Product sync is Off, consistent with using the separate storefront feed. Neither setting was changed.

### Reviews diagnosis

Reverified Google & YouTube is installed and connected to Merchant Center 5773333098. The active configuration remains LuxeMia.Shop configuration 2; google-customer-reviews remains on Thank you, with 18 saved estimated delivery days. Shopify's mobile preview renders the sample survey and its Yes/No controls, alongside the setup warning. This is simulated content, not a live customer opt-in.

Reproduced the onboarding persistence failure once: reopening /apps/google/gcr_onboarding showed 1/2 complete, with the existing agreement complete and the extension step incomplete. Confirm detected the block and showed 2/2; Complete setup returned to Overview. Reopening onboarding returned to 1/2 again, while the saved block and 18 days persisted. This isolates an inconsistent Google app onboarding state; the underlying app/server cause is not exposed by available tools. No new terms were accepted, no app installed, and no survey consent was submitted. Merchant Center still shows no opt-in data and the >30-day warning; low volume prevents concluding that all live surveys fail. A support investigation or a genuine future order with customer consent is needed to establish live behavior. No support message was sent.

The custom Vercel /order-confirmation page is not a verified alternative integration. It requires order_id/email/delivery_date query parameters, while checkout supplies only a static return_url; no authenticated order-data handoff was found in the reviewed source. Its loader also names renderOptIn before defining that callback on a fresh page. Do not claim this path works, inject fabricated order/email data, or enable a competing survey path without a verified order-data integration. The Shopify extension remains the intended path.

The footer's Review us on Google link targets a Google Business Profile place-review URL; this does not establish the source of existing reviews or the health of Customer Reviews.

### Mobile and category visibility

Completed the live product-selection/cart/checkout actions on the available desktop browser. Inspected Shopify's supported mobile checkout/Thank you preview; it is not an end-to-end mobile storefront test. The available browser API has no viewport/device-emulation control, so real mobile product/cart usability remains unverified. No speculative layout change was made.

Live raw HTML for /sarees, /lehengas and /collections/designer-sarees returned 200, index/follow directives, correct self-canonicals and product links (45, 115 and 6 unique links respectively in the fetched HTML, not asserted inventory totals). No immediate indexability fault was found in those checks. Added four contextual category links to the already-visible sizing article's garment measurement table. This helps readers reach relevant shopping categories without rewriting category titles or promising ranking gains.

Validation before deployment: all 39 tests passed, blog and policy-copy validators passed, and Vite development build passed. Full local production build passed its pre-route gates and Vite compilation, then stopped because SHOPIFY_STOREFRONT_TOKEN is absent locally; verify the complete production build using Vercel's configured environment. Generated inventory/gone-route changes from that attempt were discarded.
