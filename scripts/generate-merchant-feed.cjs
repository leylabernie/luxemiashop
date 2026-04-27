#!/usr/bin/env node
/**
 * Generate Google Merchant Center product feeds (XML + TSV)
 * Run during build: node scripts/generate-merchant-feed.js
 * 
 * This script generates both XML and TSV formats so you can choose
 * whichever works best in Merchant Center settings.
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://luxemia.shop';
const BRAND = 'LuxeMia';

// ─── Product Data ────────────────────────────────────────────────────────
// This is a simplified version of the product data from src/data/*.ts
// Update this when products change, or better yet, modify the script to
// fetch from Shopify API at build time.

const convertPrice = (inrPrice) => Math.round(inrPrice * 0.012 * 2.5);

// Google product category mapping
function getGoogleCategory(category) {
  const cat = category.toLowerCase();
  if (cat.includes('sherwani')) return 'Apparel & Accessories > Clothing > Suits';
  if (cat.includes('kurta')) return 'Apparel & Accessories > Clothing > Shirts & Tops';
  if (cat.includes('saree')) return 'Apparel & Accessories > Clothing';
  if (cat.includes('lehenga') || cat.includes('dress')) return 'Apparel & Accessories > Clothing > Dresses';
  if (cat.includes('suit') || cat.includes('anarkali') || cat.includes('sharara') || cat.includes('palazzo')) return 'Apparel & Accessories > Clothing > Dresses';
  return 'Apparel & Accessories > Clothing';
}

function getGender(category) {
  const cat = category.toLowerCase();
  if (cat.includes('sherwani') || cat.includes('kurta') || cat.includes('menswear')) return 'male';
  return 'female';
}

function getProductType(category) {
  const cat = category.toLowerCase();
  if (cat.includes('bridal lehenga')) return 'Lehengas > Bridal Lehengas';
  if (cat.includes('wedding lehenga')) return 'Lehengas > Wedding Lehengas';
  if (cat.includes('party lehenga')) return 'Lehengas > Party Lehengas';
  if (cat.includes('festive lehenga')) return 'Lehengas > Festive Lehengas';
  if (cat.includes('designer lehenga')) return 'Lehengas > Designer Lehengas';
  if (cat.includes('wedding saree')) return 'Sarees > Wedding Sarees';
  if (cat.includes('party saree')) return 'Sarees > Party Sarees';
  if (cat.includes('festive saree')) return 'Sarees > Festive Sarees';
  if (cat.includes('casual saree')) return 'Sarees > Casual Sarees';
  if (cat.includes('occasional saree')) return 'Sarees > Occasional Sarees';
  if (cat.includes('groom sherwani')) return 'Menswear > Groom Sherwanis';
  if (cat.includes('sherwani')) return 'Menswear > Sherwanis';
  if (cat.includes('kurta pajama')) return 'Menswear > Kurta Pajamas';
  if (cat.includes('anarkali')) return 'Suits > Anarkali Suits';
  if (cat.includes('sharara')) return 'Suits > Sharara Sets';
  if (cat.includes('palazzo')) return 'Suits > Palazzo Suits';
  return category;
}

// Category-to-occasion mapping for enriched descriptions
const CATEGORY_OCCASIONS = {
  'bridal lehengas': 'weddings, engagement ceremonies',
  'wedding lehengas': 'wedding receptions, sangeet ceremonies',
  'party lehengas': 'cocktail parties, festive celebrations',
  'festive lehengas': 'Diwali, Navratri, Eid celebrations',
  'designer lehengas': 'red carpet events, luxury celebrations',
  'wedding sarees': 'wedding ceremonies, reception',
  'party sarees': 'cocktail parties, evening events',
  'festive sarees': 'Diwali, Navratri, religious ceremonies',
  'casual sarees': 'daily wear, casual gatherings',
  'occasional sarees': 'housewarmings, pooja ceremonies',
  'groom sherwanis': "groom's wedding day, baraat",
  'sherwanis': 'wedding reception, engagement',
  'kurta pajamas': 'haldi, mehndi, casual festive gatherings',
  'anarkali': 'festive celebrations, wedding guest',
  'sharara': 'sangeet, mehndi ceremonies',
  'palazzo': 'casual festive, daily elegance',
};

// Enrich description with customer-relevant details Google wants
function enrichDescription(desc, category, fabric, work) {
  const cat = (category || '').toLowerCase();
  let occasion = 'special occasions';
  for (const [key, val] of Object.entries(CATEGORY_OCCASIONS)) {
    if (cat.includes(key)) { occasion = val; break; }
  }
  const fabricStr = fabric || 'Premium';
  const workStr = work || 'handcrafted';
  return `${desc} Product Details: ${fabricStr} fabric with ${workStr} detailing, perfect for ${occasion}. Available in sizes S-XXL with custom tailoring options. Care: Dry clean only. Ships worldwide from India in 7-12 business days. Free shipping on orders over $200.`;
}

// All products from the site data files
const products = [
  // ── BRIDAL LEHENGAS ──
  { id: "bridal-001", handle: "ethereal-pastel-pink-bridal-lehenga", title: "Ethereal Pastel Pink Bridal Lehenga", description: "Step into your fairy tale in this breathtaking pastel pink bridal masterpiece. Handcrafted from the finest Pure Net fabric, this lehenga showcases extraordinary heavy work embroidery that has taken master artisans over 200 hours to complete. The delicate blush tone is achieved through a specialized dyeing process that ensures color permanence and a subtle shimmer in every light.", price: convertPrice(15895), originalPrice: convertPrice(22076), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Pastel-Pink-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10243(1).jpg", category: "Bridal Lehengas", fabric: "Pure Net", color: "Pastel Pink", work: "Heavy Embroidery" },
  { id: "bridal-002", handle: "royal-rani-pink-silk-bridal-lehenga", title: "Royal Rani Pink Silk Bridal Lehenga", description: "Embrace the timeless grandeur of Indian bridal tradition with this magnificent Rani Pink silk lehenga. This heritage piece is woven from premium Banarasi silk that carries the weight and drape synonymous with royal trousseau. The heavy traditional work combines resham thread embroidery, genuine kundan stones, and delicate dabka detailing.", price: convertPrice(24295), originalPrice: convertPrice(34218), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59645/Rani-Pink-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-A(1).jpg", category: "Bridal Lehengas", fabric: "Silk", color: "Rani Pink", work: "Heavy Work" },
  { id: "bridal-003", handle: "classic-bridal-red-silk-lehenga", title: "Classic Bridal Red Silk Lehenga", description: "The quintessential bridal red that has adorned generations of brides across the subcontinent. This luxurious silk lehenga is a testament to the enduring appeal of traditional craftsmanship, featuring masterfully executed heavy work that creates intricate patterns dancing with every movement.", price: convertPrice(24295), originalPrice: convertPrice(34218), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59645/Red-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-B(1).jpg", category: "Bridal Lehengas", fabric: "Silk", color: "Red", work: "Heavy Work" },
  { id: "bridal-004", handle: "ivory-dreamscape-net-bridal-lehenga", title: "Ivory Dreamscape Net Bridal Lehenga", description: "For the modern bride who dares to redefine tradition. This pristine ivory Heavy Net lehenga represents the new era of bridal fashion, where classic silhouettes meet contemporary color palettes. The sequins and embroidery work creates a dreamlike shimmer.", price: convertPrice(12895), originalPrice: convertPrice(17664), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(1).jpg", category: "Bridal Lehengas", fabric: "Heavy Net", color: "Ivory", work: "Sequins Embroidery" },
  { id: "bridal-005", handle: "lavender-mist-bridal-lehenga", title: "Lavender Mist Bridal Lehenga", description: "A contemporary masterpiece that breaks the traditional color boundaries while maintaining the grandeur expected of bridal couture. This serene lavender Pure Net bridal ensemble speaks to the bride with a discerning eye for unique beauty.", price: convertPrice(12695), originalPrice: convertPrice(17632), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Lavender-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10242(1).jpg", category: "Bridal Lehengas", fabric: "Pure Net", color: "Lavender", work: "Heavy Work" },
  { id: "bridal-006", handle: "metallic-silver-celebration-lehenga", title: "Metallic Silver Celebration Lehenga", description: "Make an unforgettable entrance in this stunning metallic silver Pure Net lehenga that commands attention and admiration in equal measure. The lustrous silver base is achieved through an innovative weaving technique.", price: convertPrice(13995), originalPrice: convertPrice(19438), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59570/Metalic-Silver-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10245(1).jpg", category: "Bridal Lehengas", fabric: "Pure Net", color: "Silver", work: "Heavy Work" },

  // ── WEDDING LEHENGAS ──
  { id: "wedding-001", handle: "burgundy-velvet-wedding-lehenga", title: "Burgundy Velvet Wedding Lehenga", description: "Embrace regal sophistication with this sumptuous burgundy velvet lehenga that embodies the luxurious warmth of winter celebrations. The premium Italian velvet has been specially treated for a subtle sheen.", price: convertPrice(8995), originalPrice: convertPrice(12155), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Burgundy-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-A(1).jpg", category: "Wedding Lehengas", fabric: "Net", color: "Burgundy", work: "Heavy Work" },
  { id: "wedding-002", handle: "wine-romance-net-lehenga", title: "Wine Romance Net Lehenga", description: "Fall in love with this intoxicating wine-colored Net lehenga that exudes romance and sophistication. The deep wine shade has been carefully chosen to complement a wide range of skin tones.", price: convertPrice(8995), originalPrice: convertPrice(12155), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Wine-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-B(1).jpg", category: "Wedding Lehengas", fabric: "Net", color: "Wine", work: "Heavy Work" },
  { id: "wedding-003", handle: "emerald-forest-wedding-lehenga", title: "Emerald Forest Wedding Lehenga", description: "Channel the mystique of enchanted forests with this breathtaking emerald green Net lehenga that celebrates the beauty of nature. The rich emerald shade represents growth, harmony, and the eternal cycle of love.", price: convertPrice(9495), originalPrice: convertPrice(13189), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Green-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-C(1).jpg", category: "Wedding Lehengas", fabric: "Net", color: "Emerald Green", work: "Heavy Work" },
  { id: "wedding-004", handle: "royal-blue-celebration-lehenga", title: "Royal Blue Celebration Lehenga", description: "Make a statement of confidence and elegance with this commanding royal blue Net lehenga that embodies the depth and mystery of midnight skies.", price: convertPrice(9495), originalPrice: convertPrice(13189), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Blue-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-D(1).jpg", category: "Wedding Lehengas", fabric: "Net", color: "Royal Blue", work: "Heavy Work" },
  { id: "wedding-005", handle: "coral-sunset-net-lehenga", title: "Coral Sunset Net Lehenga", description: "Capture the warmth of a perfect sunset with this stunning coral Net lehenga that radiates joy and celebration.", price: convertPrice(8795), originalPrice: convertPrice(12216), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Coral-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-E(1).jpg", category: "Wedding Lehengas", fabric: "Net", color: "Coral", work: "Heavy Work" },
  { id: "wedding-006", handle: "powder-pink-wedding-lehenga", title: "Powder Pink Wedding Lehenga", description: "Whisper romance with this delicate powder pink Net lehenga that embodies gentle femininity and timeless grace.", price: convertPrice(9295), originalPrice: convertPrice(12911), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59625/Pink-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-F(1).jpg", category: "Wedding Lehengas", fabric: "Net", color: "Powder Pink", work: "Heavy Work" },

  // ── PARTY LEHENGAS ──
  { id: "party-001", handle: "blush-georgette-party-lehenga", title: "Blush Georgette Party Lehenga", description: "Float through celebrations in this enchanting blush Georgette lehenga that combines graceful movement with sophisticated style.", price: convertPrice(5995), originalPrice: convertPrice(8327), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Blush-Pink-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3504(1).jpg", category: "Party Lehengas", fabric: "Georgette", color: "Blush Pink", work: "Sequins Work" },
  { id: "party-002", handle: "mint-sequin-party-lehenga", title: "Mint Sequin Party Lehenga", description: "Make a fresh statement with this stunning mint Georgette lehenga that brings a cool, contemporary edge to traditional celebrations.", price: convertPrice(6295), originalPrice: convertPrice(8744), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Mint-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3505(1).jpg", category: "Party Lehengas", fabric: "Georgette", color: "Mint", work: "Sequins Work" },
  { id: "party-003", handle: "champagne-gold-party-lehenga", title: "Champagne Gold Party Lehenga", description: "Toast to elegance with this sophisticated champagne gold Georgette lehenga that embodies refined celebration style.", price: convertPrice(6795), originalPrice: convertPrice(9438), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Gold-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3506(1).jpg", category: "Party Lehengas", fabric: "Georgette", color: "Champagne Gold", work: "Sequins Work" },
  { id: "party-004", handle: "navy-blue-party-lehenga", title: "Navy Blue Party Lehenga", description: "Command the room with this sophisticated navy blue Georgette lehenga that balances classic elegance with modern glamour.", price: convertPrice(6495), originalPrice: convertPrice(9021), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59622/Navy-Blue-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3507(1).jpg", category: "Party Lehengas", fabric: "Georgette", color: "Navy Blue", work: "Sequins Work" },

  // ── FESTIVE LEHENGAS ──
  { id: "festive-001", handle: "marigold-yellow-festive-lehenga", title: "Marigold Yellow Festive Lehenga", description: "Embrace the spirit of Indian festivals with this vibrant marigold yellow Chinnon lehenga that radiates joy and celebration.", price: convertPrice(4995), originalPrice: convertPrice(6938), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Yellow-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-H(1).jpg", category: "Festive Lehengas", fabric: "Chinnon", color: "Yellow", work: "Embroidery" },
  { id: "festive-002", handle: "saffron-orange-festive-lehenga", title: "Saffron Orange Festive Lehenga", description: "Celebrate with sacred energy in this stunning saffron orange Chinnon lehenga that embodies the spiritual significance of Indian festivals.", price: convertPrice(5295), originalPrice: convertPrice(7355), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Orange-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-G(1).jpg", category: "Festive Lehengas", fabric: "Chinnon", color: "Orange", work: "Embroidery" },
  { id: "festive-003", handle: "peacock-green-festive-lehenga", title: "Peacock Green Festive Lehenga", description: "Channel the majestic beauty of India's national bird with this stunning peacock green Chinnon lehenga.", price: convertPrice(5495), originalPrice: convertPrice(7632), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Teal-Green-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-F(1).jpg", category: "Festive Lehengas", fabric: "Chinnon", color: "Peacock Green", work: "Embroidery" },
  { id: "festive-004", handle: "ruby-red-festive-lehenga", title: "Ruby Red Festive Lehenga", description: "Shine with the brilliance of precious gems in this magnificent ruby red Chinnon lehenga that combines traditional symbolism with contemporary elegance.", price: convertPrice(5695), originalPrice: convertPrice(7910), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Red-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-E(1).jpg", category: "Festive Lehengas", fabric: "Chinnon", color: "Ruby Red", work: "Embroidery" },
  { id: "festive-005", handle: "dusty-rose-festive-lehenga", title: "Dusty Rose Festive Lehenga", description: "Embrace soft romance with this enchanting dusty rose Chinnon lehenga that brings a contemporary color palette to traditional festival celebrations.", price: convertPrice(4795), originalPrice: convertPrice(6660), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Dusty-Rose-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-D(1).jpg", category: "Festive Lehengas", fabric: "Chinnon", color: "Dusty Rose", work: "Embroidery" },
  { id: "festive-006", handle: "royal-purple-festive-lehenga", title: "Royal Purple Festive Lehenga", description: "Channel regal elegance with this stunning royal purple Chinnon lehenga that combines the majesty of imperial colors with festival celebration energy.", price: convertPrice(5395), originalPrice: convertPrice(7493), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59616/Purple-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-C(1).jpg", category: "Festive Lehengas", fabric: "Chinnon", color: "Royal Purple", work: "Embroidery" },

  // ── DESIGNER LEHENGAS ──
  { id: "designer-001", handle: "heavy-silk-yellow-mirror-work-lehenga", title: "Heavy Silk Yellow Mirror Work Lehenga", description: "A radiant masterpiece that captures the essence of sunshine celebrations. This exquisite Heavy Silk lehenga features elaborate mirror work that creates a mesmerizing play of light with every movement.", price: convertPrice(10995 * 3), originalPrice: convertPrice(15062 * 3), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59605/Yellow-Heavy-Silk-Party-Wear-Mirror-Work-Lehenga-Choli-Alizeh---Mirror-Maze--3612-1015(1).jpg", category: "Designer Lehengas", fabric: "Heavy Silk", color: "Yellow", work: "Mirror Work" },
  { id: "designer-002", handle: "heavy-silk-beige-mirror-work-lehenga", title: "Heavy Silk Beige Mirror Work Lehenga", description: "Understated elegance meets artisan craftsmanship in this sophisticated beige Heavy Silk lehenga. The neutral palette serves as the perfect canvas for the intricate mirror work embellishments.", price: convertPrice(10995 * 3), originalPrice: convertPrice(15062 * 3), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59605/Beige-Heavy-Silk-Party-Wear-Mirror-Work-Lehenga-Choli-Alizeh---Mirror-Maze--3612-1013-A(1).jpg", category: "Designer Lehengas", fabric: "Heavy Silk", color: "Beige", work: "Mirror Work" },
  { id: "designer-003", handle: "heavy-silk-sky-blue-mirror-work-lehenga", title: "Heavy Silk Sky Blue Mirror Work Lehenga", description: "Capture the serenity of clear horizons with this breathtaking sky blue Heavy Silk lehenga. The tranquil blue shade combined with shimmering mirror work creates an ethereal ensemble.", price: convertPrice(10995 * 3), originalPrice: convertPrice(15062 * 3), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59605/Sky-Blue-Heavy-Silk-Party-Wear-Mirror-Work-Lehenga-Choli-Alizeh---Mirror-Maze--3612-1012-A(1).jpg", category: "Designer Lehengas", fabric: "Heavy Silk", color: "Sky Blue", work: "Mirror Work" },
  { id: "designer-004", handle: "heavy-silk-dusty-pink-mirror-work-lehenga", title: "Heavy Silk Dusty Pink Mirror Work Lehenga", description: "Romance personified in this dreamy dusty pink Heavy Silk lehenga adorned with exquisite mirror work. Perfect for engagement ceremonies and pre-wedding celebrations.", price: convertPrice(10995 * 3), originalPrice: convertPrice(15062 * 3), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59605/Dusty-Pink-Heavy-Silk-Party-Wear-Mirror-Work-Lehenga-Choli-Alizeh---Mirror-Maze--3612-1012(1).jpg", category: "Designer Lehengas", fabric: "Heavy Silk", color: "Dusty Pink", work: "Mirror Work" },
  { id: "designer-005", handle: "organza-lavender-bridal-heavy-work-lehenga", title: "Organza Lavender Bridal Heavy Work Lehenga", description: "Step into ethereal elegance with this enchanting lavender Organza bridal lehenga. The delicate fabric combined with heavy embroidery work creates a masterpiece fit for the most discerning bride.", price: convertPrice(11295 * 3), originalPrice: convertPrice(15908 * 3), image: "https://kesimg.b-cdn.net/images/650/2025y/November/59368/Lavender-Organza-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-Aarohi-3474-2918-F(1).jpg", category: "Designer Lehengas", fabric: "Organza", color: "Lavender", work: "Heavy Work" },
  { id: "designer-006", handle: "organza-red-bridal-heavy-work-lehenga", title: "Organza Red Bridal Heavy Work Lehenga", description: "The timeless allure of bridal red reimagined in luxurious Organza fabric. This stunning lehenga features intensive heavy work embroidery that creates depth and dimension throughout.", price: convertPrice(11295 * 3), originalPrice: convertPrice(15908 * 3), image: "https://kesimg.b-cdn.net/images/650/2025y/November/59368/Red-Organza-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-Aarohi-3474-2918-E(1).jpg", category: "Designer Lehengas", fabric: "Organza", color: "Red", work: "Heavy Work" },

  // ── SAREES (Wedding) ──
  { id: "saree-001", handle: "mint-green-kanchipuram-silk-wedding-saree", title: "Mint Green Kanchipuram Silk Wedding Saree", description: "Experience the grandeur of South Indian tradition with this exquisite mint green Kanchipuram-inspired Viscose Silk saree. The delicate mint shade represents new beginnings and prosperity.", price: convertPrice(12195), originalPrice: convertPrice(16938), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Mint-Green-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176-B(1).jpg", category: "Wedding Sarees", fabric: "Viscose Silk", color: "Mint Green", work: "Weaving Work" },
  { id: "saree-002", handle: "royal-pink-kanchipuram-silk-wedding-saree", title: "Royal Pink Kanchipuram Silk Wedding Saree", description: "A celebration of feminine grace in royal pink, this Viscose Silk saree channels the opulence of Kanchipuram's legendary weaving traditions.", price: convertPrice(12195), originalPrice: convertPrice(16938), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Pink-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176(1).jpg", category: "Wedding Sarees", fabric: "Viscose Silk", color: "Pink", work: "Weaving Work" },
  { id: "saree-003", handle: "ivory-beige-kanchipuram-silk-wedding-saree", title: "Ivory Beige Kanchipuram Silk Wedding Saree", description: "Understated elegance meets heritage craftsmanship in this sophisticated ivory beige Viscose Silk saree.", price: convertPrice(11545), originalPrice: convertPrice(16035), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Beige-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3164(1).jpg", category: "Wedding Sarees", fabric: "Viscose Silk", color: "Beige", work: "Weaving Work" },
  { id: "saree-004", handle: "multicolor-kanchipuram-silk-wedding-saree", title: "Multicolor Kanchipuram Silk Wedding Saree", description: "A vibrant celebration of color and craftsmanship, this multicolor Viscose Silk saree showcases bold aesthetic of South Indian wedding traditions.", price: convertPrice(11845), originalPrice: convertPrice(16451), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Multi-Color-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3133-B(1).jpg", category: "Wedding Sarees", fabric: "Viscose Silk", color: "Multi Color", work: "Weaving Work" },
  { id: "saree-005", handle: "antique-gold-kanchipuram-silk-wedding-saree", title: "Antique Gold Kanchipuram Silk Wedding Saree", description: "Capture the essence of royal opulence with this magnificent antique gold Viscose Silk saree that radiates warmth and prosperity.", price: convertPrice(11545), originalPrice: convertPrice(16035), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59744/Gold-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3131(1).jpg", category: "Wedding Sarees", fabric: "Viscose Silk", color: "Gold", work: "Weaving Work" },
  { id: "saree-006", handle: "beige-gold-tissue-silk-wedding-saree", title: "Beige Gold Tissue Silk Wedding Saree", description: "Ethereal beauty meets everyday luxury in this stunning beige gold PV Tissue Silk saree.", price: convertPrice(2645), originalPrice: convertPrice(3574), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Beige-Gold-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4298(1).jpg", category: "Wedding Sarees", fabric: "Tissue Silk", color: "Beige Gold", work: "Weaving Work" },
  { id: "saree-007", handle: "pink-tissue-silk-wedding-saree", title: "Pink Tissue Silk Wedding Saree", description: "Romance blooms in this delicate pink PV Tissue Silk saree that combines the lightness of air with the richness of traditional wedding wear.", price: convertPrice(2645), originalPrice: convertPrice(3574), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Pink-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4297(1).jpg", category: "Wedding Sarees", fabric: "Tissue Silk", color: "Pink", work: "Weaving Work" },
  { id: "saree-008", handle: "sea-green-tissue-silk-wedding-saree", title: "Sea Green Tissue Silk Wedding Saree", description: "Transport yourself to serene coastal beauty with this refreshing sea green PV Tissue Silk saree.", price: convertPrice(2645), originalPrice: convertPrice(3574), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Sea-Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4296(1).jpg", category: "Wedding Sarees", fabric: "Tissue Silk", color: "Sea Green", work: "Weaving Work" },
  { id: "saree-009", handle: "sunset-orange-tissue-silk-wedding-saree", title: "Sunset Orange Tissue Silk Wedding Saree", description: "Embrace the warmth and energy of a glorious sunset with this vibrant orange PV Tissue Silk saree.", price: convertPrice(2645), originalPrice: convertPrice(3574), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Orange-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4295(1).jpg", category: "Wedding Sarees", fabric: "Tissue Silk", color: "Orange", work: "Weaving Work" },
  { id: "saree-010", handle: "lavender-tissue-silk-wedding-saree", title: "Lavender Tissue Silk Wedding Saree", description: "Dream in lavender with this enchanting PV Tissue Silk saree that brings a contemporary color palette to traditional wedding celebrations.", price: convertPrice(2645), originalPrice: convertPrice(3574), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59728/Lavender-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4294(1).jpg", category: "Wedding Sarees", fabric: "Tissue Silk", color: "Lavender", work: "Weaving Work" },

  // ── SAREES (Party) ──
  { id: "saree-011", handle: "royal-blue-georgette-party-saree", title: "Royal Blue Georgette Party Saree", description: "Command attention in this stunning royal blue Georgette saree featuring intricate sequins work.", price: convertPrice(3495), originalPrice: convertPrice(4855), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59720/Blue-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4287(1).jpg", category: "Party Sarees", fabric: "Georgette", color: "Royal Blue", work: "Sequins Work" },
  { id: "saree-012", handle: "wine-georgette-party-saree", title: "Wine Georgette Party Saree", description: "Embrace sophisticated glamour with this intoxicating wine Georgette saree.", price: convertPrice(3495), originalPrice: convertPrice(4855), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59720/Wine-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4286(1).jpg", category: "Party Sarees", fabric: "Georgette", color: "Wine", work: "Sequins Work" },
  { id: "saree-013", handle: "emerald-green-georgette-party-saree", title: "Emerald Green Georgette Party Saree", description: "Channel natural elegance with this stunning emerald green Georgette saree.", price: convertPrice(3495), originalPrice: convertPrice(4855), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59720/Green-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4285(1).jpg", category: "Party Sarees", fabric: "Georgette", color: "Emerald Green", work: "Sequins Work" },
  { id: "saree-014", handle: "dusty-rose-georgette-party-saree", title: "Dusty Rose Georgette Party Saree", description: "Whisper romance with this enchanting dusty rose Georgette saree.", price: convertPrice(3295), originalPrice: convertPrice(4576), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59720/Dusty-Rose-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4284(1).jpg", category: "Party Sarees", fabric: "Georgette", color: "Dusty Rose", work: "Sequins Work" },
  { id: "saree-015", handle: "black-georgette-party-saree", title: "Black Georgette Party Saree", description: "Make a bold statement with this striking black Georgette saree.", price: convertPrice(3495), originalPrice: convertPrice(4855), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59720/Black-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4283(1).jpg", category: "Party Sarees", fabric: "Georgette", color: "Black", work: "Sequins Work" },

  // ── SAREES (Festive) ──
  { id: "saree-021", handle: "magenta-art-silk-festive-saree", title: "Magenta Art Silk Festive Saree", description: "Celebrate with vibrant energy in this stunning magenta Art Silk saree.", price: convertPrice(2995), originalPrice: convertPrice(4160), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59708/Magenta-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4277(1).jpg", category: "Festive Sarees", fabric: "Art Silk", color: "Magenta", work: "Weaving Work" },
  { id: "saree-022", handle: "teal-green-art-silk-festive-saree", title: "Teal Green Art Silk Festive Saree", description: "Channel royal elegance with this stunning teal green Art Silk saree.", price: convertPrice(2995), originalPrice: convertPrice(4160), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59708/Teal-Green-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4276(1).jpg", category: "Festive Sarees", fabric: "Art Silk", color: "Teal Green", work: "Weaving Work" },
  { id: "saree-023", handle: "maroon-art-silk-festive-saree", title: "Maroon Art Silk Festive Saree", description: "Embrace traditional elegance with this rich maroon Art Silk saree.", price: convertPrice(2995), originalPrice: convertPrice(4160), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59708/Maroon-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4275(1).jpg", category: "Festive Sarees", fabric: "Art Silk", color: "Maroon", work: "Weaving Work" },
  { id: "saree-024", handle: "mustard-yellow-art-silk-festive-saree", title: "Mustard Yellow Art Silk Festive Saree", description: "Radiate warmth with this vibrant mustard yellow Art Silk saree.", price: convertPrice(2995), originalPrice: convertPrice(4160), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59708/Mustard-Yellow-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4274(1).jpg", category: "Festive Sarees", fabric: "Art Silk", color: "Mustard Yellow", work: "Weaving Work" },
  { id: "saree-025", handle: "royal-purple-art-silk-festive-saree", title: "Royal Purple Art Silk Festive Saree", description: "Channel regal elegance with this stunning royal purple Art Silk saree.", price: convertPrice(2995), originalPrice: convertPrice(4160), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59708/Purple-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4273(1).jpg", category: "Festive Sarees", fabric: "Art Silk", color: "Royal Purple", work: "Weaving Work" },

  // ── SAREES (Occasional) ──
  { id: "saree-026", handle: "silk-yellow-occasional-embroidery-saree", title: "Silk Yellow Occasional Wear Embroidery Saree", description: "Radiate sunshine elegance with this stunning yellow Silk saree featuring exquisite embroidery work.", price: convertPrice(4045), originalPrice: convertPrice(5186), image: "https://kesimg.b-cdn.net/images/650/2026y/January/59800/Yellow-Silk-Occasional-Wear-Embroidery-Work-Saree-3689-6039-D(1).jpg", category: "Occasional Sarees", fabric: "Silk", color: "Yellow", work: "Embroidery Work" },
  { id: "saree-027", handle: "silk-light-pink-occasional-embroidery-saree", title: "Silk Light Pink Occasional Wear Embroidery Saree", description: "Embrace soft femininity with this beautiful light pink Silk saree adorned with delicate embroidery work.", price: convertPrice(4045), originalPrice: convertPrice(5186), image: "https://kesimg.b-cdn.net/images/650/2026y/January/59800/Light-Pink-Silk-Occasional-Wear-Embroidery-Work-Saree-3689-6039-C(1).jpg", category: "Occasional Sarees", fabric: "Silk", color: "Light Pink", work: "Embroidery Work" },
  { id: "saree-028", handle: "silk-green-occasional-embroidery-saree", title: "Silk Green Occasional Wear Embroidery Saree", description: "Channel natural elegance with this lush green Silk saree featuring refined embroidery work.", price: convertPrice(4045), originalPrice: convertPrice(5186), image: "https://kesimg.b-cdn.net/images/650/2026y/January/59800/Green-Silk-Occasional-Wear-Embroidery-Work-Saree-3689-6039-B(1).jpg", category: "Occasional Sarees", fabric: "Silk", color: "Green", work: "Embroidery Work" },
  { id: "saree-029", handle: "silk-sea-green-occasional-embroidery-saree", title: "Silk Sea Green Occasional Wear Embroidery Saree", description: "Experience coastal serenity with this refreshing sea green Silk saree featuring intricate embroidery work.", price: convertPrice(4045), originalPrice: convertPrice(5186), image: "https://kesimg.b-cdn.net/images/650/2026y/January/59800/Sea-Green-Silk-Occasional-Wear-Embroidery-Work-Saree-3689-6039-A(1).jpg", category: "Occasional Sarees", fabric: "Silk", color: "Sea Green", work: "Embroidery Work" },

  // ── SAREES (Casual) ──
  { id: "saree-030", handle: "silk-rani-pink-casual-sequins-saree", title: "Silk Rani Pink Casual Wear Sequins Saree", description: "Make every day special with this vibrant rani pink Silk saree featuring dazzling sequins work.", price: convertPrice(1895), originalPrice: convertPrice(2429), image: "https://kesimg.b-cdn.net/images/650/2026y/January/59798/Rani-Pink-Silk-Casual-Wear-Sequins-Work--Saree-3687-7575-C(1).jpg", category: "Casual Sarees", fabric: "Silk", color: "Rani Pink", work: "Sequins Work" },
  { id: "saree-031", handle: "silk-rust-orange-casual-sequins-saree", title: "Silk Rust Orange Casual Wear Sequins Saree", description: "Embrace earthy warmth with this stunning rust orange Silk saree adorned with shimmering sequins.", price: convertPrice(1895), originalPrice: convertPrice(2429), image: "https://kesimg.b-cdn.net/images/650/2026y/January/59798/Rust-Orange-Silk-Casual-Wear-Sequins-Work--Saree-3687-7575-B(1).jpg", category: "Casual Sarees", fabric: "Silk", color: "Rust Orange", work: "Sequins Work" },
  { id: "saree-032", handle: "silk-blue-casual-sequins-saree", title: "Silk Blue Casual Wear Sequins Saree", description: "Channel serene elegance with this beautiful blue Silk saree featuring sparkling sequins work.", price: convertPrice(1895), originalPrice: convertPrice(2429), image: "https://kesimg.b-cdn.net/images/650/2026y/January/59798/Blue-Silk-Casual-Wear-Sequins-Work--Saree-3687-7575-A(1).jpg", category: "Casual Sarees", fabric: "Silk", color: "Blue", work: "Sequins Work" },

  // ── SAREES (Festive - Banarasi) ──
  { id: "saree-033", handle: "banarasi-silk-mustard-festival-weaving-saree", title: "Banarasi Silk Mustard Festival Wear Weaving Saree", description: "Experience timeless Banarasi craftsmanship with this gorgeous mustard Silk saree featuring traditional weaving work.", price: convertPrice(1695), originalPrice: convertPrice(2201), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59780/Mustard-Banarasi-Silk-Festival-Wear-Weaving-Work-Saree-Lotus-F(1).jpg", category: "Festive Sarees", fabric: "Banarasi Silk", color: "Mustard", work: "Weaving Work" },
  { id: "saree-034", handle: "banarasi-silk-mint-green-festival-weaving-saree", title: "Banarasi Silk Mint Green Festival Wear Weaving Saree", description: "Embrace fresh elegance with this beautiful mint green Banarasi Silk saree featuring exquisite weaving work.", price: convertPrice(1695), originalPrice: convertPrice(2201), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59780/Mint-Green-Banarasi-Silk-Festival-Wear-Weaving-Work-Saree-Lotus-B(1).jpg", category: "Festive Sarees", fabric: "Banarasi Silk", color: "Mint Green", work: "Weaving Work" },
  { id: "saree-035", handle: "fendy-satin-teal-green-occasional-embroidery-saree", title: "Fendy Satin Teal Green Occasional Wear Embroidery Saree", description: "Make a sophisticated statement with this elegant teal green Fendy Satin saree featuring refined embroidery work.", price: convertPrice(1995), originalPrice: convertPrice(2625), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59779/Teal-Green-Fendy-Satin-Ocassional-Wear-Embroidery-Work-Saree-VT-815-T-C(1).jpg", category: "Occasional Sarees", fabric: "Fendy Satin", color: "Teal Green", work: "Embroidery Work" },

  // ── MENSWEAR (Groom Sherwanis) ──
  { id: "mens-001", handle: "grey-art-silk-groom-sherwani", title: "Grey Art Silk Groom Sherwani", description: "Command attention on your special day with this distinguished grey Art Silk sherwani featuring exquisite hand embroidery.", price: convertPrice(14295), originalPrice: convertPrice(19854), image: "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Grey-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4032(1).jpg", category: "Groom Sherwanis", fabric: "Art Silk", color: "Grey", work: "Hand Embroidery" },
  { id: "mens-002", handle: "purple-art-silk-groom-sherwani", title: "Purple Art Silk Groom Sherwani", description: "Make a bold statement with this regal purple Art Silk sherwani that channels royal heritage.", price: convertPrice(14295), originalPrice: convertPrice(19854), image: "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Purple-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4031(1).jpg", category: "Groom Sherwanis", fabric: "Art Silk", color: "Purple", work: "Hand Embroidery" },
  { id: "mens-003", handle: "off-white-art-silk-groom-sherwani", title: "Off White Art Silk Groom Sherwani", description: "Embrace timeless elegance with this pristine off-white Art Silk sherwani that represents purity and new beginnings.", price: convertPrice(14295), originalPrice: convertPrice(19854), image: "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Off-White-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4030(1).jpg", category: "Groom Sherwanis", fabric: "Art Silk", color: "Off White", work: "Hand Embroidery" },
  { id: "mens-008", handle: "maroon-banarasi-jacquard-sherwani", title: "Maroon Banarasi Jacquard Sherwani", description: "Embrace passionate elegance with this stunning maroon Banarasi Jacquard sherwani featuring exquisite hand embroidery.", price: convertPrice(28395), originalPrice: convertPrice(39438), image: "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Maroon-Banarasi-Jacquard-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4024(1).jpg", category: "Groom Sherwanis", fabric: "Banarasi Jacquard", color: "Maroon", work: "Hand Embroidery" },
  { id: "mens-024", handle: "pink-banarasi-jacquard-sherwani", title: "Pink Banarasi Jacquard Sherwani", description: "Embrace romantic elegance with this sophisticated pink Banarasi Jacquard sherwani.", price: convertPrice(25095), originalPrice: convertPrice(34854), image: "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Pink-Banarasi-Jacquard-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4021(1).jpg", category: "Groom Sherwanis", fabric: "Banarasi Jacquard", color: "Pink", work: "Hand Embroidery" },

  // ── MENSWEAR (Sherwanis) ──
  { id: "mens-019", handle: "navy-blue-velvet-sherwani", title: "Navy Blue Velvet Sherwani", description: "Command attention with this distinguished navy blue velvet sherwani that channels timeless sophistication.", price: convertPrice(13145), originalPrice: convertPrice(16853), image: "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Navy-Blue-Embosed-Velvet-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4151(1).jpg", category: "Sherwanis", fabric: "Velvet", color: "Navy Blue", work: "Embroidery" },
  { id: "mens-020", handle: "magenta-velvet-sherwani", title: "Magenta Velvet Sherwani", description: "Make a bold statement with this striking magenta velvet sherwani that brings vibrant energy to wedding celebrations.", price: convertPrice(13145), originalPrice: convertPrice(16853), image: "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Magenta-Embosed-Velvet-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4150(1).jpg", category: "Sherwanis", fabric: "Velvet", color: "Magenta", work: "Embroidery" },
  { id: "mens-021", handle: "black-velvet-sherwani", title: "Black Velvet Sherwani", description: "Embrace powerful sophistication with this striking black velvet sherwani.", price: convertPrice(11495), originalPrice: convertPrice(14737), image: "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Black-Embosed-Velvet-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4148(1).jpg", category: "Sherwanis", fabric: "Velvet", color: "Black", work: "Embroidery" },

  // ── SUITS (Anarkali) ──
  { id: "suit-001", handle: "red-silk-eid-anarkali-suit", title: "Red Silk Eid Anarkali Suit", description: "Celebrate in magnificent style with this stunning red silk Anarkali suit perfect for Eid celebrations and festive gatherings.", price: convertPrice(2445), originalPrice: convertPrice(3135), image: "https://kesimg.b-cdn.net/images/650/2026y/January/59797/RED-Silk-Eid-Wear-Embroidery-Work-Readymade-Anarkali-Suit-5554-681-B(1).jpg", category: "Anarkali Suits", fabric: "Silk", color: "Red", work: "Embroidery" },
  { id: "suit-002", handle: "green-silk-eid-anarkali-suit", title: "Green Silk Eid Anarkali Suit", description: "Embrace nature-inspired elegance with this beautiful green silk Anarkali suit designed for Eid and festive celebrations.", price: convertPrice(2445), originalPrice: convertPrice(3135), image: "https://kesimg.b-cdn.net/images/650/2026y/January/59797/Green-Silk-Eid-Wear-Embroidery-Work-Readymade-Anarkali-Suit-5554-681-A(1).jpg", category: "Anarkali Suits", fabric: "Silk", color: "Green", work: "Embroidery" },
  { id: "suit-003", handle: "dusty-rose-silk-party-anarkali", title: "Dusty Rose Silk Party Anarkali Suit", description: "Float through celebrations in this ethereal dusty rose silk Anarkali suit that embodies romantic elegance.", price: convertPrice(2095), originalPrice: convertPrice(2686), image: "https://kesimg.b-cdn.net/images/650/2026y/January/59793/Dusty-Rose-Silk-Party-Wear-Sequins-Work--Readymade-Anarkali-Suit-5964(1).jpg", category: "Anarkali Suits", fabric: "Silk", color: "Dusty Rose", work: "Sequins" },

  // ── SUITS (Sharara) ──
  { id: "chinnon-teal-001", handle: "teal-green-chinnon-silk-sharara-set", title: "Teal Green Chinnon Silk Sharara Set", description: "Embrace regal elegance with this stunning teal green Chinnon Silk sharara set featuring exquisite floral embroidery work.", price: convertPrice(3499), originalPrice: convertPrice(4999), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59774/Red-Chanderi-Cotton-Casual-Wear-Border-Work-Readymade-Anarkali-Suit-DN-539-B(1).jpg", category: "Sharara Suits", fabric: "Chinnon Silk", color: "Teal Green", work: "Embroidery" },
  { id: "chinnon-rust-001", handle: "rust-orange-chinnon-silk-sharara-set", title: "Rust Orange Chinnon Silk Sharara Set", description: "Radiate warmth and sophistication in this beautiful rust orange Chinnon Silk sharara set.", price: convertPrice(3499), originalPrice: convertPrice(4999), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59774/Champagne-Beige-Chanderi-Cotton-Casual-Wear-Border-Work-Readymade-Anarkali-Suit-DN-539-A(1).jpg", category: "Sharara Suits", fabric: "Chinnon Silk", color: "Rust Orange", work: "Embroidery" },
  { id: "chinnon-black-001", handle: "black-chinnon-silk-sharara-set", title: "Black Chinnon Silk Sharara Set", description: "Make a dramatic statement with this stunning black Chinnon Silk sharara set featuring intricate rose gold embroidery.", price: convertPrice(3499), originalPrice: convertPrice(4999), image: "https://kesimg.b-cdn.net/images/650/2025y/December/59743/Peach-Fendy-Silk-Casual-Wear-Sequins-Work-Readymade-Anarkali-Suit-Anshika-Vol-2-5519-6101-D(1).jpg", category: "Sharara Suits", fabric: "Chinnon Silk", color: "Black", work: "Embroidery" },
];

// ─── XML Escaping ────────────────────────────────────────────────────────
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ─── Generate XML Feed ───────────────────────────────────────────────────
function generateXML() {
  const items = products.map(p => {
    const link = `${SITE_URL}/product/${p.handle}`;
    const googleCategory = getGoogleCategory(p.category);
    const productType = getProductType(p.category);
    const gender = getGender(p.category);
    const priceUSD = `${p.price} USD`;
    const salePriceUSD = p.originalPrice > p.price ? `${p.price} USD` : '';
    const originalPriceUSD = p.originalPrice > p.price ? `${p.originalPrice} USD` : priceUSD;

    const enrichedDesc = enrichDescription(p.description, p.category, p.fabric, p.work);
    return `  <item>
    <g:id>${escapeXml(p.id)}</g:id>
    <g:title>${escapeXml(p.title)}</g:title>
    <g:description>${escapeXml(enrichedDesc)}</g:description>
    <g:link>${escapeXml(link)}</g:link>
    <g:image_link>${escapeXml(p.image)}</g:image_link>
    <g:availability>in_stock</g:availability>
    <g:price>${escapeXml(originalPriceUSD)}</g:price>
    ${salePriceUSD ? `<g:sale_price>${escapeXml(salePriceUSD)}</g:sale_price>` : ''}
    <g:condition>new</g:condition>
    <g:brand>${escapeXml(BRAND)}</g:brand>
    <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
    <g:product_type>${escapeXml(productType)}</g:product_type>
    <g:gender>${gender}</g:gender>
    <g:age_group>adult</g:age_group>
    <g:color>${escapeXml(p.color)}</g:color>
    <g:material>${escapeXml(p.fabric)}</g:material>
    <g:pattern>${escapeXml(p.work)}</g:pattern>
    <g:size_system>US</g:size_system>
    <g:identifier_exists>no</g:identifier_exists>
    <g:custom_label_0>${escapeXml(p.category)}</g:custom_label_0>
    <g:shipping>
      <g:country>US</g:country>
      <g:service>Standard</g:service>
      <g:price>0.00 USD</g:price>
    </g:shipping>
  </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${escapeXml(BRAND)} - Indian Ethnic Wear</title>
  <link>${SITE_URL}</link>
  <description>Shop premium Indian ethnic wear - bridal lehengas, wedding lehengas, sarees, sherwanis, and suits at ${BRAND}</description>
${items}
</channel>
</rss>`;
}

// ─── Generate TSV Feed ───────────────────────────────────────────────────
function generateTSV() {
  const headers = [
    'id', 'title', 'description', 'link', 'image_link', 'availability',
    'price', 'sale_price', 'condition', 'brand', 'google_product_category',
    'product_type', 'gender', 'age_group', 'color', 'material', 'pattern',
    'size_system', 'identifier_exists', 'custom_label_0', 'shipping'
  ];

  const tsvEscape = (str) => String(str || '').replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');

  const rows = products.map(p => {
    const link = `${SITE_URL}/product/${p.handle}`;
    const googleCategory = getGoogleCategory(p.category);
    const productType = getProductType(p.category);
    const gender = getGender(p.category);
    const originalPriceUSD = p.originalPrice > p.price ? `${p.originalPrice} USD` : `${p.price} USD`;
    const salePriceUSD = p.originalPrice > p.price ? `${p.price} USD` : '';

    const enrichedDesc = enrichDescription(p.description, p.category, p.fabric, p.work);
    return [
      tsvEscape(p.id),
      tsvEscape(p.title),
      tsvEscape(enrichedDesc),
      tsvEscape(link),
      tsvEscape(p.image),
      'in_stock',
      tsvEscape(originalPriceUSD),
      tsvEscape(salePriceUSD),
      'new',
      BRAND,
      tsvEscape(googleCategory),
      tsvEscape(productType),
      gender,
      'adult',
      tsvEscape(p.color),
      tsvEscape(p.fabric),
      tsvEscape(p.work),
      'US',
      'no',
      tsvEscape(p.category),
      'US:Standard:0.00 USD'
    ].join('\t');
  });

  return [headers.join('\t'), ...rows].join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────
const publicDir = path.join(__dirname, '..', 'public');

// Generate XML
const xml = generateXML();
fs.writeFileSync(path.join(publicDir, 'merchant-feed.xml'), xml, 'utf8');
console.log(`✅ Generated merchant-feed.xml with ${products.length} products`);

// Generate TSV
const tsv = generateTSV();
fs.writeFileSync(path.join(publicDir, 'merchant-feed.tsv'), tsv, 'utf8');
console.log(`✅ Generated merchant-feed.tsv with ${products.length} products`);

console.log('\n📋 Next steps for Google Merchant Center:');
console.log('  1. Go to Merchant Center → Products → Feeds');
console.log('  2. Check data source "PRODUCTS SOURCE 1" settings');
console.log('  3. Make sure the file format matches the feed URL:');
console.log('     - XML feed: https://luxemia.shop/merchant-feed.xml');
console.log('     - TSV feed: https://luxemia.shop/merchant-feed.tsv');
console.log('  4. If format is set to "TSV", use the .tsv URL');
console.log('  5. If format is set to "XML", use the .xml URL');
