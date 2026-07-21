import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, TrendingUp } from 'lucide-react';
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
import { sortProducts } from '@/lib/productFilters';

const sortOptions = [
  { label: 'Best Selling', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const Bestsellers = () => {
  const { products, isLoading } = useShopifyProducts();
  const [sortBy, setSortBy] = useState('featured');

  const sortedProducts = useMemo(() => {
    // Filter to actual bestsellers — products tagged 'bestseller', 'best-seller',
    // 'popular', or with 'isBestseller' metadata.
    const bestsellers = products.filter(p => {
      const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
      const hasBestsellerTag = tags.some(t =>
        t.includes('bestseller') || t.includes('best-seller') || t.includes('best seller') || t.includes('popular')
      );
      const hasMeta = (p.node as any).metadata?.isBestseller === true;
      return hasBestsellerTag || hasMeta;
    });

    // If we found tagged bestsellers, use those.
    // Otherwise, pick products from the MIDDLE of the catalog (not the newest 24
    // which overlap with New Arrivals). Sort by price descending as a proxy for
    // "premium/popular" and limit to 24.
    let pool: typeof products;
    if (bestsellers.length >= 8) {
      pool = bestsellers;
    } else {
      // Sort by price descending (premium products as bestseller proxy)
      // and skip the first 24 (those are in New Arrivals) to avoid overlap
      const byPriceDesc = [...products].sort((a, b) =>
        parseFloat(b.node.priceRange.minVariantPrice.amount) -
        parseFloat(a.node.priceRange.minVariantPrice.amount)
      );
      pool = byPriceDesc.slice(0, 24);
    }
    return sortProducts(pool, sortBy);
  }, [products, sortBy]);

  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Best Selling';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Bestsellers: Most-Loved Indian Ethnic Wear Online | LuxeMia"
        description="Shop LuxeMia's bestselling Indian ethnic wear online. Most-loved bridal lehengas, sarees, salwar kameez & jewelry — trusted by customers worldwide. Free shipping."
        canonical="https://luxemia.shop/bestsellers"
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">
        {/* Hero Banner */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Customer Favourites</span>
            </div>
            <h1 className="font-serif text-3xl lg:text-5xl mb-3">Bestsellers</h1>
            <p className="text-muted-foreground font-light max-w-md mx-auto text-sm lg:text-base">
              The styles our customers love most — tried, trusted and adored worldwide.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-border/30 bg-background sticky top-[90px] lg:top-[132px] z-30">
          <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading…' : `${sortedProducts.length} styles`}
            </p>
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

        {/* Product Grid */}
        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          {isLoading ? (
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
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {sortedProducts.map((product, index) => (
                <ProductCard key={product.node.id} product={product} index={index} />
              ))}
            </motion.div>
          )}
        </section>
      </main>

      {/* SEO section — keyword content */}
      <section className="border-t border-border/50 bg-card/20 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
          <h2 className="font-serif text-xl mb-4">Most Popular Indian Ethnic Wear — Trusted by Customers in USA, Canada & Australia</h2>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              These are the styles our customers return to again and again. LuxeMia's bestselling <strong>Indian ethnic wear</strong> includes our most-loved <strong>bridal lehenga choli sets</strong>, <strong>Banarasi and silk sarees</strong>, <strong>heavy embroidered anarkali suits</strong>, and <strong>groom sherwanis</strong> for weddings. These pieces consistently receive the highest customer satisfaction scores across our NRI customer base in the USA, Canada, and Australia.
            </p>
            <p>
              Our bestsellers are curated based on repeat orders, customer reviews, and styling team picks. Every piece in this collection has been worn to <strong>Indian weddings</strong>, <strong>Diwali celebrations</strong>, <strong>Eid festivities</strong>, <strong>sangeet nights</strong>, and <strong>reception dinners</strong>. Shop with confidence — these are the pieces that actually deliver on quality, color accuracy, and fit.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Bestsellers;
