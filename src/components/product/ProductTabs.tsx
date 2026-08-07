import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ruler, Shirt, Sparkles, Droplets, Scissors, Info, CheckCircle2, Clock, Palette, PenTool, Truck, Shield, RotateCcw, Gem, Crown, Sparkle, Heart } from 'lucide-react';

interface ProductTabsProps {
  description?: string;
  productType?: string;
  /** Whether this product supports stitching (controls Tailoring Services tab visibility) */
  isStitchable?: boolean;
  /** Product tags for fabric-specific care lookup (e.g. ['fabric:silk', 'color:red']) */
  tags?: string[];
}

// Product types that support stitching
const STITCHABLE_PRODUCT_TYPES = [
  'salwar kameez', 'salwar kameez suit', 'lehenga', 'lehenga choli', 'saree', 'sarees',
  'anarkali', 'sharara suit', 'pakistani suit', 'palazzo suit', 'gharara suit',
  'wedding suit',
];

const isStitchableType = (productType?: string): boolean => {
  if (!productType) return false;
  const lower = productType.toLowerCase();
  return STITCHABLE_PRODUCT_TYPES.some(t => lower.includes(t));
};

// --- Product type classification helpers ---
type ProductCategory = 'lehenga' | 'saree' | 'suit' | 'menswear' | 'jewelry' | 'other';

const classifyProduct = (productType?: string): ProductCategory => {
  if (!productType) return 'other';
  const lower = productType.toLowerCase();
  if (
    lower.includes('jewel') ||
    lower.includes('necklace') ||
    lower.includes('choker') ||
    lower.includes('earring') ||
    lower.includes('bangle') ||
    lower.includes('bracelet') ||
    lower.includes('ring') ||
    lower.includes('maang tikka') ||
    lower.includes('anklet')
  ) return 'jewelry';
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
    // Exclude menswear suits
    if (lower.includes('men') || lower.includes('sherwani') || lower.includes('achkan') || lower.includes('jodhpuri')) return 'menswear';
    return 'suit';
  }
  if (lower.includes('men') || lower.includes('sherwani') || lower.includes('achkan') || lower.includes('jodhpuri') || lower.includes('bandhgala')) return 'menswear';
  return 'other';
};

// --- Product-type-specific detail bullet points ---
const DETAIL_BULLETS: Record<ProductCategory, string[]> = {
  lehenga: [
    'Product Details and images identify the listed pieces, fabric, color, and embellishment',
    'Available size and tailoring choices are shown on this page',
    'Choli, dupatta, can-can, and closure details vary by design and are included only when stated',
  ],
  saree: [
    'Product Details and images identify the listed fabric, weave, border, and work',
    'Blouse-piece or pre-stitched options are included only when stated for this design',
    'Use the listed options and Size Guide before ordering any stitched version',
  ],
  suit: [
    'Product Details and images identify the listed kameez, bottom, dupatta, fabric, and work',
    'Included pieces and available stitching choices vary by design',
    'Use the listed options and Size Guide before ordering a stitched version',
  ],
  menswear: [
    'Product Details and images identify the listed pieces, fabric, color, and work',
    'Stole, jacket, bottom, and footwear are included only when stated for this design',
    'Use the listed size and tailoring options before ordering',
  ],
  jewelry: [
    'Product Details and images identify the pieces included with this design',
    'Finish, stones, color, measurements, and closure are included only when stated',
    'Keep away from water, perfume, lotion, and household chemicals',
  ],
  other: [
    'Product Details and images are the specification for this item',
    'Included pieces, materials, color, and available variants are included only when stated',
    'Contact LuxeMia before ordering if any listing detail is unclear',
  ],
};

// --- Product-type-specific material content ---
interface MaterialInfo {
  fabrics: { name: string; description: string }[];
  careInstructions: string[];
}

