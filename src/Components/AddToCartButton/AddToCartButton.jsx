import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext/CartContext';
import { productRequiresSize } from '../../utils/productSizes';

export default function AddToCartButton({ product }) {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const needsSize = productRequiresSize(product);
  const quantity = needsSize
    ? cartItems
        .filter((item) => (item.productId || item.id) === product.id)
        .reduce((sum, item) => sum + (item.quantity || 0), 0)
    : cartItems.find((item) => item.id === product.id)?.quantity || 0;

  const handleAddToCart = () => {
    if (needsSize) {
      navigate(`/singleproduct/${product.id}`);
      return;
    }
    addToCart(product);
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="flex w-full items-center justify-center gap-2 bg-nabat-primary py-3 font-nav text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-nabat-hover"
    >
      {needsSize
        ? 'Choose size'
        : quantity > 0
          ? `Add another · ${quantity} in bag`
          : 'Add to cart'}
      <i className="fa-solid fa-bag-shopping text-xs" />
    </button>
  );
}
