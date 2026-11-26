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
  ]),
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
/**
 * Native Shopify options that are approved *in addition to* a family's declared
 * options, at an exact name and value.
 *
 * `anarkali-green-chinon` carries a native `Alteration` option with the values
 * `Standard` and `Custom` — the store's own captured catalog snapshot publishes
 * all ten of its variants as `S / Standard` … `XXL / Custom`
 * (`public/merchant-feed.xml`, whose `composeMerchantVariantTitle()` joins every
 * `selectedOptions` value, and whose description prints `Selected options:
 * Alteration: Standard.` verbatim from Shopify). The pilot publishes only the
 * five `Standard` variants, so `Alteration` at exactly `Standard` IS part of the
 * approved configuration, and `Custom` — a made-to-fit garment — never is.
 *
 * Why tolerate the option's presence *or* absence instead of declaring it with
 * `family(..., true)`: a mismatch here throws inside `metaCatalogRows`, and
 * `api/meta-catalog.ts` deliberately fails the WHOLE feed closed with a 503 so
 * Meta can never import a partial REPLACE CSV. One drifted pilot option
 * therefore takes every product's catalog row down, Meta cannot re-fetch, and it
 * keeps serving the item records from its last successful import — which is how
 * a checkout validator ends up comparing a stale saved product name with the
 * live checkout summary and reporting "A product name was incorrect." Declaring
 * the option strictly would leave that outage one Shopify option edit away in
 * either direction. Nothing published changes either way: a row's id, title,
 * size, color and link come from the declared pilot entry and its price from the
 * native variant, so this tolerance cannot publish a different item.
 */
const APPROVED_OPTIONAL_OPTIONS: ReadonlyArray<{ name: string; value: string }> = [
  { name: 'Alteration', value: 'Standard' },
];

/** Do not silently reinterpret a migrated ID if its Shopify options change. */
export function verifyMetaPilotVariant(handle: string, variant: MetaPilotNativeVariant): MetaPilotVariant {
  const approved = getMetaPilotProduct(handle)?.variants.find(value => value.variantId === variant.id);
  if (!approved || variant.requiresComponents
    || variant.price.currencyCode !== 'USD' || !/^\d+(?:\.\d{1,2})?$/.test(variant.price.amount)
    || !Number.isFinite(Number(variant.price.amount)) || Number(variant.price.amount) <= 0) {
    throw new Error('Meta pilot variant no longer matches its approved configuration.');
  }
  const native = variant.selectedOptions;
  const isDeclared = (option: { name: string; value: string }) =>
    approved.selectedOptions.some(expected => expected.name === option.name && expected.value === option.value);
  const isApprovedOptional = (option: { name: string; value: string }) =>
    APPROVED_OPTIONAL_OPTIONS.some(allowed => allowed.name === option.name && allowed.value === option.value);
  if (
    // Every declared option must still be present exactly once, so a renamed or
    // re-sized variant can never be published under its migrated content ID.
    !approved.selectedOptions.every(expected => native.filter(option => option.name === expected.name && option.value === expected.value).length === 1)
    // …and nothing undeclared may ride along: an unapproved option is a
    // different product, even when the declared ones all match.
    || !native.every(option => isDeclared(option) || isApprovedOptional(option))
    // A repeated option name is ambiguous, and a native variant may not carry
    // more options than the declaration plus the approved optional ones.
    || new Set(native.map(option => option.name)).size !== native.length
    || native.length > approved.selectedOptions.length + APPROVED_OPTIONAL_OPTIONS.length
  ) {
    throw new Error('Meta pilot variant no longer matches its approved configuration.');
  }
  return approved;
}
