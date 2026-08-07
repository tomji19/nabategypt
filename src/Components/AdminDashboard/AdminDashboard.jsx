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
import HomepageSectionsPanel from './HomepageSectionsPanel';
import ProductEditor, { DashboardProductCard } from './ProductEditor';
import CustomReceiptPanel from './CustomReceiptPanel';
import {
  normalizeSizeOptions,
  syncProductPriceFromSizes,
} from '../../utils/productSizes';

const TABS = [
  { id: 'orders', label: 'Orders' },
  { id: 'messages', label: 'Messages' },
  { id: 'products', label: 'Products' },
  { id: 'homepage', label: 'Homepage sections' },
  { id: 'categories', label: 'Categories' },
  { id: 'content', label: 'Site content' },
  { id: 'custom-receipt', label: 'Custom Receipt' },
  { id: 'settings', label: 'Store settings' },
];

const emptyProduct = (category = '') => ({
  id: '',
  name: '',
  nameAr: '',
  category,
  price: 0,
  compareAtPrice: null,
  stock: 10,
  description: '',
  descriptionAr: '',
  image: '',
  hoverImage: '',
  galleryImages: [],
  care: '',
  light: '',
  sortOrder: 0,
  isFeatured: false,
  isRecent: false,
  isGift: false,
  isEasyCare: false,
  sizeType: 'letter',
  sizeOptions: [],
});

