import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Layers,
  Scissors,
  Tag,
  CalendarDays,
  CircleDot,
  Armchair,
  Workflow,
  PackageOpen,
  Shirt,
  Sparkles,
  ShirtIcon,
  Info,
} from 'lucide-react';
import type { ShopifyProduct } from '@/lib/shopify';

interface ProductSpecificationTableProps {
  product: ShopifyProduct['node'];
  correctedTitle?: string;
}

// ─── Enhanced Spec Extraction ───────────────────────────────────────────

interface ExtractedSpecs {
  color: string;
  fabric: string;
  work: string;
  type: string;
  occasion: string;
  neckline: string;
  sleeve: string;
  silhouette: string;
  closure: string;
  lining: string;
  care: string;
  fit: string;
  length: string;
  embroidery: string;
  origin: string;
}

const FABRIC_KEYWORDS = [
  'silk', 'cotton', 'georgette', 'chiffon', 'velvet', 'net', 'crepe', 'satin',
  'brocade', 'jacquard', 'organza', 'art silk', 'banarasi', 'tissue silk',
  'raw silk', 'dupion silk', 'tussar silk', 'mulberry silk', 'chanderi',
  'linen', 'rayon', 'viscose', 'modal', 'muslin', 'kota', 'taffeta',
];

const WORK_KEYWORDS = [
  'embroidery', 'embroidered', 'sequins', 'sequin', 'mirror work', 'mirrors',
  'zari', 'zardozi', 'thread work', 'stone work', 'beadwork', 'beads',
  'digital print', 'printed', 'block print', 'woven', 'handcrafted',
  'handwork', 'gota work', 'gota patti', 'cut dana', 'beads',
  'resham', 'resham work', 'dori work', 'aari work', 'aari',
  'kantha', 'chikankari', 'bandhani', 'leheriya', 'ikkat', 'ikat',
  'kalamkari', 'patola', 'kutch embroidery', 'phulkari',
];

const OCCASION_KEYWORDS: Record<string, string[]> = {
  'Wedding': ['wedding', 'bridal', 'bride', 'groom', 'matrimony'],
  'Festive': ['festive', 'festival', 'diwali', 'eid', 'navratri', 'dandiya', 'garba'],
  'Party Wear': ['party', 'cocktail', 'reception', 'sangeet', 'mehendi', 'haldi'],
  'Casual': ['casual', 'daily', 'everyday', 'regular'],
  'Formal': ['formal', 'office', 'business', 'corporate'],
  'Engagement': ['engagement', 'ring ceremony'],
  'Haldi': ['haldi'],
  'Sangeet': ['sangeet'],
  'Mehendi': ['mehendi'],
  'Reception': ['reception'],
};

const COLOR_PATTERNS = [
  'pearl white', 'off-white', 'off white', 'ivory', 'cream', 'beige', 'champagne',
  'rani pink', 'hot pink', 'pastel pink', 'dusty pink', 'light pink', 'rose pink',
  'royal blue', 'navy blue', 'teal blue', 'sky blue', 'turquoise', 'cobalt blue',
  'emerald green', 'pista green', 'mehendi green', 'olive green', 'sea green',
  'teal green', 'mint green', 'forest green',
  'wine', 'maroon', 'burgundy', 'rust', 'rust orange', 'terracotta',
  'mustard', 'golden', 'gold', 'yellow',
  'purple', 'lavender', 'lilac', 'mauve', 'plum',
  'peach', 'coral', 'salmon', 'blush',
  'silver', 'grey', 'charcoal', 'ash',
  'black', 'white', 'red', 'orange', 'pink', 'blue', 'green',
];

const SILHOUETTE_MAP: Record<string, string> = {
  'lehenga choli': 'Flared Lehenga with Fitted Choli',
  lehenga: 'Flared Lehenga',
  saree: 'Draped Saree with Blouse',
  anarkali: 'Flowing Anarkali (Fitted Yoke, Flared Hem)',
  'salwar kameez': 'Straight / A-Line Kameez with Salwar',
  'palazzo suit': 'Straight Kurti with Palazzo Pants',
  sharara: 'Short Kurti with Flared Sharara',
  gharara: 'Short Kurti with Flared Gharara',
  gown: 'A-Line / Mermaid Gown',
  sherwani: 'Straight Cut Sherwani with Churidar',
  kurta: 'Straight Kurta with Bottom',
};

const NECKLINE_MAP: Record<string, string> = {
  'lehenga choli': 'Customizable (Round, Sweetheart, V-Neck)',
  lehenga: 'Customizable (Round, Sweetheart, V-Neck)',
  saree: 'Blouse — Customizable',
  anarkali: 'Round / V-Neck / Boat Neck',
  'salwar kameez': 'Round / V-Neck / Mandarin Collar',
  'palazzo suit': 'Round / V-Neck / Keyhole',
  sharara: 'Round / V-Neck / Square',
  gharara: 'Round / V-Neck / Square',
  gown: 'Sweetheart / V-Neck / Off-Shoulder',
  sherwani: 'Mandarin Collar / Stand Collar',
  kurta: 'Mandarin Collar / Round Neck',
};

