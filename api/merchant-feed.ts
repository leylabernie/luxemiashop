import { buildVerifiedProductCopy } from '../src/lib/productDescriptionEnrichment.js';
import { normalizeBrandName } from '../src/lib/schema.js';

// Vercel function source for a Google Merchant Center XML Product Feed.
// Fetches ALL products from Shopify Storefront API with pagination
// and generates a GMC XML feed from explicit Shopify fields only.

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
const HIDDEN_PRODUCT_HANDLES = new Set([
  "luxemia-tailoring-saree-finishing-add-ons",
  "custom-order-balance-payment",
]);
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

interface ShopifyMetafield {
  value: string | null;
}

interface ShopifyVariant {
  id: string;
  sku: string | null;
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
  availableForSale: boolean;
  options: { name: string; values: string[] }[];
  fabricMetafield?: ShopifyMetafield | null;
  materialMetafield?: ShopifyMetafield | null;
  colorMetafield?: ShopifyMetafield | null;
  googleProductCategoryMetafield?: ShopifyMetafield | null;
  genderMetafield?: ShopifyMetafield | null;
  conditionMetafield?: ShopifyMetafield | null;
  ageGroupMetafield?: ShopifyMetafield | null;
  sizeTypeMetafield?: ShopifyMetafield | null;
  sizeSystemMetafield?: ShopifyMetafield | null;
  careInstructionsMetafield?: ShopifyMetafield | null;
  includedComponentsMetafield?: ShopifyMetafield | null;
  occasionMetafield?: ShopifyMetafield | null;
  shipsWithinMetafield?: ShopifyMetafield | null;
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
        availableForSale
        fabricMetafield: metafield(namespace: "custom", key: "fabric") { value }
        materialMetafield: metafield(namespace: "custom", key: "material") { value }
        colorMetafield: metafield(namespace: "custom", key: "color") { value }
        googleProductCategoryMetafield: metafield(namespace: "custom", key: "google_product_category") { value }
        genderMetafield: metafield(namespace: "custom", key: "gender") { value }
        conditionMetafield: metafield(namespace: "custom", key: "condition") { value }
        ageGroupMetafield: metafield(namespace: "custom", key: "age_group") { value }
        sizeTypeMetafield: metafield(namespace: "custom", key: "size_type") { value }
        sizeSystemMetafield: metafield(namespace: "custom", key: "size_system") { value }
        careInstructionsMetafield: metafield(namespace: "custom", key: "care_instructions") { value }
        includedComponentsMetafield: metafield(namespace: "custom", key: "included_components") { value }
        occasionMetafield: metafield(namespace: "custom", key: "occasion") { value }
        shipsWithinMetafield: metafield(namespace: "custom", key: "ships_within") { value }
        options {
          name
          values
        }
        images(first: 11) {
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
              sku
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

// ─── Size Extraction ─────────────────────────────────────────────────

const SIZE_OPTION_NAMES = new Set([
  "size",
  "standard size",
  "blouse size",
  "bust size",
  "chest size",
  "stitching size",
]);

function normalizeOptionName(value: string): string {
  return (value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function isSizeOptionName(value: string): boolean {
  return SIZE_OPTION_NAMES.has(normalizeOptionName(value));
}

function getSizeFromVariant(
  selectedOptions: ShopifySelectedOption[]
): string {
  for (const option of selectedOptions) {
    if (isSizeOptionName(option.name) && option.value.trim()) {
      return option.value.trim();
    }
  }

  return "";
}

// ─── Force JPEG on image URLs ────────────────────────────────────────

function forceJpeg(url: string): string {
  if (!url) return "";

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "";
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    return "";
  }
  if (/(?:og-image|campaign|placeholder)/i.test(parsed.pathname)) {
    return "";
  }

  if (parsed.hostname.endsWith("cdn.shopify.com") || parsed.hostname.endsWith("myshopify.com")) {
    parsed.searchParams.set("width", "1500");
    parsed.searchParams.set("format", "jpg");
    return parsed.toString();
  }

  if (parsed.hostname === "kesimg.b-cdn.net") {
    parsed.searchParams.set("format", "jpg");
    return parsed.toString();
  }

  return parsed.toString();
}

// ─── XML Escape ──────────────────────────────────────────────────────

function escapeXml(str: string): string {
  if (!str) return "";
  // XML 1.0 rejects most control characters even when the five reserved
  // characters are escaped. Strip only characters XML cannot represent.
  const validXmlText = Array.from(str).filter((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return (
      codePoint === 0x09 ||
      codePoint === 0x0a ||
      codePoint === 0x0d ||
      (codePoint >= 0x20 && codePoint <= 0xd7ff) ||
      (codePoint >= 0xe000 && codePoint <= 0xfffd) ||
      (codePoint >= 0x10000 && codePoint <= 0x10ffff)
    );
  }).join("");

  return validXmlText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isValidGtin(value: string): boolean {
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(value)) return false;

  const body = value.slice(0, -1);
  let sum = 0;
  let weight = 3;
  for (let index = body.length - 1; index >= 0; index--) {
    sum += Number(body[index]) * weight;
    weight = weight === 3 ? 1 : 3;
  }
  return (10 - (sum % 10)) % 10 === Number(value.at(-1));
}

function normalizeGtin(value: string | null): string {
  const digits = (value || "").replace(/[\s-]/g, "");
  return isValidGtin(digits) ? digits : "";
}

// ─── Read only explicit structured catalog attributes ────────────────

function getExplicitMaterial(
  product: ShopifyProduct,
  selectedOptions: ShopifySelectedOption[] = []
): string {
  const selectedMaterial = selectedOptions.find((option) =>
    ["fabric", "material"].includes(normalizeOptionName(option.name))
  )?.value?.trim();
  if (selectedMaterial) return selectedMaterial;

  const metafieldMaterial = product.materialMetafield?.value?.trim()
    || product.fabricMetafield?.value?.trim();
  if (metafieldMaterial) return metafieldMaterial;

  const materialOption = product.options.find((option) =>
    ["fabric", "material"].includes(normalizeOptionName(option.name))
  );
  if (materialOption?.values.length === 1 && materialOption.values[0]?.trim()) {
    return materialOption.values[0].trim();
  }

  return "";
}

function getExplicitColor(
  product: ShopifyProduct,
  selectedOptions: ShopifySelectedOption[]
): string {
  const selectedColor = selectedOptions.find((option) =>
    ["color", "colour"].includes(option.name.toLowerCase())
  );
  if (selectedColor?.value?.trim()) return selectedColor.value.trim();

  const metafieldColor = product.colorMetafield?.value?.trim();
  if (metafieldColor) return metafieldColor;

  const productColor = product.options.find((option) =>
    ["color", "colour"].includes(option.name.toLowerCase())
  );
  if (productColor?.values.length === 1 && productColor.values[0]?.trim()) {
    return productColor.values[0].trim();
  }

  return "";
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

function composeMerchantVariantTitle(baseTitle: string, selectedOptions: ShopifySelectedOption[]): string {
  const optionValues = selectedOptions
    .filter((option) => option.name && option.value)
    .filter((option) => option.name.toLowerCase() !== "title" && option.value.toLowerCase() !== "default title")
    .map((option) => option.value.trim())
    .filter(Boolean);
  if (optionValues.length === 0) return baseTitle.slice(0, 150).trim();

  const suffix = ` — ${optionValues.join(" / ")}`;
  const baseLimit = Math.max(1, 150 - suffix.length);
  return `${baseTitle.slice(0, baseLimit).trim()}${suffix}`.slice(0, 150).trim();
}

function normalizeMetafieldEnum(
  metafield: ShopifyMetafield | null | undefined,
  allowed: ReadonlySet<string>
): string {
  const value = metafield?.value?.trim().toLowerCase() || "";
  return allowed.has(value) ? value : "";
}

function getExplicitGoogleProductCategory(product: ShopifyProduct): string {
  const value = product.googleProductCategoryMetafield?.value?.trim() || "";
  return /^\d+$/.test(value) ? value : "";
}

const MERCHANT_GENDERS = new Set(["female", "male", "unisex"]);
const MERCHANT_CONDITIONS = new Set(["new", "refurbished", "used"]);
const MERCHANT_AGE_GROUPS = new Set(["newborn", "infant", "toddler", "kids", "adult"]);
const MERCHANT_SIZE_TYPES = new Set(["regular", "petite", "plus", "tall", "big", "maternity"]);
const MERCHANT_SIZE_SYSTEMS = new Set(["au", "br", "cn", "de", "eu", "fr", "it", "jp", "mex", "uk", "us"]);

// Use the same evidence-safe description contract as the hydrated storefront.
function getExplicitDescription(product: ShopifyProduct): string {
  return buildVerifiedProductCopy(
    product as unknown as Parameters<typeof buildVerifiedProductCopy>[0]
  ).trim().slice(0, 5000);
}

// ─── Shorten Shopify GID ─────────────────────────────────────────────

function shortenId(gid: string): string {
  // Shopify GIDs look like "gid://shopify/Product/1234567890"
  // Extract the numeric part for cleaner IDs
  const match = gid.match(/\/(\d+)$/);
  return match?.[1] || "";
}

// ─── Generate XML item for a product variant ─────────────────────────

function generateItem(
  product: ShopifyProduct,
  variant: ShopifyVariant
): string {
  if (product.availableForSale !== true || variant.availableForSale !== true) {
    throw new Error(`Variant ${variant.id || "(unknown)"} is not explicitly available in Shopify`);
  }
  const baseTitle = sanitizeProductTitle(product.title || "");
  if (!baseTitle) {
    throw new Error(`No explicit product title for variant ${variant.id || "(unknown)"}`);
  }

  const selectedOptions = Array.isArray(variant.selectedOptions) ? variant.selectedOptions : [];
  const meaningfulOptions = selectedOptions
    .filter((option) => option.name && option.value)
    .filter((option) => option.name.toLowerCase() !== "title" && option.value.toLowerCase() !== "default title");
  const listingTitle = composeMerchantVariantTitle(baseTitle, meaningfulOptions);
  const variantId = shortenId(variant.id || "");
  const productId = shortenId(product.id || "");
  const handle = product.handle?.trim() || "";
  if (!variantId || !productId || !handle) {
    throw new Error(`Missing explicit product, variant, or handle identifier for ${variant.id || "(unknown)"}`);
  }

  const googleCategory = getExplicitGoogleProductCategory(product);
  const gender = normalizeMetafieldEnum(product.genderMetafield, MERCHANT_GENDERS);
  const condition = normalizeMetafieldEnum(product.conditionMetafield, MERCHANT_CONDITIONS);
  const ageGroup = normalizeMetafieldEnum(product.ageGroupMetafield, MERCHANT_AGE_GROUPS);
  const sizeType = normalizeMetafieldEnum(product.sizeTypeMetafield, MERCHANT_SIZE_TYPES);
  const sizeSystem = normalizeMetafieldEnum(product.sizeSystemMetafield, MERCHANT_SIZE_SYSTEMS).toUpperCase();
  const size = getSizeFromVariant(selectedOptions);
  const color = getExplicitColor(product, selectedOptions);
  const material = getExplicitMaterial(product, selectedOptions);
  const productType = product.productType?.trim() || "";
  const availability = "in_stock";
  const currencyCode = variant.price?.currencyCode?.trim().toUpperCase() || "";
  if (!/^[A-Z]{3}$/.test(currencyCode)) {
    throw new Error(`Invalid or missing currency for variant ${variant.id}`);
  }
  const gtin = normalizeGtin(variant.barcode);
  const brand = normalizeBrandName(product.vendor) || "";
  if (!brand) {
    throw new Error(`No verified consumer brand for variant ${variant.id}`);
  }
  const productLink = `${SITE_URL}/product/${encodeURIComponent(handle)}?variant=${encodeURIComponent(variantId)}`;

  // Price handling
  const price = parseFloat(variant.price?.amount || "");
  const compareAtPrice = variant.compareAtPrice
    ? parseFloat(variant.compareAtPrice.amount)
    : null;

  // If compareAtPrice exists and is higher than price, then price is the sale price
  // and compareAtPrice is the original price
  const hasSale = compareAtPrice !== null
    && Number.isFinite(compareAtPrice)
    && variant.compareAtPrice?.currencyCode?.trim().toUpperCase() === currencyCode
    && compareAtPrice > price;
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Invalid price for variant ${variant.id}`);
  }

  // Image handling
  const allImages = (product.images?.edges || [])
    .map((edge) => edge.node)
    .filter((image) => Boolean(image?.url));
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
    .slice(0, 10)
    .map((img) => forceJpeg(img.url))
    .filter(Boolean);

  const description = getExplicitDescription(product);
  if (!description) {
    throw new Error(`No explicit Shopify description for variant ${variant.id}`);
  }

  let xml = `
  <item>
    <g:id>${escapeXml(variantId)}</g:id>
    <g:item_group_id>${escapeXml(productId)}</g:item_group_id>
    <g:title>${escapeXml(listingTitle)}</g:title>
    <g:description>${escapeXml(description)}</g:description>
    <g:link>${escapeXml(productLink)}</g:link>
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

  if (condition) xml += `
    <g:condition>${condition}</g:condition>`;
  if (brand) xml += `
    <g:brand>${escapeXml(brand)}</g:brand>`;
  if (googleCategory) xml += `
    <g:google_product_category>${googleCategory}</g:google_product_category>`;

  if (productType) xml += `
    <g:product_type>${escapeXml(productType)}</g:product_type>`;
  if (gender) xml += `
    <g:gender>${gender}</g:gender>`;
  if (ageGroup) xml += `
    <g:age_group>${ageGroup}</g:age_group>`;
  if (color) xml += `
    <g:color>${escapeXml(color)}</g:color>`;
  if (material) xml += `
    <g:material>${escapeXml(material)}</g:material>`;
  if (size) {
    xml += `
    <g:size>${escapeXml(size)}</g:size>`;
    if (sizeType) xml += `
    <g:size_type>${sizeType}</g:size_type>`;
    if (sizeSystem) xml += `
    <g:size_system>${sizeSystem}</g:size_system>`;
  }

  if (gtin) {
    xml += `
    <g:gtin>${gtin}</g:gtin>`;
  }

  if (productType) xml += `
    <g:custom_label_0>${escapeXml(productType)}</g:custom_label_0>`;

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
    if (!SHOPIFY_STOREFRONT_TOKEN) {
      throw new Error("SHOPIFY_STOREFRONT_TOKEN is required; no cached or synthetic fallback is permitted");
    }
    console.log("Generating Google Merchant Center XML feed...");

    // Fetch all products from Shopify
    const products = await fetchAllProducts();

    console.log(`Generating XML for ${products.length} products...`);

    // Generate XML items for all product variants
    const items: string[] = [];
    let invalidAvailableItems = 0;

    for (const product of products) {
      if (HIDDEN_PRODUCT_HANDLES.has(product.handle?.trim() || "")) {
        continue;
      }
      const variants = product.variants?.edges?.map((edge) => edge.node).filter(Boolean) || [];
      if (!(product.availableForSale === true)) {
        if (typeof product.availableForSale !== "boolean") {
          invalidAvailableItems += Math.max(1, variants.length);
          console.error(`Invalid product ${product.id || "(unknown)"}: missing explicit availability`);
        }
        continue;
      }
      if (variants.length === 0) {
        invalidAvailableItems++;
        console.error(`Invalid available product ${product.id || "(unknown)"}: no explicit variants`);
        continue;
      }

      for (const variant of variants) {
        if (!(variant.availableForSale === true)) {
          if (typeof variant.availableForSale !== "boolean") {
            invalidAvailableItems++;
            console.error(`Invalid variant ${variant.id || "(unknown)"}: missing explicit availability`);
          }
          continue;
        }
        try {
          items.push(generateItem(product, variant));
        } catch (itemError) {
          invalidAvailableItems++;
          console.error(
            `Error generating item for variant ${variant.id}: ${itemError}`
          );
        }
      }
    }

    if (invalidAvailableItems > 0) {
      throw new Error(`${invalidAvailableItems} available Shopify variants lack complete, explicit merchant-feed evidence`);
    }
    if (items.length === 0) {
      throw new Error("Shopify returned no variants with complete, explicit merchant-feed evidence");
    }

    console.log(
      `Generated ${items.length} complete, explicitly available variant items`
    );

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
