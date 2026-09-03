export type CollectionStandardProfileKey =
  | 'mixed'
  | 'lehenga'
  | 'saree'
  | 'suit'
  | 'menswear'
  | 'jewelry'
  | 'occasion'
  | 'fulfillment';

export interface CollectionStandardLink {
  label: string;
  href: string;
}

export interface CollectionStandardProfile {
  chooseBy: CollectionStandardLink[];
  decisionRows: Array<[string, string, string]>;
  selectionGuidance: string;
  guideLinks: CollectionStandardLink[];
  faqs: Array<{ question: string; answer: string }>;
}

interface CollectionRouteDefinition {
  subject: string;
  profile: CollectionStandardProfileKey;
  category: string;
}

export interface CollectionStandard extends CollectionStandardProfile, CollectionRouteDefinition {
  path: string;
  directAnswer: string;
}

const COMMON_FAQS = [
  {
    question: 'Which details should I verify before ordering?',
    answer: 'Open the exact product page and verify its fabric wording, included pieces, measurements, selected option, price, availability and fulfillment information. A collection name does not add a feature or garment that the listing does not state.',
  },
  {
    question: 'How should I plan for a fixed event date?',
    answer: 'Treat processing and carrier transit as separate stages. Review the product-level timing and destination details, then contact LuxeMia before ordering when an event date is critical. Delivery by a particular date is not guaranteed.',
  },
];

