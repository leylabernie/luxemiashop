import { Truck, Clock } from 'lucide-react';

interface DeliveryEstimateProps {
  hasStitching: boolean;
  extraTailoringDays?: number;
}

const addBusinessDays = (start: Date, days: number) => {
  const date = new Date(start);
  let remaining = days;

  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }

  return date;
};

const formatDeliveryDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);

export const DeliveryEstimate = ({ hasStitching, extraTailoringDays = 0 }: DeliveryEstimateProps) => {
  const today = new Date();
  const earliest = addBusinessDays(today, 6 + extraTailoringDays);
  const latest = addBusinessDays(today, 17 + extraTailoringDays);

  return (
    <div className="bg-card/50 border border-border/50 rounded-sm p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <Truck className="h-4 w-4 text-primary" />
        <span className="font-medium">Estimated U.S. Delivery</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <Truck className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">
              {formatDeliveryDate(earliest)}–{formatDeliveryDate(latest)}
            </p>
            <p className="text-foreground">
              Free U.S. shipping over $150. $12 flat below that. Tracking provided after dispatch.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Estimate includes 3–7 business days for preparation and 3–10 business days in transit.
            </p>
          </div>
        </div>

        {hasStitching && (
          <div className="flex items-start gap-2">
            <Clock className="h-3.5 w-3.5 mt-0.5 text-amber-600" />
            <p className="text-muted-foreground">
              Tailoring adds approximately {extraTailoringDays || 3} business days. Confirm timing with LuxeMia before ordering for a fixed event date.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
