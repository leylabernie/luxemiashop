import { useState, useEffect, useCallback } from 'react';
import { fetchAllProducts, type ShopifyProduct } from '@/lib/shopify';
import { sanitizeProductTitle } from '@/lib/productDescriptionEnrichment';
import occasionSignals from '@/data/occasionSignals.json';
import {
  applyCustomizableProductDetails,
  isMadeToOrderProduct,
} from '@/lib/customizableProducts';

// Shopify productType values mapped to category page routes
// Updated to include 'Wedding Suit', 'Designer Suit', 'Gharara Suit', 'Anarkali Suit', 'Gown'
// which are women's suit products on Shopify (NOT men's suits)
import { CATEGORY_PRODUCT_TYPES, getPrimaryCategory, getCatalogDisplayCategory } from '@/lib/catalogCategories.mjs';

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const matchesOccasion = (product: ShopifyProduct, occasion: string): boolean => {
  const signals = (occasionSignals as Record<string, string[]>)[occasion];
  if (!signals || product.node.availableForSale === false) return false;

  const searchableValues = [
    product.node.title || '',
    product.node.productType || '',
    ...(product.node.tags || []),
  ].map((value) => value.toLowerCase());

  return signals.some((signal) => {
    const pattern = new RegExp(`\\b${escapeRegex(signal.toLowerCase())}\\b`, 'i');
    return searchableValues.some((value) => pattern.test(value));
  });
};

// Map Shopify productType to display category names
export const getDisplayCategory = getCatalogDisplayCategory;

// ─── Persistent product cache ─────────────────────────────────────────────────
// Two-tier cache: in-memory (instant within a session) + localStorage (persists
// across page reloads and new tabs). TTL of 5 minutes balances freshness
// against API call volume — when Shopify titles change via CSV import, users
// see the new titles within at most 5 minutes of their next page load.
// Cache key is versioned — bump CACHE_VERSION when the product schema changes
// OR when you need to force-invalidate every browser's cache (e.g. after a
// known-stale deploy). v5 → v6 invalidates every browser's v5 cache instantly.
const CACHE_VERSION = 'v13';
const CACHE_KEY = `lux_products_${CACHE_VERSION}_categories2`;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes (was 30 — too stale after CSV imports)

function getStoredProducts(): ShopifyProduct[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || !Array.isArray(parsed?.data)) return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function storeProducts(products: ShopifyProduct[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: products }));
  } catch {
    // localStorage full or unavailable (private browsing) — no-op, in-memory cache still works
  }
}

// Keep complete catalogs separate by query. Partial pages are display-only and
// must never become a persistent catalog (which would hide later categories).
const catalogCache = new Map<string, {
  products?: ShopifyProduct[];
  at: number;
  pending?: Promise<ShopifyProduct[]>;
  listeners: Set<(products: ShopifyProduct[]) => void>;
}>();

declare global {
  interface Window {
    __INITIAL_DATA__?: { category?: string; path?: string; products: ShopifyProduct[] };
  }
}

function getInitialData(category?: string, storefrontQuery?: string): ShopifyProduct[] | null {
  if (typeof window === 'undefined') return null;
  const data = window.__INITIAL_DATA__;
  if (!data || !Array.isArray(data.products) || !data.products.length) return null;
  if (data.path !== window.location.pathname) return null;
  if (category && data.category && data.category !== category) return null;
  // A recent-product query may use the homepage/New Arrivals snapshot. Other
  // arbitrary queries must not display unrelated prerendered products.
  if (storefrontQuery && (!storefrontQuery.startsWith("created_at:>='") || data.category !== 'all')) return null;
  return data.products;
}

function getCachedProducts(query?: string): ShopifyProduct[] | null {
  const entry = catalogCache.get(query || '');
  if (entry?.products && Date.now() - entry.at < CACHE_TTL_MS) return entry.products;
  if (!query) return getStoredProducts();
  return null;
}

