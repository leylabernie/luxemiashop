# Authenticated preview empty-cart investigation

## Status and scope

Investigation only. No application, tracking, CSP, Shopify or cart behavior changes proposed here have been implemented. Tests below are offline, with an in-memory storage adapter and mocked checkout boundary; no Shopify requests, cart actions in a browser, checkout visits, orders or cleanup occurred. The prior browser failure has **not** been reproduced in an authenticated browser in this environment. Exact tested hostname/SHA, saved Console errors and click evidence are still missing. Do not mistake fault injection for the actual root cause.

Reported identity: variant `48414633296043`, Size `32`, quantity 2, USD 23.30. The owner-supplied historical Collections.html confirms product `9135411593387`, handle `black-georgette-sequin-floral-sharara-suit`, variant GID `gid://shopify/ProductVariant/48414633296043`, option Size=32, amount `23.3`, USD. This confirms historical listing facts only, not current live price/inventory.

## Actual execution trace

1. **Product selection** — `src/components/product/ProductInfo.tsx`: quantity is separate React state; +/- changes this value only. It is not proof an add succeeded. Native selected options determine `purchasableVariant`; the button is disabled for unavailable/enquiry selections.
2. **Add handler** — `handleAddToCart` checks enquiry, verified mens alteration service, measurement format/context, missing variant, blouse confirmation, custom color/size acknowledgment, stitching and size-handoff requirements, and Meta session validity. Each guard returns before add. The supplied standard-size variant is not currently in the enquiry override list, but the browser's selected services/context and live data are unknown. No validation was bypassed.
3. **Configured lines** — the handler builds garment custom attributes, optional configuration reference, and eligible service lines. For ordinary product URLs, it calls `useCartStore.addItem`; for Meta-context URLs it saves a separate shopping selection, deliberately leaving the regular bag unchanged. This is why the complete tested URL including query parameters matters.
4. **Local addition** — `src/stores/cartStore.ts`: `addItem` checks enquiry again, normalizes attributes and existing lines, calls `trackAddToCart`, then merges/inserts the line using Zustand `set`. There is **no cart API request at this stage**. No request is not itself evidence that a handler failed.
5. **Persistence** — Zustand persist writes `shopify-cart` using localStorage. `partialize` retains lines/options/prices, redacts raw measurements and deliberately never persists a checkout URL. A state/store exception can interrupt the handler. Storage write failures are not the same signature as a wholly empty in-memory bag.
6. **Drawer** — product and `CartDrawer` import the same `@/stores/cartStore` module. Drawer renders `items`; heading uses `items.length` (line count), whereas each line has its own unit quantity. One size at quantity 2 should read Your Bag (1), not (2). Source inspection establishes module identity but does not prove browser bundle/runtime behavior.
7. **Actual Shopify request** — opening a nonempty eligible drawer starts `createCheckout({trackEvents:false})` once per cart signature. `src/lib/shopify.ts:createStorefrontCheckout` builds cartCreate lines/attributes, handles GraphQL userErrors or missing data/URL, validates returned identities, quantities, attributes and expected prices, then normalizes the hosted URL. It does not replace local items with a returned empty cart.
8. **Response handling** — the store preserves items on checkout error, clears unusable URLs, resets loading, and ignores a result if the current cart signature differs. Edits invalidate prepared URLs. Returned checkout URL updates the same store; the drawer uses its native anchor, preserving PR #295's linker path. The in-flight loading guard prevents duplicate preparation calls. The drawer has an attempted-signature guard against render-loop retries.
9. **Initialization/late writes** — normal synchronous localStorage rehydration restores items; checkout URLs are invalidated. Existing legacy `lovable.app` payload sanitization can clear a rehydrated cart, and measurement/service normalization may modify attributes. No evidence identifies these as the observed failure. Checkout response branches do not clear items on error and a stale response did not overwrite edits in the offline tests.

## Reproductions and counterexamples (offline only)

`node --test tests/previewCartInvestigation.test.cjs tests/cartSummary.test.mjs tests/measurementCartAssociation.test.cjs tests/headlessAnalytics.test.cjs tests/internalQaAnalytics.test.cjs`

62 tests passed in the combined targeted run. The nine new investigation cases load the real store and real ecommerce analytics code; only hosted-checkout creation and unrelated page-view marketing integration are replaced. The fixture uses the exact reported variant/size/price but is not a current inventory assertion.

