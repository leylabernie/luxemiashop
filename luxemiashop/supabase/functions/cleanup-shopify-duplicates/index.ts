import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  created_at: string;
}

async function fetchAllShopifyProducts(accessToken: string): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = [];
  let pageInfo: string | null = null;
  let hasNextPage = true;

  console.log('Fetching all products from Shopify...');

  while (hasNextPage) {
    const fetchUrl: string = pageInfo
      ? `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250&page_info=${pageInfo}`
      : `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250`;

    const fetchResponse: Response = await fetch(fetchUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    });

    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch products: ${fetchResponse.status}`);
    }

    const data = await fetchResponse.json();
    allProducts.push(...data.products);

    // Check for pagination
    const linkHeaderValue: string | null = fetchResponse.headers.get('Link');
    if (linkHeaderValue && linkHeaderValue.includes('rel="next"')) {
      const nextMatchResult: RegExpMatchArray | null = linkHeaderValue.match(/<[^>]*page_info=([^>&]*)[^>]*>; rel="next"/);
      pageInfo = nextMatchResult ? nextMatchResult[1] : null;
      hasNextPage = !!pageInfo;
    } else {
      hasNextPage = false;
    }

    console.log(`Fetched ${allProducts.length} products so far...`);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`Total products fetched: ${allProducts.length}`);
  return allProducts;
}

async function deleteShopifyProduct(productId: number, accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`,
      {
        method: 'DELETE',
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to delete product ${productId}: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    return false;
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

    // Fetch all products from Shopify
    const products = await fetchAllShopifyProducts(shopifyAccessToken);

    // Group products by title to find duplicates
    const productsByTitle: Map<string, ShopifyProduct[]> = new Map();
    
    for (const product of products) {
      const existingProducts = productsByTitle.get(product.title) || [];
      existingProducts.push(product);
      productsByTitle.set(product.title, existingProducts);
    }

    // Find duplicates (products with same title)
    const duplicatesToDelete: number[] = [];
    const keptProducts: string[] = [];

    for (const [title, productList] of productsByTitle.entries()) {
      if (productList.length > 1) {
        // Sort by created_at (oldest first) and keep the first one
        productList.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        const keepProduct = productList[0];
        keptProducts.push(`${title} (ID: ${keepProduct.id})`);
        
        // Mark all others for deletion
        for (let i = 1; i < productList.length; i++) {
          duplicatesToDelete.push(productList[i].id);
        }
        
        console.log(`Found ${productList.length} products with title "${title}". Keeping oldest (ID: ${keepProduct.id}), deleting ${productList.length - 1} duplicates.`);
      }
    }

    console.log(`Found ${duplicatesToDelete.length} duplicate products to delete`);

    // Delete duplicates
    let deleted = 0;
    let failed = 0;

    for (const productId of duplicatesToDelete) {
      const success = await deleteShopifyProduct(productId, shopifyAccessToken);
      if (success) {
        deleted++;
        console.log(`Deleted product ${productId} (${deleted}/${duplicatesToDelete.length})`);
      } else {
        failed++;
      }
      
      // Rate limiting - Shopify allows ~2 requests per second
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Also reset the scraped_products table to remove stale Shopify IDs
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all deleted product IDs as GraphQL IDs
    const deletedGraphqlIds = duplicatesToDelete.map(id => `gid://shopify/Product/${id}`);
    
    // Clear Shopify IDs for products that were deleted
    if (deletedGraphqlIds.length > 0) {
      const { error: updateError } = await supabase
        .from('scraped_products')
        .update({ shopify_product_id: null, shopify_variant_ids: null })
        .in('shopify_product_id', deletedGraphqlIds);

      if (updateError) {
        console.error('Error clearing deleted product IDs:', updateError);
      }
    }

    console.log(`Cleanup complete: ${deleted} deleted, ${failed} failed, ${products.length - duplicatesToDelete.length} unique products remain`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleaned up ${deleted} duplicate products`,
        totalProducts: products.length,
        uniqueProducts: productsByTitle.size,
        duplicatesDeleted: deleted,
        deleteFailed: failed,
        uniqueProductsRemaining: products.length - deleted,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in cleanup-shopify-duplicates:', error);
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
