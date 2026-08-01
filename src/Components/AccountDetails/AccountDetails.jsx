import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';
import { supabase } from '../../supabase/supabase';
import { fetchOrdersForUser } from '../../supabase/orders';
import pageBanner from '../../assets/images/pagebanner.png';
import PlantLoader from '../PlantLoader/PlantLoader';
import { toast } from 'react-toastify';
import { getAuthErrorMessage } from '../../supabase/authErrors';

const emptyDetails = {
  email: '',
  name: '',
  phone: '',
  shippingAddresses: [],
};

export default function AccountDetails() {
  const navigate = useNavigate();
  const {
    currentUser,
    userLoggedIn,
    userDetails: authUserDetails,
    loading: authLoading,
    refreshProfile,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('personal');
  const [userDetails, setUserDetails] = useState(emptyDetails);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (authLoading) return;

      if (!userLoggedIn || !currentUser?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Show auth profile immediately so the page never feels stuck
      setUserDetails({
        email: currentUser.email || authUserDetails?.email || '',
        name: authUserDetails?.name || authUserDetails?.fullname || '',
        phone: authUserDetails?.phone || '',
        shippingAddresses: Array.isArray(authUserDetails?.shipping_addresses)
          ? authUserDetails.shipping_addresses
          : [],
      });

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.uid)
          .maybeSingle();

        if (cancelled) return;

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          setError('Could not load full profile. You can still edit basic info.');
        } else if (profile) {
          const addresses = Array.isArray(profile.shipping_addresses)
            ? profile.shipping_addresses
            : [];
          setUserDetails({
            email: profile.email || currentUser.email || '',
            name: profile.name || profile.fullname || '',
            phone: profile.phone || '',
            shippingAddresses: addresses,
          });
        }

        try {
          const dbOrders = await fetchOrdersForUser(
            currentUser.uid,
            currentUser.email
          );
          if (!cancelled) setOrders(dbOrders || []);
        } catch (orderErr) {
          console.error('Orders fetch error:', orderErr);
          if (!cancelled) setOrders([]);
        }
      } catch (err) {
        console.error('Account load error:', err);
        if (!cancelled) {
          setError('Failed to load account details');
          toast.error(
            getAuthErrorMessage(err, 'Failed to load account details')
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, userLoggedIn, currentUser?.uid, currentUser?.email, navigate]);

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    if (!currentUser?.uid) {
      setError('User not logged in');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: userDetails.name,
          phone: userDetails.phone,
          shipping_addresses: userDetails.shippingAddresses,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.uid);

      if (updateError) {
        setError(updateError.message || 'Failed to update account details');
        toast.error(
          getAuthErrorMessage(updateError, 'Failed to update account details')
        );
        return;
      }
      setIsEditing(false);
      setEditSnapshot(null);
      toast.success('Account details saved.');
      if (typeof refreshProfile === 'function') {
        try {
          await refreshProfile();
        } catch (refreshErr) {
          console.warn('Profile context refresh skipped:', refreshErr);
        }
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update account details');
      toast.error(getAuthErrorMessage(err, 'Failed to update account details'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = () => {
    setUserDetails((prev) => ({
      ...prev,
      shippingAddresses: [
        ...prev.shippingAddresses,
        {
          id: Date.now(),
          address: '',
          apartment: '',
          city: 'Alexandria',
          country: 'Egypt',
          phone: '',
          isDefault: prev.shippingAddresses.length === 0,
        },
      ],
    }));
  };

  const handleRemoveAddress = (id) => {
    setUserDetails((prev) => {
      const next = prev.shippingAddresses.filter((addr) => addr.id !== id);
      if (next.length && !next.some((a) => a.isDefault)) {
        next[0] = { ...next[0], isDefault: true };
      }
      return { ...prev, shippingAddresses: next };
    });
  };

  const handleSetDefaultAddress = (id) => {
    setUserDetails((prev) => ({
      ...prev,
      shippingAddresses: prev.shippingAddresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    }));
  };

  const updateAddressField = (id, field, value) => {
    setUserDetails((prev) => ({
      ...prev,
      shippingAddresses: prev.shippingAddresses.map((addr) =>
        addr.id === id ? { ...addr, [field]: value } : addr
      ),
    }));
  };

  if (authLoading) {
    return <PlantLoader variant="overlay" />;
  }

  if (!userLoggedIn) {
    return null;
  }

  if (loading) {
    return <PlantLoader variant="overlay" />;
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
            Account
          </p>
          <h1 className="page-banner-title">My Account</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className={`font-nav text-[11px] uppercase tracking-[0.14em] ${
                activeTab === 'personal' ? 'text-white' : 'text-white/70 hover:text-white'
              }`}
              onClick={() => setActiveTab('personal')}
            >
              Profile
            </button>
            <button
              type="button"
              className={`font-nav text-[11px] uppercase tracking-[0.14em] ${
                activeTab === 'orders' ? 'text-white' : 'text-white/70 hover:text-white'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
            <button
              type="button"
              className="border border-white/40 px-3 py-1.5 font-nav text-[11px] uppercase tracking-[0.14em] text-white hover:bg-white/10"
              onClick={() => navigate('/orderhistory')}
            >
              Order History
            </button>
          </div>
        </div>
      </section>

      <div className="section-pad leaf-wash py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          {error && (
            <div className="mb-6 border border-red-200 bg-red-50 p-4 font-nav text-sm text-red-700">
              {error}
            </div>
          )}

          {activeTab === 'personal' ? (
            <div className="overflow-hidden border border-nabat-border bg-white">
              <div className="p-6 md:p-10">
                <div className="mb-8 flex items-center justify-between gap-4">
                  <div>
                    <p className="section-label">Profile</p>
                    <h2 className="font-heading text-2xl font-medium md:text-3xl">
                      Personal information
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditing) {
                        if (editSnapshot) setUserDetails(editSnapshot);
                        setEditSnapshot(null);
                        setIsEditing(false);
                      } else {
                        setEditSnapshot(JSON.parse(JSON.stringify(userDetails)));
                        setIsEditing(true);
                      }
                    }}
                    className="btn-outline !px-5 !py-2.5"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <form onSubmit={handleUpdateDetails} className="space-y-8">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="section-label !mb-1">Email</label>
                      <input
                        type="email"
                        disabled
                        value={userDetails.email}
                        className="input-box bg-nabat-soft"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="section-label !mb-1">Name</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={userDetails.name}
                        onChange={(e) =>
                          setUserDetails((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="input-box disabled:bg-nabat-soft"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="section-label !mb-1">Phone</label>
                      <input
                        type="tel"
                        disabled={!isEditing}
                        value={userDetails.phone}
                        onChange={(e) =>
                          setUserDetails((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="input-box disabled:bg-nabat-soft"
                      />
                    </div>
                  </div>

                  <div className="border-t border-nabat-border pt-8">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="font-heading text-xl font-medium">
                        Shipping addresses
                      </h3>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleAddAddress}
                          className="font-nav text-sm text-nabat-accent hover:underline"
                        >
                          + Add New Address
                        </button>
                      )}
                    </div>

                    <div className="space-y-5">
                      {userDetails.shippingAddresses.length === 0 && (
                        <p className="font-nav text-sm text-nabat-muted">
                          No shipping addresses yet.
                        </p>
                      )}
                      {userDetails.shippingAddresses.map((address) => (
                        <div
                          key={address.id}
                          className="border border-nabat-border bg-nabat-soft p-5"
                        >
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <input
                              type="text"
                              disabled={!isEditing}
                              value={address.address}
                              onChange={(e) =>
                                updateAddressField(
                                  address.id,
                                  'address',
                                  e.target.value
                                )
                              }
                              className="input-box flex-1 disabled:bg-white"
                              placeholder="Street Address"
                            />
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              {address.isDefault ? (
                                <span className="font-nav text-xs text-nabat-accent">
                                  Default
                                </span>
                              ) : isEditing ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSetDefaultAddress(address.id)
                                  }
                                  className="font-nav text-sm text-nabat-accent hover:underline"
                                >
                                  Set default
                                </button>
                              ) : null}
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAddress(address.id)}
                                  className="font-nav text-sm text-red-600 hover:underline"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <input
                              type="text"
                              disabled={!isEditing}
                              value={address.apartment || ''}
                              onChange={(e) =>
                                updateAddressField(
                                  address.id,
                                  'apartment',
                                  e.target.value
                                )
                              }
                              className="input-box disabled:bg-white"
                              placeholder="Apartment"
                            />
                            <input
                              type="text"
                              disabled
                              value="Alexandria"
                              className="input-box bg-white"
                            />
                            <input
                              type="text"
                              disabled
                              value="Egypt"
                              className="input-box bg-white"
                            />
                            <input
                              type="tel"
                              disabled={!isEditing}
                              value={address.phone || ''}
                              onChange={(e) =>
                                updateAddressField(
                                  address.id,
                                  'phone',
                                  e.target.value
                                )
                              }
                              className="input-box disabled:bg-white"
                              placeholder="Phone"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {isEditing && (
                      <div className="mt-8 flex justify-end">
                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={saving}
                        >
                          {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden border border-nabat-border bg-white">
              <div className="p-6 md:p-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-heading text-2xl font-medium md:text-3xl">
                    Order History
                  </h2>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => navigate('/orderhistory')}
                  >
                    Open order history
                  </button>
                </div>
                <div className="mt-8 space-y-5">
                  {orders.length > 0 ? (
                    orders.map((order) => {
                      const items = order.order_items || [];
                      const total = Number(order.total) || 0;
                      return (
                        <div
                          key={order.id}
                          className="space-y-4 border border-nabat-border p-5"
                        >
                          <div className="flex items-start justify-between border-b border-nabat-border pb-4">
                            <div>
                              <p className="font-heading text-lg font-medium">
                                Order {order.order_number || order.id}
                              </p>
                              <p className="font-nav text-sm text-nabat-muted">
                                {order.created_at
                                  ? new Date(order.created_at).toLocaleDateString()
                                  : ''}
                                {order.status ? ` · ${order.status}` : ''}
                              </p>
                            </div>
                            <p className="font-heading text-xl font-medium text-nabat-accent">
                              {total.toFixed(2)} EGP
                            </p>
                          </div>
                          <div className="space-y-3">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between"
                              >
                                <div>
                                  <p className="font-nav text-sm font-medium">
                                    {item.product_name}
                                  </p>
                                  <p className="font-nav text-sm text-nabat-muted">
                                    Quantity: {item.quantity}
                                  </p>
                                </div>
                                <p className="font-nav text-sm">
                                  {Number(item.line_total).toFixed(2)} EGP
                                </p>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={() =>
                              navigate(`/thankyoupage?orderId=${order.id}`)
                            }
                          >
                            View receipt
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center font-body text-nabat-muted">
                      No orders found
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
