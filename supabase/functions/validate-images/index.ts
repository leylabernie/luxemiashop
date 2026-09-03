const RETIREMENT_CODE = 'LEGACY_COMMERCE_ENDPOINT_RETIRED';
const ENDPOINT = 'validate-images';

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
      message: 'The legacy scraped-catalog image mutator is retired. Product publication state is controlled in the reviewed Shopify catalog.',
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
