import { useState, useEffect, useCallback } from 'react';
import { fetchAllProducts, type ShopifyProduct } from '@/lib/shopify';

// Shopify productType values mapped to category page routes
// Updated to include 'Wedding Suit', 'Designer Suit', 'Gharara Suit', 'Anarkali Suit', 'Gown'
// which are women's suit products on Shopify (NOT men's suits)
const CATEGORY_PRODUCT_TYPES: Record<string, string[]> = {
  suits: ['Pakistani Suit', 'Salwar Suit', 'Sharara', 'Anarkali', 'Plazzo Suit', 'Palazzo Suit', 'Pakistani Readymade Suit', 'Salwar Kameez', 'Sharara Suit', 'Wedding Suit', 'Designer Suit', 'Gharara Suit', 'Anarkali Suit', 'Gown', 'Salwar', 'Kurti', 'Kurti Set', 'Palazzo', 'Readymade Suit', 'Churidar Suit', 'Patiala Suit', 'Straight Suit', 'Suit'],
  sarees: ['Saree', 'Ready-to-Wear Saree', 'Wedding Saree', 'Sarees', 'Silk Saree', 'Banarasi Saree', 'Cotton Saree', 'Georgette Saree', 'Bridal Saree', 'Designer Saree', 'Fancy Saree', 'Party Wear Saree', 'Kanjivaram Saree', 'Kanchipuram Saree', 'Tissue Saree', 'Net Saree', 'Sari'],
  lehengas: ['Lehenga', 'Lehenga Choli', 'Bridal Lehenga Choli', 'Lehnga', 'Lehnga Choli', 'Bridal Lehnga', 'Bridal Lehnga Choli', 'Lehenga Set', 'Lehenga Choli Set', 'Bridal Lehenga', 'Party Wear Lehenga', 'Wedding Lehenga', 'Designer Lehenga', 'Fancy Lehenga'],
  menswear: ["Men's Ethnic Wear", 'Kurta Pajama', 'Sherwani', "Men's Indian Wear", 'Modi Jacket Kurta Pajama', 'Menswear', "Men's Suit", 'Kurta Set', 'Kurta', 'Dhoti Kurta', 'Nehru Jacket Set'],
  indowestern: ['Indo Western', 'Indo-Western', 'Fusion Wear', 'Fusion', 'Indo Western Dress', 'Indo-Western Set', 'Jumpsuit', 'Cape Set', 'Coord Set', 'Co-Ords', 'Co-ord Set', 'Indo-Western Dress', 'Sharara Set'],
};

// Map Shopify productType to display category names
export const getDisplayCategory = (productType: string | undefined): string => {
  if (!productType) return 'Designer Wear';
  const pt = productType.toLowerCase();

  // Menswear check MUST come first to prevent men's items appearing in women's categories
  // NOTE: 'Wedding Suit', 'Designer Suit', 'Gharara Suit', 'Anarkali Suit', 'Gown'
  // are WOMEN's products on Shopify — do NOT match them as menswear
  if (/kurta pajama|sherwani|jodhpuri|men.*ethnic|men.*indian|men.*suit|modi jacket|menswear|bandi|pathani|achkan/.test(pt)) return 'Menswear';
  if (/\bmen\b/.test(pt)) return 'Menswear';

  // Women's categories — order matters (most specific first)
  if (/lehenga|lehnga|lehena/.test(pt)) return 'Lehengas';
  if (/saree|sari/.test(pt)) return 'Sarees';
  if (/pakistani|salwar|kameez|sharara|anarkali|plazzo|palazzo|gharara|gown|kurti|churidar|patiala/.test(pt)) return 'Salwar Kameez';
  if (/indo.?western|fusion|jumpsuit|cape set|coord set|co.?ord/.test(pt)) return 'Indo Western';

  return productType;
};

// ─── Persistent product cache ─────────────────────────────────────────────────
// Two-tier cache: in-memory (instant within a session) + localStorage (persists
// across page reloads and new tabs). TTL of 30 minutes prevents stale data.
// Cache key is versioned — bump CACHE_VERSION when the product schema changes.
const CACHE_VERSION = 'v5';
const CACHE_KEY = `lux_products_${CACHE_VERSION}`;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

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

// In-memory cache (fastest — reused within the same JS session)
let cachedProducts: ShopifyProduct[] | null = null;
let cachePromise: Promise<ShopifyProduct[]> | null = null;

