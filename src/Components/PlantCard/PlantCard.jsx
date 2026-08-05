import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext/CartContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { formatEGP } from '../../utils/money';
import {
  getCategoryLabel,
  getProductName,
} from '../../utils/productLocale';
import { getDisplayPrice, productRequiresSize } from '../../utils/productSizes';
import styles from './PlantCard.module.css';

export default function PlantCard({ product }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, addToCart } = useCart();
  const { t, isAr } = useLanguage();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return undefined;
    const timer = setTimeout(() => setJustAdded(false), 1400);
    return () => clearTimeout(timer);
  }, [justAdded]);

  if (!product) return null;

  const displayName = getProductName(product, { isAr, t });
  const categoryLabel = getCategoryLabel(product.category, { t });
  const needsSize = productRequiresSize(product);
  const display = getDisplayPrice(product);
  const onSale = Boolean(product.onSale || display.onSale);
  const quantity = needsSize
    ? cartItems
        .filter((item) => (item.productId || item.id) === product.id)
        .reduce((sum, item) => sum + (item.quantity || 0), 0)
    : cartItems.find((item) => item.id === product.id)?.quantity || 0;
  const hoverImage = product.hoverImage || product.secondaryImage || product.images?.[1];
  const hasHoverImage = Boolean(hoverImage);
  const outOfStock = product.stock != null && product.stock <= 0;
  const isSeasonal = Boolean(product.isRecent || product.isSeasonal);
  const isGift = Boolean(product.isGift);

  const openProduct = () =>
    navigate(`/singleproduct/${product.id}`, {
      state: {
        fromShop: `${location.pathname}${location.search}`,
      },
    });

  const handleAdd = (e) => {
    e.stopPropagation();
    if (outOfStock) return;
    if (needsSize) {
      openProduct();
      return;
    }
    addToCart(product);
    setJustAdded(true);
  };

  let statusBadge = null;
  if (outOfStock) {
    statusBadge = { label: t('outOfStock'), className: styles.badgeSold };
  } else if (isGift) {
    statusBadge = { label: t('giftReadyBadge'), className: styles.badgeSeasonal };
  } else if (isSeasonal) {
    statusBadge = { label: t('seasonal'), className: styles.badgeSeasonal };
  } else {
    statusBadge = { label: t('inStock'), className: styles.badgeStock };
  }

  return (
    <article className={styles.card}>
      <div className={styles.frame}>
        <button
          type="button"
          className={`${styles.media} ${hasHoverImage ? styles.mediaSwap : ''}`}
          onClick={openProduct}
          aria-label={`${t('shop')} ${displayName}`}
        >
          <img
            src={product.image}
            alt=""
            className={`${styles.image} ${styles.imagePrimary}`}
          />
          {hasHoverImage && (
            <img
              src={hoverImage}
              alt=""
              className={`${styles.image} ${styles.imageSecondary}`}
            />
          )}
        </button>

        <span className={`${styles.badge} ${statusBadge.className}`}>
          {statusBadge.label}
        </span>

        {onSale && !outOfStock && (
          <span className={`${styles.badge} ${styles.badgeSale}`}>{t('sale')}</span>
        )}

        <button
          type="button"
          className={`${styles.addBtn} ${justAdded ? styles.addBtnDone : ''} ${
            quantity > 0 && !justAdded ? styles.addBtnInCart : ''
          }`}
          onClick={handleAdd}
          disabled={outOfStock}
          aria-label={
            needsSize
              ? t('chooseSize')
              : justAdded
                ? t('addedToBag')
                : quantity > 0
                  ? t('addAnother')
                  : t('addToBag')
          }
          title={
            outOfStock
              ? t('outOfStock')
              : needsSize
                ? t('chooseSize')
                : t('addToBag')
          }
        >
          <i
            className={`fa-solid ${justAdded ? 'fa-check' : 'fa-plus'}`}
            aria-hidden
          />
        </button>
      </div>

      <div className={styles.footer}>
        <p className={styles.category}>{categoryLabel}</p>
        <h2 className={styles.name}>
          <button type="button" onClick={openProduct}>
            {displayName}
          </button>
        </h2>
        <div className={styles.priceRow}>
          <p className={styles.price}>
            {needsSize
              ? `${t('fromPrice')} ${formatEGP(display.price)}`
              : formatEGP(display.price)}
          </p>
          {display.onSale && (
            <p className={styles.compare}>{formatEGP(display.compareAtPrice)}</p>
          )}
        </div>
      </div>
    </article>
  );
}
