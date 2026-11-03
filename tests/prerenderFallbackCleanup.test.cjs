const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../scripts/prerender.js'), 'utf8');
const declaration = source.match(/const hydrationCleanupScript = ([\s\S]*?);\n\n  const seoContent/)[1];
const cleanupFor = new Function('route', `return ${declaration};`);

function mount(route, { loading = false, children = 0, missingRoot = false } = {}) {
  let notify;
  const state = { removed: 0, disconnected: 0, observed: 0, loading, children };
  const fallback = { remove() { state.removed++; } };
  const root = {
    get childElementCount() { return state.children; },
    querySelector(selector) {
      assert.equal(selector, '[data-page-loading]');
      return state.loading ? {} : null;
    },
  };
  const document = {
    getElementById(id) {
      // The React returns page reuses merchant-return-policy. Never select it.
      assert.equal(id, 'root');
      return missingRoot ? null : root;
    },
    querySelector(selector) {
      assert.equal(selector, 'main[data-prerender-fallback]');
      return fallback;
    },
  };
  class MutationObserver {
    constructor(callback) { notify = callback; }
    disconnect() { state.disconnected++; }
    observe(target, options) {
      assert.equal(target, root);
      assert.equal(options.childList, true);
      assert.equal(options.subtree, true);
      state.observed++;
    }
  }
  const html = cleanupFor(route);
  if (html) vm.runInNewContext(html.replace(/<\/?script>/g, ''), { document, MutationObserver });
  return { state, notify };
}

test('static fallback is uniquely marked and returns semantic ID is preserved', () => {
  assert.ok(source.includes('<main data-prerender-fallback id="${route.path === \'/returns\' ? \'merchant-return-policy\' : \'seo-prerender\'}"'));
  assert.ok(source.includes('${mainBodyContent}'));
});

test('direct returns load removes only captured static fallback after React mounts', () => {
  const { state, notify } = mount({ path: '/returns' });
  assert.equal(state.removed, 0);
  assert.equal(state.observed, 1);
  state.children = 1;
  notify();
  assert.equal(state.removed, 1);
  assert.equal(state.disconnected, 1);
});

test('empty React root retains crawlable fallback', () => {
  const { state, notify } = mount({ path: '/returns' });
  notify();
  assert.equal(state.removed, 0);
  assert.equal(state.disconnected, 0);
});

test('Suspense fallback retains static policy until real content is mounted', () => {
  const { state, notify } = mount({ path: '/returns' }, { children: 1, loading: true });
  notify();
  assert.equal(state.removed, 0);
  state.loading = false;
  notify();
  assert.equal(state.removed, 1);
});

test('other route fallback lifecycle remains supported', () => {
  const { state, notify } = mount({ path: '/shipping' }, { children: 1 });
  notify();
  assert.equal(state.removed, 1);
});

test('permanent HTML sitemap has no cleanup script', () => {
  assert.equal(cleanupFor({ path: '/sitemap', htmlSitemap: true }), '');
});

test('absent root exits safely without observer or removal', () => {
  const { state } = mount({ path: '/returns' }, { missingRoot: true });
  assert.equal(state.observed, 0);
  assert.equal(state.removed, 0);
});
