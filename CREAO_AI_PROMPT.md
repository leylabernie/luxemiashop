# Creao AI Prompt: Generate Shopify Import CSV from Supplier Website

## Task

Scrape product data from the supplier website **wholesalesalwar.com** and generate a **Shopify CSV import file** for the store **LuxemiaShop** (luxemia.shop). The CSV must be in Shopify's exact format so it can be directly imported via Shopify Admin → Products → Import.

---

## Supplier Website Structure

**Base URL:** `https://www.wholesalesalwar.com`

The site has 3 main product categories:
- **Sarees:** `https://www.wholesalesalwar.com/sarees`
- **Salwar Kameez / Suits:** `https://www.wholesalesalwar.com/salwar-kameez`
- **Sherwanis (Menswear):** `https://www.wholesalesalwar.com/sherwanis`

Each category page lists products as paginated grids. Each product card links to a detail page.

### Product Detail Page Structure

Each product page at a URL like `https://www.wholesalesalwar.com/product-name-123456` contains:

1. **Product title** — e.g., "Silk Blue Wedding Wear Embroidery Work Saree"
2. **Images** — Multiple product images hosted on CDN at `https://kesimg.b-cdn.net/...`
   - Image URLs follow the pattern: `https://kesimg.b-cdn.net/images/650/YYYYy/Month/CatalogID/Product-Name-BRAND-CODE(N).jpg`
   - Where N = 1, 2, 3... for multiple images
   - The `(1).jpg` image is always the main/model shot
3. **Prices** — Two prices displayed:
   - **Selling price** (INR): Found in `.price-sec` (bold, not strikethrough) — this is the discounted retail price
   - **MRP** (INR): Found in `.price-sec.text-decoration-line-through` — this is the original MRP, typically ~22% higher than selling price
4. **Product URL slug** — The last part of the URL, e.g., `silk-blue-wedding-wear-embroidery-work-saree-394443`
5. **SKU/catalog code** — A 4-6 digit number embedded in the URL (e.g., `394443`, `8309`, `66683`)

### Key Data Extraction Rules

- **Extract the SELLING price** (the non-strikethrough bold one), NOT the MRP. This is the INR price we use for our USD conversion.
- **Extract ALL product images** from the product page gallery (usually 2-5 images per product). Image URLs must be the full `https://kesimg.b-cdn.net/...` URLs.
- **Extract the catalog/design code** from the product URL (the numeric suffix after the last hyphen).

---

## Pricing Formula (CRITICAL — Follow Exactly)

All prices are in **USD**. Convert from INR using this formula:

```
USD_selling_price = INR_selling_price × 2 ÷ 90
USD_compare_at_price = USD_selling_price × 1.43
```

**Round both to 2 decimal places** (e.g., $98.99, $291.99).

**Always use the per-product INR selling price** — do NOT use a flat/average rate. Each product has a different INR price, so each product gets a different USD price.

### Example Calculations

| INR Selling Price | USD Price (INR×2÷90) | Compare-At (USD×1.43) |
|---|---|---|
| ₹4,455 | $98.99 | $141.56 |
| ₹13,145 | $291.99 | $417.55 |
| ₹9,895 | $219.89 | $314.44 |
| ₹30,095 | $668.78 | $956.36 |

---

## Product Title Format

Extract the title from the supplier page and use it **as-is**. The title follows this pattern:

```
[Fabric] [Color] [Occasion] [Work Type] [Product Type]
```

Examples:
- "Silk Blue Wedding Wear Embroidery Work Saree"
- "Lycra Mauve Festival Wear Sequins Work Readymade Saree"
- "Art Silk Beige Groom Wear Thread Work Readymade Sherwani"
- "Crepe Silk Multi Color Party Wear Embroidery Work Readymade Plazzo Suit"

### Disambiguation Rule for Duplicate Titles

