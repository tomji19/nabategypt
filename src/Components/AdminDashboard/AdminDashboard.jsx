import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PlantLoader from '../PlantLoader/PlantLoader';
import { lockDashboard } from '../DashboardGate/DashboardGate';
import BrandLogo from '../BrandLogo/BrandLogo';
import { fetchAllOrders, updateOrderStatus } from '../../supabase/orders';
import {
  fetchContactMessages,
  markContactMessageRead,
  deleteContactMessage,
} from '../../supabase/contactMessages';
import {
  loadDashboardCatalog,
  saveDashboardProduct,
  deleteDashboardProduct,
  loadCategories,
  saveCategory,
  deleteCategory,
  loadSiteContent,
  saveSiteContentSection,
  probeDashboardSchema,
} from '../../supabase/cms';
import { ORDER_STATUSES, PAYMENT_METHODS } from '../../config/store';
import { formatEGP } from '../../utils/money';
import { useProducts } from '../ProductsContext/ProductsContext';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { useCategories } from '../CategoriesContext/CategoriesContext';
import ImageField from '../ImageField/ImageField';
import SiteContentEditor from './SiteContentEditor';
import HomepageSectionsPanel, {
  HOMEPAGE_SECTIONS,
} from './HomepageSectionsPanel';

const TABS = [
  { id: 'orders', label: 'Orders' },
  { id: 'messages', label: 'Messages' },
  { id: 'products', label: 'Products' },
  { id: 'homepage', label: 'Homepage sections' },
  { id: 'categories', label: 'Categories' },
  { id: 'content', label: 'Site content' },
  { id: 'settings', label: 'Store settings' },
];

const emptyProduct = (category = '') => ({
  id: '',
  name: '',
  nameAr: '',
  category,
  price: 45,
  stock: 10,
  description: '',
  descriptionAr: '',
  image: '',
  hoverImage: '',
  care: '',
  light: '',
  sortOrder: 0,
  isActive: true,
  isFeatured: false,
  isRecent: false,
  isGift: false,
  isEasyCare: false,
});

