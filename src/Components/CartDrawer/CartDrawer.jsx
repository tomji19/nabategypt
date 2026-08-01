import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext/CartContext';
import { useAuth } from '../AuthContext/AuthContext';
import { loginPathWithRedirect } from '../../utils/authRedirect';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = (e) => {
    e.preventDefault();
    closeCart();
    if (!userLoggedIn) {
      navigate(loginPathWithRedirect('/checkout'));
      return;
    }
    navigate('/checkout');
  };

  return (
    <>
      <div
        className={`${styles.backdrop} ${isCartOpen ? styles.backdropOpen : ''}`}
        onClick={closeCart}
        aria-hidden={!isCartOpen}
      />

      <aside
        className={`${styles.drawer} ${isCartOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!isCartOpen}
        aria-label="Shopping bag"
      >
        <header className={styles.header}>
          <div>
            <p className={styles.label}>Your bag</p>
            <h2 className={styles.title}>
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </h2>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={closeCart}
            aria-label="Close bag"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </header>

        <div className={styles.body}>
          {cartItems.length === 0 ? (
            <div className={styles.empty}>
              <p>Your bag is empty.</p>
              <button type="button" className={styles.continue} onClick={closeCart}>
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className={styles.list}>
              {cartItems.map((item) => (
                <li key={item.id} className={styles.item}>
                  <img src={item.image} alt="" className={styles.thumb} />
                  <div className={styles.details}>
                    <p className={styles.itemCat}>{item.category}</p>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemPrice}>{item.price} EGP</p>

                    <div className={styles.itemActions}>
                      <div className={styles.stepper}>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, (item.quantity || 1) - 1)
                          }
                          aria-label={`Remove one ${item.name}`}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, (item.quantity || 0) + 1)
                          }
                          aria-label={`Add one ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className={styles.remove}
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <footer className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <strong>{cartTotal} EGP</strong>
            </div>
            <button
              type="button"
              className={styles.checkout}
              onClick={handleCheckout}
            >
              {userLoggedIn ? 'Checkout' : 'Sign in to checkout'}
            </button>
            <Link to="/cart" className={styles.viewCart} onClick={closeCart}>
              View full cart
            </Link>
          </footer>
        )}
      </aside>
    </>
  );
}
