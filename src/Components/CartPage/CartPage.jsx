// CartPage.jsx
import React from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCart } from '../CartContext/CartContext';
import classes from '../CartPage/CartPage.module.css';
import { Link } from 'react-router-dom';


export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const handleRemoveItem = (id) => {
    // Find the item to be removed
    const itemToRemove = cartItems.find(item => item.id === id);
    if (itemToRemove) {
      removeFromCart(id); // Call the context function to remove the item
      toast.success(`${itemToRemove.name} removed from cart!`); // Show success message
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
      <div className={`${classes.pageBanner} px-32`}>
        <div className="h-[20rem] flex flex-col items-center justify-center">
          <h3 className="text-7xl font-bold text-white z-10">Cart</h3>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items Column */}
          <div className="lg:col-span-8">
            <div className="space-y-6">
              {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="border p-4 bg-white shadow-sm">
                    <div className="flex gap-4">
                      <img
                        src={item.image || img}
                        alt={item.name}
                        className="w-[10rem] h-[10rem] object-cover"
                      />
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-2xl">{item.name}</h3>
                            <p className="text-md text-gray-600">
                              {item.color} {item.size && `/ ${item.size}`}
                            </p>
                            <p className="mt-1 text-lg">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)} // Use the new function
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="mt-4">
                          <select
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, e.target.value)
                            }
                            className="border p-1 text-sm"
                          >
                            {[1, 2, 3, 4, 5].map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4">
            <div className="border bg-white shadow-sm">
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Order summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping estimate</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax estimate</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold">
                      <span className='mb-3 font-se text-xl'>Order total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Link to="/checkout">
                    <button className="w-full bg-[var(--main-color)] hover:bg-[var(--main-color)] text-white py-2 px-4">
                      Checkout
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
