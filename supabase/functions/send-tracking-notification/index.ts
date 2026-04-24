import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmailViaResend(options: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}): Promise<{ id: string }> {
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

const STORE_OWNER_EMAIL = "orders@example.com"; // Update this to your actual store email

interface TrackingNotificationRequest {
  orderId: string;
  orderName: string;
  customerEmail: string;
  customerName?: string;
  orderTotal?: string;
  currency?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, orderName, customerEmail, customerName, orderTotal, currency } = 
      await req.json() as TrackingNotificationRequest;

    console.log(`Processing tracking notification for order ${orderName}`);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we've already sent a notification for this order
    const { data: existingNotification } = await supabase
      .from("order_tracking_notifications")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existingNotification) {
      console.log(`Notification already sent for order ${orderName}`);
      return new Response(
        JSON.stringify({ success: true, alreadyNotified: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if RESEND_API_KEY is configured
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const displayName = customerName || "Valued Customer";
    const totalDisplay = orderTotal && currency ? `${currency} ${orderTotal}` : "";

    // Send email to customer
    const customerEmailResult = await sendEmailViaResend({
      from: "Kanchan Fashion <orders@kanchanfashion.com>",
      to: [customerEmail],
      subject: `Order ${orderName} - Tracking Viewed`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f4f0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
              <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%);">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">KANCHAN FASHION</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #2c1810; margin: 0 0 20px; font-size: 22px; font-weight: 400;">Hello ${displayName},</h2>
                <p style="color: #5a4a42; line-height: 1.8; margin: 0 0 20px;">
                  Thank you for checking the status of your order. We're delighted to keep you informed about your purchase.
                </p>
                <table width="100%" cellpadding="15" style="background-color: #faf8f5; border-radius: 8px; margin: 25px 0;">
                  <tr>
                    <td>
                      <p style="margin: 0; color: #8B4513; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                      <p style="margin: 5px 0 0; color: #2c1810; font-size: 18px; font-weight: 500;">${orderName}</p>
                      ${totalDisplay ? `
                        <p style="margin: 15px 0 0; color: #8B4513; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Order Total</p>
                        <p style="margin: 5px 0 0; color: #2c1810; font-size: 18px; font-weight: 500;">${totalDisplay}</p>
                      ` : ''}
                    </td>
                  </tr>
                </table>
                <p style="color: #5a4a42; line-height: 1.8; margin: 0 0 20px;">
                  You can track your order status anytime by visiting our website. If you have any questions, our customer service team is always here to help.
                </p>
                <p style="color: #5a4a42; line-height: 1.8; margin: 25px 0 0;">
                  With warm regards,<br>
                  <strong style="color: #2c1810;">The Kanchan Fashion Team</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 25px 30px; background-color: #2c1810; text-align: center;">
                <p style="color: #d4a574; margin: 0; font-size: 12px;">
                  © ${new Date().getFullYear()} Kanchan Fashion. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Customer email sent:", customerEmailResult);

    // Send email to store owner
    const ownerEmailResult = await sendEmailViaResend({
      from: "Kanchan Fashion <orders@kanchanfashion.com>",
      to: [STORE_OWNER_EMAIL],
      subject: `📦 Order Tracked: ${orderName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 25px; border-bottom: 2px solid #8B4513;">
                <h2 style="margin: 0; color: #2c1810;">Order Tracking Alert</h2>
              </td>
            </tr>
            <tr>
              <td style="padding: 25px;">
                <p style="margin: 0 0 15px; color: #333;">A customer has just tracked their order:</p>
                <table width="100%" cellpadding="10" style="background-color: #f9f9f9; border-radius: 4px;">
                  <tr>
                    <td style="color: #666; font-weight: bold;">Order:</td>
                    <td style="color: #333;">${orderName}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-weight: bold;">Customer:</td>
                    <td style="color: #333;">${displayName}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-weight: bold;">Email:</td>
                    <td style="color: #333;">${customerEmail}</td>
                  </tr>
                  ${totalDisplay ? `
                    <tr>
                      <td style="color: #666; font-weight: bold;">Total:</td>
                      <td style="color: #333;">${totalDisplay}</td>
                    </tr>
                  ` : ''}
                  <tr>
                    <td style="color: #666; font-weight: bold;">Tracked At:</td>
                    <td style="color: #333;">${new Date().toLocaleString()}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Store owner email sent:", ownerEmailResult);

    // Record the notification in the database
    const { error: insertError } = await supabase
      .from("order_tracking_notifications")
      .insert({
        order_id: orderId,
        order_name: orderName,
        customer_email: customerEmail,
      });

    if (insertError) {
      console.error("Failed to record notification:", insertError);
      // Don't fail the request, emails were already sent
    }

    return new Response(
      JSON.stringify({ success: true, alreadyNotified: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending tracking notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send notification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
