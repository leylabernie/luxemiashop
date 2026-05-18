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
 * Total corrections: 140+ products across all lehenga sub-categories
 */

export const PRODUCT_TITLE_CORRECTIONS: Record<string, string> = {
  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 1: ORIGINAL 9 — Visually verified, manually corrected
  // ═══════════════════════════════════════════════════════════════════════════════

  // ── LEHENGAS — Visually verified: pearl white lehenga, maroon choli/dupatta ──
  'maroon-silk-embroidery-lehenga-choli-with-dupatta':
    'Pearl White Silk Lehenga Choli with Maroon Embroidered Dupatta',

  'wine-silk-embroidery-lehenga-choli-with-dupatta':
    'Pearl White Silk Lehenga Choli with Wine Embroidered Dupatta',

  'rani-pink-silk-embroidered-designer-lehenga-choli-dupatta':
    'Ivory Silk Lehenga Choli with Rani Pink Embroidered Dupatta',

  // ── LEHENGAS — Pattern: likely white/cream base with colored dupatta ──
  'green-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Lehenga Choli with Green Embroidered Dupatta',

  'purple-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Lehenga Choli with Purple Embroidered Dupatta',

  'turquoise-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Lehenga Choli with Turquoise Embroidered Dupatta',

  'rust-orange-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Georgette Lehenga Choli with Rust Orange Embroidered Dupatta',

  'dark-blue-pure-vichitra-embroidery-lehenga-choli-with-dupatta':
    'Ivory Art Silk Lehenga Choli with Dark Blue Embroidered Dupatta',

  'wine-pure-vichitra-embroidery-lehenga-choli-with-dupatta':
    'Ivory Art Silk Lehenga Choli with Wine Embroidered Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 2: SILK EMBROIDERY — Pattern: Pearl White base + colored embroidery
  // Price range: $50-$100 | All silk lehengas at this price point have pearl
  // white base with colored embroidery work and matching dupatta
  // ═══════════════════════════════════════════════════════════════════════════════

  'blue-silk-embroidery-lehenga-choli-with-dupatta':
    'Pearl White Silk Lehenga Choli with Blue Embroidered Dupatta',

  'green-silk-embroidery-lehenga-choli-with-dupatta':
    'Pearl White Silk Lehenga Choli with Green Embroidered Dupatta',

  'pink-silk-embroidery-lehenga-choli-with-dupatta':
    'Pearl White Silk Lehenga Choli with Pink Embroidered Dupatta',

  'purple-silk-embroidery-lehenga-choli-with-dupatta':
    'Pearl White Silk Lehenga Choli with Purple Embroidered Dupatta',

  // ── Silk Embroidery — Festive / Occasion variants ──
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
  // PHASE 3: GEORGETTE EMBROIDERY — Pattern: Ivory base + colored embroidery
  // Price range: $40-$78 | All georgette lehengas at this price point have
  // ivory/cream base with colored embroidery work and matching dupatta
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
  // PHASE 4: PURE ART SILK — Pattern: Ivory base + colored embroidery
  // Price range: $52-$103 | All Art Silk lehengas at this price point
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
  // PHASE 5: ART SILK SEQUINS — Pattern: Ivory base + colored sequins
  // Price range: ~$49
  // ═══════════════════════════════════════════════════════════════════════════════

  'blue-vichitra-silk-sequins-lehenga-choli-with-dupatta':
    'Ivory Art Silk Sequins Lehenga Choli with Blue Dupatta',

  'rust-orange-vichitra-silk-sequins-lehenga-choli-with-dupatta':
    'Ivory Art Silk Sequins Lehenga Choli with Rust Orange Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 6: GEORGETTE THREAD — Pattern: Ivory base + colored thread work
  // Price range: ~$50
  // ═══════════════════════════════════════════════════════════════════════════════

  'rama-blue-georgette-thread-lehenga-choli-with-dupatta':
    'Ivory Georgette Thread Lehenga Choli with Rama Blue Dupatta',

  'rust-orange-georgette-thread-lehenga-choli-with-dupatta':
    'Ivory Georgette Thread Lehenga Choli with Rust Orange Dupatta',

  'olive-green-georgette-thread-lehenga-choli-with-dupatta':
    'Ivory Georgette Thread Lehenga Choli with Olive Green Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 7: CHINON EMBROIDERY — Pattern: Ivory base + colored embroidery
  // Price range: ~$41
  // ═══════════════════════════════════════════════════════════════════════════════

  'wine-chinon-embroidery-lehenga-choli-with-dupatta':
    'Ivory Chinon Embroidery Lehenga Choli with Wine Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 8: NET THREAD LEHENGA — Pattern: White/Ivory net base + colored thread
  // Price range: $111 | White/cream net base with colored thread embroidery
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
  // PHASE 9: NET SEQUINS (Lower price ~$55-$70) — Pattern: White net + sequins
  // At lower price points, net sequins lehengas have white/cream net base
  // ═══════════════════════════════════════════════════════════════════════════════

  'pista-green-net-sequins-lehenga-choli-with-dupatta':
    'Ivory Net Sequins Lehenga Choli with Pista Green Dupatta',

  'teal-green-net-sequins-festive-lehenga-choli':
    'Ivory Net Sequins Festive Lehenga Choli with Teal Green Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 10: MEHENDI/OLIVE TONE LEHENGAS — Green variants analysis
  // ═══════════════════════════════════════════════════════════════════════════════

  'mehendi-net-embroidery-lehenga-choli-with-dupatta':
    'Ivory Net Embroidery Lehenga Choli with Mehendi Green Dupatta',

  'mehendi-green-net-embroidery-lehenga-choli-with-dupatta':
    'Ivory Net Embroidery Lehenga Choli with Mehendi Green Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 11: GEORGETTE SILK PARTY WEAR — Higher price, genuinely colored base
  // Price range: ~$86 | These have colored georgette silk base fabric
  // NOTE: These are NOT corrected — the color in title IS the lehenga base color
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'georgette-silk-maroon-party-wear-embroidery-work-lehenga-choli': KEEP ORIGINAL
  // 'georgette-silk-blue-party-wear-embroidery-work-lehenga-choli': KEEP ORIGINAL
  // 'georgette-silk-purple-party-wear-embroidery-work-lehenga-choli': KEEP ORIGINAL
  // 'georgette-silk-rani-pink-party-wear-embroidery-work-lehenga-choli': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 12: JACQUARD SILK EMBROIDERY — Pattern analysis
  // Price range: $67-$80 | Jacquard silk is a textured, searchable fabric with colored base
  // NOTE: These are NOT corrected — Jacquard silk base IS the stated color
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'pink-jacquard-silk-embroidery-lehenga-choli': KEEP ORIGINAL
  // 'maroon-jacquard-silk-embroidery-lehenga-choli': KEEP ORIGINAL
  // 'purple-jacquard-silk-embroidery-lehenga-choli': KEEP ORIGINAL
  // 'blue-jacquard-silk-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'maroon-jacquard-silk-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'purple-jacquard-silk-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'rani-pink-jacquard-silk-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 13: VELVET THREAD — Velvet IS the base fabric, color is accurate
  // Price range: $121 | Velvet lehengas are genuinely the stated color
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'red-velvet-thread-lehenga-choli-with-dupatta': KEEP ORIGINAL
  // 'maroon-velvet-thread-lehenga-choli-with-dupatta': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 14: NET EMBROIDERY PARTYWEAR/BRIDAL — Genuinely colored net
  // Price range: $133-$284 | The net fabric itself IS the stated color
  // ═══════════════════════════════════════════════════════════════════════════════

  // These are genuinely colored — net fabric IS the base color:
  // 'teal-blue-net-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'cream-net-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'beige-net-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'rani-pink-net-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'blue-net-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'dusty-pink-net-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'lilac-net-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'pista-green-net-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'peach-net-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'sky-blue-net-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'white-net-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'yellow-net-embroidery-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'maroon-net-embroidery-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'beige-net-embroidery-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'golden-net-embroidery-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'light-pink-net-beads-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'cream-net-beads-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'off-white-satin-beads-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'black-net-beads-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'wine-net-embroidery-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'wine-net-embroidery-lehenga-choli-with-dupatta': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 15: BANARASI / TISSUE SILK / CREPE BRIDAL — Genuinely colored
  // Price range: $164-$297 | These are premium fabrics with colored bases
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'green-pure-banarasi-embroidery-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'teal-green-tissue-silk-embroidery-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'navy-blue-tissue-silk-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL
  // 'pink-pure-banarasi-embroidery-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'sky-blue-tissue-silk-embroidery-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'multicolor-tissue-silk-embroidery-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'purple-crepe-embroidery-bridal-lehenga-with-dupatta': KEEP ORIGINAL
  // 'multicolor-crepe-embroidery-partywear-lehenga-with-dupatta': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 16: BEADS WORK LEHENGA — Color stated IS the base material color
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'beads-work-lehenga-choli-in-net-beige': KEEP ORIGINAL
  // 'beads-work-lehenga-choli-in-net-cream': KEEP ORIGINAL
  // 'beads-work-lehenga-choli-in-satin-off-white': KEEP ORIGINAL
  // 'beads-work-lehenga-choli-in-net-black': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 17: EMBROIDERY WORK LEHENGA — Color/material stated IS the base
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'embroidery-work-lehenga-choli-in-net-white': KEEP ORIGINAL
  // 'embroidery-work-lehenga-choli-in-banarasi-silk-beige': KEEP ORIGINAL
  // 'embroidery-work-lehenga-choli-in-tissue-silk-multicolor': KEEP ORIGINAL
  // 'embroidery-work-lehenga-choli-in-pure-viscose-off-white': KEEP ORIGINAL
  // 'embroidery-work-lehenga-choli-in-net-green': KEEP ORIGINAL
  // 'embroidery-work-lehenga-choli-in-silk-beige': KEEP ORIGINAL
  // 'embroidery-work-lehenga-choli-in-net-mehendi': KEEP ORIGINAL
  // 'embroidery-work-lehenga-choli-in-net-rani-pink': KEEP ORIGINAL
  // 'embroidery-work-lehenga-choli-in-tissue-silk-green': KEEP ORIGINAL
  // 'embroidery-work-lehenga-choli-in-crepe-purple': KEEP ORIGINAL
  // 'embroidery-work-lehenga-choli-in-crepe-multicolor': KEEP ORIGINAL
  // 'embroidery-work-lehenga-choli-in-net-peach': KEEP ORIGINAL
  // 'embroidery-work-lehenga-choli-in-tissue-silk-sky-blue': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 18: NET SEQUINS HIGHER PRICE ($111-$138) — Genuinely colored net
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'blue-net-sequins-lehenga-choli-with-dupatta': KEEP ORIGINAL — blue net IS the base
  // 'rani-pink-net-sequins-lehenga-choli-with-dupatta': KEEP ORIGINAL
  // 'green-net-sequins-lehenga-choli-with-dupatta': KEEP ORIGINAL
  // 'purple-net-sequins-lehenga-choli-with-dupatta': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 19: RANGOLI SILK — Genuinely colored base fabric
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'purple-rangoli-silk-embroidery-lehenga-choli-with-dupatta': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 20: MULTICOLOR GEORGETTE SEQUINS — Multicolor IS accurate
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'multicolor-georgette-sequins-lehenga-choli-with-dupatta': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 21: FAUX GEORGETTE EMBROIDERY — Pattern: Ivory base + colored embroidery
  // Price range: $67
  // ═══════════════════════════════════════════════════════════════════════════════

  'pink-faux-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Faux Georgette Lehenga Choli with Pink Embroidered Dupatta',

  'red-faux-georgette-embroidery-lehenga-choli-with-dupatta':
    'Ivory Faux Georgette Lehenga Choli with Red Embroidered Dupatta',

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 22: WHITE GEORGETTE PRINTED — White IS the base color
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'white-georgette-printed-lehenga-choli-with-dupatta': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 23: NET EMBROIDERY WORK — LuxeMia branded ($77-$217)
  // Genuinely colored net base at these price points
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'green-net-embroidery-work-lehenga-choli-luxemia': KEEP ORIGINAL
  // 'gold-net-embroidery-work-lehenga-choli-luxemia': KEEP ORIGINAL
  // 'sky-net-embroidery-work-lehenga-choli-for-sangeet-luxemia': KEEP ORIGINAL
  // 'gold-net-embroidery-work-lehenga-choli-luxemia': KEEP ORIGINAL
  // 'rani-pink-net-embroidery-work-lehenga-choli-luxemia': KEEP ORIGINAL
  // 'beige-net-embroidery-work-lehenga-choli-luxemia': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 24: FESTIVE LEHENGA CHOLI — Net Embroidery variants ($133-$214)
  // Genuinely colored net at these price points
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'teal-blue-net-embroidery-festive-lehenga-choli': KEEP ORIGINAL
  // 'cream-net-embroidery-festive-lehenga-choli': KEEP ORIGINAL
  // 'rani-pink-net-embroidery-festive-lehenga-choli': KEEP ORIGINAL
  // 'blue-net-embroidery-festive-lehenga-choli': KEEP ORIGINAL
  // 'dusty-pink-net-embroidery-festive-lehenga-choli': KEEP ORIGINAL
  // 'wine-net-embroidery-festive-lehenga-choli': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 25: NET BEADS FESTIVE ($212) — Genuinely colored net
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'beige-net-beads-festive-lehenga-choli': KEEP ORIGINAL
  // 'light-pink-net-beads-festive-lehenga-choli': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 26: BOTTLE GREEN / GOLDEN NET FESTIVE ($214) — Genuinely colored
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'bottle-green-net-embroidery-festive-lehenga-choli': KEEP ORIGINAL
  // 'golden-net-embroidery-festive-lehenga-choli': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 27: NET OCCASION LEHENGA ($55-$70) — Lower price, ivory base likely
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'blue-net-sequins-occasion-lehenga-choli': KEEP ORIGINAL — net IS blue
  // 'rani-pink-net-sequins-occasion-lehenga-choli': KEEP ORIGINAL
  // 'green-net-sequins-occasion-lehenga-choli': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 28: GREEN BANARASI / BANARASI — Genuinely colored silk
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'green-banarasi-embroidery-work-lehenga-choli-luxemia': KEEP ORIGINAL

  // ═══════════════════════════════════════════════════════════════════════════════
  // PHASE 29: BEIGE NET EMBROIDERY LEHENGA — Beige IS the base
  // ═══════════════════════════════════════════════════════════════════════════════

  // 'beige-net-embroidery-lehenga-choli-with-dupatta': KEEP ORIGINAL
};

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-CORRECT PATTERNS — For titles not in manual corrections above
// These patterns catch common color-hierarchy issues automatically
// ═══════════════════════════════════════════════════════════════════════════════

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
  'mehendi': 'Mehendi Green',
  'mehendi-green': 'Mehendi Green',
  'pista-green': 'Pista Green',
  'teal-green': 'Teal Green',
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
  'olive-green': 'Olive Green',
  'gold': 'Gold',
  'golden': 'Golden',
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
};

