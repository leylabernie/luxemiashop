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

const ghararaSuitsSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/gharara-suits'));

const ghararaSuitIntentPattern = /\b(gharara|garara|ghararas|ghararah|sharara|set|sets|suit|suits|salwar|kameez|pakistani|designer|wedding|party|party wear|partywear|festive|festival|eid|nikah|mehendi|sangeet|embroider|embroidered|embroidery|sequins?|zari|georgette|silk|chiffon|net|organza|ethnic)\b/i;

const getSearchText = (product: ShopifyProduct): string => {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.productType,
    product.node.description,
    ...tags,
  ].filter(Boolean).join(' ');
};

const ghararaSuitFaqs = [
  {
    question: 'What is a gharara suit?',
    answer: 'A gharara suit is a South Asian outfit that usually includes a kurta or kameez, a dupatta, and gharara bottoms with a distinctive flare around the knee. Gharara sets are popular for weddings, Eid, nikah events, mehendi, sangeet, parties, and festive celebrations.',
  },
  {
    question: 'Are gharara suits good for weddings?',
    answer: 'Yes. Wedding gharara suits are elegant for guests, bridesmaids, family members, and pre-wedding events. Embroidered gharara suits, Pakistani gharara suits, silk gharara sets, georgette gharara suits, and heavier party wear gharara suits can work well for mehendi, sangeet, reception, nikah, and ceremony looks.',
  },
  {
    question: 'What is the difference between gharara suits and sharara suits?',
    answer: 'Gharara suits usually have a more defined flare or seam near the knee, while sharara suits often have wider flowing bottoms with a softer flare. Both silhouettes are festive and are commonly styled with a kurta, dupatta, embroidery, and occasion-ready fabrics.',
  },
  {
    question: 'Which fabrics are common in gharara suits?',
    answer: 'Common gharara suit fabrics include georgette, chiffon, silk, net, organza, crepe, cotton, and blended fabrics. Lighter fabrics work well for daytime festivities, while silk, net, organza, zari, sequins, and embroidered fabrics are useful for weddings and evening events.',
  },
  {
    question: 'Can gharara suits be worn for parties and festivals?',
    answer: 'Yes. Party wear gharara suits and festive gharara outfits are popular for Eid, Diwali, Navratri, engagement parties, mehendi, sangeet, receptions, and family celebrations. Choose embroidery, fabric weight, and dupatta styling based on the formality of the event.',
  },
  {
    question: 'How do I choose gharara suits online?',
    answer: 'Start with the occasion, preferred kurta length, bottom flare, fabric, embroidery level, dupatta, size, stitching needs, and delivery timeline. Review product photos, fabric details, work type, measurements, lining, care notes, and shipping estimates before ordering gharara suits online.',
  },
];

const GhararaSuits = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('suits');
  const [sortBy, setSortBy] = useState('featured');

  const ghararaSuitMatches = useMemo(
    () => products.filter(product => ghararaSuitIntentPattern.test(getSearchText(product))),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && ghararaSuitMatches.length < 8;
  const ghararaSuitProducts = isUsingFallback ? products : ghararaSuitMatches;
  const sortedProducts = useMemo(() => sortProducts(ghararaSuitProducts, sortBy), [ghararaSuitProducts, sortBy]);
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
        {...ghararaSuitsSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Gharara Suits', url: '/collections/gharara-suits' },
        ]}
        collection={{
          name: 'Gharara Suits',
          description: 'Gharara suits collection for designer gharara suits, gharara sets, wedding gharara suits, party wear gharara suits, Pakistani gharara suits, festive gharara outfits, embroidered gharara suits, and gharara suits online.',
          items: collectionItems,
        }}
        faqs={ghararaSuitFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">USA-Based Indian Boutique</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Buy Gharara Suits Online | LuxeMia Boutique</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Explore our curated range of gharara suits and gharara sets online, perfect for weddings, Nikah, and Mehendi ceremonies. LuxeMia Boutique specializes in Pakistani gharara suits and designer gharara sets, quality-checked and shipped directly to the USA, Canada, and Australia. Enjoy authentic craftsmanship with the reliability of a Philadelphia-based support team.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>gharara suits</strong>, <strong>designer gharara suits</strong>, <strong>gharara sets</strong>, <strong>wedding gharara suits</strong>, <strong>party wear gharara suits</strong>, <strong>Pakistani gharara suits</strong>, <strong>festive gharara outfits</strong>, <strong>embroidered gharara suits</strong>, and <strong>gharara suits online</strong>. For broader salwar kameez styles, visit the full <Link to="/suits" className="text-foreground underline underline-offset-2">suit collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} gharara suits`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all suits while gharara product signals are limited.
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
                <h3 className="font-serif text-2xl mb-4">Gharara Suits Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The gharara suit edit is being curated. Explore all suits for salwar kameez, Anarkali suits, Pakistani suits, Eid, wedding, and party wear styles.
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Gharara Suit Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for gharara suit intent</h3>
                <p>
                  This page is focused on gharara suits rather than every salwar kameez style. It highlights designer gharara suits, gharara sets, Pakistani gharara suits, embroidered gharara suits, festive gharara outfits, and party wear gharara suits.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Wedding, festive, and party focused</h3>
                <p>
                  Gharara shoppers often compare bottom flare, knee detail, kurta length, dupatta styling, embroidery, fabric, and delivery timing. This collection keeps those wedding guest, Eid, mehendi, sangeet, reception, nikah, and party wear decisions close to the shopping path.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Silhouette and fabric aware</h3>
                <p>
                  Georgette, chiffon, crepe, and cotton gharara sets are useful for lighter celebrations, while silk, net, organza, zari, sequins, and embroidered gharara suits often feel more formal for weddings and evening events.
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
              <Link to="/collections/sharara-suits"><Button variant="outline" size="sm">Sharara Suits</Button></Link>
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
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Gharara Suits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {ghararaSuitFaqs.map((faq, i) => (
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

export default GhararaSuits;
