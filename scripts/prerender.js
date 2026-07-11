/**
 * Build-time prerender script
 *
 * Generates static HTML files for key routes with proper meta tags,
 * structured data, and semantic content so search engine bots see
 * real HTML instead of a blank SPA shell.
 *
 * These files are placed in dist/ alongside the SPA build.
 * Vercel Edge Middleware serves them to bot user agents.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const SITE_URL = 'https://luxemia.shop';
const FALLBACK_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const FALLBACK_PRICE = '299.00';
const FALLBACK_CURRENCY = 'USD';

// ─── Shopify Storefront API (build-time product fetch) ──────────────────────
// Pulls live product data so prerendered HTML emits valid Product schema with
// image, description, offers.price, etc. — required by Google Merchant
// Listings / Rich Results validation.
const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-07/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';
if (!SHOPIFY_STOREFRONT_TOKEN) {
  console.warn('[prerender] WARNING: SHOPIFY_STOREFRONT_TOKEN env var is not set. Product prerendering will use fallback data.');
}


const ALL_PRODUCTS_QUERY = `
  query GetAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id title description handle vendor productType availableForSale
          seo { title description }
          priceRange { minVariantPrice { amount currencyCode } }
          compareAtPriceRange { maxVariantPrice { amount currencyCode } }
          images(first: 5) { edges { node { url altText } } }
          variants(first: 5) { edges { node { sku } } }
        }
      }
    }
  }
`;

function forceJpegForGmc(url) {
  if (!url) return url;
  if (url.includes('cdn.shopify.com') || url.includes('myshopify.com')) {
    const clean = url.replace(/[&?]format=\w+/g, '');
    const sep = clean.includes('?') ? '&' : '?';
    return `${clean}${sep}format=jpg&width=1200`;
  }
  if (url.includes('kesimg.b-cdn.net')) {
    const clean = url.replace(/[&?]format=\w+/g, '');
    const sep = clean.includes('?') ? '&' : '?';
    return `${clean}${sep}format=jpg`;
  }
  if (!url.match(/\.(jpg|jpeg|png|gif)(\?|$)/i) && !url.includes('format=')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}format=jpg`;
  }
  return url;
}

async function fetchAllShopifyProducts() {
  const map = new Map();
  let cursor = null;
  try {
    for (let i = 0; i < 20; i++) {
      const resp = await fetch(SHOPIFY_STOREFRONT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: ALL_PRODUCTS_QUERY,
          variables: { first: 100, after: cursor },
        }),
      });
      if (!resp.ok) {
        console.warn(`[prerender] Shopify fetch returned ${resp.status} — using fallbacks`);
        break;
      }
      const json = await resp.json();
      const data = json?.data?.products;
      if (!data) break;
      for (const edge of data.edges || []) {
        const p = edge.node;
        if (p?.handle) map.set(p.handle, p);
      }
      if (!data.pageInfo?.hasNextPage) break;
      cursor = data.pageInfo.endCursor;
    }
  } catch (err) {
    console.warn(`[prerender] Shopify fetch failed: ${err.message} — using fallbacks`);
  }
  console.log(`[prerender] Loaded ${map.size} products from Shopify Storefront API`);
  return map;
}

// ─── Collection page product injection ───────────────────────────────────────
// Mirrors the client-side filtering logic in src/hooks/useShopifyProducts.ts.
// Kept in sync manually — the prerender script runs in Node and cannot import
// the browser hook. If you add a productType to CATEGORY_PRODUCT_TYPES here,
// also add it to src/hooks/useShopifyProducts.ts (and vice versa).
const CATEGORY_PRODUCT_TYPES = {
  suits: ['Pakistani Suit', 'Salwar Suit', 'Sharara', 'Anarkali', 'Plazzo Suit', 'Palazzo Suit', 'Pakistani Readymade Suit', 'Salwar Kameez', 'Sharara Suit', 'Wedding Suit', 'Designer Suit', 'Gharara Suit', 'Anarkali Suit', 'Gown', 'Salwar', 'Kurti', 'Kurti Set', 'Palazzo', 'Readymade Suit', 'Churidar Suit', 'Patiala Suit', 'Straight Suit', 'Suit'],
  sarees: ['Saree', 'Ready-to-Wear Saree', 'Wedding Saree', 'Sarees', 'Silk Saree', 'Banarasi Saree', 'Cotton Saree', 'Georgette Saree', 'Bridal Saree', 'Designer Saree', 'Fancy Saree', 'Party Wear Saree', 'Kanjivaram Saree', 'Kanchipuram Saree', 'Tissue Saree', 'Net Saree', 'Sari'],
  lehengas: ['Lehenga', 'Lehenga Choli', 'Bridal Lehenga Choli', 'Lehnga', 'Lehnga Choli', 'Bridal Lehnga', 'Bridal Lehnga Choli', 'Lehenga Set', 'Lehenga Choli Set', 'Bridal Lehenga', 'Party Wear Lehenga', 'Wedding Lehenga', 'Designer Lehenga', 'Fancy Lehenga'],
  menswear: ["Men's Ethnic Wear", 'Kurta Pajama', 'Sherwani', "Men's Indian Wear", 'Modi Jacket Kurta Pajama', 'Menswear', "Men's Suit", 'Kurta Set', 'Kurta', 'Dhoti Kurta', 'Nehru Jacket Set'],
  indowestern: ['Indo Western', 'Indo-Western', 'Fusion Wear', 'Fusion', 'Indo Western Dress', 'Indo-Western Set', 'Jumpsuit', 'Cape Set', 'Coord Set', 'Co-Ords', 'Co-ord Set', 'Indo-Western Dress', 'Sharara Set'],
  jewelry: ['Kundan Necklace Set', 'Kundan Jewelry', 'Bridal Jewelry', 'Necklace Set', 'Kundan', 'Polki', 'Uncut Polki', 'Jewelry', 'Jewelry Set', 'Jewellery Set', 'Kundan Set', 'Polki Set', 'Bridal Set', 'Full Bridal Set', 'Kundan Bridal Set', 'Kundan Necklace', 'Choker Necklace', 'Necklace', 'Earrings', 'Bangles', 'Maang Tikka', 'Bridal Jewelry Set', 'Kundan Earrings', 'Kundan Bangles'],
};

const MENSWEAR_KEYWORDS_REGEX = /\b(sherwani|kurta\s?pajama|kurta\s?set|jodhpuri|modi\s?jacket|nehru\s?jacket|groom|menswear|men's|dhoti|bandi|pathani|achkan|angarakha|men\s?suit|men\s?kurta|men\s?shirt|men\s?trouser|men\s?jacket|\bmale\b|for\s?men|\bboys\b)\b/i;
const MENSWEAR_TAGS_EXACT = new Set(['mens', "men's", 'groom', 'groomsmen', 'groomsman', 'boys', 'male', 'menswear', 'indian-menswear', 'men', 'man', 'gender:male', 'gender:men']);
const EXCLUDED_TITLE_KEYWORDS = /\b(turban|sunglasses?)\b/i;
const HIDE_OLD_PRODUCTS = true;
const HIDE_PRODUCTS_BEFORE_DATE = new Date('2026-04-09T00:00:00Z');

function isOldBatchProduct(p) {
  if (!HIDE_OLD_PRODUCTS) return false;
  const createdAt = p.createdAt;
  if (!createdAt) return false;
  return new Date(createdAt) < HIDE_PRODUCTS_BEFORE_DATE;
}

function isMenswearProduct(p) {
  const pt = (p.productType ?? '').toLowerCase();
  const title = (p.title ?? '').toLowerCase();
  const tags = (p.tags ?? []).map(t => t.toLowerCase());
  const menswearTypes = CATEGORY_PRODUCT_TYPES.menswear.map(t => t.toLowerCase());
  if (menswearTypes.some(t => pt === t || pt.includes(t))) return true;
  if (/\bmen\b/.test(pt) || /\bmen's\b/.test(pt) || /\bmenswear\b/.test(pt) || /\bmale\b/.test(pt)) return true;
  if (MENSWEAR_KEYWORDS_REGEX.test(title)) return true;
  if (tags.some(t => MENSWEAR_TAGS_EXACT.has(t) || MENSWEAR_TAGS_EXACT.has(t.replace(/wear$/, '')))) return true;
  return false;
}

// Server-side mirror of filterByCategory() from useShopifyProducts.ts.
// Returns up to MAX_COLLECTION_PRODUCTS for the prerendered HTML payload.
const MAX_COLLECTION_PRODUCTS = 50;

function filterProductsForCategory(allProducts, category) {
  // Global exclusions: old batch + banned titles
  const allowed = allProducts.filter(p => {
    if (isOldBatchProduct(p)) return false;
    if (EXCLUDED_TITLE_KEYWORDS.test(p.title ?? '')) return false;
    return true;
  });

  if (category === 'all') return allowed.slice(0, MAX_COLLECTION_PRODUCTS);

  const types = CATEGORY_PRODUCT_TYPES[category];
  if (!types) return allowed.slice(0, MAX_COLLECTION_PRODUCTS);

  // Menswear: include only men's products, exclude women's wear
  if (category === 'menswear') {
    const womensKeywords = /\b(saree|sari|lehenga|lehenga|anarkali|salwar|palazzo|plazzo|sharara|gharara|gown|dupatta|blouse|petticoat|choli|women|women's|female|ladies|bridal|pakistani suit)\b/i;
    return allowed.filter(p => {
      if (!isMenswearProduct(p)) return false;
      if (EXCLUDED_TITLE_KEYWORDS.test(p.title ?? '')) return false;
      const title = (p.title ?? '').toLowerCase();
      const tags = (p.tags ?? []).map(t => t.toLowerCase());
      if (womensKeywords.test(title)) return false;
      if (tags.some(t => t === 'women' || t === 'womens' || t === 'female' || t === 'ladies' || t === 'gender:female' || t === 'gender:women')) return false;
      return true;
    }).slice(0, MAX_COLLECTION_PRODUCTS);
  }

  // Women's categories: exclude menswear first
  const filtered = allowed.filter(p => !isMenswearProduct(p));

  if (category === 'indowestern') {
    const womensFusionTypes = [
      ...types.map(t => t.toLowerCase()),
      'sharara', 'anarkali', 'co-ords', 'coord set', 'jumpsuit', 'cape set', 'plazzo suit',
    ];
    return filtered.filter(p => {
      const pt = (p.productType ?? '').toLowerCase();
      const tags = (p.tags ?? []).map(t => t.toLowerCase());
      return womensFusionTypes.some(t => pt.includes(t)) ||
        tags.some(t => t.includes('indo') || t.includes('fusion') || t === 'contemporary' || t === 'western');
    }).slice(0, MAX_COLLECTION_PRODUCTS);
  }

  if (category === 'suits') {
    const suitTags = ['salwar kameez', 'salwar-kameez', 'sharara suit', 'plazzo suit', 'pakistani suit',
      'anarkali suit', 'gharara suit', 'designer suit', 'wedding suit', 'boutique salwar suit'];
    const womensIndicators = /salwar|kameez|anarkali|sharara|palazzo|plazzo|gharara|pakistani|lehenga|dupatta|churidar|women|ladies|female/i;
    return filtered.filter(p => {
      const pt = (p.productType ?? '').toLowerCase();
      const tags = (p.tags ?? []).map(t => t.toLowerCase());
      const title = (p.title ?? '').toLowerCase();
      if (tags.some(t => t === 'men' || t === 'mens' || t === 'male' || t === 'boys' || t === 'menswear' || t === 'groom')) return false;
      if (title.includes('sherwani') || title.includes('kurta pajama') || title.includes('for men')) return false;
      if (types.some(t => t.toLowerCase() === pt)) {
        if (pt === 'wedding suit' || pt === 'designer suit' || pt === 'suit') {
          if (!womensIndicators.test(title) && !womensIndicators.test(pt)) return false;
        }
        return true;
      }
      if (suitTags.some(st => tags.some(t => t === st || t.includes(st)))) {
        const hasMensSignals = tags.some(t => t === 'men' || t === 'mens' || t === 'male' || t === 'boys' || t === 'menswear' || t === 'groom' || t === 'gender:male');
        const titleLooksMens = title.includes('sherwani') || title.includes('kurta pajama') || title.includes('for men');
        if (!hasMensSignals && !titleLooksMens) return true;
      }
      if (/salwar|kameez|anarkali|sharara|palazzo|plazzo|gharara|pakistani\s+suit|kurti|churidar|patiala/.test(pt)) return true;
      return false;
    }).slice(0, MAX_COLLECTION_PRODUCTS);
  }

  // Lehengas + Sarees + Jewelry: match by productType with keyword fallback
  return filtered.filter(p => {
    const pt = (p.productType ?? '').toLowerCase();
    const tags = (p.tags ?? []).map(t => t.toLowerCase());
    const title = (p.title ?? '').toLowerCase();
    if (tags.some(t => t === 'men' || t === 'mens' || t === 'male' || t === 'boys' || t === 'menswear')) return false;
    if (title.includes('sherwani') || title.includes('kurta pajama') || title.includes('for men')) return false;
    if (types.some(t => t.toLowerCase() === pt)) return true;
    if (category === 'lehengas') return /lehenga|lehnga|lehena/.test(pt);
    if (category === 'sarees') return /saree|sari/.test(pt);
    // Jewelry fallback — Shopify products often have productType "Jewelry Set",
    // "Bridal Jewelry Set", etc. Also tag-match for products whose productType
    // is generic but whose tags identify them as jewelry. Mirrors the same fix
    // in src/hooks/useShopifyProducts.ts filterByCategory().
    if (category === 'jewelry') {
      if (/\bjewel|jewell|kundan|polki|necklace|choker|bangle|earring|maang\s?tikka|bridal\s?set/.test(pt)) {
        return true;
      }
      const jewelryTagPattern = /\bjewel|jewell|kundan|polki|necklace|choker|bangle|earring|maang|bridal\s?set|bridal\s?jewelry/;
      if (tags.some(t => jewelryTagPattern.test(t))) {
        return true;
      }
      return false;
    }
    return false;
  }).slice(0, MAX_COLLECTION_PRODUCTS);
}

// Build the compact JSON payload that gets injected as window.__INITIAL_DATA__.
// React's useShopifyProducts hook reads this on hydration to skip the client-side
// Shopify fetch entirely on first paint.
function buildInitialDataPayload(products, category) {
  // Slim each product down to the fields the hook actually consumes.
  const slim = products.map(p => ({
    node: {
      id: p.id,
      title: p.title,
      createdAt: p.createdAt,
      description: p.description ?? '',
      handle: p.handle,
      vendor: p.vendor,
      productType: p.productType,
      tags: p.tags ?? [],
      availableForSale: p.availableForSale,
      priceRange: p.priceRange,
      compareAtPriceRange: p.compareAtPriceRange,
      images: p.images,
      variants: p.variants,
      options: p.options ?? [],
    },
  }));
  return JSON.stringify({ category: category || 'all', products: slim });
}

// Visible HTML product cards for crawlers. Removed by the existing MutationObserver
// once React hydrates. Mirrors the inline-styling pattern used for /product/* pages.
function generateCollectionProductHtml(products) {
  if (!products || products.length === 0) {
    return '<p>New arrivals are being added to this collection. Please check back shortly.</p>';
  }
  const cards = products.map(p => {
    const price = p.priceRange?.minVariantPrice?.amount;
    const currency = p.priceRange?.minVariantPrice?.currencyCode || 'USD';
    const comparePrice = p.compareAtPriceRange?.maxVariantPrice?.amount;
    const isAvailable = p.availableForSale !== false;
    const firstImage = p.images?.edges?.[0]?.node;
    const imgHtml = firstImage
      ? `<img src="${escapeHtml(forceJpegForGmc(firstImage.url))}" alt="${escapeHtml(firstImage.altText || p.title || '')}" width="400" height="500" loading="lazy" style="max-width:100%;height:auto;display:block;margin:0 0 8px 0">`
      : '';

    let priceHtml = '';
    if (price) {
      priceHtml = `<strong>${currency} ${parseFloat(price).toFixed(2)}</strong>`;
      if (comparePrice && parseFloat(comparePrice) > parseFloat(price)) {
        priceHtml += ` <s style="color:#888">${currency} ${parseFloat(comparePrice).toFixed(2)}</s>`;
      }
    }

    const availability = isAvailable ? 'In Stock' : 'Currently Unavailable';
    const title = escapeHtml(p.title || p.handle);
    const handle = escapeHtml(p.handle);

    return `<div style="display:inline-block;vertical-align:top;width:30%;margin:0 1.5% 24px;min-width:240px">
      <a href="/product/${handle}" style="text-decoration:none;color:inherit">
        ${imgHtml}
        <h3 style="font-size:14px;margin:0 0 4px 0;font-weight:600">${title}</h3>
      </a>
      <p style="margin:0 0 2px 0;font-size:13px">${priceHtml}</p>
      <p style="margin:0;font-size:12px;color:#666">${availability}</p>
    </div>`;
  }).join('\n        ');

  return `<div style="margin:24px 0">${cards}</div>`;
}

// schema.org ItemList JSON-LD for collection pages. Each ListItem wraps a Product
// with url/image/name/offers — what Google Merchant Center reads for rich results.
function generateItemListJsonLd(products, category, routePath) {
  const canonical = SITE_URL + routePath;
  const items = products.map((p, i) => {
    const price = p.priceRange?.minVariantPrice?.amount || FALLBACK_PRICE;
    const currency = p.priceRange?.minVariantPrice?.currencyCode || FALLBACK_CURRENCY;
    const image = p.images?.edges?.[0]?.node?.url
      ? forceJpegForGmc(p.images.edges[0].node.url)
      : FALLBACK_OG_IMAGE;
    const availability = p.availableForSale === false
      ? 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock';
    const productUrl = `${SITE_URL}/product/${p.handle}`;
    return {
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.title,
        image,
        url: productUrl,
        description: (p.description || p.title || '').slice(0, 5000),
        sku: (p.id || '').split('/').pop() || p.handle,
        brand: { '@type': 'Brand', name: 'LuxeMia' },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          price,
          priceCurrency: currency,
          availability,
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@type': 'Organization', name: 'LuxeMia' },
        },
      },
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: category === 'all' ? 'LuxeMia Collection' : `LuxeMia ${category.charAt(0).toUpperCase() + category.slice(1)}`,
    url: canonical,
    numberOfItems: items.length,
    itemListElement: items,
  };
}

// Route definitions with SEO metadata
const routes = [
  {
    path: '/',
    title: 'LuxeMia — Buy Indian Ethnic Wear Online | Sarees, Lehengas & Suits',
    description: 'Shop 900+ Indian ethnic wear styles online at LuxeMia. Bridal lehengas, silk sarees, anarkali suits & sherwanis. Free shipping to USA, Canada & Australia over $350.',
    h1: 'Affordable Indian Ethnic Wear & Traditional Fashion',
    content: `
      <p>Welcome to Luxemia Shop — your destination for affordable traditional clothing and ready-to-ship Indian ethnic wear. Shop trendy sarees, festive lehengas, and ready-to-wear salwar kameez with fast USA delivery.</p>
      <h2>Shop by Category</h2>
      <nav>
        <ul>
          <li><a href="/lehengas">Lehengas</a> — Bridal & wedding lehenga choli collections</li>
          <li><a href="/sarees">Sarees</a> — Banarasi, Kanjeevaram & designer sarees</li>
          <li><a href="/suits">Salwar Kameez</a> — Anarkali, sharara & palazzo suits</li>
          <li><a href="/menswear">Menswear</a> — Sherwanis, kurta sets & Indo-western</li>
        </ul>
      </nav>
      <h2>Featured Collections</h2>
      <ul>
        <li><a href="/lehengas">Bridal Lehengas</a></li>
        <li><a href="/sarees">Wedding Sarees</a></li>
        <li><a href="/collections">Reception Outfits</a></li>
        <li><a href="/collections">Festive Wear</a></li>
      </ul>
      <p>Free shipping on orders over $350 to USA, Canada, and Australia. Flat rate $25 per order for orders under $350. Handcrafted with love by Indian artisans.</p>
    `,
  },
  {
       path: '/suits',
    category: 'suits',
    title: 'Buy Salwar Suits Online — Anarkali, Palazzo & Sharara | LuxeMia',
    description: 'Shop 300+ Indian salwar suits online at LuxeMia. Anarkali, palazzo, sharara & Pakistani suits with handcrafted embroidery. Custom tailoring available. Free shipping to USA, Canada & Australia over $350.',
    h1: 'Salwar Kameez & Designer Suits Collection',
    content: `
      <p>Explore our curated collection of Salwar Kameez and anarkali ensembles. From elegant sharara sets to flowing palazzo suits, each piece features beautiful embroidery on premium fabrics like georgette, silk, and chiffon.</p>
      <h2>Shop Suits by Occasion</h2>
      <ul>
        <li><a href="/suits?sub=wedding">Wedding Suits</a> — Elegant salwar kameez for wedding celebrations</li>
        <li><a href="/suits?sub=party-wear">Party Wear Suits</a> — Stunning suits for festive occasions</li>
        <li><a href="/suits?sub=festive">Festive Suits</a> — Vibrant suits for Diwali, Eid & Navratri</li>
        <li><a href="/suits?sub=casual">Casual Suits</a> — Everyday ethnic wear for women</li>
      </ul>
      <h2>Shop Suits by Style</h2>
      <ul>
        <li><a href="/suits?sub=anarkali">Anarkali Suits</a> — Flowing Mughal-inspired silhouette</li>
        <li><a href="/suits?sub=sharara">Sharara Sets</a> — Wide-legged flared pants with short kurti</li>
        <li><a href="/suits?sub=palazzo">Palazzo Suits</a> — Modern wide-leg pants with kurta</li>
        <li><a href="/suits?sub=pakistani">Pakistani Suits</a> — Elegant straight-cut designer suits</li>
        <li><a href="/suits?sub=straight-cut">Straight Cut Suits</a> — Classic everyday salwar kameez</li>
      </ul>
      <h2>Shop Suits by Fabric</h2>
      <ul>
        <li><a href="/suits?sub=georgette-suit">Georgette Suits</a> — Lightweight & flowy</li>
        <li><a href="/suits?sub=chinon-suit">Chinon Suits</a> — Premium crepe-like fabric</li>
        <li><a href="/suits?sub=silk-suit">Silk Suits</a> — Luxurious & traditional</li>
        <li><a href="/suits?sub=cotton-suit">Cotton Suits</a> — Breathable & comfortable</li>
        <li><a href="/suits?sub=velvet-suit">Velvet Suits</a> — Rich & regal for winter weddings</li>
      </ul>
      <h2>Shop Suits by Color</h2>
      <ul>
        <li><a href="/suits?sub=pink">Pink Suits</a></li>
        <li><a href="/suits?sub=red">Red Suits</a></li>
        <li><a href="/suits?sub=green">Green Suits</a></li>
        <li><a href="/suits?sub=blue">Blue Suits</a></li>
        <li><a href="/suits?sub=maroon">Maroon Suits</a></li>
        <li><a href="/suits?sub=purple">Purple Suits</a></li>
      </ul>
      <h2>Wedding Party & NRI Suits</h2>
      <ul>
        <li><a href="/suits?sub=bridesmaid">Bridesmaid Suits</a> — Coordinated looks for the bridal party</li>
        <li><a href="/suits?sub=mother-of-bride">Mother of Bride Suits</a> — Elegant suits for mothers</li>
        <li><a href="/suits?sub=nri-wedding">NRI Wedding Suits</a> — Destination wedding appropriate</li>
      </ul>
      <h2>Shop Suits by Price</h2>
      <ul>
        <li><a href="/suits?sub=under-200">Suits Under $200</a> — Affordable premium ethnic wear</li>
        <li><a href="/suits?sub=premium-300-plus">Premium Suits $300+</a> — Designer & heavily embellished</li>
      </ul>
    `,
  },
  {
    path: '/lehengas',
    category: 'lehengas',
    title: 'Buy Bridal Lehengas Online | Wedding & Festive Lehenga Choli — LuxeMia',
    description: 'Shop 260+ lehengas online at LuxeMia. Bridal, wedding, party wear & festive lehenga choli in silk, net & velvet with hand embroidery. Custom tailoring available. Free shipping over $350.',
    h1: 'Designer Lehengas & Bridal Lehenga Collection',
    content: `
      <p>Discover our stunning collection of designer lehengas and bridal lehenga choli. Handcrafted with intricate embroidery on premium silk, net, and velvet fabrics. Each lehenga is a beautiful piece of Indian design.</p>
      <h2>Shop Lehengas by Occasion</h2>
      <ul>
        <li><a href="/lehengas?sub=bridal">Bridal Lehengas</a> — Heavily embroidered lehenga choli for your wedding day</li>
        <li><a href="/lehengas?sub=wedding">Wedding Lehengas</a> — Elegant designs for wedding celebrations</li>
        <li><a href="/lehengas?sub=engagement">Engagement Lehengas</a> — Statement pieces for the engagement ceremony</li>
        <li><a href="/lehengas?sub=reception">Reception Lehengas</a> — Glamorous lehengas for the reception</li>
        <li><a href="/lehengas?sub=mehendi">Mehendi Lehengas</a> — Vibrant lehengas for the henna ceremony</li>
        <li><a href="/lehengas?sub=haldi">Haldi Lehengas</a> — Bright yellow & festive lehengas</li>
        <li><a href="/lehengas?sub=sangeet">Sangeet Lehengas</a> — Dance-ready lehengas for the sangeet</li>
        <li><a href="/lehengas?sub=party-wear">Party Wear Lehengas</a> — Stunning lehengas for festive occasions</li>
      </ul>
      <h2>Shop Lehengas by Style</h2>
      <ul>
        <li><a href="/lehengas?sub=floral">Floral Lehengas</a> — Romantic floral embroidery</li>
        <li><a href="/lehengas?sub=embroidered">Embroidered Lehengas</a> — Hand-embroidered zardozi & resham</li>
        <li><a href="/lehengas?sub=designer">Designer Lehengas</a> — Couture-inspired pieces</li>
        <li><a href="/lehengas?sub=mirror-work">Mirror Work Lehengas</a> — Traditional Rajasthani mirror work</li>
        <li><a href="/lehengas?sub=jacket-lehenga">Jacket Lehengas</a> — Layered lehenga with jacket</li>
        <li><a href="/lehengas?sub=crop-top">Crop Top & Skirt Lehengas</a> — Modern indo-western silhouette</li>
      </ul>
      <h2>Shop Lehengas by Color</h2>
      <ul>
        <li><a href="/lehengas?sub=red">Red Lehengas</a> — Classic bridal red</li>
        <li><a href="/lehengas?sub=pink">Pink Lehengas</a> — Soft & romantic</li>
        <li><a href="/lehengas?sub=maroon">Maroon Lehengas</a> — Deep & rich</li>
        <li><a href="/lehengas?sub=pastel">Pastel Lehengas</a> — Modern pastel shades</li>
        <li><a href="/lehengas?sub=ivory">Ivory Lehengas</a> — Timeless & elegant</li>
        <li><a href="/lehengas?sub=wine">Wine Lehengas</a> — Sophisticated & deep</li>
      </ul>
      <h2>Wedding Party & NRI Lehengas</h2>
      <ul>
        <li><a href="/lehengas?sub=bridesmaid">Bridesmaid Lehengas</a> — Coordinated looks for the bridal party</li>
        <li><a href="/lehengas?sub=mother-of-bride">Mother of Bride Lehengas</a> — Elegant lehengas for mothers</li>
        <li><a href="/lehengas?sub=nri-wedding">NRI Wedding Lehengas</a> — Destination wedding appropriate</li>
      </ul>
      <h2>Shop Lehengas by Price</h2>
      <ul>
        <li><a href="/lehengas?sub=under-200">Lehengas Under $200</a> — Affordable premium lehengas</li>
        <li><a href="/lehengas?sub=premium-300-plus">Premium Lehengas $300+</a> — Designer & heavily embellished</li>
      </ul>
    `,
  },
  {
    path: '/sarees',
    category: 'sarees',
    title: 'Buy Sarees Online — Silk, Banarasi & Wedding Sarees | LuxeMia',
    description: 'Shop 200+ Indian sarees online at LuxeMia. Banarasi silk, Kanchipuram, designer georgette & wedding sarees with custom blouse stitching. Free shipping to USA, Canada & Australia over $350.',
    h1: 'Designer Sarees — Silk, Banarasi & Wedding Collection',
    content: `
      <p>Explore our beautiful collection of designer sarees. From Banarasi silk to elegant Kanjeevaram, each saree is made with care by skilled Indian makers. Perfect for weddings, festivals, and special occasions.</p>
      <h2>Shop Sarees by Occasion</h2>
      <ul>
        <li><a href="/sarees?sub=bridal">Bridal Sarees</a> — Heavily embellished sarees for the bride</li>
        <li><a href="/sarees?sub=wedding">Wedding Sarees</a> — Elegant sarees for wedding ceremonies</li>
        <li><a href="/sarees?sub=reception">Reception Sarees</a> — Glamorous sarees for the reception</li>
        <li><a href="/sarees?sub=party-wear">Party Wear Sarees</a> — Statement sarees for parties</li>
        <li><a href="/sarees?sub=festive">Festive Sarees</a> — Vibrant sarees for Diwali, Eid & Navratri</li>
      </ul>
      <h2>Shop Sarees by Fabric</h2>
      <ul>
        <li><a href="/sarees?sub=silk">Silk Sarees</a> — Premium silk sarees</li>
        <li><a href="/sarees?sub=banarasi">Banarasi Sarees</a> — Handwoven in Varanasi</li>
        <li><a href="/sarees?sub=kanjeevaram">Kanjeevaram Sarees</a> — Premium South Indian silk</li>
        <li><a href="/sarees?sub=georgette">Georgette Sarees</a> — Lightweight & elegant</li>
        <li><a href="/sarees?sub=chiffon">Chiffon Sarees</a> — Flowy & comfortable</li>
        <li><a href="/sarees?sub=organza">Organza Sarees</a> — Modern sheer fabric</li>
      </ul>
      <h2>Shop Sarees by Style</h2>
      <ul>
        <li><a href="/sarees?sub=embroidered">Embroidered Sarees</a> — Hand-embroidered detailing</li>
        <li><a href="/sarees?sub=printed">Printed Sarees</a> — Affordable & stylish</li>
        <li><a href="/sarees?sub=designer">Designer Sarees</a> — Couture-inspired pieces</li>
        <li><a href="/sarees?sub=traditional">Traditional Sarees</a> — Heritage weaves</li>
      </ul>
      <h2>Shop Sarees by Color</h2>
      <ul>
        <li><a href="/sarees?sub=red">Red Sarees</a></li>
        <li><a href="/sarees?sub=maroon">Maroon Sarees</a></li>
        <li><a href="/sarees?sub=pink">Pink Sarees</a></li>
        <li><a href="/sarees?sub=blue">Blue Sarees</a></li>
        <li><a href="/sarees?sub=green">Green Sarees</a></li>
        <li><a href="/sarees?sub=pastel">Pastel Sarees</a></li>
      </ul>
      <h2>Wedding Party & NRI Sarees</h2>
      <ul>
        <li><a href="/sarees?sub=bridesmaid">Bridesmaid Sarees</a> — Coordinated looks for the bridal party</li>
        <li><a href="/sarees?sub=mother-of-bride">Mother of Bride Sarees</a> — Elegant sarees for mothers</li>
        <li><a href="/sarees?sub=nri-wedding">NRI Wedding Sarees</a> — Destination wedding appropriate</li>
      </ul>
      <h2>Shop Sarees by Price</h2>
      <ul>
        <li><a href="/sarees?sub=under-200">Sarees Under $200</a> — Affordable premium sarees</li>
        <li><a href="/sarees?sub=premium-300-plus">Premium Sarees $300+</a> — Designer & heavily embellished</li>
      </ul>
    `,
  },
  {
    path: '/menswear',
    category: 'menswear',
    title: 'Buy Sherwanis Online — Wedding & Groom Sherwani for Men | LuxeMia',
    description: 'Shop designer sherwanis for men online at LuxeMia. Groom sherwanis, kurta pajama sets & indo-western menswear with hand embroidery. Custom tailoring available. Free shipping over $350.',
    h1: 'Indian Menswear — Sherwanis & Kurta Collection',
    content: `
      <p>Discover our premium collection of Indian menswear. From regal sherwanis for grooms to elegant kurta sets and modern Indo-western outfits, crafted with premium fabrics and expert tailoring.</p>
      <h2>Shop Menswear by Style</h2>
      <ul>
        <li><a href="/menswear?sub=sherwani">Sherwanis</a> — Regal wedding sherwanis for the groom</li>
        <li><a href="/menswear?sub=kurta-pajama">Kurta Pajama Sets</a> — Classic & comfortable ethnic wear</li>
        <li><a href="/menswear?sub=modi-jacket">Modi Jackets</a> — Tailored Nehru-style jackets</li>
        <li><a href="/menswear?sub=indo-western">Indo Western</a> — Modern fusion silhouettes</li>
        <li><a href="/menswear?sub=bandhgala">Bandhgala Suits</a> — Tailored formal jackets</li>
      </ul>
      <h2>Shop Menswear by Fabric</h2>
      <ul>
        <li><a href="/menswear?sub=silk-menswear">Silk Sherwanis</a> — Luxurious & traditional</li>
        <li><a href="/menswear?sub=raw-silk">Raw Silk Sherwanis</a> — Premium & textured</li>
        <li><a href="/menswear?sub=jacquard">Jacquard Sherwanis</a> — Woven patterns</li>
        <li><a href="/menswear?sub=velvet-menswear">Velvet Sherwanis</a> — Rich & regal for winter weddings</li>
        <li><a href="/menswear?sub=cotton-menswear">Cotton Kurtas</a> — Breathable & comfortable</li>
        <li><a href="/menswear?sub=brocade">Brocade Sherwanis</a> — Ornate & traditional</li>
      </ul>
      <h2>Shop Menswear by Occasion</h2>
      <ul>
        <li><a href="/menswear?sub=wedding">Wedding Sherwanis</a> — Groom & groomsmen</li>
        <li><a href="/menswear?sub=engagement">Engagement Sherwanis</a> — Statement pieces</li>
        <li><a href="/menswear?sub=reception">Reception Sherwanis</a> — Glamorous evening looks</li>
        <li><a href="/menswear?sub=festive">Festive Menswear</a> — Diwali, Eid & celebrations</li>
      </ul>
      <h2>Shop Menswear by Color</h2>
      <ul>
        <li><a href="/menswear?sub=cream">Cream Sherwanis</a></li>
        <li><a href="/menswear?sub=beige">Beige Sherwanis</a></li>
        <li><a href="/menswear?sub=gold">Gold Sherwanis</a></li>
        <li><a href="/menswear?sub=black">Black Sherwanis</a></li>
        <li><a href="/menswear?sub=navy">Navy Sherwanis</a></li>
        <li><a href="/menswear?sub=maroon">Maroon Sherwanis</a></li>
        <li><a href="/menswear?sub=wine">Wine Sherwanis</a></li>
      </ul>
      <h2>Wedding Party & NRI Menswear</h2>
      <ul>
        <li><a href="/menswear?sub=groom">Groom Sherwanis</a> — The main character of the day</li>
        <li><a href="/menswear?sub=groomsmen">Groomsmen Sherwanis</a> — Coordinated looks for the wedding party</li>
        <li><a href="/menswear?sub=nri-wedding">NRI Wedding Menswear</a> — Destination wedding appropriate</li>
      </ul>
      <h2>Shop Menswear by Price</h2>
      <ul>
        <li><a href="/menswear?sub=under-200">Menswear Under $200</a> — Affordable premium ethnic wear</li>
        <li><a href="/menswear?sub=premium-300-plus">Premium Menswear $300+</a> — Designer & heavily embellished</li>
      </ul>
      <h2>Sherwanis for Grooms</h2>
      <p>Make a grand entrance on your wedding day with our designer sherwanis. Available in art silk, Banarasi jacquard, and velvet — each piece features intricate embroidery and expert tailoring for a regal look.</p>
      <h2>Kurta Sets & Indo-Western</h2>
      <p>Beyond sherwanis, explore our comfortable cotton and silk kurta pajama sets for festive gatherings, pujas, and casual ethnic wear. Our Indo-western collection blends traditional silhouettes with modern cuts for the contemporary Indian man.</p>
    `,
  },
  {
    path: '/jewelry',
    category: 'jewelry',
    title: 'Indian Bridal Jewelry Sets | Traditional Wedding Necklaces | LuxeMia',
    description: 'Shop Indian bridal jewelry sets online in USA. Traditional wedding necklaces, Kundan & polki sets. South Asian bridal jewelry with luxury craftsmanship.',
    h1: 'Kundan Bridal Jewelry Collection',
    content: `
      <p>Discover our handcrafted Kundan bridal jewelry collection — regal necklace sets, chokers, and full bridal sets featuring traditional Rajasthani stone-setting techniques. Each piece is designed for the modern NRI bride who wants to make a statement on her wedding day.</p>
      <h2>Shop Jewelry by Type</h2>
      <ul>
        <li><a href="/jewelry?sub=necklace-set">Necklace Sets</a> — Necklace with matching earrings</li>
        <li><a href="/jewelry?sub=choker">Chokers</a> — Close-fitting statement necklaces</li>
        <li><a href="/jewelry?sub=bridal-set">Bridal Sets</a> — Necklace, earrings, and maang tikka</li>
      </ul>
      <h2>Shop Jewelry by Price</h2>
      <ul>
        <li><a href="/jewelry?sub=under-100">Jewelry Under $100</a></li>
        <li><a href="/jewelry?sub=premium-100-plus">Jewelry $100+</a></li>
      </ul>
      <h2>Why Choose Kundan Jewelry for Your Wedding?</h2>
      <p>Kundan jewelry has been a cornerstone of Indian bridal adornment for centuries, prized for its regal appearance and the way it catches light from every angle. Each stone is hand-set using traditional Rajasthani techniques, with 24k gold foil framing that creates the signature Kundan look. Our collection offers the look of fine diamond jewelry at a fraction of the cost, making it perfect for brides who want a regal appearance without the investment of real diamonds.</p>
    `,
  },
  {
    path: '/blog',
    title: 'Blog | Indian Fashion Tips & Ethnic Wear Guides | LuxeMia',
    description: 'Expert guides on Indian wedding dresses, bridal lehengas, saree styles & ethnic fashion. Get insider tips from top stylists. Read now!',
    h1: 'LuxeMia Blog — Indian Wedding & Ethnic Fashion Guide',
    content: `
      <p>Expert guides on Indian wedding dresses, bridal lehengas, saree styling, and ethnic fashion trends for 2026.</p>
      <h2>Latest Articles</h2>
      <ul>
        <li><a href="/blog/how-to-wear-a-saree-step-by-step">How to Wear a Saree Step-by-Step: Complete Beginner Guide</a></li>
        <li><a href="/blog/best-lehenga-styles-indian-wedding-guests-usa-2026">Best Lehenga Styles for Indian Wedding Guests in USA (2026 Guide)</a></li>
        <li><a href="/blog/what-to-wear-south-asian-wedding-non-indian-guest">What to Wear to a South Asian Wedding as a Non-Indian Guest</a></li>
        <li><a href="/blog/diwali-outfit-ideas-nri-women-usa-canada-australia">Diwali Outfit Ideas for NRI Women in USA, Canada & Australia (2026)</a></li>
        <li><a href="/blog/kanjivaram-vs-banarasi-silk-sarees">Kanjivaram vs Banarasi Silk Sarees: Which Should You Buy?</a></li>
        <li><a href="/blog/indian-wedding-guest-outfits-men-usa-guide">Indian Wedding Guest Outfits for Men: Complete USA Guide (2026)</a></li>
        <li><a href="/blog/how-to-choose-salwar-kameez-body-type">How to Choose the Right Salwar Kameez for Your Body Type</a></li>
        <li><a href="/blog/custom-tailoring-indian-ethnic-wear-usa">Custom Tailoring Indian Ethnic Wear in USA: What You Need to Know</a></li>
        <li><a href="/blog/haldi-vs-mehendi-outfits-complete-guide">Haldi vs Mehendi Outfits: Complete Guide to Pre-Wedding Ceremony Fashion</a></li>
        <li><a href="/blog/how-to-care-for-silk-sarees-and-lehengas">How to Care for Silk Sarees & Lehengas: Complete Guide</a></li>
        <li><a href="/blog/sharara-suit-guide-2026-styles-fabrics">Sharara Suit Guide 2026: Styles & Fabrics</a></li>
        <li><a href="/blog/pakistani-suits-anarkali-shopping-guide">Pakistani Suits & Anarkali Shopping Guide</a></li>
        <li><a href="/blog/style-lehenga-choli-every-wedding-event">How to Style Lehenga Choli for Every Wedding Event</a></li>
        <li><a href="/blog/indian-wedding-season-2026-outfit-guide">Indian Wedding Season 2026 Outfit Guide</a></li>
        <li><a href="/blog/fabric-guide-indian-ethnic-wear-georgette-silk-chiffon">Fabric Guide: Indian Ethnic Wear — Georgette, Silk & Chiffon</a></li>
        <li><a href="/blog/indian-wedding-dress-complete-guide">Indian Wedding Dress Complete Guide</a></li>
        <li><a href="/blog/red-bridal-lehenga-trends-2026">Red Bridal Lehenga Trends 2026</a></li>
        <li><a href="/blog/how-to-choose-perfect-lehenga-wedding-2026">How to Choose the Perfect Lehenga for Your 2026 Wedding</a></li>
        <li><a href="/blog/lehenga-vs-sharara-vs-anarkali-comparison">Lehenga vs Sharara vs Anarkali: Complete Comparison</a></li>
        <li><a href="/blog/best-lehenga-colors-for-indian-skin-tone">Best Lehenga Colors for Every Indian Skin Tone</a></li>
        <li><a href="/blog/shipping-indian-clothes-usa-uk-canada-nri-guide">Shipping Indian Clothes to USA, UK & Canada: NRI Guide</a></li>
        <li><a href="/blog/unstitched-vs-ready-to-wear-vs-made-to-measure">Unstitched vs Ready to Wear vs Made to Measure</a></li>
      </ul>
    `,
  },
  {
    path: '/blog/sharara-suit-guide-2026-styles-fabrics',
    title: 'Sharara Suit Guide 2026: Latest Styles, Fabrics & Buying Tips | LuxeMia',
    description: 'Complete guide to sharara suits in 2026. Discover trending styles, best fabrics & expert tips for choosing the perfect sharara set for weddings & festivals.',
    h1: 'Sharara Suit Guide 2026: Styles, Fabrics & Buying Tips',
    content: '<p>Everything you need to know about sharara suits — trending styles, fabric choices, and how to pick the perfect set for weddings and festive occasions in 2026.</p>',
  },
  {
    path: '/blog/pakistani-suits-anarkali-shopping-guide',
    title: 'Pakistani Suits & Anarkali Shopping Guide | LuxeMia',
    description: 'Your complete guide to buying Pakistani suits and anarkali online. Learn about styles, fabrics, sizing, and where to find authentic designer pieces.',
    h1: 'Pakistani Suits & Anarkali Shopping Guide',
    content: '<p>Your complete guide to buying Pakistani suits and anarkali online. Learn about styles, fabrics, sizing, and where to find authentic designer pieces.</p>',
  },
  {
    path: '/blog/style-lehenga-choli-every-wedding-event',
    title: 'How to Style Lehenga Choli for Every Wedding Event | LuxeMia',
    description: 'Expert styling tips for wearing lehenga choli at every wedding event — from engagement to reception. Accessories, draping styles & outfit ideas.',
    h1: 'How to Style Lehenga Choli for Every Wedding Event',
    content: '<p>Expert styling tips for wearing lehenga choli at every wedding event — from engagement to reception. Accessories, draping styles & outfit ideas.</p>',
  },
  {
    path: '/blog/indian-wedding-season-2026-outfit-guide',
    title: 'Indian Wedding Season 2026: Complete Outfit Guide | LuxeMia',
    description: 'Plan your wardrobe for Indian wedding season 2026. Outfit ideas for every ceremony — sangeet, mehendi, haldi, wedding & reception.',
    h1: 'Indian Wedding Season 2026: Complete Outfit Guide',
    content: '<p>Plan your wardrobe for Indian wedding season 2026. Outfit ideas for every ceremony — sangeet, mehendi, haldi, wedding & reception.</p>',
  },
  {
    path: '/blog/fabric-guide-indian-ethnic-wear-georgette-silk-chiffon',
    title: 'Fabric Guide: Indian Ethnic Wear — Georgette, Silk & Chiffon | LuxeMia',
    description: 'Understand Indian ethnic wear fabrics. Compare georgette, silk, chiffon, organza, and more. Learn which fabric suits which occasion.',
    h1: 'Fabric Guide: Indian Ethnic Wear — Georgette, Silk & Chiffon',
    content: '<p>Understand Indian ethnic wear fabrics. Compare georgette, silk, chiffon, organza, and more. Learn which fabric suits which occasion and body type.</p>',
  },
  {
    path: '/blog/indian-wedding-dress-complete-guide',
    title: 'Indian Wedding Dress Complete Guide | LuxeMia Blog',
    description: 'The complete guide to Indian wedding dresses. Bridal lehengas, wedding sarees, reception outfits & guest attire. Everything you need to know.',
    h1: 'Indian Wedding Dress Complete Guide',
    content: '<p>The complete guide to Indian wedding dresses. From bridal lehengas to wedding sarees, reception outfits to guest attire — everything you need to plan your wedding wardrobe.</p>',
  },
  {
    path: '/blog/red-bridal-lehenga-trends-2026',
    title: 'Red Bridal Lehenga Trends 2026 | LuxeMia Blog',
    description: 'Discover the hottest red bridal lehenga trends for 2026. From classic crimson to modern scarlet, find your dream wedding lehenga.',
    h1: 'Red Bridal Lehenga Trends 2026',
    content: '<p>Discover the hottest red bridal lehenga trends for 2026. From classic crimson to modern scarlet, explore designer styles and find inspiration for your dream wedding lehenga.</p>',
  },
  {
    path: '/collections',
    category: 'all',
    title: 'All Collections | Indian Ethnic Wear | LuxeMia',
    description: 'Browse all LuxeMia collections. Bridal lehengas, wedding sarees, reception outfits, festive wear & more. Curated for every occasion.',
    h1: 'All Collections',
    content: `
      <p>Browse our curated collections of Indian ethnic wear, thoughtfully organized for every occasion.</p>
      <ul>
        <li><a href="/lehengas">Bridal Lehengas</a> — Bridal wear for your special day</li>
        <li><a href="/sarees">Wedding Sarees</a> — Elegant sarees for wedding celebrations</li>
        <li><a href="/suits">Salwar Kameez</a> — Anarkali, sharara & palazzo suits</li>
        <li><a href="/menswear">Menswear</a> — Sherwanis, kurta sets & Indo-western</li>
      </ul>
    `,
  },
  {
    path: '/products',
    title: 'All Products | Shop Indian Ethnic Wear Online | LuxeMia',
    description: 'Browse all products at LuxeMia. Designer lehengas, silk sarees, salwar suits, sherwanis & more. Free shipping to USA, Canada & Australia.',
    h1: 'All Products',
    content: `
      <p>Explore our complete collection of Indian ethnic wear. Designer lehengas, silk sarees, salwar suits, sherwanis and more — all with free shipping on orders over $350.</p>
      <h2>Shop by Category</h2>
      <p>Browse our full catalog organized by type: <a href="/lehengas">Lehengas</a>, <a href="/sarees">Sarees</a>, <a href="/suits">Salwar Kameez</a>, and <a href="/menswear">Menswear</a>. Use filters to sort by price, color, fabric, and occasion.</p>
      <p>Every piece is handcrafted by skilled Indian artisans and ships worldwide with full tracking. Free shipping on orders over $350 to USA, Canada, and Australia.</p>
    `,
  },
  {
    path: '/collections/bridal-lehengas',
    title: 'Bridal Lehenga Collection | Designer Wedding Lehengas | LuxeMia',
    description: 'Shop bridal lehengas at LuxeMia. Designer bridal lehenga choli in silk, velvet & net. Handcrafted embroidery, luxurious fabrics. Free shipping.',
    h1: 'Bridal Lehenga Collection',
    content: '<p>Discover our stunning bridal lehenga collection. Each piece is handcrafted with intricate embroidery on premium silk, velvet, and net fabrics. Find your dream bridal lehenga.</p>',
  },
  {
    path: '/collections/wedding-sarees',
    title: 'Wedding Saree Collection | Silk & Designer Sarees | LuxeMia',
    description: 'Shop wedding sarees at LuxeMia. Banarasi silk, Kanjeevaram & designer wedding sarees. Traditional craftsmanship, modern elegance. Free shipping.',
    h1: 'Wedding Saree Collection',
    content: '<p>Explore our curated wedding saree collection. From Banarasi silk to Kanjeevaram, each saree combines traditional craftsmanship with modern elegance for your special day.</p>',
  },
  {
    path: '/collections/reception-outfits',
    title: 'Reception Outfits | Glamorous Party Wear | LuxeMia',
    description: 'Shop reception outfits at LuxeMia. Glamorous gowns, designer lehengas & contemporary ethnic wear for wedding receptions. Stand out at every event.',
    h1: 'Reception Outfits Collection',
    content: '<p>Make a statement at wedding receptions with our glamorous collection. Designer lehengas, contemporary gowns, and elegant ethnic wear for the modern woman.</p>',
  },
  {
    path: '/collections/festive-wear',
    title: 'Festive Wear | Diwali, Eid & Celebration Outfits | LuxeMia',
    description: 'Shop festive wear at LuxeMia. Beautiful Indian outfits for Diwali, Eid, Navratri & celebrations. Sarees, lehengas, suits & more.',
    h1: 'Festive Wear Collection',
    content: '<p>Celebrate every occasion in style with our festive wear collection. Beautiful sarees, lehengas, and suits perfect for Diwali, Eid, Navratri, and all your special celebrations.</p>',
  },
  {
    path: '/our-story',
    title: 'Our Story — LuxeMia | Indian Ethnic Wear Online',
    description: 'Learn about LuxeMia — our mission to bring authentic Indian craftsmanship to the world. Handcrafted ethnic wear from skilled makers.',
    h1: 'Our Story',
    content: '<p>LuxeMia was born from a passion for preserving India\'s rich textile heritage while making Indian ethnic wear accessible worldwide. We work directly with skilled makers across India to bring you authentic, beautifully made pieces.</p>',
  },
  {
    path: '/size-guide',
    title: 'Size Guide — Indian Ethnic Wear Measurements | LuxeMia',
    description: 'LuxeMia size guide for Indian ethnic wear. Find your perfect fit with measurement charts for sarees, lehengas & suits. US & international conversions.',
    h1: 'Size Guide',
    content: '<p>Find your perfect fit with our detailed measurement charts. Includes bust, waist, and hip measurements with US and international size conversions for all garments including lehengas, sarees, and salwar suits.</p>',
  },
  {
    path: '/sizing-measurements-guide',
    title: 'How to Measure Blouse Size for Saree — Step-by-Step Sizing Guide | Luxemia',
    description: 'Complete guide on how to measure blouse size for saree, lehenga choli & custom ethnic wear. Step-by-step instructions, size charts & tips for the perfect fit.',
    h1: 'Sizing & Measurements Guide',
    content: '<p>Learn how to measure yourself accurately for saree blouses, lehenga cholis, and custom-stitched Indian ethnic wear. This step-by-step guide covers bust, under-bust, shoulder width, blouse length, armhole depth, sleeve length, waist, hips, and skirt length — with standard Indian size charts (32–48), tips for measuring over light clothing, and advice for between-size shoppers. Accurate measurements to the nearest half-inch ensure a perfect fit for both ready-to-wear and made-to-measure orders.</p>',
  },
  {
    path: '/care-guide',
    title: 'Care Guide — How to Care for Indian Ethnic Wear | LuxeMia',
    description: 'Expert tips on caring for Indian ethnic wear. Learn how to wash, store & maintain silk sarees, lehengas, and embroidered garments.',
    h1: 'Care Guide',
    content: '<p>Learn how to properly care for your precious Indian ethnic wear. Expert tips on washing, storing, and maintaining silk sarees, embroidered lehengas, and delicate fabrics.</p>',
  },
  {
    path: '/faq',
    title: 'Frequently Asked Questions | LuxeMia',
    description: 'Find answers to common questions about LuxeMia — shipping, returns, sizing, custom orders, fabrics & more.',
    h1: 'Frequently Asked Questions',
    content: '<p>Find answers to common questions about LuxeMia orders, shipping, returns, sizing, custom stitching, fabrics, and more.</p>',
  },
  {
    path: '/shipping',
    title: 'Shipping Information — USA, Canada & Australia | LuxeMia',
    description: 'LuxeMia ships to USA, Canada, and Australia. Flat rate $25 per order. Free shipping on orders over $350. Delivery 7-10 business days.',
    h1: 'Shipping Information',
    content: '<p>LuxeMia ships to the USA, Canada, and Australia with full tracking. Flat rate $25 per order. Free shipping on orders over $350. Standard delivery takes 7-10 business days.</p>',
  },
  {
    path: '/pages/shipping-customs',
    title: 'Shipping & Customs | Import Duties & Local Taxes | LuxeMia',
    description: 'Learn how international shipping & customs work at LuxeMia. Import duties, local taxes & customs clearance for orders to USA, Canada & Australia.',
    h1: 'Shipping & Customs',
    content: `
      <p>We ship internationally to the USA, Canada, Australia, and beyond, with each order sent directly from our workshop in India.</p>
      <h2>Do I have to pay customs duties or import taxes?</h2>
      <p>Depending on your country's import regulations, your order may be subject to customs duties, import taxes, or clearance fees when it arrives. These charges are set by your local customs authority — not by LuxeMia — and are separate from the price you pay at checkout.</p>
      <p>Whether you're charged, and how much, depends on factors like your country's current duty threshold, the declared value of your order, and local trade rules, which can change over time.</p>
      <h2>When would I need to pay?</h2>
      <p>If applicable, these charges are usually collected by the shipping carrier at the time of delivery, not at checkout. Your carrier will typically contact you directly if any payment is required before your package can be delivered.</p>
      <h2>Want to check in advance?</h2>
      <p>Import rules vary by country and can change, so if you'd like to know what to expect before ordering, we recommend checking directly with your local customs office or postal service.</p>
      <h2>Questions?</h2>
      <p>If you have any questions about your order or shipping, feel free to reach out to us at <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> — we're happy to help.</p>
      <p>Looking for shipping rates, delivery times, or tracking? See our <a href="/shipping">Shipping Policy</a>.</p>
    `,
  },
  {
    path: '/returns',
    title: 'Returns, Refunds & Cancellations | LuxeMia',
    description: 'LuxeMia returns policy. All sales are final. No returns or exchanges except for genuine shipping damage with mandatory unboxing video.',
    h1: 'Returns, Refunds & Cancellations',
    content: '<p>All sales are final. LuxeMia does not accept returns or exchanges for any reason, including sizing issues or colour variations. The only exception is genuine shipping damage, which must be supported by a mandatory unboxing video reported within 48 hours. Orders can be cancelled within 24 hours of placement.</p>',
  },
  {
    path: '/contact',
    title: 'Contact Us | LuxeMia',
    description: 'Get in touch with LuxeMia. Contact us for questions about orders, custom stitching, sizing, or anything else. We\'re here to help.',
    h1: 'Contact Us',
    content: '<p>Have questions about your order, sizing, or custom stitching? We\'re here to help. Reach us via email, WhatsApp, or the contact form below.</p>',
  },
  // --- Additional routes previously missing from prerender ---
  {
    path: '/lookbook',
    title: 'Lookbook 2026 — LuxeMia | Editorial Indian Ethnic Wear',
    description: 'Explore the LuxeMia 2026 Lookbook — curated styling stories with wedding lehengas & festive ethnic wear. Editorial inspiration for the modern Indian wardrobe.',
    h1: 'Lookbook 2026',
    content: `
      <p>The LuxeMia 2026 Lookbook is a series of styling chapters that celebrate the modern Indian wardrobe — from intimate haldi mornings to grand reception nights.</p>
      <h2>Wedding Season</h2>
      <p>From the bride's grand lehenga to the groom's regal sherwani — curated ensembles for every wedding ceremony, from mehendi to reception.</p>
      <h2>Eid Collection</h2>
      <p>Celebrate in style with flowing shararas and elegant palazzo suits — graceful silhouettes in luxurious georgette, chinon, and net fabrics.</p>
      <h2>Festive Favorites</h2>
      <p>A curated mix of our most-loved pieces across categories — versatile outfits that transition effortlessly from festive gatherings to celebrations.</p>
      <h2>His & Hers</h2>
      <p>Perfectly paired looks for couples — elegant kurta pajamas and jodhpuri suits alongside complementing lehengas and sharara sets.</p>
    `,
  },
  {
    path: '/brand-story',
    title: 'Our Story — LuxeMia | Indian Ethnic Wear Online',
    description: 'Learn about LuxeMia — our mission to bring authentic Indian craftsmanship to the world. Handcrafted ethnic wear from skilled makers.',
    h1: 'Our Story',
    content: `
      <p>LuxeMia was born from a passion for preserving India's rich textile heritage while making Indian ethnic wear accessible worldwide. We work directly with skilled makers across India to bring you authentic, beautifully made pieces.</p>
      <h2>Our Mission</h2>
      <p>We believe every Indian — no matter where they live — deserves access to authentic, handcrafted ethnic wear. Our mission is to bridge the gap between India's master artisans and the global Indian diaspora, delivering museum-quality craftsmanship to your doorstep.</p>
      <h2>Why LuxeMia?</h2>
      <p>Unlike mass-produced fast fashion, each LuxeMia piece supports real artisans and preserves centuries-old techniques. We offer custom sizing, free shipping on orders over $350, and a curated selection that honors tradition while embracing modern design.</p>
    `,
  },
  {
    path: '/new-arrivals',
    category: 'all',
    title: 'New Arrivals — Latest Indian Ethnic Wear Collection | LuxeMia',
    description: 'Shop the latest arrivals at LuxeMia. New designer lehengas, sarees & suits added weekly. Free shipping over $350 to USA, Canada & Australia.',
    h1: 'New Arrivals',
    content: `
      <p>Discover the newest additions to our collection. Fresh styles of designer lehengas, silk sarees, and anarkali suits — handcrafted and shipped worldwide.</p>
      <h2>What's New</h2>
      <p>We add new styles every week, from bridal lehengas and Banarasi silk sarees to trendy palazzo suits and groom sherwanis. Each new arrival features the latest embroidery techniques, color palettes, and fabric innovations for 2026.</p>
      <p>Sign up for our newsletter to be the first to know when new collections drop. Free shipping on all new arrivals to USA, Canada, and Australia.</p>
    `,
  },
  {
    path: '/bestsellers',
    category: 'all',
    title: 'Bestsellers — Most Loved Indian Ethnic Wear | LuxeMia',
    description: 'Shop LuxeMia bestsellers. Our most popular lehengas, sarees & suits chosen by customers worldwide. Free shipping over $350 to USA, Canada & Australia.',
    h1: 'Bestsellers',
    content: `
      <p>Browse our most-loved pieces — the lehengas, sarees, and suits that our customers can't stop buying. Tried, tested, and loved worldwide.</p>
      <h2>Customer Favorites</h2>
      <p>Our bestsellers are curated based on real customer purchases and reviews. From bridal lehengas that steal the show to everyday silk sarees that never go out of style, these are the pieces our community recommends most.</p>
      <p>Every bestseller comes with free shipping on orders over $350. Flat rate $25 per order otherwise. All sales final — damage claims accepted within 48h with unboxing video.</p>
    `,
  },
  {
    path: '/indowestern',
    category: 'indowestern',
    title: 'Indo-Western Collection — Fusion Ethnic Wear | LuxeMia',
    description: 'Shop Indo-Western fusion wear at LuxeMia. Modern ethnic suits, fusion lehengas & contemporary Indian outfits. Free shipping over $350 to USA & Canada.',
    h1: 'Indo-Western Collection',
    content: `
      <p>Where tradition meets modernity. Explore our Indo-Western collection featuring fusion silhouettes, contemporary cuts, and ethnic embellishments for the modern woman.</p>
      <h2>Fusion Style</h2>
      <p>Our Indo-Western collection blends the elegance of Indian craftsmanship with contemporary global fashion. Think asymmetrical hemlines, cape-style dupattas, dhoti pants paired with crop tops, and jacket-style anarkalis.</p>
      <p>Perfect for sangeet nights, cocktail parties, and modern wedding celebrations where you want to stand out with a unique fusion look. Free shipping on orders over $350 to USA, Canada & Australia.</p>
    `,
  },
  {
    path: '/nri',
    title: 'NRI Indian Ethnic Wear — Shop Indian Clothes Abroad | LuxeMia',
    description: 'Indian ethnic wear for NRIs. Shop bridal lehengas, wedding sarees & festive outfits from abroad. Free shipping to USA, Canada & Australia.',
    h1: 'NRI Collection',
    content: `
      <p>Curated for the global Indian. Shop authentic ethnic wear from anywhere in the world with free shipping to USA, Canada, and Australia. No compromises on quality or authenticity.</p>
      <h2>Shop by Region</h2>
      <ul>
        <li><a href="/nri/usa">Indian Ethnic Wear for USA</a> — Free shipping across America</li>
        <li><a href="/nri/canada">Indian Ethnic Wear for Canada</a> — Free shipping coast to coast</li>
      </ul>
      <h2>Why NRIs Love LuxeMia</h2>
      <p>Living abroad doesn't mean you have to settle for less. We deliver authentic, handcrafted Indian ethnic wear directly from our artisans to your doorstep — no middlemen, no compromises. Custom sizing available on all outfits.</p>
    `,
  },
  {
    path: '/indian-ethnic-wear-usa',
    title: 'Indian Ethnic Wear USA — Buy Indian Clothes Online in America | LuxeMia',
    description: 'Shop Indian ethnic wear online in the USA. Bridal lehengas, silk sarees, salwar suits with free shipping across America. Authentic Indian craftsmanship.',
    h1: 'Indian Ethnic Wear USA',
    content: `
      <p>Shopping for Indian ethnic wear in the USA? LuxeMia offers authentic bridal lehengas, silk sarees, and designer suits with free shipping across America.</p>
      <h2>Free Shipping to the USA</h2>
      <p>Enjoy free standard shipping on orders over $350 to the contiguous United States. Most orders arrive within 7-12 business days via DHL Express with full tracking. Express shipping (3-5 days) also available.</p>
      <h2>Duty-Free Under $800</h2>
      <p>Most individual orders under $800 enter the US duty-free under the de minimis threshold. No hidden customs fees or surprises at delivery.</p>
      <h2>Shop Our USA Collection</h2>
      <p>Browse <a href="/lehengas">bridal lehengas</a>, <a href="/sarees">designer sarees</a>, <a href="/suits">salwar kameez</a>, and <a href="/menswear">sherwanis</a> — all handcrafted in India and shipped directly to your US address.</p>
    `,
  },
  {
    path: '/indian-ethnic-wear-canada',
    title: 'Indian Ethnic Wear Canada — Buy Indian Clothes Online | LuxeMia',
    description: 'Shop Indian ethnic wear online in Canada. Bridal lehengas, silk sarees, salwar suits with free shipping across Canada. Authentic Indian craftsmanship.',
    h1: 'Indian Ethnic Wear Canada',
    content: `
      <p>Shopping for Indian ethnic wear in Canada? LuxeMia delivers authentic bridal lehengas, silk sarees, and designer suits with free shipping across Canada.</p>
      <h2>Free Shipping Coast to Coast</h2>
      <p>Enjoy free standard shipping on orders over $350 to every Canadian province and territory. Standard delivery takes 10-14 business days with full tracking. Express shipping (5-7 days) also available.</p>
      <h2>Canadian Customs Information</h2>
      <p>Canadian customs may charge GST/HST (5-15% depending on province) and import duties on textile imports. These charges are collected by the carrier at delivery.</p>
      <h2>Shop Our Canada Collection</h2>
      <p>Browse <a href="/lehengas">bridal lehengas</a>, <a href="/sarees">designer sarees</a>, <a href="/suits">salwar kameez</a>, and <a href="/menswear">sherwanis</a> — handcrafted in India and delivered across Canada.</p>
    `,
  },
  // --- NRI sub-pages ---
  {
    path: '/nri/usa',
    title: 'Indian Ethnic Wear USA — Free Shipping to America | LuxeMia',
    description: 'Shop Indian ethnic wear online in the USA. Bridal lehengas, silk sarees & salwar suits with free shipping across America. Duty-free under $800.',
    h1: 'Indian Ethnic Wear for USA',
    content: `
      <p>LuxeMia delivers authentic Indian ethnic wear straight to your doorstep in the USA. Shop bridal lehengas, silk sarees, salwar kameez, and designer sherwanis with free shipping on orders over $350.</p>
      <h2>Free Shipping Across America</h2>
      <p>Standard shipping takes 7-12 business days via DHL Express with full tracking. Express shipping (3-5 business days) is also available at checkout. Free standard shipping on all orders over $350 to the contiguous United States.</p>
      <h2>Duty-Free Under $800</h2>
      <p>Most individual orders under $800 enter the US duty-free under the de minimis threshold. No hidden customs fees or surprises at delivery. Orders over $800 may be subject to import duties.</p>
      <h2>Shop by Category</h2>
      <ul>
        <li><a href="/lehengas">Bridal Lehengas</a> — Designer lehenga choli for your wedding</li>
        <li><a href="/sarees">Silk Sarees</a> — Banarasi, Kanjeevaram & designer sarees</li>
        <li><a href="/suits">Salwar Kameez</a> — Anarkali, sharara & palazzo suits</li>
        <li><a href="/menswear">Sherwanis</a> — Groom wear & kurta sets</li>
      </ul>
      <p>Custom sizing available on all outfits. Returns not accepted — all sales final. Damage claims within 48h with unboxing video.</p>
    `,
  },
  {
    path: '/nri/canada',
    title: 'Indian Ethnic Wear Canada — Free Shipping Across Canada | LuxeMia',
    description: 'Shop Indian ethnic wear online in Canada. Bridal lehengas, silk sarees & salwar suits with free shipping coast to coast. 10-14 day delivery.',
    h1: 'Indian Ethnic Wear for Canada',
    content: `
      <p>LuxeMia delivers authentic Indian ethnic wear to Canada. Shop bridal lehengas, silk sarees, salwar kameez, and designer sherwanis with free shipping on orders over $350.</p>
      <h2>Free Shipping Coast to Coast</h2>
      <p>Standard shipping takes 10-14 business days with full tracking. We deliver to all Canadian provinces and territories including British Columbia, Alberta, Ontario, and Quebec. Express shipping (5-7 days) also available.</p>
      <h2>Canadian Customs Information</h2>
      <p>Canadian customs may charge GST/HST (5-15% depending on province) and import duties on textile imports. These charges are collected by the carrier at delivery. Every package is fully insured.</p>
      <h2>Shop by Category</h2>
      <ul>
        <li><a href="/lehengas">Bridal Lehengas</a> — Designer lehenga choli for your wedding</li>
        <li><a href="/sarees">Silk Sarees</a> — Banarasi, Kanjeevaram & designer sarees</li>
        <li><a href="/suits">Salwar Kameez</a> — Anarkali, sharara & palazzo suits</li>
        <li><a href="/menswear">Sherwanis</a> — Groom wear & kurta sets</li>
      </ul>
      <p>Custom sizing available on all outfits. Returns not accepted — all sales final. Damage claims within 48h with unboxing video.</p>
    `,
  },
  // --- Occasion landing pages ---
  {
    path: '/collections/diwali-outfits',
    title: 'Diwali Outfits for Women 2026 — Indian Ethnic Wear for Diwali | LuxeMia',
    description: 'Shop Diwali outfits for women at LuxeMia. Lehengas, anarkali suits & sarees in gold, red & festive colors. Free shipping to USA, Canada & Australia.',
    h1: 'Diwali Outfits 2026',
    content: `
      <p>Celebrate the festival of lights in style with LuxeMia's festive Indian ethnic wear. From gold-embroidered lehengas and embellished anarkali suits to silk sarees and festive salwar kameez, our Diwali collection captures the warmth, colour, and tradition of this cherished celebration.</p>
      <h2>What to Wear for Diwali</h2>
      <p>Diwali calls for your most festive, vibrant ethnic wear. For the main Diwali day and Lakshmi Puja, traditional silk sarees in red, gold, or green are considered auspicious. For Diwali parties and evening celebrations, a heavily embellished lehenga with mirror work, zari embroidery, or sequin detailing photographs beautifully against the backdrop of diyas and fairy lights.</p>
      <h2>Diwali Outfit Colors</h2>
      <p>Gold is the quintessential Diwali color — representing prosperity and the blessing of Goddess Lakshmi. Red, deep green, royal purple, burnt orange, and navy blue are also widely worn. Fabrics with gold zari work, sequin embellishments, or mirror details catch the Diwali diyas beautifully.</p>
      <h2>Shop Diwali Outfits</h2>
      <ul>
        <li><a href="/lehengas">Bridal Lehengas</a> — Embellished lehengas perfect for Diwali</li>
        <li><a href="/sarees">Silk Sarees</a> — Banarasi and silk sarees for Diwali puja</li>
        <li><a href="/suits">Anarkali Suits</a> — Festive anarkali suits for Diwali celebrations</li>
        <li><a href="/indowestern">Indo-Western</a> — Modern Diwali party outfits</li>
      </ul>
      <p>Free shipping on orders over $350 to USA, Canada, and Australia. Standard delivery 7-10 business days.</p>
    `,
  },
  {
    path: '/collections/wedding-guest-outfits',
    title: 'Indian Wedding Guest Outfits — What to Wear to an Indian Wedding | LuxeMia',
    description: 'Shop Indian wedding guest outfits at LuxeMia. Sarees, anarkali suits, lehengas & salwar kameez. Free shipping to USA, Canada & Australia.',
    h1: 'Indian Wedding Guest Outfits',
    content: `
      <p>Dress to impress at every Indian wedding ceremony — from the colourful mehendi and vibrant sangeet to the elegant wedding day and glamorous reception. LuxeMia's wedding guest collection features silk sarees, embroidered anarkali suits, festive lehengas, and salwar kameez sets in celebration-worthy fabrics and colours.</p>
      <h2>What to Wear to Each Indian Wedding Ceremony</h2>
      <p>The mehendi is a daytime ceremony calling for bright, cheerful outfits in yellow, lime green, orange, or floral prints. The sangeet is the most festive ceremony — wear your most glamorous embellished lehengas or sequin anarkalis. The main wedding ceremony is the most formal — avoid red (the bridal colour) and white. The reception is the most flexible — semi-formal to formal ethnic or indo-western outfits are appropriate.</p>
      <h2>Shop by Ceremony</h2>
      <ul>
        <li><a href="/lehengas">Bridal Lehengas</a> — Wedding guest lehengas for the main ceremony</li>
        <li><a href="/sarees">Silk Sarees</a> — Wedding guest sarees for formal ceremonies</li>
        <li><a href="/suits">Anarkali Suits</a> — Versatile suits for multiple wedding ceremonies</li>
        <li><a href="/collections/mehendi-outfits">Mehendi Outfits</a> — Bright and festive mehendi ceremony wear</li>
      </ul>
      <p>Free shipping on orders over $350 to USA, Canada, and Australia. Standard delivery 7-10 business days.</p>
    `,
  },
  {
    path: '/collections/mehendi-outfits',
    title: 'Mehendi Ceremony Outfits — Yellow, Green & Festive Indian Ethnic Wear | LuxeMia',
    description: 'Shop mehendi ceremony outfits at LuxeMia. Yellow & green lehengas, anarkali suits & salwar kameez. Free shipping to USA, Canada & Australia.',
    h1: 'Mehendi Ceremony Outfits',
    content: `
      <p>Celebrate the joyful mehendi ceremony in vibrant, festive Indian ethnic wear. Our mehendi collection features bright yellow and green lehengas, floral salwar kameez sets, embroidered anarkali suits, and light georgette sarees — all in the cheerful colours traditionally associated with henna celebrations.</p>
      <h2>Mehendi Ceremony Colours</h2>
      <p>Yellow and green are the signature colours of mehendi ceremonies in most Indian cultures — yellow representing turmeric (haldi) and new beginnings, green representing the mehendi plant itself. Mustard, saffron orange, lime green, coral, and floral prints are all popular choices for mehendi guests.</p>
      <h2>Fabric Guide for Mehendi</h2>
      <p>Since mehendi ceremonies are often held outdoors, light breathable fabrics like georgette, chiffon, cotton, crepe, and rayon are ideal. Look for light embroidery, gota patti work, mirror detailing, and block print rather than heavy zari for a mehendi-appropriate outfit.</p>
      <ul>
        <li><a href="/lehengas">Yellow Lehengas</a> — Traditional bridal mehendi lehengas</li>
        <li><a href="/suits">Floral Anarkali Suits</a> — Light anarkali suits for mehendi</li>
        <li><a href="/collections/wedding-guest-outfits">Wedding Guest Outfits</a> — All wedding ceremony outfits</li>
      </ul>
      <p>Free shipping on orders over $350 to USA, Canada, and Australia. Standard delivery 7-10 business days.</p>
    `,
  },
  {
    path: '/collections/eid-outfits',
    title: 'Eid Outfits 2026 — Indian Ethnic Wear for Eid | LuxeMia',
    description: 'Shop Eid outfits 2026 at LuxeMia. Chikankari suits, sharara sets, anarkali & lehengas in pastel & white. Free shipping to USA, Canada & Australia.',
    h1: 'Eid Outfits 2026',
    content: `
      <p>Celebrate Eid in elegance with LuxeMia's curated collection of Indian ethnic wear for Eid festivities. From delicate chikankari salwar kameez and embroidered sharara sets to pastel lehengas and georgette anarkali suits, our Eid collection brings together the finest South Asian fashion traditions.</p>
      <h2>What to Wear for Eid</h2>
      <p>Eid is celebrated twice a year — Eid Ul-Fitr (marking the end of Ramadan) and Eid Ul-Adha. For Eid morning prayers, a modest and elegant salwar kameez or anarkali suit in white, cream, or pastel shades is most appropriate. For afternoon and evening celebrations, more embellished outfits are worn. Chikankari embroidery — the intricate shadow-work embroidery from Lucknow — is considered the quintessential Eid fabric.</p>
      <h2>Eid Outfit Colors</h2>
      <p>White, pastels, and light shades are traditionally associated with Eid as symbols of purity and new beginnings. Ivory, cream, baby pink, mint green, sky blue, lilac, and peach are classic Eid outfit colours. Gold and silver embellishments on any colour are considered festive and celebratory.</p>
      <ul>
        <li><a href="/suits">Chikankari Salwar Kameez</a> — Traditional Eid salwar kameez</li>
        <li><a href="/lehengas">Pastel Lehengas</a> — Embroidered lehengas for Eid</li>
        <li><a href="/collections/wedding-guest-outfits">Wedding Guest Outfits</a> — More festive occasion wear</li>
      </ul>
      <p>Free shipping on orders over $350 to USA, Canada, and Australia. Order 3-4 weeks before Eid for timely delivery.</p>
    `,
  },
  {
    path: '/collections/navratri-outfits',
    title: 'Navratri Outfits 2026 — Chaniya Choli & Garba Dress Collection | LuxeMia',
    description: 'Shop Navratri outfits 2026 at LuxeMia. Chaniya choli, garba lehengas & festive ethnic wear in all nine Navratri colours. Free shipping to USA & Canada.',
    h1: 'Navratri Outfits — Chaniya Choli & Garba Dress Collection',
    content: `
      <p>Celebrate nine nights of Garba and Dandiya Raas in the most vibrant Indian ethnic wear. LuxeMia's Navratri collection features traditional chaniya cholis in mirror work and bandhani prints, festive lehengas in all nine Navratri colours, embroidered salwar kameez, and anarkali suits that move beautifully on the dance floor.</p>
      <h2>What is a Chaniya Choli?</h2>
      <p>The chaniya choli is the quintessential Navratri outfit — a three-piece set comprising a circular flared skirt (chaniya), a fitted blouse (choli), and a dupatta. The chaniya is traditionally cut in a full circle to allow maximum flare during spinning, and is adorned with mirror work (shisha embroidery), bandhani tie-dye prints, gota patti, or heavy embroidery. Lightweight fabrics like georgette, rayon, cotton, and net are preferred for the dance floor.</p>
      <h2>Nine Colors of Navratri 2026</h2>
      <p>Each of the nine nights of Navratri 2026 is associated with a specific colour linked to the nine forms of Goddess Durga. The sequence typically follows: Royal Blue, Green, Grey, Orange, White, Red, Royal Blue, Pink, and Purple. Many participants plan nine separate Navratri outfits in each day's colour.</p>
      <ul>
        <li><a href="/lehengas">Navratri Lehengas</a> — Festive lehengas for Garba</li>
        <li><a href="/suits">Anarkali Suits</a> — Flowing anarkalis for Navratri</li>
        <li><a href="/collections/diwali-outfits">Diwali Outfits</a> — More festive occasion wear</li>
      </ul>
      <p>Free shipping on orders over $350 to USA, Canada, and Australia. Standard delivery 7-10 business days.</p>
    `,
  },
  {
    path: '/style-consultation',
    title: 'Style Consultation — Personal Styling for Indian Ethnic Wear | LuxeMia',
    description: 'Book a free style consultation with LuxeMia. Get personalized recommendations for lehengas, sarees & suits from our expert stylists.',
    h1: 'Style Consultation',
    content: '<p>Not sure what to wear? Our expert stylists are here to help. Book a free consultation and get personalized recommendations for your occasion, body type, and budget.</p>',
  },
  {
    path: '/style-quiz',
    title: 'Style Quiz — Find Your Perfect Indian Outfit | LuxeMia',
    description: 'Take the LuxeMia style quiz to discover your perfect Indian outfit. Personalized recommendations based on your taste, occasion & budget.',
    h1: 'Style Quiz',
    content: '<p>Discover your signature ethnic style. Answer a few questions and we\'ll recommend the perfect lehenga, saree, or suit for you.</p>',
  },
  {
    path: '/artisans',
    title: 'Our Artisans — Meet the Makers Behind LuxeMia',
    description: 'Meet the skilled Indian artisans behind LuxeMia. Learn about traditional weaving, embroidery & craft techniques passed down through generations.',
    h1: 'Our Artisans',
    content: '<p>Behind every LuxeMia piece is a master artisan. Learn about the traditional weaving, embroidery, and craft techniques that make our ethnic wear truly special.</p>',
  },
  {
    path: '/sustainability',
    title: 'Sustainability — Ethical Indian Ethnic Wear | LuxeMia',
    description: 'LuxeMia\'s commitment to sustainable & ethical fashion. Fair trade practices, eco-friendly packaging, and supporting artisan communities.',
    h1: 'Sustainability',
    content: '<p>We believe quality and responsibility go hand in hand. Learn about our fair trade practices, eco-friendly packaging, and commitment to artisan communities.</p>',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | LuxeMia',
    description: 'LuxeMia privacy policy. How we collect, use, and protect your personal information when you shop with us.',
    h1: 'Privacy Policy',
    content: '<p>Your privacy matters to us. Read our full privacy policy to understand how we collect, use, and protect your personal information.</p>',
  },
  {
    path: '/terms',
    title: 'Terms of Service | LuxeMia',
    description: 'LuxeMia terms of service. Our policies for orders, shipping, returns, and use of the LuxeMia website.',
    h1: 'Terms of Service',
    content: '<p>Read our terms of service for information about orders, shipping, returns, and use of the LuxeMia website.</p>',
  },
  {
    path: '/press',
    title: 'Press — LuxeMia in the Media | Indian Ethnic Wear Online',
    description: 'LuxeMia in the media. Press coverage, brand mentions, and news features about our Indian ethnic wear collection.',
    h1: 'Press',
    content: '<p>See what the media is saying about LuxeMia. Press coverage, brand mentions, and news features about our Indian ethnic wear collection.</p>',
  },
  // --- Missing blog posts ---
  {
    path: '/blog/designer-wedding-dress-under-50000',
    title: 'Designer Wedding Dress Under 50000 — Best Bridal Options | LuxeMia',
    description: 'Find stunning designer wedding dresses under 50000. Best bridal lehengas, sarees & suits for budget-conscious brides without compromising on style.',
    h1: 'Designer Wedding Dress Under 50000',
    content: '<p>Looking for a designer wedding dress under 50000? Discover our curated selection of bridal lehengas and sarees that deliver quality at an accessible price point.</p>',
  },
  {
    path: '/blog/wedding-guest-outfit-ideas',
    title: 'Wedding Guest Outfit Ideas — What to Wear to an Indian Wedding | LuxeMia',
    description: 'Wedding guest outfit ideas for Indian weddings. Sarees, lehengas, suits & fusion wear for every ceremony. Style tips for guests.',
    h1: 'Wedding Guest Outfit Ideas',
    content: '<p>Not sure what to wear as a wedding guest? Get outfit ideas for every ceremony — from mehendi to reception. Sarees, lehengas, suits & fusion wear for every style.</p>',
  },
  {
    path: '/blog/saree-draping-styles-every-occasion',
    title: 'Saree Draping Styles for Every Occasion | LuxeMia',
    description: 'Learn different saree draping styles for every occasion. Nivi, Bengali, Gujarati, & modern draping techniques with step-by-step guides.',
    h1: 'Saree Draping Styles for Every Occasion',
    content: '<p>Master the art of saree draping. From classic Nivi style to modern butterfly drape, learn step-by-step techniques for every occasion and body type.</p>',
  },
  {
    path: '/blog/indian-wedding-trends-2026',
    title: 'Indian Wedding Trends 2026 — Colors, Fabrics & Styles | LuxeMia',
    description: 'Discover the top Indian wedding trends for 2026. Trending colors, fabrics, lehenga styles, and bridal fashion predictions for the upcoming season.',
    h1: 'Indian Wedding Trends 2026',
    content: '<p>Stay ahead of the curve with our guide to Indian wedding trends for 2026. From pastel lehengas to sustainable fabrics, discover what\'s hot this wedding season.</p>',
  },
  {
    path: '/blog/lehenga-color-for-dark-skin',
    title: 'Best Lehenga Colors for Dark Skin — Flattering Shades & Styling Tips | LuxeMia',
    description: 'Find the best lehenga colors for dark skin tones. Expert-recommended shades, styling tips, and outfit ideas that flatter and enhance your natural glow.',
    h1: 'Best Lehenga Colors for Dark Skin',
    content: '<p>Discover lehenga colors that beautifully complement dark skin tones. From rich jewel tones to warm earthy shades, find your perfect match.</p>',
  },
  {
    path: '/blog/wedding-saree-for-mother-of-bride',
    title: 'Wedding Saree for Mother of the Bride — Elegant Options | LuxeMia',
    description: 'Find the perfect wedding saree for the mother of the bride. Elegant silk, Banarasi & designer sarees for the most important guest at the wedding.',
    h1: 'Wedding Saree for Mother of the Bride',
    content: '<p>The mother of the bride deserves something special. Explore our curated selection of elegant silk and Banarasi sarees perfect for this honored role.</p>',
  },
  {
    path: '/blog/designer-wedding-dress-under-500',
    title: 'Wedding Dress Under $500 — Affordable Elegance | LuxeMia',
    description: 'Find a designer wedding dress under $500. Affordable bridal lehengas, sarees & suits that look expensive without breaking the bank.',
    h1: 'Designer Wedding Dress Under $500',
    content: '<p>A stunning wedding outfit doesn\'t have to cost a fortune. Discover our handpicked selection of designer lehengas and sarees under $500 that deliver elegance for less.</p>',
  },
  {
    path: '/blog/kanchipuram-silk-saree-south-indian-wedding-guide',
    title: 'Kanchipuram Silk Sarees: South Indian Wedding Guide | LuxeMia Blog',
    description: 'Complete guide to Kanchipuram (Kanjivaram) silk sarees — history, authentication with GI tags, pricing, bridal styling, and care tips for South Indian weddings.',
    h1: 'Kanchipuram Silk Sarees: The Ultimate South Indian Wedding Guide',
    content: '<p>The Kanchipuram silk saree (also called Kanjivaram) is the finest silk saree in India and the traditional choice for South Indian brides. Woven in Kanchipuram, Tamil Nadu for over 400 years, these sarees feature pure mulberry silk, real zari threads, and an interlocked-weft technique that makes the border and body inseparable. Authentic Kanchipuram sarees carry a GI tag with a unique serial number. Prices range from $200 for simple festive styles to $2,000+ for heavy bridal pieces. South Indian brides traditionally wear a 9-yard Kanchipuram in auspicious colors like arakku red, maroon, or yellow, with heavy temple border designs. For festive occasions, lighter Kanchipuram sarees in royal blue, emerald green, or mango yellow are popular. Always dry-clean Kanchipuram silk and store in muslin cloth with neem leaves to preserve the zari for generations.</p>',
  },
  {
    path: '/blog/nri-wedding-ethnic-wear-trends-2026',
    title: 'NRI Wedding Ethnic Wear Trends 2026 | LuxeMia',
    description: 'NRI wedding ethnic wear trends for 2026. Fusion styles, destination wedding outfits & practical tips for Indians abroad planning their wedding.',
    h1: 'NRI Wedding Ethnic Wear Trends 2026',
    content: '<p>Planning a wedding abroad? Discover the latest ethnic wear trends for NRIs in 2026 — from fusion silhouettes to destination wedding outfits.</p>',
  },
  {
    path: '/blog/buy-authentic-indian-sarees-online-international',
    title: 'How to Buy Authentic Indian Sarees Online Internationally | LuxeMia',
    description: 'Guide to buying authentic Indian sarees online internationally. Tips for spotting fakes, choosing the right fabric, and finding trusted sellers.',
    h1: 'How to Buy Authentic Indian Sarees Online',
    content: '<p>Buying Indian sarees online from abroad? Learn how to spot authentic handloom, choose the right fabric, and find trusted sellers who ship to USA, Canada, and Australia.</p>',
  },
  {
    path: '/blog/styling-indian-ethnic-wear-festive-occasions-abroad',
    title: 'Styling Indian Ethnic Wear for Festive Occasions Abroad | LuxeMia',
    description: 'How to style Indian ethnic wear for festive occasions abroad. Diwali, Eid, Navratri & wedding outfit ideas for Indians living overseas.',
    h1: 'Styling Indian Ethnic Wear Abroad',
    content: '<p>Celebrating festivals abroad? Get styling ideas for Diwali, Eid, Navratri and more — outfit combinations that work for both traditional and modern settings.</p>',
  },
  // --- New 2026 SEO blog posts ---
  {
    path: '/blog/how-to-choose-perfect-lehenga-wedding-2026',
    title: 'How to Choose the Perfect Lehenga for Your 2026 Wedding | LuxeMia',
    description: 'Step-by-step guide to choosing the perfect bridal lehenga for your 2026 wedding. Body type, fabric, color, embroidery & budget tips from LuxeMia stylists.',
    h1: 'How to Choose the Perfect Lehenga for Your 2026 Wedding',
    content: '<p>The complete bridal guide to choosing your dream lehenga in 2026. Learn how to pick the right silhouette for your body type, the best fabric for your wedding season, color choices for every skin tone, and how to plan your budget — from a stylist who has dressed hundreds of brides.</p>',
  },
  {
    path: '/blog/lehenga-vs-sharara-vs-anarkali-comparison',
    title: 'Lehenga vs Sharara vs Anarkali: Which One Is Right for You? | LuxeMia',
    description: 'Lehenga vs Sharara vs Anarkali — a complete comparison of silhouettes, occasions, body types & price. Find out which Indian outfit is right for you.',
    h1: 'Lehenga vs Sharara vs Anarkali: Complete Comparison',
    content: '<p>Confused between a lehenga, sharara, and anarkali? Compare silhouettes, occasions, comfort, body-type fit, and price — so you pick the perfect Indian outfit for your next wedding, festival, or celebration.</p>',
  },
  {
    path: '/blog/best-lehenga-colors-for-indian-skin-tone',
    title: 'Best Lehenga Colors for Every Indian Skin Tone | LuxeMia',
    description: 'The best lehenga colors for fair, wheatish, dusky & dark Indian skin tones. Discover what suits you with stylist-curated color recommendations.',
    h1: 'Best Lehenga Colors for Every Indian Skin Tone',
    content: '<p>Find the most flattering lehenga colors for your skin tone. Whether you are fair, wheatish, dusky, or deep — our stylists break down the shades that make Indian skin glow, and the colors to skip.</p>',
  },
  {
    path: '/blog/shipping-indian-clothes-usa-uk-canada-nri-guide',
    title: 'Shipping Indian Clothes to USA, UK & Canada: NRI Guide | LuxeMia',
    description: 'Complete NRI guide to shipping Indian clothes to USA, UK & Canada. Customs, duties, delivery times & how to avoid common shipping problems.',
    h1: 'Shipping Indian Clothes to USA, UK & Canada: NRI Guide',
    content: '<p>The complete NRI guide to ordering Indian ethnic wear online and shipping it to the USA, UK, or Canada. Customs duties, delivery timelines, country-specific rules, and how LuxeMia handles worldwide shipping with no surprises.</p>',
  },
  {
    path: '/blog/unstitched-vs-ready-to-wear-vs-made-to-measure',
    title: 'Unstitched vs Ready to Wear vs Made to Measure: Which to Choose? | LuxeMia',
    description: 'Unstitched vs Ready to Wear vs Made to Measure — pros, cons, pricing & timelines for Indian ethnic wear. A complete shopping guide.',
    h1: 'Unstitched vs Ready to Wear vs Made to Measure',
    content: '<p>Should you order unstitched fabric, a ready-to-wear outfit, or made-to-measure stitching? Compare pricing, timelines, fit, and flexibility so you choose the right option for your next lehenga, saree, or suit.</p>',
  },
  {
    path: '/404',
    title: 'Page Not Found | LuxeMia',
    description: 'The page you are looking for could not be found.',
    h1: 'Page Not Found',
    content: '<p>The page you are looking for may have been removed, had its name changed, or is temporarily unavailable. Please visit our <a href="/">homepage</a> to browse our collection.</p>',
    noIndex: true,
  },
  {
    path: '/order-confirmation',
    title: 'Order Confirmed — Thank You | LuxeMia',
    description: 'Your order has been confirmed. Thank you for shopping at LuxeMia.',
    h1: 'Order Confirmed!',
    content: '<p>Thank you for shopping with LuxeMia. Your order has been confirmed and you will receive a confirmation email shortly. Your order will be prepared within 3-5 business days and delivered within 7-10 business days after dispatch.</p>',
    noIndex: true,
  },
  // ─── Pillar Blog Articles (SEO audit Item #13) ─────────────────────────────
  // 10 long-form articles for topical authority. Each gets a prerendered HTML
  // file so crawlers see the content without executing JavaScript.
  {
    path: '/blog/how-to-wear-a-saree-step-by-step',
    title: 'How to Wear a Saree Step-by-Step: Complete Beginner Guide (With Photos) | LuxeMia',
    description: 'Learn how to drape a saree in 7 simple steps. This beginner-friendly guide covers the Nivi style, blouse fitting, petticoat tips, and common mistakes to avoid.',
    h1: 'How to Wear a Saree Step-by-Step: Complete Beginner Guide',
    content: '<p>Wearing a saree for the first time can feel intimidating, but once you understand the basic draping technique, it becomes second nature. This step-by-step guide walks you through the classic Nivi style with clear instructions and common mistakes to avoid.</p><h2>What You Need</h2><p>The saree (5.5-6.5 yards), a matching blouse, a petticoat (underskirt), safety pins, and shoes.</p><h2>Step 1: Put On the Petticoat and Blouse</h2><p>Start by wearing your petticoat tied firmly at the waist and your fitted blouse.</p><h2>Step 2: Tuck the Inner End Into the Petticoat</h2><p>Starting from your right hip, tuck the top edge of the inner end into the petticoat waistband, walking the fabric around to the left.</p><h2>Step 3: Make the Front Pleats</h2><p>Gather 5-7 evenly spaced pleats, each about 4-5 inches wide, and tuck them into the petticoat slightly left of your navel.</p><h2>Step 4: Drape the Pallu Over Your Shoulder</h2><p>Take the remaining fabric (pallu) and bring it from your left hip around your back to your right shoulder.</p><h2>Step 5: Secure the Pallu</h2><p>Pin the pallu to your blouse at the shoulder with a safety pin.</p><h2>Step 6: Adjust the Length</h2><p>Check the length all the way around — the saree should just touch the top of your feet.</p><h2>Common Mistakes to Avoid</h2><p>Petticoat too loose, pleats too wide or too narrow, pallu too long, wrong shoes. Shop our <a href="/sarees">saree collection</a> for beginner-friendly options.</p>',
  },
  {
    path: '/blog/best-lehenga-styles-indian-wedding-guests-usa-2026',
    title: 'Best Lehenga Styles for Indian Wedding Guests in USA (2026 Guide) | LuxeMia',
    description: 'Discover the best lehenga styles for Indian wedding guests in 2026. From sangeet to reception, learn which colors, fabrics, and silhouettes work best for each ceremony.',
    h1: 'Best Lehenga Styles for Indian Wedding Guests in USA (2026 Guide)',
    content: '<p>Attending an Indian wedding as a guest comes with a delicious dilemma: what to wear. This 2026 guide breaks down the best lehenga styles for Indian wedding guests in the USA, with practical advice on color choices, fabric selection, and where to shop online.</p><h2>Best Lehenga Colors for Wedding Guests in 2026</h2><p>Royal blue, emerald green, dusty rose and blush pink, wine and burgundy, ivory and champagne. Avoid red (reserved for the bride), white, and black.</p><h2>Best Lehenga Fabrics for Each Season</h2><p>Summer: georgette, chiffon, organza, net. Winter: velvet, raw silk, brocade, chinon.</p><h2>Lehenga Silhouettes for Different Body Types</h2><p>A-Line (universally flattering), Flared (dramatic), Straight-Cut (modern), Mermaid (body-hugging).</p><h2>Where to Shop Lehengas Online in the USA</h2><p>Shop our <a href="/lehengas">lehenga collection</a> — ready-to-ship and custom-tailored options shipped to the USA, Canada, and Australia with free shipping over $350.</p>',
  },
  {
    path: '/blog/what-to-wear-south-asian-wedding-non-indian-guest',
    title: 'What to Wear to a South Asian Wedding as a Non-Indian Guest | LuxeMia',
    description: 'Attending an Indian wedding but not sure what to wear? This guide for non-Indian guests covers dress codes, color etiquette, where to shop, and cultural tips.',
    h1: 'What to Wear to a South Asian Wedding as a Non-Indian Guest',
    content: '<p>Being invited to a South Asian wedding is an honor. But if you are not of Indian or South Asian heritage, the question of what to wear can feel daunting. This guide answers all your questions so you can attend with confidence and cultural respect.</p><h2>Is It Okay to Wear Indian Clothes?</h2><p>Yes — and your hosts will likely be delighted. Wearing Indian attire shows appreciation for the culture.</p><h2>Understanding the Different Ceremonies</h2><p>Mehendi (casual), Sangeet (glamorous), Haldi (yellow), Wedding Ceremony (formal), Reception (most formal).</p><h2>Color Etiquette</h2><p>Safe colors: royal blue, emerald green, pink, gold, purple, yellow. Avoid: red (bride), pure white (mourning), pure black (inauspicious).</p><h2>What to Wear: Your Options</h2><p>Saree, Lehenga, Salwar Kameez, Anarkali Suit, Indo-Western Fusion. Shop <a href="/lehengas">lehengas</a> or <a href="/sarees">sarees</a> at LuxeMia.</p>',
  },
  {
    path: '/blog/diwali-outfit-ideas-nri-women-usa-canada-australia',
    title: 'Diwali Outfit Ideas for NRI Women in USA, Canada & Australia (2026) | LuxeMia',
    description: 'Celebrate Diwali 2026 in style. From silk sarees to festive lehengas, discover the best Diwali outfit ideas for NRI women — plus where to shop online and how to ship fast.',
    h1: 'Diwali Outfit Ideas for NRI Women in USA, Canada & Australia (2026)',
    content: '<p>Diwali, the festival of lights, is the most celebrated festival in Indian culture. This guide covers the best Diwali outfit ideas for 2026, from traditional silks to modern fusion wear, with practical tips on where to shop and how to get your outfit shipped fast.</p><h2>Traditional Diwali Outfit Ideas</h2><p>Silk Saree, Festive Lehenga, Anarkali Suit, Salwar Kameez with Dupatta.</p><h2>Modern Diwali Outfit Ideas</h2><p>Indo-Western Fusion, Cape-Style Lehenga, Pre-Stitched Saree.</p><h2>Diwali Color Palette 2026</h2><p>Traditional: deep red, royal blue, emerald green, gold. Modern: dusty rose, ivory, plum.</p><h2>When to Order Your Diwali Outfit</h2><p>Order 4-6 weeks before Diwali for ready-to-ship items. Shop our <a href="/collections/diwali-outfits">Diwali collection</a>.</p>',
  },
  {
    path: '/blog/kanjivaram-vs-banarasi-silk-sarees',
    title: 'Kanjivaram vs Banarasi Silk Sarees: Which Should You Buy? | LuxeMia',
    description: 'Confused between Kanjivaram and Banarasi silk sarees? This detailed comparison covers origin, weaving technique, design, price, and care — helping you choose the right silk saree.',
    h1: 'Kanjivaram vs Banarasi Silk Sarees: Which Should You Buy?',
    content: '<p>Kanjivaram and Banarasi are the two most celebrated silk sarees in India. Both are handwoven masterpieces with centuries of tradition. This guide compares them across every dimension that matters.</p><h2>Origin and History</h2><p>Kanjivaram from Kanchipuram, Tamil Nadu (400+ years). Banarasi from Varanasi, Uttar Pradesh (Mughal era, 17th century).</p><h2>Weaving Technique</h2><p>Kanjivaram: three shuttles, korvai interlocking. Banarasi: jacquard loom, intricate brocade.</p><h2>Visual Differences</h2><p>Kanjivaram: bold contrasting borders, temple motifs, thick lustrous silk. Banarasi: all-over brocade, Persian motifs, softer silk.</p><h2>Price Comparison</h2><p>Art silk: $50-150. Pure silk with test zari: $200-500. Pure silk with real zari: $500-2000. Shop <a href="/sarees">silk sarees</a> at LuxeMia.</p>',
  },
  {
    path: '/blog/indian-wedding-guest-outfits-men-usa-guide',
    title: 'Indian Wedding Guest Outfits for Men: Complete USA Guide (2026) | LuxeMia',
    description: 'The only guide men need for Indian wedding guest outfits. From sherwani to kurta pajama, learn what to wear to each ceremony, where to shop online in the USA, and how to get the right fit.',
    h1: 'Indian Wedding Guest Outfits for Men: Complete USA Guide (2026)',
    content: '<p>Indian weddings are no longer just a South Asian celebration. This guide covers everything men need to know about Indian wedding guest outfits, from ceremony dress codes to where to shop online.</p><h2>Key Indian Menswear Terms</h2><p>Kurta Pajama, Sherwani, Nehru Jacket, Indo-Western, Churidar.</p><h2>What to Wear to Each Ceremony</h2><p>Mehendi (casual kurta), Sangeet (silk kurta + Nehru jacket), Haldi (yellow kurta), Wedding Ceremony (sherwani), Reception (indo-western suit).</p><h2>Color Guide for Men</h2><p>Safe: ivory, gold, deep blue, emerald green, maroon. Avoid: black, white, red.</p><h2>Where to Shop</h2><p>Shop our <a href="/menswear">menswear collection</a> with free shipping over $350.</p>',
  },
  {
    path: '/blog/how-to-choose-salwar-kameez-body-type',
    title: 'How to Choose the Right Salwar Kameez for Your Body Type | LuxeMia',
    description: 'Find the perfect salwar kameez for your body shape. This guide covers the best styles for pear, apple, hourglass, rectangle, and petite figures — with fit tips, fabric choices, and styling advice.',
    h1: 'How to Choose the Right Salwar Kameez for Your Body Type',
    content: '<p>The salwar kameez is one of the most versatile garments in Indian fashion. This guide breaks down the best styles for each body type, with practical fit tips and styling advice.</p><h2>Understanding Your Body Type</h2><p>Pear, Apple, Hourglass, Rectangle, Petite.</p><h2>Best Styles for Each Body Type</h2><p>Pear: A-line kameez, boat neck. Apple: long anarkali, V-neck. Hourglass: fitted kameez. Rectangle: anarkali, peplum. Petite: short kameez, churidar.</p><h2>Neckline Guide</h2><p>V-neck, boat neck, square neck, round neck, halter, high collar.</p><h2>Fabric Guide by Body Type</h2><p>Flowy for pear/apple/petite. Stiff for rectangle/hourglass. Shop <a href="/suits">salwar kameez</a> at LuxeMia.</p>',
  },
  {
    path: '/blog/custom-tailoring-indian-ethnic-wear-usa',
    title: 'Custom Tailoring Indian Ethnic Wear in USA: What You Need to Know | LuxeMia',
    description: 'Thinking about custom-tailored Indian ethnic wear? This complete guide covers the measurement process, timeline, costs, and benefits of made-to-measure lehengas, sarees, and suits shipped to the USA.',
    h1: 'Custom Tailoring Indian Ethnic Wear in USA: What You Need to Know',
    content: '<p>Off-the-rack Indian ethnic wear is convenient, but nothing fits quite like a custom-tailored outfit. This guide explains everything you need to know about custom tailoring Indian ethnic wear, from the measurement process to what to expect.</p><h2>Benefits of Custom-Tailored Ethnic Wear</h2><p>Perfect fit, better comfort, customization options, better quality, investment value.</p><h2>The Measurement Process</h2><p>Bust, under-bust, waist, hip, shoulder, sleeve length, bicep, armhole, kameez length, neck depth, pant length, thigh, ankle.</p><h2>Custom Tailoring Timeline</h2><p>Measurement: 1-2 days. Stitching: 5-10 business days. Shipping: 7-10 business days. Total: 2-4 weeks.</p><h2>Cost</h2><p>At LuxeMia, custom tailoring is complimentary on most products. Shop <a href="/lehengas">lehengas</a> or <a href="/suits">suits</a>.</p>',
  },
  {
    path: '/blog/haldi-vs-mehendi-outfits-complete-guide',
    title: 'Haldi vs Mehendi Outfits: Complete Guide to Pre-Wedding Ceremony Fashion | LuxeMia',
    description: 'What is the difference between haldi and mehendi outfits? This complete guide covers color choices, fabrics, styling tips, and outfit ideas for both pre-wedding ceremonies.',
    h1: 'Haldi vs Mehendi Outfits: Complete Guide to Pre-Wedding Ceremony Fashion',
    content: '<p>Of all the pre-wedding ceremonies in an Indian wedding, the haldi and mehendi are the most colorful, festive, and fun. This guide covers everything you need to know about haldi and mehendi outfits.</p><h2>What Is the Haldi Ceremony?</h2><p>A pre-wedding ritual where turmeric paste is applied to the bride and groom. Morning event, yellow/orange theme.</p><h2>What Is the Mehendi Ceremony?</h2><p>A pre-wedding event where henna designs are applied. Evening event, colorful and festive.</p><h2>Haldi Outfit Guide</h2><p>Colors: bright yellow, marigold orange, mustard. Fabrics: cotton, linen. Styles: kurta pajama, salwar kameez.</p><h2>Mehendi Outfit Guide</h2><p>Colors: green, pink, orange, turquoise. Fabrics: georgette, chiffon, cotton silk. Styles: salwar kameez, anarkali, lehenga. Shop <a href="/collections/mehendi-outfits">mehendi outfits</a>.</p>',
  },
  {
    path: '/blog/how-to-care-for-silk-sarees-and-lehengas',
    title: 'How to Care for Silk Sarees & Lehengas: Complete Guide (Wash, Store, Maintain) | LuxeMia',
    description: 'Silk sarees and lehengas are investments. This complete care guide covers washing, storing, ironing, and maintaining silk ethnic wear so it lasts for generations.',
    h1: 'How to Care for Silk Sarees & Lehengas: Complete Guide',
    content: '<p>Silk sarees and lehengas are more than clothing — they are investments, heirlooms, and often the most expensive garments in your wardrobe. This guide covers everything you need to know about caring for silk sarees and lehengas.</p><h2>Why Silk Requires Special Care</h2><p>Silk is a natural protein fiber — heat sensitive, sunlight sensitive, chemical sensitive, absorbent, crease-prone.</p><h2>Washing Silk Sarees and Lehengas</h2><p>Golden rule: dry clean only. Hand wash only if label allows and no embellishments.</p><h2>Storing Silk Sarees and Lehengas</h2><p>Cool and dry, dark, well-ventilated, pest-free. Wrap in muslin cloth. Refold every 3-6 months. Never hang.</p><h2>Ironing</h2><p>Use silk setting, iron inside-out, use pressing cloth. Steam preferred.</p><h2>Maintaining Zari Work</h2><p>Wrap in muslin, avoid perfume, never iron directly on zari. See our <a href="/care-guide">care guide</a> for more.</p>',
  },
];

/**
 * Generate pre-rendered HTML for a route by injecting SEO content
 * into the index.html template.
 *
 * allShopifyProducts is a Map<handle, productNode> fetched once at the start
 * of main(). It is only consumed by collection routes (route.category set) —
 * product detail routes already receive their product via route.product.
 */
