import type { ReactNode } from 'react';
import type { CategoryConfig, Subcategory } from '@/config/categoryConfig';
import { getCategoryConfig } from '@/config/categoryConfig';
import { getIndexableRouteSeo } from '@/config/seoArchitecture';

export type CommercialLandingSlug =
  | 'sharara-suits'
  | 'gharara-suits'
  | 'anarkali-suits'
  | 'wedding-sarees'
  | 'banarasi-sarees'
  | 'designer-sarees'
  | 'bridal-lehengas'
  | 'party-wear-lehengas'
  | 'palazzo-suits'
  | 'sherwani-for-groom';

interface CommercialLandingDefinition {
  categorySlug: 'suits' | 'lehengas' | 'sarees' | 'menswear';
  subcategorySlug: string;
  subcategoryLabel?: string;
  name: string;
  title: string;
  description: string;
  editorialTitle: string;
  editorialContent: ReactNode;
  faqs: Array<{ question: string; answer: string }>;
}

const SHIPPING_COPY = (
  <p>
    LuxeMia offers tracked shipping to seven supported countries. U.S. standard shipping is $14.99 below $199 and
    free at $199 and above; the other destinations use the rates and thresholds on the Shipping page. Review the
    exact listing for size, included pieces, current availability and any product-specific timing before ordering.
  </p>
);

const SHIPPING_ANSWER = 'LuxeMia offers tracked shipping to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa and Mauritius. U.S. standard shipping is free at $199 and above and costs $14.99 below that threshold; the other destinations use the rates and thresholds on the Shipping page. When tracking is issued, carrier scans can appear after label creation.';