- Ordinary exact-variant addition at quantity 2 succeeds with one local line, same price/options, matching saved JSON and zero checkout calls.
- A separately initialized store restores the saved line. Editing quantity to 3 persists and the mocked checkout boundary receives quantity 3 and the expected variant price. This is request-boundary verification, not live returned-Shopify-cart verification.
- Injected checkout rejection returns null, retains items/persistence, records error and exposes no successful URL.
- An injected delayed checkout response after quantity changes to 4 is ignored; quantity/persistence stay 4 and checkoutUrl stays null.
- **Injected synchronous gtag exception** throws before `set`, leaving no items or storage write, and no checkout request. Sanitized synthetic error: `OFFLINE_INJECTED_TAG_EXCEPTION`. This is a concrete pre-state-update interruption path, **not a captured production/preview error**. No telemetry or settings were changed to fix it speculatively.
- **Injected localStorage write exception** leaves memory quantity 2 but storage empty. Sanitized synthetic error: `OFFLINE_INJECTED_STORAGE_EXCEPTION`. This differs from both memory and persisted bag remaining empty.
- Two local add API calls intentionally merge to quantity 4. This characterizes a missing product-level duplicate-call guard; it does not claim UI duplicates are prevented.
- Concurrent checkout preparation calls send one mocked request due to the existing loading guard.
- Static assertions show both components import the same store and the drawer counts lines. A separate existing drawer-render fixture test now verifies one two-unit line yields heading (1) and USD 46.60 subtotal. It is not a live product-handler click/subscription test.
- Existing measurement/service association regressions remain included in the targeted run. Private measurement persistence redaction is expected behavior, not accidental attribute loss; reload may correctly require re-entry before checkout.

## Error/success and duplicate-submission findings

`ProductInfo` currently sets `isAdding=true` before mutation; the button animates to "Added!" based on that pending state, not a verified mutation result. The handler has no enclosing catch/finally. A thrown add/storage/telemetry error can therefore interrupt the handler without resetting pending UI. The store's enquiry rejection returns void and the caller does not inspect an acceptance result. These are genuine code-level resilience concerns, but none establishes which event occurred in the reported browser run.

The button is disabled after a React state update, but there is no immediate ref/mutex at handler entry. Same-tick duplicate invocation is not explicitly guarded; store merging is deliberately additive. Do not solve that by deduplicating all repeated cart additions, which would block intentional shopping.

## Smallest proposed fix — conditional, not implemented

First obtain existing click/Console evidence and tested deployment identity. Then fix only the demonstrated failure:

- If a validation gate rejects: retain it; ensure its error is visible and the agent selected required options/acknowledgments. Do not force add.
- If click targeting was wrong or Meta context was active: correct the test/navigation, not the cart store.
- If a gtag exception is confirmed: isolate nonessential event exceptions from cart mutation without changing linker config, consent, sender count or payload semantics. Add an exact regression asserting one accepted line despite the injected tag failure. No retries.
- If persistence fails: present a clear storage/save error and never claim durable success; preserve any accepted in-memory configuration and avoid blind retries that duplicate lines. Exact behavior needs agreement before implementation.
- For verified handler interruption/duplicate submission: use an immediate per-attempt ref lock, explicit acceptance results, catch/finally reset, and an actual success state only after all intended lines are accepted. An atomic multi-line commit may be necessary if a garment plus service can otherwise be partially added. Do not invent a broad rewrite or bypass service validation.

Before a fix is accepted, add handler-level tests for accepted/rejected addition, visible error/no false Added state, same-tick double activation, consistent drawer subscription/count, and reload persistence. The current diagnostic tests do not complete those UI acceptance gates.

## Live verification gate

Cannot complete from this sandbox: no authenticated browser-control tool; outbound production/Shopify access is restricted. Existing agent report path `/home/ubuntu/...` is not an accessible attachment here. Need exact immutable hostname/SHA, complete product URL/query, saved screenshot/Console exception, validation/toast output and click selector/method. Do not publish session cookies or customer measurements.

After a confirmed fix and an authorized authenticated preview, perform one successful add; confirm line identity/options/quantity/prices/services/attributes in UI and storage; reload (respect measurement re-entry); edit quantity once; verify a fresh checkout matches latest configuration and all required inventory/price/fit/tailoring checks. Stop before payment/order submission. No automatic retries, cart clearing, fulfillment, cancellation, restock or cleanup. Do not visit #1002 or its status page. PR #295, CSP, strict preview hosts, tracking/consent/channel settings remain untouched. No production deployment or merge authorized.
