-- ============================================================
-- REQUIRED for dashboard persistence (categories images, gift flag)
-- Run once in Supabase → SQL Editor, then click Save again in /dashboard
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_gift BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_easy_care BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Make sure anon/authenticated can manage catalog from the password-gated dashboard
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

-- Refresh PostgREST schema cache so new columns are visible immediately
NOTIFY pgrst, 'reload schema';
