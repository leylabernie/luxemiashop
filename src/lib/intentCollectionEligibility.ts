export type DurableIntentCollectionSlug =
  | 'wedding-guest-lehengas'
  | 'wedding-guest-kurta-sets'
  | 'diwali-womenswear'
  | 'diwali-menswear'
  | 'navratri-chaniya'
  | 'garba'
  | 'groomsmen'
  | 'sangeet'
  | 'reception';

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
  'navratri-chaniya',
  'garba',
  'groomsmen',
  'sangeet',
  'reception',
]);

const MENSWEAR_SIGNAL = /\b(sherwani|kurta\s?pajama|kurta\s?set|jodhpuri|modi\s?jacket|nehru\s?jacket|groom|menswear|men's|dhoti|bandi|bandhgala|pathani|achkan|angarakha|men\s?suit|men\s?kurta|men\s?shirt|men\s?trouser|men\s?jacket|male|for\s?men|boys)\b/i;
const MENSWEAR_TAGS = new Set([
  'mens', "men's", 'groom', 'groomsmen', 'groomsman', 'boys', 'male',
  'menswear', 'indian menswear', 'men', 'man', 'gender male', 'gender men',
]);
const OBSOLETE_POLICY_TAG_PATTERN = /\b(?:international(?:ly)?|worldwide|global|canada|australia|usa|us|ca|uk|gb|au|nz|za|mu|united\s+states|united\s+kingdom|new\s+zealand|south\s+africa|mauritius)\b|\b(?:free)?(?:shipping|shipments?|ships?(?:to|from)?|deliver(?:y|ies|ed|ing)?|dispatch(?:ed|ing)?|postage|tracking|carrier|transit)[a-z0-9]*\b|\bu\s+s(?:\s+a)?\b|\bu\s+k\b/i;
const READY_TO_SHIP_TAG_PATTERN = /^(?:(?:availability|fulfillment|shipping|status)\s*[:=]\s*)?ready[\s_-]*to[\s_-]*ship$/i;
const BRIDESMAID_ROLE = /\b(?:bride(?:s['’]?|['’]s)?[\s_-]*maids?|maid[\s_-]+of[\s_-]+hono(?:u)?r)\b/i;
const WEDDING_GUEST_ROLE = /\b(?:wedding[\s_-]*guests?|bride(?:s['’]?|['’]s)?[\s_-]*maids?|maid[\s_-]+of[\s_-]+hono(?:u)?r)\b/i;
const EXPLICIT_BRIDAL_ROLE = /\b(bridal|brides?|dulhan|trousseau)\b/i;
const LEHENGA_GARMENT = /\b(lehenga|lehnga|lehena)\b/i;
const KURTA_SET_GARMENT = /\bkurta\b.{0,48}\b(?:set|pajama|pyjama|dhoti|churidar|nehru\s+jacket|modi\s+jacket|bandi|waistcoat)\b|\b(?:pajama|pyjama|dhoti|churidar)\b.{0,48}\bkurta\b/i;
const DIWALI_SIGNAL = /\b(diwali|festive|festival)\b/i;
const NAVRATRI_CHANIYA_SIGNAL = /\b(navratri|chaniya)\b/i;
const GARBA_SIGNAL = /\b(garba|dandiya)\b/i;
const GROOMSMEN_SIGNAL = /\bgroomsm(?:a|e)n\b/i;
const SANGEET_SIGNAL = /\bsangeet\b/i;
const RECEPTION_SIGNAL = /\breception\b/i;
const WOMENSWEAR_OUTFIT = /\b(sarees?|saris?|lehengas?|lehngas?|lehenas?|salwar|kameez|anarkali|sharara|gharara|palazzo|plazzo|churidar|patiala|kurtis?|gowns?|dresses?|jumpsuits?|cape\s*set|skirt\s*set|(?:three|3)[-\s]?piece\s*set|co-?ords?|indo[ -]?western|fusion\s*wear|suits?)\b/i;
const MENSWEAR_OUTFIT = /\b(kurta|sherwani|jodhpuri|nehru\s*jacket|modi\s*jacket|dhoti|pathani|achkan|bandi|bandhgala|angarakha|men(?:'s)?\s*suit)\b/i;
const WOMENSWEAR_IDENTITY_SIGNAL = /\b(?:(?:women(?:['’]?s)?|woman(?:['’]?s)?|ladies?|girls?)(?:\s*wear)?|female)\b/i;
const OCCASION_OUTFIT_EXTRA = /\b(chaniya\s*choli|(?:lehenga|lehnga|lehena)\s*choli|choli\s*set)\b/i;
const ACCESSORY_SIGNAL = /\b(accessor(?:y|ies)|jewel(?:ry|lery)|kundan|polki|uncut\s+polki|bridal\s+sets?|necklaces?|chokers?|earrings?|bangles?|bracelets?|anklets?|rings?|brooch(?:es)?|cufflinks?|belts?|bags?|handbags?|clutch(?:es)?|purses?|wallets?|potlis?|petticoats?|footwear|shoes?|sandals?|juttis?|mojaris?|maang\s*tikka|turban|safa|stole|dupatta|dandiya\s*sticks?)\b/i;
const STANDALONE_BLOUSE = /\b(blouse|choli)\b/i;
const COMPONENT_TERM_SOURCE = '(?:blouse|choli|petticoat|waistcoat|dupatta|stole|accessor(?:y|ies)|jewel(?:ry|lery)|kundan|polki|necklaces?|chokers?|earrings?|bangles?|bracelets?|anklets?|rings?|brooch(?:es)?|cufflinks?|belts?|bags?|handbags?|clutch(?:es)?|purses?|wallets?|potlis?|footwear|shoes?|sandals?|juttis?|mojaris?|maang\\s*tikka|turban|safa|dandiya\\s*sticks?)';
const COMPONENT_ONLY_TITLE_SOURCE = `\\b${COMPONENT_TERM_SOURCE}\\b(?:\\s+(?:piece|set))?\\s+only(?:\\s+for\\b)?`;
const COMPONENT_FOR_TITLE_SOURCE = `\\b${COMPONENT_TERM_SOURCE}\\b(?:\\s+(?:piece|set))?\\s+(?:only\\s+)?for\\b`;
const GROOM_ROLE_SIGNAL = /\b(?:groom|groomsman|groomsmen)\b/i;

function compact(values: Array<string | null | undefined>): string[] {
  return values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
}

function parseMetafieldEvidence(value?: string | null): string[] {
  if (!value || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
    if (typeof parsed === 'string' && parsed.trim()) return [parsed];
  } catch {
    // Shopify can expose a plain single-line value instead of JSON.
  }
  return [value];
}

function normalizeCatalogTagEvidence(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9'’]+/g, ' ').trim();
}

function intentEvidenceValues(product: IntentCatalogProduct): string[] {
  return compact([
    product.title,
    product.productType,
    ...(product.tags || []).filter(isIntentEvidenceSafeTag).map(normalizeCatalogTagEvidence),
    ...parseMetafieldEvidence(product.occasionMetafield?.value),
    ...(product.metadata?.occasion || []),
  ]);
}

function genderEvidenceValues(product: IntentCatalogProduct): string[] {
  return compact([
    product.title,
    product.productType,
    ...(product.tags || []).filter(isIntentEvidenceSafeTag).map(normalizeCatalogTagEvidence),
    product.genderMetafield?.value,
    product.metadata?.gender,
  ]);
}

function matchesIntentEvidence(product: IntentCatalogProduct, pattern: RegExp): boolean {
  return intentEvidenceValues(product).some((value) => pattern.test(value));
}

function matchesGenderEvidence(product: IntentCatalogProduct, pattern: RegExp): boolean {
  return genderEvidenceValues(product).some((value) => pattern.test(value));
}

function isExplicitMaleIdentity(value: string): boolean {
  const normalized = value.toLowerCase().replace(/[^a-z]+/g, ' ').trim();
  return /^(?:male|men|man|mens|men s|boys?)$/.test(normalized);
}

function typeAndTitle(product: IntentCatalogProduct): string {
  return `${product.productType || ''} ${product.title || ''}`;
}

function hasMenswearEvidence(product: IntentCatalogProduct): boolean {
  if (matchesGenderEvidence(product, MENSWEAR_SIGNAL)) return true;
  if (compact([
    product.genderMetafield?.value,
    product.metadata?.gender,
  ]).some(isExplicitMaleIdentity)) return true;
  return (product.tags || []).some((tag) => (
    isIntentEvidenceSafeTag(tag) && MENSWEAR_TAGS.has(normalizeCatalogTagEvidence(tag))
  ));
}

function hasIndependentMenswearEvidence(product: IntentCatalogProduct): boolean {
  const titleWithoutRole = (product.title || '').replace(/\b(?:groom|groomsman|groomsmen)\b/gi, ' ');
  const productTypeWithoutRole = (product.productType || '').replace(/\b(?:groom|groomsman|groomsmen)\b/gi, ' ');
  const values = compact([
    titleWithoutRole,
    productTypeWithoutRole,
    ...(product.tags || [])
      .filter(isIntentEvidenceSafeTag)
      .map(normalizeCatalogTagEvidence)
      .map((tag) => tag.replace(/\b(?:groom|groomsman|groomsmen)\b/gi, ' ')),
    product.genderMetafield?.value,
    product.metadata?.gender,
  ]);
  if (values.some((value) => MENSWEAR_SIGNAL.test(value))) return true;
  if (compact([
    product.genderMetafield?.value,
    product.metadata?.gender,
  ]).some(isExplicitMaleIdentity)) return true;
  return (product.tags || []).some((tag) => (
    isIntentEvidenceSafeTag(tag)
    && !GROOM_ROLE_SIGNAL.test(tag)
    && MENSWEAR_TAGS.has(normalizeCatalogTagEvidence(tag))
  ));
}

function hasExplicitWomenswearIdentity(product: IntentCatalogProduct): boolean {
  return matchesGenderEvidence(product, WOMENSWEAR_IDENTITY_SIGNAL);
}

function hasStandaloneComponentReference(value: string): boolean {
  const prefixHasFullOutfit = (prefix: string) => (
    WOMENSWEAR_OUTFIT.test(prefix)
    || MENSWEAR_OUTFIT.test(prefix)
    || OCCASION_OUTFIT_EXTRA.test(prefix)
  );
  for (const match of value.matchAll(new RegExp(COMPONENT_ONLY_TITLE_SOURCE, 'gi'))) {
    const prefix = value.slice(0, match.index);
    const suffix = value.slice((match.index || 0) + match[0].length);
    const isFullCholiName = /\bcholi\b/i.test(match[0])
      && /(?:chaniya|lehenga|lehnga|lehena)\s*$/i.test(prefix);
    const isFullOutfitAudiencePhrase = prefixHasFullOutfit(prefix)
      && /\bfor\b/i.test(match[0])
      && /^\s*(?:men|women|male|female|ladies|girls|boys)\b/i.test(suffix);
    if (isFullCholiName || isFullOutfitAudiencePhrase) continue;
    return true;
  }
  for (const match of value.matchAll(new RegExp(COMPONENT_FOR_TITLE_SOURCE, 'gi'))) {
    const prefix = value.slice(0, match.index);
    const suffix = value.slice((match.index || 0) + match[0].length);
    if (/\bwith\s*$/i.test(prefix)) continue;
    if (
      /\bcholi\b/i.test(match[0])
      && (/(?:chaniya|lehenga|lehnga|lehena)\s*$/i.test(prefix) || /\bcholi\s+set\b/i.test(match[0]))
    ) continue;
    if (
      prefixHasFullOutfit(prefix)
      && /\bset\b/i.test(match[0])
      && /^\s*(?:men|women|male|female|ladies|girls|boys)\b/i.test(suffix)
    ) continue;
    return true;
  }
  return false;
}

function hasSupportedOutfitGarment(product: IntentCatalogProduct): boolean {
  const productType = product.productType || '';
  const title = product.title || '';
  const typeHasGarment = WOMENSWEAR_OUTFIT.test(productType)
    || MENSWEAR_OUTFIT.test(productType)
    || OCCASION_OUTFIT_EXTRA.test(productType);
  const titleHasGarment = WOMENSWEAR_OUTFIT.test(title)
    || MENSWEAR_OUTFIT.test(title)
    || OCCASION_OUTFIT_EXTRA.test(title);
  if (isStandaloneBlouse(product)) return false;
  if (hasStandaloneComponentReference(productType) || hasStandaloneComponentReference(title)) return false;
  if (ACCESSORY_SIGNAL.test(productType) && !typeHasGarment) return false;
  if (ACCESSORY_SIGNAL.test(title) && (!titleHasGarment || !typeHasGarment)) return false;
  return typeHasGarment || titleHasGarment;
}

function hasAvailableGarmentVariant(product: IntentCatalogProduct): boolean {
  if (product.availableForSale !== true) return false;
  const variants = product.variants?.edges || [];
  return variants.some(({ node }) => node?.availableForSale === true);
}

function stripBridesmaidRole(value: string): string {
  return value.replace(
    /\b(?:bride(?:s['’]?|['’]s)?[\s_-]*maids?|maid[\s_-]+of[\s_-]+hono(?:u)?r)\b/gi,
    ' ',
  );
}

function hasExplicitBridalRole(product: IntentCatalogProduct): boolean {
  const titleAndTypeWithoutBridesmaid = stripBridesmaidRole(typeAndTitle(product));
  if (EXPLICIT_BRIDAL_ROLE.test(titleAndTypeWithoutBridesmaid)) return true;
  const hasBridesmaidEvidence = matchesIntentEvidence(product, BRIDESMAID_ROLE);
  if (compact([
    ...parseMetafieldEvidence(product.occasionMetafield?.value),
    ...(product.metadata?.occasion || []),
  ]).some((value) => EXPLICIT_BRIDAL_ROLE.test(stripBridesmaidRole(value)))) return true;
  return (product.tags || []).some((tag) => (
    /^(?:(?:role|recipient)\s*:\s*)?(?:brides?|dulhan|trousseau)$/i.test(tag.trim())
    || /^(?:role|recipient|occasion)\s*[:_-]\s*bridal$/i.test(tag.trim())
    || /^(?:bridal|bride|dulhan|trousseau)[\s_-]+lehenga$/i.test(tag.trim())
    || (/^bridal$/i.test(tag.trim()) && !hasBridesmaidEvidence)
  ));
}

function isStandaloneBlouse(product: IntentCatalogProduct): boolean {
  const productType = product.productType || '';
  const title = product.title || '';
  if (STANDALONE_BLOUSE.test(productType) && !OCCASION_OUTFIT_EXTRA.test(productType)) {
    const typeContainsFullOutfit = WOMENSWEAR_OUTFIT.test(productType) || MENSWEAR_OUTFIT.test(productType);
    if (!(typeContainsFullOutfit && /\bwith\b.{0,24}\b(?:blouse|choli)\b/i.test(productType))) return true;
  }
  if (!STANDALONE_BLOUSE.test(title)) return false;
  if (OCCASION_OUTFIT_EXTRA.test(title)) return false;
  if (/\b(?:lehenga|lehnga|lehena|saree|sari)\b.{0,32}\bwith\b.{0,16}\b(?:blouse|choli)\b/i.test(title)) return false;
  return !(
    WOMENSWEAR_OUTFIT.test(productType)
    || MENSWEAR_OUTFIT.test(productType)
    || OCCASION_OUTFIT_EXTRA.test(productType)
  );
}

export function isDurableIntentCollectionSlug(value: string): value is DurableIntentCollectionSlug {
  return DURABLE_INTENT_SLUGS.has(value as DurableIntentCollectionSlug);
}

export function isIntentEvidenceSafeTag(value: string): boolean {
  if (READY_TO_SHIP_TAG_PATTERN.test(value.trim())) return true;
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return !OBSOLETE_POLICY_TAG_PATTERN.test(normalized);
}

export function isEligibleForDurableIntent(
  product: IntentCatalogProduct,
  intent: DurableIntentCollectionSlug,
): boolean {
  if (!hasAvailableGarmentVariant(product)) return false;

  const garmentEvidence = typeAndTitle(product);
  if (intent === 'wedding-guest-lehengas') {
    return LEHENGA_GARMENT.test(garmentEvidence)
      && hasSupportedOutfitGarment(product)
      && !hasMenswearEvidence(product)
      && matchesIntentEvidence(product, WEDDING_GUEST_ROLE)
      && !hasExplicitBridalRole(product);
  }

  if (intent === 'wedding-guest-kurta-sets') {
    return KURTA_SET_GARMENT.test(garmentEvidence)
      && hasSupportedOutfitGarment(product)
      && hasMenswearEvidence(product)
      && !hasExplicitWomenswearIdentity(product)
      && matchesIntentEvidence(product, WEDDING_GUEST_ROLE);
  }

  if (intent === 'navratri-chaniya') {
    return matchesIntentEvidence(product, NAVRATRI_CHANIYA_SIGNAL)
      && (LEHENGA_GARMENT.test(garmentEvidence) || /\b(chaniya|choli)\b/i.test(garmentEvidence))
      && hasSupportedOutfitGarment(product)
      && !hasMenswearEvidence(product);
  }

  if (intent === 'garba') {
    return matchesIntentEvidence(product, GARBA_SIGNAL) && hasSupportedOutfitGarment(product);
  }

  if (intent === 'groomsmen') {
    return matchesIntentEvidence(product, GROOMSMEN_SIGNAL)
      && hasSupportedOutfitGarment(product)
      && MENSWEAR_OUTFIT.test(garmentEvidence)
      && hasIndependentMenswearEvidence(product)
      && !hasExplicitWomenswearIdentity(product);
  }

  if (intent === 'sangeet') {
    return matchesIntentEvidence(product, SANGEET_SIGNAL) && hasSupportedOutfitGarment(product);
  }

  if (intent === 'reception') {
    return matchesIntentEvidence(product, RECEPTION_SIGNAL) && hasSupportedOutfitGarment(product);
  }

  if (!matchesIntentEvidence(product, DIWALI_SIGNAL)) return false;
  if (intent === 'diwali-womenswear') {
    return !hasMenswearEvidence(product)
      && (WOMENSWEAR_OUTFIT.test(garmentEvidence) || OCCASION_OUTFIT_EXTRA.test(garmentEvidence))
      && hasSupportedOutfitGarment(product)
      && !isStandaloneBlouse(product);
  }

  return hasMenswearEvidence(product)
    && MENSWEAR_OUTFIT.test(garmentEvidence)
    && hasSupportedOutfitGarment(product)
    && !hasExplicitWomenswearIdentity(product);
}
