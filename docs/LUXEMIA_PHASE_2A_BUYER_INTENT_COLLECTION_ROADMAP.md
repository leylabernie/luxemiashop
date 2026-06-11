# LuxeMia Phase 2A Buyer-Intent Collection Roadmap

## 1. Executive summary

LuxeMia has already moved beyond a purely generic storefront: the site includes broad category pages, a collection hub, occasion pages, static SEO metadata, generated prerender routes, a dynamic sitemap, `robots.txt`, and `llms.txt`. The next structural opportunity is to shift from broad categories only to buyer-intent collections that match how shoppers search, compare, and buy Indian ethnic wear.

Competitors such as Cbazaar, Utsav Fashion, and Kalki Fashion do not rely only on "sarees", "lehengas", and "suits". They layer navigation and landing pages by product, occasion, wedding role, fabric, style, color, price, readiness, shipping intent, and family role. LuxeMia should adopt that architecture selectively, using only honest inventory signals and avoiding thin or misleading pages.

Phase 2A should remain an audit and implementation plan. Routes should not be added until Phase 2B validates that each page can show at least 3 real matching products, or has a clear strategic reason to exist with transparent "more arriving soon" messaging.

## 2. Current LuxeMia collection audit

### Files inspected

- `src/App.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/pages/Collections.tsx`
- `src/lib/collectionSeoConfig.ts`
- `src/lib/seoMetadata.ts`
- `src/lib/autoRoutes.ts`
- `src/lib/dynamicSitemap.ts`
- `scripts/generate-routes.cjs`
- `scripts/generate-sitemap.cjs`
- Existing collection and occasion pages in `src/pages`
- Supporting merchandising logic in `src/hooks/useShopifyProducts.ts` and `src/lib/productFilters.ts`
- Public crawl/AI files: `public/robots.txt`, `public/llms.txt`, `scripts/routes.json`

### Existing product category pages

| Page | Route | Current notes |
| --- | --- | --- |
| All Collections | `/collections` | Broad collection page with filters, product grid, editorial footer copy, and internal links. Useful hub but not buyer-intent specific enough by itself. |
| Lehengas | `/lehengas` | Strong core category page. Uses `useShopifyPaginatedProducts('lehengas')`, product filters, FAQ schema, and shared metadata. |
| Sarees | `/sarees` | Strong core category page. Uses `useShopifyPaginatedProducts('sarees')`, sorting, FAQ schema, and shared metadata. |
| Suits / Salwar Kameez | `/suits` | Strong core category page. Includes extra safety filtering to keep menswear out of women's suit pages. |
| Menswear | `/menswear` | Core category page for sherwanis and kurta pajama. Uses `useShopifyProducts('menswear')`, filtering, FAQ schema, and shared metadata. |
| Indo-Western | `/indowestern` | Core category route exists and is linked from header/footer. Uses `useShopifyProducts('indowestern')`. |

### Existing collection and subcategory pages

| Page | Route | Current merchandising status |
| --- | --- | --- |
| Bridal Lehengas | `/collections/bridal-lehengas` | Has dedicated hook key `bridal-lehengas`; good route and intent. |
| Wedding Lehengas | `/collections/wedding-lehengas` | Has dedicated hook key `wedding-lehengas`; good route and intent. |
| Lehenga Choli | `/collections/lehenga-choli` | Route exists; should be kept as category synonym if product count remains sufficient. |
| Designer Lehengas | `/collections/designer-lehengas` | Route exists; page applies its own intent filtering from the lehenga feed. |
| Party Wear Lehengas | `/collections/party-wear-lehengas` | Route exists; page applies party-wear filtering from the lehenga feed. |
| Wedding Sarees | `/collections/wedding-sarees` | Route exists; page filters from saree feed by wedding intent. |
| Designer Sarees | `/collections/designer-sarees` | Route exists; page filters from saree feed by designer intent. |
| Silk Sarees | `/collections/silk-sarees` | Route exists; page filters from saree feed by silk intent. |
| Saree Gowns | `/collections/saree-gowns` | Route exists; should be validated for product count because the site also needs a broader pre-draped/ready-to-wear saree strategy. |
| Pakistani Suits | `/collections/pakistani-suits` | Route exists; filters from suits feed. High value for Eid and wedding guest search. |
| Anarkali Suits | `/collections/anarkali-suits` | Route exists; filters from suits feed. |
| Anarkali Gowns | `/collections/anarkali-gowns` | Route exists; filters from suits feed. Validate inventory because gown terminology can be thin. |
| Salwar Kameez | `/collections/salwar-kameez` | Route exists; synonym/SEO route for suits. Keep if canonical role is clear. |
| Palazzo Suits | `/collections/palazzo-suits` | Route exists; filters from suits feed. |
| Sharara Suits | `/collections/sharara-suits` | Route exists; filters from suits feed. High buyer intent. |
| Gharara Suits | `/collections/gharara-suits` | Route exists; filters from suits feed. Validate count separately from sharara. |
| Indo Western Dresses | `/collections/indo-western-dresses` | Route exists; filters from indo-western feed. |
| Kurta Sets | `/collections/kurta-sets` | Route exists; currently filters from women's suit feed, not men's kurta pajama. Naming should be clarified before adding more kurta pages. |

