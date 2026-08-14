import type { CategoryConfig } from '@/config/categoryConfig';
import { getCategoryConfig } from '@/config/categoryConfig';

export const RECOVERY_COLLECTION_HANDLES = [
  'wedding-sarees',
  'bridal-lehengas',
  'sharara-suits',
  'gharara-suits',
  'anarkali-suits',
  'designer-sarees',
] as const;

export type RecoveryCollectionHandle = (typeof RECOVERY_COLLECTION_HANDLES)[number];

type RecoveryDetails = {
  base: 'sarees' | 'lehengas' | 'suits';
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  seoTitle: string;
  seoDescription: string;
  editorialTitle: string;
  editorialParagraphs: string[];
  faqs: Array<{ question: string; answer: string }>;
};

const DETAILS: Record<RecoveryCollectionHandle, RecoveryDetails> = {
  'wedding-sarees': {
    base: 'sarees',
    name: 'Wedding Sarees',
    heroTitle: 'Wedding Sarees for Ceremonies & Receptions',
    heroSubtitle: 'Browse current wedding and bridal sarees, then verify the exact fabric, blouse details, size options and availability on each listing.',
    seoTitle: 'Wedding Sarees Online USA — Bridal & Ceremony Sarees | LuxeMia',
    seoDescription: 'Shop wedding sarees online for ceremonies, receptions and family celebrations. Compare exact fabric, included blouse details, sizing and tracked U.S. shipping.',
    editorialTitle: 'Choosing a Wedding Saree Online',
    editorialParagraphs: [
      'Wedding sarees vary by fabric, weave, embellishment, drape and included blouse material. Use each product page as the source of truth for the exact item rather than assuming that every wedding saree has the same construction.',
      'For a fixed event date, confirm the selected variant, measurements or blouse requirements, current availability and shipping estimate before checkout.',
    ],
    faqs: [
      { question: 'What is included with a LuxeMia wedding saree?', answer: 'Included pieces vary. Check the exact product page for the saree, blouse or blouse piece, petticoat, fall, lining and any other supplied component.' },
      { question: 'How do I choose a wedding saree size?', answer: 'Review the blouse or size options on the exact listing and use current body measurements. Contact LuxeMia before ordering when the product page does not state the required measurements.' },
      { question: 'Can I order a wedding saree for a fixed event date?', answer: 'Confirm current availability, any stitching or customization time, and carrier timing in writing before ordering. A planning estimate is not a delivery guarantee.' },
    ],
  },
  'bridal-lehengas': {
    base: 'lehengas',
    name: 'Bridal Lehengas',
    heroTitle: 'Bridal Lehengas for Wedding Ceremonies',
    heroSubtitle: 'Compare current bridal lehenga and lehenga-choli listings by fabric, included pieces, measurements, embellishment and availability.',
    seoTitle: 'Bridal Lehengas Online USA — Wedding Lehenga Choli | LuxeMia',
    seoDescription: 'Shop bridal lehengas and wedding lehenga choli online. Verify fabric, included pieces, measurements, current availability and tracked U.S. shipping.',
    editorialTitle: 'How to Compare Bridal Lehenga Listings',
    editorialParagraphs: [
      'A bridal lehenga listing may include a skirt, choli or blouse, dupatta and lining, but the supplied pieces and stitching status are product-specific. Read the exact listing before choosing a size or submitting measurements.',
      'Compare weight, movement, hem length, waist placement and event timing as well as color and embroidery. Contact LuxeMia before checkout when a required detail is not stated.',
    ],
    faqs: [
      { question: 'Does every bridal lehenga include a stitched blouse?', answer: 'No universal inclusion should be assumed. The exact product page states whether a blouse or choli is stitched, unstitched, customizable or included at all.' },
      { question: 'What measurements are commonly needed for a bridal lehenga?', answer: 'Requirements vary, but bust, waist, hip, blouse length and skirt length may be relevant. Follow the fields requested for the exact product.' },
      { question: 'Are all bridal lehengas ready to ship?', answer: 'No. Availability and production status vary by listing. Use the current product page and written confirmation for a fixed wedding date.' },
    ],
  },
  'sharara-suits': {
    base: 'suits',
    name: 'Sharara Suits',
    heroTitle: 'Sharara Suits & Coordinated Sets',
    heroSubtitle: 'Browse current sharara suits and sets, then verify the kurta, bottoms, dupatta, fabric, measurements and availability on each listing.',
    seoTitle: 'Sharara Suits Online USA — Wedding & Party Sharara Sets | LuxeMia',
    seoDescription: 'Shop sharara suits and coordinated sharara sets online. Compare included pieces, fabric, sizing, current availability and tracked U.S. shipping.',
    editorialTitle: 'What to Check in a Sharara Set',
    editorialParagraphs: [
      'Sharara is used for wide, flared bottoms, but product construction and the number of supplied pieces vary. Confirm whether the listing includes a kurta, sharara bottoms, dupatta, lining or other component.',
      'Use current body measurements and the exact product options. For wedding-party coordination, confirm every wearer’s measurements and the current color or production options before placing the order.',
    ],
    faqs: [
      { question: 'What pieces are included in a sharara suit?', answer: 'The set may include a kurta, sharara bottoms and dupatta, but inclusions vary. Review the exact product description and images.' },
      { question: 'How should a sharara suit fit?', answer: 'Fit depends on the kurta cut, waistband, rise, flare and length. Compare your current measurements with the selected listing rather than relying only on a letter size.' },
      { question: 'Can sharara suits be ordered for bridesmaids?', answer: 'Selected products may support group or customization requests. Contact LuxeMia before checkout to confirm the exact design, color, measurements and timing.' },
    ],
  },
  'gharara-suits': {
    base: 'suits',
    name: 'Gharara Suits',
    heroTitle: 'Gharara Suits & Readymade Gharara Sets',
    heroSubtitle: 'Shop current gharara styles while checking the exact bottom construction, included pieces, fabric, measurements and availability.',
    seoTitle: 'Gharara Suits Online USA — Readymade Gharara Sets | LuxeMia',
    seoDescription: 'Shop gharara suits and readymade gharara sets online. Compare exact included pieces, fabric, sizing, availability and tracked U.S. shipping.',
    editorialTitle: 'Gharara Construction Is Product-Specific',
    editorialParagraphs: [
      'A gharara is generally identified by a fitted upper leg and a pronounced flare around or below the knee, but terminology is not always used consistently across product catalogs. Use the photographs and exact product description to confirm the silhouette being supplied.',
      'Check the kurta length, waistband, bottom length, dupatta and lining details for the selected item. Contact LuxeMia when those details are not stated.',
    ],
    faqs: [
      { question: 'How is a gharara different from a sharara?', answer: 'A gharara commonly has a fitted upper section with a flare around or below the knee, while a sharara commonly flares more continuously. Product naming varies, so verify the exact listing photographs and construction.' },
      { question: 'Are LuxeMia gharara sets stitched?', answer: 'Stitching status varies. Review the exact listing for readymade, standard-size, unstitched or custom measurement details.' },
      { question: 'What should I measure for gharara bottoms?', answer: 'Waist, hip, rise and length may be relevant, but use the measurement fields required by the exact product.' },
    ],
  },
  'anarkali-suits': {
    base: 'suits',
    name: 'Anarkali Suits',
    heroTitle: 'Anarkali Suits for Weddings & Celebrations',
    heroSubtitle: 'Browse current flared anarkali suits and verify the exact fabric, lining, included pieces, measurements and availability.',
    seoTitle: 'Anarkali Suits Online USA — Wedding & Party Anarkalis | LuxeMia',
    seoDescription: 'Shop anarkali suits online for weddings and celebrations. Compare fabric, included pieces, measurements, current availability and tracked U.S. shipping.',
    editorialTitle: 'Choosing an Anarkali Suit',
    editorialParagraphs: [
      'Anarkali suits range from lightly flared kurtas to floor-length, heavily embellished occasionwear. The exact cut, lining, bottoms and dupatta are determined by the selected product rather than the category name alone.',
      'Check shoulder, bust, waist, armhole, sleeve and garment length requirements where applicable. Confirm event timing before ordering a product that requires stitching or customization.',
    ],
    faqs: [
      { question: 'What is included with an anarkali suit?', answer: 'The listing may include an anarkali kurta, pants or churidar and a dupatta. Check the exact product page because components vary.' },
      { question: 'How do I choose an anarkali length?', answer: 'Use your height, planned footwear and the product-specific length information. Contact LuxeMia if the listing does not state how length is measured.' },
      { question: 'Are anarkali suits suitable for wedding guests?', answer: 'Many are sold for weddings and celebrations, but formality, fabric, embellishment and fit vary. Choose from the details of the exact product and event.' },
    ],
  },
  'designer-sarees': {
    base: 'sarees',
    name: 'Designer Sarees',
    heroTitle: 'Designer Sarees for Weddings & Special Occasions',
    heroSubtitle: 'Browse current designer-saree listings and verify the exact fabric, work, blouse details, measurements and availability.',
    seoTitle: 'Designer Sarees Online USA — Wedding & Party Sarees | LuxeMia',
    seoDescription: 'Shop designer sarees online for weddings and special occasions. Compare exact fabric, work, blouse details, availability and tracked U.S. shipping.',
    editorialTitle: '“Designer Saree” Describes a Product Category',
    editorialParagraphs: [
      'On LuxeMia, a designer-saree product type does not imply affiliation with an unrelated luxury designer or fashion house. Brand, maker, materials and included pieces must come from the exact product listing.',
      'Compare fabric, surface work, borders, blouse details and care instructions before ordering. Product photography can also vary by lighting and screen settings.',
    ],
    faqs: [
      { question: 'Are LuxeMia designer sarees affiliated with famous designers?', answer: 'Do not assume an affiliation from the category name. The exact product page identifies the listed brand or vendor and product details.' },
      { question: 'Does a designer saree include a blouse?', answer: 'Blouse or blouse-piece inclusion varies. Check the product description and images for the exact item.' },
      { question: 'How should I care for an embellished saree?', answer: 'Follow the care information on the product page and garment label. Do not infer washing or dry-cleaning instructions from another saree.' },
    ],
  },
};

