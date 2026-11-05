import test from 'node:test';
import assert from 'node:assert/strict';
import { createMarketingTracker as makeTracker } from '../src/lib/marketingPixels.ts';

const createMarketingTracker = (ids) => makeTracker(ids, () => true);

// Minimal browser host: a window double plus a document double that
// records every script the loader tries to append, in order.
function installBrowserHost({ analyticsEnabled = true } = {}) {
  const scripts = [];
  globalThis.window = { luxemiaAnalyticsEnabled: analyticsEnabled };
  globalThis.document = {
    createElement: () => ({}),
    head: {
      appendChild: (el) => {
        scripts.push(el.src);
        return el;
      },
    },
  };
  return { scripts };
}

test('first PageView is delivered even when tracking fires before explicit init', () => {
  const { scripts } = installBrowserHost();
  const tracker = createMarketingTracker({ meta: '1234567890' });

  // Simulates usePageTracking firing on the first route before the
  // app-level init effect has run (single-page visit).
  tracker.pageView();

  assert.ok(window.fbq, 'meta stub installed');
  assert.deepEqual(window.fbq.queue[0], ['init', '1234567890']);
  assert.deepEqual(window.fbq.queue[1], ['track', 'PageView']);
  assert.ok(scripts.some((src) => src.includes('connect.facebook.net/en_US/fbevents.js')));
});

test('explicit init followed by PageView fires init exactly once', () => {
  installBrowserHost();
  const tracker = createMarketingTracker({ meta: '1234567890' });
  tracker.init();
  tracker.init();
  tracker.pageView();

  const inits = window.fbq.queue.filter((args) => args[0] === 'init');
  assert.equal(inits.length, 1);
  assert.deepEqual(window.fbq.queue[window.fbq.queue.length - 1], ['track', 'PageView']);
});

test('Pinterest page tracking uses the track command, never a bare event name', () => {
  installBrowserHost();
  const tracker = createMarketingTracker({ pinterest: '2612345678901' });
  tracker.pageView();

  assert.deepEqual(window.pintrk.queue[0], ['load', '2612345678901']);
  assert.deepEqual(window.pintrk.queue[1], ['track', 'pagevisit']);
  assert.ok(
    window.pintrk.queue.every((args) => args[0] === 'load' || args[0] === 'track'),
    'every Pinterest call uses a valid command',
  );
});

test('TikTok product events fired while the library loads are queued, not lost', () => {
  const { scripts } = installBrowserHost();
  const tracker = createMarketingTracker({ tiktok: 'TT_PIXEL_1' });

  // Fired immediately: events.js has been requested but has not executed,
  // so window.ttq must already be the queue stub.
  tracker.viewContent('blush-beige-tissue-silk-saree', 96, 'USD');

  assert.ok(Array.isArray(window.ttq), 'ttq queue stub installed before library load');
  const queued = [...window.ttq];
  assert.deepEqual(queued[0].slice(0, 2), ['track', 'ViewContent']);
  assert.equal(queued[0][2].content_id, 'blush-beige-tissue-silk-saree');
  assert.equal(queued[0][2].value, 96);
  assert.ok(scripts.some((src) => src.includes('analytics.tiktok.com') && src.includes('sdkid=TT_PIXEL_1')));
});

test('TikTok page views are queued through the same stub', () => {
  installBrowserHost();
  const tracker = createMarketingTracker({ tiktok: 'TT_PIXEL_1' });
  tracker.pageView();
  assert.deepEqual([...window.ttq][0], ['page']);
});

test('with no pixel IDs configured nothing loads and nothing is tracked', () => {
  const { scripts } = installBrowserHost();
  const tracker = createMarketingTracker({});
  tracker.init();
  tracker.pageView();
  tracker.viewContent('any-handle', 10);

  assert.equal(window.fbq, undefined);
  assert.equal(window.pintrk, undefined);
  assert.equal(window.ttq, undefined);
  assert.deepEqual(scripts, []);
});

test('nothing loads or tracks when the production analytics gate is off', () => {
  const { scripts } = installBrowserHost({ analyticsEnabled: false });
  const tracker = createMarketingTracker({ meta: '1', pinterest: '2', tiktok: '3' });
  tracker.init();
  tracker.pageView();
  tracker.viewContent('any-handle', 10);

  assert.equal(window.fbq, undefined);
  assert.equal(window.pintrk, undefined);
  assert.equal(window.ttq, undefined);
  assert.deepEqual(scripts, []);
});


test('unknown or denied marketing consent never loads scripts or retains events; later grant starts fresh', () => {
  const { scripts } = installBrowserHost();
  let consent = false;
  const tracker = makeTracker({ meta: '1', pinterest: '2', tiktok: '3' }, () => consent);
  tracker.init(); tracker.pageView(); tracker.viewContent('private-before-consent');
  assert.deepEqual(scripts, []);
  assert.equal(window.ttq, undefined);
  consent = true;
  tracker.pageView();
  assert.equal(scripts.length, 3);
  assert.deepEqual([...window.ttq], [['page']]);
  assert.equal(JSON.stringify(window.fbq.queue).includes('private-before-consent'), false);
});

test('product visit emits exactly one Pinterest pagevisit, with repeated route visits still tracked', () => {
  installBrowserHost();
  const tracker = createMarketingTracker({ pinterest: '2' });
  tracker.pageView(); tracker.viewContent('product', 10); tracker.viewContent('product', 11);
  assert.equal(window.pintrk.queue.filter(x => x[1] === 'pagevisit').length, 1);
  tracker.pageView();
  assert.equal(window.pintrk.queue.filter(x => x[1] === 'pagevisit').length, 2);
});

