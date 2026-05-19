/**
 * Product Description Enrichment — Structured Modular Content Generator
 *
 * Generates short, scannable, modular product content from raw Shopify data.
 * NO prose paragraphs. NO generic AI adjectives. NO visible SEO text.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductContent {
  shortIntro: string;
  keyDetails: Array<{ label: string; value: string }>;
  designDetails: string[];
  stylingNote: string;
  customization: string[];
  care: string[];
  seoKeywords: string[];
  seoMetaDescription: string;
  aiSearchDescription: string;
}

export type ProductCategory = 'lehenga' | 'saree' | 'suit' | 'salwar' | 'anarkali' | 'sharara' | 'sherwani' | 'kurta' | 'jewelry' | 'indo-western';

interface CategoryTemplate {
  label: string;
  designDetails: string[];
  careInstructions: string[];
  keywords: string[];
  categoryDescription: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RICH_MIN = 120;
const NON_GARMENT = new Set(['jewelry']);

const SPECIFICITY = ['embroidery','embroidered','handwork','zari','zardozi','sequin','stone work','thread work','kanjivaram','banarasi','kanchipuram','chikankari','gota patti','mirror work','resham','dori','applique','bead','kundan','pearl','dry clean','custom tailoring','stitched','semi-stitched','unstitched','dupatta','blouse piece','pallu','lining','can-can','flare','train','draping','silhouette'];

const WORK_MAP: Record<string, string> = {
  embroidery: 'Embroidery', embroidered: 'Embroidery', zari: 'Zari Work', zardozi: 'Zardozi', sequin: 'Sequin Work', 'stone work': 'Stone Work', 'thread work': 'Thread Work', chikankari: 'Chikankari', 'gota patti': 'Gota Patti', 'mirror work': 'Mirror Work', resham: 'Resham Work', dori: 'Dori Work', applique: 'Applique', bead: 'Bead Work', kundan: 'Kundan Work', pearl: 'Pearl Work', 'cut dana': 'Cut Dana Work',
};

const OCC_MAP: Record<string, string> = {
  wedding: 'Wedding', bridal: 'Wedding', engagement: 'Engagement', sangeet: 'Sangeet', mehndi: 'Mehndi', haldi: 'Haldi', reception: 'Reception', 'party wear': 'Party Wear', partywear: 'Party Wear', festive: 'Festive', festival: 'Festive', pooja: 'Pooja', ceremony: 'Ceremony', casual: 'Casual',
};

const FABRICS: Record<string, string> = {
  'banarasi silk': 'Banarasi Silk', 'kanjivaram silk': 'Kanjivaram Silk', 'kanchipuram silk': 'Kanchipuram Silk', 'pure silk': 'Silk', 'raw silk': 'Raw Silk', 'tussar silk': 'Tussar Silk', 'art silk': 'Art Silk',
  silk: 'Silk', georgette: 'Georgette', chiffon: 'Chiffon', crepe: 'Crepe', velvet: 'Velvet', net: 'Net', organza: 'Organza', cotton: 'Cotton', linen: 'Linen', satin: 'Satin', taffeta: 'Taffeta', jacquard: 'Jacquard', chanderi: 'Chanderi', chinon: 'Chinon', chinnon: 'Chinon', vichitra: 'Vichitra', brocade: 'Brocade', muslin: 'Muslin', rayon: 'Rayon', viscose: 'Viscose',
};

const COLORS = [
  'pearl white','off white','off-white','rani pink','sky blue','baby pink','dusty rose','royal blue','rust orange','teal blue','navy blue','pista green','mehendi green','olive green','sea green','hot pink',
  'red','maroon','wine','burgundy','pink','rose','fuchsia','magenta','blue','navy','teal','cyan','indigo','green','emerald','olive','mint','sage','yellow','gold','mustard','amber','orange','peach','coral','rust','purple','lavender','plum','mauve','lilac','white','ivory','cream','beige','black','grey','gray','charcoal','champagne','copper','bronze','tan','camel',
];

const TEMPLATES: Record<string, CategoryTemplate> = {
  lehenga: {
    label: 'Lehenga',
    designDetails: ['Flared lehenga silhouette with drawstring waist','Matching choli with back closure','Embroidered or woven border dupatta','Cotton inner lining','Can-can underskirt for volume'],
    careInstructions: ['Dry clean only','Store in muslin bag away from moisture','Iron on low heat with pressing cloth'],
    keywords: ['designer lehenga online','bridal lehenga USA','Indian wedding lehenga','embroidered lehenga choli','ethnic wear for weddings','luxury bridal lehenga'],
    categoryDescription: 'Curated designer lehengas — from bridal to festive-ready silhouettes. Handcrafted with embroidery, zari, and sequin work. Free shipping over $350.',
  },
  saree: {
    label: 'Saree',
    designDetails: ['Woven or embroidered pallu with border detailing','Comes with unstitched blouse piece','Free-size drape — adjustable to body type','Finished edges with fall and edging','Lightweight to heavy fabric options'],
    careInstructions: ['Dry clean recommended for silk and embellished sarees','Store folded in muslin cloth','Change fold lines periodically to prevent creases'],
    keywords: ['silk saree online USA','Indian saree for wedding','designer saree collection','Banarasi saree','handwoven silk saree','bridal Banarasi saree'],
    categoryDescription: 'Handpicked saree collection — from Banarasi silks to lightweight georgettes. Intricate borders, rich pallus, and artisan craftsmanship. Free shipping over $350.',
  },
  suit: {
    label: 'Salwar Suit',
    designDetails: ['Straight or A-line kameez silhouette','Coordinated bottom — salwar, churidar, or palazzo','Matching dupatta with border or print','Cotton or satin inner lining','Side seam pockets on select styles'],
    careInstructions: ['Dry clean for embroidered pieces','Gentle machine wash for cotton suits','Iron on medium heat'],
    keywords: ['salwar kameez online USA','Pakistani suit design','designer salwar suit','ethnic suit for wedding','Indian suit collection'],
    categoryDescription: 'Elegant anarkali suits, straight-cut kameez, and palazzo sets with fine embroidery and premium fabrics. Free shipping over $350.',
  },
  salwar: {
    label: 'Salwar Suit',
    designDetails: ['Straight or A-line kameez silhouette','Coordinated bottom — salwar, churidar, or palazzo','Matching dupatta with border or print','Cotton or satin inner lining','Side seam pockets on select styles'],
    careInstructions: ['Dry clean for embroidered pieces','Gentle machine wash for cotton suits','Iron on medium heat'],
    keywords: ['salwar kameez online USA','Pakistani suit design','designer salwar suit','ethnic suit for wedding','Indian suit collection'],
    categoryDescription: 'Elegant anarkali suits, straight-cut kameez, and palazzo sets with fine embroidery and premium fabrics. Free shipping over $350.',
  },
  anarkali: {
    label: 'Anarkali Suit',
    designDetails: ['Flared kalidar silhouette with fitted bodice','Floor-length or calf-length hemline','Intricate yoke embroidery or embellishment','Matching bottom and dupatta','Side zip or back closure'],
    careInstructions: ['Dry clean only','Hang on padded hanger to preserve shape','Steam lightly — avoid direct iron on embellished areas'],
    keywords: ['anarkali suit online USA','flared anarkali for wedding','designer anarkali suit','floor-length anarkali','festive anarkali suit'],
    categoryDescription: 'Flowing kalidar silhouettes with yoke embroidery, sheer sleeves, and dramatic flares. Free shipping over $350.',
  },
  sharara: {
    label: 'Sharara Set',
    designDetails: ['Wide-legged flared sharara pants','Short embroidered kurta with back closure','Matching dupatta with ornate border','Elasticized or drawstring waistband','Cotton lining in kurta and pants'],
    careInstructions: ['Dry clean recommended','Steam sharara pants on low heat','Store dupatta separately to prevent snagging'],
    keywords: ['sharara suit online USA','designer sharara set','sharara for sangeet','Indian sharara pants','wedding sharara set'],
    categoryDescription: 'Trendy wide-legged sets with embroidered kurtas and ornate dupattas. Free shipping over $350.',
  },
  sherwani: {
    label: 'Sherwani',
    designDetails: ['Structured long-coat silhouette with mandarin collar','Chest and collar embroidery or embellishment','Front button or hook closure','Matching bottom — churidar or pajama','Optional coordinated stole'],
    careInstructions: ['Dry clean only','Hang on sturdy wooden hanger','Spot clean stains immediately — do not rub'],
    keywords: ['sherwani online USA','groom sherwani wedding','designer sherwani Indian','wedding sherwani for men','Indian groom outfit'],
    categoryDescription: 'Distinguished wedding sherwanis and festive menswear with intricate embroidery. Free shipping over $350.',
  },
  kurta: {
    label: 'Kurta',
    designDetails: ['Straight-cut or slightly tapered silhouette','Side slits for ease of movement','Front button or concealed placket','Cuffed or rolled sleeve options','Coordinated bottom — churidar, pajama, or pants'],
    careInstructions: ['Machine wash cotton kurtas on gentle cycle','Dry clean silk and embroidered kurtas','Iron on medium heat'],
    keywords: ['kurta pajama online USA',"men's kurta set",'ethnic kurta for festive','designer kurta men','kurta for wedding guest'],
    categoryDescription: 'From cotton everyday sets to embroidered silk kurtas for festive occasions. Free shipping over $350.',
  },
  jewelry: {
    label: 'Jewelry',
    designDetails: ['Hand-set stones with secure prong or bezel setting','Gold-plated or silver-plated base metal','Hook, clip, or screw-back closures on earrings','Adjustable chain or drawstring on necklaces','Matching set components designed to coordinate'],
    careInstructions: ['Store in soft pouch or lined jewelry box','Avoid contact with perfume, water, and chemicals','Wipe with soft cloth after each wear'],
    keywords: ['Indian jewelry online USA','kundan jewelry set','bridal jewelry Indian','temple jewelry online','ethnic jewelry for wedding'],
    categoryDescription: 'Handcrafted kundan sets, temple jewelry, polki designs, and statement earrings. Free shipping over $350.',
  },
  'indo-western': {
    label: 'Indo-Western Outfit',
    designDetails: ['Fusion silhouette blending Indian and Western cuts','Asymmetric or layered hemline','Contemporary neckline with ethnic embellishment','Mixed fabric construction for structure and drape','Coordinated belt, sash, or dupatta accent'],
    careInstructions: ['Dry clean recommended for mixed fabrics','Steam to remove wrinkles','Store on padded hanger in muslin bag'],
    keywords: ['indo-western dress online USA','fusion wear Indian','indo-western for wedding','modern Indian outfit','contemporary Indian dress'],
    categoryDescription: 'Fusion silhouettes blending traditional craftsmanship with modern design. Free shipping over $350.',
  },
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/** Normalize raw product type to known category key. */
function normalizeProductType(pt: string): string {
  const l = pt.toLowerCase().trim();
  if (TEMPLATES[l]) return l;
  if (l.includes('lehenga') || l.includes('lehanga') || l.includes('lenga')) return 'lehenga';
  if (l.includes('saree') || l.includes('sari')) return 'saree';
  if (l.includes('anarkali')) return 'anarkali';
  if (l.includes('sharara') || l.includes('garara')) return 'sharara';
  if (l.includes('sherwani')) return 'sherwani';
  if (l.includes('kurta')) return 'kurta';
  if (l.includes('jewel') || l.includes('necklace') || l.includes('earring') || l.includes('bangle') || l.includes('maang') || l.includes('tikka') || l.includes('anklet') || l.includes('bracelet')) return 'jewelry';
  if (l.includes('indo') || l.includes('fusion') || l.includes('gown') || l.includes('drape')) return 'indo-western';
  if (l.includes('salwar') || l.includes('kameez')) return 'salwar';
  if (l.includes('suit') || l.includes('palazzo') || l.includes('churidar')) return 'suit';
  return 'suit';
}