### Existing occasion pages

| Page | Route | Current merchandising status |
| --- | --- | --- |
| Wedding Guest Outfits | `/collections/wedding-guest-outfits` | High-value page. Dedicated hook key exists and excludes bridal/groom signals. |
| Wedding Guest Dresses | `/collections/wedding-guest-dresses` | Existing adjacent page. It pulls all products then filters non-menswear wedding guest intent. Potential overlap with `/collections/wedding-guest-outfits`. |
| Indian Wedding Dresses | `/collections/indian-wedding-dresses` | Existing broad wedding page. Good authority intent, but broad enough to need careful internal-link strategy. |
| Pakistani Wedding Dresses | `/collections/pakistani-wedding-dresses` | Existing page. High search value, but should not overclaim unless inventory supports Pakistani wedding styles. |
| Reception Outfits | `/collections/reception-outfits` | Dedicated hook key exists with reception/cocktail/evening/party-wear rules. |
| Mehendi Outfits | `/collections/mehendi-outfits` | Dedicated hook key exists. Current matcher includes mehendi, mehndi, haldi, and sangeet; this should be split later. |
| Diwali Outfits | `/collections/diwali-outfits` | Dedicated hook key exists. Current matcher allows broad festive/festival/silk/zari terms; should be tightened as inventory grows. |
| Eid Outfits | `/collections/eid-outfits` | Dedicated hook key exists. Strong fit for Pakistani suits, shararas, ghararas, salwar kameez. |
| Navratri Outfits | `/collections/navratri-outfits` | Dedicated hook key exists and only includes explicit Navratri/Garba/Dandiya/Raas signals. This is good and should remain strict. |

### Existing authority pages

| Page | Route | Current role |
| --- | --- | --- |
| Blog | `/blog` and `/blog/:slug` | Large content footprint with wedding, fabric, styling, NRI, saree, lehenga, and care guides. Strong support for internal links into collection pages. |
| NRI hub | `/nri`, `/nri/usa`, `/nri/canada`, `/indian-ethnic-wear-usa`, `/indian-ethnic-wear-canada` | Good GEO and international shipping authority. |
| Brand trust pages | `/brand-story`, `/artisans`, `/sustainability`, `/press` | Brand authority and trust support. |
| Service pages | `/shipping`, `/returns`, `/faq`, `/size-guide`, `/care-guide`, `/style-consultation`, `/style-quiz` | Conversion and trust support. |
| Lookbook | `/lookbook` | Discovery/merchandising support, included in `generate-sitemap.cjs` but not in `dynamicSitemap.ts` static pages. |
| Public AI file | `/llms.txt` | Good start, but it currently lists only a small set of collection URLs. It should be expanded when new buyer-intent pages launch. |

### Existing route, sitemap, robots, and metadata coverage

- `src/App.tsx` contains explicit React routes for the current category and collection pages.
- `src/lib/collectionSeoConfig.ts` contains shared metadata, semantic entities, related collections, and AI search questions for the main collection routes.
- `src/lib/seoMetadata.ts` mirrors collection metadata into static page metadata.
- `scripts/generate-routes.cjs`, `src/lib/autoRoutes.ts`, and `scripts/routes.json` include current prerender routes.
- `scripts/generate-sitemap.cjs` generates collection pages from `scripts/routes.json`, while `src/lib/dynamicSitemap.ts` has its own static page list for the in-app sitemap/XML helper.
- `public/robots.txt` explicitly allows current collection routes and blocks utility/duplicate/filter URL surfaces.
- `public/llms.txt` names key category pages, but does not yet include the newer long-tail occasion and subcategory set.

### Missing buyer-intent pages

High-value missing pages:

- `/collections/sangeet-outfits`
- `/collections/haldi-outfits`
- `/collections/engagement-outfits`
- `/collections/bridesmaid-outfits`
- `/collections/mother-of-the-bride-outfits`
- `/collections/mother-of-the-groom-outfits`
- `/collections/groom-outfits`
- `/collections/groomsmen-outfits`
- `/collections/family-wedding-outfits`
- `/collections/ready-to-ship`
- `/collections/ready-to-wear`
- `/collections/customizable`
- `/collections/indian-outfits-under-100`
- `/collections/lehengas-under-150`
- `/collections/sarees-under-100`
- `/collections/suits-under-150`
- `/collections/kurta-pajama-under-150`
- `/collections/wedding-guest-outfits-under-250`