const MATERIAL_INFO: Record<ProductCategory, MaterialInfo> = {
  lehenga: {
    fabrics: [
      { name: 'Velvet', description: 'Luxurious and regal — ideal for bridal and winter lehengas. Heavy drape with rich sheen that elevates embroidery.' },
      { name: 'Silk', description: 'Timeless and opulent. Raw silk and pure silk lehengas offer a structured fall with natural luster.' },
      { name: 'Georgette', description: 'Lightweight and flowy — perfect for destination weddings and dancing. Holds embroidery beautifully.' },
      { name: 'Net', description: 'Sheer and ethereal. Net overlays create dreamy volume, often layered over satin or crepe.' },
      { name: 'Raw Silk', description: 'Matte texture with a subtle sheen. A favorite for bridal lehengas with heavy zardozi or resham work.' },
    ],
    careInstructions: [
      'Dry clean only — embroidery and zari are delicate',
      'Store in a muslin or cotton bag; avoid plastic which traps moisture',
      'Fold with tissue paper between layers to prevent embroidery snagging',
      'Do not wring or twist — lay flat to dry if spot cleaning',
      'Iron on low heat from the reverse side; place a cloth over embellishments',
      'Air out after each wear to preserve fabric and prevent odor buildup',
    ],
  },
  saree: {
    fabrics: [
      { name: 'Banarasi Silk', description: 'A listing may use Banarasi for a weaving tradition, brocade look, or Banarasi-style fabric. Check Product Details for the exact fiber, weave, origin, and zari wording.' },
      { name: 'Kanchipuram Silk', description: 'A listing may use Kanchipuram or Kanjivaram for a weaving tradition or style. Check Product Details for the exact fiber, weave, origin, and certification wording.' },
      { name: 'Georgette', description: 'Lightweight and easy to drape. Ideal for party wear and pre-wedding functions with sequin or thread work.' },
      { name: 'Chiffon', description: 'Sheer, floaty, and effortlessly elegant. A go-to for cocktail parties and evening receptions.' },
      { name: 'Cotton Silk', description: 'Breathable with a subtle sheen — perfect for daytime events, pooja, and festival wear.' },
    ],
    careInstructions: [
      'Dry clean recommended for silk and embroidered sarees',
      'For cotton silk: gentle hand wash in cold water with mild detergent',
      'Never hang silk sarees — fold and store flat to maintain shape',
      'Wrap in muslin cloth; refold every few months to prevent creasing',
      'Iron on medium heat; always iron on the reverse side to protect zari',
      'Keep away from direct sunlight to prevent color fading',
    ],
  },
  suit: {
    fabrics: [
      { name: 'Cotton', description: 'Breathable and comfortable for everyday wear and casual occasions. Prints and embroidery both shine on cotton.' },
      { name: 'Georgette', description: 'Flowy and elegant — perfect for anarkali suits and party wear. Drapes beautifully with minimal effort.' },
      { name: 'Silk', description: 'Rich and festive. Silk suits make a statement at weddings, receptions, and Diwali celebrations.' },
      { name: 'Chanderi', description: 'Lightweight with a sheer texture and subtle gloss. A heritage fabric from Madhya Pradesh for elegant occasions.' },
      { name: 'Rayon / Crepe', description: 'Soft, drapy, and low-maintenance. Great for daily wear and office-appropriate ethnic looks.' },
    ],
    careInstructions: [
      'Dry clean silk, chanderi, and heavily embroidered suits',
      'Cotton and rayon suits: gentle machine wash or hand wash in cold water',
      'Wash dark and light colors separately to prevent bleeding',
      'Do not tumble dry — hang in shade to dry naturally',
      'Iron on medium heat; use a pressing cloth over embroidery and sequins',
      'Store embellished suits folded with tissue to protect thread work',
    ],
  },
  menswear: {
    fabrics: [
      { name: 'Silk', description: 'The classic choice for sherwanis and wedding ensembles. Rich luster and natural drape command attention.' },
      { name: 'Jacquard', description: 'Woven patterns that create a textured, regal look without heavy embellishment. Subtle yet sophisticated.' },
      { name: 'Brocade', description: 'Heavy fabric with raised patterns in gold or silver zari. The hallmark of ceremonial and wedding wear.' },
      { name: 'Art Silk', description: 'Practical alternative to pure silk with similar sheen and drape. Great for pre-wedding events.' },
      { name: 'Cotton Silk', description: 'Lighter than pure silk with a matte finish — comfortable for haldi, mehndi, and daytime ceremonies.' },
    ],
    careInstructions: [
      'Dry clean only for silk, brocade, and jacquard fabrics',
      'Cotton silk blends: gentle hand wash in cold water',
      'Store sherwanis on a padded hanger to maintain structure',
      'Keep in a garment bag to protect embroidery and zari from snagging',
      'Iron on low heat from the reverse side; never iron directly on embellishments',
      'Air out after wearing before storing to prevent moisture damage',
    ],
  },
  jewelry: {
    fabrics: [
      { name: 'Listed Materials & Finish', description: 'Materials, finish, stones, measurements, and included pieces vary by design. Use Product Details and the images as the specification for this listing.' },
    ],
    careInstructions: [
      'Keep away from water, perfume, lotion, and household chemicals',
      'Wipe gently with a clean, soft cloth after each wear',
      'Store pieces separately in a soft pouch to reduce scratching and tangling',
      'Do not use abrasive cleaners unless the listing specifically recommends one',
    ],
  },
  other: {
    fabrics: [
      { name: 'Listed Material', description: 'Materials vary by item. Use Product Details and the images as the specification for this listing.' },
    ],
    careInstructions: [
      'Dry clean recommended for embroidered or embellished items',
      'Store in a cool, dry place away from direct sunlight',
      'Iron on low heat; use a pressing cloth over decorative elements',
      'Handle embroidery and zari work with care to maintain longevity',
      'Fold with tissue paper between layers to prevent snagging',
    ],
  },
};

