import { Link, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import CollectionDecisionSupport from '@/components/collections/CollectionDecisionSupport';
import { getCollectionStandard } from '@/config/collectionStandards';
import { SHIPPING_ZONES } from '@/config/shippingPolicy';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import type { ShopifyProduct } from '@/lib/shopify';
import { toCollectionSchemaItems } from '@/lib/collectionSchema';

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
    title: 'Online Support for U.S. Customers | LuxeMia',
    description: 'Contact LuxeMia for online product, sizing, order and issue-reporting support for customers shopping from the United States.',
    eyebrow: 'Customer support',
    answer: 'LuxeMia is an online-only retailer. Customers can use the contact form, email hello@luxemia.shop, call +1 215-341-9990 or use the listed WhatsApp contact for product, sizing and order questions. Response times vary; same-day replies and event-date delivery are not guaranteed.',
    sections: [
      { heading: 'Before ordering', body: 'Share the product link, destination, selected size or stitching option, measurements and event date. Support can help locate the relevant published details and identify anything that must be confirmed before purchase.' },
      { heading: 'After ordering', body: 'Include the order number when asking about processing, tracking, address corrections or a delivery issue. Address changes may not be possible after fulfillment begins.' },
      { heading: 'Issue escalation', body: 'For damage, defects, a materially misdescribed item, an incorrect item or missing pieces, contact LuxeMia promptly. Keep all packaging and provide clear photos and a continuous unboxing video when available. The 48-hour request supports faster evidence review; it does not remove rights that cannot legally be excluded.' },
    ],
    links: [{ label: 'Contact LuxeMia', href: '/contact' }, { label: 'Frequently asked questions', href: '/faq' }, { label: 'Shipping policy', href: '/shipping' }, { label: 'Returns policy', href: '/returns' }, { label: 'Privacy policy', href: '/privacy' }, { label: 'Terms of service', href: '/terms' }, { label: 'Editorial policy', href: '/editorial-policy' }, { label: 'Review program', href: '/review-policy' }],
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
    title: 'Customer Review Program Conditions | LuxeMia',
    description: 'How LuxeMia handles review claims and the safeguards required before any third-party post-purchase survey can be enabled.',
    eyebrow: 'Review safeguards',
    answer: 'LuxeMia does not operate or seed a separate on-site customer-review feed. This page does not claim that Google Customer Reviews enrollment, survey eligibility or a seller rating is currently active. Any future Google survey may run only inside Shopify’s protected post-purchase context, using verified order fields and an evidence-based delivery estimate, with the shopper deciding whether to opt in.',
    sections: [
      { heading: 'Public return page', body: 'The public LuxeMia return page has no signed Shopify order context. It does not trust order identifiers, email addresses, totals, countries or delivery dates supplied in a URL, and it does not pass those values to Google or record a purchase from them.' },
      { heading: 'Conditions for any survey', body: 'A survey integration may be enabled only in Shopify’s protected post-purchase context after the required order identifier, customer email, delivery country and delivery estimate are verified. The estimate must come from evidence for that order rather than a universal number of days. If a required field is unavailable or cannot be verified, the survey must not render. The shopper must retain the optional opt-in choice described by the provider.' },
      { heading: 'Review integrity and control', body: 'LuxeMia does not create, seed, rewrite or selectively suppress customer reviews. If a third-party review program is later verified and enabled, that provider controls its survey, content rules, privacy handling and any aggregate rating. A badge-script request by itself is not evidence that enrollment, survey eligibility or a seller rating is active.' },
    ], links: [{ label: 'Editorial policy', href: '/editorial-policy' }, { label: 'Contact support', href: '/contact' }, { label: 'Privacy policy', href: '/privacy' }],
  },
  '/festive-wear': hub('Indian Festive Wear', 'Shop Indian festive outfits for Navratri, Garba, Diwali and other celebrations.', 'Browse celebration-focused outfits separately from bridal shopping. Use the inventory-backed Navratri, Diwali and Garba destinations, then confirm each item’s exact included pieces, stitching, size, processing and availability.', [{ label: 'Navratri chaniya choli', href: '/collections/navratri-chaniya-choli' }, { label: 'Garba outfits', href: '/collections/garba-outfits' }, { label: 'Diwali outfits', href: '/collections/diwali-outfits' }, { label: 'Chaniya choli versus lehenga guide', href: '/blog/chaniya-choli-versus-lehenga' }]),
  '/indian-wedding-guest-outfits': hub('Indian Wedding Guest Outfits', 'Compare sarees, lehengas, suits and menswear for Indian wedding guests.', 'Choose by event, venue, dress guidance and comfort rather than one universal rule. Non-Indian guests can wear respectful Indian attire or appropriate formalwear; confirm expectations with the hosts when possible.', [{ label: 'Wedding guest collection', href: '/collections/wedding-guest-outfits' }, { label: 'Three-day menswear guide', href: '/blog/what-should-a-male-guest-wear-to-a-three-day-indian-wedding' }, { label: 'Non-Indian guest guide', href: '/blog/what-should-a-non-indian-guest-wear-to-an-indian-wedding' }, ...commonShopLinks]),
  '/wedding-events': hub('Shop Outfits by Indian Wedding Event', 'Find outfit guidance and collections for Mehendi, Haldi, Sangeet and reception events.', 'Event pages organize current products by shopping intent. They are not universal dress rules: hosts, region, religion, venue and family preferences can change what is appropriate.', [{ label: 'Mehendi outfits', href: '/collections/mehendi-outfits' }, { label: 'Haldi outfits', href: '/collections/haldi-outfits' }, { label: 'Sangeet outfits', href: '/collections/sangeet-outfits' }, { label: 'Reception outfits', href: '/collections/reception-outfits' }, { label: 'Mehendi guest guide', href: '/blog/what-should-guests-wear-to-a-mehendi' }, { label: 'Sangeet guest guide', href: '/blog/what-should-guests-wear-to-a-sangeet' }]),
  '/shop-by-fulfillment': hub('Shop Indian Outfits by Fulfillment', 'Separate ready-to-ship, made-to-order and customizable Indian outfits before ordering.', 'Fulfillment describes what happens before dispatch. Ready-to-ship is shown only when the current catalog has positive evidence for that classification; made-to-order requires production; customizable means only the options expressly listed can be requested. Availability for sale alone does not prove immediate stock.', [{ label: 'Ready-to-ship outfits', href: '/shop-by-fulfillment/ready-to-ship' }, { label: 'Made-to-order outfits', href: '/shop-by-fulfillment/made-to-order' }, { label: 'Customizable outfits', href: '/shop-by-fulfillment/customizable-outfits' }, { label: 'Ready-to-ship versus made-to-order guide', href: '/blog/ready-to-ship-versus-made-to-order' }, { label: 'Fixed wedding-date planning guide', href: '/blog/how-early-to-order-for-a-fixed-wedding-date' }]),
  '/shop-by-fulfillment/ready-to-ship': hub('Ready-to-Ship Indian Outfits', 'Browse items with positive ready-to-ship catalog evidence while confirming selected-variant availability and processing.', 'This page uses only products with an explicit ready-to-ship tag or a positive ships-within value in the current catalog. That classification does not promise immediate dispatch or event-date delivery. Confirm the exact selected variant, product-level processing information and destination before ordering.', [{ label: 'Browse current ready-to-ship items', href: '/ready-to-ship' }, ...commonShopLinks]),
  '/shop-by-fulfillment/made-to-order': hub('Made-to-Order Indian Outfits', 'Browse products explicitly classified as made to order and plan production, measurements and transit.', 'This page includes current, orderable products whose catalog record explicitly identifies Made to Order. Production begins after an order is confirmed; the product must not be treated as immediately stocked merely because Shopify accepts the order. Review measurements, supported options and processing separately from carrier transit.', [{ label: 'Customizable outfits (separate classification)', href: '/collections/customizable-indian-outfits' }, { label: 'Ready-to-ship versus made-to-order guide', href: '/blog/ready-to-ship-versus-made-to-order' }, { label: 'Measurement guide', href: '/sizing-measurements-guide' }, ...commonShopLinks]),
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
      { heading: 'Processing and carrier transit', body: 'Processing is the time before dispatch and varies by product and selected service. Carrier transit begins after dispatch. When tracking is issued, label creation may precede the carrier’s first scan. Neither an estimate nor tracking creation guarantees delivery by an event date.' },
      { heading: 'Duties, taxes and fees', body: zone.duties + ' Customers are responsible for reviewing destination-country import requirements. LuxeMia does not promise that a shipment will be free of duties, tax, brokerage or carrier charges unless checkout expressly states that treatment.' },
      { heading: 'Returns, issues and support', body: 'Review the returns policy before ordering. Contact support promptly for damage, defects, a materially misdescribed item, an incorrect item or missing pieces. Keep packaging and provide requested evidence; mandatory consumer rights remain unaffected.' },
    ],
    links: [{ label: 'All shipping destinations and rates', href: '/shipping' }, { label: 'Returns policy', href: '/returns' }, { label: 'Contact LuxeMia support', href: '/us-support' }, { label: 'Measurement guide', href: '/sizing-measurements-guide' }],
  };
}

