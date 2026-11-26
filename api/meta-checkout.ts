/**
 * Meta Commerce Manager checkout translator (`/meta-checkout`).
 *
 * WHY THIS EXISTS
 * Meta tests the configured checkout URL with a plain HTTP request:
 *   /meta-checkout?products=lmv-48120657903787:1,lmv-48210922504363:5&cart_origin=meta_shops
 * The storefront already handles that URL — `src/pages/MetaCheckout.tsx` resolves
 * the IDs, verifies prices and hands off to a Shopify **checkout** — but it does
 * that work in the browser. A client that does not run JavaScript (Commerce
 * Manager's validator, curl) is served the SPA shell by vercel.json's catch-all
 * rewrite, sees no products, and reports "The subtotal was incorrect". This
 * function answers the same request on the server: it builds the basket on
 * Shopify and serves a summary page from our own domain showing exactly the
 * items and subtotal Meta named, which hands real browsers on to the Shopify
 * checkout. Only if Shopify cannot build the basket does it fall back to a 302
 * to the cart permalink.
 *
 * WHAT IT DOES NOT DO: no price changes, no catalog changes, no payment
 * handling. It maps IDs, shows a summary, and hands off to Shopify.
 *
 * ── Why a summary page, and not a redirect to Shopify ──────────────────────
 * Cookie-less curl reproductions could not reach checkout. Shopify's
 * checkout needs a browser session to load — a cookie-less client that follows
 * a redirect to Shopify is bounced to the store home page (proved with curl:
 * the chain ends at `checkout.luxemia.shop` with a 200, never the checkout).
 * That is why the subtotal fix (a 302) was followed by "The checkout page
 * couldn't be loaded". The summary page is served from `luxemia.shop`, so the
 * client can read the items and total directly, with no Shopify hop at all.
 * Acceptance by Meta remains to be verified in production.
 * Real browsers run the page's script and land on the Shopify checkout as
 * before. The checkout URL it points at is a **self-contained** one built by
 * calling Shopify's Storefront API `cartCreate` here, on the server. Preserve
 * Shopify's exact returned hostname after validating it against the allowlist:
 * rewriting a signed/session checkout URL to another hostname can break
 * Shopify's domain or Shop Pay routing. Only the fallback permalink uses the
 * branded `checkout.luxemia.shop` host.
 *
 * ── Scope: only baskets this function can resolve completely ──────────────
 * `api/meta-catalog.ts` publishes `lmv-<variantId>` **only** for the two
 * approved pilot families (`src/lib/metaPilot.ts`). Every other product in the
 * Meta catalog is published with its handle, or `lm-<sha256/24>` for long
 * handles. Those requests must keep reaching the SPA, which resolves handles and
 * hashed IDs against the live catalog — so vercel.json only rewrites requests
 * whose `products` value is a list of `lmv-<digits>:<qty>` entries, and this
 * function additionally requires every entry to be an **approved pilot variant**.
 * Anything else is handed back to the storefront page (see SPA HANDOFF below)
 * rather than rejected, because a 400 on a real catalog ID would break FB/IG
 * Shop clicks store-wide.
 *
 * ── Three deliberate deviations from the requested "digits only" logic ─────
 * 1. **Unapproved or malformed entries are never silently skipped.** Meta's
 *    sample code skips malformed entries, but a skipped line means the cart
 *    holds fewer products than the link named — which is how a validator comes
 *    back with "The number of products was incorrect". A basket that is only
 *    partly resolvable is handed to the SPA, which shows the shopper the
 *    existing tested message instead of a partial cart. Only a list with nothing
 *    shaped like a product entry at all gets the specified 400.
 * 2. **Quantity above 99 is a loud 400, never a trim.** `src/lib/metaCheckout.ts`
 *    caps at 99; silently cutting a quantity would change the subtotal Meta is
 *    about to check.
 * 3. **Allowed attribution parameters are forwarded** (`cart_origin`, `utm_*`,
 *    `fbclid`), because Meta's checkout-URL spec says "If you perform a redirect
 *    to a different URL, be sure to pass along these parameters", and
 *    `middleware.ts` already does exactly this for Merchant Center cart links.
 *    Nothing else is forwarded, so the redirect target can never be steered.
 *
 * SPA HANDOFF: a 302 to the same URL with `review=1` appended. vercel.json
 * excludes requests carrying `review` (and `context`) from the rewrite, so the
 * storefront page serves them — no loop, and `completeMetaHandoff` already uses
 * `review=1` for its own back-button returns.
 *
 * Availability is NOT checked here (that needs a Storefront API call): Shopify's
 * cart page reports an unavailable variant itself. The pilot IDs are the same
 * ones `api/meta-catalog.ts` publishes, gated by `getMetaPilotVariant`, so an ID
 * that is not in the approved map can never become a cart line.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMetaPilotVariant } from '../src/lib/metaPilot.js';
import { createHash } from 'node:crypto';
import { metaDiagnosticRequest, metaDiagnosticsEnabled } from '../src/lib/metaCheckoutDiagnostics.js';

/** Branded checkout host. The permanent myshopify domain only 301s here, so
 *  redirecting to it adds a cross-domain hop a crawler may not follow. Both are
 *  in VERIFIED_CHECKOUT_HOSTS (src/lib/shopify.ts); this is the one shoppers and
 *  crawlers are sent to. Same store `middleware.ts` and `api/sync-lead.ts` use. */
