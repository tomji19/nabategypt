import { supabase } from './supabase';
import { getProducts as getLocalProducts } from '../Components/ProductData/ProductData';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SITE_CONTENT,
} from '../config/defaultContent';

const KEYS = {
  products: 'nabat_cms_products',
  categories: 'nabat_cms_categories',
  content: 'nabat_cms_content',
  mode: 'nabat_cms_source',
};

function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function mapLocalCatalog() {
  const { products, featuredProducts, recentProducts } = getLocalProducts();
  const featuredIds = new Set(featuredProducts.map((p) => p.id));
  const recentIds = new Set(recentProducts.map((p) => p.id));
  return products.map((p, i) => ({
    id: p.id,
    dbId: null,
    name: p.name,
    nameAr: p.nameAr || '',
    category: p.category,
    price: Number(p.price),
    description: p.description || '',
    descriptionAr: p.descriptionAr || '',
    image: p.image,
    stock: p.stock ?? 10,
    isActive: true,
    isFeatured: featuredIds.has(p.id),
    isRecent: recentIds.has(p.id),
    sortOrder: i + 1,
    care: p.care || '',
    light: p.light || '',
  }));
}

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

export async function loadDashboardCatalog() {
  const dbReady = await probeDatabase();

  if (dbReady) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) {
        writeLocal(KEYS.mode, 'supabase');
        const images = Object.fromEntries(
          mapLocalCatalog().map((p) => [p.id, p.image])
        );
        return {
          source: 'supabase',
          products: data.map((row) => ({
            id: row.slug,
            dbId: row.id,
            name: row.name,
            nameAr: row.name_ar || '',
            category: row.category,
            price: Number(row.price),
            description: row.description || '',
            descriptionAr: row.description_ar || '',
            image: row.image_url || images[row.slug] || null,
            stock: row.stock ?? 0,
            isActive: row.is_active !== false,
            isFeatured: !!row.is_featured,
            isRecent: !!row.is_recent,
            sortOrder: row.sort_order ?? 0,
            care: row.care || '',
            light: row.light || '',
          })),
        };
      }
    } catch {
      /* fall through */
    }
  }

  const stored = readLocal(KEYS.products, null);
  const products = stored?.length ? stored : mapLocalCatalog();
  if (!stored?.length) writeLocal(KEYS.products, products);
  writeLocal(KEYS.mode, 'local');
  return { source: 'local', products };
}

export async function saveDashboardProduct(product, source) {
  if (source === 'supabase') {
    const row = {
      slug: product.id,
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
    return { ...product, dbId: data.id };
  }

  const list = readLocal(KEYS.products, mapLocalCatalog());
  const idx = list.findIndex((p) => p.id === product.id);
  const next = { ...product, image: product.image };
  if (idx >= 0) list[idx] = next;
  else list.push(next);
  writeLocal(KEYS.products, list);
  return next;
}

export async function deleteDashboardProduct(product, source) {
  if (source === 'supabase' && product.dbId) {
    const { error } = await supabase.from('products').delete().eq('id', product.dbId);
    if (error) throw error;
    return;
  }
  const list = readLocal(KEYS.products, []).filter((p) => p.id !== product.id);
  writeLocal(KEYS.products, list);
}

export async function loadCategories() {
  const dbReady = await probeDatabase();
  if (dbReady) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data?.length) {
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
    } catch {
      /* local */
    }
  }
  const cats = readLocal(KEYS.categories, DEFAULT_CATEGORIES);
  writeLocal(KEYS.categories, cats);
  return { source: 'local', categories: cats };
}

export async function saveCategory(category, source) {
  if (source === 'supabase') {
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
  const list = readLocal(KEYS.categories, DEFAULT_CATEGORIES);
  const idx = list.findIndex((c) => c.id === category.id);
  if (idx >= 0) list[idx] = category;
  else list.push(category);
  writeLocal(KEYS.categories, list);
  return category;
}

export async function deleteCategory(category, source) {
  if (source === 'supabase' && category.dbId) {
    const { error } = await supabase.from('categories').delete().eq('id', category.dbId);
    if (error) throw error;
    return;
  }
  writeLocal(
    KEYS.categories,
    readLocal(KEYS.categories, []).filter((c) => c.id !== category.id)
  );
}

export async function loadSiteContent() {
  const dbReady = await probeDatabase();
  if (dbReady) {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('key, value');
      if (!error && data?.length) {
        const merged = structuredClone(DEFAULT_SITE_CONTENT);
        data.forEach((row) => {
          if (row.key && row.value) merged[row.key] = { ...merged[row.key], ...row.value };
        });
        return { source: 'supabase', content: merged };
      }
    } catch {
      /* local */
    }
  }
  const content = {
    ...structuredClone(DEFAULT_SITE_CONTENT),
    ...readLocal(KEYS.content, {}),
  };
  // deep-ish merge sections
  Object.keys(DEFAULT_SITE_CONTENT).forEach((k) => {
    content[k] = { ...DEFAULT_SITE_CONTENT[k], ...(content[k] || {}) };
  });
  writeLocal(KEYS.content, content);
  return { source: 'local', content };
}

export async function saveSiteContent(content, source) {
  if (source === 'supabase') {
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
  writeLocal(KEYS.content, content);
  return content;
}

/** For shop: prefer CMS localStorage products when DB empty */
export function getCmsLocalProducts() {
  return readLocal(KEYS.products, null);
}

export function getCmsLocalContent() {
  const content = {
    ...structuredClone(DEFAULT_SITE_CONTENT),
    ...readLocal(KEYS.content, {}),
  };
  Object.keys(DEFAULT_SITE_CONTENT).forEach((k) => {
    content[k] = { ...DEFAULT_SITE_CONTENT[k], ...(content[k] || {}) };
  });
  return content;
}

export function getCmsLocalCategories() {
  return readLocal(KEYS.categories, DEFAULT_CATEGORIES);
}
