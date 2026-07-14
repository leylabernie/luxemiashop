/**
 * LuxeMia Blog Category Groups — Utsavpedia-style topical taxonomy
 *
 * Organizes all blog posts into 8 top-level content categories that cover
 * the full universe of Indian ethnic fashion. Each category has its own
 * index page at /blog/{slug} (e.g., /blog/attires, /blog/motifs-embroideries).
 *
 * Inspired by Utsavpedia.com (Utsav Fashion's content hub) which uses 6
 * categories: attires, cultural-connections, ethnicalley, fashion-cults,
 * motifs-embroideries, weddings-festivals. LuxeMia adds 2 more (how-to-care,
 * nri-shopping) to serve the NRI diaspora audience that Utsavpedia doesn't target.
 *
 * Used by:
 * - src/pages/BlogCategory.tsx (category index pages)
 * - src/App.tsx (8 routes: /blog/attires, /blog/cultural-connections, etc.)
 * - scripts/prerender.js (prerendered category HTML for Googlebot)
 * - middleware.ts (SPA meta injection for non-bot visitors)
 */

export interface BlogCategoryGroup {
  slug: string;
  name: string;
  shortDescription: string;  // for nav cards + meta description
  longDescription: string;   // for category index page H1 + intro paragraph
  icon: string;              // lucide-react icon name
  metaTitle: string;
  metaDescription: string;
}

