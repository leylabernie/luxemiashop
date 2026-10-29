import migration from '../config/mensSharedStock.json';
import type { ShopifyProduct } from './shopify';
import { SERVICE_ADD_ON_PRODUCT_HANDLE } from './serviceAddOns';

type Product = ShopifyProduct['node'];
export const MENS_SHARED_STOCK_TAG = 'inventory:mens-shared-standard-v1';
export const ALTERATION_SERVICE_ID = 'gid://shopify/ProductVariant/47669368455339';
type Line = { variantId: string; quantity: number; handle?: string; customAttributes?: Array<{ key: string; value: string }> };
export const mensMigrationForHandle = (handle?: string) => migration.find(p => p.handle === handle);
const facts = (product: Product) => migration.find(p => p.id === product.id && p.handle === product.handle);
export function isMensSharedStockActive(product: Product): boolean {
  const plan = facts(product);
  if (!plan || !product.tags?.includes(MENS_SHARED_STOCK_TAG)) return false;
  return plan.pairs.every(pair => {
    const standard = product.variants.edges.find(v => v.node.id === pair.standard)?.node;
    const legacy = product.variants.edges.find(v => v.node.id === pair.legacy)?.node;
    return standard?.requiresComponents === false && legacy?.requiresComponents === false
      && legacy.availableForSale === false && legacy.quantityAvailable === 0;
  });
}
/** Purchase controls only: never rewrite native offers/schema or feed availability. */
export function mensPurchasePresentation(product: Product, requested?: string | null) {
  if (!isMensSharedStockActive(product)) return { product, requested, alteration: false };
  const plan = facts(product)!;
  const standardIds = new Set(plan.pairs.map(p => p.standard));
  const legacy = plan.pairs.find(p => p.legacy === requested || p.legacy.endsWith('/' + requested));
  const variants = product.variants.edges.filter(v => standardIds.has(v.node.id));
  const options = product.options.map(option => ({ ...option, values: [...new Set(variants.flatMap(v => v.node.selectedOptions.filter(o => o.name === option.name).map(o => o.value)))] }));
  return { product: { ...product, variants: { ...product.variants, edges: variants }, options }, requested: legacy?.standard ?? requested, alteration: Boolean(legacy) };
}
const cents = (value: string) => /^\d+(?:\.\d{1,2})?$/.test(value) ? Math.round(Number(value) * 100) : NaN;
/** Resolve historical fit IDs at the last checkout boundary, with fresh facts. */
export async function normalizeMensCheckoutLines(items: Line[], getProduct: (handle: string) => Promise<Product | null>): Promise<Line[]> {
  const reads = new Map<string, Promise<Product | null>>();
  const read = (h: string) => { if (!reads.has(h)) reads.set(h, getProduct(h)); return reads.get(h)!; };
  const result: Line[] = [];
  for (const item of items) {
    const plan = migration.find(p => p.pairs.some(pair => pair.legacy === item.variantId || pair.standard === item.variantId));
    if (!plan) { result.push(item); continue; }
    if (item.handle && item.handle !== plan.handle) throw new Error('Reopen this garment to confirm your selection.');
    const product = await read(plan.handle);
    if (!product) throw new Error('Could not verify garment availability. Please try again.');
    if (!product.tags?.includes(MENS_SHARED_STOCK_TAG)) { result.push(item); continue; }
    if (!isMensSharedStockActive(product)) throw new Error('This garment is being updated. Reopen it shortly before checkout.');
    const pair = plan.pairs.find(p => p.legacy === item.variantId || p.standard === item.variantId)!;
    const standard = product.variants.edges.find(v => v.node.id === pair.standard)!.node;
    if (!standard.availableForSale || !Number.isInteger(item.quantity) || item.quantity < 1) throw new Error('The selected garment size is unavailable. Reopen the product to update your selection.');
    if (item.variantId === pair.standard) { result.push(item); continue; }
    if (!item.customAttributes?.some(a => a.key === 'Timing Confirmation' && a.value.trim())) throw new Error('Reconfigure this garment to confirm alteration timing before checkout.');
    const legacy = product.variants.edges.find(v => v.node.id === pair.legacy)!.node;
    const serviceProduct = await read(SERVICE_ADD_ON_PRODUCT_HANDLE);
    const service = serviceProduct?.variants.edges.find(v => v.node.id === ALTERATION_SERVICE_ID)?.node;
    if (!service?.availableForSale || service.requiresComponents !== false || service.price.currencyCode !== standard.price.currencyCode
      || legacy.price.currencyCode !== standard.price.currencyCode || cents(service.price.amount) !== 1000
      || cents(legacy.price.amount) !== cents(standard.price.amount) + 1000) throw new Error('Could not verify the alteration price. Reconfigure this garment before checkout.');
    // Legacy native-fit baskets never needed a separate alteration line. Do not
    // silently charge twice or guess which existing service belongs to this item.
    if (items.some(line => line.variantId === ALTERATION_SERVICE_ID && line.customAttributes?.some(a => a.key === 'Applies To' && a.value === product.title))) {
      throw new Error('Reconfigure this garment and its alteration service to avoid a duplicate charge.');
    }
    const reference = item.customAttributes?.find(a => a.key === 'Configuration reference')?.value || crypto.randomUUID();
    const attributes = [...(item.customAttributes || []).filter(a => a.key !== 'Configuration reference'), { key: 'Configuration reference', value: reference }];
    result.push({ ...item, variantId: pair.standard, handle: plan.handle, customAttributes: attributes });
    result.push({ variantId: service.id, quantity: item.quantity, handle: SERVICE_ADD_ON_PRODUCT_HANDLE, customAttributes: [
      { key: 'Applies To', value: product.title }, { key: 'Configuration reference', value: reference },
      { key: 'Selected Service', value: 'Garment Alteration' },
    ] });
  }
  return result;
}
