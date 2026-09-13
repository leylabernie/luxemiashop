const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const architecture = JSON.parse(read('src/config/seoArchitecture.json'));
const usa = JSON.parse(read('src/config/usaLandingPage.json'));

test('commercial titles retain target phrases without truncation', () => {
  const routes = architecture.routes;
  assert.equal(routes['/'].title, 'Indian Ethnic Wear Online USA | LuxeMia');
  assert.match(routes['/collections/sharara-suits'].title, /^Sharara Suits Online USA/);
  assert.match(routes['/collections/gharara-suits'].title, /^Gharara Suit Sets Online USA/);
  for (const seo of [routes['/'], routes['/collections/sharara-suits'], routes['/collections/gharara-suits'], usa]) {
    assert.ok(seo.title.length <= 58, seo.title);
    assert.ok(seo.description.length <= 155, seo.description);
  }
});

test('USA buyer terms share one source across browser and prerender', () => {
  assert.equal(usa.buyerDetails.length, 4);
  assert.match(usa.buyerDetails[1].copy, /3–5 business-day processing/);
  assert.match(usa.buyerDetails[1].copy, /not the arrival time/);
  assert.match(usa.buyerDetails[3].copy, /48 hours/);
  for (const source of ['src/pages/nri/USA.tsx', 'src/pages/nri/NRILandingPage.tsx', 'src/lib/seoMetadata.ts', 'scripts/prerender.js']) {
    assert.ok(read(source).includes('usaLandingPage.json'), source);
  }
  assert.ok(JSON.parse(read('scripts/approved-sitemap-inventory.json')).paths.includes('/indian-ethnic-wear-usa'));
  assert.ok(read('src/pages/Index.tsx').includes("href: '/indian-ethnic-wear-usa'"));
  assert.ok(read('src/pages/nri/NRILandingPage.tsx').includes('to="/nri"'));
  assert.ok(read('src/pages/nri/NRILandingPage.tsx').includes('to="/indian-ethnic-wear-usa"'));
});

test('homepage brand graph preserves social identities and functional search target', () => {
  const graph = [...read('index.html').matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap((match) => { const data = JSON.parse(match[1]); return data['@graph'] ?? [data]; });
  const organization = graph.find((node) => node['@type'] === 'Organization');
  const website = graph.find((node) => node['@type'] === 'WebSite');
  assert.ok(organization.logo);
  assert.ok(organization.sameAs.length >= 2);
  assert.equal(website.publisher['@id'], organization['@id']);
  assert.equal(website.potentialAction.target.urlTemplate, 'https://luxemia.shop/?q={search_term_string}');
  assert.ok(read('src/components/layout/Header.tsx').includes("searchParams.get('q')"));
  assert.ok(read('src/components/search/ProductSearch.tsx').includes('useState(initialQuery)'));
});
