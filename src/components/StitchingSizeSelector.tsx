import { useState } from 'react';
import { SizeChartModal } from './SizeChartModal';
import { HowToMeasureModal } from './HowToMeasureModal';

// A tailoring option without a native size does not establish a numeric range.
const MEASUREMENT_HANDOFF = 'I will provide measurements after ordering, before tailoring begins.';

interface StitchingSizeSelectorProps {
  selectedSize: string | null;
  onSizeChange: (confirmation: string | null) => void;
  showValidation: boolean;
}

export const StitchingSizeSelector = ({ selectedSize, onSizeChange, showValidation }: StitchingSizeSelectorProps) => {
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [howToMeasureOpen, setHowToMeasureOpen] = useState(false);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium uppercase tracking-wide">Measurement handoff</h3>
      <p className="text-sm text-muted-foreground">
        This option does not list a standard size range. Provide your measurements after ordering;
        measurement-based tailoring can begin only after the details are confirmed.
      </p>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={Boolean(selectedSize)}
          onChange={(event) => onSizeChange(event.target.checked ? MEASUREMENT_HANDOFF : null)}
          className="mt-1"
        />
        <span>{MEASUREMENT_HANDOFF}</span>
      </label>
      {showValidation && !selectedSize && (
        <p role="alert" className="text-sm text-red-500">Confirm the measurement handoff before adding to bag.</p>
      )}

      {/* Size Chart & How to Measure links */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setSizeChartOpen(true)}
          className="text-sm text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
        >
          Size Guidance
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
