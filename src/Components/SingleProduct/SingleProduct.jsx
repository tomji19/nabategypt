import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  CARE_OPTIONS,
  LIGHT_OPTIONS,
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

function labelFor(options, value) {
  if (!value) return '';
  return options.find((o) => o.value === value)?.label || value;
}

export default function SingleProduct() {
  const { id } = useParams();
  const location = useLocation();
  const { getProductById, loading } = useProducts();
  const { addToCart, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t, isAr } = useLanguage();
  const [product, setProduct] = useState(null);
  const [infoTab, setInfoTab] = useState('care');
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const touchStartX = useRef(null);

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
    setLightbox(false);
    setInfoTab('care');
  }, [id, getProductById]);

  const gallery = product ? getProductGalleryImages(product) : [];
  const galleryLen = gallery.length;

  const goImage = useCallback(
    (next) => {
      if (galleryLen < 1) return;
      const i = ((next % galleryLen) + galleryLen) % galleryLen;
      setImageReady(false);
      setActiveImage(i);
    },
    [galleryLen]
  );

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') goImage(activeImage + (isAr ? -1 : 1));
      if (e.key === 'ArrowLeft') goImage(activeImage + (isAr ? 1 : -1));
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox, activeImage, goImage, isAr]);

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
  const activeSrc = gallery[activeImage] || gallery[0] || product.image;
  const cartKey = makeCartKey(product.id, effectiveSize);
  const quantity =
    cartItems.find((item) => item.id === cartKey)?.quantity || 0;
  const wished = isInWishlist(product.id);
  const lightLabel = labelFor(LIGHT_OPTIONS, product.light);
  const careLabel = labelFor(CARE_OPTIONS, product.care);
  const careText =
    (isAr && product.descriptionAr?.trim()) ||
    product.description?.trim() ||
    t('careFallback');

  const reviews = [
    { author: t('review1Author'), text: t('review1Text') },
    { author: t('review2Author'), text: t('review2Text') },
    { author: t('review3Author'), text: t('review3Text') },
  ];

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

  const onTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null || galleryLen < 2) return;
    const dx = (e.changedTouches[0]?.clientX ?? start) - start;
    if (Math.abs(dx) < 48) return;
    const forward = isAr ? dx > 0 : dx < 0;
    goImage(activeImage + (forward ? 1 : -1));
  };

  const priceLine =
    unitPrice == null && shouldShowFromPrice(product)
      ? `${t('fromPrice') || 'From'} ${formatEGP(display.price)}`
      : formatEGP(unitPrice ?? display.price);

  return (
    <div className={styles.page} dir={isAr ? 'rtl' : 'ltr'}>
      <div className={styles.shell}>
        {/* ── Gallery ── */}
        <section className={styles.gallery} aria-label={`${displayName} photos`}>
          {galleryLen > 1 && (
            <div className={styles.thumbRail} role="tablist" aria-label="Gallery">
              {gallery.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  role="tab"
                  className={`${styles.thumb} ${
                    index === activeImage ? styles.thumbActive : ''
                  }`}
                  onClick={() => goImage(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-selected={index === activeImage}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          <div
            className={styles.stage}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className={styles.stageWash} aria-hidden />

            {activeSrc ? (
              <button
                type="button"
                className={styles.stageBtn}
                onClick={() => setLightbox(true)}
                aria-label="Open full-size photo"
              >
                <img
                  key={activeSrc}
                  src={activeSrc}
                  alt={displayName}
                  className={`${styles.stageImg} ${
                    imageReady ? styles.stageImgIn : ''
                  }`}
                  onLoad={() => setImageReady(true)}
                  ref={(el) => {
                    if (el?.complete) setImageReady(true);
                  }}
                />
              </button>
            ) : (
              <div className={styles.stagePlaceholder} aria-hidden />
            )}

            {galleryLen > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.navArrow} ${styles.navPrev}`}
                  onClick={() => goImage(activeImage - 1)}
                  aria-label="Previous photo"
                >
                  <i
                    className={`fa-solid ${isAr ? 'fa-chevron-right' : 'fa-chevron-left'}`}
                    aria-hidden
                  />
                </button>
                <button
                  type="button"
                  className={`${styles.navArrow} ${styles.navNext}`}
                  onClick={() => goImage(activeImage + 1)}
                  aria-label="Next photo"
                >
                  <i
                    className={`fa-solid ${isAr ? 'fa-chevron-left' : 'fa-chevron-right'}`}
                    aria-hidden
                  />
                </button>
              </>
            )}

            <div className={styles.stageMeta}>
              {galleryLen > 0 && (
                <span className={styles.counter}>
                  {activeImage + 1}
                  <span aria-hidden> / </span>
                  {galleryLen}
                </span>
              )}
              {activeSrc && (
                <button
                  type="button"
                  className={styles.expandBtn}
                  onClick={() => setLightbox(true)}
                >
                  <i className="fa-solid fa-expand" aria-hidden />
                  <span>View</span>
                </button>
              )}
            </div>

            {display.onSale && (
              <span className={styles.saleBadge}>{t('sale') || 'Sale'}</span>
            )}
          </div>

          {galleryLen > 1 && (
            <div className={styles.thumbStrip}>
              {gallery.map((src, index) => (
                <button
                  key={`m-${src}-${index}`}
                  type="button"
                  className={`${styles.thumb} ${
                    index === activeImage ? styles.thumbActive : ''
                  }`}
                  onClick={() => goImage(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={index === activeImage}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Buy panel ── */}
        <section className={styles.panel}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link to={shopBackTo}>{t('shop')}</Link>
            <span aria-hidden>/</span>
            <span>{categoryLabel}</span>
          </nav>

          <p className={styles.category}>{categoryLabel}</p>
          <h1 className={styles.name}>{displayName}</h1>

          <div className={styles.priceRow}>
            <p className={styles.price}>{priceLine}</p>
            {display.onSale && (
              <p className={styles.compare}>
                {formatEGP(display.compareAtPrice)}
              </p>
            )}
          </div>

          <ul className={styles.meta}>
            {lightLabel ? <li>{lightLabel}</li> : null}
            {careLabel ? <li>{careLabel}</li> : null}
            {outOfStock ? (
              <li className={styles.metaWarn}>{t('outOfStock')}</li>
            ) : (
              <li>{t('inStock')}</li>
            )}
          </ul>

          {needsSizeChoice && (
            <div className={styles.sizeBlock}>
              <div className={styles.sizeHead}>
                <p className={styles.optionLabel}>{t('selectSize')}</p>
                {selectedSize ? (
                  <p className={styles.sizePicked}>
                    {formatSizeLabel(selectedSize, product.sizeType)}
                  </p>
                ) : null}
              </div>
              <div className={styles.sizes}>
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
                      className={`${styles.sizeBtn} ${
                        active ? styles.sizeBtnActive : ''
                      }`}
                    >
                      <span className={styles.sizeName}>
                        {formatSizeLabel(opt.value, product.sizeType)}
                      </span>
                      <span className={styles.sizePrice}>
                        <span>{formatEGP(opt.price)}</span>
                        {sizeSale && (
                          <span className={styles.sizeWas}>
                            {formatEGP(opt.compareAtPrice)}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              {sizeError && (
                <p className={styles.sizeError}>{t('sizeRequired')}</p>
              )}
            </div>
          )}

          {!needsSizeChoice && hasSizedPricing && soleSize && (
            <p className={styles.soleSize}>
              {t('size')}: {formatSizeLabel(soleSize, product.sizeType)}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.addBtn}
              onClick={handleAdd}
              disabled={outOfStock}
            >
              <span>
                {outOfStock
                  ? t('outOfStock')
                  : quantity > 0
                    ? `${t('addAnother')} · ${quantity}`
                    : t('addToBag')}
              </span>
              {!outOfStock && unitPrice != null && (
                <span className={styles.addPrice}>{formatEGP(unitPrice)}</span>
              )}
            </button>
            <button
              type="button"
              className={`${styles.wishBtn} ${wished ? styles.wishActive : ''}`}
              onClick={() => toggleWishlist(product)}
              aria-pressed={wished}
              aria-label={wished ? t('wishlistSaved') : t('wishlistSave')}
            >
              <i
                className={`fa-${wished ? 'solid' : 'regular'} fa-heart`}
                aria-hidden
              />
            </button>
          </div>

          <div className={styles.tabs}>
            <div className={styles.tabList} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={infoTab === 'care'}
                className={`${styles.tab} ${
                  infoTab === 'care' ? styles.tabActive : ''
                }`}
                onClick={() => setInfoTab('care')}
              >
                {t('careTab')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={infoTab === 'reviews'}
                className={`${styles.tab} ${
                  infoTab === 'reviews' ? styles.tabActive : ''
                }`}
                onClick={() => setInfoTab('reviews')}
              >
                {t('reviews')}
              </button>
            </div>
            <div className={styles.tabPanel} role="tabpanel">
              {infoTab === 'care' ? (
                <p className={styles.careBody}>{careText}</p>
              ) : (
                <ul className={styles.reviews}>
                  {reviews.map((r) => (
                    <li key={r.author} className={styles.review}>
                      <p className={styles.reviewAuthor}>{r.author}</p>
                      <p className={styles.reviewText}>{r.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && activeSrc && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`${displayName} — full photo`}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightbox(false)}
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark" aria-hidden />
          </button>

          {galleryLen > 1 && (
            <button
              type="button"
              className={`${styles.lightboxArrow} ${styles.lightboxPrev}`}
              onClick={(e) => {
                e.stopPropagation();
                goImage(activeImage - 1);
              }}
              aria-label="Previous photo"
            >
              <i
                className={`fa-solid ${isAr ? 'fa-chevron-right' : 'fa-chevron-left'}`}
                aria-hidden
              />
            </button>
          )}

          <img
            src={activeSrc}
            alt={displayName}
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />

          {galleryLen > 1 && (
            <button
              type="button"
              className={`${styles.lightboxArrow} ${styles.lightboxNext}`}
              onClick={(e) => {
                e.stopPropagation();
                goImage(activeImage + 1);
              }}
              aria-label="Next photo"
            >
              <i
                className={`fa-solid ${isAr ? 'fa-chevron-left' : 'fa-chevron-right'}`}
                aria-hidden
              />
            </button>
          )}

          <p className={styles.lightboxCounter}>
            {activeImage + 1} / {galleryLen}
          </p>
        </div>
      )}
    </div>
  );
}
