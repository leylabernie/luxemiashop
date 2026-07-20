import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ui/ProductCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { sortProducts } from '@/lib/productFilters';

const NEW_ARRIVAL_WINDOW_DAYS = 30;
const MAX_PER_CATEGORY = 5;

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'Lehengas', label: 'Lehengas' },
  { key: 'Sarees', label: 'Sarees' },
  { key: 'Salwar Kameez', label: 'Suits' },
  { key: 'Menswear', label: 'Menswear' },
  { key: 'Jewelry', label: 'Jewelry' },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]['key'];

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const NewArrivals = () => {
  const { products, isLoading } = useShopifyProducts();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [sortBy, setSortBy] = useState('newest');

  // 1. Filter to 30-day window, group by category, cap at MAX_PER_CATEGORY
  const recentByCategory = useMemo(() => {
    const now = Date.now();
    const cutoff = now - NEW_ARRIVAL_WINDOW_DAYS * 86400000;
    const groups: Record<string, typeof products> = {};
    const mainCategories = ['Lehengas', 'Sarees', 'Salwar Kameez', 'Menswear', 'Jewelry'];

    for (const product of products) {
      const created = new Date(product.node.createdAt).getTime();
      if (created > cutoff) {
        const cat = product.node.productType || 'Other';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(product);
      }
    }

    for (const cat of Object.keys(groups)) {
      groups[cat].sort(
        (a, b) => new Date(b.node.createdAt).getTime() - new Date(a.node.createdAt).getTime()
      );
      const limit = mainCategories.includes(cat) ? MAX_PER_CATEGORY : 3;
      groups[cat] = groups[cat].slice(0, limit);
    }

    return groups;
  }, [products]);

  // 2. Build ordered flat list for "All" view
  const allOrdered = useMemo(() => {
    const ordered: typeof products = [];
    const mainCategories = ['Lehengas', 'Sarees', 'Salwar Kameez', 'Menswear', 'Jewelry'];
    for (const cat of mainCategories) {
      if (recentByCategory[cat]) ordered.push(...recentByCategory[cat]);
    }
    for (const cat of Object.keys(recentByCategory)) {
      if (!mainCategories.includes(cat)) ordered.push(...recentByCategory[cat]);
    }
    return ordered;
  }, [recentByCategory]);

  // 3. Apply category filter then sort
  const filteredProducts = useMemo(() => {
    const source = activeCategory === 'all' ? allOrdered : (recentByCategory[activeCategory] || []);
    return sortProducts(source, sortBy);
  }, [activeCategory, allOrdered, recentByCategory, sortBy]);

  // 4. Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allOrdered.length };
    for (const cat of Object.keys(recentByCategory)) {
      counts[cat] = recentByCategory[cat].length;
    }
    return counts;
  }, [allOrdered, recentByCategory]);

  const totalNew = allOrdered.length;
  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Newest First';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="New Arrivals: Latest Indian Ethnic Wear Online | LuxeMia"
        description="Shop the latest Indian ethnic wear online at LuxeMia. New arrivals in bridal lehengas, designer sarees, salwar kameez, jewelry & more. Fresh styles added weekly. Free shipping."
        canonical="https://luxemia.shop/new-arrivals"
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">
        {/* Hero Banner */}
        <div className="relative h-64 md:h-96 flex items-center justify-center overflow-hidden">
          <picture className="absolute inset-0 w-full h-full">
            <source srcSet="/images/banners/saree-banner.webp" type="image/webp" />
            <img
              src="/images/banners/saree-banner.jpg"
              alt="New Arrivals Collection"
              className="absolute inset-0 w-full h-full object-cover object-center"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          <div className="relative z-10 text-center px-4 text-white">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-xs uppercase tracking-widest text-white/70">Just Landed</span>
            </div>
            <h1 className="font-serif text-3xl lg:text-5xl mb-3">New Arrivals</h1>
            <p className="text-white/80 font-light max-w-md mx-auto text-sm lg:text-base">
              {isLoading
                ? 'Loading the latest styles…'
                : `${totalNew} new ${totalNew === 1 ? 'piece' : 'pieces'} — each category capped at ${MAX_PER_CATEGORY}. Uploads auto-replace the oldest.`
              }
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="border-b border-border/30 bg-background sticky top-[90px] lg:top-[132px] z-30">
          <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const count = tabCounts[cat.key] || 0;
                if (cat.key !== 'all' && count === 0) return null;

                const isActive = activeCategory === cat.key;

                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`
                      shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-all duration-200
                      ${isActive
                        ? 'bg-foreground text-background'
                        : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }
                    `}
                  >
                    {cat.label}
                    {count > 0 && (
                      <span className={`
                        inline-flex items-center justify-center min-w-[16px] h-[16px] rounded-full text-[9px] font-semibold px-1
                        ${isActive ? 'bg-background/20 text-background' : 'bg-background/60 text-muted-foreground'}
                      `}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-sm font-light shrink-0">
                  {currentSort}
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
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-2">No new arrivals in this category yet.</p>
              <p className="text-muted-foreground text-sm">Check back soon — we add fresh styles weekly.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory + sortBy}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.node.id} product={product} index={index} showQuickAdd />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </section>
      </main>

      {/* SEO section — keyword content for Google crawlers */}
      <section className="border-t border-border/50 bg-card/20 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
          <h2 className="font-serif text-xl mb-4">Latest Indian Ethnic Wear — Freshly Arrived at LuxeMia</h2>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Our new arrivals are curated weekly from India's leading fabric markets and artisan workshops. Each new drop includes <strong>bridal lehengas</strong>, <strong>embroidered sarees</strong>, <strong>designer salwar kameez sets</strong>, <strong>party wear anarkalis</strong>, and <strong>men's sherwanis</strong> for upcoming wedding and festive seasons. Pieces are sourced from Surat, Varanasi, Jaipur, and Lucknow — the heart of India's textile industry.
            </p>
            <p>
              Whether you're shopping for a <strong>Diwali outfit</strong>, a <strong>wedding guest look</strong>, or the perfect <strong>bridal ensemble</strong> for a USA or Canada wedding, our new arrivals section is updated regularly with fresh styles at competitive prices. <strong>Free shipping on orders over $350</strong> to the USA, Canada, and Australia.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewArrivals;