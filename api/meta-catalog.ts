import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';
import { META_PILOT_PRODUCTS, getMetaPilotProduct, verifyMetaPilotVariant, type MetaPilotNativeVariant } from '../src/lib/metaPilot.js';

export interface MetaCatalogProduct {
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  images: { nodes: Array<{ url: string }> };
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
}
interface CatalogPage { nodes: MetaCatalogProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string | null }; }
interface CatalogPayload { errors?: unknown[]; data?: { products?: CatalogPage }; }
interface PilotVariant extends MetaPilotNativeVariant { availableForSale: boolean; image: { url: string } | null; }
interface PilotProduct { handle: string; variants: { nodes: PilotVariant[]; pageInfo: { hasNextPage: boolean } }; }
interface PilotPayload { errors?: unknown[]; data?: { product?: PilotProduct | null }; }
const query = `query($after:String){products(first:100,after:$after){nodes{id handle title description availableForSale images(first:1){nodes{url}} priceRange{minVariantPrice{amount currencyCode}}} pageInfo{hasNextPage endCursor}}}`;
const pilotQuery = `query($handle:String!){product(handle:$handle){handle variants(first:100){nodes{id availableForSale requiresComponents price{amount currencyCode} selectedOptions{name value} image{url}} pageInfo{hasNextPage}}}}`;
export const META_CATALOG_FIELDS = ['id','title','description','availability','condition','price','link','image_link','brand','item_group_id','size','color'];
const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;

/** All nine historical fields remain identical for every non-pilot product. */
export function metaCatalogRows(product: MetaCatalogProduct, pilot?: PilotProduct): string[][] {
  if (product.handle === 'luxemia-tailoring-saree-finishing-add-ons') return [];
  const family = getMetaPilotProduct(product.handle);
  const image = product.images.nodes[0]?.url;
  const title = product.title.slice(0,150);
  const description = (product.description || product.title).slice(0,5000);
  if (family) {
    if (!pilot || pilot.handle !== product.handle || pilot.variants.pageInfo.hasNextPage) throw new Error('Meta pilot product data incomplete');
    return family.variants.map(approved => {
      const matches = pilot.variants.nodes.filter(value => value.id === approved.variantId);
      if (matches.length !== 1) throw new Error('Meta pilot variant missing or duplicated');
      const variant = matches[0];
      verifyMetaPilotVariant(product.handle, variant);
      const variantImage = variant.image?.url || image;
      if (!variantImage) throw new Error('Meta pilot image missing');
      return [approved.contentId,title,description,product.availableForSale && variant.availableForSale ? 'in stock' : 'out of stock','new',`${Number(variant.price.amount).toFixed(2)} ${variant.price.currencyCode}`,`https://luxemia.shop/product/${product.handle}?variant=${approved.variantId.split('/').pop()}`,variantImage,'LuxeMia',family.handle,approved.size,approved.color];
    });
  }
  const price = product.priceRange.minVariantPrice;
  if (!image || Number(price.amount) <= 0) throw new Error('Catalog product missing required data');
  const id = product.handle.length <= 100 ? product.handle : `lm-${createHash('sha256').update(product.handle).digest('hex').slice(0,24)}`;
  return [[id,title,description,product.availableForSale ? 'in stock' : 'out of stock','new',`${Number(price.amount).toFixed(2)} ${price.currencyCode}`,`https://luxemia.shop/product/${product.handle}`,image,'LuxeMia','','','']];
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).end();
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
  if (!token) return res.status(503).send('Catalog temporarily unavailable');
  try {
    const read = async (operation: string, variables: Record<string, string | null>): Promise<unknown> => {
      const response = await fetch('https://lovable-project-zlh0w.myshopify.com/api/2025-10/graphql.json', {
        method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':token},
        body:JSON.stringify({query:operation,variables}),signal:AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error('Shopify catalog request failed');
      return response.json();
    };
    const pilots = new Map<string, PilotProduct>();
    for (const family of META_PILOT_PRODUCTS) {
      const payload = await read(pilotQuery, {handle:family.handle}) as PilotPayload;
      if (payload.errors || !payload.data?.product || payload.data.product.handle !== family.handle) throw new Error('Meta pilot source unavailable');
      pilots.set(family.handle,payload.data.product);
    }
    const rows: string[][] = [];
    const seenPilots = new Set<string>();
    let after: string | null = null;
    for (let page = 0; page < 100; page++) {
      const payload = await read(query,{after}) as CatalogPayload;
      if (payload.errors || !payload.data?.products) throw new Error('Shopify catalog response invalid');
      const products = payload.data.products;
      for (const product of products.nodes) {
        if (getMetaPilotProduct(product.handle)) {
          if (seenPilots.has(product.handle)) throw new Error('Duplicate Meta pilot product');
          seenPilots.add(product.handle);
        }
        rows.push(...metaCatalogRows(product,pilots.get(product.handle)));
      }
      if (!products.pageInfo.hasNextPage) break;
      if (page === 99 || !products.pageInfo.endCursor || products.pageInfo.endCursor === after) throw new Error('Catalog pagination incomplete');
      after = products.pageInfo.endCursor;
    }
    if (!rows.length || seenPilots.size !== META_PILOT_PRODUCTS.length) throw new Error('Catalog incomplete');
    res.setHeader('Content-Type','text/csv; charset=utf-8');
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=300');
    res.setHeader('X-Catalog-Products',String(rows.length));
    res.setHeader('X-Robots-Tag','noindex');
    return res.status(200).send([META_CATALOG_FIELDS,...rows].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n');
  } catch { return res.status(503).send('Catalog temporarily unavailable; retry later'); }
}
