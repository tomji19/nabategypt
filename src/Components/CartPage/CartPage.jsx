import React from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCart } from '../CartContext/CartContext';
import { Link } from 'react-router-dom';
import pageBanner from '../../assets/images/pagebanner.png';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const handleRemoveItem = (id) => {
    const itemToRemove = cartItems.find((item) => item.id === id);
    if (itemToRemove) {
      removeFromCart(id);
      toast.success(`${itemToRemove.name} removed from cart!`);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 35.0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <>
      <section className="page-banner">
        <img
          src={pageBanner}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-nabat-primary/60" />
        <h1 className="page-banner-title">Cart</h1>
      </section>

      <div className="section-pad py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {cartItems.length === 0 ? (
              <div className="border border-nabat-border bg-white p-10 text-center">
                <p className="font-body text-nabat-muted">Your cart is empty.</p>
                <Link to="/shop" className="btn-primary mt-6 inline-flex">
                  Continue shopping
                </Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border border-nabat-border bg-white p-4 md:gap-6 md:p-5"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 shrink-0 object-cover bg-nabat-mist md:h-32 md:w-32"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="font-heading text-lg font-medium text-nabat-text md:text-xl">
                          {item.name}
                        </h3>
                        <p className="mt-1 font-nav text-xs text-nabat-muted">
                          {item.color} {item.size && `/ ${item.size}`}
                        </p>
                        <p className="mt-2 font-nav text-sm">${item.price.toFixed(2)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-nabat-muted hover:text-nabat-text"
                        aria-label="Remove"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <select
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, e.target.value)}
                      className="input-box mt-4 w-20 py-2"
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="border border-nabat-border bg-nabat-mist p-6 md:p-8">
              <h2 className="font-heading text-xl font-medium">Order summary</h2>
              <div className="mt-6 space-y-3 font-nav text-sm">
                <div className="flex justify-between text-nabat-muted">
                  <span>Subtotal</span>
                  <span className="text-nabat-text">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-nabat-muted">
                  <span>Shipping</span>
                  <span className="text-nabat-text">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-nabat-muted">
                  <span>Tax</span>
                  <span className="text-nabat-text">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-nabat-border pt-4 font-heading text-lg font-medium text-nabat-text">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary mt-8 w-full">
                Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
