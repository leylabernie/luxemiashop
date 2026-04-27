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
    title: 'LuxeMia: Indian Ethnic Wear Online | Bridal Lehengas, Sarees, Salwar Kameez & Menswear',
    description: 'Discover LuxeMia for Indian ethnic wear online. Shop bridal lehengas, wedding sarees, salwar kameez & menswear with free worldwide shipping to USA, UK & Canada. Authentic craftsmanship & 2026 trends.',
    h1: 'LuxeMia — Indian Ethnic Wear Online',
    content: `
      <p>Discover beautiful Indian ethnic wear at LuxeMia. From bridal lehengas to silk sarees, anarkali suits to designer menswear — we bring the finest Indian craftsmanship to your doorstep with worldwide shipping.</p>
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
        <li><a href="/collections/reception-outfits">Reception Outfits</a></li>
        <li><a href="/collections/festive-wear">Festive Wear</a></li>
      </ul>
      <p>Free shipping on all orders to USA and UK. Handcrafted with love by Indian artisans.</p>
    `,
  },
  {
       path: '/suits',
    title: 'Salwar Kameez & Designer Suits Online | Sharara, Anarkali, Palazzo for Women - LuxeMia',
    description: 'Shop elegant Salwar Kameez, designer suits, sharara sets, anarkali & palazzo suits online at LuxeMia. Premium fabrics, handcrafted embroidery. Free shipping to USA, UK & Canada. Latest 2026 trends.',
    h1: 'Salwar Kameez & Designer Suits Collection',
    content: `
      <p>Explore our curated collection of Salwar Kameez and anarkali ensembles. From elegant sharara sets to flowing palazzo suits, each piece features beautiful embroidery on premium fabrics like georgette, silk, and chiffon.</p>
      <h2>Our Salwar Kameez Collection</h2>
      <p>Browse anarkali suits, sharara suits, palazzo sets, and straight-cut salwar kameez. Perfect for weddings, festive occasions, and celebrations.</p>
    `,
  },
  {
    path: '/lehengas',
    title: 'Designer Lehengas & Bridal Lehenga Choli Online | Wedding Lehengas for NRI - LuxeMia',
    description: 'Shop designer lehengas & bridal lehenga choli at LuxeMia. Handcrafted wedding & party wear lehengas. Premium silk, net & velvet. Free worldwide shipping to USA, UK & Canada. Latest 2026 trends.',
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
    title: 'Designer Sarees Online — Silk, Banarasi, Wedding & Pre-Draped Sarees | LuxeMia',
    description: 'Shop designer sarees at LuxeMia. Banarasi silk, Kanjeevaram, georgette, wedding & pre-draped sarees with worldwide shipping to USA, UK & Canada. Authentic Indian handloom sarees & 2026 trends.',
    h1: 'Designer Sarees — Silk, Banarasi & Wedding Collection',
    content: `
      <p>Explore our beautiful collection of designer sarees. From Banarasi silk to elegant Kanjeevaram, each saree is made with care by skilled Indian makers. Perfect for weddings, festivals, and special occasions.</p>
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
    title: 'Indian Menswear — Sherwanis, Kurta Sets, Indo-Western & Modi Jackets | LuxeMia',
    description: 'Shop Indian menswear at LuxeMia. Designer sherwanis, kurta sets, Indo-western wear & Modi jackets for grooms & weddings. Premium fabrics, expert tailoring. Free worldwide shipping to USA, UK & Canada.',
    h1: 'Indian Menswear — Sherwanis & Kurta Collection',
    content: `
      <p>Discover our premium collection of Indian menswear. From regal sherwanis for grooms to elegant kurta sets and modern Indo-western outfits, crafted with premium fabrics and expert tailoring.</p>
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
        <li><a href="/collections/bridal-lehengas">Bridal Lehengas</a> — Bridal wear for your special day</li>
        <li><a href="/collections/wedding-sarees">Wedding Sarees</a> — Elegant sarees for wedding celebrations</li>
        <li><a href="/collections/reception-outfits">Reception Outfits</a> — Stunning looks for your reception</li>
        <li><a href="/collections/festive-wear">Festive Wear</a> — Beautiful outfits for festivals & celebrations</li>
      </ul>
    `,
  },
  {
    path: '/products',
    title: 'All Products — Shop Indian Ethnic Wear Online | LuxeMia',
    description: 'Browse all products at LuxeMia. Designer lehengas, silk sarees, salwar suits, sherwanis & more. Free shipping to USA, UK & Canada.',
    h1: 'All Products',
    content: '<p>Explore our complete collection of Indian ethnic wear. Designer lehengas, silk sarees, salwar suits, sherwanis and more — all with free worldwide shipping.</p>',
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
    title: 'Our Story — LuxeMia | Indian Ethnic Wear Online',
    description: 'Learn about LuxeMia — our mission to bring authentic Indian craftsmanship to the world. Handcrafted ethnic wear from skilled makers.',
    h1: 'Our Story',
    content: '<p>LuxeMia was born from a passion for preserving India\'s rich textile heritage while making Indian ethnic wear accessible worldwide. We work directly with skilled makers across India to bring you authentic, beautifully made pieces.</p>',
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
  // --- Additional routes previously missing from prerender ---
  {
    path: '/brand-story',
    title: 'Our Story — LuxeMia | Indian Ethnic Wear Online',
    description: 'Learn about LuxeMia — our mission to bring authentic Indian craftsmanship to the world. Handcrafted ethnic wear from skilled makers.',
    h1: 'Our Story',
    content: '<p>LuxeMia was born from a passion for preserving India\'s rich textile heritage while making Indian ethnic wear accessible worldwide. We work directly with skilled makers across India to bring you authentic, beautifully made pieces.</p>',
  },
  {
    path: '/new-arrivals',
    title: 'New Arrivals — Latest Indian Ethnic Wear Collection | LuxeMia',
    description: 'Shop the latest arrivals at LuxeMia. New designer lehengas, sarees, suits & more. Fresh styles added weekly. Free worldwide shipping.',
    h1: 'New Arrivals',
    content: '<p>Discover the newest additions to our collection. Fresh styles of designer lehengas, silk sarees, and anarkali suits — handcrafted and shipped worldwide.</p>',
  },
  {
    path: '/bestsellers',
    title: 'Bestsellers — Most Loved Indian Ethnic Wear | LuxeMia',
    description: 'Shop LuxeMia bestsellers. Our most popular lehengas, sarees, suits & menswear chosen by customers worldwide. Free shipping to USA & UK.',
    h1: 'Bestsellers',
    content: '<p>Browse our most-loved pieces — the lehengas, sarees, and suits that our customers can\'t stop buying. Tried, tested, and loved worldwide.</p>',
  },
  {
    path: '/indowestern',
    title: 'Indo-Western Collection — Fusion Ethnic Wear | LuxeMia',
    description: 'Shop Indo-Western fusion wear at LuxeMia. Modern ethnic suits, fusion lehengas & contemporary Indian outfits. Free worldwide shipping.',
    h1: 'Indo-Western Collection',
    content: '<p>Where tradition meets modernity. Explore our Indo-Western collection featuring fusion silhouettes, contemporary cuts, and ethnic embellishments for the modern woman.</p>',
  },
  {
    path: '/nri',
    title: 'NRI Indian Ethnic Wear — Shop Indian Clothes Abroad | LuxeMia',
    description: 'Indian ethnic wear for NRIs. Shop bridal lehengas, wedding sarees & festive outfits from abroad. Free shipping to USA, UK & Canada.',
    h1: 'NRI Collection',
    content: '<p>Curated for the global Indian. Shop authentic ethnic wear from anywhere in the world with free shipping to USA, UK, and Canada. No compromises on quality or authenticity.</p>',
  },
  {
    path: '/indian-ethnic-wear-usa',
    title: 'Indian Ethnic Wear USA — Buy Indian Clothes Online in America | LuxeMia',
    description: 'Shop Indian ethnic wear online in the USA. Bridal lehengas, silk sarees, salwar suits with free shipping across America. Authentic Indian craftsmanship.',
    h1: 'Indian Ethnic Wear USA',
    content: '<p>Shopping for Indian ethnic wear in the USA? LuxeMia offers authentic bridal lehengas, silk sarees, and designer suits with free shipping across America.</p>',
  },
  {
    path: '/indian-ethnic-wear-uk',
    title: 'Indian Ethnic Wear UK — Buy Indian Clothes Online in Britain | LuxeMia',
    description: 'Shop Indian ethnic wear online in the UK. Bridal lehengas, silk sarees, salwar suits with free shipping across Britain. Authentic Indian craftsmanship.',
    h1: 'Indian Ethnic Wear UK',
    content: '<p>Shopping for Indian ethnic wear in the UK? LuxeMia delivers authentic bridal lehengas, silk sarees, and designer suits with free shipping across Britain.</p>',
  },
  {
    path: '/indian-ethnic-wear-canada',
    title: 'Indian Ethnic Wear Canada — Buy Indian Clothes Online | LuxeMia',
    description: 'Shop Indian ethnic wear online in Canada. Bridal lehengas, silk sarees, salwar suits with free shipping across Canada. Authentic Indian craftsmanship.',
    h1: 'Indian Ethnic Wear Canada',
    content: '<p>Shopping for Indian ethnic wear in Canada? LuxeMia delivers authentic bridal lehengas, silk sarees, and designer suits with free shipping across Canada.</p>',
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
    path: '/blog/buy-authentic-indian-sarees-online-usa-uk',
    title: 'How to Buy Authentic Indian Sarees Online in USA & UK | LuxeMia',
    description: 'Guide to buying authentic Indian sarees online in USA & UK. Tips for spotting fakes, choosing the right fabric, and finding trusted sellers.',
    h1: 'How to Buy Authentic Indian Sarees Online',
    content: '<p>Buying Indian sarees online from abroad? Learn how to spot authentic handloom, choose the right fabric, and find trusted sellers who ship to USA and UK.</p>',
  },
  {
    path: '/blog/styling-indian-ethnic-wear-festive-occasions-abroad',
    title: 'Styling Indian Ethnic Wear for Festive Occasions Abroad | LuxeMia',
    description: 'How to style Indian ethnic wear for festive occasions abroad. Diwali, Eid, Navratri & wedding outfit ideas for Indians living overseas.',
    h1: 'Styling Indian Ethnic Wear Abroad',
    content: '<p>Celebrating festivals abroad? Get styling ideas for Diwali, Eid, Navratri and more — outfit combinations that work for both traditional and modern settings.</p>',
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
  {
    path: '/404',
    title: 'Page Not Found | LuxeMia',
    description: 'The page you are looking for could not be found.',
    h1: 'Page Not Found',
    content: '<p>The page you are looking for may have been removed, had its name changed, or is temporarily unavailable. Please visit our <a href="/">homepage</a> to browse our collection.</p>',
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