export const BLOG_CATEGORY_GROUPS: BlogCategoryGroup[] = [
  {
    slug: 'attires',
    name: 'Attires',
    shortDescription: 'Encyclopedia of Indian ethnic clothing — lehengas, sarees, suits, sherwanis & jewelry',
    longDescription: 'Explore the complete encyclopedia of Indian ethnic attires. From the regal bridal lehenga to the timeless Banarasi saree, from sharara suits to designer sherwanis — each garment has a history, a regional tradition, and a specific ceremony it belongs to. Our attires guides cover fabric choices, silhouette comparisons, color theory for skin tones, budget allocation, and styling for every body type. Whether you are a bride choosing between lehenga and saree, a groom selecting a sherwani, or a guest deciding between anarkali and palazzo, this is your definitive reference.',
    icon: 'Shirt',
    metaTitle: 'Indian Ethnic Attires — Lehengas, Sarees, Suits & Sherwanis Guide | LuxeMia',
    metaDescription: 'Encyclopedia of Indian ethnic clothing — bridal lehengas, silk sarees, anarkali suits, sharara sets, sherwanis & jewelry. Fabric, fit, color, and styling guides for every attire.',
  },
  {
    slug: 'cultural-connections',
    name: 'Cultural Connections',
    shortDescription: 'Cultural significance of Indian ethnic wear — bindi, sindoor, mangalsutra, colors & symbolism',
    longDescription: 'Discover the deep cultural significance behind Indian ethnic wear. Every garment, color, and accessory carries meaning — the red of a bridal lehenga symbolizes prosperity, the bindi marks the ajna chakra, sindoor signals married status, and the mangalsutra is a sacred bond. Our Cultural Connections guides explore the symbolism, rituals, and regional traditions that give Indian ethnic fashion its soul. Understand why South Indian brides wear yellow on the muhurtham, why Bengali brides wear red and white, and why Marwari weddings feature specific gota-patti embroidery.',
    icon: 'Sparkles',
    metaTitle: 'Cultural Significance of Indian Ethnic Wear — Symbolism & Traditions | LuxeMia',
    metaDescription: 'Explore the cultural meaning behind Indian ethnic wear — bindi, sindoor, mangalsutra, bridal colors, regional wedding rituals, and the symbolism of embroidery motifs.',
  },
  {
    slug: 'ethnicalley',
    name: 'Ethnicalley',
    shortDescription: 'Indian wedding ceremonies & traditions — mehendi, haldi, sangeet, reception & festival dress codes',
    longDescription: 'Step into the ethnicalley of Indian celebrations. Every Indian wedding is a multi-day affair with distinct ceremonies — mehendi, haldi, sangeet, pheras, vidaai, reception — each with its own dress code, color palette, and styling conventions. Our ethnicalley guides walk you through what to wear to each ceremony, the difference between Haldi and Mehendi outfits, how to dress for a South Indian muhurtham vs a Punjabi sangeet, and how NRI women can celebrate Diwali, Navratri, and Eid with authentic ethnic style.',
    icon: 'Compass',
    metaTitle: 'Indian Wedding Ceremonies & Festival Dress Codes — Mehendi to Reception | LuxeMia',
    metaDescription: 'Complete dress code guides for every Indian wedding ceremony — mehendi, haldi, sangeet, pheras, reception. Plus festival outfits for Diwali, Navratri, and Eid.',
  },
  {
    slug: 'fashion-cults',
    name: 'Fashion Cults',
    shortDescription: 'Designer profiles — Sabyasachi, Manish Malhotra, JJ Valaya & the icons of Indian ethnic fashion',
    longDescription: 'Meet the designers who shaped modern Indian ethnic fashion. From Sabyasachi Mukherjee\'s revival of handloom textiles to Manish Malhotra\'s Bollywood bridal aesthetic, from JJ Valaya\'s royal couture to Anita Dongre\'s sustainable luxury — each designer has defined a movement. Our Fashion Cults profiles trace their journeys, signature styles, iconic bridal collections, and the cultural moments that made them. Discover which designer\'s aesthetic matches your wedding vision, and how to shop their looks (or affordable interpretations) for your own celebration.',
    icon: 'Crown',
    metaTitle: 'Indian Ethnic Fashion Designers — Sabyasachi, Manish Malhotra & More | LuxeMia',
    metaDescription: 'Profiles of India\'s top ethnic fashion designers — Sabyasachi, Manish Malhotra, JJ Valaya, Anita Dongre. Their signature styles, iconic collections, and how to shop their looks.',
  },
  {
    slug: 'motifs-embroideries',
    name: 'Motifs & Embroideries',
    shortDescription: 'Textile techniques — zari, chikankari, zardozi, Banarasi weave, Kanchipuram silk & fabric guides',
    longDescription: 'Decode the artistry of Indian textiles. The motifs and embroideries on Indian ethnic wear are centuries-old techniques, each with a regional origin and a specific method. Zari is real gold-wrapped thread from Varanasi, chikankari is white shadow-work from Lucknow, zardozi is metallic embroidery once reserved for Mughal royalty, Kanchipuram silk is handwoven on jacquard looms in Tamil Nadu, and Banarasi brocade carries a GI tag protecting its authenticity. Our Motifs & Embroideries guides explain the history, the authentication, the price differences, and how to care for each textile so it lasts generations.',
    icon: 'Palette',
    metaTitle: 'Indian Embroidery & Textile Guide — Zari, Chikankari, Banarasi & Kanchipuram | LuxeMia',
    metaDescription: 'Complete guide to Indian textile techniques — zari work, chikankari, zardozi, Banarasi silk, Kanchipuram silk, georgette, chiffon. Authentication, pricing, and care.',
  },
  {
    slug: 'weddings-festivals',
    name: 'Weddings & Festivals',
    shortDescription: 'Indian wedding guest outfits, regional wedding traditions & festival styling',
    longDescription: 'Your complete guide to dressing for Indian weddings and festivals. Whether you are a guest at a multi-day Indian wedding, a bridesmaid choosing a cohesive look, a mother of the bride selecting an elegant saree, or an NRI family celebrating Diwali abroad — our Weddings & Festivals guides cover every scenario. Learn the difference between a Punjabi wedding and a Tamil wedding, what men should wear to each ceremony, how to dress for a South Asian wedding as a non-Indian guest, and the latest 2026 wedding fashion trends.',
    icon: 'Heart',
    metaTitle: 'Indian Wedding Guest Outfits & Festival Styling Guide | LuxeMia',
    metaDescription: 'What to wear to an Indian wedding — guest dress codes, bridesmaid outfits, mother of bride sarees, men\'s wedding attire, and festival styling for Diwali, Navratri & Eid.',
  },
  {
    slug: 'how-to-care',
    name: 'How-To & Care',
    shortDescription: 'Saree draping, fabric care, measuring, custom tailoring & garment maintenance',
    longDescription: 'Master the practical skills of Indian ethnic wear. Learn how to drape a saree in 7 different styles (Nivi, Bengali, Gujarati, Maharashtrian, and more), how to measure yourself for a perfect lehenga fit, how to care for silk sarees so they last generations, how to store embroidered lehengas, and the difference between unstitched, ready-to-wear, and made-to-measure options. Our How-To & Care guides are written by professional tailors and stylists with step-by-step photos and video references.',
    icon: 'GraduationCap',
    metaTitle: 'How to Drape Saree, Care for Silk & Measure for Indian Ethnic Wear | LuxeMia',
    metaDescription: 'Step-by-step guides for saree draping, fabric care, measuring for lehengas, custom tailoring, and storing Indian ethnic wear. Practical skills for every ethnic wardrobe.',
  },
  {
    slug: 'nri-shopping',
    name: 'NRI Shopping',
    shortDescription: 'Buying Indian ethnic wear from USA, Canada & Australia — shipping, customs, sizing & authenticity',
    longDescription: 'The definitive guide for the NRI diaspora shopping for Indian ethnic wear from abroad. Buying a bridal lehenga from Philadelphia, a wedding saree from Toronto, or a sherwani from Sydney comes with specific challenges — sizing conversion, customs duties, shipping times, authenticity verification, and return policies. Our NRI Shopping guides answer every practical question: how to convert Indian bust sizes to US sizes, what the duty-free limits are for USA/Canada/Australia, how to verify a Banarasi saree is handwoven vs. machine-made, and which online stores ship reliably to your country.',
    icon: 'Globe',
    metaTitle: 'NRI Guide: Buy Indian Ethnic Wear Online from USA, Canada & Australia | LuxeMia',
    metaDescription: 'Complete NRI shopping guide for Indian ethnic wear — sizing conversion, customs duties, shipping times, authenticity checks, and trusted online stores for USA, Canada & Australia.',
  },
];

