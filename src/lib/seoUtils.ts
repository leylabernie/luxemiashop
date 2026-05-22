/**
 * SEO Metadata Generation Utilities for LuxeMia
 * Generates AI-search-optimized, semantically rich metadata for any product
 */

import type { LocalProduct } from '../data/localProducts';
import type { SareeProduct } from '../data/sareeProducts';
import type { SuitProduct } from '../data/suitProducts';
import type { MenswearProduct } from '../data/menswearProducts';

type AnyProduct = LocalProduct | SareeProduct | SuitProduct | MenswearProduct;

// ── Color hierarchy constants ──
const GARMENT_BASE_TERMS = ['lehenga', 'skirt', 'choli', 'blouse', 'sherwani', 'kurta', 'gown', 'saree', 'anarkali', 'sharara', 'palazzo'];
const DUPATTA_TERMS = ['dupatta', 'scarf', 'veil', 'odhni', 'palla'];

/**
 * Extract base garment color vs accent/dupatta color from title/description
 * Handles the common problem of dupatta color being emphasized over garment color
 */
export function extractColorHierarchy(product: AnyProduct): {
  baseColor: string;
  accentColor?: string;
  dupattaColor?: string;
  fullColorDescription: string;
} {
  const title = product.title.toLowerCase();
  const desc = product.description.toLowerCase();
  const color = product.color || '';
  
  // Try to detect if title emphasizes dupatta color incorrectly
  const hasDupattaInTitle = DUPATTA_TERMS.some(t => title.includes(t));
  const hasLehengaInTitle = title.includes('lehenga');
  
  // If title has "with" or "and" it might be describing two colors
  const colorSplit = color.match(/^(.+?)\s+(?:with|and|plus)\s+(.+)$/i);
  
  if (colorSplit) {
    return {
      baseColor: colorSplit[1].trim(),
      accentColor: colorSplit[2].trim(),
      dupattaColor: colorSplit[2].trim(),
      fullColorDescription: `${colorSplit[1].trim()} with ${colorSplit[2].trim()} accent`
    };
  }
  
  // Parse from title patterns like "[BaseColor] [Fabric] [Work] Lehenga with [Accent] Dupatta"
  const withMatch = product.title.match(/^(.+?)\s+(?:with|w\/|plus)\s+(.+)$/i);
  if (withMatch) {
    return {
      baseColor: withMatch[1].trim(),
      accentColor: withMatch[2].trim(),
      dupattaColor: withMatch[2].trim(),
      fullColorDescription: `${withMatch[1].trim()} with ${withMatch[2].trim()} accent`
    };
  }
  
  // Default: use product.color as base, try to infer accent from description
  const dupattaColorMatch = desc.match(/(?:dupatta|scarf|veil)\s*(?:is|in|features|with)\s+([a-z\s]+?)(?:\s+color|\.|:|,)/i);
  const dupattaColor = dupattaColorMatch ? dupattaColorMatch[1].trim() : undefined;
  
  return {
    baseColor: color,
    accentColor: dupattaColor,
    dupattaColor,
    fullColorDescription: dupattaColor 
      ? `${color} with ${dupattaColor} dupatta`
      : color
  };
}

/**
 * Generate SEO-optimized, semantically rich image alt text
 * Describes actual garment colors, not just product title
 */
