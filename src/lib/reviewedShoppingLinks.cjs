const links = require('../config/reviewedShoppingLinks.json');
const emptyRoutes = require('../config/emptyCatalogRoutes.json');

function getReviewedShoppingLinks(category) {
  return (links[category] || []).filter(link => !emptyRoutes.includes(link.href));
}

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

function renderReviewedShoppingLinks(category) {
  return getReviewedShoppingLinks(category)
    .map(link => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.name)}</a></li>`)
    .join('\n');
}

module.exports = { getReviewedShoppingLinks, renderReviewedShoppingLinks };
