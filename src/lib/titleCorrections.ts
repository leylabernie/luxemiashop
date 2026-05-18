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
 *
 * SEARCHABLE FABRICS ONLY: silk, georgette, art silk, net, velvet, jacquard,
 * banarasi, tissue silk, crepe, satin, cotton
 * NEVER USE: vichitra, chinon, fendi, pure viscose, wholesaler jargon
 *
 * Total products mapped: 149 | Manual corrections: 48 | Auto-corrected: 101
 */

export const PRODUCT_TITLE_CORRECTIONS: Record<string, string> = {
  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 1: SILK EMBROIDERY (9) — Pearl White base + colored embroidery
  // Pattern: [AccentColor] Silk Embroidery → [AccentColor] is dupatta/choli color
  // ═══════════════════════════════════════════════════════════════════════════════

  'maroon-silk-embroidery-lehenga-choli-with-dupatta':
    'Pearl White Silk Lehenga Choli with Maroon Embroidered Dupatta',

  'wine-silk-embroidery-lehenga-choli-with-dupatta':
    'Pearl White Silk Lehenga Choli with Wine Embroidered Dupatta',

  'rani-pink-silk-embroidered-designer-lehenga-choli-dupatta':
    'Ivory Silk Lehenga Choli with Rani Pink Embroidered Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 2: GEORGETTE EMBROIDERY (6) — Ivory base + colored embroidery
  // ═══════════════════════════════════════════════════════════════════════════════

  'green-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Lehenga Choli with Green Embroidered Dupatta',

  'purple-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Lehenga Choli with Purple Embroidered Dupatta',

  'turquoise-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Lehenga Choli with Turquoise Embroidered Dupatta',

  'rust-orange-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Lehenga Choli with Rust Orange Embroidered Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 3: ART SILK EMBROIDERY (2) — Ivory base + colored embroidery
  // Vichitra → Art Silk (non-searchable → searchable)
  // ═══════════════════════════════════════════════════════════════════════════════

  'dark-blue-pure-vichitra-embroidery-lehenga-choli-with-dupatta':
    'Ivory Art Silk Lehenga Choli with Dark Blue Embroidered Dupatta',

  'wine-pure-vichitra-embroidery-lehenga-choli-with-dupatta':
    'Ivory Art Silk Lehenga Choli with Wine Embroidered Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 4: SILK EMBROIDERY FULL SET (9) — Pearl White base + colored embroidery
  // ═══════════════════════════════════════════════════════════════════════════════

  'blue-silk-embroidery-lehenga-choli-with-dupatta':
    'Pearl White Silk Lehenga Choli with Blue Embroidered Dupatta',

  'green-silk-embroidery-lehenga-choli-with-dupatta':
    'Pearl White Silk Lehenga Choli with Green Embroidered Dupatta',

  'pink-silk-embroidery-lehenga-choli-with-dupatta':
    'Pearl White Silk Lehenga Choli with Pink Embroidered Dupatta',

  'purple-silk-embroidery-lehenga-choli-with-dupatta':
    'Pearl White Silk Lehenga Choli with Purple Embroidered Dupatta',

  'blue-silk-embroidery-festive-lehenga-choli':
    'Pearl White Silk Embroidery Festive Lehenga Choli with Blue Dupatta',

  'green-silk-embroidery-festive-lehenga-choli':
    'Pearl White Silk Embroidery Festive Lehenga Choli with Green Dupatta',

  'pink-silk-embroidery-occasion-lehenga-choli':
    'Pearl White Silk Embroidery Occasion Lehenga Choli with Pink Dupatta',

  'purple-silk-embroidery-occasion-lehenga-choli':
    'Pearl White Silk Embroidery Occasion Lehenga Choli with Purple Dupatta',

  'maroon-silk-embroidery-festive-lehenga-choli':
    'Pearl White Silk Embroidery Festive Lehenga Choli with Maroon Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 5: GEORGETTE EMBROIDERY EXTENDED (6) — Ivory base + colored embroidery
  // ═══════════════════════════════════════════════════════════════════════════════

  'wine-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Lehenga Choli with Wine Embroidered Dupatta',

  'yellow-georgette-embroidery-occasion-lehenga-choli':
    'Ivory Georgette Embroidery Occasion Lehenga Choli with Yellow Dupatta',

  'blue-georgette-embroidery-occasion-lehenga-choli':
    'Ivory Georgette Embroidery Occasion Lehenga Choli with Blue Dupatta',

  'rust-orange-georgette-embroidery-occasion-lehenga-choli':
    'Ivory Georgette Embroidery Occasion Lehenga Choli with Rust Orange Dupatta',

  'teal-blue-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Lehenga Choli with Teal Blue Embroidered Dupatta',

  'cream-silk-embroidery-festive-lehenga-choli':
    'Cream Silk Embroidery Festive Lehenga Choli with Matching Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 6: ART SILK FESTIVE (4) — Ivory base + colored embroidery
  // ═══════════════════════════════════════════════════════════════════════════════

  'off-white-pure-vichitra-embroidery-lehenga-choli-with-dupatta':
    'Off-White Art Silk Lehenga Choli with Embroidered Dupatta',

  'rani-pink-pure-vichitra-embroidery-lehenga-choli-with-dupatta':
    'Ivory Art Silk Lehenga Choli with Rani Pink Embroidered Dupatta',

  'dark-blue-pure-vichitra-embroidery-festive-lehenga-choli':
    'Ivory Art Silk Embroidery Festive Lehenga Choli with Dark Blue Dupatta',

  'wine-pure-vichitra-embroidery-festive-lehenga-choli':
    'Ivory Art Silk Embroidery Festive Lehenga Choli with Wine Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 7: ART SILK SEQUINS (2) — Ivory base + colored sequins
  // ═══════════════════════════════════════════════════════════════════════════════

  'blue-vichitra-silk-sequins-lehenga-choli-with-dupatta':
    'Ivory Art Silk Sequins Lehenga Choli with Blue Dupatta',

  'rust-orange-vichitra-silk-sequins-lehenga-choli-with-dupatta':
    'Ivory Art Silk Sequins Lehenga Choli with Rust Orange Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 8: GEORGETTE THREAD (3) — Ivory base + colored thread work
  // ═══════════════════════════════════════════════════════════════════════════════

  'rama-blue-georgette-thread-lehenga-choli-with-dupatta':
    'Ivory Georgette Thread Lehenga Choli with Rama Blue Dupatta',

  'rust-orange-georgette-thread-lehenga-choli-with-dupatta':
    'Ivory Georgette Thread Lehenga Choli with Rust Orange Dupatta',

  'olive-green-georgette-thread-lehenga-choli-with-dupatta':
    'Ivory Georgette Thread Lehenga Choli with Olive Green Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 9: CHINON → GEORGETTE (1) — Chinon is non-searchable, use Georgette
  // ═══════════════════════════════════════════════════════════════════════════════

  'wine-chinon-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Embroidery Lehenga Choli with Wine Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 10: NET THREAD (4) — Ivory net base + colored thread embroidery
  // ═══════════════════════════════════════════════════════════════════════════════

  'sky-blue-net-thread-lehenga-choli-with-dupatta':
    'Ivory Net Thread Lehenga Choli with Sky Blue Embroidered Dupatta',

  'lavender-net-thread-lehenga-choli-with-dupatta':
    'Ivory Net Thread Lehenga Choli with Lavender Embroidered Dupatta',

  'pink-net-thread-lehenga-choli-with-dupatta':
    'Ivory Net Thread Lehenga Choli with Pink Embroidered Dupatta',

  'yellow-net-thread-lehenga-choli-with-dupatta':
    'Ivory Net Thread Lehenga Choli with Yellow Embroidered Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 11: NET SEQUINS LOWER PRICE (2) — Ivory net base + colored sequins
  // ═══════════════════════════════════════════════════════════════════════════════

  'pista-green-net-sequins-lehenga-choli-with-dupatta':
    'Ivory Net Sequins Lehenga Choli with Pista Green Dupatta',

  'teal-green-net-sequins-festive-lehenga-choli':
    'Ivory Net Sequins Festive Lehenga Choli with Teal Green Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 12: MEHENDI/OLIVE TONE (2) — Ivory base + mehendi green accents
  // ═══════════════════════════════════════════════════════════════════════════════

  'mehendi-net-embroidery-lehenga-choli-with-dupatta':
    'Ivory Net Embroidery Lehenga Choli with Mehendi Green Dupatta',

  'mehendi-green-net-embroidery-lehenga-choli-with-dupatta':
    'Ivory Net Embroidery Lehenga Choli with Mehendi Green Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 13: JACQUARD SILK (3) — Fendi → Jacquard, Ivory base + colored embroidery
  // Non-partywear variants at lower price: color is dupatta accent, not base
  // ═══════════════════════════════════════════════════════════════════════════════

  'pink-fendi-silk-embroidery-lehenga-choli':
    'Ivory Jacquard Silk Lehenga Choli with Pink Embroidered Dupatta',

  'maroon-fendi-silk-embroidery-lehenga-choli':
    'Ivory Jacquard Silk Lehenga Choli with Maroon Embroidered Dupatta',

  'purple-fendi-silk-embroidery-lehenga-choli':
    'Ivory Jacquard Silk Lehenga Choli with Purple Embroidered Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 14: FAUX GEORGETTE (2) — Ivory base + colored embroidery
  // ═══════════════════════════════════════════════════════════════════════════════

  'pink-faux-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Faux Georgette Lehenga Choli with Pink Embroidered Dupatta',

  'red-faux-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Faux Georgette Lehenga Choli with Red Embroidered Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 15: PURE VISCOSE → ART SILK (1) — Obscure term replacement
  // ═══════════════════════════════════════════════════════════════════════════════

  'embroidery-work-lehenga-choli-in-pure-viscose-off-white':
    'Embroidery Work Lehenga Choli in Art Silk Off-White',

  // ═══════════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════════
  // BELOW: GENUINELY COLORED PRODUCTS — No color-hierarchy correction needed
  // These are included ONLY for fabric-name sanitization (Vichitra→Art Silk, etc.)
  // Auto-correct handles: Fendi→Jacquard, Vichitra→Art Silk, Chinon→Georgette
  // ═══════════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════════

  // ── PHASE 16: GEORGETTE SILK PARTY WEAR (4) — Genuinely colored base ──
  // Price ~$86 | Color in title IS the lehenga base color

  'georgette-silk-maroon-party-wear-embroidery-work-lehenga-choli':
    'Maroon Georgette Silk Party Wear Embroidery Work Lehenga Choli',

  'georgette-silk-blue-party-wear-embroidery-work-lehenga-choli':
    'Blue Georgette Silk Party Wear Embroidery Work Lehenga Choli',

  'georgette-silk-purple-party-wear-embroidery-work-lehenga-choli':
    'Purple Georgette Silk Party Wear Embroidery Work Lehenga Choli',

  'georgette-silk-rani-pink-party-wear-embroidery-work-lehenga-choli':
    'Rani Pink Georgette Silk Party Wear Embroidery Work Lehenga Choli',

  // ── PHASE 17: JACQUARD SILK PARTYWear (4) — Fendi→Jacquard, genuinely colored ──
  // Price $67-$80 | Jacquard silk IS the stated color

  'blue-fendi-silk-embroidery-partywear-lehenga-with-dupatta':
    'Blue Jacquard Silk Embroidery Partywear Lehenga with Dupatta',

  'maroon-fendi-silk-embroidery-partywear-lehenga-with-dupatta':
    'Maroon Jacquard Silk Embroidery Partywear Lehenga with Dupatta',

  'purple-fendi-silk-embroidery-partywear-lehenga-with-dupatta':
    'Purple Jacquard Silk Embroidery Partywear Lehenga with Dupatta',

  'rani-pink-fendi-silk-embroidery-partywear-lehenga-with-dupatta':
    'Rani Pink Jacquard Silk Embroidery Partywear Lehenga with Dupatta',
};

