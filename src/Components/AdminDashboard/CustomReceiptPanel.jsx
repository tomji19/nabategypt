import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { toast } from 'react-toastify';
import BrandLogo from '../BrandLogo/BrandLogo';
import { STORE } from '../../config/store';
import { formatEGP } from '../../utils/money';
import {
  formatSizeLabel,
  getSoleSizeValue,
  normalizeSizeOptions,
  productNeedsSizeChoice,
  productRequiresSize,
} from '../../utils/productSizes';
import { useProducts } from '../ProductsContext/ProductsContext';

function newId() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Unique-looking order code for custom receipts, e.g. NABAT-260806-K3F9 */
function generateOrderCode() {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NABAT-${y}${m}${day}-${rand}`;
}

function blankReceipt() {
  const orderId = newId();
  return {
    eyebrow: 'Confirmed · تم التأكيد',
    greetingPrefix: 'Thank you,',
    customerName: '',
    intro: 'We received your order. You will hear from us soon.',
    fields: [
      { id: orderId, label: 'Order', value: generateOrderCode() },
      { id: newId(), label: 'Date', value: new Date().toLocaleDateString() },
      { id: newId(), label: 'Name', value: '' },
      { id: newId(), label: 'Email', value: '' },
      { id: newId(), label: 'Phone', value: '' },
      { id: newId(), label: 'Payment', value: '' },
      { id: newId(), label: 'Address', value: '' },
    ],
    orderFieldId: orderId,
    showNote: true,
    noteTitle: 'Additional Note:',
    noteBody: '',
    noteFooter: `${STORE.paymentNumber} · Total `,
    items: [],
    colItem: 'Item',
    colPrice: 'Price',
    colQty: 'Qty',
    colTotal: 'Total',
    subtotalLabel: 'Subtotal',
    subtotalValue: '',
    shippingLabel: 'Shipping',
    shippingValue: '',
    totalLabel: 'Total',
    totalValue: '',
    footer: 'Thank you for your order',
  };
}

/** Borderless single-line field */
function RInput({ value, onChange, className = '', placeholder = '…', dir }) {
  return (
    <input
      type="text"
      dir={dir}
      className={`w-full border-0 bg-transparent p-0 outline-none ring-0 placeholder:text-nabat-muted/40 focus:bg-nabat-mist/40 ${className}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** Grows with content — no inner scrollbar */
function AutoTextarea({
  value,
  onChange,
  className = '',
  placeholder = '…',
  dir,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 72)}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={3}
      dir={dir}
      className={`w-full resize-none overflow-hidden border-0 bg-transparent p-0 outline-none ring-0 placeholder:text-nabat-muted/40 focus:bg-nabat-mist/40 ${className}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function parseMoney(raw) {
  const n = Number(String(raw || '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Dashboard — fully editable receipt canvas + PNG download.
 */
export default function CustomReceiptPanel() {
  const { products } = useProducts();
  const receiptRef = useRef(null);
  const [receipt, setReceipt] = useState(blankReceipt);
  const [downloading, setDownloading] = useState(false);
  const [plantQuery, setPlantQuery] = useState('');
  const [sizePicker, setSizePicker] = useState(null); // product needing size choice
  const [shippingDraft, setShippingDraft] = useState('');

  const setField = (key, value) =>
    setReceipt((prev) => ({ ...prev, [key]: value }));

  const applyShippingAmount = (raw) => {
    const trimmed = String(raw ?? '').trim();
    setShippingDraft(trimmed);
    setReceipt((prev) => {
      const shippingValue =
        trimmed === ''
          ? ''
          : Number.isFinite(Number(trimmed))
            ? formatEGP(Number(trimmed))
            : trimmed;
      return {
        ...prev,
        shippingValue,
        ...syncTotalsFromItems(prev.items, shippingValue),
      };
    });
  };
  const updateDetail = (id, patch) => {
    setReceipt((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  };

  const updateItem = (id, patch) => {
    setReceipt((prev) => ({
      ...prev,
      items: prev.items.map((row) =>
        row.id === id ? { ...row, ...patch } : row
      ),
    }));
  };

  const syncTotalsFromItems = (items, shippingRaw) => {
    const subtotal = items.reduce((sum, row) => {
      const line = parseMoney(row.total);
      if (line > 0) return sum + line;
      return sum + parseMoney(row.price) * (Number(row.qty) || 1);
    }, 0);
    const shipping = parseMoney(shippingRaw);
    return {
      subtotalValue: formatEGP(subtotal),
      totalValue: formatEGP(subtotal + shipping),
    };
  };

  const addPlantLine = (product, sizeValue = '') => {
    const options = normalizeSizeOptions(product.sizeOptions, product.price);
    const size = String(sizeValue || getSoleSizeValue(product) || '').trim();
    const opt = size ? options.find((o) => o.value === size) : null;
    const unit = opt ? Number(opt.price) : Number(product.price) || 0;
    const label = size
      ? `${product.name} (${formatSizeLabel(size, product.sizeType)})`
      : product.name;

    setReceipt((prev) => {
      const withoutEmpty = prev.items.filter(
        (row) => String(row.name || '').trim() || parseMoney(row.price) > 0
      );
      const nextItems = [
        ...withoutEmpty,
        {
          id: newId(),
          name: label,
          price: formatEGP(unit),
          qty: '1',
          total: formatEGP(unit),
        },
      ];
      return {
        ...prev,
        items: nextItems,
        ...syncTotalsFromItems(nextItems, prev.shippingValue),
      };
    });
    setSizePicker(null);
    toast.success(`Added ${label}`);
  };

  const handlePickPlant = (product) => {
    if (productNeedsSizeChoice(product)) {
      setSizePicker(product);
      return;
    }
    addPlantLine(product);
  };

  const filteredPlants = useMemo(() => {
    const q = plantQuery.trim().toLowerCase();
    const list = Array.isArray(products) ? products : [];
    if (!q) return list.slice(0, 40);
    return list
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [products, plantQuery]);

  const applyOrderCode = (code) => {
    setReceipt((prev) => {
      const targetId =
        prev.orderFieldId ||
        prev.fields.find((f) => /order/i.test(f.label))?.id;
      if (!targetId) {
        const id = newId();
        return {
          ...prev,
          orderFieldId: id,
          fields: [{ id, label: 'Order', value: code }, ...prev.fields],
        };
      }
      return {
        ...prev,
        orderFieldId: targetId,
        fields: prev.fields.map((f) =>
          f.id === targetId ? { ...f, value: code } : f
        ),
      };
    });
  };

  const handleGenerateCode = () => {
    const code = generateOrderCode();
    applyOrderCode(code);
    toast.success(`Order code: ${code}`);
  };

  const fileName = useMemo(() => {
    const order =
      receipt.fields.find((f) => /order/i.test(f.label))?.value || 'custom';
    return `nabat-receipt-${String(order).replace(/[^\w.-]+/g, '-') || 'custom'}`;
  }, [receipt.fields]);

  const handleDownload = async () => {
    if (!receiptRef.current || downloading) return;
    setDownloading(true);
    const chrome = receiptRef.current.querySelectorAll('[data-receipt-chrome]');
    chrome.forEach((el) => {
      el.style.visibility = 'hidden';
    });
    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Receipt downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Could not download receipt');
    } finally {
      chrome.forEach((el) => {
        el.style.visibility = '';
      });
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="me-auto">
          <h2 className="font-heading text-xl font-medium text-nabat-text">
            Custom receipt
          </h2>
          <p className="mt-1 font-nav text-sm text-nabat-muted">
            Pick plants below, edit any text on the receipt, then download.
          </p>
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={handleGenerateCode}
        >
          Generate order code
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            if (window.confirm('Clear the receipt and start fresh?')) {
              setReceipt(blankReceipt());
              setSizePicker(null);
              setPlantQuery('');
              setShippingDraft('');
            }
          }}
        >
          Reset
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={downloading}
          onClick={handleDownload}
        >
          {downloading ? 'Preparing…' : 'Download image'}
        </button>
      </div>

      {/* Plant picker — outside the receipt PNG */}
      <div className="mb-6 border border-nabat-border bg-white p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block min-w-[14rem] flex-1 font-nav text-xs text-nabat-muted">
            <span className="mb-1.5 block uppercase tracking-[0.12em]">
              Add plant from catalog
            </span>
            <input
              className="input-box"
              placeholder="Search plants…"
              value={plantQuery}
              onChange={(e) => setPlantQuery(e.target.value)}
            />
          </label>
          <label className="block w-full max-w-[11rem] font-nav text-xs text-nabat-muted">
            <span className="mb-1.5 block uppercase tracking-[0.12em]">
              Shipping (EGP)
            </span>
            <input
              className="input-box"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 50 or Free"
              value={shippingDraft}
              onChange={(e) => applyShippingAmount(e.target.value)}
            />
          </label>
        </div>

        {sizePicker && (
          <div className="mt-3 border border-nabat-border bg-nabat-mist p-3">
            <p className="font-nav text-sm text-nabat-text">
              Choose size for{' '}
              <span className="font-medium">{sizePicker.name}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {normalizeSizeOptions(
                sizePicker.sizeOptions,
                sizePicker.price
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="border border-nabat-border bg-white px-3 py-2 font-nav text-sm hover:border-nabat-primary"
                  onClick={() => addPlantLine(sizePicker, opt.value)}
                >
                  {formatSizeLabel(opt.value, sizePicker.sizeType)}
                  <span className="ms-2 text-nabat-muted">
                    {formatEGP(opt.price)}
                  </span>
                </button>
              ))}
              <button
                type="button"
                className="font-nav text-xs text-nabat-muted hover:underline"
                onClick={() => setSizePicker(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlants.length === 0 ? (
            <p className="font-nav text-sm text-nabat-muted">No plants found.</p>
          ) : (
            filteredPlants.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePickPlant(p)}
                className="flex items-center gap-3 border border-nabat-border bg-white p-2 text-left hover:border-nabat-primary"
              >
                {p.image ? (
                  <img
                    src={p.image}
                    alt=""
                    className="h-12 w-12 shrink-0 object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-nabat-mist font-nav text-[10px] text-nabat-muted">
                    —
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate font-nav text-sm text-nabat-text">
                    {p.name}
                  </span>
                  <span className="block font-nav text-[10px] uppercase tracking-wider text-nabat-muted">
                    {p.category}
                    {productRequiresSize(p)
                      ? productNeedsSizeChoice(p)
                        ? ' · pick size'
                        : ` · ${formatSizeLabel(getSoleSizeValue(p), p.sizeType)}`
                      : ''}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <div
          ref={receiptRef}
          className="border border-nabat-border bg-white p-8 md:p-12"
        >
          <RInput
            className="section-label !w-auto"
            value={receipt.eyebrow}
            onChange={(v) => setField('eyebrow', v)}
            placeholder="Eyebrow"
          />

          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 font-heading text-3xl font-medium tracking-tight text-nabat-text md:text-4xl">
            <RInput
              className="!w-auto min-w-[8rem] font-heading text-3xl font-medium md:text-4xl"
              value={receipt.greetingPrefix}
              onChange={(v) => setField('greetingPrefix', v)}
              placeholder="Thank you,"
            />
            <RInput
              className="!w-auto min-w-[10rem] font-heading text-3xl font-medium text-nabat-accent md:text-4xl"
              value={receipt.customerName}
              onChange={(v) => setField('customerName', v)}
              placeholder="Customer name"
            />
          </div>

          <RInput
            className="mt-3 font-nav text-sm text-nabat-muted"
            value={receipt.intro}
            onChange={(v) => setField('intro', v)}
            placeholder="Intro line"
          />

          <div className="mt-8 space-y-1.5">
            {receipt.fields.map((field) => {
              const isOrderField =
                field.id === receipt.orderFieldId ||
                /order/i.test(field.label);
              return (
                <div
                  key={field.id}
                  className="group flex items-start gap-2 font-nav text-sm"
                >
                  <RInput
                    className="!w-[6.5rem] shrink-0 text-nabat-muted"
                    value={field.label}
                    onChange={(v) => updateDetail(field.id, { label: v })}
                    placeholder="Label"
                  />
                  <span className="pt-0.5 text-nabat-muted">:</span>
                  <RInput
                    className="text-nabat-text"
                    value={field.value}
                    onChange={(v) => updateDetail(field.id, { value: v })}
                    placeholder="Value"
                  />
                  {isOrderField && (
                    <button
                      type="button"
                      data-receipt-chrome
                      className="shrink-0 font-nav text-[10px] uppercase tracking-wider text-nabat-accent hover:underline"
                      onClick={handleGenerateCode}
                      title="Generate a new order code"
                    >
                      New code
                    </button>
                  )}
                  <button
                    type="button"
                    data-receipt-chrome
                    className="ms-auto shrink-0 font-nav text-[10px] uppercase tracking-wider text-red-600 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() =>
                      setReceipt((prev) => ({
                        ...prev,
                        fields: prev.fields.filter((f) => f.id !== field.id),
                      }))
                    }
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              data-receipt-chrome
              className="mt-2 font-nav text-xs text-nabat-accent hover:underline"
              onClick={() =>
                setReceipt((prev) => ({
                  ...prev,
                  fields: [
                    ...prev.fields,
                    { id: newId(), label: '', value: '' },
                  ],
                }))
              }
            >
              + Add detail line
            </button>
          </div>

          {receipt.showNote ? (
            <div className="relative mt-6 border border-nabat-border bg-nabat-mist p-4 font-nav text-sm">
              <button
                type="button"
                data-receipt-chrome
                className="absolute right-2 top-2 font-nav text-[10px] uppercase text-red-600"
                onClick={() => setField('showNote', false)}
              >
                Remove
              </button>
              <RInput
                className="pe-16 font-medium text-nabat-primary"
                value={receipt.noteTitle}
                onChange={(v) => setField('noteTitle', v)}
                placeholder="Additional Note:"
              />
              <AutoTextarea
                className="mt-2 min-h-[4.5rem] text-nabat-muted"
                value={receipt.noteBody}
                onChange={(v) => setField('noteBody', v)}
                placeholder="Write the note here…"
                dir="auto"
              />
              <RInput
                className="mt-2 font-medium"
                value={receipt.noteFooter}
                onChange={(v) => setField('noteFooter', v)}
                placeholder="Note footer"
              />
            </div>
          ) : (
            <button
              type="button"
              data-receipt-chrome
              className="mt-6 font-nav text-xs text-nabat-accent hover:underline"
              onClick={() => setField('showNote', true)}
            >
              + Add note box
            </button>
          )}

          <div className="mt-10 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-nabat-border text-left font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted">
                  <th className="py-3 font-medium">
                    <RInput
                      className="uppercase tracking-[0.14em]"
                      value={receipt.colItem}
                      onChange={(v) => setField('colItem', v)}
                    />
                  </th>
                  <th className="py-3 text-right font-medium">
                    <RInput
                      className="text-right uppercase tracking-[0.14em]"
                      value={receipt.colPrice}
                      onChange={(v) => setField('colPrice', v)}
                    />
                  </th>
                  <th className="py-3 text-center font-medium">
                    <RInput
                      className="text-center uppercase tracking-[0.14em]"
                      value={receipt.colQty}
                      onChange={(v) => setField('colQty', v)}
                    />
                  </th>
                  <th className="py-3 text-right font-medium">
                    <RInput
                      className="text-right uppercase tracking-[0.14em]"
                      value={receipt.colTotal}
                      onChange={(v) => setField('colTotal', v)}
                    />
                  </th>
                  <th className="w-8" data-receipt-chrome />
                </tr>
              </thead>
              <tbody>
                {receipt.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 font-nav text-sm text-nabat-muted"
                      data-receipt-chrome
                    >
                      No items yet — pick plants above or add a blank row.
                    </td>
                  </tr>
                ) : (
                  receipt.items.map((item) => (
                    <tr key={item.id} className="border-b border-nabat-border">
                      <td className="py-3 font-nav text-sm">
                        <RInput
                          value={item.name}
                          onChange={(v) => updateItem(item.id, { name: v })}
                          placeholder="Plant / item"
                        />
                      </td>
                      <td className="py-3 text-right font-nav text-sm">
                        <RInput
                          className="text-right"
                          value={item.price}
                          onChange={(v) => updateItem(item.id, { price: v })}
                          placeholder="0 EGP"
                        />
                      </td>
                      <td className="py-3 text-center font-nav text-sm">
                        <RInput
                          className="text-center"
                          value={item.qty}
                          onChange={(v) => updateItem(item.id, { qty: v })}
                          placeholder="1"
                        />
                      </td>
                      <td className="py-3 text-right font-nav text-sm">
                        <RInput
                          className="text-right"
                          value={item.total}
                          onChange={(v) => updateItem(item.id, { total: v })}
                          placeholder="0 EGP"
                        />
                      </td>
                      <td className="py-3 text-right" data-receipt-chrome>
                        <button
                          type="button"
                          className="font-nav text-[10px] text-red-600"
                          onClick={() =>
                            setReceipt((prev) => {
                              const nextItems = prev.items.filter(
                                (r) => r.id !== item.id
                              );
                              return {
                                ...prev,
                                items: nextItems,
                                ...syncTotalsFromItems(
                                  nextItems,
                                  prev.shippingValue
                                ),
                              };
                            })
                          }
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <button
              type="button"
              data-receipt-chrome
              className="mt-3 font-nav text-xs text-nabat-accent hover:underline"
              onClick={() =>
                setReceipt((prev) => ({
                  ...prev,
                  items: [
                    ...prev.items,
                    { id: newId(), name: '', price: '', qty: '1', total: '' },
                  ],
                }))
              }
            >
              + Add blank item
            </button>
          </div>

          <div className="mt-8 space-y-2 font-nav text-sm">
            <div className="flex justify-between gap-4 text-nabat-muted">
              <RInput
                className="!w-auto min-w-[6rem]"
                value={receipt.subtotalLabel}
                onChange={(v) => setField('subtotalLabel', v)}
              />
              <RInput
                className="!w-auto min-w-[5rem] text-right text-nabat-text"
                value={receipt.subtotalValue}
                onChange={(v) => setField('subtotalValue', v)}
                placeholder="0 EGP"
              />
            </div>
            <div className="flex justify-between gap-4 text-nabat-muted">
              <RInput
                className="!w-auto min-w-[8rem]"
                value={receipt.shippingLabel}
                onChange={(v) => setField('shippingLabel', v)}
              />
              <RInput
                className="!w-auto min-w-[5rem] text-right text-nabat-text"
                value={receipt.shippingValue}
                onChange={(v) => {
                  setShippingDraft(String(v).replace(/[^\d.]/g, '') || v);
                  setReceipt((prev) => ({
                    ...prev,
                    shippingValue: v,
                    ...syncTotalsFromItems(prev.items, v),
                  }));
                }}
                placeholder="Custom / Free / 50 EGP"
              />
            </div>
            <div className="flex justify-between gap-4 border-t border-nabat-border pt-3 font-heading text-xl font-medium text-nabat-primary">
              <RInput
                className="!w-auto min-w-[5rem] font-heading text-xl font-medium text-nabat-primary"
                value={receipt.totalLabel}
                onChange={(v) => setField('totalLabel', v)}
              />
              <RInput
                className="!w-auto min-w-[6rem] text-right font-heading text-xl font-medium text-nabat-primary"
                value={receipt.totalValue}
                onChange={(v) => setField('totalValue', v)}
                placeholder="0 EGP"
              />
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center text-center">
            <RInput
              className="text-center font-nav text-xs uppercase tracking-[0.2em] text-nabat-muted"
              value={receipt.footer}
              onChange={(v) => setField('footer', v)}
              placeholder="Footer"
            />
            <BrandLogo
              variant="seal"
              className="mt-4"
              imgClassName="h-14 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
