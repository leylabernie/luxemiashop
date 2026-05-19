/**
 * SemanticProductMetadata — Rich semantic HTML for AI search engines
 *
 * Generates LLM-friendly structured markup that helps AI search engines
 * (ChatGPT, Perplexity, Google SGE, Bing Copilot, Claude) understand
 * product context beyond standard schema.org. Includes hidden semantic
 * text, occasion mappings, cultural context, and material metadata.
 */

import { useMemo } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SemanticProductMetadataProps {
  productName: string;
  fabric?: string;
  color?: string;
  embroidery?: string;
  occasion?: string[];
  silhouette?: string;
  neckline?: string;
  sleeveType?: string;
  careInstructions?: string[];
  stylingTips?: string[];
  culturalContext?: string;
  regionOfOrigin?: string;
  productType?: string;
  price?: string;
  currency?: string;
}

// ─── Product Category Classifier ────────────────────────────────────────────

type ProductCategory = 'lehenga' | 'saree' | 'suit' | 'menswear' | 'other';

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

// ─── Category-Specific Cultural Context ─────────────────────────────────────

const CULTURAL_CONTEXT: Record<ProductCategory, string> = {
  lehenga:
    'The lehenga is a traditional Indian garment with origins in Mughal-era India, consisting of a flared skirt, fitted choli (blouse), and dupatta (scarf). It is the quintessential bridal outfit across North India, particularly in Rajasthan, Gujarat, and Punjab. Lehengas are worn at weddings, mehndi ceremonies, sangeet nights, and festive celebrations. The craft traditions include zardozi embroidery from Agra, gota patti work from Jaipur, mirror work from Kutch, and sequin embellishments from Surat.',
  saree:
    'The saree is a timeless Indian garment draped around the body, with a history spanning over 5,000 years. It remains the most versatile and universally worn piece of Indian ethnic clothing across all regions. Banarasi sarees from Varanasi are woven with gold and silver zari brocades, while Kanchipuram silks from Tamil Nadu are known for their temple borders and dense weave. Each region of India has its own distinct saree tradition — from the Kanjeevaram of the South to the Paithani of Maharashtra and the Baluchari of Bengal.',
  suit:
    'The salwar kameez (also called salwar suit) is a comfortable and versatile three-piece outfit consisting of a tunic (kameez), trousers (salwar), and dupatta. Originating in the Mughal courts and later popularized across North India and Pakistan, it has evolved into various regional styles including the Anarkali (fitted bodice with flared skirt), the straight-cut Punjabi suit, the flowing Palazzo suit, and the dramatic Sharara with wide-legged pants. It is the go-to everyday ethnic wear for women across the Indian subcontinent.',
  menswear:
    'Indian menswear for formal and wedding occasions centers on the sherwani — a long coat-like garment worn over a churidar (fitted trousers). The sherwani traces its lineage to the 19th-century British frock coat, adapted into a distinctly Indian garment with embroidery, brocade fabrics, and traditional closures. The Jodhpuri suit (bandhgala) originated in the princely state of Rajasthan and represents a more structured, collar-stand alternative. These garments are worn by grooms, groomsmen, and male guests at Indian weddings, engagement ceremonies, and festive events.',
  other:
    'Indian ethnic wear encompasses a rich diversity of regional garments, textile techniques, and craft traditions developed over millennia. From the handloom weaving traditions of Varanasi and Kanchipuram to the embroidery centers of Lucknow (chikankari) and Agra (zardozi), each piece carries the legacy of skilled artisans. Indian ethnic fashion continues to evolve, blending traditional craftsmanship with contemporary silhouettes for modern wearers worldwide.',
};

// ─── Category-Specific Occasion Mappings ────────────────────────────────────

const DEFAULT_OCCASIONS: Record<ProductCategory, string[]> = {
  lehenga: ['bridal', 'wedding', 'mehndi', 'sangeet', 'reception', 'engagement', 'festive'],
  saree: ['wedding', 'reception', 'festival', 'pooja', 'engagement', 'cocktail party', 'formal gathering'],
  suit: ['wedding guest', 'festival', 'engagement', 'party', 'casual', 'daily wear'],
  menswear: ['groom wedding', 'groomsmen', 'engagement', 'mehndi', 'reception', 'festive'],
  other: ['wedding', 'festival', 'party', 'formal event'],
};

