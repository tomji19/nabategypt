import { supabase } from './supabase';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SITE_CONTENT,
} from '../config/defaultContent';

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

function mapProductRow(row) {
  const compareAt =
    row.compare_at_price != null ? Number(row.compare_at_price) : null;
  const price = Number(row.price);
  return {
    id: row.slug,
    dbId: row.id,
    name: row.name,
    nameAr: row.name_ar || '',
    category: row.category,
    price,
    compareAtPrice: compareAt,
    onSale: compareAt != null && compareAt > price,
    description: row.description || '',
    descriptionAr: row.description_ar || '',
    image: row.image_url || null,
    hoverImage: row.hover_image_url || null,
    stock: row.stock ?? 0,
    isActive: row.is_active !== false,
    isFeatured: !!row.is_featured,
    isRecent: !!row.is_recent,
    sortOrder: row.sort_order ?? 0,
    care: row.care || '',
    light: row.light || '',
  };
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
    compare_at_price:
      product.compareAtPrice != null ? Number(product.compareAtPrice) : null,
    description: product.description || '',
    description_ar: product.descriptionAr || '',
    image_url: typeof product.image === 'string' ? product.image : null,
    hover_image_url:
      typeof product.hoverImage === 'string' ? product.hoverImage : null,
    stock: Number(product.stock) || 0,
    is_active: product.isActive !== false,
    is_featured: !!product.isFeatured,
    is_recent: !!product.isRecent,
    sort_order: Number(product.sortOrder) || 0,
    care: product.care || null,
    light: product.light || null,
    updated_at: new Date().toISOString(),
  };
  if (product.dbId) row.id = product.dbId;

  const { data, error } = await supabase
    .from('products')
    .upsert(row, { onConflict: 'slug' })
    .select()
    .single();
  if (error) throw error;
  return { ...product, dbId: data.id, ...mapProductRow(data) };
}

export async function deleteDashboardProduct(product) {
  if (!product.dbId) {
    throw new Error('Product has no database id');
  }
  const { error } = await supabase.from('products').delete().eq('id', product.dbId);
  if (error) throw error;
}

export async function loadCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;

  if (!data?.length) {
    return { source: 'supabase', categories: DEFAULT_CATEGORIES };
  }

  return {
    source: 'supabase',
    categories: data.map((c) => ({
      id: c.slug,
      dbId: c.id,
      name: c.name,
      nameAr: c.name_ar || '',
      description: c.description || '',
      descriptionAr: c.description_ar || '',
      sortOrder: c.sort_order ?? 0,
      isActive: c.is_active !== false,
    })),
  };
}

export async function saveCategory(category) {
  const row = {
    slug: category.id,
    name: category.name,
    name_ar: category.nameAr || null,
    description: category.description || '',
    description_ar: category.descriptionAr || '',
    sort_order: Number(category.sortOrder) || 0,
    is_active: category.isActive !== false,
    updated_at: new Date().toISOString(),
  };
  if (category.dbId) row.id = category.dbId;

  const { data, error } = await supabase
    .from('categories')
    .upsert(row, { onConflict: 'slug' })
    .select()
    .single();
  if (error) throw error;
  return { ...category, dbId: data.id };
}

export async function deleteCategory(category) {
  if (!category.dbId) throw new Error('Category has no database id');
  const { error } = await supabase.from('categories').delete().eq('id', category.dbId);
  if (error) throw error;
}

export async function loadSiteContent() {
  const { data, error } = await supabase.from('site_content').select('key, value');
  if (error) throw error;

  const merged = structuredClone(DEFAULT_SITE_CONTENT);
  (data || []).forEach((row) => {
    if (row.key && row.value) {
      merged[row.key] = { ...merged[row.key], ...row.value };
    }
  });
  return { source: 'supabase', content: merged };
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
