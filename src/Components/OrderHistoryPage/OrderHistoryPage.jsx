import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import pageBanner from '../../assets/images/pagebanner.png';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!userLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
      const uniqueOrders = Array.from(
        new Set(storedOrders.map((order) => order.orderId))
      ).map((id) => storedOrders.find((order) => order.orderId === id));
      setOrders(
        uniqueOrders.filter(
          (order) => order.cartItems && order.cartItems.length > 0
        )
      );
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [userLoggedIn, navigate, authLoading]);

  const removeOrder = (orderId) => {
    const updatedOrders = orders.filter((order) => order.orderId !== orderId);
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-nabat-accent border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-nav text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <section className="page-banner">
        <img
          src={pageBanner}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-nabat-primary/60" />
        <div className="relative z-10">
          <p className="mb-2 font-nav text-[11px] uppercase tracking-[0.2em] text-white/70">
            Orders
          </p>
          <h1 className="page-banner-title">Order history</h1>
          <button
            type="button"
            className="mt-4 font-nav text-[11px] uppercase tracking-[0.14em] text-white/80 hover:text-white"
            onClick={() => navigate('/accountdetails')}
          >
            ← Back to My Account
          </button>
        </div>
      </section>

      <div className="section-pad leaf-wash py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          {orders.length === 0 ? (
            <div className="border border-nabat-border bg-white p-12 text-center">
              <p className="font-body text-nabat-muted">No orders found</p>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order, index) => (
                <div
                  key={index}
                  className="overflow-hidden border border-nabat-border bg-white"
                >
                  <div className="p-6 md:p-8">
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="font-heading text-xl font-medium">
                          Order {order.orderId}
                        </h2>
                        <p className="mt-1 font-nav text-sm text-nabat-muted">
                          Placed on {order.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-lg font-medium text-nabat-accent">
                          ${order.total ? order.total.toFixed(2) : ''}
                        </p>
                        <p className="font-nav text-xs uppercase tracking-wider text-nabat-muted">
                          {order.status || 'Pending'}
                        </p>
                        <button
                          type="button"
                          className="mt-2 font-nav text-xs text-red-600 hover:underline"
                          onClick={() => removeOrder(order.orderId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-nabat-border pt-5">
                      <h3 className="section-label">Items</h3>
                      {order.cartItems?.length > 0 ? (
                        <div className="mt-4 space-y-4">
                          {order.cartItems.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-16 w-16 object-cover bg-nabat-mist"
                                />
                                <div>
                                  <p className="font-nav text-sm font-medium">
                                    {item.name}
                                  </p>
                                  <p className="font-nav text-xs text-nabat-muted">
                                    Qty {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <p className="font-nav text-sm">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="font-nav text-sm text-nabat-muted">
                          No items in this order.
                        </p>
                      )}
                    </div>

                    {order.formData && (
                      <div className="mt-5 border-t border-nabat-border pt-5">
                        <h3 className="section-label">Shipping</h3>
                        <p className="mt-2 font-nav text-sm text-nabat-muted">
                          {order.formData.address}, {order.formData.apartment},{' '}
                          {order.formData.city}, {order.formData.country}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
