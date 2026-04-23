-- Create table for scraped products with timestamps for age tracking
CREATE TABLE public.scraped_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL UNIQUE, -- Original product ID from source
  source_url text NOT NULL,
  category text NOT NULL, -- 'lehengas', 'sarees', 'suits', 'menswear'
  title text NOT NULL,
  description text NOT NULL,
  price_inr numeric NOT NULL,
  price_usd numeric NOT NULL,
  original_price_inr numeric,
  original_price_usd numeric,
  currency text NOT NULL DEFAULT 'USD',
  image_url text NOT NULL,
  fabric text,
  color text,
  work text,
  occasion text,
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.scraped_products ENABLE ROW LEVEL SECURITY;

-- Allow public read access (products are public catalog)
CREATE POLICY "Anyone can view active scraped products"
ON public.scraped_products
FOR SELECT
USING (is_active = true);

-- Create index for faster queries
CREATE INDEX idx_scraped_products_category ON public.scraped_products(category);
CREATE INDEX idx_scraped_products_created_at ON public.scraped_products(created_at);
CREATE INDEX idx_scraped_products_is_active ON public.scraped_products(is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_scraped_products_updated_at
BEFORE UPDATE ON public.scraped_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();