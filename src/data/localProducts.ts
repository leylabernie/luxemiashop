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
    description: "A vision of romance in delicate pastel pink. This exquisite Pure Net bridal lehenga features intricate heavy work embroidery, cascading through the voluminous skirt and blouse. Perfect for the bride who dreams of ethereal elegance on her special day.",
    price: convertPrice(15895),
    originalPrice: convertPrice(22076),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Pastel-Pink-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10243(1).jpg"
    ],
    category: "Bridal Lehengas",
    fabric: "Pure Net",
    occasion: "Bridal",
    color: "Pastel Pink",
    work: "Heavy Embroidery",
    tags: ["bridal", "wedding", "pastel-pink", "net", "heavy-work", "embroidery"],
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
    description: "Embrace timeless Indian bridal tradition with this magnificent Rani Pink silk lehenga. Adorned with heavy traditional work that speaks of heritage and craftsmanship, this piece transforms every bride into royalty. The rich silk fabric drapes beautifully, creating a silhouette of pure elegance.",
    price: convertPrice(24295),
    originalPrice: convertPrice(34218),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59645/Rani-Pink-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-A(1).jpg"
    ],
    category: "Bridal Lehengas",
    fabric: "Silk",
    occasion: "Bridal",
    color: "Rani Pink",
    work: "Heavy Work",
    tags: ["bridal", "silk", "rani-pink", "traditional", "luxury", "heritage"],
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
    description: "The quintessential bridal red that has adorned generations of brides. This luxurious silk lehenga features masterfully executed heavy work, creating patterns that dance with light. A timeless investment piece that honors tradition while celebrating modern craftsmanship.",
    price: convertPrice(24295),
    originalPrice: convertPrice(34218),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59645/Red-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-B(1).jpg"
    ],
    category: "Bridal Lehengas",
    fabric: "Silk",
    occasion: "Bridal",
    color: "Red",
    work: "Heavy Work",
    tags: ["bridal", "silk", "red", "classic", "traditional", "wedding"],
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
    description: "For the modern bride who dares to be different. This pristine white Heavy Net lehenga features sequins and embroidery work that creates a dreamlike shimmer. Ideal for destination weddings, receptions, or brides seeking contemporary elegance with traditional roots.",
    price: convertPrice(12895),
    originalPrice: convertPrice(17664),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(1).jpg"
    ],
    category: "Bridal Lehengas",
    fabric: "Heavy Net",
    occasion: "Bridal",
    color: "White",
    work: "Sequins Embroidery",
    tags: ["bridal", "net", "white", "sequins", "modern", "destination-wedding"],
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
    description: "A contemporary masterpiece in serene lavender. This Pure Net bridal ensemble breaks traditional color boundaries while maintaining the grandeur expected of bridal couture. Heavy work embroidery creates depth and dimension, perfect for the fashion-forward bride.",
    price: convertPrice(12695),
    originalPrice: convertPrice(17632),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Lavender-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10242(1).jpg"
    ],
    category: "Bridal Lehengas",
    fabric: "Pure Net",
    occasion: "Bridal",
    color: "Lavender",
    work: "Heavy Work",
    tags: ["bridal", "net", "lavender", "contemporary", "trendy", "unique"],
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
    description: "Make an unforgettable entrance in this stunning metallic silver Pure Net lehenga. The heavy work creates a luminous effect that catches every light, ensuring you shine throughout your celebration. A bold choice for the bride who loves to stand out.",
    price: convertPrice(13995),
    originalPrice: convertPrice(19438),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Metalic-Silver-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10245(1).jpg"
    ],
    category: "Bridal Lehengas",
    fabric: "Pure Net",
    occasion: "Bridal",
    color: "Silver",
    work: "Heavy Work",
    tags: ["bridal", "net", "silver", "metallic", "glamorous", "reception"],
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
    description: "Embrace regal sophistication with this sumptuous burgundy velvet lehenga. Sequins work adds subtle sparkle to the rich fabric, creating a look that is both traditional and thoroughly modern. Perfect for winter weddings and evening celebrations.",
    price: convertPrice(8995),
    originalPrice: convertPrice(12155),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Burgundy-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-A(1).jpg"
    ],
    category: "Wedding Lehengas",
    fabric: "Net",
    occasion: "Wedding",
    color: "Burgundy",
    work: "Heavy Work",
    tags: ["wedding", "burgundy", "net", "heavy-work", "winter", "evening"],
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
    description: "A sophisticated wine-hued lehenga that speaks of understated luxury. Heavy work embellishment creates intricate patterns on flowing net fabric. Ideal for sangeet ceremonies, engagement parties, or as a bridesmaids statement piece.",
    price: convertPrice(8995),
    originalPrice: convertPrice(12155),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Wine-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-B(1).jpg"
    ],
    category: "Wedding Lehengas",
    fabric: "Net",
    occasion: "Wedding",
    color: "Wine",
    work: "Heavy Work",
    tags: ["wedding", "wine", "net", "sangeet", "engagement", "bridesmaid"],
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
    description: "Captivate in classic red velvet, the fabric of queens. This stunning lehenga features meticulous sequins work that adds dimension and glamour. The perfect choice for winter weddings when you want to make a bold, traditional statement.",
    price: convertPrice(5795),
    originalPrice: convertPrice(7938),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Red-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3014(1).jpg"
    ],
    category: "Wedding Lehengas",
    fabric: "Velvet",
    occasion: "Wedding",
    color: "Red",
    work: "Sequins Work",
    tags: ["wedding", "velvet", "red", "sequins", "winter", "traditional"],
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
    description: "Step into enchantment with this deep purple velvet masterpiece. Sequins work creates constellations of sparkle across the rich fabric. A contemporary choice for the modern wedding guest who appreciates luxury and uniqueness.",
    price: convertPrice(5795),
    originalPrice: convertPrice(7938),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Purple-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3012(1).jpg"
    ],
    category: "Wedding Lehengas",
    fabric: "Velvet",
    occasion: "Wedding",
    color: "Purple",
    work: "Sequins Work",
    tags: ["wedding", "velvet", "purple", "sequins", "contemporary", "guest"],
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
    description: "Redefine wedding fashion with this striking black velvet lehenga. Delicate sequins work adds subtle glamour to the dramatic silhouette. For the confident woman who knows that black is always the new black.",
    price: convertPrice(5795),
    originalPrice: convertPrice(7938),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59696/Black-Velvet-Wedding-Wear-Sequins-Work-Lehenga-Choli-Mehvish-Vol-31-3645-3011(1).jpg"
    ],
    category: "Wedding Lehengas",
    fabric: "Velvet",
    occasion: "Wedding",
    color: "Black",
    work: "Sequins Work",
    tags: ["wedding", "velvet", "black", "sequins", "contemporary", "bold"],
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
    description: "Romance personified in delicate blush pink crepe silk. Traditional zari embroidery weaves stories of heritage across the flowing fabric. A graceful choice for brides, bridesmaids, or wedding celebrations that call for timeless femininity.",
    price: convertPrice(3895),
    originalPrice: convertPrice(5264),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59750/Pink-Crepe-Silk-Wedding-Wear-Zari-Embroidery-Work-Lehenga-Choli-3681-5148-A(1).jpg"
    ],
    category: "Wedding Lehengas",
    fabric: "Crepe Silk",
    occasion: "Wedding",
    color: "Pink",
    work: "Zari Embroidery",
    tags: ["wedding", "crepe-silk", "pink", "zari", "romantic", "bridesmaid"],
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
    description: "Be the center of attention in this dazzling champagne gold crepe lehenga. Zari and sequins work creates a celebration of light and luxury. Designed for cocktail parties, receptions, and any occasion that deserves extra sparkle.",
    price: convertPrice(4545),
    originalPrice: convertPrice(6142),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Champagne-Gold-Crepe-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS201(1).jpg"
    ],
    category: "Party Lehengas",
    fabric: "Crepe",
    occasion: "Party",
    color: "Champagne Gold",
    work: "Zari Sequins",
    tags: ["party", "crepe", "gold", "sequins", "cocktail", "reception"],
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
    description: "Float through your evening in this ethereal pink organza lehenga. Delicate zari and sequins work add dimension without overwhelming, creating a look that is both romantic and sophisticated. Perfect for sangeet and cocktail celebrations.",
    price: convertPrice(4545),
    originalPrice: convertPrice(6142),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Pink-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS202(1).jpg"
    ],
    category: "Party Lehengas",
    fabric: "Organza",
    occasion: "Party",
    color: "Pink",
    work: "Zari Sequins",
    tags: ["party", "organza", "pink", "sequins", "sangeet", "romantic"],
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
    title: "Ocean Blue Georgette Party Lehenga",
    description: "Dive into elegance with this stunning sky blue organza creation. Zari and sequins work ripple across the fabric like sunlight on water. A refreshing choice for daytime celebrations, garden parties, and mehendi ceremonies.",
    price: convertPrice(3845),
    originalPrice: convertPrice(5196),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Sky-Blue-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS200(1).jpg"
    ],
    category: "Party Lehengas",
    fabric: "Organza",
    occasion: "Party",
    color: "Sky Blue",
    work: "Zari Sequins",
    tags: ["party", "organza", "blue", "sequins", "mehendi", "garden"],
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
    description: "Embrace nature-inspired elegance in this rich brown organza lehenga. Zari and sequins work create organic patterns that shimmer with movement. A sophisticated choice for autumn celebrations and evening gatherings.",
    price: convertPrice(3845),
    originalPrice: convertPrice(5196),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Brown-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS199(1).jpg"
    ],
    category: "Party Lehengas",
    fabric: "Organza",
    occasion: "Party",
    color: "Brown",
    work: "Zari Sequins",
    tags: ["party", "organza", "brown", "sequins", "autumn", "evening"],
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
    description: "Ignite the celebration in this vibrant rust orange Vichitra Silk lehenga. Sequins and embroidery work create patterns that glow with warmth. Perfect for festive parties, haldi ceremonies, and occasions that call for bold color.",
    price: convertPrice(3295),
    originalPrice: convertPrice(4393),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59562/Rust-Orange-Vichitra-Silk-Party-Wear-Sequins-Embroidery-Work-Lehenga-Choli-Sakshi--3596-5055-A(1).jpg"
    ],
    category: "Party Lehengas",
    fabric: "Vichitra Silk",
    occasion: "Party",
    color: "Rust Orange",
    work: "Sequins Embroidery",
    tags: ["party", "vichitra-silk", "orange", "sequins", "haldi", "festive"],
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
    description: "A celebration of color in flowing faux georgette. Sequins work adds playful sparkle to the vibrant multi-color palette. This conversation-starter piece is designed for those who believe fashion should be fun and memorable.",
    price: convertPrice(6395),
    originalPrice: convertPrice(8882),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59740/Multi-Color-Faux-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Kajal-Vol-2-3662-1106-A(1).jpg"
    ],
    category: "Party Lehengas",
    fabric: "Faux Georgette",
    occasion: "Party",
    color: "Multi Color",
    work: "Sequins Work",
    tags: ["party", "georgette", "multicolor", "sequins", "vibrant", "statement"],
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
    description: "Celebrate in style with this enchanting lavender Gold Crush lehenga. Sequins work adds festive shimmer to the contemporary silhouette. A ready-to-wear piece perfect for Diwali, Navratri, and all your joyous celebrations.",
    price: convertPrice(3695),
    originalPrice: convertPrice(4927),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59686/Lavender-Gold-Crush-Festival-Wear-Sequins-Work-Readymade-Lehenga-Choli-Anika-Vol-1-5442-5060-A(1).jpg"
    ],
    category: "Festival Lehengas",
    fabric: "Gold Crush",
    occasion: "Festival",
    color: "Lavender",
    work: "Sequins Work",
    tags: ["festival", "gold-crush", "lavender", "sequins", "diwali", "navratri"],
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
    description: "Command attention in this regal purple Gold Crush creation. Sequins work creates patterns that dance with light, perfect for festive evenings. A ready-to-wear statement piece for women who celebrate life boldly.",
    price: convertPrice(3695),
    originalPrice: convertPrice(4927),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59686/Royal-Purple-Gold-Crush-Festival-Wear-Sequins-Work-Readymade-Lehenga-Choli-Anika-Vol-1-5442-5059-A(1).jpg"
    ],
    category: "Festival Lehengas",
    fabric: "Gold Crush",
    occasion: "Festival",
    color: "Royal Purple",
    work: "Sequins Work",
    tags: ["festival", "gold-crush", "purple", "sequins", "regal", "statement"],
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
    description: "Traditional meets contemporary in this stunning maroon organza lehenga. Intricate printed work creates depth and visual interest across the flowing fabric. Ideal for pujas, garba nights, and temple celebrations.",
    price: convertPrice(3895),
    originalPrice: convertPrice(4994),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Maroon-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7106(1).jpg"
    ],
    category: "Festival Lehengas",
    fabric: "Organza",
    occasion: "Festival",
    color: "Maroon",
    work: "Printed Work",
    tags: ["festival", "organza", "maroon", "printed", "garba", "traditional"],
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
    description: "Connect with nature in this serene green organza lehenga. Printed work adds artistic detail to the earthy palette. A refreshing choice for daytime festivals, mehendi functions, and outdoor celebrations.",
    price: convertPrice(3895),
    originalPrice: convertPrice(4994),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Green-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7105(1).jpg"
    ],
    category: "Festival Lehengas",
    fabric: "Organza",
    occasion: "Festival",
    color: "Green",
    work: "Printed Work",
    tags: ["festival", "organza", "green", "printed", "mehendi", "outdoor"],
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
    description: "Brighten every celebration in this radiant yellow organza lehenga. Printed work creates joyful patterns across the sun-kissed fabric. The perfect choice for haldi ceremonies, Basant Panchami, and spring festivities.",
    price: convertPrice(3895),
    originalPrice: convertPrice(4994),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2026y/January/59799/Yellow-Organza-Wedding-Wear-Printed-Work-Lehenga-Choli-3688-7103(1).jpg"
    ],
    category: "Festival Lehengas",
    fabric: "Organza",
    occasion: "Festival",
    color: "Yellow",
    work: "Printed Work",
    tags: ["festival", "organza", "yellow", "printed", "haldi", "spring"],
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
    description: "Honor traditional craftsmanship in this exquisite Jacquard Silk lehenga. Intricate weaving work showcases the artistry of master weavers. A heritage piece for women who appreciate the timeless beauty of handloom artistry.",
    price: convertPrice(4045),
    originalPrice: convertPrice(5393),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59531/Multi-Color-Jacquard-Silk-Festival-Wear-Weaving-Work-Lehenga-Choli-Vinayak-3553-7073(1).jpg"
    ],
    category: "Festival Lehengas",
    fabric: "Jacquard Silk",
    occasion: "Festival",
    color: "Multi Color",
    work: "Weaving Work",
    tags: ["festival", "jacquard", "silk", "weaving", "handloom", "heritage"],
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