Medium-value missing pages, dependent on tags/counts:

- `/collections/pre-draped-sarees`
- `/collections/banarasi-sarees`
- `/collections/mirror-work-lehengas`
- `/collections/sequin-sarees`
- `/collections/lightweight-lehengas`
- `/collections/floral-lehengas`
- `/collections/pastel-lehengas`
- `/collections/black-sarees`
- `/collections/red-lehengas`
- `/collections/green-suits`

### Pages that exist but need better merchandising logic

- `/collections/wedding-guest-dresses`: overlaps with `/collections/wedding-guest-outfits`. Keep only if positioned as a synonym landing page or redirect after search data review.
- `/collections/indian-wedding-dresses`: broad authority page should link into bride, bridesmaid, wedding guest, reception, sangeet, mehendi, and groom pages once those exist.
- `/collections/pakistani-wedding-dresses`: should require Pakistani or Muslim wedding intent signals, not just generic wedding products.
- `/collections/mehendi-outfits`: currently includes haldi and sangeet signals. Phase 2B should split those into dedicated pages once counts allow.
- `/collections/diwali-outfits`: current logic allows generic `festive` and `festival wear`; this is acceptable for Diwali only if product imagery and copy do not overclaim Diwali-specific styling.
- `/collections/kurta-sets`: currently maps to women's suit feed. Men's "kurta pajama" should be separate.
- `/collections/saree-gowns`: should be repositioned under "pre-draped" or "ready-to-wear sarees" if inventory supports it.

### Pages that should not exist if inventory is thin

- `/collections/navratri-outfits`: keep only if there are at least 3 products explicitly tagged or titled Navratri, Garba, Dandiya, or Raas. Do not use generic `festival`.
- `/collections/anarkali-gowns`: keep only if gown-specific matches are real and visible.
- `/collections/gharara-suits`: do not inflate from sharara unless products are genuinely gharara.
- `/collections/saree-gowns`: do not inflate from ordinary sarees unless products are genuinely saree gowns, pre-draped sarees, or ready-to-wear sarees.
- Future budget pages: do not launch unless price filters return at least 3 products.
- Future role pages such as mother of bride/groom, bridesmaid, groom, and groomsmen should not launch until products have reliable tags or rules.

## 3. Recommended collection architecture

### A. Product category collections

| Collection | Route | Priority | Reason | Inventory dependency | SEO/GEO value | Conversion value | Timing |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Lehengas | `/lehengas` | High | Core product category already exists. | Existing lehenga product types. | High | High | Implemented |
| Sarees | `/sarees` | High | Core product category already exists. | Existing saree product types. | High | High | Implemented |
| Suits | `/suits` | High | Core women's salwar/suit category already exists. | Existing suit product types and menswear exclusion. | High | High | Implemented |
| Men's Ethnic Wear | `/menswear` | High | Core men's category exists. | Men's product types and tags. | High | High | Implemented |
| Indo Western | `/indowestern` | Medium | Exists as top-level category. | Indo-western/fusion product types. | Medium | Medium | Implemented |
| Pre-Draped Sarees | `/collections/pre-draped-sarees` | High | Strong convenience intent and ready-to-wear search demand. | Need pre-draped, ready-to-wear saree, saree gown tags. | High | High | Next if count >= 3 |
| Sharara Suits | `/collections/sharara-suits` | High | Exists and matches strong wedding/Eid demand. | Sharara suit product types. | High | High | Implemented; improve internal links |
| Pakistani Suits | `/collections/pakistani-suits` | High | Exists and supports Eid/wedding guest demand. | Pakistani suit product types/tags. | High | High | Implemented; improve internal links |
| Kurta Pajama | `/collections/kurta-pajama` | High | Missing exact men's category. | Men's kurta pajama product types. | High | High | Build next if count >= 3 |
| Sherwani / Indo Western Menswear | `/collections/sherwanis` and later `/collections/mens-indo-western` | Medium | Groom and formal men's intent. | Sherwani product types; separate menswear fusion tags. | High | High | Sherwanis next; menswear fusion later |

### B. Occasion collections

