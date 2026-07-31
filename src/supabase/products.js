import { supabase } from './supabase';
import { getProducts as getLocalProducts } from '../Components/ProductData/ProductData';

function localImageMap() {
  const { products } = getLocalProducts();
  const map = {};
  products.forEach((p) => {
    map[p.id] = p.image;
  });
  return map;
}

function mapDbProduct(row, images = {}) {
  const slug = row.slug || row.id;
  return {
    id: slug,
    dbId: row.id,
    name: row.name,
    nameAr: row.name_ar || '',
    category: row.category,
    price: Number(row.price),
    description: row.description || '',
    descriptionAr: row.description_ar || '',
    image:
      row.image_url ||
      images[slug] ||
      images[String(slug).replace(/'/g, '')] ||
      null,
    stock: row.stock ?? 0,
    isActive: row.is_active !== false,
    isFeatured: !!row.is_featured,
    isRecent: !!row.is_recent,
  };
}

/**
 * Load products from Supabase when available; fall back to local ProductData.
 */
export async function fetchProducts() {
  const images = localImageMap();
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      const products = data.map((row) => mapDbProduct(row, images));
      return {
        products,
        featuredProducts: products.filter((p) => p.isFeatured),
        recentProducts: products.filter((p) => p.isRecent),
        source: 'supabase',
        getProductById: (id) =>
          products.find((p) => p.id === id || p.dbId === id) || null,
      };
    }
  } catch (err) {
    console.warn('Products DB unavailable, using local catalog:', err?.message);
  }

  const local = getLocalProducts();
  return { ...local, source: 'local' };
}

export async function fetchAllProductsAdmin() {
  const images = localImageMap();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map((row) => mapDbProduct(row, images));
}

export async function upsertProduct(product) {
  const row = {
    slug: product.id || product.slug,
    name: product.name,
    name_ar: product.nameAr || null,
    category: product.category,
    price: Number(product.price),
    description: product.description || '',
    description_ar: product.descriptionAr || '',
    image_url: typeof product.image === 'string' ? product.image : null,
    stock: Number(product.stock) || 0,
    is_active: product.isActive !== false,
    is_featured: !!product.isFeatured,
    is_recent: !!product.isRecent,
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
  return mapDbProduct(data, localImageMap());
}

export async function updateProductFields(dbId, fields) {
  const { data, error } = await supabase
    .from('products')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', dbId)
    .select()
    .single();

  if (error) throw error;
  return mapDbProduct(data, localImageMap());
}

export async function deleteProduct(dbId) {
  const { error } = await supabase.from('products').delete().eq('id', dbId);
  if (error) throw error;
}
