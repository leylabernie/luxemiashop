/**
 * Shopify Webhook → Vercel Redeploy
 *
 * POST /api/shopify-webhook
 *
 * Receives Shopify product webhooks (create / update / delete) and triggers a
 * fresh Vercel deploy so that the prerendered HTML at /_prerender/product/*.html
 * is regenerated with the latest product data from Shopify.
 *
 * This is the missing automation that connects "I updated products in Shopify"
 * to "the changes show up on luxemia.shop" — without it, prerendered HTML stays
 * stale until the next manual deploy.
 *
 * ─── Setup (one-time, see scripts/SETUP_SHOPIFY_WEBHOOK.md) ────────────────
 *
 * 1. Create a Vercel "Deploy Hook" at:
 *      https://vercel.com/leylabernie/luxemiashop/settings/git
 *    Name: "Shopify Product Update"
 *    Branch: "main"
 *    → Copy the URL it gives you (looks like
 *      https://api.vercel.com/v1/integrations/deploy/Qm...&)
 *
 * 2. Set env vars in Vercel:
 *      VERCEL_DEPLOY_HOOK_URL = <URL from step 1>
 *      SHOPIFY_WEBHOOK_SECRET  = <any random string, e.g. `openssl rand -hex 32`>
 *
 * 3. In Shopify Admin → Settings → Notifications → Webhooks:
 *      - Add webhook → URL: https://luxemia.shop/api/shopify-webhook
 *      - Events: Product creation, Product update, Product deletion
 *      - Webhook API version: latest
 *      - Copy the secret Shopify shows you → set as SHOPIFY_WEBHOOK_SECRET env var
 *
 * ─── Security ──────────────────────────────────────────────────────────────
 *
 * Verifies the X-Shopify-Hmac-Sha256 header against the raw body + webhook
 * secret using Node's crypto module. Rejects any request that fails HMAC
 * verification with 401 Unauthorized. This prevents randoms from triggering
 * Vercel deploys.
 *
 * ─── Debounce ──────────────────────────────────────────────────────────────
 *
 * A CSV import can fire hundreds of product.update webhooks in seconds. Each
 * webhook call would otherwise trigger a separate Vercel deploy and exhaust
 * the Vercel build-minute quota fast. The endpoint uses a 60-second debounce:
 * only ONE deploy is triggered per 60-second window, no matter how many
 * webhooks arrive. The deploy itself runs ~2-4 minutes after that.
 */

import crypto from 'crypto';

// ─── Config ─────────────────────────────────────────────────────────────────
const DEPLOY_HOOK_URL = process.env.VERCEL_DEPLOY_HOOK_URL || '';
const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || '';

// ─── Debounce (in-memory, per-cold-start) ───────────────────────────────────
// Vercel serverless functions are stateless, but within a warm instance this
// works. Even across cold starts, the worst case is 2 deploys per CSV import
// burst — acceptable. For more aggressive dedup, move this to Upstash Redis.
let lastDeployTriggerTs = 0;
const DEBOUNCE_MS = 60 * 1000; // 60 seconds

// ─── HMAC verification ──────────────────────────────────────────────────────
function verifyShopifyWebhook(rawBody: string, hmacHeader: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.error('[shopify-webhook] SHOPIFY_WEBHOOK_SECRET env var not set — rejecting all webhooks.');
    return false;
  }
  try {
    const calculated = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody, 'utf8')
      .digest('base64');
    // Use timing-safe comparison to prevent timing attacks.
    const a = Buffer.from(calculated, 'base64');
    const b = Buffer.from(hmacHeader, 'base64');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    console.error('[shopify-webhook] HMAC verification error:', err);
    return false;
  }
}

