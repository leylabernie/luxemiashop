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
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import { sortProducts } from '@/lib/productFilters';
import type { ShopifyProduct } from '@/lib/shopify';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const indianWeddingDressesSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/indian-wedding-dresses'));

const indianWeddingDressIntentPattern = /\b(indian\s?wedding|wedding\s?dress|wedding\s?outfit|bridal\s?dress|bride|bridal|south\s?asian\s?wedding|wedding\s?guest|reception|sangeet|mehendi|haldi|engagement|ceremony|cocktail|lehenga|lehenga\s?choli|saree|sari|saree\s?gown|gown|anarkali|sharara|gharara|salwar|kameez|palazzo|indo.?western|fusion|festive|occasion|embroider|embroidered|embroidery|sequins?|zari|zardozi|mirror|silk|banarasi|georgette|chiffon|organza|net|velvet|dupatta)\b/i;
const menswearIntentPattern = /\b(sherwani|kurta\s?pajama|pyjama|men'?s|menswear|groom|groomsmen|jodhpuri|modi\s?jacket|nehru\s?jacket|bandi|pathani|achkan|boys|for\s?men)\b/i;

const getSearchText = (product: ShopifyProduct): string => {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.productType,
    product.node.description,
    ...tags,
  ].filter(Boolean).join(' ');
};

const indianWeddingDressFaqs = [
  {
    question: 'What are Indian wedding dresses?',
    answer: 'Indian wedding dresses include lehengas, sarees, Anarkali suits, sharara sets, saree gowns, embroidered gowns, and Indo Western wedding styles selected for Indian and South Asian wedding events. The right outfit depends on the ceremony, role, dress code, fabric, embellishment level, and comfort for a long celebration.',
  },
  {
    question: 'Which Indian wedding dress works best for brides and guests?',
    answer: 'Brides often choose heavier bridal lehengas, wedding sarees, or reception gowns, while guests may prefer lighter lehengas, sarees, Anarkali suits, shararas, saree gowns, or Indo Western dresses. The best choice should match the event formality without feeling too heavy for the role.',
  },
  {
    question: 'Can I wear the same Indian wedding outfit for sangeet, reception, or engagement?',
    answer: 'Often, yes. A polished lehenga, saree gown, Anarkali, sharara, or Indo Western dress can work across sangeet, reception, engagement, and cocktail events when styled with different jewelry, shoes, dupatta draping, and hair. For daytime ceremonies, shoppers usually choose lighter fabric and movement-friendly silhouettes.',
  },
  {
    question: 'What colors are popular for Indian wedding dresses?',
    answer: 'Popular Indian wedding dress colors include red, maroon, wine, gold, ivory, blush, pink, emerald, navy, teal, champagne, and soft pastels. Brides may prefer richer ceremonial colors, while wedding guests often choose jewel tones, pastels, metallics, or lighter embroidered styles.',
  },
  {
    question: 'How do I choose an Indian wedding dress online?',
    answer: 'Start with your event, role, venue, time of day, measurements, sleeve and neckline comfort, fabric weight, embellishment level, stitching needs, and delivery timing. Review product photos, sizing notes, blouse or dupatta details, and care instructions before ordering for a wedding date.',
  },
  {
    question: 'Does LuxeMia carry South Asian wedding dresses for different events?',
    answer: 'Yes. LuxeMia curates South Asian wedding dresses across lehengas, sarees, suits, gowns, shararas, and Indo Western styles for ceremonies, sangeet nights, receptions, engagements, mehendi events, and wedding guest shopping.',
  },
];

