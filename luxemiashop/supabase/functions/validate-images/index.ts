import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationResult {
  id: string;
  image_url: string;
  status: 'valid' | 'invalid' | 'error';
  statusCode?: number;
}

async function validateImageUrl(url: string): Promise<{ valid: boolean; statusCode?: number }> {
  try {
    // Add .jpg if missing
    let fixedUrl = url;
    if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(url)) {
      if (/\(\d+$/.test(url)) {
        fixedUrl = url + ').jpg';
      } else {
        fixedUrl = url + '.jpg';
      }
    }
    
    // Fix malformed URLs like (1(2).jpg -> (2).jpg
    const malformedPattern = /\(1\((\d+)\)\.jpg$/i;
    if (malformedPattern.test(fixedUrl)) {
      fixedUrl = fixedUrl.replace(malformedPattern, '($1).jpg');
    }

    const response = await fetch(fixedUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageValidator/1.0)',
      },
    });
    
    return {
      valid: response.ok,
      statusCode: response.status,
    };
  } catch (error) {
    console.error(`Error validating URL ${url}:`, error);
    return { valid: false };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get query params for batch processing
    const url = new URL(req.url);
    const batchSize = parseInt(url.searchParams.get('batch_size') || '50');
    const dryRun = url.searchParams.get('dry_run') === 'true';

    console.log(`Starting image validation - batch size: ${batchSize}, dry run: ${dryRun}`);

    // Fetch active products to validate
    const { data: products, error: fetchError } = await supabase
      .from('scraped_products')
      .select('id, image_url, title')
      .eq('is_active', true)
      .limit(batchSize);

    if (fetchError) {
      console.error('Error fetching products:', fetchError);
      throw fetchError;
    }

    if (!products || products.length === 0) {
      console.log('No products to validate');
      return new Response(
        JSON.stringify({ message: 'No products to validate', validated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Validating ${products.length} products...`);

    const results: ValidationResult[] = [];
    const invalidProducts: string[] = [];

    // Validate images in parallel with concurrency limit
    const concurrencyLimit = 10;
    for (let i = 0; i < products.length; i += concurrencyLimit) {
      const batch = products.slice(i, i + concurrencyLimit);
      
      const batchResults = await Promise.all(
        batch.map(async (product) => {
          const validation = await validateImageUrl(product.image_url);
          
          const result: ValidationResult = {
            id: product.id,
            image_url: product.image_url,
            status: validation.valid ? 'valid' : 'invalid',
            statusCode: validation.statusCode,
          };

          if (!validation.valid) {
            console.log(`Invalid image for product ${product.id}: ${product.title} - Status: ${validation.statusCode}`);
            invalidProducts.push(product.id);
          }

          return result;
        })
      );

      results.push(...batchResults);
    }

    // Mark invalid products as inactive (unless dry run)
    let updatedCount = 0;
    if (!dryRun && invalidProducts.length > 0) {
      const { error: updateError, count } = await supabase
        .from('scraped_products')
        .update({ is_active: false })
        .in('id', invalidProducts);

      if (updateError) {
        console.error('Error updating products:', updateError);
      } else {
        updatedCount = count || invalidProducts.length;
        console.log(`Marked ${updatedCount} products as inactive`);
      }
    }

    const summary = {
      total_validated: results.length,
      valid_count: results.filter(r => r.status === 'valid').length,
      invalid_count: results.filter(r => r.status === 'invalid').length,
      updated_count: updatedCount,
      dry_run: dryRun,
      invalid_products: dryRun ? invalidProducts : undefined,
    };

    console.log('Validation complete:', summary);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Validation error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
