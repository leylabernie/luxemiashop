import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

const RATE_LIMIT = 5; // requests per window
const RATE_WINDOW_MINUTES = 1; // 1 minute
const VIOLATION_THRESHOLD = 3; // violations before blocking
const BLOCK_DURATION_MINUTES = 60; // initial block duration
const MAX_BLOCK_DURATION_HOURS = 24; // maximum block duration
const MAX_BODY_BYTES = 8 * 1024;

interface RateLimitRecord {
  id: string;
  identifier: string;
  endpoint: string;
  request_count: number;
  window_start: string;
  violation_count: number;
}

interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  violation_count: number;
  blocked_at: string;
  blocked_until: string;
}

interface PostgrestErrorLike {
  code?: string;
  message?: string;
}

function getClientIdentifier(req: Request): string {
  const candidate = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')?.trim()
    || 'unknown';
  return candidate.slice(0, 128);
}

async function isIPBlocked(
  supabase: SupabaseClient,
  ipAddress: string
): Promise<{ blocked: boolean; blockedUntil?: string; unavailable?: boolean }> {
  try {
    const { data, error } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('ip_address', ipAddress)
      .gte('blocked_until', new Date().toISOString())
      .single() as { data: BlockedIP | null; error: PostgrestErrorLike | null };

    if (error && error.code !== 'PGRST116') {
      console.error('Block check error:', error);
      return { blocked: false, unavailable: true };
    }

    if (data) {
      return { blocked: true, blockedUntil: data.blocked_until };
    }

    return { blocked: false };
  } catch (error) {
    console.error('Block check exception:', error);
    return { blocked: false, unavailable: true };
  }
}

async function blockIP(
  supabase: SupabaseClient,
  ipAddress: string,
  violationCount: number
): Promise<void> {
  try {
    // Calculate escalating block duration based on violation count
    const multiplier = Math.min(violationCount, 10); // Cap at 10x
    const blockMinutes = Math.min(
      BLOCK_DURATION_MINUTES * multiplier,
      MAX_BLOCK_DURATION_HOURS * 60
    );
    const blockedUntil = new Date(Date.now() + blockMinutes * 60 * 1000).toISOString();

    // Upsert the block record
    const { error } = await supabase
      .from('blocked_ips')
      .upsert({
        ip_address: ipAddress,
        reason: 'rate_limit_abuse',
        violation_count: violationCount,
        blocked_at: new Date().toISOString(),
        blocked_until: blockedUntil,
      }, {
        onConflict: 'ip_address'
      });

    if (error) {
      console.error('Block IP error:', error);
    } else {
      console.log(`Newsletter client blocked until ${blockedUntil} (violation #${violationCount})`);
    }
  } catch (error) {
    console.error('Block IP exception:', error);
  }
}

async function recordViolation(
  supabase: SupabaseClient,
  identifier: string,
  endpoint: string
): Promise<number> {
  try {
    // Get current violation count and increment
    const { data, error } = await supabase
      .from('rate_limits')
      .select('violation_count')
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .single() as { data: { violation_count: number } | null; error: PostgrestErrorLike | null };

    const currentCount = data?.violation_count || 0;
    const newCount = currentCount + 1;

    // Update violation count
    await supabase
      .from('rate_limits')
      .update({ violation_count: newCount })
      .eq('identifier', identifier)
      .eq('endpoint', endpoint);

    return newCount;
  } catch (error) {
    console.error('Record violation error:', error);
    return 1;
  }
}

async function checkAndUpdateRateLimit(
  supabase: SupabaseClient,
  identifier: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number; shouldBlock: boolean; violationCount: number; unavailable?: boolean }> {
  try {
    const windowStart = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000).toISOString();
    
    // Check existing rate limit record within current window
    const { data: existing, error: selectError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart)
      .single() as { data: RateLimitRecord | null; error: PostgrestErrorLike | null };
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Rate limit check error:', selectError);
      return { allowed: false, remaining: 0, shouldBlock: false, violationCount: 0, unavailable: true };
    }
    
    if (existing) {
      // Record exists within window
      if (existing.request_count >= RATE_LIMIT) {
        // Record this violation
        const violationCount = await recordViolation(supabase, identifier, endpoint);
        const shouldBlock = violationCount >= VIOLATION_THRESHOLD;
        
        return { 
          allowed: false, 
          remaining: 0, 
          shouldBlock, 
          violationCount 
        };
      }
      
      // Increment counter
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({ request_count: existing.request_count + 1 })
        .eq('id', existing.id);
      
      if (updateError) {
        console.error('Rate limit update error:', updateError);
        return { allowed: false, remaining: 0, shouldBlock: false, violationCount: existing.violation_count, unavailable: true };
      }
      
      return { 
        allowed: true, 
        remaining: RATE_LIMIT - existing.request_count - 1, 
        shouldBlock: false, 
        violationCount: existing.violation_count 
      };
    }
    
    // No record exists or record is outside window - upsert new one
    const { error: upsertError } = await supabase
      .from('rate_limits')
      .upsert({
        identifier,
        endpoint,
        request_count: 1,
        window_start: new Date().toISOString(),
        violation_count: 0
      }, {
        onConflict: 'identifier,endpoint'
      });
    
    if (upsertError) {
      console.error('Rate limit upsert error:', upsertError);
      return { allowed: false, remaining: 0, shouldBlock: false, violationCount: 0, unavailable: true };
    }
    
    // Clean up old entries occasionally (1% chance per request)
    if (Math.random() < 0.01) {
      try {
        await supabase.rpc('cleanup_old_rate_limits');
        await supabase.rpc('cleanup_expired_blocks');
      } catch (cleanupErr) {
        console.log('Cleanup error (non-critical):', cleanupErr);
      }
    }
    
    return { allowed: true, remaining: RATE_LIMIT - 1, shouldBlock: false, violationCount: 0 };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: false, remaining: 0, shouldBlock: false, violationCount: 0, unavailable: true };
  }
}

