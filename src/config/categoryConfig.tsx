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
  | 'color'
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

function occasionSub(slug: string, label: string, matchTags: string[]): Subcategory {
  return { slug, label, group: 'occasion', matchTags };
}

function styleSub(slug: string, label: string, matchTags: string[]): Subcategory {
  return { slug, label, group: 'style', matchTags };
}

function colorSub(slug: string, label: string): Subcategory {
  return { slug, label, group: 'color', matchTags: [`color:${slug}`, slug] };
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
    occasionSub('bridal', 'Bridal', ['occasion:bridal', 'bridal']),
    occasionSub('wedding-guest', 'Wedding Guest', ['occasion:wedding', 'wedding', 'guest']),
    occasionSub('reception', 'Reception', ['occasion:reception', 'reception']),
    occasionSub('party-wear', 'Party Wear', ['occasion:party', 'party wear', 'party', 'festive']),
    // By Fabric (simplified — 4 main fabrics)
    styleSub('silk', 'Silk', ['fabric:silk', 'silk', 'raw silk', 'art silk']),
    styleSub('velvet', 'Velvet', ['fabric:velvet', 'velvet']),
    styleSub('georgette', 'Georgette', ['fabric:georgette', 'georgette']),
    styleSub('net', 'Net', ['fabric:net', 'net']),
    // By Color (6 main colors)
    colorSub('red', 'Red'),
    colorSub('maroon', 'Maroon'),
    colorSub('pink', 'Pink'),
    colorSub('blue', 'Blue'),
    colorSub('green', 'Green'),
    colorSub('ivory', 'Ivory'),
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
    // By Occasion (simplified — 3 main occasions)
    occasionSub('bridal', 'Bridal', ['occasion:bridal', 'bridal']),
    occasionSub('wedding', 'Wedding', ['occasion:wedding', 'wedding']),
    occasionSub('party-wear', 'Party Wear', ['occasion:party', 'party wear', 'party', 'reception', 'festive']),
    // By Fabric (simplified — 4 main fabrics)
    styleSub('silk', 'Silk', ['fabric:silk', 'silk', 'banarasi', 'kanchipuram', 'kanjeevaram']),
    styleSub('georgette', 'Georgette', ['fabric:georgette', 'georgette']),
    styleSub('chiffon', 'Chiffon', ['fabric:chiffon', 'chiffon']),
    styleSub('organza', 'Organza', ['fabric:organza', 'organza']),
    // By Color (6 main colors)
    colorSub('red', 'Red'),
    colorSub('maroon', 'Maroon'),
    colorSub('pink', 'Pink'),
    colorSub('blue', 'Blue'),
    colorSub('green', 'Green'),
    colorSub('purple', 'Purple'),
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
    // By Color (6 main colors)
    colorSub('pink', 'Pink'),
    colorSub('red', 'Red'),
    colorSub('green', 'Green'),
    colorSub('blue', 'Blue'),
    colorSub('purple', 'Purple'),
    colorSub('maroon', 'Maroon'),
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
    // By Color (6 main colors)
    colorSub('cream', 'Cream'),
    colorSub('gold', 'Gold'),
    colorSub('black', 'Black'),
    colorSub('navy', 'Navy'),
    colorSub('maroon', 'Maroon'),
    colorSub('wine', 'Wine'),
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
    // By Stone Type
    styleSub('kundan', 'Kundan', ['stone:kundan', 'kundan']),
    styleSub('kundan-with-stone', 'Kundan with Stone', ['stone:kundan with stone', 'kundan with stone']),
    styleSub('uncut-polki', 'Uncut Polki', ['stone:uncut polki', 'uncut polki', 'polki']),
    styleSub('pearl', 'Pearl', ['stone:pearl', 'pearl']),
    // By Jewelry Type
    styleSub('necklace-set', 'Necklace Set', ['style:necklace set', 'necklace set']),
    styleSub('choker', 'Choker Necklace', ['style:choker', 'choker']),
    styleSub('bridal-set', 'Full Bridal Set', ['style:full bridal set', 'full bridal set', 'bridal set']),
    styleSub('with-maang-tikka', 'With Maang Tikka', ['style:with maang tikka', 'maang tikka']),
    // By Occasion
    occasionSub('bridal', 'Bridal', ['occasion:bridal', 'bridal']),
    occasionSub('wedding', 'Wedding', ['occasion:wedding', 'wedding']),
    occasionSub('reception', 'Reception', ['occasion:reception', 'reception']),
    occasionSub('engagement', 'Engagement', ['occasion:engagement', 'engagement']),
    occasionSub('mehendi', 'Mehendi', ['occasion:mehendi', 'mehendi']),
    occasionSub('sangeet', 'Sangeet', ['occasion:sangeet', 'sangeet']),
    // By Color
    colorSub('clear', 'Clear'),
    colorSub('pearl-white', 'Pearl White'),
    colorSub('multicolor', 'Multicolor'),
    colorSub('green', 'Green'),
    colorSub('red', 'Red'),
    colorSub('pink', 'Pink'),
    // By Audience
    audienceSub('bride', 'Bride', ['role:bride', 'bride']),
    audienceSub('bridesmaid', 'Bridesmaid', ['role:bridesmaid', 'bridesmaid']),
    audienceSub('mother-of-bride', 'Mother of Bride', ['role:mother of bride', 'mother of bride']),
    audienceSub('nri-wedding', 'NRI Wedding', ['audience:nri', 'nri', 'destination wedding']),
    // By Price
    priceSub('under-100', 'Under $100', 0, 100),
    priceSub('premium-120-plus', 'Premium $120+', 120, 10000),
  ],
  filters: [
    {
      name: 'Stone Type',
      tagPrefix: 'stone',
      defaultExpanded: true,
      options: [
        { value: 'kundan', label: 'Kundan' },
        { value: 'kundan with stone', label: 'Kundan with Stone' },
        { value: 'uncut polki', label: 'Uncut Polki' },
        { value: 'pearl', label: 'Pearl' },
      ],
    },
    {
      name: 'Jewelry Type',
      tagPrefix: 'style',
      defaultExpanded: true,
      options: [
        { value: 'necklace set', label: 'Necklace Set' },
        { value: 'choker', label: 'Choker Necklace' },
        { value: 'full bridal set', label: 'Full Bridal Set' },
      ],
    },
    {
      name: 'Color',
      tagPrefix: 'color',
      defaultExpanded: true,
      renderAsSwatches: true,
      options: colors('Clear', 'Pearl White', 'Multicolor', 'Green', 'Red', 'Pink', 'Gold', 'Maroon', 'Blue'),
    },
    {
      name: 'Metal',
      tagPrefix: 'metal',
      defaultExpanded: false,
      options: [
        { value: 'gold', label: 'Gold' },
        { value: 'antique gold', label: 'Antique Gold' },
        { value: 'silver', label: 'Silver' },
        { value: 'rose gold', label: 'Rose Gold' },
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
      { label: 'By Style', links: subcatLinks('suits', SUITS.subcategories, 'style') },
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
      { label: 'By Type', links: subcatLinks('jewelry', JEWELRY.subcategories, 'style').filter(l => ['Necklace Set', 'Full Bridal Set'].includes(l.name)) },
    ],
  },
];
