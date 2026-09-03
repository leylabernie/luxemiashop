import { createClient, type User } from "npm:@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

const MAX_BODY_BYTES = 8 * 1024;
const AUTH_RATE_LIMIT = 20;
const AUTH_RATE_WINDOW_MS = 60 * 1000;
const MAX_RATE_LIMIT_ENTRIES = 5000;
const authRateLimits = new Map<string, { count: number; resetAt: number }>();

interface ShopifyLineItemEdge {
  node: {
    title: string;
    quantity: number;
    variant?: { image?: { url: string } | null } | null;
    originalUnitPriceSet?: {
      shopMoney?: { amount: string; currencyCode: string } | null;
    } | null;
  };
}

interface ShopifyFulfillment {
  status: string;
  createdAt: string;
  trackingInfo?: Array<{ number: string; url: string }> | null;
}

function safeHttpsUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function sanitizeTracking(value: ShopifyFulfillment['trackingInfo']): { number: string; url: string | null } | null {
  const first = value?.[0];
  if (!first) return null;
  const number = typeof first.number === 'string' ? first.number.slice(0, 256) : '';
  const url = safeHttpsUrl(first.url);
  return number || url ? { number, url } : null;
}

type AuthResult = { user: User } | { error: string; status: number };

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const existing = authRateLimits.get(userId);
  if (!existing || now > existing.resetAt) {
    if (authRateLimits.size >= MAX_RATE_LIMIT_ENTRIES) {
      for (const [key, value] of authRateLimits) {
        if (now > value.resetAt) authRateLimits.delete(key);
      }
      if (authRateLimits.size >= MAX_RATE_LIMIT_ENTRIES) {
        const oldestKey = authRateLimits.keys().next().value;
        if (oldestKey) authRateLimits.delete(oldestKey);
      }
    }
    authRateLimits.set(userId, { count: 1, resetAt: now + AUTH_RATE_WINDOW_MS });
    return false;
  }
  if (existing.count >= AUTH_RATE_LIMIT) return true;
  existing.count += 1;
  return false;
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

// Validate the user JWT in code as well as at the platform gateway.
const validateAuth = async (req: Request): Promise<AuthResult> => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: 'Service temporarily unavailable', status: 503 };
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return { error: 'Unauthorized', status: 401 };
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data?.user) {
    return { error: 'Unauthorized', status: 401 };
  }

  return { user: data.user };
};

const SHOPIFY_STORE_DOMAIN = "lovable-project-zlh0w.myshopify.com";

const SHOPIFY_API_VERSION = "2025-10";

// Helper function to return a generic "not found" response with random delay
// This prevents timing attacks that could reveal valid order numbers
const notFoundResponse = async () => {
  // Add random delay between 50-150ms to prevent timing analysis
  const delay = Math.floor(Math.random() * 100) + 50;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return new Response(
    JSON.stringify({ error: "Order not found" }),
    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  try {
    // Validate authentication
    const authResult = await validateAuth(req);
    if ('error' in authResult) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: authResult.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (isRateLimited(authResult.user.id)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" },
      });
    }

    const bodyResult = await readBoundedBody(req);
    if (bodyResult.tooLarge) {
      return new Response(JSON.stringify({ error: "Request body is too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let requestBody: Record<string, unknown>;
    try {
      const parsed = JSON.parse(bodyResult.text || '');
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid body');
      requestBody = parsed as Record<string, unknown>;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { orderNumber, email } = requestBody;

    if (
      typeof orderNumber !== "string"
      || !/^#?[A-Za-z0-9-]{1,40}$/.test(orderNumber.trim())
      || typeof email !== "string"
      || email.length > 255
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return new Response(
        JSON.stringify({ error: "A valid order number and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOrderNumber = orderNumber.trim().replace(/^#/, '').toLowerCase();
    if (
      !authResult.user.email
      || !authResult.user.email_confirmed_at
      || authResult.user.email.trim().toLowerCase() !== normalizedEmail
    ) {
      return await notFoundResponse();
    }

    const accessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (!accessToken) {
      console.error("SHOPIFY_ACCESS_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Query Shopify Admin API for orders
    const query = `
      query getOrderByNumber($query: String!) {
        orders(first: 1, query: $query) {
          edges {
            node {
              id
              name
              email
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              shippingAddress {
                city
                province
                country
              }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      image {
                        url
                      }
                    }
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
              fulfillments {
                trackingInfo {
                  number
                  url
                }
                status
                createdAt
              }
            }
          }
        }
      }
    `;

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        signal: AbortSignal.timeout(8000),
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query,
          variables: {
            query: `name:${orderNumber.trim()}`,
          },
        }),
      }
    );

    if (!response.ok) {
      response.body?.cancel();
      console.error("Shopify API request failed with status", response.status);
      return new Response(
        JSON.stringify({ error: "Failed to fetch order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error("Shopify GraphQL returned an error response");
      return new Response(
        JSON.stringify({ error: "Failed to query orders" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orders = data.data?.orders?.edges || [];
    
    // Use same response for both "order not found" and "email mismatch"
    // to prevent enumeration attacks
    if (orders.length === 0) {
      return await notFoundResponse();
    }

    const order = orders[0].node;

    const returnedOrderNumber = typeof order.name === 'string'
      ? order.name.trim().replace(/^#/, '').toLowerCase()
      : '';
    if (!returnedOrderNumber || returnedOrderNumber !== normalizedOrderNumber) {
      return await notFoundResponse();
    }
    
    // Verify email matches (case-insensitive)
    // Use same response as "order not found" to prevent email enumeration
    if (order.email?.trim().toLowerCase() !== normalizedEmail) {
      return await notFoundResponse();
    }

    // Return sanitized order data
    const sanitizedOrder = {
      id: order.id,
      name: order.name,
      createdAt: order.createdAt,
      financialStatus: order.displayFinancialStatus,
      fulfillmentStatus: order.displayFulfillmentStatus,
      total: order.totalPriceSet?.shopMoney,
      shippingAddress: order.shippingAddress ? {
        city: order.shippingAddress.city,
        province: order.shippingAddress.province,
        country: order.shippingAddress.country,
      } : null,
      lineItems: order.lineItems?.edges?.map((edge: ShopifyLineItemEdge) => ({
        title: edge.node.title,
        quantity: edge.node.quantity,
        image: safeHttpsUrl(edge.node.variant?.image?.url),
        price: edge.node.originalUnitPriceSet?.shopMoney,
      })) || [],
      fulfillments: order.fulfillments?.map((f: ShopifyFulfillment) => ({
        status: f.status,
        createdAt: f.createdAt,
        tracking: sanitizeTracking(f.trackingInfo),
      })) || [],
    };

    return new Response(
      JSON.stringify({ order: sanitizedOrder }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    console.error("Unexpected get-order failure");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