function generateHtml(template, route, allShopifyProducts) {
  let html = template;

  // Replace title
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>${escapeHtml(route.title)}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeHtml(route.description)}" />`
  );

  // Handle noIndex for 404 pages
  if (route.noIndex) {
    html = html.replace(
      /<meta name="robots" content="[^"]*" \/>/,
      `<meta name="robots" content="noindex, nofollow" />`
    );
    // Also remove canonical for noIndex pages
    html = html.replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      ''
    );
  } else {
    // Replace canonical URL
    const canonical = route.path === '/' ? SITE_URL + '/' : SITE_URL + route.path;
    html = html.replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="${canonical}" />`
    );

    // Replace OG tags
    html = html.replace(
      /<meta property="og:url" content="[^"]*" \/>/,
      `<meta property="og:url" content="${canonical}" />`
    );
  }

  // Replace OG title and description
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeHtml(route.title)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`
  );

  // Inject structured data (JSON-LD) for product pages
  if (route.path.startsWith('/product/')) {
    const canonical = SITE_URL + route.path;
    const handle = route.path.slice('/product/'.length);

    // Look up live product data (image, price, description) from Shopify map.
    // Fall back to the route's own metadata when Shopify lookup misses, so the
    // emitted Product schema is ALWAYS valid (Google Merchant Listings rejects
    // products missing image / offers.price / description).
    const live = route.product || null;
    const liveImages = live?.images?.edges?.map(e => forceJpegForGmc(e.node.url)).filter(Boolean) || [];
    const productImages = liveImages.length > 0 ? liveImages : [FALLBACK_OG_IMAGE];
    const productDescription = (live?.description?.trim() || route.description || '').slice(0, 5000);
    const productPrice = live?.priceRange?.minVariantPrice?.amount || FALLBACK_PRICE;
    const productCurrency = live?.priceRange?.minVariantPrice?.currencyCode || FALLBACK_CURRENCY;
    // Extract the compareAtPrice (regular/original price) for sale-price JSON-LD.
    // The merchant feed (generate-static-feed.cjs) emits this as g:price when a
    // discount exists, with g:sale_price carrying the lower (current) price.
    // Without priceSpecification in the JSON-LD, Google Merchant Center sees a
    // mismatch between the feed (g:price=$193.70) and the landing page
    // (offers.price=$149.00) and disapproves the product.
    const productComparePrice = live?.compareAtPriceRange?.maxVariantPrice?.amount || null;
    const hasSale =
      productComparePrice &&
      parseFloat(productComparePrice) > parseFloat(productPrice);
    const productSku = live?.variants?.edges?.[0]?.node?.sku || (live?.id || '').split('/').pop() || handle;
    const productAvailability = live?.availableForSale === false ? 'OutOfStock' : 'InStock';
    const productBrand = (() => {
      const v = (live?.vendor || '').trim();
      return !v || v.toLowerCase() === 'luxemia' ? 'LuxeMia' : v;
    })();

    // Product schema — must include image, description, offers.price/priceCurrency
    // for Google Merchant Listings validation.
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: route.h1,
      image: productImages,
      description: productDescription,
      sku: productSku,
      mpn: productSku,
      url: canonical,
      brand: { '@type': 'Brand', name: productBrand },
      category: 'Clothing > Traditional & Ethnic Wear',
      itemCondition: 'https://schema.org/NewCondition',
      offers: {
        '@type': 'Offer',
        url: canonical,
        price: productPrice,
        priceCurrency: productCurrency,
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        // When the product is on sale (compareAtPrice > price), emit a
        // priceSpecification with maxPrice = the regular price. This matches
        // the merchant feed's g:price (regular) / g:sale_price (sale) pair,
        // resolving the GMC "Price mismatch" disapproval.
        // See: https://developers.google.com/search/docs/appearance/structured-data/product
        ...(hasSale ? {
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: productPrice,
            priceCurrency: productCurrency,
            maxPrice: productComparePrice,
            validThrough: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          },
        } : {}),
        availability: `https://schema.org/${productAvailability}`,
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: 'Glamour Indian Wear', alternateName: 'LuxeMia' },
        shippingDetails: [
          {
            '@type': 'OfferShippingDetails',
            name: 'Free Shipping on Orders Over $350',
            shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'USD' },
            shippingDestination: { '@type': 'DefinedRegion', addressCountry: ['US', 'CA', 'AU'] },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 5, unitCode: 'DAY' },
              transitTime: { '@type': 'QuantitativeValue', minValue: 7, maxValue: 10, unitCode: 'DAY' },
            },
          },
          {
            '@type': 'OfferShippingDetails',
            name: 'Flat Rate Shipping $25',
            shippingRate: { '@type': 'MonetaryAmount', value: '25.00', currency: 'USD' },
            shippingDestination: { '@type': 'DefinedRegion', addressCountry: ['US', 'CA', 'AU'] },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 5, unitCode: 'DAY' },
              transitTime: { '@type': 'QuantitativeValue', minValue: 7, maxValue: 10, unitCode: 'DAY' },
            },
          },
        ],
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'US',
          returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
          description: 'All sales are final. LuxeMia does not accept returns or exchanges. Only genuine shipping damage claims are accepted within 48 hours with mandatory unboxing video.',
        },
      },
    };

    // Breadcrumb schema for product pages
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: 'Products', item: SITE_URL + '/products' },
        { '@type': 'ListItem', position: 3, name: route.h1, item: canonical },
      ],
    };

    const structuredDataScripts = `
    <script type="application/ld+json">${JSON.stringify(productSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`;

    // Inject before </head>
    html = html.replace('</head>', `${structuredDataScripts}\n</head>`);
  }

  // Inject SEO content into the body. This content is visible to search engine crawlers
  // and accessible to screen readers. JavaScript removes it once React has mounted
  // so regular users see only the React-rendered UI (no duplicate content).

  // For product pages with live Shopify data, generate rich visible content:
  // price, image, full description, product details, shipping info.
  // This is the key fix for Google's "thin content" / "crawled but not indexed" signal.
  let mainBodyContent;
  if (route.path.startsWith('/product/') && route.product) {
    const p = route.product;
    const price = p.priceRange?.minVariantPrice?.amount || FALLBACK_PRICE;
    const currency = p.priceRange?.minVariantPrice?.currencyCode || FALLBACK_CURRENCY;
    const comparePrice = p.compareAtPriceRange?.maxVariantPrice?.amount;
    const isAvailable = p.availableForSale !== false;
    const images = p.images?.edges?.map(e => e.node) || [];
    const description = (p.description || '').trim();
    const productType = (p.productType || '').trim();
    const vendor = (p.vendor || '').trim();
    const brandName = (!vendor || vendor.toLowerCase() === 'luxemia') ? 'LuxeMia' : vendor;

    let priceHtml = `<strong>${currency} ${parseFloat(price).toFixed(2)}</strong>`;
    if (comparePrice && parseFloat(comparePrice) > parseFloat(price)) {
      priceHtml += ` <s style="color:#888">${currency} ${parseFloat(comparePrice).toFixed(2)}</s>`;
    }

    // Category link based on product type
    const typeLower = productType.toLowerCase();
    let categoryLink = '/products';
    let categoryLabel = 'All Products';
    if (typeLower.includes('lehenga')) { categoryLink = '/lehengas'; categoryLabel = 'All Lehengas'; }
    else if (typeLower.includes('saree') || typeLower.includes('sari')) { categoryLink = '/sarees'; categoryLabel = 'All Sarees'; }
    else if (typeLower.includes('suit') || typeLower.includes('kameez') || typeLower.includes('palazzo') || typeLower.includes('sharara') || typeLower.includes('anarkali') || typeLower.includes('patiala')) { categoryLink = '/suits'; categoryLabel = 'All Suits'; }
    else if (typeLower.includes('sherwani') || typeLower.includes('kurta') || typeLower.includes('menswear')) { categoryLink = '/menswear'; categoryLabel = 'All Menswear'; }

    const firstImage = images[0];
    const imgHtml = firstImage
      ? `<img src="${escapeHtml(forceJpegForGmc(firstImage.url))}" alt="${escapeHtml(firstImage.altText || route.h1)}" width="600" loading="lazy" style="max-width:100%;height:auto;display:block;margin:12px 0">`
      : '';

    const descHtml = description
      ? `<h2>Product Description</h2><p>${escapeHtml(description).slice(0, 2000)}</p>`
      : '';

    const detailRows = [
      productType ? `<li><strong>Type:</strong> ${escapeHtml(productType)}</li>` : '',
      `<li><strong>Brand:</strong> ${escapeHtml(brandName)}</li>`,
      `<li><strong>Availability:</strong> ${isAvailable ? 'In Stock' : 'Currently Unavailable'}</li>`,
      `<li><strong>Ships to:</strong> USA, Canada, Australia</li>`,
      `<li><strong>Standard delivery:</strong> 7–10 business days</li>`,
      `<li><strong>Express delivery:</strong> 3–5 business days</li>`,
      `<li><strong>Custom sizing:</strong> Available on request</li>`,
    ].filter(Boolean).join('\n        ');

    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      <p>Price: ${priceHtml} | ${isAvailable ? 'In Stock' : 'Out of Stock'}</p>
      ${imgHtml}
      ${descHtml}
      <h2>Product Details</h2>
      <ul>
        ${detailRows}
      </ul>
      <h2>Shipping &amp; Delivery</h2>
      <p>Free standard shipping on orders over $350 to USA, Canada, and Australia. Flat rate $25 per order for orders under $350. All orders ship with full DHL Express tracking. Standard delivery: 7–10 business days. Express (3–5 days) available at checkout.</p>
      <p><a href="${escapeHtml(categoryLink)}">${escapeHtml(categoryLabel)}</a> | <a href="/products">All Products</a> | <a href="/collections">Collections</a></p>`;
  } else if (route.category && allShopifyProducts && allShopifyProducts.size > 0) {
    // Collection route (sarees/lehengas/suits/menswear/indowestern/collections/new-arrivals/bestsellers)
    // Inject REAL Shopify products so Googlebot sees a fully populated category page on
    // first byte instead of an empty marketing shell. This is the SEO fix for the
    // 100 -> 7 impression drop on collection pages.
    const allProducts = Array.from(allShopifyProducts.values());
    const collectionProducts = filterProductsForCategory(allProducts, route.category);
    console.log(`[prerender] ${route.path}: matched ${collectionProducts.length} products for category '${route.category}'`);

    // ItemList JSON-LD — Google Merchant Center reads this for collection rich results.
    const itemListJsonLd = generateItemListJsonLd(collectionProducts, route.category, route.path);
    html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(itemListJsonLd)}</script>\n</head>`);

    // Compact JSON payload for React hydration — useShopifyProducts reads this on mount
    // and skips the client-side Shopify fetch entirely on first paint.
    const initialDataPayload = buildInitialDataPayload(collectionProducts, route.category);
    html = html.replace('</head>', `    <script>window.__INITIAL_DATA__ = ${initialDataPayload};</script>\n</head>`);

    // Visible product cards for crawlers (removed by MutationObserver once React hydrates)
    const productCardsHtml = generateCollectionProductHtml(collectionProducts);
    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      ${route.content}
      <h2>Products in this Collection</h2>
      ${productCardsHtml}`;
  } else if (route.path === '/') {
    // Homepage — inject OnlineStore JSON-LD schema to explicitly categorize
    // Luxemia Shop as a South Asian apparel retailer (disambiguates from the
    // unrelated sneaker store on luxemia.net).
    //
    // Schema.org compliance:
    // - logo/image use real image URLs (og-image.jpg, verified 200 OK)
    // - shippingDetails uses @type OfferShippingDetails (not ShippingDeliveryTime)
    //   because shippingRate is a property of OfferShippingDetails
    const onlineStoreSchema = {
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      "name": "Luxemia Shop",
      "url": "https://luxemia.shop",
      "logo": "https://luxemia.shop/og-image.jpg",
      "description": "Affordable e-commerce store for South Asian traditional clothing, festive lehengas, trendy kurtis, and everyday casual sarees.",
      "image": "https://luxemia.shop/og-image.jpg",
      "category": "Indian Clothing Store",
      "knowsAbout": [
        "Indian Ethnic Wear",
        "Affordable Sarees",
        "Festive Lehengas",
        "Salwar Kameez",
        "South Asian Fashion"
      ],
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "eligibleRegion": ["US", "CA", "AU"]
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0.00",
          "currency": "USD"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "US"
        }
      }
    };
    html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(onlineStoreSchema)}</script>\n</head>`);
    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      ${route.content}`;
  } else {
    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      ${route.content}`;
  }

  const seoContent = `
    <div id="seo-prerender">
      ${mainBodyContent}
      <nav aria-label="Site navigation">
        <a href="/">Home</a> |
        <a href="/lehengas">Lehengas</a> |
        <a href="/sarees">Sarees</a> |
        <a href="/suits">Suits</a> |
        <a href="/menswear">Menswear</a> |
        <a href="/blog">Blog</a> |
        <a href="/collections">Collections</a> |
        <a href="/contact">Contact</a>
      </nav>
    </div>
    <script>
      (function(){
        var root = document.getElementById('root');
        var seo = document.getElementById('seo-prerender');
        if (!root || !seo) return;
        // Remove once React has populated #root (MutationObserver fires on first child added)
        var obs = new MutationObserver(function() {
          obs.disconnect();
          var p = document.getElementById('seo-prerender');
          if (p) p.remove();
        });
        obs.observe(root, { childList: true });
        // Safety fallback in case observer misses the mutation
        setTimeout(function() {
          obs.disconnect();
          var p = document.getElementById('seo-prerender');
          if (p) p.remove();
        }, 5000);
      })();
    </script>`;

  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"></div>${seoContent}`
  );

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function main() {
  const indexPath = path.join(DIST_DIR, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error('Error: dist/index.html not found. Run `vite build` first.');
    process.exit(1);
  }

  const template = fs.readFileSync(indexPath, 'utf-8');
  const prerenderDir = path.join(DIST_DIR, '_prerender');

  // Clean previous prerender output
  if (fs.existsSync(prerenderDir)) {
    fs.rmSync(prerenderDir, { recursive: true });
  }
  fs.mkdirSync(prerenderDir, { recursive: true });

  // Pre-fetch live Shopify product data so /product/* prerendered HTML
  // emits valid Product JSON-LD with image, description, and offers.price.
  const productMap = await fetchAllShopifyProducts();
  const hardcodedProductHandles = new Set();
  for (const route of routes) {
    if (route.path.startsWith('/product/')) {
      const handle = route.path.slice('/product/'.length);
      hardcodedProductHandles.add(handle);
      const live = productMap.get(handle);
      if (live) route.product = live;
    }
  }

  // Auto-generate a route entry for every Shopify product NOT already in the
  // hardcoded list. This guarantees a prerendered HTML file with valid Product
  // JSON-LD exists for every /product/<handle> on the live site (was previously
  // only ~73 of 360 products — the rest fell through to the empty SPA shell
  // with no Product schema, breaking GMC validation).
  for (const [handle, p] of productMap.entries()) {
    if (hardcodedProductHandles.has(handle)) continue;
    // Prefer Shopify admin "Search engine listing" (SEO) fields when set.
    // Falls back to plain product title + " | LuxeMia" suffix.
    // IMPORTANT: when seoTitle is set, use it VERBATIM. Shopify's SEO title
    // field is the complete title the user wants shown in search results —
    // Shopify itself often auto-populates it as "{productTitle} | {shopName}",
    // so appending " | LuxeMia" here would produce "... | LuxeMia | LuxeMia".
    const seoTitle = (p.seo?.title || '').trim();
    const seoDescription = (p.seo?.description || '').trim();

    // ─── USP-enhanced title generation ──────────────────────────────────────
    // When no Shopify SEO title is set, inject fabric/color USP into the title
    // to carve out high-converting long-tail niches (e.g., "Maroon Raw Silk
    // Bridal Lehenga | Hand Embroidery | LuxeMia") that corporate catalogs lack.
    const desc = (p.description || '').trim();
    const baseTitle = p.title || handle;
    const titleDescLower = `${baseTitle} ${desc}`.toLowerCase();

    // Fabric + color detection arrays (shared by title + description generation)
    const fabrics = ['raw silk', 'banarasi silk', 'kanchipuram silk', 'kanjivaram', 'georgette', 'chiffon', 'velvet', 'organza', 'chinnon', 'chinon', 'crepe', 'net', 'cotton', 'satin', 'taffeta', 'jacquard', 'tussar', 'brocade', 'silk', 'art silk'];
    const colors = ['maroon', 'wine', 'burgundy', 'red', 'pink', 'rani pink', 'baby pink', 'dusty rose', 'blue', 'navy', 'royal blue', 'sky blue', 'teal', 'green', 'emerald', 'olive', 'mint', 'sage', 'yellow', 'gold', 'mustard', 'orange', 'peach', 'coral', 'rust', 'purple', 'lavender', 'plum', 'mauve', 'lilac', 'white', 'ivory', 'cream', 'beige', 'black', 'grey', 'gray', 'champagne', 'copper', 'bronze'];
    const foundFabric = fabrics.find(f => titleDescLower.includes(f));
    const foundColor = colors.find(c => titleDescLower.includes(c));

    let title;
    if (seoTitle) {
      title = seoTitle;
    } else {
      // Build USP suffix: "in Maroon Raw Silk" or "in Raw Silk" or ""
      let uspSuffix = '';
      if (foundFabric && foundColor) {
        uspSuffix = ` in ${foundColor.charAt(0).toUpperCase() + foundColor.slice(1)} ${foundFabric.charAt(0).toUpperCase() + foundFabric.slice(1)}`;
      } else if (foundFabric) {
        uspSuffix = ` in ${foundFabric.charAt(0).toUpperCase() + foundFabric.slice(1)}`;
      }

      // Keep title under 70 chars for SERP display
      const candidateTitle = `${baseTitle}${uspSuffix} | LuxeMia`;
      title = candidateTitle.length > 70
        ? `${baseTitle} | LuxeMia`
        : candidateTitle;
    }

    // ─── USP-enhanced fallback description ──────────────────────────────────
    // Injects fabric, color, and shipping turnaround into the fallback so even
    // products with thin Shopify descriptions get unique, keyword-rich meta.
    const fabricPhrase = foundFabric ? ` ${foundFabric.charAt(0).toUpperCase() + foundFabric.slice(1)}` : '';
    const colorPhrase = foundColor ? ` ${foundColor.charAt(0).toUpperCase() + foundColor.slice(1)}` : '';
    const fallbackDesc = `Shop the${colorPhrase}${fabricPhrase} ${baseTitle} at LuxeMia. Handcrafted Indian ethnic wear with premium fabrics. Ships worldwide in 7-10 days, free over $350.`;
    const description = (seoDescription || (desc.length >= 60 ? desc : fallbackDesc)).slice(0, 320);
    routes.push({
      path: `/product/${handle}`,
      title,
      description,
      h1: seoTitle || p.title || handle,
      content: `<p>${escapeHtml(desc || fallbackDesc).slice(0, 1200)}</p>`,
      product: p,
    });
  }
  console.log(`[prerender] Total /product/* routes after Shopify merge: ${routes.filter(r => r.path.startsWith('/product/')).length}`);

  let count = 0;
  let productCount = 0;
  for (const route of routes) {
    const html = generateHtml(template, route, productMap);

    // Create directory structure: / -> _prerender/index.html, /suits -> _prerender/suits.html
    let outFile;
    if (route.path === '/') {
      outFile = path.join(prerenderDir, 'index.html');
    } else {
      // /blog/some-slug -> _prerender/blog/some-slug.html
      const parts = route.path.slice(1); // remove leading /
      const dir = path.dirname(parts);
      if (dir !== '.') {
        fs.mkdirSync(path.join(prerenderDir, dir), { recursive: true });
      }
      outFile = path.join(prerenderDir, `${parts}.html`);
    }

    fs.writeFileSync(outFile, html);
    count++;
    if (route.path.startsWith('/product/')) productCount++;
  }

  console.log(`[prerender] Pre-rendered ${count} total routes to ${prerenderDir}/`);
  console.log(`[prerender] Product pages: ${productCount}`);
  console.log(`[prerender] Static/blog pages: ${count - productCount}`);

  // Fail the build loudly if Shopify fetch returned no products.
  // This prevents deploying a site where every product page returns an empty SPA shell.
  if (SHOPIFY_STOREFRONT_TOKEN && productCount < 10) {
    console.error(`\n[prerender] CRITICAL BUILD FAILURE`);
    console.error(`[prerender] Only ${productCount} product HTML files generated but SHOPIFY_STOREFRONT_TOKEN is set.`);
    console.error(`[prerender] This means the Shopify Storefront API returned 0 products.`);
    console.error(`[prerender] Possible causes:`);
    console.error(`[prerender]   - SHOPIFY_STOREFRONT_TOKEN is set but invalid or expired`);
    console.error(`[prerender]   - Shopify store has no published products`);
    console.error(`[prerender]   - Shopify API rate limit hit`);
    console.error(`[prerender]   - Network error connecting to Shopify`);
    console.error(`[prerender] Fix: verify the token at Vercel → Project → Settings → Environment Variables`);
    process.exit(1);
  }

  if (!SHOPIFY_STOREFRONT_TOKEN) {
    console.warn(`\n[prerender] WARNING: SHOPIFY_STOREFRONT_TOKEN is not set.`);
    console.warn(`[prerender] Only ${productCount} hardcoded product pages were generated.`);
    console.warn(`[prerender] Set SHOPIFY_STOREFRONT_TOKEN in Vercel environment variables to prerender all products.`);
  }

  // Write prerenderManifest.ts with the EXACT set of product handles that have
  // prerendered HTML files. Middleware imports this so it knows which handles to
  // rewrite without self-HTTP requests or mismatches with generate-routes output.
  const prerenderedHandles = routes
    .filter(r => r.path.startsWith('/product/'))
    .map(r => r.path.slice('/product/'.length));

  const manifestContent = `// AUTO-GENERATED by scripts/prerender.js — do not edit manually.
// Contains the exact set of product handles with a prerendered HTML file in dist/_prerender/product/.
// Regenerated on each build. Imported by middleware.ts to avoid self-HTTP HEAD requests.

export const PRERENDERED_PRODUCT_HANDLES: Set<string> = new Set([
${prerenderedHandles.map(h => `  '${h}',`).join('\n')}
]);
`;

  const manifestPath = path.resolve(__dirname, '../src/lib/prerenderManifest.ts');
  fs.writeFileSync(manifestPath, manifestContent, 'utf-8');
  console.log(`[prerender] Written src/lib/prerenderManifest.ts with ${prerenderedHandles.length} product handles`);
}

main().catch(err => {
  console.error('[prerender] Fatal error:', err);
  process.exit(1);
});
