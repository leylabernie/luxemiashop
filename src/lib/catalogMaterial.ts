interface MaterialProduct {
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
  return '';
}
