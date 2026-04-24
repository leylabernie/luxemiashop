import { useState } from 'react';
import { sizeChart } from '@/data/sizeChart';
import { SizeChartModal } from './SizeChartModal';
import { HowToMeasureModal } from './HowToMeasureModal';

interface StitchingSizeSelectorProps {
  selectedSize: string | null;
  onSizeChange: (size: string | null) => void;
  showValidation: boolean;
}

export const StitchingSizeSelector = ({
  selectedSize,
  onSizeChange,
  showValidation,
}: StitchingSizeSelectorProps) => {
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [howToMeasureOpen, setHowToMeasureOpen] = useState(false);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium uppercase tracking-wide">
        Stitching Size
        {selectedSize && (
          <span className="font-normal text-muted-foreground ml-2">— {selectedSize}</span>
        )}
      </label>

      {/* Size grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
        {sizeChart.map((entry) => (
          <button
            key={entry.size}
            onClick={() => onSizeChange(entry.size)}
            className={`px-2 py-2.5 text-sm border rounded-sm transition-all duration-300 text-center ${
              selectedSize === entry.size
                ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-foreground ring-1 ring-[#D4AF37]'
                : 'border-border hover:border-foreground/50'
            }`}
          >
            {entry.size}
          </button>
        ))}
      </div>

      {/* Validation message */}
      {showValidation && !selectedSize && (
        <p className="text-sm text-red-500">Please select a stitching size before adding to bag.</p>
      )}

      {/* Size Chart & How to Measure links */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setSizeChartOpen(true)}
          className="text-sm text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
        >
          📐 Size Chart
        </button>
        <button
          type="button"
          onClick={() => setHowToMeasureOpen(true)}
          className="text-sm text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
        >
          📏 How to Measure
        </button>
      </div>

      <SizeChartModal open={sizeChartOpen} onOpenChange={setSizeChartOpen} />
      <HowToMeasureModal open={howToMeasureOpen} onOpenChange={setHowToMeasureOpen} />
    </div>
  );
};
