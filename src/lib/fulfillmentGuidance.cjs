const guidance = require('../config/fulfillmentGuidance.json');
const emptyRoutes = require('../config/emptyCatalogRoutes.json');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

// Share the approved page definitions with React. Filter whole navigation items,
// rather than stripping anchors and leaving invitations to empty collections.
function getFulfillmentGuidanceRoutes(excludedRoutes = emptyRoutes) {
  return Object.entries(guidance).map(([path, page]) => ({
    path,
    title: page.title,
    h1: page.title.replace(' | LuxeMia', ''),
    description: page.description,
    content: `<p>${escapeHtml(page.answer)}</p>`
      + page.sections.map(section => `<section><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p></section>`).join('')
      + '<nav aria-label="Choose by need"><h2>Choose by need</h2><ul>'
      + page.links.filter(link => !excludedRoutes.includes(link.href))
        .map(link => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`).join('')
      + '</ul></nav>',
  }));
}

module.exports = { getFulfillmentGuidanceRoutes };
