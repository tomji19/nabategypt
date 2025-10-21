import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import classes from '../OrderHistoryPage/OrderHistoryPage.module.css';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userLoggedIn, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in, if not redirect to sign-in
    if (!userLoggedIn) {
      navigate('/signin');
      return;
    }

    const loadOrders = () => {
      try {
        const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
        const uniqueOrders = Array.from(new Set(storedOrders.map(order => order.orderId)))
          .map(id => storedOrders.find(order => order.orderId === id));
        setOrders(uniqueOrders.filter(order => order.cartItems && order.cartItems.length > 0));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadOrders();
  }, [userLoggedIn, navigate, token]);

  const removeOrder = (orderId) => {
    const updatedOrders = orders.filter(order => order.orderId !== orderId);
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  // Rest of the component remains the same as in the original code
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <section className={`${classes.pageBanner} px-32`}>
        <div className="h-[20rem] flex flex-col items-center justify-center">
          <h3 className="text-7xl font-bold text-white z-10">Order History</h3>
          <ul className="flex gap-5 mt-4 z-10">
            {['< Back to My Account'].map((categoryItem) => (
              <li 
                key={categoryItem}
                className="text-xl text-white cursor-pointer hover:underline"
                onClick={() => navigate('/accountdetails')}
              >
                {categoryItem}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-center">No orders found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900">
                          Order {order.orderId}
                        </h2>
                        <p className="text-sm text-gray-500">
                          Placed on {order.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">
                          ${order.total ? order.total.toFixed(2) : ''}
                        </p>
                        <p className={`text-sm ${order.status === 'Delivered' ? 'text-green-600' : 'text-blue-600'}`}>
                          {order.status || 'Pending'}
                        </p>
                        <button
                          className="bg-red-500 text-white py-1 px-2 rounded"
                          onClick={() => removeOrder(order.orderId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    {/* Rest of the order details rendering remains the same */}
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Order Items</h3>
                      {order.cartItems && order.cartItems.length > 0 ? (
                        <div className="space-y-4">
                          {order.cartItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="h-16 w-16 object-cover rounded"
                                />
                                <div className="ml-4">
                                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No items in this order.</p>
                      )}
                    </div>

                    {order.formData && (
                      <div className="border-t border-gray-200 mt-4 pt-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h3>
                        <p className="text-sm text-gray-500">
                          {order.formData.address}, {order.formData.apartment}, {order.formData.city}, {order.formData.country}
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