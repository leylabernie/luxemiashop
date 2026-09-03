import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Send } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import ProductCard from '@/components/ui/ProductCard';
import CollectionDecisionSupport, { CollectionDirectAnswer } from '@/components/collections/CollectionDecisionSupport';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { sortProducts } from '@/lib/productFilters';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SHIPPING_DESTINATION_NAMES } from '@/config/shippingPolicy';
import { toCollectionSchemaItems } from '@/lib/collectionSchema';
import { trackLeadSubmission } from '@/hooks/useAnalytics';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const supportedCountries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'New Zealand',
  'South Africa',
  'Mauritius',
] as const;

const customizableFaqs = [
  {
    question: 'What is customizable in this collection?',
    answer: 'Products appear here only when their current Shopify record explicitly identifies a customization option and a currently available variant. Open the exact product page to see whether the supported option concerns color, size, measurements, or another listed choice. A collection label does not add options the listing does not state.',
  },
  {
    question: 'How do I request a custom color?',
    answer: 'Request a custom color only when the current product page explicitly offers that option. Send LuxeMia the product link, requested color, event date, and country; the request, material availability, price, and timing must be confirmed in writing before you rely on them.',
  },
  {
    question: 'How long does a made-to-order outfit take?',
    answer: 'There is no universal production window for this collection. Use the processing information on the exact current listing and obtain written confirmation of production time and carrier transit before ordering for a fixed date. Rush delivery is not guaranteed unless confirmed for the order.',
  },
  {
    question: 'Where does LuxeMia currently ship these outfits?',
    answer: `Checkout currently accepts shipping addresses in ${SHIPPING_DESTINATION_NAMES}. Rates vary by destination; review the shipping page and confirm the final amount at checkout.`,
  },
  {
    question: 'Can a custom order be returned?',
    answer: 'Custom or personalized orders are final sale for change of mind, subject to applicable law. Damage, defects, material misdescription, an incorrect item, or missing pieces use the covered-order-issue process on the Returns page.',
  },
];

