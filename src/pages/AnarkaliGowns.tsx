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

const anarkaliGownsSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/anarkali-gowns'));

const anarkaliGownIntentPattern = /\b(anarkali\s?gown|anarkali|gown|floor.?length|gown.?style|flared|flare|kalidar|designer|indian|wedding|party|party wear|partywear|festive|festival|eid|reception|sangeet|mehendi|embroider|embroidered|embroidery|sequins?|zari|georgette|silk|chiffon|net|organza)\b/i;
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

const anarkaliGownFaqs = [
  {
    question: 'What are Anarkali gowns?',
    answer: 'Anarkali gowns are Indian occasion outfits with the graceful flare of an Anarkali and the longer, dress-like finish of a gown. They are often chosen for weddings, receptions, sangeet nights, festive parties, Eid, Diwali, and formal family celebrations.',
  },
  {
    question: 'Are Anarkali gowns good for Indian weddings?',
    answer: 'Yes. Wedding Anarkali gowns work well for guests, bridesmaids, family members, engagement events, receptions, sangeet nights, and mehendi functions. Designer Anarkali gowns, embroidered Anarkali gowns, floor length Anarkali gowns, silk styles, and georgette styles can feel elegant without being as heavy as a bridal lehenga.',
  },
  {
    question: 'What is the difference between Anarkali gowns and Anarkali suits?',
    answer: 'Anarkali suits usually include a flared kurta with a bottom and dupatta, while Anarkali gowns often emphasize a longer, more dress-like silhouette. Some styles overlap, but Anarkali gowns usually feel more formal, fluid, and evening-ready.',
  },
  {
    question: 'Can Anarkali gowns be worn for parties and festivals?',
    answer: 'Yes. Party wear Anarkali gowns and festive Anarkali gowns are popular for Diwali, Eid, Navratri events, engagement parties, receptions, and family celebrations. Lighter fabrics work for daytime events, while sequins, zari, embroidery, net, organza, and layered dupattas can make the outfit more formal.',
  },
  {
    question: 'Which fabrics are common in Indian Anarkali gowns?',
    answer: 'Indian Anarkali gowns commonly use georgette, chiffon, silk, net, organza, crepe, chanderi, satin, and blended fabrics. Georgette and chiffon help with movement, silk and chanderi feel festive, and net or organza can create a more structured gown-style look.',
  },
  {
    question: 'How do I choose Anarkali gowns online?',
    answer: 'Start with the occasion, preferred length, flare, fabric, sleeve coverage, neckline, embroidery level, dupatta preference, size, stitching needs, and delivery timeline. Review product photos, measurements, fabric notes, lining, care details, and shipping estimates before ordering an Anarkali gown for women online.',
  },
];

const AnarkaliGowns = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('suits');
  const [sortBy, setSortBy] = useState('featured');

  const anarkaliGownMatches = useMemo(
    () => products.filter(product => {
      const searchText = getSearchText(product);
      return anarkaliGownIntentPattern.test(searchText) && !menswearIntentPattern.test(searchText);
    }),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && anarkaliGownMatches.length < 8;
  const anarkaliGownProducts = isUsingFallback ? products : anarkaliGownMatches;
  const sortedProducts = useMemo(() => sortProducts(anarkaliGownProducts, sortBy), [anarkaliGownProducts, sortBy]);
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
        {...anarkaliGownsSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Anarkali Gowns', url: '/collections/anarkali-gowns' },
        ]}
        collection={{
          name: 'Anarkali Gowns',
          description: 'Anarkali gowns collection for designer Anarkali gowns, Indian Anarkali gowns, wedding Anarkali gowns, party wear Anarkali gowns, embroidered Anarkali gowns, floor length Anarkali gowns, festive Anarkali gowns, and Anarkali gown for women.',
          items: collectionItems,
        }}
        faqs={anarkaliGownFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Designer Anarkali Gown Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Anarkali Gowns</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop Anarkali gowns and Indian Anarkali gowns for weddings, receptions, parties, Eid, Diwali, sangeet nights, and polished festive dressing. This collection focuses on designer Anarkali gowns, wedding Anarkali gowns, party wear Anarkali gowns, embroidered Anarkali gowns, floor length Anarkali gowns, festive Anarkali gowns, and Anarkali gown for women.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>Anarkali gowns</strong>, <strong>designer Anarkali gowns</strong>, <strong>Indian Anarkali gowns</strong>, <strong>wedding Anarkali gowns</strong>, <strong>party wear Anarkali gowns</strong>, <strong>embroidered Anarkali gowns</strong>, <strong>floor length Anarkali gowns</strong>, <strong>festive Anarkali gowns</strong>, and <strong>Anarkali gown for women</strong>. For broader salwar kameez styles, visit the full <Link to="/suits" className="text-foreground underline underline-offset-2">suit collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} Anarkali gowns`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all suits while Anarkali gown product signals are limited.
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
                <h3 className="font-serif text-2xl mb-4">Anarkali Gowns Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The Anarkali gown edit is being curated. Explore all suits for Anarkali suits, salwar kameez, Pakistani suits, palazzo suits, sharara suits, Eid, wedding, and party wear styles.
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Anarkali Gown Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for Anarkali gown intent</h3>
                <p>
                  This page is focused on Anarkali gowns rather than every salwar kameez style. It highlights designer Anarkali gowns, Indian Anarkali gowns, floor length Anarkali gowns, wedding Anarkali gowns, party wear Anarkali gowns, and embroidered occasionwear.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Wedding, festive, and party focused</h3>
                <p>
                  Anarkali gown shoppers often compare flare, length, fabric, embroidery, dupatta styling, sleeve shape, and delivery timing. This collection keeps those wedding guest, reception, Eid, festival, and party wear decisions close to the shopping path.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Silhouette and fabric aware</h3>
                <p>
                  Floor length Anarkali gowns can feel more formal, while lighter georgette, chiffon, chanderi, cotton, and silk styles are useful for daytime celebrations, family events, and festivals. Heavier embroidery, zari, and sequins suit evening occasions.
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
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Anarkali Gowns</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {anarkaliGownFaqs.map((faq, i) => (
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

export default AnarkaliGowns;
