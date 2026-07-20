import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';

const NEW_ARRIVAL_WINDOW_DAYS = 30;
const MAX_PER_CATEGORY = 5;

// These match the enriched productType values from useShopifyProducts
const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'Lehengas', label: 'Lehengas', href: '/lehengas' },
  { key: 'Sarees', label: 'Sarees', href: '/sarees' },
  { key: 'Salwar Kameez', label: 'Suits', href: '/suits' },
  { key: 'Menswear', label: 'Menswear', href: '/menswear' },
  { key: 'Jewelry', label: 'Jewelry', href: '/jewelry' },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]['key'];

export const NewArrivals = () => {
  const { products, isLoading } = useShopifyProducts();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');

  // 1. Filter to products within the 30-day window
  const recentByCategory = useMemo(() => {
    const now = Date.now();
    const cutoff = now - NEW_ARRIVAL_WINDOW_DAYS * 86400000;

    // Group by enriched productType (already set by useShopifyProducts)
    const groups: Record<string, typeof products> = {};

    for (const product of products) {
      const created = new Date(product.node.createdAt).getTime();
      if (created > cutoff) {
        const cat = product.node.productType || 'Other';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(product);
      }
    }

    // Sort each group newest-first and cap at MAX_PER_CATEGORY
    const mainCategories = ['Lehengas', 'Sarees', 'Salwar Kameez', 'Menswear', 'Jewelry'];
    for (const cat of Object.keys(groups)) {
      groups[cat].sort(
        (a, b) => new Date(b.node.createdAt).getTime() - new Date(a.node.createdAt).getTime()
      );
      // Give main categories a higher cap, others get 3
      const limit = mainCategories.includes(cat) ? MAX_PER_CATEGORY : 3;
      groups[cat] = groups[cat].slice(0, limit);
    }

    return groups;
  }, [products]);

  // 2. Build the category-ordered list for "All" view
  const allOrdered = useMemo(() => {
    const ordered: typeof products = [];
    const mainCategories = ['Lehengas', 'Sarees', 'Salwar Kameez', 'Menswear', 'Jewelry'];
    for (const cat of mainCategories) {
      if (recentByCategory[cat]) {
        ordered.push(...recentByCategory[cat]);
      }
    }
    // Append any remaining categories
    for (const cat of Object.keys(recentByCategory)) {
      if (!mainCategories.includes(cat)) {
        ordered.push(...recentByCategory[cat]);
      }
    }
    return ordered;
  }, [recentByCategory]);

  // 3. Resolve displayed products based on active tab
  const displayedProducts = useMemo(() => {
    if (activeCategory === 'all') return allOrdered;
    return recentByCategory[activeCategory] || [];
  }, [activeCategory, allOrdered, recentByCategory]);

  // 4. Compute tab counts (for the pill badges)
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allOrdered.length };
    for (const cat of Object.keys(recentByCategory)) {
      counts[cat] = recentByCategory[cat].length;
    }
    return counts;
  }, [allOrdered, recentByCategory]);

  const totalNew = allOrdered.length;

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <div className="h-4 bg-secondary rounded w-24 animate-pulse" />
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="h-10 bg-secondary rounded w-64 mx-auto mb-3 animate-pulse" />
          </div>
          {/* Category pills skeleton */}
          <div className="flex justify-center gap-2 mb-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-20 bg-secondary rounded-full animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-secondary rounded-sm mb-3" />
                <div className="h-3 bg-secondary rounded w-1/3 mb-2" />
                <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                <div className="h-4 bg-secondary rounded w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Empty state ──
  if (totalNew === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm tracking-luxury uppercase text-muted-foreground">
              Just Dropped
            </p>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-3">
            New Arrivals
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {totalNew} new {totalNew === 1 ? 'piece' : 'pieces'} across {Object.keys(recentByCategory).length} {Object.keys(recentByCategory).length === 1 ? 'category' : 'categories'} — fresh from India&rsquo;s textile hubs.
          </p>
        </motion.div>

        {/* Category Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          {CATEGORIES.map((cat) => {
            const count = tabCounts[cat.key] || 0;
            // Hide tabs with zero products (except "All")
            if (cat.key !== 'all' && count === 0) return null;

            const isActive = activeCategory === cat.key;

            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`
                  inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-200
                  ${isActive
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }
                `}
              >
                {cat.label}
                {count > 0 && (
                  <span className={`
                    inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-semibold px-1
                    ${isActive ? 'bg-background/20 text-background' : 'bg-background/60 text-muted-foreground'}
                  `}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mb-12"
          >
            {displayedProducts.map((product, index) => (
              <ProductCard
                key={product.node.id}
                product={product}
                index={index}
                showQuickAdd
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button asChild variant="outline" size="lg" className="group">
            <Link to="/new-arrivals">
              View All New Arrivals
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};