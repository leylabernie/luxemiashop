import { createClient } from 'npm:@supabase/supabase-js@2.89.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Cache-Control': 'no-store',
};

const MAX_BODY_BYTES = 4 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const jsonResponse = (payload: unknown, status = 200): Response => new Response(
  JSON.stringify(payload),
  { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
);

async function readBoundedBody(req: Request): Promise<{ text?: string; tooLarge: boolean }> {
  const declaredLength = req.headers.get('content-length');
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_BODY_BYTES) {
    return { tooLarge: true };
  }

  if (!req.body) return { text: '', tooLarge: false };

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        return { tooLarge: true };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { text: new TextDecoder().decode(combined), tooLarge: false };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse({ error: 'Service temporarily unavailable' }, 503);
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is authenticated and is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return jsonResponse({ error: 'Unauthorized' }, 401);

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) return jsonResponse({ error: 'Unauthorized' }, 401);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error('Admin role lookup failed');
      return jsonResponse({ error: 'Service temporarily unavailable' }, 503);
    }
    if (!roleData) return jsonResponse({ error: 'Forbidden: Admin access required' }, 403);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    const expectedMethod = action === 'unblock-ip'
      ? 'POST'
      : new Set(['get-blocked-ips', 'get-rate-limits', 'get-stats']).has(action || '')
        ? 'GET'
        : null;
    if (!expectedMethod) return jsonResponse({ error: 'Invalid action' }, 400);
    if (req.method !== expectedMethod) return jsonResponse({ error: 'Method not allowed' }, 405);

    if (action === 'get-blocked-ips') {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('blocked_at', { ascending: false });

      if (error) throw new Error('blocked IP query failed');
      return jsonResponse({ data });
    }

    if (action === 'get-rate-limits') {
      const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) throw new Error('rate limit query failed');
      return jsonResponse({ data });
    }

    if (action === 'unblock-ip') {
      const bodyResult = await readBoundedBody(req);
      if (bodyResult.tooLarge) return jsonResponse({ error: 'Request body is too large' }, 413);

      let ipId: string;
      try {
        const parsed = JSON.parse(bodyResult.text || '');
        ipId = parsed?.ip_id;
      } catch {
        return jsonResponse({ error: 'Invalid JSON body' }, 400);
      }
      if (typeof ipId !== 'string' || !UUID_PATTERN.test(ipId)) {
        return jsonResponse({ error: 'A valid ip_id is required' }, 400);
      }

      const { data, error } = await supabase
        .from('blocked_ips')
        .delete()
        .eq('id', ipId)
        .select('id')
        .maybeSingle();

      if (error) throw new Error('blocked IP deletion failed');
      if (!data) return jsonResponse({ error: 'Blocked IP not found' }, 404);
      return jsonResponse({ success: true });
    }

    if (action === 'get-stats') {
      // Get aggregate statistics
      const [blockedIpsResult, rateLimitsResult, highViolationsResult] = await Promise.all([
        supabase.from('blocked_ips').select('id', { count: 'exact', head: true }),
        supabase.from('rate_limits').select('id', { count: 'exact', head: true }),
        supabase.from('rate_limits').select('id', { count: 'exact', head: true }).gte('violation_count', 3),
      ]);

      if (blockedIpsResult.error || rateLimitsResult.error || highViolationsResult.error) {
        throw new Error('aggregate stats query failed');
      }

      return jsonResponse({
        blockedIpsCount: blockedIpsResult.count || 0,
        rateLimitsCount: rateLimitsResult.count || 0,
        highViolationsCount: highViolationsResult.count || 0,
      });
    }

    return jsonResponse({ error: 'Invalid action' }, 400);
  } catch {
    console.error('Unexpected admin-stats failure');
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
