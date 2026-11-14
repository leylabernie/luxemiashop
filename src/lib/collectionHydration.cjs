const { serializeJsonLd } = require('./serializeJsonLd.cjs');

// Self-contained: this exact function is embedded after the collection payload.
// Restore before deferred application modules run; hooks keep their original shape.
function restoreCollectionImages(payload) {
  if (!payload || payload.__variantImageEncoding !== 1) return payload;
  const images = payload.__variantImages;
  if (!Array.isArray(images) || !Array.isArray(payload.products)) return null;
  const variants = payload.products.flatMap(product => product.node?.variants?.edges || []);
  // Validate every reference before modifying anything. Invalid transport falls
  // back to the hooks' existing live-fetch path, never a partial variant record.
  if (variants.some(edge => typeof edge.node?.image === 'number' &&
      (!Number.isInteger(edge.node.image) || edge.node.image < 0 ||
       edge.node.image >= images.length || !images[edge.node.image] ||
       typeof images[edge.node.image] !== 'object'))) return null;
  for (const edge of variants) {
    if (typeof edge.node?.image === 'number') {
      // Each occurrence gets its own object, as with the original JSON parse.
      edge.node.image = JSON.parse(JSON.stringify(images[edge.node.image]));
    }
  }
  delete payload.__variantImageEncoding;
  delete payload.__variantImages;
  return payload;
}

const restorationScript = `window.__INITIAL_DATA__ = (${restoreCollectionImages.toString()})(window.__INITIAL_DATA__);`;

function encodeCollectionImages(payload) {
  const original = serializeJsonLd(payload);
  if (!payload?.path || !/^\/collections(?:\/|$)/.test(payload.path) ||
      !Array.isArray(payload.products) || '__variantImageEncoding' in payload || '__variantImages' in payload) {
    return { json: original, script: '' };
  }
  // Work on a JSON copy: never change the catalog used by cards/schema/product pages.
  const compact = JSON.parse(original);
  const images = [];
  const indices = new Map();
  for (const product of compact.products) {
    for (const edge of product.node?.variants?.edges || []) {
      const image = edge.node?.image;
      if (!image || typeof image !== 'object') continue;
      const key = JSON.stringify(image);
      if (!indices.has(key)) { indices.set(key, images.length); images.push(image); }
      edge.node.image = indices.get(key);
    }
  }
  compact.__variantImageEncoding = 1;
  compact.__variantImages = images;
  const json = serializeJsonLd(compact);
  // Include restoration script overhead; small collections retain their old format.
  return Buffer.byteLength(json) + Buffer.byteLength(restorationScript) + 32 < Buffer.byteLength(original)
    ? { json, script: restorationScript }
    : { json: original, script: '' };
}

module.exports = { encodeCollectionImages, restoreCollectionImages };
