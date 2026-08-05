import { supabase } from './supabase';
import { parseCartKey } from '../utils/productSizes';

export async function fetchCartItems(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('product_slug, size, quantity')
    .eq('user_id', userId);

  if (error) {
    if (/size/i.test(error.message || '') || error.code === 'PGRST204') {
      const fallback = await supabase
        .from('cart_items')
        .select('product_slug, quantity')
        .eq('user_id', userId);
      if (fallback.error) throw fallback.error;
      return (fallback.data || []).map((row) => ({ ...row, size: '' }));
    }
    throw error;
  }

  return (data || []).map((row) => ({
    ...row,
    size: row.size || '',
  }));
}

export async function upsertCartItem(userId, productSlug, quantity, size = '') {
  const sizeValue = String(size || '').trim();
  if (quantity <= 0) {
    return removeCartItem(userId, productSlug, sizeValue);
  }

  const row = {
    user_id: userId,
    product_slug: productSlug,
    size: sizeValue,
    quantity,
    updated_at: new Date().toISOString(),
  };

  let { error } = await supabase.from('cart_items').upsert(row, {
    onConflict: 'user_id,product_slug,size',
  });

  if (error && (/size/i.test(error.message || '') || error.code === 'PGRST204')) {
    ({ error } = await supabase.from('cart_items').upsert(
      {
        user_id: userId,
        product_slug: productSlug,
        quantity,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,product_slug' }
    ));
  }

  if (error) throw error;
}

export async function removeCartItem(userId, productSlug, size = '') {
  const sizeValue = String(size || '').trim();

  let { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_slug', productSlug)
    .eq('size', sizeValue);

  if (error && /size/i.test(error.message || '')) {
    ({ error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_slug', productSlug));
  }

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

  const rows = items.map((item) => {
    const productId = item.productId || parseCartKey(item.id).productId;
    const size = item.size ?? parseCartKey(item.id).size ?? '';
    return {
      user_id: userId,
      product_slug: productId,
      size: String(size || '').trim(),
      quantity: item.quantity,
      updated_at: new Date().toISOString(),
    };
  });

  let { error } = await supabase.from('cart_items').insert(rows);

  if (error && (/size/i.test(error.message || '') || error.code === 'PGRST204')) {
    const legacy = rows.map((row) => {
      const next = { ...row };
      delete next.size;
      return next;
    });
    ({ error } = await supabase.from('cart_items').insert(legacy));
  }

  if (error) throw error;
}
