import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RelatedOccasions from '@/components/seo/RelatedOccasions';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import CollectionDecisionSupport from '@/components/collections/CollectionDecisionSupport';
import CatalogLoadError from '@/components/collections/CatalogLoadError';
import { toCollectionSchemaItems } from '@/lib/collectionSchema';
import { sortProducts } from '@/lib/productFilters';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const PRODUCTS_PER_PAGE = 24;
const SCHEMA_PRODUCT_LIMIT = 30;

const weddingGuestFaqs = [
  {
    question: 'How do I choose an outfit for an Indian wedding?',
    answer: 'Use the invitation and the host or family as the source of truth for each event’s dress code, color guidance, and formality. Customs vary. Then compare the exact product listing for included pieces, fabric, sizes, price, and availability.',
  },
  {
    question: 'Which colors should a wedding guest avoid?',
    answer: 'There is no single rule that applies to every Indian wedding. Follow the invitation and ask the couple, host, or family when a color or dress expectation is unclear.',
  },
  {
    question: 'How do I compare a saree and a salwar kameez?',
    answer: 'Compare the dressing method, movement, fabric, included pieces, available sizes, and measurements on each exact listing. Choose a silhouette that fits the event guidance and that you can wear comfortably.',
  },
  {
    question: 'Do you ship Indian wedding guest outfits to the United States?',
    answer: 'LuxeMia ships Indian wedding guest outfits to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. U.S. standard shipping is free at $199 and above and $14.99 below $199; the other destinations use the rates and thresholds on the Shipping page. Confirm timing before ordering for a fixed wedding date.',
  },
  {
    question: 'Can I repeat an outfit at multiple wedding events?',
    answer: 'Ask the host if separate events have different dress codes. If one outfit satisfies the stated guidance for more than one event, repeating it is a personal choice.',
  },
];

