import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

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

async function createShopifyProduct(
  product: ScrapedProduct,
  accessToken: string
): Promise<ShopifyProductResponse | null> {
  const productType = product.category === 'lehengas' ? 'Bridal Lehengas' :
                      product.category === 'sarees' ? 'Designer Sarees' :
                      product.category === 'suits' ? 'Designer Suits' : 'Menswear';

  // Build tags from product attributes
  const tags: string[] = [product.category];
  if (product.fabric) tags.push(product.fabric);
  if (product.color) tags.push(product.color);
  if (product.work) tags.push(product.work);

  // Get validated image URLs
  const validImageUrls = await getValidImageUrls(product);
  
  if (validImageUrls.length === 0) {
    console.error(`No valid images for product: ${product.title}`);
    return null;
  }
  
  const images = validImageUrls.map((url, index) => ({
    src: url,
    alt: index === 0 ? product.title : `${product.title} - View ${index + 1}`
  }));

  console.log(`Creating product "${product.title}" with ${images.length} validated images`);

  const shopifyProduct = {
    product: {
      title: product.title,
      body_html: product.description,
      vendor: 'LuxeMia',
      product_type: productType,
      tags: tags.join(', '),
      status: 'active',
      published: true,
      images,
      options: [{ name: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL', 'Custom'] }],
      variants: [
        { option1: 'S', price: product.price_usd.toFixed(2), sku: `${product.source_id}-S`, inventory_management: null },
        { option1: 'M', price: product.price_usd.toFixed(2), sku: `${product.source_id}-M`, inventory_management: null },
        { option1: 'L', price: product.price_usd.toFixed(2), sku: `${product.source_id}-L`, inventory_management: null },
        { option1: 'XL', price: product.price_usd.toFixed(2), sku: `${product.source_id}-XL`, inventory_management: null },
        { option1: 'XXL', price: product.price_usd.toFixed(2), sku: `${product.source_id}-XXL`, inventory_management: null },
        { option1: 'Custom', price: product.price_usd.toFixed(2), sku: `${product.source_id}-Custom`, inventory_management: null },
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
    // Require admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: roleData } = await authClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    const failedProducts: string[] = [];

    for (const product of products) {
      // Add a small delay between requests to avoid rate limiting
      if (synced > 0 || failed > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
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

    console.log(`Sync complete: ${synced} synced, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${synced} products to Shopify`,
        synced,
        failed,
        failedProducts: failedProducts.length > 0 ? failedProducts : undefined,
        remaining: products.length - synced - failed,
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