// ═══════════════════════════════════════════════════════════════════════════════
// GENUINELY COLORED — NOT IN CORRECTIONS MAP (auto-correct preserves originals)
// These products have genuinely colored base fabric; title color IS accurate
// ═══════════════════════════════════════════════════════════════════════════════

// PHASE 18: VELVET THREAD (2) — $121 | Velvet IS the base color
// red-velvet-thread-lehenga-choli-with-dupatta
// maroon-velvet-thread-lehenga-choli-with-dupatta

// PHASE 19: NET EMBROIDERY PARTYWear (12) — $133-$284 | Net IS the base color
// teal-blue-net-embroidery-partywear-lehenga-with-dupatta
// cream-net-embroidery-partywear-lehenga-with-dupatta
// beige-net-embroidery-partywear-lehenga-with-dupatta
// rani-pink-net-embroidery-partywear-lehenga-with-dupatta
// blue-net-embroidery-partywear-lehenga-with-dupatta
// dusty-pink-net-embroidery-partywear-lehenga-with-dupatta
// lilac-net-embroidery-partywear-lehenga-with-dupatta
// pista-green-net-embroidery-partywear-lehenga-with-dupatta
// peach-net-embroidery-partywear-lehenga-with-dupatta
// sky-blue-net-embroidery-partywear-lehenga-with-dupatta
// white-net-embroidery-partywear-lehenga-with-dupatta
// wine-net-embroidery-lehenga-choli-with-dupatta

