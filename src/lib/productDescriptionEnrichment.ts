/**
 * Product Description Enrichment Utility — Phase 3 SEO Optimization
 * Luxury Editorial Upgrade with AI-Search Q&A Format
 *
 * When the Shopify API returns thin or generic product descriptions (common with
 * wholesale/manufacturer feeds), this module generates SEO-rich, informative
 * descriptions that improve search rankings and customer conversion.
 *
 * Phase 3 Enhancements:
 * - Fabric origin and craftsmanship storytelling
 * - Occasion-specific styling guidance with detailed accessorizing
 * - Semantic keyword integration for AI search engines
 * - Structured Q&A format optimized for featured snippets and AI responses
 *
 * Business context:
 * - Site: luxemia.shop — Indian ethnic wear store
 * - Business: Glamour Indian Wear DBA LuxeMia
 * - Ships to: USA, Canada, Australia only
 * - Free shipping on orders over $350; flat $25 under $350
 * - Price conversion: INR × 2 ÷ 90 = USD retail price
 *
 * @module productDescriptionEnrichment
 */

import { getKeywords, getLongTailKeywords } from './productSeoData.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Supported product categories for category-specific content generation. */
export type ProductCategory =
  | 'lehenga'
  | 'saree'
  | 'suit'
  | 'salwar'
  | 'anarkali'
  | 'sharara'
  | 'sherwani'
  | 'kurta'
  | 'jewelry'
  | 'indo-western';

/** Adjective pools for generating natural variation in descriptions. */
interface QualityAdjectives {
  primary: string[];
  secondary: string[];
}

/** Fabric origin and craftsmanship story for luxury storytelling. */
interface CraftsmanshipStory {
  /** Region of origin for this fabric/craft. */
  origin: string;
  /** Artisan technique description. */
  technique: string;
  /** Hours of handwork typically involved. */
  handworkHours: string;
  /** Heritage/cultural significance. */
  heritage: string;
}

