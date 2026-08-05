import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useProducts } from '../ProductsContext/ProductsContext';
import { useCart } from '../CartContext/CartContext';
import { useWishlist } from '../WishlistContext/WishlistContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { formatEGP } from '../../utils/money';
import {
  getCategoryLabel,
  getProductName,
} from '../../utils/productLocale';
import {
  formatSizeLabel,
  getDisplayPrice,
  getSoleSizeValue,
  isSalePrice,
  makeCartKey,
  normalizeSizeOptions,
  productNeedsSizeChoice,
  productRequiresSize,
  shouldShowFromPrice,
} from '../../utils/productSizes';
import { getProductGalleryImages } from '../../utils/productGallery';
import styles from './SingleProduct.module.css';

export default function SingleProduct() {
  const { id } = useParams();
  const location = useLocation();
  const { getProductById, loading } = useProducts();
  const { addToCart, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t, isAr } = useLanguage();
  const [product, setProduct] = useState(null);
  const [openPanel, setOpenPanel] = useState('care');
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const shopBackTo =
    typeof location.state?.fromShop === 'string' &&
    location.state.fromShop.startsWith('/shop')
      ? location.state.fromShop
      : product?.category
        ? `/shop?category=${encodeURIComponent(product.category)}`
        : '/shop';

  useEffect(() => {
    const next = getProductById(id);
    setProduct(next);
    const sole = getSoleSizeValue(next);
    setSelectedSize(sole || '');
    setSizeError(false);
    setActiveImage(0);
  }, [id, getProductById]);

  if (loading && !product) {
    return <p className={`section-pad ${styles.missing}`}>{t('loading')}</p>;
  }

  if (!product) {
    return (
      <p className={`section-pad ${styles.missing}`}>{t('productNotFound')}</p>
    );
  }

  const displayName = getProductName(product, { isAr, t });
  const categoryLabel = getCategoryLabel(product.category, { t });
  const outOfStock = product.stock != null && product.stock <= 0;
  const needsSizeChoice = productNeedsSizeChoice(product);
  const hasSizedPricing = productRequiresSize(product);
  const sizeOptions = normalizeSizeOptions(product.sizeOptions, product.price);
  const soleSize = getSoleSizeValue(product);
  const effectiveSize = needsSizeChoice ? selectedSize : soleSize;
  const display = getDisplayPrice(product, effectiveSize);
  const unitPrice =
    needsSizeChoice && !selectedSize ? null : display.price;
  const gallery = getProductGalleryImages(product);
  const activeSrc = gallery[activeImage] || gallery[0] || product.image;
  const cartKey = makeCartKey(product.id, effectiveSize);
  const quantity =
    cartItems.find((item) => item.id === cartKey)?.quantity || 0;
  const wished = isInWishlist(product.id);

  const handleAdd = () => {
    if (outOfStock) return;
    if (needsSizeChoice && !selectedSize) {
      setSizeError(true);
      toast.error(t('sizeRequired'));
      return;
    }
    const ok = addToCart(product, {
      size: needsSizeChoice ? selectedSize : soleSize,
    });
    if (!ok) {
      setSizeError(true);
      toast.error(t('sizeRequired'));
    } else {
      setSizeError(false);
    }
  };

  const careText =
    (isAr && product.descriptionAr?.trim()) ||
    product.description?.trim() ||
    t('careFallback');
  const panels = [
    {
      id: 'care',
      title: t('careTab'),
      body: careText,
    },
    {
      id: 'reviews',
      title: t('reviews'),
      reviews: [
        { author: t('review1Author'), text: t('review1Text') },
        { author: t('review2Author'), text: t('review2Text') },
        { author: t('review3Author'), text: t('review3Text') },
      ],
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.heroShot}>
            {activeSrc ? (
              <img src={activeSrc} alt={displayName} />
            ) : (
              <div className={styles.heroPlaceholder} aria-hidden />
            )}
          </div>
          {gallery.length > 1 && (
            <div
              className={styles.thumbs}
              style={{
                gridTemplateColumns: `repeat(${Math.min(gallery.length, 4)}, 1fr)`,
              }}
            >
              {gallery.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  className={`${styles.thumb} ${
                    index === activeImage ? styles.thumbActive : ''
                  }`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={index === activeImage}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link to={shopBackTo}>{t('shop')}</Link>
            <span>/</span>
            <span>{categoryLabel}</span>
          </nav>

          <p className={styles.category}>{categoryLabel}</p>
          <h1 className={styles.name}>{displayName}</h1>
          <div className={styles.priceRow}>
            <p className={styles.price}>
              {unitPrice == null && shouldShowFromPrice(product)
                ? `${t('fromPrice') || 'From'} ${formatEGP(display.price)}`
                : formatEGP(unitPrice ?? display.price)}
            </p>
            {display.onSale && (
              <p className={styles.compare}>
                {formatEGP(display.compareAtPrice)}
              </p>
            )}
          </div>
          {outOfStock && (
            <p className="mt-2 font-nav text-sm text-red-600">{t('outOfStock')}</p>
          )}

          {needsSizeChoice && (
            <div className="mt-5">
              <p className="font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted">
                {t('selectSize')}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sizeOptions.map((opt) => {
                  const active = selectedSize === opt.value;
                  const sizeSale = isSalePrice(opt.price, opt.compareAtPrice);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedSize(opt.value);
                        setSizeError(false);
                      }}
                      className={`min-w-[4.5rem] border px-3 py-2 text-left font-nav text-sm transition-colors ${
                        active
                          ? 'border-nabat-primary bg-nabat-primary text-white'
                          : 'border-nabat-border bg-white text-nabat-text hover:border-nabat-primary'
                      }`}
                    >
                      <span className="block">
                        {formatSizeLabel(opt.value, product.sizeType)}
                      </span>
                      <span
                        className={`mt-0.5 flex flex-wrap items-baseline gap-1.5 text-xs ${
                          active ? 'text-white/85' : 'text-nabat-muted'
                        }`}
                      >
                        <span>{formatEGP(opt.price)}</span>
                        {sizeSale && (
                          <span
                            className={`line-through ${
                              active ? 'text-white/55' : 'text-nabat-muted/80'
                            }`}
                          >
                            {formatEGP(opt.compareAtPrice)}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              {sizeError && (
                <p className="mt-2 font-nav text-sm text-red-600">
                  {t('sizeRequired')}
                </p>
              )}
            </div>
          )}

          {!needsSizeChoice && hasSizedPricing && soleSize && (
            <p className="mt-4 font-nav text-sm text-nabat-muted">
              {t('size')}: {formatSizeLabel(soleSize, product.sizeType)}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className={styles.addBtn}
              onClick={handleAdd}
              disabled={outOfStock}
            >
              {outOfStock
                ? t('outOfStock')
                : quantity > 0
                  ? `${t('addAnother')} · ${quantity} ${t('inBag')}`
                  : t('addToBag')}
              {!outOfStock && unitPrice != null && (
                <span>{formatEGP(unitPrice)}</span>
              )}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => toggleWishlist(product)}
            >
              {wished ? `${t('wishlistSaved')} ♥` : t('wishlistSave')}
            </button>
          </div>

          <div className={styles.accordions}>
            {panels.map((panel) => {
              const open = openPanel === panel.id;
              return (
                <div key={panel.id} className={styles.accordion}>
                  <button
                    type="button"
                    className={styles.accordionBtn}
                    onClick={() => setOpenPanel(open ? '' : panel.id)}
                    aria-expanded={open}
                  >
                    {panel.title}
                    <i
                      className={`fa-solid ${open ? 'fa-minus' : 'fa-plus'}`}
                      aria-hidden
                    />
                  </button>
                  {open && (
                    <div className={styles.accordionBody}>
                      {panel.body && <p>{panel.body}</p>}
                      {panel.list && (
                        <ul>
                          {panel.list.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      )}
                      {panel.reviews &&
                        panel.reviews.map((r) => (
                          <div key={r.author} className="mb-3">
                            <p className="font-medium">{r.author}</p>
                            <p className="text-nabat-muted">{r.text}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