function withTimeout(promise, ms, label) {
  let timer;
  return Promise.race([
    Promise.resolve(promise).finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms
      );
    }),
  ]);
}

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
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [productFilter, setProductFilter] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [schemaWarning, setSchemaWarning] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const LOAD_MS = 12000;
    try {
      const [catalog, cats, site, ords, msgs, schema] = await Promise.all([
        withTimeout(loadDashboardCatalog(), LOAD_MS, 'Products').catch((err) => {
          console.warn('Dashboard products load failed:', err);
          return { products: [] };
        }),
        withTimeout(loadCategories(), LOAD_MS, 'Categories').catch((err) => {
          console.warn('Dashboard categories load failed:', err);
          return { categories: [] };
        }),
        withTimeout(loadSiteContent(), LOAD_MS, 'Site content').catch((err) => {
          console.warn('Dashboard site content load failed:', err);
          return { content: {} };
        }),
        withTimeout(fetchAllOrders(), LOAD_MS, 'Orders').catch(() => []),
        withTimeout(fetchContactMessages(), LOAD_MS, 'Messages').catch(() => []),
        withTimeout(probeDashboardSchema(), LOAD_MS, 'Schema probe').catch(() => ({
          ok: true,
          message: '',
        })),
      ]);
      setProducts(
        (catalog?.products || [])
          .slice()
          .sort(
            (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)
          )
      );
      setCategories(cats?.categories || []);
      setContent(site?.content && typeof site.content === 'object' ? site.content : {});
      setOrders(ords || []);
      setMessages(msgs || []);
      setSchemaWarning(schema?.ok === false ? schema.message || '' : '');
    } catch (err) {
      console.error(err);
      setContent((prev) => prev || {});
      toast.error(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const failSafe = window.setTimeout(() => setLoading(false), 15000);
    return () => window.clearTimeout(failSafe);
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
    if (!editing?.name) {
      toast.error('Name is required');
      return;
    }
    const slug =
      editing.id ||
      String(editing.name || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    if (!slug) {
      toast.error('Could not create a product ID from the name');
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
        id: slug,
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
        galleryImages: Array.isArray(editing.galleryImages)
          ? editing.galleryImages
              .map((v) => (typeof v === 'string' ? v.trim() : ''))
              .filter(Boolean)
          : [],
        isEasyCare: !!editing.isEasyCare,
        care:
          editing.isEasyCare && !editing.care
            ? 'easy'
            : editing.care || '',
        sizeType: editing.sizeType || 'letter',
        sizeOptions: normalizeSizeOptions(editing.sizeOptions, 0),
        compareAtPrice: null,
      };
      payload.price = syncProductPriceFromSizes(payload.sizeOptions, 0);

      if (!payload.sizeType) {
        toast.error('Choose a size type');
        return;
      }
      if (!payload.sizeOptions.length) {
        toast.error('Add at least one size with a price');
        return;
      }
      if (payload.sizeOptions.some((o) => !(Number(o.price) > 0))) {
        toast.error('Every size needs its own price (EGP)');
        return;
      }
      if (
        payload.sizeOptions.some(
          (o) =>
            o.compareAtPrice != null &&
            !(Number(o.compareAtPrice) > Number(o.price))
        )
      ) {
        toast.error(
          'Each size “Was” price must be higher than its sale price (or leave empty)'
        );
        return;
      }
      delete payload._localImage;

      const isNewProduct =
        !editing.dbId && !products.some((p) => p.id === slug);
      if (isNewProduct) {
        // Lower sort_order shows first — place brand-new plants at the top
        const minSort = products.reduce((min, p) => {
          const n = Number(p.sortOrder);
          return Number.isFinite(n) ? Math.min(min, n) : min;
        }, 0);
        payload.sortOrder = minSort - 1;
      }

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
      const nextProducts = [...(catalog.products || [])].sort(
        (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)
      );
      setProducts(nextProducts);
      if (isNewProduct && payload.category) {
        setProductCategory(payload.category);
        setProductFilter('');
      }
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
      [section]: { ...(prev?.[section] || {}), [field]: value },
    }));
  };

  if (loading) return <PlantLoader variant="overlay" lockScroll={false} />;

  const pendingCount = orders.filter((o) => o.status === 'Processing').length;
  const unreadMessages = messages.filter((m) => !m.is_read).length;
  const activeCategoryOptions = categories.filter((c) => c.isActive !== false);
  const categoryNames = activeCategoryOptions.map((c) => c.name);
  const filteredProducts = products
    .filter((p) => {
      if (productCategory !== 'all' && p.category !== productCategory) {
        return false;
      }
      const q = productFilter.trim().toLowerCase();
      if (!q) return true;
      return (
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q)
      );
    })
    .slice()
    .sort(
      (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)
    );

  const productsByCategory = (() => {
    if (productCategory !== 'all') {
      return [{ name: productCategory, items: filteredProducts }];
    }
    const map = new Map();
    filteredProducts.forEach((p) => {
      const key = p.category || 'Uncategorized';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });
    // Categories with newest products (lowest sort_order) float to the top
    return [...map.entries()]
      .map(([name, items]) => ({
        name,
        items,
        topSort: Math.min(...items.map((p) => Number(p.sortOrder) || 0)),
      }))
      .sort((a, b) => a.topSort - b.topSort);
  })();

  const openProductEditor = (product) => {
    const fallbackCategory = categoryNames[0] || '';
    const next = product
      ? {
          ...product,
          category: product.category || fallbackCategory,
          image: typeof product.image === 'string' ? product.image : '',
          hoverImage:
            typeof product.hoverImage === 'string' ? product.hoverImage : '',
          galleryImages: Array.isArray(product.galleryImages)
            ? [...product.galleryImages]
            : [],
          isEasyCare: !!product.isEasyCare,
          sizeType: product.sizeType || 'letter',
          sizeOptions: normalizeSizeOptions(product.sizeOptions, 0),
          compareAtPrice: null,
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
              <code className="bg-white/80 px-1">scripts/ensure-all-schema.sql</code>
              , then click Refresh here and save your images/flags/sizes again.
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
                            {item.product_name}
                            {item.size ? ` (${item.size})` : ''} ×{' '}
                            {item.quantity}
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
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <h2 className="font-heading text-xl font-medium text-nabat-text sm:me-auto">
                Products
                <span className="ms-2 font-nav text-sm font-normal text-nabat-muted">
                  {filteredProducts.length}
                </span>
              </h2>
              <input
                className="input-box w-full sm:max-w-[14rem]"
                placeholder="Search…"
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
              />
              <button
                type="button"
                className="btn-primary shrink-0"
                onClick={() => openProductEditor(null)}
              >
                + Add product
              </button>
            </div>

            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setProductCategory('all')}
                className={`shrink-0 border px-3 py-1.5 font-nav text-xs uppercase tracking-[0.12em] ${
                  productCategory === 'all'
                    ? 'border-nabat-primary bg-nabat-primary text-white'
                    : 'border-nabat-border bg-white text-nabat-muted hover:border-nabat-primary'
                }`}
              >
                All
              </button>
              {activeCategoryOptions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setProductCategory(c.name)}
                  className={`shrink-0 border px-3 py-1.5 font-nav text-xs uppercase tracking-[0.12em] ${
                    productCategory === c.name
                      ? 'border-nabat-primary bg-nabat-primary text-white'
                      : 'border-nabat-border bg-white text-nabat-muted hover:border-nabat-primary'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {editing && (
              <ProductEditor
                editing={editing}
                setEditing={setEditing}
                categories={activeCategoryOptions}
                saving={saving}
                isNew={
                  !(
                    editing.dbId ||
                    products.some((p) => p.id === editing.id)
                  )
                }
                onSave={saveProduct}
                onCancel={() => setEditing(null)}
              />
            )}

            {filteredProducts.length === 0 ? (
              <div className="border border-nabat-border bg-white p-12 text-center">
                <p className="font-body text-nabat-muted">
                  {productFilter.trim() || productCategory !== 'all'
                    ? 'No products in this view.'
                    : 'No products yet. Add your first plant.'}
                </p>
                {!productFilter.trim() && productCategory === 'all' && (
                  <button
                    type="button"
                    className="btn-primary mt-5"
                    onClick={() => openProductEditor(null)}
                  >
                    + Add product
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {productsByCategory.map((group) => (
                  <section key={group.name}>
                    {productCategory === 'all' && (
                      <h3 className="mb-3 flex items-baseline gap-2 border-b border-nabat-border pb-2 font-heading text-lg font-medium text-nabat-text">
                        {group.name}
                        <span className="font-nav text-xs text-nabat-muted">
                          {group.items.length}
                        </span>
                      </h3>
                    )}
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {group.items.map((product) => (
                        <DashboardProductCard
                          key={product.id}
                          product={product}
                          onEdit={() => openProductEditor(product)}
                          onDelete={() => removeProduct(product)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
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

        {/* CUSTOM RECEIPT */}
        {tab === 'custom-receipt' && <CustomReceiptPanel />}

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
