import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
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
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import { filterAndSortProducts } from '@/lib/productFilters';
import { OccasionFilter, filterByOccasion } from '@/components/collections/OccasionFilter';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const menswearFilterSections = [
  {
    name: 'Category',
    options: ['Sherwani', 'Kurta', 'Jodhpuri'],
  },
  {
    name: 'Occasion',
    options: ['Wedding', 'Party'],
  },
  {
    name: 'Fabric',
    options: ['Art Silk', 'Jacquard', 'Velvet'],
  },
  {
    name: 'Color',
    options: ['Black', 'Navy Blue', 'Grey', 'Cream', 'Beige', 'Pink'],
  },
];

const Menswear = () => {
  const { products, isLoading } = useShopifyProducts('menswear');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['Occasion', 'Fabric']);
  const [occasionFilter, setOccasionFilter] = useState('All');

  // Apply filters and sorting using the reusable utility
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, activeFilters, priceRange, sortBy);
  }, [products, activeFilters, priceRange, sortBy]);

  // Apply occasion filter on top of other filters
  const displayProducts = useMemo(() => {
    return filterByOccasion(filteredProducts, occasionFilter);
  }, [filteredProducts, occasionFilter]);

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
                setPriceRange([0, 500]);
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
                    max={500}
                    step={10}
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
        {menswearFilterSections.map((section) => (
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
  const menswearFaqs = [
    {
      question: "What types of men's ethnic wear are available at LuxeMia?",
      answer: "LuxeMia offers Groom Sherwanis, Kurta Pajama sets, Velvet Sherwanis, Indo-Western outfits, and Nehru Jackets. Our collection features premium fabrics like Art Silk, Banarasi Jacquard, Velvet, and Cotton with exquisite embroidery."
    },
    {
      question: "How do I find the right size for a sherwani?",
      answer: "We offer sizes 36, 38, 40, 42, and 44. For groom sherwanis, we recommend custom sizing for a perfect fit. Provide chest, waist, hip, height, and shoulder measurements for the best results."
    },
    {
      question: "What's included in a sherwani set?",
      answer: "A complete sherwani set includes the sherwani coat, churidar pants, and matching dupatta/stole. Groom sets often include additional accessories like a safa (turban) and matching mojris (footwear) upon request."
    },
    {
      question: "How long does it take to receive a groom sherwani?",
      answer: "Ready-to-ship sherwanis arrive in 7-12 business days. Custom-tailored groom sherwanis require 3-4 weeks. For weddings, we recommend ordering 8-10 weeks in advance to allow time for fittings and alterations."
    },
    {
      question: "Can I get matching outfits for the groom and groomsmen?",
      answer: "Yes! We offer coordinated packages for grooms and groomsmen. Contact our styling team to create a cohesive look with matching or complementary sherwanis and kurta sets."
    }
  ];

  // Generate collection schema items from products
  const collectionItems = displayProducts.slice(0, 30).map(p => ({
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
        title="Men's Indian Ethnic Wear — LuxeMia"
        description="Shop men's Indian ethnic wear at LuxeMia. Designer sherwanis, kurta pajamas, and Nehru jackets for weddings and celebrations."
        canonical="https://luxemia.shop/menswear"
        type="collection"
        image="/og/og-menswear.jpg"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Menswear', url: '/menswear' },
        ]}
        collection={{
          name: 'Menswear Collection',
          description: 'Premium sherwanis, kurta pajamas, and Indo-Western outfits for men.',
          items: collectionItems,
        }}
        faqs={menswearFaqs}
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
              Groom & Wedding Guest
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4">Indian Men's Ethnic Wear</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Regal sherwanis and elegant kurta pajamas for grooms and distinguished wedding guests.
            </p>
          </motion.div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
            <span>/</span>
            <span className="text-foreground">Menswear</span>
          </nav>
        </div>

        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="flex gap-8">
            <div className="hidden lg:block">
              <FilterSidebar />
            </div>

            <div className="flex-1">
              {/* Occasion Filter Pills */}
              <div className="mb-6">
                <OccasionFilter selected={occasionFilter} onChange={setOccasionFilter} />
              </div>

              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="text-foreground font-medium">{displayProducts.length}</span> products
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
              ) : displayProducts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <h3 className="font-serif text-2xl mb-4">Coming Soon</h3>
                    <p className="text-muted-foreground mb-6">
                      Our menswear collection featuring designer sherwanis, kurta pajamas, and Indo-western outfits is being curated. Check back soon for regal wedding attire for grooms and guests.
                    </p>
                    <Button asChild variant="outline">
                      <Link to="/lehengas">Explore Bridal Collection</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                  {displayProducts.map((product, index) => (
                    <ProductCard 
                      key={product.node.id} 
                      product={product} 
                      index={index}
                      showQuickAdd={true}
                    />
                  ))}
                </div>
              )}

              {!isLoading && displayProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">No menswear found matching your criteria.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveFilters({});
                      setPriceRange([0, 500]);
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

export default Menswear;
