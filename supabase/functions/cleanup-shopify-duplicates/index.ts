const RETIREMENT_CODE = 'LEGACY_COMMERCE_ENDPOINT_RETIRED';
const ENDPOINT = 'cleanup-shopify-duplicates';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve((request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({
      success: false,
      code: RETIREMENT_CODE,
      endpoint: ENDPOINT,
      message: 'The legacy title-based Shopify deletion tool is retired. Catalog removals require an explicitly reviewed Shopify workflow.',
    }),
    {
      status: 410,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/problem+json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
});
