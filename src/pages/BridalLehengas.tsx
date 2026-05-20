import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { metadataToSEOHeadProps } from '@/lib/seoHeadAdapter';
import { getStaticPageMetadata } from '@/lib/seoMetadata';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useShopifyPaginatedProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import { sortProducts } from '@/lib/productFilters';
import type { ShopifyProduct } from '@/lib/shopify';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const bridalLehengasSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/bridal-lehengas'));

const bridalIntentPattern = /\b(bridal|bride|wedding|wedding wear|weddingwear|dulhan|designer|embroider|embroidered|zari|zardozi|sequins?|mirror|velvet|silk|net|heavy|reception|engagement|sangeet)\b/i;

const getSearchText = (product: ShopifyProduct): string => {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.productType,
    product.node.description,
    ...tags,
  ].filter(Boolean).join(' ');
};

const bridalLehengaFaqs = [
  {
    question: 'What type of bridal lehenga should I choose for an Indian wedding?',
    answer: 'Choose your bridal lehenga based on the ceremony, venue, season, and how formal the event is. Heavily embroidered silk, velvet, or net lehengas work well for the wedding ceremony, while lighter georgette or sequined styles can suit engagement, sangeet, or reception events. Red, maroon, ivory, blush, emerald, and gold are popular bridal directions.',
  },
  {
    question: 'Are bridal lehengas suitable for reception or engagement events?',
    answer: 'Yes. Many bridal lehengas can be styled for engagement, reception, or sangeet events depending on color, embroidery, and jewelry. A heavily traditional red or maroon lehenga usually feels most bridal, while pastel, ivory, metallic, or sequined lehengas often work beautifully for reception and engagement looks.',
  },
  {
    question: 'Can bridal lehengas be customized or altered?',
    answer: 'LuxeMia supports fit options such as unstitched, semi-stitched, ready-to-wear, and made-to-measure where available on the product. For bridal shopping, review the product options carefully and contact LuxeMia before ordering if you need styling or sizing guidance.',
  },
  {
    question: 'What colors are popular for Indian bridal lehengas?',
    answer: 'Classic Indian bridal lehenga colors include red, maroon, wine, gold, and deep pink. Modern brides also choose ivory, blush, champagne, emerald, sage, and pastel tones for wedding, engagement, or reception events. The best color depends on the ceremony, family preference, skin tone, and styling plan.',
  },
  {
    question: 'How should I choose a bridal lehenga online?',
    answer: 'Check fabric, embroidery, blouse and dupatta details, size options, delivery timing, return policy, and product photos before ordering. Compare the lehenga against your wedding timeline and ceremony needs. If your event date is close, prioritize ready-to-wear or clearly available options and ask for sizing help before purchase.',
  },
];

const BridalLehengas = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('lehengas');
  const [sortBy, setSortBy] = useState('featured');

  const bridalMatches = useMemo(
    () => products.filter(product => bridalIntentPattern.test(getSearchText(product))),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && bridalMatches.length < 8;
  const bridalProducts = isUsingFallback ? products : bridalMatches;
  const sortedProducts = useMemo(() => sortProducts(bridalProducts, sortBy), [bridalProducts, sortBy]);
  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';

  const collectionItems = sortedProducts.slice(0, 30).map(p => ({
    id: p.node.id,
    name: p.node.title,
    url: p.node.handle,
    image: p.node.images.edges[0]?.node.url || '',
    price: p.node.priceRange.minVariantPrice.amount,
    currency: p.node.priceRange.minVariantPrice.currencyCode,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        {...bridalLehengasSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Bridal Lehengas', url: '/collections/bridal-lehengas' },
        ]}
        collection={{
          name: 'Bridal Lehengas for Indian Weddings',
          description: 'Bride-focused collection of Indian bridal lehengas, wedding lehenga choli sets, and embroidered designer lehengas for ceremony, engagement, reception, and sangeet shopping.',
          items: collectionItems,
        }}
        faqs={bridalLehengaFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Bride-Focused Wedding Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Bridal Lehengas for Indian Weddings</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop Indian bridal lehengas selected for brides planning wedding, engagement, reception, sangeet, and ceremony looks. This collection focuses on bridal lehenga choli styles with wedding-ready embroidery, rich fabrics, and sizing options for brides shopping online from the USA, Canada, Australia, and worldwide.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>Indian bridal lehengas</strong>, <strong>wedding lehenga choli</strong> sets, <strong>embroidered bridal lehengas</strong>, and <strong>designer bridal lehengas online</strong>. For broader festive and partywear styles, visit the full <Link to="/lehengas" className="text-foreground underline underline-offset-2">lehenga collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} bridal-ready styles`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all lehengas while bridal product signals are limited.
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort: {currentSort} <ChevronDown className="h-4 w-4 ml-2" />
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

        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-serif text-2xl mb-6 text-center">How This Bridal Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for the bride</h3>
                <p>
                  This page is focused on bridal shopping intent, not every lehenga occasion. It highlights wedding lehenga choli options for the bride, including ceremony, engagement, sangeet, and reception-ready looks.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Wedding-ready details</h3>
                <p>
                  Bridal shoppers often compare embroidery, fabric, dupatta styling, blouse fit, color, and delivery timing. LuxeMia brings these considerations into one focused collection path for Indian wedding planning.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Styles, fabrics, and work</h3>
                <p>
                  Look for bridal directions such as silk, velvet, net, georgette, zari, sequins, mirror work, thread embroidery, and heavier wedding silhouettes. Availability depends on the live Shopify product catalog.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Online bridal shopping support</h3>
                <p>
                  LuxeMia serves brides and families shopping from abroad with tracked shipping, fit options where available, and styling support before purchase. Review each product's sizing and fulfillment details before ordering.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Wedding Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/lehengas"><Button variant="outline" size="sm">All Lehengas</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/mehendi-outfits"><Button variant="outline" size="sm">Mehendi Outfits</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Sarees</Button></Link>
              <Link to="/menswear"><Button variant="outline" size="sm">Menswear</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Bridal Lehengas</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {bridalLehengaFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-background border border-border rounded-lg px-5">
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BridalLehengas;
