-- Create abandoned_carts table for tracking cart abandonment
CREATE TABLE public.abandoned_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  cart_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  recovered_at TIMESTAMP WITH TIME ZONE,
  recovery_code TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reminded', 'recovered', 'expired'))
);

-- Enable RLS
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Users can view their own abandoned carts
CREATE POLICY "Users can view their own abandoned carts"
ON public.abandoned_carts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own abandoned carts
CREATE POLICY "Users can insert their own abandoned carts"
ON public.abandoned_carts
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own abandoned carts
CREATE POLICY "Users can update their own abandoned carts"
ON public.abandoned_carts
FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can manage all carts (for edge functions)
CREATE POLICY "Service role can manage all carts"
ON public.abandoned_carts
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow anonymous insert for guest carts
CREATE POLICY "Allow anonymous cart creation"
ON public.abandoned_carts
FOR INSERT
WITH CHECK (user_id IS NULL AND email IS NOT NULL);

-- Create index for efficient queries
CREATE INDEX idx_abandoned_carts_status ON public.abandoned_carts(status);
CREATE INDEX idx_abandoned_carts_created_at ON public.abandoned_carts(created_at);
CREATE INDEX idx_abandoned_carts_email ON public.abandoned_carts(email);

-- Add trigger for updated_at
CREATE TRIGGER update_abandoned_carts_updated_at
BEFORE UPDATE ON public.abandoned_carts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();