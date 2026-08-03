import { Truck, Clock } from 'lucide-react';

interface DeliveryEstimateProps {
  hasStitching: boolean;
}

export const DeliveryEstimate = ({ hasStitching }: DeliveryEstimateProps) => (
  <div className="bg-card/50 border border-border/50 rounded-sm p-4 space-y-3">
    <div className="flex items-center gap-2 text-sm">
      <Truck className="h-4 w-4 text-primary" />
      <span className="font-medium">U.S. Shipping</span>
    </div>

    <div className="space-y-2 text-sm">
      <div className="flex items-start gap-2">
        <Truck className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
        <div>
          <p className="text-foreground">
            Free U.S. shipping over $150. $12 flat below that.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Delivery timing depends on the item and selected options. Tracking is provided after dispatch.
          </p>
        </div>
      </div>

      {hasStitching && (
        <div className="flex items-start gap-2">
          <Clock className="h-3.5 w-3.5 mt-0.5 text-amber-600" />
          <p className="text-muted-foreground">
            Tailoring timing varies by the selected service and measurements. Confirm timing with LuxeMia before ordering for a fixed event date.
          </p>
        </div>
      )}
    </div>
  </div>
);
