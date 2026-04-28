#!/usr/bin/env node

/**
 * Shopify Product Update Script for LuxeMia
 * 
 * This script updates the 4 new salwar kameez products with SEO-optimized
 * titles, descriptions, tags, variants (S-XXL), compare-at pricing, and
 * gender metafields.
 * 
 * USAGE:
 *   1. Get your Shopify Admin API token:
 *      - Go to Shopify Admin > Settings > Apps and sales channels > Develop apps
 *      - Create a custom app (or use existing one)
 *      - Enable Admin API with scopes: write_products, read_products
 *      - Copy the Admin API access token
 *   
 *   2. Run the script:
 *      SHOPIFY_ACCESS_TOKEN=shpat_xxxxx node scripts/update-salwar-products.js
 *   
 *   3. Or set the environment variable in .env:
 *      SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
 *      node scripts/update-salwar-products.js
 */

const SHOPIFY_STORE_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';

const PRODUCT_UPDATES = {
  // Product 1: Olive Green Cotton Festive Salwar Suit (ID: 8749330890923)
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
      { option1: "S", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-OLV-001-S", inventory_management: null, tax_exempt: false },
      { option1: "M", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-OLV-001-M", inventory_management: null, tax_exempt: false },
      { option1: "L", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-OLV-001-L", inventory_management: null, tax_exempt: false },
      { option1: "XL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-OLV-001-XL", inventory_management: null, tax_exempt: false },
      { option1: "XXL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-OLV-001-XXL", inventory_management: null, tax_exempt: false },
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

  // Product 2: Warm Beige Cotton Festival Salwar Suit (ID: 8749330923691)
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
      { option1: "S", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-BGE-002-S", inventory_management: null, tax_exempt: false },
      { option1: "M", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-BGE-002-M", inventory_management: null, tax_exempt: false },
      { option1: "L", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-BGE-002-L", inventory_management: null, tax_exempt: false },
      { option1: "XL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-BGE-002-XL", inventory_management: null, tax_exempt: false },
      { option1: "XXL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-BGE-002-XXL", inventory_management: null, tax_exempt: false },
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

  // Product 3: Dusty Pink Cotton Eid Wear Salwar Suit (ID: 8749330989227)
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
      { option1: "S", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-PNK-003-S", inventory_management: null, tax_exempt: false },
      { option1: "M", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-PNK-003-M", inventory_management: null, tax_exempt: false },
      { option1: "L", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-PNK-003-L", inventory_management: null, tax_exempt: false },
      { option1: "XL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-PNK-003-XL", inventory_management: null, tax_exempt: false },
      { option1: "XXL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-PNK-003-XXL", inventory_management: null, tax_exempt: false },
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

  // Product 4: Teal Green Cotton Party Wear Salwar Suit (ID: 8749331054763)
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
      { option1: "S", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-TEA-004-S", inventory_management: null, tax_exempt: false },
      { option1: "M", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-TEA-004-M", inventory_management: null, tax_exempt: false },
      { option1: "L", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-TEA-004-L", inventory_management: null, tax_exempt: false },
      { option1: "XL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-TEA-004-XL", inventory_management: null, tax_exempt: false },
      { option1: "XXL", price: "36.00", compare_at_price: "55.00", sku: "LUX-SAZ-TEA-004-XXL", inventory_management: null, tax_exempt: false },
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

async function updateProduct(accessToken, productId, update) {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`;
  
  const body = {
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

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 500)}`);
  }

  return await response.json();
}

async function main() {
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('ERROR: SHOPIFY_ACCESS_TOKEN environment variable is required.');
    console.error('');
    console.error('How to get your Shopify Admin API token:');
    console.error('1. Go to Shopify Admin > Settings > Apps and sales channels > Develop apps');
    console.error('2. Create a custom app or select an existing one');
    console.error('3. Enable Admin API with scopes: write_products, read_products');
    console.error('4. Copy the Admin API access token (starts with shpat_)');
    console.error('');
    console.error('Then run:');
    console.error('  SHOPIFY_ACCESS_TOKEN=shpat_xxxxx node scripts/update-salwar-products.js');
    process.exit(1);
  }

  console.log('LuxeMia Shopify Product Update Script');
  console.log('======================================');
  console.log(`Updating ${Object.keys(PRODUCT_UPDATES).length} salwar kameez products...\n`);

  let updated = 0;
  let errors = 0;

  for (const [productId, update] of Object.entries(PRODUCT_UPDATES)) {
    try {
      console.log(`Updating product ${productId}: ${update.title}`);
      const result = await updateProduct(accessToken, productId, update);
      const product = result.product;
      console.log(`  ✓ Success! Title: "${product.title}"`);
      console.log(`    Variants: ${product.variants?.length || 0}`);
      console.log(`    Tags: ${product.tags?.split(',').length || 0} tags`);
      console.log(`    Product Type: ${product.product_type}`);
      updated++;
    } catch (error) {
      console.error(`  ✗ Error updating product ${productId}: ${error.message}`);
      errors++;
    }

    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n======================================');
  console.log(`Update complete: ${updated} updated, ${errors} errors`);
  
  if (errors > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
