// Supabase Edge Function: Google Merchant Center XML Product Feed
// Fetches ALL products from Shopify Storefront API with pagination
// and generates a compliant GMC XML feed with numeric taxonomy IDs

const SHOPIFY_DOMAIN = "lovable-project-zlh0w.myshopify.com";
const SHOPIFY_STOREFRONT_TOKEN =
  process.env.SHOPIFY_STOREFRONT_TOKEN ||
  process.env.VITE_SHOPIFY_STOREFRONT_TOKEN ||
  "";
if (!SHOPIFY_STOREFRONT_TOKEN) {
  console.error("SHOPIFY_STOREFRONT_TOKEN env var is not set. Feed generation will fail.");
}

const SHOPIFY_API_VERSION = "2025-10";
const STOREFRONT_API_URL = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

const SITE_URL = "https://luxemia.shop";
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Shopify GraphQL Types ───────────────────────────────────────────

interface ShopifyImage {
  url: string;
  altText: string | null;
}

interface ShopifySelectedOption {
  name: string;
  value: string;
}

interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  barcode: string | null;
  selectedOptions: ShopifySelectedOption[];
  image?: { url: string } | null;
}

interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  vendor: string;
  productType: string;
  tags: string[];
  options: { name: string; values: string[] }[];
  images: { edges: { node: ShopifyImage }[] };
  variants: { edges: { node: ShopifyVariant }[] };
}

interface ShopifyProductEdge {
  cursor: string;
  node: ShopifyProduct;
}

interface ShopifyProductsResponse {
  data: {
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string };
      edges: ShopifyProductEdge[];
    };
  };
  errors?: { message: string }[];
}

// ─── GraphQL Query ───────────────────────────────────────────────────

const PRODUCTS_QUERY = `
query FetchProducts($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      cursor
      node {
        id
        title
        description
        handle
        vendor
        productType
        tags
        options {
          name
          values
        }
        images(first: 3) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              availableForSale
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
              barcode
              selectedOptions {
                name
                value
              }
              image { url }
            }
          }
        }
      }
    }
  }
}
`;

// ─── Fetch ALL products with pagination ──────────────────────────────

