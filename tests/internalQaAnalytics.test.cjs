const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const scripts = [read('index.html'), read('src/middleware/htmlGenerator.ts')].map(source => [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('window.luxemiaAnalyticsEnabled')));
function run(script, { host='luxemia.shop', search='', storage=new Map(), blocked=false, idle=true }={}) {
  const scheduled=[], loaded=[];
  const consent=['consent','default',{analytics_storage:'denied'}];
  const context={URLSearchParams, location:{hostname:host,search}, dataLayer:[consent],
    sessionStorage:{getItem(k){if(blocked)throw Error('blocked');return storage.get(k)},setItem(k,v){if(blocked)throw Error('blocked');storage.set(k,v)},removeItem(k){if(blocked)throw Error('blocked');storage.delete(k)}},
    document:{createElement:()=>({}),head:{appendChild:s=>loaded.push(s)}},
    addEventListener:(_n,cb)=>scheduled.push(cb),setTimeout:cb=>scheduled.push(cb)};
  context.window=context;if(idle)context.requestIdleCallback=cb=>scheduled.push(cb);
  vm.runInNewContext(script,context);
  while(scheduled.length)scheduled.shift()();
  return {context, loaded, consent, storage};
}
for(const [i,script] of scripts.entries()) {
  const surface=i?'generated product HTML':'app bootstrap';
  for(const host of ['luxemia.shop','www.luxemia.shop'])test(`${surface}: normal ${host} tracks with unchanged config`,()=>{
    const {context,loaded,consent}=run(script,{host});
    assert.equal(context.luxemiaAnalyticsEnabled,true);
    assert.equal(context.dataLayer[0],consent);
    assert.equal(loaded.length,1);
    assert.equal(loaded[0].src,'https://www.googletagmanager.com/gtag/js?id=G-D1NN0TC3Y0');
    const config=Array.from(context.dataLayer[2]);assert.equal(config[1],'G-D1NN0TC3Y0');
    assert.equal(config[2].send_page_view,Boolean(i));assert.equal(config[2].allow_google_signals,true);
    context.gtag('event','add_to_cart',{value:10});assert.equal(context.dataLayer.length,4);
  });
  for(const host of ['luxemiashop-preview.vercel.app','luxemiashop.vercel.app','localhost','127.0.0.1','luxemia.shop.example.com','example.com'])test(`${surface}: ${host} never loads or queues GA`,()=>{
    const {context,loaded,consent}=run(script,{host,search:'?luxemia_qa=0'});
    context.gtag('event','page_view',{});context.gtag('event','purchase',{});
    assert.equal(context.luxemiaAnalyticsEnabled,false);assert.equal(loaded.length,0);assert.deepEqual(context.dataLayer,[consent]);
  });
  test(`${surface}: explicit opt-in persists only in session and clear restores next load`,()=>{
    const storage=new Map();let state=run(script,{search:'?luxemia_qa=1',storage});
    assert.equal(state.context.luxemiaAnalyticsEnabled,false);assert.equal(state.loaded.length,0);
    state.context.gtag('event','begin_checkout',{});assert.equal(state.context.dataLayer.length,1);
    assert.deepEqual([...storage.entries()],[['luxemia.analytics.qa','1']]);
    state=run(script,{storage});assert.equal(state.context.luxemiaAnalyticsEnabled,false);
    state=run(script,{search:'?luxemia_qa=0',storage});assert.equal(state.context.luxemiaAnalyticsEnabled,true);assert.equal(storage.size,0);
    assert.equal(run(script,{storage}).context.luxemiaAnalyticsEnabled,true);
  });
  test(`${surface}: blocked storage still respects explicit QA flag; invalid values do not opt in`,()=>{
    assert.equal(run(script,{search:'?luxemia_qa=1',blocked:true}).context.luxemiaAnalyticsEnabled,false);
    assert.equal(run(script,{search:'?luxemia_qa=0',blocked:true}).context.luxemiaAnalyticsEnabled,true);
    assert.equal(run(script,{search:'?luxemia_qa=yes'}).context.luxemiaAnalyticsEnabled,true);
    assert.equal(run(script,{blocked:true}).context.luxemiaAnalyticsEnabled,true);
  });
  test(`${surface}: load fallback is also suppressed during QA`,()=>{
    assert.equal(run(script,{search:'?luxemia_qa=1',idle:false}).loaded.length,0);
    assert.equal(run(script,{idle:false}).loaded.length,1);
  });
}
test('app and generated product HTML have identical host/session policy',()=>{
  const policy=s=>s.slice(s.indexOf('window.luxemiaAnalyticsEnabled = false;'),s.indexOf('      })();')+11).trim();
  assert.equal(policy(scripts[0]),policy(scripts[1]));
});
test('all analytics helpers, including SPA page views, respect QA guard even with another gtag function',()=>{
  const code=buildSync({entryPoints:[path.join(root,'src/hooks/useAnalytics.ts')],bundle:true,write:false,platform:'node',format:'cjs',external:['react','react-router-dom']}).outputFiles[0].text;
  const events=[];const window={luxemiaAnalyticsEnabled:false,location:{href:'https://luxemia.shop/'},gtag:(...x)=>events.push(x)};
  const module={exports:{}};
  const req=name=>name==='react'?{useEffect:cb=>cb()}:{useLocation:()=>({pathname:'/',search:''})};
  new Function('require','module','exports','window','document',code)(req,module,module.exports,window,{title:'Test'});
  const api=module.exports;const item={id:'1',name:'Public product',price:10};
  const exercise=()=>{
    api.usePageTracking();api.trackViewItem(item);api.trackAddToCart(item);api.trackRemoveFromCart(item);api.trackViewCart([item]);
    api.trackViewItemList([item],'list','List');api.trackSelectItem(item,'list','List');api.trackAddToWishlist(item);
    api.trackBeginCheckout([item]);api.trackCheckoutHandoffSuccess([item]);api.trackAddShippingInfo([item],10,'standard');api.trackAddPaymentInfo([item],10);
    api.trackPurchase({transactionId:'SYNTHETIC-LOCAL-ONLY',value:10,items:[item]});api.trackRefund({transactionId:'SYNTHETIC-LOCAL-ONLY',value:10,items:[item]});
    api.trackConsultationSubmission({});api.trackConsultationBookingAttempt('email');
  };
  exercise();assert.equal(events.length,0);window.luxemiaAnalyticsEnabled=true;exercise();assert.equal(events.length,16);
});
