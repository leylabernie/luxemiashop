import { rewrite, next } from '@vercel/functions';
import { isBot } from './src/middleware/botDetection';
import { fetchProductByHandle } from './src/middleware/shopifyProxy';
import { generateProductHtml, return404, escapeHtml } from './src/middleware/htmlGenerator';
import { getCachedSpaHtml, setCachedSpaHtml } from './src/middleware/cache';

/**
 * Vercel Edge Middleware (non-Next.js / Vite)
 *
 * Detects search engine bot user agents and serves server-rendered HTML
 * with proper SEO content. Regular users get the normal SPA experience.
 *
 * CRITICAL FIX: For product pages accessed by bots/crawlers (including GMC's
 * page checker), we dynamically fetch product data from Shopify Storefront API
 * and generate complete HTML with meta tags, structured data, and visible content.
 * This fixes the "Product page unavailable" GMC error caused by SPA rendering.
 */

// ─── Pre-rendered Routes ─────────────────────────────────────────────────────

const PRERENDERED_ROUTES = new Set([
  '/',
  '/suits',
  '/lehengas',
  '/sarees',
  '/menswear',
  '/blog',
  '/blog/sharara-suit-guide-2026-styles-fabrics',
  '/blog/pakistani-suits-anarkali-shopping-guide',
  '/blog/style-lehenga-choli-every-wedding-event',
  '/blog/indian-wedding-season-2026-outfit-guide',
  '/blog/fabric-guide-indian-ethnic-wear-georgette-silk-chiffon',
  '/blog/indian-wedding-dress-complete-guide',
  '/blog/red-bridal-lehenga-trends-2026',
  '/blog/designer-wedding-dress-under-50000',
  '/blog/wedding-guest-outfit-ideas',
  '/blog/saree-draping-styles-every-occasion',
  '/blog/indian-wedding-trends-2026',
  '/blog/lehenga-color-for-dark-skin',
  '/blog/wedding-saree-for-mother-of-bride',
  '/blog/designer-wedding-dress-under-500',
  '/blog/nri-wedding-ethnic-wear-trends-2026',
  '/blog/buy-authentic-indian-sarees-online-usa-uk',
  '/blog/styling-indian-ethnic-wear-festive-occasions-abroad',
  '/blog/how-to-choose-perfect-lehenga-wedding-2026',
  '/blog/lehenga-vs-sharara-vs-anarkali-comparison',
  '/blog/best-lehenga-colors-for-indian-skin-tone',
  '/blog/shipping-indian-clothes-usa-uk-canada-nri-guide',
  '/blog/unstitched-vs-ready-to-wear-vs-made-to-measure',
  '/blog/accessorize-indian-ethnic-wear',
  '/blog/caring-for-silk-sarees',
  '/blog/how-to-measure-yourself-for-indian-ethnic-wear',
  '/blog/what-to-wear-indian-wedding-guest-2026',
  '/blog/lehenga-vs-anarkali-which-is-right-for-you',
  '/blog/nri-guide-buying-indian-ethnic-wear-online-usa-uk-canada',
  '/blog/care-guide-washing-storing-indian-ethnic-wear',
  '/blog/buying-indian-ethnic-wear-online-usa',
  '/blog/banarasi-silk-saree-guide-authentic',
  '/blog/how-to-drape-saree-beginner-guide',
  '/blog/indian-wedding-ceremony-outfit-guide',
  '/blog/indian-fabric-types-guide-silk-georgette-chiffon',
  '/blog/anarkali-suit-styling-guide-2026',
  '/blog/how-to-measure-yourself-indian-ethnic-wear',
  '/blog/kanchipuram-silk-saree-south-indian-wedding-guide',
  '/blog/zari-work-guide-indian-embroidery-gold-silver-thread',
  '/blog/chikankari-embroidery-lucknow-guide',
  '/collections',
  '/brand-story',
  '/new-arrivals',
  '/bestsellers',
  '/indowestern',
  '/nri',
  '/nri/usa',
  '/nri/canada',
  '/indian-ethnic-wear-usa',
  '/style-consultation',
  '/style-quiz',
  '/size-guide',
  '/care-guide',
  '/faq',
  '/shipping',
  '/returns',
  '/contact',
  '/artisans',
  '/sustainability',
  '/virtual-try-on',
  '/products',
  '/privacy',
  '/privacy-policy',
  '/terms',
  '/terms-of-service',
  '/press',
  // NOTE: /product/* routes are NOT listed here on purpose.
  // ALL product pages are handled by the dynamic SSR path below
  // (which fetches live data from Shopify Storefront API).
  // Previously, listing product routes here caused the middleware to
  // try serving non-existent prerendered HTML files, falling through
  // to the empty SPA shell — the root cause of GMC "page unavailable"
  // errors. Dynamic SSR generates richer HTML with real prices, images,
  // and structured data anyway.
]);

