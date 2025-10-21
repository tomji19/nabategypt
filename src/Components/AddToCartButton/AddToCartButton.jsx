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
      onClick={handleAddToCart}
      className="bg-[var(--main-color)] py-2 px-6 text-white font-bold w-[100%] flex justify-between items-center"
    >
      <span className="w-full text-center">Add to Cart</span>
      <i className="fa-solid fa-bag-shopping w-auto text-end"></i>
    </button>
  );
}
