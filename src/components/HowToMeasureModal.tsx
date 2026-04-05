import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HowToMeasureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const measurements = [
  {
    name: 'Bust',
    description:
      'Measure around the fullest part of your bust, keeping the tape parallel to the floor. The tape should be snug but not tight.',
  },
  {
    name: 'Waist',
    description:
      'Measure around your natural waistline, about 1 inch above the navel. Bend to the side to find your natural crease — that is your waist.',
  },
  {
    name: 'Hip',
    description:
      'Measure around the fullest part of your hips, usually about 7–9 inches below your waist. Keep the tape level all around.',
  },
  {
    name: 'Shoulder',
    description:
      'Measure from left shoulder point to right shoulder point across the back. The shoulder point is where the sleeve seam meets the shoulder.',
  },
];

export const HowToMeasureModal = ({ open, onOpenChange }: HowToMeasureModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">How to Measure</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <p className="text-sm text-muted-foreground">
            For the best fit, take your measurements while wearing light clothing. Use a soft
            measuring tape and keep it snug but not tight.
          </p>

          {measurements.map((m) => (
            <div key={m.name} className="space-y-1.5">
              <h4 className="text-sm font-medium uppercase tracking-wide text-foreground">
                {m.name}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
            </div>
          ))}

          <div className="bg-card/50 border border-border/50 rounded-sm p-4 mt-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Tip:</span> If you're between sizes,
              we recommend choosing the larger size. Minor alterations can always be made for a
              perfect fit.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