test('TikTok standard SDK metadata and instance API exist before the script is requested', () => {
  installBrowserHost();
  const original = document.head.appendChild;
  document.head.appendChild = (el) => {
    const ttq = window.ttq;
    assert.equal(window.TiktokAnalyticsObject, 'ttq');
    assert.equal(ttq._i['pixel / id']._u, 'https://analytics.tiktok.com/i18n/pixel/events.js');
    assert.equal(typeof ttq._t['pixel / id'], 'number');
    assert.deepEqual(ttq._o['pixel / id'], {});
    assert.equal(typeof ttq.setAndDefer, 'function');
    for (const method of ttq.methods) assert.equal(typeof ttq[method], 'function');
    assert.match(el.src, /sdkid=pixel%20%2F%20id&lib=ttq$/);
    return original(el);
  };
  const tracker = createMarketingTracker({ tiktok: 'pixel / id' });
  tracker.pageView();
  window.ttq.instance('pixel / id').track('ViewContent', { content_id: 'instance-product' });
  assert.deepEqual([...window.ttq._i['pixel / id']], [['track', 'ViewContent', { content_id: 'instance-product' }]]);
});

test('SDK handoff fixture drains queued commands once then accepts post-load route/product events', () => {
  installBrowserHost();
  const tracker = createMarketingTracker({ tiktok: 'pixel' });
  tracker.pageView(); tracker.viewContent('early', 10);
  const queued = window.ttq;
  // Contract fixture, NOT evidence of real TikTok network ingestion. The SDK
  // discovers instances via _i and drains both global and instance queues.
  const delivered = [];
  assert.ok(queued._i.pixel._u);
  assert.ok(queued._t.pixel);
  assert.deepEqual(queued._o.pixel, {});
  delivered.push(...queued.splice(0));
  for (const method of queued.methods) queued[method] = (...args) => delivered.push([method, ...args]);
  tracker.pageView(); tracker.viewContent('later', 20);
  assert.deepEqual(delivered.map(x => x.slice(0, 2)), [
    ['page'], ['track', 'ViewContent'], ['page'], ['track', 'ViewContent'],
  ]);
  assert.equal(delivered[1][2].content_id, 'early');
  assert.equal(delivered[3][2].content_id, 'later');
  assert.equal(queued.length, 0);
});

test('revocation clears pending queues and prevents future wrapper or retained stub events', () => {
  installBrowserHost();
  let consent = true;
  const tracker = makeTracker({ meta: '1', pinterest: '2', tiktok: '3' }, () => consent);
  tracker.pageView(); tracker.viewContent('before', 10);
  const oldTrack = window.ttq.track;
  window.ttq.instance('3').track('ViewContent', { content_id: 'instance' });
  consent = false;
  tracker.revoke(); tracker.pageView(); tracker.viewContent('after', 10); oldTrack('ViewContent', {});
  assert.deepEqual(window.fbq.queue, []);
  assert.deepEqual(window.pintrk.queue, []);
  assert.equal(window.ttq.length, 0);
  assert.equal(window.ttq._i['3'].length, 0);
});

test('one broken vendor does not prevent the other vendors from receiving events', () => {
  installBrowserHost();
  const tracker = createMarketingTracker({ meta: '1', pinterest: '2', tiktok: '3' });
  tracker.init();
  window.fbq = () => { throw new Error('blocked'); };
  assert.doesNotThrow(() => tracker.pageView());
  assert.deepEqual(window.pintrk.queue.at(-1), ['track', 'pagevisit']);
  assert.deepEqual([...window.ttq], [['page']]);
});

test('an unconfigured vendor is not called even if some other code installed its global', () => {
  installBrowserHost();
  let externalCalls = 0;
  window.fbq = () => { externalCalls += 1; };
  const tracker = createMarketingTracker({ tiktok: '3' });
  tracker.pageView(); tracker.viewContent('product', 10);
  assert.equal(externalCalls, 0);
});

test('loaded Meta SDK receives revoke even after consent has already become denied', () => {
  installBrowserHost();
  let consent = true;
  const tracker = makeTracker({ meta: '1' }, () => consent);
  tracker.pageView();
  const received = [];
  window.fbq.callMethod = (...args) => received.push(args);
  consent = false;
  tracker.revoke(); tracker.pageView();
  assert.deepEqual(received, [['consent', 'revoke']]);
  assert.deepEqual(window.fbq.queue, []);
});

test('active product consent subscription tracks only the current product and cleans up on navigation', async () => {
  const { readFileSync } = await import('node:fs');
  const source = readFileSync(new URL('../src/pages/ProductDetail.tsx', import.meta.url), 'utf8');
  const effect = source.match(/\/\/ Only the currently mounted product[\s\S]*?useEffect\(\(\) => \{([\s\S]*?)\n  \}, \[product\]\);/);
  assert.ok(effect, 'current-product effect remains present');
  let consent = false;
  const listeners = new Set();
  const events = [];
  const mount = new Function('product', 'trackMarketingViewContent', 'subscribeMarketingConsent', effect[1]);
  const product = handle => ({ handle, variants: { edges: [] }, priceRange: { minVariantPrice: { amount: '10', currencyCode: 'USD' } } });
  const track = (...args) => { if (consent) events.push(args); };
  const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
  const stopOld = mount(product('previous'), track, subscribe);
  stopOld();
  const stopCurrent = mount(product('current'), track, subscribe);
  assert.deepEqual(events, []);
  consent = true;
  for (const listener of listeners) listener('granted');
  assert.deepEqual(events, [['current', 10, 'USD']]);
  stopCurrent();
  assert.equal(listeners.size, 0);
});
