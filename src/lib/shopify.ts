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
    description: string;
    descriptionHtml?: string;
    handle: string;
    vendor?: string;
    productType?: string;
    tags?: string[];
    metadata?: ProductMetadata;
    priceRange: {
      minVariantPrice: {
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
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
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
  try {
    // Check if any variant ID is "fake" (doesn't look like a Shopify GID)
    // Shopify GIDs look like: gid://shopify/ProductVariant/123456789
    const hasFakeIds = items.some(item => !item.variantId.startsWith('gid://shopify/ProductVariant/'));

    if (hasFakeIds) {
      console.log('Detected fake variant IDs, routing to Shopify product page instead of direct checkout');
      // Redirect to the first product's page on the Shopify store so the customer can purchase from there
      const firstHandle = items.find(item => item.handle)?.handle;
      if (firstHandle) {
        return `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/products/${firstHandle}`;
      }
      // If no handle available, redirect to the store homepage
      return `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}`;
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

    if (!cartData) {
      throw new Error('Failed to create cart - no response from Shopify');
    }

    if (cartData.data?.cartCreate?.userErrors && cartData.data.cartCreate.userErrors.length > 0) {
      const errorMessages = cartData.data.cartCreate.userErrors.map((e: { message: string }) => e.message).join(', ');
      console.error('Shopify cart creation errors:', errorMessages);
      
      // Fallback for user errors (like invalid variant IDs that weren't caught by the prefix check)
      if (items.length === 1 && items[0].handle) {
        return `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/products/${items[0].handle}`;
      }
      throw new Error(`Cart creation failed: ${errorMessages}`);
    }

    const cart = cartData.data?.cartCreate?.cart;
    
    if (!cart || !cart.checkoutUrl) {
      console.error('Cart response:', cart);
      throw new Error('No checkout URL returned from Shopify');
    }

    const url = new URL(cart.checkoutUrl);
    url.searchParams.set('channel', 'online_store');
    
    console.log('Checkout URL created successfully:', url.toString());
    return url.toString();
  } catch (error) {
    console.error('Error creating storefront checkout:', error);
    // Final fallback: redirect to Shopify product page or store homepage
    const firstHandle = items.find(item => item.handle)?.handle;
    if (firstHandle) {
      return `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/products/${firstHandle}`;
    }
    return `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}`;
  }
}