// --- Fabric-specific care instructions ---
const FABRIC_CARE: Record<string, string> = {
  'art silk': 'Dry clean only. Store wrapped in muslin cloth. Avoid direct sunlight to prevent color fading.',
  'silk': 'Dry clean only. Store wrapped in muslin cloth. Avoid direct sunlight to prevent color fading.',
  'georgette': 'Gentle dry clean recommended. Hang on padded hangers. Steam to remove wrinkles.',
  'chiffon': 'Gentle dry clean recommended. Hang on padded hangers. Steam to remove wrinkles.',
  'cotton': 'Gentle machine wash in cold water with similar colors. Tumble dry low. Iron on medium heat.',
  'velvet': 'Professional dry clean only. Store flat, do not fold. Brush with velvet brush to maintain pile.',
  'net': 'Hand wash in cold water with mild detergent. Do not wring. Air dry flat.',
  'tulle': 'Hand wash in cold water with mild detergent. Do not wring. Air dry flat.',
  'chinnon': 'Gentle dry clean recommended. Hang on padded hangers. Steam to remove wrinkles.',
  'organza': 'Hand wash in cold water with mild detergent. Do not wring. Air dry flat.',
  'satin': 'Dry clean recommended. Iron on low heat on reverse side. Store hung to prevent creasing.',
};

/**
 * Extracts the first fabric type from product tags (e.g. 'fabric:silk' → 'silk')
 * and returns the matching care instruction, or null if no match.
 */
const getFabricCare = (tags?: string[]): { fabric: string; care: string } | null => {
  if (!tags || tags.length === 0) return null;
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    if (lower.startsWith('fabric:')) {
      const fabric = lower.replace('fabric:', '').trim();
      const care = FABRIC_CARE[fabric];
      if (care) return { fabric, care };
    }
  }
  return null;
};

// --- Product-type-specific styling & occasions content ---
interface OccasionInfo {
  occasions: { name: string; description: string }[];
  stylingTips: string[];
  colorAdvice: string;
}

