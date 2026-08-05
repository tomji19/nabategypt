import { supabase } from './supabase';
import { STORE, PROMO } from '../config/store';
import { isWelcomePromoCode, normalizePromoCode } from '../utils/money';
import { parseCartKey } from '../utils/productSizes';

/**
 * True when this account has never placed an order (eligible for MEH10).
 */
export async function userHasPriorOrders(userId) {
  if (!userId) return false;
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.warn('Prior-order check failed:', error.message);
    return true; // fail closed — don't grant promo if we can't verify
  }
  return (count || 0) > 0;
}

/**
 * Validate promo for checkout UI.
 * Guests cannot redeem. Signed-in users get MEH10 once (first order only).
 */
export async function validateWelcomePromo({ userId, code }) {
  const normalized = normalizePromoCode(code);
  if (!normalized) {
    return { ok: false, reason: 'empty', discountPercent: 0 };
  }
  if (!isWelcomePromoCode(normalized)) {
    return { ok: false, reason: 'invalid', discountPercent: 0 };
  }
  if (!userId) {
    return { ok: false, reason: 'guest', discountPercent: 0 };
  }
  const used = await userHasPriorOrders(userId);
  if (used) {
    return { ok: false, reason: 'already_used', discountPercent: 0 };
  }
  return {
    ok: true,
    reason: 'applied',
    discountPercent: PROMO.percent,
    code: PROMO.code,
  };
}

/**
 * Create an order + line items in Supabase.
 * Guests: pass userId = null. Promo only applies for signed-in first orders.
 */
export async function createOrder({
  userId = null,
  formData,
  cartItems,
  subtotal,
  shipping,
  total,
  discount = 0,
  promoCode = null,
}) {
  if (!cartItems?.length) {
    throw new Error('Your cart is empty.');
  }

  let appliedPromo = null;
  let appliedDiscount = 0;

  if (promoCode && isWelcomePromoCode(promoCode)) {
    if (!userId) {
      throw new Error('Sign in to redeem your promocode.');
    }
    const used = await userHasPriorOrders(userId);
    if (used) {
      throw new Error('This promocode is only valid on your first order.');
    }
    appliedPromo = PROMO.code;
    appliedDiscount = Math.max(0, Number(discount) || 0);
  }

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
    discount_amount: appliedDiscount,
    promo_code: appliedPromo,
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
    // Fallback if discount columns are not migrated yet
    if (
      /discount_amount|promo_code/i.test(orderError.message || '') ||
      orderError.code === 'PGRST204'
    ) {
      delete orderPayload.discount_amount;
      delete orderPayload.promo_code;
      if (appliedPromo) {
        orderPayload.notes = [
          formData.notes,
          `Promo ${appliedPromo} (−${appliedDiscount} EGP)`,
        ]
          .filter(Boolean)
          .join(' · ');
      }
      const retry = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();
      if (retry.error) throw retry.error;
      return finishOrder(retry.data, cartItems);
    }
    throw orderError;
  }

  return finishOrder(order, cartItems);
}

async function finishOrder(order, cartItems) {
  const items = cartItems.map((item) => {
    const productId =
      item.productId || parseCartKey(item.id).productId || String(item.id);
    const size = item.size ?? parseCartKey(item.id).size ?? '';
    return {
      order_id: order.id,
      product_id: String(productId),
      product_name: item.name,
      product_image: typeof item.image === 'string' ? item.image : null,
      size: String(size || ''),
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
      line_total: Number(item.price) * Number(item.quantity),
    };
  });

  let { error: itemsError } = await supabase.from('order_items').insert(items);

  if (
    itemsError &&
    (/size/i.test(itemsError.message || '') || itemsError.code === 'PGRST204')
  ) {
    const legacy = items.map((row) => {
      const next = { ...row };
      delete next.size;
      return next;
    });
    ({ error: itemsError } = await supabase.from('order_items').insert(legacy));
  }

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id);
    throw itemsError;
  }

  await Promise.all(
    cartItems.map(async (item) => {
      try {
        const slug = String(
          item.productId || parseCartKey(item.id).productId || item.id
        );
        const { data: product } = await supabase
          .from('products')
          .select('id, stock')
          .eq('slug', slug)
          .maybeSingle();

        if (!product) return;

        const nextStock = Math.max(
          0,
          Number(product.stock || 0) - Number(item.quantity)
        );
        await supabase
          .from('products')
          .update({ stock: nextStock, updated_at: new Date().toISOString() })
          .eq('id', product.id);
      } catch (stockErr) {
        console.warn('Stock update skipped:', stockErr?.message || stockErr);
      }
    })
  );

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
    cartItems: items.map((item) => {
      const size = item.size || '';
      return {
        id: item.id,
        name: item.product_name,
        price: Number(item.unit_price),
        quantity: Number(item.quantity),
        image: item.product_image,
        size,
        sizeType: '',
      };
    }),
    order,
    subtotal: Number(order.subtotal) || 0,
    shipping: Number(order.shipping_fee) || 0,
    discount: Number(order.discount_amount) || 0,
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
