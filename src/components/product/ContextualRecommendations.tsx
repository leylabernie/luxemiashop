/**
 * ContextualRecommendations — "Complete the Look" & "Style It With"
 *
 * Provides AI-search-optimized styling recommendations including jewelry pairings,
 * footwear suggestions, dupatta draping styles, and occasion-based styling bundles.
 * Uses semantic HTML with schema.org markup for LLM discoverability.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Gem,
  Footprints,
  Wind,
  Crown,
  Sparkles,
  ArrowRight,
  Heart,
  Shirt,
  CircleDot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ContextualRecommendationsProps {
  productName: string;
  productType?: string;
  color?: string;
  embroidery?: string;
  occasion?: string[];
}

type ProductCategory = 'lehenga' | 'saree' | 'suit' | 'menswear' | 'other';

// ─── Product Category Classifier ────────────────────────────────────────────

const classifyProduct = (productType?: string): ProductCategory => {
  if (!productType) return 'other';
  const lower = productType.toLowerCase();
  if (lower.includes('lehenga')) return 'lehenga';
  if (lower.includes('saree') || lower.includes('sari')) return 'saree';
  if (
    lower.includes('salwar') ||
    lower.includes('kameez') ||
    lower.includes('anarkali') ||
    lower.includes('sharara') ||
    lower.includes('pakistani') ||
    lower.includes('palazzo') ||
    lower.includes('gharara') ||
    lower.includes('suit') ||
    lower.includes('kurta') ||
    lower.includes('churidar')
  ) {
    if (lower.includes('men') || lower.includes('sherwani') || lower.includes('achkan') || lower.includes('jodhpuri')) return 'menswear';
    return 'suit';
  }
  if (lower.includes('men') || lower.includes('sherwani') || lower.includes('achkan') || lower.includes('jodhpuri') || lower.includes('bandhgala')) return 'menswear';
  return 'other';
};

// ─── Jewelry Recommendations ────────────────────────────────────────────────

interface JewelryRec {
  type: string;
  description: string;
  metalTone: 'gold' | 'silver' | 'rose-gold' | 'mixed';
  productLink: string;
  priority: 'essential' | 'recommended' | 'optional';
}

const JEWELRY_DB: Record<ProductCategory, JewelryRec[]> = {
  lehenga: [
    {
      type: 'Maang Tikka',
      description: 'A forehead ornament that is essential for bridal and pre-wedding lehengas. Choose kundan or polki for traditional looks.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'essential',
    },
    {
      type: 'Choker Necklace',
      description: 'A statement choker in kundan, polki, or uncut diamonds anchors the bridal look. Match the metal tone to the lehenga zari work.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'essential',
    },
    {
      type: 'Jhumka Earrings',
      description: 'Chandelier jhumkas in gold with pearl drops complement every lehenga silhouette. They frame the face beautifully in photos.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'recommended',
    },
    {
      type: 'Bangles / Bangles Set',
      description: 'Stack gold bangles or a bridal choora (red and ivory bangle set) for the complete bridal wrist look.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'recommended',
    },
    {
      type: 'Nose Ring (Nath)',
      description: 'A traditional bridal nose ring adds an authentic finishing touch for the wedding ceremony. Available in clip-on styles.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'optional',
    },
    {
      type: 'Waist Chain (Kamarbandh)',
      description: 'A delicate gold waist chain adds definition to the lehenga silhouette and catches the light beautifully when you move.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'optional',
    },
  ],
  saree: [
    {
      type: 'Statement Earrings',
      description: 'For Banarasi and Kanchipuram silk sarees, choose jhumkas or temple-style earrings. For lighter sarees, diamond studs or drop earrings work beautifully.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'essential',
    },
    {
      type: 'Necklace',
      description: 'A medium-length necklace or haram (long necklace) complements the saree blouse neckline. For deep necklines, a layered necklace set creates drama.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'recommended',
    },
    {
      type: 'Maang Tikka',
      description: 'A small to medium maang tikka is perfect for wedding guest sarees and festival occasions. It adds tradition without overpowering.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'recommended',
    },
    {
      type: 'Bangles',
      description: 'Glass bangles in colors matching the saree border, or gold bangles for silk sarees, complete the wrist styling.',
      metalTone: 'mixed',
      productLink: '/jewelry',
      priority: 'recommended',
    },
    {
      type: 'Waist Belt (Kamarbandh)',
      description: 'A thin, decorative chain belt worn over the saree pallu pleats adds a modern, structured element to the drape.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'optional',
    },
    {
      type: 'Hair Accessories',
      description: 'Decorative hair pins, fresh flowers (gajra), or a jeweled hair comb elevate the saree look for special occasions.',
      metalTone: 'mixed',
      productLink: '/jewelry',
      priority: 'optional',
    },
  ],
  suit: [
    {
      type: 'Statement Earrings',
      description: 'Chandelier earrings or jhumkas are the single most impactful accessory for anarkali and straight-cut suits.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'essential',
    },
    {
      type: 'Maang Tikka',
      description: 'A delicate maang tikka pairs beautifully with anarkali suits, drawing attention to the face and complementing the flared silhouette.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'recommended',
    },
    {
      type: 'Bracelet / Bangle Set',
      description: 'One or two statement bangles or a delicate bracelet stack complete the wrist without competing with the earrings.',
      metalTone: 'mixed',
      productLink: '/jewelry',
      priority: 'recommended',
    },
    {
      type: 'Rings',
      description: 'A statement ring or a set of stackable rings adds subtle sparkle without overwhelming the suit\'s design.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'optional',
    },
    {
      type: 'Anklets (Payal)',
      description: 'Delicate anklets with tiny bells add a traditional, feminine touch — especially beautiful with cropped salwar pants.',
      metalTone: 'silver',
      productLink: '/jewelry',
      priority: 'optional',
    },
  ],
  menswear: [
    {
      type: 'Brooch / Lapel Pin',
      description: 'A jeweled brooch or kalgi on the sherwani lapel adds a regal focal point. Choose one with a feather or stone centerpiece.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'recommended',
    },
    {
      type: 'Pocket Square',
      description: 'A silk pocket square in a contrasting or complementary color adds polish to Jodhpuri and bandhgala suits.',
      metalTone: 'mixed',
      productLink: '/collections',
      priority: 'recommended',
    },
    {
      type: 'Safa / Turban Pin (Sarpech)',
      description: 'A jeweled turban ornament (sarpech) is essential for groom sherwanis. It adds height and grandeur to the overall look.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'optional',
    },
    {
      type: 'Watch',
      description: 'A classic dress watch with a leather or metal strap adds understated sophistication to any Indian menswear ensemble.',
      metalTone: 'mixed',
      productLink: '/collections',
      priority: 'optional',
    },
  ],
  other: [
    {
      type: 'Statement Earrings',
      description: 'Choose earrings that complement the neckline and embellishment level of your outfit.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'recommended',
    },
    {
      type: 'Necklace',
      description: 'A necklace that matches the embroidery tone and outfit color creates a cohesive, polished look.',
      metalTone: 'gold',
      productLink: '/jewelry',
      priority: 'recommended',
    },
    {
      type: 'Bangles',
      description: 'Stackable bangles or a single statement cuff add tradition and movement to any ethnic outfit.',
      metalTone: 'mixed',
      productLink: '/jewelry',
      priority: 'optional',
    },
  ],
};

// ─── Footwear Recommendations ───────────────────────────────────────────────

interface FootwearRec {
  type: string;
  description: string;
  bestFor: string[];
}

const FOOTWEAR_DB: Record<ProductCategory, FootwearRec[]> = {
  lehenga: [
    {
      type: 'Embroidered Juttis',
      description: 'Traditional Punjabi juttis with zari or thread embroidery that matches the lehenga. Comfortable for hours of wear and perfect for dancing at sangeet.',
      bestFor: ['wedding', 'sangeet', 'mehndi'],
    },
    {
      type: 'Block Heels (2-3 inch)',
      description: 'Embellished block heels provide stability while adding height that helps the lehenga flare fall beautifully. Choose metallic tones.',
      bestFor: ['reception', 'engagement', 'party'],
    },
    {
      type: 'Kolhapuris',
      description: 'Traditional leather Kolhapuris with toe rings and intricate strapwork. Flat, comfortable, and authentically ethnic.',
      bestFor: ['mehndi', 'haldi', 'daytime events'],
    },
    {
      type: 'Wedding Mojaris',
      description: 'Luxury mojaris in velvet or silk with gold embroidery. The premium choice for bridal lehengas and groom coordination.',
      bestFor: ['bridal', 'wedding ceremony'],
    },
  ],
  saree: [
    {
      type: 'Block Heels (2-3 inch)',
      description: 'The most stable and comfortable heel height for saree draping. Choose gold, silver, or a color matching the saree border.',
      bestFor: ['wedding', 'reception', 'party'],
    },
    {
      type: 'Embellished Juttis',
      description: 'Closed-toe juttis with embroidery that complements the saree blouse. Comfortable for all-day events.',
      bestFor: ['festival', 'pooja', 'daytime events'],
    },
    {
      type: 'Kolhapuris',
      description: 'Flat, traditional leather sandals that pair beautifully with cotton silk and handloom sarees for a heritage look.',
      bestFor: ['casual', 'festival', 'temple visits'],
    },
    {
      type: 'Wedges',
      description: 'A comfortable middle ground between flats and heels. Wedges provide height with excellent stability for saree wear.',
      bestFor: ['cocktail party', 'engagement', 'informal gatherings'],
    },
  ],
  suit: [
    {
      type: 'Embroidered Juttis',
      description: 'Versatile and comfortable, juttis work with every suit style from anarkali to palazzo. Match the embroidery to the suit embellishment.',
      bestFor: ['wedding', 'festival', 'party'],
    },
    {
      type: 'Kolhapuris',
      description: 'Traditional flat sandals that are perfect for casual suits and daytime events. The quintessential everyday ethnic footwear.',
      bestFor: ['casual', 'daily wear', 'daytime events'],
    },
    {
      type: 'Block Heels',
      description: 'Comfortable block heels in metallic or matching tones elongate the silhouette with palazzo and sharara suits.',
      bestFor: ['party', 'reception', 'evening events'],
    },
    {
      type: 'Ballet Flats',
      description: 'Simple, elegant flats in a coordinating color. Ideal for work-appropriate ethnic looks and long days.',
      bestFor: ['office', 'casual', 'daily wear'],
    },
  ],
  menswear: [
    {
      type: 'Mojaris',
      description: 'Traditional embroidered shoes with curled toes, available in leather or velvet. The essential footwear for sherwanis and Jodhpuri suits.',
      bestFor: ['wedding', 'reception', 'engagement'],
    },
    {
      type: 'Juttis',
      description: 'Flat, closed-toe shoes with intricate embroidery. Comfortable for long ceremonies and dancing at the baraat.',
      bestFor: ['sangeet', 'mehndi', 'haldi'],
    },
    {
      type: 'Kolhapuris',
      description: 'Traditional leather sandals that pair well with kurta sets for casual and daytime events.',
      bestFor: ['casual', 'festival', 'daytime'],
    },
    {
      type: 'Formal Dress Shoes',
      description: 'Patent leather Oxfords or loafers for a modern Indo-Western look with bandhgala suits at cocktail events.',
      bestFor: ['reception', 'cocktail party', 'modern events'],
    },
  ],
  other: [
    {
      type: 'Embroidered Juttis',
      description: 'Versatile ethnic footwear that complements most Indian outfits.',
      bestFor: ['wedding', 'festival', 'party'],
    },
    {
      type: 'Block Heels',
      description: 'Stable and comfortable heels that work with most ethnic silhouettes.',
      bestFor: ['party', 'evening', 'formal'],
    },
    {
      type: 'Kolhapuris',
      description: 'Traditional flat sandals for casual ethnic wear.',
      bestFor: ['casual', 'daytime'],
    },
  ],
};

// ─── Dupatta Draping Styles ─────────────────────────────────────────────────

interface DupattaDrape {
  name: string;
  description: string;
  bestFor: string[];
  style: 'traditional' | 'modern' | 'bridal';
}

const DUPATTA_DRAPES: Record<string, DupattaDrape[]> = {
  lehenga: [
    {
      name: 'Shoulder Drape',
      description: 'Pin the dupatta at the right shoulder and let it flow freely down the back. This is the most popular and versatile lehenga dupatta style — it keeps the hands free and shows off the choli design.',
      bestFor: ['sangeet', 'reception', 'party'],
      style: 'modern',
    },
    {
      name: 'Front Pallu Drape',
      description: 'Drape the dupatta across the front of the body, covering the chest, and pin it at the left shoulder. This is the classic bridal drape style, offering elegance and modesty.',
      bestFor: ['bridal', 'wedding ceremony', 'pooja'],
      style: 'traditional',
    },
    {
      name: 'Double Dupatta Drape',
      description: 'Use two dupattas — one draped over the head and shoulders (ghoonghat style) and the other pinned at the shoulder for decoration. This is the quintessential North Indian bridal look.',
      bestFor: ['bridal', 'wedding ceremony'],
      style: 'bridal',
    },
    {
      name: 'Cape Drape',
      description: 'Pin both ends of the dupatta at the shoulders so it falls like a cape behind you. This contemporary style is perfect for modern brides who want freedom of movement.',
      bestFor: ['reception', 'engagement', 'cocktail'],
      style: 'modern',
    },
    {
      name: 'Wrist Loop Drape',
      description: 'Pin the dupatta at one shoulder, then loop it around the opposite wrist. This keeps the dupatta secure while creating a graceful line across the body.',
      bestFor: ['sangeet', 'mehndi'],
      style: 'modern',
    },
    {
      name: 'Saree-Style Drape',
      description: 'Pleat the dupatta and tuck it into the lehenga waistband at the front, then bring it over the shoulder. This creates a fusion look that combines lehenga and saree aesthetics.',
      bestFor: ['engagement', 'reception'],
      style: 'modern',
    },
  ],
  saree: [
    {
      name: 'Nivi Drape',
      description: 'The most common saree drape — tuck at the right waist, wrap once, make 5-7 front pleats, tuck in the center, and drape the pallu over the left shoulder. Elegant and universally flattering.',
      bestFor: ['wedding', 'reception', 'party', 'formal'],
      style: 'traditional',
    },
    {
      name: 'Bengali Drape',
      description: 'The pallu is brought from the back over the right shoulder, with the key bunch of keys or a decorative ring holding it in place. The broad pleats are worn in the front. Culturally distinctive and striking.',
      bestFor: ['wedding', 'festival', 'cultural events'],
      style: 'traditional',
    },
    {
      name: 'Gujarati Drape (Seedha Pallu)',
      description: 'The pallu is brought from the back over the right shoulder and spread across the front. This drape showcases the pallu design beautifully and is ideal for heavily worked pallus.',
      bestFor: ['bridal', 'festival', 'garba'],
      style: 'traditional',
    },
    {
      name: 'Butterfly Drape',
      description: 'A modern draping style where the pallu is pinned to create a butterfly-wing effect at the shoulder. Slimming and elegant, it works beautifully with georgette and chiffon sarees.',
      bestFor: ['reception', 'cocktail party', 'evening'],
      style: 'modern',
    },
    {
      name: 'Mumtaz Drape',
      description: 'Inspired by vintage Bollywood — the saree is wrapped tightly around the body with the pallu brought over the shoulder and left flowing. Creates a slim, columnar silhouette.',
      bestFor: ['party', 'sangeet', 'cocktail'],
      style: 'modern',
    },
    {
      name: 'Pant-Style Drape',
      description: 'Wear the saree over fitted pants or leggings instead of a petticoat. A fusion drape that is comfortable, modern, and perfect for Indo-western events.',
      bestFor: ['cocktail', 'casual party', 'modern events'],
      style: 'modern',
    },
  ],
  suit: [
    {
      name: 'Shoulder Drape',
      description: 'Drape the dupatta over one shoulder and pin it at the shoulder. This is the simplest and most popular dupatta style for suits — sleek, comfortable, and elegant.',
      bestFor: ['daily wear', 'office', 'casual'],
      style: 'traditional',
    },
    {
      name: 'Front Drape',
      description: 'Bring the dupatta across the front of the body and pin it at the opposite shoulder. This style offers more coverage and a traditional, modest look.',
      bestFor: ['pooja', 'festival', 'formal'],
      style: 'traditional',
    },
    {
      name: 'Neck Drape',
      description: 'Drape the dupatta loosely around the neck like a scarf, letting both ends hang in front. This modern style is perfect for palazzo suits and anarkalis.',
      bestFor: ['party', 'casual', 'modern'],
      style: 'modern',
    },
    {
      name: 'Arm Drape',
      description: 'Pin one end at the shoulder, wrap the dupatta around both arms, and let it hang at the back. Creates a graceful, flowing effect when you move.',
      bestFor: ['wedding guest', 'reception', 'party'],
      style: 'modern',
    },
    {
      name: 'Belted Drape',
      description: 'Drape the dupatta over one shoulder and cinch it at the waist with a decorative kamarbandh or chain belt. This adds structure and a contemporary edge to anarkali suits.',
      bestFor: ['engagement', 'party', 'evening'],
      style: 'modern',
    },
    {
      name: 'Head Drape',
      description: 'Cover the head with the dupatta and drape it over both shoulders. The most traditional drape, worn during religious ceremonies and weddings.',
      bestFor: ['wedding', 'pooja', 'religious ceremonies'],
      style: 'traditional',
    },
  ],
};

// ─── Styling Bundles ────────────────────────────────────────────────────────

interface StylingBundle {
  name: string;
  description: string;
  items: string[];
  link: string;
}

const STYLING_BUNDLES: Record<ProductCategory, StylingBundle[]> = {
  lehenga: [
    {
      name: 'Bridal Ceremony Bundle',
      description: 'Complete your bridal look with our curated selection of essential accessories.',
      items: ['Maang Tikka', 'Kundan Necklace Set', 'Bridal Jhumkas', 'Bridal Choora', 'Embroidered Juttis'],
      link: '/jewelry',
    },
    {
      name: 'Sangeet Night Bundle',
      description: 'Dance the night away with comfortable yet dazzling accessories.',
      items: ['Statement Earrings', 'Bangle Set', 'Comfortable Juttis', 'Hair Accessories'],
      link: '/jewelry',
    },
    {
      name: 'Mehndi Day Bundle',
      description: 'Light and bright accessories for a fun, colorful mehndi celebration.',
      items: ['Floral Jewelry', 'Colorful Bangles', 'Kolhapuris', 'Gajra (Hair Flowers)'],
      link: '/jewelry',
    },
  ],
  saree: [
    {
      name: 'Wedding Guest Bundle',
      description: 'Elegant accessories that complement silk and Banarasi sarees without overshadowing the bride.',
      items: ['Temple Jewelry Set', 'Jhumka Earrings', 'Bangles', 'Hair Pins'],
      link: '/jewelry',
    },
    {
      name: 'Festival Bundle',
      description: 'Traditional accessories perfect for Diwali, Navratri, and family celebrations.',
      items: ['Gold-Toned Earrings', 'Kamarbandh', 'Colorful Bangles', 'Gajra'],
      link: '/jewelry',
    },
    {
      name: 'Reception Glamour Bundle',
      description: 'Modern, sophisticated accessories for evening receptions and cocktail parties.',
      items: ['Diamond/Polki Necklace', 'Drop Earrings', 'Clutch Purse', 'Block Heels'],
      link: '/jewelry',
    },
  ],
  suit: [
    {
      name: 'Wedding Guest Bundle',
      description: 'Graceful accessories for attending weddings in anarkali or straight-cut suits.',
      items: ['Statement Earrings', 'Maang Tikka', 'Delicate Bracelet', 'Embroidered Juttis'],
      link: '/jewelry',
    },
    {
      name: 'Festive Bundle',
      description: 'Bright, joyful accessories for Diwali, Eid, and Navratri celebrations.',
      items: ['Colorful Earrings', 'Bangle Stack', 'Anklets', 'Dupatta Pin Set'],
      link: '/jewelry',
    },
    {
      name: 'Party Night Bundle',
      description: 'Glamorous accessories to transform your suit into a showstopping party look.',
      items: ['Chandelier Earrings', 'Statement Ring', 'Metallic Clutch', 'Block Heels'],
      link: '/jewelry',
    },
  ],
  menswear: [
    {
      name: 'Groom Wedding Bundle',
      description: 'Essential accessories for the groom on the main wedding day.',
      items: ['Safa (Turban)', 'Sarpech (Turban Pin)', 'Brooch/Kalgi', 'Mojaris', 'Dupatta/Stole'],
      link: '/collections',
    },
    {
      name: 'Groomsmen Bundle',
      description: 'Coordinated accessories for the baraat and wedding celebrations.',
      items: ['Matching Stole', 'Brooch Set', 'Juttis', 'Pocket Square'],
      link: '/collections',
    },
    {
      name: 'Mehndi Casual Bundle',
      description: 'Relaxed, comfortable accessories for daytime pre-wedding events.',
      items: ['Kolhapuris', 'Cotton Stole', 'Simple Watch', 'Sunglasses'],
      link: '/collections',
    },
  ],
  other: [
    {
      name: 'Essential Ethnic Bundle',
      description: 'Must-have accessories to complete any ethnic outfit.',
      items: ['Statement Earrings', 'Matching Bangles', 'Juttis', 'Clutch'],
      link: '/jewelry',
    },
    {
      name: 'Festival Ready Bundle',
      description: 'Get festive-ready with our curated accessory selection.',
      items: ['Traditional Jewelry Set', 'Hair Accessories', 'Embroidered Footwear'],
      link: '/jewelry',
    },
  ],
};

// ─── Related Collection Links ───────────────────────────────────────────────

interface CollectionLink {
  name: string;
  url: string;
  description: string;
}

const RELATED_COLLECTIONS: Record<ProductCategory, CollectionLink[]> = {
  lehenga: [
    { name: 'Bridal Lehengas', url: '/lehengas', description: 'Explore our full collection of bridal and wedding lehengas' },
    { name: 'Wedding Jewelry', url: '/jewelry', description: 'Kundan, polki, and bridal jewelry sets' },
    { name: 'Mehndi Outfits', url: '/mehendi-outfits', description: 'Bright and festive outfits for the mehndi ceremony' },
    { name: 'Sangeet Collection', url: '/lehengas', description: 'Sequin and mirror-work lehengas for the sangeet night' },
  ],
  saree: [
    { name: 'Banarasi Sarees', url: '/sarees', description: 'Handwoven silk sarees from Varanasi' },
    { name: 'Wedding Sarees', url: '/sarees', description: 'Bridal and wedding guest saree collection' },
    { name: 'Temple Jewelry', url: '/jewelry', description: 'Traditional jewelry for silk sarees' },
    { name: 'Reception Wear', url: '/sarees', description: 'Georgette and chiffon sarees for evening events' },
  ],
  suit: [
    { name: 'Anarkali Suits', url: '/suits', description: 'Flowing, elegant anarkali suits for every occasion' },
    { name: 'Salwar Kameez', url: '/suits', description: 'Traditional and contemporary salwar suits' },
    { name: 'Festive Jewelry', url: '/jewelry', description: 'Earrings, bangles, and accessories for suit styling' },
    { name: 'Party Wear', url: '/suits', description: 'Sequin and embroidered suits for celebrations' },
  ],
  menswear: [
    { name: 'Sherwanis', url: '/menswear', description: 'Regal sherwanis for grooms and wedding guests' },
    { name: 'Kurta Sets', url: '/menswear', description: 'Comfortable kurta pajamas for casual and festive wear' },
    { name: 'Accessories', url: '/collections', description: 'Stoles, brooches, and grooming essentials' },
    { name: 'Groom Collection', url: '/menswear', description: 'Curated ensembles for the modern Indian groom' },
  ],
  other: [
    { name: 'New Arrivals', url: '/new-arrivals', description: 'The latest additions to our collection' },
    { name: 'Jewelry', url: '/jewelry', description: 'Handcrafted jewelry to complement any outfit' },
    { name: 'All Collections', url: '/collections', description: 'Browse our complete range of ethnic wear' },
    { name: 'Wedding Guest', url: '/wedding-guest-outfits', description: 'Perfect outfits for attending Indian weddings' },
  ],
};

// ─── Priority Badge Helper ──────────────────────────────────────────────────

const PriorityBadge = ({ priority }: { priority: 'essential' | 'recommended' | 'optional' }) => {
  const styles = {
    essential: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    recommended: 'bg-primary/10 text-primary border-primary/20',
    optional: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[priority]}`}>
      {priority}
    </span>
  );
};

// ─── Drape Style Badge ──────────────────────────────────────────────────────

const DrapeStyleBadge = ({ style }: { style: 'traditional' | 'modern' | 'bridal' }) => {
  const styles = {
    traditional: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    modern: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    bridal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  };

  const labels = {
    traditional: 'Traditional',
    modern: 'Modern',
    bridal: 'Bridal',
  };

  return (
    <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[style]}`}>
      {labels[style]}
    </span>
  );
};

// ─── Component ──────────────────────────────────────────────────────────────

export const ContextualRecommendations = ({
  productName,
  productType,
  color,
  embroidery,
  occasion,
}: ContextualRecommendationsProps) => {
  const category = classifyProduct(productType);

  const jewelry = useMemo(() => JEWELRY_DB[category], [category]);
  const footwear = useMemo(() => FOOTWEAR_DB[category], [category]);
  const drapes = useMemo(() => DUPATTA_DRAPES[category] || DUPATTA_DRAPES.suit, [category]);
  const bundles = useMemo(() => STYLING_BUNDLES[category], [category]);
  const collections = useMemo(() => RELATED_COLLECTIONS[category], [category]);

  // Infer metal tone recommendation from embroidery and color
  const metalToneRecommendation = useMemo(() => {
    const emb = (embroidery || '').toLowerCase();
    const col = (color || '').toLowerCase();
    if (emb.includes('silver') || emb.includes('white') || col.includes('blue') || col.includes('pastel') || col.includes('pink') || col.includes('lilac')) {
      return 'Silver-toned and diamond jewelry complements the cool tones of this garment.';
    }
    return 'Gold-toned jewelry complements the warm tones of this garment beautifully.';
  }, [embroidery, color]);

  return (
    <section
      className="py-12 border-t border-border"
      data-ai-semantic="contextual-recommendations"
      aria-label={`Style recommendations for ${productName}`}
    >
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl lg:text-2xl font-serif">Complete the Look</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Curated styling recommendations to elevate your {productName}. From jewelry to footwear,
          discover everything you need for a cohesive ethnic ensemble.
        </p>
        {embroidery && (
          <p className="text-sm text-primary mt-2" data-ai-context="metal-tone-guide">
            <Heart className="h-3.5 w-3.5 inline mr-1" />
            {metalToneRecommendation}
          </p>
        )}
      </div>

      {/* ─── Jewelry Pairings ─────────────────────────────────────────────── */}
      {category !== 'other' && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Gem className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-medium">Jewelry Pairings</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jewelry.map((item, i) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="p-4 border border-border rounded-sm hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{item.type}</h4>
                  <PriorityBadge priority={item.priority} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {item.description}
                </p>
                <div className="flex items-center gap-2">
                  <CircleDot className="h-3 w-3" style={{
                    color: item.metalTone === 'gold' ? '#D4AF37' : item.metalTone === 'silver' ? '#C0C0C0' : item.metalTone === 'rose-gold' ? '#B76E79' : '#D4AF37'
                  }} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {item.metalTone === 'gold' ? 'Gold Tone' : item.metalTone === 'silver' ? 'Silver Tone' : item.metalTone === 'rose-gold' ? 'Rose Gold' : 'Mixed Metals'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <Button variant="ghost" size="sm" asChild className="luxury-link text-xs">
              <Link to="/jewelry">
                Browse All Jewelry
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* ─── Footwear Recommendations ─────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Footprints className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-medium">Footwear Recommendations</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {footwear.map((item, i) => (
            <motion.div
              key={item.type}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="p-4 border border-border rounded-sm"
            >
              <h4 className="font-medium text-sm mb-2">{item.type}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.bestFor.map((occ) => (
                  <span
                    key={occ}
                    className="text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full"
                  >
                    {occ}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Dupatta Draping Styles ───────────────────────────────────────── */}
      {category !== 'menswear' && category !== 'other' && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Wind className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-medium">
              {category === 'saree' ? 'Saree Draping Styles' : 'Dupatta Draping Styles'}
            </h3>
          </div>
          <div className="space-y-3">
            {drapes.map((drape, i) => (
              <motion.div
                key={drape.name}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="p-4 border border-border rounded-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{drape.name}</h4>
                  <DrapeStyleBadge style={drape.style} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {drape.description}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  <span className="font-medium">Best for:</span>{' '}
                  {drape.bestFor.join(', ')}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Occasion-Based Styling Bundles ───────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-medium">Occasion Styling Bundles</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bundles.map((bundle, i) => (
            <motion.div
              key={bundle.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="p-5 border border-border rounded-sm bg-secondary/20 hover:bg-secondary/40 transition-colors"
            >
              <h4 className="font-medium text-sm mb-2">{bundle.name}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {bundle.description}
              </p>
              <ul className="space-y-1.5 mb-4">
                {bundle.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-foreground">
                    <Gem className="h-3 w-3 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                <Link to={bundle.link}>
                  <Shirt className="h-3 w-3 mr-1" />
                  Explore Bundle
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Semantic Links to Related Collections ────────────────────────── */}
      <div
        className="p-5 bg-secondary/30 border border-border rounded-sm"
        data-ai-semantic="related-collections"
      >
        <h3 className="text-sm font-medium mb-3">Explore Related Collections</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {collections.map((col) => (
            <Link
              key={col.url + col.name}
              to={col.url}
              className="group flex items-center gap-3 p-3 bg-background border border-border rounded-sm hover:border-primary/40 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <p className="text-sm font-medium group-hover:text-primary transition-colors">
                  {col.name}
                </p>
                <p className="text-[11px] text-muted-foreground">{col.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Hidden Semantic Context for AI Search */}
      <div className="sr-only" aria-hidden="true" data-ai-context="styling-semantic-data">
        <p>Styling recommendations for {productName}: Pair with {jewelry.map(j => j.type).join(', ')}. Footwear options include {footwear.map(f => f.type).join(', ')}. {category !== 'menswear' && category !== 'other' ? `Draping styles: ${drapes.map(d => d.name).join(', ')}.` : ''} Occasion bundles available for {bundles.map(b => b.name).join(', ')}.</p>
      </div>
    </section>
  );
};

export default ContextualRecommendations;
