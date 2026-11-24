'use strict';

const STANDARD_DISPATCH_MIN_DAYS = 1;
const STANDARD_DISPATCH_MAX_DAYS = 2;
const DEFAULT_READY_DISPATCH_MIN_DAYS = STANDARD_DISPATCH_MIN_DAYS;
const DEFAULT_READY_DISPATCH_MAX_DAYS = STANDARD_DISPATCH_MAX_DAYS;
const STANDARD_TRANSIT_MIN_DAYS = 4;
const STANDARD_TRANSIT_MAX_DAYS = 5;

const READY_TO_SHIP_TOTAL_MIN_DAYS = 5;
const READY_TO_SHIP_TOTAL_MAX_DAYS = 7;

const CUSTOM_TAILORING_PREP_MIN_DAYS = 10;
const CUSTOM_TAILORING_PREP_MAX_DAYS = 12;
const CUSTOM_TAILORED_TOTAL_MIN_DAYS = 15;
const CUSTOM_TAILORED_TOTAL_MAX_DAYS = 18;

const ALTERATION_EXTRA_BUSINESS_DAYS = 10;

const BASE_SHIPPING_TIMING_NOTICE =
  'Orders ship from India. Ready-to-Ship items complete our 3-Point Quality Assurance Check within 1–2 business days and deliver in 5–7 business days to the US, UK & Canada via DHL/FedEx. Delivery dates are estimates and are not guaranteed.';

const SHIPPING_TIMING_NOTICE =
  'Orders ship from India. Ready-to-Ship items complete our 3-Point Quality Assurance Check within 1–2 business days and deliver in 5–7 business days to the US, UK & Canada via DHL/FedEx. Custom Tailored outfits and alteration requests require 10–12 business days of workshop preparation and tailoring plus tracked courier transit (15–18 business days total after measurements are confirmed). Express options, when offered, are separately quoted and confirmed before ordering. Delivery dates are estimates and are not guaranteed.';

const SHIPPING_PROCESSING_NOTICE =
  'Each listing states the construction actually supplied — fully stitched, semi-stitched, or unstitched fabric, including unstitched lehenga, blouse or dupatta pieces. Ready-to-Ship pieces dispatch in 1–2 business days after our 3-Point Quality Assurance Check (5–7 business days total to US/UK/CA via DHL/FedEx); Custom Tailored pieces and requested alterations or finishing require 10–12 business days of workshop preparation and deliver in 15–18 business days total (counted once per outfit, not stacked per service, after complete measurements and service details are confirmed).';

const ALTERATION_TIMING_NOTICE =
  'Custom Tailored / alteration timeline: 15–18 business days total (10–12 business days of tailoring and 3-Point Quality Assurance Check, counted once per outfit not per service, plus tracked DHL/FedEx transit after complete measurements and service details are confirmed). Delivery dates are estimates and are not guaranteed.';

const normalizeExplicitDays = (shipsWithinDays) =>
  Number.isFinite(shipsWithinDays) && Number(shipsWithinDays) > 0 ? Number(shipsWithinDays) : null;

const getDispatchBusinessDayRange = ({ shipsWithinDays, hasAlterations = false } = {}) => {
  const explicit = normalizeExplicitDays(shipsWithinDays);
  if (hasAlterations) {
    if (!explicit) {
      return { min: CUSTOM_TAILORING_PREP_MIN_DAYS, max: CUSTOM_TAILORING_PREP_MAX_DAYS };
    }
    return {
      min: explicit + CUSTOM_TAILORING_PREP_MIN_DAYS,
      max: explicit + CUSTOM_TAILORING_PREP_MAX_DAYS,
    };
  }
  if (!explicit) {
    return { min: DEFAULT_READY_DISPATCH_MIN_DAYS, max: DEFAULT_READY_DISPATCH_MAX_DAYS };
  }
  return { min: explicit, max: explicit };
};

const getEstimatedTotalDeliveryBusinessDayRange = ({ shipsWithinDays, hasAlterations = false } = {}) => {
  const explicit = normalizeExplicitDays(shipsWithinDays);
  if (hasAlterations) {
    if (!explicit) {
      return {
        min: CUSTOM_TAILORED_TOTAL_MIN_DAYS,
        max: CUSTOM_TAILORED_TOTAL_MAX_DAYS,
      };
    }
    return {
      min: Math.max(CUSTOM_TAILORED_TOTAL_MIN_DAYS, explicit + CUSTOM_TAILORING_PREP_MIN_DAYS + STANDARD_TRANSIT_MIN_DAYS),
      max: Math.max(CUSTOM_TAILORED_TOTAL_MAX_DAYS, explicit + CUSTOM_TAILORING_PREP_MAX_DAYS + STANDARD_TRANSIT_MAX_DAYS),
    };
  }
  if (!explicit) {
    return {
      min: READY_TO_SHIP_TOTAL_MIN_DAYS,
      max: READY_TO_SHIP_TOTAL_MAX_DAYS,
    };
  }
  return {
    min: explicit + STANDARD_TRANSIT_MIN_DAYS,
    max: explicit + STANDARD_TRANSIT_MAX_DAYS,
  };
};

