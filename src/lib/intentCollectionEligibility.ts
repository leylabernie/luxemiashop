export type DurableIntentCollectionSlug =
  | 'wedding-guest-lehengas'
  | 'wedding-guest-kurta-sets'
  | 'diwali-womenswear'
  | 'diwali-menswear';

interface IntentVariantNode {
  title?: string | null;
  availableForSale?: boolean | null;
  selectedOptions?: Array<{ name?: string | null; value?: string | null }> | null;
}

export interface IntentCatalogProduct {
  title?: string | null;
  productType?: string | null;
  tags?: string[] | null;
  availableForSale?: boolean | null;
  occasionMetafield?: { value?: string | null } | null;
  genderMetafield?: { value?: string | null } | null;
  metadata?: {
    occasion?: string[] | null;
    gender?: string | null;
  } | null;
  variants?: { edges?: Array<{ node?: IntentVariantNode | null }> | null } | null;
}

const DURABLE_INTENT_SLUGS = new Set<DurableIntentCollectionSlug>([
  'wedding-guest-lehengas',
  'wedding-guest-kurta-sets',
  'diwali-womenswear',
  'diwali-menswear',
]);

const MENSWEAR_SIGNAL = /\b(sherwani|kurta\s?pajama|kurta\s?set|jodhpuri|modi\s?jacket|nehru\s?jacket|groom|menswear|men's|dhoti|bandi|bandhgala|pathani|achkan|angarakha|men\s?suit|men\s?kurta|men\s?shirt|men\s?trouser|men\s?jacket|male|for\s?men|boys)\b/i;
const MENSWEAR_TAGS = new Set([
  'mens', "men's", 'groom', 'groomsmen', 'groomsman', 'boys', 'male',
  'menswear', 'indian-menswear', 'men', 'man', 'gender:male', 'gender:men',
]);
const WEDDING_GUEST_ROLE = /\b(wedding[\s_-]*guests?|bride[\s_-]?maids?|maid[\s_-]+of[\s_-]+hono(?:u)?r)\b/i;
const EXPLICIT_BRIDAL_ROLE = /\b(bridal|bride|dulhan|trousseau)\b/i;
const LEHENGA_GARMENT = /\b(lehenga|lehnga|lehena)\b/i;
const KURTA_SET_GARMENT = /\bkurta\b.{0,48}\b(?:set|pajama|pyjama|dhoti|churidar|nehru\s+jacket|modi\s+jacket|bandi|waistcoat)\b|\b(?:pajama|pyjama|dhoti|churidar)\b.{0,48}\bkurta\b/i;
const DIWALI_SIGNAL = /\b(diwali|festive|festival)\b/i;
const WOMENSWEAR_OUTFIT = /\b(sarees?|saris?|lehengas?|lehngas?|lehenas?|salwar|kameez|anarkali|sharara|gharara|palazzo|plazzo|churidar|patiala|kurtis?|gowns?|dresses?|jumpsuits?|cape\s*set|skirt\s*set|(?:three|3)[-\s]?piece\s*set|co-?ords?|indo[ -]?western|fusion\s*wear|suits?)\b/i;
const MENSWEAR_OUTFIT = /\b(kurta|sherwani|jodhpuri|nehru\s*jacket|modi\s*jacket|dhoti|pathani|achkan|bandi|bandhgala|angarakha|men(?:'s)?\s*suit)\b/i;
const STANDALONE_BLOUSE = /\b(blouse|choli)\b/i;

function compact(values: Array<string | null | undefined>): string[] {
  return values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
}

function searchableValues(product: IntentCatalogProduct): string[] {
  return compact([
    product.title,
    product.productType,
    ...(product.tags || []),
    product.occasionMetafield?.value,
    product.genderMetafield?.value,
    ...(product.metadata?.occasion || []),
    product.metadata?.gender,
  ]);
}

function matchesAnyValue(product: IntentCatalogProduct, pattern: RegExp): boolean {
  return searchableValues(product).some((value) => pattern.test(value));
}

function typeAndTitle(product: IntentCatalogProduct): string {
  return `${product.productType || ''} ${product.title || ''}`;
}

function hasMenswearEvidence(product: IntentCatalogProduct): boolean {
  if (matchesAnyValue(product, MENSWEAR_SIGNAL)) return true;
  return (product.tags || []).some((tag) => MENSWEAR_TAGS.has(tag.trim().toLowerCase()));
}

function hasAvailableGarmentVariant(product: IntentCatalogProduct): boolean {
  if (product.availableForSale !== true) return false;
  const variants = product.variants?.edges || [];
  return variants.some(({ node }) => node?.availableForSale === true);
}

function hasExplicitBridalRole(product: IntentCatalogProduct): boolean {
  if (EXPLICIT_BRIDAL_ROLE.test(typeAndTitle(product))) return true;
  return (product.tags || []).some((tag) => /^role\s*:\s*bride$/i.test(tag.trim()));
}

function isStandaloneBlouse(product: IntentCatalogProduct): boolean {
  const title = product.title || '';
  if (/^(?:saree\s+)?(?:blouse|choli)$/i.test((product.productType || '').trim())) return true;
  return STANDALONE_BLOUSE.test(title) && !WOMENSWEAR_OUTFIT.test(title.replace(STANDALONE_BLOUSE, ''));
}

export function isDurableIntentCollectionSlug(value: string): value is DurableIntentCollectionSlug {
  return DURABLE_INTENT_SLUGS.has(value as DurableIntentCollectionSlug);
}

export function isEligibleForDurableIntent(
  product: IntentCatalogProduct,
  intent: DurableIntentCollectionSlug,
): boolean {
  if (!hasAvailableGarmentVariant(product)) return false;

  const garmentEvidence = typeAndTitle(product);
  if (intent === 'wedding-guest-lehengas') {
    return LEHENGA_GARMENT.test(garmentEvidence)
      && !hasMenswearEvidence(product)
      && matchesAnyValue(product, WEDDING_GUEST_ROLE)
      && !hasExplicitBridalRole(product);
  }

  if (intent === 'wedding-guest-kurta-sets') {
    return KURTA_SET_GARMENT.test(garmentEvidence)
      && hasMenswearEvidence(product)
      && matchesAnyValue(product, WEDDING_GUEST_ROLE);
  }

  if (!matchesAnyValue(product, DIWALI_SIGNAL)) return false;
  if (intent === 'diwali-womenswear') {
    return !hasMenswearEvidence(product)
      && WOMENSWEAR_OUTFIT.test(garmentEvidence)
      && !isStandaloneBlouse(product);
  }

  return hasMenswearEvidence(product) && MENSWEAR_OUTFIT.test(garmentEvidence);
}
