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

const partyWearLehengasSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/party-wear-lehengas'));

const partyWearIntentPattern = /\b(party|party wear|partywear|cocktail|sangeet|reception|festive|festival|wedding guest|wedding wear|weddingwear|engagement|evening|designer|sequins?|bead|beaded|mirror|embroider|embroidered|metallic|georgette|net|lightweight|fancy)\b/i;

const getSearchText = (product: ShopifyProduct): string => {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.productType,
    product.node.description,
    ...tags,
  ].filter(Boolean).join(' ');
};

const partyWearLehengaFaqs = [
  {
    question: 'What is a party wear lehenga?',
    answer: 'A party wear lehenga is a lehenga choli designed for festive events, wedding guest looks, sangeet nights, cocktail parties, engagement parties, and receptions. These styles are usually lighter and easier to move in than heavy bridal lehengas, with details like sequins, mirror work, embroidery, shimmer, georgette, net, or soft silk.',
  },
  {
    question: 'Can I wear a party wear lehenga to an Indian wedding?',
    answer: 'Yes. Party wear lehengas are a strong choice for Indian wedding guests, sisters, cousins, bridesmaids, and family members. Choose a more embellished designer party lehenga for receptions or sangeet events, and a lighter festive party lehenga for daytime ceremonies, mehendi, or smaller celebrations.',
  },
  {
    question: 'What is the difference between bridal and party wear lehengas?',
    answer: 'Bridal lehengas are usually heavier, more ceremonial, and designed for the bride. Party wear lehengas are typically lighter, easier to repeat, and styled for guests or secondary wedding events. They may still include embroidery, sequins, mirror work, or rich fabrics, but the overall look is less bridal and more event-ready.',
  },
  {
    question: 'Which colors work best for party wear lehengas?',
    answer: 'Party wear lehengas work well in jewel tones, black, navy, wine, emerald, blush, champagne, ivory, gold, silver, pink, and bright festive colors. For cocktail and reception events, metallics and sequins photograph well. For daytime parties, pastels, florals, and lighter embroidered lehengas can feel easier to wear.',
  },
  {
    question: 'How should I choose a party wear lehenga online?',
    answer: 'Start with the event type, venue, comfort level, and delivery timeline. Check fabric, blouse style, dupatta details, work type, sizing options, and product photos. For dancing or long events, lightweight lehengas in georgette, net, chiffon, silk blends, or softer embroidered fabrics are often easier than very heavy bridal styles.',
  },
  {
    question: 'Are party wear lehengas good for sangeet and reception events?',
    answer: 'Yes. Sangeet lehengas and reception party lehengas are popular because they feel festive without being too formal. Look for movement-friendly skirts, secure blouse fits, lighter dupattas, and embellishment such as sequins, beadwork, mirror work, zari, or thread embroidery depending on the dress code.',
  },
];

const PartyWearLehengas = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('lehengas');
  const [sortBy, setSortBy] = useState('featured');

  const partyWearMatches = useMemo(
    () => products.filter(product => partyWearIntentPattern.test(getSearchText(product))),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && partyWearMatches.length < 8;
  const partyWearProducts = isUsingFallback ? products : partyWearMatches;
  const sortedProducts = useMemo(() => sortProducts(partyWearProducts, sortBy), [partyWearProducts, sortBy]);
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
        {...partyWearLehengasSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Party Wear Lehengas', url: '/collections/party-wear-lehengas' },
        ]}
        collection={{
          name: 'Party Wear Lehengas for Indian Events',
          description: 'Party-focused collection of Indian party wear lehengas, party wear lehenga choli sets, cocktail lehengas, sangeet lehengas, reception party lehengas, and wedding guest lehengas.',
          items: collectionItems,
        }}
        faqs={partyWearLehengaFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Party and Festive Lehenga Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Party Wear Lehengas for Indian Events</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop party wear lehengas selected for sangeet nights, cocktail parties, wedding guest looks, festive celebrations, engagement events, and reception parties. This collection focuses on Indian party lehengas, party wear lehenga choli sets, designer party lehengas, embroidered lehengas, sequins lehengas, and lightweight lehengas for event-ready shopping online.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>party wear lehengas</strong>, <strong>party wear lehenga choli</strong> sets, <strong>Indian party lehengas</strong>, <strong>festive party lehengas</strong>, <strong>cocktail lehengas</strong>, <strong>sangeet lehengas</strong>, <strong>reception party lehengas</strong>, and <strong>wedding guest lehengas</strong>. For broader styles, visit the full <Link to="/lehengas" className="text-foreground underline underline-offset-2">lehenga collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} party-ready lehengas`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all lehengas while party wear product signals are limited.
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
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="font-serif text-2xl mb-4">Party Wear Lehengas Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The party wear lehenga edit is being curated. Explore all lehengas for festive, wedding guest, sangeet, and reception-ready styles.
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Party Wear Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for party occasions</h3>
                <p>
                  This page is focused on party wear lehenga intent, not every bridal or ceremonial lehenga. It highlights lehengas for cocktail parties, sangeet nights, receptions, engagement events, festive gatherings, and wedding guest outfits.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Event-ready lehenga details</h3>
                <p>
                  Party wear shoppers often compare comfort, movement, blouse fit, dupatta styling, and sparkle. Look for sequins lehengas, embroidered lehengas, mirror work, georgette, net, silk blends, and lightweight lehengas for longer events.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Guest, sangeet, and reception styling</h3>
                <p>
                  Indian party lehengas can work for wedding guests, bridesmaids, sisters, cousins, and family members. More embellished styles suit reception and cocktail events, while lighter festive party lehengas are useful for daytime celebrations.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Online party wear shopping support</h3>
                <p>
                  LuxeMia supports party wear shoppers with tracked shipping, fit options where available, and styling guidance before purchase. Review each product's sizing, stitching, and delivery details before ordering for a specific event date.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Party Wear Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/lehengas"><Button variant="outline" size="sm">All Lehengas</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/diwali-outfits"><Button variant="outline" size="sm">Diwali Outfits</Button></Link>
              <Link to="/collections/mehendi-outfits"><Button variant="outline" size="sm">Mehendi Outfits</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Party Wear Sarees</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Party Wear Lehengas</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {partyWearLehengaFaqs.map((faq, i) => (
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

export default PartyWearLehengas;
