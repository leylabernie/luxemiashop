const SITE_URL = 'https://luxemia.shop';

export type CollectionIntent =
  | 'category'
  | 'bridal'
  | 'wedding'
  | 'reception'
  | 'party'
  | 'designer'
  | 'silk'
  | 'wedding-guest'
  | 'festival'
  | 'ceremony'
  | 'menswear';

export type CollectionRoutePath =
  | '/lehengas'
  | '/sarees'
  | '/suits'
  | '/menswear'
  | '/collections/bridal-lehengas'
  | '/collections/wedding-sarees'
  | '/collections/reception-outfits'
  | '/collections/party-wear-lehengas'
  | '/collections/designer-sarees'
  | '/collections/silk-sarees'
  | '/collections/pakistani-suits'
  | '/collections/anarkali-suits'
  | '/collections/wedding-guest-outfits'
  | '/collections/diwali-outfits'
  | '/collections/mehendi-outfits'
  | '/collections/eid-outfits'
  | '/collections/navratri-outfits';

export interface RelatedCollection {
  label: string;
  path: CollectionRoutePath | '/collections' | '/indowestern';
}

export interface CollectionSeoConfig {
  path: CollectionRoutePath;
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  h1: string;
  semanticTitle: string;
  primaryEntity: string;
  secondaryEntities: string[];
  intent: CollectionIntent;
  relatedCollections: RelatedCollection[];
  aiSearchQuestions: string[];
}

