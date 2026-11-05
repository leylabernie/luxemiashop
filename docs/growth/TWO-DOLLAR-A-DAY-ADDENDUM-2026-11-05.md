# $2/Day Budget — Addendum to Zero-Click Recovery

**Date:** 2026-11-05
**Supersedes:** the $40–60/day paid test proposed in `ZERO-CLICK-RECOVERY-2026-11-05.md` §3 Tier 1B and the §5 budget decision.
**Companion:** `docs/audits/SEO-AEO-GEO-REVIEW-2026-11-05.md`

---

## 1. The maths, so you can check me

$2/day = **$14/week, ~$60/month, $730/year.** That number is not nothing over a year. It is nothing *per day*, and ad platforms charge per day.

| Assumption (US, women's ethnic fashion) | Conservative value |
|---|---|
| Meta CPM (cost per 1,000 impressions) | $15–30 |
| Impressions $2 buys per day | ~65–130 |
| Click-through rate, cold audience, unknown brand, no reviews | 0.5–1.0% |
| **Clicks $2 buys per day** | **~0–2** |
| Clicks per week for $14 | ~5–14 |
| Your current funnel (GA4, 6–12 Oct 2026) | 135 sessions → 3 checkouts → **0 purchases** |
| Clicks realistically needed for 1 cold-traffic order at a 0.5–1% conversion rate | 100–200 |

**Conclusion: at $2/day cold, you are 2–6 months of spend away from the *statistical possibility* of one order — and your funnel currently converts at 0%, so the true answer is "never, until the funnel is fixed."**

Meta's delivery system makes this worse, not better. A conversion campaign needs roughly 50 conversion events per week per ad set to exit the learning phase. At $2/day you will never exit it. The algorithm will spend your $2 on the cheapest, lowest-intent impressions it can find, learn nothing, and report "reach" that looks like progress and is not.

Do not let the dashboard's green numbers talk you into thinking it is working.

## 2. What NOT to do with $2/day

- ❌ **Do not run an always-on cold traffic or sales campaign at $2/day.** This is the default Meta will steer you into ("Boost post"). It is lighting $60/month on fire slowly enough that you won't notice.
- ❌ **Do not split it** ($1 Meta + $1 TikTok, etc.). Fragmenting a tiny budget guarantees no platform learns anything.
- ❌ **Do not run Google Search ads.** US CPCs for "saree online USA", "lehenga online" etc. run $0.80–$2.50+ against Utsav, Cbazaar, Kalki and Pernia's Pop-Up Shop with 100× your catalogue and thousands of reviews. One click can eat the whole day's budget.
- ❌ **Do not boost the Diwali hero.** Diwali 2026 is 8 Nov. The campaign is over and delivery is 12–18 business days.

## 3. The one way $2/day works: retargeting ONLY

$2/day is a perfectly adequate budget for exactly one job — **retargeting a small, warm audience**, because the audience is tiny and the intent is already there.

| | Cold prospecting | Retargeting |
|---|---|---|
| Audience size | Millions | Your visitors: hundreds |
| Budget needed to reach them repeatedly | $40+/day | **$1–3/day is enough** |
| Intent | None | Already viewed a product |
| Cost per click | High, wasted | Low, concentrated |

But you cannot retarget people you never captured. Today you have:

- No Meta Pixel, no TikTok pixel, no Pinterest tag anywhere in the codebase (verified by grep — zero matches).
- A `vercel.json` CSP that would block the pixel even if you pasted it in.
- ~135 sessions/week of organic traffic to build a pool from.

**So the sequence is the strategy:**

### Phase 0 — Now, $0/day (2–6 weeks)

1. Install the Meta Pixel (+ widen the CSP) — free, code-only. I can do this on this branch.
2. Build the pool with free traffic only: WhatsApp contacts, Google/Bing free listings, Pinterest free catalogue, GBP.
3. Fix the reasons the funnel converts at 0% (returns copy, checkout test, `FIRST10` verification) — see main review §2. Retargeting people back into a funnel that loses every checkout just pays twice for the same failure.
4. **Bank the $2/day. Do not spend it yet.**

### Phase 1 — When your pixel has 500–1,000 product viewers ($2/day switches ON)

- ONE campaign, ONE ad set: **Website visitors / product viewers, last 180 days, US + CA, women.**
- Objective: Sales (or WhatsApp conversations if checkout is still unproven).
- Creative: the same 3 phone videos of Mini + the 12 vouched in-stock SKUs. Nothing polished. Her voice *is* the differentiator against Utsav's studio shots.
- Expected yield at $2/day on a warm pool: a handful of high-intent clicks per day, 5–7 exposures per person per week. This is where a first paid order becomes *plausible* rather than theoretical.

**Trigger to switch on:** 500 product viewers in the pixel, OR your first organic/WhatsApp order (proof the funnel can close). Whichever comes first.

### Phase 2 — The alternative use of the banked money

If after 30 days the pixel pool is still under ~300 people (i.e. free traffic isn't coming), do **not** default to cold ads. Take the banked ~$60 and run **one concentrated burst** instead:

- **$20/day × 3 days**, Click-to-WhatsApp, hyper-local: Philadelphia, 15–25 mile radius, women 28–55, Indian diaspora interest signals.
- Rationale: $20/day for 3 days buys real frequency in a small geography where "Philadelphia, call me in Hindi/Gujarati, I'm local" is a genuine advantage no national competitor can copy. $2/day spread over 30 days buys the same impressions at a frequency too low for anyone to remember you.
- Even this is a conversation-buying exercise, not a sales guarantee. Budget it as "paying $60 to start 20–40 WhatsApp conversations," some of which Mini closes by hand. At that framing, it can pay for itself. Framed as "ads will bring sales," it will disappoint you.

## 4. A better use of $60/month than any ad

Consider this before any of the above: **$60/month is a first-orders subsidy fund.**

Your merchant feed median price is $115.99 and 74.5% of offers are under your $150 free-shipping threshold, so most single-item buyers pay $14.99 shipping on top of a 12–18 business day wait, from a store with no reviews, whose returns page refuses change-of-mind returns. That is the exact moment you lose them.

$60 covers free shipping (your $14.99 cost) on the **first 4 orders**. "First 5 customers: free US shipping, personally checked by Mini before dispatch" — announced on WhatsApp and the homepage — converts better than $60 of cold impressions, and each of those orders becomes a review, a photo, and a pixel purchase event. That is how a $0-authority store bootstraps: buy the first proof, not the first impressions.

## 5. Revised 7-day expectation at $2/day

| Channel | Sessions (7 days) | Orders (7 days) |
|---|---|---|
| $2/day cold ads (if you insist) | 5–14 clicks | ~0 (probability <5%) |
| Banked, unspent (recommended) | 0 | 0 — but $14 saved toward Phase 1/2 |
| Own WhatsApp contacts (free) | 20–80 visits | **0–2 — still your best shot** |
| Free listings (Google/Bing/Pinterest) | ~0 in week 1 | 0 (harvest is 30–90 days) |

**Week-one target unchanged: 1 order, from someone who already knows Mini's name.** The $2/day does not change week one at all. It changes month two and three — *if* it is banked and then spent on warm people instead of dripped onto cold ones.

## 6. Decision needed

One decision replaces the previous budget question:

> **Bank it (recommended)** — pixel first, $2/day switches on at 500 product viewers.
> **Burst it** — save 30 days, run $20/day × 3 days hyper-local Click-to-WhatsApp.
> **Subsidise it** — $60/month funds free shipping on the first 4 orders instead of media.

All three beat spending $2/day starting tomorrow. Pick one and the code work (pixel + CSP) can be done on this branch regardless — it costs nothing and every option needs it.
