const SIZE_OPTION_NAMES = new Set([
  'size',
  'standard size',
  'blouse size',
  'bust size',
  'chest size',
  'stitching size',
]);

function normalizeOptionName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function isSizeOptionName(value) {
  return SIZE_OPTION_NAMES.has(normalizeOptionName(value));
}

// Shopify's factual youth age labels are clothing sizes, not the generic
// Google age_group values. Never turn "Adult" or an arbitrary age into size.
function isAgeSizeOption(option) {
  return normalizeOptionName(option?.name) === 'age'
    && /^(?:[6-9]|10)Y$/i.test(String(option?.value || '').trim());
}

function getMerchantAgeGroup(options) {
  return (options || []).some(isAgeSizeOption) ? 'kids' : 'adult';
}

function getSizeOption(options) {
  return (options || []).find((option) =>
    isSizeOptionName(option?.name)
    && String(option?.value || '').trim()
    && normalizeOptionName(option?.value) !== 'default title'
  ) || (options || []).find(isAgeSizeOption);
}

module.exports = {
  SIZE_OPTION_NAMES,
  isAgeSizeOption,
  getMerchantAgeGroup,
  getSizeOption,
  isSizeOptionName,
  normalizeOptionName,
};
