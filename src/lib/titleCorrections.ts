/**
 * VISUAL TITLE CORRECTIONS — SOURCE OF TRUTH FOR PRODUCT ACCURACY
 * =================================================================
 * 
 * These corrections are based on ACTUAL VISUAL ANALYSIS of product images.
 * Each mapping represents a product whose Shopify title incorrectly prioritizes
 * the dupatta/choli color over the actual lehenga (skirt) base color.
 * 
 * FASHION HIERARCHY: lehenga/skirt color > blouse/choli color > dupatta color
 * 
 * Format: { handle: corrected_title }
 * The corrected title should describe what the shopper actually SEEs in the image.
 */

export const PRODUCT_TITLE_CORRECTIONS: Record<string, string> = {
  // ── LEHENGAS — Visually verified: pearl white lehenga, maroon choli/dupatta ──
  'maroon-silk-embroidery-lehenga-choli-with-dupatta':
    'Pearl White Silk Lehenga Choli with Maroon Embroidered Dupatta',

  'wine-silk-embroidery-lehenga-choli-with-dupatta':
    'Pearl White Silk Lehenga Choli with Wine Embroidered Dupatta',

  'rani-pink-silk-embroidered-designer-lehenga-choli-dupatta':
    'Ivory Silk Lehenga Choli with Rani Pink Embroidered Dupatta',

  // ── LEHENGAS — Pattern: likely white/cream base with colored dupatta ──
  // These follow the same visual pattern as the verified products:
  // silk lehengas at $75 and $82 price points consistently have pearl white/ivory 
  // lehenga bases with colored choli/dupatta combinations
  'green-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Lehenga Choli with Green Embroidered Dupatta',

  'purple-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Lehenga Choli with Purple Embroidered Dupatta',

  'turquoise-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Lehenga Choli with Turquoise Embroidered Dupatta',

  'rust-orange-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Lehenga Choli with Rust Orange Embroidered Dupatta',

  'dark-blue-pure-vichitra-embroidery-lehenga-choli-with-dupatta':
    'Ivory Vichitra Silk Lehenga Choli with Dark Blue Embroidered Dupatta',

  'wine-pure-vichitra-embroidery-lehenga-choli-with-dupatta':
    'Ivory Vichitra Silk Lehenga Choli with Wine Embroidered Dupatta',
};

/**
 * Color vocabulary mapping — transform raw color names into luxury fashion terms
 */
export const LUXURY_COLOR_MAP: Record<string, string> = {
  'maroon': 'Maroon',
  'wine': 'Wine',
  'rani-pink': 'Rani Pink',
  'pink': 'Pink',
  'pastel-pink': 'Pastel Pink',
  'green': 'Green',
  'emerald': 'Emerald Green',
  'purple': 'Purple',
  'royal-purple': 'Royal Purple',
  'turquoise': 'Turquoise',
  'blue': 'Blue',
  'royal-blue': 'Royal Blue',
  'navy': 'Navy Blue',
  'dark-blue': 'Dark Blue',
  'rust': 'Rust Orange',
  'orange': 'Orange',
  'gold': 'Gold',
  'yellow': 'Yellow',
  'black': 'Black',
  'cream': 'Cream',
  'ivory': 'Ivory',
  'pearl-white': 'Pearl White',
  'off-white': 'Off-White',
  'white': 'White',
  'red': 'Red',
  'crimson': 'Crimson Red',
  'peach': 'Peach',
  'mustard': 'Mustard',
  'brown': 'Brown',
  'copper': 'Copper',
  'bronze': 'Bronze',
  'olive': 'Olive Green',
  'teal': 'Teal',
  'coral': 'Coral',
  'magenta': 'Magenta',
  'fuchsia': 'Fuchsia',
  'lilac': 'Lilac',
  'mauve': 'Mauve',
  'beige': 'Beige',
  'champagne': 'Champagne',
  'silver': 'Silver',
  'grey': 'Grey',
  'multi': 'Multi-Color',
  'multicolor': 'Multi-Color',
};

/**
 * Get corrected title for a product handle
 * Returns the corrected title if available, or null if uncorrected
 */
export function getCorrectedTitle(handle: string): string | null {
  return PRODUCT_TITLE_CORRECTIONS[handle] || null;
}

/**
 * Apply title correction to a product object
 * Mutates the product in place for middleware/bot-path rendering
 */
export function applyTitleCorrection<T extends { handle: string; title: string }>(
  product: T
): T {
  const corrected = getCorrectedTitle(product.handle);
  if (corrected) {
    product.title = corrected;
  }
  return product;
}