| Collection | Route | Priority | Reason | Inventory dependency | SEO/GEO value | Conversion value | Timing |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Wedding Guest Outfits | `/collections/wedding-guest-outfits` | High | Existing page and highest non-bridal wedding intent. | Non-bridal, non-menswear wedding guest matches. | High | High | Implemented; refine copy/links |
| Sangeet Outfits | `/collections/sangeet-outfits` | High | Strong wedding-event query and already appears in logic as a signal. | Sangeet, dance, party wear, lightweight lehenga/sharara/anarkali tags. | High | High | Build next if count >= 3 |
| Mehendi Outfits | `/collections/mehendi-outfits` | High | Existing page. | Mehendi/mehndi green/yellow products. | High | High | Implemented; split out haldi/sangeet |
| Haldi Outfits | `/collections/haldi-outfits` | High | Strong color/ceremony intent. | Haldi/yellow/mustard ceremony products, excluding generic yellow casual unless copy supports it. | High | Medium | Build after count validation |
| Reception Outfits | `/collections/reception-outfits` | High | Existing page. | Reception/cocktail/evening/party wear matches. | High | High | Implemented; improve links |
| Engagement Outfits | `/collections/engagement-outfits` | Medium | Good pre-wedding event intent. | Engagement, ring ceremony, pastel, elegant, reception-adjacent products. | Medium | Medium | Build later if count >= 3 |
| Diwali Outfits | `/collections/diwali-outfits` | High | Existing seasonal page. | Diwali/pooja/festive products; avoid generic festival overuse. | High | Medium seasonal | Implemented; tighten logic |
| Eid Outfits | `/collections/eid-outfits` | High | Existing seasonal page with strong suit inventory fit. | Eid/Pakistani/sharara/gharara/salwar matches. | High | Medium seasonal | Implemented; improve links |
| Navratri / Garba Outfits | `/collections/navratri-outfits` | Low now | Existing page but must stay strict. | Explicit Navratri/Garba/Dandiya/Raas only. | Medium seasonal | Medium seasonal | Keep only if count >= 3 |

### C. Wedding role collections

| Collection | Route | Priority | Reason | Inventory dependency | SEO/GEO value | Conversion value | Timing |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Bride | `/collections/bride` or keep `/collections/bridal-lehengas` | High | Bridal lehengas already exist and rank intent is strong. | Bridal lehenga products. | High | High | Keep existing route; do not create duplicate unless role hub is needed |
| Bridesmaid | `/collections/bridesmaid-outfits` | High | Competitor-style wedding role page; strong NRI wedding planning query. | Pastel, coordinated, non-bridal lehenga/saree/suit products. | High | High | Build next if count >= 3 |
| Mother of Bride / Groom | `/collections/mother-of-the-bride-outfits`, `/collections/mother-of-the-groom-outfits` | Medium | Strong family role queries. | Elegant sarees, silk sarees, anarkali suits; role tagging preferred. | High | Medium | Later unless product tags are added |
| Groom | `/collections/groom-outfits` | High | Men's wedding conversion page. | Groom sherwani and premium menswear. | High | High | Build next if count >= 3 |
| Groomsmen | `/collections/groomsmen-outfits` | Medium | Group-buying intent. | Kurta pajama, sherwani, coordinated menswear. | Medium | High | Later after men's inventory validation |
| Wedding Guest | `/collections/wedding-guest-outfits` | High | Already implemented. | Non-bridal guest products. | High | High | Implemented |
| Family Wedding Outfits | `/collections/family-wedding-outfits` | Medium | Good mixed page for families shopping together. | Mixed women's and men's products, clearly labeled. | Medium | High | Later |

### D. Budget collections

| Collection | Route | Priority | Reason | Inventory dependency | SEO/GEO value | Conversion value | Timing |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Indian Outfits Under $100 | `/collections/indian-outfits-under-100` | High | Strong price intent and accessible positioning. | Any eligible non-jewelry ethnic product under $100. | High | High | Build next if count >= 3 |
| Lehengas Under $150 | `/collections/lehengas-under-150` | Medium | Strong long-tail value, but lehengas may be too thin at this price. | Lehenga products under $150. | Medium | High | Only after count validation |
| Sarees Under $100 | `/collections/sarees-under-100` | High | Likely good fit for accessible sarees. | Saree products under $100. | High | High | Build next if count >= 3 |
| Suits Under $150 | `/collections/suits-under-150` | High | Likely strong fit for salwar/anarkali/sharara products. | Women's suit products under $150. | High | High | Build next if count >= 3 |
| Men's Kurta Pajama Under $150 | `/collections/kurta-pajama-under-150` | Medium | Good price + menswear intent. | Men's kurta pajama under $150. | Medium | High | Later unless count is strong |
| Wedding Guest Outfits Under $250 | `/collections/wedding-guest-outfits-under-250` | High | Combines wedding and budget intent. | Non-bridal wedding guest products under $250. | High | High | Build next if count >= 3 |

### E. Readiness/conversion collections

| Collection | Route | Priority | Reason | Inventory dependency | SEO/GEO value | Conversion value | Timing |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ready to Ship | `/collections/ready-to-ship` | High | High conversion intent for urgent shoppers. | Available/in-stock/ready-to-ship tags or reliable availability. | High | High | Build next if signal is reliable |
| Ready to Wear | `/collections/ready-to-wear` | High | Strong NRI convenience query. | Ready-to-wear/readymade tags and product types. | High | High | Build next if count >= 3 |
| Customizable / Made to Measure | `/collections/customizable` | Medium | Supports fit anxiety and premium conversion. | Custom/made-to-measure/pre-order tags or product metafields. | Medium | High | Later after tagging |
| New Arrivals | `/new-arrivals` | High | Already exists and uses newest products. | Available products sorted by created date. | High | High | Implemented |
| Best Sellers | `/bestsellers` | Medium | Exists, but score is inferred from text and recency. | Bestseller/trending/popular tags or sales data preferred. | Medium | High | Implemented; improve data source later |

