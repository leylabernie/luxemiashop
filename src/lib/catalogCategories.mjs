export const CATEGORY_PRODUCT_TYPES = {
  suits: ['Pakistani Suit', 'Salwar Suit', 'Sharara', 'Anarkali', 'Plazzo Suit', 'Palazzo Suit', 'Pakistani Readymade Suit', 'Salwar Kameez', 'Sharara Suit', 'Wedding Suit', 'Designer Suit', 'Gharara Suit', 'Anarkali Suit', 'Gown', 'Salwar', 'Kurti', 'Kurti Set', 'Palazzo', 'Readymade Suit', 'Churidar Suit', 'Patiala Suit', 'Straight Suit', 'Suit', 'Palazzo Set', 'Suit Set'],
  sarees: ['Saree', 'Ready-to-Wear Saree', 'Wedding Saree', 'Sarees', 'Silk Saree', 'Banarasi Saree', 'Cotton Saree', 'Georgette Saree', 'Bridal Saree', 'Designer Saree', 'Fancy Saree', 'Party Wear Saree', 'Kanjivaram Saree', 'Kanchipuram Saree', 'Tissue Saree', 'Net Saree', 'Sari', 'Saree with Stitched Blouse'],
  lehengas: ['Lehenga', 'Lehenga Choli', 'Bridal Lehenga Choli', 'Lehnga', 'Lehnga Choli', 'Bridal Lehnga', 'Bridal Lehnga Choli', 'Lehenga Set', 'Lehenga Choli Set', 'Bridal Lehenga', 'Bridal Lehengas', 'Reception Lehengas', 'Mehendi Haldi Lehengas', 'Party Wear Lehenga', 'Wedding Lehenga', 'Designer Lehenga', 'Fancy Lehenga', 'Navratri Lehenga'],
  menswear: ["Men's Ethnic Wear", 'Kurta Pajama', 'Sherwani', "Men's Indian Wear", 'Modi Jacket Kurta Pajama', 'Menswear', "Men's Suit", 'Kurta Set', 'Kurta', 'Dhoti Kurta', 'Nehru Jacket Set', 'Mens Kurta Pajama Set', 'Kurta Pajama Set'],
  indowestern: ['Indo Western', 'Indo-Western', 'Fusion Wear', 'Fusion', 'Indo Western Dress', 'Indo-Western Set', 'Jumpsuit', 'Cape Set', 'Coord Set', 'Co-Ords', 'Co-ord Set', 'Indo-Western Dress', 'Skirt Set', 'Jacket Set'],
  jewelry: ['Kundan Necklace Set', 'Kundan Jewelry', 'Bridal Jewelry', 'Necklace Set', 'Kundan', 'Polki', 'Uncut Polki', 'Jewelry', 'Jewelry Set', 'Jewellery Set', 'Kundan Set', 'Polki Set', 'Bridal Set', 'Full Bridal Set', 'Kundan Bridal Set', 'Kundan Necklace', 'Choker Necklace', 'Necklace', 'Earrings', 'Bangles', 'Maang Tikka', 'Bridal Jewelry Set', 'Kundan Earrings', 'Kundan Bangles'],
  blouses: ['Blouse', 'Choli'],
  'couple-outfits': ['Couple Set', 'Couple Outfit', 'Couple Outfits'],
  kids: ['Girls Ethnic Set', 'Kids Salwar Set', 'Kids Lehenga', 'Girls Salwar Suit', 'Kids Ethnic Wear', 'Girls Lehenga Set', 'Kids Boy Set', 'Boys Ethnic Set', 'Kids Kurta Set', 'Kids Onam Set'],
};


export const CATEGORY_LABELS = {
  lehengas: 'Lehengas', sarees: 'Sarees', suits: 'Salwar Kameez',
  menswear: 'Menswear', indowestern: 'Indo Western', jewelry: 'Jewelry',
  kids: 'Kids', blouses: 'Blouse', 'couple-outfits': 'Couple Set',
};

// A specific Shopify type wins over incidental words in a title or tags.
// Children and matching couples must never be mistaken for adult menswear.
export function getPrimaryCategory(product) {
  const type = (product._originalProductType || product.productType || '').trim().toLowerCase();
  if (/kids|\b(?:boys?|girls?)\b/.test(type)) return 'kids';
  if (/couple/.test(type)) return 'couple-outfits';
  for (const [category, types] of Object.entries(CATEGORY_PRODUCT_TYPES)) {
    if (types.some(value => value.toLowerCase() === type)) return category;
  }
  if (/lehenga|lehnga|lehena/.test(type)) return 'lehengas';
  if (/saree|sari/.test(type)) return 'sarees';
  if (/sherwani|kurta pajama|menswear|\bmen\b|men's/.test(type)) return 'menswear';
  if (/salwar|kameez|sharara|anarkali|palazzo|plazzo|gharara|gown|kurti|churidar|patiala|suit/.test(type)) return 'suits';
  if (/indo.?western|fusion|jumpsuit|cape set|co.?ord|skirt set|jacket set/.test(type)) return 'indowestern';
  if (/jewel|kundan|polki|necklace|choker|bangle|earring|maang tikka/.test(type)) return 'jewelry';
  return null;
}

export function getCatalogDisplayCategory(productType) {
  const category = getPrimaryCategory({ productType });
  return category ? CATEGORY_LABELS[category] : (productType || 'Designer Wear');
}

export const NEW_ARRIVALS_LIMIT = 12;
export function selectLatestArrivals(products, now = Date.now(), limit = NEW_ARRIVALS_LIMIT) {
  const cutoff = now - 30 * 86400000;
  return products.filter(product => {
    const node = product.node || product;
    return node.productType !== 'Service Add-On' && new Date(node.createdAt).getTime() > cutoff;
  }).sort((a, b) => {
    const left = a.node || a, right = b.node || b;
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  }).slice(0, limit);
}
