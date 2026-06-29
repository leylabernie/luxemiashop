/**
 * Manual Refresh Products → Vercel Redeploy
 *
 * POST /api/refresh-products
 *
 * Manually triggers a Vercel redeploy so prerendered HTML is regenerated
 * with the latest product data from Shopify. Use this as the "Refresh
 * Products" button on the Admin Dashboard after a CSV import.
 *
 * ─── Auth ─────────────────────────────────────────────────────────────────
 *
 * Verifies the caller is a logged-in ADMIN via Supabase session JWT (passed
 * in the Authorization: Bearer <access_token> header). This means:
 *   - NO separate ADMIN_REFRESH_TOKEN env var needed
 *   - Auth is automatic — the admin dashboard includes the session token
 *     via the supabase-js client on every fetch
 *   - Only users with role='admin' in the user_roles table can trigger
 *
 * Required env vars:
 *   - VERCEL_DEPLOY_HOOK_URL  ← URL from Vercel → Settings → Git → Deploy Hooks
 *   - SUPABASE_URL            ← already set (Vercel Supabase integration)
 *   - SUPABASE_SERVICE_ROLE_KEY ← already set (Vercel Supabase integration)
 *
 * Usage from admin UI (auto-includes session token via supabase-js):
 *
 *   const { data: { session } } = await supabase.auth.getSession();
 *   await fetch('/api/refresh-products', {
 *     method: 'POST',
 *     headers: { Authorization: `Bearer ${session.access_token}` }
 *   })
 */

// ─── Config ─────────────────────────────────────────────────────────────────
const DEPLOY_HOOK_URL = process.env.VERCEL_DEPLOY_HOOK_URL || '';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// ─── Auth: verify Supabase session + admin role ─────────────────────────────
async function verifyAdminSession(authHeader: string): Promise<{ ok: boolean; status: number; userId?: string; message?: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, status: 401, message: 'Missing Authorization Bearer token' };
  }
  const accessToken = authHeader.slice(7).trim();
  if (!accessToken) {
    return { ok: false, status: 401, message: 'Empty access token' };
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[refresh-products] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var not set.');
    return { ok: false, status: 500, message: 'Server missing Supabase credentials' };
  }

  // 1. Verify the access token by calling Supabase auth.getUser
  //    (this both validates the JWT AND returns the user record)
  try {
    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'apikey': SUPABASE_SERVICE_KEY,
      },
    });
    if (!userResp.ok) {
      return { ok: false, status: 401, message: 'Invalid or expired session' };
    }
    const userJson: any = await userResp.json();
    const userId: string | undefined = userJson?.id;
    if (!userId) {
      return { ok: false, status: 401, message: 'No user id in session' };
    }

    // 2. Check user_roles table for admin role using the service role key
    //    (bypasses RLS so we can read the role even if RLS would block)
    const rolesResp = await fetch(
      `${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${encodeURIComponent(userId)}&select=role`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!rolesResp.ok) {
      console.error(`[refresh-products] user_roles query failed: ${rolesResp.status}`);
      return { ok: false, status: 500, message: 'Could not verify admin role' };
    }
    const rolesJson: any = await rolesResp.json();
    const roles: Array<{ role: string }> = Array.isArray(rolesJson) ? rolesJson : [];
    const isAdmin = roles.some(r => r.role === 'admin');
    if (!isAdmin) {
      return { ok: false, status: 403, message: 'Admin role required' };
    }

    return { ok: true, status: 200, userId };
  } catch (err: any) {
    console.error('[refresh-products] Session verification error:', err?.message ?? err);
    return { ok: false, status: 500, message: 'Session verification failed' };
  }
}

// ─── Trigger Vercel deploy ──────────────────────────────────────────────────
async function triggerVercelDeploy(): Promise<{ ok: boolean; status: number; message: string }> {
  if (!DEPLOY_HOOK_URL) {
    return {
      ok: false,
      status: 500,
      message: 'VERCEL_DEPLOY_HOOK_URL env var not set. Create one in Vercel → Settings → Git → Deploy Hooks, then add it as an env var in Vercel → Settings → Environment Variables.',
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
        ok: true,
        status: 200,
        message: 'Vercel deploy triggered. Prerendered HTML will refresh in 2-4 minutes.',
      };
    }
    const text = await resp.text().catch(() => '');
    console.error(`[refresh-products] Vercel hook returned ${resp.status}: ${text}`);
    return {
      ok: false,
      status: resp.status,
      message: `Vercel hook returned ${resp.status}: ${text.slice(0, 200)}`,
    };
  } catch (err: any) {
    console.error(`[refresh-products] Failed to call Vercel deploy hook: ${err?.message ?? err}`);
    return {
      ok: false,
      status: 502,
      message: `Failed to call Vercel deploy hook: ${err?.message ?? String(err)}`,
    };
  }
}

// ─── Handler ────────────────────────────────────────────────────────────────
export default async function handler(req: {
  method?: string;
  headers: Record<string, string | undefined>;
}): Promise<{ status: number; body: any }> {
  if (req.method !== 'POST') {
    return {
      status: 405,
      body: { error: 'Method not allowed — use POST to trigger a deploy.' },
    };
  }

  // 1. Verify caller is a logged-in admin (no env-var token needed — uses Supabase session)
  const auth = await verifyAdminSession(req.headers['authorization'] || '');
  if (!auth.ok) {
    return {
      status: auth.status,
      body: { error: auth.message || 'Unauthorized' },
    };
  }

  // 2. Trigger Vercel deploy
  const result = await triggerVercelDeploy();
  return {
    status: result.status,
    body: {
      ok: result.ok,
      message: result.message,
      userId: auth.userId,
    },
  };
}
