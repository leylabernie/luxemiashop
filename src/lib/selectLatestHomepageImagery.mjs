import { getPrimaryCategory } from './catalogCategories.mjs';

const SERVICE_ADD_ON_HANDLE = 'luxemia-tailoring-saree-finishing-add-ons';

export const LATEST_HOMEPAGE_IMAGERY_QUERY = `
  query GetLatestHomepageImagery {
    newest: products(first: 80, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true") {
      edges { node { ...HomepageImageFields } }
    }
    sarees: products(first: 10, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true AND (product_type:Saree OR product_type:'Banarasi Saree' OR product_type:'Silk Saree' OR product_type:'Ready-to-Wear Saree' OR product_type:'Wedding Saree' OR product_type:'Georgette Saree' OR product_type:'Designer Saree' OR title:saree)") {
      edges { node { ...HomepageImageFields } }
    }
    lehengas: products(first: 10, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true AND (product_type:Lehenga OR product_type:'Lehenga Choli' OR product_type:'Bridal Lehenga' OR product_type:'Wedding Lehenga' OR product_type:'Party Wear Lehenga' OR product_type:'Navratri Lehenga' OR title:lehenga)") {
      edges { node { ...HomepageImageFields } }
    }
    suits: products(first: 10, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true AND (product_type:'Salwar Suit' OR product_type:'Palazzo Suit' OR product_type:'Plazzo Suit' OR product_type:'Sharara Suit' OR product_type:'Anarkali Suit' OR product_type:Anarkali OR product_type:Sharara OR product_type:'Salwar Kameez' OR product_type:'Pakistani Suit' OR product_type:'Readymade Suit' OR product_type:'Suit Set' OR product_type:'Palazzo Set')") {
      edges { node { ...HomepageImageFields } }
    }
    indowestern: products(first: 10, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true AND (product_type:'Indo Western' OR product_type:'Indo-Western' OR product_type:'Indo Western Dress' OR product_type:'Indo-Western Set' OR product_type:'Fusion Wear' OR product_type:'Jacket Set' OR product_type:'Skirt Set' OR product_type:'Coord Set' OR product_type:'Co-ord Set' OR product_type:'Cape Set' OR product_type:Jumpsuit OR title:'indo western' OR title:'indo-western' OR title:'jacket set')") {
      edges { node { ...HomepageImageFields } }
    }
    menswear: products(first: 10, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true AND (product_type:'Kurta Pajama' OR product_type:'Kurta Pajama Set' OR product_type:'Mens Kurta Pajama Set' OR product_type:Menswear OR product_type:Sherwani OR product_type:'Modi Jacket Kurta Pajama' OR product_type:'Nehru Jacket Set' OR product_type:'Kurta Set')") {
      edges { node { ...HomepageImageFields } }
    }
    kids: products(first: 8, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true AND (product_type:'Kids Kurta Set' OR product_type:'Kids Boy Set' OR product_type:'Kids Ethnic Wear' OR product_type:'Kids Lehenga' OR product_type:'Kids Salwar Set' OR product_type:'Girls Ethnic Set' OR product_type:'Boys Ethnic Set' OR title:kids)") {
      edges { node { ...HomepageImageFields } }
    }
    jewelry: products(first: 6, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true AND (product_type:Jewelry OR product_type:'Kundan Necklace Set' OR product_type:'Bridal Jewelry' OR product_type:'Necklace Set' OR product_type:'Jewelry Set')") {
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

function inferCategory(node) {
  const primary = getPrimaryCategory(node);
  if (primary) return primary;
  const text = `${node.title || ''} ${node.handle || ''}`.toLowerCase();
  if (/\b(?:kids?|boys?|girls?)\b/.test(text)) return 'kids';
  if (/\bcouple\b/.test(text)) return 'couple-outfits';
  if (/\b(?:lehenga|lehnga|chaniya)\b/.test(text)) return 'lehengas';
  if (/\b(?:saree|sari)\b/.test(text)) return 'sarees';
  if (/\b(?:indo[- ]?western|fusion|jumpsuit|cape set|co[- ]?ord|skirt set|jacket set|gown set)\b/.test(text) && !/\bkurta pajama\b/.test(text)) {
    return 'indowestern';
  }
  if (/\b(?:sherwani|kurta pajama|nehru jacket|modi jacket|menswear)\b/.test(text)) return 'menswear';
  if (/\b(?:salwar|kameez|sharara|anarkali|palazzo|plazzo|gharara|pakistani suit|kurti|suit)\b/.test(text)) return 'suits';
  if (/\b(?:jewel|kundan|polki|necklace|choker|bangle|earring|maang tikka)\b/.test(text)) return 'jewelry';
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

/**
 * Selects the newest distinct, active, model-ready Shopify product images for
 * all 5 homepage hero slides, all category showcase cards, and both editorial
 * promo banners.
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

      byHandle.set(node.handle, {
        handle: node.handle,
        title: String(node.title || '').replace(/\s*\|\s*Ready to Ship/gi, '').trim(),
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
      });
    }
  }

  const candidates = [...byHandle.values()].sort((a, b) => {
    if (b.createdMs !== a.createdMs) return b.createdMs - a.createdMs;
    return b.cdnVersion - a.cdnVersion;
  });

  if (candidates.length === 0) return null;

  const usedHandles = new Set();
  const usedImages = new Set();

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

  function pick(predicate, { targetWidth = 1080, allowReuse = false } = {}) {
    const pool = candidates.filter((item) => {
      if (!predicate(item)) return false;
      if (allowReuse) return true;
      return !usedHandles.has(item.handle) && !usedImages.has(item.imageKey);
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
    return formatEntry(chosen, targetWidth);
  }

  const isWomensCelebration = (item) =>
    item.category === 'lehengas' ||
    item.category === 'sarees' ||
    item.category === 'suits' ||
    item.category === 'indowestern';

  const isAdultCelebration = (item) =>
    isWomensCelebration(item) || item.category === 'menswear';

  // 1. Hero carousel slides — absolute newest active products, zero duplicates
  const weddingEdit = pick((item) => isWomensCelebration(item) && !item.seasonal, {
    targetWidth: 1120,
  });
  const newArrivals = pick((item) => isAdultCelebration(item) && !item.seasonal, {
    targetWidth: 1080,
  });
  const sareesEdit = pick((item) => item.category === 'sarees' && !item.seasonal, {
    targetWidth: 1080,
  });
  const lehengasSuits =
    pick(
      (item) => (item.category === 'lehengas' || item.category === 'suits') && !item.seasonal,
      { targetWidth: 1080 },
    ) ||
    pick((item) => isWomensCelebration(item) && !item.seasonal, { targetWidth: 1080 });
  const readyToShipHero =
    pick((item) => isWomensCelebration(item) && !item.madeToOrder && !item.seasonal, {
      targetWidth: 1080,
    }) ||
    pick((item) => isAdultCelebration(item) && !item.madeToOrder && !item.seasonal, {
      targetWidth: 1080,
    });

  // 2. Shop by Category — latest active item per department (distinct from hero when available)
  const pickCategory = (categoryName) =>
    pick((item) => item.category === categoryName && !item.seasonal, { targetWidth: 900 }) ||
    pick((item) => item.category === categoryName, { targetWidth: 900 }) ||
    pick((item) => item.category === categoryName && !item.seasonal, {
      targetWidth: 900,
      allowReuse: true,
    }) ||
    pick((item) => item.category === categoryName, {
      targetWidth: 900,
      allowReuse: true,
    });

  const categories = {
    sarees: pickCategory('sarees'),
    lehengas: pickCategory('lehengas'),
    suits: pickCategory('suits'),
    indowestern: pickCategory('indowestern'),
    menswear: pickCategory('menswear'),
    kids: pickCategory('kids'),
    jewelry: pickCategory('jewelry'),
  };

  // 3. 2-up Editorial Promo Banners — distinct latest Ready-to-Ship & Bridal Party styles
  const readyToShipPromo =
    pick((item) => isWomensCelebration(item) && !item.madeToOrder && !item.seasonal, {
      targetWidth: 960,
    }) ||
    pick((item) => isAdultCelebration(item) && !item.madeToOrder && !item.seasonal, {
      targetWidth: 960,
    });

  const bridalPartyPromo =
    pick(
      (item) =>
        (item.category === 'lehengas' ||
          item.category === 'suits' ||
          item.category === 'indowestern' ||
          item.category === 'sarees') &&
        !item.seasonal,
      { targetWidth: 960 },
    ) ||
    pick((item) => isAdultCelebration(item) && !item.seasonal, { targetWidth: 960 });

  return {
    hero: {
      'wedding-edit': weddingEdit,
      'new-arrivals': newArrivals,
      'sarees-edit': sareesEdit,
      'lehengas-suits': lehengasSuits,
      'ready-to-ship': readyToShipHero,
    },
    categories,
    promos: {
      'ready-to-ship': readyToShipPromo,
      'bridal-party': bridalPartyPromo,
    },
  };
}