// PHASE 20: NET EMBROIDERY BRIDAL (8) — $133-$284 | Net IS the base color
// yellow-net-embroidery-bridal-lehenga-with-dupatta
// maroon-net-embroidery-bridal-lehenga-with-dupatta
// beige-net-embroidery-bridal-lehenga-with-dupatta
// golden-net-embroidery-bridal-lehenga-with-dupatta
// light-pink-net-beads-bridal-lehenga-with-dupatta
// cream-net-beads-bridal-lehenga-with-dupatta
// off-white-satin-beads-bridal-lehenga-with-dupatta
// black-net-beads-bridal-lehenga-with-dupatta
// wine-net-embroidery-bridal-lehenga-with-dupatta

// PHASE 21: BANARASI / TISSUE SILK / CREPE BRIDAL (8) — $164-$297
// green-pure-banarasi-embroidery-bridal-lehenga-with-dupatta
// teal-green-tissue-silk-embroidery-bridal-lehenga-with-dupatta
// navy-blue-tissue-silk-embroidery-partywear-lehenga-with-dupatta
// pink-pure-banarasi-embroidery-bridal-lehenga-with-dupatta
// sky-blue-tissue-silk-embroidery-bridal-lehenga-with-dupatta
// multicolor-tissue-silk-embroidery-bridal-lehenga-with-dupatta
// purple-crepe-embroidery-bridal-lehenga-with-dupatta
// multicolor-crepe-embroidery-partywear-lehenga-with-dupatta

