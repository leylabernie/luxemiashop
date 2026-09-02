import type { ShopifyProduct } from '@/lib/shopify';

type ProductNode = ShopifyProduct['node'];
type ProductLike = ShopifyProduct | ProductNode;

const SIZE_OPTION_NAMES = new Set([
  'size',
  'standard size',
  'blouse size',
  'bust size',
  'chest size',
  'stitching size',
]);

const STALE_OR_RISKY_COPY = /free worldwide|5-day express|7-10 business days|free shipping on orders over \$350|ships within 1[–-]2 business days from the usa/i;

function getProductNode(product: ProductLike): ProductNode {
  return 'node' in product ? product.node : product;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeOptionName(value: string): string {
  return normalizeWhitespace(value).toLowerCase();
}

function isSizeOptionName(value: string): boolean {
  return SIZE_OPTION_NAMES.has(normalizeOptionName(value));
}

function normalizedTags(product: ProductNode): string[] {
  return (product.tags ?? []).map((tag) => normalizeWhitespace(String(tag)).toLowerCase());
}

function hasTagPrefix(tags: string[], ...prefixes: string[]): boolean {
  return tags.some((tag) => prefixes.some((prefix) => tag.startsWith(`${prefix}:`)));
}

function prefixedTagValue(tags: string[], ...prefixes: string[]): string {
  const tag = tags.find((candidate) => prefixes.some((prefix) => candidate.startsWith(`${prefix}:`)));
  return tag ? normalizeWhitespace(tag.slice(tag.indexOf(':') + 1)) : '';
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && normalizeWhitespace(value).length > 0);
}

function hasArrayValue(value: string[] | null | undefined): boolean {
  return Array.isArray(value) && value.some((item) => hasText(item));
}

