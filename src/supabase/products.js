import { supabase } from './supabase';

function mapDbProduct(row) {
  const slug = row.slug || row.id;
  const compareAt = row.compare_at_price != null ? Number(row.compare_at_price) : null;
  const price = Number(row.price);
  return {
    id: slug,
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
    care: row.care || '',
    light: row.light || '',
    sortOrder: row.sort_order ?? 0,
  };
}

/**
 * Load active products from Supabase only. No local/CMS fallback.
 */
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  const products = (data || []).map(mapDbProduct);
  return {
    products,
    featuredProducts: products.filter((p) => p.isFeatured),
    recentProducts: products.filter((p) => p.isRecent),
    source: 'supabase',
    getProductById: (id) =>
      products.find((p) => p.id === id || p.dbId === id) || null,
  };
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
    care: product.care || null,
    light: product.light || null,
    sort_order: Number(product.sortOrder) || 0,
    updated_at: new Date().toISOString(),
  };

  if (product.dbId) {
    row.id = product.dbId;
  }

  const { data, error } = await supabase
    .from('products')
    .upsert(row, { onConflict: 'slug' })
    .select()
    .single();

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
