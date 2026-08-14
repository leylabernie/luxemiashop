// Keep public campaign copy disabled until its code and eligibility are verified
// against an active Shopify discount. Never advertise an unredeemable code.
export const RAKSHA_BANDHAN_CAMPAIGN = {
  enabled: false,
  code: 'RAKHI15',
  discountPercent: 15,
  minimumSubtotal: 150,
  startsAt: '2026-08-07T16:20:00Z',
  endsAt: '2026-08-17T03:59:59Z',
  displayEndDate: 'August 16',
} as const;

export const isRakshaBandhanCampaignActive = (now = Date.now()) => {
  const startsAt = Date.parse(RAKSHA_BANDHAN_CAMPAIGN.startsAt);
  const endsAt = Date.parse(RAKSHA_BANDHAN_CAMPAIGN.endsAt);

  return RAKSHA_BANDHAN_CAMPAIGN.enabled && now >= startsAt && now <= endsAt;
};
