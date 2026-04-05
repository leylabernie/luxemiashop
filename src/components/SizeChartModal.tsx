import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { sizeChart } from '@/data/sizeChart';

interface SizeChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SizeChartModal = ({ open, onOpenChange }: SizeChartModalProps) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  const convert = (value: number) => {
    if (unit === 'cm') return (value * 2.54).toFixed(1);
    return value.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Stitching Size Chart</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Unit toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Unit:</span>
            <div className="inline-flex border border-border rounded-sm overflow-hidden">
              <button
                onClick={() => setUnit('inches')}
                className={`px-3 py-1.5 text-xs uppercase tracking-wide transition-colors ${
                  unit === 'inches'
                    ? 'bg-foreground text-background'
                    : 'bg-background text-foreground hover:bg-secondary'
                }`}
              >
                Inches
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1.5 text-xs uppercase tracking-wide transition-colors ${
                  unit === 'cm'
                    ? 'bg-foreground text-background'
                    : 'bg-background text-foreground hover:bg-secondary'
                }`}
              >
                CM
              </button>
            </div>
          </div>

          {/* Size table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#D4AF37]/30">
                  <th className="text-left py-3 px-3 font-medium text-foreground">Size</th>
                  <th className="text-left py-3 px-3 font-medium text-foreground">Bust</th>
                  <th className="text-left py-3 px-3 font-medium text-foreground">Waist</th>
                  <th className="text-left py-3 px-3 font-medium text-foreground">Hip</th>
                  <th className="text-left py-3 px-3 font-medium text-foreground">Shoulder</th>
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row, i) => (
                  <tr
                    key={row.size}
                    className={`border-b border-border/50 ${
                      i % 2 === 0 ? 'bg-card/30' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-medium">{row.size}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{convert(row.bust)}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{convert(row.waist)}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{convert(row.hip)}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{convert(row.shoulder)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Note */}
          <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
            Measurements may vary by ±0.5 inch
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
