-- ============================================
-- AUTH SESSION NOTES (configure in Dashboard)
-- ============================================
-- Access token (JWT) is short-lived; the client refreshes it automatically.
-- For ~7 day login persistence, set in:
--   Authentication → Sessions
-- Recommended:
--   - Access token expiry: 3600 seconds (1 hour) — keep short; refresh handles continuity
--   - Time-box user sessions: 604800 seconds (7 days) — max session lifetime
--   - Inactivity timeout: optional (e.g. 604800) or leave disabled
-- Refresh tokens rotate automatically; supabase-js autoRefreshToken keeps users signed in
-- until the session time-box / refresh token is revoked (sign out).

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  fullname TEXT,
  name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer'
    CHECK (role IN ('customer', 'admin')),
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_google BOOLEAN DEFAULT FALSE,
  login_method TEXT CHECK (login_method IN ('email', 'google', 'anonymous', 'guest')),
  last_login TIMESTAMPTZ,
  shipping_addresses JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{
    "emailNotifications": true,
    "orderUpdates": true,
    "promotions": false
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If profiles already exists, add role column safely
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role TEXT := 'customer';
BEGIN
  -- Only this email is admin
  IF LOWER(NEW.email) = 'youssefashour19@gmail.com' THEN
    assigned_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, fullname, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'fullname', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'fullname', ''),
    assigned_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE
      WHEN LOWER(EXCLUDED.email) = 'youssefashour19@gmail.com' THEN 'admin'
      ELSE public.profiles.role
    END,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Helper: is current user admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (
        role = 'admin'
        OR LOWER(email) = 'youssefashour19@gmail.com'
      )
  );
$$;

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_recent BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active products" ON public.products;
CREATE POLICY "Public can read active products"
  ON public.products FOR SELECT
  USING (is_active = TRUE OR true);

-- Dashboard is password-gated in the app (not Supabase Auth).
-- These policies let the anon key manage catalog/orders from /dashboard.
DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
DROP POLICY IF EXISTS "Dashboard can insert products" ON public.products;
CREATE POLICY "Dashboard can insert products"
  ON public.products FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update products" ON public.products;
DROP POLICY IF EXISTS "Dashboard can update products" ON public.products;
CREATE POLICY "Dashboard can update products"
  ON public.products FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can delete products" ON public.products;
