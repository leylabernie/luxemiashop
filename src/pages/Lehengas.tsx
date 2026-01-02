import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
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
import { type ShopifyProduct } from '@/lib/shopify';
import { getAllLocalProducts } from '@/data/localProducts';

// Using local products for preview - switch to Shopify when ready to publish
const USE_LOCAL_PRODUCTS = true;

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Selling', value: 'best-selling' },
];

const Lehengas = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        if (USE_LOCAL_PRODUCTS) {
          const localData = getAllLocalProducts();
          setProducts(localData);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

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
      <Header />

      <main className="pt-24 pb-16">
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4">Lehengas</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Exquisite bridal and festive lehengas crafted with intricate embroidery and premium fabrics.
            </p>
          </motion.div>
        </section>

        {/* Breadcrumb */}
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
            <span>/</span>
            <span className="text-foreground">Lehengas</span>
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
                  Showing <span className="text-foreground font-medium">{products.length}</span> products
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
              <ProductGrid products={products} isLoading={isLoading} />

              {/* Empty State */}
              {!isLoading && products.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">No lehengas found yet.</p>
                  <Link to="/collections">
                    <Button variant="outline">Browse All Collections</Button>
                  </Link>
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

export default Lehengas;