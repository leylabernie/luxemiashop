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

// Route definitions with SEO metadata
const routes = [
  {
    path: '/',
    title: 'LuxeMia — Luxury Indian Ethnic Wear | Sarees, Lehengas & Suits',
    description: 'Shop luxury Indian ethnic wear at LuxeMia. Designer lehengas, silk sarees, salwar suits & more. Free shipping to USA & UK. Authentic Indian craftsmanship.',
    h1: 'LuxeMia — Luxury Indian Ethnic Wear',
    content: `
      <p>Discover exquisite handcrafted Indian ethnic wear at LuxeMia. From bridal lehengas to silk sarees, anarkali suits to designer menswear — we bring the finest Indian craftsmanship to your doorstep with worldwide shipping.</p>
      <h2>Shop by Category</h2>
      <nav>
        <ul>
          <li><a href="/lehengas">Designer Lehengas</a> — Bridal & wedding lehenga choli collections</li>
          <li><a href="/sarees">Silk Sarees</a> — Banarasi, Kanjeevaram & designer sarees</li>
          <li><a href="/suits">Salwar Suits</a> — Anarkali, sharara & palazzo suits</li>
          <li><a href="/menswear">Menswear</a> — Sherwanis, kurta sets & Indo-western</li>
          <li><a href="/jewelry">Jewelry</a> — Kundan, polki & statement pieces</li>
        </ul>
      </nav>
      <h2>Featured Collections</h2>
      <ul>
        <li><a href="/collections/bridal-lehengas">Bridal Lehengas</a></li>
        <li><a href="/collections/wedding-sarees">Wedding Sarees</a></li>
        <li><a href="/collections/reception-outfits">Reception Outfits</a></li>
        <li><a href="/collections/festive-wear">Festive Wear</a></li>
      </ul>
      <p>Free shipping on all orders to USA and UK. Handcrafted with love by Indian artisans.</p>
    `,
  },
  {
    path: '/suits',
    title: 'Designer Salwar Suits & Anarkali Online | LuxeMia',
    description: 'Shop designer salwar suits, anarkali suits, sharara sets & palazzo suits online at LuxeMia. Premium fabrics, handcrafted embroidery. Free shipping to USA & UK.',
    h1: 'Designer Salwar Suits & Anarkali Collection',
    content: `
      <p>Explore our curated collection of designer salwar suits and anarkali ensembles. From elegant sharara sets to flowing palazzo suits, each piece features exquisite handcrafted embroidery on premium fabrics like georgette, silk, and chiffon.</p>
      <h2>Our Suits Collection</h2>
      <p>Browse anarkali suits, sharara suits, palazzo sets, and straight-cut salwar kameez. Perfect for weddings, festive occasions, and celebrations.</p>
    `,
  },
  {
    path: '/lehengas',
    title: 'Designer Lehengas & Bridal Lehenga Choli Online | LuxeMia',
    description: 'Shop designer lehengas & bridal lehenga choli at LuxeMia. Handcrafted bridal, wedding & party wear lehengas. Premium silk, net & velvet. Free shipping to USA & UK.',
    h1: 'Designer Lehengas & Bridal Lehenga Collection',
    content: `
      <p>Discover our stunning collection of designer lehengas and bridal lehenga choli. Handcrafted with intricate embroidery on premium silk, net, and velvet fabrics. Each lehenga is a masterpiece of Indian craftsmanship.</p>
      <h2>Lehenga Categories</h2>
      <ul>
        <li><a href="/collections/bridal-lehengas">Bridal Lehengas</a> — Luxurious bridal lehenga choli for your special day</li>
        <li>Wedding Lehengas — Elegant designs for wedding celebrations</li>
        <li>Party Wear Lehengas — Stunning lehengas for festive occasions</li>
      </ul>
    `,
  },
  {
    path: '/sarees',
    title: 'Designer Sarees Online — Silk, Banarasi & Wedding Sarees | LuxeMia',
    description: 'Shop designer sarees at LuxeMia. Banarasi silk, Kanjeevaram, georgette & wedding sarees with worldwide shipping. Authentic Indian handloom sarees.',
    h1: 'Designer Sarees — Silk, Banarasi & Wedding Collection',
    content: `
      <p>Explore our exquisite collection of designer sarees. From luxurious Banarasi silk to elegant Kanjeevaram, each saree is handcrafted by skilled Indian artisans. Perfect for weddings, festivals, and special occasions.</p>
      <h2>Saree Categories</h2>
      <ul>
        <li><a href="/collections/wedding-sarees">Wedding Sarees</a> — Traditional & contemporary wedding sarees</li>
        <li>Banarasi Silk Sarees — Handwoven in Varanasi</li>
        <li>Kanjeevaram Silk Sarees — Premium South Indian silk</li>
        <li>Georgette Sarees — Lightweight & elegant</li>
      </ul>
    `,
  },
  {
    path: '/menswear',
    title: 'Indian Menswear — Sherwanis, Kurta Sets & Indo-Western | LuxeMia',
    description: 'Shop Indian menswear at LuxeMia. Designer sherwanis, kurta sets, Indo-western wear for grooms & weddings. Premium fabrics, expert tailoring. Free shipping.',
    h1: 'Indian Menswear — Sherwanis & Kurta Collection',
    content: `
      <p>Discover our premium collection of Indian menswear. From regal sherwanis for grooms to elegant kurta sets and modern Indo-western outfits, crafted with premium fabrics and expert tailoring.</p>
    `,
  },
  {
    path: '/jewelry',
    title: 'Indian Jewelry — Kundan, Polki & Bridal Sets | LuxeMia',
    description: 'Shop Indian jewelry at LuxeMia. Kundan necklace sets, polki jewelry, statement earrings & bridal jewelry. Complete your ethnic look.',
    h1: 'Indian Jewelry Collection',
    content: `
      <p>Complete your ethnic look with our exquisite Indian jewelry collection. From royal kundan sets to delicate polki pieces, statement earrings to bridal jewelry sets.</p>
    `,
  },
  {
    path: '/blog',
    title: 'Indian Wedding Dress Guide: Bridal Lehenga Tips & Trends 2026',
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
    title: 'Indian Wedding Dress Complete Guide — Bridal Outfits for Every Ceremony | LuxeMia',
    description: 'The complete guide to Indian wedding dresses. Bridal lehengas, wedding sarees, reception outfits & guest attire. Everything you need to know.',
    h1: 'Indian Wedding Dress Complete Guide',
    content: '<p>The complete guide to Indian wedding dresses. From bridal lehengas to wedding sarees, reception outfits to guest attire — everything you need to plan your wedding wardrobe.</p>',
  },
  {
    path: '/blog/red-bridal-lehenga-trends-2026',
    title: 'Red Bridal Lehenga Trends 2026 — Designer Styles & Inspiration | LuxeMia',
    description: 'Discover the hottest red bridal lehenga trends for 2026. From classic crimson to modern scarlet, find your dream wedding lehenga.',
    h1: 'Red Bridal Lehenga Trends 2026',
    content: '<p>Discover the hottest red bridal lehenga trends for 2026. From classic crimson to modern scarlet, explore designer styles and find inspiration for your dream wedding lehenga.</p>',
  },
  {
    path: '/collections',
    title: 'All Collections — Curated Indian Ethnic Wear | LuxeMia',
    description: 'Browse all LuxeMia collections. Bridal lehengas, wedding sarees, reception outfits, festive wear & more. Curated for every occasion.',
    h1: 'All Collections',
    content: `
      <p>Browse our curated collections of Indian ethnic wear, thoughtfully organized for every occasion.</p>
      <ul>
        <li><a href="/collections/bridal-lehengas">Bridal Lehengas</a> — Luxurious bridal wear for your special day</li>
        <li><a href="/collections/wedding-sarees">Wedding Sarees</a> — Elegant sarees for wedding celebrations</li>
        <li><a href="/collections/reception-outfits">Reception Outfits</a> — Stunning looks for your reception</li>
        <li><a href="/collections/festive-wear">Festive Wear</a> — Beautiful outfits for festivals & celebrations</li>
      </ul>
    `,
  },
  {
    path: '/collections/bridal-lehengas',
    title: 'Bridal Lehenga Collection — Designer Wedding Lehengas | LuxeMia',
    description: 'Shop bridal lehengas at LuxeMia. Designer bridal lehenga choli in silk, velvet & net. Handcrafted embroidery, luxurious fabrics. Free shipping.',
    h1: 'Bridal Lehenga Collection',
    content: '<p>Discover our stunning bridal lehenga collection. Each piece is handcrafted with intricate embroidery on premium silk, velvet, and net fabrics. Find your dream bridal lehenga.</p>',
  },
  {
    path: '/collections/wedding-sarees',
    title: 'Wedding Saree Collection — Silk & Designer Sarees | LuxeMia',
    description: 'Shop wedding sarees at LuxeMia. Banarasi silk, Kanjeevaram & designer wedding sarees. Traditional craftsmanship, modern elegance. Free shipping.',
    h1: 'Wedding Saree Collection',
    content: '<p>Explore our curated wedding saree collection. From Banarasi silk to Kanjeevaram, each saree combines traditional craftsmanship with modern elegance for your special day.</p>',
  },
  {
    path: '/collections/reception-outfits',
    title: 'Reception Outfits — Glamorous Party Wear | LuxeMia',
    description: 'Shop reception outfits at LuxeMia. Glamorous gowns, designer lehengas & contemporary ethnic wear for wedding receptions. Stand out at every event.',
    h1: 'Reception Outfits Collection',
    content: '<p>Make a statement at wedding receptions with our glamorous collection. Designer lehengas, contemporary gowns, and elegant ethnic wear for the modern woman.</p>',
  },
  {
    path: '/collections/festive-wear',
    title: 'Festive Wear Collection — Diwali, Eid & Celebration Outfits | LuxeMia',
    description: 'Shop festive wear at LuxeMia. Beautiful Indian outfits for Diwali, Eid, Navratri & celebrations. Sarees, lehengas, suits & more.',
    h1: 'Festive Wear Collection',
    content: '<p>Celebrate every occasion in style with our festive wear collection. Beautiful sarees, lehengas, and suits perfect for Diwali, Eid, Navratri, and all your special celebrations.</p>',
  },
  {
    path: '/our-story',
    title: 'Our Story — LuxeMia | Luxury Indian Ethnic Wear',
    description: 'Learn about LuxeMia — our mission to bring authentic Indian craftsmanship to the world. Handcrafted ethnic wear from skilled artisans.',
    h1: 'Our Story',
    content: '<p>LuxeMia was born from a passion for preserving India\'s rich textile heritage while making luxury ethnic wear accessible worldwide. We work directly with skilled artisans across India to bring you authentic, handcrafted pieces.</p>',
  },
  {
    path: '/size-guide',
    title: 'Size Guide — Indian Ethnic Wear Measurements | LuxeMia',
    description: 'LuxeMia size guide for Indian ethnic wear. Find your perfect fit with our detailed measurement charts for sarees, lehengas, suits & menswear. US & UK size conversions.',
    h1: 'Size Guide',
    content: '<p>Find your perfect fit with our detailed measurement charts. Includes bust, waist, and hip measurements with US and UK size conversions for all garments including lehengas, sarees, and salwar suits.</p>',
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
    title: 'Shipping Information — Worldwide Delivery | LuxeMia',
    description: 'LuxeMia shipping information. Free shipping to USA & UK. Worldwide delivery with full tracking. Express options available.',
    h1: 'Shipping Information',
    content: '<p>LuxeMia offers worldwide shipping with full tracking. Free standard shipping to USA and UK. Express shipping options available at checkout. Standard delivery takes 7-12 business days.</p>',
  },
  {
    path: '/returns',
    title: 'Returns & Exchanges Policy | LuxeMia',
    description: 'LuxeMia returns policy. Hassle-free returns and exchanges within 14 days. Free returns on all orders.',
    h1: 'Returns & Exchanges',
    content: '<p>We offer hassle-free returns and exchanges within 14 days of delivery for all unworn items in original condition. Free returns on all orders.</p>',
  },
  {
    path: '/contact',
    title: 'Contact Us | LuxeMia',
    description: 'Get in touch with LuxeMia. Contact us for questions about orders, custom stitching, sizing, or anything else. We\'re here to help.',
    h1: 'Contact Us',
    content: '<p>Have questions about your order, sizing, or custom stitching? We\'re here to help. Reach us via email, WhatsApp, or the contact form below.</p>',
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

  // Inject SEO content into the body (visible to bots, hidden with CSS for SPA users)
  // The React app mounts over this once JS loads
  const seoContent = `
    <div id="seo-prerender" style="position:absolute;left:-9999px;overflow:hidden">
      <h1>${escapeHtml(route.h1)}</h1>
      ${route.content}
      <nav aria-label="Site navigation">
        <a href="/">Home</a> |
        <a href="/lehengas">Lehengas</a> |
        <a href="/sarees">Sarees</a> |
        <a href="/suits">Suits</a> |
        <a href="/menswear">Menswear</a> |
        <a href="/jewelry">Jewelry</a> |
        <a href="/blog">Blog</a> |
        <a href="/collections">Collections</a> |
        <a href="/contact">Contact</a>
      </nav>
    </div>`;

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

function main() {
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

  let count = 0;
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
  }

  console.log(`Pre-rendered ${count} routes to ${prerenderDir}/`);
}

main();
