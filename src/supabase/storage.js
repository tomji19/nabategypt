import { supabase } from './supabase';

const BUCKET = 'products';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

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

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${safeExt}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error(
      error.message?.includes('Bucket not found')
        ? 'Storage bucket “products” is missing. Create it in Supabase → Storage (public).'
        : error.message || 'Upload failed'
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('Could not get public image URL');
  return data.publicUrl;
}