const formatBusinessDayRange = (min, max) =>
  min === max ? `${min} business days` : `${min}–${max} business days`;

const addBusinessDays = (startDate, businessDays) => {
  const date = new Date(startDate.getTime());
  let remaining = Math.max(0, Math.round(businessDays));
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }
  return date;
};

const formatCalendarBusinessDayRange = (minBusinessDays, maxBusinessDays, fromDate = new Date()) => {
  const start = addBusinessDays(fromDate, minBusinessDays);
  const end = addBusinessDays(fromDate, maxBusinessDays);
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
  return {
    startDate: start,
    endDate: end,
    startLabel: fmt.format(start),
    endLabel: fmt.format(end),
  };
};

const productShippingTimingNotice = (shipsWithinDays) => {
  const explicit = normalizeExplicitDays(shipsWithinDays);
  if (!explicit) return BASE_SHIPPING_TIMING_NOTICE;
  const totalMin = explicit + STANDARD_TRANSIT_MIN_DAYS;
  const totalMax = explicit + STANDARD_TRANSIT_MAX_DAYS;
  return (
    'Orders ship from India. Ships within ' +
    explicit +
    ' business days without alterations; tracked DHL/FedEx transit is approximately ' +
    STANDARD_TRANSIT_MIN_DAYS +
    '–' +
    STANDARD_TRANSIT_MAX_DAYS +
    ' business days after dispatch (' +
    totalMin +
    '–' +
    totalMax +
    ' business days total). Custom Tailored or alteration selections take 15–18 business days total after required details are confirmed. Delivery dates are estimates and are not guaranteed.'
  );
};

const alterationShippingTimingNotice = (shipsWithinDays) => {
  const explicit = normalizeExplicitDays(shipsWithinDays);
  if (!explicit) return ALTERATION_TIMING_NOTICE;
  const range = getEstimatedTotalDeliveryBusinessDayRange({
    shipsWithinDays: explicit,
    hasAlterations: true,
  });
  const prepDays = explicit + CUSTOM_TAILORING_PREP_MIN_DAYS;
  return (
    'Orders ship from India. With requested alterations or finishing, allow ' +
    prepDays +
    '–' +
    (explicit + CUSTOM_TAILORING_PREP_MAX_DAYS) +
    ' business days before dispatch (counted once per outfit, not per service) plus tracked DHL/FedEx transit (' +
    range.min +
    '–' +
    range.max +
    ' business days total after complete measurements and service details are confirmed). Delivery dates are estimates and are not guaranteed.'
  );
};

module.exports = {
  STANDARD_DISPATCH_MIN_DAYS,
  STANDARD_DISPATCH_MAX_DAYS,
  DEFAULT_READY_DISPATCH_MIN_DAYS,
  DEFAULT_READY_DISPATCH_MAX_DAYS,
  STANDARD_TRANSIT_MIN_DAYS,
  STANDARD_TRANSIT_MAX_DAYS,
  READY_TO_SHIP_TOTAL_MIN_DAYS,
  READY_TO_SHIP_TOTAL_MAX_DAYS,
  CUSTOM_TAILORING_PREP_MIN_DAYS,
  CUSTOM_TAILORING_PREP_MAX_DAYS,
  CUSTOM_TAILORED_TOTAL_MIN_DAYS,
  CUSTOM_TAILORED_TOTAL_MAX_DAYS,
  ALTERATION_EXTRA_BUSINESS_DAYS,
  BASE_SHIPPING_TIMING_NOTICE,
  SHIPPING_TIMING_NOTICE,
  SHIPPING_PROCESSING_NOTICE,
  ALTERATION_TIMING_NOTICE,
  getDispatchBusinessDayRange,
  getEstimatedTotalDeliveryBusinessDayRange,
  formatBusinessDayRange,
  addBusinessDays,
  formatCalendarBusinessDayRange,
  productShippingTimingNotice,
  alterationShippingTimingNotice,
};
