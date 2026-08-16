// Short-lived campaign configuration. Public copy must match the active Shopify
// discount exactly; disable this flag before any code is removed or expires.
export const RAKSHA_BANDHAN_CAMPAIGN = {
  enabled: false,
  code: 'LUXE10',
  discountPercent: 10,
  minimumSubtotal: 150,
  startsAt: '2026-08-14T15:43:33Z',
  endsAt: '2026-08-17T15:43:33Z',
  displayEndDate: 'August 17 at 11:43 AM EDT',
} as const;

export const isRakshaBandhanCampaignActive = (now = Date.now()) => {
  const startsAt = Date.parse(RAKSHA_BANDHAN_CAMPAIGN.startsAt);
  const endsAt = Date.parse(RAKSHA_BANDHAN_CAMPAIGN.endsAt);

  return RAKSHA_BANDHAN_CAMPAIGN.enabled && now >= startsAt && now <= endsAt;
};
