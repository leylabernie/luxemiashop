const MADE_TO_ORDER_TAGS = new Set([
  'made to order',
  'availability:made to order',
  'custom-made',
]);

export const isMadeToOrderProduct = (
  _handle?: string | null,
  tags?: string[] | null,
): boolean => (tags || []).some((tag) => MADE_TO_ORDER_TAGS.has(tag.trim().toLowerCase()));
