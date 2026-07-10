/**
 * Category Configuration — single source of truth for subcategories,
 * filters, and metadata across all listing pages (Lehengas, Sarees,
 * Suits, Menswear).
 *
 * Modeled after kalkifashion.com's IA:
 * - Subcategories grouped by Occasion / Style / Color / Price / Audience
 * - Subcategory chips appear as horizontal pills above the product grid
 * - Filter sidebar uses color swatches (hex codes) instead of text checkboxes
 * - Filter values use tag-prefix matching (color:red, fabric:silk,
 *   occasion:wedding, role:bridesmaid) with fallback to substring match
 */

import type { ReactNode } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────

export type SubcategoryGroup =
  | 'occasion'
  | 'style'
  | 'price'
  | 'audience';

export interface Subcategory {
  /** URL slug used in ?sub=<slug> */
  slug: string;
  /** Display label on the chip */
  label: string;
  /** Grouping for the chip strip (chips grouped by group, separated by |) */
  group: SubcategoryGroup;
  /**
   * Tag values to match against product tags (case-insensitive).
   * Tag prefixes: occasion:<value>, style:<value>, color:<value>, role:<value>
   * Falls back to substring match on title if no tag match.
   */
  matchTags: string[];
  /** Optional price ceiling/floor for price-tier subcategories */
  priceMin?: number;
  priceMax?: number;
  /**
   * Optional Shopify productType values that map to this subcategory
   * (e.g. 'Bridal Lehenga' → Bridal). Useful when productType is more reliable
   * than tags or titles.
   */
  matchProductType?: string[];
  /**
   * Optional keywords to match against product description (left word-boundary,
   * so 'reception' matches 'receptions'). Used by occasion subcategories where
   * title-only matching is insufficient (e.g. Sarees Party Wear).
   */
  descriptionKeywords?: string[];
  /**
   * Optional SEO override — when this subcategory is active, the category page
   * uses these instead of the parent CategoryConfig SEO fields.
   * Falls back to the parent config if undefined.
   */
  seoTitle?: string;
  seoDescription?: string;
  /** Optional canonical URL override (defaults to <config.canonical>?sub=<slug>) */
  seoCanonical?: string;
}

export interface FilterOption {
  /** Tag-prefix value used for matching (e.g. 'red' → matches tag 'color:red' OR 'red') */
  value: string;
  /** Display label */
  label: string;
  /** Hex color for swatches (color filters only) */
  hex?: string;
}

export interface FilterSection {
  name: string;
  /** Tag prefix used for matching — 'color', 'fabric', 'occasion', 'style', 'work', 'size', 'availability' */
  tagPrefix?: string;
  options: FilterOption[];
  /** Default expanded in sidebar */
  defaultExpanded?: boolean;
  /** Render as color swatches instead of checkboxes */
  renderAsSwatches?: boolean;
}

export interface CategoryConfig {
  /** URL slug: 'lehengas' | 'sarees' | 'suits' | 'menswear' */
  slug: string;
  /** Display name */
  name: string;
  /** Hero banner image path */
  heroImage: string;
  heroImageWebp?: string;
  heroTitle: string;
  heroSubtitle: string;
  /** SEO metadata */
  seoTitle: string;
  seoDescription: string;
  canonical: string;
  ogImage: string;
  /** Breadcrumbs to display */
  breadcrumbs: Array<{ name: string; url: string }>;
  /** Subcategories for chip strip */
  subcategories: Subcategory[];
  /** Filter sections for sidebar */
  filters: FilterSection[];
  /** Price slider range [min, max] and step */
  priceRange: [number, number];
  priceStep: number;
  /** FAQs for rich snippets + on-page SEO block */
  faqs: Array<{ question: string; answer: string }>;
  /** Optional editorial content block below the grid */
  editorialTitle?: string;
  editorialContent?: ReactNode;
}

// ─── Color swatch hex codes ────────────────────────────────────────────────
const COLORS: Record<string, string> = {
  Red: '#C8102E',
  Maroon: '#800000',
  Wine: '#722F37',
  Burgundy: '#800020',
  Pink: '#FFC0CB',
  'Hot Pink': '#FF69B4',
  Rose: '#E0218A',
  'Pastel Pink': '#FFD1DC',
  Rani: '#DE3163',
  Blue: '#1E40AF',
  'Royal Blue': '#4169E1',
  'Navy Blue': '#1E3A8A',
  'Sky Blue': '#87CEEB',
  Teal: '#008080',
  Green: '#2E7D32',
  'Emerald Green': '#046307',
  Sage: '#9CAF88',
  'Olive Green': '#808000',
  Purple: '#7B2CBF',
  Lavender: '#E6E6FA',
  Mauve: '#E0B0FF',
  Gold: '#D4AF37',
  Yellow: '#FBBF24',
  Orange: '#F97316',
  Coral: '#FF7F50',
  Peach: '#FFCBA4',
  Champagne: '#F7E7CE',
  Cream: '#FFFDD0',
  Ivory: '#FFFFF0',
  Beige: '#F5F5DC',
  White: '#FFFFFF',
  Black: '#000000',
  Grey: '#808080',
  Silver: '#C0C0C0',
  Brown: '#8B4513',
  Pastel: '#F5E6E8',
};

function colors(...names: string[]): FilterOption[] {
  return names.map(name => ({ value: name.toLowerCase(), label: name, hex: COLORS[name] }));
}

// ─── Shared subcategory builders ───────────────────────────────────────────

function occasionSub(
  slug: string,
  label: string,
  matchTags: string[],
  opts: {
    matchProductType?: string[];
    descriptionKeywords?: string[];
    seoTitle?: string;
    seoDescription?: string;
    seoCanonical?: string;
  } = {}
): Subcategory {
  return { slug, label, group: 'occasion', matchTags, ...opts };
}

function styleSub(slug: string, label: string, matchTags: string[]): Subcategory {
  return { slug, label, group: 'style', matchTags };
}

function priceSub(slug: string, label: string, priceMin: number, priceMax: number): Subcategory {
  return { slug, label, group: 'price', matchTags: [], priceMin, priceMax };
}

function audienceSub(slug: string, label: string, matchTags: string[]): Subcategory {
  return { slug, label, group: 'audience', matchTags };
}

// ─── Lehengas ──────────────────────────────────────────────────────────────

