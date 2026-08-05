-- Run in Supabase SQL Editor for existing projects.
-- Extra product images shown on the detail page (beyond main + hover).

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb;
