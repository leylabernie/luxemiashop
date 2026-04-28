import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';

// SEO-optimized product updates for the 4 new salwar suits
const PRODUCT_UPDATES: Record<string, {
  title: string;
  body_html: string;
  product_type: string;
  tags: string[];
  variants: Array<{
    option1: string;
    price: string;
    compare_at_price: string;
    sku: string;
    inventory_management: string | null;
  }>;
  options: Array<{ name: string; values: string[] }>;
  metafields: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
}> = {
  // Product 1: Olive Green Cotton Festive Salwar Suit
  "8749330890923": {
    title: "Olive Green Cotton Hand Embroidered Festive Salwar Kameez for Women",
    body_html: `<p><strong>Embrace effortless sophistication</strong> with this olive green cotton salwar kameez, hand-embroidered with intricate threadwork that celebrates India's rich artisan heritage. Designed for the modern woman who carries tradition with quiet confidence, this suit is your go-to for festive gatherings, Diwali dinners, and daytime Eid celebrations.</p>

<h3>Why You'll Love This Suit</h3>
<ul>
<li><strong>Fabric:</strong> Premium cotton with a natural crispness that holds its shape through every celebration — breathable, soft against the skin, and endlessly comfortable even during long events</li>
<li><strong>Colour:</strong> A rich olive green that flatters warm and cool skin tones alike, and photographs beautifully in both natural daylight and evening lighting</li>
<li><strong>Embroidery:</strong> Delicate hand-embroidered threadwork by skilled artisans — each piece carries subtle irregularities that make it truly one-of-a-kind</li>
<li><strong>Occasion:</strong> Perfect for Diwali parties, Eid lunch, family gatherings, mehndi ceremonies, and festive brunches</li>
<li><strong>Dupatta:</strong> Lightweight cotton mul dupatta with crochet lace border — sheer, airy, and elegant</li>
</ul>

<h3>Styling Suggestions</h3>
<p>Style this olive stunner with antique gold jhumkas and nude heels for an understated festive look. Add a statement clutch and embroidered mojaris for a wedding guest appearance that turns heads. For a contemporary twist, pair with block-heel mules and a sleek low bun.</p>

<h3>Frequently Asked Questions</h3>
<p><strong>What accessories go best with an olive green salwar suit?</strong><br/>Olive green pairs beautifully with antique gold, copper, and bronze-toned jewellery. Kundan and temple jewellery create a traditional look, while rose gold adds a contemporary edge. Avoid silver — it can create a cold, flat combination with olive. A metallic clutch in champagne or soft gold adds the perfect finishing touch.</p>

<p><strong>Is this salwar suit suitable for summer weddings?</strong><br/>Absolutely. The premium cotton fabric is naturally breathable and lightweight, making it ideal for outdoor summer weddings and warm-weather celebrations. The hand embroidery adds festive elegance without the heaviness of silk or brocade alternatives.</p>

<p><strong>How do I care for hand-embroidered cotton suits?</strong><br/>We recommend dry cleaning for the first few washes to preserve the hand embroidery and crochet lace details. For home care, hand wash in cold water with mild detergent and air dry in shade. Avoid wringing or machine drying to maintain the fabric's natural drape and embroidery integrity.</p>

<h3>The LuxeMia Promise</h3>
<p>Every LuxeMia piece is hand-selected for quality, craftsmanship, and enduring style. We believe that exceptional ethnic wear shouldn't require a luxury budget — just a discerning eye. This suit represents our commitment to bringing you curated, boutique-quality Indian fashion that feels as good as it looks.</p>`,
    product_type: "Salwar Kameez",
    tags: [
      "salwar kameez", "olive green salwar suit", "cotton salwar kameez", "hand embroidered salwar suit",
      "festive salwar suit", "Diwali outfit", "Eid salwar suit", "Indian ethnic wear women",
      "salwar suit online USA", "boutique salwar kameez", "cotton festive wear women",
      "traditional Indian suit", "readymade salwar kameez", "women salwar suit",
      "olive green ethnic wear", "hand embroidery cotton suit", "LuxeMia",
      "gender:female", "women", "womenswear", "new arrival"
    ],
    variants: [
      { option1: "S", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-OLV-001-S", inventory_management: null },
      { option1: "M", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-OLV-001-M", inventory_management: null },
      { option1: "L", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-OLV-001-L", inventory_management: null },
      { option1: "XL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-OLV-001-XL", inventory_management: null },
      { option1: "XXL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-OLV-001-XXL", inventory_management: null },
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL", "XXL"] }],
    metafields: [
      { namespace: "custom", key: "occasion", value: "Festive, Diwali, Eid, Mehndi", type: "single_line_text_field" },
      { namespace: "custom", key: "fabric", value: "Cotton", type: "single_line_text_field" },
      { namespace: "custom", key: "color", value: "Olive Green", type: "single_line_text_field" },
      { namespace: "custom", key: "work", value: "Hand Embroidered", type: "single_line_text_field" },
      { namespace: "custom", key: "gender", value: "Women", type: "single_line_text_field" },
    ]
  },

  // Product 2: Warm Beige Cotton Festival Salwar Suit
  "8749330923691": {
    title: "Warm Beige Cotton Hand Embroidered Festival Salwar Kameez for Women",
    body_html: `<p><strong>Understated elegance meets timeless craftsmanship</strong> in this warm beige cotton salwar kameez — a piece that feels like it was made just for your most cherished occasions. Whether you're attending a mehndi ceremony or a festive family brunch, this suit delivers the perfect balance of tradition, comfort, and contemporary style.</p>

<h3>Why You'll Love This Suit</h3>
<ul>
<li><strong>Fabric:</strong> Premium cotton woven from the finest fibres, carrying the legacy of India's cotton heritage — soft, breathable, and endlessly comfortable through long celebrations</li>
<li><strong>Colour:</strong> A warm beige tone that is universally flattering and incredibly versatile — pairs effortlessly with gold, rose gold, or bold contrasting jewellery</li>
<li><strong>Embroidery:</strong> Delicate hand-embroidered threadwork by skilled artisans — the subtle irregularities of hand craftsmanship make each piece unique and irreplaceable</li>
<li><strong>Occasion:</strong> Perfect for mehndi ceremonies, festive brunches, cultural celebrations, puja gatherings, and milestone family events</li>
<li><strong>Dupatta:</strong> Lightweight cotton mul dupatta with crochet lace border — adds elegance without weight</li>
</ul>

<h3>Styling Suggestions</h3>
<p>This warm beige beauty shines with rose gold jewellery and soft pink accents — think dusty rose dupatta swap or blush-toned heels. For evening events, deepen the look with emerald green statement earrings and an embroidered potli bag. Metallic footwear in gold or copper always elevates beige beautifully.</p>

<h3>Frequently Asked Questions</h3>
<p><strong>What is the best way to style a beige salwar suit?</strong><br/>Beige is incredibly versatile. For daytime events, pair with rose gold or pearl jewellery and nude makeup. For evening occasions, contrast with deeper tones — emerald jewellery, a burgundy dupatta, or ruby accents create a stunning, sophisticated palette. Metallic footwear in gold or copper always elevates beige beautifully.</p>

<p><strong>Does the cotton fabric require ironing?</strong><br/>Premium cotton has a beautiful natural drape that may need light ironing after washing to restore its crisp finish. We recommend ironing on medium heat while the fabric is slightly damp for best results. The hand embroidery should be ironed on the reverse side to protect the delicate threadwork.</p>

<p><strong>What makes hand embroidery different from machine embroidery?</strong><br/>Hand embroidery carries the subtle irregularities and unique character of artisan craftsmanship — no two pieces are identical. The stitches have a depth and texture that machine embroidery cannot replicate. At LuxeMia, we celebrate this human touch as part of what makes each piece truly one-of-a-kind.</p>

<h3>The LuxeMia Promise</h3>
<p>Every LuxeMia piece is hand-selected for quality, craftsmanship, and enduring style. We believe that exceptional ethnic wear shouldn't require a luxury budget — just a discerning eye. This suit represents our commitment to bringing you curated, boutique-quality Indian fashion that feels as good as it looks.</p>`,
    product_type: "Salwar Kameez",
    tags: [
      "salwar kameez", "beige salwar suit", "cotton salwar kameez", "hand embroidered salwar suit",
      "festival salwar suit", "mehndi outfit", "festive wear women", "Indian ethnic wear women",
      "salwar suit online USA", "boutique salwar kameez", "beige cotton suit",
      "traditional Indian suit", "readymade salwar kameez", "women salwar suit",
      "beige ethnic wear", "hand embroidery cotton suit", "LuxeMia",
      "gender:female", "women", "womenswear", "new arrival"
    ],
    variants: [
      { option1: "S", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-BGE-002-S", inventory_management: null },
      { option1: "M", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-BGE-002-M", inventory_management: null },
      { option1: "L", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-BGE-002-L", inventory_management: null },
      { option1: "XL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-BGE-002-XL", inventory_management: null },
      { option1: "XXL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-BGE-002-XXL", inventory_management: null },
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL", "XXL"] }],
    metafields: [
      { namespace: "custom", key: "occasion", value: "Festival, Mehndi, Puja, Cultural", type: "single_line_text_field" },
      { namespace: "custom", key: "fabric", value: "Cotton", type: "single_line_text_field" },
      { namespace: "custom", key: "color", value: "Warm Beige", type: "single_line_text_field" },
      { namespace: "custom", key: "work", value: "Hand Embroidered", type: "single_line_text_field" },
      { namespace: "custom", key: "gender", value: "Women", type: "single_line_text_field" },
    ]
  },

  // Product 3: Dusty Pink Cotton Eid Wear Salwar Suit
  "8749330989227": {
    title: "Dusty Pink Cotton Hand Embroidered Eid Salwar Kameez for Women",
    body_html: `<p><strong>Romance and refinement come together</strong> in a hue that flatters every skin tone and photographs like a dream. This dusty pink cotton salwar kameez is crafted for Eid celebrations, intimate soirées, and every moment that calls for effortless elegance. The hand-embroidered threadwork adds artisan character that machine stitching simply cannot replicate.</p>

<h3>Why You'll Love This Suit</h3>
<ul>
<li><strong>Fabric:</strong> Premium cotton carefully selected for its exceptional softness and ability to hold rich, complex dyes like this dusty pink — breathes with you through long celebrations while keeping you polished</li>
<li><strong>Colour:</strong> A muted, warm dusty pink that is universally flattering across fair, medium, and deep skin tones — sophisticated without being overpowering</li>
<li><strong>Embroidery:</strong> Delicate hand-embroidered threadwork — each stitch carries the character and depth of artisan craftsmanship</li>
<li><strong>Occasion:</strong> Designed for Eid celebrations, engagement parties, family gatherings, and intimate festive events</li>
<li><strong>Dupatta:</strong> Lightweight cotton mul dupatta with crochet lace border — airy, elegant, and perfectly draped</li>
</ul>

<h3>Styling Suggestions</h3>
<p>This dusty pink dream pairs exquisitely with silver or white pearl jewellery — layer delicate necklaces or go bold with chandbali earrings. White or silver heels complete the look, and a soft ivory clutch adds the perfect touch of refined contrast. For a bolder statement, pair with gold temple jewellery and a deep berry lip.</p>

<h3>Frequently Asked Questions</h3>
<p><strong>Is dusty pink suitable for all skin tones?</strong><br/>Dusty pink is universally flattering. Its muted, warm undertone complements fair, medium, and deep skin tones beautifully. Unlike brighter pinks that can overwhelm, this sophisticated shade adds a natural flush of colour that enhances your complexion without competing with it.</p>

<p><strong>Can I wear this for a daytime event?</strong><br/>This piece is perfectly suited for daytime celebrations. The lightweight cotton keeps you comfortable in natural light and warmer temperatures, while the hand embroidery provides enough embellishment to feel special without being overly formal. The dusty pink shade is particularly lovely in natural daylight.</p>

<p><strong>What is a cotton mul dupatta?</strong><br/>Cotton mul (also spelled 'mull') is an ultra-fine, lightweight cotton fabric known for its sheer, airy quality. It drapes beautifully and is often used for dupattas because it adds elegance without weight. The crochet lace border on this dupatta adds a delicate, feminine finish that elevates the entire ensemble.</p>

<h3>The LuxeMia Promise</h3>
<p>Every LuxeMia piece is hand-selected for quality, craftsmanship, and enduring style. We believe that exceptional ethnic wear shouldn't require a luxury budget — just a discerning eye. This suit represents our commitment to bringing you curated, boutique-quality Indian fashion that feels as good as it looks.</p>`,
    product_type: "Salwar Kameez",
    tags: [
      "salwar kameez", "dusty pink salwar suit", "cotton salwar kameez", "hand embroidered salwar suit",
      "Eid salwar suit", "Eid outfit women", "pink salwar kameez", "Indian ethnic wear women",
      "salwar suit online USA", "boutique salwar kameez", "pink cotton suit",
      "traditional Indian suit", "readymade salwar kameez", "women salwar suit",
      "dusty pink ethnic wear", "hand embroidery cotton suit", "LuxeMia",
      "gender:female", "women", "womenswear", "new arrival"
    ],
    variants: [
      { option1: "S", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-PNK-003-S", inventory_management: null },
      { option1: "M", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-PNK-003-M", inventory_management: null },
      { option1: "L", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-PNK-003-L", inventory_management: null },
      { option1: "XL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-PNK-003-XL", inventory_management: null },
      { option1: "XXL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-PNK-003-XXL", inventory_management: null },
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL", "XXL"] }],
    metafields: [
      { namespace: "custom", key: "occasion", value: "Eid, Engagement, Family Gathering, Festive", type: "single_line_text_field" },
      { namespace: "custom", key: "fabric", value: "Cotton", type: "single_line_text_field" },
      { namespace: "custom", key: "color", value: "Dusty Pink", type: "single_line_text_field" },
      { namespace: "custom", key: "work", value: "Hand Embroidered", type: "single_line_text_field" },
      { namespace: "custom", key: "gender", value: "Women", type: "single_line_text_field" },
    ]
  },

  // Product 4: Teal Green Cotton Party Wear Salwar Suit
  "8749331054763": {
    title: "Teal Green Cotton Hand Embroidered Party Wear Salwar Kameez for Women",
    body_html: `<p><strong>A striking balance of tradition and modern edge,</strong> designed for the woman who commands attention simply by being herself. This teal green cotton salwar kameez delivers bold colour, artisan craftsmanship, and all-day comfort — whether you're heading to a cocktail mehndi or a Diwali party that calls for something extraordinary.</p>

<h3>Why You'll Love This Suit</h3>
<ul>
<li><strong>Fabric:</strong> Premium cotton with a hand-selected weave that offers both structure and fluidity — the teal dye penetrates deeply into natural fibres for a rich, lasting colour that won't fade</li>
<li><strong>Colour:</strong> A rich teal green that flatters a wide range of skin tones and catches candlelight beautifully — cool yet vibrant, sophisticated yet eye-catching</li>
<li><strong>Embroidery:</strong> Delicate hand-embroidered threadwork by skilled artisans — subtle irregularities that mark each piece as genuinely handcrafted</li>
<li><strong>Occasion:</strong> Designed for party wear, cocktail mehndi, Diwali celebrations, evening events, and cultural gatherings</li>
<li><strong>Dupatta:</strong> Lightweight cotton mul dupatta with crochet lace border — sheer, airy, and beautifully draped</li>
</ul>

<h3>Styling Suggestions</h3>
<p>Make this teal showstopper unforgettable with antique gold temple jewellery and a deep maroon lip. Gold strappy heels and an embroidered clutch in burnt orange or rust create a rich, complementary palette. For a modern twist, swap traditional footwear for block-heel mules and add a sleek low bun with statement earrings.</p>

<h3>Frequently Asked Questions</h3>
<p><strong>What jewellery complements teal green?</strong><br/>Teal green is stunning with antique gold, kundan, and temple jewellery. The warmth of gold creates a beautiful contrast against the cool teal tone. For a contemporary look, rose gold also works beautifully. Avoid silver with teal — it can create a cold, flat combination. Ruby or coral accents in your jewellery add an extra dimension of richness.</p>

<p><strong>Is this suit appropriate for an evening event?</strong><br/>The deep teal shade and intricate hand embroidery make this suit absolutely appropriate for evening events. The colour reads as sophisticated and dressy under artificial lighting, and the embroidery catches light beautifully. Style with bold jewellery and a sleek hairstyle for an elevated evening look.</p>

<p><strong>What is the fit of this salwar suit?</strong><br/>This salwar suit features a comfortable, slightly relaxed fit that flatters a range of body types. The kurta falls in a clean A-line silhouette, while the palazzo-style bottoms offer ease of movement. The dupatta drapes beautifully over one shoulder or across both arms. Please refer to our size guide for detailed measurements to find your perfect fit.</p>

<h3>The LuxeMia Promise</h3>
<p>Every LuxeMia piece is hand-selected for quality, craftsmanship, and enduring style. We believe that exceptional ethnic wear shouldn't require a luxury budget — just a discerning eye. This suit represents our commitment to bringing you curated, boutique-quality Indian fashion that feels as good as it looks.</p>`,
    product_type: "Salwar Kameez",
    tags: [
      "salwar kameez", "teal green salwar suit", "cotton salwar kameez", "hand embroidered salwar suit",
      "party wear salwar suit", "Diwali outfit", "cocktail mehndi outfit", "Indian ethnic wear women",
      "salwar suit online USA", "boutique salwar kameez", "teal cotton suit",
      "traditional Indian suit", "readymade salwar kameez", "women salwar suit",
      "teal green ethnic wear", "hand embroidery cotton suit", "LuxeMia",
      "gender:female", "women", "womenswear", "new arrival"
    ],
    variants: [
      { option1: "S", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-TEA-004-S", inventory_management: null },
      { option1: "M", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-TEA-004-M", inventory_management: null },
      { option1: "L", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-TEA-004-L", inventory_management: null },
      { option1: "XL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-TEA-004-XL", inventory_management: null },
      { option1: "XXL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-TEA-004-XXL", inventory_management: null },
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL", "XXL"] }],
    metafields: [
      { namespace: "custom", key: "occasion", value: "Party, Cocktail Mehndi, Diwali, Evening", type: "single_line_text_field" },
      { namespace: "custom", key: "fabric", value: "Cotton", type: "single_line_text_field" },
      { namespace: "custom", key: "color", value: "Teal Green", type: "single_line_text_field" },
      { namespace: "custom", key: "work", value: "Hand Embroidered", type: "single_line_text_field" },
      { namespace: "custom", key: "gender", value: "Women", type: "single_line_text_field" },
    ]
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const shopifyAccessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    if (!shopifyAccessToken) {
      throw new Error('SHOPIFY_ACCESS_TOKEN not configured');
    }

    let productIds: string[] | null = null;
    let dryRun = true;

    try {
      const body = await req.json();
      productIds = body.product_ids || null;
      dryRun = body.dry_run !== false; // Default to dry run for safety
    } catch {
      // No body provided, update all products in dry run mode
    }

    const updatesToApply = productIds
      ? Object.entries(PRODUCT_UPDATES).filter(([id]) => productIds!.includes(id))
      : Object.entries(PRODUCT_UPDATES);

    if (updatesToApply.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No matching products to update', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: Array<{
      product_id: string;
      title: string;
      status: string;
      message?: string;
    }> = [];

    for (const [productId, update] of updatesToApply) {
      if (dryRun) {
        results.push({
          product_id: productId,
          title: update.title,
          status: 'dry_run',
          message: 'Would update product with new title, description, tags, variants, and metafields'
        });
        continue;
      }

      try {
        // Update product via Shopify Admin REST API
        const shopifyUpdate = {
          product: {
            id: parseInt(productId),
            title: update.title,
            body_html: update.body_html,
            product_type: update.product_type,
            tags: update.tags.join(', '),
            variants: update.variants,
            options: update.options,
            metafields: update.metafields,
          }
        };

        const response = await fetch(
          `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': shopifyAccessToken,
            },
            body: JSON.stringify(shopifyUpdate),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          results.push({
            product_id: productId,
            title: update.title,
            status: 'error',
            message: `HTTP ${response.status}: ${errorText.slice(0, 200)}`
          });
          continue;
        }

        const data = await response.json();
        results.push({
          product_id: productId,
          title: data.product?.title || update.title,
          status: 'success',
          message: `Updated successfully. Variants: ${data.product?.variants?.length || 0}, Tags: ${data.product?.tags?.split(',').length || 0}`
        });

        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        results.push({
          product_id: productId,
          title: update.title,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const updated = results.filter(r => r.status === 'success').length;
    const errors = results.filter(r => r.status === 'error').length;
    const dryRuns = results.filter(r => r.status === 'dry_run').length;

    return new Response(
      JSON.stringify({
        success: true,
        message: dryRun
          ? `Dry run complete. ${dryRuns} products would be updated. Set dry_run: false to apply changes.`
          : `Update complete: ${updated} updated, ${errors} errors`,
        updated,
        errors,
        dry_runs: dryRuns,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
