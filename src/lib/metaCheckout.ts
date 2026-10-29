import { hasPendingMeasurementAttributes } from './measurementRequest';
import { alterationShippingTimingNotice } from '../config/shippingPolicy';
import { getProductShipsWithin } from './shipBy';
import { normalizeFulfillmentAttributes } from './fulfillmentAttributes';
import type { ShopifyProduct } from './shopify';
import type { ConfiguredMetaLine } from './metaCheckoutContext';
import { getCustomizableProduct, isMadeToOrderProduct } from './customizableProductStatus';
import { hasNativeProductSizeOption } from './productOptionNames';
import { hasNativeFullStitchingOptions, requiresNativeStitchingTimingConfirmation } from './serviceAddOns';

export type MetaLine = { contentId: string; quantity: number };
export type MetaRequest = { lines: MetaLine[]; coupon: string | null };
export type MetaProduct = ShopifyProduct['node'];
export type MetaSelection = { product: MetaProduct; quantity: number; variantId: string; timingConfirmed?: boolean; configured?: ConfiguredMetaLine[] };
const MAX_QUANTITY = 99;

/** Meta sends catalog content IDs, NOT Shopify variant IDs. Fail closed. */
export function parseMetaCheckout(search: string): MetaRequest {
  const params = new URLSearchParams(search);
  if (params.getAll('products').length !== 1 || params.getAll('coupon').length > 1) {
    throw new Error('This shopping link is incomplete or invalid. Please return to the shop and try again.');
  }
  const raw = params.get('products') || '';
  if (!raw || raw.length > 6000) throw new Error('This shopping link has no valid products.');
  const entries = raw.split(',');
  if (entries.length > 50) throw new Error('Please check out with no more than 50 products at a time.');
  const quantities = new Map<string, number>();
  for (const entry of entries) {
    const match = /^([a-z0-9][a-z0-9-]{0,99}):([1-9][0-9]?)$/.exec(entry);
    if (!match) throw new Error('This shopping link contains an invalid product or quantity.');
    const quantity = (quantities.get(match[1]) || 0) + Number(match[2]);
    if (quantity > MAX_QUANTITY) throw new Error('The requested quantity exceeds the limit of 99 per product.');
    quantities.set(match[1], quantity);
  }
  // Meta emits a bare `&coupon` when no optional promotion was entered.
  const coupon = params.get('coupon') || null;
  if (coupon !== null && (!coupon.trim() || coupon.length > 256 || Array.from(coupon).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127))) {
    throw new Error('This shopping link contains an invalid discount code.');
  }
  return { lines: Array.from(quantities, ([contentId, quantity]) => ({ contentId, quantity })), coupon };
}

/** Must remain byte-for-byte compatible with api/meta-catalog.ts ID generation. */
export async function metaContentId(handle: string): Promise<string> {
  if (handle.length <= 100) return handle;
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(handle));
  return `lm-${Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('').slice(0, 24)}`;
}

export async function resolveMetaProducts(
  request: MetaRequest,
  getProduct: (handle: string) => Promise<MetaProduct | null>,
  getCatalog: () => Promise<ShopifyProduct[]>,
): Promise<Array<{ product: MetaProduct; quantity: number }>> {
  // A hashed ID cannot be reversed. Resolve against the current published catalog.
  const hashed = request.lines.some(line => /^lm-[a-f0-9]{24}$/.test(line.contentId));
  const handles = new Map<string, string>();
  if (hashed) {
    const catalog = await getCatalog();
    if (!catalog.length) throw new Error('The catalog could not be loaded. Please try again.');
    for (const { node } of catalog) {
      const id = await metaContentId(node.handle);
      if (handles.has(id) && handles.get(id) !== node.handle) throw new Error('A catalog item could not be identified safely.');
      handles.set(id, node.handle);
    }
  }
  return Promise.all(request.lines.map(async line => {
    const handle = hashed ? handles.get(line.contentId) : line.contentId;
    if (!handle || handle === 'luxemia-tailoring-saree-finishing-add-ons') throw new Error('A requested product is unavailable. Return to the shop to update your selection.');
    const product = await getProduct(handle);
    if (!product || await metaContentId(product.handle) !== line.contentId || product.availableForSale === false || !product.variants.edges.some(edge => edge.node.availableForSale)) {
      throw new Error('A requested product is unavailable or could not be loaded. Please return to the shop or try again.');
    }
    return { product, quantity: line.quantity };
  }));
}

