/**
 * Canonical Google Merchant taxonomy mapping shared by product JSON-LD and
 * every Shopify-backed feed path. Keep this module platform-neutral: it is
 * bundled by Vite, Vercel, the static CommonJS generator, and Supabase Deno.
 */
export const MERCHANT_GOOGLE_PRODUCT_CATEGORY = Object.freeze({
  CLOTHING: '1604',
  SHIRTS_AND_TOPS: '212',
  SKIRTS: '1581',
  PANTS: '204',
  JUMPSUITS_AND_ROMPERS: '5250',
  OUTFIT_SETS: '7313',
  TRADITIONAL_AND_CEREMONIAL_CLOTHING: '5388',
  SARIS_AND_LEHENGAS: '8248',
  JEWELRY: '188',
  BRACELETS: '191',
  EARRINGS: '194',
  NECKLACES: '196',
  RINGS: '200',
  JEWELRY_SETS: '6463',
});

export function isExplicitStandaloneOutfitSetTitle(title?: string): boolean {
  const titleText = (title || '').toLowerCase();
  return /\b(?:two|three|four)[ -]?piece\b[^.]{0,50}\bset\b/.test(titleText)
    && !/\b(?:sarees?|saris?|lehengas?|lehngas?|chaniyas?|cholis?)\b/.test(titleText);
}

/**
 * Prefer current, well-scoped taxonomy nodes. In particular, do not emit the
 * retired/misapplied IDs 193, 2104, 2195, 2197, or 2271.
 */
export function getMerchantGoogleProductCategory(productType?: string, title?: string): string {
  const typeText = (productType || '').toLowerCase();
  const titleText = (title || '').toLowerCase();
  const text = `${typeText} ${titleText}`;

  if (/\b(?:jewelry|jewellery|necklaces?|chokers?|earrings?|bangles?|bracelets?|maang tikka|rings?)\b/.test(text)) {
    if (/\b(?:sets?|combos?)\b/.test(text)) return MERCHANT_GOOGLE_PRODUCT_CATEGORY.JEWELRY_SETS;
    if (/\b(?:necklaces?|chokers?)\b/.test(text)) return MERCHANT_GOOGLE_PRODUCT_CATEGORY.NECKLACES;
    if (/\bearrings?\b/.test(text)) return MERCHANT_GOOGLE_PRODUCT_CATEGORY.EARRINGS;
    if (/\b(?:bangles?|bracelets?)\b/.test(text)) return MERCHANT_GOOGLE_PRODUCT_CATEGORY.BRACELETS;
    if (/\brings?\b/.test(text)) return MERCHANT_GOOGLE_PRODUCT_CATEGORY.RINGS;
    return MERCHANT_GOOGLE_PRODUCT_CATEGORY.JEWELRY;
  }

  if (/\bblouses?\b/.test(typeText)) {
    return MERCHANT_GOOGLE_PRODUCT_CATEGORY.SHIRTS_AND_TOPS;
  }
  if (isExplicitStandaloneOutfitSetTitle(title)) {
    return MERCHANT_GOOGLE_PRODUCT_CATEGORY.OUTFIT_SETS;
  }
  if (/\b(?:sarees?|saris?|lehengas?|lehngas?|chaniyas?|cholis?)\b/.test(text)) {
    return MERCHANT_GOOGLE_PRODUCT_CATEGORY.SARIS_AND_LEHENGAS;
  }
  if (/\b(?:jumpsuits?|rompers?)\b/.test(text)) {
    return MERCHANT_GOOGLE_PRODUCT_CATEGORY.JUMPSUITS_AND_ROMPERS;
  }
  if (/\b(?:sets?|suits?)\b/.test(typeText)
    || /\b(?:salwars?|kameez|shararas?|ghararas?|gararas?|palazzos?|plazzos?|churidars?|patialas?|co-?ords?|outfit sets?)\b/.test(text)
    || /\b(?:anarkalis?|capes?|kurtas?)\b[^.]{0,30}\b(?:sets?|suits?|with dupatta)\b/.test(text)
    || /\b(?:sets?|suits?)\b[^.]{0,30}\b(?:anarkalis?|capes?|kurtas?)\b/.test(text)) {
    return MERCHANT_GOOGLE_PRODUCT_CATEGORY.OUTFIT_SETS;
  }
  if (/\b(?:sherwanis?|nehru jackets?|jodhpuris?|groom wear|traditional|ceremonial|indo.?western|fusion|kurtas?|anarkalis?|gowns?|dresses?)\b/.test(text)) {
    return MERCHANT_GOOGLE_PRODUCT_CATEGORY.TRADITIONAL_AND_CEREMONIAL_CLOTHING;
  }
  if (/\b(?:kurtis?|blouses?|tops?)\b/.test(text)) return MERCHANT_GOOGLE_PRODUCT_CATEGORY.SHIRTS_AND_TOPS;
  if (/\bskirts?\b/.test(text)) return MERCHANT_GOOGLE_PRODUCT_CATEGORY.SKIRTS;
  if (/\b(?:pants|trousers)\b/.test(text)) return MERCHANT_GOOGLE_PRODUCT_CATEGORY.PANTS;

  return MERCHANT_GOOGLE_PRODUCT_CATEGORY.CLOTHING;
}

const APPAREL_CATEGORY_IDS: ReadonlySet<string> = new Set([
  MERCHANT_GOOGLE_PRODUCT_CATEGORY.CLOTHING,
  MERCHANT_GOOGLE_PRODUCT_CATEGORY.SHIRTS_AND_TOPS,
  MERCHANT_GOOGLE_PRODUCT_CATEGORY.SKIRTS,
  MERCHANT_GOOGLE_PRODUCT_CATEGORY.PANTS,
  MERCHANT_GOOGLE_PRODUCT_CATEGORY.JUMPSUITS_AND_ROMPERS,
  MERCHANT_GOOGLE_PRODUCT_CATEGORY.OUTFIT_SETS,
  MERCHANT_GOOGLE_PRODUCT_CATEGORY.TRADITIONAL_AND_CEREMONIAL_CLOTHING,
  MERCHANT_GOOGLE_PRODUCT_CATEGORY.SARIS_AND_LEHENGAS,
]);

export function isMerchantApparelCategory(category: string | number): boolean {
  return APPAREL_CATEGORY_IDS.has(String(category));
}
