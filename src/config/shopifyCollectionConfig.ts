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
    intro: 'Browse silk sarees listed for weddings, receptions, pujas and festive celebrations. Each product page states the supplied fabric details so you can compare drape, finish, work and blouse options before ordering.',
    editorialTitle: 'Choosing a Silk Saree Online',
    editorial: [
      'Silk sarees vary by weave, fiber composition, weight and finish. Use the exact fabric information on each product page when comparing styles; “silk” may describe pure silk, blended silk or an art-silk fabric depending on the individual listing.',
      'For wedding ceremonies, shoppers often prefer structured drapes and richer borders. Lighter silk blends can be easier for receptions, destination events and longer celebrations. Contact LuxeMia before ordering if you need help comparing current listings.',
    ],
    faqs: [
      { question: 'Are all sarees in this collection pure silk?', answer: 'Not necessarily. Fabric composition varies by product. Check the fabric details on the individual listing, and contact LuxeMia if you want confirmation before ordering.' },
      { question: 'Do silk sarees include a blouse piece?', answer: 'Inclusions vary by design. The product description states whether a blouse piece or stitched blouse is included.' },
      { question: 'Can you help me choose a silk saree for a wedding?', answer: 'Share the ceremony, season, preferred color, blouse requirements and budget with LuxeMia. We can help you compare current listings; the product page controls the exact fabric, included pieces, price and availability.' },
    ],
  },
  'kanchipuram-sarees': {
    handle: 'kanchipuram-sarees',
    name: 'Kanchipuram Sarees',
    eyebrow: 'South Indian Wedding Tradition',
    title: 'Kanchipuram Sarees Online | Wedding Sarees | LuxeMia',
    description: 'Explore Kanchipuram and Kanjivaram sarees for South Indian weddings. Review each product listing for its stated fabric, weave, zari, blouse and availability details.',
    canonical: 'https://luxemia.shop/collections/kanchipuram-sarees',
    intro: 'This collection shows sarees whose current product information identifies them as Kanchipuram, Kanjivaram or Kanjeevaram. Review the exact listing before ordering.',
    editorialTitle: 'How We Describe Kanchipuram Sarees',
    editorial: [
      'Kanchipuram and Kanjivaram are commonly used names for the celebrated saree tradition associated with Kanchipuram, Tamil Nadu. Because authenticity and fiber content matter, LuxeMia does not label a product as pure silk, handwoven or genuine zari unless the supplied product information supports that statement.',
      'Each current listing states the product information available to LuxeMia, including known fabric composition, blouse inclusion, work details and care information. Contact LuxeMia before ordering if an important detail is unclear.',
    ],
    faqs: [
      { question: 'Are Kanchipuram and Kanjivaram the same?', answer: 'The terms are commonly used for the same saree tradition associated with Kanchipuram in Tamil Nadu; spellings vary in English.' },
      { question: 'How can I verify whether a saree is pure silk?', answer: 'Review the exact fiber and weave information in the product listing. LuxeMia will not assume pure silk or genuine zari when that detail has not been supplied.' },
      { question: 'Are Kanchipuram sarees currently available?', answer: 'Current availability appears on this page and the individual product listing. If no qualifying product is shown, browse all sarees or contact LuxeMia before ordering.' },
    ],
  },
  'manthrakodi-sarees': {
    handle: 'manthrakodi-sarees',
    name: 'Manthrakodi Sarees',
    eyebrow: 'Kerala Christian Bridal Sarees',
    title: 'Manthrakodi Sarees for Kerala Christian Weddings | LuxeMia',
    description: 'Shop Manthrakodi sarees for Kerala Christian weddings. Browse bridal sarees with clearly stated fabric, border, blouse and product details, with tracked shipping to seven supported countries.',
    canonical: 'https://luxemia.shop/collections/manthrakodi-sarees',
    intro: 'This collection shows current listings identified for Manthrakodi sarees associated with Kerala Christian wedding traditions. Review each product page for the exact fabric, border, blouse and availability details.',
    editorialTitle: 'Selecting a Manthrakodi Saree',
    editorial: [
      'In many Kerala Christian wedding traditions, the Manthrakodi is the saree presented to the bride by the groom or his family and blessed as part of the ceremony. Customs can differ by family and church, so the right color, border and drape should follow your own tradition.',
      'LuxeMia states the supplied fabric composition, blouse information and embellishment details without making unsupported authenticity claims. Contact LuxeMia before ordering if you need help comparing current listings for your ceremony.',
    ],
    faqs: [
      { question: 'What is a Manthrakodi saree?', answer: 'It is a wedding saree associated with Kerala Christian marriage traditions, commonly presented to the bride by the groom or his family and blessed during the ceremony.' },
      { question: 'Does a Manthrakodi have to be a specific color?', answer: 'Practices vary by family, denomination and local custom. Confirm your ceremony requirements with your family or church before choosing a color and border.' },
      { question: 'Can LuxeMia help me compare Manthrakodi listings?', answer: 'Send your wedding date, preferred color, fabric, budget and ceremony requirements. LuxeMia can help you compare current listings, but cannot promise an unlisted product or option.' },
    ],
  },
  'bridal-party-outfits': {
    handle: 'bridal-party-outfits',
    name: 'Bridesmaid & Maid of Honor Outfits',
    eyebrow: "The Bride's Attendants",
    title: 'Indian Bridesmaid & Maid of Honor Outfits | LuxeMia',
    description: 'Shop Indian bridesmaid and maid of honor outfits. Explore coordinated lehengas, sarees and suits for the bride’s attendants, with styling support.',
    canonical: 'https://luxemia.shop/collections/bridal-party-outfits',
    intro: 'Coordinate the women standing with the bride without requiring everyone to wear the identical outfit. Browse current lehenga, saree and suit listings for bridesmaids and the maid or matron of honor.',
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
  'bollywood-inspired-indian-outfits': {
    handle: 'bollywood-inspired-indian-outfits',
    name: 'Bollywood-Inspired Indian Outfits',
    eyebrow: 'Cinema-Inspired Occasion Style',
    title: 'Bollywood-Inspired Indian Outfits & Sarees | LuxeMia',
    description: 'Shop Bollywood-inspired Indian outfits, sarees and lehengas influenced by memorable celebrity style moments for weddings, receptions and parties.',
    canonical: 'https://luxemia.shop/collections/bollywood-inspired-indian-outfits',
    intro: 'Discover sarees, lehengas and festive outfits described with cinematic glamour and contemporary Indian occasion style. Celebrity names describe style inspiration only; LuxeMia is not affiliated with or endorsed by any celebrity.',
    editorialTitle: 'How to Shop Bollywood-Inspired Indian Fashion',
    editorial: [
      'Bollywood-inspired fashion translates memorable screen and red-carpet style directions into wearable Indian occasion looks. Compare fabric, drape, embroidery and included pieces on each listing rather than assuming an exact replica.',
      'Style references may include looks associated with Alia Bhatt, Deepika Padukone, Madhuri Dixit, Kiara Advani, Katrina Kaif, Rashmika Mandanna, Kareena Kapoor Khan, Kajol and Sonakshi Sinha. Names are used only to describe inspiration; no celebrity affiliation or endorsement is implied.',
    ],
    faqs: [
      { question: 'Are these outfits worn or endorsed by Bollywood celebrities?', answer: 'No. These are independent fashion interpretations inspired by broader Bollywood and red-carpet style directions. LuxeMia is not affiliated with or endorsed by any celebrity.' },
      { question: 'Are these exact replicas of celebrity outfits?', answer: 'Not necessarily. Review each listing for the exact fabric, color, embroidery and package contents. Product titles describe the available garment, not celebrity ownership or endorsement.' },
      { question: 'What occasions suit Bollywood-inspired Indian outfits?', answer: 'Depending on the fabric and embellishment, these styles can suit weddings, receptions, sangeet events, festive parties and formal celebrations.' },
    ],
  },
};

export function getShopifyCollectionConfig(handle?: string) {
  return handle ? collectionConfigs[handle] : undefined;
}
