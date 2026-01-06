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
  };
}

const SHOPIFY_STORE_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_API_VERSION = '2024-01';

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

  // Use multiple images if available
  const imageUrls = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : [product.image_url];
  
  const images = imageUrls.map((url, index) => ({
    src: url,
    alt: index === 0 ? product.title : `${product.title} - View ${index + 1}`
  }));

  const shopifyProduct = {
    product: {
      title: product.title,
      body_html: product.description,
      vendor: 'Zari Boutique',
      product_type: productType,
      tags: tags.join(', '),
      status: 'active',
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
    console.log(`Created Shopify product: ${product.title} -> ID: ${data.product.id}`);
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
    
    try {
      const body = await req.json();
      category = body.category || null;
      limit = body.limit || 10;
    } catch {
      // No body provided, use defaults
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

    for (const product of products) {
      // Add a small delay between requests to avoid rate limiting
      if (synced > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
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
            source_id: shopifyResponse.product.handle, // Update handle to match Shopify
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);

        if (updateError) {
          console.error(`Failed to update product ${product.id}:`, updateError);
          failed++;
        } else {
          synced++;
        }
      } else {
        failed++;
      }
    }

    console.log(`Sync complete: ${synced} synced, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${synced} products to Shopify`,
        synced,
        failed,
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
