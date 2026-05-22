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

const shararaSuitsSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/sharara-suits'));

const shararaSuitIntentPattern = /\b(sharara|shararah|gharara|garara|set|sets|suit|suits|salwar|kameez|pakistani|designer|wedding|party|party wear|partywear|festive|festival|eid|nikah|mehendi|sangeet|embroider|embroidered|embroidery|sequins?|zari|georgette|silk|chiffon|net|organza|ethnic)\b/i;

const getSearchText = (product: ShopifyProduct): string => {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.productType,
    product.node.description,
    ...tags,
  ].filter(Boolean).join(' ');
};

const shararaSuitFaqs = [
  {
    question: 'What is a sharara suit?',
    answer: 'A sharara suit is a South Asian outfit that usually includes a kurta or kameez, a dupatta, and wide-legged sharara bottoms that flare from the knee or upper leg. Sharara sets are popular for weddings, Eid, mehendi, sangeet, nikah events, parties, and festive celebrations.',
  },
  {
    question: 'Are sharara suits good for weddings?',
    answer: 'Yes. Wedding sharara suits are a strong option for guests, bridesmaids, family members, and pre-wedding events. Embroidered sharara suits, Pakistani sharara suits, silk sharara sets, georgette sharara suits, and heavier party wear sharara suits can work well for mehendi, sangeet, reception, nikah, and ceremony looks.',
  },
  {
    question: 'What is the difference between sharara suits and gharara suits?',
    answer: 'Sharara suits usually have wide-legged bottoms with a flowing flare, while gharara suits often have a more defined seam or flare around the knee. Both silhouettes are festive and are commonly styled with a kurta, dupatta, embroidery, and occasion-ready fabrics.',
  },
  {
    question: 'Which fabrics are common in sharara suits?',
    answer: 'Common sharara suit fabrics include georgette, chiffon, silk, net, organza, crepe, cotton, and blended fabrics. Lighter fabrics work well for daytime festivities, while silk, net, organza, zari, sequins, and embroidered fabrics are useful for weddings and evening events.',
  },
  {
    question: 'Can sharara suits be worn for parties and festivals?',
    answer: 'Yes. Party wear sharara suits and festive sharara outfits are popular for Eid, Diwali, Navratri, engagement parties, mehendi, sangeet, receptions, and family celebrations. Choose embroidery, fabric weight, and dupatta styling based on the formality of the event.',
  },
  {
    question: 'How do I choose sharara suits online?',
    answer: 'Start with the occasion, preferred kurta length, bottom flare, fabric, embroidery level, dupatta, size, stitching needs, and delivery timeline. Review product photos, fabric details, work type, measurements, lining, care notes, and shipping estimates before ordering sharara suits online.',
  },
];

const ShararaSuits = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('suits');
  const [sortBy, setSortBy] = useState('featured');

  const shararaSuitMatches = useMemo(
    () => products.filter(product => shararaSuitIntentPattern.test(getSearchText(product))),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && shararaSuitMatches.length < 8;
  const shararaSuitProducts = isUsingFallback ? products : shararaSuitMatches;
  const sortedProducts = useMemo(() => sortProducts(shararaSuitProducts, sortBy), [shararaSuitProducts, sortBy]);
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
        {...shararaSuitsSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Sharara Suits', url: '/collections/sharara-suits' },
        ]}
        collection={{
          name: 'Sharara Suits',
          description: 'Sharara suits collection for designer sharara suits, sharara sets, wedding sharara suits, party wear sharara suits, Pakistani sharara suits, festive sharara outfits, embroidered sharara suits, and sharara suits online.',
          items: collectionItems,
        }}
        faqs={shararaSuitFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Designer Sharara Suit Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Sharara Suits</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop sharara suits and sharara sets online for weddings, parties, Eid, festivals, mehendi, sangeet, nikah events, receptions, and polished Indian occasion dressing. This collection focuses on designer sharara suits, wedding sharara suits, party wear sharara suits, Pakistani sharara suits, embroidered sharara suits, and festive sharara outfits for shoppers in the USA, Canada, Australia, and worldwide.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>sharara suits</strong>, <strong>designer sharara suits</strong>, <strong>sharara sets</strong>, <strong>wedding sharara suits</strong>, <strong>party wear sharara suits</strong>, <strong>Pakistani sharara suits</strong>, <strong>festive sharara outfits</strong>, <strong>embroidered sharara suits</strong>, and <strong>sharara suits online</strong>. For broader salwar kameez styles, visit the full <Link to="/suits" className="text-foreground underline underline-offset-2">suit collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} sharara suits`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all suits while sharara product signals are limited.
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
                <h3 className="font-serif text-2xl mb-4">Sharara Suits Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The sharara suit edit is being curated. Explore all suits for salwar kameez, Anarkali suits, Pakistani suits, Eid, wedding, and party wear styles.
                </p>
                <Button asChild variant="outline">
                  <Link to="/suits">Explore All Suits</Link>
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Sharara Suit Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for sharara suit intent</h3>
                <p>
                  This page is focused on sharara suits rather than every salwar kameez style. It highlights designer sharara suits, sharara sets, Pakistani sharara suits, embroidered sharara suits, festive sharara outfits, and party wear sharara suits.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Wedding, festive, and party focused</h3>
                <p>
                  Sharara shoppers often compare bottom flare, kurta length, dupatta styling, embroidery, fabric, and delivery timing. This collection keeps those wedding guest, Eid, mehendi, sangeet, reception, and party wear decisions close to the shopping path.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Silhouette and fabric aware</h3>
                <p>
                  Georgette, chiffon, crepe, and cotton sharara sets are useful for lighter celebrations, while silk, net, organza, zari, sequins, and embroidered sharara suits often feel more formal for weddings and evening events.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Online shopping support for NRIs</h3>
                <p>
                  LuxeMia supports shoppers in the USA, Canada, Australia, and worldwide with tracked shipping, stitching options where available, and styling guidance before purchase. Review each product's sizing, stitching, and delivery details before ordering.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Suit and Occasion Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/suits"><Button variant="outline" size="sm">All Suits</Button></Link>
              <Link to="/collections/salwar-kameez"><Button variant="outline" size="sm">Salwar Kameez</Button></Link>
              <Link to="/collections/anarkali-suits"><Button variant="outline" size="sm">Anarkali Suits</Button></Link>
              <Link to="/collections/pakistani-suits"><Button variant="outline" size="sm">Pakistani Suits</Button></Link>
              <Link to="/collections/eid-outfits"><Button variant="outline" size="sm">Eid Outfits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/mehendi-outfits"><Button variant="outline" size="sm">Mehendi Outfits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Sharara Suits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {shararaSuitFaqs.map((faq, i) => (
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

export default ShararaSuits;
