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

const mehendiSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/mehendi-outfits'));

const mehendiOutfitFaqs = [
  {
    question: 'What should I wear to a mehendi ceremony?',
    answer: 'The mehendi ceremony is a daytime, casual pre-wedding celebration traditionally associated with the colours yellow and green. Guests typically wear bright, cheerful ethnic outfits in yellow, lime green, mustard, orange, or floral prints. Salwar kameez, anarkali suits, and simple lehengas are the most popular choices. Avoid heavy silk sarees or highly formal outfits as the mehendi ceremony is fun and relaxed. Light, breathable fabrics like georgette, chiffon, cotton, and crepe are ideal since the event is often held outdoors or in a garden setting.',
  },
  {
    question: 'What colors are traditional for a mehendi ceremony outfit?',
    answer: 'Yellow and green are the signature colours of mehendi ceremonies in most Indian cultures — yellow representing turmeric (haldi) and new beginnings, green representing nature and the mehendi plant itself. Mustard, saffron orange, lime green, and coral are all popular mehendi outfit colours for both the bride and guests. Floral prints and pastel shades are also widely worn. Avoid white (inauspicious), red (reserved for the bride), and overly dark colours like black and navy for this daytime celebration.',
  },
  {
    question: 'Should the bride wear yellow to her own mehendi?',
    answer: 'Yes, yellow is considered the most traditional and auspicious colour for the bride at her mehendi ceremony. The yellow turmeric (haldi) symbolises prosperity, beauty, and the blessing of the ceremony. Most Indian brides wear a yellow lehenga, yellow salwar kameez, or yellow saree for their mehendi. However, modern brides also choose pastel green, coral, peach, or floral lehengas for a contemporary take on the mehendi look.',
  },
  {
    question: 'Do you ship mehendi outfits to the USA, Canada, and Australia?',
    answer: 'Yes, LuxeMia ships mehendi ceremony outfits and all Indian ethnic wear to the USA, Canada, Australia, and worldwide. Free shipping on orders over $350 USD, flat rate $25 for orders under $350. All orders are fully tracked. For wedding functions, order at least 3–4 weeks before the event to ensure timely delivery. Standard delivery takes 7–10 business days after dispatch.',
  },
  {
    question: 'Can guests wear any colour other than yellow and green to a mehendi?',
    answer: 'Absolutely. While yellow and green are traditional, guests at modern Indian mehendi ceremonies wear a wide range of bright and festive colours — pink, coral, peach, lavender, turquoise, and orange are all popular. The key is to choose something vibrant, cheerful, and celebration-appropriate. Simple anarkali suits, salwar kameez, and lehengas in floral prints or light embroidery are perfect for the mehendi ceremony regardless of colour.',
  },
];

const MehendiOutfits = () => {
  const { products, isLoading } = useShopifyProducts();
  const [sortBy, setSortBy] = useState('featured');
  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        {...mehendiSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Occasions', url: '/collections' },
          { name: 'Mehendi Outfits', url: '/collections/mehendi-outfits' },
        ]}
        faqs={mehendiOutfitFaqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">

        {/* Hero */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Pre-Wedding Celebrations</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Mehendi Ceremony Outfits</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
              Celebrate the joyful mehendi ceremony in vibrant, festive Indian ethnic wear. Our mehendi collection features bright yellow and green lehengas, floral salwar kameez sets, embroidered anarkali suits, and light georgette sarees — all in the cheerful colours traditionally associated with henna celebrations. Perfect for the bride, bridesmaids, and all guests attending Indian mehendi ceremonies in the USA, Canada, Australia, or anywhere in the world.
            </p>
          </div>
        </div>

        {/* Keyword intro */}
        <div className="bg-background border-b border-border/20 py-5">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Shop <strong>yellow lehengas for mehendi</strong>, <strong>green salwar kameez for mehendi functions</strong>, <strong>floral anarkali suits</strong>, <strong>mehendi ceremony sarees</strong>, and <strong>bridal mehendi outfits</strong>. Light fabrics in festive colours — perfect for outdoor garden celebrations. Free shipping to <strong>USA</strong>, <strong>Canada</strong>, and <strong>Australia</strong>.
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

        {/* About section */}
        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="font-serif text-2xl mb-6 text-center">Mehendi Ceremony Outfit Guide</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>The mehendi ceremony is one of the most beloved pre-wedding rituals in Indian culture — a joyful afternoon of henna application, music, dance, and family togetherness. Traditionally held one or two days before the main wedding, the mehendi is a casual, intimate celebration that calls for bright, cheerful ethnic wear rather than heavy formal attire.</p>
              <p><strong>Yellow is the quintessential mehendi colour</strong>, symbolising turmeric, new beginnings, and the blessing of Goddess Lakshmi. The bride traditionally wears yellow — a yellow lehenga, yellow salwar kameez, or yellow saree — and guests are encouraged to join in the yellow and green colour theme. Mustard, saffron, lime green, coral, and floral prints are all celebration-appropriate choices for mehendi guests.</p>
              <p>Since mehendi ceremonies are often held outdoors — in gardens, on terraces, or in open courtyards — <strong>fabric choice is important</strong>. Light, breathable fabrics like georgette, chiffon, cotton, crepe, and rayon are ideal. Heavy brocade or stiff silk can feel uncomfortable in outdoor settings. Look for <strong>light embroidery, gota patti work, mirror detailing, and block print</strong> rather than heavy zari or stone work for a mehendi-appropriate outfit.</p>
              <p>For the bride, a matching jewellery set in gold, floral motifs, or polki stones complements the mehendi aesthetic beautifully. For guests, simple gold jewellery, floral accessories, or colourful bangles complete the look perfectly.</p>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">More Wedding Occasion Outfits</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/bridal-lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Anarkali Suits</Button></Link>
              <Link to="/collections/wedding-sarees"><Button variant="outline" size="sm">Wedding Sarees</Button></Link>
              <Link to="/collections/diwali-outfits"><Button variant="outline" size="sm">Diwali Outfits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions — Mehendi Outfits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {mehendiOutfitFaqs.map((faq, i) => (
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

export default MehendiOutfits;
