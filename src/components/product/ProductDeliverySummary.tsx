import type { ReactNode } from 'react';
import {
  US_STANDARD_SHIPPING_RATE,
  US_FREE_SHIPPING_THRESHOLD,
  getEstimatedTotalDeliveryBusinessDayRange,
} from '@/config/shippingPolicy';

interface ProductDeliverySummaryProps {
  shipsWithinDays?: number | null;
  hasAlterations: boolean;
  confirmAvailability?: boolean;
  isUnstitched?: boolean;
  children: ReactNode;
}

/** Keep decision-critical facts visible; the full existing policy stays one click away. */
export const ProductDeliverySummary = ({
  shipsWithinDays,
  hasAlterations,
  confirmAvailability,
  isUnstitched,
  children,
}: ProductDeliverySummaryProps) => {
  const totalRange = getEstimatedTotalDeliveryBusinessDayRange({
    shipsWithinDays,
    hasAlterations,
  });

  return (
    <section
      className="space-y-2 rounded-sm border border-border/50 bg-card/50 p-4 text-xs"
      aria-label="Delivery summary"
    >
      <p className="font-medium text-foreground" role="status">
        Estimated delivery: {totalRange.min}–{totalRange.max} business days
        {hasAlterations
          ? ' (Custom Tailored / alterations via DHL/FedEx after complete measurements and service details are confirmed)'
          : ' (Ready-to-Ship to US/UK/CA via DHL/FedEx without alterations or finishing)'}
        . Dates are not guaranteed.
      </p>
      {hasAlterations && (
        <p>
          Tailoring / alteration allowance is counted once per outfit, not stacked per service.
        </p>
      )}
      {confirmAvailability && (
        <p className="font-medium">
          Confirm the selected size and availability before ordering.
        </p>
      )}
      {isUnstitched && (
        <p className="font-medium">
          Listed fabric-only / unstitched pieces are not finished garments. Separate local stitching is outside this estimate.
        </p>
      )}
      <p className="text-muted-foreground">
        Ships from India. U.S. shipping: ${US_STANDARD_SHIPPING_RATE.toFixed(2)} below ${US_FREE_SHIPPING_THRESHOLD}; free at ${US_FREE_SHIPPING_THRESHOLD}+. No U.S. doorstep import fees; sales tax at checkout. Other-country shipping rates and import charges vary; see details.
      </p>
      <details className="group">
        <summary className="cursor-pointer font-medium text-link hover:text-link/80 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          Full delivery, shipping &amp; import details
        </summary>
        <div className="mt-3 space-y-3">{children}</div>
      </details>
    </section>
  );
};
