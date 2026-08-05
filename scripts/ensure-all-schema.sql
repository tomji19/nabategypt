-- ============================================================
-- Nabat — run ONCE in Supabase → SQL Editor → New query → Run
-- Covers: dashboard flags, sizes, gallery images, cart/order size
-- Safe to re-run (IF NOT EXISTS / IF EXISTS guards)
-- ============================================================

-- Dashboard flags + category images
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_gift BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_easy_care BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Product sizes (cm / meter / S-M-L)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS size_type TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS size_options JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Extra gallery images on product detail page
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Optional “before discount” price (strikethrough on shop)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10, 2);

-- Cart / order line size
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

-- Permissions for password-gated dashboard (anon key)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO anon, authenticated;

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Dashboard write categories" ON public.categories;
CREATE POLICY "Dashboard write categories"
  ON public.categories FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public read site content" ON public.site_content;
CREATE POLICY "Public read site content"
  ON public.site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Dashboard write site content" ON public.site_content;
CREATE POLICY "Dashboard write site content"
  ON public.site_content FOR ALL
  USING (true)
  WITH CHECK (true);

-- Refresh PostgREST schema cache so new columns show up immediately
NOTIFY pgrst, 'reload schema';
