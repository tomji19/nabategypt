# نبات — Supabase setup (do this when you are ready)

The app is already wired to Supabase. Until you run the schema, checkout will show a clear error, and the shop keeps using the local product catalog.

## 1. Create a Supabase project

1. Go to https://supabase.com and create a project.
2. Copy **Project URL** and **anon public** key.
3. Create `nabategypt/.env` (or `.env.local`):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

4. Restart `npm run dev`.

## 2. Run the database schema

1. Open Supabase → **SQL Editor**.
2. Paste and run the full contents of `supabase_schema.sql`.
3. This creates: `profiles` (with admin role), `products` (+ seed), `orders`, `order_items`, RLS policies.

## 3. Dashboard access

Open **`/dashboard`** and enter password **`1999`**.

No login account is required. The password unlock lasts for the browser tab session (Lock clears it).

Email alerts still go to `youssefashour19@gmail.com` when the notify function is deployed.

## 4. Product images in the database

The seed stores products **without** local Vite image imports. Until you upload images to Supabase Storage and set `image_url` in the admin products tab, the shop will keep falling back to the local `ProductData.jsx` catalog (which has images).

**Recommended flow after schema is live:**

1. Create a Storage bucket `product-images` (public).
2. Upload plant photos.
3. In Admin → Products, set each product’s Image URL, or keep using local catalog until you migrate images.

## 5. Order email notifications (Resend)

1. Create a free account at https://resend.com
2. Get an API key.
3. Install Supabase CLI and link the project.
4. Deploy the function:

```
supabase functions deploy notify-new-order
supabase secrets set RESEND_API_KEY=re_xxx ADMIN_EMAIL=youssefashour19@gmail.com
```

5. After each successful checkout, the app calls this function and emails you the order.

Until the function is deployed, orders still save in the database and appear in `/dashboard` — you just will not get email yet.

## 6. What works right now in the code

| Feature | Status |
|--------|--------|
| EGP currency, 50 EGP Alex shipping, no tax | Done |
| Guest checkout | Done |
| COD / Vodafone Cash / Instapay / Visa (manual) | Done |
| Orders → Supabase (needs schema) | Done |
| Dashboard `/dashboard` (password `1999`) | Done |
| Products DB + dashboard edit (needs schema) | Done |
| Local product fallback with images | Done |
| Wishlist `/wishlist` | Done |
| Clothing size/color placeholders | Removed |
| Paymob live card payments | Later |
| Full AR/EN UI switch | Later |

## Payment note

Vodafone Cash & Instapay use number **01270545289**. Visa is manual until Paymob is connected.
