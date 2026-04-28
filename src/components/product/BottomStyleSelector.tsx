import { Check } from 'lucide-react';

export type BottomStyleOption = 'Churidar' | 'Salwar' | 'Semi Patiala' | 'Straight Pant / Palazzo';

interface BottomStyleSelectorProps {
  selected: BottomStyleOption | null;
  onChange: (style: BottomStyleOption) => void;
}

const bottomStyleOptions: { label: BottomStyleOption; description: string }[] = [
  {
    label: 'Churidar',
    description: 'Tapered, fitted leggings with gathers at the ankle — classic and elegant',
  },
  {
    label: 'Salwar',
    description: 'Traditional relaxed-fit bottom with a drawstring waist — comfortable and timeless',
  },
  {
    label: 'Semi Patiala',
    description: 'Moderately flared with subtle pleats — a balanced silhouette between salwar and patiala',
  },
  {
    label: 'Straight Pant / Palazzo',
    description: 'Straight-cut or wide-leg flowing pants — modern and versatile styling',
  },
];

export const BottomStyleSelector = ({ selected, onChange }: BottomStyleSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium uppercase tracking-wide">
          Bottom / Lower Style
          {selected && (
            <span className="font-normal text-muted-foreground ml-2">— {selected}</span>
          )}
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {bottomStyleOptions.map((opt) => {
          const isSelected = selected === opt.label;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.label)}
              className={`flex items-start gap-3 p-3 rounded-sm border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-border hover:border-foreground/30'
              }`}
            >
              <div
                className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'border-[#D4AF37] bg-[#D4AF37]'
                    : 'border-muted-foreground/40'
                }`}
              >
                {isSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
              </div>
              <div className="min-w-0">
                <span
                  className={`text-sm font-medium block ${
                    isSelected ? 'text-foreground' : 'text-foreground'
                  }`}
                >
                  {opt.label}
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed block mt-0.5">
                  {opt.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
