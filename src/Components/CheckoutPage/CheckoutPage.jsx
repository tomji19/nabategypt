import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useCart } from '../CartContext/CartContext';
import { useAuth } from '../AuthContext/AuthContext';
import { createOrder } from '../../supabase/orders';
import { STORE, PAYMENT_METHODS } from '../../config/store';
import { calcOrderTotals, formatEGP } from '../../utils/money';
import { useLanguage } from '../LanguageContext/LanguageContext';

const PAY_LABEL = {
  cod: 'payCod',
  vodafone_cash: 'payVodafone',
  instapay: 'payInstapay',
  visa: 'payVisa',
};

const PAY_HINT = {
  vodafone_cash: 'payVodafoneHint',
  instapay: 'payInstapayHint',
  visa: 'payVisaHint',
};

const CheckoutForm = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const { currentUser, userLoggedIn } = useAuth();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);

  const { subtotal, shipping, total } = calcOrderTotals(cartItems);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        email: Yup.string()
          .email(t('invalidEmail'))
          .required(t('emailRequired')),
        firstName: Yup.string().required(t('firstNameRequired')),
        lastName: Yup.string().required(t('lastNameRequired')),
        address: Yup.string().required(t('addressRequired')),
        apartment: Yup.string().required(t('apartmentRequired')),
        phone: Yup.string()
          .matches(/^01[0125][0-9]{8}$/, t('phoneInvalid'))
          .required(t('phoneRequired')),
        paymentMethod: Yup.string().required(t('paymentRequired')),
      }),
    [t]
  );

  const formik = useFormik({
    initialValues: {
      email: currentUser?.email || '',
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: STORE.city,
      country: STORE.country,
      phone: '',
      paymentMethod: '',
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (cartItems.length === 0) {
        toast.error(t('cartEmptyCheckout'));
        return;
      }

      setSubmitting(true);
      try {
        const order = await createOrder({
          userId: userLoggedIn ? currentUser?.uid : null,
          formData: values,
          cartItems,
          subtotal,
          shipping,
          total,
        });

        const snapshot = [...cartItems];
        clearCart();
        navigate('/thankyoupage', {
          state: {
            formData: values,
            cartItems: snapshot,
            order,
            subtotal,
            shipping,
            total,
          },
        });
      } catch (err) {
        console.error(err);
        toast.error(err?.message || t('cartEmptyCheckout'));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const selectedId = formik.values.paymentMethod;
  const hintKey = PAY_HINT[selectedId];

  const fieldClass = (name) =>
    `input-box ${
      formik.touched[name] && formik.errors[name] ? '!border-red-500' : ''
    }`;

  if (cartItems.length === 0) {
    return (
      <div className="leaf-wash section-pad py-16 text-center">
        <p className="font-body text-nabat-muted">{t('cartEmptyCheckout')}</p>
        <button
          type="button"
          className="btn-primary mt-6"
          onClick={() => navigate('/shop')}
        >
          {t('continueShopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="leaf-wash section-pad py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <p className="section-label">{t('checkoutLabel')}</p>
        <h1 className="section-title mb-2">{t('checkoutTitle')}</h1>
        <p className="mb-10 font-nav text-sm text-nabat-muted">
          {t('checkoutHint')}
        </p>

        <form onSubmit={formik.handleSubmit}>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="space-y-8 bg-white p-6 md:p-8">
              <div>
                <h2 className="font-heading text-xl font-medium">
                  {t('contactSection')}
                </h2>
                <input
                  type="email"
                  placeholder={t('emailAddress')}
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
                <h2 className="font-heading text-xl font-medium">
                  {t('shippingSection')}
                </h2>
                <p className="mt-1 font-nav text-xs text-nabat-muted">
                  {t('deliveryOnlyAlex')}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder={t('firstName')}
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
                      placeholder={t('lastName')}
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
                  placeholder={t('streetAddress')}
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
                  placeholder={t('apartment')}
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
                  value={t('alexandriaCity')}
                  disabled
                  className="input-box mt-3 bg-nabat-soft"
                />
                <select
                  className="input-box mt-3 bg-nabat-soft"
                  value={formik.values.country}
                  disabled
                >
                  <option value="Egypt">{t('egypt')}</option>
                </select>
                <input
                  type="tel"
                  placeholder={t('phone')}
                  {...formik.getFieldProps('phone')}
                  className={`mt-3 ${fieldClass('phone')}`}
                  dir="ltr"
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="mt-1 font-nav text-sm text-red-500">
                    {formik.errors.phone}
                  </p>
                )}
              </div>

              <div>
                <h2 className="font-heading text-xl font-medium">
                  {t('paymentSection')}
                </h2>
                <div className="mt-4 space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className="flex cursor-pointer items-center gap-3 border border-nabat-border p-4 font-nav text-sm transition-colors has-[:checked]:border-nabat-accent has-[:checked]:bg-nabat-mist"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formik.values.paymentMethod === method.id}
                        onChange={formik.handleChange}
                        className="accent-nabat-accent"
                      />
                      <span>{t(PAY_LABEL[method.id] || method.id)}</span>
                    </label>
                  ))}
                </div>
                {formik.touched.paymentMethod && formik.errors.paymentMethod && (
                  <p className="mt-2 font-nav text-sm text-red-500">
                    {formik.errors.paymentMethod}
                  </p>
                )}
                {hintKey && (
                  <div className="mt-4 border border-nabat-border bg-nabat-mist p-4 font-nav text-sm text-nabat-text">
                    <p className="font-medium text-nabat-primary">
                      {t('paymentInstructions')}
                    </p>
                    <p className="mt-2 text-nabat-muted">{t(hintKey)}</p>
                    <p className="mt-2 font-medium" dir="ltr">
                      {t('numberLabel')}: {STORE.paymentNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="border border-nabat-border bg-white p-6 md:p-8 lg:sticky lg:top-28">
                <h2 className="font-heading text-xl font-medium">
                  {t('summary')}
                </h2>
                <div className="mt-6 space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 object-cover bg-nabat-mist"
                        />
                        <div>
                          <p className="font-nav text-sm font-medium">
                            {item.name}
                          </p>
                          <p className="font-nav text-xs text-nabat-muted">
                            {t('qty')} {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-nav text-sm">
                        {formatEGP(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-2 border-t border-nabat-border pt-4 font-nav text-sm">
                  <div className="flex justify-between text-nabat-muted">
                    <span>{t('subtotal')}</span>
                    <span className="text-nabat-text">{formatEGP(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-nabat-muted">
                    <span>{t('shippingAlex')}</span>
                    <span className="text-nabat-text">{formatEGP(shipping)}</span>
                  </div>
                  <div className="flex justify-between pt-2 font-heading text-xl font-medium text-nabat-primary">
                    <span>{t('total')}</span>
                    <span>{formatEGP(total)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary mt-8 w-full disabled:opacity-60"
                >
                  {submitting ? t('placingOrder') : t('confirmOrder')}
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