export function isDescriptionRich(desc: string): boolean {
  if (desc.length < RICH_MIN) return false;
  const lower = desc.toLowerCase();
  return SPECIFICITY.filter(i => lower.includes(i)).length >= 2;
}

function inferMaterial(title: string, tags: string[] = [], desc?: string): string {
  const s = `${title} ${tags.join(' ')} ${desc ?? ''}`.toLowerCase();
  for (const [k, v] of Object.entries(FABRICS)) if (s.includes(k)) return v;
  return '';
}

function inferColor(title: string, tags: string[] = [], desc?: string): string {
  const s = ` ${title} ${tags.join(' ')} ${desc ?? ''} `.toLowerCase().replace(/[()]/g, ' ');
  for (const c of COLORS) {
    // Word-boundary match: avoid "red" matching inside "maroon"
    const re = new RegExp(`\\b${c.replace(/\s/g, '\\s')}\\b`, 'i');
    if (re.test(s)) return c.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  }
  return '';
}

function inferWork(title: string, tags: string[] = []): string {
  const s = `${title} ${tags.join(' ')}`.toLowerCase();
  const found: string[] = [];
  for (const [k, v] of Object.entries(WORK_MAP)) if (s.includes(k) && !found.includes(v)) found.push(v);
  return found.slice(0, 2).join(', ');
}

