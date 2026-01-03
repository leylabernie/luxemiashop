export interface JewelryProduct {
  id: string;
  name: string;
  category: 'Necklaces' | 'Earrings' | 'Bangles' | 'Bridal Sets' | 'Maang Tikka';
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  material: string;
  isNew?: boolean;
  isBestseller?: boolean;
  isOnSale?: boolean;
}

// Price formula: (source INR price × 2) / 83 = USD price
export const jewelryProducts: JewelryProduct[] = [
  // Necklace Sets
  {
    id: 'jwl-001',
    name: 'Yellow Kundan Ethnic Necklace Set',
    category: 'Necklaces',
    price: 56, // (2345 × 2) / 83
    originalPrice: 74, // (3086 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59471/Yellow--Wedding-Wear-Kundan-Ethnic-Design-Necklace-Set-FNKN102YLW(1).jpg',
    description: 'Exquisite yellow kundan necklace set with traditional ethnic design, perfect for wedding occasions.',
    material: 'Kundan, Gold-plated brass, Pearl drops',
    isNew: true,
    isBestseller: true,
  },
  {
    id: 'jwl-002',
    name: 'White Kundan Ethnic Necklace Set',
    category: 'Necklaces',
    price: 56,
    originalPrice: 74,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59471/White--Wedding-Wear-Kundan-Ethnic-Design-Necklace-Set-FNKN102WHT(1).jpg',
    description: 'Elegant white kundan necklace set with intricate ethnic detailing for bridal wear.',
    material: 'Kundan, Gold-plated brass, Pearl',
    isBestseller: true,
  },
  {
    id: 'jwl-003',
    name: 'Maroon Kundan Ethnic Necklace Set',
    category: 'Necklaces',
    price: 56,
    originalPrice: 74,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59471/Maroon--Wedding-Wear-Kundan-Ethnic-Design-Necklace-Set-FNKN102MRN(1).jpg',
    description: 'Rich maroon kundan necklace set with royal ethnic design for festive occasions.',
    material: 'Kundan, Maroon stones, Gold-plated',
    isNew: true,
  },
  {
    id: 'jwl-004',
    name: 'Dark Green Kundan Ethnic Necklace Set',
    category: 'Necklaces',
    price: 56,
    originalPrice: 74,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59471/Dark-Green--Wedding-Wear-Kundan-Ethnic-Design-Necklace-Set-FNKN102GRN(1).jpg',
    description: 'Stunning dark green kundan necklace set with traditional craftsmanship.',
    material: 'Kundan, Emerald green stones, Gold-plated',
  },
  {
    id: 'jwl-005',
    name: 'Yellow Kundan Beauty Necklace Set',
    category: 'Necklaces',
    price: 63, // (2595 × 2) / 83
    originalPrice: 83, // (3460 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59472/Yellow--Wedding-Wear-Kundan-Beauty-Necklace-Set-FNKN103YLW(1).jpg',
    description: 'Beautiful yellow kundan necklace set with delicate beauty design.',
    material: 'Kundan, Yellow stones, Pearl drops',
    isBestseller: true,
  },
  {
    id: 'jwl-006',
    name: 'White Kundan Beauty Necklace Set',
    category: 'Necklaces',
    price: 63,
    originalPrice: 83,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59472/White--Wedding-Wear-Kundan-Beauty-Necklace-Set-FNKN103WHT(1).jpg',
    description: 'Pristine white kundan beauty necklace set for elegant occasions.',
    material: 'Kundan, White stones, Gold-plated brass',
  },
  {
    id: 'jwl-007',
    name: 'Pista Green Kundan Beauty Necklace Set',
    category: 'Necklaces',
    price: 63,
    originalPrice: 83,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59472/Pista-Green--Wedding-Wear-Kundan-Beauty-Necklace-Set-FNKN103PGRN(1).jpg',
    description: 'Refreshing pista green kundan necklace set with contemporary design.',
    material: 'Kundan, Pista green stones, Pearl',
    isNew: true,
  },
  {
    id: 'jwl-008',
    name: 'Maroon Kundan Beauty Necklace Set',
    category: 'Necklaces',
    price: 63,
    originalPrice: 83,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59472/Maroon--Wedding-Wear-Kundan-Beauty-Necklace-Set-FNKN103MRN(1).jpg',
    description: 'Luxurious maroon kundan beauty necklace set for festive celebrations.',
    material: 'Kundan, Maroon stones, Gold-plated',
  },
  {
    id: 'jwl-009',
    name: 'Multi Color Kundan Beauty Necklace Set',
    category: 'Bridal Sets',
    price: 63,
    originalPrice: 83,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59472/Multi-Color--Wedding-Wear-Kundan-Beauty-Necklace-Set-FNKN103MG(1).jpg',
    description: 'Vibrant multi-color kundan necklace set with stunning beauty design.',
    material: 'Kundan, Multi-color stones, Pearl drops',
    isBestseller: true,
  },
  {
    id: 'jwl-010',
    name: 'Dark Green Kundan Beauty Necklace Set',
    category: 'Necklaces',
    price: 63,
    originalPrice: 83,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59472/Dark-Green--Wedding-Wear-Kundan-Beauty-Necklace-Set-FNKN103GRN(1).jpg',
    description: 'Elegant dark green kundan beauty necklace with royal finish.',
    material: 'Kundan, Green stones, Gold-plated brass',
  },
  {
    id: 'jwl-011',
    name: 'Multi Color Kundan Royal Necklace Set',
    category: 'Bridal Sets',
    price: 46, // (1895 × 2) / 83
    originalPrice: 60, // (2493 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59473/Multi-Color--Wedding-Wear-Kundan-Royal-Necklace-Set-FNKN112PGPNK(1).jpg',
    description: 'Majestic multi-color kundan royal necklace set for grand celebrations.',
    material: 'Kundan, Mixed stones, Gold-plated',
    isNew: true,
  },
  {
    id: 'jwl-012',
    name: 'Dark Green Kundan Royal Necklace Set',
    category: 'Bridal Sets',
    price: 46,
    originalPrice: 60,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59473/Dark-Green--Wedding-Wear-Kundan-Royal-Necklace-Set-FNKN112GRN(1).jpg',
    description: 'Regal dark green kundan royal necklace set with traditional charm.',
    material: 'Kundan, Emerald stones, Pearl drops',
  },
  {
    id: 'jwl-013',
    name: 'Yellow Kundan Royal Necklace Set',
    category: 'Necklaces',
    price: 26, // (1099 × 2) / 83
    originalPrice: 35, // (1446 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59473/Yellow--Wedding-Wear-Kundan-Royal-Necklace-Set-FNKN110YLW(1).jpg',
    description: 'Bright yellow kundan royal necklace set perfect for haldi ceremonies.',
    material: 'Kundan, Yellow stones, Gold-plated',
    isOnSale: true,
  },
  {
    id: 'jwl-014',
    name: 'Red Kundan Royal Necklace Set',
    category: 'Bridal Sets',
    price: 26,
    originalPrice: 35,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59473/Red--Wedding-Wear-Kundan-Royal-Necklace-Set-FNKN110RNI(1).jpg',
    description: 'Stunning red kundan royal necklace set for bridal occasions.',
    material: 'Kundan, Ruby red stones, Gold-plated',
    isBestseller: true,
  },
  {
    id: 'jwl-015',
    name: 'Blue Kundan Royal Necklace Set',
    category: 'Necklaces',
    price: 26,
    originalPrice: 35,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59473/Blue--Wedding-Wear-Kundan-Royal-Necklace-Set-FNKN110BLU(1).jpg',
    description: 'Elegant blue kundan royal necklace set with sapphire-like stones.',
    material: 'Kundan, Blue stones, Pearl drops',
    isNew: true,
  },
  {
    id: 'jwl-016',
    name: 'Yellow Kundan Grand Necklace Set',
    category: 'Bridal Sets',
    price: 70, // (2895 × 2) / 83
    originalPrice: 92, // (3809 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59473/Yellow--Wedding-Wear-Kundan-Royal-Necklace-Set-FNKN107YLW(1).jpg',
    description: 'Grand yellow kundan necklace set with elaborate royal design.',
    material: 'Kundan, Yellow stones, Heavy gold-plated',
  },
  {
    id: 'jwl-017',
    name: 'Maroon Kundan Grand Necklace Set',
    category: 'Bridal Sets',
    price: 70,
    originalPrice: 92,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59473/Maroon--Wedding-Wear-Kundan-Royal-Necklace-Set-FNKN107MRN(1).jpg',
    description: 'Opulent maroon kundan grand necklace set for royal weddings.',
    material: 'Kundan, Maroon stones, Pearl, Gold-plated',
    isBestseller: true,
  },
  {
    id: 'jwl-018',
    name: 'Dark Green Kundan Classic Necklace Set',
    category: 'Necklaces',
    price: 25, // (1045 × 2) / 83
    originalPrice: 33, // (1375 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59473/Dark-Green--Wedding-Wear-Kundan-Royal-Necklace-Set-FNKN105GRN(1).jpg',
    description: 'Classic dark green kundan necklace set with timeless appeal.',
    material: 'Kundan, Green stones, Gold-plated brass',
    isOnSale: true,
  },
  {
    id: 'jwl-019',
    name: 'White Kundan Royal Choker Set',
    category: 'Necklaces',
    price: 46, // (1898 × 2) / 83
    originalPrice: 60, // (2497 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59473/White--Wedding-Wear-Kundan-Royal-Necklace-Set-FNKN104WHT(1).jpg',
    description: 'Elegant white kundan royal choker set with pearl drops.',
    material: 'Kundan, White stones, Pearl, Gold-plated',
    isNew: true,
  },
  {
    id: 'jwl-020',
    name: 'Pista Green Kundan Royal Necklace Set',
    category: 'Necklaces',
    price: 46,
    originalPrice: 60,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59473/Pista-Green--Wedding-Wear-Kundan-Royal-Necklace-Set-FNKN104PGRN(1).jpg',
    description: 'Fresh pista green kundan royal necklace with modern design.',
    material: 'Kundan, Pista stones, Gold-plated brass',
  },
  {
    id: 'jwl-021',
    name: 'Maroon Kundan Designer Necklace Set',
    category: 'Bridal Sets',
    price: 46,
    originalPrice: 60,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59473/Maroon--Wedding-Wear-Kundan-Royal-Necklace-Set-FNKN104MRN(1).jpg',
    description: 'Designer maroon kundan necklace set with contemporary styling.',
    material: 'Kundan, Maroon stones, Pearl drops',
  },
  {
    id: 'jwl-022',
    name: 'Dark Green Kundan Designer Necklace Set',
    category: 'Necklaces',
    price: 46,
    originalPrice: 60,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59473/Dark-Green--Wedding-Wear-Kundan-Royal-Necklace-Set-FNKN104GRN(1).jpg',
    description: 'Sophisticated dark green kundan designer necklace set.',
    material: 'Kundan, Emerald stones, Gold-plated',
  },
  {
    id: 'jwl-023',
    name: 'White Kundan Fancy Necklace Set',
    category: 'Necklaces',
    price: 66, // (2745 × 2) / 83
    originalPrice: 88, // (3660 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59478/White--Wedding-Wear-Kundan-Fancy-Necklace-Set-FNKN113WGLD(1).jpg',
    description: 'Fancy white kundan necklace set with gold detailing.',
    material: 'Kundan, White stones, Heavy gold-plated',
    isBestseller: true,
  },
  {
    id: 'jwl-024',
    name: 'Dark Green Kundan Fancy Necklace Set',
    category: 'Necklaces',
    price: 66,
    originalPrice: 88,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59478/Dark-Green--Wedding-Wear-Kundan-Fancy-Necklace-Set-FNKN113GRN(1).jpg',
    description: 'Exquisite dark green kundan fancy necklace set for special occasions.',
    material: 'Kundan, Green stones, Pearl, Gold-plated',
    isNew: true,
  },
  {
    id: 'jwl-025',
    name: 'White Kundan Elegant Party Necklace',
    category: 'Necklaces',
    price: 42, // (1745 × 2) / 83
    originalPrice: 55, // (2296 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59479/White--Party-Wear-Kundan-Elegant-Necklace-Set-FNKN121WHT(1).jpg',
    description: 'Elegant white kundan party necklace for sophisticated events.',
    material: 'Kundan, White stones, Gold-plated brass',
  },
  {
    id: 'jwl-026',
    name: 'Maroon Kundan Elegant Party Necklace',
    category: 'Necklaces',
    price: 42,
    originalPrice: 55,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59479/Maroon--Party-Wear-Kundan-Elegant-Necklace-Set-FNKN121MRN(1).jpg',
    description: 'Graceful maroon kundan elegant party necklace set.',
    material: 'Kundan, Maroon stones, Pearl drops',
  },
  {
    id: 'jwl-027',
    name: 'White Kundan Delicate Party Necklace',
    category: 'Necklaces',
    price: 40, // (1645 × 2) / 83
    originalPrice: 52, // (2164 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59479/White--Party-Wear-Kundan-Elegant-Necklace-Set-FNKN120WHT(1).jpg',
    description: 'Delicate white kundan party necklace with fine craftsmanship.',
    material: 'Kundan, White stones, Gold-plated',
  },
  {
    id: 'jwl-028',
    name: 'Maroon Kundan Delicate Party Necklace',
    category: 'Necklaces',
    price: 40,
    originalPrice: 52,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59479/Maroon--Party-Wear-Kundan-Elegant-Necklace-Set-FNKN120MRN(1).jpg',
    description: 'Refined maroon kundan delicate party necklace set.',
    material: 'Kundan, Maroon stones, Gold-plated brass',
    isBestseller: true,
  },
  {
    id: 'jwl-029',
    name: 'Pink Kundan Elegant Party Necklace',
    category: 'Necklaces',
    price: 41, // (1695 × 2) / 83
    originalPrice: 54, // (2230 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59479/Pink--Party-Wear-Kundan-Elegant-Necklace-Set-FNKN119PNK(1).jpg',
    description: 'Lovely pink kundan elegant party necklace for feminine charm.',
    material: 'Kundan, Pink stones, Pearl, Gold-plated',
    isNew: true,
  },
  {
    id: 'jwl-030',
    name: 'White Kundan Classic Party Necklace',
    category: 'Necklaces',
    price: 38, // (1595 × 2) / 83
    originalPrice: 51, // (2099 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59479/White--Party-Wear-Kundan-Elegant-Necklace-Set-FNKN116WHT(1).jpg',
    description: 'Classic white kundan party necklace with timeless elegance.',
    material: 'Kundan, White stones, Gold-plated brass',
  },
  // Earrings
  {
    id: 'jwl-031',
    name: 'Multi Color Diamond Party Earrings',
    category: 'Earrings',
    price: 18, // (745 × 2) / 83
    originalPrice: 23, // (955 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59481/Multi-Color--Party-Wear-Diamond-Work-Pretty-Earrings-FNKDE133MLT(1).jpg',
    description: 'Sparkling multi-color diamond work earrings for party occasions.',
    material: 'Diamond Work, Gold-plated',
    isNew: true,
  },
  {
    id: 'jwl-032',
    name: 'White Diamond Work Earrings',
    category: 'Earrings',
    price: 24, // (995 × 2) / 83
    originalPrice: 31, // (1276 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59481/White--Party-Wear-Diamond-Work-Pretty-Earrings-FNKDE131WHT(1).jpg',
    description: 'Elegant white diamond work earrings with stunning brilliance.',
    material: 'Diamond Work, Gold-plated',
    isBestseller: true,
  },
  {
    id: 'jwl-033',
    name: 'Red Diamond Work Party Earrings',
    category: 'Earrings',
    price: 24,
    originalPrice: 31,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59481/Red--Party-Wear-Diamond-Work-Pretty-Earrings-FNKDE126RNI(1).jpg',
    description: 'Bold red diamond work earrings for festive celebrations.',
    material: 'Diamond Work, Gold-plated',
  },
  {
    id: 'jwl-034',
    name: 'Blue Diamond Work Party Earrings',
    category: 'Earrings',
    price: 24,
    originalPrice: 31,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59481/Blue--Party-Wear-Diamond-Work-Pretty-Earrings-FNKDE126BLU(1).jpg',
    description: 'Sophisticated blue diamond work earrings.',
    material: 'Diamond Work, Gold-plated',
  },
  {
    id: 'jwl-035',
    name: 'Red Kundan Festival Earrings',
    category: 'Earrings',
    price: 18, // (745 × 2) / 83
    originalPrice: 23, // (943 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59482/Red--Festival-Wear-Kundan-Shining-Earrings-FNKDE142RNI(1).jpg',
    description: 'Shining red kundan earrings for festival wear.',
    material: 'Kundan, Gold-plated',
    isOnSale: true,
  },
  {
    id: 'jwl-036',
    name: 'Purple Kundan Festival Earrings',
    category: 'Earrings',
    price: 18,
    originalPrice: 23,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59482/Purple--Festival-Wear-Kundan-Shining-Earrings-FNKDE142PRP(1).jpg',
    description: 'Regal purple kundan earrings with shining finish.',
    material: 'Kundan, Gold-plated',
  },
  {
    id: 'jwl-037',
    name: 'Pink Kundan Festival Earrings',
    category: 'Earrings',
    price: 18,
    originalPrice: 23,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59482/Pink--Festival-Wear-Kundan-Shining-Earrings-FNKDE142PNK(1).jpg',
    description: 'Pretty pink kundan earrings for festive occasions.',
    material: 'Kundan, Gold-plated',
  },
  {
    id: 'jwl-038',
    name: 'Green Kundan Festival Earrings',
    category: 'Earrings',
    price: 18,
    originalPrice: 23,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59482/Green--Festival-Wear-Kundan-Shining-Earrings-FNKDE142GRN(1).jpg',
    description: 'Fresh green kundan earrings with traditional charm.',
    material: 'Kundan, Gold-plated',
  },
  {
    id: 'jwl-039',
    name: 'Red Kundan Premium Earrings',
    category: 'Earrings',
    price: 28, // (1145 × 2) / 83
    originalPrice: 35, // (1449 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59482/Red--Festival-Wear-Kundan-Shining-Earrings-FNKDE140RNI(1).jpg',
    description: 'Premium red kundan earrings with superior craftsmanship.',
    material: 'Kundan, Gold-plated',
    isBestseller: true,
  },
  {
    id: 'jwl-040',
    name: 'Pink Kundan Premium Earrings',
    category: 'Earrings',
    price: 28,
    originalPrice: 35,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59482/Pink--Festival-Wear-Kundan-Shining-Earrings-FNKDE140PNK(1).jpg',
    description: 'Premium pink kundan earrings with elegant design.',
    material: 'Kundan, Gold-plated',
  },
  {
    id: 'jwl-041',
    name: 'Blue Kundan Traditional Long Jhumkas',
    category: 'Earrings',
    price: 36, // (1495 × 2) / 83
    originalPrice: 46, // (1917 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59484/Blue--Party-Wear-Kundan-Traditional-Long-Jhumkas-FNKE104BLU(1).jpg',
    description: 'Traditional blue kundan long jhumkas for party wear.',
    material: 'Kundan, Gold-plated',
    isNew: true,
  },
  {
    id: 'jwl-042',
    name: 'Maroon Kundan Traditional Long Jhumkas',
    category: 'Earrings',
    price: 36, // (1499 × 2) / 83
    originalPrice: 46, // (1922 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59484/Maroon--Party-Wear-Kundan-Traditional-Long-Jhumkas-FNKE102MRN(1).jpg',
    description: 'Rich maroon kundan long jhumkas with traditional design.',
    material: 'Kundan, Gold-plated',
  },
  {
    id: 'jwl-043',
    name: 'Black Kundan Traditional Long Jhumkas',
    category: 'Earrings',
    price: 36,
    originalPrice: 46,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59484/Black--Party-Wear-Kundan-Traditional-Long-Jhumkas-FNKE102BLK(1).jpg',
    description: 'Bold black kundan long jhumkas for statement looks.',
    material: 'Kundan, Gold-plated',
  },
  {
    id: 'jwl-044',
    name: 'Red Party Kundan Stylish Earrings',
    category: 'Earrings',
    price: 30, // (1245 × 2) / 83
    originalPrice: 38, // (1576 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59485/Red--Party-Wear-Kundan-Stylish-Earrings-FNKE111RED(1).jpg',
    description: 'Stylish red kundan party earrings.',
    material: 'Kundan, Gold-plated',
  },
  {
    id: 'jwl-045',
    name: 'Pista Green Party Kundan Earrings',
    category: 'Earrings',
    price: 30,
    originalPrice: 38,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59485/Pista-Green--Party-Wear-Kundan-Stylish-Earrings-FNKE111PG(1).jpg',
    description: 'Trendy pista green kundan stylish earrings.',
    material: 'Kundan, Gold-plated',
  },
  // Bangles
  {
    id: 'jwl-046',
    name: 'Golden Diamond Work Party Bangles Set',
    category: 'Bangles',
    price: 19, // (795 × 2) / 83
    originalPrice: 25, // (1032 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59480/Golden--Party-Wear-Diamond-Work-Pretty-Bangles-FNADB116GLD(1).jpg',
    description: 'Elegant golden diamond work bangles set for party occasions.',
    material: 'Diamond Work, Gold-plated brass',
    isNew: true,
  },
  {
    id: 'jwl-047',
    name: 'Golden Diamond Ornate Bangles',
    category: 'Bangles',
    price: 19,
    originalPrice: 25,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59480/Golden--Party-Wear-Diamond-Work-Pretty-Bangles-FNADB112GLD(1).jpg',
    description: 'Ornate golden diamond work bangles with intricate patterns.',
    material: 'Diamond Work, Gold-plated brass',
    isBestseller: true,
  },
  {
    id: 'jwl-048',
    name: 'Golden Diamond Classic Bangles',
    category: 'Bangles',
    price: 19,
    originalPrice: 25,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59480/Golden--Party-Wear-Diamond-Work-Pretty-Bangles-FNADB111GLD(1).jpg',
    description: 'Classic golden diamond work bangles for everyday elegance.',
    material: 'Diamond Work, Gold-plated brass',
  },
  {
    id: 'jwl-049',
    name: 'Golden Diamond Statement Bangles',
    category: 'Bangles',
    price: 19,
    originalPrice: 25,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59480/Golden--Party-Wear-Diamond-Work-Pretty-Bangles-FNADB110GLD(1).jpg',
    description: 'Statement golden diamond work bangles for special occasions.',
    material: 'Diamond Work, Gold-plated brass',
  },
  {
    id: 'jwl-050',
    name: 'Golden Diamond Delicate Bangles',
    category: 'Bangles',
    price: 19,
    originalPrice: 25,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59480/Golden--Party-Wear-Diamond-Work-Pretty-Bangles-FNADB109GLD(1).jpg',
    description: 'Delicate golden diamond work bangles with refined finish.',
    material: 'Diamond Work, Gold-plated brass',
  },
  {
    id: 'jwl-051',
    name: 'Golden Diamond Traditional Bangles',
    category: 'Bangles',
    price: 19,
    originalPrice: 25,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59480/Golden--Party-Wear-Diamond-Work-Pretty-Bangles-FNADB108GLD(1).jpg',
    description: 'Traditional golden diamond work bangles with timeless appeal.',
    material: 'Diamond Work, Gold-plated brass',
  },
  // Maang Tikka
  {
    id: 'jwl-052',
    name: 'Sky Blue Kundan Festival Maang Tikka',
    category: 'Maang Tikka',
    price: 23, // (945 × 2) / 83
    originalPrice: 29, // (1196 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59483/Sky-Blue--Festival-Wear-Kundan-Beautiful-Earrings-FNKDE144SBLU(1).jpg',
    description: 'Beautiful sky blue kundan maang tikka for festival wear.',
    material: 'Kundan, Gold-plated',
    isNew: true,
  },
  {
    id: 'jwl-053',
    name: 'Black Kundan Festival Maang Tikka',
    category: 'Maang Tikka',
    price: 23,
    originalPrice: 29,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59483/Black--Festival-Wear-Kundan-Beautiful-Earrings-FNKDE144BLK(1).jpg',
    description: 'Elegant black kundan maang tikka with stunning design.',
    material: 'Kundan, Gold-plated',
  },
  {
    id: 'jwl-054',
    name: 'Dark Green Kundan Festival Maang Tikka',
    category: 'Maang Tikka',
    price: 18, // (745 × 2) / 83
    originalPrice: 23, // (943 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59483/Dark-Green--Festival-Wear-Kundan-Beautiful-Earrings-FNKDE143GRN(1).jpg',
    description: 'Traditional dark green kundan maang tikka.',
    material: 'Kundan, Gold-plated',
    isBestseller: true,
  },
  {
    id: 'jwl-055',
    name: 'Green Kundan Shining Maang Tikka',
    category: 'Maang Tikka',
    price: 28, // (1145 × 2) / 83
    originalPrice: 35, // (1449 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59482/Green--Festival-Wear-Kundan-Shining-Earrings-FNKDE140GRN(1).jpg',
    description: 'Shining green kundan maang tikka with premium finish.',
    material: 'Kundan, Gold-plated',
  },
  {
    id: 'jwl-056',
    name: 'Golden Party Maang Tikka',
    category: 'Maang Tikka',
    price: 30, // (1245 × 2) / 83
    originalPrice: 38, // (1576 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59485/Golden--Party-Wear-Kundan-Stylish-Earrings-FNKE111PCH(1).jpg',
    description: 'Stylish golden maang tikka for party wear.',
    material: 'Kundan, Gold-plated',
  },
  {
    id: 'jwl-057',
    name: 'White Party Maang Tikka',
    category: 'Maang Tikka',
    price: 26, // (1095 × 2) / 83
    originalPrice: 33, // (1386 × 2) / 83
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59485/White--Party-Wear-Kundan-Stylish-Earrings-FNKE110WHT(1).jpg',
    description: 'Elegant white maang tikka for special occasions.',
    material: 'Kundan, Gold-plated',
  },
  {
    id: 'jwl-058',
    name: 'Pink Party Maang Tikka',
    category: 'Maang Tikka',
    price: 26,
    originalPrice: 33,
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59485/Pink--Party-Wear-Kundan-Stylish-Earrings-FNKE110PNK(1).jpg',
    description: 'Pretty pink maang tikka for feminine charm.',
    material: 'Kundan, Gold-plated',
  },
];

export const jewelryCategories = ['All', 'Necklaces', 'Earrings', 'Bangles', 'Bridal Sets', 'Maang Tikka'];
