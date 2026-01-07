import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT = 5; // requests per window
const RATE_WINDOW_MINUTES = 1; // 1 minute
const VIOLATION_THRESHOLD = 3; // violations before blocking
const BLOCK_DURATION_MINUTES = 60; // initial block duration
const MAX_BLOCK_DURATION_HOURS = 24; // maximum block duration

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

async function isIPBlocked(
  supabase: any,
  ipAddress: string
): Promise<{ blocked: boolean; blockedUntil?: string }> {
  try {
    const { data, error } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('ip_address', ipAddress)
      .gte('blocked_until', new Date().toISOString())
      .single() as { data: BlockedIP | null; error: any };

    if (error && error.code !== 'PGRST116') {
      console.error('Block check error:', error);
      return { blocked: false }; // Fail open on DB errors
    }

    if (data) {
      return { blocked: true, blockedUntil: data.blocked_until };
    }

    return { blocked: false };
  } catch (error) {
    console.error('Block check exception:', error);
    return { blocked: false };
  }
}

async function blockIP(
  supabase: any,
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
      console.log(`Blocked IP ${ipAddress} until ${blockedUntil} (violation #${violationCount})`);
    }
  } catch (error) {
    console.error('Block IP exception:', error);
  }
}

async function recordViolation(
  supabase: any,
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
      .single() as { data: { violation_count: number } | null; error: any };

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
  supabase: any,
  identifier: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number; shouldBlock: boolean; violationCount: number }> {
  try {
    const windowStart = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000).toISOString();
    
    // Check existing rate limit record within current window
    const { data: existing, error: selectError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart)
      .single() as { data: RateLimitRecord | null; error: any };
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Rate limit check error:', selectError);
      return { allowed: true, remaining: RATE_LIMIT - 1, shouldBlock: false, violationCount: 0 };
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
    return { allowed: true, remaining: RATE_LIMIT - 1, shouldBlock: false, violationCount: 0 };
  }
}

function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Email is required" };
  }

  if (trimmed.length > 255) {
    return { valid: false, error: "Email must be less than 255 characters" };
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  // Check for injection attempts
  const injectionPattern = /<|>|script|javascript|on\w+=/i;
  if (injectionPattern.test(trimmed)) {
    return { valid: false, error: "Invalid characters in email" };
  }

  return { valid: true };
}

function generateDiscountCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "LUXE15-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("x-real-ip") ||
                     "unknown";

    // Check if IP is blocked
    const blockStatus = await isIPBlocked(supabase, clientIP);
    if (blockStatus.blocked) {
      console.log(`Blocked IP attempted access: ${clientIP}`);
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
    
    if (!rateLimit.allowed) {
      // If this is the violation that triggers blocking, block the IP
      if (rateLimit.shouldBlock) {
        await blockIP(supabase, clientIP, rateLimit.violationCount);
        console.log(`IP ${clientIP} has been blocked after ${rateLimit.violationCount} violations`);
        
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
      
      console.log(`Rate limit exceeded for IP: ${clientIP} (violation #${rateLimit.violationCount + 1})`);
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

    const body = await req.json();
    const { email, type, cartItems, cartTotal, currency } = body;

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return new Response(JSON.stringify({ error: emailValidation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate type
    if (!type || !["newsletter", "cart"].includes(type)) {
      return new Response(JSON.stringify({ error: "Invalid submission type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    if (type === "newsletter") {
      const discountCode = generateDiscountCode();
      
      const { error } = await supabase.from("newsletter_subscribers").insert({
        email: sanitizedEmail,
        source: body.source || "popup",
        discount_code: discountCode,
      });

      if (error) {
        if (error.code === "23505") {
          console.log(`Duplicate newsletter subscription attempt: ${sanitizedEmail}`);
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
        console.error("Newsletter subscription error:", error);
        throw error;
      }

      console.log(`Newsletter subscription successful: ${sanitizedEmail}`);
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

    if (type === "cart") {
      // Validate cart data
      if (!Array.isArray(cartItems)) {
        return new Response(JSON.stringify({ error: "Invalid cart data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.from("abandoned_carts").insert({
        email: sanitizedEmail,
        cart_items: cartItems,
        cart_total: cartTotal || 0,
        currency: currency || "USD",
        status: "pending",
      });

      if (error) {
        console.error("Cart save error:", error);
        throw error;
      }

      console.log(`Abandoned cart saved for: ${sanitizedEmail}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Cart saved successfully" 
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
  } catch (error) {
    console.error("Error in submit-email function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