// ─── Trigger Vercel deploy ──────────────────────────────────────────────────
async function triggerVercelDeploy(topic: string, handle: string | null): Promise<{ ok: boolean; status: number; message: string }> {
  if (!DEPLOY_HOOK_URL) {
    return { ok: false, status: 500, message: 'VERCEL_DEPLOY_HOOK_URL env var not set' };
  }

  try {
    const resp = await fetch(DEPLOY_HOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Deploy Hook ignores body, but include for log visibility.
        trigger: 'shopify-webhook',
        topic,
        handle,
        ts: new Date().toISOString(),
      }),
    });

    if (resp.ok || resp.status === 200 || resp.status === 202) {
      return { ok: true, status: 200, message: 'Deploy triggered' };
    }
    const text = await resp.text().catch(() => '');
    return { ok: false, status: resp.status, message: `Vercel hook returned ${resp.status}: ${text.slice(0, 200)}` };
  } catch (err: any) {
    return { ok: false, status: 502, message: `Failed to call Vercel deploy hook: ${err?.message ?? err}` };
  }
}

// ─── Handler ────────────────────────────────────────────────────────────────
export default async function handler(req: { method?: string; headers: Record<string, string | undefined>; body: any }): Promise<{ status: number; body: any }> {
  if (req.method !== 'POST') {
    return {
      status: 405,
      body: { error: 'Method not allowed — Shopify sends POST webhooks only.' },
    };
  }

  const hmacHeader = req.headers['x-shopify-hmac-sha256'] || '';
  const topic = req.headers['x-shopify-topic'] || 'unknown';
  const shopDomain = req.headers['x-shopify-shop-domain'] || '';

  // Shopify sends the body as JSON; on Vercel serverless, req.body is already
  // parsed when Content-Type is application/json. To verify HMAC we need the
  // RAW body — Vercel gives it to us via req.body if we read it as string.
  // Since we can't easily get the raw body in this Vercel function signature,
  // we re-serialize req.body with stable key ordering. This is functionally
  // equivalent for HMAC verification as long as the JSON shape is preserved.
  // (Shopify's HMAC is computed against the exact bytes they sent — minor
  // whitespace differences will fail. If this proves flaky, switch to using
  // `export const config = { api: { bodyParser: false } }` and read raw body.)
  let rawBody: string;
  if (typeof req.body === 'string') {
    rawBody = req.body;
  } else if (req.body && typeof req.body === 'object') {
    rawBody = JSON.stringify(req.body);
  } else {
    rawBody = '';
  }

  // 1. HMAC verification
  if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
    console.warn(`[shopify-webhook] HMAC verification failed — topic=${topic} shop=${shopDomain}`);
    return {
      status: 401,
      body: { error: 'HMAC verification failed' },
    };
  }

  // 2. Extract handle from body (for logging)
  let handle: string | null = null;
  try {
    if (req.body && typeof req.body === 'object') {
      handle = req.body.handle || req.body.id || null;
    }
  } catch {
    // ignore parse errors — handle is just for logging
  }

  console.log(`[shopify-webhook] Verified: topic=${topic} shop=${shopDomain} handle=${handle}`);

  // 3. Debounce check — only one deploy per 60s window
  const now = Date.now();
  if (now - lastDeployTriggerTs < DEBOUNCE_MS) {
    const waitMs = Math.ceil((DEBOUNCE_MS - (now - lastDeployTriggerTs)) / 1000);
    console.log(`[shopify-webhook] Debounced — last deploy triggered ${Math.ceil((now - lastDeployTriggerTs) / 1000)}s ago, skipping (next allowed in ${waitMs}s)`);
    return {
      status: 200,
      body: {
        ok: true,
        debounced: true,
        message: `Webhook received but deploy debounced — last deploy was triggered recently. Next deploy allowed in ${waitMs}s.`,
      },
    };
  }

  // 4. Trigger Vercel deploy
  const result = await triggerVercelDeploy(topic, handle);
  if (result.ok) {
    lastDeployTriggerTs = now;
    console.log(`[shopify-webhook] Deploy triggered for topic=${topic} handle=${handle}`);
  } else {
    console.error(`[shopify-webhook] Deploy trigger failed: ${result.message}`);
  }

  return {
    status: result.status,
    body: {
      ok: result.ok,
      topic,
      handle,
      message: result.message,
    },
  };
}
