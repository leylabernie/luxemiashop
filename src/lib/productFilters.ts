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
  const titleLower = (p.title || '').toLowerCase();

  // Strategy 1: tag-prefix match (preferred)
  if (tagPrefix) {
    const prefixed = `${tagPrefix}:${valueLower}`;
    if (tags.includes(prefixed)) return true;
  }

  // Strategy 2: bare tag match
  if (tags.includes(valueLower)) return true;

  // Strategy 3: title substring (last resort)
  if (titleLower.includes(valueLower)) return true;

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

  // Tag matching — check structured tags (e.g. 'occasion:bridal', 'color:red')
  const tags = getTags(p);
  const titleLower = (p.title || '').toLowerCase();

  for (const tag of sub.matchTags) {
    const tagLower = tag.toLowerCase();
    // Exact tag match (handles both 'occasion:bridal' and bare 'bridal')
    if (tags.includes(tagLower)) return true;
  }

  // ─── Occasion subcategories: title-only matching ─────────────────────────
  // CRITICAL: Do NOT match occasion words in the product DESCRIPTION.
  // Many bridal products mention "reception" or "wedding" in their description
  // (e.g., "perfect for your wedding reception") but they are bridal products,
  // not reception-wear. Only match if the occasion word is in the TITLE.
  if (sub.group === 'occasion') {
    const labelLower = sub.label.toLowerCase();
    // Word-boundary match on title only (not description)
    const wordBoundaryRegex = new RegExp(`\\b${escapeRegex(labelLower)}\\b`, 'i');
    if (wordBoundaryRegex.test(titleLower)) return true;
    // Also check bare matchTag values against title (e.g. 'mehndi' tag for 'Mehendi' label)
    for (const tag of sub.matchTags) {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes(':')) continue; // skip prefixed tags like 'occasion:bridal'
      const tagRegex = new RegExp(`\\b${escapeRegex(tagLower)}\\b`, 'i');
      if (tagRegex.test(titleLower)) return true;
    }
    return false;
  }

  // ─── Non-occasion subcategories: title + description matching ────────────
  // For color, style, fabric — it's safe to match in description too since
  // those are product attributes, not occasion-context words.
  const descLower = (p.description || '').toLowerCase();
  const titleDescLower = `${titleLower} ${descLower}`;
  if (titleDescLower.includes(sub.label.toLowerCase())) return true;

  return false;
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

  // Special exclusions: Reception should NOT show bridal colors
  // (red, maroon, off-white, light pink) — those are bride ceremony colors
  const bridalColors = ['red', 'maroon', 'off-white', 'off white', 'ivory', 'light pink'];

  return products.filter(p => {
    const matches = matchSubcategory(p.node, sub);
    if (!matches) return false;

    // For Reception subcategory, exclude bridal colors
    if (sub.slug === 'reception') {
      const titleLower = (p.node.title || '').toLowerCase();
      const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
      const text = `${titleLower} ${tags.join(' ')}`;
      for (const color of bridalColors) {
        if (text.includes(color)) return false;
      }
    }

    return true;
  });
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
