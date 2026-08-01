import { supabase } from './supabase';

export async function fetchCartItems(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('product_slug, quantity')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

export async function upsertCartItem(userId, productSlug, quantity) {
  if (quantity <= 0) {
    return removeCartItem(userId, productSlug);
  }
  const { error } = await supabase.from('cart_items').upsert(
    {
      user_id: userId,
      product_slug: productSlug,
      quantity,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,product_slug' }
  );
  if (error) throw error;
}

export async function removeCartItem(userId, productSlug) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_slug', productSlug);
  if (error) throw error;
}

export async function clearCartItems(userId) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

export async function replaceCartItems(userId, items) {
  await clearCartItems(userId);
  if (!items.length) return;
  const rows = items.map((item) => ({
    user_id: userId,
    product_slug: item.id,
    quantity: item.quantity,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('cart_items').insert(rows);
  if (error) throw error;
}
