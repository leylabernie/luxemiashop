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

const pakistaniWeddingDressesSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/pakistani-wedding-dresses'));

const pakistaniWeddingDressIntentPattern = /\b(pakistani\s?wedding|pakistani\s?bridal|pakistani\s?bride|pakistani\s?formal|pakistani\s?reception|pakistani\s?mehndi|pakistani\s?mehendi|pakistani\s?nikah|pakistani\s?walima|wedding\s?dress|wedding\s?outfit|bridal\s?dress|bride|bridal|wedding\s?guest|formal\s?dress|reception|mehndi|mehendi|nikah|nikkah|walima|sangeet|engagement|ceremony|cocktail|sharara|gharara|anarkali|salwar|kameez|lehenga|lehenga\s?choli|saree|sari|gown|saree\s?gown|palazzo|dupatta|embroider|embroidered|embroidery|sequins?|zari|zardozi|mirror|silk|georgette|chiffon|organza|net|velvet)\b/i;
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

const pakistaniWeddingDressFaqs = [
  {
    question: 'What are Pakistani wedding dresses?',
    answer: 'Pakistani wedding dresses include bridal lehengas, shararas, ghararas, Anarkali suits, formal salwar kameez, sarees, saree gowns, and embroidered gowns selected for Pakistani weddings, nikah ceremonies, mehndi events, walima receptions, and wedding guest occasions.',
  },
  {
    question: 'Which Pakistani wedding dress works best for nikah, mehndi, and walima events?',
    answer: 'For nikah events, many shoppers choose elegant ghararas, shararas, sarees, or soft formal suits. Mehndi outfits often lean festive and colorful, while walima and reception dresses can include polished gowns, lehengas, sarees, Anarkalis, and embroidered formal dresses.',
  },
  {
    question: 'Can wedding guests wear Pakistani bridal-inspired styles?',
    answer: 'Wedding guests can wear Pakistani wedding guest dresses with embroidery, dupattas, sharara pants, gharara pants, Anarkali silhouettes, sarees, or gowns, but usually choose lighter styling than a bridal outfit. The best guest look feels formal, comfortable, and respectful of the couple or family dress code.',
  },
  {
    question: 'What colors are popular for Pakistani wedding dresses?',
    answer: 'Popular Pakistani wedding dress colors include ivory, gold, champagne, blush, emerald, teal, navy, maroon, wine, red, pink, sage, mint, and soft pastels. Brides may choose richer ceremonial colors, while guests often select jewel tones, metallics, pastels, or lighter embroidered styles.',
  },
  {
    question: 'How do I choose a Pakistani wedding outfit online?',
    answer: 'Start with the event, role, venue, time of day, fabric weight, embroidery level, measurements, sleeve and neckline comfort, dupatta styling, stitching needs, and delivery timeline. Review product photos, sizing notes, fabric details, and care instructions before ordering for a wedding date.',
  },
  {
    question: 'Does LuxeMia Boutique carry Pakistani wedding dresses for brides and guests?',
    answer: 'Yes. LuxeMia Boutique curates Pakistani wedding dresses across bridal-adjacent lehengas, shararas, ghararas, Anarkalis, formal salwar kameez, sarees, gowns, and wedding guest outfits for nikah, mehndi, walima, reception, and family celebration shopping.',
  },
];

