#!/usr/bin/env node
/**
 * Generate Google Merchant Center XML feed v3
 * Fixes: Invalid google_product_category (use NUMERIC taxonomy IDs), Missing size (S/M/L/XL/XXL for apparel)
 * Run: node scripts/generate-merchant-feed-v2.cjs
 *
 * Google Product Taxonomy IDs (numeric - unambiguous, avoids apostrophe/encoding issues):
 *   1604 = Apparel & Accessories > Clothing
 *   2271 = Apparel & Accessories > Clothing > Dresses
 *   5424 = Apparel & Accessories > Clothing > Sarees & Blouses
 *   2104 = Apparel & Accessories > Clothing > Men's Clothing
 *   2195 = Apparel & Accessories > Clothing > Men's Clothing > Men's Suits
 *   2197 = Apparel & Accessories > Clothing > Men's Clothing > Men's Shirts & Tops
 *   188  = Apparel & Accessories > Jewelry
 *   193  = Apparel & Accessories > Jewelry > Necklaces
 *   194  = Apparel & Accessories > Jewelry > Earrings
 *   200  = Apparel & Accessories > Jewelry > Bracelets
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://luxemia.shop';
const BRAND = 'LuxeMia';
const convertPrice = (inrPrice) => Math.round(inrPrice * 0.012 * 2.5);

function getGoogleCategory(category, title) {
  const t = (title || '').toLowerCase();
  const cat = (category || '').toLowerCase();
  // Men's categories - use numeric IDs to avoid apostrophe mismatches
  if (cat.includes('men') || t.includes('sherwani') || t.includes('kurta pajama') || t.includes('groom wear')) {
    if (t.includes('sherwani')) return '2195'; // Men's Suits
    if (t.includes('kurta')) return '2197'; // Men's Shirts & Tops
    return '2104'; // Men's Clothing
  }
  if (cat.includes('lehenga')) return '2271'; // Dresses
  if (cat.includes('saree')) return '5424'; // Sarees & Blouses
  if (cat.includes('necklace')) return '193'; // Necklaces
  if (cat.includes('earring')) return '194'; // Earrings
  if (cat.includes('bangle') || cat.includes('bracelet')) return '200'; // Bracelets
  if (cat.includes('bridal set') || cat.includes('jewel')) return '188'; // Jewelry
  if (cat.includes('anarkali') || cat.includes('sharara') || cat.includes('palazzo') || cat.includes('salwar') || cat.includes('suit')) return '2271'; // Dresses
  return '1604'; // Clothing
}

function getGender(category, title) {
  const t = (title || '').toLowerCase();
  const cat = (category || '').toLowerCase();
  if (cat.includes('men') || t.includes('sherwani') || t.includes('kurta') || t.includes('groom wear')) return 'male';
  return 'female';
}

function forceJpeg(url) {
  if (!url) return url;
  if (url.includes('cdn.shopify.com') || url.includes('myshopify.com')) {
    let clean = url.replace(/[&?]format=\w+/g, '').replace(/[&?]width=\d+/g, '');
    return clean + '?width=1200&format=jpg';
  }
  if (url.includes('kesimg.b-cdn.net')) {
    if (!url.includes('format=')) return url + (url.includes('?') ? '&' : '?') + 'format=jpg';
    return url.replace(/format=\w+/, 'format=jpg');
  }
  return url;
}

function escapeXml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function getShippingBlocks() {
  const countries = [
    { code: 'US', stdPrice: '14.95', expPrice: '39.95' },
    { code: 'CA', stdPrice: '14.95', expPrice: '39.95' },
    { code: 'GB', stdPrice: '14.95', expPrice: '44.95' },
    { code: 'AE', stdPrice: '14.95', expPrice: '39.95' },
    { code: 'AU', stdPrice: '14.95', expPrice: '49.95' },
  ];
  return countries.map(c => `
    <g:shipping>
      <g:country>${c.code}</g:country>
      <g:service>Standard</g:service>
      <g:price>${c.stdPrice} USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>7</g:min_transit_time>
      <g:max_transit_time>10</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>${c.code}</g:country>
      <g:service>Express</g:service>
      <g:price>${c.expPrice} USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>3</g:min_transit_time>
      <g:max_transit_time>5</g:max_transit_time>
    </g:shipping>`).join('\n');
}

function enrichDescription(desc, category, fabric, work, color) {
  const cat = (category || '').toLowerCase();
  const isMenswear = cat.includes('sherwani') || cat.includes('kurta') || cat.includes('menswear');
  const sizeInfo = isMenswear
    ? 'Available in chest sizes 36-44 inches.'
    : 'Available in sizes S, M, L, XL, XXL. Custom tailoring available on request.';
  let e = desc + ' Fabric: ' + (fabric||'Quality') + '. Work: ' + (work||'Handcrafted') + '.';
  if (color) e += ' Color: ' + color + '.';
  e += ' ' + sizeInfo;
  e += ' Care: Dry clean only. Shipping: Flat rate $14.95 per item worldwide. Free shipping on orders over $300. Dispatch: 3-5 business days (readymade), 5-7 business days (custom). Delivery: 3-5 business days via DHL Express, 7-10 business days via USPS/UPS.';
  return e.trim();
}

// ═══════════════════════════════════════════
// ALL PRODUCTS - synced with src/data/ files
// ═══════════════════════════════════════════
const P = (id, handle, title, desc, inrPrice, inrOrig, img, cat, fabric, color, work, sizes) =>
  ({ id, handle, title, description: desc, price: convertPrice(inrPrice), originalPrice: convertPrice(inrOrig), image: img, category: cat, fabric, color, work, sizes });

const products = [
  // ── BRIDAL LEHENGAS ──
  P('bridal-001','ethereal-pastel-pink-bridal-lehenga','Ethereal Pastel Pink Bridal Lehenga','Step into your fairy tale in this breathtaking pastel pink bridal design made with Pure Net fabric showcasing extraordinary heavy work embroidery.',15895,22076,'https://kesimg.b-cdn.net/images/650/2025y/December/59570/Pastel-Pink-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10243(1).jpg','Bridal Lehengas','Pure Net','Pastel Pink','Heavy Embroidery',['S','M','L','XL']),
  P('bridal-002','royal-rani-pink-silk-bridal-lehenga','Royal Rani Pink Silk Bridal Lehenga','Embrace the timeless grandeur of Indian bridal tradition with this magnificent Rani Pink silk lehenga woven from Banarasi silk.',24295,34218,'https://kesimg.b-cdn.net/images/650/2025y/December/59645/Rani-Pink-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-A(1).jpg','Bridal Lehengas','Silk','Rani Pink','Heavy Work',['S','M','L','XL']),
  P('bridal-003','classic-bridal-red-silk-lehenga','Classic Bridal Red Silk Lehenga','The quintessential bridal red that has adorned generations of brides. This silk lehenga is a testament to the enduring appeal of traditional craftsmanship.',24295,34218,'https://kesimg.b-cdn.net/images/650/2025y/December/59645/Red-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-B(1).jpg','Bridal Lehengas','Silk','Red','Heavy Work',['S','M','L','XL']),
  P('bridal-004','ivory-dreamscape-net-bridal-lehenga','Ivory Dreamscape Net Bridal Lehenga','For the modern bride who dares to redefine tradition. This pristine ivory Heavy Net lehenga features sequins and embroidery work.',12895,17664,'https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(1).jpg','Bridal Lehengas','Heavy Net','Ivory','Sequins Embroidery',['S','M','L','XL']),
  P('bridal-005','lavender-mist-bridal-lehenga','Lavender Mist Bridal Lehenga','A contemporary design that breaks the traditional color boundaries while maintaining the elegance expected of bridal wear.',12695,17632,'https://kesimg.b-cdn.net/images/650/2025y/December/59570/Lavender-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10242(1).jpg','Bridal Lehengas','Pure Net','Lavender','Heavy Work',['S','M','L','XL']),
  P('bridal-006','metallic-silver-celebration-lehenga','Metallic Silver Celebration Lehenga','Make an unforgettable entrance in this stunning metallic silver Pure Net lehenga that commands attention and admiration.',13995,19438,'https://kesimg.b-cdn.net/images/650/2025y/December/59570/Metalic-Silver-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10245(1).jpg','Bridal Lehengas','Pure Net','Silver','Heavy Work',['S','M','L','XL']),

  // ── WEDDING LEHENGAS ──
  P('wedding-001','burgundy-velvet-wedding-lehenga','Burgundy Velvet Wedding Lehenga','Embrace regal sophistication with this sumptuous burgundy Net lehenga that embodies the warm elegance of winter celebrations.',8995,12155,'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Burgundy-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-A(1).jpg','Wedding Lehengas','Net','Burgundy','Heavy Work',['S','M','L','XL']),
  P('wedding-002','wine-romance-net-lehenga','Wine Romance Net Lehenga','Fall in love with this intoxicating wine-colored Net lehenga that exudes romance and sophistication.',8995,12155,'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Wine-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-B(1).jpg','Wedding Lehengas','Net','Wine','Heavy Work',['S','M','L','XL']),
  P('wedding-003','emerald-forest-wedding-lehenga','Emerald Forest Wedding Lehenga','Channel the mystique of enchanted forests with this breathtaking emerald green Net lehenga.',9495,13189,'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Green-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-C(1).jpg','Wedding Lehengas','Net','Emerald Green','Heavy Work',['S','M','L','XL']),
  P('wedding-004','royal-blue-celebration-lehenga','Royal Blue Celebration Lehenga','Make a statement of confidence and elegance with this commanding royal blue Net lehenga.',9495,13189,'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Blue-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-D(1).jpg','Wedding Lehengas','Net','Royal Blue','Heavy Work',['S','M','L','XL']),
  P('wedding-005','coral-sunset-net-lehenga','Coral Sunset Net Lehenga','Capture the warmth of a perfect sunset with this stunning coral Net lehenga.',8795,12216,'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Coral-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-E(1).jpg','Wedding Lehengas','Net','Coral','Heavy Work',['S','M','L','XL']),
  P('wedding-006','powder-pink-wedding-lehenga','Powder Pink Wedding Lehenga','Whisper romance with this delicate powder pink Net lehenga.',9295,12911,'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Pink-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-F(1).jpg','Wedding Lehengas','Net','Powder Pink','Heavy Work',['S','M','L','XL']),

  // ── PARTY LEHENGAS ──
  P('party-001','blush-georgette-party-lehenga','Blush Georgette Party Lehenga','Float through celebrations in this enchanting blush Georgette lehenga.',5995,8327,'https://kesimg.b-cdn.net/images/650/2025y/December/59622/Blush-Pink-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3504(1).jpg','Party Lehengas','Georgette','Blush Pink','Sequins Work',['S','M','L','XL']),
  P('party-002','mint-sequin-party-lehenga','Mint Sequin Party Lehenga','Make a fresh statement with this stunning mint Georgette lehenga.',6295,8744,'https://kesimg.b-cdn.net/images/650/2025y/December/59622/Mint-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3505(1).jpg','Party Lehengas','Georgette','Mint','Sequins Work',['S','M','L','XL']),
  P('party-003','champagne-gold-party-lehenga','Champagne Gold Party Lehenga','Toast to elegance with this sophisticated champagne gold Georgette lehenga.',6795,9438,'https://kesimg.b-cdn.net/images/650/2025y/December/59622/Gold-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3506(1).jpg','Party Lehengas','Georgette','Champagne Gold','Sequins Work',['S','M','L','XL']),
  P('party-004','navy-blue-party-lehenga','Navy Blue Party Lehenga','Command the room with this sophisticated navy blue Georgette lehenga.',6495,9021,'https://kesimg.b-cdn.net/images/650/2025y/December/59622/Navy-Blue-Georgette-Party-Wear-Sequins-Work-Lehenga-Choli-Miss-India-Vol-5-3504-3507(1).jpg','Party Lehengas','Georgette','Navy Blue','Sequins Work',['S','M','L','XL']),

  // ── FESTIVE LEHENGAS ──
  P('festive-001','marigold-yellow-festive-lehenga','Marigold Yellow Festive Lehenga','Embrace the spirit of Indian festivals with this vibrant marigold yellow Chinnon lehenga.',4995,6938,'https://kesimg.b-cdn.net/images/650/2025y/December/59616/Yellow-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-H(1).jpg','Festive Lehengas','Chinnon','Yellow','Embroidery',['S','M','L','XL']),
  P('festive-002','saffron-orange-festive-lehenga','Saffron Orange Festive Lehenga','Celebrate with sacred energy in this stunning saffron orange Chinnon lehenga.',5295,7355,'https://kesimg.b-cdn.net/images/650/2025y/December/59616/Orange-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-G(1).jpg','Festive Lehengas','Chinnon','Orange','Embroidery',['S','M','L','XL']),
  P('festive-003','peacock-green-festive-lehenga','Peacock Green Festive Lehenga','Channel the majestic beauty with this stunning peacock green Chinnon lehenga.',5495,7632,'https://kesimg.b-cdn.net/images/650/2025y/December/59616/Teal-Green-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-F(1).jpg','Festive Lehengas','Chinnon','Peacock Green','Embroidery',['S','M','L','XL']),
  P('festive-004','ruby-red-festive-lehenga','Ruby Red Festive Lehenga','Shine with the brilliance of precious gems in this magnificent ruby red Chinnon lehenga.',5695,7910,'https://kesimg.b-cdn.net/images/650/2025y/December/59616/Red-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-E(1).jpg','Festive Lehengas','Chinnon','Ruby Red','Embroidery',['S','M','L','XL']),
  P('festive-005','dusty-rose-festive-lehenga','Dusty Rose Festive Lehenga','Embrace soft romance with this enchanting dusty rose Chinnon lehenga.',4795,6660,'https://kesimg.b-cdn.net/images/650/2025y/December/59616/Dusty-Rose-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-D(1).jpg','Festive Lehengas','Chinnon','Dusty Rose','Embroidery',['S','M','L','XL']),
  P('festive-006','royal-purple-festive-lehenga','Royal Purple Festive Lehenga','Channel regal elegance with this stunning royal purple Chinnon lehenga.',5395,7493,'https://kesimg.b-cdn.net/images/650/2025y/December/59616/Purple-Chinnon-Festival-Wear-Embroidery-Work-Lehenga-Choli-SSF-5004-C(1).jpg','Festive Lehengas','Chinnon','Royal Purple','Embroidery',['S','M','L','XL']),

  // ── DESIGNER LEHENGAS ──
  P('designer-001','heavy-silk-yellow-mirror-work-lehenga','Heavy Silk Yellow Mirror Work Lehenga','A radiant design that captures the essence of sunshine celebrations with elaborate mirror work.',10995*3,15062*3,'https://kesimg.b-cdn.net/images/650/2025y/December/59605/Yellow-Heavy-Silk-Party-Wear-Mirror-Work-Lehenga-Choli-Alizeh---Mirror-Maze--3612-1015(1).jpg','Designer Lehengas','Heavy Silk','Yellow','Mirror Work',['S','M','L','XL']),
  P('designer-002','heavy-silk-beige-mirror-work-lehenga','Heavy Silk Beige Mirror Work Lehenga','Understated elegance meets quality construction in this sophisticated beige Heavy Silk lehenga.',10995*3,15062*3,'https://kesimg.b-cdn.net/images/650/2025y/December/59605/Beige-Heavy-Silk-Party-Wear-Mirror-Work-Lehenga-Choli-Alizeh---Mirror-Maze--3612-1013-A(1).jpg','Designer Lehengas','Heavy Silk','Beige','Mirror Work',['S','M','L','XL']),
  P('designer-003','heavy-silk-sky-blue-mirror-work-lehenga','Heavy Silk Sky Blue Mirror Work Lehenga','Capture the serenity of clear horizons with this breathtaking sky blue Heavy Silk lehenga.',10995*3,15062*3,'https://kesimg.b-cdn.net/images/650/2025y/December/59605/Sky-Blue-Heavy-Silk-Party-Wear-Mirror-Work-Lehenga-Choli-Alizeh---Mirror-Maze--3612-1012-A(1).jpg','Designer Lehengas','Heavy Silk','Sky Blue','Mirror Work',['S','M','L','XL']),
  P('designer-004','heavy-silk-dusty-pink-mirror-work-lehenga','Heavy Silk Dusty Pink Mirror Work Lehenga','Romance personified in this dreamy dusty pink Heavy Silk lehenga with mirror work.',10995*3,15062*3,'https://kesimg.b-cdn.net/images/650/2025y/December/59605/Dusty-Pink-Heavy-Silk-Party-Wear-Mirror-Work-Lehenga-Choli-Alizeh---Mirror-Maze--3612-1012(1).jpg','Designer Lehengas','Heavy Silk','Dusty Pink','Mirror Work',['S','M','L','XL']),
  P('designer-005','organza-lavender-bridal-heavy-work-lehenga','Organza Lavender Bridal Heavy Work Lehenga','Step into ethereal elegance with this enchanting lavender Organza bridal lehenga.',11295*3,15908*3,'https://kesimg.b-cdn.net/images/650/2025y/November/59368/Lavender-Organza-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-Aarohi-3474-2918-F(1).jpg','Designer Lehengas','Organza','Lavender','Heavy Work',['S','M','L','XL']),
  P('designer-006','organza-red-bridal-heavy-work-lehenga','Organza Red Bridal Heavy Work Lehenga','The timeless allure of bridal red reimagined in Organza fabric with intensive heavy work.',11295*3,15908*3,'https://kesimg.b-cdn.net/images/650/2025y/November/59368/Red-Organza-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-Aarohi-3474-2918-E(1).jpg','Designer Lehengas','Organza','Red','Heavy Work',['S','M','L','XL']),

  // ── WEDDING SAREES ──
  P('saree-001','mint-green-kanchipuram-silk-wedding-saree','Mint Green Kanchipuram Silk Wedding Saree','Experience the grandeur of South Indian tradition with this mint green Kanchipuram-inspired Viscose Silk saree.',12195,16938,'https://kesimg.b-cdn.net/images/650/2025y/December/59744/Mint-Green-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176-B(1).jpg','Wedding Sarees','Viscose Silk','Mint Green','Weaving Work',['S','M','L','XL']),
  P('saree-002','royal-pink-kanchipuram-silk-wedding-saree','Royal Pink Kanchipuram Silk Wedding Saree','A celebration of feminine grace in royal pink, this Viscose Silk saree channels Kanchipuram traditions.',12195,16938,'https://kesimg.b-cdn.net/images/650/2025y/December/59744/Pink-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176(1).jpg','Wedding Sarees','Viscose Silk','Pink','Weaving Work',['S','M','L','XL']),
  P('saree-003','ivory-beige-kanchipuram-silk-wedding-saree','Ivory Beige Kanchipuram Silk Wedding Saree','Understated elegance in this sophisticated ivory beige Viscose Silk saree.',11545,16035,'https://kesimg.b-cdn.net/images/650/2025y/December/59744/Beige-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3164(1).jpg','Wedding Sarees','Viscose Silk','Beige','Weaving Work',['S','M','L','XL']),
  P('saree-004','multicolor-kanchipuram-silk-wedding-saree','Multicolor Kanchipuram Silk Wedding Saree','A vibrant celebration of color and craftsmanship, this multicolor Viscose Silk saree.',11845,16451,'https://kesimg.b-cdn.net/images/650/2025y/December/59744/Multi-Color-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3133-B(1).jpg','Wedding Sarees','Viscose Silk','Multi Color','Weaving Work',['S','M','L','XL']),
  P('saree-005','antique-gold-kanchipuram-silk-wedding-saree','Antique Gold Kanchipuram Silk Wedding Saree','Capture the essence of royal opulence with this magnificent antique gold Viscose Silk saree.',11545,16035,'https://kesimg.b-cdn.net/images/650/2025y/December/59744/Gold-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3131(1).jpg','Wedding Sarees','Viscose Silk','Gold','Weaving Work',['S','M','L','XL']),
  P('saree-006','beige-gold-tissue-silk-wedding-saree','Beige Gold Tissue Silk Wedding Saree','Ethereal beauty meets everyday luxury in this stunning beige gold PV Tissue Silk saree.',2645,3574,'https://kesimg.b-cdn.net/images/650/2025y/December/59728/Beige-Gold-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4298(1).jpg','Wedding Sarees','Tissue Silk','Beige Gold','Weaving Work',['S','M','L','XL']),
  P('saree-007','pink-tissue-silk-wedding-saree','Pink Tissue Silk Wedding Saree','Romance blooms in this delicate pink PV Tissue Silk saree.',2645,3574,'https://kesimg.b-cdn.net/images/650/2025y/December/59728/Pink-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4297(1).jpg','Wedding Sarees','Tissue Silk','Pink','Weaving Work',['S','M','L','XL']),
  P('saree-008','sea-green-tissue-silk-wedding-saree','Sea Green Tissue Silk Wedding Saree','Transport yourself to serene coastal beauty with this refreshing sea green PV Tissue Silk saree.',2645,3574,'https://kesimg.b-cdn.net/images/650/2025y/December/59728/Sea-Green-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4296(1).jpg','Wedding Sarees','Tissue Silk','Sea Green','Weaving Work',['S','M','L','XL']),
  P('saree-009','sunset-orange-tissue-silk-wedding-saree','Sunset Orange Tissue Silk Wedding Saree','Embrace the warmth with this vibrant orange PV Tissue Silk saree.',2645,3574,'https://kesimg.b-cdn.net/images/650/2025y/December/59728/Orange-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4295(1).jpg','Wedding Sarees','Tissue Silk','Orange','Weaving Work',['S','M','L','XL']),
  P('saree-010','lavender-tissue-silk-wedding-saree','Lavender Tissue Silk Wedding Saree','Dream in lavender with this enchanting PV Tissue Silk saree.',2645,3574,'https://kesimg.b-cdn.net/images/650/2025y/December/59728/Lavender-PV-Tissue-Silk-Wedding-Wear-Weaving-Work-Saree-Kreshva-Mangalsutra--3667-K-4294(1).jpg','Wedding Sarees','Tissue Silk','Lavender','Weaving Work',['S','M','L','XL']),

  // ── PARTY SAREES ──
  P('saree-011','royal-blue-georgette-party-saree','Royal Blue Georgette Party Saree','Command attention in this stunning royal blue Georgette saree featuring intricate sequins work.',3495,4855,'https://kesimg.b-cdn.net/images/650/2025y/December/59720/Blue-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4287(1).jpg','Party Sarees','Georgette','Royal Blue','Sequins Work',['S','M','L','XL']),
  P('saree-012','wine-georgette-party-saree','Wine Georgette Party Saree','Embrace sophisticated glamour with this intoxicating wine Georgette saree.',3495,4855,'https://kesimg.b-cdn.net/images/650/2025y/December/59720/Wine-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4286(1).jpg','Party Sarees','Georgette','Wine','Sequins Work',['S','M','L','XL']),
  P('saree-013','emerald-green-georgette-party-saree','Emerald Green Georgette Party Saree','Channel natural elegance with this stunning emerald green Georgette saree.',3495,4855,'https://kesimg.b-cdn.net/images/650/2025y/December/59720/Green-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4285(1).jpg','Party Sarees','Georgette','Emerald Green','Sequins Work',['S','M','L','XL']),
  P('saree-014','dusty-rose-georgette-party-saree','Dusty Rose Georgette Party Saree','Whisper romance with this enchanting dusty rose Georgette saree.',3295,4576,'https://kesimg.b-cdn.net/images/650/2025y/December/59720/Dusty-Rose-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4284(1).jpg','Party Sarees','Georgette','Dusty Rose','Sequins Work',['S','M','L','XL']),
  P('saree-015','black-georgette-party-saree','Black Georgette Party Saree','Make a bold statement with this striking black Georgette saree.',3495,4855,'https://kesimg.b-cdn.net/images/650/2025y/December/59720/Black-Georgette-Party-Wear-Sequins-Work-Saree-Nirmala-Vol-7-3668-K-4283(1).jpg','Party Sarees','Georgette','Black','Sequins Work',['S','M','L','XL']),

  // ── FESTIVE SAREES ──
  P('saree-021','magenta-art-silk-festive-saree','Magenta Art Silk Festive Saree','Celebrate with vibrant energy in this stunning magenta Art Silk saree.',2995,4160,'https://kesimg.b-cdn.net/images/650/2025y/December/59708/Magenta-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4277(1).jpg','Festive Sarees','Art Silk','Magenta','Weaving Work',['S','M','L','XL']),
  P('saree-022','teal-green-art-silk-festive-saree','Teal Green Art Silk Festive Saree','Channel royal elegance with this stunning teal green Art Silk saree.',2995,4160,'https://kesimg.b-cdn.net/images/650/2025y/December/59708/Teal-Green-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4276(1).jpg','Festive Sarees','Art Silk','Teal Green','Weaving Work',['S','M','L','XL']),
  P('saree-023','maroon-art-silk-festive-saree','Maroon Art Silk Festive Saree','Embrace traditional elegance with this rich maroon Art Silk saree.',2995,4160,'https://kesimg.b-cdn.net/images/650/2025y/December/59708/Maroon-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4275(1).jpg','Festive Sarees','Art Silk','Maroon','Weaving Work',['S','M','L','XL']),
  P('saree-024','mustard-yellow-art-silk-festive-saree','Mustard Yellow Art Silk Festive Saree','Radiate warmth with this vibrant mustard yellow Art Silk saree.',2995,4160,'https://kesimg.b-cdn.net/images/650/2025y/December/59708/Mustard-Yellow-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4274(1).jpg','Festive Sarees','Art Silk','Mustard Yellow','Weaving Work',['S','M','L','XL']),
  P('saree-025','royal-purple-art-silk-festive-saree','Royal Purple Art Silk Festive Saree','Channel regal elegance with this stunning royal purple Art Silk saree.',2995,4160,'https://kesimg.b-cdn.net/images/650/2025y/December/59708/Purple-Art-Silk-Festival-Wear-Weaving-Work-Saree-Nirmala-Vol-6-3665-K-4273(1).jpg','Festive Sarees','Art Silk','Royal Purple','Weaving Work',['S','M','L','XL']),

  // ── OCCASIONAL & CASUAL SAREES ──
  P('saree-026','silk-yellow-occasional-embroidery-saree','Silk Yellow Occasional Wear Embroidery Saree','Radiate sunshine elegance with this stunning yellow Silk saree.',4045,5186,'https://kesimg.b-cdn.net/images/650/2026y/January/59800/Yellow-Silk-Occasional-Wear-Embroidery-Work-Saree-3689-6039-D(1).jpg','Occasional Sarees','Silk','Yellow','Embroidery Work',['S','M','L','XL']),
  P('saree-027','silk-light-pink-occasional-embroidery-saree','Silk Light Pink Occasional Wear Embroidery Saree','Embrace soft femininity with this beautiful light pink Silk saree.',4045,5186,'https://kesimg.b-cdn.net/images/650/2026y/January/59800/Light-Pink-Silk-Occasional-Wear-Embroidery-Work-Saree-3689-6039-C(1).jpg','Occasional Sarees','Silk','Light Pink','Embroidery Work',['S','M','L','XL']),
  P('saree-028','silk-green-occasional-embroidery-saree','Silk Green Occasional Wear Embroidery Saree','Channel natural elegance with this lush green Silk saree.',4045,5186,'https://kesimg.b-cdn.net/images/650/2026y/January/59800/Green-Silk-Occasional-Wear-Embroidery-Work-Saree-3689-6039-B(1).jpg','Occasional Sarees','Silk','Green','Embroidery Work',['S','M','L','XL']),
  P('saree-029','silk-sea-green-occasional-embroidery-saree','Silk Sea Green Occasional Wear Embroidery Saree','Experience coastal serenity with this refreshing sea green Silk saree.',4045,5186,'https://kesimg.b-cdn.net/images/650/2026y/January/59800/Sea-Green-Silk-Occasional-Wear-Embroidery-Work-Saree-3689-6039-A(1).jpg','Occasional Sarees','Silk','Sea Green','Embroidery Work',['S','M','L','XL']),
  P('saree-030','silk-rani-pink-casual-sequins-saree','Silk Rani Pink Casual Wear Sequins Saree','Make every day special with this vibrant rani pink Silk saree.',1895,2429,'https://kesimg.b-cdn.net/images/650/2026y/January/59798/Rani-Pink-Silk-Casual-Wear-Sequins-Work--Saree-3687-7575-C(1).jpg','Casual Sarees','Silk','Rani Pink','Sequins Work',['S','M','L','XL']),
  P('saree-031','silk-rust-orange-casual-sequins-saree','Silk Rust Orange Casual Wear Sequins Saree','Embrace earthy warmth with this stunning rust orange Silk saree.',1895,2429,'https://kesimg.b-cdn.net/images/650/2026y/January/59798/Rust-Orange-Silk-Casual-Wear-Sequins-Work--Saree-3687-7575-B(1).jpg','Casual Sarees','Silk','Rust Orange','Sequins Work',['S','M','L','XL']),
  P('saree-032','silk-blue-casual-sequins-saree','Silk Blue Casual Wear Sequins Saree','Channel serene elegance with this beautiful blue Silk saree.',1895,2429,'https://kesimg.b-cdn.net/images/650/2026y/January/59798/Blue-Silk-Casual-Wear-Sequins-Work--Saree-3687-7575-A(1).jpg','Casual Sarees','Silk','Blue','Sequins Work',['S','M','L','XL']),

  // ── GROOM SHERWANIS ──
  P('mens-001','grey-art-silk-groom-sherwani','Grey Art Silk Groom Sherwani','Command attention on your special day with this distinguished grey Art Silk sherwani.',14295,19854,'https://kesimg.b-cdn.net/images/650/2025y/October/59064/Grey-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4032(1).jpg','Groom Sherwanis','Art Silk','Grey','Hand Embroidery',['36','38','40','42','44']),
  P('mens-002','purple-art-silk-groom-sherwani','Purple Art Silk Groom Sherwani','Make a bold statement with this regal purple Art Silk sherwani.',14295,19854,'https://kesimg.b-cdn.net/images/650/2025y/October/59064/Purple-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4031(1).jpg','Groom Sherwanis','Art Silk','Purple','Hand Embroidery',['36','38','40','42','44']),
  P('mens-003','off-white-art-silk-groom-sherwani','Off White Art Silk Groom Sherwani','Embrace timeless elegance with this pristine off-white Art Silk sherwani.',14295,19854,'https://kesimg.b-cdn.net/images/650/2025y/October/59064/Off-White-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4030(1).jpg','Groom Sherwanis','Art Silk','Off White','Hand Embroidery',['36','38','40','42','44']),
  P('mens-004','light-pink-art-silk-groom-sherwani','Light Pink Art Silk Groom Sherwani','Break convention with this sophisticated light pink Art Silk sherwani.',11695,16243,'https://kesimg.b-cdn.net/images/650/2025y/October/59064/Light-Pink-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4029(1).jpg','Groom Sherwanis','Art Silk','Light Pink','Hand Embroidery',['36','38','40','42','44']),
  P('mens-005','white-art-silk-groom-sherwani','White Art Silk Groom Sherwani','Embrace pure elegance with this classic white Art Silk sherwani.',11695,16243,'https://kesimg.b-cdn.net/images/650/2025y/October/59064/White-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4028(1).jpg','Groom Sherwanis','Art Silk','White','Hand Embroidery',['36','38','40','42','44']),
  P('mens-006','black-banarasi-jacquard-sherwani','Black Banarasi Jacquard Sherwani','Make a powerful statement with this striking black Banarasi Jacquard sherwani.',11695,16243,'https://kesimg.b-cdn.net/images/650/2025y/October/59064/Black-Banarasi-Jacquard-Wedding-Wear-Neck-Work-Readymade-Groom-Sherwani-4026(1).jpg','Groom Sherwanis','Banarasi Jacquard','Black','Neck Work',['36','38','40','42','44']),
  P('mens-007','blue-banarasi-jacquard-sherwani','Blue Banarasi Jacquard Sherwani','Channel royal elegance with this distinguished blue Banarasi Jacquard sherwani.',11695,16243,'https://kesimg.b-cdn.net/images/650/2025y/October/59064/Blue-Banarasi-Jacquard-Wedding-Wear-Neck-Work-Readymade-Groom-Sherwani-4025(1).jpg','Groom Sherwanis','Banarasi Jacquard','Blue','Neck Work',['36','38','40','42','44']),
  P('mens-008','maroon-banarasi-jacquard-sherwani','Maroon Banarasi Jacquard Sherwani','Embrace passionate elegance with this stunning maroon Banarasi Jacquard sherwani.',28395,39438,'https://kesimg.b-cdn.net/images/650/2025y/October/59064/Maroon-Banarasi-Jacquard-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4024(1).jpg','Groom Sherwanis','Banarasi Jacquard','Maroon','Hand Embroidery',['36','38','40','42','44']),
  P('mens-009','mustard-banarasi-jacquard-sherwani','Mustard Banarasi Jacquard Sherwani','Stand out with distinction in this striking mustard Banarasi Jacquard sherwani.',30095,41799,'https://kesimg.b-cdn.net/images/650/2025y/October/59064/Mustard-Banarasi-Jacquard-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4023(1).jpg','Groom Sherwanis','Banarasi Jacquard','Mustard','Hand Embroidery',['36','38','40','42','44']),
  P('mens-010','peach-banarasi-jacquard-sherwani','Peach Banarasi Jacquard Sherwani','Embrace romantic elegance with this sophisticated peach Banarasi Jacquard sherwani.',28395,39438,'https://kesimg.b-cdn.net/images/650/2025y/October/59064/Peach-Banarasi-Jacquard-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4022(1).jpg','Groom Sherwanis','Banarasi Jacquard','Peach','Hand Embroidery',['36','38','40','42','44']),
  P('mens-024','pink-banarasi-jacquard-sherwani','Pink Banarasi Jacquard Sherwani','Embrace romantic elegance with this sophisticated pink Banarasi Jacquard sherwani.',25095,34854,'https://kesimg.b-cdn.net/images/650/2025y/October/59064/Pink-Banarasi-Jacquard-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4021(1).jpg','Groom Sherwanis','Banarasi Jacquard','Pink','Hand Embroidery',['36','38','40','42','44']),

  // ── KURTA PAJAMAS ──
  P('mens-011','baby-pink-cotton-kurta-pajama','Baby Pink Cotton Kurta Pajama Set','Embrace comfort and style with this charming baby pink cotton kurta pajama set.',3295,4453,'https://kesimg.b-cdn.net/images/650/2025y/December/59783/Baby-Pink-Cotton-Ocassional-Wear-Printed-Work-Readymade-Kurta-Pajama-Combo-Set-(32-to-52-Size-and-1-to-14-Size-1223(1).jpg','Kurta Pajamas','Cotton','Baby Pink','Printed',['36','38','40','42','44']),
  P('mens-012','blue-cotton-kurta-pajama','Blue Cotton Kurta Pajama Set','Experience timeless versatility with this classic blue cotton kurta pajama set.',2745,3709,'https://kesimg.b-cdn.net/images/650/2025y/December/59783/Blue-Cotton-Ocassional-Wear-Printed-Work-Readymade-Kurta-Pajama-Combo-Set-(32-to-52-Size-and-1-to-14-Size-1222(1).jpg','Kurta Pajamas','Cotton','Blue','Printed',['36','38','40','42','44']),
  P('mens-013','white-viscose-kurta-pajama','White Viscose Kurta Pajama Set','Embrace pure elegance with this pristine white viscose kurta pajama set.',3945,5331,'https://kesimg.b-cdn.net/images/650/2025y/December/59783/White-Viscose-Ocassional-Wear-Printed-Work-Readymade-Kurta-Pajama-Combo-Set-(32-to-52-Size-and-1-to-14-Size-1221(1).jpg','Kurta Pajamas','Viscose','White','Printed',['36','38','40','42','44']),
  P('mens-014','beige-cotton-kurta-pajama','Beige Cotton Kurta Pajama Set','Experience understated sophistication with this elegant beige cotton kurta pajama set.',3645,4926,'https://kesimg.b-cdn.net/images/650/2025y/December/59783/Beige-Cotton-Ocassional-Wear-Printed-Work-Readymade-Kurta-Pajama-Combo-Set-(32-to-52-Size-and-1-to-14-Size-1220(1).jpg','Kurta Pajamas','Cotton','Beige','Printed',['36','38','40','42','44']),
  P('mens-015','black-cotton-kurta-pajama','Black Cotton Kurta Pajama Set','Make a bold statement with this striking black cotton kurta pajama set.',3495,4723,'https://kesimg.b-cdn.net/images/650/2025y/December/59783/Black-Mulberry-Butti-Ocassional-Wear-Printed-Work-Readymade-Kurta-Pajama-Combo-Set-(32-to-52-Size-and-1-to-14-Size-1218(1).jpg','Kurta Pajamas','Cotton','Black','Printed',['36','38','40','42','44']),
  P('mens-016','yellow-cotton-kurta-pajama','Yellow Cotton Kurta Pajama Set','Celebrate joy and prosperity with this vibrant yellow cotton kurta pajama set.',2645,3574,'https://kesimg.b-cdn.net/images/650/2025y/December/59783/Yellow-Cotton-Ocassional-Wear-Printed-Work-Readymade-Kurta-Pajama-Combo-Set-(32-to-52-Size-and-1-to-14-Size-1208(1).jpg','Kurta Pajamas','Cotton','Yellow','Printed',['36','38','40','42','44']),
  P('mens-017','teal-blue-cotton-kurta-pajama','Teal Blue Cotton Kurta Pajama Set','Experience refined sophistication with this elegant teal blue cotton kurta pajama set.',2445,3304,'https://kesimg.b-cdn.net/images/650/2025y/December/59783/Teal-Blue-Cotton-Ocassional-Wear-Printed-Work-Readymade-Kurta-Pajama-Combo-Set-(32-to-52-Size-and-1-to-14-Size-1214(1).jpg','Kurta Pajamas','Cotton','Teal Blue','Printed',['36','38','40','42','44']),
  P('mens-018','brown-silk-kurta-pajama','Brown Silk Kurta Pajama Set','Embrace earthy elegance with this distinguished brown silk kurta pajama set.',2545,3439,'https://kesimg.b-cdn.net/images/650/2025y/December/59783/Brown-Silk-Ocassional-Wear-Printed-Work-Readymade-Kurta-Pajama-Combo-Set-(32-to-52-Size-and-1-to-14-Size-1206(1).jpg','Kurta Pajamas','Silk','Brown','Printed',['36','38','40','42','44']),

  // ── VELVET & ART SILK SHERWANIS ──
  P('mens-019','navy-blue-velvet-sherwani','Navy Blue Velvet Sherwani','Command attention with this distinguished navy blue velvet sherwani.',13145,16853,'https://kesimg.b-cdn.net/images/650/2025y/October/58974/Navy-Blue-Embosed-Velvet-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4151(1).jpg','Sherwanis','Velvet','Navy Blue','Embroidery',['36','38','40','42','44']),
  P('mens-020','magenta-velvet-sherwani','Magenta Velvet Sherwani','Make a bold statement with this striking magenta velvet sherwani.',13145,16853,'https://kesimg.b-cdn.net/images/650/2025y/October/58974/Magenta-Embosed-Velvet-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4150(1).jpg','Sherwanis','Velvet','Magenta','Embroidery',['36','38','40','42','44']),
  P('mens-021','black-velvet-sherwani','Black Velvet Sherwani','Embrace powerful sophistication with this striking black velvet sherwani.',11495,14737,'https://kesimg.b-cdn.net/images/650/2025y/October/58974/Black-Embosed-Velvet-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4148(1).jpg','Sherwanis','Velvet','Black','Embroidery',['36','38','40','42','44']),
  P('mens-022','wine-art-silk-sherwani','Wine Art Silk Sherwani','Channel refined style with this distinguished wine Art Silk sherwani.',11495,14737,'https://kesimg.b-cdn.net/images/650/2025y/October/58974/Wine-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4147(1).jpg','Sherwanis','Art Silk','Wine','Embroidery',['36','38','40','42','44']),
  P('mens-023','black-art-silk-sherwani','Black Art Silk Sherwani','Make a commanding statement with this sleek black Art Silk sherwani.',9895,12686,'https://kesimg.b-cdn.net/images/650/2025y/October/58974/Black-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4146(1).jpg','Sherwanis','Art Silk','Black','Embroidery',['36','38','40','42','44']),
  P('mens-025','navy-silk-sherwani','Navy Silk Art Sherwani','Experience classic sophistication with this distinguished navy Art Silk sherwani.',9895,12686,'https://kesimg.b-cdn.net/images/650/2025y/October/58974/Navy-Blue-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4149(1).jpg','Sherwanis','Art Silk','Navy','Embroidery',['36','38','40','42','44']),

  // ── ANARKALI SUITS ──
  P('suit-001','red-silk-eid-anarkali-suit','Red Silk Eid Anarkali Suit','Celebrate in magnificent style with this stunning red silk Anarkali suit.',2445,3135,'https://kesimg.b-cdn.net/images/650/2026y/January/59797/RED-Silk-Eid-Wear-Embroidery-Work-Readymade-Anarkali-Suit-5554-681-B(1).jpg','Anarkali Suits','Silk','Red','Embroidery',['S','M','L','XL']),
  P('suit-002','green-silk-eid-anarkali-suit','Green Silk Eid Anarkali Suit','Embrace nature-inspired elegance with this beautiful green silk Anarkali suit.',2445,3135,'https://kesimg.b-cdn.net/images/650/2026y/January/59797/Green-Silk-Eid-Wear-Embroidery-Work-Readymade-Anarkali-Suit-5554-681-A(1).jpg','Anarkali Suits','Silk','Green','Embroidery',['S','M','L','XL']),
  P('suit-003','dusty-rose-silk-party-anarkali','Dusty Rose Silk Party Anarkali Suit','Float through celebrations in this ethereal dusty rose silk Anarkali suit.',2095,2686,'https://kesimg.b-cdn.net/images/650/2026y/January/59793/Dusty-Rose-Silk-Party-Wear-Sequins-Work--Readymade-Anarkali-Suit-5964(1).jpg','Anarkali Suits','Silk','Dusty Rose','Sequins',['S','M','L','XL']),
  P('suit-004','baby-pink-roman-silk-festival-anarkali','Baby Pink Roman Silk Festival Anarkali','Celebrate festivals in sweet elegance with this charming baby pink Roman Silk Anarkali suit.',2495,3327,'https://kesimg.b-cdn.net/images/650/2025y/December/59770/Baby-Pink-Roman-Silk-Festival-Wear-Sequins-Work-Readymade-Anarkali-Suit-Shalini-Vol-3-5546-3800-A(1).jpg','Anarkali Suits','Roman Silk','Baby Pink','Sequins',['S','M','L','XL']),
  P('suit-005','red-chanderi-cotton-casual-anarkali','Red Chanderi Cotton Casual Anarkali Suit','Experience everyday elegance with this beautiful red Chanderi Cotton Anarkali suit.',1595,2045,'https://kesimg.b-cdn.net/images/650/2025y/December/59774/Red-Chanderi-Cotton-Casual-Wear-Border-Work-Readymade-Anarkali-Suit-DN-539-B(1).jpg','Anarkali Suits','Chanderi Cotton','Red','Border Work',['S','M','L','XL']),
  P('suit-006','champagne-beige-chanderi-anarkali','Champagne Beige Chanderi Cotton Anarkali','Embrace understated sophistication with this elegant champagne beige Chanderi Cotton Anarkali suit.',1595,2045,'https://kesimg.b-cdn.net/images/650/2025y/December/59774/Champagne-Beige-Chanderi-Cotton-Casual-Wear-Border-Work-Readymade-Anarkali-Suit-DN-539-A(1).jpg','Anarkali Suits','Chanderi Cotton','Champagne Beige','Border Work',['S','M','L','XL']),
  P('suit-007','peach-fendy-silk-casual-anarkali','Peach Fendy Silk Casual Anarkali Suit','Experience soft elegance with this beautiful peach Fendy Silk Anarkali suit.',2695,3546,'https://kesimg.b-cdn.net/images/650/2025y/December/59743/Peach-Fendy-Silk-Casual-Wear-Sequins-Work-Readymade-Anarkali-Suit-Anshika-Vol-2-5519-6101-D(1).jpg','Anarkali Suits','Fendy Silk','Peach','Sequins',['S','M','L','XL']),
  P('suit-008','grey-fendy-silk-casual-anarkali','Grey Fendy Silk Casual Anarkali Suit','Channel sophisticated minimalism with this elegant grey Fendy Silk Anarkali suit.',2695,3546,'https://kesimg.b-cdn.net/images/650/2025y/December/59743/Grey-Fendy-Silk-Casual-Wear-Sequins-Work-Readymade-Anarkali-Suit-Anshika-Vol-2-5519-6101-C(1).jpg','Anarkali Suits','Fendy Silk','Grey','Sequins',['S','M','L','XL']),
  P('suit-009','green-fendy-silk-casual-anarkali','Green Fendy Silk Casual Anarkali Suit','Embrace nature-inspired elegance with this refreshing green Fendy Silk Anarkali suit.',2695,3546,'https://kesimg.b-cdn.net/images/650/2025y/December/59743/Green-Fendy-Silk-Casual-Wear-Sequins-Work-Readymade-Anarkali-Suit-Anshika-Vol-2-5519-6101-B(1).jpg','Anarkali Suits','Fendy Silk','Green','Sequins',['S','M','L','XL']),
  P('suit-010','dusty-pink-fendy-silk-casual-anarkali','Dusty Pink Fendy Silk Casual Anarkali Suit','Experience romantic elegance with this beautiful dusty pink Fendy Silk Anarkali suit.',2695,3546,'https://kesimg.b-cdn.net/images/650/2025y/December/59743/Dusty-Pink-Fendy-Silk-Casual-Wear-Sequins-Work-Readymade-Anarkali-Suit-Anshika-Vol-2-5519-6101-A(1).jpg','Anarkali Suits','Fendy Silk','Dusty Pink','Sequins',['S','M','L','XL']),
  P('suit-011','purple-chanderi-silk-casual-anarkali','Purple Roman Chanderi Silk Anarkali Suit','Channel royal elegance with this stunning purple Roman Chanderi Silk Anarkali suit.',2545,3439,'https://kesimg.b-cdn.net/images/650/2025y/December/59714/Purple-Roman-Chanderi-Silk-Casual-Wear-Embroidery-Work-Readymade-Anarkali-Suit-BK-Vol-3-5487-290(1).jpg','Anarkali Suits','Chanderi Silk','Purple','Embroidery',['S','M','L','XL']),
  P('suit-014','sky-blue-georgette-anarkali-gown','Sky Blue Faux Georgette Anarkali Gown','Float through celebrations in this ethereal sky blue Faux Georgette Anarkali gown.',3345,4582,'https://kesimg.b-cdn.net/images/650/2025y/December/59679/Sky-Blue-Faux-Georgette-Casual-Wear-Embroidery-Work-Anarkali-Gown-KB-3307-Colour%27s-5436-3307-C(1).jpg','Anarkali Suits','Faux Georgette','Sky Blue','Embroidery',['S','M','L','XL']),
  P('suit-016','black-roman-silk-anarkali','Black Roman Silk Anarkali Suit','Make a powerful statement with this striking black Roman Silk Anarkali suit.',2045,2727,'https://kesimg.b-cdn.net/images/650/2025y/December/59699/Black-Roman-Silk-Ocassional-Wear-Dupatta-Work-Reaadymade-Anarkali-Suit-Jiya-Vol-5-5456-3600-A(1).jpg','Anarkali Suits','Roman Silk','Black','Dupatta Work',['S','M','L','XL']),
  P('suit-017','maroon-roman-silk-anarkali','Maroon Roman Silk Anarkali Suit','Embrace passionate elegance with this stunning maroon Roman Silk Anarkali suit.',2595,3507,'https://kesimg.b-cdn.net/images/650/2025y/December/59703/Maroon-Roman-Silk-Occasional-Wear-Zari-Work-Readymade-Anarkali-Suit-Mitali-Vol-4-5465-3154(1).jpg','Anarkali Suits','Roman Silk','Maroon','Zari',['S','M','L','XL']),
  P('suit-018','multicolor-chinon-party-anarkali','Multicolor Quality Chinon Party Anarkali','Celebrate in vibrant style with this stunning multicolor Quality Chinon Anarkali suit.',2495,3373,'https://kesimg.b-cdn.net/images/650/2025y/December/59660/Multi-Color-Premium-Chinon-Party-Wear-Digital-Print-Work-Readymade-Anarkali-Suit-Gulzar-Saawan--5397-3343(1).jpg','Anarkali Suits','Quality Chinon','Multi Color','Digital Print',['S','M','L','XL']),
  P('suit-019','wine-georgette-sharara-suit','Wine Georgette Sharara Suit','Dance through celebrations in this elegant wine Georgette sharara suit.',3295,4453,'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Wine-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-B(1).jpg','Sharara Suits','Georgette','Wine','Embellished',['S','M','L','XL']),
  P('suit-020','teal-georgette-palazzo-suit','Teal Georgette Palazzo Suit','Experience modern elegance with this stunning teal Georgette palazzo suit.',2895,3909,'https://kesimg.b-cdn.net/images/650/2025y/December/59679/Teal-Faux-Georgette-Casual-Wear-Embroidery-Work-Anarkali-Gown-KB-3307-Colour%27s-5436-3307-A(1).jpg','Palazzo Suits','Georgette','Teal','Embroidery',['S','M','L','XL']),
];

// Filter: only products with absolute CDN image URLs
const validProducts = products.filter(p => p.image && (p.image.includes('kesimg.b-cdn.net') || p.image.includes('cdn.shopify.com')));

// Generate XML
const shippingXml = getShippingBlocks();
let items = '';

for (const p of validProducts) {
  const googleCat = getGoogleCategory(p.category, p.title);
  const gender = getGender(p.category, p.title);
  const imageUrl = forceJpeg(p.image);
  const desc = enrichDescription(p.description, p.category, p.fabric, p.work, p.color);
  const allSizes = p.sizes.join(',');
  const hasSale = p.originalPrice && p.originalPrice > p.price;

  items += `  <item>
    <g:id>${escapeXml(p.id)}</g:id>
    <g:title>${escapeXml(p.title)}</g:title>
    <g:description>${escapeXml(desc)}</g:description>
    <g:link>${SITE_URL}/product/${escapeXml(p.handle)}</g:link>
    <g:image_link>${escapeXml(imageUrl)}</g:image_link>
    <g:availability>in_stock</g:availability>
    <g:price>${hasSale ? p.originalPrice : p.price} USD</g:price>
    ${hasSale ? `<g:sale_price>${p.price} USD</g:sale_price>` : ''}
    <g:condition>new</g:condition>
    <g:brand>${BRAND}</g:brand>
    <g:google_product_category>${escapeXml(googleCat)}</g:google_product_category>
    <g:product_type>${escapeXml(p.category)}</g:product_type>
    <g:gender>${gender}</g:gender>
    <g:age_group>adult</g:age_group>
    <g:color>${escapeXml(p.color)}</g:color>
    <g:material>${escapeXml(p.fabric)}</g:material>
    <g:pattern>${escapeXml(p.work)}</g:pattern>
    <g:size>${escapeXml(allSizes)}</g:size>
    <g:size_type>regular</g:size_type>
    <g:size_system>US</g:size_system>
    <g:identifier_exists>no</g:identifier_exists>
    <g:custom_label_0>${escapeXml(p.category)}</g:custom_label_0>
${shippingXml}
    <g:tax>
      <g:country>US</g:country>
      <g:rate>0</g:rate>
      <g:tax_ship>no</g:tax_ship>
    </g:tax>
  </item>
`;
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>LuxeMia - Indian Ethnic Wear</title>
  <link>${SITE_URL}</link>
  <description>Shop quality Indian ethnic wear - bridal lehengas, wedding sarees, sherwanis, anarkali suits, and jewelry at LuxeMia. Flat rate shipping $14.95 per item, free on orders over $300.</description>
${items}
</channel>
</rss>`;

const outputPath = path.join(__dirname, '..', 'public', 'merchant-feed.xml');
fs.writeFileSync(outputPath, xml, 'utf8');

const totalItems = validProducts.reduce((sum, p) => sum + p.sizes.length, 0);
console.log('✅ Feed generated successfully!');
console.log(`   Products: ${validProducts.length}`);
console.log(`   Total items (with variants): ${totalItems}`);
console.log(`   Output: ${outputPath}`);
console.log(`   Previous feed had: 1627 items (all stale)`);
