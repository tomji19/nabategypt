import React, { useEffect } from 'react';
import { useCart } from '../CartContext/CartContext';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../AuthContext/AuthContext';


const CheckoutForm = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const { userLoggedIn, loading } = useAuth();

    useEffect(() => {
      if (!loading && !userLoggedIn) {
        navigate('/login');
      }
    }, [userLoggedIn, loading, navigate]);

  // Validation schema using Yup
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email Address is required'),
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    address: Yup.string().required('Address is required'),
    apartment: Yup.string().required('Apartment is required'), // Make apartment required
    phone: Yup.string()
      .matches(
        /^(01[0125][0-9]{8}|0[2-9]{1}[0-9]{7,8}|0[2-9]{1}[0-9]{1,4}[0-9]{7})$/,
        'Invalid phone number'
      )
      .required('Phone Number is required'),
    paymentMethod: Yup.string().required('Payment method is required'),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: 'Alexandria',
      country: 'Egypt',
      phone: '',
      paymentMethod: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      
      // Prepare the new order data
      const newOrder = {
        items: cartItems,
        totalAmount: total,
        createdAt: new Date().toISOString(),
        shippingAddress: {
          street: values.address,
          apartment: values.apartment,
          city: values.city,
          country: values.country,
          phone: values.phone,
        },
        status: 'Processing',
      };

      // Load existing orders from localStorage and add the new order
      const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
      const updatedOrders = [...existingOrders, newOrder];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      // Clear the cart and navigate to the Thank You page
      clearCart();
      navigate('/thankyoupage', { state: { formData: values, cartItems } });
    },
  });

  // Calculate subtotal, tax, shipping, and total based on cartItems
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 35.0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <ToastContainer />
      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Contact information</h2>
            <input
              type="email"
              placeholder="Email address"
              {...formik.getFieldProps('email')}
              className={`w-full p-2 mb-4 border ${formik.touched.email && formik.errors.email ? 'border-red-500' : ''}`}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 mb-4">{formik.errors.email}</div>
            ) : null}

            <h2 className="text-2xl font-semibold mb-4">
              Shipping information
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="First name"
                {...formik.getFieldProps('firstName')}
                className={`p-2 border ${formik.touched.firstName && formik.errors.firstName ? 'border-red-500' : ''}`}
              />
              {formik.touched.firstName && formik.errors.firstName ? (
                <div className="text-red-500 mb-4">
                  {formik.errors.firstName}
                </div>
              ) : null}

              <input
                type="text"
                placeholder="Last name"
                {...formik.getFieldProps('lastName')}
                className={`p-2 border ${formik.touched.lastName && formik.errors.lastName ? 'border-red-500' : ''}`}
              />
              {formik.touched.lastName && formik.errors.lastName ? (
                <div className="text-red-500 mb-4">
                  {formik.errors.lastName}
                </div>
              ) : null}
            </div>

            <input
              type="text"
              placeholder="Address"
              {...formik.getFieldProps('address')}
              className={`w-full p-2 mb-4 border ${formik.touched.address && formik.errors.address ? 'border-red-500' : ''}`}
            />
            {formik.touched.address && formik.errors.address ? (
              <div className="text-red-500 mb-4">{formik.errors.address}</div>
            ) : null}

            <input
              type="text"
              placeholder="Apartment, suite, etc."
              {...formik.getFieldProps('apartment')}
              className={`w-full p-2 mb-4 border ${formik.touched.apartment && formik.errors.apartment ? 'border-red-500' : ''}`}
            />
            {formik.touched.apartment && formik.errors.apartment ? (
              <div className="text-red-500 mb-4">{formik.errors.apartment}</div>
            ) : null}

            <input
              type="text"
              value={formik.values.city}
              className="w-full p-2 mb-4 border"
              disabled
            />
            <select
              className="w-full p-2 mb-4 border rounded"
              value={formik.values.country}
              disabled
            >
              <option>Egypt</option>
            </select>

            <input
              type="tel"
              placeholder="Phone"
              {...formik.getFieldProps('phone')}
              className={`w-full p-2 mb-4 border ${formik.touched.phone && formik.errors.phone ? 'border-red-500' : ''}`}
            />
            {formik.touched.phone && formik.errors.phone ? (
              <div className="text-red-500 mcheb-4">{formik.errors.phone}</div>
            ) : null}

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Payment method</h2>
              <div className="space-y-3">
                <div className="p-4 border">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Vodafone Cash"
                      checked={formik.values.paymentMethod === 'Vodafone Cash'}
                      onChange={formik.handleChange}
                      className="form-radio"
                    />
                    <span>Vodafone Cash</span>
                  </label>
                </div>
                <div className="p-4 border">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash On Delivery"
                      checked={
                        formik.values.paymentMethod === 'Cash On Delivery'
                      }
                      onChange={formik.handleChange}
                      className="form-radio"
                    />
                    <span>Cash On Delivery</span>
                  </label>
                </div>
              </div>
              {formik.touched.paymentMethod && !formik.values.paymentMethod ? (
                <div className="text-red-500 mb-4">
                  Payment method is required
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-gray-50 p-6">
              <h2 className="text-2xl font-semibold mb-4">Order summary</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-gray-600">
                          {item.size ? `${item.size}` : ''}
                        </p>
                      </div>
                    </div>
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <p className="text-lg">Subtotal</p>
                    <p className="text-lg">${subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between mb-2">
                    <p className="text-lg">Shipping</p>
                    <p className="text-lg">${shipping.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between mb-2">
                    <p className="text-lg">Taxes</p>
                    <p className="text-lg">${tax.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between font-medium text-lg">
                    <p className="text-3xl text-[var(--main-color)] font-semibold">
                      Total
                    </p>
                    <p className="text-3xl text-[var(--main-color)] font-semibold">
                      ${total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-6 bg-[var(--main-color)] text-white py-3 px-4 hover:bg-[var(--main-color)]"
              >
                Confirm order
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
