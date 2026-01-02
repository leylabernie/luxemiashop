// Sayuri Designer Products - Extracted from NityaNx
// Each variant treated as a separate product with boutique-style descriptions

export interface SayuriProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  currency: string;
  images: string[];
  category: string;
  fabric: string;
  occasion: string;
  color: string;
  work: string;
  tags: string[];
  sizes: string[];
  collection: string;
}

// Convert INR to USD with boutique markup
const convertPrice = (inrPrice: number): string => {
  const usdBase = inrPrice * 0.012;
  const boutiquePrice = Math.round(usdBase * 2.8);
  return boutiquePrice.toString();
};

export const sayuriProducts: SayuriProduct[] = [
  // === RANGREZA COLLECTION (3 Variants) ===
  {
    id: "sayuri-rangreza-001",
    handle: "rangreza-golden-mustard-jacquard-suit",
    title: "Rangreza Golden Mustard Jacquard Silk Suit",
    description: "Make a radiant statement in this stunning golden mustard ensemble from the Rangreza collection. Crafted from luxurious viscose jacquard silk, this masterpiece features exquisite hand-embellished beadwork that catches light with every movement. The rich mustard hue symbolizes prosperity and warmth, making it perfect for festive celebrations and special occasions. The three-piece set includes an intricately worked top, flowing pants, and a coordinating dupatta that completes the look with elegance.",
    price: convertPrice(2699),
    originalPrice: convertPrice(3499),
    currency: "USD",
    images: [
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0203-0-2025-12-29_14_54_06.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0205-1-2025-12-29_14_54_06.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0207-2-2025-12-29_14_54_06.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0206-3-2025-12-29_14_54_06.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0204-4-2025-12-29_14_54_06.jpg"
    ],
    category: "Designer Suits",
    fabric: "Viscose Jacquard Silk",
    occasion: "Festive",
    color: "Golden Mustard",
    work: "Hand Embellished Beadwork",
    tags: ["festive", "jacquard", "mustard", "beadwork", "silk", "party-wear", "designer"],
    sizes: ["Free Size Stitched"],
    collection: "Rangreza"
  },
  {
    id: "sayuri-rangreza-002",
    handle: "rangreza-sage-green-georgette-suit",
    title: "Rangreza Sage Green Georgette Silk Suit",
    description: "Embrace understated elegance with this serene sage green creation from the Rangreza collection. The premium real georgette fabric drapes beautifully, creating a flowing silhouette that moves gracefully with you. Hand-embellished work adorns the front and back, showcasing the artisan's dedication to perfection. This sophisticated piece transitions effortlessly from daytime celebrations to evening soirées, making it a versatile addition to your festive wardrobe.",
    price: convertPrice(2699),
    originalPrice: convertPrice(3499),
    currency: "USD",
    images: [
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0195-5-2025-12-29_14_54_06.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0194-6-2025-12-29_14_54_06.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0196-7-2025-12-29_14_54_06.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0193-8-2025-12-29_14_54_06.jpg"
    ],
    category: "Designer Suits",
    fabric: "Real Georgette",
    occasion: "Festive",
    color: "Sage Green",
    work: "Hand Embellished Work",
    tags: ["festive", "georgette", "sage-green", "embellished", "elegant", "party-wear"],
    sizes: ["Free Size Stitched"],
    collection: "Rangreza"
  },
  {
    id: "sayuri-rangreza-003",
    handle: "rangreza-dusty-rose-embellished-suit",
    title: "Rangreza Dusty Rose Embellished Suit",
    description: "Romance meets refinement in this enchanting dusty rose ensemble from the Rangreza collection. The delicate blush tone is perfectly complemented by intricate hand-embellished beadwork that creates a subtle sparkle. Crafted from premium viscose jacquard silk, this piece offers both comfort and luxury. The romantic color palette makes it ideal for engagement ceremonies, reception parties, and intimate celebrations where you want to look effortlessly beautiful.",
    price: convertPrice(2699),
    originalPrice: convertPrice(3499),
    currency: "USD",
    images: [
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0198-9-2025-12-29_14_54_06.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0200-10-2025-12-29_14_54_06.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0202-11-2025-12-29_14_54_06.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0201-12-2025-12-29_14_54_06.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0197-13-2025-12-29_14_54_06.jpg"
    ],
    category: "Designer Suits",
    fabric: "Viscose Jacquard Silk",
    occasion: "Wedding",
    color: "Dusty Rose",
    work: "Hand Embellished Beadwork",
    tags: ["wedding", "jacquard", "dusty-rose", "romantic", "beadwork", "engagement"],
    sizes: ["Free Size Stitched"],
    collection: "Rangreza"
  },

  // === VEERA COLLECTION (1 Variant) ===
  {
    id: "sayuri-veera-001",
    handle: "veera-wine-plum-georgette-suit",
    title: "Veera Wine Plum Heavy Georgette Suit",
    description: "Command attention in this magnificent wine plum creation from the Veera collection. The premium real georgette fabric provides a luxurious drape while the full heavy embroidered work on both front and back creates a stunning visual impact. This show-stopping ensemble features intricate thread work, sequin accents, and delicate beading that catches light beautifully. The palazzo-style bottoms and coordinating dupatta complete this regal three-piece set, perfect for wedding festivities and grand celebrations.",
    price: convertPrice(2599),
    originalPrice: convertPrice(3299),
    currency: "USD",
    images: [
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0043-0-2025-12-29_12_40_11.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251229-WA0042-1-2025-12-29_12_40_11.jpg"
    ],
    category: "Designer Suits",
    fabric: "Premium Real Georgette",
    occasion: "Wedding",
    color: "Wine Plum",
    work: "Full Heavy Embroidery",
    tags: ["wedding", "georgette", "wine", "plum", "heavy-embroidery", "festive", "palazzo"],
    sizes: ["Free Size Stitched"],
    collection: "Veera"
  },

  // === KANCHAN COLLECTION (3 Variants) ===
  {
    id: "sayuri-kanchan-001",
    handle: "kanchan-emerald-green-chinon-sharara",
    title: "Kanchan Emerald Green Chinon Silk Sharara Set",
    description: "Experience the allure of emerald elegance with this breathtaking sharara set from the Kanchan collection. Crafted from premium chinon silk, this ensemble features heavy beaded embroidery that adorns both the top and sharara bottoms. The rich emerald green symbolizes renewal and luxury, making it an auspicious choice for festive occasions. The flowing sharara silhouette creates a mesmerizing movement, while the embroidered dupatta adds the perfect finishing touch to this regal ensemble.",
    price: convertPrice(3499),
    originalPrice: convertPrice(4499),
    currency: "USD",
    images: [
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0004-0-2025-12-27_11_13_38.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0005-1-2025-12-27_11_13_38.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0010-2-2025-12-27_11_13_38.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0009-3-2025-12-27_11_13_38.jpg"
    ],
    category: "Designer Suits",
    fabric: "Premium Chinon Silk",
    occasion: "Festive",
    color: "Emerald Green",
    work: "Heavy Beaded Embroidery",
    tags: ["festive", "chinon", "emerald", "sharara", "beaded", "silk", "embroidery"],
    sizes: ["L", "XL", "XXL"],
    collection: "Kanchan"
  },
  {
    id: "sayuri-kanchan-002",
    handle: "kanchan-royal-navy-chinon-sharara",
    title: "Kanchan Royal Navy Chinon Silk Sharara Set",
    description: "Embrace sophistication with this stunning royal navy sharara set from the Kanchan collection. The deep navy hue creates a perfect canvas for the intricate beaded embroidery work that adorns this masterpiece. Premium chinon silk ensures a luxurious feel and beautiful drape. The three-piece set includes an embellished top, flowing sharara pants with matching embroidery, and a delicately worked dupatta. Ideal for evening celebrations where you want to make a lasting impression.",
    price: convertPrice(3499),
    originalPrice: convertPrice(4499),
    currency: "USD",
    images: [
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0008-4-2025-12-27_11_13_38.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0011-5-2025-12-27_11_13_38.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0012-6-2025-12-27_11_13_38.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0003-7-2025-12-27_11_13_38.jpg"
    ],
    category: "Designer Suits",
    fabric: "Premium Chinon Silk",
    occasion: "Festive",
    color: "Royal Navy",
    work: "Heavy Beaded Embroidery",
    tags: ["festive", "chinon", "navy", "sharara", "beaded", "evening-wear", "sophisticated"],
    sizes: ["L", "XL", "XXL"],
    collection: "Kanchan"
  },
  {
    id: "sayuri-kanchan-003",
    handle: "kanchan-burgundy-wine-chinon-sharara",
    title: "Kanchan Burgundy Wine Chinon Silk Sharara Set",
    description: "Radiate warmth and elegance in this luxurious burgundy wine sharara set from the Kanchan collection. The rich wine hue evokes the opulence of royal courts, while the intricate beaded embroidery adds contemporary glamour. Crafted from premium chinon silk, this ensemble offers both comfort and grandeur. The sharara's flowing silhouette creates a dramatic effect, perfect for wedding ceremonies and festive celebrations where you want to be remembered.",
    price: convertPrice(3499),
    originalPrice: convertPrice(4499),
    currency: "USD",
    images: [
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0006-8-2025-12-27_11_13_38.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0007-9-2025-12-27_11_13_38.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0002-10-2025-12-27_11_13_38.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0000-11-2025-12-27_11_13_38.jpg"
    ],
    category: "Designer Suits",
    fabric: "Premium Chinon Silk",
    occasion: "Wedding",
    color: "Burgundy Wine",
    work: "Heavy Beaded Embroidery",
    tags: ["wedding", "chinon", "burgundy", "wine", "sharara", "beaded", "royal"],
    sizes: ["L", "XL", "XXL"],
    collection: "Kanchan"
  },

  // === BELINA COLLECTION (2 Variants) ===
  {
    id: "sayuri-belina-001",
    handle: "belina-champagne-gold-silk-gown",
    title: "Belina Champagne Gold Silk Jacket Gown",
    description: "Step into the spotlight with this extraordinary champagne gold jacket gown from the Belina collection. This wedding-worthy masterpiece features a stylish embroidered jacket layered over a flowing silk gown, creating a contemporary yet regal silhouette. The premium real silk fabric ensures a luxurious feel, while the full heavy beaded embroidery on both front and back showcases exceptional craftsmanship. Perfect for the modern bride's reception or any grand celebration where elegance is essential.",
    price: convertPrice(3499),
    originalPrice: convertPrice(4499),
    currency: "USD",
    images: [
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0150-0-2025-12-27_13_30_39.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0149-1-2025-12-27_13_30_39.jpg"
    ],
    category: "Gowns",
    fabric: "Premium Real Silk",
    occasion: "Wedding",
    color: "Champagne Gold",
    work: "Heavy Beaded Embroidery",
    tags: ["wedding", "silk", "champagne", "gold", "gown", "jacket", "reception", "bridal"],
    sizes: ["Free Size Stitched"],
    collection: "Belina"
  },
  {
    id: "sayuri-belina-002",
    handle: "belina-midnight-black-silk-gown",
    title: "Belina Midnight Black Silk Jacket Gown",
    description: "Make a dramatic entrance in this stunning midnight black jacket gown from the Belina collection. The sophisticated black hue is elevated by intricate beaded embroidery that creates a mesmerizing shimmer. The innovative jacket-over-gown design offers a modern twist on traditional silhouettes. Crafted from premium real silk, this piece combines comfort with couture. An unforgettable choice for evening receptions, cocktail parties, and any occasion that calls for refined glamour.",
    price: convertPrice(3499),
    originalPrice: convertPrice(4499),
    currency: "USD",
    images: [
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251227-WA0148-2-2025-12-27_13_30_39.jpg"
    ],
    category: "Gowns",
    fabric: "Premium Real Silk",
    occasion: "Evening",
    color: "Midnight Black",
    work: "Heavy Beaded Embroidery",
    tags: ["evening", "silk", "black", "gown", "jacket", "cocktail", "glamour", "sophisticated"],
    sizes: ["Free Size Stitched"],
    collection: "Belina"
  },

  // === KIRTI COLLECTION (5 Variants) ===
  {
    id: "sayuri-kirti-001",
    handle: "kirti-coral-peach-crep-gharara",
    title: "Kirti Coral Peach Crep Silk Gharara Set",
    description: "Embrace feminine charm with this delightful coral peach gharara set from the Kirti collection. The premium real crep silk creates a soft, flowing silhouette that flatters every figure. Stylish mirror work embellishments add a playful sparkle that catches light beautifully. The gharara-style bottoms create elegant movement, while the coordinating dupatta completes this festive-ready ensemble. Perfect for mehendi ceremonies, sangeet celebrations, and daytime festivities.",
    price: convertPrice(1899),
    originalPrice: convertPrice(2499),
    currency: "USD",
    images: [
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0402-0-2025-12-24_16_55_36.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0396-1-2025-12-24_16_55_36.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0401-2-2025-12-24_16_55_36.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0397-3-2025-12-24_16_55_36.jpg"
    ],
    category: "Designer Suits",
    fabric: "Premium Real Crep Silk",
    occasion: "Festive",
    color: "Coral Peach",
    work: "Mirror Work",
    tags: ["festive", "crep-silk", "coral", "peach", "gharara", "mirror-work", "mehendi", "sangeet"],
    sizes: ["L", "XL", "XXL"],
    collection: "Kirti"
  },
  {
    id: "sayuri-kirti-002",
    handle: "kirti-sky-blue-crep-gharara",
    title: "Kirti Sky Blue Crep Silk Gharara Set",
    description: "Float through festivities in this ethereal sky blue gharara set from the Kirti collection. The serene blue shade evokes tranquility and grace, while the embellished mirror work adds festive sparkle. Crafted from premium real crep silk, this ensemble offers both comfort and style. The gharara silhouette creates beautiful movement, making every entrance memorable. An ideal choice for day ceremonies, religious functions, and celebratory gatherings.",
    price: convertPrice(1899),
    originalPrice: convertPrice(2499),
    currency: "USD",
    images: [
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0398-4-2025-12-24_16_55_36.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0403-5-2025-12-24_16_55_36.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0404-6-2025-12-24_16_55_36.jpg"
    ],
    category: "Designer Suits",
    fabric: "Premium Real Crep Silk",
    occasion: "Festive",
    color: "Sky Blue",
    work: "Mirror Work",
    tags: ["festive", "crep-silk", "blue", "sky-blue", "gharara", "mirror-work", "daytime"],
    sizes: ["L", "XL", "XXL"],
    collection: "Kirti"
  },
  {
    id: "sayuri-kirti-003",
    handle: "kirti-mint-green-crep-gharara",
    title: "Kirti Mint Green Crep Silk Gharara Set",
    description: "Refresh your festive wardrobe with this beautiful mint green gharara set from the Kirti collection. The cool mint shade brings a contemporary freshness to traditional styling. Premium real crep silk ensures luxurious comfort, while the stylish mirror work embellishments add celebratory sparkle. The gharara's flowing silhouette creates graceful movement perfect for dancing at sangeet or making memorable entrances at pre-wedding festivities.",
    price: convertPrice(1899),
    originalPrice: convertPrice(2499),
    currency: "USD",
    images: [
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0399-7-2025-12-24_16_55_36.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0400-8-2025-12-24_16_55_36.jpg"
    ],
    category: "Designer Suits",
    fabric: "Premium Real Crep Silk",
    occasion: "Festive",
    color: "Mint Green",
    work: "Mirror Work",
    tags: ["festive", "crep-silk", "mint", "green", "gharara", "mirror-work", "contemporary"],
    sizes: ["L", "XL", "XXL"],
    collection: "Kirti"
  },
  {
    id: "sayuri-kirti-004",
    handle: "kirti-lavender-mist-crep-gharara",
    title: "Kirti Lavender Mist Crep Silk Gharara Set",
    description: "Embrace dreamy elegance with this enchanting lavender gharara set from the Kirti collection. The soft lavender hue creates a romantic, ethereal look perfect for intimate celebrations. Premium real crep silk provides a gentle drape that flatters beautifully. Mirror work embellishments add just the right amount of sparkle for a refined festive look. A sophisticated choice for engagement ceremonies and wedding celebrations.",
    price: convertPrice(1899),
    originalPrice: convertPrice(2499),
    currency: "USD",
    images: [
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0389-9-2025-12-24_16_55_36.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0391-10-2025-12-24_16_55_37.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0388-11-2025-12-24_16_55_37.jpg"
    ],
    category: "Designer Suits",
    fabric: "Premium Real Crep Silk",
    occasion: "Wedding",
    color: "Lavender",
    work: "Mirror Work",
    tags: ["wedding", "crep-silk", "lavender", "gharara", "mirror-work", "romantic", "engagement"],
    sizes: ["L", "XL", "XXL"],
    collection: "Kirti"
  },
  {
    id: "sayuri-kirti-005",
    handle: "kirti-blush-pink-crep-gharara",
    title: "Kirti Blush Pink Crep Silk Gharara Set",
    description: "Celebrate in style with this lovely blush pink gharara set from the Kirti collection. The gentle pink shade radiates warmth and femininity, perfectly complemented by delicate mirror work embellishments. Crafted from premium real crep silk, this ensemble offers exceptional comfort for all-day celebrations. The gharara silhouette adds graceful movement to every step. An ideal choice for mehendi, haldi, and other joyful pre-wedding celebrations.",
    price: convertPrice(1899),
    originalPrice: convertPrice(2499),
    currency: "USD",
    images: [
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0393-12-2025-12-24_16_55_37.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0394-13-2025-12-24_16_55_37.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0392-14-2025-12-24_16_55_37.jpg",
      "https://www.nityanx.com//images/product/sub_images/2025/12/IMG-20251224-WA0395-15-2025-12-24_16_55_37.jpg"
    ],
    category: "Designer Suits",
    fabric: "Premium Real Crep Silk",
    occasion: "Festive",
    color: "Blush Pink",
    work: "Mirror Work",
    tags: ["festive", "crep-silk", "blush", "pink", "gharara", "mirror-work", "mehendi", "haldi"],
    sizes: ["L", "XL", "XXL"],
    collection: "Kirti"
  }
];

// Get all unique collections
export const sayuriCollections = [...new Set(sayuriProducts.map(p => p.collection))];

// Get products by collection
export const getProductsByCollection = (collection: string) => 
  sayuriProducts.filter(p => p.collection === collection);

// Get products by category
export const getProductsByCategory = (category: string) =>
  sayuriProducts.filter(p => p.category === category);
