import { Layers, PackageCheck, Scissors } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

export interface SizingAlterationDetailsInput {
  productTitle: string;
  productType?: string;
  description?: string;
  tags?: string[];
  includedPieces?: string;
  includedBulletItems?: string[];
  isUnstitched?: boolean;
  isAccessory?: boolean;
  isJewelry?: boolean;
}

export interface SizingAlterationDetailsModel {
  innerLiningCopy: string;
  includedPiecesCopy: string;
  alterationMarginCopy: string;
}

const ACCESSORY_KEYWORDS = [
  'jewelry',
  'jewellery',
  'accessory',
  'accessories',
  'necklace',
  'choker',
  'earring',
  'bangle',
  'bracelet',
  'ring',
  'bag',
  'clutch',
  'footwear',
  'jutti',
  'mojri',
];

function extractExplicitLining(description = '', tags: string[] = []): string | null {
  for (const rawTag of tags) {
    const trimmed = rawTag.trim();
    if (/^(?:inner|lining)\s*:/i.test(trimmed)) {
      const value = trimmed.slice(trimmed.indexOf(':') + 1).trim();
      if (value) return value;
    }
  }

  const plain = description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const match = plain.match(/\b(?:inner(?:\s+fabric)?|lining(?:\s+fabric)?)\s*[:\-–]\s*([A-Za-z0-9 ,/&()-]{3,60}?)(?=[.;|]|\s{2,}|$)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

function inferFallbackIncludedPieces(productTitle: string, productType = ''): string {
  const combined = `${productType} ${productTitle}`.toLowerCase();
  if (combined.includes('lehenga')) {
    return 'Lehenga skirt, blouse/choli, and dupatta (verify exact stitching state in options above)';
  }
  if (combined.includes('saree')) {
    return 'Saree drape with blouse piece as stated in Product Details';
  }
  if (combined.includes('sherwani') || combined.includes('kurta')) {
    return 'Menswear set pieces as specified in Product Details';
  }
  if (
    combined.includes('sharara') ||
    combined.includes('gharara') ||
    combined.includes('anarkali') ||
    combined.includes('palazzo') ||
    combined.includes('salwar') ||
    combined.includes('suit')
  ) {
    return 'Kameez/top, coordinated bottom, and dupatta where stated in Product Details';
  }
  return 'Garment pieces as itemized in Product Details';
}

export function buildSizingAlterationDetails(
  input: SizingAlterationDetailsInput,
): SizingAlterationDetailsModel | null {
  const haystack = `${input.productType || ''} ${input.productTitle || ''}`.toLowerCase();
  if (
    input.isAccessory ||
    input.isJewelry ||
    ACCESSORY_KEYWORDS.some((kw) => haystack.includes(kw))
  ) {
    return null;
  }

  const explicitLining = extractExplicitLining(input.description, input.tags);
  const innerLiningCopy = explicitLining
    ? `${explicitLining} inner lining as listed in Product Details, paired for comfortable multi-hour event wear.`
    : input.isUnstitched
      ? 'Supplied in its listed unstitched fabric construction; when custom blouse or suit stitching is added, bodices are lined with breathable soft cotton or crepe.'
      : 'Breathable soft cotton or crepe inner lining on lined bodices and embroidered panels to prevent scratchiness during multi-hour wedding and festive wear.';

  const bulletSummary = input.includedBulletItems?.filter(Boolean).join(', ');
  const includedPiecesCopy =
    bulletSummary ||
    input.includedPieces?.trim() ||
    inferFallbackIncludedPieces(input.productTitle, input.productType);

  const alterationMarginCopy =
    'Custom-stitched blouses, cholis, and suit tops include a 2-inch (5 cm) internal seam allowance on both side seams where construction permits for easy local tailoring — backed by up to $20 USD in Local Alteration Credit.';

  return {
    innerLiningCopy,
    includedPiecesCopy,
    alterationMarginCopy,
  };
}

export const SizingAlterationCallout = (props: SizingAlterationDetailsInput) => {
  const details = buildSizingAlterationDetails(props);
  if (!details) return null;

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="sizing-alteration"
      className="rounded-sm border border-border/70 bg-secondary/20 px-3.5"
      data-testid="sizing-alteration-callout"
    >
      <AccordionItem value="sizing-alteration" className="border-b-0">
        <AccordionTrigger className="py-3 text-left text-xs sm:text-sm font-medium hover:no-underline">
          <span className="flex items-center gap-2">
            <Scissors className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>Sizing, Lining, Included Pieces &amp; 2&quot; Alteration Margin</span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-3.5 pt-0.5 text-xs sm:text-sm text-muted-foreground">
          <ul className="space-y-2.5 leading-relaxed">
            <li className="flex items-start gap-2">
              <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <strong className="font-medium text-foreground">Inner Lining Fabric:</strong>{' '}
                {details.innerLiningCopy}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <PackageCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <strong className="font-medium text-foreground">Included Pieces:</strong>{' '}
                {details.includedPiecesCopy}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Scissors className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <strong className="font-medium text-foreground">2-Inch Seam Margin &amp; $20 Fit Credit:</strong>{' '}
                {details.alterationMarginCopy}{' '}
                <a href="/alterations" className="text-primary underline underline-offset-4">
                  Learn more
                </a>
              </span>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SizingAlterationCallout;
