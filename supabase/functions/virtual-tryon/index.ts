import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userImage, sareeImage, sareeTitle } = await req.json();
    
    if (!userImage || !sareeImage) {
      return new Response(
        JSON.stringify({ error: "Both user image and saree image are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing virtual try-on request for:", sareeTitle);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a virtual fashion try-on assistant. Take the person from the first image and dress them in the saree from the second image called "${sareeTitle}". 
                
Create a realistic photorealistic image of the person wearing this exact saree. Maintain the person's face, body proportions, and pose while seamlessly draping the saree on them. The saree should look naturally worn with proper pleating and draping. Keep the lighting consistent and make the final result look like a professional fashion photo. Do not add any text or watermarks.`
              },
              {
                type: "image_url",
                image_url: { url: userImage }
              },
              {
                type: "image_url",
                image_url: { url: sareeImage }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received successfully");
    
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const responseText = data.choices?.[0]?.message?.content || "";

    if (!generatedImage) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Failed to generate try-on image. Please try a different photo." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        image: generatedImage,
        message: responseText
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Virtual try-on error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
