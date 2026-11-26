# Meta checkout translator — `/meta-checkout` (Commerce Manager validation)

Status: **implemented, tested, awaiting production deploy** (merge to `main`).
Written 2026-11-25. Code: `api/meta-checkout.ts` + two `vercel.json` rewrites.
Tests: `tests/metaCheckoutTranslator.test.mjs` (31 assertions).

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

The fix answers the same request **on the server** with a 302 to a Shopify cart
permalink holding exactly the items Meta named.

## What goes where now

| Request to `/meta-checkout` | Served by | Result |
|---|---|---|
| `?products=lmv-<id>:<qty>,…` where **every** ID is an approved pilot variant | `api/meta-checkout.ts` | **302** → `https://lovable-project-zlh0w.myshopify.com/cart/<id>:<qty>,…` (+ `?discount=CODE`, + allowed attribution) |
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

## Verify after deploy

```bash
curl -sSI "https://luxemia.shop/meta-checkout?products=lmv-48120657903787:1,lmv-48210922504363:5&cart_origin=meta_shops"
```

Expected: `HTTP/2 302`, `cache-control: no-store`, `x-robots-tag: noindex, nofollow`, and

```
location: https://lovable-project-zlh0w.myshopify.com/cart/48120657903787:1,48210922504363:5?cart_origin=meta_shops
```

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
curl -sSI "https://luxemia.shop/meta-checkout?products=lmv-48120657903787:1&coupon=FIRST10" | grep -i '^location'
# location: https://lovable-project-zlh0w.myshopify.com/cart/48120657903787:1?discount=FIRST10
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

- **Availability is not checked.** That needs a Storefront API call; Shopify's
  cart page reports an unavailable variant itself. If Meta's test ever picks a
  sold-out pilot size, this is the first place to look.
- **A cart permalink replaces the visitor's bag** (Shopify behaviour, and what
  `middleware.ts` already relies on for Merchant Center links). The client-side
  page still promises the opposite — "separate from your existing shopping bag" —
  because it creates a fresh checkout instead. Pilot baskets arriving from Meta
  now take the cart path; everything else keeps the old behaviour.
- **Only the two pilot families are translated server-side.** Adding a family to
  `src/lib/metaPilot.ts` extends both the catalog feed and this translator, since
  the allowlist is imported, not copied.

## Rollback

Delete the two `vercel.json` rewrite entries. The function is then unreachable
and every request goes back to the storefront page exactly as before — no other
file needs to change.
