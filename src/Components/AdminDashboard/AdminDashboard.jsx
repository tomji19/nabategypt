import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PlantLoader from '../PlantLoader/PlantLoader';
import { lockDashboard } from '../DashboardGate/DashboardGate';
import BrandLogo from '../BrandLogo/BrandLogo';
import { fetchAllOrders, updateOrderStatus } from '../../supabase/orders';
import {
  loadDashboardCatalog,
  saveDashboardProduct,
  deleteDashboardProduct,
  loadCategories,
  saveCategory,
  deleteCategory,
  loadSiteContent,
  saveSiteContent,
} from '../../supabase/cms';
import { ORDER_STATUSES, PAYMENT_METHODS } from '../../config/store';
import { formatEGP } from '../../utils/money';
import { useProducts } from '../ProductsContext/ProductsContext';

const TABS = [
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
  { id: 'content', label: 'Site texts' },
  { id: 'settings', label: 'Store settings' },
];

const emptyProduct = (category = 'Succulent') => ({
  id: '',
  name: '',
  nameAr: '',
  category,
  price: 45,
  stock: 10,
  description: '',
  descriptionAr: '',
  image: '',
  care: '',
  light: '',
  sortOrder: 0,
  isActive: true,
  isFeatured: false,
  isRecent: false,
});

const emptyCategory = () => ({
  id: '',
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  sortOrder: 0,
  isActive: true,
});

function Field({ label, children }) {
  return (
    <label className="block font-nav text-xs text-nabat-muted">
      <span className="mb-1.5 block uppercase tracking-[0.12em]">{label}</span>
      {children}
    </label>
  );
}

