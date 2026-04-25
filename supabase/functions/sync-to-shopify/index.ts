import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedProduct {
  id: string;
  source_id: string;
  title: string;
  description: string;
  price_usd: number;
  original_price_usd: number | null;
  image_url: string;
  image_urls: string[] | null;
  category: string;
  fabric: string | null;
  color: string | null;
  work: string | null;
}

interface ShopifyProductResponse {
  product: {
    id: number;
    handle: string;
    variants: Array<{
      id: number;
      title: string;
    }>;
    images: Array<{
      id: number;
      src: string;
    }>;
  };
}

const SHOPIFY_STORE_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';

// Check if a product with the same title already exists in Shopify
async function checkProductExistsInShopify(title: string, accessToken: string): Promise<number | null> {
  try {
    // Search for products with the same title
    const encodedTitle = encodeURIComponent(title);
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json?title=${encodedTitle}&limit=10`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to search for existing product: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Find exact title match
    const existingProduct = data.products?.find((p: { title: string }) => 
      p.title.toLowerCase() === title.toLowerCase()
    );
    
    if (existingProduct) {
      console.log(`Found existing product "${title}" with ID: ${existingProduct.id}`);
      return existingProduct.id;
    }
    
    return null;
  } catch (error) {
    console.error(`Error checking for existing product:`, error);
    return null;
  }
}

// Validate if an image URL is accessible
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && (response.headers.get('content-type')?.startsWith('image/') ?? false);
  } catch {
    return false;
  }
}

// Get valid image URLs from the product
async function getValidImageUrls(product: ScrapedProduct): Promise<string[]> {
  const candidateUrls: string[] = [];
  
  // Add main image first
  if (product.image_url) {
    candidateUrls.push(product.image_url);
  }
  
  // Add additional images
  if (product.image_urls && product.image_urls.length > 0) {
    for (const url of product.image_urls) {
      if (!candidateUrls.includes(url)) {
        candidateUrls.push(url);
      }
    }
  }
  
  // Validate images in parallel (limit to 5 concurrent)
  const validUrls: string[] = [];
  for (const url of candidateUrls.slice(0, 5)) {
    const isValid = await validateImageUrl(url);
    if (isValid) {
      validUrls.push(url);
    } else {
      console.log(`Invalid image URL skipped: ${url}`);
    }
  }
  
  return validUrls;
}

// Generate SEO-optimized title for Shopify
function generateSEOTitle(product: ScrapedProduct): string {
  const parts: string[] = [];
  
  // Color first (most searched)
  if (product.color && product.color !== 'Multi') {
    parts.push(product.color);
  }
  
  // Fabric (quality indicator)
  if (product.fabric) {
    parts.push(product.fabric);
  }
  
  // Work type (craftsmanship)
  if (product.work && product.work !== 'Handwork') {
    parts.push(product.work);
  }
  
  // Category name
  const categoryNames: Record<string, string> = {
    lehengas: 'Bridal Lehenga',
    sarees: 'Designer Saree',
    suits: 'Embroidered Suit',
    menswear: 'Mens Kurta Pyjama',
    indowestern: 'Indo Western'
  };
  parts.push(categoryNames[product.category] || 'Designer Wear');
  
  // Add "for Women" or "for Men" for SEO
  if (product.category === 'menswear') {
    parts.push('for Men');
  } else {
    parts.push('for Women');
  }
  
  return parts.join(' ');
}

// Generate SEO-optimized description for Shopify
function generateSEODescription(product: ScrapedProduct): string {
  const { color, fabric, work, category } = product;
  
  const occasionMap: Record<string, string[]> = {
    lehengas: ['wedding', 'bridal', 'sangeet', 'reception', 'engagement'],
    sarees: ['wedding', 'party', 'festive', 'puja', 'celebration'],
    suits: ['party', 'festive', 'casual', 'office', 'celebration'],
    menswear: ['wedding', 'festive', 'puja', 'celebration', 'party'],
    indowestern: ['party', 'festive', 'cocktail', 'reception', 'celebration']
  };
  
  const occasions = occasionMap[category] || ['special occasion'];
  
  return `
<p><strong>Elevate your style</strong> with this stunning ${color} ${fabric} ${category === 'lehengas' ? 'lehenga' : category === 'sarees' ? 'saree' : category === 'suits' ? 'suit' : 'kurta set'}. Expertly crafted with ${work}, this piece combines traditional artistry with contemporary elegance.</p>

<h3>Product Highlights</h3>
<ul>
<li><strong>Fabric:</strong> Premium ${fabric} for ultimate comfort and drape</li>
<li><strong>Color:</strong> Rich ${color} shade that complements all skin tones</li>
<li><strong>Work:</strong> Exquisite ${work} by skilled artisans</li>
<li><strong>Occasion:</strong> Perfect for ${occasions.slice(0, 3).join(', ')}</li>
</ul>

<h3>Why Choose LuxeMia?</h3>
<ul>
<li>✓ Authentic Indian craftsmanship</li>
<li>✓ Premium quality fabrics</li>
<li>✓ Custom sizing available</li>
<li>✓ Worldwide shipping</li>
<li>✓ Easy returns within 14 days</li>
</ul>

<p><em>Each piece is carefully inspected before shipping to ensure you receive only the finest quality ethnic wear.</em></p>
`.trim();
}

// Generate SEO tags for Shopify
function generateSEOTags(product: ScrapedProduct): string[] {
  const tags: string[] = [];
  
  // Category tags
  const categoryTags: Record<string, string[]> = {
    lehengas: ['lehenga', 'bridal lehenga', 'wedding lehenga', 'indian bridal wear', 'lehenga choli'],
    sarees: ['saree', 'designer saree', 'indian saree', 'wedding saree', 'party wear saree'],
    suits: ['salwar suit', 'salwar kameez', 'indian suit', 'designer suit', 'party wear suit'],
    menswear: ['kurta', 'kurta pyjama', 'mens indian wear', 'wedding kurta', 'ethnic wear men'],
    indowestern: ['indo western', 'fusion wear', 'western wear', 'party wear', 'contemporary']
  };
  
  tags.push(...(categoryTags[product.category] || []));
  
  // Color tag
  if (product.color) {
    tags.push(product.color.toLowerCase());
    tags.push(`${product.color.toLowerCase()} ${product.category}`);
  }
  
  // Fabric tag
  if (product.fabric) {
    tags.push(product.fabric.toLowerCase());
    tags.push(`${product.fabric.toLowerCase()} ${product.category}`);
  }
  
  // Work tag
  if (product.work) {
    tags.push(product.work.toLowerCase());
    tags.push(`${product.work.toLowerCase()} work`);
  }
  
  // Occasion tags
  tags.push('indian ethnic wear', 'traditional wear', 'festive wear');
  if (product.category === 'lehengas') {
    tags.push('bridal', 'wedding', 'sangeet', 'reception');
  }
  
  // New arrival tag
  tags.push('new arrival', 'trending');
  
  return [...new Set(tags)]; // Remove duplicates
}

async function createShopifyProduct(
  product: ScrapedProduct,
  accessToken: string
): Promise<ShopifyProductResponse | null> {
  const productType = product.category === 'lehengas' ? 'Bridal Lehengas' :
                      product.category === 'sarees' ? 'Designer Sarees' :
                      product.category === 'suits' ? 'Designer Suits' :
                      product.category === 'indowestern' ? 'Indo Western' : 'Menswear';

  // Generate SEO-optimized content
  const seoTitle = generateSEOTitle(product);
  const seoDescription = generateSEODescription(product);
  const seoTags = generateSEOTags(product);

  // Get validated image URLs
  const validImageUrls = await getValidImageUrls(product);
  
  if (validImageUrls.length === 0) {
    console.error(`No valid images for product: ${product.title}`);
    return null;
  }
  
  // Generate SEO-optimized alt text for images
  const images = validImageUrls.map((url, index) => ({
    src: url,
    alt: index === 0 
      ? `${seoTitle} - Front View` 
      : `${seoTitle} - ${['Back', 'Detail', 'Close-up'][index - 1] || 'View'} ${index + 1}`
  }));

  console.log(`Creating product "${seoTitle}" with ${images.length} validated images and ${seoTags.length} SEO tags`);

  const shopifyProduct = {
    product: {
      title: seoTitle,
      body_html: seoDescription,
      vendor: 'LuxeMia',
      product_type: productType,
      tags: seoTags.join(', '),
      status: 'active',
      published: true,
      images,
      options: [{ name: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL', 'Custom'] }],
      variants: [
        { option1: 'S', price: product.price_usd.toFixed(2), compare_at_price: product.original_price_usd?.toFixed(2) || undefined, sku: `${product.source_id}-S`, inventory_management: null },
        { option1: 'M', price: product.price_usd.toFixed(2), compare_at_price: product.original_price_usd?.toFixed(2) || undefined, sku: `${product.source_id}-M`, inventory_management: null },
        { option1: 'L', price: product.price_usd.toFixed(2), compare_at_price: product.original_price_usd?.toFixed(2) || undefined, sku: `${product.source_id}-L`, inventory_management: null },
        { option1: 'XL', price: product.price_usd.toFixed(2), compare_at_price: product.original_price_usd?.toFixed(2) || undefined, sku: `${product.source_id}-XL`, inventory_management: null },
        { option1: 'XXL', price: product.price_usd.toFixed(2), compare_at_price: product.original_price_usd?.toFixed(2) || undefined, sku: `${product.source_id}-XXL`, inventory_management: null },
        { option1: 'Custom', price: product.price_usd.toFixed(2), compare_at_price: product.original_price_usd?.toFixed(2) || undefined, sku: `${product.source_id}-Custom`, inventory_management: null },
      ],
    },
  };

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify(shopifyProduct),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create product ${product.title}:`, response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log(`Created Shopify product: ${product.title} -> ID: ${data.product.id}, Images: ${data.product.images?.length || 0}`);
    return data;
  } catch (error) {
    console.error(`Error creating product ${product.title}:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const shopifyAccessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    if (!shopifyAccessToken) {
      throw new Error('SHOPIFY_ACCESS_TOKEN not configured');
    }

    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body for optional filtering
    let category: string | null = null;
    let limit = 10; // Process in batches to avoid timeouts
    let resetSync = false;
    
    try {
      const body = await req.json();
      category = body.category || null;
      limit = body.limit || 10;
      resetSync = body.resetSync || false;
    } catch {
      // No body provided, use defaults
    }

    // Optionally reset sync status for re-syncing
    if (resetSync) {
      let resetQuery = supabase
        .from('scraped_products')
        .update({ shopify_product_id: null, shopify_variant_ids: null })
        .eq('is_active', true);
      
      if (category) {
        resetQuery = resetQuery.eq('category', category);
      }
      
      const { error: resetError } = await resetQuery;
      if (resetError) {
        console.error('Error resetting sync status:', resetError);
      } else {
        console.log('Reset sync status for products');
      }
    }

    // Fetch scraped products that don't have a Shopify ID yet
    let query = supabase
      .from('scraped_products')
      .select('*')
      .eq('is_active', true)
      .is('shopify_product_id', null)
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: products, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No products to sync',
          synced: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${products.length} products to sync to Shopify`);

    let synced = 0;
    let failed = 0;
    let skipped = 0;
    const failedProducts: string[] = [];

    for (const product of products) {
      // Add a small delay between requests to avoid rate limiting
      if (synced > 0 || failed > 0 || skipped > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Generate the SEO title that would be used
      const seoTitle = generateSEOTitle(product as ScrapedProduct);
      
      // Check if product already exists in Shopify
      const existingProductId = await checkProductExistsInShopify(seoTitle, shopifyAccessToken);
      
      if (existingProductId) {
        console.log(`Skipping "${seoTitle}" - already exists in Shopify (ID: ${existingProductId})`);
        
        // Update the scraped product with existing Shopify ID
        await supabase
          .from('scraped_products')
          .update({
            shopify_product_id: `gid://shopify/Product/${existingProductId}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);
        
        skipped++;
        continue;
      }

      const shopifyResponse = await createShopifyProduct(product as ScrapedProduct, shopifyAccessToken);

      if (shopifyResponse) {
        // Update the scraped product with Shopify IDs
        const variantIds = shopifyResponse.product.variants.map(v => `gid://shopify/ProductVariant/${v.id}`);
        
        const { error: updateError } = await supabase
          .from('scraped_products')
          .update({
            shopify_product_id: `gid://shopify/Product/${shopifyResponse.product.id}`,
            shopify_variant_ids: variantIds,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);

        if (updateError) {
          console.error(`Failed to update product ${product.id}:`, updateError);
          failed++;
          failedProducts.push(product.title);
        } else {
          synced++;
        }
      } else {
        failed++;
        failedProducts.push(product.title);
      }
    }

    console.log(`Sync complete: ${synced} synced, ${skipped} skipped (already exist), ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${synced} products to Shopify (${skipped} already existed)`,
        synced,
        skipped,
        failed,
        failedProducts: failedProducts.length > 0 ? failedProducts : undefined,
        remaining: products.length - synced - failed - skipped,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-to-shopify:', error);
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