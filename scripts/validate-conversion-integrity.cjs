#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const index = read('index.html');
assert(index.includes('send_page_view:false'), 'GA4 automatic pageview remains enabled');
assert(!index.includes('send_page_view:true'), 'GA4 automatic pageview remains enabled');
assert(index.includes('luxemia:analytics-ready'), 'GA4 readiness handoff is missing');

const analytics = read('src/hooks/useAnalytics.ts');
assert(analytics.includes("window.gtag('event', 'page_view'"), 'explicit SPA page_view event is missing');
assert(analytics.includes('page_location: window.location.href'), 'page_location is missing');
assert(analytics.includes('page_title: document.title'), 'page_title is missing');
assert(!analytics.includes('phone_number'), 'raw telephone data is still sent to GA4');
assert(!analytics.includes('user_data:'), 'PII user_data block remains in GA4');

const popup = read('src/components/home/NewVisitorPopup.tsx');
assert(popup.includes("const WELCOME_DISCOUNT_CODE = 'WELCOME10';"), 'WELCOME10 is missing');
assert(popup.includes('const WELCOME_DISCOUNT_PERCENT = 10;'), '10% welcome offer is missing');
assert(popup.includes("const WELCOME_SIGNUP_SOURCE = 'welcome_popup_10_percent';"), 'welcome signup source is not synchronized');
assert(!/LUXE15|15%|source:\s*'welcome_popup'/.test(popup), 'obsolete popup offer remains');

const edgeFunction = read('supabase/functions/submit-email/index.ts');
assert(edgeFunction.includes('WELCOME_DISCOUNT_CODE = "WELCOME10"'), 'Edge Function code mismatch');
assert(edgeFunction.includes('WELCOME_DISCOUNT_PERCENT = 10'), 'Edge Function percent mismatch');
assert(edgeFunction.includes('SIGNUP_SOURCE = "welcome_popup_10_percent"'), 'Edge Function source mismatch');
assert(edgeFunction.includes('hashIdentifier'), 'hashed abuse identifier protection is missing');
assert(edgeFunction.includes('ALLOWED_VERCEL_PREVIEW'), 'restricted Vercel preview origin support is missing');
assert(!edgeFunction.includes('"Access-Control-Allow-Origin": "*"'), 'wildcard CORS was reintroduced');
assert(!edgeFunction.includes('U.S. orders only'), 'obsolete welcome-email destination claim remains');
assert(!edgeFunction.includes('generateDiscountCode'), 'non-Shopify random discount generator remains');

console.log('[conversion-integrity] OK — GA4 and WELCOME10 source contracts are synchronized without PII.');
