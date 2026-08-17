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
import { FEATURED_CATEGORY_PRODUCTS } from '@/config/featuredCategoryProducts';

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
  heroAlt?: string;
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

// ─── Lehengas ──────────────────────────────────────────────────────────────

const LEHENGAS: CategoryConfig = {
  slug: 'lehengas',
  name: 'Lehengas',
  heroImage: FEATURED_CATEGORY_PRODUCTS.lehengas.image,
  heroImageWebp: FEATURED_CATEGORY_PRODUCTS.lehengas.imageWebp,
  heroAlt: FEATURED_CATEGORY_PRODUCTS.lehengas.alt,
  heroTitle: 'Lehengas',
  heroSubtitle: 'Bridal, wedding guest and festive lehengas for U.S. delivery. Use the Ready to Ship filter for listings explicitly tagged that way, then confirm fabric, included pieces, sizing and shipping timing on the product page.',
  seoTitle: 'Bridal & Ready-to-Ship Lehengas USA | LuxeMia',
  seoDescription: 'Shop bridal and wedding guest lehengas online in the USA. Use the Ready to Ship filter for eligible listings; compare fabric, included pieces, sizing and tracked U.S. shipping.',
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
      seoTitle: 'Bridal Lehengas Online USA | Red & Maroon Wedding Lehengas - LuxeMia',
      seoDescription: 'Shop bridal lehengas online in the USA. Use the Ready to Ship filter for eligible listings, then compare colors, fabric, included pieces, sizing and tracked U.S. shipping.',
      seoCanonical: 'https://luxemia.shop/lehengas?sub=bridal',
    }),
    occasionSub('wedding-guest', 'Wedding Guest', ['occasion:wedding', 'wedding', 'guest'], {
      seoTitle: 'Wedding Guest Lehengas & Bridesmaid Lehengas Online | LuxeMia',
      seoDescription: 'Shop wedding guest and bridesmaid lehengas online. Compare current colors, fabric, work, included pieces, sizing and availability on each listing.',
      seoCanonical: 'https://luxemia.shop/lehengas?sub=wedding-guest',
    }),
    occasionSub('reception', 'Reception', ['occasion:reception', 'reception'], {
      seoTitle: 'Reception Lehengas for Brides | Cocktail & Evening Lehengas - LuxeMia',
      seoDescription: 'Shop reception lehengas online. Compare current colors, fabric, embroidery or embellishment, included pieces, sizing and availability.',
      seoCanonical: 'https://luxemia.shop/lehengas?sub=reception',
    }),
    occasionSub('party-wear', 'Party Wear', ['occasion:party', 'party wear', 'party', 'festive'], {
      seoTitle: 'Party Wear Lehengas & Festive Lehenga Choli Online | LuxeMia',
      seoDescription: 'Shop party-wear and festive lehengas online. Review each listing for its exact fabric, work, included pieces, sizing and current availability.',
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
        { value: 'chinnon', label: 'Chinnon' },
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
        { value: 'sequin', label: 'Sequin Work' },
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
        { value: 'available online', label: 'Available Online' },
        { value: 'made to order', label: 'Made to Order' },
      ],
    },
  ],
  priceRange: [0, 2000],
  priceStep: 50,
  faqs: [
    {
      question: "What types of lehengas are available at LuxeMia?",
      answer: "LuxeMia offers bridal, reception, festive and party-wear lehengas. Fabrics and work vary by design, so review each product page for the exact supplied details."
    },
    {
      question: "How do I find the right lehenga size?",
      answer: "Available sizes and tailoring options vary by product. Review the size selector and listing details, use the Size Guide for measurements, and contact LuxeMia before ordering if you need fit help."
    },
    {
      question: "What is included in a lehenga set?",
      answer: "Included pieces vary by design. Check the product description for the exact skirt, blouse or choli, dupatta, lining, cancan, and accessory details before ordering."
    },
    {
      question: "How long does it take to receive a bridal lehenga?",
      answer: "Lehengas ship with tracking after dispatch. Timing depends on the product and any selected tailoring, so contact LuxeMia before ordering for a time-sensitive event."
    },
    {
      question: "Can I customize the color of my lehenga?",
      answer: "Color and customization options vary by product. Review the listed variants or contact LuxeMia to ask whether another option is available before ordering."
    }
  ],
  // SEO editorial content (Item #14) — keyword-rich copy below the product grid
  editorialTitle: 'Shop Lehengas Online — Bridal, Wedding Guest & Festive',
  editorialContent: (
    <>
      <p>
        Browse bridal, wedding guest, reception and festive lehengas available online at LuxeMia.
        Each product page states the supplied fabric and work details, stitching status, included pieces,
        available sizes and current price so you can compare designs accurately.
      </p>
      <h3>Choose by Occasion and Detail</h3>
      <p>
        Use the occasion, color, fabric, work and price filters to narrow the collection. Open the exact
        listing before ordering because materials, embellishment, lining and package contents vary by design.
      </p>
      <h3>Bridal, Reception and Party-Wear Lehengas</h3>
      <p>
        Compare bridal lehengas with reception and party-wear styles by weight, work, included pieces and
        stitching status. For related occasion ideas, see the <a href="/maroon-lehenga-for-reception">reception lehenga guide</a>,
        the <a href="/lehenga-for-bridesmaid">bridesmaid lehenga guide</a> and the
        <a href="/lehenga-for-mother-of-bride"> mother-of-the-bride lehenga guide</a>.
      </p>
      <h3>Ready-to-Ship Bridal Lehengas in the USA</h3>
      <p>
        Use the Ready to Ship availability filter to view only listings explicitly tagged for that status.
        Confirm the selected size, included pieces and product-specific shipping estimate before ordering,
        especially when shopping for a fixed wedding date.
      </p>
      <h3>Adjustable-Waist and Cape-Dupatta Sangeet Lehengas</h3>
      <p>
        Select active listings state an adjustable waist or a cape-style pre-draped dupatta. If you are
        comparing an adjustable-waist lehenga choli for sangeet dancing or a cape-dupatta lehenga for a
        sangeet or reception, open the exact product page to confirm the waist allowance, stitching status,
        included pieces and dispatch timing.
      </p>
      <h3>Sizing and Tailoring</h3>
      <p>
        Available sizes and any optional tailoring vary by product. Review the listing and
        <a href="/size-guide"> size guide</a>, and contact LuxeMia before ordering if your event date is time-sensitive.
      </p>
      <h3>United States Shipping</h3>
      <p>
        Free U.S. shipping applies at $150 and above and shipping is $12 below that. Tracking is provided after dispatch.
        See the <a href="/shipping">shipping policy</a> for current details.
      </p>
    </>
  ),
};

