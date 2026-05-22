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

const anarkaliSuitsSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/anarkali-suits'));

const anarkaliSuitIntentPattern = /\b(anarkali|floor.?length|gown|gown.?style|flared|flare|churidar|kalidar|designer|wedding|party|party wear|partywear|festive|festival|eid|reception|sangeet|mehendi|embroider|embroidered|embroidery|sequins?|zari|georgette|silk|chiffon|net|organza)\b/i;

const getSearchText = (product: ShopifyProduct): string => {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.productType,
    product.node.description,
    ...tags,
  ].filter(Boolean).join(' ');
};

const anarkaliSuitFaqs = [
  {
    question: 'What is an Anarkali suit?',
    answer: 'An Anarkali suit is a traditional Indian outfit with a fitted bodice and a flared, flowing kurta or gown-style silhouette, usually paired with a bottom and dupatta. It is popular for weddings, parties, Eid, festivals, receptions, and formal family events because it feels elegant while staying comfortable.',
  },
  {
    question: 'Are Anarkali suits good for weddings?',
    answer: 'Yes. Wedding Anarkali suits are a strong choice for guests, family members, bridesmaids, and pre-wedding events. Embroidered Anarkali suits, floor length Anarkali suits, silk Anarkalis, georgette Anarkalis, and gown-style Anarkali suits can work well for sangeet, mehendi, reception, nikah, and ceremony looks.',
  },
  {
    question: 'What is the difference between Anarkali suits and regular salwar kameez?',
    answer: 'A regular salwar kameez is usually straighter or simpler in silhouette, while an Anarkali suit has a more pronounced flare. Anarkalis often feel dressier because of their flowing shape, longer length, embroidery, dupatta styling, and event-ready fabric choices.',
  },
  {
    question: 'Which fabrics are common in Anarkali suits?',
    answer: 'Common Anarkali suit fabrics include georgette, chiffon, silk, cotton, net, organza, crepe, chanderi, and blended fabrics. Georgette and chiffon are useful for movement, silk and chanderi feel more festive, and net or organza can create a formal gown-style look.',
  },
  {
    question: 'Can Anarkali suits be worn for parties and festivals?',
    answer: 'Yes. Party wear Anarkali suits and festive Anarkali suits are popular for Diwali, Eid, Navratri, engagement parties, sangeet nights, receptions, and family celebrations. Choose lighter fabrics for daytime events and heavier embroidery, sequins, zari, or layered dupattas for evening occasions.',
  },
  {
    question: 'How do I choose Anarkali suits online?',
    answer: 'Start with the occasion, preferred length, fabric, sleeve style, dupatta, embroidery level, size, and delivery timeline. Review product photos, fabric details, work type, stitching options, lining, care instructions, and measurements before ordering Indian Anarkali suits online.',
  },
];

const AnarkaliSuits = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('suits');
  const [sortBy, setSortBy] = useState('featured');

  const anarkaliSuitMatches = useMemo(
    () => products.filter(product => anarkaliSuitIntentPattern.test(getSearchText(product))),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && anarkaliSuitMatches.length < 8;
  const anarkaliSuitProducts = isUsingFallback ? products : anarkaliSuitMatches;
  const sortedProducts = useMemo(() => sortProducts(anarkaliSuitProducts, sortBy), [anarkaliSuitProducts, sortBy]);
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
        {...anarkaliSuitsSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Anarkali Suits', url: '/collections/anarkali-suits' },
        ]}
        collection={{
          name: 'Anarkali Suits',
          description: 'Anarkali suits collection for designer Anarkali suits, wedding Anarkali suits, party wear Anarkali suits, Indian Anarkali suits online, floor length Anarkali suits, embroidered Anarkali suits, and festive Anarkali suits.',
          items: collectionItems,
        }}
        faqs={anarkaliSuitFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Designer Anarkali Suit Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Anarkali Suits</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop Anarkali suits online for weddings, parties, Eid, festivals, receptions, sangeet nights, and polished Indian occasion dressing. This collection focuses on designer Anarkali suits, wedding Anarkali suits, party wear Anarkali suits, floor length Anarkali suits, embroidered Anarkali suits, and festive Anarkali suits for shoppers in the USA, Canada, Australia, and worldwide.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>anarkali suits</strong>, <strong>designer anarkali suits</strong>, <strong>wedding anarkali suits</strong>, <strong>party wear anarkali suits</strong>, <strong>Indian anarkali suits online</strong>, <strong>floor length anarkali suits</strong>, <strong>embroidered anarkali suits</strong>, and <strong>festive anarkali suits</strong>. For broader salwar kameez styles, visit the full <Link to="/suits" className="text-foreground underline underline-offset-2">suit collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} Anarkali suits`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all suits while Anarkali product signals are limited.
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
                <h3 className="font-serif text-2xl mb-4">Anarkali Suits Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The Anarkali suit edit is being curated. Explore all suits for salwar kameez, Pakistani suits, palazzo suits, sharara suits, Eid, wedding, and party wear styles.
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Anarkali Suit Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for Anarkali suit intent</h3>
                <p>
                  This page is focused on Anarkali suits rather than every salwar kameez style. It highlights designer Anarkali suits, floor length Anarkali suits, wedding Anarkali suits, party wear Anarkali suits, and embroidered occasionwear.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Wedding, festive, and party focused</h3>
                <p>
                  Anarkali shoppers often compare flare, length, fabric, embroidery, dupatta styling, sleeve shape, and delivery timing. This collection keeps those wedding guest, reception, Eid, festival, and party wear decisions close to the shopping path.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Silhouette and fabric aware</h3>
                <p>
                  Floor length Anarkali suits can feel more formal, while lighter georgette, chiffon, chanderi, cotton, and silk Anarkalis are useful for daytime celebrations, family events, and festivals. Heavier embroidery and sequins suit evening events.
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
              <Link to="/collections/pakistani-suits"><Button variant="outline" size="sm">Pakistani Suits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/eid-outfits"><Button variant="outline" size="sm">Eid Outfits</Button></Link>
              <Link to="/collections/mehendi-outfits"><Button variant="outline" size="sm">Mehendi Outfits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Anarkali Suits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {anarkaliSuitFaqs.map((faq, i) => (
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

export default AnarkaliSuits;
