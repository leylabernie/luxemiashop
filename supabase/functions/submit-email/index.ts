import { createClient } from "npm:@supabase/supabase-js@2.112.2";

const ALLOWED_ORIGINS = new Set([
  "https://luxemia.shop",
  "https://www.luxemia.shop",
]);

const ALLOWED_VERCEL_PREVIEW =
  /^https:\/\/luxemiashop-[a-z0-9-]+-labbhamini-7947s-projects\.vercel\.app$/;

const ENDPOINT = "submit-email";
const RATE_LIMIT = 5;
const RATE_WINDOW_MINUTES = 10;
const VIOLATION_THRESHOLD = 3;
const BLOCK_DURATION_MINUTES = 60;
const MAX_BODY_BYTES = 2_048;
const WELCOME_DISCOUNT_CODE = "WELCOME10";
const WELCOME_DISCOUNT_PERCENT = 10;
const SIGNUP_SOURCE = "welcome_popup_10_percent";
const LEGACY_SIGNUP_SOURCE = "welcome_popup";

type AdminClient = ReturnType<typeof createClient>;

interface RateLimitRecord {
  id: string;
  request_count: number;
  violation_count: number;
}

interface SignupPayload {
  email: string;
  type: "newsletter";
  source: typeof SIGNUP_SOURCE;
}

type WelcomeEmailOutcome =
  | { status: "accepted"; providerId: string | null }
  | { status: "not_configured" }
  | {
      status: "failed";
      providerStatus?: number;
      providerReason:
        | "domain_not_verified"
        | "testing_recipient_restricted"
        | "invalid_api_key"
        | "provider_rate_limited"
        | "provider_rejected"
        | "provider_unreachable";
    };

function isAllowedOrigin(origin: string | null): boolean {
  return (
    !origin ||
    ALLOWED_ORIGINS.has(origin) ||
    ALLOWED_VERCEL_PREVIEW.test(origin)
  );
}

function responseHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const allowedOrigin =
    origin && isAllowedOrigin(origin) ? origin : "https://luxemia.shop";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
    Vary: "Origin",
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

function validatePayload(payload: unknown): SignupPayload {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid request body");
  }

  const input = payload as Record<string, unknown>;
  if (input.type !== "newsletter") {
    throw new Error("Invalid submission type");
  }

  if (
    input.source !== SIGNUP_SOURCE &&
    input.source !== LEGACY_SIGNUP_SOURCE
  ) {
    throw new Error("Invalid submission source");
  }

  if (typeof input.email !== "string") {
    throw new Error("Email is required");
  }

  const email = input.email.trim().toLowerCase();
  if (
    email.length < 3 ||
    email.length > 254 ||
    email.includes("\u0000") ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error("Please enter a valid email address");
  }

  return { email, type: "newsletter", source: SIGNUP_SOURCE };
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
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown";
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
  const blockedUntil = new Date(
    Date.now() + blockMinutes * 60 * 1_000,
  ).toISOString();

  const { error } = await supabase.from("blocked_ips").upsert(
    {
      identifier,
      reason: "welcome_email_spam",
      violation_count: violationCount,
      blocked_at: new Date().toISOString(),
      blocked_until: blockedUntil,
    },
    { onConflict: "identifier" },
  );

  if (error) throw error;
}

async function checkRateLimit(
  supabase: AdminClient,
  identifier: string,
): Promise<{ allowed: boolean; remaining: number; violationCount: number }> {
  const windowStart = new Date(
    Date.now() - RATE_WINDOW_MINUTES * 60 * 1_000,
  ).toISOString();

  const { data: existing, error: lookupError } = await supabase
    .from("rate_limits")
    .select("id,request_count,violation_count")
    .eq("identifier", identifier)
    .eq("endpoint", ENDPOINT)
    .gte("window_start", windowStart)
    .maybeSingle<RateLimitRecord>();

  if (lookupError) throw lookupError;

  if (existing) {
    if (existing.request_count >= RATE_LIMIT) {
      const violationCount = (existing.violation_count || 0) + 1;
      const { error } = await supabase
        .from("rate_limits")
        .update({ violation_count: violationCount })
        .eq("id", existing.id);
      if (error) throw error;
      return { allowed: false, remaining: 0, violationCount };
    }

    const requestCount = existing.request_count + 1;
    const { error } = await supabase
      .from("rate_limits")
      .update({ request_count: requestCount })
      .eq("id", existing.id);
    if (error) throw error;

    return {
      allowed: true,
      remaining: Math.max(0, RATE_LIMIT - requestCount),
      violationCount: existing.violation_count || 0,
    };
  }

  const { error } = await supabase.from("rate_limits").upsert(
    {
      identifier,
      endpoint: ENDPOINT,
      request_count: 1,
      violation_count: 0,
      window_start: new Date().toISOString(),
    },
    { onConflict: "identifier,endpoint" },
  );

  if (error) throw error;
  return { allowed: true, remaining: RATE_LIMIT - 1, violationCount: 0 };
}

