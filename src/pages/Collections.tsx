import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { ProductFilters, ActiveFilterTags } from '@/components/collections/ProductFilters';
import { ProductGrid } from '@/components/collections/ProductGrid';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { filterAndSortProducts } from '@/lib/productFilters';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Selling', value: 'best-selling' },
];

const Collections = () => {
  const { products, isLoading, isLoadingMore, hasMore, loadMore } = useShopifyProducts();
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [collectionSlug, setCollectionSlug] = useState('');

  useEffect(() => {
    const slug = window.location.pathname.replace('/collections/', '');
    setCollectionSlug(slug);
  }, []);

  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, activeFilters, priceRange, sortBy);
  }, [products, activeFilters, priceRange, sortBy]);

  const handleFilterChange = (filters: Record<string, string[]>) => {
    setActiveFilters(filters);
  };

  const handleRemoveFilter = (section: string, option: string) => {
    const currentOptions = activeFilters[section] || [];
    handleFilterChange({
      ...activeFilters,
      [section]: currentOptions.filter((o) => o !== option),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Buy Indian Ethnic Wear Online | All Collections - LuxeMia"
        description="Buy Indian ethnic wear online at LuxeMia. Shop our complete collection of bridal lehengas, sarees, salwar kameez, jewelry, menswear & indo-western outfits. Free worldwide shipping."
        canonical="https://luxemia.shop/collections"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
        ]}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        {/* Hero Banner */}
        <section className="relative h-64 md:h-80 flex items-center justify-center bg-gradient-to-b from-secondary to-background overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center px-4"
          >
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">
              Explore Our
            </p>
            <h1 className="text-3xl md:text-4xl font-serif mb-4">All Indian Ethnic Wear Collections</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Shop bridal lehengas, silk sarees, salwar kameez, sherwanis, and Indo-Western outfits — sourced directly from India's textile hubs. Free shipping to USA, Canada & Australia on orders over $350.
            </p>
          </motion.div>
        </section>

        {/* Breadcrumb */}
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Collections</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <div className="hidden lg:block">
              <ProductFilters
                onFilterChange={handleFilterChange}
                activeFilters={activeFilters}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
              />
            </div>

            {/* Products Area */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="text-foreground font-medium">{filteredProducts.length}</span> products
                </p>

                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <ProductFilters
                          onFilterChange={handleFilterChange}
                          activeFilters={activeFilters}
                          priceRange={priceRange}
                          onPriceChange={setPriceRange}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Sort by: {sortOptions.find((o) => o.value === sortBy)?.label}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-popover">
                      {sortOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => setSortBy(option.value)}
                          className={sortBy === option.value ? 'bg-secondary' : ''}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Active Filter Tags */}
              <ActiveFilterTags filters={activeFilters} onRemove={handleRemoveFilter} />

              {/* Product Grid */}
              <ProductGrid products={filteredProducts} isLoading={isLoading} />

              {/* Load More */}
              {hasMore && !isLoading && filteredProducts.length > 0 && (
                <div className="flex justify-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Products'
                    )}
                  </Button>
                </div>
              )}

              {/* Empty state */}
              {!isLoading && filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveFilters({});
                      setPriceRange([0, 100000]);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
          {/* NOTE: /collections/sharara-suits and /collections/gharara-suits
              301-redirect to /suits in the middleware. Sharara/gharara content
              lives in the /suits page (categoryConfig editorialContent + FAQs). */}
        </div>
      </main>

      {/* SEO editorial footer — keyword-rich content for crawlers */}
      <section className="border-t border-border/50 bg-card/20 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <h2 className="font-serif text-xl mb-4 text-center">Buy Authentic Indian Ethnic Wear Online</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-3 text-sm leading-relaxed text-center">
            <p>
              LuxeMia is your destination for <strong>authentic Indian ethnic wear</strong> delivered to the USA, Canada, and Australia. Our complete collection covers every style and occasion — from <strong>bridal lehengas and wedding sarees</strong> to <strong>salwar kameez suits, sherwanis, and Indo-Western fusion outfits</strong>. Every piece is quality-inspected before dispatch.
            </p>
            <p>
              We source directly from India's most celebrated textile regions: <strong>Banarasi silk sarees</strong> from Varanasi, <strong>Kanchipuram silk sarees</strong> from Tamil Nadu, <strong>zardozi embroidered lehengas</strong> from Lucknow, and <strong>gota patti suits</strong> from Jaipur. This direct sourcing means you get genuine craftsmanship at prices far below what Indian boutiques charge in North America.
            </p>
            <p>
              Popular categories include <strong>bridal lehenga choli</strong> for weddings, <strong>party wear sarees</strong> for festive events, <strong>Anarkali suits</strong> for formal occasions, <strong>sharara sets</strong> for sangeet nights, and <strong>kurta pajama sets</strong> for men. Enjoy <strong>free shipping on orders over $350</strong> to the USA, Canada, and Australia.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-6 text-xs text-muted-foreground">
            <Link to="/lehengas" className="hover:text-foreground transition-colors underline underline-offset-2">Bridal Lehengas</Link>
            <Link to="/sarees" className="hover:text-foreground transition-colors underline underline-offset-2">Designer Sarees</Link>
            <Link to="/suits" className="hover:text-foreground transition-colors underline underline-offset-2">Salwar Kameez</Link>
            <Link to="/menswear" className="hover:text-foreground transition-colors underline underline-offset-2">Men's Sherwanis</Link>
            <Link to="/indowestern" className="hover:text-foreground transition-colors underline underline-offset-2">Indo-Western</Link>
            <Link to="/new-arrivals" className="hover:text-foreground transition-colors underline underline-offset-2">New Arrivals</Link>
            <Link to="/bestsellers" className="hover:text-foreground transition-colors underline underline-offset-2">Bestsellers</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Collections;
