import { toast } from 'sonner';

import { isHiddenBillingProductHandle } from './serviceAddOns';

// Shopify API Configuration
const SHOPIFY_API_VERSION = '2025-10';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_LEGACY_MYSHOPIFY_DOMAIN = 'luxemiashop.myshopify.com';
const SHOPIFY_BRANDED_CHECKOUT_DOMAIN = 'checkout.luxemia.shop';
const SHOPIFY_CHECKOUT_RETURN_URL = 'https://luxemia.shop/order-confirmation';
const SHOPIFY_CHECKOUT_CHANNEL = 'online_store';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '';

/**
 * Keep hosted checkout on Shopify's permanent domain until the branded
 * checkout hostname has been configured and its DNS has been verified.
 * Deliberately accept hostnames, not URLs or hostname suffixes.
 */
export function resolveShopifyCheckoutHost(configuredHost?: string | null): string {
  const normalizedHost = configuredHost?.trim().toLowerCase();

  return normalizedHost === SHOPIFY_BRANDED_CHECKOUT_DOMAIN
    ? SHOPIFY_BRANDED_CHECKOUT_DOMAIN
    : SHOPIFY_STORE_PERMANENT_DOMAIN;
}

function isAllowedCheckoutSourceHost(hostname: string, checkoutHost: string): boolean {
  const allowedHosts = new Set([
    SHOPIFY_STORE_PERMANENT_DOMAIN,
    SHOPIFY_LEGACY_MYSHOPIFY_DOMAIN,
    'luxemia.shop',
    'www.luxemia.shop',
    'luxemiashop.lovable.app',
    checkoutHost,
  ]);

  return allowedHosts.has(hostname.toLowerCase());
}

function setRequiredCheckoutParams(url: URL): void {
  url.searchParams.set('channel', SHOPIFY_CHECKOUT_CHANNEL);
  url.searchParams.set('return_url', SHOPIFY_CHECKOUT_RETURN_URL);
}

function isCartCheckoutPath(pathname: string): boolean {
  return /^\/cart\/c\/[^/?#]+\/?$/.test(pathname);
}

/**
 * Normalizes a Shopify-hosted cart URL without ever trusting a partial
 * hostname match. Relative cart URLs are supported as a defensive fallback;
 * their query string is retained before the required channel and return URL
 * are applied.
 */
export function normalizeShopifyCheckoutUrl(
  rawCheckoutUrl: string,
  configuredHost?: string | null,
): string | null {
  const checkoutHost = resolveShopifyCheckoutHost(configuredHost);
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawCheckoutUrl);

    if (
      parsedUrl.protocol !== 'https:'
      || !isAllowedCheckoutSourceHost(parsedUrl.hostname, checkoutHost)
    ) {
      return null;
    }
  } catch {
    // Accept only a same-origin relative path. Protocol-relative and
    // backslash-prefixed inputs can otherwise be interpreted as another host.
    if (!/^\/(?![\\/])/.test(rawCheckoutUrl)) {
      return null;
    }

    try {
      parsedUrl = new URL(rawCheckoutUrl, `https://${checkoutHost}`);
    } catch {
      return null;
    }
  }

  if (!isCartCheckoutPath(parsedUrl.pathname)) {
    return null;
  }

  parsedUrl.protocol = 'https:';
  parsedUrl.hostname = checkoutHost;
  parsedUrl.port = '';
  parsedUrl.username = '';
  parsedUrl.password = '';
  parsedUrl.hash = '';
  setRequiredCheckoutParams(parsedUrl);

  // This exact comparison is the final redirect boundary. In particular,
  // `*.myshopify.com.evil.example` must never be treated as a Shopify host.
  if (parsedUrl.hostname !== checkoutHost) {
    return null;
  }

  return parsedUrl.toString();
}

