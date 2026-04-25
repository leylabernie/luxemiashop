import { toast } from 'sonner';

// Shopify API Configuration
const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'c98d10d5abd95e6a8d6ddbed223ef4b4';

// Product metadata for filtering
export interface ProductMetadata {
  occasion?: string | null;
  fabric?: string | null;
  color?: string | null;
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
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          sku?: string;
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
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

const STOREFRONT_QUERY = `
  query GetProducts($first: Int!, $query: String, $after: String) {
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
          descriptionHtml
          handle
          vendor
          productType
          tags
          availableForSale
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
                sku
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
    productByHandle(handle: $handle) {
      id
      title
      description
      descriptionHtml
      handle
      vendor
      productType
      tags
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
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            sku
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
`;

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

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
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
    const data = await storefrontApiRequest(STOREFRONT_QUERY, { first, query });
    if (!data) return [];
    return data.data.products.edges || [];
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

      const data = await storefrontApiRequest(STOREFRONT_QUERY, variables);
      if (!data) break;

      const edges = data.data.products.edges || [];
      allProducts.push(...edges);

      const pageInfo = data.data.products.pageInfo;
      hasNextPage = pageInfo?.hasNextPage ?? false;
      cursor = pageInfo?.endCursor ?? null;
    }
  } catch (error) {
    console.error('Error fetching all products:', error);
  }

  return allProducts;
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct['node'] | null> {
  try {
    const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
    if (!data) return null;
    return data.data.productByHandle || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function createStorefrontCheckout(items: Array<{ variantId: string; quantity: number; handle?: string; customAttributes?: Array<{ key: string; value: string }> }>): Promise<string> {
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

  // Ensure the checkout URL always points to the myshopify.com domain.
  // Shopify may return URLs using a custom domain (luxemia.shop) or browsers
  // may have cached the old Lovable domain — both will 404 since the site
  // now runs on Vercel. Do a robust string replacement for any non-myshopify domain.
  let checkoutUrl = cart.checkoutUrl as string;
  try {
    const url = new URL(checkoutUrl);
    // Replace any hostname that isn't the myshopify domain
    if (url.hostname !== SHOPIFY_STORE_PERMANENT_DOMAIN) {
      url.hostname = SHOPIFY_STORE_PERMANENT_DOMAIN;
    }
    url.searchParams.set('channel', 'online_store');
    checkoutUrl = url.toString();
  } catch {
    // URL parsing failed — do plain string replacements as fallback
    checkoutUrl = checkoutUrl
      .replace(/luxemia\.shop/g, SHOPIFY_STORE_PERMANENT_DOMAIN)
      .replace(/luxemiashop\.lovable\.app/g, SHOPIFY_STORE_PERMANENT_DOMAIN);
  }

  // Final safety check: if the URL still doesn't point to myshopify.com,
  // try to extract the cart token and construct the URL manually
  if (!checkoutUrl.includes('myshopify.com')) {
    const tokenMatch = checkoutUrl.match(/\/cart\/c\/([^?]+)/);
    const keyMatch = checkoutUrl.match(/[?&]key=([^&]+)/);
    if (tokenMatch) {
      checkoutUrl = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/cart/c/${tokenMatch[1]}`;
      if (keyMatch) {
        checkoutUrl += `?key=${keyMatch[1]}&channel=online_store`;
      } else {
        checkoutUrl += '?channel=online_store';
      }
    } else {
      // Cannot salvage the URL — fall back to the store homepage
      checkoutUrl = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}`;
    }
  }

  console.log('Checkout URL created successfully:', checkoutUrl);
  return checkoutUrl;
}
