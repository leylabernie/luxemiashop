import { createClient } from "npm:@supabase/supabase-js@2.112.2";

const ALLOWED_ORIGINS = new Set([
  "https://luxemia.shop",
  "https://www.luxemia.shop",
  "https://luxemiashop-git-agent-contact-334564-labbhamini-7947s-projects.vercel.app",
]);

const RATE_LIMIT = 3;
const RATE_WINDOW_MINUTES = 5;
const VIOLATION_THRESHOLD = 3;
const BLOCK_DURATION_MINUTES = 60;
const MAX_BODY_BYTES = 12_000;

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

type AdminClient = ReturnType<typeof createClient>;

function responseHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://luxemia.shop";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
    "Vary": "Origin",
  };
}

function jsonResponse(
  req: Request,
  body: Record<string, unknown>,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...responseHeaders(req), ...extraHeaders },
  });
}

function isAllowedBrowserOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  return !origin || ALLOWED_ORIGINS.has(origin);
}

function getAdminKey(): string {
  const legacyKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacyKey) return legacyKey;

  const encodedKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (encodedKeys) {
    const keys = JSON.parse(encodedKeys) as Record<string, string>;
    if (keys.default) return keys.default;
  }

  throw new Error("Supabase server key is not configured");
}

function escapeHtml(value: string | null): string {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function requiredString(
  value: unknown,
  label: string,
  maximumLength: number,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} is required`);
  }

  const normalized = value.trim();
  if (normalized.length > maximumLength || normalized.includes("\u0000")) {
    throw new Error(`${label} is invalid`);
  }

  return normalized;
}

function optionalString(
  value: unknown,
  label: string,
  maximumLength: number,
): string | null {
  if (value === undefined || value === null || value === "") return null;
  return requiredString(value, label, maximumLength);
}

function validatePayload(payload: unknown): ConsultationLead {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid request body");
  }

  const input = payload as Record<string, unknown>;
  const email = requiredString(input.email, "Email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email address");
  }

  const preferredDate = optionalString(input.preferredDate, "Preferred date", 10);
  if (preferredDate && !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    throw new Error("Preferred date is invalid");
  }

  return {
    name: requiredString(input.name, "Name", 120),
    email,
    phone: requiredString(input.phone, "Phone", 80),
    country: requiredString(input.country, "Country", 100),
    occasion: optionalString(input.occasion, "Occasion", 200),
    preferred_date: preferredDate,
    budget: optionalString(input.budget, "Budget", 120),
    requirements: optionalString(input.requirements, "Requirements", 5_000),
  };
}

async function hashIdentifier(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function clientIdentifier(req: Request): Promise<string> {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
  return hashIdentifier(clientIp);
}

async function isBlocked(
  supabase: AdminClient,
  identifier: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("blocked_ips")
    .select("identifier")
    .eq("identifier", identifier)
    .gte("blocked_until", new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function blockIdentifier(
  supabase: AdminClient,
  identifier: string,
  violationCount: number,
): Promise<void> {
  const multiplier = Math.min(violationCount, 10);
  const blockMinutes = Math.min(BLOCK_DURATION_MINUTES * multiplier, 24 * 60);
  const blockedUntil = new Date(Date.now() + blockMinutes * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("blocked_ips")
    .upsert({
      identifier,
      reason: "consultation_spam",
      violation_count: violationCount,
      blocked_at: new Date().toISOString(),
      blocked_until: blockedUntil,
    }, { onConflict: "identifier" });

  if (error) throw error;
}

async function checkRateLimit(
  supabase: AdminClient,
  identifier: string,
): Promise<{ allowed: boolean; violationCount: number }> {
  const windowStart = new Date(
    Date.now() - RATE_WINDOW_MINUTES * 60 * 1000,
  ).toISOString();

  const { data: existing, error: lookupError } = await supabase
    .from("rate_limits")
    .select("id,request_count,violation_count")
    .eq("identifier", identifier)
    .eq("endpoint", "submit-consultation")
    .gte("window_start", windowStart)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (existing) {
    if (existing.request_count >= RATE_LIMIT) {
      const violationCount = (existing.violation_count || 0) + 1;
      const { error } = await supabase
        .from("rate_limits")
        .update({ violation_count: violationCount })
        .eq("id", existing.id);
      if (error) throw error;
      return { allowed: false, violationCount };
    }

    const { error } = await supabase
      .from("rate_limits")
      .update({ request_count: existing.request_count + 1 })
      .eq("id", existing.id);
    if (error) throw error;
    return { allowed: true, violationCount: existing.violation_count || 0 };
  }

  const { error } = await supabase
    .from("rate_limits")
    .upsert({
      identifier,
      endpoint: "submit-consultation",
      request_count: 1,
      violation_count: 0,
      window_start: new Date().toISOString(),
    }, { onConflict: "identifier,endpoint" });

  if (error) throw error;
  return { allowed: true, violationCount: 0 };
}

async function notifyTeam(lead: ConsultationLead): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("Lead saved; RESEND_API_KEY is not configured");
    return;
  }

  const subject = (lead.occasion || "Website enquiry").replace(/[\r\n]+/g, " ");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "LuxeMia Leads <hello@luxemia.shop>",
      to: ["hello@luxemia.shop"],
      reply_to: lead.email,
      subject: `New LuxeMia lead: ${subject}`,
      html: `<h2>New website lead</h2>
        <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(lead.phone)}</p>
        <p><strong>Country:</strong> ${escapeHtml(lead.country)}</p>
        <p><strong>Occasion:</strong> ${escapeHtml(lead.occasion)}</p>
        <p><strong>Preferred date:</strong> ${escapeHtml(lead.preferred_date)}</p>
        <p><strong>Budget:</strong> ${escapeHtml(lead.budget)}</p>
        <p><strong>Requirements:</strong><br>${escapeHtml(lead.requirements).replaceAll("\n", "<br>")}</p>`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Lead notification failed with status ${response.status}`);
  }
}

