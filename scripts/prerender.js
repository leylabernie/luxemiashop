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

// ─── Clean description generator (replaces bloated Shopify descriptions) ─────
// Generates short structured descriptions from product metadata.
// NEVER uses raw p.description which contains old AI-generated prose.
function generateCleanDescription(title, productType, tags) {
  const t = (title || '').toLowerCase();
  const pt = (productType || '').toLowerCase();
  const tagStr = (tags || []).join(' ').toLowerCase();
  const combined = `${t} ${pt} ${tagStr}`;

  // Extract color
  const colors = ['burgundy', 'wine', 'maroon', 'royal blue', 'navy', 'cobalt', 'fuchsia',
    'magenta', 'black', 'cream', 'beige', 'white', 'ivory', 'gold', 'antique gold',
    'teal', 'emerald', 'green', 'olive', 'charcoal', 'grey', 'gray', 'coral', 'orange',
    'saffron', 'yellow', 'rose', 'pink', 'plum', 'purple'];
  let color = '';
  for (const c of colors) {
    if (combined.includes(c)) { color = c.charAt(0).toUpperCase() + c.slice(1); break; }
  }

  // Extract fabric
  const fabrics = ['silk', 'georgette', 'satin', 'cotton', 'net', 'velvet', 'organza', 'chiffon'];
  let fabric = '';
  for (const f of fabrics) {
    if (combined.includes(f)) { fabric = f.charAt(0).toUpperCase() + f.slice(1); break; }
  }

  // Extract work/embroidery
  const works = ['zari', 'zardozi', 'sequin', 'embroidery', 'mirror work', 'thread work',
    'bead work', 'resham', 'gota patti', 'stone work'];
  let work = '';
  for (const w of works) {
    if (combined.includes(w)) { work = w.charAt(0).toUpperCase() + w.slice(1); break; }
  }

  // Determine product type label
  let label = 'ethnic wear';
  if (pt.includes('lehenga')) label = 'lehenga';
  else if (pt.includes('saree')) label = 'saree';
  else if (pt.includes('suit')) label = 'suit';

  // Build short description
  const parts = [];
  if (color) parts.push(color);
  if (fabric) parts.push(fabric);
  parts.push(label);
  if (work) parts.push(`with ${work.toLowerCase()}`);
  const sentence1 = `${parts.join(' ')}.`.replace(/\s+/g, ' ');

  // Occasion
  const occasions = [];
  if (combined.includes('wedding') || combined.includes('bridal')) occasions.push('wedding');
  if (combined.includes('festive') || combined.includes('festival')) occasions.push('festive');
  if (combined.includes('party')) occasions.push('party wear');
  if (combined.includes('diwali')) occasions.push('Diwali');
  if (combined.includes('eid')) occasions.push('Eid');
  if (combined.includes('mehndi')) occasions.push('Mehndi');
  if (combined.includes('sangeet')) occasions.push('Sangeet');
  if (combined.includes('reception')) occasions.push('reception');

  let sentence2 = '';
  if (occasions.length > 0) {
    sentence2 = ` Suited for ${occasions.join(', ')}.`;
  } else if (combined.includes('festive') || combined.includes('casual')) {
    sentence2 = ' Suited for festive and casual occasions.';
  }

  return (sentence1 + sentence2).trim();
}

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