// ─── Region of Origin Mapper ────────────────────────────────────────────────

const inferRegionOfOrigin = (productType?: string, embroidery?: string): string => {
  const pt = (productType || '').toLowerCase();
  const em = (embroidery || '').toLowerCase();

  if (em.includes('banarasi') || em.includes('brocade')) return 'Varanasi, Uttar Pradesh, India';
  if (em.includes('kanjivaram') || em.includes('kanchipuram')) return 'Kanchipuram, Tamil Nadu, India';
  if (em.includes('chikankari')) return 'Lucknow, Uttar Pradesh, India';
  if (em.includes('gota patti') || em.includes('gota')) return 'Jaipur, Rajasthan, India';
  if (em.includes('bandhani') || em.includes('bandhej')) return 'Rajasthan & Gujarat, India';
  if (em.includes('mirror') || em.includes('shisha') || em.includes('kutch')) return 'Kutch, Gujarat, India';
  if (em.includes('kalamkari')) return 'Andhra Pradesh, India';
  if (em.includes('ikkat') || em.includes('ikat')) return 'Odisha & Andhra Pradesh, India';
  if (em.includes('paithani')) return 'Aurangabad, Maharashtra, India';
  if (em.includes('patola')) return 'Patan, Gujarat, India';
  if (em.includes('zardozi')) return 'Agra & Varanasi, Uttar Pradesh, India';
  if (pt.includes('saree') && em.includes('silk')) return 'Kanchipuram or Varanasi, India';
  if (pt.includes('sherwani') || pt.includes('kurta')) return 'North India';
  if (pt.includes('lehenga')) return 'Rajasthan, Gujarat & North India';

  return 'India';
};

// ─── Component ──────────────────────────────────────────────────────────────

