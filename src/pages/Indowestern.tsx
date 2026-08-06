import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import { sortProducts } from '@/lib/productFilters';

const indowesternFaqs = [
  {
    question: 'What is included with an Indo-Western product?',
    answer: 'Included pieces vary by design. Review the individual product title and description for the exact garments or accessories included.',
  },
  {
    question: 'How do I choose a size?',
    answer: 'Use the size options and measurements shown on the individual product page. Contact our U.S.-based support before ordering if you need help comparing the listing to your measurements.',
  },
  {
    question: 'Do you ship Indo-Western outfits in the United States?',
    answer: 'Yes. LuxeMia currently ships to United States addresses only. Shipping is $12 for orders below $150 and free at $150 and above. Tracking is emailed after dispatch.',
  },
  {
    question: 'Which fabrics and embellishments are available?',
    answer: 'Fabrics, colors, and decorative work differ by product. The individual listing is the source of truth for the exact material and details of each available style.',
  },
  {
    question: 'Can I return an Indo-Western outfit?',
    answer: 'All sales are final. For genuine shipping damage, an incorrect item, or a missing item, contact LuxeMia within 48 hours of delivery with clear photos and a continuous unboxing/opening video showing the unopened package, shipping label, and item condition.',
  },
];

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const Indowestern = () => {
  const { products, isLoading } = useShopifyProducts('indowestern');
  const [sortBy, setSortBy] = useState('featured');

  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);

  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Buy Indo-Western Dresses Online | Fusion Indian Outfits USA | LuxeMia"
        description="Browse currently listed Indo-Western and fusion outfits at LuxeMia. See exact product details, sizes, prices and availability. Free U.S. shipping at $150 and above; $12 below."
        canonical="https://luxemia.shop/indowestern"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Indo-Western', url: '/indowestern' },
        ]}
        faqs={indowesternFaqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">
        {/* Hero Banner */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Fusion Fashion</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-3">Indo-Western</h1>
            <p className="text-muted-foreground font-light max-w-xl mx-auto text-sm lg:text-base">
              Browse the Indo-Western and fusion styles currently available. Each listing shows the exact design, included pieces, size options, price, and availability.
            </p>
          </div>
        </div>

        {/* Keyword-rich intro — helps Google understand page topic */}
        <div className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Compare the live collection using the product cards below, then open a listing for its exact fabric, color, embellishment, included pieces, sizes, and availability. LuxeMia ships to U.S. addresses for $12 on orders below $150 and free at $150 and above.
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
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-light mb-4">No Indo-Western styles available right now.</p>
              <p className="text-sm text-muted-foreground">Check back soon — new fusion pieces arrive regularly.</p>
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

      {/* FAQ Section */}
      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions — Indo-Western Fashion</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {indowesternFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-background border border-border rounded-lg px-5">
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Indowestern;
