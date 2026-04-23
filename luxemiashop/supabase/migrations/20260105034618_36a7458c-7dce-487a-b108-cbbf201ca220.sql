-- Add Shopify integration columns to scraped_products
ALTER TABLE public.scraped_products 
ADD COLUMN IF NOT EXISTS shopify_product_id TEXT,
ADD COLUMN IF NOT EXISTS shopify_variant_ids TEXT[];

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_scraped_products_shopify_id ON public.scraped_products(shopify_product_id);
