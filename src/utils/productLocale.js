/**
 * Prefer DB nameAr / name only — no static i18n product catalog.
 */
export function getProductName(product, { isAr } = {}) {
  if (!product) return '';
  if (isAr && product.nameAr) return product.nameAr;
  return product.name || '';
}

export function getProductDescription(product, { isAr, t } = {}) {
  if (!product) return '';
  if (isAr && product.descriptionAr?.trim()) return product.descriptionAr.trim();
  if (product.description?.trim()) return product.description.trim();
  const name = getProductName(product, { isAr });
  if (typeof t === 'function' && name) {
    return isAr
      ? `${name} — ${t('defaultDescription')}`
      : `${name} ${t('defaultDescription')}`.trim();
  }
  return name;
}

export function getCategoryLabel(category, { t } = {}) {
  if (!category) return '';
  const CATEGORY_KEYS = {
    succulent: 'catSucculent',
    succulents: 'catSucculent',
    'indoor plants': 'catIndoor',
    indoor: 'catIndoor',
    'outdoor plants': 'catOutdoor',
    outdoor: 'catOutdoor',
  };
  const key = CATEGORY_KEYS[String(category).trim().toLowerCase()];
  if (key && typeof t === 'function') {
    const label = t(key);
    if (label && label !== key) return label;
  }
  return category;
}
