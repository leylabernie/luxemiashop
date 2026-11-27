# Meta checkout translator — `/meta-checkout` (Commerce Manager validation)

Status: **Not resolved.** Preview checkout loads with the verified $496.44 basket;
Commerce Manager fails with “A product name was incorrect.” This branch found and
fixed a cause that was upstream of every title comparison: `/api/meta-catalog`
was returning **503 for the entire feed** on the pilot's real Shopify option
shape, so Meta could not refresh the item records it validates against. Awaiting
a deploy, a forced re-fetch and a rerun of Meta's checkout test.

## The catalog feed itself was failing closed (2026-11-26)

**Found and fixed in this branch.** `/api/meta-catalog` was not serving a feed at
all for the pilot's real Shopify data — it returned **503 for every product**, so
Meta had nothing to re-fetch. A `no-store` header (PR #320) cannot help a
response that is never a 200.

### Evidence, from this repository's own captured Shopify data

`public/merchant-feed.xml` is generated from the live Storefront API
(`scripts/generate-static-feed.cjs` → `fetchCompleteStorefrontCatalog`;
`last_build_date` `2026-11-05T18:52:12.090Z`, 1,700 items — the count
`docs/growth/ZERO-BUDGET-PLAYBOOK-VERIFIED-2026-11-25.md` documents as current).
Its `composeMerchantVariantTitle()` joins **every** native `selectedOptions`
value into the variant title, and its description prints the non-size options
verbatim, so it records each variant's real Shopify option shape:

| Pilot variant | `g:item_group_title` (parent) | `g:title` (variant-level) | Recorded options |
|---|---|---|---|
| `lmv-48120657903787` | Green Digital Printed Chinon Anarkali Suit Set, Mehendi Festive Outfit | …Outfit **— S / Standard** | `Size: S` + `Alteration: Standard` |
| `lmv-48210922504363` | Dusty Peach Embroidered A-Line Palazzo Suit, Chinon, Indian Wedding Outfit (Ready-to-Wear) | …(Ready-to-Wear) **— S** | `Size: S` |

`anarkali-green-chinon` has **ten** native variants in that snapshot — five
`Standard` and five `Custom` — so it carries a native `Alteration` option.
`src/lib/metaPilot.ts` declared its approved variants with `Size` **only**: the
`family(..., standard)` parameter that adds `{name:'Alteration',value:'Standard'}`
was never passed `true`, so it was dead code. `verifyMetaPilotVariant()` compares
`variant.selectedOptions.length !== approved.selectedOptions.length` and throws.

### Reproduced before the fix

Feeding that captured shape into the real handler (376 ordinary products + both
pilot families, mocked Storefront responses):

```
HTTP status       : 503
X-Catalog-Products: undefined
Cache-Control     : undefined            ← PR #320's header is never reached
body              : "Catalog temporarily unavailable; retry later"
server log        : [meta-catalog] Meta pilot variant no longer matches its approved configuration.
```

`metaCatalogRows()` throws, the handler's `catch` fails the **whole** feed closed,
and all 387 rows are lost — not just the pilot's. That behaviour is deliberate
(a partial REPLACE CSV would delete Meta items) and is left unchanged.

### Why this produces “A product name was incorrect”

Meta's catalog can only hold `lmv-` IDs because it imported a feed that published
them, so a fetch did succeed once. Every fetch since has been a 503, so Meta's
item records are **frozen at that last successful import** — saved `title`,
`size` and price included. The checkout summary is built live from Shopify and
still works (`createStorefrontCart()` never calls `verifyMetaPilotVariant`), which
is exactly the reported symptom: the basket loads and totals $496.44, while the
name Meta compares against is the one it could not refresh.

### The fix

`verifyMetaPilotVariant()` now approves `Alteration` at exactly `Standard` as an
*optional* native option, in addition to a family's declared options. Declared
options must still all be present exactly once, and any other native option —
`Alteration: Custom`, `Made to fit (+$20.00)`, a renamed size, a repeated option
name, a third option — still throws.

Tolerating the option's presence *or* absence, rather than declaring it strictly
with `family('anarkali-green-chinon', 'Green', [...], true)`, is deliberate:
strictness leaves the same whole-feed 503 one Shopify option edit away in **either**
direction, and this sandbox cannot query Shopify to know which shape is live
today. Both shapes publish byte-identical rows (id, title, size, color and link
come from the declared pilot entry; price from the native variant), so the
tolerance cannot publish a different item. The `standard` parameter keeps its
strict meaning for any family that declares it.

### Tests

`tests/metaPilotFeed.test.mjs` gained five parity tests that derive the pilot's
expected option shape, parent title and selling price from the captured snapshot
instead of from the declaration itself — closing the self-consistent-fixture gap
noted below. They fail without the fix (`4` failures, including the endpoint
returning 503) and pass with it. `npm test`: **1050 passed, 0 failed**.

## Current title and cache audit (2026-11-26)

- The live Meta feed handler (`/api/meta-catalog`) writes each pilot row's
  `title` from Shopify's parent `product.title` (truncated to 150 characters).
  The variant size is a separate `size` field; the feed does not append `S` to
  the title.
- The server summary reads `cart.lines[].merchandise.product.title` and prints
  it unchanged. Its GraphQL query does not request variant `title` or
  `selectedOptions`, so it does not append a size suffix either. At the source
  field level, the Meta feed and summary should therefore match when both are
  generated from the same Shopify product record.
- **Both titles are now confirmed identical from captured Shopify data, not
  inferred.** Two independent snapshots agree on the parent titles: the catalog
  snapshot `tests/fixtures/catalog-included-pieces-20261028.json`
  (`capturedAt 2026-10-28T18:13:15Z`) and the merchant feed
  (`2026-11-05`). At **70** and **90** characters neither title reaches the
  feed's 150-character `slice`, and neither contains `&`, `<`, `>`, `"` or `'`,
  so the summary's `escapeHtml()` cannot alter it either. Feed title and summary
  title are therefore byte-identical today — the mismatch Meta reports is *not*
  produced by these two code paths disagreeing.
- The peach pilot's selling price is `g:sale_price` `77.49 USD` against a
  `g:price` compare-at of `154.97 USD`, so 1 × $108.99 + 5 × $77.49 = **$496.44**
  was already correct on 2026-11-05. The snapshot is price-consistent with the
  basket Meta verified, which is why its option data is treated as trustworthy.
- Shopify checkout renders its own line-item presentation. This repository
  cannot verify the exact live text or how Meta's validator parses the separate
  size option. The summary's own test fixtures remain synthetic; the new parity
  tests are what tie the pilot declaration to captured Shopify data.
- The old Vercel feed header allowed a 5-minute shared cache plus 10 minutes of
  stale-while-revalidate. The endpoint now sends `Cache-Control: no-store` so a
  feed refresh cannot receive a stale Vercel copy — but only on a 200, which is
  why the 503 above had to be fixed first. Meta's own imported-item cache is
  separate; no connected Meta tool is available to inspect its saved title or
  last-fetch time.
- `public/feeds/meta-catalog.csv` is a legacy static sample and contains no
  `lmv-` pilot IDs. The configured Meta source should be the dynamic
  `/api/meta-catalog` endpoint, not that static file.

## What still cannot be verified from here, and the exact evidence needed

This sandbox has outbound network access to GitHub, npm and PyPI **only**. All
three of the following were attempted and are unavailable, so nothing below is
guessed:

| Needed | Attempted | Result |
|---|---|---|
| Live `https://luxemia.shop/api/meta-catalog` and `/meta-checkout` | `curl` | `SSL_ERROR_SYSCALL` — host not reachable from the sandbox |
| Shopify Storefront/Admin API | `curl` | not reachable; no `SHOPIFY_STOREFRONT_TOKEN` in the workspace |
| Commerce Manager catalog records (saved `title`, `size`, last fetch) | — | no Meta connector is available in this session |
| Vercel deployment state and build logs | `list_projects` via the connected Vercel app | **Access denied** — the connected token is scope-limited (`limited: true`, `list_teams` returns `[]`). It authenticates as `lab.bhamini@gmail.com` but cannot read projects or deployments, so the reported successful production deploy could not be confirmed here either |

Run these from any machine with internet access. They settle steps 1–3 with
evidence instead of inference:

```bash
# 1. Is the feed serving 200 now, and what exact title/size does it publish?
curl -sS -D /tmp/h.txt -o /tmp/meta.csv "https://luxemia.shop/api/meta-catalog"
head -1 /tmp/h.txt; grep -i "x-catalog-products\|cache-control\|x-vercel-cache" /tmp/h.txt
grep -E "lmv-48120657903787|lmv-48210922504363" /tmp/meta.csv

# 2. What exact names does the validator read off the checkout summary?
curl -g -sS "https://luxemia.shop/meta-checkout?products=lmv-48120657903787:1,lmv-48210922504363:5&coupon&cart_origin=meta_shops" \
  | grep -o "<td>[^<]*</td>" | head -8
```

Expected once this branch is deployed: `HTTP/1.1 200`, `x-catalog-products: 387`,
`cache-control: no-store, max-age=0, must-revalidate`, and the two feed rows
carrying `Green Digital Printed Chinon Anarkali Suit Set, Mehendi Festive Outfit`
/ `size S` and `Dusty Peach Embroidered A-Line Palazzo Suit, Chinon, Indian
Wedding Outfit (Ready-to-Wear)` / `size S`. A `503` means Shopify's option shape
drifted again — read the `[meta-catalog]` line in Vercel runtime logs for which.

Then in Commerce Manager: **Catalog → Items**, search each `lmv-` ID and record
the saved *title*, *size* and *last updated*, force a feed re-fetch, and rerun the
checkout test with the same basket. Interpret it as follows — do not skip ahead:

| Commerce Manager shows | Meaning | Action |
|---|---|---|
| Saved title **differs** from the live feed title | Stale record; the 503 blocked refresh | Re-fetch, wait for the import to report success, rerun the test |
| Saved title **equals** the live feed and summary titles, test still fails on name | Meta is comparing something other than the stored `title` — most likely a variant-level name it composes from `title` + `size` | Capture Meta's exact diagnostic wording and the item's displayed name in Commerce Manager, then decide whether the feed *and* summary must both publish a size-suffixed title. Changing only one side would recreate this bug |
| Feed re-fetch reports an error | Shopify-side data problem | Read the error text; the `[meta-catalog]` log line names the failing rule |

**Not resolved.** Commerce Manager has not reported PASS, and this branch cannot
make it report one from here — it removes the failure that was preventing Meta
from refreshing the titles it validates against.

Next: deploy, run the two curls above, then trigger a fresh catalog fetch in
Commerce Manager and check the item records for both exact `lmv-` IDs and their
last-updated time. Then rerun the validator. **Do not mark resolved until Meta
passes.**


## Earlier browser-reset investigation (2026-11-26)

The Meta handoff previously rewrote Shopify's returned checkout hostname to
`checkout.luxemia.shop` and omitted the storefront's `channel=online_store` and
`return_url` parameters. PR #319 removed that host rewrite, preserved Shopify's
validated URL, and aligned the parameters with the ordinary storefront flow.
The user subsequently reported that Preview checkout loaded and the basket
verified at $496.44. The precise network cause was not independently measured.

## Summary-page behavior

The summary endpoint serves a 200 HTML order summary after successful Storefront
`cartCreate`, with Shopify-returned titles, quantities, USD prices and cart total.
It provides a checkout link and browser handoff. GET and HEAD have matching
headers; HEAD has no body. Existing permalink fallbacks and SPA handoffs remain.
All clients receive the same page (no user-agent branching).

Validation: 110 focused checkout tests passed before the latest feed-cache change.
After the pilot-verification fix in this branch: `npm test` **1050 passed,
0 failed, 5 skipped**, including the five new snapshot-parity tests in
`tests/metaPilotFeed.test.mjs`. **Do not mark resolved until Meta passes.**

Written 2026-11-25, updated 2026-11-26. Code: `api/meta-checkout.ts` + two
`vercel.json` rewrites + one `middleware.ts` header rule; the feed fix is in
`src/lib/metaPilot.ts` only.
Tests: `tests/metaCheckoutTranslator.test.mjs` (40 assertions),
`tests/metaPilotFeed.test.mjs` (12 tests, 5 derived from the captured Shopify
snapshot).

| Date | Change | Trigger |
|---|---|---|
| 2026-11-25 | Translator deployed (#314, `main` `75ddf82`) | *"The subtotal was incorrect"* |
| 2026-11-26 | Bare `&coupon` treated as no coupon (#315, `main` `3e81410`) | Meta Preview sent `&coupon` with no value → 400 |
| 2026-11-26 | Branded checkout host + server-side `cartCreate` + no `nofollow` on redirects (#316, `main` `21cea2a`) | *"The checkout page couldn't be loaded"* |
| 2026-11-26 | Kept Shopify's own checkout hostname and storefront parameters (#319) | Cookie-less crawler could not reach checkout |
| 2026-11-26 | `Cache-Control: no-store` on `/api/meta-catalog` (#320, `main` `f6d50b3`) | Suspected stale Vercel feed response |
| 2026-11-26 | Pilot verification approves native `Alteration: Standard`, so the feed stops 503-ing (this branch) | *"A product name was incorrect"* |

## The problem, precisely

Commerce Manager (account 1571513604208748) has checkout URL
`https://luxemia.shop/meta-checkout` and validates it with a plain HTTP request:

```
https://luxemia.shop/meta-checkout?products=lmv-48120657903787:1,lmv-48210922504363:5&cart_origin=meta_shops
```

The storefront **does** handle that URL — `src/pages/MetaCheckout.tsx` resolves
the IDs, verifies prices and hands off to a Shopify *checkout*. Verified live on
2026-11-25: a JavaScript client following that link ends at
`checkout.luxemia.shop/checkouts/cn/…&cart_origin=meta_shops` showing
**Pay now $496.44** — exactly the subtotal Meta computes (1 × Anarkali green
chinon S at $108.99 + 5 × dusty peach palazzo suit S at $77.49).

But it does that work **in the browser**. A client that does not run JavaScript
gets the SPA shell from `vercel.json`'s catch-all rewrite → `/index.html`, sees
no products, and Commerce Manager reports *"The subtotal was incorrect"*. Shops
stay hidden on Facebook and Instagram until that check passes.

The fix answers the same request **on the server** with a 302 to a Shopify URL
holding exactly the items Meta named — preferably a checkout URL that carries its
own cart token, with the cart permalink as the fallback. See *"Where the redirect
goes"* below for why there are two.

## What goes where now

| Request to `/meta-checkout` | Served by | Result |
|---|---|---|
| `?products=lmv-<id>:<qty>,…` where **every** ID is an approved pilot variant | `api/meta-checkout.ts` | **302** → `https://checkout.luxemia.shop/cart/c/<token>` when Shopify builds the basket, otherwise `https://checkout.luxemia.shop/cart/<id>:<qty>,…` (+ `?discount=CODE`, + allowed attribution) |
| `?products=<handle>:<qty>` or `?products=lm-<hash>:<qty>` (the rest of the catalog) | `src/pages/MetaCheckout.tsx` | unchanged — resolves against the live catalog, verifies prices, opens Shopify checkout |
| Mixed basket (pilot + handle) | page | unchanged |
| `?context=<uuid>` (session restore) | page | unchanged |
| `?products=…&review=1` (Back from Shopify checkout) | page | unchanged — the review step still exists |
| `?products=` with nothing shaped like a product entry | function | **400**, plain text |
| Any quantity above 99 (including after merging duplicates) | function | **400** — never silently trimmed, because Meta price-checks the basket it sent |
| Shaped `lmv-<id>` that is not in the approved pilot map | function | **302** → the same URL with `review=1`, so the page shows its existing tested message |

Routing is two entries in `vercel.json`, inserted before the SPA catch-all:

1. `/api/meta-checkout` → `/api/meta-checkout` — the same self-rewrite
   `/api/meta-catalog`, `/api/gmc-feed` and `/api/sync-lead` already need, or the
   catch-all swallows the function.
2. `/meta-checkout` → `/api/meta-checkout`, conditional on
   `has: query products` matching a list of `lmv-<digits>:<qty>` entries (the
   pattern accepts both `:`/`,` and their `%3A`/`%2C` RFC 3986 forms) and
   `missing: query context`, `missing: query review`.

The condition is what makes this safe: `api/meta-catalog.ts` publishes
`lmv-<variantId>` **only** for the two approved pilot families, and every other
product with its handle or an `lm-<sha256/24>` ID. Those never reach the
function, so nothing that works today stops working. Note that Vercel documents
`has` as not working under `vercel dev` — it only applies once deployed.

## Where the redirect goes, and why there are two destinations

Meta's subtotal error was fixed by the 302 — and then its **server-side** test
came back with *"The checkout page couldn't be loaded"*. The Preview tool (a real
browser) passed at $496.44, so the basket was right; the crawler could not load
what we redirected it to. Three things in that chain were ours to fix:

1. **The redirect left the registered domain for a dev-store subdomain.** The
   target was `lovable-project-zlh0w.myshopify.com`, which Shopify immediately
   301s to the store's real primary domain, `checkout.luxemia.shop` — proved by
   requesting `/robots.txt` on one and being served it from the other. So the
   crawler was sent to an unrelated-looking host purely to be redirected again.
   Both hosts are in `VERIFIED_CHECKOUT_HOSTS` (`src/lib/shopify.ts:20`); the
   function now sends shoppers and crawlers straight to the branded one.

2. **A cart permalink needs a cookie jar to become a basket.** Shopify sets the
   cart with `Set-Cookie` on the way through `/cart/<variant>:<qty>`. A
   server-side crawler keeps no cookies, so the basket can fail to survive the
   hop. The function now builds it server-side with the Storefront API
   `cartCreate` — the same mutation `createStorefrontCheckout()` runs in the
   browser (`src/lib/shopify.ts:852`) — and redirects to the resulting
   `/cart/c/<token>` URL, where the token *is* the cart and no cookie is needed.
   That path shape is also the one `safeCheckoutPath()` (`src/lib/shopify.ts:35`)
   already blesses; a `/cart/<variant>:<qty>` permalink deliberately is not.

   The call is guarded so it can only ever add a destination, never remove one.
   It returns `null` — never throws — on a missing token, a network failure, the
   4 s timeout, `userErrors`, or **any** basket that is not exactly the one Meta
   named: wrong `totalQuantity`, a dropped, added, swapped or reduced line, a
   second page of lines, a non-USD price, an unverified host, an unexpected path.
   On `null` the handler falls back to the permalink, mirroring
   `assertCheckoutCartMatches()`'s rule that Shopify must never silently hand off
   a different basket.

3. **`X-Robots-Tag: nofollow` was on the 302.** A redirect carries no links, and
   `nofollow` on a 3xx can be read by a crawler as *"do not follow this
   redirect"*. Redirects from this function now send `noindex` alone. This had to
   be fixed in `middleware.ts` too: `/meta-checkout` is in `PRIVATE_SPA_ROUTES`,
   and `withResponseHeader()` uses `headers.set()`, so middleware had the last
   word and was re-stamping `noindex, nofollow` over the function's header. It
   now sends `noindex` alone for any 3xx on a private route, and keeps both
   directives for everything else.

**Not ours to fix:** Shopify's own `robots.txt` on `checkout.luxemia.shop`
disallows `/cart/`, `/checkout` and `/checkouts/`. Every Shopify checkout URL is
robots-disallowed, so Meta's crawler cannot be honouring it — no Shopify merchant
would ever pass. Our own `luxemia.shop/robots.txt` is not implicated: it
disallows `/cart` and `/checkout`, neither of which prefix-matches
`/meta-checkout`, so the first hop stays crawlable.

## Verify after deploy

```bash
curl -sSI "https://luxemia.shop/meta-checkout?products=lmv-48120657903787:1,lmv-48210922504363:5&cart_origin=meta_shops"
```

Expected: a `302`, `cache-control: no-store`, `x-robots-tag: noindex` (**no
`nofollow`** on a redirect), and one of two locations — both correct:

```
location: https://checkout.luxemia.shop/cart/c/<token>?key=…&cart_origin=meta_shops     ← preferred
location: https://checkout.luxemia.shop/cart/48120657903787:1,48210922504363:5?cart_origin=meta_shops   ← fallback
```

Which one you get depends on whether the Storefront API answered within 4 s.

**Confirmed live on production 2026-11-26** with the exact URL Meta Preview sends,
bare `&coupon` included (`curl -g -sS -D - -o NUL`):

```
HTTP/1.1 302 Found
Cache-Control: no-store
Content-Length: 0
X-Robots-Tag: noindex
X-Vercel-Cache: MISS
Location: https://checkout.luxemia.shop/cart/c/<token>?key=<cart key>&_s=<session>&_y=<visitor>&cart_origin=meta_shops
```

`key`, `_s` and `_y` are Storefront API cart identifiers, so seeing them is the
proof that the preferred path ran: the permalink fallback carries none of them and
instead produces `cart_link_id=` on the checkout it reaches. Treat that `key` as
a secret — it grants access to that cart — and never paste a full one into an
issue, a chat or a screenshot.

The `cart_origin` parameter is deliberate: Meta's checkout-URL spec says a
redirect must pass the received parameters along, and `middleware.ts` already
does this for Google Merchant Center cart links. Only `cart_origin`
(`facebook|instagram|meta_shops`), `utm_source|medium|campaign|content` and
`fbclid` are forwarded — every other parameter is dropped, so the redirect
target cannot be steered.

Following it should show a Shopify cart with **1 × $108.99** and **5 × $77.49**,
subtotal **$496.44**, tax $0 until an address is entered (Shopify calculates tax
and shipping at checkout). Then re-run the validator in Commerce Manager with the
same test cart, and re-check with a coupon:

```bash
curl -g -sSI "https://luxemia.shop/meta-checkout?products=lmv-48120657903787:1&coupon=FIRST10" | findstr /i "HTTP location"
```

The coupon now travels as `discountCodes: ["FIRST10"]` inside the `cartCreate`
mutation, so a token URL carries it with no `?discount=` in the query. Only the
permalink fallback still shows `?discount=FIRST10`.

To see every hop a crawler takes, and whether the basket survives without a
cookie jar, compare these two — the only difference is `-c`/`-b`:

```bash
curl -g -sS -L --max-redirs 10 -D - -o NUL -A "facebookexternalhit/1.1" "<the Meta test URL>"
curl -g -sS -L --max-redirs 10 -c cj.txt -b cj.txt -D - -o NUL -A "facebookexternalhit/1.1" "<the Meta test URL>"
```

`FIRST10` must exist as an ACTIVE Shopify discount for that to apply — see
`docs/growth/email/FIRST10-WELCOME-FLOW.md` §2. Verified live on production
2026-11-26: `?products=lmv-48120657903787:1&coupon=FIRST10` reaches a Shopify
checkout at **$98.10** against **$108.99** without it, a $10.89 (10%) deduction.

### Meta Preview sends a bare `&coupon`

Meta's Preview checkout tool appends `&coupon` with **no value** when no promotion
was entered:

```
?products=lmv-48120657903787:1,lmv-48210922504363:5&coupon&cart_origin=meta_shops
```

An absent, empty or whitespace-only coupon therefore means *no coupon* and must
still 302 — `src/lib/metaCheckout.ts` has always done this (`params.get('coupon')
|| null`, with the reason in a comment and coverage in
`tests/metaCheckout.test.mjs`), and this function must never be stricter than the
page it stands in for. A padded code is trimmed before forwarding, because
Shopify matches a discount code exactly. Only a control character or a value over
256 characters is still refused: neither may ride along into the Shopify query
string.

## Known limits

- **Availability is now checked, but only on the preferred path.** `cartCreate`
  returns `userErrors` for a sold-out variant, which the function treats as a
  fallback to the permalink — where Shopify's own cart page reports it. So an
  unavailable pilot size still reaches the shopper, just not through a token URL.
- **The preferred path depends on `SHOPIFY_STOREFRONT_TOKEN`** (falling back to
  `VITE_SHOPIFY_STOREFRONT_TOKEN` then `SHOPIFY_STOREFRONT_ACCESS_TOKEN`) — the
  same precedence `api/meta-catalog.ts:49` uses, and already configured for
  production because the Meta catalog feed needs it. If it is ever unset, every
  request silently uses the permalink and nothing breaks.
- **A HEAD request creates a cart too**, so that HEAD and GET return the same
  `Location` as HTTP requires. Shopify carts are ephemeral and no order is
  created, but a validator that polls HEAD will add carts.
- **The permalink fallback replaces the visitor's bag** (Shopify behaviour, and
  what `middleware.ts` already relies on for Merchant Center links). The
  client-side page still promises the opposite — "separate from your existing
  shopping bag" — because it creates a fresh checkout instead. The preferred
  token path now behaves the way that copy says it does.
- **`middleware.ts:393` still sends Merchant Center cart links to the permanent
  myshopify domain.** Left alone on purpose: it is a separate, working flow with
  its own tests, and only the Meta path was failing.
- **Only the two pilot families are translated server-side.** Adding a family to
  `src/lib/metaPilot.ts` extends both the catalog feed and this translator, since
  the allowlist is imported, not copied.

## Rollback

Three independent levers, smallest first:

1. **Unset `SHOPIFY_STOREFRONT_TOKEN` for the function** — every request uses the
   cart permalink again. No deploy needed beyond the env change.
2. **Delete the two `vercel.json` rewrite entries** — the function becomes
   unreachable and every request goes back to the storefront page exactly as
   before. No other file needs to change.
3. The `middleware.ts` header rule is independent of both and safe to keep: it
   only narrows `noindex, nofollow` to `noindex` on 3xx responses from private
   SPA routes.

## Summary page machine-readable identity (2026-11-26)

Diagnostic evidence from the 20:49–20:56 UTC run (Vercel runtime log, deployment
`dpl_2pe6in4xqVduKvapnMzR9SMWEUXj`): Meta's validator (`meta-externalads/1.1`)
fetched `/meta-checkout?products=lmv-48120657903787:1,lmv-48210922504363:5` at
20:50:47Z and received `200 shopify-summary` with the exact basket, Shopify's own
lines ($108.99 × 1, $77.49 × 5) and `shopifySubtotal = shopifyTotal = $496.44`.
Commerce Manager's "subtotal was incorrect" complaint cleared; the remaining
complaint was "A product name was incorrect".

Why: that page printed the line-item titles as plain table text only — no
`sku`, no product `link`, no structured data. A plain-HTTP validator can parse a
loose `Subtotal:` token unambiguously, but it had no machine-readable way to bind
any line item to a catalog item (every other field the pilot publishes — `title`,
`size`, `color`, `price` — matches Shopify exactly, so none of those can be the
mismatch). The visible rendering was never the problem; the bindings were missing.

Fix (`api/meta-checkout.ts`, `buildCheckoutSummaryHtml`): each line now renders as
`schema.org/Product` microdata — the title anchors to the exact `link` the feed
publishes (`https://luxemia.shop/product/<handle>?variant=<numericVariantId>`),
carries `itemprop="sku"` = `lmv-<variantId>` (the feed's content ID), and the unit
price cell is `schema.org/Offer` with `price`/`priceCurrency`/`availability`. An
`ItemList` JSON-LD block mirrors the same sku/url/offers for parsers that ignore
microdata. Handle resolution reuses `getMetaPilotVariant()` so the allowlist is not
duplicated; a line with no pilot entry still renders (without identity markup) and
the page never throws. Visible rendering is unchanged except the title is now a link.

Tests: `tests/metaCheckoutTranslator.test.mjs` gained
`the summary page carries machine-readable identity matching the catalog feed`,
which pins the anchors, sku meta, Offer microdata and the ItemList JSON-LD.
`npm test`: 0 failures.

Not resolved yet: Commerce Manager has not reported PASS. Next steps — merge this
change, redeploy production (the diagnostics window through 2026-11-27T18:00Z
covers it), re-run the checkout validation, and only then remove
`META_CHECKOUT_DIAGNOSTICS` / `META_CHECKOUT_DIAGNOSTICS_UNTIL` and redeploy.

## Amendment — auto-redirect vs. visible DOM text (2026-11-27)

Correction to the "The visible rendering was never the problem" line in the
2026-11-26 section: with hindsight and new evidence, that assertion was
premature.

What the evidence shows now (2026-11-26/27):

- The 22:00Z browser smoke test loaded `/meta-checkout` and was forwarded to
  Shopify checkout (`checkout.luxemia.shop`) within ~1s: the page carries
  `<script>window.location.replace("<cart.url>")</script>` — an unconditional
  client-side redirect. Two independent headless probes (22:00Z and later)
  landed on `checkout.luxemia.shop` and saw a headless error shell: **no line
  items in the DOM**, a red "There was a problem with our checkout" banner,
  Request IDs `a60c3a08afb42e05` and `a60cfa57cb3ccb80`.
- A real browser (desktop) renders the checkout perfectly: both line items with
  titles and size S, subtotal/total $496.44, working Pay now button, no error
  banner. Shopify Payments is healthy; nothing else broke.
- On a **mobile** viewport (Meta's validator simulates one), Shopify's checkout
  collapses the order summary behind a "Show order summary" accordion —
  `element.innerText` excludes collapsed content, so no product-name string is
  visible even though the total ($496.44) is visible in the collapsed bar. That
  matches the observed split verdict exactly: subtotal ✓, product name ✗.
- Microdata/JSON-LD (sku binding from the previous fix) is invisible to a
  validator that matches visible DOM text; it is still correct to keep, but is
  not what binds the verdict.

Fix (`api/meta-checkout.ts`, `buildCheckoutSummaryHtml`): remove the
`window.location.replace(cart.url)` line. `/meta-checkout` now stays on the
server-rendered summary page — exact catalog titles as plain visible text,
fully visible at any viewport (it is static HTML, no accordion), subtotal
plainly visible, plus the "Proceed to Checkout" CTA button for real users (one
extra tap). Regression test: `tests/metaCheckoutTranslator.test.mjs` gained
`the summary page stays on the readable page instead of auto-forwarding the
visitor`, which asserts the absence of `window.location.replace`, the presence
of `Proceed to Checkout`, and both exact title strings as visible anchor text.

Status: **HYPOTHESIS, awaiting Meta verdict.** This mechanism is the strongest
explanation consistent with every observation to date. The flag must only be
treated as cleared when Commerce Manager reports PASS on a fresh validation —
the repo cannot verify that itself.