function validateEmail(email: unknown): { value?: string; error?: string } {
  if (!email || typeof email !== "string") {
    return { error: "Email is required" };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { error: "Email is required" };
  }

  if (trimmed.length > 255) {
    return { error: "Email must be less than 255 characters" };
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { error: "Please enter a valid email address" };
  }

  // Check for injection attempts
  const injectionPattern = /<|>|script|javascript|on\w+=/i;
  if (injectionPattern.test(trimmed)) {
    return { error: "Invalid characters in email" };
  }

  return { value: trimmed.toLowerCase() };
}

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

const ACTIVE_WELCOME_DISCOUNT_CODE = "LUXE10";
const NEWSLETTER_SOURCES = new Set(['footer', 'welcome_popup']);

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Initialize Supabase client with service role for admin operations
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get client IP for rate limiting
    const clientIP = getClientIdentifier(req);

    // Check if IP is blocked
    const blockStatus = await isIPBlocked(supabase, clientIP);
    if (blockStatus.unavailable) {
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (blockStatus.blocked) {
      console.log('Blocked client attempted newsletter submission');
      return new Response(
        JSON.stringify({ 
          error: "Access temporarily blocked due to repeated abuse.",
          blockedUntil: blockStatus.blockedUntil
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check persistent rate limit
    const rateLimit = await checkAndUpdateRateLimit(supabase, clientIP, "submit-email");
    if (rateLimit.unavailable) {
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (!rateLimit.allowed) {
      // If this is the violation that triggers blocking, block the IP
      if (rateLimit.shouldBlock) {
        await blockIP(supabase, clientIP, rateLimit.violationCount);
        console.log(`Newsletter client blocked after ${rateLimit.violationCount} violations`);
        
        return new Response(
          JSON.stringify({ 
            error: "Access temporarily blocked due to repeated abuse. Please try again later.",
          }),
          {
            status: 403,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
      
      console.log(`Newsletter rate limit exceeded (violation #${rateLimit.violationCount + 1})`);
      return new Response(
        JSON.stringify({ 
          error: "Too many requests. Please try again later.",
          retryAfter: 60
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": "60",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const bodyResult = await readBoundedBody(req);
    if (bodyResult.tooLarge) {
      return new Response(JSON.stringify({ error: "Request body is too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let body: Record<string, unknown>;
    try {
      const parsed = JSON.parse(bodyResult.text || '');
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid body');
      body = parsed as Record<string, unknown>;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { email, type } = body;

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.value) {
      return new Response(JSON.stringify({ error: emailValidation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate type
    if (type !== "newsletter") {
      return new Response(JSON.stringify({ error: "Invalid submission type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedEmail = emailValidation.value;

    if (type === "newsletter") {
      const discountCode = ACTIVE_WELCOME_DISCOUNT_CODE;
      const source = typeof body.source === 'string' ? body.source.trim().toLowerCase() : '';
      if (!NEWSLETTER_SOURCES.has(source)) {
        return new Response(JSON.stringify({ error: "Invalid subscription source" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const { error } = await supabase.from("newsletter_subscribers").insert({
        email: sanitizedEmail,
        source,
        discount_code: discountCode,
      });

      if (error) {
        if (error.code === "23505") {
          console.log('Duplicate newsletter subscription attempt');
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "Already subscribed",
              duplicate: true 
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        console.error("Newsletter subscription insert failed");
        throw error;
      }

      console.log('Newsletter subscription successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          discountCode,
          message: "Subscription successful" 
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": String(rateLimit.remaining),
          },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    console.error("Unexpected submit-email failure");
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
