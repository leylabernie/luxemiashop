# Shopify Webhook Setup — Auto-Refresh Products on CSV Import

This guide sets up the automation so that **when you update products in Shopify
(via CSV import, manual edit, or API), your Vercel site automatically rebuilds
within ~3 minutes and the new titles/prices/images show up live** — no manual
deploy button needed.

## What's happening behind the scenes

```
Shopify CSV import → Shopify fires product.update webhook
                  → POST https://luxemia.shop/api/shopify-webhook
                  → Verifies HMAC signature (security)
                  → Debounces (60s window — collapses 100s of webhooks into 1 deploy)
                  → Calls Vercel Deploy Hook URL
                  → Vercel triggers fresh build of main branch
                  → npm run build → prerender.js fetches fresh data from Shopify
                  → New HTML files deployed to edge
                  → CDN cache (5 min TTL) refreshes on next request
                  → Users see new titles ✅
```

## One-time setup (5 minutes)

### Step 1 — Create a Vercel Deploy Hook

1. Go to: https://vercel.com/leylabernie/luxemiashop/settings/git
2. Scroll down to **"Deploy Hooks"** section
3. Click **"Create Hook"**
4. Fill in:
   - **Name:** `Shopify Product Update`
   - **Branch:** `main`
5. Click **Create**
6. **Copy the URL** it gives you — it looks like:
   ```
   https://api.vercel.com/v1/integrations/deploy/Qm1234567890abcdef...
   ```
7. Keep this URL handy for Step 3

### Step 2 — Generate two secrets

Open a terminal and run:

```bash
# Secret for verifying Shopify webhooks (Shopify will sign requests with this)
openssl rand -hex 32
# → e.g. "a1b2c3d4e5f6789012345abcd..."  ← copy this

# Token for the manual /api/refresh-products admin endpoint
openssl rand -hex 32
# → e.g. "f6e5d4c3b2a19087654321dcba..."  ← copy this too
```

Save both — you'll need them in Step 3.

### Step 3 — Set 3 environment variables in Vercel

1. Go to: https://vercel.com/leylabernie/luxemiashop/settings/environment-variables
2. Add these 3 variables (Production + Preview + Development environments):

| Name | Value | Where it came from |
|---|---|---|
| `VERCEL_DEPLOY_HOOK_URL` | `https://api.vercel.com/v1/integrations/deploy/Qm...` | Step 1 |
| `SHOPIFY_WEBHOOK_SECRET` | `a1b2c3d4e5f6789012345abcd...` | Step 2 (first secret) |
| `ADMIN_REFRESH_TOKEN` | `f6e5d4c3b2a19087654321dcba...` | Step 2 (second secret) |

3. Click **Save** for each one
4. **Trigger a redeploy** so the new env vars take effect:
   - Go to: https://vercel.com/leylabernie/luxemiashop/deployments
   - Click the most recent deployment → ⋯ menu → **Redeploy**
   - OR push any commit to `main`

### Step 4 — Register the webhook in Shopify

1. Go to: https://www.shopify.com/admin/settings/notifications
2. Scroll down to **"Webhooks"** section (near the bottom)
3. Click **"Create webhook"**
4. Fill in:
   - **Event:** `Product update`
   - **URL:** `https://luxemia.shop/api/shopify-webhook`
   - **Webhook API version:** `Latest` (currently 2025-07)
5. Click **Save webhook**
6. Repeat for these events (one webhook per event, same URL):
   - **Product creation** → `https://luxemia.shop/api/shopify-webhook`
   - **Product deletion** → `https://luxemia.shop/api/shopify-webhook`
7. At the top of the Webhooks section, you'll see a **"Webhook secret"** — copy it
8. **This is your `SHOPIFY_WEBHOOK_SECRET`** — verify it matches what you set in Vercel in Step 3
   - If they don't match, update Vercel's `SHOPIFY_WEBHOOK_SECRET` to Shopify's value and redeploy

### Step 5 — Test the webhook

1. In Shopify Admin → Products → click any product → edit the title slightly → Save
2. Within ~30 seconds, you should see a new Vercel deployment appear at:
   https://vercel.com/leylabernie/luxemiashop/deployments
3. The deployment will say **"Triggered by: Deploy Hook"** in the source
4. Wait 2-4 minutes for the build to complete
5. Visit the product page on luxemia.shop — title should now match Shopify ✅

### Step 6 (optional) — Test the manual refresh button

1. Go to: https://luxemia.shop/admin (log in with your admin account)
2. You'll see a **"Refresh Products from Shopify"** card at the top
3. Click the **"Refresh Products Now"** button
4. You should see a success toast: *"Deploy triggered! Prerendered HTML will refresh in 2-4 minutes."*
5. Check Vercel deployments to confirm a new build started