const PROFILES: Record<CollectionStandardProfileKey, CollectionStandardProfile> = {
  mixed: {
    chooseBy: [
      { label: 'Lehengas', href: '/lehengas' },
      { label: 'Sarees', href: '/sarees' },
      { label: 'Salwar suits', href: '/suits' },
      { label: 'Menswear', href: '/menswear' },
    ],
    decisionRows: [
      ['Lehenga or saree', 'Draped or skirt-based occasion styling', 'Fabric, included pieces, measurements and drape needs'],
      ['Salwar suit or Indo-Western outfit', 'Coordinated or fusion styling', 'Exact top, bottom, dupatta or jacket contents'],
      ['Kurta set or sherwani', 'Men’s celebration styling', 'Chest, length, included garments and selected size'],
    ],
    selectionGuidance: 'Start with the invitation, role, venue and activities. Compare only the details stated on each product page, including measurements, included pieces, fabric wording, selected-variant availability and fulfillment. Photographs provide styling context but do not replace the written specifications.',
    guideLinks: [
      { label: 'Wedding guest attire guide', href: '/blog/what-should-a-non-indian-guest-wear-to-an-indian-wedding' },
      { label: 'Ready-to-ship versus made-to-order', href: '/blog/ready-to-ship-versus-made-to-order' },
      { label: 'Sizing and measurement guide', href: '/sizing-measurements-guide' },
    ],
    faqs: COMMON_FAQS,
  },
  lehenga: {
    chooseBy: [
      { label: 'All lehengas', href: '/lehengas' },
      { label: 'Bridal lehengas', href: '/collections/bridal-lehengas' },
      { label: 'Wedding-guest lehengas', href: '/collections/wedding-guest-lehengas' },
      { label: 'Party-wear lehengas', href: '/collections/party-wear-lehengas' },
      { label: 'Wedding events', href: '/wedding-events' },
    ],
    decisionRows: [
      ['Bridal lehenga', 'Ceremony-focused styling', 'Fabric, work, choli, dupatta, measurements and fulfillment'],
      ['Party-wear lehenga', 'Reception or celebration styling', 'Hem, closures, included pieces and movement needs'],
      ['Chaniya choli', 'Garba or Navratri shopping', 'Exact skirt, choli, dupatta, sizing and embellishment placement'],
    ],
    selectionGuidance: 'Compare waist, bust, skirt length, closures, included choli or dupatta pieces and the selected size. For dancing or a fixed event date, also review hem length, movement, fulfillment classification and processing before carrier transit.',
    guideLinks: [
      { label: 'How to measure for a lehenga', href: '/blog/how-to-measure-for-a-lehenga-ordered-online' },
      { label: 'Saree versus lehenga', href: '/blog/saree-versus-lehenga-for-a-wedding-guest' },
      { label: 'Sizing and measurement guide', href: '/sizing-measurements-guide' },
    ],
    faqs: COMMON_FAQS,
  },
  saree: {
    chooseBy: [
      { label: 'All sarees', href: '/sarees' },
      { label: 'Silk sarees', href: '/collections/silk-sarees' },
      { label: 'Banarasi sarees', href: '/collections/banarasi-sarees' },
      { label: 'Wedding sarees', href: '/collections/wedding-sarees' },
      { label: 'Designer sarees', href: '/collections/designer-sarees' },
    ],
    decisionRows: [
      ['Silk or silk-blend saree', 'Structured or traditional drape direction', 'Exact fiber wording, weave, border and care'],
      ['Lighter drape', 'Long events or reception styling', 'Fabric, dimensions, transparency and handling'],
      ['Ready-to-wear option', 'Reduced draping preparation', 'Stitching, measurements, blouse and petticoat details'],
    ],
    selectionGuidance: 'Verify the exact fabric description, saree dimensions, border or work and whether a blouse piece, stitched blouse or petticoat is stated. Plan draping, alterations and footwear separately, and follow product-specific care details when supplied.',
    guideLinks: [
      { label: 'Saree versus lehenga', href: '/blog/saree-versus-lehenga-for-a-wedding-guest' },
      { label: 'Indian clothing measurement guide', href: '/sizing-measurements-guide' },
      { label: 'Garment care guide', href: '/care-guide' },
    ],
    faqs: COMMON_FAQS,
  },
  suit: {
    chooseBy: [
      { label: 'All salwar suits', href: '/suits' },
      { label: 'Anarkali suits', href: '/collections/anarkali-suits' },
      { label: 'Sharara suits', href: '/collections/sharara-suits' },
      { label: 'Palazzo suits', href: '/collections/palazzo-suits' },
      { label: 'Gharara suits', href: '/collections/gharara-suits' },
    ],
    decisionRows: [
      ['Anarkali suit', 'Flared, longer-line styling', 'Kurta length, bottoms, dupatta and lining'],
      ['Sharara or gharara set', 'Wide-leg celebration styling', 'Bottom silhouette, rise, exact pieces and measurements'],
      ['Straight or palazzo suit', 'Streamlined or versatile styling', 'Top length, bottom shape, fabric and included pieces'],
    ],
    selectionGuidance: 'Compare bust, waist, hip, kurta length, bottom measurements and sleeve details. Confirm whether bottoms, dupatta, lining or a jacket are expressly included, and do not infer set contents from the style name alone.',
    guideLinks: [
      { label: 'Indian clothing measurement guide', href: '/sizing-measurements-guide' },
      { label: 'Wedding guest attire guide', href: '/blog/what-should-a-non-indian-guest-wear-to-an-indian-wedding' },
      { label: 'Ready-to-ship versus made-to-order', href: '/blog/ready-to-ship-versus-made-to-order' },
    ],
    faqs: COMMON_FAQS,
  },
  menswear: {
    chooseBy: [
      { label: 'All menswear', href: '/menswear' },
      { label: 'Groom sherwanis', href: '/collections/sherwani-for-groom' },
      { label: 'Wedding-guest kurta sets', href: '/collections/wedding-guest-kurta-sets' },
      { label: 'Diwali menswear', href: '/collections/diwali-menswear' },
      { label: 'Groomsmen outfits', href: '/collections/groomsmen-outfits' },
      { label: 'Wedding-party support', href: '/wedding-party-orders' },
      { label: 'Made-to-order outfits', href: '/shop-by-fulfillment/made-to-order' },
    ],
    decisionRows: [
      ['Kurta pajama set', 'Ceremony or guest styling', 'Exact kurta, bottom and jacket contents'],
      ['Nehru-style jacket set', 'Layered coordinated styling', 'Jacket fabric, closure, chest and supplied garments'],
      ['Sherwani', 'More formal wedding styling', 'Chest, length, bottoms, accessories and fulfillment'],
    ],
    selectionGuidance: 'Compare chest, shoulder, sleeve, kurta or jacket length and bottom measurements. Confirm every included garment and accessory on the exact listing. For groups, request a current size-and-quantity check before purchasing.',
    guideLinks: [
      { label: 'Sherwani versus kurta set', href: '/blog/sherwani-versus-kurta-set' },
      { label: 'Three-day wedding menswear guide', href: '/blog/what-should-a-male-guest-wear-to-a-three-day-indian-wedding' },
      { label: 'Sizing and measurement guide', href: '/sizing-measurements-guide' },
    ],
    faqs: COMMON_FAQS,
  },
  jewelry: {
    chooseBy: [
      { label: 'All jewelry', href: '/jewelry' },
      { label: 'Bridal lehengas', href: '/collections/bridal-lehengas' },
      { label: 'Wedding sarees', href: '/collections/wedding-sarees' },
      { label: 'Wedding guest outfits', href: '/collections/wedding-guest-outfits' },
    ],
    decisionRows: [
      ['Necklace or choker set', 'Neckline-focused coordination', 'Length, closure, finish and exact included pieces'],
      ['Earrings or headpiece', 'Focused accessory styling', 'Dimensions, weight when supplied and fastening'],
      ['Coordinated bridal set', 'Multiple matching pieces', 'Every necklace, earring or accessory expressly listed'],
    ],
    selectionGuidance: 'Compare the stated finish, stones, dimensions, closure and exact number of pieces. Match necklace length to the garment neckline and store pieces away from water, perfume, lotion and household chemicals.',
    guideLinks: [
      { label: 'Wedding guest attire guide', href: '/blog/what-should-a-non-indian-guest-wear-to-an-indian-wedding' },
      { label: 'Garment and accessory care', href: '/care-guide' },
      { label: 'Wedding-event collections', href: '/wedding-events' },
    ],
    faqs: COMMON_FAQS,
  },
  occasion: {
    chooseBy: [
      { label: 'Wedding events', href: '/wedding-events' },
      { label: 'Wedding guest outfits', href: '/collections/wedding-guest-outfits' },
      { label: 'Festive wear', href: '/festive-wear' },
      { label: 'Diwali womenswear', href: '/collections/diwali-womenswear' },
      { label: 'All collections', href: '/collections' },
    ],
    decisionRows: [
      ['Draped style', 'Saree-led ceremony or reception look', 'Fabric, blouse details, dimensions and drape planning'],
      ['Skirt or coordinated set', 'Festive movement or layered styling', 'Hem, closures, exact pieces and measurements'],
      ['Menswear or fusion style', 'Kurta, sherwani or Indo-Western direction', 'Jacket, bottoms, chest, length and fulfillment'],
    ],
    selectionGuidance: 'Follow the invitation and host guidance because formality, color customs and event format vary. Then compare movement, venue conditions, secure draping, exact included pieces, measurements, selected-variant availability and fulfillment on the product page.',
    guideLinks: [
      { label: 'Non-Indian wedding guest guide', href: '/blog/what-should-a-non-indian-guest-wear-to-an-indian-wedding' },
      { label: 'How early to order', href: '/blog/how-early-to-order-for-a-fixed-wedding-date' },
      { label: 'Sizing and measurement guide', href: '/sizing-measurements-guide' },
    ],
    faqs: COMMON_FAQS,
  },
  fulfillment: {
    chooseBy: [
      { label: 'Ready to ship', href: '/shop-by-fulfillment/ready-to-ship' },
      { label: 'Made to order', href: '/shop-by-fulfillment/made-to-order' },
      { label: 'Customizable outfits', href: '/shop-by-fulfillment/customizable-outfits' },
      { label: 'All collections', href: '/collections' },
    ],
    decisionRows: [
      ['Ready to ship', 'Requires a positive catalog tag or ships-within value', 'Selected variant, order processing and carrier transit'],
      ['Made to order', 'Production begins after confirmation', 'Measurements, supported options, production and transit'],
      ['Customizable', 'Only expressly listed changes', 'Written option confirmation, fabric availability and timing'],
    ],
    selectionGuidance: 'Treat fulfillment, order processing and carrier transit as separate stages. Availability for sale and the absence of a made-to-order label do not prove ready-to-ship status. Use only a positive catalog classification, choose options supported on the exact listing and obtain written confirmation when a customization or event date is important.',
    guideLinks: [
      { label: 'Ready-to-ship versus made-to-order', href: '/blog/ready-to-ship-versus-made-to-order' },
      { label: 'How early to order', href: '/blog/how-early-to-order-for-a-fixed-wedding-date' },
      { label: 'Sizing and measurement guide', href: '/sizing-measurements-guide' },
    ],
    faqs: COMMON_FAQS,
  },
};

