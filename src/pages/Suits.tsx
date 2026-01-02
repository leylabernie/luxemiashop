import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { ActiveFilterTags } from '@/components/collections/ProductFilters';
import ProductCard from '@/components/ui/ProductCard';
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
import { getLocalSuitProducts } from '@/data/localProducts';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from 'sonner';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const suitFilterSections = [
  {
    name: 'Size',
    options: ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
  },
  {
    name: 'Category',
    options: ['Anarkali Suits', 'Designer Suits', 'Sharara Suits', 'Gharara Suits', 'Palazzo Suits', 'Gowns'],
  },
  {
    name: 'Occasion',
    options: ['Wedding', 'Party', 'Festive', 'Casual', 'Eid', 'Evening', 'Reception'],
  },
  {
    name: 'Fabric',
    options: ['Silk', 'Georgette', 'Chinon Silk', 'Crep Silk', 'Jacquard Silk', 'Velvet', 'Organza'],
  },
  {
    name: 'Work',
    options: ['Embroidery', 'Beadwork', 'Mirror Work', 'Sequins', 'Zari', 'Heavy Embroidery'],
  },
  {
    name: 'Color',
    options: ['Red', 'Green', 'Pink', 'Blue', 'Gold', 'Wine', 'Navy', 'Lavender', 'Black'],
  },
];

const Suits = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['Size', 'Category', 'Occasion']);
  
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  const allProducts = getLocalSuitProducts();

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];
    
    // Apply filters
    Object.entries(activeFilters).forEach(([section, values]) => {
      if (values.length > 0) {
        products = products.filter(p => {
          const product = p.node;
          if (section === 'Size') {
            // Check if product has any of the selected sizes in variants
            return values.some(v => 
              product.variants?.edges?.some(variant => 
                variant.node.title === v || 
                variant.node.selectedOptions?.some(opt => opt.value === v)
              )
            );
          }
          if (section === 'Category') {
            return values.some(v => 
              product.productType?.toLowerCase().includes(v.toLowerCase()) ||
              product.title.toLowerCase().includes(v.toLowerCase())
            );
          }
          if (section === 'Occasion') {
            return values.some(v => 
              product.productType?.toLowerCase().includes(v.toLowerCase()) ||
              product.description.toLowerCase().includes(v.toLowerCase())
            );
          }
          if (section === 'Fabric') {
            return values.some(v => 
              product.productType?.toLowerCase().includes(v.toLowerCase()) ||
              product.description.toLowerCase().includes(v.toLowerCase())
            );
          }
          if (section === 'Work') {
            return values.some(v => product.description.toLowerCase().includes(v.toLowerCase()));
          }
          if (section === 'Color') {
            return values.some(v => product.title.toLowerCase().includes(v.toLowerCase()));
          }
          return true;
        });
      }
    });

    // Apply price filter
    products = products.filter(p => {
      const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => 
          parseFloat(a.node.priceRange.minVariantPrice.amount) - 
          parseFloat(b.node.priceRange.minVariantPrice.amount)
        );
        break;
      case 'price-desc':
        products.sort((a, b) => 
          parseFloat(b.node.priceRange.minVariantPrice.amount) - 
          parseFloat(a.node.priceRange.minVariantPrice.amount)
        );
        break;
    }

    return products;
  }, [allProducts, activeFilters, priceRange, sortBy]);

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

  const formatPrice = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants.edges[0]?.node;
    addItem({
      product: product,
      variantId: variant?.id || product.id,
      variantTitle: variant?.title || 'Free Size',
      price: product.priceRange.minVariantPrice,
      quantity: 1,
      selectedOptions: variant?.selectedOptions || [],
    });
    toast.success('Added to bag!');
  };

  const handleWishlistToggle = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist!');
    }
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
                setPriceRange([0, 200]);
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
                    max={200}
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
        {suitFilterSections.map((section) => (
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

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Buy Anarkali Suits & Salwar Kameez Online | Designer Suits - LuxeMia"
        description="Shop elegant Anarkali suits, Sharara sets, and designer salwar kameez at LuxeMia. Premium fabrics with intricate embroidery. Custom sizing available. Worldwide delivery."
        image="/og/og-suits.jpg"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Suits', url: '/suits' },
        ]}
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
              Contemporary Classics
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4">Suits & Kurtas</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Elegant Anarkalis, flowing Shararas, and graceful Salwar Suits for every celebration.
            </p>
          </motion.div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
            <span>/</span>
            <span className="text-foreground">Suits & Kurtas</span>
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
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard 
                    key={product.node.id} 
                    product={product} 
                    index={index}
                    showQuickAdd={true}
                  />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">No products match your filters.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveFilters({});
                      setPriceRange([0, 200]);
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

export default Suits;
