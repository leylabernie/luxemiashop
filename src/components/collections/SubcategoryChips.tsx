/**
 * SubcategoryChips — horizontal pill-style navigation above the product grid.
 *
 * Renders chips grouped by SubcategoryGroup (occasion | style | color | price | audience).
 * Clicking a chip toggles the ?sub=<slug> URL param.
 *
 * Pattern borrowed from kalkifashion.com's category pages:
 * - "All" chip first (clears subcategory)
 * - Chips grouped by category, with a small group label separator
 * - Active chip highlighted
 * - Horizontally scrollable on mobile
 */

import { Link } from 'react-router-dom';
import type { Subcategory, SubcategoryGroup } from '@/config/categoryConfig';
import { cn } from '@/lib/utils';

interface SubcategoryChipsProps {
  subcategories: Subcategory[];
  activeSubSlug: string | null;
  onSelect: (slug: string | null) => void;
  /** Base path for the chips (e.g. '/lehengas') — used for Link hrefs */
  basePath: string;
}

const GROUP_LABELS: Record<SubcategoryGroup, string> = {
  occasion: 'Occasion',
  style: 'Style',
  color: 'Color',
  price: 'Price',
  audience: 'Wedding Party',
};

const GROUP_ORDER: SubcategoryGroup[] = ['occasion', 'style', 'color', 'audience', 'price'];

export function SubcategoryChips({
  subcategories,
  activeSubSlug,
  onSelect,
  basePath,
}: SubcategoryChipsProps) {
  // Group subcategories by their group, preserving GROUP_ORDER
  const grouped: Record<SubcategoryGroup, Subcategory[]> = {
    occasion: [],
    style: [],
    color: [],
    price: [],
    audience: [],
  };
  for (const sub of subcategories) {
    grouped[sub.group].push(sub);
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0
                      scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none]
                      [&::-webkit-scrollbar]:hidden">
        {/* "All" chip */}
        <Link
          to={basePath}
          onClick={() => onSelect(null)}
          className={cn(
            'flex-shrink-0 px-4 py-2 text-sm rounded-full border transition-all whitespace-nowrap',
            activeSubSlug === null
              ? 'bg-foreground text-background border-foreground'
              : 'bg-background text-foreground border-border hover:border-foreground/50'
          )}
        >
          All
        </Link>

        {/* Grouped chips */}
        {GROUP_ORDER.map(group => {
          const subs = grouped[group];
          if (subs.length === 0) return null;
          return (
            <div key={group} className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs uppercase tracking-wider text-muted-foreground/60 hidden md:inline">
                {GROUP_LABELS[group]}:
              </span>
              {subs.map(sub => {
                const isActive = activeSubSlug === sub.slug;
                return (
                  <Link
                    key={sub.slug}
                    to={`${basePath}?sub=${sub.slug}`}
                    onClick={() => onSelect(isActive ? null : sub.slug)}
                    className={cn(
                      'flex-shrink-0 px-4 py-2 text-sm rounded-full border transition-all whitespace-nowrap',
                      isActive
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-foreground border-border hover:border-foreground/50'
                    )}
                  >
                    {sub.label}
                  </Link>
                );
              })}
              <span className="text-border mx-1 hidden md:inline">|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