function hasIncludedPieces(product: ProductNode, tags: string[]): boolean {
  return hasTagPrefix(tags, 'included', 'included pieces', 'pieces', 'set includes', 'package includes')
    || hasArrayValue(product.metadata?.includedComponents)
    || hasText(product.includedComponentsMetafield?.value)
    || /\b(?:what(?:’|'| i)s included|included pieces|set includes|package includes)\b/i.test(product.description ?? '');
}

function hasMaterial(product: ProductNode, tags: string[]): boolean {
  return hasTagPrefix(tags, 'fabric', 'material')
    || hasText(product.metadata?.fabric)
    || hasText(product.metadata?.material)
    || hasText(product.fabricMetafield?.value)
    || hasText(product.materialMetafield?.value);
}

function hasWork(product: ProductNode, tags: string[]): boolean {
  return hasTagPrefix(tags, 'work', 'embroidery', 'embellishment')
    || hasText(product.metadata?.work);
}

function hasOccasion(product: ProductNode, tags: string[]): boolean {
  return hasTagPrefix(tags, 'occasion', 'role')
    || hasArrayValue(product.metadata?.occasion)
    || hasText(product.occasionMetafield?.value);
}

function hasConstruction(product: ProductNode, tags: string[]): boolean {
  return hasTagPrefix(tags, 'construction', 'stitching', 'blouse', 'lining', 'closure')
    || /\b(?:fully stitched|semi[- ]stitched|unstitched|readymade|ready made|lined|zip closure|drawstring)\b/i.test(product.description ?? '');
}

function hasColor(product: ProductNode, tags: string[]): boolean {
  return hasTagPrefix(tags, 'color', 'colour')
    || hasText(product.metadata?.color)
    || hasText(product.colorMetafield?.value);
}

function hasFulfilmentClassification(product: ProductNode, tags: string[]): boolean {
  return tags.some((tag) =>
    /^(?:availability:)?(?:ready[- ]to[- ]ship|made[- ]to[- ]order|custom|pre[- ]order)$/.test(tag),
  );
}

function hasVerifiedTiming(product: ProductNode): boolean {
  if (typeof product.shipsWithin === 'number' && Number.isFinite(product.shipsWithin) && product.shipsWithin > 0) {
    return true;
  }

  const value = Number(product.shipsWithinMetafield?.value);
  return Number.isFinite(value) && value > 0;
}

function getAvailableVariants(product: ProductNode) {
  return (product.variants?.edges ?? [])
    .map((edge) => edge.node)
    .filter((variant) => variant.availableForSale !== false);
}

function getSizeChoiceCount(product: ProductNode): number {
  const optionValues = (product.options ?? [])
    .filter((option) => isSizeOptionName(option.name))
    .flatMap((option) => option.values ?? [])
    .map((value) => normalizeWhitespace(String(value)))
    .filter((value) => value && value.toLowerCase() !== 'default title');

  const variantValues = getAvailableVariants(product)
    .flatMap((variant) => variant.selectedOptions ?? [])
    .filter((option) => isSizeOptionName(option.name))
    .map((option) => normalizeWhitespace(String(option.value)))
    .filter((value) => value && value.toLowerCase() !== 'default title');

  return new Set([...optionValues, ...variantValues]).size;
}

function normalizedTitle(product: ProductNode): string {
  return normalizeWhitespace(product.title ?? '')
    .toLowerCase()
    .replace(/\bluxemia\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function commercialFamilyKey(product: ProductNode): string {
  const tags = normalizedTags(product);
  const material = prefixedTagValue(tags, 'fabric', 'material');
  const work = prefixedTagValue(tags, 'work', 'embroidery', 'embellishment');
  const construction = prefixedTagValue(tags, 'construction', 'stitching');
  const type = normalizeWhitespace(product.productType ?? '').toLowerCase();

  const structuredKey = [type, material, work, construction].filter(Boolean).join('|');
  if (structuredKey) return structuredKey;

  return normalizedTitle(product)
    .replace(/\b(?:black|blue|navy|sky|teal|green|lime|pista|red|maroon|wine|pink|rani|dusty|yellow|mustard|orange|rust|purple|lavender|lilac|white|off white|ivory|cream|beige|gold|golden|silver|multicolor|multi color)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getCommercialProductQualityScore(
  product: ProductLike,
  duplicateTitleCount = 1,
): number {
  const node = getProductNode(product);
  const tags = normalizedTags(node);
  const variants = getAvailableVariants(node);
  const imageEdges = node.images?.edges ?? [];
  const imageCount = imageEdges.length;
  const altCount = imageEdges.filter((edge) => hasText(edge.node.altText)).length;
  const descriptionLength = normalizeWhitespace(node.description ?? '').length;
  const sourceVerified = tags.some((tag) => tag.startsWith('source-verified:'));
  const skuCoverage = variants.length > 0
    ? variants.filter((variant) => hasText(variant.sku)).length / variants.length
    : 0;

  let score = 0;

  if (node.availableForSale !== false && variants.length > 0) score += 30;
  if (sourceVerified) score += 125;
  if (hasIncludedPieces(node, tags)) score += 40;
  if (hasMaterial(node, tags)) score += 28;
  if (hasWork(node, tags)) score += 24;
  if (hasOccasion(node, tags)) score += 22;
  if (hasConstruction(node, tags)) score += 28;
  if (hasColor(node, tags)) score += 10;
  if (hasFulfilmentClassification(node, tags)) score += 18;
  if (hasVerifiedTiming(node)) score += 18;
  if (hasText(node.productType)) score += 10;
  if (hasText(node.seo?.title)) score += 8;
  if (hasText(node.seo?.description)) score += 8;

  if (descriptionLength >= 700) score += 38;
  else if (descriptionLength >= 400) score += 28;
  else if (descriptionLength >= 220) score += 16;
  else if (descriptionLength >= 100) score += 6;
  else score -= 35;

  if (/\bwhat(?:’|'| i)s included\b/i.test(node.description ?? '')) score += 12;
  if (STALE_OR_RISKY_COPY.test(node.description ?? '')) score -= 40;

  if (imageCount >= 7) score += 52;
  else if (imageCount >= 5) score += 44;
  else if (imageCount >= 3) score += 32;
  else if (imageCount === 2) score += 16;
  else if (imageCount === 1) score -= 28;
  else score -= 170;

  if (imageCount > 0) score += Math.round((altCount / imageCount) * 14);

  score += Math.min(24, variants.length * 3);
  score += Math.round(skuCoverage * 14);

  const sizeChoiceCount = getSizeChoiceCount(node);
  if (sizeChoiceCount >= 5) score += 26;
  else if (sizeChoiceCount >= 2) score += 18;
  else if (sizeChoiceCount === 1) score += 8;

  const price = Number(node.priceRange?.minVariantPrice?.amount);
  if (Number.isFinite(price) && price > 0) score += 5;
  else score -= 100;

  if (/placeholder|sample product|test product|dummy/i.test(`${node.title} ${node.handle}`)) score -= 250;
  if (duplicateTitleCount > 1) score -= Math.min(130, (duplicateTitleCount - 1) * 65);

  return score;
}

export function rankCommercialProducts<T extends ProductLike>(products: T[]): T[] {
  const duplicateTitleCounts = new Map<string, number>();
  for (const product of products) {
    const key = normalizedTitle(getProductNode(product));
    duplicateTitleCounts.set(key, (duplicateTitleCounts.get(key) ?? 0) + 1);
  }

  const remaining = products.map((product, originalIndex) => {
    const node = getProductNode(product);
    const titleKey = normalizedTitle(node);
    return {
      product,
      originalIndex,
      titleKey,
      familyKey: commercialFamilyKey(node),
      baseScore: getCommercialProductQualityScore(product, duplicateTitleCounts.get(titleKey) ?? 1),
      createdAt: new Date(node.createdAt).getTime() || 0,
    };
  });

  const ranked: T[] = [];
  const familyUse = new Map<string, number>();
  const titleUse = new Map<string, number>();

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestAdjustedScore = Number.NEGATIVE_INFINITY;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];
      const familyPenalty = (familyUse.get(candidate.familyKey) ?? 0) * 24;
      const titlePenalty = (titleUse.get(candidate.titleKey) ?? 0) * 180;
      const adjustedScore = candidate.baseScore - familyPenalty - titlePenalty;
      const currentBest = remaining[bestIndex];

      if (
        adjustedScore > bestAdjustedScore
        || (
          adjustedScore === bestAdjustedScore
          && (
            candidate.createdAt > currentBest.createdAt
            || (
              candidate.createdAt === currentBest.createdAt
              && candidate.originalIndex < currentBest.originalIndex
            )
          )
        )
      ) {
        bestIndex = index;
        bestAdjustedScore = adjustedScore;
      }
    }

    const [selected] = remaining.splice(bestIndex, 1);
    ranked.push(selected.product);
    familyUse.set(selected.familyKey, (familyUse.get(selected.familyKey) ?? 0) + 1);
    titleUse.set(selected.titleKey, (titleUse.get(selected.titleKey) ?? 0) + 1);
  }

  return ranked;
}
