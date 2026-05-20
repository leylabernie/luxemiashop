/**
 * Shared SEO metadata foundation.
 *
 * Intended future source of truth:
 * - This file is intended to become the authoritative metadata source for
 *   static page titles, descriptions, canonical URLs, OG images, robots
 *   directives, and indexability decisions.
 * - middleware.ts remains the Vercel delivery/render layer. It should consume
 *   this data later, but it should continue owning redirects, bot handling,
 *   SPA HTML injection, and product SSR delivery.
 * - SEOHead.tsx remains the React rendering adapter. It should render metadata
 *   from props/shared data, not become the source of truth.
 * - scripts/prerender.js remains the prerender layer. It should consume this
 *   data later while preserving the existing prerender workflow.
 *
 * Preparation-only note:
 * Existing SEO emitters are intentionally not removed or rewired in this pass.
 */

export const SITE_URL = 'https://luxemia.shop';
export const PUBLIC_BRAND_NAME = 'LuxeMia';
export const LEGAL_ENTITY_NAME = 'Glamour Indian Wear';
export const SITE_NAME = PUBLIC_BRAND_NAME;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const DEFAULT_TITLE = `${PUBLIC_BRAND_NAME} | Indian Ethnic Wear — Sarees & Lehengas`;
export const DEFAULT_DESCRIPTION = `Shop Indian ethnic wear at ${PUBLIC_BRAND_NAME}. Bridal lehengas, Banarasi silk sarees, anarkali suits & wedding collections. Free shipping to USA, Canada & Australia on orders over $350.`;
export const DEFAULT_ROBOTS = 'index, follow';

export const BRAND_IDENTITY = {
  publicBrand: PUBLIC_BRAND_NAME,
  legalEntity: LEGAL_ENTITY_NAME,
  schema: {
    organizationName: PUBLIC_BRAND_NAME,
    legalName: LEGAL_ENTITY_NAME,
    alternateName: LEGAL_ENTITY_NAME,
    sellerName: LEGAL_ENTITY_NAME,
    sellerAlternateName: PUBLIC_BRAND_NAME,
  },
} as const;

export type PageType = 'website' | 'product' | 'article' | 'collection';
export type Indexability = 'indexable' | 'noindex';
export type RobotsDirective =
  | 'index, follow'
  | 'noindex, follow'
  | 'noindex, nofollow'
  | 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

export interface PageMetadata {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  type: PageType;
  robots: RobotsDirective;
  indexability: Indexability;
}

type PageMetadataInput = Pick<PageMetadata, 'title' | 'description' | 'canonical'> &
  Partial<Pick<PageMetadata, 'ogImage' | 'type' | 'robots' | 'indexability'>>;

const withMetadataDefaults = (metadata: PageMetadataInput): PageMetadata => ({
  ogImage: DEFAULT_OG_IMAGE,
  type: 'website',
  robots: DEFAULT_ROBOTS,
  indexability: 'indexable',
  ...metadata,
});

/**
 * Static page metadata mapping for routes that do not need live Shopify data.
 * Product pages and blog posts can still be resolved dynamically by delivery
 * layers until consolidation is complete.
 */
