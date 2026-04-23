import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userImage, garmentImage, garmentTitle, garmentType, sareeImage, sareeTitle } = await req.json();
    
    // Support both old API (sareeImage/sareeTitle) and new API (garmentImage/garmentTitle/garmentType)
    const actualGarmentImage = garmentImage || sareeImage;
    const actualGarmentTitle = garmentTitle || sareeTitle;
    const actualGarmentType = garmentType || "saree";
    
    if (!userImage || !actualGarmentImage) {
      return new Response(
        JSON.stringify({ error: "Both user image and garment image are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing virtual try-on request for:", actualGarmentTitle, "type:", actualGarmentType);

    // Build garment-specific prompt
    let drapingInstructions = "";
    switch (actualGarmentType) {
      case "lehenga":
        drapingInstructions = "The lehenga should include the skirt (lehenga), blouse (choli), and dupatta. The skirt should be properly fitted at the waist with natural volume and flare. The blouse should fit naturally on the upper body. The dupatta should be elegantly draped across one shoulder or around the body as traditionally worn.";
        break;
      case "suit":
        drapingInstructions = "The suit should include the kameez (tunic), bottom (churidar/palazzo/sharara), and dupatta. The kameez should drape naturally over the body following its silhouette. The bottom should be styled appropriately based on the design. The dupatta should be elegantly arranged around the neck or draped on shoulders.";
        break;
      default: // saree
        drapingInstructions = "The saree should be naturally worn with proper pleating at the waist and pallu (decorative end) draped elegantly over the shoulder. The blouse should fit naturally. The pleats should fall gracefully and the fabric should drape realistically around the body.";
    }

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
                text: `You are a virtual fashion try-on assistant specializing in Indian ethnic wear. Take the person from the first image and dress them in the ${actualGarmentType} from the second image called "${actualGarmentTitle}". 

${drapingInstructions}

Create a realistic photorealistic image of the person wearing this exact ${actualGarmentType}. Maintain the person's face, body proportions, and pose while seamlessly styling the garment on them. Keep the lighting consistent and make the final result look like a professional fashion photo. Do not add any text or watermarks.`
              },
              {
                type: "image_url",
                image_url: { url: userImage }
              },
              {
                type: "image_url",
                image_url: { url: actualGarmentImage }
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
