/** Serialize JSON-LD for an HTML script body without allowing a literal '<'. */
function serializeJsonLd(value, space) {
  const json = JSON.stringify(value, null, space);
  if (json === undefined) throw new TypeError('JSON-LD requires a JSON-serializable value.');
  return json.replace(/</g, '\\u003c');
}

module.exports = { serializeJsonLd };
