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
