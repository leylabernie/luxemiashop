const emptyRoutes = require('../config/emptyCatalogRoutes.json');
// Preserve informational prose and source citations; suppress only relative
// shopping anchors into the newly empty made-to-order collection.
function stripPausedCustomizationLinks(html) {
  if (!emptyRoutes.includes('/collections/customizable-indian-outfits')) return html;
  return html.replace(/<a\b[^>]*href=(["'])\/collections\/customizable-indian-outfits\1[^>]*>([\s\S]*?)<\/a>/g,
    (_match, _quote, label) => `<span>${label}</span>`);
}
module.exports = { stripPausedCustomizationLinks };
