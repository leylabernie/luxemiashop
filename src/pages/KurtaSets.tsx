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

const kurtaSetsSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/kurta-sets'));

const kurtaSetIntentPattern = /\b(kurta|kurti|kurta\s?set|kurta\s?sets|kurta\s?pant|pant\s?set|kurta\s?dupatta|dupatta\s?set|salwar|kameez|palazzo|straight\s?pant|churidar|designer|indian|ethnic|wedding|wedding guest|party|party wear|partywear|festive|festival|eid|diwali|mehendi|sangeet|embroider|embroidered|embroidery|sequins?|zari|georgette|silk|chiffon|cotton|organza)\b/i;
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

const kurtaSetFaqs = [
  {
    question: 'What are kurta sets?',
    answer: 'Kurta sets are Indian outfits built around a kurta or tunic, usually paired with pants, palazzos, churidar, salwar bottoms, or a dupatta. Many kurta sets for women are sold as two-piece kurta pant sets or three-piece kurta dupatta sets for festive, party, wedding guest, and everyday ethnic wear.',
  },
  {
    question: 'Are kurta sets good for Indian wedding guests?',
    answer: 'Yes. Wedding guest kurta sets can be an easy choice for mehendi, sangeet, engagement, reception, family dinners, and daytime ceremonies. Choose richer embroidery, silk, georgette, organza, zari, or sequins for formal events, and lighter cotton or printed styles for casual celebrations.',
  },
  {
    question: 'What is the difference between kurta pant sets and kurta dupatta sets?',
    answer: 'Kurta pant sets usually include a kurta and coordinated pants, making them streamlined and easy to style. Kurta dupatta sets usually include a kurta, bottom, and matching dupatta, which can feel more complete for festive events, weddings, Eid, Diwali, and traditional family occasions.',
  },
  {
    question: 'Can kurta sets be worn for festivals and parties?',
    answer: 'Yes. Festive kurta sets and party wear kurta sets work well for Diwali, Eid, Navratri gatherings, pujas, engagement parties, office celebrations, and family events. Embroidery, fabric, color, sleeve coverage, and dupatta styling help set the formality.',
  },
  {
    question: 'Which fabrics are common in Indian kurta sets?',
    answer: 'Indian kurta sets are commonly made in cotton, silk, georgette, chiffon, crepe, organza, rayon, viscose, and blended fabrics. Cotton is useful for casual and daytime wear, while silk, georgette, organza, zari, sequins, and embroidered fabrics are often chosen for festive and wedding guest outfits.',
  },
  {
    question: 'How do I choose kurta sets online?',
    answer: 'Start with the occasion, fabric, kurta length, bottom style, dupatta preference, sleeve and neckline comfort, size, stitching needs, and delivery timing. Review product photos, measurements, fabric notes, lining, care instructions, and shipping estimates before ordering designer kurta sets online.',
  },
];

const KurtaSets = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('suits');
  const [sortBy, setSortBy] = useState('featured');

  const kurtaSetMatches = useMemo(
    () => products.filter(product => {
      const searchText = getSearchText(product);
      return kurtaSetIntentPattern.test(searchText) && !menswearIntentPattern.test(searchText);
    }),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && kurtaSetMatches.length < 8;
  const kurtaSetProducts = isUsingFallback ? products : kurtaSetMatches;
  const sortedProducts = useMemo(() => sortProducts(kurtaSetProducts, sortBy), [kurtaSetProducts, sortBy]);
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
        {...kurtaSetsSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Kurta Sets', url: '/collections/kurta-sets' },
        ]}
        collection={{
          name: 'Kurta Sets',
          description: 'Kurta sets collection for designer kurta sets, Indian kurta sets, festive kurta sets, wedding guest kurta sets, kurta pant sets, kurta dupatta sets, ethnic kurta sets for women, and Indian outfits for women.',
          items: collectionItems,
        }}
        faqs={kurtaSetFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Designer Kurta Set Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Kurta Sets</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop kurta sets and Indian kurta sets for festive events, wedding guest looks, parties, Eid, Diwali, family celebrations, and polished everyday ethnic wear. This collection focuses on designer kurta sets, festive kurta sets, wedding guest kurta sets, kurta pant sets, kurta dupatta sets, ethnic kurta sets for women, and Indian outfits for women.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>kurta sets</strong>, <strong>designer kurta sets</strong>, <strong>Indian kurta sets</strong>, <strong>festive kurta sets</strong>, <strong>wedding guest kurta sets</strong>, <strong>kurta pant sets</strong>, <strong>kurta dupatta sets</strong>, <strong>ethnic kurta sets for women</strong>, and <strong>Indian outfits for women</strong>. For broader salwar kameez styles, visit the full <Link to="/suits" className="text-foreground underline underline-offset-2">suit collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} kurta sets`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all suits while kurta set product signals are limited.
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
                <h3 className="font-serif text-2xl mb-4">Kurta Sets Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The kurta set edit is being curated. Explore all suits for salwar kameez, Anarkali suits, Pakistani suits, sharara sets, festive wear, and wedding guest styles.
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Kurta Set Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for kurta set intent</h3>
                <p>
                  This page is focused on kurta sets rather than every suit style. It highlights designer kurta sets, Indian kurta sets, kurta pant sets, kurta dupatta sets, festive kurta sets, and ethnic kurta sets for women.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Festive and wedding guest focused</h3>
                <p>
                  Kurta set shoppers often compare fabric, embroidery, kurta length, pant fit, dupatta styling, sleeve coverage, and delivery timing. This collection keeps those festive, party, wedding guest, Eid, and Diwali decisions close to the shopping path.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Set format and fabric aware</h3>
                <p>
                  Kurta pant sets can feel clean and modern, while kurta dupatta sets usually read more traditional and event-ready. Cotton and printed styles work for lighter wear, while silk, georgette, organza, zari, sequins, and embroidery suit dressier occasions.
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
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/diwali-outfits"><Button variant="outline" size="sm">Diwali Outfits</Button></Link>
              <Link to="/collections/eid-outfits"><Button variant="outline" size="sm">Eid Outfits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Kurta Sets</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {kurtaSetFaqs.map((faq, i) => (
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

export default KurtaSets;