const IndianWeddingDresses = () => {
  const { products, isLoading } = useShopifyProducts();
  const [sortBy, setSortBy] = useState('featured');

  const nonMenswearProducts = useMemo(
    () => products.filter(product => !menswearIntentPattern.test(getSearchText(product))),
    [products]
  );
  const indianWeddingDressMatches = useMemo(
    () => nonMenswearProducts.filter(product => indianWeddingDressIntentPattern.test(getSearchText(product))),
    [nonMenswearProducts]
  );
  const isUsingFallback = !isLoading && nonMenswearProducts.length > 0 && indianWeddingDressMatches.length < 8;
  const indianWeddingDressProducts = isUsingFallback ? nonMenswearProducts : indianWeddingDressMatches;
  const sortedProducts = useMemo(() => sortProducts(indianWeddingDressProducts, sortBy), [indianWeddingDressProducts, sortBy]);
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
        {...indianWeddingDressesSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Indian Wedding Dresses', url: '/collections/indian-wedding-dresses' },
        ]}
        collection={{
          name: 'Indian Wedding Dresses',
          description: 'Indian wedding dresses collection for Indian wedding outfits, Indian bridal dresses, South Asian wedding dresses, Indian wedding guest dresses, reception dresses, sangeet outfits, engagement outfits, lehengas, sarees, Anarkalis, shararas, gowns, and Indo Western wedding styles.',
          items: collectionItems,
        }}
        faqs={indianWeddingDressFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">South Asian Wedding Edit</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Indian Wedding Dresses</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop Indian wedding dresses for ceremonies, receptions, sangeet nights, mehendi events, engagements, and wedding guest looks. This LuxeMia edit brings together Indian wedding outfits, Indian bridal dresses, South Asian wedding dresses, Indian wedding guest dresses, lehengas, sarees, Anarkalis, shararas, gowns, and Indo Western wedding styles.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>Indian wedding dresses</strong>, <strong>Indian wedding outfits</strong>, <strong>Indian bridal dresses</strong>, <strong>Indian wedding guest dresses</strong>, <strong>South Asian wedding dresses</strong>, <strong>Indian reception dresses</strong>, <strong>Indian sangeet outfits</strong>, <strong>Indian engagement outfits</strong>, and wedding-ready lehenga, saree, Anarkali, sharara, gown, and Indo Western styles. For guest-specific styling, visit <Link to="/collections/wedding-guest-dresses" className="text-foreground underline underline-offset-2">guest wedding dresses</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} Indian wedding dresses`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing broader occasion wear while Indian wedding dress product signals are limited.
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
                <h3 className="font-serif text-2xl mb-4">Indian Wedding Dresses Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The Indian wedding dress edit is being curated. Explore wedding guest outfits, wedding lehengas, wedding sarees, and reception outfits for event-ready styles.
                </p>
                <Button asChild variant="outline">
                  <Link to="/collections/wedding-guest-outfits">Explore Wedding Guest Outfits</Link>
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Indian Wedding Dress Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for wedding intent</h3>
                <p>
                  This page is focused on Indian wedding dresses rather than a single silhouette. It brings together lehengas, sarees, Anarkali suits, sharara sets, gowns, saree gowns, and Indo Western dresses for South Asian wedding shopping.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Ceremony, sangeet, and reception aware</h3>
                <p>
                  Wedding shoppers compare outfit weight, embroidery, fabric, color, movement, sleeve comfort, dupatta styling, and delivery timing across ceremonies, sangeet nights, receptions, engagements, and mehendi events.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">For brides, family, and guests</h3>
                <p>
                  Indian bridal dresses can lean ornate and ceremonial, while Indian wedding guest dresses often balance polish, comfort, and celebration-ready detail. This collection keeps both discovery paths close to the shopping grid.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Online wedding support</h3>
                <p>
                  LuxeMia supports wedding shoppers in the USA, Canada, Australia, and worldwide with tracked shipping, fit options where available, and styling guidance before purchase. Review measurements, stitching, and delivery details before ordering for a wedding date.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Indian Wedding Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/collections/wedding-lehengas"><Button variant="outline" size="sm">Wedding Lehengas</Button></Link>
              <Link to="/collections/bridal-lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/collections/wedding-sarees"><Button variant="outline" size="sm">Wedding Sarees</Button></Link>
              <Link to="/collections/wedding-guest-dresses"><Button variant="outline" size="sm">Guest Wedding Dresses</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/saree-gowns"><Button variant="outline" size="sm">Saree Gowns</Button></Link>
              <Link to="/collections/anarkali-gowns"><Button variant="outline" size="sm">Anarkali Gowns</Button></Link>
              <Link to="/collections/sharara-suits"><Button variant="outline" size="sm">Sharara Suits</Button></Link>
              <Link to="/collections/indo-western-dresses"><Button variant="outline" size="sm">Indo Western Dresses</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Indian Wedding Dresses</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {indianWeddingDressFaqs.map((faq, i) => (
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

export default IndianWeddingDresses;
