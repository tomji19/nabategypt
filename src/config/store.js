/** نبات — store configuration (Egypt / Alexandria) */

export const STORE = {
  name: 'نبات',
  nameEn: 'Nabat',
  adminEmail: 'youssefashour19@gmail.com',
  /** Simple gate for /dashboard (not account login) */
  dashboardPassword: '1999',
  phone: '01270545289',
  currency: 'EGP',
  currencyLabel: 'ج.م',
  country: 'Egypt',
  city: 'Alexandria',
  shippingFee: 50,
  taxRate: 0,
  paymentNumber: '01270545289',
};

export const PAYMENT_METHODS = [
  {
    id: 'cod',
    label: 'Cash On Delivery',
    labelAr: 'الدفع عند الاستلام',
    instructions: null,
  },
  {
    id: 'vodafone_cash',
    label: 'Vodafone Cash',
    labelAr: 'فودافون كاش',
    instructions: `Transfer the total to Vodafone Cash: ${STORE.paymentNumber}. Include your order number in the note.`,
  },
  {
    id: 'instapay',
    label: 'Instapay',
    labelAr: 'إنستاباي',
    instructions: `Transfer the total via Instapay to: ${STORE.paymentNumber}. Include your order number in the note.`,
  },
  {
    id: 'visa',
    label: 'Visa / Card on delivery',
    labelAr: 'فيزا عند الاستلام',
    instructions:
      'Pay by Visa or Mastercard when your order arrives. Online card checkout (Paymob) can be added later.',
  },
];

export const ORDER_STATUSES = [
  'Processing',
  'Confirmed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const PRODUCT_CATEGORIES = [
  'Succulent',
  'Indoor Plants',
  'Outdoor Plants',
];
