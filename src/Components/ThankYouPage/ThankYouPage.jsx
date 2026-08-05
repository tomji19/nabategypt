import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { toast } from 'react-toastify';
import BrandLogo from '../BrandLogo/BrandLogo';
import PlantLoader from '../PlantLoader/PlantLoader';
import { STORE, PAYMENT_METHODS } from '../../config/store';
import { formatEGP } from '../../utils/money';
import {
  fetchOrderById,
  orderToReceiptState,
} from '../../supabase/orders';
import { formatSizeLabel } from '../../utils/productSizes';

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
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const receiptRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const [receipt, setReceipt] = useState(() => {
    if (!location.state) return null;
    return {
      formData: location.state.formData || {},
      cartItems: location.state.cartItems || [],
      order: location.state.order || null,
      subtotal: location.state.subtotal ?? 0,
      shipping: location.state.shipping ?? STORE.shippingFee,
      total: location.state.total ?? 0,
    };
  });
  const [loading, setLoading] = useState(
    () => !location.state && Boolean(orderIdParam)
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (location.state?.formData || location.state?.order) {
      setReceipt({
        formData: location.state.formData || {},
        cartItems: location.state.cartItems || [],
        order: location.state.order || null,
        subtotal: location.state.subtotal ?? 0,
        shipping: location.state.shipping ?? STORE.shippingFee,
        total: location.state.total ?? 0,
      });
      setLoading(false);
      setError(null);
      return undefined;
    }

    if (!orderIdParam) {
      navigate('/orderhistory', { replace: true });
      return undefined;
    }

    setLoading(true);

    (async () => {
      try {
        const order = await fetchOrderById(orderIdParam);
        if (cancelled) return;
        setReceipt(orderToReceiptState(order));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || 'Could not load receipt');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderIdParam, location.key, navigate]);

  const handleBack = () => {
    // Avoid history.back() — it often returns to an empty checkout / mid-auth
    // route and leaves the transition loader stuck.
    navigate('/orderhistory');
  };

  const handleDownloadImage = async () => {
    if (!receiptRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      const safeName = String(
        receipt?.order?.order_number || receipt?.order?.id || 'receipt'
      ).replace(/[^\w.-]+/g, '-');
      link.download = `nabat-${safeName}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Receipt image downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Could not download receipt image');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <PlantLoader variant="overlay" />;
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center font-nav">
        <p className="text-red-600">{error}</p>
        <button type="button" className="btn-outline" onClick={handleBack}>
          ← Back
        </button>
        <Link to="/orderhistory" className="btn-primary">
          Back to orders
        </Link>
      </div>
    );
  }

  if (!receipt) return null;

  const {
    formData = {},
    cartItems = [],
    order = null,
    subtotal = 0,
    shipping = STORE.shippingFee,
    total = 0,
  } = receipt;

  const orderNumber = order?.order_number || order?.id || '—';
  const orderDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString()
    : new Date().toLocaleDateString();
  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === formData.paymentMethod)?.label ||
    formData.paymentMethod;
  const paymentInfo = PAYMENT_METHODS.find(
    (m) => m.id === formData.paymentMethod
  );

  return (
    <section className="leaf-wash section-pad py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="font-nav text-sm text-nabat-muted transition-colors hover:text-nabat-primary"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={downloading}
            className="btn-outline disabled:opacity-60"
          >
            {downloading ? 'Preparing…' : 'Download image'}
          </button>
        </div>

        <div
          ref={receiptRef}
          className="border border-nabat-border bg-white p-8 md:p-12"
        >
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
            <InvoiceDetails label="Date" value={orderDate} />
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
                    key={item.id || index}
                    description={
                      item.size
                        ? `${item.name} (${formatSizeLabel(item.size, item.sizeType)})`
                        : item.name
                    }
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

        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="btn-outline" onClick={handleBack}>
            ← Back
          </button>
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={downloading}
            className="btn-outline disabled:opacity-60"
          >
            {downloading ? 'Preparing…' : 'Download image'}
          </button>
          <Link to="/shop" className="btn-primary">
            Continue shopping
          </Link>
          <Link to="/orderhistory" className="btn-outline">
            View orders
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ThankYouPage;