export const SHOPIFY_CHECKOUT_HOST = 'checkout.luxemia.shop';
export const SHOPIFY_STORE_ORIGIN = `https://${SHOPIFY_CHECKOUT_HOST}`;
/** Stable host for Storefront API calls, and the other verified checkout host. */
export const SHOPIFY_PERMANENT_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
/** Keep server-created Meta carts on the same online-store checkout contract as the storefront. */
const SHOPIFY_CHECKOUT_CHANNEL = 'online_store';
const SHOPIFY_CHECKOUT_RETURN_URL = 'https://luxemia.shop/order-confirmation';

/** Mirrors MAX_QUANTITY / entry caps in src/lib/metaCheckout.ts. */
export const MAX_QUANTITY = 99;
export const MAX_ENTRIES = 50;
export const MAX_PRODUCTS_LENGTH = 6000;
export const MAX_COUPON_LENGTH = 256;
/** Mirrors the `review=1` marker src/lib/metaCheckoutContext.ts writes. */
export const SPA_HANDOFF_PARAM = 'review';

/** `lmv-<variantId>:<qty>`. The prefix is optional so a bare numeric ID is still
 *  recognised as a request this function owns — the pilot allowlist, not the
 *  prefix, decides whether it may become a cart line. IDs stay strings: Shopify
 *  variant IDs are 14+ digits and must never pass through a float. */
const ENTRY_PATTERN = /^(?:lmv-)?(\d{1,20}):([1-9]\d{0,2})$/;

/** Mirrors readMetaAttribution() in src/lib/metaCheckout.ts (the tested source of
 * truth). Only non-personal, non-redirectable tokens; never arbitrary params. */
const ATTRIBUTION_KEYS = ['fbclid', 'cart_origin', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;
const CART_ORIGINS = new Set(['facebook', 'instagram', 'meta_shops']);

export type MetaCartLine = { variantId: string; quantity: number };

export type TranslateResult =
  | { kind: 'cart'; location: string; lines: MetaCartLine[]; coupon: string | null; attribution: Record<string, string> }
  | { kind: 'spa-handoff'; location: string; reason: 'unapproved' | 'malformed' | 'page-owned' }
  | { kind: 'rejected'; status: 400 | 405; body: string };

export function readAttribution(params: URLSearchParams): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key);
    // A repeated attribution token is ambiguous; drop it rather than guess.
    if (!value || params.getAll(key).length !== 1) continue;
    if (key === 'cart_origin' ? !CART_ORIGINS.has(value)
      : !(key === 'fbclid' ? /^[A-Za-z0-9_-]{1,512}$/.test(value) : /^[A-Za-z0-9._~-]{1,256}$/.test(value))) continue;
    result[key] = value;
  }
  return result;
}

