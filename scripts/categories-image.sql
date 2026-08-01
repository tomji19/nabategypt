-- Category images for homepage browse tiles
-- Run in Supabase → SQL Editor

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url TEXT;
