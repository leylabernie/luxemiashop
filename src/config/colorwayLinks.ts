/**
 * Colorway cross-links shown as "More Colors" swatches on the product page,
 * mirroring the way established ethnic-wear stores link same-design color
 * listings to each other. Add a family here when a design ships in multiple
 * color listings; the current handle renders as the selected swatch.
 */

export interface ColorwaySwatch {
  handle: string;
  color: string;
  hex: string;
}

const COLORWAY_FAMILIES: Record<string, ColorwaySwatch[]> = {
  'ivory-silk-lehenga-choli-al9028': 'family:mira',
  'blush-pink-silk-lehenga-choli-al9030': 'family:mira',
  'mint-green-silk-lehenga-choli-al9029': 'family:mira',
  'yellow-silk-lehenga-choli-al9027': 'family:mira',
};

const FAMILIES: Record<string, ColorwaySwatch[]> = {
  mira: [
    { handle: 'ivory-silk-lehenga-choli-al9028', color: 'Ivory', hex: '#F3EDE0' },
    { handle: 'blush-pink-silk-lehenga-choli-al9030', color: 'Blush Pink', hex: '#E9B8BE' },
    { handle: 'mint-green-silk-lehenga-choli-al9029', color: 'Mint Green', hex: '#BCD8C8' },
    { handle: 'yellow-silk-lehenga-choli-al9027', color: 'Yellow', hex: '#E9C64B' },
  ],
};

export function getColorwaysForHandle(handle: string): {
  swatches: ColorwaySwatch[];
  current: ColorwaySwatch | null;
} {
  const family = COLORWAY_FAMILIES[handle];
  const swatches = family ? FAMILIES[family.replace('family:', '')] ?? [] : [];
  return {
    swatches,
    current: swatches.find((swatch) => swatch.handle === handle) ?? null,
  };
}