### F. Style/fabric/search collections

| Collection | Route | Priority | Reason | Inventory dependency | SEO/GEO value | Conversion value | Timing |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mirror Work Lehengas | `/collections/mirror-work-lehengas` | Medium | Strong style query for wedding/festival. | Mirror work lehenga products. | Medium | Medium | Later |
| Sequin Sarees | `/collections/sequin-sarees` | Medium | Party/reception saree intent. | Sequin saree products. | Medium | Medium | Later |
| Banarasi Sarees | `/collections/banarasi-sarees` | High | High search demand and authority fit. | Banarasi saree products. | High | High | Build next if count >= 3 |
| Silk Sarees | `/collections/silk-sarees` | High | Already exists. | Silk saree products. | High | High | Implemented |
| Lightweight Lehengas | `/collections/lightweight-lehengas` | Medium | Strong guest/sangeet comfort intent. | Lightweight, georgette, chiffon, net, organza, dance-friendly tags. | Medium | High | Later |
| Floral Lehengas | `/collections/floral-lehengas` | Medium | Good spring/summer wedding intent. | Floral lehenga products. | Medium | Medium | Later |
| Pastel Lehengas | `/collections/pastel-lehengas` | Medium | Bridesmaid, mehendi, engagement intent. | Pastel lehenga products. | Medium | Medium | Later |
| Black Sarees | `/collections/black-sarees` | Medium | Color + product long-tail. | Black saree products. | Medium | Medium | Later |
| Red Lehengas | `/collections/red-lehengas` | High | Bridal and wedding query value. | Red lehenga products; must separate bridal vs guest. | High | High | Later after tagging |
| Green Suits | `/collections/green-suits` | Medium | Mehendi/Eid/color query. | Green women's suits. | Medium | Medium | Later |

## 4. Phase 2B implementation recommendation

Build the first 8 to 12 pages only after live product count checks. Recommended order:

1. `Ready to Wear` - high conversion value if readymade/ready-to-wear signals exist.
2. `Ready to Ship` - high conversion value if availability and shipping readiness are reliable.
3. `Sangeet Outfits` - wedding-event search intent; current logic already treats sangeet as a signal.
4. `Haldi Outfits` - high-intent ceremony query; split from Mehendi.
5. `Bridesmaid Outfits` - role-based wedding intent; can use non-bridal pastel/lightweight products.
6. `Groom Outfits` - menswear conversion page for sherwani and premium wedding looks.
7. `Kurta Pajama` - exact men's product query missing from current routes.
8. `Sarees Under $100` - budget + product intent if counts support it.
9. `Suits Under $150` - budget + product intent if counts support it.
10. `Wedding Guest Outfits Under $250` - high-converting long-tail page if enough matches exist.
11. `Banarasi Sarees` - style/fabric authority page if real Banarasi inventory exists.
12. `Pre-Draped Sarees` - convenience/ready-to-wear intent if inventory supports it.

Do not build all 12 automatically. Phase 2B should begin with a product-count audit and implement the first 8 to 12 only where the rules return at least 3 honest matches.

## 5. Technical implementation plan for recommended next pages

### Shared implementation pattern

- Add a page component under `src/pages`.
- Add a lazy import and explicit route in `src/App.tsx`.
- Add metadata to `src/lib/collectionSeoConfig.ts`.
- Add static metadata mapping to `src/lib/seoMetadata.ts`.
- Add collection key support to `src/hooks/useShopifyProducts.ts` or a shared collection-rule module.
- Add route to `scripts/generate-routes.cjs`; regenerate `src/lib/autoRoutes.ts` and `scripts/routes.json` during build or in the implementation PR.
- Ensure `scripts/generate-sitemap.cjs` picks up the route through `scripts/routes.json`.
- Add route to `src/lib/dynamicSitemap.ts` if the in-app sitemap should display it.
- Add allow entry to `public/robots.txt` only after product count validation.
- Add specific URL to `public/llms.txt` only after the page exists.
- Add internal links from `Header.tsx`, `Footer.tsx`, `Collections.tsx`, existing collection footers, and relevant blog posts selectively.

### Ready to Wear

