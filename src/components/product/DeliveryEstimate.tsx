import { Truck, Clock, PackageCheck } from 'lucide-react';
import { SHIPPING_ORIGIN_NOTICE, BASE_SHIPPING_TIMING_NOTICE, alterationShippingTimingNotice, productShippingTimingNotice } from '@/config/shippingPolicy';

interface DeliveryEstimateProps {
  hasStitching: boolean;
  shipsWithinDays?: number | null;
  isMadeToOrder?: boolean;
  isUnstitched?: boolean;
  hasStitchedBlouse?: boolean;
  confirmAvailability?: boolean;
  requiresTailoringTimingConfirmation?: boolean;
  hasSelectedAlterations?: boolean;
}

export const DeliveryEstimate = ({ shipsWithinDays, hasStitching, isMadeToOrder = false, isUnstitched = false, hasStitchedBlouse = false, confirmAvailability = false, requiresTailoringTimingConfirmation = false, hasSelectedAlterations = false }: DeliveryEstimateProps) => (
  <div className="space-y-3 rounded-sm border border-border/50 bg-card/50 p-4">
    <div className="flex items-center gap-2 text-sm">
      <Truck className="h-4 w-4 text-primary" />
      <span className="font-medium">Availability &amp; Shipping</span>
    </div>

    <div className="space-y-2 text-sm">
      <div className="flex items-start gap-2">
        {isMadeToOrder || requiresTailoringTimingConfirmation || hasSelectedAlterations ? (
          <Clock className="mt-0.5 h-3.5 w-3.5 text-amber-600" />
        ) : (
          <PackageCheck className="mt-0.5 h-3.5 w-3.5 text-green-700" />
        )}
        <div>
          <p className="font-medium text-foreground">
            {requiresTailoringTimingConfirmation || hasSelectedAlterations ? 'Alterations / finishing selected' : hasStitchedBlouse ? 'Stitched blouse included; saree needs draping' : isUnstitched ? 'Unstitched fabric set' : isMadeToOrder ? 'Fit request — confirmation required' : confirmAvailability ? 'Confirm availability' : shipsWithinDays ? `Estimated dispatch in ${shipsWithinDays} business days without alterations` : 'Available to order'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {requiresTailoringTimingConfirmation || hasSelectedAlterations
              ? alterationShippingTimingNotice(shipsWithinDays)
              : isMadeToOrder
              ? alterationShippingTimingNotice(shipsWithinDays)
              : isUnstitched
              ? `Supplied as the listed fabric-only / unstitched selection; it is not a finished garment. ${shipsWithinDays ? productShippingTimingNotice(shipsWithinDays) : BASE_SHIPPING_TIMING_NOTICE} Any separate local stitching before wearing is outside this shipping estimate.`
              : confirmAvailability
              ? `Confirm the selected size and availability before ordering. ${shipsWithinDays ? productShippingTimingNotice(shipsWithinDays) : BASE_SHIPPING_TIMING_NOTICE}`
              : shipsWithinDays
              ? `The listed dispatch estimate excludes requested alterations or finishing, which add 3 business days once after required details are confirmed. Standard transit is approximately 9–14 business days after dispatch; arrival dates are not guaranteed.`
              : BASE_SHIPPING_TIMING_NOTICE}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Truck className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
        <div>
          <p className="text-foreground">
            {SHIPPING_ORIGIN_NOTICE} Tracked shipping is available to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa and Mauritius.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            U.S. standard shipping is $14.99 below $150 and free at $150 and above. Other destinations use route-based rates shown on the Shipping page and at checkout. Tracking is emailed after dispatch.
          </p>
        </div>
      </div>

      {hasStitching && !isMadeToOrder && !isUnstitched && !confirmAvailability && !requiresTailoringTimingConfirmation && !hasSelectedAlterations && (
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-3.5 w-3.5 text-amber-600" />
          <p className="text-muted-foreground">
            Requested alterations or finishing add 3 business days once after complete measurements and service details are confirmed. Confirm any fabric-piece stitching service separately; the listed construction is unchanged.
          </p>
        </div>
      )}
    </div>
  </div>
);
