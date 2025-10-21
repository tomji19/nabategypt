import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classes from '../ThankYouPage/ThankYouPage.module.css';
import nabatlogo from '../../assets/images/nabat-profile.png';

const InvoiceDetails = ({ label, value }) => (
  <div className="flex gap-2">
    <span className="text-gray-600">{label}:</span>
    <span>{value}</span>
  </div>
);

const InvoiceItem = ({ description, price, qty, total }) => (
  <tr className="border-b border-gray-200">
    <td>{description}</td>
    <td className="text-right">$ {price.toFixed(2)}</td>
    <td className="text-center">{qty}</td>
    <td className="text-right">$ {total.toFixed(2)}</td>
  </tr>
);

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  const { formData = {}, cartItems = [] } = state || {};

  useEffect(() => {
    if (!state) {
      navigate('/checkout');
    }
  }, [state, navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 35.0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const orderId = `#${Math.floor(Math.random() * 1000000)}`;

  useEffect(() => {
    const orderDetails = {
      orderId,
      formData,
      cartItems,
      subtotal,
      shipping,
      tax,
      total,
      date: new Date().toLocaleDateString(),
    };

    const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    storedOrders.push(orderDetails);
    localStorage.setItem('orders', JSON.stringify(storedOrders));
  }, [orderId, formData, cartItems, subtotal, shipping, tax, total]);

  return (
    <section className={`${classes.pageBackground} py-[5rem]`}>
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-4">
              Thank you for your order{' '}
              <span className="text-[var(--main-color)]">
                {formData.firstName} {formData.lastName}
              </span>
            </h1>
            <div className="space-y-1 text-lg">
              <InvoiceDetails label="Order ID" value={orderId} />
              <InvoiceDetails label="Date" value={new Date().toLocaleDateString()} />
              <InvoiceDetails label="Name" value={`${formData.firstName || ''} ${formData.lastName || ''}`} />
              <InvoiceDetails label="Email" value={formData.email || ''} />
              <InvoiceDetails label="Phone" value={formData.phone || ''} />
              <InvoiceDetails label="Payment" value={formData.paymentMethod || ''} />
              <InvoiceDetails
                label="Address"
                value={`${formData.address || ''}, ${formData.apartment || ''}, ${formData.city || ''}, ${formData.country || ''}`}
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-y border-gray-200 text-left text-lg">
                <th className="py-3 font-semibold">ITEM DESCRIPTION</th>
                <th className="text-right font-semibold">PRICE</th>
                <th className="text-center font-semibold">QTY.</th>
                <th className="text-right font-semibold">TOTAL</th>
              </tr>
            </thead>
            <tbody className="text-lg">
              {cartItems.map((item, index) => (
                <InvoiceItem
                  key={index}
                  description={item.name}
                  price={item.price}
                  qty={item.quantity}
                  total={item.price * item.quantity}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <div className="flex justify-between gap-8 text-lg">
              <span>Subtotal:</span>
              <span>$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <p className="text-lg">Shipping</p>
              <p className="text-lg">${shipping.toFixed(2)}</p>
            </div>
            <div className="flex justify-between gap-8">
              <span>Tax:</span>
              <span>$ {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-8 font-bold pt-2 border-t">
              <span className="text-2xl text-[var(--main-color)]">Total:</span>
              <span className="text-2xl text-[var(--main-color)]">$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="text-center flex flex-col items-center">
          <p className="font-semibold text-2xl mb-3">THANK YOU FOR YOUR ORDER</p>
          <img
            src={nabatlogo}
            className="w-[15%]"
            alt="Nabat Logo Image in the footer of the receipt"
          />
        </div>
      </div>
    </section>
  );
};

export default ThankYouPage;
