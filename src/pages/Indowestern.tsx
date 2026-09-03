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
import ImageCategoryHero from '@/components/collections/ImageCategoryHero';
import CollectionDecisionSupport from '@/components/collections/CollectionDecisionSupport';
import CatalogLoadError from '@/components/collections/CatalogLoadError';
import { getCollectionStandard } from '@/config/collectionStandards';
import { FEATURED_CATEGORY_PRODUCTS } from '@/config/featuredCategoryProducts';
import { RETURN_POLICY_FAQ_ANSWER } from '@/lib/returnPolicyCopy';
import { toCollectionSchemaItems } from '@/lib/collectionSchema';

const indowesternFaqs = [
  {
    question: 'What is included with an Indo-Western product?',
    answer: 'Included pieces vary by design. Review the individual product title and description for the exact garments or accessories included.',
  },
  {
    question: 'How do I choose a size?',
    answer: 'Use the size options and measurements shown on the individual product page. Contact LuxeMia before ordering if you need help comparing the listing to your measurements.',
  },
  {
    question: 'Do you ship Indo-Western outfits in the United States?',
    answer: 'LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. U.S. standard shipping is $14.99 below $199 and free at $199 and above.',
  },
  {
    question: 'Which fabrics and embellishments are available?',
    answer: 'Fabrics, colors, and decorative work differ by product. The individual listing is the source of truth for the exact material and details of each available style.',
  },
  {
    question: 'Can I return an Indo-Western outfit?',
    answer: RETURN_POLICY_FAQ_ANSWER,
  },
];

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const Indowestern = () => {
  const { products, isLoading, error } = useShopifyProducts('indowestern');
  const [sortBy, setSortBy] = useState('featured');

  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);

  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';
  const collectionItems = toCollectionSchemaItems(sortedProducts);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Buy Indo-Western Dresses Online | Fusion Indian Outfits | LuxeMia"
        description="Browse currently listed Indo-Western and fusion outfits at LuxeMia. Compare exact product details, sizes, prices and availability, with tracked shipping to seven supported countries."
        canonical="https://luxemia.shop/indowestern"
        type="collection"
        collection={!isLoading && !error && collectionItems.length > 0
          ? { name: 'Indo-Western Outfits', description: 'Current LuxeMia Indo-Western and fusion outfit listings.', items: collectionItems }
          : undefined}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Indo-Western', url: '/indowestern' },
        ]}
        faqs={indowesternFaqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">
        {/* Hero Banner */}
        <ImageCategoryHero
          image={FEATURED_CATEGORY_PRODUCTS.indowestern.image}
          imageWebp={FEATURED_CATEGORY_PRODUCTS.indowestern.imageWebp}
          alt={FEATURED_CATEGORY_PRODUCTS.indowestern.alt}
          eyebrow="Fusion Fashion"
          title="Indo-Western"
          description={getCollectionStandard('/indowestern')?.directAnswer || 'Browse the Indo-Western and fusion styles currently available.'}
        />

        {/* Keyword-rich intro — helps Google understand page topic */}
        <div className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Compare embroidered Indo-Western dresses and fusion wedding-guest outfits for receptions, sangeet, mehendi, and office Diwali parties. Open the exact listing for its fabric, embellishment, included pieces, sizes, and availability. LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius; U.S. standard shipping is $14.99 below $199 and free at $199 and above, while the other destinations use the rates and thresholds on the Shipping page.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-border/30 bg-background sticky top-[90px] lg:top-[132px] z-30">
          <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading…' : error ? 'Inventory unavailable' : `${sortedProducts.length} styles`}
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
          ) : error ? (
            <CatalogLoadError retryHref="/indowestern" />
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-light mb-4">No Indo-Western styles available right now.</p>
              <p className="text-sm text-muted-foreground">Browse another current collection or use the contact page for product questions.</p>
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
        {!error ? <CollectionDecisionSupport path="/indowestern" products={sortedProducts} isLoading={isLoading} showFaqs={false} /> : null}
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
