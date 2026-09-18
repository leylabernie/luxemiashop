// Single source of truth for the evergreen first-order welcome offer.
// Referenced by the exit-intent welcome popup (NewVisitorPopup) and the
// header announcement rotation so the code can never drift between surfaces.
//
// IMPORTANT: this code must exist as an ACTIVE Shopify discount with a
// matching value before it is shown to shoppers (Admin → Discounts →
// Create discount → Code FIRST10, 10% off, one use per customer, online
// store channel). Changing the code here without creating the matching
// Shopify discount advertises a dead code at checkout.
export const WELCOME_OFFER = {
  code: 'FIRST10',
  discountPercent: 10,
  enabled: true,
} as const;
