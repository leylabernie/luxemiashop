// Boutique-style local product data scraped from wholesalesalwar.com
// SEO-optimized titles and descriptions for luxury ethnic wear boutique

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
    description: "A sophisticated wine-hued lehenga that speaks of understated luxury and refined taste. This piece is crafted from premium soft net fabric that floats elegantly with every movement. The heavy work embellishment creates intricate climbing vine patterns interspersed with blooming roses, symbolizing love that grows stronger with time. The rich wine color has been achieved through a multi-step dyeing process that ensures depth and color-fastness. Crystal-encrusted borders outline the hem and neckline, creating frames of light that accentuate your silhouette. The blouse features a contemporary cut with traditional embroidery, offering the best of both worlds. This versatile piece is ideal for sangeet ceremonies where you want to dance freely, engagement parties where you want to make an impression, or as a statement bridesmaid piece that photographs beautifully beside the bride.",
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
    tags: ["wedding", "wine", "net", "sangeet", "engagement", "bridesmaid", "romantic", "crystal"],
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
    handle: "royal-velvet-red-wedding-lehenga",
    title: "Royal Velvet Red Wedding Lehenga",
    description: "Captivate hearts in classic red velvet, the fabric of queens and empresses across centuries. This stunning lehenga features meticulous sequins work applied in traditional paisley and kalka patterns that have adorned royal garments for generations. The velvet has been carefully selected for its plush hand-feel and subtle light-catching qualities—when you move, it seems to shimmer from within. The construction includes hidden support panels that create a smooth silhouette, while the flared skirt maintains the drama expected of celebration wear. Every sequin is hand-stitched to ensure durability through multiple wearings and even generations of heirloom passing. The accompanying blouse features a modest back with hook closures, while the dupatta carries matching border work. Perfect for winter weddings when you want to make a bold, traditionally rooted statement that will be remembered.",
    price: convertPrice(5795),
    originalPrice: convertPrice(7938),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Red-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3014(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Red-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3014(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Red-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3014(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Red-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3014(4).jpg"
    ],
    category: "Wedding Lehengas",
    fabric: "Velvet",
    occasion: "Wedding",
    color: "Red",
    work: "Sequins Work",
    tags: ["wedding", "velvet", "red", "sequins", "winter", "traditional", "royal", "heirloom"],
    variants: [
      { id: "wedding-003-s", title: "S", price: convertPrice(5795), options: { Size: "S" } },
      { id: "wedding-003-m", title: "M", price: convertPrice(5795), options: { Size: "M" } },
      { id: "wedding-003-l", title: "L", price: convertPrice(5795), options: { Size: "L" } },
      { id: "wedding-003-xl", title: "XL", price: convertPrice(5795), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "wedding-004",
    handle: "midnight-velvet-purple-lehenga",
    title: "Midnight Velvet Purple Lehenga",
    description: "Step into enchantment with this deep purple velvet masterpiece that channels the mystique of twilight celebrations. The color itself tells a story—neither blue nor violet but a rich purple that shifts undertones depending on the light, creating intrigue and sophistication. Sequins work creates constellation-like patterns across the rich fabric, as if you've wrapped yourself in the night sky. The velvet is backed with premium satin for comfort against the skin, while the construction incorporates stretch panels for ease of movement during dancing and celebration. This piece represents contemporary wedding fashion at its finest—rooted in traditional craftsmanship yet thoroughly modern in its color choice and styling options. Pair with kundan jewelry for a classic look, or contrast with gold for dramatic effect. For the modern wedding guest who appreciates luxury and dares to be different.",
    price: convertPrice(5795),
    originalPrice: convertPrice(7938),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Purple-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3012(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Purple-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3012(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Purple-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3012(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Purple-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3012(4).jpg"
    ],
    category: "Wedding Lehengas",
    fabric: "Velvet",
    occasion: "Wedding",
    color: "Purple",
    work: "Sequins Work",
    tags: ["wedding", "velvet", "purple", "sequins", "contemporary", "guest", "twilight", "mystique"],
    variants: [
      { id: "wedding-004-s", title: "S", price: convertPrice(5795), options: { Size: "S" } },
      { id: "wedding-004-m", title: "M", price: convertPrice(5795), options: { Size: "M" } },
      { id: "wedding-004-l", title: "L", price: convertPrice(5795), options: { Size: "L" } },
      { id: "wedding-004-xl", title: "XL", price: convertPrice(5795), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "wedding-005",
    handle: "noir-elegance-velvet-lehenga",
    title: "Noir Elegance Velvet Lehenga",
    description: "Redefine wedding fashion with this striking black velvet lehenga that proves sophistication knows no color boundaries. Black, once avoided in traditional celebrations, has emerged as the choice of the confident, fashion-forward woman who understands that elegance transcends convention. Delicate sequins work adds subtle glamour without overwhelming the dramatic silhouette—like stars scattered across a midnight sky. The premium velvet maintains its deep, true black shade without the greenish tinge found in lesser quality fabrics. The construction is designed for comfort without sacrificing drama, with a fitted waist panel and flared skirt that creates a striking hourglass effect. This lehenga makes an unforgettable statement at evening receptions, cocktail celebrations, and formal dinners. For the woman who knows that black is always, eternally, the new black—and who wears her confidence as beautifully as she wears her clothes.",
    price: convertPrice(5795),
    originalPrice: convertPrice(7938),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Black-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3011(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Black-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3011(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Black-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3011(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Black-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3011(4).jpg"
    ],
    category: "Wedding Lehengas",
    fabric: "Velvet",
    occasion: "Wedding",
    color: "Black",
    work: "Sequins Work",
    tags: ["wedding", "velvet", "black", "sequins", "contemporary", "bold", "sophisticated", "evening"],
    variants: [
      { id: "wedding-005-s", title: "S", price: convertPrice(5795), options: { Size: "S" } },
      { id: "wedding-005-m", title: "M", price: convertPrice(5795), options: { Size: "M" } },
      { id: "wedding-005-l", title: "L", price: convertPrice(5795), options: { Size: "L" } },
      { id: "wedding-005-xl", title: "XL", price: convertPrice(5795), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "wedding-006",
    handle: "blush-pink-zari-wedding-lehenga",
    title: "Blush Pink Zari Wedding Lehenga",
    description: "Romance personified in delicate blush pink crepe silk that moves like poetry. This ethereal lehenga captures the essence of timeless femininity through its soft color palette and exquisite traditional zari embroidery. The crepe silk fabric has been carefully selected for its fluid drape and subtle sheen, creating movement that is both graceful and captivating. Traditional zari embroidery weaves stories of heritage across the flowing fabric—each motif representing blessings of love, prosperity, and happiness. The soft pink hue flatters every skin tone and transitions beautifully from daytime ceremonies to evening celebrations. The blouse features delicate cap sleeves with matching embroidery, while the dupatta is designed to be draped in multiple styles. A graceful choice for brides seeking understated elegance, bridesmaids who want to complement without competing, or wedding celebrations that call for timeless femininity and romantic beauty.",
    price: convertPrice(3895),
    originalPrice: convertPrice(5264),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59750/Pink-Crepe-Silk-Wedding-Wear-Zari-Embroidery-Work-Lehenga-Choli-3681-5148-A(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59750/Pink-Crepe-Silk-Wedding-Wear-Zari-Embroidery-Work-Lehenga-Choli-3681-5148-A(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59750/Pink-Crepe-Silk-Wedding-Wear-Zari-Embroidery-Work-Lehenga-Choli-3681-5148-A(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59750/Pink-Crepe-Silk-Wedding-Wear-Zari-Embroidery-Work-Lehenga-Choli-3681-5148-A(4).jpg"
    ],
    category: "Wedding Lehengas",
    fabric: "Crepe Silk",
    occasion: "Wedding",
    color: "Pink",
    work: "Zari Embroidery",
    tags: ["wedding", "crepe-silk", "pink", "zari", "romantic", "bridesmaid", "feminine", "graceful"],
    variants: [
      { id: "wedding-006-s", title: "S", price: convertPrice(3895), options: { Size: "S" } },
      { id: "wedding-006-m", title: "M", price: convertPrice(3895), options: { Size: "M" } },
      { id: "wedding-006-l", title: "L", price: convertPrice(3895), options: { Size: "L" } },
      { id: "wedding-006-xl", title: "XL", price: convertPrice(3895), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },

  // === PARTY COLLECTION ===
  {
    id: "party-001",
    handle: "champagne-gold-sequin-party-lehenga",
    title: "Champagne Gold Sequin Party Lehenga",
    description: "Be the radiant center of attention in this dazzling champagne gold crepe lehenga that captures the effervescence of celebration itself. The warm metallic hue evokes the pop of champagne corks and the glow of celebration, making it the ultimate choice for milestone moments. Zari and sequins work creates an intricate celebration of light and luxury across every inch of the fabric—when you move, you literally sparkle. The crepe fabric offers a contemporary structured drape that moves beautifully for dancing while maintaining its sophisticated silhouette. The construction incorporates a pre-draped dupatta option for hassle-free styling, while the blouse features a trendy back design perfect for cocktail party photography. This piece is designed for those occasions that deserve extra sparkle—cocktail parties, receptions, engagement celebrations, sangeet nights, or any moment when you want to be unforgettable.",
    price: convertPrice(4545),
    originalPrice: convertPrice(6142),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Champagne-Gold-Crepe-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS201(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Champagne-Gold-Crepe-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS201(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Champagne-Gold-Crepe-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS201(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Champagne-Gold-Crepe-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS201(4).jpg"
    ],
    category: "Party Lehengas",
    fabric: "Crepe",
    occasion: "Party",
    color: "Champagne Gold",
    work: "Zari Sequins",
    tags: ["party", "crepe", "gold", "sequins", "cocktail", "reception", "sparkle", "celebration"],
    variants: [
      { id: "party-001-s", title: "S", price: convertPrice(4545), options: { Size: "S" } },
      { id: "party-001-m", title: "M", price: convertPrice(4545), options: { Size: "M" } },
      { id: "party-001-l", title: "L", price: convertPrice(4545), options: { Size: "L" } },
      { id: "party-001-xl", title: "XL", price: convertPrice(4545), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "party-002",
    handle: "rose-quartz-organza-party-lehenga",
    title: "Rose Quartz Organza Party Lehenga",
    description: "Float through your evening in this ethereal pink organza lehenga that embodies the gentle energy of rose quartz crystal. The translucent organza creates a dreamy, romantic silhouette while the structured underlayers provide comfortable coverage. Delicate zari and sequins work adds dimension without overwhelming, creating a look that is both romantically soft and sophisticatedly sparkly. The rose pink shade has been selected for its universally flattering qualities—warm enough for depth yet soft enough for romance. The lehenga features a contemporary A-line silhouette that flatters all body types, while the coordinated blouse offers versatile neckline options. The dupatta can be styled in multiple ways, from classic draping to trendy cape styling. Perfect for sangeet ceremonies where you want to dance with ease, cocktail celebrations where soft elegance is called for, or any romantic evening that deserves rose-tinted beauty.",
    price: convertPrice(4545),
    originalPrice: convertPrice(6142),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Pink-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS202(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Pink-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS202(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Pink-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS202(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Pink-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS202(4).jpg"
    ],
    category: "Party Lehengas",
    fabric: "Organza",
    occasion: "Party",
    color: "Pink",
    work: "Zari Sequins",
    tags: ["party", "organza", "pink", "sequins", "sangeet", "romantic", "ethereal", "dreamy"],
    variants: [
      { id: "party-002-s", title: "S", price: convertPrice(4545), options: { Size: "S" } },
      { id: "party-002-m", title: "M", price: convertPrice(4545), options: { Size: "M" } },
      { id: "party-002-l", title: "L", price: convertPrice(4545), options: { Size: "L" } },
      { id: "party-002-xl", title: "XL", price: convertPrice(4545), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "party-003",
    handle: "ocean-blue-georgette-party-lehenga",
    title: "Ocean Blue Organza Party Lehenga",
    description: "Dive into elegance with this stunning sky blue organza creation that captures the tranquil beauty of tropical waters. The refreshing blue shade evokes feelings of serenity and freedom, making it the perfect choice for celebrations under open skies. Zari and sequins work ripple across the fabric like sunlight dancing on water, creating mesmerizing movement with every step. The organza has been treated for durability while maintaining its ethereal transparency and gentle flow. The lehenga features a comfortable fitted waist that transitions into a flowing skirt, designed for both beautiful photos and comfortable wear throughout long celebrations. The coordinating blouse offers modesty while maintaining the breezy aesthetic of the ensemble. A refreshing choice for daytime celebrations, garden parties, mehendi ceremonies, or any occasion that calls for something beautifully different and wonderfully memorable.",
    price: convertPrice(3845),
    originalPrice: convertPrice(5196),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Sky-Blue-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS200(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Sky-Blue-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS200(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Sky-Blue-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS200(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Sky-Blue-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS200(4).jpg"
    ],
    category: "Party Lehengas",
    fabric: "Organza",
    occasion: "Party",
    color: "Sky Blue",
    work: "Zari Sequins",
    tags: ["party", "organza", "blue", "sequins", "mehendi", "garden", "refreshing", "coastal"],
    variants: [
      { id: "party-003-s", title: "S", price: convertPrice(3845), options: { Size: "S" } },
      { id: "party-003-m", title: "M", price: convertPrice(3845), options: { Size: "M" } },
      { id: "party-003-l", title: "L", price: convertPrice(3845), options: { Size: "L" } },
      { id: "party-003-xl", title: "XL", price: convertPrice(3845), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "party-004",
    handle: "earthy-brown-organza-party-lehenga",
    title: "Earthy Brown Organza Party Lehenga",
    description: "Embrace nature-inspired elegance in this rich brown organza lehenga that grounds celebrations in earthy sophistication. The warm brown shade represents stability, elegance, and connection to the natural world—a refreshing alternative to traditional jewel tones. Zari and sequins work creates organic patterns that shimmer with movement, reminiscent of sunlight filtering through autumn leaves. The organza maintains its beautiful drape while the carefully constructed inner layers provide structure and modesty. This piece speaks to the modern celebrant who appreciates understated luxury and finds beauty in unexpected color choices. The versatile brown palette pairs beautifully with gold, copper, or turquoise jewelry for different styling effects. A sophisticated choice for autumn celebrations, evening gatherings, or any occasion where you want to stand apart through refined taste rather than loud statement.",
    price: convertPrice(3845),
    originalPrice: convertPrice(5196),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Brown-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS199(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Brown-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS199(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Brown-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS199(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Brown-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS199(4).jpg"
    ],
    category: "Party Lehengas",
    fabric: "Organza",
    occasion: "Party",
    color: "Brown",
    work: "Zari Sequins",
    tags: ["party", "organza", "brown", "sequins", "autumn", "evening", "earthy", "nature-inspired"],
    variants: [
      { id: "party-004-s", title: "S", price: convertPrice(3845), options: { Size: "S" } },
      { id: "party-004-m", title: "M", price: convertPrice(3845), options: { Size: "M" } },
      { id: "party-004-l", title: "L", price: convertPrice(3845), options: { Size: "L" } },
      { id: "party-004-xl", title: "XL", price: convertPrice(3845), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "party-005",
    handle: "rust-orange-sequin-party-lehenga",
    title: "Rust Orange Sequin Party Lehenga",
    description: "Ignite the celebration in this vibrant rust orange Vichitra Silk lehenga that captures the warm energy of sunset celebrations. The rich rust-orange shade carries the passionate energy of fire festivals and autumn harvests, making it particularly auspicious for Diwali, haldi ceremonies, and celebration of new beginnings. Sequins and embroidery work creates patterns that glow with warmth, as if the fabric itself is alive with inner light. The Vichitra Silk offers a unique texture that distinguishes it from ordinary silk—slightly textured with a subtle sheen that photographs beautifully. The construction includes a comfortable fit-and-flare silhouette that allows for easy movement during dancing and celebration. Pair with gold jewelry for traditional opulence or contrast with silver for contemporary edge. Perfect for festive parties, haldi ceremonies, and any occasion that calls for bold, confident color.",
    price: convertPrice(3295),
    originalPrice: convertPrice(4393),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59562/Rust-Orange-Vichitra-Silk-Party-Wear-Sequins-Embroidery-Work-Lehenga-Choli-Sakshi--3596-5055-A(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59562/Rust-Orange-Vichitra-Silk-Party-Wear-Sequins-Embroidery-Work-Lehenga-Choli-Sakshi--3596-5055-A(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59562/Rust-Orange-Vichitra-Silk-Party-Wear-Sequins-Embroidery-Work-Lehenga-Choli-Sakshi--3596-5055-A(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59562/Rust-Orange-Vichitra-Silk-Party-Wear-Sequins-Embroidery-Work-Lehenga-Choli-Sakshi--3596-5055-A(4).jpg"
    ],
    category: "Party Lehengas",
    fabric: "Vichitra Silk",
    occasion: "Party",
    color: "Rust Orange",
    work: "Sequins Embroidery",
    tags: ["party", "vichitra-silk", "orange", "sequins", "haldi", "festive", "diwali", "sunset"],
    variants: [
      { id: "party-005-s", title: "S", price: convertPrice(3295), options: { Size: "S" } },
      { id: "party-005-m", title: "M", price: convertPrice(3295), options: { Size: "M" } },
      { id: "party-005-l", title: "L", price: convertPrice(3295), options: { Size: "L" } },
      { id: "party-005-xl", title: "XL", price: convertPrice(3295), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "party-006",
    handle: "multicolor-georgette-party-lehenga",
    title: "Multicolor Georgette Party Lehenga",
    description: "A magnificent celebration of color in flowing faux georgette that refuses to be ignored. This conversation-starter piece combines multiple vibrant hues in artistic harmony, creating a wearable work of art that expresses joy and creative spirit. Sequins work adds playful sparkle to the already vibrant multi-color palette, creating a dancing light effect as you move through the celebration. The faux georgette offers the beautiful drape of traditional georgette with enhanced durability and ease of care. The color combination has been artfully designed so no single hue dominates—instead, they work together in balanced harmony. The construction includes comfortable inner shorts for freedom of movement and an adjustable blouse that can be styled in multiple ways. This piece is designed for those who believe fashion should be fun, memorable, and expressive. For the woman who walks into a room and becomes the celebration herself.",
    price: convertPrice(6395),
    originalPrice: convertPrice(8882),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59740/Multi-Color-Faux-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Kajal-Vol-2-3662-1106-A(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59740/Multi-Color-Faux-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Kajal-Vol-2-3662-1106-A(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59740/Multi-Color-Faux-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Kajal-Vol-2-3662-1106-A(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59740/Multi-Color-Faux-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Kajal-Vol-2-3662-1106-A(4).jpg"
    ],
    category: "Party Lehengas",
    fabric: "Faux Georgette",
    occasion: "Party",
    color: "Multi Color",
    work: "Sequins Work",
    tags: ["party", "georgette", "multicolor", "sequins", "vibrant", "statement", "artistic", "expressive"],
    variants: [
      { id: "party-006-s", title: "S", price: convertPrice(6395), options: { Size: "S" } },
      { id: "party-006-m", title: "M", price: convertPrice(6395), options: { Size: "M" } },
      { id: "party-006-l", title: "L", price: convertPrice(6395), options: { Size: "L" } },
      { id: "party-006-xl", title: "XL", price: convertPrice(6395), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },

  // === FESTIVAL COLLECTION ===
  {
    id: "festival-001",
    handle: "lavender-gold-crush-festival-lehenga",
    title: "Lavender Gold Crush Festival Lehenga",
    description: "Celebrate in ethereal style with this enchanting lavender Gold Crush lehenga that captures the magic of festival lights. The innovative Gold Crush fabric creates a unique textured surface that catches light from every angle, while the serene lavender shade brings a calming, spiritual energy to your celebration. Sequins work adds festive shimmer in strategic patterns that enhance rather than overwhelm the fabric's natural beauty. This ready-to-wear piece combines contemporary convenience with traditional festival glamour, perfect for the modern woman who wants to celebrate without spending hours in preparation. The construction includes a comfortable drawstring waist for easy adjustment and a pre-styled dupatta attachment for hassle-free draping. Perfect for Diwali celebrations when you want to shine alongside the diyas, Navratri nights when comfort meets glamour, and all your joyous celebrations that deserve something special and memorable.",
    price: convertPrice(3695),
    originalPrice: convertPrice(4927),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59686/Lavender-Gold-Crush-Festival-Wear-Sequins-Work-Readymade-Lehenga-Choli-Anika-Vol-1-5442-5060-A(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59686/Lavender-Gold-Crush-Festival-Wear-Sequins-Work-Readymade-Lehenga-Choli-Anika-Vol-1-5442-5060-A(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59686/Lavender-Gold-Crush-Festival-Wear-Sequins-Work-Readymade-Lehenga-Choli-Anika-Vol-1-5442-5060-A(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59686/Lavender-Gold-Crush-Festival-Wear-Sequins-Work-Readymade-Lehenga-Choli-Anika-Vol-1-5442-5060-A(4).jpg"
    ],
    category: "Festival Lehengas",
    fabric: "Gold Crush",
    occasion: "Festival",
    color: "Lavender",
    work: "Sequins Work",
    tags: ["festival", "gold-crush", "lavender", "sequins", "diwali", "navratri", "ethereal", "spiritual"],
    variants: [
      { id: "festival-001-s", title: "S", price: convertPrice(3695), options: { Size: "S" } },
      { id: "festival-001-m", title: "M", price: convertPrice(3695), options: { Size: "M" } },
      { id: "festival-001-l", title: "L", price: convertPrice(3695), options: { Size: "L" } },
      { id: "festival-001-xl", title: "XL", price: convertPrice(3695), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "festival-002",
    handle: "royal-purple-gold-crush-festival-lehenga",
    title: "Royal Purple Gold Crush Festival Lehenga",
    description: "Command attention in this regal purple Gold Crush creation that channels the majesty of Mughal celebrations. The deep purple shade represents royalty, spirituality, and the richness of Indian festival traditions, while the innovative Gold Crush fabric creates dimensional texture that makes this piece truly unique. Sequins work creates patterns that dance with light, perfect for festive evenings illuminated by diyas and fairy lights. This ready-to-wear statement piece combines the grandeur of traditional festival wear with modern convenience—simply slip on and celebrate. The purple shade has been specifically selected to photograph beautifully against both indoor and outdoor lighting, ensuring you look magnificent in every celebration photo. The construction prioritizes comfort for extended wear during long festival celebrations, with breathable lining and adjustable closures. For women who celebrate life boldly and believe festivals are meant for making memories.",
    price: convertPrice(3695),
    originalPrice: convertPrice(4927),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59686/Royal-Purple-Gold-Crush-Festival-Wear-Sequins-Work-Readymade-Lehenga-Choli-Anika-Vol-1-5442-5059-A(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59686/Royal-Purple-Gold-Crush-Festival-Wear-Sequins-Work-Readymade-Lehenga-Choli-Anika-Vol-1-5442-5059-A(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59686/Royal-Purple-Gold-Crush-Festival-Wear-Sequins-Work-Readymade-Lehenga-Choli-Anika-Vol-1-5442-5059-A(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59686/Royal-Purple-Gold-Crush-Festival-Wear-Sequins-Work-Readymade-Lehenga-Choli-Anika-Vol-1-5442-5059-A(4).jpg"
    ],
    category: "Festival Lehengas",
    fabric: "Gold Crush",
    occasion: "Festival",
    color: "Royal Purple",
    work: "Sequins Work",
    tags: ["festival", "gold-crush", "purple", "sequins", "regal", "statement", "mughal", "royal"],
    variants: [
      { id: "festival-002-s", title: "S", price: convertPrice(3695), options: { Size: "S" } },
      { id: "festival-002-m", title: "M", price: convertPrice(3695), options: { Size: "M" } },
      { id: "festival-002-l", title: "L", price: convertPrice(3695), options: { Size: "L" } },
      { id: "festival-002-xl", title: "XL", price: convertPrice(3695), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "festival-003",
    handle: "maroon-organza-printed-festival-lehenga",
    title: "Maroon Organza Printed Festival Lehenga",
    description: "Traditional meets contemporary in this stunning maroon organza lehenga that honors the rich colors of Indian festival traditions. The auspicious maroon shade carries deep cultural significance—representing prosperity, strength, and the life force that infuses our celebrations with meaning. Intricate printed work creates depth and visual interest across the flowing fabric, with patterns inspired by traditional block-printing techniques that have adorned festival garments for centuries. The organza maintains its beautiful structure while offering a lightweight, comfortable wear experience perfect for extended celebration hours. The digital printing technique ensures color vibrancy that won't fade even after multiple wearings and cleanings. This piece is ideal for temple celebrations where traditional colors are expected, garba nights where you want to twirl with abandon, pujas that call for auspicious beauty, and any festival moment that deserves connection to heritage.",
    price: convertPrice(3895),
    originalPrice: convertPrice(4994),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Maroon-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7106(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Maroon-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7106(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Maroon-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7106(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Maroon-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7106(4).jpg"
    ],
    category: "Festival Lehengas",
    fabric: "Organza",
    occasion: "Festival",
    color: "Maroon",
    work: "Printed Work",
    tags: ["festival", "organza", "maroon", "printed", "garba", "traditional", "temple", "auspicious"],
    variants: [
      { id: "festival-003-s", title: "S", price: convertPrice(3895), options: { Size: "S" } },
      { id: "festival-003-m", title: "M", price: convertPrice(3895), options: { Size: "M" } },
      { id: "festival-003-l", title: "L", price: convertPrice(3895), options: { Size: "L" } },
      { id: "festival-003-xl", title: "XL", price: convertPrice(3895), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "festival-004",
    handle: "forest-green-organza-festival-lehenga",
    title: "Forest Green Organza Festival Lehenga",
    description: "Connect with nature's beauty in this serene green organza lehenga that brings the tranquility of forests to your celebrations. The rich forest green shade represents growth, renewal, and the abundance of nature—making it particularly auspicious for new beginnings and harvest celebrations. Printed work adds artistic detail to the earthy palette, with botanical motifs that honor the natural world while maintaining elegant sophistication. The organza fabric creates beautiful movement and translucent layering effects that photograph stunningly in outdoor settings. This piece is crafted for the woman who finds spiritual connection in nature and wants to carry that energy into her celebrations. The construction includes practical features like adjustable closures and comfortable lining without sacrificing aesthetic beauty. A refreshing choice for daytime festivals, mehendi functions set in gardens, outdoor celebrations, and any moment when you want to embody natural elegance.",
    price: convertPrice(3895),
    originalPrice: convertPrice(4994),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Green-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7105(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Green-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7105(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Green-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7105(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Green-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7105(4).jpg"
    ],
    category: "Festival Lehengas",
    fabric: "Organza",
    occasion: "Festival",
    color: "Green",
    work: "Printed Work",
    tags: ["festival", "organza", "green", "printed", "mehendi", "outdoor", "nature", "botanical"],
    variants: [
      { id: "festival-004-s", title: "S", price: convertPrice(3895), options: { Size: "S" } },
      { id: "festival-004-m", title: "M", price: convertPrice(3895), options: { Size: "M" } },
      { id: "festival-004-l", title: "L", price: convertPrice(3895), options: { Size: "L" } },
      { id: "festival-004-xl", title: "XL", price: convertPrice(3895), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "festival-005",
    handle: "sunshine-yellow-organza-festival-lehenga",
    title: "Sunshine Yellow Organza Festival Lehenga",
    description: "Brighten every celebration in this radiant yellow organza lehenga that captures the joyful energy of spring festivals and new beginnings. Yellow holds sacred significance across Indian traditions—representing knowledge, learning, happiness, and the warmth of the sun god. Printed work creates joyful patterns across the sun-kissed fabric, with designs that honor traditional aesthetics while maintaining contemporary wearability. The vibrant yellow shade has been carefully calibrated to be auspicious without being overwhelming, flattering to all skin tones, and photographically stunning. The organza construction creates beautiful layered effects that catch sunlight beautifully during outdoor celebrations. This piece is the perfect choice for haldi ceremonies where yellow is the color of the day, Basant Panchami when nature awakens, spring festivities that celebrate renewal, and any celebration that calls for unbridled joy and optimistic energy.",
    price: convertPrice(3895),
    originalPrice: convertPrice(4994),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Yellow-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7103(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Yellow-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7103(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Yellow-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7103(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Yellow-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7103(4).jpg"
    ],
    category: "Festival Lehengas",
    fabric: "Organza",
    occasion: "Festival",
    color: "Yellow",
    work: "Printed Work",
    tags: ["festival", "organza", "yellow", "printed", "haldi", "spring", "sunshine", "auspicious"],
    variants: [
      { id: "festival-005-s", title: "S", price: convertPrice(3895), options: { Size: "S" } },
      { id: "festival-005-m", title: "M", price: convertPrice(3895), options: { Size: "M" } },
      { id: "festival-005-l", title: "L", price: convertPrice(3895), options: { Size: "L" } },
      { id: "festival-005-xl", title: "XL", price: convertPrice(3895), options: { Size: "XL" } }
    ],
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }]
  },
  {
    id: "festival-006",
    handle: "jacquard-silk-weaving-festival-lehenga",
    title: "Jacquard Silk Weaving Festival Lehenga",
    description: "Honor the timeless artistry of Indian handloom in this exquisite Jacquard Silk lehenga that showcases centuries-old weaving traditions. Every thread tells a story—the Jacquard weaving technique creates intricate patterns directly in the fabric structure, rather than added embroidery, representing craftsmanship that takes years to master. The multi-color palette is achieved through complex warp and weft arrangements that create depth and visual interest from every angle. This is a heritage piece for women who appreciate the irreplaceable beauty of traditional artisanship and want to support the continuation of these ancient skills. The construction honors the fabric's beauty with minimal intervention—the weaving itself is the star. The comfortable silk drapes beautifully for extended temple visits, puja ceremonies, and cultural celebrations. A meaningful choice for women who understand that wearing handloom is an act of cultural preservation and appreciation for master craftspeople.",
    price: convertPrice(4045),
    originalPrice: convertPrice(5393),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59531/Multi-Color-Jacquard-Silk-Festival-Wear-Weaving-Work-Lehenga-Choli-Vinayak-3553-7073(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59531/Multi-Color-Jacquard-Silk-Festival-Wear-Weaving-Work-Lehenga-Choli-Vinayak-3553-7073(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59531/Multi-Color-Jacquard-Silk-Festival-Wear-Weaving-Work-Lehenga-Choli-Vinayak-3553-7073(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59531/Multi-Color-Jacquard-Silk-Festival-Wear-Weaving-Work-Lehenga-Choli-Vinayak-3553-7073(4).jpg"
    ],
    category: "Festival Lehengas",
    fabric: "Jacquard Silk",
    occasion: "Festival",
    color: "Multi Color",
    work: "Weaving Work",
    tags: ["festival", "jacquard", "silk", "weaving", "handloom", "heritage", "artisan", "traditional"],
    variants: [
      { id: "festival-006-s", title: "S", price: convertPrice(4045), options: { Size: "S" } },
      { id: "festival-006-m", title: "M", price: convertPrice(4045), options: { Size: "M" } },
      { id: "festival-006-l", title: "L", price: convertPrice(4045), options: { Size: "L" } },
      { id: "festival-006-xl", title: "XL", price: convertPrice(4045), options: { Size: "XL" } }
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
      vendor: "LuxeMia",
      productType: "Lehenga",
      tags: product.tags,
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

export function getLocalProductsByCategory(category: string) {
  return localProducts
    .filter(p => p.category.toLowerCase().includes(category.toLowerCase()))
    .map(toShopifyFormat);
}

export function getLocalProductsByOccasion(occasion: string) {
  return localProducts
    .filter(p => p.occasion.toLowerCase() === occasion.toLowerCase())
    .map(toShopifyFormat);
}
