# LuxeMia catalog fulfillment rule

The storefront, prerendered HTML, Merchant feed, filters, and release validators use positive catalog evidence for fulfillment labels:

- **Ready to Ship** appears only when the current Shopify record has a supported ready-to-ship tag or a positive product-specific `ships_within` value. Sale availability and the absence of a made-to-order label do not prove ready-to-ship status.
- **Made to Order** or **Made to Measure** appears only when the current product record explicitly supplies that classification. An item can be purchasable while production is still required.
- **Customizable** appears only for an expressly offered option in the current product record. One custom size, color, or service does not imply that every measurement or design change is available.
- A conflicting ready-to-ship and made-to-order classification fails validation instead of being resolved through a title-based guess.
- Fulfillment describes the pre-dispatch path. It does not promise same-day dispatch, carrier transit time, fit, or delivery by an event date.
- Product processing and carrier transit are stated separately. A product-specific processing value is omitted when Shopify does not supply one.
- Shipping copy uses the current seven-country route-based model: U.S. $14.99/free at $199; Canada and the UK $24.99/free at $299; Australia and New Zealand $29.99/free at $349; South Africa $49.99; Mauritius $59.99. All published amounts are USD.
- Voluntary change-of-mind purchases are final sale, subject to applicable law. Damage, defects, material misdescription, incorrect items, and missing pieces use the current covered-order-issue process; the preferred 48-hour reporting period supports evidence review and is not a blanket loss of non-excludable rights.

The release build fails closed when a required Shopify catalog fetch is unavailable. It must not publish a cached or locally invented fulfillment classification as current evidence.