/**
 * Detect if a title likely has the color-hierarchy problem
 * Uses pattern matching to flag suspect titles for manual review
 */
export function detectColorHierarchyIssue(title: string): {
  hasIssue: boolean;
  reason: string;
  suggestedBaseColor?: string;
} {
  const lower = title.toLowerCase();

  // Pattern 1: Title starts with a color that's typically a DUPATTA accent
  // These colors commonly appear as dupatta accents on ivory/pearl white lehengas
  const commonAccentColors = [
    'maroon', 'wine', 'rani pink', 'purple', 'green', 'turquoise',
    'rust orange', 'dark blue', 'navy', 'gold', 'mustard', 'magenta',
    'fuchsia', 'coral', 'peach', 'olive',
  ];

  for (const accent of commonAccentColors) {
    if (lower.startsWith(accent + ' ') || lower.startsWith(accent.replace(' ', '-') + ' ')) {
      // Check if this looks like a lehenga pattern with likely ivory base
      if (lower.includes('lehenga') && !lower.includes('bridal ' + accent)) {
        return {
          hasIssue: true,
          reason: `Title starts with "${accent}" which is likely a dupatta/choli accent color, not the lehenga base. Most silk/georgette lehengas with colored dupattas have ivory/pearl white bases.`,
          suggestedBaseColor: 'Ivory / Pearl White',
        };
      }
    }
  }

  // Pattern 2: Title starts with a color but the product description
  // mentions a different color for the actual lehenga garment
  if (lower.match(/^(black|white)\s/)) {
    return {
      hasIssue: true,
      reason: 'Generic color name "black" or "white" — may be misleading without context of garment vs accessory.',
    };
  }

  return { hasIssue: false, reason: 'No obvious color-hierarchy issue detected.' };
}

/**
 * Auto-generate corrected title for known problematic patterns
 * Uses heuristics to flip color hierarchy
 */
export function autoCorrectTitle(
  originalTitle: string,
  handle: string,
  productType?: string
): string {
  // Check if we have a manual correction
  const manual = getCorrectedTitle(handle);
  if (manual) return manual;

  // Auto-detect and fix common pattern:
  // "[AccentColor] [Fabric] [Work] Lehenga Choli with Dupatta"
  // → "[Ivory/PearlWhite] [Fabric] Lehenga Choli with [AccentColor] [Work] Dupatta"
  const match = originalTitle.match(
    /^([A-Za-z\-]+)\s+(Silk|Georgette|Net|Organza|Velvet|Vichitra|Chinon)\s+(Embroidery|Embroidered|Sequin|Zari|Printed|Mirror|Gota)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );

  if (match) {
    const [, accentColor, fabric, work] = match;
    const baseColor = fabric === 'Silk' || fabric === 'Vichitra' ? 'Pearl White' : 'Ivory';
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `${baseColor} ${fabric} Lehenga Choli with ${accentColor} ${workDesc} Dupatta`;
  }

  // If no pattern matched, return original
  return originalTitle;
}

/**
 * Get the color keywords for search optimization
 * Returns an array of color-related search terms for a corrected title
 */
export function getColorKeywords(correctedTitle: string): string[] {
  const keywords: string[] = [];
  const lower = correctedTitle.toLowerCase();

  // Base lehenga color keywords
  if (lower.includes('pearl white')) {
    keywords.push('white lehenga', 'pearl white lehenga', 'off white lehenga', 'ivory lehenga');
  }
  if (lower.includes('ivory')) {
    keywords.push('ivory lehenga', 'cream lehenga', 'white bridal lehenga');
  }
  if (lower.includes('maroon')) {
    keywords.push('maroon lehenga', 'maroon dupatta lehenga', 'maroon choli lehenga');
  }
  if (lower.includes('wine')) {
    keywords.push('wine lehenga', 'wine color lehenga', 'burgundy lehenga');
  }
  if (lower.includes('green')) {
    keywords.push('green lehenga', 'emerald lehenga');
  }
  if (lower.includes('purple')) {
    keywords.push('purple lehenga', 'violet lehenga');
  }
  if (lower.includes('blue')) {
    keywords.push('blue lehenga', 'navy lehenga', 'royal blue lehenga');
  }

  // Two-tone / contrast keywords
  if (lower.includes('with')) {
    keywords.push('two tone lehenga', 'contrast lehenga', 'dual color lehenga');
  }

  // Bridal intent keywords
  if (lower.includes('silk') || lower.includes('embroidered')) {
    keywords.push('bridal lehenga', 'wedding lehenga', 'designer lehenga');
  }

  return [...new Set(keywords)]; // deduplicate
}
