import { useState, useMemo } from 'react';
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

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const weddingGuestSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/wedding-guest-outfits'));

const weddingGuestFaqs = [
  {
    question: 'What should I wear as a guest to an Indian wedding?',
    answer: 'Indian weddings are vibrant, celebratory occasions and guests are expected to dress in elegant ethnic or semi-ethnic attire. Sarees, salwar kameez, anarkali suits, lehengas, and indo-western fusion outfits are all appropriate for Indian wedding guests. The outfit choice also depends on the specific ceremony — a sangeet calls for fun and colourful outfits, while the main wedding ceremony warrants more formal and traditional looks. For non-Indian guests attending for the first time, a salwar kameez or anarkali suit is an easy, elegant, and culturally respectful choice.',
  },
  {
    question: 'What colors should a wedding guest avoid at an Indian wedding?',
    answer: 'At Indian weddings, guests traditionally avoid wearing white (associated with mourning) and red (the colour of the bride\'s lehenga or saree). Black was once considered inauspicious but is now widely worn at modern Indian wedding receptions and evening events. As a general rule, avoid outfits that could be mistaken for the bridal ensemble. Beyond these, the more festive and colourful your outfit, the better — Indians love vibrant colours at celebrations. Pink, teal, gold, purple, green, and blue are all excellent choices for wedding guests.',
  },
  {
    question: 'Should I wear a saree or salwar kameez to an Indian wedding as a guest?',
    answer: 'Both are excellent choices for an Indian wedding guest. A saree is considered the most elegant and traditional option, and wearing one as a non-Indian guest is deeply appreciated as a sign of cultural respect. A salwar kameez or anarkali suit is easier to wear, more comfortable for all-day celebrations, and just as appropriate. For the sangeet or mehendi ceremony, a colourful salwar suit or lehenga is festive and fun. For the main wedding ceremony and reception, a silk saree or heavily embroidered anarkali is perfect.',
  },
  {
    question: 'Do you ship Indian wedding guest outfits to the USA, Canada, and Australia?',
    answer: 'Yes, LuxeMia ships Indian wedding guest outfits to the USA, Canada, Australia, and worldwide. Free shipping on orders over $350 USD. For orders under $350, a flat shipping rate of $25 applies. All orders are fully tracked and insured. We recommend ordering 3–4 weeks before the wedding to ensure timely delivery. Standard delivery takes 7–10 business days after dispatch from India.',
  },
  {
    question: 'Can I wear the same outfit to multiple events at an Indian wedding?',
    answer: 'Indian weddings typically span multiple ceremonies — mehendi, sangeet, haldi, the wedding ceremony, and the reception — and each has its own dress code. It is perfectly acceptable to wear different outfits to different events. Many guests wear a lighter, more colourful outfit for daytime ceremonies (mehendi, haldi) and reserve a more formal, heavily embroidered outfit for the main wedding or reception. If you can only buy one outfit, choose a semi-formal anarkali or salwar kameez that works across multiple ceremonies.',
  },
];

const WeddingGuestOutfits = () => {
  const { products, isLoading } = useShopifyProducts();
  const [sortBy, setSortBy] = useState('featured');
  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        {...weddingGuestSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Occasions', url: '/collections' },
          { name: 'Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
        ]}
        faqs={weddingGuestFaqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">

        {/* Hero */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Wedding Season</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Indian Wedding Guest Outfits</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
              Dress to impress at every Indian wedding ceremony — from the colourful mehendi and vibrant sangeet to the elegant wedding day and glamorous reception. LuxeMia's wedding guest collection features silk sarees, embroidered anarkali suits, festive lehengas, and salwar kameez sets in celebration-worthy fabrics and colours. Whether you are a close family member, a colleague, or attending an Indian wedding for the first time, we have the perfect outfit for you — shipped directly to your door in the USA, Canada, or Australia.
            </p>
          </div>
        </div>

        {/* Keyword intro */}
        <div className="bg-background border-b border-border/20 py-5">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Shop <strong>wedding guest sarees</strong>, <strong>anarkali suits for Indian weddings</strong>, <strong>lehengas for wedding guests</strong>, <strong>salwar kameez for weddings</strong>, and <strong>indo-western outfits for receptions</strong>. Gorgeous colours including pink, teal, gold, purple, and royal blue. Free shipping to <strong>USA</strong>, <strong>Canada</strong>, and <strong>Australia</strong> on orders over $350.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-border/30 bg-background sticky top-[90px] lg:top-[132px] z-30">
          <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading…' : `${sortedProducts.length} styles`}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-sm font-light">
                  Sort: {currentSort} <ChevronDown className="w-4 h-4" />
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
        </div>

        {/* Product Grid */}
        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
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
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            >
              {sortedProducts.map((product, index) => (
                <ProductCard key={product.node.id} product={product} index={index} />
              ))}
            </motion.div>
          )}
        </section>

        {/* Ceremony-by-ceremony guide */}
        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="font-serif text-2xl mb-6 text-center">What to Wear to Each Indian Wedding Ceremony</h2>
            <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-1">Mehendi Ceremony</h3>
                <p>The mehendi is a daytime ceremony traditionally associated with the colour yellow and green. Guests wear bright, cheerful salwar kameez, anarkali suits, or simple lehengas in yellow, lime green, orange, or floral prints. Avoid heavily embellished outfits as the mehendi ceremony is casual and fun. Cotton, georgette, or chiffon fabrics in festive colours are ideal.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Sangeet Night</h3>
                <p>The sangeet is an evening of music and dance — the most festive and lively of all Indian wedding ceremonies. Guests wear their most glamorous outfits: embellished lehengas, sequin anarkalis, heavily embroidered salwar suits, or indo-western fusion outfits. Bold colours, mirror work, and sequin embellishments photograph beautifully at sangeet events. This is the ceremony to wear your most statement-making ethnic wear.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Wedding Ceremony</h3>
                <p>The main wedding ceremony is the most formal of all events. Guests dress in their most elegant ethnic wear — silk sarees, heavily embroidered anarkali gowns, formal lehengas, or sophisticated salwar kameez. Avoid wearing red (the traditional bridal colour) and white. Rich jewel tones, gold, and pastel shades are perfect for the main wedding ceremony.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Reception</h3>
                <p>The reception is an evening cocktail-style event and the most flexible in terms of dress code. Semi-formal to formal ethnic or indo-western outfits are appropriate. This is a great occasion to wear an elegant silk saree, a fusion indo-western gown, or a formal anarkali. The reception is also where non-Indian guests often feel most comfortable in a Western-style ethnic fusion outfit.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related collections */}
        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Shop by Wedding Ceremony</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Silk Sarees</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Anarkali Suits</Button></Link>
              <Link to="/indowestern"><Button variant="outline" size="sm">Indo-Western</Button></Link>
              <Link to="/collections/mehendi-outfits"><Button variant="outline" size="sm">Mehendi Outfits</Button></Link>
              <Link to="/menswear"><Button variant="outline" size="sm">Menswear</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions — Indian Wedding Guest Outfits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {weddingGuestFaqs.map((faq, i) => (
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

export default WeddingGuestOutfits;