function inferOccasion(title: string, tags: string[] = []): string {
  const s = `${title} ${tags.join(' ')}`.toLowerCase();
  const found: string[] = [];
  for (const [k, v] of Object.entries(OCC_MAP)) if (s.includes(k) && !found.includes(v)) found.push(v);
  return found.slice(0, 3).join(', ');
}

function inferComponents(title: string, tags: string[], cat: string): string {
  const s = `${title} ${tags.join(' ')}`.toLowerCase();
  if (NON_GARMENT.has(cat)) {
    const p: string[] = [];
    if (s.includes('necklace') || s.includes('haar')) p.push('Necklace');
    if (s.includes('earring') || s.includes('jhumka')) p.push('Earrings');
    if (s.includes('maang') || s.includes('tikka')) p.push('Maang Tikka');
    if (s.includes('bangle') || s.includes('bracelet') || s.includes('chura')) p.push('Bangles/Bracelet');
    if (s.includes('ring')) p.push('Ring');
    if (s.includes('anklet') || s.includes('payal')) p.push('Anklet');
    return p.join(', ') || 'Jewelry Piece';
  }
  const p: string[] = [];
  if (cat === 'lehenga') p.push('Lehenga Skirt', 'Choli (Blouse)', 'Dupatta');
  else if (cat === 'saree') p.push('Saree Drape', 'Blouse Piece');
  else if (cat === 'sherwani') { p.push('Sherwani Coat', 'Bottom'); if (s.includes('stole')) p.push('Stole'); }
  else if (cat === 'kurta') { p.push('Kurta'); if (s.includes('bottom') || s.includes('pant') || s.includes('churidar') || s.includes('pajama')) p.push('Bottom'); }
  else { p.push('Top/Kameez'); if (s.includes('bottom') || s.includes('salwar') || s.includes('churidar') || s.includes('palazzo')) p.push('Bottom'); if (s.includes('dupatta')) p.push('Dupatta'); }
  return p.join(', ');
}

