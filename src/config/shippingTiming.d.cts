export declare const STANDARD_DISPATCH_MIN_DAYS = 1;
export declare const STANDARD_DISPATCH_MAX_DAYS = 2;
export declare const DEFAULT_READY_DISPATCH_MIN_DAYS = 1;
export declare const DEFAULT_READY_DISPATCH_MAX_DAYS = 2;
export declare const STANDARD_TRANSIT_MIN_DAYS = 4;
export declare const STANDARD_TRANSIT_MAX_DAYS = 5;
export declare const READY_TO_SHIP_TOTAL_MIN_DAYS = 5;
export declare const READY_TO_SHIP_TOTAL_MAX_DAYS = 7;
export declare const CUSTOM_TAILORING_PREP_MIN_DAYS = 10;
export declare const CUSTOM_TAILORING_PREP_MAX_DAYS = 12;
export declare const CUSTOM_TAILORED_TOTAL_MIN_DAYS = 15;
export declare const CUSTOM_TAILORED_TOTAL_MAX_DAYS = 18;
export declare const ALTERATION_EXTRA_BUSINESS_DAYS = 10;

export declare const BASE_SHIPPING_TIMING_NOTICE: string;
export declare const SHIPPING_TIMING_NOTICE: string;
export declare const SHIPPING_PROCESSING_NOTICE: string;
export declare const ALTERATION_TIMING_NOTICE: string;

export declare function getDispatchBusinessDayRange(options?: {
  shipsWithinDays?: number | null;
  hasAlterations?: boolean;
}): { min: number; max: number };
export declare function getEstimatedTotalDeliveryBusinessDayRange(options?: {
  shipsWithinDays?: number | null;
  hasAlterations?: boolean;
}): { min: number; max: number };
export declare function formatBusinessDayRange(min: number, max: number): string;
export declare function addBusinessDays(startDate: Date, businessDays: number): Date;
export declare function formatCalendarBusinessDayRange(
  minBusinessDays: number,
  maxBusinessDays: number,
  fromDate?: Date,
): { startDate: Date; endDate: Date; startLabel: string; endLabel: string };
export declare function productShippingTimingNotice(shipsWithinDays?: number | null): string;
export declare function alterationShippingTimingNotice(shipsWithinDays?: number | null): string;
