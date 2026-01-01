import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Luxemia <onboarding@resend.dev>",
      html: html,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
  
  return response.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic, x-shopify-shop-domain",
};

interface ShopifyOrder {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  currency: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
  line_items: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
  fulfillments?: Array<{
    status: string;
    tracking_number: string | null;
    tracking_url: string | null;
  }>;
  shipping_address?: {
    city: string;
    province: string;
    country: string;
  };
}

const getStatusMessage = (topic: string, order: ShopifyOrder): { subject: string; heading: string; message: string } => {
  const orderName = order.name || `#${order.id}`;
  
  switch (topic) {
    case 'orders/create':
      return {
        subject: `Order Confirmed - ${orderName}`,
        heading: 'Thank you for your order!',
        message: `Your order ${orderName} has been received and is being processed.`,
      };
    case 'orders/paid':
      return {
        subject: `Payment Received - ${orderName}`,
        heading: 'Payment Confirmed',
        message: `We've received payment for your order ${orderName}. We'll start preparing it shortly.`,
      };
    case 'orders/fulfilled': {
      const tracking = order.fulfillments?.[0];
      const trackingInfo = tracking?.tracking_number 
        ? `<p style="margin: 16px 0;"><strong>Tracking Number:</strong> ${tracking.tracking_number}</p>` 
        : '';
      const trackingLink = tracking?.tracking_url 
        ? `<p><a href="${tracking.tracking_url}" style="color: #2754C5;">Track your package</a></p>` 
        : '';
      return {
        subject: `Order Shipped - ${orderName}`,
        heading: 'Your order is on its way!',
        message: `Great news! Your order ${orderName} has been shipped.${trackingInfo}${trackingLink}`,
      };
    }
    case 'orders/cancelled':
      return {
        subject: `Order Cancelled - ${orderName}`,
        heading: 'Order Cancelled',
        message: `Your order ${orderName} has been cancelled. If you have any questions, please contact our support team.`,
      };
    case 'orders/updated':
      return {
        subject: `Order Updated - ${orderName}`,
        heading: 'Order Update',
        message: `Your order ${orderName} has been updated. Current status: ${order.fulfillment_status || 'Processing'}.`,
      };
    case 'fulfillments/create':
    case 'fulfillments/update': {
      const fulfillment = order.fulfillments?.[0];
      return {
        subject: `Shipment Update - ${orderName}`,
        heading: 'Shipment Update',
        message: `There's an update on your shipment for order ${orderName}. Status: ${fulfillment?.status || 'In Progress'}.`,
      };
    }
    default:
      return {
        subject: `Order Update - ${orderName}`,
        heading: 'Order Update',
        message: `There's an update on your order ${orderName}.`,
      };
  }
};

const generateEmailHtml = (
  customerName: string,
  heading: string,
  message: string,
  order: ShopifyOrder
): string => {
  const itemsHtml = order.line_items
    .map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
          ${item.title}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">
          ${order.currency} ${item.price}
        </td>
      </tr>
    `)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0;">Luxemia</h1>
      </div>
      
      <div style="background: #FCF8F8; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
        <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin: 0 0 16px 0;">${heading}</h2>
        <p style="margin: 0; color: #444;">Dear ${customerName},</p>
        <p style="margin: 16px 0 0 0; color: #444;">${message}</p>
      </div>
      
      <div style="background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h3 style="font-size: 16px; margin: 0 0 16px 0; color: #1a1a1a;">Order Details</h3>
        <p style="margin: 0 0 8px 0; color: #666;"><strong>Order:</strong> ${order.name || `#${order.id}`}</p>
        <p style="margin: 0 0 16px 0; color: #666;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 12px 0; border-bottom: 2px solid #eee; color: #666; font-weight: 600;">Item</th>
              <th style="text-align: center; padding: 12px 0; border-bottom: 2px solid #eee; color: #666; font-weight: 600;">Qty</th>
              <th style="text-align: right; padding: 12px 0; border-bottom: 2px solid #eee; color: #666; font-weight: 600;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 16px 0; text-align: right; font-weight: 600;">Total:</td>
              <td style="padding: 16px 0; text-align: right; font-weight: 600; font-size: 18px;">${order.currency} ${order.total_price}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div style="text-align: center; color: #888; font-size: 14px;">
        <p style="margin: 0 0 8px 0;">Thank you for shopping with Luxemia</p>
        <p style="margin: 0;">Questions? Contact us at support@luxemia.shop</p>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const topic = req.headers.get("x-shopify-topic") || "orders/updated";
    console.log(`Received Shopify webhook: ${topic}`);

    const order: ShopifyOrder = await req.json();
    console.log(`Processing order: ${order.name || order.id}`);

    // Get customer email
    const customerEmail = order.email || order.customer?.email;
    if (!customerEmail) {
      console.log("No customer email found, skipping notification");
      return new Response(JSON.stringify({ success: true, skipped: "no email" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerName = order.customer 
      ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || 'Valued Customer'
      : 'Valued Customer';

    // Generate email content based on the webhook topic
    const { subject, heading, message } = getStatusMessage(topic, order);
    const html = generateEmailHtml(customerName, heading, message, order);

    console.log(`Sending email to ${customerEmail}: ${subject}`);

    // Send email via Resend
    const emailResponse = await sendEmail(customerEmail, subject, html);

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
