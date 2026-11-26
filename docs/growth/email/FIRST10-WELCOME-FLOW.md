# FIRST10 Welcome Email + Abandoned Lead Recovery (§6.7 / §6.9)

Status: **specification and copy, ready to switch on — nothing sends email yet.**
Written 2026-11-25 against `main` at `372b147`.

This is the second half of the lead pipeline. The first half is code and is
merged: a signup on luxemia.shop reaches Supabase, and `api/sync-lead.ts` turns
it into a Shopify customer tagged `FIRST10_LEAD`. What was missing is anything
that *says something to that person*. This file defines the trigger, the exact
email, and the two claims from the original brief that had to be corrected
before they could be sent.

Copy lives in **`src/lib/welcomeEmailCopy.cjs`**, not in this markdown, and
`tests/welcomeEmailCopy.test.cjs` fails if it drifts from `shippingTiming.cjs`,
`returnPolicyCopy.ts` or `welcomeOffer.ts`. Edit the module; this file documents
it. Re-print the paste-ready email at any time with:

```bash
node -e "console.log(require('./src/lib/welcomeEmailCopy.cjs').buildWelcomeEmail({firstName:'Aisha'}).text)"
```

---

## 1. What already fires today

```
Shopper submits the footer form or the exit-intent popup
  → POST https://jcyolouvxfxovzjyyrxu.supabase.co/functions/v1/submit-email
      { email, type: 'newsletter', source: 'footer' | 'welcome_popup' }
  → INSERT INTO public.newsletter_subscribers (email, source, discount_code='FIRST10')
  → Supabase Database Webhook (INSERT on public.newsletter_subscribers)
  → POST https://luxemia.shop/api/sync-lead  [x-supabase-webhook-secret]
  → Shopify Admin: search customer by email → POST /customers.json or PUT /customers/{id}.json
      accepts_marketing: true, marketing_opt_in_level: single_opt_in, tags += FIRST10_LEAD
```

Facts worth knowing before configuring anything downstream:

- **The tag is the trigger.** `FIRST10_LEAD` is added on create *and* on update
  (Shopify resets `accepts_marketing` to `false` on any write that omits it, so
  the sync re-sends the whole consent trio every time). A repeat signup does not
  re-tag or re-fire: `submit-email` answers a duplicate address with
  `{ success: true, duplicate: true }` (unique index on
  `newsletter_subscribers.email`, Postgres 23505) and no new row is inserted, so
  no webhook fires. **The welcome email therefore goes out once per person** —
  which is what you want, but it also means the Flow does not need a
  "has already been emailed" guard for the newsletter path.
- **Cart captures are not subscribers.** `EmailCaptureModal` (currently
  unmounted — see §5) posts `type: 'cart'` → `public.abandoned_carts`, and
  `api/sync-lead.ts` deliberately syncs those with `accepts_marketing: false`,
  because `/privacy` publishes that marketing emails go out "only with your
  consent". The Flow condition in §3 keeps them out of the welcome email.
- **Table name.** The endpoint's allowlist defaults to `email_captures` (the
  requested contract; no such table exists in this project). For the chain above
  to work, `SUPABASE_WEBHOOK_TABLES=newsletter_subscribers` must be set in
  Vercel. Setup steps: playbook §6.9.

---

## 2. Gates — do not send before these are true

From `WELCOME_EMAIL_PREREQUISITES`:

1. **`FIRST10` exists as an ACTIVE Shopify discount** (10% off, one use per
   customer, online store channel). `src/config/welcomeOffer.ts` carries the
   warning in-code: changing the code without creating the matching discount
   advertises a dead code at checkout. Playbook §6.4 has been open since the
   2026-11-25 audit and is still unverified — this email is the loudest possible
   way to advertise a code that does not work. Test it in checkout first.
2. **Postal address and unsubscribe placeholders are filled in.** Commercial
   email requires a valid physical postal address; luxemia.shop publishes only
   "Philadelphia, PA · U.S. Support Desk" (`Footer.tsx:202`), so the module ships
   an obvious `[OWNER: …]` placeholder rather than an invented address. The test
   asserts it is still bracketed, i.e. this template cannot be sent as-is.
3. **SPF/DKIM on the sending domain** for `hello@luxemia.shop`, or the first
   email a new subscriber ever gets lands in spam.
4. **The consent condition in §3 is in place**, so a transactional cart capture
   is never emailed as a subscriber.

---

## 3. The Flow definition

Shopify Flow is included on paid plans; confirm at Admin → Settings → Apps and
sales channels → Shopify Flow.

| Step | Setting |
|---|---|
| **Trigger** | *Customer tagged* — tag `FIRST10_LEAD` |
| **Condition** | `customer.acceptsMarketing` **is true** (keeps cart captures out) |
| **Action 1** | *Send internal email* → `hello@luxemia.shop` |
| **Action 2** (optional) | *Add customer tag* → `WELCOME_EMAIL_PENDING`, so the send is trackable and removable once sent |

