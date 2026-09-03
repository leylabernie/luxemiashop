#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { buildSync, transformSync } = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const CONSENT_MODULE = path.join(ROOT, 'src/lib/analyticsConsent.ts');
const ANALYTICS_PRIVACY_MODULE = path.join(ROOT, 'src/lib/analyticsPrivacy.ts');
const ANALYTICS_HOOK_MODULE = path.join(ROOT, 'src/hooks/useAnalytics.ts');
const GOOGLE_LOADER = 'googletagmanager.com/gtag/js';
const GOOGLE_TRACKING_HOSTS = [
  GOOGLE_LOADER,
  'googletagmanager.com/gtm.js',
  'googletagmanager.com/ns.html',
  'google-analytics.com',
  'googleadservices.com',
  'googlesyndication.com',
  'doubleclick.net',
];
const REQUIRE_BUILT = process.argv.includes('--require-built');
const BUILT_DIR_ARGUMENT = process.argv.find((argument) => argument.startsWith('--built-dir='));
const BUILT_DIRECTORY = BUILT_DIR_ARGUMENT
  ? path.resolve(BUILT_DIR_ARGUMENT.slice('--built-dir='.length))
  : path.join(ROOT, 'dist');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function walkFiles(directory, extensions) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkFiles(absolutePath, extensions);
    return extensions.has(path.extname(entry.name)) ? [absolutePath] : [];
  });
}

