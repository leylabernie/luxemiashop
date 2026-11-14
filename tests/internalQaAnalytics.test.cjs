const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const measurementId = 'G-D1NN0TC3Y0';
const previewHost = 'luxemiashop-synthetic-deployment.vercel.app';
const previewEnv = {
  VERCEL_ENV: 'preview',
  VERCEL_GIT_COMMIT_REF: 'ga4-linker-real-link',
  VERCEL_URL: previewHost,
};
const optInQuery = '?luxemia_linker_test=2026-11-13';
const beforeExpiry = Date.parse('2026-11-14T04:59:59Z');
const expiry = Date.parse('2026-11-14T05:00:00Z');
function bundle(entry) {
  return buildSync({ entryPoints: [path.join(root, entry)], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external' }).outputFiles[0].text;
}
function load(code, env = {}) {
  const module = { exports: {} };
  new Function('require', 'module', 'exports', 'process', code)(require, module, module.exports, { env });
  return module.exports;
}
const previewConfig = load(bundle('src/config/previewAnalytics.ts'));
const generatorCode = bundle('src/middleware/htmlGenerator.ts');
const fixture = {
  id: 'gid://shopify/Product/1', handle: 'synthetic-analytics-only', title: 'Synthetic garment',
  productType: 'Lehenga', vendor: 'LuxeMia', description: 'Synthetic public product fixture.',
  tags: [], availableForSale: true, options: [], images: { edges: [] },
  priceRange: { minVariantPrice: { amount: '10', currencyCode: 'USD' } },
  variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/1', title: 'Default Title',
    selectedOptions: [], price: { amount: '10', currencyCode: 'USD' }, availableForSale: true } }] },
};
function analyticsScript(source) {
  return [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .map(match => match[1]).find(script => script.includes('window.luxemiaAnalyticsEnabled'));
}
function scriptsForEnv(env = {}) {
  const config = previewConfig.getPreviewAnalyticsConfig(env);
  const index = previewConfig.injectPreviewAnalyticsConfig(read('index.html'), config);
  const { generateProductHtml } = load(generatorCode, env);
  return [analyticsScript(index), analyticsScript(generateProductHtml(fixture, 'https://luxemia.shop/product/synthetic-analytics-only'))];
}
const scripts = scriptsForEnv();
const previewScripts = scriptsForEnv(previewEnv);
function run(script, { host = 'luxemia.shop', search = '', storage = new Map(), blocked = false,
  idle = true, now = beforeExpiry, flush = true } = {}) {
  const scheduled = [], loaded = [];
  const clock = { now };
  class TestDate extends Date {
    constructor(...args) { super(...(args.length ? args : [clock.now])); }
    static now() { return clock.now; }
  }
  const consent = ['consent', 'default', { analytics_storage: 'denied' }];
  const context = { URLSearchParams, Date: TestDate, location: { hostname: host, search }, dataLayer: [consent],
    sessionStorage: {
      getItem(k) { if (blocked) throw Error('blocked'); return storage.get(k); },
      setItem(k, v) { if (blocked) throw Error('blocked'); storage.set(k, v); },
      removeItem(k) { if (blocked) throw Error('blocked'); storage.delete(k); },
    },
    document: { createElement: () => ({}), head: { appendChild: s => loaded.push(s) } },
    addEventListener: (_n, cb) => scheduled.push(cb), setTimeout: cb => scheduled.push(cb),
  };
  context.window = context;
  if (idle) context.requestIdleCallback = cb => scheduled.push(cb);
  vm.runInNewContext(script, context);
  const flushScheduled = () => { while (scheduled.length) scheduled.shift()(); };
  if (flush) flushScheduled();
  return { context, loaded, consent, storage, clock, flushScheduled };
}
function assertLinkerAndConfig(context, surfaceIndex) {
  const queue = context.dataLayer.map(command => Array.from(command));
  const linkerIndex = queue.findIndex(command => command[0] === 'set' && command[1] === 'linker');
  const configIndex = queue.findIndex(command => command[0] === 'config' && command[1] === measurementId);
  assert.ok(linkerIndex >= 0 && configIndex > linkerIndex, 'Exact linker must precede config');
  assert.equal(queue.filter(command => command[0] === 'set' && command[1] === 'linker').length, 1);
  assert.deepEqual(Array.from(queue[linkerIndex][2].domains), ['luxemia.shop', 'lovable-project-zlh0w.myshopify.com']);
  assert.deepEqual(Object.keys(queue[linkerIndex][2]), ['domains']);
  const config = queue[configIndex];
  assert.equal(config[2].send_page_view, Boolean(surfaceIndex));
  assert.equal(config[2].allow_google_signals, true);
  assert.equal(Object.hasOwn(config[2], 'linked_domains'), false);
}
for (const [i, script] of scripts.entries()) {
  const surface = i ? 'generated product HTML' : 'app bootstrap';
  const previewScript = previewScripts[i];
  for (const host of ['luxemia.shop', 'www.luxemia.shop']) test(`${surface}: normal ${host} preserves destination and page-view config`, () => {
    const { context, loaded, consent } = run(script, { host });
    assert.equal(context.luxemiaAnalyticsEnabled, true);
    assert.equal(context.dataLayer[0], consent);
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0].src, `https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
    assertLinkerAndConfig(context, i);
    const previousLength = context.dataLayer.length;
    context.gtag('event', 'add_to_cart', { value: 10 });
    assert.equal(context.dataLayer.length, previousLength + 1);
  });
  for (const host of [previewHost, 'luxemiashop-preview.vercel.app', 'luxemiashop.vercel.app', 'localhost',
    '127.0.0.1', 'luxemia.shop.example.com', 'example.com']) test(`${surface}: unapproved ${host} never loads or queues GA`, () => {
    const { context, loaded, consent } = run(script, { host, search: `${optInQuery}&luxemia_qa=0` });
    context.gtag('event', 'page_view', {}); context.gtag('event', 'purchase', {});
    assert.equal(context.luxemiaAnalyticsEnabled, false);
    assert.equal(loaded.length, 0); assert.deepEqual(context.dataLayer, [consent]);
  });
  test(`${surface}: QA opt-in persists only in session and clear restores next load`, () => {
    const storage = new Map(); let state = run(script, { search: '?luxemia_qa=1', storage });
    assert.equal(state.context.luxemiaAnalyticsEnabled, false); assert.equal(state.loaded.length, 0);
    state.context.gtag('event', 'begin_checkout', {}); assert.equal(state.context.dataLayer.length, 1);
    assert.deepEqual([...storage.entries()], [['luxemia.analytics.qa', '1']]);
    state = run(script, { storage }); assert.equal(state.context.luxemiaAnalyticsEnabled, false);
    state = run(script, { search: '?luxemia_qa=0', storage });
    assert.equal(state.context.luxemiaAnalyticsEnabled, true); assert.equal(storage.size, 0);
    assert.equal(run(script, { storage }).context.luxemiaAnalyticsEnabled, true);
  });
  test(`${surface}: blocked storage still respects QA; invalid QA values do not opt in`, () => {
    assert.equal(run(script, { search: '?luxemia_qa=1', blocked: true }).context.luxemiaAnalyticsEnabled, false);
    assert.equal(run(script, { search: '?luxemia_qa=0', blocked: true }).context.luxemiaAnalyticsEnabled, true);
    assert.equal(run(script, { search: '?luxemia_qa=yes' }).context.luxemiaAnalyticsEnabled, true);
    assert.equal(run(script, { blocked: true }).context.luxemiaAnalyticsEnabled, true);
  });
  test(`${surface}: load fallback remains suppressed during QA`, () => {
    assert.equal(run(script, { search: '?luxemia_qa=1', idle: false }).loaded.length, 0);
    assert.equal(run(script, { idle: false }).loaded.length, 1);
  });
  test(`${surface}: approved preview requires exact opt-in, then preserves linker/config`, () => {
    for (const search of ['', '?luxemia_qa=0', '?luxemia_linker_test=1', '?luxemia_linker_test=2026-11-12',
      '?luxemia_linker_test=2026-11-13-extra']) {
      const state = run(previewScript, { host: previewHost, search });
      assert.equal(state.context.luxemiaAnalyticsEnabled, false, search);
      assert.equal(state.loaded.length, 0); assert.deepEqual(state.context.dataLayer, [state.consent]);
    }
    const state = run(previewScript, { host: previewHost, search: optInQuery });
    assert.equal(state.context.luxemiaAnalyticsEnabled, true); assert.equal(state.loaded.length, 1);
    assertLinkerAndConfig(state.context, i);
  });
  test(`${surface}: preview opt-in is tab-scoped and bound to the exact deployment hostname`, () => {
    const storage = new Map();
    assert.equal(run(previewScript, { host: previewHost, search: optInQuery, storage }).context.luxemiaAnalyticsEnabled, true);
    assert.deepEqual([...storage.entries()], [['luxemia.analytics.linker-test', `${previewHost}|2026-11-13`]]);
    assert.equal(run(previewScript, { host: previewHost, storage }).context.luxemiaAnalyticsEnabled, true);
    assert.equal(run(previewScript, { host: previewHost }).context.luxemiaAnalyticsEnabled, false, 'Fresh tab has no opt-in');
    for (const host of ['luxemiashop-preview.vercel.app', `alias.${previewHost}`, `${previewHost}.example.com`, 'localhost']) {
      const state = run(previewScript, { host, search: optInQuery, storage });
      assert.equal(state.context.luxemiaAnalyticsEnabled, false, host);
      assert.equal(state.loaded.length, 0); assert.deepEqual(state.context.dataLayer, [state.consent]);
    }
    const otherEnv = { ...previewEnv, VERCEL_URL: 'another-exact-deployment.vercel.app' };
    const otherScript = scriptsForEnv(otherEnv)[i];
    assert.equal(run(otherScript, { host: otherEnv.VERCEL_URL, storage }).context.luxemiaAnalyticsEnabled, false,
      'Even reused storage cannot authorize a different deployment hostname');
  });
  test(`${surface}: preview opt-in with blocked storage applies only to this document`, () => {
    assert.equal(run(previewScript, { host: previewHost, search: optInQuery, blocked: true }).context.luxemiaAnalyticsEnabled, true);
    const state = run(previewScript, { host: previewHost, blocked: true });
    assert.equal(state.context.luxemiaAnalyticsEnabled, false); assert.equal(state.loaded.length, 0);
  });
  test(`${surface}: QA suppression wins over explicit and persisted preview enablement`, () => {
    const storage = new Map();
    let state = run(previewScript, { host: previewHost, search: `${optInQuery}&luxemia_qa=1`, storage });
    assert.equal(state.context.luxemiaAnalyticsEnabled, false); assert.equal(state.loaded.length, 0);
    state.context.gtag('event', 'begin_checkout', {}); assert.deepEqual(state.context.dataLayer, [state.consent]);
    state = run(previewScript, { host: previewHost, storage });
    assert.equal(state.context.luxemiaAnalyticsEnabled, false); assert.equal(state.loaded.length, 0);
    state = run(previewScript, { host: previewHost, search: '?luxemia_qa=0', storage });
    assert.equal(state.context.luxemiaAnalyticsEnabled, true);
    state = run(previewScript, { host: previewHost, search: `${optInQuery}&luxemia_qa=1`, blocked: true });
    assert.equal(state.context.luxemiaAnalyticsEnabled, false); assert.equal(state.loaded.length, 0);
  });
  test(`${surface}: preview expires at the exact UTC deadline, including persisted opt-in`, () => {
    const storage = new Map();
    run(previewScript, { host: previewHost, search: optInQuery, storage });
    for (const now of [expiry, expiry + 1, Date.parse('2026-11-15T00:00:00Z')]) {
      for (const search of ['', optInQuery]) {
        const state = run(previewScript, { host: previewHost, search, storage, now });
        assert.equal(state.context.luxemiaAnalyticsEnabled, false);
        assert.equal(state.loaded.length, 0); assert.deepEqual(state.context.dataLayer, [state.consent]);
      }
    }
    for (const host of ['luxemia.shop', 'www.luxemia.shop']) {
      assert.equal(run(previewScript, { host, now: expiry + 1 }).context.luxemiaAnalyticsEnabled, true,
        'Preview expiry must not disable customer production hosts');
    }
  });
  test(`${surface}: an already-open preview tab cannot emit after expiry`, () => {
    const state = run(previewScript, { host: previewHost, search: optInQuery });
    assert.equal(state.context.luxemiaAnalyticsEnabled, true);
    const previousLength = state.context.dataLayer.length;
    state.clock.now = expiry;
    assert.equal(state.context.luxemiaAnalyticsEnabled, false);
    state.context.gtag('event', 'begin_checkout', {});
    assert.equal(state.context.dataLayer.length, previousLength);
  });
  if (i === 0) test(`${surface}: deferred download cannot cross the preview deadline`, () => {
    for (const idle of [true, false]) {
      const state = run(previewScript, { host: previewHost, search: optInQuery, idle, flush: false });
      state.clock.now = expiry; state.flushScheduled(); assert.equal(state.loaded.length, 0);
    }
  });
}
test('app and real generated product HTML have identical host/session/deadline policy', () => {
  const policy = s => s.slice(s.indexOf('window.luxemiaAnalyticsEnabled = false;'), s.indexOf('      })();') + 11).trim();
  assert.equal(policy(scripts[0]), policy(scripts[1]));
  assert.equal(policy(previewScripts[0]), policy(previewScripts[1]));
});
test('only exact preview environment and branch with a valid bare deployment hostname can approve preview analytics', () => {
  assert.deepEqual(previewConfig.getPreviewAnalyticsConfig(previewEnv), {
    hostname: previewHost, optIn: '2026-11-13', expiresAt: '2026-11-14T05:00:00Z',
  });
  for (const env of [{}, { ...previewEnv, VERCEL_ENV: 'production' }, { ...previewEnv, VERCEL_ENV: 'development' },
    { ...previewEnv, VERCEL_ENV: 'Preview' }, { ...previewEnv, VERCEL_GIT_COMMIT_REF: 'main' },
    { ...previewEnv, VERCEL_GIT_COMMIT_REF: 'ga4-linker-real-link-extra' },
    ...[undefined, '', '*', '*.vercel.app', 'https://fixture.vercel.app', 'fixture.vercel.app/path',
      'fixture.vercel.app:443', 'fixture.vercel.app?x=1', 'fixture.vercel.app#x', ' fixture.vercel.app',
      'fixture.vercel.app.', 'fixture..vercel.app', '<script>.vercel.app', 'localhost']
      .map(VERCEL_URL => ({ ...previewEnv, VERCEL_URL }))]) {
    assert.equal(previewConfig.getPreviewAnalyticsConfig(env), null, JSON.stringify(env));
    for (const script of scriptsForEnv(env)) {
      const state = run(script, { host: previewHost, search: optInQuery });
      assert.equal(state.context.luxemiaAnalyticsEnabled, false);
      assert.equal(state.loaded.length, 0); assert.deepEqual(state.context.dataLayer, [state.consent]);
    }
  }
});
test('Vite embeds only build-scoped deployment approval and snapshots it before environment changes', async () => {
  const names = ['VERCEL_ENV', 'VERCEL_GIT_COMMIT_REF', 'VERCEL_URL'];
  const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
  try {
    Object.assign(process.env, previewEnv);
    const { resolveConfig } = await import('vite');
    const config = await resolveConfig({ root, configFile: path.join(root, 'vite.config.ts'), mode: 'production' }, 'build');
    const plugin = config.plugins.find(plugin => plugin.name === 'analytics-preview-bootstrap');
    assert.ok(plugin); assert.equal(plugin.apply, 'build');
    process.env.VERCEL_ENV = 'production'; process.env.VERCEL_URL = 'different-alias.vercel.app';
    const builtHtml = plugin.transformIndexHtml(read('index.html'));
    assert.equal(analyticsScript(builtHtml), previewScripts[0], 'Approved hostname was snapshotted, not read on each request');
    const production = await resolveConfig({ root, configFile: path.join(root, 'vite.config.ts'), mode: 'production' }, 'build');
    const productionHtml = production.plugins.find(plugin => plugin.name === 'analytics-preview-bootstrap').transformIndexHtml(read('index.html'));
    assert.equal(analyticsScript(productionHtml), scripts[0]);
    const serving = await resolveConfig({ root, configFile: path.join(root, 'vite.config.ts'), mode: 'development' }, 'serve');
    assert.equal(serving.plugins.some(plugin => plugin.name === 'analytics-preview-bootstrap'), false);
    const { generateProductHtml } = load(generatorCode, previewEnv);
    previewEnv.VERCEL_URL = 'mutated-after-module-load.vercel.app';
    try {
      assert.equal(analyticsScript(generateProductHtml(fixture, 'https://luxemia.shop/product/synthetic-analytics-only')), previewScripts[1],
        'Middleware also snapshots deployment approval at module initialization');
    } finally { previewEnv.VERCEL_URL = previewHost; }
  } finally {
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name]; else process.env[name] = previous[name];
    }
  }
});
test('all analytics helpers, including SPA page views, respect QA guard even with another gtag function', () => {
  const code = buildSync({ entryPoints: [path.join(root, 'src/hooks/useAnalytics.ts')], bundle: true, write: false,
    platform: 'node', format: 'cjs', external: ['react', 'react-router-dom'] }).outputFiles[0].text;
  const events = []; const window = { addEventListener() {}, luxemiaAnalyticsEnabled: false,
    location: { href: 'https://luxemia.shop/' }, gtag: (...x) => events.push(x) };
  const module = { exports: {} };
  const req = name => name === 'react' ? { useEffect: cb => cb() } : { useLocation: () => ({ pathname: '/', search: '' }) };
  new Function('require', 'module', 'exports', 'window', 'document', code)(req, module, module.exports, window, { title: 'Test' });
  const api = module.exports; const item = { id: '1', name: 'Public product', price: 10 };
  const exercise = () => {
    api.usePageTracking(); api.trackViewItem(item); api.trackAddToCart(item); api.trackRemoveFromCart(item); api.trackViewCart([item]);
    api.trackViewItemList([item], 'list', 'List'); api.trackSelectItem(item, 'list', 'List'); api.trackAddToWishlist(item);
    api.trackBeginCheckout([item]); api.trackCheckoutHandoffSuccess([item]); api.trackAddShippingInfo([item], 10, 'standard'); api.trackAddPaymentInfo([item], 10);
    api.trackPurchase({ transactionId: 'SYNTHETIC-LOCAL-ONLY', value: 10, items: [item] });
    api.trackRefund({ transactionId: 'SYNTHETIC-LOCAL-ONLY', value: 10, items: [item] });
    api.trackConsultationSubmission({}); api.trackConsultationBookingAttempt('email');
  };
  exercise(); assert.equal(events.length, 0); window.luxemiaAnalyticsEnabled = true; exercise(); assert.equal(events.length, 16);
});