- Route path: `/collections/ready-to-wear`
- Page component name: `ReadyToWear`
- Collection key: `ready-to-wear`
- SEO title: `Ready to Wear Indian Outfits Online | Sarees, Suits & Lehengas - LuxeMia`
- Meta description: `Shop ready to wear Indian outfits online at LuxeMia. Explore readymade sarees, salwar suits, lehengas, and occasionwear with easy sizing and worldwide delivery.`
- H1: `Ready to Wear Indian Outfits`
- Intro copy direction: convenience, no-drape or low-tailoring anxiety, NRI-friendly shopping.
- FAQ topics: ready-to-wear vs made-to-measure, sizing, shipping speed, alterations.
- Internal links to add: `/new-arrivals`, `/sarees`, `/suits`, `/collections/pre-draped-sarees`, `/size-guide`.
- Filtering rules: require ready-to-wear, readymade, stitched, pre-stitched, pre-draped, or product type signals. Do not include unstitched products.
- Sitemap/robots/llms updates needed: add route to routes, metadata, sitemap, robots allow, llms preferred URLs after validation.

### Ready to Ship

- Route path: `/collections/ready-to-ship`
- Page component name: `ReadyToShip`
- Collection key: `ready-to-ship`
- SEO title: `Ready to Ship Indian Outfits Online | Fast Ethnic Wear Delivery - LuxeMia`
- Meta description: `Shop ready to ship Indian outfits at LuxeMia. Find available sarees, suits, lehengas, and menswear for weddings, festivals, and last-minute events.`
- H1: `Ready to Ship Indian Outfits`
- Intro copy direction: urgent event shopping, available items, transparent shipping timelines.
- FAQ topics: ship date, delivery estimate, alterations, order cutoff, international shipping.
- Internal links to add: `/shipping`, `/new-arrivals`, `/collections/wedding-guest-outfits`, `/collections/reception-outfits`.
- Filtering rules: require availableForSale plus ready-to-ship, in-stock, ships fast, express, or inventory-ready tags. Availability alone is not enough if fulfillment timing is unknown.
- Sitemap/robots/llms updates needed: add only after readiness signal is reliable.

### Sangeet Outfits

- Route path: `/collections/sangeet-outfits`
- Page component name: `SangeetOutfits`
- Collection key: `sangeet-outfits`
- SEO title: `Sangeet Outfits Online | Lehengas, Sarees & Sharara Sets - LuxeMia`
- Meta description: `Shop Sangeet outfits online at LuxeMia. Explore dance-friendly lehengas, sharara suits, sarees, and festive Indian outfits for wedding celebrations.`
- H1: `Sangeet Outfits`
- Intro copy direction: movement, sparkle, color, dance-friendly silhouettes, wedding guest and family options.
- FAQ topics: what to wear to a sangeet, best fabrics for dancing, lehenga vs sharara, guest color guidance.
- Internal links to add: `/collections/wedding-guest-outfits`, `/collections/mehendi-outfits`, `/collections/reception-outfits`, `/collections/party-wear-lehengas`.
- Filtering rules: include sangeet, dance, party wear, sequins, lightweight lehenga, sharara, anarkali, reception-adjacent products; exclude bridal/groom products unless explicitly tagged sangeet.
- Sitemap/robots/llms updates needed: add route, metadata, generated routes, sitemap, robots, llms.

### Haldi Outfits

- Route path: `/collections/haldi-outfits`
- Page component name: `HaldiOutfits`
- Collection key: `haldi-outfits`
- SEO title: `Haldi Outfits Online | Yellow Indian Wedding Ceremony Looks - LuxeMia`
- Meta description: `Shop Haldi outfits online at LuxeMia. Explore yellow, mustard, pastel, and lightweight Indian outfits for Haldi ceremonies and pre-wedding celebrations.`
- H1: `Haldi Outfits`
- Intro copy direction: yellow/mustard tones, comfort, daytime ceremony, easy movement.
- FAQ topics: what colors to wear for Haldi, guest etiquette, washable/lightweight fabrics, lehenga vs suit.
- Internal links to add: `/collections/mehendi-outfits`, `/collections/sangeet-outfits`, `/collections/wedding-guest-outfits`, `/suits`.
- Filtering rules: require haldi signal or yellow/mustard ceremony product. Do not include every yellow product if it is casual only.
- Sitemap/robots/llms updates needed: add only after count validation.

### Bridesmaid Outfits

- Route path: `/collections/bridesmaid-outfits`
- Page component name: `BridesmaidOutfits`
- Collection key: `bridesmaid-outfits`
- SEO title: `Indian Bridesmaid Outfits | Sarees, Lehengas & Suits - LuxeMia`
- Meta description: `Shop Indian bridesmaid outfits at LuxeMia. Explore coordinated sarees, lehengas, suits, pastel colors, and wedding party looks for South Asian weddings.`
- H1: `Indian Bridesmaid Outfits`
- Intro copy direction: coordinated but not bridal, pastel palettes, easy group styling.
- FAQ topics: what Indian bridesmaids wear, color coordination, avoiding bridal red/heavy bridal looks, sizing for groups.
- Internal links to add: `/collections/wedding-guest-outfits`, `/collections/sangeet-outfits`, `/collections/mehendi-outfits`, `/collections/pastel-lehengas`.
- Filtering rules: include bridesmaid tags if available; otherwise use non-bridal wedding guest products with pastel/lightweight/coordinated signals. Exclude bridal and groom products.
- Sitemap/robots/llms updates needed: add after validation.

