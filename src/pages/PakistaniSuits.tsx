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

const pakistaniSuitsSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/pakistani-suits'));

const pakistaniSuitIntentPattern = /\b(pakistani|salwar|kameez|suit|anarkali|palazzo|sharara|gharara|lawn|chiffon|georgette|silk|eid|wedding|party|festive|embroider|embroidered|embroidery)\b/i;

const getSearchText = (product: ShopifyProduct): string => {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.productType,
    product.node.description,
    ...tags,
  ].filter(Boolean).join(' ');
};

const pakistaniSuitFaqs = [
  {
    question: 'What makes Pakistani suits different from regular salwar kameez?',
    answer: 'Pakistani suits often feature longer kameez silhouettes, straight-cut styling, detailed embroidery, elegant dupattas, and fabrics such as lawn, chiffon, georgette, silk, and cotton blends. Many styles feel polished for Eid, weddings, parties, and family events while staying comfortable for long wear.',
  },
  {
    question: 'Can Pakistani suits be worn for Eid and weddings?',
    answer: 'Yes. Pakistani suits are popular for Eid, nikah events, wedding guest outfits, mehendi functions, receptions, festive dinners, and family celebrations. Choose lighter lawn or cotton styles for daytime events, and embroidered chiffon, georgette, silk, sharara, gharara, or anarkali suits for formal occasions.',
  },
  {
    question: 'Which fabrics are common in Pakistani suits?',
    answer: 'Common Pakistani suit fabrics include lawn, cotton, chiffon, georgette, silk, net, organza, crepe, and blended fabrics. Lawn suits are useful for warmer weather and daytime wear, while chiffon, georgette, silk, and embroidered fabrics are often chosen for Eid, parties, and weddings.',
  },
  {
    question: 'Are Pakistani suits good for wedding guests?',
    answer: 'Pakistani suits are a strong option for wedding guests because they can look formal without feeling bridal. Embroidered Pakistani salwar suits, anarkali suits, palazzo suits, sharara suits, and gharara suits can work across mehendi, sangeet, reception, nikah, and family wedding events.',
  },
  {
    question: 'Do Pakistani suits come stitched or unstitched?',
    answer: 'Stitching depends on the individual product. Some Pakistani suits may be ready to wear, semi-stitched, made to measure, or unstitched. Review each product page for stitching, sizing, dupatta, lining, sleeve, and delivery details before ordering online.',
  },
  {
    question: 'How do I choose Pakistani suits online?',
    answer: 'Start with the occasion, weather, preferred silhouette, fabric, color, stitching needs, and delivery timeline. Check product photos, fabric notes, work type, size options, dupatta details, and care instructions. For event shopping, allow extra time for custom stitching or alterations.',
  },
];

const PakistaniSuits = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('suits');
  const [sortBy, setSortBy] = useState('featured');

  const pakistaniSuitMatches = useMemo(
    () => products.filter(product => pakistaniSuitIntentPattern.test(getSearchText(product))),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && pakistaniSuitMatches.length < 8;
  const pakistaniSuitProducts = isUsingFallback ? products : pakistaniSuitMatches;
  const sortedProducts = useMemo(() => sortProducts(pakistaniSuitProducts, sortBy), [pakistaniSuitProducts, sortBy]);
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
        {...pakistaniSuitsSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Pakistani Suits', url: '/collections/pakistani-suits' },
        ]}
        collection={{
          name: 'Pakistani Suits',
          description: 'Pakistani suits collection for Pakistani salwar suits, Pakistani designer suits, lawn suits, wedding suits, Eid suits, anarkali suits, palazzo suits, and party wear suits online.',
          items: collectionItems,
        }}
        faqs={pakistaniSuitFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Pakistani Salwar Suit Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Pakistani Suits</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop Pakistani suits and Pakistani salwar suits online for Eid, weddings, receptions, parties, festive gatherings, and everyday occasion dressing. This collection focuses on Pakistani designer suits, lawn suits, wedding suits, anarkali suits, palazzo suits, sharara suits, gharara suits, and embroidered salwar kameez styles for shoppers in the USA, Canada, Australia, and beyond.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>pakistani suits</strong>, <strong>pakistani salwar suits</strong>, <strong>pakistani designer suits</strong>, <strong>pakistani lawn suits</strong>, <strong>pakistani wedding suits</strong>, <strong>eid pakistani suits</strong>, <strong>pakistani anarkali suits</strong>, <strong>pakistani palazzo suits</strong>, and <strong>pakistani suits online USA</strong>. For broader salwar kameez styles, visit the full <Link to="/suits" className="text-foreground underline underline-offset-2">suit collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} Pakistani suits`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all suits while Pakistani suit product signals are limited.
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
                <h3 className="font-serif text-2xl mb-4">Pakistani Suits Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The Pakistani suit edit is being curated. Explore all suits for salwar kameez, anarkali, palazzo, sharara, Eid, wedding, and party wear styles.
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Pakistani Suit Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for Pakistani suit intent</h3>
                <p>
                  This page is focused on Pakistani suits rather than every salwar kameez style. It highlights Pakistani salwar suits, designer suits, lawn suits, anarkali suits, palazzo suits, sharara suits, gharara suits, and embroidered occasionwear.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Eid, wedding, and party focused</h3>
                <p>
                  Pakistani suit shoppers often compare silhouette, embroidery, dupatta styling, fabric, stitching, and delivery timing. This collection keeps those Eid, wedding guest, reception, and party wear decisions close to the shopping path.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Fabric and climate aware</h3>
                <p>
                  Lawn and cotton Pakistani suits can work well for warm weather and daytime events, while chiffon, georgette, silk, organza, and embroidered suits are useful for evening parties, Eid celebrations, and wedding functions.
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
              <Link to="/collections/eid-outfits"><Button variant="outline" size="sm">Eid Outfits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/mehendi-outfits"><Button variant="outline" size="sm">Mehendi Outfits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Pakistani Suits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {pakistaniSuitFaqs.map((faq, i) => (
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

export default PakistaniSuits;
