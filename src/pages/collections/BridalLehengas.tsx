import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { ProductGrid } from '@/components/collections/ProductGrid';
import { ProductFilters } from '@/components/collections/ProductFilters';
import { localProducts } from '@/data/localProducts';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Helper to convert to Shopify format
const convertToShopifyFormat = (product: typeof localProducts[0]) => ({
  node: {
    id: product.id,
    title: product.title,
    description: product.description,
    handle: product.handle,
    productType: product.category,
    priceRange: {
      minVariantPrice: {
        amount: product.price,
        currencyCode: product.currency
      }
    },
    images: {
      edges: product.images.map((url, index) => ({
        node: {
          url,
          altText: `${product.title} - Image ${index + 1}`
        }
      }))
    },
    variants: {
      edges: product.variants.map(variant => ({
        node: {
          id: variant.id,
          title: variant.title,
          price: {
            amount: variant.price,
            currencyCode: product.currency
          },
          availableForSale: true,
          selectedOptions: Object.entries(variant.options).map(([name, value]) => ({
            name,
            value
          }))
        }
      }))
    },
    options: product.options
  }
});

const BridalLehengas = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Filter for bridal lehengas from raw data
  const bridalLehengas = useMemo(() => {
    return localProducts
      .filter(product => {
        const tags = product.tags || [];
        const category = product.category?.toLowerCase() || '';
        return tags.some(t => t.toLowerCase().includes('bridal')) || category.includes('bridal');
      })
      .map(convertToShopifyFormat);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Bridal Lehengas Online | Designer Wedding Lehenga Choli, Heavy Work Bridal Wear - LuxeMia"
        description="Shop stunning bridal lehengas online at LuxeMia. Explore designer wedding lehenga choli, heavy embroidery bridal lehengas, silk & velvet bridal wear. Custom sizing available. Worldwide delivery."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Bridal Lehengas', url: '/collections/bridal-lehengas' },
        ]}
      />
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Bridal Lehengas</span>
          </nav>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl lg:text-5xl mb-4">Bridal Lehengas</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your dream bridal lehenga awaits. Discover our exquisite collection of handcrafted 
              bridal lehengas featuring heavy embroidery, luxurious fabrics, and timeless designs.
            </p>
          </motion.div>

          {/* SEO Content Block */}
          <div className="prose prose-sm max-w-none mb-12 text-muted-foreground">
            <p>
              Every bride deserves to feel like royalty on her wedding day. Our bridal lehenga collection 
              brings together the finest craftsmanship from India's master artisans—from the intricate 
              zardozi work of Lucknow to the rich silk weaving traditions of Benares. Each bridal lehenga 
              is a labor of love, taking hundreds of hours to create. Whether you envision yourself in 
              classic bridal red, romantic pastels, or contemporary metallics, find your perfect match at LuxeMia.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <ProductFilters
                activeFilters={activeFilters}
                onFilterChange={setActiveFilters}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
              />
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <ProductGrid 
                products={bridalLehengas} 
                isLoading={false}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BridalLehengas;
