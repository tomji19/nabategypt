import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProducts } from '../ProductData/ProductData';
import { useCart } from '../CartContext/CartContext';
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
  const { addToCart, cartItems } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [openPanel, setOpenPanel] = useState('about');

  useEffect(() => {
    const { getProductById } = getProducts();
    const productData = getProductById(id);
    setProduct(productData || null);
    if (productData?.colorOptions?.length) {
      setSelectedColor(productData.colorOptions[0]);
    }
    if (productData?.sizeOptions?.length) {
      const mid = productData.sizeOptions.includes('M')
        ? 'M'
        : productData.sizeOptions[0];
      setSelectedSize(mid);
    }
  }, [id]);

  if (!product) {
    return (
      <p className={`section-pad ${styles.missing}`}>Product not found</p>
    );
  }

  const handleAdd = () => {
    addToCart({ ...product, selectedSize, selectedColor });
  };

  const quantity = cartItems.find((item) => item.id === product.id)?.quantity || 0;

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
            <button type="button" className={styles.thumb}>
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
          <p className={styles.price}>{product.price} EGP</p>

          {product.colorOptions?.length > 0 && (
            <div className={styles.optionBlock}>
              <p className={styles.optionLabel}>Pot tone</p>
              <div className={styles.swatches}>
                {product.colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={color}
                    onClick={() => setSelectedColor(color)}
                    className={`${styles.swatch} ${
                      selectedColor === color ? styles.swatchActive : ''
                    }`}
                    style={{
                      backgroundColor: color === 'grey' ? '#888' : color,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizeOptions?.length > 0 && (
            <div className={styles.optionBlock}>
              <p className={styles.optionLabel}>Size</p>
              <div className={styles.sizes}>
                {product.sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`${styles.sizeBtn} ${
                      selectedSize === size ? styles.sizeBtnActive : ''
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="button" className={styles.addBtn} onClick={handleAdd}>
            {quantity > 0 ? `Add another · ${quantity} in bag` : 'Add to bag'}
            <span>{product.price} EGP</span>
          </button>

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
                          {panel.list.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      )}
                      {panel.reviews &&
                        panel.reviews.map((review) => (
                          <div key={review.author} className={styles.review}>
                            <p className={styles.reviewAuthor}>
                              {review.author}
                              <span>{'★'.repeat(review.rating)}</span>
                            </p>
                            <p>{review.text}</p>
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
