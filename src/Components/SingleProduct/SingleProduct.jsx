import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProducts } from '../ProductsContext/ProductsContext';
import { useCart } from '../CartContext/CartContext';
import { useWishlist } from '../WishlistContext/WishlistContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { formatEGP } from '../../utils/money';
import {
  getCategoryLabel,
  getProductDescription,
  getProductName,
} from '../../utils/productLocale';
import styles from './SingleProduct.module.css';

export default function SingleProduct() {
  const { id } = useParams();
  const { getProductById, loading } = useProducts();
  const { addToCart, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t, isAr } = useLanguage();
  const [product, setProduct] = useState(null);
  const [openPanel, setOpenPanel] = useState('about');

  useEffect(() => {
    setProduct(getProductById(id));
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
  const quantity = cartItems.find((item) => item.id === product.id)?.quantity || 0;
  const wished = isInWishlist(product.id);

  const panels = [
    {
      id: 'about',
      title: t('aboutProduct'),
      body: getProductDescription(product, { isAr, t }),
    },
    {
      id: 'care',
      title: t('careTab'),
      list: [t('care1'), t('care2'), t('care3'), t('care4')],
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
            <img src={product.image} alt={displayName} />
          </div>
          <div className={styles.thumbs}>
            <button type="button" className={`${styles.thumb} ${styles.thumbActive}`}>
              <img src={product.image} alt="" />
            </button>
          </div>
        </div>

        <div className={styles.info}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link to="/shop">{t('shop')}</Link>
            <span>/</span>
            <span>{categoryLabel}</span>
          </nav>

          <p className={styles.category}>{categoryLabel}</p>
          <h1 className={styles.name}>{displayName}</h1>
          <p className={styles.price}>{formatEGP(product.price)}</p>
          {outOfStock && (
            <p className="mt-2 font-nav text-sm text-red-600">{t('outOfStock')}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => addToCart(product)}
              disabled={outOfStock}
            >
              {outOfStock
                ? t('outOfStock')
                : quantity > 0
                  ? `${t('addAnother')} · ${quantity} ${t('inBag')}`
                  : t('addToBag')}
              {!outOfStock && <span>{formatEGP(product.price)}</span>}
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