export function generateImageAltText(product: AnyProduct, imageIndex: number = 0, totalImages: number = 1): string {
  const { baseColor, accentColor, fullColorDescription } = extractColorHierarchy(product);
  const category = product.category || '';
  const fabric = (product as any).fabric || '';
  const work = (product as any).work || '';
  const occasion = (product as any).occasion || '';
  
  // Build rich alt text that describes what the image actually shows
  const parts: string[] = [];
  
  // Main subject
  parts.push(`${fullColorDescription} ${category}`);
  
  // Fabric and work
  if (fabric) parts.push(`in ${fabric}`);
  if (work) parts.push(`with ${work}`);
  
  // View angle based on image index
  if (totalImages > 1) {
    const views = ['front view', 'side view', 'back view', 'detail view', 'dupatta close-up'];
    parts.push(views[imageIndex % views.length]);
  }
  
  // Brand
  parts.push('| LuxeMia Indian Ethnic Wear');
  
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Generate AI-search-optimized product description
 * Targets: Google AI Overviews, Perplexity, ChatGPT, Bing Copilot
 */
export function generateAISearchDescription(product: AnyProduct): string {
  const { baseColor, accentColor, fullColorDescription } = extractColorHierarchy(product);
  const category = product.category || '';
  const fabric = (product as any).fabric || '';
  const work = (product as any).work || '';
  const occasion = (product as any).occasion || '';
  const color = product.color || '';
  
  const paragraphs: string[] = [];
  
  // P1: Opening with entity-rich description
  paragraphs.push(
    `The ${product.title} is a ${fullColorDescription} ${category.toLowerCase()} ` +
    `crafted from premium ${fabric}. This ${occasion.toLowerCase()} ensemble features exquisite ${work.toLowerCase()} ` +
    `that showcases traditional Indian craftsmanship. The ${baseColor} base ` +
    (accentColor ? `is beautifully complemented by a ${accentColor} dupatta, creating a striking contrast.` : `creates an elegant, timeless aesthetic.`)
  );
  
  // P2: Styling and occasion guidance (AI search loves this)
  paragraphs.push(
    `Perfect for ${occasion.toLowerCase()} celebrations, this ${fabric.toLowerCase()} ${category.toLowerCase().replace(/s$/, '')} ` +
    `pairs beautifully with traditional Kundan jewelry, matching bangles, and elegant heels. ` +
    `Style your hair in a classic bun adorned with fresh flowers for a complete bridal look, ` +
    `or opt for soft waves for reception elegance. The versatile color palette works across ` +
    `multiple lighting conditions, ensuring stunning photography throughout your event.`
  );
  
  // P3: Care
  paragraphs.push(
    `Crafted from ${fabric.toLowerCase()} with ${work.toLowerCase()}. Dry clean only. ` +
    `Available in custom sizing. Contact +1-215-341-9990 for styling consultation.`
  );
  
  return paragraphs.join('\n\n');
}

/**
 * Generate semantic keyword tags for internal linking and search
 */
export function generateSemanticTags(product: AnyProduct): string[] {
  const { baseColor, accentColor } = extractColorHierarchy(product);
  const category = product.category || '';
  const fabric = (product as any).fabric || '';
  const work = (product as any).work || '';
  const occasion = (product as any).occasion || '';
  const color = product.color || '';
  
  const tags = new Set<string>(product.tags || []);
  
  // Color variations for search
  const colorAliases: Record<string, string[]> = {
    'rani pink': ['rani-pink', 'hot-pink', 'fuchsia', 'magenta-bridal', 'pink-lehenga'],
    'pastel pink': ['pastel-pink', 'blush-pink', 'light-pink', 'baby-pink', 'soft-pink'],
    'maroon': ['maroon', 'burgundy', 'wine-red', 'deep-red', 'oxblood'],
    'pearl white': ['pearl-white', 'ivory', 'off-white', 'cream', 'white-bridal'],
    'royal blue': ['royal-blue', 'navy-blue', 'deep-blue', 'sapphire'],
    'emerald green': ['emerald', 'green-bridal', 'forest-green'],
    'mustard': ['mustard', 'yellow-gold', 'golden-yellow', 'haldi-color'],
  };
  
  // Add color aliases
  const baseLower = baseColor.toLowerCase();
  for (const [key, aliases] of Object.entries(colorAliases)) {
    if (baseLower.includes(key) || key.includes(baseLower)) {
      aliases.forEach(a => tags.add(a));
    }
  }
  
  // Add occasion + category combinations for long-tail SEO
  tags.add(`${occasion.toLowerCase().replace(/\s+/g, '-')}`.replace(/-+/g, '-'));
  tags.add(`${fabric.toLowerCase().replace(/\s+/g, '-')}`.replace(/-+/g, '-'));
  tags.add(`${work.toLowerCase().replace(/\s+/g, '-')}`.replace(/-+/g, '-'));
  tags.add(`${baseColor.toLowerCase().replace(/\s+/g, '-')}-bridal`.replace(/-+/g, '-'));
  tags.add(`indian-ethnic-wear`);
  tags.add(`usa-shipping`);
  tags.add(`custom-stitching`);
  
  // Add AI-search friendly tags
  tags.add(`what-to-wear-${occasion.toLowerCase().replace(/\s+/g, '-')}`);
  tags.add(`${fabric.toLowerCase().replace(/\s+/g, '-')} ${category.toLowerCase().replace(/\s+/g, '-')}`);
  
  return Array.from(tags).slice(0, 20); // Max 20 tags for Shopify
}

/**
 * Generate product schema color property
 * Maps to Schema.org color property for Product
 */
export function getSchemaColor(product: AnyProduct): string {
  const { baseColor, accentColor, fullColorDescription } = extractColorHierarchy(product);
  return fullColorDescription;
}

/**
 * Generate AI-search friendly FAQ for a product
 */
export function generateProductFAQ(product: AnyProduct): Array<{question: string; answer: string}> {
  const { baseColor, accentColor, fullColorDescription } = extractColorHierarchy(product);
  const category = product.category || '';
  const fabric = (product as any).fabric || '';
  const work = (product as any).work || '';
  const occasion = (product as any).occasion || '';
  
  return [
    {
      question: `What is the actual color of this ${category.toLowerCase()}?`,
      answer: `This ${category.toLowerCase()} features a ${baseColor} base garment ${accentColor ? `with a ${accentColor} dupatta accent` : ''}. The color may appear slightly different in photos due to lighting conditions. We offer WhatsApp video calls to show the exact color before purchase.`
    },
    {
      question: `What fabric is used in this ${category.toLowerCase()}?`,
      answer: `Crafted from ${fabric.toLowerCase()} with ${work.toLowerCase()}. Features comfortable drape suitable for extended wear.`
    },
    {
      question: `Is this suitable for ${occasion.toLowerCase()}?`,
      answer: `Yes, this ${fullColorDescription} ${category.toLowerCase()} is specifically designed for ${occasion.toLowerCase()} celebrations. The color palette, fabric choice, and embellishment level are all appropriate for this occasion.`
    },
    {
      question: `Does this include the dupatta and blouse/choli?`,
      answer: `Yes, this ensemble includes a matching dupatta ${accentColor ? `in ${accentColor}` : ''} and a coordinated blouse/choli. Some designs also include additional accessories. Check the product images for the complete set.`
    },
    {
      question: `Can I get custom stitching for this ${category.toLowerCase()}?`,
      answer: `Absolutely. We offer semi-stitched, ready-to-wear, and made-to-measure options. Contact our styling team via WhatsApp at +1-215-341-9990 for custom measurements and fitting guidance. Free alterations are available within 30 days of delivery.`
    },
    {
      question: `How do I style this ${category.toLowerCase()} for my event?`,
      answer: `This ${baseColor} piece pairs beautifully with traditional Kundan or Polki jewelry. For a complete look, add matching bangles, a maang tikka, and elegant heels. Style your hair in a classic bun with fresh flowers for daytime events, or soft waves for evening receptions.`
    }
  ];
}

/**
 * Generate enhanced meta title that prioritizes garment color over dupatta color
 */
export function generateMetaTitle(product: AnyProduct): string {
  const { baseColor, fullColorDescription } = extractColorHierarchy(product);
  const category = product.category || '';
  const fabric = (product as any).fabric || '';
  const occasion = (product as any).occasion || '';
  
  // Format: [BaseColor] [Fabric] [Occasion] [Category] | LuxeMia
  // Example: Pearl White Silk Bridal Lehenga with Maroon Dupatta | LuxeMia
  const parts = [
    baseColor,
    fabric,
    occasion !== 'Casual' ? occasion : '',
    category.replace(/s$/, ''), // singular
  ].filter(Boolean);
  
  // Add dupatta color if different from base (for accuracy)
  const { accentColor } = extractColorHierarchy(product);
  if (accentColor && accentColor.toLowerCase() !== baseColor.toLowerCase()) {
    parts.push(`with ${accentColor} Dupatta`);
  }
  
  const title = parts.join(' ');
  return `${title} | LuxeMia`;
}

/**
 * Generate enhanced meta description with semantic keywords
 */
export function generateMetaDescription(product: AnyProduct): string {
  const { baseColor, accentColor, fullColorDescription } = extractColorHierarchy(product);
  const category = product.category || '';
  const fabric = (product as any).fabric || '';
  const work = (product as any).work || '';
  const occasion = (product as any).occasion || '';
  const price = product.price || '';
  
  const desc = `Shop ${fullColorDescription} ${category.toLowerCase()} in ${fabric} with ${work}. ` +
    `Perfect for ${occasion.toLowerCase()}. Free shipping to USA, Canada over $350. ` +
    `Custom stitching available. Price: $${price}. LuxeMia luxury Indian ethnic wear.`;
  
  return desc.substring(0, 160); // Keep under 160 chars
}

/**
 * Generate breadcrumb structured data for a product
 */
export function generateProductBreadcrumbs(product: AnyProduct): Array<{name: string; url: string}> {
  const category = product.category || '';
  
  // Map category to collection URL
  const categoryMap: Record<string, string> = {
    'Bridal Lehengas': '/collections/bridal-lehengas',
    'Festive Lehengas': '/lehengas',
    'Occasional Sarees': '/sarees',
    'Bridal Sarees': '/sarees',
    'Silk Sarees': '/collections/silk-sarees',
    'Anarkali Suits': '/collections/anarkali-suits',
    'Pakistani Suits': '/collections/pakistani-suits',
    'Sharara Suits': '/suits',
    'Palazzo Suits': '/suits',
    'Groom Sherwanis': '/menswear',
    'Sherwanis': '/menswear',
    'Kurta Pajamas': '/menswear',
    'Indo Western': '/indowestern',
  };
  
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: category, url: categoryMap[category] || '/collections' },
    { name: product.title, url: `/product/${(product as any).handle || ''}` }
  ];
  
  return crumbs;
}