const emptyCategory = () => ({
  id: '',
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  image: '',
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
  const { patchContent } = useSiteContent();
  const { refreshCategories } = useCategories();
  const [tab, setTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [productFilter, setProductFilter] = useState('');
  const [schemaWarning, setSchemaWarning] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [catalog, cats, site, ords, msgs, schema] = await Promise.all([
        loadDashboardCatalog(),
        loadCategories(),
        loadSiteContent(),
        fetchAllOrders().catch(() => []),
        fetchContactMessages().catch(() => []),
        probeDashboardSchema().catch(() => ({
          ok: true,
          message: '',
        })),
      ]);
      setProducts(catalog.products);
      setCategories(cats.categories);
      setContent(site.content);
      setOrders(ords);
      setMessages(msgs);
      setSchemaWarning(schema?.ok === false ? schema.message || '' : '');
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

  const onToggleMessageRead = async (id, isRead) => {
    try {
      await markContactMessageRead(id, isRead);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: isRead } : m))
      );
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  const onDeleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success('Message deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!editing?.id || !editing?.name) {
      toast.error('Slug and name are required');
      return;
    }
    if (!editing.category) {
      toast.error('Choose a category for this product');
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
        hoverImage:
          (typeof editing.hoverImage === 'string' &&
            editing.hoverImage.trim()) ||
          editing.hoverImage ||
          '',
        isEasyCare: !!editing.isEasyCare,
        care:
          editing.isEasyCare && !editing.care
            ? 'easy'
            : editing.care || '',
      };
      delete payload._localImage;
      try {
        await saveDashboardProduct(payload);
      } catch (err) {
        if (err.code === 'SCHEMA_DRIFT' && err.saved) {
          toast.warn(err.message);
        } else {
          throw err;
        }
      }
      const catalog = await loadDashboardCatalog();
      setProducts(catalog.products);
      setEditing(null);
      await refreshProducts?.();
      const schema = await probeDashboardSchema().catch(() => null);
      setSchemaWarning(schema?.ok === false ? schema.message || '' : '');
      toast.success('Product saved to Supabase');
    } catch (err) {
      toast.error(err.message || 'Save failed — nothing was stored');
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
      try {
        await saveCategory(editingCat);
      } catch (err) {
        if (err.code === 'SCHEMA_DRIFT' && err.saved) {
          toast.warn(err.message);
        } else {
          throw err;
        }
      }
      const cats = await loadCategories();
      setCategories(cats.categories);
      setEditingCat(null);
      await refreshCategories?.();
      const schema = await probeDashboardSchema().catch(() => null);
      setSchemaWarning(schema?.ok === false ? schema.message || '' : '');
      toast.success('Category saved to Supabase');
    } catch (err) {
      toast.error(err.message || 'Save failed — nothing was stored');
    } finally {
      setSaving(false);
    }
  };

  const removeCat = async (cat) => {
    if (!window.confirm(`Delete category ${cat.name}?`)) return;
    try {
      await deleteCategory(cat);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      await refreshCategories?.();
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const saveContentSection = async () => {
    setSaving(true);
    try {
      await saveSiteContentSection('store', content.store || {});
      patchContent?.('store', content.store || {});
      toast.success('Store settings saved');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveEditorSection = async (contentKey, partial, uiKey = contentKey) => {
    setSavingKey(uiKey);
    try {
      const next = await saveSiteContentSection(contentKey, partial);
      setContent((prev) => ({
        ...prev,
        [contentKey]: next,
      }));
      patchContent?.(contentKey, next);
      // Confirm it is still in Supabase
      const site = await loadSiteContent();
      setContent(site.content);
      patchContent?.(contentKey, site.content[contentKey]);
      toast.success('Section saved to Supabase');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSavingKey(null);
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
  const unreadMessages = messages.filter((m) => !m.is_read).length;
  const activeCategoryOptions = categories.filter((c) => c.isActive !== false);
  const categoryNames = activeCategoryOptions.map((c) => c.name);
  const filteredProducts = products.filter((p) => {
    const q = productFilter.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  const openProductEditor = (product) => {
    const fallbackCategory = categoryNames[0] || '';
    const next = product
      ? {
          ...product,
          category: product.category || fallbackCategory,
          image: typeof product.image === 'string' ? product.image : '',
          hoverImage:
            typeof product.hoverImage === 'string' ? product.hoverImage : '',
          isEasyCare: !!product.isEasyCare,
          _localImage: product.image,
        }
      : emptyProduct(fallbackCategory);
    setEditing(next);
    requestAnimationFrame(() => {
      document.getElementById('dashboard-product-editor')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const openCategoryEditor = (cat) => {
    const next = cat
      ? {
          ...cat,
          image: typeof cat.image === 'string' ? cat.image : '',
        }
      : emptyCategory();
    setEditingCat(next);
    requestAnimationFrame(() => {
      document.getElementById('dashboard-category-editor')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  return (
    <div className="leaf-wash min-h-screen">
      <div className="border-b border-nabat-border bg-nabat-primary text-white">
        <div className="section-pad flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <BrandLogo imgClassName="mb-2 h-9 w-auto object-contain brightness-0 invert" />
            <p className="font-nav text-[11px] uppercase tracking-[0.2em] text-white/70">
              Dashboard · Connected to Supabase
            </p>
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
        {schemaWarning ? (
          <div className="mb-6 border border-amber-300 bg-amber-50 px-4 py-3 font-nav text-sm text-amber-950">
            <p className="font-semibold">Supabase schema update required</p>
            <p className="mt-1">{schemaWarning}</p>
            <p className="mt-2 text-xs text-amber-900/80">
              Open Supabase → SQL Editor → paste and run{' '}
              <code className="bg-white/80 px-1">scripts/ensure-dashboard-schema.sql</code>
              , then click Refresh here and save your images/flags again.
            </p>
          </div>
        ) : null}
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
              Messages / Unread
            </p>
            <p className="mt-2 font-heading text-3xl text-nabat-primary">
              {messages.length} / {unreadMessages}
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
              {t.id === 'messages' && unreadMessages > 0
                ? ` (${unreadMessages})`
                : ''}
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

        {/* MESSAGES */}
        {tab === 'messages' && (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="border border-nabat-border bg-white p-10 text-center font-body text-nabat-muted">
                No contact messages yet. They appear here when someone submits the
                contact form. If submit fails, run{' '}
                <code className="bg-nabat-mist px-1">scripts/contact-messages.sql</code>{' '}
                in Supabase.
              </div>
            ) : (
              messages.map((msg) => (
                <article
                  key={msg.id}
                  className={`border bg-white p-5 md:p-6 ${
                    msg.is_read
                      ? 'border-nabat-border'
                      : 'border-nabat-accent/40 bg-nabat-mist/40'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-heading text-lg font-medium">
                          {msg.name}
                        </h2>
                        {!msg.is_read ? (
                          <span className="font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-accent">
                            New
                          </span>
                        ) : null}
                      </div>
                      <a
                        href={`mailto:${msg.email}`}
                        className="mt-1 block font-nav text-sm text-nabat-accent hover:underline"
                        dir="ltr"
                      >
                        {msg.email}
                      </a>
                      <p className="mt-1 font-nav text-xs text-nabat-muted">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn-outline !px-4 !py-2"
                        onClick={() =>
                          onToggleMessageRead(msg.id, !msg.is_read)
                        }
                      >
                        {msg.is_read ? 'Mark unread' : 'Mark read'}
                      </button>
                      <button
                        type="button"
                        className="border border-nabat-border px-4 py-2 font-nav text-xs uppercase tracking-[0.14em] text-nabat-muted hover:border-red-400 hover:text-red-600"
                        onClick={() => onDeleteMessage(msg.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap border-t border-nabat-border pt-4 font-body text-sm leading-relaxed text-nabat-text">
                    {msg.message}
                  </p>
                </article>
              ))
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
                onClick={() => openProductEditor(null)}
              >
                Add product
              </button>
            </div>

            {editing && (
              <form
                id="dashboard-product-editor"
                key={editing.dbId || editing.id || 'new-product'}
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
                        setEditing((prev) => ({
                          ...prev,
                          id: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, ''),
                        }))
                      }
                      required
                    />
                  </Field>
                  <Field label="Category (from Categories tab)">
                    <select
                      className="input-box"
                      value={editing.category || ''}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="" disabled>
                        Select a category…
                      </option>
                      {activeCategoryOptions.length ? (
                        activeCategoryOptions.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                            {c.nameAr ? ` · ${c.nameAr}` : ''}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Add a category first
                        </option>
                      )}
                    </select>
                  </Field>
                  <Field label="Name (EN)">
                    <input
                      className="input-box"
                      value={editing.name}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
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
                        setEditing((prev) => ({
                          ...prev,
                          nameAr: e.target.value,
                        }))
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
                        setEditing((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
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
                        setEditing((prev) => ({
                          ...prev,
                          stock: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Light needs">
                    <input
                      className="input-box"
                      placeholder="e.g. bright indirect"
                      value={editing.light || ''}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          light: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Care level (shop filter)">
                    <select
                      className="input-box"
                      value={editing.care || ''}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          care: e.target.value,
                          isEasyCare:
                            e.target.value === 'easy'
                              ? true
                              : prev.isEasyCare,
                        }))
                      }
                    >
                      <option value="">Not set</option>
                      <option value="easy">easy</option>
                      <option value="moderate">moderate</option>
                      <option value="expert">expert</option>
                    </select>
                  </Field>
                  <div className="md:col-span-2">
                    <ImageField
                      key={`img-${editing.dbId || editing.id || 'new'}`}
                      label="Product image"
                      value={
                        typeof editing.image === 'string' ? editing.image : ''
                      }
                      onChange={(url) =>
                        setEditing((prev) => ({ ...prev, image: url }))
                      }
                      folder="catalog"
                      hint="Drag & drop, browse, or paste a URL"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImageField
                      key={`hover-${editing.dbId || editing.id || 'new'}`}
                      label="Hover image (optional)"
                      value={
                        typeof editing.hoverImage === 'string'
                          ? editing.hoverImage
                          : ''
                      }
                      onChange={(url) =>
                        setEditing((prev) => ({ ...prev, hoverImage: url }))
                      }
                      folder="catalog"
                      hint="Shown when hovering a product card"
                    />
                  </div>
                  <Field label="Sort order">
                    <input
                      type="number"
                      className="input-box"
                      value={editing.sortOrder || 0}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          sortOrder: e.target.value,
                        }))
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
                          setEditing((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
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
                          setEditing((prev) => ({
                            ...prev,
                            descriptionAr: e.target.value,
                          }))
                        }
                      />
                    </Field>
                  </div>
                </div>
                <div className="mt-6 border border-nabat-border bg-nabat-soft/40 p-4">
                  <p className="font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted">
                    Homepage sections
                  </p>
                  <p className="mt-1 font-nav text-xs text-nabat-muted">
                    Or manage all plants at once under the{' '}
                    <button
                      type="button"
                      className="text-nabat-accent underline"
                      onClick={() => setTab('homepage')}
                    >
                      Homepage sections
                    </button>{' '}
                    tab.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 font-nav text-sm">
                    {HOMEPAGE_SECTIONS.map((s) => (
                      <label key={s.flag} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!editing[s.flag]}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [s.flag]: e.target.checked,
                              ...(s.flag === 'isEasyCare' && e.target.checked
                                ? { care: prev.care || 'easy' }
                                : {}),
                            }))
                          }
                        />
                        {s.label}
                      </label>
                    ))}
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editing.isActive !== false}
                        onChange={(e) =>
                          setEditing((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                      />
                      Active / visible in shop
                    </label>
                  </div>
                </div>
                {editing.image && typeof editing.image !== 'string' && (
                  <p className="mt-3 font-nav text-xs text-nabat-muted">
                    Using bundled local image for this plant until you upload or paste a URL.
                  </p>
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
                          product.isRecent && 'Seasonal',
                          product.isEasyCare && 'Easy care',
                          product.isGift && 'Gift',
                          product.isFeatured && 'Bestseller',
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
                          onClick={() => openProductEditor(product)}
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

        {/* HOMEPAGE SECTIONS */}
        {tab === 'homepage' && (
          <HomepageSectionsPanel
            products={products}
            onProductsChange={setProducts}
            onStorefrontRefresh={refreshProducts}
          />
        )}

        {/* CATEGORIES */}
        {tab === 'categories' && (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                className="btn-primary"
                onClick={() => openCategoryEditor(null)}
              >
                Add category
              </button>
            </div>
            {editingCat && (
              <form
                id="dashboard-category-editor"
                key={editingCat.dbId || editingCat.id || 'new-category'}
                onSubmit={saveCat}
                className="mb-8 border border-nabat-border bg-white p-6"
              >
                <h3 className="font-heading text-lg font-medium">
                  {editingCat.dbId ? 'Edit category' : 'New category'}
                </h3>
                <p className="mt-1 font-nav text-xs text-nabat-muted">
                  Active categories appear on the homepage, navbar, and shop
                  filters. Use the same English name when assigning products.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <ImageField
                      key={`cat-img-${editingCat.dbId || editingCat.id || 'new'}`}
                      label="Category image (homepage browse)"
                      value={editingCat.image || ''}
                      onChange={(url) =>
                        setEditingCat((prev) => ({ ...prev, image: url }))
                      }
                      folder="cms/categories"
                      hint="Drag & drop, browse, or paste a URL — shown on homepage tiles"
                    />
                  </div>
                  <Field label="Slug">
                    <input
                      className="input-box"
                      value={editingCat.id}
                      onChange={(e) =>
                        setEditingCat((prev) => ({
                          ...prev,
                          id: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, '-'),
                        }))
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
                        setEditingCat((prev) => ({
                          ...prev,
                          sortOrder: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Name (EN)">
                    <input
                      className="input-box"
                      value={editingCat.name}
                      onChange={(e) =>
                        setEditingCat((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
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
                        setEditingCat((prev) => ({
                          ...prev,
                          nameAr: e.target.value,
                        }))
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
                          setEditingCat((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
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
                          setEditingCat((prev) => ({
                            ...prev,
                            descriptionAr: e.target.value,
                          }))
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
                      setEditingCat((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
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
                  key={cat.dbId || cat.id}
                  className="flex flex-wrap items-start justify-between gap-4 border border-nabat-border bg-white p-5"
                >
                  <div className="flex min-w-0 flex-1 gap-4">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt=""
                        className="h-16 w-16 shrink-0 object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-nabat-soft font-nav text-[10px] uppercase tracking-wider text-nabat-muted">
                        No img
                      </div>
                    )}
                    <div className="min-w-0">
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
                  </div>
                  <div className="flex gap-3 font-nav text-sm">
                    <button
                      type="button"
                      className="text-nabat-accent hover:underline"
                      onClick={() => openCategoryEditor(cat)}
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

        {/* SITE CONTENT (partitioned, per-section save) */}
        {tab === 'content' && (
          <div className="space-y-6">
            <SiteContentEditor
              content={content}
              onChange={setContent}
              onSaveSection={saveEditorSection}
              savingKey={savingKey}
            />
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
