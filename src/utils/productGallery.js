/** Build unique gallery URLs for product detail page. */
export function normalizeGalleryImages(raw) {
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v).trim()).filter(Boolean);
  }
  return [];
}

/**
 * Main + hover + extra gallery images (deduped, order preserved).
 */
export function getProductGalleryImages(product) {
  if (!product) return [];
  const urls = [];
  const push = (url) => {
    const value = typeof url === 'string' ? url.trim() : '';
    if (!value) return;
    if (!urls.includes(value)) urls.push(value);
  };

  push(product.image);
  push(product.hoverImage || product.secondaryImage);
  normalizeGalleryImages(product.galleryImages).forEach(push);

  // Legacy: some products may store extras in product.images
  if (Array.isArray(product.images)) {
    product.images.forEach(push);
  }

  return urls;
}
