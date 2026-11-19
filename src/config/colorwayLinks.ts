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

const HANDLE_TO_FAMILY: Record<string, string> = {
  'crimson-red-silk-royal-arch-zardosi-bridal-lehenga-double-dupatta': 'bv3-royal-arch',
  'marigold-saffron-silk-royal-arch-bridal-lehenga-double-dupatta': 'bv3-royal-arch',
  'scarlet-red-silk-mughal-paisley-bridal-lehenga-double-dupatta': 'bv3-mughal-paisley',
  'royal-fuchsia-silk-mughal-paisley-bridal-lehenga-double-dupatta': 'bv3-mughal-paisley',
  'rani-magenta-silk-rajputana-palace-bridal-lehenga-double-dupatta': 'bv3-rajputana-palace',
  'crimson-red-silk-rajputana-palace-bridal-lehenga-double-dupatta': 'bv3-rajputana-palace',
  'burnt-saffron-silk-rajputana-palace-bridal-lehenga-double-dupatta': 'bv3-rajputana-palace',
  'rani-pink-silk-heritage-jharokha-bridal-lehenga-double-dupatta': 'bv3-heritage-jharokha',
  'sindoori-red-silk-heritage-jharokha-bridal-lehenga-double-dupatta': 'bv3-heritage-jharokha',
};

const FAMILIES: Record<string, ColorwaySwatch[]> = {
  mira: [],
  'bv3-royal-arch': [
    {
      handle: 'crimson-red-silk-royal-arch-zardosi-bridal-lehenga-double-dupatta',
      color: 'Crimson Red',
      hex: '#9E1420',
    },
    {
      handle: 'marigold-saffron-silk-royal-arch-bridal-lehenga-double-dupatta',
      color: 'Marigold Saffron',
      hex: '#C95B16',
    },
  ],
  'bv3-mughal-paisley': [
    {
      handle: 'scarlet-red-silk-mughal-paisley-bridal-lehenga-double-dupatta',
      color: 'Scarlet Red',
      hex: '#B81822',
    },
    {
      handle: 'royal-fuchsia-silk-mughal-paisley-bridal-lehenga-double-dupatta',
      color: 'Royal Fuchsia',
      hex: '#B51763',
    },
  ],
  'bv3-rajputana-palace': [
    {
      handle: 'crimson-red-silk-rajputana-palace-bridal-lehenga-double-dupatta',
      color: 'Crimson Red',
      hex: '#9B111E',
    },
    {
      handle: 'rani-magenta-silk-rajputana-palace-bridal-lehenga-double-dupatta',
      color: 'Rani Magenta',
      hex: '#A61458',
    },
    {
      handle: 'burnt-saffron-silk-rajputana-palace-bridal-lehenga-double-dupatta',
      color: 'Burnt Saffron',
      hex: '#B84718',
    },
  ],
  'bv3-heritage-jharokha': [
    {
      handle: 'sindoori-red-silk-heritage-jharokha-bridal-lehenga-double-dupatta',
      color: 'Sindoori Red',
      hex: '#A8131E',
    },
    {
      handle: 'rani-pink-silk-heritage-jharokha-bridal-lehenga-double-dupatta',
      color: 'Rani Pink',
      hex: '#C2186A',
    },
  ],
};

export function getColorwaysForHandle(handle: string): {
  swatches: ColorwaySwatch[];
  current: ColorwaySwatch | null;
} {
  const family = HANDLE_TO_FAMILY[handle];
  const swatches = (family && FAMILIES[family]) || [];
  return {
    swatches,
    current: swatches.find((swatch) => swatch.handle === handle) ?? null,
  };
}
