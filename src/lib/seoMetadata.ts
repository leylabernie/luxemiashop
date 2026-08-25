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
import { getIndexableRouteSeo } from '@/config/seoArchitecture';

const homepageSeo = getIndexableRouteSeo('/');
export const DEFAULT_TITLE = homepageSeo.title;
export const DEFAULT_DESCRIPTION = homepageSeo.description;
const RETURN_POLICY_SEO_DESCRIPTION = 'Read LuxeMia’s final-sale policy and the 48-hour process for reporting genuine shipping damage or defect, an incorrect item, or a missing item.';

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
    title: homepageSeo.title,
    description: homepageSeo.description,
    canonical: SITE_URL,
    image: `${SITE_URL}/images/campaigns/new-indian-ethnic-wear-2026-desktop.jpg`,
  },
  '/sarees': {
    title: 'Buy Sarees Online — Silk, Banarasi & Wedding Sarees | LuxeMia',
    description: "Browse currently listed sarees at LuxeMia. Open each product for its exact fabric, color, included pieces, price and availability. U.S. shipping is free at $135 and above; $12 below.",
    canonical: `${SITE_URL}/sarees`,
    image: `${SITE_URL}/og/og-sarees.jpg`,
  },
  '/lehengas': {
    title: 'Buy Bridal Lehengas Online | Wedding & Festive Lehenga Choli — LuxeMia',
    description: "Browse currently listed lehenga and lehenga choli styles at LuxeMia. See exact fabric, embellishment, included pieces, sizes, price and availability on each product.",
    canonical: `${SITE_URL}/lehengas`,
    image: `${SITE_URL}/og/og-lehengas.jpg`,
  },
  '/suits': {
    title: 'Buy Salwar Suits Online — Anarkali, Palazzo & Sharara | LuxeMia',
    description: "Browse currently listed Indian suits at LuxeMia, including available Anarkali, palazzo, sharara and salwar styles. Each product shows exact details, sizes and price.",
    canonical: `${SITE_URL}/suits`,
    image: `${SITE_URL}/og/og-suits.jpg`,
  },
  '/menswear': {
    title: 'Buy Sherwanis Online — Wedding & Groom Sherwani for Men | LuxeMia',
    description: "Browse currently listed sherwanis, kurta sets and Indo-Western menswear at LuxeMia. Each listing shows the exact included pieces, fabric, sizes, price and availability.",
    canonical: `${SITE_URL}/menswear`,
    image: `${SITE_URL}/og/og-menswear.jpg`,
  },
  '/jewelry': {
    title: "Indian Jewelry Sets & Necklaces | LuxeMia",
    description: "Browse currently listed Indian jewelry sets, necklaces, chokers, earrings and bracelets at LuxeMia. Each listing shows its exact components, finish, price and availability.",
    canonical: `${SITE_URL}/jewelry`,
    image: `${SITE_URL}/images/campaigns/new-indian-ethnic-wear-2026-desktop.jpg`,
  },
  '/collections': {
    title: 'All Collections | Indian Ethnic Wear | LuxeMia',
    description: "Browse LuxeMia's live collections of sarees, lehengas, suits, menswear and jewelry. Open any product for its exact details, sizes, price and availability.",
    canonical: `${SITE_URL}/collections`,
    image: `${SITE_URL}/images/campaigns/new-indian-ethnic-wear-2026-desktop.jpg`,
  },
  '/blog': {
    title: 'Blog | Indian Fashion Tips & Ethnic Wear Guides | LuxeMia',
    description: "Read published LuxeMia guides about Indian clothing, styling, sizing and care. Product availability and store policies are always confirmed on the relevant live pages.",
    canonical: `${SITE_URL}/blog`,
    type: 'article',
  },
  '/about': {
    title: 'Our Story — LuxeMia',
    description: 'Discover LuxeMia: Indian occasionwear chosen for weddings, festivals, and meaningful celebrations in the United States.',
    canonical: `${SITE_URL}/about`,
  },
  '/new-arrivals': {
    title: 'New Arrivals | Latest Indian Ethnic Wear | LuxeMia',
    description: "See the products most recently added to LuxeMia. Open each listing for exact product details, available sizes, price and current availability.",
    canonical: `${SITE_URL}/new-arrivals`,
  },
  '/indowestern': {
    title: 'Indo-Western Collection | Fusion Wear Online | LuxeMia',
    description: "Browse currently listed Indo-Western and fusion outfits at LuxeMia. See exact product details, sizes, prices and availability. Free U.S. shipping at $135 and above; $12 below.",
    canonical: `${SITE_URL}/indowestern`,
  },
  '/nri': {
    title: "Indian Ethnic Wear Online | U.S. Shipping | LuxeMia",
    description: "Browse LuxeMia's online catalog for delivery to United States addresses. Shipping is $12 below $135 and free at $135 and above; tracking is emailed after dispatch.",
    canonical: `${SITE_URL}/nri`,
  },
  '/nri/usa': {
    title: "Indian Ethnic Wear Online in the USA | LuxeMia",
    description: "Browse Indian sarees, lehengas, suits, menswear and jewelry online for delivery to U.S. addresses. Exact details, prices and availability are shown per product.",
    canonical: `${SITE_URL}/nri/usa`,
  },
  '/indian-ethnic-wear-usa': {
    title: "Indian Ethnic Wear Online in the USA | LuxeMia",
    description: "Browse Indian sarees, lehengas, suits, menswear and jewelry online for delivery to U.S. addresses. Shipping is free at $135 and above and $12 below.",
    canonical: `${SITE_URL}/indian-ethnic-wear-usa`,
  },
  '/shipping': {
    title: 'U.S. Shipping Policy | LuxeMia',
    description: 'LuxeMia ships to United States addresses. Standard shipping is $12 below $135 and free at $135 and above; tracking is emailed after dispatch.',
    canonical: `${SITE_URL}/shipping`,
  },
  '/pages/shipping-customs': {
    title: 'U.S. Shipping & Taxes | LuxeMia',
    description: "Review LuxeMia's United States shipping rates, tracking and tax guidance before ordering.",
    canonical: `${SITE_URL}/pages/shipping-customs`,
  },
  '/returns': {
    title: 'Returns & Cancellations Policy | LuxeMia',
    description: RETURN_POLICY_SEO_DESCRIPTION,
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
    description: "Answers to common LuxeMia questions about orders, U.S. shipping, cancellations, final-sale terms, sizing and product-specific care.",
    canonical: `${SITE_URL}/faq`,
  },
  '/size-guide': {
    title: 'Size Guide | Indian Ethnic Wear Sizing | LuxeMia',
    description: "Use LuxeMia's general size guide together with the size options and measurements shown on the individual product listing. Contact support before ordering if needed.",
    canonical: `${SITE_URL}/size-guide`,
  },
  '/care-guide': {
    title: 'Care Guide | How to Care for Indian Ethnic Wear | LuxeMia',
    description: "Review general care guidance for Indian clothing and jewelry, then follow any product-specific care information shown on the individual LuxeMia listing.",
    canonical: `${SITE_URL}/care-guide`,
  },
  '/style-quiz': {
    title: 'Style Quiz | Find Your Perfect Indian Outfit | LuxeMia',
    description: 'Take the LuxeMia style quiz to discover your perfect Indian ethnic outfit. Personalized recommendations for lehengas, sarees, and suits.',
    canonical: `${SITE_URL}/style-quiz`,
  },
  '/press': {
    title: 'Press | LuxeMia in the Media',
    description: "LuxeMia press information and contact details for media inquiries.",
    canonical: `${SITE_URL}/press`,
  },
};

/**
 * Get metadata for a blog post by slug.
 * Used by middleware to inject proper meta tags for blog pages.
 */
export function getBlogMetadata(_slug: string): PageMetadata | null {
  // Article metadata comes from the compact, published blog data loaded by
  // middleware. Unknown and retired slugs intentionally have no fallback.
  return null;
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
