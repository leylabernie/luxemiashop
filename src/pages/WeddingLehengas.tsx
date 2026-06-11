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

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const weddingLehengasSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/wedding-lehengas'));

const weddingLehengaFaqs = [
  {
    question: 'What is a wedding lehenga?',
    answer: 'A wedding lehenga is an Indian lehenga choli chosen for wedding ceremonies, receptions, sangeet nights, mehendi events, engagements, and family celebrations. Brides may choose heavier embroidered styles, while wedding guests often prefer lighter Indian wedding lehengas that are easier to wear through long events.',
  },
  {
    question: 'Are wedding lehengas only for brides?',
    answer: 'No. Wedding lehengas include bridal lehengas for the bride and bridal-adjacent lehenga styles for sisters, bridesmaids, cousins, mothers, and wedding guests. The right choice depends on the event, dress code, color, embroidery level, and how formal the celebration is.',
  },
  {
    question: 'Can I wear a wedding lehenga to a reception or sangeet?',
    answer: 'Yes. Reception lehengas and sangeet lehengas are popular for Indian wedding events because they feel festive and polished. For dancing or evening events, shoppers often choose georgette, net, silk blends, sequins, mirror work, or embroidered lehengas with lighter dupattas.',
  },
  {
    question: 'How do I choose an Indian wedding lehenga online?',
    answer: 'Start with the event, role, comfort level, color palette, fabric, blouse coverage, dupatta styling, embroidery weight, sizing, stitching options, and delivery timeline. Review product photos and measurements before ordering, especially when shopping for a specific wedding date.',
  },
  {
    question: 'Which wedding lehenga colors are popular?',
    answer: 'Classic wedding lehenga colors include red, maroon, wine, gold, ivory, blush, emerald, pink, and champagne. Brides often choose richer ceremonial colors, while wedding guests and reception shoppers may choose pastels, jewel tones, metallics, or lighter embroidered styles.',
  },
  {
    question: 'Does LuxeMia ship wedding lehengas internationally?',
    answer: 'Yes. LuxeMia supports shoppers in the USA, Canada, Australia, and worldwide with tracked shipping, fit options where available, and styling support before purchase. Check each product listing for sizing, stitching, and delivery details before ordering.',
  },
];

const WeddingLehengas = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('wedding-lehengas');
  const [sortBy, setSortBy] = useState('featured');

  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
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
        {...weddingLehengasSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Wedding Lehengas', url: '/collections/wedding-lehengas' },
        ]}
        collection={{
          name: 'Wedding Lehengas',
          description: 'Wedding lehenga collection for Indian wedding lehengas, bridal-adjacent lehenga choli, reception lehengas, sangeet lehengas, and wedding guest lehenga shopping.',
          items: collectionItems,
        }}
        faqs={weddingLehengaFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Indian Wedding Lehenga Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Wedding Lehengas</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop wedding lehengas for Indian wedding ceremonies, receptions, sangeet nights, mehendi events, engagements, and wedding guest looks. This LuxeMia collection focuses on Indian wedding lehengas, bridal-adjacent lehenga choli styles, reception lehengas, embroidered lehengas, silk lehengas, and event-ready wedding outfits.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>wedding lehengas</strong>, <strong>Indian wedding lehengas</strong>, <strong>bridal-adjacent lehenga choli</strong>, <strong>reception lehengas</strong>, <strong>sangeet lehengas</strong>, <strong>wedding guest lehengas</strong>, and <strong>embroidered wedding outfits</strong>. For the full category, visit the <Link to="/lehengas" className="text-foreground underline underline-offset-2">lehenga collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} wedding-ready lehengas`}
              </p>
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
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="font-serif text-2xl mb-4">Wedding Lehengas Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The wedding lehenga edit is being curated. Explore all lehengas for bridal, reception, sangeet, party wear, and wedding guest styles.
                </p>
                <Button asChild variant="outline">
                  <Link to="/lehengas">Explore All Lehengas</Link>
                </Button>
              </div>
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Wedding Lehenga Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for wedding shopping</h3>
                <p>
                  This page is focused on wedding lehenga intent rather than every lehenga style. It highlights Indian wedding lehengas for brides, bridesmaids, sisters, cousins, family members, and wedding guests.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Ceremony, reception, and guest ready</h3>
                <p>
                  Wedding shoppers often compare embroidery, skirt volume, blouse coverage, dupatta styling, comfort, and delivery timing. This collection keeps bridal-adjacent, reception, sangeet, and wedding guest decisions close to the shopping path.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Fabric and work aware</h3>
                <p>
                  Silk, velvet, net, georgette, Banarasi, zari, sequins, mirror work, thread embroidery, and zardozi can all shape how formal a wedding lehenga feels. Choose heavier details for ceremonies and lighter movement-friendly styles for receptions or sangeet nights.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Online wedding support</h3>
                <p>
                  LuxeMia supports wedding shoppers in the USA, Canada, Australia, and worldwide with tracked shipping, fit options where available, and styling guidance before purchase. Review sizing, stitching, and delivery details before ordering for a wedding date.
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
              <Link to="/collections/bridal-lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/party-wear-lehengas"><Button variant="outline" size="sm">Party Wear Lehengas</Button></Link>
              <Link to="/collections/wedding-sarees"><Button variant="outline" size="sm">Wedding Sarees</Button></Link>
              <Link to="/collections/mehendi-outfits"><Button variant="outline" size="sm">Mehendi Outfits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Wedding Lehengas</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {weddingLehengaFaqs.map((faq, i) => (
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

export default WeddingLehengas;
