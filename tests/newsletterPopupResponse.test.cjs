const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { build } = require('esbuild');

const root = path.resolve(__dirname, '..');
const compiled = build({
  entryPoints: [path.join(root, 'src/components/home/NewVisitorPopup.tsx')],
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  jsx: 'automatic',
  alias: { '@': path.join(root, 'src') },
  plugins: [{ name: 'isolated-popup', setup(b) {
    b.onResolve({ filter: /^(react(?:\/jsx-runtime)?|framer-motion|react-router-dom|lucide-react|sonner|@\/components\/ui\/button)$/ }, a => ({ path: a.path, namespace: 'fixture' }));
    b.onLoad({ filter: /.*/, namespace: 'fixture' }, a => ({ loader: 'js', contents: {
      react: 'export const useState = v => globalThis.popupFixture.useState(v); export const useEffect = () => {}; export const useRef = v => ({current:v});',
      'react/jsx-runtime': 'export const jsx = (type,props) => ({type,props}); export const jsxs = jsx; export const Fragment = "fragment";',
      'framer-motion': 'export const motion = {div:"div"}; export const AnimatePresence = "presence";',
      'react-router-dom': 'export const useLocation = () => ({pathname:"/"});',
      'lucide-react': 'export const X="icon", Sparkles="icon", Clock="icon", Check="icon";',
      sonner: 'export const toast = {success:(...a)=>globalThis.popupFixture.toasts.push(["success",...a]),error:(...a)=>globalThis.popupFixture.toasts.push(["error",...a]),info:(...a)=>globalThis.popupFixture.toasts.push(["info",...a])};',
      '@/components/ui/button': 'export const Button = "button";',
    }[a.path] }));
  } }],
});

function findForm(node) {
  if (!node || typeof node !== 'object') return undefined;
  if (Array.isArray(node)) return node.map(findForm).find(Boolean);
  if (node.type === 'form') return node;
  return findForm(node.props?.children);
}

async function submit(response, email = 'shopper@example.test') {
  const saved = Object.fromEntries(['fetch', 'localStorage', 'navigator', 'popupFixture'].map(k => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  const oldError = console.error;
  const f = { values: [true, email, null, false, false, null], cursor: 0, writes: [], toasts: [], requests: [], copies: [] };
  f.useState = value => {
    const i = f.cursor++;
    return [i < f.values.length ? f.values[i] : value, v => f.writes.push([i, v])];
  };
  const storage = new Map();
  Object.defineProperties(globalThis, {
    popupFixture: { configurable: true, value: f },
    localStorage: { configurable: true, value: { getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,v) } },
    navigator: { configurable: true, value: { clipboard: { writeText: async value => f.copies.push(value) } } },
    fetch: { configurable: true, value: async (...args) => { f.requests.push(args); if (response instanceof Error) throw response; return response; } },
  });
  console.error = () => {};
  try {
    const m = { exports: {} };
    new Function('require','module','exports',(await compiled).outputFiles[0].text)(require,m,m.exports);
    const form = findForm(m.exports.default());
    assert(form, 'real popup renders its signup form');
    await form.props.onSubmit({ preventDefault() {} });
    return f;
  } finally {
    console.error = oldError;
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

test('confirmed popup signup shows qualified code, without claiming an email was sent', async () => {
  const f = await submit(new Response(JSON.stringify({ success: true, discountCode: 'FIRST10' }), { status: 200 }));
  assert(f.writes.some(([i,v]) => i === 4 && v === true));
  assert.deepEqual(f.copies, ['FIRST10']);
  assert(f.toasts.some(([kind]) => kind === 'success'));
  assert.doesNotMatch(JSON.stringify(f.toasts), /email.*sent|check.*inbox|email delivery/i);
  assert.equal(f.requests.length, 1);
});

for (const status of [400, 403, 500, 503]) {
  test(`popup HTTP ${status} never claims a saved signup or email delivery`, async () => {
    const f = await submit(new Response(JSON.stringify({ error: 'Service unavailable' }), { status }));
    assert(!f.writes.some(([i,v]) => i === 4 && v === true));
    assert.deepEqual(f.copies, []);
    assert(f.toasts.some(([kind]) => kind === 'error'));
    assert(!f.toasts.some(([kind]) => kind === 'success' || kind === 'info'));
    assert(f.writes.some(([i,v]) => i === 3 && v === false), 'submission lock releases for retry');
  });
}

test('popup rate-limit rejection stays unsuccessful and retains retry guidance', async () => {
  const f = await submit(new Response(JSON.stringify({ error: 'Rate limited', retryAfter: 30 }), { status: 429 }));
  assert(!f.writes.some(([i,v]) => i === 4 && v === true));
  assert.match(JSON.stringify(f.toasts), /30 seconds/);
});

test('popup network failure does not claim success', async () => {
  const f = await submit(new Error('offline'));
  assert(!f.writes.some(([i,v]) => i === 4 && v === true));
  assert.deepEqual(f.copies, []);
});

for (const [label, body, status] of [
  ['empty response', '', 200],
  ['malformed JSON', '<html>unavailable</html>', 200],
  ['null JSON', 'null', 200],
  ['204', null, 204],
  ['missing success', '{}', 200],
  ['false success', '{"success":false}', 200],
  ['contradictory error', '{"success":true,"error":"failed"}', 200],
  ['non-boolean success', '{"success":"true"}', 200],
]) {
  test(`popup ${label} cannot confirm a signup`, async () => {
    const f = await submit(new Response(body, { status }));
    assert(!f.writes.some(([i,v]) => i === 4 && v === true));
    assert.deepEqual(f.copies, []);
    assert(f.toasts.some(([kind]) => kind === 'error'));
    assert(f.writes.some(([i,v]) => i === 3 && v === false));
  });
}

test('invalid popup email never reaches the network', async () => {
  const f = await submit(new Error('must not call fetch'), 'invalid');
  assert.equal(f.requests.length, 0);
});
