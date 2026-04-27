import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import { sortProducts } from '@/lib/productFilters';

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const NEW_ARRIVALS_LIMIT = 24;

const NewArrivals = () => {
  const { products, isLoading } = useShopifyProducts();
  const [sortBy, setSortBy] = useState('newest');

  // Products already come back from Shopify sorted newest-first.
  // Cap at the most recent 24 before applying any custom sort.
  const recentProducts = useMemo(() => products.slice(0, NEW_ARRIVALS_LIMIT), [products]);
  const sortedProducts = useMemo(() => sortProducts(recentProducts, sortBy), [recentProducts, sortBy]);

  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Newest First';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="New Arrivals | LuxeMia — Latest Indian Ethnic Wear"
        description="Shop the latest Indian ethnic wear at LuxeMia. Fresh arrivals in bridal lehengas, designer sarees, salwar kameez and more. New styles added regularly."
        canonical="https://luxemia.shop/new-arrivals"
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">
        {/* Hero Banner */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Just Landed</span>
            </div>
            <h1 className="font-serif text-3xl lg:text-5xl mb-3">New Arrivals</h1>
            <p className="text-muted-foreground font-light max-w-md mx-auto text-sm lg:text-base">
              Discover our latest pieces — made with care, arriving fresh every week.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-border/30 bg-background sticky top-[90px] lg:top-[132px] z-30">
          <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading…' : `${sortedProducts.length} styles`}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-sm font-light">
                  Sort: {currentSort}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map(opt => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={sortBy === opt.value ? 'font-medium' : ''}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Product Grid */}
        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted rounded-sm mb-4" />
                  <div className="h-3 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {sortedProducts.map((product, index) => (
                <ProductCard key={product.node.id} product={product} index={index} />
              ))}
            </motion.div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NewArrivals;
