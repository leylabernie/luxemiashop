const emptyRoutes = require('../config/emptyCatalogRoutes.json');
// Preserve informational prose and external source citations; suppress relative
// shopping anchors to every intentionally empty collection in the shared registry.
function stripPausedCustomizationLinks(html) {
  return html.replace(/<a\b[^>]*href=(["'])(\/[^"']*)\1[^>]*>([\s\S]*?)<\/a>/g,
    (match, _quote, href, label) => {
      const route = href.split(/[?#]/, 1)[0].replace(/\/$/, '');
      return emptyRoutes.includes(route) ? `<span>${label}</span>` : match;
    });
}
module.exports = { stripPausedCustomizationLinks };