// ─── Sarees ────────────────────────────────────────────────────────────────

const SAREES: CategoryConfig = {
  slug: 'sarees',
  name: 'Sarees',
  heroImage: FEATURED_CATEGORY_PRODUCTS.sarees.image,
  heroImageWebp: FEATURED_CATEGORY_PRODUCTS.sarees.imageWebp,
  heroAlt: FEATURED_CATEGORY_PRODUCTS.sarees.alt,
  heroTitle: 'Sarees',
  heroSubtitle: 'Shop Banarasi-style, silk, georgette, wedding and festive sarees online in the U.S. Review each listing for its exact fabric, blouse information, dimensions and stitching status.',
  seoTitle: 'Buy Indian Wedding Sarees Online in the U.S. | LuxeMia',
  seoDescription: 'Buy Indian wedding, silk and festive sarees online in the U.S. Compare each listing’s exact fabric, weave or work, blouse details, availability and tracked shipping.',
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
      seoDescription: 'Shop bridal sarees online. Compare each listing\'s stated fabric, weave or work, blouse details, current price and availability. Free U.S. shipping at $150 and above.',
      seoCanonical: 'https://luxemia.shop/sarees?sub=bridal',
    }),
    occasionSub('wedding-guest', 'Wedding Guest', ['occasion:wedding-guest', 'wedding guest', 'bridesmaid', 'role:bridesmaid'], {
      seoTitle: 'Wedding Guest Sarees & Bridesmaid Sarees Online | LuxeMia',
      seoDescription: 'Shop wedding guest and bridesmaid sarees online. Compare current colors, stated fabric, blouse details, price and availability on each listing.',
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
      seoTitle: 'Party Wear & Reception Sarees Online | LuxeMia',
      seoDescription: 'Shop party-wear and reception sarees online. Review each listing for its exact fabric, work, blouse details, price and current availability.',
      seoCanonical: 'https://luxemia.shop/sarees?sub=party-wear',
    }),
    // Wedding is intentionally labelled "Ceremony Sarees" to avoid title fallback:
    // an old catalog import added the word "wedding" to many unrelated saree titles.
    occasionSub('wedding', 'Ceremony Sarees', ['occasion:wedding', 'occasion:bridal', 'role:bride'], {
      matchProductType: ['Wedding Saree', 'Bridal Saree'],
      seoTitle: 'Wedding Sarees Online USA | Indian Wedding Sarees | LuxeMia',
      seoDescription: 'Shop wedding sarees online in the USA. Compare each listing’s stated fabric, work, blouse details, price and current availability.',
      seoCanonical: 'https://luxemia.shop/collections/wedding-sarees',
    }),
    occasionSub('designer', 'Designer', ['occasion:designer'], {
      matchProductType: ['Designer Saree'],
      seoTitle: 'Designer Sarees Online USA | Embroidered & Party-Wear Styles | LuxeMia',
      seoDescription: 'Shop designer sarees online in the USA. Compare stated fabric, work, blouse details, price and availability on each listing.',
      seoCanonical: 'https://luxemia.shop/collections/designer-sarees',
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
        { value: 'sequin', label: 'Sequin' },
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
        { value: 'available online', label: 'Available Online' },
        { value: 'made to order', label: 'Made to Order' },
      ],
    },
  ],
  priceRange: [0, 1500],
  priceStep: 25,
  faqs: [
    {
      question: "What types of sarees are available at LuxeMia?",
      answer: "LuxeMia offers wedding, festive, silk, georgette and printed sarees. Review each listing for the exact fabric, weave or work, blouse details and availability."
    },
    {
      question: "Do your sarees come with a blouse?",
      answer: "Blouse fabric and stitching status vary by product. Check the included-pieces section and contact LuxeMia if the listing does not answer your question."
    },
    {
      question: "Can I get a saree pre-draped?",
      answer: "Pre-draped or ready-to-wear options may be available when explicitly listed. Use the filters and review the exact stitching status before ordering."
    },
    {
      question: "How should I care for my silk saree?",
      answer: "Follow the care instructions on the exact product page or label. For delicate silk, zari, embroidery or uncertain materials, ask a qualified cleaner before washing or pressing."
    },
    {
      question: "Do you ship sarees to the United States?",
      answer: "Yes. LuxeMia ships to United States addresses. Shipping is free at $150 and above and costs $12 below that. Tracking is provided after dispatch."
    }
  ],
  // SEO editorial content (Item #14)
  editorialTitle: 'Shop Sarees Online — Silk, Wedding & Festive Styles',
  editorialContent: (
    <>
      <p>
        Browse sarees for weddings, receptions, festivals and other celebrations. Product pages state the
        supplied fabric, weave or embellishment details, blouse information, dimensions and current price.
      </p>
      <h3>Buy Indian Wedding Sarees Online in the U.S.</h3>
      <p>
        Compare wedding and festive sarees by their stated fabric, weave or work, blouse details and availability.
        LuxeMia does not treat a style name as proof of fiber, weaving method or origin; use the exact product details
        as the specification for each saree.
      </p>
      <h3>Compare Fabric and Weave Details</h3>
      <p>
        Silk sarees can use pure silk, blended silk or art-silk fabrics. Review the exact composition and
        product wording on each listing rather than assuming every saree uses the same fiber, zari or weaving method.
      </p>
      <h3>Silk, Kanchipuram and Kanjivaram Sarees</h3>
      <p>
        Browse the <a href="/collections/silk-sarees">silk saree collection</a> and the
        <a href="/collections/kanchipuram-sarees"> Kanchipuram and Kanjivaram collection</a>, then compare the stated
        fiber, weave, border, blouse details and availability on each listing. The
        <a href="/kanjivaram-saree-for-wedding"> Kanjivaram wedding saree guide</a> explains additional shopping considerations.
      </p>
      <h3>Blouse and Sizing Details</h3>
      <p>
        Blouse fabric, stitching status and optional tailoring vary by product. Check the included-pieces section
        and contact LuxeMia before ordering if you need help with measurements or timing.
      </p>
      <h3>United States Shipping</h3>
      <p>
        Free U.S. shipping applies at $150 and above and shipping is $12 below that. Tracking is provided after dispatch.
        See the <a href="/shipping">shipping policy</a> for current details.
      </p>
    </>
  ),
};

