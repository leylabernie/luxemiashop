import { Link, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { SHIPPING_ZONES } from '@/config/shippingPolicy';

type Definition = {
  title: string;
  description: string;
  eyebrow: string;
  answer: string;
  sections: Array<{ heading: string; body: string }>;
  links: Array<{ label: string; href: string }>;
};

const commonShopLinks = [
  { label: 'Bridal and wedding lehengas', href: '/lehengas' },
  { label: 'Indian wedding sarees', href: '/sarees' },
  { label: 'Salwar kameez and suits', href: '/suits' },
  { label: 'Sherwanis and menswear', href: '/menswear' },
];

const hub = (title: string, description: string, answer: string, links = commonShopLinks): Definition => ({
  title: `${title} | LuxeMia`, description, eyebrow: 'Shop by need', answer,
  sections: [
    { heading: 'How to choose', body: 'Start with the occasion and role, then compare the exact product listing for included pieces, fabric wording, stitching status, measurements, available variants, fulfillment classification and current price. Photographs provide styling context but do not replace the written specifications.' },
    { heading: 'Plan for a fixed event date', body: 'Processing happens before carrier transit. A product being available for sale does not necessarily mean it is stocked for immediate dispatch. Review the product-level timing and contact LuxeMia before ordering when an event date is critical; delivery is not guaranteed.' },
    { heading: 'Support and order protection', body: 'Use the measurement guide before selecting a size. Read the current shipping and returns pages, and report a damaged, incorrect, missing or materially misdescribed item promptly with the requested evidence. Mandatory consumer rights remain unaffected.' },
  ], links,
});

const DEFINITIONS: Record<string, Definition> = {
  '/us-support': {
    title: 'U.S.-Based Online Customer Support | LuxeMia',
    description: 'Contact LuxeMia for product, sizing, order and issue-reporting support from its U.S.-based online retail team.',
    eyebrow: 'Customer support',
    answer: 'LuxeMia is an online-only retailer. Customers can use the contact form, email hello@luxemia.shop, call +1 215-341-9990 or use the listed WhatsApp contact for product, sizing and order questions. Support can clarify published information but cannot guarantee event-date delivery.',
    sections: [
      { heading: 'Before ordering', body: 'Share the product link, destination, selected size or stitching option, measurements and event date. Support can help locate the relevant published details and identify anything that must be confirmed before purchase.' },
      { heading: 'After ordering', body: 'Include the order number when asking about processing, tracking, address corrections or a delivery issue. Address changes may not be possible after fulfillment begins.' },
      { heading: 'Issue escalation', body: 'For damage, defects, a materially misdescribed item, an incorrect item or missing pieces, contact LuxeMia promptly. Keep all packaging and provide clear photos and a continuous unboxing video when available. The 48-hour request supports faster evidence review; it does not remove rights that cannot legally be excluded.' },
    ],
    links: [{ label: 'Contact LuxeMia', href: '/contact' }, { label: 'Frequently asked questions', href: '/faq' }, { label: 'Shipping policy', href: '/shipping' }, { label: 'Returns policy', href: '/returns' }],
  },
  '/editorial-policy': {
    title: 'Editorial Policy and Product-Fact Standards | LuxeMia',
    description: 'How LuxeMia sources, reviews, dates and corrects product information and Indian attire guides.',
    eyebrow: 'Editorial standards',
    answer: 'LuxeMia separates supplier-provided product facts from general educational guidance. Product claims are limited to information supported by the listing, selected variant, tags, metafields or other traceable catalog evidence; missing optional facts are omitted rather than guessed.',
    sections: [
      { heading: 'Product-fact verification', body: 'Included pieces require explicit evidence. Material names are not converted into fiber percentages. Availability, price and selected options come from current commerce data. Fulfillment labels describe processing classification and are not inferred from sale availability alone.' },
      { heading: 'Guide methodology', body: 'Guides use identified primary or established sources where factual background is required. Cultural practices are described with regional, religious and family variation in mind. Commercial links are selected by verified attributes rather than unsupported assumptions.' },
      { heading: 'Corrections', body: 'Articles display publication and last-reviewed dates. Send a correction request with the page URL and supporting source to hello@luxemia.shop. Material corrections are reviewed and the page is updated when warranted.' },
    ],
    links: [{ label: 'Indian attire guides', href: '/blog' }, { label: 'Review policy', href: '/review-policy' }, { label: 'Contact the editorial team', href: '/contact' }],
  },
  '/review-policy': {
    title: 'Customer Review Policy | LuxeMia',
    description: 'How LuxeMia requests, labels, moderates and publishes customer reviews without inventing or selectively rewriting them.',
    eyebrow: 'Review standards',
    answer: 'LuxeMia does not invent reviews or alter a customer’s meaning. A review may be labeled verified purchase only when it can be connected to a completed order. Moderation is limited to privacy, unlawful content, abuse, spam and material unrelated to the purchased product or service.',
    sections: [
      { heading: 'Verified purchases', body: 'Verified-purchase labeling requires an order connection. Incentives, if ever offered, must not depend on a positive rating and must be disclosed. Reviews supplied by partners or suppliers are not presented as LuxeMia customer reviews.' },
      { heading: 'Moderation', body: 'Personally identifying information, payment details, threats, unlawful content and spam may be removed. Critical reviews are not rejected simply because they are negative. LuxeMia may respond with factual order context while protecting customer privacy.' },
      { heading: 'Corrections and disputes', body: 'A reviewer may request a correction or removal through customer support. Questions about authenticity or moderation can be sent with the relevant page or order information to hello@luxemia.shop.' },
    ], links: [{ label: 'Editorial policy', href: '/editorial-policy' }, { label: 'Contact support', href: '/contact' }, { label: 'Privacy policy', href: '/privacy' }],
  },
  '/festive-wear': hub('Indian Festive Wear', 'Shop Indian festive outfits for Navratri, Garba, Diwali and other celebrations.', 'Browse celebration-focused outfits separately from bridal shopping. Use the inventory-backed Navratri, Diwali and menswear destinations, then confirm each item’s exact included pieces, stitching, size, processing and availability.', [{ label: 'Navratri and Garba outfits', href: '/collections/navratri-outfits' }, { label: 'Diwali outfits', href: '/collections/diwali-outfits' }, { label: 'Festive menswear', href: '/menswear' }]),
  '/indian-wedding-guest-outfits': hub('Indian Wedding Guest Outfits', 'Compare sarees, lehengas, suits and menswear for Indian wedding guests.', 'Choose by event, venue, dress guidance and comfort rather than one universal rule. Non-Indian guests can wear respectful Indian attire or appropriate formalwear; confirm expectations with the hosts when possible.', [{ label: 'Wedding guest collection', href: '/collections/wedding-guest-outfits' }, ...commonShopLinks]),
  '/wedding-events': hub('Shop Outfits by Indian Wedding Event', 'Find outfit guidance and collections for Mehendi, Haldi, Sangeet and reception events.', 'Event pages organize current products by shopping intent. They are not universal dress rules: hosts, region, religion, venue and family preferences can change what is appropriate.', [{ label: 'Mehendi outfits', href: '/collections/mehendi-outfits' }, { label: 'Haldi outfits', href: '/collections/haldi-outfits' }, { label: 'Sangeet and reception guest outfits', href: '/collections/wedding-guest-outfits' }]),
  '/shop-by-fulfillment': hub('Shop Indian Outfits by Fulfillment', 'Separate ready-to-ship, made-to-order and customizable Indian outfits before ordering.', 'Fulfillment describes what happens before dispatch. Ready-to-ship means the selected item is classified as stocked; made-to-order requires production; customizable means only the options expressly listed can be requested. Availability for sale alone does not prove immediate stock.', [{ label: 'Ready-to-ship outfits', href: '/shop-by-fulfillment/ready-to-ship' }, { label: 'Made-to-order outfits', href: '/shop-by-fulfillment/made-to-order' }, { label: 'Customizable outfits', href: '/shop-by-fulfillment/customizable-outfits' }]),
  '/shop-by-fulfillment/ready-to-ship': hub('Ready-to-Ship Indian Outfits', 'Shop items classified as stocked while confirming selected-variant availability and processing.', 'Ready-to-ship removes the production stage for the selected item but still requires order processing before carrier transit. Confirm the exact selected variant, product-level processing estimate and destination before ordering for an event.', [{ label: 'Browse verified ready-to-ship items', href: '/ready-to-ship' }, ...commonShopLinks]),
  '/shop-by-fulfillment/made-to-order': hub('Made-to-Order Indian Outfits', 'Understand production, measurements and timing for made-to-order Indian clothing.', 'Made-to-order products begin production after an order is confirmed. The product must not be treated as immediately stocked merely because Shopify accepts the order. Review stated customization, measurements and processing separately from transit.', commonShopLinks),
  '/shop-by-fulfillment/customizable-outfits': hub('Customizable Indian Outfits', 'Shop Indian outfits with only the customization options expressly supported by each listing.', 'Customization is product-specific. Select only listed options and obtain confirmation for any material fit or design request before checkout; unsupported changes are not implied.', [{ label: 'Browse customizable outfits', href: '/collections/customizable-indian-outfits' }, { label: 'Measurement guide', href: '/sizing-measurements-guide' }, { label: 'Contact support', href: '/contact' }]),
};

const countryByPath: Record<string, { code: string; title: string }> = {
  '/shipping/united-states': { code: 'US', title: 'Shipping Indian Clothing to the United States' },
  '/shipping/canada': { code: 'CA', title: 'Shipping Indian Clothing to Canada' },
  '/shipping/united-kingdom': { code: 'GB', title: 'Shipping Indian Clothing to the United Kingdom' },
  '/shipping/australia': { code: 'AU', title: 'Shipping Indian Clothing to Australia' },
};

function countryDefinition(path: string): Definition | undefined {
  const country = countryByPath[path];
  if (!country) return undefined;
  const zone = SHIPPING_ZONES.find(item => item.countries.includes(country.code as never));
  if (!zone) return undefined;
  const threshold = zone.freeShippingThreshold;
  const rate = `$${zone.standardRate.toFixed(2)} USD`;
  const rateText = threshold ? `${rate} below $${threshold} USD and free standard shipping at $${threshold} USD or more` : `${rate} per order`;
  return {
    title: `${country.title} | LuxeMia`,
    description: `Current LuxeMia rate, processing, tracking, duties, returns and event-date guidance for ${country.title.replace('Shipping Indian Clothing to ', '')}.`,
    eyebrow: 'Country shipping guide',
    answer: `LuxeMia checkout currently offers tracked standard shipping to ${country.title.replace('Shipping Indian Clothing to ', '')}: ${rateText}. Store prices and shipping thresholds are stated in USD. The final checkout amount is the source of truth for the selected cart and address.`,
    sections: [
      { heading: 'Processing and carrier transit', body: 'Processing is the time before dispatch and varies by product and selected service. Carrier transit begins after dispatch. Tracking is emailed when the label is created. Neither an estimate nor tracking creation guarantees delivery by an event date.' },
      { heading: 'Duties, taxes and fees', body: zone.duties + ' Customers are responsible for reviewing destination-country import requirements. LuxeMia does not promise that a shipment will be free of duties, tax, brokerage or carrier charges unless checkout expressly states that treatment.' },
      { heading: 'Returns, issues and support', body: 'Review the returns policy before ordering. Contact support promptly for damage, defects, a materially misdescribed item, an incorrect item or missing pieces. Keep packaging and provide requested evidence; mandatory consumer rights remain unaffected.' },
    ],
    links: [{ label: 'All shipping destinations and rates', href: '/shipping' }, { label: 'Returns policy', href: '/returns' }, { label: 'Contact LuxeMia support', href: '/us-support' }, { label: 'Measurement guide', href: '/sizing-measurements-guide' }],
  };
}

const SemanticCommercePage = () => {
  const { pathname } = useLocation();
  const page = DEFINITIONS[pathname] || countryDefinition(pathname);
  if (!page) return null;
  const canonical = `https://luxemia.shop${pathname}`;
  return <div className="min-h-screen bg-background">
    <SEOHead title={page.title} description={page.description} canonical={canonical} breadcrumbs={[{ name: 'Home', url: '/' }, { name: page.eyebrow, url: pathname }]} />
    <Header />
    <main id="main-content" className="pt-[90px] lg:pt-[132px] pb-16">
      <section className="bg-secondary/45 py-14 lg:py-20"><div className="container mx-auto max-w-4xl px-4 lg:px-8">
        <p className="mb-3 text-sm uppercase tracking-luxury text-muted-foreground">{page.eyebrow}</p>
        <h1 className="font-serif text-4xl md:text-5xl">{page.title.replace(' | LuxeMia', '')}</h1>
        <p className="mt-6 text-lg leading-8 text-foreground/75">{page.answer}</p>
      </div></section>
      <section className="container mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-[1fr_280px] lg:px-8">
        <div className="space-y-10">{page.sections.map(section => <article key={section.heading}><h2 className="mb-3 font-serif text-2xl">{section.heading}</h2><p className="leading-7 text-muted-foreground">{section.body}</p></article>)}</div>
        <aside className="h-fit border border-border bg-card p-6"><h2 className="font-serif text-xl">Choose by need</h2><nav className="mt-4 flex flex-col gap-3">{page.links.map(link => <Link className="text-sm text-primary underline underline-offset-4" key={link.href} to={link.href}>{link.label}</Link>)}</nav></aside>
      </section>
    </main><Footer />
  </div>;
};

export default SemanticCommercePage;