export function metaCheckoutLines(selections: MetaSelection[]) {
  if (!selections.length) throw new Error('Select a product before continuing.');
  return selections.map(({ product, quantity, variantId, timingConfirmed }) => {
    const variant = product.variants.edges.find(edge => edge.node.id === variantId)?.node;
    if (!variant) throw new Error(`Choose an option for ${product.title}.`);
    if (!variant.availableForSale || !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variant.id)) throw new Error('A selected option is no longer available.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) throw new Error('Invalid product quantity.');
    if (!Number.isFinite(Number(variant.price.amount)) || Number(variant.price.amount) <= 0) throw new Error('The selected price could not be verified.');
    const fullNative = hasNativeFullStitchingOptions(product);
    const explicitTailoring = product.tags?.some(tag => /^(tailoring|stitching|availability):/i.test(tag.trim()));
    const readyOnly = product.tags?.some(tag => /^(?:tailoring|stitching):\s*ready[-\s]?made(?:\s*(?:only|blouse))?\b/i.test(tag.trim()));
    const menswear = /sherwani|kurta|menswear|men/i.test(product.productType || '') || product.tags?.some(tag => /sherwani|kurta|menswear/i.test(tag));
    if (getCustomizableProduct(product.handle) || isMadeToOrderProduct(product.handle, product.tags)
      || (!fullNative && explicitTailoring && !readyOnly) || (menswear && !hasNativeProductSizeOption(product.options))
      || product.variants.edges.length >= 100) {
      throw new Error('This item requires the full product configurator. Open product details to confirm all required options before ordering. Your complete selection and discount code will be preserved.');
    }
    // Custom measurements/services must use the full product configuration flow.
    if (/custom|made.to.measure/i.test(variant.title + ' ' + variant.selectedOptions.map(o => o.value).join(' '))) {
      throw new Error('Custom-fit options require measurements. Open the product page to configure this option before ordering.');
    }
    const timing = requiresNativeStitchingTimingConfirmation(product, variant.selectedOptions);
    if (timing && !timingConfirmed) throw new Error('Please acknowledge the tailoring timing before continuing.');
    return { variantId: variant.id, quantity, handle: product.handle, ...(timing ? { customAttributes: [
      { key: 'Tailoring', value: 'Alterations / finishing requested' },
      { key: 'Timing Confirmation', value: alterationShippingTimingNotice(getProductShipsWithin(product)) },
    ] } : {}) };
  });
}

/** Recheck PDP-configured main and paid-service variants without trusting saved prices. */
export async function configuredMetaCheckoutLines(selection: MetaSelection, getProduct: (handle: string) => Promise<MetaProduct | null>) {
  const configured = selection.configured;
  if (!configured?.length || configured.length > 10 || configured[0].handle !== selection.product.handle) throw new Error('Reconfigure this product before checkout.');
  if (configured.some(line => hasPendingMeasurementAttributes(line.customAttributes))) throw new Error('Measurement details must be re-entered. Reopen the product and explicitly choose to provide measurements after ordering for this shopping-link checkout.');
  return Promise.all(configured.map(async (line, index) => {
    if (index > 0 && line.handle !== 'luxemia-tailoring-saree-finishing-add-ons') throw new Error('Invalid service configuration.');
    if (line.quantity !== selection.quantity || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) throw new Error('Reconfigure the product quantity before checkout.');
    const product = await getProduct(line.handle);
    const variant = product?.variants.edges.find(edge => edge.node.id === line.variantId)?.node;
    if (!variant?.availableForSale || !Number.isFinite(Number(variant.price.amount)) || Number(variant.price.amount) <= 0) throw new Error('A configured option is no longer available. Reopen the product configurator.');
    if (line.customAttributes && (!Array.isArray(line.customAttributes) || line.customAttributes.length > 30 || line.customAttributes.some(attr => typeof attr.key !== 'string' || typeof attr.value !== 'string' || attr.key.length > 255 || attr.value.length > 2000))) throw new Error('Invalid product configuration.');
    return { variantId: variant.id, quantity: line.quantity, handle: line.handle, customAttributes: normalizeFulfillmentAttributes(line.customAttributes, getProductShipsWithin(product)) };
  }));
}

/** Display-only estimate. Checkout still revalidates exact variants and prices. */
export function metaBasketSubtotal(selections: MetaSelection[]): { currency: string; merchandise: string; services: string; total: string } | null {
  if (!selections.length) return null;
  let currency = '';
  let digits = 2;
  let merchandise = 0;
  let services = 0;
  function amount(value: string, code: string, quantity: number): number | null {
    if (!/^[A-Z]{3}$/.test(code) || (currency && currency !== code)) return null;
    try {
      const precision = new Intl.NumberFormat('en', { style: 'currency', currency: code }).resolvedOptions().maximumFractionDigits;
      if (precision === undefined) return null;
      digits = precision;
    }
    catch { return null; }
    currency = code;
    // Parse decimal money as integer minor units, never floating-point multiplication.
    const match = /^(\d+)(?:\.(\d+))?$/.exec(value);
    if (!match || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null;
    const fraction = match[2] || '';
    if (fraction.slice(digits).replace(/0/g, '')) return null;
    const minor = Number(match[1]) * 10 ** digits + Number(fraction.slice(0, digits).padEnd(digits, '0'));
    const result = minor * quantity;
    return minor > 0 && Number.isSafeInteger(result) ? result : null;
  }
  for (const item of selections) {
    const variant = item.product.variants.edges.find(edge => edge.node.id === item.variantId)?.node;
    if (!variant?.availableForSale || item.product.availableForSale === false) return null;
    const main = amount(variant.price.amount, variant.price.currencyCode, item.quantity);
    if (main === null) return null;
    merchandise += main;
    if (item.configured) {
      const first = item.configured[0];
      if (!first || first.handle !== item.product.handle || first.variantId !== item.variantId || first.quantity !== item.quantity || item.configured.length > 10) return null;
      const seen = new Set<string>([first.variantId]);
      for (const line of item.configured.slice(1)) {
        if (line.handle !== 'luxemia-tailoring-saree-finishing-add-ons' || line.quantity !== item.quantity || seen.has(line.variantId)) return null;
        seen.add(line.variantId);
        const service = amount(line.price.amount, line.price.currencyCode, line.quantity);
        if (service === null) return null;
        services += service;
      }
    }
  }
  if (!Number.isSafeInteger(merchandise + services)) return null;
  const format = (minor: number) => (minor / 10 ** digits).toFixed(digits);
  return { currency, merchandise: format(merchandise), services: format(services), total: format(merchandise + services) };
}
