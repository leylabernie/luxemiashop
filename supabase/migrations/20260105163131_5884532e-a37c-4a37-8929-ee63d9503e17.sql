-- Create table to track order tracking notifications
CREATE TABLE public.order_tracking_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  order_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  notified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_id)
);

-- Enable RLS
ALTER TABLE public.order_tracking_notifications ENABLE ROW LEVEL SECURITY;

-- Allow edge functions to insert (service role bypasses RLS)
-- No user-facing policies needed as this is internal tracking only