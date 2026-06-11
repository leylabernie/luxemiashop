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

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const receptionOutfitsSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/reception-outfits'));

const receptionOutfitFaqs = [
  {
    question: 'What should I wear to an Indian wedding reception?',
    answer: 'Indian wedding receptions are usually evening events, so polished semi-formal to formal ethnic wear works well. Reception lehengas, reception sarees, anarkali gowns, Indo-western outfits, embellished suits, and cocktail-ready party wear are all appropriate. Choose the outfit based on venue, dress code, comfort, and how closely you are related to the couple.',
  },
  {
    question: 'Are lehengas good for wedding reception outfits?',
    answer: 'Yes. Reception lehengas are a strong choice for brides, sisters, close family members, and guests who want a formal Indian outfit. Sequins, beadwork, metallic embroidery, velvet, satin, georgette, and net styles can feel especially reception-ready. Lighter lehengas are easier for dancing and long evening events.',
  },
  {
    question: 'Can I wear a saree to a cocktail or reception event?',
    answer: 'A saree is one of the most versatile reception outfits. For cocktail receptions, look for satin, silk, georgette, chiffon, tissue, sequined, or ready-to-drape sarees. Keep the blouse, jewelry, and footwear aligned with the event: sleek styling works well for modern cocktail receptions, while richer borders and zari can suit formal family receptions.',
  },
  {
    question: 'What are Indo-western reception outfits?',
    answer: 'Indo-western reception outfits combine Indian details with contemporary silhouettes. Examples include cape sets, jacket-style outfits, gowns with Indian embroidery, fusion lehenga sets, sharara gowns, and coordinated sets. They are useful for guests who want an Indian reception look that still feels modern and easy to wear.',
  },
  {
    question: 'Which colors work best for reception outfits?',
    answer: 'Evening reception outfits often work well in black, navy, wine, emerald, champagne, silver, gold, blush, ivory, and jewel tones. Sequins and metallic thread photograph well under reception lighting. If you are a guest, avoid looking more bridal than the couple and follow any family or venue dress code.',
  },
  {
    question: 'How should I choose reception outfits online?',
    answer: 'Check the fabric, work type, blouse or top details, stitching options, delivery timing, and product photos before ordering. If your reception date is close, prioritize ready-to-wear or clearly available styles. For made-to-measure or custom fit options, allow extra time and contact LuxeMia before purchase if you need sizing support.',
  },
];

const ReceptionOutfits = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('reception-outfits');
  const [sortBy, setSortBy] = useState('featured');

  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
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
        {...receptionOutfitsSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Reception Outfits', url: '/collections/reception-outfits' },
        ]}
        collection={{
          name: 'Reception Outfits for Indian Weddings',
          description: 'Reception-focused collection of Indian reception outfits, reception lehengas, reception sarees, Indo-western reception outfits, gowns, cocktail outfits, and party wear styles for wedding reception shopping.',
          items: collectionItems,
        }}
        faqs={receptionOutfitFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Reception and Cocktail Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Reception Outfits for Indian Weddings</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop Indian reception outfits selected for wedding receptions, cocktail events, engagement parties, sangeet nights, and formal evening celebrations. This edit brings together reception lehengas, reception sarees, Indo-western reception outfits, gowns, and party wear Indian outfits for shoppers who want a polished event look online.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>reception outfits</strong>, <strong>reception lehengas</strong>, <strong>reception sarees</strong>, <strong>reception gowns</strong>, <strong>Indo-western reception outfits</strong>, <strong>cocktail reception outfits</strong>, and <strong>party wear Indian outfits</strong>. For broader wedding shopping, visit <Link to="/collections/wedding-guest-outfits" className="text-foreground underline underline-offset-2">wedding guest outfits</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} reception-ready styles`}
              </p>
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
                <h3 className="font-serif text-2xl mb-4">Reception Outfits Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The reception edit is being curated. Explore wedding guest outfits for sarees, lehengas, suits, and Indo-western styles that work for formal evening events.
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Reception Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for evening events</h3>
                <p>
                  This page is focused on reception and cocktail styling, not every wedding ceremony. It highlights polished Indian outfits for evening receptions, engagement parties, sangeet nights, and formal guest looks.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Reception-ready categories</h3>
                <p>
                  Shoppers can compare reception lehengas, reception sarees, gowns, embellished suits, and Indo-western reception outfits in one focused path instead of browsing every broad product category.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Cocktail and party wear details</h3>
                <p>
                  Look for evening-friendly details such as sequins, beadwork, metallic embroidery, satin, velvet, georgette, net, jackets, cape styling, and sleek drapes. Availability depends on the live Shopify product catalog.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Online reception shopping support</h3>
                <p>
                  LuxeMia supports wedding reception shoppers with tracked shipping, fit options where available, and styling guidance before purchase. Review each product's sizing, stitching, and delivery details before ordering.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Reception Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/lehengas"><Button variant="outline" size="sm">Reception Lehengas</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Reception Sarees</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Anarkali Suits</Button></Link>
              <Link to="/indowestern"><Button variant="outline" size="sm">Indo-Western</Button></Link>
              <Link to="/collections/wedding-sarees"><Button variant="outline" size="sm">Wedding Sarees</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Reception Outfits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {receptionOutfitFaqs.map((faq, i) => (
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

export default ReceptionOutfits;
