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

const haldiOutfitFaqs = [
  {
    question: 'How should I choose a color for a haldi ceremony?',
    answer: 'Follow the invitation and ask the couple, host, or family when a palette is unclear. Customs and event themes vary, so LuxeMia does not apply a universal color rule.',
  },
  {
    question: 'Which products appear in this haldi collection?',
    answer: 'This page shows currently available products whose catalog title, product type, or tags explicitly mention haldi or turmeric. Open the exact product page to confirm fabric, work, included pieces, sizes, and availability.',
  },
  {
    question: 'How do I choose between a lehenga, suit, and saree?',
    answer: 'Compare the exact listing for fabric, included pieces, work, size options, measurements, and availability. Choose the silhouette that fits the event guidance and activities.',
  },
  {
    question: 'How do I confirm what comes with an outfit?',
    answer: 'Use the included-pieces details and images on the exact product page. Jewelry and accessories are not included unless the listing explicitly says so.',
  },
  {
    question: 'Do you ship haldi ceremony outfits to the USA and the United States?',
    answer: 'LuxeMia ships haldi ceremony outfits to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. U.S. standard shipping is free at $199 and above and $14.99 below $199; the other destinations use the rates and thresholds on the Shipping page. Confirm timing before ordering for a fixed wedding date.',
  },
];

// Keep the rendered grid aligned with the catalog-backed server filter.
const HALDI_COLOR_KEYWORDS = /\b(yellow|gold|mustard|pastel|turmeric|marigold|canary|sunflower|amber|saffron)\b/i;
const HALDI_TAG_KEYWORDS = ['haldi', 'occasion:haldi', 'mehendi haldi', 'mehendi-haldi'];

const HaldiOutfits = () => {
  const { products, isLoading, error } = useShopifyProducts('occasion:haldi');
  const [sortBy, setSortBy] = useState('featured');

  // Filter products with haldi-related tags OR yellow/gold/pastel colors
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const tags = (p.node.tags ?? []).map((t: string) => t.toLowerCase());
      const title = (p.node.title ?? '').toLowerCase();
      // Match haldi-specific tags
      if (tags.some((t: string) => HALDI_TAG_KEYWORDS.some(ht => t.includes(ht)))) return true;

      // Match yellow/gold/pastel color keywords in tags
      if (tags.some((t: string) => HALDI_COLOR_KEYWORDS.test(t))) return true;

      // Match yellow/gold/pastel color keywords in title
      if (HALDI_COLOR_KEYWORDS.test(title)) return true;

      return false;
    });
  }, [products]);

  const sortedProducts = useMemo(() => sortProducts(filteredProducts, sortBy), [filteredProducts, sortBy]);
  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';
  const collectionItems = toCollectionSchemaItems(sortedProducts);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Haldi Ceremony Outfits — Current Listings | LuxeMia"
        description="Browse currently available LuxeMia products explicitly marked for haldi or turmeric. Review exact product details and U.S. shipping terms."
        canonical="https://luxemia.shop/collections/haldi-outfits"
        type="collection"
        collection={!isLoading && !error && collectionItems.length > 0
          ? { name: 'Haldi Ceremony Outfits', description: 'Current LuxeMia products explicitly marked for Haldi or turmeric.', items: collectionItems }
          : undefined}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Occasions', url: '/collections' },
          { name: 'Haldi Outfits', url: '/collections/haldi-outfits' },
        ]}
        faqs={haldiOutfitFaqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">

        {/* Hero */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Pre-Wedding Celebrations</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Haldi Ceremony Outfits</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
              Browse currently available products explicitly marked in the catalog for haldi or turmeric. Each product page is the source of truth for fabric, work, included pieces, sizes, price, and availability. LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius.
            </p>
          </div>
        </div>

        {/* Keyword intro */}
        <div className="bg-background border-b border-border/20 py-5">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Products appear here only when their current catalog title, product type, or tags explicitly mention haldi or turmeric. Review the exact listing before ordering.
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
                  Sort: {currentSort} <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map(opt => (
                  <DropdownMenuItem key={opt.value} onClick={() => setSortBy(opt.value)} className={sortBy === opt.value ? 'font-medium' : ''}>
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
            <CatalogLoadError retryHref="/collections/haldi-outfits" />
          ) : sortedProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            >
              {sortedProducts.map((product, index) => (
                <ProductCard key={product.node.id} product={product} index={index} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-sm mb-4">No haldi-specific items available right now. Browse our full collections for yellow and gold outfits.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/lehengas"><Button variant="outline" size="sm">Shop Lehengas</Button></Link>
                <Link to="/sarees"><Button variant="outline" size="sm">Shop Sarees</Button></Link>
                <Link to="/suits"><Button variant="outline" size="sm">Shop Suits</Button></Link>
              </div>
            </div>
          )}
        </section>

        {!error ? <CollectionDecisionSupport path="/collections/haldi-outfits" products={sortedProducts} isLoading={isLoading} showFaqs={false} /> : null}

        {/* About section — editorial content targeting keywords */}
        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="font-serif text-2xl mb-6 text-center">Haldi Ceremony Outfit Guide</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>Use the invitation and host guidance for dress code, color, and formality. Haldi event formats vary, so ask the couple, host, or family when a detail is unclear.</p>
              <p>Compare the current listings above by fabric, included pieces, work, size options, measurements, price, and availability. The collection name does not add tailoring, jewelry, or accessories that the exact listing does not state.</p>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Check the Exact Listing</h3>
                <p>Product images and listed options are authoritative. Contact LuxeMia before ordering if the supplied pieces, measurements, or timing are unclear.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Color Guidance</h3>
                <p>Do not rely on a universal color rule. Follow the invitation and ask the host or family when a requested palette is unclear.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">When to Order Your Haldi Outfit</h3>
                <p>For a fixed event or festival date, review the selected product and options, then contact LuxeMia before ordering to confirm timing. LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. When tracking is issued, carrier scans can appear after label creation.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Related Pages</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><Link to="/collections/mehendi-outfits" className="text-primary underline">Mehendi Ceremony Outfits</Link></li>
                  <li><Link to="/collections/wedding-guest-outfits" className="text-primary underline">Wedding Guest Outfits</Link></li>
                  <li><Link to="/lehengas" className="text-primary underline">Shop Lehengas</Link> | <Link to="/suits" className="text-primary underline">Shop Suits</Link> | <Link to="/sarees" className="text-primary underline">Shop Sarees</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">More Wedding Occasion Outfits</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/collections/mehendi-outfits"><Button variant="outline" size="sm">Mehendi Outfits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Anarkali Suits</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Sarees</Button></Link>
              <Link to="/collections/diwali-outfits"><Button variant="outline" size="sm">Diwali Outfits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions — Haldi Ceremony Outfits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {haldiOutfitFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-background border border-border rounded-lg px-5">
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <RelatedOccasions currentOccasion="haldi" />

      <Footer />
    </div>
  );
};

export default HaldiOutfits;
