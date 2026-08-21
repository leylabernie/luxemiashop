import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Send } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import ProductCard from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { sortProducts } from '@/lib/productFilters';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const customizableFaqs = [
  {
    question: 'What is customizable in this collection?',
    answer: 'Every design on this page is verified for a custom color and made-to-order sizing from measurements confirmed with LuxeMia. Other design changes are not included unless LuxeMia confirms them in writing.',
  },
  {
    question: 'How do I request a custom color?',
    answer: 'Send LuxeMia the product link, requested color, event date, and country before ordering. LuxeMia must confirm fabric availability and timing in writing.',
  },
  {
    question: 'How long does a made-to-order outfit take?',
    answer: 'Use approximately 4–5 weeks as a total planning window. LuxeMia confirms production time and carrier transit separately after the requested color, measurements, fabric availability, and delivery address are known. Timing and rush delivery are not guaranteed unless confirmed in writing.',
  },
  {
    question: 'Where does LuxeMia currently ship these outfits?',
    answer: 'Checkout currently accepts United States shipping addresses only. Standard shipping is $12 below $150 and free at $150 and above.',
  },
  {
    question: 'Can a custom order be returned?',
    answer: 'Custom orders are final sale, subject to applicable law. For genuine shipping damage, an incorrect item, or a missing item, follow the evidence and reporting requirements on the Returns page.',
  },
];

