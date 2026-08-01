-- Gift-ready homepage flag for products
-- Run in Supabase → SQL Editor

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_gift BOOLEAN NOT NULL DEFAULT FALSE;