const getAllProducts = async (): Promise<ShopifyProduct[]> => {
  // 1. In-memory: instant — same session, already fetched
  if (cachedProducts) return cachedProducts;

  // 2. localStorage: fast — persists across page reloads and new tabs for 30 min
  const stored = getStoredProducts();
  if (stored) {
    cachedProducts = stored;
    return cachedProducts;
  }

  // 3. Shopify API: only on first visit or after cache expires
  if (cachePromise) return cachePromise;

  // Pass a server-side date filter when old products are hidden — reduces API
  // response size by ~64% (from ~250 to ~90 products) and cuts latency noticeably.
  // Safety: if the filter returns 0 products (unsupported syntax or edge case),
  // automatically retry without the filter.
  const shopifyQuery = HIDE_OLD_PRODUCTS
    ? `created_at:>='${HIDE_PRODUCTS_BEFORE_DATE.toISOString().split('T')[0]}'`
    : undefined;

  cachePromise = (async () => {
    try {
      let products = await fetchAllProducts(shopifyQuery);
      // Safety fallback: if the date filter returned nothing, retry without filter
      if (products.length === 0 && shopifyQuery) {
        products = await fetchAllProducts(undefined);
      }
      cachedProducts = products;
      storeProducts(products);
      return products;
    } finally {
      cachePromise = null;
    }
  })();

  return cachePromise;
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
const HIDE_OLD_PRODUCTS = true; // ← Flip to true to hide April 8 batch
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

function getEffectiveCategory(explicitCategory?: string): string | undefined {
  if (explicitCategory) return explicitCategory;
  if (typeof window === 'undefined') return undefined;

  const path = window.location.pathname.replace(/\/$/, '');

  const routeCategories: Record<string, string> = {
    '/bestsellers': 'bestsellers',
    '/new-arrivals': 'new-arrivals',
    '/collections/wedding-guest-outfits': 'wedding-guest-outfits',
    '/collections/diwali-outfits': 'diwali-outfits',
    '/collections/eid-outfits': 'eid-outfits',
    '/collections/navratri-outfits': 'navratri-outfits',
    '/collections/mehendi-outfits': 'mehendi-outfits',
    '/collections/reception-outfits': 'reception-outfits',
    '/collections/bridal-lehengas': 'bridal-lehengas',
    '/collections/wedding-lehengas': 'wedding-lehengas',
  };

  return routeCategories[path];
}

export function productText(product: ShopifyProduct): string {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.handle,
    product.node.productType,
    ...(product.node.metadata?.tags ?? []),
    ...tags,
  ].filter(Boolean).join(' ').toLowerCase();
}

function titleAndTagText(product: ShopifyProduct): string {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.handle,
    product.node.productType,
    ...tags,
  ].filter(Boolean).join(' ').toLowerCase();
}

export function hasAny(product: ShopifyProduct, patterns: RegExp[]): boolean {
  const text = productText(product);
  return patterns.some(pattern => pattern.test(text));
}

const explicitOccasionPatterns: Record<string, RegExp[]> = {
  navratri: [/\bnavratri\b/i, /\bgarba\b/i, /\bdandiya\b/i, /\braas\b/i],
  diwali: [/\bdiwali\b/i, /\bpooja\b/i, /\bpuja\b/i],
  eid: [/\beid\b/i, /\bramadan\b/i],
  mehendi: [/\bmehendi\b/i, /\bmehndi\b/i, /\bhaldi\b/i, /\bsangeet\b/i],
  weddingGuest: [/\bwedding\s+guest\b/i, /\bwedding\s+guest\s+outfit/i, /\bsangeet\s+outfit/i, /\breception\s+outfit/i, /\bparty\s?wear\b/i],
  reception: [/\breception\b/i, /\bcocktail\b/i, /\bevening\b/i, /\bparty\s?wear\b/i],
};

export function hasExplicitOccasion(product: ShopifyProduct, occasion: keyof typeof explicitOccasionPatterns): boolean {
  const text = titleAndTagText(product);
  return explicitOccasionPatterns[occasion].some(pattern => pattern.test(text));
}

const bridalOrGroomSignals = /\b(bridal|bride|dulhan|groom|groomsmen|groomsman|sherwani|wedding\s+lehenga|bridal\s+lehenga)\b/i;
const bridalSignals = /\b(bridal|bride|dulhan|wedding\s+lehenga|bridal\s+lehenga)\b/i;
const groomSignals = /\b(groom|groomsmen|groomsman|sherwani)\b/i;
const haldiMehendiGroomSignals = /\b(haldi|mehendi|mehndi|groom|groomsmen|groomsman|sherwani)\b/i;