/**
 * Generate internal linking suggestions for related products
 */
export function getRelatedProductTags(product: AnyProduct): string[] {
  const category = product.category || '';
  const fabric = (product as any).fabric || '';
  const occasion = (product as any).occasion || '';
  const color = product.color || '';
  
  // Tags that will be used to find related products
  return [
    fabric.toLowerCase(),
    occasion.toLowerCase(),
    color.split(' ')[0].toLowerCase(), // first word of color
    category.toLowerCase().replace(/\s+/g, '-'),
  ];
}

/**
 * Detect and flag potential color emphasis issues
 */
export function detectColorEmphasisIssue(product: AnyProduct): {isIssue: boolean; suggestion?: string} {
  const title = product.title.toLowerCase();
  const desc = product.description.toLowerCase();
  
  // Check if title starts with a color that's only mentioned in dupatta context
  const titleColor = title.match(/^([a-z\s]+?)\s+(silk|net|georgette|velvet|cotton|chinon)/i);
  
  if (!titleColor) return { isIssue: false };
  
  const mainColor = titleColor[1].trim();
  
  // Check if description says the LEHENGA/SKIRT is a different color
  const garmentColorMatch = desc.match(/(?:lehenga|skirt|choli|blouse)\s+(?:is|in)\s+([a-z\s]+?)(?:\s+color|\.|:|,)/i);
  
  if (garmentColorMatch) {
    const garmentColor = garmentColorMatch[1].trim();
    if (garmentColor !== mainColor && !mainColor.includes(garmentColor) && !garmentColor.includes(mainColor)) {
      return {
        isIssue: true,
        suggestion: `Title emphasizes "${mainColor}" but garment is "${garmentColor}". Consider: "${garmentColor.charAt(0).toUpperCase() + garmentColor.slice(1)} ${title.replace(mainColor, garmentColor)}"`
      };
    }
  }
  
  return { isIssue: false };
}
