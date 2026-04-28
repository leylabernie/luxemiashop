import { useState } from 'react';
import { sizeChart } from '@/data/sizeChart';
import { SizeChartModal } from './SizeChartModal';
import { HowToMeasureModal } from './HowToMeasureModal';

// Standard letter sizes for Semi Stitched
const LETTER_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Numeric bust sizes for Ready to Wear / Made to Measure (28-62)
const NUMERIC_SIZES = sizeChart.map((entry) => entry.size);

// Standard menswear sizes
const MENSWEAR_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export type SizeMode = 'numeric' | 'letter' | 'menswear';

interface StitchingSizeSelectorProps {
  selectedSize: string | null;
  onSizeChange: (size: string | null) => void;
  showValidation: boolean;
  /** Controls which size set to display */
  sizeMode?: SizeMode;
  /** Label for the size section (e.g. "Stitching Size", "Select Your Size") */
  label?: string;
  /** Sub-label hint (e.g. "Bust size in inches", "Standard size") */
  hint?: string;
}

export const StitchingSizeSelector = ({
  selectedSize,
  onSizeChange,
  showValidation,
  sizeMode = 'numeric',
  label = 'Stitching Size',
  hint,
}: StitchingSizeSelectorProps) => {
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [howToMeasureOpen, setHowToMeasureOpen] = useState(false);

  const sizes = sizeMode === 'letter'
    ? LETTER_SIZES
    : sizeMode === 'menswear'
    ? MENSWEAR_SIZES
    : NUMERIC_SIZES;

  const gridCols = sizeMode === 'numeric'
    ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-7'
    : 'grid-cols-3 sm:grid-cols-5';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium uppercase tracking-wide">
          {label}
          {selectedSize && (
            <span className="font-normal text-muted-foreground ml-2">— {selectedSize}</span>
          )}
        </label>
        {hint && (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        )}
      </div>

      {/* Size grid */}
      <div className={`grid ${gridCols} gap-2`}>
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSizeChange(size)}
            className={`px-2 py-2.5 text-sm border rounded-sm transition-all duration-300 text-center ${
              selectedSize === size
                ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-foreground ring-1 ring-[#D4AF37]'
                : 'border-border hover:border-foreground/50'
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Validation message */}
      {showValidation && !selectedSize && (
        <p className="text-sm text-red-500">Please select a size before adding to bag.</p>
      )}

      {/* Size Chart & How to Measure links */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setSizeChartOpen(true)}
          className="text-sm text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
        >
          Size Chart
        </button>
        <button
          type="button"
          onClick={() => setHowToMeasureOpen(true)}
          className="text-sm text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
        >
          How to Measure
        </button>
      </div>

      <SizeChartModal open={sizeChartOpen} onOpenChange={setSizeChartOpen} />
      <HowToMeasureModal open={howToMeasureOpen} onOpenChange={setHowToMeasureOpen} />
    </div>
  );
};
