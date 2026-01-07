import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT = 5; // requests per window
const RATE_WINDOW_MINUTES = 1; // 1 minute

interface RateLimitRecord {
  id: string;
  identifier: string;
  endpoint: string;
  request_count: number;
  window_start: string;
}

async function checkAndUpdateRateLimit(
  supabase: any,
  identifier: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number }> {
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
      return { allowed: true, remaining: RATE_LIMIT - 1 }; // Fail open on DB errors
    }
    
    if (existing) {
      // Record exists within window
      if (existing.request_count >= RATE_LIMIT) {
        return { allowed: false, remaining: 0 };
      }
      
      // Increment counter
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({ request_count: existing.request_count + 1 })
        .eq('id', existing.id);
      
      if (updateError) {
        console.error('Rate limit update error:', updateError);
      }
      
      return { allowed: true, remaining: RATE_LIMIT - existing.request_count - 1 };
    }
    
    // No record exists or record is outside window - upsert new one
    const { error: upsertError } = await supabase
      .from('rate_limits')
      .upsert({
        identifier,
        endpoint,
        request_count: 1,
        window_start: new Date().toISOString()
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
      } catch (cleanupErr) {
        console.log('Cleanup error (non-critical):', cleanupErr);
      }
    }
    
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: true, remaining: RATE_LIMIT - 1 }; // Fail open on errors
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

    // Check persistent rate limit
    const rateLimit = await checkAndUpdateRateLimit(supabase, clientIP, "submit-email");
    
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
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
