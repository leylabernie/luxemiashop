import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

const RATE_LIMIT = 3; // requests per window
const RATE_WINDOW_MINUTES = 5; // 5 minutes
const VIOLATION_THRESHOLD = 3; // violations before blocking
const BLOCK_DURATION_MINUTES = 60; // initial block duration
const MAX_BODY_BYTES = 32 * 1024;

const escapeHtml = (value: string | null | undefined): string => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

async function notifyTeam(lead: ConsultationLead): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.warn('Lead saved but RESEND_API_KEY is not configured; skipping notification');
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'LuxeMia Leads <hello@luxemia.shop>',
      to: ['hello@luxemia.shop'],
      reply_to: lead.email,
      subject: `New LuxeMia lead: ${lead.occasion || 'Website enquiry'}`,
      html: `<h2>New website lead</h2>
        <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(lead.phone)}</p>
        <p><strong>Country:</strong> ${escapeHtml(lead.country)}</p>
        <p><strong>Occasion:</strong> ${escapeHtml(lead.occasion)}</p>
        <p><strong>Preferred date:</strong> ${escapeHtml(lead.preferred_date)}</p>
        <p><strong>Budget:</strong> ${escapeHtml(lead.budget)}</p>
        <p><strong>Requirements:</strong><br>${escapeHtml(lead.requirements).replaceAll('\n', '<br>')}</p>`,
    }),
  });

  if (!response.ok) {
    response.body?.cancel();
    throw new Error(`Lead notification failed with status ${response.status}`);
  }
}

interface ConsultationLead {
  name: string;
  email: string;
  phone: string;
  country: string;
  occasion: string | null;
  preferred_date: string | null;
  budget: string | null;
  requirements: string | null;
}

interface ConsultationSubmission {
  name: string;
  email: string;
  phone: string;
  country: string;
  occasion: string | null;
  preferredDate: string | null;
  budget: string | null;
  requirements: string | null;
}

function hasInvalidControlCharacters(value: string, allowFormatting: boolean): boolean {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code === 127) return true;
    if (code < 32 && !(allowFormatting && (code === 9 || code === 10 || code === 13))) return true;
  }
  return false;
}

function getClientIdentifier(req: Request): string {
  const candidate = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')?.trim()
    || 'unknown';
  return candidate.slice(0, 128);
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

async function isIPBlocked(
  supabase: SupabaseClient,
  ipAddress: string
): Promise<{ blocked: boolean; unavailable?: boolean }> {
  try {
    const { data, error } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('ip_address', ipAddress)
      .gte('blocked_until', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Block check error:', error);
      return { blocked: false, unavailable: true };
    }
    return { blocked: Boolean(data) };
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
  supabase: SupabaseClient,
  identifier: string
): Promise<{ allowed: boolean; violationCount: number; unavailable?: boolean }> {
  try {
    const windowStart = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000).toISOString();
    
    const { data: existing, error: selectError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('endpoint', 'submit-consultation')
      .gte('window_start', windowStart)
      .single();
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Rate limit check error:', selectError);
      return { allowed: false, violationCount: 0, unavailable: true };
    }
    
    if (existing) {
      if (existing.request_count >= RATE_LIMIT) {
        const newViolationCount = (existing.violation_count || 0) + 1;
        
        const { error: violationError } = await supabase
          .from('rate_limits')
          .update({ violation_count: newViolationCount })
          .eq('id', existing.id);
        if (violationError) {
          console.error('Rate limit violation update error:', violationError);
          return { allowed: false, violationCount: 0, unavailable: true };
        }
        
        return { 
          allowed: false, 
          violationCount: newViolationCount 
        };
      }
      
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({ request_count: existing.request_count + 1 })
        .eq('id', existing.id);
      if (updateError) {
        console.error('Rate limit update error:', updateError);
        return { allowed: false, violationCount: 0, unavailable: true };
      }
      
      return { 
        allowed: true, 
        violationCount: existing.violation_count 
      };
    }
    
    const { error: upsertError } = await supabase
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
    if (upsertError) {
      console.error('Rate limit upsert error:', upsertError);
      return { allowed: false, violationCount: 0, unavailable: true };
    }
    
    return { allowed: true, violationCount: 0 };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: false, violationCount: 0, unavailable: true };
  }
}

function validateConsultationData(data: unknown): { value?: ConsultationSubmission; error?: string } {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { error: 'Invalid request body' };
  }

  const record = data as Record<string, unknown>;
  const limits: Record<keyof ConsultationSubmission, number> = {
    name: 120,
    email: 255,
    phone: 80,
    country: 100,
    occasion: 180,
    preferredDate: 10,
    budget: 120,
    requirements: 5000,
  };
  const required = new Set<keyof ConsultationSubmission>(['name', 'email', 'phone', 'country']);
  const normalized = {} as Record<keyof ConsultationSubmission, string | null>;

  for (const field of Object.keys(limits) as Array<keyof ConsultationSubmission>) {
    const raw = record[field];
    if (raw === undefined || raw === null || raw === '') {
      if (required.has(field)) return { error: `${field} is required` };
      normalized[field] = null;
      continue;
    }
    if (typeof raw !== 'string') return { error: `${field} must be text` };

    const value = raw.trim();
    if (required.has(field) && !value) return { error: `${field} is required` };
    if (value.length > limits[field]) return { error: `${field} is too long` };
    if (hasInvalidControlCharacters(value, field === 'requirements')) {
      return { error: `${field} contains invalid characters` };
    }
    normalized[field] = value || null;
  }

  const email = normalized.email || '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Invalid email address' };
  }
  const preferredDate = normalized.preferredDate;
  if (preferredDate && !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    return { error: 'preferredDate must use YYYY-MM-DD' };
  }
  if (preferredDate) {
    const parsedDate = new Date(`${preferredDate}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== preferredDate) {
      return { error: 'preferredDate must be a valid calendar date' };
    }
  }

  return {
    value: {
      name: normalized.name || '',
      email: email.toLowerCase(),
      phone: normalized.phone || '',
      country: normalized.country || '',
      occasion: normalized.occasion,
      preferredDate,
      budget: normalized.budget,
      requirements: normalized.requirements,
    },
  };
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
    if (rateLimit.unavailable) {
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
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

    const bodyResult = await readBoundedBody(req);
    if (bodyResult.tooLarge) {
      return new Response(JSON.stringify({ error: "Request body is too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let body: unknown;
    try {
      body = JSON.parse(bodyResult.text || '');
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validation = validateConsultationData(body);
    if (!validation.value) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const submission = validation.value;

    // Insert consultation lead into database
    const { data, error } = await supabase
      .from('consultation_leads')
      .insert({
        name: submission.name,
        email: submission.email,
        phone: submission.phone,
        country: submission.country,
        occasion: submission.occasion,
        preferred_date: submission.preferredDate,
        budget: submission.budget,
        requirements: submission.requirements,
        status: 'new',
      })
      .select('name,email,phone,country,occasion,preferred_date,budget,requirements')
      .single();

    if (error) {
      console.error('Consultation lead insert failed');
      throw error;
    }

    console.log('Consultation lead created');

    // A notification failure must not lose or duplicate a lead that is already saved.
    try {
      await notifyTeam(data as ConsultationLead);
    } catch {
      console.error('Consultation lead notification failed');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Consultation request received and saved.",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch {
    console.error("Unexpected submit-consultation failure");
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
