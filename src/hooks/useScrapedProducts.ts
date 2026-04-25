import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ShopifyProduct } from '@/lib/shopify';

export interface ScrapedProduct {
  id: string;
  source_id: string;
  source_url: string;
  category: string;
  title: string;
  description: string;
  price_inr: number;
  price_usd: number;
  original_price_inr: number | null;
  original_price_usd: number | null;
  currency: string;
  image_url: string;
  image_urls: string[] | null;
  fabric: string | null;
  color: string | null;
  work: string | null;
  occasion: string | null;
  tags: string[] | null;
  created_at: string;
  is_active: boolean;
  shopify_product_id: string | null;
  shopify_variant_ids: string[] | null;
}

// Generate better titles from the image URL
const generateBetterTitle = (imageUrl: string, category: string, color: string | null, fabric: string | null): string => {
  // Extract meaningful parts from URL like "Cherry-Natural-Silk-Bridal-Wear"
  try {
    const urlParts = imageUrl.split('/').pop()?.split('-') || [];
    const meaningfulParts = urlParts
      .slice(0, 6)
      .filter(part => !part.match(/^\d+$/) && part.length > 2)
      .map(part => part.replace(/\(.*\)/, '').trim())
      .filter(Boolean);
    
    if (meaningfulParts.length >= 3) {
      // Capitalize each word
      const title = meaningfulParts
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(' ');
      return title;
    }
  } catch (e) {
    // Fall through to default
  }
  
  // Fallback: generate from available data
  const colorPart = color && color !== 'Multi' ? color : '';
  const fabricPart = fabric && fabric !== 'Premium Fabric' ? fabric : '';
  
  const categoryTitles: Record<string, string> = {
    lehengas: 'Designer Lehenga',
    sarees: 'Handcrafted Saree',
    suits: 'Elegant Suit Set',
    menswear: 'Royal Sherwani'
  };
  
  const base = categoryTitles[category] || 'Designer Outfit';
  const parts = [colorPart, fabricPart, base].filter(Boolean);
  
  return parts.join(' ') || base;
};

