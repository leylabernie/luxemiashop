const PRODUCT_SPEC_COLOR_KEYWORDS = [
  'sea green', 'hot pink', 'royal blue',
  'pink', 'red', 'blue', 'green', 'yellow', 'purple', 'violet', 'cream',
  'white', 'black', 'gold', 'silver', 'orange', 'maroon', 'teal', 'wine',
  'ivory', 'emerald', 'mustard', 'rust', 'peach', 'coral',
] as const;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Matches a catalog phrase only when it is bounded by non-alphanumeric
 * characters. This prevents short colors such as "red" from being inferred
 * from unrelated words such as "embroidered" or "inspired".
 */
export function containsStandaloneCatalogPhrase(text: string, phrase: string): boolean {
  const normalizedPhrase = phrase
    .trim()
    .split(/[\s\-\u2013\u2014]+/)
    .filter(Boolean)
    .map(escapeRegex)
    .join('[\\s\\-\\u2013\\u2014]+');

  if (!normalizedPhrase) return false;
  return new RegExp(`(?:^|[^a-z0-9])${normalizedPhrase}(?=$|[^a-z0-9])`, 'i').test(text);
}

export function inferProductSpecColors(tags: string[]): string[] {
  const found = new Set<string>();

  for (const tag of tags) {
    const matches = PRODUCT_SPEC_COLOR_KEYWORDS.filter((color) =>
      containsStandaloneCatalogPhrase(tag, color),
    );

    for (const color of matches) {
      const containedByCompoundMatch = matches.some((candidate) =>
        candidate !== color
        && candidate.length > color.length
        && containsStandaloneCatalogPhrase(candidate, color),
      );
      if (!containedByCompoundMatch) found.add(color);
    }
  }

  return PRODUCT_SPEC_COLOR_KEYWORDS.filter((color) => found.has(color));
}
