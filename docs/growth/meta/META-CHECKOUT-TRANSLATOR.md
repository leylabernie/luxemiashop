# Meta checkout translator — `/meta-checkout` (Commerce Manager validation)

Status: **User reports Preview checkout loads with the verified $496.44 basket; Commerce Manager now fails with “A product name was incorrect.” Not resolved.**

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
- Shopify checkout renders its own line-item presentation. This repository
  cannot verify the exact live text or how Meta's validator parses the separate
  size option. The summary's test fixture titles are synthetic, not a live
  Shopify title lookup.
- The old Vercel feed header allowed a 5-minute shared cache plus 10 minutes of
  stale-while-revalidate. The endpoint now sends `Cache-Control: no-store` so a
  feed refresh cannot receive a stale Vercel copy. Meta's own imported-item
  cache is separate; no connected Meta tool is available to inspect its saved
  title or last-fetch time.
- `public/feeds/meta-catalog.csv` is a legacy static sample and contains no
  `lmv-` pilot IDs. The configured Meta source should be the dynamic
  `/api/meta-catalog` endpoint, not that static file.

Next: trigger a fresh catalog fetch in Commerce Manager and check the item
records for both exact `lmv-` IDs and their last-updated time. Then rerun the
validator. If Meta's refreshed titles still match the visible checkout names,
its diagnostic needs to identify whether the mismatch is actually the size/variant
label or a cached parsed checkout value. **Do not mark resolved until Meta
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

Validation: 110 focused checkout tests passed before the latest feed-cache change;
rerun the feed tests after this change. **Do not mark resolved until Meta passes.**

Written 2026-11-25, updated 2026-11-26. Code: `api/meta-checkout.ts` + two
`vercel.json` rewrites + one `middleware.ts` header rule.
Tests: `tests/metaCheckoutTranslator.test.mjs` (40 assertions).

| Date | Change | Trigger |
|---|---|---|
| 2026-11-25 | Translator deployed (#314, `main` `75ddf82`) | *"The subtotal was incorrect"* |
| 2026-11-26 | Bare `&coupon` treated as no coupon (#315, `main` `3e81410`) | Meta Preview sent `&coupon` with no value → 400 |
| 2026-11-26 | Branded checkout host + server-side `cartCreate` + no `nofollow` on redirects (#316, `main` `21cea2a`) | *"The checkout page couldn't be loaded"* |

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
