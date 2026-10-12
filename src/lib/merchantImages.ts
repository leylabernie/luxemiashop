import selections from '../data/merchantImageSelections.json';

const reviewed = selections as Record<string, { original: string; replacement: string }>;
const withoutQuery = (url: string) => url.split('?')[0];

/** Use a visually reviewed original only while both images still belong to this product. */
export function selectMerchantImage(handle: string, primary: string, available: string[]): string {
  const selection = reviewed[handle];
  if (!selection || withoutQuery(primary) !== selection.original) return primary;
  return available.find(url => withoutQuery(url) === selection.replacement) || primary;
}
