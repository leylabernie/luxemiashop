'use strict';

function getHtmlAttribute(tag, attribute) {
  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tag.match(new RegExp(`\\b${escapedAttribute}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match?.[2] ?? null;
}

function parseJsonLdScripts(html, route, failures) {
  const parsed = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attributes = match[1];
    if (getHtmlAttribute(attributes, 'type')?.toLowerCase() !== 'application/ld+json') continue;
    try {
      parsed.push({ attributes, schema: JSON.parse(match[2]) });
    } catch (error) {
      failures.push(`${route}: invalid JSON-LD (${error.message})`);
    }
  }
  return parsed;
}

function getItemListHandles(itemList) {
  return (itemList.itemListElement || [])
    .map((entry) => (entry?.url || entry?.item?.url)?.match(/\/product\/([^/?#]+)$/)?.[1])
    .filter(Boolean);
}

function validateItemListParity(itemList, payloadHandles, limit = 30) {
  const expectedHandles = payloadHandles.slice(0, limit);
  const itemListElements = Array.isArray(itemList.itemListElement) ? itemList.itemListElement : [];
  const itemListHandles = getItemListHandles(itemList);
  const elementsAreExact = itemListElements.every((entry, index) => (
    entry?.['@type'] === 'ListItem'
    && entry.position === index + 1
    && (entry.url || entry.item?.url) === `https://luxemia.shop/product/${expectedHandles[index]}`
  ));
  if (
    JSON.stringify(itemListHandles) !== JSON.stringify(expectedHandles)
    || itemList.numberOfItems !== expectedHandles.length
    || itemListElements.length !== expectedHandles.length
    || !elementsAreExact
  ) {
    return 'ItemList products do not match the hydration payload';
  }
  return null;
}

module.exports = {
  getHtmlAttribute,
  parseJsonLdScripts,
  validateItemListParity,
};
