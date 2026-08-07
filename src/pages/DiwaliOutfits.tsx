import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RelatedOccasions from '@/components/seo/RelatedOccasions';
import SEOHead from '@/components/seo/SEOHead';
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

const diwaliOutfitFaqs = [
  {
    question: 'What should I wear for Diwali?',
    answer: 'Diwali calls for festive, vibrant ethnic wear that celebrates joy and prosperity. Traditional choices include lehengas, salwar kameez, anarkali suits, and silk sarees. Popular Diwali colors include gold, red, deep green, royal blue, and orange — colors that reflect the warmth of the festival. For Diwali pooja at home, a silk or cotton salwar kameez is ideal. For a Diwali party or get-together, a lehenga or anarkali suit with zari, sequins, or mirror work is a stunning choice.',
  },
  {
    question: 'What colors are traditional for Diwali outfits?',
    answer: 'Gold is the quintessential Diwali color as it represents prosperity. Red is equally auspicious and widely worn for Diwali poojas. Other popular colors include deep green, royal purple, burnt orange, fuchsia pink, and navy blue. Traditionally, white and black are avoided for Diwali. Fabrics with gold zari work, sequin embellishments, or mirror details catch the Diwali diyas beautifully and photograph magnificently at festive gatherings.',
  },
  {
    question: 'Should I wear a saree, lehenga, or anarkali for Diwali?',
    answer: 'All three are excellent Diwali choices depending on the occasion. Lehengas are ideal for Diwali parties and evening get-togethers — glamorous and festive. Anarkali suits are more practical for visiting relatives and daytime celebrations where you need to move freely. Silk sarees are perfect for a traditional Diwali look, especially for elder family gatherings. Indo-western fusion outfits like cape sets or palazzo suits are popular for modern Diwali parties in the USA and the United States.',
  },
  {
    question: 'Do you ship Diwali outfits to the United States?',
    answer: 'LuxeMia ships Diwali outfits to U.S. addresses only. Shipping is free at $150 and above and costs a flat $12 below that. Tracking is provided after dispatch. Confirm timing before ordering for a fixed celebration date.',
  },
  {
    question: 'What accessories should I pair with my Diwali outfit?',
    answer: 'Gold jewellery is the classic Diwali accessory — kundan sets, polki necklaces, jhumka earrings, and gold bangles. For a lehenga, a maang tikka and statement necklace complete the look. For an anarkali or salwar kameez, layered necklaces or a choker with matching jhumkas works beautifully. Embellished clutch bags in gold or jewel tones and kolhapuri sandals or heels finish the Diwali ensemble perfectly.',
  },
];