const PakistaniWeddingDresses = () => {
  const { products, isLoading } = useShopifyProducts();
  const [sortBy, setSortBy] = useState('featured');

  const nonMenswearProducts = useMemo(
    () => products.filter(product => !menswearIntentPattern.test(getSearchText(product))),
    [products]
  );
  const pakistaniWeddingDressMatches = useMemo(
    () => nonMenswearProducts.filter(product => pakistaniWeddingDressIntentPattern.test(getSearchText(product))),
    [nonMenswearProducts]
  );
  const isUsingFallback = !isLoading && nonMenswearProducts.length > 0 && pakistaniWeddingDressMatches.length < 8;
  const pakistaniWeddingDressProducts = isUsingFallback ? nonMenswearProducts : pakistaniWeddingDressMatches;
  const sortedProducts = useMemo(() => sortProducts(pakistaniWeddingDressProducts, sortBy), [pakistaniWeddingDressProducts, sortBy]);
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
        {...pakistaniWeddingDressesSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Pakistani Wedding Dresses', url: '/collections/pakistani-wedding-dresses' },
        ]}
        collection={{
          name: 'Pakistani Wedding Dresses',
          description: 'Pakistani wedding dresses collection for Pakistani bridal dresses, Pakistani wedding outfits, Pakistani wedding guest dresses, reception dresses, mehndi outfits, nikah dresses, walima dresses, shararas, ghararas, Anarkalis, salwar kameez, lehengas, sarees, and gowns.',
          items: collectionItems,
        }}
        faqs={pakistaniWeddingDressFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Pakistani Wedding Edit</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Pakistani Wedding Dresses</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop Pakistani wedding dresses for nikah ceremonies, mehndi events, walima receptions, wedding guest looks, engagement parties, and formal family celebrations. This LuxeMia Boutique edit brings together Pakistani bridal dresses, Pakistani wedding outfits, Pakistani formal dresses, Pakistani reception dresses, shararas, ghararas, Anarkalis, salwar kameez, lehengas, sarees, and gowns.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>Pakistani wedding dresses</strong>, <strong>Pakistani bridal dresses</strong>, <strong>Pakistani wedding outfits</strong>, <strong>Pakistani wedding guest dresses</strong>, <strong>Pakistani formal dresses</strong>, <strong>Pakistani reception dresses</strong>, <strong>Pakistani mehndi outfits</strong>, <strong>Pakistani nikah dresses</strong>, and <strong>Pakistani walima dresses</strong>. For suit-focused shopping, visit <Link to="/collections/pakistani-suits" className="text-foreground underline underline-offset-2">Pakistani suits</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} Pakistani wedding dresses`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing broader occasion wear while Pakistani wedding dress product signals are limited.
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
                <h3 className="font-serif text-2xl mb-4">Pakistani Wedding Dresses Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The Pakistani wedding dress edit is being curated. Explore Pakistani suits, wedding guest outfits, reception outfits, and mehndi outfits for event-ready styles.
                </p>
                <Button asChild variant="outline">
                  <Link to="/collections/pakistani-suits">Explore Pakistani Suits</Link>
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Pakistani Wedding Dress Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for Pakistani wedding intent</h3>
                <p>
                  This page is focused on Pakistani wedding dresses rather than one silhouette. It brings together Pakistani bridal dresses, formal suits, shararas, ghararas, Anarkalis, salwar kameez, lehengas, sarees, and gowns for wedding shopping.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Nikah, mehndi, and walima aware</h3>
                <p>
                  Wedding shoppers compare embroidery, fabric, color, dupatta styling, movement, sleeve comfort, and delivery timing across nikah ceremonies, mehndi nights, walima receptions, engagements, and family events.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">For brides, family, and guests</h3>
                <p>
                  Pakistani bridal dresses can lean ornate and ceremonial, while Pakistani wedding guest dresses often balance polish, comfort, and celebration-ready detail. This collection keeps both discovery paths close to the shopping grid.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Online wedding support</h3>
                <p>
                  LuxeMia Boutique supports wedding shoppers in the USA, Canada, Australia, and worldwide with tracked shipping, fit options where available, and styling guidance before purchase. Review measurements, stitching, and delivery details before ordering for a wedding date.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Pakistani Wedding Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/collections/pakistani-suits"><Button variant="outline" size="sm">Pakistani Suits</Button></Link>
              <Link to="/collections/sharara-suits"><Button variant="outline" size="sm">Sharara Suits</Button></Link>
              <Link to="/collections/gharara-suits"><Button variant="outline" size="sm">Gharara Suits</Button></Link>
              <Link to="/collections/anarkali-suits"><Button variant="outline" size="sm">Anarkali Suits</Button></Link>
              <Link to="/collections/salwar-kameez"><Button variant="outline" size="sm">Salwar Kameez</Button></Link>
              <Link to="/collections/wedding-guest-dresses"><Button variant="outline" size="sm">Guest Wedding Dresses</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/mehendi-outfits"><Button variant="outline" size="sm">Mehendi Outfits</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/indian-wedding-dresses"><Button variant="outline" size="sm">Indian Wedding Dresses</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Pakistani Wedding Dresses</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {pakistaniWeddingDressFaqs.map((faq, i) => (
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

export default PakistaniWeddingDresses;