If two or more products share the same base title (same fabric + color + occasion + work + type), append the **catalog/design code** in parentheses to differentiate:

- "Silk Beige Wedding Wear Embroidery Work Saree (8304)"
- "Silk Beige Wedding Wear Embroidery Work Saree (8308)"

**Use the ACTUAL catalog code number from the URL**, NOT generic labels like "Variant #1" or "Catalog #1".

---

## URL Handle Format

Convert the product title + URL code to a slug:

```
lowercase-title-words-joined-by-hyphens-URLCODE
```

Example: "Silk Blue Wedding Wear Embroidery Work Saree" with URL code `394443` →
`silk-blue-wedding-wear-embroidery-work-saree-394443`

**If the title has a disambiguation code in parentheses, do NOT include the parentheses in the handle.** The URL code at the end is sufficient for uniqueness.

---

## Product Description Format (HTML)

Generate a boutique-style HTML description for each product using this template:

```html
<p><em>[Opening line — rotate between these: "Where heritage meets modern sophistication - this is that piece.", "Style is a form of self-expression. This piece speaks volumes.", "When the occasion calls for something unforgettable, this answers.", "Quiet confidence. Considered craftsmanship. One extraordinary outfit.", "Some outfits are worn. This one is experienced.", "Elegance isn't loud. It's this."]</em></p>

<h2>[Product Title]</h2>

<p>Meet the <strong>[Product Title]</strong> - a beautifully crafted <strong>[product type lowercase]</strong> made for [occasion] celebrations. Whether you're dressing for a wedding ceremony, a festive reception, or any celebration that calls for something extraordinary, this piece delivers the perfect balance of heritage, elegance, and contemporary style.</p>

<h3>The Fabric</h3>
<p><strong>[Fabric].</strong> [Fabric description — use appropriate blurb from fabric guide below]</p>

<h3>The Work</h3>
<p><strong>[Work Type].</strong> [Work description — use appropriate blurb from work guide below]</p>

<h3>Why You'll Love This Piece</h3>
<ul>
  <li><strong>Colour:</strong> A carefully selected <strong>[Color]</strong> tone - flattering across skin tones, stunning in photographs, and rich under both natural and indoor lighting.</li>
  <li><strong>Fabric:</strong> [Fabric] - chosen for its drape, longevity, and the way it makes the wearer feel as good as they look.</li>
  <li><strong>Occasion:</strong> Crafted for [occasion] - equally beautiful at intimate family gatherings and grand celebrations.</li>
  <li><strong>Silhouette:</strong> Designed to move with you, not restrict you - flattering across a wide range of body types.</li>
  <li><strong>Provenance:</strong> Sourced from India's finest textile regions and curated by our boutique team for exceptional quality.</li>
</ul>

<h3>Styling Notes</h3>
<p>[Rotate between: "Style with minimal accessories to let the craftsmanship speak - or layer with heirloom jewellery for full festive drama.", "Style with a sleek bun and bold bindi for timeless Indian elegance, or let it flow loose for contemporary bridal glamour.", "Drape it with confidence and let the fabric do the talking - pair with statement jhumkas for a look that commands the room.", "Complete the look with kundan jewellery and embellished heels for a showstopping entrance."]</p>

<h3>Common Questions</h3>
<p><strong>What occasions is this [product type] suitable for?</strong> This [product type] works beautifully for wedding ceremonies, festive gatherings, religious celebrations, reception events, and any occasion that calls for something extraordinary.</p>
<p><strong>Is the blouse included?</strong> Yes, this [product type] comes with a matching blouse piece that can be stitched to your measurements.</p>
<p><strong>How do I care for this fabric?</strong> We recommend dry cleaning to preserve the embroidery and fabric quality. Store folded in a cool, dry place away from direct sunlight.</p>

<p><small>Tags: [color lowercase], [fabric lowercase], [product type lowercase], buy online, Indian ethnic wear USA, boutique Indian fashion, designer, traditional Indian wear online</small></p>
```

