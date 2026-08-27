# LuxeMia catalog fulfillment rule

The storefront, Shopify catalog, prerendered HTML, Merchant feed, filters and release validators use one fulfillment classification:

- Every purchasable product is **Ready to Ship** unless Shopify identifies it as **Made to Order** or **Made to Measure**.
- A stocked product can also offer a **Custom Size**, **Custom Stitching** or **Made-to-Measure** selection. Its standard stocked selections remain Ready to Ship; the custom selection requires additional processing.
- Fully custom products must carry `Made to Order` and `availability:Made to Order` tags and must not carry Ready-to-Ship tags or claims.
- Ready to Ship means stocked for order handling and dispatch. It does not mean same-day dispatch or a fixed carrier-delivery date.
- Product processing and carrier transit are stated separately.
- Shipping copy must use the current seven-country route-based model and the current U.S. $14.99 below $199 / free at $199+ threshold.
- Voluntary change-of-mind returns are not accepted except where applicable law provides otherwise; genuine damage, defects, incorrect items or missing items must follow the current published reporting process.

The release build scans the full active Shopify catalog and fails if stale shipping, return or fulfillment statements reappear or if custom-only products are not classified as Made to Order.
