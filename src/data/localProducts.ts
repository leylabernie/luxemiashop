// Boutique-style local product data scraped from wholesalesalwar.com
// SEO-optimized titles and descriptions for luxury ethnic wear boutique

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
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Pastel-Pink-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10243(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Pastel-Pink-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10243(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Pastel-Pink-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10243(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Pastel-Pink-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10243(4).jpg"
    ],
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
    description: "Embrace the timeless grandeur of Indian bridal tradition with this magnificent Rani Pink silk lehenga. This heritage piece is woven from premium Banarasi silk that carries the weight and drape synonymous with royal trousseau. The heavy traditional work combines resham thread embroidery, genuine kundan stones, and delicate dabka detailing that creates a three-dimensional textural masterpiece. Every motif tells a story—from the peacock patterns symbolizing eternal love to the lotus blooms representing new beginnings. The structured blouse features a sweetheart neckline with full sleeves adorned with matching embroidery, while the dupatta carries traditional butis across its expanse. This is not merely a garment; it is an heirloom that transforms every bride into royalty.",
    price: convertPrice(24295),
    originalPrice: convertPrice(34218),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59645/Rani-Pink-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-A(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59645/Rani-Pink-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-A(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59645/Rani-Pink-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-A(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59645/Rani-Pink-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-A(4).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59645/Rani-Pink-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-A(5).jpg"
    ],
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
    description: "The quintessential bridal red that has adorned generations of brides across the subcontinent. This luxurious silk lehenga is a testament to the enduring appeal of traditional craftsmanship, featuring masterfully executed heavy work that creates intricate patterns dancing with every movement. The auspicious red hue is achieved through natural dye processes that create depth and richness unmatched by synthetic alternatives. Adorned with genuine zari threadwork, the lehenga tells stories through its kalash motifs symbolizing prosperity, paisleys representing fertility, and vine patterns signifying eternal growth. The matching choli features a classic cut with contemporary comfort, while the heavy dupatta can be draped in multiple traditional styles. A timeless investment piece that honors your heritage while celebrating modern craftsmanship at its finest.",
    price: convertPrice(24295),
    originalPrice: convertPrice(34218),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59645/Red-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-B(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59645/Red-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-B(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59645/Red-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-B(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59645/Red-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-B(4).jpg"
    ],
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
    description: "For the modern bride who dares to redefine tradition. This pristine ivory Heavy Net lehenga represents the new era of bridal fashion, where classic silhouettes meet contemporary color palettes. The sequins and embroidery work creates a dreamlike shimmer that photographs beautifully in both daylight and candlelit evening settings. Each sequin is hand-applied in constellation patterns that catch and reflect light from every angle, creating an ethereal glow around the wearer. The lehenga features a comfortable cancan lining for volume without weight, while the blouse incorporates a modesty panel for versatile styling. The dupatta is designed with a gradient sequin application, heavier at the borders and lighter towards the center for balanced elegance. Ideal for destination beach weddings, sophisticated receptions, or brides seeking to make a bold statement while honoring tradition.",
    price: convertPrice(12895),
    originalPrice: convertPrice(17664),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(4).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(5).jpg"
    ],
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
    description: "A contemporary masterpiece that breaks the traditional color boundaries while maintaining the grandeur expected of bridal couture. This serene lavender Pure Net bridal ensemble speaks to the bride with a discerning eye for unique beauty. The heavy work embroidery creates extraordinary depth and dimension, featuring delicate floral trails, butterfly motifs representing transformation, and crystal accents that sparkle like morning dew. The lavender shade is carefully calibrated to flatter all skin tones, transitioning beautifully from indoor to outdoor settings. The lehenga incorporates a fitted waist panel for a streamlined silhouette, while the flared skirt creates graceful movement with every step. The choli features an intricate back design perfect for those over-the-shoulder photography moments. This is for the fashion-forward bride who understands that being unconventional is the ultimate sophistication.",
    price: convertPrice(12695),
    originalPrice: convertPrice(17632),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Lavender-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10242(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Lavender-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10242(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Lavender-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10242(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Lavender-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10242(4).jpg"
    ],
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
    description: "Make an unforgettable entrance in this stunning metallic silver Pure Net lehenga that commands attention and admiration in equal measure. The lustrous silver base is achieved through an innovative weaving technique that incorporates metallic threads directly into the net construction. The heavy work creates luminous patterns that catch every light source, ensuring you remain the radiant center of attention throughout your celebration. This piece features contemporary geometric patterns interspersed with traditional floral elements, creating a beautiful dialogue between modern design and heritage craftsmanship. The structured blouse includes built-in support for comfort during long celebrations, while the lehenga skirt offers generous flare for dramatic movement. The matching dupatta features a border of three-dimensional flower appliqués. A bold, glamorous choice for the bride who knows her wedding is her time to shine.",
    price: convertPrice(13995),
    originalPrice: convertPrice(19438),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Metalic-Silver-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10245(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Metalic-Silver-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10245(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Metalic-Silver-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10245(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Metalic-Silver-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10245(4).jpg"
    ],
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
    description: "Embrace regal sophistication with this sumptuous burgundy velvet lehenga that embodies the luxurious warmth of winter celebrations. The premium Italian velvet has been specially treated for a subtle sheen that photographs beautifully in both natural and artificial lighting. Heavy work embellishment featuring cut-dana, sequins, and hand-applied rhinestones creates mesmerizing patterns inspired by Mughal architecture and Persian gardens. The deep burgundy shade represents passion, prosperity, and the richness of love. The structured bodice features princess seams for a flattering fit, while the lehenga skirt is constructed with multiple layers to create the perfect volume without excessive weight. This piece transitions seamlessly from traditional ceremonies to modern reception celebrations. Paired with antique gold jewelry, it creates an unforgettable ensemble worthy of royalty.",
    price: convertPrice(8995),
    originalPrice: convertPrice(12155),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Burgundy-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-A(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Burgundy-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-A(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Burgundy-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-A(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Burgundy-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-A(4).jpg"
    ],
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
    description: "Fall in love with this intoxicating wine-colored Net lehenga that exudes romance and sophistication. The deep wine shade has been carefully chosen to complement a wide range of skin tones while evoking the warmth and richness of celebratory traditions. Heavy work embroidery in contrasting gold and antique copper threads creates intricate patterns that tell stories of love and new beginnings. The lehenga features a contemporary A-line silhouette that flatters all body types while maintaining traditional elegance. The blouse incorporates delicate cap sleeves and a sweetheart neckline that frames the face beautifully. The dupatta is generously sized for versatile draping options. This ensemble is perfect for engagement ceremonies, sangeet nights, or as a distinctive choice for wedding receptions.",
    price: convertPrice(8995),
    originalPrice: convertPrice(12155),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Wine-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-B(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Wine-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-B(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Wine-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-B(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Wine-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-B(4).jpg"
    ],
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
    description: "Channel the mystique of enchanted forests with this breathtaking emerald green Net lehenga that celebrates the beauty of nature. The rich emerald shade represents growth, harmony, and the eternal cycle of love that weddings celebrate. Intricate heavy work embroidery features botanical motifs—trailing vines, blooming flowers, and delicate leaves—creating a garden of beauty that wraps around you with every movement. The construction balances traditional volume with modern comfort, featuring a fitted waist that flares into a generous skirt. The blouse showcases elegant three-quarter sleeves with matching embroidery, while the dupatta is bordered with a cascade of tiny mirror work that catches light like dewdrops on leaves. Perfect for outdoor celebrations, garden weddings, or any event where you want to embody natural elegance.",
    price: convertPrice(9495),
    originalPrice: convertPrice(13189),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Green-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-C(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Green-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-C(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Green-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-C(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Green-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-C(4).jpg"
    ],
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
    description: "Make a statement of confidence and elegance with this commanding royal blue Net lehenga that embodies the depth and mystery of midnight skies. The vibrant blue shade has been selected to photograph beautifully while maintaining its richness across all lighting conditions. Heavy work featuring a combination of thread embroidery, beadwork, and subtle sequin accents creates patterns inspired by celestial bodies and traditional geometric designs. The lehenga construction allows for dramatic movement while maintaining a streamlined silhouette. The blouse features intricate back detailing that creates a stunning visual when you turn away. The matching dupatta is designed with attention to border weight for elegant draping. This piece is perfect for brides and wedding guests who want to stand out while maintaining sophisticated elegance.",
    price: convertPrice(9495),
    originalPrice: convertPrice(13189),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Blue-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-D(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Blue-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-D(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Blue-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-D(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Blue-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-D(4).jpg"
    ],
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
    description: "Capture the warmth of a perfect sunset with this stunning coral Net lehenga that radiates joy and celebration. The vibrant coral shade represents the energy and excitement of new beginnings, making it perfect for mehendi ceremonies, sangeet nights, or daytime wedding events. The heavy work embroidery combines traditional motifs with contemporary design sensibilities, featuring cascading florals and subtle geometric accents. The lehenga's construction emphasizes comfortable movement while maintaining beautiful structure. The blouse features a flattering neckline that works beautifully with both statement and delicate jewelry. The dupatta is designed with carefully weighted borders that create elegant movement. This piece brings sunshine to any celebration and photographs beautifully in both indoor and outdoor settings.",
    price: convertPrice(8795),
    originalPrice: convertPrice(12216),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Coral-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-E(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Coral-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-E(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Coral-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-E(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Coral-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-E(4).jpg"
    ],
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
    description: "Whisper romance with this delicate powder pink Net lehenga that embodies gentle femininity and timeless grace. The soft pink shade creates a dreamy, ethereal quality that photographs beautifully in any setting. Heavy work featuring delicate thread embroidery, tiny seed pearls, and subtle shimmer creates patterns reminiscent of spring gardens in bloom. The construction balances tradition with contemporary comfort, featuring a carefully designed fit that flatters while allowing freedom of movement. The blouse incorporates elegant detailing that elevates the overall look, while the dupatta offers versatile draping options. Perfect for engagement ceremonies, reception events, or brides who prefer soft, romantic aesthetics over bold statements.",
    price: convertPrice(9295),
    originalPrice: convertPrice(12911),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Pink-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-F(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Pink-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-F(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Pink-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-F(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Pink-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-F(4).jpg"
    ],
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
    description: "Float through celebrations in this enchanting blush Georgette lehenga that combines graceful movement with sophisticated style. The premium Georgette fabric creates beautiful drape and movement, making every step a moment of elegance. The soft blush shade flatters all skin tones while adding a romantic touch to any celebration. Delicate sequins work creates subtle sparkle that catches light beautifully without overwhelming the refined aesthetic. The lightweight construction ensures comfort during extended wear, while the carefully designed silhouette maintains structure and elegance. The blouse features contemporary styling with traditional undertones, and the matching dupatta adds grace to the overall look. Perfect for cocktail parties, anniversary celebrations, or any occasion calling for refined glamour.",
    price: convertPrice(5995),
    originalPrice: convertPrice(8327),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Blush-Pink-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3504(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Blush-Pink-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3504(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Blush-Pink-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3504(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Blush-Pink-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3504(4).jpg"
    ],
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
    description: "Make a fresh statement with this stunning mint Georgette lehenga that brings a cool, contemporary edge to traditional celebrations. The refreshing mint shade represents renewal and optimism—perfect for celebrations marking new beginnings. All-over sequins work creates a mesmerizing shimmer that transforms you into the center of attention on any dance floor. The Georgette fabric provides the perfect canvas for the sequin embellishment while ensuring comfortable movement throughout your celebration. The blouse features a modern cut that balances traditional modesty with contemporary style, while the dupatta adds graceful finishing. This piece is designed for women who appreciate unique color palettes and aren't afraid to make a fashion statement.",
    price: convertPrice(6295),
    originalPrice: convertPrice(8744),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Mint-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3505(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Mint-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3505(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Mint-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3505(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Mint-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3505(4).jpg"
    ],
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
    description: "Toast to elegance with this sophisticated champagne gold Georgette lehenga that embodies refined celebration style. The subtle champagne gold shade provides a neutral foundation that works beautifully with any jewelry collection and complements all skin tones. Intricate sequins work creates patterns that catch light from every angle, ensuring you sparkle throughout your event. The Georgette fabric drapes beautifully, creating movement that photographs like liquid gold. The blouse design balances traditional elements with modern sensibilities, while the dupatta features carefully weighted borders for elegant draping. This versatile piece transitions seamlessly from traditional functions to modern reception celebrations. A wardrobe investment piece that will serve for countless special occasions.",
    price: convertPrice(6795),
    originalPrice: convertPrice(9438),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Gold-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3506(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Gold-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3506(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Gold-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3506(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Gold-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3506(4).jpg"
    ],
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
    description: "Command attention with this striking navy blue Georgette lehenga that exudes confidence and sophistication. The deep navy shade represents trust, depth, and timeless elegance—making it perfect for evening celebrations where you want to make a memorable impression. Sequins work in complementary shades creates patterns that shimmer with every movement, while the Georgette fabric ensures beautiful drape and comfort. The blouse features a contemporary silhouette that works beautifully with both statement and delicate jewelry. The structured construction maintains elegance while allowing freedom of movement on the dance floor. Perfect for cocktail parties, evening receptions, or any celebration calling for refined glamour.",
    price: convertPrice(6495),
    originalPrice: convertPrice(9021),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Navy-Blue-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3507(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Navy-Blue-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3507(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Navy-Blue-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3507(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Navy-Blue-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3507(4).jpg"
    ],
    category: "Party Lehengas",
    fabric: "Georgette",
    occasion: "Party",
    color: "Navy Blue",
    work: "Sequins Work",
    tags: ["party", "georgette", "navy", "evening", "cocktail", "confident", "sophisticated"],
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
    description: "Embrace the spirit of Indian festivals with this vibrant marigold yellow Chinnon lehenga that radiates joy and celebration. Yellow is the color of auspicious beginnings, divine blessings, and the warmth of family gatherings. The premium Chinnon fabric provides beautiful movement and a subtle sheen that photographs gorgeously. Intricate embroidery work features traditional festival motifs including diyas, rangoli patterns, and floral designs that celebrate cultural heritage. The construction ensures comfortable wear throughout extended festival celebrations, from morning pujas to evening festivities. The blouse incorporates traditional elements with contemporary comfort, while the dupatta features carefully crafted borders. Perfect for Diwali, Navratri, Durga Puja, or any celebration calling for traditional color symbolism.",
    price: convertPrice(4995),
    originalPrice: convertPrice(6938),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Yellow-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-H(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Yellow-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-H(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Yellow-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-H(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Yellow-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-H(4).jpg"
    ],
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
    description: "Celebrate with sacred energy in this stunning saffron orange Chinnon lehenga that embodies the spiritual significance of Indian festivals. Saffron represents courage, sacrifice, and the sacred flame of tradition—making it perfect for religious ceremonies and cultural celebrations. The luxurious Chinnon fabric creates beautiful movement while providing comfort for extended wear. Elaborate embroidery work features traditional motifs that honor heritage craftsmanship. The vibrant color photographs beautifully in both indoor and outdoor festival settings. The blouse design balances traditional coverage with contemporary styling, while the dupatta features intricate border work. Perfect for Ganesh Chaturthi, Holi celebrations, or any occasion calling for traditional vibrancy.",
    price: convertPrice(5295),
    originalPrice: convertPrice(7355),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Orange-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-G(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Orange-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-G(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Orange-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-G(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Orange-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-G(4).jpg"
    ],
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
    description: "Channel the majestic beauty of India's national bird with this stunning peacock green Chinnon lehenga that celebrates the natural splendor of the subcontinent. The rich peacock green shade represents prosperity, renewal, and the lush beauty of monsoon seasons. Premium Chinnon fabric provides the perfect drape and movement, creating graceful silhouettes with every step. Embroidery work features motifs inspired by peacock feathers, eyes, and plumage—traditional symbols of beauty, pride, and good fortune. The construction balances traditional volume with contemporary comfort. The blouse incorporates elegant detailing, while the dupatta features coordinating peacock-inspired patterns. Perfect for Teej, monsoon celebrations, or any occasion where you want to embody natural elegance.",
    price: convertPrice(5495),
    originalPrice: convertPrice(7632),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Teal-Green-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-F(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Teal-Green-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-F(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Teal-Green-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-F(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Teal-Green-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-F(4).jpg"
    ],
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
    description: "Shine with the brilliance of precious gems in this magnificent ruby red Chinnon lehenga that combines traditional symbolism with contemporary elegance. The deep ruby shade represents passion, prosperity, and the sacred fire that blesses auspicious occasions. Premium Chinnon fabric creates beautiful movement and a subtle sheen that catches light gorgeously. Intricate embroidery work features traditional festival motifs in contrasting gold threads, creating visual depth and richness. The construction ensures comfortable wear throughout extended celebrations while maintaining elegant structure. The blouse features a flattering silhouette with traditional detailing, while the dupatta offers versatile draping options. Perfect for Karwa Chauth, Dhanteras, or any celebration calling for auspicious red.",
    price: convertPrice(5695),
    originalPrice: convertPrice(7910),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Red-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-E(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Red-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-E(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Red-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-E(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Red-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-E(4).jpg"
    ],
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
    description: "Embrace soft romance with this enchanting dusty rose Chinnon lehenga that brings a contemporary color palette to traditional festival celebrations. The sophisticated dusty rose shade offers a modern alternative to traditional pinks while maintaining feminine grace. Premium Chinnon fabric provides beautiful drape and comfortable wear throughout extended celebrations. Delicate embroidery work features floral motifs that add subtle texture without overwhelming the refined color story. The construction emphasizes flattering silhouettes while ensuring ease of movement. The blouse features contemporary detailing that works beautifully with both traditional and modern jewelry. Perfect for Raksha Bandhan, Bhai Dooj, or family celebrations where subtle elegance is preferred.",
    price: convertPrice(4795),
    originalPrice: convertPrice(6660),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Dusty-Rose-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-D(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Dusty-Rose-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-D(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Dusty-Rose-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-D(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Dusty-Rose-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-D(4).jpg"
    ],
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
    description: "Channel regal elegance with this stunning royal purple Chinnon lehenga that combines the majesty of imperial colors with festival celebration energy. Purple has historically been associated with royalty, spirituality, and luxury—making it perfect for special occasions where you want to feel truly magnificent. Premium Chinnon fabric creates beautiful movement and photographs gorgeously in both natural and artificial lighting. Rich embroidery work features traditional motifs executed with precision and artistry. The construction balances traditional grandeur with contemporary comfort. The blouse incorporates elegant detailing that elevates the overall look, while the dupatta features coordinating border work. Perfect for evening pujas, Lakshmi puja, or any festival celebration calling for regal presence.",
    price: convertPrice(5395),
    originalPrice: convertPrice(7493),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Purple-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-C(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Purple-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-C(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Purple-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-C(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Purple-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-C(4).jpg"
    ],
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
