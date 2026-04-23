import { createClient } from "npm:@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validate JWT and return user claims
const validateAuth = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data?.user) {
    return { error: 'Unauthorized', status: 401 };
  }

  return { user: data.user };
};

const SHOPIFY_STORE_DOMAIN = "lovable-project-zlh0w.myshopify.com";

// Helper to trigger tracking notification in background
const triggerTrackingNotification = async (orderData: {
  orderId: string;
  orderName: string;
  customerEmail: string;
  orderTotal?: string;
  currency?: string;
}) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    await supabase.functions.invoke("send-tracking-notification", {
      body: orderData,
    });
    console.log(`Tracking notification triggered for order ${orderData.orderName}`);
  } catch (error) {
    console.error("Failed to trigger tracking notification:", error);
  }
};
const SHOPIFY_API_VERSION = "2025-07";

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

  try {
    // Validate authentication
    const authResult = await validateAuth(req);
    if ('error' in authResult) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: authResult.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { orderNumber, email } = await req.json();

    if (!orderNumber || !email) {
      return new Response(
        JSON.stringify({ error: "Order number and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (!accessToken) {
      console.error("SHOPIFY_ACCESS_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query,
          variables: {
            query: `name:${orderNumber}`,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shopify API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
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
    
    // Verify email matches (case-insensitive)
    // Use same response as "order not found" to prevent email enumeration
    if (order.email?.toLowerCase() !== email.toLowerCase()) {
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
      lineItems: order.lineItems?.edges?.map((edge: any) => ({
        title: edge.node.title,
        quantity: edge.node.quantity,
        image: edge.node.variant?.image?.url,
        price: edge.node.originalUnitPriceSet?.shopMoney,
      })) || [],
      fulfillments: order.fulfillments?.map((f: any) => ({
        status: f.status,
        createdAt: f.createdAt,
        tracking: f.trackingInfo?.[0] || null,
      })) || [],
    };

    // Trigger tracking notification in background (don't await)
    EdgeRuntime.waitUntil(
      triggerTrackingNotification({
        orderId: order.id,
        orderName: order.name,
        customerEmail: order.email,
        orderTotal: order.totalPriceSet?.shopMoney?.amount,
        currency: order.totalPriceSet?.shopMoney?.currencyCode,
      })
    );

    return new Response(
      JSON.stringify({ order: sanitizedOrder }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});