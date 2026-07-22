const DEFAULT_BRAND = 'LuxeMia';
const TITLE_MAX_LENGTH = 58;
const DESCRIPTION_MAX_LENGTH = 155;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function truncateAtWord(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;

  const available = Math.max(1, maxLength - 1);
  const candidate = value.slice(0, available + 1);
  const lastSpace = candidate.lastIndexOf(' ');
  const truncated = (lastSpace > 0
    ? candidate.slice(0, lastSpace)
    : value.slice(0, available))
    .replace(/\s+(?:&|and|or|of|for|the|with|in|on|at|to)$/i, '')
    .replace(/[|,:;\-/]+$/, '');

  return `${truncated.trimEnd()}…`;
}

/**
 * Keep document and social titles within a predictable search-result length.
 * The brand is normalized to a suffix so high-intent keywords stay first.
 */
export function clampTitle(
  raw: string,
  brand = DEFAULT_BRAND,
  maxLength = TITLE_MAX_LENGTH,
): string {
  const cleaned = normalizeWhitespace(raw);
  const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const brandAtStart = new RegExp(`^${escapedBrand}\\s*(?:[|—–:\\-]\\s*)?`, 'i');
  const brandAtEnd = new RegExp(`\\s*(?:[|—–:\\-]\\s*)?${escapedBrand}$`, 'i');
  const withoutBrand = cleaned
    .replace(brandAtStart, '')
    .replace(brandAtEnd, '')
    .trim();

  if (!withoutBrand) return brand.slice(0, maxLength);

  const suffix = ` | ${brand}`;
  const title = `${withoutBrand}${suffix}`;
  if (title.length <= maxLength) return title;

  const coreMaxLength = Math.max(1, maxLength - suffix.length);
  return `${truncateAtWord(withoutBrand, coreMaxLength)}${suffix}`;
}

/** Clamp a meta description on a word boundary without altering its meaning. */
export function clampDescription(
  raw: string,
  maxLength = DESCRIPTION_MAX_LENGTH,
): string {
  return truncateAtWord(normalizeWhitespace(raw), maxLength);
}
