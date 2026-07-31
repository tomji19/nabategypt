import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProducts } from '../ProductsContext/ProductsContext';
import { useCart } from '../CartContext/CartContext';
import { useWishlist } from '../WishlistContext/WishlistContext';
import { formatEGP } from '../../utils/money';
import styles from './SingleProduct.module.css';

const REVIEWS = [
  {
    author: 'Mark Emerson',
    rating: 5,
    text: 'Beautiful plant, arrived healthy and exactly as pictured.',
  },
  {
    author: 'Sarah Hunt',
    rating: 4,
    text: 'Lovely addition to my balcony. Packaging was careful.',
  },
  {
    author: 'Ben Baker',
    rating: 5,
    text: 'Fast delivery and excellent quality. Will order again.',
  },
];

const CARE_NOTES = [
  'Water when the top soil feels dry',
  'Bright, indirect light preferred',
  'Keep away from harsh midday sun',
  'Wipe leaves gently to keep them dust-free',
];

export default function SingleProduct() {
  const { id } = useParams();
  const { getProductById, loading } = useProducts();
  const { addToCart, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [openPanel, setOpenPanel] = useState('about');

  useEffect(() => {
    setProduct(getProductById(id));
  }, [id, getProductById]);

  if (loading && !product) {
    return <p className={`section-pad ${styles.missing}`}>Loading…</p>;
  }

  if (!product) {
    return (
      <p className={`section-pad ${styles.missing}`}>Product not found</p>
    );
  }

  const outOfStock = product.stock != null && product.stock <= 0;
  const quantity = cartItems.find((item) => item.id === product.id)?.quantity || 0;
  const wished = isInWishlist(product.id);

  const panels = [
    {
      id: 'about',
      title: 'About',
      body: product.description?.trim()
        ? product.description
        : `${product.name} is a carefully selected plant from our greenhouse, ready to settle into your space.`,
    },
    {
      id: 'care',
      title: 'Care',
      list: CARE_NOTES,
    },
    {
      id: 'reviews',
      title: 'Reviews',
      reviews: REVIEWS,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.heroShot}>
            <img src={product.image} alt={product.name} />
          </div>
          <div className={styles.thumbs}>
            <button type="button" className={`${styles.thumb} ${styles.thumbActive}`}>
              <img src={product.image} alt="" />
            </button>
          </div>
        </div>

        <div className={styles.info}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link to="/shop">Shop</Link>
            <span>/</span>
            <span>{product.category}</span>
          </nav>

          <p className={styles.category}>{product.category}</p>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>{formatEGP(product.price)}</p>
          {outOfStock && (
            <p className="mt-2 font-nav text-sm text-red-600">Out of stock</p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => addToCart(product)}
              disabled={outOfStock}
            >
              {outOfStock
                ? 'Out of stock'
                : quantity > 0
                  ? `Add another · ${quantity} in bag`
                  : 'Add to bag'}
              {!outOfStock && <span>{formatEGP(product.price)}</span>}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => toggleWishlist(product)}
            >
              {wished ? 'Saved ♥' : 'Wishlist'}
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
