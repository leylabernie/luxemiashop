import { Truck } from 'lucide-react';
import { addUsBusinessDays } from '../../lib/shipBy';
import {
  US_FREE_SHIPPING_THRESHOLD,
  formatBusinessDayRange,
  getEstimatedTotalDeliveryBusinessDayRange,
} from '../../config/shippingPolicy';

export interface EstimatedDeliveryBadgeProps {
  shipsWithinDays?: number | null;
  isCustomTailored?: boolean;
  confirmAvailability?: boolean;
  isUnstitched?: boolean;
  referenceDate?: Date;
  className?: string;
}

function formatShortMonthDay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York',
  });
}

export function buildEstimatedDeliveryBadgeModel({
  shipsWithinDays,
  isCustomTailored = false,
  confirmAvailability = false,
  isUnstitched = false,
  referenceDate = new Date(),
}: Omit<EstimatedDeliveryBadgeProps, 'className'>) {
  const range = getEstimatedTotalDeliveryBusinessDayRange({
    shipsWithinDays,
    hasAlterations: isCustomTailored,
  });
  const minDate = addUsBusinessDays(referenceDate, range.min);
  const maxDate = addUsBusinessDays(referenceDate, range.max);
  const minDateLabel = formatShortMonthDay(minDate);
  const maxDateLabel = formatShortMonthDay(maxDate);
  const dateRangeLabel = minDateLabel === maxDateLabel
    ? minDateLabel
    : `${minDateLabel} – ${maxDateLabel}`;
  const businessDayWindowLabel = formatBusinessDayRange(range.min, range.max);

  const headline = confirmAvailability
    ? `Estimated delivery to US by ${dateRangeLabel} once availability is confirmed`
    : isCustomTailored
      ? `Order today for custom-tailored delivery to US by ${dateRangeLabel}`
      : `Order today for delivery to US by ${dateRangeLabel}`;

  const subline = isCustomTailored
    ? `Custom Tailored (${businessDayWindowLabel} total via DHL/FedEx) • Free US shipping $${US_FREE_SHIPPING_THRESHOLD}+`
    : `Ready-to-Ship (${businessDayWindowLabel} to US/UK/CA via DHL/FedEx) • Free US shipping $${US_FREE_SHIPPING_THRESHOLD}+${isUnstitched ? ' • Supplied unstitched' : ''}`;

  return {
    minDays: range.min,
    maxDays: range.max,
    minDateLabel,
    maxDateLabel,
    dateRangeLabel,
    businessDayWindowLabel,
    headline,
    subline,
  };
}

export const EstimatedDeliveryBadge = ({
  shipsWithinDays,
  isCustomTailored = false,
  confirmAvailability = false,
  isUnstitched = false,
  referenceDate,
  className = '',
}: EstimatedDeliveryBadgeProps) => {
  const model = buildEstimatedDeliveryBadgeModel({
    shipsWithinDays,
    isCustomTailored,
    confirmAvailability,
    isUnstitched,
    referenceDate,
  });

  return (
    <div
      data-testid="estimated-delivery-badge"
      className={`rounded-sm border border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-800/50 dark:bg-emerald-950/30 px-3.5 py-2.5 text-left ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <Truck
          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400"
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-0.5">
          <p className="text-xs sm:text-sm font-medium text-emerald-950 dark:text-emerald-100 leading-snug">
            {model.headline}
          </p>
          <p className="text-[11px] sm:text-xs text-emerald-800/90 dark:text-emerald-300/90 leading-snug">
            {model.subline}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EstimatedDeliveryBadge;
