import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';
import { fetchAllSitemapProducts, staticPages, generateXmlSitemap } from '@/lib/dynamicSitemap';

interface SitemapProduct {
  handle: string;
  title: string;
  category: string;
  images: string[];
  lastmod?: string;
}

const Sitemap = () => {
  const [products, setProducts] = useState<SitemapProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://luxemia.com';
  const currentDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await fetchAllSitemapProducts();
        setProducts(allProducts);
      } catch (error) {
        console.error('Error loading sitemap products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Group pages by category for display
  const pageCategories = {
    'Main Pages': staticPages.filter(p => ['/', '/collections', '/brand-story'].includes(p.loc)),
    'Shop Categories': staticPages.filter(p => ['/lehengas', '/sarees', '/suits', '/menswear', '/new-arrivals'].includes(p.loc)),
    'Collections': staticPages.filter(p => p.loc.startsWith('/collections/')),
    'Customer Service': staticPages.filter(p => ['/contact', '/faq', '/shipping', '/returns', '/size-guide', '/care-guide'].includes(p.loc)),
    'About Us': staticPages.filter(p => ['/artisans', '/sustainability', '/virtual-tryon'].includes(p.loc)),
    'Legal': staticPages.filter(p => ['/privacy', '/terms'].includes(p.loc)),
  };

  // Group products by category
  const productsByCategory = {
    'Bridal Lehengas': products.filter(p => p.category.toLowerCase().includes('bridal')),
    'Wedding Lehengas': products.filter(p => p.category.toLowerCase().includes('wedding') && !p.category.toLowerCase().includes('saree')),
    'Party Lehengas': products.filter(p => p.category.toLowerCase().includes('party') && p.category.toLowerCase().includes('lehenga')),
    'Sarees': products.filter(p => p.category.toLowerCase().includes('saree')),
    'Suits': products.filter(p => p.category.toLowerCase().includes('suit') || p.category === 'suits'),
    'Menswear': products.filter(p => p.category.toLowerCase().includes('menswear') || p.category.toLowerCase().includes('kurta')),
    'Other': products.filter(p => {
      const cat = p.category.toLowerCase();
      return !cat.includes('bridal') && 
             !cat.includes('wedding') && 
             !cat.includes('party') && 
             !cat.includes('saree') && 
             !cat.includes('suit') && 
             !cat.includes('menswear') &&
             !cat.includes('kurta');
    }),
  };

  // Filter out empty categories
  const filteredCategories = Object.entries(productsByCategory)
    .filter(([, items]) => items.length > 0);

  // Handle XML download
  const handleDownloadXml = async () => {
    const xml = await generateXmlSitemap(baseUrl);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Sitemap | LuxeMia - All Pages & Products"
        description="Browse all pages and products on LuxeMia. Find designer sarees, bridal lehengas, suits, and menswear collections with easy navigation."
        noIndex={true}
      />
      <Header />
      
      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <h1 className="font-serif text-4xl lg:text-5xl mb-4 text-center">Sitemap</h1>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Browse all pages and products on LuxeMia. Use this page to find what you're looking for quickly.
          </p>

          {/* XML Sitemap Download */}
          <div className="bg-secondary/30 rounded-lg p-6 mb-12 text-center">
            <h2 className="font-serif text-lg mb-2">XML Sitemap for Search Engines</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Search engines can use our XML sitemap to discover and index all pages, including product images.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a 
                href="/sitemap.xml" 
                className="inline-block px-6 py-2 bg-foreground text-background text-sm hover:bg-foreground/90 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Static Sitemap
              </a>
              <button 
                onClick={handleDownloadXml}
                className="inline-block px-6 py-2 bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
              >
                Download Dynamic Sitemap (with Images)
              </button>
            </div>
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
                      <li key={page.loc}>
                        <Link 
                          to={page.loc}
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
              Products {!loading && `(${products.length} items)`}
            </h2>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading products...</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {filteredCategories.map(([category, categoryProducts]) => (
                  <div key={category} className="bg-card rounded-lg p-6 border border-border/50">
                    <h3 className="font-serif text-lg mb-4">
                      {category} <span className="text-muted-foreground text-sm font-normal">({categoryProducts.length})</span>
                    </h3>
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                      {categoryProducts.map(product => (
                        <li key={product.handle} className="flex items-center gap-2">
                          {product.images?.[0] && (
                            <img 
                              src={product.images[0]} 
                              alt="" 
                              className="w-8 h-8 object-cover rounded"
                              loading="lazy"
                            />
                          )}
                          <Link 
                            to={`/product/${product.handle}`}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors line-clamp-1 flex-1"
                          >
                            {product.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              Total Pages: {staticPages.length} | Total Products: {products.length} | 
              Last Updated: {currentDate}
            </p>
            <p className="mt-2 text-xs">
              ✓ Enhanced with image sitemaps for Google Image Search
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Sitemap;
