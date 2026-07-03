import type { ShopifyProduct } from '@/lib/shopify';
import type { Subcategory, FilterSection } from '@/config/categoryConfig';

/**
 * Product filter + sort + subcategory matching utilities.
 *
 * v2 changes (Kalki-style rewrite):
 * - Tag-prefix matching (color:red, fabric:silk, occasion:wedding, role:bridesmaid)
 *   with fallback to substring match on title — much more reliable than the
 *   previous substring-everything approach (which matched "Sacred" for "Red").
 * - Subcategory matching uses the same tag-prefix logic.
 * - Price-tier subcategories (Under $200, Premium $300+) supported via priceMin/priceMax.
 */

type ProductNode = ShopifyProduct['node'];

/**
 * Get lowercase tags array. Tags may come from Storefront API as
 * `string[]` (e.g. ['red', 'silk', 'occasion:bridal', 'gender:female']).
 */
function getTags(p: ProductNode): string[] {
  return (p.tags ?? []).map(t => t.toLowerCase());
}

/**
 * Match a filter value against a product using tag-prefix logic.
 *
 * Strategy (in order):
 * 1. Tag-prefix match: if tagPrefix is 'color' and value is 'red',
 *    match tag 'color:red' OR tag 'red'.
 * 2. Bare tag match: tag exactly equals value (case-insensitive).
 * 3. Title substring match (last resort — kept for backward compat with
 *    products that have no structured tags).
 *
 * Returns true if any match strategy succeeds.
 */
function matchFilterValue(p: ProductNode, tagPrefix: string | undefined, value: string): boolean {
  const tags = getTags(p);
  const valueLower = value.toLowerCase();

  // Strategy 1: tag-prefix match (preferred)
  if (tagPrefix) {
    const prefixed = `${tagPrefix}:${valueLower}`;
    if (tags.includes(prefixed)) return true;
  }

  // Strategy 2: bare tag match
  if (tags.includes(valueLower)) return true;

  // Strategy 3: title word-boundary match (last resort)
  // Use word boundaries to prevent false positives like "red" matching "sacred".
  // Also check product type and vendor for broader coverage.
  const titleLower = (p.title || '').toLowerCase();
  const productTypeLower = (p.productType || '').toLowerCase();
  const wordBoundaryRegex = new RegExp(`\\b${escapeRegex(valueLower)}\\b`, 'i');
  if (wordBoundaryRegex.test(titleLower)) return true;
  if (productTypeLower && wordBoundaryRegex.test(productTypeLower)) return true;

  return false;
}

/**
 * Match a subcategory against a product.
 *
 * Subcategories define `matchTags` (e.g. ['occasion:bridal', 'bridal'])
 * and optionally priceMin/priceMax for price-tier subcategories.
 *
 * Returns true if:
 * - Any of matchTags matches (via tag-prefix or bare tag), OR
 * - Title contains the subcategory label, AND
 * - Price is within [priceMin, priceMax] if those are set.
 */
