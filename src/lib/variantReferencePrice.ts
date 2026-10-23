interface Money {
  amount: string;
  currencyCode: string;
}

interface PricedVariant {
  price: Money;
  compareAtPrice?: Money | null;
}

/** A reference price belongs to one variant, never to the product-wide range. */
export function getVariantReferencePrice(
  variant?: PricedVariant | null,
  displayedPrice: Money | undefined = variant?.price,
): Money | null {
  const reference = variant?.compareAtPrice;
  if (!variant || !reference || !displayedPrice) return null;

  const price = Number(variant.price.amount);
  const displayed = Number(displayedPrice.amount);
  const compareAt = Number(reference.amount);
  // A displayed total containing optional services is not the garment offer.
  // Do not advertise a made-up bundle discount against its reference price.
  if (!Number.isFinite(price) || price <= 0 || displayed !== price
    || !Number.isFinite(compareAt) || compareAt <= price
    || displayedPrice.currencyCode !== variant.price.currencyCode
    || reference.currencyCode !== variant.price.currencyCode) return null;

  return reference;
}
