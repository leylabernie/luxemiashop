interface MaterialProduct {
  title?: string;
  tags?: string[];
  materialMetafield?: { value: string | null } | null;
  fabricMetafield?: { value: string | null } | null;
  metadata?: { material?: string | null; fabric?: string | null };
  options?: { name: string; values: string[] }[];
}

/** Use catalog facts only; a missing fabric must never become a guessed blend. */
export function getCatalogMaterial(
  product: MaterialProduct,
  selectedOptions: { name: string; value: string }[] = [],
): string {
  const isMaterial = (name: string) => /^(?:material|fabric)$/i.test(name.trim());
  const selected = selectedOptions.find(option => isMaterial(option.name))?.value?.trim();
  if (selected) return selected;
  const option = product.options?.find(option => isMaterial(option.name));
  if (option?.values.length === 1 && option.values[0]?.trim()) return option.values[0].trim();

  const structured = product.materialMetafield?.value?.trim()
    || product.fabricMetafield?.value?.trim()
    || product.metadata?.material?.trim()
    || product.metadata?.fabric?.trim();
  if (structured) return structured;
  for (const prefix of ['material', 'fabric']) {
    const value = product.tags?.map(tag => tag.match(new RegExp(`^${prefix}\\s*:\\s*(.+)$`, 'i'))?.[1]?.trim()).find(Boolean);
    if (value) return value;
  }
  // Only explicit textile names in the main garment title; never infer fiber
  // composition from a weave/style or use a supplementary blouse's fabric.
  const title = (product.title || '').split(/\bwith\b/i)[0];
  const fabrics = [
    'Georgette Silk', 'Chinon Silk', 'Chinnon Silk', 'Viscose Silk',
    'Cotton Silk', 'Art Silk', 'Faux Georgette', 'Tissue Silk',
    'Vichitra Silk', 'Rangoli Silk', 'Dola Silk', 'Fendi Silk',
    'Malai Satin', 'Chinon', 'Chinnon', 'Georgette', 'Organza',
    'Chiffon', 'Velvet', 'Crepe', 'Satin', 'Viscose', 'Cotton',
    'Rayon', 'Linen', 'Silk', 'Net',
  ];
  const matches = fabrics.flatMap(label => {
    const expression = new RegExp(`\\b${label.replace(/ /g, '\\s+')}\\b(?![-\\s]*(?:inspired|look|like))`, 'i');
    const match = expression.exec(title);
    return match ? [{ label, start: match.index, end: match.index + match[0].length }] : [];
  });
  const explicit = matches.filter(match => !matches.some(other =>
    other !== match && other.start <= match.start && other.end >= match.end
      && other.end - other.start > match.end - match.start,
  )).sort((a, b) => a.start - b.start);
  return [...new Set(explicit.map(match => match.label))].join(' / ');
}