// Routes that redirect elsewhere (should not be treated as 404)
const REDIRECT_ROUTES = new Set([
  '/our-story',
  '/lookbook',
  '/jewelry',
  '/collections/wedding-sarees',
  '/collections/bridal-lehengas',
  '/collections/reception-outfits',
  '/collections/festive-wear',
  '/collections/sarees',
  '/collections/salwar-kameez',
  '/collections/suits',
  '/collections/menswear',
  '/collections/lehengas',
  '/collections/indo-western',
  '/collections/bridesmaid-dresses',
  '/collections/groomsman-outfits',
]);

// Routes that must 308 redirect to /nri (UK pages no longer targeted)
const UK_REDIRECT_ROUTES = new Set([
  '/nri/uk',
  '/indian-ethnic-wear-uk',
  '/uk-indian-clothing',
  '/uk-designer-sarees',
]);

// ─── Main Middleware ─────────────────────────────────────────────────────────

export default async function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const { pathname } = url;

  // Skip non-page requests (static files, API, etc.)
  if (
    pathname.startsWith('/_prerender') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/catalogs') ||
    pathname.includes('.')
  ) {
    return next();
  }

  // 308 Permanent Redirect for UK pages (no longer targeted markets)
  if (UK_REDIRECT_ROUTES.has(pathname)) {
    return Response.redirect(new URL('/nri', request.url).toString(), 308);
  }

  // Product pages are prerendered for EVERY Shopify product at build time
  // (see scripts/prerender.js — fetches all products from the Storefront API
  // and emits one HTML file per /product/<handle>). Serve that prerendered
  // HTML to ALL clients — bots and humans — so the initial HTML always
  // contains valid Product JSON-LD with image, description, offers.price,
  // offers.priceCurrency, offers.availability, canonical url, and brand.
  // React hydrates over the same <div id="root"> after JS loads.
  //
  // For bots that hit a handle missing from the build (e.g. a product added
  // to Shopify between deploys), we still fall through to the dynamic SSR
  // path further below, which fetches live product data from Shopify.
  if (pathname.startsWith('/product/')) {
    const handle = pathname.replace('/product/', '');
    if (handle && !handle.includes('/')) {
      const prerenderUrl = new URL(`/_prerender/product/${handle}.html`, request.url);
      try {
        const head = await fetch(prerenderUrl.toString(), { method: 'HEAD' });
        if (head.ok) {
          return rewrite(prerenderUrl);
        }
      } catch {
        // fall through to bot SSR / SPA shell
      }
    }
  }

  // For bots: serve prerendered or dynamically-rendered content
  if (isBot(userAgent)) {
    // 1. Prerendered static routes → serve prerendered HTML
    if (PRERENDERED_ROUTES.has(pathname)) {
      const prerenderPath =
        pathname === '/'
          ? '/_prerender/index.html'
          : `/_prerender${pathname}.html`;

      return rewrite(new URL(prerenderPath, request.url));
    }

    // 2. Product pages → DYNAMIC SSR from Shopify API
    //    This is the CRITICAL FIX for GMC "Product page unavailable" errors.
    //    Instead of letting bots through to the SPA (which renders empty HTML
    //    that GMC can't crawl), we fetch product data from Shopify and generate
    //    complete HTML with meta tags, structured data, and visible content.
    if (pathname.startsWith('/product/')) {
      const handle = pathname.replace('/product/', '');

      // Try fetching from Shopify Storefront API
      const product = await fetchProductByHandle(handle);

      if (product) {
        const canonicalUrl = `https://luxemia.shop/product/${handle}`;
        const html = generateProductHtml(product, canonicalUrl);

        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400',
            'X-Robots-Tag': 'index, follow',
          },
        });
      }

      // Product not found in Shopify → return 404 with noindex
      return return404(request);
    }

    // 3. Collection/category pages that aren't prerendered — let through to SPA
    if (pathname.startsWith('/collections/')) {
      return next();
    }

    // 4. /admin → noindex
    if (pathname.startsWith('/admin')) {
      return new Response(
        `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Admin | LuxeMia</title></head><body><p>Admin panel — not indexed.</p></body></html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    // 5. Unknown route → proper HTTP 404
    if (!REDIRECT_ROUTES.has(pathname)) {
      return return404(request);
    }
  }

  // Regular users or redirect routes → inject proper meta tags into SPA HTML
  // CRITICAL SEO FIX: Previously, ALL non-bot visitors got the SPA shell with
  // identical homepage meta tags. Now we inject correct title, description,
  // canonical, and OG tags for every page so that social media scrapers,
  // browser tabs, and link previews work correctly for ALL visitors.
  return injectMetaIntoSpa(request, pathname);
}

// ─── SPA Meta Injection ────────────────────────────────────────────────────

/**
 * Fetch the SPA index.html and inject page-specific meta tags.
 * This ensures ALL visitors (not just bots) see correct title, description,
 * canonical URL, and Open Graph tags in the initial HTML response.
 *
 * This fixes the critical SEO issue where every page appeared identical
 * to social media scrapers and browser previews because the SPA shell
 * had only the homepage's meta tags.
 */
async function injectMetaIntoSpa(request: Request, pathname: string): Promise<Response> {
  // Get the SPA HTML (cached)
  let spaHtml = getCachedSpaHtml();
  if (!spaHtml) {
    try {
      const resp = await fetch(new URL('/index.html', request.url).toString());
      spaHtml = await resp.text();
      setCachedSpaHtml(spaHtml);
    } catch {
      // Fallback: let the normal SPA through
      return next();
    }
  }

  let html = spaHtml;

  // Determine the correct meta tags for this page
  let title = 'LuxeMia | Indian Ethnic Wear — Sarees & Lehengas';
  let description = 'Shop Indian ethnic wear at LuxeMia. Bridal lehengas, silk sarees, salwar suits & more. Free shipping on orders over $350 to USA, Canada & Australia.';
  let canonical = `https://luxemia.shop${pathname}`;
  let ogType = 'website';
  let ogImage = 'https://luxemia.shop/og-image.jpg';

  // For product pages: DO NOT call Shopify API for regular users.
  // The React app handles meta tags client-side via react-helmet-async.
  // Calling Shopify here adds 200-800ms TTFB for every product page hit.
  // Bots get full SSR HTML via the bot path above; regular users get
  // correct meta tags once React hydrates. Social media scrapers that
  // don't execute JS are caught by the isBot() check above.
  if (pathname.startsWith('/product/')) {
    const handle = pathname.replace('/product/', '');
    // Use a generic product meta tag — React will replace with real data on hydration
    const productName = handle.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    title = `${productName} | Indian Ethnic Wear | LuxeMia`;
    description = `Shop ${productName} at LuxeMia. Premium quality Indian ethnic wear with free shipping on orders over $350 to USA, Canada & Australia.`.slice(0, 160);
    ogType = 'product';
    // Keep default ogImage — the React app will update it on hydration
  } else if (pathname.startsWith('/blog/')) {
    // Blog posts
    const slug = pathname.replace('/blog/', '');
    const blogMeta = getBlogMetadataMiddleware(slug);
    if (blogMeta) {
      title = blogMeta.title;
      description = blogMeta.description;
      ogType = 'article';
    }
  } else {
    // Static pages — use the metadata map
    const staticMeta = STATIC_PAGE_META[pathname];
    if (staticMeta) {
      title = staticMeta.title;
      description = staticMeta.description;
      if (staticMeta.image) ogImage = staticMeta.image;
    }
  }

  // Inject meta tags into the HTML
  const escapedTitle = escapeHtml(title);
  const escapedDesc = escapeHtml(description);
  const escapedCanonical = escapeHtml(canonical);
  const escapedOgImage = escapeHtml(ogImage);

  // Replace the title tag
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapedTitle}</title>`
  );

  // Replace or add meta description
  if (html.includes('name="description"')) {
    html = html.replace(
      /<meta\s+name="description"\s+content="[^"]*"/,
      `<meta name="description" content="${escapedDesc}"`
    );
  } else {
    html = html.replace(
      '</head>',
      `<meta name="description" content="${escapedDesc}">\n</head>`
    );
  }

  // Replace or add canonical URL
  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"/,
      `<link rel="canonical" href="${escapedCanonical}"`
    );
  } else {
    html = html.replace(
      '</head>',
      `<link rel="canonical" href="${escapedCanonical}">\n</head>`
    );
  }

  // Replace or add OG tags
  const ogReplacements: [RegExp, string][] = [
    [/property="og:title"\s+content="[^"]*"/, `property="og:title" content="${escapedTitle}"`],
    [/property="og:description"\s+content="[^"]*"/, `property="og:description" content="${escapedDesc}"`],
    [/property="og:url"\s+content="[^"]*"/, `property="og:url" content="${escapedCanonical}"`],
    [/property="og:type"\s+content="[^"]*"/, `property="og:type" content="${ogType}"`],
    [/property="og:image"\s+content="[^"]*"/, `property="og:image" content="${escapedOgImage}"`],
    [/name="twitter:title"\s+content="[^"]*"/, `name="twitter:title" content="${escapedTitle}"`],
    [/name="twitter:description"\s+content="[^"]*"/, `name="twitter:description" content="${escapedDesc}"`],
    [/name="twitter:url"\s+content="[^"]*"/, `name="twitter:url" content="${escapedCanonical}"`],
    [/name="twitter:image"\s+content="[^"]*"/, `name="twitter:image" content="${escapedOgImage}"`],
  ];

  for (const [regex, replacement] of ogReplacements) {
    if (html.match(regex)) {
      html = html.replace(regex, replacement);
    }
  }

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

// ─── Static Page Metadata (for SPA meta injection) ──────────────────────────

interface PageMeta {
  title: string;
  description: string;
  image?: string;
}

const STATIC_PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: 'LuxeMia | Indian Ethnic Wear — Sarees & Lehengas',
    description: 'Shop Indian ethnic wear at LuxeMia. Bridal lehengas, silk sarees, salwar suits & more. Free shipping on orders over $350 to USA, Canada & Australia.',
    image: 'https://luxemia.shop/og-image.jpg',
  },
  '/sarees': {
    title: 'Sarees Collection | Silk & Bridal Sarees Online | LuxeMia',
    description: 'Shop beautiful silk sarees, bridal sarees, and designer sarees at LuxeMia. Banarasi, Kanchipuram, and georgette sarees. Free shipping over $350.',
    image: 'https://luxemia.shop/og/og-sarees.jpg',
  },
  '/lehengas': {
    title: 'Lehengas Collection | Bridal & Wedding Lehengas Online | LuxeMia',
    description: 'Shop stunning bridal lehengas, wedding lehengas, and festive lehengas at LuxeMia. Free shipping over $350 to USA, Canada & Australia.',
    image: 'https://luxemia.shop/og/og-lehengas.jpg',
  },
  '/suits': {
    title: 'Salwar Kameez & Suits | Anarkali & Palazzo Suits Online | LuxeMia',
    description: 'Shop elegant salwar kameez, anarkali suits, palazzo suits, and sharara sets at LuxeMia. Free shipping over $350.',
    image: 'https://luxemia.shop/og/og-suits.jpg',
  },
  '/menswear': {
    title: 'Menswear | Sherwanis & Kurta Pajama Sets Online | LuxeMia',
    description: 'Shop premium sherwanis, kurta pajama sets, and indo-western menswear at LuxeMia. Free shipping over $350.',
    image: 'https://luxemia.shop/og/og-menswear.jpg',
  },
  '/collections': {
    title: 'All Collections | Indian Ethnic Wear | LuxeMia',
    description: 'Browse all Indian ethnic wear collections at LuxeMia. Lehengas, sarees, suits, and menswear. Free shipping over $350.',
  },
  '/blog': {
    title: 'Blog | Indian Fashion Tips & Ethnic Wear Guides | LuxeMia',
    description: 'Read our blog for the latest Indian fashion trends, saree styling tips, wedding outfit guides, and ethnic wear care instructions.',
  },
  '/brand-story': {
    title: 'Our Story | About LuxeMia — Indian Ethnic Wear Brand',
    description: 'Learn about LuxeMia, our passion for authentic Indian ethnic wear, ethical sourcing, and commitment to quality craftsmanship.',
  },
  '/new-arrivals': {
    title: 'New Arrivals | Latest Indian Ethnic Wear | LuxeMia',
    description: 'Discover the newest arrivals of Indian ethnic wear at LuxeMia. Fresh designs in lehengas, sarees, suits, and menswear.',
  },
  '/bestsellers': {
    title: 'Bestsellers | Most Popular Indian Ethnic Wear | LuxeMia',
    description: 'Shop LuxeMia\'s bestselling Indian ethnic wear. Our most loved lehengas, sarees, and suits.',
  },
  '/indowestern': {
    title: 'Indo-Western Collection | Fusion Wear Online | LuxeMia',
    description: 'Shop trendy indo-western and fusion wear at LuxeMia. Modern silhouettes with traditional craftsmanship.',
  },
  '/nri': {
    title: 'NRI Indian Ethnic Wear | Shipping to USA, Canada & Australia | LuxeMia',
    description: 'Shop Indian ethnic wear from abroad. LuxeMia ships authentic lehengas, sarees, and suits to USA, Canada & Australia.',
  },
  '/nri/usa': {
    title: 'Indian Ethnic Wear in USA | Shop Online | LuxeMia',
    description: 'Shop authentic Indian ethnic wear online in the USA. Bridal lehengas, silk sarees, salwar suits with free shipping over $350.',
  },
  '/nri/canada': {
    title: 'Indian Ethnic Wear in Canada | Shop Online | LuxeMia',
    description: 'Shop authentic Indian ethnic wear online in Canada. Bridal lehengas, silk sarees, salwar suits with free shipping over $350.',
  },
  '/indian-ethnic-wear-usa': {
    title: 'Indian Ethnic Wear in USA | Shop Online | LuxeMia',
    description: 'Shop authentic Indian ethnic wear online in the USA. Free shipping over $350.',
  },
  '/indian-ethnic-wear-canada': {
    title: 'Indian Ethnic Wear in Canada | Shop Online | LuxeMia',
    description: 'Shop authentic Indian ethnic wear online in Canada. Free shipping over $350.',
  },
  '/shipping': {
    title: 'Shipping Policy | Free Shipping Over $350 | LuxeMia',
    description: 'LuxeMia ships to USA, Canada & Australia. Free shipping on orders over $350. Flat rate $25 under $350.',
  },
  '/returns': {
    title: 'Returns & Cancellations Policy | LuxeMia',
    description: 'LuxeMia returns policy. All sales are final. Only genuine shipping damage claims accepted within 48 hours.',
  },
  '/privacy': {
    title: 'Privacy Policy | LuxeMia',
    description: 'Read LuxeMia\'s privacy policy. We protect your personal data when shopping for Indian ethnic wear.',
  },
  '/terms': {
    title: 'Terms of Service | LuxeMia',
    description: 'Read LuxeMia\'s terms of service for purchasing Indian ethnic wear online.',
  },
  '/contact': {
    title: 'Contact Us | LuxeMia — Indian Ethnic Wear',
    description: 'Contact LuxeMia for questions about orders or style consultations. Email hello@luxemia.shop or call +1-215-341-9990.',
  },
  '/faq': {
    title: 'FAQ | Frequently Asked Questions | LuxeMia',
    description: 'Find answers to common questions about LuxeMia orders, shipping, sizing, and fabric care.',
  },
  '/size-guide': {
    title: 'Size Guide | Indian Ethnic Wear Sizing | LuxeMia',
    description: 'LuxeMia size guide for Indian ethnic wear. Find your perfect fit. Custom tailoring available.',
  },
  '/care-guide': {
    title: 'Care Guide | How to Care for Indian Ethnic Wear | LuxeMia',
    description: 'Learn how to care for your Indian ethnic wear. Fabric-specific care instructions from LuxeMia.',
  },
  '/style-consultation': {
    title: 'Style Consultation | Personal Styling | LuxeMia',
    description: 'Book a free style consultation with LuxeMia. Get personalized recommendations for your next event.',
  },
  '/style-quiz': {
    title: 'Style Quiz | Find Your Perfect Indian Outfit | LuxeMia',
    description: 'Take the LuxeMia style quiz to discover your perfect Indian ethnic outfit.',
  },
};

// Blog metadata for middleware injection
function getBlogMetadataMiddleware(slug: string): { title: string; description: string } | null {
  const blogMap: Record<string, { title: string; description: string }> = {
    'sharara-suit-guide-2026-styles-fabrics': { title: 'Sharara Suit Guide 2026: Styles & Fabrics | LuxeMia Blog', description: 'Complete guide to sharara suits in 2026. Styles, fabrics, and styling tips at LuxeMia.' },
    'pakistani-suits-anarkali-shopping-guide': { title: 'Pakistani Suits & Anarkali Shopping Guide | LuxeMia Blog', description: 'Shopping guide for Pakistani suits and Anarkali sets at LuxeMia.' },
    'style-lehenga-choli-every-wedding-event': { title: 'Style Lehenga Choli for Every Wedding Event | LuxeMia Blog', description: 'Style your lehenga choli for every wedding event at LuxeMia.' },
    'indian-wedding-season-2026-outfit-guide': { title: 'Indian Wedding Season 2026 Outfit Guide | LuxeMia Blog', description: 'Complete outfit guide for Indian wedding season 2026 at LuxeMia.' },
    'fabric-guide-indian-ethnic-wear-georgette-silk-chiffon': { title: 'Fabric Guide: Georgette, Silk & Chiffon | LuxeMia Blog', description: 'Understanding Indian ethnic wear fabrics at LuxeMia.' },
    'indian-wedding-dress-complete-guide': { title: 'Indian Wedding Dress Complete Guide | LuxeMia Blog', description: 'Complete guide to Indian wedding dresses at LuxeMia.' },
    'red-bridal-lehenga-trends-2026': { title: 'Red Bridal Lehenga Trends 2026 | LuxeMia Blog', description: 'Latest red bridal lehenga trends for 2026 at LuxeMia.' },
    'designer-wedding-dress-under-50000': { title: 'Designer Wedding Dress Under ₹50,000 | LuxeMia Blog', description: 'Designer wedding dresses under ₹50,000 at LuxeMia.' },
    'wedding-guest-outfit-ideas': { title: 'Wedding Guest Outfit Ideas | LuxeMia Blog', description: 'Wedding guest outfit ideas for Indian weddings at LuxeMia.' },
    'saree-draping-styles-every-occasion': { title: 'Saree Draping Styles for Every Occasion | LuxeMia Blog', description: 'Different saree draping styles at LuxeMia.' },
    'indian-wedding-trends-2026': { title: 'Indian Wedding Trends 2026 | LuxeMia Blog', description: 'Top Indian wedding trends for 2026 at LuxeMia.' },
    'lehenga-color-for-dark-skin': { title: 'Best Lehenga Colors for Dark Skin Tones | LuxeMia Blog', description: 'Perfect lehenga color for dark skin tones at LuxeMia.' },
    'wedding-saree-for-mother-of-bride': { title: 'Wedding Saree for Mother of the Bride | LuxeMia Blog', description: 'Wedding saree options for the mother of the bride at LuxeMia.' },
    'designer-wedding-dress-under-500': { title: 'Designer Wedding Dress Under $500 | LuxeMia Blog', description: 'Designer wedding dresses under $500 at LuxeMia.' },
    'nri-wedding-ethnic-wear-trends-2026': { title: 'NRI Wedding Ethnic Wear Trends 2026 | LuxeMia Blog', description: 'NRI wedding ethnic wear trends for 2026 at LuxeMia.' },
    'buy-authentic-indian-sarees-online-usa-uk': { title: 'How to Buy Authentic Indian Sarees Online | LuxeMia Blog', description: 'Guide to buying authentic Indian sarees online at LuxeMia.' },
    'styling-indian-ethnic-wear-festive-occasions-abroad': { title: 'Styling Indian Ethnic Wear Abroad | LuxeMia Blog', description: 'Styling Indian ethnic wear for festive occasions abroad at LuxeMia.' },
    'accessorize-indian-ethnic-wear': { title: 'How to Accessorize Indian Ethnic Wear Like a Pro | LuxeMia Blog', description: 'Complete your ethnic ensemble with the perfect accessories. From traditional jewelry to contemporary additions.' },
    'caring-for-silk-sarees': { title: 'Expert Tips for Caring for Your Precious Silk Sarees | LuxeMia Blog', description: 'Learn professional techniques to maintain, store, and preserve your silk sarees for generations.' },
    'how-to-measure-yourself-for-indian-ethnic-wear': { title: 'How to Measure Yourself for Indian Ethnic Wear | LuxeMia Blog', description: 'Step-by-step home measuring guide for lehenga, saree blouse, and salwar kameez by professional tailors.' },
    'what-to-wear-indian-wedding-guest-2026': { title: 'What to Wear to an Indian Wedding as a Guest 2026 | LuxeMia Blog', description: 'Complete guest outfit guide for Indian weddings — mehendi to reception, by dress code and budget.' },
    'lehenga-vs-anarkali-which-is-right-for-you': { title: 'Lehenga vs Anarkali: Which Style Suits You Best? | LuxeMia Blog', description: 'Key differences between lehenga choli and anarkali suits for different occasions and body types.' },
    'nri-guide-buying-indian-ethnic-wear-online-usa-uk-canada': { title: 'NRI Guide: Buy Indian Ethnic Wear Online from USA, UK & Canada | LuxeMia Blog', description: 'Practical guide for NRI shoppers — sizing, duty-free limits, and quality checks for buying Indian ethnic wear online.' },
    'care-guide-washing-storing-indian-ethnic-wear': { title: 'How to Care for Indian Ethnic Wear: Washing & Storing | LuxeMia Blog', description: 'Special care guide for lehengas, sarees, and salwar kameez with zardozi, mirror work, and silk embroidery.' },
    'buying-indian-ethnic-wear-online-usa': { title: 'Complete Guide to Buying Indian Ethnic Wear Online from USA | LuxeMia Blog', description: 'Definitive guide for NRIs buying Indian clothes from the USA — sizing, shipping, customs, and authenticity.' },
    'banarasi-silk-saree-guide-authentic': { title: 'Banarasi Silk Sarees: History & How to Spot a Fake | LuxeMia Blog', description: 'Deep dive into Varanasi weaving traditions, types of Banarasi silk, and tips to identify authentic handloom.' },
    'how-to-drape-saree-beginner-guide': { title: 'How to Drape a Saree: Step-by-Step Guide for Beginners | LuxeMia Blog', description: 'Master the classic Nivi saree draping style with our beginner-friendly guide including pallu styling tips.' },
    'indian-wedding-ceremony-outfit-guide': { title: 'Indian Wedding Ceremony Outfit Guide: Mehendi to Reception | LuxeMia Blog', description: 'Per-ceremony outfit guide for Indian weddings — Mehendi, Haldi, Sangeet, Wedding, and Reception.' },
    'indian-fabric-types-guide-silk-georgette-chiffon': { title: 'Complete Guide to Indian Fabric Types: Silk, Georgette & More | LuxeMia Blog', description: 'Everything about Indian ethnic wear fabrics — Banarasi, Kanchipuram, georgette, chiffon, velvet, and care tips.' },
    'anarkali-suit-styling-guide-2026': { title: 'Anarkali Suit Styling Guide 2026: Casual to Bridal | LuxeMia Blog', description: 'Master styling anarkali suits — floor-length, knee-length, jacket style, with body type guide and dupatta draping.' },
    'how-to-measure-yourself-indian-ethnic-wear': { title: 'How to Measure Yourself for Indian Ethnic Wear: Sizing Guide | LuxeMia Blog', description: 'Detailed guide to measuring for Indian ethnic wear — bust, waist, hips, shoulder, with international size conversion.' },
    'kanchipuram-silk-saree-south-indian-wedding-guide': { title: 'Kanchipuram Silk Sarees: South Indian Wedding Guide | LuxeMia Blog', description: 'Complete guide to Kanchipuram (Kanjivaram) silk sarees — history, authentication, pricing, and bridal styling.' },
    'zari-work-guide-indian-embroidery-gold-silver-thread': { title: 'The Art of Zari Work: Golden Thread Tradition | LuxeMia Blog', description: 'Discover the centuries-old art of zari embroidery — authentic zari identification, styles, and garment care tips.' },
    'chikankari-embroidery-lucknow-guide': { title: 'Chikankari Embroidery of Lucknow: Shadow Work Guide | LuxeMia Blog', description: 'Explore Lucknowi chikankari — Mughal origins, stitch types, identifying authentic pieces, and shopping online.' },
  };
  return blogMap[slug] || null;
}

export const config = {
  matcher: [
    '/((?!_prerender|assets|api|favicon\\.ico|og-image\\.jpg|robots\\.txt|sitemap\\.xml|images|catalogs|3c4a52b9-542f-4bfe-a61b-9afb42f4312c\\.txt|google4e3f332d00afc8ba\\.html|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|csv|txt|xml|tsv)).*)',
  ],
};
