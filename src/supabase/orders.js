import { supabase } from './supabase';
import { STORE } from '../config/store';

/**
 * Create an order + line items in Supabase.
 * Works for guests (user_id null) and logged-in users.
 */
export async function createOrder({
  userId,
  formData,
  cartItems,
  subtotal,
  shipping,
  total,
}) {
  const orderPayload = {
    user_id: userId || null,
    customer_email: formData.email,
    customer_first_name: formData.firstName,
    customer_last_name: formData.lastName,
    customer_phone: formData.phone,
    shipping_address: formData.address,
    shipping_apartment: formData.apartment || '',
    shipping_city: formData.city || STORE.city,
    shipping_country: formData.country || STORE.country,
    payment_method: formData.paymentMethod,
    status: 'Processing',
    payment_status:
      formData.paymentMethod === 'cod' ? 'pending_cod' : 'awaiting_payment',
    subtotal,
    shipping_fee: shipping,
    tax: 0,
    total,
    currency: STORE.currency,
    notes: formData.notes || null,
  };

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select()
    .single();

  if (orderError) {
    throw orderError;
  }

  const items = cartItems.map((item) => ({
    order_id: order.id,
    product_id: String(item.id),
    product_name: item.name,
    product_image: typeof item.image === 'string' ? item.image : null,
    unit_price: Number(item.price),
    quantity: Number(item.quantity),
    line_total: Number(item.price) * Number(item.quantity),
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(items);

  if (itemsError) {
    // Best-effort cleanup if items fail
    await supabase.from('orders').delete().eq('id', order.id);
    throw itemsError;
  }

  // Best-effort stock decrement (works once products table is live)
  await Promise.all(
    cartItems.map(async (item) => {
      try {
        const slug = String(item.id);
        const { data: product } = await supabase
          .from('products')
          .select('id, stock')
          .eq('slug', slug)
          .maybeSingle();

        if (!product) return;

        const nextStock = Math.max(0, Number(product.stock || 0) - Number(item.quantity));
        await supabase
          .from('products')
          .update({ stock: nextStock, updated_at: new Date().toISOString() })
          .eq('id', product.id);
      } catch (stockErr) {
        console.warn('Stock update skipped:', stockErr?.message || stockErr);
      }
    })
  );

  // Fire-and-forget admin email (Edge Function — deploy when Supabase is ready)
  try {
    await supabase.functions.invoke('notify-new-order', {
      body: { orderId: order.id },
    });
  } catch (notifyErr) {
    console.warn('Order email notification skipped:', notifyErr?.message || notifyErr);
  }

  return order;
}

export async function fetchOrdersForUser(userId, email) {
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.or(`user_id.eq.${userId},customer_email.eq.${email}`);
  } else if (email) {
    query = query.eq('customer_email', email);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
