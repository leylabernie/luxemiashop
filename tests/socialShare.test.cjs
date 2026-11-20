const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const retiredCodes = /LUXE10|LUXE15|LUXE20/;

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

test('SocialShare component exists with WhatsApp, Pinterest, Facebook, and generic share buttons', () => {
  const source = read('src/components/product/SocialShare.tsx');

  assert.match(source, /export (const|function) SocialShare/);
  assert.match(source, /buildWhatsAppUrl/);
  assert.match(source, /buildPinterestUrl/);
  assert.match(source, /buildFacebookUrl/);
  assert.match(source, /wa\.me\/\?text=/);
  assert.match(source, /pinterest\.com\/pin\/create\/button\//);
  assert.match(source, /facebook\.com\/sharer\/sharer\.php/);
  assert.match(source, /navigator\.share/);
  assert.doesNotMatch(source, retiredCodes);
});

test('SocialShare WhatsApp URL uses wa.me with encoded product title and URL', () => {
  const source = read('src/components/product/SocialShare.tsx');

  assert.match(source, /https:\/\/wa\.me\/\?text=/);
  assert.match(source, /encodeURIComponent/);
});

test('SocialShare Pinterest URL uses pinterest.com pin create button', () => {
  const source = read('src/components/product/SocialShare.tsx');

  assert.match(source, /pinterest\.com\/pin\/create\/button\/\?url=/);
  assert.match(source, /media=/);
  assert.match(source, /description=/);
});

test('SocialShare Facebook URL uses facebook.com sharer', () => {
  const source = read('src/components/product/SocialShare.tsx');

  assert.match(source, /facebook\.com\/sharer\/sharer\.php\?u=/);
});

test('SocialShare generic fallback uses Web Share API with clipboard fallback', () => {
  const source = read('src/components/product/SocialShare.tsx');

  assert.match(source, /navigator\.share/);
  assert.match(source, /navigator\.clipboard\.writeText/);
});

test('ProductInfo integrates SocialShare on desktop and mobile', () => {
  const source = read('src/components/product/ProductInfo.tsx');

  assert.match(source, /import \{ SocialShare \} from '\.\/SocialShare'/);
  assert.match(source, /<SocialShare/);

  // Desktop share button
  assert.match(source, /productUrl={`https:\/\/luxemia\.shop\/product\/\$\{product\.handle\}`}/);

  // Mobile share button (sm:hidden)
  assert.match(source, /sm:hidden/);
});

test('SocialShare does not reference retired discount codes', () => {
  const source = read('src/components/product/SocialShare.tsx');
  assert.doesNotMatch(source, retiredCodes);
});
