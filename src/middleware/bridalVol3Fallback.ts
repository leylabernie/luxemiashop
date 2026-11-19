/**
 * Royal Bridal Silk Edit — Vol. 3 Edge Middleware Fallback
 *
 * Compact pure-TS catalog (no JSON import attributes, ~9 KB total) for the 10
 * published Vol. 3 bridal lehenga handles linked from the homepage and bridal
 * edits. Serves clean 200 OK indexable SSR HTML prior to Shopify CSV sync; live
 * Shopify Storefront lookups always run first and supersede this automatically.
 */

import type { ShopifyProduct } from "./shopifyProxy.js";

interface CompactVol3Product {
  readonly handle: string;
  readonly title: string;
  readonly sku: string;
  readonly color: string;
  readonly price: string;
  readonly compareAtPrice: string | null;
  readonly description: string;
  readonly tags: readonly string[];
  readonly images: readonly string[];
  readonly sizes: readonly string[];
}

const ACTIVE_VOL3_PRODUCTS: readonly CompactVol3Product[] = [
  {
    "handle": "crimson-red-silk-royal-arch-zardosi-bridal-lehenga-double-dupatta",
    "title": "Crimson Red Silk Royal Arch Zardosi Bridal Lehenga Choli with Double Dupatta",
    "sku": "LM-BV3-167",
    "color": "Crimson Red",
    "price": "436.11",
    "compareAtPrice": "566.94",
    "description": "Shop Crimson Red Silk Zardosi Bridal Lehenga Choli ($436.11) with 4.5m flare, cancan, readymade blouse & double dupatta. Sizes 32–42 & Custom Fit.",
    "tags": [
      "bridal-lehenga",
      "lehenga",
      "lehenga-choli",
      "silk-lehenga",
      "double-dupatta-lehenga",
      "wedding-lehenga",
      "zardosi-lehenga",
      "royal-bridal-vol-3",
      "utsav-tailoring",
      "design-family:royal-arch-scalloped-lotus",
      "color:red",
      "shade:crimson-red",
      "fabric:Bridal Silk",
      "material:Silk; Soft Net; Viscose",
      "work:Zardosi, Cutdana, Pearl, Bead, Multi-Thread & Cutwork Embroidery",
      "construction:Stitched",
      "tailoring:Standard sizes 32-42 and Custom Fit tailoring",
      "included:Stitched bridal silk lehenga with cancan; Readymade embroidered silk blouse; Embroidered soft net veil dupatta; Embroidered viscose drape dupatta",
      "occasion:Bridal",
      "occasion:Wedding",
      "occasion:Reception",
      "style:bridal",
      "style:traditional",
      "role:bride",
      "availability:ready-to-ship",
      "ships-within:3-4 business days",
      "new-arrival"
    ],
    "images": [
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-167-crimson-arch-1.jpg",
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-167-crimson-arch-2.jpg"
    ],
    "sizes": [
      "32",
      "34",
      "36",
      "38",
      "40",
      "42",
      "44",
      "46",
      "Custom Fit"
    ]
  },
  {
    "handle": "vermilion-red-silk-peacock-scallop-bridal-lehenga-double-dupatta",
    "title": "Vermilion Red Silk Peacock Scallop Zardosi Bridal Lehenga Choli with Double Dupatta",
    "sku": "LM-BV3-169",
    "color": "Vermilion Red",
    "price": "391.67",
    "compareAtPrice": "509.17",
    "description": "Shop Vermilion Red Silk Zardosi Bridal Lehenga Choli ($391.67) with 4.5m flare, cancan, readymade blouse & double dupatta. Sizes 32–42 & Custom Fit.",
    "tags": [
      "bridal-lehenga",
      "lehenga",
      "lehenga-choli",
      "silk-lehenga",
      "double-dupatta-lehenga",
      "wedding-lehenga",
      "zardosi-lehenga",
      "royal-bridal-vol-3",
      "utsav-tailoring",
      "design-family:peacock-scallop-mihrab",
      "color:red",
      "shade:vermilion-red",
      "fabric:Bridal Silk",
      "material:Silk; Soft Net; Viscose",
      "work:Zardosi, Cutdana, Pearl, Bead, Multi-Thread & Cutwork Embroidery",
      "construction:Stitched",
      "tailoring:Standard sizes 32-42 and Custom Fit tailoring",
      "included:Stitched bridal silk lehenga with cancan; Readymade embroidered silk blouse; Embroidered soft net veil dupatta; Embroidered viscose drape dupatta",
      "occasion:Bridal",
      "occasion:Wedding",
      "occasion:Reception",
      "style:bridal",
      "style:traditional",
      "role:bride",
      "availability:ready-to-ship",
      "ships-within:3-4 business days",
      "new-arrival"
    ],
    "images": [
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-169-vermilion-peacock-1.jpg",
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-169-vermilion-peacock-2.jpg"
    ],
    "sizes": [
      "32",
      "34",
      "36",
      "38",
      "40",
      "42",
      "44",
      "46",
      "Custom Fit"
    ]
  },
  {
    "handle": "scarlet-red-silk-mughal-paisley-bridal-lehenga-double-dupatta",
    "title": "Scarlet Red Silk Mughal Paisley Zardosi Bridal Lehenga Choli with Double Dupatta",
    "sku": "LM-BV3-170",
    "color": "Scarlet Red",
    "price": "356.78",
    "compareAtPrice": "463.81",
    "description": "Shop Scarlet Red Silk Zardosi Bridal Lehenga Choli ($356.78) with 4.5m flare, cancan, readymade blouse & double dupatta. Sizes 32–42 & Custom Fit.",
    "tags": [
      "bridal-lehenga",
      "lehenga",
      "lehenga-choli",
      "silk-lehenga",
      "double-dupatta-lehenga",
      "wedding-lehenga",
      "zardosi-lehenga",
      "royal-bridal-vol-3",
      "utsav-tailoring",
      "design-family:mughal-paisley-geometric",
      "color:red",
      "shade:scarlet-red",
      "fabric:Bridal Silk",
      "material:Silk; Soft Net; Viscose",
      "work:Zardosi, Cutdana, Pearl, Bead, Multi-Thread & Cutwork Embroidery",
      "construction:Stitched",
      "tailoring:Standard sizes 32-42 and Custom Fit tailoring",
      "included:Stitched bridal silk lehenga with cancan; Readymade embroidered silk blouse; Embroidered soft net veil dupatta; Embroidered viscose drape dupatta",
      "occasion:Bridal",
      "occasion:Wedding",
      "occasion:Reception",
      "style:bridal",
      "style:traditional",
      "role:bride",
      "availability:ready-to-ship",
      "ships-within:3-4 business days",
      "new-arrival"
    ],
    "images": [
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-170-scarlet-paisley-1.jpg",
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-170-scarlet-paisley-2.jpg"
    ],
    "sizes": [
      "32",
      "34",
      "36",
      "38",
      "40",
      "42",
      "44",
      "46",
      "Custom Fit"
    ]
  },
  {
    "handle": "royal-fuchsia-silk-mughal-paisley-bridal-lehenga-double-dupatta",
    "title": "Royal Fuchsia Silk Mughal Paisley Zardosi Bridal Lehenga Choli with Double Dupatta",
    "sku": "LM-BV3-171",
    "color": "Royal Fuchsia",
    "price": "356.78",
    "compareAtPrice": "463.81",
    "description": "Shop Royal Fuchsia Silk Zardosi Bridal Lehenga Choli ($356.78) with 4.5m flare, cancan, readymade blouse & double dupatta. Sizes 32–42 & Custom Fit.",
    "tags": [
      "bridal-lehenga",
      "lehenga",
      "lehenga-choli",
      "silk-lehenga",
      "double-dupatta-lehenga",
      "wedding-lehenga",
      "zardosi-lehenga",
      "royal-bridal-vol-3",
      "utsav-tailoring",
      "design-family:mughal-paisley-geometric",
      "color:pink",
      "shade:royal-fuchsia",
      "fabric:Bridal Silk",
      "material:Silk; Soft Net; Viscose",
      "work:Zardosi, Cutdana, Pearl, Bead, Multi-Thread & Cutwork Embroidery",
      "construction:Stitched",
      "tailoring:Standard sizes 32-42 and Custom Fit tailoring",
      "included:Stitched bridal silk lehenga with cancan; Readymade embroidered silk blouse; Embroidered soft net veil dupatta; Embroidered viscose drape dupatta",
      "occasion:Bridal",
      "occasion:Wedding",
      "occasion:Reception",
      "style:bridal",
      "style:traditional",
      "role:bride",
      "availability:ready-to-ship",
      "ships-within:3-4 business days",
      "new-arrival"
    ],
    "images": [
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-171-fuchsia-paisley-1.jpg",
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-171-fuchsia-paisley-2.jpg"
    ],
    "sizes": [
      "32",
      "34",
      "36",
      "38",
      "40",
      "42",
      "44",
      "46",
      "Custom Fit"
    ]
  },
  {
    "handle": "rani-magenta-silk-rajputana-palace-bridal-lehenga-double-dupatta",
    "title": "Rani Magenta Silk Rajputana Palace Zardosi Bridal Lehenga Choli with Double Dupatta",
    "sku": "LM-BV3-172",
    "color": "Rani Magenta",
    "price": "415.44",
    "compareAtPrice": "540.07",
    "description": "Shop Rani Magenta Silk Zardosi Bridal Lehenga Choli ($415.44) with 4.5m flare, cancan, readymade blouse & double dupatta. Sizes 32–42 & Custom Fit.",
    "tags": [
      "bridal-lehenga",
      "lehenga",
      "lehenga-choli",
      "silk-lehenga",
      "double-dupatta-lehenga",
      "wedding-lehenga",
      "zardosi-lehenga",
      "royal-bridal-vol-3",
      "utsav-tailoring",
      "design-family:rajputana-palace-baraat",
      "color:magenta",
      "shade:rani-magenta",
      "fabric:Bridal Silk",
      "material:Silk; Soft Net; Viscose",
      "work:Zardosi, Cutdana, Pearl, Bead, Multi-Thread & Cutwork Embroidery",
      "construction:Stitched",
      "tailoring:Standard sizes 32-42 and Custom Fit tailoring",
      "included:Stitched bridal silk lehenga with cancan; Readymade embroidered silk blouse; Embroidered soft net veil dupatta; Embroidered viscose drape dupatta",
      "occasion:Bridal",
      "occasion:Wedding",
      "occasion:Reception",
      "style:bridal",
      "style:traditional",
      "role:bride",
      "availability:ready-to-ship",
      "ships-within:3-4 business days",
      "new-arrival"
    ],
    "images": [
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-172-magenta-palace-1.jpg",
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-172-magenta-palace-2.jpg"
    ],
    "sizes": [
      "32",
      "34",
      "36",
      "38",
      "40",
      "42",
      "44",
      "46",
      "Custom Fit"
    ]
  },
  {
    "handle": "crimson-red-silk-rajputana-palace-bridal-lehenga-double-dupatta",
    "title": "Crimson Red Silk Rajputana Palace Zardosi Bridal Lehenga Choli with Double Dupatta",
    "sku": "LM-BV3-173",
    "color": "Crimson Red",
    "price": "415.44",
    "compareAtPrice": "540.07",
    "description": "Shop Crimson Red Silk Zardosi Bridal Lehenga Choli ($415.44) with 4.5m flare, cancan, readymade blouse & double dupatta. Sizes 32–42 & Custom Fit.",
    "tags": [
      "bridal-lehenga",
      "lehenga",
      "lehenga-choli",
      "silk-lehenga",
      "double-dupatta-lehenga",
      "wedding-lehenga",
      "zardosi-lehenga",
      "royal-bridal-vol-3",
      "utsav-tailoring",
      "design-family:rajputana-palace-baraat",
      "color:red",
      "shade:crimson-red",
      "fabric:Bridal Silk",
      "material:Silk; Soft Net; Viscose",
      "work:Zardosi, Cutdana, Pearl, Bead, Multi-Thread & Cutwork Embroidery",
      "construction:Stitched",
      "tailoring:Standard sizes 32-42 and Custom Fit tailoring",
      "included:Stitched bridal silk lehenga with cancan; Readymade embroidered silk blouse; Embroidered soft net veil dupatta; Embroidered viscose drape dupatta",
      "occasion:Bridal",
      "occasion:Wedding",
      "occasion:Reception",
      "style:bridal",
      "style:traditional",
      "role:bride",
      "availability:ready-to-ship",
      "ships-within:3-4 business days",
      "new-arrival"
    ],
    "images": [
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-173-crimson-palace-1.jpg",
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-173-crimson-palace-2.jpg",
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-173-crimson-palace-3.jpg"
    ],
    "sizes": [
      "32",
      "34",
      "36",
      "38",
      "40",
      "42",
      "44",
      "46",
      "Custom Fit"
    ]
  },
  {
    "handle": "rani-pink-silk-heritage-jharokha-bridal-lehenga-double-dupatta",
    "title": "Rani Pink Silk Heritage Jharokha Zardosi Bridal Lehenga Choli with Double Dupatta",
    "sku": "LM-BV3-174",
    "color": "Rani Pink",
    "price": "443.89",
    "compareAtPrice": "577.06",
    "description": "Shop Rani Pink Silk Zardosi Bridal Lehenga Choli ($443.89) with 4.5m flare, cancan, readymade blouse & double dupatta. Sizes 32–42 & Custom Fit.",
    "tags": [
      "bridal-lehenga",
      "lehenga",
      "lehenga-choli",
      "silk-lehenga",
      "double-dupatta-lehenga",
      "wedding-lehenga",
      "zardosi-lehenga",
      "royal-bridal-vol-3",
      "utsav-tailoring",
      "design-family:heritage-jharokha-chevron",
      "color:pink",
      "shade:rani-pink",
      "fabric:Bridal Silk",
      "material:Silk; Soft Net; Viscose",
      "work:Zardosi, Cutdana, Pearl, Bead, Multi-Thread & Cutwork Embroidery",
      "construction:Stitched",
      "tailoring:Standard sizes 32-42 and Custom Fit tailoring",
      "included:Stitched bridal silk lehenga with cancan; Readymade embroidered silk blouse; Embroidered soft net veil dupatta; Embroidered viscose drape dupatta",
      "occasion:Bridal",
      "occasion:Wedding",
      "occasion:Reception",
      "style:bridal",
      "style:traditional",
      "role:bride",
      "availability:ready-to-ship",
      "ships-within:3-4 business days",
      "new-arrival"
    ],
    "images": [
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-174-rani-jharokha-1.jpg",
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-174-rani-jharokha-2.jpg"
    ],
    "sizes": [
      "32",
      "34",
      "36",
      "38",
      "40",
      "42",
      "44",
      "46",
      "Custom Fit"
    ]
  },
  {
    "handle": "sindoori-red-silk-heritage-jharokha-bridal-lehenga-double-dupatta",
    "title": "Sindoori Red Silk Heritage Jharokha Zardosi Bridal Lehenga Choli with Double Dupatta",
    "sku": "LM-BV3-175",
    "color": "Sindoori Red",
    "price": "443.89",
    "compareAtPrice": "577.06",
    "description": "Shop Sindoori Red Silk Zardosi Bridal Lehenga Choli ($443.89) with 4.5m flare, cancan, readymade blouse & double dupatta. Sizes 32–42 & Custom Fit.",
    "tags": [
      "bridal-lehenga",
      "lehenga",
      "lehenga-choli",
      "silk-lehenga",
      "double-dupatta-lehenga",
      "wedding-lehenga",
      "zardosi-lehenga",
      "royal-bridal-vol-3",
      "utsav-tailoring",
      "design-family:heritage-jharokha-chevron",
      "color:red",
      "shade:sindoori-red",
      "fabric:Bridal Silk",
      "material:Silk; Soft Net; Viscose",
      "work:Zardosi, Cutdana, Pearl, Bead, Multi-Thread & Cutwork Embroidery",
      "construction:Stitched",
      "tailoring:Standard sizes 32-42 and Custom Fit tailoring",
      "included:Stitched bridal silk lehenga with cancan; Readymade embroidered silk blouse; Embroidered soft net veil dupatta; Embroidered viscose drape dupatta",
      "occasion:Bridal",
      "occasion:Wedding",
      "occasion:Reception",
      "style:bridal",
      "style:traditional",
      "role:bride",
      "availability:ready-to-ship",
      "ships-within:3-4 business days",
      "new-arrival"
    ],
    "images": [
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-175-sindoori-jharokha-1.jpg",
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-175-sindoori-jharokha-2.jpg",
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-175-sindoori-jharokha-3.jpg",
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-175-sindoori-jharokha-4.jpg"
    ],
    "sizes": [
      "32",
      "34",
      "36",
      "38",
      "40",
      "42",
      "44",
      "46",
      "Custom Fit"
    ]
  },
  {
    "handle": "marigold-saffron-silk-royal-arch-bridal-lehenga-double-dupatta",
    "title": "Marigold Saffron Silk Royal Arch Zardosi Bridal Lehenga Choli with Double Dupatta",
    "sku": "LM-BV3-178",
    "color": "Marigold Saffron",
    "price": "436.11",
    "compareAtPrice": "566.94",
    "description": "Shop Marigold Saffron Silk Zardosi Bridal Lehenga Choli ($436.11) with 4.5m flare, cancan, readymade blouse & double dupatta. Sizes 32–42 & Custom Fit.",
    "tags": [
      "bridal-lehenga",
      "lehenga",
      "lehenga-choli",
      "silk-lehenga",
      "double-dupatta-lehenga",
      "wedding-lehenga",
      "zardosi-lehenga",
      "royal-bridal-vol-3",
      "utsav-tailoring",
      "design-family:royal-arch-scalloped-lotus",
      "color:orange",
      "shade:marigold-saffron",
      "fabric:Bridal Silk",
      "material:Silk; Soft Net; Viscose",
      "work:Zardosi, Cutdana, Pearl, Bead, Multi-Thread & Cutwork Embroidery",
      "construction:Stitched",
      "tailoring:Standard sizes 32-42 and Custom Fit tailoring",
      "included:Stitched bridal silk lehenga with cancan; Readymade embroidered silk blouse; Embroidered soft net veil dupatta; Embroidered viscose drape dupatta",
      "occasion:Bridal",
      "occasion:Wedding",
      "occasion:Reception",
      "style:bridal",
      "style:traditional",
      "role:bride",
      "availability:ready-to-ship",
      "ships-within:3-4 business days",
      "new-arrival"
    ],
    "images": [
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-178-marigold-arch-1.jpg",
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-178-marigold-arch-2.jpg"
    ],
    "sizes": [
      "32",
      "34",
      "36",
      "38",
      "40",
      "42",
      "44",
      "46",
      "Custom Fit"
    ]
  },
  {
    "handle": "burnt-saffron-silk-rajputana-palace-bridal-lehenga-double-dupatta",
    "title": "Burnt Saffron Silk Rajputana Palace Zardosi Bridal Lehenga Choli with Double Dupatta",
    "sku": "LM-BV3-179",
    "color": "Burnt Saffron",
    "price": "415.44",
    "compareAtPrice": "540.07",
    "description": "Shop Burnt Saffron Silk Zardosi Bridal Lehenga Choli ($415.44) with 4.5m flare, cancan, readymade blouse & double dupatta. Sizes 32–42 & Custom Fit.",
    "tags": [
      "bridal-lehenga",
      "lehenga",
      "lehenga-choli",
      "silk-lehenga",
      "double-dupatta-lehenga",
      "wedding-lehenga",
      "zardosi-lehenga",
      "royal-bridal-vol-3",
      "utsav-tailoring",
      "design-family:rajputana-palace-baraat",
      "color:orange",
      "shade:burnt-saffron",
      "fabric:Bridal Silk",
      "material:Silk; Soft Net; Viscose",
      "work:Zardosi, Cutdana, Pearl, Bead, Multi-Thread & Cutwork Embroidery",
      "construction:Stitched",
      "tailoring:Standard sizes 32-42 and Custom Fit tailoring",
      "included:Stitched bridal silk lehenga with cancan; Readymade embroidered silk blouse; Embroidered soft net veil dupatta; Embroidered viscose drape dupatta",
      "occasion:Bridal",
      "occasion:Wedding",
      "occasion:Reception",
      "style:bridal",
      "style:traditional",
      "role:bride",
      "availability:ready-to-ship",
      "ships-within:3-4 business days",
      "new-arrival"
    ],
    "images": [
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-179-terracotta-palace-1.jpg",
      "https://luxemia.shop/images/bridal-vol3/luxemia-bv3-179-terracotta-palace-2.jpg"
    ],
    "sizes": [
      "32",
      "34",
      "36",
      "38",
      "40",
      "42",
      "44",
      "46",
      "Custom Fit"
    ]
  }
];