const getAllProducts = async (
  query?: string,
  onPartial?: (products: ShopifyProduct[]) => void,
  revalidate = false,
): Promise<ShopifyProduct[]> => {
  const key = query || '';
  let entry = catalogCache.get(key);
  if (!entry) {
    entry = { at: 0, listeners: new Set() };
    catalogCache.set(key, entry);
  }
  const cached = !revalidate && getCachedProducts(query);
  if (cached) return cached;
  if (onPartial) entry.listeners.add(onPartial);
  try {
    if (!entry.pending) {
      const target = entry;
      target.pending = fetchAllProducts(query, (partial) => {
        for (const listener of target.listeners) listener(partial);
      }).then((products) => {
        target.products = products;
        target.at = Date.now();
        if (!query) storeProducts(products);
        return products;
      }).finally(() => { target.pending = undefined; });
    }
    return await entry.pending!;
  } finally {
    if (onPartial) entry.listeners.delete(onPartial);
  }
};

// =============================================================================
// OLD PRODUCT BATCH HIDING (May 7th 2026)
// =============================================================================
// 160 products were created on April 8, 2026 (old batch) and should be hidden
// from the storefront after May 7th. They remain in Shopify but are invisible.
// The recent batch of 90 products was created on April 24, 2026 and must be kept.
//
// HOW IT WORKS:
//   - Products with createdAt BEFORE HIDE_PRODUCTS_BEFORE_DATE are filtered out
//   - Set HIDE_OLD_PRODUCTS = true to activate (flip to true around May 7)
//   - Set HIDE_OLD_PRODUCTS = false to disable (shows all products again)
// =============================================================================
const HIDE_OLD_PRODUCTS = false; // Disabled 2026-07-10 — was hiding most products
const HIDE_PRODUCTS_BEFORE_DATE = new Date('2026-04-09T00:00:00Z'); // April 9 = cutoff
// Anything created before April 9 2026 = April 8 batch (hide)
// Anything created on/after April 9 2026 = April 24+ batch (keep)

function isOldBatchProduct(product: ShopifyProduct): boolean {
  if (!HIDE_OLD_PRODUCTS) return false;
  const createdAt = product.node.createdAt;
  if (!createdAt) return false; // If no date, don't hide
  return new Date(createdAt) < HIDE_PRODUCTS_BEFORE_DATE;
}

// Title keywords for products to ALWAYS exclude from the site (not ethnic wear)
const EXCLUDED_TITLE_KEYWORDS = /\b(turban|sunglasses?)\b/i;
const SAREE_TITLE_KEYWORDS = /\b(saree|sari)\b/i;
const STANDALONE_BLOUSE_TITLE_KEYWORDS = /\b(blouse|choli)\b/i;

function isStandaloneBlouseProduct(product: ShopifyProduct): boolean {
  const title = product.node.title ?? '';
  return STANDALONE_BLOUSE_TITLE_KEYWORDS.test(title) && !SAREE_TITLE_KEYWORDS.test(title);
}