// ---------------------------------------------------------------------------
// Content Builders
// ---------------------------------------------------------------------------

function extractSpecs(title: string, tags: string[], cat: string, desc?: string): Array<{ label: string; value: string }> {
  const specs: Array<{ label: string; value: string }> = [];
  const color = inferColor(title, tags, desc);
  const material = inferMaterial(title, tags, desc);
  const work = inferWork(title, tags);
  const occasion = inferOccasion(title, tags);
  const label = TEMPLATES[cat]?.label ?? 'Ethnic Wear';
  const lower = `${title} ${tags.join(' ')}`.toLowerCase();

  if (color) specs.push({ label: 'Color', value: color });
  if (material) specs.push({ label: 'Fabric', value: material });
  if (work) specs.push({ label: 'Work', value: work });
  specs.push({ label: 'Type', value: label });
  specs.push({ label: 'Components', value: inferComponents(title, tags, cat) });
  if (occasion) specs.push({ label: 'Occasion', value: occasion });
  if (lower.includes('semi-stitch')) specs.push({ label: 'Fit', value: 'Semi-Stitched' });
  else if (lower.includes('ready to wear') || lower.includes('stitched')) specs.push({ label: 'Fit', value: 'Ready to Wear' });
  else if (lower.includes('unstitched')) specs.push({ label: 'Fit', value: 'Unstitched' });
  if (lower.includes('cotton') && !lower.includes('lining')) specs.push({ label: 'Lining', value: 'Cotton' });
  if (lower.includes('zip')) specs.push({ label: 'Closure', value: 'Zip' });
  else if (lower.includes('button') || lower.includes('hook')) specs.push({ label: 'Closure', value: 'Hook & Eye' });
  else if (lower.includes('drawstring')) specs.push({ label: 'Closure', value: 'Drawstring' });

  return specs;
}