const OCCASION_INFO: Record<ProductCategory, OccasionInfo> = {
  lehenga: {
    occasions: [
      { name: 'Bridal Wedding', description: 'The quintessential bridal outfit. Choose deep reds, maroons, or regal magentas for the main ceremony.' },
      { name: 'Mehndi / Haldi', description: 'Go for bright yellows, greens, or pinks. Lighter fabrics like georgette keep you comfortable through the celebrations.' },
      { name: 'Sangeet & Reception', description: 'Sequin or mirror-work lehengas in navy, emerald, or champagne make a dazzling statement on the dance floor.' },
      { name: 'Engagement', description: 'Pastel lehengas with delicate embroidery strike the perfect balance between festive and elegant.' },
      { name: 'Festival (Diwali, Navratri)', description: 'Vibrant colors with traditional embroidery. Perfect for garba nights and family celebrations.' },
    ],
    stylingTips: [
      'Pair a heavy bridal lehenga with a maang tikka, nath, and chandelier jhumkas — let the dupatta rest over one shoulder',
      'For a contemporary look, drape the dupatta like a cape or pinned on one side for freedom of movement',
      'Match your footwear to the lehenga border — embroidered juttis or block heels work best',
      'A kamarbandh (waist chain) adds definition and a royal touch to flared lehengas',
      'Opt for a contrasting choli color to create a trendy color-block effect',
    ],
    colorAdvice: 'Red and maroon remain the timeless bridal choice, while pastels like mint, blush, and lavender are trending for modern receptions. Jewel tones — emerald, sapphire, and ruby — photograph beautifully under evening lighting.',
  },
  saree: {
    occasions: [
      { name: 'Wedding Ceremony', description: 'Banarasi or Kanchipuram silk sarees in rich reds and golds are the traditional choice for brides and wedding guests.' },
      { name: 'Reception', description: 'Georgette or chiffon sarees with sequin work in navy, wine, or emerald create an effortlessly glamorous look.' },
      { name: 'Festival (Diwali, Navratri, Pooja)', description: 'Silk or cotton silk sarees in vibrant hues — perfect for traditional celebrations and temple visits.' },
      { name: 'Engagement Ceremony', description: 'Soft pastels or gold-toned sarees with delicate zari borders — elegant without overshadowing the bride.' },
      { name: 'Cocktail Party', description: 'Sequin or ruffle sarees in bold colors drape modern sophistication into an evening out.' },
    ],
    stylingTips: [
      'Style a Banarasi saree in the classic Nivi drape for a timeless look, or try the Bengali drape for a bold cultural statement',
      'A statement blouse with elbow-length sleeves and a deep back transforms a simple saree into a showstopper',
      'Pair heavy silk sarees with temple jewelry and jhumkas; lighter georgettes with diamond or polki sets',
      'Pin the pallu neatly at the shoulder for a polished look, or let it flow for a relaxed, graceful effect',
      'Wear comfortable block heels or embellished juttis — avoid stilettos for long events',
    ],
    colorAdvice: 'For weddings, reds and deep pinks never go out of style. For receptions and parties, jewel tones like emerald and navy are elegant and universally flattering. Pastels work beautifully for daytime ceremonies, while gold and champagne sarees transition effortlessly from day to night.',
  },
  suit: {
    occasions: [
      { name: 'Wedding Guest', description: 'Anarkali suits in silk or georgette with embroidery — graceful and wedding-appropriate without outshining the bride.' },
      { name: 'Festival (Diwali, Eid, Navratri)', description: 'Bright cotton or chanderi suits with print or thread work. Comfortable for long celebrations and family gatherings.' },
      { name: 'Engagement', description: 'Pastel anarkalis or straight-cut suits with delicate embellishments — understated elegance for the occasion.' },
      { name: 'Party / Cocktail', description: 'Georgette suits with sequin or mirror work in bold colors. Pair with statement earrings for instant glam.' },
      { name: 'Casual / Daily Wear', description: 'Cotton or rayon suits in prints and solids — effortlessly stylish for everyday ethnic dressing.' },
    ],
    stylingTips: [
      'For anarkali suits, add a statement maang tikka and chandelier earrings — skip the necklace to keep it balanced',
      'Straight-cut suits look best with pointed juttis or block heels; palazzo suits pair well with kolhapuris',
      'Drape the dupatta over one shoulder for a sleek look, or pin it across the chest for a traditional feel',
      'Belt your anarkali with a metallic kamarbandh for a modern, structured silhouette',
      'Mix and match — pair a solid suit with a printed or contrast dupatta for an elevated look',
    ],
    colorAdvice: 'Pastel shades like blush, mint, and ivory are perfect for daytime and engagement events. For evening celebrations, deep jewel tones — wine, navy, and emerald — add instant drama. Bright yellows, oranges, and pinks are festive staples for Diwali and Navratri.',
  },
  menswear: {
    occasions: [
      { name: 'Groom — Wedding Day', description: 'A regal sherwani in deep maroon, navy, or ivory with gold embroidery — the centerpiece of the groom\'s look.' },
      { name: 'Groomsmen / Baraat', description: 'Coordinated sherwanis or bandhgalas in complementary tones. Make a grand entrance with the baraat procession.' },
      { name: 'Engagement / Ring Ceremony', description: 'A tailored bandhgala or Indo-western suit in black, navy, or wine — sophisticated and ceremony-appropriate.' },
      { name: 'Mehndi / Haldi', description: 'Lighter kurta sets in yellow, mint, or ivory. Comfortable cotton silk for relaxed daytime celebrations.' },
      { name: 'Reception', description: 'A structured Jodhpuri suit or Indo-western ensemble — sharp, modern, and perfect for evening photos.' },
    ],
    stylingTips: [
      'Pair your sherwani with a matching stole draped over one shoulder — it adds ceremony and completes the look',
      'Opt for mojaris or embroidered juttis in gold or matching tones — they\'re traditional and comfortable for long events',
      'Add a brooch or pins on the sherwani lapel for a polished, regal touch',
      'For a modern groom look, skip the churidar and choose tailored trousers with an Indo-western sherwani',
      'A safa (turban) in matching or contrast fabric elevates the groom\'s ensemble to showstopping',
    ],
    colorAdvice: 'Ivory and gold sherwanis are the timeless groom\'s choice, while deep maroon and navy offer a bolder statement. For groomsmen, muted tones like sage, steel grey, or powder blue complement without competing. Black remains the failsafe for receptions and evening events.',
  },
  jewelry: {
    occasions: [
      { name: 'Wedding & Reception', description: 'Coordinate the scale and finish of the jewelry with the neckline and embellishment level of your outfit.' },
      { name: 'Sangeet & Engagement', description: 'Statement necklaces, chokers, earrings, and bangles can anchor an evening celebration look.' },
      { name: 'Festival & Family Event', description: 'Choose a design that complements the colors and metal tones already present in your outfit.' },
    ],
    stylingTips: [
      'Use a statement necklace with simpler earrings, or statement earrings with a lighter neckline',
      'Match warm gold-toned finishes with warm outfit accents and cooler finishes with silver-toned details',
      'Put jewelry on after perfume and cosmetics have dried, and remove it before changing clothes',
    ],
    colorAdvice: 'Use the product photos and listed color details to coordinate the finish and stones with your outfit. Screen and lighting differences can slightly change how colors appear.',
  },
  other: {
    occasions: [
      { name: 'Wedding & Receptions', description: 'Review the product details to decide whether this piece suits the formality and dress code of the event.' },
      { name: 'Festival', description: 'Celebrate Diwali, Navratri, Eid, and more in style with this versatile piece.' },
      { name: 'Party & Social Events', description: 'Make a statement at cocktail parties, engagements, and formal gatherings.' },
    ],
    stylingTips: [
      'Pair with matching or contrast accessories to elevate the overall look',
      'Choose traditional juttis or mojaris to complete the ethnic ensemble',
      'A well-draped dupatta or stole adds instant polish to any outfit',
    ],
    colorAdvice: 'Rich jewel tones work beautifully for evening events, while pastels are perfect for daytime celebrations. When in doubt, classic gold and ivory never fail.',
  },
};