Internal email payload (Flow inserts the `{{ }}` values; this is the template to
paste into the action's body field):

```
New FIRST10 lead — send the welcome email.

Email:      {{ customer.email }}
First name: {{ customer.firstName }}
Tagged:     FIRST10_LEAD
Consent:    {{ customer.acceptsMarketing }} (marketing_opt_in_level: single_opt_in)
Source:     newsletter_subscribers via /api/sync-lead

Paste-ready copy: src/lib/welcomeEmailCopy.cjs → buildWelcomeEmail()
Gates before sending: docs/growth/email/FIRST10-WELCOME-FLOW.md §2
```

### Why the Flow does not send the customer email

**Shopify Flow has no customer-facing email action.** It sends *internal*
notifications to staff and passes signals to other apps; customer email has to
come from Shopify Email/Messaging or a provider
([atlas marketing, 2026](https://www.atlasmktg.us/blog/shopify-flow-automation-workflows),
[sutton commerce, 2026](https://www.suttoncommerce.co.uk/blog/shopify-flow-automation-guide)).
So pick one sending path:

| Path | Cost | Automated? | Notes |
|---|---|---|---|
| **A. Flow internal email → send by hand** | $0 | No | Works the day the Flow is enabled. Fine at 1–10 leads/day; it is a daily task, not a system. |
| **B. Shopify Email / Messaging automations** | 10,000 emails/month free, then billed per 1,000 ([source](https://adflipr.com/blog/shopify-email-marketing-guide/), Oct 2026 — re-verify in Admin) | Yes | Admin → Marketing → Automations. If a welcome automation is available on this store, paste the §4 copy and skip the Flow entirely; the tag then exists purely for segmentation. Availability varies by plan/admin version — check rather than assume. |
| **C. Provider flow (Klaviyo, Omnisend, Brevo…)** | Free tiers exist | Yes | The provider listens for the `FIRST10_LEAD` tag / `accepts_marketing` property and runs the sequence. **No provider is configured in this repo** — there is no key, no SDK and no sending code to verify, so treat this as new vendor work with its own consent and suppression obligations. |

Recommended: **B if the store has it, otherwise A today and B when it is
enabled.** Do not describe any of these as "automated recovery" in a doc or to a
partner until the send is actually observed end to end.

---

## 4. The email (paste-ready, rendered from the module)

Subject (60 chars) and preheader are exports; the body below is
`buildWelcomeEmail({ firstName: 'Aisha' }).text`.

**Subject:** `Your FIRST10 code is ready — plus what to expect on delivery`

**Preheader:** `10% off an eligible first order, tracked delivery from India, and up to $20 Local Alteration Credit if a local tailor adjusts the fit.`

```
Hi Aisha,

Thank you for joining LuxeMia. Here is everything you need for your first order.

YOUR FIRST10 CODE
Use code FIRST10 at checkout for 10% off an eligible first order. One use per customer. Final eligibility is confirmed at checkout.

WHEN IT ARRIVES
Orders ship from India after our 3-Point Quality Assurance Check. Ready-to-Ship pieces dispatch in 1–2 business days and arrive in 5–7 business days to the US, UK and Canada via tracked DHL/FedEx (4–5 business days in transit). Custom Tailored outfits take 15–18 business days total once your measurements are confirmed. Every listing states which one you are ordering, and you get tracking after dispatch. Delivery dates are estimates and are not guaranteed.

IF THE FIT NEEDS A TOUCH-UP
Custom-stitched blouses, cholis and suit tops include a 2-inch internal seam allowance on both side seams where garment construction permits, plus up to $20 USD in Local Alteration Credit when you email your local tailor's receipt to hello@luxemia.shop within 14 days of delivery. All sales are final except where applicable law provides otherwise; if something arrives damaged, defective, misdescribed or incomplete, contact us within 48 hours of delivery with photos for a full refund or replacement.

TALK TO A PERSON
Reply to this email, write to hello@luxemia.shop, or message +1-215-341-9990 on WhatsApp. The support desk is in Philadelphia. Shipping, returns and alteration terms are published at https://luxemia.shop/shipping, https://luxemia.shop/returns and https://luxemia.shop/alterations.

You're receiving this because you subscribed at luxemia.shop.
Unsubscribe any time: [OWNER: unsubscribe link from your sending tool — must work in one click]
LuxeMia · [OWNER: registered business postal address — required in every commercial email]
```

Pass `offerEnabled: false` and the discount block disappears entirely rather
than being sent empty — the same rule the storefront follows
(`WELCOME_OFFER.enabled ? WELCOME_OFFER.code : null`).

---

## 5. Two claims from the brief that were corrected, not written

The brief asked for these two lines verbatim. Both contradict what luxemia.shop
publishes, and an email is a written claim to a named person — the same standard
the Pinterest copy was held to in
`docs/growth/ZERO-BUDGET-PLAYBOOK-VERIFIED-2026-11-25.md` §1.

| Brief asked for | Published truth | Source |
|---|---|---|
| "Delivery **Guarantee**: 5–7 Day **Expedited International** Shipping via DHL" | 5–7 business days is the **Ready-to-Ship** window to **US/UK/CA** only: 1–2 business days dispatch after the 3-Point QA Check + 4–5 business days DHL/FedEx transit. **Custom Tailored is 15–18 business days total.** Shipping is tracked, not expedited, and the module states verbatim: *"Delivery dates are estimates and are not guaranteed."* | `src/config/shippingTiming.cjs` (`SHIPPING_TIMING_NOTICE`), `/shipping` |
| "$20 Saree/Lehenga Custom Alteration Credit **Guarantee**" | **Up to $20 USD** in **Local Alteration Credit** on custom-stitched **blouses, cholis and suit tops**, claimed by emailing a local tailor's receipt to hello@luxemia.shop **within 14 days of delivery**, backed by a **2-inch internal seam allowance where garment construction permits**. It is a credit against a local tailor's work — not a guarantee, and not an alteration service for sarees or lehengas. | `src/lib/returnPolicyCopy.ts` (`ALTERATION_CREDIT_SUMMARY`), `/alterations`, `/returns` |

Quoting one delivery number for both fulfillment modes would promise the fast
window on made-to-measure orders, which is the exact error corrected across the
scheduler. `tests/welcomeEmailCopy.test.cjs` forbids `expedited`, `insur*`,
`handcraft*` and every use of `guarantee` except the single "not guaranteed"
sentence, so these cannot creep back in.

---

## 6. Abandoned lead recovery (§6.7) — what exists and what it would take

| Piece | Status |
|---|---|
| `EmailCaptureModal` collects email + cart snapshot | **Built but not mounted.** Nothing in `src/` renders it; only docs reference it. Its `localStorage` rate limiter and silent-failure path are now fixed (`src/lib/leadCaptureStorage.ts`), so it is safe to mount — but mounting a pre-checkout email gate is a conversion decision for the owner. |
| `public.abandoned_carts` rows | Written by `submit-email` (`type: 'cart'`), append-only, `status: 'pending'`, `reminder_sent_at` and `recovered_at` columns exist but **nothing ever sets them** |
| Anything that emails or WhatsApps those rows | **Does not exist.** No provider, no key, no sending code in the repo |
| Shopify's built-in abandoned-checkout email | Available in Admin → Settings → Notifications, and it fires on **Shopify checkout** abandonment. It never sees `abandoned_carts`, because that table is written *before* checkout by a Supabase function |

Cheapest honest paths, in order:

1. **Enable Shopify's own abandoned-checkout email** (Settings → Notifications).
   $0, no code, and it covers the abandonment that actually has payment intent —
   the shopper who reached Shopify checkout. This is the highest-value switch
   available today and it needs none of the above plumbing.
2. **Stop promising a reminder the system does not send.** The modal's old
   success toast said "We'll remind you about your cart"; it now says
   "Email saved. Continue to checkout whenever you're ready." If the modal is
   mounted before path 3 exists, that wording must stay.
3. **Only if pre-checkout recovery is genuinely wanted:** a second Supabase
   Database Webhook on `public.abandoned_carts` INSERT → a second endpoint (same
   shape as `api/sync-lead.ts`, transactional consent, `reminder_sent_at`
   stamped) → a provider that can send. That is new vendor work plus a
   suppression/unsubscribe story for a *transactional* message, and it should not
   be described as "automated recovery" in any doc until it is observed working.

---

## 7. Tests guarding this

| Test | Guards |
|---|---|
| `tests/welcomeEmailCopy.test.cjs` | Delivery windows equal `shippingTiming.cjs`; the "not guaranteed" sentence appears exactly once and no other `guarantee`/`expedited`/`insur*`/`handcraft*` claim survives; alteration credit keeps "up to $20 USD", "14 days of delivery", "2-inch", "where garment construction permits"; discount copy carries the three required FIRST10 qualifiers and matches `welcomeOffer.ts`; a disabled offer emits no code; postal address and unsubscribe stay obvious placeholders |
| `tests/leadCaptureStorage.test.cjs` | Suppression expires after 30 days, a signup never re-prompts, the legacy permanent key migrates to a bounded one, blocked/corrupt storage fails open and never blocks a submit |
| `tests/welcomePopupSuppression.test.cjs` | The popup still triggers on exit-intent / scroll / backstop, respects a bounded dismissal, and survives a throwing `localStorage` |
| `tests/emailCaptureModal.test.cjs` | Cart capture payload shape, duplicate submit is a success, a failed save says so instead of proceeding silently |
| `tests/newsletterPopupResponse.test.cjs`, `tests/footerNewsletterRouting.test.cjs` | Existing suites — a signup is only confirmed on an explicit `{ success: true }`, and never on an empty/malformed/4xx/5xx response |