const LEHENGAS: CategoryConfig = {
  slug: 'lehengas',
  name: 'Lehengas',
  heroImage: '/images/banners/lehenga-banner.jpg',
  heroImageWebp: '/images/banners/lehenga-banner.webp',
  heroTitle: 'Lehengas',
  heroSubtitle: 'Bridal lehengas, festive lehenga cholis, and contemporary designs for your special moments.',
  seoTitle: 'Buy Bridal Lehengas Online | Wedding & Festive Lehenga Choli - LuxeMia',
  seoDescription: 'Buy bridal lehengas online at LuxeMia. Shop wedding lehenga choli, festive lehengas & party wear in silk, net & velvet. Custom sizing available. Free shipping to USA & Canada.',
  canonical: 'https://luxemia.shop/lehengas',
  ogImage: '/og/og-lehengas.jpg',
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
    { name: 'Lehengas', url: '/lehengas' },
  ],
  subcategories: [
    // By Occasion (simplified — 3 main occasions)
    occasionSub('bridal', 'Bridal', ['occasion:bridal', 'bridal'], {
      matchProductType: ['Bridal Lehenga', 'Bridal Lehengas', 'Bridal Lehenga Choli'],
      seoTitle: 'Bridal Lehengas Online USA | Red & Maroon Wedding Lehengas - LuxeMia',
      seoDescription: 'Shop bridal lehengas for the Indian bride in USA. Red, maroon, and ivory wedding lehengas with zardozi, zari, and embroidery. Custom sizing, 5-day express delivery, free shipping over $350.',
      seoCanonical: 'https://luxemia.shop/lehengas?sub=bridal',
    }),
    occasionSub('wedding-guest', 'Wedding Guest', ['occasion:wedding', 'wedding', 'guest'], {
      seoTitle: 'Wedding Guest Lehengas & Bridesmaid Lehengas Online | LuxeMia',
      seoDescription: 'Shop wedding guest lehengas and bridesmaid lehengas online. Coordinated bridal party looks in georgette, chiffon, and banarasi brocade. Ready to ship from USA, custom fit available.',
      seoCanonical: 'https://luxemia.shop/lehengas?sub=wedding-guest',
    }),
    occasionSub('reception', 'Reception', ['occasion:reception', 'reception'], {
      seoTitle: 'Reception Lehengas for Brides | Cocktail & Evening Lehengas - LuxeMia',
      seoDescription: 'Shop reception lehengas for the bride\'s evening event. Non-bridal colors (blue, green, pink, wine) with heavy embroidery and beadwork. Custom sizing, express delivery to USA & Canada.',
      seoCanonical: 'https://luxemia.shop/lehengas?sub=reception',
    }),
    occasionSub('party-wear', 'Party Wear', ['occasion:party', 'party wear', 'party', 'festive'], {
      seoTitle: 'Party Wear Lehengas & Festive Lehenga Choli Online | LuxeMia',
      seoDescription: 'Shop party wear lehengas and festive lehenga cholis for cocktails, sangeet, and Diwali. Net, georgette, and velvet with sequins, mirror, and beadwork. Ready to ship from USA.',
      seoCanonical: 'https://luxemia.shop/lehengas?sub=party-wear',
    }),
    // By Fabric (simplified — 4 main fabrics)
    styleSub('silk', 'Silk', ['fabric:silk', 'silk', 'raw silk', 'art silk']),
    styleSub('velvet', 'Velvet', ['fabric:velvet', 'velvet']),
    styleSub('georgette', 'Georgette', ['fabric:georgette', 'georgette']),
    styleSub('net', 'Net', ['fabric:net', 'net']),
    // By Price (2 tiers)
    priceSub('under-200', 'Under $200', 0, 200),
    priceSub('premium-300-plus', 'Premium $300+', 300, 10000),
  ],
  filters: [
    {
      name: 'Fabric',
      tagPrefix: 'fabric',
      defaultExpanded: true,
      options: [
        { value: 'silk', label: 'Silk' },
        { value: 'raw silk', label: 'Raw Silk' },
        { value: 'georgette', label: 'Georgette' },
        { value: 'net', label: 'Net' },
        { value: 'organza', label: 'Organza' },
        { value: 'velvet', label: 'Velvet' },
        { value: 'chinon', label: 'Chinon' },
        { value: 'brocade', label: 'Brocade' },
        { value: 'satin', label: 'Satin' },
      ],
    },
    {
      name: 'Color',
      tagPrefix: 'color',
      defaultExpanded: true,
      renderAsSwatches: true,
      options: colors('Red', 'Pink', 'Maroon', 'Wine', 'Green', 'Blue', 'Purple', 'Gold', 'Ivory', 'Black', 'Cream', 'Pastel'),
    },
    {
      name: 'Work',
      tagPrefix: 'work',
      defaultExpanded: false,
      options: [
        { value: 'zardozi', label: 'Zardozi' },
        { value: 'sequence', label: 'Sequence Work' },
        { value: 'resham', label: 'Resham Thread' },
        { value: 'mirror', label: 'Mirror Work' },
        { value: 'zari', label: 'Zari' },
        { value: 'embroidery', label: 'Embroidery' },
        { value: 'stone', label: 'Stone Setting' },
        { value: 'cutdana', label: 'Cutdana' },
      ],
    },
    {
      name: 'Size',
      tagPrefix: 'size',
      defaultExpanded: false,
      options: [
        { value: 's', label: 'S' },
        { value: 'm', label: 'M' },
        { value: 'l', label: 'L' },
        { value: 'xl', label: 'XL' },
        { value: 'xxl', label: 'XXL' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      name: 'Availability',
      tagPrefix: 'availability',
      defaultExpanded: false,
      options: [
        { value: 'ready to ship', label: 'Ready to Ship' },
        { value: 'made to order', label: 'Made to Order' },
      ],
    },
  ],
  priceRange: [0, 2000],
  priceStep: 50,
  faqs: [
    {
      question: "What types of lehengas are available at LuxeMia?",
      answer: "LuxeMia offers bridal lehengas, reception lehengas, festive lehengas, and party wear in various fabrics including Net, Silk, Velvet, Georgette, Chinnon, and Roman Silk. Each piece features embroidery, sequins, zari, or mirror work."
    },
    {
      question: "How do I find the right lehenga size?",
      answer: "We offer sizes S, M, L, XL, XXL, and Custom sizing. For bridal lehengas, we highly recommend custom sizing for a perfect fit. Provide your bust, waist, hip, and height measurements, and our team will prepare your lehenga to your measurements."
    },
    {
      question: "What is included in a lehenga set?",
      answer: "Every LuxeMia lehenga set includes the lehenga skirt, matching choli (blouse), and dupatta. Bridal sets often include additional accessories like cancan for volume and a matching potli bag."
    },
    {
      question: "How long does it take to receive a bridal lehenga?",
      answer: "Ready-to-ship lehengas dispatch in 3-5 business days, with standard delivery (USPS/UPS) taking 7-10 business days transit or express (DHL) taking 3-5 business days transit. Custom/alteration orders dispatch in 5-7 business days. We recommend ordering bridal wear at least 6-8 weeks before your wedding."
    },
    {
      question: "Can I customize the color of my lehenga?",
      answer: "Yes! Most of our lehengas can be customized in different colors. Contact our styling team with your color preferences, and we'll confirm availability and any additional timeline requirements."
    }
  ],
  // SEO editorial content (Item #14) — keyword-rich copy below the product grid
  editorialTitle: 'Buy Lehengas Online in the USA — Bridal, Wedding Guest & Festive',
  editorialContent: (
    <>
      <p>
        Shop the finest collection of <strong>lehengas online</strong> at LuxeMia, your destination for
        authentic Indian ethnic wear shipped to the USA, Canada, and Australia. Our curated catalog includes
        <strong> bridal lehengas</strong>, wedding guest lehengas, festive lehengas for Diwali and Navratri,
        and party wear lehengas for every celebration. Each piece is sourced directly from India's textile
        hubs and quality-inspected before shipping.
      </p>

      <h3>Bridal Lehengas for the Modern NRI Bride</h3>
      <p>
        Your wedding day deserves a lehenga as special as the occasion. Our <strong>bridal lehenga collection</strong>
        features hand-embroidered designs in net, silk, velvet, georgette, and raw silk — with zardozi,
        sequin, zari, mirror, and thread work. Choose from traditional reds and maroons or modern pastels
        and ivories. Every bridal lehenga includes the skirt, choli (blouse), and dupatta, with complimentary
        custom tailoring for the perfect fit.
      </p>

      <h3>Wedding Guest Lehengas</h3>
      <p>
        Attending an Indian wedding? Our wedding guest lehengas are designed to make you look elegant without
        upstaging the bride. Choose from royal blue, emerald green, dusty rose, wine, and champagne — colors
        that photograph beautifully and suit every skin tone. Lightweight fabrics like georgette and net keep
        you comfortable through long ceremonies.
      </p>

      <h3>Festival &amp; Party Wear Lehengas</h3>
      <p>
        Celebrate Diwali, Navratri, Eid, and Karva Chauth in style. Our festive lehenga collection features
        vibrant colors, mirror work, and gota patti detailing — perfect for dancing the night away. For
        cocktail parties and receptions, explore our sequin and embellished lehengas in ivory, champagne,
        and jewel tones.
      </p>

      <h3>Custom Tailoring &amp; Sizing</h3>
      <p>
        Every lehenga at LuxeMia can be custom-tailored to your exact measurements. We offer sizes S through
        XXL plus made-to-measure options — simply send us your bust, waist, hip, and height measurements
        and our master tailors will stitch the perfect fit. See our <a href="/size-guide">size guide</a> for
        measuring instructions.
      </p>

      <h3>Shipping to USA, Canada &amp; Australia</h3>
      <p>
        Free shipping on lehenga orders over $350 to the USA, Canada, and Australia. Ready-to-ship lehengas
        dispatch in 3-5 business days; custom-tailored lehengas dispatch in 5-7 business days. Delivery via
        DHL Express (3-5 business days) or USPS/UPS (7-10 business days) with full tracking and insurance.
        See our <a href="/shipping">shipping policy</a> for details.
      </p>
    </>
  ),
};

// ─── Sarees ────────────────────────────────────────────────────────────────

const SAREES: CategoryConfig = {
  slug: 'sarees',
  name: 'Sarees',
  heroImage: '/images/banners/saree-banner.jpg',
  heroImageWebp: '/images/banners/saree-banner.webp',
  heroTitle: 'Sarees',
  heroSubtitle: 'Silk, designer, and bridal sarees for every celebration — Banarasi, Kanjeevaram, and modern drapes.',
  seoTitle: 'Sarees Collection | Silk & Bridal Sarees Online | LuxeMia',
  seoDescription: 'Shop beautiful silk sarees, bridal sarees, and designer sarees at LuxeMia. Banarasi, Kanchipuram, and georgette sarees. Free shipping over $350 to USA, Canada & Australia.',
  canonical: 'https://luxemia.shop/sarees',
  ogImage: '/og/og-sarees.jpg',
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
    { name: 'Sarees', url: '/sarees' },
  ],
  subcategories: [
    // By Occasion — Sarees-specific mapping (see productFilters.ts matchSubcategory)
    //
    // Sarees have 'wedding' baked into nearly every title due to CSV import
    // (e.g. 'Yellow Viscose Silk Wedding Saree'), so title-word matching on
    // 'wedding' would put every saree in the Wedding subcategory. We removed
    // the Wedding subcategory entirely and use tag + description signals instead.
    //
    // Bridal: role:bride tag, occasion:bridal tag, 'bridal' bare tag (only if
    // NOT role:bridesmaid), title 'bridal' word, OR description 'bridal' word
    // (excluding 'bridal party'/'bridal parties' which refers to bridesmaids).
    //
    // Wedding Guest: role:bridesmaid tag, occasion:wedding-guest tag, OR title
    // 'wedding guest'/'bridesmaid' word.
    //
    // Party Wear: occasion:party-wear / occasion:reception / occasion:festival
    // tag, OR title party/reception/cocktail/festive word, OR description
    // containing party-wear keywords (reception, cocktail, party, pre-draped,
    // saree gown, ready-to-wear, casual wear, festival wear, festive).
    occasionSub('bridal', 'Bridal', ['occasion:bridal', 'bridal'], {
      matchProductType: ['Bridal Saree'],
      seoTitle: 'Bridal Sarees for Indian Brides in USA | Silk & Kanjeevaram - LuxeMia',
      seoDescription: 'Shop bridal sarees for Indian brides in USA. Silk, Kanjeevaram, and Banarasi bridal sarees with zari and embroidery. Custom stitching, 5-day express delivery, free shipping over $350.',
      seoCanonical: 'https://luxemia.shop/sarees?sub=bridal',
    }),
    occasionSub('wedding-guest', 'Wedding Guest', ['occasion:wedding-guest', 'wedding guest', 'bridesmaid', 'role:bridesmaid'], {
      seoTitle: 'Wedding Guest Sarees & Bridesmaid Sarees Online | LuxeMia',
      seoDescription: 'Shop elegant wedding guest sarees and bridesmaid sarees online. Coordinated bridal party looks in georgette, chiffon, and banarasi brocade. Ready to ship, custom fit available.',
      seoCanonical: 'https://luxemia.shop/sarees?sub=wedding-guest',
    }),
    occasionSub('party-wear', 'Party Wear', ['occasion:party', 'occasion:reception', 'occasion:festival', 'party wear', 'party', 'reception', 'festive', 'cocktail'], {
      matchProductType: ['Party Wear Saree', 'Designer Saree', 'Fancy Saree', 'Pre-Draped Saree', 'Saree Gown'],
      descriptionKeywords: [
        'reception', 'cocktail', 'party', 'parties',
        'pre-draped', 'pre draped', 'saree gown',
        'ready to wear', 'ready-to-wear',
        'casual wear', 'festival wear', 'festival',
        'festive', 'occasionwear',
      ],
      seoTitle: 'Party Wear Sarees & Reception Sarees Online | Designer Drapes - LuxeMia',
      seoDescription: 'Shop party wear sarees, reception sarees, and pre-draped designer sarees. Sequins, beads, and zari work for cocktails, receptions, and festive celebrations. Ready to ship from USA.',
      seoCanonical: 'https://luxemia.shop/sarees?sub=party-wear',
    }),
    // By Fabric (simplified — 4 main fabrics)
    styleSub('silk', 'Silk', ['fabric:silk', 'silk', 'banarasi', 'kanchipuram', 'kanjeevaram']),
    styleSub('georgette', 'Georgette', ['fabric:georgette', 'georgette']),
    styleSub('chiffon', 'Chiffon', ['fabric:chiffon', 'chiffon']),
    styleSub('organza', 'Organza', ['fabric:organza', 'organza']),
    // By Price (2 tiers)
    priceSub('under-200', 'Under $200', 0, 200),
    priceSub('premium-300-plus', 'Premium $300+', 300, 10000),
  ],
  filters: [
    {
      name: 'Fabric',
      tagPrefix: 'fabric',
      defaultExpanded: true,
      options: [
        { value: 'silk', label: 'Silk' },
        { value: 'banarasi', label: 'Banarasi Silk' },
        { value: 'kanjeevaram', label: 'Kanjeevaram Silk' },
        { value: 'georgette', label: 'Georgette' },
        { value: 'chiffon', label: 'Chiffon' },
        { value: 'organza', label: 'Organza' },
        { value: 'net', label: 'Net' },
        { value: 'cotton', label: 'Cotton' },
      ],
    },
    {
      name: 'Color',
      tagPrefix: 'color',
      defaultExpanded: true,
      renderAsSwatches: true,
      options: colors('Red', 'Maroon', 'Pink', 'Blue', 'Green', 'Purple', 'Gold', 'Ivory', 'Black', 'Pastel'),
    },
    {
      name: 'Work',
      tagPrefix: 'work',
      defaultExpanded: false,
      options: [
        { value: 'zari', label: 'Zari' },
        { value: 'embroidery', label: 'Embroidery' },
        { value: 'sequence', label: 'Sequence' },
        { value: 'printed', label: 'Printed' },
        { value: 'mirror', label: 'Mirror Work' },
        { value: 'stone', label: 'Stone Setting' },
      ],
    },
    {
      name: 'Size',
      tagPrefix: 'size',
      defaultExpanded: false,
      options: [
        { value: 'free size', label: 'Free Size' },
        { value: 'custom', label: 'Custom Stitched' },
      ],
    },
    {
      name: 'Availability',
      tagPrefix: 'availability',
      defaultExpanded: false,
      options: [
        { value: 'ready to ship', label: 'Ready to Ship' },
        { value: 'made to order', label: 'Made to Order' },
      ],
    },
  ],
  priceRange: [0, 1500],
  priceStep: 25,
  faqs: [
    {
      question: "What types of sarees are available at LuxeMia?",
      answer: "LuxeMia offers silk sarees (Banarasi, Kanjeevaram), bridal sarees, designer sarees, georgette sarees, and printed sarees for every occasion including weddings, receptions, and festive celebrations."
    },
    {
      question: "Do your sarees come with a blouse?",
      answer: "Most of our sarees come with an unstitched blouse piece. Some premium and designer sarees include a stitched blouse. Check the product description for details, or contact us for blouse stitching options."
    },
    {
      question: "Can I get a saree pre-draped?",
      answer: "Yes! We offer pre-draped saree options for select designs. This is perfect for NRI customers who want the convenience of slipping into a saree without the complexity of draping. Contact us to confirm availability."
    },
    {
      question: "How should I care for my silk saree?",
      answer: "Dry clean only for silk sarees. Store in a cool, dry place wrapped in muslin cloth. Avoid direct sunlight and never iron directly on zari or embroidery. Refold the saree every 3-4 months to prevent creasing along the same lines."
    },
    {
      question: "Do you ship sarees to USA, Canada, and Australia?",
      answer: "Yes, we ship worldwide with free shipping on orders over $350. Standard delivery takes 7-10 business days via USPS/UPS, or 3-5 business days via DHL Express."
    }
  ],
  // SEO editorial content (Item #14)
  editorialTitle: 'Buy Sarees Online — Silk, Bridal & Designer Sarees Shipped to USA',
  editorialContent: (
    <>
      <p>
        Discover an exquisite collection of <strong>sarees online</strong> at LuxeMia. We offer
        <strong> silk sarees</strong>, bridal sarees, designer sarees, and festive sarees — all sourced
        directly from India's textile hubs in Varanasi, Kanchipuram, and Surat. Whether you are a bride,
        a wedding guest, or celebrating Diwali, our saree collection has the perfect drape for every occasion.
        Free shipping to the USA, Canada, and Australia on orders over $350.
      </p>

      <h3>Silk Sarees — Banarasi, Kanjivaram &amp; More</h3>
      <p>
        Our <strong>pure silk saree collection</strong> includes Banarasi silk from Varanasi, Kanjivaram silk
        from Kanchipuram, and art silk sarees at affordable prices. Each silk saree features real zari work,
        handwoven borders, and traditional motifs. Shop <a href="/sarees?sub=bridal">bridal silk sarees</a> for
        your wedding or <a href="/sarees?sub=wedding-guest">wedding guest silk sarees</a> for the next
        celebration you attend.
      </p>

      <h3>Bridal Sarees for the Traditional Bride</h3>
      <p>
        For South Indian and Bengali brides, the saree is the wedding dress of choice. Our bridal saree
        collection features red and gold Kanjivarams, heavy Banarasi brocades, and contemporary designer
        sarees. Every bridal saree can be paired with custom blouse stitching and matching jewelry for a
        complete bridal look.
      </p>

      <h3>Wedding Guest &amp; Festive Sarees</h3>
      <p>
        Attending an Indian wedding? Choose from our wedding guest sarees in royal blue, emerald green,
        magenta, and wine — colors that celebrate without overshadowing the bride. For Diwali and Navratri,
        explore our festive sarees with mirror work, gota patti, and sequin embellishments.
      </p>

      <h3>Ready-to-Wear &amp; Pre-Stitched Sarees</h3>
      <p>
        New to saree draping? Our <strong>ready-to-wear sarees</strong> (also called pre-stitched or
        lehenga sarees) give you the look of a saree with the ease of a skirt. Slip it on and go — no
        draping required. Perfect for beginners and for events where you want to look elegant without
        the hassle.
      </p>

      <h3>Custom Blouse Stitching</h3>
      <p>
        Every saree deserves a perfectly fitted blouse. LuxeMia offers custom blouse stitching with your
        choice of neckline, sleeve length, and back design. Send us your measurements and we will tailor
        a blouse that fits like a glove. See our <a href="/sizing-measurements-guide">measurement guide</a> for details.
      </p>
    </>
  ),
};

