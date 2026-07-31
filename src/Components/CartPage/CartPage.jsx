import React from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCart } from '../CartContext/CartContext';
import { Link } from 'react-router-dom';
import pageBanner from '../../assets/images/pagebanner.png';
import { calcOrderTotals, formatEGP } from '../../utils/money';
import { useLanguage } from '../LanguageContext/LanguageContext';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { t } = useLanguage();

  const handleRemoveItem = (id) => {
    const itemToRemove = cartItems.find((item) => item.id === id);
    if (itemToRemove) {
      removeFromCart(id);
      toast.success(`${itemToRemove.name}`);
    }
  };

  const { subtotal, shipping, total } = calcOrderTotals(cartItems);

  return (
    <>
      <section className="page-banner">
        <img
          src={pageBanner}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-nabat-primary/60" />
        <h1 className="page-banner-title">{t('cartTitle')}</h1>
      </section>

      <div className="section-pad py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {cartItems.length === 0 ? (
              <div className="border border-nabat-border bg-white p-10 text-center">
                <p className="font-body text-nabat-muted">{t('cartEmpty')}</p>
                <Link to="/shop" className="btn-primary mt-6 inline-flex">
                  {t('continueShopping')}
                </Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border border-nabat-border bg-white p-4 md:gap-6 md:p-5"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 shrink-0 object-cover bg-nabat-mist md:h-32 md:w-32"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="font-heading text-lg font-medium text-nabat-text md:text-xl">
                          {item.name}
                        </h3>
                        <p className="mt-1 font-nav text-xs text-nabat-muted">
                          {item.category}
                        </p>
                        <p className="mt-2 font-nav text-sm">
                          {formatEGP(item.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-nabat-muted hover:text-nabat-text"
                        aria-label={t('remove')}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <select
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, e.target.value)}
                      className="input-box mt-4 w-20 py-2"
                      aria-label={t('quantity')}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="border border-nabat-border bg-nabat-mist p-6 md:p-8">
              <h2 className="font-heading text-xl font-medium">
                {t('orderSummary')}
              </h2>
              <div className="mt-6 space-y-3 font-nav text-sm">
                <div className="flex justify-between text-nabat-muted">
                  <span>{t('subtotal')}</span>
                  <span className="text-nabat-text">{formatEGP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-nabat-muted">
                  <span>{t('shippingAlex')}</span>
                  <span className="text-nabat-text">{formatEGP(shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-nabat-border pt-4 font-heading text-lg font-medium text-nabat-text">
                  <span>{t('total')}</span>
                  <span>{formatEGP(total)}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary mt-8 w-full">
                {t('checkout')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
