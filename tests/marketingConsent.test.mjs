import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createMarketingConsentStore, MARKETING_CONSENT_KEY, reloadWithMarketingDenied } from '../src/lib/marketingConsent.ts';

function browser(initial, blocked = false) {
  const values = new Map(initial === undefined ? [] : [[MARKETING_CONSENT_KEY, initial]]);
  const handlers = new Map();
  const localStorage = {
    getItem(key) { if (blocked) throw Error('unavailable'); return values.get(key) ?? null; },
    setItem(key, value) { if (blocked) throw Error('unavailable'); values.set(key, value); },
  };
  const window = { localStorage, addEventListener(name, fn) { handlers.set(name, fn); } };
  return { window, values, storage: (newValue, key = MARKETING_CONSENT_KEY, storageArea = localStorage) => handlers.get('storage')({ key, newValue, storageArea }) };
}

test('unknown, malformed, and absent browser never grant consent', () => {
  for (const initial of [undefined, '', 'true', '1', '{}', 'GRANTED', 'granted']) {
    const host = browser(initial);
    assert.equal(createMarketingConsentStore(() => host.window).get(), 'unknown');
  }
  assert.equal(createMarketingConsentStore(() => undefined).get(), 'unknown');
});

test('only denials persist; grants require explicit acceptance in each document', () => {
  const host = browser();
  const store = createMarketingConsentStore(() => host.window);
  const observed = [];
  store.subscribe(value => observed.push([value, host.values.get(MARKETING_CONSENT_KEY)]));
  store.set('granted');
  assert.equal(store.get(), 'granted');
  assert.equal(createMarketingConsentStore(() => host.window).get(), 'unknown');
  store.set('denied');
  assert.equal(createMarketingConsentStore(() => host.window).get(), 'denied');
  assert.deepEqual(observed.map(([choice]) => choice), ['granted', 'denied']);
  assert.equal(observed[0][1], undefined);
  assert.match(observed[1][1], /^denied:/);
});

test('unavailable storage defaults off and accepts or revokes only for this document', () => {
  const host = browser(undefined, true);
  const store = createMarketingConsentStore(() => host.window);
  assert.equal(store.get(), 'unknown');
  store.set('granted');
  assert.equal(store.get(), 'granted');
  store.set('denied');
  assert.equal(store.get(), 'denied');
  assert.equal(createMarketingConsentStore(() => host.window).get(), 'unknown');
});

test('cross-tab rejection, removal and clear immediately revoke', () => {
  const host = browser('granted');
  const store = createMarketingConsentStore(() => host.window);
  const observed = [];
  store.subscribe(value => observed.push(value));
  host.storage('denied');
  assert.equal(store.get(), 'denied');
  store.set('granted');
  host.storage(null);
  assert.equal(store.get(), 'unknown');
  store.set('granted');
  host.storage(null, null);
  assert.equal(store.get(), 'unknown');
  assert.deepEqual(observed, ['denied', 'granted', 'unknown', 'granted', 'unknown']);
});

test('irrelevant storage events do not grant and subscriber errors do not block revocation', () => {
  const host = browser();
  const store = createMarketingConsentStore(() => host.window);
  store.subscribe(() => { throw Error('vendor failed'); });
  const observed = [];
  const unsubscribe = store.subscribe(value => observed.push(value));
  host.storage('granted', 'newsletter');
  host.storage('granted', MARKETING_CONSENT_KEY, {});
  assert.equal(store.get(), 'unknown');
  store.set('granted');
  store.set('denied');
  store.set('denied');
  assert.deepEqual(observed, ['granted', 'denied']);
  unsubscribe();
  store.set('granted');
  assert.deepEqual(observed, ['granted', 'denied']);
});

