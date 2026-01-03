-- Add image_urls array column to support multiple images per product
ALTER TABLE public.scraped_products 
ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- Update existing products to populate image_urls from image_url
UPDATE public.scraped_products 
SET image_urls = ARRAY[image_url] 
WHERE image_urls = '{}' OR image_urls IS NULL;