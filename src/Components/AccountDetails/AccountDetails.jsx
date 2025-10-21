import React, { useState, useEffect } from 'react';
import classes from '../AccountDetails/AccountDetails.module.css';
import { useAuth } from '../AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

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
  const { currentUser, userLoggedIn, userDetails: authUserDetails } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLoggedIn) {
      navigate('/signin');
      return;
    }

    // Load user details from Firebase auth context
    if (authUserDetails) {
      setUserDetails(prev => ({
        ...prev,
        email: currentUser?.email || '',
        name: authUserDetails.name || '',
        phone: authUserDetails.phone || '',
        shippingAddresses: JSON.parse(localStorage.getItem('userAddresses')) || []
      }));

      // Load orders from localStorage
      const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
      setOrders(storedOrders);
      setLoading(false);
    }
  }, [userLoggedIn, navigate, authUserDetails, currentUser]);

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(db, 'Users', currentUser.uid);
      await updateDoc(userRef, {
        name: userDetails.name,
        phone: userDetails.phone,
        updatedAt: new Date()
      });

      localStorage.setItem('userAddresses', JSON.stringify(userDetails.shippingAddresses));
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update account details');
    }
  };

  const handleAddAddress = () => {
    setUserDetails(prev => ({
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
          isDefault: prev.shippingAddresses.length === 0
        }
      ]
    }));
  };

  const handleRemoveAddress = (id) => {
    setUserDetails(prev => ({
      ...prev,
      shippingAddresses: prev.shippingAddresses.filter(addr => addr.id !== id)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <section className={`${classes.pageBanner} px-32`}>
        <div className="h-[20rem] flex flex-col items-center justify-center">
          <h3 className="text-7xl font-bold text-white z-10">My Account</h3>
          <ul className="flex gap-5 mt-4 z-10">
            {['Order History'].map((categoryItem) => (
              <li 
                key={categoryItem}
                className="text-xl text-white cursor-pointer hover:underline"
                onClick={() => navigate('/orderhistory')}
              >
                {categoryItem}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="max-w-4xl mx-auto py-12 px-4">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {activeTab === 'personal' ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-semibold text-gray-900">Personal Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-[var(--main-color)] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <form onSubmit={handleUpdateDetails} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      disabled={true}
                      value={userDetails.email}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-[var(--main-color)] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={userDetails.name}
                      onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--main-color)] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={userDetails.phone}
                      onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--main-color)] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium text-gray-900">Shipping Addresses</h3>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleAddAddress}
                        className="text-[var(--main-color)] hover:opacity-90 font-medium"
                      >
                        + Add New Address
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {userDetails.shippingAddresses.map((address) => (
                      <div key={address.id} className="p-6 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-4">
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={address.address}
                            onChange={(e) => {
                              const updatedAddresses = userDetails.shippingAddresses.map(addr =>
                                addr.id === address.id ? { ...addr, address: e.target.value } : addr
                              );
                              setUserDetails(prev => ({ ...prev, shippingAddresses: updatedAddresses }));
                            }}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--main-color)]"
                            placeholder="Street Address"
                          />
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAddress(address.id)}
                              className="ml-4 text-red-600 hover:opacity-90"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={address.apartment}
                            onChange={(e) => {
                              const updatedAddresses = userDetails.shippingAddresses.map(addr =>
                                addr.id === address.id ? { ...addr, apartment: e.target.value } : addr
                              );
                              setUserDetails(prev => ({ ...prev, shippingAddresses: updatedAddresses }));
                            }}
                            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--main-color)]"
                            placeholder="Apartment"
                          />
                          <input
                            type="text"
                            disabled={true}
                            value="Alexandria"
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                          />
                          <input
                            type="text"
                            disabled={true}
                            value="Egypt"
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                          />
                          <input
                            type="tel"
                            disabled={!isEditing}
                            value={address.phone}
                            onChange={(e) => {
                              const updatedAddresses = userDetails.shippingAddresses.map(addr =>
                                addr.id === address.id ? { ...addr, phone: e.target.value } : addr
                              );
                              setUserDetails(prev => ({ ...prev, shippingAddresses: updatedAddresses }));
                            }}
                            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--main-color)]"
                            placeholder="Phone"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {isEditing && (
                    <div className="flex justify-end mt-8">
                      <button
                        type="submit"
                        className="bg-[var(--main-color)] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-8">Order History</h2>
              <div className="space-y-6">
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <div key={index} className="border rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-start pb-4 border-b">
                        <div>
                          <p className="text-lg font-medium">Order {order.orderId}</p>
                          <p className="text-gray-600">{order.date}</p>
                        </div>
                        <p className="text-xl font-semibold text-[var(--main-color)]">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="space-y-4">
                        {order.cartItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping</span>
                          <span>${order.shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax</span>
                          <span>${order.tax.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No orders found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}