test('consent module does not queue or transmit tracking before opt-in', () => {
  const source = readFileSync(new URL('../src/lib/marketingConsent.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /fetch\(|createElement\(|\.fbq|\.ttq|\.pintrk|\.gtag/);
});

test('accessible reject, accept and persistent reopen controls are mounted without changing policy', () => {
  const source = readFileSync(new URL('../src/components/MarketingConsent.tsx', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(source, /aria-expanded=\{visible\}/);
  assert.match(source, /aria-labelledby="marketing-privacy-title"/);
  assert.match(source, /choose\('denied'\)/);
  assert.match(source, /choose\('granted'\)/);
  assert.match(source, /Withdraw permission/);
  assert.match(source, /Privacy choices/);
  assert.match(source, /href="\/privacy"/);
  assert.match(app, /<MarketingConsent \/>/);
});


test('denied reload marker overrides an old grant even when storage throws', () => {
  for (const blocked of [false, true]) {
    const host = browser('granted', blocked);
    host.window.location = { search: '?luxemia_marketing=denied' };
    const store = createMarketingConsentStore(() => host.window);
    assert.equal(store.get(), 'denied');
    assert.equal(host.values.get(MARKETING_CONSENT_KEY), 'granted', 'URL marker must not overwrite a newer cross-tab choice');
  }
});

test('a new explicit acceptance removes the denied marker before granting', () => {
  const host = browser('denied');
  host.window.location = { href: 'https://luxemia.shop/product/dress?luxemia_marketing=denied&variant=123#details', search: '?luxemia_marketing=denied&variant=123' };
  let replaced;
  host.window.history = { state: { key: 'route' }, replaceState(state, title, url) { replaced = { state, url }; } };
  const store = createMarketingConsentStore(() => host.window);
  store.set('granted');
  assert.equal(store.get(), 'granted');
  assert.deepEqual(replaced, { state: { key: 'route' }, url: 'https://luxemia.shop/product/dress?variant=123#details' });
});

test('withdraw reload is fail-closed, preserves current product/query/hash, and is idempotent', () => {
  const calls = [];
  const host = { location: { href: 'https://luxemia.shop/product/dress?variant=123#details', replace: url => calls.push(url) } };
  reloadWithMarketingDenied(host);
  reloadWithMarketingDenied(host);
  assert.deepEqual(calls, ['https://luxemia.shop/product/dress?variant=123&luxemia_marketing=denied#details']);
});


test('readable stale grant cannot resurrect after failed denial write and plain native navigation', () => {
  const host = browser('granted');
  host.window.localStorage.setItem = () => { throw Error('quota write denied'); };
  const first = createMarketingConsentStore(() => host.window);
  first.set('granted');
  assert.equal(first.get(), 'granted');
  first.set('denied');
  assert.equal(first.get(), 'denied');
  assert.equal(host.values.get(MARKETING_CONSENT_KEY), 'granted');
  host.window.location = { search: '?luxemia_marketing=denied' };
  assert.equal(createMarketingConsentStore(() => host.window).get(), 'denied');
  host.window.location = { search: '' }; // Native /privacy link drops marker.
  assert.equal(createMarketingConsentStore(() => host.window).get(), 'unknown');
});

test('cross-tab grants never override a denied URL marker or trigger new acceptance', () => {
  const host = browser('granted');
  host.window.location = { search: '?luxemia_marketing=denied' };
  const store = createMarketingConsentStore(() => host.window);
  const observed = [];
  store.subscribe(value => observed.push(value));
  host.storage('granted');
  assert.equal(store.get(), 'denied');
  assert.deepEqual(observed, []);
  assert.equal(createMarketingConsentStore(() => host.window).get(), 'denied');
});


test('each withdrawal publishes a fresh denial even when denials are already stored', () => {
  const hostA = browser('denied');
  const hostB = browser('denied');
  const storeA = createMarketingConsentStore(() => hostA.window);
  const storeB = createMarketingConsentStore(() => hostB.window);
  storeB.get();
  const original = hostA.window.localStorage.setItem;
  let delivered = 0;
  hostA.window.localStorage.setItem = (key, value) => {
    const previous = hostA.values.get(key);
    original(key, value);
    if (previous !== value) { delivered++; hostB.storage(value, key); }
  };
  for (let i = 0; i < 3; i++) {
    storeA.set('granted');
    storeB.set('granted');
    assert.equal(storeB.get(), 'granted');
    storeA.set('denied');
    assert.equal(storeB.get(), 'denied');
  }
  assert.equal(delivered, 3);
});