export const STATIC_PAGE_METADATA: Record<string, PageMetadata> = {
  '/': withMetadataDefaults({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    canonical: `${SITE_URL}/`,
  }),
  '/sarees': withMetadataDefaults({
    title: 'Sarees Collection | Silk & Bridal Sarees Online | LuxeMia',
    description: 'Shop beautiful silk sarees, bridal sarees, and designer sarees at LuxeMia. Banarasi, Kanchipuram, and georgette sarees. Free shipping over $350 to USA, Canada & Australia.',
    canonical: `${SITE_URL}/sarees`,
    ogImage: `${SITE_URL}/og/og-sarees.jpg`,
    type: 'collection',
  }),
  '/lehengas': withMetadataDefaults({
    title: 'Lehengas Collection | Bridal & Wedding Lehengas Online | LuxeMia',
    description: 'Shop stunning bridal lehengas, wedding lehengas, and festive lehengas at LuxeMia. Embroidered, silk, and designer lehengas. Free shipping over $350 to USA, Canada & Australia.',
    canonical: `${SITE_URL}/lehengas`,
    ogImage: `${SITE_URL}/og/og-lehengas.jpg`,
    type: 'collection',
  }),
  '/suits': withMetadataDefaults({
    title: 'Salwar Kameez & Suits | Anarkali & Palazzo Suits Online | LuxeMia',
    description: 'Shop elegant salwar kameez, anarkali suits, palazzo suits, and sharara sets at LuxeMia. Pakistani suits and designer suits. Free shipping over $350 to USA, Canada & Australia.',
    canonical: `${SITE_URL}/suits`,
    ogImage: `${SITE_URL}/og/og-suits.jpg`,
    type: 'collection',
  }),
  '/menswear': withMetadataDefaults({
    title: 'Menswear | Sherwanis & Kurta Pajama Sets Online | LuxeMia',
    description: 'Shop premium sherwanis, kurta pajama sets, and indo-western menswear at LuxeMia. Wedding and festive collection. Free shipping over $350 to USA, Canada & Australia.',
    canonical: `${SITE_URL}/menswear`,
    ogImage: `${SITE_URL}/og/og-menswear.jpg`,
    type: 'collection',
  }),
  '/collections': withMetadataDefaults({
    title: 'All Collections | Indian Ethnic Wear | LuxeMia',
    description: 'Browse all Indian ethnic wear collections at LuxeMia. Lehengas, sarees, suits, and menswear for every occasion. Free shipping over $350 to USA, Canada & Australia.',
    canonical: `${SITE_URL}/collections`,
    type: 'collection',
  }),
  '/blog': withMetadataDefaults({
    title: 'Blog | Indian Fashion Tips & Ethnic Wear Guides | LuxeMia',
    description: 'Read our blog for the latest Indian fashion trends, saree styling tips, wedding outfit guides, and ethnic wear care instructions from LuxeMia.',
    canonical: `${SITE_URL}/blog`,
    type: 'article',
  }),
  '/brand-story': withMetadataDefaults({
    title: 'Our Story | About LuxeMia - Indian Ethnic Wear Brand',
    description: 'Learn about LuxeMia, our passion for authentic Indian ethnic wear, ethical sourcing, and commitment to quality craftsmanship. Based in Philadelphia, shipping worldwide.',
    canonical: `${SITE_URL}/brand-story`,
  }),
  '/new-arrivals': withMetadataDefaults({
    title: 'New Arrivals | Latest Indian Ethnic Wear | LuxeMia',
    description: 'Discover the newest arrivals of Indian ethnic wear at LuxeMia. Fresh designs in lehengas, sarees, suits, and menswear. Free shipping over $350.',
    canonical: `${SITE_URL}/new-arrivals`,
    type: 'collection',
  }),
  '/bestsellers': withMetadataDefaults({
    title: 'Bestsellers | Most Popular Indian Ethnic Wear | LuxeMia',
    description: 'Shop LuxeMia\'s bestselling Indian ethnic wear. Our most loved lehengas, sarees, and suits chosen by customers. Free shipping over $350.',
    canonical: `${SITE_URL}/bestsellers`,
    type: 'collection',
  }),
  '/indowestern': withMetadataDefaults({
    title: 'Indo-Western Collection | Fusion Wear Online | LuxeMia',
    description: 'Shop trendy indo-western and fusion wear at LuxeMia. Modern silhouettes with traditional craftsmanship. Free shipping over $350 to USA, Canada & Australia.',
    canonical: `${SITE_URL}/indowestern`,
    type: 'collection',
  }),
  '/nri': withMetadataDefaults({
    title: 'NRI Indian Ethnic Wear | Shipping to USA, Canada & Australia | LuxeMia',
    description: 'Shop Indian ethnic wear from abroad. LuxeMia ships authentic lehengas, sarees, and suits to USA, Canada & Australia. Free shipping over $350.',
    canonical: `${SITE_URL}/nri`,
  }),
  '/nri/usa': withMetadataDefaults({
    title: 'Indian Ethnic Wear in USA | Shop Online with Fast Shipping | LuxeMia',
    description: 'Shop authentic Indian ethnic wear online in the USA. Bridal lehengas, silk sarees, salwar suits with free shipping over $350. Delivery in 7-10 business days.',
    canonical: `${SITE_URL}/nri/usa`,
  }),
  '/nri/canada': withMetadataDefaults({
    title: 'Indian Ethnic Wear in Canada | Shop Online with Fast Shipping | LuxeMia',
    description: 'Shop authentic Indian ethnic wear online in Canada. Bridal lehengas, silk sarees, salwar suits with free shipping over $350. Delivery in 7-10 business days.',
    canonical: `${SITE_URL}/nri/canada`,
  }),
  '/indian-ethnic-wear-usa': withMetadataDefaults({
    title: 'Indian Ethnic Wear in USA | Shop Online with Fast Shipping | LuxeMia',
    description: 'Shop authentic Indian ethnic wear online in the USA. Bridal lehengas, silk sarees, salwar suits with free shipping over $350.',
    canonical: `${SITE_URL}/indian-ethnic-wear-usa`,
  }),
  '/indian-ethnic-wear-canada': withMetadataDefaults({
    title: 'Indian Ethnic Wear in Canada | Shop Online with Fast Shipping | LuxeMia',
    description: 'Shop authentic Indian ethnic wear online in Canada. Bridal lehengas, silk sarees, salwar suits with free shipping over $350.',
    canonical: `${SITE_URL}/indian-ethnic-wear-canada`,
  }),
  '/shipping': withMetadataDefaults({
    title: 'Shipping Policy | Free Shipping Over $350 | LuxeMia',
    description: 'LuxeMia ships to USA, Canada & Australia. Free shipping on orders over $350. Flat rate $25 for orders under $350. Standard delivery 7-10 business days.',
    canonical: `${SITE_URL}/shipping`,
  }),
  '/returns': withMetadataDefaults({
    title: 'Returns & Cancellations Policy | LuxeMia',
    description: 'LuxeMia returns and cancellations policy. All sales are final. Only genuine shipping damage claims accepted within 48 hours with mandatory unboxing video.',
    canonical: `${SITE_URL}/returns`,
  }),
  '/privacy': withMetadataDefaults({
    title: 'Privacy Policy | LuxeMia',
    description: 'Read LuxeMia\'s privacy policy. We protect your personal data and are committed to ensuring your privacy when shopping for Indian ethnic wear.',
    canonical: `${SITE_URL}/privacy`,
  }),
  '/terms': withMetadataDefaults({
    title: 'Terms of Service | LuxeMia',
    description: 'Read LuxeMia\'s terms of service for purchasing Indian ethnic wear online. By using our site, you agree to these terms.',
    canonical: `${SITE_URL}/terms`,
  }),
  '/contact': withMetadataDefaults({
    title: 'Contact Us | LuxeMia - Indian Ethnic Wear',
    description: 'Contact LuxeMia for questions about Indian ethnic wear, orders, or style consultations. Email hello@luxemia.shop or call +1-215-341-9990.',
    canonical: `${SITE_URL}/contact`,
  }),
  '/faq': withMetadataDefaults({
    title: 'FAQ | Frequently Asked Questions | LuxeMia',
    description: 'Find answers to common questions about LuxeMia orders, shipping, sizing, fabric care, and Indian ethnic wear. Free shipping over $350 to USA, Canada & Australia.',
    canonical: `${SITE_URL}/faq`,
  }),
  '/size-guide': withMetadataDefaults({
    title: 'Size Guide | Indian Ethnic Wear Sizing | LuxeMia',
    description: 'LuxeMia size guide for Indian ethnic wear. Find your perfect fit for lehengas, sarees, suits, and menswear. Custom tailoring available.',
    canonical: `${SITE_URL}/size-guide`,
  }),
  '/care-guide': withMetadataDefaults({
    title: 'Care Guide | How to Care for Indian Ethnic Wear | LuxeMia',
    description: 'Learn how to care for your Indian ethnic wear. Fabric-specific care instructions for silk, georgette, chiffon, and more from LuxeMia.',
    canonical: `${SITE_URL}/care-guide`,
  }),
  '/style-consultation': withMetadataDefaults({
    title: 'Style Consultation | Personal Styling for Indian Ethnic Wear | LuxeMia',
    description: 'Book a free style consultation with LuxeMia. Get personalized recommendations for lehengas, sarees, and suits for your next event.',
    canonical: `${SITE_URL}/style-consultation`,
  }),
  '/style-quiz': withMetadataDefaults({
    title: 'Style Quiz | Find Your Perfect Indian Outfit | LuxeMia',
    description: 'Take the LuxeMia style quiz to discover your perfect Indian ethnic outfit. Personalized recommendations for lehengas, sarees, and suits.',
    canonical: `${SITE_URL}/style-quiz`,
  }),
  '/artisans': withMetadataDefaults({
    title: 'Our Artisans | Behind the Craftsmanship | LuxeMia',
    description: 'Learn about the craft behind LuxeMia\'s Indian ethnic wear. Traditional embroidery, weaving, and textile techniques.',
    canonical: `${SITE_URL}/artisans`,
  }),
  '/sustainability': withMetadataDefaults({
    title: 'Sustainability | Ethical Fashion | LuxeMia',
    description: 'Learn about LuxeMia\'s commitment to sustainable and ethical fashion. Responsible sourcing and fair trade practices in Indian ethnic wear.',
    canonical: `${SITE_URL}/sustainability`,
  }),
  '/press': withMetadataDefaults({
    title: 'Press | LuxeMia in the Media',
    description: 'LuxeMia in the media. Press coverage and features about our Indian ethnic wear collections and brand story.',
    canonical: `${SITE_URL}/press`,
  }),
  '/virtual-try-on': withMetadataDefaults({
    title: 'Virtual Try-On | Preview Your Indian Outfit | LuxeMia',
    description: 'Try on Indian ethnic wear virtually with LuxeMia\'s virtual try-on tool. Preview lehengas, sarees, and suits before you buy.',
    canonical: `${SITE_URL}/virtual-try-on`,
    robots: 'noindex, follow',
    indexability: 'noindex',
  }),
};

/**
 * Get metadata for a blog post by slug.
 * Used as a shared fallback until blog metadata is fully consolidated.
 */
export function getBlogMetadata(slug: string): PageMetadata | null {
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
      title: 'Designer Wedding Dress Under Rs. 50,000 | LuxeMia Blog',
      description: 'Find stunning designer wedding dresses under Rs. 50,000. Budget-friendly bridal options at LuxeMia.',
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
      description: 'Top Indian wedding trends for 2026. Fashion, decor, and styling trends at LuxeMia.',
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

  return withMetadataDefaults({
    title: blogData.title,
    description: blogData.description,
    canonical: `${SITE_URL}/blog/${slug}`,
    type: 'article',
  });
}

/**
 * Get static page metadata, or return a fully-shaped default.
 */
export function getStaticPageMetadata(pathname: string): PageMetadata {
  return STATIC_PAGE_METADATA[pathname] || withMetadataDefaults({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    canonical: `${SITE_URL}${pathname}`,
  });
}
