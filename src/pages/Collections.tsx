import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { ProductFilters, ActiveFilterTags } from '@/components/collections/ProductFilters';
import { ProductGrid } from '@/components/collections/ProductGrid';
import CollectionDecisionSupport, { CollectionDirectAnswer } from '@/components/collections/CollectionDecisionSupport';
import CatalogLoadError from '@/components/collections/CatalogLoadError';
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
import { FEATURED_CATEGORY_PRODUCT_LIST } from '@/config/featuredCategoryProducts';
import { toCollectionSchemaItems } from '@/lib/collectionSchema';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Selling', value: 'best-selling' },
];

const Collections = () => {
  const { products, isLoading, isLoadingMore, error, hasMore, loadMore } = useShopifyProducts();
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, activeFilters, priceRange, sortBy);
  }, [products, activeFilters, priceRange, sortBy]);
  const collectionItems = toCollectionSchemaItems(filteredProducts);

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
        description="Buy Indian ethnic wear online at LuxeMia. Shop bridal lehengas, sarees, salwar kameez, jewelry, menswear and indo-western outfits."
        canonical="https://luxemia.shop/collections"
        type="collection"
        collection={!isLoading && !error && collectionItems.length > 0
          ? { name: 'All Indian Ethnic Wear Collections', description: 'Current LuxeMia lehengas, sarees, salwar suits, jewelry, menswear and Indo-Western outfits.', items: collectionItems }
          : undefined}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
        ]}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        {/* Hero Banner */}
        <section className="relative flex h-72 items-center justify-center overflow-hidden bg-[#211410] md:h-96">
          <div
            aria-hidden="true"
            className="absolute inset-0 grid grid-cols-3 grid-rows-2 md:grid-cols-6 md:grid-rows-1"
          >
            {FEATURED_CATEGORY_PRODUCT_LIST.map((product) => (
              <picture key={product.handle} className="relative block min-h-0 overflow-hidden">
                <source srcSet={product.imageWebp} type="image/webp" />
                <img
                  src={product.image}
                  alt=""
                  width={900}
                  height={1200}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  decoding="async"
                />
              </picture>
            ))}
          </div>
          <div className="absolute inset-0 bg-black/70 md:bg-black/65" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 px-4 text-center text-white"
          >
            <p className="mb-4 text-sm uppercase tracking-luxury text-[#e4c58e]">
              Explore Our
            </p>
            <h1 className="text-3xl md:text-4xl font-serif mb-4">All Indian Ethnic Wear Collections</h1>
            <CollectionDirectAnswer path="/collections" className="mx-auto max-w-3xl text-sm leading-relaxed text-white/85 md:text-base" />
          </motion.div>
        </section>

        {/* Breadcrumb */}
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Collections</span>
          </nav>
          <div className="mt-6 flex flex-col gap-3 rounded-sm border border-primary/25 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-xl">Need to ask about a custom option?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Review the inquiry process, then verify every available color, measurement, tailoring, and timing detail on the exact listing and in writing.</p>
            </div>
            <Link to="/collections/customizable-indian-outfits" className="shrink-0 text-sm font-medium text-primary underline underline-offset-4">
              Review customization inquiries
            </Link>
          </div>
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
                  {isLoading
                    ? 'Loading current inventory…'
                    : error
                      ? 'Current inventory is temporarily unavailable'
                      : <>Showing <span className="text-foreground font-medium">{filteredProducts.length}</span> products</>}
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
              {error ? (
                <CatalogLoadError retryHref="/collections" />
              ) : isLoading || filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} isLoading={isLoading} />
              ) : null}

              {/* Load More */}
              {hasMore && !isLoading && !error && filteredProducts.length > 0 && (
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
              {!isLoading && !error && filteredProducts.length === 0 && (
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
        </div>
        {!error ? <CollectionDecisionSupport path="/collections" products={filteredProducts} isLoading={isLoading} /> : null}
      </main>

      {/* SEO editorial footer — keyword-rich content for crawlers */}
      <section className="border-t border-border/50 bg-card/20 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <h2 className="font-serif text-xl mb-4 text-center">Buy Indian Ethnic Wear Online</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-3 text-sm leading-relaxed text-center">
            <p>
              LuxeMia is an online Indian ethnic-wear store for shoppers in seven countries. Browse <strong>bridal and party-wear lehengas</strong>, <strong>Banarasi, silk and wedding sarees</strong>, <strong>Anarkali, sharara, gharara and palazzo suits</strong>, groom sherwanis, and Indo-Western outfits.
            </p>
            <p>
              Explore dedicated collections for <Link to="/collections/sharara-suits" className="underline underline-offset-2 hover:text-foreground">sharara suits</Link>, <Link to="/collections/palazzo-suits" className="underline underline-offset-2 hover:text-foreground">palazzo suits</Link>, <Link to="/collections/anarkali-suits" className="underline underline-offset-2 hover:text-foreground">Anarkali suits</Link>, <Link to="/collections/banarasi-sarees" className="underline underline-offset-2 hover:text-foreground">Banarasi sarees</Link>, <Link to="/collections/bridal-lehengas" className="underline underline-offset-2 hover:text-foreground">bridal lehengas</Link>, <Link to="/collections/wedding-guest-lehengas" className="underline underline-offset-2 hover:text-foreground">wedding-guest lehengas</Link>, <Link to="/collections/wedding-guest-kurta-sets" className="underline underline-offset-2 hover:text-foreground">wedding-guest kurta sets</Link>, <Link to="/collections/sherwani-for-groom" className="underline underline-offset-2 hover:text-foreground">groom sherwanis</Link>, <Link to="/collections/diwali-womenswear" className="underline underline-offset-2 hover:text-foreground">Diwali womenswear</Link>, <Link to="/collections/diwali-menswear" className="underline underline-offset-2 hover:text-foreground">Diwali menswear</Link>, <Link to="/collections/navratri-chaniya-choli" className="underline underline-offset-2 hover:text-foreground">Navratri chaniya choli</Link>, <Link to="/collections/groomsmen-outfits" className="underline underline-offset-2 hover:text-foreground">groomsmen outfits</Link>, <Link to="/collections/sangeet-outfits" className="underline underline-offset-2 hover:text-foreground">Sangeet outfits</Link>, and <Link to="/collections/reception-outfits" className="underline underline-offset-2 hover:text-foreground">reception outfits</Link>.
            </p>
            <p>
              Product names can describe a fabric, weave, embroidery style, or regional tradition. Check the exact listing before ordering; LuxeMia does not assume origin, fiber content, handwork, or authenticity when the product information does not support that claim.
            </p>
            <p>
              Compare the available product images, selected options, measurements, current price, and delivery information. LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Review the current destination-specific rates and thresholds on the shipping page; checkout is the final source of truth.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-6 text-xs text-muted-foreground">
            <Link to="/lehengas" className="hover:text-foreground transition-colors underline underline-offset-2">Bridal Lehengas</Link>
            <Link to="/sarees" className="hover:text-foreground transition-colors underline underline-offset-2">Sarees</Link>
            <Link to="/collections/customizable-indian-outfits" className="hover:text-foreground transition-colors underline underline-offset-2">Customizable Indian Outfits</Link>
            <Link to="/suits" className="hover:text-foreground transition-colors underline underline-offset-2">Salwar Kameez</Link>
            <Link to="/menswear" className="hover:text-foreground transition-colors underline underline-offset-2">Men's Sherwanis</Link>
            <Link to="/indowestern" className="hover:text-foreground transition-colors underline underline-offset-2">Indo-Western</Link>
            <Link to="/new-arrivals" className="hover:text-foreground transition-colors underline underline-offset-2">New Arrivals</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Collections;
