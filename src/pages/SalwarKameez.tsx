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

const salwarKameezSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/salwar-kameez'));

const salwarKameezIntentPattern = /\b(salwar|kameez|suit|suits|anarkali|palazzo|sharara|gharara|churidar|patiala|pakistani|designer|embroider|embroidered|embroidery|festive|festival|party|party wear|partywear|wedding|eid|georgette|silk|chiffon|cotton|lawn|ethnic)\b/i;

const getSearchText = (product: ShopifyProduct): string => {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.productType,
    product.node.description,
    ...tags,
  ].filter(Boolean).join(' ');
};

const salwarKameezFaqs = [
  {
    question: 'What is salwar kameez?',
    answer: 'Salwar kameez is a classic South Asian outfit that usually includes a kameez or tunic, a salwar or trouser-style bottom, and a dupatta. Modern Indian salwar suits can include straight suits, Anarkali suits, palazzo suits, sharara suits, Pakistani style salwar kameez, and embroidered occasionwear.',
  },
  {
    question: 'Can salwar kameez be worn for weddings and parties?',
    answer: 'Yes. Wedding salwar suits, party wear salwar kameez, embroidered salwar kameez, Anarkali suits, sharara suits, and palazzo suits are strong choices for wedding guests, sangeet, mehendi, receptions, Eid, Diwali, and family celebrations. Choose the embellishment and fabric based on the event formality.',
  },
  {
    question: 'What is the difference between salwar kameez and Anarkali suits?',
    answer: 'Salwar kameez is the broader category for tunic, bottom, and dupatta sets. Anarkali suits are a specific silhouette within that category, known for a fitted bodice and flared, flowing shape. Salwar kameez can also include straight-cut suits, palazzo suits, Pakistani suits, sharara suits, and churidar sets.',
  },
  {
    question: 'Which fabrics are common in salwar kameez?',
    answer: 'Common salwar kameez fabrics include cotton, georgette, chiffon, silk, chanderi, lawn, crepe, net, organza, and blended fabrics. Cotton and lawn are useful for comfort and warm weather, while georgette, chiffon, silk, net, and embroidered fabrics often feel more event-ready.',
  },
  {
    question: 'Are Pakistani style salwar kameez suits different?',
    answer: 'Pakistani style salwar kameez often features longer kameez silhouettes, elegant dupattas, straight or relaxed cuts, and detailed embroidery. These styles can work well for Eid, nikah events, wedding guests, formal dinners, and festive occasions.',
  },
  {
    question: 'How do I choose salwar suits online?',
    answer: 'Start with the occasion, silhouette, fabric, color, stitching needs, size, dupatta style, and delivery timeline. Review product photos, fabric notes, work type, size options, lining, care instructions, and measurements before ordering designer salwar kameez or ethnic suits for women online.',
  },
];

const SalwarKameez = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('suits');
  const [sortBy, setSortBy] = useState('featured');

  const salwarKameezMatches = useMemo(
    () => products.filter(product => salwarKameezIntentPattern.test(getSearchText(product))),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && salwarKameezMatches.length < 8;
  const salwarKameezProducts = isUsingFallback ? products : salwarKameezMatches;
  const sortedProducts = useMemo(() => sortProducts(salwarKameezProducts, sortBy), [salwarKameezProducts, sortBy]);
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
        {...salwarKameezSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Salwar Kameez', url: '/collections/salwar-kameez' },
        ]}
        collection={{
          name: 'Salwar Kameez',
          description: 'Salwar kameez collection for designer salwar kameez, Indian salwar suits, salwar suits online, embroidered salwar kameez, festive salwar suits, party wear salwar kameez, Pakistani style salwar kameez, and ethnic suits for women.',
          items: collectionItems,
        }}
        faqs={salwarKameezFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Designer Salwar Suit Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Salwar Kameez</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop salwar kameez and Indian salwar suits online for weddings, parties, Eid, festivals, receptions, and everyday occasion dressing. This collection focuses on designer salwar kameez, embroidered salwar kameez, festive salwar suits, party wear salwar kameez, Pakistani style salwar kameez, and ethnic suits for women shopping from the USA, Canada, Australia, and worldwide.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>salwar kameez</strong>, <strong>designer salwar kameez</strong>, <strong>Indian salwar suits</strong>, <strong>salwar suits online</strong>, <strong>embroidered salwar kameez</strong>, <strong>festive salwar suits</strong>, <strong>party wear salwar kameez</strong>, <strong>Pakistani style salwar kameez</strong>, and <strong>ethnic suits for women</strong>. For the full suit catalog, visit <Link to="/suits" className="text-foreground underline underline-offset-2">all suits</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} salwar kameez styles`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all suits while salwar kameez product signals are limited.
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
                <h3 className="font-serif text-2xl mb-4">Salwar Kameez Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The salwar kameez edit is being curated. Explore all suits for Anarkali suits, Pakistani suits, palazzo suits, sharara suits, Eid, wedding, and party wear styles.
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Salwar Kameez Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for salwar kameez intent</h3>
                <p>
                  This page is focused on salwar kameez and Indian salwar suits rather than every ethnic wear category. It highlights designer salwar kameez, embroidered salwar kameez, festive salwar suits, party wear suits, and Pakistani style salwar kameez.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Occasion and silhouette focused</h3>
                <p>
                  Salwar suit shoppers often compare straight suits, Anarkali suits, palazzo suits, sharara suits, churidar sets, embroidery, dupatta styling, and delivery timing. This collection keeps those buying decisions close to the product grid.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Fabric and comfort aware</h3>
                <p>
                  Cotton and lawn salwar kameez styles are useful for warm weather and daytime wear, while georgette, chiffon, silk, net, organza, and embroidered suits are helpful for weddings, parties, Eid, Diwali, and evening events.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Online shopping support for NRIs</h3>
                <p>
                  LuxeMia Boutique supports shoppers in the USA, Canada, Australia, and worldwide with tracked shipping, stitching options where available, and styling guidance before purchase. Review each product's sizing, stitching, and delivery details before ordering.
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
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Salwar Kameez</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {salwarKameezFaqs.map((faq, i) => (
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

export default SalwarKameez;