DROP POLICY IF EXISTS "Dashboard can delete products" ON public.products;
CREATE POLICY "Dashboard can delete products"
  ON public.products FOR DELETE
  USING (true);

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category);
CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products(slug);
CREATE INDEX IF NOT EXISTS products_active_idx ON public.products(is_active);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_apartment TEXT DEFAULT '',
  shipping_city TEXT NOT NULL DEFAULT 'Alexandria',
  shipping_country TEXT NOT NULL DEFAULT 'Egypt',
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN (
      'pending', 'pending_cod', 'awaiting_payment', 'paid', 'failed', 'refunded'
    )),
  status TEXT NOT NULL DEFAULT 'Processing'
    CHECK (status IN (
      'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'
    )),
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 50,
  tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EGP',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto order number: NBT-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number :=
      'NBT-' ||
      TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
      UPPER(SUBSTR(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_order_number ON public.orders;
CREATE TRIGGER trg_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_number();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Signed-in customers only; order must belong to them
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users create own orders" ON public.orders;
CREATE POLICY "Authenticated users create own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Customers see their own orders
DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Dashboard (anon key, password-gated UI) can still list/update all orders
DROP POLICY IF EXISTS "Anon dashboard read orders" ON public.orders;
CREATE POLICY "Anon dashboard read orders"
  ON public.orders FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
DROP POLICY IF EXISTS "Dashboard update orders" ON public.orders;
CREATE POLICY "Dashboard update orders"
  ON public.orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_email_idx ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  product_image TEXT,
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated insert order items" ON public.order_items;
CREATE POLICY "Authenticated insert order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users read own order items" ON public.order_items;
CREATE POLICY "Users read own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anon dashboard read order items" ON public.order_items;
CREATE POLICY "Anon dashboard read order items"
  ON public.order_items FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);

-- ============================================
-- GRANTS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT INSERT, SELECT, UPDATE ON public.orders TO anon, authenticated;
GRANT INSERT, SELECT ON public.order_items TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Promote existing admin account if already registered
UPDATE public.profiles
SET role = 'admin'
WHERE LOWER(email) = 'youssefashour19@gmail.com';

-- ============================================
-- PRODUCT SEED (prices in EGP — edit from admin later)
-- image_url left as slug path hint; upload to Storage and update in admin
-- ============================================
INSERT INTO public.products (slug, name, category, price, stock, is_featured, is_recent, sort_order, description) VALUES
  ('irishflower', 'Irish Flower', 'Succulent', 35, 10, false, false, 1, ''),
  ('bluechalksticks', 'Bluechalk Sticks', 'Succulent', 45, 10, true, false, 2, ''),
  ('coppersedum', 'Copper Sedum', 'Succulent', 45, 10, true, false, 3, ''),
  ('gollumjade', 'Gollum Jade', 'Succulent', 45, 10, false, false, 4, ''),
  ('haworthiafasciata', 'Haworthia Fasciata', 'Succulent', 45, 10, false, true, 5, ''),
  ('sedum', 'Sedum', 'Succulent', 45, 10, false, false, 6, ''),
  ('auroraborealis', 'Aurora Borealis', 'Succulent', 45, 10, false, false, 7, ''),
  ('pencilcactus', 'Pencil Cactus', 'Succulent', 45, 10, false, false, 8, ''),
  ('spooncactus', 'Spoon Cactus', 'Succulent', 45, 10, false, false, 9, ''),
  ('kalanchoemarmorata', 'Kalanchoe Marmorata', 'Succulent', 45, 10, false, false, 10, ''),
  ('kleidostylis', 'Kleidostylis', 'Succulent', 45, 10, false, false, 11, ''),
  ('lawyerstongue', 'Lawyer''s Tongue', 'Succulent', 45, 10, false, false, 12, ''),
  ('paddleplant', 'Paddle Plant', 'Succulent', 45, 10, false, false, 13, ''),
  ('thaiplant', 'Thai Plant', 'Indoor Plants', 45, 10, false, false, 14, ''),
  ('handingpothos', 'Handing Pothos', 'Indoor Plants', 45, 10, false, false, 15, ''),
  ('bamboo', 'Bamboo', 'Indoor Plants', 45, 10, true, false, 16, ''),
  ('snakeplant', 'Snake Plant', 'Indoor Plants', 45, 10, true, true, 17, ''),
  ('dracaenadragon', 'Dracaena Dragon', 'Indoor Plants', 45, 10, false, false, 18, ''),
  ('lemoncypress', 'Lemon Cypress', 'Indoor Plants', 45, 10, false, false, 19, ''),
  ('sansevieria', 'Sansevieria', 'Indoor Plants', 45, 10, false, false, 20, ''),
  ('schefflera', 'Schefflera', 'Indoor Plants', 45, 10, false, false, 21, ''),
  ('rosemary', 'Rosemary', 'Outdoor Plants', 45, 10, false, false, 22, ''),
  ('basil', 'Basil', 'Outdoor Plants', 45, 10, false, false, 23, ''),
  ('williamsplant', 'William''s Plant', 'Outdoor Plants', 45, 10, false, false, 24, ''),
  ('sanguinaria', 'Sanguinaria', 'Outdoor Plants', 45, 10, false, false, 25, ''),
  ('pansy', 'Pansy', 'Outdoor Plants', 45, 10, false, false, 26, ''),
  ('marjoram', 'Marjoram', 'Outdoor Plants', 45, 10, true, false, 27, ''),
  ('periwinkle', 'Periwinkle', 'Outdoor Plants', 45, 10, true, true, 28, ''),
  ('mint', 'Mint', 'Outdoor Plants', 45, 10, true, true, 29, ''),
  ('rose', 'Rose', 'Outdoor Plants', 45, 10, false, false, 30, '')
ON CONFLICT (slug) DO NOTHING;

-- Extra product fields for care / light / sale / hover
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS care TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS light TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS hover_image_url TEXT;

-- ============================================
-- CART ITEMS (logged-in users — synced to Supabase)
-- Guests keep cart in React memory only (no localStorage)
-- ============================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_slug)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own cart" ON public.cart_items;
CREATE POLICY "Users manage own cart"
  ON public.cart_items FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER set_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS cart_items_user_id_idx ON public.cart_items(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;

-- ============================================
-- WISHLIST ITEMS (logged-in users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_slug)
);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own wishlist" ON public.wishlist_items;
CREATE POLICY "Users manage own wishlist"
  ON public.wishlist_items FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS wishlist_items_user_id_idx ON public.wishlist_items(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;

-- ============================================
-- STORAGE: product images (public bucket)
-- Create bucket in Dashboard → Storage if insert fails,
-- or run after enabling storage.
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Dashboard upload product images" ON storage.objects;
CREATE POLICY "Dashboard upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Dashboard update product images" ON storage.objects;
CREATE POLICY "Dashboard update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Dashboard delete product images" ON storage.objects;
CREATE POLICY "Dashboard delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products');

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Dashboard write categories" ON public.categories;
CREATE POLICY "Dashboard write categories"
  ON public.categories FOR ALL
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated;

INSERT INTO public.categories (slug, name, name_ar, description, description_ar, sort_order) VALUES
  ('succulent', 'Succulent', 'صباريات', 'Low-water desert greens', 'نباتات صحراوية قليلة الري', 1),
  ('indoor-plants', 'Indoor Plants', 'نباتات داخلية', 'For bright rooms and calm corners', 'لغرف مضيئة وزوايا هادئة', 2),
  ('outdoor-plants', 'Outdoor Plants', 'نباتات خارجية', 'Sun-loving balcony and garden plants', 'لنباتات الشرفات والحدائق', 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SITE CONTENT (editable page texts)
-- ============================================
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site content" ON public.site_content;
CREATE POLICY "Public read site content"
  ON public.site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Dashboard write site content" ON public.site_content;
CREATE POLICY "Dashboard write site content"
  ON public.site_content FOR ALL
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO anon, authenticated;