interface CollectionStandardOverride extends CollectionStandardProfile {
  directAnswer: string;
}

const ROUTE_STANDARD_OVERRIDES: Partial<Record<string, CollectionStandardOverride>> = {
  '/collections/wedding-guest-lehengas': {
    directAnswer: 'This collection contains currently orderable lehenga listings with explicit wedding-guest, bridesmaid or maid-of-honor catalog evidence; listings expressly identified as bridal are excluded. Compare the exact skirt, choli or blouse, dupatta, fabric wording, work, measurements, stitching, selected variant, fulfillment and price before ordering. A collection match does not prove that every pictured piece is included or that one style suits every wedding.',
    chooseBy: [
      { label: 'All wedding guest outfits', href: '/collections/wedding-guest-outfits' },
      { label: 'All lehengas', href: '/lehengas' },
      { label: 'Sangeet outfits', href: '/collections/sangeet-outfits' },
    ],
    decisionRows: [
      ['Lehenga choli', 'Skirt-based guest styling', 'Exact skirt, choli or blouse, dupatta and stitching'],
      ['Bridesmaid listing', 'A coordinated wedding-party direction', 'Current color, measurements, quantity and role evidence'],
      ['Wedding-guest listing', 'A product with explicit guest-role evidence', 'Movement, hem, closures, work and fulfillment'],
    ],
    selectionGuidance: 'Follow the invitation and host guidance, then compare waist, bust, skirt length, closures, movement, every included piece and the selected variant. Wedding-guest relevance does not establish a universal dress rule, fit or delivery promise.',
    guideLinks: [
      { label: 'Saree versus lehenga for a guest', href: '/blog/saree-versus-lehenga-for-a-wedding-guest' },
      { label: 'How to measure for a lehenga', href: '/blog/how-to-measure-for-a-lehenga-ordered-online' },
      { label: 'How early to order', href: '/blog/how-early-to-order-for-a-fixed-wedding-date' },
    ],
    faqs: [
      { question: 'Which products appear in this wedding-guest lehenga collection?', answer: 'Products must have current product and variant availability, a lehenga signal in the title or product type, no menswear evidence, explicit wedding-guest, bridesmaid or maid-of-honor evidence, and no bridal or bride-role evidence.' },
      { question: 'Does every listing include a choli and dupatta?', answer: 'No. Open the selected listing and verify every expressly included piece; photographs and the collection name do not add items.' },
      ...COMMON_FAQS,
    ],
  },
  '/collections/wedding-guest-kurta-sets': {
    directAnswer: 'This collection contains currently orderable menswear with an explicit kurta-set garment signal and wedding-guest catalog evidence. Compare the exact kurta, pajama or other bottoms, jacket, dupatta or stole, fabric wording, chest and length measurements, selected size, fulfillment and price. The collection name does not establish which garments or accessories are included with a listing.',
    chooseBy: [
      { label: 'All wedding guest outfits', href: '/collections/wedding-guest-outfits' },
      { label: 'All Indian menswear', href: '/menswear' },
      { label: 'Groomsmen outfits', href: '/collections/groomsmen-outfits' },
    ],
    decisionRows: [
      ['Kurta pajama set', 'Ceremony or guest styling', 'Exact kurta, bottoms, chest, length and selected size'],
      ['Kurta with jacket', 'Layered wedding-event styling', 'Jacket fabric, closure and every supplied garment'],
      ['Kurta dhoti set', 'A different bottom silhouette', 'Exact bottom construction, measurements and movement'],
    ],
    selectionGuidance: 'Compare chest, shoulder, sleeve, kurta length, bottom measurements and every included garment on the exact listing. Follow the host’s event guidance and confirm processing and carrier transit separately for a fixed date.',
    guideLinks: [
      { label: 'Three-day wedding menswear guide', href: '/blog/what-should-a-male-guest-wear-to-a-three-day-indian-wedding' },
      { label: 'Sherwani versus kurta set', href: '/blog/sherwani-versus-kurta-set' },
      { label: 'Sizing and measurements', href: '/sizing-measurements-guide' },
    ],
    faqs: [
      { question: 'Which products appear in this wedding-guest kurta-set collection?', answer: 'Products must have current product and variant availability, a supported kurta-set signal in the title or product type, menswear evidence, and explicit wedding-guest, bridesmaid or maid-of-honor evidence.' },
      { question: 'Is a jacket or pajama always included?', answer: 'No. Confirm every included garment and accessory on the selected product page before ordering.' },
      ...COMMON_FAQS,
    ],
  },
  '/collections/diwali-womenswear': {
    directAnswer: 'This collection contains currently orderable women’s outfit listings with explicit Diwali, festive or festival evidence and a supported garment signal, such as saree, lehenga, salwar suit or Indo-Western. Compare exact fabric wording, work, included pieces, measurements, selected variant, fulfillment and price. Follow the host or organizer’s guidance because no color or silhouette is universally required for every celebration.',
    chooseBy: [
      { label: 'All Diwali outfits', href: '/collections/diwali-outfits' },
      { label: 'Diwali menswear', href: '/collections/diwali-menswear' },
      { label: 'All festive wear', href: '/festive-wear' },
    ],
    decisionRows: [
      ['Saree', 'Draped festive styling', 'Fabric, dimensions, blouse details and drape planning'],
      ['Lehenga', 'Skirt-based celebration styling', 'Exact pieces, hem, waist, stitching and movement'],
      ['Suit or Indo-Western outfit', 'Coordinated or fusion styling', 'Top, bottoms, dupatta or jacket contents'],
    ],
    selectionGuidance: 'Use the invitation, venue and planned activities first. Then compare the selected product’s measurements, included pieces, material wording, work, availability and processing. The collection label does not prove immediate dispatch or event-date delivery.',
    guideLinks: [
      { label: 'Festive outfit styling guide', href: '/blog/styling-indian-ethnic-wear-festive-occasions-abroad' },
      { label: 'Ready-to-ship versus made-to-order', href: '/blog/ready-to-ship-versus-made-to-order' },
      { label: 'Sizing and measurements', href: '/sizing-measurements-guide' },
    ],
    faqs: [
      { question: 'Which products appear in this Diwali womenswear collection?', answer: 'A current product must have an orderable garment variant, explicit Diwali, festive or festival evidence, a supported womenswear garment signal and no menswear evidence, and it cannot be a standalone blouse.' },
      { question: 'Is one color or silhouette required for Diwali?', answer: 'No. Practices vary; follow the host or organizer and choose from the exact verified product details.' },
      ...COMMON_FAQS,
    ],
  },
  '/collections/diwali-menswear': {
    directAnswer: 'This collection contains currently orderable menswear with explicit Diwali, festive or festival evidence and a supported garment signal, such as kurta, sherwani, jacket or dhoti. Compare each listing by its exact fabric wording, included garments, chest and length measurements, selected size, fulfillment and price. Follow the host or organizer’s guidance because no color or level of formality is universally required.',
    chooseBy: [
      { label: 'All Diwali outfits', href: '/collections/diwali-outfits' },
      { label: 'Diwali womenswear', href: '/collections/diwali-womenswear' },
      { label: 'All Indian menswear', href: '/menswear' },
    ],
    decisionRows: [
      ['Kurta pajama set', 'Festive coordinated dressing', 'Exact kurta, bottoms, measurements and selected size'],
      ['Kurta with jacket', 'Layered celebration styling', 'Jacket fabric, closure and every supplied garment'],
      ['Other menswear garment', 'A different stated festive direction', 'Product type, contents, measurements and fulfillment'],
    ],
    selectionGuidance: 'Follow the event’s dress guidance, then compare chest, shoulder, sleeve, garment length, bottoms and every included item. Confirm the selected variant and separate product processing from carrier transit before ordering for a fixed celebration date.',
    guideLinks: [
      { label: 'Festive outfit styling guide', href: '/blog/styling-indian-ethnic-wear-festive-occasions-abroad' },
      { label: 'Sherwani versus kurta set', href: '/blog/sherwani-versus-kurta-set' },
      { label: 'Sizing and measurements', href: '/sizing-measurements-guide' },
    ],
    faqs: [
      { question: 'Which products appear in this Diwali menswear collection?', answer: 'A current product must have an orderable garment variant plus explicit Diwali, festive or festival evidence, menswear evidence and a supported menswear garment signal.' },
      { question: 'Does every kurta listing include matching bottoms or a jacket?', answer: 'No. Confirm every garment and accessory expressly included on the selected product page.' },
      ...COMMON_FAQS,
    ],
  },
};

