import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, ChevronDown, Gift, Ruler, Truck } from 'lucide-react';
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
    question: 'When does Navratri begin in the United States in 2026?',
    answer: 'United States calendars list Navratri beginning Sunday, October 11, 2026. Religious-calendar observances can vary by location and community, so confirm the date and schedule with your temple or event organizer.',
  },
  {
    question: 'Which products appear in this Navratri collection?',
    answer: 'This page shows currently available products whose catalog title, product type, or tags explicitly mention Navratri, Garba, chaniya, or dandiya. Open a product page to confirm every product detail.',
  },
  {
    question: 'How do I check the Navratri color schedule?',
    answer: 'Day-by-day color practices can vary by calendar, region, and community. Use the schedule followed by your own organizer or community rather than a universal list on a shopping page.',
  },
  {
    question: 'How do I compare a chaniya choli and a lehenga listing?',
    answer: 'Compare the exact listing for included pieces, fabric, work, measurements, available sizes, and weight or construction details when stated. Do not infer those details from the collection name.',
  },
  {
    question: 'How early should I order a Navratri outfit?',
    answer: 'Start by checking the selected product page and contact LuxeMia before ordering when you have a fixed Garba or Navratri date. Availability, stitching options, preparation time, and carrier transit can differ by product, so delivery by a specific event is not guaranteed.',
  },
  {
    question: 'How much is U.S. shipping for Navratri outfits?',
    answer: 'LuxeMia ships to United States addresses only. Standard shipping is $12 below $135 and free at $135 and above. Tracking is provided after dispatch.',
  },
  {
    question: 'Is there a first-order discount?',
    answer: 'First-time shoppers can use code LUXE10 for 10% off their first LuxeMia order. The code has no minimum purchase requirement.',
  },
  {
    question: 'Can I return a Navratri outfit?',
    answer: 'All sales are final. Damage, incorrect-item, or missing-item claims must be submitted within 48 hours of delivery with the evidence required by the LuxeMia return policy. Review sizing and product details before ordering.',
  },
];

