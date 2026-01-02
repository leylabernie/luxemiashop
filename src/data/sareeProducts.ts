// Boutique-style saree product data scraped from wholesalesalwar.com
// SEO-optimized titles and descriptions for luxury ethnic wear boutique

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
    description: "Experience the grandeur of South Indian tradition with this exquisite mint green Kanchipuram-inspired Viscose Silk saree. The delicate mint shade represents new beginnings and prosperity, making it an auspicious choice for wedding celebrations. Master weavers have created intricate weaving patterns that showcase the centuries-old craftsmanship of temple town artisans. The pallu features elaborate traditional motifs including peacocks, lotuses, and temple borders that tell stories of divine blessings. The rich zari work catches light beautifully, creating an ethereal glow around the wearer. Paired with a contrast blouse piece that complements the saree's grandeur, this piece is perfect for wedding ceremonies, religious functions, and celebrations that honor heritage.",
    price: convertPrice(12195),
    originalPrice: convertPrice(16938),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Mint-Green-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176-B(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Mint-Green-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176-B(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Mint-Green-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176-B(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Mint-Green-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176-B(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Viscose Silk",
    occasion: "Wedding",
    color: "Mint Green",
    work: "Weaving Work",
    tags: ["wedding", "silk", "mint-green", "kanchipuram", "weaving", "traditional"],
    variants: [
      { id: "saree-001-free", title: "Free Size", price: convertPrice(12195), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-002",
    handle: "royal-pink-kanchipuram-silk-wedding-saree",
    title: "Royal Pink Kanchipuram Silk Wedding Saree",
    description: "A celebration of feminine grace in royal pink, this Viscose Silk saree channels the opulence of Kanchipuram's legendary weaving traditions. The vibrant pink shade has been carefully selected to flatter all skin tones while maintaining the richness expected of bridal and wedding wear. Traditional weaving work creates elaborate patterns across the body and pallu, with each motif carrying symbolic significance—mangoes for fertility, peacocks for beauty, and temple spires for divine blessings. The heavy zari border frames the saree with golden elegance, while the blouse piece offers versatile styling options. This masterpiece is designed for the woman who wants to honor tradition while making a stunning visual impact at weddings, receptions, and auspicious celebrations.",
    price: convertPrice(12195),
    originalPrice: convertPrice(16938),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Pink-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Pink-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Pink-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Pink-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Viscose Silk",
    occasion: "Wedding",
    color: "Pink",
    work: "Weaving Work",
    tags: ["wedding", "silk", "pink", "kanchipuram", "weaving", "bridal"],
    variants: [
      { id: "saree-002-free", title: "Free Size", price: convertPrice(12195), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-003",
    handle: "ivory-beige-kanchipuram-silk-wedding-saree",
    title: "Ivory Beige Kanchipuram Silk Wedding Saree",
    description: "Understated elegance meets heritage craftsmanship in this sophisticated ivory beige Viscose Silk saree. The neutral beige palette offers versatile styling possibilities while maintaining the gravitas expected of wedding wear. Master artisans have woven intricate patterns that showcase the technical excellence of traditional handloom techniques passed down through generations. The contrast zari work creates beautiful definition against the soft beige base, highlighting the elaborate temple and floral motifs. The pallu is a work of art in itself, featuring a cascade of traditional patterns that drape beautifully. Perfect for morning ceremonies, temple weddings, or sophisticated celebrations where subtle luxury speaks louder than bold statements.",
    price: convertPrice(11545),
    originalPrice: convertPrice(16035),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Beige-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3164(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Beige-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3164(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Beige-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3164(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Beige-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3164(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Viscose Silk",
    occasion: "Wedding",
    color: "Beige",
    work: "Weaving Work",
    tags: ["wedding", "silk", "beige", "kanchipuram", "weaving", "elegant"],
    variants: [
      { id: "saree-003-free", title: "Free Size", price: convertPrice(11545), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-004",
    handle: "multicolor-kanchipuram-silk-wedding-saree",
    title: "Multicolor Kanchipuram Silk Wedding Saree",
    description: "A vibrant celebration of color and craftsmanship, this multicolor Viscose Silk saree showcases the bold aesthetic of South Indian wedding traditions. The masterful combination of multiple hues creates a dynamic visual impact that changes character with every fold and drape. Traditional weaving work incorporates contrasting colors in geometric and floral patterns, demonstrating the technical prowess required to achieve such complexity on a handloom. The rich pallu features a burst of traditional motifs in harmonious color combinations that have adorned brides and wedding guests for centuries. The heavy zari work provides structure and shimmer, perfect for photography. This statement piece is designed for celebrations that call for maximum visual impact and cultural authenticity.",
    price: convertPrice(11845),
    originalPrice: convertPrice(16451),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Multi-Color-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3133-B(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Multi-Color-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3133-B(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Multi-Color-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3133-B(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Multi-Color-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3133-B(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Viscose Silk",
    occasion: "Wedding",
    color: "Multi Color",
    work: "Weaving Work",
    tags: ["wedding", "silk", "multicolor", "kanchipuram", "weaving", "vibrant"],
    variants: [
      { id: "saree-004-free", title: "Free Size", price: convertPrice(11845), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-005",
    handle: "antique-gold-kanchipuram-silk-wedding-saree",
    title: "Antique Gold Kanchipuram Silk Wedding Saree",
    description: "Capture the essence of royal opulence with this magnificent antique gold Viscose Silk saree that radiates warmth and prosperity. The rich gold hue represents wealth, success, and divine blessings—making it an exceptionally auspicious choice for wedding celebrations. Traditional weaving patterns create a textured surface that plays beautifully with light, creating an ever-changing shimmer as you move. The pallu showcases elaborate temple architecture motifs and celestial patterns that connect the wearer to centuries of cultural heritage. The matching zari work is executed with precision, framing the saree with geometric borders that speak of perfection in craft. This saree is perfect for those golden-hour ceremonies and evening celebrations where you want to be the embodiment of radiant elegance.",
    price: convertPrice(11545),
    originalPrice: convertPrice(16035),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Gold-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3131(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Gold-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3131(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Gold-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3131(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Gold-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3131(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Viscose Silk",
    occasion: "Wedding",
    color: "Gold",
    work: "Weaving Work",
    tags: ["wedding", "silk", "gold", "kanchipuram", "weaving", "royal"],
    variants: [
      { id: "saree-005-free", title: "Free Size", price: convertPrice(11545), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-006",
    handle: "beige-gold-tissue-silk-wedding-saree",
    title: "Beige Gold Tissue Silk Wedding Saree",
    description: "Ethereal beauty meets everyday luxury in this stunning beige gold PV Tissue Silk saree. The innovative tissue silk fabric creates a gossamer-like quality that floats elegantly around the body, while the woven patterns add structure and visual interest. The sophisticated beige-gold combination offers versatility that works beautifully from daytime ceremonies through evening celebrations. Traditional weaving work creates subtle patterns that shimmer with a gentle, sophisticated glow. The lightweight construction makes this an ideal choice for extended wear during multi-day wedding celebrations without sacrificing comfort for style. Perfect for the mother of the bride, close family members, or any woman seeking elegant wedding wear that prioritizes both beauty and wearability.",
    price: convertPrice(2645),
    originalPrice: convertPrice(3574),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Beige-Gold-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4298(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Beige-Gold-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4298(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Beige-Gold-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4298(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Beige-Gold-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4298(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Tissue Silk",
    occasion: "Wedding",
    color: "Beige Gold",
    work: "Weaving Work",
    tags: ["wedding", "tissue-silk", "beige", "gold", "lightweight", "elegant"],
    variants: [
      { id: "saree-006-free", title: "Free Size", price: convertPrice(2645), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-007",
    handle: "pink-tissue-silk-wedding-saree",
    title: "Pink Tissue Silk Wedding Saree",
    description: "Romance blooms in this delicate pink PV Tissue Silk saree that combines the lightness of air with the richness of traditional wedding wear. The soft pink hue represents love, tenderness, and new beginnings—perfect symbolism for wedding celebrations. The tissue silk fabric creates a beautiful translucent quality that moves like poetry, catching light and creating dimension with every step. Traditional weaving work adds intricate patterns that speak of heritage craftsmanship adapted for modern sensibilities. The lightweight construction ensures comfort throughout long celebration hours, while the elegant drape maintains sophisticated structure. An ideal choice for sangeet ceremonies, engagement parties, or daytime wedding functions where you want to look effortlessly beautiful.",
    price: convertPrice(2645),
    originalPrice: convertPrice(3574),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Pink-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4297(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Pink-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4297(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Pink-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4297(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Pink-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4297(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Tissue Silk",
    occasion: "Wedding",
    color: "Pink",
    work: "Weaving Work",
    tags: ["wedding", "tissue-silk", "pink", "romantic", "lightweight", "sangeet"],
    variants: [
      { id: "saree-007-free", title: "Free Size", price: convertPrice(2645), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-008",
    handle: "sea-green-tissue-silk-wedding-saree",
    title: "Sea Green Tissue Silk Wedding Saree",
    description: "Transport yourself to serene coastal beauty with this refreshing sea green PV Tissue Silk saree. The tranquil sea green shade evokes the calm of ocean waters and the freshness of new beginnings. This innovative tissue silk construction creates beautiful light-play effects that seem to ripple like gentle waves as you move. Traditional weaving patterns add depth and heritage authenticity to the contemporary color palette. The feather-light fabric makes it perfect for outdoor celebrations and destination weddings where comfort is paramount. The elegant drape creates beautiful flowing lines that photograph stunningly against natural backdrops. An inspired choice for the modern wedding guest who appreciates unique color palettes and refined craftsmanship.",
    price: convertPrice(2645),
    originalPrice: convertPrice(3574),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Sea-Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4296(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Sea-Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4296(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Sea-Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4296(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Sea-Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4296(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Tissue Silk",
    occasion: "Wedding",
    color: "Sea Green",
    work: "Weaving Work",
    tags: ["wedding", "tissue-silk", "sea-green", "coastal", "destination", "fresh"],
    variants: [
      { id: "saree-008-free", title: "Free Size", price: convertPrice(2645), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-009",
    handle: "sunset-orange-tissue-silk-wedding-saree",
    title: "Sunset Orange Tissue Silk Wedding Saree",
    description: "Embrace the warmth and energy of a glorious sunset with this vibrant orange PV Tissue Silk saree. Orange represents enthusiasm, creativity, and the sacred fire of auspicious ceremonies—making this a particularly meaningful choice for religious wedding functions. The tissue silk fabric creates a luminous quality that seems to glow from within, perfectly capturing the essence of golden hour light. Traditional weaving work adds textural interest and connects the contemporary fabric to heritage techniques. The bold color makes a confident statement while the lightweight construction ensures easy, comfortable wear. Perfect for haldi ceremonies, mehendi celebrations, or any wedding function where you want to embody joy, energy, and auspicious beginnings.",
    price: convertPrice(2645),
    originalPrice: convertPrice(3574),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Orange-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4295(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Orange-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4295(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Orange-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4295(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Orange-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4295(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Tissue Silk",
    occasion: "Wedding",
    color: "Orange",
    work: "Weaving Work",
    tags: ["wedding", "tissue-silk", "orange", "sunset", "haldi", "vibrant"],
    variants: [
      { id: "saree-009-free", title: "Free Size", price: convertPrice(2645), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-010",
    handle: "emerald-green-tissue-silk-wedding-saree",
    title: "Emerald Green Tissue Silk Wedding Saree",
    description: "Channel the richness of precious emeralds with this stunning green PV Tissue Silk saree. Green represents growth, harmony, and prosperity in Indian tradition—making it an auspicious and visually striking choice for wedding celebrations. The tissue silk fabric creates a beautiful interplay of light and shadow, adding dimension to the rich green hue. Traditional weaving patterns are executed with precision, honoring heritage techniques while working within contemporary fabric innovations. The result is a saree that feels both timeless and fresh. The lightweight construction allows for effortless wear throughout long celebration days, while the elegant drape maintains its sophisticated structure. Perfect for the woman who wants to make a bold color statement while maintaining connection to traditional aesthetics.",
    price: convertPrice(2645),
    originalPrice: convertPrice(3574),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4294(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4294(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4294(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4294(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Tissue Silk",
    occasion: "Wedding",
    color: "Green",
    work: "Weaving Work",
    tags: ["wedding", "tissue-silk", "green", "emerald", "prosperity", "bold"],
    variants: [
      { id: "saree-010-free", title: "Free Size", price: convertPrice(2645), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-011",
    handle: "lavender-tissue-silk-wedding-saree",
    title: "Lavender Tissue Silk Wedding Saree",
    description: "Experience ethereal beauty in this dreamy lavender PV Tissue Silk saree that breaks conventional color boundaries while maintaining sophisticated elegance. The soft lavender shade represents refinement, creativity, and spiritual awareness—perfect for the bride or guest who walks to her own beat. The tissue silk fabric creates a gossamer-like quality that seems to float around the body, catching light in subtle, ever-changing ways. Traditional weaving patterns add heritage authenticity to the contemporary color palette, creating a beautiful dialogue between past and present. The lightweight construction ensures comfort for extended wear, while the unique color makes every photograph memorable. Ideal for contemporary celebrations, fusion weddings, or any function where unique style is celebrated.",
    price: convertPrice(2645),
    originalPrice: convertPrice(3574),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Lavender-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4293(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Lavender-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4293(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Lavender-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4293(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Lavender-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4293(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Tissue Silk",
    occasion: "Wedding",
    color: "Lavender",
    work: "Weaving Work",
    tags: ["wedding", "tissue-silk", "lavender", "ethereal", "contemporary", "unique"],
    variants: [
      { id: "saree-011-free", title: "Free Size", price: convertPrice(2645), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-012",
    handle: "blush-pink-fancy-silk-embroidery-saree",
    title: "Blush Pink Fancy Silk Embroidery Saree",
    description: "Romantic elegance reaches new heights in this exquisite blush pink Fancy Silk saree featuring intricate embroidery work that transforms fabric into art. The soft blush pink shade creates a gentle, flattering glow that complements every skin tone beautifully. Skilled artisans have applied delicate embroidery in floral and paisley patterns that cascade across the body and pallu, creating depth and visual interest that rewards close examination. The Fancy Silk base provides a luxurious sheen that photographs beautifully in both natural and artificial lighting. The traditional craftsmanship meets contemporary design sensibilities, resulting in a piece that feels both timeless and fresh. Perfect for wedding ceremonies, engagement celebrations, or any auspicious occasion that calls for romantic, feminine beauty.",
    price: convertPrice(5795),
    originalPrice: convertPrice(7938),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Blush-Pink-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5591(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Blush-Pink-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5591(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Blush-Pink-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5591(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Blush-Pink-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5591(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Fancy Silk",
    occasion: "Wedding",
    color: "Blush Pink",
    work: "Embroidery",
    tags: ["wedding", "fancy-silk", "blush-pink", "embroidery", "romantic", "feminine"],
    variants: [
      { id: "saree-012-free", title: "Free Size", price: convertPrice(5795), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-013",
    handle: "wine-fancy-silk-embroidery-wedding-saree",
    title: "Wine Fancy Silk Embroidery Wedding Saree",
    description: "Sophisticated luxury flows in this stunning wine-colored Fancy Silk saree that embodies the richness of aged excellence. The deep wine hue represents maturity, passion, and refined taste—perfect for the discerning woman who appreciates depth in her fashion choices. Exquisite embroidery work features traditional motifs executed with contemporary precision, creating patterns that speak of heritage while feeling thoroughly modern. The Fancy Silk fabric provides the perfect canvas with its subtle sheen and beautiful draping qualities. The color deepens beautifully under evening lights, making this an excellent choice for reception dinners and evening celebrations. Pair with statement jewelry for maximum impact, or let the saree speak for itself with minimal accessories. For celebrations that demand sophisticated elegance.",
    price: convertPrice(5945),
    originalPrice: convertPrice(8144),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Wine-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5590(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Wine-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5590(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Wine-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5590(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Wine-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5590(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Fancy Silk",
    occasion: "Wedding",
    color: "Wine",
    work: "Embroidery",
    tags: ["wedding", "fancy-silk", "wine", "embroidery", "sophisticated", "evening"],
    variants: [
      { id: "saree-013-free", title: "Free Size", price: convertPrice(5945), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-014",
    handle: "light-gold-fancy-silk-embroidery-saree",
    title: "Light Gold Fancy Silk Embroidery Saree",
    description: "Radiate warm prosperity in this luminous light gold Fancy Silk saree that captures the essence of celebration and abundance. The soft gold shade offers versatility that works from daytime ceremonies through evening receptions, adapting beautifully to changing light conditions. Intricate embroidery work features traditional patterns including paisleys, florals, and geometric borders that frame the saree with elegant precision. The Fancy Silk provides a lustrous base that enhances the embroidery's dimensional quality, creating shadows and highlights that add visual depth. This is a wardrobe investment piece that works across multiple celebrations—from your sister's wedding to your own anniversary celebration. The neutral gold palette pairs beautifully with both gold and silver jewelry, offering maximum styling flexibility.",
    price: convertPrice(5945),
    originalPrice: convertPrice(8144),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Light-Gold-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5589(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Light-Gold-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5589(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Light-Gold-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5589(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Light-Gold-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5589(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Fancy Silk",
    occasion: "Wedding",
    color: "Light Gold",
    work: "Embroidery",
    tags: ["wedding", "fancy-silk", "gold", "embroidery", "versatile", "luminous"],
    variants: [
      { id: "saree-014-free", title: "Free Size", price: convertPrice(5945), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-015",
    handle: "purple-fancy-silk-embroidery-wedding-saree",
    title: "Purple Fancy Silk Embroidery Wedding Saree",
    description: "Channel royal majesty in this regal purple Fancy Silk saree that commands attention and admiration in equal measure. Purple has long been associated with royalty, spirituality, and luxury—making this an inspired choice for women who appreciate the finer things. The rich purple hue is achieved through careful dyeing processes that ensure depth and color permanence, while the Fancy Silk fabric provides the perfect lustrous backdrop. Intricate embroidery work adorns the body and pallu with traditional motifs that speak of heritage craftsmanship, each stitch a testament to artisan excellence. The color makes a bold statement at weddings and receptions, ensuring you stand out in the most elegant way possible. Perfect for evening celebrations where dramatic lighting can enhance the purple's natural depth and richness.",
    price: convertPrice(6045),
    originalPrice: convertPrice(8281),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Purple-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5588(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Purple-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5588(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Purple-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5588(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Purple-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5588(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Fancy Silk",
    occasion: "Wedding",
    color: "Purple",
    work: "Embroidery",
    tags: ["wedding", "fancy-silk", "purple", "embroidery", "royal", "statement"],
    variants: [
      { id: "saree-015-free", title: "Free Size", price: convertPrice(6045), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-016",
    handle: "lavender-fancy-silk-embroidery-wedding-saree",
    title: "Lavender Fancy Silk Embroidery Wedding Saree",
    description: "Embrace ethereal beauty in this enchanting lavender Fancy Silk saree that brings a fresh, contemporary perspective to traditional wedding wear. The soft lavender shade offers a unique alternative to conventional colors while maintaining the elegance expected of celebration wear. Skilled artisans have applied delicate embroidery work that features botanical motifs and geometric patterns, creating visual poetry across the fabric surface. The Fancy Silk base provides subtle luminosity that enhances the lavender's dreamy quality, creating an almost otherworldly effect. This saree is perfect for the woman who appreciates unique color palettes and wants to bring something fresh to wedding celebrations. Ideal for sangeet ceremonies, engagement parties, or any celebration where contemporary style meets traditional elegance.",
    price: convertPrice(6095),
    originalPrice: convertPrice(8349),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Lavender-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5587(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Lavender-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5587(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Lavender-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5587(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Lavender-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5587(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Fancy Silk",
    occasion: "Wedding",
    color: "Lavender",
    work: "Embroidery",
    tags: ["wedding", "fancy-silk", "lavender", "embroidery", "contemporary", "ethereal"],
    variants: [
      { id: "saree-016-free", title: "Free Size", price: convertPrice(6095), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  // Adding more sarees for variety
  {
    id: "saree-017",
    handle: "taupe-beige-fancy-silk-embroidery-saree",
    title: "Taupe Beige Fancy Silk Embroidery Saree",
    description: "Understated sophistication defines this elegant taupe beige Fancy Silk saree that proves luxury needs no loud announcements. The refined taupe beige shade offers a sophisticated neutral palette that works beautifully across all celebration contexts and lighting conditions. Delicate embroidery work features subtle patterns that reveal themselves upon closer examination, rewarding the discerning eye with intricate craftsmanship. The Fancy Silk fabric provides a gentle sheen that adds dimension without overwhelming the understated aesthetic. This saree is designed for the woman who understands that true elegance lies in restraint—who wants to be remembered for impeccable taste rather than flashy presentation. Perfect for daytime weddings, religious ceremonies, or any celebration where quiet sophistication speaks loudest.",
    price: convertPrice(5945),
    originalPrice: convertPrice(8144),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Taupe-Beige-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5586(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Taupe-Beige-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5586(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Taupe-Beige-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5586(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59732/Taupe-Beige-Fancy-Silk-Wedding-Wear-Embroidery-Work-Wedding-Saree-Kimora-Naari--3678-5586(4).jpg"
    ],
    category: "Wedding Sarees",
    fabric: "Fancy Silk",
    occasion: "Wedding",
    color: "Taupe Beige",
    work: "Embroidery",
    tags: ["wedding", "fancy-silk", "taupe", "beige", "embroidery", "understated"],
    variants: [
      { id: "saree-017-free", title: "Free Size", price: convertPrice(5945), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  // Party Sarees
  {
    id: "saree-018",
    handle: "coral-georgette-party-saree",
    title: "Coral Georgette Party Saree",
    description: "Make a vibrant statement in this stunning coral georgette saree that brings the energy of tropical sunsets to your celebrations. The coral shade strikes the perfect balance between bold and sophisticated, ensuring you command attention without overwhelming. The georgette fabric flows like water, creating beautiful movement and drape that flatters every body type. Delicate embellishments add subtle sparkle that catches light beautifully, creating an animated quality as you move through the celebration. This piece transitions seamlessly from daytime events to evening parties, adapting to changing light conditions with grace. Perfect for cocktail parties, engagement celebrations, or any event where you want to be remembered.",
    price: convertPrice(3245),
    originalPrice: convertPrice(4388),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Champagne-Gold-Crepe-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS201(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Champagne-Gold-Crepe-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS201(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Champagne-Gold-Crepe-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS201(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Champagne-Gold-Crepe-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS201(4).jpg"
    ],
    category: "Party Sarees",
    fabric: "Georgette",
    occasion: "Party",
    color: "Coral",
    work: "Embellished",
    tags: ["party", "georgette", "coral", "cocktail", "vibrant", "statement"],
    variants: [
      { id: "saree-018-free", title: "Free Size", price: convertPrice(3245), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-019",
    handle: "midnight-blue-sequin-party-saree",
    title: "Midnight Blue Sequin Party Saree",
    description: "Channel the mystery of midnight skies in this captivating deep blue saree adorned with constellation-like sequin work. The rich midnight blue provides a dramatic backdrop for the shimmering sequins, creating an effect reminiscent of stars scattered across a velvet night sky. The fabric drapes beautifully, creating an elegant silhouette that moves gracefully with every step. This piece is designed for evening celebrations where dramatic lighting can enhance its celestial quality—cocktail parties, receptions, and formal dinners where you want to be the center of an admiring universe. The sophisticated color palette allows for bold statement jewelry or subtle accessories depending on your preference.",
    price: convertPrice(4295),
    originalPrice: convertPrice(5798),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Sky-Blue-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS200(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Sky-Blue-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS200(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Sky-Blue-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS200(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Sky-Blue-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS200(4).jpg"
    ],
    category: "Party Sarees",
    fabric: "Georgette",
    occasion: "Party",
    color: "Midnight Blue",
    work: "Sequins",
    tags: ["party", "georgette", "blue", "sequins", "evening", "dramatic"],
    variants: [
      { id: "saree-019-free", title: "Free Size", price: convertPrice(4295), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-020",
    handle: "rose-gold-shimmer-party-saree",
    title: "Rose Gold Shimmer Party Saree",
    description: "Embrace the warmth of rose gold in this luminous shimmer saree that captures the essence of modern glamour. The rose gold shade has become synonymous with contemporary luxury, offering warmth and sophistication in equal measure. The shimmer fabric creates an all-over glow that photographs beautifully, ensuring you look radiant in every celebration photo. The contemporary color palette pairs beautifully with both traditional and modern jewelry, offering styling versatility. This piece is designed for the modern woman who appreciates trend-forward fashion while honoring the elegance of the saree silhouette. Perfect for cocktail parties, milestone celebrations, and any event where contemporary glamour is the dress code.",
    price: convertPrice(3695),
    originalPrice: convertPrice(4989),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Pink-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS202(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Pink-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS202(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Pink-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS202(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59704/Pink-Organza-Party-Wear-Zari-Sequins-Work-Lehenga-Choli-DRS202(4).jpg"
    ],
    category: "Party Sarees",
    fabric: "Shimmer",
    occasion: "Party",
    color: "Rose Gold",
    work: "Shimmer",
    tags: ["party", "shimmer", "rose-gold", "contemporary", "glamour", "trend"],
    variants: [
      { id: "saree-020-free", title: "Free Size", price: convertPrice(3695), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  // Designer Sarees
  {
    id: "saree-021",
    handle: "emerald-organza-designer-saree",
    title: "Emerald Organza Designer Saree",
    description: "Experience the pinnacle of designer luxury in this stunning emerald green organza saree that represents the perfect marriage of contemporary design and traditional elegance. The rich emerald green captures the beauty of precious gemstones, while the organza fabric creates an ethereal, floating quality that is distinctly modern. Designer-level embellishments are strategically placed to create visual interest without overwhelming the fabric's natural beauty. The color works beautifully across all celebration contexts—from daytime ceremonies to evening receptions. This piece is for the woman who appreciates designer fashion and wants to wear something that feels exclusive and special. A statement piece that will be remembered long after the celebration ends.",
    price: convertPrice(4895),
    originalPrice: convertPrice(6609),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4294(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4294(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4294(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4294(4).jpg"
    ],
    category: "Designer Sarees",
    fabric: "Organza",
    occasion: "Designer",
    color: "Emerald",
    work: "Designer Work",
    tags: ["designer", "organza", "emerald", "luxury", "exclusive", "statement"],
    variants: [
      { id: "saree-021-free", title: "Free Size", price: convertPrice(4895), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-022",
    handle: "champagne-designer-net-saree",
    title: "Champagne Designer Net Saree",
    description: "Celebrate in style with this sophisticated champagne net saree that embodies the effervescence of special occasions. The warm champagne shade creates a flattering glow that works beautifully across all skin tones and lighting conditions. The net fabric provides a contemporary structure while maintaining the flowing elegance expected of saree wear. Designer-level embellishments feature hand-applied sequins and beadwork that create patterns reminiscent of champagne bubbles rising through the fabric. This piece is designed for milestone celebrations—anniversary parties, reception dinners, and any occasion that calls for a celebratory toast in fabric form. The versatile color pairs with both gold and silver jewelry.",
    price: convertPrice(5295),
    originalPrice: convertPrice(7148),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Beige-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3164(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Beige-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3164(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Beige-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3164(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Beige-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3164(4).jpg"
    ],
    category: "Designer Sarees",
    fabric: "Net",
    occasion: "Designer",
    color: "Champagne",
    work: "Designer Work",
    tags: ["designer", "net", "champagne", "celebration", "milestone", "sophisticated"],
    variants: [
      { id: "saree-022-free", title: "Free Size", price: convertPrice(5295), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-023",
    handle: "burgundy-velvet-designer-saree",
    title: "Burgundy Velvet Designer Saree",
    description: "Embrace winter luxury in this opulent burgundy velvet saree that channels the richness of royal courts and heritage celebrations. The deep burgundy shade represents passion, prosperity, and refined taste—perfect for winter weddings and evening celebrations. The velvet fabric provides a plush, tactile quality that photographs beautifully while offering warmth and comfort in cooler climates. Designer embellishments feature hand-applied work that adds sparkle without diminishing the fabric's inherent luxury. This is a statement piece designed for women who appreciate the finer things and understand the power of texture and color in creating unforgettable fashion moments. Perfect for reception dinners, winter celebrations, and any occasion where velvet luxury is called for.",
    price: convertPrice(6495),
    originalPrice: convertPrice(8768),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Burgundy-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-A(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Burgundy-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-A(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Burgundy-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-A(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Burgundy-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-A(4).jpg"
    ],
    category: "Designer Sarees",
    fabric: "Velvet",
    occasion: "Designer",
    color: "Burgundy",
    work: "Designer Work",
    tags: ["designer", "velvet", "burgundy", "winter", "luxury", "royal"],
    variants: [
      { id: "saree-023-free", title: "Free Size", price: convertPrice(6495), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-024",
    handle: "ivory-chiffon-designer-saree",
    title: "Ivory Chiffon Designer Saree",
    description: "Experience ethereal beauty in this stunning ivory chiffon saree that floats like clouds around the body. The pristine ivory shade represents purity, elegance, and fresh beginnings—making it an inspired choice for contemporary celebrations. The chiffon fabric creates beautiful movement and drape, with a translucent quality that adds depth and dimension to the simple color palette. Designer embellishments are applied with restraint, creating subtle sparkle that catches light without overwhelming the fabric's natural beauty. This piece is perfect for contemporary brides, destination weddings, or any celebration where modern minimalism meets traditional elegance. The neutral palette offers endless styling possibilities.",
    price: convertPrice(4695),
    originalPrice: convertPrice(6339),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(4).jpg"
    ],
    category: "Designer Sarees",
    fabric: "Chiffon",
    occasion: "Designer",
    color: "Ivory",
    work: "Designer Work",
    tags: ["designer", "chiffon", "ivory", "minimal", "contemporary", "ethereal"],
    variants: [
      { id: "saree-024-free", title: "Free Size", price: convertPrice(4695), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  },
  {
    id: "saree-025",
    handle: "teal-green-banarasi-silk-saree",
    title: "Teal Green Banarasi Silk Saree",
    description: "Celebrate heritage craftsmanship in this stunning teal green Banarasi silk saree that represents centuries of weaving excellence. The distinctive teal shade offers a modern take on traditional green while maintaining cultural authenticity. Master weavers have created intricate patterns using traditional techniques that have been passed down through generations, resulting in a piece that is both art and garment. The heavy silk provides beautiful drape and structure, while the zari work adds the expected opulence of Banarasi tradition. This saree is an investment in heritage—a piece that connects you to the weavers of Varanasi and the rich tradition of Indian textiles. Perfect for weddings, pujas, and celebrations that honor cultural heritage.",
    price: convertPrice(8995),
    originalPrice: convertPrice(12143),
    currency: "USD",
    images: [
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Multi-Color-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3133(1).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Multi-Color-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3133(2).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Multi-Color-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3133(3).jpg",
      "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Multi-Color-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3133(4).jpg"
    ],
    category: "Designer Sarees",
    fabric: "Banarasi Silk",
    occasion: "Designer",
    color: "Teal Green",
    work: "Banarasi Weaving",
    tags: ["designer", "banarasi", "silk", "teal", "heritage", "traditional"],
    variants: [
      { id: "saree-025-free", title: "Free Size", price: convertPrice(8995), options: { Size: "Free Size" } }
    ],
    options: [{ name: "Size", values: ["Free Size"] }]
  }
];

// Helper functions
export function toShopifySareeFormat(product: SareeProduct) {
  return {
    node: {
      id: product.id,
      title: product.title,
      description: product.description,
      handle: product.handle,
      vendor: "LuxeMia",
      productType: "Saree",
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

export function getSareeProductByHandle(handle: string) {
  const product = sareeProducts.find(p => p.handle === handle);
  return product ? toShopifySareeFormat(product) : null;
}

export function getAllSareeProducts() {
  return sareeProducts.map(toShopifySareeFormat);
}

export function getSareeProductsByCategory(category: string) {
  return sareeProducts
    .filter(p => p.category.toLowerCase().includes(category.toLowerCase()))
    .map(toShopifySareeFormat);
}