export function excludeBridalUnlessExplicit(
  product: ShopifyProduct,
  occasion: keyof typeof explicitOccasionPatterns
): boolean {
  const text = productText(product);
  return !bridalOrGroomSignals.test(text) || hasExplicitOccasion(product, occasion);
}

function isAvailableProduct(product: ShopifyProduct): boolean {
  if (product.node.availableForSale === false) return false;
  if (product.node.availableForSale === true) return true;
  const variants = product.node.variants?.edges ?? [];
  return variants.length === 0 || variants.some(v => v.node.availableForSale);
}

function sortByCreatedAtDesc(products: ShopifyProduct[]): ShopifyProduct[] {
  return [...products].sort((a, b) =>
    new Date(b.node.createdAt || 0).getTime() - new Date(a.node.createdAt || 0).getTime()
  );
}

function isLehenga(product: ShopifyProduct): boolean {
  return /\blehenga\b|\blehnga\b|\blehena\b|\blehenga\s+choli\b|\blehnga\s+choli\b/i.test(productText(product));
}

function scoreBestseller(product: ShopifyProduct): number {
  const text = productText(product);
  let score = 0;

  if (/\bbest\s?sellers?\b|\bcustomer\s+favou?rites?\b|\bmost\s+loved\b|\btop\s+rated\b/i.test(text)) score += 50;
  if (/\btrending\b|\bpopular\b|\bstyling\s+team\s+picks?\b/i.test(text)) score += 20;
  if (/\bbridal\b|\bwedding\b|\breception\b|\bsangeet\b|\bdiwali\b|\beid\b/i.test(text)) score += 8;
  if (/\bsilk\b|\bbanarasi\b|\bzari\b|\bzardozi\b|\bvelvet\b|\bembroider(?:y|ed)?\b|\bmirror\s?work\b/i.test(text)) score += 6;
  if (/\bready\s?to\s?wear\b|\breadymade\b|\bin\s?stock\b/i.test(text)) score += 4;

  const createdAt = product.node.createdAt ? new Date(product.node.createdAt).getTime() : 0;
  if (Number.isFinite(createdAt) && createdAt > 0) {
    const ageDays = (Date.now() - createdAt) / 86400000;
    if (ageDays <= 45) score += 6;
    else if (ageDays <= 90) score += 3;
  }

  return score;
}

function filterNamedCollection(products: ShopifyProduct[], category: string): ShopifyProduct[] | null {
  switch (category) {
    case 'new-arrivals':
      return sortByCreatedAtDesc(products.filter(isAvailableProduct)).slice(0, 24);

    case 'bestsellers':
      return products
        .map(product => ({ product, score: scoreBestseller(product), available: isAvailableProduct(product) }))
        .filter(item => item.score >= 8)
        .sort((a, b) => Number(b.available) - Number(a.available) || b.score - a.score)
        .slice(0, 32)
        .map(item => item.product);

    case 'navratri-outfits':
      return products.filter(product =>
        !isMenswear(product)
        && hasExplicitOccasion(product, 'navratri')
      );

    case 'diwali-outfits':
      return products.filter(product =>
        !isMenswear(product)
        && hasAny(product, [/\bdiwali\s+outfits?\b/i, /\bdiwali\b/i, /\bpooja\b/i, /\bpuja\b/i, /\bfestive\b/i, /\bfestival\s+wear\b/i, /\bzari\b/i, /\bsilk\b/i, /\bbanarasi\b/i])
        && excludeBridalUnlessExplicit(product, 'diwali')
      );

    case 'eid-outfits':
      return products.filter(product =>
        !isMenswear(product)
        && hasAny(product, [/\beid\s+wear\b/i, /\beid\b/i, /\bramadan\b/i, /\bpakistani\s+suit\b/i, /\bsharara\b/i, /\bgharara\b/i, /\bsalwar\b/i, /\bkameez\b/i])
        && excludeBridalUnlessExplicit(product, 'eid')
      );

    case 'mehendi-outfits':
      return products.filter(product =>
        !isMenswear(product)
        && hasAny(product, [/\bmehendi\b/i, /\bmehndi\b/i, /\bhaldi\b/i, /\bsangeet\b/i])
        && !groomSignals.test(productText(product))
      );

    case 'wedding-guest-outfits':
      return products.filter(product =>
        !isMenswear(product)
        && hasAny(product, [/\bwedding\s+guest\b/i, /\bwedding\s+guest\s+outfits?\b/i, /\bsangeet\s+outfits?\b/i, /\breception\s+outfits?\b/i, /\bparty\s?wear\b/i])
        && !bridalOrGroomSignals.test(productText(product))
      );

    case 'reception-outfits':
      return products.filter(product =>
        !isMenswear(product)
        && hasAny(product, [/\breception\b/i, /\bcocktail\b/i, /\bevening\b/i, /\bparty\s?wear\b/i])
        && (!haldiMehendiGroomSignals.test(productText(product)) || hasExplicitOccasion(product, 'reception'))
      );

    case 'bridal-lehengas':
      return products.filter(product =>
        !isMenswear(product)
        && isLehenga(product)
        && bridalSignals.test(productText(product))
      );

    case 'wedding-lehengas':
      return products.filter(product =>
        !isMenswear(product)
        && isLehenga(product)
        && hasAny(product, [/\bwedding\s+lehenga\b/i, /\bindian\s+wedding\b/i, /\bwedding\b/i, /\breception\b/i, /\bsangeet\b/i, /\bengagement\b/i, /\bceremony\b/i])
      );

    default:
      return null;
  }
}

