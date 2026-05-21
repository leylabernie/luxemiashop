const SITE_URL = 'https://luxemia.shop';

export type CollectionIntent =
  | 'category'
  | 'bridal'
  | 'wedding'
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
