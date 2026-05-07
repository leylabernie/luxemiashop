// Supabase Edge Function: Google Merchant Center XML Product Feed
// Fetches ALL products from Shopify Storefront API with pagination
// and generates a compliant GMC XML feed with numeric taxonomy IDs

const SHOPIFY_DOMAIN = "lovable-project-zlh0w.myshopify.com";
const SHOPIFY_STOREFRONT_TOKEN = "c98d10d5abd95e6a8d6ddbed223ef4b4";
const SHOPIFY_API_VERSION = "2025-07";
const STOREFRONT_API_URL = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

const SITE_URL = "https://luxemia.shop";
const BRAND = "LuxeMia";

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
        variants(first: 10) {
          edges {
            node {
              id
              title
              availableForSale
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
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
  const t = title.toLowerCase();
  const pt = productType.toLowerCase();

  // Men's products first
  if (
    pt.includes("men") ||
    t.includes("sherwani") ||
    t.includes("kurta pajama")
  ) {
    if (t.includes("sherwani")) return 5598;
    if (t.includes("kurta")) return 5600;
    return 5006;
  }
  if (pt.includes("lehenga")) return 2275;
  if (pt.includes("saree")) return 5424;
  if (pt.includes("necklace")) return 193;
  if (pt.includes("earring")) return 194;
  if (pt.includes("bangle") || pt.includes("bracelet")) return 200;
  if (pt.includes("jewel")) return 188;
  if (
    pt.includes("suit") ||
    pt.includes("anarkali") ||
    pt.includes("sharara") ||
    pt.includes("palazzo") ||
    pt.includes("salwar")
  ) {
    return 2275;
  }
  return 1604;
}

// ─── Gender Mapping ──────────────────────────────────────────────────

function getGender(productType: string, title: string): string {
  const t = title.toLowerCase();
  const pt = productType.toLowerCase();
  if (
    pt.includes("men") ||
    t.includes("sherwani") ||
    t.includes("kurta") ||
    t.includes("groom wear")
  ) {
    return "male";
  }
  return "female";
}

// ─── Size Extraction ─────────────────────────────────────────────────

function getSizeFromVariant(
  selectedOptions: ShopifySelectedOption[],
  productType: string,
  title: string
): string {
  const sizeOptionNames = ["Size", "Bust Size", "Chest Size"];

  for (const option of selectedOptions) {
    if (sizeOptionNames.includes(option.name)) {
      return option.value;
    }
  }

  // Default sizes based on gender
  const gender = getGender(productType, title);
  return gender === "male" ? "40" : "S";
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
  return "Embroidered";
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
  return "Mixed";
}

// ─── Extract color from product options ──────────────────────────────

function getColorFromProduct(product: ShopifyProduct): string {
  // Check product options for Color option
  for (const option of product.options) {
    if (
      option.name.toLowerCase() === "color" ||
      option.name.toLowerCase() === "colour"
    ) {
      if (option.values.length > 0) {
        return option.values[0];
      }
    }
  }
  return "Multi";
}

// ─── Enriched Description ────────────────────────────────────────────

function enrichDescription(
  desc: string,
  productType: string,
  title: string,
  tags: string[],
  size: string
): string {
  const gender = getGender(productType, title);
  const fabric = getMaterialFromProduct({ productType, title, tags } as ShopifyProduct);
  const work = getWorkFromTags(tags);

  let enriched = desc ? desc.trim() : title;

  enriched += ` Fabric: ${fabric}. Work: ${work}.`;

  if (gender === "male") {
    enriched += ` Available in chest sizes 36-44 inches. Size: ${size}.`;
  } else {
    enriched += ` Available in sizes S, M, L, XL, XXL. Custom tailoring available on request. Size: ${size}.`;
  }

  enriched +=
    " Care: Dry clean only. Shipping: Flat rate $14.95 per item worldwide. Free shipping on orders over $300. Dispatch: 3-5 business days (readymade), 5-7 business days (custom). Delivery: 3-5 business days via DHL Express, 7-10 business days via USPS/UPS.";

  return enriched.trim();
}

// ─── Shipping XML blocks ─────────────────────────────────────────────

function getShippingBlocks(): string {
  const countries = [
    { code: "US", stdPrice: "14.95", expPrice: "39.95" },
    { code: "CA", stdPrice: "14.95", expPrice: "39.95" },
    { code: "GB", stdPrice: "14.95", expPrice: "44.95" },
    { code: "AE", stdPrice: "14.95", expPrice: "39.95" },
    { code: "AU", stdPrice: "14.95", expPrice: "49.95" },
  ];

  return countries
    .map(
      (c) => `
    <g:shipping>
      <g:country>${c.code}</g:country>
      <g:service>Standard</g:service>
      <g:price>${c.stdPrice} USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>7</g:min_transit_time>
      <g:max_transit_time>10</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>${c.code}</g:country>
      <g:service>Express</g:service>
      <g:price>${c.expPrice} USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>3</g:min_transit_time>
      <g:max_transit_time>5</g:max_transit_time>
    </g:shipping>`
    )
    .join("\n");
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
  const variantId = shortenId(variant.id);
  const productId = shortenId(product.id);
  const googleCategory = getGoogleCategory(product.productType, product.title);
  const gender = getGender(product.productType, product.title);
  const size = getSizeFromVariant(
    variant.selectedOptions,
    product.productType,
    product.title
  );
  const color = getColorFromProduct(product);
  const material = getMaterialFromProduct(product);
  const work = getWorkFromTags(product.tags);
  const availability = variant.availableForSale ? "in_stock" : "out_of_stock";

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
    product.title,
    product.tags,
    size
  );

  let xml = `
  <item>
    <g:id>${escapeXml(variantId)}</g:id>
    <g:item_group_id>${escapeXml(productId)}</g:item_group_id>
    <g:title>${escapeXml(product.title)}</g:title>
    <g:description>${escapeXml(description)}</g:description>
    <g:link>${SITE_URL}/product/${escapeXml(product.handle)}</g:link>
    <g:image_link>${escapeXml(mainImageUrl)}</g:image_link>`;

  if (additionalImages.length > 0) {
    xml += `
    <g:additional_image_link>${additionalImages.map((url) => escapeXml(url)).join(",")}</g:additional_image_link>`;
  }

  xml += `
    <g:availability>${availability}</g:availability>
    <g:price>${hasSale ? compareAtPrice!.toFixed(2) : price.toFixed(2)} USD</g:price>`;

  if (hasSale) {
    xml += `
    <g:sale_price>${price.toFixed(2)} USD</g:sale_price>`;
  }

  xml += `
    <g:condition>new</g:condition>
    <g:brand>${BRAND}</g:brand>
    <g:google_product_category>${googleCategory}</g:google_product_category>
    <g:product_type>${escapeXml(product.productType)}</g:product_type>
    <g:gender>${gender}</g:gender>
    <g:age_group>adult</g:age_group>
    <g:color>${escapeXml(color)}</g:color>
    <g:material>${escapeXml(material)}</g:material>
    <g:pattern>${escapeXml(work)}</g:pattern>
    <g:size>${escapeXml(size)}</g:size>
    <g:size_type>regular</g:size_type>
    <g:size_system>US</g:size_system>
    <g:identifier_exists>no</g:identifier_exists>
    <g:custom_label_0>${escapeXml(product.productType)}</g:custom_label_0>
    ${getShippingBlocks()}
    <g:tax>
      <g:country>US</g:country>
      <g:rate>0</g:rate>
      <g:tax_ship>no</g:tax_ship>
    </g:tax>
  </item>`;

  return xml;
}

// ─── Main Handler ────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
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
  <description>Shop quality Indian ethnic wear at LuxeMia. Bridal lehengas, wedding sarees, sherwanis, anarkali suits, and jewelry. Flat rate shipping $14.95, free over $300.</description>
  <g:google_product_category>1604</g:google_product_category>${items.join("\n")}
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
});