const VOL3_BY_HANDLE = new Map<string, CompactVol3Product>(
  ACTIVE_VOL3_PRODUCTS.map((item) => [item.handle.toLowerCase(), item]),
);

export function getBridalVol3ProductByHandle(handle: string): ShopifyProduct | null {
  const entry = VOL3_BY_HANDLE.get(handle.toLowerCase());
  if (!entry) return null;

  const images = entry.images.map((url) => ({
    node: { url, altText: `${entry.title} — LuxeMia Bridal Lehenga` },
  }));
  const primaryImage = images[0]?.node || null;

  const variants = entry.sizes.map((size, idx) => {
    const sku = `${entry.sku}-${idx + 1}`;
    return {
      node: {
        id: `gid://luxemia-preview/ProductVariant/${sku}`,
        title: size,
        sku,
        barcode: null,
        price: { amount: entry.price, currencyCode: "USD" },
        compareAtPrice: entry.compareAtPrice
          ? { amount: entry.compareAtPrice, currencyCode: "USD" }
          : null,
        availableForSale: true,
        image: primaryImage,
        selectedOptions: [
          { name: "Size", value: size },
          { name: "Color", value: entry.color },
        ],
      },
    };
  });

  const fullDescription = `${entry.description} Includes bridal lehenga skirt, matching choli blouse, and coordinated dupatta. Dispatches from India in 3–4 business days (add 3 business days once when custom sizing or alterations are selected) with 9–14 business days tracked carrier delivery and free U.S. standard shipping at $150+.`;

  return {
    id: `gid://luxemia-preview/Product/${entry.sku}`,
    title: entry.title,
    description: fullDescription,
    handle: entry.handle,
    productType: "Bridal Lehenga",
    vendor: "LuxeMia",
    tags: [...entry.tags],
    priceRange: {
      minVariantPrice: { amount: entry.price, currencyCode: "USD" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: entry.compareAtPrice || "0.0", currencyCode: "USD" },
    },
    images: { edges: images },
    variants: { edges: variants },
    options: [
      { name: "Size", values: [...entry.sizes] },
      { name: "Color", values: [entry.color] },
    ],
  };
}