function validateStaticSources() {
  for (const relativePath of ['index.html', 'src/middleware/htmlGenerator.ts']) {
    const source = read(relativePath);
    assert.equal(
      GOOGLE_TRACKING_HOSTS.some((hostname) => source.includes(hostname)),
      false,
      `${relativePath} must not load Google Analytics before consent`,
    );
    assert.equal(
      /gtag\s*\(\s*['"]config['"]/.test(source),
      false,
      `${relativePath} must not configure Google Analytics before consent`,
    );
  }

  const patchableSources = [
    path.join(ROOT, 'index.html'),
    ...walkFiles(path.join(ROOT, 'scripts'), new Set(['.cjs', '.js', '.mjs'])),
    ...walkFiles(path.join(ROOT, 'src'), new Set(['.ts', '.tsx', '.js', '.jsx'])),
    ...walkFiles(path.join(ROOT, 'docs'), new Set(['.html', '.js', '.md'])),
  ].filter((filePath) => filePath !== __filename && filePath !== CONSENT_MODULE);

  const unexpectedLoaders = patchableSources.filter((filePath) => {
    const source = fs.readFileSync(filePath, 'utf8');
    return GOOGLE_TRACKING_HOSTS.some((hostname) => source.includes(hostname))
      || /gtag\s*\(\s*['"]config['"]/.test(source);
  });
  assert.deepEqual(
    unexpectedLoaders.map((filePath) => path.relative(ROOT, filePath)),
    [],
    'Only the consent-gated client module may contain the Google Analytics loader',
  );

  const consentSource = fs.readFileSync(CONSENT_MODULE, 'utf8');
  assert.match(consentSource, /if \(!isAnalyticsConsentGranted\(\)\) return false;/);
  assert.match(consentSource, /ad_storage:\s*['"]denied['"]/);
  assert.match(consentSource, /allow_google_signals:\s*false/);

  const analyticsHookSource = read('src/hooks/useAnalytics.ts');
  assert.doesNotMatch(analyticsHookSource, /location\.search|window\.location\.href/);
  assert.match(
    analyticsHookSource,
    /const sendConsentGatedEvent[\s\S]*?!isAnalyticsConsentGranted\(\)[\s\S]*?!initializeAnalyticsFromStoredConsent\(\)[\s\S]*?window\.gtag\('event'/,
    'the shared event sender must verify consent and initialize the gated loader before dispatch',
  );

  const directEventSources = walkFiles(path.join(ROOT, 'src'), new Set(['.ts', '.tsx', '.js', '.jsx']))
    .filter((filePath) => filePath !== CONSENT_MODULE && filePath !== ANALYTICS_HOOK_MODULE)
    .filter((filePath) => /(?:window\s*\.\s*)?gtag(?:\s*\?\.)?\s*\(/.test(fs.readFileSync(filePath, 'utf8')));
  assert.deepEqual(
    directEventSources.map((filePath) => path.relative(ROOT, filePath)),
    [],
    'storefront sources must route analytics events through the consent-gated helpers',
  );

  const assignedCallSites = [
    ['src/pages/Contact.tsx', /trackLeadSubmission\('contact_form'\)/],
    ['src/pages/CustomizableOutfits.tsx', /trackLeadSubmission\('custom_order_form'\)/],
    ['src/pages/NotFound.tsx', /trackPageNotFound\(\)/],
  ];
  for (const [relativePath, helperCall] of assignedCallSites) {
    assert.match(read(relativePath), helperCall, `${relativePath} must use its consent-gated analytics helper`);
  }
}

function loadConsentModule(storedChoice = null, storageFailures = {}) {
  const transpiled = buildSync({
    bundle: true,
    entryPoints: [CONSENT_MODULE],
    format: 'cjs',
    platform: 'browser',
    target: 'es2020',
    write: false,
  }).outputFiles[0].text;

  const storedValues = new Map();
  if (storedChoice) storedValues.set('luxemia.analytics-consent.v1', storedChoice);

  const appendedScripts = [];
  const elementsById = new Map();
  const dispatchedEvents = [];
  const eventListeners = new Map();
  const cookieWrites = [];
  let cookieHeader = '_ga=stale; _ga_D1NN0TC3Y0=stale';
  const document = {
    referrer: 'https://referrer.example/path?email=jane@example.com',
    createElement(tagName) {
      assert.equal(tagName, 'script');
      const element = {
        async: false,
        id: '',
        src: '',
        remove() {
          elementsById.delete(element.id);
        },
      };
      return element;
    },
    getElementById(id) {
      return elementsById.get(id) || null;
    },
    head: {
      appendChild(element) {
        elementsById.set(element.id, element);
        appendedScripts.push(element);
      },
    },
  };
  Object.defineProperty(document, 'cookie', {
    get() {
      return cookieHeader;
    },
    set(value) {
      cookieWrites.push(value);
      cookieHeader = cookieHeader
        .split(';')
        .filter((cookie) => !value.startsWith(`${cookie.split('=')[0].trim()}=`))
        .join(';');
    },
  });

  const window = {
    addEventListener(type, listener) {
      const listeners = eventListeners.get(type) || [];
      listeners.push(listener);
      eventListeners.set(type, listeners);
    },
    dispatchEvent(event) {
      dispatchedEvents.push(event);
      for (const listener of eventListeners.get(event.type) || []) listener(event);
    },
    localStorage: {
      getItem(key) {
        if (storageFailures.read) throw new Error('storage read blocked');
        return storedValues.get(key) || null;
      },
      setItem(key, value) {
        if (storageFailures.write) throw new Error('storage write blocked');
        storedValues.set(key, value);
      },
      removeItem(key) {
        storedValues.delete(key);
      },
    },
    location: {
      hostname: 'luxemia.shop',
      href: 'https://luxemia.shop/order-confirmation?email=jane@example.com&order_id=1042',
    },
  };

  class MockEvent {
    constructor(type) {
      this.type = type;
    }
  }

  class MockCustomEvent extends MockEvent {
    constructor(type, init = {}) {
      super(type);
      this.detail = init.detail;
    }
  }

  const module = { exports: {} };
  const context = vm.createContext({
    CustomEvent: MockCustomEvent,
    Event: MockEvent,
    console,
    document,
    exports: module.exports,
    module,
    URL,
    window,
  });
  vm.runInContext(transpiled, context, { filename: CONSENT_MODULE });

  return {
    api: module.exports,
    appendedScripts,
    cookieWrites,
    dispatchedEvents,
    document,
    storedValues,
    triggerStorageChoice(choice) {
      if (choice === null) storedValues.delete('luxemia.analytics-consent.v1');
      else storedValues.set('luxemia.analytics-consent.v1', choice);
      for (const listener of eventListeners.get('storage') || []) {
        listener({
          key: 'luxemia.analytics-consent.v1',
          newValue: choice,
        });
      }
    },
    triggerStorageClear() {
      storedValues.clear();
      for (const listener of eventListeners.get('storage') || []) {
        listener({ key: null, newValue: null });
      }
    },
    window,
  };
}

function validateRuntimeGate() {
  for (const storedChoice of [null, 'declined']) {
    const simulation = loadConsentModule(storedChoice);
    assert.equal(simulation.api.enableAnalytics(), false, 'the loader guard must reject a direct call without accepted consent');
    const enabled = simulation.api.initializeAnalyticsFromStoredConsent();
    assert.equal(enabled, false, `${storedChoice || 'no choice'} must keep analytics disabled`);
    assert.equal(simulation.appendedScripts.length, 0, `${storedChoice || 'no choice'} must not create a Google script`);
    assert.equal(simulation.window.gtag, undefined, `${storedChoice || 'no choice'} must not expose gtag`);
    assert.equal(simulation.window.dataLayer, undefined, `${storedChoice || 'no choice'} must not create a data layer`);
    assert.equal(simulation.appendedScripts.length, 0);
  }

  const firstTimeAcceptance = loadConsentModule();
  firstTimeAcceptance.api.setAnalyticsConsent('accepted');
  assert.equal(firstTimeAcceptance.storedValues.get('luxemia.analytics-consent.v1'), 'accepted');
  assert.equal(firstTimeAcceptance.appendedScripts.length, 1, 'the first-time UI path must enable analytics after acceptance');
  assert.equal(firstTimeAcceptance.dispatchedEvents.length, 1);
  assert.equal(firstTimeAcceptance.dispatchedEvents[0].type, 'luxemia:analytics-consent-changed');
  assert.equal(firstTimeAcceptance.dispatchedEvents[0].detail.choice, 'accepted');

  const accepted = loadConsentModule('accepted');
  assert.equal(accepted.api.initializeAnalyticsFromStoredConsent(), true);
  assert.equal(accepted.api.initializeAnalyticsFromStoredConsent(), true);
  assert.equal(accepted.appendedScripts.length, 1, 'accepted consent must load Google Analytics once');
  assert.equal(accepted.appendedScripts[0].id, 'luxemia-ga4-script');
  assert.equal(
    accepted.appendedScripts[0].src,
    'https://www.googletagmanager.com/gtag/js?id=G-D1NN0TC3Y0',
  );
  assert.equal(typeof accepted.window.gtag, 'function');

  const commands = Array.from(accepted.window.dataLayer, (entry) => entry[0]);
  assert.deepEqual(commands, ['consent', 'js', 'config']);
  assert.equal(accepted.window.dataLayer[0][2].analytics_storage, 'granted');
  assert.equal(accepted.window.dataLayer[0][2].ad_storage, 'denied');
  assert.equal(accepted.window.dataLayer[2][2].allow_google_signals, false);
  assert.equal(accepted.window.dataLayer[2][2].page_location, 'https://luxemia.shop/order-confirmation');
  assert.equal(accepted.window.dataLayer[2][2].page_referrer, 'https://referrer.example');
  assert.equal(accepted.window['ga-disable-G-D1NN0TC3Y0'], false);

  accepted.storedValues.delete('luxemia.analytics-consent.v1');
  assert.equal(accepted.api.isAnalyticsConsentGranted(), false, 'a cleared consent record must fail closed');
  const queuedCommandCount = accepted.window.dataLayer.length;
  accepted.window.gtag('event', 'generate_lead', { lead_source: 'test' });
  assert.equal(accepted.window.dataLayer.length, queuedCommandCount, 'the global event queue must also fail closed');
  accepted.storedValues.set('luxemia.analytics-consent.v1', 'accepted');

  accepted.api.setAnalyticsConsent('declined');
  assert.equal(accepted.window.gtag, undefined, 'withdrawing consent must stop future storefront events');
  assert.equal(accepted.window['ga-disable-G-D1NN0TC3Y0'], true);
  assert.equal(accepted.storedValues.get('luxemia.analytics-consent.v1'), 'declined');
  assert.equal(accepted.window.dataLayer.at(-1)[0], 'consent');
  assert.equal(accepted.window.dataLayer.at(-1)[1], 'update');
  assert.equal(accepted.window.dataLayer.at(-1)[2].analytics_storage, 'denied');
  assert.ok(accepted.cookieWrites.some((cookie) => cookie.startsWith('_ga=; Max-Age=0')));

  accepted.api.setAnalyticsConsent('accepted');
  assert.equal(accepted.appendedScripts.length, 1, 're-acceptance must not inject a duplicate loader');
  assert.equal(typeof accepted.window.gtag, 'function');
  assert.equal(accepted.window.dataLayer.at(-1)[0], 'consent');
  assert.equal(accepted.window.dataLayer.at(-1)[1], 'update');
  assert.equal(accepted.window.dataLayer.at(-1)[2].analytics_storage, 'granted');

  const crossTab = loadConsentModule('accepted');
  crossTab.api.initializeAnalyticsFromStoredConsent();
  crossTab.triggerStorageChoice('declined');
  assert.equal(crossTab.window.gtag, undefined, 'a decline in another tab must disable this tab');
  assert.equal(crossTab.window['ga-disable-G-D1NN0TC3Y0'], true);
  assert.equal(crossTab.dispatchedEvents.at(-1).detail.choice, 'declined');

  const crossTabClear = loadConsentModule('accepted');
  crossTabClear.api.initializeAnalyticsFromStoredConsent();
  crossTabClear.triggerStorageClear();
  assert.equal(crossTabClear.window.gtag, undefined, 'localStorage.clear in another tab must revoke analytics');
  assert.equal(crossTabClear.window['ga-disable-G-D1NN0TC3Y0'], true);
  assert.equal(crossTabClear.dispatchedEvents.at(-1).detail.choice, null);

  const failedDeclineWrite = loadConsentModule('accepted', { write: true });
  failedDeclineWrite.api.initializeAnalyticsFromStoredConsent();
  failedDeclineWrite.api.setAnalyticsConsent('declined');
  assert.equal(failedDeclineWrite.api.isAnalyticsConsentGranted(), false, 'a failed decline write must override stale acceptance');
  assert.equal(failedDeclineWrite.window.gtag, undefined);

  const failedAcceptWrite = loadConsentModule('declined', { write: true });
  failedAcceptWrite.api.setAnalyticsConsent('accepted');
  assert.equal(failedAcceptWrite.api.isAnalyticsConsentGranted(), true, 'an explicit acceptance remains active for the current page if persistence is blocked');
  assert.equal(failedAcceptWrite.appendedScripts.length, 1);

  const failedRead = loadConsentModule('accepted', { read: true });
  assert.equal(failedRead.api.initializeAnalyticsFromStoredConsent(), false, 'an unreadable stored choice must fail closed');
  assert.equal(failedRead.appendedScripts.length, 0);
}

function loadAnalyticsEventModule(storedChoice = null, exposeUntrustedGtag = false) {
  const transpiled = buildSync({
    absWorkingDir: ROOT,
    bundle: true,
    entryPoints: [ANALYTICS_HOOK_MODULE],
    external: ['react', 'react-router-dom'],
    format: 'cjs',
    platform: 'browser',
    target: 'es2020',
    tsconfig: path.join(ROOT, 'tsconfig.app.json'),
    write: false,
  }).outputFiles[0].text;

  const storedValues = new Map();
  if (storedChoice) storedValues.set('luxemia.analytics-consent.v1', storedChoice);

  const appendedScripts = [];
  const elementsById = new Map();
  const untrustedGtagCalls = [];
  const document = {
    cookie: '',
    referrer: 'https://referrer.example/private/path?email=jane@example.com',
    title: 'Private customer page title',
    createElement(tagName) {
      assert.equal(tagName, 'script');
      return { async: false, id: '', src: '' };
    },
    getElementById(id) {
      return elementsById.get(id) || null;
    },
    head: {
      appendChild(element) {
        elementsById.set(element.id, element);
        appendedScripts.push(element);
      },
    },
  };
  const window = {
    addEventListener() {},
    dispatchEvent() {},
    localStorage: {
      getItem(key) {
        return storedValues.get(key) || null;
      },
      setItem(key, value) {
        storedValues.set(key, value);
      },
    },
    location: {
      hostname: 'luxemia.shop',
      href: 'https://luxemia.shop/contact?email=jane@example.com#private',
      origin: 'https://luxemia.shop',
    },
  };
  if (exposeUntrustedGtag) {
    window.gtag = (...args) => untrustedGtagCalls.push(args);
  }

  class MockEvent {
    constructor(type) {
      this.type = type;
    }
  }

  class MockCustomEvent extends MockEvent {
    constructor(type, init = {}) {
      super(type);
      this.detail = init.detail;
    }
  }

  const module = { exports: {} };
  const context = vm.createContext({
    CustomEvent: MockCustomEvent,
    Event: MockEvent,
    URL,
    console,
    document,
    exports: module.exports,
    module,
    require(specifier) {
      if (specifier === 'react') {
        return {
          useEffect() {},
          useRef(initialValue) {
            return { current: initialValue };
          },
        };
      }
      if (specifier === 'react-router-dom') {
        return { useLocation: () => ({ pathname: '/' }) };
      }
      throw new Error(`Unexpected external module in analytics validation: ${specifier}`);
    },
    window,
  });
  vm.runInContext(transpiled, context, { filename: ANALYTICS_HOOK_MODULE });

  return {
    api: module.exports,
    appendedScripts,
    untrustedGtagCalls,
    window,
  };
}

function validateConsentGatedEventHelpers() {
  for (const storedChoice of [null, 'declined']) {
    const simulation = loadAnalyticsEventModule(storedChoice, true);
    assert.equal(simulation.api.trackLeadSubmission('contact_form'), false);
    assert.equal(simulation.api.trackSearchResults(12), false);
    assert.equal(simulation.api.trackPageNotFound(), false);
    assert.deepEqual(
      simulation.untrustedGtagCalls,
      [],
      `${storedChoice || 'no choice'} must block event dispatch even when another script exposes gtag`,
    );
    assert.equal(simulation.appendedScripts.length, 0);
  }

  const accepted = loadAnalyticsEventModule('accepted');
  assert.equal(accepted.api.trackLeadSubmission('contact_form'), true);
  assert.equal(accepted.api.trackLeadSubmission('custom_order_form'), true);
  assert.equal(accepted.api.trackSearchResults(12), true);
  assert.equal(accepted.api.trackPageNotFound(), true);
  assert.equal(accepted.appendedScripts.length, 1, 'event helpers must initialize the loader once after consent');

  const eventCommands = Array.from(accepted.window.dataLayer)
    .filter((entry) => entry[0] === 'event');
  assert.deepEqual(
    eventCommands.map((entry) => entry[1]),
    ['generate_lead', 'generate_lead', 'view_search_results', 'page_404'],
  );
  assert.deepEqual(
    Object.keys(eventCommands[0][2]).sort(),
    ['lead_source', 'lead_type'],
    'lead analytics must contain only the fixed classification fields',
  );
  assert.equal(eventCommands[1][2].lead_source, 'custom_order_form');
  assert.equal(eventCommands[1][2].lead_type, 'made_to_measure_inquiry');
  assert.deepEqual(
    Object.keys(eventCommands[2][2]).sort(),
    ['result_count', 'search_scope'],
    'search analytics must not contain the shopper query',
  );
  assert.equal(eventCommands[2][2].result_count, 12);
  assert.equal(eventCommands[3][2].page_path, '/404');
  assert.equal(eventCommands[3][2].page_referrer, 'https://referrer.example');
  assert.equal(JSON.stringify(eventCommands).includes('jane@example.com'), false);

  const eventCount = eventCommands.length;
  assert.equal(accepted.api.trackSearchResults(-1), false);
  assert.equal(accepted.api.trackSearchResults(Number.NaN), false);
  assert.equal(
    Array.from(accepted.window.dataLayer).filter((entry) => entry[0] === 'event').length,
    eventCount,
    'invalid search counts must not dispatch an event',
  );
}

function validateAnalyticsPayloadSanitization() {
  const transpiled = transformSync(fs.readFileSync(ANALYTICS_PRIVACY_MODULE, 'utf8'), {
    format: 'cjs',
    loader: 'ts',
    target: 'es2020',
  }).code;
  const module = { exports: {} };
  vm.runInNewContext(transpiled, { exports: module.exports, module, URL });

  const sanitize = module.exports.toAnalyticsTailoringCategory;
  assert.equal(sanitize('Semi Stitched'), 'semi_stitched');
  assert.equal(sanitize('Made to Measure (UDesign)'), 'made_to_measure');
  assert.equal(sanitize('Custom Alteration Instructions: shorten to 40; email me'), undefined);
  assert.equal(sanitize('42-36-44, Jane, jane@example.com'), undefined);
  assert.equal(module.exports.toAnalyticsCurrency('jane@example.com'), undefined);
  assert.equal(module.exports.toAnalyticsCurrency('gbp'), 'GBP');
  assert.equal(module.exports.toAnalyticsCountry('jane@example.com'), undefined);
  assert.equal(module.exports.toAnalyticsRegion('Jane Smith'), undefined);
  assert.equal(module.exports.toAnalyticsTransactionId('jane@example.com'), undefined);
  assert.equal(module.exports.toAnalyticsTransactionId('#1042'), '#1042');
  assert.equal(
    module.exports.toAnalyticsPageUrl('https://luxemia.shop/order-confirmation?email=jane@example.com#private'),
    'https://luxemia.shop/order-confirmation',
  );
  assert.equal(
    module.exports.toAnalyticsReferrerOrigin('https://referrer.example/path?email=jane@example.com'),
    'https://referrer.example',
  );
  assert.equal(module.exports.toAnalyticsRoutePath('/product/red-silk-lehenga'), '/product/:item');
  assert.equal(module.exports.toAnalyticsRoutePath('/jane@example.com'), '/other');
  assert.equal(module.exports.toAnalyticsRoutePath('/private-token-123456789'), '/other');
}

function validateBuiltHtml() {
  if (!REQUIRE_BUILT) return;

  const distDirectory = BUILT_DIRECTORY;
  if (!fs.existsSync(distDirectory)) {
    assert.fail('dist is required for the post-build analytics validation');
  }

  const htmlFiles = walkFiles(distDirectory, new Set(['.html']));
  assert.ok(htmlFiles.length > 0, 'dist must contain rendered HTML files');

  const violations = htmlFiles.filter((filePath) => {
    const html = fs.readFileSync(filePath, 'utf8');
    return GOOGLE_TRACKING_HOSTS.some((hostname) => html.includes(hostname))
      || /gtag\s*\(\s*['"]config['"]/.test(html)
      || /\bloadGTM\b/.test(html);
  });

  assert.deepEqual(
    violations.map((filePath) => path.relative(ROOT, filePath)),
    [],
    'Built HTML must not load or configure Google Analytics before consent',
  );
}

validateStaticSources();
validateRuntimeGate();
validateConsentGatedEventHelpers();
validateAnalyticsPayloadSanitization();
validateBuiltHtml();

console.log('Analytics consent validation passed: no Google loader before opt-in; decline and withdrawal remain disabled.');