// PHASE 22: BEADS WORK (4) — Color IS the base material
// beads-work-lehenga-choli-in-net-beige
// beads-work-lehenga-choli-in-net-cream
// beads-work-lehenga-choli-in-satin-off-white
// beads-work-lehenga-choli-in-net-black

// PHASE 23: EMBROIDERY WORK (13) — Color/material IS the base
// embroidery-work-lehenga-choli-in-net-white
// embroidery-work-lehenga-choli-in-banarasi-silk-beige
// embroidery-work-lehenga-choli-in-tissue-silk-multicolor
// embroidery-work-lehenga-choli-in-net-green
// embroidery-work-lehenga-choli-in-silk-beige
// embroidery-work-lehenga-choli-in-net-mehendi
// embroidery-work-lehenga-choli-in-net-rani-pink
// embroidery-work-lehenga-choli-in-tissue-silk-green
// embroidery-work-lehenga-choli-in-crepe-purple
// embroidery-work-lehenga-choli-in-crepe-multicolor
// embroidery-work-lehenga-choli-in-net-peach
// embroidery-work-lehenga-choli-in-tissue-silk-sky-blue

// PHASE 24: NET SEQUINS HIGHER PRICE (4) — $111-$138 | Net IS genuinely colored
// blue-net-sequins-lehenga-choli-with-dupatta
// rani-pink-net-sequins-lehenga-choli-with-dupatta
// green-net-sequins-lehenga-choli-with-dupatta
// purple-net-sequins-lehenga-choli-with-dupatta

// PHASE 25: RANGOLI / MULTICOLOR (2) — Genuinely colored
// purple-rangoli-silk-embroidery-lehenga-choli-with-dupatta
// multicolor-georgette-sequins-lehenga-choli-with-dupatta

// PHASE 26: WHITE GEORGETTE PRINTED (1)
// white-georgette-printed-lehenga-choli-with-dupatta

// PHASE 27: NET EMBROIDERY WORK LUXEMIA (6) — $77-$217 | Genuinely colored
// green-net-embroidery-work-lehenga-choli-luxemia
// gold-net-embroidery-work-lehenga-choli-luxemia
// sky-net-embroidery-work-lehenga-choli-for-sangeet-luxemia
// gold-net-embroidery-work-lehenga-choli-luxemia
// rani-pink-net-embroidery-work-lehenga-choli-luxemia
// beige-net-embroidery-work-lehenga-choli-luxemia

// PHASE 28: NET EMBROIDERY FESTIVE (7) — $133-$214 | Genuinely colored
// teal-blue-net-embroidery-festive-lehenga-choli
// cream-net-embroidery-festive-lehenga-choli
// rani-pink-net-embroidery-festive-lehenga-choli
// blue-net-embroidery-festive-lehenga-choli
// dusty-pink-net-embroidery-festive-lehenga-choli
// wine-net-embroidery-festive-lehenga-choli

// PHASE 29: NET BEADS / BOTTLE GREEN / GOLDEN FESTIVE (4)
// beige-net-beads-festive-lehenga-choli
// light-pink-net-beads-festive-lehenga-choli
// bottle-green-net-embroidery-festive-lehenga-choli
// golden-net-embroidery-festive-lehenga-choli

// PHASE 30: NET SEQUINS OCCASION (3) — Genuinely colored
// blue-net-sequins-occasion-lehenga-choli
// rani-pink-net-sequins-occasion-lehenga-choli
// green-net-sequins-occasion-lehenga-choli

// PHASE 31: BANARASI / BEIGE NET (2)
// green-banarasi-embroidery-work-lehenga-choli-luxemia
// beige-net-embroidery-lehenga-choli-with-dupatta

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR VOCABULARY — Transform raw color names into luxury fashion terms
// ═══════════════════════════════════════════════════════════════════════════════

