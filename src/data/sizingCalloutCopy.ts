import { ALTERATION_CREDIT_SUMMARY } from '../lib/returnPolicyCopy.js';

/**
 * Single source for the shopping callouts shown on the sizing guide pages
 * (/blog/indian-to-us-clothing-size-conversion-guide and /sizing-measurements-guide).
 * Every claim is taken from the existing shipping / returns policy copy:
 * Ready-to-Ship timing is an estimate, the alteration credit and seam allowance
 * apply only to eligible custom-stitched blouses, cholis and suit tops, and the
 * 48-hour window is the damage / defect reporting window.
 */
export const SIZING_CALLOUT_TOP = {
  text: 'Found your measurements? Shop authentic Ready-to-Ship sarees, lehengas and suits. Orders ship from India via tracked DHL/FedEx and typically arrive in 5–7 business days to the U.S. (an estimate, not a guaranteed date). U.S. standard shipping is free at $150+.',
  label: 'Shop Ready-to-Ship Collection',
  href: '/ready-to-ship',
} as const;

export const SIZING_CALLOUT_FIT = {
  heading: 'Worried about fit?',
  text: `${ALTERATION_CREDIT_SUMMARY} Check each listing for the exact stitching status and size options.`,
  label: 'Browse Wedding Guest Outfits',
  href: '/collections/wedding-guest-outfits',
} as const;

export const SIZING_CALLOUT_END = {
  heading: 'Planning for a wedding or festival?',
  text: 'Explore our collections of sarees, lehengas and sharara suits. For U.S. deliveries, no tariffs or import fees are collected at your doorstep; applicable sales tax is calculated at checkout.',
  label: 'Explore All Collections',
  href: '/collections',
} as const;

const ASIDE_CLASS = 'my-8 rounded-xl border border-primary/20 bg-primary/5 p-5';

type Callout = { heading?: string; text: string; label: string; href: string };

const htmlCallout = (callout: Callout, ariaLabel: string) =>
  `<aside class="${ASIDE_CLASS}" aria-label="${ariaLabel}"><p>${
    callout.heading ? `<strong>${callout.heading}</strong> ` : ''
  }${callout.text}</p><p><a href="${callout.href}">${callout.label} →</a></p></aside>`;

/** Static HTML versions for blog article bodies (sanitized by the blog renderer). */
export const sizingFitCalloutHtml = htmlCallout(SIZING_CALLOUT_FIT, 'Fit support');
export const sizingEndCalloutHtml = htmlCallout(SIZING_CALLOUT_END, 'Shop LuxeMia collections');