const WeddingGuestOutfits = () => {
  const { products, isLoading, error } = useShopifyProducts('occasion:wedding-guest');
  const [sortBy, setSortBy] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
  const visibleProducts = sortedProducts.slice(0, visibleCount);
  const hasMore = visibleProducts.length < sortedProducts.length;
  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';
  const collectionItems = toCollectionSchemaItems(sortedProducts, SCHEMA_PRODUCT_LIMIT);

  const handleSortChange = (nextSort: string) => {
    setSortBy(nextSort);
    setVisibleCount(PRODUCTS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setVisibleCount((currentCount) => Math.min(
      currentCount + PRODUCTS_PER_PAGE,
      sortedProducts.length,
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Indian Wedding Guest Outfits — What to Wear to an Indian Wedding | LuxeMia"
        description="Browse current products explicitly marked for wedding guests, bridesmaids, Sangeet or receptions. Review exact listing details and shipping to seven supported countries."
        canonical="https://luxemia.shop/collections/wedding-guest-outfits"
        type="collection"
        collection={!isLoading && !error
          ? { name: 'Indian Wedding Guest Outfits', description: 'Current products explicitly marked for wedding guests, bridesmaids, sangeet, or receptions.', items: collectionItems }
          : undefined}
        noIndexFollow={!isLoading && !error && sortedProducts.length === 0}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Occasions', url: '/collections' },
          { name: 'Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
        ]}
        faqs={weddingGuestFaqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">

        {/* Hero */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Wedding Season</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Indian Wedding Guest Outfits</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
              Browse currently available products whose catalog title, product type, or tags explicitly mention a wedding-guest role, bridesmaid role, sangeet, or reception. The exact product page is the source of truth for every item. LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius.
            </p>
          </div>
        </div>

        {/* Keyword intro */}
        <div className="bg-background border-b border-border/20 py-5">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Use the invitation and host guidance for dress code, color, and formality. Review each listing for its stated fabric, work, included pieces, size options, measurements, price, and availability.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-border/30 bg-background sticky top-[90px] lg:top-[132px] z-30">
          <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? 'Loading…'
                : error
                  ? 'Current inventory is temporarily unavailable'
                  : `${visibleProducts.length} of ${sortedProducts.length} styles shown`}
            </p>
            {!error ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-sm font-light">
                    Sort: {currentSort} <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {sortOptions.map(opt => (
                    <DropdownMenuItem key={opt.value} onClick={() => handleSortChange(opt.value)} className={sortBy === opt.value ? 'font-medium' : ''}>
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
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
            <CatalogLoadError retryHref="/collections/wedding-guest-outfits" />
          ) : sortedProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            >
              {visibleProducts.map((product, index) => (
                <ProductCard key={product.node.id} product={product} index={index} />
              ))}
            </motion.div>
          ) : (
            <div className="rounded-sm border border-border p-8 text-center">
              <h2 className="font-serif text-xl">No current wedding-guest products available</h2>
              <p className="mt-2 text-sm text-muted-foreground">Check back for confirmed catalog availability.</p>
            </div>
          )}
          {hasMore && !isLoading && !error ? (
            <div className="mt-10 flex justify-center">
              <Button type="button" variant="outline" onClick={handleLoadMore}>
                Load more ({sortedProducts.length - visibleProducts.length} remaining)
              </Button>
            </div>
          ) : null}
        </section>

        {!error ? <CollectionDecisionSupport path="/collections/wedding-guest-outfits" products={sortedProducts} isLoading={isLoading} showFaqs={false} /> : null}

        {/* Ceremony-by-ceremony guide */}
        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="font-serif text-2xl mb-6 text-center">How to Choose a Wedding Guest Outfit</h2>
            <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
              <p>Wedding formats and customs vary by couple, family, community, venue, and event. Treat the invitation and the host or family as the source of truth instead of applying a universal rule.</p>

              <div>
                <h3 className="font-medium text-foreground mb-1">Check the Event Guidance</h3>
                <p>Confirm the ceremony, venue, dress code, and any requested palette. Ask the host when the invitation leaves a detail unclear.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Compare Product Facts</h3>
                <p>Open the exact listing to compare fabric, work, included pieces, sizes, measurements, current price, and availability. The collection name does not imply that tailoring or accessories are included.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Plan for Comfort and Timing</h3>
                <p>Choose a silhouette and footwear that you can wear for the stated activities and venue. For a fixed wedding date, contact LuxeMia before ordering to confirm product timing.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Color Guidance</h3>
                <p>There is no single color rule for every Indian wedding. Follow the invitation and ask the couple, host, or family when a color choice is unclear.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Not Indian? Read This First</h3>
                <p>If you are a non-Indian guest attending your first Indian wedding, an <Link to="/suits" className="text-primary underline">anarkali suit</Link> can be straightforward to wear, while a pre-draped saree offers the saree look without traditional draping. Review the listed sizes and included pieces, and confirm timing before ordering for the wedding date.</p>
                <p className="mt-2">For more ceremony-by-ceremony ideas, read our <Link to="/blog/wedding-guest-outfit-ideas" className="text-primary underline font-medium">Indian wedding guest outfit guide</Link>.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">How Much Should You Spend on an Indian Wedding Guest Outfit?</h3>
                <p>Set your budget before browsing and compare the current prices, product details, included pieces, and available sizes shown on each listing. U.S. shipping is free at $199 and above and costs a flat $14.99 below that.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">When to Order Your Indian Wedding Guest Outfit</h3>
                <p>For a fixed event or festival date, review the selected product and options, then contact LuxeMia before ordering to confirm timing. LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. When tracking is issued, carrier scans can appear after label creation.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Related Guides</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><Link to="/blog/wedding-guest-outfit-ideas" className="text-primary underline">Indian Wedding Guest Outfit Guide 2026</Link></li>
                  <li><Link to="/blog/lehenga-vs-sharara-vs-anarkali-comparison" className="text-primary underline">Lehenga vs Sharara vs Anarkali: Which to Choose</Link></li>
                  <li><Link to="/size-guide" className="text-primary underline">Size Guide — How to Measure for Indian Ethnic Wear</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related collections */}
        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Shop by Wedding Ceremony</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline" size="sm"><Link to="/collections/wedding-guest-lehengas">Wedding-Guest Lehengas</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/collections/wedding-guest-kurta-sets">Wedding-Guest Kurta Sets</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/lehengas">Bridal Lehengas</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/sarees">Silk Sarees</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/suits">Anarkali Suits</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/indowestern">Indo-Western</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/collections/mehendi-outfits">Mehendi Outfits</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/menswear">Menswear</Link></Button>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions — Indian Wedding Guest Outfits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {weddingGuestFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-background border border-border rounded-lg px-5">
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <RelatedOccasions currentOccasion="wedding-guest" />

      <Footer />
    </div>
  );
};

export default WeddingGuestOutfits;