export const LUXURY_COLOR_MAP: Record<string, string> = {
  'maroon': 'Maroon',
  'wine': 'Wine',
  'rani-pink': 'Rani Pink',
  'pink': 'Pink',
  'pastel-pink': 'Pastel Pink',
  'green': 'Green',
  'emerald': 'Emerald Green',
  'mehendi': 'Mehendi Green',
  'mehendi-green': 'Mehendi Green',
  'pista-green': 'Pista Green',
  'teal-green': 'Teal Green',
  'bottle-green': 'Bottle Green',
  'olive-green': 'Olive Green',
  'purple': 'Purple',
  'royal-purple': 'Royal Purple',
  'lilac': 'Lilac',
  'lavender': 'Lavender',
  'turquoise': 'Turquoise',
  'blue': 'Blue',
  'royal-blue': 'Royal Blue',
  'sky-blue': 'Sky Blue',
  'teal-blue': 'Teal Blue',
  'navy': 'Navy Blue',
  'dark-blue': 'Dark Blue',
  'navy-blue': 'Navy Blue',
  'rust': 'Rust Orange',
  'rust-orange': 'Rust Orange',
  'orange': 'Orange',
  'rama-blue': 'Rama Blue',
  'olive': 'Olive Green',
  'gold': 'Gold',
  'golden': 'Golden',
  'yellow': 'Yellow',
  'black': 'Black',
  'cream': 'Cream',
  'ivory': 'Ivory',
  'pearl-white': 'Pearl White',
  'off-white': 'Off-White',
  'white': 'Pearl White',
  'red': 'Red',
  'crimson': 'Crimson Red',
  'peach': 'Peach',
  'mustard': 'Mustard',
  'brown': 'Brown',
  'copper': 'Copper',
  'bronze': 'Bronze',
  'coral': 'Coral',
  'magenta': 'Magenta',
  'fuchsia': 'Fuchsia',
  'mauve': 'Mauve',
  'beige': 'Beige',
  'champagne': 'Champagne',
  'silver': 'Silver',
  'grey': 'Grey',
  'gray': 'Grey',
  'multi': 'Multi-Color',
  'multicolor': 'Multi-Color',
  'dusty-pink': 'Dusty Pink',
};

// ═══════════════════════════════════════════════════════════════════════════════
// FABRIC-SPECIFIC BASE COLOR RULES
// Maps fabric types to their typical base color for lower-priced lehengas
// ═══════════════════════════════════════════════════════════════════════════════

