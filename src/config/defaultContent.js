/** Default editable website copy — override from /dashboard */

export const DEFAULT_SITE_CONTENT = {
  hero: {
    eyebrow: 'Est. greenhouse',
    tagline: 'Delivering life to your doorstep.',
    cta: 'Enter the shop',
  },
  home: {
    featuredTitle: 'Featured plants',
    featuredSubtitle: 'Our most loved greenery',
    recentTitle: 'Recent plants',
    recentSubtitle: 'Fresh arrivals for your space',
    socialTitle: 'Follow the greenhouse',
    socialSubtitle: 'Care tips, new arrivals, and plant stories from our nursery',
  },
  about: {
    eyebrow: "Egypt's plant atelier",
    title: 'Delivering life to your doorstep',
    body: 'Thoughtfully chosen plants for modern homes — from quiet indoor greens to sun-loving outdoor companions. We curate with care so every plant arrives ready to thrive.',
    bodyAr: 'نباتات مختارة بعناية للمنازل العصرية — من النباتات الداخلية الهادئة إلى نباتات الشمس الخارجية. نهتم بكل تفصيلة حتى تصل كل نبتة جاهزة للنمو.',
  },
  contact: {
    eyebrow: 'Hello',
    title: "We'd love to hear from you",
    subtitle: 'Questions about plants, orders, or care? Send us a note.',
    locationLabel: 'Location',
    location: 'Alexandria, Egypt',
  },
  footer: {
    tagline: 'Delivering life to your doorstep',
  },
  shop: {
    bannerTitle: 'Shop',
    bannerEyebrow: 'Collection',
  },
  store: {
    phone: '01270545289',
    email: 'youssefashour19@gmail.com',
    city: 'Alexandria',
    country: 'Egypt',
    shippingFee: 50,
    paymentNumber: '01270545289',
  },
};

export const DEFAULT_CATEGORIES = [
  {
    id: 'succulent',
    name: 'Succulent',
    nameAr: 'صباريات',
    description: 'Low-water desert greens',
    descriptionAr: 'نباتات صحراوية قليلة الري',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'indoor-plants',
    name: 'Indoor Plants',
    nameAr: 'نباتات داخلية',
    description: 'For bright rooms and calm corners',
    descriptionAr: 'لغرف مضيئة وزوايا هادئة',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'outdoor-plants',
    name: 'Outdoor Plants',
    nameAr: 'نباتات خارجية',
    description: 'Sun-loving balcony and garden plants',
    descriptionAr: 'لنباتات الشرفات والحدائق',
    sortOrder: 3,
    isActive: true,
  },
];
