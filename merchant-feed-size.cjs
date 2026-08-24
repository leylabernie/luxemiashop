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

function getSizeOption(options) {
  return (options || []).find((option) =>
    isSizeOptionName(option?.name)
    && String(option?.value || '').trim()
    && normalizeOptionName(option?.value) !== 'default title'
  );
}

module.exports = {
  SIZE_OPTION_NAMES,
  getSizeOption,
  isSizeOptionName,
  normalizeOptionName,
};
