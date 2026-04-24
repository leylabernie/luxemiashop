import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { ProductGrid } from '@/components/collections/ProductGrid';
import { ProductFilters } from '@/components/collections/ProductFilters';
import { menswearProducts } from '@/data/menswearProducts';
import { Link } from 'react-router-dom';
import { ChevronRight, Users, Sparkles, ShieldCheck } from 'lucide-react';

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

const GroomsmanOutfits = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);

  // Filter for groomsman-appropriate outfits (kurta pajamas, jodhpuri suits, etc.)
  const groomsmanProducts = useMemo(() => {
    return menswearProducts
      .filter(product => {
        const tags = product.tags || [];
        const category = product.category?.toLowerCase() || '';
        const title = product.title.toLowerCase();
        
        // Exclude heavy groom sherwanis unless specifically tagged for groomsmen
        const isHeavyGroom = tags.some(t => t.includes('groom') && t.includes('sherwani')) && 
                           !tags.some(t => t.includes('groomsman'));
        
        if (isHeavyGroom && !title.includes('groomsman')) return false;

        return tags.some(t => 
          t.includes('groomsman') || 
          t.includes('party') || 
          t.includes('festive') || 
          t.includes('sangeet') || 
          t.includes('mehendi') ||
          t.includes('kurta') ||
          t.includes('jodhpuri')
        ) || category.includes('kurta') || category.includes('jodhpuri');
      })
      .slice(0, 24) // Limit for performance
      .map(convertToShopifyFormat);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Groomsman Outfits & Men's Wedding Guest Wear | Indian Ethnic Wear - LuxeMia"
        description="Discover our curated collection of groomsman outfits and men's wedding guest wear. From elegant kurta pajamas to sophisticated jodhpuri suits and sherwanis. Custom tailoring available for the perfect fit."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Groomsman Outfits', url: '/collections/groomsman-outfits' },
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
            <span className="text-foreground">Groomsman Outfits</span>
          </nav>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-xs tracking-luxury uppercase text-primary mb-3 inline-block">The Wedding Party</span>
            <h1 className="font-serif text-4xl lg:text-5xl mb-4 text-balance">Groomsman Outfits & Men's Guest Wear</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
              Distinguished style for the groom's inner circle. Our groomsman collection features 
              coordinated kurta sets, regal jodhpuri suits, and modern ethnic wear designed for 
              sophistication and comfort throughout the wedding festivities.
            </p>
          </motion.div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="flex flex-col items-center text-center p-6 bg-secondary/30 rounded-sm border border-border/50">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-medium mb-2 uppercase tracking-wide text-sm">Groomsman Packages</h3>
              <p className="text-xs text-muted-foreground">Special group pricing and coordinated color themes for the entire groomsman party.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-secondary/30 rounded-sm border border-border/50">
              <Sparkles className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-medium mb-2 uppercase tracking-wide text-sm">Custom Tailoring</h3>
              <p className="text-xs text-muted-foreground">Ensure a sharp, tailored look with our custom measurement and alteration services.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-secondary/30 rounded-sm border border-border/50">
              <ShieldCheck className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-medium mb-2 uppercase tracking-wide text-sm">Premium Quality</h3>
              <p className="text-xs text-muted-foreground">Handcrafted from the finest silks and fabrics for a look that commands respect.</p>
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
                products={groomsmanProducts} 
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

export default GroomsmanOutfits;
