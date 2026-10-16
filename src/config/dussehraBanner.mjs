// Creative only: the existing festive discount campaign keeps its own expiry.
// End of October 20, 2026 in America/New_York (EDT).
export const DUSSEHRA_BANNER_END = '2026-10-21T03:59:59.999Z';
export const isDussehraBannerActive = (now = Date.now()) => now <= Date.parse(DUSSEHRA_BANNER_END);