### Fabric Descriptions

| Fabric | Description |
|--------|-------------|
| Silk | Luxurious, luminous, and steeped in tradition - silk catches the light with every fold, creating a regal presence that transforms any occasion into something extraordinary. |
| Lycra | Fluid, figure-flattering, and effortlessly comfortable - lycra drapes like a dream and moves with you, making it the perfect canvas for artistic detail. |
| Art Silk | The elegance of silk with practical durability - art silk offers a luminous sheen and graceful drape that rivals pure silk at a more accessible price point. |
| Crepe Silk | Textured sophistication meets fluid grace - crepe silk offers a subtle matte finish with an incredibly flattering drape that moves beautifully. |
| Banarasi Jacquard | Woven on traditional looms with intricate jacquard patterns - this heritage fabric carries centuries of Banarasi weaving tradition in every thread. |
| Chinnon | Lightweight and lustrous with a subtle sheen - chinnon is prized for its ethereal drape and effortless elegance that transitions from day to evening. |
| Silk Blend | The best of both worlds - silk blend combines the natural lustre of silk with added durability and texture, creating a fabric that's both practical and luxurious. |
| Georgette | Sheer elegance with a subtle crepe texture - georgette is lightweight, flowy, and creates beautiful movement that adds drama to any silhouette. |
| Net | Delicate and dreamlike - net fabric creates volume and ethereal beauty, perfect for layered looks that make a grand entrance. |
| Velvet | Rich, plush, and unmistakably opulent - velvet adds depth and warmth with its signature soft pile that catches light in the most flattering way. |
| Organza | Crisp and ethereal with a gentle stiffness - organza creates architectural silhouettes and adds a modern, sculptural quality to traditional designs. |

### Work Descriptions

| Work Type | Description |
|-----------|-------------|
| Embroidery Work | Intricate embroidery that transforms fabric into art - each stitch placed with precision to create patterns that captivate up close and from across the room. |
| Sequins Work | Dazzling sequin artistry that catches the light with every movement - creating a showstopping sparkle effect. |
| Thread Work | Delicate thread work that weaves stories into fabric - each motif hand-guided to create texture and visual depth that photographs beautifully. |
| Zari Work | Metallic zari weaving that adds a luminous golden or silver shimmer - a centuries-old technique that signals celebration and grandeur. |
| Stone Work | Hand-placed stones and crystals that create constellations of light across the fabric - each one secured with care for lasting brilliance. |
| Mirror Work | Traditional mirror work (shisha) that catches and reflects light in mesmerizing patterns - a Rajasthani craft tradition spanning centuries. |
| Hand Embroidery | Master artisans spend hundreds of hours creating each piece - every stitch is a testament to skill passed down through generations. |
| Digital Print | State-of-the-art digital printing that captures every nuance of the original artwork - vibrant, precise, and endlessly creative. |
| Bead Work | Tiny beads hand-strung and stitched into intricate patterns - adding dimension, weight, and a subtle shimmer that elevates every movement. |
| Jari Work | Fine metallic jari threads woven into the fabric creating subtle shimmer patterns - a timeless technique that adds understated glamour. |
| Neck Work | Focused embroidery and embellishment around the neckline - the most visible and photographed part of any outfit, treated with extra artistry. |

---

## Shopify CSV Column Specification

The CSV must have **exactly** these columns in this order:

