import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { ProductGrid } from '@/components/collections/ProductGrid';
import { ProductFilters } from '@/components/collections/ProductFilters';
import { localProducts } from '@/data/localProducts';
import { sareeProducts } from '@/data/sareeProducts';
import { suitProducts } from '@/data/suitProducts';
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

const FestiveWear = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Filter for festive wear from raw data
  const festiveWear = useMemo(() => {
    const filterFestive = (products: typeof localProducts) => {
      return products.filter(product => {
        const tags = product.tags || [];
        return tags.some(t => 
          t.toLowerCase().includes('festive') || 
          t.toLowerCase().includes('diwali') || 
          t.toLowerCase().includes('navratri') ||
          t.toLowerCase().includes('haldi') ||
          t.toLowerCase().includes('mehendi') ||
          t.toLowerCase().includes('sangeet') ||
          t.toLowerCase().includes('karwa')
        );
      });
    };
    
    return [
      ...filterFestive(localProducts).map(convertToShopifyFormat),
      ...filterFestive(sareeProducts).map(convertToShopifyFormat),
      ...filterFestive(suitProducts).map(convertToShopifyFormat)
    ];
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Festive Wear Collection | Diwali, Navratri & Karwa Chauth Outfits - LuxeMia"
        description="Shop festive wear for Diwali, Navratri, Karwa Chauth & celebrations at LuxeMia. Discover designer lehengas, sarees & suits for Haldi, Mehendi, Sangeet ceremonies. Free styling consultation."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Festive Wear', url: '/collections/festive-wear' },
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
            <span className="text-foreground">Festive Wear</span>
          </nav>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl lg:text-5xl mb-4">Festive Wear</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Celebrate every occasion in style. From Diwali sparkle to Navratri vibrancy, 
              discover festive outfits that capture the joy of Indian celebrations.
            </p>
          </motion.div>

          {/* SEO Content Block */}
          <div className="prose prose-sm max-w-none mb-12 text-muted-foreground">
            <p>
              Indian festivals are a celebration of color, tradition, and togetherness. Our festive 
              wear collection captures this spirit with vibrant lehengas for Navratri garba nights, 
              elegant sarees for Diwali pujas, and joyful outfits for Haldi and Mehendi ceremonies. 
              Each piece is designed to help you celebrate in comfort and style, whether you're 
              dancing the night away or capturing perfect family photographs. From the playful 
              yellows of Haldi to the auspicious reds of Karwa Chauth, find your festive favorite.
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
                products={festiveWear} 
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

export default FestiveWear;
