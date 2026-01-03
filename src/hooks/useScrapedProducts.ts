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
  fabric: string | null;
  color: string | null;
  work: string | null;
  occasion: string | null;
  tags: string[] | null;
  created_at: string;
  is_active: boolean;
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

// Convert scraped product to Shopify format for display
export const convertToShopifyFormat = (product: ScrapedProduct): ShopifyProduct => {
  const betterTitle = generateBetterTitle(
    product.image_url, 
    product.category, 
    product.color, 
    product.fabric
  );
  
  return {
    node: {
      id: product.id,
      title: betterTitle,
      description: product.description || `Exquisite ${betterTitle}. ${product.fabric ? `Crafted from premium ${product.fabric}.` : ''} ${product.work ? `Features beautiful ${product.work}.` : ''} Perfect for ${product.occasion || 'special occasions'}.`,
      handle: product.source_id,
      productType: product.category === 'lehengas' ? 'Bridal Lehengas' : 
                   product.category === 'sarees' ? 'Designer Sarees' :
                   product.category === 'suits' ? 'Designer Suits' : 'Menswear',
      priceRange: {
        minVariantPrice: {
          amount: product.price_usd.toString(),
          currencyCode: 'USD'
        }
      },
      images: {
        edges: [{
          node: {
            url: product.image_url.endsWith(')') ? product.image_url : product.image_url + '.jpg',
            altText: betterTitle
          }
        }]
      },
      variants: {
        edges: [
          { node: { id: `${product.id}-s`, title: 'S', price: { amount: product.price_usd.toString(), currencyCode: 'USD' }, availableForSale: true, selectedOptions: [{ name: 'Size', value: 'S' }] } },
          { node: { id: `${product.id}-m`, title: 'M', price: { amount: product.price_usd.toString(), currencyCode: 'USD' }, availableForSale: true, selectedOptions: [{ name: 'Size', value: 'M' }] } },
          { node: { id: `${product.id}-l`, title: 'L', price: { amount: product.price_usd.toString(), currencyCode: 'USD' }, availableForSale: true, selectedOptions: [{ name: 'Size', value: 'L' }] } },
          { node: { id: `${product.id}-xl`, title: 'XL', price: { amount: product.price_usd.toString(), currencyCode: 'USD' }, availableForSale: true, selectedOptions: [{ name: 'Size', value: 'XL' }] } }
        ]
      },
      options: [{ name: 'Size', values: ['S', 'M', 'L', 'XL'] }]
    }
  };
};

export const useScrapedProducts = (category?: string) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let query = supabase
          .from('scraped_products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

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
      } catch (err) {
        console.error('Error in useScrapedProducts:', err);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  return { products, isLoading, error };
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
