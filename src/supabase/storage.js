import { supabase } from './supabase';

const BUCKET = 'products';
const MAX_BYTES = 5 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 45_000;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function withTimeout(promise, ms, message) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * Upload an image file to the public `products` Storage bucket.
 * Returns the public URL.
 */
export async function uploadProductImage(file, { folder = 'catalog' } = {}) {
  if (!file) throw new Error('No file selected');
  if (!ALLOWED.has(file.type)) {
    throw new Error('Use JPEG, PNG, WebP, or GIF');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be under 5 MB');
  }

  const ext = (file.name.split('.').pop() || 'jpg')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)
    ? ext === 'jpeg'
      ? 'jpg'
      : ext
    : 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${safeExt}`;

  const uploadPromise = supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || `image/${safeExt === 'jpg' ? 'jpeg' : safeExt}`,
  });

  const { error } = await withTimeout(
    uploadPromise,
    UPLOAD_TIMEOUT_MS,
    'Upload timed out. Check Supabase Storage bucket “products” and your connection.'
  );

  if (error) {
    const msg = error.message || 'Upload failed';
    if (/bucket not found/i.test(msg)) {
      throw new Error(
        'Storage bucket “products” is missing. Create it in Supabase → Storage (public).'
      );
    }
    if (/row-level security|policy|permission|not allowed|unauthorized/i.test(msg)) {
      throw new Error(
        'Upload blocked by Storage permissions. Re-run the storage policies in supabase_schema.sql.'
      );
    }
    if (/mime|type|not supported/i.test(msg)) {
      throw new Error('This image type is not allowed by the Storage bucket.');
    }
    throw new Error(msg);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('Could not get public image URL');
  return data.publicUrl;
}

/** Upload many images (keeps going if one fails — returns successful URLs). */
export async function uploadProductImages(files, options = {}) {
  const list = Array.from(files || []).filter(Boolean);
  if (!list.length) return { urls: [], errors: [] };
  const urls = [];
  const errors = [];
  for (const file of list) {
    try {
      urls.push(await uploadProductImage(file, options));
    } catch (err) {
      errors.push(err?.message || 'Upload failed');
    }
  }
  if (!urls.length && errors.length) {
    throw new Error(errors[0]);
  }
  return { urls, errors };
}