// --- Tag extraction helpers for the Fabric & Details tab ---
interface ParsedTags {
  color?: string;
  fabric?: string;
  work?: string;
  occasion?: string;
  style?: string;
  silhouette?: string;
  length?: string;
  sleeve?: string;
}

const PARSED_TAG_KEYS = new Set<keyof ParsedTags>([
  'color',
  'fabric',
  'work',
  'occasion',
  'style',
  'silhouette',
  'length',
  'sleeve',
]);

function isParsedTagKey(value: string): value is keyof ParsedTags {
  return PARSED_TAG_KEYS.has(value as keyof ParsedTags);
}

function parseProductTags(tags?: string[]): ParsedTags {
  const result: ParsedTags = {};
  (tags ?? []).forEach((tag) => {
    const idx = tag.indexOf(':');
    if (idx > 0) {
      const key = tag.slice(0, idx).toLowerCase().trim();
      const val = tag.slice(idx + 1).trim();
      if (val && isParsedTagKey(key)) {
        result[key] = val;
      }
    }
  });
  return result;
}

function titleCase(str: string): string {
  return str.replace(/\b\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function getLabel(key: string): string {
  const labels: Record<string, string> = {
    color: 'Color',
    fabric: 'Fabric',
    work: 'Embroidery / Work',
    occasion: 'Occasion',
    style: 'Style',
    silhouette: 'Silhouette',
    length: 'Length',
    sleeve: 'Sleeve',
  };
  return labels[key] || titleCase(key);
}

export const ProductTabs = ({ description, productType, isStitchable, tags }: ProductTabsProps) => {
  const showTailoringTab = isStitchable ?? isStitchableType(productType);
  const category = classifyProduct(productType);
  const detailBullets = DETAIL_BULLETS[category];
  const materialInfo = MATERIAL_INFO[category];
  const occasionInfo = OCCASION_INFO[category];
  const isJewelry = category === 'jewelry';
  const fabricCare = isJewelry ? null : getFabricCare(tags);
  const parsedTags = parseProductTags(tags);
  const hasFabricDetails = !isJewelry && Object.keys(parsedTags).length > 0;

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none overflow-x-auto">
        {hasFabricDetails && (
          <TabsTrigger 
            value="fabric" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide whitespace-nowrap"
          >
            {isJewelry ? 'Specifications' : 'Fabric & Details'}
          </TabsTrigger>
        )}
        <TabsTrigger 
          value="details" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide whitespace-nowrap"
        >
          Details
        </TabsTrigger>
        {showTailoringTab && (
          <TabsTrigger 
            value="tailoring" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide whitespace-nowrap"
          >
            Tailoring Services
          </TabsTrigger>
        )}
        <TabsTrigger 
          value="material" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide whitespace-nowrap"
        >
          {isJewelry ? 'Jewelry Care' : 'Material & Care'}
        </TabsTrigger>
        <TabsTrigger 
          value="styling" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide whitespace-nowrap"
        >
          Styling & Occasions
        </TabsTrigger>
        {!isJewelry && (
          <TabsTrigger
            value="sizing"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide whitespace-nowrap"
          >
            Size Guide
          </TabsTrigger>
        )}
        <TabsTrigger 
          value="shipping" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide whitespace-nowrap"
        >
          Shipping & Returns
        </TabsTrigger>
      </TabsList>

      {/* ─── Fabric & Details Tab (Fix 3.2) ─── */}
      <TabsContent value="fabric" className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-serif font-medium">{isJewelry ? 'Specifications' : 'Fabric & Details'}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Listed specifications for this {productType || 'piece'}. Product Details and images remain the source of truth for included pieces and attributes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {Object.entries(parsedTags).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-0.5">
                <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{getLabel(key)}</span>
                <span className="text-sm text-foreground font-medium">{titleCase(value)}</span>
              </div>
            ))}
          </div>
          {parsedTags.fabric && fabricCare && (
            <div className="mt-4 p-4 bg-muted/50 rounded-sm border border-border/50">
              <div className="flex items-center gap-2 mb-2 text-foreground">
                <Droplets className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Care Note for {titleCase(parsedTags.fabric)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{fabricCare.care}</p>
            </div>
          )}
        </div>
      </TabsContent>

      {/* ─── Details Tab ─── */}
      <TabsContent value="details" className="pt-6">
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p className="leading-relaxed">
            {description || (
              isJewelry
                ? 'Review the product images and listed details for the exact pieces, finish, colors, measurements, and closure.'
                : 'Review the product images and listed details for the exact pieces, fabric, color, work, and available sizing.'
            )}
          </p>
          <ul className="mt-4 space-y-2">
            {detailBullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </TabsContent>

      {/* ─── Tailoring Services Tab (unchanged) ─── */}
      <TabsContent value="tailoring" className="pt-6">
        <div className="space-y-8">
          {/* Section Header */}
          <div className="flex items-center gap-2 text-foreground">
            <Scissors className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-serif font-medium">Tailoring Services</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            LuxeMia offers the tailoring choices shown on this page. Select the service and measurements that match this product before adding it to your bag.
          </p>

          {/* Semi Stitched */}
          <div className="border border-border rounded-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-medium text-foreground">Semi Stitched</h4>
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Included — No extra charge</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pre-constructed with adjustable side seams. The main body of the outfit is assembled, leaving the side seams open for easy alteration. Select your standard size (XS–XXL) for a near-perfect fit.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1.5 ml-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Ready to wear with minimal adjustments</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Side seams can be taken in or let out by any local tailor</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Fastest delivery — no tailoring lead time</span>
              </li>
            </ul>
          </div>

          {/* Ready to Wear */}
          <div className="border border-border rounded-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-medium text-foreground">Ready to Wear</h4>
              </div>
              <span className="text-sm font-medium text-foreground">Contact for quote</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fully stitched to standard measurements matching the product image. Select your bust size (28"–52") and we'll tailor it completely — ready to wear right out of the box.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1.5 ml-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Complete stitching to your selected measurements</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Choose bottom style: Churidar, Salwar, Semi Patiala, or Straight Pant / Palazzo</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Confirm tailoring availability and timing before ordering</span>
              </li>
            </ul>
          </div>

          {/* Made to Measure */}
          <div className="border border-[#D4AF37]/30 bg-[#D4AF37]/5 rounded-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
                  <PenTool className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <h4 className="font-medium text-foreground">Made to Measure <span className="text-[#D4AF37] text-xs font-medium">(UDesign)</span></h4>
              </div>
              <span className="text-sm font-medium text-foreground">Contact for quote</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Choose from the neckline, sleeve, and bottom-style options shown for this product. Submit your measurements after placing the order so the selected tailoring can be completed.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1.5 ml-1">
              <li className="flex items-start gap-2">
                <Palette className="h-3.5 w-3.5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Neckline:</strong> Round Neck, Deep U-Neck, Square Neck, or Sweetheart</span>
              </li>
              <li className="flex items-start gap-2">
                <Palette className="h-3.5 w-3.5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Sleeve Style:</strong> Full Sleeve, 3/4 Sleeve, Half Sleeve, Sleeveless, or Cap Sleeve</span>
              </li>
              <li className="flex items-start gap-2">
                <Palette className="h-3.5 w-3.5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Bottom Style:</strong> Churidar, Salwar, Semi Patiala, or Straight Pant / Palazzo</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span>Submit measurements after ordering via My Account → My Orders</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span>Confirm tailoring availability and timing before ordering</span>
              </li>
            </ul>
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-sm mt-2">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                You can submit your measurements after placing the order. Select Made to Measure, add to bag, complete your order, then go to <strong>My Account → My Orders</strong> to submit your measurements at your convenience.
              </p>
            </div>
          </div>

          {/* General tailoring note */}
          <div className="p-4 border border-primary/30 bg-primary/5 rounded-sm">
            <p className="text-sm text-foreground">
              <strong>Note:</strong> All sales are final, including stitched items. Check measurements carefully and contact LuxeMia before ordering if you are unsure which tailoring option to choose.
            </p>
          </div>
        </div>
      </TabsContent>

      {/* ─── Material & Care Tab ─── */}
      <TabsContent value="material" className="pt-6">
        <div className="space-y-8">
          {/* Fabric Guide */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-foreground">
              <Shirt className="h-5 w-5 text-primary" />
              <h4 className="font-medium">{isJewelry ? 'Materials & Finish' : 'Category Fabric Reference'}</h4>
            </div>
            {!isJewelry && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                This is a general category reference, not a statement about the fabric of this product. Use Product Details for the listed fabric.
              </p>
            )}
            <div className="space-y-4">
              {materialInfo.fabrics.map((fabric, i) => (
                <div key={i} className="border border-border rounded-sm p-4">
                  <h5 className="font-medium text-foreground mb-1">{fabric.name}</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">{fabric.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* General technique reference for apparel only. */}
          {!isJewelry && (
          <div>
            <div className="flex items-center gap-2 mb-3 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Common Embellishments & Work</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Reference guide only. Product Details identify the work listed for this design.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {category === 'lehenga' && (
                <>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Zardozi</strong> — Metallic thread embroidery for bridal opulence</p></div>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Resham</strong> — Silk thread work in vibrant color patterns</p></div>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Mirror Work</strong> — Shisha embroidery reflecting light beautifully</p></div>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Sequin & Stone</strong> — Sparkling accents for reception and party wear</p></div>
                </>
              )}
              {category === 'saree' && (
                <>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Zari Border</strong> — Gold or silver woven border on the pallu and edges</p></div>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Brocade Weaving</strong> — Raised pattern weaving for a rich textured look</p></div>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Thread Embroidery</strong> — Delicate resham or machine embroidery across the drape</p></div>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Sequin & Bead</strong> — Scattered or concentrated embellishments for festive glamour</p></div>
                </>
              )}
              {category === 'suit' && (
                <>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Thread Work</strong> — Resham or machine embroidery in traditional motifs</p></div>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Print & Block</strong> — Hand block or digital prints for everyday elegance</p></div>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Mirror & Sequin</strong> — Festive embellishments for party and wedding suits</p></div>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Gota Patti</strong> — Rajasthani lace appliqué for a heritage finish</p></div>
                </>
              )}
              {category === 'menswear' && (
                <>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Zari & Zardozi</strong> — Gold metallic thread work for regal ceremony wear</p></div>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Jacquard Weave</strong> — Self-patterned weaving for subtle sophistication</p></div>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Thread & Stone</strong> — Tasteful embroidery and stone accents on lapels and cuffs</p></div>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Brocade Panels</strong> — Woven pattern panels on the front and sleeves</p></div>
                </>
              )}
              {category === 'other' && (
                <>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Thread Work</strong> — Decorated with thread work and traditional motifs</p></div>
                  <div className="p-3 bg-card rounded-sm"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Sequin & Embellishment</strong> — Carefully applied accents for a refined finish</p></div>
                </>
              )}
            </div>
          </div>
          )}

          {/* Fabric-Specific Care */}
          {fabricCare && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm">
              <div className="flex items-center gap-2 mb-2 text-foreground">
                <Heart className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">Care for {fabricCare.fabric.charAt(0).toUpperCase() + fabricCare.fabric.slice(1)}</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{fabricCare.care}</p>
            </div>
          )}

          {/* Care Instructions */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-foreground">
              <Droplets className="h-5 w-5 text-primary" />
              <h4 className="font-medium">General Care Instructions</h4>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              {materialInfo.careInstructions.map((instruction, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Droplets className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Product-specific details take priority over this category guide. */}
          <div className="p-4 bg-card rounded-sm border border-border">
            <div className="flex items-start gap-2">
              <Sparkle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground font-medium">Check This Product&apos;s Listed Details</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Materials, included pieces, finish, color, and care can vary by design. Product Details, available options, and images are the specification for this item.
                </p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* ─── Styling & Occasions Tab ─── */}
      <TabsContent value="styling" className="pt-6">
        <div className="space-y-8">
          {/* Occasion Recommendations */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-foreground">
              <Crown className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Occasion Guide</h4>
            </div>
            <div className="space-y-3">
              {occasionInfo.occasions.map((occasion, i) => (
                <div key={i} className="border border-border rounded-sm p-4">
                  <h5 className="font-medium text-foreground mb-1">{occasion.name}</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">{occasion.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Styling Tips */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-foreground">
              <Gem className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Styling Tips</h4>
            </div>
            <ul className="space-y-3">
              {occasionInfo.stylingTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Color Coordination */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-foreground">
              <Palette className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Color Coordination</h4>
            </div>
            <div className="p-4 bg-card rounded-sm border border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">{occasionInfo.colorAdvice}</p>
            </div>
          </div>

          {/* Jewelry suggestion */}
          <div className="p-4 border border-primary/30 bg-primary/5 rounded-sm">
            <div className="flex items-start gap-2">
              <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground font-medium">Complete the Look</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isJewelry
                    ? 'Coordinate this piece with the outfit neckline and other accessories. Balance a statement necklace with simpler earrings, or statement earrings with a lighter neckline.'
                    : 'Pair heavier ensembles with statement jhumkas and bangles, while lighter pieces work well with delicate chains and studs. Coordinate metal tones with the outfit embroidery and other accessories.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* ─── Size Guide Tab — apparel only ─── */}
      {!isJewelry && (
      <TabsContent value="sizing" className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Ruler className="h-4 w-4" />
            <span>All measurements are in inches</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Size</th>
                  <th className="text-left py-3 px-4 font-medium">Bust</th>
                  <th className="text-left py-3 px-4 font-medium">Waist</th>
                  <th className="text-left py-3 px-4 font-medium">Hip</th>
                  <th className="text-left py-3 px-4 font-medium">Length</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">XS</td>
                  <td className="py-3 px-4">32</td>
                  <td className="py-3 px-4">26</td>
                  <td className="py-3 px-4">35</td>
                  <td className="py-3 px-4">54</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">S</td>
                  <td className="py-3 px-4">34</td>
                  <td className="py-3 px-4">28</td>
                  <td className="py-3 px-4">37</td>
                  <td className="py-3 px-4">54</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">M</td>
                  <td className="py-3 px-4">36</td>
                  <td className="py-3 px-4">30</td>
                  <td className="py-3 px-4">39</td>
                  <td className="py-3 px-4">55</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">L</td>
                  <td className="py-3 px-4">38</td>
                  <td className="py-3 px-4">32</td>
                  <td className="py-3 px-4">41</td>
                  <td className="py-3 px-4">55</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">XL</td>
                  <td className="py-3 px-4">40</td>
                  <td className="py-3 px-4">34</td>
                  <td className="py-3 px-4">43</td>
                  <td className="py-3 px-4">56</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            Need help? Contact our team for personalized size recommendations.
          </p>
        </div>
      </TabsContent>
      )}

      {/* ─── Shipping & Returns Tab ─── */}
      <TabsContent value="shipping" className="pt-6">
        <div className="space-y-6">
          {/* Shipping Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-card rounded-sm border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-primary" />
                <h4 className="font-medium">US Shipping</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Free U.S. shipping at $150 and above</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>$12 flat below $150</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Tracking provided after dispatch</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-card rounded-sm border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Dispatch &amp; Tracking</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Online orders ship with tracking after dispatch</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>United States shipping addresses only</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Carrier delivery time begins after dispatch</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Returns & Damage Claims */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-foreground">
              <RotateCcw className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Returns &amp; Damage Claims</h4>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-sm">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-1">All Sales Final</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      All sales are final.
                      We encourage you to carefully review sizing, measurements, and product details before placing your order.
                      Our team is always available to answer any pre-purchase questions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-sm">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-1">Covered Order Issues</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      For genuine shipping damage, an incorrect item, or a missing item:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-foreground">Record one continuous unboxing/opening video</strong> showing the unopened package, shipping label, opening process, contents, and item condition</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-foreground">Contact us within 48 hours</strong> of delivery</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Include clear photos alongside the required video</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Contact our support team with your order number for prompt resolution</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
