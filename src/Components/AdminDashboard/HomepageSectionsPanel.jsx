import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { saveDashboardProduct } from '../../supabase/cms';
import { formatEGP } from '../../utils/money';

export const HOMEPAGE_SECTIONS = [
  {
    id: 'seasonal',
    flag: 'isRecent',
    label: "Seasonal picks",
    hint: "This week's seasonal picks on the homepage",
  },
  {
    id: 'easy',
    flag: 'isEasyCare',
    label: 'Easy care',
    hint: 'Great for first-time buyers',
  },
  {
    id: 'gift',
    flag: 'isGift',
    label: 'Gift ready',
    hint: 'A living gift for someone you love',
  },
  {
    id: 'bestsellers',
    flag: 'isFeatured',
    label: 'Bestsellers',
    hint: 'Greenhouse favorites / most loved',
  },
];

/**
 * Pick which products appear in each homepage merchandising section.
 */
export default function HomepageSectionsPanel({
  products,
  onProductsChange,
  onStorefrontRefresh,
}) {
  const [activeSection, setActiveSection] = useState(HOMEPAGE_SECTIONS[0].id);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('');

  const section = HOMEPAGE_SECTIONS.find((s) => s.id === activeSection);

  const list = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return (products || [])
      .filter((p) => p.isActive !== false)
      .filter((p) => {
        if (!q) return true;
        return (
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q)
        );
      })
      .slice()
      .sort((a, b) => {
        const aOn = !!a[section.flag];
        const bOn = !!b[section.flag];
        if (aOn !== bOn) return aOn ? -1 : 1;
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
  }, [products, filter, section]);

  const selectedCount = (products || []).filter(
    (p) => p.isActive !== false && p[section.flag]
  ).length;

  const toggle = async (product, nextValue) => {
    setBusyId(product.id);
    try {
      const payload = {
        ...product,
        [section.flag]: nextValue,
      };
      // Keep shop care filter in sync when assigning Easy care section
      if (section.flag === 'isEasyCare') {
        if (nextValue && !payload.care) payload.care = 'easy';
      }
      const saved = await saveDashboardProduct(payload);
      onProductsChange((prev) =>
        prev.map((p) => (p.id === saved.id || p.dbId === saved.dbId ? saved : p))
      );
      await onStorefrontRefresh?.();
      toast.success(
        nextValue
          ? `${saved.name} → ${section.label}`
          : `${saved.name} removed from ${section.label}`
      );
    } catch (err) {
      if (err.code === 'SCHEMA_DRIFT' && err.saved) {
        onProductsChange((prev) =>
          prev.map((p) =>
            p.id === err.saved.id || p.dbId === err.saved.dbId ? err.saved : p
          )
        );
        toast.warn(err.message);
      } else {
        toast.error(err.message || 'Could not update section');
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg font-medium">Homepage sections</h3>
        <p className="mt-1 max-w-2xl font-nav text-sm text-nabat-muted">
          Choose which products appear in each homepage block. Tick a plant to
          add it; untick to remove. Changes save to Supabase immediately.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {HOMEPAGE_SECTIONS.map((s) => {
          const count = (products || []).filter(
            (p) => p.isActive !== false && p[s.flag]
          ).length;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className={`font-nav text-xs uppercase tracking-[0.12em] px-3 py-2 transition-colors ${
                activeSection === s.id
                  ? 'bg-nabat-primary text-white'
                  : 'bg-white text-nabat-muted border border-nabat-border hover:border-nabat-primary'
              }`}
            >
              {s.label}
              <span className="ms-2 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="border border-nabat-border bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted">
              Editing section
            </p>
            <h4 className="font-heading text-xl font-medium">{section.label}</h4>
            <p className="mt-1 font-nav text-sm text-nabat-muted">{section.hint}</p>
            <p className="mt-2 font-nav text-xs text-nabat-accent">
              {selectedCount} product{selectedCount === 1 ? '' : 's'} selected
            </p>
          </div>
          <input
            className="input-box max-w-xs"
            placeholder="Filter products…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <ul className="mt-5 divide-y divide-nabat-border border border-nabat-border">
          {list.length === 0 ? (
            <li className="p-4 font-nav text-sm text-nabat-muted">
              No products match. Add products under the Products tab first.
            </li>
          ) : (
            list.map((product) => {
              const on = !!product[section.flag];
              const busy = busyId === product.id;
              return (
                <li
                  key={product.dbId || product.id}
                  className="flex flex-wrap items-center gap-4 p-3"
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--nabat-primary,#1f3d2b)]"
                      checked={on}
                      disabled={busy}
                      onChange={(e) => toggle(product, e.target.checked)}
                    />
                    {product.image ? (
                      <img
                        src={product.image}
                        alt=""
                        className="h-12 w-12 object-cover"
                      />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center bg-nabat-soft text-[10px] text-nabat-muted">
                        —
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block font-heading text-base font-medium">
                        {product.name}
                      </span>
                      <span className="block font-nav text-xs text-nabat-muted">
                        {product.category || 'No category'} ·{' '}
                        {formatEGP(product.price)}
                      </span>
                    </span>
                  </label>
                  {busy ? (
                    <span className="font-nav text-xs text-nabat-muted">Saving…</span>
                  ) : on ? (
                    <span className="font-nav text-[10px] uppercase tracking-[0.12em] text-nabat-accent">
                      On homepage
                    </span>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