// Fix truncated/malformed image URLs
// Handles patterns like:
// - "(1" -> "(1).jpg" (missing extension)
// - "(1(2).jpg" -> "(2).jpg" (malformed multi-image URL)
// - "(1(3).jpg" -> "(3).jpg"
const fixImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Fix malformed multi-image URLs like "(1(2).jpg" -> "(2).jpg"
  // The source scraper incorrectly captured these as "(1(2).jpg" instead of "(2).jpg"
  const malformedPattern = /\(1\((\d+)\)\.jpg$/i;
  if (malformedPattern.test(url)) {
    return url.replace(malformedPattern, '($1).jpg');
  }
  
  // Check if URL already has proper extension
  if (/\.(jpg|jpeg|png|webp|gif)$/i.test(url)) {
    return url;
  }
  
  // Add ).jpg for URLs ending with (1 or similar patterns
  if (/\(\d+$/.test(url)) {
    return url + ').jpg';
  }
  
  // Default fallback - add .jpg
  return url + '.jpg';
};

// Women's product keywords - if title contains any of these, it's NOT menswear
const WOMENS_KEYWORDS = [
  'salwar', 'plazzo', 'palazzo', 'sharara', 'anarkali', 'pakistani',
  'lehenga', 'saree', 'dupatta', 'kurti', 'churidar', 'ghagra',
];

// Determine the correct product type by analyzing title and tags, not just the category field.
// Some products in the database have category='menswear' but are actually women's products
// (e.g. Salwar Suits, Palazzo Suits mislabeled as Men's Ethnic Wear).
const getCorrectProductType = (product: ScrapedProduct): string => {
  const title = (product.title || '').toLowerCase();
  const sourceUrl = (product.source_url || '').toLowerCase();
  const sourceId = (product.source_id || '').toLowerCase();
  const searchText = `${title} ${sourceUrl} ${sourceId}`;

  // Check for women's suit keywords
  if (/salwar|plazzo|palazzo|sharara|anarkali|pakistani/.test(searchText)) {
    return 'Designer Suits';
  }
  // Check for lehenga
  if (/lehenga/.test(searchText)) {
    return 'Bridal Lehengas';
  }
  // Check for saree
  if (/saree/.test(searchText)) {
    return 'Designer Sarees';
  }

  // Only assign Men's Ethnic Wear if it has menswear keywords and NO women's keywords
  if (product.category === 'menswear') {
    const hasWomensKeyword = WOMENS_KEYWORDS.some(kw => searchText.includes(kw));
    if (!hasWomensKeyword) {
      return "Men's Ethnic Wear";
    }
    // Fallback for ambiguous menswear-categorized products
    return 'Designer Suits';
  }

  // Default mapping for other categories
  switch (product.category) {
    case 'lehengas': return 'Bridal Lehengas';
    case 'sarees': return 'Designer Sarees';
    case 'suits': return 'Designer Suits';
    case 'jewelry': return 'Jewelry';
    default: return product.category;
  }
};

// Convert scraped product to Shopify format for display
export const convertToShopifyFormat = (product: ScrapedProduct, shopifyProduct?: any): ShopifyProduct => {
  const betterTitle = generateBetterTitle(
    product.image_url, 
    product.category, 
    product.color, 
    product.fabric
  );
  
  // Use real Shopify variant IDs if available, otherwise generate fake ones
  const hasRealShopifyIds = product.shopify_product_id && product.shopify_variant_ids && product.shopify_variant_ids.length > 0;
  
  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL', 'Custom'];
  
  // If we have a real Shopify product, use its variants and options directly
  if (shopifyProduct && shopifyProduct.variants && shopifyProduct.options) {
    // Ensure we're using the real Shopify GID for the product ID as well
    const shopifyId = shopifyProduct.id?.startsWith('gid://') ? shopifyProduct.id : (product.shopify_product_id?.startsWith('gid://') ? product.shopify_product_id : product.id);
    
    return {
      node: {
        id: shopifyId,
        title: shopifyProduct.title || product.title || betterTitle,
        description: shopifyProduct.description || product.description,
        handle: shopifyProduct.handle || product.source_id,
        productType: getCorrectProductType(product),
        vendor: shopifyProduct.vendor,
        metadata: {
          occasion: product.occasion,
          fabric: product.fabric,
          color: product.color,
          work: product.work,
          tags: product.tags,
          priceInr: product.price_inr,
        },
        priceRange: shopifyProduct.priceRange || {
          minVariantPrice: {
            amount: product.price_usd.toString(),
            currencyCode: 'USD'
          }
        },
        images: shopifyProduct.images || {
          edges: (() => {
            const imageList = product.image_urls && product.image_urls.length > 0 
              ? product.image_urls 
              : [product.image_url];
            
            return imageList.map((imgUrl, index) => ({
              node: {
                url: fixImageUrl(imgUrl),
                altText: `${betterTitle} - View ${index + 1}`
              }
            }));
          })()
        },
        variants: shopifyProduct.variants,
        options: shopifyProduct.options
      }
    };
  }
  
  const compareAtPrice = product.original_price_usd 
    ? { amount: product.original_price_usd.toString(), currencyCode: 'USD' } 
    : null;

  const variants = hasRealShopifyIds 
    ? product.shopify_variant_ids!.map((variantId, index) => ({
        node: {
          id: variantId.startsWith('gid://') ? variantId : `gid://shopify/ProductVariant/${variantId}`,
          title: sizeOptions[index] || `Size ${index + 1}`,
          price: { amount: product.price_usd.toString(), currencyCode: 'USD' },
          compareAtPrice,
          availableForSale: true,
          selectedOptions: [{ name: 'Size', value: sizeOptions[index] || `Size ${index + 1}` }]
        }
      }))
    : sizeOptions.slice(0, 4).map((size) => ({
        node: {
          id: `${product.id}-${size.toLowerCase()}`,
          title: size,
          price: { amount: product.price_usd.toString(), currencyCode: 'USD' },
          compareAtPrice,
          availableForSale: true,
          selectedOptions: [{ name: 'Size', value: size }]
        }
      }));
  
  return {
    node: {
      id: product.shopify_product_id || product.id,
      title: product.title || betterTitle,
      description: product.description,
      handle: product.source_id,
      productType: getCorrectProductType(product),
      // Include metadata for filtering
      metadata: {
        occasion: product.occasion,
        fabric: product.fabric,
        color: product.color,
        work: product.work,
        tags: product.tags,
        priceInr: product.price_inr,
      },
      priceRange: {
        minVariantPrice: {
          amount: product.price_usd.toString(),
          currencyCode: 'USD'
        }
      },
      compareAtPriceRange: product.original_price_usd ? {
        minVariantPrice: {
          amount: product.original_price_usd.toString(),
          currencyCode: 'USD'
        }
      } : {
        minVariantPrice: {
          amount: product.price_usd.toString(),
          currencyCode: 'USD'
        }
      },
      images: {
        edges: (() => {
          // Use image_urls array if available, otherwise fall back to single image_url
          const imageList = product.image_urls && product.image_urls.length > 0 
            ? product.image_urls 
            : [product.image_url];
          
          return imageList.map((imgUrl, index) => ({
            node: {
              // Fix truncated URLs - they end with "(1" but need "(1).jpg"
              url: fixImageUrl(imgUrl),
              altText: `${betterTitle} - View ${index + 1}`
            }
          }));
        })()
      },
      variants: {
        edges: variants
      },
      options: [{ name: 'Size', values: hasRealShopifyIds ? sizeOptions : ['S', 'M', 'L', 'XL'] }]
    }
  };
};

const PAGE_SIZE = 50;

export const useScrapedProducts = (category?: string) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      setPage(0);

      try {
        let query = supabase
          .from('scraped_products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .range(0, PAGE_SIZE);

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error('Error fetching products:', fetchError);
          setError(fetchError.message);
          return;
        }

        const formattedProducts = (data || []).map(convertToShopifyFormat);
        setProducts(formattedProducts);
        setHasMore((data || []).length > PAGE_SIZE);
      } catch (err) {
        console.error('Error in useScrapedProducts:', err);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const loadMore = async () => {
    const nextPage = page + 1;
    const from = (nextPage * PAGE_SIZE) + 1;
    const to = from + PAGE_SIZE;

    setIsLoadingMore(true);
    try {
      let query = supabase
        .from('scraped_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error loading more products:', fetchError);
        return;
      }

      const formattedProducts = (data || []).map(convertToShopifyFormat);
      setProducts((prev) => [...prev, ...formattedProducts]);
      setHasMore((data || []).length > PAGE_SIZE);
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return { products, isLoading, isLoadingMore, error, hasMore, loadMore };
};

export const useScrapedProductByHandle = (handle: string | undefined) => {
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!handle) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('scraped_products')
          .select('*')
          .eq('source_id', handle)
          .eq('is_active', true)
          .single();

        if (fetchError) {
          // Try to find by ID if not found by source_id
          const { data: idData, error: idError } = await supabase
            .from('scraped_products')
            .select('*')
            .eq('id', handle)
            .eq('is_active', true)
            .single();
          
          if (idError) {
            setError('Product not found');
            return;
          }
          
          if (idData) {
            const formatted = convertToShopifyFormat(idData as ScrapedProduct);
            setProduct(formatted.node);
          }
          return;
        }

        if (data) {
          const formatted = convertToShopifyFormat(data as ScrapedProduct);
          setProduct(formatted.node);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [handle]);

  return { product, isLoading, error };
};
