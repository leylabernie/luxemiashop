const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { build } = require('esbuild');

const root = path.resolve(__dirname, '..');

/**
 * Cart email capture submission states.
 *
 * The component is not mounted anywhere in src/ today (see its header comment);
 * these tests exist so that mounting it later cannot reintroduce the two defects
 * found in the 2026-11-25 audit: an unguarded localStorage read that threw
 * before the try block, so the submit button silently did nothing, and a catch
 * block that proceeded to checkout without telling the shopper the save failed.
 */
const compiled = build({
  entryPoints: [path.join(root, 'src/components/cart/EmailCaptureModal.tsx')],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  jsx: 'automatic',
  alias: { '@': path.join(root, 'src') },
  plugins: [{
    name: 'isolated-cart-modal',
    setup(b) {
      b.onResolve({ filter: /^(react(?:\/jsx-runtime)?|framer-motion|lucide-react|sonner|@\/components\/ui\/button|@\/components\/ui\/input|@\/integrations\/supabase\/client|@\/stores\/cartStore)$/ }, (a) => ({ path: a.path, namespace: 'fixture' }));
      b.onLoad({ filter: /.*/, namespace: 'fixture' }, (a) => ({
        loader: 'js',
        contents: {
          react: 'export const useState = v => globalThis.modalFixture.useState(v);',
          'react/jsx-runtime': 'export const jsx = (type, props) => ({ type, props }); export const jsxs = jsx; export const Fragment = "fragment";',
          'framer-motion': 'export const motion = { div: "div" }; export const AnimatePresence = "presence";',
          'lucide-react': 'export const X = "icon", Mail = "icon", Loader2 = "icon";',
          sonner: 'export const toast = { success: (...a) => globalThis.modalFixture.toasts.push(["success", ...a]), error: (...a) => globalThis.modalFixture.toasts.push(["error", ...a]) };',
          '@/components/ui/button': 'export const Button = "button";',
          '@/components/ui/input': 'export const Input = "input";',
          '@/integrations/supabase/client': 'export const supabase = { functions: { invoke: (...args) => globalThis.modalFixture.invoke(...args) } };',
          '@/stores/cartStore': 'export const useCartStore = () => ({ items: globalThis.modalFixture.items });',
        }[a.path],
      }));
    },
  }],
});

const RATE_LIMIT_KEY = 'cart_email_submit_timestamps';
const NOW = Date.parse('2026-11-25T12:00:00.000Z');

function fakeStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    map,
    getItem: (key) => (map.has(String(key)) ? map.get(String(key)) : null),
    setItem: (key, value) => map.set(String(key), String(value)),
    removeItem: (key) => map.delete(String(key)),
  };
}

function throwingStorage() {
  const boom = () => { throw new Error('SecurityError: storage is blocked'); };
  return { getItem: boom, setItem: boom, removeItem: boom };
}

const CART_ITEMS = [
  {
    product: { node: { id: 'gid://shopify/Product/1', title: 'Red Georgette Bridal Lehenga', images: { edges: [{ node: { url: 'https://cdn.shopify.com/a.jpg' } }] } } },
    variantId: 'gid://shopify/ProductVariant/2',
    variantTitle: 'S / Unstitched',
    price: { amount: '576.99', currencyCode: 'USD' },
    quantity: 1,
  },
  {
    product: { node: { id: 'gid://shopify/Product/3', title: 'Onion Pink Silk Saree', images: { edges: [] } } },
    variantId: 'gid://shopify/ProductVariant/4',
    variantTitle: 'One Size',
    price: { amount: '55.00', currencyCode: 'USD' },
    quantity: 2,
  },
];

function find(node, predicate) {
  if (!node || typeof node !== 'object') return undefined;
  if (Array.isArray(node)) return node.map((child) => find(child, predicate)).find(Boolean);
  if (predicate(node)) return node;
  return find(node.props?.children, predicate);
}

function collectText(node, into = []) {
  if (typeof node === 'string') into.push(node);
  else if (Array.isArray(node)) node.forEach((child) => collectText(child, into));
  else if (node && typeof node === 'object') collectText(node.props?.children, into);
  return into;
}

/**
 * Mount the modal once. `responses` is a queue of invoke results
 * (`{ data, error }`) or Errors to throw.
 */
