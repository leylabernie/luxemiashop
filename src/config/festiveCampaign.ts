// Festive Sale campaign — Utsav-style tiered sitewide offer.
// Single source of truth for the announcement bar, cart drawer nudge, PDP badge,
// and the auto-applied checkout code. Public copy must match the active Shopify
// discount codes exactly; disable this flag before any code is removed or expires.
// Codes LUXE10/LUXE15/LUXE20 are active in Shopify Admin (10% off $75+, 15% off
// $200+, 20% off $400+, through 2026-11-10). Changing values here without the
// matching Shopify discount advertises a dead offer at checkout.
export interface FestiveTier {
  code: string;
  percent: number;
  minSubtotal: number;
}

export const FESTIVE_CAMPAIGN = {
  enabled: true,
  endsAt: '2026-11-10T23:59:59Z',
  displayEndDate: 'November 10',
  tiers: [
    { code: 'LUXE20', percent: 20, minSubtotal: 400 },
    { code: 'LUXE15', percent: 15, minSubtotal: 200 },
    { code: 'LUXE10', percent: 10, minSubtotal: 75 },
  ] as readonly FestiveTier[],
} as const;

export const isFestiveCampaignActive = (now = Date.now()) => {
  return FESTIVE_CAMPAIGN.enabled && now <= Date.parse(FESTIVE_CAMPAIGN.endsAt);
};

// Best tier the subtotal currently qualifies for, or null below the $75 floor.
export const bestFestiveTier = (subtotal: number): FestiveTier | null => {
  return FESTIVE_CAMPAIGN.tiers.find((tier) => subtotal >= tier.minSubtotal) ?? null;
};

// Next tier above the subtotal, for cart upsell nudges.
export const nextFestiveTier = (subtotal: number): FestiveTier | null => {
  return (
    [...FESTIVE_CAMPAIGN.tiers]
      .sort((a, b) => a.minSubtotal - b.minSubtotal)
      .find((tier) => subtotal < tier.minSubtotal) ?? null
  );
};
