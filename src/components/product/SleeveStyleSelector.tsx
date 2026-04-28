import { Check } from 'lucide-react';

export type SleeveStyleOption = 'Full Sleeve' | '3/4 Sleeve' | 'Half Sleeve' | 'Sleeveless' | 'Cap Sleeve';

interface SleeveStyleSelectorProps {
  selected: SleeveStyleOption | null;
  onChange: (style: SleeveStyleOption) => void;
}

const sleeveStyleOptions: { label: SleeveStyleOption; description: string }[] = [
  {
    label: 'Full Sleeve',
    description: 'Extends to the wrist — classic and formal',
  },
  {
    label: '3/4 Sleeve',
    description: 'Ends between elbow and wrist — versatile and popular',
  },
  {
    label: 'Half Sleeve',
    description: 'Ends at or above the elbow — breezy and casual',
  },
  {
    label: 'Sleeveless',
    description: 'No sleeves — ideal for warm weather and layering',
  },
  {
    label: 'Cap Sleeve',
    description: 'Very short sleeve covering just the shoulder — delicate and feminine',
  },
];

export const SleeveStyleSelector = ({ selected, onChange }: SleeveStyleSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium uppercase tracking-wide">
          Sleeve Style
          {selected && (
            <span className="font-normal text-muted-foreground ml-2">— {selected}</span>
          )}
        </label>
        <span className="text-[10px] text-primary font-medium uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
          UDesign
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sleeveStyleOptions.map((opt) => {
          const isSelected = selected === opt.label;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.label)}
              className={`group relative px-4 py-2.5 text-sm border rounded-sm transition-all duration-300 ${
                isSelected
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-foreground ring-1 ring-[#D4AF37]'
                  : 'border-border hover:border-foreground/50 text-foreground'
              }`}
              title={opt.description}
            >
              <span className="flex items-center gap-1.5">
                {opt.label}
                {isSelected && <Check className="h-3 w-3 text-[#D4AF37]" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="text-[11px] text-muted-foreground italic">
          {sleeveStyleOptions.find(o => o.label === selected)?.description}
        </p>
      )}
    </div>
  );
};