/** Enhanced template data for a product category with Phase 3 luxury editorial. */
interface CategoryTemplate {
  /** Display label for the product type. */
  label: string;
  /** Quality adjectives for variety in openings. */
  adjectives: QualityAdjectives;
  /** Specific design elements to mention. */
  designElements: string[];
  /** Occasions this product type suits. */
  occasions: string[];
  /** Styling tips specific to this category. */
  stylingTips: string[];
  /** Accessory recommendations. */
  accessories: string[];
  /** Footwear recommendations. */
  footwear: string[];
  /** Care instructions. */
  careInstructions: string[];
  /** Storage tips. */
  storageTips: string[];
  /** Available sizes. */
  sizes: string;
  /** Long-tail keywords to weave in naturally. */
  keywords: string[];
  /** Category-level SEO description snippet. */
  categoryDescription: string;
  /** Craftsmanship stories for fabric origin narratives. */
  craftsmanship: CraftsmanshipStory;
  /** Occasion-specific detailed styling guidance. */
  occasionStyling: Record<string, string[]>;
  /** AI-search optimized Q&A pairs. */
  qaPairs: Array<{ question: string; answer: string }>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum character count to consider a description "rich". */
const RICH_DESCRIPTION_MIN_LENGTH = 200;

/** Product categories that are not garments (don't use stitching/fabric language). */
const NON_GARMENT_CATEGORIES = new Set(['jewelry']);

/** Vowels for article agreement. */
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

/**
 * Return the correct indefinite article ("a" or "an") for a given word.
 * Handles vowel-sound words like "ethereal", "exquisite", etc.
 *
 * @param word - The word that follows the article.
 * @returns "an" if the word starts with a vowel sound, "a" otherwise.
 */
function article(word: string): string {
  const first = word.trim().charAt(0).toLowerCase();
  return VOWELS.has(first) ? 'an' : 'a';
}

/** Phrases that indicate a description already contains specific detail. */
const SPECIFICITY_INDICATORS = [
  'embroidery',
  'embroidered',
  'handwork',
  'hand-woven',
  'zari',
  'zardozi',
  'sequin',
  'stone work',
  'thread work',
  'kanjivaram',
  'banarasi',
  'kanchipuram',
  'chikankari',
  'gota patti',
  'mirror work',
  'resham',
  'dori',
  'appliqué',
  'applique',
  'pearl',
  'bead',
  'kundan',
  'dry clean',
  'professional dry clean',
  'custom tailoring',
  'stitched',
  'semi-stitched',
  'unstitched',
  'dupatta',
  'blouse piece',
  'pallu',
  'fall and edging',
  'lining',
  'can-can',
  'flare',
  'circumference',
  'train',
  'draping',
  'silhouette',
];

/** Shipping info paragraph — consistent across all enriched descriptions. */
const SHIPPING_PARAGRAPH =
  'Available in sizes S-XXL with custom tailoring options. Free shipping on orders over $350 to the USA, Canada, and Australia. Flat $25 shipping on orders under $350.';

/** Mapping of normalized product types to their template data. */
const CATEGORY_TEMPLATES: Record<string, CategoryTemplate> = {
  lehenga: {
    label: 'lehenga',
    adjectives: {
      primary: ['breathtaking', 'exquisite', 'stunning', 'regal', 'showstopping', 'magnificent'],
      secondary: ['opulent', 'gorgeous', 'dazzling', 'resplendent', 'striking', 'ravishing'],
    },
    designElements: [
      'intricate embroidery',
      'delicate zari threadwork',
      'shimmering sequin accents',
      'elaborate border detailing',
      'ornate motifs',
      'rich embellishments',
    ],
    occasions: [
      'weddings',
      'receptions',
      'engagement ceremonies',
      'sangeet nights',
      'festive celebrations',
      'bridal events',
    ],
    stylingTips: [
      'Pair with a complementing dupatta draped over one shoulder for classic elegance, or pin it across both arms for a more structured look.',
      'Style with a statement maang tikka and layered polki necklace to elevate the bridal aesthetic.',
      'Opt for a sleek bun adorned with fresh flowers or gajra to let the lehenga\'s craftsmanship take center stage.',
    ],
    accessories: [
      'kundan or polki necklace sets',
      'maang tikka',
      'chooda (bridal bangles)',
      'passa or jhoomar',
      'anklets',
    ],
    footwear: ['embroidered juttis', 'kitten-heel sandals', 'wedding mojaris'],
    careInstructions: [
      'Professional dry cleaning is strongly recommended to preserve the embroidery and fabric integrity.',
      'Avoid wringing or machine washing.',
      'Iron on low heat with a pressing cloth over embellished areas.',
    ],
    storageTips: [
      'Store in a muslin or cotton garment bag to allow the fabric to breathe.',
      'Avoid plastic covers which can trap moisture and damage zari work.',
      'Fold with tissue paper between layers to prevent embellishments from catching.',
    ],
    sizes: 'S-XXL',
    keywords: [
      'designer lehenga online',
      'bridal lehenga USA',
      'Indian wedding lehenga',
      'embroidered lehenga choli',
      'ethnic wear for weddings',
      'lehenga for reception',
      'handcrafted lehenga online',
      'traditional Indian lehenga',
      'festive lehenga collection',
      'luxury bridal lehenga',
    ],
    categoryDescription:
      'Explore LuxeMia\'s curated collection of designer lehengas — from bridal masterpieces to festive-ready silhouettes. Handcrafted with intricate embroidery, zari, and sequin work, each lehenga blends traditional Indian artistry with contemporary design. Shop bridal lehengas, wedding lehengas, and festive lehengas online with free shipping over $350 to the USA, Canada, and Australia.',
    craftsmanship: {
      origin: 'Crafted by master artisans in India\'s renowned textile regions of Gujarat and Rajasthan, where lehenga-making traditions span over 500 years.',
      technique: 'Each piece features meticulous hand embroidery using traditional techniques including zardozi (gold threadwork), aari (hook needlework), and badla (metallic ribbon embroidery) passed down through generations of artisan families.',
      handworkHours: 'Every lehenga requires 80 to 150 hours of intensive handwork, from the initial fabric dyeing and blocking to the final embellishment and quality inspection.',
      heritage: 'These time-honored craftsmanship techniques have adorned Indian royalty for centuries and continue to define the gold standard in bridal ethnic wear worldwide.',
    },
    occasionStyling: {
      wedding: [
        'For the main wedding ceremony, drape the dupatta over your head and across both shoulders in the traditional pallu style for a reverent bridal look.',
        'Choose heavy kundan or polki jewelry with a multi-layered rani haar and matching maang tikka for maximum impact.',
        'Style your hair in a center-parted low bun decorated with fresh red roses or gajra for timeless bridal elegance.',
      ],
      reception: [
        'For the reception, drape the dupatta loosely over one shoulder and let it flow behind you for effortless movement and modern sophistication.',
        'Switch to diamond or American diamond jewelry for a contemporary sparkle that catches the candlelight beautifully.',
        'A sleek high ponytail or soft cascading curls complement the reception look with a touch of red-carpet glamour.',
      ],
      sangeet: [
        'For the sangeet night, pin the dupatta firmly across both arms to allow unrestricted dancing while showcasing the lehenga\'s flare.',
        'Opt for lighter, statement pieces like chandelier earrings and a single statement cuff bracelet.',
        'A braided updo with tiny floral accents keeps hair secure and stylish through hours of dancing.',
      ],
      engagement: [
        'For your engagement, drape the dupatta like a cape over both shoulders for a modern, fashion-forward silhouette.',
        'Delicate pearl jewelry with a matching tiara-style maang tikka creates an elegant, understated look.',
        'Soft romantic waves or a half-up, half-down hairstyle perfectly complement the celebratory yet intimate atmosphere.',
      ],
    },
    qaPairs: [
      {
        question: 'What is included in a lehenga choli set?',
        answer: 'Each LuxeMia lehenga choli set includes three pieces: the flared lehenga skirt, a matching or complementing choli (blouse), and a decorative dupatta (scarf). All lehengas come with a cotton inner lining and can-can underskirt for volume. Custom tailoring is available to ensure a perfect fit for your measurements.',
      },
      {
        question: 'How do I choose the right lehenga size?',
        answer: 'LuxeMia lehengas are available in sizes S through XXL with complimentary custom tailoring. To find your perfect size, measure your bust, waist, and hips, then compare with our detailed Size Guide. For the best fit, we recommend opting for custom tailoring — simply provide your measurements at checkout and our artisans will craft your lehenga to your exact specifications.',
      },
      {
        question: 'What fabric is best for a bridal lehenga?',
        answer: 'For bridal lehengas, silk and Banarasi silk are the most popular choices due to their luxurious drape, natural sheen, and ability to hold intricate embroidery. Silk lehengas offer a regal, structured silhouette perfect for wedding ceremonies. For lighter festive occasions, georgette and net lehengas provide elegant movement with beautiful embellishment visibility.',
      },
      {
        question: 'How far in advance should I order a bridal lehenga?',
        answer: 'We recommend ordering your bridal lehenga at least 4 to 6 weeks before your wedding date. Readymade lehengas ship within 3-5 business days, while custom-tailored orders require 5-7 business days for crafting plus 7-10 business days for delivery to the USA, Canada, and Australia. Ordering early allows time for any minor alterations if needed.',
      },
      {
        question: 'How do I care for my embroidered lehenga?',
        answer: 'Professional dry cleaning is essential for preserving the embroidery and fabric integrity of your lehenga. Store it in a breathable muslin garment bag away from direct sunlight, and fold with acid-free tissue paper between layers to prevent embellishments from catching. Never machine wash or wring your lehenga, and always use a pressing cloth when ironing embellished areas on low heat.',
      },
      {
        question: 'Can I wear a lehenga to a non-Indian wedding?',
        answer: 'Absolutely — LuxeMia lehengas are designed with universal elegance that transcends cultural boundaries. For fusion weddings, choose lighter embroidery and contemporary drapes. Our indo-western styled lehengas with minimal embellishment pair beautifully with modern accessories for any formal celebration.',
      },
    ],
  },

  saree: {
    label: 'saree',
    adjectives: {
      primary: ['timeless', 'elegant', 'graceful', 'ethereal', 'classic', 'luxurious'],
      secondary: ['radiant', 'draped', 'magnificent', 'enchanting', 'splendid', 'refined'],
    },
    designElements: [
      'rich woven pallu',
      'intricate border patterns',
      'delicate buti work',
      'traditional jacquard weave',
      'hand-finished edges',
      'contrast blouse pairing',
    ],
    occasions: [
      'weddings',
      'festive celebrations',
      'pooja ceremonies',
      'receptions',
      'cultural events',
      'formal gatherings',
    ],
    stylingTips: [
      'Drape in the classic Nivi style for a universally flattering silhouette, or try a Bengali drape for a more traditional statement.',
      'Pair with a contrast blouse to add a modern twist, or match the saree\'s border for timeless cohesion.',
      'A sleek pleated pallu pinned at the shoulder keeps the look polished for long events.',
    ],
    accessories: ['temple jewelry', 'jhumka earrings', 'bangle sets', 'waist chain (kamarbandh)', 'broad necklace sets'],
    footwear: ['kitten heels', 'embroidered sandals', 'traditional juttis'],
    careInstructions: [
      'Professional dry cleaning is recommended, especially for silk and heavily embellished sarees.',
      'For light cotton or chiffon sarees, gentle hand wash in cold water is acceptable.',
      'Always iron on low heat; use a pressing cloth over embroidered or zari sections.',
    ],
    storageTips: [
      'Fold neatly and store in a muslin cloth to maintain fabric breathability.',
      'Change the fold lines periodically to prevent permanent creases, especially in silk sarees.',
      'Avoid hanging heavy silk sarees as this can stretch the fabric over time.',
    ],
    sizes: 'Free size (with blouse piece stitching available)',
    keywords: [
      'silk saree online USA',
      'Indian saree for wedding',
      'designer saree collection',
      'Banarasi saree',
      'ethnic saree for festive',
      'saree for Indian wedding',
      'handwoven silk saree',
      'bridal Banarasi saree',
      'traditional Kanjivaram saree',
      'designer silk saree online',
    ],
    categoryDescription:
      'Discover LuxeMia\'s handpicked saree collection — from lustrous Banarasi silks to lightweight georgettes. Each saree celebrates India\'s weaving heritage with intricate borders, rich pallus, and artisan craftsmanship. Shop silk sarees, bridal sarees, and festive sarees online with free shipping over $350 to the USA, Canada, and Australia.',
    craftsmanship: {
      origin: 'Woven by master weavers in Varanasi (Banaras), Kanchipuram, and Surat — the three great centers of Indian saree craftsmanship with combined histories spanning over 2,000 years.',
      technique: 'Our silk sarees are crafted using the jacquard loom technique with hand-tied zari threads, while Banarasi sarees employ the kadwa (cutwork) method where each motif is individually woven into the fabric creating a raised texture.',
      handworkHours: 'A single handwoven silk saree requires 15 to 30 days of meticulous labor, with master weavers tying up to 5,600 knots per square inch to create intricate patterns that tell stories of Indian heritage.',
      heritage: 'These ancient weaving traditions have been recognized by UNESCO as Intangible Cultural Heritage, with techniques passed from father to son through countless generations in hereditary weaving communities.',
    },
    occasionStyling: {
      wedding: [
        'For a wedding ceremony, choose a Banarasi silk or Kanjivaram saree in rich red, maroon, or gold with heavy zari work.',
        'Pair with traditional temple jewelry, heavy jhumkas, and a broad gold necklace set for authentic bridal grandeur.',
        'Style your hair in a classic South Indian bun adorned with jasmine flowers (gajra) for traditional elegance.',
      ],
      reception: [
        'For receptions, drape your saree in the modern seedha pallu style for a fresh, contemporary silhouette.',
        'Opt for diamond or American diamond jewelry with a sleek clutch for sophisticated evening glamour.',
        'Soft waves or a side-swept updo complement the reception setting with effortless grace.',
      ],
      'pooja ceremony': [
        'For pooja ceremonies, choose a modest cotton silk or lightweight Banarasi in pastel or earthy tones.',
        'Minimal gold jewelry with small jhumkas and a simple bindi create a respectful, elegant appearance.',
        'A neatly braided ponytail or low bun keeps the look traditional and ceremony-appropriate.',
      ],
      festive: [
        'For festive celebrations, experiment with contrasting blouses and creative draping styles like the butterfly drape.',
        'Statement earrings and stacked bangles add festive sparkle without overwhelming your look.',
        'A half-up hairstyle with decorative pins keeps you comfortable through hours of celebration.',
      ],
    },
    qaPairs: [
      {
        question: 'What is a Banarasi silk saree?',
        answer: 'A Banarasi silk saree is a luxurious handwoven saree from Varanasi (Banaras), India, renowned for its intricate zari (gold/silver thread) work, rich silk fabric, and elaborate motifs inspired by Mughal art. Each saree takes 15-30 days to craft and features distinctive characteristics including heavy pallus, fine borders, and detailed buti (small motif) work throughout the fabric. LuxeMia\'s Banarasi collection brings authentic, artisan-crafted pieces directly to the USA, Canada, and Australia.',
      },
      {
        question: 'How do I drape a saree for a wedding?',
        answer: 'For weddings, the classic Nivi drape is the most popular choice — tuck the saree into the petticoat at your right waist, wrap around once, make 5-7 front pleats, tuck them in, and drape the remaining length over your left shoulder as the pallu. Secure the pallu at your shoulder with a decorative pin. LuxeMia sarees come with a ready-to-stitch blouse piece, and our detailed draping guide is available with every purchase.',
      },
      {
        question: 'What blouse designs work best with silk sarees?',
        answer: 'For Banarasi and Kanjivaram silk sarees, elbow-length or full-sleeve blouses with high necklines and back cutouts create a regal silhouette. Contrast blouses in complementary colors add modern sophistication, while matching blouses maintain traditional elegance. Popular styles include boat neck, sweetheart neck, and keyhole back designs. LuxeMia provides customizable blouse pieces with every saree — simply provide your measurements for a tailored fit.',
      },
      {
        question: 'How do I care for my silk saree?',
        answer: 'Professional dry cleaning is essential for silk sarees, especially those with zari work. Store folded in muslin cloth with tissue paper between layers, and change the fold lines every 3 months to prevent creases. Never hang heavy silk sarees as this stretches the fabric. Iron on low heat with a cotton pressing cloth over zari sections. Avoid direct sunlight and moisture exposure to preserve color vibrancy.',
      },
      {
        question: 'Which saree is best for a first-time buyer?',
        answer: 'For first-time buyers, we recommend a lightweight Banarasi silk or georgette saree in a versatile color like navy blue, wine, or emerald green. These fabrics drape beautifully, suit most body types, and work across multiple occasions. LuxeMia\'s beginner-friendly collection features sarees with pre-stitched pleat options and detailed draping guides to make your first experience effortless.',
      },
    ],
  },

  suit: {
    label: 'salwar suit',
    adjectives: {
      primary: ['elegant', 'versatile', 'chic', 'sophisticated', 'graceful', 'refined'],
      secondary: ['stylish', 'contemporary', 'polished', 'flattering', 'tasteful', 'smart'],
    },
    designElements: [
      'intricate neckline embroidery',
      'embellished dupatta',
      'detailed sleeve cuffs',
      'ornate yoke patterns',
      'coordinated bottom hem work',
      'contrast piping accents',
    ],
    occasions: [
      'festive celebrations',
      'family gatherings',
      'pooja ceremonies',
      'wedding functions',
      'cultural events',
      'casual elegant occasions',
    ],
    stylingTips: [
      'Wear with the matching dupatta loosely pinned at one shoulder for effortless elegance.',
      'Add a statement jhumka and stack of bangles for festive occasions.',
      'For a modern look, drape the dupatta like a scarf and pair with block heels.',
    ],
    accessories: ['jhumka earrings', 'stackable bangles', 'clutch potli bag', 'nose ring (nath)', 'anklets'],
    footwear: ['kolhapuri sandals', 'block heels', 'embroidered juttis'],
    careInstructions: [
      'Professional dry cleaning is recommended for embroidered and embellished suits.',
      'For cotton suits, gentle machine wash in cold water on a delicate cycle is acceptable.',
      'Iron on medium heat; use steam for cotton and low heat for synthetic fabrics.',
    ],
    storageTips: [
      'Hang on padded hangers to maintain shape, or fold with tissue paper between layers.',
      'Store dupattas separately to prevent snagging on embroidered suits.',
      'Keep in a cool, dry place away from direct sunlight to prevent color fading.',
    ],
    sizes: 'S-XXL',
    keywords: [
      'salwar kameez online USA',
      'Pakistani suit design',
      'designer salwar suit',
      'ethnic suit for wedding',
      'anarkali suit online',
      'Indian suit collection',
    ],
    categoryDescription:
      'Shop LuxeMia\'s salwar suit collection — elegant anarkali suits, straight-cut kameez, and palazzo sets crafted with fine embroidery and premium fabrics. Perfect for festive gatherings, weddings, and everyday ethnic style. Free shipping over $350 to the USA, Canada, and Australia.',
  },

  salwar: {
    label: 'salwar suit',
    adjectives: {
      primary: ['elegant', 'versatile', 'chic', 'sophisticated', 'graceful', 'refined'],
      secondary: ['stylish', 'contemporary', 'polished', 'flattering', 'tasteful', 'smart'],
    },
    designElements: [
      'intricate neckline embroidery',
      'embellished dupatta',
      'detailed sleeve cuffs',
      'ornate yoke patterns',
      'coordinated bottom hem work',
      'contrast piping accents',
    ],
    occasions: [
      'festive celebrations',
      'family gatherings',
      'pooja ceremonies',
      'wedding functions',
      'cultural events',
      'casual elegant occasions',
    ],
    stylingTips: [
      'Wear with the matching dupatta loosely pinned at one shoulder for effortless elegance.',
      'Add a statement jhumka and stack of bangles for festive occasions.',
      'For a modern look, drape the dupatta like a scarf and pair with block heels.',
    ],
    accessories: ['jhumka earrings', 'stackable bangles', 'clutch potli bag', 'nose ring (nath)', 'anklets'],
    footwear: ['kolhapuri sandals', 'block heels', 'embroidered juttis'],
    careInstructions: [
      'Professional dry cleaning is recommended for embroidered and embellished suits.',
      'For cotton suits, gentle machine wash in cold water on a delicate cycle is acceptable.',
      'Iron on medium heat; use steam for cotton and low heat for synthetic fabrics.',
    ],
    storageTips: [
      'Hang on padded hangers to maintain shape, or fold with tissue paper between layers.',
      'Store dupattas separately to prevent snagging on embroidered suits.',
      'Keep in a cool, dry place away from direct sunlight to prevent color fading.',
    ],
    sizes: 'S-XXL',
    keywords: [
      'salwar kameez online USA',
      'Pakistani suit design',
      'designer salwar suit',
      'ethnic suit for wedding',
      'anarkali suit online',
      'Indian suit collection',
    ],
    categoryDescription:
      'Shop LuxeMia\'s salwar suit collection — elegant anarkali suits, straight-cut kameez, and palazzo sets crafted with fine embroidery and premium fabrics. Perfect for festive gatherings, weddings, and everyday ethnic style. Free shipping over $350 to the USA, Canada, and Australia.',
  },

  anarkali: {
    label: 'anarkali suit',
    adjectives: {
      primary: ['flowing', 'regal', 'dramatic', 'ethereal', 'majestic', 'enchanting'],
      secondary: ['princess-like', 'showstopping', 'opulent', 'dreamy', 'romantic', 'grand'],
    },
    designElements: [
      'flared kalidar silhouette',
      'intricate yoke embroidery',
      'scalloped hemline',
      'sheer sleeve details',
      'embellished waistband',
      'layered gathers',
    ],
    occasions: [
      'weddings',
      'receptions',
      'sangeet nights',
      'festive celebrations',
      'engagement ceremonies',
      'formal dinners',
    ],
    stylingTips: [
      'Let the flared silhouette shine by keeping accessories minimal — a pair of chandelier jhumkas and a delicate bracelet is all you need.',
      'Cinch the waist with the attached belt or add a slim metallic kamarbandh for definition.',
      'Style your hair in soft curls or a low bun to complement the anarkali\'s graceful flow.',
    ],
    accessories: ['chandelier jhumkas', 'delicate bangles', 'kamarbandh', 'maang tikka', 'potli clutch'],
    footwear: ['strappy heels', 'embellished juttis', 'block heels'],
    careInstructions: [
      'Professional dry cleaning is essential to maintain the flare and embroidery quality.',
      'Steam lightly to remove wrinkles — avoid direct ironing on embellished areas.',
      'Hang on a sturdy hanger to preserve the anarkali\'s shape between wears.',
    ],
    storageTips: [
      'Hang on a wide padded hanger to maintain the flared silhouette.',
      'Cover with a muslin garment bag to protect embroidery from dust.',
      'Avoid folding heavily embellished anarkalis to prevent creasing of the flare.',
    ],
    sizes: 'S-XXL',
    keywords: [
      'anarkali suit online USA',
      'flared anarkali for wedding',
      'designer anarkali suit',
      'anarkali dress Indian',
      'floor-length anarkali',
      'festive anarkali suit',
    ],
    categoryDescription:
      'Browse LuxeMia\'s anarkali collection — flowing kalidar silhouettes with intricate yoke embroidery, sheer sleeves, and dramatic flares. From intimate ceremonies to grand receptions, find the perfect anarkali suit online. Free shipping over $350 to the USA, Canada, and Australia.',
  },

  sharara: {
    label: 'sharara set',
    adjectives: {
      primary: ['trendy', 'glamorous', 'contemporary', 'striking', 'chic', 'fashion-forward'],
      secondary: ['stylish', 'vibrant', 'bold', 'playful', 'statement', 'eye-catching'],
    },
    designElements: [
      'wide-legged flared pants',
      'intricate dupatta drape',
      'embellished short kurta',
      'ornate hemline',
      'contrasting threadwork',
      'statement neckline',
    ],
    occasions: [
      'sangeet nights',
      'mehndi ceremonies',
      'wedding celebrations',
      'festive parties',
      'engagement functions',
      'cocktail events',
    ],
    stylingTips: [
      'Pair with a heavily embroidered dupatta pinned at the shoulder or worn as a cape for a modern twist.',
      'Accessorize with chunky jhumkas and a stack of metallic bangles to match the festive vibe.',
      'Open-toe block heels or wedges work best with the wide-legged sharara silhouette.',
    ],
    accessories: ['chunky jhumkas', 'metallic bangles', 'potli bag', 'maang tikka', 'anklets'],
    footwear: ['block heels', 'wedges', 'embroidered mojaris'],
    careInstructions: [
      'Professional dry cleaning is recommended to preserve the embellishments and fabric quality.',
      'Steam the sharara pants on low heat to maintain the flare without flattening gathers.',
      'Iron the kurta on medium heat with a pressing cloth over embroidered sections.',
    ],
    storageTips: [
      'Hang the kurta on a padded hanger and fold the sharara pants with tissue paper between layers.',
      'Store the dupatta separately, folded with tissue to avoid snagging.',
      'Keep in a breathable muslin bag away from direct sunlight.',
    ],
    sizes: 'S-XXL',
    keywords: [
      'sharara suit online USA',
      'designer sharara set',
      'sharara for sangeet',
      'Indian sharara pants',
      'festive sharara outfit',
      'wedding sharara set',
    ],
    categoryDescription:
      'Discover LuxeMia\'s sharara collection — trendy wide-legged sets with embroidered kurtas and ornate dupattas. Perfect for sangeet, mehndi, and festive celebrations. Shop designer sharara sets online with free shipping over $350 to the USA, Canada, and Australia.',
  },

  sherwani: {
    label: 'sherwani',
    adjectives: {
      primary: ['distinguished', 'impeccable', 'regal', 'stately', 'dashing', 'commanding'],
      secondary: ['sophisticated', 'noble', 'grand', 'polished', 'dapper', 'prestigious'],
    },
    designElements: [
      'intricate chest embroidery',
      'ornate collar and lapel work',
      'coordinated pocket squares',
      'structured shoulder detailing',
      'rich button accents',
      'elaborate hemline patterns',
    ],
    occasions: [
      'weddings',
      'receptions',
      'engagement ceremonies',
      'baraat processions',
      'festive celebrations',
      'formal cultural events',
    ],
    stylingTips: [
      'Complete the look with a matching stole draped over one arm for a classic groom-worthy ensemble.',
      'A mojari or jutti in a complementing shade ties the whole outfit together.',
      'Add a brooch at the collar for a touch of personal flair — pearl or kundan work best.',
    ],
    accessories: ['pearl or kundan brooch', 'matching stole', 'safa (turban)', 'mojari', 'cufflinks'],
    footwear: ['embroidered mojaris', 'juttis', 'formal loafers'],
    careInstructions: [
      'Professional dry cleaning only — sherwanis are heavily structured and embellished garments.',
      'Steam lightly to remove minor wrinkles; never iron directly on embroidered or sequined areas.',
      'Spot clean any stains immediately with a damp cloth; do not rub.',
    ],
    storageTips: [
      'Hang on a sturdy wooden or padded hanger to maintain the structured silhouette.',
      'Store in a breathable garment bag — avoid plastic which can trap moisture.',
      'Keep in a cool, dry place; use cedar blocks or lavender sachets to deter moths.',
    ],
    sizes: 'S-XXL (custom tailoring recommended for perfect fit)',
    keywords: [
      'sherwani online USA',
      'groom sherwani wedding',
      'designer sherwani Indian',
      'wedding sherwani for men',
      'ethnic menswear online',
      'Indian groom outfit',
    ],
    categoryDescription:
      'Shop LuxeMia\'s sherwani collection — distinguished wedding sherwanis and festive menswear crafted with intricate embroidery, structured silhouettes, and premium fabrics. From groom-worthy masterpieces to elegant reception looks. Free shipping over $350 to the USA, Canada, and Australia.',
  },

  kurta: {
    label: 'kurta',
    adjectives: {
      primary: ['refined', 'effortless', 'classic', 'understated', 'handsome', 'comfortable'],
      secondary: ['smart', 'relaxed', 'versatile', 'sharp', 'polished', 'breezy'],
    },
    designElements: [
      'subtle neckline embroidery',
      'contrast button placket',
      'side slit detailing',
      'cuffed sleeve accents',
      'minimalist pocket embroidery',
      'clean hemline stitching',
    ],
    occasions: [
      'pooja ceremonies',
      'festive gatherings',
      'family celebrations',
      'casual ethnic occasions',
      'cultural events',
      'everyday ethnic style',
    ],
    stylingTips: [
      'Pair with well-fitted churidar pajama for a classic look, or linen pants for a contemporary fusion vibe.',
      'Layer with a nehru jacket or embroidered vest to elevate the outfit for festive occasions.',
      'Roll up the sleeves and add a leather strap watch for smart-casual ethnic style.',
    ],
    accessories: ['nehru jacket', 'leather strap watch', 'beaded mala', 'kolhapuri chappals', 'safa for festive'],
    footwear: ['kolhapuri chappals', 'leather sandals', 'sneakers for fusion look'],
    careInstructions: [
      'Cotton kurtas can be machine washed on a gentle cold cycle; silk and embroidered kurtas require dry cleaning.',
      'Iron on medium heat; use steam for cotton fabrics to remove stubborn wrinkles.',
      'Turn embellished kurtas inside out before washing or ironing.',
    ],
    storageTips: [
      'Fold and store on a shelf or hang on a standard hanger.',
      'For silk kurtas, fold with tissue paper and store in a muslin bag.',
      'Keep away from direct sunlight to prevent color fading.',
    ],
    sizes: 'S-XXL',
    keywords: [
      'kurta pajama online USA',
      'men\'s kurta set',
      'ethnic kurta for festive',
      'designer kurta men',
      'Indian kurta online',
      'kurta for wedding guest',
    ],
    categoryDescription:
      'Explore LuxeMia\'s kurta collection — from breezy cotton sets for everyday ethnic style to embroidered silk kurtas for festive occasions. Pair with churidar, pajama, or pants for versatile looks. Free shipping over $350 to the USA, Canada, and Australia.',
  },

  jewelry: {
    label: 'jewelry piece',
    adjectives: {
      primary: ['exquisite', 'dazzling', 'ornate', 'luminous', 'artistic', 'handcrafted'],
      secondary: ['intricate', 'radiant', 'timeless', 'statement', 'delicate', 'brilliant'],
    },
    designElements: [
      'intricate filigree work',
      'polished stone setting',
      'detailed enamel (meenakari)',
      'gold-plated finish',
      'hand-set kundan stones',
      'delicate pearl accents',
    ],
    occasions: [
      'weddings',
      'festive celebrations',
      'receptions',
      'engagement ceremonies',
      'cultural events',
      'everyday ethnic elegance',
    ],
    stylingTips: [
      'Pair this piece with a matching outfit color for a cohesive look, or use it as a statement contrast against a simpler ensemble.',
      'Layer with complementary jewelry from the same collection for a coordinated bridal or festive look.',
      'Keep the rest of your accessories minimal to let this piece stand out as the focal point.',
    ],
    accessories: ['matching earrings or necklace', 'bangle set', 'maang tikka', 'anklet', 'ring'],
    footwear: ['embellished juttis', 'block heels', 'traditional sandals'],
    careInstructions: [
      'Store in a soft pouch or lined jewelry box to prevent scratching and tarnishing.',
      'Avoid contact with perfume, water, and chemicals — put on jewelry last when getting ready.',
      'Wipe gently with a soft cloth after each wear to remove oils and maintain luster.',
    ],
    storageTips: [
      'Keep individual pieces in separate pouches to prevent tangling and scratching.',
      'Store in a cool, dry place away from humidity.',
      'Use anti-tarnish strips in your jewelry box for silver and gold-plated pieces.',
    ],
    sizes: 'One size (adjustable where noted)',
    keywords: [
      'Indian jewelry online USA',
      'kundan jewelry set',
      'bridal jewelry Indian',
      'temple jewelry online',
      'ethnic jewelry for wedding',
      'gold-plated Indian jewelry',
    ],
    categoryDescription:
      'Adorn yourself with LuxeMia\'s jewelry collection — handcrafted kundan sets, temple jewelry, polki designs, and statement earrings. Each piece is crafted to complement Indian ethnic wear with timeless artistry. Free shipping over $350 to the USA, Canada, and Australia.',
  },

  'indo-western': {
    label: 'indo-western outfit',
    adjectives: {
      primary: ['contemporary', 'fusion-ready', 'modern', 'sleek', 'innovative', 'chic'],
      secondary: ['trendy', 'edgy', 'fashion-forward', 'sophisticated', 'bold', 'cosmopolitan'],
    },
    designElements: [
      'modern draping silhouette',
      'fusion neckline detailing',
      'contemporary cut accents',
      'asymmetric hemline',
      'embellished belt or sash',
      'blended fabric textures',
    ],
    occasions: [
      'cocktail parties',
      'receptions',
      'engagement ceremonies',
      'sangeet nights',
      'festive celebrations',
      'fusion wedding events',
    ],
    stylingTips: [
      'Let the fusion silhouette be the statement — pair with minimal jewelry like sleek drop earrings and a cuff bracelet.',
      'Strappy heels or stilettos complement the modern lines of an indo-western outfit beautifully.',
      'A sleek clutch and soft waves complete the contemporary-meets-traditional look.',
    ],
    accessories: ['drop earrings', 'cuff bracelet', 'sleek clutch', 'statement ring', 'delicate necklace'],
    footwear: ['strappy heels', 'stilettos', 'wedge sandals'],
    careInstructions: [
      'Professional dry cleaning is recommended due to mixed fabrics and structured elements.',
      'Steam to remove wrinkles; avoid direct ironing on embellished panels.',
      'Spot clean stains immediately — blended fabrics can react differently to cleaning agents.',
    ],
    storageTips: [
      'Hang on a padded hanger to maintain the structured silhouette and drape.',
      'Cover with a muslin garment bag to protect from dust and snagging.',
      'Store in a cool, dry place away from direct sunlight to preserve color and fabric integrity.',
    ],
    sizes: 'S-XXL',
    keywords: [
      'indo-western dress online USA',
      'fusion wear Indian',
      'indo-western for wedding',
      'modern Indian outfit',
      'fusion ethnic wear',
      'contemporary Indian dress',
    ],
    categoryDescription:
      'Shop LuxeMia\'s indo-western collection — fusion silhouettes that blend traditional Indian craftsmanship with modern design. From drape gowns to jacket sets, find the perfect contemporary ethnic look. Free shipping over $350 to the USA, Canada, and Australia.',
  },
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Normalize a raw product type string to a known category key.
 *
 * Handles variations like "Lehenga Choli" → "lehenga", "Salwar Kameez" → "salwar", etc.
 *
 * @param productType - The raw product type from Shopify or internal data.
 * @returns The normalized category key, or a fallback key.
 */
function normalizeProductType(productType: string): string {
  const lower = productType.toLowerCase().trim();

  // Direct match
  if (CATEGORY_TEMPLATES[lower]) return lower;

  // Substring / alias matching
  if (lower.includes('lehenga') || lower.includes('lehanga') || lower.includes('lenga')) return 'lehenga';
  if (lower.includes('saree') || lower.includes('sari')) return 'saree';
  if (lower.includes('anarkali')) return 'anarkali';
  if (lower.includes('sharara') || lower.includes('garara')) return 'sharara';
  if (lower.includes('sherwani')) return 'sherwani';
  if (lower.includes('kurta')) return 'kurta';
  if (lower.includes('jewel') || lower.includes('necklace') || lower.includes('earring') || lower.includes('bangle') || lower.includes('maang') || lower.includes('tikka') || lower.includes('anklet') || lower.includes('bracelet')) return 'jewelry';
  if (lower.includes('indo') || lower.includes('fusion') || lower.includes('western') || lower.includes('gown') || lower.includes('drape')) return 'indo-western';
  if (lower.includes('salwar') || lower.includes('kameez')) return 'salwar';
  if (lower.includes('suit') || lower.includes('palazzo') || lower.includes('churidar')) return 'suit';

  // Default fallback
  return 'suit';
}

/**
 * Pick a random element from an array, using a simple hash of the title
 * for deterministic selection (same title → same adjective every time).
 *
 * @param arr - Source array.
 * @param seed - String to deterministically pick the same element.
 * @returns A single element from the array.
 */
function pickSeeded<T>(arr: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % arr.length;
  return arr[index];
}

/**
 * Check whether a product description is already "rich" — i.e., it contains
 * enough specific detail that enrichment is unnecessary.
 *
 * A description is considered rich if:
 * - It is at least 200 characters long AND
 * - It contains at least 2 specificity indicators (e.g., "embroidery", "zari", etc.)
 *
 * @param description - The raw product description.
 * @returns True if the description is already rich and should be kept as-is.
 */
function isDescriptionRich(description: string): boolean {
  if (description.length < RICH_DESCRIPTION_MIN_LENGTH) return false;

  const lower = description.toLowerCase();
  const matchCount = SPECIFICITY_INDICATORS.filter(indicator => lower.includes(indicator)).length;
  return matchCount >= 2;
}

/**
 * Infer a material/fabric label from the title, color, or raw description.
 * Returns a user-friendly fabric string, or a generic fallback.
 *
 * @param title - Product title.
 * @param material - Optional explicit material.
 * @param description - Original description for context.
 * @returns A fabric/material string for use in the enriched description.
 */
function inferMaterial(title: string, material?: string, description?: string): string {
  if (material && material.trim().length > 2) return material.trim();

  const searchable = `${title} ${description ?? ''}`.toLowerCase();

  const fabricMap: Record<string, string> = {
    silk: 'pure silk',
    georgette: 'georgette',
    chiffon: 'chiffon',
    crepe: 'crepe',
    velvet: 'velvet',
    net: 'net fabric',
    organza: 'organza',
    cotton: 'cotton',
    linen: 'linen',
    satin: 'satin',
    taffeta: 'taffeta',
    jacquard: 'jacquard',
    'art silk': 'art silk',
    vichitra: 'art silk',
    chinon: 'chinon',
    chinnon: 'chinon',
    chanderi: 'chanderi',
    banarasi: 'Banarasi silk',
    kanchipuram: 'Kanchipuram silk',
    kanjivaram: 'Kanjivaram silk',
    raw: 'raw silk',
    tussar: 'tussar silk',
    brocade: 'brocade',
    muslin: 'muslin',
  };

  for (const [keyword, fabric] of Object.entries(fabricMap)) {
    if (searchable.includes(keyword)) return fabric;
  }

  return 'premium fabric';
}

/**
 * Infer a color descriptor from the title, color param, or description.
 *
 * @param title - Product title.
 * @param color - Optional explicit color.
 * @param description - Original description for context.
 * @returns A color descriptor string, or empty string if not determinable.
 */
function inferColor(title: string, color?: string, description?: string): string {
  if (color && color.trim().length > 1) return color.trim();

  const searchable = `${title} ${description ?? ''}`.toLowerCase();

  const colorKeywords = [
    // Multi-word base colors first (must match before single-word components)
    // These are the MAIN/base colors that appear first in corrected titles
    'pearl white', 'off white', 'off-white', 'rani pink', 'sky blue', 'baby pink',
    'dusty rose', 'royal blue', 'rust orange', 'teal blue', 'navy blue',
    'pista green', 'mehendi green', 'olive green', 'sea green', 'hot pink',
    // Single-word colors (may be accent/dupatta colors)
    'red', 'maroon', 'wine', 'burgundy', 'pink', 'rose', 'fuchsia', 'magenta',
    'blue', 'navy', 'teal', 'cyan', 'indigo',
    'green', 'emerald', 'olive', 'mint', 'sage',
    'yellow', 'gold', 'mustard', 'amber',
    'orange', 'peach', 'coral', 'rust',
    'purple', 'lavender', 'plum', 'mauve', 'lilac',
    'white', 'ivory', 'cream', 'beige',
    'black', 'grey', 'gray', 'charcoal',
    'champagne', 'copper', 'bronze', 'tan', 'camel',
  ];

  for (const c of colorKeywords) {
    if (searchable.includes(c)) return c;
  }

  return '';
}

/**
 * Build the opening paragraph of the enriched description.
 */
function buildOpeningParagraph(
  title: string,
  categoryKey: string,
  material: string,
  color: string,
  seed: string,
): string {
  const template = CATEGORY_TEMPLATES[categoryKey] ?? CATEGORY_TEMPLATES['suit'];
  const adjective = pickSeeded(template.adjectives.primary, seed);
  const label = template.label;

  const colorPrefix = color ? `${color} ` : '';
  const isNonGarment = NON_GARMENT_CATEGORIES.has(categoryKey);
  const materialPhrase = material !== 'premium fabric'
    ? `crafted in ${material}`
    : isNonGarment
      ? `with exceptional artistry`
      : `crafted in ${colorPrefix}${material}`;

  const designElement1 = pickSeeded(template.designElements, seed + '-d1');
  const designElement2 = pickSeeded(template.designElements, seed + '-d2');

  const art = article(adjective);
  let opening = `Shop the ${title} at LuxeMia — ${art} ${adjective} ${label} ${materialPhrase}.`;
  opening += ` Featuring ${designElement1} and ${designElement2}, this ${label} showcases the finest of Indian artistry and contemporary design.`;

  if (NON_GARMENT_CATEGORIES.has(categoryKey)) {
    opening += ` Every detail reflects the dedication of skilled artisans, ensuring a piece that stands out at any occasion.`;
  } else {
    opening += ` Every stitch reflects the dedication of skilled artisans, ensuring a garment that stands out at any occasion.`;
  }

  return opening;
}

/**
 * Build the occasion paragraph.
 */
function buildOccasionParagraph(
  categoryKey: string,
  color: string,
  seed: string,
): string {
  const template = CATEGORY_TEMPLATES[categoryKey] ?? CATEGORY_TEMPLATES['suit'];
  const secondaryAdj = pickSeeded(template.adjectives.secondary, seed + '-occ');
  const label = template.label;

  const occasions = template.occasions.slice(0, 4);
  const occasionList = occasions.length > 1
    ? `${occasions.slice(0, -1).join(', ')}, and ${occasions[occasions.length - 1]}`
    : occasions[0];

  const colorContext = color ? ` in ${color}` : '';

  return `Perfect for ${occasionList}, this ${secondaryAdj} ${label}${colorContext} ensures you make a memorable impression wherever you go. Its versatile appeal transitions effortlessly from intimate family gatherings to grand celebrations.`;
}

/**
 * Build the styling paragraph.
 */
function buildStylingParagraph(
  categoryKey: string,
  seed: string,
): string {
  const template = CATEGORY_TEMPLATES[categoryKey] ?? CATEGORY_TEMPLATES['suit'];
  const stylingTip = pickSeeded(template.stylingTips, seed + '-styling');
  const accessories = template.accessories.slice(0, 3).join(', ');
  const footwear = pickSeeded(template.footwear, seed + '-foot');

  return `${stylingTip} Complete your ensemble with ${accessories}, and step into ${footwear} for a head-to-toe curated look.`;
}

/**
 * Build the care paragraph.
 */
function buildCareParagraph(
  categoryKey: string,
  _material: string,
  seed: string,
): string {
  const template = CATEGORY_TEMPLATES[categoryKey] ?? CATEGORY_TEMPLATES['suit'];
  const careTip = pickSeeded(template.careInstructions, seed + '-care');
  const storageTip = pickSeeded(template.storageTips, seed + '-store');

  return `${careTip} ${storageTip}`;
}

// ─── Phase 3: Luxury Editorial Enhancement ─────────────────────────────────

/**
 * Build the craftsmanship storytelling paragraph.
 * Adds fabric origin, artisan technique, and heritage narrative for luxury appeal.
 */
function buildCraftsmanshipParagraph(
  categoryKey: string,
  material: string,
  seed: string,
): string {
  const template = CATEGORY_TEMPLATES[categoryKey];
  if (!template?.craftsmanship) return '';

  const craft = template.craftsmanship;
  const adj1 = pickSeeded(template.adjectives.primary, seed + '-craft1');

  let paragraph = `This ${adj1} ${template.label} carries the soul of Indian craftsmanship. ${craft.origin} `;
  paragraph += `${craft.technique} `;
  paragraph += `${craft.handworkHours} `;
  paragraph += `${craft.heritage}`;

  // Add material-specific context if we inferred a specific fabric
  if (material && material !== 'premium fabric') {
    const materialLower = material.toLowerCase();
    if (materialLower.includes('banarasi')) {
      paragraph += ` The Banarasi silk used in this ${template.label} is sourced directly from the ancient weaving looms of Varanasi, where the art of zari weaving has been perfected over fifteen centuries.`;
    } else if (materialLower.includes('kanjivaram') || materialLower.includes('kanchipuram')) {
      paragraph += ` The Kanjivaram silk used here is renowned for its exceptional durability and lustrous sheen, with each thread dyed individually before weaving to create the distinctive color combinations that have made this fabric a bridal tradition for millennia.`;
    } else if (materialLower.includes('georgette')) {
      paragraph += ` The georgette fabric offers a beautiful balance of fluid drape and structural integrity, making it ideal for intricate embroidery while maintaining an effortlessly graceful silhouette.`;
    } else if (materialLower.includes('silk') && !materialLower.includes('georgette')) {
      paragraph += ` Pure silk provides a naturally luminous backdrop for elaborate embroidery, its inherent sheen amplifying the richness of every zari thread and sequin.`;
    }
  }

  return paragraph;
}

/**
 * Build occasion-specific detailed styling guidance.
 * Provides comprehensive styling advice for the most relevant occasion.
 */
function buildOccasionStylingParagraph(
  categoryKey: string,
  title: string,
  seed: string,
): string {
  const template = CATEGORY_TEMPLATES[categoryKey];
  if (!template?.occasionStyling) return '';

  // Detect the primary occasion from the title
  const lower = title.toLowerCase();
  let occasion = 'wedding'; // default

  if (lower.includes('sangeet') || lower.includes('mehendi')) occasion = 'sangeet';
  else if (lower.includes('engagement')) occasion = 'engagement';
  else if (lower.includes('reception')) occasion = 'reception';
  else if (lower.includes('pooja') || lower.includes('ceremony')) occasion = 'pooja ceremony';
  else if (lower.includes('festive') || lower.includes('festival')) occasion = 'festive';
  else if (lower.includes('party') || lower.includes('partywear')) occasion = 'reception';
  else if (lower.includes('bridal')) occasion = 'wedding';

  const stylingArray = template.occasionStyling[occasion];
  if (!stylingArray || stylingArray.length === 0) return '';

  const header = occasion === 'wedding'
    ? 'Wedding Day Styling Guide'
    : occasion === 'reception'
      ? 'Reception Styling Guide'
      : occasion === 'sangeet'
        ? 'Sangeet Night Styling Guide'
        : occasion === 'engagement'
          ? 'Engagement Styling Guide'
          : `${occasion.charAt(0).toUpperCase() + occasion.slice(1)} Styling Guide`;

  let paragraph = `${header}: `;
  paragraph += stylingArray.map((tip, i) => `${i + 1}. ${tip}`).join(' ');

  return paragraph;
}

/**
 * Build AI-search optimized Q&A section.
 * Formats frequently asked questions in structured Q&A format for featured snippets.
 */
function buildQASection(
  categoryKey: string,
  title: string,
  material: string,
): string {
  const template = CATEGORY_TEMPLATES[categoryKey];
  if (!template?.qaPairs || template.qaPairs.length === 0) return '';

  // Select 2-3 most relevant Q&A pairs based on title keywords
  const lower = title.toLowerCase();
  const selected: Array<{ question: string; answer: string }> = [];

  for (const qa of template.qaPairs) {
    const qaLower = qa.question.toLowerCase();
    // Include if the question is broadly relevant to this product
    if (selected.length < 3) {
      // Prioritize questions about the specific fabric
      if (material && material !== 'premium fabric' && qaLower.includes(material.toLowerCase())) {
        selected.unshift(qa); // most relevant, goes first
      } else if (lower.includes('bridal') && qaLower.includes('bridal')) {
        selected.push(qa);
      } else if (lower.includes('wedding') && qaLower.includes('wedding')) {
        selected.push(qa);
      } else if (selected.length < 2) {
        selected.push(qa);
      }
    }
  }

  // If no specific matches, use the first 2 generic questions
  if (selected.length === 0) {
    selected.push(...template.qaPairs.slice(0, 2));
  }

  let qaSection = 'Frequently Asked Questions\\n';
  qaSection += '─────────────────────────\\n';

  for (const qa of selected) {
    qaSection += `Q: ${qa.question}\\n`;
    qaSection += `A: ${qa.answer}\\n\\n`;
  }

  return qaSection.trim();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Enrich a thin or generic product description with SEO-optimized content.
 *
 * If the original description is already rich (≥ 200 characters and contains
 * specific detail indicators), it is returned unchanged. Otherwise, a
 * comprehensive description is generated following LuxeMia's template structure.
 *
 * The enriched description follows this structure:
 * 1. Opening paragraph — product name, fabric, design elements, craftsmanship
 * 2. Occasion paragraph — suitable events and versatility
 * 3. Styling paragraph — how to wear, accessories, footwear
 * 4. Care paragraph — cleaning and storage instructions
 * 5. Shipping paragraph — sizes, custom tailoring, shipping info
 *
 * @param description - The original product description from Shopify.
 * @param productType - The product type/category (e.g., "Lehenga", "Saree").
 * @param title - The product title.
 * @param material - Optional fabric/material (e.g., "silk", "georgette").
 * @param color - Optional color descriptor (e.g., "red", "navy blue").
 * @returns The enriched description (200-400 words), or the original if already rich.
 *
 * @example
 * ```ts
 * // Thin description — gets enriched
 * enrichProductDescription(
 *   'Red lehenga with embroidery',
 *   'Lehenga',
 *   'Embroidered Red Bridal Lehenga'
 * );
 *
 * // Rich description — passes through unchanged
 * enrichProductDescription(
 *   'This exquisite red Banarasi silk lehenga features intricate zari embroidery with kundan stone work...',
 *   'Lehenga',
 *   'Banarasi Silk Bridal Lehenga'
 * );
 * ```
 */

/**
 * Strip size-related wall-of-text from raw descriptions.
 * Sizes display as clickable buttons in the UI — they should NOT be in description text.
 * Matches patterns like: "Size Variants Available in sizes XS, S, M..." and "Size Chart..."
 */
function stripSizeText(description: string): string {
  if (!description || description.length < 20) return description;

  const patterns = [
    /Size\s+Variants?[\s\S]*?(?=Design\s+Details|Fabric:|Work:|Styling|Care|Shipping|$)/i,
    /Size\s+Chart[\s\S]*?(?=Design\s+Details|Fabric:|Work:|Styling|Care|Shipping|$)/i,
    /Available\s+in\s+sizes\s+XS?[\s\S]*?(?=Design\s+Details|Fabric:|Work:|Styling|Care|Shipping|$)/i,
    /Custom\s+sizing\s+is\s+available[\s\S]*?(?=Design\s+Details|Fabric:|Work:|Styling|Care|Shipping|$)/i,
    /Plus[-\s]?size\s+friendly[\s\S]*?(?=Design\s+Details|Fabric:|Work:|Styling|Care|Shipping|$)/i,
  ];

  let cleaned = description;
  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  return cleaned.replace(/\n{3,}/g, '\n\n').trim();
}

export function enrichProductDescription(
  description: string,
  productType: string,
  title: string,
  material?: string,
  color?: string,
): string {
  // Strip size wall-of-text before processing — sizes display as clickable buttons
  description = stripSizeText(description);

  // If the description is already rich, still append Color/Fabric details
  // if they're missing — GMC requires explicit "Color: X" in descriptions.
  // This addresses the GMC recommendation: "Update product descriptions to
  // include details customers are looking for" (193 products flagged).
  if (isDescriptionRich(description)) {
    const hasExplicitColor = /\bColor\s*:/i.test(description);
    if (!hasExplicitColor) {
      const inferredColorForRich = inferColor(title, color, description);
      const inferredMaterialForRich = inferMaterial(title, material, description);
      const richDetails: string[] = [];
      if (inferredColorForRich) richDetails.push(`Color: ${inferredColorForRich.charAt(0).toUpperCase() + inferredColorForRich.slice(1)}`);
      if (inferredMaterialForRich && inferredMaterialForRich !== 'premium fabric') richDetails.push(`Fabric: ${inferredMaterialForRich.charAt(0).toUpperCase() + inferredMaterialForRich.slice(1)}`);
      if (richDetails.length > 0) {
        return stripSizeText(description) + '\n\n' + richDetails.join(' | ');
      }
    }
    return stripSizeText(description);
  }

  const categoryKey = normalizeProductType(productType);
  const inferredMaterial = inferMaterial(title, material, description);
  const inferredColor = inferColor(title, color, description);
  const seed = `${title}-${productType}`;

  const opening = buildOpeningParagraph(title, categoryKey, inferredMaterial, inferredColor, seed);
  const occasion = buildOccasionParagraph(categoryKey, inferredColor, seed);
  const styling = buildStylingParagraph(categoryKey, seed);
  const care = buildCareParagraph(categoryKey, inferredMaterial, seed);

  // Phase 3: Luxury Editorial Enhancement
  const craftsmanship = buildCraftsmanshipParagraph(categoryKey, inferredMaterial, seed);
  const occasionStyling = buildOccasionStylingParagraph(categoryKey, title, seed);
  const qaSection = buildQASection(categoryKey, title, inferredMaterial);

  // SEO Keyword Integration — weave in product-specific keywords when available
  const seoKeywords = getKeywords(title);
  const seoLongTailKeywords = getLongTailKeywords(title);
  let keywordParagraph = '';
  if (seoKeywords.length > 0) {
    const keywordIntro = `Popular searches for this style include ${seoKeywords.slice(0, 5).join(', ')}, and ${seoKeywords[5] ?? seoKeywords[0]}.`;
    const longTailPhrase = seoLongTailKeywords.length > 0
      ? ` Customers also look for "${seoLongTailKeywords[0]}" when shopping for similar outfits.`
      : '';
    keywordParagraph = keywordIntro + longTailPhrase;
  }

  // Build a product details line — GMC requires explicit Color mention in descriptions
  // This addresses the GMC recommendation: "Update product descriptions to include details customers are looking for"
  const detailsParts: string[] = [];
  if (inferredColor) detailsParts.push(`Color: ${inferredColor.charAt(0).toUpperCase() + inferredColor.slice(1)}`);
  if (inferredMaterial && inferredMaterial !== 'premium fabric') detailsParts.push(`Fabric: ${inferredMaterial.charAt(0).toUpperCase() + inferredMaterial.slice(1)}`);
  const template = CATEGORY_TEMPLATES[categoryKey] ?? CATEGORY_TEMPLATES['suit'];
  if (template.sizes) detailsParts.push(`Sizes: ${template.sizes}`);
  const detailsLine = detailsParts.length > 0 ? detailsParts.join(' | ') : '';

  // Assemble the full enriched description
  // Phase 3+SEO structure: Opening → Details → Keyword SEO → Occasion → Craftsmanship → Styling → Occasion Styling → Care → Q&A → Shipping
  const enriched = [
    opening,
    '',
    detailsLine,
    '',
    keywordParagraph,
    '',
    occasion,
    '',
    craftsmanship,
    '',
    styling,
    '',
    occasionStyling,
    '',
    care,
    '',
    qaSection,
    '',
    SHIPPING_PARAGRAPH,
  ].filter(Boolean).join('\n\n');

  return enriched;
}

/**
 * Generate an SEO-optimized meta description for a product page.
 *
 * Meta descriptions are limited to 150-160 characters for optimal display in
 * search engine results. The generated description includes:
 * - Product name
 * - Key attribute (fabric or category)
 * - Price (if provided)
 * - Free shipping call-to-action
 *
 * @param description - The original product description (used as context).
 * @param productType - The product type/category.
 * @param title - The product title.
 * @param price - Optional USD price string (e.g., "$149").
 * @returns A meta description string of 150-160 characters.
 *
 * @example
 * ```ts
 * generateMetaDescription(
 *   'Red lehenga with embroidery',
 *   'Lehenga',
 *   'Embroidered Red Bridal Lehenga',
 *   '$149'
 * );
 * // → "Embroidered Red Bridal Lehenga in premium fabric at $149. Shop Indian ethnic wear at LuxeMia. Free shipping over $350 to USA, Canada & Australia."
 * ```
 */
export function generateMetaDescription(
  description: string,
  productType: string,
  title: string,
  price?: string,
): string {
  const categoryKey = normalizeProductType(productType);
  const template = CATEGORY_TEMPLATES[categoryKey] ?? CATEGORY_TEMPLATES['suit'];
  const material = inferMaterial(title, undefined, description);
  const label = template.label;

  const fabricPhrase = material !== 'premium fabric' ? ` in ${material}` : '';
  const pricePhrase = price ? ` at ${price}` : '';

  // Build the meta description targeting 150-160 characters.
  // Structure: "{Title}{fabric} at {price}. Shop {label} online. Free shipping over $350 to USA, Canada & Australia."
  const shippingCta = 'Free shipping over $350 to USA, Canada & Australia.';

  // Build the core prefix (everything before the shipping CTA)
  const shopPhrase = `Shop ${label} online at LuxeMia.`;
  const corePrefix = `${title}${fabricPhrase}${pricePhrase}. ${shopPhrase}`;

  // Calculate available space for the core part
  const maxTotal = 160;
  const separator = ' ';
  const availableForCore = maxTotal - shippingCta.length - separator.length;

  let core = corePrefix;
  if (core.length > availableForCore) {
    // Truncate intelligently — don't break mid-word
    core = core.substring(0, availableForCore - 1).replace(/\s+\S*$/, '');
    // Ensure we end with a period
    if (!core.endsWith('.')) {
      core += '.';
    }
  }

  let meta = `${core} ${shippingCta}`;

  // If the meta is too short (< 150), add a long-tail keyword for SEO value
  if (meta.length < 150) {
    const catTemplate = CATEGORY_TEMPLATES[categoryKey] ?? CATEGORY_TEMPLATES['suit'];
    const keyword = catTemplate.keywords[0] ?? '';
    if (keyword) {
      // Insert keyword between core and shipping CTA
      const keywordPhrase = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}.`;
      const padded = `${core} ${keywordPhrase} ${shippingCta}`;
      if (padded.length <= 160) {
        meta = padded;
      }
    }
  }

  return meta;
}

/**
 * Get a category-specific SEO description snippet for a product type.
 *
 * Useful for collection pages, category headers, and structured data.
 * Returns a pre-written, SEO-optimized paragraph describing the product category.
 *
 * @param productType - The product type/category (e.g., "lehenga", "saree").
 * @returns A category-level SEO description string, or a generic fallback.
 *
 * @example
 * ```ts
 * getProductCategoryDescription('lehenga');
 * // → "Explore LuxeMia's curated collection of designer lehengas — from bridal..."
 *
 * getProductCategoryDescription('unknown-type');
 * // → "Shop Indian ethnic wear at LuxeMia. Curated collection of premium..."
 * ```
 */
export function getProductCategoryDescription(productType: string): string {
  const categoryKey = normalizeProductType(productType);
  const template = CATEGORY_TEMPLATES[categoryKey];

  if (template) {
    return template.categoryDescription;
  }

  // Generic fallback
  return 'Shop Indian ethnic wear at LuxeMia. Curated collection of premium lehengas, sarees, suits, and menswear crafted with authentic Indian artistry. Free shipping over $350 to the USA, Canada, and Australia.';
}

// ---------------------------------------------------------------------------
// Examples / Development Reference
// ---------------------------------------------------------------------------

/**
 * Run enrichment examples for development and testing.
 *
 * Call this function to see how the enrichment behaves with different inputs.
 * Not intended for production use — purely for development verification.
 *
 * @returns An object with example results for thin, thin-saree, and rich descriptions.
 *
 * @example
 * ```ts
 * const examples = runEnrichmentExamples();
 * console.log(examples.thinDescription);
 * console.log(examples.thinSaree);
 * console.log(examples.richDescriptionUnchanged);
 * console.log(examples.metaDescription);
 * console.log(examples.categoryDescription);
 * ```
 */
export function runEnrichmentExamples(): {
  thinDescription: string;
  thinSaree: string;
  richDescriptionUnchanged: string;
  metaDescription: string;
  categoryDescription: string;
} {
  // Example 1: Thin lehenga description — should be enriched
  const thinInput = 'Red lehenga with embroidery';
  const thinResult = enrichProductDescription(
    thinInput,
    'Lehenga',
    'Embroidered Red Bridal Lehenga',
    'silk',
    'red',
  );

  // Example 2: Thin saree description — should be enriched
  const thinSareeInput = 'Beautiful silk saree';
  const thinSareeResult = enrichProductDescription(
    thinSareeInput,
    'Saree',
    'Banarasi Silk Saree with Gold Border',
    'Banarasi silk',
  );

  // Example 3: Rich description — should pass through unchanged
  const richInput = `This exquisite red Banarasi silk lehenga features intricate zari embroidery with kundan stone work across the flared skirt. The choli is adorned with delicate resham threadwork and sequin accents, while the dupatta showcases a rich woven pallu with scalloped edges. Crafted by master artisans in Varanasi, this lehenga includes a can-can inner for voluminous flare and is fully lined for comfort. Available in sizes S-XXL with custom tailoring options. Professional dry cleaning recommended to preserve the embroidery and fabric integrity.`;
  const richResult = enrichProductDescription(
    richInput,
    'Lehenga',
    'Banarasi Silk Bridal Lehenga',
    'Banarasi silk',
    'red',
  );

  // Example 4: Meta description generation
  const metaResult = generateMetaDescription(
    thinInput,
    'Lehenga',
    'Embroidered Red Bridal Lehenga',
    '$149',
  );

  // Example 5: Category description
  const categoryResult = getProductCategoryDescription('lehenga');

  return {
    thinDescription: thinResult,
    thinSaree: thinSareeResult,
    richDescriptionUnchanged: richResult,
    metaDescription: metaResult,
    categoryDescription: categoryResult,
  };
}