// ─── Suits / Salwar Kameez ─────────────────────────────────────────────────

const SUITS: CategoryConfig = {
  slug: 'suits',
  name: 'Salwar Kameez & Suits',
  heroImage: FEATURED_CATEGORY_PRODUCTS.suits.image,
  heroImageWebp: FEATURED_CATEGORY_PRODUCTS.suits.imageWebp,
  heroAlt: FEATURED_CATEGORY_PRODUCTS.suits.alt,
  heroTitle: 'Salwar Kameez & Suits',
  heroSubtitle: "Anarkalis, shararas and palazzo sets, available online. If you need a specific colour or a set for a group, that's our sister site CeremonyVerse.",
  seoTitle: 'Salwar Kameez & Suits Online | Anarkali, Sharara | LuxeMia',
  seoDescription: 'Shop salwar kameez, anarkali, sharara and palazzo suits online. Compare exact fabric, included pieces, sizing and availability. Free U.S. shipping at $150 and above.',
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
    {
      slug: 'gharara',
      label: 'Gharara',
      group: 'style',
      matchTags: ['style:gharara', 'gharara'],
    },
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
        { value: 'chinnon', label: 'Chinnon' },
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
        { value: 'sequin', label: 'Sequin' },
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
        { value: 'available online', label: 'Available Online' },
        { value: 'made to order', label: 'Made to Order' },
      ],
    },
  ],
  priceRange: [0, 800],
  priceStep: 25,
  faqs: [
    {
      question: "What types of salwar kameez and suits are available at LuxeMia?",
      answer: "LuxeMia offers anarkali, sharara, palazzo, Pakistani-style and straight-cut suits. Available fabrics and work vary, so review each product page for exact material, embellishment and included-piece details."
    },
    {
      question: "What is the difference between anarkali and sharara suits?",
      answer: "Anarkali suits feature a long, flowing kurta with a fitted bodice and flared skirt — inspired by Mughal-era silhouette. Sharara suits have wide-legged flared pants paired with a short kurti. Both are popular for weddings and festive occasions."
    },
    {
      question: "Are Pakistani suits available?",
      answer: "LuxeMia listings may include Pakistani-style straight-cut suits. Review the exact product page for the supplied silhouette, fabric, work, included pieces and availability."
    },
    {
      question: "Do you offer custom tailoring for suits?",
      answer: "Sizing and tailoring options vary by suit. Review the size selector and product page, or contact LuxeMia before ordering if you need measurement help."
    },
    {
      question: "How do I care for my salwar kameez?",
      answer: "Follow the care instructions on the exact product page or label. For embroidery, sequins, zari or uncertain fabrics, ask a qualified cleaner before washing or pressing."
    }
  ],
  // SEO editorial content (Item #14)
  editorialTitle: 'Shop Salwar Kameez, Anarkali, Sharara & Palazzo Suits',
  editorialContent: (
    <>
      <p>
        Browse salwar kameez, anarkali, sharara and palazzo sets for weddings, receptions and festivals.
        Product pages state the supplied fabric and work details, included pieces, stitching status, sizes and price.
      </p>
      <h3>Compare Silhouette and Package Contents</h3>
      <p>
        Use the style, fabric, color, work and price filters to narrow the collection. Check the exact listing
        to confirm whether a set includes a kurta or kameez, bottoms, dupatta, lining or other pieces.
      </p>
      <h3>Anarkali, Sharara and Gharara Styles</h3>
      <p>
        Anarkali suits use a flared kurta, while sharara and gharara sets use wide or structured flared bottoms;
        the exact cut varies by product. Compare the <a href="/anarkali-suit-for-wedding-guest">wedding-guest Anarkali guide</a>,
        the <a href="/anarkali-suit-for-mother-of-bride">mother-of-the-bride Anarkali guide</a> and the
        <a href="/sharara-for-bride-sister"> sharara guide</a>, then return to the current listings for availability.
      </p>
      <h3>Sizing and Tailoring</h3>
      <p>
        Available sizes and any optional tailoring vary by product. Use the <a href="/size-guide">size guide</a>
        and contact LuxeMia before ordering if your event date is time-sensitive.
      </p>
      <h3>United States Shipping</h3>
      <p>
        Free U.S. shipping applies at $150 and above and shipping is $12 below that. Tracking is provided after dispatch.
      </p>
    </>
  ),
};

