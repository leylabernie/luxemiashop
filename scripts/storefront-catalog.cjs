'use strict';

// Build artifacts must be based on a complete current Storefront response.
// An API error is not evidence that a product was archived or unpublished.
async function fetchCompleteStorefrontCatalog({ url, token, query, pageSize = 250, maxPages = 50, fetchImpl = globalThis.fetch }) {
  if (!token) throw new Error('SHOPIFY_STOREFRONT_TOKEN is required for a fresh catalog; refusing fallback product data');
  const products = [];
  const handles = new Set();
  const cursors = new Set();
  let cursor = null;
  for (let page = 0; page < maxPages; page++) {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
      body: JSON.stringify({ query, variables: { first: pageSize, after: cursor } }),
    });
    if (!response.ok) throw new Error(`Shopify catalog page ${page + 1} failed: HTTP ${response.status}`);
    const json = await response.json();
    if (json?.errors?.length) throw new Error(`Shopify catalog GraphQL errors: ${JSON.stringify(json.errors)}`);
    const data = json?.data?.products;
    if (!data || !Array.isArray(data.edges) || typeof data.pageInfo?.hasNextPage !== 'boolean') {
      throw new Error('Shopify returned an incomplete catalog response');
    }
    for (const edge of data.edges) {
      const product = edge?.node;
      if (typeof product?.handle !== 'string' || !product.handle || handles.has(product.handle)) {
        throw new Error('Shopify catalog contains a missing or duplicate product handle');
      }
      handles.add(product.handle);
      products.push(product);
    }
    if (!data.pageInfo.hasNextPage) {
      if (!products.length) throw new Error('Shopify returned an empty catalog; refusing fallback product data');
      return products;
    }
    const next = data.pageInfo.endCursor;
    if (typeof next !== 'string' || !next || cursors.has(next)) {
      throw new Error('Shopify catalog pagination did not advance');
    }
    cursors.add(next);
    cursor = next;
  }
  throw new Error(`Shopify catalog exceeded ${maxPages} pages; refusing partial product data`);
}

function retainLiveProductRoutes(routes, productMap) {
  return routes.filter(route => !route.path.startsWith('/product/') || productMap.has(route.path.slice('/product/'.length)));
}

module.exports = { fetchCompleteStorefrontCatalog, retainLiveProductRoutes };
