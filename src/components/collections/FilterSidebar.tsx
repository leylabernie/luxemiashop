/**
 * FilterSidebar — shared left-sidebar filter component for category listing pages.
 *
 * Improvements over the previous per-page FilterSidebar:
 * - Color swatches (renderAsSwatches) — visual circles, not text checkboxes
 * - Tag-prefix-aware filter values (matches color:red, fabric:silk, etc.)
 * - Receives config as props (no copy-paste per category)
 * - Hoisted to its own module (the previous inline FilterSidebar was recreated
 *   on every render, breaking React reconciliation)
 * - "Active filter count" badge next to "Filters" heading
 * - Clear All button uses URL state hook (updates ?color=&fabric= in URL)
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { CategoryConfig, FilterSection } from '@/config/categoryConfig';

interface FilterSidebarProps {
  config: CategoryConfig;
  activeFilters: Record<string, string[]>;
  priceRange: [number, number];
  onToggleFilter: (section: string, value: string) => void;
  onPriceChange: (range: [number, number]) => void;
  onClearAll: () => void;
  activeFilterCount: number;
  activeSubSlug?: string;
}

export function FilterSidebar({
  config,
  activeFilters,
  priceRange,
  onToggleFilter,
  onPriceChange,
  onClearAll,
  activeFilterCount,
  activeSubSlug,
}: FilterSidebarProps) {
  // Track which sections are expanded. Default-expand sections where
  // defaultExpanded === true in config.
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const defaults: string[] = ['Price', 'Occasion'];
    for (const section of config.filters) {
      if (section.defaultExpanded) defaults.push(section.name);
    }
    return defaults;
  });

  const toggleSection = (name: string) => {
    setExpandedSections(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="sticky top-28 lg:top-36">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-serif flex items-center gap-2">
            Filters
            {hasActiveFilters && (
              <span className="text-xs bg-foreground text-background rounded-full px-2 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Subcategory navigation — moved from horizontal chips to sidebar */}
        {config.subcategories.filter(s => s.group === 'occasion').length > 0 && (
          <FilterSectionBlock
            name="Occasion"
            isActive={!!activeSubSlug}
            isExpanded={expandedSections.includes('Occasion')}
            onToggle={() => toggleSection('Occasion')}
          >
            <div className="flex flex-col gap-1">
              <Link
                to={`/${config.slug}`}
                className={cn(
                  'text-sm py-1.5 px-2 rounded transition-colors',
                  !activeSubSlug
                    ? 'bg-secondary text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                All {config.name}
              </Link>
              {config.subcategories
                .filter(s => s.group === 'occasion')
                .map(sub => (
                  <Link
                    key={sub.slug}
                    to={`/${config.slug}?sub=${sub.slug}`}
                    className={cn(
                      'text-sm py-1.5 px-2 rounded transition-colors',
                      activeSubSlug === sub.slug
                        ? 'bg-secondary text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    )}
                  >
                    {sub.label}
                  </Link>
                ))}
            </div>
          </FilterSectionBlock>
        )}

        {/* Price Range */}
        <FilterSectionBlock
          name="Price"
          isActive={priceRange[0] !== config.priceRange[0] || priceRange[1] !== config.priceRange[1]}
          isExpanded={expandedSections.includes('Price')}
          onToggle={() => toggleSection('Price')}
        >
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={(value) => onPriceChange(value as [number, number])}
              min={config.priceRange[0]}
              max={config.priceRange[1]}
              step={config.priceStep}
              className="py-4"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}{priceRange[1] >= config.priceRange[1] ? '+' : ''}</span>
            </div>
          </div>
        </FilterSectionBlock>

        {/* Configurable Filter Sections */}
        {config.filters.map(section => (
          <FilterSectionBlock
            key={section.name}
            name={section.name}
            count={activeFilters[section.name]?.length || 0}
            isExpanded={expandedSections.includes(section.name)}
            onToggle={() => toggleSection(section.name)}
          >
            {section.renderAsSwatches ? (
              <ColorSwatchGrid
                section={section}
                activeValues={activeFilters[section.name] || []}
                onToggle={(value) => onToggleFilter(section.name, value)}
              />
            ) : (
              <CheckboxList
                section={section}
                activeValues={activeFilters[section.name] || []}
                onToggle={(value) => onToggleFilter(section.name, value)}
              />
            )}
          </FilterSectionBlock>
        ))}
      </div>
    </aside>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

interface FilterSectionBlockProps {
  name: string;
  count?: number;
  isActive?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSectionBlock({
  name,
  count = 0,
  isActive = false,
  isExpanded,
  onToggle,
  children,
}: FilterSectionBlockProps) {
  return (
    <div className="mb-6 pb-6 border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left mb-4"
      >
        <span className="text-sm font-medium uppercase tracking-wide flex items-center gap-2">
          {name}
          {count > 0 && (
            <span className="text-xs text-primary">({count})</span>
          )}
          {isActive && count === 0 && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CheckboxListProps {
  section: FilterSection;
  activeValues: string[];
  onToggle: (value: string) => void;
}

function CheckboxList({ section, activeValues, onToggle }: CheckboxListProps) {
  return (
    <>
      {section.options.map(option => {
        const checked = activeValues.includes(option.value);
        return (
          <label
            key={option.value}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={() => onToggle(option.value)}
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {option.label}
            </span>
          </label>
        );
      })}
    </>
  );
}

interface ColorSwatchGridProps {
  section: FilterSection;
  activeValues: string[];
  onToggle: (value: string) => void;
}

function ColorSwatchGrid({ section, activeValues, onToggle }: ColorSwatchGridProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {section.options.map(option => {
        const checked = activeValues.includes(option.value);
        return (
          <button
            key={option.value}
            onClick={() => onToggle(option.value)}
            title={option.label}
            className={cn(
              'group relative flex flex-col items-center gap-1.5',
            )}
          >
            <span
              className={cn(
                'block h-8 w-8 rounded-full border-2 transition-all',
                checked
                  ? 'border-foreground ring-2 ring-foreground/20 ring-offset-2 ring-offset-background'
                  : 'border-border group-hover:border-foreground/50'
              )}
              style={{ backgroundColor: option.hex || '#ccc' }}
            />
            <span
              className={cn(
                'text-[10px] leading-tight text-center transition-colors',
                checked
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground group-hover:text-foreground'
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── ActiveFilterTags — chip strip shown above the grid ────────────────────

interface ActiveFilterTagsProps {
  filters: Record<string, string[]>;
  onRemove: (section: string, value: string) => void;
  /** Optional: section name → label lookup for displaying the section in the chip */
  sectionLabels?: Record<string, string>;
}

export function ActiveFilterTags({ filters, onRemove, sectionLabels }: ActiveFilterTagsProps) {
  const entries = Object.entries(filters).filter(([, values]) => values.length > 0);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {entries.map(([section, values]) =>
        values.map(value => (
          <button
            key={`${section}-${value}`}
            onClick={() => onRemove(section, value)}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <span className="text-muted-foreground">{sectionLabels?.[section] || section}:</span>
            <span>{value}</span>
            <X className="h-3 w-3" />
          </button>
        ))
      )}
    </div>
  );
}