const NavratriOutfits = () => {
  const { products, isLoading } = useShopifyProducts('occasion:navratri');
  const [sortBy, setSortBy] = useState('featured');
  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Navratri Outfits USA 2026 | Garba Styles | LuxeMia"
        description="Shop Navratri outfits in the USA for Garba and Dandiya, including chaniya choli and festive styles. Tracked U.S. shipping; LUXE10 for first orders."
        canonical="https://luxemia.shop/collections/navratri-outfits"
        image="/images/hero-carousel/navratri-lehenga-desktop.jpg"
        type="collection"
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
        <div className="relative overflow-hidden border-b border-border/30 bg-[#211311] text-[#fffaf3]">
          <img
            src="/images/hero-carousel/navratri-lehenga-desktop.jpg"
            alt="Woman wearing a bright pink lehenga suitable for a Navratri celebration"
            width="1672"
            height="941"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#211311] via-[#211311]/85 to-[#211311]/20" />
          <div className="container relative mx-auto px-4 py-14 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-[#f7d9a7]">Navratri 2026 · U.S. Shopping Guide</span>
              <h1 className="mb-4 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">Navratri Outfits for Garba in the USA</h1>
              <p className="max-w-xl text-sm leading-relaxed text-[#fffaf3]/85 sm:text-base">
                Shop current Navratri lehenga, chaniya choli and festive styles for Garba and Dandiya events. Review each listing for its exact pieces, measurements, stitching options, price and availability.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-[#fffaf3]/90">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-2"><CalendarDays className="h-4 w-4" /> Begins October 11, 2026</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-2"><Truck className="h-4 w-4" /> Tracked U.S. shipping</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-2"><Gift className="h-4 w-4" /> 10% off first order</span>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#navratri-styles" className="inline-flex items-center justify-center rounded-sm bg-[#fffaf3] px-5 py-3 text-sm font-semibold text-[#211311] transition-colors hover:bg-[#f7d9a7]">Shop Navratri Styles</a>
                <Link to="/blog/navratri-9-day-color-guide-2026" className="inline-flex items-center justify-center rounded-sm border border-white/35 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10">Read the 2026 Buying Guide</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Keyword intro */}
        <div className="bg-background border-b border-border/20 py-5">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <p className="flex items-center justify-center gap-2 text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> Current catalog listings</p>
              <p className="flex items-center justify-center gap-2 text-muted-foreground"><Truck className="h-4 w-4 text-primary" /> $12 below $135 · Free at $135+</p>
              <p className="flex items-center justify-center gap-2 text-muted-foreground"><Gift className="h-4 w-4 text-primary" /> Use LUXE10 on your first order</p>
            </div>
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
        <section id="navratri-styles" aria-labelledby="navratri-styles-heading" className="container mx-auto scroll-mt-40 px-4 py-8 lg:px-8 lg:py-12">
          <div className="mb-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Shop the collection</p>
            <h2 id="navratri-styles-heading" className="font-serif text-2xl sm:text-3xl">Current Navratri &amp; Garba Styles</h2>
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
          ) : sortedProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            >
              {sortedProducts.map((product, index) => (
                <ProductCard key={product.node.id} product={product} index={index} />
              ))}
            </motion.div>
          ) : (
            <div className="rounded-sm border border-border bg-secondary/20 px-6 py-12 text-center">
              <h3 className="font-serif text-xl">More Navratri styles are being prepared</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Browse the current lehenga collection or contact LuxeMia with your event date, size and preferred color.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link to="/lehengas"><Button>Shop Lehengas</Button></Link>
                <Link to="/contact"><Button variant="outline">Contact LuxeMia</Button></Link>
              </div>
            </div>
          )}
        </section>

        {/* About section */}
        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="font-serif text-2xl mb-3 text-center">Choose Your Navratri Outfit with Confidence</h2>
            <p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">A product title is only a starting point. Use the exact listing, your event schedule and your own measurements before ordering.</p>
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-sm border border-border bg-background p-5">
                <Ruler className="mb-3 h-5 w-5 text-primary" />
                <h3 className="mb-2 font-medium text-foreground">Check fit for movement</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">For Garba and Dandiya, compare waist, bust, skirt length, closures and listed stitching status. Use the <Link to="/sizing-measurements-guide" className="text-primary underline">measurement guide</Link> before selecting a size.</p>
              </article>
              <article className="rounded-sm border border-border bg-background p-5">
                <CheckCircle2 className="mb-3 h-5 w-5 text-primary" />
                <h3 className="mb-2 font-medium text-foreground">Verify every included piece</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">Confirm whether the listing includes a skirt, blouse or choli, dupatta, jacket, or other piece. Jewelry and accessories are included only when the product page says so.</p>
              </article>
              <article className="rounded-sm border border-border bg-background p-5">
                <CalendarDays className="mb-3 h-5 w-5 text-primary" />
                <h3 className="mb-2 font-medium text-foreground">Plan around your event date</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">Confirm timing before ordering for a fixed celebration date. Delivery by a particular event is not guaranteed, and preparation time can vary by product and selected options.</p>
              </article>
            </div>

            <div className="mt-8 rounded-sm border border-primary/20 bg-primary/5 p-6 text-sm leading-relaxed text-muted-foreground">
              <h3 className="mb-2 font-serif text-xl text-foreground">Navratri colors and community guidance</h3>
              <p>Daily color lists are not universal. Follow the calendar and dress guidance used by your own temple, host or community. Our <Link to="/blog/navratri-9-day-color-guide-2026" className="font-medium text-primary underline">fact-checked Navratri 2026 guide</Link> explains the dates, outfit terms and practical questions to review before you buy.</p>
              <p className="mt-3"><Link to="/lehengas" className="text-primary underline">Shop all lehengas</Link> · <Link to="/suits" className="text-primary underline">Shop anarkali and salwar suits</Link> · <Link to="/contact" className="text-primary underline">Ask LuxeMia before ordering</Link></p>
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
