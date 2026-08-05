/** Product size helpers — each option has its own price (+ optional was-price). */

export const SIZE_TYPES = [
  { id: 'letter', label: 'Letter sizes (S / M / L / LG)' },
  { id: 'cm', label: 'Centimeters (cm)' },
  { id: 'meter', label: 'Meters (m)' },
];

export const LETTER_SIZE_PRESETS = ['S', 'M', 'L', 'LG'];

export const LIGHT_OPTIONS = [
  { value: '', label: 'Any light' },
  { value: 'low', label: 'Low light' },
  { value: 'medium', label: 'Medium light' },
  { value: 'bright', label: 'Bright light' },
  { value: 'bright-direct', label: 'Bright light direct' },
  { value: 'bright-indirect', label: 'Bright light indirect' },
];

export const CARE_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'easy', label: 'Easy care' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'expert', label: 'Expert' },
];

/** Normalize optional “before discount” amount → number or null */
export function normalizeCompareAt(raw) {
  if (raw === '' || raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** True when compare-at is higher than the selling price */
export function isSalePrice(price, compareAt) {
  const p = Number(price) || 0;
  const c = Number(compareAt);
  return Number.isFinite(c) && c > p;
}

/**
 * Normalize size_options from DB / editor.
 * Supports legacy string[] and { value, price, compareAtPrice }[].
 * @returns {{ value: string, price: number, compareAtPrice: number|null }[]}
 */
export function normalizeSizeOptions(raw, fallbackPrice = 0) {
  const base = Number(fallbackPrice) || 0;
  const list = [];

  const push = (value, price, compareAt) => {
    const v = String(value ?? '').trim();
    if (!v) return;
    if (list.some((o) => o.value === v)) return;
    const p = Number(price);
    list.push({
      value: v,
      price: Number.isFinite(p) && p >= 0 ? p : base,
      compareAtPrice: normalizeCompareAt(compareAt),
    });
  };

  if (Array.isArray(raw)) {
    raw.forEach((item) => {
      if (item && typeof item === 'object') {
        push(
          item.value ?? item.label ?? item.size,
          item.price,
          item.compareAtPrice ?? item.compare_at_price
        );
      } else {
        push(item, base, null);
      }
    });
    return list;
  }

  if (typeof raw === 'string') {
    raw.split(/[,|\n]+/).forEach((part) => push(part, base, null));
  }

  return list;
}

/** Derive catalog `price` from size options (cheapest). */
export function syncProductPriceFromSizes(sizeOptions, fallback = 0) {
  const options = normalizeSizeOptions(sizeOptions, fallback);
  if (!options.length) return Number(fallback) || 0;
  return Math.min(...options.map((o) => Number(o.price) || 0));
}

export function productRequiresSize(product) {
  const type = product?.sizeType;
  if (!type || type === 'none') return false;
  return normalizeSizeOptions(product.sizeOptions, product.price).length > 0;
}

export function formatSizeLabel(size, sizeType) {
  if (!size) return '';
  if (sizeType === 'cm') return `${size} cm`;
  if (sizeType === 'meter') return `${size} m`;
  return String(size);
}

/** Selling price for a chosen size; falls back to product.price */
export function getPriceForSelection(product, sizeValue = '') {
  const size = String(sizeValue || '').trim();
  const base = Number(product?.price) || 0;
  if (!size) return base;
  const opt = normalizeSizeOptions(product?.sizeOptions, base).find(
    (o) => o.value === size
  );
  if (!opt) return base;
  const p = Number(opt.price);
  return Number.isFinite(p) && p >= 0 ? p : base;
}

/** Before-discount price for a chosen size (null if none) */
export function getCompareAtForSelection(product, sizeValue = '') {
  const size = String(sizeValue || '').trim();
  if (!size) return normalizeCompareAt(product?.compareAtPrice);
  const opt = normalizeSizeOptions(product?.sizeOptions, product?.price).find(
    (o) => o.value === size
  );
  if (!opt) return normalizeCompareAt(product?.compareAtPrice);
  return normalizeCompareAt(opt.compareAtPrice);
}

/** Lowest priced size option (for shop cards when sizes exist) */
export function getStartingPrice(product) {
  if (!productRequiresSize(product)) return Number(product?.price) || 0;
  const prices = normalizeSizeOptions(product.sizeOptions, product.price).map(
    (o) => Number(o.price) || 0
  );
  if (!prices.length) return Number(product?.price) || 0;
  return Math.min(...prices);
}

/**
 * Display price for shop cards / PDP “from” line.
 * @returns {{ price: number, compareAtPrice: number|null, onSale: boolean }}
 */
export function getDisplayPrice(product, sizeValue = '') {
  if (productRequiresSize(product) && !String(sizeValue || '').trim()) {
    const options = normalizeSizeOptions(product.sizeOptions, product.price);
    if (!options.length) {
      const price = Number(product?.price) || 0;
      const compareAtPrice = normalizeCompareAt(product?.compareAtPrice);
      return {
        price,
        compareAtPrice,
        onSale: isSalePrice(price, compareAtPrice),
      };
    }
    const cheapest = options.reduce((best, o) =>
      Number(o.price) < Number(best.price) ? o : best
    );
    const price = Number(cheapest.price) || 0;
    const compareAtPrice = normalizeCompareAt(cheapest.compareAtPrice);
    return {
      price,
      compareAtPrice,
      onSale: isSalePrice(price, compareAtPrice),
    };
  }

  const price = getPriceForSelection(product, sizeValue);
  const compareAtPrice = getCompareAtForSelection(product, sizeValue);
  return {
    price,
    compareAtPrice,
    onSale: isSalePrice(price, compareAtPrice),
  };
}

/** Product (or any of its sizes) currently on sale */
export function productIsOnSale(product) {
  if (isSalePrice(product?.price, product?.compareAtPrice)) return true;
  if (!productRequiresSize(product)) return false;
  return normalizeSizeOptions(product.sizeOptions, product.price).some((o) =>
    isSalePrice(o.price, o.compareAtPrice)
  );
}

/** Unique cart line key so same plant in two sizes = two lines */
export function makeCartKey(productId, size = '') {
  const slug = String(productId || '');
  const s = String(size || '').trim();
  return s ? `${slug}::${s}` : slug;
}

export function parseCartKey(cartKey) {
  const raw = String(cartKey || '');
  const idx = raw.indexOf('::');
  if (idx === -1) return { productId: raw, size: '' };
  return {
    productId: raw.slice(0, idx),
    size: raw.slice(idx + 2),
  };
}
