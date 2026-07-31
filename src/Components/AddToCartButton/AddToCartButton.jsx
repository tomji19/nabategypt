import React from 'react';
import { useCart } from '../CartContext/CartContext';

export default function AddToCartButton({ product }) {
  const { addToCart, cartItems } = useCart();
  const quantity = cartItems.find((item) => item.id === product.id)?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="flex w-full items-center justify-center gap-2 bg-nabat-primary py-3 font-nav text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-nabat-hover"
    >
      {quantity > 0 ? `Add another · ${quantity} in bag` : 'Add to cart'}
      <i className="fa-solid fa-bag-shopping text-xs" />
    </button>
  );
}
