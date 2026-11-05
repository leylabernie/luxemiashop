const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

/** Product images have variable dimensions. Never inherit the brand-card size. */
function setProductSocialMetadata(html, { image, name }) {
  const cleaned = html.replace(
    /<meta\b(?=[^>]*\bproperty\s*=\s*(["'])og:(?:type|image(?::(?:width|height|alt))?)\1)[^>]*>\s*/gi,
    '',
  ).replace(/<meta\b(?=[^>]*\bname\s*=\s*(["'])twitter:image:alt\1)[^>]*>\s*/gi, '');
  const tags = [
    '<meta property="og:type" content="product" />',
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(name)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(name)}" />`,
  ].join('\n    ');
  return cleaned.replace(/\s*<\/head>/i, () => `\n    ${tags}\n  </head>`);
}

module.exports = { setProductSocialMetadata };