const LANDINGS: Record<CommercialLandingSlug, CommercialLandingDefinition> = {
  'banarasi-sarees': {
    categorySlug: 'sarees',
    subcategorySlug: 'banarasi',
    name: 'Banarasi Sarees',
    title: 'Banarasi Sarees | Current Catalog Listings | LuxeMia',
    description: 'Browse current sarees with explicit Banarasi catalog evidence. Verify fabric wording, weave or work, blouse details, dimensions and availability.',
    editorialTitle: 'Compare Current Banarasi Saree Listings',
    editorialContent: (
      <>
        <p>
          This collection is limited to current saree listings whose title, product type or tags explicitly identify Banarasi fabric or styling. The collection label does not independently certify fiber composition, weaving method or geographic origin; use the exact product record for those facts.
        </p>
        <h3>Verify Fabric, Weave and Blouse Details</h3>
        <p>
          Compare the stated fabric wording, zari or other work, saree dimensions, border, pallu and blouse information. Do not assume pure silk, hand weaving, a stitched blouse or any other construction detail unless the selected listing expressly states it.
        </p>
        <h3>Plan Draping, Processing and Transit</h3>
        <p>
          Review the selected option and <a href="/sizing-measurements-guide">measurement guide</a>, then check <a href="/shipping">shipping rates and planning for supported destinations</a>. Processing occurs before carrier transit, and delivery by a fixed event date is not guaranteed.
        </p>
      </>
    ),
    faqs: [
      { question: 'How are sarees selected for this Banarasi collection?', answer: 'A current saree listing must contain an explicit Banarasi signal in its title, product type or supported catalog tags and remain available for purchase.' },
      { question: 'Does the Banarasi collection label prove pure silk or hand weaving?', answer: 'No. Verify the exact fiber, fabric and weaving wording on the selected product page. A collection label does not add an unstated composition, technique or origin claim.' },
      { question: 'Does every Banarasi saree include a stitched blouse?', answer: 'No. Blouse fabric, stitching and other included pieces vary. Confirm the exact blouse information and selected option on the individual listing.' },
    ],
  },
  'palazzo-suits': {
    categorySlug: 'suits',
    subcategorySlug: 'palazzo',
    name: 'Palazzo Suits',
    title: 'Palazzo Suits | Wedding & Festive Styles | LuxeMia',
    description: 'Browse current palazzo suit listings. Verify fabric, work, included pieces, sizing and availability. Tracked shipping serves seven countries.',
    editorialTitle: 'Compare Current Palazzo Suit Listings',
    editorialContent: (
      <>
        <p>
          Palazzo suit listings can pair a kurta, tunic or top with wide-leg bottoms, and some include a dupatta or another layer. The exact construction and package contents vary, so the selected product page—not the collection name—controls what is supplied.
        </p>
        <h3>Verify the Silhouette and Included Pieces</h3>
        <p>
          Compare the stated top and bottom shape, fabric wording, work, lining, closures, measurements and every expressly included piece. Do not assume that a dupatta, jacket or accessory is supplied unless the listing says so.
        </p>
        <h3>Plan Sizing, Processing and Transit Separately</h3>
        <p>
          Use the <a href="/sizing-measurements-guide">measurement guide</a>, review the selected variant and product-level processing information, and then check <a href="/shipping">shipping rates and planning for all supported destinations</a>. Delivery by a fixed event date is not guaranteed.
        </p>
      </>
    ),
    faqs: [
      { question: 'What is included with a palazzo suit?', answer: 'Contents vary by listing. Confirm the exact top or kurta, palazzo bottoms, dupatta, lining, jacket and any other expressly stated piece on the selected product page.' },
      { question: 'How are products selected for this palazzo-suit collection?', answer: 'A current catalog title, product type or supported tag must identify the product as a palazzo style, and the selected product must remain explicitly available for purchase.' },
      { question: 'How should I plan for a fixed event date?', answer: 'Compare the selected size, product-level processing information and carrier transit separately, then contact LuxeMia before ordering. Delivery by a particular event date is not guaranteed.' },
    ],
  },
  'sherwani-for-groom': {
    categorySlug: 'menswear',
    subcategorySlug: 'groom-sherwani',
    name: 'Groom Sherwanis',
    title: 'Groom Sherwanis | Indian Wedding Menswear | LuxeMia',
    description: 'Browse current groom sherwani listings. Verify fabric, work, included garments, measurements and availability. Tracked shipping serves seven countries.',
    editorialTitle: 'Compare Current Groom Sherwani Listings',
    editorialContent: (
      <>
        <p>
          This collection is limited to current menswear with positive catalog evidence for both a sherwani garment and a groom role. Open the exact listing to verify its fabric wording, decorative work, closure, measurements, selected size and fulfillment classification.
        </p>
        <h3>Confirm Every Included Garment and Accessory</h3>
        <p>
          A sherwani listing does not automatically include a kurta, churidar, pajama, stole, turban or footwear. Treat only the pieces expressly stated on the selected product page as included with the order.
        </p>
        <h3>Plan Measurements and Wedding Timing</h3>
        <p>
          Compare current body measurements with the exact listing and use the <a href="/sizing-measurements-guide">measurement guide</a>. Processing occurs before carrier transit; review <a href="/shipping">shipping and event-date guidance</a> and contact LuxeMia before an event-critical order. Delivery by a fixed date is not guaranteed.
        </p>
      </>
    ),
    faqs: [
      { question: 'Which products appear in the groom-sherwani collection?', answer: 'Products require current catalog evidence for both a sherwani garment and a groom role. A general wedding or menswear label alone is not enough.' },
      { question: 'Does every groom sherwani include matching bottoms and a stole?', answer: 'No. Included garments and accessories vary. Confirm the exact sherwani, kurta, pajama or churidar, stole and any other piece on the selected listing.' },
      { question: 'Can LuxeMia guarantee that a sherwani will arrive before my wedding?', answer: 'No. Confirm sizing, fulfillment, processing and carrier transit separately and contact LuxeMia before ordering for a fixed date.' },
    ],
  },
  'sharara-suits': {
    categorySlug: 'suits',
    subcategorySlug: 'sharara',
    name: 'Sharara Suits',
    title: 'Sharara Suits Online | Wedding & Festive Sets | LuxeMia',
    description: 'Shop sharara suits online. Compare current colors, stated fabric, embroidery, included kurti, sharara and dupatta pieces, sizing and availability.',
    editorialTitle: 'Shop Sharara Suits Online for Weddings and Celebrations',
    editorialContent: (
      <>
        <p>
          Browse LuxeMia sharara suits for wedding events, festive celebrations and party wear. A sharara set commonly combines a short or mid-length kurti with flared bottoms and a dupatta, but the exact silhouette and included pieces vary by listing.
        </p>
        <h3>Compare Sharara Suit Details Before Ordering</h3>
        <p>
          Use the filters to compare color, fabric, embroidery and price. Open the exact product page to confirm the listed kurti, bottoms, dupatta, lining, size options and current availability rather than assuming every set includes the same pieces.
        </p>
        <h3>Wedding and Festive Sharara Sets</h3>
        <p>
          For a time-sensitive celebration, compare the selected size and product-specific dispatch information before ordering. See the <a href="/size-guide">size guide</a> and <a href="/shipping">shipping information</a> for planning details.
        </p>
        {SHIPPING_COPY}
      </>
    ),
    faqs: [
      { question: 'What is included in a sharara suit set?', answer: 'Included pieces vary by design. Check the exact listing to confirm the kurti, sharara bottoms, dupatta, lining and any other components.' },
      { question: 'Can I use the Sharara Suits page to compare wedding outfits?', answer: 'Yes. Use the filters to compare currently available styles, then verify fabric, work, size and timing on the specific product page before ordering.' },
      { question: 'Where does LuxeMia ship sharara suits?', answer: SHIPPING_ANSWER },
    ],
  },
  'gharara-suits': {
    categorySlug: 'suits',
    subcategorySlug: 'gharara',
    name: 'Gharara Suits',
    title: 'Gharara Suits Online | Wedding & Festive Sets | LuxeMia',
    description: 'Shop gharara suits online. Compare current colors, stated fabric, embroidery, included pieces, sizes and product availability for weddings and celebrations.',
    editorialTitle: 'Shop Gharara Suits Online for Weddings and Festive Events',
    editorialContent: (
      <>
        <p>
          Browse current LuxeMia gharara suit listings for wedding celebrations and festive occasions. Gharara styling can vary by design, so review the product photography and supplied description for the exact kurti, flared bottoms, dupatta and embellishment details.
        </p>
        <h3>Choose a Gharara Set by Color, Work and Included Pieces</h3>
        <p>
          Filter the current selection by color, fabric and work, then confirm the exact included pieces, sizing and availability on each listing. Product details—not a style name alone—are the reliable specification for every outfit.
        </p>
        <h3>Size and Delivery Planning</h3>
        <p>
          Review the <a href="/size-guide">size guide</a> and confirm the current product details before ordering for a fixed event date. For policy information, see <a href="/shipping">shipping information</a>.
        </p>
        {SHIPPING_COPY}
      </>
    ),
    faqs: [
      { question: 'What is the difference between gharara and sharara suits?', answer: 'Both styles use flared bottoms, but the exact cut, fit and construction vary by design. Check the product images and description for the specific LuxeMia set.' },
      { question: 'How many gharara suits are currently available?', answer: 'Availability changes. The product grid on this page reflects the current LuxeMia listings; open a listing to confirm the selected size and variant.' },
      { question: 'Where does LuxeMia ship gharara suits?', answer: SHIPPING_ANSWER },
    ],
  },
  'anarkali-suits': {
    categorySlug: 'suits',
    subcategorySlug: 'anarkali',
    name: 'Anarkali Suits',
    title: 'Anarkali Suits Online | Wedding & Party Wear | LuxeMia',
    description: 'Shop Anarkali suits online. Compare current colors, stated fabric, embroidery, included dupatta and bottoms, size options and availability.',
    editorialTitle: 'Shop Anarkali Suits Online for Weddings and Party Wear',
    editorialContent: (
      <>
        <p>
          Browse LuxeMia Anarkali suits for wedding events, festive gatherings and party wear. The collections include different fabrics, embroidery details and set contents, so use each product page to compare the supplied specifications before ordering.
        </p>
        <h3>Compare Anarkali Suit Fabric, Work and Fit</h3>
        <p>
          Use the filters to narrow current designs by color, fabric, embroidery and price. Confirm whether the selected set includes a dupatta, bottoms or lining, plus the available sizes and product-specific availability.
        </p>
        <h3>Plan for a Wedding or Celebration</h3>
        <p>
          For an event with a fixed date, review the listing and <a href="/shipping">shipping information</a> before ordering. Use the <a href="/size-guide">size guide</a> to compare your measurements with the product details.
        </p>
        {SHIPPING_COPY}
      </>
    ),
    faqs: [
      { question: 'What is an Anarkali suit?', answer: 'An Anarkali silhouette typically has a fitted bodice and a flared kurta. Construction, length, fabric and included pieces vary by product.' },
      { question: 'How can I compare Anarkali suit sizes?', answer: 'Review the size selector and product details, then use LuxeMia’s size guide. Contact LuxeMia if an important fit detail is unclear before ordering.' },
      { question: 'Do Anarkali sets include a dupatta?', answer: 'Some sets include a dupatta and some differ. The exact product description is the source of truth for included pieces.' },
    ],
  },
  'wedding-sarees': {
    categorySlug: 'sarees',
    subcategorySlug: 'wedding',
    subcategoryLabel: 'Ceremony Sarees',
    name: 'Wedding Sarees',
    title: 'Wedding Sarees Online | Indian Wedding Sarees | LuxeMia',
    description: 'Shop wedding sarees online. Compare current bridal and wedding saree listings by stated fabric, work, blouse details, price and availability before ordering.',
    editorialTitle: 'Shop Wedding Sarees Online for Indian Wedding Events',
    editorialContent: (
      <>
        <p>
          Browse current LuxeMia wedding sarees for ceremonies, receptions and family celebrations. Each listing has its own stated fabric, weave or work, blouse-piece details, dimensions and availability, so compare the individual product page before placing an event-critical order.
        </p>
        <h3>Compare Wedding Saree Details Before Ordering</h3>
        <p>
          Use the product grid to compare currently listed wedding and bridal sarees. Confirm the exact fabric wording, included blouse material or blouse details, selected option and current availability on the product page rather than assuming every saree has the same construction.
        </p>
        <h3>Plan Size and Delivery for a Wedding Event</h3>
        <p>
          Read the <a href="/size-guide">size guide</a> and the selected product details before ordering for a fixed date. See <a href="/shipping">shipping information</a> for current policy details and contact LuxeMia if an event-critical question remains unanswered.
        </p>
        {SHIPPING_COPY}
      </>
    ),
    faqs: [
      { question: 'What is included with a wedding saree?', answer: 'Included blouse material, stitching status and other pieces vary by listing. Check the exact product description and images before ordering.' },
      { question: 'How do I compare wedding sarees for an event?', answer: 'Compare the stated fabric, work, blouse details, price and current availability, then confirm the exact selected listing before placing an event-critical order.' },
      { question: 'Where does LuxeMia ship wedding sarees?', answer: SHIPPING_ANSWER },
    ],
  },
  'designer-sarees': {
    categorySlug: 'sarees',
    subcategorySlug: 'designer',
    subcategoryLabel: 'Designer',
    name: 'Designer Sarees',
    title: 'Designer Sarees Online | Embroidered & Party-Wear Styles | LuxeMia',
    description: 'Shop designer sarees online. Compare current colors, stated fabric, embroidery or work, blouse details, price and availability before ordering.',
    editorialTitle: 'Shop Designer Sarees Online for Receptions and Celebrations',
    editorialContent: (
      <>
        <p>
          Browse current LuxeMia designer saree listings for receptions, parties and celebrations. The word “designer” describes a product category or style label; it does not by itself confirm a particular maker, fabric, handwork method or included piece. Use the exact product page as the source of truth.
        </p>
        <h3>Compare Designer Saree Fabric, Work and Blouse Details</h3>
        <p>
          Open individual listings to compare the stated fabric, embroidery or embellishment, blouse information, dimensions, color and current price. Photography can help with styling, but the supplied product details control the exact specification.
        </p>
        <h3>Choose a Saree for a Reception or Party</h3>
        <p>
          Compare the selected item’s availability and product-specific timing before ordering for a fixed event. Review the <a href="/size-guide">size guide</a> and <a href="/shipping">shipping information</a> for planning details.
        </p>
        {SHIPPING_COPY}
      </>
    ),
    faqs: [
      { question: 'What does designer saree mean on this collection page?', answer: 'It identifies the current product category or style label. Confirm the exact fabric, work, included blouse details and availability on the individual listing.' },
      { question: 'How can I compare designer sarees online?', answer: 'Compare the stated fabric, color, work, blouse details, price and availability on each individual product page before ordering.' },
      { question: 'Where does LuxeMia ship designer sarees?', answer: SHIPPING_ANSWER },
    ],
  },
  'bridal-lehengas': {
    categorySlug: 'lehengas',
    subcategorySlug: 'bridal',
    name: 'Bridal Lehengas',
    title: 'Bridal Lehengas Online | Indian Wedding Lehengas | LuxeMia',
    description: 'Shop bridal lehengas online. Compare current colors, stated fabric, embroidery, included choli and dupatta pieces, sizing and availability.',
    editorialTitle: 'Shop Bridal Lehengas Online for Indian Wedding Events',
    editorialContent: (
      <>
        <p>
          Browse LuxeMia bridal lehengas for Indian wedding celebrations. Each design can differ in color, fabric, embroidery, blouse or choli details, dupatta, lining and stitching status, so compare the product page before making an event-critical purchase.
        </p>
        <h3>Compare Bridal Lehenga Details</h3>
        <p>
          Filter current listings by color, fabric, work and price. Review the exact listing for the included pieces, available size, current availability and any product-specific planning information.
        </p>
        <h3>Size and Timing for Bridal Orders</h3>
        <p>
          Begin with the <a href="/size-guide">size guide</a>, then read the selected product’s details and <a href="/shipping">shipping information</a>. Contact LuxeMia before ordering if a date, size or included-piece detail needs confirmation.
        </p>
        {SHIPPING_COPY}
      </>
    ),
    faqs: [
      { question: 'What is included with a bridal lehenga?', answer: 'Included pieces vary by design. Confirm the exact skirt, blouse or choli, dupatta, lining and accessory details on the individual product page.' },
      { question: 'How do I choose a bridal lehenga size?', answer: 'Compare your measurements with the selected listing and LuxeMia size guide. Size availability and tailoring options vary by product.' },
      { question: 'Where does LuxeMia ship bridal lehengas?', answer: SHIPPING_ANSWER },
    ],
  },
  'party-wear-lehengas': {
    categorySlug: 'lehengas',
    subcategorySlug: 'party-wear',
    name: 'Party-Wear Lehengas',
    title: 'Party-Wear Lehengas Online | Festive Lehenga Choli | LuxeMia',
    description: 'Shop party-wear lehengas online. Compare current colors, stated fabric, embroidery, included pieces, sizing and availability for festive events.',
    editorialTitle: 'Shop Party-Wear Lehengas Online for Festive Celebrations',
    editorialContent: (
      <>
        <p>
          Browse LuxeMia party-wear lehengas for receptions, festive events and celebrations. Current designs vary in silhouette, fabric, embroidery, color, included choli and dupatta details, so use the exact product listing to compare before ordering.
        </p>
        <h3>Choose a Party-Wear Lehenga by Color and Detail</h3>
        <p>
          Use the filters to compare current designs by color, fabric, work and price. Check the chosen listing for the exact included pieces, available size and product-specific availability.
        </p>
        <h3>Event Planning and Shipping</h3>
        <p>
          For a celebration with a fixed date, review the listing, <a href="/size-guide">size guide</a> and <a href="/shipping">shipping information</a> before ordering.
        </p>
        {SHIPPING_COPY}
      </>
    ),
    faqs: [
      { question: 'What makes a lehenga suitable for party wear?', answer: 'Occasion, color, work and styling vary by design. Use the product images and supplied listing details to choose a style for your event.' },
      { question: 'What is included in a party-wear lehenga set?', answer: 'Included pieces vary. Confirm the exact skirt, choli or blouse, dupatta, lining and any accessories on the selected product page.' },
      { question: 'Where does LuxeMia ship party-wear lehengas?', answer: SHIPPING_ANSWER },
    ],
  },
};

