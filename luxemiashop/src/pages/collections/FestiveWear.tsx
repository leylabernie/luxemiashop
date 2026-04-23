import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { ProductGrid } from '@/components/collections/ProductGrid';
import { ProductFilters } from '@/components/collections/ProductFilters';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { applyProductFilters } from '@/lib/productFilters';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const FESTIVE_KEYWORDS = [
  'festive', 'diwali', 'navratri', 'haldi', 'mehendi', 'sangeet',
  'karwa', 'eid', 'garba', 'dandiya', 'puja', 'celebration',
];

const FestiveWear = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);

  const { products: allProducts, isLoading } = useShopifyProducts();

  // First try: filter by festive tags. Fallback: all non-menswear products
  const festiveProducts = useMemo(() => {
    const byTag = allProducts.filter(p => {
      const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
      const title = (p.node.title ?? '').toLowerCase();
      const description = (p.node.description ?? '').toLowerCase();
      return FESTIVE_KEYWORDS.some(kw =>
        tags.some(t => t.includes(kw)) || title.includes(kw) || description.includes(kw)
      );
    });

    // If Shopify doesn't have festive-tagged products, fall back to suits + lehengas
    // (traditionally the most popular festive wear categories)
    if (byTag.length < 8) {
      const menswearTypes = ["men's ethnic wear", 'kurta pajama', 'sherwani', "men's indian wear", 'modi jacket'];
      return allProducts.filter(p => {
        const pt = (p.node.productType ?? '').toLowerCase();
        return !menswearTypes.some(m => pt.includes(m));
      });
    }

    return byTag;
  }, [allProducts]);

  const filteredProducts = useMemo(() =>
    applyProductFilters(festiveProducts, activeFilters, priceRange),
    [festiveProducts, activeFilters, priceRange]
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Festive Wear Collection | Diwali, Navratri & Karwa Chauth Outfits - LuxeMia"
        description="Shop festive wear for Diwali, Navratri, Karwa Chauth & celebrations at LuxeMia. Discover designer lehengas, sarees & suits for Haldi, Mehendi, Sangeet ceremonies. Free styling consultation."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Festive Wear', url: '/collections' },
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
              {!isLoading && (
                <p className="text-sm text-muted-foreground mb-4">
                  {filteredProducts.length} styles
                </p>
              )}
              <ProductGrid
                products={filteredProducts}
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

export default FestiveWear;
