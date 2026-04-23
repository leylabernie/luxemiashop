import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT = 3; // requests per window
const RATE_WINDOW_MINUTES = 5; // 5 minutes
const VIOLATION_THRESHOLD = 3; // violations before blocking
const BLOCK_DURATION_MINUTES = 60; // initial block duration

interface ConsultationLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  occasion: string | null;
  preferred_date: string | null;
  budget: string | null;
  requirements: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

async function isIPBlocked(
  supabase: any,
  ipAddress: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('ip_address', ipAddress)
      .gte('blocked_until', new Date().toISOString())
      .single();

    return !!data;
  } catch {
    return false;
  }
}

async function blockIP(
  supabase: any,
  ipAddress: string,
  violationCount: number
): Promise<void> {
  try {
    const multiplier = Math.min(violationCount, 10);
    const blockMinutes = Math.min(
      BLOCK_DURATION_MINUTES * multiplier,
      24 * 60
    );
    const blockedUntil = new Date(Date.now() + blockMinutes * 60 * 1000).toISOString();

    await supabase
      .from('blocked_ips')
      .upsert({
        ip_address: ipAddress,
        reason: 'consultation_spam',
        violation_count: violationCount,
        blocked_at: new Date().toISOString(),
        blocked_until: blockedUntil,
      }, {
        onConflict: 'ip_address'
      });
  } catch (error) {
    console.error('Block IP error:', error);
  }
}

async function checkAndUpdateRateLimit(
  supabase: any,
  identifier: string
): Promise<{ allowed: boolean; violationCount: number }> {
  try {
    const windowStart = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000).toISOString();
    
    const { data: existing } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('endpoint', 'submit-consultation')
      .gte('window_start', windowStart)
      .single();
    
    if (existing) {
      if (existing.request_count >= RATE_LIMIT) {
        const newViolationCount = (existing.violation_count || 0) + 1;
        
        await supabase
          .from('rate_limits')
          .update({ violation_count: newViolationCount })
          .eq('id', existing.id);
        
        return { 
          allowed: false, 
          violationCount: newViolationCount 
        };
      }
      
      await supabase
        .from('rate_limits')
        .update({ request_count: existing.request_count + 1 })
        .eq('id', existing.id);
      
      return { 
        allowed: true, 
        violationCount: existing.violation_count 
      };
    }
    
    await supabase
      .from('rate_limits')
      .upsert({
        identifier,
        endpoint: 'submit-consultation',
        request_count: 1,
        window_start: new Date().toISOString(),
        violation_count: 0
      }, {
        onConflict: 'identifier,endpoint'
      });
    
    return { allowed: true, violationCount: 0 };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: true, violationCount: 0 };
  }
}

function validateConsultationData(data: any): { valid: boolean; error?: string } {
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }

  if (!data.email || typeof data.email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email.trim())) {
    return { valid: false, error: 'Invalid email address' };
  }

  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length === 0) {
    return { valid: false, error: 'Phone number is required' };
  }

  if (!data.country || typeof data.country !== 'string' || data.country.trim().length === 0) {
    return { valid: false, error: 'Country is required' };
  }

  // Sanitize text fields to prevent injection
  const injectionPattern = /<|>|script|javascript|on\w+=/i;
  const textFields = [data.name, data.email, data.phone, data.country, data.occasion, data.requirements];
  for (const field of textFields) {
    if (field && typeof field === 'string' && injectionPattern.test(field)) {
      return { valid: false, error: 'Invalid characters detected' };
    }
  }

  return { valid: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("x-real-ip") ||
                     "unknown";

    // Check if IP is blocked
    const blocked = await isIPBlocked(supabase, clientIP);
    if (blocked) {
      return new Response(
        JSON.stringify({ 
          error: "Access temporarily blocked due to repeated abuse.",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check rate limit
    const rateLimit = await checkAndUpdateRateLimit(supabase, clientIP);
    
    if (!rateLimit.allowed) {
      if (rateLimit.violationCount >= VIOLATION_THRESHOLD) {
        await blockIP(supabase, clientIP, rateLimit.violationCount);
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Too many requests. Please try again later.",
          retryAfter: RATE_WINDOW_MINUTES * 60
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(RATE_WINDOW_MINUTES * 60),
          },
        }
      );
    }

    const body = await req.json();
    const { name, email, phone, country, occasion, preferredDate, budget, requirements } = body;

    // Validate input
    const validation = validateConsultationData({ name, email, phone, country, occasion, requirements });
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    // Insert consultation lead into database
    const { data, error } = await supabase
      .from('consultation_leads')
      .insert({
        name: name.trim(),
        email: sanitizedEmail,
        phone: phone.trim(),
        country: country.trim(),
        occasion: occasion || null,
        preferred_date: preferredDate || null,
        budget: budget || null,
        requirements: requirements || null,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('Consultation lead insert error:', error);
      throw error;
    }

    console.log(`Consultation lead created: ${sanitizedEmail} (${country})`);

    return new Response(
      JSON.stringify({ 
        success: true,
        leadId: data.id,
        message: "Consultation request received. Our team will contact you shortly.",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in submit-consultation function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
