import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';
import { localProducts } from '@/data/localProducts';
import { sareeProducts } from '@/data/sareeProducts';
import { menswearProducts } from '@/data/menswearProducts';
import { suitProducts } from '@/data/suitProducts';

// Static pages configuration
const staticPages = [
  { url: '/', title: 'Home', priority: 1.0, changefreq: 'daily' },
  { url: '/collections', title: 'All Collections', priority: 0.9, changefreq: 'daily' },
  { url: '/lehengas', title: 'Lehengas', priority: 0.9, changefreq: 'daily' },
  { url: '/sarees', title: 'Sarees', priority: 0.9, changefreq: 'daily' },
  { url: '/suits', title: 'Suits', priority: 0.9, changefreq: 'daily' },
  { url: '/menswear', title: 'Menswear', priority: 0.9, changefreq: 'daily' },
  { url: '/collections/wedding-sarees', title: 'Wedding Sarees', priority: 0.8, changefreq: 'weekly' },
  { url: '/collections/bridal-lehengas', title: 'Bridal Lehengas', priority: 0.8, changefreq: 'weekly' },
  { url: '/collections/reception-outfits', title: 'Reception Outfits', priority: 0.8, changefreq: 'weekly' },
  { url: '/collections/festive-wear', title: 'Festive Wear', priority: 0.8, changefreq: 'weekly' },
  { url: '/new-arrivals', title: 'New Arrivals', priority: 0.8, changefreq: 'daily' },
  { url: '/lookbook', title: 'Lookbook', priority: 0.7, changefreq: 'weekly' },
  { url: '/brand-story', title: 'Our Story', priority: 0.6, changefreq: 'monthly' },
  { url: '/artisans', title: 'Artisans', priority: 0.6, changefreq: 'monthly' },
  { url: '/sustainability', title: 'Sustainability', priority: 0.6, changefreq: 'monthly' },
  { url: '/virtual-tryon', title: 'Virtual Try-On', priority: 0.7, changefreq: 'monthly' },
  { url: '/size-guide', title: 'Size Guide', priority: 0.5, changefreq: 'monthly' },
  { url: '/care-guide', title: 'Care Guide', priority: 0.5, changefreq: 'monthly' },
  { url: '/contact', title: 'Contact Us', priority: 0.5, changefreq: 'monthly' },
  { url: '/faq', title: 'FAQ', priority: 0.5, changefreq: 'monthly' },
  { url: '/shipping', title: 'Shipping Info', priority: 0.4, changefreq: 'monthly' },
  { url: '/returns', title: 'Returns & Exchanges', priority: 0.4, changefreq: 'monthly' },
  { url: '/privacy', title: 'Privacy Policy', priority: 0.3, changefreq: 'yearly' },
  { url: '/terms', title: 'Terms of Service', priority: 0.3, changefreq: 'yearly' },
];

// Generate product URLs from all product data
const getAllProducts = () => {
  const allProducts = [
    ...localProducts.map(p => ({ handle: p.handle, title: p.title, category: 'Lehengas' })),
    ...sareeProducts.map(p => ({ handle: p.handle, title: p.title, category: 'Sarees' })),
    ...menswearProducts.map(p => ({ handle: p.handle, title: p.title, category: 'Menswear' })),
    ...suitProducts.map(p => ({ handle: p.handle, title: p.title, category: 'Suits' })),
  ];
  return allProducts;
};

const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState<string>('');
  const products = getAllProducts();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://luxemia.com';
  const currentDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Generate XML sitemap content
    const xml = generateXmlSitemap(baseUrl, currentDate, products);
    setXmlContent(xml);
  }, [baseUrl, currentDate, products]);

  // Group pages by category for display
  const pageCategories = {
    'Main Pages': staticPages.filter(p => ['/', '/collections', '/lookbook', '/brand-story'].includes(p.url)),
    'Shop Categories': staticPages.filter(p => ['/lehengas', '/sarees', '/suits', '/menswear', '/new-arrivals'].includes(p.url)),
    'Collections': staticPages.filter(p => p.url.startsWith('/collections/')),
    'Customer Service': staticPages.filter(p => ['/contact', '/faq', '/shipping', '/returns', '/size-guide', '/care-guide'].includes(p.url)),
    'About Us': staticPages.filter(p => ['/artisans', '/sustainability', '/virtual-tryon'].includes(p.url)),
    'Legal': staticPages.filter(p => ['/privacy', '/terms'].includes(p.url)),
  };

  // Group products by category
  const productsByCategory = {
    'Lehengas': products.filter(p => p.category === 'Lehengas'),
    'Sarees': products.filter(p => p.category === 'Sarees'),
    'Menswear': products.filter(p => p.category === 'Menswear'),
    'Suits': products.filter(p => p.category === 'Suits'),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Sitemap | LuxeMia - All Pages & Products"
        description="Browse all pages and products on LuxeMia. Find designer sarees, bridal lehengas, suits, and menswear collections with easy navigation."
        noIndex={true}
      />
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <h1 className="font-serif text-4xl lg:text-5xl mb-4 text-center">Sitemap</h1>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Browse all pages and products on LuxeMia. Use this page to find what you're looking for quickly.
          </p>

          {/* XML Sitemap Download */}
          <div className="bg-secondary/30 rounded-lg p-6 mb-12 text-center">
            <h2 className="font-serif text-lg mb-2">XML Sitemap for Search Engines</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Search engines can use our XML sitemap to discover and index all pages.
            </p>
            <a 
              href="/sitemap.xml" 
              className="inline-block px-6 py-2 bg-foreground text-background text-sm hover:bg-foreground/90 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              View XML Sitemap
            </a>
          </div>

          {/* Pages Section */}
          <section className="mb-16">
            <h2 className="font-serif text-2xl mb-8 border-b border-border pb-4">Pages</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(pageCategories).map(([category, pages]) => (
                <div key={category}>
                  <h3 className="font-medium text-sm uppercase tracking-wide mb-4 text-muted-foreground">
                    {category}
                  </h3>
                  <ul className="space-y-2">
                    {pages.map(page => (
                      <li key={page.url}>
                        <Link 
                          to={page.url}
                          className="text-foreground hover:text-primary transition-colors"
                        >
                          {page.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Products Section */}
          <section>
            <h2 className="font-serif text-2xl mb-8 border-b border-border pb-4">
              Products ({products.length} items)
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                <div key={category} className="bg-card rounded-lg p-6 border border-border/50">
                  <h3 className="font-serif text-lg mb-4">
                    {category} <span className="text-muted-foreground text-sm font-normal">({categoryProducts.length})</span>
                  </h3>
                  <ul className="space-y-2 max-h-64 overflow-y-auto">
                    {categoryProducts.map(product => (
                      <li key={product.handle}>
                        <Link 
                          to={`/product/${product.handle}`}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors line-clamp-1"
                        >
                          {product.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              Total Pages: {staticPages.length} | Total Products: {products.length} | 
              Last Updated: {currentDate}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Helper function to generate XML sitemap content
const generateXmlSitemap = (
  baseUrl: string, 
  currentDate: string, 
  products: Array<{ handle: string; title: string; category: string }>
) => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Add static pages
  staticPages.forEach(page => {
    xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  // Add product pages
  products.forEach(product => {
    xml += `  <url>
    <loc>${baseUrl}/product/${product.handle}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });

  xml += `</urlset>`;
  return xml;
};

export default Sitemap;
