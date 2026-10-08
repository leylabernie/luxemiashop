import { Truck, Clock, PackageCheck } from 'lucide-react';

interface DeliveryEstimateProps {
  hasStitching: boolean;
  shipsWithinDays?: number | null;
  isMadeToOrder?: boolean;
  isUnstitched?: boolean;
  hasStitchedBlouse?: boolean;
  confirmAvailability?: boolean;
}

export const DeliveryEstimate = ({ shipsWithinDays, hasStitching, isMadeToOrder = false, isUnstitched = false, hasStitchedBlouse = false, confirmAvailability = false }: DeliveryEstimateProps) => (
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
            {hasStitchedBlouse ? 'Stitched blouse included; saree needs draping' : isUnstitched ? 'Unstitched fabric set' : isMadeToOrder ? 'Made to Order' : confirmAvailability ? 'Confirm availability' : shipsWithinDays ? `Estimated dispatch in ${shipsWithinDays} business days` : 'Dispatch timing: confirm before ordering'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {confirmAvailability
              ? 'Confirm the selected size, current availability, processing and carrier transit with LuxeMia before ordering for an event date.'
              : isUnstitched
              ? 'Supplied unstitched; tailoring is required before wearing. Confirm current availability, processing and carrier transit with LuxeMia before ordering for an event date.'
              : isMadeToOrder
              ? 'Use approximately 4–5 weeks as the total planning window. Production time and carrier transit are confirmed separately after the requested color, measurements, available design options and delivery address are known.'
              : 'Dispatch is when your order leaves the supplier. Carrier transit starts afterward. Confirm the selected size and timing before ordering for an event date.'}
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
            U.S. standard shipping is $14.99 below $150 and free at $150 and above. Other destinations use route-based rates shown on the Shipping page and at checkout. Tracking is emailed after dispatch.
          </p>
        </div>
      </div>

      {hasStitching && !isMadeToOrder && !isUnstitched && !confirmAvailability && (
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