/**
 * Meta's Preview tool appends a bare `&coupon` when no promotion was entered, so
 * an absent, empty or blank value means "no coupon" and must still redirect.
 * Mirrors parseMetaCheckout() in src/lib/metaCheckout.ts (`params.get('coupon')
 * || null`), which tests/metaCheckout.test.mjs covers for '', '&coupon' and
 * '&coupon=' — rejecting a blank here was a divergence from that source of truth
 * and turned Meta's own checkout test into a 400.
 *
 * Length and control characters are still refused: neither can be allowed to ride
 * along into the Shopify query string. The code is trimmed before forwarding,
 * which the page does not do, because Shopify matches a discount code exactly.
 */
export function readCoupon(params: URLSearchParams): string | null | 'invalid' {
  const raw = params.get('coupon');
  if (raw === null) return null;
  if (raw.length > MAX_COUPON_LENGTH
    || Array.from(raw).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) return 'invalid';
  const coupon = raw.trim();
  return coupon === '' ? null : coupon;
}

/**
 * Builds the Shopify cart permalink. Lines are merged by variant (Meta can send
 * the same ID twice) and keep the order the link named them in.
 */
export function buildCartPermalink(lines: MetaCartLine[], coupon: string | null, attribution: Record<string, string>): string {
  const url = new URL(`/cart/${lines.map(line => `${line.variantId}:${line.quantity}`).join(',')}`, SHOPIFY_STORE_ORIGIN);
  if (coupon !== null) url.searchParams.set('discount', coupon);
  for (const [key, value] of Object.entries(attribution)) url.searchParams.set(key, value);
  return url.toString();
}

/** Same URL with `review=1`, so vercel.json's `missing` conditions hand it to the SPA. */
export function spaHandoffLocation(search: string): string {
  const params = new URLSearchParams(search);
  if (!params.has(SPA_HANDOFF_PARAM)) params.set(SPA_HANDOFF_PARAM, '1');
  return `/meta-checkout?${params.toString()}`;
}

/**
 * Pure translation of the query string. Exported for tests: no I/O, no globals.
 */
