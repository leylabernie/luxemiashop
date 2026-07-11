/**
 * Shared SEO Metadata — Single source of truth for page titles, descriptions, and canonical URLs.
 *
 * Used by:
 * - SEOHead.tsx (client-side React Helmet)
 * - middleware.ts (Edge SSR for bots and ALL visitors)
 * - scripts/prerender.js (Static site generation at build time)
 *
 * This ensures consistency across all rendering paths.
 * Critical for AI search engines to accurately understand product, business, and content details.
 */

export const SITE_URL = 'https://luxemia.shop';
export const SITE_NAME = 'LuxeMia';
export const DEFAULT_TITLE = 'LuxeMia | Indian Ethnic Wear — Sarees & Lehengas';
export const DEFAULT_DESCRIPTION = 'Shop Indian ethnic wear at LuxeMia. Bridal lehengas, Banarasi silk sarees, anarkali suits & wedding collections. Free shipping to USA, Canada & Australia on orders over $350.';

export interface PageMetadata {
  title: string;
  description: string;
  canonical: string;
  type?: 'website' | 'product' | 'article' | 'collection';
  image?: string;
}

/**
 * Static page metadata mapping — for pages that don't need dynamic data.
 * Product pages and blog posts are handled dynamically in middleware.
 */
export const STATIC_PAGE_METADATA: Record<string, PageMetadata> = {
  '/': {
    title: 'LuxeMia — Buy Indian Ethnic Wear Online | Sarees, Lehengas & Suits',
    description: 'Shop 900+ Indian ethnic wear styles online at LuxeMia. Bridal lehengas, silk sarees, anarkali suits & sherwanis. Free shipping to USA, Canada & Australia over $350.',
    canonical: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
  },
  '/sarees': {
    title: 'Buy Sarees Online — Silk, Banarasi & Wedding Sarees | LuxeMia',
    description: 'Shop 200+ Indian sarees online at LuxeMia. Banarasi silk, Kanchipuram, designer georgette & wedding sarees with custom blouse stitching. Free shipping to USA, Canada & Australia over $350.',
    canonical: `${SITE_URL}/sarees`,
    image: `${SITE_URL}/og/og-sarees.jpg`,
  },
  '/lehengas': {
    title: 'Buy Bridal Lehengas Online | Wedding & Festive Lehenga Choli — LuxeMia',
    description: 'Shop 260+ lehengas online at LuxeMia. Bridal, wedding, party wear & festive lehenga choli in silk, net & velvet with hand embroidery. Custom tailoring available. Free shipping over $350.',
    canonical: `${SITE_URL}/lehengas`,
    image: `${SITE_URL}/og/og-lehengas.jpg`,
  },
  '/suits': {
    title: 'Buy Salwar Suits Online — Anarkali, Palazzo & Sharara | LuxeMia',
    description: 'Shop 300+ Indian salwar suits online at LuxeMia. Anarkali, palazzo, sharara & Pakistani suits with handcrafted embroidery. Custom tailoring available. Free shipping to USA, Canada & Australia over $350.',
    canonical: `${SITE_URL}/suits`,
    image: `${SITE_URL}/og/og-suits.jpg`,
  },
  '/menswear': {
    title: 'Buy Sherwanis Online — Wedding & Groom Sherwani for Men | LuxeMia',
    description: 'Shop designer sherwanis for men online at LuxeMia. Groom sherwanis, kurta pajama sets & indo-western menswear with hand embroidery. Custom tailoring available. Free shipping over $350.',
    canonical: `${SITE_URL}/menswear`,
    image: `${SITE_URL}/og/og-menswear.jpg`,
  },
  '/jewelry': {
    title: 'Indian Bridal Jewelry Sets | Traditional Wedding Necklaces | LuxeMia',
    description: 'Shop Indian bridal jewelry sets online in USA. Traditional wedding necklaces, Kundan & polki sets. South Asian bridal jewelry with luxury craftsmanship.',
    canonical: `${SITE_URL}/jewelry`,
    image: `${SITE_URL}/og-image.jpg`,
  },
  '/collections': {
    title: 'All Collections | Indian Ethnic Wear | LuxeMia',
    description: 'Browse all Indian ethnic wear collections at LuxeMia. Lehengas, sarees, suits & menswear for every occasion. Free shipping over $350 to USA, Canada & Australia.',
    canonical: `${SITE_URL}/collections`,
    image: `${SITE_URL}/og-image.jpg`,
  },
  '/blog': {
    title: 'Blog | Indian Fashion Tips & Ethnic Wear Guides | LuxeMia',
    description: 'Read our blog for the latest Indian fashion trends, saree styling tips, wedding outfit guides, and ethnic wear care instructions from LuxeMia.',
    canonical: `${SITE_URL}/blog`,
    type: 'article',
  },
  '/brand-story': {
    title: 'Our Story | About LuxeMia — Indian Ethnic Wear Brand',
    description: 'Learn about LuxeMia — our passion for authentic Indian ethnic wear, ethical sourcing & quality craftsmanship. Based in Philadelphia, shipping worldwide.',
    canonical: `${SITE_URL}/brand-story`,
  },
  '/new-arrivals': {
    title: 'New Arrivals | Latest Indian Ethnic Wear | LuxeMia',
    description: 'Discover the newest arrivals of Indian ethnic wear at LuxeMia. Fresh designs in lehengas, sarees, suits, and menswear. Free shipping over $350.',
    canonical: `${SITE_URL}/new-arrivals`,
  },
  '/bestsellers': {
    title: 'Bestsellers | Most Popular Indian Ethnic Wear | LuxeMia',
    description: 'Shop LuxeMia\'s bestselling Indian ethnic wear. Our most loved lehengas, sarees, and suits chosen by customers. Free shipping over $350.',
    canonical: `${SITE_URL}/bestsellers`,
  },
  '/indowestern': {
    title: 'Indo-Western Collection | Fusion Wear Online | LuxeMia',
    description: 'Shop trendy indo-western and fusion wear at LuxeMia. Modern silhouettes with traditional craftsmanship. Free shipping over $350 to USA, Canada & Australia.',
    canonical: `${SITE_URL}/indowestern`,
  },
  '/nri': {
    title: 'NRI Indian Ethnic Wear | Shipping to USA, Canada & Australia | LuxeMia',
    description: 'Shop Indian ethnic wear from abroad. LuxeMia ships authentic lehengas, sarees, and suits to USA, Canada & Australia. Free shipping over $350.',
    canonical: `${SITE_URL}/nri`,
  },
  '/nri/usa': {
    title: 'Indian Ethnic Wear in USA | Shop Online with Fast Shipping | LuxeMia',
    description: 'Shop authentic Indian ethnic wear online in the USA. Bridal lehengas, silk sarees, salwar suits with free shipping over $350. Delivery in 7-10 business days.',
    canonical: `${SITE_URL}/nri/usa`,
  },
  '/nri/canada': {
    title: 'Indian Ethnic Wear in Canada | Shop Online with Fast Shipping | LuxeMia',
    description: 'Shop authentic Indian ethnic wear online in Canada. Bridal lehengas, silk sarees, salwar suits with free shipping over $350. Delivery in 7-10 business days.',
    canonical: `${SITE_URL}/nri/canada`,
  },
  '/indian-ethnic-wear-usa': {
    title: 'Indian Ethnic Wear in USA | Shop Online with Fast Shipping | LuxeMia',
    description: 'Shop authentic Indian ethnic wear online in the USA. Bridal lehengas, silk sarees, salwar suits with free shipping over $350.',
    canonical: `${SITE_URL}/indian-ethnic-wear-usa`,
  },
  '/indian-ethnic-wear-canada': {
    title: 'Indian Ethnic Wear in Canada | Shop Online with Fast Shipping | LuxeMia',
    description: 'Shop authentic Indian ethnic wear online in Canada. Bridal lehengas, silk sarees, salwar suits with free shipping over $350.',
    canonical: `${SITE_URL}/indian-ethnic-wear-canada`,
  },
  '/shipping': {
    title: 'Shipping Policy | Free Shipping Over $350 | LuxeMia',
    description: 'LuxeMia ships to USA, Canada & Australia. Free shipping on orders over $350. Flat rate $25 for orders under $350. Standard delivery 7-10 business days.',
    canonical: `${SITE_URL}/shipping`,
  },
  '/pages/shipping-customs': {
    title: 'Shipping & Customs | Import Duties & Local Taxes | LuxeMia',
    description: 'Learn how international shipping & customs work at LuxeMia. Import duties, local taxes & customs clearance for orders to USA, Canada & Australia.',
    canonical: `${SITE_URL}/pages/shipping-customs`,
  },
  '/returns': {
    title: 'Returns & Cancellations Policy | LuxeMia',
    description: 'LuxeMia returns and cancellations policy. All sales are final. Only genuine shipping damage claims accepted within 48 hours with mandatory unboxing video.',
    canonical: `${SITE_URL}/returns`,
  },
  '/privacy': {
    title: 'Privacy Policy | LuxeMia',
    description: 'Read LuxeMia\'s privacy policy. We protect your personal data and are committed to ensuring your privacy when shopping for Indian ethnic wear.',
    canonical: `${SITE_URL}/privacy`,
  },
  '/terms': {
    title: 'Terms of Service | LuxeMia',
    description: 'Read LuxeMia\'s terms of service for purchasing Indian ethnic wear online. By using our site, you agree to these terms.',
    canonical: `${SITE_URL}/terms`,
  },
  '/contact': {
    title: 'Contact Us | LuxeMia — Indian Ethnic Wear',
    description: 'Contact LuxeMia for questions about Indian ethnic wear, orders, or style consultations. Email hello@luxemia.shop or call +1-215-341-9990.',
    canonical: `${SITE_URL}/contact`,
  },
  '/faq': {
    title: 'FAQ | Frequently Asked Questions | LuxeMia',
    description: 'Answers to common LuxeMia questions on orders, shipping, sizing, fabric care & Indian ethnic wear. Free shipping over $350 to USA, Canada & Australia.',
    canonical: `${SITE_URL}/faq`,
  },
  '/size-guide': {
    title: 'Size Guide | Indian Ethnic Wear Sizing | LuxeMia',
    description: 'LuxeMia size guide for Indian ethnic wear. Find your perfect fit for lehengas, sarees, suits, and menswear. Custom tailoring available.',
    canonical: `${SITE_URL}/size-guide`,
  },
  '/care-guide': {
    title: 'Care Guide | How to Care for Indian Ethnic Wear | LuxeMia',
    description: 'Learn how to care for your Indian ethnic wear. Fabric-specific care instructions for silk, georgette, chiffon, and more from LuxeMia.',
    canonical: `${SITE_URL}/care-guide`,
  },
  '/style-consultation': {
    title: 'Style Consultation | Personal Styling for Indian Ethnic Wear | LuxeMia',
    description: 'Book a free style consultation with LuxeMia. Get personalized recommendations for lehengas, sarees, and suits for your next event.',
    canonical: `${SITE_URL}/style-consultation`,
  },
  '/style-quiz': {
    title: 'Style Quiz | Find Your Perfect Indian Outfit | LuxeMia',
    description: 'Take the LuxeMia style quiz to discover your perfect Indian ethnic outfit. Personalized recommendations for lehengas, sarees, and suits.',
    canonical: `${SITE_URL}/style-quiz`,
  },
  '/artisans': {
    title: 'Our Artisans | Behind the Craftsmanship | LuxeMia',
    description: 'Meet the skilled artisans behind LuxeMia\'s Indian ethnic wear. Learn about traditional embroidery, weaving, and craftsmanship techniques.',
    canonical: `${SITE_URL}/artisans`,
  },
  '/sustainability': {
    title: 'Sustainability | Ethical Fashion | LuxeMia',
    description: 'Learn about LuxeMia\'s commitment to sustainable and ethical fashion. Responsible sourcing and fair trade practices in Indian ethnic wear.',
    canonical: `${SITE_URL}/sustainability`,
  },
  '/press': {
    title: 'Press | LuxeMia in the Media',
    description: 'LuxeMia in the media. Press coverage and features about our Indian ethnic wear collections and brand story.',
    canonical: `${SITE_URL}/press`,
  },
};