```
Title,URL handle,Description,Vendor,Product category,Type,Tags,Published on online store,Status,SKU,Barcode,Option1 name,Option1 value,Option1 Linked To,Option2 name,Option2 value,Option2 Linked To,Option3 name,Option3 value,Option3 Linked To,Price,Compare-at price,Cost per item,Charge tax,Tax code,Unit price total measure,Unit price total measure unit,Unit price base measure,Unit price base measure unit,Inventory tracker,Inventory quantity,Continue selling when out of stock,Weight value (grams),Weight unit for display,Requires shipping,Fulfillment service,Product image URL,Image position,Image alt text,Variant image URL,Gift card,SEO title,SEO description,Color (product.metafields.shopify.color-pattern),Google Shopping / Google product category,Google Shopping / Gender,Google Shopping / Age group,Google Shopping / Manufacturer part number (MPN),Google Shopping / Ad group name,Google Shopping / Ads labels,Google Shopping / Condition,Google Shopping / Custom product,Google Shopping / Custom label 0,Google Shopping / Custom label 1,Google Shopping / Custom label 2,Google Shopping / Custom label 3,Google Shopping / Custom label 4
```

### How to Fill Each Column

| Column | Value | Example |
|--------|-------|---------|
| **Title** | Product title (with design code in parens if duplicate) | `Silk Blue Wedding Wear Embroidery Work Saree` |
| **URL handle** | Slugified title + URL code | `silk-blue-wedding-wear-embroidery-work-saree-394443` |
| **Description** | HTML description (see template above) | `<p><em>When the occasion calls...</em></p>...` |
| **Vendor** | Always `LuxemiaShop` | `LuxemiaShop` |
| **Product category** | Always `Apparel & Accessories > Clothing` | `Apparel & Accessories > Clothing` |
| **Type** | Map from product type: Saree→`Sarees`, Suit/Plazzo/Anarkali→`Suits`, Sherwani→`Menswear` | `Sarees` |
| **Tags** | Comma-separated: Color, Fabric, Occasion, Work, Product Type (Title Case) | `Blue, Silk, Wedding Wear, Embroidery Work, Saree, Sarees` |
| **Published on online store** | Always `TRUE` | `TRUE` |
| **Status** | Always `Active` | `Active` |
| **SKU** | Format: `LXM-[3-letter code]-[sequential number]` where SAR=Sarees, SUI=Suits, MEN=Menswear | `LXM-SAR-001` |
| **Barcode** | Leave empty | |
| **Option1 name** | `Color` | `Color` |
| **Option1 value** | The color extracted from the title | `Blue` |
| **Price** | USD selling price (2 decimals) | `291.99` |
| **Compare-at price** | USD compare-at price (2 decimals) | `417.55` |
| **Cost per item** | Leave empty | |
| **Charge tax** | Always `TRUE` | `TRUE` |
| **Inventory tracker** | Always `shopify` | `shopify` |
| **Inventory quantity** | Always `50` | `50` |
| **Continue selling when out of stock** | Always `DENY` | `DENY` |
| **Requires shipping** | Always `TRUE` | `TRUE` |
| **Fulfillment service** | Always `manual` | `manual` |
| **Product image URL** | First image URL (the `(1).jpg` one) | `https://kesimg.b-cdn.net/images/650/2026y/April/61118/Blue-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8309(1).jpg` |
| **Image position** | `1` for first row, `2` for second image row, etc. | `1` |
| **Image alt text** | Same as product title | `Silk Blue Wedding Wear Embroidery Work Saree` |
| **Gift card** | Always `FALSE` | `FALSE` |
| **SEO title** | Same as product title | `Silk Blue Wedding Wear Embroidery Work Saree` |
| **SEO description** | `Shop the [Title] at LuxeMia. Crafted in premium [Fabric] with exquisite [Work] in [Color]. Perfect for [occasion]. Free shipping on orders over $150. Dry clean only.` | `Shop the Silk Blue Wedding Wear Embroidery Work Saree at LuxeMia. Crafted in premium Silk with exquisite Embroidery Work in Blue. Perfect for wedding wear. Free shipping on orders over $150. Dry clean only.` |
| **Color (metafield)** | Color in lowercase | `blue` |
| **Google Shopping / Google product category** | Always `Apparel & Accessories > Clothing` | `Apparel & Accessories > Clothing` |
| **Google Shopping / Gender** | Sarees/Suits → `Unisex`, Sherwanis → `Male` | `Unisex` |
| **Google Shopping / Age group** | Always `Adult` | `Adult` |
| **Google Shopping / Condition** | Always `New` | `New` |
| **Google Shopping / Custom product** | Always `FALSE` | `FALSE` |