const ROUTES: Record<string, CollectionRouteDefinition> = {
  '/collections': { subject: 'all Indian ethnic wear collections', profile: 'mixed', category: 'all' },
  '/lehengas': { subject: 'lehenga collection', profile: 'lehenga', category: 'lehengas' },
  '/sarees': { subject: 'saree collection', profile: 'saree', category: 'sarees' },
  '/jewelry': { subject: 'Indian jewelry collection', profile: 'jewelry', category: 'jewelry' },
  '/collections/silk-sarees': { subject: 'silk saree collection', profile: 'saree', category: 'collection:silk-sarees' },
  '/collections/kanchipuram-sarees': { subject: 'Kanchipuram saree collection', profile: 'saree', category: 'collection:kanchipuram-sarees' },
  '/collections/banarasi-sarees': { subject: 'Banarasi saree collection', profile: 'saree', category: 'sarees' },
  '/collections/bridal-party-outfits': { subject: 'bridal-party outfit collection', profile: 'occasion', category: 'collection:bridal-party-outfits' },
  '/collections/bollywood-inspired-indian-outfits': { subject: 'Bollywood-inspired Indian outfit collection', profile: 'mixed', category: 'collection:bollywood-inspired-indian-outfits' },
  '/collections/customizable-indian-outfits': { subject: 'customizable Indian outfit collection', profile: 'fulfillment', category: 'customizable' },
  '/collections/sharara-suits': { subject: 'sharara suit collection', profile: 'suit', category: 'suits' },
  '/collections/gharara-suits': { subject: 'gharara suit collection', profile: 'suit', category: 'suits' },
  '/collections/anarkali-suits': { subject: 'Anarkali suit collection', profile: 'suit', category: 'suits' },
  '/collections/palazzo-suits': { subject: 'palazzo suit collection', profile: 'suit', category: 'suits' },
  '/collections/sherwani-for-groom': { subject: 'groom sherwani collection', profile: 'menswear', category: 'menswear' },
  '/collections/bridal-lehengas': { subject: 'bridal lehenga collection', profile: 'lehenga', category: 'lehengas' },
  '/collections/wedding-guest-lehengas': { subject: 'wedding-guest lehenga collection', profile: 'lehenga', category: 'occasion:wedding-guest-lehengas' },
  '/collections/wedding-guest-kurta-sets': { subject: 'wedding-guest kurta-set collection', profile: 'menswear', category: 'occasion:wedding-guest-kurta-sets' },
  '/collections/wedding-sarees': { subject: 'wedding saree collection', profile: 'saree', category: 'sarees' },
  '/collections/designer-sarees': { subject: 'designer saree collection', profile: 'saree', category: 'sarees' },
  '/collections/party-wear-lehengas': { subject: 'party-wear lehenga collection', profile: 'lehenga', category: 'lehengas' },
  '/suits': { subject: 'salwar suit collection', profile: 'suit', category: 'suits' },
  '/menswear': { subject: 'Indian menswear collection', profile: 'menswear', category: 'menswear' },
  '/indowestern': { subject: 'Indo-Western collection', profile: 'mixed', category: 'indowestern' },
  '/new-arrivals': { subject: 'new-arrivals collection', profile: 'mixed', category: 'all' },
  '/ready-to-ship': { subject: 'ready-to-ship collection', profile: 'fulfillment', category: 'ready-to-ship' },
  '/festive-wear': { subject: 'Indian festive-wear collection', profile: 'occasion', category: 'occasion:festive' },
  '/indian-wedding-guest-outfits': { subject: 'Indian wedding-guest outfit collection', profile: 'occasion', category: 'occasion:wedding-guest' },
  '/wedding-events': { subject: 'Indian wedding-event collection', profile: 'occasion', category: 'occasion:wedding-event' },
  '/shop-by-fulfillment': { subject: 'fulfillment shopping collection', profile: 'fulfillment', category: 'all' },
  '/shop-by-fulfillment/ready-to-ship': { subject: 'ready-to-ship Indian outfit collection', profile: 'fulfillment', category: 'ready-to-ship' },
  '/shop-by-fulfillment/made-to-order': { subject: 'made-to-order Indian outfit collection', profile: 'fulfillment', category: 'made-to-order' },
  '/shop-by-fulfillment/customizable-outfits': { subject: 'customizable Indian outfit collection', profile: 'fulfillment', category: 'customizable' },
  '/collections/diwali-outfits': { subject: 'Diwali outfit collection', profile: 'occasion', category: 'occasion:diwali' },
  '/collections/diwali-womenswear': { subject: 'Diwali womenswear collection', profile: 'occasion', category: 'occasion:diwali-womenswear' },
  '/collections/diwali-menswear': { subject: 'Diwali menswear collection', profile: 'menswear', category: 'occasion:diwali-menswear' },
  '/collections/wedding-guest-outfits': { subject: 'Indian wedding-guest outfit collection', profile: 'occasion', category: 'occasion:wedding-guest' },
  '/collections/mehendi-outfits': { subject: 'Mehendi outfit collection', profile: 'occasion', category: 'occasion:mehendi' },
  '/collections/eid-outfits': { subject: 'Eid outfit collection', profile: 'occasion', category: 'occasion:eid' },
  '/collections/navratri-outfits': { subject: 'Navratri outfit collection', profile: 'occasion', category: 'occasion:navratri' },
  '/collections/haldi-outfits': { subject: 'Haldi outfit collection', profile: 'occasion', category: 'occasion:haldi' },
  '/collections/navratri-chaniya-choli': { subject: 'Navratri chaniya-choli collection', profile: 'lehenga', category: 'occasion:navratri-chaniya' },
  '/collections/garba-outfits': { subject: 'Garba and Dandiya outfit collection', profile: 'occasion', category: 'occasion:garba' },
  '/collections/groomsmen-outfits': { subject: 'Indian groomsmen outfit collection', profile: 'menswear', category: 'occasion:groomsmen' },
  '/collections/sangeet-outfits': { subject: 'Sangeet outfit collection', profile: 'occasion', category: 'occasion:sangeet' },
  '/collections/reception-outfits': { subject: 'Indian reception outfit collection', profile: 'occasion', category: 'occasion:reception' },
};

