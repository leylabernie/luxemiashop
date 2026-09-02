/**
 * LuxeMia blog topic hubs.
 *
 * Keep this taxonomy deliberately small: every hub must contain published,
 * buyer-relevant articles. Empty or aspirational hubs create thin pages and
 * inflate article counts, so new hubs should be added only when content exists.
 */
export interface BlogCategoryGroup {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  metaTitle: string;
  metaDescription: string;
}

export const BLOG_CATEGORY_GROUPS: BlogCategoryGroup[] = [
  {
    slug: 'indian-wedding-guest-attire',
    name: 'Outfit Guides',
    shortDescription: 'Compare sarees, lehengas, suits, menswear and accessories before you shop',
    longDescription: 'Use these practical outfit guides to compare silhouettes, occasion fit and styling choices. Then open the relevant LuxeMia collection and confirm the exact fabric or materials, included pieces, stitching status, size options and current availability on each product listing.',
    icon: 'Shirt',
    metaTitle: 'Indian Outfit Guides — Sarees, Lehengas, Suits & Menswear | LuxeMia',
    metaDescription: 'Compare Indian outfit silhouettes and styling choices, then shop current LuxeMia sarees, lehengas, suits, menswear and jewelry with tracked shipping to seven countries.',
  },
  {
    slug: 'indian-textiles-and-embroidery',
    name: 'Fabric Guides',
    shortDescription: 'Understand common ethnic-wear fabrics and what to verify on a product listing',
    longDescription: 'Learn how common fabrics differ in drape, weight and care. Because construction varies by item, use the guide for orientation and rely on the exact LuxeMia product listing for fabric, lining, work, included pieces and care details.',
    icon: 'Palette',
    metaTitle: 'Indian Ethnic-Wear Fabric Guides | LuxeMia',
    metaDescription: 'Compare georgette, silk, chiffon, net, velvet and cotton, then verify exact fabric and construction on each LuxeMia product listing.',
  },
  {
    slug: 'weddings-festivals',
    name: 'Weddings & Festivals',
    shortDescription: 'Choose occasionwear for Indian weddings, Diwali, Eid and celebrations abroad',
    longDescription: 'Plan outfits for wedding ceremonies, receptions and festivals celebrated outside India. These guides focus on useful outfit choices and link directly to relevant LuxeMia shopping categories.',
    icon: 'Heart',
    metaTitle: 'Indian Wedding Guest & Festival Outfit Guides | LuxeMia',
    metaDescription: 'Practical Indian wedding guest and festival outfit guides with direct links to current LuxeMia collections and tracked shipping to seven countries.',
  },
  {
    slug: 'fit-sizing-and-garment-care',
    name: 'Fit & How-To',
    shortDescription: 'Saree draping and fit guidance for shopping Indian ethnic wear online',
    longDescription: 'Use these practical guides to prepare measurements, understand fit preferences and learn a beginner saree drape. For an order, compare your measurements with the exact product and variant details before checkout.',
    icon: 'GraduationCap',
    metaTitle: 'Indian Ethnic-Wear Fit & Saree How-To Guides | LuxeMia',
    metaDescription: 'Use LuxeMia fit and saree how-to guides, then compare your measurements with exact product and variant details before ordering.',
  },
  {
    slug: 'designer-profiles',
    name: 'Designer Profiles',
    shortDescription: 'Source-based profiles of Indian designers and fashion houses',
    longDescription: 'Read concise profiles based on official histories and established industry sources. Brand-owned claims are attributed, unsupported milestones are omitted, and no profile implies that LuxeMia sells or is affiliated with the named designer.',
    icon: 'Crown',
    metaTitle: 'Fact-Checked Indian Fashion Designer Profiles | LuxeMia',
    metaDescription: 'Source-based profiles of Anamika Khanna, Tarun Tahiliani, Rahul Mishra and Sabyasachi, with citations and clear affiliation disclaimers.',
  },
  {
    slug: 'cultural-context',
    name: 'Cultural Context',
    shortDescription: 'Careful background on terms and practices without universalizing them',
    longDescription: 'These guides explain documented cultural context while recognizing differences among regions, religions, families and individuals. They do not turn one source or community practice into a universal rule.',
    icon: 'Globe',
    metaTitle: 'Indian Clothing and Cultural Context Guides | LuxeMia',
    metaDescription: 'Source-based cultural context for Indian clothing and adornment, written without presenting diverse practices as universal rules.',
  },
];

