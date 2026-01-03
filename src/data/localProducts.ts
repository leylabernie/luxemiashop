// Boutique-style local product data scraped from wholesalesalwar.com
// SEO-optimized titles and descriptions for luxury ethnic wear boutique
// UPDATED: Single image per product (model shots only, no flat-lay images)

import { sareeProducts, type SareeProduct } from './sareeProducts';
import { menswearProducts, type MenswearProduct } from './menswearProducts';
import { suitProducts, type SuitProduct } from './suitProducts';

export interface LocalProduct {
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

// Re-export types
export type { SareeProduct, MenswearProduct, SuitProduct };

// Convert INR to USD with boutique markup (approx 1 INR = 0.012 USD, then 2.5x markup for boutique pricing)
const convertPrice = (inrPrice: number): string => {
  const usdBase = inrPrice * 0.012;
  const boutiquePrice = Math.round(usdBase * 2.5);
  return boutiquePrice.toString();
};

export const localProducts: LocalProduct[] = [
  // === BRIDAL COLLECTION ===
  {
    id: "bridal-001",
    handle: "ethereal-pastel-pink-bridal-lehenga",
    title: "Ethereal Pastel Pink Bridal Lehenga",
    description: "Step into your fairy tale in this breathtaking pastel pink bridal masterpiece. Handcrafted from the finest Pure Net fabric, this lehenga showcases extraordinary heavy work embroidery that has taken master artisans over 200 hours to complete. The delicate blush tone is achieved through a specialized dyeing process that ensures color permanence and a subtle shimmer in every light. The voluminous skirt features cascading floral motifs interspersed with intricate zardozi work, while the matching blouse complements with equally detailed craftsmanship. The dupatta is edged with hand-stitched scalloped borders that frame your silhouette with romantic elegance. Perfect for the bride who envisions an ethereal, dreamlike entrance on her most magical day.",
    price: convertPrice(15895),
    originalPrice: convertPrice(22076),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59570/Pastel-Pink-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10243(1).jpg"],
    category: "Bridal Lehengas",
    fabric: "Pure Net",
    occasion: "Bridal",
    color: "Pastel Pink",
    work: "Heavy Embroidery",
    tags: ["bridal", "wedding", "pastel-pink", "net", "heavy-work", "embroidery", "zardozi"],
    variants: [
      { id: "bridal-001-s", title: "S", price: convertPrice(15895), options: { Size: "S" } },
      { id: "bridal-001-m", title: "M", price: convertPrice(15895), options: { Size: "M" } },
      { id: "bridal-001-l", title: "L", price: convertPrice(15895), options: { Size: "L" } },
      { id: "bridal-001-xl", title: "XL", price: convertPrice(15895), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "bridal-002",
    handle: "royal-rani-pink-silk-bridal-lehenga",
    title: "Royal Rani Pink Silk Bridal Lehenga",
    description: "Embrace the timeless grandeur of Indian bridal tradition with this magnificent Rani Pink silk lehenga. This heritage piece is woven from premium Banarasi silk that carries the weight and drape synonymous with royal trousseau. The heavy traditional work combines resham thread embroidery, genuine kundan stones, and delicate dabka detailing that creates a three-dimensional textural masterpiece. Every motif tells a story—from the peacock patterns symbolizing eternal love to the lotus blooms representing new beginnings.",
    price: convertPrice(24295),
    originalPrice: convertPrice(34218),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59645/Rani-Pink-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-A(1).jpg"],
    category: "Bridal Lehengas",
    fabric: "Silk",
    occasion: "Bridal",
    color: "Rani Pink",
    work: "Heavy Work",
    tags: ["bridal", "silk", "rani-pink", "traditional", "luxury", "heritage", "kundan", "banarasi"],
    variants: [
      { id: "bridal-002-s", title: "S", price: convertPrice(24295), options: { Size: "S" } },
      { id: "bridal-002-m", title: "M", price: convertPrice(24295), options: { Size: "M" } },
      { id: "bridal-002-l", title: "L", price: convertPrice(24295), options: { Size: "L" } },
      { id: "bridal-002-xl", title: "XL", price: convertPrice(24295), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "bridal-003",
    handle: "classic-bridal-red-silk-lehenga",
    title: "Classic Bridal Red Silk Lehenga",
    description: "The quintessential bridal red that has adorned generations of brides across the subcontinent. This luxurious silk lehenga is a testament to the enduring appeal of traditional craftsmanship, featuring masterfully executed heavy work that creates intricate patterns dancing with every movement. The auspicious red hue is achieved through natural dye processes that create depth and richness unmatched by synthetic alternatives.",
    price: convertPrice(24295),
    originalPrice: convertPrice(34218),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59645/Red-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-B(1).jpg"],
    category: "Bridal Lehengas",
    fabric: "Silk",
    occasion: "Bridal",
    color: "Red",
    work: "Heavy Work",
    tags: ["bridal", "silk", "red", "classic", "traditional", "wedding", "zari", "auspicious"],
    variants: [
      { id: "bridal-003-s", title: "S", price: convertPrice(24295), options: { Size: "S" } },
      { id: "bridal-003-m", title: "M", price: convertPrice(24295), options: { Size: "M" } },
      { id: "bridal-003-l", title: "L", price: convertPrice(24295), options: { Size: "L" } },
      { id: "bridal-003-xl", title: "XL", price: convertPrice(24295), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "bridal-004",
    handle: "ivory-dreamscape-net-bridal-lehenga",
    title: "Ivory Dreamscape Net Bridal Lehenga",
    description: "For the modern bride who dares to redefine tradition. This pristine ivory Heavy Net lehenga represents the new era of bridal fashion, where classic silhouettes meet contemporary color palettes. The sequins and embroidery work creates a dreamlike shimmer that photographs beautifully in both daylight and candlelit evening settings.",
    price: convertPrice(12895),
    originalPrice: convertPrice(17664),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(1).jpg"],
    category: "Bridal Lehengas",
    fabric: "Heavy Net",
    occasion: "Bridal",
    color: "White",
    work: "Sequins Embroidery",
    tags: ["bridal", "net", "white", "sequins", "modern", "destination-wedding", "ivory", "contemporary"],
    variants: [
      { id: "bridal-004-s", title: "S", price: convertPrice(12895), options: { Size: "S" } },
      { id: "bridal-004-m", title: "M", price: convertPrice(12895), options: { Size: "M" } },
      { id: "bridal-004-l", title: "L", price: convertPrice(12895), options: { Size: "L" } },
      { id: "bridal-004-xl", title: "XL", price: convertPrice(12895), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "bridal-005",
    handle: "lavender-mist-bridal-lehenga",
    title: "Lavender Mist Bridal Lehenga",
    description: "A contemporary masterpiece that breaks the traditional color boundaries while maintaining the grandeur expected of bridal couture. This serene lavender Pure Net bridal ensemble speaks to the bride with a discerning eye for unique beauty. The heavy work embroidery creates extraordinary depth and dimension.",
    price: convertPrice(12695),
    originalPrice: convertPrice(17632),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59570/Lavender-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10242(1).jpg"],
    category: "Bridal Lehengas",
    fabric: "Pure Net",
    occasion: "Bridal",
    color: "Lavender",
    work: "Heavy Work",
    tags: ["bridal", "net", "lavender", "contemporary", "trendy", "unique", "crystals", "fashion-forward"],
    variants: [
      { id: "bridal-005-s", title: "S", price: convertPrice(12695), options: { Size: "S" } },
      { id: "bridal-005-m", title: "M", price: convertPrice(12695), options: { Size: "M" } },
      { id: "bridal-005-l", title: "L", price: convertPrice(12695), options: { Size: "L" } },
      { id: "bridal-005-xl", title: "XL", price: convertPrice(12695), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "bridal-006",
    handle: "metallic-silver-celebration-lehenga",
    title: "Metallic Silver Celebration Lehenga",
    description: "Make an unforgettable entrance in this stunning metallic silver Pure Net lehenga that commands attention and admiration in equal measure. The lustrous silver base is achieved through an innovative weaving technique that incorporates metallic threads directly into the net construction.",
    price: convertPrice(13995),
    originalPrice: convertPrice(19438),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59570/Metalic-Silver-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10245(1).jpg"],
    category: "Bridal Lehengas",
    fabric: "Pure Net",
    occasion: "Bridal",
    color: "Silver",
    work: "Heavy Work",
    tags: ["bridal", "net", "silver", "metallic", "glamorous", "reception", "contemporary", "statement"],
    variants: [
      { id: "bridal-006-s", title: "S", price: convertPrice(13995), options: { Size: "S" } },
      { id: "bridal-006-m", title: "M", price: convertPrice(13995), options: { Size: "M" } },
      { id: "bridal-006-l", title: "L", price: convertPrice(13995), options: { Size: "L" } },
      { id: "bridal-006-xl", title: "XL", price: convertPrice(13995), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },

  // === WEDDING COLLECTION ===
  {
    id: "wedding-001",
    handle: "burgundy-velvet-wedding-lehenga",
    title: "Burgundy Velvet Wedding Lehenga",
    description: "Embrace regal sophistication with this sumptuous burgundy velvet lehenga that embodies the luxurious warmth of winter celebrations. The premium Italian velvet has been specially treated for a subtle sheen that photographs beautifully.",
    price: convertPrice(8995),
    originalPrice: convertPrice(12155),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59625/Burgundy-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-A(1).jpg"],
    category: "Wedding Lehengas",
    fabric: "Net",
    occasion: "Wedding",
    color: "Burgundy",
    work: "Heavy Work",
    tags: ["wedding", "burgundy", "net", "heavy-work", "winter", "evening", "velvet", "mughal"],
    variants: [
      { id: "wedding-001-s", title: "S", price: convertPrice(8995), options: { Size: "S" } },
      { id: "wedding-001-m", title: "M", price: convertPrice(8995), options: { Size: "M" } },
      { id: "wedding-001-l", title: "L", price: convertPrice(8995), options: { Size: "L" } },
      { id: "wedding-001-xl", title: "XL", price: convertPrice(8995), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "wedding-002",
    handle: "wine-romance-net-lehenga",
    title: "Wine Romance Net Lehenga",
    description: "Fall in love with this intoxicating wine-colored Net lehenga that exudes romance and sophistication. The deep wine shade has been carefully chosen to complement a wide range of skin tones while evoking the warmth and richness of celebratory traditions.",
    price: convertPrice(8995),
    originalPrice: convertPrice(12155),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59625/Wine-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-B(1).jpg"],
    category: "Wedding Lehengas",
    fabric: "Net",
    occasion: "Wedding",
    color: "Wine",
    work: "Heavy Work",
    tags: ["wedding", "wine", "net", "romantic", "sangeet", "engagement", "elegant"],
    variants: [
      { id: "wedding-002-s", title: "S", price: convertPrice(8995), options: { Size: "S" } },
      { id: "wedding-002-m", title: "M", price: convertPrice(8995), options: { Size: "M" } },
      { id: "wedding-002-l", title: "L", price: convertPrice(8995), options: { Size: "L" } },
      { id: "wedding-002-xl", title: "XL", price: convertPrice(8995), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "wedding-003",
    handle: "emerald-forest-wedding-lehenga",
    title: "Emerald Forest Wedding Lehenga",
    description: "Channel the mystique of enchanted forests with this breathtaking emerald green Net lehenga that celebrates the beauty of nature. The rich emerald shade represents growth, harmony, and the eternal cycle of love.",
    price: convertPrice(9495),
    originalPrice: convertPrice(13189),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59625/Green-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-C(1).jpg"],
    category: "Wedding Lehengas",
    fabric: "Net",
    occasion: "Wedding",
    color: "Emerald Green",
    work: "Heavy Work",
    tags: ["wedding", "green", "net", "botanical", "garden", "nature", "mirror-work"],
    variants: [
      { id: "wedding-003-s", title: "S", price: convertPrice(9495), options: { Size: "S" } },
      { id: "wedding-003-m", title: "M", price: convertPrice(9495), options: { Size: "M" } },
      { id: "wedding-003-l", title: "L", price: convertPrice(9495), options: { Size: "L" } },
      { id: "wedding-003-xl", title: "XL", price: convertPrice(9495), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "wedding-004",
    handle: "royal-blue-celebration-lehenga",
    title: "Royal Blue Celebration Lehenga",
    description: "Make a statement of confidence and elegance with this commanding royal blue Net lehenga that embodies the depth and mystery of midnight skies. The vibrant blue shade has been selected to photograph beautifully.",
    price: convertPrice(9495),
    originalPrice: convertPrice(13189),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59625/Blue-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-D(1).jpg"],
    category: "Wedding Lehengas",
    fabric: "Net",
    occasion: "Wedding",
    color: "Royal Blue",
    work: "Heavy Work",
    tags: ["wedding", "blue", "net", "celestial", "statement", "confident", "evening"],
    variants: [
      { id: "wedding-004-s", title: "S", price: convertPrice(9495), options: { Size: "S" } },
      { id: "wedding-004-m", title: "M", price: convertPrice(9495), options: { Size: "M" } },
      { id: "wedding-004-l", title: "L", price: convertPrice(9495), options: { Size: "L" } },
      { id: "wedding-004-xl", title: "XL", price: convertPrice(9495), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "wedding-005",
    handle: "coral-sunset-net-lehenga",
    title: "Coral Sunset Net Lehenga",
    description: "Capture the warmth of a perfect sunset with this stunning coral Net lehenga that radiates joy and celebration. The vibrant coral shade represents the energy and excitement of new beginnings.",
    price: convertPrice(8795),
    originalPrice: convertPrice(12216),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59625/Coral-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-E(1).jpg"],
    category: "Wedding Lehengas",
    fabric: "Net",
    occasion: "Wedding",
    color: "Coral",
    work: "Heavy Work",
    tags: ["wedding", "coral", "net", "sunset", "mehendi", "sangeet", "daytime"],
    variants: [
      { id: "wedding-005-s", title: "S", price: convertPrice(8795), options: { Size: "S" } },
      { id: "wedding-005-m", title: "M", price: convertPrice(8795), options: { Size: "M" } },
      { id: "wedding-005-l", title: "L", price: convertPrice(8795), options: { Size: "L" } },
      { id: "wedding-005-xl", title: "XL", price: convertPrice(8795), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "wedding-006",
    handle: "powder-pink-wedding-lehenga",
    title: "Powder Pink Wedding Lehenga",
    description: "Whisper romance with this delicate powder pink Net lehenga that embodies gentle femininity and timeless grace. The soft pink shade creates a dreamy, ethereal quality that photographs beautifully.",
    price: convertPrice(9295),
    originalPrice: convertPrice(12911),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59625/Pink-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-F(1).jpg"],
    category: "Wedding Lehengas",
    fabric: "Net",
    occasion: "Wedding",
    color: "Powder Pink",
    work: "Heavy Work",
    tags: ["wedding", "pink", "net", "romantic", "soft", "engagement", "feminine"],
    variants: [
      { id: "wedding-006-s", title: "S", price: convertPrice(9295), options: { Size: "S" } },
      { id: "wedding-006-m", title: "M", price: convertPrice(9295), options: { Size: "M" } },
      { id: "wedding-006-l", title: "L", price: convertPrice(9295), options: { Size: "L" } },
      { id: "wedding-006-xl", title: "XL", price: convertPrice(9295), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },

  // === PARTY WEAR COLLECTION ===
  {
    id: "party-001",
    handle: "blush-georgette-party-lehenga",
    title: "Blush Georgette Party Lehenga",
    description: "Float through celebrations in this enchanting blush Georgette lehenga that combines graceful movement with sophisticated style. The premium Georgette fabric creates beautiful drape and movement.",
    price: convertPrice(5995),
    originalPrice: convertPrice(8327),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59622/Blush-Pink-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3504(1).jpg"],
    category: "Party Lehengas",
    fabric: "Georgette",
    occasion: "Party",
    color: "Blush Pink",
    work: "Sequins Work",
    tags: ["party", "georgette", "blush", "cocktail", "celebration", "elegant", "lightweight"],
    variants: [
      { id: "party-001-s", title: "S", price: convertPrice(5995), options: { Size: "S" } },
      { id: "party-001-m", title: "M", price: convertPrice(5995), options: { Size: "M" } },
      { id: "party-001-l", title: "L", price: convertPrice(5995), options: { Size: "L" } },
      { id: "party-001-xl", title: "XL", price: convertPrice(5995), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "party-002",
    handle: "mint-sequin-party-lehenga",
    title: "Mint Sequin Party Lehenga",
    description: "Make a fresh statement with this stunning mint Georgette lehenga that brings a cool, contemporary edge to traditional celebrations. The refreshing mint shade represents renewal and optimism.",
    price: convertPrice(6295),
    originalPrice: convertPrice(8744),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59622/Mint-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3505(1).jpg"],
    category: "Party Lehengas",
    fabric: "Georgette",
    occasion: "Party",
    color: "Mint",
    work: "Sequins Work",
    tags: ["party", "georgette", "mint", "sequins", "contemporary", "dance", "statement"],
    variants: [
      { id: "party-002-s", title: "S", price: convertPrice(6295), options: { Size: "S" } },
      { id: "party-002-m", title: "M", price: convertPrice(6295), options: { Size: "M" } },
      { id: "party-002-l", title: "L", price: convertPrice(6295), options: { Size: "L" } },
      { id: "party-002-xl", title: "XL", price: convertPrice(6295), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "party-003",
    handle: "champagne-gold-party-lehenga",
    title: "Champagne Gold Party Lehenga",
    description: "Toast to elegance with this sophisticated champagne gold Georgette lehenga that embodies refined celebration style. The subtle champagne gold shade provides a neutral foundation.",
    price: convertPrice(6795),
    originalPrice: convertPrice(9438),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59622/Gold-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3506(1).jpg"],
    category: "Party Lehengas",
    fabric: "Georgette",
    occasion: "Party",
    color: "Champagne Gold",
    work: "Sequins Work",
    tags: ["party", "georgette", "gold", "champagne", "elegant", "versatile", "neutral"],
    variants: [
      { id: "party-003-s", title: "S", price: convertPrice(6795), options: { Size: "S" } },
      { id: "party-003-m", title: "M", price: convertPrice(6795), options: { Size: "M" } },
      { id: "party-003-l", title: "L", price: convertPrice(6795), options: { Size: "L" } },
      { id: "party-003-xl", title: "XL", price: convertPrice(6795), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "party-004",
    handle: "navy-blue-party-lehenga",
    title: "Navy Blue Party Lehenga",
    description: "Command the room with this sophisticated navy blue Georgette lehenga that balances classic elegance with modern glamour. The deep navy shade offers timeless appeal.",
    price: convertPrice(6495),
    originalPrice: convertPrice(9021),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59622/Navy-Blue-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3507(1).jpg"],
    category: "Party Lehengas",
    fabric: "Georgette",
    occasion: "Party",
    color: "Navy Blue",
    work: "Sequins Work",
    tags: ["party", "georgette", "navy", "evening", "sophisticated", "timeless", "classic"],
    variants: [
      { id: "party-004-s", title: "S", price: convertPrice(6495), options: { Size: "S" } },
      { id: "party-004-m", title: "M", price: convertPrice(6495), options: { Size: "M" } },
      { id: "party-004-l", title: "L", price: convertPrice(6495), options: { Size: "L" } },
      { id: "party-004-xl", title: "XL", price: convertPrice(6495), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },

  // === FESTIVE COLLECTION ===
  {
    id: "festive-001",
    handle: "marigold-yellow-festive-lehenga",
    title: "Marigold Yellow Festive Lehenga",
    description: "Embrace the spirit of Indian festivals with this vibrant marigold yellow Chinnon lehenga that radiates joy and celebration. Yellow is the color of auspicious beginnings and divine blessings.",
    price: convertPrice(4995),
    originalPrice: convertPrice(6938),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59616/Yellow-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-H(1).jpg"],
    category: "Festive Lehengas",
    fabric: "Chinnon",
    occasion: "Festival",
    color: "Yellow",
    work: "Embroidery",
    tags: ["festive", "chinnon", "yellow", "diwali", "navratri", "traditional", "auspicious"],
    variants: [
      { id: "festive-001-s", title: "S", price: convertPrice(4995), options: { Size: "S" } },
      { id: "festive-001-m", title: "M", price: convertPrice(4995), options: { Size: "M" } },
      { id: "festive-001-l", title: "L", price: convertPrice(4995), options: { Size: "L" } },
      { id: "festive-001-xl", title: "XL", price: convertPrice(4995), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "festive-002",
    handle: "saffron-orange-festive-lehenga",
    title: "Saffron Orange Festive Lehenga",
    description: "Celebrate with sacred energy in this stunning saffron orange Chinnon lehenga that embodies the spiritual significance of Indian festivals. Saffron represents courage, sacrifice, and tradition.",
    price: convertPrice(5295),
    originalPrice: convertPrice(7355),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59616/Orange-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-G(1).jpg"],
    category: "Festive Lehengas",
    fabric: "Chinnon",
    occasion: "Festival",
    color: "Orange",
    work: "Embroidery",
    tags: ["festive", "chinnon", "orange", "saffron", "religious", "traditional", "ganesh-chaturthi"],
    variants: [
      { id: "festive-002-s", title: "S", price: convertPrice(5295), options: { Size: "S" } },
      { id: "festive-002-m", title: "M", price: convertPrice(5295), options: { Size: "M" } },
      { id: "festive-002-l", title: "L", price: convertPrice(5295), options: { Size: "L" } },
      { id: "festive-002-xl", title: "XL", price: convertPrice(5295), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "festive-003",
    handle: "peacock-green-festive-lehenga",
    title: "Peacock Green Festive Lehenga",
    description: "Channel the majestic beauty of India's national bird with this stunning peacock green Chinnon lehenga that celebrates the natural splendor of the subcontinent.",
    price: convertPrice(5495),
    originalPrice: convertPrice(7632),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59616/Teal-Green-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-F(1).jpg"],
    category: "Festive Lehengas",
    fabric: "Chinnon",
    occasion: "Festival",
    color: "Peacock Green",
    work: "Embroidery",
    tags: ["festive", "chinnon", "green", "peacock", "teej", "monsoon", "nature"],
    variants: [
      { id: "festive-003-s", title: "S", price: convertPrice(5495), options: { Size: "S" } },
      { id: "festive-003-m", title: "M", price: convertPrice(5495), options: { Size: "M" } },
      { id: "festive-003-l", title: "L", price: convertPrice(5495), options: { Size: "L" } },
      { id: "festive-003-xl", title: "XL", price: convertPrice(5495), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "festive-004",
    handle: "ruby-red-festive-lehenga",
    title: "Ruby Red Festive Lehenga",
    description: "Shine with the brilliance of precious gems in this magnificent ruby red Chinnon lehenga that combines traditional symbolism with contemporary elegance.",
    price: convertPrice(5695),
    originalPrice: convertPrice(7910),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59616/Red-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-E(1).jpg"],
    category: "Festive Lehengas",
    fabric: "Chinnon",
    occasion: "Festival",
    color: "Ruby Red",
    work: "Embroidery",
    tags: ["festive", "chinnon", "red", "ruby", "karwa-chauth", "dhanteras", "auspicious"],
    variants: [
      { id: "festive-004-s", title: "S", price: convertPrice(5695), options: { Size: "S" } },
      { id: "festive-004-m", title: "M", price: convertPrice(5695), options: { Size: "M" } },
      { id: "festive-004-l", title: "L", price: convertPrice(5695), options: { Size: "L" } },
      { id: "festive-004-xl", title: "XL", price: convertPrice(5695), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "festive-005",
    handle: "dusty-rose-festive-lehenga",
    title: "Dusty Rose Festive Lehenga",
    description: "Embrace soft romance with this enchanting dusty rose Chinnon lehenga that brings a contemporary color palette to traditional festival celebrations.",
    price: convertPrice(4795),
    originalPrice: convertPrice(6660),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59616/Dusty-Rose-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-D(1).jpg"],
    category: "Festive Lehengas",
    fabric: "Chinnon",
    occasion: "Festival",
    color: "Dusty Rose",
    work: "Embroidery",
    tags: ["festive", "chinnon", "dusty-rose", "rakhi", "family", "subtle", "contemporary"],
    variants: [
      { id: "festive-005-s", title: "S", price: convertPrice(4795), options: { Size: "S" } },
      { id: "festive-005-m", title: "M", price: convertPrice(4795), options: { Size: "M" } },
      { id: "festive-005-l", title: "L", price: convertPrice(4795), options: { Size: "L" } },
      { id: "festive-005-xl", title: "XL", price: convertPrice(4795), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "festive-006",
    handle: "royal-purple-festive-lehenga",
    title: "Royal Purple Festive Lehenga",
    description: "Channel regal elegance with this stunning royal purple Chinnon lehenga that combines the majesty of imperial colors with festival celebration energy.",
    price: convertPrice(5395),
    originalPrice: convertPrice(7493),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59616/Purple-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-C(1).jpg"],
    category: "Festive Lehengas",
    fabric: "Chinnon",
    occasion: "Festival",
    color: "Royal Purple",
    work: "Embroidery",
    tags: ["festive", "chinnon", "purple", "royal", "evening", "lakshmi-puja", "regal"],
    variants: [
      { id: "festive-006-s", title: "S", price: convertPrice(5395), options: { Size: "S" } },
      { id: "festive-006-m", title: "M", price: convertPrice(5395), options: { Size: "M" } },
      { id: "festive-006-l", title: "L", price: convertPrice(5395), options: { Size: "L" } },
      { id: "festive-006-xl", title: "XL", price: convertPrice(5395), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },

  // === DESIGNER COLLECTION (Premium) ===
  {
    id: "designer-001",
    handle: "heavy-silk-yellow-mirror-work-lehenga",
    title: "Heavy Silk Yellow Mirror Work Lehenga",
    description: "A radiant masterpiece that captures the essence of sunshine celebrations. This exquisite Heavy Silk lehenga features elaborate mirror work that creates a mesmerizing play of light with every movement. The warm yellow tone is perfect for mehendi ceremonies and haldi rituals, while the premium silk fabric drapes beautifully for an unforgettable silhouette.",
    price: convertPrice(10995 * 3),
    originalPrice: convertPrice(15062 * 3),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59605/Yellow-Heavy-Silk-Party-Wear-Mirror-Work-Lehenga-Choli-Alizeh---Mirror-Maze--3612-1015(1).jpg"],
    category: "Designer Lehengas",
    fabric: "Heavy Silk",
    occasion: "Party",
    color: "Yellow",
    work: "Mirror Work",
    tags: ["designer", "silk", "yellow", "mirror-work", "party", "mehendi", "premium"],
    variants: [
      { id: "designer-001-s", title: "S", price: convertPrice(10995 * 3), options: { Size: "S" } },
      { id: "designer-001-m", title: "M", price: convertPrice(10995 * 3), options: { Size: "M" } },
      { id: "designer-001-l", title: "L", price: convertPrice(10995 * 3), options: { Size: "L" } },
      { id: "designer-001-xl", title: "XL", price: convertPrice(10995 * 3), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "designer-002",
    handle: "heavy-silk-beige-mirror-work-lehenga",
    title: "Heavy Silk Beige Mirror Work Lehenga",
    description: "Understated elegance meets artisan craftsmanship in this sophisticated beige Heavy Silk lehenga. The neutral palette serves as the perfect canvas for the intricate mirror work embellishments that dance with reflected light. Ideal for destination weddings and intimate celebrations where refined luxury speaks louder than bold statements.",
    price: convertPrice(10995 * 3),
    originalPrice: convertPrice(15062 * 3),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59605/Beige-Heavy-Silk-Party-Wear-Mirror-Work-Lehenga-Choli-Alizeh---Mirror-Maze--3612-1013-A(1).jpg"],
    category: "Designer Lehengas",
    fabric: "Heavy Silk",
    occasion: "Party",
    color: "Beige",
    work: "Mirror Work",
    tags: ["designer", "silk", "beige", "mirror-work", "party", "destination-wedding", "neutral"],
    variants: [
      { id: "designer-002-s", title: "S", price: convertPrice(10995 * 3), options: { Size: "S" } },
      { id: "designer-002-m", title: "M", price: convertPrice(10995 * 3), options: { Size: "M" } },
      { id: "designer-002-l", title: "L", price: convertPrice(10995 * 3), options: { Size: "L" } },
      { id: "designer-002-xl", title: "XL", price: convertPrice(10995 * 3), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "designer-003",
    handle: "heavy-silk-sky-blue-mirror-work-lehenga",
    title: "Heavy Silk Sky Blue Mirror Work Lehenga",
    description: "Capture the serenity of clear horizons with this breathtaking sky blue Heavy Silk lehenga. The tranquil blue shade combined with shimmering mirror work creates an ethereal ensemble perfect for brides seeking something truly unique. This piece speaks to the modern woman who appreciates tradition but demands individuality.",
    price: convertPrice(10995 * 3),
    originalPrice: convertPrice(15062 * 3),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59605/Sky-Blue-Heavy-Silk-Party-Wear-Mirror-Work-Lehenga-Choli-Alizeh---Mirror-Maze--3612-1012-A(1).jpg"],
    category: "Designer Lehengas",
    fabric: "Heavy Silk",
    occasion: "Party",
    color: "Sky Blue",
    work: "Mirror Work",
    tags: ["designer", "silk", "sky-blue", "mirror-work", "party", "unique", "modern"],
    variants: [
      { id: "designer-003-s", title: "S", price: convertPrice(10995 * 3), options: { Size: "S" } },
      { id: "designer-003-m", title: "M", price: convertPrice(10995 * 3), options: { Size: "M" } },
      { id: "designer-003-l", title: "L", price: convertPrice(10995 * 3), options: { Size: "L" } },
      { id: "designer-003-xl", title: "XL", price: convertPrice(10995 * 3), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "designer-004",
    handle: "heavy-silk-dusty-pink-mirror-work-lehenga",
    title: "Heavy Silk Dusty Pink Mirror Work Lehenga",
    description: "Romance personified in this dreamy dusty pink Heavy Silk lehenga adorned with exquisite mirror work. The muted pink tone creates a soft, feminine aesthetic that photographs beautifully in any lighting. Perfect for engagement ceremonies and pre-wedding celebrations where elegance takes center stage.",
    price: convertPrice(10995 * 3),
    originalPrice: convertPrice(15062 * 3),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/December/59605/Dusty-Pink-Heavy-Silk-Party-Wear-Mirror-Work-Lehenga-Choli-Alizeh---Mirror-Maze--3612-1012(1).jpg"],
    category: "Designer Lehengas",
    fabric: "Heavy Silk",
    occasion: "Party",
    color: "Dusty Pink",
    work: "Mirror Work",
    tags: ["designer", "silk", "dusty-pink", "mirror-work", "party", "engagement", "romantic"],
    variants: [
      { id: "designer-004-s", title: "S", price: convertPrice(10995 * 3), options: { Size: "S" } },
      { id: "designer-004-m", title: "M", price: convertPrice(10995 * 3), options: { Size: "M" } },
      { id: "designer-004-l", title: "L", price: convertPrice(10995 * 3), options: { Size: "L" } },
      { id: "designer-004-xl", title: "XL", price: convertPrice(10995 * 3), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "designer-005",
    handle: "organza-lavender-bridal-heavy-work-lehenga",
    title: "Organza Lavender Bridal Heavy Work Lehenga",
    description: "Step into ethereal elegance with this enchanting lavender Organza bridal lehenga. The delicate fabric combined with heavy embroidery work creates a masterpiece fit for the most discerning bride. The contemporary lavender shade offers a refreshing alternative to traditional bridal colors while maintaining the grandeur expected on your special day.",
    price: convertPrice(11295 * 3),
    originalPrice: convertPrice(15908 * 3),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/November/59368/Lavender-Organza-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-Aarohi-3474-2918-F(1).jpg"],
    category: "Designer Lehengas",
    fabric: "Organza",
    occasion: "Bridal",
    color: "Lavender",
    work: "Heavy Work",
    tags: ["designer", "organza", "lavender", "bridal", "heavy-work", "contemporary", "premium"],
    variants: [
      { id: "designer-005-s", title: "S", price: convertPrice(11295 * 3), options: { Size: "S" } },
      { id: "designer-005-m", title: "M", price: convertPrice(11295 * 3), options: { Size: "M" } },
      { id: "designer-005-l", title: "L", price: convertPrice(11295 * 3), options: { Size: "L" } },
      { id: "designer-005-xl", title: "XL", price: convertPrice(11295 * 3), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "designer-006",
    handle: "organza-red-bridal-heavy-work-lehenga",
    title: "Organza Red Bridal Heavy Work Lehenga",
    description: "The timeless allure of bridal red reimagined in luxurious Organza fabric. This stunning lehenga features intensive heavy work embroidery that creates depth and dimension throughout. The auspicious red shade symbolizes prosperity and new beginnings, making it the perfect choice for traditional wedding ceremonies.",
    price: convertPrice(11295 * 3),
    originalPrice: convertPrice(15908 * 3),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/November/59368/Red-Organza-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-Aarohi-3474-2918-E(1).jpg"],
    category: "Designer Lehengas",
    fabric: "Organza",
    occasion: "Bridal",
    color: "Red",
    work: "Heavy Work",
    tags: ["designer", "organza", "red", "bridal", "heavy-work", "traditional", "auspicious"],
    variants: [
      { id: "designer-006-s", title: "S", price: convertPrice(11295 * 3), options: { Size: "S" } },
      { id: "designer-006-m", title: "M", price: convertPrice(11295 * 3), options: { Size: "M" } },
      { id: "designer-006-l", title: "L", price: convertPrice(11295 * 3), options: { Size: "L" } },
      { id: "designer-006-xl", title: "XL", price: convertPrice(11295 * 3), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "designer-007",
    handle: "organza-white-bridal-heavy-work-lehenga",
    title: "Organza White Bridal Heavy Work Lehenga",
    description: "Pure elegance in pristine white Organza, this bridal masterpiece redefines contemporary wedding fashion. The heavy work embroidery on the immaculate white base creates a stunning contrast that photographs beautifully. Ideal for fusion weddings or as a striking reception outfit that commands attention.",
    price: convertPrice(11295 * 3),
    originalPrice: convertPrice(15908 * 3),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/November/59368/White-Organza-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-Aarohi-3474-2918-D(1).jpg"],
    category: "Designer Lehengas",
    fabric: "Organza",
    occasion: "Bridal",
    color: "White",
    work: "Heavy Work",
    tags: ["designer", "organza", "white", "bridal", "heavy-work", "fusion", "reception"],
    variants: [
      { id: "designer-007-s", title: "S", price: convertPrice(11295 * 3), options: { Size: "S" } },
      { id: "designer-007-m", title: "M", price: convertPrice(11295 * 3), options: { Size: "M" } },
      { id: "designer-007-l", title: "L", price: convertPrice(11295 * 3), options: { Size: "L" } },
      { id: "designer-007-xl", title: "XL", price: convertPrice(11295 * 3), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "designer-008",
    handle: "organza-rose-pink-bridal-heavy-work-lehenga",
    title: "Organza Rose Pink Bridal Heavy Work Lehenga",
    description: "Soft romance meets bridal grandeur in this enchanting rose pink Organza lehenga. The delicate pink hue combined with intensive heavy work creates a dreamy ensemble perfect for the bride who desires feminine elegance. Every detail has been meticulously crafted to ensure you shine on your most magical day.",
    price: convertPrice(11295 * 3),
    originalPrice: convertPrice(15908 * 3),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/November/59368/Rose-Pink-Organza-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-Aarohi-3474-2918-C(1).jpg"],
    category: "Designer Lehengas",
    fabric: "Organza",
    occasion: "Bridal",
    color: "Rose Pink",
    work: "Heavy Work",
    tags: ["designer", "organza", "rose-pink", "bridal", "heavy-work", "romantic", "feminine"],
    variants: [
      { id: "designer-008-s", title: "S", price: convertPrice(11295 * 3), options: { Size: "S" } },
      { id: "designer-008-m", title: "M", price: convertPrice(11295 * 3), options: { Size: "M" } },
      { id: "designer-008-l", title: "L", price: convertPrice(11295 * 3), options: { Size: "L" } },
      { id: "designer-008-xl", title: "XL", price: convertPrice(11295 * 3), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "designer-009",
    handle: "organza-blue-bridal-heavy-work-lehenga",
    title: "Organza Blue Bridal Heavy Work Lehenga",
    description: "A bold departure from tradition, this stunning blue Organza bridal lehenga makes a powerful style statement. The rich blue shade symbolizes depth and stability, while the heavy work embroidery adds the opulence expected of bridal couture. Perfect for the confident bride who charts her own path.",
    price: convertPrice(11295 * 3),
    originalPrice: convertPrice(15908 * 3),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/November/59368/Blue-Organza-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-Aarohi-3474-2918-B(1).jpg"],
    category: "Designer Lehengas",
    fabric: "Organza",
    occasion: "Bridal",
    color: "Blue",
    work: "Heavy Work",
    tags: ["designer", "organza", "blue", "bridal", "heavy-work", "bold", "statement"],
    variants: [
      { id: "designer-009-s", title: "S", price: convertPrice(11295 * 3), options: { Size: "S" } },
      { id: "designer-009-m", title: "M", price: convertPrice(11295 * 3), options: { Size: "M" } },
      { id: "designer-009-l", title: "L", price: convertPrice(11295 * 3), options: { Size: "L" } },
      { id: "designer-009-xl", title: "XL", price: convertPrice(11295 * 3), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "designer-010",
    handle: "organza-rust-orange-bridal-heavy-work-lehenga",
    title: "Organza Rust Orange Bridal Heavy Work Lehenga",
    description: "Embrace the warmth of autumn celebrations with this striking rust orange Organza bridal lehenga. The earthy yet vibrant shade creates a unique bridal look that stands apart from conventional choices. Heavy work embroidery throughout ensures this piece delivers the grandeur and sophistication befitting a bridal ensemble.",
    price: convertPrice(11295 * 3),
    originalPrice: convertPrice(15908 * 3),
    currency: "USD",
    images: ["https://kesimg.b-cdn.net/images/650/2025y/November/59368/Rust-Orange-Organza-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-Aarohi-3474-2918-A(1).jpg"],
    category: "Designer Lehengas",
    fabric: "Organza",
    occasion: "Bridal",
    color: "Rust Orange",
    work: "Heavy Work",
    tags: ["designer", "organza", "rust-orange", "bridal", "heavy-work", "autumn", "unique"],
    variants: [
      { id: "designer-010-s", title: "S", price: convertPrice(11295 * 3), options: { Size: "S" } },
      { id: "designer-010-m", title: "M", price: convertPrice(11295 * 3), options: { Size: "M" } },
      { id: "designer-010-l", title: "L", price: convertPrice(11295 * 3), options: { Size: "L" } },
      { id: "designer-010-xl", title: "XL", price: convertPrice(11295 * 3), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  }
];

// Convert local product to ShopifyProduct format
type ShopifyProductNode = {
  id: string;
  title: string;
  description: string;
  handle: string;
  productType?: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
        selectedOptions: Array<{
          name: string;
          value: string;
        }>;
      };
    }>;
  };
  options: Array<{
    name: string;
    values: string[];
  }>;
};

const convertToShopifyFormat = (product: LocalProduct | SareeProduct | MenswearProduct | SuitProduct): { node: ShopifyProductNode } => ({
  node: {
    id: product.id,
    title: product.title,
    description: product.description,
    handle: product.handle,
    productType: product.category,
    priceRange: {
      minVariantPrice: {
        amount: product.price,
        currencyCode: product.currency
      }
    },
    images: {
      edges: product.images.map((url, index) => ({
        node: {
          url,
          altText: `${product.title} - Image ${index + 1}`
        }
      }))
    },
    variants: {
      edges: product.variants.map(variant => ({
        node: {
          id: variant.id,
          title: variant.title,
          price: {
            amount: variant.price,
            currencyCode: product.currency
          },
          availableForSale: true,
          selectedOptions: Object.entries(variant.options).map(([name, value]) => ({
            name,
            value
          }))
        }
      }))
    },
    options: product.options
  }
});

// Get all lehenga products in Shopify format
export const getLocalLehengaProducts = () => localProducts.map(convertToShopifyFormat);

// Get all saree products in Shopify format
export const getLocalSareeProducts = () => sareeProducts.map(convertToShopifyFormat);

// Get all menswear products in Shopify format
export const getLocalMenswearProducts = () => menswearProducts.map(convertToShopifyFormat);

// Get all suit products in Shopify format
export const getLocalSuitProducts = () => suitProducts.map(convertToShopifyFormat);

// Get all products across all categories
export const getAllLocalProducts = () => [
  ...localProducts,
  ...sareeProducts,
  ...menswearProducts,
  ...suitProducts
].map(convertToShopifyFormat);

// Get a specific product by handle
export const getLocalProductByHandle = (handle: string): { node: ShopifyProductNode } | undefined => {
  // Search in lehengas
  const lehenga = localProducts.find(p => p.handle === handle);
  if (lehenga) return convertToShopifyFormat(lehenga);
  
  // Search in sarees
  const saree = sareeProducts.find(p => p.handle === handle);
  if (saree) return convertToShopifyFormat(saree);
  
  // Search in menswear
  const menswear = menswearProducts.find(p => p.handle === handle);
  if (menswear) return convertToShopifyFormat(menswear);
  
  // Search in suits
  const suit = suitProducts.find(p => p.handle === handle);
  if (suit) return convertToShopifyFormat(suit);
  
  return undefined;
};

// Get products by category
export const getProductsByCategory = (category: 'lehengas' | 'sarees' | 'menswear' | 'suits') => {
  switch (category) {
    case 'lehengas':
      return getLocalLehengaProducts();
    case 'sarees':
      return getLocalSareeProducts();
    case 'menswear':
      return getLocalMenswearProducts();
    case 'suits':
      return getLocalSuitProducts();
    default:
      return [];
  }
};
