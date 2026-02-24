import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { ProductGrid } from '@/components/collections/ProductGrid';
import { ProductFilters } from '@/components/collections/ProductFilters';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const WeddingSarees = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const { products: weddingSarees, isLoading } = useShopifyProducts('sarees');

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Wedding Sarees Online | Bridal Silk Sarees, Banarasi & Designer Wedding Sarees - LuxeMia"
        description="Shop exquisite wedding sarees online at LuxeMia. Discover handcrafted bridal silk sarees, Banarasi wedding sarees, Kanjeevaram, and designer sarees for your special day. Worldwide shipping."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Wedding Sarees', url: '/collections/wedding-sarees' },
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
            <span className="text-foreground">Wedding Sarees</span>
          </nav>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl lg:text-5xl mb-4">Wedding Sarees</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our curated collection of wedding sarees, featuring exquisite Banarasi silks, 
              Kanjeevaram masterpieces, and designer bridal sarees perfect for your special day.
            </p>
          </motion.div>

          {/* SEO Content Block */}
          <div className="prose prose-sm max-w-none mb-12 text-muted-foreground">
            <p>
              A wedding saree is more than just attire—it's a symbol of tradition, elegance, and new beginnings. 
              At LuxeMia, we curate the finest wedding sarees that honor centuries-old craftsmanship while 
              embracing contemporary aesthetics. From the rich brocades of Banarasi silk to the lustrous drapes 
              of Kanjeevaram, each piece in our collection tells a story of artisanal excellence.
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
                products={weddingSarees} 
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WeddingSarees;