/** Every published article belongs to exactly one active hub. */
export const BLOG_POST_CATEGORY_MAP: Record<string, string> = {
  'what-should-a-male-guest-wear-to-a-three-day-indian-wedding': 'weddings-festivals',
  'what-should-a-non-indian-guest-wear-to-an-indian-wedding': 'weddings-festivals',
  'what-saree-fabrics-work-for-an-outdoor-summer-wedding': 'indian-textiles-and-embroidery',
  'saree-versus-lehenga-for-a-wedding-guest': 'indian-wedding-guest-attire',
  'sherwani-versus-kurta-set': 'indian-wedding-guest-attire',
  'what-should-guests-wear-to-a-mehendi': 'weddings-festivals',
  'what-should-guests-wear-to-a-sangeet': 'weddings-festivals',
  'ready-to-ship-versus-made-to-order': 'fit-sizing-and-garment-care',
  'what-does-semi-stitched-lehenga-mean': 'fit-sizing-and-garment-care',
  'how-to-measure-for-a-lehenga-ordered-online': 'fit-sizing-and-garment-care',
  'chaniya-choli-versus-lehenga': 'indian-wedding-guest-attire',
  'how-early-to-order-for-a-fixed-wedding-date': 'fit-sizing-and-garment-care',
  'wedding-saree-for-mother-of-bride': 'indian-wedding-guest-attire',
  'accessorize-indian-ethnic-wear': 'indian-wedding-guest-attire',
  'lehenga-vs-sharara-vs-anarkali-comparison': 'indian-wedding-guest-attire',
  'sherwani-vs-jodhpuri-vs-bandhgala-groom-guide': 'indian-wedding-guest-attire',
  'fabric-guide-indian-ethnic-wear-georgette-silk-chiffon': 'indian-textiles-and-embroidery',
  'wedding-guest-outfit-ideas': 'weddings-festivals',
  'styling-indian-ethnic-wear-festive-occasions-abroad': 'weddings-festivals',
  'how-to-drape-saree-beginner-guide': 'fit-sizing-and-garment-care',
  'how-to-choose-salwar-kameez-body-type': 'fit-sizing-and-garment-care',
  'indian-to-us-clothing-size-conversion-guide': 'fit-sizing-and-garment-care',
  'anamika-khanna-designer-profile-kolkata-couture': 'designer-profiles',
  'tarun-tahiliani-designer-profile-india-modern-couture': 'designer-profiles',
  'rahul-mishra-designer-profile-paris-haute-couture-sustainable': 'designer-profiles',
  'sabyasachi-mukherjee-designer-profile-handloom-revival': 'designer-profiles',
  'bindi-meaning-history-indian-women': 'cultural-context',
  'navratri-9-day-color-guide-2026': 'weddings-festivals',
  'custom-bridesmaid-wedding-guest-lehenga-online-usa': 'weddings-festivals',
  'custom-deep-neckline-elbow-sleeve-saree-blouse-online-usa': 'fit-sizing-and-garment-care',
  'plus-size-indian-ethnic-wear-guide': 'fit-sizing-and-garment-care',
  'manish-malhotra-bollywood-bridal-designer-profile': 'designer-profiles',
  'indian-wedding-terms-glossary-50-events-rituals-roles': 'cultural-context',
  'sharara-vs-gharara-difference': 'indian-wedding-guest-attire',
  'ready-to-ship-vs-made-to-order-indian-outfits': 'fit-sizing-and-garment-care',
  'does-a-saree-come-with-a-blouse': 'fit-sizing-and-garment-care',
  'how-should-a-sherwani-fit-measurement-checklist': 'fit-sizing-and-garment-care',
  'how-to-buy-a-bridal-lehenga-online-checklist': 'weddings-festivals',
};

export function getBlogCategoryGroup(slug: string): BlogCategoryGroup | undefined {
  const groupSlug = BLOG_POST_CATEGORY_MAP[slug];
  if (!groupSlug) return undefined;
  return BLOG_CATEGORY_GROUPS.find(group => group.slug === groupSlug);
}

export function getBlogCategoryBySlug(slug: string): BlogCategoryGroup | undefined {
  return BLOG_CATEGORY_GROUPS.find(group => group.slug === slug);
}

export function getPostSlugsByCategory(groupSlug: string): string[] {
  return Object.entries(BLOG_POST_CATEGORY_MAP)
    .filter(([, group]) => group === groupSlug)
    .map(([slug]) => slug);
}

export function getCategoryPostCounts(): Record<string, number> {
  return Object.fromEntries(
    BLOG_CATEGORY_GROUPS.map(group => [group.slug, getPostSlugsByCategory(group.slug).length])
  );
}
