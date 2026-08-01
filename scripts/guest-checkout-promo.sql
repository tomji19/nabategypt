-- Guest checkout + promocode columns
-- Run in Supabase → SQL Editor

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS promo_code TEXT;

-- Allow guests (anon) to place orders with no user_id
DROP POLICY IF EXISTS "Guests create orders" ON public.orders;
CREATE POLICY "Guests create orders"
  ON public.orders FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "Guests insert order items" ON public.order_items;
CREATE POLICY "Guests insert order items"
  ON public.order_items FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id IS NULL
    )
  );
