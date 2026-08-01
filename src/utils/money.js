import { STORE, PROMO } from '../config/store';

/** Format amount in Egyptian Pounds */
export function formatEGP(amount) {
  const n = Number(amount) || 0;
  return `${n.toFixed(0)} ${STORE.currency}`;
}

/**
 * @param {Array} cartItems
 * @param {number} [shippingFee]
 * @param {{ discountPercent?: number }} [opts]
 */
export function calcOrderTotals(
  cartItems,
  shippingFee = STORE.shippingFee,
  opts = {}
) {
  const subtotal = (cartItems || []).reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );
  const shipping = shippingFee;
  const tax = 0;
  const discountPercent = Number(opts.discountPercent) || 0;
  const discount =
    discountPercent > 0
      ? Math.round((subtotal * discountPercent) / 100)
      : 0;
  const total = Math.max(0, subtotal - discount) + shipping + tax;
  return { subtotal, shipping, tax, discount, total };
}

export function normalizePromoCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

export function isWelcomePromoCode(value) {
  return normalizePromoCode(value) === PROMO.code;
}
