import { Truck, Clock } from 'lucide-react';

interface DeliveryEstimateProps {
  hasStitching: boolean;
  extraTailoringDays?: number;
}

export const DeliveryEstimate = ({ hasStitching }: DeliveryEstimateProps) => {
  return (
    <div className="bg-card/50 border border-border/50 rounded-sm p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <Truck className="h-4 w-4 text-primary" />
        <span className="font-medium">Shipping Promise</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <Truck className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">
              U.S. Shipping
            </p>
            <p className="text-foreground">
              Free U.S. shipping over $150. $12 flat below that. Tracking provided after dispatch.
            </p>
          </div>
        </div>

        {hasStitching && (
          <div className="flex items-start gap-2">
            <Clock className="h-3.5 w-3.5 mt-0.5 text-amber-600" />
            <p className="text-muted-foreground">
              Custom work is not part of the two-business-day online promise. Confirm timing with LuxeMia before ordering.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