### Groom Outfits

- Route path: `/collections/groom-outfits`
- Page component name: `GroomOutfits`
- Collection key: `groom-outfits`
- SEO title: `Indian Groom Outfits Online | Sherwanis & Wedding Menswear - LuxeMia`
- Meta description: `Shop Indian groom outfits online at LuxeMia. Explore sherwanis, kurta pajama sets, and wedding menswear for ceremonies, receptions, and family events.`
- H1: `Indian Groom Outfits`
- Intro copy direction: sherwani, premium menswear, wedding ceremony, reception styling, fit guidance.
- FAQ topics: what does an Indian groom wear, sherwani vs kurta pajama, sizing, matching bride/family colors.
- Internal links to add: `/menswear`, `/collections/kurta-pajama`, `/collections/sherwanis`, `/size-guide`.
- Filtering rules: require menswear plus groom/sherwani/wedding signals. Do not include women's bridal products.
- Sitemap/robots/llms updates needed: add after count validation.

### Kurta Pajama

- Route path: `/collections/kurta-pajama`
- Page component name: `KurtaPajama`
- Collection key: `kurta-pajama`
- SEO title: `Kurta Pajama Online | Indian Ethnic Wear for Men - LuxeMia`
- Meta description: `Shop kurta pajama online at LuxeMia. Explore men's kurta pajama sets for weddings, festivals, Eid, Diwali, and family celebrations.`
- H1: `Kurta Pajama for Men`
- Intro copy direction: comfortable men's ethnic wear, wedding guest, festival, family events.
- FAQ topics: kurta pajama sizing, occasions, cotton vs silk, styling with jackets.
- Internal links to add: `/menswear`, `/collections/groom-outfits`, `/collections/kurta-pajama-under-150`, `/shipping`.
- Filtering rules: require menswear plus kurta pajama/kurta set/dhoti kurta/pathani signals. Exclude women's kurta sets.
- Sitemap/robots/llms updates needed: add after count validation.

### Sarees Under $100

- Route path: `/collections/sarees-under-100`
- Page component name: `SareesUnder100`
- Collection key: `sarees-under-100`
- SEO title: `Sarees Under $100 | Affordable Indian Sarees Online - LuxeMia`
- Meta description: `Shop sarees under $100 at LuxeMia. Explore affordable Indian sarees for parties, festivals, weddings, and everyday celebrations.`
- H1: `Sarees Under $100`
- Intro copy direction: accessible pricing, transparent value, fabric and styling guidance.
- FAQ topics: quality under $100, shipping, blouse/stitching expectations, party vs casual sarees.
- Internal links to add: `/sarees`, `/collections/silk-sarees`, `/collections/diwali-outfits`, `/shipping`.
- Filtering rules: saree products with min variant price under 100 USD. Exclude jewelry and non-saree products.
- Sitemap/robots/llms updates needed: add only if count >= 3.

### Suits Under $150

- Route path: `/collections/suits-under-150`
- Page component name: `SuitsUnder150`
- Collection key: `suits-under-150`
- SEO title: `Indian Suits Under $150 | Salwar Kameez & Anarkali Sets - LuxeMia`
- Meta description: `Shop Indian suits under $150 at LuxeMia. Explore affordable salwar kameez, anarkali suits, sharara suits, and festive outfits.`
- H1: `Indian Suits Under $150`
- Intro copy direction: budget-friendly suits, festivals, Eid, wedding guests, readymade value.
- FAQ topics: sizing, fabric quality, ready-to-wear vs unstitched, best occasions.
- Internal links to add: `/suits`, `/collections/anarkali-suits`, `/collections/pakistani-suits`, `/collections/eid-outfits`.
- Filtering rules: women's suit products under 150 USD; apply existing menswear exclusion.
- Sitemap/robots/llms updates needed: add only if count >= 3.

### Wedding Guest Outfits Under $250