/**
 * Fabric-specific base color rules
 * Maps fabric types to their typical base color for lower-priced lehengas
 */
const FABRIC_BASE_COLOR: Record<string, { base: string; priceThreshold: number }> = {
  'silk': { base: 'Pearl White', priceThreshold: 100 },
  'georgette': { base: 'Ivory', priceThreshold: 80 },
  'vichitra': { base: 'Ivory', priceThreshold: 110 },
  'chinon': { base: 'Ivory', priceThreshold: 60 },
  'net': { base: 'Ivory', priceThreshold: 75 },
  'faux-georgette': { base: 'Ivory', priceThreshold: 80 },
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
    'fuchsia', 'coral', 'peach', 'olive', 'teal', 'pink', 'blue',
    'rama blue', 'mehendi', 'pista green', 'teal green', 'olive green',
    'lavender', 'lilac', 'sky blue', 'yellow', 'red', 'rust',
  ];

  for (const accent of commonAccentColors) {
    if (lower.startsWith(accent + ' ') || lower.startsWith(accent.replace(' ', '-') + ' ')) {
      // Check if this looks like a lehenga pattern with likely ivory base
      if (lower.includes('lehenga') && !lower.includes('bridal ' + accent)) {
        // Check fabric to suggest appropriate base color
        let suggestedBase = 'Ivory / Pearl White';
        if (lower.includes('silk') && !lower.includes('georgette') && !lower.includes('banarasi')) {
          suggestedBase = 'Pearl White';
        } else if (lower.includes('georgette') || lower.includes('chinon')) {
          suggestedBase = 'Ivory';
        } else if (lower.includes('vichitra')) {
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

  // Velvet, Banarasi, Tissue Silk, Crepe, Satin base fabrics ARE the stated color
  if (lower.includes('velvet')) return true;
  if (lower.includes('banarasi')) return true;
  if (lower.includes('tissue silk')) return true;
  if (lower.includes('crepe')) return true;
  if (lower.includes('satin')) return true;

  // Partywear/Bridal naming at higher prices indicates genuine color
  if ((lower.includes('partywear') || lower.includes('bridal')) && price >= 120) return true;

  // Jacquard silk is a textured fabric where the base is genuinely colored
  if (lower.includes('jacquard')) return true;

  // Rangoli silk is genuinely colored
  if (lower.includes('rangoli')) return true;

  // "Beads Work Lehenga Choli in [Material] [Color]" — color IS genuine
  if (lower.match(/beads work lehenga choli in/)) return true;

  // "Embroidery Work Lehenga Choli in [Material] [Color]" — color IS genuine
  if (lower.match(/embroidery work lehenga choli in/)) return true;

  // Net sequins at $100+ are typically genuinely colored net
  if (lower.includes('net sequins') && price >= 100) return true;

  // Multicolor IS accurate
  if (lower.includes('multicolor')) return true;

  // White/cream/off-white/beige/black ARE the base color (not accents)
  const baseColors = ['white ', 'cream ', 'off-white ', 'beige ', 'black ', 'ivory '];
  for (const base of baseColors) {
    if (lower.startsWith(base)) return true;
  }

  return false;
}

/**
 * Auto-generate corrected title for known problematic patterns
 * Uses heuristics to flip color hierarchy based on price, fabric, and naming
 */
export function autoCorrectTitle(
  originalTitle: string,
  handle: string,
  productType?: string,
  price?: number,
): string {
  // Check if we have a manual correction
  const manual = getCorrectedTitle(handle);
  if (manual) return manual;

  // If price is available and the lehenga is likely genuinely colored, return original
  if (price && isLikelyGenuineColor(originalTitle, price)) {
    return originalTitle;
  }

  const lower = originalTitle.toLowerCase();

  // Auto-detect and fix common pattern:
  // "[AccentColor] [Fabric] [Work] Lehenga Choli with Dupatta"
  // → "[BaseColor] [Fabric] Lehenga Choli with [AccentColor] [Work] Dupatta"

  // Pattern: [Color] Silk Embroidery Lehenga Choli with Dupatta
  const silkMatch = originalTitle.match(
    /^([A-Za-z\-]+)\s+Silk\s+(Embroidery|Embroidered|Sequin|Zari|Printed|Mirror|Gota)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (silkMatch) {
    const [, accentColor, work] = silkMatch;
    const baseColor = 'Pearl White';
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `${baseColor} Silk Lehenga Choli with ${accentColor} ${workDesc} Dupatta`;
  }

  // Pattern: [Color] Georgette Embroidery Lehenga Choli with Dupatta
  const georgetteMatch = originalTitle.match(
    /^([A-Za-z\-]+)\s+Georgette\s+(Embroidery|Embroidered|Sequin|Zari|Printed|Mirror|Gota|Thread)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (georgetteMatch) {
    const [, accentColor, work] = georgetteMatch;
    const baseColor = 'Ivory';
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `${baseColor} Georgette Lehenga Choli with ${accentColor} ${workDesc} Dupatta`;
  }

  // Pattern: [Color] Pure Vichitra Embroidery Lehenga Choli with Dupatta
  // Matches original Shopify title — outputs corrected "Art Silk" title
  const vichitraMatch = originalTitle.match(
    /^([A-Za-z\-]+)\s+Pure\s+Vichitra\s+(Embroidery|Embroidered|Sequin|Zari)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (vichitraMatch) {
    const [, accentColor, work] = vichitraMatch;
    const baseColor = 'Ivory';
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `${baseColor} Art Silk Lehenga Choli with ${accentColor} ${workDesc} Dupatta`;
  }

  // Pattern: [Color] Vichitra Silk Sequins Lehenga Choli with Dupatta
  // Matches original Shopify title — outputs corrected "Art Silk" title
  const vichitraSequinsMatch = originalTitle.match(
    /^([A-Za-z\-]+)\s+Vichitra\s+Silk\s+(Sequins|Sequined|Embroidery|Embroidered)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (vichitraSequinsMatch) {
    const [, accentColor, work] = vichitraSequinsMatch;
    const workDesc = work === 'Sequins' ? 'Sequins' : work === 'Embroidery' ? 'Embroidered' : work;
    return `Ivory Art Silk ${workDesc} Lehenga Choli with ${accentColor} Dupatta`;
  }

  // Pattern: [Color] Chinon Embroidery Lehenga Choli with Dupatta
  const chinonMatch = originalTitle.match(
    /^([A-Za-z\-]+)\s+Chinon\s+(Embroidery|Embroidered|Sequin|Zari)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (chinonMatch) {
    const [, accentColor, work] = chinonMatch;
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `Ivory Chinon Embroidery Lehenga Choli with ${accentColor} ${workDesc} Dupatta`;
  }

  // Pattern: [Color] Net Thread Lehenga Choli with Dupatta
  const netThreadMatch = originalTitle.match(
    /^([A-Za-z\-]+)\s+Net\s+Thread\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (netThreadMatch) {
    const [, accentColor] = netThreadMatch;
    return `Ivory Net Thread Lehenga Choli with ${accentColor} Embroidered Dupatta`;
  }

  // Pattern: [Color] Net Sequins Lehenga Choli with Dupatta (lower price)
  if (price && price < 75) {
    const netSequinsMatch = originalTitle.match(
      /^([A-Za-z\-]+)\s+Net\s+(Sequins|Sequined)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
    );
    if (netSequinsMatch) {
      const [, accentColor] = netSequinsMatch;
      return `Ivory Net Sequins Lehenga Choli with ${accentColor} Dupatta`;
    }
  }

  // Pattern: [Color] Faux Georgette Embroidery Lehenga Choli with Dupatta
  const fauxGeorgetteMatch = originalTitle.match(
    /^([A-Za-z\-]+)\s+Faux\s+Georgette\s+(Embroidery|Embroidered)\s+Lehenga\s+Choli\s+with\s+Dupatta$/
  );
  if (fauxGeorgetteMatch) {
    const [, accentColor, work] = fauxGeorgetteMatch;
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `Ivory Faux Georgette Lehenga Choli with ${accentColor} ${workDesc} Dupatta`;
  }

  // Pattern: [Color] [Fabric] Embroidery Festive Lehenga Choli
  const festiveMatch = originalTitle.match(
    /^([A-Za-z\-]+)\s+([A-Za-z\-]+)\s+(Embroidery|Embroidered)\s+Festive\s+Lehenga\s+Choli$/
  );
  if (festiveMatch) {
    const [, accentColor, fabric, work] = festiveMatch;
    const fabricLower = fabric.toLowerCase();
    let baseColor = 'Ivory';
    if (fabricLower === 'silk') baseColor = 'Pearl White';
    if (fabricLower === 'vichitra') baseColor = 'Ivory';
    if (fabricLower === 'georgette') baseColor = 'Ivory';
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `${baseColor} ${fabric} ${workDesc} Festive Lehenga Choli with ${accentColor} Dupatta`;
  }

  // Pattern: [Color] [Fabric] Embroidery Occasion Lehenga Choli
  const occasionMatch = originalTitle.match(
    /^([A-Za-z\-]+)\s+([A-Za-z\-]+)\s+(Embroidery|Embroidered)\s+Occasion\s+Lehenga\s+Choli$/
  );
  if (occasionMatch) {
    const [, accentColor, fabric, work] = occasionMatch;
    const fabricLower = fabric.toLowerCase();
    let baseColor = 'Ivory';
    if (fabricLower === 'silk') baseColor = 'Pearl White';
    if (fabricLower === 'vichitra') baseColor = 'Ivory';
    if (fabricLower === 'georgette') baseColor = 'Ivory';
    const workDesc = work === 'Embroidery' ? 'Embroidered' : work;
    return `${baseColor} ${fabric} ${workDesc} Occasion Lehenga Choli with ${accentColor} Dupatta`;
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

  // Two-tone / contrast keywords
  if (lower.includes('with')) {
    keywords.push('two tone lehenga', 'contrast lehenga', 'dual color lehenga');
  }

  // Bridal intent keywords
  if (lower.includes('silk') || lower.includes('embroidered') || lower.includes('bridal')) {
    keywords.push('bridal lehenga', 'wedding lehenga', 'designer lehenga');
  }

  return [...new Set(keywords)]; // deduplicate
}
