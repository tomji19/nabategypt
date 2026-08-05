import { supabase, withAnonFallback } from './supabase';
import {
  normalizeCompareAt,
  normalizeSizeOptions,
  productIsOnSale,
} from '../utils/productSizes';

function mapDbProduct(row) {
  const slug = row.slug || row.id;
  const compareAt = normalizeCompareAt(row.compare_at_price);
  const price = Number(row.price);
  const sizeOptions = normalizeSizeOptions(row.size_options, price);
  const mapped = {
    id: slug,
    dbId: row.id,
    name: row.name,
    nameAr: row.name_ar || '',
    category: row.category,
    price,
    compareAtPrice: compareAt,
    description: row.description || '',
    descriptionAr: row.description_ar || '',
    image: row.image_url || null,
    hoverImage: row.hover_image_url || null,
    galleryImages: Array.isArray(row.gallery_images)
      ? row.gallery_images.map((v) => String(v).trim()).filter(Boolean)
      : [],
    stock: row.stock ?? 0,
    isActive: row.is_active !== false,
    isFeatured: !!row.is_featured,
    isRecent: !!row.is_recent,
    isGift: !!row.is_gift,
    isEasyCare:
      !!row.is_easy_care || String(row.care || '').toLowerCase() === 'easy',
    care: row.care || '',
    light: row.light || '',
    sortOrder: row.sort_order ?? 0,
    sizeType: row.size_type || '',
    sizeOptions,
  };
  mapped.onSale = productIsOnSale(mapped);
  return mapped;
}

/**
 * Load active products from Supabase only. No local/CMS fallback.
 * Retries as anon if a dead multi-tab JWT blocks the request.
 */
export async function fetchProducts() {
  return withAnonFallback(async () => {
    let data;
    let error;
    try {
      ({ data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true }));
    } catch (err) {
      const msg = err?.message || String(err);
      if (/failed to fetch|networkerror|fetch/i.test(msg)) {
        throw new Error(
          'Could not reach Supabase (network). Check your connection, that the project is not paused, and restart npm run dev after editing .env.'
        );
      }
      throw err;
    }

    if (error) throw error;

    const products = (data || []).map(mapDbProduct);
    return {
      products,
      featuredProducts: products.filter((p) => p.isFeatured),
      recentProducts: products.filter((p) => p.isRecent),
      giftProducts: products.filter((p) => p.isGift),
      easyCareProducts: products.filter((p) => p.isEasyCare),
      source: 'supabase',
      getProductById: (id) =>
        products.find((p) => p.id === id || p.dbId === id) || null,
    };
  });
}

export async function fetchAllProductsAdmin() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapDbProduct);
}

export async function upsertProduct(product) {
  const row = {
    slug: product.id || product.slug,
    name: product.name,
    name_ar: product.nameAr || null,
    category: product.category,
    price: Number(product.price),
    compare_at_price: normalizeCompareAt(product.compareAtPrice),
    description: product.description || '',
    description_ar: product.descriptionAr || '',
    image_url: typeof product.image === 'string' ? product.image : null,
    hover_image_url:
      typeof product.hoverImage === 'string' ? product.hoverImage : null,
    gallery_images: Array.isArray(product.galleryImages)
      ? product.galleryImages.map((v) => String(v).trim()).filter(Boolean)
      : [],
    stock: Number(product.stock) || 0,
    is_active: true,
    is_featured: !!product.isFeatured,
    is_recent: !!product.isRecent,
    is_gift: !!product.isGift,
    is_easy_care: !!product.isEasyCare,
    care: product.care || null,
    light: product.light || null,
    size_type: product.sizeType || null,
    size_options: normalizeSizeOptions(product.sizeOptions, product.price),
    sort_order: Number.isFinite(Number(product.sortOrder))
      ? Number(product.sortOrder)
      : 0,
    updated_at: new Date().toISOString(),
  };

  if (product.dbId) {
    row.id = product.dbId;
  }

  let { data, error } = await supabase
    .from('products')
    .upsert(row, { onConflict: 'slug' })
    .select()
    .single();

  if (error && /is_gift/i.test(error.message || '')) {
    delete row.is_gift;
    ({ data, error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'slug' })
      .select()
      .single());
  }
  if (error && /is_easy_care/i.test(error.message || '')) {
    delete row.is_easy_care;
    ({ data, error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'slug' })
      .select()
      .single());
  }
  if (error && /size_type|size_options/i.test(error.message || '')) {
    delete row.size_type;
    delete row.size_options;
    ({ data, error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'slug' })
      .select()
      .single());
  }
  if (error && /gallery_images/i.test(error.message || '')) {
    delete row.gallery_images;
    ({ data, error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'slug' })
      .select()
      .single());
  }

  if (error) throw error;
  return mapDbProduct(data);
}

export async function updateProductFields(dbId, fields) {
  const { data, error } = await supabase
    .from('products')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', dbId)
    .select()
    .single();

  if (error) throw error;
  return mapDbProduct(data);
}

export async function deleteProduct(dbId) {
  const { error } = await supabase.from('products').delete().eq('id', dbId);
  if (error) throw error;
}
