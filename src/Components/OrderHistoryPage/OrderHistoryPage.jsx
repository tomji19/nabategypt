import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import pageBanner from '../../assets/images/pagebanner.png';
import PlantLoader from '../PlantLoader/PlantLoader';
import { fetchOrdersForUser } from '../../supabase/orders';
import { PAYMENT_METHODS } from '../../config/store';
import { formatEGP } from '../../utils/money';
import { toast } from 'react-toastify';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userLoggedIn, loading: authLoading, currentUser } = useAuth();
  const navigate = useNavigate();

  const userId = currentUser?.uid;
  const userEmail = currentUser?.email;

  useEffect(() => {
    if (authLoading) return;

    if (!userLoggedIn || !userId) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const data = await fetchOrdersForUser(userId, userEmail);
        if (cancelled) return;
        setOrders(data || []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const message =
          err?.message?.includes('relation') || err?.code === '42P01'
            ? 'Orders table not ready. Run supabase_schema.sql in Supabase.'
            : err.message || 'Failed to load orders';
        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userLoggedIn, authLoading, userId, userEmail]);

  if (authLoading) {
    return <PlantLoader variant="overlay" />;
  }

  if (!userLoggedIn) {
    return null;
  }

  if (loading) {
    return <PlantLoader variant="overlay" />;
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center font-nav text-nabat-muted">
        <p className="text-red-600">{error}</p>
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchOrdersForUser(userId, userEmail)
              .then((data) => {
                setOrders(data || []);
                setError(null);
              })
              .catch((err) => setError(err.message || 'Failed to load orders'))
              .finally(() => setLoading(false));
          }}
        >
          Try again
        </button>
        <Link to="/shop" className="btn-primary">
          Back to shop
        </Link>
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
              <p className="font-body text-nabat-muted">No orders yet</p>
              <Link to="/shop" className="btn-primary mt-6 inline-flex">
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => {
                const paymentLabel =
                  PAYMENT_METHODS.find((m) => m.id === order.payment_method)
                    ?.label || order.payment_method;
                const items = order.order_items || [];

                return (
                  <div
                    key={order.id}
                    className="overflow-hidden border border-nabat-border bg-white"
                  >
                    <div className="p-6 md:p-8">
                      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h2 className="font-heading text-xl font-medium">
                            {order.order_number || order.id}
                          </h2>
                          <p className="mt-1 font-nav text-sm text-nabat-muted">
                            Placed on{' '}
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="mt-1 font-nav text-xs text-nabat-muted">
                            {paymentLabel}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-heading text-lg font-medium text-nabat-accent">
                            {formatEGP(order.total)}
                          </p>
                          <p className="font-nav text-xs uppercase tracking-wider text-nabat-muted">
                            {order.status || 'Processing'}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-nabat-border pt-5">
                        <h3 className="section-label">Items</h3>
                        {items.length > 0 ? (
                          <div className="mt-4 space-y-4">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-4"
                              >
                                <div className="flex items-center gap-4">
                                  {item.product_image && (
                                    <img
                                      src={item.product_image}
                                      alt={item.product_name}
                                      className="h-16 w-16 object-cover bg-nabat-mist"
                                    />
                                  )}
                                  <div>
                                    <p className="font-nav text-sm font-medium">
                                      {item.product_name}
                                    </p>
                                    <p className="font-nav text-xs text-nabat-muted">
                                      {item.size ? `Size: ${item.size} · ` : ''}
                                      Qty {item.quantity}
                                    </p>
                                  </div>
                                </div>
                                <p className="font-nav text-sm">
                                  {formatEGP(item.line_total)}
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

                      <div className="mt-5 border-t border-nabat-border pt-5">
                        <h3 className="section-label">Shipping</h3>
                        <p className="mt-2 font-nav text-sm text-nabat-muted">
                          {order.shipping_address}
                          {order.shipping_apartment
                            ? `, ${order.shipping_apartment}`
                            : ''}
                          , {order.shipping_city}, {order.shipping_country}
                        </p>
                      </div>

                      <div className="mt-6">
                        <Link
                          to={`/thankyoupage?orderId=${order.id}`}
                          className="btn-outline inline-flex"
                        >
                          View receipt
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
