/**
 * Category banner products refreshed against the latest active Shopify catalog
 * (2026-11-18). Replaces previously retired 2026-08 handles with current
 * published, in-stock listings in each storefront department.
 */

import latestHomepageImagery from '@/data/latestHomepageImagery.json';

export interface FeaturedCategoryProduct {
  category: string;
  title: string;
  handle: string;
  price: number;
  href: string;
  image: string;
  imageWebp: string;
  alt: string;
}

const latestCategories = latestHomepageImagery.categories;
const latestJewelry = latestCategories.jewelry as {
  title: string;
  handle: string;
  price: number;
  url: string;
  webpUrl: string;
  alt: string;
} | null;

export const FEATURED_CATEGORY_PRODUCTS = {
  lehengas: {
    category: 'Lehengas',
    title: latestCategories.lehengas.title,
    handle: latestCategories.lehengas.handle,
    price: latestCategories.lehengas.price,
    href: '/lehengas',
    image: latestCategories.lehengas.url,
    imageWebp: latestCategories.lehengas.webpUrl,
    alt: latestCategories.lehengas.alt,
  },
  sarees: {
    category: 'Sarees',
    title: latestCategories.sarees.title,
    handle: latestCategories.sarees.handle,
    price: latestCategories.sarees.price,
    href: '/sarees',
    image: latestCategories.sarees.url,
    imageWebp: latestCategories.sarees.webpUrl,
    alt: latestCategories.sarees.alt,
  },
  suits: {
    category: 'Salwar Kameez',
    title: latestCategories.suits.title,
    handle: latestCategories.suits.handle,
    price: latestCategories.suits.price,
    href: '/suits',
    image: latestCategories.suits.url,
    imageWebp: latestCategories.suits.webpUrl,
    alt: latestCategories.suits.alt,
  },
  kids: {
    category: 'Kids',
    title: latestCategories.kids.title,
    handle: latestCategories.kids.handle,
    price: latestCategories.kids.price,
    href: '/kids',
    image: latestCategories.kids.url,
    imageWebp: latestCategories.kids.webpUrl,
    alt: latestCategories.kids.alt,
  },
  menswear: {
    category: 'Menswear',
    title: latestCategories.menswear.title,
    handle: latestCategories.menswear.handle,
    price: latestCategories.menswear.price,
    href: '/menswear',
    image: latestCategories.menswear.url,
    imageWebp: latestCategories.menswear.webpUrl,
    alt: latestCategories.menswear.alt,
  },
  indowestern: {
    category: 'Indo-Western',
    title: latestCategories.indowestern.title,
    handle: latestCategories.indowestern.handle,
    price: latestCategories.indowestern.price,
    href: '/indowestern',
    image: latestCategories.indowestern.url,
    imageWebp: latestCategories.indowestern.webpUrl,
    alt: latestCategories.indowestern.alt,
  },
  jewelry: {
    category: 'Jewelry',
    title: latestJewelry?.title || 'Majestic Magenta Kundan Layered Bridal Necklace Set',
    handle: latestJewelry?.handle || 'majestic-magenta-kundan-layered-bridal-necklace-set',
    price: latestJewelry?.price || 200,
    href: '/jewelry',
    image: latestJewelry?.url || '/images/categories/highest-price-jewelry-2026.jpg',
    imageWebp: latestJewelry?.webpUrl || '/images/categories/highest-price-jewelry-2026.webp',
    alt: latestJewelry?.alt || 'Magenta-accent Kundan-style layered bridal necklace set on a display stand',
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