const SLEEVE_MAP: Record<string, string> = {
  'lehenga choli': 'Customizable (Sleeveless to Full Sleeve)',
  lehenga: 'Customizable (Sleeveless to Full Sleeve)',
  saree: 'Blouse Sleeve — Customizable',
  anarkali: '3/4 Sleeve / Full Sleeve / Sleeveless',
  'salwar kameez': '3/4 Sleeve / Full Sleeve / Sleeveless',
  'palazzo suit': '3/4 Sleeve / Sleeveless / Cape',
  sharara: '3/4 Sleeve / Sleeveless / Bell Sleeve',
  gharara: '3/4 Sleeve / Sleeveless / Bell Sleeve',
  gown: 'Sleeveless / Cap Sleeve / Full Sleeve',
  sherwani: 'Full Sleeve with Button Cuffs',
  kurta: 'Full Sleeve / Roll-up Sleeve',
};

const extractSpecs = (
  tags?: string[],
  productType?: string,
  correctedTitle?: string,
  description?: string
): ExtractedSpecs => {
  const specs: ExtractedSpecs = {
    color: '',
    fabric: '',
    work: '',
    type: productType || '',
    occasion: '',
    neckline: '',
    sleeve: '',
    silhouette: '',
    closure: '',
    lining: '',
    care: 'Dry Clean Only',
    fit: '',
    length: '',
    embroidery: '',
    origin: 'Handcrafted in India',
  };

  const titleLower = (correctedTitle || '').toLowerCase();
  const descLower = (description || '').toLowerCase();
  const lowerTags = (tags || []).map((t) => t.toLowerCase());
  const allText = `${titleLower} ${descLower} ${lowerTags.join(' ')}`;

  // ── Color ──
  for (const color of COLOR_PATTERNS) {
    if (titleLower.includes(color)) {
      specs.color = color
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      break;
    }
  }
  if (!specs.color) {
    for (const color of COLOR_PATTERNS) {
      if (lowerTags.some((t) => t.includes(color))) {
        specs.color = color
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        break;
      }
    }
  }

  // ── Fabric ──
  for (const fabric of FABRIC_KEYWORDS) {
    if (titleLower.includes(fabric)) {
      specs.fabric = fabric
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      break;
    }
  }
  if (!specs.fabric) {
    const foundFabric = FABRIC_KEYWORDS.find((f) =>
      lowerTags.some((t) => t.includes(f))
    );
    if (foundFabric) {
      specs.fabric = foundFabric
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }

  // ── Work / Embroidery ──
  const foundWorks = WORK_KEYWORDS.filter(
    (w) => titleLower.includes(w) || lowerTags.some((t) => t.includes(w))
  );
  if (foundWorks.length > 0) {
    specs.work = foundWorks
      .map((w) =>
        w
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      )
      .join(', ');
    specs.embroidery = specs.work;
  }

  // ── Occasion ──
  for (const [occasion, keywords] of Object.entries(OCCASION_KEYWORDS)) {
    if (keywords.some((k) => allText.includes(k))) {
      specs.occasion = specs.occasion
        ? `${specs.occasion}, ${occasion}`
        : occasion;
    }
  }
  if (!specs.occasion) {
    specs.occasion = 'Wedding, Festive & Special Occasions';
  }

  // ── Product-type derived specs ──
  const ptLower = (productType || '').toLowerCase();

  // Determine silhouette, neckline, sleeve from product type
  for (const [key, value] of Object.entries(SILHOUETTE_MAP)) {
    if (ptLower.includes(key)) {
      specs.silhouette = value;
      specs.neckline = NECKLINE_MAP[key] || 'Customizable';
      specs.sleeve = SLEEVE_MAP[key] || 'Customizable';
      break;
    }
  }

  // ── Closure ──
  if (
    ptLower.includes('lehenga') ||
    ptLower.includes('saree') ||
    ptLower.includes('anarkali') ||
    ptLower.includes('salwar')
  ) {
    specs.closure = 'Side Zip / Hook & Eye / Back Tie';
  } else if (ptLower.includes('sherwani') || ptLower.includes('kurta')) {
    specs.closure = 'Front Button Placket';
  } else {
    specs.closure = 'Side Zip / Hook & Eye';
  }

  // ── Lining ──
  if (
    ptLower.includes('lehenga') ||
    ptLower.includes('saree') ||
    ptLower.includes('gown')
  ) {
    specs.lining = 'Full Satin / Cotton Inner Lining';
  } else if (
    ptLower.includes('salwar') ||
    ptLower.includes('anarkali') ||
    ptLower.includes('kurta')
  ) {
    specs.lining = 'Cotton / Satin Lining (Bodice)';
  } else {
    specs.lining = 'Cotton / Satin Inner Lining';
  }

  // ── Fit ──
  if (ptLower.includes('anarkali')) {
    specs.fit = 'Fitted Yoke, Flowing Flare';
  } else if (ptLower.includes('lehenga')) {
    specs.fit = 'Fitted Waist, Voluminous Flare';
  } else if (ptLower.includes('saree')) {
    specs.fit = 'Free Size (Draped)';
  } else if (ptLower.includes('sherwani')) {
    specs.fit = 'Tailored Fit';
  } else {
    specs.fit = 'Regular to Semi-Fitted';
  }

  // ── Length ──
  if (ptLower.includes('lehenga')) {
    specs.length = 'Lehenga: Floor Length';
  } else if (ptLower.includes('anarkali')) {
    specs.length = 'Floor Length / Ankle Length';
  } else if (ptLower.includes('gown')) {
    specs.length = 'Floor Length';
  } else if (ptLower.includes('saree')) {
    specs.length = 'Saree: 5.5–6 Metres';
  } else if (ptLower.includes('kurta') || ptLower.includes('salwar')) {
    specs.length = 'Knee Length to Calf Length';
  }

  return specs;
};

// ─── Spec Row Component ─────────────────────────────────────────────────

interface SpecRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay?: number;
}

