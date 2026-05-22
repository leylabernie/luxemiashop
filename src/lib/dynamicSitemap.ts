import { supabase } from "@/integrations/supabase/client";
import { localProducts } from "@/data/localProducts";
import { sareeProducts } from "@/data/sareeProducts";
import { menswearProducts } from "@/data/menswearProducts";
import { suitProducts } from "@/data/suitProducts";
import { jewelryProducts } from "@/data/jewelryProducts";

interface SitemapProduct {
  handle: string;
  title: string;
  category: string;
  images: string[];
  lastmod?: string;
}

interface ScrapedProductRow {
  id: string;
  source_id: string;
  title: string;
  category: string;
  image_url: string;
  image_urls: string[] | null;
  updated_at: string;
}

// Static pages configuration — only real, indexable pages (no noIndex, no redirects)
export const staticPages = [
  // Core navigation
  { loc: '/', changefreq: 'daily', priority: '1.0', title: 'Home' },
  { loc: '/collections', changefreq: 'daily', priority: '0.9', title: 'All Collections' },
  // Main category pages
  { loc: '/lehengas', changefreq: 'daily', priority: '0.9', title: 'Lehengas' },
  { loc: '/sarees', changefreq: 'daily', priority: '0.9', title: 'Sarees' },
  { loc: '/suits', changefreq: 'daily', priority: '0.9', title: 'Salwar Kameez & Suits' },
  { loc: '/menswear', changefreq: 'daily', priority: '0.9', title: 'Menswear' },
  { loc: '/indowestern', changefreq: 'daily', priority: '0.8', title: 'Indo-Western' },
  { loc: '/new-arrivals', changefreq: 'daily', priority: '0.8', title: 'New Arrivals' },
  { loc: '/bestsellers', changefreq: 'weekly', priority: '0.8', title: 'Bestsellers' },
  // Occasion landing pages — high buyer-intent SEO
  { loc: '/collections/bridal-lehengas', changefreq: 'weekly', priority: '0.9', title: 'Bridal Lehengas for Indian Weddings' },
  { loc: '/collections/wedding-sarees', changefreq: 'weekly', priority: '0.9', title: 'Wedding Sarees for Indian Ceremonies' },
  { loc: '/collections/reception-outfits', changefreq: 'weekly', priority: '0.9', title: 'Reception Outfits for Indian Weddings' },
  { loc: '/collections/party-wear-lehengas', changefreq: 'weekly', priority: '0.9', title: 'Party Wear Lehengas for Indian Events' },
  { loc: '/collections/designer-sarees', changefreq: 'weekly', priority: '0.9', title: 'Designer Sarees' },
  { loc: '/collections/silk-sarees', changefreq: 'weekly', priority: '0.9', title: 'Silk Sarees' },
  { loc: '/collections/pakistani-suits', changefreq: 'weekly', priority: '0.9', title: 'Pakistani Suits' },
  { loc: '/collections/anarkali-suits', changefreq: 'weekly', priority: '0.9', title: 'Anarkali Suits' },
  { loc: '/collections/salwar-kameez', changefreq: 'weekly', priority: '0.9', title: 'Salwar Kameez' },
  { loc: '/collections/sharara-suits', changefreq: 'weekly', priority: '0.9', title: 'Sharara Suits' },
  { loc: '/collections/diwali-outfits', changefreq: 'weekly', priority: '0.9', title: 'Diwali Outfits 2026' },
  { loc: '/collections/wedding-guest-outfits', changefreq: 'weekly', priority: '0.9', title: 'Indian Wedding Guest Outfits' },
  { loc: '/collections/mehendi-outfits', changefreq: 'weekly', priority: '0.9', title: 'Mehendi Ceremony Outfits' },
  { loc: '/collections/eid-outfits', changefreq: 'weekly', priority: '0.9', title: 'Eid Outfits 2026' },
  { loc: '/collections/navratri-outfits', changefreq: 'weekly', priority: '0.9', title: 'Navratri Outfits — Chaniya Choli & Garba' },
  // Brand & editorial
  { loc: '/brand-story', changefreq: 'monthly', priority: '0.6', title: 'Brand Story' },
  { loc: '/artisans', changefreq: 'monthly', priority: '0.6', title: 'Artisans' },
  { loc: '/sustainability', changefreq: 'monthly', priority: '0.6', title: 'Sustainability' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.7', title: 'Blog' },
  // NRI landing pages
  { loc: '/nri', changefreq: 'monthly', priority: '0.7', title: 'Indian Ethnic Wear for NRIs' },
  { loc: '/nri/usa', changefreq: 'monthly', priority: '0.8', title: 'Indian Ethnic Wear USA' },
  { loc: '/nri/canada', changefreq: 'monthly', priority: '0.8', title: 'Indian Ethnic Wear Canada' },
  { loc: '/indian-ethnic-wear-usa', changefreq: 'weekly', priority: '0.8', title: 'Indian Ethnic Wear USA' },
  { loc: '/indian-ethnic-wear-canada', changefreq: 'weekly', priority: '0.8', title: 'Indian Ethnic Wear Canada' },
  // Customer service
  { loc: '/contact', changefreq: 'monthly', priority: '0.5', title: 'Contact' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.5', title: 'FAQ' },
  { loc: '/shipping', changefreq: 'monthly', priority: '0.5', title: 'Shipping Policy' },
  { loc: '/returns', changefreq: 'monthly', priority: '0.4', title: 'Returns Policy' },
  { loc: '/size-guide', changefreq: 'monthly', priority: '0.5', title: 'Size Guide' },
  { loc: '/care-guide', changefreq: 'monthly', priority: '0.5', title: 'Care Guide' },
  // Legal
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3', title: 'Privacy Policy' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3', title: 'Terms & Conditions' },
];

// Fetch all products for sitemap (local + scraped from database)
export const fetchAllSitemapProducts = async (): Promise<SitemapProduct[]> => {
  const products: SitemapProduct[] = [];

  // Add local products
  localProducts.forEach(p => {
    products.push({
      handle: p.handle,
      title: p.title,
      category: p.category,
      images: p.images,
    });
  });

  // Add saree products
  sareeProducts.forEach(p => {
    products.push({
      handle: p.handle,
      title: p.title,
      category: 'Sarees',
      images: p.images,
    });
  });

  // Add menswear products
  menswearProducts.forEach(p => {
    products.push({
      handle: p.handle,
      title: p.title,
      category: 'Menswear',
      images: p.images,
    });
  });

  // Add suit products
  suitProducts.forEach(p => {
    products.push({
      handle: p.handle,
      title: p.title,
      category: 'Suits',
      images: p.images,
    });
  });

  // Add jewelry products
  jewelryProducts.forEach(p => {
    products.push({
      handle: p.id,
      title: p.name,
      category: 'Jewelry',
      images: [p.image],
    });
  });

  // Fetch scraped products from database
  try {
    const { data: scrapedProducts, error } = await supabase
      .from('scraped_products')
      .select('id, source_id, title, category, image_url, image_urls, updated_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && scrapedProducts) {
      scrapedProducts.forEach((p: ScrapedProductRow) => {
        const images = p.image_urls && p.image_urls.length > 0 
          ? p.image_urls 
          : [p.image_url];
        
        products.push({
          handle: p.source_id,
          title: p.title,
          category: p.category,
          images,
          lastmod: p.updated_at,
        });
      });
    }
  } catch (error) {
    console.error('Error fetching scraped products for sitemap:', error);
  }

  return products;
};

// Escape XML special characters
const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Format date for sitemap
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Generate image tags for a product
const generateImageTags = (images: string[], title: string, category: string): string => {
  if (!images || images.length === 0) return '';
  
  return images.map(imageUrl => `
      <image:image>
        <image:loc>${escapeXml(imageUrl)}</image:loc>
        <image:title>${escapeXml(title)}</image:title>
        <image:caption>${escapeXml(`${title} - ${category} | Luxemia`)}</image:caption>
      </image:image>`).join('');
};

// Generate full XML sitemap
export const generateXmlSitemap = async (baseUrl: string = 'https://luxemia.shop'): Promise<string> => {
  const today = formatDate(new Date());
  const products = await fetchAllSitemapProducts();

  // Static pages XML
  const staticPagesXml = staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

  // Products XML with images
  const productsXml = products.map(product => {
    const imageTags = generateImageTags(product.images, product.title, product.category);
    const lastmod = product.lastmod ? formatDate(product.lastmod) : today;
    
    return `
  <url>
    <loc>${baseUrl}/product/${escapeXml(product.handle)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${imageTags}
  </url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticPagesXml}
${productsXml}
</urlset>`;
};

// Get product count for stats
export const getSitemapStats = async (): Promise<{ totalProducts: number; totalPages: number }> => {
  const products = await fetchAllSitemapProducts();
  return {
    totalProducts: products.length,
    totalPages: staticPages.length + products.length,
  };
};
