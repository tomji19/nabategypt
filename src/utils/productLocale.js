/** Localized product / category labels */

const CATEGORY_KEYS = {
  succulent: 'catSucculent',
  succulents: 'catSucculent',
  'indoor plants': 'catIndoor',
  indoor: 'catIndoor',
  'outdoor plants': 'catOutdoor',
  outdoor: 'catOutdoor',
};

/**
 * Prefer i18n product_<slug>, then DB nameAr / name.
 */
export function getProductName(product, { isAr, t } = {}) {
  if (!product) return '';
  const slug = product.id || product.slug;
  const key = slug ? `product_${slug}` : null;
  if (key && typeof t === 'function') {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }
  if (isAr && product.nameAr) return product.nameAr;
  return product.name || '';
}

export function getProductDescription(product, { isAr, t } = {}) {
  if (!product) return '';
  if (isAr && product.descriptionAr?.trim()) return product.descriptionAr.trim();
  if (!isAr && product.description?.trim()) return product.description.trim();
  if (product.description?.trim() && !isAr) return product.description.trim();
  const name = getProductName(product, { isAr, t });
  if (typeof t === 'function') {
    if (isAr) return `${name} — ${t('defaultDescription')}`;
    return `${name} ${t('defaultDescription')}`.trim();
  }
  return name;
}

export function getCategoryLabel(category, { t } = {}) {
  if (!category) return '';
  const key = CATEGORY_KEYS[String(category).trim().toLowerCase()];
  if (key && typeof t === 'function') {
    const label = t(key);
    if (label && label !== key) return label;
  }
  return category;
}