// Filter products by category client-side
const filterByCategory = (products: ShopifyProduct[], category: string): ShopifyProduct[] => {
  // First, globally exclude old batch products (April 8 batch — hidden after May 7)
  // Then exclude products by title (turban, sunglasses, etc.)
  const allowed = products.filter(p => {
    if (isOldBatchProduct(p)) return false;
    if (EXCLUDED_TITLE_KEYWORDS.test(p.node.title ?? '')) return false;
    return true;
  });

  if (category === 'all') return allowed;

  const namedCollection = filterNamedCollection(allowed, category);
  if (namedCollection) return namedCollection;

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

  // For indowestern, show women's fusion styles
  if (category === 'indowestern') {
    const womensFusionTypes = [
      ...types.map(t => t.toLowerCase()),
      'sharara', 'anarkali', 'co-ords', 'coord set', 'jumpsuit', 'cape set', 'plazzo suit',
    ];
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

  // For lehengas, sarees: match by product type (already menswear-excluded)
  return filtered.filter(p => {
    const pt = (p.node.productType ?? '').toLowerCase();
    const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
    const title = (p.node.title ?? '').toLowerCase();

    // Extra safety: skip any product with men's-related tags even after isMenswear filter
    if (tags.some(t => t === 'men' || t === 'mens' || t === 'male' || t === 'boys' || t === 'menswear')) return false;
    if (title.includes('sherwani') || title.includes('kurta pajama') || title.includes('for men')) return false;

    // 1. Exact match against known types (fastest, most precise)
    if (types.some(t => t.toLowerCase() === pt)) return true;

    // 2. Keyword fallback — catches misspellings and unlisted variants
    //    e.g. "Lehnga Choli", "Silk Saree", "Party Wear Lehenga", "Bridal Sari"
    if (category === 'lehengas') return /lehenga|lehnga|lehena/.test(pt);
    if (category === 'sarees') return /saree|sari/.test(pt);

    return false;
  });
};

// Enrich products with display category — preserve original productType for filtering
const enrichProducts = (products: ShopifyProduct[]): ShopifyProduct[] =>
  products.map(p => ({
    node: {
      ...p.node,
      _originalProductType: p.node.productType, // keep original for menswear detection
      productType: getDisplayCategory(p.node.productType),
    },
  }));

export const useShopifyProducts = (category?: string) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Always fetch all products (cached after first call), then filter client-side
        const allProducts = await getAllProducts();
        // Apply global filters (old batch exclusion + excluded titles) even when no category
        const globallyFiltered = allProducts.filter(p => {
          if (isOldBatchProduct(p)) return false;
          if (EXCLUDED_TITLE_KEYWORDS.test(p.node.title ?? '')) return false;
          return true;
        });
        const effectiveCategory = getEffectiveCategory(category);
        const filtered = effectiveCategory ? filterByCategory(allProducts, effectiveCategory) : globallyFiltered;
        setProducts(enrichProducts(filtered));
      } catch (err) {
        console.error('Error fetching Shopify products:', err);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [category]);

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
