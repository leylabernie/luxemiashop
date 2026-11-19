import { getPrimaryCategory } from './catalogCategories.mjs';

const SERVICE_ADD_ON_HANDLE = 'luxemia-tailoring-saree-finishing-add-ons';

export const LATEST_HOMEPAGE_IMAGERY_QUERY = `
  query GetLatestHomepageImagery {
    newest: products(first: 140, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true") {
      edges { node { ...HomepageImageFields } }
    }
    sarees: products(first: 40, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true AND (product_type:Saree OR product_type:'Banarasi Saree' OR product_type:'Silk Saree' OR product_type:'Ready-to-Wear Saree' OR product_type:'Wedding Saree' OR product_type:'Georgette Saree' OR product_type:'Designer Saree' OR title:saree)") {
      edges { node { ...HomepageImageFields } }
    }
    lehengas: products(first: 40, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true AND (product_type:Lehenga OR product_type:'Lehenga Choli' OR product_type:'Bridal Lehenga' OR product_type:'Wedding Lehenga' OR product_type:'Party Wear Lehenga' OR product_type:'Navratri Lehenga' OR title:lehenga)") {
      edges { node { ...HomepageImageFields } }
    }
    suits: products(first: 40, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true AND (product_type:'Salwar Suit' OR product_type:'Palazzo Suit' OR product_type:'Plazzo Suit' OR product_type:'Sharara Suit' OR product_type:'Anarkali Suit' OR product_type:Anarkali OR product_type:Sharara OR product_type:'Salwar Kameez' OR product_type:'Pakistani Suit' OR product_type:'Readymade Suit' OR product_type:'Suit Set' OR product_type:'Palazzo Set')") {
      edges { node { ...HomepageImageFields } }
    }
    indowestern: products(first: 30, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true AND (product_type:'Indo Western' OR product_type:'Indo-Western' OR product_type:'Indo Western Dress' OR product_type:'Indo-Western Set' OR product_type:'Fusion Wear' OR product_type:'Jacket Set' OR product_type:'Skirt Set' OR product_type:'Coord Set' OR product_type:'Co-ord Set' OR product_type:'Cape Set' OR product_type:Jumpsuit OR title:'indo western' OR title:'indo-western' OR title:'jacket set')") {
      edges { node { ...HomepageImageFields } }
    }
    menswear: products(first: 25, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true AND (product_type:'Kurta Pajama' OR product_type:'Kurta Pajama Set' OR product_type:'Mens Kurta Pajama Set' OR product_type:Menswear OR product_type:Sherwani OR product_type:'Modi Jacket Kurta Pajama' OR product_type:'Nehru Jacket Set' OR product_type:'Kurta Set')") {
      edges { node { ...HomepageImageFields } }
    }
    kids: products(first: 20, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true AND (product_type:'Kids Kurta Set' OR product_type:'Kids Boy Set' OR product_type:'Kids Ethnic Wear' OR product_type:'Kids Lehenga' OR product_type:'Kids Salwar Set' OR product_type:'Girls Ethnic Set' OR product_type:'Boys Ethnic Set' OR title:kids)") {
      edges { node { ...HomepageImageFields } }
    }
    jewelry: products(first: 20, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true AND (product_type:Jewelry OR product_type:'Kundan Necklace Set' OR product_type:'Bridal Jewelry' OR product_type:'Necklace Set' OR product_type:'Jewelry Set')") {
      edges { node { ...HomepageImageFields } }
    }
  }

  fragment HomepageImageFields on Product {
    id
    handle
    title
    productType
    tags
    availableForSale
    createdAt
    priceRange {
      minVariantPrice {
        amount
      }
    }
    images(first: 1) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

const TOKEN_SYNONYMS = {
  crape: 'crepe',
  plazoo: 'palazzo',
  plazzo: 'palazzo',
  palazo: 'palazzo',
  lehnga: 'lehenga',
  lehena: 'lehenga',
  lehengas: 'lehenga',
  sari: 'saree',
  saris: 'saree',
  sarees: 'saree',
  suits: 'suit',
  kurtas: 'kurta',
  kurtis: 'kurti',
  shararas: 'sharara',
  anarkalis: 'anarkali',
  gowns: 'gown',
  embroidery: 'embroidered',
  handworked: 'handwork',
  coords: 'coord',
  fuschia: 'fuchsia',
  multicolour: 'multicolor',
  multicolored: 'multicolor',
  jewellery: 'jewelry',
  motifs: 'motif',
  borders: 'border',
  sprigs: 'sprig',
};

const COLOR_AND_SHADE_TOKENS = new Set([
  // Shade & tone modifiers
  'light', 'dark', 'deep', 'pale', 'soft', 'bright', 'pastel', 'dusty', 'muted',
  'rich', 'royal', 'baby', 'hot', 'neon', 'vivid', 'warm', 'cool', 'dual',
  'tone', 'toned', 'two', 'shaded', 'shade', 'ombre', 'multi', 'multicolor',
  'color', 'colour', 'colored', 'coloured', 'contrast', 'clear', 'antique',
  'metallic', 'matte', 'sheer', 'icy', 'ice', 'powder', 'smoky', 'smoke',
  'burnt', 'electric',
  // Pinks, reds, oranges
  'pink', 'rose', 'blush', 'rani', 'onion', 'fuchsia', 'magenta', 'berry',
  'raspberry', 'strawberry', 'flamingo', 'carnation', 'bubblegum', 'lotus',
  'coral', 'peach', 'salmon', 'apricot', 'melon', 'nude', 'red', 'maroon',
  'wine', 'burgundy', 'oxblood', 'crimson', 'scarlet', 'ruby', 'cherry',
  'vermilion', 'sindoor', 'garnet', 'brick', 'rust', 'terracotta', 'orange',
  'tangerine', 'marigold', 'saffron', 'mango', 'papaya', 'carrot', 'amber',
  'copper', 'bronze', 'cinnamon',
  // Yellows & golds
  'yellow', 'mustard', 'haldi', 'turmeric', 'lemon', 'canary', 'butter',
  'sunshine', 'ochre', 'honey', 'gold', 'golden', 'champagne',
  // Greens
  'green', 'olive', 'pista', 'pistachio', 'mint', 'sage', 'emerald', 'bottle',
  'forest', 'jade', 'lime', 'chartreuse', 'moss', 'pine', 'fern', 'leaf',
  'parrot', 'mehndi', 'mehendi', 'sea', 'seafoam', 'teal', 'rama', 'peacock',
  // Blues
  'blue', 'navy', 'midnight', 'cobalt', 'sapphire', 'cerulean', 'sky', 'aqua',
  'turquoise', 'cyan', 'firozi', 'ferozi', 'indigo', 'denim', 'slate', 'steel',
  'periwinkle', 'azure',
  // Purples
  'purple', 'lavender', 'lilac', 'mauve', 'plum', 'violet', 'amethyst',
  'orchid', 'grape', 'eggplant', 'aubergine', 'jamun', 'mulberry', 'raisin',
  // Neutrals, whites, browns, blacks
  'white', 'off', 'ivory', 'cream', 'ecru', 'pearl', 'alabaster', 'milk',
  'vanilla', 'beige', 'sand', 'oat', 'wheat', 'khaki', 'tan', 'camel',
  'caramel', 'taupe', 'mocha', 'coffee', 'chocolate', 'cocoa', 'espresso',
  'brown', 'chestnut', 'walnut', 'grey', 'gray', 'charcoal', 'ash', 'graphite',
  'pewter', 'silver', 'gunmetal', 'black', 'jet', 'ebony', 'onyx',
]);

const STOP_AND_FILLER_TOKENS = new Set([
  'a', 'an', 'and', 'at', 'by', 'for', 'from', 'in', 'into', 'of', 'on', 'or',
  'the', 'to', 'with', 'without',
  'wear', 'work', 'indian', 'ethnic', 'traditional', 'festive', 'wedding',
  'party', 'bridal', 'guest', 'occasion', 'designer', 'luxury', 'luxemia',
  'women', 'womens', 'woman', 'ladies', 'men', 'mens', 'man',
  'outfit', 'outfits', 'attire', 'ensemble', 'style', 'look', 'new', 'latest',
  'ship', 'shipping', 'copy',
]);

const FILE_NOISE_TOKENS = new Set([
  'img', 'image', 'photo', 'pic', 'model', 'full', 'front', 'back', 'side',
  'hero', 'main', 'original', 'view', 'shot', 'edit', 'final', 'web', 'hd',
  'jpg', 'jpeg', 'png', 'webp',
]);

export function toSizedShopifyImageUrl(rawUrl, width = 1080, format = null) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  if (!rawUrl.includes('cdn.shopify.com/')) return rawUrl;
  try {
    const parsed = new URL(rawUrl);
    if (width && Number.isFinite(width)) {
      parsed.searchParams.set('width', String(Math.round(width)));
    }
    if (format) {
      parsed.searchParams.set('format', format);
    } else {
      parsed.searchParams.delete('format');
    }
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

function getImageIdentity(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  return rawUrl.split('?')[0].toLowerCase();
}

function getCdnVersion(rawUrl) {
  const match = String(rawUrl || '').match(/[?&]v=(\d+)/);
  return match ? Number(match[1]) || 0 : 0;
}

function sanitizeAlt(altText, title) {
  const candidate = String(altText || title || 'LuxeMia ethnic wear')
    .replace(/\s+/g, ' ')
    .replace(/\s*\|\s*Ready to Ship/gi, '')
    .trim();
  return candidate || String(title || 'LuxeMia ethnic wear').trim();
}

function normalizeCompoundPhrases(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/\boff[-_\s]+white\b/g, ' offwhite ')
    .replace(/\bready[-_\s]+to[-_\s]+ship\b/g, ' ')
    .replace(/\bready[-_\s]+to[-_\s]+wear\b/g, ' readytowear ')
    .replace(/\bready[-_\s]+made\b/g, ' readymade ')
    .replace(/\bhand[-_\s]+work\b/g, ' handwork ')
    .replace(/\bcut[-_\s]+work\b/g, ' cutwork ')
    .replace(/\bmirror[-_\s]+work\b/g, ' mirrorwork ')
    .replace(/\bthread[-_\s]+work\b/g, ' threadwork ')
    .replace(/\bzari[-_\s]+work\b/g, ' zariwork ')
    .replace(/\bsequin[s]?[-_\s]+work\b/g, ' sequin ')
    .replace(/\b(?:three|3)[-_\s]+piece\b/g, ' 3piece ')
    .replace(/\b(?:two|2)[-_\s]+piece\b/g, ' 2piece ')
    .replace(/\bco[-_\s]+ord[s]?\b/g, ' coord ')
    .replace(/\bindo[-_\s]+western\b/g, ' indowestern ')
    .replace(/\bart[-_\s]+silk\b/g, ' artsilk ');
}

function extractDesignTokens(raw, { extraStop = null } = {}) {
  const cleaned = normalizeCompoundPhrases(raw).replace(/[^a-z0-9]+/g, ' ');
  const out = [];
  const seen = new Set();
  for (const part of cleaned.split(' ')) {
    if (!part) continue;
    const token = TOKEN_SYNONYMS[part] || part;
    if (token === 'offwhite') continue;
    if (token.length <= 1) continue;
    if (/^\d+$/.test(token)) continue;
    if (/^[0-9a-f]{8,}$/.test(token)) continue;
    if (COLOR_AND_SHADE_TOKENS.has(token)) continue;
    if (STOP_AND_FILLER_TOKENS.has(token)) continue;
    if (extraStop && extraStop.has(token)) continue;
    if (!seen.has(token)) {
      seen.add(token);
      out.push(token);
    }
  }
  return out;
}

function stripModifierClause(raw) {
  return String(raw || '')
    .split(/\s*(?:[–—|]|\bwith\b|\bin\b|\bfeaturing\b)\s*/i)[0]
    .trim();
}

function extractVendorStyleCode(rawUrl) {
  const filePart = (getImageIdentity(rawUrl).split('/').pop() || '').replace(/\.[a-z0-9]+$/, '');
  if (!filePart) return '';

  // Matches e.g. `luxemia-6032-blue-1` -> `luxemia-6032` (ignores unique 6+ digit item IDs unless followed by a color word)
  const luxemiaColored = filePart.match(/^luxemia-(\d{3,6})-([a-z]+)/);
  if (luxemiaColored && COLOR_AND_SHADE_TOKENS.has(luxemiaColored[2])) {
    return `luxemia-${luxemiaColored[1]}`;
  }

  // Matches vendor catalog codes like `lg-2158-a_1`, `lc-1355_1`, `dn-4021-b-1`
  const alphaCode = filePart.match(/(?:^|[-_])([a-z]{2,4}-\d{3,5})(?:-[a-z])?(?:[-_]\d+)?$/);
  if (alphaCode && !alphaCode[1].startsWith('img-')) {
    return alphaCode[1];
  }

  // Matches numeric catalog series like `4797-321-b_1`
  const numericSeries = filePart.match(/(?:^|[-_])(\d{3,5}-\d{2,5})(?:-[a-z])?(?:[-_]\d+)?$/);
  if (numericSeries) {
    return numericSeries[1];
  }

  return '';
}

function extractFileDesignKey(rawUrl) {
  const filePart = (getImageIdentity(rawUrl).split('/').pop() || '')
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/[_-][0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i, '');
  if (!filePart) return '';
  // Pure catalog-number filenames like `luxemia-405979-1` don't carry design words
  const tokens = extractDesignTokens(filePart, { extraStop: FILE_NOISE_TOKENS }).filter(
    (t) => !/^[a-z]{1,3}\d+$/.test(t),
  );
  return tokens.length >= 2 ? tokens.join(' ') : '';
}

function tokenDice(left, right) {
  if (!left.length || !right.length) return 0;
  const rightSet = new Set(right);
  let shared = 0;
  for (const token of left) {
    if (rightSet.has(token)) shared += 1;
  }
  return (2 * shared) / (left.length + right.length);
}

/**
 * Computes a normalized, color-agnostic design signature for a catalog product
 * so colorway variants and sibling batch listings of the same outfit are
 * recognized as the same item.
 */
export function buildDesignSignature(input) {
  const node = input?.node || input || {};
  const handle = String(node.handle || '').trim().toLowerCase();
  const rawTitle = String(node.title || '')
    .replace(/\s*\|\s*Ready to Ship/gi, '')
    .split(/\s*[–—]\s*/)[0]
    .trim();
  const rawUrl =
    node.rawUrl ||
    node.url ||
    node.webpUrl ||
    node.images?.edges?.[0]?.node?.url ||
    '';
  const imageKey = getImageIdentity(rawUrl);
  const category = node.category || inferCategory(node);
  const price =
    typeof node.price === 'number'
      ? node.price
      : Number.parseFloat(node.priceRange?.minVariantPrice?.amount || '0') || 0;
  const createdMs =
    typeof node.createdMs === 'number'
      ? node.createdMs
      : Date.parse(node.createdAt || '') || 0;

  const handleWords = handle.replace(/-/g, ' ');
  const handleTokens = extractDesignTokens(handleWords);
  const coreHandleTokens = extractDesignTokens(stripModifierClause(handleWords));
  const titleTokens = extractDesignTokens(rawTitle);
  const coreTitleTokens = extractDesignTokens(stripModifierClause(rawTitle));

  const sortedKey = (tokens) => (tokens.length >= 2 ? [...tokens].sort().join(' ') : '');

  return {
    handle,
    imageKey,
    category,
    price,
    createdMs,
    vendorCode: extractVendorStyleCode(rawUrl),
    fileKey: extractFileDesignKey(rawUrl),
    handleTokens,
    titleTokens,
    handleKey: sortedKey(handleTokens),
    coreHandleKey: sortedKey(coreHandleTokens),
    titleKey: sortedKey(titleTokens),
    coreTitleKey: sortedKey(coreTitleTokens),
  };
}

/**
 * Returns true when two products represent the same item, colorway variants of
 * the same style (e.g. `embroidered-net-palazzo-suit-teal` vs `...-lavender`),
 * or near-identical siblings from the same design series.
 */
export function isSameDesignFamily(leftInput, rightInput) {
  if (!leftInput || !rightInput) return false;
  const left = leftInput._sig || buildDesignSignature(leftInput);
  const right = rightInput._sig || buildDesignSignature(rightInput);

  if (left.handle && right.handle && left.handle === right.handle) return true;
  if (left.imageKey && right.imageKey && left.imageKey === right.imageKey) return true;
  if (left.vendorCode && right.vendorCode && left.vendorCode === right.vendorCode) return true;

  if (left.handleKey && right.handleKey && left.handleKey === right.handleKey) return true;
  if (left.coreHandleKey && right.coreHandleKey && left.coreHandleKey === right.coreHandleKey) {
    return true;
  }
  if (left.titleKey && right.titleKey && left.titleKey === right.titleKey) return true;
  if (left.coreTitleKey && right.coreTitleKey && left.coreTitleKey === right.coreTitleKey) {
    return true;
  }
  if (left.fileKey && right.fileKey && left.fileKey === right.fileKey) return true;

  const sameOrUnknownCategory =
    !left.category || !right.category || left.category === right.category;
  if (!sameOrUnknownCategory) return false;

  const handleSimilarity = tokenDice(left.handleTokens, right.handleTokens);
  if (
    left.handleTokens.length >= 3 &&
    right.handleTokens.length >= 3 &&
    handleSimilarity >= 0.78
  ) {
    return true;
  }

  const titleSimilarity = tokenDice(left.titleTokens, right.titleTokens);
  if (
    left.titleTokens.length >= 3 &&
    right.titleTokens.length >= 3 &&
    titleSimilarity >= 0.8
  ) {
    return true;
  }

  // Same-batch colorway/series upload: same category, near-identical price,
  // uploaded within 12 hours, and sharing most non-color design tokens.
  if (
    left.price > 0 &&
    right.price > 0 &&
    Math.abs(left.price - right.price) <= 1.5 &&
    left.createdMs > 0 &&
    right.createdMs > 0 &&
    Math.abs(left.createdMs - right.createdMs) <= 12 * 3600 * 1000 &&
    Math.max(handleSimilarity, titleSimilarity) >= 0.65
  ) {
    return true;
  }

  return false;
}

/**
 * Filters a sorted product list down to distinct designs (no colorway clones),
 * while also avoiding items already featured in adjacent homepage banners.
 */
export function selectDistinctHomepageProducts(products, options = {}) {
  const limit = Number(options.limit) || 10;
  const hardAvoidSigs = (options.hardAvoid || [])
    .filter(Boolean)
    .map((entry) => buildDesignSignature(entry));
  const softAvoidSigs = (options.softAvoid || [])
    .filter(Boolean)
    .map((entry) => buildDesignSignature(entry));

  const annotated = (products || []).map((product) => ({
    product,
    sig: buildDesignSignature(product),
  }));

  const chosen = [];
  const chosenSigs = [];
  const chosenHandles = new Set();

  const tryAdd = (candidate, avoidSoft) => {
    const { product, sig } = candidate;
    if (!sig.handle || chosenHandles.has(sig.handle)) return;
    if (chosenSigs.some((existing) => isSameDesignFamily({ _sig: existing }, { _sig: sig }))) {
      return;
    }
    if (hardAvoidSigs.some((existing) => isSameDesignFamily({ _sig: existing }, { _sig: sig }))) {
      return;
    }
    if (
      avoidSoft &&
      softAvoidSigs.some((existing) => isSameDesignFamily({ _sig: existing }, { _sig: sig }))
    ) {
      return;
    }
    chosen.push(product);
    chosenSigs.push(sig);
    chosenHandles.add(sig.handle);
  };

  // Pass 1: completely unique across the entire homepage (hero, categories, promos, and grid)
  for (const candidate of annotated) {
    if (chosen.length >= limit) break;
    tryAdd(candidate, true);
  }

  // Pass 2: if the 30-day window has fewer than `limit` remaining families, allow
  // styles from hero/category, while STILL never duplicating inside the grid or
  // repeating the 2-up promo banners directly below New Arrivals.
  if (chosen.length < limit) {
    for (const candidate of annotated) {
      if (chosen.length >= limit) break;
      tryAdd(candidate, false);
    }
  }

  return chosen;
}

function inferCategory(node) {
  const primary = getPrimaryCategory(node);
  if (primary) return primary;
  const text = `${node.title || ''} ${node.handle || ''}`.toLowerCase();
  if (/\b(?:kids?|boys?|girls?)\b/.test(text)) return 'kids';
  if (/\bcouple\b/.test(text)) return 'couple-outfits';
  if (/\b(?:lehenga|lehnga|chaniya)\b/.test(text)) return 'lehengas';
  if (/\b(?:saree|sari)\b/.test(text)) return 'sarees';
  if (
    /\b(?:indo[- ]?western|fusion|jumpsuit|cape set|co[- ]?ord|skirt set|jacket set|gown set)\b/.test(text) &&
    !/\bkurta pajama\b/.test(text)
  ) {
    return 'indowestern';
  }
  if (/\b(?:sherwani|kurta pajama|nehru jacket|modi jacket|menswear)\b/.test(text)) {
    return 'menswear';
  }
  if (/\b(?:salwar|kameez|sharara|anarkali|palazzo|plazzo|gharara|pakistani suit|kurti|suit)\b/.test(text)) {
    return 'suits';
  }
  if (/\b(?:jewel|kundan|polki|necklace|choker|bangle|earring|maang tikka)\b/.test(text)) {
    return 'jewelry';
  }
  return null;
}

function isMadeToOrderNode(node) {
  const tags = Array.isArray(node.tags) ? node.tags.join(' ') : '';
  return /\bmade[- ]to[- ](?:order|measure)\b/i.test(`${node.productType || ''} ${tags}`);
}

function isNonEditorialImage(url, altText, title) {
  return /(?:size[-_ ]?chart|color[-_ ]?chart|swatch|placeholder|logo|measurement)/i.test(
    `${url || ''} ${altText || ''} ${title || ''}`,
  );
}

function isPortraitFriendly(image) {
  const w = Number(image?.width) || 0;
  const h = Number(image?.height) || 0;
  if (!w || !h) return true;
  return h >= w * 0.78;
}

function isRetiredSeasonalNode(node, altText = '') {
  return /\b(?:navratri|garba|kediyu|diwali|dussehra)\b/i.test(
    `${node.handle || ''} ${node.title || ''} ${node.productType || ''} ${altText || ''}`,
  );
}

function isDifferentUploadBatch(left, right, minHours = 18) {
  if (!left || !right) return true;
  if (!left.createdMs || !right.createdMs) return true;
  return Math.abs(left.createdMs - right.createdMs) >= minHours * 3600 * 1000;
}

/**
 * Selects the newest distinct, active, model-ready Shopify product images for
 * all 5 homepage hero slides, all 7 category showcase cards, and both 2-up
 * editorial promo banners — strictly deduplicating both exact products AND
 * colorway/series variants so the same outfit never appears twice.
 */
export function selectLatestHomepageImagery(data, options = {}) {
  const excludedHandles = new Set([
    SERVICE_ADD_ON_HANDLE,
    ...(options.archivedHandles || []),
    ...(options.goneHandles || []),
  ]);

  const buckets = [
    data?.newest,
    data?.sarees,
    data?.lehengas,
    data?.suits,
    data?.indowestern,
    data?.menswear,
    data?.kids,
    data?.jewelry,
  ];

  const byHandle = new Map();
  for (const bucket of buckets) {
    const edges = bucket?.edges;
    if (!Array.isArray(edges)) continue;
    for (const edge of edges) {
      const node = edge?.node || edge;
      if (!node?.handle || excludedHandles.has(node.handle)) continue;
      if (node.availableForSale === false) continue;
      if (String(node.productType || '').trim() === 'Service Add-On') continue;
      if (byHandle.has(node.handle)) continue;

      const image = node.images?.edges?.[0]?.node;
      const rawUrl = image?.url || '';
      if (!rawUrl || !rawUrl.startsWith('https://cdn.shopify.com/')) continue;
      if (isNonEditorialImage(rawUrl, image?.altText, node.title)) continue;

      const createdMs = Date.parse(node.createdAt || '') || 0;
      const cdnVersion = getCdnVersion(rawUrl);
      const category = inferCategory(node);
      const price = Number.parseFloat(node.priceRange?.minVariantPrice?.amount || '0') || 0;
      const title = String(node.title || '').replace(/\s*\|\s*Ready to Ship/gi, '').trim();

      const item = {
        handle: node.handle,
        title,
        category,
        createdAt: node.createdAt || null,
        createdMs,
        cdnVersion,
        price,
        rawUrl,
        imageKey: getImageIdentity(rawUrl),
        alt: sanitizeAlt(image?.altText, node.title),
        width: Number(image?.width) || 800,
        height: Number(image?.height) || 1100,
        portrait: isPortraitFriendly(image),
        madeToOrder: isMadeToOrderNode(node),
        seasonal: isRetiredSeasonalNode(node, image?.altText),
        _sig: null,
      };
      item._sig = buildDesignSignature(item);
      byHandle.set(node.handle, item);
    }
  }

  const candidates = [...byHandle.values()].sort((a, b) => {
    if (b.createdMs !== a.createdMs) return b.createdMs - a.createdMs;
    return b.cdnVersion - a.cdnVersion;
  });

  if (candidates.length === 0) return null;

  const usedHandles = new Set();
  const usedImages = new Set();
  const claimedItems = [];

  function formatEntry(item, targetWidth) {
    if (!item) return null;
    const w = item.width || 800;
    const h = item.height || 1100;
    return {
      handle: item.handle,
      title: item.title,
      price: item.price,
      url: toSizedShopifyImageUrl(item.rawUrl, targetWidth),
      webpUrl: toSizedShopifyImageUrl(item.rawUrl, targetWidth, 'webp'),
      rawUrl: item.rawUrl,
      alt: item.alt,
      width: w,
      height: h,
      createdAt: item.createdAt,
    };
  }

  function pickRaw(predicate, { allowSameFamily = false } = {}) {
    const pool = candidates.filter((item) => {
      if (!predicate(item)) return false;
      if (usedHandles.has(item.handle) || usedImages.has(item.imageKey)) return false;
      if (!allowSameFamily && claimedItems.some((prev) => isSameDesignFamily(prev, item))) {
        return false;
      }
      return true;
    });
    const chosen =
      pool.find((item) => item.portrait && !item.seasonal) ||
      pool.find((item) => !item.seasonal) ||
      pool.find((item) => item.portrait) ||
      pool[0] ||
      null;
    if (!chosen) return null;
    usedHandles.add(chosen.handle);
    usedImages.add(chosen.imageKey);
    claimedItems.push(chosen);
    return chosen;
  }

  const isWomensCelebration = (item) =>
    item.category === 'lehengas' ||
    item.category === 'sarees' ||
    item.category === 'suits' ||
    item.category === 'indowestern';

  const isAdultCelebration = (item) =>
    isWomensCelebration(item) || item.category === 'menswear';

  // 1. Hero carousel slides — 5 distinct newest designs & varied silhouettes
  const weddingEditItem =
    pickRaw((item) => item.category === 'lehengas' && !item.seasonal) ||
    pickRaw((item) => isWomensCelebration(item) && !item.seasonal);

  const newArrivalsItem =
    pickRaw(
      (item) =>
        isAdultCelebration(item) &&
        !item.seasonal &&
        item.category !== weddingEditItem?.category,
    ) || pickRaw((item) => isAdultCelebration(item) && !item.seasonal);

  const sareesEditItem = pickRaw((item) => item.category === 'sarees' && !item.seasonal);

  const lehengasSuitsItem =
    pickRaw((item) => item.category === 'suits' && !item.seasonal) ||
    pickRaw(
      (item) => (item.category === 'lehengas' || item.category === 'suits') && !item.seasonal,
    ) ||
    pickRaw((item) => isWomensCelebration(item) && !item.seasonal);

  const readyToShipHeroItem =
    pickRaw(
      (item) =>
        isWomensCelebration(item) &&
        !item.madeToOrder &&
        !item.seasonal &&
        isDifferentUploadBatch(item, lehengasSuitsItem),
    ) ||
    pickRaw((item) => isWomensCelebration(item) && !item.madeToOrder && !item.seasonal) ||
    pickRaw((item) => isAdultCelebration(item) && !item.madeToOrder && !item.seasonal);

  // 2. Shop by Category — newest distinct design per department (never repeats hero designs)
  const pickCategory = (categoryName) => {
    const chosen =
      pickRaw((item) => item.category === categoryName && !item.seasonal) ||
      pickRaw((item) => item.category === categoryName) ||
      // Last resort only when a small department has just one design series
      pickRaw((item) => item.category === categoryName && !item.seasonal, {
        allowSameFamily: true,
      }) ||
      pickRaw((item) => item.category === categoryName, { allowSameFamily: true });
    return formatEntry(chosen, 900);
  };

  const categories = {
    sarees: pickCategory('sarees'),
    lehengas: pickCategory('lehengas'),
    suits: pickCategory('suits'),
    indowestern: pickCategory('indowestern'),
    menswear: pickCategory('menswear'),
    kids: pickCategory('kids'),
    jewelry: pickCategory('jewelry'),
  };

  // 3. 2-up Editorial Promo Banners — strictly distinct designs, different garment
  // categories, and different upload batches so side-by-side banners never look alike.
  const readyToShipPromoItem =
    pickRaw(
      (item) =>
        (item.category === 'suits' || item.category === 'sarees') &&
        !item.madeToOrder &&
        !item.seasonal,
    ) ||
    pickRaw((item) => isWomensCelebration(item) && !item.madeToOrder && !item.seasonal) ||
    pickRaw((item) => isAdultCelebration(item) && !item.madeToOrder && !item.seasonal);

  const bridalPartyPromoItem =
    // Prefer a wedding lehenga or Indo-Western set from a separate shoot/category
    pickRaw(
      (item) =>
        (item.category === 'lehengas' || item.category === 'indowestern') &&
        item.category !== readyToShipPromoItem?.category &&
        isDifferentUploadBatch(item, readyToShipPromoItem) &&
        !item.seasonal,
    ) ||
    // Next: any women's celebration category different from left banner + separate shoot
    pickRaw(
      (item) =>
        isWomensCelebration(item) &&
        item.category !== readyToShipPromoItem?.category &&
        isDifferentUploadBatch(item, readyToShipPromoItem) &&
        !item.seasonal,
    ) ||
    // Next: any women's celebration category different from left banner (still distinct design family)
    pickRaw(
      (item) =>
        isWomensCelebration(item) &&
        item.category !== readyToShipPromoItem?.category &&
        !item.seasonal,
    ) ||
    // Final strict fallback: any distinct adult celebration design family (never same family)
    pickRaw(
      (item) =>
        isAdultCelebration(item) &&
        isDifferentUploadBatch(item, readyToShipPromoItem) &&
        !item.seasonal,
    ) ||
    pickRaw((item) => isAdultCelebration(item) && !item.seasonal);

  return {
    hero: {
      'wedding-edit': formatEntry(weddingEditItem, 1120),
      'new-arrivals': formatEntry(newArrivalsItem, 1080),
      'sarees-edit': formatEntry(sareesEditItem, 1080),
      'lehengas-suits': formatEntry(lehengasSuitsItem, 1080),
      'ready-to-ship': formatEntry(readyToShipHeroItem, 1080),
    },
    categories,
    promos: {
      'ready-to-ship': formatEntry(readyToShipPromoItem, 960),
      'bridal-party': formatEntry(bridalPartyPromoItem, 960),
    },
  };
}
