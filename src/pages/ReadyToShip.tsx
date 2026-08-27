import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import { sortProducts } from '@/lib/productFilters';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const ReadyToShip = () => {
  const { products, isLoading } = useShopifyProducts();
  const [sortBy, setSortBy] = useState('featured');

  const readyProducts = useMemo(
    () => products.filter((product) => {
      const processingDays = Number(product.node.shipsWithinDays);
      return Number.isFinite(processingDays) && processingDays > 0 && processingDays <= 5;
    }),
    [products],
  );
  const sortedProducts = useMemo(() => sortProducts(readyProducts, sortBy).slice(0, 48), [readyProducts, sortBy]);
  const currentSort = sortOptions.find((option) => option.value === sortBy)?.label || 'Featured';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Ready-to-Ship Indian Ethnic Wear | LuxeMia"
        description="Shop LuxeMia outfits with a verified semi-stitched processing window of up to five business days. Stitched and made-to-measure options take longer."
        canonical="https://luxemia.shop/ready-to-ship"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Ready to Ship', url: '/ready-to-ship' },
        ]}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Verified shorter processing</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Ready-to-Ship Indian Ethnic Wear</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              These products have a verified semi-stitched processing window of up to five business days. Ready-to-wear and made-to-measure selections require additional processing. Processing is the time before dispatch; carrier transit begins afterward. Review the exact product option and contact LuxeMia before ordering for a fixed event date.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Tracked delivery is available to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa and Mauritius. <Link className="text-primary underline" to="/shipping">View route-based rates.</Link>
            </p>
          </div>
        </section>

        <div className="border-b border-border/30 bg-background sticky top-[90px] lg:top-[132px] z-30">
          <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{isLoading ? 'Loading…' : `${sortedProducts.length} styles with verified shorter processing`}</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-sm font-light">
                  Sort: {currentSort} <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map((option) => (
                  <DropdownMenuItem key={option.value} onClick={() => setSortBy(option.value)} className={sortBy === option.value ? 'font-medium' : ''}>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted rounded-sm mb-4" />
                  <div className="h-3 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {sortedProducts.map((product, index) => <ProductCard key={product.node.id} product={product} index={index} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-sm mb-4">No products currently have a verified semi-stitched processing window of five business days or less.</p>
              <Link to="/collections"><Button variant="outline" size="sm">View All Collections</Button></Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ReadyToShip;