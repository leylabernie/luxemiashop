import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { selectLatestArrivals } from '@/lib/catalogCategories.mjs';
import { selectDistinctHomepageProducts } from '@/lib/selectLatestHomepageImagery.mjs';
import { useLatestHomepageImagery } from '@/hooks/useLatestHomepageImagery';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';

const NEW_ARRIVAL_WINDOW_DAYS = 30;
const RECENT_PRODUCT_QUERY = `created_at:>='${new Date(
  Date.now() - NEW_ARRIVAL_WINDOW_DAYS * 86400000,
).toISOString().slice(0, 10)}'`;

export const NewArrivals = () => {
  const { products, isLoading } = useShopifyProducts(undefined, false, RECENT_PRODUCT_QUERY);
  const latestImagery = useLatestHomepageImagery();

  const displayedProducts = useMemo(() => {
    const cutoff = Date.now() - NEW_ARRIVAL_WINDOW_DAYS * 86400000;
    const recent = products.filter(
      (product) => new Date(product.node.createdAt).getTime() > cutoff,
    );
    const sorted = selectLatestArrivals(recent, Date.now(), 120);
    return selectDistinctHomepageProducts(sorted, {
      limit: 10,
      hardAvoid: Object.values(latestImagery.promos),
      softAvoid: [
        ...Object.values(latestImagery.hero),
        ...Object.values(latestImagery.categories),
      ],
    });
  }, [products, latestImagery]);

  if (isLoading) {
    return (
      <section className="border-b border-[#eaded6] bg-[#fffaf6] py-12 lg:py-16">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="mb-2 h-3.5 w-24 animate-pulse rounded bg-secondary" />
              <div className="h-8 w-48 animate-pulse rounded bg-secondary" />
            </div>
            <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-3 aspect-[3/4] rounded-sm bg-secondary" />
                <div className="mb-2 h-3 w-1/3 rounded bg-secondary" />
                <div className="mb-2 h-4 w-3/4 rounded bg-secondary" />
                <div className="h-4 w-1/4 rounded bg-secondary" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayedProducts.length === 0) return null;

  return (
    <section aria-labelledby="home-new-arrivals-heading" className="border-b border-[#eaded6] bg-[#fffaf6] py-12 lg:py-16">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-link">
              Just Dropped
            </p>
            <h2 id="home-new-arrivals-heading" className="mt-1 font-serif text-2xl text-[#291f20] sm:text-3xl lg:text-4xl">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/new-arrivals"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-link underline underline-offset-4 hover:text-link/80"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {displayedProducts.map((product, index) => (
            <ProductCard
              key={product.node.id}
              product={product}
              index={index}
              showQuickAdd
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="group border-[#3b2a2d]/30 bg-white text-[#291f20] hover:border-[#3b2a2d] hover:bg-[#3b2a2d] hover:text-[#fff9f4]"
          >
            <Link to="/new-arrivals">
              View All New Arrivals
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
