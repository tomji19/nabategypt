// ============================================
// ACCOUNT DETAILS COMPONENT
// ============================================
// This component displays and allows editing of user account information
// It uses Supabase for database operations

import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/supabase';
import pageBanner from '../../assets/images/pagebanner.png';
import PlantLoader from '../PlantLoader/PlantLoader';

export default function AccountDetails() {
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'orders'
  const [userDetails, setUserDetails] = useState({
    email: '',
    name: '',
    firstName: '',
    lastName: '',
    phone: '',
    shippingAddresses: [],
    preferences: {
      emailNotifications: true,
      orderUpdates: true,
      promotions: false
    }
  });
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, userLoggedIn, userDetails: authUserDetails, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // STEP 1: Load user data when component mounts or auth state changes
  // useEffect runs after component renders. The dependency array means it runs when:
  // - Component first mounts
  // - userLoggedIn changes
  // - authUserDetails changes
  // - currentUser changes
  useEffect(() => {
    // STEP 1a: Wait for auth to finish loading
    // Don't try to load user data until we know if user is logged in
    if (authLoading) {
      return; // Exit early - wait for auth to finish
    }

    // STEP 1b: Redirect if not logged in
    if (!userLoggedIn) {
      navigate('/login'); // Redirect to login page
      return;
    }

    // STEP 1c: Load user details from database (database-first strategy)
    // We fetch from Supabase database first, then use localStorage as cache
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // STEP 1c-1: Fetch profile from Supabase database
        // This is the "source of truth" - database is always authoritative
        if (currentUser?.uid) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.uid)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            // If database fetch fails, try localStorage as fallback
            const cachedDetails = localStorage.getItem('userDetails');
            if (cachedDetails) {
              const parsed = JSON.parse(cachedDetails);
              setUserDetails(prev => ({
                ...prev,
                email: currentUser?.email || '',
                name: parsed.name || authUserDetails?.name || '',
                phone: parsed.phone || authUserDetails?.phone || '',
                shippingAddresses: parsed.shippingAddresses || []
              }));
            } else {
              // No cache either - use auth context data
              setUserDetails(prev => ({
                ...prev,
                email: currentUser?.email || '',
                name: authUserDetails?.name || '',
                phone: authUserDetails?.phone || '',
                shippingAddresses: []
              }));
            }
          } else if (profile) {
            // STEP 1c-2: Database fetch successful - use database data
            // Parse shipping addresses (stored as JSONB in database)
            const addresses = profile.shipping_addresses || [];
            
            setUserDetails(prev => ({
              ...prev,
              email: profile.email || currentUser?.email || '',
              name: profile.name || profile.fullname || '',
              phone: profile.phone || '',
              shippingAddresses: Array.isArray(addresses) ? addresses : []
            }));

            // STEP 1c-3: Cache to localStorage for faster future loads
            // This is the "cache" part of database-first strategy
            localStorage.setItem('userDetails', JSON.stringify({
              name: profile.name || profile.fullname || '',
              phone: profile.phone || '',
              shippingAddresses: addresses
            }));
          }
        } else {
          // No currentUser - use auth context data
          setUserDetails(prev => ({
            ...prev,
            email: currentUser?.email || '',
            name: authUserDetails?.name || '',
            phone: authUserDetails?.phone || '',
            shippingAddresses: JSON.parse(localStorage.getItem('userAddresses')) || []
          }));
        }

        // STEP 1d: Load orders from localStorage (temporary - will move to database later)
        const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
        setOrders(storedOrders);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load account details');
        // Set fallback data so page doesn't break
        setUserDetails(prev => ({
          ...prev,
          email: currentUser?.email || '',
          name: authUserDetails?.name || '',
          phone: authUserDetails?.phone || '',
          shippingAddresses: []
        }));
      } finally {
        // STEP 1e: Always set loading to false
        // This ensures the page renders even if there's an error
        setLoading(false);
      }
    };

    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoggedIn, authLoading]); // Only depend on userLoggedIn and authLoading to prevent loops

  // STEP 2: Handle updating user details
  // This function is called when the user submits the edit form
  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      setError(null);

      // STEP 2a: Validate user is logged in
      if (!currentUser?.uid) {
        setError('User not logged in');
        return;
      }

      // STEP 2b: Update profile in Supabase database (database-first)
      // This is the "source of truth" - we save to database first
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: userDetails.name,
          phone: userDetails.phone,
          shipping_addresses: userDetails.shippingAddresses, // Store as JSONB
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.uid);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        setError('Failed to update account details');
        return;
      }

      // STEP 2c: Update localStorage cache after successful database update
      // This keeps cache in sync with database
      localStorage.setItem('userDetails', JSON.stringify({
        name: userDetails.name,
        phone: userDetails.phone,
        shippingAddresses: userDetails.shippingAddresses
      }));
      localStorage.setItem('userAddresses', JSON.stringify(userDetails.shippingAddresses));

      // STEP 2d: Exit edit mode and show success
      setIsEditing(false);
      // Optionally show a success toast here
    } catch (err) {
      console.error('Error updating details:', err);
      setError('Failed to update account details');
    }
  };

  // STEP 3: Handle adding a new shipping address
  const handleAddAddress = () => {
    setUserDetails(prev => ({
      ...prev,
      shippingAddresses: [
        ...prev.shippingAddresses,
        {
          id: Date.now(), // Generate unique ID
          address: '',
          apartment: '',
          city: 'Alexandria',
          country: 'Egypt',
          phone: '',
          isDefault: prev.shippingAddresses.length === 0 // First address is default
        }
      ]
    }));
  };

  // STEP 4: Handle removing a shipping address
  const handleRemoveAddress = (id) => {
    setUserDetails(prev => ({
      ...prev,
      shippingAddresses: prev.shippingAddresses.filter(addr => addr.id !== id)
    }));
  };

  if (loading || authLoading) {
    return <PlantLoader variant="overlay" />;
  }

  // STEP 6: Render the Account Details Page
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
          <button
            type="button"
            className="mt-4 font-nav text-[11px] uppercase tracking-[0.14em] text-white/80 hover:text-white"
            onClick={() => navigate('/orderhistory')}
          >
            Order History →
          </button>
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
                  onClick={() => setIsEditing(!isEditing)}
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
                      disabled={true}
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
                            onChange={(e) => {
                              const updatedAddresses =
                                userDetails.shippingAddresses.map((addr) =>
                                  addr.id === address.id
                                    ? { ...addr, address: e.target.value }
                                    : addr
                                );
                              setUserDetails((prev) => ({
                                ...prev,
                                shippingAddresses: updatedAddresses,
                              }));
                            }}
                            className="input-box flex-1 disabled:bg-white"
                            placeholder="Street Address"
                          />
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAddress(address.id)}
                              className="shrink-0 font-nav text-sm text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={address.apartment}
                            onChange={(e) => {
                              const updatedAddresses =
                                userDetails.shippingAddresses.map((addr) =>
                                  addr.id === address.id
                                    ? { ...addr, apartment: e.target.value }
                                    : addr
                                );
                              setUserDetails((prev) => ({
                                ...prev,
                                shippingAddresses: updatedAddresses,
                              }));
                            }}
                            className="input-box disabled:bg-white"
                            placeholder="Apartment"
                          />
                          <input
                            type="text"
                            disabled={true}
                            value="Alexandria"
                            className="input-box bg-white"
                          />
                          <input
                            type="text"
                            disabled={true}
                            value="Egypt"
                            className="input-box bg-white"
                          />
                          <input
                            type="tel"
                            disabled={!isEditing}
                            value={address.phone}
                            onChange={(e) => {
                              const updatedAddresses =
                                userDetails.shippingAddresses.map((addr) =>
                                  addr.id === address.id
                                    ? { ...addr, phone: e.target.value }
                                    : addr
                                );
                              setUserDetails((prev) => ({
                                ...prev,
                                shippingAddresses: updatedAddresses,
                              }));
                            }}
                            className="input-box disabled:bg-white"
                            placeholder="Phone"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {isEditing && (
                    <div className="mt-8 flex justify-end">
                      <button type="submit" className="btn-primary">
                        Save Changes
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
              <h2 className="font-heading text-2xl font-medium md:text-3xl">
                Order History
              </h2>
              <div className="mt-8 space-y-5">
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <div
                      key={index}
                      className="space-y-4 border border-nabat-border p-5"
                    >
                      <div className="flex items-start justify-between border-b border-nabat-border pb-4">
                        <div>
                          <p className="font-heading text-lg font-medium">
                            Order {order.orderId}
                          </p>
                          <p className="font-nav text-sm text-nabat-muted">
                            {order.date}
                          </p>
                        </div>
                        <p className="font-heading text-xl font-medium text-nabat-accent">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="space-y-3">
                        {order.cartItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="font-nav text-sm font-medium">
                                {item.name}
                              </p>
                              <p className="font-nav text-sm text-nabat-muted">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <p className="font-nav text-sm">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
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
