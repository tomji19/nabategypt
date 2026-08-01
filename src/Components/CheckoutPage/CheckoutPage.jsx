import React, { useEffect, useMemo, useState } from 'react';
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
import PhoneInput from '../PhoneInput/PhoneInput';
import PlantLoader from '../PlantLoader/PlantLoader';
import {
  isPhoneValidForCountry,
  splitPhoneForForm,
  toE164,
} from '../../utils/phone';

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

const NEW_ADDRESS = '__new__';

function splitName(full) {
  const parts = String(full || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function pickDefaultAddress(addresses) {
  if (!addresses.length) return null;
  return addresses.find((a) => a.isDefault) || addresses[0];
}

function addressLabel(addr) {
  const line = [addr.address, addr.apartment].filter(Boolean).join(', ');
  return line || 'Address';
}

const emptyValues = {
  email: '',
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  city: STORE.city,
  country: STORE.country,
  phoneCountry: 'EG',
  phoneNational: '',
  paymentMethod: '',
};

const CheckoutForm = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const {
    currentUser,
    userLoggedIn,
    userDetails,
    refreshProfile,
    loading: authLoading,
  } = useAuth();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [profileReady, setProfileReady] = useState(false);
  const [seedValues, setSeedValues] = useState(null);

  const { subtotal, shipping, total } = calcOrderTotals(cartItems);

  // Soft profile refresh — never block the form on network
  useEffect(() => {
    if (authLoading) return undefined;
    if (!userLoggedIn || !currentUser?.uid) {
      setProfileReady(false);
      return undefined;
    }

    setProfileReady(true);

    let cancelled = false;
    (async () => {
      try {
        if (typeof refreshProfile === 'function') {
          await refreshProfile();
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Checkout profile refresh skipped:', err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, userLoggedIn, currentUser?.uid, refreshProfile]);

  const savedAddresses = useMemo(() => {
    const list = Array.isArray(userDetails?.shipping_addresses)
      ? userDetails.shipping_addresses
      : [];
    return list.filter((a) => String(a?.address || '').trim());
  }, [userDetails]);

  const defaultAddress = useMemo(
    () => pickDefaultAddress(savedAddresses),
    [savedAddresses]
  );

  // Seed once after profile is ready (logged-in only)
  useEffect(() => {
    if (authLoading || !profileReady || !userLoggedIn || seedValues) return;

    const { firstName, lastName } = splitName(
      userDetails?.name || userDetails?.fullname
    );
    const addr = defaultAddress;
    const phoneParts = splitPhoneForForm(
      addr?.phone || userDetails?.phone || ''
    );

    setSelectedAddressId(addr ? addr.id : NEW_ADDRESS);
    setSeedValues({
      email: currentUser?.email || userDetails?.email || '',
      firstName,
      lastName,
      address: addr?.address || '',
      apartment: addr?.apartment || '',
      city: STORE.city,
      country: STORE.country,
      phoneCountry: phoneParts.country,
      phoneNational: phoneParts.national,
      paymentMethod: '',
    });
  }, [
    authLoading,
    profileReady,
    seedValues,
    userLoggedIn,
    userDetails,
    defaultAddress,
    currentUser?.email,
  ]);

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
        phoneCountry: Yup.string().required(),
        phoneNational: Yup.string()
          .required(t('phoneRequired'))
          .test('valid-phone', t('phoneInvalid'), function (value) {
            const country = this.parent.phoneCountry || 'EG';
            return isPhoneValidForCountry(country, value || '');
          }),
        paymentMethod: Yup.string().required(t('paymentRequired')),
      }),
    [t]
  );

  const formik = useFormik({
    initialValues: seedValues || emptyValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (!userLoggedIn || !currentUser?.uid) {
        toast.error(t('loginRequiredCheckout'));
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }

      if (cartItems.length === 0) {
        toast.error(t('cartEmptyCheckout'));
        return;
      }

      setSubmitting(true);
      try {
        const phone = toE164(values.phoneCountry, values.phoneNational);
        const formData = {
          ...values,
          email: currentUser.email || values.email,
          phone,
        };

        const order = await createOrder({
          userId: currentUser.uid,
          formData,
          cartItems,
          subtotal,
          shipping,
          total,
        });

        const snapshot = [...cartItems];
        try {
          await clearCart();
        } catch (clearErr) {
          console.warn('Cart clear after order failed:', clearErr);
        }

        navigate(
          order?.id
            ? `/thankyoupage?orderId=${order.id}`
            : '/thankyoupage',
          {
            replace: true,
            state: {
              formData,
              cartItems: snapshot,
              order,
              subtotal,
              shipping,
              total,
            },
          }
        );
      } catch (err) {
        console.error(err);
        toast.error(err?.message || t('orderFailed'));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const applyAddressSelection = (id) => {
    setSelectedAddressId(id);
    if (id === NEW_ADDRESS) {
      const phoneParts = splitPhoneForForm(userDetails?.phone || '');
      formik.setValues({
        ...formik.values,
        address: '',
        apartment: '',
        phoneCountry: phoneParts.country,
        phoneNational: phoneParts.national,
      });
      return;
    }

    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return;
    const phoneParts = splitPhoneForForm(
      addr.phone || userDetails?.phone || ''
    );
    formik.setValues({
      ...formik.values,
      address: addr.address || '',
      apartment: addr.apartment || '',
      phoneCountry: phoneParts.country,
      phoneNational: phoneParts.national,
    });
  };

  const selectedPayId = formik.values.paymentMethod;
  const hintKey = PAY_HINT[selectedPayId];
  const showAddressPicker = savedAddresses.length > 0;
  const showManualFields =
    !showAddressPicker || selectedAddressId === NEW_ADDRESS;
  const singleSaved =
    showAddressPicker &&
    savedAddresses.length === 1 &&
    selectedAddressId !== NEW_ADDRESS;

  const fieldClass = (name) =>
    `input-box ${
      formik.touched[name] && formik.errors[name] ? '!border-red-500' : ''
    }`;

  if (authLoading) {
    return <PlantLoader variant="overlay" />;
  }

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

  if (!profileReady || !seedValues) {
    return <PlantLoader variant="overlay" />;
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
                  readOnly
                  className={`mt-4 ${fieldClass('email')} bg-nabat-soft`}
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

                {showAddressPicker && (
                  <div className="mt-5 space-y-3">
                    <p className="section-label !mb-0">
                      {savedAddresses.length > 1
                        ? t('chooseAddress')
                        : t('savedAddresses')}
                    </p>

                    {singleSaved && (
                      <p className="font-nav text-sm text-nabat-muted">
                        {t('usingSavedAddress')}
                      </p>
                    )}

                    <div className="space-y-2">
                      {savedAddresses.map((addr) => (
                        <label
                          key={addr.id}
                          className="flex cursor-pointer items-start gap-3 border border-nabat-border p-4 font-nav text-sm transition-colors has-[:checked]:border-nabat-accent has-[:checked]:bg-nabat-mist"
                        >
                          <input
                            type="radio"
                            name="savedAddress"
                            className="mt-0.5 accent-nabat-accent"
                            checked={selectedAddressId === addr.id}
                            onChange={() => applyAddressSelection(addr.id)}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium text-nabat-text">
                              {addressLabel(addr)}
                              {addr.isDefault ? (
                                <span className="ml-2 text-xs font-normal text-nabat-accent">
                                  ({t('defaultAddress')})
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-1 block text-xs text-nabat-muted">
                              {addr.city || STORE.city},{' '}
                              {addr.country || STORE.country}
                              {addr.phone ? ` · ${addr.phone}` : ''}
                            </span>
                          </span>
                        </label>
                      ))}

                      <label className="flex cursor-pointer items-start gap-3 border border-nabat-border p-4 font-nav text-sm transition-colors has-[:checked]:border-nabat-accent has-[:checked]:bg-nabat-mist">
                        <input
                          type="radio"
                          name="savedAddress"
                          className="mt-0.5 accent-nabat-accent"
                          checked={selectedAddressId === NEW_ADDRESS}
                          onChange={() => applyAddressSelection(NEW_ADDRESS)}
                        />
                        <span>{t('useNewAddress')}</span>
                      </label>
                    </div>
                  </div>
                )}

                {showManualFields ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className="mt-3 border border-nabat-border bg-nabat-soft p-4 font-nav text-sm text-nabat-text">
                      <p>{formik.values.address}</p>
                      {formik.values.apartment ? (
                        <p className="mt-1 text-nabat-muted">
                          {formik.values.apartment}
                        </p>
                      ) : null}
                    </div>
                    {!formik.values.apartment && (
                      <>
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
                      </>
                    )}
                  </>
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
                <label className="mt-4 block section-label !mb-0">
                  {t('phone')}
                </label>
                <PhoneInput
                  country={formik.values.phoneCountry}
                  national={formik.values.phoneNational}
                  onCountryChange={(code) => {
                    formik.setFieldValue('phoneCountry', code);
                    formik.setFieldTouched('phoneNational', true, false);
                    formik.validateField('phoneNational');
                  }}
                  onNationalChange={(value) =>
                    formik.setFieldValue('phoneNational', value)
                  }
                  onBlur={() => formik.setFieldTouched('phoneNational', true)}
                  touched={formik.touched.phoneNational}
                  error={formik.errors.phoneNational}
                />
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
