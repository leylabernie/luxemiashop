const reviewedLehengaCollections = require('../config/reviewedLehengaCollections.json');

function isReviewedLehengaCollection(handle) {
  return Object.prototype.hasOwnProperty.call(reviewedLehengaCollections, handle);
}

// Membership is deliberately explicit: neither a keyword nor a newly added tag
// may enroll an unreviewed garment, dupatta-only match, or flatlay-only product.
// Shopify collections use the same manual IDs; no product tags are changed.
function filterReviewedLehengaProducts(handle, products) {
  if (!isReviewedLehengaCollection(handle)) return [];
  const members = new Map(reviewedLehengaCollections[handle].products.map(p => [p.id, p]));
  const seen = new Set();
  return products.filter(entry => {
    const product = entry.node || entry;
    const member = members.get(product.id);
    if (!member || seen.has(product.id) || product.handle !== member.handle) return false;
    if (product.status && product.status !== 'ACTIVE') return false;
    if (!/^(lehenga choli|lehengas?)$/i.test(product.productType || '')) return false;
    if (product.availableForSale === false) return false;
    const variants = product.variants?.edges?.map(edge => edge.node) || [];
    if (!variants.some(variant => variant.availableForSale === true)) return false;
    const image = product.images?.edges?.[0]?.node?.url;
    if (!image || image.split('?')[0] !== member.image.split('?')[0]) return false;
    seen.add(product.id);
    return true;
  });
}

module.exports = { reviewedLehengaCollections, isReviewedLehengaCollection, filterReviewedLehengaProducts };
