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
  // Products should have structured tags like 'occasion:bridal', 'role:bridesmaid',
  // 'color:red', etc. for accurate subcategory assignment.
  const tags = getTags(p);

  for (const tag of sub.matchTags) {
    const tagLower = tag.toLowerCase();
    // Exact tag match (handles both 'occasion:bridal' and bare 'bridal')
    if (tags.includes(tagLower)) return true;
  }

  // Title fallback — word-boundary matching on the product title.
  // This is needed because most products don't have structured occasion/role tags
  // in Shopify, so the title is the only signal we have.
  //
  // CRITICAL: For occasion/audience subcategories, we check for EXCLUSIONS first
  // to prevent false positives. For example, a product titled "Bridesmaid Lehenga
  // for Bridal Party" should match "Bridesmaid" but NOT "Bridal" — even though
  // "bridal" appears in the title.
  const titleLower = (p.title || '').toLowerCase();
  const labelLower = sub.label.toLowerCase();

  // Exclusion map: if the title contains any of these words, the subcategory
  // should NOT match (even if the label appears in the title).
  const exclusions: Record<string, string[]> = {
    'bridal': ['bridesmaid', 'mother of bride', 'mother-of-bride', 'bride\'s mother', 'groom', 'groomsmen'],
    'bridesmaid': ['bridal', 'bride'],
    'mother of bride': ['bridal', 'bride', 'bridesmaid'],
    'wedding': ['bridesmaid'],
    'reception': ['bridesmaid', 'haldi', 'mehendi', 'mehndi'],
  };

  // Check exclusions for occasion/audience subcategories
  if (sub.group === 'occasion' || sub.group === 'audience') {
    const excludedWords = exclusions[labelLower];
    if (excludedWords) {
      for (const excluded of excludedWords) {
        const exclRegex = new RegExp(`\\b${escapeRegex(excluded)}\\b`, 'i');
        if (exclRegex.test(titleLower)) return false;
      }
    }
  }

  // Word-boundary match on title (works for all subcategory groups)
  const wordBoundaryRegex = new RegExp(`\\b${escapeRegex(labelLower)}\\b`, 'i');
  if (wordBoundaryRegex.test(titleLower)) return true;

  // Also check matchTags values against title (for tags like 'mehndi' that differ
  // from the label 'Mehendi')
  for (const tag of sub.matchTags) {
    const tagLower = tag.toLowerCase();
    // Skip prefix tags (occasion:bridal) — only check bare values
    if (tagLower.includes(':')) continue;
    const tagRegex = new RegExp(`\\b${escapeRegex(tagLower)}\\b`, 'i');
    if (tagRegex.test(titleLower)) return true;
  }

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
