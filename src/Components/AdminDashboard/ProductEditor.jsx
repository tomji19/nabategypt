import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ImageField from '../ImageField/ImageField';
import MultiImageField from './MultiImageField';
import { HOMEPAGE_SECTIONS } from './HomepageSectionsPanel';
import { formatEGP } from '../../utils/money';
import {
  CARE_OPTIONS,
  LETTER_SIZE_PRESETS,
  LIGHT_OPTIONS,
  SIZE_TYPES,
  getDisplayPrice,
  isSalePrice,
  normalizeCompareAt,
  normalizeSizeOptions,
  shouldShowFromPrice,
} from '../../utils/productSizes';

function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function Field({ label, children, className = '' }) {
  return (
    <div className={`block font-nav text-xs text-nabat-muted ${className}`}>
      <span className="mb-1.5 block uppercase tracking-[0.12em]">{label}</span>
      {children}
    </div>
  );
}

function ChipGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="mb-1.5 font-nav text-xs uppercase tracking-[0.12em] text-nabat-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = (value || '') === opt.value;
          return (
            <button
              key={opt.value || 'any'}
              type="button"
              className={`border px-3 py-1.5 font-nav text-sm ${
                active
                  ? 'border-nabat-primary bg-nabat-primary text-white'
                  : 'border-nabat-border bg-white text-nabat-text hover:border-nabat-primary'
              }`}
              onClick={() => onChange(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Simple product create/edit — sizes own all pricing.
 */
export default function ProductEditor({
  editing,
  setEditing,
  categories,
  saving,
  onSave,
  onCancel,
  isNew,
}) {
  const [sizeDraft, setSizeDraft] = useState('');
  const [sizePriceDraft, setSizePriceDraft] = useState('');
  const [sizeWasDraft, setSizeWasDraft] = useState('');
  const [showOptional, setShowOptional] = useState(false);

  const sizeType = editing.sizeType || 'letter';
  const sizeOptions = normalizeSizeOptions(editing.sizeOptions, 0);

  const setSizeType = (nextType) => {
    setSizeDraft('');
    setSizePriceDraft('');
    setSizeWasDraft('');
    setEditing((prev) => ({
      ...prev,
      sizeType: nextType,
      sizeOptions: [],
    }));
  };

  const updateSizeField = (value, patch) => {
    setEditing((prev) => {
      const current = normalizeSizeOptions(prev.sizeOptions, 0);
      const exists = current.some((o) => o.value === value);
      if (!exists) {
        return {
          ...prev,
          sizeOptions: [
            ...current,
            {
              value,
              price: Number(patch.price) || 0,
              compareAtPrice: normalizeCompareAt(patch.compareAtPrice),
            },
          ],
        };
      }
      return {
        ...prev,
        sizeOptions: current.map((o) =>
          o.value === value ? { ...o, ...patch } : o
        ),
      };
    });
  };

  const removeSize = (value) => {
    setEditing((prev) => ({
      ...prev,
      sizeOptions: normalizeSizeOptions(prev.sizeOptions, 0).filter(
        (o) => o.value !== value
      ),
    }));
  };

  const addCustomSize = () => {
    const value = String(sizeDraft || '').trim();
    const price = Number(sizePriceDraft);
    if (!value) {
      toast.error('Enter a size');
      return;
    }
    if (!(price > 0)) {
      toast.error('Enter a price');
      return;
    }
    const compareAtPrice = normalizeCompareAt(sizeWasDraft);
    if (compareAtPrice != null && !(compareAtPrice > price)) {
      toast.error('“Was” must be higher than price');
      return;
    }
    setEditing((prev) => ({
      ...prev,
      sizeOptions: normalizeSizeOptions(
        [
          ...normalizeSizeOptions(prev.sizeOptions, 0).filter(
            (o) => o.value !== value
          ),
          { value, price, compareAtPrice },
        ],
        0
      ),
    }));
    setSizeDraft('');
    setSizePriceDraft('');
    setSizeWasDraft('');
  };

  const sizeLabel = (value) => {
    if (sizeType === 'cm') return `${value} cm`;
    if (sizeType === 'meter') return `${value} m`;
    return value;
  };

  return (
    <form
      id="dashboard-product-editor"
      onSubmit={onSave}
      className="mb-8 border border-nabat-border bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nabat-border px-4 py-3 md:px-5">
        <h3 className="font-heading text-lg font-medium">
          {isNew ? 'New product' : `Edit · ${editing.name || 'Product'}`}
        </h3>
        <div className="flex gap-2">
          <button type="button" className="btn-outline !px-4 !py-2" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary !px-5 !py-2" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="space-y-6 p-4 md:p-5">
        <section>
          <p className="mb-3 font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted">
            Product info
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Name" className="sm:col-span-2">
              <input
                className="input-box"
                value={editing.name}
                placeholder="Snake plant"
                required
                onChange={(e) => {
                  const name = e.target.value;
                  setEditing((prev) => ({
                    ...prev,
                    name,
                    ...(isNew ? { id: slugify(name) || prev.id } : {}),
                  }));
                }}
              />
            </Field>
            <Field label="Category">
              <select
                className="input-box"
                value={editing.category || ''}
                required
                onChange={(e) =>
                  setEditing((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="" disabled>
                  Choose…
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stock">
              <input
                type="number"
                min="0"
                className="input-box"
                value={editing.stock}
                onChange={(e) =>
                  setEditing((prev) => ({ ...prev, stock: e.target.value }))
                }
              />
              <span
                className={`mt-1 block text-[10px] normal-case tracking-normal ${
                  Number(editing.stock) > 0
                    ? 'text-nabat-accent'
                    : 'text-red-600'
                }`}
              >
                {Number(editing.stock) > 0 ? 'In stock' : 'Out of stock'}
              </span>
            </Field>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ChipGroup
              label="Light"
              options={LIGHT_OPTIONS}
              value={editing.light || ''}
              onChange={(light) => setEditing((prev) => ({ ...prev, light }))}
            />
            <ChipGroup
              label="Care level"
              options={CARE_OPTIONS}
              value={editing.care || ''}
              onChange={(care) =>
                setEditing((prev) => ({
                  ...prev,
                  care,
                  isEasyCare: care === 'easy' ? true : prev.isEasyCare,
                }))
              }
            />
          </div>
        </section>

        {/* Photos */}
        <section className="border-t border-nabat-border pt-5">
          <p className="mb-3 font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted">
            Photos
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <ImageField
              key={`img-${editing.dbId || editing.id || 'new'}`}
              label="Main photo"
              value={typeof editing.image === 'string' ? editing.image : ''}
              onChange={(url) => setEditing((prev) => ({ ...prev, image: url }))}
              folder="catalog"
              hint="Shown on shop cards"
            />
            <ImageField
              key={`hover-${editing.dbId || editing.id || 'new'}`}
              label="Hover photo (optional)"
              value={
                typeof editing.hoverImage === 'string' ? editing.hoverImage : ''
              }
              onChange={(url) =>
                setEditing((prev) => ({ ...prev, hoverImage: url }))
              }
              folder="catalog"
              hint="Optional second angle"
            />
          </div>
          <div className="mt-4">
            <MultiImageField
              label="Extra gallery photos"
              values={editing.galleryImages || []}
              onChange={(galleryImages) =>
                setEditing((prev) => ({ ...prev, galleryImages }))
              }
              folder="catalog"
              hint="Pick many images in one go"
            />
          </div>
        </section>

        {/* Sizes — required; own all pricing */}
        <section className="border-t border-nabat-border pt-5">
          <p className="mb-1 font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted">
            Sizes &amp; prices
          </p>
          <p className="mb-3 font-nav text-xs text-nabat-muted">
            Pick a type, then set a price for each size you sell.
          </p>

          <ChipGroup
            label="Size type"
            options={SIZE_TYPES.map((s) => ({
              value: s.id,
              label:
                s.id === 'letter' ? 'S / M / L / LG' : s.id === 'cm' ? 'cm' : 'm',
            }))}
            value={sizeType}
            onChange={setSizeType}
          />

          <div className="mt-4 space-y-2">
            {sizeType === 'letter' ? (
              LETTER_SIZE_PRESETS.map((letter) => {
                const opt = sizeOptions.find((o) => o.value === letter);
                const active = Boolean(opt);
                return (
                  <div
                    key={letter}
                    className={`flex flex-wrap items-center gap-2 border px-3 py-2 ${
                      active
                        ? 'border-nabat-primary bg-white'
                        : 'border-nabat-border bg-nabat-mist/40'
                    }`}
                  >
                    <button
                      type="button"
                      className={`min-w-[2.75rem] border px-2 py-1.5 font-nav text-sm ${
                        active
                          ? 'border-nabat-primary bg-nabat-primary text-white'
                          : 'border-nabat-border bg-white'
                      }`}
                      onClick={() => {
                        if (active) removeSize(letter);
                        else updateSizeField(letter, { price: '', compareAtPrice: null });
                      }}
                    >
                      {letter}
                    </button>
                    {active ? (
                      <>
                        <input
                          type="number"
                          min="0"
                          className="input-box !w-28 !py-1.5"
                          placeholder="Price"
                          value={opt?.price || ''}
                          onChange={(e) =>
                            updateSizeField(letter, {
                              price: e.target.value,
                              compareAtPrice: opt?.compareAtPrice,
                            })
                          }
                        />
                        <input
                          type="number"
                          min="0"
                          className="input-box !w-28 !py-1.5"
                          placeholder="Was (optional)"
                          value={
                            opt?.compareAtPrice == null
                              ? ''
                              : opt.compareAtPrice
                          }
                          onChange={(e) =>
                            updateSizeField(letter, {
                              price: opt?.price,
                              compareAtPrice:
                                e.target.value === ''
                                  ? null
                                  : e.target.value,
                            })
                          }
                        />
                        <span className="font-nav text-xs text-nabat-muted">
                          EGP
                        </span>
                        {isSalePrice(opt?.price, opt?.compareAtPrice) && (
                          <span className="font-nav text-[10px] text-nabat-accent">
                            Sale
                          </span>
                        )}
                        <button
                          type="button"
                          className="ms-auto font-nav text-xs text-red-600 hover:underline"
                          onClick={() => removeSize(letter)}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <span className="font-nav text-xs text-nabat-muted">
                        Click to add this size
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <>
                {sizeOptions.map((opt) => (
                  <div
                    key={opt.value}
                    className="flex flex-wrap items-center gap-2 border border-nabat-border px-3 py-2"
                  >
                    <span className="min-w-[4rem] font-nav text-sm font-medium text-nabat-text">
                      {sizeLabel(opt.value)}
                    </span>
                    <input
                      type="number"
                      min="0"
                      className="input-box !w-28 !py-1.5"
                      placeholder="Price"
                      value={opt.price}
                      onChange={(e) =>
                        updateSizeField(opt.value, {
                          price: e.target.value,
                          compareAtPrice: opt.compareAtPrice,
                        })
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      className="input-box !w-28 !py-1.5"
                      placeholder="Was (optional)"
                      value={
                        opt.compareAtPrice == null ? '' : opt.compareAtPrice
                      }
                      onChange={(e) =>
                        updateSizeField(opt.value, {
                          price: opt.price,
                          compareAtPrice:
                            e.target.value === '' ? null : e.target.value,
                        })
                      }
                    />
                    <span className="font-nav text-xs text-nabat-muted">EGP</span>
                    <button
                      type="button"
                      className="ms-auto font-nav text-xs text-red-600 hover:underline"
                      onClick={() => removeSize(opt.value)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="flex flex-wrap items-end gap-2 border border-dashed border-nabat-border px-3 py-2">
                  <Field label="Size">
                    <input
                      className="input-box w-24"
                      value={sizeDraft}
                      placeholder={sizeType === 'cm' ? '30' : '1.5'}
                      onChange={(e) => setSizeDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomSize();
                        }
                      }}
                    />
                  </Field>
                  <Field label="Price">
                    <input
                      type="number"
                      min="0"
                      className="input-box w-28"
                      value={sizePriceDraft}
                      placeholder="EGP"
                      onChange={(e) => setSizePriceDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomSize();
                        }
                      }}
                    />
                  </Field>
                  <Field label="Was">
                    <input
                      type="number"
                      min="0"
                      className="input-box w-28"
                      value={sizeWasDraft}
                      placeholder="—"
                      onChange={(e) => setSizeWasDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomSize();
                        }
                      }}
                    />
                  </Field>
                  <button
                    type="button"
                    className="btn-outline !px-4 !py-2"
                    onClick={addCustomSize}
                  >
                    Add size
                  </button>
                </div>
              </>
            )}

            {sizeOptions.length === 0 && (
              <p className="font-nav text-xs text-nabat-muted">
                Add at least one size with a price before saving.
              </p>
            )}
          </div>
        </section>

        {/* Care — after sizes */}
        <section className="border-t border-nabat-border pt-5">
          <p className="mb-1 font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted">
            Care
          </p>
          <p className="mb-3 font-nav text-xs text-nabat-muted">
            Shown on the product page Care section.
          </p>
          <div className="space-y-3">
            <Field label="Care">
              <textarea
                className="input-box"
                rows={3}
                placeholder="Watering, light tips, soil…"
                value={editing.description || ''}
                onChange={(e) =>
                  setEditing((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Care (Arabic)">
              <textarea
                className="input-box"
                rows={3}
                dir="rtl"
                placeholder="نص العناية بالعربية"
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
        </section>

        {/* Optional extras */}
        <section className="border-t border-nabat-border pt-4">
          <button
            type="button"
            className="font-nav text-sm text-nabat-accent hover:underline"
            onClick={() => setShowOptional((v) => !v)}
          >
            {showOptional ? 'Hide' : 'Show'} optional details (Arabic name, homepage)
          </button>
          {showOptional && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Name (Arabic)">
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
              <Field label="Sort">
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
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                {HOMEPAGE_SECTIONS.map((s) => (
                  <label
                    key={s.flag}
                    className="flex items-center gap-2 border border-nabat-border px-3 py-2 font-nav text-sm"
                  >
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
              </div>
            </div>
          )}
        </section>
      </div>
    </form>
  );
}

/** Compact product card — click image to edit */
export function DashboardProductCard({ product, onEdit, onDelete }) {
  const img =
    typeof product.image === 'string' && product.image ? product.image : null;
  const display = getDisplayPrice(product);
  const priceLabel = shouldShowFromPrice(product)
    ? `From ${formatEGP(display.price)}`
    : formatEGP(display.price);

  return (
    <article className="group relative overflow-hidden border border-nabat-border bg-white">
      <button
        type="button"
        onClick={onEdit}
        className="relative block aspect-square w-full overflow-hidden bg-nabat-mist text-left"
      >
        {img ? (
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-nav text-xs text-nabat-muted">
            No photo
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10 text-white">
          <span className="block font-heading text-sm font-medium leading-snug">
            {product.name}
          </span>
          <span className="mt-0.5 flex flex-wrap items-baseline gap-1.5 font-nav text-xs text-white/85">
            <span>{priceLabel}</span>
            {display.onSale && (
              <span className="text-white/55 line-through">
                {formatEGP(display.compareAtPrice)}
              </span>
            )}
            {Number(product.stock) > 0 ? ' · In stock' : ' · Out of stock'}
          </span>
        </span>
        {display.onSale && (
          <span className="absolute left-2 top-2 bg-nabat-primary px-2 py-0.5 font-nav text-[10px] uppercase tracking-wider text-white">
            Sale
          </span>
        )}
        <span className="absolute right-2 top-2 bg-white/95 px-2.5 py-1 font-nav text-[10px] uppercase tracking-wider text-nabat-primary opacity-0 transition-opacity group-hover:opacity-100">
          Edit
        </span>
      </button>
      <div className="flex items-center justify-between gap-2 px-2.5 py-2">
        <p className="truncate font-nav text-[10px] uppercase tracking-[0.12em] text-nabat-muted">
          {product.category || '—'}
        </p>
        <button
          type="button"
          className="shrink-0 font-nav text-[10px] uppercase tracking-wider text-red-600 hover:underline"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
