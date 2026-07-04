import type { ShopifyProduct } from '@/lib/shopify';
import type { Subcategory, FilterSection } from '@/config/categoryConfig';

/**
 * Product filter + sort + subcategory matching utilities.
 *
 * v3 changes (Sarees remap):
 * - matchSubcategory now supports matchProductType (Shopify productType matching)
 *   and descriptionKeywords (left word-boundary description matching).
 * - For occasion group: added productType matching and descriptionKeywords
 *   matching. Bridal description check now excludes 'bridal party'/'bridal
 *   parties' which refer to bridesmaids, not brides.
 * - applySubcategory now applies bridal-priority exclusion (bridal products
 *   excluded from non-bridal occasion subs) and wedding-guest-priority
 *   exclusion (wedding-guest products excluded from party-wear) for cleaner
 *   separation. Reception sub retains its existing color-based exclusion.
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

  // Strategy 3: word-boundary match in title, productType, and description
  // Use word boundaries to prevent false positives (e.g., "silk" matching "silk-like")
  const text = `${p.title || ''} ${p.productType || ''} ${p.description || ''}`.toLowerCase();
  const wordBoundaryRegex = new RegExp(`\\b${escapeRegex(valueLower)}\\b`, 'i');
  if (wordBoundaryRegex.test(text)) return true;

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
  const productTypeLower = (p.productType || '').toLowerCase();

  // ─── Occasion subcategories ───────────────────────────────────────────────
  // CRITICAL: For occasion subcategories, ONLY match prefixed tags (occasion:bridal)
  // and title words — NOT bare tags or description (with controlled exceptions).
  //
  // Exceptions (controlled via matchProductType and descriptionKeywords fields):
  // 1. matchProductType: if the subcategory lists productType values, the product's
  //    productType matches if it's in the list (e.g. 'Bridal Saree' → Bridal).
  // 2. descriptionKeywords: if listed, the description is checked for those
  //    keywords (left word-boundary, so 'reception' matches 'receptions').
  // 3. Bridal description exception: the Bridal subcategory also checks the
  //    description for the word 'bridal' (but NOT 'bridal party'/'bridal parties',
  //    which refer to bridesmaids).
  if (sub.group === 'occasion') {
    // 1. Prefixed-tag match (occasion:bridal, occasion:reception, etc.)
    for (const tag of sub.matchTags) {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes(':') && tags.includes(tagLower)) return true;
    }

    // 2. productType match (optional — controlled by sub.matchProductType)
    if (sub.matchProductType && sub.matchProductType.length > 0) {
      for (const pt of sub.matchProductType) {
        if (pt.toLowerCase() === productTypeLower) return true;
      }
    }

    // 3. Title word-boundary match on label
    const labelLower = sub.label.toLowerCase();
    const labelRegex = new RegExp(`\\b${escapeRegex(labelLower)}\\b`, 'i');
    if (labelRegex.test(titleLower)) return true;

    // 4. Title word-boundary match on bare matchTags (e.g. 'mehndi' for 'Mehendi')
    for (const tag of sub.matchTags) {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes(':')) continue;
      const tagRegex = new RegExp(`\\b${escapeRegex(tagLower)}\\b`, 'i');
      if (tagRegex.test(titleLower)) return true;
    }

    // 5. Description keyword match (optional — controlled by sub.descriptionKeywords)
    if (sub.descriptionKeywords && sub.descriptionKeywords.length > 0) {
      const descLower = (p.description || '').toLowerCase();
      for (const kw of sub.descriptionKeywords) {
        const kwLower = kw.toLowerCase();
        // Left word-boundary only, so 'reception' matches 'receptions'
        const kwRegex = new RegExp(`\\b${escapeRegex(kwLower)}`, 'i');
        if (kwRegex.test(descLower)) return true;
      }
    }

    // 6. Bridal-specific bare-tag + description checks
    //    The Bridal subcategory matches products with strong bridal signals:
    //    - 'role:bride' tag (the bride herself)
    //    - 'bridal' bare tag (only if NOT 'role:bridesmaid' — bridesmaid products
    //      sometimes have a 'bridal' tag because they're for the bridal party)
    //    - description 'bridal' word NOT followed by 'party'/'parties'
    //      (excludes 'bridal party'/'bridal parties' which refer to bridesmaids)
    if (sub.slug === 'bridal') {
      if (tags.includes('role:bride')) return true;
      if (tags.includes('bridal') && !tags.includes('role:bridesmaid')) return true;

      const descLower = (p.description || '').toLowerCase();
      if (descLower) {
        const bridalMatches = descLower.matchAll(/\bbridal\b/gi);
        for (const m of bridalMatches) {
          const end = (m.index ?? 0) + m[0].length;
          const after = descLower.slice(end, end + 15).trim();
          if (!after.startsWith('party') && !after.startsWith('parties')) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // ─── Non-occasion subcategories: full tag + title + description matching ─
  for (const tag of sub.matchTags) {
    const tagLower = tag.toLowerCase();
    if (tags.includes(tagLower)) return true;
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
 * Check if a product matches the Bridal subcategory criteria.
 * Used for bridal-priority exclusion (bridal products are excluded from
 * other occasion subcategories).
 *
 * Bridal signals (any one is sufficient):
 * - 'role:bride' tag, OR
 * - 'occasion:bridal' tag, OR
 * - 'bridal' bare tag (only if NOT 'role:bridesmaid' tag — bridesmaid products
 *   sometimes have a 'bridal' tag because they're for the bridal party), OR
 * - Title contains 'bridal' word, OR
 * - Description contains 'bridal' word NOT followed by 'party'/'parties'.
 */