// Product metadata for filtering
export interface ProductMetadata {
  occasion?: string[] | null;
  fabric?: string | null;
  material?: string | null;
  blouseFabric?: string | null;
  color?: string | null;
  includedComponents?: string[] | null;
  careInstructions?: string | null;
  productStyle?: string | null;
  shopifyCategory?: string | null;
  googleProductCategory?: string | null;
  gender?: string | null;
  condition?: string | null;
  searchKeywords?: string[] | null;
  work?: string | null;
  tags?: string[] | null;
  priceInr?: number | null;
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    createdAt: string;
    description: string;
    descriptionHtml?: string;
    handle: string;
    vendor?: string;
    productType?: string;
    tags?: string[];
    availableForSale?: boolean;
    shipsWithin?: number | null;
    shipsWithinDays?: number | null;
    shipsWithinMetafield?: { value: string | null } | null;
    fabricMetafield?: { value: string | null } | null;
    materialMetafield?: { value: string | null } | null;
    blouseFabricMetafield?: { value: string | null } | null;
    colorMetafield?: { value: string | null } | null;
    occasionMetafield?: { value: string | null } | null;
    includedComponentsMetafield?: { value: string | null } | null;
    careInstructionsMetafield?: { value: string | null } | null;
    productStyleMetafield?: { value: string | null } | null;
    shopifyCategoryMetafield?: { value: string | null } | null;
    googleProductCategoryMetafield?: { value: string | null } | null;
    genderMetafield?: { value: string | null } | null;
    conditionMetafield?: { value: string | null } | null;
    searchKeywordsMetafield?: { value: string | null } | null;
    seo?: { title: string | null; description: string | null };
    metadata?: ProductMetadata;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    compareAtPriceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
      maxVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    media?: {
      edges: Array<{
        node: {
          id: string;
          mediaContentType: string;
          alt: string | null;
          previewImage: {
            url: string;
            altText: string | null;
          } | null;
          sources?: Array<{
            url: string;
            mimeType: string;
            format: string;
            width: number;
            height: number;
          }>;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          sku?: string;
          barcode?: string | null;
          price: {
            amount: string;
            currencyCode: string;
          };
          compareAtPrice: {
            amount: string;
            currencyCode: string;
          } | null;
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
          image?: {
            url: string;
            altText: string | null;
          } | null;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  image: { url: string; altText: string | null } | null;
  products: ShopifyProduct[];
}

const STOREFRONT_LISTING_QUERY = `
  query GetProductsListing($first: Int!, $query: String, $after: String) {
    products(first: $first, query: $query, after: $after, sortKey: CREATED_AT, reverse: true) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          createdAt
          description
          seo { title description }
          handle
          vendor
          productType
          tags
          availableForSale
          shipsWithinMetafield: metafield(namespace: "custom", key: "ships_within") { value }
          fabricMetafield: metafield(namespace: "custom", key: "fabric") { value }
          materialMetafield: metafield(namespace: "custom", key: "material") { value }
          blouseFabricMetafield: metafield(namespace: "custom", key: "blouse_fabric") { value }
          colorMetafield: metafield(namespace: "custom", key: "color") { value }
          occasionMetafield: metafield(namespace: "custom", key: "occasion") { value }
          includedComponentsMetafield: metafield(namespace: "custom", key: "included_components") { value }
          careInstructionsMetafield: metafield(namespace: "custom", key: "care_instructions") { value }
          productStyleMetafield: metafield(namespace: "custom", key: "product_style") { value }
          shopifyCategoryMetafield: metafield(namespace: "custom", key: "shopify_category") { value }
          googleProductCategoryMetafield: metafield(namespace: "custom", key: "google_product_category") { value }
          genderMetafield: metafield(namespace: "custom", key: "gender") { value }
          conditionMetafield: metafield(namespace: "custom", key: "condition") { value }
          searchKeywordsMetafield: metafield(namespace: "custom", key: "search_keywords") { value }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                sku
                barcode
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      descriptionHtml
      seo { title description }
      handle
      vendor
      productType
      tags
      availableForSale
      shipsWithinMetafield: metafield(namespace: "custom", key: "ships_within") { value }
      fabricMetafield: metafield(namespace: "custom", key: "fabric") { value }
      materialMetafield: metafield(namespace: "custom", key: "material") { value }
      blouseFabricMetafield: metafield(namespace: "custom", key: "blouse_fabric") { value }
      colorMetafield: metafield(namespace: "custom", key: "color") { value }
      occasionMetafield: metafield(namespace: "custom", key: "occasion") { value }
      includedComponentsMetafield: metafield(namespace: "custom", key: "included_components") { value }
      careInstructionsMetafield: metafield(namespace: "custom", key: "care_instructions") { value }
      productStyleMetafield: metafield(namespace: "custom", key: "product_style") { value }
      shopifyCategoryMetafield: metafield(namespace: "custom", key: "shopify_category") { value }
      googleProductCategoryMetafield: metafield(namespace: "custom", key: "google_product_category") { value }
      genderMetafield: metafield(namespace: "custom", key: "gender") { value }
      conditionMetafield: metafield(namespace: "custom", key: "condition") { value }
      searchKeywordsMetafield: metafield(namespace: "custom", key: "search_keywords") { value }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 20) {
        edges {
          node {
            url
            altText
          }
        }
      }
      media(first: 20) {
        edges {
          node {
            id
            mediaContentType
            alt
            previewImage {
              url
              altText
            }
            ... on Video {
              sources {
                url
                mimeType
                format
                width
                height
              }
            }
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            sku
            barcode
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            availableForSale
            image {
              url
              altText
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

const COLLECTION_BY_HANDLE_QUERY = `
  query GetCollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      image { url altText }
      products(first: $first, sortKey: CREATED, reverse: true) {
        edges {
          node {
            id
            title
            createdAt
            description
            seo { title description }
            handle
            vendor
            productType
            tags
            availableForSale
            shipsWithinMetafield: metafield(namespace: "custom", key: "ships_within") { value }
            priceRange {
              minVariantPrice { amount currencyCode }
            }
            compareAtPriceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            images(first: 1) {
              edges { node { url altText } }
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  sku
                  barcode
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  availableForSale
                  selectedOptions { name value }
                }
              }
            }
            options { name values }
          }
        }
      }
    }
  }