// ─── Suits / Salwar Kameez ─────────────────────────────────────────────────

const SUITS: CategoryConfig = {
  slug: 'suits',
  name: 'Salwar Kameez & Suits',
  heroImage: '/images/banners/suit-banner.jpg',
  heroImageWebp: '/images/banners/suit-banner.webp',
  heroTitle: 'Salwar Kameez & Suits',
  heroSubtitle: 'Anarkali, sharara, palazzo, and Pakistani suits — handcrafted for festive and wedding celebrations.',
  seoTitle: 'Salwar Kameez & Suits | Anarkali & Palazzo Suits Online | LuxeMia',
  seoDescription: 'Shop elegant salwar kameez, anarkali suits, palazzo suits, and sharara sets at LuxeMia. Pakistani suits and designer suits. Free shipping over $350 to USA, Canada & Australia.',
  canonical: 'https://luxemia.shop/suits',
  ogImage: '/og/og-suits.jpg',
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
    { name: 'Salwar Kameez', url: '/suits' },
  ],
  subcategories: [
    // By Style (simplified — 5 main styles)
    styleSub('anarkali', 'Anarkali', ['style:anarkali', 'anarkali']),
    styleSub('sharara', 'Sharara', ['style:sharara', 'sharara']),
    styleSub('palazzo', 'Palazzo', ['style:palazzo', 'palazzo']),
    // By Fabric (simplified)
    styleSub('georgette-suit', 'Georgette', ['fabric:georgette', 'georgette']),
    styleSub('silk-suit', 'Silk', ['fabric:silk', 'silk']),
    styleSub('cotton-suit', 'Cotton', ['fabric:cotton', 'cotton']),
    // By Occasion (simplified — 3 main)
    occasionSub('wedding', 'Wedding', ['occasion:wedding', 'wedding']),
    occasionSub('party-wear', 'Party Wear', ['occasion:party', 'party wear', 'party', 'festive']),
    occasionSub('casual', 'Casual', ['occasion:casual', 'casual', 'everyday']),
    // By Price (2 tiers)
    priceSub('under-200', 'Under $200', 0, 200),
    priceSub('premium-300-plus', 'Premium $300+', 300, 10000),
  ],
  filters: [
    {
      name: 'Style',
      tagPrefix: 'style',
      defaultExpanded: true,
      options: [
        { value: 'anarkali', label: 'Anarkali' },
        { value: 'sharara', label: 'Sharara' },
        { value: 'palazzo', label: 'Palazzo' },
        { value: 'pakistani', label: 'Pakistani' },
        { value: 'straight', label: 'Straight Cut' },
      ],
    },
    {
      name: 'Fabric',
      tagPrefix: 'fabric',
      defaultExpanded: true,
      options: [
        { value: 'georgette', label: 'Georgette' },
        { value: 'chinon', label: 'Chinon' },
        { value: 'silk', label: 'Silk' },
        { value: 'net', label: 'Net' },
        { value: 'cotton', label: 'Cotton' },
        { value: 'velvet', label: 'Velvet' },
      ],
    },
    {
      name: 'Color',
      tagPrefix: 'color',
      defaultExpanded: true,
      renderAsSwatches: true,
      options: colors('Pink', 'Red', 'Green', 'Blue', 'Purple', 'Maroon', 'Black', 'Cream', 'Gold', 'Pastel'),
    },
    {
      name: 'Work',
      tagPrefix: 'work',
      defaultExpanded: false,
      options: [
        { value: 'embroidery', label: 'Embroidery' },
        { value: 'sequence', label: 'Sequence' },
        { value: 'zari', label: 'Zari' },
        { value: 'mirror', label: 'Mirror Work' },
        { value: 'printed', label: 'Printed' },
      ],
    },
    {
      name: 'Size',
      tagPrefix: 'size',
      defaultExpanded: false,
      options: [
        { value: 's', label: 'S' },
        { value: 'm', label: 'M' },
        { value: 'l', label: 'L' },
        { value: 'xl', label: 'XL' },
        { value: 'xxl', label: 'XXL' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      name: 'Availability',
      tagPrefix: 'availability',
      defaultExpanded: false,
      options: [
        { value: 'ready to ship', label: 'Ready to Ship' },
        { value: 'made to order', label: 'Made to Order' },
      ],
    },
  ],
  priceRange: [0, 800],
  priceStep: 25,
  faqs: [
    {
      question: "What types of salwar kameez and suits are available at LuxeMia?",
      answer: "LuxeMia offers anarkali suits, sharara sets, palazzo suits, Pakistani suits, and straight-cut salwar kameez in fabrics including georgette, chinon, silk, cotton, velvet, and net. Each piece is handcrafted with embroidery, sequence, zari, or mirror work."
    },
    {
      question: "What is the difference between anarkali and sharara suits?",
      answer: "Anarkali suits feature a long, flowing kurta with a fitted bodice and flared skirt — inspired by Mughal-era silhouette. Sharara suits have wide-legged flared pants paired with a short kurti. Both are popular for weddings and festive occasions."
    },
    {
      question: "Are Pakistani suits available?",
      answer: "Yes, we offer a curated selection of Pakistani-style suits known for their elegant straight cuts, intricate embroidery, and modern aesthetic. These are perfect for NRI customers looking for contemporary ethnic wear."
    },
    {
      question: "Do you offer custom tailoring for suits?",
      answer: "Yes, we offer complimentary custom tailoring on most suits. Provide your bust, waist, hip, and length measurements, and our team will tailor the suit to your specifications. Custom orders dispatch in 5-7 business days."
    },
    {
      question: "How do I care for my salwar kameez?",
      answer: "Dry cleaning is recommended for embroidered, sequined, or zari work suits. For cotton and everyday suits, hand wash in cold water with mild detergent. Always iron on reverse side over embroidery. Store in a cool, dry place."
    }
  ],
  // SEO editorial content (Item #14)
  editorialTitle: 'Buy Salwar Kameez &amp; Anarkali Suits Online — USA Shipping',
  editorialContent: (
    <>
      <p>
        Shop beautiful <strong>salwar kameez online</strong> at LuxeMia. Our collection includes anarkali suits,
        palazzo sets, sharara suits, and traditional salwar kameez in georgette, silk, cotton, and chinon
        fabrics. Whether you are attending a wedding, celebrating Eid, or looking for everyday ethnic wear,
        we have the perfect suit for you — shipped to the USA, Canada, and Australia with free shipping over $350.
      </p>

      <h3>Anarkali Suits — Elegant &amp; Flattering</h3>
      <p>
        <strong>Anarkali suits</strong> are floor-length, frock-style kameez paired with slim churidar pants.
        They flatter every body type and are perfect for weddings, sangeet ceremonies, and festive events.
        Our anarkali collection features embroidery, sequin work, and gota patti detailing in both traditional
        and contemporary designs.
      </p>

      <h3>Palazzo Sets — Modern &amp; Comfortable</h3>
      <p>
        <strong>Palazzo sets</strong> pair a kurti with wide-leg palazzo pants for a modern, comfortable look.
        Perfect for daytime events, office Diwali parties, and casual ethnic wear. Choose from cotton palazzo
        sets for everyday or silk palazzo sets for festive occasions.
      </p>

      <h3>Sharara Suits — Festive &amp; Traditional</h3>
      <p>
        <strong>Sharara suits</strong> feature wide-flared pants that look like a lehenga, paired with a short
        kurti and dupatta. A popular choice for mehendi ceremonies and Eid celebrations, sharara suits combine
        the elegance of a lehenga with the comfort of a salwar kameez.
      </p>

      <h3>Wedding Guest &amp; Festive Salwar Kameez</h3>
      <p>
        Attending an Indian wedding? A well-chosen salwar kameez is comfortable, elegant, and appropriate for
        every ceremony. For mehendi and haldi, choose cotton or georgette suits in bright colors. For sangeet
        and reception, go for embroidered anarkalis in silk or chinon. Browse our
        <a href="/collections/wedding-guest-outfits">wedding guest collection</a> for curated options.
      </p>

      <h3>Custom Tailoring for the Perfect Fit</h3>
      <p>
        Every salwar kameez at LuxeMia can be custom-tailored to your measurements. Choose your kameez length,
        neckline, sleeve style, and bottom type — we will stitch it to your exact specifications. See our
        <a href="/sizing-measurements-guide">measurement guide</a> for instructions on how to measure yourself.
      </p>
    </>
  ),
};

// ─── Menswear ──────────────────────────────────────────────────────────────

const MENSWEAR: CategoryConfig = {
  slug: 'menswear',
  name: 'Menswear',
  heroImage: '/images/banners/menswear-banner.jpg',
  heroImageWebp: '/images/banners/menswear-banner.webp',
  heroTitle: 'Menswear',
  heroSubtitle: 'Sherwanis, kurta pajama sets, Modi jackets, and indo-western menswear for the modern groom.',
  seoTitle: 'Menswear | Sherwanis & Kurta Pajama Sets Online | LuxeMia',
  seoDescription: 'Shop premium sherwanis, kurta pajama sets, and indo-western menswear at LuxeMia. Wedding and festive collection. Free shipping over $350 to USA, Canada & Australia.',
  canonical: 'https://luxemia.shop/menswear',
  ogImage: '/og/og-menswear.jpg',
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
    { name: 'Menswear', url: '/menswear' },
  ],
  subcategories: [
    // By Style (simplified — 3 main styles)
    styleSub('sherwani', 'Sherwani', ['style:sherwani', 'sherwani']),
    styleSub('kurta-pajama', 'Kurta Pajama', ['style:kurta', 'kurta', 'kurta pajama']),
    styleSub('indo-western', 'Indo-Western', ['style:indo western', 'indo-western', 'indo western']),
    // By Fabric (simplified)
    styleSub('silk-menswear', 'Silk', ['fabric:silk', 'silk', 'raw silk', 'art silk']),
    styleSub('velvet-menswear', 'Velvet', ['fabric:velvet', 'velvet']),
    styleSub('cotton-menswear', 'Cotton', ['fabric:cotton', 'cotton']),
    // By Occasion (simplified — 2 main)
    occasionSub('wedding', 'Wedding', ['occasion:wedding', 'wedding']),
    occasionSub('festive', 'Festive', ['occasion:festive', 'festive', 'reception', 'party', 'engagement']),
    // By Price (2 tiers)
    priceSub('under-200', 'Under $200', 0, 200),
    priceSub('premium-300-plus', 'Premium $300+', 300, 10000),
  ],
  filters: [
    {
      name: 'Style',
      tagPrefix: 'style',
      defaultExpanded: true,
      options: [
        { value: 'sherwani', label: 'Sherwani' },
        { value: 'kurta pajama', label: 'Kurta Pajama' },
        { value: 'modi jacket', label: 'Modi Jacket' },
        { value: 'indo western', label: 'Indo Western' },
        { value: 'bandhgala', label: 'Bandhgala' },
      ],
    },
    {
      name: 'Fabric',
      tagPrefix: 'fabric',
      defaultExpanded: true,
      options: [
        { value: 'silk', label: 'Silk' },
        { value: 'raw silk', label: 'Raw Silk' },
        { value: 'jacquard', label: 'Jacquard' },
        { value: 'velvet', label: 'Velvet' },
        { value: 'cotton', label: 'Cotton' },
        { value: 'brocade', label: 'Brocade' },
      ],
    },
    {
      name: 'Color',
      tagPrefix: 'color',
      defaultExpanded: true,
      renderAsSwatches: true,
      options: colors('Cream', 'Beige', 'Gold', 'Black', 'Navy Blue', 'Maroon', 'Wine', 'Ivory', 'Grey', 'Royal Blue'),
    },
    {
      name: 'Work',
      tagPrefix: 'work',
      defaultExpanded: false,
      options: [
        { value: 'zardozi', label: 'Zardozi' },
        { value: 'sequence', label: 'Sequence' },
        { value: 'resham', label: 'Resham Thread' },
        { value: 'embroidery', label: 'Embroidery' },
        { value: 'printed', label: 'Printed' },
      ],
    },
    {
      name: 'Size',
      tagPrefix: 'size',
      defaultExpanded: false,
      options: [
        { value: '38', label: '38' },
        { value: '40', label: '40' },
        { value: '42', label: '42' },
        { value: '44', label: '44' },
        { value: '46', label: '46' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      name: 'Availability',
      tagPrefix: 'availability',
      defaultExpanded: false,
      options: [
        { value: 'ready to ship', label: 'Ready to Ship' },
        { value: 'made to order', label: 'Made to Order' },
      ],
    },
  ],
  priceRange: [0, 800],
  priceStep: 25,
  faqs: [
    {
      question: "What types of menswear are available at LuxeMia?",
      answer: "LuxeMia offers sherwanis, kurta pajama sets, Modi jackets, indo-western menswear, and bandhgalas in silk, jacquard, velvet, cotton, and brocade fabrics. Each piece is handcrafted for the modern groom and wedding party."
    },
    {
      question: "What sizes are available for sherwanis?",
      answer: "We offer chest sizes 38, 40, 42, 44, and 46, with custom tailoring available for the perfect fit. For wedding sherwanis, we highly recommend custom sizing — provide your chest, shoulder, sleeve, and length measurements."
    },
    {
      question: "What's included in a sherwani set?",
      answer: "Most LuxeMia sherwani sets include the sherwani, matching kurta-pajama or churidar, and a dupatta or stole. Some premium sets also include a matching turban (safa) and mojaris. Check the product description for exact inclusions."
    },
    {
      question: "Can I order a sherwani for my groomsmen?",
      answer: "Yes! We offer groomsmen coordination — choose a coordinated color palette and we'll craft matching sherwanis or kurtas for your wedding party. Contact our styling team with your party size and color preferences."
    },
    {
      question: "How should I care for my sherwani?",
      answer: "Dry clean only for sherwanis with embroidery, zardozi, or sequence work. Store in a breathable garment bag in a cool, dry place. Avoid direct sunlight to prevent color fading. Iron on reverse side over embroidery, or use a pressing cloth."
    }
  ],
  // SEO editorial content (Item #14)
  editorialTitle: 'Buy Indian Menswear Online — Sherwanis, Kurtas &amp; Nehru Jackets',
  editorialContent: (
    <>
      <p>
        Shop authentic <strong>Indian menswear online</strong> at LuxeMia. Our collection includes sherwanis,
        kurta pajama sets, Nehru jackets, and indo-western outfits for grooms, groomsmen, and wedding guests.
        Every piece is sourced directly from India and shipped to the USA, Canada, and Australia with free
        shipping on orders over $350.
      </p>

      <h3>Sherwanis for Grooms &amp; Wedding Guests</h3>
      <p>
        A <strong>sherwani</strong> is the most formal Indian menswear garment — a long coat worn over a
        kurta and churidar. Our sherwani collection features embroidery, zardozi work, and brocade fabrics
        in ivory, gold, maroon, and deep blue. Perfect for grooms, groomsmen, and guests attending a wedding
        ceremony.
      </p>

      <h3>Kurta Pajama Sets — Comfortable &amp; Versatile</h3>
      <p>
        <strong>Kurta pajama sets</strong> are the foundation of every Indian man's wardrobe. A kurta (long
        tunic) paired with pajama (loose pants) is perfect for mehendi ceremonies, pujas, festivals, and
        casual ethnic wear. Choose from cotton kurtas for everyday comfort or silk kurtas for festive
        occasions.
      </p>

      <h3>Nehru Jackets — The Versatile Layer</h3>
      <p>
        A <strong>Nehru jacket</strong> is a sleeveless mandarin-collar vest that adds instant formality to
        any kurta. Available in brocade, silk, and linen, a Nehru jacket is the most versatile piece in
        Indian menswear — wear it over a kurta for a wedding or over a Western shirt for an indo-western look.
      </p>

      <h3>Indo-Western Menswear</h3>
      <p>
        For a modern take on Indian fashion, explore our <strong>indo-western menswear</strong> collection.
        Structured blazers with Indian embroidery, kurta-shirt hybrids, and tailored trousers with ethnic
        detailing — perfect for receptions, cocktail parties, and contemporary celebrations.
      </p>

      <h3>Wedding Guest Outfits for Men</h3>
      <p>
        Attending an Indian wedding? For the mehendi and haldi, a simple cotton kurta pajama in yellow or
        orange is perfect. For the sangeet, choose a silk kurta with a Nehru jacket. For the wedding ceremony
        and reception, go for a sherwani or an embroidered indo-western suit. See our
        <a href="/blog/indian-wedding-guest-outfits-men-usa-guide">complete men's wedding guest guide</a>.
      </p>

      <h3>Custom Tailoring &amp; Sizing</h3>
      <p>
        Every menswear outfit at LuxeMia can be custom-tailored to your measurements. We offer sizes S
        through XXL plus made-to-measure options. Send us your chest, shoulder, waist, and length measurements
        and our master tailors will stitch the perfect fit. See our <a href="/size-guide">size guide</a> for details.
      </p>
    </>
  ),
};

// ─── Jewelry (Kundan + Polki Bridal Jewelry) ───────────────────────────────

const JEWELRY: CategoryConfig = {
  slug: 'jewelry',
  name: 'Bridal Jewelry',
  heroImage: '/images/banners/jewelry-banner.jpg',
  heroTitle: 'Bridal Jewelry',
  heroSubtitle: 'Handcrafted Kundan and uncut polki necklace sets for the modern bride — regal statements for your wedding day.',
  seoTitle: 'Kundan Bridal Jewelry | Necklace Sets for Wedding | LuxeMia',
  seoDescription: 'Shop handcrafted Kundan bridal jewelry and uncut polki necklace sets at LuxeMia. Premium Indian bridal jewelry for weddings. Free shipping over $350 to USA, Canada & Australia.',
  canonical: 'https://luxemia.shop/jewelry',
  ogImage: '/og-image.jpg',
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
    { name: 'Bridal Jewelry', url: '/jewelry' },
  ],
  subcategories: [
    // By Jewelry Type — the most useful grouping for shoppers
    styleSub('necklace-set', 'Necklace Sets', ['style:necklace set', 'necklace set', 'necklace']),
    styleSub('choker', 'Chokers', ['style:choker', 'choker']),
    styleSub('bridal-set', 'Bridal Sets', ['style:full bridal set', 'full bridal set', 'bridal set']),
    // By Price — simple, actionable
    priceSub('under-100', 'Under $100', 0, 100),
    priceSub('premium-100-plus', '$100+', 100, 10000),
  ],
  filters: [
    {
      name: 'Jewelry Type',
      tagPrefix: 'style',
      defaultExpanded: true,
      options: [
        { value: 'necklace set', label: 'Necklace Set' },
        { value: 'choker', label: 'Choker' },
        { value: 'full bridal set', label: 'Bridal Set' },
      ],
    },
    {
      name: 'Color',
      tagPrefix: 'color',
      defaultExpanded: false,
      renderAsSwatches: true,
      options: colors('Green', 'Red', 'White', 'Gold', 'Multicolor'),
    },
  ],
  priceRange: [80, 200],
  priceStep: 10,
  faqs: [
    {
      question: "What types of bridal jewelry are available at LuxeMia?",
      answer: "LuxeMia offers handcrafted Kundan necklace sets, Kundan with stone bridal sets, uncut polki necklace sets, and full bridal sets (necklace + earrings + maang tikka). Each piece uses traditional Rajasthani stone-setting techniques with 24k gold foil framing."
    },
    {
      question: "Is Kundan jewelry real diamond jewelry?",
      answer: "Our Kundan jewelry uses traditional Indian stone-setting techniques with glass-based Kundan stones and uncut polki accents. It offers the look of fine diamond jewelry at a fraction of the cost, making it perfect for brides who want a regal appearance without the investment of real diamonds."
    },
    {
      question: "What's included in a Kundan necklace set?",
      answer: "Most LuxeMia Kundan necklace sets include the necklace and matching earrings. Full bridal sets also include a maang tikka. The necklace features an adjustable dori (thread) closure for a comfortable fit, and the earrings come with secure push-backs."
    },
    {
      question: "How should I care for my Kundan jewelry?",
      answer: "Store in the provided velvet pouch away from moisture and direct sunlight. Avoid contact with perfume, hairspray, and water. Gently wipe with a soft dry cloth after each wear. For deep cleaning, take to a professional jewelry cleaner — do not use chemical cleaners at home as they can damage the Kundan setting."
    },
    {
      question: "Do you ship bridal jewelry to USA, Canada, and Australia?",
      answer: "Yes, we ship worldwide with free shipping on orders over $350. Standard delivery takes 7-10 business days via USPS/UPS, or 3-5 business days via DHL Express. Each piece ships in a signature gift box."
    }
  ],
};

