// Local product data for preview - will be synced to Shopify when ready
export interface LocalProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  images: string[];
  category: string;
  tags: string[];
  variants: Array<{
    id: string;
    title: string;
    price: string;
    options: Record<string, string>;
  }>;
  options: Array<{
    name: string;
    values: string[];
  }>;
}

export const localProducts: LocalProduct[] = [
  {
    id: "local-1",
    handle: "emerald-green-embroidered-designer-lehenga",
    title: "Emerald Green Embroidered Designer Lehenga",
    description: "Stunning emerald green lehenga with intricate embroidery work, perfect for weddings and special occasions.",
    price: "299.00",
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10626-A.webp",
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10626-B.webp"
    ],
    category: "Lehengas",
    tags: ["lehenga", "bridal", "embroidered", "green"],
    variants: [
      { id: "v1-s", title: "S", price: "299.00", options: { Size: "S" } },
      { id: "v1-m", title: "M", price: "299.00", options: { Size: "M" } },
      { id: "v1-l", title: "L", price: "299.00", options: { Size: "L" } },
      { id: "v1-xl", title: "XL", price: "299.00", options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "local-2",
    handle: "royal-blue-silk-lehenga-choli",
    title: "Royal Blue Silk Lehenga Choli",
    description: "Elegant royal blue silk lehenga with traditional craftsmanship and modern silhouette.",
    price: "349.00",
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10627-A.webp",
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10627-B.webp"
    ],
    category: "Lehengas",
    tags: ["lehenga", "silk", "blue", "traditional"],
    variants: [
      { id: "v2-s", title: "S", price: "349.00", options: { Size: "S" } },
      { id: "v2-m", title: "M", price: "349.00", options: { Size: "M" } },
      { id: "v2-l", title: "L", price: "349.00", options: { Size: "L" } },
      { id: "v2-xl", title: "XL", price: "349.00", options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "local-3",
    handle: "pink-floral-designer-lehenga",
    title: "Pink Floral Designer Lehenga",
    description: "Beautiful pink lehenga featuring delicate floral embroidery and contemporary design.",
    price: "275.00",
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10628-A.webp",
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10628-B.webp"
    ],
    category: "Lehengas",
    tags: ["lehenga", "floral", "pink", "designer"],
    variants: [
      { id: "v3-s", title: "S", price: "275.00", options: { Size: "S" } },
      { id: "v3-m", title: "M", price: "275.00", options: { Size: "M" } },
      { id: "v3-l", title: "L", price: "275.00", options: { Size: "L" } },
      { id: "v3-xl", title: "XL", price: "275.00", options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "local-4",
    handle: "maroon-velvet-bridal-lehenga",
    title: "Maroon Velvet Bridal Lehenga",
    description: "Luxurious maroon velvet lehenga with heavy zari work, perfect for the modern bride.",
    price: "450.00",
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10629-A.webp",
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10629-B.webp"
    ],
    category: "Lehengas",
    tags: ["lehenga", "velvet", "bridal", "maroon"],
    variants: [
      { id: "v4-s", title: "S", price: "450.00", options: { Size: "S" } },
      { id: "v4-m", title: "M", price: "450.00", options: { Size: "M" } },
      { id: "v4-l", title: "L", price: "450.00", options: { Size: "L" } },
      { id: "v4-xl", title: "XL", price: "450.00", options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "local-5",
    handle: "gold-embellished-reception-lehenga",
    title: "Gold Embellished Reception Lehenga",
    description: "Stunning gold lehenga with intricate embellishments, ideal for reception and sangeet.",
    price: "399.00",
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10630-A.webp",
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10630-B.webp"
    ],
    category: "Lehengas",
    tags: ["lehenga", "gold", "reception", "embellished"],
    variants: [
      { id: "v5-s", title: "S", price: "399.00", options: { Size: "S" } },
      { id: "v5-m", title: "M", price: "399.00", options: { Size: "M" } },
      { id: "v5-l", title: "L", price: "399.00", options: { Size: "L" } },
      { id: "v5-xl", title: "XL", price: "399.00", options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "local-6",
    handle: "ivory-pearl-designer-lehenga",
    title: "Ivory Pearl Designer Lehenga",
    description: "Elegant ivory lehenga with pearl detailing and subtle embroidery for a sophisticated look.",
    price: "325.00",
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10631-A.webp",
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10631-B.webp"
    ],
    category: "Lehengas",
    tags: ["lehenga", "ivory", "pearl", "elegant"],
    variants: [
      { id: "v6-s", title: "S", price: "325.00", options: { Size: "S" } },
      { id: "v6-m", title: "M", price: "325.00", options: { Size: "M" } },
      { id: "v6-l", title: "L", price: "325.00", options: { Size: "L" } },
      { id: "v6-xl", title: "XL", price: "325.00", options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "local-7",
    handle: "teal-georgette-party-lehenga",
    title: "Teal Georgette Party Lehenga",
    description: "Vibrant teal georgette lehenga with contemporary design, perfect for parties and celebrations.",
    price: "285.00",
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10632-A.webp",
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10632-B.webp"
    ],
    category: "Lehengas",
    tags: ["lehenga", "teal", "georgette", "party"],
    variants: [
      { id: "v7-s", title: "S", price: "285.00", options: { Size: "S" } },
      { id: "v7-m", title: "M", price: "285.00", options: { Size: "M" } },
      { id: "v7-l", title: "L", price: "285.00", options: { Size: "L" } },
      { id: "v7-xl", title: "XL", price: "285.00", options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "local-8",
    handle: "burgundy-sequin-festive-lehenga",
    title: "Burgundy Sequin Festive Lehenga",
    description: "Eye-catching burgundy lehenga with all-over sequin work for festive occasions.",
    price: "375.00",
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10633-A.webp",
      "https://kesimg.b-cdn.net/retail/designer-lehenga-choli/designer-lehenga-choli-lc10633-B.webp"
    ],
    category: "Lehengas",
    tags: ["lehenga", "burgundy", "sequin", "festive"],
    variants: [
      { id: "v8-s", title: "S", price: "375.00", options: { Size: "S" } },
      { id: "v8-m", title: "M", price: "375.00", options: { Size: "M" } },
      { id: "v8-l", title: "L", price: "375.00", options: { Size: "L" } },
      { id: "v8-xl", title: "XL", price: "375.00", options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  }
];

// Helper to convert local product to Shopify-like format for component compatibility
export function toShopifyFormat(product: LocalProduct) {
  return {
    node: {
      id: product.id,
      title: product.title,
      description: product.description,
      handle: product.handle,
      priceRange: {
        minVariantPrice: {
          amount: product.price,
          currencyCode: product.currency
        }
      },
      images: {
        edges: product.images.map((url, i) => ({
          node: {
            url,
            altText: `${product.title} - Image ${i + 1}`
          }
        }))
      },
      variants: {
        edges: product.variants.map(v => ({
          node: {
            id: v.id,
            title: v.title,
            price: {
              amount: v.price,
              currencyCode: product.currency
            },
            availableForSale: true,
            selectedOptions: Object.entries(v.options).map(([name, value]) => ({ name, value }))
          }
        }))
      },
      options: product.options
    }
  };
}

export function getLocalProductByHandle(handle: string) {
  const product = localProducts.find(p => p.handle === handle);
  return product ? toShopifyFormat(product) : null;
}

export function getAllLocalProducts() {
  return localProducts.map(toShopifyFormat);
}
