/**
 * Banner products verified against live Shopify on 2026-08-07.
 *
 * The local images below are optimized copies of the named Shopify product
 * images. This static presentation map intentionally contains no price,
 * inventory or fulfillment value; those facts must come from current commerce
 * data wherever they are displayed.
 */

export interface FeaturedCategoryProduct {
  category: string;
  title: string;
  handle: string;
  href: string;
  image: string;
  imageWebp: string;
  alt: string;
}

export const FEATURED_CATEGORY_PRODUCTS = {
  lehengas: {
    category: 'Lehengas',
    title: 'Red Raw Silk Thread Work Indian Bridal Lehenga Choli for Wedding Party',
    handle: 'red-raw-silk-thread-work-indian-bridal-lehenga-choli-for-wedding-party',
    href: '/lehengas',
    image: '/images/categories/highest-price-lehenga-2026.jpg',
    imageWebp: '/images/categories/highest-price-lehenga-2026.webp',
    alt: 'Red bridal lehenga choli with detailed thread work, shown on a model',
  },
  sarees: {
    category: 'Sarees',
    title: 'Deep Blue & Rani Pink Korvai Pure Kanjivaram Silk Saree',
    handle: 'deep-blue-and-rani-pink-korvai-kanjivaram-silk-saree',
    href: '/sarees',
    image: '/images/categories/highest-price-saree-2026.jpg',
    imageWebp: '/images/categories/highest-price-saree-2026.webp',
    alt: 'Deep blue and rani pink Korvai Kanjivaram silk saree with gold border',
  },
  suits: {
    category: 'Salwar Kameez',
    title: 'Shimmer Tissue Peplum Skirt Set',
    handle: 'luxemia-shimmer-tissue-peplum-skirt-set',
    href: '/suits',
    image: '/images/categories/highest-price-suit-2026.jpg',
    imageWebp: '/images/categories/highest-price-suit-2026.webp',
    alt: 'Gold-tone shimmer tissue peplum and skirt set shown on a model',
  },
  menswear: {
    category: 'Menswear',
    title: 'Mauve Banarasi Brocade Kurta Pajama Set - Wedding Guest',
    handle: 'handcrafted-mauve-banarasi-brocade-kurta-pajama-set-wedding-guest',
    href: '/menswear',
    image: '/images/categories/highest-price-menswear-2026.jpg',
    imageWebp: '/images/categories/highest-price-menswear-2026.webp',
    alt: 'Mauve Banarasi brocade kurta pajama set shown on a model',
  },
  indowestern: {
    category: 'Indo-Western',
    title: 'Cream Indo Western Dress with Thread Embroidery for Wedding',
    handle: 'cream-indo-western-dress-embroidery',
    href: '/indowestern',
    image: '/images/categories/highest-price-indowestern-2026.jpg',
    imageWebp: '/images/categories/highest-price-indowestern-2026.webp',
    alt: 'Cream Indo-Western dress with pink thread embroidery shown on a model',
  },
  jewelry: {
    category: 'Jewelry',
    title: 'Majestic Magenta Kundan Layered Bridal Necklace Set',
    handle: 'majestic-magenta-kundan-layered-bridal-necklace-set',
    href: '/jewelry',
    image: '/images/categories/highest-price-jewelry-2026.jpg',
    imageWebp: '/images/categories/highest-price-jewelry-2026.webp',
    alt: 'Magenta-accent Kundan-style layered bridal necklace set on a display stand',
  },
} as const satisfies Record<string, FeaturedCategoryProduct>;

export const FEATURED_CATEGORY_PRODUCT_LIST = [
  FEATURED_CATEGORY_PRODUCTS.lehengas,
  FEATURED_CATEGORY_PRODUCTS.sarees,
  FEATURED_CATEGORY_PRODUCTS.suits,
  FEATURED_CATEGORY_PRODUCTS.menswear,
  FEATURED_CATEGORY_PRODUCTS.indowestern,
  FEATURED_CATEGORY_PRODUCTS.jewelry,
] as const;