type CollectionStandard = NonNullable<ReturnType<typeof getCollectionStandard>>;

const CatalogLoadError = ({ retryHref }: { retryHref: string }) => (
  <section className="border-y border-destructive/30 bg-destructive/5 py-12" role="alert">
    <div className="container mx-auto max-w-3xl px-4 text-center lg:px-8">
      <h2 className="font-serif text-2xl">Current inventory could not be loaded</h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        Product availability is temporarily unavailable. Try this page again, or contact LuxeMia before relying on a specific option.
      </p>
      <a
        className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        href={retryHref}
      >
        Try again
      </a>
    </div>
  </section>
);

const SemanticPageLayout = ({
  page,
  pathname,
  collectionStandard,
  products = [],
  isLoading = false,
  error = null,
  noIndex = false,
}: {
  page: Definition;
  pathname: string;
  collectionStandard?: CollectionStandard;
  products?: ShopifyProduct[];
  isLoading?: boolean;
  error?: string | null;
  noIndex?: boolean;
}) => {
  const canonical = `https://luxemia.shop${pathname}`;
  const collectionName = page.title.replace(' | LuxeMia', '');
  const collectionItems = toCollectionSchemaItems(products);

  return <div className="min-h-screen bg-background">
    <SEOHead
      title={page.title}
      description={page.description}
      canonical={canonical}
      noIndex={noIndex}
      type={collectionStandard ? 'collection' : 'website'}
      collection={collectionStandard && !isLoading && !error
        ? { name: collectionName, description: page.description, items: collectionItems }
        : undefined}
      breadcrumbs={[{ name: 'Home', url: '/' }, { name: collectionStandard ? collectionName : page.eyebrow, url: pathname }]}
    />
    <Header />
    <main id="main-content" className="pt-[90px] lg:pt-[132px] pb-16">
      <section className="bg-secondary/45 py-14 lg:py-20"><div className="container mx-auto max-w-4xl px-4 lg:px-8">
        <p className="mb-3 text-sm uppercase tracking-luxury text-muted-foreground">{page.eyebrow}</p>
        <h1 className="font-serif text-4xl md:text-5xl">{collectionName}</h1>
        <p className="mt-6 text-lg leading-8 text-foreground/75">{collectionStandard?.directAnswer || page.answer}</p>
      </div></section>
      <section className="container mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-[1fr_280px] lg:px-8">
        <div className="space-y-10">{page.sections.map(section => <article key={section.heading}><h2 className="mb-3 font-serif text-2xl">{section.heading}</h2><p className="leading-7 text-muted-foreground">{section.body}</p></article>)}</div>
        <aside className="h-fit border border-border bg-card p-6"><h2 className="font-serif text-xl">Choose by need</h2><nav className="mt-4 flex flex-col gap-3">{page.links.map(link => <Link className="text-sm text-primary underline underline-offset-4" key={link.href} to={link.href}>{link.label}</Link>)}</nav></aside>
      </section>
      {collectionStandard
        ? error
          ? <CatalogLoadError retryHref={pathname} />
          : <CollectionDecisionSupport path={pathname} products={products} isLoading={isLoading} />
        : null}
    </main><Footer />
  </div>;
};

const SemanticCollectionPage = ({ page, pathname, standard }: { page: Definition; pathname: string; standard: CollectionStandard }) => {
  const { products, isLoading, error } = useShopifyProducts(standard.category);
  const evidenceBoundFulfillmentPage = standard.category === 'ready-to-ship'
    || standard.category === 'made-to-order';
  const noIndex = evidenceBoundFulfillmentPage && !isLoading && !error && products.length === 0;
  return <SemanticPageLayout page={page} pathname={pathname} collectionStandard={standard} products={products} isLoading={isLoading} error={error} noIndex={noIndex} />;
};

const SemanticCommercePage = () => {
  const { pathname } = useLocation();
  const page = DEFINITIONS[pathname] || countryDefinition(pathname);
  if (!page) return null;
  const collectionStandard = getCollectionStandard(pathname);
  return collectionStandard
    ? <SemanticCollectionPage page={page} pathname={pathname} standard={collectionStandard} />
    : <SemanticPageLayout page={page} pathname={pathname} />;
};

export default SemanticCommercePage;
