import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const projectRoot = path.resolve(import.meta.dirname, '..');
const componentPath = path.join(projectRoot, 'src/components/cart/CartDrawer.tsx');
const source = await readFile(componentPath, 'utf8');
const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'luxemia-cart-modal-test-'));
const bundledComponentPath = path.join(temporaryDirectory, 'CartDrawer.mjs');

await build({
  stdin: {
    contents: `${source}\nexport { handleCartModalKeyDown, isolateCartModalEnvironment };`,
    loader: 'tsx',
    resolveDir: path.dirname(componentPath),
    sourcefile: componentPath,
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: bundledComponentPath,
  define: {
    'import.meta.env': '{}',
  },
  logLevel: 'silent',
});

const {
  handleCartModalKeyDown,
  isolateCartModalEnvironment,
} = await import(pathToFileURL(bundledComponentPath).href);

test.after(async () => {
  await rm(temporaryDirectory, { recursive: true, force: true });
});

test('cart drawer exposes a labelled modal with a stable initial focus target', () => {
  assert.match(source, /ref=\{drawerRef\}[\s\S]{0,500}role="dialog"[\s\S]{0,160}aria-modal="true"/);
  assert.match(source, /aria-labelledby="cart-title"[\s\S]{0,100}tabIndex=\{-1\}/);
  assert.match(source, /ref=\{closeButtonRef\}[\s\S]{0,500}aria-label="Close cart"/);
  assert.match(source, /\(closeButtonRef\.current \?\? drawer\)\.focus\(\{ preventScroll: true \}\)/);
  assert.match(source, /aria-hidden="true"/);
});

test('cart drawer contains keyboard focus and closes on Escape', () => {
  const first = {
    focusCount: 0,
    focus() { this.focusCount += 1; },
    getAttribute() { return null; },
    hasAttribute() { return false; },
  };
  const last = {
    focusCount: 0,
    focus() { this.focusCount += 1; },
    getAttribute() { return null; },
    hasAttribute() { return false; },
  };
  const drawer = {
    focusCount: 0,
    querySelectorAll() { return [first, last]; },
    contains(element) { return element === first || element === last; },
    focus() { this.focusCount += 1; },
  };
  const keyboardEvent = (key, shiftKey = false) => ({
    key,
    shiftKey,
    prevented: 0,
    stopped: 0,
    preventDefault() { this.prevented += 1; },
    stopPropagation() { this.stopped += 1; },
  });

  const escape = keyboardEvent('Escape');
  let closeCount = 0;
  handleCartModalKeyDown(escape, drawer, () => { closeCount += 1; }, first);
  assert.equal(closeCount, 1);
  assert.equal(escape.prevented, 1);
  assert.equal(escape.stopped, 1);

  const backwards = keyboardEvent('Tab', true);
  handleCartModalKeyDown(backwards, drawer, () => {}, first);
  assert.equal(last.focusCount, 1);
  assert.equal(backwards.prevented, 1);

  const forwards = keyboardEvent('Tab');
  handleCartModalKeyDown(forwards, drawer, () => {}, last);
  assert.equal(first.focusCount, 1);
  assert.equal(forwards.prevented, 1);

  const escapedFocus = keyboardEvent('Tab');
  handleCartModalKeyDown(escapedFocus, drawer, () => {}, { outside: true });
  assert.equal(first.focusCount, 2);
  assert.equal(escapedFocus.prevented, 1);

  assert.match(source, /document\.addEventListener\('keydown', onKeyDown\)/);
  assert.match(source, /document\.removeEventListener\('keydown', onKeyDown\)/);
});

test('cart drawer restores focus to its connected opener on close', () => {
  assert.match(source, /previouslyFocusedRef\.current = document\.activeElement instanceof HTMLElement/);
  assert.match(source, /previouslyFocused\?\.isConnected[\s\S]{0,160}previouslyFocused\.focus\(\{ preventScroll: true \}\)/);
  assert.doesNotMatch(source, /AnimatePresence|exit=\{\{/);
  assert.match(source, /if \(!isOpen\) return null/);
  assert.match(source, /useLayoutEffect\(\(\) => \{[\s\S]*?restoreModalEnvironment\(\)/);
});

test('cart drawer isolation preserves and restores background and body state', () => {
  class FakeStyle {
    values = new Map();
    priorities = new Map();

    getPropertyValue(name) { return this.values.get(name) ?? ''; }
    getPropertyPriority(name) { return this.priorities.get(name) ?? ''; }
    setProperty(name, value, priority = '') {
      this.values.set(name, value);
      this.priorities.set(name, priority);
    }
    removeProperty(name) {
      this.values.delete(name);
      this.priorities.delete(name);
    }
  }

  class FakeElement {
    constructor(name) {
      this.name = name;
      this.attributes = new Map();
      this.children = [];
      this.parentElement = null;
      this.style = new FakeStyle();
    }

    append(...children) {
      for (const child of children) {
        child.parentElement = this;
        this.children.push(child);
      }
    }

    contains(element) {
      return element === this || this.children.some((child) => child.contains(element));
    }

    hasAttribute(name) { return this.attributes.has(name); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    setAttribute(name, value) { this.attributes.set(name, value); }
    removeAttribute(name) { this.attributes.delete(name); }
  }

  const body = new FakeElement('body');
  const app = new FakeElement('app');
  const external = new FakeElement('external');
  const page = new FakeElement('page');
  const modalHost = new FakeElement('modal-host');
  const backdrop = new FakeElement('backdrop');
  const drawer = new FakeElement('drawer');
  body.append(app, external);
  app.append(page, modalHost);
  modalHost.append(backdrop, drawer);

  body.style.setProperty('overflow', 'clip', 'important');
  external.setAttribute('inert', '');
  external.setAttribute('aria-hidden', 'false');

  const restore = isolateCartModalEnvironment(drawer, backdrop, body);
  assert.equal(body.style.getPropertyValue('overflow'), 'hidden');
  assert.equal(page.hasAttribute('inert'), true);
  assert.equal(page.getAttribute('aria-hidden'), 'true');
  assert.equal(external.hasAttribute('inert'), true);
  assert.equal(external.getAttribute('aria-hidden'), 'true');
  assert.equal(backdrop.hasAttribute('inert'), false);
  assert.equal(drawer.hasAttribute('inert'), false);

  restore();
  restore();
  assert.equal(body.style.getPropertyValue('overflow'), 'clip');
  assert.equal(body.style.getPropertyPriority('overflow'), 'important');
  assert.equal(page.hasAttribute('inert'), false);
  assert.equal(page.getAttribute('aria-hidden'), null);
  assert.equal(external.hasAttribute('inert'), true);
  assert.equal(external.getAttribute('aria-hidden'), 'false');
});
