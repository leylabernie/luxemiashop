import type { FAQItem } from '@/lib/schema';

export interface ShopifyCollectionPageConfig {
  handle: string;
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  canonical: string;
  intro: string;
  editorialTitle: string;
  editorial: string[];
  faqs: FAQItem[];
}

const collectionConfigs: Record<string, ShopifyCollectionPageConfig> = {
  'silk-sarees': {
    handle: 'silk-sarees',
    name: 'Silk Sarees',
    eyebrow: 'Wedding & Festive Sarees',
    title: 'Silk Sarees Online for Weddings & Festivals | LuxeMia',
    description: 'Shop silk sarees online for Indian weddings, receptions and festivals. Review each listing for its stated weave, fabric composition, blouse details and care instructions.',
    canonical: 'https://luxemia.shop/collections/silk-sarees',
    intro: 'Discover silk sarees selected for weddings, receptions, pujas and festive celebrations. Each product page states the supplied fabric details so you can compare drape, finish, work and blouse options before ordering.',
    editorialTitle: 'Choosing a Silk Saree Online',
    editorial: [
      'Silk sarees vary by weave, fiber composition, weight and finish. Use the exact fabric information on each product page when comparing styles; “silk” may describe pure silk, blended silk or an art-silk fabric depending on the individual listing.',
      'For wedding ceremonies, shoppers often prefer structured drapes and richer borders. Lighter silk blends can be easier for receptions, destination events and longer celebrations. Our styling team can help compare available options before purchase.',
    ],
    faqs: [
      { question: 'Are all sarees in this collection pure silk?', answer: 'Not necessarily. Fabric composition varies by product. Check the fabric details on the individual listing, and contact LuxeMia if you want confirmation before ordering.' },
      { question: 'Do silk sarees include a blouse piece?', answer: 'Inclusions vary by design. The product description states whether a blouse piece or stitched blouse is included.' },
      { question: 'Can you help me choose a silk saree for a wedding?', answer: 'Yes. Share the ceremony, season, preferred color and blouse requirements with our styling team for recommendations from the available collection.' },
    ],
  },
  'kanchipuram-sarees': {
    handle: 'kanchipuram-sarees',
    name: 'Kanchipuram Sarees',
    eyebrow: 'South Indian Wedding Tradition',
    title: 'Kanchipuram Sarees Online | Wedding Sarees | LuxeMia',
    description: 'Explore Kanchipuram and Kanjivaram sarees for South Indian weddings. Product listings clearly state fabric, weave and zari details available from the maker.',
    canonical: 'https://luxemia.shop/collections/kanchipuram-sarees',
    intro: 'This collection is reserved for sarees identified by the supplier as Kanchipuram, Kanjivaram or Kanjeevaram. New pieces are being reviewed before they are added.',
    editorialTitle: 'How We Describe Kanchipuram Sarees',
    editorial: [
      'Kanchipuram and Kanjivaram are commonly used names for the celebrated saree tradition associated with Kanchipuram, Tamil Nadu. Because authenticity and fiber content matter, LuxeMia does not label a product as pure silk, handwoven or genuine zari unless the supplied product information supports that statement.',
      'When styles become available, each listing will state the known fabric composition, blouse inclusion, work details and care information. Ask our styling team to verify any detail that is important for your ceremony before ordering.',
    ],
    faqs: [
      { question: 'Are Kanchipuram and Kanjivaram the same?', answer: 'The terms are commonly used for the same saree tradition associated with Kanchipuram in Tamil Nadu; spellings vary in English.' },
      { question: 'How can I verify whether a saree is pure silk?', answer: 'Review the exact fiber and maker information in the product listing. LuxeMia will not assume pure silk or genuine zari when that detail has not been supplied.' },
      { question: 'When will Kanchipuram sarees be available?', answer: 'We are reviewing new listings now. Contact our styling team to share your wedding date, color and budget, and we can notify you about suitable arrivals.' },
    ],
  },
  'manthrakodi-sarees': {
    handle: 'manthrakodi-sarees',
    name: 'Manthrakodi Sarees',
    eyebrow: 'Kerala Christian Bridal Sarees',
    title: 'Manthrakodi Sarees for Kerala Christian Weddings | LuxeMia',
    description: 'Shop Manthrakodi sarees for Kerala Christian weddings. Browse bridal sarees with clearly stated fabric, border, blouse and product details for U.S. delivery.',
    canonical: 'https://luxemia.shop/collections/manthrakodi-sarees',
    intro: 'This collection is being prepared for Manthrakodi sarees suited to Kerala Christian wedding traditions. New styles will be added only after their product details have been reviewed.',
    editorialTitle: 'Selecting a Manthrakodi Saree',
    editorial: [
      'In many Kerala Christian wedding traditions, the Manthrakodi is the saree presented to the bride by the groom or his family and blessed as part of the ceremony. Customs can differ by family and church, so the right color, border and drape should follow your own tradition.',
      'When products become available, LuxeMia will state the supplied fabric composition, blouse information and embellishment details without making unsupported authenticity claims. Our styling team can help you compare options for your ceremony.',
    ],
    faqs: [
      { question: 'What is a Manthrakodi saree?', answer: 'It is a wedding saree associated with Kerala Christian marriage traditions, commonly presented to the bride by the groom or his family and blessed during the ceremony.' },
      { question: 'Does a Manthrakodi have to be a specific color?', answer: 'Practices vary by family, denomination and local custom. Confirm your ceremony requirements with your family or church before choosing a color and border.' },
      { question: 'Can LuxeMia help source a Manthrakodi?', answer: 'Yes. Send your wedding date, preferred color, fabric, budget and ceremony requirements to our styling team so we can review suitable listings.' },
    ],
  },
  'bridal-party-outfits': {
    handle: 'bridal-party-outfits',
    name: 'Bridesmaid & Maid of Honor Outfits',
    eyebrow: "The Bride's Attendants",
    title: 'Indian Bridesmaid & Maid of Honor Outfits | LuxeMia',
    description: 'Shop Indian bridesmaid and maid of honor outfits. Explore coordinated lehengas, sarees and suits for the bride’s attendants, with styling support.',
    canonical: 'https://luxemia.shop/collections/bridal-party-outfits',
    intro: 'Coordinate the women standing with the bride without requiring everyone to wear the identical outfit. Browse lehengas, sarees and suits selected for bridesmaids and the maid or matron of honor.',
    editorialTitle: 'How to Coordinate Bridesmaid Looks',
    editorial: [
      'Start with a shared color family, fabric weight or embroidery detail, then allow silhouettes that suit each bridesmaid and ceremony. Coordinating one design element usually photographs more naturally than forcing everyone into the same cut.',
      'The maid or matron of honor can wear a deeper shade, a more detailed border or a distinct blouse while staying within the group palette. Before ordering, compare event date, sizes, alteration time and availability for the full group.',
    ],
    faqs: [
      { question: 'Do bridesmaid outfits need to match exactly?', answer: 'No. A coordinated palette, border, fabric or embroidery detail can create a cohesive group while allowing different silhouettes and sizes.' },
      { question: 'How should the maid of honor outfit be different?', answer: 'Use a deeper shade, a more detailed border, a different blouse or an additional accessory while keeping the outfit within the bridesmaid color palette.' },
      { question: 'Should I order every bridesmaid outfit at once?', answer: 'If exact matching matters, confirm current availability before ordering. Product batches and shades can change, so coordinated orders should be planned as early as possible.' },
    ],
  },
};

export function getShopifyCollectionConfig(handle?: string) {
  return handle ? collectionConfigs[handle] : undefined;
}
