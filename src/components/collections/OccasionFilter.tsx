import { useRef, useEffect } from 'react';
import type { ShopifyProduct } from '@/lib/shopify';

export interface OccasionDef {
  label: string;
  keywords: string[];
}

const OCCASIONS: OccasionDef[] = [
  { label: 'All', keywords: [] },
  { label: 'Bridal', keywords: ['bridal', 'bride', 'dulhan'] },
  { label: 'Wedding', keywords: ['wedding', 'shaadi', 'nikah'] },
  { label: 'Mehendi', keywords: ['mehendi', 'mehndi', 'haldi'] },
  { label: 'Cocktail', keywords: ['cocktail', 'party', 'reception', 'sangeet'] },
  { label: 'Festive', keywords: ['festive', 'festival', 'diwali', 'eid', 'navratri'] },
  { label: 'Casual', keywords: ['casual', 'daily', 'everyday'] },
];

/** Check whether a product matches a given occasion by scanning tags, title, and description. */
const productMatchesOccasion = (product: ShopifyProduct, occasion: OccasionDef): boolean => {
  if (occasion.keywords.length === 0) return true; // "All"

  const tags = (product.node.tags ?? []).map((t) => t.toLowerCase());
  const title = product.node.title.toLowerCase();
  const description = (product.node.description ?? '').toLowerCase();
  const searchable = [...tags, title, description].join(' ');

  return occasion.keywords.some((kw) => searchable.includes(kw));
};

/** Filter a product list by the selected occasion. */
export const filterByOccasion = (
  products: ShopifyProduct[],
  selectedLabel: string
): ShopifyProduct[] => {
  const occasion = OCCASIONS.find((o) => o.label === selectedLabel);
  if (!occasion || occasion.keywords.length === 0) return products;
  return products.filter((p) => productMatchesOccasion(p, occasion));
};

interface OccasionFilterProps {
  selected: string;
  onChange: (label: string) => void;
}

export const OccasionFilter = ({ selected, onChange }: OccasionFilterProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll active pill into view on mount / change
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const active = container.querySelector('[data-active="true"]') as HTMLElement | null;
    if (active) {
      active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
  }, [selected]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
    >
      {OCCASIONS.map((occ) => {
        const isActive = selected === occ.label;
        return (
          <button
            key={occ.label}
            data-active={isActive}
            onClick={() => onChange(occ.label)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
              isActive
                ? 'bg-[#D4AF37] border-[#D4AF37] text-white'
                : 'border-[#D4AF37]/40 text-foreground hover:border-[#D4AF37] hover:bg-[#D4AF37]/10'
            }`}
          >
            {occ.label}
          </button>
        );
      })}
    </div>
  );
};