// ─── Menswear ──────────────────────────────────────────────────────────────

const MENSWEAR: CategoryConfig = {
  slug: 'menswear',
  name: 'Menswear',
  heroImage: FEATURED_CATEGORY_PRODUCTS.menswear.image,
  heroImageWebp: FEATURED_CATEGORY_PRODUCTS.menswear.imageWebp,
  heroAlt: FEATURED_CATEGORY_PRODUCTS.menswear.alt,
  heroTitle: 'Menswear',
  heroSubtitle: 'Kurta sets, sherwanis and Indo-Western, in stock. Sizes listed by chest and length measurement.',
  seoTitle: 'Buy Sherwanis Online USA | Groom & Wedding | LuxeMia',
  seoDescription: 'Shop sherwanis, kurta pajama sets and Indo-Western menswear online. Compare exact fabric, included pieces, sizes and availability. Free U.S. shipping at $150 and above.',
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
        { value: 'sequin', label: 'Sequin' },
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
        { value: 'available online', label: 'Available Online' },
        { value: 'made to order', label: 'Made to Order' },
      ],
    },
  ],
  priceRange: [0, 800],
  priceStep: 25,
  faqs: [
    {
      question: "What types of menswear are available at LuxeMia?",
      answer: "LuxeMia offers sherwanis, kurta pajama sets, Nehru-style jackets, Indo-Western menswear and bandhgalas. Available fabrics and work vary by product; check the exact listing details."
    },
    {
      question: "What sizes are available for sherwanis?",
      answer: "Available chest sizes and any tailoring options vary by product. Review the size selector and measurements on the listing, or contact LuxeMia for help before ordering."
    },
    {
      question: "What's included in a sherwani set?",
      answer: "Sherwani package contents vary by design. Check the product description for the exact sherwani, kurta, pajama or churidar, stole, turban and footwear inclusions before ordering."
    },
    {
      question: "Can I order a sherwani for my groomsmen?",
      answer: "LuxeMia can help you compare currently available menswear for a group order. Send the event date, group size, palette and measurements; product and color availability must be confirmed."
    },
    {
      question: "How should I care for my sherwani?",
      answer: "Follow the care instructions on the exact product page or label. For embroidery, zari, sequins or uncertain fabrics, ask a qualified cleaner before washing or pressing."
    }
  ],
  // SEO editorial content (Item #14)
  editorialTitle: 'Shop Indian Menswear Online — Sherwanis, Kurtas & Nehru Jackets',
  editorialContent: (
    <>
      <p>
        Browse sherwanis, kurta pajama sets, Nehru-style jackets and Indo-Western menswear for weddings,
        receptions and festive events. Product pages state the available fabric, work, included pieces, sizes and price.
      </p>
      <h3>Choose by Occasion and Set Contents</h3>
      <p>
        Use the style, occasion, fabric, color and price filters to compare products. Open the exact listing
        to confirm every included garment or accessory because set contents vary by design.
      </p>
      <h3>Sizing and Tailoring</h3>
      <p>
        Available sizes and any optional tailoring vary by product. Review the listing and
        <a href="/size-guide"> size guide</a>, and contact LuxeMia before ordering if you need measurement help.
      </p>
      <h3>Custom Plus-Size Kurta Pajama and Nehru-Jacket Sets</h3>
      <p>
        Select active listings state plus-size custom stitching and include a kurta, pajama and Nehru jacket.
        When comparing a men's plus-size kurta pajama with matching jacket for a wedding guest or cocktail
        night, or a big-and-tall Nehru-jacket look, confirm the exact fabric, measurement process, set contents
        and event timing on the product page before ordering.
      </p>
      <h3>United States Shipping</h3>
      <p>
        Free U.S. shipping applies at $150 and above and shipping is $12 below that. Tracking is provided after dispatch.
      </p>
    </>
  ),
};

