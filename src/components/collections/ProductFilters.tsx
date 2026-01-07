import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

export interface FilterSection {
  name: string;
  options: string[];
}

interface ProductFiltersProps {
  onFilterChange: (filters: Record<string, string[]>) => void;
  activeFilters: Record<string, string[]>;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  filterSections?: FilterSection[];
}

const defaultFilterSections: FilterSection[] = [
  {
    name: 'Size',
    options: ['S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom'],
  },
  {
    name: 'Availability',
    options: ['Ready to Ship', 'Made to Order'],
  },
  {
    name: 'Occasion',
    options: ['Bridal', 'Wedding', 'Festive', 'Party', 'Casual'],
  },
  {
    name: 'Fabric',
    options: ['Silk', 'Cotton', 'Chiffon', 'Georgette', 'Velvet', 'Organza', 'Net'],
  },
  {
    name: 'Color',
    options: ['Red', 'Pink', 'Blue', 'Green', 'Gold', 'White', 'Black', 'Multi'],
  },
  {
    name: 'Work',
    options: ['Embroidery', 'Sequins', 'Zari', 'Heavy Work', 'Printed', 'Plain'],
  },
];

export const ProductFilters = ({
  onFilterChange,
  activeFilters,
  priceRange,
  onPriceChange,
  filterSections = defaultFilterSections,
}: ProductFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['Price', 'Availability', 'Occasion']);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleOptionToggle = (section: string, option: string) => {
    const currentOptions = activeFilters[section] || [];
    const newOptions = currentOptions.includes(option)
      ? currentOptions.filter((o) => o !== option)
      : [...currentOptions, option];

    onFilterChange({
      ...activeFilters,
      [section]: newOptions,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({});
    onPriceChange([0, 1000]);
  };

  const totalActiveFilters = Object.values(activeFilters).flat().length;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="sticky top-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-serif">Filters</h2>
          {totalActiveFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear All ({totalActiveFilters})
            </Button>
          )}
        </div>

        {/* Price Range */}
        <div className="mb-6 pb-6 border-b border-border">
          <button
            onClick={() => toggleSection('Price')}
            className="flex items-center justify-between w-full text-left mb-4"
          >
            <span className="text-sm font-medium uppercase tracking-wide">Price</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                expandedSections.includes('Price') ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {expandedSections.includes('Price') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4">
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => onPriceChange(value as [number, number])}
                    min={0}
                    max={1000}
                    step={50}
                    className="py-4"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Sections */}
        {filterSections.map((section) => (
          <div key={section.name} className="mb-6 pb-6 border-b border-border last:border-0">
            <button
              onClick={() => toggleSection(section.name)}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <span className="text-sm font-medium uppercase tracking-wide">
                {section.name}
                {activeFilters[section.name]?.length > 0 && (
                  <span className="ml-2 text-xs text-primary">
                    ({activeFilters[section.name].length})
                  </span>
                )}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedSections.includes(section.name) ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {expandedSections.includes(section.name) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {section.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <Checkbox
                        checked={activeFilters[section.name]?.includes(option) || false}
                        onCheckedChange={() => handleOptionToggle(section.name, option)}
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </aside>
  );
};

interface ActiveFilterTagsProps {
  filters: Record<string, string[]>;
  onRemove: (section: string, option: string) => void;
}

export const ActiveFilterTags = ({ filters, onRemove }: ActiveFilterTagsProps) => {
  const allTags = Object.entries(filters).flatMap(([section, options]) =>
    options.map((option) => ({ section, option }))
  );

  if (allTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {allTags.map(({ section, option }) => (
        <button
          key={`${section}-${option}`}
          onClick={() => onRemove(section, option)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-secondary rounded-sm hover:bg-secondary/80 transition-colors"
        >
          {option}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
};
