/**
 * One evidence policy for Shopify's `custom.included_components` list.
 *
 * The Storefront API returns list metafields as JSON strings. Keep parsing
 * strict, remove empty/placeholder values, deduplicate without case drift, and
 * cap both individual labels and the final customer-facing representation so
 * server HTML, initial hydration, and live refreshes cannot disagree.
 */

const INVALID_COMPONENT = /^(?:n\/?a|none|unknown|fabric|material|work)$/i;
const NEGATED_COMPONENT = /\b(?:no\s+(?:saree|sari|lehenga|skirt|choli|blouse|kurta|kameez|tunic|top|shirt|pajama|pyjama|pants?|palazzo|sharara|gharara|salwar|bottom|trousers?|dupatta|sherwani|stole|jacket|vest|belt|scarf|cape)\b|not\s+included|not\s+supplied|not\s+part\s+of|does\s+not\s+include|do\s+not\s+include|doesn['’]?t\s+include|don['’]?t\s+include|(?:is|are)(?:\s+not|n['’]?t)\s+included|sold\s+separately|exclud(?:e|es|ed|ing)|without)\b/i;
const ITEM_MAX_LENGTH = 80;
const TOTAL_MAX_LENGTH = 120;

function cleanComponent(value: string, maxLength: number): string | undefined {
  const cleaned = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:premium|beautiful|elegant)\s+/i, '')
    .trim();

  if (
    !cleaned
    || cleaned.length > maxLength
    || INVALID_COMPONENT.test(cleaned)
    || NEGATED_COMPONENT.test(cleaned)
  ) {
    return undefined;
  }
  return cleaned;
}

export function normalizeIncludedPiecesText(value?: string | null): string | undefined {
  return value ? cleanComponent(value, TOTAL_MAX_LENGTH) : undefined;
}

function normalizeComponentArray(value: unknown, itemMaxLength: number): string[] | null {
  if (!Array.isArray(value)) return null;

  const seen = new Set<string>();
  const components: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') return null;
    const component = typeof item === 'string'
      ? cleanComponent(item, itemMaxLength)
      : undefined;
    if (!component) return null;
    const key = component?.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    components.push(component);
  }

  if (components.length === 0 || components.join(', ').length > TOTAL_MAX_LENGTH) {
    return null;
  }
  return components;
}

/** Normalize already accepted metadata or a server-built final representation. */
export function normalizeIncludedComponents(value: unknown): string[] | null {
  return normalizeComponentArray(value, TOTAL_MAX_LENGTH);
}

export function parseIncludedComponentsMetafield(value?: string | null): string[] | null {
  if (!value) return null;
  try {
    return normalizeComponentArray(JSON.parse(value) as unknown, ITEM_MAX_LENGTH);
  } catch {
    return null;
  }
}
