/**
 * useListingFilters — URL-persistent filter state hook for category listing pages.
 *
 * Encodes filter state into the URL query string:
 *   /lehengas?sub=bridal&color=red,pink&fabric=silk&price=0-500&sort=price-asc
 *
 * Why URL persistence matters:
 * - Shareable filter URLs (users can send a specific filtered view to a friend)
 * - Back-button preserves filter state (no lost filters when navigating back)
 * - SEO: Google can index specific filtered views as separate pages
 * - Analytics: filter state visible in GA4 pageview URLs
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CategoryConfig, Subcategory } from '@/config/categoryConfig';

export interface ListingFilterState {
  /** Active subcategory slug (single value, or null for "all") */
  subcategory: string | null;
  /** Active filter selections — Record<filterName, string[]> */
  filters: Record<string, string[]>;
  /** Price range [min, max] */
  priceRange: [number, number];
  /** Sort option */
  sortBy: string;
}

const SORT_OPTIONS = ['featured', 'newest', 'price-asc', 'price-desc'] as const;

/**
 * Parse the URL query string into a ListingFilterState.
 */
function parseUrlState(
  searchParams: URLSearchParams,
  config: CategoryConfig
): ListingFilterState {
  // Subcategory
  const sub = searchParams.get('sub');
  const subcategory = sub && config.subcategories.some(s => s.slug === sub) ? sub : null;

  // Filters — each filter section has its own URL param
  const filters: Record<string, string[]> = {};
  for (const section of config.filters) {
    const paramValue = searchParams.get(section.name.toLowerCase());
    if (paramValue) {
      filters[section.name] = paramValue.split(',').filter(Boolean);
    }
  }

  // Price range — format "min-max"
  const priceParam = searchParams.get('price');
  let priceRange: [number, number] = [...config.priceRange];
  if (priceParam) {
    const [min, max] = priceParam.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      priceRange = [min, max];
    }
  }

  // Sort
  const sort = searchParams.get('sort');
  const sortBy = SORT_OPTIONS.includes(sort as any) ? (sort as string) : 'featured';

  return { subcategory, filters, priceRange, sortBy };
}

/**
 * Serialize ListingFilterState into URLSearchParams.
 */
function serializeUrlState(state: ListingFilterState, config: CategoryConfig): URLSearchParams {
  const params = new URLSearchParams();

  if (state.subcategory) {
    params.set('sub', state.subcategory);
  }

  for (const [name, values] of Object.entries(state.filters)) {
    if (values.length > 0) {
      params.set(name.toLowerCase(), values.join(','));
    }
  }

  // Only include price if it differs from the default range
  const [defaultMin, defaultMax] = config.priceRange;
  if (state.priceRange[0] !== defaultMin || state.priceRange[1] !== defaultMax) {
    params.set('price', `${state.priceRange[0]}-${state.priceRange[1]}`);
  }

  if (state.sortBy !== 'featured') {
    params.set('sort', state.sortBy);
  }

  return params;
}

export function useListingFilters(config: CategoryConfig) {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(
    () => parseUrlState(searchParams, config),
    [searchParams, config]
  );

  const updateState = useCallback(
    (updater: (prev: ListingFilterState) => ListingFilterState) => {
      const next = updater(state);
      const newParams = serializeUrlState(next, config);
      // replace: true so we don't pollute browser history with every filter click
      setSearchParams(newParams, { replace: true });
    },
    [state, config, setSearchParams]
  );

  // ─── Action callbacks ────────────────────────────────────────────────────

  const setSubcategory = useCallback(
    (slug: string | null) => {
      updateState(prev => ({ ...prev, subcategory: slug }));
    },
    [updateState]
  );

  const toggleFilter = useCallback(
    (section: string, value: string) => {
      updateState(prev => {
        const current = prev.filters[section] || [];
        const next = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
        return {
          ...prev,
          filters: { ...prev.filters, [section]: next },
        };
      });
    },
    [updateState]
  );

  const removeFilter = useCallback(
    (section: string, value: string) => {
      updateState(prev => {
        const current = prev.filters[section] || [];
        return {
          ...prev,
          filters: { ...prev.filters, [section]: current.filter(v => v !== value) },
        };
      });
    },
    [updateState]
  );

  const setPriceRange = useCallback(
    (range: [number, number]) => {
      updateState(prev => ({ ...prev, priceRange: range }));
    },
    [updateState]
  );

  const setSortBy = useCallback(
    (sort: string) => {
      updateState(prev => ({ ...prev, sortBy: sort }));
    },
    [updateState]
  );

  const clearAll = useCallback(() => {
    updateState(() => ({
      subcategory: null,
      filters: {},
      priceRange: [...config.priceRange] as [number, number],
      sortBy: 'featured',
    }));
  }, [updateState, config]);

  // ─── Derived: total active filter count (for "Clear All" badge) ───────────
  const activeFilterCount = useMemo(() => {
    let count = 0;
    for (const values of Object.values(state.filters)) {
      count += values.length;
    }
    // Price counts as 1 if not at default
    if (state.priceRange[0] !== config.priceRange[0] || state.priceRange[1] !== config.priceRange[1]) {
      count += 1;
    }
    if (state.subcategory) count += 1;
    return count;
  }, [state, config]);

  // ─── Derived: currently active subcategory object (or null) ───────────────
  const activeSubcategory: Subcategory | null = useMemo(() => {
    if (!state.subcategory) return null;
    return config.subcategories.find(s => s.slug === state.subcategory) ?? null;
  }, [state.subcategory, config]);

  return {
    state,
    setSubcategory,
    toggleFilter,
    removeFilter,
    setPriceRange,
    setSortBy,
    clearAll,
    activeFilterCount,
    activeSubcategory,
  };
}
