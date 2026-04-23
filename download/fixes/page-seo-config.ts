/**
 * ============================================================
 * FIX: Page-specific SEO Configuration
 * ============================================================
 *
 * This file provides the correct SEO props for each page route.
 *
 * KEY PROBLEM FIXED:
 * BEFORE: The static index.html had the SAME generic meta description
 * on EVERY page: "Shop luxury Indian ethnic wear at LuxeMia.
 * Designer lehengas, silk sarees, salwar suits & more. Free
 * shipping to USA & UK. Authentic Indian craftsmanship."
 *
 * This meant Google showed the same description for ALL pages
 * in search results, which is terrible for click-through rates.
 *
 * NOW: Each page has unique, keyword-rich descriptions and titles
 * that match what users search for on that specific page.
 *
 * Usage: Import and spread the relevant config into your <SEO> component
 * ============================================================
 */

export const PAGE_SEO_CONFIG: Record<string, {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  ogType?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqData?: Array<{ question: string; answer: string }>;
}> = {
  // ===== HOMEPAGE =====
  '/': {
    title: 'LuxeMia: Luxury Indian Ethnic Wear Online | Shop Bridal Lehengas & Wedding Sarees',
    description: 'Shop luxury Indian ethnic wear at LuxeMia. Handcrafted bridal lehengas, designer sarees, and anarkali suits with free worldwide shipping to USA, UK & Canada. Authentic craftsmanship for the modern NRI.',
    keywords: 'indian ethnic wear, sarees online, designer lehengas, bridal lehenga, wedding sarees, anarkali suits, banarasi silk, luxury ethnic wear, indian wedding dress, buy sarees online, designer salwar kameez',
    ogImage: 'https://luxemia.shop/og-image.jpg',
    faqData: [
      {
        question: 'Do you offer international shipping for Indian ethnic wear?',
        answer: 'Yes, LuxeMia offers free worldwide shipping, including to the USA, UK, Canada, and many other countries. Free shipping on orders over $300.'
      },
      {
        question: 'What is your return policy for international orders?',
        answer: 'We offer a hassle-free 7-day return policy for most items. Please refer to our Returns Policy page for full details on international returns and exchanges.'
      },
      {
        question: 'Are your products authentic Indian ethnic wear?',
        answer: 'Absolutely. At LuxeMia, we are committed to preserving Indian textile heritage. Every piece is sourced directly from master craftsmen across India, ensuring authentic designs and high-quality materials.'
      },
      {
        question: 'Can I get custom sizing or alterations for my outfit?',
        answer: 'We understand the importance of a perfect fit. While many of our items are ready-to-wear, we do offer custom alteration services for select products. Please contact our styling assistance team for more information.'
      },
      {
        question: 'Do I need to pay customs duties or taxes on international orders?',
        answer: 'While LuxeMia offers free shipping, customers are responsible for any customs duties, taxes, or import fees levied by their country of residence. Please check with your local customs office for more information.'
      }
    ]
  },

  // ===== LEHENGAS PAGE =====
  '/lehengas': {
    title: 'Lehengas: Designer Bridal & Wedding Lehengas Online | LuxeMia',
    description: 'Shop LuxeMia\'s exquisite collection of designer lehengas online. Find bridal lehengas, wedding lehengas, and festive lehenga cholis in silk, net & velvet with free worldwide shipping.',
    keywords: 'designer lehengas online, bridal lehenga, wedding lehenga choli, buy lehengas USA, lehenga for wedding, bridal lehenga online, indian wedding lehenga, red bridal lehenga, pink bridal lehenga',
    ogImage: 'https://luxemia.shop/og/og-lehengas.jpg',
    ogType: 'collection',
    breadcrumbs: [
      { name: 'Home', url: 'https://luxemia.shop/' },
      { name: 'Collections', url: 'https://luxemia.shop/collections' },
      { name: 'Lehengas', url: 'https://luxemia.shop/lehengas' }
    ],
    faqData: [
      {
        question: 'What types of lehengas are available at LuxeMia?',
        answer: 'LuxeMia offers bridal lehengas, reception lehengas, festive lehengas, and party wear in various fabrics including Net, Silk, Velvet, Georgette, Chinnon, and Roman Silk.'
      },
      {
        question: 'How do I find the right lehenga size?',
        answer: 'We offer sizes S, M, L, XL, XXL, and Custom sizing. For bridal lehengas, we highly recommend custom sizing for a perfect fit.'
      },
      {
        question: 'What is included in a lehenga set?',
        answer: 'Every LuxeMia lehenga set includes the lehenga skirt, matching choli (blouse), and dupatta. Bridal sets often include additional accessories like cancan for volume and a matching potli bag.'
      },
      {
        question: 'How long does it take to receive a bridal lehenga?',
        answer: 'Ready-to-ship lehengas arrive in 7-12 business days (standard) or 3-5 days (express). Custom-sized bridal lehengas require 3-4 weeks for handcrafting.'
      },
      {
        question: 'Can I customize the color of my lehenga?',
        answer: 'Yes! Most of our lehengas can be customized in different colors. Contact our styling team with your color preferences.'
      }
    ]
  },

  // ===== SAREES PAGE =====
  '/sarees': {
    title: 'Sarees: Designer Silk & Bridal Sarees Online | LuxeMia',
    description: 'Shop LuxeMia\'s stunning collection of designer sarees. Banarasi silk, Kanjivaram, and bridal wedding sarees with exquisite embroidery. Free shipping to USA, UK & Canada.',
    keywords: 'sarees online, designer sarees, bridal saree, wedding saree, banarasi silk saree, kanjivaram saree, buy sarees USA, indian saree online, silk saree',
    ogImage: 'https://luxemia.shop/og/og-sarees.jpg',
    ogType: 'collection',
    breadcrumbs: [
      { name: 'Home', url: 'https://luxemia.shop/' },
      { name: 'Collections', url: 'https://luxemia.shop/collections' },
      { name: 'Sarees', url: 'https://luxemia.shop/sarees' }
    ]
  },

  // ===== SUITS PAGE =====
  '/suits': {
    title: 'Salwar Kameez & Anarkali Suits Online | LuxeMia',
    description: 'Shop LuxeMia\'s elegant salwar kameez, anarkali suits, sharara sets & palazzo suits. Designer Indian suits with embroidery & sequin work. Free worldwide shipping.',
    keywords: 'salwar kameez online, anarkali suit, sharara set, designer suits, indian suits online, buy salwar kameez USA, anarkali suit USA, party wear suits',
    ogImage: 'https://luxemia.shop/og/og-suits.jpg',
    ogType: 'collection',
    breadcrumbs: [
      { name: 'Home', url: 'https://luxemia.shop/' },
      { name: 'Collections', url: 'https://luxemia.shop/collections' },
      { name: 'Salwar Kameez', url: 'https://luxemia.shop/suits' }
    ]
  },

  // ===== MENSWEAR PAGE =====
  '/menswear': {
    title: 'Menswear: Sherwanis & Kurtas Online | LuxeMia',
    description: 'Shop LuxeMia\'s premium menswear collection. Groom sherwanis, wedding kurtas, and festive men\'s ethnic wear with hand embroidery. Free worldwide shipping.',
    keywords: 'sherwani online, groom sherwani, men kurta, wedding sherwani, buy sherwani USA, indian menswear, ethnic wear for men, wedding kurta pajama',
    ogImage: 'https://luxemia.shop/og/og-menswear.jpg',
    ogType: 'collection',
    breadcrumbs: [
      { name: 'Home', url: 'https://luxemia.shop/' },
      { name: 'Menswear', url: 'https://luxemia.shop/menswear' }
    ]
  },

  // ===== JEWELRY PAGE =====
  '/jewelry': {
    title: 'Jewelry: Indian Fashion Jewelry & Accessories | LuxeMia',
    description: 'Shop LuxeMia\'s curated Indian jewelry collection. Statement necklaces, earrings, bangles & maang tikka to complement your ethnic outfit. Free worldwide shipping.',
    keywords: 'indian jewelry online, fashion jewelry, ethnic jewelry, statement necklace, indian earrings, bridal jewelry, buy indian jewelry USA',
    ogImage: 'https://luxemia.shop/og/og-jewelry.jpg',
    ogType: 'collection',
    breadcrumbs: [
      { name: 'Home', url: 'https://luxemia.shop/' },
      { name: 'Jewelry', url: 'https://luxemia.shop/jewelry' }
    ]
  },

  // ===== INDO-WESTERN PAGE =====
  '/indowestern': {
    title: 'Indo-Western: Fusion Wear & Modern Indian Outfits | LuxeMia',
    description: 'Shop LuxeMia\'s Indo-Western collection. Fusion wear combining Indian and Western silhouettes for the modern woman. Free worldwide shipping to USA, UK & Canada.',
    keywords: 'indo western wear, fusion wear, modern indian outfits, indo western dress, indo western gown, buy indo western USA',
    ogImage: 'https://luxemia.shop/og/og-indowestern.jpg',
    ogType: 'collection',
    breadcrumbs: [
      { name: 'Home', url: 'https://luxemia.shop/' },
      { name: 'Indo-Western', url: 'https://luxemia.shop/indowestern' }
    ]
  },

  // ===== NEW ARRIVALS =====
  '/new-arrivals': {
    title: 'New Arrivals: Latest Indian Ethnic Wear | LuxeMia',
    description: 'Discover the latest arrivals at LuxeMia. New designer lehengas, sarees, suits & sherwanis added weekly. Shop fresh Indian ethnic wear with free worldwide shipping.',
    keywords: 'new arrivals indian wear, latest lehengas, new saree collection, new ethnic wear, latest indian fashion',
    ogImage: 'https://luxemia.shop/og-image.jpg',
    breadcrumbs: [
      { name: 'Home', url: 'https://luxemia.shop/' },
      { name: 'New Arrivals', url: 'https://luxemia.shop/new-arrivals' }
    ]
  },

  // ===== BLOG INDEX =====
  '/blog': {
    title: 'Blog: Indian Wedding Fashion & Style Guides | LuxeMia',
    description: 'Expert guides on Indian wedding fashion, bridal lehenga trends, saree draping styles, and ethnic wear tips for NRIs. Your complete resource for Indian ethnic fashion.',
    keywords: 'indian wedding fashion blog, bridal lehenga guide, saree draping styles, ethnic wear tips, NRI wedding fashion',
    ogImage: 'https://luxemia.shop/og-image.jpg',
    breadcrumbs: [
      { name: 'Home', url: 'https://luxemia.shop/' },
      { name: 'Blog', url: 'https://luxemia.shop/blog' }
    ]
  },

  // ===== NRI LANDING PAGES =====
  '/indian-ethnic-wear-usa': {
    title: 'Indian Ethnic Wear USA: Buy Lehengas, Sarees & Suits Online | LuxeMia',
    description: 'Shop Indian ethnic wear online in USA. Free shipping on bridal lehengas, designer sarees, anarkali suits & sherwanis. Authentic Indian craftsmanship delivered to your doorstep.',
    keywords: 'indian ethnic wear USA, buy lehengas USA, indian sarees USA, indian clothes USA, indian wedding dress USA, buy indian ethnic wear online USA',
    ogImage: 'https://luxemia.shop/og/og-usa.jpg',
    breadcrumbs: [
      { name: 'Home', url: 'https://luxemia.shop/' },
      { name: 'Indian Ethnic Wear USA', url: 'https://luxemia.shop/indian-ethnic-wear-usa' }
    ]
  },
  '/indian-ethnic-wear-uk': {
    title: 'Indian Ethnic Wear UK: Buy Lehengas, Sarees & Suits Online | LuxeMia',
    description: 'Shop Indian ethnic wear online in UK. Free shipping on bridal lehengas, designer sarees, anarkali suits & sherwanis. Authentic Indian craftsmanship delivered to the UK.',
    keywords: 'indian ethnic wear UK, buy lehengas UK, indian sarees UK, indian clothes UK, indian wedding dress UK, buy indian ethnic wear online UK',
    ogImage: 'https://luxemia.shop/og/og-uk.jpg',
    breadcrumbs: [
      { name: 'Home', url: 'https://luxemia.shop/' },
      { name: 'Indian Ethnic Wear UK', url: 'https://luxemia.shop/indian-ethnic-wear-uk' }
    ]
  },
  '/indian-ethnic-wear-canada': {
    title: 'Indian Ethnic Wear Canada: Buy Lehengas, Sarees & Suits Online | LuxeMia',
    description: 'Shop Indian ethnic wear online in Canada. Free shipping on bridal lehengas, designer sarees, anarkali suits & sherwanis. Authentic Indian craftsmanship delivered to Canada.',
    keywords: 'indian ethnic wear Canada, buy lehengas Canada, indian sarees Canada, indian clothes Canada, indian wedding dress Canada',
    ogImage: 'https://luxemia.shop/og/og-canada.jpg',
    breadcrumbs: [
      { name: 'Home', url: 'https://luxemia.shop/' },
      { name: 'Indian Ethnic Wear Canada', url: 'https://luxemia.shop/indian-ethnic-wear-canada' }
    ]
  }
};

