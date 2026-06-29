/**
 * Manual Refresh Products → Vercel Redeploy
 *
 * POST /api/refresh-products
 *
 * Manually triggers a Vercel redeploy so prerendered HTML is regenerated
 * with the latest product data from Shopify. Use this as the "Refresh
 * Products" button on the Admin Dashboard after a CSV import, when you
 * haven't set up the Shopify webhook automation yet.
 *
 * Auth: requires a Bearer token in the Authorization header matching the
 * ADMIN_REFRESH_TOKEN env var. Without this, anyone could trigger Vercel
 * deploys and exhaust your build quota. The token is also checked against
 * a `?token=...` query param for convenience when calling from the browser.
 *
 * Usage from admin UI:
 *
 *   fetch('/api/refresh-products', {
 *     method: 'POST',
 *     headers: { 'Authorization': `Bearer ${token}` }
 *   })
 *
 * Usage from CLI (debugging):
 *
 *   curl -X POST https://luxemia.shop/api/refresh-products \
 *        -H "Authorization: Bearer $ADMIN_REFRESH_TOKEN"
 */

const DEPLOY_HOOK_URL = process.env.VERCEL_DEPLOY_HOOK_URL || '';
const ADMIN_REFRESH_TOKEN = process.env.ADMIN_REFRESH_TOKEN || '';

export default async function handler(req: {
  method?: string;
  headers: Record<string, string | undefined>;
  query?: Record<string, string | string[] | undefined>;
}): Promise<{ status: number; body: any }> {
  if (req.method !== 'POST') {
    return {
      status: 405,
      body: { error: 'Method not allowed — use POST to trigger a deploy.' },
    };
  }

  // ─── Auth check ─────────────────────────────────────────────────────────
  // Allow either Authorization: Bearer <token> OR ?token=<token> (for browser fetches)
  const authHeader = req.headers['authorization'] || '';
  const headerToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : '';
  const queryToken = (req.query?.token as string) || '';
  const providedToken = headerToken || queryToken;

  if (!ADMIN_REFRESH_TOKEN) {
    console.error('[refresh-products] ADMIN_REFRESH_TOKEN env var not set — refusing to authenticate.');
    return {
      status: 500,
      body: { error: 'Server not configured — set ADMIN_REFRESH_TOKEN env var.' },
    };
  }

  if (providedToken !== ADMIN_REFRESH_TOKEN) {
    // Constant-time comparison to prevent timing attacks
    const a = Buffer.from(providedToken);
    const b = Buffer.from(ADMIN_REFRESH_TOKEN);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }
  }

  // ─── Trigger Vercel deploy ──────────────────────────────────────────────
  if (!DEPLOY_HOOK_URL) {
    console.error('[refresh-products] VERCEL_DEPLOY_HOOK_URL env var not set.');
    return {
      status: 500,
      body: { error: 'Server not configured — set VERCEL_DEPLOY_HOOK_URL env var.' },
    };
  }

  try {
    const resp = await fetch(DEPLOY_HOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trigger: 'manual-refresh',
        ts: new Date().toISOString(),
      }),
    });

    if (resp.ok || resp.status === 200 || resp.status === 202) {
      console.log('[refresh-products] Deploy triggered manually');
      return {
        status: 200,
        body: {
          ok: true,
          message: 'Vercel deploy triggered. Prerendered HTML will refresh in 2-4 minutes.',
          deployEta: '2-4 minutes',
        },
      };
    }
    const text = await resp.text().catch(() => '');
    console.error(`[refresh-products] Vercel hook returned ${resp.status}: ${text}`);
    return {
      status: resp.status,
      body: { error: `Vercel hook returned ${resp.status}`, detail: text.slice(0, 200) },
    };
  } catch (err: any) {
    console.error(`[refresh-products] Failed to call Vercel deploy hook: ${err?.message ?? err}`);
    return {
      status: 502,
      body: { error: 'Failed to call Vercel deploy hook', detail: err?.message ?? String(err) },
    };
  }
}

// ─── crypto import (Node runtime) ──────────────────────────────────────────
// Vercel serverless functions run on Node — import crypto at module level.
import * as crypto from 'crypto';
