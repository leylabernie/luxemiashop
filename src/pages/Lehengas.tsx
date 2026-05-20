import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { metadataToSEOHeadProps } from '@/lib/seoHeadAdapter';
import { getStaticPageMetadata } from '@/lib/seoMetadata';
import { ActiveFilterTags } from '@/components/collections/ProductFilters';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useShopifyPaginatedProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import { filterAndSortProducts } from '@/lib/productFilters';
import { PaginationWithInput } from '@/components/ui/pagination-with-input';
import { getOptimizedImage } from '@/lib/imageUtils';
// Removed OccasionFilter import

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const lehengasSeo = metadataToSEOHeadProps(getStaticPageMetadata('/lehengas'));

const lehengaFilterSections = [
  {
    name: 'Fabric',
    options: ['Silk', 'Georgette', 'Net', 'Organza', 'Velvet', 'Chinon'],
  },
  {
    name: 'Color',
    options: ['Red', 'Pink', 'Maroon', 'Green', 'Blue', 'Purple', 'Gold', 'Black', 'Cream'],
  },
];

const Lehengas = () => {
  const { products, isLoading, currentPage, totalPages, totalCount, goToPage } = useShopifyPaginatedProducts('lehengas');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['Fabric', 'Color']);
  // Apply filters and sorting using the reusable utility
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, activeFilters, priceRange, sortBy);
  }, [products, activeFilters, priceRange, sortBy]);

  // Generate pagination numbers
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

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
      <div className="sticky top-28 lg:top-36">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-serif">Filters</h2>
          {Object.values(activeFilters).flat().length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveFilters({});
                setPriceRange([0, 2000]);
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
                    max={2000}
                    step={50}
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
        {lehengaFilterSections.map((section) => (
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
  const lehengaFaqs = [
    {
      question: "What types of lehengas are available at LuxeMia?",
      answer: "LuxeMia offers bridal lehengas, reception lehengas, festive lehengas, and party wear in various fabrics including Net, Silk, Velvet, Georgette, Chinnon, and Roman Silk. Each piece features embroidery, sequins, zari, or mirror work."
    },
    {
      question: "How do I find the right lehenga size?",
      answer: "We offer sizes S, M, L, XL, XXL, and Custom sizing. For bridal lehengas, we highly recommend custom sizing for a perfect fit. Provide your bust, waist, hip, and height measurements, and our team will prepare your lehenga to your measurements."
    },
    {
      question: "What is included in a lehenga set?",
      answer: "Every LuxeMia lehenga set includes the lehenga skirt, matching choli (blouse), and dupatta. Bridal sets often include additional accessories like cancan for volume and a matching potli bag."
    },
    {
      question: "How long does it take to receive a bridal lehenga?",
      answer: "Ready-to-ship lehengas dispatch in 3-5 business days, with standard delivery (USPS/UPS) taking 7-10 business days transit or express (DHL) taking 3-5 business days transit. Custom/alteration orders dispatch in 5-7 business days. We recommend ordering bridal wear at least 6-8 weeks before your wedding."
    },
    {
      question: "Can I customize the color of my lehenga?",
      answer: "Yes! Most of our lehengas can be customized in different colors. Contact our styling team with your color preferences, and we'll confirm availability and any additional timeline requirements."
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
        {...lehengasSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Lehengas', url: '/lehengas' },
        ]}
        collection={{
          name: 'Bridal Lehengas Online — Wedding & Festive Collection',
          description: 'Shop designer bridal lehengas online at LuxeMia. Handcrafted wedding lehenga cholis in silk, georgette, net & Banarasi with intricate embroidery. Custom sizing. Free shipping over $350.',
          items: collectionItems,
        }}
        faqs={lehengaFaqs}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        {/* Hero Banner */}
        <section className="relative h-64 md:h-96 flex items-center justify-center overflow-hidden">
          <picture className="absolute inset-0 w-full h-full">
            <source srcSet="/images/banners/lehenga-banner.webp" type="image/webp" />
            <img
              src={getOptimizedImage("/images/banners/lehenga-banner.jpg", 'hero')}
              alt="Lehenga Collection"
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
              Explore Our Collection
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4 leading-tight">
              Shop Bridal Lehengas Online
            </h1>
            <p className="text-white/80 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
              Discover handcrafted wedding lehengas, festive lehenga cholis, and designer bridal sets. 
              From pearl white silk to vibrant Banarasi embroidery — each piece tells a story of 
              Indian artistry. Free shipping over $350 to USA, Canada & Australia.
            </p>
          </motion.div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Bridal Lehengas</span>
          </nav>

          {/* SEO Editorial Content */}
          <section className="mb-10 max-w-4xl" aria-label="About our lehenga collection">
            <h2 className="text-xl md:text-2xl font-serif mb-4 text-foreground">
              Designer Bridal Lehengas for Every Celebration
            </h2>
            <div className="prose prose-stone max-w-none text-muted-foreground leading-relaxed space-y-4">
              <p>
                LuxeMia&apos;s curated lehenga collection brings together centuries of Indian textile 
                heritage and contemporary bridal fashion. Each <strong className="text-foreground">bridal lehenga</strong> in our 
                collection is handcrafted by master artisans using time-honored techniques — from 
                intricate zardozi gold threadwork to delicate aari embroidery — creating heirloom-quality 
                pieces for your most cherished celebrations.
              </p>
              <p>
                Whether you seek a <strong className="text-foreground">wedding lehenga</strong> for your big day, 
                a <strong className="text-foreground">festive lehenga choli</strong> for sangeet night, or 
                a <strong className="text-foreground">partywear lehenga</strong> for reception glamour, 
                our collection spans silk, georgette, net, Banarasi, and velvet fabrics in a spectrum 
                of colors from classic pearl white and ivory to rich maroon, wine, and royal purple.
              </p>
              <p>
                Every lehenga ships with a matching choli blouse and dupatta. Custom tailoring is 
                complimentary — simply provide your measurements at checkout. Enjoy free shipping on 
                orders over $350 across the USA, Canada, and Australia.
              </p>
            </div>
          </section>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <div className="hidden lg:block">
              <FilterSidebar />
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
                        <FilterSidebar />
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
                    {filteredProducts.map((product, index) => (
                      <ProductCard 
                        key={product.node.id}
                        product={product} 
                        index={index % 24}
                        showQuickAdd={true}
                      />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <PaginationWithInput
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    onPageChange={goToPage}
                    getPageNumbers={getPageNumbers}
                  />
                </>
              )}

              {/* Empty State */}
              {!isLoading && filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">No lehengas found matching your criteria.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveFilters({});
                      setPriceRange([0, 2000]);
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

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions — Lehengas</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {lehengaFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-background border border-border rounded-lg px-5">
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

      <Footer />
    </div>
  );
};

export default Lehengas;
