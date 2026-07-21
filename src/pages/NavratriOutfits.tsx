import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
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

const navratriOutfitFaqs = [
  {
    question: 'What should I wear for Navratri and Garba?',
    answer: 'Navratri is a nine-night Hindu festival celebrated with Garba and Dandiya Raas dancing, and the traditional dress for Navratri is the chaniya choli — a three-piece outfit consisting of a flared skirt (chaniya), a fitted blouse (choli), and a dupatta. The chaniya choli is traditionally made in bright, vibrant colors with mirror work, bandhani prints, embroidery, or gota patti detailing. Each of the nine nights of Navratri is traditionally associated with a specific color, and many participants dress according to the day\'s color. Lehengas, anarkali suits, and salwar kameez in festive colors are also popular alternatives for Navratri guests who prefer a less traditional look.',
  },
  {
    question: 'What are the nine colors of Navratri 2026?',
    answer: 'The nine colors of Navratri 2026 are traditionally assigned to each day by the Hindu calendar (Panchang). The sequence typically follows: Day 1 — Royal Blue or Yellow, Day 2 — Green, Day 3 — Grey or Silver, Day 4 — Orange, Day 5 — White, Day 6 — Red, Day 7 — Royal Blue, Day 8 — Pink, Day 9 — Purple or Violet. These colors are associated with the nine forms of Goddess Durga worshipped during Navratri. While the exact color sequence varies slightly by region and year, wearing bright festive colors in the traditional Navratri palette is always appropriate for Garba and Dandiya celebrations.',
  },
  {
    question: 'What is the difference between a chaniya choli and a lehenga?',
    answer: 'A chaniya choli is the traditional Gujarati and Rajasthani three-piece outfit specifically associated with Navratri and Garba dancing — it features a very full, circular-cut flared skirt designed for movement during Garba, paired with a short fitted choli blouse and dupatta. The skirt is typically made from lightweight fabrics like georgette, cotton, or rayon with mirror work, bandhani prints, or heavy embroidery. A lehenga is a more formal, bridal-style flared skirt that is heavier, more structured, and typically more embellished. For Garba dancing, a chaniya choli is the practical and traditional choice — the lighter fabric and fuller flare allow freedom of movement. For watching Navratri celebrations or attending Navratri events without dancing, a lehenga is equally beautiful.',
  },
  {
    question: 'Do you ship Navratri outfits to the USA, Canada, and Australia?',
    answer: 'Yes, LuxeMia ships Navratri chaniya cholis, lehengas, and Indian ethnic wear for Navratri celebrations to the USA, Canada, Australia, and worldwide. Free shipping on orders over $350 USD, flat rate $25 for orders under $350. All orders include full tracking and insurance. For Navratri, we recommend ordering at least 3–4 weeks before the festival to ensure timely delivery. Standard delivery takes 7–10 business days after dispatch from India.',
  },
  {
    question: 'What accessories should I wear with a Navratri outfit?',
    answer: 'Traditional Navratri accessories include heavy oxidised silver or gold jewellery — large jhumka earrings, layered necklaces, stacked bangles, and a maang tikka. Mirror-work jewellery, tribal silver, and polki stone sets complement chaniya cholis beautifully. For Garba dancing, avoid heavy necklaces that may get caught during spinning. Kolhapuri sandals or traditional mojari shoes are the classic Navratri footwear. Many participants also carry dandiya sticks — decorated wooden sticks used in Dandiya Raas — which are often color-matched to the outfit.',
  },
];