export const COLLECTION_SEO_CONFIG: Record<CollectionRoutePath, CollectionSeoConfig> = {
  '/collections/bridal-lehengas': {
    path: '/collections/bridal-lehengas',
    title: 'Bridal Lehengas Online | Indian Wedding Lehenga for Brides - LuxeMia',
    description: 'Shop bridal lehengas online at LuxeMia. Explore Indian bridal lehenga choli styles for weddings, engagement, reception, and ceremony looks with custom sizing support.',
    canonical: `${SITE_URL}/collections/bridal-lehengas`,
    ogImage: `${SITE_URL}/og/og-lehengas.jpg`,
    h1: 'Bridal Lehengas for Indian Weddings',
    semanticTitle: 'Indian bridal lehengas, wedding lehenga choli, and designer bridal lehengas online',
    primaryEntity: 'Indian Bridal Lehengas',
    secondaryEntities: ['Wedding lehenga for bride', 'Bridal lehenga choli', 'Embroidered bridal lehenga', 'Designer bridal lehengas online'],
    intent: 'bridal',
    relatedCollections: [
      { label: 'All Lehengas', path: '/lehengas' },
      { label: 'Wedding Guest Outfits', path: '/collections/wedding-guest-outfits' },
      { label: 'Mehendi Outfits', path: '/collections/mehendi-outfits' },
      { label: 'Menswear', path: '/menswear' },
    ],
    aiSearchQuestions: [
      'Where can I buy Indian bridal lehengas online?',
      'How do I choose a bridal lehenga for an Indian wedding?',
      'Can bridal lehengas be worn for reception or engagement events?',
    ],
  },
  '/collections/wedding-sarees': {
    path: '/collections/wedding-sarees',
    title: 'Wedding Sarees Online | Indian Bridal & Silk Sarees - LuxeMia',
    description: 'Shop wedding sarees online at LuxeMia. Explore Indian wedding sarees, Banarasi wedding sarees, Kanjivaram and Kanchipuram silk sarees for ceremonies.',
    canonical: `${SITE_URL}/collections/wedding-sarees`,
    ogImage: `${SITE_URL}/og/og-sarees.jpg`,
    h1: 'Wedding Sarees for Indian Ceremonies',
    semanticTitle: 'Indian wedding sarees, Banarasi wedding sarees, Kanjivaram sarees, and Kanchipuram silk wedding sarees',
    primaryEntity: 'Indian Wedding Sarees',
    secondaryEntities: ['Banarasi wedding sarees', 'Kanjivaram wedding sarees', 'Kanchipuram silk wedding sarees', 'Bridal wedding sarees'],
    intent: 'wedding',
    relatedCollections: [
      { label: 'All Sarees', path: '/sarees' },
      { label: 'Bridal Lehengas', path: '/collections/bridal-lehengas' },
      { label: 'Wedding Guest Outfits', path: '/collections/wedding-guest-outfits' },
      { label: 'Mehendi Outfits', path: '/collections/mehendi-outfits' },
    ],
    aiSearchQuestions: [
      'Where can I buy wedding sarees online?',
      'What saree should I wear for an Indian wedding ceremony?',
      'What is the difference between Banarasi and Kanjivaram wedding sarees?',
    ],
  },
  '/collections/reception-outfits': {
    path: '/collections/reception-outfits',
    title: 'Reception Outfits Online | Indian Wedding Reception Dresses - LuxeMia',
    description: 'Shop reception outfits online at LuxeMia. Explore reception lehengas, sarees, gowns, Indo-western outfits, cocktail looks, and Indian party wear.',
    canonical: `${SITE_URL}/collections/reception-outfits`,
    ogImage: `${SITE_URL}/og/og-lehengas.jpg`,
    h1: 'Reception Outfits for Indian Weddings',
    semanticTitle: 'Indian reception outfits, reception lehengas, reception sarees, gowns, and Indo-western cocktail outfits',
    primaryEntity: 'Indian Reception Outfits',
    secondaryEntities: ['Reception lehengas', 'Reception sarees', 'Reception gowns', 'Indo-western reception outfits', 'Cocktail reception outfits'],
    intent: 'reception',
    relatedCollections: [
      { label: 'Wedding Guest Outfits', path: '/collections/wedding-guest-outfits' },
      { label: 'Reception Lehengas', path: '/lehengas' },
      { label: 'Reception Sarees', path: '/sarees' },
      { label: 'Indo-Western', path: '/indowestern' },
    ],
    aiSearchQuestions: [
      'What should I wear to an Indian wedding reception?',
      'Where can I buy reception lehengas and sarees online?',
      'Are Indo-western outfits appropriate for Indian wedding receptions?',
    ],
  },
  '/collections/party-wear-lehengas': {
    path: '/collections/party-wear-lehengas',
    title: 'Party Wear Lehengas Online | Indian Party Lehenga Choli - LuxeMia',
    description: 'Shop party wear lehengas online at LuxeMia. Explore Indian party lehengas, cocktail lehengas, sangeet lehengas, reception party lehengas, and wedding guest lehengas.',
    canonical: `${SITE_URL}/collections/party-wear-lehengas`,
    ogImage: `${SITE_URL}/og/og-lehengas.jpg`,
    h1: 'Party Wear Lehengas for Indian Events',
    semanticTitle: 'Party wear lehengas, Indian party lehengas, cocktail lehengas, sangeet lehengas, and wedding guest lehengas',
    primaryEntity: 'Party Wear Lehengas',
    secondaryEntities: ['Party wear lehenga choli', 'Indian party lehengas', 'Cocktail lehengas', 'Sangeet lehengas', 'Reception party lehengas', 'Wedding guest lehengas'],
    intent: 'party',
    relatedCollections: [
      { label: 'All Lehengas', path: '/lehengas' },
      { label: 'Reception Outfits', path: '/collections/reception-outfits' },
      { label: 'Wedding Guest Outfits', path: '/collections/wedding-guest-outfits' },
      { label: 'Diwali Outfits', path: '/collections/diwali-outfits' },
    ],
    aiSearchQuestions: [
      'Where can I buy party wear lehengas online?',
      'Can I wear a party wear lehenga to a sangeet or reception?',
      'What is the difference between bridal lehengas and party wear lehengas?',
    ],
  },
  '/collections/designer-sarees': {
    path: '/collections/designer-sarees',
    title: 'Designer Sarees Online | Indian Designer Sarees - LuxeMia',
    description: 'Shop designer sarees online at LuxeMia. Explore Indian designer sarees, party wear designer sarees, wedding guest sarees, festive sarees, and boutique sarees.',
    canonical: `${SITE_URL}/collections/designer-sarees`,
    ogImage: `${SITE_URL}/og/og-sarees.jpg`,
    h1: 'Designer Sarees',
    semanticTitle: 'Designer sarees, Indian designer sarees online, party wear designer sarees, wedding guest sarees, and festive designer sarees',
    primaryEntity: 'Designer Sarees',
    secondaryEntities: ['Indian designer sarees', 'Party wear designer sarees', 'Wedding guest sarees', 'Festive designer sarees', 'Embroidered sarees', 'Silk sarees', 'Georgette sarees', 'Chiffon sarees', 'Boutique sarees'],
    intent: 'designer',
    relatedCollections: [
      { label: 'All Sarees', path: '/sarees' },
      { label: 'Wedding Sarees', path: '/collections/wedding-sarees' },
      { label: 'Reception Outfits', path: '/collections/reception-outfits' },
      { label: 'Wedding Guest Outfits', path: '/collections/wedding-guest-outfits' },
    ],
    aiSearchQuestions: [
      'Where can I buy designer sarees online?',
      'Which designer sarees are best for parties and weddings?',
      'What fabrics should I choose for designer sarees?',
    ],
  },
  '/collections/silk-sarees': {
    path: '/collections/silk-sarees',
    title: 'Silk Sarees Online | Banarasi & Kanchipuram Silk Sarees - LuxeMia',
    description: 'Shop silk sarees online at LuxeMia. Explore Banarasi silk sarees, Kanjivaram and Kanchipuram silk sarees, tissue silk, pattu sarees, and wedding silk sarees.',
    canonical: `${SITE_URL}/collections/silk-sarees`,
    ogImage: `${SITE_URL}/og/og-sarees.jpg`,
    h1: 'Silk Sarees',
    semanticTitle: 'Silk sarees, Banarasi silk sarees, Kanjivaram silk sarees, Kanchipuram silk sarees, tissue silk sarees, and wedding silk sarees',
    primaryEntity: 'Silk Sarees',
    secondaryEntities: ['Banarasi silk sarees', 'Kanjivaram silk sarees', 'Kanchipuram silk sarees', 'Tissue silk sarees', 'Pattu sarees', 'Zari silk sarees', 'Wedding silk sarees', 'Soft silk sarees'],
    intent: 'silk',
    relatedCollections: [
      { label: 'All Sarees', path: '/sarees' },
      { label: 'Wedding Sarees', path: '/collections/wedding-sarees' },
      { label: 'Designer Sarees', path: '/collections/designer-sarees' },
      { label: 'Wedding Guest Outfits', path: '/collections/wedding-guest-outfits' },
    ],
    aiSearchQuestions: [
      'Where can I buy silk sarees online?',
      'Which silk sarees are best for Indian weddings?',
      'What is the difference between Banarasi and Kanjivaram silk sarees?',
    ],
  },
  '/collections/pakistani-suits': {
    path: '/collections/pakistani-suits',
    title: 'Pakistani Suits Online | Pakistani Salwar Suits - LuxeMia',
    description: 'Shop Pakistani suits online at LuxeMia. Explore Pakistani salwar suits, designer suits, lawn suits, wedding suits, Eid suits, anarkali suits, and palazzo suits.',
    canonical: `${SITE_URL}/collections/pakistani-suits`,
    ogImage: `${SITE_URL}/og/og-suits.jpg`,
    h1: 'Pakistani Suits',
    semanticTitle: 'Pakistani suits, Pakistani salwar suits, designer suits, lawn suits, wedding suits, Eid suits, anarkali suits, and palazzo suits',
    primaryEntity: 'Pakistani Suits',
    secondaryEntities: ['Pakistani salwar suits', 'Pakistani designer suits', 'Pakistani lawn suits', 'Pakistani wedding suits', 'Eid Pakistani suits', 'Pakistani party wear suits', 'Pakistani anarkali suits', 'Pakistani palazzo suits', 'Pakistani suits online USA'],
    intent: 'category',
    relatedCollections: [
      { label: 'All Suits', path: '/suits' },
      { label: 'Eid Outfits', path: '/collections/eid-outfits' },
      { label: 'Wedding Guest Outfits', path: '/collections/wedding-guest-outfits' },
      { label: 'Reception Outfits', path: '/collections/reception-outfits' },
      { label: 'Mehendi Outfits', path: '/collections/mehendi-outfits' },
    ],
    aiSearchQuestions: [
      'Where can I buy Pakistani suits online in the USA?',
      'What is the difference between Pakistani suits and regular salwar kameez?',
      'Which Pakistani suits are best for Eid, weddings, and parties?',
    ],
  },
  '/collections/anarkali-suits': {
    path: '/collections/anarkali-suits',
    title: 'Anarkali Suits Online | Designer Anarkali Suits - LuxeMia',
    description: 'Shop Anarkali suits online at LuxeMia. Explore designer Anarkali suits, wedding Anarkali suits, party wear Anarkali suits, floor length styles, and embroidered festive suits.',
    canonical: `${SITE_URL}/collections/anarkali-suits`,
    ogImage: `${SITE_URL}/og/og-suits.jpg`,
    h1: 'Anarkali Suits',
    semanticTitle: 'Anarkali suits, designer Anarkali suits, wedding Anarkali suits, party wear Anarkali suits, floor length Anarkali suits, and embroidered festive Anarkali suits',
    primaryEntity: 'Anarkali Suits',
    secondaryEntities: ['Designer Anarkali suits', 'Wedding Anarkali suits', 'Party wear Anarkali suits', 'Indian Anarkali suits online', 'Floor length Anarkali suits', 'Embroidered Anarkali suits', 'Festive Anarkali suits'],
    intent: 'category',
    relatedCollections: [
      { label: 'All Suits', path: '/suits' },
      { label: 'Pakistani Suits', path: '/collections/pakistani-suits' },
      { label: 'Wedding Guest Outfits', path: '/collections/wedding-guest-outfits' },
      { label: 'Reception Outfits', path: '/collections/reception-outfits' },
      { label: 'Eid Outfits', path: '/collections/eid-outfits' },
    ],
    aiSearchQuestions: [
      'Where can I buy Anarkali suits online?',
      'Are Anarkali suits good for weddings and parties?',
      'How do I choose between floor length and regular Anarkali suits?',
    ],
  },
  '/lehengas': {
    path: '/lehengas',
    title: 'Buy Bridal Lehengas Online | Wedding & Festive Lehenga Choli - LuxeMia',
    description: 'Buy bridal lehengas online at LuxeMia. Shop wedding lehenga choli, festive lehengas & party wear in silk, net & velvet. Custom sizing available. Free shipping to USA & Canada.',
    canonical: `${SITE_URL}/lehengas`,
    ogImage: `${SITE_URL}/og/og-lehengas.jpg`,
    h1: 'Shop Bridal Lehengas Online',
    semanticTitle: 'Bridal lehengas, wedding lehenga choli, and festive lehengas online',
    primaryEntity: 'Bridal Lehengas',
    secondaryEntities: ['Wedding lehenga choli', 'Festive lehengas', 'Party wear lehengas', 'Custom sizing'],
    intent: 'bridal',
    relatedCollections: [
      { label: 'Wedding Guest Outfits', path: '/collections/wedding-guest-outfits' },
      { label: 'Sarees', path: '/sarees' },
      { label: 'Mehendi Outfits', path: '/collections/mehendi-outfits' },
      { label: 'Menswear', path: '/menswear' },
    ],
    aiSearchQuestions: [
      'Where can I buy bridal lehengas online?',
      'What lehenga should I wear for an Indian wedding?',
      'Does LuxeMia offer custom sizing for lehengas?',
    ],
  },
  '/sarees': {
    path: '/sarees',
    title: 'Buy Sarees Online | Indian Silk, Banarasi & Designer Sarees - LuxeMia',
    description: 'Buy Indian sarees online at LuxeMia. Shop Banarasi silk sarees, Kanchipuram sarees, georgette, chiffon, tissue, and designer sarees.',
    canonical: `${SITE_URL}/sarees`,
    ogImage: `${SITE_URL}/og/og-sarees.jpg`,
    h1: 'Sarees',
    semanticTitle: 'Indian silk, Banarasi, Kanchipuram, georgette, chiffon, and designer sarees online',
    primaryEntity: 'Indian Sarees',
    secondaryEntities: ['Banarasi silk sarees', 'Kanchipuram sarees', 'Georgette sarees', 'Designer sarees'],
    intent: 'category',
    relatedCollections: [
      { label: 'Lehengas', path: '/lehengas' },
      { label: 'Wedding Sarees', path: '/collections/wedding-sarees' },
      { label: 'Wedding Guest Outfits', path: '/collections/wedding-guest-outfits' },
      { label: 'Diwali Outfits', path: '/collections/diwali-outfits' },
      { label: 'Salwar Kameez', path: '/suits' },
    ],
    aiSearchQuestions: [
      'Where can I buy Indian sarees online?',
      'What saree should I choose for different occasions?',
      'Does LuxeMia ship sarees to the USA, Canada, and Australia?',
    ],
  },
  '/suits': {
    path: '/suits',
    title: 'Buy Salwar Kameez Online | Anarkali, Palazzo & Sharara Suits - LuxeMia',
    description: 'Buy salwar kameez online at LuxeMia. Shop anarkali suits, palazzo sets, sharara suits & Pakistani suits. Free worldwide shipping to USA, Canada & Australia.',
    canonical: `${SITE_URL}/suits`,
    ogImage: `${SITE_URL}/og/og-suits.jpg`,
    h1: 'Salwar Kameez',
    semanticTitle: 'Salwar kameez, anarkali suits, palazzo sets, and sharara suits online',
    primaryEntity: 'Salwar Kameez',
    secondaryEntities: ['Anarkali suits', 'Palazzo suits', 'Sharara suits', 'Pakistani suits'],
    intent: 'category',
    relatedCollections: [
      { label: 'Sarees', path: '/sarees' },
      { label: 'Wedding Guest Outfits', path: '/collections/wedding-guest-outfits' },
      { label: 'Eid Outfits', path: '/collections/eid-outfits' },
      { label: 'Mehendi Outfits', path: '/collections/mehendi-outfits' },
    ],
    aiSearchQuestions: [
      'Where can I buy salwar kameez online?',
      'What is the difference between anarkali, palazzo, and sharara suits?',
      'Which Indian suits work best for weddings and festivals?',
    ],
  },
  '/menswear': {
    path: '/menswear',
    title: 'Buy Sherwani Online | Indian Ethnic Wear for Men - Groom & Wedding - LuxeMia',
    description: 'Buy Indian ethnic wear for men online at LuxeMia. Shop groom sherwanis, kurta pajama sets, velvet sherwanis & Nehru jackets. Custom sizing available. Free shipping worldwide.',
    canonical: `${SITE_URL}/menswear`,
    ogImage: `${SITE_URL}/og/og-menswear.jpg`,
    h1: 'Menswear',
    semanticTitle: 'Sherwanis, kurta pajama sets, and Indian ethnic wear for men',
    primaryEntity: 'Indian Menswear',
    secondaryEntities: ['Sherwani', 'Groom sherwani', 'Kurta pajama', 'Nehru jackets'],
    intent: 'menswear',
    relatedCollections: [
      { label: 'Bridal Lehengas', path: '/collections/bridal-lehengas' },
      { label: 'Wedding Guest Outfits', path: '/collections/wedding-guest-outfits' },
      { label: 'Sarees', path: '/sarees' },
      { label: 'All Collections', path: '/collections' },
    ],
    aiSearchQuestions: [
      'Where can I buy sherwani online?',
      'What should men wear to an Indian wedding?',
      'Does LuxeMia offer Indian ethnic wear for grooms?',
    ],
  },
  '/collections/wedding-guest-outfits': {
    path: '/collections/wedding-guest-outfits',
    title: 'Indian Wedding Guest Outfits — What to Wear to an Indian Wedding | LuxeMia',
    description: 'Shop Indian wedding guest outfits at LuxeMia. Sarees, anarkali suits, lehengas & salwar kameez perfect for Indian weddings. Free shipping to USA, Canada & Australia.',
    canonical: `${SITE_URL}/collections/wedding-guest-outfits`,
    h1: 'Indian Wedding Guest Outfits',
    semanticTitle: 'Indian wedding guest outfits for ceremonies, receptions, and family events',
    primaryEntity: 'Indian Wedding Guest Outfits',
    secondaryEntities: ['Wedding sarees', 'Anarkali suits', 'Lehengas', 'Salwar kameez'],
    intent: 'wedding-guest',
    relatedCollections: [
      { label: 'Bridal Lehengas', path: '/collections/bridal-lehengas' },
      { label: 'Silk Sarees', path: '/sarees' },
      { label: 'Anarkali Suits', path: '/suits' },
      { label: 'Mehendi Outfits', path: '/collections/mehendi-outfits' },
    ],
    aiSearchQuestions: [
      'What should I wear as a guest to an Indian wedding?',
      'Can wedding guests wear lehengas or sarees?',
      'What colors work best for Indian wedding guest outfits?',
    ],
  },
  '/collections/diwali-outfits': {
    path: '/collections/diwali-outfits',
    title: 'Diwali Outfits for Women 2026 — Indian Ethnic Wear for Diwali | LuxeMia',
    description: 'Shop Diwali outfits for women at LuxeMia. Lehengas, anarkali suits, sarees & salwar kameez in gold, red & festive colors. Free shipping to USA, Canada & Australia.',
    canonical: `${SITE_URL}/collections/diwali-outfits`,
    h1: 'Diwali Outfits 2026',
    semanticTitle: 'Diwali outfits for women, festive Indian ethnic wear, and celebration looks',
    primaryEntity: 'Diwali Outfits',
    secondaryEntities: ['Festive sarees', 'Anarkali suits', 'Lehengas', 'Gold and red outfits'],
    intent: 'festival',
    relatedCollections: [
      { label: 'Sarees', path: '/sarees' },
      { label: 'Salwar Kameez', path: '/suits' },
      { label: 'Eid Outfits', path: '/collections/eid-outfits' },
      { label: 'Navratri Outfits', path: '/collections/navratri-outfits' },
    ],
    aiSearchQuestions: [
      'What should women wear for Diwali?',
      'What colors are best for Diwali outfits?',
      'Where can I buy Diwali outfits online?',
    ],
  },
  '/collections/mehendi-outfits': {
    path: '/collections/mehendi-outfits',
    title: 'Mehendi Ceremony Outfits — Yellow, Green & Festive Indian Ethnic Wear | LuxeMia',
    description: 'Shop mehendi ceremony outfits at LuxeMia. Yellow & green lehengas, anarkali suits & salwar kameez for mehendi functions. Free shipping to USA, Canada & Australia.',
    canonical: `${SITE_URL}/collections/mehendi-outfits`,
    h1: 'Mehendi Ceremony Outfits',
    semanticTitle: 'Mehendi ceremony outfits in yellow, green, lehengas, and anarkali suits',
    primaryEntity: 'Mehendi Ceremony Outfits',
    secondaryEntities: ['Yellow lehengas', 'Green salwar kameez', 'Anarkali suits', 'Wedding ceremony outfits'],
    intent: 'ceremony',
    relatedCollections: [
      { label: 'Wedding Guest Outfits', path: '/collections/wedding-guest-outfits' },
      { label: 'Bridal Lehengas', path: '/collections/bridal-lehengas' },
      { label: 'Salwar Kameez', path: '/suits' },
      { label: 'Diwali Outfits', path: '/collections/diwali-outfits' },
    ],
    aiSearchQuestions: [
      'What should I wear to a Mehendi ceremony?',
      'Are yellow and green outfits good for Mehendi?',
      'What is the best Indian outfit for a Mehendi function?',
    ],
  },
  '/collections/eid-outfits': {
    path: '/collections/eid-outfits',
    title: 'Eid Outfits 2026 — Indian Ethnic Wear for Eid | LuxeMia',
    description: 'Shop Eid outfits 2026 at LuxeMia. Chikankari suits, sharara sets, anarkali & lehengas in pastel & white for Eid celebrations. Free shipping to USA, Canada & Australia.',
    canonical: `${SITE_URL}/collections/eid-outfits`,
    h1: 'Eid Outfits 2026',
    semanticTitle: 'Eid outfits, chikankari suits, sharara sets, and elegant festive wear',
    primaryEntity: 'Eid Outfits',
    secondaryEntities: ['Chikankari suits', 'Sharara sets', 'Anarkali suits', 'Pastel outfits'],
    intent: 'festival',
    relatedCollections: [
      { label: 'Salwar Kameez', path: '/suits' },
      { label: 'Lehengas', path: '/lehengas' },
      { label: 'Diwali Outfits', path: '/collections/diwali-outfits' },
      { label: 'Wedding Guest Outfits', path: '/collections/wedding-guest-outfits' },
    ],
    aiSearchQuestions: [
      'What should I wear for Eid?',
      'Are chikankari suits appropriate for Eid?',
      'Where can I buy Eid outfits online?',
    ],
  },
  '/collections/navratri-outfits': {
    path: '/collections/navratri-outfits',
    title: 'Navratri Outfits 2026 — Chaniya Choli & Garba Dress Collection | LuxeMia',
    description: 'Shop Navratri outfits 2026 at LuxeMia. Chaniya choli, garba lehengas & festive Indian ethnic wear in all nine Navratri colours. Free shipping to USA, Canada & Australia.',
    canonical: `${SITE_URL}/collections/navratri-outfits`,
    h1: 'Navratri Outfits — Chaniya Choli & Garba Dress Collection',
    semanticTitle: 'Navratri outfits, chaniya choli, Garba dresses, and festive lehengas',
    primaryEntity: 'Navratri Outfits',
    secondaryEntities: ['Chaniya choli', 'Garba dress', 'Festive lehengas', 'Navratri colours'],
    intent: 'festival',
    relatedCollections: [
      { label: 'Lehengas', path: '/lehengas' },
      { label: 'Salwar Kameez', path: '/suits' },
      { label: 'Diwali Outfits', path: '/collections/diwali-outfits' },
      { label: 'Eid Outfits', path: '/collections/eid-outfits' },
    ],
    aiSearchQuestions: [
      'What should I wear for Navratri and Garba?',
      'What is the difference between chaniya choli and lehenga?',
      'Where can I buy Navratri outfits online?',
    ],
  },
};

export const COLLECTION_SEO_PATHS = Object.keys(COLLECTION_SEO_CONFIG) as CollectionRoutePath[];

export function isCollectionSeoPath(pathname: string): pathname is CollectionRoutePath {
  return Object.prototype.hasOwnProperty.call(COLLECTION_SEO_CONFIG, pathname);
}

export function getCollectionSeoConfig(pathname: string): CollectionSeoConfig | null {
  return isCollectionSeoPath(pathname) ? COLLECTION_SEO_CONFIG[pathname] : null;
}