`;

function sanitizeShopifyProductCopy(value: string): string {
  return (value || '')
    .replace(/\s*Shipping:\s*5-day express delivery to USA and Canada[\s\S]*$/gi, '')
    .replace(/\s*FAQQ\s*:[\s\S]*$/gi, '')
    .replace(/(?:U\.S\.\s+)?standard shipping is \$12 below \$150 and free at \$150(?: and above|\+)?/gi, 'U.S. standard shipping is $14.99 below $199 and free at $199 and above')
    .replace(/standard shipping is free at \$150(?: and above|\+)? and \$12 below \$150/gi, 'Standard U.S. shipping is free at $199 and above and $14.99 below $199')
    .replace(/free (?:U\.S\.\s+)?(?:standard )?shipping (?:at|over) \$150(?: and above|\+)?/gi, 'Free U.S. standard shipping at $199 and above')
    .replace(/shipping is free at \$150(?: and above|\+)?/gi, 'shipping is free at $199 and above')
    .replace(/Ships within 1[–-]2 business days from the USA\.\s*Free shipping on orders over \$99\./gi, 'Free U.S. standard shipping at $199 and above. $14.99 below that. Tracking provided after dispatch.')
    .replace(/Free\s+(?:worldwide|global)\s+shipping to the seven supported destination countries via DHL\/USPS\/UPS \(7-10 business days\)/gi, 'Shipping is available to seven countries. U.S. standard shipping is $14.99 below $199 and free at $199 and above')
    .replace(/Free\s+(?:worldwide|global)\s+shipping to [^.]+?(?:arriving in |delivered in |within )?7-10 business days/gi, 'Shipping is available to seven countries. U.S. standard shipping is $14.99 below $199 and free at $199 and above')
    .replace(/Free\s+(?:worldwide|global)\s+shipping to [^.]+?via DHL\/USPS\/UPS/gi, 'Shipping is available to seven countries. U.S. standard shipping is $14.99 below $199 and free at $199 and above')
    .replace(/Shipping:\s*5-day express delivery to USA and Canada/gi, 'Shipping: tracking provided after dispatch')
    .replace(/ready[- ]to[- ]ship Indian wear USA/gi, 'Indian ethnic wear online')
    .replace(/within two business days/gi, 'with tracked shipping')
    .replace(/within 2 business days/gi, 'with tracked shipping')
    .replace(/from the USA/gi, 'with tracked delivery')
    .replace(/the seven supported destination countries/gi, 'the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius')
    .replace(/free shipping on orders over \$350/gi, 'destination-specific shipping shown at checkout');
}

function parseMetafieldList(value?: string | null): string[] | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : null;
  } catch {
    return null;
  }
}

function parseShipsWithinDays(value?: string | null): number | null {
  const match = (value || '').match(/\d+/);
  if (!match) return null;
  const days = Number.parseInt(match[0], 10);
  return Number.isFinite(days) && days > 0 ? days : null;
}

function sanitizeProductNode<T extends ShopifyProduct['node']>(node: T): T {
  const metadata: ProductMetadata = {
    ...node.metadata,
    fabric: node.fabricMetafield?.value || node.metadata?.fabric || null,
    material: node.materialMetafield?.value || node.metadata?.material || null,
    blouseFabric: node.blouseFabricMetafield?.value || node.metadata?.blouseFabric || null,
    color: node.colorMetafield?.value || node.metadata?.color || null,
    occasion: parseMetafieldList(node.occasionMetafield?.value) || node.metadata?.occasion || null,
    includedComponents: parseMetafieldList(node.includedComponentsMetafield?.value) || node.metadata?.includedComponents || null,
    careInstructions: node.careInstructionsMetafield?.value || node.metadata?.careInstructions || null,
    productStyle: node.productStyleMetafield?.value || node.metadata?.productStyle || null,
    shopifyCategory: node.shopifyCategoryMetafield?.value || node.metadata?.shopifyCategory || null,
    googleProductCategory: node.googleProductCategoryMetafield?.value || node.metadata?.googleProductCategory || null,
    gender: node.genderMetafield?.value || node.metadata?.gender || null,
    condition: node.conditionMetafield?.value || node.metadata?.condition || null,
    searchKeywords: parseMetafieldList(node.searchKeywordsMetafield?.value) || node.metadata?.searchKeywords || null,
  };

  return {
    ...node,
    metadata,
    shipsWithinDays: parseShipsWithinDays(node.shipsWithinMetafield?.value),
    shipsWithin: parseShipsWithinDays(node.shipsWithinMetafield?.value),
    description: sanitizeShopifyProductCopy(node.description || ''),
    descriptionHtml: node.descriptionHtml ? sanitizeShopifyProductCopy(node.descriptionHtml) : node.descriptionHtml,
    title: node.title.replace(/\s*\|\s*Ready to Ship/gi, ''),
  };
}

function sanitizeProductEdge(edge: ShopifyProduct): ShopifyProduct {
  return { node: sanitizeProductNode(edge.node) };
}

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              attributes {
                key
                value
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}, signal?: AbortSignal) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    // CRITICAL: never cache Shopify Storefront API responses in the browser.
    // Without this, the browser may serve a stale title from HTTP cache even
    // after the user updated the product in Shopify. cache: 'no-store' forces
    // every request to hit Shopify directly, so users always see the latest
    // product data.
    cache: 'no-store',
    ...(signal ? { signal } : {}),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description: "Shopify API access requires an active Shopify billing plan."
    });
    return null;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return data;
}

export async function fetchProducts(first: number = 12, query?: string): Promise<ShopifyProduct[]> {
  try {
    const data = await storefrontApiRequest(STOREFRONT_LISTING_QUERY, { first, query });
    if (!data) return [];
    return (data.data.products.edges || [])
      .map(sanitizeProductEdge)
      .filter((product: ShopifyProduct) => !isHiddenBillingProductHandle(product.node.handle));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchAllProducts(query?: string): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const variables: Record<string, unknown> = { first: 250, query };
      if (cursor) variables.after = cursor;

      const data = await storefrontApiRequest(STOREFRONT_LISTING_QUERY, variables);
      if (!data) break;

      const edges = data.data.products.edges || [];
      allProducts.push(...edges.map(sanitizeProductEdge));

      const pageInfo = data.data.products.pageInfo;
      hasNextPage = pageInfo?.hasNextPage ?? false;
      cursor = pageInfo?.endCursor ?? null;
    }
  } catch (error) {
    console.error('Error fetching all products:', error);
  }

  return allProducts.filter((product) => !isHiddenBillingProductHandle(product.node.handle));
}

export async function fetchProductByHandle(
  handle: string,
  options: { allowHiddenBillingProduct?: boolean } = {},
): Promise<ShopifyProduct['node'] | null> {
  if (isHiddenBillingProductHandle(handle) && !options.allowHiddenBillingProduct) return null;

  try {
    const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
    if (!data) return null;
    // The query now uses `product(handle:)` (replacing the deprecated
    // `productByHandle`) so the response shape is `data.product`, not
    // `data.productByHandle`.
    const product = data.data.product ? sanitizeProductNode(data.data.product) : null;
    return product && (!isHiddenBillingProductHandle(product.handle) || options.allowHiddenBillingProduct)
      ? product
      : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function fetchCollectionByHandle(
  handle: string,
  signal?: AbortSignal,
): Promise<ShopifyCollection | null> {
  try {
    const data = await storefrontApiRequest(
      COLLECTION_BY_HANDLE_QUERY,
      { handle, first: 250 },
      signal,
    );
    const collection = data?.data?.collection;
    if (!collection) return null;

    return {
      id: collection.id,
      title: collection.title,
      handle: collection.handle,
      description: collection.description || '',
      descriptionHtml: collection.descriptionHtml || '',
      image: collection.image || null,
      products: (collection.products?.edges || [])
        .map(sanitizeProductEdge)
        .filter((product: ShopifyProduct) => !isHiddenBillingProductHandle(product.node.handle)),
    };
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error(`Error fetching collection ${handle}:`, error);
    }
    return null;
  }
}

export async function createStorefrontCheckout(items: Array<{ variantId: string; quantity: number; handle?: string; customAttributes?: Array<{ key: string; value: string }> }>): Promise<string | null> {
   // Check if any variant ID is "fake" (doesn't look like a Shopify GID)
  // Shopify GIDs look like: gid://shopify/ProductVariant/123456789
  const hasFakeIds = items.some(item => !item.variantId.startsWith('gid://shopify/ProductVariant/'));
  
  if (hasFakeIds) {
    console.warn('Detected fake variant IDs — redirecting to store fallback');
    // Instead of throwing, we'll return null to trigger the fallback in the store
    return null;
  }

  const lines = items.map(item => ({
    quantity: item.quantity,
    merchandiseId: item.variantId,
    ...(item.customAttributes?.length && {
      attributes: item.customAttributes.map(attr => ({ key: attr.key, value: attr.value })),
    }),
  }));

   const cartData = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines },
  });
  if (!cartData || !cartData.data) {
    console.error('Failed to create cart - no data from Shopify', cartData);
    return null;
  }

  if (cartData.data?.cartCreate?.userErrors && cartData.data.cartCreate.userErrors.length > 0) {
    const errorMessages = cartData.data.cartCreate.userErrors.map((e: { message: string }) => e.message).join(', ');
    console.error('Shopify cart creation errors:', errorMessages);
    throw new Error(`Cart creation failed: ${errorMessages}`);
  }

  const cart = cartData.data?.cartCreate?.cart;

  if (!cart || !cart.checkoutUrl) {
    console.error('Cart response:', cart);
    throw new Error('No checkout URL returned from Shopify');
  }

  // Shopify can return the Vercel storefront hostname even though hosted
  // checkout must remain on Shopify. The permanent myshopify.com host is the
  // default; checkout.luxemia.shop is used only when explicitly configured
  // after DNS verification.
  const checkoutUrl = normalizeShopifyCheckoutUrl(
    cart.checkoutUrl as string,
    import.meta.env.VITE_SHOPIFY_CHECKOUT_HOST,
  );

  if (!checkoutUrl) {
    // Do not send customers to the store homepage: that discards their cart
    // and creates a silent conversion failure. Let the cart UI preserve the
    // bag and show a retryable checkout error instead.
    console.error('Unable to normalize Shopify checkout URL');
    return null;
  }

  // Checkout URL created successfully
  return checkoutUrl;
}
