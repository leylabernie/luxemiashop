/**
 * Format a Shopify monetary value in the currency returned by the Storefront API.
 * Invalid legacy values fail closed to a currency-labelled string instead of
 * silently presenting the amount as USD.
 */
export function formatCurrencyAmount(
  amount: string | number,
  currencyCode?: string | null,
): string {
  const numericAmount = typeof amount === 'number' ? amount : Number.parseFloat(amount);
  const normalizedCurrency = currencyCode?.trim().toUpperCase();

  if (!Number.isFinite(numericAmount)) {
    return normalizedCurrency ? `${normalizedCurrency} --` : 'Price unavailable';
  }

  if (!normalizedCurrency) {
    return `${numericAmount.toFixed(2)} (currency unavailable)`;
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizedCurrency,
    }).format(numericAmount);
  } catch {
    return `${normalizedCurrency} ${numericAmount.toFixed(2)}`;
  }
}
