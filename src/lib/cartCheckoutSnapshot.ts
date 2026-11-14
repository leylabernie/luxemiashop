import type { CartAttribute, CartItem } from '@/stores/cartStore';
import { normalizeFulfillmentAttributes } from '@/lib/fulfillmentAttributes';
import { getProductShipsWithin } from '@/lib/shipBy';

export const sameCartAttributes = (left?: CartAttribute[], right?: CartAttribute[], days?: number | null) => (
  JSON.stringify(normalizeFulfillmentAttributes(left, days) || []) === JSON.stringify(normalizeFulfillmentAttributes(right, days) || [])
);

// Preserve the existing variant/attribute identity and first line's product,
// options and price while collapsing legacy automatic-copy versions once.
export const normalizeCartItems = (items: CartItem[]): CartItem[] => {
  const normalized: CartItem[] = [];
  for (const item of items) {
    const candidate = { ...item, customAttributes: normalizeFulfillmentAttributes(item.customAttributes, getProductShipsWithin(item.product.node)) };
    const existing = normalized.find(current => current.variantId === candidate.variantId
      && sameCartAttributes(current.customAttributes, candidate.customAttributes, getProductShipsWithin(candidate.product.node)));
    if (existing) existing.quantity += candidate.quantity;
    else normalized.push(candidate);
  }
  return normalized;
};

// In-memory only: prices, inventory and fulfillment details all belong to the
// snapshot. Replacing normalized arrays must not itself trigger another cart.
export const getCartCheckoutSignature = (items: CartItem[]): string => JSON.stringify(normalizeCartItems(items));
