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

const indoWesternDressesSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/indo-western-dresses'));

const indoWesternDressIntentPattern = /\b(indo.?western|fusion|dress|dresses|gown|cape|jacket|coord|co.?ord|jumpsuit|cocktail|reception|sangeet|party|party wear|partywear|wedding guest|festive|festival|modern ethnic|contemporary|dhoti|palazzo|sharara|embroider|embroidered|embroidery|sequins?|zari|georgette|silk|chiffon|organza)\b/i;

const getSearchText = (product: ShopifyProduct): string => {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.productType,
    product.node.description,
    ...tags,
  ].filter(Boolean).join(' ');
};

const indoWesternDressFaqs = [
  {
    question: 'What are Indo Western dresses?',
    answer: 'Indo Western dresses blend Indian textile, embroidery, drape, or embellishment details with modern dress and occasionwear silhouettes. Common styles include fusion gowns, cape dresses, jacket sets, dhoti-inspired outfits, co-ord sets, and contemporary ethnic dresses.',
  },
  {
    question: 'Are Indo Western dresses good for Indian wedding guests?',
    answer: 'Yes. Indo Western dresses can work well for wedding guests at receptions, sangeet nights, cocktail events, engagement parties, and festive welcome dinners. Choose the fabric, coverage, color, and embellishment level based on the event formality and family dress code.',
  },
  {
    question: 'What is the difference between Indo Western dresses and traditional Indian outfits?',
    answer: 'Traditional Indian outfits usually follow classic categories such as sarees, lehengas, salwar kameez, Anarkali suits, sharara suits, or gharara suits. Indo Western dresses keep Indian details like embroidery, dupatta-inspired layering, zari, sequins, or festive fabrics while using more contemporary cuts.',
  },
  {
    question: 'Can Indo Western dresses be worn for parties and cocktail events?',
    answer: 'Yes. Party wear Indo Western dresses and Indian cocktail outfits are popular for receptions, sangeet nights, festive parties, birthday celebrations, and formal dinners. Lighter embellishment can feel polished for daytime events, while richer embroidery or sequins can suit evening occasions.',
  },
  {
    question: 'Which fabrics are common in Indian fusion dresses?',
    answer: 'Indian fusion dresses often use georgette, chiffon, silk, crepe, organza, net, satin, and blended fabrics. Flowing fabrics are useful for gowns and cape styles, while structured fabrics can support jackets, co-ords, and contemporary occasionwear silhouettes.',
  },
  {
    question: 'How do I choose Indo Western outfits for women online?',
    answer: 'Start with the occasion, silhouette, sleeve and neckline comfort, fabric, embroidery level, size, and delivery timing. Review product photos, measurements, fabric notes, lining, care instructions, and styling details before ordering modern ethnic dresses or festive fusion wear online.',
  },
];

const IndoWesternDresses = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('indowestern');
  const [sortBy, setSortBy] = useState('featured');

  const indoWesternDressMatches = useMemo(
    () => products.filter(product => indoWesternDressIntentPattern.test(getSearchText(product))),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && indoWesternDressMatches.length < 8;
  const indoWesternDressProducts = isUsingFallback ? products : indoWesternDressMatches;
  const sortedProducts = useMemo(() => sortProducts(indoWesternDressProducts, sortBy), [indoWesternDressProducts, sortBy]);
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
        {...indoWesternDressesSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Indo Western Dresses', url: '/collections/indo-western-dresses' },
        ]}
        collection={{
          name: 'Indo Western Dresses',
          description: 'Indo Western dresses collection for Indian fusion dresses, Indo Western outfits for women, wedding guest Indo Western dresses, party wear Indo Western dresses, modern ethnic dresses, Indian cocktail outfits, and festive fusion wear.',
          items: collectionItems,
        }}
        faqs={indoWesternDressFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Indian Fusion Dress Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Indo Western Dresses</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop Indo Western dresses and Indian fusion dresses for receptions, sangeet nights, cocktail parties, festive dinners, and wedding guest occasions. This edit focuses on Indo Western outfits for women, party wear Indo Western dresses, modern ethnic dresses, Indian cocktail outfits, and festive fusion wear.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>Indo Western dresses</strong>, <strong>Indian fusion dresses</strong>, <strong>Indo Western outfits for women</strong>, <strong>wedding guest Indo Western dresses</strong>, <strong>party wear Indo Western dresses</strong>, <strong>modern ethnic dresses</strong>, <strong>Indian cocktail outfits</strong>, and <strong>festive fusion wear</strong>. For the broader fusion edit, visit the full <Link to="/indowestern" className="text-foreground underline underline-offset-2">Indo-Western collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} Indo Western styles`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all Indo-Western styles while dress-specific product signals are limited.
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
                <h3 className="font-serif text-2xl mb-4">Indo Western Dresses Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The Indo Western dress edit is being curated. Explore all Indo-Western styles for fusion gowns, cape sets, co-ords, palazzo sets, party wear, and modern ethnic looks.
                </p>
                <Button asChild variant="outline">
                  <Link to="/indowestern">Explore Indo-Western</Link>
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Indo Western Dress Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for fusion dress intent</h3>
                <p>
                  This page is focused on Indo Western dresses rather than every ethnic wear category. It highlights Indian fusion dresses, modern ethnic dresses, party wear Indo Western outfits, and Indian cocktail outfits.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Wedding guest and party focused</h3>
                <p>
                  Indo Western shoppers often compare silhouette, embellishment, neckline, sleeve coverage, movement, and event formality. This collection keeps reception, sangeet, cocktail, party, and festive fusion decisions close to the product grid.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Modern ethnic styling cues</h3>
                <p>
                  Fusion gowns, cape layers, jacket details, co-ord sets, palazzo silhouettes, and dhoti-inspired cuts can feel contemporary while still carrying Indian embroidery, festive fabrics, zari, sequins, or draped details.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Helpful online shopping context</h3>
                <p>
                  Review each product's photos, fabric notes, sizing, lining, care details, and delivery estimates before ordering. Indo Western dresses can vary widely in fit because the category blends dress, gown, set, and draped silhouettes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Fusion and Occasion Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/indowestern"><Button variant="outline" size="sm">Indo-Western</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/party-wear-lehengas"><Button variant="outline" size="sm">Party Wear Lehengas</Button></Link>
              <Link to="/collections/salwar-kameez"><Button variant="outline" size="sm">Salwar Kameez</Button></Link>
              <Link to="/collections/anarkali-suits"><Button variant="outline" size="sm">Anarkali Suits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Indo Western Dresses</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {indoWesternDressFaqs.map((faq, i) => (
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

export default IndoWesternDresses;