async function sendWelcomeEmail(email: string): Promise<WelcomeEmailOutcome> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error(
      JSON.stringify({
        event: "welcome_email",
        status: "not_configured",
      }),
    );
    return { status: "not_configured" };
  }

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LuxeMia <hello@luxemia.shop>",
        to: [email],
        reply_to: "hello@luxemia.shop",
        subject: "Your LuxeMia welcome code",
        html: `<!doctype html>
          <html lang="en">
            <body style="margin:0;background:#f6f1ea;color:#2d211d;font-family:Arial,sans-serif;">
              <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
                <p style="margin:0 0 18px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8b5e3c;">Welcome to LuxeMia</p>
                <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:32px;font-weight:500;line-height:1.2;">A little something for your first order</h1>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.65;">Thank you for joining us. Enjoy ${WELCOME_DISCOUNT_PERCENT}% off your first LuxeMia order with the code below.</p>
                <p style="margin:0 0 28px;padding:16px;border:1px solid #c9a274;text-align:center;font-size:22px;font-weight:700;letter-spacing:3px;">${WELCOME_DISCOUNT_CODE}</p>
                <p style="margin:0 0 28px;"><a href="https://luxemia.shop/collections" style="display:inline-block;background:#7a3f2b;color:#ffffff;padding:14px 24px;text-decoration:none;font-weight:700;">Shop LuxeMia</a></p>
                <p style="margin:0 0 14px;font-size:14px;line-height:1.6;">We select premium Indian ethnic wear with a focus on product detail, quality, and attentive customer support. Questions? Reply to this email and we’ll be glad to help.</p>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#6b625d;">For customers with no prior LuxeMia purchase. One use per customer; cannot be combined with other discounts. Shipping is available to seven countries; rates and services are shown at checkout.</p>
              </div>
            </body>
          </html>`,
      }),
    });
  } catch {
    console.error(
      JSON.stringify({
        event: "welcome_email",
        status: "failed",
        failureType: "provider_unreachable",
      }),
    );
    return { status: "failed", providerReason: "provider_unreachable" };
  }

  const responseBody = await response.text();
  let providerId: string | null = null;
  try {
    const parsed = JSON.parse(responseBody) as { id?: unknown };
    providerId = typeof parsed.id === "string" ? parsed.id : null;
  } catch {
    // The HTTP status below controls non-JSON provider responses.
  }

  if (!response.ok) {
    const normalizedError = responseBody.toLowerCase();
    const providerReason = normalizedError.includes("api key is invalid")
      ? "invalid_api_key"
      : normalizedError.includes("only send testing emails")
        ? "testing_recipient_restricted"
        : normalizedError.includes("domain") &&
            normalizedError.includes("not verified")
          ? "domain_not_verified"
          : response.status === 429
            ? "provider_rate_limited"
            : "provider_rejected";

    console.error(
      JSON.stringify({
        event: "welcome_email",
        status: "failed",
        providerStatus: response.status,
        providerReason,
      }),
    );
    return {
      status: "failed",
      providerStatus: response.status,
      providerReason,
    };
  }

  console.log(
    JSON.stringify({
      event: "welcome_email",
      status: "accepted",
      providerStatus: response.status,
      providerId,
    }),
  );
  return { status: "accepted", providerId };
}

Deno.serve(async (req) => {
  if (!isAllowedOrigin(req.headers.get("origin"))) {
    return jsonResponse(req, { error: "Origin not allowed" }, 403);
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders(req) });
  }

  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method not allowed" }, 405, {
      Allow: "POST, OPTIONS",
    });
  }

  if (
    !req.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return jsonResponse(
      req,
      { error: "Content-Type must be application/json" },
      415,
    );
  }

  try {
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonResponse(req, { error: "Request body is too large" }, 413);
    }

    const payload = validatePayload(JSON.parse(rawBody));
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

    const { data: existing, error: lookupError } = await supabase
      .from("newsletter_subscribers")
      .select("welcome_email_sent_at")
      .eq("email", payload.email)
      .maybeSingle<{ welcome_email_sent_at: string | null }>();

    if (lookupError) throw lookupError;

    if (existing?.welcome_email_sent_at) {
      return jsonResponse(
        req,
        {
          success: true,
          duplicate: true,
          deliveryStatus: "accepted",
          discountCode: WELCOME_DISCOUNT_CODE,
          discountPercent: WELCOME_DISCOUNT_PERCENT,
          message: "You are already subscribed. Your welcome code is ready.",
        },
        200,
        { "X-RateLimit-Remaining": String(rateLimit.remaining) },
      );
    }

    const { error: saveError } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        {
          email: payload.email,
          source: payload.source,
          discount_code: WELCOME_DISCOUNT_CODE,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      );

    if (saveError) throw saveError;

    const delivery = await sendWelcomeEmail(payload.email);
    if (delivery.status !== "accepted") {
      return jsonResponse(
        req,
        {
          success: false,
          deliveryStatus: delivery.status,
          providerStatus:
            delivery.status === "failed"
              ? delivery.providerStatus || null
              : null,
          providerReason:
            delivery.status === "failed" ? delivery.providerReason : null,
          error: "We could not email your code just now. Please try again.",
        },
        503,
      );
    }

    const { error: deliveryUpdateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        welcome_email_sent_at: new Date().toISOString(),
        provider_message_id: delivery.providerId,
        updated_at: new Date().toISOString(),
      })
      .eq("email", payload.email);

    if (deliveryUpdateError) {
      console.error(
        JSON.stringify({
          event: "welcome_email_record_update",
          status: "failed",
        }),
      );
    }

    return jsonResponse(
      req,
      {
        success: true,
        duplicate: false,
        deliveryStatus: "accepted",
        discountCode: WELCOME_DISCOUNT_CODE,
        discountPercent: WELCOME_DISCOUNT_PERCENT,
        message: "Welcome email accepted for delivery",
      },
      200,
      { "X-RateLimit-Remaining": String(rateLimit.remaining) },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonResponse(req, { error: "Invalid JSON body" }, 400);
    }

    if (
      error instanceof Error &&
      /required|invalid|source|submission/i.test(error.message)
    ) {
      return jsonResponse(req, { error: error.message }, 400);
    }

    console.error("submit-email failed:", error);
    return jsonResponse(
      req,
      { error: "We could not process your signup. Please try again." },
      500,
    );
  }
});
