import test from 'node:test';
import assert from 'node:assert/strict';
import { createMarketingTracker } from '../src/lib/marketingPixels.ts';

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
