// Boutique-style saree product data scraped from wholesalesalwar.com
// SEO-optimized titles and descriptions for luxury ethnic wear boutique
// UPDATED: Single image per product (model shots only, no flat-lay images)

export interface SareeProduct {
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

const convertPrice = (inrPrice: number): string => {
  const usdBase = inrPrice * 0.012;
  const boutiquePrice = Math.round(usdBase * 2.5);
  return boutiquePrice.toString();
};

export const sareeProducts: SareeProduct[] = [
  // === WEDDING SAREES ===
  {
    id: "saree-001",
    handle: "mint-green-kanchipuram-silk-wedding-saree",
    title: "Mint Green Kanchipuram Silk Wedding Saree",
    description: "Experience the grandeur of South Indian tradition with this exquisite mint green Kanchipuram-inspired Viscose Silk saree. The delicate mint shade represents new beginnings and prosperity, making it an auspicious choice for wedding celebrations.",
    price: convertPrice(12195),
    originalPrice: convertPrice(16938),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59744/Mint-Green-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176-B(1).jpg"],
    category: "Wedding Sarees",
    fabric: "Viscose Silk",
    occasion: "Wedding",
    color: "Mint Green",
    work: "Weaving Work",
    tags: ["wedding", "silk", "mint-green", "kanchipuram", "weaving", "traditional"],
    variants: [{ id: "saree-001-free", title: "Free Size", price: convertPrice(12195), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-002",
    handle: "royal-pink-kanchipuram-silk-wedding-saree",
    title: "Royal Pink Kanchipuram Silk Wedding Saree",
    description: "A celebration of feminine grace in royal pink, this Viscose Silk saree channels the opulence of Kanchipuram's legendary weaving traditions. The vibrant pink shade has been carefully selected to flatter all skin tones.",
    price: convertPrice(12195),
    originalPrice: convertPrice(16938),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59744/Pink-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176(1).jpg"],
    category: "Wedding Sarees",
    fabric: "Viscose Silk",
    occasion: "Wedding",
    color: "Pink",
    work: "Weaving Work",
    tags: ["wedding", "silk", "pink", "kanchipuram", "weaving", "bridal"],
    variants: [{ id: "saree-002-free", title: "Free Size", price: convertPrice(12195), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-003",
    handle: "ivory-beige-kanchipuram-silk-wedding-saree",
    title: "Ivory Beige Kanchipuram Silk Wedding Saree",
    description: "Understated elegance meets heritage craftsmanship in this sophisticated ivory beige Viscose Silk saree. The neutral beige palette offers versatile styling possibilities while maintaining wedding grandeur.",
    price: convertPrice(11545),
    originalPrice: convertPrice(16035),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59744/Beige-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3164(1).jpg"],
    category: "Wedding Sarees",
    fabric: "Viscose Silk",
    occasion: "Wedding",
    color: "Beige",
    work: "Weaving Work",
    tags: ["wedding", "silk", "beige", "kanchipuram", "weaving", "elegant"],
    variants: [{ id: "saree-003-free", title: "Free Size", price: convertPrice(11545), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-004",
    handle: "multicolor-kanchipuram-silk-wedding-saree",
    title: "Multicolor Kanchipuram Silk Wedding Saree",
    description: "A vibrant celebration of color and craftsmanship, this multicolor Viscose Silk saree showcases the bold aesthetic of South Indian wedding traditions with masterful color combinations.",
    price: convertPrice(11845),
    originalPrice: convertPrice(16451),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59744/Multi-Color-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3133-B(1).jpg"],
    category: "Wedding Sarees",
    fabric: "Viscose Silk",
    occasion: "Wedding",
    color: "Multi Color",
    work: "Weaving Work",
    tags: ["wedding", "silk", "multicolor", "kanchipuram", "weaving", "vibrant"],
    variants: [{ id: "saree-004-free", title: "Free Size", price: convertPrice(11845), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-005",
    handle: "antique-gold-kanchipuram-silk-wedding-saree",
    title: "Antique Gold Kanchipuram Silk Wedding Saree",
    description: "Capture the essence of royal opulence with this magnificent antique gold Viscose Silk saree that radiates warmth and prosperity—making it exceptionally auspicious for wedding celebrations.",
    price: convertPrice(11545),
    originalPrice: convertPrice(16035),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59744/Gold-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3131(1).jpg"],
    category: "Wedding Sarees",
    fabric: "Viscose Silk",
    occasion: "Wedding",
    color: "Gold",
    work: "Weaving Work",
    tags: ["wedding", "silk", "gold", "kanchipuram", "weaving", "royal"],
    variants: [{ id: "saree-005-free", title: "Free Size", price: convertPrice(11545), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-006",
    handle: "beige-gold-tissue-silk-wedding-saree",
    title: "Beige Gold Tissue Silk Wedding Saree",
    description: "Ethereal beauty meets everyday luxury in this stunning beige gold PV Tissue Silk saree. The innovative tissue silk fabric creates a gossamer-like quality that floats elegantly around the body.",
    price: convertPrice(2645),
    originalPrice: convertPrice(3574),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59728/Beige-Gold-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4298(1).jpg"],
    category: "Wedding Sarees",
    fabric: "Tissue Silk",
    occasion: "Wedding",
    color: "Beige Gold",
    work: "Weaving Work",
    tags: ["wedding", "tissue-silk", "beige", "gold", "lightweight", "elegant"],
    variants: [{ id: "saree-006-free", title: "Free Size", price: convertPrice(2645), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-007",
    handle: "pink-tissue-silk-wedding-saree",
    title: "Pink Tissue Silk Wedding Saree",
    description: "Romance blooms in this delicate pink PV Tissue Silk saree that combines the lightness of air with the richness of traditional wedding wear. The soft pink hue represents love and tenderness.",
    price: convertPrice(2645),
    originalPrice: convertPrice(3574),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59728/Pink-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4297(1).jpg"],
    category: "Wedding Sarees",
    fabric: "Tissue Silk",
    occasion: "Wedding",
    color: "Pink",
    work: "Weaving Work",
    tags: ["wedding", "tissue-silk", "pink", "romantic", "lightweight", "sangeet"],
    variants: [{ id: "saree-007-free", title: "Free Size", price: convertPrice(2645), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-008",
    handle: "sea-green-tissue-silk-wedding-saree",
    title: "Sea Green Tissue Silk Wedding Saree",
    description: "Transport yourself to serene coastal beauty with this refreshing sea green PV Tissue Silk saree. The tranquil sea green shade evokes the calm of ocean waters and the freshness of new beginnings.",
    price: convertPrice(2645),
    originalPrice: convertPrice(3574),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59728/Sea-Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4296(1).jpg"],
    category: "Wedding Sarees",
    fabric: "Tissue Silk",
    occasion: "Wedding",
    color: "Sea Green",
    work: "Weaving Work",
    tags: ["wedding", "tissue-silk", "sea-green", "coastal", "destination", "fresh"],
    variants: [{ id: "saree-008-free", title: "Free Size", price: convertPrice(2645), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-009",
    handle: "sunset-orange-tissue-silk-wedding-saree",
    title: "Sunset Orange Tissue Silk Wedding Saree",
    description: "Embrace the warmth and energy of a glorious sunset with this vibrant orange PV Tissue Silk saree. Orange represents enthusiasm and auspicious beginnings.",
    price: convertPrice(2645),
    originalPrice: convertPrice(3574),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59728/Orange-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4295(1).jpg"],
    category: "Wedding Sarees",
    fabric: "Tissue Silk",
    occasion: "Wedding",
    color: "Orange",
    work: "Weaving Work",
    tags: ["wedding", "tissue-silk", "orange", "sunset", "haldi", "auspicious"],
    variants: [{ id: "saree-009-free", title: "Free Size", price: convertPrice(2645), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-010",
    handle: "lavender-tissue-silk-wedding-saree",
    title: "Lavender Tissue Silk Wedding Saree",
    description: "Dream in lavender with this enchanting PV Tissue Silk saree that brings a contemporary color palette to traditional wedding celebrations. Perfect for destination weddings.",
    price: convertPrice(2645),
    originalPrice: convertPrice(3574),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59728/Lavender-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4294(1).jpg"],
    category: "Wedding Sarees",
    fabric: "Tissue Silk",
    occasion: "Wedding",
    color: "Lavender",
    work: "Weaving Work",
    tags: ["wedding", "tissue-silk", "lavender", "contemporary", "destination", "dreamy"],
    variants: [{ id: "saree-010-free", title: "Free Size", price: convertPrice(2645), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },

  // === PARTY SAREES ===
  {
    id: "saree-011",
    handle: "royal-blue-georgette-party-saree",
    title: "Royal Blue Georgette Party Saree",
    description: "Command attention in this stunning royal blue Georgette saree featuring intricate sequins work. The deep blue shade represents confidence and sophistication.",
    price: convertPrice(3495),
    originalPrice: convertPrice(4855),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59720/Blue-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4287(1).jpg"],
    category: "Party Sarees",
    fabric: "Georgette",
    occasion: "Party",
    color: "Royal Blue",
    work: "Sequins Work",
    tags: ["party", "georgette", "blue", "sequins", "cocktail", "evening"],
    variants: [{ id: "saree-011-free", title: "Free Size", price: convertPrice(3495), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-012",
    handle: "wine-georgette-party-saree",
    title: "Wine Georgette Party Saree",
    description: "Embrace sophisticated glamour with this intoxicating wine Georgette saree. The rich wine shade represents passion and refinement—perfect for evening celebrations.",
    price: convertPrice(3495),
    originalPrice: convertPrice(4855),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59720/Wine-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4286(1).jpg"],
    category: "Party Sarees",
    fabric: "Georgette",
    occasion: "Party",
    color: "Wine",
    work: "Sequins Work",
    tags: ["party", "georgette", "wine", "sequins", "evening", "glamour"],
    variants: [{ id: "saree-012-free", title: "Free Size", price: convertPrice(3495), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-013",
    handle: "emerald-green-georgette-party-saree",
    title: "Emerald Green Georgette Party Saree",
    description: "Channel natural elegance with this stunning emerald green Georgette saree. The rich green shade represents prosperity and harmony.",
    price: convertPrice(3495),
    originalPrice: convertPrice(4855),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59720/Green-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4285(1).jpg"],
    category: "Party Sarees",
    fabric: "Georgette",
    occasion: "Party",
    color: "Emerald Green",
    work: "Sequins Work",
    tags: ["party", "georgette", "green", "sequins", "cocktail", "nature"],
    variants: [{ id: "saree-013-free", title: "Free Size", price: convertPrice(3495), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-014",
    handle: "dusty-rose-georgette-party-saree",
    title: "Dusty Rose Georgette Party Saree",
    description: "Whisper romance with this enchanting dusty rose Georgette saree. The soft dusty rose shade offers contemporary femininity for cocktail parties and celebrations.",
    price: convertPrice(3295),
    originalPrice: convertPrice(4576),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59720/Dusty-Rose-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4284(1).jpg"],
    category: "Party Sarees",
    fabric: "Georgette",
    occasion: "Party",
    color: "Dusty Rose",
    work: "Sequins Work",
    tags: ["party", "georgette", "dusty-rose", "sequins", "romantic", "feminine"],
    variants: [{ id: "saree-014-free", title: "Free Size", price: convertPrice(3295), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-015",
    handle: "black-georgette-party-saree",
    title: "Black Georgette Party Saree",
    description: "Make a bold statement with this striking black Georgette saree. Black represents power, elegance, and timeless sophistication for evening events.",
    price: convertPrice(3495),
    originalPrice: convertPrice(4855),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59720/Black-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4283(1).jpg"],
    category: "Party Sarees",
    fabric: "Georgette",
    occasion: "Party",
    color: "Black",
    work: "Sequins Work",
    tags: ["party", "georgette", "black", "sequins", "evening", "statement"],
    variants: [{ id: "saree-015-free", title: "Free Size", price: convertPrice(3495), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },

  // === CASUAL/DAILY WEAR SAREES ===
  {
    id: "saree-016",
    handle: "sky-blue-cotton-casual-saree",
    title: "Sky Blue Cotton Casual Saree",
    description: "Experience everyday elegance with this refreshing sky blue Cotton saree. The lightweight cotton fabric provides comfort for all-day wear while the sky blue shade brings freshness to casual occasions.",
    price: convertPrice(1895),
    originalPrice: convertPrice(2632),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59705/Sky-Blue-Cotton-Casual-Wear-Print-Work-Saree-Kreshva-Vol-2-3666-K-4270(1).jpg"],
    category: "Casual Sarees",
    fabric: "Cotton",
    occasion: "Casual",
    color: "Sky Blue",
    work: "Print Work",
    tags: ["casual", "cotton", "blue", "print", "daily", "comfort"],
    variants: [{ id: "saree-016-free", title: "Free Size", price: convertPrice(1895), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-017",
    handle: "peach-cotton-casual-saree",
    title: "Peach Cotton Casual Saree",
    description: "Embrace soft warmth with this beautiful peach Cotton saree. The gentle peach shade flatters all skin tones and brings warmth to everyday styling.",
    price: convertPrice(1895),
    originalPrice: convertPrice(2632),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59705/Peach-Cotton-Casual-Wear-Print-Work-Saree-Kreshva-Vol-2-3666-K-4269(1).jpg"],
    category: "Casual Sarees",
    fabric: "Cotton",
    occasion: "Casual",
    color: "Peach",
    work: "Print Work",
    tags: ["casual", "cotton", "peach", "print", "daily", "soft"],
    variants: [{ id: "saree-017-free", title: "Free Size", price: convertPrice(1895), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-018",
    handle: "mint-green-cotton-casual-saree",
    title: "Mint Green Cotton Casual Saree",
    description: "Experience fresh elegance with this refreshing mint green Cotton saree. The cool mint shade brings a contemporary edge to traditional cotton saree styling.",
    price: convertPrice(1895),
    originalPrice: convertPrice(2632),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59705/Mint-Green-Cotton-Casual-Wear-Print-Work-Saree-Kreshva-Vol-2-3666-K-4268(1).jpg"],
    category: "Casual Sarees",
    fabric: "Cotton",
    occasion: "Casual",
    color: "Mint Green",
    work: "Print Work",
    tags: ["casual", "cotton", "mint", "print", "fresh", "contemporary"],
    variants: [{ id: "saree-018-free", title: "Free Size", price: convertPrice(1895), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-019",
    handle: "coral-cotton-casual-saree",
    title: "Coral Cotton Casual Saree",
    description: "Radiate warmth with this vibrant coral Cotton saree. The energetic coral shade brings joy to everyday styling while cotton ensures comfortable wear.",
    price: convertPrice(1895),
    originalPrice: convertPrice(2632),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59705/Coral-Cotton-Casual-Wear-Print-Work-Saree-Kreshva-Vol-2-3666-K-4267(1).jpg"],
    category: "Casual Sarees",
    fabric: "Cotton",
    occasion: "Casual",
    color: "Coral",
    work: "Print Work",
    tags: ["casual", "cotton", "coral", "print", "vibrant", "daily"],
    variants: [{ id: "saree-019-free", title: "Free Size", price: convertPrice(1895), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-020",
    handle: "lavender-cotton-casual-saree",
    title: "Lavender Cotton Casual Saree",
    description: "Dream in lavender with this enchanting Cotton saree. The soft lavender shade brings contemporary elegance to traditional cotton styling.",
    price: convertPrice(1895),
    originalPrice: convertPrice(2632),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59705/Lavender-Cotton-Casual-Wear-Print-Work-Saree-Kreshva-Vol-2-3666-K-4266(1).jpg"],
    category: "Casual Sarees",
    fabric: "Cotton",
    occasion: "Casual",
    color: "Lavender",
    work: "Print Work",
    tags: ["casual", "cotton", "lavender", "print", "dreamy", "contemporary"],
    variants: [{ id: "saree-020-free", title: "Free Size", price: convertPrice(1895), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },

  // === FESTIVE SAREES ===
  {
    id: "saree-021",
    handle: "magenta-art-silk-festive-saree",
    title: "Magenta Art Silk Festive Saree",
    description: "Celebrate with vibrant energy in this stunning magenta Art Silk saree. The bold magenta shade represents passion and celebration—perfect for festive occasions.",
    price: convertPrice(2995),
    originalPrice: convertPrice(4160),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59708/Magenta-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4277(1).jpg"],
    category: "Festive Sarees",
    fabric: "Art Silk",
    occasion: "Festival",
    color: "Magenta",
    work: "Weaving Work",
    tags: ["festive", "art-silk", "magenta", "weaving", "diwali", "navratri"],
    variants: [{ id: "saree-021-free", title: "Free Size", price: convertPrice(2995), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-022",
    handle: "teal-green-art-silk-festive-saree",
    title: "Teal Green Art Silk Festive Saree",
    description: "Channel royal elegance with this stunning teal green Art Silk saree. The rich teal shade represents prosperity and harmony—ideal for Diwali and festive gatherings.",
    price: convertPrice(2995),
    originalPrice: convertPrice(4160),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59708/Teal-Green-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4276(1).jpg"],
    category: "Festive Sarees",
    fabric: "Art Silk",
    occasion: "Festival",
    color: "Teal Green",
    work: "Weaving Work",
    tags: ["festive", "art-silk", "teal", "weaving", "diwali", "prosperity"],
    variants: [{ id: "saree-022-free", title: "Free Size", price: convertPrice(2995), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-023",
    handle: "maroon-art-silk-festive-saree",
    title: "Maroon Art Silk Festive Saree",
    description: "Embrace traditional elegance with this rich maroon Art Silk saree. The auspicious maroon shade represents passion and celebration—perfect for pujas and festivals.",
    price: convertPrice(2995),
    originalPrice: convertPrice(4160),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59708/Maroon-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4275(1).jpg"],
    category: "Festive Sarees",
    fabric: "Art Silk",
    occasion: "Festival",
    color: "Maroon",
    work: "Weaving Work",
    tags: ["festive", "art-silk", "maroon", "weaving", "puja", "traditional"],
    variants: [{ id: "saree-023-free", title: "Free Size", price: convertPrice(2995), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-024",
    handle: "mustard-yellow-art-silk-festive-saree",
    title: "Mustard Yellow Art Silk Festive Saree",
    description: "Radiate warmth with this vibrant mustard yellow Art Silk saree. Yellow represents prosperity and divine blessings—perfect for Basant Panchami and festive celebrations.",
    price: convertPrice(2995),
    originalPrice: convertPrice(4160),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59708/Mustard-Yellow-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4274(1).jpg"],
    category: "Festive Sarees",
    fabric: "Art Silk",
    occasion: "Festival",
    color: "Mustard Yellow",
    work: "Weaving Work",
    tags: ["festive", "art-silk", "yellow", "weaving", "basant", "auspicious"],
    variants: [{ id: "saree-024-free", title: "Free Size", price: convertPrice(2995), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-025",
    handle: "royal-purple-art-silk-festive-saree",
    title: "Royal Purple Art Silk Festive Saree",
    description: "Channel regal elegance with this stunning royal purple Art Silk saree. Purple represents luxury and spirituality—perfect for evening pujas and celebrations.",
    price: convertPrice(2995),
    originalPrice: convertPrice(4160),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59708/Purple-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4273(1).jpg"],
    category: "Festive Sarees",
    fabric: "Art Silk",
    occasion: "Festival",
    color: "Royal Purple",
    work: "Weaving Work",
    tags: ["festive", "art-silk", "purple", "weaving", "evening", "regal"],
    variants: [{ id: "saree-025-free", title: "Free Size", price: convertPrice(2995), options: { Size: "Free Size" } }],
    options: [{ name: "Size", values: ["Free Size"] }]
  }
];

export default sareeProducts;
