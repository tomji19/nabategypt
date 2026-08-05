import { supabase, withAnonFallback } from './supabase';
import {
  normalizeCompareAt,
  normalizeSizeOptions,
  productIsOnSale,
} from '../utils/productSizes';

/** Detect if Supabase products table is usable */
export async function probeDatabase() {
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

function missingColumnError(error, column) {
  const msg = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`;
  return new RegExp(column, 'i').test(msg);
}

function mapProductRow(row) {
  const compareAt = normalizeCompareAt(row.compare_at_price);
  const price = Number(row.price);
  const sizeOptions = normalizeSizeOptions(row.size_options, row.price);
  const mapped = {
    id: row.slug,
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
    sortOrder: row.sort_order ?? 0,
    care: row.care || '',
    light: row.light || '',
    sizeType: row.size_type || '',
    sizeOptions,
  };
  mapped.onSale = productIsOnSale(mapped);
  return mapped;
}

function mapCategoryRow(c) {
  return {
    id: c.slug,
    dbId: c.id,
    name: c.name,
    nameAr: c.name_ar || '',
    description: c.description || '',
    descriptionAr: c.description_ar || '',
    image: c.image_url || '',
    sortOrder: c.sort_order ?? 0,
    isActive: c.is_active !== false,
  };
}

/**
 * Check columns the dashboard needs. Returns { ok, message, ...flags }.
 * Probes run in parallel so one slow column check cannot stall the dashboard.
 */
export async function probeDashboardSchema() {
  const result = {
    categoriesImage: true,
    productGift: true,
    productEasyCare: true,
    productSizes: true,
    productGallery: true,
    ok: true,
    message: '',
  };

  const [cat, gift, easy, sizes, gallery] = await Promise.all([
    supabase.from('categories').select('image_url').limit(1),
    supabase.from('products').select('is_gift').limit(1),
    supabase.from('products').select('is_easy_care').limit(1),
    supabase.from('products').select('size_type, size_options').limit(1),
    supabase.from('products').select('gallery_images').limit(1),
  ]);

  if (cat.error && missingColumnError(cat.error, 'image_url')) {
    result.categoriesImage = false;
  } else if (cat.error) {
    result.ok = false;
    result.message = cat.error.message;
  }

  if (gift.error && missingColumnError(gift.error, 'is_gift')) {
    result.productGift = false;
  } else if (gift.error && result.ok) {
    result.ok = false;
    result.message = gift.error.message;
  }

  if (easy.error && missingColumnError(easy.error, 'is_easy_care')) {
    result.productEasyCare = false;
  } else if (easy.error && result.ok) {
    result.ok = false;
    result.message = easy.error.message;
  }

  if (
    sizes.error &&
    (missingColumnError(sizes.error, 'size_type') ||
      missingColumnError(sizes.error, 'size_options'))
  ) {
    result.productSizes = false;
  } else if (sizes.error && result.ok) {
    result.ok = false;
    result.message = sizes.error.message;
  }

  if (gallery.error && missingColumnError(gallery.error, 'gallery_images')) {
    result.productGallery = false;
  } else if (gallery.error && result.ok) {
    result.ok = false;
    result.message = gallery.error.message;
  }

  if (
    !result.categoriesImage ||
    !result.productGift ||
    !result.productEasyCare ||
    !result.productSizes ||
    !result.productGallery
  ) {
    result.ok = false;
    result.message =
      'Database is missing columns. Run scripts/ensure-all-schema.sql once in the Supabase SQL Editor, then refresh.';
  }

  return result;
}

export async function loadDashboardCatalog() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return {
    source: 'supabase',
    products: (data || []).map(mapProductRow),
  };
}

export async function saveDashboardProduct(product) {
  const row = {
    slug: product.id,
    name: product.name,
    name_ar: product.nameAr || null,
    category: product.category,
    price: Number(product.price),
    compare_at_price: normalizeCompareAt(product.compareAtPrice),
    description: product.description || '',
    description_ar: product.descriptionAr || '',
    image_url: typeof product.image === 'string' ? product.image || null : null,
    hover_image_url:
      typeof product.hoverImage === 'string' ? product.hoverImage || null : null,
    gallery_images: Array.isArray(product.galleryImages)
      ? product.galleryImages.map((v) => String(v).trim()).filter(Boolean)
      : [],
    stock: Number(product.stock) || 0,
    is_active: true,
    is_featured: !!product.isFeatured,
    is_recent: !!product.isRecent,
    is_gift: !!product.isGift,
    is_easy_care: !!product.isEasyCare,
    sort_order: Number.isFinite(Number(product.sortOrder))
      ? Number(product.sortOrder)
      : 0,
    care: product.care || null,
    light: product.light || null,
    size_type: product.sizeType || null,
    size_options: normalizeSizeOptions(product.sizeOptions, product.price),
    updated_at: new Date().toISOString(),
  };
  if (product.dbId) row.id = product.dbId;

  let { data, error } = await supabase
    .from('products')
    .upsert(row, { onConflict: 'slug' })
    .select()
    .single();

  const dropped = [];
  const stripAndRetry = async (column, flag) => {
    if (error && missingColumnError(error, column)) {
      delete row[column];
      dropped.push(flag);
      ({ data, error } = await supabase
        .from('products')
        .upsert(row, { onConflict: 'slug' })
        .select()
        .single());
    }
  };

  await stripAndRetry('is_gift', 'isGift');
  await stripAndRetry('is_easy_care', 'isEasyCare');
  await stripAndRetry('size_type', 'sizeType');
  await stripAndRetry('size_options', 'sizeOptions');
  await stripAndRetry('gallery_images', 'galleryImages');

  if (error) throw error;

  // Re-read so UI matches what is actually in Supabase
  const { data: verified, error: verifyError } = await supabase
    .from('products')
    .select('*')
    .eq('id', data.id)
    .single();
  if (verifyError) throw verifyError;

  const saved = mapProductRow(verified);
  const wantedMissing = dropped.filter((flag) => !!product[flag]);
  if (wantedMissing.length) {
    const err = new Error(
      `Product saved, but some fields were NOT stored (${wantedMissing.join(', ')}). Run scripts/ensure-all-schema.sql in Supabase, then save again.`
    );
    err.code = 'SCHEMA_DRIFT';
    err.saved = saved;
    throw err;
  }
  return saved;
}

export async function deleteDashboardProduct(product) {
  if (!product.dbId) {
    throw new Error('Product has no database id');
  }
  const { error } = await supabase.from('products').delete().eq('id', product.dbId);
  if (error) throw error;
}

export async function loadCategories() {
  return withAnonFallback(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return {
      source: 'supabase',
      categories: (data || []).map(mapCategoryRow),
      empty: !data?.length,
    };
  });
}

export async function saveCategory(category) {
  const slug = String(category.id || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
  if (!slug || !category.name?.trim()) {
    throw new Error('Slug and name are required');
  }

  const row = {
    slug,
    name: category.name.trim(),
    name_ar: category.nameAr || null,
    description: category.description || '',
    description_ar: category.descriptionAr || '',
    image_url: typeof category.image === 'string' ? category.image.trim() || null : null,
    sort_order: Number(category.sortOrder) || 0,
    is_active: category.isActive !== false,
    updated_at: new Date().toISOString(),
  };
  if (category.dbId) row.id = category.dbId;

  let { data, error } = await supabase
    .from('categories')
    .upsert(row, { onConflict: 'slug' })
    .select()
    .single();

  let droppedImage = false;
  if (error && missingColumnError(error, 'image_url')) {
    delete row.image_url;
    droppedImage = true;
    ({ data, error } = await supabase
      .from('categories')
      .upsert(row, { onConflict: 'slug' })
      .select()
      .single());
  }

  if (error) throw error;

  const { data: verified, error: verifyError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', data.id)
    .single();
  if (verifyError) throw verifyError;

  const saved = mapCategoryRow(verified);

  if (droppedImage && category.image) {
    const err = new Error(
      'Category saved, but the image was NOT stored. Run scripts/ensure-all-schema.sql in the Supabase SQL Editor, then save the image again.'
    );
    err.code = 'SCHEMA_DRIFT';
    err.saved = saved;
    throw err;
  }

  return saved;
}

export async function deleteCategory(category) {
  if (!category.dbId) throw new Error('Category has no database id');
  const { error } = await supabase.from('categories').delete().eq('id', category.dbId);
  if (error) throw error;
}

function mergeSection(base, saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
    return base && typeof base === 'object' ? { ...base } : {};
  }
  if (!base || typeof base !== 'object') return { ...saved };
  const out = { ...base, ...saved };
  for (const key of Object.keys(base)) {
    if (Array.isArray(base[key]) && !Array.isArray(saved[key]) && saved[key] == null) {
      out[key] = Array.isArray(base[key]) ? [...base[key]] : base[key];
    }
  }
  return out;
}

/** Load site_content rows from Supabase only — no static defaults. */
export async function loadSiteContent() {
  return withAnonFallback(async () => {
    const { data, error } = await supabase.from('site_content').select('key, value');
    if (error) throw error;

    const content = {};
    (data || []).forEach((row) => {
      if (row.key && row.value && typeof row.value === 'object') {
        content[row.key] = row.value;
      }
    });
    return { source: 'supabase', content };
  });
}

/** Save one site_content key only (merge partial into existing DB row). */
export async function saveSiteContentSection(key, partial) {
  if (!key || !partial || typeof partial !== 'object') {
    throw new Error('Invalid section save');
  }

  const { data: existing, error: readError } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (readError) throw readError;

  const current =
    existing?.value && typeof existing.value === 'object' ? existing.value : {};
  const next = mergeSection(current, partial);

  const { error } = await supabase.from('site_content').upsert(
    {
      key,
      value: next,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );
  if (error) throw error;

  const { data: verified, error: verifyError } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', key)
    .single();
  if (verifyError) throw verifyError;

  return verified?.value && typeof verified.value === 'object'
    ? verified.value
    : next;
}

export async function saveSiteContent(content) {
  const rows = Object.entries(content).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('site_content').upsert(rows, {
    onConflict: 'key',
  });
  if (error) throw error;
  return content;
}
