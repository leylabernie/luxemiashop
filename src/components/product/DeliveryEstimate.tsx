import { useMemo } from 'react';
import { Truck, Zap, Clock } from 'lucide-react';

interface DeliveryEstimateProps {
  hasStitching: boolean;
  extraTailoringDays?: number;
}

/** Skip weekends and return the date that is `businessDays` working days from `start`. */
const addBusinessDays = (start: Date, businessDays: number): Date => {
  const result = new Date(start);
  let added = 0;
  while (added < businessDays) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
};

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

const EST_CUTOFF_HOUR = 18; // 6 PM EST

export const DeliveryEstimate = ({ hasStitching, extraTailoringDays = 0 }: DeliveryEstimateProps) => {
  const { standardDate, expressDate, urgencyHours } = useMemo(() => {
    const now = new Date();

    // Standard: 7 business days (+3 if stitching + extra tailoring days)
    const standardBizDays = hasStitching ? 10 + extraTailoringDays : 7;
    // Express: 3 business days (+3 if stitching + extra tailoring days)
    const expressBizDays = hasStitching ? 6 + extraTailoringDays : 3;

    const std = addBusinessDays(now, standardBizDays);
    const exp = addBusinessDays(now, expressBizDays);

    // Urgency: hours until 6 PM EST today
    // Create a Date for today at 18:00 EST (UTC-5)
    const estOffset = -5;
    const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
    const estNow = new Date(utcNow + estOffset * 3600000);
    const cutoffToday = new Date(estNow);
    cutoffToday.setHours(EST_CUTOFF_HOUR, 0, 0, 0);
    const diffMs = cutoffToday.getTime() - estNow.getTime();
    const hoursLeft = diffMs > 0 ? Math.floor(diffMs / 3600000) : 0;

    return { standardDate: std, expressDate: exp, urgencyHours: hoursLeft };
  }, [hasStitching]);

  return (
    <div className="bg-card/50 border border-border/50 rounded-sm p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <Truck className="h-4 w-4 text-primary" />
        <span className="font-medium">Estimated Delivery</span>
      </div>

      <div className="space-y-2 text-sm">
        {/* Standard */}
        <div className="flex items-start gap-2">
          <Truck className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">
              Standard
            </p>
            <p className="text-foreground">
              Order today, estimated delivery by{' '}
              <span className="font-medium">{formatDate(standardDate)}</span>
            </p>
          </div>
        </div>

        {/* Express */}
        <div className="flex items-start gap-2">
          <Zap className="h-3.5 w-3.5 mt-0.5 text-amber-500" />
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">
              Express
            </p>
            <p className="text-foreground">
              Order today, estimated delivery by{' '}
              <span className="font-medium">{formatDate(expressDate)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Urgency */}
      {urgencyHours > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded px-2.5 py-1.5">
          <Clock className="h-3 w-3" />
          <span>
            Order within <span className="font-semibold">{urgencyHours} hour{urgencyHours !== 1 ? 's' : ''}</span> for
            earliest delivery
          </span>
        </div>
      )}
    </div>
  );
};