function isBridalProduct(p: ProductNode): boolean {
  const tags = getTags(p);
  if (tags.includes('role:bride')) return true;
  if (tags.includes('occasion:bridal')) return true;
  if (tags.includes('bridal') && !tags.includes('role:bridesmaid')) return true;

  const titleLower = (p.title || '').toLowerCase();
  if (/\bbridal\b/i.test(titleLower)) return true;

  const descLower = (p.description || '').toLowerCase();
  if (descLower) {
    const matches = descLower.matchAll(/\bbridal\b/gi);
    for (const m of matches) {
      const end = m.index! + m[0].length;
      const after = descLower.slice(end, end + 15).trim();
      if (!after.startsWith('party') && !after.startsWith('parties')) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check if a product matches the Wedding Guest subcategory criteria.
 * Used for wedding-guest-priority exclusion (wedding-guest products are
 * excluded from Party Wear to avoid double-listing).
 */
function isWeddingGuestProduct(p: ProductNode): boolean {
  const tags = getTags(p);
  if (tags.includes('role:bridesmaid')) return true;
  if (tags.includes('occasion:wedding-guest')) return true;

  const titleLower = (p.title || '').toLowerCase();
  if (/\bwedding guest\b/i.test(titleLower)) return true;
  if (/\bbridesmaid\b/i.test(titleLower)) return true;

  return false;
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

  // Bridal colors — excluded from Reception (bride ceremony colors)
  // Rust is included because rust-colored lehengas are bridal for wedding
  const bridalColors = ['red', 'maroon', 'off-white', 'off white', 'ivory', 'light pink', 'rust'];

  return products.filter(p => {
    const titleLower = (p.node.title || '').toLowerCase();
    const descLower = (p.node.description || '').toLowerCase();
    const matches = matchSubcategory(p.node, sub);
    if (!matches) return false;

    // ─── Bridal-priority exclusion ────────────────────────────────────────
    // If a product is bridal and the active sub is a non-bridal occasion,
    // exclude it. The bridal subcategory 'owns' bridal products.
    // EXCEPTION: Reception (for Lehengas) has its own color-based exclusion
    // and explicitly allows 'bridal' in description (reception lehengas are
    // for brides — just for the reception event, not the wedding ceremony).
    if (sub.group === 'occasion' && sub.slug !== 'bridal' && sub.slug !== 'reception') {
      if (isBridalProduct(p.node)) return false;
    }

    // ─── Wedding-Guest-priority exclusion ────────────────────────────────
    // If a product is wedding-guest (bridesmaid) and the active sub is party-wear,
    // exclude it. Wedding Guest is more specific than Party Wear.
    if (sub.group === 'occasion' && sub.slug === 'party-wear') {
      if (isWeddingGuestProduct(p.node)) return false;
    }

    // ─── Reception-specific exclusions ──────────────────────────────────────
    // Reception lehengas ARE for brides (just for the reception event, not the
    // wedding ceremony). So "bridal" in the description is OK.
    // The ONLY exclusion is bridal ceremony colors:
    // red, maroon, off-white, light pink, rust
    if (sub.slug === 'reception') {
      const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
      const text = `${titleLower} ${tags.join(' ')}`;

      // Exclude bridal ceremony colors only
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
