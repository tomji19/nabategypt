# نبات — Supabase setup (do this when you are ready)

The app is already wired to Supabase. Until you run the schema, checkout will show a clear error, and the shop keeps using the local product catalog.

## 1. Create a Supabase project

1. Go to https://supabase.com and create a project.
2. Copy **Project URL** and **anon public** key.
3. Create `nabategypt/.env` (or `.env.local`):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key
```

Use the **publishable** key (`sb_publishable_…`) or the legacy **anon** JWT from Dashboard → **Settings → API Keys**. Do not use a secret / `service_role` key in the browser.

4. **Restart** `npm run dev` after any `.env` change (Vite only reads env on startup).

## 2. Run the database schema

1. Open Supabase → **SQL Editor**.
2. Paste and run the full contents of `supabase_schema.sql`.
3. This creates: `profiles` (with admin role), `products` (+ seed), `orders`, `order_items`, RLS policies.

## 3. Dashboard access

Open **`/dashboard`** and enter password **`1999`**.

No login account is required. The password unlock lasts for the browser tab session (Lock clears it).

Email alerts still go to `youssefashour19@gmail.com` when the notify function is deployed.

## 4. Product & site images

In Admin → **Products**, **Categories**, and **Site content** you can:

1. **Drag & drop** or browse a file (uploads to the public `products` Storage bucket under `catalog/` or `cms/…`), or  
2. Paste an **image URL**.

**Categories** (Supabase `categories` table) drive the homepage browse tiles, navbar, and shop filters. Add an image on each category for the homepage.

**Site content** is split into panels — each **Save this section** button updates only that part in Supabase (`site_content`).

For **Homepage sections** (Seasonal / Easy care / Gift ready / Bestsellers), use the dashboard tab **Homepage sections** and tick products. Also run **`scripts/ensure-dashboard-schema.sql`** so `is_gift` and `is_easy_care` columns exist.


Optional hover image uses the same control.

If upload fails with “Bucket not found”, create a public Storage bucket named **`products`** in Supabase (or re-run the storage section of `supabase_schema.sql`).

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
| Checkout requires signed-in account | Done |
| COD / Vodafone Cash / Instapay / Visa (manual) | Done |
| Orders → Supabase (needs schema) | Done |
| Dashboard `/dashboard` (password `1999`) | Done |
| Products DB + dashboard edit (needs schema) | Done |
| Wishlist `/wishlist` | Done |
| Clothing size/color placeholders | Removed |
| Paymob live card payments | Later |
| Full AR/EN UI switch | Later |

## 7. Re-apply order auth policies (if DB already exists)

In Supabase SQL Editor, re-run the **orders / order_items RLS** section from `supabase_schema.sql` (policies named “Authenticated users create own orders”, “Users read own orders”, etc.) so guest inserts are blocked and customers only read their own orders.

## Payment note

Vodafone Cash & Instapay use number **01270545289**. Visa is manual until Paymob is connected.
