import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';

const query = `query($after:String){products(first:100,after:$after){nodes{id handle title description availableForSale images(first:1){nodes{url}} priceRange{minVariantPrice{amount currencyCode}}} pageInfo{hasNextPage endCursor}}}`;
const fields = ['id','title','description','availability','condition','price','link','image_link','brand'];
const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).end();
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
  if (!token) return res.status(503).send('Catalog temporarily unavailable');
  try {
    const rows: string[][] = [];
    let after: string | null = null;
    for (let page = 0; page < 100; page++) {
      const response = await fetch('https://lovable-project-zlh0w.myshopify.com/api/2025-10/graphql.json', {
        method: 'POST',
        headers: {'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':token},
        body: JSON.stringify({query, variables:{after}}),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error('Shopify catalog request failed');
      const payload = await response.json();
      if (payload.errors || !payload.data?.products) throw new Error('Shopify catalog response invalid');
      const products = payload.data.products;
      for (const product of products.nodes) {
        if (product.handle === 'luxemia-tailoring-saree-finishing-add-ons') continue;
        const image = product.images.nodes[0]?.url;
        const price = product.priceRange.minVariantPrice;
        if (!image || Number(price.amount) <= 0) throw new Error('Catalog product missing required data');
        const id = product.handle.length <= 100 ? product.handle : `lm-${createHash('sha256').update(product.handle).digest('hex').slice(0,24)}`;
        rows.push([id, product.title.slice(0,150), (product.description || product.title).slice(0,5000), product.availableForSale ? 'in stock' : 'out of stock', 'new', `${Number(price.amount).toFixed(2)} ${price.currencyCode}`, `https://luxemia.shop/product/${product.handle}`, image, 'LuxeMia']);
      }
      if (!products.pageInfo.hasNextPage) break;
      if (page === 99 || !products.pageInfo.endCursor || products.pageInfo.endCursor === after) throw new Error('Catalog pagination incomplete');
      after = products.pageInfo.endCursor;
    }
    if (!rows.length) throw new Error('Empty catalog');
    res.setHeader('Content-Type','text/csv; charset=utf-8');
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=300');
    res.setHeader('X-Catalog-Products',String(rows.length));
    res.setHeader('X-Robots-Tag','noindex');
    return res.status(200).send([fields,...rows].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n');
  } catch {
    return res.status(503).send('Catalog temporarily unavailable; retry later');
  }
}