async function mount(options = {}) {
  const {
    email = '  Shopper@Example.test ',
    storage = fakeStorage(options.seed),
    responses = [{ data: { success: true, message: 'Cart saved successfully' }, error: null }],
    items = CART_ITEMS,
  } = options;

  const fixture = {
    // 0 email, 1 isLoading, 2 emailError — positional, matching the component.
    values: [email, false, null],
    cursor: 0,
    writes: [],
    toasts: [],
    invocations: [],
    items,
    submitted: [],
    closed: 0,
    skipped: 0,
  };
  fixture.useState = (value) => {
    const index = fixture.cursor++;
    return [index < fixture.values.length ? fixture.values[index] : value, (next) => fixture.writes.push([index, next])];
  };
  let call = 0;
  fixture.invoke = async (name, init) => {
    fixture.invocations.push({ name, init });
    const scripted = responses[Math.min(call, responses.length - 1)];
    call += 1;
    if (scripted instanceof Error) throw scripted;
    return scripted;
  };

  const saved = Object.fromEntries(
    ['modalFixture', 'window', 'localStorage'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  const realNow = Date.now;
  const realConsoleError = console.error;
  console.error = () => {};
  Object.defineProperties(globalThis, {
    modalFixture: { configurable: true, value: fixture },
    window: { configurable: true, value: { localStorage: storage } },
    localStorage: { configurable: true, value: storage },
  });
  Date.now = () => NOW;

  const module = { exports: {} };
  new Function('require', 'module', 'exports', (await compiled).outputFiles[0].text)(require, module, module.exports);

  const props = {
    isOpen: true,
    onClose: () => { fixture.closed += 1; },
    onEmailSubmitted: (value) => fixture.submitted.push(value),
    onSkip: () => { fixture.skipped += 1; },
  };

  const api = {
    fixture,
    storage,
    props,
    render() { fixture.cursor = 0; return module.exports.default(props); },
    async submit() {
      const tree = api.render();
      const form = find(tree, (node) => node.type === 'form');
      assert(form, 'the modal renders its form');
      await form.props.onSubmit({ preventDefault() {} });
      return fixture;
    },
    text() { return collectText(api.render()).join(' '); },
    restore() {
      Date.now = realNow;
      console.error = realConsoleError;
      for (const [key, descriptor] of Object.entries(saved)) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
  return api;
}

// ─── payload ────────────────────────────────────────────────────────────────

test('the cart capture posts type "cart" with a serialised snapshot and total', async () => {
  const harness = await mount();
  try {
    await harness.submit();
    assert.equal(harness.fixture.invocations.length, 1);
    const { name, init } = harness.fixture.invocations[0];
    assert.equal(name, 'submit-email');
    assert.deepEqual(init.body, {
      // The component trims; submit-email lowercases server-side
      // (`sanitizedEmail = email.trim().toLowerCase()`), so mixed case cannot
      // create duplicate rows in the unique-indexed tables.
      email: 'Shopper@Example.test',
      type: 'cart',
      cartItems: [
        {
          productId: 'gid://shopify/Product/1',
          productTitle: 'Red Georgette Bridal Lehenga',
          variantId: 'gid://shopify/ProductVariant/2',
          variantTitle: 'S / Unstitched',
          price: '576.99',
          currency: 'USD',
          quantity: 1,
          image: 'https://cdn.shopify.com/a.jpg',
        },
        {
          productId: 'gid://shopify/Product/3',
          productTitle: 'Onion Pink Silk Saree',
          variantId: 'gid://shopify/ProductVariant/4',
          variantTitle: 'One Size',
          price: '55.00',
          currency: 'USD',
          quantity: 2,
          image: null,
        },
      ],
      cartTotal: 686.99,
      currency: 'USD',
    });
  } finally {
    harness.restore();
  }
});

test('a cart capture is never presented as a newsletter signup or a discount claim', async () => {
  const harness = await mount();
  try {
    const text = harness.text();
    assert.match(text, /Enter your email to proceed to checkout/);
    assert.match(text, /save your cart/i);
    // It writes abandoned_carts (transactional), so it must not ask for
    // marketing consent or advertise FIRST10 — see /privacy and playbook §6.9.
    assert.doesNotMatch(text, /subscrib|newsletter|FIRST10|10% off|discount/i);
    assert.doesNotMatch(text, /remind you about your cart/i, 'nothing in this repo sends that reminder');
  } finally {
    harness.restore();
  }
});

// ─── success, duplicate and failure states ──────────────────────────────────

test('a confirmed save says the email was saved and nothing more', async () => {
  const harness = await mount();
  try {
    await harness.submit();
    const success = harness.fixture.toasts.find(([kind]) => kind === 'success');
    assert(success, 'a confirmed save reports success');
    assert.equal(success[1], "Email saved. Continue to checkout whenever you're ready.");
    assert.doesNotMatch(success[1], /remind/i, 'no promise of an email nothing sends');
    assert.deepEqual(harness.fixture.submitted, ['  Shopper@Example.test ']);
    assert.equal(harness.fixture.closed, 1);
    assert(harness.fixture.writes.some(([index, value]) => index === 1 && value === false), 'the loading lock releases');
  } finally {
    harness.restore();
  }
});

test('a repeat capture is a success, because abandoned_carts is append-only', async () => {
  const harness = await mount({
    responses: [
      { data: { success: true, message: 'Cart saved successfully' }, error: null },
      { data: { success: true, message: 'Cart saved successfully' }, error: null },
    ],
  });
  try {
    await harness.submit();
    await harness.submit();
    assert.equal(harness.fixture.invocations.length, 2);
    assert.equal(harness.fixture.toasts.filter(([kind]) => kind === 'error').length, 0);
    assert.equal(harness.fixture.submitted.length, 2);
  } finally {
    harness.restore();
  }
});

test('a rate-limit response keeps the shopper on the modal and reports the wait', async () => {
  const harness = await mount({
    responses: [{ data: { error: 'Rate limited', retryAfter: 45 }, error: null }],
  });
  try {
    await harness.submit();
    assert.match(JSON.stringify(harness.fixture.toasts), /45 seconds/);
    assert.equal(harness.fixture.submitted.length, 0, 'checkout is not advanced on a throttled save');
    assert(harness.fixture.writes.some(([index, value]) => index === 1 && value === false));
  } finally {
    harness.restore();
  }
});

for (const [label, response] of [
  ['a service error', { data: { error: 'Database unavailable' }, error: null }],
  ['an invoke failure', { data: null, error: Object.assign(new Error('edge function error'), { name: 'FunctionsInvokeError' }) }],
  ['a thrown network error', new Error('offline')],
]) {
  test(`${label} tells the shopper the save failed instead of proceeding in silence`, async () => {
    const harness = await mount({ responses: [response] });
    try {
      await harness.submit();
      const failure = harness.fixture.toasts.find(([kind]) => kind === 'error');
      assert(failure, `${label} must surface an error`);
      assert.equal(failure[1], 'We could not save your email');
      assert.match(failure[2]?.description || '', /continue to checkout/i);
      assert.equal(harness.fixture.toasts.filter(([kind]) => kind === 'success').length, 0, 'no success claim on a failed save');
      // Checkout is never blocked by a lost reminder.
      assert.equal(harness.fixture.submitted.length, 1);
      assert.equal(harness.fixture.closed, 1);
      assert(harness.fixture.writes.some(([index, value]) => index === 1 && value === false));
    } finally {
      harness.restore();
    }
  });
}

// ─── storage failures fail open ─────────────────────────────────────────────

test('blocked or corrupt storage cannot stop a cart capture', async () => {
  for (const [label, storage] of [
    ['throwing storage', throwingStorage()],
    ['corrupt rate-limit value', fakeStorage({ [RATE_LIMIT_KEY]: '{not json' })],
    ['non-numeric history', fakeStorage({ [RATE_LIMIT_KEY]: '["a",null,{}]' })],
  ]) {
    const harness = await mount({ storage });
    try {
      await harness.submit();
      assert.equal(harness.fixture.invocations.length, 1, `${label}: the submit never reached the network`);
      assert(harness.fixture.toasts.some(([kind]) => kind === 'success'), label);
    } finally {
      harness.restore();
    }
  }
});

test('a genuine burst is throttled after three attempts and releases after the window', async () => {
  const harness = await mount();
  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await harness.submit();
    }
    assert.equal(harness.fixture.invocations.length, 3);
    await harness.submit();
    assert.equal(harness.fixture.invocations.length, 3, 'the fourth attempt is throttled client-side');
    assert.match(JSON.stringify(harness.fixture.toasts), /Too many attempts/);
    const stored = JSON.parse(harness.storage.map.get(RATE_LIMIT_KEY));
    assert.equal(stored.length, 3);
  } finally {
    harness.restore();
  }
});

// ─── validation ─────────────────────────────────────────────────────────────

test('an invalid address is rejected before any request', async () => {
  for (const email of ['', '   ', 'not-an-email', 'a@b', '<script>@example.test']) {
    const harness = await mount({ email });
    try {
      await harness.submit();
      assert.equal(harness.fixture.invocations.length, 0, `${JSON.stringify(email)} reached the network`);
      assert(harness.fixture.writes.some(([index, value]) => index === 2 && typeof value === 'string'), 'an error message is set');
    } finally {
      harness.restore();
    }
  }
});

// ─── status of the component in the repo ────────────────────────────────────

test('the component documents that it is unmounted and what it writes', () => {
  const source = fs.readFileSync(path.join(root, 'src/components/cart/EmailCaptureModal.tsx'), 'utf8');
  assert.match(source, /not mounted anywhere/i);
  assert.match(source, /abandoned_carts/);
  assert.match(source, /type: 'cart'/);
  assert.match(source, /never creates a marketing subscriber/i);
  // The exit-intent prompt shoppers actually see lives elsewhere.
  assert.match(source, /NewVisitorPopup/);

  const importers = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.tsx?$/.test(entry.name) && full !== path.join(root, 'src/components/cart/EmailCaptureModal.tsx')) {
        const source = fs.readFileSync(full, 'utf8');
        // An import or a JSX use — not a mention in a comment, which is how
        // src/lib/leadCaptureStorage.ts documents this component.
        if (/from\s+['"][^'"]*EmailCaptureModal['"]|<EmailCaptureModal\b/.test(source)) {
          importers.push(path.relative(root, full));
        }
      }
    }
  };
  walk(path.join(root, 'src'));
  assert.deepEqual(importers, [], 'if this is now mounted, update the header comment and playbook §6.7');
});
