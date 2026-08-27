import { Truck, Clock, PackageCheck } from 'lucide-react';

interface DeliveryEstimateProps {
  hasStitching: boolean;
  isMadeToOrder?: boolean;
}

export const DeliveryEstimate = ({ hasStitching, isMadeToOrder = false }: DeliveryEstimateProps) => (
  <div className="space-y-3 rounded-sm border border-border/50 bg-card/50 p-4">
    <div className="flex items-center gap-2 text-sm">
      <Truck className="h-4 w-4 text-primary" />
      <span className="font-medium">Availability &amp; Shipping</span>
    </div>

    <div className="space-y-2 text-sm">
      <div className="flex items-start gap-2">
        {isMadeToOrder ? (
          <Clock className="mt-0.5 h-3.5 w-3.5 text-amber-600" />
        ) : (
          <PackageCheck className="mt-0.5 h-3.5 w-3.5 text-green-700" />
        )}
        <div>
          <p className="font-medium text-foreground">
            {isMadeToOrder ? 'Made to Order' : 'Ready to Ship'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isMadeToOrder
              ? 'Use approximately 4–5 weeks as the total planning window. Production time and carrier transit are confirmed separately after the requested color, measurements, available design options and delivery address are known.'
              : 'The base item is stocked for normal order handling and dispatch. Carrier transit begins after dispatch; Ready to Ship does not mean same-day delivery.'}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Truck className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
        <div>
          <p className="text-foreground">
            Tracked shipping is available to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa and Mauritius.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            U.S. standard shipping is $14.99 below $199 and free at $199 and above. Other destinations use route-based rates shown on the Shipping page and at checkout. Tracking is emailed after dispatch.
          </p>
        </div>
      </div>

      {hasStitching && !isMadeToOrder && (
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-3.5 w-3.5 text-amber-600" />
          <p className="text-muted-foreground">
            Optional stitching, finishing or alterations add processing time to the ready-stock base item. Confirm timing with LuxeMia before ordering for a fixed event date.
          </p>
        </div>
      )}
    </div>
  </div>
);
