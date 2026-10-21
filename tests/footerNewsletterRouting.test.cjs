const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { build } = require('esbuild');
const root = path.resolve(__dirname, '..');
const endpoint = 'https://jcyolouvxfxovzjyyrxu.supabase.co/functions/v1/submit-email';

const compiled = build({
  entryPoints: [path.join(root, 'src/components/layout/Footer.tsx')],
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
  alias: { '@': path.join(root, 'src') },
  plugins: [{ name: 'isolated-footer', setup(b) {
    b.onResolve({ filter: /^(react(?:\/jsx-runtime)?|react-router-dom|lucide-react|sonner)$/ }, a => ({ path: a.path, namespace: 'fixture' }));
    b.onLoad({ filter: /.*/, namespace: 'fixture' }, a => ({ loader: 'js', contents: {
      react: 'export const forwardRef = f => f; export const useState = v => globalThis.footerFixture.useState(v); export const useEffect = () => {}; export const useRef = v => ({current:v});',
      'react/jsx-runtime': 'export const jsx = (type,props) => ({type,props}); export const jsxs = jsx; export const Fragment = "fragment";',
      'react-router-dom': 'export const Link = "link";',
      'lucide-react': 'export const Instagram="icon",Facebook="icon",Mail="icon",Phone="icon",Clock="icon",Shield="icon",Lock="icon",CreditCard="icon",Truck="icon",Check="icon";',
      sonner: 'export const toast = {success:(...a)=>globalThis.footerFixture.toasts.push(["success",...a]),error:(...a)=>globalThis.footerFixture.toasts.push(["error",...a])};',
    }[a.path] }));
  } }],
});

function findForm(node) {
  if (!node || typeof node !== 'object') return undefined;
  if (Array.isArray(node)) return node.map(findForm).find(Boolean);
  if (node.type === 'form') return node;
  return findForm(node.props?.children);
}

async function withFooter(response, callback, email = '  Shopper@Example.test  ') {
  const saved = Object.fromEntries(['fetch', 'footerFixture'].map(k => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  const f = { values: [email, false, false, null], cursor: 0, writes: [], toasts: [], requests: [] };
  f.useState = value => {
    const i = f.cursor++;
    return [i < f.values.length ? f.values[i] : value, v => f.writes.push([i, v])];
  };
  Object.defineProperties(globalThis, {
    footerFixture: { configurable: true, value: f },
    fetch: { configurable: true, value: async (...args) => {
      f.requests.push(args);
      if (response instanceof Error) throw response;
      return typeof response === 'function' ? response() : response;
    } },
  });
  try {
    const m = { exports: {} };
    new Function('require','module','exports',(await compiled).outputFiles[0].text)(require,m,m.exports);
    const form = findForm(m.exports.default({}, null));
    assert(form, 'real footer renders its signup form');
    await callback(f, () => form.props.onSubmit({ preventDefault() {} }));
  } finally {
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

for (const duplicate of [false, true]) {
  test(`confirmed footer ${duplicate ? 'duplicate' : 'new'} signup uses dedicated endpoint and qualified local offer`, async () => {
    await withFooter(new Response(JSON.stringify({ success: true, duplicate, discountCode: 'UNTRUSTED_RESPONSE_CODE' })), async (f, submit) => {
      await submit();
      assert.equal(f.requests.length, 1);
      const [url, options] = f.requests[0];
      assert.equal(url, endpoint);
      assert.equal(options.method, 'POST');
      assert.equal(options.credentials, 'omit');
      assert.deepEqual(options.headers, { 'Content-Type': 'application/json' });
      assert.deepEqual(JSON.parse(options.body), { email: 'shopper@example.test', type: 'newsletter', source: 'footer' });
      assert(f.writes.some(([i,v]) => i === 2 && v === true));
      assert(f.writes.some(([i,v]) => i === 3 && v === 'FIRST10'));
      assert.doesNotMatch(JSON.stringify(f.toasts), /UNTRUSTED_RESPONSE_CODE|email.*sent|check.*inbox/i);
      assert.match(JSON.stringify(f.toasts), /eligible first orders/);
      assert(f.writes.some(([i,v]) => i === 1 && v === false));
    });
  });
}

const failures = [
  ...[403, 429, 500, 503].map(status => [String(status), () => new Response(JSON.stringify({ error: 'unavailable' }), { status })]),
  ['empty 200', () => new Response('')],
  ['malformed JSON', () => new Response('<html>unavailable</html>')],
  ['null JSON', () => new Response('null')],
  ['204', () => new Response(null, { status: 204 })],
  ['false success', () => new Response('{"success":false}')],
  ['missing success', () => new Response('{}')],
  ['contradictory error', () => new Response('{"success":true,"error":"failed"}')],
  ['network failure', () => new Error('offline')],
];
for (const [label, response] of failures) {
  test(`footer ${label} preserves the form, resets loading and never reports success`, async () => {
    await withFooter(response(), async (f, submit) => {
      await submit();
      assert.equal(f.requests.length, 1, 'no automatic retry');
      assert(!f.writes.some(([i,v]) => i === 2 && v === true));
      assert(f.toasts.some(([kind]) => kind === 'error'));
      assert(!f.toasts.some(([kind]) => kind === 'success'));
      assert(f.writes.some(([i,v]) => i === 1 && v === false));
      assert(!f.writes.some(([i]) => i === 0), 'entered email is preserved');
    });
  });
}

test('a pending footer request cannot submit twice, and a failed request permits a deliberate retry', async () => {
  let release;
  let calls = 0;
  await withFooter(() => {
    calls++;
    if (calls === 1) return new Promise(resolve => { release = resolve; });
    return new Response('{"success":true}');
  }, async (f, submit) => {
    const first = submit();
    await submit();
    assert.equal(f.requests.length, 1);
    release(new Response('{"error":"unavailable"}', { status: 503 }));
    await first;
    await submit();
    assert.equal(f.requests.length, 2);
    assert(f.writes.some(([i,v]) => i === 2 && v === true));
  });
});

test('blank footer input never makes a request', async () => {
  await withFooter(new Error('must not run'), async (f, submit) => { await submit(); assert.equal(f.requests.length, 0); }, '   ');
});

test('newsletter routing leaves the shared client/config and popup endpoint alone', () => {
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'src/components/layout/Footer.tsx'), 'utf8'), /supabase\/client|supabase\.functions/);
  assert.match(fs.readFileSync(path.join(root, 'src/integrations/supabase/client.ts'), 'utf8'), /import\.meta\.env\.VITE_SUPABASE_URL/);
  assert.match(fs.readFileSync(path.join(root, 'supabase/config.toml'), 'utf8'), /project_id = "mxrvlizhrofsroydenti"/);
  assert(fs.readFileSync(path.join(root, 'src/components/home/NewVisitorPopup.tsx'), 'utf8').includes(endpoint));
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const policies = config.headers.flatMap(rule => rule.headers).filter(header => header.key === 'Content-Security-Policy');
  assert(policies.length > 0);
  for (const policy of policies) assert(policy.value.includes('https://jcyolouvxfxovzjyyrxu.supabase.co'));
});