// ─── Jewelry (Kundan + Polki Bridal Jewelry) ───────────────────────────────

const JEWELRY: CategoryConfig = {
  slug: 'jewelry',
  name: 'Bridal Jewelry',
  heroImage: FEATURED_CATEGORY_PRODUCTS.jewelry.image,
  heroImageWebp: FEATURED_CATEGORY_PRODUCTS.jewelry.imageWebp,
  heroAlt: FEATURED_CATEGORY_PRODUCTS.jewelry.alt,
  heroTitle: 'Bridal Jewelry',
  heroSubtitle: 'Kundan-style, polki-style and bridal necklace sets. Review each listing for exact materials, finish, included pieces and measurements.',
  seoTitle: 'Kundan Bridal Jewelry | Necklace Sets for Wedding | LuxeMia',
  seoDescription: 'Shop Kundan-style, polki-style and bridal necklace sets online. Compare exact materials, finish, included pieces and measurements. Free U.S. shipping at $150 and above.',
  canonical: 'https://luxemia.shop/jewelry',
  ogImage: '/images/campaigns/new-indian-ethnic-wear-2026-desktop.jpg',
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
      answer: "LuxeMia offers necklace sets, chokers and bridal sets described as Kundan-style or polki-style where applicable. Review the product page for the exact materials, finish and included pieces."
    },
    {
      question: "Is Kundan jewelry real diamond jewelry?",
      answer: "Do not assume a Kundan-style or polki-style item contains diamonds, precious metal or a particular stone type. The product page states the supplied material and finish details; contact LuxeMia if a detail is not listed."
    },
    {
      question: "What's included in a Kundan necklace set?",
      answer: "Included pieces and closures vary by set. Check the product description and images for the exact necklace, earrings, maang tikka, chain, dori or other components."
    },
    {
      question: "How should I care for my Kundan jewelry?",
      answer: "Keep jewelry dry and away from perfume, hairspray and harsh cleaners. Store pieces separately to reduce scratching, and follow any care instructions supplied with the item."
    },
    {
      question: "Do you ship bridal jewelry to the United States?",
      answer: "Yes. LuxeMia ships to United States addresses. Shipping is free at $150 and above and costs $12 below that. Tracking is provided after dispatch."
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
      {
        label: 'Wedding Traditions',
        links: [
          { name: 'Silk Sarees', href: '/collections/silk-sarees' },
          { name: 'Kanchipuram Sarees', href: '/collections/kanchipuram-sarees' },
        ],
      },
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
