/**
 * Banner products verified against live Shopify on 2026-09-08.
 *
 * Selection rule: highest-priced active, published product with at least one
 * available variant in each storefront category. The local images below are
 * optimized copies of those products' Shopify images; product details are not
 * altered.
 */

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

export const FEATURED_CATEGORY_PRODUCTS = {
  lehengas: {
    category: 'Lehengas',
    title: "Pistachio Green Embellished Tissue Viscose Lehenga Choli with Dupatta",
    handle: "pistachio-green-lehenga-luxemia",
    price: 199.97,
    href: '/lehengas',
    image: "https://cdn.shopify.com/s/files/1/0746/4707/7035/files/SqSOpxaPVPXqLswg_fc9e76df-32a6-41af-a70e-e4b1116c2c47.jpg?v=1787249774&width=900",
    imageWebp: "https://cdn.shopify.com/s/files/1/0746/4707/7035/files/SqSOpxaPVPXqLswg_fc9e76df-32a6-41af-a70e-e4b1116c2c47.jpg?v=1787249774&width=900&format=webp",
    alt: "Pistachio Green Embellished Tissue Viscose Lehenga Choli with Dupatta",
  },
  sarees: {
    category: 'Sarees',
    title: "Mint Seafoam Scalloped Metallic Embroidered Viscose Saree",
    handle: "mint-seafoam-saree-luxemia",
    price: 146.5,
    href: '/sarees',
    image: "https://cdn.shopify.com/s/files/1/0746/4707/7035/files/TxOfcpEndlJzbnGu_23c9844f-f675-4746-af6f-fcf797809ea6.jpg?v=1787249941&width=900",
    imageWebp: "https://cdn.shopify.com/s/files/1/0746/4707/7035/files/TxOfcpEndlJzbnGu_23c9844f-f675-4746-af6f-fcf797809ea6.jpg?v=1787249941&width=900&format=webp",
    alt: "Mint Seafoam Scalloped Metallic Embroidered Viscose Saree",
  },
  suits: {
    category: 'Salwar Kameez',
    title: "Powder Blue Premium Viscose Crepe Embroidered Palazzo Suit with Dupatta",
    handle: "powder-blue-viscose-crepe-embroidered-palazzo-suit",
    price: 123.3,
    href: '/suits',
    image: "https://cdn.shopify.com/s/files/1/0746/4707/7035/files/swKVNzOAAXsPGhOW.jpg?v=1787358107&width=900",
    imageWebp: "https://cdn.shopify.com/s/files/1/0746/4707/7035/files/swKVNzOAAXsPGhOW.jpg?v=1787358107&width=900&format=webp",
    alt: "Powder Blue Premium Viscose Crepe Embroidered Palazzo Suit with Dupatta",
  },
  menswear: {
    category: 'Menswear',
    title: "Beige Fancy Work Art Silk Groom Sherwani with Stole",
    handle: "beige-fancy-work-art-silk-groom-sherwani-with-stole",
    price: 334.99,
    href: '/menswear',
    image: "https://cdn.shopify.com/s/files/1/0746/4707/7035/files/beige-art-silk-wedding-sherwani-stole-256488.jpg?v=1787876977&width=900",
    imageWebp: "https://cdn.shopify.com/s/files/1/0746/4707/7035/files/beige-art-silk-wedding-sherwani-stole-256488.jpg?v=1787876977&width=900&format=webp",
    alt: "Beige Fancy Work Art Silk Groom Sherwani with Stole",
  },
  indowestern: {
    category: 'Indo-Western',
    title: 'Cream Indo Western Dress with Thread Embroidery for Wedding',
    handle: 'cream-indo-western-dress-embroidery',
    price: 244.33,
    href: '/indowestern',
    image: '/images/categories/highest-price-indowestern-2026.jpg',
    imageWebp: '/images/categories/highest-price-indowestern-2026.webp',
    alt: 'Cream Indo-Western dress with pink thread embroidery shown on a model',
  },
  jewelry: {
    category: 'Jewelry',
    title: 'Majestic Magenta Kundan Layered Bridal Necklace Set',
    handle: 'majestic-magenta-kundan-layered-bridal-necklace-set',
    price: 200,
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
