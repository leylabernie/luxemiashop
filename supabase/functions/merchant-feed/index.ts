const ENDPOINT = 'merchant-feed';
const CANONICAL_FEED = 'https://luxemia.shop/merchant-feed.xml';
const RETIREMENT_MARKER = 'LEGACY_COMMERCE_ENDPOINT_RETIRED';

Deno.serve(() => new Response(JSON.stringify({
  error: RETIREMENT_MARKER,
  endpoint: ENDPOINT,
  message: 'This duplicate runtime feed is disabled. Use the deploy-time Shopify feed.',
  canonical_feed: CANONICAL_FEED,
}), {
  status: 410,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  },
}));
