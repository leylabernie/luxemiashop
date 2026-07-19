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
          {/* Collection SEO Content — semantic text for crawlers */}
          {collectionSlug === 'sharara-suits' && (
            <section className="container mx-auto px-4 lg:px-8 max-w-5xl py-12 border-t border-border/50">
              <h2 className="font-serif text-2xl mb-4 text-center">Sharara Suits: The Statement Silhouette for Every Celebration</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
                <p>Sharara suits have emerged as one of the most sought-after ethnic wear styles for South Asian women worldwide, combining the drama of a flared lehenga with the comfort of a traditional salwar kameez. Originating from the Mughal-era courts of Awadh, the sharara features wide, floor-grazing pants that create a striking silhouette — paired with a fitted kurta and dupatta for a complete, regal look. At LuxeMia, our curated collection of sharara suits spans embroidered georgette sets for festive occasions, sequined net shararas for sangeet nights, and understated cotton sharara suits for casual elegance. Each piece is fully stitched and ready to wear, shipped internationally to the USA, Canada, UK, Australia, and the UAE.</p>
                <h3>Sharara vs. Gharara: What's the Difference?</h3>
                <p><strong>Q: How do I tell a sharara apart from a gharara?</strong><br />The key difference lies in the construction. A <strong>sharara</strong> has wide, flared pants that are cut like a skirt from the waist down — the fabric flows continuously from the hip to the hem, creating a dramatic A-line flare. A <strong>gharara</strong>, by contrast, features pants that are fitted from the knee up and flared from the knee down, with the flare often gathered or pleated at the knee joint using a traditional gota or fabric fold. Visually, a gharara has a more structured, bell-like shape at the bottom, while a sharara flows more like a maxi skirt.</p>
                <p><strong>Q: Can I wear a sharara suit to a wedding?</strong><br />Absolutely. Sharara suits are now one of the most popular choices for wedding guests, mehendi ceremonies, and sangeet nights. For bridal events, look for heavily embroidered or sequined sharara sets in richer fabrics like silk, georgette, or velvet.</p>
              </div>
            </section>
          )}
          {collectionSlug === 'gharara-suits' && (
            <section className="container mx-auto px-4 lg:px-8 max-w-5xl py-12 border-t border-border/50">
              <h2 className="font-serif text-2xl mb-4 text-center">Gharara Suits: Timeless Elegance with a Royal Heritage</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
                <p>Gharara suits represent the pinnacle of Lucknowi craftsmanship, tracing their origins to the nawabi courts of Awadh where they were worn as a symbol of aristocratic refinement. The defining feature of a gharara is its unique knee-length flare — unlike a sharara's continuous flow from the waist, the gharara's pants are fitted through the thigh and flare dramatically from the knee, often with intricate gota-patti or zari work at the joint. This construction gives the gharara its distinctive bell silhouette that moves beautifully when you walk. LuxeMia's gharara suit collection features hand-embroidered designs, ready-to-wear stitching, and fabrics ranging from lightweight georgette to rich silk — all available for international delivery across 50+ countries.</p>
                <h3>Sharara vs. Gharara: Which One Should You Choose?</h3>
                <p><strong>Q: Is a gharara more traditional than a sharara?</strong><br />Both have Mughal-era origins, but the gharara is more closely associated with Lucknow's chikankari and gota-patti traditions, making it feel slightly more rooted in North Indian wedding culture. The sharara, with its simpler construction, has become more versatile for contemporary fusion looks. If you're attending a traditional wedding, a gharara in silk or velvet with zari work is an elegant choice. For a modern sangeet or reception, a sequined sharara suit may feel more current.</p>
                <p><strong>Q: Do gharara suits come unstitched?</strong><br />At LuxeMia, all our gharara suits are fully stitched and ready to wear. We offer standard sizing as well as custom measurements to ensure the perfect fit. Refer to our <a href="/sizing-measurements-guide" className="text-foreground underline">Indian to US size conversion guide</a> for detailed measurements.</p>
              </div>
            </section>
          )}
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
