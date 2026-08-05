-- Run in Supabase SQL Editor if products/cart already exist.
-- Adds optional size_type + size_options on products, and size on cart/order lines.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS size_type TEXT;
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS size_options JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS size TEXT NOT NULL DEFAULT '';

ALTER TABLE public.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_user_id_product_slug_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cart_items_user_product_size_key'
  ) THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_user_product_size_key
      UNIQUE (user_id, product_slug, size);
  END IF;
END $$;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS size TEXT DEFAULT '';
