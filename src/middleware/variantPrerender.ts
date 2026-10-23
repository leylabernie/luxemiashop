import type { ShopifyProduct } from './shopifyProxy.js';
import { getVariantReferencePrice } from '../lib/variantReferencePrice.js';

type Variant = ShopifyProduct['variants']['edges'][number]['node'];

// Match ProductInfo's initial selection, including unavailable/invalid links.
// Never mutate the shared snapshot: successive A/B/A requests must be isolated.
export function selectInitialVariant(product: ShopifyProduct, requestedId: string | null): Variant | undefined {
  const variants = product.variants.edges.map(({ node }) => node);
  const requested = requestedId
    ? variants.find(node => node.id === requestedId || node.id.endsWith(`/${requestedId}`))
    : undefined;
  return (requested?.availableForSale !== false ? requested : undefined)
    ?? variants.find(node => node.availableForSale !== false)
    ?? variants[0];
}

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function renderSelectedOptions(variant: Variant): string {
  const options = (variant.selectedOptions || []).filter(option => option.name.toLowerCase() !== 'title'
    && option.value.toLowerCase() !== 'default title');
  return options.length
    ? `<p data-selected-variant="${escapeHtml(variant.id)}">Selected options: ${options.map(option => `${escapeHtml(option.name)}: ${escapeHtml(option.value)}`).join('; ')}</p>`
    : '';
}

function renderImage(product: ShopifyProduct, variant: Variant): string {
  const image = variant.image || product.images.edges[0]?.node;
  if (!image?.url) return '';
  const url = new URL(image.url);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid product image');
  const alt = escapeHtml(image.altText || product.title);
  const style = 'style="max-width:100%;height:auto;display:block;margin:12px 0"';
  const loading = 'loading="eager" fetchpriority="high" decoding="async"';
  if (url.hostname === 'cdn.shopify.com' || url.hostname.endsWith('.myshopify.com')) {
    url.searchParams.set('format', 'jpg');
    const at = (width: number) => { url.searchParams.set('width', String(width)); return url.toString(); };
    const srcset = [400, 600, 900, 1200].map(width => `${at(width)} ${width}w`).join(', ');
    return `<img src="${escapeHtml(at(1200))}" srcset="${escapeHtml(srcset)}" sizes="(max-width: 640px) 92vw, 600px" alt="${alt}" width="600" height="750" ${loading} ${style}>`;
  }
  return `<img src="${escapeHtml(url.toString())}" alt="${alt}" width="600" ${loading} ${style}>`;
}

function replaceRegion(html: string, name: string, replacement: string): string | null {
  const start = `<!--variant-${name}-start-->`;
  const end = `<!--variant-${name}-end-->`;
  const from = html.indexOf(start);
  const to = html.indexOf(end, from + start.length);
  if (from < 0 || to < 0 || html.indexOf(start, from + start.length) >= 0) return null;
  return html.slice(0, from + start.length) + replacement + html.slice(to);
}

// Read only our build-generated, JSON-escaped snapshot. No script evaluation,
// schema editing or replacement of arbitrary page text is permitted here.
export function personalizeProductPrerender(html: string, handle: string, requestedId: string | null): string | null {
  try {
    const payload = html.match(/<script>window\.__INITIAL_PRODUCT_DATA__ = (\{[\s\S]*?\});<\/script>/)?.[1];
    if (!payload) return null;
    const snapshot = JSON.parse(payload);
    const product: ShopifyProduct = snapshot.product;
    if (snapshot.handle !== handle || product?.handle !== handle || !Array.isArray(product.variants?.edges)
      || !Array.isArray(product.images?.edges)) return null;
    const variant = selectInitialVariant(product, requestedId);
    if (!variant || !Number.isFinite(Number(variant.price?.amount)) || Number(variant.price.amount) < 0
      || !/^[A-Z]{3}$/.test(variant.price.currencyCode)) return null;
    const currency = variant.price.currencyCode;
    const reference = getVariantReferencePrice(variant);
    const availability = variant.availableForSale !== false ? 'In Stock' : 'Out of Stock';
    const price = `<strong>${currency} ${Number(variant.price.amount).toFixed(2)}</strong>`
      + (reference ? ` <s style="color:#888">${currency} ${Number(reference.amount).toFixed(2)}</s>` : '');
    let result = replaceRegion(html, 'price', `<p>Price: ${price} | ${availability}</p>${renderSelectedOptions(variant)}`);
    if (result === null) return null;
    result = replaceRegion(result, 'image', renderImage(product, variant));
    if (result === null) return null;
    result = replaceRegion(result, 'availability', availability);
    if (result === null) return null;
    const color = variant.selectedOptions?.find(option => ['color', 'colour'].includes(option.name.toLowerCase()))?.value;
    if (color && result.includes('<!--variant-color-start-->')) {
      result = replaceRegion(result, 'color', escapeHtml(color));
    }
    return result;
  } catch {
    return null;
  }
}

// Deliberately do not share-cache query-specific HTML. The underlying immutable
// deployment asset can be cached, but no variant can poison another's response.
export const VARIANT_HTML_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'private, no-store',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  'X-Robots-Tag': 'index, follow',
};

export async function renderPrerenderedVariant(request: Request, handle: string, requestedId: string | null): Promise<Response | null> {
  const headers = new Headers();
  // Carry only credentials already present on an authorized same-origin request,
  // as attachShoppingApp does. This never creates a deployment bypass token.
  for (const name of ['cookie', 'x-vercel-protection-bypass']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const response = await fetch(new URL(`/_prerender/product/${handle}.html`, request.url), {
      headers, signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const html = personalizeProductPrerender(await response.text(), handle, requestedId);
    return html === null ? null : new Response(html, { status: 200, headers: VARIANT_HTML_HEADERS });
  } catch {
    return null;
  }
}
