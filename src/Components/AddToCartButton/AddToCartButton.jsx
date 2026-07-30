import React from 'react';
import { useCart } from '../CartContext/CartContext';
import { toast } from 'react-toastify';

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
    toast.configure({
      position: toast.POSITION.BOTTOM_CENTER,
    });
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="flex w-full items-center justify-center gap-2 bg-nabat-primary py-3 font-nav text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-nabat-hover"
    >
      Add to cart
      <i className="fa-solid fa-bag-shopping text-xs" />
    </button>
  );
}