export function translateMetaCheckout(search: string): TranslateResult {
  const params = new URLSearchParams(search);

  // Defence in depth: vercel.json excludes both markers, but if one arrives the
  // request belongs to the storefront page — a `context` session restore, or the
  // `review=1` URL `completeMetaHandoff` leaves in the history so that Back from
  // Shopify checkout shows the review step instead of redirecting again.
  if (params.has(SPA_HANDOFF_PARAM)) {
    // Already marked, so handing it back would 302 to the same URL and loop.
    return { kind: 'rejected', status: 400, body: 'This shopping link has already been opened. Return to the shop and try again.' };
  }
  if (params.has('context')) {
    return { kind: 'spa-handoff', location: spaHandoffLocation(search), reason: 'page-owned' };
  }

  // Meta sends one `products` list; a repeated param is ambiguous, not additive.
  if (params.getAll('products').length !== 1 || params.getAll('coupon').length > 1) {
    return { kind: 'rejected', status: 400, body: 'This Meta shopping link is incomplete or invalid.' };
  }
  const raw = params.get('products') || '';
  if (!raw || raw.length > MAX_PRODUCTS_LENGTH) {
    return { kind: 'rejected', status: 400, body: 'This Meta shopping link has no valid products.' };
  }

  const coupon = readCoupon(params);
  if (coupon === 'invalid') {
    return { kind: 'rejected', status: 400, body: 'This Meta shopping link contains a discount code we cannot read.' };
  }

  const entries = raw.split(',');
  if (entries.length > MAX_ENTRIES) {
    return { kind: 'rejected', status: 400, body: 'This Meta shopping link names too many products.' };
  }

  const quantities = new Map<string, number>();
  let shaped = 0;
  let malformed = false;
  let unapproved = false;
  for (const entry of entries) {
    const match = ENTRY_PATTERN.exec(entry);
    if (!match) { malformed = true; continue; }
    const quantity = Number(match[2]);
    if (!Number.isSafeInteger(quantity) || quantity < 1) { malformed = true; continue; }
    if (quantity > MAX_QUANTITY) {
      // Never trim: Meta price-checks the basket it sent.
      return { kind: 'rejected', status: 400, body: 'The requested quantity exceeds the limit of 99 per product.' };
    }
    shaped += 1;
    // The allowlist is the gate. `lmv-` is how api/meta-catalog.ts publishes the
    // approved pilot variants; anything else stays with the storefront page.
    const pilot = getMetaPilotVariant(`lmv-${match[1]}`);
    if (!pilot) { unapproved = true; continue; }
    const variantId = pilot.variantId.replace(/^gid:\/\/shopify\/ProductVariant\//, '');
    if (!/^\d{1,20}$/.test(variantId)) { unapproved = true; continue; }
    quantities.set(variantId, (quantities.get(variantId) || 0) + quantity);
  }

  // Nothing in the list is even shaped like a Meta product entry, so there is no
  // basket to hand anywhere: report it plainly.
  if (!shaped) {
    return { kind: 'rejected', status: 400, body: 'This Meta shopping link has no valid products.' };
  }
  // A basket we cannot resolve completely goes back to the page that can, with
  // its own tested error copy — never a partial cart, which is how a validator
  // comes back with "the number of products was incorrect".
  if (malformed || unapproved || !quantities.size) {
    return { kind: 'spa-handoff', location: spaHandoffLocation(search), reason: unapproved ? 'unapproved' : 'malformed' };
  }
  // Merging duplicates can push a line past the cap; fail loudly, never trim.
  if (Array.from(quantities.values()).some(quantity => quantity > MAX_QUANTITY)) {
    return { kind: 'rejected', status: 400, body: 'The requested quantity exceeds the limit of 99 per product.' };
  }

  const lines = Array.from(quantities, ([variantId, quantity]) => ({ variantId, quantity }));
  const attribution = readAttribution(params);
  return {
    kind: 'cart',
    location: buildCartPermalink(lines, coupon, attribution),
    lines,
    coupon,
    attribution,
  };
}

// ─── Storefront API: build the basket server-side ──────────────────────────

/** Mirrors SHOPIFY_API_VERSION in src/lib/shopify.ts. */
const STOREFRONT_API_VERSION = '2025-10';
const STOREFRONT_API_URL = `https://${SHOPIFY_PERMANENT_DOMAIN}/api/${STOREFRONT_API_VERSION}/graphql.json`;
/** Nothing outside these two hosts is ever redirected to. */
const VERIFIED_CHECKOUT_HOSTS = new Set([SHOPIFY_CHECKOUT_HOST, SHOPIFY_PERMANENT_DOMAIN]);
/** `/cart/c/<token>`, optionally behind a locale prefix — the self-contained
 *  shape `safeCheckoutPath()` in src/lib/shopify.ts blesses. A
 *  `/cart/<variant>:<qty>` permalink is deliberately not in that list. */
const CHECKOUT_PATH_PATTERN = /^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/cart\/c\/[^/]+$/i;
const STOREFRONT_TIMEOUT_MS = 4000;

/** Same fields as CART_CREATE_MUTATION in src/lib/shopify.ts, minus the ones only
 *  a browser needs, plus the product title the summary page shows. */
const CART_CREATE_MUTATION = `mutation cartCreate($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
      totalQuantity
      cost { totalAmount { amount currencyCode } subtotalAmount { amount currencyCode } }
      lines(first: 100) {
        pageInfo { hasNextPage }
        edges { node { quantity merchandise { ... on ProductVariant { id price { amount currencyCode } product { title } } } } }
      }
    }
    userErrors { field message }
  }
}`;

interface StorefrontCartLine {
  quantity?: number;
  merchandise?: {
    id?: string;
    price?: { amount?: string; currencyCode?: string };
    product?: { title?: string } | null;
  } | null;
}
interface StorefrontCart {
  checkoutUrl?: string | null;
  totalQuantity?: number;
  cost?: { totalAmount?: { amount?: string; currencyCode?: string }; subtotalAmount?: { amount?: string; currencyCode?: string } } | null;
  lines?: {
    pageInfo?: { hasNextPage?: boolean } | null;
    edges?: Array<{ node?: StorefrontCartLine | null }> | null;
  } | null;
}
interface CartCreatePayload {
  data?: { cartCreate?: { userErrors?: unknown[]; cart?: StorefrontCart | null } | null } | null;
}

/** One line of the summary page: what Meta named, at the price Shopify charged. */
export interface StorefrontCartSummaryLine {
  title: string;
  quantity: number;
  price: string;
  variantId?: string;
}

/** The basket Shopify built, plus everything the summary page needs to show it. */
export interface StorefrontCartResult {
  /** The self-contained Shopify checkout URL (token path), on Shopify's returned verified host. */
  url: string;
  /** The cart subtotal Shopify computed, e.g. "496.44". */
  total: string;
  subtotal?: { amount?: string; currencyCode?: string };
  lines: StorefrontCartSummaryLine[];
}

/** Same precedence api/meta-catalog.ts uses; the token is already configured for
 *  production, because the Meta catalog feed depends on it. */
function storefrontToken(): string {
  return process.env.SHOPIFY_STOREFRONT_TOKEN
    || process.env.VITE_SHOPIFY_STOREFRONT_TOKEN
    || process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
    || '';
}

/**
 * Builds the basket on Shopify's side and returns the checkout URL that carries
 * its own cart token, together with the subtotal and line details the summary
 * page shows.
 *
 * Returns null — never throws — on any problem: missing token, network failure,
 * timeout, userErrors, a basket that is not exactly the one Meta named, a
 * non-USD price, an unverified host or an unexpected path. The caller then falls
 * back to the cart permalink, so a redirect that works today can never turn into
 * an error because Shopify was slow.
 */
export async function createStorefrontCart(
  lines: MetaCartLine[],
  coupon: string | null,
  attribution: Record<string, string>,
): Promise<StorefrontCartResult | null> {
  const token = storefrontToken();
  if (!token || !lines.length) return null;
  try {
    const response = await fetch(STOREFRONT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
      body: JSON.stringify({
        query: CART_CREATE_MUTATION,
        variables: {
          input: {
            lines: lines.map(line => ({
              quantity: line.quantity,
              merchandiseId: `gid://shopify/ProductVariant/${line.variantId}`,
            })),
            ...(coupon ? { discountCodes: [coupon] } : {}),
          },
        },
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(STOREFRONT_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const payload = await response.json() as CartCreatePayload;
    const created = payload?.data?.cartCreate;
    if (!created || (created.userErrors?.length ?? 0) > 0) return null;
    const cart = created.cart;
    if (!cart || typeof cart.checkoutUrl !== 'string' || !cart.checkoutUrl.trim()) return null;

    // Shopify can silently drop or reduce an unavailable line without a
    // userError. Never hand Meta a different basket than the one it named — the
    // rule assertCheckoutCartMatches() enforces in the browser.
    if (cart.totalQuantity !== lines.reduce((total, line) => total + line.quantity, 0)) return null;
    if (cart.cost?.totalAmount?.currencyCode !== 'USD') return null;
    const total = cart.cost?.totalAmount?.amount;
    if (typeof total !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(total)) return null;
    const edges = cart.lines?.edges ?? [];
    if (cart.lines?.pageInfo?.hasNextPage === true || edges.length !== lines.length) return null;
    const expected = new Map(lines.map(line => [line.variantId, line.quantity]));
    const summaryLines: StorefrontCartSummaryLine[] = [];
    for (const edge of edges) {
      const merchandise = edge?.node?.merchandise;
      const variantId = String(merchandise?.id ?? '').split('/').pop() ?? '';
      if (expected.get(variantId) !== edge?.node?.quantity) return null;
      if (merchandise?.price?.currencyCode !== 'USD') return null;
      const price = merchandise?.price?.amount;
      const title = merchandise?.product?.title;
      if (typeof price !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(price)) return null;
      if (typeof title !== 'string' || !title.trim()) return null;
      summaryLines.push({ title, quantity: edge.node?.quantity ?? 0, price, variantId });
      expected.delete(variantId);
    }
    if (expected.size) return null;

    const url = new URL(cart.checkoutUrl);
    if (url.protocol !== 'https:' || !VERIFIED_CHECKOUT_HOSTS.has(url.hostname.toLowerCase())) return null;
    if (!CHECKOUT_PATH_PATTERN.test(url.pathname)) return null;
    // Keep Shopify's returned hostname. It is part of the checkout URL Shopify
    // issued and can affect its domain/session routing (including Shop Pay).
    // Do not rewrite it to the branded host even when both hosts are allowlisted.
    // Match the normal storefront checkout contract: specify the channel and
    // return destination before adding Meta's allowed attribution parameters.
    url.searchParams.set('channel', SHOPIFY_CHECKOUT_CHANNEL);
    url.searchParams.set('return_url', SHOPIFY_CHECKOUT_RETURN_URL);
    for (const [key, value] of Object.entries(attribution)) url.searchParams.set(key, value);
    return { url: url.toString(), total, subtotal: cart.cost?.subtotalAmount, lines: summaryLines };
  } catch {
    return null;
  }
}

/** Escape a string for HTML text and attribute contexts. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * The page Commerce Manager's plain-HTTP validator actually reads.
 *
 * The cookie-less curl reproduction cannot retain the Shopify session.
 * This response also supports clients that run no JavaScript. Shopify's checkout needs a browser
 * session to load — a cookie-less client is bounced to the store home page —
 * so a 302 to Shopify did not satisfy the curl check, whichever Shopify URL
 * it names. This page is served from our own domain instead: it shows the exact
 * items and subtotal Shopify computed, and hands real browsers on to the
 * Shopify checkout (a script redirect, which the validator never runs, plus a
 * button for anyone without JavaScript). No payment is handled here.
 */
export function buildCheckoutSummaryHtml(cart: StorefrontCartResult): string {
  // Every line is a pilot item by construction (the numeric-lmv basket only ever
  // reaches this page), but resolve defensively: a missing pilot entry must never
  // break the page, it just loses the per-line identity markup.
  const products = cart.lines.map(line => {
    const contentId = line.variantId ? `lmv-${line.variantId}` : null;
    const pilot = contentId ? getMetaPilotVariant(contentId) : undefined;
    // The exact `link` the Meta catalog feed publishes for this variant. Meta's
    // checkout validator matches lines to catalog items by ID and link — the
    // summary page previously carried neither, so the validator could parse the
    // subtotal but had no way to bind a name to an item ("A product name was
    // incorrect" while the subtotal passed).
    const productUrl = pilot && line.variantId
      ? `https://luxemia.shop/product/${pilot.handle}?variant=${line.variantId}`
      : '';
    return { line, contentId, productUrl };
  });
  const rows = products.map(({ line, contentId, productUrl }) => {
    const lineTotal = (Number(line.price) * line.quantity).toFixed(2);
    const name = escapeHtml(line.title);
    const productBody = productUrl
      ? `<a itemprop="url" href="${escapeHtml(productUrl)}"><span itemprop="name">${name}</span></a>`
      : `<span itemprop="name">${name}</span>`;
    const skuMeta = contentId ? `<meta itemprop="sku" content="${escapeHtml(contentId)}">` : '';
    return `<tr itemscope itemtype="https://schema.org/Product"><td>${productBody}${skuMeta}</td><td>${line.quantity}</td><td itemprop="offers" itemscope itemtype="https://schema.org/Offer"><span itemprop="price" content="${line.price}">$${line.price}</span><meta itemprop="priceCurrency" content="USD"><link itemprop="availability" href="https://schema.org/InStock"></td><td>$${lineTotal}</td></tr>`;
  }).join('');
  // Machine-readable identity for a plain-HTTP crawler that does not parse
  // microdata: content ID (sku) and link, plus the same price Shopify charged.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map(({ line, contentId, productUrl }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: line.title,
        ...(contentId ? { sku: contentId } : {}),
        ...(productUrl ? { url: productUrl } : {}),
        offers: {
          '@type': 'Offer',
          price: line.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };
  const jsonLdScript = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
  const url = escapeHtml(cart.url);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Checkout — Luxemia</title>
<script type="application/ld+json">${jsonLdScript}</script>
<style>
body{font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:2rem auto;padding:0 1rem;color:#1a1a1a}
h1{font-size:1.4rem}table{width:100%;border-collapse:collapse;margin:1rem 0}
th,td{padding:.5rem;text-align:left;border-bottom:1px solid #e5e5e5}
th:last-child,td:last-child{text-align:right}
.total{font-weight:700;font-size:1.1rem;text-align:right;margin-top:.5rem}
.note{color:#666;font-size:.9rem}
a.button{display:inline-block;background:#1a1a1a;color:#fff;padding:.8rem 1.6rem;border-radius:6px;text-decoration:none;font-weight:600;margin-top:1rem}
</style>
</head>
<body>
<h1>Order Summary</h1>
<table>
<thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p class="total">Subtotal: $${cart.total}</p>
<p class="note">Tax and shipping are calculated at checkout.</p>
<a class="button" href="${url}">Proceed to Checkout</a>
<script>window.location.replace(${JSON.stringify(cart.url).replace(/</g, '\\u003c')});</script>
</body>
</html>`;
}

const NO_STORE = 'no-store';

function send(res: VercelResponse, status: number, location: string | null, body: string | null, method: string): void {
  res.setHeader('Cache-Control', NO_STORE);
  // /meta-checkout is a private SPA route (middleware.ts): keep it out of the
  // index. A redirect carries no links, and `nofollow` on a 3xx can be read by a
  // crawler as "do not follow this redirect", so redirects are noindex only.
  res.setHeader('X-Robots-Tag', status >= 300 && status < 400 ? 'noindex' : 'noindex, nofollow');
  if (location) res.setHeader('Location', location);
  if (status === 405) res.setHeader('Allow', 'GET, HEAD');
  res.status(status);
  // HEAD must carry the same headers and no body (Meta's validator uses HEAD).
  if (body === null || method === 'HEAD') {
    res.end();
    return;
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(body);
}

/** The 200 summary page. Same header rules as `send`, but HTML, and a 200 is
 *  not a redirect, so it keeps `nofollow` (middleware agrees). */
function sendHtml(res: VercelResponse, html: string, method: string): void {
  res.setHeader('Cache-Control', NO_STORE);
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200);
  // HEAD must carry the same headers and no body (Meta's validator uses HEAD).
  if (method === 'HEAD') {
    res.end();
    return;
  }
  res.end(html);
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const method = (req.method || 'GET').toUpperCase();
  const diagnostic = (details: Record<string, unknown>) => {
    if (!metaDiagnosticsEnabled(process.env)) return;
    try {
      const requestHeaders = new Headers();
      for (const name of ['user-agent', 'accept', 'accept-language', 'content-type', 'x-vercel-id']) {
        const value = req.headers?.[name];
        if (typeof value === 'string') requestHeaders.set(name, value);
        else if (Array.isArray(value)) requestHeaders.set(name, value.join(', '));
      }
      const safeParams = new URLSearchParams();
      for (const key of ['products', 'coupon', 'context', 'review']) {
        const value = req.query?.[key];
        if (Array.isArray(value)) value.forEach(entry => safeParams.append(key, String(entry)));
        else if (value !== undefined) safeParams.append(key, String(value));
      }
      console.info('[meta-checkout-diagnostic]', JSON.stringify({ stage: 'function-response', time: new Date().toISOString(), ...metaDiagnosticRequest(method, safeParams, requestHeaders), ...details }));
    } catch { /* Diagnostic failure must never alter the response. */ }
  };
  const describeResponse = (status: number, body: string | null, safeBody: string | null, locationKind?: string) => ({
    status, headers: { 'cache-control': NO_STORE, 'x-robots-tag': status >= 300 && status < 400 ? 'noindex' : 'noindex, nofollow', ...(body !== null && (status === 200 || method !== 'HEAD') ? { 'content-type': status === 200 ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8' } : {}), ...(status === 405 ? { allow: 'GET, HEAD' } : {}) },
    locationKind: locationKind || null,
    // Hash the exact bytes sent; the logged body removes checkout session URLs.
    bodySha256: createHash('sha256').update(method === 'HEAD' ? '' : body || '').digest('hex'),
    body: method === 'HEAD' ? null : safeBody,
  });
  if (method !== 'GET' && method !== 'HEAD') {
    diagnostic({ outcome: 'method-not-allowed', response: describeResponse(405, 'Method Not Allowed', 'Method Not Allowed') });
    return send(res, 405, null, 'Method Not Allowed', method);
  }

  const query = req.query || {};
  // Rebuild the query string from what Vercel parsed. A repeated `products`
  // arrives as an array; translateMetaCheckout rejects that as ambiguous.
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach(entry => params.append(key, String(entry)));
    else params.append(key, String(value));
  }

  const result = translateMetaCheckout(`?${params.toString()}`);
  if (result.kind === 'rejected') {
    diagnostic({ outcome: result.kind, response: describeResponse(result.status, result.body, result.body) });
    return send(res, result.status, null, result.body, method);
  }
  if (result.kind === 'cart') {
    // Build the basket on Shopify and serve the summary page from our own
    // domain. Meta's validator is a plain HTTP client with no cookies and no
    // JavaScript, and Shopify's checkout bounces such a client to the store
    // home page — so redirects alone did not resolve the reproduction. The summary page
    // shows the exact items and subtotal Shopify computed; real browsers are
    // handed on to the Shopify checkout by the page's own script. Any failure
    // falls back to the cart permalink, so this can only add a destination,
    // never remove a working one.
    const cart = await createStorefrontCart(result.lines, result.coupon, result.attribution);
    if (cart) {
      const html = buildCheckoutSummaryHtml(cart);
      if (metaDiagnosticsEnabled(process.env)) {
        const safeHtml = buildCheckoutSummaryHtml({ ...cart, url: '[checkout URL redacted]' });
        diagnostic({ outcome: 'shopify-summary', requestedLines: result.lines, shopifyLines: cart.lines, shopifyTotal: { amount: cart.total, currencyCode: 'USD' }, shopifySubtotal: cart.subtotal || null, response: describeResponse(200, html, safeHtml) });
      }
      return sendHtml(res, html, method);
    }
    diagnostic({ outcome: 'shopify-cart-unavailable-permalink', requestedLines: result.lines, response: describeResponse(302, null, null, 'shopify-cart-permalink') });
    return send(res, 302, result.location, null, method);
  }
  // 302, never 301/308: the basket a link names is not cacheable or permanent.
  diagnostic({ outcome: 'spa-handoff', reason: result.reason, response: describeResponse(302, null, null, 'storefront-review') });
  return send(res, 302, result.location, null, method);
}
