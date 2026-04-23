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
import { ChevronRight, Users, Sparkles, Heart } from 'lucide-react';

// Helper to convert to Shopify format
const convertToShopifyFormat = (product: any) => ({
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
      edges: product.images.map((url: string, index: number) => ({
        node: {
          url,
          altText: `${product.title} - Image ${index + 1}`
        }
      }))
    },
    variants: {
      edges: product.variants.map((variant: any) => ({
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
            value: value as string
          }))
        }
      }))
    },
    options: product.options
  }
});

const BridesmaidDresses = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);

  // Filter for bridesmaid-appropriate outfits (lighter lehengas, sarees, suits)
  const bridesmaidProducts = useMemo(() => {
    const allProducts = [...localProducts, ...sareeProducts, ...suitProducts];
    return allProducts
      .filter(product => {
        const tags = product.tags || [];
        const category = product.category?.toLowerCase() || '';
        const title = product.title.toLowerCase();
        
        // Exclude heavy bridal items
        const isHeavyBridal = tags.some(t => t.includes('heavy-work') || t.includes('bridal')) && 
                             !tags.some(t => t.includes('bridesmaid'));
        
        if (isHeavyBridal && !title.includes('bridesmaid')) return false;

        return tags.some(t => 
          t.includes('bridesmaid') || 
          t.includes('party') || 
          t.includes('festive') || 
          t.includes('sangeet') || 
          t.includes('mehendi')
        ) || category.includes('sharara') || category.includes('anarkali');
      })
      .slice(0, 24) // Limit for performance
      .map(convertToShopifyFormat);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Bridesmaid Dresses & Outfits | Indian Wedding Guest Wear - LuxeMia"
        description="Explore our curated collection of bridesmaid dresses and wedding guest outfits. From elegant sarees to trendy shararas and lehengas, find the perfect look for the bridal party. Custom alterations available."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Bridesmaid Dresses', url: '/collections/bridesmaid-dresses' },
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
            <span className="text-foreground">Bridesmaid Dresses</span>
          </nav>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-xs tracking-luxury uppercase text-primary mb-3 inline-block">The Wedding Party</span>
            <h1 className="font-serif text-4xl lg:text-5xl mb-4 text-balance">Bridesmaid Dresses & Outfits</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
              Celebrate your best friend's big day in style. Our curated bridesmaid collection features 
              coordinated ensembles, elegant silhouettes, and a palette of stunning colors designed to 
              complement the bride while making you shine.
            </p>
          </motion.div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="flex flex-col items-center text-center p-6 bg-secondary/30 rounded-sm border border-border/50">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-medium mb-2 uppercase tracking-wide text-sm">Group Orders</h3>
              <p className="text-xs text-muted-foreground">Special discounts and coordinated styling for the entire bridal party.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-secondary/30 rounded-sm border border-border/50">
              <Sparkles className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-medium mb-2 uppercase tracking-wide text-sm">Custom Alterations</h3>
              <p className="text-xs text-muted-foreground">Perfect fit guaranteed with our expert tailoring and custom measurement services.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-secondary/30 rounded-sm border border-border/50">
              <Heart className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-medium mb-2 uppercase tracking-wide text-sm">Styling Assistance</h3>
              <p className="text-xs text-muted-foreground">Personal stylists to help you choose the perfect theme and color palette.</p>
            </div>
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
                products={bridesmaidProducts} 
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

export default BridesmaidDresses;
