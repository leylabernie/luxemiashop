import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import CollectionDecisionSupport, { CollectionDirectAnswer } from '@/components/collections/CollectionDecisionSupport';
import { sortProducts } from '@/lib/productFilters';
import { isMadeToOrderProduct } from '@/lib/customizableProducts';
import { toCollectionSchemaItems } from '@/lib/collectionSchema';
import { hasExplicitReadyToShipEvidence } from '@/lib/readyToShipEvidence';

const PRODUCTS_PER_PAGE = 48;

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const CatalogLoadError = () => (
  <div className="rounded-sm border border-destructive/30 bg-destructive/5 px-6 py-14 text-center" role="alert">
    <h2 className="font-serif text-2xl">Current ready-to-ship products could not be loaded</h2>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
      Product availability is temporarily unavailable. Try this page again, or contact LuxeMia before relying on a specific option.
    </p>
    <Button asChild className="mt-5" variant="outline">
      <a href="/ready-to-ship">Try again</a>
    </Button>
  </div>
);

const ReadyToShip = () => {
  const { products, isLoading, error } = useShopifyProducts();
  const [sortBy, setSortBy] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  const readyProducts = useMemo(
    () => products.filter((product) => {
      if (isMadeToOrderProduct(product.node.handle, product.node.tags)) return false;
      if (product.node.availableForSale !== true) return false;
      if (!hasExplicitReadyToShipEvidence(product.node)) return false;

      const variants = product.node.variants?.edges || [];
      return variants.length > 0 && variants.some((edge) => edge.node.availableForSale === true);
    }),
    [products],
  );

  const sortedProducts = useMemo(
    () => sortProducts(readyProducts, sortBy),
    [readyProducts, sortBy],
  );
  const visibleProducts = sortedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < sortedProducts.length;
  const currentSort = sortOptions.find((option) => option.value === sortBy)?.label || 'Featured';
  const collectionItems = toCollectionSchemaItems(visibleProducts);

  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Ready-to-Ship Indian Ethnic Wear | LuxeMia"
        description="Browse products whose current catalog record explicitly identifies ready-to-ship status. Confirm the selected variant, processing information and destination before ordering."
        canonical="https://luxemia.shop/ready-to-ship"
        noIndex={!isLoading && !error && sortedProducts.length === 0}
        type="collection"
        collection={!isLoading && !error
          ? { name: 'Ready-to-Ship Indian Ethnic Wear', description: 'Currently purchasable products with positive ready-to-ship catalog evidence.', items: collectionItems }
          : undefined}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Ready to Ship', url: '/ready-to-ship' },
        ]}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="border-b border-border/30 bg-secondary/40 py-10 lg:py-14">
          <div className="container mx-auto px-4 text-center lg:px-8">
            <span className="mb-3 block text-xs uppercase tracking-widest text-muted-foreground">
              Explicitly classified catalog styles
            </span>
            <h1 className="mb-4 font-serif text-3xl lg:text-5xl">Ready-to-Ship Indian Ethnic Wear</h1>
            <CollectionDirectAnswer path="/ready-to-ship" className="mx-auto max-w-3xl text-sm font-light leading-relaxed text-muted-foreground lg:text-base" />
            <p className="mt-4 text-xs text-muted-foreground">
              Ready-to-ship applies only when the current catalog record positively identifies that fulfillment status. If a listing also offers a custom selection, review that selection&apos;s separate processing information.{' '}
              <Link className="text-primary underline" to="/collections/customizable-indian-outfits">
                View made-to-order outfits.
              </Link>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Tracked delivery is available to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa and Mauritius.{' '}
              <Link className="text-primary underline" to="/shipping">View route-based rates.</Link>
            </p>
          </div>
        </section>

        <div className="sticky top-[90px] z-30 border-b border-border/30 bg-background lg:top-[132px]">
          <div className="container mx-auto flex items-center justify-between px-4 py-3 lg:px-8">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? 'Loading…'
                : error
                  ? 'Current ready-to-ship inventory is temporarily unavailable'
                  : `${visibleProducts.length} of ${sortedProducts.length} ready-to-ship styles`}
            </p>
            {!error ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-sm font-light">
                  Sort: {currentSort} <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={sortBy === option.value ? 'font-medium' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu> : null}
          </div>
        </div>

        <section className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="mb-4 aspect-[3/4] rounded-sm bg-muted" />
                  <div className="mb-2 h-3 w-1/3 rounded bg-muted" />
                  <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-1/4 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : error ? (
            <CatalogLoadError />
          ) : visibleProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {visibleProducts.map((product, index) => (
                  <ProductCard key={product.node.id} product={product} index={index} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((count) => count + PRODUCTS_PER_PAGE)}
                  >
                    Load More Ready-to-Ship Styles
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                No currently available ready-to-ship products were returned.
              </p>
              <Button asChild variant="outline" size="sm"><Link to="/collections">View All Collections</Link></Button>
            </div>
          )}
        </section>
        {!error ? <CollectionDecisionSupport path="/ready-to-ship" products={sortedProducts} isLoading={isLoading} /> : null}
      </main>

      <Footer />
    </div>
  );
};

export default ReadyToShip;
