import ProductCard from '@/components/ui/ProductCard';
import type { ShopifyProduct } from '@/lib/shopify';

interface ProductGridProps {
  products: ShopifyProduct[];
  isLoading: boolean;
  columns?: 2 | 3 | 4;
}

export const ProductGrid = ({ products, isLoading, columns = 4 }: ProductGridProps) => {
  // Mobile: always 2 cols, tablet+: respect columns prop
  const gridCols = columns === 2
    ? 'grid-cols-2'
    : columns === 3 
      ? 'grid-cols-2 md:grid-cols-3' 
      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  if (isLoading) {
    return (
      <div className={`grid ${gridCols} gap-2 sm:gap-4 lg:gap-6`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-card rounded-sm mb-2 sm:mb-4" />
            <div className="h-3 sm:h-4 bg-card rounded w-3/4 mb-1 sm:mb-2" />
            <div className="h-3 sm:h-4 bg-card rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-sm border border-border/60 bg-card/40 px-6 py-12 text-center" role="status">
        <p className="font-medium text-foreground">No current products were returned for this view.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try another collection or return later after the catalog refreshes.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-2 sm:gap-4 lg:gap-6`}>
      {products.map((product, index) => (
        <ProductCard 
          key={product.node.id} 
          product={product} 
          index={index}
          showQuickAdd={true}
        />
      ))}
    </div>
  );
};
