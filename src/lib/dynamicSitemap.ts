import { fetchAllProducts } from "@/lib/shopify";
import { blogPosts, PUBLISHED_BLOG_SLUGS } from '@/data/blogPosts';
import { GONE_PRODUCT_HANDLES } from '@/lib/goneRoutes';
import { isProductExplicitlyOrderable } from '@/lib/orderability';
import { isHiddenBillingProductHandle } from '@/lib/serviceAddOns';
// Product URLs come only from the live Shopify catalog. This keeps the sitemap
// aligned with middleware, which validates /product/{handle} through Shopify,
// and excludes local or database-only records that would resolve to 404.

interface SitemapProduct {
  handle: string;
  title: string;
  category: string;
  images: string[];
  lastmod?: string;
}


// Static pages configuration — only real, indexable pages (no noIndex, no redirects)
export const staticPages = [
  // Core navigation
  { loc: '/', changefreq: 'daily', priority: '1.0', title: 'Home' },
  { loc: '/collections', changefreq: 'daily', priority: '0.9', title: 'All Collections' },
  // Main category pages
  { loc: '/lehengas', changefreq: 'daily', priority: '0.9', title: 'Lehengas' },
  { loc: '/sarees', changefreq: 'daily', priority: '0.9', title: 'Sarees' },
  { loc: '/jewelry', changefreq: 'daily', priority: '0.9', title: 'Jewelry' },
  { loc: '/collections/silk-sarees', changefreq: 'daily', priority: '0.9', title: 'Silk Sarees' },
  { loc: '/collections/kanchipuram-sarees', changefreq: 'daily', priority: '0.9', title: 'Kanchipuram Sarees' },
  { loc: '/collections/bridal-party-outfits', changefreq: 'daily', priority: '0.9', title: 'Bridesmaid & Maid of Honor Outfits' },
  { loc: '/collections/bollywood-inspired-indian-outfits', changefreq: 'daily', priority: '0.9', title: 'Bollywood-Inspired Indian Outfits' },
  { loc: '/collections/customizable-indian-outfits', changefreq: 'weekly', priority: '0.9', title: 'Customizable Indian Outfits' },
  { loc: '/collections/bridal-lehengas', changefreq: 'daily', priority: '0.9', title: 'Bridal Lehengas' },
  { loc: '/collections/party-wear-lehengas', changefreq: 'daily', priority: '0.9', title: 'Party-Wear Lehengas' },
  { loc: '/collections/wedding-sarees', changefreq: 'daily', priority: '0.9', title: 'Wedding Sarees' },
  { loc: '/collections/banarasi-sarees', changefreq: 'daily', priority: '0.9', title: 'Banarasi Sarees' },
  { loc: '/collections/wedding-guest-lehengas', changefreq: 'daily', priority: '0.9', title: 'Wedding Guest Lehengas' },
  { loc: '/collections/wedding-guest-kurta-sets', changefreq: 'daily', priority: '0.9', title: 'Wedding Guest Kurta Sets' },
  { loc: '/collections/diwali-womenswear', changefreq: 'daily', priority: '0.9', title: 'Diwali Outfits for Women' },
  { loc: '/collections/diwali-menswear', changefreq: 'daily', priority: '0.9', title: 'Diwali Outfits for Men' },
  { loc: '/collections/designer-sarees', changefreq: 'daily', priority: '0.9', title: 'Designer Sarees' },
  { loc: '/collections/anarkali-suits', changefreq: 'daily', priority: '0.9', title: 'Anarkali Suits' },
  { loc: '/collections/sharara-suits', changefreq: 'daily', priority: '0.9', title: 'Sharara Suits' },
  { loc: '/collections/gharara-suits', changefreq: 'daily', priority: '0.9', title: 'Gharara Suits' },
  { loc: '/collections/palazzo-suits', changefreq: 'daily', priority: '0.9', title: 'Palazzo Suits' },
  { loc: '/collections/sherwani-for-groom', changefreq: 'daily', priority: '0.9', title: 'Groom Sherwanis' },
  { loc: '/suits', changefreq: 'daily', priority: '0.9', title: 'Salwar Kameez & Suits' },
  { loc: '/menswear', changefreq: 'daily', priority: '0.9', title: 'Menswear' },
  { loc: '/indowestern', changefreq: 'daily', priority: '0.8', title: 'Indo-Western' },
  { loc: '/new-arrivals', changefreq: 'daily', priority: '0.8', title: 'New Arrivals' },
  { loc: '/ready-to-ship', changefreq: 'daily', priority: '0.9', title: 'Ready-to-Ship Outfits' },
  { loc: '/festive-wear', changefreq: 'weekly', priority: '0.8', title: 'Indian Festive Wear' },
  { loc: '/indian-wedding-guest-outfits', changefreq: 'weekly', priority: '0.8', title: 'Indian Wedding Guest Outfits' },
  { loc: '/wedding-events', changefreq: 'weekly', priority: '0.8', title: 'Shop by Wedding Event' },
  { loc: '/shop-by-fulfillment', changefreq: 'weekly', priority: '0.7', title: 'Shop by Fulfillment' },
  { loc: '/shop-by-fulfillment/ready-to-ship', changefreq: 'daily', priority: '0.8', title: 'Ready-to-Ship Indian Outfits' },
  { loc: '/shop-by-fulfillment/made-to-order', changefreq: 'weekly', priority: '0.7', title: 'Made-to-Order Indian Outfits' },
  { loc: '/shop-by-fulfillment/customizable-outfits', changefreq: 'weekly', priority: '0.8', title: 'Customizable Indian Outfits' },
  // Occasion landing pages — high buyer-intent SEO
  { loc: '/collections/diwali-outfits', changefreq: 'weekly', priority: '0.9', title: 'Diwali Outfits 2026' },
  { loc: '/collections/wedding-guest-outfits', changefreq: 'weekly', priority: '0.9', title: 'Indian Wedding Guest Outfits' },
  { loc: '/collections/mehendi-outfits', changefreq: 'weekly', priority: '0.9', title: 'Mehendi Ceremony Outfits' },
  { loc: '/collections/eid-outfits', changefreq: 'weekly', priority: '0.9', title: 'Eid Outfits 2026' },
  { loc: '/collections/navratri-outfits', changefreq: 'weekly', priority: '0.9', title: 'Navratri Outfits — Chaniya Choli & Garba' },
  { loc: '/collections/haldi-outfits', changefreq: 'weekly', priority: '0.9', title: 'Haldi Ceremony Outfits' },
  { loc: '/collections/navratri-chaniya-choli', changefreq: 'weekly', priority: '0.9', title: 'Navratri Chaniya Choli' },
  { loc: '/collections/garba-outfits', changefreq: 'weekly', priority: '0.9', title: 'Garba and Dandiya Outfits' },
  { loc: '/collections/groomsmen-outfits', changefreq: 'weekly', priority: '0.9', title: 'Indian Groomsmen Outfits' },
  { loc: '/collections/sangeet-outfits', changefreq: 'weekly', priority: '0.9', title: 'Sangeet Outfits' },
  { loc: '/collections/reception-outfits', changefreq: 'weekly', priority: '0.9', title: 'Indian Reception Outfits' },
  // Brand & editorial
  { loc: '/about', changefreq: 'monthly', priority: '0.6', title: 'About LuxeMia' },
  { loc: '/sitemap', changefreq: 'weekly', priority: '0.4', title: 'Sitemap' },
  { loc: '/lookbook', changefreq: 'monthly', priority: '0.7', title: 'Lookbook' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.7', title: 'Guides' },
  { loc: '/blog/indian-wedding-guest-attire', changefreq: 'monthly', priority: '0.7', title: 'Indian Wedding Guest Attire Guides' },
  { loc: '/blog/indian-textiles-and-embroidery', changefreq: 'monthly', priority: '0.7', title: 'Indian Textiles and Embroidery Guides' },
  { loc: '/blog/weddings-festivals', changefreq: 'monthly', priority: '0.7', title: 'Wedding and Festival Guides' },
  { loc: '/blog/fit-sizing-and-garment-care', changefreq: 'monthly', priority: '0.7', title: 'Fit, Sizing and Garment Care Guides' },
  { loc: '/blog/designer-profiles', changefreq: 'monthly', priority: '0.7', title: 'Designer Profiles' },
  { loc: '/blog/cultural-context', changefreq: 'monthly', priority: '0.7', title: 'Cultural Context Guides' },
  { loc: '/authors/luxemia-editorial-team', changefreq: 'monthly', priority: '0.4', title: 'LuxeMia Editorial Team' },
  { loc: '/press', changefreq: 'monthly', priority: '0.5', title: 'Press and Media' },
  { loc: '/editorial-policy', changefreq: 'yearly', priority: '0.4', title: 'Editorial Policy' },
  { loc: '/review-policy', changefreq: 'yearly', priority: '0.4', title: 'Review Policy' },
  // NRI landing pages
  { loc: '/nri', changefreq: 'monthly', priority: '0.7', title: 'Indian Ethnic Wear for NRIs' },
  { loc: '/indian-ethnic-wear-usa', changefreq: 'weekly', priority: '0.8', title: 'Indian Ethnic Wear USA' },
  // Customer service
  { loc: '/contact', changefreq: 'monthly', priority: '0.5', title: 'Contact' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.5', title: 'FAQ' },
  { loc: '/shipping', changefreq: 'monthly', priority: '0.5', title: 'Shipping Policy' },
  { loc: '/shipping/united-states', changefreq: 'monthly', priority: '0.6', title: 'Shipping to the United States' },
  { loc: '/shipping/canada', changefreq: 'monthly', priority: '0.6', title: 'Shipping to Canada' },
  { loc: '/shipping/united-kingdom', changefreq: 'monthly', priority: '0.6', title: 'Shipping to the United Kingdom' },
  { loc: '/shipping/australia', changefreq: 'monthly', priority: '0.6', title: 'Shipping to Australia' },
  { loc: '/pages/shipping-customs', changefreq: 'monthly', priority: '0.4', title: 'Shipping and Customs' },
  { loc: '/returns', changefreq: 'monthly', priority: '0.4', title: 'Returns Policy' },
  { loc: '/size-guide', changefreq: 'monthly', priority: '0.5', title: 'Size Guide' },
  { loc: '/sizing-measurements-guide', changefreq: 'monthly', priority: '0.8', title: 'Sizing and Measurement Guide' },
  { loc: '/care-guide', changefreq: 'monthly', priority: '0.5', title: 'Care Guide' },
  { loc: '/us-support', changefreq: 'monthly', priority: '0.5', title: 'Customer Support' },
  { loc: '/wedding-party-orders', changefreq: 'monthly', priority: '0.8', title: 'Wedding-Party Order Support' },
  // Legal
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3', title: 'Privacy Policy' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3', title: 'Terms & Conditions' },
];

const publishedGuideSlugs = new Set<string>(PUBLISHED_BLOG_SLUGS);
export const guidePages = blogPosts
  .filter((post) => publishedGuideSlugs.has(post.slug))
  .map((post) => ({ loc: `/blog/${post.slug}`, title: post.title }));

// Fetch live Shopify products for the human-readable directory only.
// Shopify is the only product source: an API failure returns no product URLs
// instead of falling back to stale or database-only catalog records.
export const fetchAllSitemapProducts = async (): Promise<SitemapProduct[]> => {
  const products: SitemapProduct[] = [];

  // 1. Fetch live products from Shopify Storefront API
  try {
    const shopifyProducts = await fetchAllProducts();
    shopifyProducts
      .filter(({ node }) => !GONE_PRODUCT_HANDLES.has(node.handle))
      .filter(({ node }) => !isHiddenBillingProductHandle(node.handle))
      .filter(({ node }) => isProductExplicitlyOrderable(node))
      .forEach(({ node }) => {
      products.push({
        handle: node.handle,
        title: node.title,
        category: node.productType || 'Ethnic Wear',
        images: node.images.edges.map(e => e.node.url),
      });
    });
  } catch (err) {
    console.error('dynamicSitemap: Failed to fetch from Shopify:', err);
  }

  // Only live Shopify products are included. Database-only scraped records can resolve to 404 in middleware.
  return products;
};