const DiwaliOutfits = () => {
  const { products, isLoading } = useShopifyProducts();
  const [sortBy, setSortBy] = useState('featured');
  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Diwali Outfits for Women 2026 — Indian Ethnic Wear for Diwali | LuxeMia"
        description="Shop Diwali outfits for women at LuxeMia. Lehengas, anarkali suits, sarees & salwar kameez in gold, red & festive colors. Free U.S. shipping at $150 and above."
        canonical="https://luxemia.shop/collections/diwali-outfits"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Occasions', url: '/collections' },
          { name: 'Diwali Outfits', url: '/collections/diwali-outfits' },
        ]}
        faqs={diwaliOutfitFaqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">

        {/* Hero */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Festival of Lights</span>
            </div>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Diwali Outfits 2026</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
              Celebrate the festival of lights with current festive Indian ethnic-wear listings, from embroidered lehengas and Anarkali suits to silk sarees and salwar kameez. Product pages state the supplied fabric, work, included pieces, sizes, price, and availability. LuxeMia ships to United States addresses only, with free U.S. shipping at $150 and above.
            </p>
          </div>
        </div>

        {/* Keyword intro */}
        <div className="bg-background border-b border-border/20 py-5">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Shop <strong>Diwali lehengas</strong>, <strong>festive anarkali suits</strong>, <strong>silk sarees for Diwali</strong>, <strong>sharara sets</strong>, and <strong>indo-western Diwali outfits</strong> in traditional colors of gold, red, deep green, royal blue, and orange. Delivery is available to the United States.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-border/30 bg-background sticky top-[90px] lg:top-[132px] z-30">
          <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading…' : `${sortedProducts.length} festive styles`}
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
            <h2 className="font-serif text-2xl mb-6 text-center">What to Wear for Diwali — Style Guide</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>Diwali, the Hindu festival of lights, is one of the most celebrated occasions in the Indian diaspora — and it calls for festive, vibrant ethnic wear. In 2026, the main Diwali day falls on <strong>Sunday, November 8</strong>. Confirm product and delivery timing with LuxeMia before ordering for a fixed celebration date.</p>
              <p>For the main Diwali day and Lakshmi Puja, traditional <strong>silk sarees</strong> in red, gold, or green are considered auspicious. For the earlier part of the day, a comfortable but elegant <strong>salwar kameez or anarkali suit</strong> in Banarasi silk or chanderi is ideal for prayer rituals. For the Diwali party or evening celebrations, a heavily embellished <strong>lehenga with mirror work, zari embroidery, or sequin detailing</strong> photographs beautifully against the backdrop of diyas and fairy lights.</p>
              <p>A <strong>velvet anarkali</strong> in deep jewel tones — emerald green, royal purple, or midnight blue — with gold zari and dupatta is a timeless festive choice. For a modern look, <strong>indo-western cape sets, palazzo suits, or sharara co-ord sets</strong> in metallic fabrics are extremely popular at Diwali parties across the USA and the United States.</p>
              <p><strong>Gold is the quintessential Diwali color</strong> — representing prosperity and the blessing of Goddess Lakshmi. Pair your Diwali outfit with kundan jewelry, jhumka earrings, and gold bangles for the complete festive look.</p>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Diwali Outfit by Setting — Which One Are You Attending?</h3>
                <p>What you wear for Diwali depends heavily on the setting. For <strong>Lakshmi Puja at home</strong>, a silk saree or cotton salwar kameez in auspicious colors (red, gold, deep green) is ideal — natural fibers are preferred for religious ceremonies. For a <strong>Diwali party</strong>, choose an embellished lehenga or sequin anarkali in jewel tones (emerald, sapphire, plum) — the more sparkle, the better. For an <strong>office Diwali celebration</strong>, go indo-western — a palazzo suit or contemporary anarkali in muted festive colors. For a <strong>community Diwali event</strong>, anarkalis or salwar kameez with comfortable flats are practical for 4-6 hour events.</p>
                <p className="mt-2">For more practical ideas for celebrating abroad, read our <Link to="/blog/styling-indian-ethnic-wear-festive-occasions-abroad" className="text-primary underline font-medium">festive Indian outfit styling guide</Link>.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Diwali Color Etiquette — What to Wear and What to Avoid</h3>
                <p><strong>DO wear:</strong> Gold (prosperity, Lakshmi blessing), red (joy), deep green (growth), royal blue (photographs beautifully), maroon (sophisticated alternative to red), orange/saffron (courage, spirituality), purple (royalty, modern).</p>
                <p className="mt-2"><strong>AVOID:</strong> Black (inauspicious for Hindu celebrations), pure white (mourning color), dull grey (lacks festive energy). Some modern Diwali parties may welcome black with a "cocktail" theme, but when in doubt, choose a festive color instead.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">When to Order Your Diwali Outfit</h3>
                <p>For a fixed event or festival date, review the selected product and options, then contact LuxeMia before ordering to confirm timing. Orders ship to U.S. addresses only with tracking after dispatch. Shipping is $12 below $150 and free at $150 and above.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Related Guides</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><Link to="/blog/styling-indian-ethnic-wear-festive-occasions-abroad" className="text-primary underline">Festive Indian Outfit Styling Guide</Link></li>
                  <li><Link to="/collections/navratri-outfits" className="text-primary underline">Navratri Outfits</Link></li>
                  <li><Link to="/blog/wedding-guest-outfit-ideas" className="text-primary underline">Indian Wedding Guest Outfit Guide 2026</Link></li>
                  <li><Link to="/lehengas" className="text-primary underline">Shop Lehengas</Link> | <Link to="/sarees" className="text-primary underline">Shop Sarees</Link> | <Link to="/suits" className="text-primary underline">Shop Anarkali Suits</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related collections */}
        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">More Festive Collections</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Silk Sarees</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Anarkali Suits</Button></Link>
              <Link to="/indowestern"><Button variant="outline" size="sm">Indo-Western</Button></Link>
              <Link to="/collections/eid-outfits"><Button variant="outline" size="sm">Eid Outfits</Button></Link>
              <Link to="/collections/navratri-outfits"><Button variant="outline" size="sm">Navratri Outfits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions — Diwali Outfits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {diwaliOutfitFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-background border border-border rounded-lg px-5">
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <RelatedOccasions currentOccasion="diwali" />

      <Footer />
    </div>
  );
};

export default DiwaliOutfits;
