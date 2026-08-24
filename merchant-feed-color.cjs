const COLOR_KEYWORDS = Object.freeze([
  'Celestial Sky Blue',
  'Forest Green & Mauve',
  'Rust Orange & Olive',
  'Chocolate Brown',
  'Champagne Gold',
  'Burnt Orange',
  'Powder Blue',
  'Navy Blue',
  'Emerald Green',
  'Mustard Yellow',
  'Bottle Green',
  'Pista Green',
  'Royal Blue',
  'Teal Green',
  'Olive Green',
  'Sage Green',
  'Sea Green',
  'Sky Blue',
  'Baby Pink',
  'Hot Pink',
  'Blush Pink',
  'Dusty Pink',
  'Dusty Rose',
  'Fuchsia Pink',
  'Lime Yellow',
  'Off White',
  'Olive Brown',
  'Rose Gold',
  'Rust Red',
  'Black & Sage',
  'Red & Ivory',
  'Ivory Silver',
  'Multi Color',
  'Multicolor',
  'Burgundy',
  'Champagne',
  'Charcoal',
  'Fuchsia',
  'Lavender',
  'Magenta',
  'Maroon',
  'Turquoise',
  'Marigold',
  'Emerald',
  'Mustard',
  'Saffron',
  'Orange',
  'Purple',
  'Yellow',
  'Copper',
  'Silver',
  'Black',
  'White',
  'Brown',
  'Cream',
  'Ivory',
  'Beige',
  'Peach',
  'Coral',
  'Amber',
  'Mauve',
  'Lilac',
  'Plum',
  'Ruby',
  'Bronze',
  'Rust',
  'Gold',
  'Navy',
  'Teal',
  'Olive',
  'Mint',
  'Sage',
  'Aqua',
  'Peacock',
  'Wine',
  'Green',
  'Blue',
  'Pink',
  'Rose',
  'Grey',
  'Gray',
  'Red',
  'Tan',
  'Camel',
  'Onion',
]);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function exactPhrasePattern(value) {
  const phrase = String(value || '')
    .trim()
    .split(/[\s\-\u2013\u2014]+/)
    .filter(Boolean)
    .map(escapeRegExp)
    .join('[\\s\\-\\u2013\\u2014]+');

  if (!phrase) return null;
  return new RegExp(`(?:^|[^a-z0-9])(${phrase})(?=$|[^a-z0-9])`, 'i');
}

function containsExactPhrase(text, value) {
  const pattern = exactPhrasePattern(value);
  return pattern ? pattern.test(String(text || '')) : false;
}

function inferColorFromText(text) {
  const searchable = String(text || '');
  const matches = COLOR_KEYWORDS
    .map((candidate) => {
      const match = exactPhrasePattern(candidate)?.exec(searchable);
      return match ? { candidate, index: match.index, length: match[1].length } : null;
    })
    .filter(Boolean)
    .sort((left, right) => left.index - right.index || right.length - left.length);

  return matches[0]?.candidate || '';
}

module.exports = {
  COLOR_KEYWORDS,
  containsExactPhrase,
  inferColorFromText,
};