export function matchSubcategory(p: ProductNode, sub: Subcategory): boolean {
  // Price-tier check first — if subcategory has price bounds, must be in range
  if (sub.priceMin !== undefined || sub.priceMax !== undefined) {
    const price = parseFloat(p.priceRange.minVariantPrice.amount);
    if (sub.priceMin !== undefined && price < sub.priceMin) return false;
    if (sub.priceMax !== undefined && price > sub.priceMax) return false;
    // Price-tier subcategories have empty matchTags — price check is sufficient
    if (sub.matchTags.length === 0) return true;
  }

  // Tag matching — this is the primary and preferred matching method.
  const tags = getTags(p);
  for (const tag of sub.matchTags) {
    const tagLower = tag.toLowerCase();
    if (tags.includes(tagLower)) return true;
  }

  const titleLower = (p.title || '').toLowerCase();
  const labelLower = sub.label.toLowerCase();

  // ─── Occasion subcategories: use business-rule inference ─────────────────
  // Instead of loose title matching, we infer occasions from product attributes
  // (fabric, style, embroidery) using store-owner-provided rules:
  //   Sarees: silk→wedding, designer/R2W→reception+party, embroidery→party+guest-wedding
  //   Suits: partywear→party, anarkali/sharara→festive+party, cotton/straight→casual
  if (sub.group === 'occasion') {
    const inferred = inferOccasions(p);
    // Check if any of the subcategory's matchTags (bare values, stripped of prefix)
    // appear in the inferred occasions set
    for (const tag of sub.matchTags) {
      const tagLower = tag.toLowerCase();
      const bareValue = tagLower.includes(':') ? tagLower.split(':')[1] : tagLower;
      if (inferred.has(bareValue)) return true;
    }
    // Also check if the label itself is in inferred (handles 'Party Wear' label
    // vs 'party' tag value)
    if (inferred.has(labelLower)) return true;
    // Fallback: explicit word-boundary title match (for occasions not covered by inference)
    const exclusions: Record<string, string[]> = {
      'bridal': ['bridesmaid', 'mother of bride', 'mother-of-bride', 'groom'],
      'reception': ['bridesmaid', 'haldi', 'mehendi'],
    };
    const excludedWords = exclusions[labelLower];
    if (excludedWords) {
      for (const excluded of excludedWords) {
        if (new RegExp(`\\b${escapeRegex(excluded)}\\b`, 'i').test(titleLower)) return false;
      }
    }
    if (new RegExp(`\\b${escapeRegex(labelLower)}\\b`, 'i').test(titleLower)) return true;
    return false;
  }

  // ─── Audience subcategories: exclusion-aware title matching ──────────────
  if (sub.group === 'audience') {
    const exclusions: Record<string, string[]> = {
      'bridesmaid': ['bridal', 'bride'],
      'mother of bride': ['bridal', 'bride', 'bridesmaid'],
    };
    const excludedWords = exclusions[labelLower];
    if (excludedWords) {
      for (const excluded of excludedWords) {
        if (new RegExp(`\\b${escapeRegex(excluded)}\\b`, 'i').test(titleLower)) return false;
      }
    }
    if (new RegExp(`\\b${escapeRegex(labelLower)}\\b`, 'i').test(titleLower)) return true;
    for (const tag of sub.matchTags) {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes(':')) continue;
      if (new RegExp(`\\b${escapeRegex(tagLower)}\\b`, 'i').test(titleLower)) return true;
    }
    return false;
  }

  // ─── Color + Style subcategories: word-boundary title matching ───────────
  if (sub.group === 'color' || sub.group === 'style') {
    if (new RegExp(`\\b${escapeRegex(labelLower)}\\b`, 'i').test(titleLower)) return true;
    for (const tag of sub.matchTags) {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes(':')) continue;
      if (new RegExp(`\\b${escapeRegex(tagLower)}\\b`, 'i').test(titleLower)) return true;
    }
  }

  return false;
}

/**
 * Detect the product category from productType, title, and tags.
 */
