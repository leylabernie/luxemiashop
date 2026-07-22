/**
 * CategoryListing — shared listing component for all category pages.
 *
 * Replaces the previous per-page implementations (Lehengas.tsx, Sarees.tsx,
 * Suits.tsx, Menswear.tsx) which were 250-500 lines of copy-pasted code.
 *
 * Layout (Kalki-style):
 *   ┌─────────────────────────────────────────────────────┐
 *   │ Hero Banner (image + title + subtitle)              │
 *   ├─────────────────────────────────────────────────────┤
 *   │ Breadcrumbs: Home / Collections / <Category>        │
 *   ├─────────────────────────────────────────────────────┤
 *   │ Subcategory Chips (horizontal pill nav, ?sub=)      │
 *   ├──────────┬──────────────────────────────────────────┤
 *   │ Sidebar  │ Toolbar: "Showing N products" | Sort      │
 *   │ Filters  │ Active Filter Tags (chips)               │
 *   │          │ ─────────────────────────────────────    │
 *   │ - Price  │ Product Grid (2/3/4 cols responsive)     │
 *   │ - Color  │                                         │
 *   │ - Fabric │ Load More button (real, client-side)     │
 *   │ - Work   │                                         │
 *   │ - Size   │ ─────────────────────────────────────    │
 *   │ - Avail. │ Empty state if no matches                │
 *   ├──────────┴──────────────────────────────────────────┤
 *   │ FAQ section (SEO + rich snippets)                  │
 *   └─────────────────────────────────────────────────────┘
 *
 * URL state (via useListingFilters hook):
 *   /lehengas?sub=bridal&color=red,pink&fabric=silk&price=0-500&sort=price-asc
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { useShopifyPaginatedProducts } from '@/hooks/useShopifyProducts';
import { useListingFilters } from '@/hooks/useListingFilters';
import { filterSortAndSubcategorize } from '@/lib/productFilters';
import { getOptimizedImage } from '@/lib/imageUtils';
import ProductCard from '@/components/ui/ProductCard';
import { FilterSidebar, ActiveFilterTags } from './FilterSidebar';
import type { CategoryConfig } from '@/config/categoryConfig';

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

// Number of products to render per "page" — Load More button reveals more.
const PRODUCTS_PER_PAGE = 24;

interface CategoryListingProps {
  config: CategoryConfig;
}

export function CategoryListing({ config }: CategoryListingProps) {
  // Fetch products from Shopify Storefront API (via the shared hook).
  // Note: useShopifyPaginatedProducts is currently stubbed (returns all
  // products in one fetch) — the "Load More" button below does real
  // client-side slicing of the already-fetched list.
  const { products, isLoading } = useShopifyPaginatedProducts(config.slug);

  // URL-persistent filter state
  const {
    state,
    setSubcategory,
    toggleFilter,
    removeFilter,
    setPriceRange,
    setSortBy,
    clearAll,
    activeFilterCount,
    activeSubcategory,
  } = useListingFilters(config);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  // Apply filters + subcategory + sort
  const filteredProducts = useMemo(() => {
    return filterSortAndSubcategorize(
      products,
      state.filters,
      state.priceRange,
      state.sortBy,
      config.filters,
      activeSubcategory
    );
  }, [products, state, config, activeSubcategory]);

  // Reset visible count when filters change (so user doesn't have to scroll
  // past stale "loaded more" content)
  useMemo(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [state.filters, state.priceRange, state.sortBy, state.subcategory]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // Build section label lookup for ActiveFilterTags
  const sectionLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of config.filters) {
      map[s.name] = s.name;
    }
    map['Price'] = 'Price';
    return map;
  }, [config]);

  // Build collection schema items for SEOHead
  const collectionItems = filteredProducts.slice(0, 30).map(p => ({
    id: p.node.id,
    name: p.node.title,
    url: p.node.handle,
    image: p.node.images.edges[0]?.node.url || '',
    price: p.node.priceRange.minVariantPrice.amount,
    currency: p.node.priceRange.minVariantPrice.currencyCode,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={activeSubcategory?.seoTitle || config.seoTitle}
        description={activeSubcategory?.seoDescription || config.seoDescription}
        canonical={activeSubcategory?.seoCanonical || config.canonical}
        type="collection"
        image={config.ogImage}
        breadcrumbs={config.breadcrumbs}
        collection={{
          name: activeSubcategory ? `${config.heroTitle} — ${activeSubcategory.label}` : config.heroTitle,
          description: activeSubcategory?.seoDescription || config.seoDescription,
          items: collectionItems,
        }}
        faqs={config.faqs}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        {/* Hero Banner — hidden when a subcategory is active (no occasion-specific banners) */}
        {!activeSubcategory && (
        <section className="relative h-64 md:h-96 flex items-center justify-center overflow-hidden">
          <picture className="absolute inset-0 w-full h-full">
            {config.heroImageWebp && (
              <source srcSet={config.heroImageWebp} type="image/webp" />
            )}
            <img
              src={getOptimizedImage(config.heroImage, 'hero')}
              alt={config.name}
              width={1200}
              height={600}
              className="absolute inset-0 w-full h-full object-cover object-top"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center px-4 text-white"
          >
            <p className="text-sm tracking-luxury uppercase text-white/70 mb-4">
              Explore Our
            </p>
            <h1 className="text-3xl md:text-4xl font-serif mb-4">{config.heroTitle}</h1>
            <p className="text-white/80 max-w-lg mx-auto">
              {config.heroSubtitle}
            </p>
          </motion.div>
        </section>
        )}

        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            {config.breadcrumbs.map((crumb, i) => (
              <span key={crumb.url} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                {i === config.breadcrumbs.length - 1 ? (
                  <span className="text-foreground">{crumb.name}</span>
                ) : (
                  <Link to={crumb.url} className="hover:text-foreground transition-colors">
                    {crumb.name}
                  </Link>
                )}
              </span>
            ))}
            {activeSubcategory && (
              <>
                <span>/</span>
                <span className="text-foreground">{activeSubcategory.label}</span>
              </>
            )}
          </nav>
          {/* When a subcategory is active, the hero banner is hidden — render an
              h1 here so the page still has a single H1 for SEO. Hero banner
              already has the H1 when no sub is active. */}
          {activeSubcategory && (
            <h1 className="text-3xl md:text-4xl font-serif mt-4 mb-2">
              {activeSubcategory.label} {config.name}
            </h1>
          )}
          {activeSubcategory?.seoDescription && (
            <p className="text-sm text-muted-foreground max-w-2xl mb-2">
              {activeSubcategory.seoDescription}
            </p>
          )}
        </div>

        {/* Subcategory chips removed — moved to left sidebar FilterSidebar */}

        {/* Main Content: Sidebar + Grid */}
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <FilterSidebar
                config={config}
                activeFilters={state.filters}
                priceRange={state.priceRange}
                onToggleFilter={toggleFilter}
                onPriceChange={setPriceRange}
                onClearAll={clearAll}
                activeFilterCount={activeFilterCount}
                activeSubSlug={state.subcategory}
              />
            </div>

            {/* Products Area */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  Showing{' '}
                  <span className="text-foreground font-medium">
                    {visibleProducts.length}
                  </span>
                  {filteredProducts.length !== visibleProducts.length && (
                    <> of <span className="text-foreground font-medium">{filteredProducts.length}</span></>
                  )}{' '}
                  products
                  {activeSubcategory && (
                    <span className="text-muted-foreground/70"> in {activeSubcategory.label}</span>
                  )}
                </p>

                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                        {activeFilterCount > 0 && (
                          <span className="ml-1.5 bg-foreground text-background rounded-full px-1.5 py-0.5 text-[10px]">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterSidebar
                          config={config}
                          activeFilters={state.filters}
                          priceRange={state.priceRange}
                          onToggleFilter={toggleFilter}
                          onPriceChange={setPriceRange}
                          onClearAll={clearAll}
                          activeFilterCount={activeFilterCount}
                          activeSubSlug={state.subcategory}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Sort by: {SORT_OPTIONS.find(o => o.value === state.sortBy)?.label}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-popover">
                      {SORT_OPTIONS.map(option => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => setSortBy(option.value)}
                          className={state.sortBy === option.value ? 'bg-secondary' : ''}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Active Filter Tags */}
              <ActiveFilterTags
                filters={state.filters}
                onRemove={removeFilter}
                sectionLabels={sectionLabels}
              />

              {/* Active subcategory indicator + clear chip */}
              {activeSubcategory && (
                <div className="mb-4 flex items-center gap-2">
                  <button
                    onClick={() => setSubcategory(null)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-foreground text-background"
                  >
                    {activeSubcategory.label}
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Product Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-secondary mb-2 sm:mb-3" />
                      <div className="h-2 sm:h-3 bg-secondary rounded w-1/3 mb-1 sm:mb-2" />
                      <div className="h-3 sm:h-4 bg-secondary rounded w-2/3 mb-1 sm:mb-2" />
                      <div className="h-3 sm:h-4 bg-secondary rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : visibleProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                    {visibleProducts.map((product, index) => (
                      <ProductCard
                        key={product.node.id}
                        product={product}
                        index={index % 24}
                        showQuickAdd={true}
                      />
                    ))}
                  </div>

                  {/* Load More (real — client-side slice) */}
                  {hasMore && (
                    <div className="text-center mt-10">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setVisibleCount(prev => prev + PRODUCTS_PER_PAGE)}
                      >
                        Load More ({filteredProducts.length - visibleCount} remaining)
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                /* Empty State */
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">
                    No {config.name.toLowerCase()} found matching your criteria.
                  </p>
                  {activeFilterCount > 0 && (
                    <Button variant="outline" onClick={clearAll}>
                      Clear All Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Editorial / SEO Content Section — shown below the product grid
          for keyword-rich content that helps search engines understand the
          category. Added per SEO audit Item #14. */}
      {config.editorialContent && (
        <section className="border-t border-border bg-background py-14">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            {config.editorialTitle && (
              <h2 className="font-serif text-2xl lg:text-3xl mb-6 text-center">
                {config.editorialTitle}
              </h2>
            )}
            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed
                            [&_a]:text-foreground [&_a]:underline [&_a:hover]:text-primary
                            [&_h3]:font-serif [&_h3]:text-lg [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2
                            [&_p]:mb-4
                            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
                            [&_strong]:text-foreground">
              {config.editorialContent}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {config.faqs && config.faqs.length > 0 && (
        <section className="border-t border-border bg-card/30 py-14">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="font-serif text-2xl mb-8 text-center">
              Frequently Asked Questions — {config.name}
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {config.faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-background border border-border rounded-lg px-5"
                >
                  <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