const CatalogLoadError = () => (
  <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-8 text-center" role="alert">
    <h2 className="font-serif text-2xl">Current customizable products could not be loaded</h2>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
      Product availability is temporarily unavailable. Try this page again, or contact LuxeMia before relying on a specific option.
    </p>
    <Button asChild className="mt-5" variant="outline">
      <a href="/collections/customizable-indian-outfits">Try again</a>
    </Button>
  </div>
);

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
    country: '',
    postalCode: '',
    notes: '',
  });
  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
  const currentSort = sortOptions.find((option) => option.value === sortBy)?.label || 'Featured';
  const collectionItems = toCollectionSchemaItems(sortedProducts);

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
      `Delivery country: ${inquiry.country}`,
      `Postal code: ${inquiry.postalCode.trim()}`,
      `Additional notes: ${inquiry.notes.trim() || 'None provided'}`,
    ].join('\n');

    try {
      const { data, error } = await supabase.functions.invoke('submit-consultation', {
        body: {
          name: inquiry.name.trim(),
          email: inquiry.email.trim().toLowerCase(),
          phone: inquiry.phone.trim() || 'Not provided — custom-order form',
          country: inquiry.country,
          occasion: `${inquiry.occasion.trim()} — event date ${inquiry.eventDate}`,
          requirements,
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Unable to send inquiry');
      }

      trackLeadSubmission('custom_order_form');

      toast.success('Inquiry saved.', {
        description: 'Design, colour, fabric, measurements, and timing remain unconfirmed until you receive a written reply.',
      });
      setInquiry({ name: '', email: '', phone: '', productLink: '', requestedColor: '', eventDate: '', occasion: '', country: '', postalCode: '', notes: '' });
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
        title="Customizable Indian Outfits | Product-Specific Options | LuxeMia"
        description="Browse currently orderable Indian outfits whose Shopify records explicitly identify a customization option. Confirm the exact option and timing on the product page."
        canonical="https://luxemia.shop/collections/customizable-indian-outfits"
        type="collection"
        collection={!isLoading && !error
          ? { name: 'Customizable Indian Outfits', description: 'Currently orderable Indian outfits with customization options explicitly identified in their Shopify product records.', items: collectionItems }
          : undefined}
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Product-specific customization</p>
            <h1 className="font-serif text-3xl lg:text-5xl">Customizable Indian Outfits</h1>
            <CollectionDirectAnswer path="/collections/customizable-indian-outfits" className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground lg:text-base" />
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
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Open the current product page first, then send its link, the listed option you want, your event date, and delivery country. LuxeMia confirms whether the exact request is supported before you rely on it.</p>
            </div>
            <div>
              <h2 className="font-serif text-xl">2. Confirm required details</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Provide measurements only when the exact listing or LuxeMia’s written confirmation requires them. Any supported material, color, size, or construction request must be confirmed for that product.</p>
            </div>
            <div>
              <h2 className="font-serif text-xl">3. Production, then transit</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">There is no universal production window. Use product-specific processing evidence and obtain written confirmation of production time and carrier transit before ordering for a fixed date.</p>
            </div>
          </div>
        </section>

        <section id="custom-order-inquiry" className="scroll-mt-28 border-b border-[#e1c9c2] bg-[radial-gradient(circle_at_88%_12%,rgba(232,194,183,0.34),transparent_30%),#f8efea] px-4 py-12 lg:px-8 lg:py-16" aria-labelledby="custom-order-inquiry-heading">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a96f72]">Your made-to-measure enquiry</p>
                <h2 id="custom-order-inquiry-heading" className="mt-4 font-serif text-3xl leading-[0.98] text-[#352629] lg:text-4xl">Tell us about the celebration you are dressing for.</h2>
                <p className="mt-5 text-sm leading-7 text-[#765f5b]">Share the exact design, colour you have in mind, event date, delivery country, and postal code. Submitting a request saves it for review; fabric availability, measurements, and timing remain unconfirmed until you receive a written reply.</p>
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
                    <label htmlFor="custom-country" className="mb-2 block text-sm font-medium text-[#493235]">Delivery country</label>
                    <select
                      id="custom-country"
                      required
                      value={inquiry.country}
                      onChange={(event) => setInquiry({ ...inquiry, country: event.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select a supported country</option>
                      {supportedCountries.map((country) => <option key={country} value={country}>{country}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="custom-postal-code" className="mb-2 block text-sm font-medium text-[#493235]">Postal code</label>
                    <Input id="custom-postal-code" required value={inquiry.postalCode} onChange={(event) => setInquiry({ ...inquiry, postalCode: event.target.value })} placeholder="For timing confirmation" />
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
                <p className="mt-4 text-xs leading-5 text-[#765f5b]">
                  LuxeMia uses these details only to review and respond to your custom-order request. Do not include payment information or identity documents. See the{' '}
                  <Link to="/privacy" className="text-primary underline underline-offset-4">Privacy Policy</Link> for retention, service-provider, and deletion-request information.
                </p>
                <Button type="submit" variant="luxury" className="mt-6 w-full" disabled={isSubmittingInquiry}>
                  {isSubmittingInquiry ? 'Sending your inquiry…' : 'Send custom order inquiry'}
                </Button>
              </form>
            </div>
          </div>
        </section>

        <div className="sticky top-[90px] z-30 border-b border-border/30 bg-background lg:top-[132px]">
          <div className="container mx-auto flex items-center justify-between px-4 py-3 lg:px-8">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? 'Loading…'
                : error
                  ? 'Current customizable inventory is temporarily unavailable'
                  : `${sortedProducts.length} verified designs`}
            </p>
            {!error ? <DropdownMenu>
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
            </DropdownMenu> : null}
          </div>
        </div>

        <section className="container mx-auto px-4 py-10 lg:px-8 lg:py-14" aria-label="Customizable products">
          {error ? (
            <CatalogLoadError />
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

        {!error ? <CollectionDecisionSupport path="/collections/customizable-indian-outfits" products={sortedProducts} isLoading={isLoading} showFaqs={false} /> : null}

        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto max-w-4xl px-4 lg:px-8">
            <h2 className="text-center font-serif text-2xl">Ordering, shipping, and final-sale terms</h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>LuxeMia checkout currently accepts shipping addresses in {SHIPPING_DESTINATION_NAMES}. U.S. standard shipping is $14.99 below $199 and free at $199 and above; other destinations use the rates on the Shipping Policy.</p>
              <p>Custom or personalized orders are final sale for change of mind, subject to applicable law. Damage, defects, material misdescription, an incorrect item, or missing pieces remain covered by the order-issue process. Review the <Link to="/returns" className="text-primary underline underline-offset-4">Returns Policy</Link> before ordering.</p>
              <p>Need help before completing the form? Use <Link to="/contact" className="text-primary underline underline-offset-4">LuxeMia contact options</Link> with the exact product link, requested colour, measurements question, event date, delivery country, and postal code.</p>
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
