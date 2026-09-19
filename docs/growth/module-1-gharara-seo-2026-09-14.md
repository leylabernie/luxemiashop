# LuxeMia Module 1 — high-intent product SEO

Date: 2026-09-14. Scope: one verified product. Target: five organic orders per week; no ranking, traffic or order outcome is guaranteed.

## Exact product

- URL: https://luxemia.shop/product/royal-purple-georgette-embroidered-gharara-set-003
- Shopify ID: gid://shopify/Product/8930615296171
- Primary buyer phrase: royal purple georgette gharara suit set
- Supporting phrases: purple gharara suit with dupatta; georgette gharara set for wedding guests; three-piece gharara suit with bead embroidery.
- Search volume and competition: not measured. These terms match product facts; they are not claimed to be proven low-competition keywords.
- Source: the native Shopify product description and L, XL, XXL variants, checked September 14. Price at check: USD 89.97.
- Scope of edit: product title, SEO title, SEO description, body copy and the existing source-verification tag after checking the facts used in this copy. Original tags are retained.
- Existing handle, prices, variants, inventory, images, shipping settings and return policy are outside this edit.

## Product title / H1

```text
Royal Purple Georgette Gharara Suit Set with Bead Embroidery
```

## Search title

```text
Royal Purple Georgette Gharara Suit Set | LuxeMia
```

## Meta description

```text
Shop a royal purple georgette gharara suit set with bead embroidery, top, bottoms and dupatta. Sizes L–XXL. View fit and delivery details at LuxeMia.
```

## Product description — HTML

```html
<p>Shop this royal purple georgette gharara suit set for weddings and festive evenings. The three-piece outfit combines an embroidered top, gharara bottoms and a coordinating dupatta, with bead embroidery and detailed borders.</p>
<h2>What comes with this gharara suit set?</h2>
<p><strong>Set includes:</strong> Embroidered top, gharara bottoms and coordinating dupatta.</p>
<h2>What fabric and embroidery does it have?</h2>
<p>The set uses georgette fabric with bead embroidery. Review both product photographs for the royal-purple color, embroidery and border details.</p>
<h2>Which sizes can I choose?</h2>
<p>The listed sizes are L, XL and XXL. Check the size guide and your selected size before ordering. Contact LuxeMia if you need help comparing the fit.</p>
<h2>What occasions is it suited to?</h2>
<p>This purple three-piece gharara outfit is suited to Indian weddings, festive evenings and special celebrations. If you have a fixed event date, ask LuxeMia about the item's processing and delivery timing before you order.</p>
<p><a href="/collections/gharara-suits">Shop more gharara suit sets</a> or <a href="/contact">ask a product or sizing question</a>.</p>
```

## Reproducible Shopify operation

The following operation was schema-validated before execution. Its variables below are the exact September 14 payload, including the unchanged handle. This records the applied update; do not replay the snapshot over later product changes.

```graphql
mutation LuxeMiaModule1SEO($product: ProductUpdateInput!) {
  productUpdate(product: $product) {
    product {
      id
      handle
      title
      tags
      seo { title description }
    }
    userErrors { field message }
  }
}
```

```json
{
  "product": {
    "descriptionHtml": "<p>Shop this royal purple georgette gharara suit set for weddings and festive evenings. The three-piece outfit combines an embroidered top, gharara bottoms and a coordinating dupatta, with bead embroidery and detailed borders.</p>\n<h2>What comes with this gharara suit set?</h2>\n<p><strong>Set includes:</strong> Embroidered top, gharara bottoms and coordinating dupatta.</p>\n<h2>What fabric and embroidery does it have?</h2>\n<p>The set uses georgette fabric with bead embroidery. Review both product photographs for the royal-purple color, embroidery and border details.</p>\n<h2>Which sizes can I choose?</h2>\n<p>The listed sizes are L, XL and XXL. Check the size guide and your selected size before ordering. Contact LuxeMia if you need help comparing the fit.</p>\n<h2>What occasions is it suited to?</h2>\n<p>This purple three-piece gharara outfit is suited to Indian weddings, festive evenings and special celebrations. If you have a fixed event date, ask LuxeMia about the item's processing and delivery timing before you order.</p>\n<p><a href=\"/collections/gharara-suits\">Shop more gharara suit sets</a> or <a href=\"/contact\">ask a product or sizing question</a>.</p>",
    "handle": "royal-purple-georgette-embroidered-gharara-set-003",
    "id": "gid://shopify/Product/8930615296171",
    "seo": {
      "description": "Shop a royal purple georgette gharara suit set with bead embroidery, top, bottoms and dupatta. Sizes L–XXL. View fit and delivery details at LuxeMia.",
      "title": "Royal Purple Georgette Gharara Suit Set | LuxeMia"
    },
    "tags": [
      "bead work",
      "embroidered",
      "fabric:Georgette",
      "georgette",
      "gharara set",
      "party wear",
      "royal purple",
      "three piece",
      "wedding wear",
      "work:Beads",
      "facts:source-verified"
    ],
    "title": "Royal Purple Georgette Gharara Suit Set with Bead Embroidery"
  }
}
```

Documentation: https://shopify.dev/docs/api/admin-graphql/2026-07/mutations/productUpdate and https://shopify.dev/docs/api/admin-graphql/2026-07/input-objects/SEOInput .

## Headless implementation

The current frontend already reads Shopify SEO titles and uses the audited product description and SEO description for products tagged `facts:source-verified`. This product's new copy contains only its existing color, fabric, embroidery, included pieces, listed sizes and occasion use; it introduces no dispatch, silk-fiber-content, measurement, discount or guaranteed-arrival claim.

Shopify returned no mutation errors. A separate read confirmed the title, unchanged handle, body, preserved tags and SEO fields. The Vercel build must succeed and the public product HTML must be checked before calling the storefront update live. This file deliberately does not claim that its own build or deployment has already completed.

Use the existing Product/Offer and Breadcrumb generation; do not add duplicate schema or static stock claims. The new description links to the existing gharara collection and contact page.

## Standalone modules

1. Product SEO: this single-product implementation and reusable exact payload.
2. Checkout recovery: first email 30 minutes after abandonment with a helpful sizing angle; second email 24 hours after abandonment with verified LUXE10 eligibility and terms. Actual platform timing, stop-on-purchase behavior and test delivery must be verified in Module 2. An exact send-time guarantee is not made before checking platform capabilities.
3. Social search: real product demonstrations with three-sentence, product-specific Instagram @luxemiausa and TikTok captions. Describe only the fabric, color, work, fit and occasion supported by that product.

Modules 2 and 3 have not been executed by this module. Module 2 starts when the user types Next.
