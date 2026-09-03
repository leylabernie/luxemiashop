import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const projectRoot = path.resolve(import.meta.dirname, '..');
const componentPath = path.join(projectRoot, 'src/components/home/NewVisitorPopup.tsx');
const componentSource = await readFile(componentPath, 'utf8');
const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'luxemia-popup-test-'));
const bundledComponentPath = path.join(temporaryDirectory, 'NewVisitorPopup.mjs');

await build({
  stdin: {
    contents: `${componentSource}\nexport { parseRateLimitTimestamps, readPopupStorageItem, writePopupStorageItem };`,
    loader: 'tsx',
    resolveDir: path.dirname(componentPath),
    sourcefile: componentPath,
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: bundledComponentPath,
  define: {
    'import.meta.env.VITE_SUPABASE_URL': '""',
  },
  logLevel: 'silent',
});

const {
  parseRateLimitTimestamps,
  readPopupStorageItem,
  writePopupStorageItem,
} = await import(pathToFileURL(bundledComponentPath).href);

test.after(async () => {
  await rm(temporaryDirectory, { recursive: true, force: true });
});

test('popup storage helpers fail safely for blocked access and corrupt JSON', () => {
  const blockedStorage = {
    getItem() {
      throw new Error('storage blocked');
    },
    setItem() {
      throw new Error('storage blocked');
    },
  };

  assert.equal(readPopupStorageItem('seen', blockedStorage), null);
  assert.equal(writePopupStorageItem('seen', 'true', blockedStorage), false);
  assert.equal(readPopupStorageItem('seen', null), null);
  assert.equal(writePopupStorageItem('seen', 'true', null), false);
  assert.deepEqual(parseRateLimitTimestamps('{broken'), []);
  assert.deepEqual(parseRateLimitTimestamps('{"timestamp":123}'), []);
  assert.deepEqual(parseRateLimitTimestamps('[123,"456",null,789]'), [123, 789]);
});

test('popup storage helpers preserve normal dismissal and rate-limit values', () => {
  const values = new Map();
  const memoryStorage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };

  assert.equal(writePopupStorageItem('luxemia_popup_seen', 'true', memoryStorage), true);
  assert.equal(readPopupStorageItem('luxemia_popup_seen', memoryStorage), 'true');
  assert.equal(writePopupStorageItem('timestamps', '[100,200]', memoryStorage), true);
  assert.deepEqual(parseRateLimitTimestamps(readPopupStorageItem('timestamps', memoryStorage)), [100, 200]);
});

test('popup modal and email field retain the required accessibility wiring', () => {
  assert.match(componentSource, /role="dialog"[\s\S]{0,160}aria-modal="true"/);
  assert.match(componentSource, /ref=\{closeButtonRef\}[\s\S]{0,500}aria-label="Close popup"/);
  assert.match(componentSource, /event\.key === 'Escape'[\s\S]{0,180}handleClose\(\)/);
  assert.match(componentSource, /event\.key !== 'Tab'[\s\S]{0,1200}lastElement\.focus\(\)[\s\S]{0,500}firstElement\.focus\(\)/);
  assert.match(componentSource, /previouslyFocused\?\.isConnected[\s\S]{0,160}previouslyFocused\.focus/);
  assert.match(componentSource, /<label htmlFor="welcome-offer-email"[\s\S]{0,100}>\s*Email address\s*<\/label>/);
  assert.match(componentSource, /id="welcome-offer-email"[\s\S]{0,1600}aria-describedby=\{emailError \? 'welcome-offer-email-error'/);
  assert.match(componentSource, /id="welcome-offer-email-error"[\s\S]{0,100}role="alert"/);
  assert.doesNotMatch(componentSource, /(?:^|[^.\w])localStorage\.(?:getItem|setItem)/m);
});
