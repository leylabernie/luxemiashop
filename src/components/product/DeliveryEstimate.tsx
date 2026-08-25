import { Truck, Clock } from 'lucide-react';

interface DeliveryEstimateProps {
  hasStitching: boolean;
  isMadeToOrder?: boolean;
}

export const DeliveryEstimate = ({ hasStitching, isMadeToOrder = false }: DeliveryEstimateProps) => (
  <div className="bg-card/50 border border-border/50 rounded-sm p-4 space-y-3">
    <div className="flex items-center gap-2 text-sm">
      <Truck className="h-4 w-4 text-primary" />
      <span className="font-medium">Shipping</span>
    </div>

    <div className="space-y-2 text-sm">
      <div className="flex items-start gap-2">
        <Truck className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
        <div>
          <p className="text-foreground">
            United States shipping only. Standard shipping is free at $150 and above and $12 below.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Delivery timing depends on the item and selected options. Tracking details are emailed when the shipping label is created for dispatch.
          </p>
        </div>
      </div>

      {isMadeToOrder && (
        <div className="flex items-start gap-2">
          <Clock className="h-3.5 w-3.5 mt-0.5 text-amber-600" />
          <p className="text-muted-foreground">
            Use approximately 4–5 weeks as a total planning window. LuxeMia confirms production time and carrier transit separately after your requested color, measurements, fabric availability, and delivery address are known.
          </p>
        </div>
      )}

      {hasStitching && !isMadeToOrder && (
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