const FABRIC_BASE_COLOR: Record<string, { base: string; priceThreshold: number }> = {
  'silk': { base: 'Pearl White', priceThreshold: 100 },
  'georgette': { base: 'Ivory', priceThreshold: 80 },
  'art-silk': { base: 'Ivory', priceThreshold: 110 },
  'jacquard': { base: 'Ivory', priceThreshold: 85 },
  'faux-georgette': { base: 'Ivory', priceThreshold: 80 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SANITIZATION: Non-searchable → searchable fabric term replacements
// Applied BEFORE pattern matching in autoCorrectTitle()
// ═══════════════════════════════════════════════════════════════════════════════

const FABRIC_SANITIZATION: Record<string, string> = {
  // Vichitra is obscure wholesaler jargon — Art Silk is the consumer-facing term
  'Vichitra': 'Art Silk',
  'vichitra': 'art silk',
  // Chinon is obscure — Georgette is the searchable consumer term
  'Chinon': 'Georgette',
  'chinon': 'georgette',
  // Fendi is obscure wholesaler jargon — Jacquard is the searchable term
  'Fendi': 'Jacquard',
  'fendi': 'jacquard',
  // Pure Viscose is obscure — Art Silk is the consumer-facing term
  'Pure Viscose': 'Art Silk',
  'pure viscose': 'art silk',
};

/**
 * Sanitize fabric names in a title — replace obscure wholesaler terms
 * with searchable consumer-facing fabric names
 */
function sanitizeFabricNames(title: string): string {
  let sanitized = title;
  for (const [obscure, searchable] of Object.entries(FABRIC_SANITIZATION)) {
    sanitized = sanitized.replaceAll(obscure, searchable);
  }
  return sanitized;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

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
  const commonAccentColors = [
    'maroon', 'wine', 'rani pink', 'purple', 'green', 'turquoise',
    'rust orange', 'dark blue', 'navy', 'gold', 'mustard', 'magenta',
    'fuchsia', 'coral', 'peach', 'olive', 'teal', 'pink', 'blue',
    'rama blue', 'mehendi', 'pista green', 'teal green', 'olive green',
    'lavender', 'lilac', 'sky blue', 'yellow', 'red', 'rust',
    'dusty pink', 'bottle green', 'golden',
  ];

  for (const accent of commonAccentColors) {
    if (lower.startsWith(accent + ' ') || lower.startsWith(accent.replace(' ', '-') + ' ')) {
      if (lower.includes('lehenga') && !lower.includes('bridal ' + accent)) {
        let suggestedBase = 'Ivory / Pearl White';
        if (lower.includes('silk') && !lower.includes('georgette') && !lower.includes('banarasi') && !lower.includes('jacquard')) {
          suggestedBase = 'Pearl White';
        } else if (lower.includes('georgette') || lower.includes('chinon')) {
          suggestedBase = 'Ivory';
        } else if (lower.includes('art silk') || lower.includes('vichitra')) {
          suggestedBase = 'Ivory';
        } else if (lower.includes('jacquard') || lower.includes('fendi')) {
          suggestedBase = 'Ivory';
        } else if (lower.includes('net') && lower.includes('embroidery') && !lower.includes('partywear') && !lower.includes('bridal')) {
          suggestedBase = 'Ivory';
        }
        return {
          hasIssue: true,
          reason: `Title starts with "${accent}" which is likely a dupatta/choli accent color, not the lehenga base. Lower-priced lehengas with this pattern typically have ivory/pearl white bases with colored embroidery work.`,
          suggestedBaseColor: suggestedBase,
        };
      }
    }
  }

  // Pattern 2: Title starts with generic black/white that may be misleading
  if (lower.match(/^(black|white)\s/)) {
    return {
      hasIssue: true,
      reason: 'Generic color name "black" or "white" — may be misleading without context of garment vs accessory.',
    };
  }

  return { hasIssue: false, reason: 'No obvious color-hierarchy issue detected.' };
}

/**
 * Determine if a lehenga's base color is likely genuinely the stated color
 * based on price, fabric, and naming patterns
 */
function isLikelyGenuineColor(title: string, price: number): boolean {
  const lower = title.toLowerCase();

  // High-priced bridal/partywear lehengas ($130+) are typically genuinely colored
  if (price >= 130) return true;

  // Velvet base fabric IS the stated color
  if (lower.includes('velvet')) return true;

  // Banarasi silk base IS the stated color (genuinely colored woven fabric)
  if (lower.includes('banarasi')) return true;

  // Tissue silk base IS the stated color (genuinely colored metallic fabric)
  if (lower.includes('tissue silk')) return true;

  // Crepe base IS the stated color
  if (lower.includes('crepe')) return true;

  // Satin base IS the stated color
  if (lower.includes('satin')) return true;

  // Jacquard base fabric IS genuinely colored (textured woven fabric)
  if (lower.includes('jacquard')) return true;

  // Rangoli silk IS genuinely colored
  if (lower.includes('rangoli')) return true;

  // Partywear/Bridal naming at higher prices indicates genuine color
  if ((lower.includes('partywear') || lower.includes('bridal')) && price >= 120) return true;

  // "Beads Work Lehenga Choli in [Material] [Color]" — color IS genuine
  if (lower.match(/beads work lehenga choli in/)) return true;

  // "Embroidery Work Lehenga Choli in [Material] [Color]" — color IS genuine
  if (lower.match(/embroidery work lehenga choli in/)) return true;

  // Net sequins at $100+ are typically genuinely colored net
  if (lower.includes('net sequins') && price >= 100) return true;

  // Multicolor IS accurate
  if (lower.includes('multicolor')) return true;

  // White/cream/off-white/beige/black ARE the base color (not accents)
  const baseColors = ['white ', 'cream ', 'off-white ', 'beige ', 'black ', 'ivory ', 'pearl white '];
  for (const base of baseColors) {
    if (lower.startsWith(base)) return true;
  }

  return false;
}

/**
 * Auto-generate corrected title for known problematic patterns
 * Uses heuristics to flip color hierarchy based on price, fabric, and naming
 *
 * STEP 1: Sanitize fabric names (Vichitra→Art Silk, Fendi→Jacquard, Chinon→Georgette)
 * STEP 2: Check manual corrections
 * STEP 3: Check if genuinely colored (keep original)
 * STEP 4: Apply pattern-based auto-correction
 */
export function autoCorrectTitle(
  originalTitle: string,
  handle: string,
  productType?: string,
  price?: number,
): string {
  // STEP 1: Sanitize fabric names — replace obscure terms with searchable ones
  const sanitizedTitle = sanitizeFabricNames(originalTitle);
  const sanitizedHandle = sanitizeFabricNames(handle);

  // STEP 2: Check if we have a manual correction for the sanitized handle
  const manual = getCorrectedTitle(sanitizedHandle) || getCorrectedTitle(handle);
  if (manual) return manual;

  // STEP 3: If price is available and the lehenga is likely genuinely colored, return sanitized original
  if (price && isLikelyGenuineColor(sanitizedTitle, price)) {
    return sanitizedTitle;
  }

  const lower = sanitizedTitle.toLowerCase();

  // STEP 4: Auto-detect and fix common patterns

  // Pattern: [Color] Silk Embroidery Lehenga Choli with Dupatta
  const silkMatch = sanitizedTitle.match(
    /^([A-Za-z\-]+)\s+Silk\s+(Embroidery|Embroidered|Sequin|Zari|Printed|Mirror|Gota)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (silkMatch) {
    const [, accentColor, work] = silkMatch;
    const baseColor = 'Pearl White';
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `${baseColor} Silk Lehenga Choli with ${accentColor} ${workDesc} Dupatta`;
  }

  // Pattern: [Color] Georgette Embroidery Lehenga Choli with Dupatta
  const georgetteMatch = sanitizedTitle.match(
    /^([A-Za-z\-]+)\s+Georgette\s+(Embroidery|Embroidered|Sequin|Zari|Printed|Mirror|Gota|Thread)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (georgetteMatch) {
    const [, accentColor, work] = georgetteMatch;
    const baseColor = 'Ivory';
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `${baseColor} Georgette Lehenga Choli with ${accentColor} ${workDesc} Dupatta`;
  }

  // Pattern: [Color] Art Silk Embroidery Lehenga Choli with Dupatta
  // (handles sanitized Vichitra→Art Silk titles)
  const artSilkMatch = sanitizedTitle.match(
    /^([A-Za-z\-]+)\s+Art\s+Silk\s+(Embroidery|Embroidered|Sequin|Zari)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (artSilkMatch) {
    const [, accentColor, work] = artSilkMatch;
    const baseColor = 'Ivory';
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `${baseColor} Art Silk Lehenga Choli with ${accentColor} ${workDesc} Dupatta`;
  }

  // Pattern: [Color] Pure Art Silk Embroidery Lehenga Choli with Dupatta
  const pureArtSilkMatch = sanitizedTitle.match(
    /^([A-Za-z\-]+)\s+Pure\s+Art\s+Silk\s+(Embroidery|Embroidered|Sequin|Zari)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (pureArtSilkMatch) {
    const [, accentColor, work] = pureArtSilkMatch;
    const baseColor = 'Ivory';
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `${baseColor} Art Silk Lehenga Choli with ${accentColor} ${workDesc} Dupatta`;
  }

  // Pattern: [Color] Art Silk Sequins Lehenga Choli with Dupatta
  // (handles sanitized Vichitra Silk Sequins titles)
  const artSilkSequinsMatch = sanitizedTitle.match(
    /^([A-Za-z\-]+)\s+Art\s+Silk\s+(Sequins|Sequined|Embroidery|Embroidered)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (artSilkSequinsMatch) {
    const [, accentColor, work] = artSilkSequinsMatch;
    const workDesc = work === 'Sequins' ? 'Sequins' : work === 'Embroidery' ? 'Embroidered' : work;
    return `Ivory Art Silk ${workDesc} Lehenga Choli with ${accentColor} Dupatta`;
  }

  // Pattern: [Color] Jacquard Silk Embroidery Lehenga Choli (non-partywear)
  // Lower-priced jacquard: color is dupatta accent, base is ivory
  const jacquardMatch = sanitizedTitle.match(
    /^([A-Za-z\-]+)\s+Jacquard\s+Silk\s+(Embroidery|Embroidered)\s+Lehenga\s+Choli$/
  );
  if (jacquardMatch && (!price || price < 100)) {
    const [, accentColor, work] = jacquardMatch;
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `Ivory Jacquard Silk Lehenga Choli with ${accentColor} ${workDesc} Dupatta`;
  }

  // Pattern: [Color] Georgette Thread Lehenga Choli with Dupatta
  const georgetteThreadMatch = sanitizedTitle.match(
    /^([A-Za-z\-]+)\s+Georgette\s+Thread\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (georgetteThreadMatch) {
    const [, accentColor] = georgetteThreadMatch;
    return `Ivory Georgette Thread Lehenga Choli with ${accentColor} Embroidered Dupatta`;
  }

  // Pattern: [Color] Net Thread Lehenga Choli with Dupatta
  const netThreadMatch = sanitizedTitle.match(
    /^([A-Za-z\-]+)\s+Net\s+Thread\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (netThreadMatch) {
    const [, accentColor] = netThreadMatch;
    return `Ivory Net Thread Lehenga Choli with ${accentColor} Embroidered Dupatta`;
  }

  // Pattern: [Color] Net Sequins Lehenga Choli with Dupatta (lower price)
  if (price && price < 75) {
    const netSequinsMatch = sanitizedTitle.match(
      /^([A-Za-z\-]+)\s+Net\s+(Sequins|Sequined)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
    );
    if (netSequinsMatch) {
      const [, accentColor] = netSequinsMatch;
      return `Ivory Net Sequins Lehenga Choli with ${accentColor} Dupatta`;
    }
  }

  // Pattern: [Color] Faux Georgette Embroidery Lehenga Choli with Dupatta
  const fauxGeorgetteMatch = sanitizedTitle.match(
    /^([A-Za-z\-]+)\s+Faux\s+Georgette\s+(Embroidery|Embroidered)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (fauxGeorgetteMatch) {
    const [, accentColor, work] = fauxGeorgetteMatch;
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `Ivory Faux Georgette Lehenga Choli with ${accentColor} ${workDesc} Dupatta`;
  }

  // Pattern: [Color] [Fabric] Embroidery Festive Lehenga Choli
  const festiveMatch = sanitizedTitle.match(
    /^([A-Za-z\-]+)\s+([A-Za-z\-]+)\s+(Embroidery|Embroidered)\s+Festive\s+Lehenga\s+Choli$/
  );
  if (festiveMatch) {
    const [, accentColor, fabric, work] = festiveMatch;
    const fabricLower = fabric.toLowerCase();
    let baseColor = 'Ivory';
    if (fabricLower === 'silk') baseColor = 'Pearl White';
    if (fabricLower === 'georgette') baseColor = 'Ivory';
    if (fabricLower === 'art' || fabricLower === 'art silk') baseColor = 'Ivory';
    if (fabricLower === 'jacquard') baseColor = 'Ivory';
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `${baseColor} ${fabric} ${workDesc} Festive Lehenga Choli with ${accentColor} Dupatta`;
  }

  // Pattern: [Color] [Fabric] Embroidery Occasion Lehenga Choli
  const occasionMatch = sanitizedTitle.match(
    /^([A-Za-z\-]+)\s+([A-Za-z\-]+)\s+(Embroidery|Embroidered)\s+Occasion\s+Lehenga\s+Choli$/
  );
  if (occasionMatch) {
    const [, accentColor, fabric, work] = occasionMatch;
    const fabricLower = fabric.toLowerCase();
    let baseColor = 'Ivory';
    if (fabricLower === 'silk') baseColor = 'Pearl White';
    if (fabricLower === 'georgette') baseColor = 'Ivory';
    if (fabricLower === 'art' || fabricLower === 'art silk') baseColor = 'Ivory';
    if (fabricLower === 'jacquard') baseColor = 'Ivory';
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `${baseColor} ${fabric} ${workDesc} Occasion Lehenga Choli with ${accentColor} Dupatta`;
  }

  // If no pattern matched, return sanitized original
  return sanitizedTitle;
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
  if (lower.includes('rani pink')) {
    keywords.push('rani pink lehenga', 'pink lehenga', 'hot pink lehenga');
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
  if (lower.includes('pink')) {
    keywords.push('pink lehenga', 'pink bridal lehenga');
  }
  if (lower.includes('red')) {
    keywords.push('red lehenga', 'red bridal lehenga');
  }
  if (lower.includes('gold') || lower.includes('golden')) {
    keywords.push('gold lehenga', 'golden lehenga');
  }
  if (lower.includes('yellow')) {
    keywords.push('yellow lehenga', 'haldi lehenga');
  }
  if (lower.includes('black')) {
    keywords.push('black lehenga', 'black partywear lehenga');
  }
  if (lower.includes('beige')) {
    keywords.push('beige lehenga', 'neutral lehenga');
  }
  if (lower.includes('crepe')) {
    keywords.push('crepe lehenga');
  }
  if (lower.includes('jacquard')) {
    keywords.push('jacquard lehenga', 'jacquard silk lehenga');
  }
  if (lower.includes('art silk')) {
    keywords.push('art silk lehenga');
  }

  // Two-tone / contrast keywords
  if (lower.includes('with')) {
    keywords.push('two tone lehenga', 'contrast lehenga', 'dual color lehenga');
  }

  // Bridal intent keywords
  if (lower.includes('silk') || lower.includes('embroidered') || lower.includes('bridal')) {
    keywords.push('bridal lehenga', 'wedding lehenga', 'designer lehenga');
  }

  // Partywear keywords
  if (lower.includes('partywear') || lower.includes('party wear')) {
    keywords.push('partywear lehenga', 'party wear lehenga', 'reception lehenga');
  }

  return [...new Set(keywords)]; // deduplicate
}