- Route path: `/collections/wedding-guest-outfits-under-250`
- Page component name: `WeddingGuestOutfitsUnder250`
- Collection key: `wedding-guest-outfits-under-250`
- SEO title: `Indian Wedding Guest Outfits Under $250 | LuxeMia`
- Meta description: `Shop Indian wedding guest outfits under $250 at LuxeMia. Explore sarees, suits, lehengas, and reception-ready looks at accessible prices.`
- H1: `Indian Wedding Guest Outfits Under $250`
- Intro copy direction: budget-sensitive wedding guest shopping without looking casual.
- FAQ topics: wedding guest budget, what not to wear, fabric choice, delivery timing.
- Internal links to add: `/collections/wedding-guest-outfits`, `/collections/reception-outfits`, `/collections/sangeet-outfits`, `/sarees`, `/suits`.
- Filtering rules: non-bridal, non-menswear wedding guest products under 250 USD. Exclude bridal and groom products.
- Sitemap/robots/llms updates needed: add only if count >= 3.

### Banarasi Sarees

- Route path: `/collections/banarasi-sarees`
- Page component name: `BanarasiSarees`
- Collection key: `banarasi-sarees`
- SEO title: `Banarasi Sarees Online | Silk & Wedding Sarees - LuxeMia`
- Meta description: `Shop Banarasi sarees online at LuxeMia. Explore Banarasi silk sarees, zari styles, wedding sarees, and festive Indian sarees.`
- H1: `Banarasi Sarees`
- Intro copy direction: fabric heritage, zari, wedding/festival use, authenticity signals.
- FAQ topics: what is a Banarasi saree, Banarasi vs Kanjivaram, wedding use, care.
- Internal links to add: `/sarees`, `/collections/silk-sarees`, `/collections/wedding-sarees`, `/care-guide`.
- Filtering rules: require Banarasi/Benares/Kashi Banarasi signal in product type, title, tag, or description.
- Sitemap/robots/llms updates needed: add only if count >= 3.

### Pre-Draped Sarees

- Route path: `/collections/pre-draped-sarees`
- Page component name: `PreDrapedSarees`
- Collection key: `pre-draped-sarees`
- SEO title: `Pre-Draped Sarees Online | Ready to Wear Sarees - LuxeMia`
- Meta description: `Shop pre-draped sarees online at LuxeMia. Explore ready to wear sarees, saree gowns, and easy Indian occasionwear for weddings and parties.`
- H1: `Pre-Draped Sarees`
- Intro copy direction: easy draping, modern convenience, reception and guest dressing.
- FAQ topics: pre-draped vs regular saree, sizing, blouse/petticoat expectations, wedding guest use.
- Internal links to add: `/sarees`, `/collections/saree-gowns`, `/collections/ready-to-wear`, `/collections/reception-outfits`.
- Filtering rules: require pre-draped, ready-to-wear saree, saree gown, stitched saree, or similar signal. Do not include ordinary sarees.
- Sitemap/robots/llms updates needed: add only if count >= 3.

## 6. Safeguards

- Do not show bridal products under Navratri unless explicitly tagged Navratri, Garba, Dandiya, or Raas.
- Do not show men's products in women's pages unless the page is intentionally mixed and labeled as mixed.
- Do not show women's products in men's pages. `Kurta Sets` for women and `Kurta Pajama` for men must remain separate.
- Do not create route pages for inventory with fewer than 3 real matching products unless there is a strategic reason and the page clearly says "more arriving soon."
- Do not use generic `festival` as a Navratri signal.
- Do not inflate categories just to make pages look full.
- Product count honesty is better than wrong merchandising.
- Do not use `availableForSale` alone as a ready-to-ship signal unless fulfillment timing is verified.
- Do not treat "party wear" as wedding guest if the product is bridal-heavy or groom-specific.
- Do not use color-only rules for role pages without additional event/style context.
- Do not add routes to `robots.txt`, `llms.txt`, or sitemap generation until the page exists and the inventory rule passes.
- Keep redirects for legacy `/collections/*` paths that already map to top-level pages; do not create duplicate canonical surfaces.
- Keep checkout/cart/Shopify integration/middleware/prerender architecture unchanged during collection expansion.

## 7. Final recommendation

Next PR should implement:

1. A shared buyer-intent collection rule map with reusable product-count validation before route launch.
2. The first validated pages from this list: Ready to Wear, Ready to Ship, Sangeet Outfits, Haldi Outfits, Bridesmaid Outfits, Groom Outfits, Kurta Pajama, Sarees Under $100, Suits Under $150, Wedding Guest Outfits Under $250, Banarasi Sarees, and Pre-Draped Sarees.
3. Metadata entries in `collectionSeoConfig.ts` and `seoMetadata.ts` for only the pages that pass count validation.
4. Explicit routes in `App.tsx` and generated route/sitemap updates for only those validated pages.
5. Navigation links in Header/Footer only for the highest-value pages; secondary internal links from existing collection pages and blog posts for the rest.
6. `public/llms.txt` and `public/robots.txt` updates only after the page is live, indexable, and honestly merchandised.
7. A thin-inventory guard that hides or noindexes a page when fewer than 3 matching products remain, unless the page uses transparent "more arriving soon" messaging.

