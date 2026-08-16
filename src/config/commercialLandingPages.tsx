import type { ReactNode } from 'react';
import type { CategoryConfig, Subcategory } from '@/config/categoryConfig';
import { getCategoryConfig } from '@/config/categoryConfig';

export type CommercialLandingSlug =
  | 'sharara-suits'
  | 'gharara-suits'
  | 'anarkali-suits'
  | 'bridal-lehengas'
  | 'party-wear-lehengas';

interface CommercialLandingDefinition {
  categorySlug: 'suits' | 'lehengas';
  subcategorySlug: string;
  name: string;
  title: string;
  description: string;
  editorialTitle: string;
  editorialContent: ReactNode;
  faqs: Array<{ question: string; answer: string }>;
}

const US_SHIPPING_COPY = (
  <p>
    Free U.S. standard shipping applies at $150 and above; shipping is $12 below that threshold.
    Review the exact listing for size, included pieces, current availability and any product-specific timing before ordering.
  </p>
);

const LANDINGS: Record<CommercialLandingSlug, CommercialLandingDefinition> = {
  'sharara-suits': {
    categorySlug: 'suits',
    subcategorySlug: 'sharara',
    name: 'Sharara Suits',
    title: 'Sharara Suits Online USA | Wedding & Festive Sets | LuxeMia',
    description: 'Shop sharara suits online in the USA. Compare current colors, stated fabric, embroidery, included kurti, sharara and dupatta pieces, sizing and availability.',
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
        {US_SHIPPING_COPY}
      </>
    ),
    faqs: [
      { question: 'What is included in a sharara suit set?', answer: 'Included pieces vary by design. Check the exact listing to confirm the kurti, sharara bottoms, dupatta, lining and any other components.' },
      { question: 'Can I use the Sharara Suits page to compare wedding outfits?', answer: 'Yes. Use the filters to compare currently available styles, then verify fabric, work, size and timing on the specific product page before ordering.' },
      { question: 'Do you ship sharara suits in the United States?', answer: 'LuxeMia ships to U.S. addresses. Free standard shipping applies at $150 and above, and tracking is provided after dispatch.' },
    ],
  },
  'gharara-suits': {
    categorySlug: 'suits',
    subcategorySlug: 'gharara',
    name: 'Gharara Suits',
    title: 'Gharara Suits Online USA | Wedding & Festive Sets | LuxeMia',
    description: 'Shop gharara suits online in the USA. Compare current colors, stated fabric, embroidery, included pieces, sizes and product availability for weddings and celebrations.',
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
        {US_SHIPPING_COPY}
      </>
    ),
    faqs: [
      { question: 'What is the difference between gharara and sharara suits?', answer: 'Both styles use flared bottoms, but the exact cut, fit and construction vary by design. Check the product images and description for the specific LuxeMia set.' },
      { question: 'How many gharara suits are currently available?', answer: 'Availability changes. The product grid on this page reflects the current LuxeMia listings; open a listing to confirm the selected size and variant.' },
      { question: 'Do you ship gharara suits in the United States?', answer: 'Yes. LuxeMia ships to U.S. addresses, with free standard shipping at $150 and above.' },
    ],
  },
  'anarkali-suits': {
    categorySlug: 'suits',
    subcategorySlug: 'anarkali',
    name: 'Anarkali Suits',
    title: 'Anarkali Suits Online USA | Wedding & Party Wear | LuxeMia',
    description: 'Shop Anarkali suits online in the USA. Compare current colors, stated fabric, embroidery, included dupatta and bottoms, size options and availability.',
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
        {US_SHIPPING_COPY}
      </>
    ),
    faqs: [
      { question: 'What is an Anarkali suit?', answer: 'An Anarkali silhouette typically has a fitted bodice and a flared kurta. Construction, length, fabric and included pieces vary by product.' },
      { question: 'How can I compare Anarkali suit sizes?', answer: 'Review the size selector and product details, then use LuxeMia’s size guide. Contact LuxeMia if an important fit detail is unclear before ordering.' },
      { question: 'Do Anarkali sets include a dupatta?', answer: 'Some sets include a dupatta and some differ. The exact product description is the source of truth for included pieces.' },
    ],
  },
  'bridal-lehengas': {
    categorySlug: 'lehengas',
    subcategorySlug: 'bridal',
    name: 'Bridal Lehengas',
    title: 'Bridal Lehengas Online USA | Indian Wedding Lehengas | LuxeMia',
    description: 'Shop bridal lehengas online in the USA. Compare current colors, stated fabric, embroidery, included choli and dupatta pieces, sizing and availability.',
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
        {US_SHIPPING_COPY}
      </>
    ),
    faqs: [
      { question: 'What is included with a bridal lehenga?', answer: 'Included pieces vary by design. Confirm the exact skirt, blouse or choli, dupatta, lining and accessory details on the individual product page.' },
      { question: 'How do I choose a bridal lehenga size?', answer: 'Compare your measurements with the selected listing and LuxeMia size guide. Size availability and tailoring options vary by product.' },
      { question: 'Do you offer U.S. shipping for bridal lehengas?', answer: 'Yes. LuxeMia ships to U.S. addresses, and free standard shipping applies at $150 and above.' },
    ],
  },
  'party-wear-lehengas': {
    categorySlug: 'lehengas',
    subcategorySlug: 'party-wear',
    name: 'Party-Wear Lehengas',
    title: 'Party-Wear Lehengas Online USA | Festive Lehenga Choli | LuxeMia',
    description: 'Shop party-wear lehengas online in the USA. Compare current colors, stated fabric, embroidery, included pieces, sizing and availability for festive events.',
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
        <h3>Event Planning and U.S. Delivery</h3>
        <p>
          For a celebration with a fixed date, review the listing, <a href="/size-guide">size guide</a> and <a href="/shipping">shipping information</a> before ordering.
        </p>
        {US_SHIPPING_COPY}
      </>
    ),
    faqs: [
      { question: 'What makes a lehenga suitable for party wear?', answer: 'Occasion, color, work and styling vary by design. Use the product images and supplied listing details to choose a style for your event.' },
      { question: 'What is included in a party-wear lehenga set?', answer: 'Included pieces vary. Confirm the exact skirt, choli or blouse, dupatta, lining and any accessories on the selected product page.' },
      { question: 'Can I order party-wear lehengas for U.S. delivery?', answer: 'Yes. LuxeMia ships to U.S. addresses, with free standard shipping at $150 and above.' },
    ],
  },
};

function cloneConfigForLanding(
  definition: CommercialLandingDefinition,
  path: CommercialLandingSlug,
): CategoryConfig {
  const base = getCategoryConfig(definition.categorySlug);
  if (!base) throw new Error(`Missing category configuration for ${definition.categorySlug}`);

  const subcategories: Subcategory[] = base.subcategories.map((subcategory) => (
    subcategory.slug === definition.subcategorySlug
      ? {
        ...subcategory,
        label: definition.name,
        seoTitle: definition.title,
        seoDescription: definition.description,
        seoCanonical: `https://luxemia.shop/collections/${path}`,
      }
      : subcategory
  ));

  return {
    ...base,
    name: definition.name,
    heroTitle: definition.name,
    heroSubtitle: definition.description,
    seoTitle: definition.title,
    seoDescription: definition.description,
    canonical: `https://luxemia.shop/collections/${path}`,
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
