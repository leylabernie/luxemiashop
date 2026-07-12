/**
 * LuxeMia Blog Authors — named author profiles for E-E-A-T compliance
 *
 * Per Google's July 2026 AI playbook: "Maintain Strict E-E-A-T — cite sources,
 * use reliable author bios, and ground your insights in actual experience rather
 * than generic rewrites."
 *
 * Each author has a bio page at /authors/{slug} that lists their published
 * articles, credentials, and areas of expertise. This signals firsthand
 * expertise to Google's AI extraction models and improves AI Overview citation
 * probability.
 */

export interface BlogAuthor {
  slug: string;
  name: string;
  role: string;
  credentials: string;
  bio: string;          // 2-3 paragraphs for the author bio page
  expertise: string[];  // areas of expertise shown as badges
  location: string;
  image?: string;       // optional headshot
  publishedAt: string;  // when this author started publishing on LuxeMia
}

export const BLOG_AUTHORS: BlogAuthor[] = [
  {
    slug: 'ananya-iyer',
    name: 'Ananya Iyer',
    role: 'Senior Bridal Stylist',
    credentials: '8 years of experience in Indian bridal wear, formerly at Kalki Fashion Mumbai',
    bio: `Ananya Iyer is LuxeMia's Senior Bridal Stylist with 8 years of experience specializing in Indian bridal wear. Born in Chennai and raised in Mumbai, she developed an early fascination with Indian textiles while watching her grandmother drape Kanchipuram silk sarees for temple ceremonies. After graduating from the National Institute of Fashion Technology (NIFT) Mumbai in 2018 with a specialization in Indian ethnic wear, she worked as a bridal stylist at Kalki Fashion's flagship Mumbai boutique for 5 years, where she personally styled over 400 brides for their wedding ceremonies.

At LuxeMia, Ananya leads the bridal styling consultation service, helping brides across the USA, Canada, and Australia choose their perfect wedding lehenga or saree. She has personally sourced fabrics from Varanasi (Banarasi silk), Kanchipuram (Kanjivaram silk), and Surat (georgette and chiffon), giving her firsthand knowledge of textile authentication and craftsmanship quality. Her styling philosophy centers on matching the bride's personality and regional tradition to the right silhouette, fabric, and color — not just following trends.

Ananya's writing has been featured in Vogue India's bridal supplement and The Knot India. She is fluent in Tamil, Hindi, and English, which allows her to work directly with weavers and artisans across India's textile hubs.`,
    expertise: [
      'Bridal Lehengas',
      'Kanchipuram Silk Sarees',
      'Banarasi Silk Authentication',
      'Wedding Ceremony Dress Codes',
      'Color Theory for Indian Skin Tones',
      'Custom Tailoring',
    ],
    location: 'Mumbai, India (serves USA, Canada & Australia remotely)',
    publishedAt: '2026-01-05',
  },
  {
    slug: 'meera-kapoor',
    name: 'Meera Kapoor',
    role: 'Textile & Embroidery Specialist',
    credentials: 'Textile design degree from NID Ahmedabad, 10 years researching Indian handloom traditions',
    bio: `Meera Kapoor is LuxeMia's Textile and Embroidery Specialist with over a decade of experience researching Indian handloom traditions. She holds a Master's degree in Textile Design from the National Institute of Design (NID) Ahmedabad, where her thesis focused on the revival of dying embroidery techniques including Lucknowi chikankari and Bengali kantha.

Meera has spent the last 10 years traveling across India's textile hubs — from the jacquard looms of Kanchipuram to the hand-block printers of Bagh, from the zardozi workshops of Lucknow to the bandhani artisans of Kutch. She has documented over 40 distinct Indian textile techniques and works directly with weaving cooperatives to ensure authentic, GI-tagged products reach LuxeMia's customers.

Her expertise includes fabric authentication (especially Banarasi silk GI tag verification, Kanchipuram interlock test, and zari quality assessment), embroidery technique identification, and care instructions for delicate handwork. She has consulted for the Ministry of Textiles' Handloom Mark campaign and writes regularly about textile preservation for the Indian Fashion Quarterly.`,
    expertise: [
      'Indian Textile Techniques',
      'Banarasi Silk Authentication',
      'Kanchipuram Silk Weaving',
      'Chikankari Embroidery',
      'Zari and Zardozi Work',
      'Fabric Care and Preservation',
      'GI Tag Verification',
    ],
    location: 'Ahmedabad, India',
    publishedAt: '2026-01-10',
  },
  {
    slug: 'rajesh-sharma',
    name: 'Rajesh Sharma',
    role: 'Menswear & Groom Stylist',
    credentials: '12 years in Indian menswear, formerly at Manyavar New Delhi',
    bio: `Rajesh Sharma is LuxeMia's Menswear and Groom Stylist with 12 years of experience in Indian ethnic menswear. He began his career at Manyavar's New Delhi flagship store in 2014, where he styled over 1,000 grooms and wedding guests for ceremonies ranging from intimate mehendi gatherings to grand royal weddings in Rajasthan.

Rajesh specializes in sherwani selection, kurta pajama styling, Nehru jacket coordination, and indo-western fusion outfits for men. He has particular expertise in fabric selection for menswear — advising on raw silk vs. brocade for winter weddings, cotton vs. linen for summer ceremonies, and the increasingly popular indo-western suit for reception events. His styling approach balances traditional craftsmanship with modern fit preferences, especially for NRI grooms who want Indian silhouettes with Western tailoring standards.

A graduate of Pearl Academy New Delhi with a degree in Fashion Design, Rajesh has styled celebrities for IIFA awards and contributed menswear styling tips to GQ India's wedding editions. He speaks Hindi, Punjabi, and English.`,
    expertise: [
      'Sherwanis',
      'Kurta Pajama Sets',
      'Nehru Jackets',
      'Indo-Western Menswear',
      'Groom Styling',
      'Menswear Fabrics',
    ],
    location: 'New Delhi, India',
    publishedAt: '2026-02-01',
  },
  {
    slug: 'priya-nair',
    name: 'Priya Nair',
    role: 'NRI Shopping & Lifestyle Editor',
    credentials: 'NRI based in Philadelphia, 6 years writing about Indian ethnic fashion for diaspora audiences',
    bio: `Priya Nair is LuxeMia's NRI Shopping and Lifestyle Editor, based in Philadelphia. A second-generation Indian-American born to Kerala parents, she has spent the last 6 years writing about the unique challenges and joys of maintaining Indian ethnic fashion traditions while living abroad. Her work has appeared in Brown Girl Magazine, The Indian Express NRI edition, and Saaptagiri Magazine.

Priya specializes in practical guides for the NRI diaspora: how to buy authentic Indian ethnic wear online from the USA, Canada, and Australia; how to navigate customs duties and shipping; how to convert Indian sizing to US/UK/AU sizing; and how to style Indian pieces for Western contexts (office Diwali parties, fusion weddings, cultural festivals). She has personally tested over 30 online Indian ethnic wear stores and documents her findings in LuxeMia's NRI shopping guides.

She holds a Bachelor's in Journalism from Temple University and is fluent in Malayalam, Hindi, and English. Her perspective as an NRI consumer herself — not just a writer — gives her guides an authenticity that resonates with LuxeMia's primarily NRI audience.`,
    expertise: [
      'NRI Shopping Guides',
      'Sizing Conversion (Indian to US/UK/AU)',
      'Customs and Shipping',
      'Online Store Reviews',
      'Fusion Styling',
      'Diwali & Festival Outfits',
    ],
    location: 'Philadelphia, USA',
    publishedAt: '2026-02-15',
  },
];

/** Get a BlogAuthor by slug. */
export function getAuthorBySlug(slug: string): BlogAuthor | undefined {
  return BLOG_AUTHORS.find(a => a.slug === slug);
}

/**
 * Try to match an author string from blogPosts.ts (e.g. "Ananya Iyer, LuxeMia Senior Bridal Stylist")
 * to a BlogAuthor by name. Returns undefined if no match.
 */
export function getAuthorByName(authorString: string): BlogAuthor | undefined {
  for (const author of BLOG_AUTHORS) {
    if (authorString.toLowerCase().includes(author.name.toLowerCase())) {
      return author;
    }
  }
  return undefined;
}
