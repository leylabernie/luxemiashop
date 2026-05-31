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

const eidSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/eid-outfits'));

const eidOutfitFaqs = [
  {
    question: 'What should I wear for Eid?',
    answer: 'Eid is a joyous Islamic festival celebrated with prayer, family gatherings, feasting, and visiting friends. The traditional dress code for Eid calls for clean, elegant, and festive Indian ethnic wear. Popular choices include salwar kameez, anarkali suits, sharara sets, lehengas, and georgette or silk sarees. Light, embellished fabrics in pastel shades, pastels, whites, and jewel tones are all Eid-appropriate. For Eid prayer in the morning, a simple but elegant salwar kameez or abaya-style outfit is most appropriate. For the afternoon and evening celebrations, more embellished outfits are worn.',
  },
  {
    question: 'What colors are popular for Eid outfits?',
    answer: 'White, pastels, and light shades are traditionally associated with Eid as symbols of purity and new beginnings. Ivory, cream, baby pink, mint green, sky blue, lilac, and peach are all classic Eid outfit colours. Gold and silver embellishments on any colour are considered festive and celebratory. In South Asian Muslim communities, red, royal blue, and emerald green are also widely worn for Eid, especially for evening gatherings. Pakistani and Indian fashion-influenced Eid outfits often feature heavy chikankari embroidery, gota patti work, and delicate sequin embellishments on pastel or white fabrics.',
  },
  {
    question: 'What style of Indian outfit is best for Eid?',
    answer: 'Salwar kameez and sharara sets are among the most popular choices for Eid, combining elegance with comfort for a full day of celebrations. Chikankari embroidery on white or pastel fabric is considered quintessentially Eid-appropriate in South Asian fashion. Pakistani-style straight cut kameez with palazzo or cigarette pants, Anarkali suits in georgette, and embroidered gharara sets are also very popular. For Eid Ul-Adha which may involve outdoor gatherings, lighter and more practical outfits like cotton or chanderi salwar kameez sets are the most comfortable choice.',
  },
  {
    question: 'Do you ship Eid outfits to the USA, Canada, and Australia?',
    answer: 'Yes, LuxeMia ships Eid outfits and Indian ethnic wear for Eid celebrations to the USA, Canada, Australia, and worldwide. Free shipping on orders over $350 USD, flat rate $25 for orders under $350. All orders include full tracking and insurance. For Eid, we recommend ordering at least 3–4 weeks before the celebration to ensure timely delivery. Standard delivery takes 7–10 business days after dispatch from India.',
  },
  {
    question: 'Can I wear a lehenga for Eid?',
    answer: 'Yes, lehengas are a popular choice for Eid celebrations, especially for evening gatherings, Eid parties, and special family functions. A heavily embroidered or embellished lehenga in white, ivory, pastel pink, or mint green looks stunning for Eid. Sharara sets — a traditional alternative to lehengas with wide-leg flared pants — are also an extremely popular Eid outfit choice in Pakistani and North Indian Muslim fashion traditions. Choose delicate zari, gota patti, or chikankari embroidery for an authentic Eid aesthetic.',
  },
];

const EidOutfits = () => {
  const { products, isLoading } = useShopifyProducts();
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
        {...eidSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Occasions', url: '/collections' },
          { name: 'Eid Outfits', url: '/collections/eid-outfits' },
        ]}
        collection={{
          name: 'Eid Outfits 2026',
          description: 'Festive South Asian and Indian ethnic wear collection for Eid celebrations, including chikankari suits, sharara sets, Eid anarkali dresses, Pakistani suits, pastel salwar kameez, and lehengas.',
          items: collectionItems,
        }}
        faqs={eidOutfitFaqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">

        {/* Hero */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Eid Mubarak</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Eid Outfits 2026</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
              Celebrate Eid in elegance with LuxeMia's curated collection of Indian ethnic wear for Eid festivities. From delicate chikankari salwar kameez and embroidered sharara sets to pastel lehengas and georgette anarkali suits, our Eid collection brings together the finest South Asian fashion traditions. Whether you prefer the classic white and ivory aesthetic or prefer jewel tones and pastels, shop Eid outfits with free shipping to the USA, Canada, and Australia.
            </p>
          </div>
        </div>

        {/* Keyword intro */}
        <div className="bg-background border-b border-border/20 py-5">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Shop <strong>chikankari suits for Eid</strong>, <strong>sharara sets for Eid</strong>, <strong>Eid anarkali dresses</strong>, <strong>Pakistani suits for Eid</strong>, <strong>white lehengas for Eid</strong>, and <strong>pastel salwar kameez for Eid celebrations</strong>. Free shipping to <strong>USA</strong>, <strong>Canada</strong>, and <strong>Australia</strong> on orders over $350.
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
            <h2 className="font-serif text-2xl mb-6 text-center">Eid Outfit Guide — What to Wear for Eid Celebrations</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>Eid is celebrated twice a year — Eid Ul-Fitr (marking the end of Ramadan) and Eid Ul-Adha — and both are occasions for new clothes, family gatherings, and joyful celebrations. In South Asian Muslim culture, wearing new Indian ethnic wear for Eid is a deeply cherished tradition.</p>
              <p>For Eid morning prayers, a <strong>modest and elegant salwar kameez or anarkali suit</strong> in white, cream, or pastel shades is the most appropriate choice. After prayers, many families change into more embellished celebration outfits for family visits and Eid lunch or dinner gatherings. <strong>Chikankari embroidery</strong> — the intricate shadow-work embroidery from Lucknow — is considered the quintessential Eid fabric, traditionally done on white or pastel muslin, cotton, or georgette.</p>
              <p><strong>Sharara sets</strong> — wide-leg flared pants paired with embroidered kurtas and dupattas — have long been a signature Eid outfit in Pakistani and North Indian Muslim fashion. They offer a graceful, traditional silhouette that is both comfortable and elegant for all-day celebrations. <strong>Pastel lehengas</strong> in mint green, baby pink, lavender, and sky blue are equally popular for Eid evening gatherings.</p>
              <p>For Eid Ul-Adha, which often involves outdoor activities, lighter and more practical fabrics like <strong>cotton, chanderi, or light georgette</strong> in simple embroidery are most comfortable. Gold and silver zari border work on pastel fabrics creates a beautifully festive look without excessive embellishment.</p>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">More Festive Occasion Collections</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/suits"><Button variant="outline" size="sm">Salwar Kameez & Anarkali</Button></Link>
              <Link to="/lehengas"><Button variant="outline" size="sm">Lehengas</Button></Link>
              <Link to="/indowestern"><Button variant="outline" size="sm">Indo-Western</Button></Link>
              <Link to="/collections/diwali-outfits"><Button variant="outline" size="sm">Diwali Outfits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions — Eid Outfits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {eidOutfitFaqs.map((faq, i) => (
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

export default EidOutfits;