/**
 * Get metadata for a blog post by slug.
 * Used by middleware to inject proper meta tags for blog pages.
 */
export function getBlogMetadata(slug: string): PageMetadata | null {
  // Blog metadata is handled dynamically in middleware by reading the blogPosts data.
  // This is a fallback for the middleware's dynamic blog handling.
  const blogTitles: Record<string, { title: string; description: string }> = {
    'sharara-suit-guide-2026-styles-fabrics': {
      title: 'Sharara Suit Guide 2026: Styles & Fabrics | LuxeMia Blog',
      description: 'Complete guide to sharara suits in 2026. Explore the latest styles, fabrics, and styling tips for sharara suits at LuxeMia.',
    },
    'pakistani-suits-anarkali-shopping-guide': {
      title: 'Pakistani Suits & Anarkali Shopping Guide | LuxeMia Blog',
      description: 'Your ultimate shopping guide for Pakistani suits and Anarkali sets. Tips on styles, fabrics, and sizing at LuxeMia.',
    },
    'style-lehenga-choli-every-wedding-event': {
      title: 'How to Style Lehenga Choli for Every Wedding Event | LuxeMia Blog',
      description: 'Style your lehenga choli for every wedding event. From mehndi to reception, find the perfect look at LuxeMia.',
    },
    'indian-wedding-season-2026-outfit-guide': {
      title: 'Indian Wedding Season 2026 Outfit Guide | LuxeMia Blog',
      description: 'Complete outfit guide for Indian wedding season 2026. Lehengas, sarees, and suits for every occasion at LuxeMia.',
    },
    'fabric-guide-indian-ethnic-wear-georgette-silk-chiffon': {
      title: 'Fabric Guide: Georgette, Silk & Chiffon | LuxeMia Blog',
      description: 'Understanding Indian ethnic wear fabrics. Complete guide to georgette, silk, chiffon, and more at LuxeMia.',
    },
    'indian-wedding-dress-complete-guide': {
      title: 'Indian Wedding Dress Complete Guide | LuxeMia Blog',
      description: 'Complete guide to Indian wedding dresses. From bridal lehengas to wedding sarees, find your perfect dress at LuxeMia.',
    },
    'red-bridal-lehenga-trends-2026': {
      title: 'Red Bridal Lehenga Trends 2026 | LuxeMia Blog',
      description: 'Discover the latest red bridal lehenga trends for 2026. Traditional and modern styles at LuxeMia.',
    },
    'designer-wedding-dress-under-50000': {
      title: 'Designer Wedding Dress Under ₹50,000 | LuxeMia Blog',
      description: 'Find stunning designer wedding dresses under ₹50,000. Budget-friendly bridal options at LuxeMia.',
    },
    'wedding-guest-outfit-ideas': {
      title: 'Wedding Guest Outfit Ideas | LuxeMia Blog',
      description: 'Wedding guest outfit ideas for Indian weddings. Sarees, suits, and lehengas for guests at LuxeMia.',
    },
    'saree-draping-styles-every-occasion': {
      title: 'Saree Draping Styles for Every Occasion | LuxeMia Blog',
      description: 'Learn different saree draping styles for every occasion. From Nivi to Bengali style at LuxeMia.',
    },
    'indian-wedding-trends-2026': {
      title: 'Indian Wedding Trends 2026 | LuxeMia Blog',
      description: 'Top Indian wedding trends for 2026. Fashion, décor, and styling trends at LuxeMia.',
    },
    'lehenga-color-for-dark-skin': {
      title: 'Best Lehenga Colors for Dark Skin Tones | LuxeMia Blog',
      description: 'Find the perfect lehenga color for dark skin tones. Expert styling advice at LuxeMia.',
    },
    'wedding-saree-for-mother-of-bride': {
      title: 'Wedding Saree for Mother of the Bride | LuxeMia Blog',
      description: 'Elegant wedding saree options for the mother of the bride. Traditional and modern styles at LuxeMia.',
    },
    'designer-wedding-dress-under-500': {
      title: 'Designer Wedding Dress Under $500 | LuxeMia Blog',
      description: 'Find beautiful designer wedding dresses under $500. Affordable bridal options at LuxeMia.',
    },
    'nri-wedding-ethnic-wear-trends-2026': {
      title: 'NRI Wedding Ethnic Wear Trends 2026 | LuxeMia Blog',
      description: 'NRI wedding ethnic wear trends for 2026. Shopping from abroad? LuxeMia ships to USA, Canada & Australia.',
    },
    'buy-authentic-indian-sarees-online-usa-uk': {
      title: 'How to Buy Authentic Indian Sarees Online | LuxeMia Blog',
      description: 'Guide to buying authentic Indian sarees online. Tips for NRIs shopping from USA, Canada & Australia at LuxeMia.',
    },
    'styling-indian-ethnic-wear-festive-occasions-abroad': {
      title: 'Styling Indian Ethnic Wear for Festive Occasions Abroad | LuxeMia Blog',
      description: 'How to style Indian ethnic wear for festive occasions abroad. Tips for NRIs at LuxeMia.',
    },
  };

  const blogData = blogTitles[slug];
  if (!blogData) return null;

  return {
    title: blogData.title,
    description: blogData.description,
    canonical: `${SITE_URL}/blog/${slug}`,
    type: 'article',
  };
}

/**
 * Get static page metadata, or return default.
 */
export function getStaticPageMetadata(pathname: string): PageMetadata {
  return STATIC_PAGE_METADATA[pathname] || {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    canonical: `${SITE_URL}${pathname}`,
  };
}