const DIRECT_ANSWER_OVERRIDES: Partial<Record<string, string>> = {
  '/ready-to-ship': 'This page includes only currently purchasable products whose catalog record explicitly identifies ready-to-ship status through a supported tag or positive ships-within value. Ready to ship describes the product’s fulfillment classification; it does not promise same-day dispatch or event-date delivery. Processing and carrier transit remain separate. Confirm the selected variant, processing information, destination and carrier transit before ordering.',
};

export const INDEXABLE_COLLECTION_PATHS = Object.freeze(Object.keys(ROUTES));

export function getCollectionStandard(path: string): CollectionStandard | undefined {
  const definition = ROUTES[path];
  if (!definition) return undefined;
  const profile = PROFILES[definition.profile];
  const routeOverride = ROUTE_STANDARD_OVERRIDES[path];
  const directAnswer = routeOverride?.directAnswer
    || DIRECT_ANSWER_OVERRIDES[path]
    || `This ${definition.subject} page organizes current LuxeMia products for online comparison. Start with the occasion, garment type, fulfillment need or recipient, then open the exact product listing to verify fabric wording, included pieces, measurements, selected variant, price, availability and processing information. Product details and inventory can change, so the individual listing controls before checkout.`;
  const routeSpecificFaq = {
    question: `Which products appear in ${definition.subject}?`,
    answer: `Products must match the current catalog classification used for this ${definition.subject} page and remain available for sale. Open the exact listing before ordering because the collection label does not add an unstated fabric, piece, size, option, fulfillment status or occasion claim.`,
  };
  return {
    path,
    ...definition,
    ...profile,
    ...routeOverride,
    faqs: routeOverride?.faqs || [routeSpecificFaq, ...profile.faqs],
    directAnswer,
  };
}

for (const path of INDEXABLE_COLLECTION_PATHS) {
  const answer = getCollectionStandard(path)?.directAnswer || '';
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 40 || wordCount > 70) {
    throw new Error(`Collection direct answer for ${path} must contain 40–70 words; found ${wordCount}.`);
  }
}