// Route definitions with SEO metadata
const routes = [
  {
    path: '/',
    title: 'LuxeMia | Indian Ethnic Wear — Sarees & Lehengas',
    description: 'Shop Indian ethnic wear at LuxeMia. Bridal lehengas, Banarasi silk sarees, anarkali suits & wedding collections. Free shipping to USA, Canada & Australia on orders over $350.',
    h1: 'LuxeMia',
    content: `
      <p>Discover beautiful Indian ethnic wear at LuxeMia. From bridal lehengas to silk sarees, anarkali suits to designer menswear — we bring the finest Indian craftsmanship to your doorstep with shipping to USA, Canada, and Australia.</p>
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
        <li><a href="/collections/bridal-lehengas">Bridal Lehengas</a></li>
        <li><a href="/collections/wedding-sarees">Wedding Sarees</a></li>
        <li><a href="/collections">Reception Outfits</a></li>
        <li><a href="/collections/party-wear-lehengas">Party Wear Lehengas</a></li>
        <li><a href="/collections/designer-sarees">Designer Sarees</a></li>
        <li><a href="/collections/silk-sarees">Silk Sarees</a></li>
        <li><a href="/collections">Festive Wear</a></li>
      </ul>
      <p>Free shipping on orders over $350 to USA, Canada, and Australia. Flat rate $25 per order for orders under $350. Handcrafted with love by Indian artisans.</p>
    `,
  },
  {
       path: '/suits',
    title: 'Salwar Kameez & Suits | Anarkali & Palazzo Suits Online | LuxeMia',
    description: 'Shop elegant Salwar Kameez, designer suits, sharara sets, anarkali & palazzo suits online at LuxeMia. Premium fabrics, handcrafted embroidery. Free shipping to USA, Canada & Australia. Latest 2026 trends.',
    h1: 'Salwar Kameez & Designer Suits Collection',
    content: `
      <p>Explore our curated collection of Salwar Kameez and anarkali ensembles. From elegant sharara sets to flowing palazzo suits, each piece features beautiful embroidery on premium fabrics like georgette, silk, and chiffon.</p>
      <h2>Our Salwar Kameez Collection</h2>
      <p>Browse anarkali suits, sharara suits, palazzo sets, and straight-cut salwar kameez. Perfect for weddings, festive occasions, and celebrations.</p>
    `,
  },
  {
    path: '/lehengas',
    title: 'Lehengas Collection | Bridal & Wedding Lehengas Online | LuxeMia',
    description: 'Shop designer lehengas & bridal lehenga choli at LuxeMia. Handcrafted wedding & party wear lehengas. Premium silk, net & velvet. Free shipping on orders over $350 to USA, Canada & Australia. Latest 2026 trends.',
    h1: 'Designer Lehengas & Bridal Lehenga Collection',
    content: `
      <p>Discover our stunning collection of designer lehengas and bridal lehenga choli. Handcrafted with intricate embroidery on premium silk, net, and velvet fabrics. Each lehenga is a beautiful piece of Indian design.</p>
      <h2>Lehenga Categories</h2>
      <ul>
        <li><a href="/collections/bridal-lehengas">Bridal Lehengas</a> — Bridal lehenga choli for your special day</li>
        <li>Wedding Lehengas — Elegant designs for wedding celebrations</li>
        <li>Party Wear Lehengas — Stunning lehengas for festive occasions</li>
      </ul>
    `,
  },
  {
    path: '/sarees',
    title: 'Sarees Collection | Silk, Banarasi & Designer Sarees Online | LuxeMia',
    description: 'Shop designer sarees at LuxeMia. Banarasi silk, Kanjeevaram, georgette, chiffon, tissue, and pre-draped sarees with shipping to USA, Canada & Australia.',
    h1: 'Designer Sarees - Silk, Banarasi & Occasion Collection',
    content: `
      <p>Explore our broad collection of designer sarees. From Banarasi silk to elegant Kanjeevaram, georgette, chiffon, tissue, and pre-draped styles, each saree is made with care by skilled Indian makers for festivals, parties, and special occasions.</p>
      <h2>Saree Categories</h2>
      <ul>
        <li><a href="/collections/wedding-sarees">Wedding Sarees</a> — Traditional & contemporary wedding sarees</li>
        <li><a href="/collections/silk-sarees">Silk Sarees</a> - Banarasi, Kanjivaram, and Kanchipuram silk sarees</li>
        <li>Banarasi Silk Sarees — Handwoven in Varanasi</li>
        <li>Kanjeevaram Silk Sarees — Premium South Indian silk</li>
        <li>Georgette Sarees — Lightweight & elegant</li>
      </ul>
    `,
  },
  {
    path: '/menswear',
    title: 'Menswear | Sherwanis & Kurta Pajama Sets Online | LuxeMia',
    description: 'Shop Indian menswear at LuxeMia. Designer sherwanis, kurta sets, Indo-western wear & Modi jackets for grooms & weddings. Premium fabrics, expert tailoring. Free shipping on orders over $350 to USA, Canada & Australia.',
    h1: 'Indian Menswear — Sherwanis & Kurta Collection',
    content: `
      <p>Discover our premium collection of Indian menswear. From regal sherwanis for grooms to elegant kurta sets and modern Indo-western outfits, crafted with premium fabrics and expert tailoring.</p>
      <h2>Sherwanis for Grooms</h2>
      <p>Make a grand entrance on your wedding day with our designer sherwanis. Available in art silk, Banarasi jacquard, and velvet — each piece features intricate embroidery and expert tailoring for a regal look.</p>
      <h2>Kurta Sets & Indo-Western</h2>
      <p>Beyond sherwanis, explore our comfortable cotton and silk kurta pajama sets for festive gatherings, pujas, and casual ethnic wear. Our Indo-western collection blends traditional silhouettes with modern cuts for the contemporary Indian man.</p>
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
    description: 'Complete guide to sharara suits in 2026. Discover trending styles, best fabrics, and expert tips for choosing the perfect sharara set for weddings and festivals.',
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
    title: 'All Collections | Indian Ethnic Wear | LuxeMia',
    description: 'Browse all LuxeMia collections. Bridal lehengas, wedding sarees, reception outfits, festive wear & more. Curated for every occasion.',
    h1: 'All Collections',
    content: `
      <p>Browse our curated collections of Indian ethnic wear, thoughtfully organized for every occasion.</p>
      <ul>
        <li><a href="/collections/bridal-lehengas">Bridal Lehengas</a> — Bridal wear for your special day</li>
        <li><a href="/collections/wedding-sarees">Wedding Sarees</a> — Elegant sarees for wedding celebrations</li>
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
    title: 'Bridal Lehengas Online | Indian Wedding Lehenga for Brides - LuxeMia',
    description: 'Shop bridal lehengas online at LuxeMia. Explore Indian bridal lehenga choli styles for weddings, engagement, reception, and ceremony looks with custom sizing support.',
    h1: 'Bridal Lehengas for Indian Weddings',
    content: '<p>Shop Indian bridal lehengas selected for brides planning wedding, engagement, reception, sangeet, and ceremony looks. This bride-focused collection highlights wedding lehenga choli styles with embroidery, rich fabrics, and sizing options for online bridal shopping.</p><p>Browse the full <a href="/lehengas">lehenga collection</a> for broader festive and partywear styles, or continue wedding shopping with <a href="/collections/wedding-guest-outfits">wedding guest outfits</a> and <a href="/collections/mehendi-outfits">mehendi outfits</a>.</p>',
  },
  {
    path: '/collections/wedding-sarees',
    title: 'Wedding Sarees Online | Indian Bridal & Silk Sarees - LuxeMia',
    description: 'Shop wedding sarees online at LuxeMia. Explore Indian wedding sarees, Banarasi wedding sarees, Kanjivaram and Kanchipuram silk sarees for ceremonies.',
    h1: 'Wedding Sarees for Indian Ceremonies',
    content: '<p>Shop Indian wedding sarees selected for brides, family members, and wedding guests planning ceremony, engagement, reception, and sangeet looks. Explore Banarasi wedding sarees, Kanjivaram sarees, Kanchipuram silk wedding sarees, tissue sarees, zari work, and designer sarees for Indian wedding shopping online.</p><p>Browse the full <a href="/sarees">saree collection</a> for broader festive, casual, and everyday drape styles, or continue wedding shopping with <a href="/collections/bridal-lehengas">bridal lehengas</a> and <a href="/collections/wedding-guest-outfits">wedding guest outfits</a>.</p>',
  },
  {
    path: '/collections/reception-outfits',
    title: 'Reception Outfits Online | Indian Wedding Reception Dresses - LuxeMia',
    description: 'Shop reception outfits online at LuxeMia. Explore reception lehengas, sarees, gowns, Indo-western outfits, cocktail looks, and Indian party wear.',
    h1: 'Reception Outfits for Indian Weddings',
    content: '<p>Shop Indian reception outfits selected for wedding receptions, cocktail events, engagement parties, sangeet nights, and formal evening celebrations. This reception-focused collection highlights reception lehengas, reception sarees, reception gowns, Indo-western reception outfits, cocktail reception outfits, and party wear Indian outfits for polished event shopping online.</p><p>Browse <a href="/collections/wedding-guest-outfits">wedding guest outfits</a> for broader ceremony shopping, or explore <a href="/lehengas">reception lehengas</a>, <a href="/sarees">reception sarees</a>, <a href="/suits">anarkali suits</a>, and <a href="/indowestern">Indo-western outfits</a> for evening receptions and cocktail events.</p>',
  },
  {
    path: '/collections/party-wear-lehengas',
    title: 'Party Wear Lehengas Online | Indian Party Lehenga Choli - LuxeMia',
    description: 'Shop party wear lehengas online at LuxeMia. Explore Indian party lehengas, cocktail lehengas, sangeet lehengas, reception party lehengas, and wedding guest lehengas.',
    h1: 'Party Wear Lehengas for Indian Events',
    content: '<p>Shop party wear lehengas selected for sangeet nights, cocktail parties, wedding guest looks, festive celebrations, engagement events, and reception parties. This party-focused collection highlights party wear lehenga choli sets, Indian party lehengas, festive party lehengas, cocktail lehengas, sangeet lehengas, reception party lehengas, designer party lehengas, embroidered lehengas, sequins lehengas, and lightweight lehengas for event-ready shopping online.</p><p>Browse the full <a href="/lehengas">lehenga collection</a> for broader lehenga styles, or continue occasion shopping with <a href="/collections/reception-outfits">reception outfits</a>, <a href="/collections/wedding-guest-outfits">wedding guest outfits</a>, and <a href="/collections/diwali-outfits">Diwali outfits</a>.</p>',
  },
  {
    path: '/collections/designer-sarees',
    title: 'Designer Sarees Online | Indian Designer Sarees - LuxeMia',
    description: 'Shop designer sarees online at LuxeMia. Explore Indian designer sarees, party wear designer sarees, wedding guest sarees, festive sarees, and boutique sarees.',
    h1: 'Designer Sarees',
    content: '<p>Shop designer sarees selected for parties, wedding guest looks, receptions, festive celebrations, sangeet nights, and polished Indian event dressing. This designer-focused collection highlights Indian designer sarees online, party wear designer sarees, wedding guest sarees, festive designer sarees, embroidered sarees, silk sarees, georgette sarees, chiffon sarees, and boutique sarees for event-ready shopping.</p><p>Browse the full <a href="/sarees">saree collection</a> for broader drape styles, or continue occasion shopping with <a href="/collections/wedding-sarees">wedding sarees</a>, <a href="/collections/reception-outfits">reception outfits</a>, and <a href="/collections/wedding-guest-outfits">wedding guest outfits</a>.</p>',
  },
  {
    path: '/collections/silk-sarees',
    title: 'Silk Sarees Online | Banarasi & Kanchipuram Silk Sarees - LuxeMia',
    description: 'Shop silk sarees online at LuxeMia. Explore Banarasi silk sarees, Kanjivaram and Kanchipuram silk sarees, tissue silk, pattu sarees, and wedding silk sarees.',
    h1: 'Silk Sarees',
    content: '<p>Shop silk sarees selected for weddings, festivals, receptions, pujas, and heirloom-inspired Indian dressing. This silk-focused collection highlights Banarasi silk sarees, Kanjivaram silk sarees, Kanchipuram silk sarees, tissue silk sarees, pattu sarees, zari silk sarees, soft silk sarees, and wedding silk sarees for event-ready shopping online.</p><p>Browse the full <a href="/sarees">saree collection</a> for broader drape styles, or continue occasion shopping with <a href="/collections/wedding-sarees">wedding sarees</a>, <a href="/collections/designer-sarees">designer sarees</a>, and <a href="/collections/wedding-guest-outfits">wedding guest outfits</a>.</p>',
  },
  {
    path: '/collections/pakistani-suits',
    title: 'Pakistani Suits Online | Pakistani Salwar Suits - LuxeMia',
    description: 'Shop Pakistani suits online at LuxeMia. Explore Pakistani salwar suits, designer suits, lawn suits, wedding suits, Eid suits, anarkali suits, and palazzo suits.',
    h1: 'Pakistani Suits',
    content: '<p>Shop Pakistani suits and Pakistani salwar suits online for Eid, weddings, receptions, parties, festive gatherings, and everyday occasion dressing. This collection highlights Pakistani designer suits, lawn suits, wedding suits, Eid suits, anarkali suits, palazzo suits, sharara suits, gharara suits, and embroidered salwar kameez styles for shoppers in the USA, Canada, Australia, and beyond.</p><p>Browse the full <a href="/suits">suit collection</a> for broader salwar kameez styles, or continue occasion shopping with <a href="/collections/eid-outfits">Eid outfits</a>, <a href="/collections/wedding-guest-outfits">wedding guest outfits</a>, and <a href="/collections/reception-outfits">reception outfits</a>.</p>',
  },
  {
    path: '/collections/anarkali-suits',
    title: 'Anarkali Suits Online | Designer Anarkali Suits - LuxeMia',
    description: 'Shop Anarkali suits online at LuxeMia. Explore designer Anarkali suits, wedding Anarkali suits, party wear Anarkali suits, floor length styles, and embroidered festive suits.',
    h1: 'Anarkali Suits',
    content: '<p>Shop Anarkali suits online for weddings, parties, Eid, festivals, receptions, sangeet nights, and polished Indian occasion dressing. This collection highlights designer Anarkali suits, wedding Anarkali suits, party wear Anarkali suits, floor length Anarkali suits, embroidered Anarkali suits, and festive Anarkali suits for shoppers in the USA, Canada, Australia, and worldwide.</p><p>Browse the full <a href="/suits">suit collection</a> for broader salwar kameez styles, or continue occasion shopping with <a href="/collections/pakistani-suits">Pakistani suits</a>, <a href="/collections/wedding-guest-outfits">wedding guest outfits</a>, and <a href="/collections/reception-outfits">reception outfits</a>.</p>',
  },
  {
    path: '/collections/salwar-kameez',
    title: 'Salwar Kameez Online | Designer Indian Salwar Suits - LuxeMia',
    description: 'Shop salwar kameez online at LuxeMia. Explore designer salwar kameez, Indian salwar suits, embroidered suits, festive salwar suits, party wear styles, and Pakistani style salwar kameez.',
    h1: 'Salwar Kameez',
    content: '<p>Shop salwar kameez and Indian salwar suits online for weddings, parties, Eid, festivals, receptions, and everyday occasion dressing. This collection highlights designer salwar kameez, embroidered salwar kameez, festive salwar suits, party wear salwar kameez, Pakistani style salwar kameez, and ethnic suits for women shopping from the USA, Canada, Australia, and worldwide.</p><p>Browse the full <a href="/suits">suit collection</a> for broader suit styles, or continue occasion shopping with <a href="/collections/anarkali-suits">Anarkali suits</a>, <a href="/collections/pakistani-suits">Pakistani suits</a>, and <a href="/collections/eid-outfits">Eid outfits</a>.</p>',
  },
  {
    path: '/collections/sharara-suits',
    title: 'Sharara Suits Online | Designer Sharara Sets - LuxeMia',
    description: 'Shop sharara suits online at LuxeMia. Explore designer sharara suits, sharara sets, wedding sharara suits, party wear sharara suits, Pakistani sharara suits, festive outfits, and embroidered styles.',
    h1: 'Sharara Suits',
    content: '<p>Shop sharara suits and sharara sets online for weddings, parties, Eid, festivals, mehendi, sangeet, nikah events, receptions, and polished Indian occasion dressing. This collection highlights designer sharara suits, wedding sharara suits, party wear sharara suits, Pakistani sharara suits, embroidered sharara suits, and festive sharara outfits for shoppers in the USA, Canada, Australia, and worldwide.</p><p>Browse the full <a href="/suits">suit collection</a> for broader salwar kameez styles, or continue occasion shopping with <a href="/collections/salwar-kameez">salwar kameez</a>, <a href="/collections/anarkali-suits">Anarkali suits</a>, and <a href="/collections/pakistani-suits">Pakistani suits</a>.</p>',
  },
  {
    path: '/collections/gharara-suits',
    title: 'Gharara Suits Online | Designer Gharara Sets - LuxeMia',
    description: 'Shop gharara suits online at LuxeMia. Explore designer gharara suits, gharara sets, wedding gharara suits, party wear gharara suits, Pakistani gharara suits, festive outfits, and embroidered styles.',
    h1: 'Gharara Suits',
    content: '<p>Shop gharara suits and gharara sets online for weddings, parties, Eid, festivals, mehendi, sangeet, nikah events, receptions, and polished Indian occasion dressing. This collection highlights designer gharara suits, wedding gharara suits, party wear gharara suits, Pakistani gharara suits, embroidered gharara suits, and festive gharara outfits for shoppers in the USA, Canada, Australia, and worldwide.</p><p>Browse the full <a href="/suits">suit collection</a> for broader salwar kameez styles, or continue occasion shopping with <a href="/collections/salwar-kameez">salwar kameez</a>, <a href="/collections/sharara-suits">Sharara suits</a>, and <a href="/collections/pakistani-suits">Pakistani suits</a>.</p>',
  },
  {
    path: '/collections/indo-western-dresses',
    title: 'Indo Western Dresses Online | Indian Fusion Wear - LuxeMia',
    description: 'Shop Indo Western dresses online at LuxeMia. Explore Indian fusion dresses, party wear Indo Western outfits, wedding guest looks, modern ethnic dresses, and Indian cocktail outfits.',
    h1: 'Indo Western Dresses',
    content: '<p>Shop Indo Western dresses and Indian fusion dresses for receptions, sangeet nights, cocktail parties, festive dinners, and wedding guest occasions. This collection highlights Indo Western outfits for women, wedding guest Indo Western dresses, party wear Indo Western dresses, modern ethnic dresses, Indian cocktail outfits, and festive fusion wear.</p><p>Browse the full <a href="/indowestern">Indo-Western collection</a> for broader fusion styles, or continue occasion shopping with <a href="/collections/reception-outfits">reception outfits</a>, <a href="/collections/wedding-guest-outfits">wedding guest outfits</a>, and <a href="/collections/party-wear-lehengas">party wear lehengas</a>.</p>',
  },
  {
    path: '/collections/kurta-sets',
    title: 'Kurta Sets Online | Designer Indian Kurta Sets - LuxeMia',
    description: 'Shop kurta sets online at LuxeMia. Explore designer kurta sets, Indian kurta sets, festive kurta sets, wedding guest kurta sets, kurta pant sets, and kurta dupatta sets.',
    h1: 'Kurta Sets',
    content: '<p>Shop kurta sets and Indian kurta sets for festive events, wedding guest looks, parties, Eid, Diwali, family celebrations, and polished everyday ethnic wear. This collection highlights designer kurta sets, festive kurta sets, wedding guest kurta sets, kurta pant sets, kurta dupatta sets, ethnic kurta sets for women, and Indian outfits for women.</p><p>Browse the full <a href="/suits">suit collection</a> for broader salwar kameez styles, or continue occasion shopping with <a href="/collections/salwar-kameez">salwar kameez</a>, <a href="/collections/anarkali-suits">Anarkali suits</a>, and <a href="/collections/wedding-guest-outfits">wedding guest outfits</a>.</p>',
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
    description: 'LuxeMia size guide for Indian ethnic wear. Find your perfect fit with our detailed measurement charts for sarees, lehengas, suits & menswear. US & international size conversions.',
    h1: 'Size Guide',
    content: '<p>Find your perfect fit with our detailed measurement charts. Includes bust, waist, and hip measurements with US and international size conversions for all garments including lehengas, sarees, and salwar suits.</p>',
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
    description: 'Explore the LuxeMia 2026 Lookbook — curated styling stories featuring wedding lehengas, sherwanis, sharara suits, and festive ethnic wear. Editorial inspiration for the modern Indian wardrobe.',
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
    title: 'New Arrivals — Latest Indian Ethnic Wear Collection | LuxeMia',
    description: 'Shop the latest arrivals at LuxeMia. New designer lehengas, sarees, suits & more. Fresh styles added weekly. Free shipping on orders over $350 to USA, Canada & Australia.',
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
    title: 'Bestsellers — Most Loved Indian Ethnic Wear | LuxeMia',
    description: 'Shop LuxeMia bestsellers. Our most popular lehengas, sarees, suits & menswear chosen by customers worldwide. Free shipping on orders over $350 to USA, Canada & Australia.',
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
    title: 'Indo-Western Collection — Fusion Ethnic Wear | LuxeMia',
    description: 'Shop Indo-Western fusion wear at LuxeMia. Modern ethnic suits, fusion lehengas & contemporary Indian outfits. Free shipping on orders over $350 to USA, Canada & Australia.',
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
      <p>Browse <a href="/collections/bridal-lehengas">bridal lehengas</a>, <a href="/sarees">designer sarees</a>, <a href="/suits">salwar kameez</a>, and <a href="/menswear">sherwanis</a> — all handcrafted in India and shipped directly to your US address.</p>
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
      <p>Browse <a href="/collections/bridal-lehengas">bridal lehengas</a>, <a href="/sarees">designer sarees</a>, <a href="/suits">salwar kameez</a>, and <a href="/menswear">sherwanis</a> — handcrafted in India and delivered across Canada.</p>
    `,
  },
  // --- NRI sub-pages ---
  {
    path: '/nri/usa',
    title: 'Indian Ethnic Wear USA — Free Shipping to America | LuxeMia',
    description: 'Shop Indian ethnic wear online in the USA. Bridal lehengas, silk sarees, salwar suits with free shipping across America. Duty-free under $800. Authentic Indian craftsmanship.',
    h1: 'Indian Ethnic Wear for USA',
    content: `
      <p>LuxeMia delivers authentic Indian ethnic wear straight to your doorstep in the USA. Shop bridal lehengas, silk sarees, salwar kameez, and designer sherwanis with free shipping on orders over $350.</p>
      <h2>Free Shipping Across America</h2>
      <p>Standard shipping takes 7-12 business days via DHL Express with full tracking. Express shipping (3-5 business days) is also available at checkout. Free standard shipping on all orders over $350 to the contiguous United States.</p>
      <h2>Duty-Free Under $800</h2>
      <p>Most individual orders under $800 enter the US duty-free under the de minimis threshold. No hidden customs fees or surprises at delivery. Orders over $800 may be subject to import duties.</p>
      <h2>Shop by Category</h2>
      <ul>
        <li><a href="/collections/bridal-lehengas">Bridal Lehengas</a> — Designer lehenga choli for your wedding</li>
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
    description: 'Shop Indian ethnic wear online in Canada. Bridal lehengas, silk sarees, salwar suits with free shipping coast to coast. 10-14 day delivery. Authentic Indian craftsmanship.',
    h1: 'Indian Ethnic Wear for Canada',
    content: `
      <p>LuxeMia delivers authentic Indian ethnic wear to Canada. Shop bridal lehengas, silk sarees, salwar kameez, and designer sherwanis with free shipping on orders over $350.</p>
      <h2>Free Shipping Coast to Coast</h2>
      <p>Standard shipping takes 10-14 business days with full tracking. We deliver to all Canadian provinces and territories including British Columbia, Alberta, Ontario, and Quebec. Express shipping (5-7 days) also available.</p>
      <h2>Canadian Customs Information</h2>
      <p>Canadian customs may charge GST/HST (5-15% depending on province) and import duties on textile imports. These charges are collected by the carrier at delivery. Every package is fully insured.</p>
      <h2>Shop by Category</h2>
      <ul>
        <li><a href="/collections/bridal-lehengas">Bridal Lehengas</a> — Designer lehenga choli for your wedding</li>
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
    description: 'Shop Diwali outfits for women at LuxeMia. Lehengas, anarkali suits, sarees & salwar kameez in gold, red & festive colors. Free shipping to USA, Canada & Australia.',
    h1: 'Diwali Outfits 2026',
    content: `
      <p>Celebrate the festival of lights in style with LuxeMia's festive Indian ethnic wear. From gold-embroidered lehengas and embellished anarkali suits to silk sarees and festive salwar kameez, our Diwali collection captures the warmth, colour, and tradition of this cherished celebration.</p>
      <h2>What to Wear for Diwali</h2>
      <p>Diwali calls for your most festive, vibrant ethnic wear. For the main Diwali day and Lakshmi Puja, traditional silk sarees in red, gold, or green are considered auspicious. For Diwali parties and evening celebrations, a heavily embellished lehenga with mirror work, zari embroidery, or sequin detailing photographs beautifully against the backdrop of diyas and fairy lights.</p>
      <h2>Diwali Outfit Colors</h2>
      <p>Gold is the quintessential Diwali color — representing prosperity and the blessing of Goddess Lakshmi. Red, deep green, royal purple, burnt orange, and navy blue are also widely worn. Fabrics with gold zari work, sequin embellishments, or mirror details catch the Diwali diyas beautifully.</p>
      <h2>Shop Diwali Outfits</h2>
      <ul>
        <li><a href="/collections/bridal-lehengas">Bridal Lehengas</a> — Embellished lehengas perfect for Diwali</li>
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
    description: 'Shop Indian wedding guest outfits at LuxeMia. Sarees, anarkali suits, lehengas & salwar kameez perfect for Indian weddings. Free shipping to USA, Canada & Australia.',
    h1: 'Indian Wedding Guest Outfits',
    content: `
      <p>Dress to impress at every Indian wedding ceremony — from the colourful mehendi and vibrant sangeet to the elegant wedding day and glamorous reception. LuxeMia's wedding guest collection features silk sarees, embroidered anarkali suits, festive lehengas, and salwar kameez sets in celebration-worthy fabrics and colours.</p>
      <h2>What to Wear to Each Indian Wedding Ceremony</h2>
      <p>The mehendi is a daytime ceremony calling for bright, cheerful outfits in yellow, lime green, orange, or floral prints. The sangeet is the most festive ceremony — wear your most glamorous embellished lehengas or sequin anarkalis. The main wedding ceremony is the most formal — avoid red (the bridal colour) and white. The reception is the most flexible — semi-formal to formal ethnic or indo-western outfits are appropriate.</p>
      <h2>Shop by Ceremony</h2>
      <ul>
        <li><a href="/collections/bridal-lehengas">Bridal Lehengas</a> — Wedding guest lehengas for the main ceremony</li>
        <li><a href="/collections/wedding-sarees">Wedding Sarees</a> — Wedding guest sarees for formal ceremonies</li>
        <li><a href="/suits">Anarkali Suits</a> — Versatile suits for multiple wedding ceremonies</li>
        <li><a href="/collections/mehendi-outfits">Mehendi Outfits</a> — Bright and festive mehendi ceremony wear</li>
      </ul>
      <p>Free shipping on orders over $350 to USA, Canada, and Australia. Standard delivery 7-10 business days.</p>
    `,
  },
  {
    path: '/collections/mehendi-outfits',
    title: 'Mehendi Ceremony Outfits — Yellow, Green & Festive Indian Ethnic Wear | LuxeMia',
    description: 'Shop mehendi ceremony outfits at LuxeMia. Yellow & green lehengas, anarkali suits & salwar kameez for mehendi functions. Free shipping to USA, Canada & Australia.',
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
    description: 'Shop Eid outfits 2026 at LuxeMia. Chikankari suits, sharara sets, anarkali & lehengas in pastel & white for Eid celebrations. Free shipping to USA, Canada & Australia.',
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
    description: 'Shop Navratri outfits 2026 at LuxeMia. Chaniya choli, garba lehengas & festive Indian ethnic wear in all nine Navratri colours. Free shipping to USA, Canada & Australia.',
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
    path: '/virtual-try-on',
    title: 'Virtual Try-On — See How You Look in Indian Ethnic Wear | LuxeMia',
    description: 'Try on Indian ethnic wear virtually at LuxeMia. See how lehengas, sarees & suits look on you before you buy. Free virtual fitting room.',
    h1: 'Virtual Try-On',
    content: '<p>Can\'t try it on in person? Use our virtual try-on feature to see how our lehengas, sarees, and suits look on you before you buy.</p>',
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
  // --- Product pages ---
  {
    path: '/product/ethereal-pastel-pink-bridal-lehenga',
    title: 'Ethereal Pastel Pink Bridal Lehenga | LuxeMia',
    description: 'Shop the Ethereal Pastel Pink Bridal Lehenga at LuxeMia. Handcrafted with intricate embroidery on premium fabric. Free worldwide shipping.',
    h1: 'Ethereal Pastel Pink Bridal Lehenga',
    content: '<p>A dreamy pastel pink bridal lehenga featuring intricate handcrafted embroidery. Perfect for the modern bride who wants a soft, romantic look.</p>',
  },
  {
    path: '/product/royal-rani-pink-silk-bridal-lehenga',
    title: 'Royal Rani Pink Silk Bridal Lehenga | LuxeMia',
    description: 'Shop the Royal Rani Pink Silk Bridal Lehenga at LuxeMia. Premium silk with zari embroidery. Free worldwide shipping.',
    h1: 'Royal Rani Pink Silk Bridal Lehenga',
    content: '<p>A regal rani pink bridal lehenga crafted from premium silk with beautiful zari embroidery. Make a royal statement on your wedding day.</p>',
  },
  {
    path: '/product/classic-bridal-red-silk-lehenga',
    title: 'Classic Bridal Red Silk Lehenga | LuxeMia',
    description: 'Shop the Classic Bridal Red Silk Lehenga at LuxeMia. Traditional red silk with gold embroidery. Free worldwide shipping.',
    h1: 'Classic Bridal Red Silk Lehenga',
    content: '<p>The quintessential bridal red lehenga in luxurious silk with gold embroidery. A timeless choice for the traditional Indian bride.</p>',
  },
  {
    path: '/product/ivory-dreamscape-net-bridal-lehenga',
    title: 'Ivory Dreamscape Net Bridal Lehenga | LuxeMia',
    description: 'Shop the Ivory Dreamscape Net Bridal Lehenga at LuxeMia. Elegant net fabric with delicate embroidery. Free worldwide shipping.',
    h1: 'Ivory Dreamscape Net Bridal Lehenga',
    content: '<p>An ethereal ivory bridal lehenga in delicate net fabric with intricate embroidery. For the bride who dares to be different.</p>',
  },
  {
    path: '/product/lavender-mist-bridal-lehenga',
    title: 'Lavender Mist Bridal Lehenga | LuxeMia',
    description: 'Shop the Lavender Mist Bridal Lehenga at LuxeMia. Beautiful lavender with embroidery work. Free worldwide shipping.',
    h1: 'Lavender Mist Bridal Lehenga',
    content: '<p>A stunning lavender bridal lehenga with delicate embroidery. A modern, romantic choice for the contemporary bride.</p>',
  },
  {
    path: '/product/metallic-silver-celebration-lehenga',
    title: 'Metallic Silver Celebration Lehenga | LuxeMia',
    description: 'Shop the Metallic Silver Celebration Lehenga at LuxeMia. Glamorous silver lehenga for reception & parties. Free worldwide shipping.',
    h1: 'Metallic Silver Celebration Lehenga',
    content: '<p>Turn heads with this glamorous metallic silver lehenga. Perfect for wedding receptions, sangeet, and celebration events.</p>',
  },
  {
    path: '/product/burgundy-velvet-wedding-lehenga',
    title: 'Burgundy Velvet Wedding Lehenga | LuxeMia',
    description: 'Shop the Burgundy Velvet Wedding Lehenga at LuxeMia. Velvet with embroidery. Free worldwide shipping.',
    h1: 'Burgundy Velvet Wedding Lehenga',
    content: '<p>A rich burgundy wedding lehenga in velvet with beautiful embroidery. Bold, elegant, and unforgettable.</p>',
  },
  {
    path: '/product/wine-romance-net-lehenga',
    title: 'Wine Romance Net Lehenga | LuxeMia',
    description: 'Shop the Wine Romance Net Lehenga at LuxeMia. Wine-colored net lehenga with embroidery. Free worldwide shipping.',
    h1: 'Wine Romance Net Lehenga',
    content: '<p>A romantic wine-colored lehenga in net fabric with delicate embroidery. Perfect for evening celebrations and cocktail events.</p>',
  },
  {
    path: '/product/emerald-forest-wedding-lehenga',
    title: 'Emerald Forest Wedding Lehenga | LuxeMia',
    description: 'Shop the Emerald Forest Wedding Lehenga at LuxeMia. Rich emerald green with embroidery. Free worldwide shipping.',
    h1: 'Emerald Forest Wedding Lehenga',
    content: '<p>A stunning emerald green wedding lehenga with intricate embroidery. For the bride who loves rich, jewel-toned elegance.</p>',
  },
  {
    path: '/product/silk-yellow-occasional-embroidery-saree',
    title: 'Silk Yellow Occasional Embroidery Saree | LuxeMia',
    description: 'Shop the Silk Yellow Occasional Embroidery Saree at LuxeMia. Bright yellow silk with embroidery. Free worldwide shipping.',
    h1: 'Silk Yellow Occasional Embroidery Saree',
    content: '<p>A vibrant yellow silk saree with beautiful embroidery work. Perfect for haldi ceremonies, festive occasions, and celebrations.</p>',
  },
  {
    path: '/product/silk-light-pink-occasional-embroidery-saree',
    title: 'Silk Light Pink Occasional Embroidery Saree | LuxeMia',
    description: 'Shop the Silk Light Pink Occasional Embroidery Saree at LuxeMia. Soft pink silk with embroidery. Free worldwide shipping.',
    h1: 'Silk Light Pink Occasional Embroidery Saree',
    content: '<p>A soft light pink silk saree with delicate embroidery. Perfect for mehendi, baby showers, and daytime celebrations.</p>',
  },
  {
    path: '/product/grey-art-silk-groom-sherwani',
    title: 'Grey Art Silk Groom Sherwani | LuxeMia',
    description: 'Shop the Grey Art Silk Groom Sherwani at LuxeMia. Elegant grey sherwani for grooms. Free worldwide shipping.',
    h1: 'Grey Art Silk Groom Sherwani',
    content: '<p>An elegant grey sherwani in art silk, perfect for the modern groom. Subtle embroidery and refined tailoring for a sophisticated look.</p>',
  },
  {
    path: '/product/purple-art-silk-groom-sherwani',
    title: 'Purple Art Silk Groom Sherwani | LuxeMia',
    description: 'Shop the Purple Art Silk Groom Sherwani at LuxeMia. Royal purple sherwani for grooms. Free worldwide shipping.',
    h1: 'Purple Art Silk Groom Sherwani',
    content: '<p>A royal purple sherwani in art silk with beautiful detailing. Make a regal impression on your wedding day.</p>',
  },
  {
    path: '/product/teal-green-chinnon-silk-sharara-set',
    title: 'Teal Green Chinnon Silk Sharara Set | LuxeMia',
    description: 'Shop the Teal Green Chinnon Silk Sharara Set at LuxeMia. Beautiful teal sharara suit. Free worldwide shipping.',
    h1: 'Teal Green Chinnon Silk Sharara Set',
    content: '<p>A stunning teal green sharara set in chinnon silk with embroidery. Perfect for sangeet, mehendi, and festive celebrations.</p>',
  },
  {
    path: '/product/dusty-rose-silk-party-anarkali',
    title: 'Dusty Rose Silk Party Anarkali | LuxeMia',
    description: 'Shop the Dusty Rose Silk Party Anarkali at LuxeMia. Elegant dusty rose anarkali suit. Free worldwide shipping.',
    h1: 'Dusty Rose Silk Party Anarkali',
    content: '<p>An elegant dusty rose anarkali in premium silk. Flowing silhouette with delicate embroidery — perfect for parties and celebrations.</p>',
  },
  // --- Shopify Palazzo Suit product pages ---
  {
    path: '/product/crepe-silk-multi-color-party-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Crepe Silk Multi Color Party Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Crepe Silk Multi Color Party Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Beautiful crepe silk with intricate embroidery. Free worldwide shipping.',
    h1: 'Crepe Silk Multi Color Party Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A stunning multi color crepe silk palazzo suit with beautiful embroidery work. Perfect for parties and festive celebrations.</p>',
  },
  {
    path: '/product/crepe-silk-multi-color-party-wear-embroidery-work-readymade-plazzo-suit-2',
    title: 'Crepe Silk Multi Color Party Wear Embroidery Work Readymade Palazzo Suit 2 | LuxeMia',
    description: 'Shop the Crepe Silk Multi Color Party Wear Embroidery Work Readymade Palazzo Suit 2 at LuxeMia. Beautiful crepe silk with intricate embroidery. Free worldwide shipping.',
    h1: 'Crepe Silk Multi Color Party Wear Embroidery Work Readymade Palazzo Suit 2',
    content: '<p>A gorgeous multi color crepe silk palazzo suit featuring delicate embroidery. An elegant choice for party wear occasions.</p>',
  },
  {
    path: '/product/crepe-silk-multi-color-party-wear-embroidery-work-readymade-plazzo-suit-3',
    title: 'Crepe Silk Multi Color Party Wear Embroidery Work Readymade Palazzo Suit 3 | LuxeMia',
    description: 'Shop the Crepe Silk Multi Color Party Wear Embroidery Work Readymade Palazzo Suit 3 at LuxeMia. Beautiful crepe silk with intricate embroidery. Free worldwide shipping.',
    h1: 'Crepe Silk Multi Color Party Wear Embroidery Work Readymade Palazzo Suit 3',
    content: '<p>A vibrant multi color crepe silk palazzo suit with exquisite embroidery. Make a statement at any party or celebration.</p>',
  },
  {
    path: '/product/chinon-silk-wine-party-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Chinon Silk Wine Party Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Chinon Silk Wine Party Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Rich wine chinon silk with embroidery. Free worldwide shipping.',
    h1: 'Chinon Silk Wine Party Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A rich wine chinon silk palazzo suit with beautiful embroidery work. Perfect for evening parties and special occasions.</p>',
  },
  {
    path: '/product/chinon-silk-lime-yellow-party-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Chinon Silk Lime Yellow Party Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Chinon Silk Lime Yellow Party Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Bright lime yellow chinon silk with embroidery. Free worldwide shipping.',
    h1: 'Chinon Silk Lime Yellow Party Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A bright lime yellow chinon silk palazzo suit featuring intricate embroidery. Stand out at parties and festive gatherings.</p>',
  },
  {
    path: '/product/chinon-silk-rani-pink-party-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Chinon Silk Rani Pink Party Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Chinon Silk Rani Pink Party Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Vibrant rani pink chinon silk with embroidery. Free worldwide shipping.',
    h1: 'Chinon Silk Rani Pink Party Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A vibrant rani pink chinon silk palazzo suit with beautiful embroidery. A stunning choice for parties and celebrations.</p>',
  },
  {
    path: '/product/shimmer-silk-light-green-festival-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Shimmer Silk Light Green Festival Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Shimmer Silk Light Green Festival Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Shimmering light green silk with embroidery. Free worldwide shipping.',
    h1: 'Shimmer Silk Light Green Festival Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A shimmering light green silk palazzo suit with delicate embroidery. Perfect for festivals and cultural celebrations.</p>',
  },
  {
    path: '/product/shimmer-silk-pink-festival-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Shimmer Silk Pink Festival Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Shimmer Silk Pink Festival Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Shimmering pink silk with embroidery. Free worldwide shipping.',
    h1: 'Shimmer Silk Pink Festival Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A gorgeous shimmering pink silk palazzo suit featuring intricate embroidery. An elegant pick for festival celebrations.</p>',
  },
  {
    path: '/product/shimmer-silk-turquoise-festival-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Shimmer Silk Turquoise Festival Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Shimmer Silk Turquoise Festival Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Stunning turquoise shimmer silk with embroidery. Free worldwide shipping.',
    h1: 'Shimmer Silk Turquoise Festival Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A stunning turquoise shimmer silk palazzo suit with beautiful embroidery. Make a vibrant impression at festivals and celebrations.</p>',
  },
  {
    path: '/product/chinon-silk-orange-occasional-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Chinon Silk Orange Occasional Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Chinon Silk Orange Occasional Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Bright orange chinon silk with embroidery. Free worldwide shipping.',
    h1: 'Chinon Silk Orange Occasional Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A bright orange chinon silk palazzo suit with exquisite embroidery. Perfect for occasional wear and special events.</p>',
  },
  {
    path: '/product/chinon-silk-navy-blue-occasional-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Chinon Silk Navy Blue Occasional Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Chinon Silk Navy Blue Occasional Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Elegant navy blue chinon silk with embroidery. Free worldwide shipping.',
    h1: 'Chinon Silk Navy Blue Occasional Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>An elegant navy blue chinon silk palazzo suit with beautiful embroidery. A sophisticated choice for occasional events.</p>',
  },
  {
    path: '/product/fendy-silk-maroon-festival-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Fendy Silk Maroon Festival Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Fendy Silk Maroon Festival Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Rich maroon fendy silk with embroidery. Free worldwide shipping.',
    h1: 'Fendy Silk Maroon Festival Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A rich maroon fendy silk palazzo suit with intricate embroidery. Perfect for festival celebrations and cultural events.</p>',
  },
  {
    path: '/product/fendy-silk-black-festival-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Fendy Silk Black Festival Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Fendy Silk Black Festival Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Elegant black fendy silk with embroidery. Free worldwide shipping.',
    h1: 'Fendy Silk Black Festival Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>An elegant black fendy silk palazzo suit with beautiful embroidery. A timeless choice for festival wear and special occasions.</p>',
  },
  {
    path: '/product/fendy-silk-navy-blue-festival-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Fendy Silk Navy Blue Festival Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Fendy Silk Navy Blue Festival Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Sophisticated navy blue fendy silk with embroidery. Free worldwide shipping.',
    h1: 'Fendy Silk Navy Blue Festival Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A sophisticated navy blue fendy silk palazzo suit with delicate embroidery. Perfect for festive celebrations and evening events.</p>',
  },
  {
    path: '/product/chinon-navy-blue-occasional-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Chinon Navy Blue Occasional Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Chinon Navy Blue Occasional Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Elegant navy blue chinon with embroidery. Free worldwide shipping.',
    h1: 'Chinon Navy Blue Occasional Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>An elegant navy blue chinon palazzo suit with beautiful embroidery. A refined choice for occasional wear and gatherings.</p>',
  },
  {
    path: '/product/chinon-hot-pink-occasional-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Chinon Hot Pink Occasional Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Chinon Hot Pink Occasional Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Vibrant hot pink chinon with embroidery. Free worldwide shipping.',
    h1: 'Chinon Hot Pink Occasional Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A vibrant hot pink chinon palazzo suit with exquisite embroidery. Make a bold statement at occasional events.</p>',
  },
  {
    path: '/product/chinon-green-occasional-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Chinon Green Occasional Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Chinon Green Occasional Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Fresh green chinon with embroidery. Free worldwide shipping.',
    h1: 'Chinon Green Occasional Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A fresh green chinon palazzo suit with beautiful embroidery. An elegant choice for occasional wear and celebrations.</p>',
  },
  {
    path: '/product/chinon-violet-occasional-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Chinon Violet Occasional Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Chinon Violet Occasional Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Elegant violet chinon with embroidery. Free worldwide shipping.',
    h1: 'Chinon Violet Occasional Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>An elegant violet chinon palazzo suit with intricate embroidery. A graceful choice for occasional events and gatherings.</p>',
  },
  {
    path: '/product/georgette-pink-occasional-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Georgette Pink Occasional Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Georgette Pink Occasional Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Soft pink georgette with embroidery. Free worldwide shipping.',
    h1: 'Georgette Pink Occasional Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A soft pink georgette palazzo suit with delicate embroidery. Perfect for occasional wear and daytime celebrations.</p>',
  },
  {
    path: '/product/georgette-wine-occasional-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Georgette Wine Occasional Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Georgette Wine Occasional Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Rich wine georgette with embroidery. Free worldwide shipping.',
    h1: 'Georgette Wine Occasional Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A rich wine georgette palazzo suit with beautiful embroidery. A sophisticated choice for occasional events and evening celebrations.</p>',
  },
  {
    path: '/product/georgette-green-occasional-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Georgette Green Occasional Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Georgette Green Occasional Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Fresh green georgette with embroidery. Free worldwide shipping.',
    h1: 'Georgette Green Occasional Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A fresh green georgette palazzo suit with intricate embroidery. Perfect for occasional wear and festive gatherings.</p>',
  },
  {
    path: '/product/georgette-purple-occasional-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Georgette Purple Occasional Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Georgette Purple Occasional Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Elegant purple georgette with embroidery. Free worldwide shipping.',
    h1: 'Georgette Purple Occasional Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>An elegant purple georgette palazzo suit with beautiful embroidery. A regal choice for occasional events and celebrations.</p>',
  },
  {
    path: '/product/fendy-silk-teal-blue-festival-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Fendy Silk Teal Blue Festival Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Fendy Silk Teal Blue Festival Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Stunning teal blue fendy silk with embroidery. Free worldwide shipping.',
    h1: 'Fendy Silk Teal Blue Festival Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A stunning teal blue fendy silk palazzo suit with exquisite embroidery. Perfect for festival celebrations and cultural events.</p>',
  },
  {
    path: '/product/fendy-silk-rani-pink-festival-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Fendy Silk Rani Pink Festival Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Fendy Silk Rani Pink Festival Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Vibrant rani pink fendy silk with embroidery. Free worldwide shipping.',
    h1: 'Fendy Silk Rani Pink Festival Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A vibrant rani pink fendy silk palazzo suit with beautiful embroidery. Make a striking impression at festivals and celebrations.</p>',
  },
  {
    path: '/product/chinon-silk-orange-party-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Chinon Silk Orange Party Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Chinon Silk Orange Party Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Bright orange chinon silk with embroidery. Free worldwide shipping.',
    h1: 'Chinon Silk Orange Party Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A bright orange chinon silk palazzo suit with beautiful embroidery work. Perfect for party wear and festive occasions.</p>',
  },
  {
    path: '/product/hot-pink-chinon-party-wear-embroidery-work-readymade-plazzo-suit',
    title: 'Hot Pink Chinon Party Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Hot Pink Chinon Party Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Vibrant hot pink chinon with embroidery. Free worldwide shipping.',
    h1: 'Hot Pink Chinon Party Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A vibrant hot pink chinon palazzo suit with exquisite embroidery. A bold and beautiful choice for party wear occasions.</p>',
  },
  // --- Shopify Patiala Suit product pages ---
  {
    path: '/product/silk-black-occasional-wear-mirror-work-readymade-patiyala-suit',
    title: 'Silk Black Occasional Wear Mirror Work Readymade Patiala Suit | LuxeMia',
    description: 'Shop the Silk Black Occasional Wear Mirror Work Readymade Patiala Suit at LuxeMia. Elegant black silk with mirror work. Free worldwide shipping.',
    h1: 'Silk Black Occasional Wear Mirror Work Readymade Patiala Suit',
    content: '<p>An elegant black silk patiala suit with stunning mirror work. Perfect for occasional wear and special celebrations.</p>',
  },
  {
    path: '/product/silk-light-pink-occasional-wear-mirror-work-readymade-patiyala-suit',
    title: 'Silk Light Pink Occasional Wear Mirror Work Readymade Patiala Suit | LuxeMia',
    description: 'Shop the Silk Light Pink Occasional Wear Mirror Work Readymade Patiala Suit at LuxeMia. Soft light pink silk with mirror work. Free worldwide shipping.',
    h1: 'Silk Light Pink Occasional Wear Mirror Work Readymade Patiala Suit',
    content: '<p>A soft light pink silk patiala suit with beautiful mirror work. An elegant choice for occasional wear and gatherings.</p>',
  },
  {
    path: '/product/silk-green-occasional-wear-mirror-work-readymade-patiyala-suit',
    title: 'Silk Green Occasional Wear Mirror Work Readymade Patiala Suit | LuxeMia',
    description: 'Shop the Silk Green Occasional Wear Mirror Work Readymade Patiala Suit at LuxeMia. Fresh green silk with mirror work. Free worldwide shipping.',
    h1: 'Silk Green Occasional Wear Mirror Work Readymade Patiala Suit',
    content: '<p>A fresh green silk patiala suit with exquisite mirror work. Perfect for occasional events and festive celebrations.</p>',
  },
  {
    path: '/product/silk-maroon-occasional-wear-mirror-work-readymade-patiyala-suit',
    title: 'Silk Maroon Occasional Wear Mirror Work Readymade Patiala Suit | LuxeMia',
    description: 'Shop the Silk Maroon Occasional Wear Mirror Work Readymade Patiala Suit at LuxeMia. Rich maroon silk with mirror work. Free worldwide shipping.',
    h1: 'Silk Maroon Occasional Wear Mirror Work Readymade Patiala Suit',
    content: '<p>A rich maroon silk patiala suit with beautiful mirror work. A sophisticated choice for occasional wear and celebrations.</p>',
  },
  {
    path: '/product/silk-rani-pink-occasional-wear-mirror-work-readymade-patiyala-suit',
    title: 'Silk Rani Pink Occasional Wear Mirror Work Readymade Patiala Suit | LuxeMia',
    description: 'Shop the Silk Rani Pink Occasional Wear Mirror Work Readymade Patiala Suit at LuxeMia. Vibrant rani pink silk with mirror work. Free worldwide shipping.',
    h1: 'Silk Rani Pink Occasional Wear Mirror Work Readymade Patiala Suit',
    content: '<p>A vibrant rani pink silk patiala suit with stunning mirror work. Make a bold impression at occasional events.</p>',
  },
  {
    path: '/product/silk-purple-occasional-wear-mirror-work-readymade-patiyala-suit',
    title: 'Silk Purple Occasional Wear Mirror Work Readymade Patiala Suit | LuxeMia',
    description: 'Shop the Silk Purple Occasional Wear Mirror Work Readymade Patiala Suit at LuxeMia. Regal purple silk with mirror work. Free worldwide shipping.',
    h1: 'Silk Purple Occasional Wear Mirror Work Readymade Patiala Suit',
    content: '<p>A regal purple silk patiala suit with beautiful mirror work. An elegant choice for occasional wear and special occasions.</p>',
  },
  // --- Shopify Cotton Salwar Suit product pages ---
  {
    path: '/product/teal-green-cotton-party-wear-salwar-suit',
    title: 'Teal Green Cotton Party Wear Salwar Suit | LuxeMia',
    description: 'Shop the Teal Green Cotton Party Wear Salwar Suit at LuxeMia. Comfortable cotton in teal green. Free worldwide shipping.',
    h1: 'Teal Green Cotton Party Wear Salwar Suit',
    content: '<p>A comfortable teal green cotton salwar suit perfect for party wear. Lightweight, breathable, and elegantly designed for celebrations.</p>',
  },
  {
    path: '/product/dusty-pink-cotton-eid-wear-salwar-suit',
    title: 'Dusty Pink Cotton Eid Wear Salwar Suit | LuxeMia',
    description: 'Shop the Dusty Pink Cotton Eid Wear Salwar Suit at LuxeMia. Soft dusty pink cotton for Eid celebrations. Free worldwide shipping.',
    h1: 'Dusty Pink Cotton Eid Wear Salwar Suit',
    content: '<p>A soft dusty pink cotton salwar suit designed for Eid celebrations. Comfortable and elegant for festive occasions.</p>',
  },
  {
    path: '/product/cream-cotton-eid-wear-salwar-suit',
    title: 'Cream Cotton Eid Wear Salwar Suit | LuxeMia',
    description: 'Shop the Cream Cotton Eid Wear Salwar Suit at LuxeMia. Classic cream cotton for Eid celebrations. Free worldwide shipping.',
    h1: 'Cream Cotton Eid Wear Salwar Suit',
    content: '<p>A classic cream cotton salwar suit perfect for Eid celebrations. Timeless elegance with comfortable cotton fabric.</p>',
  },
  {
    path: '/product/olive-green-cotton-party-wear-salwar-suit',
    title: 'Olive Green Cotton Party Wear Salwar Suit | LuxeMia',
    description: 'Shop the Olive Green Cotton Party Wear Salwar Suit at LuxeMia. Elegant olive green cotton for parties. Free worldwide shipping.',
    h1: 'Olive Green Cotton Party Wear Salwar Suit',
    content: '<p>An elegant olive green cotton salwar suit for party wear. Soft cotton fabric with a refined look for celebrations.</p>',
  },
  {
    path: '/product/warm-beige-cotton-festival-salwar-suit',
    title: 'Warm Beige Cotton Festival Salwar Suit | LuxeMia',
    description: 'Shop the Warm Beige Cotton Festival Salwar Suit at LuxeMia. Warm beige cotton for festival celebrations. Free worldwide shipping.',
    h1: 'Warm Beige Cotton Festival Salwar Suit',
    content: '<p>A warm beige cotton salwar suit perfect for festival celebrations. Comfortable and elegant for cultural events.</p>',
  },
  {
    path: '/product/olive-green-cotton-festive-salwar-suit',
    title: 'Olive Green Cotton Festive Salwar Suit | LuxeMia',
    description: 'Shop the Olive Green Cotton Festive Salwar Suit at LuxeMia. Olive green cotton for festive occasions. Free worldwide shipping.',
    h1: 'Olive Green Cotton Festive Salwar Suit',
    content: '<p>An olive green cotton salwar suit designed for festive occasions. Breathable cotton with an elegant silhouette.</p>',
  },
  // --- Shopify Wedding Palazzo Suit product pages ---
  {
    path: '/product/georgette-purple-wedding-wear-embroidery-work-readywar-plazzo-suit',
    title: 'Georgette Purple Wedding Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Georgette Purple Wedding Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Elegant purple georgette with embroidery. Free worldwide shipping.',
    h1: 'Georgette Purple Wedding Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>An elegant purple georgette palazzo suit with beautiful embroidery for wedding wear. A regal choice for wedding celebrations.</p>',
  },
  {
    path: '/product/georgette-black-wedding-wear-embroidery-work-readywar-plazzo-suit',
    title: 'Georgette Black Wedding Wear Embroidery Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Georgette Black Wedding Wear Embroidery Work Readymade Palazzo Suit at LuxeMia. Sophisticated black georgette with embroidery. Free worldwide shipping.',
    h1: 'Georgette Black Wedding Wear Embroidery Work Readymade Palazzo Suit',
    content: '<p>A sophisticated black georgette palazzo suit with intricate embroidery for wedding wear. Timeless elegance for special occasions.</p>',
  },
  {
    path: '/product/georgette-cherry-wedding-wear-beads-work-readymade-plazzo-suit',
    title: 'Georgette Cherry Wedding Wear Beads Work Readymade Palazzo Suit | LuxeMia',
    description: 'Shop the Georgette Cherry Wedding Wear Beads Work Readymade Palazzo Suit at LuxeMia. Beautiful cherry georgette with beads work. Free worldwide shipping.',
    h1: 'Georgette Cherry Wedding Wear Beads Work Readymade Palazzo Suit',
    content: '<p>A beautiful cherry georgette palazzo suit with stunning beads work for wedding wear. A gorgeous choice for wedding celebrations.</p>',
  },
  // --- Shopify Sherwani product pages ---
  {
    path: '/product/art-silk-off-white-groom-wear-thread-work-readymade-sherwani',
    title: 'Art Silk Off White Groom Wear Thread Work Readymade Sherwani | LuxeMia',
    description: 'Shop the Art Silk Off White Groom Wear Thread Work Readymade Sherwani at LuxeMia. Elegant off white art silk with thread work. Free worldwide shipping.',
    h1: 'Art Silk Off White Groom Wear Thread Work Readymade Sherwani',
    content: '<p>An elegant off white art silk sherwani with intricate thread work. Perfect for groom wear and wedding ceremonies.</p>',
  },
  {
    path: '/product/art-silk-pista-green-groom-wear-thread-work-readymade-sherwani',
    title: 'Art Silk Pista Green Groom Wear Thread Work Readymade Sherwani | LuxeMia',
    description: 'Shop the Art Silk Pista Green Groom Wear Thread Work Readymade Sherwani at LuxeMia. Fresh pista green art silk with thread work. Free worldwide shipping.',
    h1: 'Art Silk Pista Green Groom Wear Thread Work Readymade Sherwani',
    content: '<p>A fresh pista green art silk sherwani with beautiful thread work. A refined choice for groom wear and wedding events.</p>',
  },
  {
    path: '/product/art-silk-light-pink-groom-wear-thread-work-readymade-sherwani',
    title: 'Art Silk Light Pink Groom Wear Thread Work Readymade Sherwani | LuxeMia',
    description: 'Shop the Art Silk Light Pink Groom Wear Thread Work Readymade Sherwani at LuxeMia. Soft light pink art silk with thread work. Free worldwide shipping.',
    h1: 'Art Silk Light Pink Groom Wear Thread Work Readymade Sherwani',
    content: '<p>A soft light pink art silk sherwani with delicate thread work. Perfect for groom wear and wedding ceremonies.</p>',
  },
  {
    path: '/product/art-silk-cream-groom-wear-thread-work-readymade-sherwani',
    title: 'Art Silk Cream Groom Wear Thread Work Readymade Sherwani | LuxeMia',
    description: 'Shop the Art Silk Cream Groom Wear Thread Work Readymade Sherwani at LuxeMia. Classic cream art silk with thread work. Free worldwide shipping.',
    h1: 'Art Silk Cream Groom Wear Thread Work Readymade Sherwani',
    content: '<p>A classic cream art silk sherwani with intricate thread work. A timeless choice for groom wear and wedding celebrations.</p>',
  },
  {
    path: '/product/art-silk-beige-groom-wear-thread-work-readymade-sherwani',
    title: 'Art Silk Beige Groom Wear Thread Work Readymade Sherwani | LuxeMia',
    description: 'Shop the Art Silk Beige Groom Wear Thread Work Readymade Sherwani at LuxeMia. Elegant beige art silk with thread work. Free worldwide shipping.',
    h1: 'Art Silk Beige Groom Wear Thread Work Readymade Sherwani',
    content: '<p>An elegant beige art silk sherwani with beautiful thread work. Perfect for groom wear and wedding ceremonies.</p>',
  },
  {
    path: '/product/art-silk-onion-groom-wear-thread-work-readymade-sherwani',
    title: 'Art Silk Onion Groom Wear Thread Work Readymade Sherwani | LuxeMia',
    description: 'Shop the Art Silk Onion Groom Wear Thread Work Readymade Sherwani at LuxeMia. Unique onion color art silk with thread work. Free worldwide shipping.',
    h1: 'Art Silk Onion Groom Wear Thread Work Readymade Sherwani',
    content: '<p>A unique onion color art silk sherwani with intricate thread work. A distinctive choice for groom wear and wedding events.</p>',
  },
  {
    path: '/product/art-silk-firozi-green-groom-wear-thread-work-readymade-sherwani',
    title: 'Art Silk Firozi Green Groom Wear Thread Work Readymade Sherwani | LuxeMia',
    description: 'Shop the Art Silk Firozi Green Groom Wear Thread Work Readymade Sherwani at LuxeMia. Vibrant firozi green art silk with thread work. Free worldwide shipping.',
    h1: 'Art Silk Firozi Green Groom Wear Thread Work Readymade Sherwani',
    content: '<p>A vibrant firozi green art silk sherwani with beautiful thread work. Make a striking impression as a groom on your wedding day.</p>',
  },
  {
    path: '/product/art-silk-light-pink-wedding-wear-embroidery-work-readymade-sherwani',
    title: 'Art Silk Light Pink Wedding Wear Embroidery Work Readymade Sherwani | LuxeMia',
    description: 'Shop the Art Silk Light Pink Wedding Wear Embroidery Work Readymade Sherwani at LuxeMia. Soft light pink art silk with embroidery. Free worldwide shipping.',
    h1: 'Art Silk Light Pink Wedding Wear Embroidery Work Readymade Sherwani',
    content: '<p>A soft light pink art silk sherwani with exquisite embroidery work. Perfect for wedding wear and special ceremonies.</p>',
  },
  {
    path: '/product/art-silk-beige-wedding-wear-embroidery-work-readymade-sherwani',
    title: 'Art Silk Beige Wedding Wear Embroidery Work Readymade Sherwani | LuxeMia',
    description: 'Shop the Art Silk Beige Wedding Wear Embroidery Work Readymade Sherwani at LuxeMia. Elegant beige art silk with embroidery. Free worldwide shipping.',
    h1: 'Art Silk Beige Wedding Wear Embroidery Work Readymade Sherwani',
    content: '<p>An elegant beige art silk sherwani with beautiful embroidery work. A refined choice for wedding wear and celebrations.</p>',
  },
  {
    path: '/product/art-silk-pista-green-wedding-wear-embroidery-work-readymade-sherwani',
    title: 'Art Silk Pista Green Wedding Wear Embroidery Work Readymade Sherwani | LuxeMia',
    description: 'Shop the Art Silk Pista Green Wedding Wear Embroidery Work Readymade Sherwani at LuxeMia. Fresh pista green art silk with embroidery. Free worldwide shipping.',
    h1: 'Art Silk Pista Green Wedding Wear Embroidery Work Readymade Sherwani',
    content: '<p>A fresh pista green art silk sherwani with intricate embroidery work. Perfect for wedding wear and special occasions.</p>',
  },
  {
    path: '/product/art-silk-teal-blue-wedding-wear-embroidery-work-readymade-sherwani',
    title: 'Art Silk Teal Blue Wedding Wear Embroidery Work Readymade Sherwani | LuxeMia',
    description: 'Shop the Art Silk Teal Blue Wedding Wear Embroidery Work Readymade Sherwani at LuxeMia. Stunning teal blue art silk with embroidery. Free worldwide shipping.',
    h1: 'Art Silk Teal Blue Wedding Wear Embroidery Work Readymade Sherwani',
    content: '<p>A stunning teal blue art silk sherwani with beautiful embroidery work. A sophisticated choice for wedding wear and ceremonies.</p>',
  },
  {
    path: '/product/art-silk-black-wedding-wear-embroidery-work-readymade-sherwani',
    title: 'Art Silk Black Wedding Wear Embroidery Work Readymade Sherwani | LuxeMia',
    description: 'Shop the Art Silk Black Wedding Wear Embroidery Work Readymade Sherwani at LuxeMia. Elegant black art silk with embroidery. Free worldwide shipping.',
    h1: 'Art Silk Black Wedding Wear Embroidery Work Readymade Sherwani',
    content: '<p>An elegant black art silk sherwani with exquisite embroidery work. A timeless and sophisticated choice for wedding wear.</p>',
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
];

/**
 * Generate pre-rendered HTML for a route by injecting SEO content
 * into the index.html template.
 */
function generateHtml(template, route) {
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
    const cleanDesc = generateCleanDescription(live?.title, live?.productType, live?.tags || []);
    const productDescription = (cleanDesc || route.description || '').slice(0, 5000);
    const productPrice = live?.priceRange?.minVariantPrice?.amount || FALLBACK_PRICE;
    const productCurrency = live?.priceRange?.minVariantPrice?.currencyCode || FALLBACK_CURRENCY;
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
    const description = generateCleanDescription(p.title, p.productType, p.tags || []);
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
    const title = p.title || handle;
    const cleanDesc = generateCleanDescription(p.title, p.productType, p.tags || []);
    const description = (cleanDesc || `Shop the ${title} at LuxeMia. Free shipping on orders over $350.`).slice(0, 320);
    routes.push({
      path: `/product/${handle}`,
      title: `${title} | LuxeMia`,
      description,
      h1: title,
      content: `<p>${escapeHtml(description).slice(0, 1200)}</p>`,
      product: p,
    });
  }
  console.log(`[prerender] Total /product/* routes after Shopify merge: ${routes.filter(r => r.path.startsWith('/product/')).length}`);

  let count = 0;
  let productCount = 0;
  for (const route of routes) {
    const html = generateHtml(template, route);

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
