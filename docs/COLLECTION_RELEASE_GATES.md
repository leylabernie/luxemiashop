# Collection optimization: current release gates

PR: https://github.com/leylabernie/luxemiashop/pull/296

## Disposition

Keep draft. No merge or production deployment is authorized. Prior size figures in COLLECTION_HTML_INVESTIGATION_2026-11-14.md are historical measurements, not current-catalog guarantees. The next push requests a fresh automatic Vercel preview build using the existing fresh-catalog build pipeline; do not replace that pipeline with uploaded CSVs or stale fixtures.

## Catalog evidence supplied by owner

- Completion report and 570-row change history distinguish 500 saved tag operations on currently archived products, 66 saved on active products, four failed operations, and 471 separate pending proposals. Do not describe all proposals as published.
- The nine-product inventory/publication export contains 54 distinct variants, each with 10 recorded available/on-hand units, inventory tracking enabled, and publication to the listed channels including Google & YouTube and headless.
- Owner explicitly confirms 10 per size is correct. Treat as merchant-confirmed, not independently physically counted.
- Publication is not proof of Merchant Center approval/serving or successful headless rendering.
- Sidekick handles tag inspection separately. No tag, inventory, status, publication, or collection rule changes are authorized as part of this PR work.

## Reported browser failure: unresolved

An external browser agent reports a size-32 Black Georgette Sequin Floral Sharara Suit selection (variant 48414633296043, USD 23.30), product-page quantity 2, empty bag and persisted cart, with no captured checkout URL or GA4 collect requests. Exact tested deployment/commit and saved browser evidence have not been supplied as accessible attachments. Its filesystem link is not accessible in this repository environment.

This is a failed verification run, not a proven root cause in this PR. The product quantity selector is separate from cart state. Product validation, click targeting, console exceptions, storage behavior, and deployment identity must be established from existing evidence. Missing captures do not prove no analytics send occurred. Do not bypass validation, patch cart logic speculatively, clear storage, or retry cart/checkout automatically. Order #1002 and its status page remain untouched.

Required existing evidence:
- Exact deployment hostname, complete product URL/query and tested SHA.
- Saved screenshots, validation/toast messages, console errors, and click locator/method.
- Whether Added appeared and the drawer opened automatically.
- Sanitized report attachment; no customer measurements, cookies or credentials.

## Required release checks

- Fresh preview build READY and exact immutable deployment URL recorded.
- Decode/structured-data audits on refreshed output; compare catalog membership against expectations, not fixed historic counts.
- Desktop/mobile on both collections and representative products: navigation/search/filter/sort/pagination/images/options, where present.
- Actual document transfer/resource sizes and encoding; do not equate local compression estimates with transfer or decoded savings with CWV improvement.
- Resolve existing cart failure before any further authorized no-order regression. Verify latest variants/options/quantity/prices/services/measurement attributes after quantity edit and reload; stop before payment/order submission. No automatic retry or cleanup.
- CSP runtime and linker/session continuity checks remain browser work; no tracking/configuration changes.
- Separate owner approval before any production release.

## Merchant Center: separate workstream

The available connector lookup does not support Google Merchant Center. No Store quality screenshot, category metrics, recommended targets or account diagnostics have been supplied. Do not infer what prevents Exceptional from catalog exports or recommend a configuration change without that evidence.

Needed: overall Store quality rating plus expanded category scorecards, country/date scope, current metrics, targets and warnings (hide account IDs and personal details). Assess data correctness separately from actual shipping/returns/service improvements. Do not shorten fulfillment promises, claim unverified stock, alter return terms or shipping/payment/channel settings for a badge. No claim about current Google rating criteria is made from an uninspected email.

## Local code checks for refresh

Re-ran npm test, six audit-tool tests, lint and TypeScript: all commands exited 0. These are not browser/checkout checks. The five collection image encoding/renderer regressions are included in npm test. Full refreshed build result belongs to the Vercel preview check; it is not assumed from local tests.
