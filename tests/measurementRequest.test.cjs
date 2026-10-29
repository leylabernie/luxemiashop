const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { buildSync } = require('esbuild');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
function load(file, stubId = false) {
  const result = buildSync({ entryPoints: [path.resolve(__dirname, '..', file)], bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic', alias: { '@': path.resolve(__dirname, '../src') } });
  const m = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(name => stubId && name === 'react' ? { ...React, useId: () => 'test-id' } : require(name), m, m.exports);
  return m.exports;
}
const api = load('src/lib/measurementRequest.ts');
const valid = () => ({ choice: 'now', units: 'cm', basis: 'body', rows: [{ label: 'Customer chosen dimension', value: '32.5' }], notes: 'Please review', acknowledged: true });

test('later is optional, empty by default and does not serialize hidden data', () => {
  const draft = api.emptyMeasurementDraft();
  assert.deepEqual(draft, { choice: 'later', units: '', basis: '', rows: [], notes: '', acknowledged: false });
  assert.equal(api.measurementError(draft), null);
  assert.deepEqual(api.measurementAttributes({ ...valid(), choice: 'later' }), [{ key: 'Measurement submission', value: 'Provide after order — review required before alterations' }]);
});
test('now emits customer supplied review-only bounded line attributes', () => {
  const attrs = api.measurementAttributes(valid());
  assert.deepEqual(attrs[0], { key: 'Measurement submission', value: 'Customer supplied — review required' });
  assert.deepEqual(attrs.find(a => a.key === 'Provided measurement 1'), { key: 'Provided measurement 1', value: 'Customer chosen dimension: 32.5 cm' });
  const maximum = { ...valid(), rows: Array.from({ length: 8 }, (_, i) => ({ label: `${i}${'x'.repeat(39)}`, value: '123456789012' })), notes: 'x'.repeat(240) };
  assert.equal(api.measurementError(maximum), null);
  assert(api.measurementAttributes(maximum).every(a => a.value.length <= 240 && a.key.length < 255));
  assert.equal(api.measurementAttributes({ ...valid(), basis: 'garment' })[2].value, 'Existing garment');
});
test('rejects missing choices, duplicate labels, malformed numbers and control characters', () => {
  for (const patch of [{ choice: 'other' }, { units: '' }, { units: 'mm' }, { basis: '' }, { acknowledged: false }, { rows: [] }, { rows: Array(9).fill(valid().rows[0]) }, { notes: 'x'.repeat(241) }, { notes: 'line\nbreak' }]) assert(api.measurementError({ ...valid(), ...patch }));
  for (const label of ['', 'x'.repeat(41), '\nName', 'Na\u0085me']) assert(api.measurementError({ ...valid(), rows: [{ label, value: '2' }] }));
  for (const value of ['', '0', '-1', '1e3', '12 cm', '.5', '1'.repeat(13), '\n2', '2\u007f']) assert(api.measurementError({ ...valid(), rows: [{ label: 'Name', value }] }));
  assert(api.measurementError({ ...valid(), rows: [{ label: ' A ', value: '1' }, { label: 'a', value: '2' }] }));
  assert.throws(() => api.measurementAttributes({ ...valid(), acknowledged: false }), /Acknowledge/);
});
test('does not invent physical ranges or garment-specific required dimensions', () => {
  for (const value of ['0.1', '9999']) assert.equal(api.measurementError({ ...valid(), rows: [{ label: 'Supplier discussed value', value }] }), null);
});
test('controlled UI renders current summary, review notice, privacy and validation error', () => {
  const { MeasurementRequestForm } = load('src/components/product/MeasurementRequestForm.tsx');
  const html = renderToStaticMarkup(React.createElement(MeasurementRequestForm, { value: valid(), onChange: () => {}, error: 'Review needed' }));
  for (const text of ['Current details', 'Customer chosen dimension', '32.5', 'review required', 'Reloading', 'through Shopify', 'health information', 'role="alert"']) assert(html.includes(text));
  const later = renderToStaticMarkup(React.createElement(MeasurementRequestForm, { value: api.emptyMeasurementDraft(), onChange: () => {} }));
  assert.doesNotMatch(later, /Add measurement|type="checkbox"/);
  assert.match(later, /value="later" selected=""/);
});
function allNodes(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...React.Children.toArray(node.props?.children).flatMap(allNodes)];
}
test('every detail edit clears acknowledgment and choice switches clear previous details', () => {
  const { MeasurementRequestForm } = load('src/components/product/MeasurementRequestForm.tsx', true);
  let changed;
  const nodes = allNodes(MeasurementRequestForm({ value: valid(), onChange: draft => { changed = draft; } }));
  const controls = nodes.filter(n => n.props?.onChange && n.props.type !== 'checkbox');
  assert.equal(controls.length, 6);
  for (const node of controls) {
    node.props.onChange({ target: { value: node.type === 'select' ? node.props.value : 'New value' } });
    assert.equal(changed.acknowledged, false);
  }
  nodes.find(n => n.type === 'select' && n.props.value === 'now').props.onChange({ target: { value: 'later' } });
  assert.deepEqual(changed, api.emptyMeasurementDraft());
  for (const node of nodes.filter(n => n.type === 'button')) {
    node.props.onClick();
    assert.equal(changed.acknowledged, false);
  }
  nodes.find(n => n.props?.type === 'checkbox').props.onChange({ target: { checked: false } });
  assert.equal(changed.acknowledged, false);
});
test('rendered customer values are escaped; helper and UI have no storage or network side effects', () => {
  const { MeasurementRequestForm } = load('src/components/product/MeasurementRequestForm.tsx');
  const html = renderToStaticMarkup(React.createElement(MeasurementRequestForm, { value: { ...valid(), notes: '<script>alert(1)</script>' }, onChange: () => {} }));
  assert.doesNotMatch(html, /<script>/);
  for (const file of ['src/lib/measurementRequest.ts', 'src/components/product/MeasurementRequestForm.tsx']) {
    assert.doesNotMatch(fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8'), /fetch\(|localStorage|sessionStorage|console\.|trackEvent|trackAddToCart|URLSearchParams/);
  }
});

test('storage redaction fails closed even if private attributes arrive without a submission marker', () => {
  const original=[{key:'Provided measurement 1',value:'PRIVATE_LABEL: 31.345 cm'},{key:'Measurement notes',value:'PRIVATE_NOTES'},{key:'Configuration reference',value:'safe-reference'}];
  const redacted=api.redactMeasurementAttributes(original);
  assert(api.hasPendingMeasurementAttributes(redacted));
  assert.doesNotMatch(JSON.stringify(redacted),/PRIVATE_LABEL|31\.345|PRIVATE_NOTES/);
  assert.equal(original[0].value,'PRIVATE_LABEL: 31.345 cm');
  assert.deepEqual(api.redactMeasurementAttributes(redacted),redacted);
});
