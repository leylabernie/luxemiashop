/** Only these two approved families participate in the exact-variant Meta pilot. */
export interface MetaPilotVariant {
  contentId: string;
  handle: string;
  variantId: string;
  size: string;
  color: string;
  selectedOptions: ReadonlyArray<{ name: string; value: string }>;
}
export interface MetaPilotProduct {
  handle: string;
  color: string;
  variants: ReadonlyArray<MetaPilotVariant>;
}
const family = (handle: string, color: string, values: ReadonlyArray<readonly [string, string]>, standard = false): MetaPilotProduct => ({
  handle, color,
  variants: values.map(([id, size]) => ({
    contentId: `lmv-${id}`, handle, variantId: `gid://shopify/ProductVariant/${id}`, size, color,
    selectedOptions: [{ name: 'Size', value: size }, ...(standard ? [{ name: 'Alteration', value: 'Standard' }] : [])],
  })),
});
export const META_PILOT_PRODUCTS: ReadonlyArray<MetaPilotProduct> = [
  family('anarkali-green-chinon', 'Green', [
    ['48120657903787', 'S'], ['48121669583019', 'M'], ['48121669615787', 'L'],
    ['48121669648555', 'XL'], ['48121669681323', 'XXL'],
  ], true),
  family('dusty-peach-embroidered-a-line-palazzo-suit-chinon-indian-wedding-outfit-ready-to-wear', 'Dusty Peach', [
    ['48210922504363', 'S'], ['48210922537131', 'M'], ['48210922569899', 'L'],
    ['48210922602667', 'XL'], ['48210922635435', 'XXL'], ['48210922668203', 'XS'],
  ]),
];
export const getMetaPilotProduct = (handle: string): MetaPilotProduct | undefined => META_PILOT_PRODUCTS.find(product => product.handle === handle);
export const getMetaPilotVariant = (contentId: string): MetaPilotVariant | undefined => META_PILOT_PRODUCTS.flatMap(product => product.variants).find(variant => variant.contentId === contentId);
export interface MetaPilotNativeVariant {
  id: string;
  selectedOptions: ReadonlyArray<{ name: string; value: string }>;
  requiresComponents?: boolean;
  price: { amount: string; currencyCode: string };
}
/** Do not silently reinterpret a migrated ID if its Shopify options change. */
export function verifyMetaPilotVariant(handle: string, variant: MetaPilotNativeVariant): MetaPilotVariant {
  const approved = getMetaPilotProduct(handle)?.variants.find(value => value.variantId === variant.id);
  if (!approved || variant.requiresComponents
    || variant.selectedOptions.length !== approved.selectedOptions.length
    || !approved.selectedOptions.every(expected => variant.selectedOptions.filter(option => option.name === expected.name && option.value === expected.value).length === 1)
    || variant.price.currencyCode !== 'USD' || !/^\d+(?:\.\d{1,2})?$/.test(variant.price.amount)
    || !Number.isFinite(Number(variant.price.amount)) || Number(variant.price.amount) <= 0) {
    throw new Error('Meta pilot variant no longer matches its approved configuration.');
  }
  return approved;
}
