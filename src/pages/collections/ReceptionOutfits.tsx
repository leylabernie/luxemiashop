import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { ProductGrid } from '@/components/collections/ProductGrid';
import { ProductFilters } from '@/components/collections/ProductFilters';
import { localProducts } from '@/data/localProducts';
import { sareeProducts } from '@/data/sareeProducts';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Helper to convert to Shopify format
const convertToShopifyFormat = (product: typeof localProducts[0] | typeof sareeProducts[0]) => ({
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

const ReceptionOutfits = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Filter for reception outfits from raw data
  const receptionOutfits = useMemo(() => {
    const filterReception = (products: typeof localProducts) => {
      return products.filter(product => {
        const tags = product.tags || [];
        return tags.some(t => 
          t.toLowerCase().includes('reception') || 
          t.toLowerCase().includes('party') || 
          t.toLowerCase().includes('evening') ||
          t.toLowerCase().includes('cocktail')
        );
      });
    };
    
    const lehengas = filterReception(localProducts).map(convertToShopifyFormat);
    const sarees = filterReception(sareeProducts).map(convertToShopifyFormat);
    
    return [...lehengas, ...sarees];
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Reception Outfits | Party Wear Lehengas & Sarees for Wedding Reception - LuxeMia"
        description="Shop glamorous reception outfits at LuxeMia. Find stunning party wear lehengas, cocktail sarees, and evening gowns perfect for wedding receptions and celebrations. Worldwide shipping."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Reception Outfits', url: '/collections' },
        ]}
      />
      <Header />
      
      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Reception Outfits</span>
          </nav>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl lg:text-5xl mb-4">Reception Outfits</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Make a grand entrance at your wedding reception with our collection of glamorous 
              party wear lehengas, stylish sarees, and statement pieces designed to dazzle.
            </p>
          </motion.div>

          {/* SEO Content Block */}
          <div className="prose prose-sm max-w-none mb-12 text-muted-foreground">
            <p>
              The wedding reception is your moment to shine in a different light. While traditional 
              ceremonies call for classic attire, the reception is your opportunity to embrace 
              contemporary glamour. Our reception collection features sequined lehengas that catch 
              every light, stylish sarees with modern drapes, and statement pieces that photograph 
              beautifully. From metallic accents to bold silhouettes, find the perfect outfit to 
              celebrate your new beginning in style.
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
                products={receptionOutfits} 
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

export default ReceptionOutfits;
