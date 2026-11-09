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
};

const FAMILIES: Record<string, ColorwaySwatch[]> = {
  mira: [
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