async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;
  let page = 0;

  while (hasNextPage) {
    page++;
    console.log(`Fetching products page ${page}...`);

    const variables: Record<string, unknown> = { first: 250 };
    if (cursor) variables.after = cursor;

    const response = await fetch(STOREFRONT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: PRODUCTS_QUERY,
        variables,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Shopify API error (page ${page}): ${response.status} - ${errorText}`
      );
      throw new Error(
        `Shopify API returned ${response.status}: ${errorText}`
      );
    }

    const json = (await response.json()) as ShopifyProductsResponse;

    if (json.errors && json.errors.length > 0) {
      const errorMessages = json.errors.map((e) => e.message).join("; ");
      console.error(`Shopify GraphQL errors (page ${page}): ${errorMessages}`);
      throw new Error(`Shopify GraphQL errors: ${errorMessages}`);
    }

    const productsData = json.data.products;
    const edges = productsData.edges;

    for (const edge of edges) {
      allProducts.push(edge.node);
    }

    hasNextPage = productsData.pageInfo.hasNextPage;
    cursor = productsData.pageInfo.endCursor;

    console.log(
      `Page ${page}: fetched ${edges.length} products (total: ${allProducts.length})`
    );

    // Small delay to respect rate limits
    if (hasNextPage) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  console.log(`Total products fetched: ${allProducts.length}`);
  return allProducts;
}

// ─── Google Product Category (NUMERIC IDs) ──────────────────────────

function getGoogleCategory(productType: string, title: string): number {
  const text = `${productType} ${title}`.toLowerCase();

  if (/(jewelry|jewellery|necklace|choker|earring|bangle|bracelet|ring)/.test(text)) {
    if (/(set|combo)/.test(text)) return 6463; // Jewelry Sets
    if (/(necklace|choker)/.test(text)) return 196; // Necklaces
    if (/earring/.test(text)) return 194; // Earrings
    if (/(bangle|bracelet)/.test(text)) return 191; // Bracelets
    if (/ring/.test(text)) return 200; // Rings
    return 188; // Jewelry
  }

  if (/(saree|sari|lehenga)/.test(text)) return 8248; // Saris & Lehengas
  if (/(sherwani|kurta|salwar|anarkali|sharara|gharara|palazzo|traditional)/.test(text)) {
    return 5388; // Traditional & Ceremonial Clothing
  }

  return 1604; // Clothing
}

// ─── Gender Mapping ──────────────────────────────────────────────────

function getGender(productType: string, title: string): string {
  const text = `${productType} ${title}`.toLowerCase();

  if (/(^|\b)(men|mens|men's|male|groom|sherwani|kurta pajama|nehru)(\b|$)/.test(text)) {
    return "male";
  }
  if (/(^|\b)(women|womens|women's|female|saree|sari|lehenga|choli|blouse|anarkali|salwar|sharara|gharara|palazzo)(\b|$)/.test(text)) {
    return "female";
  }
  return "";
}

// ─── Size Extraction ─────────────────────────────────────────────────

function getSizeFromVariant(
  selectedOptions: ShopifySelectedOption[]
): string {
  const sizeOptionNames = ["Size", "Bust Size", "Chest Size"];

  for (const option of selectedOptions) {
    if (sizeOptionNames.includes(option.name)) {
      return option.value;
    }
  }

  return "";
}

// ─── Force JPEG on image URLs ────────────────────────────────────────

function forceJpeg(url: string): string {
  if (!url) return url;

  if (url.includes("cdn.shopify.com") || url.includes("myshopify.com")) {
    // Remove any existing format= and width= params, then re-add
    let clean = url.replace(/[&?]format=\w+/g, "");
    clean = clean.replace(/[&?]width=\d+/g, "");
    // Clean up dangling ? or &
    clean = clean.replace(/[?&]$/, "");
    return clean + "?width=1200&format=jpg";
  }

  if (url.includes("kesimg.b-cdn.net")) {
    if (!url.includes("format=")) {
      return url + (url.includes("?") ? "&" : "?") + "format=jpg";
    }
    return url.replace(/format=\w+/, "format=jpg");
  }

  // If URL has no image extension and no format= param
  const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(
    url
  );
  if (!hasImageExtension && !url.includes("format=")) {
    return url + (url.includes("?") ? "&" : "?") + "format=jpg";
  }

  return url;
}

// ─── XML Escape ──────────────────────────────────────────────────────

function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ─── Extract work type from tags ─────────────────────────────────────

function getWorkFromTags(tags: string[]): string {
  const workKeywords = [
    "embroidery",
    "embroidered",
    "sequins",
    "sequin",
    "zari",
    "zardozi",
    "kundan",
    "mirror work",
    "mirror",
    "thread work",
    "thread",
    "resham",
    "stone",
    "bead",
    "print",
    "printed",
    "weaving",
    "woven",
    "brocade",
    "handwork",
    "hand work",
    "heavy work",
    "neck work",
  ];

  for (const tag of tags) {
    const tagLower = tag.toLowerCase();
    for (const work of workKeywords) {
      if (tagLower.includes(work)) {
        // Capitalize first letter of each word
        return work
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      }
    }
  }
  return "";
}

// ─── Extract material/fabric from product options or title ───────────

function getMaterialFromProduct(
  product: ShopifyProduct
): string {
  const fabricKeywords = [
    "Silk",
    "Net",
    "Georgette",
    "Chiffon",
    "Cotton",
    "Velvet",
    "Satin",
    "Organza",
    "Crepe",
    "Jacquard",
    "Chinnon",
    "Chinon",
    "Viscose",
    "Vichitra",
    "Khadi",
    "Tissue",
    "Banarasi",
    "Kanjivaram",
    "Roman Silk",
    "Art Silk",
    "Heavy Silk",
    "Pure Silk",
  ];

  const searchText = `${product.title} ${product.productType} ${product.tags.join(" ")}`;

  for (const fabric of fabricKeywords) {
    if (searchText.toLowerCase().includes(fabric.toLowerCase())) {
      return fabric;
    }
  }
  return "";
}

// ─── Extract color from product options ──────────────────────────────

function getColorFromProduct(
  product: ShopifyProduct,
  selectedOptions: ShopifySelectedOption[]
): string {
  const selectedColor = selectedOptions.find((option) =>
    ["color", "colour"].includes(option.name.toLowerCase())
  );
  if (selectedColor?.value) return selectedColor.value;

  const productColor = product.options.find((option) =>
    ["color", "colour"].includes(option.name.toLowerCase())
  );
  if (productColor?.values.length === 1) return productColor.values[0];

  for (const tag of product.tags) {
    const match = tag.match(/^colou?r\s*:\s*(.+)$/i);
    if (match?.[1]) return match[1].trim();
  }

  const colorNames = [
    "off white", "rose gold", "royal blue", "navy blue", "sky blue",
    "dusty rose", "baby pink", "hot pink", "emerald green", "olive green",
    "mint green", "lime green", "sage green", "bottle green", "mustard yellow",
    "burnt orange", "champagne", "lavender", "lilac", "maroon", "burgundy",
    "fuchsia", "magenta", "turquoise", "teal", "aqua", "ivory", "cream",
    "beige", "brown", "copper", "gold", "silver", "black", "white", "grey",
    "gray", "red", "pink", "orange", "yellow", "green", "blue", "purple"
  ];
  const title = product.title.toLowerCase();
  const matches: string[] = [];
  for (const color of colorNames) {
    const pattern = new RegExp(`\\b${color.replace(" ", "\\s+")}\\b`, "i");
    if (pattern.test(title) && !matches.some((existing) => existing.includes(color) || color.includes(existing))) {
      matches.push(color.replace(/\b\w/g, (letter) => letter.toUpperCase()));
    }
    if (matches.length === 3) break;
  }

  return matches.join("/");
}

function sanitizeProductTitle(value: string): string {
  return value
    .replace(/^buy\s+/i, "")
    .replace(/\s*(?:[|–—-]\s*)?ready[-\s]?to[-\s]?ship\b/gi, "")
    .replace(/\s*(?:[|–—-]\s*)?handcrafted indian bridal luxury\b/gi, "")
    .replace(/\bhandcrafted\s+/gi, "")
    .replace(/\s*[|–—-]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Enriched Description ────────────────────────────────────────────

// Raw Shopify descriptions are intentionally excluded because legacy policy text can conflict with the live store policy.

function enrichDescription(
  _desc: string,
  productType: string,
  title: string,
  tags: string[],
  size: string
): string {
  const fabric = getMaterialFromProduct({ productType, title, tags, options: [] } as unknown as ShopifyProduct);
  const work = getWorkFromTags(tags);

  const details = [`${title}.`];
  if (productType) details.push(`Category: ${productType}.`);
  if (fabric) details.push(`Material: ${fabric}.`);
  if (work) details.push(`Detail: ${work}.`);
  if (size) details.push(`Selected size: ${size}.`);
  details.push(
    "Shipping is available to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. U.S. standard shipping is $12 below $150 and free at $150 and above; international rates are shown at checkout. Tracking is provided after dispatch. Review the product page for current availability and exact details."
  );

  return details.join(" ").slice(0, 5000);
}

// ─── Shorten Shopify GID ─────────────────────────────────────────────

function shortenId(gid: string): string {
  // Shopify GIDs look like "gid://shopify/Product/1234567890"
  // Extract the numeric part for cleaner IDs
  const match = gid.match(/\/(\d+)$/);
  if (match) return match[1];
  return gid.replace("gid://shopify/", "").replace(/\//g, "-");
}

// ─── Generate XML item for a product variant ─────────────────────────

function generateItem(
  product: ShopifyProduct,
  variant: ShopifyVariant
): string {
  const listingTitle = sanitizeProductTitle(product.title);
  const variantId = shortenId(variant.id);
  const productId = shortenId(product.id);
  const googleCategory = getGoogleCategory(product.productType, product.title);
  const gender = getGender(product.productType, product.title);
  const size = getSizeFromVariant(variant.selectedOptions);
  const color = getColorFromProduct(product, variant.selectedOptions);
  const material = getMaterialFromProduct(product);
  const work = getWorkFromTags(product.tags);
  const availability = variant.availableForSale ? "in_stock" : "out_of_stock";
  const currencyCode = variant.price.currencyCode || "USD";
  const barcode = variant.barcode?.trim() || "";
  const brand = product.vendor?.trim() || "";
  const isApparel = [1604, 5388, 8248].includes(googleCategory);

  // Price handling
  const price = parseFloat(variant.price.amount);
  const compareAtPrice = variant.compareAtPrice
    ? parseFloat(variant.compareAtPrice.amount)
    : null;

  // If compareAtPrice exists and is higher than price, then price is the sale price
  // and compareAtPrice is the original price
  const hasSale = compareAtPrice !== null && compareAtPrice > price;

  // Image handling
  const allImages = product.images.edges.map((e) => e.node);
  let mainImageUrl = "";
  if (variant.image && variant.image.url) {
    mainImageUrl = variant.image.url;
  } else if (allImages.length > 0) {
    mainImageUrl = allImages[0].url;
  }
  mainImageUrl = forceJpeg(mainImageUrl);
  if (!mainImageUrl) {
    throw new Error(`No product image for variant ${variant.id}`);
  }

  // Additional images (exclude the main one)
  const additionalImages = allImages
    .filter((img) => {
      if (variant.image && variant.image.url) {
        return img.url !== variant.image.url;
      }
      return img !== allImages[0];
    })
    .map((img) => forceJpeg(img.url));

  // Enriched description
  const description = enrichDescription(
    product.description,
    product.productType,
    listingTitle,
    product.tags,
    size
  );

  let xml = `
  <item>
    <g:id>${escapeXml(variantId)}</g:id>
    <g:item_group_id>${escapeXml(productId)}</g:item_group_id>
    <g:title>${escapeXml(listingTitle)}</g:title>
    <g:description>${escapeXml(description)}</g:description>
    <g:link>${SITE_URL}/product/${escapeXml(product.handle)}</g:link>
    <g:image_link>${escapeXml(mainImageUrl)}</g:image_link>`;

  for (const imageUrl of additionalImages) {
    xml += `
    <g:additional_image_link>${escapeXml(imageUrl)}</g:additional_image_link>`;
  }

  xml += `
    <g:availability>${availability}</g:availability>
    <g:price>${hasSale ? compareAtPrice!.toFixed(2) : price.toFixed(2)} ${currencyCode}</g:price>`;

  if (hasSale) {
    xml += `
    <g:sale_price>${price.toFixed(2)} ${currencyCode}</g:sale_price>`;
  }

  xml += `
    <g:condition>new</g:condition>
    <g:google_product_category>${googleCategory}</g:google_product_category>`;

  if (product.productType) xml += `
    <g:product_type>${escapeXml(product.productType)}</g:product_type>`;
  if (gender) xml += `
    <g:gender>${gender}</g:gender>`;
  if (isApparel) xml += `
    <g:age_group>adult</g:age_group>`;
  if (color) xml += `
    <g:color>${escapeXml(color)}</g:color>`;
  if (material) xml += `
    <g:material>${escapeXml(material)}</g:material>`;
  if (work) xml += `
    <g:pattern>${escapeXml(work)}</g:pattern>`;
  if (size) {
    xml += `
    <g:size>${escapeXml(size)}</g:size>
    <g:size_type>regular</g:size_type>
    <g:size_system>US</g:size_system>`;
  }

  if (barcode) {
    xml += `
    <g:gtin>${escapeXml(barcode)}</g:gtin>`;
    if (brand) xml += `
    <g:brand>${escapeXml(brand)}</g:brand>`;
  } else {
    xml += `
    <g:identifier_exists>no</g:identifier_exists>`;
  }

  if (product.productType) xml += `
    <g:custom_label_0>${escapeXml(product.productType)}</g:custom_label_0>`;

  xml += `
  </item>`;

  return xml;
}

// ─── Main Handler ────────────────────────────────────────────────────

async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Generating Google Merchant Center XML feed...");

    // Fetch all products from Shopify
    const products = await fetchAllProducts();

    console.log(`Generating XML for ${products.length} products...`);

    // Generate XML items for all product variants
    const items: string[] = [];

    for (const product of products) {
      const variants = product.variants.edges.map((e) => e.node);

      for (const variant of variants) {
        try {
          items.push(generateItem(product, variant));
        } catch (itemError) {
          console.error(
            `Error generating item for variant ${variant.id}: ${itemError}`
          );
        }
      }
    }

    console.log(`Generated ${items.length} variant items`);

    // Assemble the full XML feed
    const xmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>LuxeMia - Indian Ethnic Wear</title>
  <link>${SITE_URL}</link>
  <description>Current LuxeMia product listings with delivery to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius.</description>${items.join("\n")}
</channel>
</rss>`;

    console.log(
      `XML feed generated successfully: ${items.length} items, ${xmlFeed.length} bytes`
    );

    return new Response(xmlFeed, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating merchant feed:", error);

    // Return an error XML response
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>Error</title>
  <link>${SITE_URL}</link>
  <description>Failed to generate feed: ${escapeXml(errorMessage)}</description>
</channel>
</rss>`;

    return new Response(errorXml, {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  }
}

export default {
  fetch: handleRequest,
};