Deno.serve(async (req) => {
  if (!isAllowedBrowserOrigin(req)) {
    return jsonResponse(req, { error: "Origin not allowed" }, 403);
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders(req) });
  }

  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method not allowed" }, 405, {
      "Allow": "POST, OPTIONS",
    });
  }

  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return jsonResponse(req, { error: "Content-Type must be application/json" }, 415);
  }

  try {
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonResponse(req, { error: "Request body is too large" }, 413);
    }

    const payload = JSON.parse(rawBody) as unknown;
    if (
      payload
      && typeof payload === "object"
      && !Array.isArray(payload)
      && typeof (payload as Record<string, unknown>).website === "string"
      && String((payload as Record<string, unknown>).website).trim().length > 0
    ) {
      return jsonResponse(req, { success: true }, 200);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      getAdminKey(),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const identifier = await clientIdentifier(req);

    if (await isBlocked(supabase, identifier)) {
      return jsonResponse(
        req,
        { error: "Access temporarily blocked due to repeated abuse." },
        403,
      );
    }

    const rateLimit = await checkRateLimit(supabase, identifier);
    if (!rateLimit.allowed) {
      if (rateLimit.violationCount >= VIOLATION_THRESHOLD) {
        await blockIdentifier(supabase, identifier, rateLimit.violationCount);
      }

      return jsonResponse(
        req,
        { error: "Too many requests. Please try again later." },
        429,
        { "Retry-After": String(RATE_WINDOW_MINUTES * 60) },
      );
    }

    const lead = validatePayload(payload);
    const { error } = await supabase.from("consultation_leads").insert({
      ...lead,
      status: "new",
    });

    if (error) throw error;
    console.log("Consultation lead stored");

    try {
      await notifyTeam(lead);
    } catch (notificationError) {
      console.error("Consultation notification error:", notificationError);
    }

    return jsonResponse(
      req,
      {
        success: true,
        message: "Your request was received.",
      },
      200,
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonResponse(req, { error: "Invalid JSON body" }, 400);
    }

    if (error instanceof Error && /required|invalid/i.test(error.message)) {
      return jsonResponse(req, { error: error.message }, 400);
    }

    console.error("submit-consultation failed:", error);
    return jsonResponse(
      req,
      { error: "We could not save your request. Please try again." },
      500,
    );
  }
});
