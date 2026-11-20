// Single source of truth for the evergreen first-order welcome offer.
// Referenced by the exit-intent welcome popup (NewVisitorPopup), the
// header announcement rotation, the cart drawer and the product page so
// the code and its terms can never drift between surfaces.
//
// IMPORTANT: this code must exist as an ACTIVE Shopify discount with a
// matching value before it is shown to shoppers (Admin → Discounts →
// Create discount → Code FIRST10, 10% off, one use per customer, online
// store channel). Changing the code here without creating the matching
// Shopify discount advertises a dead code at checkout.
//
// Copy rules (Shopify-compliant): the discount is entered and confirmed at
// checkout, limited to one use per customer, and U.S. free shipping
// ($150+) applies after discounts. Never reference retired discount codes.
export const WELCOME_OFFER = {
  code: 'FIRST10',
  discountPercent: 10,
  oneUsePerCustomer: true,
  appliesAtCheckout: true,
  usFreeShippingAfterDiscounts: true,
  enabled: true,
} as const;
