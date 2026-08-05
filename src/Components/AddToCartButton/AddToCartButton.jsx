import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext/CartContext';
import {
  getSoleSizeValue,
  makeCartKey,
  productNeedsSizeChoice,
} from '../../utils/productSizes';

export default function AddToCartButton({ product }) {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const needsSizeChoice = productNeedsSizeChoice(product);
  const soleSize = getSoleSizeValue(product);
  const cartKey = makeCartKey(product.id, soleSize);
  const quantity = needsSizeChoice
    ? cartItems
        .filter((item) => (item.productId || item.id) === product.id)
        .reduce((sum, item) => sum + (item.quantity || 0), 0)
    : cartItems.find((item) => item.id === cartKey)?.quantity || 0;

  const handleAddToCart = () => {
    if (needsSizeChoice) {
      navigate(`/singleproduct/${product.id}`);
      return;
    }
    addToCart(product, { size: soleSize });
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="flex w-full items-center justify-center gap-2 bg-nabat-primary py-3 font-nav text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-nabat-hover"
    >
      {needsSizeChoice
        ? 'Choose size'
        : quantity > 0
          ? `Add another · ${quantity} in bag`
          : 'Add to cart'}
      <i className="fa-solid fa-bag-shopping text-xs" />
    </button>
  );
}
