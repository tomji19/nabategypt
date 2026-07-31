import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext/CartContext';
import styles from './PlantCard.module.css';

export default function PlantCard({ product }) {
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const quantity = cartItems.find((item) => item.id === product.id)?.quantity || 0;
  const hoverImage = product.hoverImage || product.secondaryImage || product.images?.[1];
  const hasHoverImage = Boolean(hoverImage);

  useEffect(() => {
    if (!justAdded) return undefined;
    const t = setTimeout(() => setJustAdded(false), 1600);
    return () => clearTimeout(t);
  }, [justAdded]);

  const openProduct = () => navigate(`/singleproduct/${product.id}`);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
    setJustAdded(true);
  };

  const bagLabel = justAdded
    ? quantity > 1
      ? `Added · ${quantity} in bag`
      : 'Added to bag'
    : quantity > 0
      ? `Add another · ${quantity} in bag`
      : 'Add to bag';

  return (
    <article className={styles.card}>
      <div className={styles.frame}>
        <button
          type="button"
          className={`${styles.media} ${hasHoverImage ? styles.mediaSwap : ''}`}
          onClick={openProduct}
          aria-label={`View ${product.name}`}
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

        {product.onSale && <span className={styles.badge}>Sale</span>}

        <button
          type="button"
          className={`${styles.bagBtn} ${justAdded ? styles.bagBtnAdded : ''} ${
            quantity > 0 && !justAdded ? styles.bagBtnInCart : ''
          }`}
          onClick={handleAdd}
        >
          {justAdded && <i className="fa-solid fa-check" aria-hidden />}
          <span>{bagLabel}</span>
        </button>
      </div>

      <div className={styles.footer}>
        <div>
          <p className={styles.category}>{product.category}</p>
          <h2 className={styles.name}>
            <button type="button" onClick={openProduct}>
              {product.name}
            </button>
          </h2>
        </div>
        <p className={styles.price}>
          <span>{product.price}</span>
          <small>EGP</small>
        </p>
      </div>
    </article>
  );
}
