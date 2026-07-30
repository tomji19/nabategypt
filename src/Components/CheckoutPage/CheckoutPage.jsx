import React, { useEffect } from 'react';
import { useCart } from '../CartContext/CartContext';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer } from 'react-toastify';
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

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email Address is required'),
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    address: Yup.string().required('Address is required'),
    apartment: Yup.string().required('Apartment is required'),
    phone: Yup.string()
      .matches(
        /^(01[0125][0-9]{8}|0[2-9]{1}[0-9]{7,8}|0[2-9]{1}[0-9]{1,4}[0-9]{7})$/,
        'Invalid phone number'
      )
      .required('Phone Number is required'),
    paymentMethod: Yup.string().required('Payment method is required'),
  });

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

      const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
      const updatedOrders = [...existingOrders, newOrder];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      clearCart();
      navigate('/thankyoupage', { state: { formData: values, cartItems } });
    },
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 35.0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const fieldClass = (name) =>
    `input-box ${
      formik.touched[name] && formik.errors[name] ? '!border-red-500' : ''
    }`;

  return (
    <div className="leaf-wash section-pad py-12 md:py-16">
      <ToastContainer />
      <div className="mx-auto max-w-6xl">
        <p className="section-label">Checkout</p>
        <h1 className="section-title mb-10">Complete your order</h1>

        <form onSubmit={formik.handleSubmit}>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="space-y-8 bg-white p-6 md:p-8">
              <div>
                <h2 className="font-heading text-xl font-medium">Contact</h2>
                <input
                  type="email"
                  placeholder="Email address"
                  {...formik.getFieldProps('email')}
                  className={`mt-4 ${fieldClass('email')}`}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 font-nav text-sm text-red-500">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div>
                <h2 className="font-heading text-xl font-medium">Shipping</h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="First name"
                      {...formik.getFieldProps('firstName')}
                      className={fieldClass('firstName')}
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                      <p className="mt-1 font-nav text-sm text-red-500">
                        {formik.errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last name"
                      {...formik.getFieldProps('lastName')}
                      className={fieldClass('lastName')}
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                      <p className="mt-1 font-nav text-sm text-red-500">
                        {formik.errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Address"
                  {...formik.getFieldProps('address')}
                  className={`mt-3 ${fieldClass('address')}`}
                />
                {formik.touched.address && formik.errors.address && (
                  <p className="mt-1 font-nav text-sm text-red-500">
                    {formik.errors.address}
                  </p>
                )}
                <input
                  type="text"
                  placeholder="Apartment, suite, etc."
                  {...formik.getFieldProps('apartment')}
                  className={`mt-3 ${fieldClass('apartment')}`}
                />
                {formik.touched.apartment && formik.errors.apartment && (
                  <p className="mt-1 font-nav text-sm text-red-500">
                    {formik.errors.apartment}
                  </p>
                )}
                <input
                  type="text"
                  value={formik.values.city}
                  disabled
                  className="input-box mt-3 bg-nabat-soft"
                />
                <select
                  className="input-box mt-3 bg-nabat-soft"
                  value={formik.values.country}
                  disabled
                >
                  <option>Egypt</option>
                </select>
                <input
                  type="tel"
                  placeholder="Phone"
                  {...formik.getFieldProps('phone')}
                  className={`mt-3 ${fieldClass('phone')}`}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="mt-1 font-nav text-sm text-red-500">
                    {formik.errors.phone}
                  </p>
                )}
              </div>

              <div>
                <h2 className="font-heading text-xl font-medium">Payment</h2>
                <div className="mt-4 space-y-3">
                  {['Vodafone Cash', 'Cash On Delivery'].map((method) => (
                    <label
                      key={method}
                      className="flex cursor-pointer items-center gap-3 border border-nabat-border p-4 font-nav text-sm transition-colors has-[:checked]:border-nabat-accent has-[:checked]:bg-nabat-mist"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={formik.values.paymentMethod === method}
                        onChange={formik.handleChange}
                        className="accent-nabat-accent"
                      />
                      {method}
                    </label>
                  ))}
                </div>
                {formik.touched.paymentMethod && !formik.values.paymentMethod && (
                  <p className="mt-2 font-nav text-sm text-red-500">
                    Payment method is required
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="border border-nabat-border bg-white p-6 md:p-8 lg:sticky lg:top-28">
                <h2 className="font-heading text-xl font-medium">Summary</h2>
                <div className="mt-6 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 object-cover bg-nabat-mist"
                        />
                        <div>
                          <p className="font-nav text-sm font-medium">{item.name}</p>
                          <p className="font-nav text-xs text-nabat-muted">
                            {item.size || ''}
                          </p>
                        </div>
                      </div>
                      <p className="font-nav text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-2 border-t border-nabat-border pt-4 font-nav text-sm">
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
                  <div className="flex justify-between pt-2 font-heading text-xl font-medium text-nabat-primary">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <button type="submit" className="btn-primary mt-8 w-full">
                  Confirm order
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
