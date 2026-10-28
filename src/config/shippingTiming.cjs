// Shared by Node-based tests/builds, Edge rendering and the browser.
const BASE_SHIPPING_TIMING_NOTICE =
  'Orders ship from India. Without alterations or finishing, estimated dispatch is within 3–4 business days. Standard shipping takes approximately 9–14 business days after dispatch (12–18 business days total). Express shipping, when separately quoted and confirmed before ordering, takes approximately 3–6 business days after dispatch. These are estimates, not guaranteed arrival dates; delivery varies by destination and carrier or customs delays.';

const ALTERATION_TIMING_NOTICE =
  'Requested alterations or finishing add 3 business days once, not per service. Allow approximately 6–7 business days before dispatch and 9–14 business days in transit (15–21 business days total), starting after complete measurements and service details are confirmed. These are estimates, not guaranteed arrival dates; contact LuxeMia before ordering for a fixed event date.';

const SHIPPING_TIMING_NOTICE = `${BASE_SHIPPING_TIMING_NOTICE} ${ALTERATION_TIMING_NOTICE}`;

const productShippingTimingNotice = (days) => Number.isFinite(days) && days > 0
  ? `Orders ship from India. Ships within ${days} business day${days === 1 ? '' : 's'} without alterations, as estimated for this listing. Standard transit is approximately 9–14 business days after dispatch. Requested alterations or finishing add 3 business days once after complete details are confirmed, not per service. Arrival dates are estimates, not guaranteed; confirm timing before ordering for an event.`
  : SHIPPING_TIMING_NOTICE;

const alterationShippingTimingNotice = (days) => Number.isFinite(days) && days > 0
  ? `Requested alterations or finishing add 3 business days once, not per service, to this listing's ${days}-business-day dispatch estimate. Allow approximately ${days + 3} business days before dispatch and 9–14 business days in transit (${days + 12}–${days + 17} business days total), starting after complete measurements and service details are confirmed. These are estimates, not guaranteed arrival dates; contact LuxeMia before ordering for a fixed event date.`
  : ALTERATION_TIMING_NOTICE;

module.exports = { alterationShippingTimingNotice, BASE_SHIPPING_TIMING_NOTICE, ALTERATION_TIMING_NOTICE, SHIPPING_TIMING_NOTICE, productShippingTimingNotice };
