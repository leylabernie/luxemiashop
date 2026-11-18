import { hasNativeProductSizeOption, isProductSizeOptionName, normalizeProductOptionName } from './productOptionNames.ts';

interface SearchProductSource {
  metadata?: { fabric?: string | null; material?: string | null };
  fabricMetafield?: { value: string | null } | null;
  materialMetafield?: { value: string | null } | null;
  tags?: string[];
  options?: Array<{ name: string; values: string[] }>;
  variants?: { edges: Array<{ node: { availableForSale?: boolean; selectedOptions: Array<{ name: string; value: string }> } }> };
}

export interface SearchableProduct {
  title: string;
  category: string;
  price: string;
  fabric: string;
  sizes: string[];
  color?: string;
}

export interface SearchFilters {
  query: string;
  priceRange: [number, number];
  selectedSizes: string[];
  selectedFabrics: string[];
}

const normalizeSize = (value: string) => value.trim().toUpperCase();

const SEARCH_SYNONYM_MAP: Record<string, string> = {
  sari: 'saree',
  saris: 'saree',
  sarees: 'saree',
  lehengas: 'lehenga',
  cholis: 'choli',
  suits: 'suit',
  kurtas: 'kurta',
  kurtis: 'kurti',
  sherwanis: 'sherwani',
  anarkalis: 'anarkali',
  shararas: 'sharara',
  palazzos: 'palazzo',
  ghararas: 'gharara',
  dupattas: 'dupatta',
  blouses: 'blouse',
  gowns: 'gown',
  jackets: 'jacket',
  sets: 'set',
  jewellery: 'jewelry',
  necklaces: 'necklace',
  earrings: 'earring',
  bangles: 'bangle',
  chokers: 'choker',
  weddings: 'wedding',
  bridesmaids: 'bridesmaid',
};

const normalizeSearchToken = (token: string): string => SEARCH_SYNONYM_MAP[token] || token;

const tokenizeSearchText = (value: string): string[] =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(normalizeSearchToken);

function scoreQueryMatch(product: SearchableProduct, normalizedQuery: string, queryTokens: string[]): number {
  const titleLower = product.title.toLowerCase();
  const fields = [product.title, product.category, product.fabric, product.color || ''];
  const fieldLowers = fields.map(value => value.toLowerCase());
  const fieldWords = fields.map(tokenizeSearchText);
  const titleWords = fieldWords[0];

  const matchesToken = (token: string, words: string[], rawLower: string): boolean =>
    words.some(word => word === token || (token.length >= 2 && word.startsWith(token)) || (token.length >= 3 && word.includes(token)))
    || rawLower.includes(token);

  // Every query word must match at least one structured product field (title, category, fabric, or color).
  for (const token of queryTokens) {
    if (!fieldWords.some((words, idx) => matchesToken(token, words, fieldLowers[idx]))) {
      return 0;
    }
  }

  let score = 1;
  if (titleLower.includes(normalizedQuery)) score += 4;
  else if (fieldLowers.some(value => value.includes(normalizedQuery))) score += 2;
  if (queryTokens.length > 1 && queryTokens.every(token => matchesToken(token, titleWords, titleLower))) score += 2;
  return score;
}

/** Index real Shopify options, never sizes inferred from garment descriptions. */
export function getSearchSizes(product: SearchProductSource): string[] {
  const options = product.options || [];
  const sizeNames = new Set(options.filter(option => hasNativeProductSizeOption([option])).map(option => normalizeProductOptionName(option.name)));
  const isSize = (name: string) => sizeNames.has(normalizeProductOptionName(name)) || isProductSizeOptionName(name);
  const variants = product.variants?.edges || [];
  // Catalog listings intentionally fetch only one preview variant. The complete
  // option values are authoritative for offered sizes, not per-size stock.
  const declaredSizes = options.filter(option => isSize(option.name)).flatMap(option => option.values);
  const values = declaredSizes.length > 0
    ? declaredSizes
    : variants.filter(({ node }) => node.availableForSale !== false).flatMap(({ node }) => node.selectedOptions.filter(option => isSize(option.name)).map(option => option.value));
  return [...new Set(values.map(normalizeSize).filter(Boolean))];
}

/** Unknown material stays unknown; structured product facts take precedence. */
export function getSearchFabric(product: SearchProductSource): string {
  const fabric = product.fabricMetafield?.value?.trim()
    || product.metadata?.fabric?.trim()
    || product.materialMetafield?.value?.trim()
    || product.metadata?.material?.trim()
    || (product.tags || []).filter(tag => /^(?:fabric|material)\s*:/i.test(tag)).map(tag => tag.replace(/^[^:]*:\s*/, '').trim()).filter(Boolean).join(', ');
  // A known lining does not establish the garment's outer fabric.
  if (/lining\s+only/i.test(fabric) || (/lining/i.test(fabric) && /(?:outer|shell).*?(?:unspecified|not specified|unknown)/i.test(fabric))) return '';
  return fabric.replace(/\s+(?:with|and)\s+[^;,.]*\blining\b[^;,.]*/gi, '').trim();
}

export function filterSearchResults<T extends SearchableProduct>(products: T[], filters: SearchFilters): T[] {
  const { query, priceRange, selectedSizes, selectedFabrics } = filters;
  const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, ' ');
  const queryTokens = [...new Set(tokenizeSearchText(normalizedQuery))];
  const hasQuery = normalizedQuery.length >= 2 && queryTokens.length > 0;
  if (!hasQuery && selectedSizes.length === 0 && selectedFabrics.length === 0 && priceRange[0] === 0 && priceRange[1] === 1000) return [];

  const matched: Array<{ product: T; score: number; index: number }> = [];
  products.forEach((product, index) => {
    const score = hasQuery ? scoreQueryMatch(product, normalizedQuery, queryTokens) : 1;
    if (score === 0) return;
    const price = parseFloat(product.price);
    if (!(price >= priceRange[0] && price <= priceRange[1])) return;
    if (selectedSizes.length > 0 && !selectedSizes.some(size => product.sizes.includes(normalizeSize(size)))) return;
    const fabricWords = product.fabric.toLowerCase().split(/[^a-z0-9]+/);
    if (selectedFabrics.length > 0 && !selectedFabrics.some(fabric => fabricWords.includes(fabric.toLowerCase()))) return;
    matched.push({ product, score, index });
  });

  if (hasQuery && queryTokens.length > 1) {
    matched.sort((a, b) => b.score - a.score || a.index - b.index);
  }
  return matched.slice(0, 12).map(entry => entry.product);
}
