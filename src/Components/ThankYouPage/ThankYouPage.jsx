import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import BrandLogo from '../BrandLogo/BrandLogo';
import { STORE, PAYMENT_METHODS } from '../../config/store';
import { formatEGP } from '../../utils/money';

const InvoiceDetails = ({ label, value }) => (
  <div className="flex gap-2 font-nav text-sm">
    <span className="text-nabat-muted">{label}:</span>
    <span className="text-nabat-text">{value}</span>
  </div>
);

const InvoiceItem = ({ description, price, qty, total }) => (
  <tr className="border-b border-nabat-border">
    <td className="py-3 font-nav text-sm">{description}</td>
    <td className="py-3 text-right font-nav text-sm">{formatEGP(price)}</td>
    <td className="py-3 text-center font-nav text-sm">{qty}</td>
    <td className="py-3 text-right font-nav text-sm">{formatEGP(total)}</td>
  </tr>
);

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const {
    formData = {},
    cartItems = [],
    order = null,
    subtotal = 0,
    shipping = STORE.shippingFee,
    total = 0,
  } = state || {};

  useEffect(() => {
    if (!state) {
      navigate('/checkout');
    }
  }, [state, navigate]);

  if (!state) return null;

  const orderNumber = order?.order_number || order?.id || '—';
  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === formData.paymentMethod)?.label ||
    formData.paymentMethod;
  const paymentInfo = PAYMENT_METHODS.find(
    (m) => m.id === formData.paymentMethod
  );

  return (
    <section className="leaf-wash section-pad py-16 md:py-24">
      <div className="mx-auto max-w-2xl border border-nabat-border bg-white p-8 md:p-12">
        <p className="section-label">Confirmed · تم التأكيد</p>
        <h1 className="font-heading text-3xl font-medium tracking-tight text-nabat-text md:text-4xl">
          Thank you,{' '}
          <span className="text-nabat-accent">
            {formData.firstName} {formData.lastName}
          </span>
        </h1>
        <p className="mt-3 font-nav text-sm text-nabat-muted">
          We received your order. You will hear from us soon.
        </p>

        <div className="mt-8 space-y-1.5">
          <InvoiceDetails label="Order" value={orderNumber} />
          <InvoiceDetails label="Date" value={new Date().toLocaleDateString()} />
          <InvoiceDetails
            label="Name"
            value={`${formData.firstName || ''} ${formData.lastName || ''}`}
          />
          <InvoiceDetails label="Email" value={formData.email || ''} />
          <InvoiceDetails label="Phone" value={formData.phone || ''} />
          <InvoiceDetails label="Payment" value={paymentLabel || ''} />
          <InvoiceDetails
            label="Address"
            value={`${formData.address || ''}, ${formData.apartment || ''}, ${formData.city || ''}, ${formData.country || ''}`}
          />
        </div>

        {paymentInfo?.instructions && (
          <div className="mt-6 border border-nabat-border bg-nabat-mist p-4 font-nav text-sm">
            <p className="font-medium text-nabat-primary">Next step</p>
            <p className="mt-2 text-nabat-muted">{paymentInfo.instructions}</p>
            <p className="mt-2 font-medium">
              {STORE.paymentNumber} · Total {formatEGP(total)}
            </p>
          </div>
        )}

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
            <span className="text-nabat-text">{formatEGP(subtotal)}</span>
          </div>
          <div className="flex justify-between text-nabat-muted">
            <span>Shipping ({STORE.city})</span>
            <span className="text-nabat-text">{formatEGP(shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-nabat-border pt-3 font-heading text-xl font-medium text-nabat-primary">
            <span>Total</span>
            <span>{formatEGP(total)}</span>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/shop" className="btn-primary">
            Continue shopping
          </Link>
          <Link to="/orderhistory" className="btn-outline">
            View orders
          </Link>
        </div>

        <div className="mt-12 flex flex-col items-center text-center">
          <p className="font-nav text-xs uppercase tracking-[0.2em] text-nabat-muted">
            Thank you for your order
          </p>
          <BrandLogo
            variant="seal"
            className="mt-4"
            imgClassName="h-14 w-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default ThankYouPage;
