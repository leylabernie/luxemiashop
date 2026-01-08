import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { ActiveFilterTags } from '@/components/collections/ProductFilters';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import ProductCard from '@/components/ui/ProductCard';
import { filterAndSortProducts } from '@/lib/productFilters';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const sareeFilterSections = [
  {
    name: 'Size',
    options: ['Free Size', 'Custom'],
  },
  {
    name: 'Availability',
    options: ['Ready to Ship', 'Made to Order'],
  },
  {
    name: 'Occasion',
    options: ['Bridal', 'Wedding', 'Party', 'Festive', 'Occasional'],
  },
  {
    name: 'Fabric',
    options: ['Silk', 'Georgette', 'Chiffon', 'Cotton', 'Organza', 'Tissue', 'Art Silk', 'Net'],
  },
  {
    name: 'Work',
    options: ['Weaving', 'Embroidery', 'Sequins', 'Zari', 'Heavy Work', 'Print'],
  },
  {
    name: 'Color',
    options: ['Pink', 'Red', 'Green', 'Blue', 'Gold', 'Beige', 'Maroon', 'Purple', 'Cream'],
  },
];

const Sarees = () => {
  const { products, isLoading, isLoadingMore, hasMore, lastProductRef, loadMore } = useInfiniteProducts('sarees');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['Occasion', 'Fabric']);

  // Apply filters and sorting using the reusable utility
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, activeFilters, priceRange, sortBy);
  }, [products, activeFilters, priceRange, sortBy]);

  // Auto-load more products when filters reduce visible results but more exist
  useEffect(() => {
    const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0) || priceRange[0] > 0 || priceRange[1] < 1000;
    
    if (hasActiveFilters && filteredProducts.length < 12 && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [filteredProducts.length, hasMore, isLoadingMore, loadMore, activeFilters, priceRange]);

  const handleFilterChange = (section: string, option: string) => {
    const currentOptions = activeFilters[section] || [];
    const newOptions = currentOptions.includes(option)
      ? currentOptions.filter((o) => o !== option)
      : [...currentOptions, option];

    setActiveFilters({
      ...activeFilters,
      [section]: newOptions,
    });
  };

  const handleRemoveFilter = (section: string, option: string) => {
    const currentOptions = activeFilters[section] || [];
    setActiveFilters({
      ...activeFilters,
      [section]: currentOptions.filter((o) => o !== option),
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const FilterSidebar = () => (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="sticky top-28">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-serif">Filters</h2>
          {Object.values(activeFilters).flat().length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveFilters({});
                setPriceRange([0, 1000]);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Price Range */}
        <div className="mb-6 pb-6 border-b border-border">
          <button
            onClick={() => toggleSection('Price')}
            className="flex items-center justify-between w-full text-left mb-4"
          >
            <span className="text-sm font-medium uppercase tracking-wide">Price</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                expandedSections.includes('Price') ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {expandedSections.includes('Price') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4">
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    min={0}
                    max={1000}
                    step={25}
                    className="py-4"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Sections */}
        {sareeFilterSections.map((section) => (
          <div key={section.name} className="mb-6 pb-6 border-b border-border last:border-0">
            <button
              onClick={() => toggleSection(section.name)}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <span className="text-sm font-medium uppercase tracking-wide">
                {section.name}
                {activeFilters[section.name]?.length > 0 && (
                  <span className="ml-2 text-xs text-primary">
                    ({activeFilters[section.name].length})
                  </span>
                )}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedSections.includes(section.name) ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {expandedSections.includes(section.name) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {section.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <Checkbox
                        checked={activeFilters[section.name]?.includes(option) || false}
                        onCheckedChange={() => handleFilterChange(section.name, option)}
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </aside>
  );

  // Collection-specific FAQs for rich snippets
  const sareeFaqs = [
    {
      question: "What types of sarees are available at LuxeMia?",
      answer: "LuxeMia offers a curated collection of premium sarees including Kanchipuram silk, Banarasi silk, Tissue silk, Georgette, and handwoven sarees. Our collection spans wedding sarees, festive wear, casual sarees, and occasion wear suitable for every celebration."
    },
    {
      question: "How do I choose the right saree fabric?",
      answer: "Choose Kanchipuram or Banarasi silk for weddings and grand occasions. Georgette and Chiffon work well for parties and receptions. Cotton and Tissue silk are ideal for festive wear and day events. Our expert stylists can help you select the perfect fabric for your occasion."
    },
    {
      question: "Do you offer custom blouse stitching with sarees?",
      answer: "Yes, we offer complimentary blouse stitching with every saree purchase. You can provide your measurements and preferred style (padded, princess cut, etc.), and our master tailors will create a perfectly fitted blouse."
    },
    {
      question: "What is the delivery time for sarees?",
      answer: "Standard shipping to the US takes 7-12 business days. Express shipping (3-5 days) is available at checkout. For custom blouse stitching orders, please allow an additional 5-7 days for tailoring."
    },
    {
      question: "How should I care for my silk saree?",
      answer: "We recommend professional dry cleaning for all silk sarees. Store in a cool, dry place wrapped in soft muslin cloth. Avoid direct sunlight and refold every few months to prevent permanent creases."
    }
  ];

  // Generate collection schema items from products
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
        title="Designer Sarees Online: Silk & Wedding Sarees from $49 | LuxeMia"
        description="Buy 300+ designer sarees online. Banarasi silk, Kanjivaram & wedding sarees with free US shipping. Premium quality, easy returns. Shop now!"
        type="collection"
        image="/og/og-sarees.jpg"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Sarees', url: '/sarees' },
        ]}
        collection={{
          name: 'Sarees Collection',
          description: 'Handwoven silk sarees and designer drapes for weddings and celebrations.',
          items: collectionItems,
        }}
        faqs={sareeFaqs}
      />
      <Header />

      <main className="pt-24 pb-16">
        <section className="relative h-64 md:h-80 flex items-center justify-center bg-gradient-to-b from-secondary to-background overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center px-4"
          >
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">
              Timeless Elegance
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4">Sarees</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Exquisite handwoven sarees featuring Kanchipuram silks, tissue weaves, and contemporary designs.
            </p>
          </motion.div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
            <span>/</span>
            <span className="text-foreground">Sarees</span>
          </nav>
        </div>

        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="flex gap-8">
            <div className="hidden lg:block">
              <FilterSidebar />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="text-foreground font-medium">{filteredProducts.length}</span> products
                </p>

                <div className="flex items-center gap-3">
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
                        <FilterSidebar />
                      </div>
                    </SheetContent>
                  </Sheet>

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

              <ActiveFilterTags filters={activeFilters} onRemove={handleRemoveFilter} />

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
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                    {filteredProducts.map((product, index) => {
                      const rawIndex = products.findIndex(p => p.node.id === product.node.id);
                      const isLastRawProduct = rawIndex === products.length - 1;
                      return (
                        <ProductCard 
                          key={product.node.id}
                          ref={isLastRawProduct ? lastProductRef : null}
                          product={product} 
                          index={index % 20}
                          showQuickAdd={true}
                        />
                      );
                    })}
                  </div>
                  
                  {isLoadingMore && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                      <span className="text-muted-foreground">Loading more...</span>
                    </div>
                  )}
                  
                  {!hasMore && filteredProducts.length > 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      You've seen all {filteredProducts.length} sarees
                    </div>
                  )}
                </>
              )}

              {!isLoading && filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">No sarees found matching your criteria.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveFilters({});
                      setPriceRange([0, 1000]);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Sarees;
