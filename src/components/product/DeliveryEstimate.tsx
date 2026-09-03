import { Truck, Clock, PackageCheck } from 'lucide-react';

interface DeliveryEstimateProps {
  hasStitching: boolean;
  isMadeToOrder?: boolean;
  isReadyToShip?: boolean;
  /** Current product-specific processing evidence supplied by Shopify. */
  processingEstimateLabel?: string | null;
}

export const DeliveryEstimate = ({
  hasStitching,
  isMadeToOrder = false,
  isReadyToShip = false,
  processingEstimateLabel = null,
}: DeliveryEstimateProps) => (
  <div className="space-y-3 rounded-sm border border-border/50 bg-card/50 p-4">
    <div className="flex items-center gap-2 text-sm">
      <Truck className="h-4 w-4 text-primary" />
      <span className="font-medium">Availability &amp; Shipping</span>
    </div>

    <div className="space-y-2 text-sm">
      <div className="flex items-start gap-2">
        {isMadeToOrder ? (
          <Clock className="mt-0.5 h-3.5 w-3.5 text-amber-600" />
        ) : isReadyToShip ? (
          <PackageCheck className="mt-0.5 h-3.5 w-3.5 text-green-700" />
        ) : (
          <Clock className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
        )}
        <div>
          <p className="font-medium text-foreground">
            {isMadeToOrder ? 'Production required' : isReadyToShip ? 'Ready to Ship' : 'Order processing'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isMadeToOrder
              ? processingEstimateLabel
                ? `${processingEstimateLabel} Confirm the production plan in writing before ordering for a fixed event date.`
                : 'Production and dispatch timing are product-specific. Confirm timing before ordering for a fixed event date; carrier transit begins only after dispatch.'
              : isReadyToShip
                ? 'The catalog positively identifies this item as Ready to Ship. Any listing processing estimate is separate from carrier transit and delivery timing; Ready to Ship does not mean same-day delivery.'
                : 'Processing and dispatch timing depend on this item and its selected options. Confirm timing before ordering for a fixed event date.'}
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
            U.S. standard shipping is $14.99 below $199 and free at $199 and above. Other destinations use route-based rates shown on the Shipping page and at checkout. When tracking is issued, carrier scans can appear after label creation.
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
