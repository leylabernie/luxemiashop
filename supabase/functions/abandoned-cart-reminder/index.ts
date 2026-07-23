import { createClient } from "npm:@supabase/supabase-js@2";

interface ResendEmailResponse {
  id: string;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const CRON_SECRET = Deno.env.get("CRON_SECRET");

const escapeHtml = (value: string): string => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

async function sendEmail(options: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}): Promise<ResendEmailResponse> {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
  
  return response.json();
}



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

interface AbandonedCart {
  id: string;
  email: string;
  cart_items: CartItem[];
  cart_total: number;
  currency: string;
  recovery_code: string;
  created_at: string;
}

const generateRecoveryCode = (): string => {
  return `RECOVER-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

const formatCartItemsHtml = (items: CartItem[], currency: string): string => {
  return items.map(item => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #e5e5e5;">
        ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" />` : ''}
      </td>
      <td style="padding: 16px; border-bottom: 1px solid #e5e5e5;">
        <p style="margin: 0; font-weight: 600; color: #1a1a1a;">${escapeHtml(item.title)}</p>
        ${item.variant ? `<p style="margin: 4px 0 0; color: #666; font-size: 14px;">${escapeHtml(item.variant)}</p>` : ''}
        <p style="margin: 4px 0 0; color: #666; font-size: 14px;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding: 16px; border-bottom: 1px solid #e5e5e5; text-align: right;">
        <p style="margin: 0; font-weight: 600; color: #1a1a1a;">$${(item.price * item.quantity).toFixed(2)}</p>
      </td>
    </tr>
  `).join('');
};

const generateEmailHtml = (cart: AbandonedCart): string => {
  const recoveryUrl = "https://luxemia.shop/collections?utm_source=abandoned_cart&utm_medium=email&utm_campaign=cart_reminder";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Purchase - LuxeMia</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);">
              <h1 style="margin: 0; color: #d4af37; font-size: 28px; font-weight: 300; letter-spacing: 4px;">LUXEMIA</h1>
              <p style="margin: 8px 0 0; color: #ccc; font-size: 12px; letter-spacing: 2px;">LUXURY ETHNIC WEAR</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 24px; font-weight: 600;">You left something beautiful behind...</h2>
              <p style="margin: 0 0 24px; color: #666; font-size: 16px; line-height: 1.6;">
                You recently saved items while browsing LuxeMia. Return to the collection to review availability and continue shopping.
              </p>
              
              <!-- Cart Items -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr>
                    <th style="padding: 12px 16px; background-color: #f9f9f9; text-align: left; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                    <th style="padding: 12px 16px; background-color: #f9f9f9; text-align: left; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Details</th>
                    <th style="padding: 12px 16px; background-color: #f9f9f9; text-align: right; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${formatCartItemsHtml(cart.cart_items, cart.currency)}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 16px; text-align: right; font-weight: 600; color: #1a1a1a;">Total:</td>
                    <td style="padding: 16px; text-align: right; font-weight: 700; font-size: 20px; color: #d4af37;">$${cart.cart_total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${recoveryUrl}" style="display: inline-block; padding: 16px 48px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 4px; letter-spacing: 1px;">RETURN TO LUXEMIA</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #999; font-size: 14px; text-align: center;">
                Product availability may change. Free shipping on orders over $350.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9f9f9; text-align: center;">
              <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Questions? Reply to this email or contact us at</p>
              <a href="mailto:hello@luxemia.shop" style="color: #d4af37; text-decoration: none;">hello@luxemia.shop</a>
              <p style="margin: 16px 0 0; color: #999; font-size: 12px;">
                © 2026 LuxeMia. Luxury Indian Ethnic Wear.<br>
                <a href="https://luxemia.shop/privacy" style="color: #999; text-decoration: underline;">Privacy Policy</a> | 
                <a href="https://luxemia.shop/terms" style="color: #999; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { action, email, cart_items, cart_total, user_id, recovery_code } = await req.json();
    
    console.log(`Processing abandoned cart action: ${action}`);

    if (action === "save_cart") {
      // Save or update abandoned cart
      const recoveryCode = generateRecoveryCode();
      
      const { data, error } = await supabase
        .from("abandoned_carts")
        .upsert({
          email,
          user_id: user_id || null,
          cart_items,
          cart_total,
          currency: "USD",
          recovery_code: recoveryCode,
          status: "pending",
          updated_at: new Date().toISOString()
        }, {
          onConflict: "email",
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving cart:", error);
        throw error;
      }

      console.log(`Cart saved for ${email} with code ${recoveryCode}`);
      
      return new Response(JSON.stringify({ success: true, recovery_code: recoveryCode }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (action === "send_reminders") {
      const authorization = req.headers.get("authorization");
      if (!CRON_SECRET || authorization !== `Bearer ${CRON_SECRET}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      // Find abandoned carts that need reminders (pending, older than 1 hour, not yet reminded)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      
      const { data: abandonedCarts, error: fetchError } = await supabase
        .from("abandoned_carts")
        .select("*")
        .eq("status", "pending")
        .lt("created_at", oneHourAgo)
        .gt("created_at", fortyEightHoursAgo)
        .is("reminder_sent_at", null);

      if (fetchError) {
        console.error("Error fetching abandoned carts:", fetchError);
        throw fetchError;
      }

      console.log(`Found ${abandonedCarts?.length || 0} carts to remind`);

      const results = [];
      
      for (const cart of abandonedCarts || []) {
        try {
          const emailResponse = await sendEmail({
            from: "LuxeMia <orders@luxemia.shop>",
            to: [cart.email],
            subject: "Your beautiful selections are waiting! ✨",
            html: generateEmailHtml(cart as AbandonedCart),
          });

          // Update cart status
          await supabase
            .from("abandoned_carts")
            .update({
              status: "reminded",
              reminder_sent_at: new Date().toISOString()
            })
            .eq("id", cart.id);

          console.log(`Reminder sent to ${cart.email}`);
          results.push({ email: cart.email, success: true });
        } catch (emailError: unknown) {
          const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
          console.error(`Failed to send reminder to ${cart.email}:`, emailError);
          results.push({ email: cart.email, success: false, error: errorMessage });
        }
      }

      return new Response(JSON.stringify({ success: true, results }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (action === "mark_recovered") {
      if (!recovery_code || typeof recovery_code !== "string") {
        return new Response(JSON.stringify({ error: "Recovery code is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      const { error } = await supabase
        .from("abandoned_carts")
        .update({
          status: "recovered",
          recovered_at: new Date().toISOString()
        })
        .eq("recovery_code", recovery_code);

      if (error) throw error;

      console.log(`Cart recovered with code ${recovery_code}`);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in abandoned-cart-reminder:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

Deno.serve(handler);