/**
 * Map of blog post slug → primary category group slug.
 * Each post is assigned to exactly ONE primary category for clean URL hierarchy.
 * Posts can still be cross-referenced via tags and internal links.
 *
 * Total: 62 posts across 8 categories (as of July 2026).
 */
export const BLOG_POST_CATEGORY_MAP: Record<string, string> = {
  // ─── Attires (19 posts) — clothing types, comparisons, styling ────────────
  'indian-wedding-dress-complete-guide': 'attires',
  'red-bridal-lehenga-trends-2026': 'attires',
  'designer-wedding-dress-under-500': 'attires',
  'lehenga-color-for-dark-skin': 'attires',
  'wedding-saree-for-mother-of-bride': 'attires',
  'accessorize-indian-ethnic-wear': 'attires',
  'sharara-suit-guide-2026-styles-fabrics': 'attires',
  'pakistani-suits-anarkali-shopping-guide': 'attires',
  'lehenga-vs-anarkali-which-is-right-for-you': 'attires',
  'how-to-choose-perfect-lehenga-wedding-2026': 'attires',
  'lehenga-vs-sharara-vs-anarkali-comparison': 'attires',
  'best-lehenga-colors-for-indian-skin-tone': 'attires',
  'anarkali-suit-styling-guide-2026': 'attires',
  'buy-bridal-lehenga-online-usa-complete-guide': 'attires',
  'designer-sherwani-online-usa-groom-guide': 'attires',
  'salwar-kameez-online-usa-everyday-ethnic-guide': 'attires',
  'indian-bridal-jewelry-sets-complete-guide': 'attires',
  'lehenga-choli-designer-bridal-party-wear-guide': 'attires',
  'best-lehenga-styles-indian-wedding-guests-usa-2026': 'attires',

  // ─── Cultural Connections (5 posts) — symbolism & traditions ──────────────
  'why-indian-brides-wear-red-cultural-significance': 'cultural-connections',
  'bindi-meaning-history-indian-women': 'cultural-connections',
  'sindoor-mangalsutra-sacred-symbols-hindu-marriage': 'cultural-connections',
  'regional-indian-wedding-rituals-punjabi-bengali-tamil-marwari': 'cultural-connections',
  'embroidery-motifs-symbolism-paisley-peacock-lotus': 'cultural-connections',

  // ─── Fashion Cults (5 posts) — designer profiles ──────────────────────────
  'sabyasachi-mukherjee-designer-profile-handloom-revival': 'fashion-cults',
  'manish-malhotra-bollywood-bridal-designer-profile': 'fashion-cults',
  'jj-valaya-royal-couture-house-of-valaya': 'fashion-cults',
  'anita-dongre-sustainable-luxury-grassroots': 'fashion-cults',
  'ritu-kumar-pioneer-indian-textile-revival': 'fashion-cults',

  // ─── Ethnicalley (3 posts) — ceremonies & traditions ──────────────────────
  'indian-wedding-season-2026-outfit-guide': 'ethnicalley',
  'indian-wedding-ceremony-outfit-guide': 'ethnicalley',
  'haldi-vs-mehendi-outfits-complete-guide': 'ethnicalley',

  // ─── Motifs & Embroideries (7 posts) — textile techniques ─────────────────
  'fabric-guide-indian-ethnic-wear-georgette-silk-chiffon': 'motifs-embroideries',
  'banarasi-silk-saree-guide-authentic': 'motifs-embroideries',
  'indian-fabric-types-guide-silk-georgette-chiffon': 'motifs-embroideries',
  'kanchipuram-silk-saree-south-indian-wedding-guide': 'motifs-embroideries',
  'zari-work-guide-indian-embroidery-gold-silver-thread': 'motifs-embroideries',
  'chikankari-embroidery-lucknow-guide': 'motifs-embroideries',
  'kanjivaram-vs-banarasi-silk-sarees': 'motifs-embroideries',

  // ─── Weddings & Festivals (8 posts) — guest outfits, regional weddings ────
  'wedding-guest-outfit-ideas': 'weddings-festivals',
  'indian-wedding-trends-2026': 'weddings-festivals',
  'style-lehenga-choli-every-wedding-event': 'weddings-festivals',
  'styling-indian-ethnic-wear-festive-occasions-abroad': 'weddings-festivals',
  'what-to-wear-indian-wedding-guest-2026': 'weddings-festivals',
  'what-to-wear-south-asian-wedding-non-indian-guest': 'weddings-festivals',
  'what-to-wear-indian-wedding-non-indian-guest': 'weddings-festivals',
  'diwali-outfit-ideas-nri-women-usa-canada-australia': 'weddings-festivals',
  'indian-wedding-guest-outfits-men-usa-guide': 'weddings-festivals',

  // ─── How-To & Care (10 posts) — draping, care, measuring, tailoring ──────
  'saree-draping-styles-every-occasion': 'how-to-care',
  'caring-for-silk-sarees': 'how-to-care',
  'how-to-measure-yourself-for-indian-ethnic-wear': 'how-to-care',
  'care-guide-washing-storing-indian-ethnic-wear': 'how-to-care',
  'unstitched-vs-ready-to-wear-vs-made-to-measure': 'how-to-care',
  'how-to-drape-saree-beginner-guide': 'how-to-care',
  'how-to-wear-a-saree-step-by-step': 'how-to-care',
  'how-to-choose-salwar-kameez-body-type': 'how-to-care',
  'custom-tailoring-indian-ethnic-wear-usa': 'how-to-care',
  'how-to-care-for-silk-sarees-and-lehengas': 'how-to-care',

  // ─── NRI Shopping (5 posts) — buying from abroad ─────────────────────────
  'nri-wedding-ethnic-wear-trends-2026': 'nri-shopping',
  'buy-authentic-indian-sarees-online-usa-uk': 'nri-shopping',
  'nri-guide-buying-indian-ethnic-wear-online-usa-uk-canada': 'nri-shopping',
  'shipping-indian-clothes-usa-uk-canada-nri-guide': 'nri-shopping',
  'buying-indian-ethnic-wear-online-usa': 'nri-shopping',
};

/** Get the BlogCategoryGroup for a given blog post slug. */
export function getBlogCategoryGroup(slug: string): BlogCategoryGroup | undefined {
  const groupSlug = BLOG_POST_CATEGORY_MAP[slug];
  if (!groupSlug) return undefined;
  return BLOG_CATEGORY_GROUPS.find(g => g.slug === groupSlug);
}

/** Get the BlogCategoryGroup by its slug. */
export function getBlogCategoryBySlug(slug: string): BlogCategoryGroup | undefined {
  return BLOG_CATEGORY_GROUPS.find(g => g.slug === slug);
}

/** Get all blog post slugs in a given category group. */
export function getPostSlugsByCategory(groupSlug: string): string[] {
  return Object.entries(BLOG_POST_CATEGORY_MAP)
    .filter(([, group]) => group === groupSlug)
    .map(([slug]) => slug);
}

/** Get post count for each category — used on /blog index page. */
export function getCategoryPostCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const group of BLOG_CATEGORY_GROUPS) {
    counts[group.slug] = getPostSlugsByCategory(group.slug).length;
  }
  return counts;
}