// Keywords that identify menswear products — used to exclude from women's pages
// IMPORTANT: Use word-boundary matching (not includes()) to prevent 'male' matching 'female'
// NOTE: 'indo western' is NOT included here because it's also a WOMEN's category.
// Women's Indo Western products have this in their title and should NOT be flagged as menswear.
const MENSWEAR_KEYWORDS_REGEX = /\b(sherwani|kurta\s?pajama|kurta\s?set|jodhpuri|modi\s?jacket|nehru\s?jacket|groom|menswear|men's|dhoti|bandi|pathani|achkan|angarakha|men\s?suit|men\s?kurta|men\s?shirt|men\s?trouser|men\s?jacket|\bmale\b|for\s?men|\bboys\b)\b/i;
const MENSWEAR_TAGS_EXACT = new Set(['mens', "men's", 'groom', 'groomsmen', 'groomsman', 'boys', 'male', 'menswear', 'indian-menswear', 'men', 'man', 'gender:male', 'gender:men']);

function isMenswear(product: ShopifyProduct): boolean {
  const pt = (product.node.productType ?? '').toLowerCase();
  const title = (product.node.title ?? '').toLowerCase();
  const tags = (product.node.tags ?? []).map(t => t.toLowerCase());

  // Check product type against menswear types
  const menswearTypes = CATEGORY_PRODUCT_TYPES['menswear'].map(t => t.toLowerCase());
  if (menswearTypes.some(t => pt === t || pt.includes(t))) return true;

  // Check if product type explicitly contains "men" — catch-all for men's categories
  // Use word boundary to avoid matching 'women' or 'female'
  if (/\bmen\b/.test(pt) || /\bmen's\b/.test(pt) || /\bmenswear\b/.test(pt) || /\bmale\b/.test(pt)) return true;

  // Check title for menswear keywords using regex with word boundaries
  // This prevents 'male' from matching 'female', 'men' from matching 'women', etc.
  if (MENSWEAR_KEYWORDS_REGEX.test(title)) return true;

  // Check tags — use exact matching to prevent 'men' matching inside other words
  // Also check tag with 'wear' suffix stripped (e.g., 'menswear' → 'mens')
  // FIX: Previous condition `t === \`${t.replace(/wear$/, '')}wear\`` was a tautology
  // that matched ANY tag ending in 'wear' (e.g., 'indian-ethnic-wear', 'party-wear'),
  // causing ALL products to be incorrectly classified as menswear.
  if (tags.some(t => MENSWEAR_TAGS_EXACT.has(t) || MENSWEAR_TAGS_EXACT.has(t.replace(/wear$/, '')))) return true;

  // If the product has a gender tag that says male/men, exclude it
  if (tags.some(t => t === 'gender:male' || t === 'gender:men' || t === 'male' || t === 'men')) return true;

  return false;
}

// Filter products by category client-side
export const filterByCategory = (products: ShopifyProduct[], category: string): ShopifyProduct[] => {
  // First, globally exclude old batch products (April 8 batch — hidden after May 7)
  // Then exclude products by title (turban, sunglasses, etc.)
  const allowed = products.filter(p => {
    if (isOldBatchProduct(p)) return false;
    if (EXCLUDED_TITLE_KEYWORDS.test(p.node.title ?? '')) return false;
    return true;
  });

  if (category === 'all') return allowed;

  if (category === 'customizable') {
    return allowed.filter((product) => isMadeToOrderProduct(product.node.handle, product.node.tags));
  }

  if (category.startsWith('occasion:')) {
    const occasion = category.slice('occasion:'.length);
    return allowed.filter((product) => matchesOccasion(product, occasion));
  }

  // Use the same primary category as New Arrivals and build-time rendering.
  // Keep legacy signal matching only for unrecognized imported types.
  const recognized = allowed.filter(p => getPrimaryCategory(p.node) !== null);
  if (CATEGORY_PRODUCT_TYPES[category] && recognized.length > 0) {
    return [
      ...recognized.filter(p => getPrimaryCategory(p.node) === category),
      ...filterByCategory(allowed.filter(p => getPrimaryCategory(p.node) === null), category),
    ];
  }
  const types = CATEGORY_PRODUCT_TYPES[category];
  if (!types) return allowed;

  // For menswear: include only men's products, but also exclude any that look like women's wear
  if (category === 'menswear') {
    const womensKeywords = /\b(saree|sari|lehenga|lehenga|anarkali|salwar|palazzo|plazzo|sharara|gharara|gown|dupatta|blouse|petticoat|choli|women|women's|female|ladies|bridal|pakistani suit)\b/i;
    return allowed.filter(p => {
      if (!isMenswear(p)) return false;
      // Also exclude rurban/sunglasses from menswear
      if (EXCLUDED_TITLE_KEYWORDS.test(p.node.title ?? '')) return false;
      // Extra safety: if title or tags strongly indicate women's wear, exclude from menswear
      const title = (p.node.title ?? '').toLowerCase();
      const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
      if (womensKeywords.test(title)) return false;
      if (tags.some(t => t === 'women' || t === 'womens' || t === 'female' || t === 'ladies' || t === 'gender:female' || t === 'gender:women')) return false;
      return true;
    });
  }

  // For all women's categories: exclude menswear + excluded titles first
  const filtered = allowed.filter(p => !isMenswear(p));

  // For indowestern, show women's fusion styles only — sharara/anarkali/
  // palazzo suits belong to /suits, so the fallback list must not re-admit
  // them by product type.
  if (category === 'indowestern') {
    const womensFusionTypes = types.map(t => t.toLowerCase());
    return filtered.filter(p => {
      const pt = (p.node.productType ?? '').toLowerCase();
      const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
      return womensFusionTypes.some(t => pt.includes(t)) ||
        tags.some(t => t.includes('indo') || t.includes('fusion') || t === 'contemporary' || t === 'western');
    });
  }

  // For suits: match by product type OR relevant tags (already menswear-excluded)
  if (category === 'suits') {
    const suitTags = ['salwar kameez', 'salwar-kameez', 'sharara suit', 'plazzo suit', 'pakistani suit',
      'anarkali suit', 'gharara suit', 'designer suit', 'wedding suit', 'boutique salwar suit'];
    const womensIndicators = /salwar|kameez|anarkali|sharara|palazzo|plazzo|gharara|pakistani|lehenga|dupatta|churidar|women|ladies|female/i;
    return filtered.filter(p => {
      const pt = (p.node.productType ?? '').toLowerCase();
      const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
      const title = (p.node.title ?? '').toLowerCase();

      // Extra safety: skip any product with men's-related tags even after isMenswear filter
      if (tags.some(t => t === 'men' || t === 'mens' || t === 'male' || t === 'boys' || t === 'menswear' || t === 'groom')) return false;
      if (title.includes('sherwani') || title.includes('kurta pajama') || title.includes('for men')) return false;

      // Match by exact productType
      if (types.some(t => t.toLowerCase() === pt)) {
        // For ambiguous types like 'Wedding Suit' or 'Designer Suit', require women's indicator
        if (pt === 'wedding suit' || pt === 'designer suit' || pt === 'suit') {
          if (!womensIndicators.test(title) && !womensIndicators.test(pt)) return false;
        }
        return true;
      }

      // Also match by suit-related tags (catches "Wedding Suit" products with "salwar kameez" tag, etc.)
      if (suitTags.some(st => tags.some(t => t === st || t.includes(st)))) {
        // Extra safety: if tag matches but product looks like men's wear, exclude
        const hasMensSignals = tags.some(t => t === 'men' || t === 'mens' || t === 'male' || t === 'boys' || t === 'menswear' || t === 'groom' || t === 'gender:male');
        const titleLooksMens = title.includes('sherwani') || title.includes('kurta pajama') || title.includes('for men');
        if (!hasMensSignals && !titleLooksMens) return true;
      }

      // Keyword fallback — catches unlisted variants like "Palazzo Suit", "Salwar", "Kurti", "Churidar Suit"
      if (/salwar|kameez|anarkali|sharara|palazzo|plazzo|gharara|pakistani\s+suit|kurti|churidar|patiala/.test(pt)) return true;

      return false;
    });
  }

  // Kids — girls' ethnic sets matched by product type or kids/girls signals.
  // Boys' wear is menswear and never lands here (isMenswear + boys tag guard).
  if (category === 'kids') {
    const kidsTypes = types.map(t => t.toLowerCase());
    return filtered.filter(p => {
      const pt = (p.node.productType ?? '').toLowerCase();
      const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
      const title = (p.node.title ?? '').toLowerCase();
      if (tags.some(t => t === 'boys' || t === 'boy' || t === 'mens' || t === 'menswear')) return false;
      if (title.includes('for boys') || title.includes('boys ')) return false;
      if (kidsTypes.some(t => pt === t)) return true;
      return tags.some(t => t === 'kids' || t.startsWith('kids ') || t.includes('girls ethnic')) ||
        /\b(kids|girls?)\b/.test(pt);
    });
  }

  // For lehengas, sarees: match by product type (already menswear-excluded)
  return filtered.filter(p => {
    const pt = (p.node.productType ?? '').toLowerCase();
    const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
    const title = (p.node.title ?? '').toLowerCase();

    // Extra safety: skip any product with men's-related tags even after isMenswear filter
    if (tags.some(t => t === 'men' || t === 'mens' || t === 'male' || t === 'boys' || t === 'menswear')) return false;
    if (title.includes('sherwani') || title.includes('kurta pajama') || title.includes('for men')) return false;
    // Some standalone blouses were imported with a saree product type. Keep
    // sarees that mention an included blouse, but do not merchandise a blouse-
    // only listing as a saree when its title contains no saree/sari signal.
    if (category === 'sarees' && isStandaloneBlouseProduct(p)) return false;

    // 1. Exact match against known types (fastest, most precise)
    if (types.some(t => t.toLowerCase() === pt)) return true;

    // 2. Keyword fallback — catches misspellings and unlisted variants
    //    e.g. "Lehnga Choli", "Silk Saree", "Party Wear Lehenga", "Bridal Sari"
    if (category === 'lehengas') return /lehenga|lehnga|lehena/.test(pt);
    if (category === 'sarees') return /saree|sari/.test(pt);

    // Jewelry fallback — Shopify products often have productType "Jewelry Set",
    // "Bridal Jewelry Set", "Kundan Necklace Set", etc. Also catch products
    // whose TYPE doesn't say jewelry but whose TAGS do (e.g. a necklace set
    // typed as "Accessories" but tagged "indian bridal jewelry"). Without this,
    // any jewelry productType not in CATEGORY_PRODUCT_TYPES is silently dropped
    // and never appears on /jewelry. (Bug observed July 2026: 8 newly imported
    // Shopify jewelry products with Type="Jewelry Set" were invisible.)
    if (category === 'jewelry') {
      if (/\bjewel|jewell|kundan|polki|necklace|choker|bangle|earring|maang\s?tikka|bridal\s?set/.test(pt)) {
        return true;
      }
      // Tag fallback — catches products with tags like 'indian bridal jewelry',
      // 'bridal kundan set', 'kundan necklace set' even if productType is generic.
      const jewelryTagPattern = /\bjewel|jewell|kundan|polki|necklace|choker|bangle|earring|maang|bridal\s?set|bridal\s?jewelry/;
      if (tags.some(t => jewelryTagPattern.test(t))) {
        return true;
      }
      return false;
    }

    return false;
  });
};

// Enrich products with display category — preserve original productType for filtering
const enrichProducts = (products: ShopifyProduct[]): ShopifyProduct[] =>
  products.map((p) => {
    const verifiedNode = applyCustomizableProductDetails(p.node);
    return {
      node: {
        ...verifiedNode,
        _originalProductType: verifiedNode.productType, // keep original for menswear detection
        title: sanitizeProductTitle(verifiedNode.title),
        productType: getDisplayCategory(verifiedNode.productType),
      },
    };
  });

export const useShopifyProducts = (category?: string, revalidate = false, storefrontQuery?: string) => {
  const prepareProducts = useCallback((source: ShopifyProduct[]): ShopifyProduct[] => {
    const allowed = source.filter(p => !isOldBatchProduct(p) && !EXCLUDED_TITLE_KEYWORDS.test(p.node.title ?? ''));
    return enrichProducts(category ? filterByCategory(allowed, category) : allowed);
  }, [category]);
  const [products, setProducts] = useState<ShopifyProduct[]>(() =>
    prepareProducts(getCachedProducts(storefrontQuery) || getInitialData(category, storefrontQuery) || []));
  const [isLoading, setIsLoading] = useState(products.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [hasMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const applyProducts = (source: ShopifyProduct[], partial = false) => {
      if (cancelled) return;
      const next = prepareProducts(source);
      // A partial global page might contain no items in this category yet.
      // Keep its prerendered cards until that category arrives in a later page.
      if (partial && !next.length) return;
      setProducts(previous => partial && previous.length > next.length ? previous : next);
      setIsLoading(false);
    };
    const initial = getCachedProducts(storefrontQuery) || getInitialData(category, storefrontQuery);
    if (initial) applyProducts(initial);
    else {
      setProducts([]);
      setIsLoading(true);
    }
    setError(null);
    getAllProducts(storefrontQuery, (partial) => applyProducts(partial, true), revalidate)
      .then((complete) => applyProducts(complete))
      .catch((err) => {
        console.warn('Unable to refresh the Shopify catalog:', err);
        if (!cancelled && !initial) setError('Failed to load products');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [category, revalidate, storefrontQuery, prepareProducts]);

  // no-op loadMore since we fetch all at once
  const loadMore = useCallback(() => {}, []);

  return { products, isLoading, isLoadingMore: false, error, hasMore, loadMore };
};

export const useShopifyPaginatedProducts = (category?: string) => {
  const { products, isLoading, error } = useShopifyProducts(category);

  const totalCount = products.length;
  const totalPages = 1;
  const currentPage = 1;
  const goToPage = useCallback(() => {}, []);

  return {
    products,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    productsPerPage: 50,
  };
};
