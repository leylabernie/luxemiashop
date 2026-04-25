import { supabase } from "@/integrations/supabase/client";
import type { ShopifyProductNode } from "@/data/localProducts";

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
  fabric: string | null;
  color: string | null;
  work: string | null;
  occasion: string | null;
  tags: string[];
  created_at: string;
  is_active: boolean;
}

// Convert scraped product to Shopify format for display
const convertToShopifyFormat = (product: ScrapedProduct): { node: ShopifyProductNode } => ({
  node: {
    id: product.id,
    title: product.title,
    description: product.description,
    handle: product.source_id,
    productType: product.category === 'lehengas' ? 'Bridal Lehengas' : 
                 product.category === 'sarees' ? 'Designer Sarees' :
                 product.category === 'suits' ? 'Designer Suits' :
                 product.category === 'indowestern' ? 'Indo Western' : 'Menswear',
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
      edges: [{
        node: {
          url: product.image_url,
          altText: product.title
        }
      }]
    },
    variants: {
      edges: [
        { node: { id: `${product.id}-s`, title: 'S', price: { amount: product.price_usd.toString(), currencyCode: 'USD' }, compareAtPrice: product.original_price_usd ? { amount: product.original_price_usd.toString(), currencyCode: 'USD' } : null, availableForSale: true, selectedOptions: [{ name: 'Size', value: 'S' }] } },
        { node: { id: `${product.id}-m`, title: 'M', price: { amount: product.price_usd.toString(), currencyCode: 'USD' }, compareAtPrice: product.original_price_usd ? { amount: product.original_price_usd.toString(), currencyCode: 'USD' } : null, availableForSale: true, selectedOptions: [{ name: 'Size', value: 'M' }] } },
        { node: { id: `${product.id}-l`, title: 'L', price: { amount: product.price_usd.toString(), currencyCode: 'USD' }, compareAtPrice: product.original_price_usd ? { amount: product.original_price_usd.toString(), currencyCode: 'USD' } : null, availableForSale: true, selectedOptions: [{ name: 'Size', value: 'L' }] } },
        { node: { id: `${product.id}-xl`, title: 'XL', price: { amount: product.price_usd.toString(), currencyCode: 'USD' }, compareAtPrice: product.original_price_usd ? { amount: product.original_price_usd.toString(), currencyCode: 'USD' } : null, availableForSale: true, selectedOptions: [{ name: 'Size', value: 'XL' }] } }
      ]
    },
    options: [{ name: 'Size', values: ['S', 'M', 'L', 'XL'] }]
  }
});

// Fetch scraped products from database
export const fetchScrapedProducts = async (category?: string): Promise<{ node: ShopifyProductNode }[]> => {
  try {
    let query = supabase
      .from('scraped_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching scraped products:', error);
      return [];
    }

    return (data || []).map(convertToShopifyFormat);
  } catch (error) {
    console.error('Error in fetchScrapedProducts:', error);
    return [];
  }
};

// Fetch scraped lehengas
export const fetchScrapedLehengas = () => fetchScrapedProducts('lehengas');

// Fetch scraped sarees
export const fetchScrapedSarees = () => fetchScrapedProducts('sarees');

// Fetch scraped suits
export const fetchScrapedSuits = () => fetchScrapedProducts('suits');

// Fetch scraped menswear
export const fetchScrapedMenswear = () => fetchScrapedProducts('menswear');

// Trigger manual sync (for admin use)
export const triggerProductSync = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-products');

    if (error) {
      console.error('Error triggering sync:', error);
      return { success: false, message: error.message };
    }

    return { 
      success: data.success, 
      message: `Synced ${data.added || 0} products, deleted ${data.deleted || 0} old products` 
    };
  } catch (error) {
    console.error('Error in triggerProductSync:', error);
    return { success: false, message: 'Failed to trigger sync' };
  }
};