const SpecRow = ({ icon, label, value, delay = 0 }: SpecRowProps) => {
  if (!value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay }}
      className="flex items-start gap-3 py-3 border-b border-border/40 last:border-b-0"
    >
      <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <dt className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
          {label}
        </dt>
        <dd className="text-sm font-medium text-foreground leading-snug">
          {value}
        </dd>
      </div>
    </motion.div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────

export const ProductSpecificationTable = ({
  product,
  correctedTitle,
}: ProductSpecificationTableProps) => {
  const specs = useMemo(
    () =>
      extractSpecs(
        product.tags,
        product.productType,
        correctedTitle,
        product.description
      ),
    [product.tags, product.productType, correctedTitle, product.description]
  );

  const specRows: SpecRowProps[] = [
    {
      icon: <Palette className="h-4 w-4 text-primary" />,
      label: 'Color',
      value: specs.color,
    },
    {
      icon: <Layers className="h-4 w-4 text-primary" />,
      label: 'Fabric',
      value: specs.fabric,
    },
    {
      icon: <Sparkles className="h-4 w-4 text-primary" />,
      label: 'Work / Embroidery',
      value: specs.work || specs.embroidery,
    },
    {
      icon: <Tag className="h-4 w-4 text-primary" />,
      label: 'Product Type',
      value: specs.type,
    },
    {
      icon: <CalendarDays className="h-4 w-4 text-primary" />,
      label: 'Occasion',
      value: specs.occasion,
    },
    {
      icon: <CircleDot className="h-4 w-4 text-primary" />,
      label: 'Neckline',
      value: specs.neckline,
    },
    {
      icon: <ShirtIcon className="h-4 w-4 text-primary" />,
      label: 'Sleeve Style',
      value: specs.sleeve,
    },
    {
      icon: <Workflow className="h-4 w-4 text-primary" />,
      label: 'Silhouette',
      value: specs.silhouette,
    },
    {
      icon: <Scissors className="h-4 w-4 text-primary" />,
      label: 'Closure',
      value: specs.closure,
    },
    {
      icon: <Shirt className="h-4 w-4 text-primary" />,
      label: 'Lining',
      value: specs.lining,
    },
    {
      icon: <Info className="h-4 w-4 text-primary" />,
      label: 'Care Instructions',
      value: specs.care,
    },
    {
      icon: <Armchair className="h-4 w-4 text-primary" />,
      label: 'Fit',
      value: specs.fit,
    },
    {
      icon: <PackageOpen className="h-4 w-4 text-primary" />,
      label: 'Origin',
      value: specs.origin,
    },
  ];

  // Filter out empty values
  const visibleRows = specRows.filter((row) => row.value);

  if (visibleRows.length === 0) return null;

  return (
    <section
      className="w-full"
      aria-label="Product Specifications"
      itemScope
      itemType="https://schema.org/Product"
    >
      {/* SEO: Structured data meta tags */}
      {specs.color && (
        <meta itemProp="color" content={specs.color} />
      )}
      {specs.fabric && (
        <meta itemProp="material" content={specs.fabric} />
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Technical Specifications
        </h3>

        <div className="border border-border rounded-sm overflow-hidden">
          <dl className="divide-y divide-border/40">
            {visibleRows.map((row, index) => (
              <SpecRow
                key={row.label}
                icon={row.icon}
                label={row.label}
                value={row.value}
                delay={index * 0.04}
              />
            ))}
          </dl>
        </div>

        {/* Hidden structured data for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'IndividualProduct',
              name: correctedTitle || product.title,
              material: specs.fabric || undefined,
              color: specs.color || undefined,
              countryOfOrigin: 'IN',
              additionalProperty: visibleRows.map((row) => ({
                '@type': 'PropertyValue',
                name: row.label,
                value: row.value,
              })),
            }),
          }}
        />
      </motion.div>
    </section>
  );
};

export default ProductSpecificationTable;