/**
 * Helper function to get SEO config for a path
 * Falls back to homepage config if no specific config exists
 */
export function getSEOConfig(pathname: string) {
  // Exact match
  if (PAGE_SEO_CONFIG[pathname]) {
    return PAGE_SEO_CONFIG[pathname];
  }

  // Blog post pattern
  if (pathname.startsWith('/blog/')) {
    return {
      ...PAGE_SEO_CONFIG['/blog'],
      ogType: 'article'
    };
  }

  // Product page pattern
  if (pathname.startsWith('/product/')) {
    return {
      title: 'Product | LuxeMia',
      description: 'Shop this beautiful Indian ethnic wear piece at LuxeMia. Free worldwide shipping to USA, UK & Canada.',
      keywords: 'indian ethnic wear, buy online, luxury lehenga, designer saree',
      ogType: 'product'
    };
  }

  // Collection page pattern
  if (pathname.startsWith('/collections/')) {
    return {
      title: 'Collection | LuxeMia',
      description: 'Browse LuxeMia\'s curated collection of luxury Indian ethnic wear. Free worldwide shipping.',
      keywords: 'indian ethnic wear collection, designer collection',
      ogType: 'collection'
    };
  }

  // Default to homepage config
  return PAGE_SEO_CONFIG['/'];
}