export const SemanticProductMetadata = ({
  productName,
  fabric,
  color,
  embroidery,
  occasion,
  silhouette,
  neckline,
  sleeveType,
  careInstructions,
  stylingTips,
  culturalContext,
  regionOfOrigin,
  productType,
  price,
  currency,
}: SemanticProductMetadataProps) => {
  const category = classifyProduct(productType);
  const resolvedCulturalContext = culturalContext || CULTURAL_CONTEXT[category];
  const resolvedRegion = regionOfOrigin || inferRegionOfOrigin(productType, embroidery);
  const resolvedOccasions = occasion && occasion.length > 0 ? occasion : DEFAULT_OCCASIONS[category];

  // Generate LLM-friendly product narrative
  const productNarrative = useMemo(() => {
    const parts: string[] = [];
    parts.push(`The ${productName} is a handcrafted ${productType || 'Indian ethnic wear garment'}.`);
    if (fabric) parts.push(`It is crafted from premium ${fabric}.`);
    if (color) parts.push(`The garment comes in a ${color} colorway.`);
    if (embroidery) parts.push(`It features ${embroidery} embroidery and embellishment work.`);
    if (silhouette) parts.push(`The ${silhouette} silhouette creates an elegant and flattering drape.`);
    if (neckline) parts.push(`The ${neckline} neckline adds a distinctive design element.`);
    if (sleeveType) parts.push(`Finished with ${sleeveType} sleeves.`);
    if (resolvedOccasions.length > 0) {
      parts.push(`This piece is suitable for ${resolvedOccasions.join(', ')} occasions.`);
    }
    if (resolvedRegion) parts.push(`Crafted in ${resolvedRegion}.`);
    return parts.join(' ');
  }, [productName, fabric, color, embroidery, silhouette, neckline, sleeveType, resolvedOccasions, resolvedRegion, productType]);

  // Generate occasion-occurrence mapping sentence
  const occasionMapping = useMemo(() => {
    if (resolvedOccasions.length === 0) return '';
    const occasionPhrase = resolvedOccasions.join(', ');
    return `Suitable occasions: ${occasionPhrase}. Recommended styling: pair with complementary jewelry and traditional footwear for a complete ethnic ensemble.`;
  }, [resolvedOccasions]);

  // Generate care instructions text
  const careText = useMemo(() => {
    const defaults: Record<ProductCategory, string[]> = {
      lehenga: [
        'Dry clean only — embroidery and zari work are delicate and should not be wet-washed',
        'Store in a muslin or cotton bag to allow the fabric to breathe',
        'Fold with tissue paper between layers to prevent embroidery snagging',
        'Iron on low heat from the reverse side; never iron directly on embellishments',
        'Air out after each wear to preserve freshness',
      ],
      saree: [
        'Dry clean recommended for silk and embroidered sarees',
        'Hand wash cotton silk blends in cold water with mild detergent',
        'Never hang silk sarees — fold and store flat to maintain shape',
        'Wrap in muslin cloth; refold every few months to prevent permanent creasing',
        'Iron on medium heat from the reverse side to protect zari',
      ],
      suit: [
        'Dry clean silk, chanderi, and heavily embroidered suits',
        'Cotton and rayon suits: gentle machine wash or hand wash in cold water',
        'Wash dark and light colors separately to prevent bleeding',
        'Do not tumble dry — hang in shade to dry naturally',
        'Iron on medium heat; use a pressing cloth over embroidery',
      ],
      menswear: [
        'Dry clean only for silk, brocade, and jacquard sherwanis',
        'Store on a padded hanger to maintain structure',
        'Keep in a breathable garment bag to protect from dust and moisture',
        'Iron on low heat from the reverse side; never iron directly on embellishments',
        'Air out after wearing before storing',
      ],
      other: [
        'Dry clean recommended for embroidered or embellished items',
        'Store in a cool, dry place away from direct sunlight',
        'Iron on low heat with a pressing cloth over decorative elements',
        'Handle embroidery and zari work with care',
      ],
    };
    return careInstructions || defaults[category];
  }, [careInstructions, category]);

  // Generate styling tips text
  const stylingText = useMemo(() => {
    const defaults: Record<ProductCategory, string[]> = {
      lehenga: [
        'Pair with a maang tikka, statement jhumkas, and bangles for bridal ceremonies',
        'Drape the dupatta over one shoulder for a traditional look, or pin it like a cape for modern style',
        'Match embroidered juttis or block heels to the lehenga border color',
        'Add a kamarbandh (waist chain) for a regal, defined silhouette',
        'Choose a contrasting choli color for a contemporary color-block effect',
      ],
      saree: [
        'Pair Banarasi sarees with temple jewelry; georgette sarees with diamond or polki sets',
        'A statement blouse with elbow-length sleeves elevates any saree drape',
        'Pin the pallu at the shoulder for a polished look, or let it flow freely',
        'Wear comfortable block heels or embellished juttis for long events',
        'Try the Bengali drape for a bold cultural statement at weddings',
      ],
      suit: [
        'Add a statement maang tikka and chandelier earrings; skip the necklace for balance',
        'Belt your anarkali with a metallic kamarbandh for a structured modern silhouette',
        'Pair straight-cut suits with pointed juttis; palazzo suits with kolhapuris',
        'Drape the dupatta over one shoulder for a sleek look, or across the chest for tradition',
        'Mix and match — pair a solid suit with a printed or contrast dupatta',
      ],
      menswear: [
        'Pair your sherwani with a matching stole draped over one shoulder',
        'Opt for mojaris or embroidered juttis in gold or matching tones',
        'Add a brooch or lapel pin for a polished, regal touch',
        'Choose a safa (turban) in matching or contrast fabric for the groom',
        'Tailored trousers with an Indo-western sherwani create a modern groom look',
      ],
      other: [
        'Pair with matching or contrast accessories for a cohesive ethnic look',
        'Choose traditional juttis or mojaris to complete the ensemble',
        'A well-draped dupatta or stole adds instant polish',
      ],
    };
    return stylingTips || defaults[category];
  }, [stylingTips, category]);

  return (
    <article
      itemScope
      itemType="https://schema.org/Product"
      className="sr-only"
      aria-hidden="true"
      data-ai-semantic="product-metadata"
    >
      {/* Product Name */}
      <meta itemProp="name" content={productName} />

      {/* Brand */}
      <meta itemProp="brand" content="LuxeMia" />

      {/* Material / Fabric */}
      {fabric && <meta itemProp="material" content={fabric} />}

      {/* Color */}
      {color && <meta itemProp="color" content={color} />}

      {/* Price (if available) */}
      {price && (
        <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <meta itemProp="price" content={price} />
          <meta itemProp="priceCurrency" content={currency || 'USD'} />
          <meta itemProp="availability" content="https://schema.org/InStock" />
          <link itemProp="url" href={typeof window !== 'undefined' ? window.location.href : ''} />
        </div>
      )}

      {/* Structured Description Section */}
      <section itemProp="description">
        {/* LLM-Friendly Product Narrative */}
        <p data-ai-context="product-narrative">{productNarrative}</p>

        {/* Occasion-Occurrence Mapping */}
        {occasionMapping && (
          <p data-ai-context="occasion-mapping">{occasionMapping}</p>
        )}

        {/* Cultural Context Paragraph */}
        <p data-ai-context="cultural-context">{resolvedCulturalContext}</p>

        {/* Region of Origin */}
        {resolvedRegion && (
          <p data-ai-context="region-of-origin">Region of origin: {resolvedRegion}.</p>
        )}

        {/* Embellishment Details */}
        {embroidery && (
          <p data-ai-context="embroidery-details">
            Embellishment technique: {embroidery}. This traditional craft is applied by skilled artisans using time-honored methods passed down through generations.
          </p>
        )}

        {/* Fabric Characteristics */}
        {fabric && (
          <p data-ai-context="fabric-characteristics">
            Fabric: {fabric}. {getFabricDescription(fabric)}
          </p>
        )}

        {/* Care Instructions */}
        <div data-ai-context="care-instructions">
          <p>Care instructions for {productName}:</p>
          <ul>
            {careText.map((instruction, i) => (
              <li key={i}>{instruction}</li>
            ))}
          </ul>
        </div>

        {/* Styling Recommendations */}
        <div data-ai-context="styling-recommendations">
          <p>How to style the {productName}:</p>
          <ul>
            {stylingText.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>

        {/* Category-Specific Attribute Tags */}
        {silhouette && (
          <p data-ai-context="silhouette">Silhouette type: {silhouette}</p>
        )}
        {neckline && (
          <p data-ai-context="neckline">Neckline style: {neckline}</p>
        )}
        {sleeveType && (
          <p data-ai-context="sleeve-type">Sleeve type: {sleeveType}</p>
        )}
      </section>

      {/* Hidden Semantic Keywords for AI Discovery */}
      <div data-ai-context="semantic-keywords" aria-hidden="true">
        {getSemanticKeywords(category, productType, fabric, embroidery)}
      </div>
    </article>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getFabricDescription(fabric: string): string {
  const descriptions: Record<string, string> = {
    velvet: 'Velvet is a plush, dense fabric with a soft pile. Ideal for winter weddings and bridal lehengas, it offers a luxurious sheen that elevates embroidery and zardozi work.',
    silk: 'Silk is a natural protein fiber known for its lustrous sheen, soft drape, and breathable comfort. It is the most prized fabric for Indian wedding wear and festive garments.',
    georgette: 'Georgette is a lightweight, semi-sheer crepe fabric that drapes beautifully. It is perfect for flowy lehengas, anarkalis, and sarees that require movement and grace.',
    chiffon: 'Chiffon is a sheer, lightweight fabric with a slightly rough feel. It creates an ethereal, floating effect ideal for dupattas and evening wear sarees.',
    'banarasi silk': 'Banarasi silk is a fine silk handwoven in Varanasi, characterized by intricate brocade patterns woven with gold and silver zari threads. It is the most coveted fabric for Indian bridal sarees.',
    'kanchipuram silk': 'Kanchipuram silk (also known as Kanjeevaram) is a heavy, durable silk from Tamil Nadu with distinctive contrasting borders and temple-inspired motifs.',
    net: 'Net is an open-mesh fabric often used as an overlay layer. It creates dramatic volume and a dreamy, ethereal aesthetic when layered over satin or crepe.',
    'raw silk': 'Raw silk (also called dupion or matka) has a naturally textured, slightly slubbed surface with a matte sheen. It holds heavy embroidery exceptionally well.',
    cotton: 'Cotton is a breathable, natural fiber perfect for everyday ethnic wear. It absorbs dye beautifully, making it ideal for printed and embroidered suits.',
    chanderi: 'Chanderi is a lightweight, sheer fabric from Madhya Pradesh with a subtle glossy transparency. It blends silk and cotton for an elegant, heritage finish.',
    brocade: 'Brocade is a rich, heavy fabric with raised patterns woven directly into the material using gold, silver, or colored threads. It is the hallmark of ceremonial Indian wear.',
    jacquard: 'Jacquard fabric features complex woven patterns created on a special loom. It produces a textured, self-patterned surface that is both sophisticated and durable.',
    organza: 'Organza is a crisp, lightweight, sheer fabric that holds its shape beautifully. It is often used for structured lehengas and statement dupattas.',
    satin: 'Satin has a smooth, glossy surface and soft drape. It is frequently used as a base layer under net or organza overlays in bridal lehengas.',
    crepe: 'Crepe has a distinctive crinkled texture and excellent drape. It is lightweight, wrinkle-resistant, and ideal for travel-friendly ethnic wear.',
    linen: 'Linen is a breathable, natural fiber with a distinctive textured look. It is perfect for summer ethnic wear and daytime events.',
    tussar: 'Tussar silk (also known as kosa silk) is a wild silk variety with a rich, natural golden hue and coarse texture. It is prized for its organic, earthy aesthetic.',
  };

  const key = Object.keys(descriptions).find(
    (k) => fabric.toLowerCase().includes(k.toLowerCase())
  );
  return key ? descriptions[key] : `${fabric} is a quality fabric selected for this garment to ensure comfort, durability, and an elegant appearance.`;
}

function getSemanticKeywords(
  category: ProductCategory,
  productType?: string,
  fabric?: string,
  embroidery?: string
): string {
  const baseKeywords: Record<ProductCategory, string[]> = {
    lehenga: [
      'bridal lehenga', 'wedding lehenga', 'designer lehenga', 'embroidered lehenga',
      'bridal lehenga online', 'wedding lehenga online USA', 'Indian bridal outfit',
      'lehenga choli', 'bridal lehenga for wedding', 'party wear lehenga',
      'Indian wedding dress', 'ethnic bridal wear', 'traditional lehenga',
      'lehenga for mehndi', 'lehenga for sangeet', 'reception lehenga',
    ],
    saree: [
      'silk saree', 'wedding saree', 'designer saree', 'Banarasi saree',
      'Kanchipuram saree', 'saree online USA', 'Indian saree online',
      'bridal saree', 'silk saree online', 'traditional saree',
      'ethnic saree', 'handloom saree', 'party wear saree',
      'saree for wedding', 'saree for reception', 'festive saree',
    ],
    suit: [
      'salwar kameez', 'salwar suit', 'anarkali suit', 'designer suit',
      'salwar kameez online', 'Indian suit online USA', 'ethnic suit',
      'party wear suit', 'wedding suit', 'festive salwar kameez',
      'palazzo suit', 'sharara suit', 'straight cut suit',
      'Indian ethnic suit', 'traditional salwar kameez', 'cotton suit',
    ],
    menswear: [
      'sherwani', 'kurta pajama', 'men ethnic wear', 'groom sherwani',
      'wedding sherwani', 'sherwani online USA', 'Indian menswear',
      'Indo western suit', 'Jodhpuri suit', 'bandhgala suit',
      'men wedding outfit', 'traditional menswear', 'groom wear',
      'ethnic menswear', 'wedding kurta', 'designer sherwani',
    ],
    other: [
      'Indian ethnic wear', 'traditional Indian clothing', 'ethnic fashion',
      'Indian wedding outfit', 'designer ethnic wear', 'handcrafted garment',
    ],
  };

  const keywords = [...baseKeywords[category]];

  if (fabric) {
    keywords.push(`${fabric} ${productType || 'garment'}`, `${fabric} ethnic wear`);
  }
  if (embroidery) {
    keywords.push(`${embroidery} work ${productType || 'garment'}`, `${embroidery} embroidery`);
  }
  if (productType) {
    keywords.push(`buy ${productType} online`, `${productType} online USA`);
  }

  return keywords.join(', ');
}

export default SemanticProductMetadata;
