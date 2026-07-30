import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import nabatlogo from '../../assets/images/nabat-profile.png';

const InvoiceDetails = ({ label, value }) => (
  <div className="flex gap-2 font-nav text-sm">
    <span className="text-nabat-muted">{label}:</span>
    <span className="text-nabat-text">{value}</span>
  </div>
);

const InvoiceItem = ({ description, price, qty, total }) => (
  <tr className="border-b border-nabat-border">
    <td className="py-3 font-nav text-sm">{description}</td>
    <td className="py-3 text-right font-nav text-sm">$ {price.toFixed(2)}</td>
    <td className="py-3 text-center font-nav text-sm">{qty}</td>
    <td className="py-3 text-right font-nav text-sm">$ {total.toFixed(2)}</td>
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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
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
    <section className="leaf-wash section-pad py-16 md:py-24">
      <div className="mx-auto max-w-2xl border border-nabat-border bg-white p-8 md:p-12">
        <p className="section-label">Confirmed</p>
        <h1 className="font-heading text-3xl font-medium tracking-tight text-nabat-text md:text-4xl">
          Thank you,{' '}
          <span className="text-nabat-accent">
            {formData.firstName} {formData.lastName}
          </span>
        </h1>

        <div className="mt-8 space-y-1.5">
          <InvoiceDetails label="Order ID" value={orderId} />
          <InvoiceDetails label="Date" value={new Date().toLocaleDateString()} />
          <InvoiceDetails
            label="Name"
            value={`${formData.firstName || ''} ${formData.lastName || ''}`}
          />
          <InvoiceDetails label="Email" value={formData.email || ''} />
          <InvoiceDetails label="Phone" value={formData.phone || ''} />
          <InvoiceDetails label="Payment" value={formData.paymentMethod || ''} />
          <InvoiceDetails
            label="Address"
            value={`${formData.address || ''}, ${formData.apartment || ''}, ${formData.city || ''}, ${formData.country || ''}`}
          />
        </div>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y border-nabat-border text-left font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted">
                <th className="py-3 font-medium">Item</th>
                <th className="py-3 text-right font-medium">Price</th>
                <th className="py-3 text-center font-medium">Qty</th>
                <th className="py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
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

        <div className="mt-8 space-y-2 font-nav text-sm">
          <div className="flex justify-between text-nabat-muted">
            <span>Subtotal</span>
            <span className="text-nabat-text">$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-nabat-muted">
            <span>Shipping</span>
            <span className="text-nabat-text">${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-nabat-muted">
            <span>Tax</span>
            <span className="text-nabat-text">$ {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-nabat-border pt-3 font-heading text-xl font-medium text-nabat-primary">
            <span>Total</span>
            <span>$ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center text-center">
          <p className="font-nav text-xs uppercase tracking-[0.2em] text-nabat-muted">
            Thank you for your order
          </p>
          <img src={nabatlogo} alt="Nabat" className="mt-4 h-14 w-auto object-contain" />
        </div>
      </div>
    </section>
  );
};

export default ThankYouPage;
