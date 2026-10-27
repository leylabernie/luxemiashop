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
}

export interface SearchFilters {
  query: string;
  priceRange: [number, number];
  selectedSizes: string[];
  selectedFabrics: string[];
}

const normalizeSize = (value: string) => value.trim().toUpperCase();

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
  if (query.length < 2 && selectedSizes.length === 0 && selectedFabrics.length === 0 && priceRange[0] === 0 && priceRange[1] === 1000) return [];
  const searchTerm = query.toLowerCase();
  return products.filter(product => {
    if (query.length >= 2 && ![product.title, product.category, product.fabric].some(value => value.toLowerCase().includes(searchTerm))) return false;
    const price = parseFloat(product.price);
    if (!(price >= priceRange[0] && price <= priceRange[1])) return false;
    if (selectedSizes.length > 0 && !selectedSizes.some(size => product.sizes.includes(normalizeSize(size)))) return false;
    const fabricWords = product.fabric.toLowerCase().split(/[^a-z0-9]+/);
    if (selectedFabrics.length > 0 && !selectedFabrics.some(fabric => fabricWords.includes(fabric.toLowerCase()))) return false;
    return true;
  }).slice(0, 12);
}