function cloneConfigForLanding(
  definition: CommercialLandingDefinition,
  path: CommercialLandingSlug,
): CategoryConfig {
  const base = getCategoryConfig(definition.categorySlug);
  if (!base) throw new Error(`Missing category configuration for ${definition.categorySlug}`);
  const routePath = `/collections/${path}`;
  const routeSeo = getIndexableRouteSeo(routePath);

  const subcategories: Subcategory[] = base.subcategories.map((subcategory) => (
    subcategory.slug === definition.subcategorySlug
      ? {
        ...subcategory,
        label: definition.subcategoryLabel ?? definition.name,
        seoTitle: routeSeo.title,
        seoDescription: routeSeo.description,
        seoCanonical: `https://luxemia.shop${routePath}`,
      }
      : subcategory
  ));

  return {
    ...base,
    name: definition.name,
    heroTitle: routeSeo.h1,
    heroSubtitle: routeSeo.description,
    seoTitle: routeSeo.title,
    seoDescription: routeSeo.description,
    canonical: `https://luxemia.shop${routePath}`,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Collections', url: '/collections' },
      { name: definition.name, url: `/collections/${path}` },
    ],
    subcategories,
    editorialTitle: definition.editorialTitle,
    editorialContent: definition.editorialContent,
    faqs: definition.faqs,
  };
}

export function getCommercialLandingConfig(path: CommercialLandingSlug): CategoryConfig {
  return cloneConfigForLanding(LANDINGS[path], path);
}

export function getCommercialLandingSubcategory(path: CommercialLandingSlug): string {
  return LANDINGS[path].subcategorySlug;
}