const CustomizableOutfits = () => {
  const { products, isLoading, error } = useShopifyProducts('customizable');
  const [sortBy, setSortBy] = useState('featured');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiry, setInquiry] = useState({
    name: '',
    email: '',
    phone: '',
    productLink: '',
    requestedColor: '',
    eventDate: '',
    occasion: '',
    zipCode: '',
    notes: '',
  });
  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
  const currentSort = sortOptions.find((option) => option.value === sortBy)?.label || 'Featured';

  const scrollToInquiry = () => {
    document.getElementById('custom-order-inquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleInquirySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmittingInquiry(true);

    const requirements = [
      `Custom-order inquiry`,
      `Product link: ${inquiry.productLink.trim() || 'Not provided yet'}`,
      `Requested colour: ${inquiry.requestedColor.trim()}`,
      `Event date: ${inquiry.eventDate}`,
      `Occasion: ${inquiry.occasion.trim()}`,
      `U.S. ZIP code: ${inquiry.zipCode.trim()}`,
      `Additional notes: ${inquiry.notes.trim() || 'None provided'}`,
    ].join('\n');

    try {
      const { data, error } = await supabase.functions.invoke('submit-consultation', {
        body: {
          name: inquiry.name.trim(),
          email: inquiry.email.trim().toLowerCase(),
          phone: inquiry.phone.trim() || 'Not provided — custom-order form',
          country: 'United States',
          occasion: `${inquiry.occasion.trim()} — event date ${inquiry.eventDate}`,
          requirements,
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Unable to send inquiry');
      }

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          lead_source: 'custom_order_form',
          lead_type: 'made_to_measure_inquiry',
        });
      }

      toast.success('Your inquiry is with LuxeMia.', {
        description: 'We will review the design, colour request, and event timing before confirming what is possible.',
      });
      setInquiry({ name: '', email: '', phone: '', productLink: '', requestedColor: '', eventDate: '', occasion: '', zipCode: '', notes: '' });
    } catch (error) {
      console.error('Custom-order inquiry failed:', error);
      toast.error('We could not send your inquiry.', {
        description: 'Please use LuxeMia contact options or email hello@luxemia.shop.',
      });
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Customizable Indian Outfits | Custom Color & Measurements | LuxeMia"
        description="Shop verified made-to-order Indian outfits with custom color and confirmed measurements. Review the approximate 4–5 week total planning window before ordering."
        canonical="https://luxemia.shop/collections/customizable-indian-outfits"
        type="collection"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Customizable Indian Outfits', url: '/collections/customizable-indian-outfits' },
        ]}
        faqs={customizableFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="border-b border-border/30 bg-secondary/40 py-12 lg:py-16">
          <div className="container mx-auto max-w-4xl px-4 text-center lg:px-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Verified made-to-order designs</p>
            <h1 className="font-serif text-3xl lg:text-5xl">Customizable Indian Outfits</h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground lg:text-base">
              These selected lehengas, sarees, kurta sets, and wedding outfits can be made in a custom color and tailored from measurements confirmed with LuxeMia. No other design option is promised unless it is confirmed in writing for the exact product.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button onClick={scrollToInquiry} variant="luxury" className="gap-2">
                Start a custom order inquiry <Send className="h-4 w-4" />
              </Button>
              <Link to="/sizing-measurements-guide"><Button variant="outline">Measurement guide</Button></Link>
            </div>
          </div>
        </section>

        <section className="border-b border-border/30 bg-background py-8" aria-labelledby="custom-order-process">
          <div className="container mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3 lg:px-8">
            <div>
              <h2 id="custom-order-process" className="font-serif text-xl">1. Request and confirm</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Send the product link, requested color, event date, and delivery country. LuxeMia confirms fabric availability and feasibility before the order proceeds.</p>
            </div>
            <div>
              <h2 className="font-serif text-xl">2. Submit measurements</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Provide the measurements requested for the design. Production starts only after the required details are complete and confirmed.</p>
            </div>
            <div>
              <h2 className="font-serif text-xl">3. Production, then transit</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Use approximately 4–5 weeks as a total planning window. LuxeMia confirms production time and carrier transit separately in writing after the required details and delivery address are known.</p>
            </div>
          </div>
        </section>

        <section id="custom-order-inquiry" className="scroll-mt-28 border-b border-[#e1c9c2] bg-[radial-gradient(circle_at_88%_12%,rgba(232,194,183,0.34),transparent_30%),#f8efea] px-4 py-12 lg:px-8 lg:py-16" aria-labelledby="custom-order-inquiry-heading">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a96f72]">Your made-to-measure enquiry</p>
                <h2 id="custom-order-inquiry-heading" className="mt-4 font-serif text-3xl leading-[0.98] text-[#352629] lg:text-4xl">Tell us about the celebration you are dressing for.</h2>
                <p className="mt-5 text-sm leading-7 text-[#765f5b]">Share the exact design, colour you have in mind, event date, and U.S. ZIP code. LuxeMia will review the request before confirming fabric availability, measurements, and timing in writing.</p>
                <p className="mt-5 text-xs leading-5 text-[#765f5b]">A product link is helpful but not required. Please do not submit payment details in this form.</p>
              </div>

              <form onSubmit={handleInquirySubmit} className="rounded-[2px] border border-[#e0c6bf] bg-[#fffaf6] p-5 shadow-[0_12px_28px_rgba(78,49,50,0.08)] sm:p-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="custom-name" className="mb-2 block text-sm font-medium text-[#493235]">Your name</label>
                    <Input id="custom-name" required value={inquiry.name} onChange={(event) => setInquiry({ ...inquiry, name: event.target.value })} placeholder="Your name" />
                  </div>
                  <div>
                    <label htmlFor="custom-email" className="mb-2 block text-sm font-medium text-[#493235]">Email address</label>
                    <Input id="custom-email" type="email" required value={inquiry.email} onChange={(event) => setInquiry({ ...inquiry, email: event.target.value })} placeholder="you@example.com" />
                  </div>
                  <div>
                    <label htmlFor="custom-event-date" className="mb-2 block text-sm font-medium text-[#493235]">Event date</label>
                    <Input id="custom-event-date" type="date" required value={inquiry.eventDate} onChange={(event) => setInquiry({ ...inquiry, eventDate: event.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="custom-occasion" className="mb-2 block text-sm font-medium text-[#493235]">Occasion</label>
                    <Input id="custom-occasion" required value={inquiry.occasion} onChange={(event) => setInquiry({ ...inquiry, occasion: event.target.value })} placeholder="Wedding, reception, festival…" />
                  </div>
                  <div>
                    <label htmlFor="custom-colour" className="mb-2 block text-sm font-medium text-[#493235]">Requested colour</label>
                    <Input id="custom-colour" required value={inquiry.requestedColor} onChange={(event) => setInquiry({ ...inquiry, requestedColor: event.target.value })} placeholder="For example, dusty rose" />
                  </div>
                  <div>
                    <label htmlFor="custom-zip" className="mb-2 block text-sm font-medium text-[#493235]">U.S. ZIP code</label>
                    <Input id="custom-zip" required value={inquiry.zipCode} onChange={(event) => setInquiry({ ...inquiry, zipCode: event.target.value })} placeholder="For timing confirmation" />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="custom-product-link" className="mb-2 block text-sm font-medium text-[#493235]">Product link <span className="font-normal text-[#806d69]">(optional)</span></label>
                  <Input id="custom-product-link" type="url" value={inquiry.productLink} onChange={(event) => setInquiry({ ...inquiry, productLink: event.target.value })} placeholder="Paste the LuxeMia design link if you have one" />
                </div>
                <div className="mt-4">
                  <label htmlFor="custom-phone" className="mb-2 block text-sm font-medium text-[#493235]">Phone number <span className="font-normal text-[#806d69]">(optional)</span></label>
                  <Input id="custom-phone" type="tel" value={inquiry.phone} onChange={(event) => setInquiry({ ...inquiry, phone: event.target.value })} placeholder="For a preferred callback, if needed" />
                </div>
                <div className="mt-4">
                  <label htmlFor="custom-notes" className="mb-2 block text-sm font-medium text-[#493235]">Anything else we should know? <span className="font-normal text-[#806d69]">(optional)</span></label>
                  <Textarea id="custom-notes" value={inquiry.notes} onChange={(event) => setInquiry({ ...inquiry, notes: event.target.value })} placeholder="Measurements question, styling preference, or anything helpful for LuxeMia to know" rows={4} />
                </div>
                <Button type="submit" variant="luxury" className="mt-6 w-full" disabled={isSubmittingInquiry}>
                  {isSubmittingInquiry ? 'Sending your inquiry…' : 'Send custom order inquiry'}
                </Button>
              </form>
            </div>
          </div>
        </section>

        <div className="sticky top-[90px] z-30 border-b border-border/30 bg-background lg:top-[132px]">
          <div className="container mx-auto flex items-center justify-between px-4 py-3 lg:px-8">
            <p className="text-sm text-muted-foreground">{isLoading ? 'Loading…' : `${sortedProducts.length} verified designs`}</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">Sort: {currentSort} <ChevronDown className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map((option) => (
                  <DropdownMenuItem key={option.value} onClick={() => setSortBy(option.value)} className={sortBy === option.value ? 'font-medium' : ''}>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <section className="container mx-auto px-4 py-10 lg:px-8 lg:py-14" aria-label="Customizable products">
          {error ? (
            <p className="rounded-sm border border-destructive/30 bg-destructive/5 p-6 text-center text-sm">Products could not be loaded. Please contact LuxeMia for the current customizable selection.</p>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[3/4] animate-pulse rounded-sm bg-muted" />)}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {sortedProducts.map((product, index) => (
                <ProductCard key={product.node.id} product={product} index={index} showQuickAdd={false} />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">No verified customizable designs are currently available.</p>
          )}
        </section>

        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto max-w-4xl px-4 lg:px-8">
            <h2 className="text-center font-serif text-2xl">Ordering, shipping, and final-sale terms</h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>LuxeMia checkout currently accepts United States shipping addresses only. Standard shipping is $12 below $150 and free at $150 and above.</p>
              <p>All orders are final sale, subject to applicable law. Review the <Link to="/returns" className="text-primary underline underline-offset-4">Returns Policy</Link> before ordering.</p>
              <p>Need help before completing the form? Use <Link to="/contact" className="text-primary underline underline-offset-4">LuxeMia contact options</Link> with the exact product link, requested colour, measurements question, event date, and U.S. ZIP code.</p>
            </div>
            <nav aria-label="Related collections" className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/lehengas"><Button variant="outline" size="sm">Lehengas</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Sarees</Button></Link>
              <Link to="/menswear"><Button variant="outline" size="sm">Menswear</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
            </nav>
          </div>
        </section>

        <section className="border-t border-border py-14">
          <div className="container mx-auto max-w-3xl px-4 lg:px-8">
            <h2 className="mb-8 text-center font-serif text-2xl">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {customizableFaqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`} className="rounded-lg border border-border bg-background px-5">
                  <AccordionTrigger className="py-4 text-left text-sm font-medium hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CustomizableOutfits;
