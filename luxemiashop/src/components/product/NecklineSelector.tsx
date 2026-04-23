import { useState } from 'react';

export type NecklineOption = 'Round Neck' | 'Deep U-Neck' | 'Square Neck' | 'Sweetheart';

interface NecklineSelectorProps {
  selected: NecklineOption;
  onChange: (neckline: NecklineOption) => void;
}

const necklineOptions: { label: NecklineOption; icon: JSX.Element }[] = [
  {
    label: 'Round Neck',
    icon: (
      <svg viewBox="0 0 60 50" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 45 L10 20 Q10 8 30 8 Q50 8 50 20 L50 45" strokeLinecap="round" />
        <path d="M18 15 Q30 25 42 15" strokeLinecap="round" strokeDasharray="0" />
      </svg>
    ),
  },
  {
    label: 'Deep U-Neck',
    icon: (
      <svg viewBox="0 0 60 50" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 45 L10 12 Q10 5 18 5 L42 5 Q50 5 50 12 L50 45" strokeLinecap="round" />
        <path d="M18 8 Q18 35 30 35 Q42 35 42 8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Square Neck',
    icon: (
      <svg viewBox="0 0 60 50" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 45 L10 12 Q10 5 18 5 L42 5 Q50 5 50 12 L50 45" strokeLinecap="round" />
        <path d="M18 8 L18 20 L42 20 L42 8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Sweetheart',
    icon: (
      <svg viewBox="0 0 60 50" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 45 L10 12 Q10 5 18 5 L42 5 Q50 5 50 12 L50 45" strokeLinecap="round" />
        <path d="M18 8 Q18 18 24 22 Q28 25 30 30 Q32 25 36 22 Q42 18 42 8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const NecklineSelector = ({ selected, onChange }: NecklineSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium uppercase tracking-wide">
        Blouse Neckline
        <span className="font-normal text-muted-foreground ml-2">— {selected}</span>
      </label>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {necklineOptions.map((opt) => {
          const isSelected = selected === opt.label;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.label)}
              className={`flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-sm border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-foreground'
                  : 'border-border hover:border-foreground/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="w-10 h-8 sm:w-12 sm:h-10">{opt.icon}</div>
              <span className="text-[10px] sm:text-xs text-center leading-tight font-medium">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