export default function AdminDashboard() {
  const { refreshProducts } = useProducts();
  const [tab, setTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [productFilter, setProductFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [catalog, cats, site, ords] = await Promise.all([
        loadDashboardCatalog(),
        loadCategories(),
        loadSiteContent(),
        fetchAllOrders().catch(() => []),
      ]);
      setProducts(catalog.products);
      setCategories(cats.categories);
      setContent(site.content);
      setOrders(ords);
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLock = () => {
    lockDashboard();
    window.location.href = '/dashboard';
  };

  const onStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!editing?.id || !editing?.name) {
      toast.error('Slug and name are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...editing,
        image:
          (typeof editing.image === 'string' && editing.image.trim()) ||
          editing._localImage ||
          editing.image ||
          '',
      };
      delete payload._localImage;
      const saved = await saveDashboardProduct(payload);
      setProducts((prev) => {
        const i = prev.findIndex((p) => p.id === saved.id);
        if (i >= 0) {
          const next = [...prev];
          next[i] = saved;
          return next;
        }
        return [...prev, saved];
      });
      setEditing(null);
      await refreshProducts?.();
      toast.success('Product saved');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try {
      await deleteDashboardProduct(product);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      await refreshProducts?.();
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const saveCat = async (e) => {
    e.preventDefault();
    if (!editingCat?.id || !editingCat?.name) {
      toast.error('Slug and name required');
      return;
    }
    setSaving(true);
    try {
      const saved = await saveCategory(editingCat);
      setCategories((prev) => {
        const i = prev.findIndex((c) => c.id === saved.id);
        if (i >= 0) {
          const next = [...prev];
          next[i] = saved;
          return next;
        }
        return [...prev, saved];
      });
      setEditingCat(null);
      toast.success('Category saved');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const removeCat = async (cat) => {
    if (!window.confirm(`Delete category ${cat.name}?`)) return;
    try {
      await deleteCategory(cat);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const saveContentSection = async () => {
    setSaving(true);
    try {
      await saveSiteContent(content);
      toast.success('Site texts saved');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (section, field, value) => {
    setContent((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  if (loading || !content) return <PlantLoader variant="overlay" />;

  const pendingCount = orders.filter((o) => o.status === 'Processing').length;
  const categoryNames = categories.filter((c) => c.isActive).map((c) => c.name);
  const filteredProducts = products.filter((p) => {
    const q = productFilter.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="leaf-wash min-h-screen">
      <div className="border-b border-nabat-border bg-nabat-primary text-white">
        <div className="section-pad flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <BrandLogo imgClassName="mb-2 h-9 w-auto object-contain brightness-0 invert" />
            <p className="font-nav text-[11px] uppercase tracking-[0.2em] text-white/70">
              Dashboard · Connected to Supabase
            </p>
            <h1 className="font-heading text-2xl font-medium md:text-3xl">
              إدارة المتجر
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={load} className="btn-ghost !px-5 !py-2.5">
              Refresh
            </button>
            <Link to="/" className="btn-ghost !px-5 !py-2.5">
              View store
            </Link>
            <button type="button" onClick={handleLock} className="btn-ghost !px-5 !py-2.5">
              Lock
            </button>
          </div>
        </div>
      </div>

      <div className="section-pad py-8 md:py-12">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="border border-nabat-border bg-white p-5">
            <p className="font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted">
              Products
            </p>
            <p className="mt-2 font-heading text-3xl text-nabat-primary">
              {products.length}
            </p>
          </div>
          <div className="border border-nabat-border bg-white p-5">
            <p className="font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted">
              Orders / Processing
            </p>
            <p className="mt-2 font-heading text-3xl text-nabat-accent">
              {orders.length} / {pendingCount}
            </p>
          </div>
          <div className="border border-nabat-border bg-white p-5">
            <p className="font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted">
              Categories
            </p>
            <p className="mt-2 font-heading text-3xl text-nabat-primary">
              {categories.length}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-1 border-b border-nabat-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 font-nav text-xs uppercase tracking-[0.14em] transition-colors ${
                tab === t.id
                  ? 'border-b-2 border-nabat-primary text-nabat-primary'
                  : 'text-nabat-muted hover:text-nabat-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="border border-nabat-border bg-white p-10 text-center font-body text-nabat-muted">
                No orders yet. They appear here after checkout once Supabase schema is
                running.
              </div>
            ) : (
              orders.map((order) => {
                const payment =
                  PAYMENT_METHODS.find((m) => m.id === order.payment_method)
                    ?.label || order.payment_method;
                const items = order.order_items || [];
                return (
                  <article
                    key={order.id}
                    className="border border-nabat-border bg-white p-5 md:p-6"
                  >
                    <div className="flex flex-wrap justify-between gap-4">
                      <div>
                        <h2 className="font-heading text-lg font-medium">
                          {order.order_number}
                        </h2>
                        <p className="mt-1 font-nav text-sm text-nabat-muted">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                        <p className="mt-2 font-nav text-sm">
                          {order.customer_first_name} {order.customer_last_name} ·{' '}
                          {order.customer_phone}
                        </p>
                        <p className="font-nav text-sm text-nabat-muted">
                          {order.customer_email}
                        </p>
                        <p className="mt-2 font-nav text-sm text-nabat-muted">
                          {order.shipping_address}, {order.shipping_city}
                        </p>
                        <p className="mt-1 font-nav text-xs uppercase tracking-wider text-nabat-accent">
                          {payment}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-xl text-nabat-primary">
                          {formatEGP(order.total)}
                        </p>
                        <select
                          className="input-box mt-3 py-2 text-sm"
                          value={order.status}
                          onChange={(e) => onStatusChange(order.id, e.target.value)}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2 border-t border-nabat-border pt-4">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between font-nav text-sm"
                        >
                          <span>
                            {item.product_name} × {item.quantity}
                          </span>
                          <span>{formatEGP(item.line_total)}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })
            )}
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <input
                className="input-box max-w-xs"
                placeholder="Search products…"
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  setEditing(emptyProduct(categoryNames[0] || 'Succulent'))
                }
              >
                Add product
              </button>
            </div>

            {editing && (
              <form
                onSubmit={saveProduct}
                className="mb-8 border border-nabat-border bg-white p-6"
              >
                <h3 className="font-heading text-lg font-medium">
                  {editing.dbId || products.some((p) => p.id === editing.id)
                    ? 'Edit product'
                    : 'New product'}
                </h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Slug / ID (english, no spaces)">
                    <input
                      className="input-box"
                      value={editing.id}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          id: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, ''),
                        })
                      }
                      required
                    />
                  </Field>
                  <Field label="Category">
                    <select
                      className="input-box"
                      value={editing.category}
                      onChange={(e) =>
                        setEditing({ ...editing, category: e.target.value })
                      }
                    >
                      {(categoryNames.length
                        ? categoryNames
                        : ['Succulent', 'Indoor Plants', 'Outdoor Plants']
                      ).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Name (EN)">
                    <input
                      className="input-box"
                      value={editing.name}
                      onChange={(e) =>
                        setEditing({ ...editing, name: e.target.value })
                      }
                      required
                    />
                  </Field>
                  <Field label="Name (AR)">
                    <input
                      className="input-box"
                      dir="rtl"
                      value={editing.nameAr || ''}
                      onChange={(e) =>
                        setEditing({ ...editing, nameAr: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Price (EGP)">
                    <input
                      type="number"
                      min="0"
                      className="input-box"
                      value={editing.price}
                      onChange={(e) =>
                        setEditing({ ...editing, price: e.target.value })
                      }
                      required
                    />
                  </Field>
                  <Field label="Stock">
                    <input
                      type="number"
                      min="0"
                      className="input-box"
                      value={editing.stock}
                      onChange={(e) =>
                        setEditing({ ...editing, stock: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Light needs">
                    <input
                      className="input-box"
                      placeholder="e.g. bright indirect"
                      value={editing.light || ''}
                      onChange={(e) =>
                        setEditing({ ...editing, light: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Care level">
                    <input
                      className="input-box"
                      placeholder="e.g. easy"
                      value={editing.care || ''}
                      onChange={(e) =>
                        setEditing({ ...editing, care: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Image URL (or keep existing)">
                    <input
                      className="input-box"
                      value={
                        typeof editing.image === 'string' ? editing.image : ''
                      }
                      onChange={(e) =>
                        setEditing({ ...editing, image: e.target.value })
                      }
                      placeholder="https://… or leave blank to keep local image"
                    />
                  </Field>
                  <Field label="Sort order">
                    <input
                      type="number"
                      className="input-box"
                      value={editing.sortOrder || 0}
                      onChange={(e) =>
                        setEditing({ ...editing, sortOrder: e.target.value })
                      }
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Description (EN)">
                      <textarea
                        className="input-box"
                        rows={4}
                        value={editing.description || ''}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            description: e.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Description (AR)">
                      <textarea
                        className="input-box"
                        rows={4}
                        dir="rtl"
                        value={editing.descriptionAr || ''}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            descriptionAr: e.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 font-nav text-sm">
                  {[
                    ['isFeatured', 'Featured'],
                    ['isRecent', 'Recent'],
                    ['isActive', 'Active / visible'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!editing[key]}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            [key]: e.target.checked,
                          })
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {editing.image && typeof editing.image !== 'string' && (
                  <p className="mt-3 font-nav text-xs text-nabat-muted">
                    Using bundled local image for this plant.
                  </p>
                )}
                {typeof editing.image === 'string' && editing.image && (
                  <img
                    src={editing.image}
                    alt=""
                    className="mt-3 h-24 w-24 object-cover bg-nabat-mist"
                  />
                )}
                <div className="mt-5 flex gap-3">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save product'}
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto border border-nabat-border bg-white">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-nabat-border font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted">
                    <th className="p-4">Product</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Flags</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-nabat-border font-nav text-sm"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img
                              src={product.image}
                              alt=""
                              className="h-12 w-12 object-cover bg-nabat-mist"
                            />
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-nabat-muted">
                              {product.category} · {product.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{formatEGP(product.price)}</td>
                      <td className="p-4">{product.stock}</td>
                      <td className="p-4 text-xs text-nabat-muted">
                        {[
                          product.isFeatured && 'Featured',
                          product.isRecent && 'Recent',
                          !product.isActive && 'Hidden',
                          product.stock <= 0 && 'OOS',
                        ]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </td>
                      <td className="space-x-3 p-4 text-right">
                        <button
                          type="button"
                          className="text-nabat-accent hover:underline"
                          onClick={() =>
                            setEditing({
                              ...product,
                              image:
                                typeof product.image === 'string'
                                  ? product.image
                                  : '',
                              _localImage: product.image,
                            })
                          }
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:underline"
                          onClick={() => removeProduct(product)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CATEGORIES */}
        {tab === 'categories' && (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setEditingCat(emptyCategory())}
              >
                Add category
              </button>
            </div>
            {editingCat && (
              <form
                onSubmit={saveCat}
                className="mb-8 border border-nabat-border bg-white p-6"
              >
                <h3 className="font-heading text-lg font-medium">
                  Category details
                </h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Slug">
                    <input
                      className="input-box"
                      value={editingCat.id}
                      onChange={(e) =>
                        setEditingCat({
                          ...editingCat,
                          id: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, '-'),
                        })
                      }
                      required
                    />
                  </Field>
                  <Field label="Sort order">
                    <input
                      type="number"
                      className="input-box"
                      value={editingCat.sortOrder}
                      onChange={(e) =>
                        setEditingCat({
                          ...editingCat,
                          sortOrder: e.target.value,
                        })
                      }
                    />
                  </Field>
                  <Field label="Name (EN)">
                    <input
                      className="input-box"
                      value={editingCat.name}
                      onChange={(e) =>
                        setEditingCat({ ...editingCat, name: e.target.value })
                      }
                      required
                    />
                  </Field>
                  <Field label="Name (AR)">
                    <input
                      className="input-box"
                      dir="rtl"
                      value={editingCat.nameAr || ''}
                      onChange={(e) =>
                        setEditingCat({
                          ...editingCat,
                          nameAr: e.target.value,
                        })
                      }
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Description (EN)">
                      <textarea
                        className="input-box"
                        rows={3}
                        value={editingCat.description || ''}
                        onChange={(e) =>
                          setEditingCat({
                            ...editingCat,
                            description: e.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Description (AR)">
                      <textarea
                        className="input-box"
                        rows={3}
                        dir="rtl"
                        value={editingCat.descriptionAr || ''}
                        onChange={(e) =>
                          setEditingCat({
                            ...editingCat,
                            descriptionAr: e.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                </div>
                <label className="mt-3 flex items-center gap-2 font-nav text-sm">
                  <input
                    type="checkbox"
                    checked={editingCat.isActive !== false}
                    onChange={(e) =>
                      setEditingCat({
                        ...editingCat,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
                <div className="mt-4 flex gap-3">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    Save category
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setEditingCat(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            <div className="space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex flex-wrap items-start justify-between gap-4 border border-nabat-border bg-white p-5"
                >
                  <div>
                    <h3 className="font-heading text-lg font-medium">
                      {cat.name}
                      {cat.nameAr ? (
                        <span className="ml-2 font-nav text-sm text-nabat-muted">
                          · {cat.nameAr}
                        </span>
                      ) : null}
                    </h3>
                    <p className="mt-1 font-nav text-sm text-nabat-muted">
                      {cat.description || 'No description'}
                    </p>
                    <p className="mt-1 font-nav text-xs text-nabat-muted">
                      slug: {cat.id} · sort {cat.sortOrder}
                      {!cat.isActive ? ' · hidden' : ''}
                    </p>
                  </div>
                  <div className="flex gap-3 font-nav text-sm">
                    <button
                      type="button"
                      className="text-nabat-accent hover:underline"
                      onClick={() => setEditingCat(cat)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={() => removeCat(cat)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SITE TEXTS */}
        {tab === 'content' && (
          <div className="space-y-8">
            {[
              ['hero', 'Hero', ['eyebrow', 'tagline', 'cta']],
              [
                'home',
                'Home sections',
                [
                  'featuredTitle',
                  'featuredSubtitle',
                  'recentTitle',
                  'recentSubtitle',
                  'socialTitle',
                  'socialSubtitle',
                ],
              ],
              ['about', 'About page', ['eyebrow', 'title', 'body', 'bodyAr']],
              [
                'contact',
                'Contact page',
                ['eyebrow', 'title', 'subtitle', 'locationLabel', 'location'],
              ],
              ['footer', 'Footer', ['tagline']],
              ['shop', 'Shop banner', ['bannerEyebrow', 'bannerTitle']],
            ].map(([section, title, fields]) => (
              <div
                key={section}
                className="border border-nabat-border bg-white p-6"
              >
                <h3 className="font-heading text-lg font-medium">{title}</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {fields.map((field) => (
                    <div
                      key={field}
                      className={
                        field === 'body' || field === 'bodyAr' || field === 'subtitle'
                          ? 'md:col-span-2'
                          : ''
                      }
                    >
                      <Field label={field}>
                        {field === 'body' ||
                        field === 'bodyAr' ||
                        field === 'subtitle' ||
                        field.includes('Subtitle') ? (
                          <textarea
                            className="input-box"
                            rows={field.startsWith('body') ? 4 : 2}
                            dir={field.endsWith('Ar') ? 'rtl' : undefined}
                            value={content[section]?.[field] || ''}
                            onChange={(e) =>
                              updateContent(section, field, e.target.value)
                            }
                          />
                        ) : (
                          <input
                            className="input-box"
                            dir={field.endsWith('Ar') ? 'rtl' : undefined}
                            value={content[section]?.[field] || ''}
                            onChange={(e) =>
                              updateContent(section, field, e.target.value)
                            }
                          />
                        )}
                      </Field>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn-primary"
              disabled={saving}
              onClick={saveContentSection}
            >
              {saving ? 'Saving…' : 'Save all site texts'}
            </button>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div className="border border-nabat-border bg-white p-6">
            <h3 className="font-heading text-lg font-medium">Store settings</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ['phone', 'Phone'],
                ['email', 'Email'],
                ['paymentNumber', 'Vodafone / Instapay number'],
                ['city', 'City'],
                ['country', 'Country'],
                ['shippingFee', 'Shipping fee (EGP)'],
              ].map(([field, label]) => (
                <Field key={field} label={label}>
                  <input
                    className="input-box"
                    type={field === 'shippingFee' ? 'number' : 'text'}
                    value={content.store?.[field] ?? ''}
                    onChange={(e) =>
                      updateContent('store', field, e.target.value)
                    }
                  />
                </Field>
              ))}
            </div>
            <button
              type="button"
              className="btn-primary mt-6"
              disabled={saving}
              onClick={saveContentSection}
            >
              Save settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
