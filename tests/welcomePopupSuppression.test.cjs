const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { build } = require('esbuild');

const root = path.resolve(__dirname, '..');

/**
 * Trigger and suppression behaviour of the exit-intent welcome popup.
 *
 * tests/newsletterPopupResponse.test.cjs already covers the submit/response
 * contract with useEffect stubbed out. This suite drives that effect for real
 * against a fake DOM, clock and storage, because the defects costing leads lived
 * there: a permanent `luxemia_popup_seen` key that never expired, and unguarded
 * localStorage access that threw before the popup could open or submit.
 */
const compiled = build({
  entryPoints: [path.join(root, 'src/components/home/NewVisitorPopup.tsx')],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  jsx: 'automatic',
  alias: { '@': path.join(root, 'src') },
  plugins: [{
    name: 'isolated-popup-dom',
    setup(b) {
      b.onResolve({ filter: /^(react(?:\/jsx-runtime)?|framer-motion|react-router-dom|lucide-react|sonner|@\/components\/ui\/button)$/ }, (a) => ({ path: a.path, namespace: 'fixture' }));
      b.onLoad({ filter: /.*/, namespace: 'fixture' }, (a) => ({
        loader: 'js',
        contents: {
          // useState is positional on purpose: NewVisitorPopup must not insert
          // state above the entries tests/newsletterPopupResponse.test.cjs feeds.
          react: 'export const useState = v => globalThis.popupFixture.useState(v);'
            + 'export const useEffect = cb => globalThis.popupFixture.effects.push(cb);'
            + 'export const useRef = v => ({ current: v });',
          'react/jsx-runtime': 'export const jsx = (type, props) => ({ type, props }); export const jsxs = jsx; export const Fragment = "fragment";',
          'framer-motion': 'export const motion = { div: "div" }; export const AnimatePresence = "presence";',
          'react-router-dom': 'export const useLocation = () => ({ pathname: globalThis.popupFixture.pathname });',
          'lucide-react': 'export const X = "icon", Sparkles = "icon", Clock = "icon", Check = "icon";',
          sonner: 'export const toast = { success: (...a) => globalThis.popupFixture.toasts.push(["success", ...a]), error: (...a) => globalThis.popupFixture.toasts.push(["error", ...a]) };',
          '@/components/ui/button': 'export const Button = "button";',
        }[a.path],
      }));
    },
  }],
});

const DAY_MS = 86_400_000;
const T0 = Date.parse('2026-11-25T12:00:00.000Z');
const POPUP_STATE_KEY = 'luxemia.welcomePopup.v2';
const LEGACY_POPUP_SEEN_KEY = 'luxemia_popup_seen';

function fakeStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    map,
    getItem: (key) => (map.has(String(key)) ? map.get(String(key)) : null),
    setItem: (key, value) => map.set(String(key), String(value)),
    removeItem: (key) => map.delete(String(key)),
  };
}

/** Storage whose every accessor throws, as Safari private mode does. */
function throwingStorage() {
  const boom = () => { throw new Error('SecurityError: storage is blocked'); };
  return { getItem: boom, setItem: boom, removeItem: boom };
}

function find(node, predicate) {
  if (!node || typeof node !== 'object') return undefined;
  if (Array.isArray(node)) return node.map((child) => find(child, predicate)).find(Boolean);
  if (predicate(node)) return node;
  return find(node.props?.children, predicate);
}

const findForm = (node) => find(node, (n) => n.type === 'form');

function collectText(node, into = []) {
  if (typeof node === 'string') into.push(node);
  else if (Array.isArray(node)) node.forEach((child) => collectText(child, into));
  else if (node && typeof node === 'object') collectText(node.props?.children, into);
  return into;
}

const panelText = (node) => collectText(node).join('').replace(/\s+/g, ' ');
const findCloseButton = (node) => find(node, (n) => n.type === 'button' && n.props?.['aria-label'] === 'Close popup');
const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), { status });

