import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
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
import ProductCard from '@/components/ui/ProductCard';
import {
  ActiveFilterTags,
  ProductFilters,
  type FilterSection,
} from '@/components/collections/ProductFilters';
import { filterAndSortProducts } from '@/lib/productFilters';
import type { ShopifyProduct } from '@/lib/shopify';

export interface CollectionSortOption {
  label: string;
  value: string;
}

interface CollectionProductBrowserProps {
  products: ShopifyProduct[];
  isLoading: boolean;
  sortOptions: CollectionSortOption[];
  initialSort?: string;
  filterSections: FilterSection[];
  priceRangeMax?: number;
  priceStep?: number;
  countLabel?: string;
  emptyState?: React.ReactNode;
  showQuickAdd?: boolean;
}

const ProductSkeletonGrid = () => (
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
);

const CollectionProductBrowser = ({
  products,
  isLoading,
  sortOptions,
  initialSort = 'featured',
  filterSections,
  priceRangeMax = 1000,
  priceStep = 25,
  countLabel = 'styles',
  emptyState,
  showQuickAdd = true,
}: CollectionProductBrowserProps) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, priceRangeMax]);
  const [sortBy, setSortBy] = useState(initialSort);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const displayProducts = useMemo(
    () => filterAndSortProducts(products, activeFilters, priceRange, sortBy),
    [products, activeFilters, priceRange, sortBy]
  );

  const handleRemoveFilter = (section: string, option: string) => {
    const currentOptions = activeFilters[section] || [];
    setActiveFilters({
      ...activeFilters,
      [section]: currentOptions.filter((o) => o !== option),
    });
  };

  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || sortOptions[0]?.label || 'Featured';
  const hasFilteredEmptyState = !isLoading && displayProducts.length === 0 && products.length > 0;

  return (
    <>
      <div className="border-b border-border/30 bg-background sticky top-[90px] lg:top-[132px] z-30">
        <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${displayProducts.length} ${countLabel}`}
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
                  <ProductFilters
                    activeFilters={activeFilters}
                    onFilterChange={setActiveFilters}
                    priceRange={priceRange}
                    onPriceChange={setPriceRange}
                    filterSections={filterSections}
                    priceRangeMax={priceRangeMax}
                    priceStep={priceStep}
                  />
                </div>
              </SheetContent>
            </Sheet>
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
      </div>

      <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="flex gap-8">
          <div className="hidden lg:block">
            <ProductFilters
              activeFilters={activeFilters}
              onFilterChange={setActiveFilters}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              filterSections={filterSections}
              priceRangeMax={priceRangeMax}
              priceStep={priceStep}
            />
          </div>
          <div className="flex-1">
            <ActiveFilterTags filters={activeFilters} onRemove={handleRemoveFilter} />
            {isLoading ? (
              <ProductSkeletonGrid />
            ) : displayProducts.length === 0 ? (
              hasFilteredEmptyState ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">No products found matching your filters.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveFilters({});
                      setPriceRange([0, priceRangeMax]);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                emptyState
              )
            ) : (
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {displayProducts.map((product, index) => (
                  <ProductCard
                    key={product.node.id}
                    product={product}
                    index={index}
                    showQuickAdd={showQuickAdd}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default CollectionProductBrowser;