function buildShortIntro(title: string, cat: string, tags: string[], desc?: string): string {
  const color = inferColor(title, tags, desc);
  const material = inferMaterial(title, tags, desc);
  const work = inferWork(title, tags);
  const label = TEMPLATES[cat]?.label ?? 'Ethnic Wear';
  const occasion = inferOccasion(title, tags);

  const words: string[] = [];
  if (color) words.push(color);
  if (material) words.push(material);
  words.push(label.toLowerCase());
  if (work) words.push(`with ${work.toLowerCase()}`);
  const s1 = `${words.join(' ')}.`;

  const s2Parts: string[] = [];
  const comp = inferComponents(title, tags, cat);
  if (comp && !comp.includes(label)) s2Parts.push(`Includes ${comp.toLowerCase()}.`);
  if (occasion) s2Parts.push(`Suited for ${occasion.toLowerCase()}.`);
  const s2 = s2Parts.join(' ');

  return s2 ? `${s1} ${s2}` : s1;
}

function buildStylingNote(cat: string): string {
  const notes: Record<string, string> = {
    lehenga: 'Pair with gold-toned jewelry and embroidered juttis. A structured dupatta drape completes the ceremonial look.',
    saree: 'Pair with a contrast blouse and traditional jewelry. A neat pleated pallu keeps the look polished.',
    suit: 'Style with jhumka earrings and a matching dupatta drape. Kolhapuris or block heels finish the look.',
    salwar: 'Style with jhumka earrings and a matching dupatta drape. Kolhapuris or block heels finish the look.',
    anarkali: 'Pair with chandelier earrings and a slim waist belt. Soft curls or a low bun complement the flared silhouette.',
    sharara: 'Wear with chunky earrings and open-toe heels. Pin the dupatta at the shoulder for ease of movement.',
    sherwani: 'Complete with a matching stole and embroidered mojaris. A brooch at the collar adds a finishing touch.',
    kurta: 'Pair with fitted churidar or linen pants. Layer with a Nehru jacket for festive occasions.',
    jewelry: 'Pairs with matching ethnic wear. Keep other accessories minimal to let this piece stand out.',
    'indo-western': 'Style with minimal jewelry and strappy heels. A sleek clutch completes the fusion look.',
  };
  return notes[cat] ?? 'Pair with coordinated accessories and footwear for a complete look.';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Generate structured, modular product content from raw product data. */
export function generateProductContent(product: { title: string; productType: string; tags: string[]; description?: string }): ProductContent {
  const { title, productType, tags, description } = product;
  const cat = normalizeProductType(productType);
  const tmpl = TEMPLATES[cat] ?? TEMPLATES['suit'];

  return {
    shortIntro: buildShortIntro(title, cat, tags, description),
    keyDetails: extractSpecs(title, tags, cat, description),
    designDetails: tmpl.designDetails,
    stylingNote: buildStylingNote(cat),
    customization: NON_GARMENT.has(cat)
      ? ['Adjustable fit where noted','Store in provided pouch to maintain finish']
      : ['Semi-stitched: adjustable side seams (up to 2 sizes)','Ready to wear: fully stitched to provided measurements','Made to measure: custom neckline, sleeve length, and fit'],
    care: tmpl.careInstructions,
    seoKeywords: tmpl.keywords,
    seoMetaDescription: (() => {
      const m = inferMaterial(title, tags, description);
      const base = `${title}${m ? ` in ${m}` : ''}. Shop ${tmpl.label} online at LuxeMia. Free shipping over $350.`;
      return base.length > 160 ? base.slice(0, 157) + '...' : base;
    })(),
    aiSearchDescription: (() => {
      const parts = [`${title} — ${tmpl.label}`, ...(inferColor(title, tags, description) ? [`Color: ${inferColor(title, tags, description)}`] : []), ...(inferMaterial(title, tags, description) ? [`Fabric: ${inferMaterial(title, tags, description)}`] : []), ...(inferWork(title, tags) ? [`Work: ${inferWork(title, tags)}`] : []), ...(inferOccasion(title, tags) ? [`Occasion: ${inferOccasion(title, tags)}`] : []), `Keywords: ${tmpl.keywords.slice(0, 3).join(', ')}`];
      return parts.join('. ');
    })(),
  };
}

/** Strip size-related wall-of-text from raw descriptions. */
export function stripSizeText(desc: string): string {
  if (!desc || desc.length < 20) return desc;
  const patterns = [
    /Size\s+Variants?[\s\S]*?(?=Design\s+Details|Fabric:|Work:|Styling|Care|Shipping|$)/i,
    /Size\s+Chart[\s\S]*?(?=Design\s+Details|Fabric:|Work:|Styling|Care|Shipping|$)/i,
    /Available\s+in\s+sizes\s+XS?[\s\S]*?(?=Design\s+Details|Fabric:|Work:|Styling|Care|Shipping|$)/i,
    /Custom\s+sizing\s+is\s+available[\s\S]*?(?=Design\s+Details|Fabric:|Work:|Styling|Care|Shipping|$)/i,
  ];
  let cleaned = desc;
  for (const p of patterns) cleaned = cleaned.replace(p, '');
  return cleaned.replace(/\n{3,}/g, '\n\n').trim();
}

/** Legacy: generate enriched prose description (deprecated — use generateProductContent). */
export function enrichProductDescription(desc: string, productType: string, title: string, material?: string, color?: string): string {
  const content = generateProductContent({ title, productType, tags: material ? [material, ...(color ? [color] : [])] : [], description: desc });
  return [
    content.shortIntro, '',
    content.keyDetails.map(k => `${k.label}: ${k.value}`).join(' | '), '',
    content.designDetails.join('. '), '',
    content.stylingNote, '',
    'Care: ' + content.care.join('. '),
  ].join('\n\n');
}

/** Get category-level SEO description for collection pages / meta. */
export function getProductCategoryDescription(productType: string): string {
  const cat = normalizeProductType(productType);
  return TEMPLATES[cat]?.categoryDescription ?? 'Shop Indian ethnic wear at LuxeMia. Premium lehengas, sarees, suits, and menswear. Free shipping over $350 to USA, Canada, and Australia.';
}

/** Legacy: generate meta description (delegates to new system). */
export function generateMetaDescription(_desc: string, productType: string, title: string, _price?: string): string {
  return generateProductContent({ title, productType, tags: [] }).seoMetaDescription;
}
