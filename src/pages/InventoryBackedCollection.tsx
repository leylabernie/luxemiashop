import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import ProductCard from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { sortProducts } from '@/lib/productFilters';

export type InventoryCollectionSlug =
  | 'navratri-chaniya-choli'
  | 'garba-outfits'
  | 'groomsmen-outfits'
  | 'sangeet-outfits'
  | 'reception-outfits';

interface InventoryCollectionConfig {
  slug: InventoryCollectionSlug;
  category: string;
  title: string;
  description: string;
  h1: string;
  answer: string;
  chooseBy: Array<{ label: string; href: string }>;
  decisionRows: Array<[string, string, string]>;
  selectionGuidance: string;
  guideLinks: Array<{ label: string; href: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

const sharedFaqs = [
  {
    question: 'How do I confirm what is included with an outfit?',
    answer: 'Open the exact product page and review its included-pieces details and images. A collection name does not add a blouse, dupatta, bottoms, jewelry, or accessory that the listing does not state.',
  },
  {
    question: 'How should I plan for a fixed event date?',
    answer: 'Confirm the selected product, size, fulfillment classification, processing information, destination, and carrier transit separately. Contact LuxeMia before ordering because delivery by a particular event is not guaranteed.',
  },
];

export const inventoryCollectionConfigs: Record<InventoryCollectionSlug, InventoryCollectionConfig> = {
  'navratri-chaniya-choli': {
    slug: 'navratri-chaniya-choli',
    category: 'occasion:navratri-chaniya',
    title: 'Navratri Chaniya Choli USA | Current Styles | LuxeMia',
    description: 'Shop current Navratri chaniya choli and lehenga sets. Compare included pieces, fabric, work, measurements, stitching, price and availability.',
    h1: 'Navratri Chaniya Choli Online in the USA',
    answer: 'This collection contains active lehenga, chaniya and choli listings whose current catalog information explicitly mentions Navratri or chaniya. Compare the selected product’s exact skirt, blouse or choli, dupatta, fabric, work, measurements, stitching status, price and availability before ordering for Garba or Dandiya.',
    chooseBy: [
      { label: 'All Navratri outfits', href: '/collections/navratri-outfits' },
      { label: 'Garba and Dandiya outfits', href: '/collections/garba-outfits' },
      { label: 'All festive wear', href: '/festive-wear' },
    ],
    decisionRows: [
      ['Chaniya choli or lehenga set', 'Traditional skirt-and-top styling', 'Exact listed pieces and skirt measurements'],
      ['Mirror or embroidered work', 'Visual movement for dance events', 'Placement, care and garment weight when supplied'],
      ['Ready-to-ship classification', 'Avoiding a production stage', 'Selected variant, processing and transit remain separate'],
    ],
    selectionGuidance: 'For dancing, compare waist, bust, skirt length, closures, garment weight when supplied, and dupatta security. Follow the dress guidance of your own host, temple, or community rather than assuming a universal color schedule.',
    guideLinks: [
      { label: 'Chaniya choli versus lehenga', href: '/blog/chaniya-choli-versus-lehenga' },
      { label: 'Navratri 2026 buying guide', href: '/blog/navratri-9-day-color-guide-2026' },
      { label: 'Online measurement guide', href: '/sizing-measurements-guide' },
    ],
    faqs: [
      { question: 'Which products appear on this Navratri chaniya choli page?', answer: 'Only active products with an explicit Navratri or chaniya catalog signal and a lehenga, chaniya, or choli garment signal are eligible.' },
      { question: 'Is every product a complete three-piece set?', answer: 'No. Set contents vary. Verify the exact skirt, blouse or choli, dupatta, jacket, and any other stated component on the selected listing.' },
      ...sharedFaqs,
    ],
  },
  'garba-outfits': {
    slug: 'garba-outfits',
    category: 'occasion:garba',
    title: 'Garba Outfits USA | Dandiya Clothing | LuxeMia',
    description: 'Shop active Garba and Dandiya outfit listings. Compare movement, included pieces, fabric, work, measurements, stitching and availability.',
    h1: 'Garba and Dandiya Outfits Online in the USA',
    answer: 'This collection contains active products whose current title, product type, or tags explicitly mention Garba or Dandiya. Choose for movement and venue conditions, then verify every included piece, measurement, closure, fabric, embellishment, stitching option, price and selected-variant availability on the exact product page.',
    chooseBy: [
      { label: 'Navratri chaniya choli', href: '/collections/navratri-chaniya-choli' },
      { label: 'All Navratri outfits', href: '/collections/navratri-outfits' },
      { label: 'Festive lehengas', href: '/collections/party-wear-lehengas' },
    ],
    decisionRows: [
      ['Chaniya choli or lehenga', 'Skirt movement and traditional styling', 'Waist, length, closures and listed contents'],
      ['Coordinated festive set', 'Simpler piece coordination', 'Whether bottoms and dupatta are explicitly included'],
      ['Made-to-order option', 'Supported size or color planning', 'Production begins after order confirmation'],
    ],
    selectionGuidance: 'Compare hem length, waist security, sleeve and neckline comfort, dupatta handling, embellishment placement, footwear, and the amount of movement expected. Confirm event timing before ordering and do not treat availability for sale as immediate dispatch.',
    guideLinks: [
      { label: 'Navratri 2026 buying guide', href: '/blog/navratri-9-day-color-guide-2026' },
      { label: 'Chaniya choli versus lehenga', href: '/blog/chaniya-choli-versus-lehenga' },
      { label: 'Ready-to-ship versus made-to-order', href: '/blog/ready-to-ship-versus-made-to-order' },
    ],
    faqs: [
      { question: 'How are products selected for this Garba page?', answer: 'The current title, product type, or tags must explicitly mention Garba or Dandiya, and the product must be available for sale.' },
      { question: 'Does LuxeMia guarantee delivery before my Garba event?', answer: 'No. Review processing and transit separately and contact LuxeMia before ordering for a fixed date.' },
      ...sharedFaqs,
    ],
  },
  'groomsmen-outfits': {
    slug: 'groomsmen-outfits',
    category: 'occasion:groomsmen',
    title: 'Indian Groomsmen Outfits USA | Kurta & Sherwani | LuxeMia',
    description: 'Shop active menswear listings explicitly identified for groomsmen. Compare kurta, jacket and sherwani pieces, measurements and availability.',
    h1: 'Indian Groomsmen Outfits Online in the USA',
    answer: 'This collection is limited to active menswear whose current catalog information explicitly identifies a groomsman or groomsmen use. Compare kurta sets, Nehru-style jacket sets, sherwanis, stated colors, included garments, chest and length measurements, fulfillment, price and availability before planning a coordinated group order.',
    chooseBy: [
      { label: 'All Indian menswear', href: '/menswear' },
      { label: 'Wedding-party order support', href: '/wedding-party-orders' },
      { label: 'Made-to-order outfits', href: '/shop-by-fulfillment/made-to-order' },
    ],
    decisionRows: [
      ['Kurta pajama set', 'Flexible ceremony or guest styling', 'Exact kurta, bottom and jacket contents'],
      ['Nehru-style jacket set', 'Coordinated layered group look', 'Jacket fabric, closure and supplied pieces'],
      ['Sherwani', 'More formal wedding styling', 'Chest, length, bottoms and accessories'],
    ],
    selectionGuidance: 'For a group order, collect event date, delivery country, group size, color direction, and individual measurements before requesting availability. A shared product does not guarantee that every required size or quantity is available.',
    guideLinks: [
      { label: 'Male guest three-day wedding guide', href: '/blog/what-should-a-male-guest-wear-to-a-three-day-indian-wedding' },
      { label: 'Sherwani versus kurta set', href: '/blog/sherwani-versus-kurta-set' },
      { label: 'Sizing and measurement guide', href: '/sizing-measurements-guide' },
    ],
    faqs: [
      { question: 'Are bridesmaid products included on this groomsmen page?', answer: 'No. Products must have both an explicit groomsman or groomsmen signal and a menswear signal.' },
      { question: 'Can LuxeMia guarantee matching sizes for a full group?', answer: 'No. Send the group requirements for a current product-and-size availability check before ordering.' },
      ...sharedFaqs,
    ],
  },
  'sangeet-outfits': {
    slug: 'sangeet-outfits',
    category: 'occasion:sangeet',
    title: 'Sangeet Outfits USA | Indian Dance-Event Styles | LuxeMia',
    description: 'Shop active products explicitly identified for Sangeet. Compare movement, fabric, included pieces, measurements, fulfillment and availability.',
    h1: 'Sangeet Outfits Online in the USA',
    answer: 'This collection contains active products whose current catalog information explicitly mentions Sangeet. Lehengas, shararas, sarees, kurta sets and Indo-Western outfits can suit different events; compare movement, secure draping, included pieces, measurements, fabric, work, fulfillment and selected-variant availability before ordering.',
    chooseBy: [
      { label: 'Party-wear lehengas', href: '/collections/party-wear-lehengas' },
      { label: 'Sharara suits', href: '/collections/sharara-suits' },
      { label: 'Indian menswear', href: '/menswear' },
    ],
    decisionRows: [
      ['Lehenga or sharara', 'Dance-friendly festive volume', 'Hem, waist, dupatta and stated set contents'],
      ['Saree', 'Draped evening styling', 'Blouse details, drape support and footwear'],
      ['Kurta or Indo-Western', 'Men’s or streamlined movement', 'Jacket, bottom, chest and length details'],
    ],
    selectionGuidance: 'Follow the invitation and host’s formality or color guidance. Compare secure draping, manageable hems, breathable construction when verified, and comfortable footwear. Product labels do not guarantee fit, weight, or included pieces.',
    guideLinks: [
      { label: 'What should guests wear to a Sangeet?', href: '/blog/what-should-guests-wear-to-a-sangeet' },
      { label: 'Saree versus lehenga for a wedding guest', href: '/blog/saree-versus-lehenga-for-a-wedding-guest' },
      { label: 'How early to order', href: '/blog/how-early-to-order-for-a-fixed-wedding-date' },
    ],
    faqs: [
      { question: 'Which products appear on the Sangeet page?', answer: 'An active product must explicitly mention Sangeet in its current title, product type, or tags.' },
      { question: 'Is one silhouette required for a Sangeet?', answer: 'No. Event formality and host guidance vary; choose from verified product details and the activities planned.' },
      ...sharedFaqs,
    ],
  },
  'reception-outfits': {
    slug: 'reception-outfits',
    category: 'occasion:reception',
    title: 'Indian Reception Outfits USA | Guest & Party Wear | LuxeMia',
    description: 'Shop active products explicitly identified for receptions. Compare formality, fabric, work, included pieces, measurements, price and availability.',
    h1: 'Indian Reception Outfits Online in the USA',
    answer: 'This collection contains active products whose current catalog information explicitly mentions a reception. Compare the host’s dress code with each listing’s silhouette, fabric wording, work, included pieces, measurements, fulfillment, price and selected-variant availability. Reception formality varies, so no single garment type is universally required.',
    chooseBy: [
      { label: 'Designer sarees', href: '/collections/designer-sarees' },
      { label: 'Party-wear lehengas', href: '/collections/party-wear-lehengas' },
      { label: 'Wedding guest outfits', href: '/collections/wedding-guest-outfits' },
    ],
    decisionRows: [
      ['Designer or party saree', 'Draped formal styling', 'Fabric, blouse details and drape planning'],
      ['Lehenga or sharara', 'Festive evening volume', 'Included pieces, hem and movement'],
      ['Kurta, sherwani or Indo-Western', 'Men’s formal or fusion styling', 'Jacket, bottoms and exact measurements'],
    ],
    selectionGuidance: 'Start with the invitation and venue. Compare ceremony-to-reception outfit changes, indoor or outdoor conditions, movement, footwear, and the selected product’s actual construction. Confirm timing before purchasing for a fixed wedding weekend.',
    guideLinks: [
      { label: 'What should a non-Indian guest wear?', href: '/blog/what-should-a-non-indian-guest-wear-to-an-indian-wedding' },
      { label: 'Saree versus lehenga', href: '/blog/saree-versus-lehenga-for-a-wedding-guest' },
      { label: 'How early to order', href: '/blog/how-early-to-order-for-a-fixed-wedding-date' },
    ],
    faqs: [
      { question: 'How are reception products selected?', answer: 'An active product must explicitly mention reception in its current title, product type, or tags.' },
      { question: 'Are reception outfits always black-tie?', answer: 'No. Follow the invitation and host guidance because venue, region, family preferences, and event format vary.' },
      ...sharedFaqs,
    ],
  },
};

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const InventoryBackedCollection = ({ landing }: { landing: InventoryCollectionSlug }) => {
  const config = inventoryCollectionConfigs[landing];
  const { products, isLoading } = useShopifyProducts(config.category);
  const [sortBy, setSortBy] = useState('featured');
  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
  const collectionItems = sortedProducts.slice(0, 30).map(({ node }) => ({
    id: node.id,
    name: node.title,
    url: node.handle,
    image: node.images.edges[0]?.node.url || '',
    price: node.priceRange.minVariantPrice.amount,
    currency: node.priceRange.minVariantPrice.currencyCode,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={config.title}
        description={config.description}
        canonical={`https://luxemia.shop/collections/${config.slug}`}
        type="collection"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: config.h1, url: `/collections/${config.slug}` },
        ]}
        collection={{ name: config.h1, description: config.description, items: collectionItems }}
        faqs={config.faqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">
        <section className="border-b border-border/30 bg-secondary/30 py-12">
          <div className="container mx-auto max-w-4xl px-4 text-center lg:px-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Current inventory-backed collection</p>
            <h1 className="font-serif text-3xl lg:text-5xl">{config.h1}</h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-muted-foreground lg:text-base">{config.answer}</p>
          </div>
        </section>

        <nav aria-label="Choose by" className="border-b border-border/30 bg-background py-5">
          <div className="container mx-auto flex max-w-5xl flex-wrap justify-center gap-3 px-4 lg:px-8">
            {config.chooseBy.map((item) => <Link key={item.href} to={item.href}><Button variant="outline" size="sm">{item.label}</Button></Link>)}
          </div>
        </nav>

        <section className="container mx-auto max-w-7xl px-4 py-10 lg:px-8" aria-labelledby={`${landing}-products`}>
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Verified catalog matches</p>
              <h2 id={`${landing}-products`} className="mt-2 font-serif text-2xl">Current products</h2>
              <p className="mt-2 text-sm text-muted-foreground">{isLoading ? 'Loading current inventory…' : `${sortedProducts.length} active matches`}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Sort <ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map((option) => <DropdownMenuItem key={option.value} onClick={() => setSortBy(option.value)}>{option.label}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-sm bg-muted" />)}</div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">{sortedProducts.map((product, index) => <ProductCard key={product.node.id} product={product} index={index} />)}</div>
          ) : (
            <div className="rounded-sm border border-border p-8 text-center"><h2 className="font-serif text-xl">No verified products currently available</h2><p className="mt-2 text-sm text-muted-foreground">This page is excluded from discovery when durable inventory is unavailable.</p></div>
          )}
        </section>

        <section className="border-y border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto max-w-5xl px-4 lg:px-8">
            <h2 className="text-center font-serif text-2xl">Compare before choosing</h2>
            <div className="mt-7 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse bg-background text-left text-sm">
                <thead><tr>{['Option', 'May suit', 'Verify on the listing'].map((heading) => <th key={heading} className="border border-border px-4 py-3 font-medium">{heading}</th>)}</tr></thead>
                <tbody>{config.decisionRows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell} className="border border-border px-4 py-3 align-top text-muted-foreground">{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <h2 className="mt-10 font-serif text-2xl">Product selection guidance</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{config.selectionGuidance}</p>
            <h2 className="mt-10 font-serif text-2xl">Relevant guides</h2>
            <ul className="mt-3 grid gap-2 text-sm md:grid-cols-3">{config.guideLinks.map((item) => <li key={item.href}><Link className="text-primary underline underline-offset-4" to={item.href}>{item.label}</Link></li>)}</ul>
            <div className="mt-10 flex flex-wrap gap-4 border-t border-border pt-6 text-sm">
              <Link className="text-primary underline" to="/shipping">Shipping rates and planning</Link>
              <Link className="text-primary underline" to="/returns#merchant-return-policy">Returns and order issues</Link>
              <Link className="text-primary underline" to="/sizing-measurements-guide">Sizing and measurements</Link>
              <Link className="text-primary underline" to="/contact">Contact U.S.-based support</Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-3xl px-4 py-14 lg:px-8">
          <h2 className="mb-7 text-center font-serif text-2xl">Frequently asked questions</h2>
          <Accordion type="single" collapsible>{config.faqs.map((faq, index) => <AccordionItem key={faq.question} value={`faq-${index}`}><AccordionTrigger className="text-left">{faq.question}</AccordionTrigger><AccordionContent className="leading-7 text-muted-foreground">{faq.answer}</AccordionContent></AccordionItem>)}</Accordion>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default InventoryBackedCollection;
