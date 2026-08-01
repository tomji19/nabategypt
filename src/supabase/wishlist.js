import { supabase } from './supabase';

export async function fetchWishlistSlugs(userId) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('product_slug')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((r) => r.product_slug);
}

export async function addWishlistItem(userId, productSlug) {
  const { error } = await supabase.from('wishlist_items').upsert(
    { user_id: userId, product_slug: productSlug },
    { onConflict: 'user_id,product_slug' }
  );
  if (error) throw error;
}

export async function removeWishlistItem(userId, productSlug) {
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_slug', productSlug);
  if (error) throw error;
}
