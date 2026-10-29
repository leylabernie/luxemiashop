# Internal QA analytics suppression

Analytics remains enabled by default only on the exact production hosts luxemia.shop and www.luxemia.shop. Preview, Vercel alias, localhost and other hosts do not load the Google tag or queue analytics events. This does not enable Vercel Web Analytics or change GA4 property settings.

Before a production QA session, open https://luxemia.shop/?luxemia_qa=1 in the test tab. This sets the nonpersonal sessionStorage key `luxemia.analytics.qa` to `1` and suppresses Google tag loading and events for that document and subsequent same-tab page loads, including SPA navigation and cart/checkout-intent helpers. No identity, measurements or customer data are stored in this flag. Do not share QA-mode links with customers. Use a separate tab for real customer-traffic checks.

To clear the flag, load https://luxemia.shop/?luxemia_qa=0 in that tab. Normal tracking resumes on this fresh load. Closing the tab normally clears session storage; session restoration may retain it, so explicit clearing is preferable. If session storage is blocked, the query flag suppresses only the current document: retain `luxemia_qa=1` on full reloads or test on a preview hostname, which is always suppressed.

This is storefront suppression only, not a GA4 internal-traffic filter and not a Shopify checkout pixel opt-out. It cannot remove historical QA events or guarantee that separately hosted checkout tracking is excluded. Never complete a paid order just to validate analytics. Consent behavior is unchanged; consent management is a separate task. The public order-return page continues to avoid unverified purchase events.
