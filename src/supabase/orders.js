import { supabase } from './supabase';
import { STORE } from '../config/store';

/**
 * Create an order + line items in Supabase.
 * Requires a signed-in account (userId).
 */
export async function createOrder({
  userId,
  formData,
  cartItems,
  subtotal,
  shipping,
  total,
}) {
  if (!userId) {
    throw new Error('You must be signed in to place an order.');
  }
  if (!cartItems?.length) {
    throw new Error('Your cart is empty.');
  }

  const orderPayload = {
    user_id: userId,
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

  // Notify admin email (Edge Function + Resend). Order still succeeds if email fails.
  try {
    const { data: notifyData, error: notifyError } =
      await supabase.functions.invoke('notify-new-order', {
        body: { orderId: order.id },
      });
    if (notifyError) {
      console.warn(
        'Order email notification failed:',
        notifyError.message || notifyError
      );
    } else if (notifyData && notifyData.emailed === false) {
      console.warn(
        'Order email skipped — deploy notify-new-order and set RESEND_API_KEY / ADMIN_EMAIL'
      );
    }
  } catch (notifyErr) {
    console.warn(
      'Order email notification skipped:',
      notifyErr?.message || notifyErr
    );
  }

  return order;
}

export async function fetchOrdersForUser(userId, email) {
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (email) {
    query = query.eq('customer_email', email);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchOrderById(orderId) {
  if (!orderId) throw new Error('Order id required');

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Order not found');
  return data;
}

/** Map a DB order into ThankYouPage receipt shape */
export function orderToReceiptState(order) {
  if (!order) return null;
  const items = order.order_items || [];
  return {
    formData: {
      firstName: order.customer_first_name || '',
      lastName: order.customer_last_name || '',
      email: order.customer_email || '',
      phone: order.customer_phone || '',
      address: order.shipping_address || '',
      apartment: order.shipping_apartment || '',
      city: order.shipping_city || '',
      country: order.shipping_country || '',
      paymentMethod: order.payment_method || '',
    },
    cartItems: items.map((item) => ({
      id: item.id,
      name: item.product_name,
      price: Number(item.unit_price),
      quantity: Number(item.quantity),
      image: item.product_image,
    })),
    order,
    subtotal: Number(order.subtotal) || 0,
    shipping: Number(order.shipping_fee) || 0,
    total: Number(order.total) || 0,
  };
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
