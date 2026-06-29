# Refresh Products Setup — Plain English Guide

## What you're setting up

After you import products to Shopify (CSV upload, manual edit, etc.), the titles
and prices on luxemia.shop don't update automatically. This guide fixes that.

You have **two options**:

- **Option A (recommended):** Set up the "Refresh Products Now" button on your
  admin dashboard. After setup, you click ONE button after each CSV import.
  **5-minute setup.**

- **Option B (advanced, optional):** Set up a Shopify webhook so the refresh
  happens automatically when you import. **Skip this** unless you do CSV imports
  very frequently.

---

## Option A — Set up the "Refresh Products Now" button

**Time required: 5 minutes**
**Skills needed: be able to click links and copy-paste**

You only do this ONCE. After setup, the button works forever.

### Step 1 of 3: Create a "Deploy Hook" in Vercel

A "deploy hook" is just a special URL that tells your website to rebuild.

1. Click this link: **https://vercel.com/leylabernie/luxemiashop/settings/git**
   (Log in with your Vercel account if prompted)
2. Scroll down the page until you see a section called **"Deploy Hooks"**
3. Click the **"Create Hook"** button
4. A small form appears. Fill it in:
   - **Name** box: type `Shopify Refresh`
   - **Branch** dropdown: choose `main`
5. Click the **"Create"** button
6. After it creates, you'll see a long URL appear (it starts with
   `https://api.vercel.com/v1/integrations/deploy/Qm...`)
7. **Click the "Copy" button** next to that URL (or select it and press Ctrl+C / Cmd+C)

✅ Done with Step 1. Keep that copied URL ready for Step 2.

### Step 2 of 3: Add the URL to your Vercel environment variables

This tells your website which URL to call when you click the refresh button.

1. Click this link: **https://vercel.com/leylabernie/luxemiashop/settings/environment-variables**
2. Click the **"Create New Variable"** button (top-right of the variables list)
3. A form appears. Fill it in:
   - **Name** box: type exactly this (no spaces, all caps):
     ```
     VERCEL_DEPLOY_HOOK_URL
     ```
   - **Value** box: paste the URL you copied in Step 1 (Ctrl+V / Cmd+V)
   - **Environments** checkboxes: check ALL THREE boxes
     (Production ✓, Preview ✓, Development ✓)
4. Click the **"Save"** button

✅ Done with Step 2.

### Step 3 of 3: Trigger a redeploy so the new variable takes effect

Environment variables only take effect on the next build. Let's trigger one now.

1. Click this link: **https://vercel.com/leylabernie/luxemiashop/deployments**
2. Click the **top row** (your most recent deployment)
3. In the top-right corner, click the **⋯ (three dots)** menu
4. Click **"Redeploy"**
5. A confirmation dialog appears — click **"Redeploy"** again
6. The page will show a building status. **Wait 2-3 minutes** until it turns
   green and says "Ready"

✅ Done with Step 3. Setup is complete!

### Test it

1. Go to: **https://luxemia.shop/admin** (log in with your admin account)
2. At the top, you'll see a card titled **"Refresh Products from Shopify"**
3. Click the **"Refresh Products Now"** button
4. You should see a green success message: *"✅ Refresh triggered!"*
5. Wait 2-4 minutes
6. Visit any product page on luxemia.shop — the title should now match Shopify

### If the button doesn't work

If you see an error like *"First-time setup needed"* or a 500 error:

1. On the admin page, click **"Show first-time setup"** (below the Refresh button)
2. A step-by-step wizard appears with copy-paste buttons
3. Click "Test Setup & Refresh Products" at the bottom of the wizard
4. The wizard tells you exactly which step is missing

---

## Option B (optional, advanced): Shopify webhook automation

**Skip this unless you do CSV imports weekly or more often.** Option A is enough
for most users.

If you want the refresh to happen AUTOMATICALLY every time you import products
to Shopify (no button click needed), follow these additional steps:

### Step 4: Generate a webhook secret

Open a terminal on your computer and run:

```bash
openssl rand -hex 32
```

Copy the output (a long string of letters and numbers).

### Step 5: Add the secret to Vercel

1. Go to: https://vercel.com/leylabernie/luxemiashop/settings/environment-variables
2. Click "Create New Variable"
3. Name: `SHOPIFY_WEBHOOK_SECRET`
4. Value: paste the string from Step 4
5. Check all 3 environment boxes
6. Click Save

### Step 6: Register the webhook in Shopify

1. Go to: https://www.shopify.com/admin/settings/notifications
2. Scroll to the **"Webhooks"** section (near the bottom)
3. Click **"Create webhook"**
4. Fill in:
   - **Event**: `Product update`
   - **URL**: `https://luxemia.shop/api/shopify-webhook`
   - **Webhook API version**: `Latest`
5. Click **Save webhook**
6. Repeat for `Product creation` and `Product deletion` (same URL)
7. At the top of the Webhooks section, you'll see **"Webhook secret"** — copy it
8. Update Vercel's `SHOPIFY_WEBHOOK_SECRET` env var to match Shopify's secret
9. Redeploy Vercel (Step 3 again)

### Step 7: Test the webhook

1. In Shopify Admin, edit any product title and Save
2. Within 30 seconds, check https://vercel.com/leylabernie/luxemiashop/deployments
3. A new deploy should appear automatically (source: "Deploy Hook")
4. Wait 2-4 min, check luxemia.shop — title is updated

---

## Troubleshooting cheat sheet

| Symptom | What's wrong | Fix |
|---|---|---|
| Button shows "First-time setup needed" | `VERCEL_DEPLOY_HOOK_URL` env var not set | Do Step 1 + Step 2 + Step 3 above |
| Button shows "Not logged in" | Supabase session expired | Refresh the admin page, log in again |
| Button works but titles still stale after 5 min | Vercel CDN edge cache (5 min TTL) | Wait 5 more min, or hard-refresh (Ctrl+Shift+R) |
| Button works but titles still stale after 10 min | Browser localStorage cache (5 min TTL) | Hard-refresh, or check in incognito window |
| Webhook fires but no Vercel deploy starts | `VERCEL_DEPLOY_HOOK_URL` not set | Same as row 1 above |
| 401 from `/api/shopify-webhook` | `SHOPIFY_WEBHOOK_SECRET` doesn't match Shopify's secret | Re-copy secret from Shopify Admin, update Vercel env var, redeploy |
| Everything works but titles still look wrong | The old data is in `localProducts.ts` (hardcoded fallback) | This is a known issue — only triggers if Shopify API returns null. Contact your developer to remove `localProducts.ts` |

## Need help?

If you get stuck on any step, tell me which step number you're on and what you see
on screen. I can walk you through it.
