import { STORE } from '../config/store';

/** Format amount in Egyptian Pounds */
export function formatEGP(amount) {
  const n = Number(amount) || 0;
  return `${n.toFixed(0)} ${STORE.currency}`;
}

export function calcOrderTotals(cartItems, shippingFee = STORE.shippingFee) {
  const subtotal = (cartItems || []).reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );
  const shipping = shippingFee;
  const tax = 0;
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
}