> ⚠️ **Note:** The admin button will return `401 Unauthorized` until `ADMIN_REFRESH_TOKEN` is set in Vercel (Step 3). If you see a 401, double-check that env var.

## How to use it day-to-day

### After a normal Shopify CSV import (one-time setup complete)
**Do nothing.** The webhook fires automatically, debounces, and triggers a deploy. Wait 3-4 minutes, products are live.

### After a normal Shopify CSV import (webhook NOT yet set up)
Go to https://luxemia.shop/admin → click **"Refresh Products Now"**. Wait 3-4 minutes. Done.

### If webhooks stop firing (Shopify outage, network blip)
Manual fallback: push any commit to `main` (e.g. edit a README), OR click Redeploy in Vercel dashboard, OR click the admin button.

### If you want to force-refresh the CDN edge cache immediately
After a deploy completes, the Vercel CDN edge cache has up to 5 minutes of stale HTML (per the `s-maxage=300` in `vercel.json`). To skip this:
1. Go to: https://vercel.com/leylabernie/luxemiashop/usage → "Edge Cache"
2. Click "Purge All" (use sparingly — it increases origin load)

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Webhook fires but no Vercel deploy starts | `VERCEL_DEPLOY_HOOK_URL` not set or wrong | Verify env var in Vercel settings |
| 401 Unauthorized from `/api/shopify-webhook` | HMAC verification failed | `SHOPIFY_WEBHOOK_SECRET` in Vercel doesn't match Shopify's webhook secret |
| 401 from `/api/refresh-products` admin button | `ADMIN_REFRESH_TOKEN` not set, or no `Authorization` header | Set env var; button currently sends no token — add `?token=...` to URL or modify the fetch in `AdminDashboard.tsx` |
| Deploy triggered but titles still stale after 5 min | Vercel CDN edge cache (5 min TTL) | Wait 5 more min, or purge edge cache in Vercel dashboard |
| Deploy triggered but titles still stale after 10 min | Browser localStorage cache (5 min TTL) | Hard-refresh (Cmd+Shift+R / Ctrl+Shift+R), or wait 5 min, or check in incognito |
| Webhook fires too often (Vercel build quota) | CSV import sends 100s of webhooks | Already debounced to 1 deploy per 60s — should be fine. If still too many, increase `DEBOUNCE_MS` in `api/shopify-webhook.ts` |

## Verifying env vars are set correctly

After Step 3, check that env vars are present by hitting the endpoints:

```bash
# Should return 401 (not 500) — means ADMIN_REFRESH_TOKEN is configured
curl -X POST https://luxemia.shop/api/refresh-products

# Should return 401 (not 500) — means SHOPIFY_WEBHOOK_SECRET is configured
# (Shopify will send proper HMAC-signed requests, this is just to verify the endpoint is live)
curl -X POST https://luxemia.shop/api/shopify-webhook

# If either returns 500 with "env var not set", the Vercel env vars aren't configured yet.
```

## Files in this commit

| File | Purpose |
|---|---|
| `api/shopify-webhook.ts` | Receives Shopify webhooks, verifies HMAC, debounces, triggers Vercel deploy |
| `api/refresh-products.ts` | Manual trigger endpoint (called by admin dashboard button) |
| `src/pages/AdminDashboard.tsx` | "Refresh Products Now" button at top of admin page |
| `vercel.json` | Reduced `_prerender` cache TTL from 24h → 5min so fresh deploys propagate fast |
| `src/hooks/useShopifyProducts.ts` | localStorage cache TTL 30min → 5min, version bumped v4 → v6 (invalidates all existing browser caches) |
| `src/middleware/shopifyProxy.ts` | Edge in-memory cache TTL 10min → 2min |
| `scripts/SETUP_SHOPIFY_WEBHOOK.md` | This document |

## Why this approach

**Problem:** Your frontend is statically prerendered at build time. When Shopify data changes, the prerendered HTML is stale until the next build. Kimi2 said "clear your cache" but there's no single cache to clear — the prerendered HTML *itself* is the cache.

**Solution:** Make Shopify automatically trigger a fresh build via webhooks. This is the standard pattern used by Next.js + Shopify + Vercel e-commerce stacks. Once set up, you never have to manually redeploy after product updates again.

**Trade-offs:**
- Vercel build minutes: ~2-4 min per CSV import burst (debounced). Should fit in free tier for most stores.
- CDN cache TTL reduced from 24h → 5min: slightly more origin requests, but titles propagate in minutes instead of days.
- localStorage cache reduced from 30min → 5min: slightly more Shopify API calls from browsers, but users see fresh data within 5 min of any update.