const createConfig = (handle: RecoveryCollectionHandle): CategoryConfig => {
  const details = DETAILS[handle];
  const base = getCategoryConfig(details.base);
  if (!base) throw new Error(`Missing base category configuration: ${details.base}`);

  const canonical = `https://luxemia.shop/collections/${handle}`;

  return {
    ...base,
    slug: handle,
    name: details.name,
    heroTitle: details.heroTitle,
    heroSubtitle: details.heroSubtitle,
    seoTitle: details.seoTitle,
    seoDescription: details.seoDescription,
    canonical,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: base.name, url: `/${details.base}` },
      { name: details.name, url: `/collections/${handle}` },
    ],
    subcategories: [],
    faqs: details.faqs,
    editorialTitle: details.editorialTitle,
    editorialContent: (
      <div className="space-y-4">
        {details.editorialParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p>
          Browse the current products above, use the individual listing as the source of truth,
          and review the <a className="underline" href="/sizing-measurements-guide">sizing and measurement guide</a>{' '}
          before checkout.
        </p>
      </div>
    ),
  };
};

const RECOVERY_COLLECTION_CONFIGS = Object.fromEntries(
  RECOVERY_COLLECTION_HANDLES.map((handle) => [handle, createConfig(handle)]),
) as Record<RecoveryCollectionHandle, CategoryConfig>;

export const getRecoveryCollectionConfig = (handle: RecoveryCollectionHandle): CategoryConfig =>
  RECOVERY_COLLECTION_CONFIGS[handle];