// ─── Exported registry ─────────────────────────────────────────────────────

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  lehengas: LEHENGAS,
  sarees: SAREES,
  suits: SUITS,
  menswear: MENSWEAR,
  jewelry: JEWELRY,
};

export function getCategoryConfig(slug: string): CategoryConfig | undefined {
  return CATEGORY_CONFIGS[slug];
}

// ─── Mega-menu structure for Header ────────────────────────────────────────

export interface MegaMenuGroup {
  label: string;
  links: Array<{ name: string; href: string }>;
}

export interface MegaMenuConfig {
  label: string;
  href: string;
  groups: MegaMenuGroup[];
}

function subcatLinks(catSlug: string, subcats: Subcategory[], group: SubcategoryGroup, limit?: number): Array<{ name: string; href: string }> {
  const filtered = subcats.filter(s => s.group === group);
  const sliced = limit ? filtered.slice(0, limit) : filtered;
  return sliced.map(s => ({
    name: s.label,
    href: `/${catSlug}?sub=${s.slug}`,
  }));
}

export const MEGA_MENUS: MegaMenuConfig[] = [
  {
    label: 'Lehengas',
    href: '/lehengas',
    groups: [
      { label: 'By Occasion', links: subcatLinks('lehengas', LEHENGAS.subcategories, 'occasion') },
    ],
  },
  {
    label: 'Sarees',
    href: '/sarees',
    groups: [
      { label: 'By Occasion', links: subcatLinks('sarees', SAREES.subcategories, 'occasion') },
    ],
  },
  {
    label: 'Salwar Kameez',
    href: '/suits',
    groups: [
      { label: 'By Style', links: subcatLinks('suits', SUITS.subcategories, 'style').filter(l => ['Anarkali', 'Sharara', 'Palazzo'].includes(l.name)) },
      { label: 'By Occasion', links: subcatLinks('suits', SUITS.subcategories, 'occasion') },
    ],
  },
  {
    label: 'Menswear',
    href: '/menswear',
    groups: [
      { label: 'By Style', links: subcatLinks('menswear', MENSWEAR.subcategories, 'style').filter(l => ['Sherwani', 'Kurta Pajama', 'Indo-Western'].includes(l.name)) },
      { label: 'By Occasion', links: subcatLinks('menswear', MENSWEAR.subcategories, 'occasion') },
    ],
  },
  {
    label: 'Jewelry',
    href: '/jewelry',
    groups: [
      { label: 'By Type', links: subcatLinks('jewelry', JEWELRY.subcategories, 'style').filter(l => ['Necklace Sets', 'Chokers', 'Bridal Sets'].includes(l.name)) },
    ],
  },
];