const NavratriOutfits = () => {
  const { products, isLoading } = useShopifyProducts();
  const [sortBy, setSortBy] = useState('featured');
  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Navratri Outfits 2026 — Chaniya Choli & Garba Dress Collection | LuxeMia"
        description="Shop Navratri outfits 2026 at LuxeMia. Chaniya choli, garba lehengas & festive Indian ethnic wear in all nine Navratri colors. Free shipping to USA, Canada & Australia."
        canonical="https://luxemia.shop/collections/navratri-outfits"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Occasions', url: '/collections' },
          { name: 'Navratri Outfits', url: '/collections/navratri-outfits' },
        ]}
        faqs={navratriOutfitFaqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">

        {/* Hero */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Nine Nights of Celebration</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Navratri Outfits — Chaniya Choli & Garba Dress Collection</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
              Celebrate nine nights of Garba and Dandiya Raas in the most vibrant Indian ethnic wear. LuxeMia's Navratri collection features traditional chaniya cholis in mirror work and bandhani prints, festive lehengas in all nine Navratri colors, embroidered salwar kameez, and anarkali suits that move beautifully on the dance floor. Whether you are dressing for Garba in Gujarat, a community Navratri event in the USA, Canada, or Australia, or simply celebrating the festival with family, our collection brings the spirit of Navratri to the global Indian diaspora.
            </p>
          </div>
        </div>

        {/* Keyword intro */}
        <div className="bg-background border-b border-border/20 py-5">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Shop <strong>chaniya choli for Navratri</strong>, <strong>garba dress 2026</strong>, <strong>Navratri lehengas in nine colors</strong>, <strong>mirror work chaniya choli</strong>, <strong>bandhani print outfits</strong>, and <strong>festive anarkali suits for Garba</strong>. Free shipping to <strong>USA</strong>, <strong>Canada</strong>, and <strong>Australia</strong> on orders over $350.
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
            <h2 className="font-serif text-2xl mb-6 text-center">Navratri Outfit Guide — Nine Nights, Nine Colors</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>Navratri — meaning "nine nights" in Sanskrit — is one of the most joyful and vibrant Hindu festivals, celebrated twice a year across India and by the Indian diaspora worldwide. The Sharad Navratri (autumn Navratri, typically October) is the most widely celebrated, especially in the states of Gujarat and Maharashtra where Garba and Dandiya Raas dancing are the central traditions.</p>
              <p>The <strong>chaniya choli</strong> is the quintessential Navratri outfit — a three-piece set comprising a circular flared skirt (chaniya), a fitted blouse (choli), and a dupatta. The chaniya is traditionally cut in a full circle to allow maximum flare during spinning, and is adorned with <strong>mirror work (shisha embroidery), bandhani tie-dye prints, gota patti, or heavy embroidery</strong>. Lightweight fabrics like georgette, rayon, cotton, and net are preferred for the dance floor. For Indian communities outside India, chaniya cholis have become popular choices for community Garba events in the USA, Canada, UK, and Australia — where entire families participate in the nine-night celebration.</p>
              <p>One of the most beloved Navratri traditions is <strong>dressing in the color of the day</strong>. Each of the nine nights is associated with a specific color linked to the nine forms of Goddess Durga worshipped during the festival. Common Navratri color sequences include royal blue, green, grey, orange, white, red, royal blue, pink, and purple — though the exact sequence varies by year according to the Hindu calendar. Many participants plan nine separate Navratri outfits in each day's color — making Navratri one of the biggest ethnic fashion occasions of the year.</p>
              <p>For guests who prefer an alternative to the chaniya choli, <strong>embroidered lehengas, festive anarkali suits, and mirror-work salwar kameez</strong> in bright Navratri colors are equally beautiful choices. Men traditionally wear a white kurta-pyjama with colorful dupattas or embroidered nehru jackets for Garba celebrations.</p>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Navratri 2026 Dates and 9-Day Color Schedule</h3>
                <p>Navratri 2026 begins on <strong>Tuesday, September 22, 2026</strong> and ends on <strong>Thursday, October 1, 2026</strong> with Dussehra on October 2. The 2026 Navratri color schedule is: <strong>Day 1 Orange, Day 2 White, Day 3 Red, Day 4 Royal Blue, Day 5 Yellow, Day 6 Green, Day 7 Grey, Day 8 Purple, Day 9 Peacock Green</strong>.</p>
                <p className="mt-2">For the complete day-by-day outfit guide — what to wear each night, fabric recommendations, accessories (dandiya sticks, oxidized silver jewelry, kamarbandh, mojari flats), and how many outfits you actually need — read our <Link to="/blog/navratri-9-day-color-guide-2026" className="text-primary underline font-medium">Navratri 9 Day Color Guide 2026</Link>.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">When to Order Your Navratri Chaniya Choli</h3>
                <p>For Navratri 2026, order your chaniya choli by <strong>mid-August 2026</strong> at the latest. Indian ethnic wear ships from India — even ready-to-ship items take 10-14 days door-to-door, and custom-stitched items take 3-4 weeks. Navratri chaniya cholis are also seasonal — they sell out by early September. At LuxeMia, we ship ready-to-ship chaniya cholis to the USA, Canada, and Australia with free shipping on orders over $350.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">How Many Navratri Outfits Do You Need?</h3>
                <p>You do not need 9 different outfits. Most diaspora garba events happen on 2-4 nights, not all 9. <strong>1-2 garba nights:</strong> buy 1-2 outfits in those colors (most popular: red Day 3, royal blue Day 4, green Day 6). <strong>3-4 garba nights:</strong> buy 3 outfits and mix-and-match dupattas. <strong>All 9 nights:</strong> invest in 5-6 outfits and rotate. No one expects you to have 9 outfits.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Related Guides</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><Link to="/blog/navratri-9-day-color-guide-2026" className="text-primary underline">Navratri 9 Day Color Guide 2026: What to Wear Each Night of Garba</Link></li>
                  <li><Link to="/blog/diwali-outfit-ideas-by-setting" className="text-primary underline">Diwali Outfit Ideas by Setting</Link></li>
                  <li><Link to="/blog/what-to-wear-indian-wedding-non-indian-guest" className="text-primary underline">What to Wear to an Indian Wedding as a Non-Indian Guest</Link></li>
                  <li><Link to="/lehengas" className="text-primary underline">Shop Lehengas & Chaniya Choli</Link> | <Link to="/suits" className="text-primary underline">Shop Anarkali Suits</Link> | <Link to="/sarees" className="text-primary underline">Shop Sarees</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">More Festive Occasion Collections</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Anarkali Suits</Button></Link>
              <Link to="/collections/diwali-outfits"><Button variant="outline" size="sm">Diwali Outfits</Button></Link>
              <Link to="/collections/eid-outfits"><Button variant="outline" size="sm">Eid Outfits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest</Button></Link>
              <Link to="/indowestern"><Button variant="outline" size="sm">Indo-Western</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions — Navratri Outfits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {navratriOutfitFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-background border border-border rounded-lg px-5">
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <RelatedOccasions currentOccasion="navratri" />

      <Footer />
    </div>
  );
};

export default NavratriOutfits;