/**
 * Mount the popup once with a fake DOM, clock, storage and fetch.
 * Seeded useState slots: 0 isOpen, 1 email, 2 emailError, 3 isSubmitting,
 * 4 isSuccess, 5 discountCode, 6 alreadySubscribed.
 */
async function mount(options = {}) {
  const {
    pathname = '/',
    seed = {},
    storage = fakeStorage(seed),
    response = null,
    state = [true, 'shopper@example.test', null, false, false, null, false],
    consentPromptVisible = false,
  } = options;

  const fixture = {
    pathname,
    values: state,
    cursor: 0,
    writes: [],
    toasts: [],
    requests: [],
    copies: [],
    effects: [],
  };
  fixture.useState = (value) => {
    const index = fixture.cursor++;
    return [index < fixture.values.length ? fixture.values[index] : value, (next) => fixture.writes.push([index, next])];
  };

  let clock = T0;
  const timers = new Map();
  let nextTimerId = 1;
  const listeners = { window: new Map(), document: new Map() };
  const addListener = (target) => (type, handler) => {
    if (!listeners[target].has(type)) listeners[target].set(type, []);
    listeners[target].get(type).push(handler);
  };
  const removeListener = (target) => (type, handler) => {
    const handlers = listeners[target].get(type) || [];
    listeners[target].set(type, handlers.filter((existing) => existing !== handler));
  };

  const fakeWindow = {
    localStorage: storage,
    scrollY: 0,
    innerHeight: 800,
    setTimeout: (callback, ms) => {
      const id = nextTimerId++;
      timers.set(id, { callback, ms, due: clock + ms });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    addEventListener: addListener('window'),
    removeEventListener: removeListener('window'),
  };
  const fakeDocument = {
    getElementById: (id) => (consentPromptVisible && id === 'marketing-privacy-choices' ? { id } : null),
    addEventListener: addListener('document'),
    removeEventListener: removeListener('document'),
  };

  const saved = Object.fromEntries(
    ['popupFixture', 'window', 'document', 'localStorage', 'navigator', 'fetch'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  const realNow = Date.now;
  const realConsoleError = console.error;
  console.error = () => {};
  Object.defineProperties(globalThis, {
    popupFixture: { configurable: true, value: fixture },
    window: { configurable: true, value: fakeWindow },
    document: { configurable: true, value: fakeDocument },
    localStorage: { configurable: true, value: storage },
    navigator: { configurable: true, value: { clipboard: { writeText: async (value) => fixture.copies.push(value) } } },
    fetch: {
      configurable: true,
      value: async (...args) => {
        fixture.requests.push(args);
        if (response instanceof Error) throw response;
        return response;
      },
    },
  });
  Date.now = () => clock;

  const module = { exports: {} };
  new Function('require', 'module', 'exports', (await compiled).outputFiles[0].text)(require, module, module.exports);

  const api = {
    fixture,
    storage,
    /** Advance the clock, firing only timers that are actually due. */
    advance(ms) {
      const target = clock + ms;
      for (;;) {
        const due = [...timers.entries()]
          .filter(([, timer]) => timer.due <= target)
          .sort(([, a], [, b]) => a.due - b.due)[0];
        if (!due) break;
        const [id, timer] = due;
        timers.delete(id);
        clock = timer.due;
        timer.callback();
      }
      clock = target;
      return clock;
    },
    timerDelays() { return [...timers.values()].map((timer) => timer.ms); },
    mouseLeave(clientY = -1) {
      for (const handler of [...(listeners.document.get('mouseleave') || [])]) handler({ clientY });
    },
    scroll(scrollY, innerHeight = 800) {
      fakeWindow.scrollY = scrollY;
      fakeWindow.innerHeight = innerHeight;
      for (const handler of [...(listeners.window.get('scroll') || [])]) handler({});
    },
    listenerCount() {
      return [...listeners.window.values(), ...listeners.document.values()]
        .reduce((total, handlers) => total + handlers.length, 0);
    },
    popupState() {
      const raw = storage.map?.get(POPUP_STATE_KEY);
      return raw ? JSON.parse(raw) : null;
    },
    render() {
      fixture.cursor = 0;
      return module.exports.default();
    },
    /** Run the trigger effect exactly as React would on mount. */
    start() {
      const tree = api.render();
      assert.equal(fixture.effects.length, 1, 'one trigger effect');
      fixture.effects[0]();
      return tree;
    },
    async submit() {
      const form = findForm(api.render());
      assert(form, 'the popup renders its signup form');
      await form.props.onSubmit({ preventDefault() {} });
      return fixture;
    },
    close() {
      const button = findCloseButton(api.render());
      assert(button, 'the popup renders its close button');
      button.props.onClick({ preventDefault() {}, stopPropagation() {} });
      return fixture;
    },
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

const opened = (fixture) => fixture.writes.some(([index, value]) => index === 0 && value === true);

// ─── triggers still work ────────────────────────────────────────────────────

test('exit intent opens the popup once the shopper has browsed 12 seconds', async () => {
  const harness = await mount({ state: [false, '', null, false, false, null, false] });
  try {
    harness.start();
    assert.equal(harness.listenerCount(), 2, 'mouseleave + scroll are wired');
    assert.deepEqual(harness.timerDelays(), [45000], 'the backstop is 45s, not the old 4s');

    harness.mouseLeave(-1);
    assert.equal(opened(harness.fixture), false, 'an immediate bounce is not exit intent');

    harness.advance(12_000);
    harness.mouseLeave(-1);
    assert.equal(opened(harness.fixture), true);
    assert.equal(harness.listenerCount(), 0, 'the trigger cleans up after itself');
  } finally {
    harness.restore();
  }
});

test('a cursor leaving through the bottom or side is not exit intent', async () => {
  const harness = await mount({ state: [false, '', null, false, false, null, false] });
  try {
    harness.start();
    harness.advance(20_000);
    harness.mouseLeave(400);
    assert.equal(opened(harness.fixture), false);
    assert.equal(harness.listenerCount(), 2, 'the offer is still armed');
  } finally {
    harness.restore();
  }
});

test('scroll past 1.6 viewports opens the popup only after 25 seconds of engagement', async () => {
  const harness = await mount({ state: [false, '', null, false, false, null, false] });
  try {
    harness.start();
    harness.scroll(2000);
    assert.equal(opened(harness.fixture), false, 'scrolling immediately is not enough');
    harness.advance(25_000);
    harness.scroll(1000, 800);
    assert.equal(opened(harness.fixture), false, '1.25 viewports is short of the threshold');
    harness.scroll(1400, 800);
    assert.equal(opened(harness.fixture), true);
  } finally {
    harness.restore();
  }
});

test('the 45-second backstop still fires when nothing else does', async () => {
  const harness = await mount({ state: [false, '', null, false, false, null, false] });
  try {
    harness.start();
    harness.advance(44_999);
    assert.equal(opened(harness.fixture), false, 'the backstop must not fire early');
    harness.advance(1);
    assert.equal(opened(harness.fixture), true);
  } finally {
    harness.restore();
  }
});

test('decision screens never get the popup and register no listeners', async () => {
  for (const pathname of ['/product/red-bridal-lehenga-with-heavy-embroidery', '/meta-checkout', '/collections/customizable-indian-outfits']) {
    const harness = await mount({ pathname, state: [false, '', null, false, false, null, false] });
    try {
      harness.start();
      assert.equal(harness.listenerCount(), 0, pathname);
      assert.deepEqual(harness.timerDelays(), [], pathname);
      harness.advance(60_000);
      harness.mouseLeave(-1);
      assert.equal(opened(harness.fixture), false, pathname);
    } finally {
      harness.restore();
    }
  }
});

test('the offer waits for the privacy consent prompt instead of stacking on it', async () => {
  const harness = await mount({ consentPromptVisible: true, state: [false, '', null, false, false, null, false] });
  try {
    harness.start();
    harness.advance(45_000);
    assert.equal(opened(harness.fixture), false, 'the backstop must not stack over the consent prompt');
    assert.deepEqual(harness.timerDelays(), [15000], 'it reschedules instead');
  } finally {
    harness.restore();
  }
});

// ─── suppression is bounded ─────────────────────────────────────────────────

test('a recent dismissal suppresses the popup without registering listeners', async () => {
  const harness = await mount({
    state: [false, '', null, false, false, null, false],
    seed: { [POPUP_STATE_KEY]: JSON.stringify({ reason: 'dismissed', at: new Date(T0 - 2 * DAY_MS).toISOString() }) },
  });
  try {
    harness.start();
    assert.equal(harness.listenerCount(), 0);
    harness.advance(60_000);
    assert.equal(opened(harness.fixture), false);
  } finally {
    harness.restore();
  }
});

test('a 31-day-old dismissal no longer blocks the offer', async () => {
  const harness = await mount({
    state: [false, '', null, false, false, null, false],
    seed: { [POPUP_STATE_KEY]: JSON.stringify({ reason: 'dismissed', at: new Date(T0 - 31 * DAY_MS).toISOString() }) },
  });
  try {
    harness.start();
    assert.equal(harness.listenerCount(), 2, 'the expired dismissal must release the trigger');
    harness.advance(45_000);
    assert.equal(opened(harness.fixture), true);
  } finally {
    harness.restore();
  }
});

test('the legacy permanent key blocks for 30 days and then releases', async () => {
  const harness = await mount({
    state: [false, '', null, false, false, null, false],
    seed: { [LEGACY_POPUP_SEEN_KEY]: 'true' },
  });
  try {
    harness.start();
    assert.equal(opened(harness.fixture), false);
    const migrated = harness.popupState();
    assert.equal(migrated.reason, 'legacy-dismissal', 'the permanent flag is re-dated, not honoured forever');
    assert.equal(harness.storage.map.has(LEGACY_POPUP_SEEN_KEY), false);
  } finally {
    harness.restore();
  }

  const later = await mount({
    state: [false, '', null, false, false, null, false],
    seed: { [POPUP_STATE_KEY]: JSON.stringify({ reason: 'legacy-dismissal', at: new Date(T0 - 31 * DAY_MS).toISOString() }) },
  });
  try {
    later.start();
    later.advance(45_000);
    assert.equal(opened(later.fixture), true, 'a previously blocked visitor gets the offer back');
  } finally {
    later.restore();
  }
});

test('closing the popup records a bounded dismissal, not a permanent one', async () => {
  const harness = await mount({ state: [true, '', null, false, false, null, false] });
  try {
    harness.close();
    assert.equal(harness.fixture.writes.some(([index, value]) => index === 0 && value === false), true);
    assert.equal(harness.popupState().reason, 'dismissed');
  } finally {
    harness.restore();
  }
});

// ─── blocked storage cannot block a lead ────────────────────────────────────

test('a browser that blocks storage still gets the popup and can still subscribe', async () => {
  const harness = await mount({
    storage: throwingStorage(),
    response: jsonResponse({ success: true, discountCode: 'IGNORED' }),
  });
  try {
    harness.start();
    assert.equal(harness.listenerCount(), 2, 'the trigger effect must survive a throwing getItem');
    harness.advance(45_000);
    assert.equal(opened(harness.fixture), true);

    await harness.submit();
    assert.equal(harness.fixture.requests.length, 1, 'the submit reached the network');
    assert.equal(harness.fixture.writes.some(([index, value]) => index === 4 && value === true), true);
    assert.deepEqual(harness.fixture.copies, ['FIRST10'], 'the local offer code is shown, not the response value');
    assert(harness.fixture.toasts.some(([kind]) => kind === 'success'));
  } finally {
    harness.restore();
  }
});

// ─── duplicate submissions ──────────────────────────────────────────────────

test('a repeat address is told it is already subscribed, with the qualified code line', async () => {
  const harness = await mount({ response: jsonResponse({ success: true, duplicate: true, discountCode: 'UNTRUSTED' }) });
  try {
    await harness.submit();
    const success = harness.fixture.toasts.find(([kind]) => kind === 'success');
    assert(success, 'a duplicate is a success, not an error');
    assert.equal(success[1], "You're subscribed! Use code FIRST10 at checkout.");
    assert.equal(
      harness.fixture.writes.some(([index, value]) => index === 6 && value === true),
      true,
      'the duplicate flag drives the success panel',
    );
    assert.equal(harness.popupState().reason, 'subscribed', 'a subscriber is never re-prompted');
    assert.doesNotMatch(JSON.stringify(harness.fixture.toasts), /UNTRUSTED/);
    assert.doesNotMatch(JSON.stringify(harness.fixture.toasts), /check your inbox|email.*sent/i);
  } finally {
    harness.restore();
  }
});

test('a first-time signup keeps the welcome wording and records a signup', async () => {
  const harness = await mount({ response: jsonResponse({ success: true, discountCode: 'FIRST10' }) });
  try {
    await harness.submit();
    const success = harness.fixture.toasts.find(([kind]) => kind === 'success');
    assert.equal(success[1], 'Welcome to LuxeMia! Your discount code is ready.');
    assert.equal(harness.fixture.writes.some(([index, value]) => index === 6 && value === true), false);
    assert.equal(harness.popupState().reason, 'subscribed');
  } finally {
    harness.restore();
  }
});

test('the duplicate success panel names the code with its real conditions', async () => {
  const harness = await mount({ state: [true, '', null, false, true, 'FIRST10', true] });
  try {
    const text = panelText(harness.render());
    assert.match(text, /You're Subscribed/);
    assert.match(text, /Use code FIRST10 at checkout — 10% off an eligible first order\. One use per customer\. Final eligibility is confirmed at checkout\./);
    assert.match(text, /no second signup was created/);
    // `\'` inside JSX text renders a literal backslash; tsc cannot catch that.
    assert.doesNotMatch(text, /\\/, 'no escape characters leak into the copy');
    // The first-time panel must not claim the shopper was already subscribed.
    const firstTime = await mount({ state: [true, '', null, false, true, 'FIRST10', false] });
    try {
      const firstTimeText = panelText(firstTime.render());
      assert.match(firstTimeText, /You're In/);
      assert.doesNotMatch(firstTimeText, /already on the list/);
      assert.match(firstTimeText, /One use per customer\. Apply it at checkout, where eligibility is confirmed\./);
    } finally {
      firstTime.restore();
    }
  } finally {
    harness.restore();
  }
});

test('closing the success panel does not downgrade a signup to a dismissal', async () => {
  const harness = await mount({
    state: [true, '', null, false, true, 'FIRST10', true],
    seed: { [POPUP_STATE_KEY]: JSON.stringify({ reason: 'subscribed', at: new Date(T0).toISOString() }) },
  });
  try {
    harness.close();
    assert.equal(harness.popupState().reason, 'subscribed');
  } finally {
    harness.restore();
  }
});

test('a failed submit records no suppression at all', async () => {
  const harness = await mount({ response: jsonResponse({ error: 'unavailable' }, 503) });
  try {
    await harness.submit();
    assert.equal(harness.popupState(), null, 'a shopper who could not subscribe must still be offered the popup');
    assert(harness.fixture.toasts.some(([kind]) => kind === 'error'));
  } finally {
    harness.restore();
  }
});

test('the request body still names the popup as the lead source', async () => {
  const harness = await mount({ response: jsonResponse({ success: true }) });
  try {
    await harness.submit();
    const [url, options] = harness.fixture.requests[0];
    assert.match(url, /\/functions\/v1\/submit-email$/);
    const body = JSON.parse(options.body);
    assert.equal(body.type, 'newsletter', 'this is the path that writes newsletter_subscribers');
    assert.equal(body.source, 'welcome_popup');
    assert.match(body.source, /^[a-z][a-z0-9_]{0,63}$/, 'the newsletter_subscribers source CHECK constraint');
    assert.equal(body.email, 'shopper@example.test');
    assert.doesNotMatch(options.body, /supabase\.co\/rest|apikey/i, 'no direct table write from the browser');
  } finally {
    harness.restore();
  }
});