All other columns should be left **empty**.

---

## Multi-Image Rows (CRITICAL)

Each product typically has 2-5 images. In Shopify CSV format, only the **first row** for a product has all the data filled in. **Subsequent image rows** have ONLY these columns filled:

- **URL handle** — same as the first row
- **Product image URL** — the next image URL
- **Image position** — incrementing number (2, 3, 4...)
- **Image alt text** — same as product title

**All other columns must be EMPTY** on image rows.

### Example: Product with 3 images

**Row 1 (product data + first image):**
```
Title: Silk Blue Wedding Wear Embroidery Work Saree
URL handle: silk-blue-wedding-wear-embroidery-work-saree-394443
Description: <p><em>When the occasion calls...</em></p>...
Vendor: LuxemiaShop
...all columns filled...
Product image URL: https://kesimg.b-cdn.net/.../(1).jpg
Image position: 1
Image alt text: Silk Blue Wedding Wear Embroidery Work Saree
```

**Row 2 (second image only):**
```
Title: (empty)
URL handle: silk-blue-wedding-wear-embroidery-work-saree-394443
Description: (empty)
...all empty except...
Product image URL: https://kesimg.b-cdn.net/.../(2).jpg
Image position: 2
Image alt text: Silk Blue Wedding Wear Embroidery Work Saree
```

**Row 3 (third image only):**
```
Title: (empty)
URL handle: silk-blue-wedding-wear-embroidery-work-saree-394443
Description: (empty)
...all empty except...
Product image URL: https://kesimg.b-cdn.net/.../(3).jpg
Image position: 3
Image alt text: Silk Blue Wedding Wear Embroidery Work Saree
```

---

## Category → Type Mapping

| Supplier Category | Shopify Type | SKU Prefix | Google Shopping Gender |
|---|---|---|---|
| Sarees | Sarees | LXM-SAR | Unisex |
| Salwar Kameez / Suits / Plazzo / Anarkali | Suits | LXM-SUI | Unisex |
| Sherwanis | Menswear | LXM-MEN | Male |

---

## Tags Extraction

Extract these from the product title and use them as comma-separated tags:

1. **Color** — e.g., "Blue", "Multi Color", "Mauve"
2. **Fabric** — e.g., "Silk", "Lycra", "Art Silk"
3. **Occasion** — e.g., "Wedding Wear", "Festival Wear", "Party Wear"
4. **Work Type** — e.g., "Embroidery Work", "Sequins Work", "Thread Work"
5. **Product Type** — e.g., "Saree", "Sarees" (include both singular and plural for Sarees)

---

## Quality Checks

Before outputting the CSV, verify:

1. ✅ Every product has a **Price** AND a **Compare-at price** (compare-at must be higher than price)
2. ✅ No duplicate URL handles — each product handle must be unique
3. ✅ Duplicate titles are disambiguated with actual catalog codes (not generic labels)
4. ✅ All image URLs start with `https://kesimg.b-cdn.net/`
5. ✅ Multi-image rows have only URL handle, image URL, image position, and alt text filled
6. ✅ SKU numbers are sequential within each category (LXM-SAR-001, LXM-SAR-002, etc.)
7. ✅ Prices are calculated using the exact formula: `INR × 2 ÷ 90` and `USD × 1.43`
8. ✅ Descriptions use the HTML template with correct fabric/work descriptions
9. ✅ All required columns are present and in the correct order

---

## Output

Generate a single CSV file named `luxemia_shopify_import.csv` that can be directly imported into Shopify Admin via Products → Import with "Overwrite existing products with matching handles" checked.