function detectProductCategory(p: ProductNode): string {
  const text = `${p.productType || ''} ${p.title || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
  if (/\b(lehenga|lehenga choli)\b/.test(text)) return 'lehenga';
  if (/\b(saree|sari)\b/.test(text)) return 'saree';
  if (/\b(sherwani|kurta|menswear|groom)\b/.test(text)) return 'menswear';
  if (/\b(suit|salwar|anarkali|sharara|palazzo|kameez)\b/.test(text)) return 'suit';
  if (/\b(jewelry|jewellery|necklace|kundan|polki|earring|bangle)\b/.test(text)) return 'jewelry';
  return 'unknown';
}

/**
 * Infer occasion subcategories for a product based on business rules.
 *
 * SAREES (store-owner rules):
 *   - Silk sarees (banarasi, kanchipuram, raw silk) → Wedding
 *   - Designer / Ready-to-wear sarees → Reception, Party Wear
 *   - Heavy embroidery sarees → Party Wear, Wedding (for guests)
 *   - Bridal in title → Bridal
 *
 * SUITS (store-owner rules):
 *   - Partywear suits → Party Wear
 *   - Anarkali / Sharara → Festive, Party Wear
 *   - Regular / Cotton / Straight-cut → Casual
 *   - Silk / Velvet suits → Wedding
 */
function inferOccasions(p: ProductNode): Set<string> {
  const occasions = new Set<string>();
  const titleLower = (p.title || '').toLowerCase();
  const descLower = (p.description || '').toLowerCase();
  const tags = getTags(p);
  const text = `${titleLower} ${descLower} ${tags.join(' ')}`;
  const category = detectProductCategory(p);

  // Explicit occasion tags always win
  for (const tag of tags) {
    if (tag.startsWith('occasion:')) {
      occasions.add(tag.replace('occasion:', ''));
    }
  }

  // ─── Saree rules ──────────────────────────────────────────────────────
  if (category === 'saree') {
    // Silk sarees → Wedding
    if (/\b(silk|banarasi|kanchipuram|kanjeevaram|raw silk|art silk|tussar)\b/.test(text)) {
      occasions.add('wedding');
    }
    // Designer / Ready-to-wear → Reception, Party Wear
    if (/\b(designer|ready to wear|ready-to-wear|r2w|pre-draped|pre stitched)\b/.test(text)) {
      occasions.add('reception');
      occasions.add('party wear');
      occasions.add('party');
    }
    // Heavy embroidery → Party Wear, Wedding (guests)
    if (/\b(embroidery|embroidered|heavy|zari|zardozi|stone work|stonework|sequin|sequins|bead work|beadwork|mirror work)\b/.test(text)) {
      occasions.add('party wear');
      occasions.add('party');
      occasions.add('wedding');
    }
    // Bridal in title → Bridal (but not if it's bridesmaid/mother of bride)
    if (/\bbridal\b/.test(titleLower) && !/\b(bridesmaid|mother of bride|mother-of-bride)\b/.test(titleLower)) {
      occasions.add('bridal');
    }
    // Festive keywords → Festive
    if (/\b(festive|diwali|navratri|eid|durga puja|onam|pongal)\b/.test(text)) {
      occasions.add('festive');
    }
    // Reception in title → Reception
    if (/\breception\b/.test(titleLower)) {
      occasions.add('reception');
    }
  }

  // ─── Suit rules ───────────────────────────────────────────────────────
  if (category === 'suit') {
    // Partywear suits → Party Wear
    if (/\b(party wear|partywear|party)\b/.test(text)) {
      occasions.add('party wear');
      occasions.add('party');
    }
    // Anarkali / Sharara → Festive, Party Wear
    if (/\b(anarkali|sharara|palazzo)\b/.test(text)) {
      occasions.add('festive');
      occasions.add('party wear');
      occasions.add('party');
    }
    // Regular / Cotton / Straight-cut → Casual
    if (/\b(cotton|casual|everyday|regular|straight|straight-cut)\b/.test(text)) {
      occasions.add('casual');
    }
    // Silk / Velvet suits → Wedding
    if (/\b(silk|velvet|brocade|raw silk|art silk)\b/.test(text)) {
      occasions.add('wedding');
    }
    // Wedding/festive in title → Wedding/Festive
    if (/\b(wedding|bridal)\b/.test(titleLower)) {
      occasions.add('wedding');
    }
    if (/\b(festive|diwali|navratri|eid)\b/.test(text)) {
      occasions.add('festive');
    }
    // Embroidery on suits → Party Wear (embroidered suits are party-appropriate)
    if (/\b(embroidery|embroidered|heavy|zari|sequin|stone work)\b/.test(text)) {
      occasions.add('party wear');
      occasions.add('party');
    }
  }

  return occasions;
}

/**
 * Escape special regex characters in a string for safe use in RegExp.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Apply filter sections + price range to a product list.
 *
 * `activeFilters` is Record<filterName, string[]> (e.g. { Color: ['red', 'pink'], Fabric: ['silk'] }).
 * `filterSections` is the config array — used to look up the tagPrefix for each section.
 */
export function applyProductFiltersV2(
  products: ShopifyProduct[],
  activeFilters: Record<string, string[]>,
  priceRange: [number, number],
  filterSections: FilterSection[]
): ShopifyProduct[] {
  // Build a lookup: filterName → tagPrefix
  const sectionMap = new Map<string, FilterSection>();
  for (const s of filterSections) {
    sectionMap.set(s.name.toLowerCase(), s);
  }

  let filtered = [...products];

  // Apply each active filter section
  for (const [sectionName, values] of Object.entries(activeFilters)) {
    if (!values || values.length === 0) continue;
    const section = sectionMap.get(sectionName.toLowerCase());
    if (!section) continue;

    // Special case: Size — also check variant selectedOptions + product options
    if (section.name.toLowerCase() === 'size') {
      filtered = filtered.filter(p => {
        return values.some(value => {
          const valueLower = value.toLowerCase();
          // Check tag-prefix match
          if (matchFilterValue(p.node, section.tagPrefix, value)) return true;
          // Check variant selectedOptions
          const variants = p.node.variants?.edges || [];
          const hasVariantSize = variants.some(v =>
            v.node.selectedOptions?.some(opt =>
              opt.name.toLowerCase() === 'size' &&
              opt.value.toLowerCase().includes(valueLower)
            )
          );
          if (hasVariantSize) return true;
          // Check product options
          const hasOptionSize = p.node.options?.some(opt =>
            opt.name.toLowerCase() === 'size' &&
            opt.values.some(val => val.toLowerCase().includes(valueLower))
          );
          return !!hasOptionSize;
        });
      });
      continue;
    }

    // Special case: Availability — check variant availability + ready/made-to-order tags
    if (section.name.toLowerCase() === 'availability') {
      filtered = filtered.filter(p => {
        return values.some(value => {
          const valueLower = value.toLowerCase();
          const tags = getTags(p.node);
          const variants = p.node.variants?.edges || [];

          if (valueLower.includes('ready')) {
            const hasAvailable = variants.some(v => v.node.availableForSale);
            const hasReadyTag = tags.some(tag =>
              tag.includes('ready') || tag.includes('in stock') || tag.includes('readymade')
            );
            return hasAvailable || hasReadyTag;
          }

          if (valueLower.includes('made to order') || valueLower.includes('custom')) {
            return tags.some(tag =>
              tag.includes('made to order') || tag.includes('custom') || tag.includes('pre-order')
            );
          }

          return false;
        });
      });
      continue;
    }

    // Standard filter sections (Color, Fabric, Work, Style) — use tag-prefix match
    filtered = filtered.filter(p => {
      return values.some(value => matchFilterValue(p.node, section.tagPrefix, value));
    });
  }

  // Apply price range
  filtered = filtered.filter(p => {
    const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
    return price >= priceRange[0] && price <= priceRange[1];
  });

  return filtered;
}

/**
 * Apply subcategory filter (in addition to the regular filters).
 * If no subcategory is active, returns products unchanged.
 */
export function applySubcategory(
  products: ShopifyProduct[],
  sub: Subcategory | null
): ShopifyProduct[] {
  if (!sub) return products;
  return products.filter(p => matchSubcategory(p.node, sub));
}

/**
 * Sort products by the specified sort option.
 * Same as before — no changes needed.
 */
export const sortProducts = (
  products: ShopifyProduct[],
  sortBy: string
): ShopifyProduct[] => {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-asc':
      sorted.sort((a, b) =>
        parseFloat(a.node.priceRange.minVariantPrice.amount) -
        parseFloat(b.node.priceRange.minVariantPrice.amount)
      );
      break;
    case 'price-desc':
      sorted.sort((a, b) =>
        parseFloat(b.node.priceRange.minVariantPrice.amount) -
        parseFloat(a.node.priceRange.minVariantPrice.amount)
      );
      break;
    case 'newest':
      sorted.sort((a, b) =>
        new Date(b.node.createdAt).getTime() - new Date(a.node.createdAt).getTime()
      );
      break;
    case 'featured':
    default:
      break;
  }

  return sorted;
};

/**
 * Combined filter + subcategory + sort function for the new shared
 * CategoryListing component.
 */
export const filterSortAndSubcategorize = (
  products: ShopifyProduct[],
  activeFilters: Record<string, string[]>,
  priceRange: [number, number],
  sortBy: string,
  filterSections: FilterSection[],
  subcategory: Subcategory | null
): ShopifyProduct[] => {
  const filtered = applyProductFiltersV2(products, activeFilters, priceRange, filterSections);
  const subcategorized = applySubcategory(filtered, subcategory);
  return sortProducts(subcategorized, sortBy);
};

// ─── Backward-compatible exports (legacy v1 API) ───────────────────────────
// Existing pages (Collections.tsx) still call filterAndSortProducts — keep
// the old signature working until those pages are also migrated.

export const applyProductFilters = applyProductFiltersV2;

export const filterAndSortProducts = (
  products: ShopifyProduct[],
  activeFilters: Record<string, string[]>,
  priceRange: [number, number],
  sortBy: string
): ShopifyProduct[] => {
  // Use empty filterSections — matchFilterValue will fall back to bare-tag
  // + title substring match (same behavior as the legacy code).
  const filtered = applyProductFiltersV2(products, activeFilters, priceRange, []);
  return sortProducts(filtered, sortBy);
};
